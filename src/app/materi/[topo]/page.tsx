"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { TopoDiagram } from "@/components/topo";
import { TOPOLOGI, type TopoKey } from "@/lib/data";
import { useProg } from "@/lib/store";

export default function Materi() {
  const p = useParams();
  const key = (p?.topo as TopoKey) || "star";
  const t = TOPOLOGI[key] ?? TOPOLOGI.star;
  const [tab, setTab] = useState<"anim" | "audio" | "video">("anim");
  const [showAns, setShowAns] = useState(false);
  const { markDone } = useProg();

  return (
    <RequireAuth>
    <div>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="text-xs font-bold uppercase text-[#00c2e0]">{t.level}</div>
            <h1 className="mt-1 text-4xl font-extrabold">{t.title}</h1>
            <p className="mt-3 text-slate-400">{t.long}</p>
            <div className="mt-4">
              {tab === "anim" && <TopoDiagram kind={t.key} />}
              {tab === "audio" && (
                <div className="card p-6 text-sm text-slate-300">
                  <b>Narasi Audio (simulasi UTS):</b>
                  <p className="mt-2">“{t.long} {t.cara.join(" ")}”</p>
                  <p className="mt-2 text-xs text-slate-500">File audio asli diisi tim sebelum pengumpulan. Player di bawah mensimulasikan durasi 0:45.</p>
                </div>
              )}
              {tab === "video" && (
                <div className="card grid h-64 place-items-center p-6 text-center text-sm text-slate-300">
                  <div>
                    <div className="text-4xl">▶️</div>
                    <b>Video Singkat (placeholder)</b>
                    <p className="text-xs text-slate-500">Ganti dengan embed video tim sebelum pengumpulan.</p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-3 flex gap-2 text-sm">
              {([["anim", "Diagram Animasi"], ["audio", "Narasi Audio"], ["video", "Video Singkat"]] as const).map(([v, l]) => (
                <button key={v} onClick={() => setTab(v)} className={tab === v ? "rounded-full bg-[#00c2e0] px-4 py-1.5 font-bold text-[#06121f]" : "rounded-full border border-white/15 px-4 py-1.5 text-slate-300"}>
                  {l}
                </button>
              ))}
            </div>
            <div className="card mt-3 flex items-center gap-3 p-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#00c2e0] text-[#06121f]">▶</span>
              <span className="text-sm font-bold">Narasi: Cara kerja {t.title}</span>
              <span className="h-1.5 flex-1 rounded bg-white/10"><span className="block h-full w-1/4 rounded bg-[#00c2e0]" /></span>
              <span className="text-xs text-slate-400">0:15 / 0:45</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-extrabold">Cara Kerja</h3>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-300">
                {t.cara.map((c) => <li key={c}>{c}</li>)}
              </ol>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-[#00e676]/60 bg-[#0c1d3a] p-4">
                <h4 className="font-extrabold text-[#00e676]">Kelebihan</h4>
                <ul className="mt-1 list-disc pl-4 text-sm text-slate-300">{t.kelebihan.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
              <div className="rounded-xl border border-[#ff2d55]/60 bg-[#0c1d3a] p-4">
                <h4 className="font-extrabold text-[#ff8080]">Kekurangan</h4>
                <ul className="mt-1 list-disc pl-4 text-sm text-slate-300">{t.kekurangan.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            </div>
            <div className="rounded-xl border border-[#00c2e0]/60 bg-[#0c1d3a] p-4">
              <h4 className="font-extrabold text-[#22d3ee]">Cek Pemahaman</h4>
              <p className="mt-1 text-sm">{t.cek.q}</p>
              {showAns && <p className="mt-2 rounded-lg bg-[#00e676]/10 p-3 text-sm text-[#a7f3d0]">{t.cek.a}</p>}
              <button onClick={() => setShowAns(!showAns)} className="btn-ghost mt-3 px-4 py-1.5 text-sm">
                {showAns ? "Sembunyikan" : "Lihat Jawaban"}
              </button>
            </div>
          </div>
        </div>
      </main>
      <div className="border-t border-white/10 bg-[#0c1d3a]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
          <span>Sumber aset: ilustrasi dibuat tim pengembang • Narasi dan video: diisi tim sebelum pengumpulan</span>
          <div className="flex gap-3">
            <Link href="/misi" className="btn-ghost px-5 py-2 text-sm">← Kembali ke Menu</Link>
            <Link href={`/praktik/${t.key}`} onClick={() => markDone(`materi-${t.key}`, 50)} className="btn-neon px-5 py-2 text-sm">
              Lanjut ke Misi Praktik →
            </Link>
          </div>
        </div>
      </div>
    </div>
    </RequireAuth>
  );
}
