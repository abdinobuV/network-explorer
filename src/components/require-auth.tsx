"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/store";

// Guard hybrid: lolos jika login Google (Firebase) ATAU akun demo lokal.
// Jika tidak ada keduanya setelah loading selesai, redirect ke /auth/login.
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, fuser, ready } = useAuth();
  const r = useRouter();
  const authed = !!user || !!fuser;

  useEffect(() => {
    if (ready && !authed) r.replace("/auth/login");
  }, [ready, authed, r]);

  if (!ready) {
    return <div className="mx-auto max-w-7xl p-10 text-center text-sm text-slate-400">Memuat sesi...</div>;
  }
  if (!authed) {
    return <div className="mx-auto max-w-7xl p-10 text-center text-sm text-slate-400">Mengalihkan ke halaman masuk...</div>;
  }
  return <>{children}</>;
}
