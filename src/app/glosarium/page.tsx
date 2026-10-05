"use client";
import Link from "next/link";
import { useState } from "react";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { GLOSSARY } from "@/lib/data";

const CATS = ["Semua istilah", "Perangkat", "Struktur jaringan", "Komunikasi", "Pengujian"];

export default function Glosarium() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(CATS[0]);
  const list = GLOSSARY.filter(
    (g) =>
      (cat === CATS[0] || g.cat === cat) &&
      (g.term.toLowerCase().includes(q.toLowerCase()) || g.def.toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <RequireAuth>
    <div>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-xs font-bold text-[#00c2e0]">PUSAT BANTUAN BELAJAR</div>
        <h1 className="text-3xl font-extrabold">Istilah jelas, belajar lebih mudah.</h1>
        <p className="text-slate-400">Temukan arti istilah jaringan dan jawaban atas pertanyaan yang sering muncul saat menjalankan misi.</p>
        <div className="card mt-5 flex items-center gap-3 p-4">
          <span>🔍</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari istilah atau pertanyaan, misalnya “switch” atau “ping”" className="w-full bg-transparent outline-none placeholder:text-slate-500" />
          <span className="hidden text-xs text-slate-400 md:block">Pencarian glosarium</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={cat === c ? "rounded-full bg-[#00c2e0] px-4 py-1.5 text-sm font-bold text-[#06121f]" : "rounded-full border border-white/15 px-4 py-1.5 text-sm text-slate-300"}>
              {c}
            </button>
          ))}
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-[1fr_340px]">
          <div>
            <h2 className="font-extrabold">Istilah dasar</h2>
            <div className="text-right text-xs text-slate-400">{list.length} istilah ditampilkan</div>
            <div className="card mt-2 divide-y divide-white/10 p-0">
              {list.map((g) => (
                <div key={g.term} className="grid gap-2 p-4 md:grid-cols-[160px_1fr]">
                  <div><div className="font-extrabold text-[#22d3ee]">{g.term}</div><div className="text-xs text-slate-500">{g.cat}</div></div>
                  <div className="text-sm text-slate-300">{g.def}<div className="mt-1 text-xs text-slate-500">{g.ex}</div></div>
                </div>
              ))}
              {list.length === 0 && <p className="p-6 text-sm text-slate-400">Tidak ada hasil untuk “{q}”. Coba kata kunci lain.</p>}
            </div>
          </div>
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-extrabold">❓ Pertanyaan umum</h3>
              <div className="mt-3 space-y-4 text-sm">
                {[
                  ["Dari mana saya harus mulai?", "Buka Panduan Belajar, lalu pelajari Bus di Misi Utama. Ikuti urutan Materi → Praktik → Simulasi → Kuis."],
                  ["Apa perbedaan praktik dan simulasi?", "Praktik melatih penyusunan perangkat dan kabel. Simulasi membantu mengamati pengiriman paket dan gangguan."],
                  ["Mengapa ping tidak mendapat balasan?", "Periksa sambungan dan perangkat pusat, lalu alamat IP. Balasan juga dapat diblokir firewall; gagal ping bukan selalu kabel putus."],
                  ["Bisakah saya mengulang materi?", "Ya. Buka kembali topologi di Misi Utama dan gunakan Progres Belajar untuk menentukan tahap yang perlu ditinjau."],
                ].map(([t, d]) => (
                  <div key={t} className="border-b border-white/10 pb-3"><b>{t}</b><p className="mt-1 text-slate-400">{d}</p></div>
                ))}
              </div>
            </div>
            <div className="card border-[#00c2e0] p-5">
              <b>Masih bingung dengan konsepnya?</b>
              <p className="mt-1 text-sm text-slate-400">Catat istilah atau tahap yang sulit dan diskusikan dengan guru Informatika.</p>
              <Link href="/panduan" className="btn-ghost mt-3 inline-block px-4 py-2 text-sm">Buka Panduan Belajar →</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer help />
    </div>
    </RequireAuth>
  );
}
