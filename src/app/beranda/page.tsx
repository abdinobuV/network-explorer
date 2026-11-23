import { Container, BtnLink, Paper } from "@/components/ui";
import { Footer, Navbar } from "@/components/chrome";
import { TopoMini } from "@/components/topo";
import CoverBench from "@/components/cover-bench";
import { TOPOLOGI } from "@/lib/data";
import { TOPO_SPECS } from "@/lib/topology-model";

const LANGKAH = [
  {
    no: "1",
    judul: "Pelajari konsepnya",
    isi: "Baca cara kerja, kelebihan, kekurangan, analogi, dan jawab satu cek pemahaman per topologi.",
  },
  {
    no: "2",
    judul: "Pasang kabelnya",
    isi: "Seret kabel ke perangkat tujuan di papan praktik. Setiap topologi memvalidasi aturannya sendiri.",
  },
  {
    no: "3",
    judul: "Uji di sandbox",
    isi: "Kirim paket ping antar komputer, cabut satu tautan, dan amati apakah jaringan tetap berjalan.",
  },
  {
    no: "4",
    judul: "Kerjakan studi kasus",
    isi: "Uji pemahamanmu lewat sepuluh kasus jaringan lengkap dengan pembahasan tiap jawaban.",
  },
];

const FAQ = [
  {
    t: "Apakah skor kuis memengaruhi nilai rapor sekolah?",
    j: "Tidak. Aplikasi ini dirancang untuk latihan mandiri. Skor dan rapor cetak dipakai untuk memantau pemahamanmu sendiri.",
  },
  {
    t: "Apakah perlu perangkat keras jaringan tambahan?",
    j: "Tidak. Cukup laptop atau komputer dengan peramban modern. Mode demo menyimpan seluruh progres langsung di perambanmu.",
  },
  {
    t: "Mengapa aturan pemasangan kabel berbeda di setiap topologi?",
    j: "Karena arsitekturnya berbeda: Bus terhubung ke satu backbone, Ring menyambung berurutan membentuk cincin, dan Star bermuara ke satu switch pusat.",
  },
  {
    t: "Apakah materi dan kuis bisa diulang?",
    j: "Bisa. Kamu bebas membuka ulang materi, praktik, maupun kuis kapan saja. XP hanya bertambah bila nilai kuis mencetak rekor baru.",
  },
];

