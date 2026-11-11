import { describe, expect, it } from "vitest";
import {
  EMPTY_PROGRESS,
  KUIS_KEY,
  XP,
  XP_PER_LEVEL,
  activityLabel,
  levelFor,
  levelProgress,
  mergeProgress,
  nextStage,
  overallPercent,
  quizXpFor,
  recordActivity,
  recordQuiz,
  topoPercent,
  topoXp,
  totalXp,
  type ProgressState,
} from "@/lib/progression";

describe("level & XP", () => {
  it("memulai dari tingkat 1 saat XP nol", () => {
    expect(levelFor(0)).toBe(1);
    expect(levelFor(XP_PER_LEVEL - 1)).toBe(1);
    expect(levelFor(XP_PER_LEVEL)).toBe(2);
    expect(levelFor(XP_PER_LEVEL * 3 + 10)).toBe(4);
  });

  it("tidak pernah menghasilkan XP negatif", () => {
    expect(levelFor(-500)).toBe(1);
    expect(totalXp(EMPTY_PROGRESS)).toBe(0);
  });

  it("menghitung progres tingkat", () => {
    const p = levelProgress(XP_PER_LEVEL + 30);
    expect(p.level).toBe(2);
    expect(p.into).toBe(30);
    expect(p.percent).toBe(20);
  });
});

describe("recordActivity — anti farming", () => {
  it("menambahkan XP sekali saja untuk kegiatan yang sama", () => {
    const a = recordActivity(EMPTY_PROGRESS, {
      key: "materi-bus",
      label: "Materi Bus",
      xp: XP.materi,
      topo: "bus",
      at: 1,
    });
    expect(totalXp(a)).toBe(XP.materi);
    expect(a.done["materi-bus"]).toBe(true);

    const b = recordActivity(a, {
      key: "materi-bus",
      label: "Materi Bus",
      xp: XP.materi,
      topo: "bus",
      at: 2,
    });
    expect(totalXp(b)).toBe(XP.materi);
  });

  it("menaikkan XP bila kegiatan yang sama ber-XP lebih besar", () => {
    const a = recordActivity(EMPTY_PROGRESS, {
      key: KUIS_KEY,
      label: "Kuis",
      xp: 80,
      at: 1,
    });
    const b = recordActivity(a, { key: KUIS_KEY, label: "Kuis", xp: 100, at: 2 });
    expect(totalXp(b)).toBe(100);
  });

  it("tidak menandai kuis sebagai tahap 'done'", () => {
    const a = recordActivity(EMPTY_PROGRESS, {
      key: KUIS_KEY,
      label: "Kuis",
      xp: 50,
      at: 1,
    });
    expect(a.done[KUIS_KEY]).toBeUndefined();
  });
});

describe("recordQuiz — nilai tidak bisa di-inflate", () => {
  it("memberi XP pada percobaan pertama", () => {
    const { state, gained } = recordQuiz(EMPTY_PROGRESS, 8, 10, 1);
    expect(gained).toBe(80);
    expect(state.quizBest).toBe(8);
    expect(state.quizAttempts).toBe(1);
  });

  it("memberi nol XP bila nilai bukan rekor baru", () => {
    const pertama = recordQuiz(EMPTY_PROGRESS, 8, 10, 1).state;
    const kedua = recordQuiz(pertama, 6, 10, 2);
    expect(kedua.gained).toBe(0);
    expect(kedua.state.quizBest).toBe(8);
    expect(totalXp(kedua.state)).toBe(80);
  });

  it("menambah XP bila nilai menjadi rekor baru", () => {
    const pertama = recordQuiz(EMPTY_PROGRESS, 6, 10, 1).state;
    const kedua = recordQuiz(pertama, 9, 10, 2);
    expect(kedua.gained).toBe(90);
    expect(kedua.state.quizBest).toBe(9);
    expect(totalXp(kedua.state)).toBe(90);
  });

  it("quizXpFor mengembalikan 0 bila nilai tidak lebih tinggi dari rekor", () => {
    expect(quizXpFor(5, 10, 8)).toBe(0);
    expect(quizXpFor(9, 10, 8)).toBe(90);
    expect(quizXpFor(5, 10, null)).toBe(50);
  });
});

describe("progres per bab", () => {
  const state: ProgressState = {
    activity: [
      { key: "materi-bus", label: "Materi Bus", xp: 50, topo: "bus", at: 1 },
      { key: "praktik-bus", label: "Praktik Bus", xp: 100, topo: "bus", at: 2 },
    ],
    done: { "materi-bus": true, "praktik-bus": true },
    quizBest: 7,
    quizAttempts: 1,
  };

  it("menghitung persentase per topologi", () => {
    expect(topoPercent(state, "bus")).toBe(67);
    expect(topoPercent(state, "ring")).toBe(0);
  });

  it("menghitung XP per topologi", () => {
    expect(topoXp(state, "bus")).toBe(150);
    expect(topoXp(state, "star")).toBe(0);
  });

  it("menghitung penyelesaian keseluruhan dari 10 tahap", () => {
    expect(overallPercent(state)).toBe(20);
  });

  it("menentukan tahap berikutnya yang belum dikerjakan", () => {
    // Tahap diurutkan per topologi: seluruh tahap Bus dulu, lalu Ring, lalu Star.
    expect(nextStage(state)?.key).toBe("simulasi-bus");
  });
});

describe("mergeProgress — sinkronisasi tidak menimpa XP tinggi", () => {
  const lokal: ProgressState = {
    activity: [{ key: "materi-bus", label: "Materi Bus", xp: 50, topo: "bus", at: 2 }],
    done: { "materi-bus": true },
    quizBest: 6,
    quizAttempts: 1,
  };

  const cloud: ProgressState = {
    activity: [
      { key: "materi-bus", label: "Materi Bus", xp: 50, topo: "bus", at: 1 },
      { key: "praktik-bus", label: "Praktik Bus", xp: 100, topo: "bus", at: 3 },
    ],
    done: { "materi-bus": true, "praktik-bus": true },
    quizBest: 9,
    quizAttempts: 2,
  };

  it("menjaga XP terbesar untuk kunci yang sama", () => {
    const merged = mergeProgress(lokal, cloud);
    const bus = merged.activity.find((a) => a.key === "materi-bus");
    expect(bus?.xp).toBe(50);
    expect(totalXp(merged)).toBe(150);
  });

  it("mengambil rekor kuis tertinggi dan jumlah percobaan terbesar", () => {
    const merged = mergeProgress(lokal, cloud);
    expect(merged.quizBest).toBe(9);
    expect(merged.quizAttempts).toBe(2);
  });

  it("menggabungkan kunci selesai dari kedua sisi", () => {
    const merged = mergeProgress(lokal, cloud);
    expect(merged.done["materi-bus"]).toBe(true);
    expect(merged.done["praktik-bus"]).toBe(true);
  });

  it("tidak menggandakan entri dengan kunci sama", () => {
    const merged = mergeProgress(lokal, cloud);
    expect(merged.activity.filter((a) => a.key === "materi-bus")).toHaveLength(1);
  });
});

describe("label kegiatan", () => {
  it("menerjemahkan kunci menjadi bacaan yang rapi", () => {
    expect(activityLabel("materi-ring")).toBe("Materi Ring");
    expect(activityLabel("praktik-star")).toBe("Praktik Star");
    expect(activityLabel("simulasi-bus")).toBe("Simulasi Bus");
    expect(activityLabel(KUIS_KEY)).toBe("Kuis akhir");
  });
});
