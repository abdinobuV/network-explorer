/**
 * Preferensi tampilan sederhana, disimpan per peramban.
 * Dipakai untuk hal yang tidak perlu ikut ke cloud (mis. tampilkan jalur pemasangan).
 */

const KEY = "misi-pref";

export type PrefName = "showPaths";

type Prefs = Partial<Record<PrefName, boolean>>;

const listeners = new Set<() => void>();

function read(): Prefs {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Prefs) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/** Berlangganan perubahan preferensi (untuk useSyncExternalStore). */
export function subscribePrefs(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getPref(name: PrefName, fallback = false): boolean {
  const value = read()[name];
  return typeof value === "boolean" ? value : fallback;
}

export function setPref(name: PrefName, value: boolean): void {
  const next = { ...read(), [name]: value };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* abaikan */
  }
  listeners.forEach((l) => l());
}
