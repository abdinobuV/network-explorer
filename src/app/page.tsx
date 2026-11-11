import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { Logo } from "@/components/chrome";
import { TOPO_SPECS } from "@/lib/topology-model";
import { linkPath } from "@/lib/topology-model";

export default function CoverPage() {
  const spec = TOPO_SPECS.star;
  const byId = new Map(spec.nodes.map((n) => [n.id, n]));

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Container width="page" className="flex items-center justify-between py-5">
        <Logo />
        <div className="flex items-center gap-5">
          <Link
            href="/auth/login"
            className="font-mono text-micro uppercase tracking-[0.14em] text-ink-3 transition-colors hover:text-ink"
          >
            Masuk
          </Link>
          <Link
            href="/beranda"
            className="font-mono text-micro uppercase tracking-[0.14em] text-ink transition-colors hover:text-blueprint"
          >
            Selayang pandang →
          </Link>
        </div>
      </Container>

      <Container width="page" className="flex flex-1 flex-col justify-center py-10">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <Eyebrow>Edisi 2.0 · Informatika SMA Kelas XI</Eyebrow>
            <h1 className="mt-4 font-serif text-cover leading-[1.05] tracking-tight">
              Buku Praktis
              <br />
              Topologi
              <br />
              <span className="text-blueprint">Jaringan</span>
            </h1>
            <p className="mt-5 max-w-md text-lead text-ink-2">
              Tiga bab materi, tiga lembar kerja pemasangan kabel, dan satu simulasi jaringan.
              Dipakai sebagai buku latihan mandiri — bukan sekadar tangkapan layar.
            </p>

            <dl className="mt-8 grid max-w-md grid-cols-3 gap-px border border-rule bg-rule">
              {[
                ["03", "Bab materi"],
                ["03", "Lembar praktik"],
                ["10", "Soal kuis"],
              ].map(([n, l]) => (
                <div key={l} className="bg-paper px-4 py-3">
                  <dt className="font-serif text-head leading-none">{n}</dt>
                  <dd className="mt-1 font-mono text-micro uppercase tracking-[0.12em] text-ink-3">
                    {l}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 rounded-xs border border-ink bg-ink px-6 py-3 font-mono text-caption uppercase tracking-[0.12em] text-paper transition-colors hover:bg-ink-2"
              >
                Mulai belajar
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 rounded-xs border border-rule-2 px-6 py-3 font-mono text-caption uppercase tracking-[0.12em] text-ink transition-colors hover:border-ink hover:bg-paper-2"
              >
                Masuk dengan akun
              </Link>
            </div>
          </div>

          {/* Skema sampul */}
          <div className="border border-rule bg-paper-2 p-4 sm:p-6">
            <div className="drafting-grid border border-rule p-3">
              <svg
                viewBox={spec.viewBox}
                className="h-auto w-full"
                role="img"
                aria-label="Skema topologi Star sebagai gambar sampul"
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
                      strokeDasharray="14 9"
                      className="trace-live"
                    />
                  );
                })}
                {spec.nodes.map((n) =>
                  n.kind === "pc" ? (
                    <g key={n.id}>
                      <rect
                        x={n.x - 30}
                        y={n.y - 26}
                        width={60}
                        height={34}
                        rx={2}
                        fill="var(--color-paper)"
                        stroke="var(--color-graphite)"
                        strokeWidth={2}
                      />
                      <text
                        x={n.x}
                        y={n.y + 38}
                        textAnchor="middle"
                        fontSize={18}
                        fontFamily="var(--font-plex-mono)"
                        fill="var(--color-ink-2)"
                      >
                        {n.id}
                      </text>
                    </g>
                  ) : (
                    <g key={n.id}>
                      <rect
                        x={n.x - 46}
                        y={n.y - 24}
                        width={92}
                        height={48}
                        rx={2}
                        fill="var(--color-ink)"
                      />
                      <text
                        x={n.x}
                        y={n.y + 6}
                        textAnchor="middle"
                        fontSize={20}
                        fontFamily="var(--font-plex-mono)"
                        fill="var(--color-paper)"
                      >
                        SWITCH
                      </text>
                    </g>
                  ),
                )}
              </svg>
            </div>
            <p className="mt-3 font-mono text-micro uppercase tracking-[0.12em] text-ink-3">
              Gambar 0.1 — Skema dasar topologi Star
            </p>
          </div>
        </div>
      </Container>

      <Container width="page" className="border-t border-rule py-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-micro uppercase tracking-[0.12em] text-ink-3">
            Kelompok 3 · Program Studi Pendidikan TIK · Universitas Negeri Medan
          </p>
          <p className="font-mono text-micro uppercase tracking-[0.12em] text-ink-4">
            Dibuat untuk pembelajaran mandiri · 2026
          </p>
        </div>
      </Container>
    </div>
  );
}
