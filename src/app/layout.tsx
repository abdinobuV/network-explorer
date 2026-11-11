import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider, ProgProvider } from "@/lib/store";
import PwaRegister from "@/components/pwa-register";
import ToastViewport from "@/components/toast";
import { fontVars } from "./fonts";

export const metadata: Metadata = {
  title: {
    default: "Network Explorer — Buku Praktis Topologi Jaringan",
    template: "%s · Network Explorer",
  },
  description:
    "Pelajari topologi Bus, Ring, dan Star secara interaktif: baca bab, pasang kabel di lembar kerja teknik, lalu uji jaringannya. Informatika SMA Kelas XI.",
  applicationName: "Network Explorer",
  authors: [{ name: "Kelompok 3 — PTIK, UNIMED" }],
  keywords: ["topologi jaringan", "bus", "ring", "star", "informatika SMA", "materi sekolah"],
  formatDetection: { telephone: false },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f1e8",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-scroll-behavior="smooth" className={`${fontVars} h-full`}>
      <body className="min-h-full bg-paper text-ink antialiased">
        <a
          href="#konten-utama"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xs focus:bg-ink focus:px-4 focus:py-2 focus:text-caption focus:text-paper"
        >
          Lompat ke konten utama
        </a>
        <AuthProvider>
          <ProgProvider>{children}</ProgProvider>
        </AuthProvider>
        <PwaRegister />
        <ToastViewport />
      </body>
    </html>
  );
}
