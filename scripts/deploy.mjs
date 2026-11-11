/**
 * Deploy ke Vercel — sepenuhnya non-interaktif bila VERCEL_TOKEN tersedia,
 * atau memakai sesi login yang sudah tersimpan.
 *
 *   npm run deploy              → produksi
 *   npm run deploy:preview      → preview deployment
 *   npm run deploy -- --rules   → deploy aturan Firestore dulu, baru produksi
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const isPreview = process.argv.includes("--preview");
const withRules = process.argv.includes("--rules");

/** Berhenti dengan pesan yang jelas bila belum terautentikasi. */
function butuhAuth() {
  const authFile =
    process.platform === "win32"
      ? `${process.env.APPDATA}\\com.vercel.cli\\auth.json`
      : `${process.env.HOME}/.local/share/com.vercel.cli/auth.json`;
  return !process.env.VERCEL_TOKEN && !existsSync(authFile);
}

if (butuhAuth()) {
  console.error(
    "\n[!] Vercel CLI belum terautentikasi.\n" +
      "    Pilih salah satu:\n" +
      "    1) Login sekali di terminal ini : npx vercel login\n" +
      "    2) Pakai token (tanpa interaksi): set VERCEL_TOKEN=<token>\n" +
      "       token dibuat di https://vercel.com/account/tokens\n",
  );
  process.exit(1);
}

function bin(name) {
  const p = process.platform === "win32" ? "node_modules/.bin" : "node_modules/.bin";
  return `${p}/${name}${process.platform === "win32" ? ".cmd" : ""}`;
}

/** Menjalankan perintah dengan token yang tersedia di environment. */
function run(cmd, args, tokenEnv) {
  const token = tokenEnv ? process.env[tokenEnv] : null;
  const finalArgs = token ? [...args, "--token", token] : args;
  console.log(`\n> ${cmd} ${finalArgs.join(" ")}\n`);
  execFileSync(cmd, finalArgs, { stdio: "inherit", shell: process.platform === "win32" });
}

if (withRules) {
  console.log("\n=== 1/2 Men-deploy aturan Firestore ===\n");
  const fb = existsSync(bin("firebase"))
    ? bin("firebase")
    : "npx";
  const fbArgs = existsSync(bin("firebase"))
    ? ["deploy", "--only", "firestore:rules", "--project", "misi-topologi"]
    : ["--yes", "firebase-tools", "deploy", "--only", "firestore:rules", "--project", "misi-topologi"];
  run(fb, fbArgs, "FIREBASE_TOKEN");
}

console.log(`\n=== ${withRules ? "2/2" : "1/1"} Deploy ke Vercel ===\n`);
const vercelArgs = isPreview ? ["--yes"] : ["--prod", "--yes"];
run(bin("vercel"), vercelArgs, "VERCEL_TOKEN");

console.log("\nSelesai. Buka URL yang tertera di atas untuk memeriksa hasilnya.\n");
