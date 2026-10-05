"use client";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { QUIZ } from "@/lib/data";
import { useProg } from "@/lib/store";

function HasilInner() {
  const sp = useSearchParams();
  const { xp } = useProg();
  let score = Number(sp.get("score") ?? NaN);
  let stored: { score: number; total: number } | null = null;
  try { stored = JSON.parse(localStorage.getItem("misi-quiz-last") || "null"); } catch {}
  if (Number.isNaN(score)) score = stored?.score ?? 4;
  const total = Number(sp.get("total") ?? stored?.total ?? QUIZ.length);
  const level = 4 + Math.floor(Math.max(0, xp - 2450) / 1000);

  return (
    <div>
      <Navbar />
      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-8 md:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <div className="card border-[#00c2e0] p-8 text-center">
            <div className="text-xs font-bold text-[#00c2e0]">HASIL MISI</div>
            <h1 className="text-3xl font-extrabold">Misi Selesai!</h1>
            <div className="my-2 text-7xl font-black text-[#00e676]">{score}/{total}</div>
            <div className="text-sm text-slate-400">jawaban benar</div>
            <div className="mx-auto mt-2 inline-block rounded-full bg-[#00e676] px-5 py-1.5 text-sm font-bold text-[#06121f]">+{score * 100} XP Didapatkan</div>
          </div>
          <div className="card flex items-center gap-4 p-5">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-[#00c2e0] text-2xl text-[#06121f]">★</span>
            <div><div className="text-xs font-bold text-[#00c2e0]">Lencana Baru</div><div className="font-extrabold">Network Explorer: Level Dasar</div></div>
          </div>
          <div className="card p-5">
            <div className="text-sm text-slate-400">Progres Level</div>
            <div className="mt-2 h-2 rounded bg-white/10"><div className="h-full w-2/3 rounded bg-[#00c2e0]" /></div>
            <div className="mt-2 text-xs">Level {level} • {xp.toLocaleString("id-ID")} / {(level * 1000 + 500).toLocaleString("id-ID")} XP menuju Level {level + 1}</div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="text-lg font-extrabold">Rangkuman Tiga Topologi</h2>
            <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead><tr className="rounded-lg bg-black/30 text-left text-[#22d3ee]"><th className="p-2">Topologi</th><th className="p-2">Bentuk</th><th className="p-2">Jika kabel / perangkat putus</th></tr></thead>
              <tbody className="text-slate-300">
                <tr className="border-b border-white/10"><td className="p-2 font-bold text-white">Topologi Bus</td><td className="p-2">Satu kabel utama (backbone)</td><td className="p-2">Seluruh jaringan terganggu jika backbone putus</td></tr>
                <tr className="border-b border-white/10"><td className="p-2 font-bold text-white">Topologi Ring</td><td className="p-2">Lingkaran tertutup</td><td className="p-2">Aliran data terhenti karena jalur melingkar terputus</td></tr>
                <tr><td className="p-2 font-bold text-white">Topologi Star</td><td className="p-2">Switch pusat</td><td className="p-2">Hanya PC yang kabelnya putus yang terputus</td></tr>
              </tbody>
            </table>
            </div>
          </div>
          {score < total && (
            <div className="rounded-2xl border border-[#ffb020] bg-[#13294b] p-6">
              <h3 className="font-extrabold text-[#ffb020]">Rekomendasi Belajar</h3>
              <p className="mt-1 text-sm">Ada {total - score} soal belum tepat. Ulangi materi Topologi Ring, lalu coba lagi simulasi putus kabel pada topologi Ring.</p>
              <Link href="/materi/ring" className="mt-3 inline-block rounded-full border border-[#ffb020] px-4 py-1.5 text-sm font-bold text-[#ffb020]">Buka Materi Ring</Link>
            </div>
          )}
          <div className="card p-6">
            <h3 className="font-extrabold">Pembahasan soal</h3>
            <div className="mt-3 space-y-3">
              {QUIZ.map((x) => (
                <details key={x.id} className="rounded-lg bg-black/30 p-3 text-sm">
                  <summary className="cursor-pointer font-bold">{x.id}. {x.q}</summary>
                  <p className="mt-1 text-slate-300">Jawaban: <b className="text-[#00e676]">{["A", "B", "C", "D"][x.answer]}. {x.options[x.answer]}</b></p>
                  <p className="text-slate-400">{x.explain}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </main>
      <div className="border-t border-white/10 bg-[#0c1d3a]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 text-xs text-slate-400">
          <span>Skor dan XP pada layar ini adalah contoh tampilan prototype</span>
          <div className="flex gap-3">
            <Link href="/kuis" className="btn-ghost px-5 py-2 text-sm">Ulangi Kuis</Link>
            <Link href="/misi" className="btn-neon px-5 py-2 text-sm">Kembali ke Menu</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hasil() {
  return (
    <RequireAuth>
    <Suspense fallback={<div className="p-10 text-center">Memuat hasil...</div>}>
      <HasilInner />
    </Suspense>
    </RequireAuth>
  );
}
