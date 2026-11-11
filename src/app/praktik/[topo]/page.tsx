"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { Container, Eyebrow, PageHeader, Callout, BtnLink, Badge } from "@/components/ui";
import CableBoard from "@/components/cable-board";
import { TOPOLOGI } from "@/lib/data";
import { TOPO_SPECS, isTopoKey } from "@/lib/topology-model";
import { useProg } from "@/lib/store";
import { XP, praktikKey } from "@/lib/progression";
import { IconArrow, IconCheck, IconInfo } from "@/components/icons";

export default function PraktikPage() {
  const params = useParams();
  const raw = String(params?.topo ?? "");
  const key = isTopoKey(raw) ? raw : notFound();

  const info = TOPOLOGI[key];
  const spec = TOPO_SPECS[key];
  const { markDone, done } = useProg();
  const [selesai, setSelesai] = useState(done[praktikKey(key)] ?? false);

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
      <div>
        <Navbar />
        <Container width="wide" className="py-8">
          <PageHeader
            chapter={`Praktik ${String(Object.keys(TOPOLOGI).indexOf(key) + 1).padStart(2, "0")} · ${spec.subtitle}`}
            title={`Lembar kerja — ${info.title}`}
            lead={spec.rule}
            meta={
              <span className="inline-flex items-center gap-2">
                {selesai && (
                  <Badge tone="green">
                    <IconCheck size={12} /> Terpasang
                  </Badge>
                )}
                <span>{XP.praktik} XP</span>
              </span>
            }
          />

          <div className="mt-6">
            <CableBoard key={key} spec={spec} onComplete={handleComplete} />
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <Callout tone="note" label="Aturan topologi">
              {spec.rule} {spec.summary}
            </Callout>

            <div className="border border-rule bg-paper p-5">
              <Eyebrow>Langkah berikutnya</Eyebrow>
              <p className="mt-2 text-caption text-ink-2">
                Setelah seluruh kabel tersambung, uji jaringannya di sandbox: kirim data, lalu
                putus satu kabel dan amati dampaknya.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <BtnLink href={`/sandbox/${key}`} className={selesai ? "" : "pointer-events-none opacity-50"}>
                  Buka simulasi <IconArrow size={14} />
                </BtnLink>
                <BtnLink href={`/materi/${key}`} tone="ghost">
                  <IconInfo size={14} /> Kembali ke bab
                </BtnLink>
              </div>
            </div>
          </div>

          <p className="mt-6">
            <Link
              href="/misi"
              className="font-mono text-micro uppercase tracking-[0.12em] text-blueprint hover:underline"
            >
              ← Kembali ke peta misi
            </Link>
          </p>
        </Container>
        <Footer help />
      </div>
    </RequireAuth>
  );
}
