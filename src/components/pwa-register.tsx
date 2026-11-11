"use client";

import { useEffect } from "react";

/**
 * Mendaftarkan service worker (hanya untuk build produksi).
 * Cookie consent tidak dibutuhkan karena cache hanya menyimpan halaman
 * milik aplikasi sendiri.
 */
export default function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const daftar = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        /* aplikasi tetap berjalan tanpa service worker */
      });
    };

    if (document.readyState === "complete") daftar();
    else window.addEventListener("load", daftar, { once: true });

    return () => window.removeEventListener("load", daftar);
  }, []);

  return null;
}
