"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import SandboxBench from "@/components/sandbox-bench";
import { ModuleStepBar, NextStepFooter } from "@/components/journey-stepper";
import { getModuleContinuation } from "@/lib/learning-path";
import { Container, PageHeader, Badge, cx } from "@/components/ui";
import { TOPOLOGI, type TopoKey } from "@/lib/data";
import { TOPO_SPECS, isTopoKey } from "@/lib/topology-model";
import { useLearningAnalytics, useProg } from "@/lib/store";
import { XP, simulasiKey } from "@/lib/progression";
import { IconCheck } from "@/components/icons";

const ALL_TOPOS: TopoKey[] = ["bus", "ring", "star"];

export default function SandboxPage() {
  const params = useParams();
  const raw = String(params?.topo ?? "");
  const key = isTopoKey(raw) ? raw : notFound();

  const info = TOPOLOGI[key];
  const spec = TOPO_SPECS[key];
  const { markDone, done } = useProg();
  const { trackSimulationEvent } = useLearningAnalytics();
  const [sudahSimulasi, setSudahSimulasi] = useState(done[simulasiKey(key)] ?? false);
  const cont = getModuleContinuation(key, "simulasi");

  function handleSimComplete() {
    if (sudahSimulasi) return;
    setSudahSimulasi(true);
    markDone({
      key: simulasiKey(key),
      label: `Simulasi ${info.title}`,
      xp: XP.simulasi,
      topo: key,
    });
  }

  return (
    <RequireAuth>
      <div className="bg-canvas">
        <Navbar />
        <main id="konten-utama">
          <Container width="wide" className="py-8">
            <ModuleStepBar topo={key} stage="simulasi" />
            <PageHeader
              chapter={`Sandbox simulasi interaktif · ${spec.subtitle}`}
              title={`Uji jaringan ${info.title}`}
              lead="Rangkai, geser perangkat, pasang atau cabut kabel langsung di meja kerja, lalu seret paket ping untuk merasakan perilaku jaringan secara nyata."
              meta={
                <span className="inline-flex items-center gap-2.5">
                  {sudahSimulasi && (
                    <Badge tone="green">
                      <IconCheck size={12} /> Sudah disimulasikan
                    </Badge>
                  )}
                  <span className="text-ok">{XP.simulasi} XP</span>
                </span>
              }
            >
              <div className="mt-4 flex flex-wrap gap-2">
                {ALL_TOPOS.map((k) => (
                  <Link
                    key={k}
                    href={`/sandbox/${k}`}
                    className={cx(
                      "rounded-md border px-3 py-1.5 text-caption font-medium transition-colors",
                      k === key
                        ? "border-signal bg-signal-tint text-signal-bright"
                        : "border-border bg-surface text-ink-2 hover:border-border-2 hover:text-ink",
                    )}
                  >
                    {TOPOLOGI[k].title}
                  </Link>
                ))}
              </div>
            </PageHeader>

            <SandboxBench
              key={key}
              topoKey={key}
              spec={spec}
              onSimComplete={handleSimComplete}
              onTelemetry={(ev) => trackSimulationEvent(key, ev)}
            />

            <NextStepFooter
              prev={cont.prev}
              next={cont.next}
              hint={
                cont.moduleNumber < 3
                  ? `MODUL ${cont.moduleNumber} SELESAI → LANJUT KE MODUL ${cont.moduleNumber + 1}`
                  : "KETIGA MODUL SELESAI → LANJUT KE TAHAP 3 (PERBANDINGAN & KUIS AKHIR)"
              }
            />
          </Container>
        </main>
        <Footer help />
      </div>
    </RequireAuth>
  );
}
