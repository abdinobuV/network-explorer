"use client";
import Link from "next/link";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { TopoMini } from "@/components/topo";
import { useAuth, useProg } from "@/lib/store";

export default function Progres() {
  const { user } = useAuth();
  const { xp, done, quizBest } = useProg();
  const stepsDone = 4 + Object.keys(done).length + (quizBest !== null ? 1 : 0);
  const total = 12;
  const pct = Math.min(100, Math.round((stepsDone / total) * 100));
  return (
    <RequireAuth>
    <div>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-xs font-bold text-[#00c2e0]">PROGRES BELAJAR • LEVEL 4</div>
        <h1 className="text-3xl font-extrabold">Terus melaju, {user?.name ?? "Siswa Navigator"}!</h1>
        <p className="text-slate-400">Kamu sudah menyelesaikan {stepsDone} dari {total} tahap belajar. Satu misi lagi untuk menuntaskan Ring.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_340px]">
          <div className="card grid gap-6 border-[#00c2e0]/50 p-6 md:grid-cols-3">
            <div><div className="text-3xl font-black text-[#22d3ee]">{pct}%</div><div className="text-xs text-slate-400">Progres keseluruhan</div>
              <div className="mt-2 h-1.5 rounded bg-white/10"><div className="h-full rounded bg-[#00c2e0]" style={{ width: `${pct}%` }} /></div></div>
            <div><div className="text-3xl font-black">{stepsDone} / {total}</div><div className="text-xs text-slate-400">Tahap diselesaikan</div></div>
            <div><div className="text-3xl font-black">45 menit</div><div className="text-xs text-slate-400">Waktu belajar tercatat</div></div>
          </div>
          <div className="card p-5">
            <div className="font-bold">🏳 Misi berikutnya: Kuis Ring</div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400"><span>5 soal • ±5 menit</span>
              <Link href="/kuis" className="btn-neon px-4 py-2 text-sm">Lanjutkan Belajar →</Link></div>
            {quizBest !== null && <p className="mt-2 text-xs text-[#00e676]">Skor kuis terbaikmu: {quizBest}/10</p>}
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {(
            [
              ["Topologi Bus", "Selesai", "4 dari 4 tahap selesai", 100, "bus"],
              ["Topologi Ring", "Sedang dipelajari", "3 dari 4 tahap selesai", 75, "ring"],
              ["Topologi Star", "Baru dimulai", "1 dari 4 tahap selesai", 25, "star"],
            ] as const
          ).map(([t, s, d, p, k]) => (
            <div key={t} className="card p-5">
              <div className="flex items-center justify-between"><b className="text-lg">{t}</b><span className="chip">{s}</span></div>
              <div className="mt-2 rounded-xl bg-[#0a1428] p-2"><TopoMini kind={k} /></div>
              <div className="mt-2 flex justify-between text-xs text-slate-400"><span>{d}</span><span className="text-[#22d3ee] font-bold">{p}%</span></div>
              <div className="mt-1 h-1.5 rounded bg-white/10"><div className="h-full rounded bg-[#00c2e0]" style={{ width: `${p}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="card p-5">
            <h3 className="font-extrabold">Pencapaianmu</h3>
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div><div className="text-2xl">🎖</div><b>Penjelajah Bus</b><div className="text-xs text-slate-400">Semua tahap Bus selesai</div></div>
              <div><div className="text-2xl">⚡</div><b>Pengirim Paket</b><div className="text-xs text-slate-400">Uji aliran data pertama</div></div>
              <div className="opacity-50"><div className="text-2xl">🔒</div><b>Ahli Topologi</b><div className="text-xs text-slate-400">Selesaikan 3 topologi</div></div>
            </div>
          </div>
          <div className="card p-5">
            <h3 className="font-extrabold">Aktivitas terbaru</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex justify-between"><span>Materi Star dibaca</span><span className="text-xs text-slate-400">Hari ini, 10.25</span></li>
              <li className="flex justify-between"><span>Simulasi Ring diselesaikan</span><span className="text-xs text-slate-400">Hari ini, 10.12</span></li>
              <li className="flex justify-between"><span>Praktik Bus diselesaikan</span><span className="text-xs text-slate-400">Kemarin, 14.30</span></li>
            </ul>
          </div>
        </div>
      </main>
      <Footer help />
    </div>
    </RequireAuth>
  );
}
