"use client";

import { notFound, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { Container, Eyebrow, PageHeader, Callout, BtnLink, Badge, Figure } from "@/components/ui";
import { TopoDiagram } from "@/components/topo";
import VideoBlock from "@/components/video-block";
import { TOPOLOGI } from "@/lib/data";
import { TOPO_SPECS } from "@/lib/topology-model";
import { useProg } from "@/lib/store";
import { XP, materiKey } from "@/lib/progression";
import { IconArrow, IconVolume, IconVolumeOff, IconCheck } from "@/components/icons";

const SUBBAB = ["Cara kerja", "Kelebihan", "Kekurangan", "Cek pemahaman"];

export default function MateriPage() {
  const params = useParams();
  const key = String(params?.topo ?? "");
  const info = TOPOLOGI[key as keyof typeof TOPOLOGI];
  if (!info) notFound();

  const spec = TOPO_SPECS[info.key];
  const { markDone, done } = useProg();
  const [tab, setTab] = useState<"diagram" | "narasi" | "video">("diagram");
  const [showAns, setShowAns] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const teksNarasi = `${info.long} ${info.cara.join(" ")}`;

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  function toggleNarasi() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(teksNarasi);
    u.lang = "id-ID";
    u.rate = 0.95;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    utteranceRef.current = u;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  }

  const sudahDibaca = done[materiKey(info.key)];

  return (
    <RequireAuth>
      <div>
        <Navbar />
        <Container width="page" className="py-10">
          <PageHeader
            chapter={`Bab ${String(Object.keys(TOPOLOGI).indexOf(info.key) + 1).padStart(2, "0")} · ${info.level.split("•")[1]?.trim() ?? ""}`}
            title={info.title}
            lead={info.long}
            meta={
              <span className="inline-flex items-center gap-2">
                {sudahDibaca && (
                  <Badge tone="green">
                    <IconCheck size={12} /> Sudah dibaca
                  </Badge>
                )}
                <span>{XP.materi} XP</span>
              </span>
            }
          />

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
            {/* ------------------------------------------------ Isi bab */}
            <div className="min-w-0">
              <div className="flex flex-wrap gap-1 border-b border-rule">
                {(
                  [
                    ["diagram", "Diagram"],
                    ["narasi", "Narasi audio"],
                    ["video", "Video ringkasan"],
                  ] as const
                ).map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setTab(v)}
                    aria-pressed={tab === v}
                    className={
                      tab === v
                        ? "-mb-px border-b-2 border-blueprint px-3.5 py-2 font-mono text-micro uppercase tracking-[0.12em] text-ink"
                        : "-mb-px border-b-2 border-transparent px-3.5 py-2 font-mono text-micro uppercase tracking-[0.12em] text-ink-3 hover:text-ink"
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                {tab === "diagram" && (
                  <Figure
                    no={`${Object.keys(TOPOLOGI).indexOf(info.key) + 1}.1`}
                    caption={`Aliran data pada ${info.title.toLowerCase()}. ${spec.summary}`}
                  >
                    <div className="drafting-grid border border-rule p-4">
                      <TopoDiagram kind={info.key} />
                    </div>
                  </Figure>
                )}

                {tab === "narasi" && (
                  <div className="border border-rule bg-paper p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-mono text-micro uppercase tracking-[0.12em] text-ink-3">
                          Narasi · cara kerja {info.title}
                        </p>
                        <p className="mt-1 text-caption text-ink-2">
                          {speaking
                            ? "Sedang membaca… tekan lagi untuk berhenti."
                            : "Dengarkan ringkasan lisan, atau baca teksnya di bawah."}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={toggleNarasi}
                        className="inline-flex items-center gap-2 rounded-xs border border-rule-2 px-3 py-1.5 font-mono text-micro uppercase tracking-[0.1em] text-ink hover:border-ink hover:bg-paper-2"
                      >
                        {speaking ? <IconVolumeOff size={14} /> : <IconVolume size={14} />}
                        {speaking ? "Hentikan" : "Putar narasi"}
                      </button>
                    </div>
                    <p id="narasi-teks" className="mt-4 border-l-2 border-rule-2 pl-4 text-lead leading-relaxed text-ink-2">
                      {teksNarasi}
                    </p>
                    <p className="mt-4 text-caption text-ink-3">
                      Narasi memakai sintesis suara peramban (Web Speech API) sehingga tersedia
                      tanpa berkas audio tambahan.
                    </p>
                  </div>
                )}

                {tab === "video" && <VideoBlock topo={info.key} />}
              </div>

              {/* Subbab */}
              <section className="mt-10">
                <h2 className="font-serif text-title">
                  <span className="font-mono text-caption text-ink-3">1.1</span> Cara kerja
                </h2>
                <ol className="mt-3 space-y-2">
                  {info.cara.map((c, i) => (
                    <li key={c} className="flex gap-3 text-body text-ink-2">
                      <span className="mt-0.5 font-mono text-caption text-blueprint">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="mt-8 grid gap-5 sm:grid-cols-2">
                <div className="border border-rule bg-paper p-5">
                  <h2 className="font-serif text-title">
                    <span className="font-mono text-caption text-ink-3">1.2</span> Kelebihan
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {info.kelebihan.map((x) => (
                      <li key={x} className="flex gap-2 text-caption text-ink-2">
                        <IconCheck size={14} className="mt-0.5 shrink-0 text-green" />
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border border-rule bg-paper p-5">
                  <h2 className="font-serif text-title">
                    <span className="font-mono text-caption text-ink-3">1.3</span> Kekurangan
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {info.kekurangan.map((x) => (
                      <li key={x} className="flex gap-2 text-caption text-ink-2">
                        <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-redpen" />
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className="mt-8">
                <h2 className="font-serif text-title">
                  <span className="font-mono text-caption text-ink-3">1.4</span> Cek pemahaman
                </h2>
                <div className="mt-3 border border-rule bg-paper-2 p-5">
                  <p className="text-body text-ink">{info.cek.q}</p>
                  {showAns && (
                    <p className="mt-4 border-l-2 border-green pl-4 text-caption leading-relaxed text-ink-2">
                      {info.cek.a}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowAns((v) => !v)}
                    className="mt-4 rounded-xs border border-rule-2 px-3 py-1.5 font-mono text-micro uppercase tracking-[0.1em] text-ink hover:border-ink hover:bg-paper"
                  >
                    {showAns ? "Sembunyikan jawaban" : "Lihat jawaban"}
                  </button>
                </div>
              </section>

              <section className="mt-8">
                <Callout tone="note" label="Analogi">
                  {info.analogi}
                </Callout>
              </section>
            </div>

            {/* ------------------------------------------------ Sisi */}
            <aside className="space-y-5">
              <div className="border border-rule bg-paper">
                <div className="border-b border-rule bg-paper-2 px-4 py-2">
                  <Eyebrow>Isi bab</Eyebrow>
                </div>
                <ol className="p-4">
                  {SUBBAB.map((s, i) => (
                    <li
                      key={s}
                      className="flex gap-3 border-b border-rule-3 py-2 last:border-0 text-caption text-ink-2"
                    >
                      <span className="font-mono text-micro text-ink-4">
                        1.{i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="border border-rule bg-paper p-4">
                <Eyebrow>Aturan pemasangan</Eyebrow>
                <p className="mt-2 text-caption leading-relaxed text-ink-2">{spec.rule}</p>
                <p className="mt-3 font-mono text-micro text-ink-3">
                  {spec.cables.length} kabel · {spec.nodes.length} perangkat
                </p>
              </div>

              <div className="border border-rule bg-paper p-4">
                <Eyebrow>Langkah berikutnya</Eyebrow>
                <p className="mt-2 text-caption text-ink-2">
                  Kerjakan lembar praktik untuk topologi ini. Kamu mendapat{" "}
                  <span className="font-mono">{XP.praktik} XP</span> bila seluruh kabel terpasang
                  sesuai aturan.
                </p>
                <BtnLink
                  href={`/praktik/${info.key}`}
                  onClick={() =>
                    markDone({
                      key: materiKey(info.key),
                      label: `Materi ${info.title}`,
                      xp: XP.materi,
                      topo: info.key,
                    })
                  }
                  className="mt-4 w-full"
                >
                  Lanjut ke lembar praktik <IconArrow size={14} />
                </BtnLink>
              </div>
            </aside>
          </div>
        </Container>
        <Footer />
      </div>
    </RequireAuth>
  );
}
