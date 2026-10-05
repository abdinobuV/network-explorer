import Link from "next/link";
import { Navbar, Footer } from "@/components/chrome";
import { TopoMini } from "@/components/topo";

export default function Beranda() {
  return (
    <div>
      <Navbar pub />
      <main className="mx-auto max-w-6xl px-4">
        <section id="tentang" className="grid gap-8 py-12 md:grid-cols-2 md:items-center">
          <div>
            <span className="chip">MISI JARINGAN • SMA KELAS XI</span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
              Bukan sekadar kabel. Ini tentang koneksi.
            </h1>
            <p className="mt-4 text-slate-400">
              Jelajahi topologi jaringan dari pola pertama hingga paket data. Belajar Bus, Ring, dan Star dengan
              cara yang bisa kamu lihat, coba, dan pahami.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/auth/signup" className="btn-cyan px-5 py-2.5 text-sm">Mulai Belajar →</Link>
              <Link href="/auth/login" className="btn-ghost px-5 py-2.5 text-sm">Masuk</Link>
            </div>
            <p className="mt-3 text-xs text-slate-500">Untuk pelajaran Informatika SMA kelas XI • Belajar bertahap</p>
          </div>
          <div className="card p-5">
            <div className="mb-2 flex justify-between text-[11px] text-slate-400"><span>● LAB EKSPLORASI</span><span>Pratinjau • Topologi Star</span></div>
            <div className="rounded-xl bg-[#0a1428] p-4"><TopoMini kind="star" /></div>
            <p className="mt-3 text-sm font-bold">Satu pusat, banyak koneksi.</p>
            <p className="text-xs text-slate-400">Pada Star, setiap komputer terhubung ke switch pusat. Ikuti jalurnya dan amati bagaimana data bergerak.</p>
          </div>
        </section>

        <section className="card p-6">
          <div className="text-xs font-bold text-[#00c2e0]">BELAJAR DENGAN PEMAHAMAN</div>
          <h2 className="text-2xl font-extrabold">Dari “apa itu?” menjadi “aku paham”.</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              ["Lihat pola, bukan hafalan", "Kenali susunan perangkat dan hubungan antarkomputer lewat diagram yang jelas."],
              ["Hubungkan teori dan praktik", "Susun jaringan, lalu telusuri jalur yang dilewati paket data."],
              ["Jelaskan alasan pilihanmu", "Bandingkan topologi untuk memilih rancangan yang sesuai kebutuhan sekolah."],
            ].map(([t, d]) => (
              <div key={t}><div className="font-bold">{t}</div><div className="text-sm text-slate-400">{d}</div></div>
            ))}
          </div>
        </section>

        <section id="topologi" className="py-10">
          <div className="text-xs font-bold text-[#00c2e0]">TIGA POLA, TIGA CARA TERHUBUNG</div>
          <h2 className="text-2xl font-extrabold">Kenali dunia Bus, Ring, dan Star.</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {(
              [
                ["bus", "Topologi Bus", "Komputer berbagi satu kabel utama atau backbone. Sederhana, tetapi gangguan pada kabel utama dapat melumpuhkan jaringan."],
                ["ring", "Topologi Ring", "Setiap komputer terhubung membentuk cincin. Pelajari urutan pengiriman data dan dampak gangguan pada jalurnya."],
                ["star", "Topologi Star", "Setiap komputer terhubung ke switch pusat. Bandingkan dampak putusnya satu kabel dengan gangguan pada switch."],
              ] as const
            ).map(([k, t, d]) => (
              <div key={k} className="card p-5">
                <div className="font-bold">{t}</div>
                <div className="mt-2 rounded-xl bg-[#0a1428] p-3"><TopoMini kind={k} /></div>
                <p className="mt-3 text-sm text-slate-400">{d}</p>
                <Link href={`/materi/${k}`} className="mt-2 inline-block text-sm text-[#22d3ee]">Buka materi →</Link>
              </div>
            ))}
          </div>
        </section>

        <section id="cara" className="card p-6">
          <div className="text-xs font-bold text-[#00c2e0]">CARA BELAJAR</div>
          <h2 className="text-2xl font-extrabold">Satu misi, empat langkah yang saling terhubung.</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {[
              ["01 →", "Materi", "Baca konsep dan amati diagram topologi.", "15 menit"],
              ["02 →", "Praktik", "Susun perangkat dan hubungkan kabel.", "15 menit"],
              ["03 →", "Simulasi", "Uji paket data dan amati gangguan.", "10 menit"],
              ["04", "Kuis", "Terapkan pemahaman pada soal dan kasus.", "10 menit"],
            ].map(([n, t, d, w]) => (
              <div key={t} className="rounded-xl border border-white/10 bg-[#0a1428] p-4">
                <div className="flex justify-between text-xs text-slate-400"><span>▣</span><span>{n}</span></div>
                <div className="mt-2 font-bold">{t}</div>
                <div className="text-sm text-slate-400">{d}</div>
                <div className="mt-2 text-xs text-[#00c2e0]">{w}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 py-10 md:grid-cols-2">
          <div className="card p-5">
            <div className="mb-2 flex justify-between text-[11px] text-slate-400"><span>CONTOH SIMULASI</span><span>Topologi Star</span></div>
            <div className="rounded-xl bg-[#0a1428] p-3"><TopoMini kind="star" /></div>
            <div className="mt-3 rounded-lg bg-[#00c2e0]/10 p-3 text-xs text-[#22d3ee]">💡 Jika kabel PC 01 terputus, apakah PC lain masih bisa bertukar data?</div>
          </div>
          <div>
            <div className="text-xs font-bold text-[#00c2e0]">COBA, AMATI, JELASKAN</div>
            <h2 className="text-2xl font-extrabold">Bagaimana jika satu koneksi terputus?</h2>
            <ul className="mt-3 space-y-3 text-sm text-slate-300">
              <li>→ <b>Amati rancangan</b><br /><span className="text-slate-400">Kenali perangkat pusat dan jalur kabelnya.</span></li>
              <li>→ <b>Uji sebuah kondisi</b><br /><span className="text-slate-400">Bandingkan jaringan normal dengan kabel yang terputus.</span></li>
              <li>→ <b>Tarik kesimpulan</b><br /><span className="text-slate-400">Jelaskan mengapa dampaknya berbeda pada setiap topologi.</span></li>
            </ul>
          </div>
        </section>

        <section id="faq" className="py-6">
          <h2 className="text-2xl font-extrabold">Sebelum memulai misi.</h2>
          <div className="mt-4 space-y-3">
            {[
              ["Untuk siapa MISI TOPOLOGI?", "Untuk siswa SMA kelas XI yang sedang mempelajari topologi jaringan dalam pelajaran Informatika."],
              ["Apakah harus sudah memahami jaringan?", "Tidak. Mulai dari materi dasar, lalu ikuti praktik, simulasi, dan kuis secara bertahap."],
              ["Apa yang tersedia setelah masuk?", "Materi Bus, Ring, dan Star, aktivitas praktik, Sandbox Jaringan, kuis, serta catatan progres belajarmu."],
              ["Bisakah materi dan latihan diulang?", "Ya. Kembali ke materi atau latihan saat ingin memperjelas konsep yang belum dipahami."],
            ].map(([q, a]) => (
              <details key={q} className="card p-4">
                <summary className="cursor-pointer font-bold">{q}</summary>
                <p className="mt-2 text-sm text-slate-400">{a}</p>
              </details>
            ))}
          </div>
          <div className="card mt-6 flex flex-col items-start justify-between gap-4 border-[#00c2e0]/50 p-6 md:flex-row md:items-center">
            <div>
              <div className="chip">MISI PERTAMAMU MENUNGGU</div>
              <div className="mt-2 text-xl font-extrabold">Siap memahami setiap koneksi?</div>
            </div>
            <div className="flex gap-3">
              <Link href="/auth/signup" className="btn-cyan px-6 py-2.5 text-sm">Mulai Belajar →</Link>
              <Link href="/auth/login" className="btn-ghost px-6 py-2.5 text-sm">Masuk ke Akun</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
