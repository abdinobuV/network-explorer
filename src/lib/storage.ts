/**
 * Penyimpanan lokal (localStorage) yang aman untuk SSR.
 *
 * Kenapa tidak `useState` + `useEffect`?
 *  - Membaca localStorage saat render akan bentrok dengan SSR (hydration mismatch).
 *  - `setState` di dalam effect memicu render bertingkat (react-hooks/set-state-in-effect).
 *
 * Solusinya: `useSyncExternalStore` dengan cache in-memory. Snapshot selalu
 * referensinya sama antar render sehingga aman, dan perubahan dari luar
 * (tab lain) tetap terpantau lewat event `storage`.
 */

type Listener = () => void;

const cache = new Map<string, unknown>();
const listeners = new Map<string, Set<Listener>>();

function parse<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback;
  try {
    const parsed = JSON.parse(raw) as T;
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch {
    return fallback;
  }
}

/** Membaca nilai dari cache; hanya menyentuh localStorage saat pertama dipanggil. */
export function readItem<T>(key: string, fallback: T): T {
  if (cache.has(key)) return cache.get(key) as T;
  if (typeof window === "undefined") return fallback;
  const value = parse<T>(window.localStorage.getItem(key), fallback);
  cache.set(key, value);
  return value;
}

/** Menulis nilai: localStorage + cache + memberitahu pendengar. */
export function writeItem<T>(key: string, value: T): void {
  cache.set(key, value);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Kuota penuh atau mode privat — aplikasi tetap jalan dengan state di memori.
    }
  }
  listeners.get(key)?.forEach((l) => l());
}

/** Menghapus nilai. */
export function removeItem(key: string): void {
  cache.delete(key);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* abaikan */
    }
  }
  listeners.get(key)?.forEach((l) => l());
}

/** Berlangganan perubahan pada satu kunci. */
export function subscribeItem(key: string, cb: Listener): () => void {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(cb);

  if (typeof window !== "undefined" && set.size === 1) {
    window.addEventListener("storage", onStorage);
  }

  return () => {
    set!.delete(cb);
    if (set!.size === 0) {
      listeners.delete(key);
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", onStorage);
      }
    }
  };
}

function onStorage(event: StorageEvent): void {
  if (!event.key) return;
  if (cache.has(event.key)) {
    const fallback = cache.get(event.key);
    cache.set(event.key, parse(event.newValue, fallback as never));
  }
  listeners.get(event.key)?.forEach((l) => l());
}

/** Mengosongkan seluruh cache in-memory (dipakai tes). */
export function resetStorageCache(): void {
  cache.clear();
}
