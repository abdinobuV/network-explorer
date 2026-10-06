"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  auth,
  isFirebaseConfigured,
  loadCloudProg,
  onAuthStateChanged,
  saveCloudProg,
  type FUser,
} from "@/lib/firebase";

interface User {
  name: string;
  email: string;
  kelas: string;
}
interface AuthCtx {
  user: User | null; // akun demo lokal (mock)
  fuser: FUser | null; // akun Google via Firebase
  ready: boolean;
  login: (email: string, pass: string) => string | null;
  signup: (u: User & { pass: string }) => string | null;
  logout: () => void;
  update: (u: Partial<User>) => void;
}
const Ctx = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [fuser, setFuser] = useState<FUser | null>(null);
  const [localReady, setLocalReady] = useState(false);
  const [fReady, setFReady] = useState(!isFirebaseConfigured);

  useEffect(() => {
    try {
      const s = localStorage.getItem("misi-user");
      if (s) setUser(JSON.parse(s));
      else {
        // demo account agar sesuai Figma
        const demo = { name: "Siswa Navigator", email: "navigator@example.com", kelas: "XI" };
        if (!localStorage.getItem("misi-users")) {
          localStorage.setItem(
            "misi-users",
            JSON.stringify([{ ...demo, pass: "password123" }])
          );
        }
      }
    } catch {}
    setLocalReady(true);
  }, []);

  useEffect(() => {
    if (!auth) {
      setFReady(true);
      return;
    }
    return onAuthStateChanged(auth, (u) => {
      setFuser(u);
      setFReady(true);
    });
  }, []);

  useEffect(() => {
    if (!localReady) return;
    try {
      if (user) localStorage.setItem("misi-user", JSON.stringify(user));
      else localStorage.removeItem("misi-user");
    } catch {}
  }, [user, localReady]);

  const login = (email: string, pass: string) => {
    try {
      const users = JSON.parse(localStorage.getItem("misi-users") || "[]");
      const f = users.find((x: any) => x.email === email && x.pass === pass);
      if (!f) return "Email atau kata sandi salah. Coba akun demo navigator@example.com / password123.";
      setUser({ name: f.name, email: f.email, kelas: f.kelas });
      return null;
    } catch {
      return "Gagal masuk.";
    }
  };
  const signup = (u: User & { pass: string }) => {
    if (!u.name || !u.email || !u.pass) return "Lengkapi semua field.";
    if (u.pass.length < 8) return "Kata sandi minimal 8 karakter.";
    try {
      const users = JSON.parse(localStorage.getItem("misi-users") || "[]");
      if (users.find((x: any) => x.email === u.email)) return "Email sudah terdaftar. Silakan masuk.";
      users.push(u);
      localStorage.setItem("misi-users", JSON.stringify(users));
      setUser({ name: u.name, email: u.email, kelas: u.kelas });
      return null;
    } catch {
      return "Gagal mendaftar.";
    }
  };
  const logout = () => setUser(null);
  const update = (u: Partial<User>) => setUser((p) => (p ? { ...p, ...u } : p));

  return (
    <Ctx.Provider value={{ user, fuser, ready: localReady && fReady, login, signup, logout, update }}>
      {children}
    </Ctx.Provider>
  );
}
export const useAuth = () => useContext(Ctx);

// ---- progress / XP / nilai — tersinkron ke Firestore saat login Google ----
interface ProgCtx {
  xp: number;
  addXp: (n: number) => void;
  done: Record<string, boolean>;
  markDone: (k: string, xp?: number) => void;
  quizBest: number | null;
  setQuizBest: (n: number) => void;
  cloudOn: boolean;
  syncing: boolean;
}
const PCtx = createContext<ProgCtx>({} as ProgCtx);
export function ProgProvider({ children }: { children: React.ReactNode }) {
  const { fuser } = useAuth();
  const uid = fuser?.uid ?? null;
  const [xp, setXp] = useState(2450);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [quizBest, setQuizBestState] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [cloudOn, setCloudOn] = useState(false);

  // 1) muat cache lokal
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("misi-prog") || "{}");
      if (s.xp) setXp(s.xp);
      if (s.done) setDone(s.done);
      if (typeof s.quizBest === "number") setQuizBestState(s.quizBest);
    } catch {}
  }, []);

  // 2) saat login Google: tarik data cloud, gabung (ambil yang terbesar/terlengkap)
  useEffect(() => {
    if (!uid) {
      setCloudOn(false);
      return;
    }
    setCloudOn(true);
    setSyncing(true);
    loadCloudProg(uid)
      .then((c) => {
        if (c) {
          if (typeof c.xp === "number") setXp((x) => Math.max(x, c.xp));
          if (c.done) setDone((d) => ({ ...c.done, ...d }));
          if (typeof c.quizBest === "number") {
            setQuizBestState((q) => (q === null ? c.quizBest : Math.max(q, c.quizBest as number)));
          }
        }
      })
      .finally(() => setSyncing(false));
  }, [uid]);

  // 3) simpan ke cache lokal selalu
  useEffect(() => {
    try {
      localStorage.setItem("misi-prog", JSON.stringify({ xp, done, quizBest }));
    } catch {}
  }, [xp, done, quizBest]);

  // 4) dorong ke cloud (debounce 800ms)
  useEffect(() => {
    if (!uid) return;
    setSyncing(true);
    const t = setTimeout(() => {
      saveCloudProg(uid, {
        xp,
        done,
        quizBest,
        name: fuser?.displayName ?? undefined,
        email: fuser?.email ?? undefined,
      }).finally(() => setSyncing(false));
    }, 800);
    return () => clearTimeout(t);
  }, [uid, xp, done, quizBest, fuser]);

  const addXp = (n: number) => setXp((x) => x + n);
  const markDone = (k: string, xpGain = 0) => {
    setDone((d) => ({ ...d, [k]: true }));
    if (xpGain) setXp((x) => x + xpGain);
  };
  const setQuizBest = (n: number) => setQuizBestState((p) => (p === null || n > p ? n : p));

  return (
    <PCtx.Provider value={{ xp, addXp, done, markDone, quizBest, setQuizBest, cloudOn, syncing }}>
      {children}
    </PCtx.Provider>
  );
}
export const useProg = () => useContext(PCtx);
