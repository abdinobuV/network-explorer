/**
 * Model topologi jaringan.
 *
 * Satu file ini mendefinisikan Bus, Ring, dan Star: perangkatnya, letaknya,
 * kabel yang tersedia, dan **sasaran drop yang berbeda untuk tiap topologi**.
 *
 * Inilah yang membuat ketiga level terasa berbeda secara materi, bukan hanya
 * gambarnya:
 *   Bus  → setiap PC disambung ke satu backbone.
 *   Ring → setiap PC disambung ke PC berikutnya searah jarum jam, sampai cincin tertutup.
 *   Star → setiap PC disambung ke satu switch pusat.
 */

import type { TopoKey } from "@/lib/progression";

export type NodeKind = "pc" | "hub" | "backbone";

export interface TopoNode {
  id: string;
  kind: NodeKind;
  /** Nama yang tampil, mis. "PC-01". */
  label: string;
  /** Keterangan tambahan di bawah label. */
  caption?: string;
  x: number;
  y: number;
  /** Nomor port pada perangkat. */
  port: number;
}

export interface TopoLink {
  id: string;
  from: string;
  to: string;
  /** Id kabel yang membentuk tautan ini. */
  cable: string;
}

export interface Cable {
  id: string;
  /** Label kabel di palet, mis. "Kabel PC-01". */
  label: string;
  /** Node asal kabel. */
  origin: string;
  /** Sasaran drop yang sah (node id). */
  target: string;
  /** Alasan bila drop ditolak. */
  reject: string;
}

export interface TopoSpec {
  key: TopoKey;
  title: string;
  subtitle: string;
  /** Aturan pemasangan, ditampilkan sebagai instruksi utama. */
  rule: string;
  /** Penjelasan singkat untuk halaman materi. */
  summary: string;
  nodes: TopoNode[];
  links: TopoLink[];
  cables: Cable[];
  viewBox: string;
  /** Jumlah port yang tersedia pada perangkat pusat (untuk status). */
  hubPorts: number;
}

const pc = (id: string, x: number, y: number, port: number): TopoNode => ({
  id,
  kind: "pc",
  label: id,
  caption: "Komputer",
  x,
  y,
  port,
});

/* ------------------------------------------------------------------ BUS */

const BUS: TopoSpec = {
  key: "bus",
  title: "Topologi Bus",
  subtitle: "Satu backbone, banyak cabang",
  rule: "Tarik setiap kabel ke BACKBONE. Semua komputer berbagi satu jalur utama.",
  summary:
    "Semua komputer tersambung ke satu kabel utama (backbone) yang berjalan melewati seluruh ruang kerja.",
  viewBox: "0 0 1000 620",
  hubPorts: 8,
  nodes: [
    pc("PC-01", 140, 170, 1),
    pc("PC-02", 380, 170, 2),
    pc("PC-03", 620, 170, 3),
    pc("PC-04", 860, 170, 4),
    {
      id: "BACKBONE",
      kind: "backbone",
      label: "BACKBONE",
      caption: "Kabel utama — 8 port",
      x: 500,
      y: 470,
      port: 1,
    },
  ],
  links: [
    { id: "bus-1", from: "PC-01", to: "BACKBONE", cable: "cable-pc1" },
    { id: "bus-2", from: "PC-02", to: "BACKBONE", cable: "cable-pc2" },
    { id: "bus-3", from: "PC-03", to: "BACKBONE", cable: "cable-pc3" },
    { id: "bus-4", from: "PC-04", to: "BACKBONE", cable: "cable-pc4" },
  ],
  cables: [
    {
      id: "cable-pc1",
      label: "Kabel PC-01",
      origin: "PC-01",
      target: "BACKBONE",
      reject: "Pada topologi Bus, setiap PC hanya boleh disambung ke BACKBONE.",
    },
    {
      id: "cable-pc2",
      label: "Kabel PC-02",
      origin: "PC-02",
      target: "BACKBONE",
      reject: "Pada topologi Bus, setiap PC hanya boleh disambung ke BACKBONE.",
    },
    {
      id: "cable-pc3",
      label: "Kabel PC-03",
      origin: "PC-03",
      target: "BACKBONE",
      reject: "Pada topologi Bus, setiap PC hanya boleh disambung ke BACKBONE.",
    },
    {
      id: "cable-pc4",
      label: "Kabel PC-04",
      origin: "PC-04",
      target: "BACKBONE",
      reject: "Pada topologi Bus, setiap PC hanya boleh disambung ke BACKBONE.",
    },
  ],
};

