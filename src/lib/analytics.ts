/**
 * Mesin Learning Analytics — fungsi murni (pure) tanpa DOM / storage / Firebase.
 *
 * Menerapkan konsep Pertemuan 13 (Learning Analytics):
 *  1. Digital Traces (login, materi, video, praktik, simulasi, kuis, refleksi, AI)
 *  2. 4 Tingkat Analytics: Descriptive, Diagnostic, Predictive, Prescriptive
 *  3. Pipeline Data → Informasi → Interpretasi → Keputusan (Data-Driven Decision)
 *  4. Pembedaan Progress vs Mastery ("Progress 100% belum tentu memahami 100%")
 *  5. Metric bermakna vs menghindari Vanity Metrics
 *  6. Etika & Non-Labeling ("Prediksi bukan kepastian; data tidak menggantikan guru")
 */

import { CONCEPT_META, QUIZ, type ConceptKey, type TopoKey } from "@/lib/data";
import {
  overallPercent,
  materiKey,
  praktikKey,
  simulasiKey,
  type ProgressState,
} from "@/lib/progression";

/* ========================================================================== */
/* TIPE DATA JEJAK BELAJAR (DIGITAL TRACES)                                   */
/* ========================================================================== */

export type QuizKind = "pretest" | "posttest" | "adaptive";

export interface QuizAttemptRecord {
  id: string;
  at: number;
  kind: QuizKind;
  score: number;
  total: number;
  durationSec: number;
  /** Peta questionId -> pilihan siswa (0..3). */
  answers: Record<number, number>;
  /** Konsep yang diuji (khusus mode adaptive). */
  focusConcept?: ConceptKey;
}

export interface PracticeMetric {
  attempts: number;
  correctConnections: number;
  rejectedConnections: number;
  completions: number;
  bestDurationSec: number | null;
  lastAt: number | null;
}

export interface MateriMetric {
  views: number;
  timeSec: number;
  diagramOpened: boolean;
  narasiOpened: boolean;
  videoOpened: boolean;
  cekAnswered: boolean;
  lastAt: number | null;
}

export interface SimulationMetric {
  pingRuns: number;
  faultTests: number;
  failedPings: number;
  lastAt: number | null;
}

export interface ReflectionEntry {
  id: string;
  at: number;
  context: string;
  topo?: TopoKey;
  /** Jawaban/refleksi tertulis siswa (bukti proses — Pert-12 Slide 22). */
  text: string;
  source: "cek-pemahaman" | "ai-studio" | "kuis-refleksi";
}

export type AiFunctionKind =
  | "explain"
  | "example"
  | "practice"
  | "feedback"
  | "brainstorm"
  | "compare"
  | "reflect"
  | "teacher-draft";

export interface AiTransparencyRecord {
  id: string;
  at: number;
  fn: AiFunctionKind;
  /** Unsur prompt yang terisi (0..4: Task, Context, Constraint, Output). */
  promptElementsCount: number;
  iterations: number;
  verifiedSteps: number;
  /** 5W+C Transparansi Penggunaan AI (Pert-12 Slide 24-25). */
  what: string;
  why: string;
  how: string;
  verify: string;
  contribution: string;
  statement: string;
}

export interface LearningTraceEvent {
  id: string;
  at: number;
  category: "aktivitas" | "assessment" | "interaksi" | "ai";
  action: string;
  detail: string;
  topo?: TopoKey;
}

export interface LearningAnalyticsState {
  loginCount: number;
  lastLoginAt: number | null;
  trackingConsent: boolean;
  materi: Record<TopoKey, MateriMetric>;
  praktik: Record<TopoKey, PracticeMetric>;
  simulasi: Record<TopoKey, SimulationMetric>;
  quizHistory: QuizAttemptRecord[];
  reflections: ReflectionEntry[];
  aiSessions: AiTransparencyRecord[];
  hallucinationSolved: string[];
  traces: LearningTraceEvent[];
}

const emptyMateri = (): MateriMetric => ({
  views: 0,
  timeSec: 0,
  diagramOpened: false,
  narasiOpened: false,
  videoOpened: false,
  cekAnswered: false,
  lastAt: null,
});

const emptyPractice = (): PracticeMetric => ({
  attempts: 0,
  correctConnections: 0,
  rejectedConnections: 0,
  completions: 0,
  bestDurationSec: null,
  lastAt: null,
});

const emptySim = (): SimulationMetric => ({
  pingRuns: 0,
  faultTests: 0,
  failedPings: 0,
  lastAt: null,
});

export function createEmptyAnalytics(): LearningAnalyticsState {
  return {
    loginCount: 0,
    lastLoginAt: null,
    trackingConsent: true,
    materi: { bus: emptyMateri(), ring: emptyMateri(), star: emptyMateri() },
    praktik: { bus: emptyPractice(), ring: emptyPractice(), star: emptyPractice() },
    simulasi: { bus: emptySim(), ring: emptySim(), star: emptySim() },
    quizHistory: [],
    reflections: [],
    aiSessions: [],
    hallucinationSolved: [],
    traces: [],
  };
}

