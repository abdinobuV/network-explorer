"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge, Btn, Callout, cx } from "@/components/ui";
import {
  IconArrow,
  IconCheck,
  IconCross,
  IconPlug,
  IconPulse,
  IconRefresh,
  IconWarning,
} from "@/components/icons";
import { TOPOLOGI, type TopoKey } from "@/lib/data";
import {
  linkPath,
  portAnchor,
  traceSandboxRoute,
  type DirectedHop,
  type Point,
  type TopoNode,
  type TopoSpec,
} from "@/lib/topology-model";
import { sfx } from "@/lib/sound";
import { toast } from "@/lib/toast";

interface LogRow {
  id: number;
  time: string;
  text: string;
  tone: "default" | "ok" | "error";
}

type DragAction =
  | { kind: "node"; nodeId: string; offsetX: number; offsetY: number }
  | { kind: "cable"; cableId: string; originNodeId: string; fromTray: boolean }
  | { kind: "tool-cut" }
  | { kind: "tool-packet" };

interface Props {
  topoKey: TopoKey;
  spec: TopoSpec;
  onSimComplete: () => void;
  onTelemetry: (event: "ping_ok" | "ping_fail" | "fault_toggle") => void;
}

const GRID_BG = "#09101d";

function nowLabel() {
  return new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function bezierMidpoint(a: Point, b: Point, kindTo: TopoNode["kind"], kindFrom: TopoNode["kind"]): Point {
  if (kindTo === "backbone") {
    return { x: a.x, y: (a.y + b.y) / 2 };
  }
  if (kindFrom === "backbone") {
    return { x: b.x, y: (a.y + b.y) / 2 };
  }
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 1;
  const bow = Math.min(70, dist * 0.18);
  const nx = (-dy / dist) * bow;
  const ny = (dx / dist) * bow;
  const cxPt = (a.x + b.x) / 2 + nx;
  const cyPt = (a.y + b.y) / 2 + ny;
  // Titik tengah kurva kuadratik Q pada t = 0.5
  return {
    x: 0.25 * a.x + 0.5 * cxPt + 0.25 * b.x,
    y: 0.25 * a.y + 0.5 * cyPt + 0.25 * b.y,
  };
}

export default function SandboxBench({ topoKey, spec, onSimComplete, onTelemetry }: Props) {
  const info = TOPOLOGI[topoKey];
  const svgRef = useRef<SVGSVGElement | null>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const logSeq = useRef(0);

  // Posisi dinamis perangkat (bisa digeser bebas di atas meja kerja)
  const [positions, setPositions] = useState<Record<string, Point>>(() =>
    Object.fromEntries(spec.nodes.map((n) => [n.id, { x: n.x, y: n.y }])),
  );
  // Tautan yang sedang terpasang (bisa dicabut / dipasang satu per satu atau dari kosong)
  const [connectedLinks, setConnectedLinks] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(spec.links.map((l) => [l.id, true])),
  );
  // Perangkat pusat mati/rusak (SWITCH pada Star / BACKBONE pada Bus)
  const [centerOffline, setCenterOffline] = useState(false);
  // Mode Ring Ganda (hanya untuk topologi Ring)
  const [dualRing, setDualRing] = useState(false);

  // Status interaksi drag & drop langsung
  const [drag, setDrag] = useState<DragAction | null>(null);
  const [pointer, setPointer] = useState<Point | null>(null);
  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null);
  const [hoverLinkId, setHoverLinkId] = useState<string | null>(null);
  const [selectedTrayCable, setSelectedTrayCable] = useState<string | null>(null);
  const [rejectNodeId, setRejectNodeId] = useState<string | null>(null);

  // Status simulasi paket ping
  const pcs = useMemo(() => spec.nodes.filter((n) => n.kind === "pc"), [spec]);
  const [dari, setDari] = useState(pcs[0]?.id ?? "PC-01");
  const [ke, setKe] = useState(pcs[1]?.id ?? "PC-02");
  const [routeHops, setRouteHops] = useState<DirectedHop[]>([]);
  const [activeHopIdx, setActiveHopIdx] = useState(-1);
  const [packetPhase, setPacketPhase] = useState<"req" | "ack">("req");
  const [sending, setSending] = useState(false);
  const [hasil, setHasil] = useState<{
    ok: boolean;
    ms: number;
    hops: number;
    reason: string;
  } | null>(null);
  const [log, setLog] = useState<LogRow[]>([]);

  useEffect(() => {
    const t = timers.current;
    return () => {
      t.forEach(clearTimeout);
      t.length = 0;
    };
  }, []);

  const addLog = useCallback((text: string, tone: LogRow["tone"] = "default") => {
    logSeq.current += 1;
    setLog((prev) => [{ id: logSeq.current, time: nowLabel(), text, tone }, ...prev].slice(0, 35));
  }, []);

  // Node dengan koordinat terbaru setelah digeser pengguna
  const liveNodes = useMemo<TopoNode[]>(
    () =>
      spec.nodes.map((n) => ({
        ...n,
        x: positions[n.id]?.x ?? n.x,
        y: positions[n.id]?.y ?? n.y,
      })),
    [spec.nodes, positions],
  );

  const nodeById = useMemo(() => new Map(liveNodes.map((n) => [n.id, n])), [liveNodes]);
  const linkByCable = useMemo(() => new Map(spec.links.map((l) => [l.cable, l])), [spec.links]);
  const cableById = useMemo(() => new Map(spec.cables.map((c) => [c.id, c])), [spec.cables]);

  const connectedCount = spec.links.filter((l) => connectedLinks[l.id]).length;
  const looseCables = spec.cables.filter((c) => {
    const link = linkByCable.get(c.id);
    return link ? !connectedLinks[link.id] : false;
  });

  const viewDims = useMemo(() => {
    const [, , w, h] = spec.viewBox.split(" ").map(Number);
    return { w: w || 1000, h: h || 600 };
  }, [spec.viewBox]);

  const toSvgPoint = useCallback(
    (clientX: number, clientY: number): Point | null => {
      const svg = svgRef.current;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      return {
        x: ((clientX - rect.left) / rect.width) * viewDims.w,
        y: ((clientY - rect.top) / rect.height) * viewDims.h,
      };
    },
    [viewDims.h, viewDims.w],
  );

  const findNearestNode = useCallback(
    (pt: Point, excludeId?: string): TopoNode | null => {
      let best: TopoNode | null = null;
      let bestDist = Infinity;
      for (const n of liveNodes) {
        if (n.id === excludeId) continue;
        if (n.kind === "backbone") {
          const hitX = pt.x >= 55 && pt.x <= 945;
          const distY = Math.abs(pt.y - n.y);
          if (hitX && distY < 48 && distY < bestDist) {
            best = n;
            bestDist = distY;
          }
        } else {
          const radius = n.kind === "hub" ? 78 : 66;
          const d = Math.hypot(pt.x - n.x, pt.y - n.y);
          if (d < radius && d < bestDist) {
            best = n;
            bestDist = d;
          }
        }
      }
      return best;
    },
    [liveNodes],
  );

  const findNearestConnectedLink = useCallback(
    (pt: Point): string | null => {
      let bestId: string | null = null;
      let bestDist = 42;
      for (const l of spec.links) {
        if (!connectedLinks[l.id]) continue;
        const from = nodeById.get(l.from);
        const to = nodeById.get(l.to);
        if (!from || !to) continue;
        const a = portAnchor(from, to);
        const b = portAnchor(to, from);
        const mid = bezierMidpoint(a, b, to.kind, from.kind);
        const d = Math.hypot(pt.x - mid.x, pt.y - mid.y);
        if (d < bestDist) {
          bestDist = d;
          bestId = l.id;
        }
      }
      return bestId;
    },
    [connectedLinks, nodeById, spec.links],
  );

  const clearAnimation = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setSending(false);
    setActiveHopIdx(-1);
    setRouteHops([]);
  }, []);

  /* ---------------------------------------------------------- Aksi kabel & fault */

  const connectCableTo = useCallback(
    (cableId: string, targetNodeId: string) => {
      const cable = cableById.get(cableId);
      const link = linkByCable.get(cableId);
      if (!cable || !link) return;

      if (targetNodeId === cable.target) {
        setConnectedLinks((prev) => ({ ...prev, [link.id]: true }));
        setSelectedTrayCable(null);
        setHasil(null);
        sfx("click");
        addLog(`TERSAMBUNG — ${cable.label} → ${targetNodeId} terpasang.`, "ok");
        toast(`${cable.label} terpasang ke ${targetNodeId}.`, "ok");
      } else {
        sfx("reject");
        setRejectNodeId(targetNodeId);
        addLog(`DITOLAK — ${cable.reject}`, "error");
        toast(cable.reject, "error");
        window.setTimeout(() => setRejectNodeId(null), 450);
      }
    },
    [addLog, cableById, linkByCable],
  );

  const toggleLink = useCallback(
    (linkId: string) => {
      const link = spec.links.find((l) => l.id === linkId);
      if (!link) return;
      clearAnimation();
      setHasil(null);
      setConnectedLinks((prev) => {
        const nextVal = !prev[linkId];
        if (nextVal) {
          sfx("click");
          addLog(`Kabel ${link.from} → ${link.to} DIPASANG kembali.`, "ok");
        } else {
          sfx("detach");
          onTelemetry("fault_toggle");
          addLog(`Kabel ${link.from} → ${link.to} DICABUT.`, "error");
        }
        return { ...prev, [linkId]: nextVal };
      });
    },
    [addLog, clearAnimation, onTelemetry, spec.links],
  );

  const toggleCenterHardware = useCallback(() => {
    if (topoKey === "ring") return;
    clearAnimation();
    setHasil(null);
    setCenterOffline((prev) => {
      const next = !prev;
      const hwName = topoKey === "star" ? "SWITCH pusat" : "Kabel BACKBONE";
      if (next) {
        sfx("detach");
        onTelemetry("fault_toggle");
        addLog(`${hwName} DIMATIKAN / DIPUTUS (uji Single Point of Failure).`, "error");
      } else {
        sfx("click");
        addLog(`${hwName} diaktifkan kembali.`, "ok");
      }
      return next;
    });
  }, [addLog, clearAnimation, onTelemetry, topoKey]);

  /* ---------------------------------------------------------- Kirim paket ping */

  const kirimData = useCallback(
    (overrideFrom?: string, overrideTo?: string) => {
      const src = overrideFrom ?? dari;
      const dst = overrideTo ?? ke;
      if (overrideFrom) setDari(overrideFrom);
      if (overrideTo) setKe(overrideTo);

      clearAnimation();
      setHasil(null);

      const connectedSet = new Set(spec.links.filter((l) => connectedLinks[l.id]).map((l) => l.id));
      const offlineNodes = new Set<string>();
      if (centerOffline) {
        if (topoKey === "star") offlineNodes.add("SWITCH");
        if (topoKey === "bus") offlineNodes.add("BACKBONE");
      }

      const result = traceSandboxRoute(spec, src, dst, {
        connectedLinkIds: connectedSet,
        offlineNodes,
        dualRing,
      });

      if (!result.ok) {
        sfx("reject");
        setHasil({ ok: false, ms: 0, hops: 0, reason: result.reason });
        addLog(`GAGAL — ${src} → ${dst}: ${result.reason}`, "error");
        onTelemetry("ping_fail");
        return;
      }

      const hops = result.hops;
      setRouteHops(hops);
      setSending(true);
      setPacketPhase("req");
      sfx("click");
      addLog(`PING ${src} → ${dst} (${hops.length} hop${dualRing && topoKey === "ring" ? ", Ring Ganda" : ""})`);

      // Fase 1: ICMP Request menuju tujuan
      const hopDur = 520;
      hops.forEach((_, i) => {
        const t = setTimeout(() => {
          setPacketPhase("req");
          setActiveHopIdx(i);
        }, i * hopDur);
        timers.current.push(t);
      });

      // Fase 2: ACK Reply kembali (atau konfirmasi sampai)
      const totalReqMs = hops.length * hopDur;
      const ackTimer = setTimeout(() => {
        setPacketPhase("ack");
        setActiveHopIdx(hops.length - 1);
      }, totalReqMs);
      timers.current.push(ackTimer);

      const finishTimer = setTimeout(() => {
        const ms = 12 + hops.length * 14;
        setSending(false);
        setActiveHopIdx(-1);
        setHasil({ ok: true, ms, hops: hops.length, reason: result.reason });
        sfx("chime");
        addLog(`BALASAN diterima — ${ms} ms, ${hops.length} hop. ${result.reason}`, "ok");
        onTelemetry("ping_ok");
        onSimComplete();
      }, totalReqMs + 480);
      timers.current.push(finishTimer);
    },
    [
      addLog,
      centerOffline,
      clearAnimation,
      connectedLinks,
      dari,
      dualRing,
      ke,
      onSimComplete,
      onTelemetry,
      spec,
      topoKey,
    ],
  );

  /* ---------------------------------------------------------- Global pointer drag */

  useEffect(() => {
    if (!drag) return;

    const onMove = (e: PointerEvent) => {
      const pt = toSvgPoint(e.clientX, e.clientY);
      if (!pt) return;
      setPointer(pt);

      if (drag.kind === "node") {
        setPositions((prev) => ({
          ...prev,
          [drag.nodeId]: {
            x: clamp(pt.x - drag.offsetX, 75, viewDims.w - 75),
            y: clamp(pt.y - drag.offsetY, 65, viewDims.h - 75),
          },
        }));
        return;
      }

      if (drag.kind === "cable") {
        const nearest = findNearestNode(pt, drag.originNodeId);
        setHoverNodeId(nearest?.id ?? null);
        return;
      }

      if (drag.kind === "tool-cut") {
        const nearLink = findNearestConnectedLink(pt);
        setHoverLinkId(nearLink);
        const nearCenter = findNearestNode(pt);
        setHoverNodeId(
          nearCenter && (nearCenter.kind === "hub" || nearCenter.kind === "backbone")
            ? nearCenter.id
            : null,
        );
        return;
      }

      if (drag.kind === "tool-packet") {
        const nearPc = findNearestNode(pt);
        setHoverNodeId(nearPc && nearPc.kind === "pc" ? nearPc.id : null);
      }
    };

    const onUp = (e: PointerEvent) => {
      const pt = toSvgPoint(e.clientX, e.clientY);
      if (pt) {
        if (drag.kind === "cable") {
          const target = findNearestNode(pt, drag.originNodeId);
          if (target) {
            connectCableTo(drag.cableId, target.id);
          }
        } else if (drag.kind === "tool-cut") {
          const nearLink = findNearestConnectedLink(pt);
          if (nearLink) {
            toggleLink(nearLink);
          } else {
            const nearCenter = findNearestNode(pt);
            if (nearCenter && (nearCenter.kind === "hub" || nearCenter.kind === "backbone")) {
              toggleCenterHardware();
            }
          }
        } else if (drag.kind === "tool-packet") {
          const nearPc = findNearestNode(pt);
          if (nearPc && nearPc.kind === "pc") {
            const src = nearPc.id === dari ? pcs.find((p) => p.id !== nearPc.id)?.id ?? dari : dari;
            kirimData(src, nearPc.id);
          }
        }
      }

      setDrag(null);
      setPointer(null);
      setHoverNodeId(null);
      setHoverLinkId(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [
    connectCableTo,
    dari,
    drag,
    findNearestConnectedLink,
    findNearestNode,
    kirimData,
    pcs,
    toSvgPoint,
    toggleCenterHardware,
    toggleLink,
    viewDims.h,
    viewDims.w,
  ]);

  /* ---------------------------------------------------------- Skenario cepat */

  function applyPreset(preset: "all" | "empty" | "cut1" | "spof") {
    clearAnimation();
    setHasil(null);
    setSelectedTrayCable(null);
    if (preset === "all") {
      setConnectedLinks(Object.fromEntries(spec.links.map((l) => [l.id, true])));
      setCenterOffline(false);
      sfx("click");
      addLog("Skenario NORMAL — seluruh kabel tersambung & perangkat aktif.", "ok");
    } else if (preset === "empty") {
      setConnectedLinks(Object.fromEntries(spec.links.map((l) => [l.id, false])));
      setCenterOffline(false);
      sfx("detach");
      addLog("Mode RAKIT SENDIRI — tarik kabel dari Baki atau port PC ke perangkat tujuan!", "default");
      toast("Semua kabel dilepas ke Baki. Tarik & pasang langsung ke perangkatnya!", "default");
    } else if (preset === "cut1") {
      const next = Object.fromEntries(spec.links.map((l) => [l.id, true]));
      const firstId = spec.links[0]?.id;
      if (firstId) next[firstId] = false;
      setConnectedLinks(next);
      setCenterOffline(false);
      sfx("detach");
      onTelemetry("fault_toggle");
      addLog(`Skenario 1 KABEL PUTUS — ${spec.links[0]?.from} → ${spec.links[0]?.to} dicabut.`, "error");
    } else if (preset === "spof") {
      setConnectedLinks(Object.fromEntries(spec.links.map((l) => [l.id, true])));
      if (topoKey === "ring") {
        setDualRing(false);
        const midId = spec.links[1]?.id;
        if (midId) setConnectedLinks((p) => ({ ...p, [midId]: false }));
        addLog("Skenario GANGGUAN RING TUNGGAL — 1 ruas putus menghentikan cincin.", "error");
      } else {
        setCenterOffline(true);
        addLog(
          topoKey === "star"
            ? "Skenario SPOF — SWITCH pusat dimatikan!"
            : "Skenario SPOF — Kabel utama BACKBONE putus!",
          "error",
        );
      }
      sfx("detach");
      onTelemetry("fault_toggle");
    }
  }

  function resetPositions() {
    setPositions(Object.fromEntries(spec.nodes.map((n) => [n.id, { x: n.x, y: n.y }])));
    sfx("click");
    addLog("Tata letak perangkat dikembalikan ke posisi standar.");
  }

  /* ---------------------------------------------------------- Jalur animasi aktif */

  const activeMotionPath = useMemo(() => {
    if (activeHopIdx < 0 || !routeHops[activeHopIdx]) return null;
    const hop = routeHops[activeHopIdx];
    const fromNode = nodeById.get(packetPhase === "ack" ? hop.to : hop.from);
    const toNode = nodeById.get(packetPhase === "ack" ? hop.from : hop.to);
    if (!fromNode || !toNode) return null;
    return linkPath(fromNode, toNode);
  }, [activeHopIdx, nodeById, packetPhase, routeHops]);

  const activeNodeId = useMemo(() => {
    if (activeHopIdx < 0 || !routeHops[activeHopIdx]) return null;
    const hop = routeHops[activeHopIdx];
    return packetPhase === "ack" ? hop.from : hop.to;
  }, [activeHopIdx, packetPhase, routeHops]);

  // Kabel bayangan saat pengguna sedang menarik kabel langsung di kanvas
  const ghostWirePath = useMemo(() => {
    if (!drag || drag.kind !== "cable" || !pointer) return null;
    const origin = nodeById.get(drag.originNodeId);
    if (!origin) return null;
    const a = portAnchor(origin, pointer);
    const midY = (a.y + pointer.y) / 2;
    return `M ${a.x} ${a.y} C ${a.x} ${midY}, ${pointer.x} ${midY}, ${pointer.x} ${pointer.y}`;
  }, [drag, nodeById, pointer]);

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
      {/* ================================================================== */}
      {/* KOLOM KIRI: MEJA KERJA INTERAKTIF + BAKI ALAT & KABEL              */}
      {/* ================================================================== */}
      <div className="space-y-4">
        {/* Toolbar skenario & tombol perangkat keras */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-micro text-ink-3">Skenario cepat:</span>
            <Btn type="button" size="sm" tone="ghost" onClick={() => applyPreset("empty")}>
              Rakit dari kosong
            </Btn>
            <Btn type="button" size="sm" tone="ghost" onClick={() => applyPreset("all")}>
              Sambung semua
            </Btn>
            <Btn type="button" size="sm" tone="ghost" onClick={() => applyPreset("cut1")}>
              Cabut 1 kabel
            </Btn>
            <Btn type="button" size="sm" tone="danger" onClick={() => applyPreset("spof")}>
              {topoKey === "star"
                ? "Matikan Switch"
                : topoKey === "bus"
                  ? "Putus Backbone"
                  : "Putus Cincin"}
            </Btn>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {topoKey === "ring" && (
              <Btn
                type="button"
                size="sm"
                tone={dualRing ? "primary" : "signal"}
                onClick={() => {
                  setDualRing((v) => {
                    const next = !v;
                    sfx("click");
                    addLog(
                      next
                        ? "Mode RING GANDA aktif — jalur cadangan berlawanan arah tersedia."
                        : "Mode RING TUNGGAL aktif — data mengalir satu arah saja.",
                      next ? "ok" : "default",
                    );
                    return next;
                  });
                }}
              >
                {dualRing ? "Ring Ganda (Aktif)" : "Ring Tunggal (1 Arah)"}
              </Btn>
            )}
            <Btn type="button" size="sm" tone="quiet" onClick={resetPositions}>
              <IconRefresh size={13} /> Reset posisi
            </Btn>
          </div>
        </div>

        {/* Kanvas Meja Kerja Interaktif */}
        <section className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-2 px-4 py-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="text-caption font-semibold text-ink">
                Meja Kerja Interaktif — {spec.title}
              </p>
              <Badge tone={connectedCount === spec.links.length && !centerOffline ? "green" : "amber"}>
                {connectedCount}/{spec.links.length} kabel terpasang
              </Badge>
              {centerOffline && (
                <Badge tone="red">
                  <IconWarning size={11} />{" "}
                  {topoKey === "star" ? "SWITCH MATI" : "BACKBONE PUTUS"}
                </Badge>
              )}
            </div>
            <span className="font-mono text-micro text-ink-3">
              Seret PC · Tarik port kabel · Klik tengah kabel untuk cabut/pasang
            </span>
          </div>

          <div className="lab-grid relative select-none p-3 sm:p-4">
            <svg
              ref={svgRef}
              viewBox={spec.viewBox}
              className="h-auto w-full touch-none"
              role="img"
              aria-label={`Meja kerja interaktif simulasi ${info.title}`}
            >
              {/* 1. Jalur panduan putus-putus untuk kabel yang sedang terlepas */}
              {spec.links.map((l) => {
                if (connectedLinks[l.id]) return null;
                const from = nodeById.get(l.from);
                const to = nodeById.get(l.to);
                if (!from || !to) return null;
                const d = linkPath(from, to);
                const mid = bezierMidpoint(
                  portAnchor(from, to),
                  portAnchor(to, from),
                  to.kind,
                  from.kind,
                );
                return (
                  <g key={`ghost-${l.id}`}>
                    <path
                      d={d}
                      fill="none"
                      stroke="var(--color-fault)"
                      strokeOpacity={0.38}
                      strokeWidth={3}
                      strokeDasharray="6 7"
                    />
                    {/* Tombol pasang cepat langsung di tengah kabel putus */}
                    <g
                      role="button"
                      tabIndex={0}
                      aria-label={`Pasang kembali kabel ${l.from} ke ${l.to}`}
                      onClick={() => toggleLink(l.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleLink(l.id);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={mid.x}
                        cy={mid.y}
                        r={16}
                        fill="var(--color-fault-tint)"
                        stroke="var(--color-fault)"
                        strokeWidth={2}
                      />
                      <path
                        d={`M ${mid.x - 5} ${mid.y - 5} L ${mid.x + 5} ${mid.y + 5} M ${mid.x + 5} ${mid.y - 5} L ${mid.x - 5} ${mid.y + 5}`}
                        stroke="var(--color-fault)"
                        strokeWidth={2.4}
                        strokeLinecap="round"
                      />
                      <title>Kabel putus — klik untuk pasang kembali</title>
                    </g>
                  </g>
                );
              })}

              {/* 2. Kabel aktif yang terpasang */}
              {spec.links.map((l) => {
                if (!connectedLinks[l.id]) return null;
                const from = nodeById.get(l.from);
                const to = nodeById.get(l.to);
                if (!from || !to) return null;
                const d = linkPath(from, to);
                const mid = bezierMidpoint(
                  portAnchor(from, to),
                  portAnchor(to, from),
                  to.kind,
                  from.kind,
                );
                const isRoute = routeHops.some((h) => h.linkId === l.id);
                const isCutHover = hoverLinkId === l.id;

                return (
                  <g key={l.id}>
                    {/* Garis kabel ganda tipis saat mode Ring Ganda aktif */}
                    {topoKey === "ring" && dualRing && (
                      <path
                        d={d}
                        fill="none"
                        stroke="var(--color-ok)"
                        strokeOpacity={0.28}
                        strokeWidth={11}
                        strokeLinecap="round"
                      />
                    )}
                    <path
                      d={d}
                      fill="none"
                      stroke={
                        isCutHover
                          ? "var(--color-fault)"
                          : isRoute
                            ? "var(--color-signal-bright)"
                            : centerOffline
                              ? "var(--color-ink-4)"
                              : "var(--color-signal)"
                      }
                      strokeWidth={isRoute ? 5.5 : 4}
                      strokeLinecap="round"
                      className={isRoute && !centerOffline ? "trace-live" : undefined}
                    />
                    {/* Hitbox & pegangan tengah kabel untuk klik langsung cabut */}
                    <g
                      role="button"
                      tabIndex={0}
                      aria-label={`Cabut kabel ${l.from} ke ${l.to}`}
                      onClick={() => toggleLink(l.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleLink(l.id);
                        }
                      }}
                      className="cursor-pointer opacity-75 transition-opacity hover:opacity-100"
                    >
                      <circle
                        cx={mid.x}
                        cy={mid.y}
                        r={13}
                        fill={isCutHover ? "var(--color-fault)" : "var(--color-surface-2)"}
                        stroke={isCutHover ? "var(--color-fault)" : "var(--color-border-2)"}
                        strokeWidth={1.8}
                      />
                      <circle
                        cx={mid.x}
                        cy={mid.y}
                        r={3.5}
                        fill={isCutHover ? "#fff" : "var(--color-ok)"}
                      />
                      <title>Klik untuk mencabut kabel {l.from} → {l.to}</title>
                    </g>
                  </g>
                );
              })}

              {/* 3. Kabel karet hidup saat ditarik pointer */}
              {ghostWirePath && pointer && (
                <g className="pointer-events-none">
                  <path
                    d={ghostWirePath}
                    fill="none"
                    stroke="var(--color-signal-bright)"
                    strokeWidth={4.5}
                    strokeDasharray="10 6"
                    strokeLinecap="round"
                  />
                  <circle
                    cx={pointer.x}
                    cy={pointer.y}
                    r={9}
                    fill="var(--color-ok)"
                    stroke="#061810"
                    strokeWidth={2}
                  />
                </g>
              )}

              {/* 4. Animasi paket data ICMP / ACK */}
              {activeMotionPath && (
                <g key={`${packetPhase}-${activeHopIdx}`} className="pointer-events-none">
                  <circle
                    r={11}
                    fill={packetPhase === "ack" ? "var(--color-ok)" : "var(--color-signal-bright)"}
                    stroke="#061810"
                    strokeWidth={2}
                  >
                    <animateMotion dur="0.5s" fill="freeze" path={activeMotionPath} />
                  </circle>
                  <text
                    y={-15}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={700}
                    fontFamily="var(--font-plex-mono)"
                    fill={packetPhase === "ack" ? "var(--color-ok)" : "var(--color-signal-bright)"}
                    stroke={GRID_BG}
                    strokeWidth={4}
                    paintOrder="stroke"
                  >
                    {packetPhase === "ack" ? "ACK" : "ICMP"}
                    <animateMotion dur="0.5s" fill="freeze" path={activeMotionPath} />
                  </text>
                </g>
              )}

              {/* 5. Perangkat (PC, Switch, Backbone) — dapat diseret & menerima drop! */}
              {liveNodes.map((n) => {
                const isHoverTarget = hoverNodeId === n.id;
                const isReject = rejectNodeId === n.id;
                const isPacketLit = activeNodeId === n.id;
                const isSrc = n.id === dari;
                const isDst = n.id === ke;

                if (n.kind === "pc") {
                  const ownCable = spec.cables.find((c) => c.origin === n.id);
                  const ownLink = ownCable ? linkByCable.get(ownCable.id) : undefined;
                  const ownConnected = ownLink ? !!connectedLinks[ownLink.id] : false;
                  const portPt = portAnchor(n);

                  return (
                    <g
                      key={n.id}
                      className={isReject ? "shake" : undefined}
                      onClick={() => {
                        if (selectedTrayCable) {
                          connectCableTo(selectedTrayCable, n.id);
                        }
                      }}
                    >
                      {/* Cincin sorot saat menjadi sasaran drop */}
                      {(isHoverTarget || isPacketLit || selectedTrayCable) && (
                        <circle
                          cx={n.x}
                          cy={n.y}
                          r={56}
                          fill={
                            isHoverTarget
                              ? "rgba(47, 209, 122, 0.14)"
                              : isPacketLit
                                ? "rgba(92, 225, 246, 0.15)"
                                : "transparent"
                          }
                          stroke={
                            isReject
                              ? "var(--color-fault)"
                              : isHoverTarget
                                ? "var(--color-ok)"
                                : "var(--color-signal)"
                          }
                          strokeWidth={isHoverTarget ? 3 : 1.5}
                          strokeDasharray={isHoverTarget ? undefined : "5 5"}
                        />
                      )}

                      {/* Badan PC — bisa diseret langsung untuk atur posisi di meja lab */}
                      <g
                        className="cursor-grab active:cursor-grabbing"
                        onPointerDown={(e) => {
                          if (selectedTrayCable) return;
                          e.stopPropagation();
                          const pt = toSvgPoint(e.clientX, e.clientY);
                          if (!pt) return;
                          setDrag({
                            kind: "node",
                            nodeId: n.id,
                            offsetX: pt.x - n.x,
                            offsetY: pt.y - n.y,
                          });
                        }}
                      >
                        <rect
                          x={n.x - 36}
                          y={n.y - 28}
                          width={72}
                          height={40}
                          rx={5}
                          fill="var(--color-surface)"
                          stroke={
                            isReject
                              ? "var(--color-fault)"
                              : isHoverTarget
                                ? "var(--color-ok)"
                                : isSrc
                                  ? "var(--color-signal-bright)"
                                  : isDst
                                    ? "var(--color-ok)"
                                    : "var(--color-border-2)"
                          }
                          strokeWidth={isSrc || isDst || isHoverTarget ? 2.8 : 2}
                        />
                        <rect
                          x={n.x - 27}
                          y={n.y - 21}
                          width={54}
                          height={24}
                          rx={2}
                          fill={GRID_BG}
                          stroke="var(--color-border-2)"
                          strokeWidth={1.2}
                        />
                        {/* LED Status Koneksi */}
                        <circle
                          cx={n.x + 25}
                          cy={n.y + 6}
                          r={3}
                          fill={
                            isPacketLit
                              ? "var(--color-caution)"
                              : ownConnected && !centerOffline
                                ? "var(--color-ok)"
                                : "var(--color-fault)"
                          }
                        />
                        {/* Penyangga monitor */}
                        <path
                          d={`M ${n.x - 16} ${n.y + 12} h 32 M ${n.x - 10} ${n.y + 12} v 8 M ${n.x + 10} ${n.y + 12} v 8`}
                          stroke="var(--color-border-2)"
                          strokeWidth={2}
                        />
                        {/* Lencana SRC / DST */}
                        {(isSrc || isDst) && (
                          <g>
                            <rect
                              x={n.x - 24}
                              y={n.y - 48}
                              width={48}
                              height={17}
                              rx={3}
                              fill={isSrc ? "var(--color-signal-tint)" : "var(--color-ok-tint)"}
                              stroke={isSrc ? "var(--color-signal)" : "var(--color-ok)"}
                              strokeWidth={1.2}
                            />
                            <text
                              x={n.x}
                              y={n.y - 36}
                              textAnchor="middle"
                              fontSize={10}
                              fontWeight={700}
                              fontFamily="var(--font-plex-mono)"
                              fill={isSrc ? "var(--color-signal-bright)" : "var(--color-ok)"}
                            >
                              {isSrc ? "ASAL" : "TUJUAN"}
                            </text>
                          </g>
                        )}
                        <text
                          x={n.x}
                          y={n.y - 5}
                          textAnchor="middle"
                          fontSize={13}
                          fontWeight={600}
                          fontFamily="var(--font-plex-mono)"
                          fill="var(--color-ink)"
                        >
                          {n.id}
                        </text>
                        <title>{n.id} — seret untuk menggeser posisi</title>
                      </g>

                      {/* Soket Port RJ-45 — tarik langsung dari soket untuk memasang kabel! */}
                      {ownCable && (
                        <g
                          className={
                            ownConnected
                              ? "cursor-pointer"
                              : "cursor-crosshair"
                          }
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            if (ownConnected && ownLink) {
                              toggleLink(ownLink.id);
                              return;
                            }
                            const pt = toSvgPoint(e.clientX, e.clientY);
                            setPointer(pt);
                            setDrag({
                              kind: "cable",
                              cableId: ownCable.id,
                              originNodeId: n.id,
                              fromTray: false,
                            });
                          }}
                        >
                          <circle
                            cx={portPt.x}
                            cy={portPt.y}
                            r={10}
                            fill={ownConnected ? "var(--color-ok-tint)" : "var(--color-signal-tint)"}
                            stroke={ownConnected ? "var(--color-ok)" : "var(--color-signal-bright)"}
                            strokeWidth={2}
                          />
                          <circle
                            cx={portPt.x}
                            cy={portPt.y}
                            r={3.5}
                            fill={ownConnected ? "var(--color-ok)" : "var(--color-signal-bright)"}
                          />
                          <title>
                            {ownConnected
                              ? `Port ${n.id} tersambung — klik untuk mencabut`
                              : `Port ${n.id} kosong — tarik ke perangkat tujuan untuk memasang kabel`}
                          </title>
                        </g>
                      )}
                    </g>
                  );
                }

                if (n.kind === "hub") {
                  return (
                    <g
                      key={n.id}
                      className={isReject ? "shake" : undefined}
                      onClick={() => {
                        if (selectedTrayCable) {
                          connectCableTo(selectedTrayCable, n.id);
                        } else {
                          toggleCenterHardware();
                        }
                      }}
                    >
                      {(isHoverTarget || isPacketLit) && (
                        <rect
                          x={n.x - 66}
                          y={n.y - 40}
                          width={132}
                          height={80}
                          rx={10}
                          fill="rgba(47, 209, 122, 0.14)"
                          stroke={isHoverTarget ? "var(--color-ok)" : "var(--color-signal-bright)"}
                          strokeWidth={2.5}
                        />
                      )}
                      <g className="cursor-pointer">
                        <rect
                          x={n.x - 56}
                          y={n.y - 30}
                          width={112}
                          height={60}
                          rx={6}
                          fill={centerOffline ? "var(--color-fault-tint)" : "var(--color-surface-2)"}
                          stroke={
                            centerOffline
                              ? "var(--color-fault)"
                              : isHoverTarget
                                ? "var(--color-ok)"
                                : "var(--color-ok)"
                          }
                          strokeWidth={2.6}
                        />
                        {/* Barisan LED Port pada Switch */}
                        {[0, 1, 2, 3, 4].map((idx) => (
                          <circle
                            key={idx}
                            cx={n.x - 32 + idx * 16}
                            cy={n.y - 16}
                            r={3}
                            fill={
                              centerOffline
                                ? "var(--color-fault)"
                                : idx < connectedCount
                                  ? "var(--color-ok)"
                                  : "var(--color-ink-4)"
                            }
                          />
                        ))}
                        <text
                          x={n.x}
                          y={n.y + 6}
                          textAnchor="middle"
                          fontSize={17}
                          fontWeight={700}
                          fontFamily="var(--font-plex-mono)"
                          fill={centerOffline ? "var(--color-fault)" : "var(--color-ok)"}
                        >
                          {centerOffline ? "OFFLINE" : "SWITCH"}
                        </text>
                        <text
                          x={n.x}
                          y={n.y + 22}
                          textAnchor="middle"
                          fontSize={10}
                          fontFamily="var(--font-plex-sans)"
                          fill="var(--color-ink-3)"
                        >
                          {centerOffline ? "Klik untuk hidupkan" : "Klik untuk matikan"}
                        </text>
                        <title>SWITCH pusat — terima drop kabel atau klik untuk uji mati daya</title>
                      </g>
                    </g>
                  );
                }

                // BACKBONE (Topologi Bus)
                return (
                  <g
                    key={n.id}
                    className="cursor-pointer"
                    onClick={() => {
                      if (selectedTrayCable) {
                        connectCableTo(selectedTrayCable, n.id);
                      } else {
                        toggleCenterHardware();
                      }
                    }}
                  >
                    {isHoverTarget && (
                      <rect
                        x={52}
                        y={n.y - 20}
                        width={896}
                        height={40}
                        rx={8}
                        fill="rgba(47, 209, 122, 0.14)"
                        stroke="var(--color-ok)"
                        strokeWidth={2.5}
                      />
                    )}
                    {/* Terminator kiri & kanan */}
                    <rect
                      x={40}
                      y={n.y - 14}
                      width={22}
                      height={28}
                      rx={3}
                      fill="var(--color-caution-tint)"
                      stroke="var(--color-caution)"
                      strokeWidth={2}
                    />
                    <rect
                      x={938}
                      y={n.y - 14}
                      width={22}
                      height={28}
                      rx={3}
                      fill="var(--color-caution-tint)"
                      stroke="var(--color-caution)"
                      strokeWidth={2}
                    />
                    <rect
                      x={62}
                      y={n.y - 10}
                      width={876}
                      height={20}
                      rx={4}
                      fill={centerOffline ? "var(--color-fault-tint)" : "var(--color-surface-2)"}
                      stroke={centerOffline ? "var(--color-fault)" : "var(--color-signal)"}
                      strokeWidth={2.2}
                      strokeDasharray={centerOffline ? "12 10" : undefined}
                    />
                    <text
                      x={500}
                      y={n.y + 34}
                      textAnchor="middle"
                      fontSize={13}
                      fontFamily="var(--font-plex-mono)"
                      fill={centerOffline ? "var(--color-fault)" : "var(--color-ink-2)"}
                    >
                      {centerOffline
                        ? "BACKBONE PUTUS — klik untuk sambung kembali"
                        : "BACKBONE UTAMA (Terminator di ujung) — tarik kabel PC ke sini atau klik untuk uji putus"}
                    </text>
                  </g>
                );
              })}

              {/* 6. Visual kursor saat menyeret alat Pemutus atau Paket */}
              {drag && pointer && (drag.kind === "tool-cut" || drag.kind === "tool-packet") && (
                <g className="pointer-events-none">
                  <circle
                    cx={pointer.x}
                    cy={pointer.y}
                    r={18}
                    fill={
                      drag.kind === "tool-cut"
                        ? "var(--color-fault-tint)"
                        : "var(--color-signal-tint)"
                    }
                    stroke={
                      drag.kind === "tool-cut" ? "var(--color-fault)" : "var(--color-signal-bright)"
                    }
                    strokeWidth={2.5}
                  />
                  <text
                    x={pointer.x}
                    y={pointer.y + 4}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={700}
                    fontFamily="var(--font-plex-mono)"
                    fill={
                      drag.kind === "tool-cut" ? "var(--color-fault)" : "var(--color-signal-bright)"
                    }
                  >
                    {drag.kind === "tool-cut" ? "PUTUS" : "PING"}
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* ============================================================== */}
          {/* BAKI ALAT & KABEL (DRAG & DROP INTERAKTIF)                     */}
          {/* ============================================================== */}
          <div className="border-t border-border bg-surface-2/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-caption font-semibold text-ink">
                Baki Alat & Kabel (Tarik langsung ke kanvas di atas!)
              </p>
              {selectedTrayCable && (
                <span className="font-mono text-micro text-signal-bright">
                  Kabel dipilih — klik perangkat sasaran di kanvas untuk memasang
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              {/* Alat 1: Token Paket Ping (drag ke PC tujuan!) */}
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  setSelectedTrayCable(null);
                  setPointer(toSvgPoint(e.clientX, e.clientY));
                  setDrag({ kind: "tool-packet" });
                }}
                onClick={() => kirimData()}
                className="inline-flex cursor-grab items-center gap-2 rounded-md border border-signal/50 bg-signal-tint px-3.5 py-2 text-caption font-medium text-signal-bright transition-colors hover:border-signal active:cursor-grabbing"
              >
                <IconPulse size={15} />
                Seret Paket Ping ke PC Tujuan
              </button>

              {/* Alat 2: Alat Pemutus Gangguan (drag ke kabel atau Switch/Backbone!) */}
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  setSelectedTrayCable(null);
                  setPointer(toSvgPoint(e.clientX, e.clientY));
                  setDrag({ kind: "tool-cut" });
                }}
                onClick={() =>
                  toast(
                    "Tahan & seret tombol ini lalu lepaskan di atas kabel, Switch, atau Backbone untuk memutusnya!",
                    "default",
                  )
                }
                className="inline-flex cursor-grab items-center gap-2 rounded-md border border-fault/50 bg-fault-tint px-3.5 py-2 text-caption font-medium text-fault transition-colors hover:border-fault active:cursor-grabbing"
              >
                <IconCross size={14} />
                Seret Pemutus ke Kabel / Pusat
              </button>

              <span className="hidden h-6 w-px bg-border sm:inline-block" aria-hidden="true" />

              {/* Daftar Kabel Lepas di Baki (bisa di-drag ke perangkat atau klik untuk keyboard!) */}
              {looseCables.length === 0 ? (
                <span className="inline-flex items-center gap-1.5 font-mono text-micro text-ok">
                  <IconCheck size={13} /> Semua kabel terpasang di meja kerja
                </span>
              ) : (
                looseCables.map((c) => {
                  const activeSel = selectedTrayCable === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onPointerDown={(e) => {
                        setPointer(toSvgPoint(e.clientX, e.clientY));
                        setDrag({
                          kind: "cable",
                          cableId: c.id,
                          originNodeId: c.origin,
                          fromTray: true,
                        });
                      }}
                      onClick={() => setSelectedTrayCable(activeSel ? null : c.id)}
                      aria-pressed={activeSel}
                      className={cx(
                        "inline-flex cursor-grab items-center gap-2 rounded-md border px-3 py-2 font-mono text-micro font-medium transition-colors active:cursor-grabbing",
                        activeSel
                          ? "border-ok bg-ok-tint text-ok"
                          : "border-caution/45 bg-caution-tint/70 text-caution hover:border-caution",
                      )}
                    >
                      <IconPlug size={13} />
                      {c.label}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Panel kendali ping cepat (tetap ada untuk aksesibilitas keyboard & E2E) */}
          <div className="grid gap-3 border-t border-border p-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-micro font-medium text-ink-3">Dari komputer</span>
              <select
                value={dari}
                onChange={(e) => setDari(e.target.value)}
                className="rounded-md border border-border-2 bg-canvas px-3 py-2 font-mono text-caption text-ink focus:border-signal focus:outline-none"
              >
                {pcs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-micro font-medium text-ink-3">Ke komputer</span>
              <select
                value={ke}
                onChange={(e) => setKe(e.target.value)}
                className="rounded-md border border-border-2 bg-canvas px-3 py-2 font-mono text-caption text-ink focus:border-signal focus:outline-none"
              >
                {pcs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id}
                  </option>
                ))}
              </select>
            </label>
            <Btn onClick={() => kirimData()} disabled={sending} size="lg" className="sm:col-span-2">
              <IconArrow size={15} /> {sending ? "Mengirim paket…" : "Kirim data (ping)"}
            </Btn>
          </div>
        </section>
      </div>

      {/* ================================================================== */}
      {/* PANEL SAMPING: KONDISI KONEKSI, KONTROL KABEL & LOG                */}
      {/* ================================================================== */}
      <aside className="space-y-5">
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="border-b border-border bg-surface-2 px-4 py-2.5">
            <p className="text-caption font-semibold text-ink">Kondisi koneksi</p>
          </div>
          <div className="space-y-3 p-4">
            {hasil ? (
              <div
                className={
                  hasil.ok
                    ? "rounded-md border border-ok/40 bg-ok-tint p-3.5"
                    : "rounded-md border border-fault/40 bg-fault-tint p-3.5"
                }
              >
                <p className={cx("text-micro font-semibold", hasil.ok ? "text-ok" : "text-fault")}>
                  {hasil.ok ? "Koneksi aktif" : "Pengiriman gagal"}
                </p>
                <p className="mt-1 font-mono text-head font-bold text-ink">
                  {hasil.ok ? `${hasil.ms} ms` : "Timeout"}
                </p>
                <p className="mt-1 text-caption text-ink-2">
                  {hasil.ok
                    ? `Paket melalui ${hasil.hops} hop. ${hasil.reason}`
                    : hasil.reason}
                </p>
              </div>
            ) : (
              <p className="text-caption text-ink-3">
                Seret paket Ping ke salah satu PC atau tekan “Kirim data (ping)” untuk melihat
                aliran paket secara langsung.
              </p>
            )}

            <div className="border-t border-border pt-3">
              <p className="text-micro text-ink-3">Status fisik meja lab</p>
              <p className="mt-1 font-mono text-caption text-ink">
                {connectedCount}/{spec.links.length} kabel aktif ·{" "}
                {centerOffline ? "Pusat MATI" : "Pusat ON"}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="border-b border-border bg-surface-2 px-4 py-2.5">
            <p className="text-caption font-semibold text-ink">Uji gangguan kabel</p>
          </div>
          <ul className="divide-y divide-border-3">
            {spec.links.map((l) => {
              const installed = !!connectedLinks[l.id];
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => toggleLink(l.id)}
                    className="flex w-full cursor-pointer items-center justify-between gap-2 px-4 py-2.5 text-left transition-colors hover:bg-surface-2"
                  >
                    <span className="inline-flex items-center gap-2 font-mono text-micro text-ink-2">
                      <IconPlug size={13} className={installed ? "text-signal" : "text-fault"} />
                      {l.from} → {l.to}
                    </span>
                    <span
                      className={cx(
                        "inline-flex items-center gap-1 text-micro font-medium",
                        installed ? "text-fault" : "text-ok",
                      )}
                    >
                      {installed ? "Cabut" : "Pasang"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="border-b border-border bg-surface-2 px-4 py-2.5">
            <p className="text-caption font-semibold text-ink">Log jaringan</p>
          </div>
          <div className="max-h-56 overflow-y-auto bg-canvas/70 p-3">
            {log.length === 0 ? (
              <p className="font-mono text-micro text-ink-4">Belum ada aktivitas.</p>
            ) : (
              <div className="space-y-1.5">
                {log.map((l) => (
                  <p key={l.id} className="flex gap-2 font-mono text-micro leading-relaxed">
                    <span className="shrink-0 text-ink-4">{l.time}</span>
                    <span
                      className={
                        l.tone === "ok"
                          ? "text-ok"
                          : l.tone === "error"
                            ? "text-fault"
                            : "text-ink-2"
                      }
                    >
                      {l.text}
                    </span>
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        <Callout tone="note" label="Cara bereksperimen langsung">
          <ul className="list-disc space-y-1 pl-4">
            <li>
              <strong>Geser perangkat:</strong> tarik badan PC mana saja di grid, kabel ikut lentur.
            </li>
            <li>
              <strong>Pasang / cabut langsung:</strong> klik titik tengah kabel, tarik dari soket
              port, atau seret kabel & alat pemutus dari Baki Alat.
            </li>
            <li>
              <strong>Uji SPOF:</strong> klik Switch/Backbone (atau aktifkan Ring Ganda pada Ring).
            </li>
          </ul>
        </Callout>
      </aside>
    </div>
  );
}
