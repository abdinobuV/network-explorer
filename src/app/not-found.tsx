import { Container, BtnLink } from "@/components/ui";
import { Logo } from "@/components/chrome";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Container width="page" className="flex items-center justify-between py-5">
        <Logo />
      </Container>
      <Container width="narrow" className="flex flex-1 items-center justify-center py-10">
        <div className="w-full rounded-lg border border-border bg-surface p-8 text-center">
          <p className="font-mono text-chapter font-bold text-signal-bright">404</p>
          <h1 className="mt-2 font-display text-head">Halaman ini tidak ditemukan</h1>
          <p className="mx-auto mt-3 max-w-md text-caption text-ink-2">
            Alamat yang kamu buka tidak dikenali. Periksa tautannya atau kembali ke peta misi.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <BtnLink href="/misi" tone="primary">
              Ke peta misi
            </BtnLink>
            <BtnLink href="/beranda" tone="ghost">
              Halaman beranda
            </BtnLink>
          </div>
        </div>
      </Container>
    </div>
  );
}
