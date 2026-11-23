import localFont from "next/font/local";

/**
 * Font lokal di src/app/fonts (zero permintaan CDN, aman untuk CSP & offline):
 *  - Display (Space Grotesk): judul halaman, heading bagian, angka utama
 *  - Sans (IBM Plex Sans): teks bacaan, antarmuka, tombol, navigasi
 *  - Mono (IBM Plex Mono): khusus data teknis (port, ID PC, latensi, log, XP)
 */

export const displayFont = localFont({
  src: [
    { path: "./fonts/space-grotesk-500-latin.woff2", weight: "500", style: "normal" },
    { path: "./fonts/space-grotesk-700-latin.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-display-face",
  display: "swap",
  preload: true,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  adjustFontFallback: "Arial",
});

export const plexSans = localFont({
  src: [
    { path: "./fonts/ibm-plex-sans-400-latin.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-sans-600-latin.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-plex-sans",
  display: "swap",
  preload: true,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  adjustFontFallback: "Arial",
});

export const plexMono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-400-latin.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-500-latin.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
  preload: true,
  fallback: ["ui-monospace", "SFMono-Regular", "monospace"],
  adjustFontFallback: "Arial",
});

export const fontVars = `${displayFont.variable} ${plexSans.variable} ${plexMono.variable}`;
