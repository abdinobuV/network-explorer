import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = "public/icons";
mkdirSync(OUT, { recursive: true });

/** Ikon: lambang topologi Star di atas kertas, garis tinta. */
const svg = (size, maskable) => {
  const pad = maskable ? size * 0.18 : size * 0.12;
  const s = size - pad * 2;
  const u = (v) => pad + (v / 24) * s;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${maskable ? "#1b1a16" : "#f4f1e8"}"/>
  <g stroke="${maskable ? "#f4f1e8" : "#1b1a16"}" stroke-width="${size * 0.022}" stroke-linecap="round" fill="none">
    <path d="M ${u(12)} ${u(5)} V ${u(8.6)} M ${u(12)} ${u(15.4)} V ${u(19)} M ${u(5)} ${u(12)} H ${u(8.6)} M ${u(15.4)} ${u(12)} H ${u(19)}"/>
    <circle cx="${u(12)}" cy="${u(12)}" r="${(3.4 / 24) * s}"/>
  </g>
  <g fill="${maskable ? "#f4f1e8" : "#1b1a16"}">
    <circle cx="${u(12)}" cy="${u(4)}" r="${(1.5 / 24) * s}"/>
    <circle cx="${u(12)}" cy="${u(20)}" r="${(1.5 / 24) * s}"/>
    <circle cx="${u(4)}" cy="${u(12)}" r="${(1.5 / 24) * s}"/>
    <circle cx="${u(20)}" cy="${u(12)}" r="${(1.5 / 24) * s}"/>
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
