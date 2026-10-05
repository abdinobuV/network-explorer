import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider, ProgProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "MISI TOPOLOGI — Network Explorer",
  description: "Pelajari topologi Bus, Ring, dan Star secara interaktif. Informatika SMA Kelas XI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full">
        <AuthProvider>
          <ProgProvider>{children}</ProgProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
