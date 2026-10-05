import Link from "next/link";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";

export default function Panduan() {
  return (
    <RequireAuth>
    <div>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-xs font-bold text-[#00c2e0]">PANDUAN • SMA KELAS XI</div>
        <h1 className="text-3xl font-extrabold">Siap memulai misi jaringan?</h1>
        <p className="text-slate-400">Ikuti langkah belajar ini untuk memahami bagaimana komputer terhubung dan bertukar data.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_340px]">
          <div className="card p-6">
            <h3 className="text-lg font-extrabold">Tujuan pembelajaran</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li>✅ Mengenali struktur dan aliran data pada topologi Bus, Ring, dan Star.</li>
              <li>✅ Membandingkan kebutuhan perangkat, kelebihan, dan risiko gangguan.</li>
              <li>✅ Memilih topologi yang sesuai untuk kebutuhan jaringan sekolah.</li>
            </ul>
          </div>
          <div className="card border-[#00c2e0] p-6">
            <span className="chip">MISI PEMULA</span>
            <h3 className="mt-2 text-xl font-extrabold">Belajar bertahap, bukan menghafal.</h3>
            <p className="mt-1 text-sm text-slate-400">Amati pola jaringan, coba sendiri, lalu jelaskan alasanmu. Kesalahan saat latihan adalah bagian dari belajar.</p>
            <p className="mt-2 text-xs text-[#22d3ee]">Estimasi satu sesi: 50 menit • 3 topologi</p>
          </div>
        </div>
        <h2 className="mt-8 text-lg font-extrabold">Urutan belajarmu</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-4">
          {[
            ["📖 01 →", "Materi", "Kenali struktur Bus, Ring, dan Star melalui diagram dan penjelasan.", "15 menit", "/misi"],
            ["🔌 02 →", "Praktik", "Susun perangkat dan hubungkan kabel sesuai pola topologi.", "15 menit", "/praktik/star"],
            ["✈ 03 →", "Simulasi", "Uji pengiriman paket dan amati dampak kabel yang terputus.", "10 menit", "/sandbox"],
            ["📋 04", "Kuis", "Terapkan pemahamanmu pada soal dan kasus jaringan.", "10 menit", "/kuis"],
          ].map(([i, t, d, w, h]) => (
            <Link key={t} href={h} className="card p-5 hover:border-[#00c2e0]">
              <div className="flex justify-between text-sm text-slate-400"><span>{i}</span></div>
              <div className="mt-2 font-extrabold">{t}</div>
              <div className="text-sm text-slate-400">{d}</div>
              <div className="mt-2 text-xs text-[#22d3ee]">{w}</div>
            </Link>
          ))}
        </div>
        <div className="mt-5 flex gap-3 text-sm">
          <span className="text-[#22d3ee]">ⓘ</span>
          <p><b>Cara menggunakan website</b><br /><span className="text-slate-400">Pilih topologi di Misi Utama. Baca materi sebelum praktik, gunakan Sandbox Jaringan untuk menguji aliran data, lalu cek Progres Belajar. Istilah yang belum dikenal bisa kamu cari di Glosarium & Bantuan.</span></p>
        </div>
      </main>
      <div className="border-t border-white/10 bg-[#0c1d3a]">
        <div className="mx-auto flex max-w-7xl justify-end gap-3 px-4 py-3">
          <Link href="/misi" className="btn-ghost px-5 py-2 text-sm">Kembali ke Menu</Link>
          <Link href="/misi" className="btn-neon px-5 py-2 text-sm">Mulai Belajar →</Link>
        </div>
      </div>
    </div>
    </RequireAuth>
  );
}
