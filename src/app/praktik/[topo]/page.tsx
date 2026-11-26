"use client";

import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { ModuleStepBar, NextStepFooter } from "@/components/journey-stepper";
import { getModuleContinuation } from "@/lib/learning-path";
import { Container, PageHeader, Callout, BtnLink, Badge } from "@/components/ui";
import CableBoard from "@/components/cable-board";
import { TOPOLOGI } from "@/lib/data";
import { TOPO_SPECS, isTopoKey } from "@/lib/topology-model";
import { useLearningAnalytics, useProg } from "@/lib/store";
import { XP, praktikKey } from "@/lib/progression";
import { IconArrow, IconCheck, IconInfo } from "@/components/icons";

export default function PraktikPage() {
  const params = useParams();
  const raw = String(params?.topo ?? "");
  const key = isTopoKey(raw) ? raw : notFound();

  const info = TOPOLOGI[key];
  const spec = TOPO_SPECS[key];
  const { markDone, done } = useProg();
  const { trackPracticeEvent } = useLearningAnalytics();
  const [selesai, setSelesai] = useState(done[praktikKey(key)] ?? false);
  const idx = Object.keys(TOPOLOGI).indexOf(key) + 1;
  const cont = getModuleContinuation(key, "praktik");

  function handleComplete() {
    if (selesai) return;
    setSelesai(true);
    markDone({
      key: praktikKey(key),
      label: `Praktik ${info.title}`,
      xp: XP.praktik,
      topo: key,
    });
  }

  return (
    <RequireAuth>
      <div className="bg-canvas">
        <Navbar />
        <main id="konten-utama">
          <Container width="wide" className="py-8">
            <ModuleStepBar topo={key} stage="praktik" />
            <PageHeader
              chapter={`Praktik ${idx} · ${spec.subtitle}`}
              title={`Lembar praktik ${info.title}`}
              lead={spec.rule}
              meta={
                <span className="inline-flex items-center gap-2.5">
                  {selesai && (
                    <Badge tone="green">
                      <IconCheck size={12} /> Terpasang
                    </Badge>
                  )}
                  <span className="text-ok">{XP.praktik} XP</span>
                </span>
              }
            />

            <div className="mt-6">
              <CableBoard
                key={key}
                spec={spec}
                onComplete={handleComplete}
                onTelemetry={(ev, dur) => trackPracticeEvent(key, ev, dur)}
              />
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <Callout tone="note" label="Aturan topologi">
                {spec.rule} {spec.summary}
              </Callout>

              <div className="rounded-lg border border-border bg-surface p-5">
                <p className="text-caption font-semibold text-ink">Langkah berikutnya</p>
                <p className="mt-1.5 text-caption text-ink-2">
                  Setelah seluruh kabel tersambung, uji jaringannya di sandbox: kirim paket ping,
                  lalu cabut satu kabel dan amati dampaknya.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <BtnLink
                    href={`/sandbox/${key}`}
                    className={selesai ? "" : "pointer-events-none opacity-45"}
                  >
                    Buka simulasi <IconArrow size={14} />
                  </BtnLink>
                  <BtnLink href={`/materi/${key}`} tone="ghost">
                    <IconInfo size={14} /> Kembali ke materi
                  </BtnLink>
                </div>
              </div>
            </div>

            <NextStepFooter
              prev={cont.prev}
              next={cont.next}
              hint={`MODUL ${cont.moduleNumber} · LANGKAH 2 → LANJUT KE LANGKAH 3 (SANDBOX)`}
            />
          </Container>
        </main>
        <Footer help />
      </div>
    </RequireAuth>
  );
}
