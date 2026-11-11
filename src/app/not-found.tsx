import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { Logo } from "@/components/chrome";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Container width="page" className="flex items-center justify-between py-5">
        <Logo />
      </Container>
      <Container width="narrow" className="flex flex-1 items-center justify-center py-10">
        <div className="w-full border border-rule bg-paper p-8 text-center">
          <Eyebrow className="justify-center">Halaman 404</Eyebrow>
          <p className="mt-4 font-serif text-cover leading-none">404</p>
          <h1 className="mt-3 font-serif text-head">Halaman ini tidak ada</h1>
          <p className="mt-3 text-caption text-ink-2">
            Alamat yang kamu buka tidak dikenali. Mungkin tautannya salah ketik, atau halamannya
            sudah dipindahkan.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/misi"
              className="inline-flex items-center rounded-xs border border-ink bg-ink px-4 py-2 font-mono text-caption uppercase tracking-[0.12em] text-paper hover:bg-ink-2"
            >
              Ke peta misi
            </Link>
            <Link
              href="/beranda"
              className="inline-flex items-center rounded-xs border border-rule-2 px-4 py-2 font-mono text-caption uppercase tracking-[0.12em] text-ink hover:border-ink hover:bg-paper-2"
            >
              Halaman muka
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
