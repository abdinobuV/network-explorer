/**
 * Sumber kebenaran alur belajar terarah (Langkah 1 → Langkah 5).
 *
 * Memastikan siswa tidak pernah bingung "harus mulai dari mana" dan
 * "setelah ini ke mana" di setiap halaman aplikasi.
 */

import {
  KUIS_KEY,
  TOPO_KEYS,
  TOPO_LABEL,
  materiKey,
  praktikKey,
  simulasiKey,
  type ProgressState,
  type TopoKey,
} from "@/lib/progression";
import type { CertificationStatus, LearningAnalyticsState } from "@/lib/analytics";

export type ModuleStage = "materi" | "praktik" | "simulasi";

export interface NextAction {
  /** Nomor fase besar (1..5). */
  phase: 1 | 2 | 3 | 4 | 5;
  phaseLabel: string;
  /** Label langkah ringkas untuk tombol / banner. */
  title: string;
  /** Penjelasan singkat mengapa langkah ini dikerjakan sekarang. */
  description: string;
  cta: string;
  href: string;
  /** Nomor urutan (1..12) untuk progress indikator. */
  stepIndex: number;
  totalSteps: number;
}

export interface ModuleContinuation {
  topo: TopoKey;
  moduleNumber: 1 | 2 | 3;
  stage: ModuleStage;
  prev: { label: string; href: string } | null;
  next: { label: string; href: string; description: string };
}

/**
 * Menghitung satu langkah berikutnya yang paling tepat dikerjakan siswa
 * berdasarkan progres aktual dan bukti prosesnya.
 */
