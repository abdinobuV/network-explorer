"use client";

import { useState } from "react";
import { TopoDiagram } from "@/components/topo";
import { TOPOLOGI, type TopoKey } from "@/lib/data";
import { cx } from "@/components/ui";

const KEYS: TopoKey[] = ["star", "ring", "bus"];

const FAULT_NOTE: Record<TopoKey, { normal: string; broken: string }> = {
  star: {
    normal: "Switch meneruskan paket langsung ke komputer tujuan lewat jalur masing-masing.",
    broken: "Kabel PC-02 terputus. Hanya PC-02 yang terisolasi; PC-01, PC-03, dan PC-04 tetap aktif.",
  },
  ring: {
    normal: "Paket melintas satu arah dari satu komputer ke tetangganya membentuk cincin tertutup.",
    broken: "Tautan PC-02 terputus. Cincin terbuka sehingga aliran paket terhenti di seluruh jaringan.",
  },
  bus: {
    normal: "Semua komputer berbagi satu kabel backbone dengan terminator di kedua ujungnya.",
    broken: "Cabang PC-02 putus. Jika backbone utama yang rusak, seluruh segmen ikut terputus.",
  },
};

/** Pratinjau interaktif langsung di halaman sampul — inti pengalaman Network Explorer. */
export default function CoverBench() {
  const [kind, setKind] = useState<TopoKey>("star");
  const [cut, setCut] = useState(false);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-2 px-4 py-2.5">
        <div className="flex items-center gap-1" role="tablist" aria-label="Pilih pratinjau topologi">
          {KEYS.map((k) => {
            const active = kind === k;
            return (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setKind(k);
                  setCut(false);
                }}
                className={cx(
                  "cursor-pointer rounded-sm px-3 py-1 text-caption font-medium transition-colors",
                  active
                    ? "bg-signal-tint text-signal-bright"
                    : "text-ink-3 hover:bg-surface-3 hover:text-ink",
                )}
              >
                {TOPOLOGI[k].title.replace("Topologi ", "")}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setCut((v) => !v)}
          aria-pressed={cut}
          className={cx(
            "cursor-pointer rounded-sm border px-3 py-1 text-micro font-medium transition-colors",
            cut
              ? "border-ok/45 bg-ok-tint text-ok hover:brightness-110"
              : "border-fault/45 bg-fault-tint text-fault hover:brightness-110",
          )}
        >
          {cut ? "Sambungkan ulang PC-02" : "Simulasikan PC-02 putus"}
        </button>
      </div>

      <div className="lab-grid p-4 sm:p-5">
        <TopoDiagram kind={kind} animate brokenId={cut ? "PC-02" : null} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-surface-2/60 px-4 py-3">
        <p className={cx("text-caption leading-snug", cut ? "text-fault" : "text-ink-2")}>
          {cut ? FAULT_NOTE[kind].broken : FAULT_NOTE[kind].normal}
        </p>
      </div>
    </div>
  );
}

