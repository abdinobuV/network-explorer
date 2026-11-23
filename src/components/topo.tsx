"use client";

import { TOPO_SPECS, linkPath, type TopoNode } from "@/lib/topology-model";
import type { TopoKey } from "@/lib/data";

/* =============================================================================
   SKEMA JARINGAN GELAP — bahasa visual patch-panel & osiloskop
   Garis jalur cyan terukur, paket data hijau LED, gangguan merah tegas.
   ========================================================================== */

const INK = "var(--color-ink)";
const SURFACE = "var(--color-surface)";
const SURFACE_2 = "var(--color-surface-2)";
const BORDER = "var(--color-border-2)";
const MUTED = "var(--color-ink-3)";
const SIGNAL = "var(--color-signal)";
const SIGNAL_BRIGHT = "var(--color-signal-bright)";
const OK = "var(--color-ok)";
const FAULT = "var(--color-fault)";
const CAUTION = "var(--color-caution)";
const GRID_BG = "#09101d";

function PcGlyph({ x, y, label, broken = false }: { x: number; y: number; label: string; broken?: boolean }) {
  return (
    <g>
      <rect
        x={x - 32}
        y={y - 26}
        width={64}
        height={36}
        rx={4}
        fill={SURFACE}
        stroke={broken ? FAULT : SIGNAL}
        strokeWidth={2}
      />
      <rect
        x={x - 24}
        y={y - 19}
        width={48}
        height={21}
        rx={2}
        fill={GRID_BG}
        stroke={BORDER}
        strokeWidth={1.2}
      />
      <circle cx={x + 22} cy={y + 4} r={2.2} fill={broken ? FAULT : OK} />
      <path d={`M ${x - 16} ${y + 10} h 32 M ${x - 10} ${y + 10} v 7 M ${x + 10} ${y + 10} v 7 M ${x - 18} ${y + 17} h 36`} stroke={BORDER} strokeWidth={2} strokeLinecap="round" />
      <text
        x={x}
        y={y + 44}
        textAnchor="middle"
        fontSize={19}
        fontFamily="var(--font-plex-mono)"
        fill={broken ? FAULT : INK}
        stroke={GRID_BG}
        strokeWidth={7}
        paintOrder="stroke"
      >
        {label}
      </text>
    </g>
  );
}

function HubGlyph({ x, y, label }: { x: number; y: number; label: string; caption?: string }) {
  return (
    <g>
      <rect
        x={x - 52}
        y={y - 25}
        width={104}
        height={50}
        rx={5}
        fill={SURFACE_2}
        stroke={OK}
        strokeWidth={2.5}
      />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x={x - 38 + i * 21}
            y={y - 12}
            width={13}
            height={10}
            rx={1.5}
            fill={GRID_BG}
            stroke={BORDER}
            strokeWidth={1.4}
          />
          <circle cx={x - 31.5 + i * 21} cy={y + 8} r={2.3} fill={OK} />
        </g>
      ))}
      <text
        x={x}
        y={y + 42}
        textAnchor="middle"
        fontSize={17}
        fontFamily="var(--font-plex-mono)"
        fill={INK}
        stroke={GRID_BG}
        strokeWidth={8}
        paintOrder="stroke"
      >
        {label}
      </text>
    </g>
  );
}

