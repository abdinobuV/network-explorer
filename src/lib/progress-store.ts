/**
 * Store progres: local (localStorage) + cloud (Firestore), disinkronkan.
 *
 * Perbaikan penting dibanding versi lama:
 *  1. Push ke cloud hanya boleh terjadi SETELAH data cloud selesai dimuat.
 *     Versi lama menulis XP default lebih dulu sehingga bisa menimpa XP
 *     yang lebih tinggi milik pengguna (race condition).
 *  2. Error sinkronisasi tidak lagi ditelan — statusnya bisa ditampilkan.
 *  3. XP hanya bisa didapat sekali per kegiatan (lihat lib/progression.ts).
 */

import { isDemoMode, loadCloudProg, saveCloudProg } from "@/lib/firebase";
import { getSession, subscribeSession } from "@/lib/auth-session";
import { readItem, writeItem, removeItem } from "@/lib/storage";
import {
  EMPTY_PROGRESS,
  KUIS_KEY,
  mergeProgress,
  recordActivity,
  recordQuiz,
  totalXp,
  type ActivityEntry,
  type ProgressState,
  type TopoKey,
} from "@/lib/progression";

const LEGACY_KEY = "misi-prog";
const PUSH_DELAY = 800;

export type SyncState = "idle" | "loading" | "saving" | "saved" | "error";

let state: ProgressState = EMPTY_PROGRESS;
let syncState: SyncState = "idle";
let syncError: string | null = null;

/** uid yang datanya sudah digabung dengan cloud — push hanya boleh untuk uid ini. */
let hydratedUid: string | null = null;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let started = false;

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function setState(next: ProgressState) {
  state = next;
  emit();
}

function progKey(uid: string) {
  return `misi-prog-${uid}`;
}

/** Membaca progres lokal milik seorang pengguna (dengan migrasi data lama). */
function loadLocal(uid: string): ProgressState {
  const keyed = readItem<ProgressState | null>(progKey(uid), null);
  if (keyed) return normalize(keyed);
  const legacy = readItem<ProgressState | null>(LEGACY_KEY, null);
  if (legacy) {
    const migrated = normalize(legacy);
    writeItem(progKey(uid), migrated);
    return migrated;
  }
  return EMPTY_PROGRESS;
}

function normalize(raw: Partial<ProgressState> | null): ProgressState {
  if (!raw) return EMPTY_PROGRESS;
  return {
    activity: Array.isArray(raw.activity) ? raw.activity : [],
    done: raw.done && typeof raw.done === "object" ? raw.done : {},
    quizBest: typeof raw.quizBest === "number" ? raw.quizBest : null,
    quizAttempts: typeof raw.quizAttempts === "number" ? raw.quizAttempts : 0,
  };
}

function persistLocal(uid: string | null) {
  if (!uid) return;
  writeItem(progKey(uid), state);
}

/* ------------------------------------------------------------------ Sinkronisasi */

function schedulePush(uid: string) {
  // Gerbang anti-race: jangan pernah push sebelum data cloud selesai dimuat.
  if (hydratedUid !== uid) return;
  if (pushTimer) clearTimeout(pushTimer);
  setSync("saving");
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void pushNow(uid);
  }, PUSH_DELAY);
}

async function pushNow(uid: string) {
  const session = getSession();
  const result = await saveCloudProg(uid, {
    xp: totalXp(state),
    done: state.done,
    quizBest: state.quizBest,
    quizAttempts: state.quizAttempts,
    activity: state.activity,
    name: session?.name,
    email: session?.email,
    kelas: session?.kelas,
  });
  if (result.ok) {
    setSync("saved");
  } else {
    setSync("error", result.error ?? "Gagal menyimpan progres ke cloud.");
  }
}

function setSync(next: SyncState, error: string | null = null) {
  syncState = next;
  syncError = error;
  emit();
}

