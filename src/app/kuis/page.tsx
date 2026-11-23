"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { Container, Btn, Badge, Meter, cx } from "@/components/ui";
import { IconCheck, IconCross, IconFlag, IconShield } from "@/components/icons";
import { QUIZ } from "@/lib/data";
import { useProg } from "@/lib/store";
import { sfx } from "@/lib/sound";
import { toast } from "@/lib/toast";

const HURUF = ["A", "B", "C", "D"];
const LAST_KEY = "misi-quiz-last";

export default function KuisPage() {
  const router = useRouter();
  const { recordQuiz } = useProg();
  const [idx, setIdx] = useState(0);
  const [ans, setAns] = useState<Record<number, number>>({});
  const [marked, setMarked] = useState<Record<number, boolean>>({});
  const [feedback, setFeedback] = useState<null | { ok: boolean; explain: string }>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const q = QUIZ[idx];
  const answered = Object.keys(ans).length;
  const pct = Math.round((answered / QUIZ.length) * 100);

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
    QUIZ.forEach((x) => {
      if (ans[x.id] === x.answer) score++;
    });
    const gained = recordQuiz(score, QUIZ.length);
    try {
      localStorage.setItem(
        LAST_KEY,
        JSON.stringify({ score, total: QUIZ.length, answers: ans, gained }),
      );
    } catch {
      /* abaikan */
    }
    router.push(`/kuis/hasil?score=${score}&total=${QUIZ.length}`);
    toast(
      gained > 0
        ? `Kuis dikumpulkan. +${gained} XP.`
        : "Kuis dikumpulkan. Nilai ini bukan rekor baru, jadi XP tidak bertambah.",
      gained > 0 ? "ok" : "default",
    );
  }

  return (
    <RequireAuth>
      <div className="bg-canvas">
        <Navbar />
        <main id="konten-utama">
          <Container width="page" className="py-8">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
              <div>
                <p className="text-caption font-medium text-signal-bright">Evaluasi studi kasus</p>
                <h1 className="mt-1.5 font-display text-head">Kuis akhir</h1>
                <p className="mt-2 max-w-2xl text-caption text-ink-2">
                  Sepuluh soal studi kasus tentang struktur, aliran data, dan dampak gangguan. Pilih
                  satu jawaban pada tiap soal tanpa batas waktu.
                </p>
              </div>
              <p className="font-mono text-caption text-ink-2">
                {answered}/{QUIZ.length} dijawab
              </p>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_19.5rem]">
              {/* Soal */}
              <div>
                <article className="rounded-lg border border-border bg-surface p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-mono text-caption text-signal-bright">
                      Soal {String(idx + 1).padStart(2, "0")} / {QUIZ.length}
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
                      setIdx((i) => i - 1);
                      setFeedback(null);
                    }}
                    disabled={idx === 0}
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
                    {idx < QUIZ.length - 1 ? (
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
                      <Btn onClick={submit} disabled={answered < QUIZ.length}>
                        Kumpulkan ({answered}/{QUIZ.length})
                      </Btn>
                    )}
                  </div>
                </div>

                {answered < QUIZ.length && idx === QUIZ.length - 1 && (
                  <p className="mt-2.5 text-caption text-caution">
                    Lengkapi {QUIZ.length - answered} jawaban lagi sebelum mengumpulkan.
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
                    <Meter value={answered} total={QUIZ.length} label="Soal terjawab" />
                    <p className="mt-2 font-mono text-micro text-ink-3">{pct}% selesai</p>

                    <div className="mt-4 grid grid-cols-5 gap-2">
                      {QUIZ.map((x, i) => (
                        <button
                          key={x.id}
                          type="button"
                          onClick={() => {
                            setIdx(i);
                            setFeedback(null);
                          }}
                          aria-label={`Ke soal ${i + 1}${marked[x.id] ? ", ditandai" : ""}`}
                          aria-current={i === idx ? "true" : undefined}
                          className={cx(
                            "relative grid h-9 cursor-pointer place-items-center rounded-sm border font-mono text-caption transition-colors",
                            i === idx
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

                <div className="rounded-lg border border-border bg-surface p-5">
                  <p className="text-caption font-semibold text-ink">Petunjuk</p>
                  <ul className="mt-2.5 space-y-1.5 text-caption text-ink-2">
                    <li>Baca kondisi kasus dengan teliti sebelum memilih.</li>
                    <li>Pembahasan muncul setiap kali kamu memilih jawaban.</li>
                    <li>Tandai soal yang ingin kamu tinjau kembali.</li>
                    <li>XP hanya bertambah saat nilaimu memecahkan rekor sebelumnya.</li>
                  </ul>
                  <Btn className="mt-4 w-full" onClick={submit} disabled={answered < QUIZ.length}>
                    <IconShield size={15} /> Kumpulkan kuis
                  </Btn>
                </div>
              </aside>
            </div>
          </Container>
        </main>
        <Footer />
      </div>

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
                  if (idx < QUIZ.length - 1) setIdx((i) => i + 1);
                }}
              >
                {idx < QUIZ.length - 1 ? "Lanjut ke soal berikutnya" : "Selesai"}
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
    </RequireAuth>
  );
}