export const EMPTY_ANALYTICS: LearningAnalyticsState = createEmptyAnalytics();

/* ========================================================================== */
/* HASIL ANALISIS 4 TINGKAT (DESCRIPTIVE, DIAGNOSTIC, PREDICTIVE, PRESCRIPTIVE) */
/* ========================================================================== */

export interface ConceptDiagnostic {
  concept: ConceptKey;
  label: string;
  short: string;
  answered: number;
  correct: number;
  accuracy: number | null; // 0..100, null bila belum pernah diuji
  practiceRejects: number;
  materiRead: boolean;
  videoWatched: boolean;
  status: "belum-diuji" | "perlu-penguatan" | "berkembang" | "menguasai";
}

export interface QuestionItemAnalysis {
  id: number;
  tag: string;
  concept: ConceptKey;
  question: string;
  attempts: number;
  correctCount: number;
  accuracy: number | null;
  needsAttention: boolean;
}

export interface DataDecisionStep {
  data: string;
  information: string;
  interpretation: string;
  action: string;
}

export interface PredictiveSignal {
  level: "rendah" | "sedang" | "perlu-perhatian";
  label: string;
  indicators: string[];
  ethicalNote: string;
  contextualAlternatives: string[];
}

export interface AdaptiveRecommendation {
  id: string;
  priority: "tinggi" | "sedang" | "pengayaan";
  title: string;
  reason: string;
  actionLabel: string;
  href: string;
  concept?: ConceptKey;
}

export interface CertificationStatus {
  eligible: boolean;
  credentialId: string;
  checks: Array<{ id: string; label: string; done: boolean; detail: string }>;
  completedCount: number;
  totalChecks: number;
}

export interface AnalyticsSummary {
  /* 1. Descriptive */
  completionRate: number; // % tahap selesai (Progress)
  masteryRate: number | null; // % penguasaan dari kuis/praktik (Mastery != Progress)
  progressMasteryGap: boolean;
  averageQuizScore: number | null; // skala 0..100
  bestQuizPercent: number | null;
  pretestPercent: number | null;
  posttestPercent: number | null;
  scoreGain: number | null; // selisih post-test vs pre-test atau percobaan terakhir vs pertama
  totalQuizAttempts: number;
  totalTimeOnTaskSec: number;
  practiceAccuracy: number | null; // % sambungan benar dibanding total upaya
  totalFaultTests: number;
  reflectionCount: number;
  verifiedAiCount: number;
  loginCount: number;
  scoreTimeline: Array<{ label: string; percent: number; kind: QuizKind; at: number }>;

  /* 2. Diagnostic */
  concepts: ConceptDiagnostic[];
  itemAnalysis: QuestionItemAnalysis[];
  mostDifficultQuestion: QuestionItemAnalysis | null;
  weakestConcept: ConceptDiagnostic | null;
  decisionPipeline: DataDecisionStep;

  /* 3. Predictive */
  predictive: PredictiveSignal;

  /* 4. Prescriptive */
  recommendations: AdaptiveRecommendation[];
}

export function formatDuration(totalSec: number): string {
  const safe = Math.max(0, Math.round(totalSec));
  if (safe < 60) return `${safe} dtk`;
  const min = Math.floor(safe / 60);
  const rem = safe % 60;
  if (min < 60) return rem > 0 ? `${min} mnt ${rem} dtk` : `${min} mnt`;
  const hr = Math.floor(min / 60);
  const remMin = min % 60;
  return `${hr} jam ${remMin} mnt`;
}

/** Menghasilkan ID sertifikat deterministik berdasarkan identitas + capaian siswa. */
export function buildCredentialId(uid: string, bestScore: number | null, totalXpVal: number): string {
  const raw = `${uid}:${bestScore ?? 0}:${totalXpVal}:NE2026`;
  let h = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const code = h.toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
  return `NE-XI-2026-${code}`;
}

