import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.QA_BASE_URL || "http://localhost:3212";
const OUT = process.env.QA_OUT || "C:/Users/hp/AppData/Local/Temp/opencode/qa";
mkdirSync(OUT, { recursive: true });

const SESSION = {
  uid: "demo-navigator",
  name: "Siswa Navigator",
  email: "navigator@example.com",
  kelas: "XI",
  photoURL: null,
  provider: "demo",
};

const PAGES = [
  ["cover", "/"],
  ["beranda", "/beranda"],
  ["login", "/auth/login"],
  ["signup", "/auth/signup"],
  ["lupa", "/auth/lupa"],
  ["privasi", "/privasi"],
  ["ketentuan", "/ketentuan"],
  ["misi", "/misi"],
  ["materi-bus", "/materi/bus"],
  ["materi-ring", "/materi/ring"],
  ["praktik-bus", "/praktik/bus"],
  ["praktik-ring", "/praktik/ring"],
  ["praktik-star", "/praktik/star"],
  ["sandbox-ring", "/sandbox/ring"],
  ["kuis", "/kuis"],
  ["hasil", "/kuis/hasil?score=8&total=10"],
  ["perbandingan", "/perbandingan"],
  ["glosarium", "/glosarium"],
  ["panduan", "/panduan"],
  ["progres", "/progres"],
  ["profil", "/profil"],
  ["pengaturan", "/pengaturan"],
  ["cetak", "/cetak"],
];

const browser = await chromium.launch();
const errors = [];

for (const [w, h, tag] of [
  [1440, 960, "desktop"],
  [390, 844, "mobile"],
]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(
    `window.localStorage.setItem('misi-session', ${JSON.stringify(JSON.stringify(SESSION))});`,
  );
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`[${tag}] pageerror: ${e.message}`));
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`[${tag}] HTTP ${r.status()}: ${r.url()}`);
  });
  page.on("console", (m) => {
    if (m.type() === "error" && !m.text().includes("favicon")) {
      errors.push(`[${tag}] console: ${m.text().slice(0, 200)}`);
    }
  });

  for (const [name, route] of PAGES) {
    await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/${tag}-${name}.png`, fullPage: true });

    // deteksi luapan horizontal
    const overflow = await page.evaluate(() => {
      const d = document.documentElement;
      return d.scrollWidth - d.clientWidth;
    });
    if (overflow > 2) {
      const culprits = await page.evaluate((vw) => {
        const out = [];
        document.querySelectorAll("*").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.right > vw + 2 && r.width > 40) {
            const cls = (el.className || "").toString().slice(0, 70);
            out.push(`${el.tagName.toLowerCase()}.${cls} right=${Math.round(r.right)} w=${Math.round(r.width)}`);
          }
        });
        return out.slice(0, 6);
      }, w);
      errors.push(
        `[${tag}] ${name}: luapan horizontal ${overflow}px → ${culprits.join(" | ")}`,
      );
    }
  }
  await ctx.close();
}

await browser.close();

if (errors.length) {
  console.log("MASALAH DITEMUKAN:");
  errors.forEach((e) => console.log(" -", e));
  process.exitCode = 1;
} else {
  console.log("QA bersih: tanpa galat JS dan tanpa luapan horizontal.");
}
console.log("screenshot ->", OUT);
