"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/store";
import type { UserRole } from "@/lib/auth-session";
import { BtnLink, Container } from "@/components/ui";
import { IconLock } from "@/components/icons";

/**
 * Penjaga akses halaman berbasis sesi dan peran (RBAC: siswa / guru).
 *  - Tanpa sesi → dialihkan ke halaman masuk (/auth/login).
 *  - role="guru" sementara pengguna adalah siswa → akses ditolak secara eksplisit (403),
 *    menjamin siswa tidak pernah bisa membuka data murid lain maupun panel guru.
 */
export default function RequireAuth({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: UserRole;
}) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const authed = !!user;

  useEffect(() => {
    if (ready && !authed) router.replace("/auth/login");
  }, [ready, authed, router]);

  if (!ready || !authed) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-canvas">
        <p className="text-caption text-ink-3">
          {ready ? "Mengalihkan ke halaman masuk…" : "Memuat sesi…"}
        </p>
      </div>
    );
  }

  if (role && user.role !== role) {
    return (
      <div className="grid min-h-[75vh] place-items-center bg-canvas px-4">
        <Container width="narrow">
          <div className="rounded-lg border border-fault/40 bg-surface p-8 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-fault/45 bg-fault-tint text-fault">
              <IconLock size={22} />
            </span>
            <p className="mt-4 font-mono text-micro text-fault">AKSES TERBATAS · ACCESS CONTROL</p>
            <h1 className="mt-2 font-display text-head text-ink">
              Halaman ini khusus untuk akun Guru
            </h1>
            <p className="mx-auto mt-2.5 max-w-lg text-caption leading-relaxed text-ink-2">
              Sesuai prinsip privasi dan kontrol akses data pembelajaran, akun siswa hanya dapat
              melihat progres, nilai, dan analitik miliknya sendiri serta tidak dapat mengakses
              data peserta didik lain.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <BtnLink href="/misi" tone="primary">
                Kembali ke Alur Belajar
              </BtnLink>
              <BtnLink href="/analitik" tone="ghost">
                Lihat Analitik Pribadimu
              </BtnLink>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return <>{children}</>;
}
