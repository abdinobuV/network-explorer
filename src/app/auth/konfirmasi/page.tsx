import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { IconCheck } from "@/components/icons";
import { Logo } from "@/components/chrome";

export default function KonfirmasiPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Container width="page" className="flex items-center justify-between py-5">
        <Logo />
        <Link
          href="/beranda"
          className="font-mono text-micro uppercase tracking-[0.14em] text-ink-3 hover:text-ink"
        >
          ← Selayang pandang
        </Link>
      </Container>

      <Container width="narrow" className="flex flex-1 items-center justify-center py-10">
        <div className="w-full border border-rule bg-paper p-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-green/50 bg-green-2 text-green">
            <IconCheck size={22} />
          </span>
          <Eyebrow className="mt-5 justify-center">Tautan terkirim</Eyebrow>
          <h1 className="mt-2 font-serif text-head">Periksa kotak masukmu</h1>
          <p className="mt-3 text-caption text-ink-2">
            Jika emailmu terdaftar, tautan untuk mengatur kata sandi baru sudah dikirim. Tautan
            berlaku singkat — bila kedaluwarsa, minta tautan baru.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/login"
              className="inline-flex items-center rounded-xs border border-ink bg-ink px-4 py-2 font-mono text-caption uppercase tracking-[0.12em] text-paper hover:bg-ink-2"
            >
              Ke halaman masuk
            </Link>
            <Link
              href="/auth/lupa"
              className="inline-flex items-center rounded-xs border border-rule-2 px-4 py-2 font-mono text-caption uppercase tracking-[0.12em] text-ink hover:border-ink hover:bg-paper-2"
            >
              Minta tautan lagi
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
