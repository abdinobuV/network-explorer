"use client";
import type { TopoKey } from "@/lib/data";

// Diagram SVG mini + penuh untuk Bus / Ring / Star, sesuai Figma
export function TopoMini({ kind }: { kind: TopoKey }) {
  const stroke = "#00e676";
  const node = "#22d3ee";
  if (kind === "bus")
    return (
      <svg viewBox="0 0 300 90" className="h-20 w-full">
        <line x1="20" y1="65" x2="280" y2="65" stroke={stroke} strokeWidth="3" />
        {[60, 150, 240].map((x) => (
          <g key={x}>
            <line x1={x} y1="65" x2={x} y2="30" stroke={stroke} strokeWidth="2" />
            <rect x={x - 16} y={12} width={32} height={18} rx={4} fill="none" stroke={node} strokeWidth="2" />
          </g>
        ))}
        <line x1="20" y1="57" x2="20" y2="73" stroke="#f59e0b" strokeWidth="6" />
        <line x1="280" y1="57" x2="280" y2="73" stroke="#f59e0b" strokeWidth="6" />
      </svg>
    );
  if (kind === "ring")
    return (
      <svg viewBox="0 0 200 120" className="mx-auto h-24">
        <circle cx="100" cy="60" r="40" fill="none" stroke={stroke} strokeWidth="3" />
        {[
          [100, 14],
          [144, 60],
          [100, 106],
          [56, 60],
        ].map(([x, y], i) => (
          <g key={i}>
            <rect x={x - 12} y={y - 8} width={24} height={16} rx={4} fill="#0a1428" stroke={node} strokeWidth="2" />
          </g>
        ))}
        <circle cx="132" cy="32" r="5" fill={stroke} />
        <circle cx="140" cy="88" r="5" fill={stroke} />
        <circle cx="100" cy="106" r="5" fill={stroke} />
      </svg>
    );
  return (
    <svg viewBox="0 0 300 120" className="h-24 w-full">
      <rect x="133" y="48" width="34" height="24" rx="6" fill="none" stroke={stroke} strokeWidth="2" />
      <text x="150" y="63" textAnchor="middle" fontSize="9" fill={stroke}>Switch</text>
      {[
        [40, 20],
        [260, 20],
        [40, 100],
        [260, 100],
      ].map(([x, y], i) => (
        <g key={i}>
          <line x1={150} y1={60} x2={x} y2={y} stroke={stroke} strokeWidth="2" />
          <rect x={x - 14} y={y - 9} width={28} height={18} rx={4} fill="none" stroke={node} strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
}

export function TopoDiagram({ kind, animate = true }: { kind: TopoKey; animate?: boolean }) {
  const flow = animate ? "packet-flow" : "";
  if (kind === "bus")
    return (
      <div className="card p-4">
        <div className="mb-2 text-xs text-slate-400">Diagram Aliran Data • Bus</div>
        <svg viewBox="0 0 600 220" className="w-full">
          <line x1="30" y1="130" x2="570" y2="130" stroke="#00c2e0" strokeWidth="5" className={flow} />
          <text x="300" y="110" textAnchor="middle" fontSize="11" fill="#94a3b8">Backbone (kabel utama)</text>
          {[110, 250, 390].map((x, i) => (
            <g key={x}>
              <line x1={x} y1="130" x2={x} y2={70} stroke="#00c2e0" strokeWidth="3" />
              <rect x={x - 35} y={38} width={70} height={30} rx={8} fill="#0a1428" stroke="#22d3ee" strokeWidth="2" />
              <text x={x} y={58} textAnchor="middle" fontSize="12" fill="#e2e8f0">PC-0{i + 1}</text>
              {i < 2 && <circle cx={x + 70} cy={130} r={6} fill="#00e676" />}
            </g>
          ))}
          {[180, 320].map((x, i) => (
            <g key={x}>
              <line x1={x} y1="130" x2={x} y2={175} stroke="#00c2e0" strokeWidth="3" />
              <rect x={x - 35} y={175} width={70} height={30} rx={8} fill="#0a1428" stroke="#22d3ee" strokeWidth="2" />
              <text x={x} y={195} textAnchor="middle" fontSize="12" fill="#e2e8f0">PC-0{i + 4}</text>
            </g>
          ))}
          <rect x="22" y="115" width="12" height="30" rx="2" fill="#f59e0b" />
          <rect x="566" y="115" width="12" height="30" rx="2" fill="#f59e0b" />
          <text x="28" y="160" fontSize="10" fill="#94a3b8">Terminator</text>
          <text x="572" y="160" textAnchor="end" fontSize="10" fill="#94a3b8">Terminator</text>
        </svg>
        <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
          <span className="h-2.5 w-2.5 rounded-full bg-[#00e676]" /> Paket data
        </div>
      </div>
    );
  if (kind === "ring")
    return (
      <div className="card p-4">
        <div className="mb-2 text-xs text-slate-400">Diagram Aliran Data • Ring</div>
        <svg viewBox="0 0 500 260" className="mx-auto w-full max-w-md">
          <circle cx="250" cy="130" r="85" fill="none" stroke="#00c2e0" strokeWidth="4" className={flow} />
          <text x="250" y="125" textAnchor="middle" fontSize="12" fill="#94a3b8">Searah</text>
          <text x="250" y="140" textAnchor="middle" fontSize="12" fill="#94a3b8">jarum jam</text>
          {[
            [250, 30, "PC-01"],
            [348, 110, "PC-02"],
            [310, 215, "PC-03"],
            [190, 215, "PC-04"],
            [152, 110, "PC-05"],
          ].map(([x, y, l]) => (
            <g key={l as string}>
              <rect x={(x as number) - 32} y={(y as number) - 15} width={64} height={30} rx={8} fill="#0a1428" stroke="#22d3ee" strokeWidth="2" />
              <text x={x as number} y={(y as number) + 5} textAnchor="middle" fontSize="12" fill="#e2e8f0">{l as string}</text>
            </g>
          ))}
          <circle cx="322" cy="62" r="6" fill="#00e676" />
          <circle cx="345" cy="165" r="6" fill="#00e676" />
          <circle cx="250" cy="215" r="6" fill="#00e676" />
        </svg>
        <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
          <span className="h-2.5 w-2.5 rounded-full bg-[#00e676]" /> Paket data
        </div>
      </div>
    );
  return (
    <div className="card p-4">
      <div className="mb-2 text-xs text-slate-400">Diagram Aliran Data • Star</div>
      <svg viewBox="0 0 560 260" className="w-full">
        <rect x="245" y="105" width="70" height="50" rx="10" fill="#0a1428" stroke="#00e676" strokeWidth="3" />
        <text x="280" y="133" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#00e676">SWITCH</text>
        {[
          [280, 20, "PC-01", "top"],
          [460, 90, "PC-02", "right"],
          [400, 220, "PC-03", "bottom"],
          [160, 220, "PC-04", "bottom"],
          [100, 90, "PC-05", "left"],
        ].map(([x, y, l, pos]) => (
          <g key={l as string}>
            <line x1={280} y1={130} x2={x as number} y2={y as number} stroke="#00c2e0" strokeWidth="3" className={flow} />
            <rect
              x={(x as number) - 32}
              y={pos === "top" ? (y as number) - 10 : pos === "bottom" ? (y as number) - 20 : (y as number) - 15}
              width={64}
              height={30}
              rx={8}
              fill="#0a1428"
              stroke="#22d3ee"
              strokeWidth="2"
            />
            <text x={x as number} y={(y as number) + (pos === "top" ? 11 : pos === "bottom" ? 0 : 5)} textAnchor="middle" fontSize="11" fill="#e2e8f0">{l as string}</text>
          </g>
        ))}
        <circle cx="370" cy="110" r="6" fill="#00e676" />
        <circle cx="220" cy="170" r="6" fill="#00e676" />
      </svg>
      <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
        <span className="h-2.5 w-2.5 rounded-full bg-[#00e676]" /> Paket data
      </div>
    </div>
  );
}
