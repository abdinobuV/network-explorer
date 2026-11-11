"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  IconCheck,
  IconCross,
  IconInfo,
  IconPlug,
  IconPrint,
  IconTarget,
} from "@/components/icons";
import { Btn, Callout, LogLine, Meter, cx } from "@/components/ui";
import { sfx } from "@/lib/sound";
import { getPref, setPref, subscribePrefs } from "@/lib/prefs";
import { toast } from "@/lib/toast";
import { XP } from "@/lib/progression";
import { linkPath, portAnchor, type Point, type TopoNode, type TopoSpec } from "@/lib/topology-model";

/* =============================================================================
   LEMBAR KERJA PEMASANGAN KABEL
   -----------------------------------------------------------------------------
   Satu DndContext untuk seluruh ruang kerja (palet + kanvas) sehingga kabel
   bisa ditarik dari palet ke perangkat, dan kabel yang sudah terpasang bisa
   ditarik keluar untuk dicabut.
   ========================================================================== */

interface LogEntry {
  id: number;
  time: string;
  text: string;
  tone: "default" | "ok" | "error";
}

interface Props {
  spec: TopoSpec;
  /** Dipanggil sekali saat semua kabel tersambung. */
  onComplete?: () => void;
}

const TRAY_ID = "tray";

function nowLabel() {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

/* ------------------------------------------------------------------ Sub-komponen */

function TrayCable({
  id,
  label,
  connected,
  selected,
  onSelect,
  onDetach,
}: {
  id: string;
  label: string;
  connected: boolean;
  selected: boolean;
  onSelect: () => void;
  onDetach: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `tray:${id}`,
    disabled: connected,
  });

  return (
    <li
      ref={setNodeRef}
      className={cx(
        "flex items-center gap-3 border bg-paper px-3 py-2 transition-colors",
        connected ? "border-green/40 bg-green-2" : "border-rule",
        isDragging && "opacity-40",
        selected && !connected && "border-blueprint bg-blueprint-3",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="flex flex-1 touch-none items-center gap-2 text-left"
        {...(connected ? {} : { ...listeners, ...attributes })}
      >
        <IconPlug size={16} className={connected ? "text-green" : "text-blueprint"} />
        <span className="font-mono text-caption text-ink">{label}</span>
        {connected && (
          <span className="inline-flex items-center gap-1 font-mono text-micro uppercase tracking-[0.1em] text-green">
            <IconCheck size={13} /> terpasang
          </span>
        )}
      </button>
      {connected && (
        <button
          type="button"
          onClick={onDetach}
          className="inline-flex items-center gap-1 rounded-xs border border-rule-2 px-2 py-1 font-mono text-micro uppercase tracking-[0.1em] text-ink-3 hover:border-redpen hover:text-redpen"
        >
          <IconCross size={12} /> cabut
        </button>
      )}
    </li>
  );
}

function InstalledWire({
  cableId,
  path,
  label,
}: {
  cableId: string;
  path: string;
  label: string;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `wire:${cableId}`,
  });

  return (
    <g
      ref={setNodeRef as unknown as (node: SVGGElement | null) => void}
      className={cx(isDragging && "opacity-30")}
      {...listeners}
      {...attributes}
    >
      <path d={path} fill="none" stroke="transparent" strokeWidth={26} className="cursor-grab touch-none" />
      <path
        d={path}
        fill="none"
        stroke="var(--color-blueprint)"
        strokeWidth={5}
        strokeLinecap="round"
        className="trace-live"
      />
      <title>{label} — tarik untuk mencabut</title>
    </g>
  );
}

function Device({
  node,
  state,
  isTarget,
  isOver,
  shake,
}: {
  node: TopoNode;
  state: "connected" | "idle" | "target";
  isTarget: boolean;
  isOver: boolean;
  shake: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: `node:${node.id}` });
  const w = node.kind === "hub" ? 158 : 132;
  const h = node.kind === "hub" ? 82 : 66;
  const stroke =
    state === "connected"
      ? "var(--color-green)"
      : isOver
        ? "var(--color-blueprint)"
        : isTarget
          ? "var(--color-blueprint-2)"
          : "var(--color-rule-2)";

  const fill =
    state === "connected" ? "var(--color-green-2)" : "var(--color-paper)";

  return (
    <g ref={setNodeRef as unknown as (node: SVGGElement | null) => void} className={cx(shake && "shake")}>
      <rect
        x={node.x - w / 2}
        y={node.y - h / 2}
        width={w}
        height={h}
        rx={3}
        fill={fill}
        stroke={stroke}
        strokeWidth={isOver || isTarget ? 3 : 2}
        strokeDasharray={isTarget && !isOver ? "8 6" : undefined}
      />
      {node.kind === "pc" && (
        <>
          <rect
            x={node.x - 26}
            y={node.y - 20}
            width={52}
            height={30}
            rx={2}
            fill="none"
            stroke="var(--color-graphite)"
            strokeWidth={2}
          />
          <path d={`M ${node.x - 14} ${node.y + 10} h 28`} stroke="var(--color-graphite)" strokeWidth={2} />
        </>
      )}
      {node.kind === "hub" && (
        <>
          <rect
            x={node.x - 40}
            y={node.y - 24}
            width={80}
            height={26}
            rx={2}
            fill="none"
            stroke="var(--color-graphite)"
            strokeWidth={2}
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              cx={node.x - 28 + i * 14}
              cy={node.y - 11}
              r={3}
              fill={state === "connected" ? "var(--color-green)" : "var(--color-ink-4)"}
            />
          ))}
        </>
      )}
      <text
        x={node.x}
        y={node.y + (node.kind === "pc" ? 58 : 68)}
        textAnchor="middle"
        fontSize={22}
        fontFamily="var(--font-plex-mono)"
        fill="var(--color-ink)"
        stroke="var(--color-paper)"
        strokeWidth={8}
        paintOrder="stroke"
      >
        {node.label}
      </text>
      <text
        x={node.x}
        y={node.y + (node.kind === "pc" ? 78 : 88)}
        textAnchor="middle"
        fontSize={16}
        fontFamily="var(--font-plex-mono)"
        fill="var(--color-ink-3)"
        stroke="var(--color-paper)"
        strokeWidth={6}
        paintOrder="stroke"
      >
        {node.kind === "pc" ? `Port ${node.port}` : node.caption}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ Komponen utama */