/** Evaluasi kelayakan sertifikat kompetensi terverifikasi. */
export function evaluateCertification(
  uid: string,
  progress: ProgressState,
  analytics: LearningAnalyticsState,
  totalXpVal: number,
): CertificationStatus {
  const completion = overallPercent(progress);
  const quizBest = progress.quizBest ?? 0;
  const quizPassed = progress.quizBest !== null && quizBest >= 8;
  const allPracticeDone =
    !!progress.done[praktikKey("bus")] &&
    !!progress.done[praktikKey("ring")] &&
    !!progress.done[praktikKey("star")];
  const allSimDone =
    !!progress.done[simulasiKey("bus")] &&
    !!progress.done[simulasiKey("ring")] &&
    !!progress.done[simulasiKey("star")];
  const hasProcessEvidence =
    analytics.reflections.length > 0 ||
    analytics.aiSessions.some((s) => s.verifiedSteps >= 3) ||
    analytics.hallucinationSolved.length > 0;

  const checks = [
    {
      id: "materi",
      label: "Tuntaskan seluruh bab materi (Bus, Ring, Star)",
      done:
        !!progress.done[materiKey("bus")] &&
        !!progress.done[materiKey("ring")] &&
        !!progress.done[materiKey("star")],
      detail: `${(["bus", "ring", "star"] as TopoKey[]).filter((t) => progress.done[materiKey(t)]).length}/3 bab selesai`,
    },
    {
      id: "praktik",
      label: "Selesaikan seluruh papan praktik pemasangan kabel",
      done: allPracticeDone,
      detail: `${(["bus", "ring", "star"] as TopoKey[]).filter((t) => progress.done[praktikKey(t)]).length}/3 praktik tuntas`,
    },
    {
      id: "simulasi",
      label: "Jalankan simulasi ping pada ketiga topologi",
      done: allSimDone,
      detail: `${(["bus", "ring", "star"] as TopoKey[]).filter((t) => progress.done[simulasiKey(t)]).length}/3 simulasi`,
    },
    {
      id: "kuis",
      label: "Capai ketuntasan evaluasi studi kasus (minimal 80% / 8 dari 10)",
      done: quizPassed,
      detail: progress.quizBest === null ? "Belum dikerjakan" : `Rekor ${progress.quizBest}/10`,
    },
    {
      id: "proses",
      label: "Sertakan bukti proses (refleksi mandiri, verifikasi AI, atau uji halusinasi)",
      done: hasProcessEvidence,
      detail: hasProcessEvidence
        ? `${analytics.reflections.length} refleksi · ${analytics.aiSessions.length} catatan AI · ${analytics.hallucinationSolved.length} uji verifikasi`
        : "Tulis minimal 1 refleksi di Cek Pemahaman atau Studio AI",
    },
  ];

  const completedCount = checks.filter((c) => c.done).length;
  return {
    eligible: completedCount === checks.length && completion >= 90,
    credentialId: buildCredentialId(uid, progress.quizBest, totalXpVal),
    checks,
    completedCount,
    totalChecks: checks.length,
  };
}

/**
 * Menghitung seluruh 4 tingkat Learning Analytics secara deterministik.
 */
