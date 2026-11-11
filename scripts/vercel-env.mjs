/**
 * Menyalin variabel NEXT_PUBLIC_FIREBASE_* dari .env.local ke project Vercel
 * (environment production dan preview) agar build di Vercel memakai nilai yang sama.
 *
 * Cara pakai:
 *   npx vercel login                (sekali saja)
 *   npx vercel link --yes --project <nama-project>
 *   node scripts/vercel-env.mjs
 *
 * Nilai yang sudah ada di Vercel tidak ditimpa tanpa persetujuan:
 * skrip hanya menambahkan variabel yang belum ada, dan menandai daftar
 * variabel yang berbeda supaya bisa diperiksa manual.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const PREFIX = "NEXT_PUBLIC_FIREBASE_";

function readEnvFile() {
  const path = ".env.local";
  if (!existsSync(path)) {
    console.error(".env.local belum ada.");
    process.exit(1);
  }
  const out = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

function vercel(args, input) {
  return execFileSync("npx", ["vercel", ...args], {
    input,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
    shell: process.platform === "win32",
  });
}

const env = readEnvFile();
const vars = Object.entries(env).filter(
  ([k, v]) => k.startsWith(PREFIX) && v && k !== "NEXT_PUBLIC_DEMO_MODE",
);

if (vars.length === 0) {
  console.error(`Tidak ada variabel ${PREFIX}* di .env.local.`);
  process.exit(1);
}

let existing = "";
try {
  existing = vercel(["env", "ls", "production"]);
} catch {
  console.error("Gagal membaca daftar environment Vercel. Sudah login & project di-link?");
  process.exit(1);
}

console.log(`\nMemeriksa ${vars.length} variabel di project Vercel...\n`);

for (const [key, value] of vars) {
  const sudahAda = existing.includes(key);

  if (sudahAda) {
    console.log(`  [=] ${key} — sudah ada di Vercel, dilewati`);
    continue;
  }

  for (const target of ["production", "preview"]) {
    try {
      vercel(["env", "add", key, target, "--force"], value);
      console.log(`  [+] ${key} ditambahkan ke ${target}`);
    } catch (e) {
      console.error(`  [!] gagal menambah ${key} ke ${target}: ${e.message}`);
      process.exitCode = 1;
    }
  }
}

console.log(
  "\nSelesai. Variabel yang sudah ada sebelumnya tidak ditimpa — hapus manual di",
  "Vercel → Settings → Environment Variables bila nilainya perlu diperbarui.\n",
);
