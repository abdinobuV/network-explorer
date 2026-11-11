"use client";

import Link from "next/link";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { Container, Eyebrow, Btn, PercentBar, Badge } from "@/components/ui";
import { IconPrint } from "@/components/icons";
import { useAuth, useProg } from "@/lib/store";
import {
  KUIS_KEY,
  TOPO_KEYS,
  TOPO_LABEL,
  activityLabel,
  levelProgress,
  materiKey,
  overallPercent,
  praktikKey,
  simulasiKey,
  topoPercent,
} from "@/lib/progression";

export default function CetakPage() {
  const { user } = useAuth();
  const { xp, done, activity, quizBest, quizAttempts } = useProg();
  const lv = levelProgress(xp);
  const persen = overallPercent({ activity, done, quizBest, quizAttempts });
  const state = { activity, done, quizBest, quizAttempts };

  const tanggal = new Date().toLocaleDateString("id-ID", { dateStyle: "long" });

  return (
    <RequireAuth>
      <div>
        <div className="no-print">
          <Navbar />
        </div>

        <Container width="sheet" className="py-8">
          <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-caption text-ink-2">
              Halaman ini disusun untuk dicetak. Gunakan “Cetak rapor” lalu pilih “Save as PDF”.
            </p>
            <div className="flex gap-2">
              <Btn onClick={() => window.print()}>
                <IconPrint size={15} /> Cetak rapor
              </Btn>
              <Link
                href="/progres"
                className="inline-flex items-center rounded-xs border border-rule-2 px-4 py-2 font-mono text-caption uppercase tracking-[0.12em] text-ink hover:border-ink hover:bg-paper-2"
              >
                Kembali
              </Link>
            </div>
          </div>

          <article className="border border-rule bg-paper p-8 print-full">
            {/* Kop */}
            <header className="border-b-2 border-ink pb-4">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="font-mono text-micro uppercase tracking-[0.16em] text-ink-3">
                      Network Explorer · Buku Praktis Topologi Jaringan
                  </p>
                  <h1 className="mt-1 font-serif text-chapter leading-none">Rapor Belajar</h1>
                  <p className="mt-2 font-mono text-caption text-ink-2">
                    Program Studi Pendidikan TIK · Universitas Negeri Medan
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-micro uppercase tracking-[0.14em] text-ink-3">
                    Tanggal
                  </p>
                  <p className="font-mono text-caption text-ink">{tanggal}</p>
                </div>
              </div>
            </header>

            {/* Identitas */}
            <section className="mt-6">
              <Eyebrow>Identitas</Eyebrow>
              <dl className="mt-3 grid gap-x-8 gap-y-2 border border-rule p-4 sm:grid-cols-2">
                {[
                  ["Nama", user?.name ?? "—"],
                  ["Email", user?.email ?? "—"],
                  ["Kelas", user?.kelas ?? "—"],
                  ["Tingkat", `Tingkat ${lv.level}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline gap-3 border-b border-rule-3 pb-1.5">
                    <dt className="w-24 shrink-0 font-mono text-micro uppercase tracking-[0.1em] text-ink-3">
                      {k}
                    </dt>
                    <dd className="text-caption text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Ringkasan */}
            <section className="mt-6">
              <Eyebrow>Ringkasan</Eyebrow>
              <div className="mt-3 grid gap-px border border-rule bg-rule sm:grid-cols-4">
                {[
                  ["Total XP", xp.toLocaleString("id-ID")],
                  ["Tingkat", String(lv.level)],
                  ["Penyelesaian", `${persen}%`],
                  ["Nilai kuis", quizBest === null ? "—" : `${quizBest}/10`],
                ].map(([label, nilai]) => (
                  <div key={label} className="bg-paper p-4">
                    <p className="font-mono text-micro uppercase tracking-[0.1em] text-ink-3">
                      {label}
                    </p>
                    <p className="mt-1 font-serif text-head leading-none">{nilai}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Per bab */}
            <section className="mt-6">
              <Eyebrow>Kemajuan per bab</Eyebrow>
              <div className="mt-3 overflow-x-auto">
                <table className="tech-table min-w-[30rem]">
                <thead>
                  <tr>
                    <th scope="col">Bab</th>
                    <th scope="col">Materi</th>
                    <th scope="col">Praktik</th>
                    <th scope="col">Simulasi</th>
                    <th scope="col">Kemajuan</th>
                  </tr>
                </thead>
                <tbody>
                  {TOPO_KEYS.map((key) => (
                    <tr key={key}>
                      <td className="font-medium text-ink">{TOPO_LABEL[key]}</td>
                      <td>{done[materiKey(key)] ? "Selesai" : "Belum"}</td>
                      <td>{done[praktikKey(key)] ? "Selesai" : "Belum"}</td>
                      <td>{done[simulasiKey(key)] ? "Selesai" : "Belum"}</td>
                      <td>
                        <PercentBar value={topoPercent(state, key)} label="Kemajuan" />
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </section>

            {/* Nilai kuis */}
            <section className="mt-6">
              <Eyebrow>Evaluasi</Eyebrow>
              <div className="mt-3 border border-rule p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-caption text-ink">
                    Kuis akhir · {quizAttempts} percobaan
                  </p>
                  <Badge tone={quizBest !== null && quizBest >= 8 ? "green" : "amber"}>
                    {quizBest === null ? "Belum dikerjakan" : `Nilai terbaik ${quizBest}/10`}
                  </Badge>
                </div>
              </div>
            </section>

            {/* Aktivitas */}
            <section className="mt-6">
              <Eyebrow>Jejak belajar</Eyebrow>
              <div className="mt-3 overflow-x-auto">
                <table className="tech-table min-w-[26rem]">
                <thead>
                  <tr>
                    <th scope="col">Tanggal</th>
                    <th scope="col">Kegiatan</th>
                    <th scope="col" className="w-24">
                      XP
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activity.length === 0 ? (
                    <tr>
                      <td colSpan={3}>Belum ada aktivitas tercatat.</td>
                    </tr>
                  ) : (
                    [...activity]
                      .sort((a, b) => a.at - b.at)
                      .map((a) => (
                        <tr key={`${a.key}-${a.at}`}>
                          <td className="font-mono">
                            {a.at
                              ? new Date(a.at).toLocaleDateString("id-ID", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })
                              : "—"}
                          </td>
                          <td>{a.label ?? activityLabel(a.key)}</td>
                          <td className="font-mono">+{a.xp}</td>
                        </tr>
                      ))
                  )}
                </tbody>
                </table>
              </div>
            </section>

            <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-4">
              <p className="font-mono text-micro uppercase tracking-[0.12em] text-ink-3">
                Ranor ini dihasilkan otomatis oleh aplikasi Network Explorer
              </p>
              <p className="font-mono text-micro uppercase tracking-[0.12em] text-ink-4">
                {activityLabel(KUIS_KEY)} · {tanggal}
              </p>
            </footer>
          </article>
        </Container>

        <div className="no-print">
          <Footer />
        </div>
      </div>
    </RequireAuth>
  );
}
