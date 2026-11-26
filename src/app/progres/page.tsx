"use client";

import Link from "next/link";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { Container, PageHeader, PercentBar, Badge, StatusDot, BtnLink, cx } from "@/components/ui";
import { TopoMini } from "@/components/topo";
import { TOPOLOGI } from "@/lib/data";
import { TOPO_SPECS } from "@/lib/topology-model";
import { useLearningAnalytics, useProg } from "@/lib/store";
import {
  KUIS_KEY,
  TOPO_KEYS,
  activityLabel,
  levelProgress,
  materiKey,
  nextStage,
  overallPercent,
  praktikKey,
  simulasiKey,
  topoPercent,
  topoXp,
  XP_PER_LEVEL,
} from "@/lib/progression";
import { IconArrow, IconAward, IconChart, IconSparkle, IconTrophy } from "@/components/icons";

export default function ProgresPage() {
  const { xp, done, activity, quizBest, quizAttempts } = useProg();
  const { summary, certification } = useLearningAnalytics();
  const lv = levelProgress(xp);
  const persen = overallPercent({ activity, done, quizBest, quizAttempts });
  const berikutnya = nextStage({ activity, done, quizBest, quizAttempts });
  const lencana = [
    { nama: "Pembaca tekun", syarat: done[materiKey("bus")], ket: "Menyelesaikan materi Bus" },
    { nama: "Installer", syarat: done[praktikKey("bus")], ket: "Menyelesaikan praktik Bus" },
    { nama: "Peneliti", syarat: done[simulasiKey("star")], ket: "Menjalankan simulasi Star" },
    { nama: "Ahli kuis", syarat: quizBest !== null && quizBest >= 8, ket: "Nilai kuis minimal 8/10" },
    { nama: "Penuntas", syarat: persen === 100, ket: "Menyelesaikan seluruh 10 tahap" },
  ];

  const kronologi = [...activity].sort((a, b) => b.at - a.at);

  return (
    <RequireAuth>
      <div className="bg-canvas">
        <Navbar />
        <main id="konten-utama">
          <Container width="page" className="py-10">
            <PageHeader
              chapter="Rekam jejak"
              title="Progres belajarmu"
              lead="Semua angka di halaman ini dihitung langsung dari aktivitas yang sudah kamu selesaikan."
              meta={
                <span className="inline-flex items-center gap-3">
                  <StatusDot tone="green" label={`Tingkat ${lv.level}`} />
                  <span className="text-ok">{xp.toLocaleString("id-ID")} XP</span>
                </span>
              }
            />

            {/* Ringkasan */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Penyelesaian tahap", `${persen}%`, "dari 10 tahap belajar (Progress)"],
                [
                  "Indeks penguasaan",
                  summary.masteryRate === null ? "—" : `${summary.masteryRate}%`,
                  "Mastery dari kuis & akurasi praktik",
                ],
                ["Tingkat", String(lv.level), `${lv.need - lv.into} XP menuju tingkat ${lv.level + 1}`],
                ["Nilai kuis terbaik", quizBest === null ? "—" : `${quizBest}/10`, `${quizAttempts} percobaan`],
              ].map(([label, nilai, ket]) => (
                <div key={label} className="rounded-lg border border-border bg-surface p-5">
                  <p className="text-micro font-medium text-ink-3">{label}</p>
                  <p className="mt-2 font-display text-chapter leading-none text-ink">{nilai}</p>
                  <p className="mt-2 text-caption text-ink-3">{ket}</p>
                </div>
              ))}
            </div>

            {/* Akses cepat ke Learning Analytics, Asisten AI & Sertifikat */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-5 py-3.5">
              <p className="text-caption text-ink-2">
                Sertifikasi Kompetensi:{" "}
                <span className="font-mono text-ok">
                  {certification.completedCount}/{certification.totalChecks} syarat
                </span>
                {certification.eligible ? " — Sertifikat siap dicetak!" : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                <BtnLink href="/leaderboard" tone="ghost" size="sm">
                  <IconTrophy size={14} /> Leaderboard
                </BtnLink>
                <BtnLink href="/analitik" tone="signal" size="sm">
                  <IconChart size={14} /> Dashboard Analitik
                </BtnLink>
                <BtnLink href="/asisten" tone="ghost" size="sm">
                  <IconSparkle size={14} /> Studio AI
                </BtnLink>
                <BtnLink href="/cetak" tone="ghost" size="sm">
                  <IconAward size={14} /> Rapor & Sertifikat
                </BtnLink>
              </div>
            </div>

            {/* Langkah berikutnya */}
            {berikutnya && (
              <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-lg border border-signal/40 bg-signal-tint/70 p-5 md:flex-row md:items-center">
                <div>
                  <p className="text-micro font-semibold text-signal-bright">Langkah berikutnya</p>
                  <p className="mt-1 font-display text-title text-ink">{berikutnya.label}</p>
                  <p className="mt-1 text-caption text-ink-2">
                    {berikutnya.key.startsWith("materi")
                      ? "Baca materinya dulu, lalu lanjutkan ke lembar praktik."
                      : berikutnya.key.startsWith("praktik")
                        ? "Pasang kabel sesuai aturan topologi pada papan kerja."
                        : "Kirim paket pada sandbox dan uji dampaknya saat satu kabel dicabut."}
                  </p>
                </div>
                <BtnLink
                  href={
                    berikutnya.key.startsWith("materi")
                      ? `/materi/${berikutnya.key.slice(6)}`
                      : berikutnya.key.startsWith("praktik")
                        ? `/praktik/${berikutnya.key.slice(8)}`
                        : berikutnya.key.startsWith("simulasi")
                          ? `/sandbox/${berikutnya.key.slice(9)}`
                          : "/kuis"
                  }
                  tone="primary"
                  className="shrink-0"
                >
                  Kerjakan <IconArrow size={14} />
                </BtnLink>
              </div>
            )}

            {/* Kemajuan per topologi */}
            <section className="mt-10">
              <h2 className="font-display text-title">Kemajuan per topologi</h2>
              <div className="mt-4 grid gap-5 md:grid-cols-3">
                {TOPO_KEYS.map((key) => {
                  const p = topoPercent({ activity, done, quizBest, quizAttempts }, key);
                  return (
                    <div key={key} className="rounded-lg border border-border bg-surface p-5">
                      <div className="lab-grid rounded-md border border-border-3 p-2">
                        <TopoMini kind={key} />
                      </div>
                      <h3 className="mt-4 font-display text-title">{TOPOLOGI[key].title}</h3>
                      <p className="mt-1 text-micro text-ink-3">{TOPO_SPECS[key].subtitle}</p>
                      <div className="mt-3">
                        <PercentBar value={p} label={`Kemajuan ${TOPOLOGI[key].title}`} />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="font-mono text-micro text-ok">
                          {topoXp({ activity, done, quizBest, quizAttempts }, key)} XP
                        </p>
                        <Link
                          href={`/materi/${key}`}
                          className="text-caption font-medium text-signal-bright hover:underline"
                        >
                          Buka modul
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Daftar tahap */}
            <section className="mt-10 overflow-hidden rounded-lg border border-border bg-surface">
              <div className="border-b border-border bg-surface-2 px-5 py-3">
                <h2 className="font-display text-body font-semibold text-ink">Daftar seluruh tahap</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="tech-table min-w-[32rem]">
                  <thead>
                    <tr>
                      <th scope="col">Tahap</th>
                      <th scope="col">Jenis</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TOPO_KEYS.flatMap((t) =>
                      [
                        [materiKey(t), "Materi"],
                        [praktikKey(t), "Praktik"],
                        [simulasiKey(t), "Simulasi"],
                      ].map(([key, jenis]) => (
                        <tr key={key}>
                          <td className="font-medium text-ink">{activityLabel(key)}</td>
                          <td className="font-mono text-ink-3">{jenis}</td>
                          <td>
                            {done[key] ? (
                              <Badge tone="green">Selesai</Badge>
                            ) : (
                              <Badge tone="neutral">Belum</Badge>
                            )}
                          </td>
                        </tr>
                      )),
                    )}
                    <tr>
                      <td className="font-medium text-ink">{activityLabel(KUIS_KEY)}</td>
                      <td className="font-mono text-ink-3">Evaluasi</td>
                      <td>
                        {done[KUIS_KEY] ? (
                          <Badge tone="green">Selesai</Badge>
                        ) : (
                          <Badge tone="neutral">Belum</Badge>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Lencana */}
            <section className="mt-10">
              <h2 className="font-display text-title">Lencana pencapaian</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {lencana.map((l) => (
                  <div
                    key={l.nama}
                    className={cx(
                      "rounded-lg border p-4",
                      l.syarat
                        ? "border-caution/40 bg-surface"
                        : "border-border bg-surface/50 opacity-65",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cx(
                          "grid h-9 w-9 shrink-0 place-items-center rounded-full border",
                          l.syarat
                            ? "border-caution/45 bg-caution-tint text-caution"
                            : "border-border-2 text-ink-4",
                        )}
                      >
                        <IconTrophy size={16} />
                      </span>
                      <div>
                        <p className="font-medium text-ink">{l.nama}</p>
                        <p className="mt-0.5 text-caption text-ink-3">{l.ket}</p>
                        {!l.syarat && <p className="mt-1 text-micro text-ink-4">Belum terbuka</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Kronologi */}
            <section className="mt-10 overflow-hidden rounded-lg border border-border bg-surface">
              <div className="border-b border-border bg-surface-2 px-5 py-3">
                <h2 className="font-display text-body font-semibold text-ink">Aktivitas terbaru</h2>
              </div>
              {kronologi.length === 0 ? (
                <p className="p-5 text-caption text-ink-3">
                  Belum ada aktivitas tercatat. Mulailah dari modul pertama.
                </p>
              ) : (
                <ul className="divide-y divide-border-3">
                  {kronologi.map((a) => (
                    <li key={`${a.key}-${a.at}`} className="flex items-center gap-4 px-5 py-3">
                      <span className="font-mono text-micro text-ink-4">
                        {a.at
                          ? new Date(a.at).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </span>
                      <span className="flex-1 text-caption text-ink-2">
                        {a.label ?? activityLabel(a.key)}
                      </span>
                      <span className="font-mono text-micro text-ok">+{a.xp} XP</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <p className="mt-6 font-mono text-micro text-ink-4">
              Satu tingkat = {XP_PER_LEVEL} XP · Total XP maksimal 700 XP
            </p>
          </Container>
        </main>
        <Footer help />
      </div>
    </RequireAuth>
  );
}
