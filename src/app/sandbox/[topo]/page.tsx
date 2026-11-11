"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { Container, Eyebrow, PageHeader, Callout, Btn, Badge } from "@/components/ui";
import { TOPOLOGI } from "@/lib/data";
import { TOPO_SPECS, isTopoKey, linkPath, pathBetween, type TopoLink } from "@/lib/topology-model";
import { useProg } from "@/lib/store";
import { XP, simulasiKey } from "@/lib/progression";
import { IconArrow, IconCheck, IconCross, IconPlug } from "@/components/icons";

interface LogRow {
  id: number;
  time: string;
  text: string;
  tone: "default" | "ok" | "error";
}

const nowLabel = () =>
  new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

export default function SandboxPage() {
  const params = useParams();
  const raw = String(params?.topo ?? "");
  const key = isTopoKey(raw) ? raw : notFound();

  const info = TOPOLOGI[key];
  const spec = TOPO_SPECS[key];
  const { markDone, done } = useProg();

  const [rusak, setRusak] = useState<string | null>(null);
  const [jalur, setJalur] = useState<TopoLink[]>([]);
  const [langkah, setLangkah] = useState(-1);
  const [sending, setSending] = useState(false);
  const [hasil, setHasil] = useState<{ ok: boolean; ms: number; hops: number } | null>(null);
  const [log, setLog] = useState<LogRow[]>([]);
  const [sudahSimulasi, setSudahSimulasi] = useState(done[simulasiKey(key)] ?? false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
    const t = timers.current;
    return () => {
      t.forEach(clearTimeout);
      t.length = 0;
    };
  }, []);

  const nodeById = useMemo(() => new Map(spec.nodes.map((n) => [n.id, n])), [spec]);

  function tambahLog(text: string, tone: LogRow["tone"] = "default") {
    setLog((l) => [{ id: Date.now() + Math.random(), time: nowLabel(), text, tone }, ...l].slice(0, 30));
  }

  const pcs = spec.nodes.filter((n) => n.kind === "pc");
  const [dari, setDari] = useState(pcs[0]?.id ?? "PC-01");
  const [ke, setKe] = useState(pcs[1]?.id ?? "PC-02");

  function kirimData() {
    if (sending) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];

    const route = pathBetween(spec, dari, ke, rusak);
    setJalur(route);
    setHasil(null);

    if (route.length === 0) {
      setSending(false);
      const ms = 0;
      setHasil({ ok: false, ms, hops: 0 });
      tambahLog(`GAGAL — tidak ada jalur dari ${dari} ke ${ke}.`, "error");
      return;
    }

    setSending(true);
    tambahLog(`PING ${dari} → ${ke} (${route.length} hop)`);

    route.forEach((link, i) => {
      const t = setTimeout(() => {
        setLangkah(i);
        if (i === route.length - 1) {
          const ms = 12 + route.length * 14;
          setTimeout(() => {
            setSending(false);
            setLangkah(-1);
            setHasil({ ok: true, ms, hops: route.length });
            tambahLog(`BALASAN diterima — ${ms} ms, ${route.length} hop.`, "ok");
            if (!sudahSimulasi) {
              setSudahSimulasi(true);
              markDone({
                key: simulasiKey(key),
                label: `Simulasi ${info.title}`,
                xp: XP.simulasi,
                topo: key,
              });
            }
          }, 700);
        }
      }, i * 750);
      timers.current.push(t);
    });
  }

  function putuskan(linkId: string) {
    const link = spec.links.find((l) => l.id === linkId);
    if (!link) return;
    if (rusak === linkId) {
      setRusak(null);
      tambahLog(`Kabel ${nodeById.get(link.from)?.label}–${nodeById.get(link.to)?.label} diperbaiki.`, "ok");
    } else {
      setRusak(linkId);
      tambahLog(
        `Kabel ${nodeById.get(link.from)?.label}–${nodeById.get(link.to)?.label} DICABUT.`,
        "error",
      );
    }
    setJalur([]);
    setLangkah(-1);
    setHasil(null);
  }

  const aktif = useMemo(() => {
    if (langkah < 0 || !jalur[langkah]) return null;
    const link = jalur[langkah];
    const from = nodeById.get(link.from);
    const to = nodeById.get(link.to);
    if (!from || !to) return null;
    return linkPath(from, to);
  }, [jalur, langkah, nodeById]);

  return (
    <RequireAuth>
      <div>
        <Navbar />
        <Container width="wide" className="py-8">
          <PageHeader
            chapter={`Simulasi ${String(Object.keys(TOPOLOGI).indexOf(key) + 1).padStart(2, "0")} · ${spec.subtitle}`}
            title={`Uji jaringan — ${info.title}`}
            lead="Kirim data dari satu komputer ke komputer lain, lalu cabut satu kabel dan lihat apa yang terjadi pada jaringan yang kamu rangkai sendiri."
            meta={
              <span className="inline-flex items-center gap-2">
                {sudahSimulasi && (
                  <Badge tone="green">
                    <IconCheck size={12} /> Sudah disimulasikan
                  </Badge>
                )}
                <span>{XP.simulasi} XP</span>
              </span>
            }
          />

          <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
            {/* -------------------------------------------- Kanvas */}
            <section className="border border-rule">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule bg-paper-2 px-4 py-2">
                <p className="font-mono text-micro uppercase tracking-[0.14em] text-ink-3">
                  Peta jaringan · {spec.title}
                </p>
                <p className="font-mono text-micro text-ink-3">
                  {rusak ? "1 kabel terputus" : "Semua kabel tersambung"}
                </p>
              </div>

              <div className="drafting-grid p-4">
                <svg
                  viewBox={spec.viewBox}
                  className="h-auto w-full"
                  role="img"
                  aria-label={`Simulasi jaringan ${info.title}`}
                >
                  {/* Jalur tautan */}
                  {spec.links.map((l) => {
                    const from = nodeById.get(l.from);
                    const to = nodeById.get(l.to);
                    if (!from || !to) return null;
                    const isBroken = l.id === rusak;
                    const isPath = jalur.some((j) => j.id === l.id);
                    return (
                      <g key={l.id}>
                        <path
                          d={linkPath(from, to)}
                          fill="none"
                          stroke={isBroken ? "var(--color-redpen)" : isPath ? "var(--color-blueprint)" : "var(--color-rule-2)"}
                          strokeWidth={isPath ? 5 : 4}
                          strokeDasharray={isBroken ? "6 8" : isPath ? "14 9" : undefined}
                          className={isPath && !isBroken ? "trace-live" : undefined}
                        />
                        {isBroken && (
                          <g>
                            <line
                              x1={(from.x + to.x) / 2 - 14}
                              y1={(from.y + to.y) / 2 - 14}
                              x2={(from.x + to.x) / 2 + 14}
                              y2={(from.y + to.y) / 2 + 14}
                              stroke="var(--color-redpen)"
                              strokeWidth={4}
                            />
                            <line
                              x1={(from.x + to.x) / 2 + 14}
                              y1={(from.y + to.y) / 2 - 14}
                              x2={(from.x + to.x) / 2 - 14}
                              y2={(from.y + to.y) / 2 + 14}
                              stroke="var(--color-redpen)"
                              strokeWidth={4}
                            />
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Paket berjalan */}
                  {aktif && (
                    <circle key={langkah} r={9} fill="var(--color-green)">
                      <animateMotion dur="0.75s" fill="freeze" path={aktif} />
                    </circle>
                  )}

                  {/* Perangkat */}
                  {spec.nodes.map((n) =>
                    n.kind === "pc" ? (
                      <g key={n.id}>
                        <rect
                          x={n.x - 30}
                          y={n.y - 26}
                          width={60}
                          height={34}
                          rx={2}
                          fill="var(--color-paper)"
                          stroke="var(--color-graphite)"
                          strokeWidth={2}
                        />
                        <path
                          d={`M ${n.x - 16} ${n.y + 8} h 32 M ${n.x - 16} ${n.y + 8} v 8 M ${n.x + 16} ${n.y + 8} v 8`}
                          stroke="var(--color-graphite)"
                          strokeWidth={2}
                        />
                        <text
                          x={n.x}
                          y={n.y + 42}
                          textAnchor="middle"
                          fontSize={18}
                          fontFamily="var(--font-plex-mono)"
                          fill="var(--color-ink)"
                        >
                          {n.id}
                        </text>
                      </g>
                    ) : n.kind === "hub" ? (
                      <g key={n.id}>
                        <rect
                          x={n.x - 46}
                          y={n.y - 24}
                          width={92}
                          height={48}
                          rx={2}
                          fill="var(--color-ink)"
                        />
                        <text
                          x={n.x}
                          y={n.y + 6}
                          textAnchor="middle"
                          fontSize={18}
                          fontFamily="var(--font-plex-mono)"
                          fill="var(--color-paper)"
                        >
                          SWITCH
                        </text>
                      </g>
                    ) : (
                      <g key={n.id}>
                        <rect
                          x={60}
                          y={n.y - 9}
                          width={880}
                          height={18}
                          rx={2}
                          fill="var(--color-paper-3)"
                          stroke="var(--color-rule-2)"
                          strokeWidth={2}
                        />
                      </g>
                    ),
                  )}
                </svg>
              </div>

              {/* Panel kendali */}
              <div className="grid gap-3 border-t border-rule p-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="font-mono text-micro uppercase tracking-[0.12em] text-ink-3">
                    Dari komputer
                  </span>
                  <select
                    value={dari}
                    onChange={(e) => setDari(e.target.value)}
                    className="rounded-xs border border-rule-2 bg-paper px-3 py-2 font-mono text-caption"
                  >
                    {pcs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-mono text-micro uppercase tracking-[0.12em] text-ink-3">
                    Ke komputer
                  </span>
                  <select
                    value={ke}
                    onChange={(e) => setKe(e.target.value)}
                    className="rounded-xs border border-rule-2 bg-paper px-3 py-2 font-mono text-caption"
                  >
                    {pcs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id}
                      </option>
                    ))}
                  </select>
                </label>
                <Btn onClick={kirimData} disabled={sending} className="sm:col-span-2">
                  <IconArrow size={15} /> {sending ? "Mengirim…" : "Kirim data (ping)"}
                </Btn>
              </div>
            </section>

            {/* -------------------------------------------- Sisi */}
            <aside className="space-y-5">
              <div className="border border-rule bg-paper">
                <div className="border-b border-rule bg-paper-2 px-4 py-2">
                  <Eyebrow>Kondisi jaringan</Eyebrow>
                </div>
                <div className="space-y-3 p-4">
                  {hasil ? (
                    <div
                      className={
                        hasil.ok
                          ? "border border-green/50 bg-green-2 p-3"
                          : "border border-redpen/50 bg-redpen-2 p-3"
                      }
                    >
                      <p className="font-mono text-micro uppercase tracking-[0.12em] text-ink-3">
                        Hasil ping
                      </p>
                      <p className="mt-1 font-serif text-title">
                        {hasil.ok ? `${hasil.ms} ms` : "Gagal kirim"}
                      </p>
                      <p className="mt-1 text-caption text-ink-2">
                        {hasil.ok
                          ? `Paket melalui ${hasil.hops} hop dan sampai ke tujuan.`
                          : "Tidak ada jalur tersedia antara kedua komputer."}
                      </p>
                    </div>
                  ) : (
                    <p className="text-caption text-ink-3">
                      Belum ada uji kirim. Tekan “Kirim data (ping)” untuk melihat jalur paket.
                    </p>
                  )}

                  <div className="border-t border-rule pt-3">
                    <p className="font-mono text-micro uppercase tracking-[0.12em] text-ink-3">
                      Jumlah tautan
                    </p>
                    <p className="mt-1 font-mono text-body text-ink">
                      {spec.links.length} tautan · {spec.cables.length} kabel
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-rule bg-paper">
                <div className="border-b border-rule bg-paper-2 px-4 py-2">
                  <Eyebrow>Cabut / perbaiki kabel</Eyebrow>
                </div>
                <ul className="divide-y divide-rule-3">
                  {spec.links.map((l) => {
                    const broken = l.id === rusak;
                    return (
                      <li key={l.id}>
                        <button
                          type="button"
                          onClick={() => putuskan(l.id)}
                          className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left hover:bg-paper-2"
                        >
                          <span className="inline-flex items-center gap-2 font-mono text-micro text-ink-2">
                            <IconPlug size={13} className={broken ? "text-redpen" : "text-ink-3"} />
                            {nodeById.get(l.from)?.label} → {nodeById.get(l.to)?.label}
                          </span>
                          <span
                            className={
                              broken
                                ? "font-mono text-micro uppercase tracking-[0.1em] text-redpen"
                                : "font-mono text-micro uppercase tracking-[0.1em] text-ink-3"
                            }
                          >
                            {broken ? (
                              <>
                                <IconCross size={11} /> Perbaiki
                              </>
                            ) : (
                              "Cabut"
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="border border-rule bg-paper">
                <div className="border-b border-rule bg-paper-2 px-4 py-2">
                  <Eyebrow>Log jaringan</Eyebrow>
                </div>
                <div className="max-h-56 overflow-y-auto p-3">
                  {log.length === 0 ? (
                    <p className="font-mono text-micro text-ink-4">Belum ada aktivitas.</p>
                  ) : (
                    <div className="space-y-1">
                      {log.map((l) => (
                        <p key={l.id} className="flex gap-2 font-mono text-micro leading-relaxed">
                          <span className="shrink-0 text-ink-4">{l.time}</span>
                          <span
                            className={
                              l.tone === "ok" ? "text-green" : l.tone === "error" ? "text-redpen" : "text-ink-3"
                            }
                          >
                            {l.text}
                          </span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Callout tone="note" label="Apa yang diamati?">
                Pada <span className="font-medium">{info.title}</span>, {spec.summary} Cabut satu
                kabel lalu kirim data lagi untuk melihat dampaknya.
              </Callout>
            </aside>
          </div>

          <p className="mt-8">
            <Link
              href={`/praktik/${key}`}
              className="font-mono text-micro uppercase tracking-[0.12em] text-blueprint hover:underline"
            >
              ← Kembali ke lembar praktik
            </Link>
          </p>
        </Container>
        <Footer help />
      </div>
    </RequireAuth>
  );
}
