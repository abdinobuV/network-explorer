"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/store";

/** Halaman yang butuh sesi. Tanpa sesi → arahkan ke halaman masuk. */
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const authed = !!user;

  useEffect(() => {
    if (ready && !authed) router.replace("/auth/login");
  }, [ready, authed, router]);

  if (!ready || !authed) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <p className="font-mono text-caption uppercase tracking-[0.14em] text-ink-3">
          {ready ? "Mengalihkan ke halaman masuk…" : "Memuat sesi…"}
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
