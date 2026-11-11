"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  ensureSeed,
  getServerSession,
  getServerSessionReady,
  getSession,
  getSessionReady,
  sessionGoogle,
  sessionSignIn,
  sessionSignOut,
  sessionSignUp,
  sessionUpdate,
  subscribeSession,
  type SessionUser,
} from "@/lib/auth-session";
import { isDemoMode } from "@/lib/firebase";
import {
  getProgress,
  getServerProgress,
  getServerSyncError,
  getServerSyncState,
  getSyncError,
  getSyncState,
  markActivity,
  recordQuizResult,
  resetProgress,
  subscribeProgress,
  type SyncState,
} from "@/lib/progress-store";
import {
  EMPTY_PROGRESS,
  totalXp,
  type ActivityEntry,
  type TopoKey,
} from "@/lib/progression";

/* ------------------------------------------------------------------ Sesi */

export interface AuthApi {
  user: SessionUser | null;
  ready: boolean;
  isDemo: boolean;
  demoEmail: string;
  demoPassword: string;
  login: (email: string, pass: string) => Promise<string | null>;
  signup: (name: string, email: string, pass: string, kelas: string) => Promise<string | null>;
  loginGoogle: () => Promise<string | null>;
  logout: () => Promise<void>;
  update: (patch: { name?: string; kelas?: string }) => Promise<string | null>;
}

export function useAuth(): AuthApi {
  const user = useSyncExternalStore(subscribeSession, getSession, getServerSession);
  const ready = useSyncExternalStore(subscribeSession, getSessionReady, getServerSessionReady);

  return {
    user,
    ready,
    isDemo: isDemoMode,
    demoEmail: DEMO_EMAIL,
    demoPassword: DEMO_PASSWORD,
    login: sessionSignIn,
    signup: sessionSignUp,
    loginGoogle: sessionGoogle,
    logout: sessionSignOut,
    update: sessionUpdate,
  };
}

/* ------------------------------------------------------------------ Progres */

export interface ProgApi {
  xp: number;
  done: Record<string, boolean>;
  activity: ActivityEntry[];
  quizBest: number | null;
  quizAttempts: number;
  markDone: (entry: { key: string; label: string; xp: number; topo?: TopoKey }) => boolean;
  recordQuiz: (score: number, total: number) => number;
  reset: () => void;
  cloudOn: boolean;
  syncState: SyncState;
  syncError: string | null;
}

export function useProg(): ProgApi {
  const progress = useSyncExternalStore(subscribeProgress, getProgress, getServerProgress);
  const syncState = useSyncExternalStore(subscribeProgress, getSyncState, getServerSyncState);
  const syncError = useSyncExternalStore(subscribeProgress, getSyncError, getServerSyncError);

  return {
    xp: totalXp(progress),
    done: progress.done,
    activity: progress.activity,
    quizBest: progress.quizBest,
    quizAttempts: progress.quizAttempts,
    markDone: markActivity,
    recordQuiz: recordQuizResult,
    reset: resetProgress,
    cloudOn: !isDemoMode,
    syncState,
    syncError,
  };
}

/* ------------------------------------------------------------------ Provider */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    ensureSeed();
  }, []);
  return <>{children}</>;
}

export function ProgProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export { EMPTY_PROGRESS };
