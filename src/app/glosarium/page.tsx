"use client";

import { useMemo, useState } from "react";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { Container, Eyebrow, PageHeader, Input, Badge } from "@/components/ui";
import { IconSearch } from "@/components/icons";
import { GLOSSARY } from "@/lib/data";

const KATEGORI = ["Semua", ...Array.from(new Set(GLOSSARY.map((g) => g.cat)))];

const FAQ = [
  {
    t: "Apa itu topologi jaringan?",
    j: "Pola hubungan antar node dalam jaringan. Pola ini menentukan jalur data sekaligus besarnya dampak ketika satu bagian jaringan rusak.",
  },
  {
    t: "Mana yang paling tahan gangguan?",
    j: "Topologi Star, karena setiap komputer punya kabel sendiri ke switch pusat. Satu kabel putus hanya mengisolasi satu komputer.",
  },
  {
    t: "Bisakah saya mengulang kuis?",
    j: "Bisa. Nilai terbaikmu selalu tersimpan, dan XP hanya bertambah bila nilaimu menjadi rekor baru.",
  },
  {
    t: "Kenapa saya butuh nomor port?",
    j: "Nomor port menunjukkan slot RJ-45 yang dipakai. Pada switch 24 port, kabel ke port yang salah akan menyebabkan gangguan.",
  },
];

export default function GlosariumPage() {
  const [cari, setCari] = useState("");
  const [kategori, setKategori] = useState("Semua");

  const hasil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return GLOSSARY.filter((g) => {
      const cocokKategori = kategori === "Semua" || g.cat === kategori;
      const cocokTeks =
        q === "" ||
        g.term.toLowerCase().includes(q) ||
        g.def.toLowerCase().includes(q) ||
        g.ex.toLowerCase().includes(q);
      return cocokKategori && cocokTeks;
    });
  }, [cari, kategori]);

  const huruf = useMemo(() => {
    const set = new Set(hasil.map((g) => g.term.charAt(0).toUpperCase()));
    return Array.from(set).sort();
  }, [hasil]);

  return (
    <RequireAuth>
      <div>
        <Navbar />
        <Container width="page" className="py-10">
          <PageHeader
            chapter="Indeks"
            title="Glosarium & bantuan"
            lead="Istilah kunci yang dipakai dalam bab, lembar praktik, dan kuis — beserta contoh penerapannya."
          />

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <IconSearch
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
                  />
                  <Input
                    id="cari"
                    type="search"
                    value={cari}
                    onChange={(e) => setCari(e.target.value)}
                    placeholder="Cari istilah…"
                    aria-label="Cari istilah dalam glosarium"
                    className="pl-9"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {KATEGORI.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKategori(k)}
                      aria-pressed={kategori === k}
                      className={
                        kategori === k
                          ? "rounded-xs border border-ink bg-ink px-2.5 py-1.5 font-mono text-micro uppercase tracking-[0.1em] text-paper"
                          : "rounded-xs border border-rule-2 px-2.5 py-1.5 font-mono text-micro uppercase tracking-[0.1em] text-ink-3 hover:border-ink hover:text-ink"
                      }
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              {huruf.length > 0 && (
                <p className="mt-4 font-mono text-micro uppercase tracking-[0.14em] text-ink-4">
                  Indeks: {huruf.join(" · ")}
                </p>
              )}

              <div className="mt-3 divide-y divide-rule border border-rule">
                {hasil.length === 0 ? (
                  <p className="bg-paper p-5 text-caption text-ink-3">
                    Tidak ada istilah yang cocok. Coba kata kunci lain.
                  </p>
                ) : (
                  hasil.map((g) => (
                    <article key={g.term} className="bg-paper p-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-serif text-title">{g.term}</h2>
                        <Badge tone="blue">{g.cat}</Badge>
                      </div>
                      <p className="mt-2 text-caption leading-relaxed text-ink-2">{g.def}</p>
                      <p className="mt-2 border-l-2 border-rule-2 pl-3 text-caption italic text-ink-3">
                        {g.ex}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </div>

            <aside className="space-y-5">
              <div className="border border-rule bg-paper">
                <div className="border-b border-rule bg-paper-2 px-4 py-2">
                  <Eyebrow>Pertanyaan umum</Eyebrow>
                </div>
                <div className="divide-y divide-rule-3">
                  {FAQ.map((f) => (
                    <details key={f.t} className="bg-paper">
                      <summary className="cursor-pointer px-4 py-3 text-caption font-medium text-ink">
                        {f.t}
                      </summary>
                      <p className="px-4 pb-3 text-caption text-ink-2">{f.j}</p>
                    </details>
                  ))}
                </div>
              </div>

              <div className="border border-rule bg-paper p-5">
                <Eyebrow>Butuh bantuan lain?</Eyebrow>
                <p className="mt-2 text-caption text-ink-2">
                  Baca halaman panduan untuk urutan belajar yang disarankan, atau tanyakan kepada
                  guru.
                </p>
              </div>
            </aside>
          </div>
        </Container>
        <Footer help />
      </div>
    </RequireAuth>
  );
}
