"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/store";

// Bungkus halaman yang wajib login. Jika belum ada sesi setelah
// AuthProvider selesai memuat (ready), redirect ke /auth/login.
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const r = useRouter();

  useEffect(() => {
    if (ready && !user) r.replace("/auth/login");
  }, [ready, user, r]);

  if (!ready) {
    return <div className="mx-auto max-w-7xl p-10 text-center text-sm text-slate-400">Memuat sesi...</div>;
  }
  if (!user) {
    return <div className="mx-auto max-w-7xl p-10 text-center text-sm text-slate-400">Mengalihkan ke halaman masuk...</div>;
  }
  return <>{children}</>;
}
