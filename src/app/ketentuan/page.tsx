import Link from "next/link";
import { Container, PageHeader } from "@/components/ui";
import { Footer, Navbar } from "@/components/chrome";

const PASAL = [
  {
    no: "1",
    judul: "Tentang aplikasi ini",
    isi: [
      "1.1 Misi Topologi (Network Explorer) adalah media belajar mandiri mata pelajaran Informatika kelas XI dengan topik topologi jaringan.",
      "1.2 Aplikasi ini merupakan prototipe tugas mata kuliah dan tidak menyediakan layanan komersial.",
    ],
  },
  {
    no: "2",
    judul: "Ketentuan belajar",
    isi: [
      "2.1 Progres, XP, dan lencana disimpan untuk keperluan pemantauan belajar pribadi.",
      "2.2 Nilai kuis yang ditampilkan merupakan hasil latihan mandiri dan tidak memengaruhi nilai rapor resmi sekolah.",
      "2.3 Materi video bersumber dari YouTube dan tunduk pada ketentuan layanan YouTube.",
    ],
  },
  {
    no: "3",
    judul: "Konten dan materi",
    isi: [
      "3.1 Seluruh teks, skema, dan soal latihan dalam aplikasi disusun oleh kelompok pengembang.",
      "3.2 Skema jaringan dan lembar kerja boleh digunakan untuk keperluan belajar pribadi maupun diskusi kelas.",
    ],
  },
  {
    no: "4",
    judul: "Perubahan ketentuan",
    isi: [
      "4.1 Ketentuan dapat diperbarui sewaktu-waktu sesuai perkembangan aplikasi; tanggal berlaku tercantum di bagian atas halaman ini.",
      "4.2 Perubahan yang memengaruhi hak pengguna diumumkan pada halaman beranda aplikasi.",
    ],
  },
];

export default function KetentuanPage() {
  return (
    <div className="bg-canvas">
      <Navbar pub />
      <Container width="narrow" className="py-10">
        <PageHeader
          chapter="Dokumen aplikasi"
          title="Ketentuan penggunaan"
          lead="Aturan singkat yang berlaku saat memakai Misi Topologi."
          meta="Berlaku sejak 1 November 2026"
        />

        <div className="mt-8 space-y-6">
          {PASAL.map((p) => (
            <section key={p.no} className="rounded-lg border border-border bg-surface p-5">
              <h2 className="font-display text-title">
                <span className="mr-2 font-mono text-caption text-signal-bright">{p.no}.</span>
                {p.judul}
              </h2>
              <ul className="mt-3 space-y-2">
                {p.isi.map((t) => (
                  <li key={t} className="text-caption leading-relaxed text-ink-2">
                    {t}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <Link
          href="/beranda"
          className="mt-8 inline-block border-t border-border pt-6 text-caption font-medium text-signal-bright hover:underline"
        >
          Kembali ke beranda
        </Link>
      </Container>
      <Footer />
    </div>
  );
}
