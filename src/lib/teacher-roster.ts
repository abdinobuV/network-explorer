/**
 * Agregasi data seluruh murid untuk Dashboard Guru (/guru).
 *
 * Hanya boleh dipanggil oleh sesi dengan role === "guru":
 *  - Mode Demo    : membaca seluruh akun siswa dari localStorage (misi-users,
 *                   misi-prog-<uid>, misi-analytics-<uid>).
 *  - Mode Firebase: membaca koleksi users dari Firestore (dilindungi firestore.rules
 *                   sehingga hanya akun role "guru" yang diizinkan membaca).
 */

import { getSession, readDemoUsers } from "@/lib/auth-session";
import {
  isDemoMode,
  loadAllCloudUsers,
  loadCloudProg,
  saveCloudProg,
  type CloudUserDoc,
} from "@/lib/firebase";
import { readItem, writeItem } from "@/lib/storage";
import {
  EMPTY_PROGRESS,
  overallPercent,
  stageCount,
  totalXp,
  type ProgressState,
} from "@/lib/progression";
import {
  computeAnalytics,
  createEmptyAnalytics,
  evaluateCertification,
  type AnalyticsSummary,
  type CertificationStatus,
  type LearningAnalyticsState,
} from "@/lib/analytics";
import { CONCEPT_META, QUIZ, type ConceptKey } from "@/lib/data";

export type StudentWorkStatus = "selesai" | "mengerjakan" | "belum-mulai";

export interface StudentRosterRecord {
  uid: string;
  name: string;
  email: string;
  kelas: string;
  xp: number;
  progress: ProgressState;
  analytics: LearningAnalyticsState;
  summary: AnalyticsSummary;
  certification: CertificationStatus;
  stagesDone: number;
  completionPercent: number;
  status: StudentWorkStatus;
  lastActiveAt: number | null;
}

export interface ClassRosterSummary {
  totalStudents: number;
  completedCount: number;
  inProgressCount: number;
  notStartedCount: number;
  needsAttentionCount: number;
  averageQuizPercent: number | null;
  averageProgressPercent: number;
  itemAccuracy: Array<{
    id: number;
    concept: ConceptKey;
    label: string;
    attempts: number;
    correct: number;
    correctPct: number | null;
  }>;
  mostDifficultQuestion: {
    id: number;
    label: string;
    correctPct: number;
  } | null;
}

function normalizeProgress(raw: Partial<ProgressState> | null | undefined): ProgressState {
  if (!raw) return EMPTY_PROGRESS;
  return {
    activity: Array.isArray(raw.activity) ? raw.activity : [],
    done: raw.done && typeof raw.done === "object" ? raw.done : {},
    quizBest: typeof raw.quizBest === "number" ? raw.quizBest : null,
    quizAttempts: typeof raw.quizAttempts === "number" ? raw.quizAttempts : 0,
  };
}

function normalizeAnalytics(
  raw: Partial<LearningAnalyticsState> | null | undefined,
): LearningAnalyticsState {
  const base = createEmptyAnalytics();
  if (!raw) return base;
  return {
    loginCount: typeof raw.loginCount === "number" ? raw.loginCount : 0,
    lastLoginAt: typeof raw.lastLoginAt === "number" ? raw.lastLoginAt : null,
    trackingConsent: typeof raw.trackingConsent === "boolean" ? raw.trackingConsent : true,
    materi: {
      bus: { ...base.materi.bus, ...(raw.materi?.bus ?? {}) },
      ring: { ...base.materi.ring, ...(raw.materi?.ring ?? {}) },
      star: { ...base.materi.star, ...(raw.materi?.star ?? {}) },
    },
    praktik: {
      bus: { ...base.praktik.bus, ...(raw.praktik?.bus ?? {}) },
      ring: { ...base.praktik.ring, ...(raw.praktik?.ring ?? {}) },
      star: { ...base.praktik.star, ...(raw.praktik?.star ?? {}) },
    },
    simulasi: {
      bus: { ...base.simulasi.bus, ...(raw.simulasi?.bus ?? {}) },
      ring: { ...base.simulasi.ring, ...(raw.simulasi?.ring ?? {}) },
      star: { ...base.simulasi.star, ...(raw.simulasi?.star ?? {}) },
    },
    quizHistory: Array.isArray(raw.quizHistory) ? raw.quizHistory : [],
    reflections: Array.isArray(raw.reflections) ? raw.reflections : [],
    aiSessions: Array.isArray(raw.aiSessions) ? raw.aiSessions : [],
    hallucinationSolved: Array.isArray(raw.hallucinationSolved) ? raw.hallucinationSolved : [],
    traces: Array.isArray(raw.traces) ? raw.traces : [],
  };
}

