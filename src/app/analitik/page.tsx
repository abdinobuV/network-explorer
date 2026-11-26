"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { NextStepFooter } from "@/components/journey-stepper";
import {
  Badge,
  Btn,
  BtnLink,
  Callout,
  Container,
  PageHeader,
  PercentBar,
  StatusDot,
  Toggle,
  cx,
} from "@/components/ui";
import { AccuracyBarChart, DonutMetricChart, ScoreLineChart } from "@/components/analytics-charts";
import {
  IconArrow,
  IconAward,
  IconChart,
  IconDownload,
  IconInfo,
  IconPulse,
  IconShield,
  IconSparkle,
  IconWarning,
} from "@/components/icons";
import { useAuth, useLearningAnalytics, useProg } from "@/lib/store";
import {
  buildSampleStudentAnalytics,
  computeAnalytics,
  formatDuration,
  SAMPLE_CLASS_COHORT,
} from "@/lib/analytics";
import { CONCEPT_META, TOPOLOGI } from "@/lib/data";
import { TOPO_KEYS, topoPercent } from "@/lib/progression";
import { toast } from "@/lib/toast";

const SAMPLE_PROGRESS_DONE: Record<string, boolean> = {
  "materi-bus": true,
  "praktik-bus": true,
  "simulasi-bus": true,
  "materi-ring": true,
  "praktik-ring": true,
  "simulasi-ring": true,
  "materi-star": true,
  "praktik-star": true,
  "simulasi-star": true,
};

