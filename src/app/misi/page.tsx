import Link from "next/link";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { TopoMini } from "@/components/topo";
import { TOPOLOGI } from "@/lib/data";

export default function Misi() {
  return (
    <RequireAuth>
    <div>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="text-xs font-bold text-[#00c2e0]">STUDI TOPOLOGI DASAR</div>
            <h1 className="text-3xl font-extrabold">Pilih Materi Eksplorasi</h1>
            <p className="text-slate-400">Setiap materi memiliki misi interaktif untuk membantumu memahami arsitektur jaringan komputer.</p>
          </div>
          <Link href="/kuis" className="rounded-lg border border-[#ff2d55] px-4 py-2 text-sm font-bold text-[#ff2d55] hover:bg-[#ff2d55]/10">
            🎖 Ujian Akhir (Final Quiz)
          </Link>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {(
            [
              ["bus", "Level 1", false],
              ["ring", "Level 2", false],
              ["star", "Level 3", true],
            ] as const
          ).map(([k, lvl, baru]) => (
            <div key={k} className="rounded-2xl bg-white p-6 text-slate-900">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{lvl}</span>
                {baru ? <span className="chip">BARU</span> : <span className="h-2 w-2 rounded-full bg-[#00e676]" />}
              </div>
              <h2 className="mt-4 text-2xl font-extrabold">{TOPOLOGI[k].title}</h2>
              <p className="mt-2 min-h-16 text-sm text-slate-600">{TOPOLOGI[k].desc}</p>
              <div className="mt-4 rounded-xl bg-[#0c1d3a] p-3"><TopoMini kind={k} /></div>
              <Link href={`/materi/${k}`} className="mt-5 block rounded-lg bg-[#0c1d3a] py-3 text-center text-sm font-bold text-[#00e676] hover:bg-[#16294d]">
                Pelajari Materi
              </Link>
            </div>
          ))}
        </div>
      </main>
      <Footer help />
    </div>
    </RequireAuth>
  );
}
