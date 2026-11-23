import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider, ProgProvider } from "@/lib/store";
import PwaRegister from "@/components/pwa-register";
import ToastViewport from "@/components/toast";
import { fontVars } from "./fonts";

export const metadata: Metadata = {
  title: {
    default: "MISI TOPOLOGI — Network Explorer",
    template: "%s | MISI TOPOLOGI",
  },
  description:
    "Laboratorium interaktif topologi Bus, Ring, dan Star untuk Informatika SMA Kelas XI: pelajari cara kerja, pasang kabel, uji aliran paket, dan kerjakan studi kasus.",
  applicationName: "MISI TOPOLOGI",
  authors: [{ name: "Kelompok 3, PTIK UNIMED" }],
  keywords: ["topologi jaringan", "bus", "ring", "star", "informatika SMA", "simulasi jaringan"],
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
  themeColor: "#0b1220",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-scroll-behavior="smooth" className={`${fontVars} h-full`}>
      <body className="min-h-full bg-canvas text-ink antialiased">
        <a
          href="#konten-utama"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-signal focus:px-4 focus:py-2 focus:text-caption focus:font-semibold focus:text-ok-ink"
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
