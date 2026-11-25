"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { Container, Btn, Badge, Meter, cx } from "@/components/ui";
import { IconCheck, IconCross, IconFlag, IconShield, IconSparkle } from "@/components/icons";
import { ADAPTIVE_DRILLS, CONCEPT_META, QUIZ, type ConceptKey } from "@/lib/data";
import { useLearningAnalytics, useProg } from "@/lib/store";
import type { QuizKind } from "@/lib/analytics";
import { sfx } from "@/lib/sound";
import { toast } from "@/lib/toast";

const HURUF = ["A", "B", "C", "D"];
const LAST_KEY = "misi-quiz-last";

function elapsedSeconds(startedAt: number | null): number {
  if (startedAt === null) return 30;
  return Math.max(1, Math.round((Date.now() - startedAt) / 1000));
}

interface UnifiedQuestion {
  id: number;
  tag: string;
  concept: ConceptKey;
  q: string;
  case: string;
  options: string[];
  answer: number;
  explain: string;
}

function KuisInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const { recordQuiz } = useProg();
  const { recordQuizTelemetry, summary } = useLearningAnalytics();

  const rawMode = sp.get("mode");
  const mode: QuizKind =
    rawMode === "pretest" ? "pretest" : rawMode === "adaptive" ? "adaptive" : "posttest";
  const rawFocus = sp.get("focus") as ConceptKey | null;
  const focusConcept: ConceptKey =
    rawFocus && CONCEPT_META[rawFocus]
      ? rawFocus
      : (summary.weakestConcept?.concept ?? "ring");

  const questions: UnifiedQuestion[] =
    mode === "adaptive"
      ? ADAPTIVE_DRILLS[focusConcept].map((d, i) => ({
          id: i + 1,
          tag: `Latihan adaptif · ${CONCEPT_META[focusConcept].label}`,
          concept: focusConcept,
          q: d.q,
          case: `Fokus penguatan konsep ${CONCEPT_META[focusConcept].label} berdasarkan hasil Learning Analytics.`,
          options: d.options,
          answer: d.answer,
          explain: d.explain,
        }))
      : QUIZ;

  const [idx, setIdx] = useState(0);
  const [ans, setAns] = useState<Record<number, number>>({});
  const [marked, setMarked] = useState<Record<number, boolean>>({});
  const [feedback, setFeedback] = useState<null | { ok: boolean; explain: string }>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, [mode, focusConcept]);

  const safeIdx = Math.min(idx, questions.length - 1);
  const q = questions[safeIdx];
  const answered = Object.keys(ans).length;
  const pct = Math.round((answered / questions.length) * 100);

  useEffect(() => {
    if (!feedback) return;
    const el = dialogRef.current;
    el?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFeedback(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [feedback]);

  function choose(o: number) {
    setAns((a) => ({ ...a, [q.id]: o }));
    const ok = o === q.answer;
    sfx(ok ? "click" : "reject");
    setFeedback({ ok, explain: q.explain });
  }

  function submit() {
    let score = 0;
    questions.forEach((x) => {
      if (ans[x.id] === x.answer) score++;
    });

    const durationSec = elapsedSeconds(startedAtRef.current);

    // Catat telemetri Learning Analytics (per-butir soal, waktu pengerjaan, jenis tes)
    recordQuizTelemetry({
      kind: mode,
      score,
      total: questions.length,
      durationSec,
      answers: ans,
      focusConcept: mode === "adaptive" ? focusConcept : undefined,
    });

    if (mode === "adaptive") {
      toast(
        `Latihan adaptif ${CONCEPT_META[focusConcept].short} selesai (${score}/${questions.length}). Lihat pembaruan di Dashboard Analitik!`,
        score === questions.length ? "ok" : "default",
      );
      router.push("/analitik");
      return;
    }

    const gained = mode === "posttest" ? recordQuiz(score, questions.length) : 0;
    try {
      localStorage.setItem(
        LAST_KEY,
        JSON.stringify({
          score,
          total: questions.length,
          answers: ans,
          gained,
          kind: mode,
          durationSec,
        }),
      );
    } catch {
      /* abaikan */
    }
    router.push(`/kuis/hasil?score=${score}&total=${questions.length}&mode=${mode}`);
    toast(
      mode === "pretest"
        ? `Pre-Test diagnostik selesai (${score}/${questions.length}). Bandingkan dengan Post-Test nanti!`
        : gained > 0
          ? `Kuis dikumpulkan. +${gained} XP.`
          : "Kuis dikumpulkan. Nilai ini bukan rekor baru, jadi XP tidak bertambah.",
      gained > 0 || mode === "pretest" ? "ok" : "default",
    );
  }

  return (
    <div className="bg-canvas">
      <Navbar />
      <main id="konten-utama">
        <Container width="page" className="py-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
            <div>
              <p className="text-caption font-medium text-signal-bright">
                {mode === "pretest"
                  ? "Diagnostik awal (Pre-Test)"
                  : mode === "adaptive"
                    ? `Latihan Adaptif · ${CONCEPT_META[focusConcept].label}`
                    : "Evaluasi studi kasus"}
              </p>
              <h1 className="mt-1.5 font-display text-head">
                {mode === "pretest"
                  ? "Pre-Test Topologi Jaringan"
                  : mode === "adaptive"
                    ? `Latihan Adaptif: ${CONCEPT_META[focusConcept].short}`
                    : "Kuis akhir"}
              </h1>
              <p className="mt-2 max-w-2xl text-caption text-ink-2">
                {mode === "pretest"
                  ? "Ukur pemahaman awalmu sebelum belajar. Hasilnya dibandingkan otomatis dengan Kuis Akhir (Post-Test) pada Dashboard Learning Analytics."
                  : mode === "adaptive"
                    ? "Tiga soal terarah untuk memperkuat konsep yang paling banyak keliru berdasarkan analisis data belajarmu."
                    : "Sepuluh soal studi kasus tentang struktur, aliran data, dan dampak gangguan. Pilih satu jawaban pada tiap soal tanpa batas waktu."}
              </p>

              {/* Mode switcher */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/kuis"
                  className={cx(
                    "rounded-md border px-3 py-1.5 text-micro font-medium transition-colors",
                    mode === "posttest"
                      ? "border-signal bg-signal-tint text-signal-bright"
                      : "border-border bg-surface text-ink-2 hover:border-border-2 hover:text-ink",
                  )}
                >
                  Kuis Akhir (Post-Test)
                </Link>
                <Link
                  href="/kuis?mode=pretest"
                  className={cx(
                    "rounded-md border px-3 py-1.5 text-micro font-medium transition-colors",
                    mode === "pretest"
                      ? "border-signal bg-signal-tint text-signal-bright"
                      : "border-border bg-surface text-ink-2 hover:border-border-2 hover:text-ink",
                  )}
                >
                  Pre-Test Diagnostik
                </Link>
                <Link
                  href={`/kuis?mode=adaptive&focus=${focusConcept}`}
                  className={cx(
                    "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-micro font-medium transition-colors",
                    mode === "adaptive"
                      ? "border-signal bg-signal-tint text-signal-bright"
                      : "border-border bg-surface text-ink-2 hover:border-border-2 hover:text-ink",
                  )}
                >
                  <IconSparkle size={12} /> Latihan Adaptif ({CONCEPT_META[focusConcept].short})
                </Link>
              </div>
            </div>
            <p className="font-mono text-caption text-ink-2">
              {answered}/{questions.length} dijawab
            </p>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_19.5rem]">
            {/* Soal */}
            <div>
              <article className="rounded-lg border border-border bg-surface p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-mono text-caption text-signal-bright">
                    Soal {String(safeIdx + 1).padStart(2, "0")} / {questions.length}
                  </p>
                  {ans[q.id] !== undefined ? (
                    <Badge tone="green">
                      <IconCheck size={12} /> Sudah dijawab
                    </Badge>
                  ) : (
                    <Badge tone="neutral">Belum dijawab</Badge>
                  )}
                </div>

                <p className="mt-3 text-micro font-medium text-ink-3">{q.tag}</p>
                <h2 className="mt-1.5 font-display text-title leading-snug">{q.q}</h2>

                <div className="mt-4 rounded-md border border-border bg-canvas/70 px-4 py-3.5">
                  <p className="text-micro font-semibold text-signal-bright">Konteks kasus</p>
                  <p className="mt-1 text-caption leading-relaxed text-ink-2">{q.case}</p>
                </div>

                <ul className="mt-5 space-y-2.5">
                  {q.options.map((o, i) => {
                    const picked = ans[q.id] === i;
                    const correct = q.answer === i;
                    const reveal = feedback !== null;
                    return (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => choose(i)}
                          aria-pressed={picked}
                          className={cx(
                            "flex w-full cursor-pointer items-start gap-3 rounded-md border px-4 py-3 text-left transition-colors",
                            reveal && correct
                              ? "border-ok bg-ok-tint"
                              : reveal && picked
                                ? "border-fault bg-fault-tint"
                                : picked
                                  ? "border-signal bg-signal-tint"
                                  : "border-border bg-canvas/50 hover:border-border-2 hover:bg-surface-2",
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cx(
                              "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-xs border font-mono text-micro",
                              reveal && correct
                                ? "border-ok bg-ok text-ok-ink"
                                : reveal && picked
                                  ? "border-fault bg-fault text-white"
                                  : picked
                                    ? "border-signal bg-signal text-ok-ink"
                                    : "border-border-2 text-ink-3",
                            )}
                          >
                            {reveal && correct ? (
                              <IconCheck size={12} />
                            ) : reveal && picked ? (
                              <IconCross size={12} />
                            ) : (
                              HURUF[i]
                            )}
                          </span>
                          <span className="sr-only">Jawaban {HURUF[i]}. </span>
                          <span className="text-caption leading-relaxed text-ink">{o}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </article>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <Btn
                  tone="ghost"
                  onClick={() => {
                    setIdx((i) => Math.max(0, i - 1));
                    setFeedback(null);
                  }}
                  disabled={safeIdx === 0}
                >
                  Sebelumnya
                </Btn>
                <div className="flex flex-wrap gap-2">
                  <Btn
                    tone="ghost"
                    onClick={() => setMarked((m) => ({ ...m, [q.id]: !m[q.id] }))}
                    aria-pressed={!!marked[q.id]}
                  >
                    <IconFlag size={14} />
                    {marked[q.id] ? "Ditandai" : "Tandai"}
                  </Btn>
                  {safeIdx < questions.length - 1 ? (
                    <Btn
                      tone="signal"
                      onClick={() => {
                        setIdx((i) => i + 1);
                        setFeedback(null);
                      }}
                    >
                      Soal berikutnya
                    </Btn>
                  ) : (
                    <Btn onClick={submit} disabled={answered < questions.length}>
                      Kumpulkan ({answered}/{questions.length})
                    </Btn>
                  )}
                </div>
              </div>

              {answered < questions.length && safeIdx === questions.length - 1 && (
                <p className="mt-2.5 text-caption text-caution">
                  Lengkapi {questions.length - answered} jawaban lagi sebelum mengumpulkan.
                </p>
              )}
            </div>

            {/* Panel samping */}
            <aside className="space-y-5">
              <div className="overflow-hidden rounded-lg border border-border bg-surface">
                <div className="border-b border-border bg-surface-2 px-4 py-2.5">
                  <p className="text-caption font-semibold text-ink">Navigasi soal</p>
                </div>
                <div className="p-4">
                  <Meter value={answered} total={questions.length} label="Soal terjawab" />
                  <p className="mt-2 font-mono text-micro text-ink-3">{pct}% selesai</p>

                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {questions.map((x, i) => (
                      <button
                        key={x.id}
                        type="button"
                        onClick={() => {
                          setIdx(i);
                          setFeedback(null);
                        }}
                        aria-label={`Ke soal ${i + 1}${marked[x.id] ? ", ditandai" : ""}`}
                        aria-current={i === safeIdx ? "true" : undefined}
                        className={cx(
                          "relative grid h-9 cursor-pointer place-items-center rounded-sm border font-mono text-caption transition-colors",
                          i === safeIdx
                            ? "border-signal bg-signal text-ok-ink font-semibold"
                            : ans[x.id] !== undefined
                              ? "border-ok/45 bg-ok-tint text-ok"
                              : "border-border bg-canvas text-ink-3 hover:border-border-2 hover:text-ink",
                        )}
                      >
                        {i + 1}
                        {marked[x.id] && (
                          <span
                            aria-hidden="true"
                            className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-caution"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {mode === "adaptive" && (
                <div className="rounded-lg border border-border bg-surface p-5">
                  <p className="text-caption font-semibold text-ink">Ganti fokus konsep adaptif</p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {(Object.keys(CONCEPT_META) as ConceptKey[]).map((ck) => (
                      <Link
                        key={ck}
                        href={`/kuis?mode=adaptive&focus=${ck}`}
                        onClick={() => {
                          setIdx(0);
                          setAns({});
                          setFeedback(null);
                        }}
                        className={cx(
                          "rounded-xs border px-2.5 py-1 text-micro font-medium",
                          ck === focusConcept
                            ? "border-signal bg-signal-tint text-signal-bright"
                            : "border-border bg-canvas text-ink-3 hover:text-ink",
                        )}
                      >
                        {CONCEPT_META[ck].short}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-border bg-surface p-5">
                <p className="text-caption font-semibold text-ink">Petunjuk</p>
                <ul className="mt-2.5 space-y-1.5 text-caption text-ink-2">
                  <li>Baca kondisi kasus dengan teliti sebelum memilih.</li>
                  <li>Pembahasan muncul setiap kali kamu memilih jawaban.</li>
                  <li>Hasil per soal otomatis dianalisis di Dashboard Learning Analytics.</li>
                  <li>XP hanya bertambah saat nilai Kuis Akhir memecahkan rekor sebelumnya.</li>
                </ul>
                <Btn className="mt-4 w-full" onClick={submit} disabled={answered < questions.length}>
                  <IconShield size={15} /> Kumpulkan kuis
                </Btn>
              </div>
            </aside>
          </div>
        </Container>
      </main>
      <Footer />

      {/* Dialog pembahasan */}
      {feedback && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-canvas/80 p-4 backdrop-blur-xs"
          onClick={() => setFeedback(null)}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-judul"
            tabIndex={-1}
            className="w-full max-w-lg rounded-lg border border-border-2 bg-surface p-7 shadow-lift"
            onClick={(e) => e.stopPropagation()}
          >
            <p
              className={cx(
                "text-caption font-semibold",
                feedback.ok ? "text-ok" : "text-fault",
              )}
            >
              {feedback.ok ? "Tepat sekali" : "Belum tepat"}
            </p>
            <h2 id="dialog-judul" className="mt-1.5 font-display text-head">
              {feedback.ok ? "Jawabanmu benar" : "Periksa kembali konsepnya"}
            </h2>
            <p className="mt-3 text-caption leading-relaxed text-ink-2">{feedback.explain}</p>
            <div className="mt-6 flex gap-3">
              <Btn
                className="flex-1"
                onClick={() => {
                  setFeedback(null);
                  if (safeIdx < questions.length - 1) setIdx((i) => i + 1);
                }}
              >
                {safeIdx < questions.length - 1 ? "Lanjut ke soal berikutnya" : "Selesai"}
              </Btn>
              <Btn
                tone="ghost"
                onClick={() => setFeedback(null)}
                aria-label="Tutup pembahasan"
              >
                <IconCross size={14} />
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KuisPage() {
  return (
    <RequireAuth>
      <Suspense
        fallback={
          <div className="grid min-h-[60vh] place-items-center bg-canvas">
            <p className="text-caption text-ink-3">Memuat evaluasi…</p>
          </div>
        }
      >
        <KuisInner />
      </Suspense>
    </RequireAuth>
  );
}