function computeLastActive(
  progress: ProgressState,
  analytics: LearningAnalyticsState,
): number | null {
  const times: number[] = [];
  if (analytics.lastLoginAt) times.push(analytics.lastLoginAt);
  for (const a of progress.activity) if (a.at) times.push(a.at);
  for (const q of analytics.quizHistory) if (q.at) times.push(q.at);
  for (const r of analytics.reflections) if (r.at) times.push(r.at);
  return times.length > 0 ? Math.max(...times) : null;
}

export function buildStudentRecord(
  meta: { uid: string; name: string; email: string; kelas: string },
  rawProgress: Partial<ProgressState> | null | undefined,
  rawAnalytics: Partial<LearningAnalyticsState> | null | undefined,
  fallbackXp = 0,
): StudentRosterRecord {
  const progress = normalizeProgress(rawProgress);
  const analytics = normalizeAnalytics(rawAnalytics);
  const xp = Math.max(totalXp(progress), fallbackXp);
  const summary = computeAnalytics(progress, analytics);
  const certification = evaluateCertification(meta.uid, progress, analytics, xp);
  const stagesDone = stageCount(progress);
  const completionPercent = overallPercent(progress);

  let status: StudentWorkStatus = "belum-mulai";
  if (
    certification.eligible ||
    (completionPercent >= 90 && progress.quizBest !== null && progress.quizBest >= 8)
  ) {
    status = "selesai";
  } else if (
    stagesDone > 0 ||
    progress.quizAttempts > 0 ||
    analytics.quizHistory.length > 0 ||
    analytics.reflections.length > 0 ||
    analytics.loginCount > 0
  ) {
    status = "mengerjakan";
  }

  return {
    uid: meta.uid,
    name: meta.name || meta.email.split("@")[0] || "Siswa",
    email: meta.email || "—",
    kelas: meta.kelas || "XI",
    xp,
    progress,
    analytics,
    summary,
    certification,
    stagesDone,
    completionPercent,
    status,
    lastActiveAt: computeLastActive(progress, analytics),
  };
}

/** Menghitung ringkasan kelas & analisis butir soal dari daftar seluruh murid nyata. */
export function summarizeClassRoster(records: StudentRosterRecord[]): ClassRosterSummary {
  const totalStudents = records.length;
  const completedCount = records.filter((r) => r.status === "selesai").length;
  const inProgressCount = records.filter((r) => r.status === "mengerjakan").length;
  const notStartedCount = records.filter((r) => r.status === "belum-mulai").length;
  const needsAttentionCount = records.filter(
    (r) => r.summary.predictive.level === "perlu-perhatian",
  ).length;

  const scored = records.filter((r) => r.summary.bestQuizPercent !== null);
  const averageQuizPercent =
    scored.length > 0
      ? Math.round(
          scored.reduce((s, r) => s + (r.summary.bestQuizPercent ?? 0), 0) / scored.length,
        )
      : null;

  const averageProgressPercent =
    totalStudents > 0
      ? Math.round(records.reduce((s, r) => s + r.completionPercent, 0) / totalStudents)
      : 0;

  const itemAccuracy = QUIZ.map((q) => {
    let attempts = 0;
    let correct = 0;
    for (const rec of records) {
      for (const h of rec.analytics.quizHistory) {
        if (h.kind === "adaptive") continue;
        if (h.answers[q.id] !== undefined) {
          attempts += 1;
          if (h.answers[q.id] === q.answer) correct += 1;
        }
      }
    }
    return {
      id: q.id,
      concept: q.concept,
      label: `Soal ${q.id} (${CONCEPT_META[q.concept].short})`,
      attempts,
      correct,
      correctPct: attempts > 0 ? Math.round((correct / attempts) * 100) : null,
    };
  });

  const testedItems = itemAccuracy.filter((it) => it.correctPct !== null);
  const hardest =
    testedItems.length > 0
      ? [...testedItems].sort((a, b) => (a.correctPct ?? 100) - (b.correctPct ?? 100))[0]
      : null;

  return {
    totalStudents,
    completedCount,
    inProgressCount,
    notStartedCount,
    needsAttentionCount,
    averageQuizPercent,
    averageProgressPercent,
    itemAccuracy,
    mostDifficultQuestion: hardest
      ? { id: hardest.id, label: hardest.label, correctPct: hardest.correctPct ?? 0 }
      : null,
  };
}

