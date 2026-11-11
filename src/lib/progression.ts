/**
 * Aturan progres & XP — satu-satunya sumber kebenaran.
 *
 * Semua fungsi di sini murni (pure) dan tidak menyentuh DOM, localStorage,
 * maupun Firebase, sehingga bisa diuji langsung dengan Vitest.
 *
 * Prinsip:
 *  - XP hanya bisa didapat SEKALI per kegiatan (anti farming).
 *  - XP kuis hanya bertambah bila nilai merupakan rekor baru.
 *  - XP = jumlah XP pada daftar aktivitas. Tidak ada angka XP yang di-hardcode.
 */

export type TopoKey = "bus" | "ring" | "star";

export const TOPO_KEYS: TopoKey[] = ["bus", "ring", "star"];

export const TOPO_LABEL: Record<TopoKey, string> = {
  bus: "Bus",
  ring: "Ring",
  star: "Star",
};

export const TOPO_NOMOR: Record<TopoKey, string> = {
  bus: "01",
  ring: "02",
  star: "03",
};

/** Nilai XP untuk tiap jenis kegiatan. */
export const XP = {
  materi: 50,
  praktik: 100,
  simulasi: 50,
  kuisPerJawaban: 10,
} as const;

/**XP per tingkat level. Level 1 mulai dari 0. */
export const XP_PER_LEVEL = 150;

/** Jumlah tahap pembelajaran (3 topologi × 3 kegiatan + 1 kuis akhir). */
export const TOTAL_STAGES = 10;

export interface ActivityEntry {
  /** Unik per jenis kegiatan, mis. "materi-bus" atau "kuis-akhir". */
  key: string;
  label: string;
  topo?: TopoKey;
  xp: number;
  /** Epoch milliseconds. */
  at: number;
}

export interface ProgressState {
  activity: ActivityEntry[];
  done: Record<string, boolean>;
  quizBest: number | null;
  quizAttempts: number;
}

export const EMPTY_PROGRESS: ProgressState = {
  activity: [],
  done: {},
  quizBest: null,
  quizAttempts: 0,
};

/* ------------------------------------------------------------------ Kunci tahap */

export const materiKey = (t: TopoKey) => `materi-${t}`;
export const praktikKey = (t: TopoKey) => `praktik-${t}`;
export const simulasiKey = (t: TopoKey) => `simulasi-${t}`;
export const KUIS_KEY = "kuis-akhir";

/** Seluruh kunci tahap, untuk menghitung progres. */
export const STAGE_KEYS: string[] = [
  ...TOPO_KEYS.flatMap((t) => [materiKey(t), praktikKey(t), simulasiKey(t)]),
  KUIS_KEY,
];

/* ------------------------------------------------------------------ Level */

export function levelFor(xp: number): number {
  return 1 + Math.floor(Math.max(0, xp) / XP_PER_LEVEL);
}

export interface LevelProgress {
  level: number;
  into: number;
  need: number;
  percent: number;
}

export function levelProgress(xp: number): LevelProgress {
  const safe = Math.max(0, xp);
  const level = levelFor(safe);
  const into = safe % XP_PER_LEVEL;
  return {
    level,
    into,
    need: XP_PER_LEVEL,
    percent: Math.round((into / XP_PER_LEVEL) * 100),
  };
}

/* ------------------------------------------------------------------ XP */

export function totalXp(state: ProgressState): number {
  return state.activity.reduce((sum, a) => sum + a.xp, 0);
}

/**
 * Mencatat satu kegiatan. Idempoten: kalau key sudah pernah tercatat,
 * XP tidak ditambah lagi. Kalau key sudah ada tapi XP-nya lebih besar
 * (mis. nilai kuis naik), entry-nya diperbarui.
 */
export function recordActivity(
  state: ProgressState,
  entry: ActivityEntry,
): ProgressState {
  const idx = state.activity.findIndex((a) => a.key === entry.key);
  const activity = [...state.activity];

  if (idx === -1) {
    activity.push(entry);
  } else if (entry.xp > activity[idx].xp) {
    activity[idx] = { ...activity[idx], xp: entry.xp, at: entry.at };
  }

  const done = { ...state.done };
  if (entry.key !== KUIS_KEY) done[entry.key] = true;

  return { ...state, activity, done };
}

