/**
 * Sesi pengguna & kontrol peran (RBAC: "siswa" | "guru") — satu pintu masuk
 * untuk mode demo (lokal) dan mode Firebase.
 *
 * Prinsip Access Control (Pert-13 Slide 26):
 *  - Siswa hanya melihat progres & analitik miliknya sendiri.
 *  - Guru memiliki akses khusus ke Dashboard Kelas (/guru) untuk memantau
 *    seluruh murid yang memakai, mengerjakan, dan menyelesaikan pembelajaran.
 */

import {
  auth,
  isDemoMode,
  loadCloudProg,
  onAuthStateChanged,
  saveCloudProg,
  signInWithGoogle,
  signOutFirebase,
  signUpWithEmail,
  signInWithEmail,
  updateFirebaseName,
  type UserRole,
} from "@/lib/firebase";
import { readItem, writeItem, removeItem } from "@/lib/storage";

export type { UserRole };

export interface SessionUser {
  uid: string;
  name: string;
  email: string;
  kelas: string;
  role: UserRole;
  photoURL: string | null;
  provider: "demo" | "firebase";
}

export const DEMO_EMAIL = "navigator@example.com";
export const DEMO_PASSWORD = "password123";

export const DEMO_TEACHER_EMAIL = "guru@example.com";
export const DEMO_TEACHER_PASSWORD = "guru12345";

/** Kode verifikasi pendaftaran akun Guru (dapat diganti via env NEXT_PUBLIC_TEACHER_ACCESS_CODE). */
export const TEACHER_ACCESS_CODE =
  process.env.NEXT_PUBLIC_TEACHER_ACCESS_CODE || "GURU-UNIMED-2026";

export const USERS_KEY = "misi-users";
const SESSION_KEY = "misi-session";
const DEMO_SEED_VERSION_KEY = "misi-demo-seed-v2";

export interface DemoUser {
  uid: string;
  name: string;
  email: string;
  kelas: string;
  role: UserRole;
  passHash: string;
}

/* ------------------------------------------------------------------ Hash sandi */

const SALT = "netexplorer::v2::";

function fallbackHash(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 + c, 0x85ebca6b) >>> 0;
  }
  return `fb${h1.toString(16).padStart(8, "0")}${h2.toString(16).padStart(8, "0")}`;
}

export async function hashPassword(pass: string): Promise<string> {
  const payload = SALT + pass;
  const subtle = globalThis.crypto?.subtle;
  if (subtle) {
    try {
      const buf = await subtle.digest("SHA-256", new TextEncoder().encode(payload));
      return (
        "sha256:" +
        Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
      );
    } catch {
      /* lanjut ke fallback */
    }
  }
  return fallbackHash(payload);
}

