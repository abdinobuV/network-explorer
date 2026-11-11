import Link from "next/link";
import { Container, Eyebrow, Paper } from "@/components/ui";
import { Footer, Navbar } from "@/components/chrome";
import { TopoMini } from "@/components/topo";
import { TOPOLOGI } from "@/lib/data";
import { TOPO_SPECS } from "@/lib/topology-model";

const LANGKAH = [
  {
    no: "01",
    judul: "Baca babnya",
    isi: "Materi singkat per topologi: cara kerja, kelebihan, kekurangan, dan satu soal pemahaman.",
  },
  {
    no: "02",
    judul: "Pasang kabelnya",
    isi: "Di lembar kerja teknik, tarik kabel ke perangkat yang benar. Aturan pemasangan berbeda tiap topologi.",
  },
  {
    no: "03",
    judul: "Uji jaringannya",
    isi: "Kirim data pada sandbox, putus satu kabel, dan amati dampaknya terhadap yang lain.",
  },
  {
    no: "04",
    judul: "Tunjukkan pemahamanmu",
    isi: "Sepuluh soal studi kasus di kuis akhir, lengkap dengan pembahasan setiap jawaban.",
  },
];

const FAQ = [
  {
    t: "Apakah ini nilai rapor resmi?",
    j: "Tidak. Ini bahan belajar mandiri. Nilainya hanya untuk menunjukkan pemahamanmu sendiri.",
  },
  {
    t: "Apakah harus terhubung internet?",
    j: "Tidak untuk modul yang sudah kamu buka. Mode demo menyimpan seluruh progres di perambanmu sendiri.",
  },
  {
    t: "Kenapa aturan pemasangan tiap topologi berbeda?",
    j: "Karena itulah bedanya. Bus butuh satu backbone, Ring membentuk lingkaran tertutup, Star butuh switch pusat.",
  },
  {
    t: "Bisa diulang?",
    j: "Bisa. Kuis boleh diulang, tetapi XP hanya bertambah bila nilaimu menjadi rekor baru.",
  },
];

