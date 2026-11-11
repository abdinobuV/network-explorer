"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { Container, Eyebrow, Btn, Badge, Meter } from "@/components/ui";
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

  /* Fokus ke dialog + tutup dengan Escape (aksesibilitas modal). */
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
      <div>
        <Navbar />
        <Container width="page" className="py-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-6">
            <div>
              <Eyebrow>Lembar ujian · studi kasus</Eyebrow>
              <h1 className="mt-2 font-serif text-head">Kuis akhir</h1>
              <p className="mt-2 max-w-2xl text-caption text-ink-2">
                Sepuluh soal studi kasus tentang struktur, aliran data, dan dampak gangguan. Pilih
                satu jawaban untuk setiap soal. Tidak ada batas waktu.
              </p>
            </div>
            <p className="font-mono text-micro uppercase tracking-[0.12em] text-ink-3">
              {answered}/{QUIZ.length} dijawab
            </p>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
            {/* ---------------------------------------------- Soal */}
            <div>
              <article className="border border-rule bg-paper p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-mono text-caption text-blueprint">
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

                <p className="mt-3 font-mono text-micro uppercase tracking-[0.12em] text-ink-3">
                  {q.tag}
                </p>
                <h2 className="mt-2 font-serif text-title leading-snug">{q.q}</h2>

                <div className="mt-4 border-l-2 border-rule-2 bg-paper-2 px-4 py-3">
                  <p className="font-mono text-micro uppercase tracking-[0.12em] text-ink-4">
                    Kasus
                  </p>
                  <p className="mt-1 text-caption leading-relaxed text-ink-2">{q.case}</p>
                </div>

                <ul className="mt-5 space-y-2">
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
                          className={[
                            "flex w-full items-start gap-3 border px-4 py-3 text-left transition-colors",
                            reveal && correct
                              ? "border-green bg-green-2"
                              : reveal && picked
                                ? "border-redpen bg-redpen-2"
                                : picked
                                  ? "border-blueprint bg-blueprint-3"
                                  : "border-rule bg-paper hover:border-ink-2",
                          ].join(" ")}
                        >
                          <span
                            aria-hidden="true"
                            className={[
                              "mt-0.5 grid h-5 w-5 shrink-0 place-items-center border font-mono text-micro",
                              reveal && correct
                                ? "border-green bg-green text-paper"
                                : reveal && picked
                                  ? "border-redpen bg-redpen text-paper"
                                  : picked
                                    ? "border-blueprint bg-blueprint text-paper"
                                    : "border-rule-2 text-ink-3",
                            ].join(" ")}
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
                          <span className="text-caption leading-relaxed text-ink-2">{o}</span>
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
                  ← Sebelumnya
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
                      onClick={() => {
                        setIdx((i) => i + 1);
                        setFeedback(null);
                      }}
                    >
                      Berikutnya →
                    </Btn>
                  ) : (
                    <Btn onClick={submit} disabled={answered < QUIZ.length}>
                      Kumpulkan ({answered}/{QUIZ.length})
                    </Btn>
                  )}
                </div>
              </div>

              {answered < QUIZ.length && idx === QUIZ.length - 1 && (
                <p className="mt-2 text-caption text-amber">
                  Lengkapi {QUIZ.length - answered} jawaban lagi sebelum mengumpulkan.
                </p>
              )}
            </div>

            {/* ---------------------------------------------- Sisi */}
            <aside className="space-y-5">
              <div className="border border-rule bg-paper">
                <div className="border-b border-rule bg-paper-2 px-4 py-2">
                  <Eyebrow>Progres pengerjaan</Eyebrow>
                </div>
                <div className="p-4">
                  <Meter value={answered} total={QUIZ.length} label="Soal terjawab" />
                  <p className="mt-2 font-mono text-micro text-ink-3">{pct}% selesai</p>

                  <div className="mt-4 grid grid-cols-5 gap-1.5">
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
                        className={[
                          "relative grid h-9 place-items-center border font-mono text-caption",
                          i === idx
                            ? "border-ink bg-ink text-paper"
                            : ans[x.id] !== undefined
                              ? "border-green/50 bg-green-2 text-green"
                              : "border-rule text-ink-3 hover:border-ink-2",
                        ].join(" ")}
                      >
                        {i + 1}
                        {marked[x.id] && (
                          <span
                            aria-hidden="true"
                            className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-amber"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border border-rule bg-paper p-4">
                <Eyebrow>Petunjuk</Eyebrow>
                <ul className="mt-2 space-y-1.5 text-caption text-ink-2">
                  <li>Baca kondisi kasus dengan teliti sebelum memilih.</li>
                  <li>Pembahasan muncul setiap kali kamu memilih jawaban.</li>
                  <li>Tandai soal yang ingin kamu tinjau lagi.</li>
                  <li>Nilai terbaik dicatat; XP hanya naik bila nilaimu memecahkan rekor.</li>
                </ul>
                <Btn
                  className="mt-4 w-full"
                  onClick={submit}
                  disabled={answered < QUIZ.length}
                >
                  <IconShield size={14} /> Kumpulkan kuis
                </Btn>
              </div>
            </aside>
          </div>
        </Container>
        <Footer />
      </div>

      {/* ---------------------------------------------- Dialog pembahasan */}
      {feedback && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-4"
          onClick={() => setFeedback(null)}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-judul"
            tabIndex={-1}
            className="w-full max-w-lg border border-rule bg-paper p-7 shadow-lift"
            onClick={(e) => e.stopPropagation()}
          >
            <p
              className={
                feedback.ok
                  ? "font-mono text-micro uppercase tracking-[0.14em] text-green"
                  : "font-mono text-micro uppercase tracking-[0.14em] text-redpen"
              }
            >
              {feedback.ok ? "Tepat sekali" : "Belum tepat"}
            </p>
            <h2 id="dialog-judul" className="mt-2 font-serif text-head">
              {feedback.ok ? "Jawabanmu benar" : "Belum tepat, ya"}
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