export function computeAnalytics(
  progress: ProgressState,
  analytics: LearningAnalyticsState,
  now: number = Date.now(),
): AnalyticsSummary {
  const completionRate = overallPercent(progress);

  // Kuis formal (pretest + posttest) untuk analisis butir soal & tren skor
  const formalQuizzes = analytics.quizHistory.filter((q) => q.kind !== "adaptive");
  const allQuizzes = analytics.quizHistory;

  const scoreTimeline = allQuizzes.map((q, i) => ({
    label:
      q.kind === "pretest"
        ? "Pre-Test"
        : q.kind === "adaptive"
          ? `Adaptif ${i + 1}`
          : `Kuis #${i + 1}`,
    percent: Math.round((q.score / Math.max(1, q.total)) * 100),
    kind: q.kind,
    at: q.at,
  }));

  const averageQuizScore =
    formalQuizzes.length > 0
      ? Math.round(
          formalQuizzes.reduce((s, q) => s + (q.score / Math.max(1, q.total)) * 100, 0) /
            formalQuizzes.length,
        )
      : progress.quizBest !== null
        ? Math.round((progress.quizBest / QUIZ.length) * 100)
        : null;

  const bestQuizPercent =
    progress.quizBest !== null
      ? Math.round((progress.quizBest / QUIZ.length) * 100)
      : formalQuizzes.length > 0
        ? Math.max(...formalQuizzes.map((q) => Math.round((q.score / Math.max(1, q.total)) * 100)))
        : null;

  const firstPre = formalQuizzes.find((q) => q.kind === "pretest");
  const lastPost = [...formalQuizzes].reverse().find((q) => q.kind === "posttest");
  const pretestPercent = firstPre
    ? Math.round((firstPre.score / Math.max(1, firstPre.total)) * 100)
    : null;
  const posttestPercent = lastPost
    ? Math.round((lastPost.score / Math.max(1, lastPost.total)) * 100)
    : null;

  let scoreGain: number | null = null;
  if (pretestPercent !== null && posttestPercent !== null) {
    scoreGain = posttestPercent - pretestPercent;
  } else if (formalQuizzes.length >= 2) {
    const first = Math.round(
      (formalQuizzes[0].score / Math.max(1, formalQuizzes[0].total)) * 100,
    );
    const last = Math.round(
      (formalQuizzes[formalQuizzes.length - 1].score /
        Math.max(1, formalQuizzes[formalQuizzes.length - 1].total)) *
        100,
    );
    scoreGain = last - first;
  }

  // Praktik & waktu belajar
  const topos: TopoKey[] = ["bus", "ring", "star"];
  const totalCorrect = topos.reduce((s, t) => s + analytics.praktik[t].correctConnections, 0);
  const totalRejects = topos.reduce((s, t) => s + analytics.praktik[t].rejectedConnections, 0);
  const practiceAccuracy =
    totalCorrect + totalRejects > 0
      ? Math.round((totalCorrect / (totalCorrect + totalRejects)) * 100)
      : null;

  const materiTime = topos.reduce((s, t) => s + analytics.materi[t].timeSec, 0);
  const quizTime = allQuizzes.reduce((s, q) => s + q.durationSec, 0);
  const practiceTime = topos.reduce((s, t) => s + (analytics.praktik[t].bestDurationSec ?? 0), 0);
  const totalTimeOnTaskSec = materiTime + quizTime + practiceTime;
  const totalFaultTests = topos.reduce((s, t) => s + analytics.simulasi[t].faultTests, 0);

  // Mastery rate menggabungkan kuis + akurasi praktik (berbeda dengan sekadar Progress %)
  let masteryRate: number | null = null;
  if (bestQuizPercent !== null && practiceAccuracy !== null) {
    masteryRate = Math.round(bestQuizPercent * 0.7 + practiceAccuracy * 0.3);
  } else if (bestQuizPercent !== null) {
    masteryRate = bestQuizPercent;
  } else if (practiceAccuracy !== null) {
    masteryRate = practiceAccuracy;
  }

  // "Progress 100% belum tentu memahami 100%" (Pert-13 Slide 8)
  const progressMasteryGap =
    completionRate >= 60 && masteryRate !== null && completionRate - masteryRate >= 15;

  /* ---- 2. DIAGNOSTIC ANALYTICS (Analisis Butir Soal & Konsep) ---- */
  const itemAnalysis: QuestionItemAnalysis[] = QUIZ.map((q) => {
    let attempts = 0;
    let correctCount = 0;
    for (const h of formalQuizzes) {
      if (h.answers[q.id] !== undefined) {
        attempts += 1;
        if (h.answers[q.id] === q.answer) correctCount += 1;
      }
    }
    const accuracy = attempts > 0 ? Math.round((correctCount / attempts) * 100) : null;
    return {
      id: q.id,
      tag: q.tag,
      concept: q.concept,
      question: q.q,
      attempts,
      correctCount,
      accuracy,
      needsAttention: accuracy !== null && accuracy < 60,
    };
  });

  const attemptedItems = itemAnalysis.filter((i) => i.accuracy !== null);
  const mostDifficultQuestion =
    attemptedItems.length > 0
      ? [...attemptedItems].sort((a, b) => (a.accuracy ?? 100) - (b.accuracy ?? 100))[0]
      : null;

  const conceptKeys: ConceptKey[] = ["bus", "ring", "star", "troubleshooting"];
  const concepts: ConceptDiagnostic[] = conceptKeys.map((concept) => {
    const items = itemAnalysis.filter((i) => i.concept === concept);
    const answered = items.reduce((s, i) => s + i.attempts, 0);
    const correct = items.reduce((s, i) => s + i.correctCount, 0);
    const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : null;
    const isTopo = concept === "bus" || concept === "ring" || concept === "star";
    const practiceRejects = isTopo ? analytics.praktik[concept].rejectedConnections : 0;
    const materiRead = isTopo ? !!progress.done[materiKey(concept)] : completionRate >= 50;
    const videoWatched = isTopo ? analytics.materi[concept].videoOpened : false;

    let status: ConceptDiagnostic["status"] = "belum-diuji";
    if (accuracy !== null) {
      if (accuracy < 60) status = "perlu-penguatan";
      else if (accuracy < 80) status = "berkembang";
      else status = "menguasai";
    } else if (practiceRejects >= 3) {
      status = "perlu-penguatan";
    }

    return {
      concept,
      label: CONCEPT_META[concept].label,
      short: CONCEPT_META[concept].short,
      answered,
      correct,
      accuracy,
      practiceRejects,
      materiRead,
      videoWatched,
      status,
    };
  });

  const weakCandidates = concepts.filter(
    (c) => (c.accuracy !== null && c.accuracy < 80) || c.practiceRejects >= 2,
  );
  const weakestConcept =
    weakCandidates.length > 0
      ? [...weakCandidates].sort((a, b) => (a.accuracy ?? 50) - (b.accuracy ?? 50))[0]
      : null;

  // Pipeline Data -> Informasi -> Interpretasi -> Keputusan (Pert-13 Slide 4 & 17)
  const decisionPipeline: DataDecisionStep = weakestConcept
    ? {
        data:
          weakestConcept.accuracy !== null
            ? `Akurasi soal ${weakestConcept.short}: ${weakestConcept.accuracy}% (${weakestConcept.correct}/${weakestConcept.answered} benar)${weakestConcept.practiceRejects > 0 ? `, ditambah ${weakestConcept.practiceRejects} sambungan kabel ditolak` : ""}.`
            : `Tercatat ${weakestConcept.practiceRejects} kesalahan sambungan kabel pada praktik ${weakestConcept.short}.`,
        information: `Kesulitan terkonsentrasi pada konsep ${weakestConcept.label}${mostDifficultQuestion ? ` (soal tersulit: Soal #${mostDifficultQuestion.id})` : ""}.`,
        interpretation: !weakestConcept.materiRead
          ? `Bab materi ${weakestConcept.short} belum dituntaskan sehingga konsep prasyarat mungkin belum terbentuk utuh.`
          : !weakestConcept.videoWatched
            ? `Materi teks sudah dibuka, tetapi visualisasi video dan uji gangguan belum dieksplorasi secara penuh.`
            : `Konsep dasar sudah dibaca namun penerapan pada studi kasus atau aturan kabel masih perlu penguatan terarah.`,
        action: `Tinjau ulang ${weakestConcept.label}, uji skenario putus kabel di Sandbox, lalu kerjakan Latihan Adaptif khusus konsep ${weakestConcept.short}.`,
      }
    : formalQuizzes.length === 0
      ? {
          data: `Penyelesaian tahap saat ini ${completionRate}%, kuis diagnostik/akhir belum dikerjakan.`,
          information: "Belum tersedia data assessment untuk memetakan kekuatan per konsep.",
          interpretation:
            "Sistem memerlukan minimal satu percobaan Pre-Test atau Kuis Akhir agar diagnostik per konsep akurat.",
          action:
            "Kerjakan Pre-Test singkat atau mulai Bab 1 (Topologi Bus) lalu lakukan cek pemahaman mandiri.",
        }
      : {
          data: `Penyelesaian ${completionRate}% dengan akurasi kuis terbaik ${bestQuizPercent ?? 0}% dan akurasi praktik ${practiceAccuracy ?? 100}%.`,
          information: "Seluruh konsep inti (Bus, Ring, Star, Diagnostik) berada pada kategori baik/menguasai.",
          interpretation:
            "Pemahaman konseptual dan keterampilan pemasangan kabel telah selaras.",
          action:
            "Lakukan pengayaan di Studio AI (uji deteksi halusinasi & refleksi proses) serta cetak Sertifikat & Rapor Belajar.",
        };

  /* ---- 3. PREDICTIVE ANALYTICS (Indikasi Risiko + Etika Non-Labeling) ---- */
  const indicators: string[] = [];
  let riskScore = 0;

  if (bestQuizPercent !== null && bestQuizPercent < 60) {
    riskScore += 2;
    indicators.push(
      `Skor evaluasi masih di bawah batas tuntas (${bestQuizPercent}% dari target 80%).`,
    );
  }
  if (scoreGain !== null && scoreGain < 0) {
    riskScore += 1;
    indicators.push(`Tren skor menurun (${scoreGain} poin dibanding percobaan awal).`);
  }
  if (totalRejects >= 5 && practiceAccuracy !== null && practiceAccuracy < 65) {
    riskScore += 1;
    indicators.push(
      `Akurasi pemasangan kabel masih ${practiceAccuracy}% (${totalRejects} kali sambungan ditolak).`,
    );
  }
  if (analytics.lastLoginAt && now - analytics.lastLoginAt > 7 * 86_400_000) {
    riskScore += 1;
    indicators.push("Belum tercatat aktivitas sesi baru selama lebih dari 7 hari.");
  }
  if (completionRate < 30 && progress.quizAttempts >= 2) {
    riskScore += 1;
    indicators.push(
      "Kuis sudah diulang beberapa kali sementara sebagian besar materi/praktik prasyarat belum selesai.",
    );
  }
  if (progressMasteryGap) {
    riskScore += 1;
    indicators.push(
      `Terdapat jarak antara progres penyelesaian (${completionRate}%) dan penguasaan (${masteryRate}%).`,
    );
  }

  const predictive: PredictiveSignal = {
    level: riskScore >= 3 ? "perlu-perhatian" : riskScore >= 1 ? "sedang" : "rendah",
    label:
      riskScore >= 3
        ? "Indikasi perlu pendampingan terarah"
        : riskScore >= 1
          ? "Indikasi perlu penguatan pada beberapa topik"
          : "Pola belajar berada pada jalur positif",
    indicators:
      indicators.length > 0
        ? indicators
        : ["Tidak ada pola hambatan menonjol pada data aktivitas dan evaluasi saat ini."],
    ethicalNote:
      "Hasil prediksi bukan kepastian dan bukan label kemampuan siswa. Data hanya memberi indikasi awal; keputusan pedagogis tetap berada pada guru dan refleksi siswa sendiri.",
    contextualAlternatives: [
      "Siswa mungkin belajar dari buku cetak, catatan kelas, atau sumber lain di luar aplikasi.",
      "Kendala perangkat, koneksi internet, atau jadwal sekolah dapat memengaruhi frekuensi akses.",
      "Materi tertentu mungkin belum dijelaskan di kelas atau membutuhkan contoh visual tambahan.",
    ],
  };

  /* ---- 4. PRESCRIPTIVE ANALYTICS & PERSONALIZED LEARNING ---- */
  const recommendations: AdaptiveRecommendation[] = [];

  if (weakestConcept) {
    const meta = CONCEPT_META[weakestConcept.concept];
    if (!weakestConcept.materiRead) {
      recommendations.push({
        id: `rec-materi-${weakestConcept.concept}`,
        priority: "tinggi",
        title: `Pelajari kembali ${meta.label}`,
        reason: `Konsep ${meta.short} menjadi titik lemah utama saat ini (${weakestConcept.accuracy !== null ? `akurasi ${weakestConcept.accuracy}%` : `${weakestConcept.practiceRejects} kesalahan praktik`}).`,
        actionLabel: `Buka materi ${meta.short}`,
        href: meta.materiHref,
        concept: weakestConcept.concept,
      });
    }
    recommendations.push({
      id: `rec-drill-${weakestConcept.concept}`,
      priority: "tinggi",
      title: `Kerjakan Latihan Adaptif: ${meta.short}`,
      reason: `Latihan terfokus 3 soal khusus ${meta.label} untuk menutup pola kesalahan berulang sebelum mengulang kuis akhir.`,
      actionLabel: "Mulai latihan adaptif",
      href: `/kuis?mode=adaptive&focus=${weakestConcept.concept}`,
      concept: weakestConcept.concept,
    });
    if (weakestConcept.concept !== "troubleshooting" && !weakestConcept.videoWatched) {
      recommendations.push({
        id: `rec-video-${weakestConcept.concept}`,
        priority: "sedang",
        title: `Tonton video & uji gangguan ${meta.short}`,
        reason: "Visualisasi aliran paket dan simulasi cabut kabel membantu memahami penyebab kegagalan jaringan secara konkret.",
        actionLabel: `Uji di Sandbox ${meta.short}`,
        href: meta.sandboxHref,
        concept: weakestConcept.concept,
      });
    }
  }

  if (formalQuizzes.length === 0) {
    recommendations.push({
      id: "rec-pretest",
      priority: "tinggi",
      title: "Ambil Pre-Test diagnostik awal",
      reason:
        "Memetakan pemahaman awal sebelum belajar agar sistem bisa mengukur peningkatan (pre-test vs post-test) secara objektif.",
      actionLabel: "Mulai Pre-Test",
      href: "/kuis?mode=pretest",
    });
  }

  for (const topo of topos) {
    if (recommendations.length >= 4) break;
    if (!progress.done[materiKey(topo)]) {
      recommendations.push({
        id: `rec-next-materi-${topo}`,
        priority: "sedang",
        title: `Lanjutkan Bab ${CONCEPT_META[topo].short}`,
        reason: "Menuntaskan materi prasyarat sebelum papan praktik meminimalkan kesalahan pemasangan kabel.",
        actionLabel: `Baca materi ${CONCEPT_META[topo].short}`,
        href: `/materi/${topo}`,
        concept: topo,
      });
      break;
    }
    if (!progress.done[praktikKey(topo)]) {
      recommendations.push({
        id: `rec-next-praktik-${topo}`,
        priority: "sedang",
        title: `Selesaikan Papan Praktik ${CONCEPT_META[topo].short}`,
        reason: "Pemasangan kabel langsung menguji pemahaman aturan arsitektur secara nyata.",
        actionLabel: `Buka praktik ${CONCEPT_META[topo].short}`,
        href: `/praktik/${topo}`,
        concept: topo,
      });
      break;
    }
  }

  if (analytics.reflections.length === 0 || analytics.hallucinationSolved.length === 0) {
    recommendations.push({
      id: "rec-ai-studio",
      priority: "pengayaan",
      title: "Latih berpikir kritis di Asisten Belajar AI",
      reason:
        "Gunakan pola Ask AI, Then Think dan selesaikan Lab Deteksi Hallucination untuk melengkapi bukti proses sertifikasi.",
      actionLabel: "Buka Asisten AI",
      href: "/asisten",
    });
  }

  if (completionRate === 100 && bestQuizPercent !== null && bestQuizPercent >= 80) {
    recommendations.push({
      id: "rec-cert",
      priority: "pengayaan",
      title: "Unduh Rapor Proses & Sertifikat Kompetensi",
      reason: "Seluruh tahap inti dan standar ketuntasan telah tercapai.",
      actionLabel: "Buka halaman cetak",
      href: "/cetak",
    });
  }

  return {
    completionRate,
    masteryRate,
    progressMasteryGap,
    averageQuizScore,
    bestQuizPercent,
    pretestPercent,
    posttestPercent,
    scoreGain,
    totalQuizAttempts: Math.max(progress.quizAttempts, formalQuizzes.length),
    totalTimeOnTaskSec,
    practiceAccuracy,
    totalFaultTests,
    reflectionCount: analytics.reflections.length,
    verifiedAiCount: analytics.aiSessions.filter((s) => s.verifiedSteps >= 3).length,
    loginCount: Math.max(1, analytics.loginCount),
    scoreTimeline,
    concepts,
    itemAnalysis,
    mostDifficultQuestion,
    weakestConcept,
    decisionPipeline,
    predictive,
    recommendations: recommendations.slice(0, 4),
  };
}

/**
 * Dataset simulasi kelas (32 siswa — mencerminkan contoh dashboard Pert-13 Slide 10 & 13)
 * untuk Tampilan Tinjauan Guru di halaman /analitik.
 */
export interface ClassCohortSnapshot {
  className: string;
  students: number;
  completed: number;
  notSubmitted: number;
  averageScore: number;
  mostDifficultQuestionId: number;
  itemAccuracy: Array<{ id: number; concept: ConceptKey; label: string; correctPct: number }>;
  progressBuckets: Array<{ label: string; count: number; pct: number }>;
  weeklyAvg: Array<{ week: string; score: number }>;
  flaggedContexts: Array<{
    studentAlias: string;
    progressPct: number;
    lastScore: number;
    inactiveDays: number;
    note: string;
  }>;
}

export const SAMPLE_CLASS_COHORT: ClassCohortSnapshot = {
  className: "Informatika XI-IPA 1 (Simulasi Kelas)",
  students: 32,
  completed: 25,
  notSubmitted: 7,
  averageScore: 74,
  mostDifficultQuestionId: 5,
  itemAccuracy: [
    { id: 1, concept: "star", label: "Soal 1 (Switch gagal)", correctPct: 91 },
    { id: 2, concept: "ring", label: "Soal 2 (Ring tunggal)", correctPct: 84 },
    { id: 3, concept: "star", label: "Soal 3 (Lab 24 PC)", correctPct: 88 },
    { id: 4, concept: "bus", label: "Soal 4 (Terminator)", correctPct: 78 },
    { id: 5, concept: "bus", label: "Soal 5 (Collision Bus)", correctPct: 38 },
    { id: 6, concept: "star", label: "Soal 6 (MAC & Unicast)", correctPct: 62 },
    { id: 7, concept: "troubleshooting", label: "Soal 7 (Urutan Ping)", correctPct: 72 },
    { id: 8, concept: "bus", label: "Soal 8 (Backbone)", correctPct: 81 },
    { id: 9, concept: "star", label: "Soal 9 (Kabel Star vs Bus)", correctPct: 75 },
    { id: 10, concept: "ring", label: "Soal 10 (Ring ganda)", correctPct: 69 },
  ],
  progressBuckets: [
    { label: "Tuntas (85–100%)", count: 14, pct: 44 },
    { label: "Berjalan (50–84%)", count: 11, pct: 34 },
    { label: "Awal (< 50%)", count: 7, pct: 22 },
  ],
  weeklyAvg: [
    { week: "Minggu 1 (Pre-Test)", score: 54 },
    { week: "Minggu 2 (Bus & Ring)", score: 66 },
    { week: "Minggu 3 (Star & Lab)", score: 71 },
    { week: "Minggu 4 (Post-Test)", score: 74 },
  ],
  flaggedContexts: [
    {
      studentAlias: "Siswa A (Anonim)",
      progressPct: 100,
      lastScore: 55,
      inactiveDays: 1,
      note: "Progres 100% tetapi skor 55% — indikasi membuka modul cepat tanpa pemahaman mendalam; perlu cek konsep Collision & MAC.",
    },
    {
      studentAlias: "Siswa B (Anonim)",
      progressPct: 40,
      lastScore: 48,
      inactiveDays: 8,
      note: "Belum mengakses 8 hari — konfirmasi kendala perangkat/akses terlebih dahulu sebelum mengambil kesimpulan.",
    },
    {
      studentAlias: "Siswa C (Anonim)",
      progressPct: 70,
      lastScore: 60,
      inactiveDays: 2,
      note: "Salah berulang pada Soal 5 (Collision) dan 4 kali ditolak di praktik Bus — direkomendasikan simulasi ulang.",
    },
  ],
};

/**
 * Menghasilkan dataset contoh untuk satu siswa (untuk tombol preview demo di /analitik)
 * agar dosen/penguji dapat langsung melihat visualisasi 4 tingkat analytics.
 */
export function buildSampleStudentAnalytics(now: number = Date.now()): LearningAnalyticsState {
  const day = 86_400_000;
  return {
    loginCount: 6,
    lastLoginAt: now - 3600_000,
    trackingConsent: true,
    materi: {
      bus: {
        views: 3,
        timeSec: 420,
        diagramOpened: true,
        narasiOpened: true,
        videoOpened: true,
        cekAnswered: true,
        lastAt: now - 3 * day,
      },
      ring: {
        views: 2,
        timeSec: 185,
        diagramOpened: true,
        narasiOpened: false,
        videoOpened: false,
        cekAnswered: false,
        lastAt: now - 2 * day,
      },
      star: {
        views: 3,
        timeSec: 390,
        diagramOpened: true,
        narasiOpened: true,
        videoOpened: true,
        cekAnswered: true,
        lastAt: now - day,
      },
    },
    praktik: {
      bus: {
        attempts: 1,
        correctConnections: 5,
        rejectedConnections: 1,
        completions: 1,
        bestDurationSec: 95,
        lastAt: now - 3 * day,
      },
      ring: {
        attempts: 2,
        correctConnections: 5,
        rejectedConnections: 4,
        completions: 1,
        bestDurationSec: 142,
        lastAt: now - 2 * day,
      },
      star: {
        attempts: 1,
        correctConnections: 5,
        rejectedConnections: 0,
        completions: 1,
        bestDurationSec: 78,
        lastAt: now - day,
      },
    },
    simulasi: {
      bus: { pingRuns: 4, faultTests: 2, failedPings: 1, lastAt: now - 3 * day },
      ring: { pingRuns: 3, faultTests: 1, failedPings: 1, lastAt: now - 2 * day },
      star: { pingRuns: 5, faultTests: 3, failedPings: 1, lastAt: now - day },
    },
    quizHistory: [
      {
        id: "sample-pre",
        at: now - 4 * day,
        kind: "pretest",
        score: 5,
        total: 10,
        durationSec: 210,
        answers: { 1: 1, 2: 0, 3: 1, 4: 1, 5: 0, 6: 0, 7: 1, 8: 0, 9: 0, 10: 0 },
      },
      {
        id: "sample-post-1",
        at: now - 2 * day,
        kind: "posttest",
        score: 7,
        total: 10,
        durationSec: 245,
        answers: { 1: 1, 2: 0, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 0, 9: 1, 10: 0 },
      },
      {
        id: "sample-post-2",
        at: now - 6 * 3600_000,
        kind: "posttest",
        score: 8,
        total: 10,
        durationSec: 198,
        answers: { 1: 1, 2: 0, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 0, 9: 1, 10: 1 },
      },
    ],
    reflections: [
      {
        id: "sample-ref-1",
        at: now - day,
        context: "Cek Pemahaman Topologi Star",
        topo: "star",
        text: "Jika kabel PC-03 putus di Star, PC lain tetap saling terhubung lewat switch karena setiap PC punya jalur sendiri.",
        source: "cek-pemahaman",
      },
    ],
    aiSessions: [
      {
        id: "sample-ai-1",
        at: now - 12 * 3600_000,
        fn: "compare",
        promptElementsCount: 4,
        iterations: 2,
        verifiedSteps: 5,
        what: "Asisten Belajar AI Network Explorer",
        why: "Membandingkan dampak kabel putus pada Ring tunggal vs Star",
        how: "Menggunakan struktur Task-Context-Constraint-Output dan 2 kali iterasi prompt",
        verify: "Membandingkan jawaban AI dengan simulasi cabut kabel di Sandbox Ring & Star",
        contribution: "Menyusun kesimpulan akhir dan menjawab kuis studi kasus secara mandiri",
        statement:
          "Asisten Belajar AI digunakan untuk membandingkan dampak gangguan kabel pada Ring dan Star dengan struktur prompt terarah. Seluruh fakta teknis diverifikasi ulang melalui simulasi Sandbox dan modul resmi, lalu disimpulkan kembali oleh siswa.",
      },
    ],
    hallucinationSolved: ["hal-1", "hal-3"],
    traces: [
      {
        id: "tr-1",
        at: now - 4 * day,
        category: "assessment",
        action: "Pre-Test selesai",
        detail: "Skor awal 5/10 (50%) dalam 3 mnt 30 dtk",
      },
      {
        id: "tr-2",
        at: now - 3 * day,
        category: "aktivitas",
        action: "Praktik Bus selesai",
        detail: "5/6 sambungan tepat (1 ditolak)",
        topo: "bus",
      },
      {
        id: "tr-3",
        at: now - 2 * day,
        category: "aktivitas",
        action: "Praktik Ring selesai",
        detail: "5/9 sambungan tepat (4 ditolak — pola kesalahan urutan cincin)",
        topo: "ring",
      },
      {
        id: "tr-4",
        at: now - 12 * 3600_000,
        category: "ai",
        action: "Sesi AI terverifikasi (Compare)",
        detail: "4/4 unsur prompt · 5/5 langkah Ask AI, Then Think",
      },
      {
        id: "tr-5",
        at: now - 6 * 3600_000,
        category: "assessment",
        action: "Kuis akhir selesai",
        detail: "Skor naik menjadi 8/10 (80%) — peningkatan +30 poin dari Pre-Test",
      },
    ],
  };
}
