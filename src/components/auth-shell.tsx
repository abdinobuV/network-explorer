"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Container, Eyebrow } from "@/components/ui";
import { Logo } from "@/components/chrome";
import { TOPO_SPECS, linkPath } from "@/lib/topology-model";

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
  const spec = TOPO_SPECS.bus;
  const byId = new Map(spec.nodes.map((n) => [n.id, n]));

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Container width="page" className="flex items-center justify-between py-5">
        <Logo />
        <Link
          href="/beranda"
          className="font-mono text-micro uppercase tracking-[0.14em] text-ink-3 transition-colors hover:text-ink"
        >
          ← Selayang pandang
        </Link>
      </Container>

      <Container width="page" className="flex flex-1 items-center py-8">
        <div className="grid w-full items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-10">
          {/* Kepala halaman — satu-satunya h1 di halaman ini. */}
          <div>
            <Eyebrow>{chapter}</Eyebrow>
            <h1 className="mt-3 font-serif text-head leading-tight">{title}</h1>
            <p className="mt-3 max-w-md text-lead text-ink-2">{lead}</p>

            <div className="drafting-grid mt-8 hidden max-w-md border border-rule p-4 lg:block">
              <svg
                viewBox={spec.viewBox}
                className="h-auto w-full"
                role="img"
                aria-label="Skema topologi Bus"
              >
                {spec.links.map((l) => {
                  const from = byId.get(l.from);
                  const to = byId.get(l.to);
                  if (!from || !to) return null;
                  return (
                    <path
                      key={l.id}
                      d={linkPath(from, to)}
                      fill="none"
                      stroke="var(--color-blueprint)"
                      strokeWidth={3}
                    />
                  );
                })}
                {spec.nodes.map((n) =>
                  n.kind === "pc" ? (
                    <rect
                      key={n.id}
                      x={n.x - 30}
                      y={n.y - 26}
                      width={60}
                      height={34}
                      rx={2}
                      fill="var(--color-paper)"
                      stroke="var(--color-graphite)"
                      strokeWidth={2}
                    />
                  ) : (
                    <rect
                      key={n.id}
                      x={60}
                      y={n.y - 9}
                      width={880}
                      height={18}
                      rx={2}
                      fill="var(--color-paper-3)"
                      stroke="var(--color-rule-2)"
                      strokeWidth={2}
                    />
                  ),
                )}
              </svg>
              <p className="mt-2 font-mono text-micro uppercase tracking-[0.12em] text-ink-3">
                Topologi Bus — satu backbone, banyak cabang
              </p>
            </div>
          </div>

          {/* Formulir */}
          <div className="border border-rule bg-paper p-6 sm:p-8">
            {children}
            {footer && <div className="mt-6 border-t border-rule pt-4">{footer}</div>}
          </div>
        </div>
      </Container>
    </div>
  );
}
