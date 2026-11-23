"use client";

import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { Container, PageHeader, Callout, BtnLink, Kbd } from "@/components/ui";
import { IconArrow, IconCheck, IconTarget } from "@/components/icons";

const TUJUAN = [
  "Menjelaskan cara kerja topologi Bus, Ring, dan Star beserta karakteristiknya.",
  "Membedakan kelebihan dan kekurangan masing-masing topologi.",
  "Memasang kabel pada lembar kerja sesuai aturan tiap topologi.",
  "Menganalisis dampak gangguan jaringan terhadap jenis topologi tertentu.",
];

const LANGKAH = [
  {
    no: "1",
    judul: "Baca materinya",
    durasi: "± 10 menit",
    isi: [
      "Mulai dari Level 1 (Bus) dan lanjutkan berurutan hingga Star.",
      "Pahami bagian Cara Kerja sebelum membuka bagian Cek Pemahaman.",
      "Coba ulangi analoginya dengan bahasamu sendiri agar lebih melekat.",
    ],
  },
  {
    no: "2",
    judul: "Pasang kabelnya",
    durasi: "± 5 menit",
    isi: [
      "Buka Lembar Praktik untuk topologi yang sedang dipelajari.",
      "Seret kabel dari palet ke perangkat yang benar. Salah sasaran akan ditolak beserta alasannya.",
      "Kabel yang terpasang bisa dicabut kembali lewat tombol Cabut atau ditarik keluar.",
    ],
  },
  {
    no: "3",
    judul: "Uji jaringannya",
    durasi: "± 5 menit",
    isi: [
      "Di Sandbox, kirim paket ping dari satu komputer ke komputer lain.",
      "Cabut satu kabel lalu kirim data lagi, dan amati perubahannya.",
      "Bandingkan mengapa dampaknya berbeda di Bus, Ring, dan Star.",
    ],
  },
  {
    no: "4",
    judul: "Kerjakan kuis akhir",
    durasi: "± 15 menit",
    isi: [
      "Jawab sepuluh studi kasus jaringan di Kuis Akhir.",
      "Baca pembahasan setiap soal, termasuk soal yang sudah kamu jawab benar.",
      "Ulangi materi terkait bila skormu masih di bawah 80.",
    ],
  },
];

export default function PanduanPage() {
  return (
    <RequireAuth>
      <div className="bg-canvas">
        <Navbar />
        <main id="konten-utama">
          <Container width="page" className="py-10">
            <PageHeader
              chapter="Petunjuk sesi"
              title="Panduan belajar"
              lead="Urutan pemakaian Network Explorer secara efektif dari materi pertama sampai rapor cetak."
            />

            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="space-y-6">
                <section className="rounded-lg border border-border bg-surface p-5">
                  <h2 className="font-display text-title">Tujuan pembelajaran</h2>
                  <ul className="mt-3.5 space-y-2.5">
                    {TUJUAN.map((t) => (
                      <li key={t} className="flex gap-2.5 text-caption text-ink-2">
                        <IconCheck size={15} className="mt-0.5 shrink-0 text-ok" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-4">
                  {LANGKAH.map((l) => (
                    <div key={l.no} className="overflow-hidden rounded-lg border border-border bg-surface">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-2 px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-6 w-6 place-items-center rounded-sm bg-signal-tint font-mono text-micro text-signal-bright">
                            {l.no}
                          </span>
                          <h2 className="font-display text-title">{l.judul}</h2>
                        </div>
                        <span className="font-mono text-micro text-ink-3">{l.durasi}</span>
                      </div>
                      <ul className="space-y-2 p-5">
                        {l.isi.map((t) => (
                          <li key={t} className="flex gap-2.5 text-caption leading-relaxed text-ink-2">
                            <span
                              aria-hidden="true"
                              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-signal"
                            />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </section>

                <Callout tone="note" label="Catatan untuk guru">
                  Lembar praktik sengaja menerapkan aturan pemasangan berbeda tiap topologi. Bila
                  siswa salah menyambung, minta mereka menjelaskan mengapa komputer pada Bus tidak
                  boleh disambung langsung ke komputer lain tanpa melalui backbone.
                </Callout>
              </div>

              <aside className="space-y-5">
                <div className="rounded-lg border border-border bg-surface p-5">
                  <p className="text-caption font-semibold text-ink">Target belajar</p>
                  <p className="mt-2 text-caption leading-relaxed text-ink-2">
                    Selesaikan 10 tahap belajar: 3 topologi (materi, praktik, simulasi) ditambah
                    satu kuis akhir.
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <BtnLink href="/misi" className="w-full">
                      <IconTarget size={14} /> Buka peta misi
                    </BtnLink>
                    <BtnLink href="/progres" tone="ghost" className="w-full">
                      <IconArrow size={14} /> Lihat progres
                    </BtnLink>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-surface p-5">
                  <p className="text-caption font-semibold text-ink">Perangkat & aksesibilitas</p>
                  <ul className="mt-2.5 space-y-2 text-caption text-ink-2">
                    <li>Seluruh interaksi dapat dioperasikan dengan keyboard.</li>
                    <li>
                      Tekan <Kbd>Tab</Kbd> untuk berpindah elemen, lalu <Kbd>Enter</Kbd> untuk
                      memilih atau menyambungkan kabel.
                    </li>
                    <li>Efek suara dapat dimatikan lewat tombol suara di bilah atas.</li>
                    <li>Animasi paket berhenti otomatis bila Reduce Motion aktif di sistem.</li>
                  </ul>
                </div>
              </aside>
            </div>
          </Container>
        </main>
        <Footer help />
      </div>
    </RequireAuth>
  );
}
