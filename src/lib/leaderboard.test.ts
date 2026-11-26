import { describe, expect, it } from "vitest";
import { anonymousAlias, rankLeaderboard, type LeaderboardRawEntry } from "@/lib/leaderboard";

describe("Leaderboard Siswa (leaderboard.ts)", () => {
  it("mengurutkan peringkat berdasarkan XP → Nilai Kuis → Tahap Selesai", () => {
    const data: LeaderboardRawEntry[] = [
      { uid: "u1", name: "Budi", kelas: "XI", xp: 250, stagesDone: 3, quizBest: 5, certified: false },
      { uid: "u2", name: "Alya", kelas: "XI", xp: 690, stagesDone: 9, quizBest: 9, certified: true },
      { uid: "u3", name: "Citra", kelas: "XI", xp: 250, stagesDone: 4, quizBest: 8, certified: false },
    ];

    const ranked = rankLeaderboard(data, "u1");
    expect(ranked.map((r) => r.uid)).toEqual(["u2", "u3", "u1"]);
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].rank).toBe(2);
    expect(ranked[2].rank).toBe(3);
    expect(ranked[2].isCurrentUser).toBe(true);
  });

  it("menyamarkan nama peserta yang memilih Mode Anonim secara deterministik", () => {
    const data: LeaderboardRawEntry[] = [
      {
        uid: "u-anon",
        name: "Nama Rahasia",
        kelas: "XI",
        xp: 500,
        stagesDone: 7,
        quizBest: 8,
        certified: false,
        anonymous: true,
      },
    ];
    const rankedOther = rankLeaderboard(data, "u-lain");
    expect(rankedOther[0].displayName).toBe(anonymousAlias("u-anon"));
    expect(rankedOther[0].displayName).not.toContain("Nama Rahasia");

    const rankedSelf = rankLeaderboard(data, "u-anon");
    expect(rankedSelf[0].displayName).toContain("Kamu");
  });
});
