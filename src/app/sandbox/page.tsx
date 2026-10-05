"use client";
import { useEffect, useRef, useState } from "react";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { useProg } from "@/lib/store";

const NODES = [
  { id: "PC-01", ip: "192.168.1.2", x: 15, y: 25 },
  { id: "PC-05", ip: "192.168.1.6", x: 42, y: 12 },
  { id: "PC-02", ip: "192.168.1.3", x: 70, y: 25 },
  { id: "PC-03", ip: "192.168.1.4", x: 22, y: 80 },
  { id: "PC-04", ip: "192.168.1.5", x: 68, y: 80 },
];

function now() {
  return new Date().toTimeString().slice(0, 8);
}

export default function Sandbox() {
  const { markDone } = useProg();
  const [broken, setBroken] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([
    `[10:12:03] Mengirim paket data dari PC-01 ke PC-03...`,
    `[10:12:04] Data diterima oleh Switch Utama.`,
    `[10:12:05] Paket Sukses Diterima! Latensi 2ms.`,
  ]);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const active = NODES.filter((n) => n.id !== broken).length;
  const pct = Math.round((active / NODES.length) * 100);

  const send = () => {
    if (sending) return;
    setSending(true);
    setProgress(0);
    setLogs((l) => [...l, `[${now()}] Mengirim paket data dari PC-01 ke ${broken === "PC-03" ? "PC-04 (reroute, PC-03 putus)" : "PC-03"}...`]);
    const t0 = Date.now();
    timer.current = setInterval(() => {
      const p = Math.min(100, Math.round(((Date.now() - t0) / 2200) * 100));
      setProgress(p);
      if (p >= 100 && timer.current) {
        clearInterval(timer.current);
        timer.current = null;
        setSending(false);
        setLogs((l) => [
          ...l,
          `[${now()}] Data diterima oleh Switch Utama.`,
          broken
            ? `[${now()}] ${broken} terisolasi. Sisa ${active} PC tetap berkomunikasi. Latensi 3ms.`
            : `[${now()}] Paket Sukses Diterima! Latensi 2ms.`,
        ]);
        markDone("simulasi-star", 50);
      }
    }, 50);
  };

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  return (
    <RequireAuth>
    <div>
      <Navbar />
      <main className="mx-auto grid max-w-7xl gap-0 md:grid-cols-[1fr_320px]">
        <section className="px-4 py-6">
          <h1 className="text-2xl font-extrabold">Mode Simulasi Aktif</h1>
          <p className="text-sm text-slate-400">Tekan “Kirim Data” untuk menguji aliran paket data pada arsitektur Star.</p>
          <div className="card relative mt-4 h-[480px] overflow-hidden p-4">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              {NODES.map((n) => (
                <line
                  key={n.id}
                  x1={50} y1={50} x2={n.x} y2={n.y}
                  stroke={broken === n.id ? "#ff2d55" : "#00e676"}
                  strokeWidth={broken === n.id ? 0.4 : 0.7}
                  strokeDasharray={broken === n.id ? "2 1.5" : "0"}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {sending && (
                <>
                  <circle r="4" fill="#00e676">
                    <animateMotion dur="2.2s" repeatCount="1" path="M 15 25 L 50 50 L 22 80" />
                  </circle>
                  <circle r="3" fill="#22d3ee">
                    <animateMotion dur="2.2s" repeatCount="1" path="M 50 50 L 22 80" />
                  </circle>
                </>
              )}
            </svg>
            {NODES.map((n) => (
              <div key={n.id} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${n.x}%`, top: `${n.y}%` }}>
                <div className={`text-3xl ${broken === n.id ? "opacity-40 grayscale" : ""}`}>🖥️</div>
                <div className={`text-[11px] ${broken === n.id ? "text-[#ff8080] line-through" : "text-[#00e676]"}`}>{n.id} ({n.ip})</div>
              </div>
            ))}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-[#00e676] bg-[#0a1428] text-center text-[10px] font-bold text-[#00e676]">
                🔀<br />SWITCH
              </div>
            </div>
            {sending && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="h-2 overflow-hidden rounded bg-white/10"><div className="h-full bg-[#00e676]" style={{ width: `${progress}%` }} /></div>
                <div className="mt-1 text-xs text-slate-300">Mengirim paket... {progress}%</div>
              </div>
            )}
          </div>
        </section>
        <aside className="border-l border-white/10 bg-[#13294b] p-5">
          <h3 className="font-extrabold">Kontrol Simulasi</h3>
          <button onClick={send} disabled={sending} className="btn-neon mt-3 w-full py-3 text-sm disabled:opacity-60">
            ✈ {sending ? "Mengirim..." : "Kirim Data (Ping Test)"}
          </button>
          <button
            onClick={() => {
              setBroken((b) => (b ? null : "PC-03"));
              setLogs((l) => [...l, `[${now()}] ${broken ? "Kabel PC-03 disambung kembali." : "Kabel PC-03 DIPUTUS (simulasi gangguan)."} `]);
            }}
            className="mt-2 w-full rounded-lg border border-[#ff2d55] bg-[#ff2d55]/10 py-2.5 text-sm font-bold text-[#ff2d55]"
          >
            ✂ {broken ? "Sambungkan Kembali PC-03" : "Putuskan Kabel PC-03"}
          </button>
          <div className="card mt-4 p-4">
            <div className="text-xs text-slate-400">KESEHATAN KONEKSI</div>
            <div className={`mt-1 text-sm font-bold ${broken ? "text-[#ffb020]" : "text-[#00e676]"}`}>
              ● {broken ? `Degraded (${pct}% Active) — ${broken} terisolasi` : "Koneksi Stabil (100% Active)"}
            </div>
            <p className="mt-1 text-xs text-slate-400">Topologi Star membatasi domain tabrakan data (collision domain). Transfer sukses.</p>
          </div>
          <div className="mt-4">
            <div className="text-xs text-slate-400">EVENT LOGS</div>
            <div className="mt-1 h-44 space-y-1 overflow-y-auto rounded-lg bg-black/40 p-3 text-[11px] text-slate-300">
              {logs.map((l, i) => (
                <div key={i} className={l.includes("Sukses") || l.includes("tetap berkomunikasi") ? "text-[#00e676]" : ""}>{l}</div>
              ))}
            </div>
            <button onClick={() => setLogs([])} className="mt-2 text-xs text-slate-400 hover:underline">Bersihkan log</button>
          </div>
        </aside>
      </main>
      <Footer help />
    </div>
    </RequireAuth>
  );
}
