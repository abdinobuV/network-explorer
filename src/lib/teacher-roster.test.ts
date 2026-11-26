import { describe, expect, it } from "vitest";
import {
  buildStudentRecord,
  rosterToCsv,
  summarizeClassRoster,
} from "@/lib/teacher-roster";
import { createEmptyAnalytics } from "@/lib/analytics";
import { EMPTY_PROGRESS } from "@/lib/progression";

describe("Agregasi Dashboard Guru (teacher-roster)", () => {
  it("mengelompokkan status murid menjadi selesai, mengerjakan, dan belum-mulai", () => {
    const a1 = createEmptyAnalytics();
    a1.reflections.push({
      id: "r1",
      at: 1000,
      context: "Star",
      text: "Switch adalah pusat Star.",
      source: "cek-pemahaman",
    });
    a1.quizHistory.push({
      id: "q1",
      at: 2000,
      kind: "posttest",
      score: 9,
      total: 10,
      durationSec: 120,
      answers: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 0, 6: 1, 7: 1, 8: 0, 9: 1, 10: 1 },
    });

    const selesai = buildStudentRecord(
      { uid: "s1", name: "Alya", email: "alya@sch.id", kelas: "XI" },
      {
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
      },
      a1,
    );

    const mengerjakan = buildStudentRecord(
      { uid: "s2", name: "Dimas", email: "dimas@sch.id", kelas: "XI" },
      { activity: [], done: { "materi-bus": true }, quizBest: 4, quizAttempts: 1 },
      createEmptyAnalytics(),
    );

    const belum = buildStudentRecord(
      { uid: "s3", name: "Rafi", email: "rafi@sch.id", kelas: "XI" },
      EMPTY_PROGRESS,
      createEmptyAnalytics(),
    );

    expect(selesai.status).toBe("selesai");
    expect(mengerjakan.status).toBe("mengerjakan");
    expect(belum.status).toBe("belum-mulai");

    const summary = summarizeClassRoster([selesai, mengerjakan, belum]);
    expect(summary.totalStudents).toBe(3);
    expect(summary.completedCount).toBe(1);
    expect(summary.inProgressCount).toBe(1);
    expect(summary.notStartedCount).toBe(1);
    expect(summary.averageQuizPercent).toBe(65);
    expect(summary.mostDifficultQuestion?.id).toBe(5);
  });

  it("mengekspor rekap murid ke format CSV yang rapi", () => {
    const rec = buildStudentRecord(
      { uid: "s1", name: "Alya Putri", email: "alya@sch.id", kelas: "XI" },
      EMPTY_PROGRESS,
      createEmptyAnalytics(),
    );
    const csv = rosterToCsv([rec]);
    expect(csv).toContain("Alya Putri");
    expect(csv).toContain("Belum Mulai");
  });
});
