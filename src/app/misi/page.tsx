"use client";

import Link from "next/link";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { JourneyPhaseStrip } from "@/components/journey-stepper";
import {
  Container,
  PageHeader,
  Meter,
  Badge,
  StatusDot,
  BtnLink,
  PercentBar,
  cx,
} from "@/components/ui";
import { TopoMini } from "@/components/topo";
import { TOPOLOGI } from "@/lib/data";
import { TOPO_SPECS } from "@/lib/topology-model";
import { useLearningAnalytics, useProg } from "@/lib/store";
import {
  XP,
  levelProgress,
  materiKey,
  overallPercent,
  praktikKey,
  simulasiKey,
} from "@/lib/progression";
import { getGuidedNextAction, getJourneyPhases } from "@/lib/learning-path";
import {
  IconArrow,
  IconAward,
  IconChart,
  IconCheck,
  IconShield,
  IconSparkle,
} from "@/components/icons";

const URUT = ["bus", "ring", "star"] as const;

export default function MisiPage() {
  const { done, xp, activity, quizBest, quizAttempts } = useProg();
  const { data: analytics, summary, certification } = useLearningAnalytics();

  const progressState = { activity, done, quizBest, quizAttempts };
  const lv = levelProgress(xp);
  const overallPct = overallPercent(progressState);
  const nextAction = getGuidedNextAction(progressState, analytics, certification);
  const phases = getJourneyPhases(progressState, analytics, certification);
  const hasPretest = analytics.quizHistory.some((q) => q.kind === "pretest");
  const topRec = summary.recommendations[0];

  return (
    <RequireAuth>
      <div className="bg-canvas">
        <Navbar />
        <main id="konten-utama">
          <Container width="page" className="py-10">
            <PageHeader
              chapter="Alur belajar terarah · Langkah 1 sampai 5"
              title="Peta misi belajar"
              lead="Ikuti urutan 5 tahap dari atas ke bawah: mulai dari cek awal, tuntaskan 3 modul (Bus → Ring → Star), kerjakan Kuis Akhir, tinjau Analitik & AI, hingga cetak Sertifikat."
              meta={
                <span className="inline-flex items-center gap-3">
                  <StatusDot tone="green" label={`Tingkat ${lv.level}`} />
                  <span className="text-ok">{xp.toLocaleString("id-ID")} XP</span>
                </span>
              }
            />

            {/* =============================================================== */}
            {/* HERO: LANGKAH YANG HARUS DIKERJAKAN SEKARANG                    */}
            {/* =============================================================== */}
            <section className="mt-6 rounded-lg border-2 border-signal/50 bg-signal-tint/60 p-6">
              <div className="flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="blue">{nextAction.phaseLabel}</Badge>
                    <span className="font-mono text-micro text-ink-3">
                      Langkah {nextAction.stepIndex} dari {nextAction.totalSteps} · Progres{" "}
                      {overallPct}%
                    </span>
                  </div>
                  <h2 className="mt-2 font-display text-head text-ink">{nextAction.title}</h2>
                  <p className="mt-1.5 text-caption leading-relaxed text-ink-2">
                    {nextAction.description}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2.5">
                  <BtnLink href={nextAction.href} tone="primary" size="lg">
                    {nextAction.cta} <IconArrow size={15} />
                  </BtnLink>
                  {!hasPretest && nextAction.phase === 2 && (
                    <BtnLink href="/kuis?mode=pretest" tone="ghost" size="lg">
                      Ambil Pre-Test dulu
                    </BtnLink>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <PercentBar value={overallPct} label="Kemajuan seluruh tahap belajar" />
              </div>
            </section>

            {/* Strip 5 Fase Besar (Mulai → Selesai) */}
            <section className="mt-6">
              <JourneyPhaseStrip phases={phases} />
            </section>

            {/* =============================================================== */}
            {/* LANGKAH 1 (OPSIONAL): PRE-TEST DIAGNOSTIK AWAL                  */}
            {/* =============================================================== */}
            <section className="mt-10 rounded-lg border border-border bg-surface p-5">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div className="flex items-start gap-3.5">
                  <span
                    className={cx(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full font-mono text-caption font-bold",
                      hasPretest
                        ? "bg-ok text-ok-ink"
                        : "border border-signal/50 bg-signal-tint text-signal-bright",
                    )}
                  >
                    {hasPretest ? <IconCheck size={14} /> : "1"}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-title">
                        Tahap 1 · Cek Kemampuan Awal (Pre-Test)
                      </h2>
                      <Badge tone={hasPretest ? "green" : "neutral"}>
                        {hasPretest ? "Sudah dikerjakan" : "Opsional · Disarankan"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-caption text-ink-2">
                      Kerjakan sebelum belajar agar Dashboard Learning Analytics bisa menghitung
                      kenaikan pemahamanmu secara otomatis dari Pre-Test ke Post-Test.
                    </p>
                  </div>
                </div>
                <BtnLink
                  href="/kuis?mode=pretest"
                  tone={hasPretest ? "ghost" : "signal"}
                  size="sm"
                  className="shrink-0"
                >
                  {hasPretest ? "Lihat / Ulang Pre-Test" : "Mulai Pre-Test"} <IconArrow size={13} />
                </BtnLink>
              </div>
            </section>

            {/* =============================================================== */}
            {/* LANGKAH 2 (INTI): 3 MODUL TOPOLOGI BERURUTAN (BUS → RING → STAR)*/}
            {/* =============================================================== */}
            <section className="mt-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-signal font-mono text-caption font-bold text-ok-ink">
                    2
                  </span>
                  <div>
                    <h2 className="font-display text-head">
                      Tahap 2 · Selesaikan 3 Modul Topologi Secara Berurutan
                    </h2>
                    <p className="text-caption text-ink-2">
                      Setiap modul terdiri dari 3 langkah berurutan:{" "}
                      <strong className="text-ink">① Baca Materi → ② Pasang Kabel → ③ Uji Sandbox</strong>.
                    </p>
                  </div>
                </div>
                <BtnLink href="/perbandingan" tone="ghost" size="sm">
                  Tabel Perbandingan Bus vs Ring vs Star
                </BtnLink>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-3">
                {URUT.map((key, i) => {
                  const t = TOPOLOGI[key];
                  const spec = TOPO_SPECS[key];
                  const mDone = !!done[materiKey(key)];
                  const pDone = !!done[praktikKey(key)];
                  const sDone = !!done[simulasiKey(key)];
                  const doneCount = [mDone, pDone, sDone].filter(Boolean).length;
                  const lengkap = doneCount === 3;

                  const nextModuleHref = !mDone
                    ? `/materi/${key}`
                    : !pDone
                      ? `/praktik/${key}`
                      : !sDone
                        ? `/sandbox/${key}`
                        : `/materi/${key}`;
                  const nextModuleLabel = !mDone
                    ? "1. Baca Materi"
                    : !pDone
                      ? "2. Pasang Kabel"
                      : !sDone
                        ? "3. Uji Sandbox"
                        : "Tinjau ulang";

                  const miniSteps = [
                    { label: "1. Materi", href: `/materi/${key}`, ok: mDone },
                    { label: "2. Praktik", href: `/praktik/${key}`, ok: pDone },
                    { label: "3. Sandbox", href: `/sandbox/${key}`, ok: sDone },
                  ];

                  return (
                    <article
                      key={key}
                      className={cx(
                        "flex flex-col overflow-hidden rounded-lg border bg-surface transition-colors",
                        lengkap
                          ? "border-ok/40"
                          : nextAction.href.includes(`/${key}`)
                            ? "border-signal"
                            : "border-border hover:border-border-2",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-border bg-surface-2 px-4 py-2.5">
                        <span className="font-mono text-micro font-semibold text-signal-bright">
                          Modul {i + 1} dari 3
                        </span>
                        {lengkap ? (
                          <Badge tone="green">
                            <IconCheck size={12} /> Tuntas 3/3
                          </Badge>
                        ) : doneCount > 0 ? (
                          <Badge tone="amber">Sedang jalan ({doneCount}/3)</Badge>
                        ) : (
                          <Badge tone="neutral">Belum mulai</Badge>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="font-display text-title text-ink">{t.title}</h3>
                        <p className="mt-1.5 text-caption leading-relaxed text-ink-2">{t.desc}</p>

                        <div className="lab-grid mt-4 rounded-md border border-border-3 p-2.5">
                          <TopoMini kind={key} />
                        </div>

                        <p className="mt-3 text-micro text-ink-3">{spec.rule}</p>

                        {/* 3 Langkah Mini di dalam Modul */}
                        <div className="mt-4 grid grid-cols-3 gap-1.5">
                          {miniSteps.map((ms) => (
                            <Link
                              key={ms.label}
                              href={ms.href}
                              className={cx(
                                "flex items-center justify-center gap-1 rounded-xs border px-2 py-1.5 font-mono text-[11px] font-medium transition-colors",
                                ms.ok
                                  ? "border-ok/40 bg-ok-tint/60 text-ok"
                                  : "border-border bg-canvas text-ink-2 hover:border-signal hover:text-signal-bright",
                              )}
                            >
                              {ms.ok && <IconCheck size={10} />}
                              {ms.label}
                            </Link>
                          ))}
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border-3 pt-4">
                          <Meter value={doneCount} total={3} label={`Kemajuan ${t.title}`} />
                          <Link
                            href={nextModuleHref}
                            className="inline-flex shrink-0 items-center gap-1.5 text-caption font-semibold text-signal-bright hover:underline"
                          >
                            {nextModuleLabel} <IconArrow size={14} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* =============================================================== */}
            {/* LANGKAH 3: EVALUASI KUIS AKHIR                                  */}
            {/* =============================================================== */}
            <section className="mt-10 rounded-lg border border-border bg-surface p-6">
              <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
                <div className="flex items-start gap-3.5">
                  <span
                    className={cx(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full font-mono text-caption font-bold",
                      quizBest !== null && quizBest >= 8
                        ? "bg-ok text-ok-ink"
                        : "border border-border-2 bg-surface-2 text-ink",
                    )}
                  >
                    {quizBest !== null && quizBest >= 8 ? <IconCheck size={14} /> : "3"}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-head">Tahap 3 · Evaluasi Kuis Akhir</h2>
                      {quizBest !== null && (
                        <Badge tone={quizBest >= 8 ? "green" : "amber"}>
                          Rekor: {quizBest}/10 {quizBest >= 8 ? "(Tuntas)" : "(Target ≥8)"}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1.5 max-w-xl text-caption leading-relaxed text-ink-2">
                      Setelah menyelesaikan Bus, Ring, dan Star, kerjakan 10 soal studi kasus
                      jaringan. Target ketuntasan sertifikat adalah minimal{" "}
                      <span className="font-mono text-ink">8/10 (80%)</span>.
                    </p>
                  </div>
                </div>
                <BtnLink href="/kuis" tone="primary" size="lg" className="shrink-0">
                  <IconShield size={16} /> Kerjakan kuis akhir
                </BtnLink>
              </div>
            </section>

            {/* =============================================================== */}
            {/* LANGKAH 4: ANALITIK, LATIHAN ADAPTIF & ASISTEN AI               */}
            {/* =============================================================== */}
            <section className="mt-10">
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border-2 bg-surface-2 font-mono text-caption font-bold text-ink">
                  4
                </span>
                <div>
                  <h2 className="font-display text-head">
                    Tahap 4 · Evaluasi Data, Penguatan Adaptif &amp; Asisten AI
                  </h2>
                  <p className="text-caption text-ink-2">
                    Periksa konsep yang masih lemah lewat Dashboard Learning Analytics dan perkuat
                    pemahamanmu bersama Asisten Belajar AI.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <div className="flex flex-col justify-between rounded-lg border border-border bg-surface p-5">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-micro text-signal-bright">LEARNING ANALYTICS</p>
                      <IconChart size={16} className="text-signal-bright" />
                    </div>
                    <h3 className="mt-1.5 font-display text-title">
                      Dashboard Analitik &amp; Latihan Adaptif
                    </h3>
                    <p className="mt-1.5 text-caption text-ink-2">
                      {topRec
                        ? `Rekomendasi sistem saat ini: ${topRec.title} — ${topRec.reason}`
                        : "Lihat grafik kenaikan nilai, analisis 10 butir soal, dan rekomendasi belajar personal."}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <BtnLink href="/analitik" tone="signal" size="sm">
                      Buka Dashboard Analitik <IconArrow size={13} />
                    </BtnLink>
                    {topRec && topRec.href !== "/analitik" && (
                      <BtnLink href={topRec.href} tone="ghost" size="sm">
                        {topRec.actionLabel}
                      </BtnLink>
                    )}
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-lg border border-border bg-surface p-5">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-micro text-signal-bright">RESPONSIBLE AI</p>
                      <IconSparkle size={16} className="text-signal-bright" />
                    </div>
                    <h3 className="mt-1.5 font-display text-title">
                      Asisten Belajar AI &amp; Bukti Proses
                    </h3>
                    <p className="mt-1.5 text-caption text-ink-2">
                      Diskusikan konsep yang belum paham dengan prompt TCCO, ikuti Lab Deteksi
                      Hallucination, dan simpan refleksi proses untuk membuka sertifikat.
                    </p>
                  </div>
                  <div className="mt-4">
                    <BtnLink href="/asisten" tone="ghost" size="sm">
                      Buka Asisten Belajar AI <IconArrow size={13} />
                    </BtnLink>
                  </div>
                </div>
              </div>
            </section>

            {/* =============================================================== */}
            {/* LANGKAH 5 (AKHIR): SERTIFIKAT KOMPETENSI & RAPOR CETAK          */}
            {/* =============================================================== */}
            <section
              className={cx(
                "mt-10 rounded-lg border p-6",
                certification.eligible
                  ? "border-ok/50 bg-ok-tint/40"
                  : "border-border bg-surface",
              )}
            >
              <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
                <div className="flex items-start gap-3.5">
                  <span
                    className={cx(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full font-mono text-caption font-bold",
                      certification.eligible
                        ? "bg-ok text-ok-ink"
                        : "border border-border-2 bg-surface-2 text-ink",
                    )}
                  >
                    {certification.eligible ? <IconCheck size={14} /> : "5"}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-head">
                        Tahap 5 (Akhir) · Sertifikat Kompetensi &amp; Rapor Proses
                      </h2>
                      <Badge tone={certification.eligible ? "green" : "amber"}>
                        {certification.completedCount}/{certification.totalChecks} syarat kelulusan
                      </Badge>
                    </div>
                    <p className="mt-1.5 max-w-2xl text-caption text-ink-2">
                      {certification.eligible
                        ? `Selamat! Sertifikat Kompetensi Digital (ID: ${certification.credentialId}) dan Rapor Proses sudah terbuka dan siap dicetak PDF.`
                        : "Penutup perjalanan belajar: tuntaskan 3 modul, raih skor kuis ≥ 8/10, dan simpan minimal 1 bukti proses untuk membuka Sertifikat Kompetensi Digital."}
                    </p>
                  </div>
                </div>
                <BtnLink
                  href="/cetak"
                  tone={certification.eligible ? "primary" : "ghost"}
                  size="lg"
                  className="shrink-0"
                >
                  <IconAward size={16} />{" "}
                  {certification.eligible ? "Cetak Sertifikat" : "Lihat Syarat Sertifikat"}
                </BtnLink>
              </div>
            </section>

            <p className="mt-6 font-mono text-micro text-ink-4">
              Total XP yang dapat diraih:{" "}
              {(XP.materi + XP.praktik + XP.simulasi) * 3 + XP.kuisPerJawaban * 10} XP · Ikuti
              urutan Tahap 1 → 5 untuk hasil belajar optimal.
            </p>
          </Container>
        </main>
        <Footer help />
      </div>
    </RequireAuth>
  );
}
