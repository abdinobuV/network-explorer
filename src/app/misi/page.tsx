"use client";

import Link from "next/link";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { Container, PageHeader, Meter, Badge, StatusDot, BtnLink } from "@/components/ui";
import { TopoMini } from "@/components/topo";
import { TOPOLOGI } from "@/lib/data";
import { TOPO_SPECS } from "@/lib/topology-model";
import { useLearningAnalytics, useProg } from "@/lib/store";
import { XP, levelProgress, materiKey, praktikKey, simulasiKey } from "@/lib/progression";
import { IconArrow, IconChart, IconCheck, IconShield, IconSparkle } from "@/components/icons";

const URUT = ["bus", "ring", "star"] as const;

export default function MisiPage() {
  const { done, xp, quizBest } = useProg();
  const { summary } = useLearningAnalytics();
  const lv = levelProgress(xp);
  const topRec = summary.recommendations[0];

  return (
    <RequireAuth>
      <div className="bg-canvas">
        <Navbar />
        <main id="konten-utama">
          <Container width="page" className="py-10">
            <PageHeader
              chapter="Studi topologi dasar"
              title="Peta misi belajar"
              lead="Tiga bab materi, tiga papan pemasangan kabel, simulasi jaringan, dan satu kuis akhir. Kerjakan berurutan agar setiap konsep saling terhubung."
              meta={
                <span className="inline-flex items-center gap-3">
                  <StatusDot tone="green" label={`Tingkat ${lv.level}`} />
                  <span className="text-ok">{xp.toLocaleString("id-ID")} XP</span>
                </span>
              }
            />

            {/* Rekomendasi adaptif berbasis Learning Analytics */}
            {topRec && (
              <section className="mt-6 flex flex-col items-start justify-between gap-4 rounded-lg border border-signal/35 bg-signal-tint/60 p-5 md:flex-row md:items-center">
                <div>
                  <p className="font-mono text-micro text-signal-bright">
                    PERSONALIZED LEARNING · REKOMENDASI ADAPTIF
                  </p>
                  <p className="mt-1 font-display text-title text-ink">{topRec.title}</p>
                  <p className="mt-1 max-w-2xl text-caption text-ink-2">{topRec.reason}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <BtnLink href={topRec.href} tone="primary" size="sm">
                    {topRec.actionLabel} <IconArrow size={13} />
                  </BtnLink>
                  <BtnLink href="/analitik" tone="ghost" size="sm">
                    <IconChart size={13} /> Analitik
                  </BtnLink>
                  <BtnLink href="/asisten" tone="ghost" size="sm">
                    <IconSparkle size={13} /> Asisten AI
                  </BtnLink>
                </div>
              </section>
            )}

            {/* Kartu utama tiga topologi */}
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {URUT.map((key, i) => {
                const t = TOPOLOGI[key];
                const keys = [materiKey(key), praktikKey(key), simulasiKey(key)];
                const doneCount = keys.filter((k) => done[k]).length;
                const lengkap = doneCount === keys.length;
                return (
                  <article
                    key={key}
                    className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-signal/60"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-border bg-surface-2 px-4 py-2.5">
                      <span className="font-mono text-micro text-ink-3">Level {i + 1}</span>
                      {lengkap ? (
                        <Badge tone="green">
                          <IconCheck size={12} /> Selesai
                        </Badge>
                      ) : doneCount > 0 ? (
                        <Badge tone="amber">{doneCount}/3 tahap</Badge>
                      ) : (
                        <Badge tone="neutral">Belum mulai</Badge>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h2 className="font-display text-title text-ink">{t.title}</h2>
                      <p className="mt-2 text-caption leading-relaxed text-ink-2">{t.desc}</p>

                      <div className="lab-grid mt-4 rounded-md border border-border-3 p-2.5">
                        <TopoMini kind={key} />
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-3 pt-1">
                        <Meter value={doneCount} total={keys.length} label={`Kemajuan ${t.title}`} />
                        <Link
                          href={`/materi/${key}`}
                          className="inline-flex items-center gap-1.5 text-caption font-semibold text-signal-bright hover:underline"
                        >
                          Pelajari <IconArrow size={14} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Banner Kuis Akhir */}
            <section className="mt-8 rounded-lg border border-border bg-surface p-6">
              <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
                <div>
                  <p className="text-caption font-medium text-signal-bright">Evaluasi akhir</p>
                  <h2 className="mt-1 font-display text-head">Kuis akhir studi kasus</h2>
                  <p className="mt-2 max-w-xl text-caption leading-relaxed text-ink-2">
                    Sepuluh soal studi kasus jaringan lengkap dengan pembahasan. Nilai terbaik
                    dicatat; XP bertambah hanya bila nilaimu mencetak rekor baru.
                    {quizBest !== null && (
                      <>
                        {" "}
                        Rekor saat ini:{" "}
                        <span className="font-mono text-ink">{quizBest}/10</span>.
                      </>
                    )}
                  </p>
                </div>
                <BtnLink href="/kuis" tone="primary" size="lg" className="shrink-0">
                  <IconShield size={16} /> Kerjakan kuis
                </BtnLink>
              </div>
            </section>

            {/* Ringkasan aturan & status */}
            <section className="mt-8 overflow-hidden rounded-lg border border-border bg-surface">
              <div className="border-b border-border bg-surface-2 px-5 py-3">
                <h2 className="font-display text-body font-semibold text-ink">
                  Ringkasan aturan dan status tahap
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="tech-table min-w-[42rem]">
                  <caption className="sr-only">Daftar bab dan status penyelesaian</caption>
                  <thead>
                    <tr>
                      <th scope="col" className="w-16">
                        Level
                      </th>
                      <th scope="col">Topologi</th>
                      <th scope="col">Aturan pemasangan</th>
                      <th scope="col" className="w-44">
                        Kemajuan
                      </th>
                      <th scope="col" className="w-28">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {URUT.map((key, i) => {
                      const t = TOPOLOGI[key];
                      const spec = TOPO_SPECS[key];
                      const keys = [materiKey(key), praktikKey(key), simulasiKey(key)];
                      const doneCount = keys.filter((k) => done[k]).length;
                      const lengkap = doneCount === keys.length;
                      return (
                        <tr key={key}>
                          <td className="font-mono text-ink-3">{String(i + 1).padStart(2, "0")}</td>
                          <td>
                            <Link
                              href={`/materi/${key}`}
                              className="font-medium text-ink underline-offset-4 hover:text-signal-bright hover:underline"
                            >
                              {t.title}
                            </Link>
                            <p className="mt-0.5 text-micro text-ink-3">{spec.subtitle}</p>
                          </td>
                          <td className="max-w-sm text-caption">{spec.rule}</td>
                          <td>
                            <Meter
                              value={doneCount}
                              total={keys.length}
                              label={`Kemajuan ${t.title}`}
                            />
                          </td>
                          <td>
                            {lengkap ? (
                              <Badge tone="green">
                                <IconCheck size={12} /> Selesai
                              </Badge>
                            ) : doneCount > 0 ? (
                              <Badge tone="amber">Berjalan</Badge>
                            ) : (
                              <Badge tone="neutral">Belum</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Rubrik penilaian */}
            <section className="mt-8 overflow-hidden rounded-lg border border-border bg-surface">
              <div className="border-b border-border bg-surface-2 px-5 py-3">
                <h2 className="font-display text-body font-semibold text-ink">
                  Rentang penilaian kuis
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="tech-table min-w-[34rem]">
                  <thead>
                    <tr>
                      <th scope="col" className="w-32">
                        Skor
                      </th>
                      <th scope="col" className="w-40">
                        Predikat
                      </th>
                      <th scope="col">Tindak lanjut</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-mono text-ok">80–100</td>
                      <td className="font-medium text-ink">Baik sekali</td>
                      <td>Lanjutkan eksplorasi di sandbox dan coba jelaskan konsepnya ke teman.</td>
                    </tr>
                    <tr>
                      <td className="font-mono text-signal-bright">60–79</td>
                      <td className="font-medium text-ink">Baik</td>
                      <td>Ulangi modul yang paling menantang, lalu kerjakan ulang kuis.</td>
                    </tr>
                    <tr>
                      <td className="font-mono text-caution">0–59</td>
                      <td className="font-medium text-ink">Perlu diulang</td>
                      <td>Baca ulang materi dan selesaikan papan praktik sebelum mengulang kuis.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <p className="mt-5 font-mono text-micro text-ink-4">
              Total XP yang dapat diraih:{" "}
              {(XP.materi + XP.praktik + XP.simulasi) * 3 + XP.kuisPerJawaban * 10} XP
            </p>
          </Container>
        </main>
        <Footer help />
      </div>
    </RequireAuth>
  );
}
