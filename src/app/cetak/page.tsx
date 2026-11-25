"use client";

import { useState } from "react";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { Container, Btn, BtnLink, PercentBar, Badge, Callout } from "@/components/ui";
import { IconAward, IconCheck, IconPrint, IconShield } from "@/components/icons";
import { useAuth, useLearningAnalytics, useProg } from "@/lib/store";
import { formatDuration } from "@/lib/analytics";
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
  const { data: analytics, summary, certification } = useLearningAnalytics();
  const [previewCert, setPreviewCert] = useState(false);

  const lv = levelProgress(xp);
  const state = { activity, done, quizBest, quizAttempts };
  const persen = overallPercent(state);
  const tanggal = new Date().toLocaleDateString("id-ID", { dateStyle: "long" });
  const showCertificate = certification.eligible || previewCert;

  return (
    <RequireAuth>
      <div className="bg-canvas">
        <div className="no-print">
          <Navbar />
        </div>

        <main id="konten-utama">
          <Container width="sheet" className="py-8 space-y-6">
            <div className="no-print flex flex-wrap items-center justify-between gap-3">
              <p className="text-caption text-ink-2">
                Halaman ini disusun untuk dicetak atau disimpan sebagai PDF (warna otomatis beralih
                ke kertas putih saat dicetak).
              </p>
              <div className="flex flex-wrap gap-2">
                {!certification.eligible && (
                  <Btn
                    tone="ghost"
                    onClick={() => setPreviewCert((v) => !v)}
                  >
                    <IconAward size={15} />
                    {previewCert ? "Sembunyikan pratinjau sertifikat" : "Pratinjau sertifikat"}
                  </Btn>
                )}
                <Btn onClick={() => window.print()}>
                  <IconPrint size={15} /> Cetak rapor & sertifikat
                </Btn>
                <BtnLink href="/analitik" tone="ghost">
                  Ke Analitik
                </BtnLink>
              </div>
            </div>

            {/* Syarat Sertifikat Kompetensi (no-print) */}
            <section className="no-print rounded-lg border border-border bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <IconAward size={18} className="text-signal-bright" />
                  <h2 className="font-display text-body font-semibold text-ink">
                    Kelayakan Sertifikat Kompetensi Berbasis Proses
                  </h2>
                </div>
                <Badge tone={certification.eligible ? "green" : "amber"}>
                  {certification.eligible
                    ? `Terverifikasi · ${certification.credentialId}`
                    : `${certification.completedCount}/${certification.totalChecks} syarat terpenuhi`}
                </Badge>
              </div>

              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {certification.checks.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-start gap-2.5 rounded-md border border-border-3 bg-canvas/60 px-3.5 py-2.5 text-caption"
                  >
                    <span
                      className={
                        c.done
                          ? "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ok text-ok-ink"
                          : "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-border-2 text-ink-4"
                      }
                    >
                      {c.done ? <IconCheck size={12} /> : "•"}
                    </span>
                    <div>
                      <p className={c.done ? "font-medium text-ink" : "text-ink-2"}>{c.label}</p>
                      <p className="font-mono text-micro text-ink-3">{c.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* =============================================================== */}
            {/* SERTIFIKAT KOMPETENSI DIGITAL                                   */}
            {/* =============================================================== */}
            {showCertificate && (
              <section
                aria-label="Sertifikat Kompetensi Digital"
                className="print-full rounded-lg border-2 border-signal/60 bg-surface p-8"
              >
                <div className="border border-border-2 p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
                    <div>
                      <p className="font-mono text-micro uppercase tracking-widest text-signal-bright">
                        Sertifikat Kompetensi Pembelajaran Digital
                      </p>
                      <p className="mt-1 font-display text-title text-ink">
                        Network Explorer · Topologi Jaringan Dasar
                      </p>
                      <p className="text-micro text-ink-3">
                        Program Studi Pendidikan TIK — Universitas Negeri Medan
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <Badge tone={certification.eligible ? "green" : "amber"}>
                        <IconShield size={12} />
                        {certification.eligible ? "Terverifikasi" : "Pratinjau (Belum Tuntas)"}
                      </Badge>
                      <p className="mt-1.5 font-mono text-micro text-ink-3">
                        ID: {certification.credentialId}
                      </p>
                    </div>
                  </div>

                  <div className="py-7 text-center">
                    <p className="text-caption text-ink-3">Diberikan kepada:</p>
                    <p className="mt-2 font-display text-chapter text-ink">
                      {user?.name ?? "Peserta Didik"}
                    </p>
                    <p className="mt-1 font-mono text-caption text-signal-bright">
                      Kelas {user?.kelas ?? "XI"} · {user?.email ?? "—"}
                    </p>
                    <p className="mx-auto mt-4 max-w-2xl text-caption leading-relaxed text-ink-2">
                      Atas penyelesaian modul interaktif, praktik pemasangan kabel, simulasi uji
                      gangguan jaringan (Bus, Ring, Star), evaluasi studi kasus, serta dokumentasi
                      bukti proses & refleksi kritis yang terukur melalui Learning Analytics.
                    </p>

                    <div className="mx-auto mt-6 grid max-w-xl gap-3 sm:grid-cols-3">
                      <div className="rounded-md border border-border bg-canvas/50 p-3">
                        <p className="text-micro text-ink-3">Indeks Penguasaan</p>
                        <p className="mt-1 font-mono text-title font-bold text-ok">
                          {summary.masteryRate ?? 0}%
                        </p>
                      </div>
                      <div className="rounded-md border border-border bg-canvas/50 p-3">
                        <p className="text-micro text-ink-3">Nilai Studi Kasus</p>
                        <p className="mt-1 font-mono text-title font-bold text-ink">
                          {quizBest === null ? "—" : `${quizBest}/10`}
                        </p>
                      </div>
                      <div className="rounded-md border border-border bg-canvas/50 p-3">
                        <p className="text-micro text-ink-3">Bukti Proses</p>
                        <p className="mt-1 font-mono text-title font-bold text-signal-bright">
                          {analytics.reflections.length + analytics.aiSessions.length} catatan
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-end justify-between gap-4 border-t border-border pt-5 text-micro text-ink-3">
                    <div>
                      <p className="font-medium text-ink">Diterbitkan pada {tanggal}</p>
                      <p>Sistem Evaluasi Berbasis Proses & Learning Analytics</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-mono text-ink">Kode Verifikasi: {certification.credentialId}</p>
                      <p>Kelompok 3 · PTIK UNIMED</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* =============================================================== */}
            {/* RAPOR BELAJAR & BUKTI PROSES                                    */}
            {/* =============================================================== */}
            <article className="print-full rounded-lg border border-border bg-surface p-8">
              {/* Kop */}
              <header className="border-b-2 border-border-2 pb-5">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div>
                    <p className="text-caption font-medium text-signal-bright">
                      Misi Topologi, Network Explorer
                    </p>
                    <h1 className="mt-1 font-display text-chapter leading-none">Rapor Belajar</h1>
                    <p className="mt-2 text-caption text-ink-2">
                      Program Studi Pendidikan TIK, Universitas Negeri Medan
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-micro text-ink-3">Tanggal</p>
                    <p className="font-mono text-caption text-ink">{tanggal}</p>
                    <p className="mt-1 font-mono text-micro text-ink-3">
                      ID: {certification.credentialId}
                    </p>
                  </div>
                </div>
              </header>

              {/* Identitas */}
              <section className="mt-6">
                <h2 className="font-display text-body font-semibold text-ink">Identitas siswa</h2>
                <dl className="mt-3 grid gap-x-8 gap-y-2.5 rounded-md border border-border bg-canvas/50 p-4 sm:grid-cols-2">
                  {[
                    ["Nama", user?.name ?? "—"],
                    ["Email", user?.email ?? "—"],
                    ["Kelas", user?.kelas ?? "—"],
                    ["Tingkat", `Tingkat ${lv.level} (${xp.toLocaleString("id-ID")} XP)`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-baseline gap-3 border-b border-border-3 pb-1.5">
                      <dt className="w-24 shrink-0 text-micro text-ink-3">{k}</dt>
                      <dd className="text-caption text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              {/* Ringkasan Learning Analytics (Product + Process) */}
              <section className="mt-6">
                <h2 className="font-display text-body font-semibold text-ink">
                  Ringkasan Capaian & Learning Analytics
                </h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-4">
                  {[
                    ["Progress Tahap", `${persen}%`],
                    [
                      "Indeks Penguasaan",
                      summary.masteryRate === null ? "—" : `${summary.masteryRate}%`,
                    ],
                    ["Nilai Kuis Terbaik", quizBest === null ? "—" : `${quizBest}/10`],
                    ["Waktu Belajar", formatDuration(summary.totalTimeOnTaskSec)],
                  ].map(([label, nilai]) => (
                    <div key={label} className="rounded-md border border-border bg-canvas/50 p-4">
                      <p className="text-micro text-ink-3">{label}</p>
                      <p className="mt-1 font-display text-head leading-none text-ink">{nilai}</p>
                    </div>
                  ))}
                </div>
                {summary.scoreGain !== null && (
                  <p className="mt-2.5 font-mono text-micro text-ok">
                    Perkembangan skor evaluasi: {summary.scoreGain >= 0 ? "+" : ""}
                    {summary.scoreGain} poin
                    {summary.pretestPercent !== null && summary.posttestPercent !== null
                      ? ` (Pre-Test ${summary.pretestPercent}% → Post-Test ${summary.posttestPercent}%)`
                      : ""}
                    {summary.practiceAccuracy !== null
                      ? ` · Akurasi praktik kabel: ${summary.practiceAccuracy}%`
                      : ""}
                  </p>
                )}
              </section>

              {/* Per topologi */}
              <section className="mt-6">
                <h2 className="font-display text-body font-semibold text-ink">
                  Kemajuan per topologi
                </h2>
                <div className="mt-3 overflow-x-auto rounded-md border border-border">
                  <table className="tech-table min-w-[30rem]">
                    <thead>
                      <tr>
                        <th scope="col">Topologi</th>
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

              {/* Evaluasi */}
              <section className="mt-6">
                <h2 className="font-display text-body font-semibold text-ink">Evaluasi kuis</h2>
                <div className="mt-3 rounded-md border border-border bg-canvas/50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-caption text-ink">
                      Kuis akhir ({quizAttempts} percobaan)
                    </p>
                    <Badge tone={quizBest !== null && quizBest >= 8 ? "green" : "amber"}>
                      {quizBest === null ? "Belum dikerjakan" : `Nilai terbaik ${quizBest}/10`}
                    </Badge>
                  </div>
                </div>
              </section>

              {/* Bukti Proses & Refleksi (Pert-12 Slide 22: Dari Product ke Process) */}
              <section className="mt-6">
                <h2 className="font-display text-body font-semibold text-ink">
                  Bukti Proses & Refleksi Mandiri
                </h2>
                {analytics.reflections.length === 0 ? (
                  <p className="mt-2 rounded-md border border-border bg-canvas/50 p-4 text-caption text-ink-3">
                    Belum ada refleksi tertulis. Jawab bagian Cek Pemahaman pada materi atau tulis
                    kesimpulan mandiri di Asisten Belajar AI untuk melengkapi penilaian proses.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2.5">
                    {analytics.reflections.slice(0, 5).map((r) => (
                      <li
                        key={r.id}
                        className="rounded-md border border-border bg-canvas/50 p-3.5 text-caption"
                      >
                        <p className="font-mono text-micro text-signal-bright">
                          {r.context} ·{" "}
                          {new Date(r.at).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="mt-1 text-ink-2">“{r.text}”</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Pernyataan Transparansi Penggunaan AI (Pert-12 Slide 24–25) */}
              <section className="mt-6">
                <h2 className="font-display text-body font-semibold text-ink">
                  Pernyataan Transparansi Penggunaan AI
                </h2>
                {analytics.aiSessions.length === 0 ? (
                  <p className="mt-2 rounded-md border border-border bg-canvas/50 p-4 text-caption text-ink-3">
                    Belum ada penggunaan Asisten AI yang didokumentasikan pada sesi ini. Jika
                    menggunakan bantuan Generative AI, dokumentasikan melalui Studio AI (/asisten).
                  </p>
                ) : (
                  <div className="mt-3 space-y-2.5">
                    {analytics.aiSessions.slice(0, 3).map((s) => (
                      <Callout
                        key={s.id}
                        tone="note"
                        label={`Penggunaan AI (${s.fn}) · Verifikasi ${s.verifiedSteps}/5`}
                      >
                        <p className="italic text-ink">“{s.statement}”</p>
                      </Callout>
                    ))}
                  </div>
                )}
              </section>

              {/* Jejak belajar */}
              <section className="mt-6">
                <h2 className="font-display text-body font-semibold text-ink">Jejak belajar</h2>
                <div className="mt-3 overflow-x-auto rounded-md border border-border">
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
                              <td className="font-mono text-ok">+{a.xp}</td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-micro text-ink-3">
                <p>
                  Rapor ini dihasilkan otomatis oleh Misi Topologi (Network Explorer). Data
                  analytics membantu keputusan guru, bukan menggantikan professional judgment.
                </p>
                <p className="font-mono">
                  {activityLabel(KUIS_KEY)} · {tanggal}
                </p>
              </footer>
            </article>
          </Container>
        </main>

        <div className="no-print">
          <Footer />
        </div>
      </div>
    </RequireAuth>
  );
}
