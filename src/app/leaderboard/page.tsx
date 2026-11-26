"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import {
  Badge,
  Btn,
  BtnLink,
  Callout,
  Container,
  Input,
  PageHeader,
  PercentBar,
  Select,
  StatusDot,
  Toggle,
  cx,
} from "@/components/ui";
import {
  IconArrow,
  IconAward,
  IconRefresh,
  IconSearch,
  IconShield,
  IconTrophy,
  IconWarning,
} from "@/components/icons";
import {
  getAnonymousPref,
  loadLeaderboard,
  rankLeaderboard,
  setAnonymousPref,
  type RankedLeaderboardEntry,
} from "@/lib/leaderboard";
import { stageCount } from "@/lib/progression";
import { useAuth, useProg } from "@/lib/store";
import { toast } from "@/lib/toast";

const PODIUM_STYLES = [
  {
    rankLabel: "Peringkat #1",
    border: "border-caution/60 bg-caution-tint/40",
    badge: "amber" as const,
    ring: "border-caution bg-caution-tint text-caution",
  },
  {
    rankLabel: "Peringkat #2",
    border: "border-signal/45 bg-signal-tint/35",
    badge: "blue" as const,
    ring: "border-signal bg-signal-tint text-signal-bright",
  },
  {
    rankLabel: "Peringkat #3",
    border: "border-ok/40 bg-ok-tint/35",
    badge: "green" as const,
    ring: "border-ok bg-ok-tint text-ok",
  },
];

