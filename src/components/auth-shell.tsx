"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui";
import { Logo } from "@/components/chrome";
import { TopoMini } from "@/components/topo";

/** Cangkang bersama untuk halaman autentikasi. */
export default function AuthShell({
  chapter,
  title,
  lead,
  children,
  footer,
}: {
  chapter: string;
  title: string;
  lead: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Container width="page" className="flex items-center justify-between py-5">
        <Logo />
        <Link
          href="/beranda"
          className="text-caption font-medium text-ink-2 transition-colors hover:text-signal-bright"
        >
          Lihat beranda
        </Link>
      </Container>

      <Container width="page" className="flex flex-1 items-center py-8">
        <div className="grid w-full items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
          <div>
            <p className="text-caption font-medium text-signal-bright">{chapter}</p>
            <h1 className="mt-2 font-display text-chapter leading-tight">{title}</h1>
            <p className="mt-3 max-w-md text-lead text-ink-2">{lead}</p>

            <div className="mt-8 hidden max-w-md overflow-hidden rounded-lg border border-border bg-surface p-3 lg:block">
              <div className="lab-grid rounded-md border border-border-3 p-3">
                <TopoMini kind="bus" />
              </div>
              <p className="mt-2.5 text-micro text-ink-3">
                Pratinjau skema Bus: satu jalur backbone, banyak percabangan perangkat.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-6 sm:p-8">
            {children}
            {footer && <div className="mt-6 border-t border-border pt-4">{footer}</div>}
          </div>
        </div>
      </Container>
    </div>
  );
}
