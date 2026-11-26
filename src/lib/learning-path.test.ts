import { describe, expect, it } from "vitest";
import {
  getGuidedNextAction,
  getJourneyPhases,
  getModuleContinuation,
} from "@/lib/learning-path";
import { createEmptyAnalytics, evaluateCertification } from "@/lib/analytics";
import { EMPTY_PROGRESS, type ProgressState } from "@/lib/progression";

describe("Alur belajar terarah (learning-path)", () => {
  it("mengarahkan siswa baru langsung ke Materi Topologi Bus", () => {
    const analytics = createEmptyAnalytics();
    const cert = evaluateCertification("u1", EMPTY_PROGRESS, analytics, 0);
    const next = getGuidedNextAction(EMPTY_PROGRESS, analytics, cert);
    expect(next.phase).toBe(2);
    expect(next.href).toBe("/materi/bus");
  });

  it("berurutan dari Materi → Praktik → Sandbox → Modul Berikutnya → Perbandingan", () => {
    expect(getModuleContinuation("bus", "materi").next.href).toBe("/praktik/bus");
    expect(getModuleContinuation("bus", "praktik").next.href).toBe("/sandbox/bus");
    expect(getModuleContinuation("bus", "simulasi").next.href).toBe("/materi/ring");
    expect(getModuleContinuation("ring", "simulasi").next.href).toBe("/materi/star");
    expect(getModuleContinuation("star", "simulasi").next.href).toBe("/perbandingan");
  });

  it("mengarahkan ke Kuis Akhir setelah 3 modul tuntas, lalu Sertifikat setelah syarat lengkap", () => {
    const nineDone: ProgressState = {
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
      quizBest: null,
      quizAttempts: 0,
    };
    const analytics = createEmptyAnalytics();
    const cert0 = evaluateCertification("u1", nineDone, analytics, 600);
    expect(getGuidedNextAction(nineDone, analytics, cert0).href).toBe("/kuis");

    const passed: ProgressState = { ...nineDone, quizBest: 9, quizAttempts: 1 };
    analytics.reflections.push({
      id: "r1",
      at: 1,
      context: "Star",
      text: "Refleksi mandiri siswa.",
      source: "cek-pemahaman",
    });
    const cert1 = evaluateCertification("u1", passed, analytics, 690);
    expect(getGuidedNextAction(passed, analytics, cert1).href).toBe("/cetak");
    expect(getJourneyPhases(passed, analytics, cert1)[4].status).toBe("done");
  });
});
