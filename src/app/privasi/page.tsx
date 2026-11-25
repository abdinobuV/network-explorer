import Link from "next/link";
import { Container, PageHeader } from "@/components/ui";
import { Footer, Navbar } from "@/components/chrome";

const BAGIAN = [
  {
    no: "1",
    judul: "Data yang dikumpulkan",
    isi: [
      "1.1 Nama lengkap dan kelas digunakan untuk mengenali laporan progres pribadi.",
      "1.2 Alamat email digunakan untuk masuk ke aplikasi dan menerima tautan pengaturan ulang kata sandi.",
      "1.3 Progres belajar (XP, tahap selesai, dan nilai kuis) disimpan pada perambanmu dan, bila masuk dengan akun Firebase/Google, pada basis data proyek kelompok.",
    ],
  },
  {
    no: "2",
    judul: "Penggunaan data",
    isi: [
      "2.1 Data dipakai hanya untuk menampilkan progres belajarmu di dalam aplikasi.",
      "2.2 Tidak ada data yang dijual, disewakan, atau dibagikan kepada pihak ketiga untuk keperluan pemasaran.",
      "2.3 Video pembelajaran diputar dari YouTube menggunakan mode tanpa cookie (youtube-nocookie.com).",
    ],
  },
  {
    no: "3",
    judul: "Penyimpanan dan penghapusan",
    isi: [
      "3.1 Progres yang belum terhubung ke akun disimpan pada penyimpanan lokal peramban dan hilang bila data peramban dihapus.",
      "3.2 Progres yang terhubung ke akun disimpan pada basis data Firebase proyek kelompok.",
      "3.3 Kamu dapat menghapus seluruh progres kapan saja melalui halaman Pengaturan, lalu keluar dari akun melalui tombol Keluar di halaman yang sama.",
    ],
  },
  {
    no: "4",
    judul: "Mode demo",
    isi: [
      "4.1 Bila Firebase belum dikonfigurasi, aplikasi berjalan dalam mode demo: seluruh akun dan progres hanya berada di perambanmu.",
      "4.2 Pada mode demo, kata sandi disimpan sebagai sidik digital (hash), bukan teks biasa, dan tidak dikirim ke server mana pun.",
    ],
  },
  {
    no: "5",
    judul: "Learning Analytics, privasi, dan etika data",
    isi: [
      "5.1 Data pembelajaran adalah data pengguna: aplikasi mencatat jejak belajar (waktu akses modul, akurasi praktik kabel, riwayat pre-test/post-test, dan refleksi) semata-mata untuk memberikan umpan balik dan rekomendasi adaptif.",
      "5.2 Transparansi & kendali penuh (Access Control): siswa dapat meninjau seluruh jejak datanya, mengekspor dalam format JSON, menjeda pencatatan, atau menghapus data analitik kapan saja di halaman Dashboard Analitik (/analitik) atau Pengaturan.",
      "5.3 Prinsip non-labeling: indikator prediktif hanya bersifat indikasi awal (bukan kepastian dan bukan label kemampuan siswa). Data membantu keputusan guru, bukan menggantikan professional judgment pendidik.",
    ],
  },
  {
    no: "6",
    judul: "Penggunaan Generative AI yang bertanggung jawab",
    isi: [
      "6.1 Asisten Belajar AI dirancang untuk membantu proses berpikir (Explain, Example, Practice, Feedback, Compare, Reflect) dan tidak menggantikan kontribusi intelektual siswa.",
      "6.2 Secara bawaan, Asisten Belajar AI berjalan dengan mesin pedagogis lokal tanpa mengirim data pribadi ke layanan AI eksternal. Jika pengelola mengaktifkan API Generative AI di server, hanya isi prompt pembelajaran (tanpa email/sandi) yang dikirim.",
      "6.3 Output AI bukan otomatis benar: aplikasi menyediakan protokol verifikasi Ask AI, Then Think dan generator Pernyataan Transparansi 5W+C untuk menjaga integritas akademik.",
    ],
  },
];

export default function PrivasiPage() {
  return (
    <div className="bg-canvas">
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
            <section key={b.no} className="rounded-lg border border-border bg-surface p-5">
              <h2 className="font-display text-title">
                <span className="mr-2 font-mono text-caption text-signal-bright">{b.no}.</span>
                {b.judul}
              </h2>
              <ul className="mt-3 space-y-2">
                {b.isi.map((p) => (
                  <li key={p} className="text-caption leading-relaxed text-ink-2">
                    {p}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <p className="text-caption text-ink-2">
            Untuk pertanyaan mengenai data pribadi, hubungi kelompok pengembang melalui informasi
            kontak mata kuliah.
          </p>
          <Link
            href="/beranda"
            className="mt-4 inline-block text-caption font-medium text-signal-bright hover:underline"
          >
            Kembali ke beranda
          </Link>
        </div>
      </Container>
      <Footer />
    </div>
  );
}
