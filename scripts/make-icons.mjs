import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = "public/icons";
mkdirSync(OUT, { recursive: true });

/** Ikon: simbol topologi Star pada papan gelap Network Explorer. */
const svg = (size, maskable) => {
  const pad = maskable ? size * 0.18 : size * 0.12;
  const s = size - pad * 2;
  const u = (v) => pad + (v / 24) * s;
  const radius = maskable ? 0 : size * 0.18;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="#0b1220"/>
  <rect x="${size * 0.04}" y="${size * 0.04}" width="${size * 0.92}" height="${size * 0.92}" rx="${Math.max(0, radius - 4)}" fill="none" stroke="#22324d" stroke-width="${size * 0.015}"/>
  <g stroke="#22b8cf" stroke-width="${size * 0.032}" stroke-linecap="round" fill="none">
    <path d="M ${u(12)} ${u(5.2)} V ${u(8.6)} M ${u(12)} ${u(15.4)} V ${u(18.8)} M ${u(5.2)} ${u(12)} H ${u(8.6)} M ${u(15.4)} ${u(12)} H ${u(18.8)}"/>
  </g>
  <circle cx="${u(12)}" cy="${u(12)}" r="${(3.4 / 24) * s}" fill="#111b2e" stroke="#2fd17a" stroke-width="${size * 0.032}"/>
  <g fill="#5ce1f6">
    <circle cx="${u(12)}" cy="${u(4)}" r="${(1.8 / 24) * s}"/>
    <circle cx="${u(12)}" cy="${u(20)}" r="${(1.8 / 24) * s}"/>
    <circle cx="${u(4)}" cy="${u(12)}" r="${(1.8 / 24) * s}"/>
    <circle cx="${u(20)}" cy="${u(12)}" r="${(1.8 / 24) * s}"/>
  </g>
</svg>`;
};

const browser = await chromium.launch();

const jobs = [
  { file: "icon-192.png", size: 192, maskable: false },
  { file: "icon-512.png", size: 512, maskable: false },
  { file: "icon-maskable-512.png", size: 512, maskable: true },
  { file: "apple-touch-icon.png", size: 180, maskable: true },
];

for (const job of jobs) {
  const page = await browser.newPage({
    viewport: { width: job.size, height: job.size },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    `<body style="margin:0;background:transparent">${svg(job.size, job.maskable)}</body>`,
  );
  await page.screenshot({
    path: `${OUT}/${job.file}`,
    omitBackground: true,
  });
  await page.close();
  console.log("dibuat:", `${OUT}/${job.file}`);
}

await browser.close();