/* ------------------------------------------------------------------ RING */

const RING_NODES = [
  pc("PC-01", 500, 105, 1),
  pc("PC-02", 700, 300, 2),
  pc("PC-03", 500, 495, 3),
  pc("PC-04", 300, 300, 4),
];

/** Ring: kabel berarah searah jarum jam, tujuannya PC berikutnya. */
const RING: TopoSpec = {
  key: "ring",
  title: "Topologi Ring",
  subtitle: "Lingkaran tertutup, data mengalir searah jarum jam",
  rule:
    "Tarik setiap kabel ke PC berikutnya searah jarum jam. Cincin baru tertutup setelah semua tersambung.",
  summary:
    "Setiap komputer tersambung ke dua tetangganya sehingga membentuk satu lingkaran tertutup. Data hanya mengalir satu arah.",
  viewBox: "0 0 1000 600",
  hubPorts: 2,
  nodes: RING_NODES,
  links: [
    { id: "ring-1", from: "PC-01", to: "PC-02", cable: "cable-pc1" },
    { id: "ring-2", from: "PC-02", to: "PC-03", cable: "cable-pc2" },
    { id: "ring-3", from: "PC-03", to: "PC-04", cable: "cable-pc3" },
    { id: "ring-4", from: "PC-04", to: "PC-01", cable: "cable-pc4" },
  ],
  cables: [
    {
      id: "cable-pc1",
      label: "Kabel PC-01",
      origin: "PC-01",
      target: "PC-02",
      reject: "Kabel PC-01 harus menuju PC-02 (arah jarum jam).",
    },
    {
      id: "cable-pc2",
      label: "Kabel PC-02",
      origin: "PC-02",
      target: "PC-03",
      reject: "Kabel PC-02 harus menuju PC-03 (arah jarum jam).",
    },
    {
      id: "cable-pc3",
      label: "Kabel PC-03",
      origin: "PC-03",
      target: "PC-04",
      reject: "Kabel PC-03 harus menuju PC-04 (arah jarum jam).",
    },
    {
      id: "cable-pc4",
      label: "Kabel PC-04",
      origin: "PC-04",
      target: "PC-01",
      reject: "Kabel PC-04 harus menuju PC-01 agar cincin tertutup.",
    },
  ],
};

/* ------------------------------------------------------------------ STAR */

const STAR_NODES = [
  pc("PC-01", 500, 100, 1),
  pc("PC-02", 760, 215, 2),
  pc("PC-03", 660, 490, 3),
  pc("PC-04", 340, 490, 4),
  pc("PC-05", 240, 215, 5),
];

const STAR: TopoSpec = {
  key: "star",
  title: "Topologi Star",
  subtitle: "Semua komputer tersambung ke satu switch pusat",
  rule: "Tarik setiap kabel ke SWITCH di tengah. Tidak ada komputer yang saling tersambung langsung.",
  summary:
    "Semua komputer tersambung ke satu perangkat pusat (switch). Jika satu kabel putus, komputer lain tetap saling terhubung.",
  viewBox: "0 0 1000 600",
  hubPorts: 8,
  nodes: [
    ...STAR_NODES,
    {
      id: "SWITCH",
      kind: "hub",
      label: "SWITCH",
      caption: "Switch pusat — 8 port",
      x: 500,
      y: 300,
      port: 1,
    },
  ],
  links: [
    { id: "star-1", from: "PC-01", to: "SWITCH", cable: "cable-pc1" },
    { id: "star-2", from: "PC-02", to: "SWITCH", cable: "cable-pc2" },
    { id: "star-3", from: "PC-03", to: "SWITCH", cable: "cable-pc3" },
    { id: "star-4", from: "PC-04", to: "SWITCH", cable: "cable-pc4" },
    { id: "star-5", from: "PC-05", to: "SWITCH", cable: "cable-pc5" },
  ],
  cables: STAR_NODES.map((n, i) => ({
    id: `cable-pc${i + 1}`,
    label: `Kabel ${n.id}`,
    origin: n.id,
    target: "SWITCH",
    reject: "Pada topologi Star, semua komputer harus tersambung ke SWITCH pusat.",
  })),
};

