/**
 * Store Learning Analytics — menyimpan jejak belajar (digital traces) di localStorage
 * per pengguna dan ikut disinkronkan ke Firestore jika mode Firebase aktif.
 *
 * Prinsip privasi (Pert-13 Slide 26):
 *  - Pengguna bisa melihat seluruh data yang dicatat.
 *  - Pengguna bisa menonaktifkan pencatatan jejak aktivitas kapan saja.
 *  - Pengguna bisa mengekspor atau menghapus seluruh jejak belajarnya.
 */

import { getSession, subscribeSession } from "@/lib/auth-session";
import { isDemoMode, loadCloudProg, saveCloudProg } from "@/lib/firebase";
import { readItem, removeItem, writeItem } from "@/lib/storage";
import {
  createEmptyAnalytics,
  EMPTY_ANALYTICS,
  type AiTransparencyRecord,
  type LearningAnalyticsState,
  type LearningTraceEvent,
  type QuizAttemptRecord,
  type ReflectionEntry,
} from "@/lib/analytics";
import type { TopoKey } from "@/lib/data";

const MAX_TRACES = 80;
const MAX_QUIZ_HISTORY = 30;
const PUSH_DELAY = 1500;

let state: LearningAnalyticsState = EMPTY_ANALYTICS;
let currentUid: string | null = null;
let started = false;
let pushTimer: ReturnType<typeof setTimeout> | null = null;

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function storageKey(uid: string) {
  return `misi-analytics-${uid}`;
}

