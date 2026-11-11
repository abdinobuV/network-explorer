import { chromium } from "@playwright/test";

/**
 * Uji langsung terhadap deployment produksi (bukan server lokal).
 * Menjalankan alur utama: login → misi → praktik → pasang kabel → progres.
 */

const BASE = process.env.LIVE_URL || "https://network-explorer-xi.vercel.app";

/* Mode "--buat-akun-demo": membuat akun demo di Firebase bila belum ada. */
if (process.argv.includes("--buat-akun-demo")) {
  const { readFileSync } = await import("node:fs");
  const env = {};
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  const key = env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const body = JSON.stringify({
    email: "navigator@example.com",
    password: "password123",
    returnSecureToken: true,
  });
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  const data = await res.json();
  if (res.ok) {
    console.log(`Akun demo dibuat: navigator@example.com (uid ${data.localId})`);
  } else if (JSON.stringify(data).includes("EMAIL_EXISTS")) {
    console.log("Akun demo sudah ada — tidak perlu dibuat ulang.");
  } else {
    console.error("Gagal:", JSON.stringify(data).slice(0, 300));
    process.exit(1);
  }
  process.exit(0);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
const page = await ctx.newPage();

const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("response", (r) => {
  if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`);
});

const langkah = [];

async function cek(nama, fn) {
  try {
    await fn();
    langkah.push(`[OK]   ${nama}`);
  } catch (e) {
    langkah.push(`[GAGAL] ${nama} — ${e.message.split("\n")[0]}`);
  }
}

await cek("situs dapat diakses", async () => {
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.getByRole("heading", { level: 1 }).waitFor({ timeout: 20000 });
});

await cek("halaman login tampil", async () => {
  await page.goto(`${BASE}/auth/login`, { waitUntil: "networkidle" });
  await page.locator("#email").waitFor({ timeout: 20000 });
});

await cek("masuk dengan akun demo", async () => {
  await page.locator("#email").fill("navigator@example.com");
  await page.locator("#password").fill("password123");
  // Tunggu React selesai hydrate agar penangan submit terpasang.
  await page.waitForFunction(() => {
    const b = [...document.querySelectorAll("button")].find((x) =>
      x.textContent?.trim() === "Masuk",
    );
    return b && !b.hasAttribute("disabled");
  });
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await page.waitForURL("**/misi", { timeout: 30000 });
});

await cek("peta misi termuat", async () => {
  await page.getByRole("heading", { name: "Peta misi belajar" }).waitFor({ timeout: 20000 });
});

await cek("lembar praktik dapat dibuka", async () => {
  await page.goto(`${BASE}/praktik/star`, { waitUntil: "domcontentloaded" });
  await page.getByText("Palet kabel").waitFor({ timeout: 20000 });
});
await cek("seluruh kabel dapat dipasang (Star = 5 kabel)", async () => {
  for (const [kabel, sasaran] of [
    ["Kabel PC-01", "SWITCH"],
    ["Kabel PC-02", "SWITCH"],
    ["Kabel PC-03", "SWITCH"],
    ["Kabel PC-04", "SWITCH"],
    ["Kabel PC-05", "SWITCH"],
  ]) {
    await page.getByRole("button", { name: kabel, exact: true }).click();
    await page.getByRole("button", { name: sasaran, exact: true }).click();
    await page.getByText(new RegExp(`${kabel.replace("Kabel ", "")} → SWITCH — tersambung`))
      .last()
      .waitFor({ timeout: 15000 });
  }
  await page.getByText("Sertifikat pemasangan").first().waitFor({ timeout: 15000 });
});

await cek("progres mencatat XP di cloud", async () => {
  // Catatan: jangan pakai waitUntil "networkidle" di halaman yang sudah login —
  // Firestore memakai koneksi streaming sehingga jaringan tidak pernah idle.
  await page.goto(`${BASE}/progres`, { waitUntil: "domcontentloaded" });
  await page.getByText("Aktivitas terbaru").waitFor({ timeout: 20000 });
  const xp = await page.locator("header").nth(1).innerText();
  if (!/\d+\s*XP/.test(xp)) throw new Error(`XP tidak ditemukan di header: ${xp.slice(0, 120)}`);
  if (/^\s*0\s*XP/.test(xp)) throw new Error("XP masih 0 — XP tidak bertambah");
});

await cek("progres tersimpan di Firestore", async () => {
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByText("Aktivitas terbaru").waitFor({ timeout: 20000 });
  const isi = await page.locator("section").last().innerText();
  if (!/Praktik/.test(isi))
    throw new Error("Riwayat aktivitas tidak memuat 'Praktik' — data tidak terbaca dari cloud");
});

await cek("indikator sinkronisasi cloud tampil", async () => {
  const status = await page
    .locator('header span[title*="cloud"], header span[title*="Progres tersimpan"]')
    .first()
    .innerText();
  if (!/tersimpan|menyimpan|menyinkron/i.test(status))
    throw new Error(`indikator tidak ditemukan: ${status.slice(0, 120)}`);
});

await cek("halaman kuis terbuka", async () => {
  await page.goto(`${BASE}/kuis`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "Kuis akhir" }).waitFor({ timeout: 20000 });
});
await cek("service worker terdaftar (PWA)", async () => {
  const ok = await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) return false;
    const regs = await navigator.serviceWorker.getRegistrations();
    return regs.length > 0;
  });
  if (!ok) throw new Error("service worker belum terdaftar");
});

/* Bersihkan progres akun demo agar presentasi selalu mulai dari nol. */
await cek("progres demo dibersihkan kembali", async () => {
  await page.goto(`${BASE}/pengaturan`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Hapus seluruh progres" }).click();
  await page.waitForTimeout(2500);
  await page.goto(`${BASE}/progres`, { waitUntil: "domcontentloaded" });
  await page.getByText("Aktivitas terbaru").waitFor({ timeout: 20000 });
  const isi = await page.locator("section").last().innerText();
  if (/Praktik/.test(isi)) throw new Error("progres demo belum bersih");
});

await browser.close();

console.log("\nHasil uji produksi — " + BASE + "\n");
langkah.forEach((l) => console.log("  " + l));
if (errors.length) {
  console.log("\nGalat jaringan/JS:\n");
  [...new Set(errors)].forEach((e) => console.log("  - " + e));
}
const gagal = langkah.filter((l) => l.startsWith("[GAGAL]"));
console.log(
  "\n" + (gagal.length ? `${gagal.length} langkah gagal` : "Semua langkah lolos") + "\n",
);
if (gagal.length) process.exitCode = 1;