export function getGuidedNextAction(
  progress: ProgressState,
  analytics: LearningAnalyticsState,
  certification: CertificationStatus,
): NextAction {
  const hasPretest = analytics.quizHistory.some((q) => q.kind === "pretest");
  const totalSteps = 12;

  // Hitung langkah selesai secara berurutan
  let completed = hasPretest ? 1 : 0;
  for (const t of TOPO_KEYS) {
    if (progress.done[materiKey(t)]) completed += 1;
    if (progress.done[praktikKey(t)]) completed += 1;
    if (progress.done[simulasiKey(t)]) completed += 1;
  }
  const quizPassed = progress.quizBest !== null && progress.quizBest >= 8;
  if (quizPassed) completed += 1;
  if (certification.eligible) completed += 1;

  // Fase 1: Jika belum mulai apa pun sama sekali dan belum Pre-Test, sarankan mulai dari Materi Bus (atau Pre-Test)
  // Agar alur terasa langsung ke inti belajar, tetapi tetap menandai Pre-Test sebagai langkah 1 opsional.
  for (let i = 0; i < TOPO_KEYS.length; i++) {
    const topo = TOPO_KEYS[i];
    const modNo = i + 1;
    const nama = TOPO_LABEL[topo];

    if (!progress.done[materiKey(topo)]) {
      return {
        phase: 2,
        phaseLabel: `Tahap 2 · Modul ${modNo} dari 3`,
        title: `Baca Materi Topologi ${nama}`,
        description:
          i === 0 && !hasPretest
            ? "Mulai perjalanan belajarmu dari Bab 1 (Bus) — pahami cara kerja, diagram, lalu isi Cek Pemahaman. (Bisa juga ambil Pre-Test dulu jika ingin ukur skor awal)."
            : `Pelajari cara kerja, kelebihan, kekurangan, dan isi Cek Pemahaman pada Topologi ${nama}.`,
        cta: `Mulai Materi ${nama}`,
        href: `/materi/${topo}`,
        stepIndex: Math.min(totalSteps, completed + 1),
        totalSteps,
      };
    }

    if (!progress.done[praktikKey(topo)]) {
      return {
        phase: 2,
        phaseLabel: `Tahap 2 · Modul ${modNo} dari 3`,
        title: `Pasang Kabel Topologi ${nama}`,
        description: `Terapkan aturan pemasangan Topologi ${nama} langsung di papan kabel interaktif.`,
        cta: `Buka Praktik ${nama}`,
        href: `/praktik/${topo}`,
        stepIndex: Math.min(totalSteps, completed + 1),
        totalSteps,
      };
    }

    if (!progress.done[simulasiKey(topo)]) {
      return {
        phase: 2,
        phaseLabel: `Tahap 2 · Modul ${modNo} dari 3`,
        title: `Uji Gangguan di Sandbox ${nama}`,
        description: `Kirim paket ping dan cabut kabel di meja kerja Sandbox ${nama} untuk melihat dampak gangguannya secara langsung.`,
        cta: `Buka Sandbox ${nama}`,
        href: `/sandbox/${topo}`,
        stepIndex: Math.min(totalSteps, completed + 1),
        totalSteps,
      };
    }
  }

  // Fase 3: Evaluasi Akhir (Kuis 10 studi kasus)
  if (progress.quizBest === null) {
    return {
      phase: 3,
      phaseLabel: "Tahap 3 · Evaluasi Akhir",
      title: "Kerjakan Kuis Akhir (10 Studi Kasus)",
      description:
        "Ketiga modul topologi sudah tuntas! Uji pemahamanmu di Kuis Akhir untuk mendapatkan skor ketuntasan minimal 8/10.",
      cta: "Kerjakan Kuis Akhir",
      href: "/kuis",
      stepIndex: 10,
      totalSteps,
    };
  }

  // Fase 4: Jika skor kuis < 8, arahkan ke Dashboard Analitik & Latihan Adaptif
  if (progress.quizBest < 8) {
    return {
      phase: 4,
      phaseLabel: "Tahap 4 · Analitik & Penguatan",
      title: `Tingkatkan Skor Kuis (Saat ini ${progress.quizBest}/10 → Target 8/10)`,
      description:
        "Lihat konsep mana yang paling sering keliru di Dashboard Learning Analytics, lalu kerjakan Latihan Adaptif sebelum mengulang kuis.",
      cta: "Buka Dashboard Analitik",
      href: "/analitik",
      stepIndex: 11,
      totalSteps,
    };
  }

  // Fase 4b: Cek bukti proses untuk sertifikat
  const hasProcessEvidence =
    analytics.reflections.length > 0 ||
    analytics.aiSessions.some((s) => s.verifiedSteps >= 3) ||
    analytics.hallucinationSolved.length > 0;

  if (!hasProcessEvidence) {
    return {
      phase: 4,
      phaseLabel: "Tahap 4 · Bukti Proses & Literasi AI",
      title: "Lengkapi 1 Bukti Proses untuk Membuka Sertifikat",
      description:
        "Skor kuismu sudah tuntas! Tulis 1 refleksi di Cek Pemahaman atau selesaikan 1 kasus di Asisten Belajar AI untuk membuka Sertifikat Kompetensi.",
      cta: "Buka Asisten Belajar AI",
      href: "/asisten",
      stepIndex: 11,
      totalSteps,
    };
  }

  // Fase 5: Kelulusan!
  return {
    phase: 5,
    phaseLabel: "Tahap 5 · Kelulusan",
    title: "Sertifikat Kompetensi & Rapor Siap Dicetak!",
    description:
      "Seluruh tahapan belajar, evaluasi ≥ 80%, dan bukti proses telah terpenuhi. Cetak atau simpan Sertifikat Kompetensi Digital sebagai PDF.",
    cta: "Buka Sertifikat & Rapor",
    href: "/cetak",
    stepIndex: totalSteps,
    totalSteps,
  };
}

/**
 * Menentukan tombol Sebelumnya & Lanjut Berikutnya pada setiap halaman modul
 * (Materi → Praktik → Sandbox → Modul Berikutnya → Kuis Akhir) sehingga tidak ada jalan buntu.
 */