export default function BerandaPage() {
  return (
    <div>
      <Navbar pub />

      <Container width="page">
        {/* Hero */}
        <section className="grid items-center gap-10 py-14 lg:grid-cols-2">
          <div>
            <Eyebrow>Buku Praktis Topologi Jaringan</Eyebrow>
            <h1 className="mt-4 font-serif text-chapter leading-[1.08]">
              Pahami topologi
              <br />
              dengan <span className="text-blueprint">menyalurkan</span> kabel.
            </h1>
            <p className="mt-5 max-w-lg text-lead text-ink-2">
              Tiga bab materi, tiga lembar kerja pemasangan kabel, dan satu simulasi jaringan. Bukan
              tangkapan layar — kamu benar-benar merangkai jaringan di sini.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/auth/signup"
                className="inline-flex items-center rounded-xs border border-ink bg-ink px-5 py-2.5 font-mono text-caption uppercase tracking-[0.12em] text-paper hover:bg-ink-2"
              >
                Mulai belajar
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center rounded-xs border border-rule-2 px-5 py-2.5 font-mono text-caption uppercase tracking-[0.12em] text-ink hover:border-ink hover:bg-paper-2"
              >
                Masuk
              </Link>
            </div>
          </div>

          <div className="border border-rule bg-paper-2 p-5">
            <div className="drafting-grid border border-rule p-3">
              <TopoMini kind="bus" />
            </div>
            <p className="mt-3 font-mono text-micro uppercase tracking-[0.12em] text-ink-3">
              Gambar 1 — Topologi Bus: satu backbone, banyak cabang
            </p>
          </div>
        </section>

        {/* Tiga pilar */}
        <section id="tentang" className="border-t border-rule py-12">
          <Eyebrow>Tiga bagian</Eyebrow>
          <div className="mt-6 grid gap-px bg-rule md:grid-cols-3">
            {[
              ["Materi", "Tiga bab ringkas yang bisa dibaca sebagai buku teks."],
              ["Praktik", "Pasang kabel sendiri dengan aturan tiap topologi."],
              ["Evaluasi", "Kuis studi kasus dengan pembahasan tiap soal."],
            ].map(([judul, isi], i) => (
              <div key={judul} className="bg-paper p-6">
                <p className="font-mono text-micro uppercase tracking-[0.14em] text-ink-4">
                  0{i + 1}
                </p>
                <h2 className="mt-2 font-serif text-title">{judul}</h2>
                <p className="mt-2 text-caption text-ink-2">{isi}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Topologi */}
        <section id="topologi" className="border-t border-rule py-12">
          <Eyebrow>Isi buku</Eyebrow>
          <h2 className="mt-3 font-serif text-head">Tiga bab yang tersedia</h2>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {(Object.keys(TOPOLOGI) as Array<keyof typeof TOPOLOGI>).map((key) => {
              const t = TOPOLOGI[key];
              const spec = TOPO_SPECS[key];
              return (
                <Paper key={key} className="flex flex-col p-5">
                  <p className="font-mono text-micro uppercase tracking-[0.14em] text-blueprint">
                    Bab {String(Object.keys(TOPOLOGI).indexOf(key) + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1 font-serif text-title">{t.title}</h3>
                  <p className="mt-2 text-caption text-ink-2">{t.desc}</p>
                  <div className="drafting-grid mt-4 border border-rule p-2">
                    <TopoMini kind={key} />
                  </div>
                  <p className="mt-3 font-mono text-micro text-ink-3">{spec.rule}</p>
                </Paper>
              );
            })}
          </div>
        </section>

        {/* Cara belajar */}
        <section id="cara" className="border-t border-rule py-12">
          <Eyebrow>Cara belajar</Eyebrow>
          <h2 className="mt-3 font-serif text-head">Empat langkah, satu siklus</h2>
          <ol className="mt-6 grid gap-px bg-rule md:grid-cols-4">
            {LANGKAH.map((l) => (
              <li key={l.no} className="bg-paper p-5">
                <p className="font-mono text-caption text-blueprint">{l.no}</p>
                <h3 className="mt-2 font-serif text-title">{l.judul}</h3>
                <p className="mt-2 text-caption text-ink-2">{l.isi}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-rule py-12">
          <Eyebrow>Pertanyaan umum</Eyebrow>
          <h2 className="mt-3 font-serif text-head">Sebelum mulai</h2>
          <div className="mt-6 divide-y divide-rule border border-rule">
            {FAQ.map((f) => (
              <details key={f.t} className="group bg-paper">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-3.5 text-caption font-medium text-ink marker:hidden">
                  {f.t}
                  <span className="font-mono text-micro text-ink-3 group-open:hidden">+</span>
                  <span className="hidden font-mono text-micro text-ink-3 group-open:inline">−</span>
                </summary>
                <p className="border-t border-rule-3 px-5 py-3.5 text-caption text-ink-2">{f.j}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-rule py-14">
          <div className="flex flex-col items-start justify-between gap-5 border border-rule bg-paper-2 p-8 md:flex-row md:items-center">
            <div>
              <h2 className="font-serif text-head">Siap merangkai?</h2>
              <p className="mt-2 max-w-md text-caption text-ink-2">
                Daftar sekali, lalu kerjakan ketiga bab beserta lembar praktiknya. Progresmu
                tersimpan otomatis.
              </p>
            </div>
            <Link
              href="/auth/signup"
              className="inline-flex shrink-0 items-center rounded-xs border border-ink bg-ink px-6 py-3 font-mono text-caption uppercase tracking-[0.12em] text-paper hover:bg-ink-2"
            >
              Buat akun belajar
            </Link>
          </div>
        </section>
      </Container>

      <Footer />
    </div>
  );
}