export const TOPO_SPECS: Record<TopoKey, TopoSpec> = {
  bus: BUS,
  ring: RING,
  star: STAR,
};

export function getSpec(key: string): TopoSpec | null {
  return (TOPO_SPECS as Record<string, TopoSpec>)[key] ?? null;
}

export function isTopoKey(value: string): value is TopoKey {
  return value === "bus" || value === "ring" || value === "star";
}

/* ------------------------------------------------------------------ Geometri */

export interface Point {
  x: number;
  y: number;
}

/** Titik_port(node) — tempat kabel ditancapkan. */
export function portAnchor(node: TopoNode, toward?: Point): Point {
  if (node.kind === "backbone") return { x: node.x, y: node.y };
  if (node.kind === "hub" && toward) {
    const dx = toward.x - node.x;
    const dy = toward.y - node.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: node.x + (dx / len) * 80, y: node.y + (dy / len) * 44 };
  }
  return { x: node.x, y: node.y + 34 };
}

/**
 * Path SVG untuk sebuah tautan.
 * Bus → garis tegak ke backbone. Sisanya → kurva bezier yang melengkung.
 */
export function linkPath(from: TopoNode, to: TopoNode): string {
  const a = portAnchor(from, to);
  const b = portAnchor(to, from);

  if (to.kind === "backbone") {
    // Backbone adalah batang mendatar — kabel turun tegak dari PC.
    const bEnd = { x: a.x, y: to.y };
    const mid = (a.y + bEnd.y) / 2;
    return `M ${a.x} ${a.y} C ${a.x} ${mid}, ${bEnd.x} ${mid}, ${bEnd.x} ${bEnd.y}`;
  }
  if (from.kind === "backbone") {
    const aEnd = { x: b.x, y: from.y };
    const mid = (aEnd.y + b.y) / 2;
    return `M ${aEnd.x} ${aEnd.y} C ${aEnd.x} ${mid}, ${b.x} ${mid}, ${b.x} ${b.y}`;
  }

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 1;
  // Titik kendali digeser tegak lurus supaya kabel melengkung rapi.
  const bow = Math.min(70, dist * 0.18);
  const nx = (-dy / dist) * bow;
  const ny = (dx / dist) * bow;
  return `M ${a.x} ${a.y} Q ${(a.x + b.x) / 2 + nx} ${(a.y + b.y) / 2 + ny} ${b.x} ${b.y}`;
}

/** Hitung hop dari PC-01 ke PC-02 pada topologi tertentu (dipakai di sandbox). */
export function hopsBetween(spec: TopoSpec, from: string, to: string): number {
  const path = pathBetween(spec, from, to);
  return path.length ? path.length : -1;
}

/**
 * Jalur terpendek dari satu node ke node lain sebagai daftar tautan.
 * Mengembalikan daftar kosong bila tidak ada jalur (mis. karena satu tautan putus).
 */
export function pathBetween(
  spec: TopoSpec,
  from: string,
  to: string,
  blocked?: string | null,
): TopoLink[] {
  if (from === to) return [];

  const adjacency = new Map<string, TopoLink[]>();
  for (const l of spec.links) {
    if (blocked && l.id === blocked) continue;
    adjacency.set(l.from, [...(adjacency.get(l.from) ?? []), l]);
    adjacency.set(l.to, [...(adjacency.get(l.to) ?? []), l]);
  }

  const prev = new Map<string, { node: string; link: TopoLink }>();
  const visited = new Set<string>([from]);
  const queue: string[] = [from];

  while (queue.length) {
    const cur = queue.shift()!;
    for (const link of adjacency.get(cur) ?? []) {
      const next = link.from === cur ? link.to : link.from;
      if (visited.has(next)) continue;
      visited.add(next);
      prev.set(next, { node: cur, link });
      if (next === to) {
        const trail: TopoLink[] = [];
        let walk = to;
        while (walk !== from) {
          const step = prev.get(walk)!;
          trail.unshift(step.link);
          walk = step.node;
        }
        return trail;
      }
      queue.push(next);
    }
  }
  return [];
}
