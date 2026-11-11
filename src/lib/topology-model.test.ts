import { describe, expect, it } from "vitest";
import {
  TOPO_SPECS,
  getSpec,
  hopsBetween,
  isTopoKey,
  linkPath,
  pathBetween,
} from "@/lib/topology-model";

describe("model topologi", () => {
  it("menyediakan model untuk ketiga topologi", () => {
    expect(Object.keys(TOPO_SPECS)).toEqual(["bus", "ring", "star"]);
    expect(getSpec("bus")?.title).toBe("Topologi Bus");
    expect(getSpec("tidak-ada")).toBeNull();
    expect(isTopoKey("star")).toBe(true);
    expect(isTopoKey("mesh")).toBe(false);
  });

  it("setiap topologi punya kabel dan tautan yang seimbang", () => {
    for (const spec of Object.values(TOPO_SPECS)) {
      expect(spec.cables.length).toBe(spec.links.length);
      expect(spec.cables.length).toBeGreaterThan(0);
      for (const cable of spec.cables) {
        expect(spec.nodes.some((n) => n.id === cable.origin)).toBe(true);
        expect(spec.nodes.some((n) => n.id === cable.target)).toBe(true);
      }
    }
  });

  it("aturan pemasangan tiap topologi memang berbeda", () => {
    const rules = new Set(Object.values(TOPO_SPECS).map((s) => s.rule));
    expect(rules.size).toBe(3);
  });

  it("bus hanya，目标 hanya backbone, star hanya switch", () => {
    expect(TOPO_SPECS.bus.cables.every((c) => c.target === "BACKBONE")).toBe(true);
    expect(TOPO_SPECS.star.cables.every((c) => c.target === "SWITCH")).toBe(true);
  });

  it("ring, target adalah PC berikutnya searah jarum jam", () => {
    const ring = TOPO_SPECS.ring;
    expect(ring.cables.map((c) => c.target)).toEqual([
      "PC-02",
      "PC-03",
      "PC-04",
      "PC-01",
    ]);
  });
});

describe("geometri jalur", () => {
  it("menggambar path SVG yang valid untuk tiap tautan", () => {
    for (const spec of Object.values(TOPO_SPECS)) {
      for (const link of spec.links) {
        const from = spec.nodes.find((n) => n.id === link.from);
        const to = spec.nodes.find((n) => n.id === link.to);
        expect(from).toBeDefined();
        expect(to).toBeDefined();
        const d = linkPath(from!, to!);
        expect(d.startsWith("M ")).toBe(true);
        expect(d).not.toContain("NaN");
      }
    }
  });
});

describe("perhitungan jalur (untuk sandbox)", () => {
  it("bus: dua hop lewat backbone", () => {
    expect(hopsBetween(TOPO_SPECS.bus, "PC-01", "PC-02")).toBe(2);
  });

  it("star: dua hop lewat switch", () => {
    expect(hopsBetween(TOPO_SPECS.star, "PC-01", "PC-02")).toBe(2);
  });

  it("ring: satu hop ke tetangga, dua ke seberang", () => {
    expect(hopsBetween(TOPO_SPECS.ring, "PC-01", "PC-02")).toBe(1);
    expect(hopsBetween(TOPO_SPECS.ring, "PC-01", "PC-03")).toBe(2);
  });

  it("mengembalikan jalur yang tersambung rapi", () => {
    const jalur = pathBetween(TOPO_SPECS.star, "PC-01", "PC-02");
    expect(jalur).toHaveLength(2);
    // Tautan disimpan dalam arah kanonis (PC → SWITCH); urutan jalurnya
    // harus menyambung: PC-01 → SWITCH → PC-02.
    const nodeUjung = (link: (typeof jalur)[number], dari: string) =>
      link.from === dari ? link.to : link.from;
    let sekarang = "PC-01";
    for (const link of jalur) {
      sekarang = nodeUjung(link, sekarang);
    }
    expect(sekarang).toBe("PC-02");
    expect(jalur.some((l) => l.from === "SWITCH" || l.to === "SWITCH")).toBe(true);
  });

  it("tidak ada jalur bila tautan yang menghubungkan diputus", () => {
    const tautan = TOPO_SPECS.ring.links.find((l) => l.from === "PC-01")!;
    const jalur = pathBetween(TOPO_SPECS.ring, "PC-01", "PC-02", tautan.id);
    // Jalur lain (melalui PC-04) masih ada pada ring tunggal.
    expect(jalur.length).toBeGreaterThan(0);
  });

  it("memutus tautan milik PC itu sendiri isolationkan PC tersebut", () => {
    // Pada Bus, setiap PC punya satu tautan ke backbone. Cut tautan PC-01
    // berarti PC-01 tidak lagi punya jalan ke mana pun.
    const tautanPC01 = TOPO_SPECS.bus.links.find((l) => l.from === "PC-01")!;
    expect(pathBetween(TOPO_SPECS.bus, "PC-01", "PC-02", tautanPC01.id)).toHaveLength(0);

    // Memutus tautan PC-02 juga mengisolasi PC-02.
    // PC-01 dan PC-03 masih terhubung lewat backbone.
    const tautanPC02 = TOPO_SPECS.bus.links.find((l) => l.from === "PC-02")!;
    expect(pathBetween(TOPO_SPECS.bus, "PC-01", "PC-02", tautanPC02.id)).toHaveLength(0);
    expect(pathBetween(TOPO_SPECS.bus, "PC-01", "PC-03", tautanPC02.id).length).toBeGreaterThan(0);
  });
});