function sameHash(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* ------------------------------------------------------------------ Store sesi */

let current: SessionUser | null = null;
let ready = false;
let started = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function setSession(user: SessionUser | null) {
  current = user;
  ready = true;
  emit();
}

export function readDemoUsers(): DemoUser[] {
  const raw = readItem<DemoUser[]>(USERS_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw.map((u) => ({
    ...u,
    role: u.role === "guru" ? "guru" : "siswa",
  }));
}

function writeDemoUsers(users: DemoUser[]) {
  writeItem(USERS_KEY, users);
}

let seedPromise: Promise<void> | null = null;

/**
 * Menyiapkan akun demo bawaan (1 siswa default, 1 guru default, dan 3 murid contoh
 * agar Dashboard Guru langsung memperlihatkan pemantauan kelas nyata di mode demo).
 */
function seedDemoAccount(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const users = readDemoUsers();
      let changed = false;

      const ensureUser = async (spec: Omit<DemoUser, "passHash">, pass: string) => {
        const existing = users.find((u) => u.email.toLowerCase() === spec.email.toLowerCase());
        if (existing) {
          if (!existing.passHash) {
            existing.passHash = await hashPassword(pass);
            changed = true;
          }
          if (existing.role !== spec.role) {
            existing.role = spec.role;
            changed = true;
          }
          return;
        }
        users.push({ ...spec, passHash: await hashPassword(pass) });
        changed = true;
      };

      await ensureUser(
        {
          uid: "demo-navigator",
          name: "Siswa Navigator",
          email: DEMO_EMAIL,
          kelas: "XI",
          role: "siswa",
        },
        DEMO_PASSWORD,
      );

      await ensureUser(
        {
          uid: "demo-guru",
          name: "Ibu Reni (Guru)",
          email: DEMO_TEACHER_EMAIL,
          kelas: "Pengampu XI",
          role: "guru",
        },
        DEMO_TEACHER_PASSWORD,
      );

      // Seed 3 akun murid contoh sekali saja untuk memperkaya data kelas di Dashboard Guru
      const seededVersion = readItem<string>(DEMO_SEED_VERSION_KEY, "");
      if (seededVersion !== "2") {
        const now = Date.now();
        const day = 86_400_000;

        await ensureUser(
          {
            uid: "demo-murid-1",
            name: "Alya Putri Rahma",
            email: "alya.putri@sekolah.sch.id",
            kelas: "XI",
            role: "siswa",
          },
          DEMO_PASSWORD,
        );
        await ensureUser(
          {
            uid: "demo-murid-2",
            name: "Dimas Pratama",
            email: "dimas.pratama@sekolah.sch.id",
            kelas: "XI",
            role: "siswa",
          },
          DEMO_PASSWORD,
        );
        await ensureUser(
          {
            uid: "demo-murid-3",
            name: "Nadia Salsabila",
            email: "nadia.salsabila@sekolah.sch.id",
            kelas: "XI",
            role: "siswa",
          },
          DEMO_PASSWORD,
        );

        // Murid 1: Tuntas 100% + sertifikat siap (skor 9/10)
        if (!readItem("misi-prog-demo-murid-1", null)) {
          writeItem("misi-prog-demo-murid-1", {
            activity: [
              { key: "materi-bus", label: "Materi Topologi Bus", topo: "bus", xp: 50, at: now - 3 * day },
              { key: "praktik-bus", label: "Praktik Topologi Bus", topo: "bus", xp: 100, at: now - 3 * day + 600_000 },
              { key: "simulasi-bus", label: "Simulasi Topologi Bus", topo: "bus", xp: 50, at: now - 3 * day + 900_000 },
              { key: "materi-ring", label: "Materi Topologi Ring", topo: "ring", xp: 50, at: now - 2 * day },
              { key: "praktik-ring", label: "Praktik Topologi Ring", topo: "ring", xp: 100, at: now - 2 * day + 500_000 },
              { key: "simulasi-ring", label: "Simulasi Topologi Ring", topo: "ring", xp: 50, at: now - 2 * day + 800_000 },
              { key: "materi-star", label: "Materi Topologi Star", topo: "star", xp: 50, at: now - day },
              { key: "praktik-star", label: "Praktik Topologi Star", topo: "star", xp: 100, at: now - day + 400_000 },
              { key: "simulasi-star", label: "Simulasi Topologi Star", topo: "star", xp: 50, at: now - day + 700_000 },
              { key: "kuis-akhir", label: "Kuis akhir — nilai 9/10", xp: 90, at: now - 4 * 3600_000 },
            ],
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
            quizAttempts: 2,
          });
          writeItem("misi-analytics-demo-murid-1", {
            loginCount: 5,
            lastLoginAt: now - 3 * 3600_000,
            trackingConsent: true,
            materi: {
              bus: { views: 2, timeSec: 360, diagramOpened: true, narasiOpened: true, videoOpened: true, cekAnswered: true, lastAt: now - 3 * day },
              ring: { views: 2, timeSec: 310, diagramOpened: true, narasiOpened: true, videoOpened: true, cekAnswered: true, lastAt: now - 2 * day },
              star: { views: 2, timeSec: 340, diagramOpened: true, narasiOpened: true, videoOpened: true, cekAnswered: true, lastAt: now - day },
            },
            praktik: {
              bus: { attempts: 1, correctConnections: 4, rejectedConnections: 0, completions: 1, bestDurationSec: 68, lastAt: now - 3 * day },
              ring: { attempts: 1, correctConnections: 4, rejectedConnections: 1, completions: 1, bestDurationSec: 84, lastAt: now - 2 * day },
              star: { attempts: 1, correctConnections: 5, rejectedConnections: 0, completions: 1, bestDurationSec: 72, lastAt: now - day },
            },
            simulasi: {
              bus: { pingRuns: 3, faultTests: 2, failedPings: 1, lastAt: now - 3 * day },
              ring: { pingRuns: 4, faultTests: 2, failedPings: 1, lastAt: now - 2 * day },
              star: { pingRuns: 4, faultTests: 2, failedPings: 1, lastAt: now - day },
            },
            quizHistory: [
              { id: "a-pre", at: now - 3 * day, kind: "pretest", score: 6, total: 10, durationSec: 190, answers: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 0, 6: 1, 7: 0, 8: 0, 9: 1, 10: 0 } },
              { id: "a-post", at: now - 4 * 3600_000, kind: "posttest", score: 9, total: 10, durationSec: 175, answers: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 0, 9: 1, 10: 1 } },
            ],
            reflections: [
              {
                id: "a-ref-1",
                at: now - day,
                context: "Cek Pemahaman Topologi Star",
                topo: "star",
                text: "Star mengisolasi gangguan kabel per PC, tetapi switch pusat tetap menjadi single point of failure.",
                source: "cek-pemahaman",
              },
            ],
            aiSessions: [],
            hallucinationSolved: ["hal-1", "hal-3"],
            traces: [],
          });
        }

        // Murid 2: Sedang mengerjakan (Bus & Ring berjalan, skor kuis masih 5/10 — butuh penguatan)
        if (!readItem("misi-prog-demo-murid-2", null)) {
          writeItem("misi-prog-demo-murid-2", {
            activity: [
              { key: "materi-bus", label: "Materi Topologi Bus", topo: "bus", xp: 50, at: now - 2 * day },
              { key: "praktik-bus", label: "Praktik Topologi Bus", topo: "bus", xp: 100, at: now - 2 * day + 900_000 },
              { key: "materi-ring", label: "Materi Topologi Ring", topo: "ring", xp: 50, at: now - day },
              { key: "kuis-akhir", label: "Kuis akhir — nilai 5/10", xp: 50, at: now - 14 * 3600_000 },
            ],
            done: {
              "materi-bus": true,
              "praktik-bus": true,
              "materi-ring": true,
            },
            quizBest: 5,
            quizAttempts: 2,
          });
          writeItem("misi-analytics-demo-murid-2", {
            loginCount: 3,
            lastLoginAt: now - 14 * 3600_000,
            trackingConsent: true,
            materi: {
              bus: { views: 2, timeSec: 210, diagramOpened: true, narasiOpened: false, videoOpened: false, cekAnswered: false, lastAt: now - 2 * day },
              ring: { views: 1, timeSec: 120, diagramOpened: true, narasiOpened: false, videoOpened: false, cekAnswered: false, lastAt: now - day },
              star: { views: 0, timeSec: 0, diagramOpened: false, narasiOpened: false, videoOpened: false, cekAnswered: false, lastAt: null },
            },
            praktik: {
              bus: { attempts: 2, correctConnections: 4, rejectedConnections: 3, completions: 1, bestDurationSec: 155, lastAt: now - 2 * day },
              ring: { attempts: 0, correctConnections: 2, rejectedConnections: 4, completions: 0, bestDurationSec: null, lastAt: now - day },
              star: { attempts: 0, correctConnections: 0, rejectedConnections: 0, completions: 0, bestDurationSec: null, lastAt: null },
            },
            simulasi: {
              bus: { pingRuns: 1, faultTests: 0, failedPings: 0, lastAt: now - 2 * day },
              ring: { pingRuns: 0, faultTests: 0, failedPings: 0, lastAt: null },
              star: { pingRuns: 0, faultTests: 0, failedPings: 0, lastAt: null },
            },
            quizHistory: [
              { id: "d-post-1", at: now - day, kind: "posttest", score: 5, total: 10, durationSec: 140, answers: { 1: 1, 2: 0, 3: 1, 4: 1, 5: 0, 6: 0, 7: 1, 8: 0, 9: 0, 10: 0 } },
              { id: "d-post-2", at: now - 14 * 3600_000, kind: "posttest", score: 5, total: 10, durationSec: 132, answers: { 1: 1, 2: 0, 3: 1, 4: 1, 5: 0, 6: 0, 7: 1, 8: 0, 9: 0, 10: 0 } },
            ],
            reflections: [],
            aiSessions: [],
            hallucinationSolved: [],
            traces: [],
          });
        }

        // Murid 3: Baru mulai (login & baca materi Bus)
        if (!readItem("misi-prog-demo-murid-3", null)) {
          writeItem("misi-prog-demo-murid-3", {
            activity: [
              { key: "materi-bus", label: "Materi Topologi Bus", topo: "bus", xp: 50, at: now - 5 * 3600_000 },
            ],
            done: { "materi-bus": true },
            quizBest: null,
            quizAttempts: 0,
          });
          writeItem("misi-analytics-demo-murid-3", {
            loginCount: 1,
            lastLoginAt: now - 5 * 3600_000,
            trackingConsent: true,
            materi: {
              bus: { views: 1, timeSec: 180, diagramOpened: true, narasiOpened: true, videoOpened: false, cekAnswered: true, lastAt: now - 5 * 3600_000 },
              ring: { views: 0, timeSec: 0, diagramOpened: false, narasiOpened: false, videoOpened: false, cekAnswered: false, lastAt: null },
              star: { views: 0, timeSec: 0, diagramOpened: false, narasiOpened: false, videoOpened: false, cekAnswered: false, lastAt: null },
            },
            praktik: {
              bus: { attempts: 0, correctConnections: 0, rejectedConnections: 0, completions: 0, bestDurationSec: null, lastAt: null },
              ring: { attempts: 0, correctConnections: 0, rejectedConnections: 0, completions: 0, bestDurationSec: null, lastAt: null },
              star: { attempts: 0, correctConnections: 0, rejectedConnections: 0, completions: 0, bestDurationSec: null, lastAt: null },
            },
            simulasi: {
              bus: { pingRuns: 0, faultTests: 0, failedPings: 0, lastAt: null },
              ring: { pingRuns: 0, faultTests: 0, failedPings: 0, lastAt: null },
              star: { pingRuns: 0, faultTests: 0, failedPings: 0, lastAt: null },
            },
            quizHistory: [],
            reflections: [
              {
                id: "n-ref-1",
                at: now - 5 * 3600_000,
                context: "Cek Pemahaman Topologi Bus",
                topo: "bus",
                text: "Kalau backbone putus di tengah, PC di sisi kanan dan kiri tidak bisa saling kirim data.",
                source: "cek-pemahaman",
              },
            ],
            aiSessions: [],
            hallucinationSolved: [],
            traces: [],
          });
        }

        writeItem(DEMO_SEED_VERSION_KEY, "2");
      }

      if (changed) writeDemoUsers(users);
    })().catch(() => {
      // Mode demo tetap jalan meski storage tidak tersedia
    });
  }
  return seedPromise;
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;

  if (isDemoMode) {
    void seedDemoAccount()
      .then(() => {
        const saved = readItem<Partial<SessionUser> | null>(SESSION_KEY, null);
        if (saved && saved.email && saved.uid) {
          setSession({
            uid: saved.uid,
            name: saved.name ?? "Siswa",
            email: saved.email,
            kelas: saved.kelas ?? "XI",
            role: saved.role === "guru" ? "guru" : "siswa",
            photoURL: saved.photoURL ?? null,
            provider: "demo",
          });
        } else {
          setSession(null);
        }
      })
      .catch(() => {
        setSession(null);
      });
    return;
  }

  if (!auth) {
    setSession(null);
    return;
  }

  onAuthStateChanged(auth, (u) => {
    if (!u) {
      setSession(null);
      return;
    }
    const uid = u.uid;
    const cachedRole = readItem<UserRole>(`misi-role-${uid}`, "siswa");
    const baseSession: SessionUser = {
      uid,
      name: u.displayName ?? u.email?.split("@")[0] ?? "Siswa",
      email: u.email ?? "",
      kelas: readItem<string>(`misi-kelas-${uid}`, "XI"),
      role: cachedRole === "guru" ? "guru" : "siswa",
      photoURL: u.photoURL ?? null,
      provider: "firebase",
    };
    setSession(baseSession);

    // Sinkronkan peran & profil dari Firestore agar role selalu konsisten lintas perangkat
    void loadCloudProg(uid).then((doc) => {
      if (!doc || current?.uid !== uid) return;
      const cloudRole: UserRole = doc.role === "guru" ? "guru" : baseSession.role;
      const cloudKelas = doc.kelas || baseSession.kelas;
      if (cloudRole !== current.role || cloudKelas !== current.kelas) {
        writeItem(`misi-role-${uid}`, cloudRole);
        writeItem(`misi-kelas-${uid}`, cloudKelas);
        setSession({ ...current, role: cloudRole, kelas: cloudKelas });
      }
    });
  });
}

