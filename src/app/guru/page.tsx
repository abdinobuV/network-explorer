"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import {
  Badge,
  Btn,
  BtnLink,
  Callout,
  Container,
  Input,
  PageHeader,
  PercentBar,
  Select,
  StatusDot,
  Textarea,
  cx,
} from "@/components/ui";
import { AccuracyBarChart, ScoreLineChart } from "@/components/analytics-charts";
import {
  IconAward,
  IconChart,
  IconCheck,
  IconDownload,
  IconPrint,
  IconRefresh,
  IconSearch,
  IconShield,
  IconSparkle,
  IconUser,
  IconWarning,
} from "@/components/icons";
import {
  loadStudentRoster,
  loadTeacherNotes,
  rosterToCsv,
  saveTeacherNote,
  summarizeClassRoster,
  type StudentRosterRecord,
  type StudentWorkStatus,
  type TeacherNotesMap,
} from "@/lib/teacher-roster";
import { formatDuration } from "@/lib/analytics";
import { TOPO_KEYS, TOPO_LABEL, materiKey, praktikKey, simulasiKey } from "@/lib/progression";
import { toast } from "@/lib/toast";

function statusBadge(status: StudentWorkStatus) {
  if (status === "selesai") {
    return (
      <Badge tone="green">
        <IconCheck size={11} /> Selesai / Tuntas
      </Badge>
    );
  }
  if (status === "mengerjakan") {
    return <Badge tone="blue">Sedang Mengerjakan</Badge>;
  }
  return <Badge tone="neutral">Belum Mulai</Badge>;
}