/** Diagram ringkas untuk kartu pilihan topologi. */
export function TopoMini({ kind }: { kind: TopoKey }) {
  const spec = TOPO_SPECS[kind];
  const byId = new Map(spec.nodes.map((n) => [n.id, n]));

  return (
    <svg
      viewBox={spec.viewBox}
      className="h-auto w-full"
      role="img"
      aria-label={`Diagram ringkas ${spec.title}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {spec.links.map((l) => {
        const from = byId.get(l.from);
        const to = byId.get(l.to);
        if (!from || !to) return null;
        return (
          <path
            key={l.id}
            d={linkPath(from, to)}
            fill="none"
            stroke={SIGNAL}
            strokeWidth={3.2}
            strokeOpacity={0.75}
          />
        );
      })}
      {spec.nodes.map((n) =>
        n.kind === "pc" ? (
          <g key={n.id}>
            <rect
              x={n.x - 28}
              y={n.y - 21}
              width={56}
              height={30}
              rx={4}
              fill={SURFACE}
              stroke={SIGNAL_BRIGHT}
              strokeWidth={2}
            />
            <circle cx={n.x + 19} cy={n.y - 12} r={2.4} fill={OK} />
            <text
              x={n.x}
              y={n.y + 34}
              textAnchor="middle"
              fontSize={17}
              fontFamily="var(--font-plex-mono)"
              fill={MUTED}
            >
              {n.id}
            </text>
          </g>
        ) : n.kind === "hub" ? (
          <g key={n.id}>
            <rect
              x={n.x - 38}
              y={n.y - 20}
              width={76}
              height={40}
              rx={5}
              fill={SURFACE_2}
              stroke={OK}
              strokeWidth={2.5}
            />
            <text
              x={n.x}
              y={n.y + 5}
              textAnchor="middle"
              fontSize={15}
              fontFamily="var(--font-plex-mono)"
              fill={OK}
            >
              SWITCH
            </text>
          </g>
        ) : (
          <g key={n.id}>
            <rect
              x={60}
              y={n.y - 8}
              width={880}
              height={16}
              rx={3}
              fill={SURFACE_2}
              stroke={BORDER}
              strokeWidth={2}
            />
          </g>
        ),
      )}
    </svg>
  );
}

/** Diagram penuh dengan animasi aliran paket dan dukungan simulasi putus kabel. */
export function TopoDiagram({
  kind,
  animate = true,
  brokenId,
}: {
  kind: TopoKey;
  animate?: boolean;
  /** Node yang dicabut / rusak — ditampilkan dengan jalur putus-putus merah. */
  brokenId?: string | null;
}) {
  const spec = TOPO_SPECS[kind];
  const byId = new Map<string, TopoNode>(spec.nodes.map((n) => [n.id, n]));
  const isRingBroken = kind === "ring" && Boolean(brokenId);

  return (
    <svg
      viewBox={spec.viewBox}
      className="h-auto w-full"
      role="img"
      aria-label={`Diagram aliran data ${spec.title}: ${spec.summary}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Jalur */}
      {spec.links.map((l) => {
        const from = byId.get(l.from);
        const to = byId.get(l.to);
        if (!from || !to) return null;
        const broken = brokenId === l.from || brokenId === l.to;
        const halted = broken || isRingBroken;
        return (
          <path
            key={l.id}
            d={linkPath(from, to)}
            fill="none"
            stroke={broken ? FAULT : isRingBroken ? BORDER : SIGNAL}
            strokeWidth={4}
            strokeDasharray={broken ? "7 8" : animate && !halted ? "12 8" : undefined}
            className={animate && !halted ? "trace-live" : undefined}
            opacity={broken ? 0.85 : isRingBroken ? 0.5 : 1}
          />
        );
      })}

      {/* Paket data berjalan */}
      {animate &&
        !isRingBroken &&
        spec.links.slice(0, 3).map((l, i) => {
          if (brokenId === l.from || brokenId === l.to) return null;
          const from = byId.get(l.from);
          const to = byId.get(l.to);
          if (!from || !to) return null;
          return (
            <circle key={`pkt-${l.id}`} r={7} fill={OK} opacity={i === 0 ? 1 : 0}>
              {i > 0 && (
                <set attributeName="opacity" to="1" begin={`${i * 0.55}s`} fill="freeze" />
              )}
              <animateMotion
                dur={`${2.2 + i * 0.45}s`}
                repeatCount="indefinite"
                path={linkPath(from, to)}
                begin={`${i * 0.55}s`}
              />
            </circle>
          );
        })}

      {/* Perangkat */}
      {spec.nodes.map((n) =>
        n.kind === "pc" ? (
          <g key={n.id} opacity={brokenId === n.id ? 0.65 : 1}>
            <PcGlyph x={n.x} y={n.y} label={n.id} broken={brokenId === n.id} />
            {brokenId === n.id && (
              <text
                x={n.x}
                y={n.y - 38}
                textAnchor="middle"
                fontSize={15}
                fontFamily="var(--font-plex-mono)"
                fill={FAULT}
                stroke={GRID_BG}
                strokeWidth={5}
                paintOrder="stroke"
              >
                TERPUTUS
              </text>
            )}
          </g>
        ) : n.kind === "hub" ? (
          <HubGlyph key={n.id} x={n.x} y={n.y} label={n.label} caption={n.caption} />
        ) : (
          <g key={n.id}>
            <rect
              x={60}
              y={n.y - 9}
              width={880}
              height={18}
              rx={3}
              fill={SURFACE_2}
              stroke={brokenId === n.id ? FAULT : BORDER}
              strokeWidth={2}
            />
            {[
              [60, "Terminator"],
              [940, "Terminator"],
            ].map(([x, label]) => (
              <g key={`${x}-${label}`}>
                <rect
                  x={Number(x) - 8}
                  y={n.y - 13}
                  width={16}
                  height={26}
                  rx={2}
                  fill="var(--color-caution-tint)"
                  stroke={CAUTION}
                  strokeWidth={2}
                />
                <text
                  x={Number(x)}
                  y={n.y + 34}
                  textAnchor="middle"
                  fontSize={15}
                  fontFamily="var(--font-plex-mono)"
                  fill={MUTED}
                >
                  {label as string}
                </text>
              </g>
            ))}
          </g>
        ),
      )}
    </svg>
  );
}
