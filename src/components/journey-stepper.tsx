"use client";

import Link from "next/link";
import { Badge, BtnLink, cx } from "@/components/ui";
import { IconArrow, IconCheck } from "@/components/icons";
import {
  getModuleContinuation,
  type JourneyPhaseSummary,
  type ModuleStage,
} from "@/lib/learning-path";
import { TOPO_LABEL, materiKey, praktikKey, simulasiKey, type TopoKey } from "@/lib/progression";
import { useProg } from "@/lib/store";

/**
 * Strip 5 fase alur belajar besar (1. Pre-Test → 2. Materi & Lab → 3. Kuis → 4. Analitik & AI → 5. Sertifikat).
 * Dipakai di /misi agar siswa langsung melihat peta awal sampai akhir dalam 1 pandangan.
 */
export function JourneyPhaseStrip({ phases }: { phases: JourneyPhaseSummary[] }) {
  return (
    <nav aria-label="Urutan 5 tahap belajar" className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
      {phases.map((p) => {
        const isDone = p.status === "done";
        const isCurrent = p.status === "current";
        return (
          <Link
            key={p.phase}
            href={p.href}
            className={cx(
              "group flex flex-col justify-between rounded-lg border p-3.5 transition-colors",
              isCurrent
                ? "border-signal bg-signal-tint/80"
                : isDone
                  ? "border-ok/40 bg-ok-tint/35 hover:border-ok"
                  : "border-border bg-surface hover:border-border-2",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={cx(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-micro font-bold",
                  isDone
                    ? "bg-ok text-ok-ink"
                    : isCurrent
                      ? "bg-signal text-ok-ink"
                      : "border border-border-2 bg-canvas text-ink-3",
                )}
              >
                {isDone ? <IconCheck size={12} /> : p.phase}
              </span>
              {isCurrent && <Badge tone="blue">Sekarang</Badge>}
              {isDone && <Badge tone="green">Tuntas</Badge>}
              {p.status === "optional" && <Badge tone="neutral">Opsional</Badge>}
            </div>
            <div className="mt-2.5">
              <p
                className={cx(
                  "font-display text-caption font-semibold",
                  isCurrent ? "text-signal-bright" : "text-ink group-hover:text-signal-bright",
                )}
              >
                {p.title}
              </p>
              <p className="mt-0.5 text-micro text-ink-3">{p.detail}</p>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Penanda posisi di dalam satu modul topologi:
 * "Modul 1: Bus · ① Baca Materi → ② Pasang Kabel → ③ Uji Sandbox"
 */
export function ModuleStepBar({ topo, stage }: { topo: TopoKey; stage: ModuleStage }) {
  const { done } = useProg();
  const cont = getModuleContinuation(topo, stage);
  const nama = TOPO_LABEL[topo];

  const steps: Array<{ key: ModuleStage; num: number; label: string; href: string; isDone: boolean }> = [
    { key: "materi", num: 1, label: "Baca Materi", href: `/materi/${topo}`, isDone: !!done[materiKey(topo)] },
    { key: "praktik", num: 2, label: "Pasang Kabel", href: `/praktik/${topo}`, isDone: !!done[praktikKey(topo)] },
    { key: "simulasi", num: 3, label: "Uji Sandbox", href: `/sandbox/${topo}`, isDone: !!done[simulasiKey(topo)] },
  ];

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3">
      <div className="flex flex-wrap items-center gap-2 text-micro">
        <Link href="/misi" className="font-medium text-ink-3 hover:text-signal-bright">
          Alur Belajar
        </Link>
        <span className="text-ink-4" aria-hidden="true">/</span>
        <span className="font-mono font-semibold text-signal-bright">
          Modul {cont.moduleNumber} dari 3: {nama}
        </span>
      </div>

      <ol className="flex flex-wrap items-center gap-2" aria-label={`Urutan belajar Modul ${nama}`}>
        {steps.map((s, i) => {
          const active = s.key === stage;
          return (
            <li key={s.key} className="flex items-center gap-2">
              <Link
                href={s.href}
                aria-current={active ? "step" : undefined}
                className={cx(
                  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-micro font-medium transition-colors",
                  active
                    ? "border-signal bg-signal-tint text-signal-bright"
                    : s.isDone
                      ? "border-ok/40 bg-ok-tint/50 text-ok hover:border-ok"
                      : "border-border bg-canvas text-ink-3 hover:border-border-2 hover:text-ink",
                )}
              >
                <span className="font-mono">
                  {s.isDone && !active ? <IconCheck size={11} /> : `${s.num}.`}
                </span>
                {s.label}
              </Link>
              {i < steps.length - 1 && (
                <span className="text-ink-4" aria-hidden="true">→</span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * Bar penutup "Langkah Berikutnya" di bagian bawah halaman agar tidak ada jalan buntu.
 */
export function NextStepFooter({
  prev,
  next,
  hint,
}: {
  prev?: { label: string; href: string } | null;
  next: { label: string; href: string; description?: string };
  hint?: string;
}) {
  return (
    <section className="mt-10 flex flex-col items-start justify-between gap-4 rounded-lg border border-signal/35 bg-surface p-5 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <p className="font-mono text-micro text-signal-bright">
          {hint ?? "LANJUTKAN ALUR BELAJAR"}
        </p>
        <p className="mt-1 font-display text-title text-ink">{next.label}</p>
        {next.description && (
          <p className="mt-1 text-caption text-ink-2">{next.description}</p>
        )}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2.5">
        {prev && (
          <BtnLink href={prev.href} tone="ghost" size="sm">
            ← {prev.label}
          </BtnLink>
        )}
        <BtnLink href={next.href} tone="primary">
          {next.label} <IconArrow size={14} />
        </BtnLink>
      </div>
    </section>
  );
}
