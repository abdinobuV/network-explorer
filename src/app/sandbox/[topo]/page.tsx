"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { Container, PageHeader, Callout, Btn, Badge, cx } from "@/components/ui";
import { TOPOLOGI, type TopoKey } from "@/lib/data";
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

const GRID_BG = "#09101d";
const ALL_TOPOS: TopoKey[] = ["bus", "ring", "star"];

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
      setHasil({ ok: false, ms: 0, hops: 0 });
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
      <div className="bg-canvas">
        <Navbar />
        <main id="konten-utama">
          <Container width="wide" className="py-8">
            <PageHeader
              chapter={`Sandbox simulasi · ${spec.subtitle}`}
              title={`Uji jaringan ${info.title}`}
              lead="Kirim paket data antar komputer, lalu cabut satu kabel untuk melihat pengaruh gangguan terhadap topologi ini."
              meta={
                <span className="inline-flex items-center gap-2.5">
                  {sudahSimulasi && (
                    <Badge tone="green">
                      <IconCheck size={12} /> Sudah disimulasikan
                    </Badge>
                  )}
                  <span className="text-ok">{XP.simulasi} XP</span>
                </span>
              }
            >
              <div className="mt-4 flex flex-wrap gap-2">
                {ALL_TOPOS.map((k) => (
                  <Link
                    key={k}
                    href={`/sandbox/${k}`}
                    className={cx(
                      "rounded-md border px-3 py-1.5 text-caption font-medium transition-colors",
                      k === key
                        ? "border-signal bg-signal-tint text-signal-bright"
                        : "border-border bg-surface text-ink-2 hover:border-border-2 hover:text-ink",
                    )}
                  >
                    {TOPOLOGI[k].title}
                  </Link>
                ))}
              </div>
            </PageHeader>

            <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_21rem]">
              {/* Kanvas simulasi */}
              <section className="overflow-hidden rounded-lg border border-border bg-surface">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-2 px-4 py-2.5">
                  <p className="text-caption font-medium text-ink">Peta jaringan {spec.title}</p>
                  <span
                    className={cx(
                      "font-mono text-micro",
                      rusak ? "text-fault" : "text-ok",
                    )}
                  >
                    {rusak ? "1 kabel terputus" : "Semua kabel tersambung"}
                  </span>
                </div>

                <div className="lab-grid p-4">
                  <svg
                    viewBox={spec.viewBox}
                    className="h-auto w-full"
                    role="img"
                    aria-label={`Simulasi jaringan ${info.title}`}
                  >
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
                            stroke={
                              isBroken
                                ? "var(--color-fault)"
                                : isPath
                                  ? "var(--color-signal-bright)"
                                  : "var(--color-border-2)"
                            }
                            strokeWidth={isPath ? 5 : 4}
                            strokeDasharray={isBroken ? "6 8" : isPath ? "12 8" : undefined}
                            className={isPath && !isBroken ? "trace-live" : undefined}
                          />
                          {isBroken && (
                            <g>
                              <line
                                x1={(from.x + to.x) / 2 - 14}
                                y1={(from.y + to.y) / 2 - 14}
                                x2={(from.x + to.x) / 2 + 14}
                                y2={(from.y + to.y) / 2 + 14}
                                stroke="var(--color-fault)"
                                strokeWidth={4}
                                strokeLinecap="round"
                              />
                              <line
                                x1={(from.x + to.x) / 2 + 14}
                                y1={(from.y + to.y) / 2 - 14}
                                x2={(from.x + to.x) / 2 - 14}
                                y2={(from.y + to.y) / 2 + 14}
                                stroke="var(--color-fault)"
                                strokeWidth={4}
                                strokeLinecap="round"
                              />
                            </g>
                          )}
                        </g>
                      );
                    })}

                    {aktif && (
                      <circle key={langkah} r={9} fill="var(--color-ok)">
                        <animateMotion dur="0.75s" fill="freeze" path={aktif} />
                      </circle>
                    )}

                    {spec.nodes.map((n) =>
                      n.kind === "pc" ? (
                        <g key={n.id}>
                          <rect
                            x={n.x - 32}
                            y={n.y - 26}
                            width={64}
                            height={36}
                            rx={4}
                            fill="var(--color-surface)"
                            stroke="var(--color-signal)"
                            strokeWidth={2}
                          />
                          <rect
                            x={n.x - 24}
                            y={n.y - 19}
                            width={48}
                            height={21}
                            rx={2}
                            fill={GRID_BG}
                            stroke="var(--color-border-2)"
                            strokeWidth={1.2}
                          />
                          <circle cx={n.x + 22} cy={n.y + 4} r={2.2} fill="var(--color-ok)" />
                          <path
                            d={`M ${n.x - 16} ${n.y + 10} h 32 M ${n.x - 10} ${n.y + 10} v 7 M ${n.x + 10} ${n.y + 10} v 7`}
                            stroke="var(--color-border-2)"
                            strokeWidth={2}
                          />
                          <text
                            x={n.x}
                            y={n.y + 42}
                            textAnchor="middle"
                            fontSize={18}
                            fontFamily="var(--font-plex-mono)"
                            fill="var(--color-ink)"
                            stroke={GRID_BG}
                            strokeWidth={7}
                            paintOrder="stroke"
                          >
                            {n.id}
                          </text>
                        </g>
                      ) : n.kind === "hub" ? (
                        <g key={n.id}>
                          <rect
                            x={n.x - 50}
                            y={n.y - 25}
                            width={100}
                            height={50}
                            rx={5}
                            fill="var(--color-surface-2)"
                            stroke="var(--color-ok)"
                            strokeWidth={2.5}
                          />
                          <text
                            x={n.x}
                            y={n.y + 6}
                            textAnchor="middle"
                            fontSize={18}
                            fontFamily="var(--font-plex-mono)"
                            fill="var(--color-ok)"
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
                            rx={3}
                            fill="var(--color-surface-2)"
                            stroke="var(--color-border-2)"
                            strokeWidth={2}
                          />
                        </g>
                      ),
                    )}
                  </svg>
                </div>

                {/* Panel kendali ping */}
                <div className="grid gap-3 border-t border-border p-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-micro font-medium text-ink-3">Dari komputer</span>
                    <select
                      value={dari}
                      onChange={(e) => setDari(e.target.value)}
                      className="rounded-md border border-border-2 bg-canvas px-3 py-2 font-mono text-caption text-ink focus:border-signal focus:outline-none"
                    >
                      {pcs.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.id}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-micro font-medium text-ink-3">Ke komputer</span>
                    <select
                      value={ke}
                      onChange={(e) => setKe(e.target.value)}
                      className="rounded-md border border-border-2 bg-canvas px-3 py-2 font-mono text-caption text-ink focus:border-signal focus:outline-none"
                    >
                      {pcs.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.id}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Btn onClick={kirimData} disabled={sending} size="lg" className="sm:col-span-2">
                    <IconArrow size={15} /> {sending ? "Mengirim paket…" : "Kirim data (ping)"}
                  </Btn>
                </div>
              </section>

              {/* Panel samping */}
              <aside className="space-y-5">
                <div className="overflow-hidden rounded-lg border border-border bg-surface">
                  <div className="border-b border-border bg-surface-2 px-4 py-2.5">
                    <p className="text-caption font-semibold text-ink">Kondisi koneksi</p>
                  </div>
                  <div className="space-y-3 p-4">
                    {hasil ? (
                      <div
                        className={
                          hasil.ok
                            ? "rounded-md border border-ok/40 bg-ok-tint p-3.5"
                            : "rounded-md border border-fault/40 bg-fault-tint p-3.5"
                        }
                      >
                        <p className={cx("text-micro font-semibold", hasil.ok ? "text-ok" : "text-fault")}>
                          {hasil.ok ? "Koneksi aktif" : "Pengiriman gagal"}
                        </p>
                        <p className="mt-1 font-mono text-head font-bold text-ink">
                          {hasil.ok ? `${hasil.ms} ms` : "Timeout"}
                        </p>
                        <p className="mt-1 text-caption text-ink-2">
                          {hasil.ok
                            ? `Paket melalui ${hasil.hops} hop dan sampai ke tujuan.`
                            : "Tidak ada jalur tersedia antara kedua komputer."}
                        </p>
                      </div>
                    ) : (
                      <p className="text-caption text-ink-3">
                        Belum ada uji kirim. Tekan “Kirim data (ping)” untuk melihat rute paket.
                      </p>
                    )}

                    <div className="border-t border-border pt-3">
                      <p className="text-micro text-ink-3">Konfigurasi jaringan</p>
                      <p className="mt-1 font-mono text-caption text-ink">
                        {spec.links.length} tautan · {spec.cables.length} kabel
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-border bg-surface">
                  <div className="border-b border-border bg-surface-2 px-4 py-2.5">
                    <p className="text-caption font-semibold text-ink">Uji gangguan kabel</p>
                  </div>
                  <ul className="divide-y divide-border-3">
                    {spec.links.map((l) => {
                      const broken = l.id === rusak;
                      return (
                        <li key={l.id}>
                          <button
                            type="button"
                            onClick={() => putuskan(l.id)}
                            className="flex w-full cursor-pointer items-center justify-between gap-2 px-4 py-2.5 text-left transition-colors hover:bg-surface-2"
                          >
                            <span className="inline-flex items-center gap-2 font-mono text-micro text-ink-2">
                              <IconPlug size={13} className={broken ? "text-fault" : "text-signal"} />
                              {nodeById.get(l.from)?.label} → {nodeById.get(l.to)?.label}
                            </span>
                            <span
                              className={cx(
                                "inline-flex items-center gap-1 text-micro font-medium",
                                broken ? "text-ok" : "text-fault",
                              )}
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

                <div className="overflow-hidden rounded-lg border border-border bg-surface">
                  <div className="border-b border-border bg-surface-2 px-4 py-2.5">
                    <p className="text-caption font-semibold text-ink">Log jaringan</p>
                  </div>
                  <div className="max-h-56 overflow-y-auto bg-canvas/70 p-3">
                    {log.length === 0 ? (
                      <p className="font-mono text-micro text-ink-4">Belum ada aktivitas.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {log.map((l) => (
                          <p key={l.id} className="flex gap-2 font-mono text-micro leading-relaxed">
                            <span className="shrink-0 text-ink-4">{l.time}</span>
                            <span
                              className={
                                l.tone === "ok"
                                  ? "text-ok"
                                  : l.tone === "error"
                                    ? "text-fault"
                                    : "text-ink-2"
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
                  Pada <span className="font-medium text-ink">{info.title}</span>, {spec.summary}{" "}
                  Cabut satu kabel lalu kirim data lagi untuk melihat dampaknya.
                </Callout>
              </aside>
            </div>

            <p className="mt-8">
              <Link
                href={`/praktik/${key}`}
                className="text-caption font-medium text-signal-bright hover:underline"
              >
                Kembali ke lembar praktik
              </Link>
            </p>
          </Container>
        </main>
        <Footer help />
      </div>
    </RequireAuth>
  );
}