function normalize(raw: Partial<LearningAnalyticsState> | null): LearningAnalyticsState {
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

function persist(uid: string | null) {
  if (!uid) return;
  writeItem(storageKey(uid), state);
  if (!isDemoMode) {
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(() => {
      pushTimer = null;
      void saveCloudProg(uid, { analytics: state } as unknown as Parameters<typeof saveCloudProg>[1]);
    }, PUSH_DELAY);
  }
}

function update(mutator: (prev: LearningAnalyticsState) => LearningAnalyticsState, bypassConsent = false) {
  if (!bypassConsent && !state.trackingConsent) return;
  state = mutator(state);
  persist(currentUid);
  emit();
}

function pushTrace(
  prev: LearningAnalyticsState,
  event: Omit<LearningTraceEvent, "id" | "at">,
): LearningTraceEvent[] {
  const entry: LearningTraceEvent = {
    id: `tr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    at: Date.now(),
    ...event,
  };
  return [entry, ...prev.traces].slice(0, MAX_TRACES);
}

async function hydrate(uid: string) {
  currentUid = uid;
  const local = normalize(readItem<Partial<LearningAnalyticsState> | null>(storageKey(uid), null));

  // Catat sesi login baru bila sesi sebelumnya > 30 menit lalu atau belum pernah tercatat
  const now = Date.now();
  const shouldIncrementLogin = !local.lastLoginAt || now - local.lastLoginAt > 30 * 60_000;
  if (local.trackingConsent && shouldIncrementLogin) {
    local.loginCount += 1;
    local.lastLoginAt = now;
    local.traces = pushTrace(local, {
      category: "aktivitas",
      action: "Masuk sesi belajar",
      detail: `Sesi ke-${local.loginCount}`,
    });
    writeItem(storageKey(uid), local);
  }

  state = local;
  emit();

  if (!isDemoMode) {
    const cloud = await loadCloudProg(uid);
    if (currentUid !== uid) return;
    const cloudAnalytics = (cloud as unknown as { analytics?: Partial<LearningAnalyticsState> })
      ?.analytics;
    if (cloudAnalytics) {
      const mergedCloud = normalize(cloudAnalytics);
      // Gabungkan riwayat kuis & refleksi tanpa menimpa data lokal yang lebih lengkap
      const quizMap = new Map<string, QuizAttemptRecord>();
      for (const q of [...mergedCloud.quizHistory, ...state.quizHistory]) quizMap.set(q.id, q);
      const refMap = new Map<string, ReflectionEntry>();
      for (const r of [...mergedCloud.reflections, ...state.reflections]) refMap.set(r.id, r);
      const aiMap = new Map<string, AiTransparencyRecord>();
      for (const a of [...mergedCloud.aiSessions, ...state.aiSessions]) aiMap.set(a.id, a);
      const halSet = new Set([...mergedCloud.hallucinationSolved, ...state.hallucinationSolved]);

      state = {
        ...state,
        loginCount: Math.max(state.loginCount, mergedCloud.loginCount),
        quizHistory: Array.from(quizMap.values())
          .sort((a, b) => a.at - b.at)
          .slice(-MAX_QUIZ_HISTORY),
        reflections: Array.from(refMap.values()).sort((a, b) => b.at - a.at),
        aiSessions: Array.from(aiMap.values()).sort((a, b) => b.at - a.at),
        hallucinationSolved: Array.from(halSet),
      };
      writeItem(storageKey(uid), state);
      emit();
    }
  }
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;

  subscribeSession(() => {
    const uid = getSession()?.uid ?? null;
    if (!uid) {
      currentUid = null;
      state = EMPTY_ANALYTICS;
      emit();
      return;
    }
    if (uid !== currentUid) void hydrate(uid);
  });

  const uid = getSession()?.uid ?? null;
  if (uid) void hydrate(uid);
}

/* ========================================================================== */
/* STORE API (useSyncExternalStore)                                           */
/* ========================================================================== */

export function subscribeAnalytics(cb: () => void): () => void {
  start();
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getAnalytics(): LearningAnalyticsState {
  start();
  return state;
}

export function getServerAnalytics(): LearningAnalyticsState {
  return EMPTY_ANALYTICS;
}

/* ========================================================================== */
/* AKSI PENCATATAN JEJAK DIGITAL                                              */
/* ========================================================================== */

export function trackMateriVisit(topo: TopoKey, tab: "diagram" | "narasi" | "video") {
  update((prev) => {
    const m = prev.materi[topo];
    const isNewView = !m.lastAt || Date.now() - m.lastAt > 60_000;
    return {
      ...prev,
      materi: {
        ...prev.materi,
        [topo]: {
          ...m,
          views: m.views + (isNewView ? 1 : 0),
          diagramOpened: m.diagramOpened || tab === "diagram",
          narasiOpened: m.narasiOpened || tab === "narasi",
          videoOpened: m.videoOpened || tab === "video",
          lastAt: Date.now(),
        },
      },
      traces:
        tab === "video" && !m.videoOpened
          ? pushTrace(prev, {
              category: "aktivitas",
              action: `Membuka video ${topo.toUpperCase()}`,
              detail: "Eksplorasi visualisasi video ringkasan",
              topo,
            })
          : isNewView
            ? pushTrace(prev, {
                category: "aktivitas",
                action: `Membuka materi ${topo.toUpperCase()}`,
                detail: `Tab ${tab}`,
                topo,
              })
            : prev.traces,
    };
  });
}

export function trackMateriTime(topo: TopoKey, deltaSec: number) {
  if (deltaSec <= 0 || deltaSec > 1800) return;
  update((prev) => ({
    ...prev,
    materi: {
      ...prev.materi,
      [topo]: {
        ...prev.materi[topo],
        timeSec: prev.materi[topo].timeSec + Math.round(deltaSec),
        lastAt: Date.now(),
      },
    },
  }));
}

export function trackPracticeEvent(
  topo: TopoKey,
  event: "correct" | "reject" | "complete",
  durationSec?: number,
) {
  update((prev) => {
    const p = prev.praktik[topo];
    const nextBest =
      event === "complete" && typeof durationSec === "number" && durationSec > 0
        ? p.bestDurationSec === null
          ? Math.round(durationSec)
          : Math.min(p.bestDurationSec, Math.round(durationSec))
        : p.bestDurationSec;
    return {
      ...prev,
      praktik: {
        ...prev.praktik,
        [topo]: {
          attempts: p.attempts + (event === "complete" ? 1 : 0),
          correctConnections: p.correctConnections + (event === "correct" ? 1 : 0),
          rejectedConnections: p.rejectedConnections + (event === "reject" ? 1 : 0),
          completions: p.completions + (event === "complete" ? 1 : 0),
          bestDurationSec: nextBest,
          lastAt: Date.now(),
        },
      },
      traces:
        event === "complete"
          ? pushTrace(prev, {
              category: "aktivitas",
              action: `Praktik kabel ${topo.toUpperCase()} selesai`,
              detail:
                typeof durationSec === "number"
                  ? `Selesai dalam ${Math.round(durationSec)} detik`
                  : "Seluruh kabel tersambung sesuai aturan",
              topo,
            })
          : prev.traces,
    };
  });
}

export function trackSimulationEvent(topo: TopoKey, event: "ping_ok" | "ping_fail" | "fault_toggle") {
  update((prev) => {
    const s = prev.simulasi[topo];
    return {
      ...prev,
      simulasi: {
        ...prev.simulasi,
        [topo]: {
          pingRuns: s.pingRuns + (event === "ping_ok" || event === "ping_fail" ? 1 : 0),
          faultTests: s.faultTests + (event === "fault_toggle" ? 1 : 0),
          failedPings: s.failedPings + (event === "ping_fail" ? 1 : 0),
          lastAt: Date.now(),
        },
      },
      traces:
        event === "fault_toggle" && s.faultTests === 0
          ? pushTrace(prev, {
              category: "aktivitas",
              action: `Uji gangguan Sandbox ${topo.toUpperCase()}`,
              detail: "Mencabut kabel untuk mengamati single point of failure",
              topo,
            })
          : prev.traces,
    };
  });
}

export function recordQuizTelemetry(attempt: Omit<QuizAttemptRecord, "id" | "at">) {
  const full: QuizAttemptRecord = {
    id: `qz-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    at: Date.now(),
    ...attempt,
  };
  update((prev) => {
    const pct = Math.round((full.score / Math.max(1, full.total)) * 100);
    const label =
      full.kind === "pretest"
        ? "Pre-Test diagnostik"
        : full.kind === "adaptive"
          ? `Latihan adaptif (${full.focusConcept ?? "umum"})`
          : "Kuis akhir";
    return {
      ...prev,
      quizHistory: [...prev.quizHistory, full].slice(-MAX_QUIZ_HISTORY),
      traces: pushTrace(prev, {
        category: "assessment",
        action: `${label} selesai`,
        detail: `Skor ${full.score}/${full.total} (${pct}%) dalam ${Math.max(1, Math.round(full.durationSec))} dtk`,
      }),
    };
  });
}

export function addReflection(entry: Omit<ReflectionEntry, "id" | "at">) {
  const trimmed = entry.text.trim();
  if (!trimmed) return;
  const full: ReflectionEntry = {
    id: `ref-${Date.now().toString(36)}`,
    at: Date.now(),
    ...entry,
    text: trimmed,
  };
  update((prev) => {
    const nextMateri = { ...prev.materi };
    if (entry.topo && entry.source === "cek-pemahaman") {
      nextMateri[entry.topo] = { ...nextMateri[entry.topo], cekAnswered: true, lastAt: Date.now() };
    }
    return {
      ...prev,
      materi: nextMateri,
      reflections: [full, ...prev.reflections].slice(0, 40),
      traces: pushTrace(prev, {
        category: "interaksi",
        action: `Refleksi tercatat (${entry.context})`,
        detail: trimmed.slice(0, 90),
        topo: entry.topo,
      }),
    };
  });
}

export function recordAiTransparency(record: Omit<AiTransparencyRecord, "id" | "at">) {
  const full: AiTransparencyRecord = {
    id: `ai-${Date.now().toString(36)}`,
    at: Date.now(),
    ...record,
  };
  update((prev) => ({
    ...prev,
    aiSessions: [full, ...prev.aiSessions].slice(0, 30),
    traces: pushTrace(prev, {
      category: "ai",
      action: `Transparansi AI tercatat (${record.fn})`,
      detail: `${record.promptElementsCount}/4 unsur prompt · ${record.verifiedSteps}/5 langkah verifikasi`,
    }),
  }));
}

export function markHallucinationSolved(caseId: string) {
  update((prev) => {
    if (prev.hallucinationSolved.includes(caseId)) return prev;
    return {
      ...prev,
      hallucinationSolved: [...prev.hallucinationSolved, caseId],
      traces: pushTrace(prev, {
        category: "ai",
        action: "Latihan deteksi hallucination AI",
        detail: `Berhasil memverifikasi kasus ${caseId}`,
      }),
    };
  });
}

export function setTrackingConsent(allowed: boolean) {
  update((prev) => ({ ...prev, trackingConsent: allowed }), true);
}

export function resetAnalytics() {
  state = createEmptyAnalytics();
  if (currentUid) {
    removeItem(storageKey(currentUid));
    persist(currentUid);
  }
  emit();
}
