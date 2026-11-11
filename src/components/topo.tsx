"use client";

import { TOPO_SPECS, linkPath, type TopoNode } from "@/lib/topology-model";
import type { TopoKey } from "@/lib/data";

/* =============================================================================
   SKEMA TEKNIK — digambar ulang dalam bahasa gambar teknik (garis tinta),
   bukan gaya "neon". Semua warna diambil dari token CSS sehingga konsisten
   dengan halaman.
   ========================================================================== */

const INK = "var(--color-ink)";
const GRAPHITE = "var(--color-graphite)";
const RULE = "var(--color-rule-2)";
const MUTED = "var(--color-ink-3)";
const BLUE = "var(--color-blueprint)";

function PcGlyph({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <rect
        x={x - 30}
        y={y - 26}
        width={60}
        height={34}
        rx={2}
        fill="var(--color-paper)"
        stroke={GRAPHITE}
        strokeWidth={2}
      />
      <path d={`M ${x - 16} ${y + 8} h 32`} stroke={GRAPHITE} strokeWidth={2} />
      <path d={`M ${x - 16} ${y + 8} v 8 M ${x + 16} ${y + 8} v 8`} stroke={GRAPHITE} strokeWidth={2} />
      <text
        x={x}
        y={y + 44}
        textAnchor="middle"
        fontSize={19}
        fontFamily="var(--font-plex-mono)"
        fill={INK}
        stroke="var(--color-paper)"
        strokeWidth={7}
        paintOrder="stroke"
      >
        {label}
      </text>
    </g>
  );
}

function HubGlyph({ x, y, label, caption }: { x: number; y: number; label: string; caption?: string }) {
  return (
    <g>
      <rect
        x={x - 48}
        y={y - 24}
        width={96}
        height={48}
        rx={2}
        fill="var(--color-paper)"
        stroke={INK}
        strokeWidth={2.5}
      />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={x - 36 + i * 20}
          y={y - 12}
          width={12}
          height={8}
          rx={1}
          fill="none"
          stroke={GRAPHITE}
          strokeWidth={1.6}
        />
      ))}
      <text
        x={x}
        y={y + 42}
        textAnchor="middle"
        fontSize={19}
        fontFamily="var(--font-plex-mono)"
        fill={INK}
        stroke="var(--color-paper)"
        strokeWidth={7}
        paintOrder="stroke"
      >
        {label}
      </text>
      {caption && (
        <text
          x={x}
          y={y + 60}
          textAnchor="middle"
          fontSize={14}
          fontFamily="var(--font-plex-mono)"
          fill={MUTED}
          stroke="var(--color-paper)"
          strokeWidth={6}
          paintOrder="stroke"
        >
          {caption}
        </text>
      )}
    </g>
  );
}

/** Diagram ringkas untuk kartu. */
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
            stroke={RULE}
            strokeWidth={3}
            strokeDasharray="10 7"
          />
        );
      })}
      {spec.nodes.map((n) =>
        n.kind === "pc" ? (
          <g key={n.id}>
            <rect
              x={n.x - 26}
              y={n.y - 20}
              width={52}
              height={28}
              rx={2}
              fill="none"
              stroke={GRAPHITE}
              strokeWidth={2}
            />
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
              x={n.x - 34}
              y={n.y - 18}
              width={68}
              height={36}
              rx={2}
              fill="none"
              stroke={INK}
              strokeWidth={2.5}
            />
            <text
              x={n.x}
              y={n.y + 36}
              textAnchor="middle"
              fontSize={15}
              fontFamily="var(--font-plex-mono)"
              fill={INK}
            >
              SWITCH
            </text>
          </g>
        ) : (
          <g key={n.id}>
            <rect x={60} y={n.y - 8} width={880} height={16} rx={2} fill="var(--color-paper-3)" stroke={RULE} strokeWidth={2} />
          </g>
        ),
      )}
    </svg>
  );
}

/** Diagram bab lengkap dengan aliran data. */
export function TopoDiagram({
  kind,
  animate = true,
  brokenId,
}: {
  kind: TopoKey;
  animate?: boolean;
  /** Node yang dicabut / rusak — ditampilkan dengan garis putus-putus merah. */
  brokenId?: string | null;
}) {
  const spec = TOPO_SPECS[kind];
  const byId = new Map<string, TopoNode>(spec.nodes.map((n) => [n.id, n]));

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
        const broken =
          brokenId === l.from || brokenId === l.to;
        return (
          <path
            key={l.id}
            d={linkPath(from, to)}
            fill="none"
            stroke={broken ? "var(--color-redpen)" : BLUE}
            strokeWidth={4}
            strokeDasharray={broken ? "6 8" : animate ? "14 9" : undefined}
            className={animate && !broken ? "trace-live" : undefined}
            opacity={broken ? 0.75 : 1}
          />
        );
      })}

      {/* Paket data berjalan */}
      {animate &&
        spec.links.slice(0, 3).map((l, i) => {
          const from = byId.get(l.from);
          const to = byId.get(l.to);
          if (!from || !to) return null;
          return (
            <circle key={`pkt-${l.id}`} r={7} fill="var(--color-green)">
              <animateMotion
                dur={`${2.2 + i * 0.5}s`}
                repeatCount="indefinite"
                path={linkPath(from, to)}
                begin={`${i * 0.6}s`}
              />
            </circle>
          );
        })}

      {/* Perangkat */}
      {spec.nodes.map((n) =>
        n.kind === "pc" ? (
          <g key={n.id} opacity={brokenId === n.id ? 0.45 : 1}>
            <PcGlyph x={n.x} y={n.y} label={n.id} />
            {brokenId === n.id && (
              <text
                x={n.x}
                y={n.y - 40}
                textAnchor="middle"
                fontSize={16}
                fontFamily="var(--font-plex-mono)"
                fill="var(--color-redpen)"
              >
                KABEL PUTUS
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
              rx={2}
              fill="var(--color-paper-3)"
              stroke={RULE}
              strokeWidth={2}
            />
            {[
              [60, "Terminator"],
              [940, "Terminator"],
            ].map(([x, label]) => (
              <g key={String(label)}>
                <rect x={Number(x) - 8} y={n.y - 13} width={16} height={26} rx={1} fill="var(--color-amber-2)" stroke="var(--color-amber)" strokeWidth={2} />
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