/**
 * XP untuk sebuah nilai kuis. Nol bila nilai ini bukan rekor baru —
 * ini yang mencegah nilai di-inflate dengan mengulang kuis.
 */
export function quizXpFor(score: number, total: number, best: number | null): number {
  if (best !== null && score <= best) return 0;
  return Math.round((score / Math.max(1, total)) * total) * XP.kuisPerJawaban;
}

export function recordQuiz(
  state: ProgressState,
  score: number,
  total: number,
  at: number,
): { state: ProgressState; gained: number } {
  const gained = quizXpFor(score, total, state.quizBest);
  const isNewBest = state.quizBest === null || score > state.quizBest;

  let next: ProgressState = {
    ...state,
    quizAttempts: state.quizAttempts + 1,
    quizBest: isNewBest ? score : state.quizBest,
  };

  if (gained > 0) {
    next = recordActivity(next, {
      key: KUIS_KEY,
      label: `Kuis akhir — nilai ${score}/${total}`,
      xp: gained,
      at,
    });
  }

  return { state: next, gained };
}

/* ------------------------------------------------------------------ Progres */

export function stageCount(state: ProgressState): number {
  return STAGE_KEYS.filter((k) => state.done[k]).length;
}

export function overallPercent(state: ProgressState): number {
  return Math.round((stageCount(state) / TOTAL_STAGES) * 100);
}

/** Persentase satu topologi: 3 kegiatan (materi, praktik, simulasi). */
export function topoPercent(state: ProgressState, topo: TopoKey): number {
  const keys = [materiKey(topo), praktikKey(topo), simulasiKey(topo)];
  const done = keys.filter((k) => state.done[k]).length;
  return Math.round((done / keys.length) * 100);
}

/**XP yang sudah didapat untuk satu topologi. */
export function topoXp(state: ProgressState, topo: TopoKey): number {
  return state.activity
    .filter((a) => a.topo === topo)
    .reduce((sum, a) => sum + a.xp, 0);
}

/* ------------------------------------------------------------------ Gabung cloud */

/**
 * Menggabungkan progres lokal dengan progres cloud.
 *
 * Aturan: untuk kunci yang sama, ambil XP yang lebih besar. Daftar kegiatan
 * digabung tanpa duplikat. Ini yang membuat sinkronisasi tidak pernah
 * "menimpa" XP yang lebih tinggi dengan nilai yang lebih rendah.
 */
export function mergeProgress(local: ProgressState, cloud: ProgressState): ProgressState {
  const byKey = new Map<string, ActivityEntry>();

  for (const a of local.activity) byKey.set(a.key, a);
  for (const a of cloud.activity) {
    const prev = byKey.get(a.key);
    if (!prev || a.xp > prev.xp) byKey.set(a.key, a);
  }

  const activity = Array.from(byKey.values()).sort((a, b) => a.at - b.at);
  const done = { ...cloud.done, ...local.done };
  const quizBest =
    local.quizBest === null
      ? cloud.quizBest
      : cloud.quizBest === null
        ? local.quizBest
        : Math.max(local.quizBest, cloud.quizBest);

  return {
    activity,
    done,
    quizBest,
    quizAttempts: Math.max(local.quizAttempts, cloud.quizAttempts),
  };
}

/** Label kegiatan yang enak dibaca untuk ditampilkan di UI. */
export function activityLabel(key: string): string {
  if (key.startsWith("materi-")) return `Materi ${TOPO_LABEL[key.slice(7) as TopoKey] ?? key}`;
  if (key.startsWith("praktik-")) return `Praktik ${TOPO_LABEL[key.slice(8) as TopoKey] ?? key}`;
  if (key.startsWith("simulasi-")) return `Simulasi ${TOPO_LABEL[key.slice(9) as TopoKey] ?? key}`;
  if (key === KUIS_KEY) return "Kuis akhir";
  return key;
}

/** Menentukan tahap berikutnya yang belum dikerjakan. */
export function nextStage(state: ProgressState): { key: string; label: string } | null {
  for (const key of STAGE_KEYS) {
    if (!state.done[key]) return { key, label: activityLabel(key) };
  }
  return null;
}