/** Memuat daftar seluruh murid — khusus untuk akun Guru. */
export async function loadStudentRoster(): Promise<{
  ok: boolean;
  records: StudentRosterRecord[];
  source: "demo" | "firebase";
  error?: string;
}> {
  const session = getSession();
  if (!session || session.role !== "guru") {
    return {
      ok: false,
      records: [],
      source: isDemoMode ? "demo" : "firebase",
      error: "Akses ditolak. Hanya akun Guru yang dapat melihat daftar seluruh murid.",
    };
  }

  if (isDemoMode) {
    const demoUsers = readDemoUsers().filter((u) => u.role !== "guru");
    const records = demoUsers
      .map((u) => {
        const prog = readItem<Partial<ProgressState> | null>(`misi-prog-${u.uid}`, null);
        const ana = readItem<Partial<LearningAnalyticsState> | null>(
          `misi-analytics-${u.uid}`,
          null,
        );
        return buildStudentRecord(
          { uid: u.uid, name: u.name, email: u.email, kelas: u.kelas },
          prog,
          ana,
        );
      })
      .sort((a, b) => (b.lastActiveAt ?? 0) - (a.lastActiveAt ?? 0));
    return { ok: true, records, source: "demo" };
  }

  const res = await loadAllCloudUsers();
  if (!res.ok) {
    return { ok: false, records: [], source: "firebase", error: res.error };
  }

  const records = res.users
    .filter((u: CloudUserDoc) => u.role !== "guru")
    .map((u: CloudUserDoc) =>
      buildStudentRecord(
        {
          uid: u.uid,
          name: u.name ?? u.email?.split("@")[0] ?? "Siswa",
          email: u.email ?? "—",
          kelas: u.kelas ?? "XI",
        },
        {
          activity: u.activity ?? [],
          done: u.done ?? {},
          quizBest: u.quizBest ?? null,
          quizAttempts: u.quizAttempts ?? 0,
        },
        u.analytics as Partial<LearningAnalyticsState> | undefined,
        u.xp ?? 0,
      ),
    )
    .sort((a, b) => (b.lastActiveAt ?? 0) - (a.lastActiveAt ?? 0));

  return { ok: true, records, source: "firebase" };
}

/** Menghasilkan berkas CSV rekap kelas untuk diunduh guru. */
export function rosterToCsv(records: StudentRosterRecord[]): string {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const header = [
    "Nama",
    "Email",
    "Kelas",
    "Status",
    "Progress (%)",
    "Mastery (%)",
    "Nilai Kuis Terbaik",
    "Percobaan Kuis",
    "XP",
    "Refleksi",
    "Sertifikat",
  ];
  const rows = records.map((r) => [
    r.name,
    r.email,
    r.kelas,
    r.status === "selesai"
      ? "Selesai / Tuntas"
      : r.status === "mengerjakan"
        ? "Sedang Mengerjakan"
        : "Belum Mulai",
    r.completionPercent,
    r.summary.masteryRate ?? 0,
    r.progress.quizBest === null ? "-" : `${r.progress.quizBest}/10`,
    r.progress.quizAttempts,
    r.xp,
    r.analytics.reflections.length,
    r.certification.eligible ? `Terverifikasi (${r.certification.credentialId})` : "Belum",
  ]);
  return [header, ...rows].map((row) => row.map(esc).join(",")).join("\n");
}

/* ------------------------------------------------------------------ Catatan Pedagogis Guru */

export type TeacherNotesMap = Record<string, { note: string; updatedAt: number }>;

function notesKey(teacherUid: string) {
  return `misi-teacher-notes-${teacherUid}`;
}

export async function loadTeacherNotes(): Promise<TeacherNotesMap> {
  const session = getSession();
  if (!session || session.role !== "guru") return {};
  const local = readItem<TeacherNotesMap>(notesKey(session.uid), {});
  if (isDemoMode) return local;

  const cloud = await loadCloudProg(session.uid);
  const merged: TeacherNotesMap = { ...(cloud?.teacherNotes ?? {}), ...local };
  writeItem(notesKey(session.uid), merged);
  return merged;
}

export async function saveTeacherNote(
  studentUid: string,
  note: string,
): Promise<TeacherNotesMap> {
  const session = getSession();
  if (!session || session.role !== "guru") return {};
  const current = readItem<TeacherNotesMap>(notesKey(session.uid), {});
  const next: TeacherNotesMap = {
    ...current,
    [studentUid]: { note: note.trim(), updatedAt: Date.now() },
  };
  writeItem(notesKey(session.uid), next);
  if (!isDemoMode) {
    await saveCloudProg(session.uid, { teacherNotes: next });
  }
  return next;
}