export default function GuruDashboardPage() {
  const [records, setRecords] = useState<StudentRosterRecord[]>([]);
  const [source, setSource] = useState<"demo" | "firebase">("demo");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [kelasFilter, setKelasFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [teacherNotes, setTeacherNotes] = useState<TeacherNotesMap>({});
  const [noteDraft, setNoteDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const applyRosterResult = useCallback(
    (res: Awaited<ReturnType<typeof loadStudentRoster>>) => {
      setSource(res.source);
      if (!res.ok) {
        setError(res.error ?? "Gagal memuat data murid.");
        setRecords([]);
      } else {
        setError(null);
        setRecords(res.records);
        setSelectedUid((prev) =>
          prev && res.records.some((r) => r.uid === prev) ? prev : (res.records[0]?.uid ?? null),
        );
      }
      setLoading(false);
    },
    [],
  );

  const fetchRoster = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await loadStudentRoster();
    applyRosterResult(res);
  }, [applyRosterResult]);

  useEffect(() => {
    let active = true;
    void Promise.all([loadStudentRoster(), loadTeacherNotes()]).then(([res, notes]) => {
      if (!active) return;
      setTeacherNotes(notes);
      applyRosterResult(res);
      const firstUid = res.records[0]?.uid;
      if (firstUid && notes[firstUid]?.note) {
        setNoteDraft(notes[firstUid].note);
      }
    });
    return () => {
      active = false;
    };
  }, [applyRosterResult]);

  function selectStudent(uid: string) {
    setSelectedUid(uid);
    setNoteDraft(teacherNotes[uid]?.note ?? "");
  }

  const classSummary = useMemo(() => summarizeClassRoster(records), [records]);

  const kelasOptions = useMemo(() => {
    const set = new Set<string>(["X", "XI", "XII"]);
    records.forEach((r) => {
      if (r.kelas) set.add(r.kelas);
    });
    return Array.from(set);
  }, [records]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q) && !r.email.toLowerCase().includes(q)) {
        return false;
      }
      if (kelasFilter !== "ALL" && r.kelas !== kelasFilter) return false;
      if (statusFilter === "perlu-perhatian") {
        return r.summary.predictive.level === "perlu-perhatian";
      }
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      return true;
    });
  }, [records, search, kelasFilter, statusFilter]);

  const selectedStudent =
    records.find((r) => r.uid === selectedUid) ?? filtered[0] ?? null;

  async function handleSaveNote() {
    if (!selectedStudent) return;
    setSavingNote(true);
    const updated = await saveTeacherNote(selectedStudent.uid, noteDraft);
    setTeacherNotes(updated);
    setSavingNote(false);
    toast(`Catatan pendampingan untuk ${selectedStudent.name} tersimpan.`, "ok");
  }

  function exportCsv() {
    const csv = rosterToCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rekap-murid-network-explorer-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Rekap nilai & progres murid berhasil diunduh (CSV).", "ok");
  }

  return (
    <RequireAuth role="guru">
      <div className="bg-canvas">
        <Navbar />
        <main id="konten-utama">
          <Container width="wide" className="py-10">
            <PageHeader
              chapter="Panel Khusus Pendidik · Access Control Aktif"
              title="Dashboard Pemantauan Murid (Guru)"
              lead="Pantau seluruh peserta didik yang memakai, sedang mengerjakan, maupun telah menuntaskan modul Topologi Jaringan. Data ini hanya dapat diakses oleh akun Guru."
              meta={
                <span className="inline-flex items-center gap-3">
                  <StatusDot
                    tone="green"
                    label={source === "firebase" ? "Sumber: Firestore Cloud" : "Sumber: Mode Demo Lokal"}
                  />
                  <span className="text-signal-bright">{classSummary.totalStudents} murid</span>
                </span>
              }
            >
              <div className="no-print mt-4 flex flex-wrap items-center gap-2.5">
                <Btn tone="ghost" size="sm" onClick={() => void fetchRoster()} disabled={loading}>
                  <IconRefresh size={14} /> {loading ? "Memuat…" : "Muat ulang data"}
                </Btn>
                <Btn
                  tone="signal"
                  size="sm"
                  onClick={exportCsv}
                  disabled={filtered.length === 0}
                >
                  <IconDownload size={14} /> Unduh Rekap CSV ({filtered.length})
                </Btn>
                <Btn tone="ghost" size="sm" onClick={() => window.print()}>
                  <IconPrint size={14} /> Cetak Laporan Kelas (PDF)
                </Btn>
                <BtnLink href="/asisten?mode=teacher" tone="ghost" size="sm">
                  <IconSparkle size={14} /> Asisten AI Guru
                </BtnLink>
                <BtnLink href="/analitik" tone="ghost" size="sm">
                  <IconChart size={14} /> Analitik Kelas
                </BtnLink>
              </div>
            </PageHeader>

            {error && (
              <Callout tone="error" label="Gagal memuat daftar murid" className="mt-6">
                <span className="flex items-start gap-2">
                  <IconWarning size={15} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </span>
              </Callout>
            )}

            {/* ============================================================= */}
            {/* RINGKASAN KPI KELAS REAL-TIME                                 */}
            {/* ============================================================= */}
            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["Total Murid Terdaftar", String(classSummary.totalStudents), "Akun peserta didik aktif"],
                [
                  "Selesai / Tuntas",
                  String(classSummary.completedCount),
                  classSummary.totalStudents > 0
                    ? `${Math.round((classSummary.completedCount / classSummary.totalStudents) * 100)}% dari total murid`
                    : "Belum ada data",
                ],
                ["Sedang Mengerjakan", String(classSummary.inProgressCount), `${classSummary.notStartedCount} belum mulai`],
                [
                  "Rata-Rata Skor Kuis",
                  classSummary.averageQuizPercent === null ? "—" : `${classSummary.averageQuizPercent}%`,
                  `Rata-rata progres ${classSummary.averageProgressPercent}%`,
                ],
                [
                  "Soal Tersulit Kelas",
                  classSummary.mostDifficultQuestion
                    ? `Soal #${classSummary.mostDifficultQuestion.id}`
                    : "—",
                  classSummary.mostDifficultQuestion
                    ? `${classSummary.mostDifficultQuestion.correctPct}% benar (${classSummary.needsAttentionCount} perlu perhatian)`
                    : "Menunggu data kuis murid",
                ],
              ].map(([label, val, sub]) => (
                <div key={label} className="rounded-lg border border-border bg-surface p-5">
                  <p className="text-micro font-medium text-ink-3">{label}</p>
                  <p className="mt-2 font-display text-head leading-none text-ink">{val}</p>
                  <p className="mt-2 text-micro text-ink-3">{sub}</p>
                </div>
              ))}
            </section>

            {/* ============================================================= */}
            {/* FILTER + DAFTAR SELURUH MURID                                 */}
            {/* ============================================================= */}
            <section className="mt-8 overflow-hidden rounded-lg border border-border bg-surface">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-2 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <IconUser size={16} className="text-signal-bright" />
                  <h2 className="font-display text-body font-semibold text-ink">
                    Daftar Aktivitas &amp; Progres Seluruh Murid
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <IconSearch
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-4"
                    />
                    <Input
                      aria-label="Cari nama atau email murid"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari nama / email…"
                      className="h-9 w-52 py-1 pl-8 text-caption"
                    />
                  </div>
                  <Select
                    aria-label="Filter kelas"
                    value={kelasFilter}
                    onChange={(e) => setKelasFilter(e.target.value)}
                    className="h-9 w-32 py-1 text-caption"
                  >
                    <option value="ALL">Semua Kelas</option>
                    {kelasOptions.map((k) => (
                      <option key={k} value={k}>
                        Kelas {k}
                      </option>
                    ))}
                  </Select>
                  <Select
                    aria-label="Filter status pengerjaan"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-9 w-44 py-1 text-caption"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="selesai">Selesai / Tuntas</option>
                    <option value="mengerjakan">Sedang Mengerjakan</option>
                    <option value="belum-mulai">Belum Mulai</option>
                    <option value="perlu-perhatian">Perlu Perhatian</option>
                  </Select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="tech-table min-w-[58rem]">
                  <thead>
                    <tr>
                      <th scope="col">Murid</th>
                      <th scope="col">Kelas</th>
                      <th scope="col">Status</th>
                      <th scope="col" className="w-40">
                        Progress Tahap
                      </th>
                      <th scope="col">Mastery</th>
                      <th scope="col">Nilai Kuis</th>
                      <th scope="col">Bukti Proses</th>
                      <th scope="col">Terakhir Aktif</th>
                      <th scope="col" className="w-28">
                        Detail
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-ink-3">
                          Memuat data murid…
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-ink-3">
                          Tidak ada murid yang cocok dengan filter saat ini.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((r) => {
                        const isSelected = selectedStudent?.uid === r.uid;
                        return (
                          <tr
                            key={r.uid}
                            className={cx(isSelected && "bg-signal-tint/40")}
                          >
                            <td>
                              <p className="font-medium text-ink">{r.name}</p>
                              <p className="font-mono text-micro text-ink-4">{r.email}</p>
                            </td>
                            <td className="font-mono text-ink-2">{r.kelas}</td>
                            <td>
                              <div className="flex flex-col items-start gap-1">
                                {statusBadge(r.status)}
                                {r.summary.predictive.level === "perlu-perhatian" && (
                                  <Badge tone="amber">Indikasi perlu dampingan</Badge>
                                )}
                              </div>
                            </td>
                            <td>
                              <PercentBar
                                value={r.completionPercent}
                                label={`Progres ${r.name}`}
                              />
                              <p className="mt-1 font-mono text-[11px] text-ink-4">
                                {r.stagesDone}/10 tahap · {r.xp} XP
                              </p>
                            </td>
                            <td className="font-mono">
                              {r.summary.masteryRate === null ? "—" : `${r.summary.masteryRate}%`}
                            </td>
                            <td className="font-mono">
                              {r.progress.quizBest === null
                                ? "Belum"
                                : `${r.progress.quizBest}/10 (${r.progress.quizAttempts}×)`}
                            </td>
                            <td className="font-mono text-micro">
                              {r.analytics.reflections.length} refl ·{" "}
                              {r.analytics.aiSessions.length} AI
                              {r.certification.eligible && (
                                <span className="mt-0.5 block text-ok">Sertifikat aktif</span>
                              )}
                            </td>
                            <td className="whitespace-nowrap font-mono text-micro text-ink-3">
                              {r.lastActiveAt
                                ? new Date(r.lastActiveAt).toLocaleDateString("id-ID", {
                                    day: "2-digit",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "Belum pernah"}
                            </td>
                            <td>
                              <Btn
                                type="button"
                                size="sm"
                                tone={isSelected ? "signal" : "ghost"}
                                onClick={() => selectStudent(r.uid)}
                              >
                                {isSelected ? "Dibuka" : "Inspeksi"}
                              </Btn>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ============================================================= */}
            {/* INSPEKTOR DETAIL MURID + ANALISIS BUTIR SOAL KELAS            */}
            {/* ============================================================= */}
            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
              {/* Detail Murid Terpilih */}
              <section className="rounded-lg border border-border bg-surface p-6">
                {selectedStudent ? (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
                      <div>
                        <p className="font-mono text-micro text-signal-bright">
                          INSPEKSI INDIVIDU MURID
                        </p>
                        <h2 className="mt-1 font-display text-head text-ink">
                          {selectedStudent.name}
                        </h2>
                        <p className="font-mono text-micro text-ink-3">
                          {selectedStudent.email} · Kelas {selectedStudent.kelas} · Waktu belajar{" "}
                          {formatDuration(selectedStudent.summary.totalTimeOnTaskSec)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {statusBadge(selectedStudent.status)}
                        {selectedStudent.certification.eligible && (
                          <Badge tone="green">
                            <IconAward size={12} /> {selectedStudent.certification.credentialId}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Rincian per Topologi */}
                    <div className="grid gap-3 sm:grid-cols-3">
                      {TOPO_KEYS.map((t) => {
                        const m = selectedStudent.analytics.materi[t];
                        const p = selectedStudent.analytics.praktik[t];
                        const s = selectedStudent.analytics.simulasi[t];
                        return (
                          <div
                            key={t}
                            className="rounded-md border border-border bg-canvas/60 p-3.5 text-micro"
                          >
                            <p className="font-display text-caption font-semibold text-ink">
                              Topologi {TOPO_LABEL[t]}
                            </p>
                            <ul className="mt-2 space-y-1 text-ink-2">
                              <li>
                                Materi:{" "}
                                <span className={selectedStudent.progress.done[materiKey(t)] ? "text-ok" : "text-ink-4"}>
                                  {selectedStudent.progress.done[materiKey(t)] ? "Selesai" : "Belum"}
                                </span>{" "}
                                ({formatDuration(m.timeSec)})
                              </li>
                              <li>
                                Praktik:{" "}
                                <span className={selectedStudent.progress.done[praktikKey(t)] ? "text-ok" : "text-ink-4"}>
                                  {selectedStudent.progress.done[praktikKey(t)] ? "Selesai" : "Belum"}
                                </span>{" "}
                                ({p.rejectedConnections} tolakan)
                              </li>
                              <li>
                                Sandbox:{" "}
                                <span className={selectedStudent.progress.done[simulasiKey(t)] ? "text-ok" : "text-ink-4"}>
                                  {selectedStudent.progress.done[simulasiKey(t)] ? "Selesai" : "Belum"}
                                </span>{" "}
                                ({s.faultTests}× uji putus)
                              </li>
                            </ul>
                          </div>
                        );
                      })}
                    </div>

                    {/* Grafik Tren Skor Murid */}
                    <div>
                      <p className="text-caption font-semibold text-ink">
                        Tren Skor Kuis {selectedStudent.name}
                      </p>
                      <div className="mt-2">
                        <ScoreLineChart
                          points={selectedStudent.summary.scoreTimeline.map((pt) => ({
                            label: pt.label,
                            value: pt.percent,
                          }))}
                        />
                      </div>
                    </div>

                    {/* Bukti Proses & Refleksi */}
                    <div>
                      <p className="text-caption font-semibold text-ink">
                        Bukti Proses, Refleksi &amp; Transparansi AI
                      </p>
                      {selectedStudent.analytics.reflections.length === 0 &&
                      selectedStudent.analytics.aiSessions.length === 0 ? (
                        <p className="mt-2 text-caption text-ink-3">
                          Murid ini belum mencatat refleksi tertulis atau sesi transparansi AI.
                        </p>
                      ) : (
                        <ul className="mt-2 space-y-2">
                          {selectedStudent.analytics.reflections.slice(0, 3).map((ref) => (
                            <li
                              key={ref.id}
                              className="rounded-md border border-border-3 bg-canvas/60 p-3 text-caption"
                            >
                              <p className="font-mono text-micro text-signal-bright">
                                {ref.context}
                              </p>
                              <p className="mt-1 text-ink-2">“{ref.text}”</p>
                            </li>
                          ))}
                          {selectedStudent.analytics.aiSessions.slice(0, 2).map((ai) => (
                            <li
                              key={ai.id}
                              className="rounded-md border border-signal/35 bg-signal-tint/40 p-3 text-caption"
                            >
                              <p className="font-mono text-micro text-signal-bright">
                                Transparansi AI ({ai.fn}) · Verifikasi {ai.verifiedSteps}/5
                              </p>
                              <p className="mt-1 italic text-ink-2">“{ai.statement}”</p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Catatan Pendampingan & Professional Judgment Guru */}
                    <div className="rounded-md border border-border-2 bg-canvas/70 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label
                          htmlFor="teacher-note"
                          className="text-caption font-semibold text-ink"
                        >
                          Catatan Pendampingan Guru ({selectedStudent.name})
                        </label>
                        {teacherNotes[selectedStudent.uid]?.updatedAt && (
                          <span className="font-mono text-[11px] text-ink-4">
                            Tersimpan{" "}
                            {new Date(teacherNotes[selectedStudent.uid].updatedAt).toLocaleDateString(
                              "id-ID",
                              { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" },
                            )}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-micro text-ink-3">
                        Catat konteks pribadi murid (mis. kendala perangkat, jadwal remedial, atau
                        hasil diskusi kelas) sebagai wujud <em>professional judgment</em> guru.
                      </p>
                      <Textarea
                        id="teacher-note"
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        placeholder="Contoh: Sudah dikonfirmasi kendala jaringan rumah, dijadwalkan ulang praktik Ring pada jam lab berikutnya..."
                        className="mt-2.5 min-h-20"
                      />
                      <div className="no-print mt-3 flex flex-wrap gap-2">
                        <Btn
                          type="button"
                          size="sm"
                          onClick={() => void handleSaveNote()}
                          disabled={savingNote}
                        >
                          {savingNote ? "Menyimpan…" : "Simpan Catatan Guru"}
                        </Btn>
                        <BtnLink
                          href={`/asisten?mode=teacher&topic=${selectedStudent.summary.weakestConcept?.concept ?? "ring"}`}
                          tone="ghost"
                          size="sm"
                        >
                          <IconSparkle size={13} /> Buat Draft Feedback AI
                        </BtnLink>
                      </div>
                    </div>

                    {/* Indikasi Prediktif & Etika */}
                    <Callout
                      tone={
                        selectedStudent.summary.predictive.level === "rendah" ? "ok" : "warn"
                      }
                      label={`Catatan Diagnostik & Prediktif — ${selectedStudent.summary.predictive.label}`}
                    >
                      <p>{selectedStudent.summary.decisionPipeline.interpretation}</p>
                      <p className="mt-1.5 text-ink">
                        <strong>Saran tindak lanjut:</strong>{" "}
                        {selectedStudent.summary.decisionPipeline.action}
                      </p>
                    </Callout>
                  </div>
                ) : (
                  <p className="text-caption text-ink-3">
                    Pilih salah satu murid pada tabel di atas untuk memeriksa rincian progres dan
                    bukti prosesnya.
                  </p>
                )}
              </section>

              {/* Analisis Butir Soal Agregat Seluruh Murid + Etika Privasi */}
              <aside className="space-y-6">
                <div className="rounded-lg border border-border bg-surface p-5">
                  <p className="font-mono text-micro text-signal-bright">
                    DIAGNOSTIC ANALYTICS · AGREGAT KELAS
                  </p>
                  <h2 className="mt-1 font-display text-title">
                    Akurasi 10 Butir Soal (Seluruh Murid)
                  </h2>
                  <p className="mt-1 text-caption text-ink-3">
                    Dihitung langsung dari jawaban seluruh murid yang telah mengerjakan kuis.
                  </p>
                  <div className="mt-4">
                    <AccuracyBarChart
                      items={classSummary.itemAccuracy.map((it) => ({
                        label: it.label,
                        value: it.correctPct,
                        meta: it.attempts > 0 ? `${it.correct}/${it.attempts}` : "Belum diuji",
                      }))}
                      emptyText="Belum ada murid yang mengerjakan kuis di kelas ini."
                    />
                  </div>
                </div>

                <Callout tone="note" label="Prinsip Access Control & Etika Guru">
                  <span className="flex items-start gap-2">
                    <IconShield size={16} className="mt-0.5 shrink-0 text-signal-bright" />
                    <span>
                      Siswa tidak dapat melihat data teman sekelasnya. Gunakan data kelas ini untuk
                      merancang penjelasan ulang dan pendampingan, bukan untuk memberi label negatif
                      — keputusan pedagogis tetap berada pada <em>professional judgment</em> guru.
                    </span>
                  </span>
                </Callout>
              </aside>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    </RequireAuth>
  );
}
