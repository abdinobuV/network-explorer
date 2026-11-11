"use client";

import Link from "next/link";
import Image from "next/image";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { Container, Eyebrow, PageHeader, Badge, Meter, StatusDot } from "@/components/ui";
import { IconArrow, IconTrophy, IconUser } from "@/components/icons";
import { useAuth, useProg } from "@/lib/store";
import {
  TOPO_KEYS,
  TOPO_LABEL,
  activityLabel,
  levelProgress,
  overallPercent,
} from "@/lib/progression";

export default function ProfilPage() {
  const { user, isDemo } = useAuth();
  const { xp, done, activity, quizBest, quizAttempts } = useProg();
  const lv = levelProgress(xp);
  const persen = overallPercent({ activity, done, quizBest, quizAttempts });

  const inisial = (user?.name ?? "S").trim().charAt(0).toUpperCase();
  const kronologi = [...activity].sort((a, b) => b.at - a.at).slice(0, 8);

  return (
    <RequireAuth>
      <div>
        <Navbar />
        <Container width="page" className="py-10">
          <PageHeader
            chapter="Kartu peserta"
            title="Profil belajar"
            lead="Data akun dan ringkasan perjalanan belajarmu di buku ini."
          />

          <div className="mt-6 grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
            {/* Kartu identitas */}
            <div className="border border-rule bg-paper">
              <div className="flex items-center gap-4 border-b border-rule p-5">
                <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border border-rule-2 bg-paper-2 font-serif text-title text-ink">
                  {user?.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt=""
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    inisial
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-serif text-title">{user?.name ?? "Siswa"}</p>
                  <p className="truncate font-mono text-micro text-ink-3">
                    {user?.email ?? "—"}
                  </p>
                  <p className="mt-1 font-mono text-micro uppercase tracking-[0.12em] text-blueprint">
                    Kelas {user?.kelas ?? "—"}
                  </p>
                </div>
              </div>

              <dl className="divide-y divide-rule-3">
                {[
                  ["Tingkat", `Tingkat ${lv.level}`],
                  ["Total XP", xp.toLocaleString("id-ID")],
                  ["Penyelesaian", `${persen}%`],
                  ["Nilai kuis", quizBest === null ? "Belum dikerjakan" : `${quizBest}/10`],
                  ["Percobaan kuis", String(quizAttempts)],
                  ["Mode akun", isDemo ? "Demo lokal" : "Firebase + Google"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3 px-5 py-2.5">
                    <dt className="font-mono text-micro uppercase tracking-[0.1em] text-ink-3">{k}</dt>
                    <dd className="text-caption text-ink">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="border-t border-rule p-4">
                <Link
                  href="/pengaturan"
                  className="inline-flex items-center gap-2 font-mono text-micro uppercase tracking-[0.12em] text-blueprint hover:underline"
                >
                  Ubah data akun <IconArrow size={13} />
                </Link>
              </div>
            </div>

            {/* Ringkasan */}
            <div className="space-y-6">
              <section className="border border-rule bg-paper p-5">
                <Eyebrow>Ruang belajarmu</Eyebrow>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {TOPO_KEYS.map((key) => {
                    const keys = [`materi-${key}`, `praktik-${key}`, `simulasi-${key}`];
                    const n = keys.filter((k) => done[k]).length;
                    return (
                      <div key={key} className="border border-rule bg-paper-2 p-4">
                        <p className="font-mono text-micro uppercase tracking-[0.12em] text-ink-3">
                          {TOPO_LABEL[key]}
                        </p>
                        <p className="mt-1 font-serif text-title">{n}/3 tahap</p>
                        <div className="mt-2">
                          <Meter value={n} total={3} label={`Tahap ${TOPO_LABEL[key]}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="border border-rule">
                <div className="border-b border-rule bg-paper-2 px-5 py-3">
                  <Eyebrow>Jejak belajar</Eyebrow>
                </div>
                {kronologi.length === 0 ? (
                  <p className="p-5 text-caption text-ink-3">Belum ada aktivitas tercatat.</p>
                ) : (
                  <ul className="divide-y divide-rule-3">
                    {kronologi.map((a) => (
                      <li key={`${a.key}-${a.at}`} className="flex items-center gap-4 px-5 py-3">
                        <span className="font-mono text-micro text-ink-4">
                          {a.at
                            ? new Date(a.at).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                              })
                            : "—"}
                        </span>
                        <span className="flex-1 text-caption text-ink-2">
                          {a.label ?? activityLabel(a.key)}
                        </span>
                        <span className="font-mono text-micro text-blueprint">+{a.xp} XP</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="flex flex-wrap items-center gap-3 border border-rule bg-paper p-5">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-rule-2 bg-paper-2 text-ink-3">
                  <IconUser size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">Ingin mengulang dari awal?</p>
                  <p className="text-caption text-ink-3">
                    Progres dapat dihapus pada halaman Pengaturan. Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
                <Link
                  href="/pengaturan"
                  className="inline-flex items-center rounded-xs border border-rule-2 px-3 py-1.5 font-mono text-micro uppercase tracking-[0.1em] text-ink hover:border-ink hover:bg-paper-2"
                >
                  Buka pengaturan
                </Link>
              </section>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <StatusDot tone="blue" label="Data tersimpan di akunmu" />
            {isDemo && <Badge tone="amber">Mode demo — data lokal</Badge>}
            <IconTrophy size={14} className="text-ink-4" />
          </div>
        </Container>
        <Footer help />
      </div>
    </RequireAuth>
  );
}