export default function CableBoard({ spec, onComplete }: Props) {
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState<{ cable: string; from: "tray" | "wire" } | null>(null);
  const [pointer, setPointer] = useState<Point | null>(null);
  const [overNode, setOverNode] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [announce, setAnnounce] = useState("");

  /* Preferensi "tampilkan jalur" disimpan di Pengaturan (useSyncExternalStore
     supaya tidak perlu setState di dalam effect). */
  const showPaths = useSyncExternalStore(
    subscribePrefs,
    () => getPref("showPaths"),
    () => false,
  );

  const svgRef = useRef<SVGSVGElement | null>(null);
  const logId = useRef(0);

  function togglePaths() {
    setPref("showPaths", !showPaths);
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const nodeById = useMemo(() => {
    const map = new Map<string, TopoNode>();
    spec.nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [spec]);

  const cableById = useMemo(() => {
    const map = new Map<string, (typeof spec.cables)[number]>();
    spec.cables.forEach((c) => map.set(c.id, c));
    return map;
  }, [spec]);

  const connectedCount = spec.cables.filter((c) => connected[c.id]).length;
  const complete = connectedCount === spec.cables.length;

  const addLog = useCallback((text: string, tone: LogEntry["tone"]) => {
    logId.current += 1;
    setLog((l) => [{ id: logId.current, time: nowLabel(), text, tone }, ...l].slice(0, 40));
  }, []);

  /* ---------------------------------------------------------- Konversi koordinat */

  const toSvgPoint = useCallback((clientX: number, clientY: number): Point | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    if (!rect.width || !rect.height || !vb.width || !vb.height) return null;
    const scale = Math.min(rect.width / vb.width, rect.height / vb.height);
    const ox = (rect.width - vb.width * scale) / 2;
    const oy = (rect.height - vb.height * scale) / 2;
    return {
      x: (clientX - rect.left - ox) / scale + vb.x,
      y: (clientY - rect.top - oy) / scale + vb.y,
    };
  }, []);

  /* ---------------------------------------------------------- Aksi */

  const connect = useCallback(
    (cableId: string, viaDrag: boolean) => {
      const cable = cableById.get(cableId);
      if (!cable || connected[cableId]) return;
      setConnected((c) => ({ ...c, [cableId]: true }));
      setSelected(null);
      sfx("click");
      const target = nodeById.get(cable.target);
      addLog(
        `${cable.label} → ${target?.label ?? cable.target} — tersambung${
          viaDrag ? "" : " (pintasan papan)"
        }`,
        "ok",
      );
      setAnnounce(`${cable.label} tersambung ke ${target?.label ?? cable.target}.`);
    },
    [addLog, cableById, connected, nodeById],
  );

  const disconnect = useCallback(
    (cableId: string) => {
      if (!connected[cableId]) return;
      setConnected((c) => {
        const next = { ...c };
        delete next[cableId];
        return next;
      });
      sfx("detach");
      addLog(`${cableById.get(cableId)?.label ?? cableId} dicabut`, "default");
      setAnnounce(`${cableById.get(cableId)?.label ?? "Kabel"} dicabut.`);
    },
    [addLog, cableById, connected],
  );

  const reject = useCallback(
    (cableId: string, nodeId: string) => {
      const cable = cableById.get(cableId);
      sfx("reject");
      setRejectId(nodeId);
      setAnnounce(cable?.reject ?? "Sambungan ditolak.");
      addLog(`DITOLAK — ${cable?.reject ?? "sambungan tidak sesuai topologi."}`, "error");
      window.setTimeout(() => setRejectId(null), 420);
    },
    [addLog, cableById],
  );

  /* ---------------------------------------------------------- Handler DnD */

  const handleDragStart = (e: DragStartEvent) => {
    const raw = String(e.active.id);
    const [kind, cableId] = raw.split(":");
    setActive({ cable: cableId, from: kind === "wire" ? "wire" : "tray" });
    setOverNode(null);
  };

  const handleDragMove = (e: DragMoveEvent) => {
    const activator = e.activatorEvent as PointerEvent | undefined;
    if (!activator) return;
    const point = toSvgPoint(activator.clientX + e.delta.x, activator.clientY + e.delta.y);
    setPointer(point);
    const over = e.over?.id ? String(e.over.id) : "";
    setOverNode(over.startsWith("node:") ? over.slice(5) : null);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const current = active;
    setActive(null);
    setPointer(null);
    setOverNode(null);
    if (!current) return;

    const over = e.over?.id ? String(e.over.id) : "";
    const cable = cableById.get(current.cable);
    if (!cable) return;

    if (current.from === "wire") {
      if (over === TRAY_ID) {
        disconnect(current.cable);
        return;
      }
      if (over.startsWith("node:") && over.slice(5) === cable.target) return; // kembali ke tempat semula
      if (over.startsWith("node:")) {
        reject(current.cable, over.slice(5));
      }
      return;
    }

    if (!over.startsWith("node:")) return;
    const targetId = over.slice(5);
    if (targetId === cable.target) {
      connect(current.cable, true);
    } else {
      reject(current.cable, targetId);
    }
  };

  /* ---------------------------------------------------------- Jalur yang digantung */

  const activeCable = active ? cableById.get(active.cable) : null;
  const ghost = useMemo(() => {
    if (!activeCable || !pointer) return null;
    const origin = nodeById.get(activeCable.origin);
    if (!origin) return null;
    const a = portAnchor(origin, pointer);
    const midY = (a.y + pointer.y) / 2;
    return `M ${a.x} ${a.y} C ${a.x} ${midY}, ${pointer.x} ${midY}, ${pointer.x} ${pointer.y}`;
  }, [activeCable, nodeById, pointer]);

  useEffect(() => {
    if (complete && connectedCount > 0) {
      sfx("chime");
      addLog(`SELESAI — ${connectedCount}/${spec.cables.length} tersambung`, "ok");
      toast(
        `Sertifikat pemasangan ${spec.title} lengkap. +${XP.praktik} XP.`,
        "ok",
      );
      onComplete?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete]);

  /* ---------------------------------------------------------- Render */

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* ------------------------------------------------ Kanvas gambar teknik */}
      <section className="min-w-0 border border-rule bg-paper">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule bg-paper-2 px-4 py-2">
          <p className="font-mono text-micro uppercase tracking-[0.14em] text-ink-3">
            Lembar kerja · {spec.title}
          </p>
          <div className="flex items-center gap-3">
            <Meter value={connectedCount} total={spec.cables.length} label="Kabel tersambung" />
            <button
              type="button"
              onClick={togglePaths}
              className="inline-flex items-center gap-1.5 rounded-xs border border-rule-2 px-2 py-1 font-mono text-micro uppercase tracking-[0.1em] text-ink-3 hover:border-ink hover:text-ink"
            >
              <IconTarget size={13} />
              {showPaths ? "Sembunyikan jalur" : "Tampilkan jalur"}
            </button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={(args) => {
            const inside = pointerWithin(args);
            return inside.length ? inside : rectIntersection(args);
          }}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onDragCancel={() => {
            setActive(null);
            setPointer(null);
            setOverNode(null);
          }}
        >
          <div className="drafting-grid overflow-x-auto p-2 sm:p-4">
            <svg
              ref={svgRef}
              viewBox={spec.viewBox}
              className="h-auto w-full min-w-[620px] select-none sm:min-w-0"
              role="img"
              aria-label={`Diagram ${spec.title} dengan ${spec.cables.length} komputer dan jalur pemasangan`}
            >
              {/*.Backbone */}
              {spec.nodes
                .filter((n) => n.kind === "backbone")
                .map((n) => (
                  <g key={n.id}>
                    <rect
                      x={60}
                      y={n.y - 9}
                      width={880}
                      height={18}
                      rx={2}
                      fill="var(--color-paper-3)"
                      stroke="var(--color-rule-2)"
                      strokeWidth={2}
                    />
                    <text
                      x={500}
                      y={n.y + 40}
                      textAnchor="middle"
                      fontSize={17}
                      fontFamily="var(--font-plex-mono)"
                      fill="var(--color-ink-3)"
                    >
                      BACKBONE · 8 PORT
                    </text>
                  </g>
                ))}

              {/* Jalur bayangan (petunjuk) */}
              {showPaths &&
                spec.links.map((l) => {
                  const from = nodeById.get(l.from);
                  const to = nodeById.get(l.to);
                  if (!from || !to) return null;
                  const isDone = connected[l.cable];
                  return (
                    <path
                      key={`ghost-${l.id}`}
                      d={linkPath(from, to)}
                      fill="none"
                      stroke="var(--color-rule-2)"
                      strokeWidth={3}
                      className={cx("trace-idle", !isDone && "pulse-line")}
                    />
                  );
                })}

              {/* Kabel terpasang */}
              {spec.links.map((l) => {
                if (!connected[l.cable]) return null;
                if (active?.cable === l.cable && active.from === "wire") return null;
                const from = nodeById.get(l.from);
                const to = nodeById.get(l.to);
                if (!from || !to) return null;
                return (
                  <InstalledWire
                    key={l.id}
                    cableId={l.cable}
                    path={linkPath(from, to)}
                    label={cableById.get(l.cable)?.label ?? l.id}
                  />
                );
              })}

              {/* Kabel bayangan saat diseret */}
              {ghost && (
                <path
                  d={ghost}
                  fill="none"
                  stroke="var(--color-blueprint-2)"
                  strokeWidth={4}
                  strokeDasharray="8 6"
                  strokeLinecap="round"
                />
              )}

              {/* Perangkat */}
              {spec.nodes.map((n) => {
                const isConnected = spec.links.some(
                  (l) => l.cable && connected[l.cable] && (l.from === n.id || l.to === n.id),
                );
                const isTarget =
                  !!activeCable && activeCable.target === n.id && active?.from === "tray";
                return (
                  <Device
                    key={n.id}
                    node={n}
                    state={isConnected ? "connected" : "idle"}
                    isTarget={isTarget}
                    isOver={overNode === n.id}
                    shake={rejectId === n.id}
                  />
                );
              })}
            </svg>
          </div>

          <DragOverlay dropAnimation={null}>
            {activeCable && (
              <div className="flex items-center gap-2 rounded-xs border border-blueprint bg-paper px-3 py-2 shadow-lift">
                <IconPlug size={16} className="text-blueprint" />
                <span className="font-mono text-caption">{activeCable.label}</span>
              </div>
            )}
          </DragOverlay>
        </DndContext>

        <div className="border-t border-rule px-4 py-2">
          <p aria-live="polite" className="sr-only">
            {announce}
          </p>
          <p className="text-caption text-ink-3">
            Seret kabel dari palet ke perangkat yang benar. Untuk memakai keyboard: pilih kabel
            pada panel di bawah, lalu tekan tombol perangkat sasaran.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------ Panel samping */}
      <aside className="min-w-0 flex flex-col gap-4">
        <div className="border border-rule bg-paper">
          <h3 className="border-b border-rule bg-paper-2 px-4 py-2 font-mono text-micro uppercase tracking-[0.14em] text-ink-3">
            Palet kabel
          </h3>
          <ul className="space-y-2 p-3">
            {spec.cables.map((c) => (
              <TrayCable
                key={c.id}
                id={c.id}
                label={c.label}
                connected={!!connected[c.id]}
                selected={selected === c.id}
                onSelect={() => setSelected((s) => (s === c.id ? null : c.id))}
                onDetach={() => disconnect(c.id)}
              />
            ))}
          </ul>
          <div className="border-t border-rule p-3">
            <p className="mb-2 font-mono text-micro uppercase tracking-[0.12em] text-ink-3">
              Sasaran pemasangan
            </p>
            <div className="flex flex-wrap gap-2">
              {spec.nodes
                .filter((n) => n.kind !== "backbone")
                .map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      if (!selected) {
                        setAnnounce("Pilih kabel terlebih dahulu pada palet.");
                        return;
                      }
                      const cable = cableById.get(selected);
                      if (!cable) return;
                      if (connected[cable.id]) {
                        setAnnounce(`${cable.label} sudah terpasang. Cabut dulu untuk memasang ulang.`);
                        toast(`${cable.label} sudah terpasang. Cabut dulu untuk memasang ulang.`);
                        return;
                      }
                      if (cable.target === n.id) connect(cable.id, false);
                      else reject(cable.id, n.id);
                    }}
                    className={cx(
                      "rounded-xs border px-2.5 py-1 font-mono text-micro transition-colors",
                      selected && cableById.get(selected)?.target === n.id
                        ? "border-blueprint bg-blueprint text-paper"
                        : "border-rule-2 text-ink-2 hover:border-ink hover:text-ink",
                    )}
                  >
                    {n.label}
                  </button>
                ))}
            </div>
            {selected && (
              <p className="mt-2 flex items-center gap-1.5 font-mono text-micro text-blueprint">
                <IconInfo size={13} />
                {cableById.get(selected)?.label} dipilih — tekan perangkat sasaran.
              </p>
            )}
          </div>
        </div>

        <div className="border border-rule bg-paper">
          <h3 className="border-b border-rule bg-paper-2 px-4 py-2 font-mono text-micro uppercase tracking-[0.14em] text-ink-3">
            Catatan pemasangan
          </h3>
          <div className="max-h-64 overflow-y-auto p-3">
            {log.length === 0 ? (
              <p className="font-mono text-micro text-ink-4">Belum ada aktivitas.</p>
            ) : (
              <div className="space-y-1">
                {log.map((l) => (
                  <LogLine key={l.id} time={l.time} tone={l.tone}>
                    {l.text}
                  </LogLine>
                ))}
              </div>
            )}
          </div>
        </div>

        {complete && (
          <div className="border border-green/50 bg-green-2 p-4">
            <p className="font-mono text-micro uppercase tracking-[0.14em] text-green">
              Sertifikat pemasangan
            </p>
            <h4 className="mt-1 font-serif text-title">{spec.title}</h4>
            <p className="mt-1 text-caption text-ink-2">
              Seluruh {spec.cables.length} kabel terpasang sesuai aturan {spec.title.toLowerCase()}.
              {spec.key === "ring" && " Cincin tertutup."}
            </p>
            <ul className="mt-3 space-y-1">
              {spec.links.map((l) => (
                <li key={l.id} className="flex items-center gap-2 font-mono text-micro text-ink-2">
                  <IconCheck size={13} className="text-green" />
                  {nodeById.get(l.from)?.label} → {nodeById.get(l.to)?.label}
                </li>
              ))}
            </ul>
            <p className="mt-3 font-mono text-micro text-ink-3">
              Dicetak {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
            </p>
            <Btn
              tone="ghost"
              size="sm"
              className="mt-3"
              onClick={() => window.print()}
            >
              <IconPrint size={14} /> Cetak sertifikat
            </Btn>
          </div>
        )}

        {!complete && (
          <Callout tone="note">
            {spec.rule}
          </Callout>
        )}
      </aside>
    </div>
  );
}
