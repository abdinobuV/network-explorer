/**
 * Prasyarat deploy — memeriksa apa saja yang sudah siap sebelum deploy.
 *
 * Dipakai oleh `npm run deploy:check`. Tidak mengubah apa pun;
 * hanya melaporkan kondisi.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const REQUIRED_ENV = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

const problems = [];
const ok = [];

/* ---------------------------------------------------------------- .env.local */

function readEnvFile() {
  const path = ".env.local";
  if (!existsSync(path)) return null;
  const out = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

const envFile = readEnvFile();
if (!envFile) {
  problems.push(".env.local belum ada — buat dari .env.example lalu isi nilainya");
} else {
  const kurang = REQUIRED_ENV.filter((k) => !envFile[k]);
  if (kurang.length) {
    problems.push(`.env.local belum memuat: ${kurang.join(", ")}`);
  } else {
    ok.push(`.env.local lengkap (${REQUIRED_ENV.length} variabel)`);
  }
  if (envFile.NEXT_PUBLIC_DEMO_MODE === "1") {
    problems.push(
      "NEXT_PUBLIC_DEMO_MODE=1 di .env.local — mode demo akan ikut ter-deploy. Kosongkan untuk produksi.",
    );
  }
}

/* ---------------------------------------------------------------- .firebaserc */

if (!existsSync(".firebaserc")) {
  problems.push(".firebaserc belum ada — deploy:rules tidak tahu proyek mana");
} else {
  const fr = JSON.parse(readFileSync(".firebaserc", "utf8"));
  const def = fr.projects?.default;
  const envProject = envFile?.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!def) problems.push(".firebaserc tidak punya projects.default");
  else if (envProject && def !== envProject) {
    problems.push(
      `.firebaserc (${def}) berbeda dengan project id di .env.local (${envProject}) — rules akan ter-deploy ke proyek yang salah`,
    );
  } else {
    ok.push(`.firebaserc → proyek "${def}"`);
  }
}

/* ---------------------------------------------------------------- CLI & login */

function hasCommand(cmd) {
  try {
    execFileSync(process.platform === "win32" ? "where" : "which", [cmd], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

if (hasCommand("vercel")) ok.push("vercel CLI tersedia");
else problems.push("vercel CLI belum ada — jalankan: npm install -D vercel");

/* Vercel CLI 65 menyimpan kredensial di <APPDATA>\com.vercel.cli\Data\auth.json
   (versi lama memakai com.vercel.cli\auth.json). Cek keduanya. */
const vercelAuthPaths =
  process.platform === "win32"
    ? [
        `${process.env.APPDATA}\\com.vercel.cli\\Data\\auth.json`,
        `${process.env.APPDATA}\\com.vercel.cli\\auth.json`,
      ]
    : [
        `${process.env.HOME}/.local/share/com.vercel.cli/auth.json`,
        `${process.env.HOME}/.local/share/com.vercel.cli/Data/auth.json`,
      ];

if (process.env.VERCEL_TOKEN) {
  ok.push("VERCEL_TOKEN diset — deploy Vercel berjalan non-interaktif");
} else if (vercelAuthPaths.some((p) => existsSync(p))) {
  ok.push("sesi Vercel tersimpan (login sudah pernah dilakukan)");
} else {
  problems.push(
    "belum login ke Vercel — jalankan: npx vercel login   (atau set VERCEL_TOKEN)",
  );
}

const firebaseAuthPaths =
  process.platform === "win32"
    [
      `${process.env.APPDATA}\\firebase\\login.json`,
      `${process.env.APPDATA}\\configstore\\firebase-tools.json`,
    ]
    : [`${process.env.HOME}/.config/configstore/firebase-tools.json`];

if (process.env.FIREBASE_TOKEN) {
  ok.push("FIREBASE_TOKEN diset — deploy rules berjalan non-interaktif");
} else if (firebaseAuthPaths.some((p) => existsSync(p))) {
  ok.push("sesi Firebase CLI tersimpan");
} else {
  problems.push(
    "belum login ke Firebase — jalankan: npx firebase-tools login   (atau set FIREBASE_TOKEN)",
  );
}

if (process.env.VERCEL_TOKEN || process.env.FIREBASE_TOKEN) {
  ok.push("mode token aktif — seluruh langkah berjalan tanpa interaksi");
}

/* ---------------------------------------------------------------- Link project */

if (existsSync(".vercel/project.json")) {
  ok.push("project Vercel sudah di-link (.vercel/project.json)");
} else {
  problems.push(
    "project Vercel belum di-link — jalankan: npx vercel link --yes --project <nama-project>",
  );
}

/* ---------------------------------------------------------------- Laporan */

console.log("\nSiap deploy:\n");
ok.forEach((o) => console.log("  [+] " + o));
if (problems.length) {
  console.log("\nYang belum siap:\n");
  problems.forEach((p) => console.log("  [!] " + p));
  console.log("");
  process.exitCode = 1;
} else {
  console.log("\n  Semua prasyarat terpenuhi. Jalankan: npm run deploy\n");
}
