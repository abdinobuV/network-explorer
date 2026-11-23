import Link from "next/link";
import { Container, BtnLink } from "@/components/ui";
import { IconCheck } from "@/components/icons";
import { Logo } from "@/components/chrome";

export default function KonfirmasiPage() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Container width="page" className="flex items-center justify-between py-5">
        <Logo />
        <Link href="/beranda" className="text-caption font-medium text-ink-2 hover:text-signal-bright">
          Lihat beranda
        </Link>
      </Container>

      <Container width="narrow" className="flex flex-1 items-center justify-center py-10">
        <div className="w-full rounded-lg border border-border bg-surface p-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-ok/45 bg-ok-tint text-ok">
            <IconCheck size={22} />
          </span>
          <p className="mt-5 text-caption font-medium text-ok">Tautan terkirim</p>
          <h1 className="mt-1.5 font-display text-head">Periksa kotak masukmu</h1>
          <p className="mx-auto mt-3 max-w-md text-caption text-ink-2">
            Jika emailmu terdaftar, tautan untuk mengatur kata sandi baru sudah dikirim. Tautan
            berlaku singkat; bila kedaluwarsa, minta tautan baru.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <BtnLink href="/auth/login" tone="primary">
              Ke halaman masuk
            </BtnLink>
            <BtnLink href="/auth/lupa" tone="ghost">
              Minta tautan lagi
            </BtnLink>
          </div>
        </div>
      </Container>
    </div>
  );
}
