/**
 * Mesin Papan Peringkat (Leaderboard Siswa) yang aman privasi.
 *
 * Prinsip privasi & keadilan:
 *  - Hanya menampilkan data ringkas publik-aman (nama/alias anonim, kelas, XP, level,
 *    jumlah tahap selesai, nilai kuis terbaik, status sertifikat) — TANPA email,
 *    detail kesalahan soal, maupun refleksi pribadi murid lain.
 *  - Hanya peserta didik (role === "siswa") yang masuk papan peringkat.
 *  - Siswa dapat menyalakan Mode Anonim kapan saja agar tampil sebagai "Peserta #XXXX".
 *  - Pengurutan deterministik: XP → Nilai Kuis → Tahap Selesai → Nama.
 */

import { getSession, readDemoUsers } from "@/lib/auth-session";
import {
  isDemoMode,
  loadCloudLeaderboard,
  saveCloudLeaderboard,
  type CloudLeaderboardDoc,
} from "@/lib/firebase";
import { readItem, writeItem } from "@/lib/storage";
import {
  EMPTY_PROGRESS,
  TOTAL_STAGES,
  levelFor,
  stageCount,
  totalXp,
  type ProgressState,
} from "@/lib/progression";

export interface LeaderboardRawEntry {
  uid: string;
  name: string;
  kelas: string;
  xp: number;
  stagesDone: number;
  quizBest: number | null;
  certified: boolean;
  anonymous?: boolean;
}

export interface RankedLeaderboardEntry extends LeaderboardRawEntry {
  rank: number;
  level: number;
  progressPercent: number;
  displayName: string;
  isCurrentUser: boolean;
}

/** Alias anonim deterministik dari UID siswa agar konsisten namun tidak membocorkan nama. */
export function anonymousAlias(uid: string): string {
  let h = 2166136261;
  for (let i = 0; i < uid.length; i++) {
    h ^= uid.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return `Peserta #${(h % 9000 + 1000).toString()}`;
}

/**
 * Mengurutkan dan memberi peringkat peserta secara deterministik.
 * Urutan: XP tertinggi → Nilai kuis terbaik → Tahap selesai terbanyak → Nama A-Z.
 */
export function rankLeaderboard(
  entries: LeaderboardRawEntry[],
  currentUid: string | null = null,
): RankedLeaderboardEntry[] {
  const sorted = [...entries].sort((a, b) => {
    if (b.xp !== a.xp) return b.xp - a.xp;
    const qa = a.quizBest ?? -1;
    const qb = b.quizBest ?? -1;
    if (qb !== qa) return qb - qa;
    if (b.stagesDone !== a.stagesDone) return b.stagesDone - a.stagesDone;
    return a.name.localeCompare(b.name, "id");
  });

  return sorted.map((e, i) => {
    const isCurrentUser = currentUid !== null && e.uid === currentUid;
    const displayName = e.anonymous
      ? isCurrentUser
        ? `${anonymousAlias(e.uid)} (Kamu · Anonim)`
        : anonymousAlias(e.uid)
      : e.name;

    return {
      ...e,
      rank: i + 1,
      level: levelFor(e.xp),
      progressPercent: Math.round((Math.min(e.stagesDone, TOTAL_STAGES) / TOTAL_STAGES) * 100),
      displayName,
      isCurrentUser,
    };
  });
}

export function getAnonymousPref(uid: string | null): boolean {
  if (!uid) return false;
  return readItem<boolean>(`misi-lb-anon-${uid}`, false);
}

export async function setAnonymousPref(
  uid: string,
  anonymous: boolean,
  currentEntry?: Omit<LeaderboardRawEntry, "uid" | "anonymous">,
): Promise<void> {
  writeItem(`misi-lb-anon-${uid}`, anonymous);
  if (!isDemoMode && currentEntry) {
    await saveCloudLeaderboard(uid, { ...currentEntry, anonymous });
  }
}

/** Memuat seluruh entri papan peringkat (Mode Demo lokal atau koleksi `leaderboard` Firestore). */
export async function loadLeaderboard(): Promise<{
  ok: boolean;
  entries: RankedLeaderboardEntry[];
  source: "demo" | "firebase";
  error?: string;
}> {
  const session = getSession();
  const currentUid = session?.uid ?? null;

  if (isDemoMode) {
    const students = readDemoUsers().filter((u) => u.role !== "guru");
    const raw: LeaderboardRawEntry[] = students.map((u) => {
      const prog = readItem<Partial<ProgressState> | null>(`misi-prog-${u.uid}`, null);
      const state: ProgressState = {
        activity: Array.isArray(prog?.activity) ? prog.activity : [],
        done: prog?.done && typeof prog.done === "object" ? prog.done : {},
        quizBest: typeof prog?.quizBest === "number" ? prog.quizBest : null,
        quizAttempts: typeof prog?.quizAttempts === "number" ? prog.quizAttempts : 0,
      };
      const stages = stageCount(state);
      return {
        uid: u.uid,
        name: u.name,
        kelas: u.kelas || "XI",
        xp: totalXp(state),
        stagesDone: stages,
        quizBest: state.quizBest,
        certified: stages >= 9 && state.quizBest !== null && state.quizBest >= 8,
        anonymous: getAnonymousPref(u.uid),
      };
    });
    return { ok: true, entries: rankLeaderboard(raw, currentUid), source: "demo" };
  }

  const res = await loadCloudLeaderboard();
  if (!res.ok) {
    return { ok: false, entries: [], source: "firebase", error: res.error };
  }

  const raw: LeaderboardRawEntry[] = res.entries.map((d: CloudLeaderboardDoc) => ({
    uid: d.uid,
    name: d.name || "Siswa",
    kelas: d.kelas || "XI",
    xp: typeof d.xp === "number" ? d.xp : 0,
    stagesDone: typeof d.stagesDone === "number" ? d.stagesDone : 0,
    quizBest: typeof d.quizBest === "number" ? d.quizBest : null,
    certified: !!d.certified,
    anonymous: !!d.anonymous,
  }));

  // Pastikan pengguna siswa yang sedang login selalu masuk peringkat meski baru pertama kali buka
  if (session && session.role !== "guru" && !raw.some((e) => e.uid === session.uid)) {
    const localProg = readItem<ProgressState>(`misi-prog-${session.uid}`, EMPTY_PROGRESS);
    const stages = stageCount(localProg);
    const ownEntry: LeaderboardRawEntry = {
      uid: session.uid,
      name: session.name,
      kelas: session.kelas || "XI",
      xp: totalXp(localProg),
      stagesDone: stages,
      quizBest: localProg.quizBest,
      certified: stages >= 9 && localProg.quizBest !== null && localProg.quizBest >= 8,
      anonymous: getAnonymousPref(session.uid),
    };
    raw.push(ownEntry);
    void saveCloudLeaderboard(session.uid, {
      name: ownEntry.name,
      kelas: ownEntry.kelas,
      xp: ownEntry.xp,
      stagesDone: ownEntry.stagesDone,
      quizBest: ownEntry.quizBest,
      certified: ownEntry.certified,
      anonymous: ownEntry.anonymous,
    });
  }

  return { ok: true, entries: rankLeaderboard(raw, currentUid), source: "firebase" };
}
