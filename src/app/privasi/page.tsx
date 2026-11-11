import Link from "next/link";
import { Container, Eyebrow, PageHeader } from "@/components/ui";
import { Footer, Navbar } from "@/components/chrome";

const BAGIAN = [
  {
    no: "1",
    judul: "Data yang dikumpulkan",
    isi: [
      "1.1 Nama lengkap dan kelas — untuk mengenali laporan progres pribadi.",
      "1.2 Alamat email — untuk masuk ke aplikasi dan menerima tautan pengaturan ulang kata sandi.",
      "1.3 Progres belajar —XP, tahap yang telah diselesaikan, dan nilai kuis—disimpan pada perambanmu dan, bila kamu masuk dengan akun Google, pada basis data milik kelompok.",
    ],
  },
  {
    no: "2",
    judul: "Penggunaan data",
    isi: [
      "2.1 Data dipakai hanya untuk menampilkan progres belajarmu di dalam aplikasi.",
      "2.2 Tidak ada data yang dijual, disewakan, atau dibagikan kepada pihak ketiga untuk keperluan pemasaran.",
      "2.3 Video pembelajaran diputar dari YouTube; pemutar tersebut berjalan dengan mode tanpa cookie (youtube-nocookie.com).",
    ],
  },
  {
    no: "3",
    judul: "Penyimpanan dan penghapusan",
    isi: [
      "3.1 Progres yang belum terhubung ke akun disimpan pada penyimpanan lokal peramban dan hilang bila data peramban dihapus.",
      "3.2 Progres yang terhubung ke akun disimpan pada basis data Firebase proyek kelompok.",
      "3.3 Kamu dapat menghapus seluruh progres kapan saja melalui halaman Pengaturan, lalu menghapus akun melalui tombollogout di halaman yang sama.",
    ],
  },
  {
    no: "4",
    judul: "Mode demo",
    isi: [
      "4.1 Bila Firebase belum dikonfigurasi, aplikasi berjalan dalam mode demo: seluruh akun dan progres hanya berada di perambanmu.",
      "4.2 Pada mode demo, kata sandi disimpan sebagai sidik digital (hash), bukan sebagai teks biasa, dan tidak pernah dikirim ke server mana pun.",
    ],
  },
];

export default function PrivasiPage() {
  return (
    <div>
      <Navbar pub />
      <Container width="narrow" className="py-10">
        <PageHeader
          chapter="Dokumen aplikasi"
          title="Kebijakan privasi"
          lead="Ringkasan cara aplikasi ini menangani data yang kamu masukkan."
          meta="Berlaku sejak 1 November 2026"
        />

        <div className="mt-8 space-y-6">
          {BAGIAN.map((b) => (
            <section key={b.no}>
              <h2 className="font-serif text-title">
                <span className="font-mono text-caption text-ink-3">{b.no}.</span> {b.judul}
              </h2>
              <ul className="mt-2 space-y-1.5">
                {b.isi.map((p) => (
                  <li key={p} className="text-caption leading-relaxed text-ink-2">
                    {p}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-10 border-t border-rule pt-5">
          <Eyebrow>Pertanyaan</Eyebrow>
          <p className="mt-2 text-caption text-ink-2">
            Untuk pertanyaan mengenai data pribadi, hubungi kelompok pengembang melalui alamat
            email yang tercantum pada halaman muka aplikasi.
          </p>
          <Link
            href="/beranda"
            className="mt-4 inline-block font-mono text-caption uppercase tracking-[0.12em] text-blueprint hover:underline"
          >
            ← Kembali
          </Link>
        </div>
      </Container>
      <Footer />
    </div>
  );
}
