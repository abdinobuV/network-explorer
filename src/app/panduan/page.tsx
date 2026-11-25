"use client";

import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { Container, PageHeader, Callout, BtnLink, Kbd } from "@/components/ui";
import {
  IconArrow,
  IconAward,
  IconChart,
  IconCheck,
  IconSparkle,
  IconTarget,
} from "@/components/icons";

const TUJUAN = [
  "Menjelaskan cara kerja topologi Bus, Ring, dan Star beserta karakteristik perangkatnya (backbone, terminator, switch).",
  "Memasang kabel pada lembar kerja teknik sesuai aturan arsitektur tiap topologi.",
  "Menganalisis dampak gangguan jaringan melalui simulasi pengiriman paket ping dan pencabutan kabel.",
  "Menggunakan Dashboard Learning Analytics untuk mengevaluasi proses belajar dan memilih latihan adaptif.",
  "Memanfaatkan Asisten Belajar AI secara kritis, terverifikasi (Ask AI, Then Think), dan transparan (5W+C).",
];

const LANGKAH = [
  {
    no: "1",
    judul: "Pre-Test Diagnostik (Opsional tapi Disarankan)",
    durasi: "± 5 menit",
    isi: [
      "Buka menu Kuis Akhir lalu pilih mode Pre-Test Diagnostik sebelum membaca materi.",
      "Hasil Pre-Test disimpan otomatis sebagai pembanding peningkatan skor (Pre-Test → Post-Test) pada Dashboard Analitik.",
    ],
  },
  {
    no: "2",
    judul: "Pelajari Materi & Tulis Cek Pemahaman",
    durasi: "± 10 menit",
    isi: [
      "Mulai dari Level 1 (Bus) berurutan ke Ring dan Star melalui Peta Misi.",
      "Eksplorasi tab Diagram Animasi, Narasi Audio (TTS), dan Video Ringkasan.",
      "Tulis jawabanmu sendiri pada bagian Cek Pemahaman sebelum membuka kunci — jawabanmu tersimpan sebagai bukti proses belajar.",
    ],
  },
  {
    no: "3",
    judul: "Pasang Kabel & Uji Gangguan di Sandbox",
    durasi: "± 10 menit",
    isi: [
      "Seret kabel dari palet ke perangkat tujuan pada Lembar Praktik (atau pakai keyboard: pilih kabel → pilih perangkat).",
      "Setelah selesai, buka Sandbox untuk mengirim paket ping, mencabut satu kabel, dan mengamati dampak gangguan tiap topologi.",
      "Akurasi pemasangan kabel dan uji gangguan tercatat otomatis sebagai Learning Data.",
    ],
  },
  {
    no: "4",
    judul: "Kerjakan Kuis Akhir & Latihan Adaptif",
    durasi: "± 12 menit",
    isi: [
      "Jawab 10 soal studi kasus di Kuis Akhir dan pelajari pembahasan tiap soal.",
      "Jika ada konsep dengan akurasi < 80%, ikuti rekomendasi Latihan Adaptif (3 soal terarah khusus topik lemah).",
    ],
  },
  {
    no: "5",
    judul: "Tinjau Dashboard Learning Analytics",
    durasi: "± 5 menit",
    isi: [
      "Buka menu Analitik untuk melihat 4 tingkat analisis: Descriptive (Progress vs Mastery), Diagnostic (Analisis Butir Soal), Predictive (Indikasi Dini Non-Labeling), dan Prescriptive (Rekomendasi Adaptif).",
      "Guru/penguji dapat beralih ke tab Tinjauan Kelas (Mode Guru) untuk melihat simulasi kelas 32 siswa dan analisis soal tersulit.",
    ],
  },
  {
    no: "6",
    judul: "Gunakan Asisten AI & Cetak Sertifikat",
    durasi: "± 8 menit",
    isi: [
      "Di menu Asisten AI, tulis dulu pemikiran awalmu (Langkah 0), susun prompt TCCO secara iteratif, lalu verifikasi hasilnya lewat checklist Ask AI, Then Think.",
      "Selesaikan Lab Deteksi Hallucination dan susun Pernyataan Transparansi 5W+C bila memakai bantuan AI.",
      "Buka halaman Sertifikat & Rapor (/cetak) untuk melihat kelayakan Sertifikat Kompetensi Digital dan mencetaknya sebagai PDF.",
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
              chapter="Modul penggunaan multimedia"
              title="Panduan belajar & penggunaan"
              lead="Urutan lengkap pemakaian Network Explorer dari Pre-Test, praktik kabel, simulasi, Dashboard Learning Analytics, Asisten AI, hingga cetak Sertifikat Kompetensi."
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

                <Callout tone="note" label="Panduan singkat untuk guru / pendidik">
                  Gunakan tab <strong>Tinjauan Kelas (Mode Guru)</strong> pada halaman Analitik
                  untuk meninjau soal tersulit dan merancang intervensi berbasis data, serta
                  gunakan mode <strong>Draft Guru</strong> di Asisten AI untuk menyusun draft studi
                  kasus dan rubrik. Ingat prinsip utama: data dan AI membantu keputusan pendidik,
                  bukan menggantikan <em>professional judgment</em> guru.
                </Callout>
              </div>

              <aside className="space-y-5">
                <div className="rounded-lg border border-border bg-surface p-5">
                  <p className="text-caption font-semibold text-ink">Target kelulusan sertifikat</p>
                  <p className="mt-2 text-caption leading-relaxed text-ink-2">
                    Tuntaskan 3 materi, 3 papan praktik, 3 simulasi, raih nilai kuis ≥ 80%, dan
                    simpan minimal 1 bukti proses (refleksi mandiri atau uji verifikasi AI).
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <BtnLink href="/misi" className="w-full">
                      <IconTarget size={14} /> Buka peta misi
                    </BtnLink>
                    <BtnLink href="/analitik" tone="signal" className="w-full">
                      <IconChart size={14} /> Dashboard Analitik
                    </BtnLink>
                    <BtnLink href="/asisten" tone="ghost" className="w-full">
                      <IconSparkle size={14} /> Asisten Belajar AI
                    </BtnLink>
                    <BtnLink href="/cetak" tone="ghost" className="w-full">
                      <IconAward size={14} /> Sertifikat & Rapor
                    </BtnLink>
                    <BtnLink href="/progres" tone="quiet" className="w-full">
                      <IconArrow size={14} /> Ringkasan progres
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
                    <li>Pencatatan Learning Analytics dapat dijeda, diekspor (JSON), atau dihapus di Pengaturan.</li>
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