export default function LeaderboardPage() {
  const { user, isGuru } = useAuth();
  const { xp, done, activity, quizBest, quizAttempts } = useProg();

  const [entries, setEntries] = useState<RankedLeaderboardEntry[]>([]);
  const [source, setSource] = useState<"demo" | "firebase">("demo");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [kelasFilter, setKelasFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const applyResult = useCallback(
    (res: Awaited<ReturnType<typeof loadLeaderboard>>) => {
      setSource(res.source);
      if (!res.ok) {
        setError(res.error ?? "Gagal memuat papan peringkat.");
        setEntries([]);
      } else {
        setError(null);
        setEntries(res.entries);
      }
      setLoading(false);
    },
    [],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await loadLeaderboard();
    applyResult(res);
  }, [applyResult]);

  useEffect(() => {
    let active = true;
    void loadLeaderboard().then((res) => {
      if (!active) return;
      if (user?.uid) setAnonymous(getAnonymousPref(user.uid));
      applyResult(res);
    });
    return () => {
      active = false;
    };
  }, [applyResult, user?.uid]);

  const kelasOptions = useMemo(() => {
    const s = new Set<string>(["X", "XI", "XII"]);
    entries.forEach((e) => {
      if (e.kelas) s.add(e.kelas);
    });
    return Array.from(s);
  }, [entries]);

  // Peringkat ulang saat filter kelas diterapkan agar rank #1..#N tetap rapi per kelas
  const filteredEntries = useMemo(() => {
    const byClass =
      kelasFilter === "ALL" ? entries : entries.filter((e) => e.kelas === kelasFilter);
    const reranked = rankLeaderboard(byClass, user?.uid ?? null);
    const q = search.trim().toLowerCase();
    if (!q) return reranked;
    return reranked.filter((e) => e.displayName.toLowerCase().includes(q));
  }, [entries, kelasFilter, search, user?.uid]);

  const top3 = filteredEntries.slice(0, 3);
  const myEntry = entries.find((e) => e.isCurrentUser) ?? null;
  const aboveEntry =
    myEntry && myEntry.rank > 1 ? entries.find((e) => e.rank === myEntry.rank - 1) ?? null : null;
  const xpToNextRank = aboveEntry && myEntry ? Math.max(10, aboveEntry.xp - myEntry.xp) : 0;

  async function toggleAnonymous(nextAnon: boolean) {
    if (!user?.uid) return;
    setAnonymous(nextAnon);
    const stages = stageCount({ activity, done, quizBest, quizAttempts });
    await setAnonymousPref(user.uid, nextAnon, {
      name: user.name,
      kelas: user.kelas || "XI",
      xp,
      stagesDone: stages,
      quizBest,
      certified: stages >= 9 && quizBest !== null && quizBest >= 8,
    });
    await refresh();
    toast(
      nextAnon
        ? "Mode Anonim aktif: namamu disamarkan di papan peringkat."
        : "Nama aslimu kembali ditampilkan di papan peringkat.",
      "ok",
    );
  }

  return (
    <RequireAuth>
      <div className="bg-canvas">
        <Navbar />
        <main id="konten-utama">
          <Container width="page" className="py-10">
            <PageHeader
              chapter="Apresiasi capaian belajar · Aman privasi"
              title="Leaderboard Siswa"
              lead="Papan peringkat capaian XP, ketuntasan modul, dan skor kuis studi kasus. Dirancang untuk motivasi belajar sehat tanpa menampilkan email atau kesalahan pribadi peserta lain."
              meta={
                <span className="inline-flex items-center gap-3">
                  <StatusDot
                    tone="green"
                    label={source === "firebase" ? "Live Cloud" : "Mode Demo"}
                  />
                  <span className="text-signal-bright">{entries.length} peserta</span>
                </span>
              }
            >
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <Btn tone="ghost" size="sm" onClick={() => void refresh()} disabled={loading}>
                  <IconRefresh size={14} /> {loading ? "Memuat…" : "Segarkan peringkat"}
                </Btn>
                {isGuru ? (
                  <BtnLink href="/guru" tone="primary" size="sm">
                    Kembali ke Dashboard Guru <IconArrow size={13} />
                  </BtnLink>
                ) : (
                  <BtnLink href="/misi" tone="primary" size="sm">
                    Tambah XP di Alur Belajar <IconArrow size={13} />
                  </BtnLink>
                )}
              </div>
            </PageHeader>

            {error && (
              <Callout tone="error" label="Gagal memuat leaderboard" className="mt-6">
                <span className="flex items-start gap-2">
                  <IconWarning size={15} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </span>
              </Callout>
            )}

            {/* Kartu Posisimu + Toggle Mode Anonim (Khusus Siswa) */}
            {!isGuru && myEntry && (
              <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="flex flex-col justify-between gap-4 rounded-lg border border-signal/40 bg-signal-tint/60 p-5 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-mono text-micro text-signal-bright">POSISIMU SAAT INI</p>
                    <p className="mt-1 font-display text-head text-ink">
                      Peringkat #{myEntry.rank}{" "}
                      <span className="text-title font-normal text-ink-3">
                        dari {entries.length} siswa
                      </span>
                    </p>
                    <p className="mt-1 text-caption text-ink-2">
                      {aboveEntry
                        ? `Butuh +${xpToNextRank} XP lagi untuk menyusul peringkat #${aboveEntry.rank}.`
                        : "Luar biasa! Kamu berada di puncak papan peringkat saat ini."}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-3 text-right">
                    <div className="rounded-md border border-border bg-canvas/70 px-4 py-2.5">
                      <p className="text-micro text-ink-3">Total XP</p>
                      <p className="font-mono text-title font-bold text-ok">
                        {myEntry.xp.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="rounded-md border border-border bg-canvas/70 px-4 py-2.5">
                      <p className="text-micro text-ink-3">Kuis Terbaik</p>
                      <p className="font-mono text-title font-bold text-ink">
                        {myEntry.quizBest === null ? "—" : `${myEntry.quizBest}/10`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-surface p-5">
                  <Toggle
                    id="lb-anon-toggle"
                    label="Mode Anonim di Papan Peringkat"
                    description="Samarkan namamu menjadi Peserta #XXXX bagi siswa lain."
                    checked={anonymous}
                    onChange={(v) => void toggleAnonymous(v)}
                  />
                </div>
              </section>
            )}

            {/* Podium Top 3 */}
            {!loading && top3.length > 0 && (
              <section className="mt-8" aria-label="Tiga besar papan peringkat">
                <h2 className="font-display text-title">Tiga Besar Terbaik</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {top3.map((item, idx) => {
                    const style = PODIUM_STYLES[idx] ?? PODIUM_STYLES[2];
                    return (
                      <article
                        key={item.uid}
                        className={cx("rounded-lg border p-5", style.border)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cx(
                              "inline-flex h-9 w-9 items-center justify-center rounded-full border font-mono text-caption font-bold",
                              style.ring,
                            )}
                          >
                            #{item.rank}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {item.certified && (
                              <Badge tone="green">
                                <IconAward size={11} /> Tersertifikasi
                              </Badge>
                            )}
                            <Badge tone={style.badge}>{style.rankLabel}</Badge>
                          </div>
                        </div>

                        <p className="mt-4 truncate font-display text-title text-ink">
                          {item.displayName}
                        </p>
                        <p className="font-mono text-micro text-ink-3">
                          Kelas {item.kelas} · Tingkat {item.level}
                        </p>

                        <div className="mt-4 flex items-baseline justify-between border-t border-border-3 pt-3">
                          <span className="font-mono text-head font-bold text-ok">
                            {item.xp.toLocaleString("id-ID")} XP
                          </span>
                          <span className="font-mono text-micro text-ink-2">
                            Kuis: {item.quizBest === null ? "—" : `${item.quizBest}/10`}
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Tabel Peringkat Lengkap */}
            <section className="mt-8 overflow-hidden rounded-lg border border-border bg-surface">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-2 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <IconTrophy size={16} className="text-caution" />
                  <h2 className="font-display text-body font-semibold text-ink">
                    Daftar Peringkat Lengkap
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <IconSearch
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-4"
                    />
                    <Input
                      aria-label="Cari peserta di leaderboard"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari nama peserta…"
                      className="h-9 w-48 py-1 pl-8 text-caption"
                    />
                  </div>
                  <Select
                    aria-label="Filter kelas leaderboard"
                    value={kelasFilter}
                    onChange={(e) => setKelasFilter(e.target.value)}
                    className="h-9 w-36 py-1 text-caption"
                  >
                    <option value="ALL">Semua Kelas</option>
                    {kelasOptions.map((k) => (
                      <option key={k} value={k}>
                        Kelas {k}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="tech-table min-w-[44rem]">
                  <thead>
                    <tr>
                      <th scope="col" className="w-20">
                        Rank
                      </th>
                      <th scope="col">Peserta</th>
                      <th scope="col" className="w-24">
                        Kelas
                      </th>
                      <th scope="col" className="w-40">
                        Tahap Belajar
                      </th>
                      <th scope="col" className="w-28">
                        Kuis Terbaik
                      </th>
                      <th scope="col" className="w-32">
                        Status
                      </th>
                      <th scope="col" className="w-28">
                        Total XP
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-ink-3">
                          Memuat papan peringkat…
                        </td>
                      </tr>
                    ) : filteredEntries.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-ink-3">
                          Belum ada peserta pada filter ini.
                        </td>
                      </tr>
                    ) : (
                      filteredEntries.map((row) => (
                        <tr
                          key={row.uid}
                          className={cx(row.isCurrentUser && "bg-signal-tint/50")}
                        >
                          <td className="font-mono font-bold text-ink">
                            #{row.rank}
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-ink">{row.displayName}</span>
                              {row.isCurrentUser && !row.anonymous && (
                                <Badge tone="blue">Kamu</Badge>
                              )}
                            </div>
                            <p className="font-mono text-[11px] text-ink-4">
                              Tingkat {row.level}
                            </p>
                          </td>
                          <td className="font-mono text-ink-2">{row.kelas}</td>
                          <td>
                            <PercentBar
                              value={row.progressPercent}
                              label={`Tahap ${row.displayName}`}
                            />
                          </td>
                          <td className="font-mono">
                            {row.quizBest === null ? "—" : `${row.quizBest}/10`}
                          </td>
                          <td>
                            {row.certified ? (
                              <Badge tone="green">Tersertifikasi</Badge>
                            ) : row.stagesDone > 0 ? (
                              <Badge tone="neutral">Belajar</Badge>
                            ) : (
                              <Badge tone="neutral">Baru mulai</Badge>
                            )}
                          </td>
                          <td className="font-mono font-semibold text-ok">
                            {row.xp.toLocaleString("id-ID")} XP
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Catatan Keadilan Anti-Farming & Privasi */}
            <Callout
              tone="note"
              label="Aturan Peringkat Adil & Privasi Data"
              className="mt-6"
            >
              <span className="flex items-start gap-2">
                <IconShield size={16} className="mt-0.5 shrink-0 text-signal-bright" />
                <span>
                  XP anti-farming: setiap materi/praktik/simulasi hanya dihitung sekali dan XP kuis
                  hanya bertambah saat mencetak rekor baru. Papan peringkat ini tidak pernah
                  menampilkan email, detail kesalahan soal, maupun refleksi pribadi murid lain.
                </span>
              </span>
            </Callout>
          </Container>
        </main>
        <Footer help />
      </div>
    </RequireAuth>
  );
}