export function getModuleContinuation(topo: TopoKey, stage: ModuleStage): ModuleContinuation {
  const idx = TOPO_KEYS.indexOf(topo);
  const moduleNumber = (idx + 1) as 1 | 2 | 3;
  const nama = TOPO_LABEL[topo];

  if (stage === "materi") {
    const prevTopo = idx > 0 ? TOPO_KEYS[idx - 1] : null;
    return {
      topo,
      moduleNumber,
      stage,
      prev: prevTopo
        ? { label: `Sandbox ${TOPO_LABEL[prevTopo]}`, href: `/sandbox/${prevTopo}` }
        : { label: "Alur Belajar", href: "/misi" },
      next: {
        label: `Lanjut ke Praktik ${nama}`,
        href: `/praktik/${topo}`,
        description: `Pasang kabel Topologi ${nama} di papan kerja interaktif.`,
      },
    };
  }

  if (stage === "praktik") {
    return {
      topo,
      moduleNumber,
      stage,
      prev: { label: `Materi ${nama}`, href: `/materi/${topo}` },
      next: {
        label: `Lanjut ke Sandbox ${nama}`,
        href: `/sandbox/${topo}`,
        description: `Uji kirim paket ping dan cabut kabel langsung pada ${nama}.`,
      },
    };
  }

  // stage === "simulasi"
  const nextTopo = idx < TOPO_KEYS.length - 1 ? TOPO_KEYS[idx + 1] : null;
  return {
    topo,
    moduleNumber,
    stage,
    prev: { label: `Praktik ${nama}`, href: `/praktik/${topo}` },
    next: nextTopo
      ? {
          label: `Lanjut ke Modul ${idx + 2}: Topologi ${TOPO_LABEL[nextTopo]}`,
          href: `/materi/${nextTopo}`,
          description: `Modul ${nama} selesai! Lanjutkan ke bab berikutnya agar urutan konsep tersambung.`,
        }
      : {
          label: "Lanjut ke Perbandingan & Kuis Akhir",
          href: "/perbandingan",
          description:
            "Ketiga topologi (Bus, Ring, Star) sudah selesai! Bandingkan ketiganya lalu kerjakan Kuis Akhir.",
        },
  };
}

/** Status ringkas 5 fase besar untuk visual roadmap. */
export interface JourneyPhaseSummary {
  phase: 1 | 2 | 3 | 4 | 5;
  title: string;
  short: string;
  href: string;
  status: "done" | "current" | "upcoming" | "optional";
  detail: string;
}

export function getJourneyPhases(
  progress: ProgressState,
  analytics: LearningAnalyticsState,
  certification: CertificationStatus,
): JourneyPhaseSummary[] {
  const next = getGuidedNextAction(progress, analytics, certification);
  const hasPretest = analytics.quizHistory.some((q) => q.kind === "pretest");
  const moduleStagesDone = TOPO_KEYS.flatMap((t) => [
    materiKey(t),
    praktikKey(t),
    simulasiKey(t),
  ]).filter((k) => progress.done[k]).length;
  const allModulesDone = moduleStagesDone === 9;
  const quizDone = progress.quizBest !== null && progress.quizBest >= 8;
  const hasProcess =
    analytics.reflections.length > 0 ||
    analytics.aiSessions.some((s) => s.verifiedSteps >= 3) ||
    analytics.hallucinationSolved.length > 0;

  return [
    {
      phase: 1,
      title: "Cek Awal (Pre-Test)",
      short: "1. Pre-Test",
      href: "/kuis?mode=pretest",
      status: hasPretest ? "done" : "optional",
      detail: hasPretest ? "Skor awal tercatat" : "Opsional · ukur kemampuan awal",
    },
    {
      phase: 2,
      title: "Belajar 3 Modul Topologi",
      short: "2. Materi & Lab",
      href: next.phase === 2 ? next.href : "/materi/bus",
      status: allModulesDone ? "done" : next.phase === 2 ? "current" : "upcoming",
      detail: `${moduleStagesDone}/9 tahap (Bus, Ring, Star)`,
    },
    {
      phase: 3,
      title: "Evaluasi Kuis Akhir",
      short: "3. Kuis Akhir",
      href: "/kuis",
      status: quizDone ? "done" : next.phase === 3 ? "current" : "upcoming",
      detail:
        progress.quizBest === null
          ? "10 soal studi kasus"
          : `Rekor ${progress.quizBest}/10 ${quizDone ? "(Tuntas)" : "(Target ≥8)"}`,
    },
    {
      phase: 4,
      title: "Analitik & Penguatan AI",
      short: "4. Analitik & AI",
      href: "/analitik",
      status:
        hasProcess && quizDone
          ? "done"
          : next.phase === 4
            ? "current"
            : "upcoming",
      detail: hasProcess ? "Bukti proses & analitik siap" : "Tinjau data & refleksi proses",
    },
    {
      phase: 5,
      title: "Sertifikat & Rapor",
      short: "5. Sertifikat",
      href: "/cetak",
      status: certification.eligible ? "done" : next.phase === 5 ? "current" : "upcoming",
      detail: certification.eligible
        ? `Terverifikasi · ${certification.credentialId}`
        : `${certification.completedCount}/${certification.totalChecks} syarat kelulusan`,
    },
  ];
}

export { KUIS_KEY };
