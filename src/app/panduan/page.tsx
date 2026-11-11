"use client";

import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { Container, Eyebrow, PageHeader, Callout, BtnLink, Kbd } from "@/components/ui";
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
    judul: "Baca babnya",
    durasi: "± 10 menit",
    isi: [
      "Mulai dari Bab 01 (Bus) dan lanjutkan berurutan.",
      "Pahami bagian Cara Kerja sebelum masuk ke bagian Cek Pemahaman.",
      "Sebutkan analoginya dengan suara sendiri — lebih mudah diingat.",
    ],
  },
  {
    no: "2",
    judul: "Pasang kabelnya",
    durasi: "± 5 menit",
    isi: [
      "Buka Lembar Praktik untuk topologi yang sedang dipelajari.",
      "Seret kabel dari palet ke perangkat yang benar. Salah sasaran akan ditolak beserta alasannya.",
      "Kabel yang terpasang bisa dicabut lagi dengan menariknya keluar atau tombol Cabut.",
    ],
  },
  {
    no: "3",
    judul: "Uji jaringannya",
    durasi: "± 5 menit",
    isi: [
      "Di Sandbox, kirim data dari satu komputer ke komputer lain.",
      "Cabut satu kabel, lalu kirim data lagi. Perhatikan apa yang berubah.",
      "Tulis kesimpulanmu sendiri: mengapa dampaknya berbeda tiap topologi?",
    ],
  },
  {
    no: "4",
    judul: "Tunjukkan pemahamanmu",
    durasi: "± 15 menit",
    isi: [
      "Kerjakan Kuis Akhir berisi sepuluh studi kasus.",
      "Baca pembahasan setiap soal — termasuk soal yang sudah benar.",
      "Ulangi bab dengan nilai terendah bila skoremu di bawah 80.",
    ],
  },
];

export default function PanduanPage() {
  return (
    <RequireAuth>
      <div>
        <Navbar />
        <Container width="page" className="py-10">
          <PageHeader
            chapter="Pendahuluan"
            title="Panduan belajar"
            lead="Cara memakai buku ini secara efektif dari awal sampai rapor tercetak."
          />

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-6">
              <section className="border border-rule bg-paper p-5">
                <Eyebrow>Tujuan pembelajaran</Eyebrow>
                <ul className="mt-3 space-y-2">
                  {TUJUAN.map((t) => (
                    <li key={t} className="flex gap-2.5 text-caption text-ink-2">
                      <IconCheck size={14} className="mt-0.5 shrink-0 text-green" />
                      {t}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-4">
                {LANGKAH.map((l) => (
                  <div key={l.no} className="border border-rule bg-paper">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule bg-paper-2 px-5 py-3">
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-caption text-blueprint">{l.no}</span>
                        <h2 className="font-serif text-title">{l.judul}</h2>
                      </div>
                      <span className="font-mono text-micro uppercase tracking-[0.1em] text-ink-3">
                        {l.durasi}
                      </span>
                    </div>
                    <ul className="space-y-2 p-5">
                      {l.isi.map((t) => (
                        <li key={t} className="flex gap-2.5 text-caption text-ink-2">
                          <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-rule-2" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>

              <Callout tone="note" label="Catatan untuk guru">
                Lembar praktik sengaja memakai aturan pemasangan yang berbeda tiap topologi.
                Jika siswa salah, mintalah mereka menjelaskan mengapa Bus tidak boleh disambung ke
                komputer lain secara langsung.
              </Callout>
            </div>

            <aside className="space-y-5">
              <div className="border border-rule bg-paper p-5">
                <Eyebrow>Target belajar</Eyebrow>
                <p className="mt-2 text-caption text-ink-2">
                  Selesaikan 10 tahap learn: 3 bab × (materi + praktik + simulasi), ditambah satu
                  kuis akhir.
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

              <div className="border border-rule bg-paper p-5">
                <Eyebrow>Perangkat & aksesibilitas</Eyebrow>
                <ul className="mt-2 space-y-1.5 text-caption text-ink-2">
                  <li>Seluruh interaksi dapat dipakai dengan keyboard.</li>
                  <li>
                    Tekan <Kbd>Tab</Kbd> untuk berpindah antarelemen, lalu <Kbd>Enter</Kbd> untuk
                    memilih atau menyambungkan kabel.
                  </li>
                  <li>Efek suara dapat dimatikan lewat tombol di navigasi.</li>
                  <li>Animasi dihentikan otomatis bila sistem diaktifkan pada Reduce Motion.</li>
                </ul>
              </div>
            </aside>
          </div>
        </Container>
        <Footer help />
      </div>
    </RequireAuth>
  );
}
