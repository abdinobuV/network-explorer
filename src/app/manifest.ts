import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Network Explorer — Buku Praktis Topologi Jaringan",
    short_name: "Network Explorer",
    description:
      "Pelajari topologi Bus, Ring, dan Star secara interaktif: baca bab, pasang kabel di lembar kerja teknik, lalu uji jaringannya.",
    lang: "id",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f4f1e8",
    theme_color: "#f4f1e8",
    categories: ["education", "books"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
