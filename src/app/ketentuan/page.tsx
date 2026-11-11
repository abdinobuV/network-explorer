import Link from "next/link";
import { Container, PageHeader } from "@/components/ui";
import { Footer, Navbar } from "@/components/chrome";

const PASAL = [
  {
    no: "1",
    judul: "Tentang aplikasi ini",
    isi: [
      "1.1 Network Explorer adalah bahan belajar mandiri mata Informatika kelas XI, topik topologi jaringan.",
      "1.2 Aplikasi ini adalah prototipe tugas mata pelajaran; tidak提供服务 komersial.",
    ],
  },
  {
    no: "2",
    judul: "Ketentuan belajar",
    isi: [
      "2.1 Progres, XP, dan lencana disimpan untuk keperluan belajar pribadi.",
      "2.2 Nilai kuis yang ditampilkan adalah hasil kerja sendiri; aplikasi tidak memengaruhi nilai rapor resmi.",
      "2.3 Materi video bersumber dari YouTube dan tunduk pada ketentuan YouTube masing-masing.",
    ],
  },
  {
    no: "3",
    judul: "Konten dan materi",
    isi: [
      "3.1 Seluruh teks, gambar, dan diagram dalam aplikasi dibuat oleh kelompok pengembang.",
      "3.2 Materi video bersumber dari YouTube dan tunduk pada ketentuan YouTube masing-masing.",
      "3.3 Seluruh gambar teknik dan soal di dalam aplikasi dibuat oleh kelompok pengembang dan boleh dipakai untuk keperluan belajar pribadi.",
    ],
  },
  {
    no: "4",
    judul: "Perubahan ketentuan",
    isi: [
      "4.1 Ketentuan dapat diperbarui sewaktu-waktu; tanggal berlaku tercantum di bagian atas halaman ini.",
      "4.2 Perubahan yang memengaruhi hak pengguna diumumkan pada halaman muka aplikasi.",
    ],
  },
];

export default function KetentuanPage() {
  return (
    <div>
      <Navbar pub />
      <Container width="narrow" className="py-10">
        <PageHeader
          chapter="Dokumen aplikasi"
          title="Ketentuan penggunaan"
          lead="Aturan singkat yang berlaku saat memakai Network Explorer."
          meta="Berlaku sejak 1 November 2026"
        />

        <div className="mt-8 space-y-6">
          {PASAL.map((p) => (
            <section key={p.no}>
              <h2 className="font-serif text-title">
                <span className="font-mono text-caption text-ink-3">{p.no}.</span> {p.judul}
              </h2>
              <ul className="mt-2 space-y-1.5">
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
          className="mt-10 inline-block border-t border-rule pt-5 font-mono text-caption uppercase tracking-[0.12em] text-blueprint hover:underline"
        >
          ← Kembali
        </Link>
      </Container>
      <Footer />
    </div>
  );
}
