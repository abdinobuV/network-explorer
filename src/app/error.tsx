"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
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
    // Catat galat ke konsol agar mudah ditelusuri saat presentasi.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Container width="page" className="flex items-center justify-between py-5">
        <Logo />
      </Container>
      <Container width="narrow" className="flex flex-1 items-center justify-center py-10">
        <div className="w-full border border-rule bg-paper p-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-redpen/50 bg-redpen-2 text-redpen">
            <IconWarning size={22} />
          </span>
          <Eyebrow className="mt-5 justify-center">Terjadi kesalahan</Eyebrow>
          <h1 className="mt-2 font-serif text-head">Halaman ini gagal dimuat</h1>
          <p className="mt-3 text-caption text-ink-2">
            Ada gangguan saat memuat bagian ini. Coba muat ulang — progres belajarmu tetap
            tersimpan.
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-micro text-ink-4">Kode: {error.digest}</p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center rounded-xs border border-ink bg-ink px-4 py-2 font-mono text-caption uppercase tracking-[0.12em] text-paper hover:bg-ink-2"
            >
              Coba lagi
            </button>
            <Link
              href="/misi"
              className="inline-flex items-center rounded-xs border border-rule-2 px-4 py-2 font-mono text-caption uppercase tracking-[0.12em] text-ink hover:border-ink hover:bg-paper-2"
            >
              Ke peta misi
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
