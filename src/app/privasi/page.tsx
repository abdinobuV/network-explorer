import Link from "next/link";
import { Navbar, Footer } from "@/components/chrome";

export default function Privasi() {
  return (
    <div>
      <Navbar pub />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="text-xs font-bold text-[#00c2e0]">MISI TOPOLOGI • DOKUMEN</div>
        <h1 className="mt-1 text-3xl font-extrabold">Kebijakan Privasi</h1>
        <div className="card mt-5 space-y-4 p-6 text-sm text-slate-300">
          <p>
            MISI TOPOLOGI adalah media pembelajaran Informatika SMA Kelas XI. Dokumen ringkas ini menjelaskan
            data apa yang kami simpan saat kamu memakai aplikasi.
          </p>
          <div>
            <b className="text-white">1. Data yang disimpan</b>
            <p className="mt-1 text-slate-400">
              Nama tampilan, email, dan kelas (dari pendaftaran atau akun Google), serta progres belajar (materi
              dibaca, XP, dan skor kuis). Data ini tersimpan di browser perangkatmu (localStorage) dan, jika masuk
              dengan Google, sesi login dikelola lewat penyedia identitas Google.
            </p>
          </div>
          <div>
            <b className="text-white">2. Penggunaan data</b>
            <p className="mt-1 text-slate-400">
              Data hanya dipakai untuk menampilkan progres belajarmu (level, lencana, riwayat aktivitas). Tidak ada
              iklan, pelacakan lintas situs, atau penjualan data.
            </p>
          </div>
          <div>
            <b className="text-white">3. Kontrol kamu</b>
            <p className="mt-1 text-slate-400">
              Kamu bisa keluar kapan pun lewat Pengaturan Akun dan menghapus data lokal dengan membersihkan data
              situs di browser. Untuk akun Google, kelola akses aplikasi lewat pengaturan Akun Google-mu.
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