export function subscribeSession(cb: () => void): () => void {
  start();
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getSession(): SessionUser | null {
  start();
  return current;
}

export function getSessionReady(): boolean {
  start();
  return ready;
}

export function getServerSession(): SessionUser | null {
  return null;
}

export function getServerSessionReady(): boolean {
  return false;
}

/* ------------------------------------------------------------------ Aksi */

export async function sessionSignIn(email: string, pass: string): Promise<string | null> {
  const mail = email.trim().toLowerCase();

  if (isDemoMode) {
    await seedDemoAccount();
    const users = readDemoUsers();
    const found = users.find((u) => u.email.toLowerCase() === mail);
    if (!found) {
      return `Akun tidak ditemukan. Gunakan akun siswa (${DEMO_EMAIL}) atau guru (${DEMO_TEACHER_EMAIL}).`;
    }
    const hash = await hashPassword(pass);
    if (!sameHash(found.passHash, hash)) return "Kata sandi salah. Coba lagi.";
    const user: SessionUser = {
      uid: found.uid,
      name: found.name,
      email: found.email,
      kelas: found.kelas,
      role: found.role,
      photoURL: null,
      provider: "demo",
    };
    writeItem(SESSION_KEY, user);
    setSession(user);
    return null;
  }

  const err = await signInWithEmail(mail, pass);
  if (err) return err;
  return null;
}

/** Daftar akun baru (Siswa atau Guru dengan kode akses guru). */
export async function sessionSignUp(
  name: string,
  email: string,
  pass: string,
  kelas: string,
  role: UserRole = "siswa",
  teacherCode?: string,
): Promise<string | null> {
  const mail = email.trim().toLowerCase();

  if (!name.trim()) return "Nama lengkap wajib diisi.";
  if (!mail) return "Email wajib diisi.";
  if (pass.length < 8) return "Kata sandi minimal 8 karakter.";

  if (role === "guru") {
    const code = (teacherCode ?? "").trim();
    if (!code || code.toUpperCase() !== TEACHER_ACCESS_CODE.toUpperCase()) {
      return "Kode akses guru tidak valid. Minta kode resmi kepada pengelola mata kuliah.";
    }
  }

  if (isDemoMode) {
    await seedDemoAccount();
    const users = readDemoUsers();
    if (users.some((u) => u.email.toLowerCase() === mail))
      return "Email sudah terdaftar. Silakan masuk.";
    const user: DemoUser = {
      uid: `demo-${role}-${Date.now().toString(36)}`,
      name: name.trim(),
      email: mail,
      kelas: role === "guru" ? "Pengampu" : kelas || "XI",
      role,
      passHash: await hashPassword(pass),
    };
    users.push(user);
    writeDemoUsers(users);

    const session: SessionUser = {
      uid: user.uid,
      name: user.name,
      email: user.email,
      kelas: user.kelas,
      role: user.role,
      photoURL: null,
      provider: "demo",
    };
    writeItem(SESSION_KEY, session);
    setSession(session);
    return null;
  }

  const err = await signUpWithEmail(name, mail, pass);
  if (err) return err;

  // Simpan profil & role langsung ke Firestore
  const uid = auth?.currentUser?.uid;
  if (uid) {
    const resolvedKelas = role === "guru" ? "Pengampu" : kelas || "XI";
    writeItem(`misi-role-${uid}`, role);
    writeItem(`misi-kelas-${uid}`, resolvedKelas);
    await saveCloudProg(uid, {
      name: name.trim(),
      email: mail,
      kelas: resolvedKelas,
      role,
      xp: 0,
      done: {},
      quizBest: null,
      quizAttempts: 0,
      activity: [],
    });
    if (current?.uid === uid) {
      setSession({ ...current, role, kelas: resolvedKelas, name: name.trim() });
    }
  }
  return null;
}

export async function sessionGoogle(): Promise<string | null> {
  if (isDemoMode)
    return "Login Google hanya tersedia pada mode Firebase. Gunakan akun demo lokal.";
  return signInWithGoogle();
}

export async function sessionSignOut(): Promise<void> {
  if (isDemoMode) {
    removeItem(SESSION_KEY);
    setSession(null);
    return;
  }
  await signOutFirebase();
  setSession(null);
}

export async function sessionUpdate(patch: {
  name?: string;
  kelas?: string;
}): Promise<string | null> {
  const user = getSession();
  if (!user) return "Sesi tidak aktif. Masuk kembali.";

  if (isDemoMode) {
    const users = readDemoUsers();
    const idx = users.findIndex((u) => u.uid === user.uid);
    if (idx !== -1) {
      if (patch.name !== undefined) users[idx].name = patch.name.trim() || users[idx].name;
      if (patch.kelas !== undefined) users[idx].kelas = patch.kelas;
      writeDemoUsers(users);
    }
    const next: SessionUser = {
      ...user,
      name: patch.name?.trim() || user.name,
      kelas: patch.kelas ?? user.kelas,
    };
    writeItem(SESSION_KEY, next);
    setSession(next);
    return null;
  }

  if (patch.name !== undefined) {
    const err = await updateFirebaseName(patch.name);
    if (err) return err;
  }
  if (patch.kelas !== undefined) writeItem(`misi-kelas-${user.uid}`, patch.kelas);

  const next: SessionUser = {
    ...user,
    name: patch.name?.trim() || user.name,
    kelas: patch.kelas ?? user.kelas,
  };
  setSession(next);
  return null;
}

export function ensureSeed(): void {
  if (!isDemoMode) return;
  void seedDemoAccount();
}
