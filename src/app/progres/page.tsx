"use client";

import Link from "next/link";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { Container, Eyebrow, PageHeader, PercentBar, Badge, StatusDot } from "@/components/ui";
import { TopoMini } from "@/components/topo";
import { TOPOLOGI } from "@/lib/data";
import { TOPO_SPECS } from "@/lib/topology-model";
import { useProg } from "@/lib/store";
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
import { IconArrow, IconTrophy } from "@/components/icons";

export default function ProgresPage() {
  const { xp, done, activity, quizBest, quizAttempts } = useProg();
  const lv = levelProgress(xp);
  const persen = overallPercent({ activity, done, quizBest, quizAttempts });
  const berikutnya = nextStage({ activity, done, quizBest, quizAttempts });
  const lencana = [
    { nama: "Pembaca tekun", syarat: done[materiKey("bus")], ket: "Menyelesaikan bab Bus" },
    { nama: "Installer", syarat: done[praktikKey("bus")], ket: "Menyelesaikan praktik Bus" },
    { nama: "Peneliti", syarat: done[simulasiKey("star")], ket: "Menjalankan simulasi Star" },
    { nama: "Ahli kuis", syarat: quizBest !== null && quizBest >= 8, ket: "Nilai kuis minimal 8/10" },
    { nama: "Penuntas", syarat: persen === 100, ket: "Menyelesaikan seluruh 10 tahap" },
  ];

  const kronologi = [...activity].sort((a, b) => b.at - a.at);

  return (
    <RequireAuth>
      <div>
        <Navbar />
        <Container width="page" className="py-10">
          <PageHeader
            chapter="Kartu progress"
            title="Progres belajarmu"
            lead="Semua angka di halaman ini dihitung dari kegiatan yang benar-benar kamu kerjakan — bukan angka contoh."
            meta={
              <span className="inline-flex items-center gap-2">
                <StatusDot tone="blue" label={`Tingkat ${lv.level}`} />
                <span>{xp.toLocaleString("id-ID")} XP</span>
              </span>
            }
          />

          {/* Ringkasan */}
          <div className="mt-6 grid gap-px border border-rule bg-rule sm:grid-cols-3">
            {[
              ["Penyelesaian tahap", `${persen}%`, "dari 10 tahap belajar"],
              ["Tingkat", String(lv.level), `${lv.need - lv.into} XP menuju tingkat ${lv.level + 1}`],
              ["Nilai kuis terbaik", quizBest === null ? "—" : `${quizBest}/10`, `${quizAttempts} percobaan`],
            ].map(([label, nilai, ket]) => (
              <div key={label} className="bg-paper p-5">
                <p className="font-mono text-micro uppercase tracking-[0.12em] text-ink-3">{label}</p>
                <p className="mt-2 font-serif text-head leading-none">{nilai}</p>
                <p className="mt-1.5 text-caption text-ink-3">{ket}</p>
              </div>
            ))}
          </div>

          {/* Berikutnya */}
          {berikutnya && (
            <div className="mt-6 flex flex-col items-start justify-between gap-4 border border-blueprint/40 bg-blueprint-3 p-5 md:flex-row md:items-center">
              <div>
                <Eyebrow>Langkah berikutnya</Eyebrow>
                <p className="mt-1 font-serif text-title">{berikutnya.label}</p>
                <p className="mt-1 text-caption text-ink-2">
                  {berikutnya.key.startsWith("materi")
                    ? "Baca babnya dulu, lalu lanjutkan ke lembar praktik."
                    : berikutnya.key.startsWith("praktik")
                      ? "Pasang kabel sesuai aturan topologi pada lembar kerja."
                      : "Kirim data pada sandbox dan uji dampaknya saat satu kabel dicabut."}
                </p>
              </div>
              <Link
                href={
                  berikutnya.key.startsWith("materi")
                    ? `/materi/${berikutnya.key.slice(6)}`
                    : berikutnya.key.startsWith("praktik")
                      ? `/praktik/${berikutnya.key.slice(8)}`
                      : berikutnya.key.startsWith("simulasi")
                        ? `/sandbox/${berikutnya.key.slice(9)}`
                        : "/kuis"
                }
                className="inline-flex items-center gap-2 rounded-xs border border-ink bg-ink px-4 py-2 font-mono text-caption uppercase tracking-[0.12em] text-paper hover:bg-ink-2"
              >
                Kerjakan <IconArrow size={14} />
              </Link>
            </div>
          )}

          {/* Per topologi */}
          <section className="mt-10">
            <Eyebrow>Kemajuan per bab</Eyebrow>
            <div className="mt-4 grid gap-5 md:grid-cols-3">
              {TOPO_KEYS.map((key) => {
                const p = topoPercent({ activity, done, quizBest, quizAttempts }, key);
                return (
                  <div key={key} className="border border-rule bg-paper p-4">
                    <div className="drafting-grid border border-rule p-2">
                      <TopoMini kind={key} />
                    </div>
                    <h3 className="mt-3 font-serif text-title">{TOPOLOGI[key].title}</h3>
                    <p className="mt-1 font-mono text-micro text-ink-3">{TOPO_SPECS[key].subtitle}</p>
                    <div className="mt-3">
                      <PercentBar
                        value={p}
                        label={`Kemajuan ${TOPOLOGI[key].title}`}
                      />
                    </div>
                    <p className="mt-2 font-mono text-micro text-ink-3">
                      {topoXp({ activity, done, quizBest, quizAttempts }, key)} XP dari bab ini
                    </p>
                    <Link
                      href={`/materi/${key}`}
                      className="mt-3 inline-block font-mono text-micro uppercase tracking-[0.12em] text-blueprint hover:underline"
                    >
                      Buka bab →
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Tahap */}
          <section className="mt-10 border border-rule">
            <div className="border-b border-rule bg-paper-2 px-5 py-3">
              <Eyebrow>Daftar tahap</Eyebrow>
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
                        <td className="text-ink">{activityLabel(key)}</td>
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
                    <td className="text-ink">{activityLabel(KUIS_KEY)}</td>
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
            <Eyebrow>Lencana</Eyebrow>
            <div className="mt-4 grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
              {lencana.map((l) => (
                <div
                  key={l.nama}
                  className={l.syarat ? "bg-paper p-4" : "bg-paper-2 p-4 opacity-70"}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={
                        l.syarat
                          ? "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-amber/50 bg-amber-2 text-amber"
                          : "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-rule-2 text-ink-4"
                      }
                    >
                      <IconTrophy size={16} />
                    </span>
                    <div>
                      <p className="font-medium text-ink">{l.nama}</p>
                      <p className="mt-0.5 text-caption text-ink-3">{l.ket}</p>
                      {!l.syarat && (
                        <p className="mt-1 font-mono text-micro uppercase tracking-[0.1em] text-ink-4">
                          Terkunci
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Kronologi */}
          <section className="mt-10 border border-rule">
            <div className="border-b border-rule bg-paper-2 px-5 py-3">
              <Eyebrow>Aktivitas terbaru</Eyebrow>
            </div>
            {kronologi.length === 0 ? (
              <p className="p-5 text-caption text-ink-3">
                Belum ada aktivitas tercatat. Mulailah dari bab pertama.
              </p>
            ) : (
              <ul className="divide-y divide-rule-3">
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
                    <span className="font-mono text-micro text-blueprint">+{a.xp} XP</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="mt-6 font-mono text-micro text-ink-4">
            Satu tingkat = {XP_PER_LEVEL} XP · total obtainable 850 XP
          </p>
        </Container>
        <Footer help />
      </div>
    </RequireAuth>
  );
}
