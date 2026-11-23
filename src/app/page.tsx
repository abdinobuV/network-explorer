import Link from "next/link";
import { Container, BtnLink } from "@/components/ui";
import { Logo } from "@/components/chrome";
import CoverBench from "@/components/cover-bench";

export default function CoverPage() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="border-b border-border/70">
        <Container width="page" className="flex items-center justify-between py-4">
          <Logo />
          <div className="flex items-center gap-5 text-caption">
            <Link href="/beranda" className="text-ink-2 transition-colors hover:text-ink">
              Tentang aplikasi
            </Link>
            <Link
              href="/auth/login"
              className="font-medium text-signal-bright transition-colors hover:underline"
            >
              Masuk
            </Link>
          </div>
        </Container>
      </header>

      <main id="konten-utama" className="flex flex-1 items-center">
        <Container width="page" className="py-10 lg:py-14">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-12">
            <div>
              <p className="text-caption font-medium text-signal-bright">
                Informatika SMA Kelas XI
              </p>
              <h1 className="mt-3 font-display text-chapter leading-[1.06] sm:text-cover">
                Network Explorer: Misi Topologi
              </h1>
              <p className="mt-5 max-w-lg text-lead text-ink-2">
                Pelajari cara kerja topologi Bus, Ring, dan Star langsung dari skemanya. Pasang
                kabel sendiri di papan praktik, uji dampak gangguan di sandbox, lalu kerjakan
                sepuluh studi kasus.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <BtnLink href="/auth/signup" tone="primary" size="lg">
                  Mulai belajar
                </BtnLink>
                <BtnLink href="/auth/login" tone="ghost" size="lg">
                  Masuk dengan akun
                </BtnLink>
              </div>

              <p className="mt-6 text-caption text-ink-3">
                Coba ganti tab Bus, Ring, atau Star pada panel pratinjau dan putus kabel{" "}
                <span className="font-mono text-ink-2">PC-02</span> untuk melihat perbedaannya
                sebelum masuk.
              </p>
            </div>

            <CoverBench />
          </div>
        </Container>
      </main>

      <footer className="border-t border-border/70">
        <Container width="page" className="flex flex-col gap-2 py-4 text-micro text-ink-3 md:flex-row md:items-center md:justify-between">
          <p>Kelompok 3, Program Studi Pendidikan TIK — Universitas Negeri Medan</p>
          <p>Kurikulum Merdeka Informatika Kelas XI · 2026</p>
        </Container>
      </footer>
    </div>
  );
}
