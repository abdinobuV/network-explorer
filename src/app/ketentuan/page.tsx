import Link from "next/link";
import { Navbar, Footer } from "@/components/chrome";

export default function Ketentuan() {
  return (
    <div>
      <Navbar pub />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="text-xs font-bold text-[#00c2e0]">MISI TOPOLOGI • DOKUMEN</div>
        <h1 className="mt-1 text-3xl font-extrabold">Ketentuan Penggunaan</h1>
        <div className="card mt-5 space-y-4 p-6 text-sm text-slate-300">
          <div>
            <b className="text-white">1. Tujuan pemakaian</b>
            <p className="mt-1 text-slate-400">
              Aplikasi ini dibuat untuk pembelajaran topologi jaringan (Bus, Ring, Star) pada mata pelajaran
              Informatika SMA Kelas XI. Gunakan sebagaimana mestinya untuk belajar.
            </p>
          </div>
          <div>
            <b className="text-white">2. Akun</b>
            <p className="mt-1 text-slate-400">
              Kamu bertanggung jawab menjaga kerahasiaan kata sandimu. Jangan bagikan kredensial kepada siapa pun.
              Satu akun untuk satu pengguna.
            </p>
          </div>
          <div>
            <b className="text-white">3. Konten</b>
            <p className="mt-1 text-slate-400">
              Materi, diagram, dan soal disediakan untuk keperluan edukasi. Nilai dan XP di aplikasi adalah bagian
              dari gamifikasi belajar, bukan nilai rapor resmi.
            </p>
          </div>
          <div>
            <b className="text-white">4. Perubahan</b>
            <p className="mt-1 text-slate-400">
              Ketentuan ini dapat diperbarui mengikuti kebutuhan pembelajaran. Penggunaan berkelanjutan berarti kamu
              menyetujui versi terbaru.
            </p>
          </div>
          <p className="text-xs text-slate-500">Terakhir diperbarui: Oktober 2026 • Dokumen contoh untuk keperluan UTS.</p>
        </div>
        <Link href="/beranda" className="mt-4 inline-block text-sm text-[#22d3ee]">← Kembali ke Beranda</Link>
      </main>
      <Footer />
    </div>
  );
}
