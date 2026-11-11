import localFont from "next/font/local";

/**
 * IBM Plex — diserve sendiri dari /fonts (tidak ada permintaan ke CDN Google),
 * sehingga build tetap jalan tanpa internet dan tidak ada permintaan ke pihak ketiga.
 *
 * Sans  → teks isi        Mono → angka, kode, port, label data
 * Serif → judul bab & sampul
 */

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

export const plexSerif = localFont({
  src: [{ path: "./fonts/ibm-plex-serif-600-latin.woff2", weight: "600", style: "normal" }],
  variable: "--font-plex-serif",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "Times New Roman", "serif"],
  adjustFontFallback: "Times New Roman",
});

export const fontVars = `${plexSans.variable} ${plexMono.variable} ${plexSerif.variable}`;
