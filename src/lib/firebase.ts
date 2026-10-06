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

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// True jika .env.local sudah diisi. Jika false, aplikasi tetap jalan
// dalam "mode demo lokal" (login mock + localStorage).
export const isFirebaseConfigured = !!(cfg.apiKey && cfg.authDomain && cfg.projectId && cfg.appId);

let auth: Auth | null = null;
let db: Firestore | null = null;
let app: FirebaseApp | null = null;

if (isFirebaseConfigured) {
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
    if (code === "auth/unauthorized-domain")
      return "Domain ini belum diizinkan. Buka Firebase Console → Authentication → Settings → Authorized domains → tambah domain kamu.";
    if (code === "auth/operation-not-allowed")
      return "Login Google belum diaktifkan. Buka Firebase Console → Authentication → Sign-in method → aktifkan Google.";
    return "Gagal masuk dengan Google. Coba lagi.";
  }
}

export async function signOutFirebase() {
  try {
    if (auth) await signOut(auth);
  } catch {}
}

function fbErr(e: unknown): string {
  const code = (e as { code?: string })?.code;
  if (code === "auth/email-already-in-use") return "Email sudah terdaftar. Silakan masuk.";
  if (code === "auth/weak-password") return "Kata sandi terlalu lemah (minimal 6 karakter).";
  if (code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/wrong-password")
    return "Email atau kata sandi salah.";
  if (code === "auth/invalid-email") return "Format email tidak valid.";
  if (code === "auth/too-many-requests") return "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.";
  if (code === "auth/operation-not-allowed")
    return "Login email belum diaktifkan. Nyalakan di Firebase Console → Authentication → Sign-in method → Email/Password.";
  if (code === "auth/network-request-failed") return "Jaringan bermasalah. Periksa koneksi internetmu.";
  return "Terjadi kesalahan. Coba lagi.";
}

export async function signUpWithEmail(name: string, email: string, pass: string): Promise<string | null> {
  if (!auth) return "Firebase belum dikonfigurasi. Isi .env.local dulu.";
  try {
    const c = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (name.trim()) {
      try {
        await updateProfile(c.user, { displayName: name.trim() });
      } catch {}
    }
    return null;
  } catch (e) {
    return fbErr(e);
  }
}

export async function signInWithEmail(email: string, pass: string): Promise<string | null> {
  if (!auth) return "Firebase belum dikonfigurasi. Isi .env.local dulu.";
  try {
    await signInWithEmailAndPassword(auth, email.trim(), pass);
    return null;
  } catch (e) {
    return fbErr(e);
  }
}

// Mengirim email reset ASLI via Firebase (tautan di email ditangani halaman resmi Firebase).
export async function sendResetEmail(email: string): Promise<string | null> {
  if (!auth) return "Firebase belum dikonfigurasi. Isi .env.local dulu.";
  try {
    await sendPasswordResetEmail(auth, email.trim());
    return null;
  } catch (e) {
    const code = (e as { code?: string })?.code;
    if (code === "auth/user-not-found") return "Email tidak terdaftar. Periksa ejaan atau daftar dulu.";
    return fbErr(e);
  }
}

// ---- sinkron progres / nilai ke Firestore ----
export interface CloudProg {
  xp: number;
  done: Record<string, boolean>;
  quizBest: number | null;
  name?: string;
  email?: string;
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

export async function saveCloudProg(uid: string, data: CloudProg) {
  if (!db) return;
  try {
    await setDoc(doc(db, "users", uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
  } catch {}
}
