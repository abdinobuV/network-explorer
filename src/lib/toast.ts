/**
 * Toast ringan: antrean pesan singkat di pojok kanan bawah.
 * Menggunakan store modul (bukan context) agar bisa dipanggil dari mana saja.
 */

export type ToastTone = "default" | "ok" | "error";

export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

let items: ToastItem[] = [];
let counter = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeToast(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getToasts(): ToastItem[] {
  return items;
}

export function getServerToasts(): ToastItem[] {
  return EMPTY;
}

const EMPTY: ToastItem[] = [];

/** Menampilkan notifikasi sebentar (3,5 detik). */
export function toast(message: string, tone: ToastTone = "default"): void {
  counter += 1;
  const id = counter;
  items = [...items, { id, message, tone }].slice(-4);
  emit();
  if (typeof window !== "undefined") {
    window.setTimeout(() => dismissToast(id), 3500);
  }
}

export function dismissToast(id: number): void {
  items = items.filter((t) => t.id !== id);
  emit();
}
