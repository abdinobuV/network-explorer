"use client";

import { cx } from "@/components/ui";

/**
 * Komponen visualisasi SVG ringan untuk Learning Analytics (Pert-13 Slide 19–21).
 * Tanpa library eksternal berat; konsisten dengan token warna Network Lab & ramah aksesibilitas.
 */

/* ------------------------------------------------------------------ Line Chart */

export function ScoreLineChart({
  points,
  title = "Perubahan skor dari waktu ke waktu",
}: {
  points: Array<{ label: string; value: number }>;
  title?: string;
}) {
  if (points.length === 0) {
    return (
      <div className="grid h-48 place-items-center rounded-md border border-dashed border-border-2 bg-canvas/50 p-4 text-center">
        <p className="max-w-xs text-caption text-ink-3">
          Belum ada riwayat kuis. Kerjakan Pre-Test atau Kuis Akhir untuk melihat grafik tren nilai.
        </p>
      </div>
    );
  }

  const W = 520;
  const H = 200;
  const padL = 38;
  const padR = 20;
  const padT = 18;
  const padB = 34;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const coords = points.map((pt, i) => {
    const x =
      points.length === 1 ? padL + innerW / 2 : padL + (i / (points.length - 1)) * innerW;
    const clamped = Math.max(0, Math.min(100, pt.value));
    const y = padT + innerH - (clamped / 100) * innerH;
    return { ...pt, x, y, clamped };
  });

  const polyline = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const areaPath =
    coords.length > 1
      ? `M ${coords[0].x} ${padT + innerH} L ${coords.map((c) => `${c.x} ${c.y}`).join(" L ")} L ${coords[coords.length - 1].x} ${padT + innerH} Z`
      : "";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`${title}: ${points.map((p) => `${p.label} ${p.value}%`).join(", ")}`}
    >
      {/* Garis bantu horizontal & batas tuntas 80% */}
      {[0, 25, 50, 75, 100].map((v) => {
        const y = padT + innerH - (v / 100) * innerH;
        return (
          <g key={v}>
            <line
              x1={padL}
              y1={y}
              x2={W - padR}
              y2={y}
              stroke="var(--color-border-3)"
              strokeWidth={1}
            />
            <text
              x={padL - 8}
              y={y + 4}
              textAnchor="end"
              fontSize={10}
              fontFamily="var(--font-plex-mono)"
              fill="var(--color-ink-4)"
            >
              {v}
            </text>
          </g>
        );
      })}

      {/* Garis target ketuntasan 80% */}
      {(() => {
        const y80 = padT + innerH - 0.8 * innerH;
        return (
          <g>
            <line
              x1={padL}
              y1={y80}
              x2={W - padR}
              y2={y80}
              stroke="var(--color-ok)"
              strokeOpacity={0.45}
              strokeWidth={1.2}
              strokeDasharray="4 4"
            />
            <text
              x={W - padR}
              y={y80 - 4}
              textAnchor="end"
              fontSize={9}
              fontFamily="var(--font-plex-mono)"
              fill="var(--color-ok)"
            >
              Target 80%
            </text>
          </g>
        );
      })()}

      {areaPath && <path d={areaPath} fill="var(--color-signal)" fillOpacity={0.12} />}

      {coords.length > 1 && (
        <polyline
          fill="none"
          stroke="var(--color-signal-bright)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={polyline}
        />
      )}

      {coords.map((c, idx) => (
        <g key={`${c.label}-${idx}`}>
          <circle
            cx={c.x}
            cy={c.y}
            r={4.5}
            fill={c.clamped >= 80 ? "var(--color-ok)" : c.clamped >= 60 ? "var(--color-signal-bright)" : "var(--color-caution)"}
            stroke="var(--color-canvas)"
            strokeWidth={2}
          />
          <text
            x={c.x}
            y={c.y - 9}
            textAnchor="middle"
            fontSize={10}
            fontFamily="var(--font-plex-mono)"
            fill="var(--color-ink)"
          >
            {c.clamped}%
          </text>
          <text
            x={c.x}
            y={H - 10}
            textAnchor="middle"
            fontSize={10}
            fontFamily="var(--font-plex-sans)"
            fill="var(--color-ink-3)"
          >
            {c.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ Bar Chart */

export function AccuracyBarChart({
  items,
  emptyText = "Belum ada data akurasi untuk dibandingkan.",
}: {
  items: Array<{ label: string; value: number | null; meta?: string }>;
  emptyText?: string;
}) {
  const hasAny = items.some((i) => i.value !== null);
  if (!hasAny) {
    return (
      <div className="grid h-44 place-items-center rounded-md border border-dashed border-border-2 bg-canvas/50 p-4 text-center">
        <p className="max-w-xs text-caption text-ink-3">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" role="list" aria-label="Grafik batang perbandingan akurasi">
      {items.map((item) => {
        const val = item.value;
        const barTone =
          val === null
            ? "bg-surface-3"
            : val >= 80
              ? "bg-ok"
              : val >= 60
                ? "bg-caution"
                : "bg-fault";
        const textTone =
          val === null
            ? "text-ink-4"
            : val >= 80
              ? "text-ok"
              : val >= 60
                ? "text-caution"
                : "text-fault";

        return (
          <div key={item.label} role="listitem" className="space-y-1">
            <div className="flex items-baseline justify-between gap-2 text-caption">
              <span className="truncate font-medium text-ink">{item.label}</span>
              <span className="flex shrink-0 items-center gap-2 font-mono text-micro">
                {item.meta && <span className="text-ink-4">{item.meta}</span>}
                <span className={textTone}>{val === null ? "—" : `${val}%`}</span>
              </span>
            </div>
            <div
              className="h-2.5 w-full overflow-hidden rounded-xs border border-border-3 bg-canvas"
              role="progressbar"
              aria-valuenow={val ?? 0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={item.label}
            >
              <div
                className={cx("h-full transition-all", barTone)}
                style={{ width: `${val ?? 0}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ Donut Chart */

export function DonutMetricChart({
  value,
  label,
  sublabel,
  tone = "signal",
}: {
  value: number;
  label: string;
  sublabel: string;
  tone?: "signal" | "ok" | "caution" | "fault";
}) {
  const safe = Math.max(0, Math.min(100, Math.round(value)));
  const r = 38;
  const c = 2 * Math.PI * r;
  const dashOffset = c - (safe / 100) * c;

  const strokeColor =
    tone === "ok"
      ? "var(--color-ok)"
      : tone === "caution"
        ? "var(--color-caution)"
        : tone === "fault"
          ? "var(--color-fault)"
          : "var(--color-signal-bright)";

  return (
    <div className="flex items-center gap-4">
      <svg
        width="96"
        height="96"
        viewBox="0 0 96 96"
        className="shrink-0"
        role="img"
        aria-label={`${label}: ${safe}%`}
      >
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="var(--color-surface-3)"
          strokeWidth="9"
        />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 48 48)"
        />
        <text
          x="48"
          y="53"
          textAnchor="middle"
          fontSize="18"
          fontWeight="700"
          fontFamily="var(--font-plex-mono)"
          fill="var(--color-ink)"
        >
          {safe}%
        </text>
      </svg>
      <div className="min-w-0">
        <p className="font-display text-body font-semibold text-ink">{label}</p>
        <p className="mt-1 text-caption leading-relaxed text-ink-3">{sublabel}</p>
      </div>
    </div>
  );
}
