import { describe, expect, it } from "vitest";
import {
  buildCredentialId,
  buildSampleStudentAnalytics,
  computeAnalytics,
  createEmptyAnalytics,
  evaluateCertification,
  formatDuration,
} from "@/lib/analytics";
import { EMPTY_PROGRESS, type ProgressState } from "@/lib/progression";

describe("Learning Analytics — 4 tingkat analisis", () => {
  it("menghitung kondisi awal kosong dengan aman dan menyarankan Pre-Test", () => {
    const summary = computeAnalytics(EMPTY_PROGRESS, createEmptyAnalytics());
    expect(summary.completionRate).toBe(0);
    expect(summary.masteryRate).toBeNull();
    expect(summary.progressMasteryGap).toBe(false);
    expect(summary.predictive.level).toBe("rendah");
    expect(summary.recommendations.some((r) => r.href.includes("pretest"))).toBe(true);
  });

  it("mendeteksi kesenjangan Progress 100% vs penguasaan rendah (Slide 8)", () => {
    const progress: ProgressState = {
      activity: [],
      done: {
        "materi-bus": true,
        "praktik-bus": true,
        "simulasi-bus": true,
        "materi-ring": true,
        "praktik-ring": true,
        "simulasi-ring": true,
        "materi-star": true,
        "praktik-star": true,
        "simulasi-star": true,
      },
      quizBest: 5,
      quizAttempts: 2,
    };
    const analytics = createEmptyAnalytics();
    analytics.quizHistory.push({
      id: "q1",
      at: 1000,
      kind: "posttest",
      score: 5,
      total: 10,
      durationSec: 120,
      answers: { 1: 1, 2: 0, 3: 1, 4: 0, 5: 0, 6: 1, 7: 1, 8: 0, 9: 1, 10: 0 },
    });

    const summary = computeAnalytics(progress, analytics);
    expect(summary.completionRate).toBe(90);
    expect(summary.masteryRate).toBe(50);
    expect(summary.progressMasteryGap).toBe(true);
    expect(summary.predictive.level).toBe("perlu-perhatian");
    expect(summary.weakestConcept).not.toBeNull();
    expect(summary.recommendations.some((r) => r.href.includes("mode=adaptive"))).toBe(true);
  });

  it("menghitung kenaikan Pre-Test ke Post-Test dan analisis butir soal pada data sampel", () => {
    const sample = buildSampleStudentAnalytics(1_700_000_000_000);
    const progress: ProgressState = {
      activity: [],
      done: {
        "materi-bus": true,
        "praktik-bus": true,
        "simulasi-bus": true,
        "materi-ring": true,
        "praktik-ring": true,
        "simulasi-ring": true,
        "materi-star": true,
        "praktik-star": true,
        "simulasi-star": true,
      },
      quizBest: 8,
      quizAttempts: 3,
    };

    const summary = computeAnalytics(progress, sample, 1_700_000_000_000);
    expect(summary.pretestPercent).toBe(50);
    expect(summary.posttestPercent).toBe(80);
    expect(summary.scoreGain).toBe(30);
    expect(summary.mostDifficultQuestion).not.toBeNull();
    expect(summary.decisionPipeline.data.length).toBeGreaterThan(10);
    expect(summary.predictive.ethicalNote).toContain("bukan kepastian");
  });

  it("mengevaluasi kelayakan sertifikat kompetensi termasuk bukti proses", () => {
    const fullProg: ProgressState = {
      activity: [],
      done: {
        "materi-bus": true,
        "praktik-bus": true,
        "simulasi-bus": true,
        "materi-ring": true,
        "praktik-ring": true,
        "simulasi-ring": true,
        "materi-star": true,
        "praktik-star": true,
        "simulasi-star": true,
      },
      quizBest: 9,
      quizAttempts: 1,
    };

    const withoutReflection = evaluateCertification("u1", fullProg, createEmptyAnalytics(), 690);
    expect(withoutReflection.eligible).toBe(false);

    const withReflection = createEmptyAnalytics();
    withReflection.reflections.push({
      id: "r1",
      at: 1,
      context: "Bus",
      text: "Backbone adalah titik tunggal.",
      source: "cek-pemahaman",
    });
    const eligible = evaluateCertification("u1", fullProg, withReflection, 690);
    expect(eligible.eligible).toBe(true);
    expect(eligible.credentialId).toBe(buildCredentialId("u1", 9, 690));
  });

  it("memformat durasi waktu belajar dengan rapi", () => {
    expect(formatDuration(45)).toBe("45 dtk");
    expect(formatDuration(125)).toBe("2 mnt 5 dtk");
    expect(formatDuration(3660)).toBe("1 jam 1 mnt");
  });
});
