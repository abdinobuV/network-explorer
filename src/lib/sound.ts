/**
 * Efek suara sintetis (Web Audio API) — tanpa berkas audio.
 *
 * Semua bunyi dibuat dari osilator sehingga repo tetap ringan dan tidak ada
 * aset yang perlu dilisensikan. Suara default **mati**; siswa bisa menyalakan
 * lewat tombol di navigasi. Pilihan tersimpan di localStorage.
 */

const KEY = "misi-suara";

export type Sfx = "click" | "chime" | "buzz" | "detach" | "reject";

let ctx: AudioContext | null = null;
let enabled = false;
let loaded = false;
const listeners = new Set<() => void>();

function readEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  enabled = readEnabled();
}

export function isSoundEnabled(): boolean {
  ensureLoaded();
  return enabled;
}

export function subscribeSound(cb: () => void): () => void {
  ensureLoaded();
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Nilai saat server merender — suara selalu mati sampai diaktifkan pengguna. */
export function getServerSoundEnabled(): boolean {
  return false;
}

export function setSoundEnabled(value: boolean): void {
  ensureLoaded();
  enabled = value;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, value ? "1" : "0");
    } catch {
      /* abaikan */
    }
  }
  if (value) {
    // Unlock AudioContext pada interaksi pertama pengguna.
    void getContext()?.resume();
  }
  listeners.forEach((l) => l());
}

/** Dipertahankan untuk kompatibilitas pemanggilan lama. */
export function initSound(): void {
  ensureLoaded();
}

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  return ctx;
}

function tone(
  ac: AudioContext,
  type: OscillatorType,
  freq: number,
  start: number,
  dur: number,
  gain: number,
  endFreq?: number,
) {
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, start + dur);
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.008);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(amp).connect(ac.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

function noise(ac: AudioContext, start: number, dur: number, gain: number) {
  const frames = Math.floor(ac.sampleRate * dur);
  const buffer = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  }
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 2400;
  filter.Q.value = 1.2;
  const amp = ac.createGain();
  amp.gain.value = gain;
  src.connect(filter).connect(amp).connect(ac.destination);
  src.start(start);
}

/** Memutar bunyi. Tidak melakukan apa-apa bila suara dimatikan. */
export function sfx(kind: Sfx): void {
  if (!enabled) return;
  const ac = getContext();
  if (!ac) return;
  if (ac.state === "suspended") void ac.resume();

  const t = ac.currentTime;

  switch (kind) {
    case "click":
      noise(ac, t, 0.05, 0.14);
      tone(ac, "sine", 220, t, 0.09, 0.12, 140);
      break;
    case "chime":
      tone(ac, "sine", 784, t, 0.42, 0.1);
      tone(ac, "sine", 1046.5, t + 0.11, 0.5, 0.09);
      break;
    case "buzz":
    case "reject":
      tone(ac, "square", 132, t, 0.16, 0.08, 96);
      noise(ac, t, 0.1, 0.06);
      break;
    case "detach":
      tone(ac, "sine", 620, t, 0.16, 0.09, 240);
      break;
  }
}
