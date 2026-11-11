/**
 * Sesi pengguna — satu pintu masuk untuk mode demo (lokal) dan mode Firebase.
 *
 * Aplikasi ini sengaja punya dua mode:
 *  - DEMO  : tanpa konfigurasi Firebase. Akun disimpan di localStorage,
 *            kata sandi disimpan sebagai hash (bukan teks polos).
 *  - FIREBASE: akun sungguhan, progres disinkronkan ke Firestore.
 *
 * Mode dipilih otomatis: bila NEXT_PUBLIC_DEMO_MODE=1 atau kredensial
 * Firebase belum diisi, aplikasi memakai mode demo.
 */

import {
  auth,
  isDemoMode,
  onAuthStateChanged,
  signInWithGoogle,
  signOutFirebase,
  signUpWithEmail,
  signInWithEmail,
  updateFirebaseName,
} from "@/lib/firebase";
import { readItem, writeItem, removeItem } from "@/lib/storage";

export interface SessionUser {
  uid: string;
  name: string;
  email: string;
  kelas: string;
  photoURL: string | null;
  provider: "demo" | "firebase";
}

export const DEMO_EMAIL = "navigator@example.com";
export const DEMO_PASSWORD = "password123";

const USERS_KEY = "misi-users";
const SESSION_KEY = "misi-session";

interface DemoUser {
  uid: string;
  name: string;
  email: string;
  kelas: string;
  passHash: string;
}

/* ------------------------------------------------------------------ Hash sandi */

const SALT = "netexplorer::v2::";

function fallbackHash(input: string): string {
  // Non-kriptografis, hanya dipakai bila crypto.subtle tidak tersedia
  // (mis. halaman dibuka lewat http:// pada IP LAN).
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

function readDemoUsers(): DemoUser[] {
  const raw = readItem<DemoUser[]>(USERS_KEY, []);
  return Array.isArray(raw) ? raw : [];
}

function writeDemoUsers(users: DemoUser[]) {
  writeItem(USERS_KEY, users);
}

let seedPromise: Promise<void> | null = null;

/**
 * Menyiapkan akun demo bawaan. Dijalankan sekali saja (single-flight) supaya
 * tidak ada akun ganda ketika store dipanggil dari beberapa tempat.
 */
function seedDemoAccount(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const users = readDemoUsers();
      const demo = users.find((u) => u.email === DEMO_EMAIL);
      if (demo) {
        if (!demo.passHash) {
          demo.passHash = await hashPassword(DEMO_PASSWORD);
          writeDemoUsers(users);
        }
        return;
      }
      users.push({
        uid: "demo-navigator",
        name: "Siswa Navigator",
        email: DEMO_EMAIL,
        kelas: "XI",
        passHash: await hashPassword(DEMO_PASSWORD),
      });
      writeDemoUsers(users);
    })().catch(() => {
      // Bila penyimpanan browser tidak tersedia, mode demo tetap jalan tanpa akun demo.
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
        const saved = readItem<SessionUser | null>(SESSION_KEY, null);
        setSession(saved && saved.email ? saved : null);
      })
      .catch(() => {
        // Mode demo tetap harus bisa dipakai walau penyimpanan browser bermasalah.
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
    setSession({
      uid,
      name: u.displayName ?? u.email?.split("@")[0] ?? "Siswa",
      email: u.email ?? "",
      kelas: readItem<string>(`misi-kelas-${uid}`, "XI"),
      photoURL: u.photoURL ?? null,
      provider: "firebase",
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

/** Nilai saat server merender — selalu "belum ada sesi". */
export function getServerSession(): SessionUser | null {
  return null;
}

export function getServerSessionReady(): boolean {
  return false;
}

/* ------------------------------------------------------------------ Aksi */

/** Masuk. Mengembalikan pesan error, atau null bila berhasil. */
export async function sessionSignIn(email: string, pass: string): Promise<string | null> {
  const mail = email.trim().toLowerCase();

  if (isDemoMode) {
    await seedDemoAccount();
    const users = readDemoUsers();
    const found = users.find((u) => u.email.toLowerCase() === mail);
    if (!found) {
      return `Akun tidak ditemukan. Gunakan akun demo ${DEMO_EMAIL} / ${DEMO_PASSWORD}.`;
    }
    const hash = await hashPassword(pass);
    if (!sameHash(found.passHash, hash)) return "Kata sandi salah. Coba lagi.";
    const user: SessionUser = {
      uid: found.uid,
      name: found.name,
      email: found.email,
      kelas: found.kelas,
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

/** Daftar akun baru. */
export async function sessionSignUp(
  name: string,
  email: string,
  pass: string,
  kelas: string,
): Promise<string | null> {
  const mail = email.trim().toLowerCase();

  if (!name.trim()) return "Nama lengkap wajib diisi.";
  if (!mail) return "Email wajib diisi.";
  if (pass.length < 8) return "Kata sandi minimal 8 karakter.";

  if (isDemoMode) {
    await seedDemoAccount();
    const users = readDemoUsers();
    if (users.some((u) => u.email.toLowerCase() === mail))
      return "Email sudah terdaftar. Silakan masuk.";
    const user: DemoUser = {
      uid: `demo-${Date.now().toString(36)}`,
      name: name.trim(),
      email: mail,
      kelas: kelas || "XI",
      passHash: await hashPassword(pass),
    };
    users.push(user);
    writeDemoUsers(users);

    const session: SessionUser = {
      uid: user.uid,
      name: user.name,
      email: user.email,
      kelas: user.kelas,
      photoURL: null,
      provider: "demo",
    };
    writeItem(SESSION_KEY, session);
    setSession(session);
    return null;
  }

  return signUpWithEmail(name, mail, pass);
}

/** Masuk dengan akun Google (hanya mode Firebase). */
export async function sessionGoogle(): Promise<string | null> {
  if (isDemoMode)
    return "Login Google hanya tersedia pada mode Firebase. Gunakan akun demo lokal.";
  return signInWithGoogle();
}

/** Keluar dari sesi. */
export async function sessionSignOut(): Promise<void> {
  if (isDemoMode) {
    removeItem(SESSION_KEY);
    setSession(null);
    return;
  }
  await signOutFirebase();
  setSession(null);
}

/** Memperbarui nama & kelas. */
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

/** Memastikan akun demo tersedia (dipanggil sekali saat app start). */
export function ensureSeed(): void {
  if (!isDemoMode) return;
  void seedDemoAccount();
}
