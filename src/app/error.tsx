"use client";

import { useEffect } from "react";
import { Container, Btn, BtnLink } from "@/components/ui";
import { Logo } from "@/components/chrome";
import { IconWarning } from "@/components/icons";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Container width="page" className="flex items-center justify-between py-5">
        <Logo />
      </Container>
      <Container width="narrow" className="flex flex-1 items-center justify-center py-10">
        <div className="w-full rounded-lg border border-border bg-surface p-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-fault/45 bg-fault-tint text-fault">
            <IconWarning size={22} />
          </span>
          <p className="mt-5 text-caption font-medium text-fault">Terjadi kesalahan</p>
          <h1 className="mt-1.5 font-display text-head">Halaman ini gagal dimuat</h1>
          <p className="mx-auto mt-3 max-w-md text-caption text-ink-2">
            Ada gangguan saat memuat bagian ini. Muat ulang untuk mencoba lagi; progres belajarmu
            tetap tersimpan.
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-micro text-ink-4">Kode: {error.digest}</p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Btn type="button" onClick={() => reset()}>
              Coba lagi
            </Btn>
            <BtnLink href="/misi" tone="ghost">
              Ke peta misi
            </BtnLink>
          </div>
        </div>
      </Container>
    </div>
  );
}
