import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged,
  verifyPasswordResetCode,
  confirmPasswordReset,
  type Auth,
  type User as FUser,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";
import type { ActivityEntry } from "@/lib/progression";

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** True bila seluruh kredensial Firebase tersedia. */
export const isFirebaseConfigured = !!(
  cfg.apiKey &&
  cfg.authDomain &&
  cfg.projectId &&
  cfg.appId
);

/**
 * Mode demo: aplikasi berjalan tanpa Firebase (akun lokal + localStorage).
 * Diaktifkan otomatis bila kredensial Firebase belum diisi, atau dipaksa
 * dengan NEXT_PUBLIC_DEMO_MODE=1 (dipakai oleh tes E2E).
 */
export const isDemoMode =
  process.env.NEXT_PUBLIC_DEMO_MODE === "1" || !isFirebaseConfigured;

let auth: Auth | null = null;
let db: Firestore | null = null;
let app: FirebaseApp | null = null;

if (isFirebaseConfigured && !isDemoMode) {
  try {
    app = getApps().length ? getApps()[0] : initializeApp(cfg);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch {
    auth = null;
    db = null;
  }
}

export { auth, db, onAuthStateChanged };
export type { FUser };

export async function signInWithGoogle(): Promise<string | null> {
  if (!auth)
    return "Firebase belum dikonfigurasi. Isi NEXT_PUBLIC_FIREBASE_* di .env.local dulu (lihat panduan).";
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
    return null;
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "auth/popup-closed-by-user") return "Popup ditutup sebelum selesai. Coba lagi.";
    if (code === "auth/popup-closed-by-user-and-redirected")
      return "Popup ditutup sebelum selesai. Coba lagi.";
    if (code === "auth/unauthorized-domain")
      return "Domain ini belum diizinkan. Buka Firebase Console → Authentication → Settings → Authorized domains → tambahkan domain kamu.";
    if (code === "auth/operation-not-allowed")
      return "Login Google belum diaktifkan. Buka Firebase Console → Authentication → Sign-in method → aktifkan Google.";
    return "Gagal masuk dengan Google. Coba lagi.";
  }
}

export async function signOutFirebase(): Promise<void> {
  try {
    if (auth) await signOut(auth);
  } catch {
    /* abaikan — sesi lokal tetap dibersihkan oleh pemanggil */
  }
}

/** Mengubah nama tampilan di Firebase (dipakai halaman Pengaturan). */
export async function updateFirebaseName(name: string): Promise<string | null> {
  if (!auth?.currentUser) return "Sesi tidak aktif. Masuk kembali.";
  try {
    await updateProfile(auth.currentUser, { displayName: name.trim() });
    return null;
  } catch {
    return "Gagal menyimpan nama tampilan.";
  }
}

function fbErr(e: unknown): string {
  const code = (e as { code?: string })?.code;
  if (code === "auth/email-already-in-use") return "Email sudah terdaftar. Silakan masuk.";
  if (code === "auth/weak-password") return "Kata sandi terlalu lemah (minimal 6 karakter).";
  if (
    code === "auth/invalid-credential" ||
    code === "auth/user-not-found" ||
    code === "auth/wrong-password"
  )
    return "Email atau kata sandi salah.";
  if (code === "auth/invalid-email") return "Format email tidak valid.";
  if (code === "auth/too-many-requests")
    return "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.";
  if (code === "auth/operation-not-allowed")
    return "Login email belum diaktifkan. Nyalakan di Firebase Console → Authentication → Sign-in method → Email/Password.";
  if (code === "auth/network-request-failed")
    return "Jaringan bermasalah. Periksa koneksi internetmu.";
  return "Terjadi kesalahan. Coba lagi.";
}

export async function signUpWithEmail(
  name: string,
  email: string,
  pass: string,
): Promise<string | null> {
  if (!auth) return "Firebase belum dikonfigurasi. Isi .env.local dulu.";
  try {
    const c = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (name.trim()) {
      try {
        await updateProfile(c.user, { displayName: name.trim() });
      } catch {
        /* nama tampilan bukan hal kritis */
      }
    }
    return null;
  } catch (e) {
    return fbErr(e);
  }
}

export async function signInWithEmail(
  email: string,
  pass: string,
): Promise<string | null> {
  if (!auth) return "Firebase belum dikonfigurasi. Isi .env.local dulu.";
  try {
    await signInWithEmailAndPassword(auth, email.trim(), pass);
    return null;
  } catch (e) {
    return fbErr(e);
  }
}

/** Mengirim email reset asli via Firebase. */
export async function sendResetEmail(email: string): Promise<string | null> {
  if (!auth) return "Firebase belum dikonfigurasi. Isi .env.local dulu.";
  try {
    await sendPasswordResetEmail(auth, email.trim());
    return null;
  } catch (e) {
    const code = (e as { code?: string })?.code;
    if (code === "auth/user-not-found")
      return "Email tidak terdaftar. Periksa ejaan atau daftar dulu.";
    if (code === "auth/too-many-requests")
      return "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.";
    return fbErr(e);
  }
}

/** Memverifikasi kode reset (oobCode) yang dikirim lewat email. */
export async function verifyResetCode(code: string): Promise<string | null> {
  if (!auth) return "Firebase belum dikonfigurasi. Isi .env.local dulu.";
  try {
    await verifyPasswordResetCode(auth, code);
    return null;
  } catch (e) {
    const c = (e as { code?: string })?.code;
    if (c === "auth/expired-action-code")
      return "Tautan reset sudah kedaluwarsa. Minta tautan baru.";
    if (c === "auth/invalid-action-code") return "Tautan reset tidak valid.";
    return "Tautan reset tidak dapat diverifikasi.";
  }
}

/** Menyimpan kata sandi baru setelah kode reset terverifikasi. */
export async function applyNewPassword(
  code: string,
  newPassword: string,
): Promise<string | null> {
  if (!auth) return "Firebase belum dikonfigurasi. Isi .env.local dulu.";
  try {
    await confirmPasswordReset(auth, code, newPassword);
    return null;
  } catch {
    return "Gagal menyimpan kata sandi baru. Minta tautan reset baru.";
  }
}

/* ------------------------------------------------------------------ Firestore */

export interface CloudProg {
  xp: number;
  done: Record<string, boolean>;
  quizBest: number | null;
  quizAttempts?: number;
  activity?: ActivityEntry[];
  name?: string;
  email?: string;
  kelas?: string;
}

export interface SaveResult {
  ok: boolean;
  error?: string;
}

export async function loadCloudProg(uid: string): Promise<CloudProg | null> {
  if (!db) return null;
  try {
    const s = await getDoc(doc(db, "users", uid));
    return s.exists() ? (s.data() as CloudProg) : null;
  } catch {
    return null;
  }
}

export async function saveCloudProg(
  uid: string,
  data: CloudProg,
): Promise<SaveResult> {
  if (!db) return { ok: false, error: "Firestore tidak dikonfigurasi." };
  try {
    await setDoc(
      doc(db, "users", uid),
      { ...data, updatedAt: serverTimestamp() },
      { merge: true },
    );
    return { ok: true };
  } catch (e) {
    const code = (e as { code?: string })?.code;
    if (code === "permission-denied")
      return { ok: false, error: "Akses ke Firestore ditolak. Periksa firestore.rules." };
    return { ok: false, error: "Gagal menyimpan progres ke cloud." };
  }
}