async function hydrate(uid: string) {
  hydratedUid = null;
  setSync("loading");
  setState(loadLocal(uid));

  if (isDemoMode) {
    hydratedUid = uid;
    setSync("saved");
    return;
  }

  const cloud = await loadCloudProg(uid);
  if (hydratedUid !== null && hydratedUid !== uid) return; // sesi sudah berganti

  if (cloud) {
    const cloudState = normalize({
      activity: cloud.activity ?? [],
      done: cloud.done ?? {},
      quizBest: cloud.quizBest ?? null,
      quizAttempts: cloud.quizAttempts ?? 0,
    });

    // Dokumen lama belum punya daftar aktivitas → XP lama diselamatkan
    // sebagai satu entri agar tidak hilang saat digabung.
    if (cloudState.activity.length === 0 && (cloud.xp ?? 0) > 0) {
      cloudState.activity = [
        {
          key: "progres-lama",
          label: "Progres sebelum pembaruan aplikasi",
          xp: cloud.xp,
          at: 0,
        },
      ];
    }

    setState(mergeProgress(state, cloudState));
    persistLocal(uid);
  }

  hydratedUid = uid;
  setSync("saved");
  // Tulis balik hasil gabungan agar cloud tidak tertinggal.
  schedulePush(uid);
}

/* ------------------------------------------------------------------ Store API */

function start() {
  if (started || typeof window === "undefined") return;
  started = true;

  subscribeSession(() => {
    const session = getSession();
    const uid = session?.uid ?? null;
    if (!uid) {
      hydratedUid = null;
      setSync("idle");
      setState(EMPTY_PROGRESS);
      return;
    }
    void hydrate(uid);
  });

  const session = getSession();
  if (session) void hydrate(session.uid);
}

export function subscribeProgress(cb: () => void): () => void {
  start();
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getProgress(): ProgressState {
  start();
  return state;
}

export function getSyncState(): SyncState {
  start();
  return syncState;
}

export function getSyncError(): string | null {
  start();
  return syncError;
}

/* Nilai saat server merender — Always stabil. */
export function getServerProgress(): ProgressState {
  return EMPTY_PROGRESS;
}

export function getServerSyncState(): SyncState {
  return "idle";
}

export function getServerSyncError(): string | null {
  return null;
}

/* ------------------------------------------------------------------ Aksi */

/**
 * Mencatat satu kegiatan selesai (materi / praktik / simulasi).
 * Idempoten — XP tidak akan ditambah dua kali untuk kegiatan yang sama.
 */
export function markActivity(entry: {
  key: string;
  label: string;
  xp: number;
  topo?: TopoKey;
}): boolean {
  const uid = getSession()?.uid ?? null;
  const before = totalXp(state);
  const next = recordActivity(state, { ...entry, at: Date.now() });
  if (next === state) return false;
  setState(next);
  persistLocal(uid);
  if (uid) schedulePush(uid);
  return totalXp(next) > before;
}

/** Mencatat hasil kuis. XP hanya diberikan bila nilai adalah rekor baru. */
export function recordQuizResult(score: number, total: number): number {
  const uid = getSession()?.uid ?? null;
  const { state: next, gained } = recordQuiz(state, score, total, Date.now());
  setState(next);
  persistLocal(uid);
  if (uid) schedulePush(uid);
  return gained;
}

/** Menghapus seluruh progres (untuk mengulang dari awal). */
export function resetProgress(): void {
  const uid = getSession()?.uid ?? null;
  setState(EMPTY_PROGRESS);
  if (uid) {
    removeItem(progKey(uid));
    persistLocal(uid);
    schedulePush(uid);
  }
}

/** Kunci kuis — dipakai UI. */
export const QUIZ_KEY = KUIS_KEY;

/** Daftar entri aktivitas yang sudah tercatat (untuk log). */
export function activityLog(): ActivityEntry[] {
  return [...state.activity].sort((a, b) => b.at - a.at);
}