export default function BerandaPage() {
  return (
    <div className="bg-canvas">
      <Navbar pub />

      <main id="konten-utama">
        <Container width="page">
          {/* Hero */}
          <section className="grid items-center gap-10 py-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <div>
              <p className="text-caption font-medium text-signal-bright">
                Laboratorium jaringan interaktif
              </p>
              <h1 className="mt-3 font-display text-chapter leading-[1.08]">
                Pahami topologi dengan merangkai dan mengujinya langsung.
              </h1>
              <p className="mt-4 max-w-lg text-lead text-ink-2">
                Tiga modul topologi, tiga papan pemasangan kabel, simulasi ping, dan kuis studi
                kasus dalam satu ruang belajar untuk Informatika SMA Kelas XI.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <BtnLink href="/auth/signup" tone="primary" size="lg">
                  Mulai belajar
                </BtnLink>
                <BtnLink href="/auth/login" tone="ghost" size="lg">
                  Masuk ke akun
                </BtnLink>
              </div>
            </div>

            <CoverBench />
          </section>

          {/* Pendekatan belajar */}
          <section id="tentang" className="border-t border-border py-14">
            <h2 className="font-display text-head">Dari membaca diagram ke memecahkan gangguan</h2>
            <p className="mt-2 max-w-2xl text-body text-ink-2">
              Alih-alih menghafal definisi, setiap topik mengajakmu melihat jalur paket data dan
              merasakan sendiri dampaknya saat satu kabel bermasalah.
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                [
                  "Lihat pola, bukan hafalan",
                  "Kenali susunan perangkat, backbone, dan switch lewat skema interaktif yang jelas.",
                ],
                [
                  "Hubungkan teori dan praktik",
                  "Pemasangan kabel yang tidak sesuai aturan langsung ditolak beserta penjelasan teknisnya.",
                ],
                [
                  "Bandingkan sebelum memilih",
                  "Gunakan tabel perbandingan dan studi kasus untuk memilih topologi yang tepat bagi laboratorium sekolah.",
                ],
              ].map(([judul, isi]) => (
                <Paper key={judul} className="p-6">
                  <h3 className="font-display text-title">{judul}</h3>
                  <p className="mt-2.5 text-caption leading-relaxed text-ink-2">{isi}</p>
                </Paper>
              ))}
            </div>
          </section>

          {/* Topologi */}
          <section id="topologi" className="border-t border-border py-14">
            <div className="max-w-2xl">
              <p className="text-caption font-medium text-signal-bright">Tiga arsitektur dasar</p>
              <h2 className="mt-1.5 font-display text-head">Kenali Bus, Ring, dan Star</h2>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {(Object.keys(TOPOLOGI) as Array<keyof typeof TOPOLOGI>).map((key) => {
                const t = TOPOLOGI[key];
                const spec = TOPO_SPECS[key];
                return (
                  <Paper key={key} className="flex flex-col p-5">
                    <h3 className="font-display text-title">{t.title}</h3>
                    <p className="mt-2 text-caption text-ink-2">{t.desc}</p>
                    <div className="lab-grid mt-4 rounded-md border border-border-3 p-2.5">
                      <TopoMini kind={key} />
                    </div>
                    <p className="mt-3.5 text-micro text-ink-3">{spec.rule}</p>
                  </Paper>
                );
              })}
            </div>
          </section>

          {/* Cara belajar (urutan nyata 1..4) */}
          <section id="cara" className="border-t border-border py-14">
            <div className="max-w-2xl">
              <p className="text-caption font-medium text-signal-bright">Alur satu misi</p>
              <h2 className="mt-1.5 font-display text-head">Empat langkah yang saling terhubung</h2>
            </div>
            <ol className="mt-8 grid gap-5 md:grid-cols-4">
              {LANGKAH.map((l) => (
                <li key={l.no} className="rounded-lg border border-border bg-surface p-5">
                  <span className="inline-grid h-7 w-7 place-items-center rounded-sm bg-signal-tint font-mono text-caption font-medium text-signal-bright">
                    {l.no}
                  </span>
                  <h3 className="mt-3.5 font-display text-title">{l.judul}</h3>
                  <p className="mt-2 text-caption leading-relaxed text-ink-2">{l.isi}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* FAQ */}
          <section id="faq" className="border-t border-border py-14">
            <div className="grid gap-8 lg:grid-cols-[20rem_minmax(0,1fr)]">
              <div>
                <h2 className="font-display text-head">Pertanyaan yang sering diajukan</h2>
                <p className="mt-2 text-caption text-ink-2">
                  Hal-hal dasar sebelum memulai sesi latihan di Network Explorer.
                </p>
              </div>
              <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
                {FAQ.map((f) => (
                  <details key={f.t} className="group">
                    <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-body font-medium text-ink marker:hidden">
                      {f.t}
                      <span className="font-mono text-caption text-ink-3 group-open:hidden">+</span>
                      <span className="hidden font-mono text-caption text-signal-bright group-open:inline">
                        −
                      </span>
                    </summary>
                    <p className="border-t border-border-3 bg-surface-2/50 px-5 py-4 text-caption leading-relaxed text-ink-2">
                      {f.j}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Penutup */}
          <section className="border-t border-border py-14">
            <div className="flex flex-col items-start justify-between gap-6 rounded-lg border border-border bg-surface p-8 md:flex-row md:items-center">
              <div>
                <h2 className="font-display text-head">Siap merangkai jaringan pertamamu?</h2>
                <p className="mt-2 max-w-md text-caption text-ink-2">
                  Buat akun siswa sekali, lalu selesaikan ketiga topologi beserta papan praktiknya.
                  Progres tercatat otomatis.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <BtnLink href="/auth/signup" tone="primary" size="lg">
                  Buat akun belajar
                </BtnLink>
                <BtnLink href="/auth/login" tone="ghost" size="lg">
                  Masuk
                </BtnLink>
              </div>
            </div>
          </section>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