export default function AnalitikPage() {
  const { user, isGuru } = useAuth();
  const prog = useProg();
  const { data, setTrackingConsent, resetAnalytics, certification } = useLearningAnalytics();

  const [useSamplePreview, setUseSamplePreview] = useState(false);
  // Guru langsung melihat Analitik Kelas (tidak mengerjakan tugas siswa);
  // Siswa hanya melihat Analitik Pribadinya sendiri (Access Control).
  const effectiveView: "siswa" | "guru" = isGuru ? "guru" : "siswa";

  const sampleData = useMemo(() => buildSampleStudentAnalytics(), []);
  const activeAnalytics = useSamplePreview ? sampleData : data;
  const activeProgress = useMemo(
    () =>
      useSamplePreview
        ? {
            activity: prog.activity,
            done: SAMPLE_PROGRESS_DONE,
            quizBest: 8,
            quizAttempts: 3,
          }
        : {
            activity: prog.activity,
            done: prog.done,
            quizBest: prog.quizBest,
            quizAttempts: prog.quizAttempts,
          },
    [useSamplePreview, prog.activity, prog.done, prog.quizBest, prog.quizAttempts],
  );

  const summary = useMemo(
    () => computeAnalytics(activeProgress, activeAnalytics),
    [activeProgress, activeAnalytics],
  );

  function exportJson() {
    const payload = {
      exportedAt: new Date().toISOString(),
      student: { name: user?.name ?? "Siswa", kelas: user?.kelas ?? "XI" },
      progress: activeProgress,
      analytics: activeAnalytics,
      summary: {
        completionRate: summary.completionRate,
        masteryRate: summary.masteryRate,
        averageQuizScore: summary.averageQuizScore,
        scoreGain: summary.scoreGain,
        weakestConcept: summary.weakestConcept?.label ?? null,
        predictiveLevel: summary.predictive.level,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `learning-analytics-${(user?.name ?? "siswa").toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Data Learning Analytics berhasil diunduh (JSON).", "ok");
  }

  return (
    <RequireAuth>
      <div className="bg-canvas">
        <Navbar />
        <main id="konten-utama">
          <Container width="page" className="py-10">
            <PageHeader
              chapter={
                isGuru
                  ? "Pert-13 · Analitik Kelas Khusus Pendidik"
                  : "Pert-13 · Learning Analytics & Adaptive Learning"
              }
              title={isGuru ? "Analitik Kelas & Diagnosis Soal" : "Dashboard Learning Analytics"}
              lead={
                isGuru
                  ? "Tinjauan agregat perkembangan kelas, analisis butir soal tersulit, dan indikasi kontekstual tanpa pelabelan untuk mendukung keputusan pedagogis guru."
                  : "Mengumpulkan, mengukur, dan menginterpretasikan jejak belajar digital pribadimu untuk membantu keputusan pembelajaran — bukan sekadar menampilkan nilai akhir."
              }
              meta={
                isGuru ? (
                  <span className="inline-flex items-center gap-3">
                    <StatusDot tone="amber" label="Mode Pemantauan Guru" />
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-3">
                    <StatusDot
                      tone={data.trackingConsent ? "green" : "amber"}
                      label={data.trackingConsent ? "Pencatatan aktif" : "Pencatatan dijeda"}
                    />
                    <span className="text-signal-bright">{activeAnalytics.traces.length} jejak</span>
                  </span>
                )
              }
            >
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {isGuru ? (
                    <>
                      <Badge tone="amber">Tinjauan Kelas (Mode Guru)</Badge>
                      <BtnLink href="/guru" tone="primary" size="sm">
                        Buka Daftar &amp; Inspeksi Semua Murid <IconArrow size={13} />
                      </BtnLink>
                    </>
                  ) : (
                    <Badge tone="neutral">
                      <IconShield size={12} /> Privasi: Hanya data belajarmu sendiri
                    </Badge>
                  )}
                </div>

                {effectiveView === "siswa" && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Btn
                      tone={useSamplePreview ? "signal" : "ghost"}
                      size="sm"
                      onClick={() => setUseSamplePreview((v) => !v)}
                    >
                      <IconPulse size={14} />
                      {useSamplePreview ? "Kembali ke data aslimu" : "Pratinjau data contoh"}
                    </Btn>
                    <Btn tone="ghost" size="sm" onClick={exportJson}>
                      <IconDownload size={14} /> Ekspor JSON
                    </Btn>
                  </div>
                )}
              </div>
            </PageHeader>

            {effectiveView === "siswa" ? (
              <div className="mt-8 space-y-10">
                {useSamplePreview && (
                  <Callout tone="warn" label="Mode pratinjau contoh aktif">
                    Kamu sedang melihat simulasi jejak belajar (Pre-Test → Praktik → AI Terverifikasi →
                    Post-Test) untuk demonstrasi 4 tingkat Learning Analytics. Data aslimu tidak berubah.
                  </Callout>
                )}

                {/* ========================================================= */}
                {/* 1. DESCRIPTIVE ANALYTICS — APA YANG TERJADI?              */}
                {/* ========================================================= */}
                <section aria-labelledby="sec-descriptive">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="font-mono text-micro text-signal-bright">
                        01 · DESCRIPTIVE ANALYTICS — APA YANG TERJADI?
                      </p>
                      <h2 id="sec-descriptive" className="mt-1 font-display text-head">
                        Ringkasan metrik bermakna
                      </h2>
                    </div>
                    <Badge tone="blue">Metric relevan tujuan belajar</Badge>
                  </div>

                  {/* Perbandingan Progress vs Mastery (Slide 8) */}
                  <div className="mt-5 grid gap-5 lg:grid-cols-2">
                    <div className="rounded-lg border border-border bg-surface p-5">
                      <DonutMetricChart
                        value={summary.completionRate}
                        label="Progress Penyelesaian Tahap"
                        sublabel="Persentase modul, praktik, dan simulasi yang telah ditandai selesai."
                        tone="signal"
                      />
                    </div>
                    <div className="rounded-lg border border-border bg-surface p-5">
                      <DonutMetricChart
                        value={summary.masteryRate ?? 0}
                        label="Indeks Penguasaan Konsep (Mastery)"
                        sublabel={
                          summary.masteryRate === null
                            ? "Belum terukur — selesaikan Pre-Test, praktik, atau kuis akhir."
                            : "Gabungan skor evaluasi studi kasus (70%) dan akurasi pemasangan kabel (30%)."
                        }
                        tone={
                          summary.masteryRate === null
                            ? "signal"
                            : summary.masteryRate >= 80
                              ? "ok"
                              : summary.masteryRate >= 60
                                ? "caution"
                                : "fault"
                        }
                      />
                    </div>
                  </div>

                  {summary.progressMasteryGap && (
                    <Callout
                      tone="warn"
                      label="Progress 100% belum tentu berarti memahami 100%"
                      className="mt-4"
                    >
                      Penyelesaian tahapmu sudah mencapai{" "}
                      <span className="font-mono text-ink">{summary.completionRate}%</span>, namun
                      indeks penguasaan konsep masih{" "}
                      <span className="font-mono text-ink">{summary.masteryRate}%</span>. Tinjau
                      bagian Diagnostic & Rekomendasi Adaptif di bawah untuk menutup celah konsepnya.
                    </Callout>
                  )}

                  {/* 4 KPI Bermakna */}
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      [
                        "Rata-rata skor kuis",
                        summary.averageQuizScore === null ? "—" : `${summary.averageQuizScore}%`,
                        summary.scoreGain !== null
                          ? `Perubahan ${summary.scoreGain >= 0 ? "+" : ""}${summary.scoreGain} poin`
                          : `${summary.totalQuizAttempts} percobaan`,
                      ],
                      [
                        "Akurasi praktik kabel",
                        summary.practiceAccuracy === null ? "—" : `${summary.practiceAccuracy}%`,
                        `${summary.totalFaultTests} uji cabut kabel di Sandbox`,
                      ],
                      [
                        "Waktu belajar (Time on Task)",
                        formatDuration(summary.totalTimeOnTaskSec),
                        `${summary.loginCount} sesi masuk tercatat`,
                      ],
                      [
                        "Kualitas interaksi & proses",
                        `${summary.reflectionCount + summary.verifiedAiCount}`,
                        `${summary.reflectionCount} refleksi · ${summary.verifiedAiCount} AI terverifikasi`,
                      ],
                    ].map(([label, val, sub]) => (
                      <div key={label} className="rounded-lg border border-border bg-surface p-5">
                        <p className="text-micro font-medium text-ink-3">{label}</p>
                        <p className="mt-2 font-display text-head leading-none text-ink">{val}</p>
                        <p className="mt-2 text-micro text-ink-3">{sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Hindari Vanity Metric (Slide 23) */}
                  <div className="mt-4 rounded-lg border border-border-2 bg-surface-2/60 px-4 py-3 text-caption text-ink-2">
                    <span className="font-semibold text-signal-bright">
                      Mengapa kami menghindari Vanity Metrics?
                    </span>{" "}
                    Jumlah klik atau frekuensi membuka halaman tinggi tidak otomatis menandakan
                    pemahaman — bisa jadi siswa mengulang karena bingung. Oleh karena itu dashboard
                    ini memprioritaskan <span className="text-ink">mastery rate</span>,{" "}
                    <span className="text-ink">pre-test vs post-test gain</span>,{" "}
                    <span className="text-ink">akurasi praktik</span>, dan{" "}
                    <span className="text-ink">kualitas refleksi</span>.
                  </div>
                </section>

                {/* ========================================================= */}
                {/* VISUALISASI SESUAI PERTANYAAN (Slide 20–21)               */}
                {/* ========================================================= */}
                <section aria-labelledby="sec-viz" className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-lg border border-border bg-surface p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-micro text-signal-bright">LINE CHART</p>
                        <h3 id="sec-viz" className="mt-0.5 font-display text-title">
                          Bagaimana perubahan nilai dari waktu ke waktu?
                        </h3>
                      </div>
                      {summary.pretestPercent !== null && summary.posttestPercent !== null && (
                        <Badge tone={summary.scoreGain && summary.scoreGain >= 0 ? "green" : "amber"}>
                          Pre {summary.pretestPercent}% → Post {summary.posttestPercent}%
                        </Badge>
                      )}
                    </div>
                    <div className="mt-4">
                      <ScoreLineChart
                        points={summary.scoreTimeline.map((p) => ({
                          label: p.label,
                          value: p.percent,
                        }))}
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-surface p-5">
                    <p className="font-mono text-micro text-signal-bright">BAR CHART</p>
                    <h3 className="mt-0.5 font-display text-title">
                      Konsep mana yang paling banyak salah?
                    </h3>
                    <p className="mt-1 text-caption text-ink-3">
                      Merah (&lt;60%) perlu penguatan segera · Kuning (60–79%) berkembang · Hijau
                      (≥80%) menguasai.
                    </p>
                    <div className="mt-4">
                      <AccuracyBarChart
                        items={summary.concepts.map((c) => ({
                          label: c.label,
                          value: c.accuracy,
                          meta:
                            c.answered > 0
                              ? `${c.correct}/${c.answered} soal${c.practiceRejects > 0 ? ` · ${c.practiceRejects} tolakan` : ""}`
                              : c.practiceRejects > 0
                                ? `${c.practiceRejects} tolakan praktik`
                                : "Belum diuji",
                        }))}
                        emptyText="Kerjakan Pre-Test atau Kuis Akhir agar akurasi tiap konsep (Bus, Ring, Star, Diagnostik) dapat dipetakan."
                      />
                    </div>
                  </div>
                </section>

                {/* Progress Bar per topologi */}
                <section className="rounded-lg border border-border bg-surface p-5">
                  <p className="font-mono text-micro text-signal-bright">PROGRESS BAR</p>
                  <h3 className="mt-0.5 font-display text-title">
                    Penyelesaian & keterlibatan tiap topologi
                  </h3>
                  <div className="mt-4 grid gap-5 md:grid-cols-3">
                    {TOPO_KEYS.map((key) => {
                      const pct = topoPercent(activeProgress, key);
                      const m = activeAnalytics.materi[key];
                      const p = activeAnalytics.praktik[key];
                      const s = activeAnalytics.simulasi[key];
                      return (
                        <div key={key} className="rounded-md border border-border bg-canvas/60 p-4">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-display text-body font-semibold text-ink">
                              {TOPOLOGI[key].title}
                            </p>
                            <span className="font-mono text-micro text-ink-3">
                              {formatDuration(m.timeSec)}
                            </span>
                          </div>
                          <div className="mt-2.5">
                            <PercentBar value={pct} label={`Kemajuan ${TOPOLOGI[key].title}`} />
                          </div>
                          <dl className="mt-3 grid grid-cols-2 gap-2 text-micro text-ink-3">
                            <div>
                              Video:{" "}
                              <span className={m.videoOpened ? "text-ok" : "text-ink-4"}>
                                {m.videoOpened ? "Sudah" : "Belum"}
                              </span>
                            </div>
                            <div>
                              Cek paham:{" "}
                              <span className={m.cekAnswered ? "text-ok" : "text-ink-4"}>
                                {m.cekAnswered ? "Tertulis" : "Belum"}
                              </span>
                            </div>
                            <div>
                              Tolakan kabel:{" "}
                              <span className="font-mono text-ink">{p.rejectedConnections}</span>
                            </div>
                            <div>
                              Uji gangguan:{" "}
                              <span className="font-mono text-ink">{s.faultTests}×</span>
                            </div>
                          </dl>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* ========================================================= */}
                {/* 2. DIAGNOSTIC ANALYTICS — MENGAPA TERJADI?                */}
                {/* ========================================================= */}
                <section aria-labelledby="sec-diagnostic" className="space-y-5">
                  <div>
                    <p className="font-mono text-micro text-signal-bright">
                      02 · DIAGNOSTIC ANALYTICS — MENGAPA TERJADI?
                    </p>
                    <h2 id="sec-diagnostic" className="mt-1 font-display text-head">
                      Alur Data → Informasi → Interpretasi → Keputusan
                    </h2>
                  </div>

                  {/* Pipeline Data != Informasi (Slide 4 & 17) */}
                  <div className="grid gap-4 md:grid-cols-4">
                    {(
                      [
                        ["1. Data", summary.decisionPipeline.data, "border-border-2"],
                        ["2. Informasi", summary.decisionPipeline.information, "border-signal/40"],
                        ["3. Interpretasi", summary.decisionPipeline.interpretation, "border-caution/40"],
                        ["4. Keputusan / Aksi", summary.decisionPipeline.action, "border-ok/40"],
                      ] as const
                    ).map(([step, text, borderCls]) => (
                      <div
                        key={step}
                        className={cx("rounded-lg border bg-surface p-4", borderCls)}
                      >
                        <p className="font-mono text-micro font-semibold text-signal-bright">
                          {step}
                        </p>
                        <p className="mt-2 text-caption leading-relaxed text-ink-2">{text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Analisis Butir Soal (Slide 13) */}
                  <div className="overflow-hidden rounded-lg border border-border bg-surface">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-2 px-5 py-3">
                      <h3 className="font-display text-body font-semibold text-ink">
                        Tabel Analisis Butir Soal (10 Studi Kasus)
                      </h3>
                      {summary.mostDifficultQuestion && (
                        <Badge tone="red">
                          Perhatian: Soal #{summary.mostDifficultQuestion.id} (
                          {summary.mostDifficultQuestion.accuracy}%)
                        </Badge>
                      )}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="tech-table min-w-[40rem]">
                        <thead>
                          <tr>
                            <th scope="col" className="w-16">
                              No
                            </th>
                            <th scope="col">Konsep</th>
                            <th scope="col">Pertanyaan</th>
                            <th scope="col" className="w-28">
                              Benar
                            </th>
                            <th scope="col" className="w-32">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {summary.itemAnalysis.map((item) => (
                            <tr key={item.id}>
                              <td className="font-mono text-ink-3">
                                {String(item.id).padStart(2, "0")}
                              </td>
                              <td className="font-mono text-micro text-signal-bright">
                                {CONCEPT_META[item.concept].short}
                              </td>
                              <td className="text-ink">{item.question}</td>
                              <td className="font-mono">
                                {item.accuracy === null
                                  ? "—"
                                  : `${item.accuracy}% (${item.correctCount}/${item.attempts})`}
                              </td>
                              <td>
                                {item.accuracy === null ? (
                                  <Badge tone="neutral">Belum diuji</Badge>
                                ) : item.needsAttention ? (
                                  <Badge tone="red">Perlu tinjau</Badge>
                                ) : item.accuracy < 80 ? (
                                  <Badge tone="amber">Berkembang</Badge>
                                ) : (
                                  <Badge tone="green">Tuntas</Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                {/* ========================================================= */}
                {/* 3. PREDICTIVE & 4. PRESCRIPTIVE ANALYTICS                 */}
                {/* ========================================================= */}
                <section className="grid gap-6 lg:grid-cols-2">
                  {/* Predictive (Slide 14 & 27) */}
                  <div className="rounded-lg border border-border bg-surface p-6">
                    <p className="font-mono text-micro text-signal-bright">
                      03 · PREDICTIVE ANALYTICS — APA YANG MUNGKIN TERJADI?
                    </p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <h2 className="font-display text-title">Indikasi dini & konteks belajar</h2>
                      <Badge
                        tone={
                          summary.predictive.level === "rendah"
                            ? "green"
                            : summary.predictive.level === "sedang"
                              ? "amber"
                              : "red"
                        }
                      >
                        {summary.predictive.label}
                      </Badge>
                    </div>

                    <ul className="mt-4 space-y-2">
                      {summary.predictive.indicators.map((ind) => (
                        <li key={ind} className="flex gap-2.5 text-caption text-ink-2">
                          <IconInfo size={15} className="mt-0.5 shrink-0 text-signal-bright" />
                          <span>{ind}</span>
                        </li>
                      ))}
                    </ul>

                    <Callout
                      tone="note"
                      label="Etika Learning Analytics — Jangan memberi label terlalu cepat"
                      className="mt-5"
                    >
                      <p>{summary.predictive.ethicalNote}</p>
                      <p className="mt-2 font-medium text-ink">
                        Kemungkinan konteks lain yang perlu dipertimbangkan guru:
                      </p>
                      <ul className="mt-1 list-disc space-y-1 pl-4">
                        {summary.predictive.contextualAlternatives.map((alt) => (
                          <li key={alt}>{alt}</li>
                        ))}
                      </ul>
                    </Callout>
                  </div>

                  {/* Prescriptive (Slide 15, 24, 25, 29) */}
                  <div className="rounded-lg border border-border bg-surface p-6">
                    <p className="font-mono text-micro text-signal-bright">
                      04 · PRESCRIPTIVE ANALYTICS — APA YANG SEBAIKNYA DILAKUKAN?
                    </p>
                    <h2 className="mt-2 font-display text-title">
                      Rekomendasi Personalized Learning
                    </h2>
                    <p className="mt-1 text-caption text-ink-3">
                      Alur otomatis: Learning Data → Analytics → AI → Rekomendasi Adaptif.
                    </p>

                    <div className="mt-4 space-y-3">
                      {summary.recommendations.map((rec) => (
                        <div
                          key={rec.id}
                          className="rounded-md border border-border-2 bg-canvas/60 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-medium text-ink">{rec.title}</p>
                            <Badge
                              tone={
                                rec.priority === "tinggi"
                                  ? "red"
                                  : rec.priority === "sedang"
                                    ? "amber"
                                    : "blue"
                              }
                            >
                              Prioritas {rec.priority}
                            </Badge>
                          </div>
                          <p className="mt-1.5 text-caption text-ink-2">{rec.reason}</p>
                          <div className="mt-3">
                            <BtnLink href={rec.href} tone="signal" size="sm">
                              {rec.actionLabel} <IconArrow size={13} />
                            </BtnLink>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* ========================================================= */}
                {/* KESIAPAN SERTIFIKAT & JEJAK DIGITAL (TABLE)               */}
                {/* ========================================================= */}
                <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
                  <div className="overflow-hidden rounded-lg border border-border bg-surface">
                    <div className="flex items-center justify-between gap-2 border-b border-border bg-surface-2 px-5 py-3">
                      <h3 className="font-display text-body font-semibold text-ink">
                        Tabel Jejak Digital Pembelajaran (Digital Traces)
                      </h3>
                      <span className="font-mono text-micro text-ink-3">
                        {activeAnalytics.traces.length} entri
                      </span>
                    </div>
                    {activeAnalytics.traces.length === 0 ? (
                      <p className="p-5 text-caption text-ink-3">
                        Belum ada jejak aktivitas. Buka materi, praktik, simulasi, atau kuis untuk
                        mulai merekam proses belajarmu.
                      </p>
                    ) : (
                      <div className="max-h-80 overflow-y-auto">
                        <table className="tech-table">
                          <thead>
                            <tr>
                              <th scope="col">Waktu</th>
                              <th scope="col">Kategori</th>
                              <th scope="col">Aktivitas</th>
                              <th scope="col">Rincian</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeAnalytics.traces.slice(0, 20).map((t) => (
                              <tr key={t.id}>
                                <td className="whitespace-nowrap font-mono text-micro text-ink-4">
                                  {new Date(t.at).toLocaleDateString("id-ID", {
                                    day: "2-digit",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </td>
                                <td>
                                  <Badge
                                    tone={
                                      t.category === "assessment"
                                        ? "green"
                                        : t.category === "ai"
                                          ? "blue"
                                          : "neutral"
                                    }
                                  >
                                    {t.category}
                                  </Badge>
                                </td>
                                <td className="font-medium text-ink">{t.action}</td>
                                <td className="text-ink-2">{t.detail}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Privasi, Kendali Data & Sertifikasi (Slide 26) */}
                  <aside className="space-y-5">
                    <div className="rounded-lg border border-border bg-surface p-5">
                      <div className="flex items-center gap-2 text-signal-bright">
                        <IconAward size={18} />
                        <p className="text-caption font-semibold text-ink">Status Sertifikasi</p>
                      </div>
                      <p className="mt-2 font-mono text-caption text-ok">
                        {certification.completedCount}/{certification.totalChecks} syarat terpenuhi
                      </p>
                      <p className="mt-1 text-caption text-ink-3">
                        {certification.eligible
                          ? "Sertifikat Kompetensi Digital & Rapor Proses siap dicetak!"
                          : "Selesaikan seluruh tahap, kuis ≥80%, dan minimal 1 bukti proses untuk membuka sertifikat."}
                      </p>
                      <BtnLink href="/cetak" tone="primary" size="sm" className="mt-4 w-full">
                        Buka Sertifikat & Rapor <IconArrow size={13} />
                      </BtnLink>
                    </div>

                    <div className="rounded-lg border border-border bg-surface p-5">
                      <div className="flex items-center gap-2 text-signal-bright">
                        <IconShield size={18} />
                        <p className="text-caption font-semibold text-ink">
                          Privasi & Transparansi Data
                        </p>
                      </div>
                      <p className="mt-2 text-micro leading-relaxed text-ink-3">
                        Data pembelajaran adalah data pengguna (Privacy, Security, Transparency,
                        Access Control, Responsible Use). Kamu memegang kendali penuh atas jejak
                        belajarmu.
                      </p>
                      <div className="mt-4 border-t border-border-3 pt-4">
                        <Toggle
                          id="tracking-consent"
                          label="Rekam jejak belajar"
                          description="Izinkan pencatatan waktu, praktik, dan analisis soal untuk rekomendasi personal."
                          checked={data.trackingConsent}
                          onChange={(v) => {
                            setTrackingConsent(v);
                            toast(
                              v
                                ? "Pencatatan Learning Analytics diaktifkan."
                                : "Pencatatan Learning Analytics dijeda.",
                            );
                          }}
                        />
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Btn
                          tone="danger"
                          size="sm"
                          onClick={() => {
                            resetAnalytics();
                            toast("Seluruh jejak Learning Analytics telah dibersihkan.");
                          }}
                        >
                          Hapus jejak analitik
                        </Btn>
                        <Link
                          href="/privasi"
                          className="inline-flex items-center px-2 py-1.5 text-micro font-medium text-signal-bright hover:underline"
                        >
                          Kebijakan privasi
                        </Link>
                      </div>
                    </div>
                  </aside>
                </section>
              </div>
            ) : (
              /* =========================================================== */
              /* TAMPILAN TINJAUAN GURU (SIMULASI KELAS 32 SISWA — SLIDE 10) */
              /* =========================================================== */
              <div className="mt-8 space-y-8">
                <Callout tone="note" label="Mode Tinjauan Guru (Simulasi Kelas — Pert-13 Slide 10–18)">
                  Tampilan ini memperlihatkan bagaimana pendidik memanfaatkan dashboard Learning
                  Analytics pada kelas berisi{" "}
                  <span className="font-mono text-ink">{SAMPLE_CLASS_COHORT.students} siswa</span>{" "}
                  untuk mendiagnosis soal tersulit dan merancang intervensi pedagogis — tanpa
                  melabeli siswa secara tergesa-gesa.
                </Callout>

                {/* KPI Kelas (Slide 10) */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {[
                    ["Total Siswa", String(SAMPLE_CLASS_COHORT.students), "Kelas XI-IPA 1"],
                    [
                      "Completed",
                      String(SAMPLE_CLASS_COHORT.completed),
                      `${Math.round((SAMPLE_CLASS_COHORT.completed / SAMPLE_CLASS_COHORT.students) * 100)}% tuntas modul`,
                    ],
                    ["Average Score", `${SAMPLE_CLASS_COHORT.averageScore}`, "Skala 0–100"],
                    ["Not Submitted", String(SAMPLE_CLASS_COHORT.notSubmitted), "Perlu konfirmasi akses"],
                    [
                      "Most Difficult",
                      `Soal #${SAMPLE_CLASS_COHORT.mostDifficultQuestionId}`,
                      "38% benar (Collision Bus)",
                    ],
                  ].map(([label, val, sub]) => (
                    <div key={label} className="rounded-lg border border-border bg-surface p-4">
                      <p className="text-micro font-medium text-ink-3">{label}</p>
                      <p className="mt-1.5 font-display text-head leading-none text-ink">{val}</p>
                      <p className="mt-2 text-micro text-ink-3">{sub}</p>
                    </div>
                  ))}
                </div>

                {/* Grafik Kelas: Line Chart Mingguan + Bar Chart Analisis Butir Soal */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-lg border border-border bg-surface p-5">
                    <p className="font-mono text-micro text-signal-bright">LINE CHART · 4 MINGGU</p>
                    <h2 className="mt-0.5 font-display text-title">
                      Bagaimana perubahan rata-rata nilai kelas?
                    </h2>
                    <div className="mt-4">
                      <ScoreLineChart
                        points={SAMPLE_CLASS_COHORT.weeklyAvg.map((w) => ({
                          label: w.week.replace("Minggu ", "M"),
                          value: w.score,
                        }))}
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-surface p-5">
                    <p className="font-mono text-micro text-signal-bright">
                      BAR CHART · ANALISIS SOAL (SLIDE 13)
                    </p>
                    <h2 className="mt-0.5 font-display text-title">
                      Soal mana yang paling banyak salah?
                    </h2>
                    <div className="mt-4">
                      <AccuracyBarChart
                        items={SAMPLE_CLASS_COHORT.itemAccuracy.map((it) => ({
                          label: it.label,
                          value: it.correctPct,
                        }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Diagnostic kelas: Soal 5 */}
                <div className="rounded-lg border border-fault/35 bg-surface p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <IconWarning size={18} className="text-fault" />
                    <h2 className="font-display text-title">
                      Keputusan Berbasis Data: Fokus Intervensi Soal #5 (Collision pada Bus)
                    </h2>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-4">
                    {[
                      ["Data", "Hanya 38% (12/32 siswa) menjawab benar Soal #5."],
                      ["Informasi", "Kesalahan terkonsentrasi pada konsep media bersama & collision."],
                      [
                        "Interpretasi",
                        "Apakah wording soal membingungkan, atau konsep prasyarat media bersama Bus vs Token Ring belum dipahami?",
                      ],
                      [
                        "Keputusan Guru",
                        "Jelaskan ulang perbedaan media bersama vs full-duplex, demonstrasikan di Sandbox, lalu beri latihan adaptif.",
                      ],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-md border border-border bg-canvas/60 p-3.5">
                        <p className="font-mono text-micro text-signal-bright">{k}</p>
                        <p className="mt-1.5 text-caption text-ink-2">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tabel siswa anonim butuh konfirmasi kontekstual */}
                <div className="overflow-hidden rounded-lg border border-border bg-surface">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-2 px-5 py-3">
                    <h2 className="font-display text-body font-semibold text-ink">
                      Indikasi Kontekstual Siswa (Tanpa Label Negatif)
                    </h2>
                    <BtnLink href="/asisten?mode=teacher" tone="ghost" size="sm">
                      <IconSparkle size={14} /> Susun draft intervensi di Asisten AI
                    </BtnLink>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="tech-table min-w-[40rem]">
                      <thead>
                        <tr>
                          <th scope="col">Peserta (Anonim)</th>
                          <th scope="col">Progress</th>
                          <th scope="col">Skor Terakhir</th>
                          <th scope="col">Terakhir Aktif</th>
                          <th scope="col">Catatan Interpretasi & Tindak Lanjut Guru</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SAMPLE_CLASS_COHORT.flaggedContexts.map((row) => (
                          <tr key={row.studentAlias}>
                            <td className="font-medium text-ink">{row.studentAlias}</td>
                            <td className="font-mono">{row.progressPct}%</td>
                            <td className="font-mono text-caution">{row.lastScore}</td>
                            <td className="font-mono text-ink-3">{row.inactiveDays} hari lalu</td>
                            <td className="text-ink-2">{row.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <Callout tone="ok" label="Prinsip Utama: Data Tidak Menggantikan Guru">
                  Dashboard menunjukkan pola, tetapi sistem tidak mengetahui apakah siswa sakit,
                  terkendala perangkat, atau belajar dari sumber lain. Professional judgment guru
                  tetap menjadi penentu utama setiap keputusan pembelajaran.
                </Callout>
              </div>
            )}

            {isGuru ? (
              <NextStepFooter
                prev={{ label: "Dashboard Pemantauan Murid", href: "/guru" }}
                next={{
                  label: "Lanjut ke Asisten AI Guru (Draft Studi Kasus & Rubrik)",
                  href: "/asisten?mode=teacher",
                  description:
                    "Gunakan temuan soal tersulit kelas untuk menyusun draft penjelasan ulang, variasi latihan remedial, atau rubrik penilaian proses.",
                }}
                hint="ALUR KERJA PENDIDIK · DIAGNOSIS KELAS → RANCANG INTERVENSI"
              />
            ) : (
              <NextStepFooter
                prev={{ label: "Kuis Akhir", href: "/kuis" }}
                next={
                  certification.eligible
                    ? {
                        label: "Lanjut ke Tahap 5: Cetak Sertifikat Kompetensi",
                        href: "/cetak",
                        description:
                          "Seluruh syarat kelulusan telah terpenuhi. Cetak Sertifikat Kompetensi & Rapor Prosesmu.",
                      }
                    : {
                        label: "Lanjut ke Tahap 4b: Asisten Belajar AI & Bukti Proses",
                        href: "/asisten",
                        description:
                          "Perkuat konsep yang masih lemah, latih deteksi halusinasi AI, dan simpan refleksi proses untuk membuka sertifikat.",
                      }
                }
                hint="TAHAP 4 · ANALITIK → PENGUATAN & KELULUSAN"
              />
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-micro text-ink-3">
              <span className="inline-flex items-center gap-2">
                <IconChart size={14} className="text-signal-bright" />
                Learning Data → Learning Analytics → AI → Personalized Learning
              </span>
              <div className="flex flex-wrap gap-4">
                <Link href="/asisten" className="text-signal-bright hover:underline">
                  Buka Asisten Belajar AI
                </Link>
                <Link href="/progres" className="text-signal-bright hover:underline">
                  Ringkasan Progres
                </Link>
              </div>
            </div>
          </Container>
        </main>
        <Footer help />
      </div>
    </RequireAuth>
  );
}
