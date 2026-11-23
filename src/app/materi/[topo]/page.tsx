"use client";

import { notFound, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { Container, PageHeader, Callout, BtnLink, Badge, Figure, cx } from "@/components/ui";
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
  const idxBab = Object.keys(TOPOLOGI).indexOf(info.key) + 1;

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
      <div className="bg-canvas">
        <Navbar />
        <main id="konten-utama">
          <Container width="page" className="py-10">
            <PageHeader
              chapter={`Level ${idxBab} · Studi topologi dasar`}
              title={info.title}
              lead={info.long}
              meta={
                <span className="inline-flex items-center gap-2.5">
                  {sudahDibaca && (
                    <Badge tone="green">
                      <IconCheck size={12} /> Sudah dibaca
                    </Badge>
                  )}
                  <span className="text-ok">{XP.materi} XP</span>
                </span>
              }
            />

            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
              {/* Isi materi */}
              <div className="min-w-0">
                <div className="flex flex-wrap gap-1 border-b border-border">
                  {(
                    [
                      ["diagram", "Diagram animasi"],
                      ["narasi", "Narasi audio"],
                      ["video", "Video ringkasan"],
                    ] as const
                  ).map(([v, label]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setTab(v)}
                      aria-pressed={tab === v}
                      className={cx(
                        "-mb-px cursor-pointer border-b-2 px-4 py-2.5 text-caption font-medium transition-colors",
                        tab === v
                          ? "border-signal text-signal-bright"
                          : "border-transparent text-ink-3 hover:text-ink",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="mt-5">
                  {tab === "diagram" && (
                    <Figure
                      no={`${idxBab}.1`}
                      caption={`Aliran data pada ${info.title.toLowerCase()}. ${spec.summary}`}
                    >
                      <div className="lab-grid rounded-md border border-border-3 p-4">
                        <TopoDiagram kind={info.key} />
                      </div>
                    </Figure>
                  )}

                  {tab === "narasi" && (
                    <div className="rounded-lg border border-border bg-surface p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-caption font-semibold text-ink">
                            Narasi cara kerja {info.title}
                          </p>
                          <p className="mt-0.5 text-micro text-ink-3">
                            {speaking
                              ? "Sedang membacakan… tekan lagi untuk berhenti."
                              : "Dengarkan ringkasan lisan atau baca transkripnya di bawah."}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={toggleNarasi}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border-2 bg-surface-2 px-3.5 py-2 text-caption font-medium text-ink transition-colors hover:border-signal hover:text-signal-bright"
                        >
                          {speaking ? <IconVolumeOff size={15} /> : <IconVolume size={15} />}
                          {speaking ? "Hentikan" : "Putar narasi"}
                        </button>
                      </div>
                      <p
                        id="narasi-teks"
                        className="mt-4 border-l-2 border-signal pl-4 text-body leading-relaxed text-ink-2"
                      >
                        {teksNarasi}
                      </p>
                      <p className="mt-4 text-micro text-ink-3">
                        Narasi memakai sintesis suara bawaan peramban (Web Speech API) sehingga
                        berjalan tanpa berkas audio tambahan.
                      </p>
                    </div>
                  )}

                  {tab === "video" && <VideoBlock topo={info.key} />}
                </div>

                {/* Cara kerja */}
                <section className="mt-8 rounded-lg border border-border bg-surface p-6">
                  <h2 className="font-display text-title">Cara kerja</h2>
                  <ol className="mt-4 space-y-3">
                    {info.cara.map((c, i) => (
                      <li key={c} className="flex gap-3 text-body text-ink-2">
                        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-sm bg-signal-tint font-mono text-micro text-signal-bright">
                          {i + 1}
                        </span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ol>
                </section>

                {/* Kelebihan & Kekurangan */}
                <section className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div className="rounded-lg border border-ok/35 bg-surface p-5">
                    <h2 className="font-display text-title text-ok">Kelebihan</h2>
                    <ul className="mt-3.5 space-y-2.5">
                      {info.kelebihan.map((x) => (
                        <li key={x} className="flex gap-2.5 text-caption leading-relaxed text-ink-2">
                          <IconCheck size={15} className="mt-0.5 shrink-0 text-ok" />
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-fault/35 bg-surface p-5">
                    <h2 className="font-display text-title text-fault">Kekurangan</h2>
                    <ul className="mt-3.5 space-y-2.5">
                      {info.kekurangan.map((x) => (
                        <li key={x} className="flex gap-2.5 text-caption leading-relaxed text-ink-2">
                          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-fault" />
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                {/* Cek pemahaman */}
                <section className="mt-6 rounded-lg border border-signal/35 bg-surface p-6">
                  <h2 className="font-display text-title text-signal-bright">Cek pemahaman</h2>
                  <p className="mt-2.5 text-body text-ink">{info.cek.q}</p>
                  {showAns && (
                    <p className="mt-4 border-l-2 border-ok pl-4 text-caption leading-relaxed text-ink-2">
                      {info.cek.a}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowAns((v) => !v)}
                    className="mt-4 cursor-pointer rounded-md border border-border-2 bg-surface-2 px-4 py-2 text-caption font-medium text-ink transition-colors hover:border-signal hover:text-signal-bright"
                  >
                    {showAns ? "Sembunyikan jawaban" : "Lihat jawaban"}
                  </button>
                </section>

                <section className="mt-6">
                  <Callout tone="note" label="Analogi sehari-hari">
                    {info.analogi}
                  </Callout>
                </section>
              </div>

              {/* Panel samping */}
              <aside className="space-y-5">
                <div className="overflow-hidden rounded-lg border border-border bg-surface">
                  <div className="border-b border-border bg-surface-2 px-4 py-2.5">
                    <p className="text-caption font-semibold text-ink">Bagian dalam modul</p>
                  </div>
                  <ol className="p-4">
                    {SUBBAB.map((s, i) => (
                      <li
                        key={s}
                        className="flex gap-3 border-b border-border-3 py-2.5 text-caption text-ink-2 last:border-0"
                      >
                        <span className="font-mono text-micro text-ink-4">
                          {idxBab}.{i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="rounded-lg border border-border bg-surface p-5">
                  <p className="text-caption font-semibold text-ink">Aturan pemasangan kabel</p>
                  <p className="mt-2 text-caption leading-relaxed text-ink-2">{spec.rule}</p>
                  <p className="mt-3 font-mono text-micro text-ink-3">
                    {spec.cables.length} kabel · {spec.nodes.length} perangkat
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-surface p-5">
                  <p className="text-caption font-semibold text-ink">Langkah berikutnya</p>
                  <p className="mt-2 text-caption leading-relaxed text-ink-2">
                    Kerjakan papan praktik untuk topologi ini. Kamu mendapat{" "}
                    <span className="font-mono text-ok">{XP.praktik} XP</span> setelah semua kabel
                    terpasang benar.
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
        </main>
        <Footer />
      </div>
    </RequireAuth>
  );
}
