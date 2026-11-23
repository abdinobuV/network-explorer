"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { Container, PageHeader, BtnLink, Badge, Callout } from "@/components/ui";
import { IconArrow, IconCheck, IconCross, IconPrint, IconTrophy } from "@/components/icons";
import { QUIZ } from "@/lib/data";
import { useProg } from "@/lib/store";
import { levelProgress, XP_PER_LEVEL } from "@/lib/progression";

const HURUF = ["A", "B", "C", "D"];
const LAST_KEY = "misi-quiz-last";

interface Simpanan {
  score: number;
  total: number;
  answers?: Record<number, number>;
  gained?: number;
}

function predikat(nilai: number, total: number) {
  const persen = Math.round((nilai / total) * 100);
  if (persen >= 80) {
    return {
      label: "Baik sekali",
      tone: "green" as const,
      saran: "Lanjut ke simulasi lanjutan dan coba menjelaskan topologi ini ke teman sebaya.",
    };
  }
  if (persen >= 60) {
    return {
      label: "Baik",
      tone: "blue" as const,
      saran: "Ulangi bab dengan nilai terendah, lalu kerjakan ulang kuis.",
    };
  }
  return {
    label: "Perlu diulang",
    tone: "amber" as const,
    saran: "Baca ulang materi dan ulangi papan praktik sebelum mengulang kuis.",
  };
}

function HasilInner() {
  const sp = useSearchParams();
  const { xp, quizBest, quizAttempts } = useProg();

  const dariUrl = Number(sp.get("score"));
  let simpanan: Simpanan | null = null;
  try {
    simpanan = JSON.parse(localStorage.getItem(LAST_KEY) || "null") as Simpanan | null;
  } catch {
    simpanan = null;
  }

  const total = Number(sp.get("total")) || simpanan?.total || QUIZ.length;
  const score = Number.isFinite(dariUrl) && dariUrl >= 0 ? dariUrl : (simpanan?.score ?? 0);
  const jawaban = simpanan?.answers ?? {};
  const gained = simpanan?.gained ?? 0;
  const lv = levelProgress(xp);
  const p = predikat(score, total);
  const benar = QUIZ.filter((q) => jawaban[q.id] === q.answer).length;

  return (
    <div className="bg-canvas">
      <Navbar />
      <main id="konten-utama">
        <Container width="page" className="py-8">
          <PageHeader
            chapter="Laporan evaluasi"
            title="Hasil kuis akhir"
            lead="Nilai, pembahasan tiap soal, dan rekomendasi belajar berdasarkan jawabanmu."
            meta={`${score}/${total} benar`}
          />

          <div className="mt-6 grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
            {/* Ringkasan */}
            <aside className="min-w-0 space-y-5">
              <div className="rounded-lg border border-border bg-surface p-6 text-center">
                <p className="text-caption font-medium text-ink-3">Skor kuis</p>
                <p className="mt-2 font-display text-cover leading-none text-ink">
                  {score}
                  <span className="text-ink-4">/{total}</span>
                </p>
                <p className="mt-1.5 text-micro text-ink-3">jawaban benar</p>
                <div className="mt-4">
                  <Badge tone={p.tone}>{p.label}</Badge>
                </div>
                {gained > 0 ? (
                  <p className="mt-4 rounded-md border border-ok/40 bg-ok-tint px-3 py-2 font-mono text-caption text-ok">
                    +{gained} XP
                  </p>
                ) : (
                  <p className="mt-4 rounded-md border border-border bg-surface-2 px-3 py-2 text-micro text-ink-3">
                    XP tidak bertambah karena nilai ini bukan rekor baru.
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-border bg-surface p-5">
                <p className="text-caption font-semibold text-ink">Lencana</p>
                <div className="mt-3 flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-caution/45 bg-caution-tint text-caution">
                    <IconTrophy size={18} />
                  </span>
                  <div>
                    <p className="font-medium text-ink">
                      {score === total
                        ? "Network Explorer: Pemula Tuntas"
                        : "Network Explorer: Pemula"}
                    </p>
                    <p className="mt-0.5 text-caption text-ink-3">
                      {score === total
                        ? "Semua soal studi kasus dijawab dengan benar."
                        : `Skor terbaik ${quizBest ?? score}/${total} dari ${quizAttempts} percobaan.`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-surface p-5">
                <p className="text-caption font-semibold text-ink">Tingkat belajar</p>
                <p className="mt-2 font-mono text-caption text-ok">
                  {xp.toLocaleString("id-ID")} XP · Tingkat {lv.level}
                </p>
                <div className="mt-2.5 h-2 overflow-hidden rounded-xs border border-border-2 bg-surface-3">
                  <div className="h-full bg-signal" style={{ width: `${lv.percent}%` }} />
                </div>
                <p className="mt-2 font-mono text-micro text-ink-3">
                  {lv.need - lv.into} XP lagi menuju tingkat {lv.level + 1} ({XP_PER_LEVEL} XP per
                  tingkat)
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <BtnLink href="/cetak" className="w-full">
                  <IconPrint size={14} /> Cetak rapor
                </BtnLink>
                <BtnLink href="/kuis" tone="ghost" className="w-full">
                  Ulangi kuis
                </BtnLink>
                <BtnLink href="/misi" tone="quiet" className="w-full">
                  <IconArrow size={14} /> Kembali ke peta misi
                </BtnLink>
              </div>
            </aside>

            {/* Isi */}
            <div className="min-w-0 space-y-6">
              <section className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface">
                <div className="border-b border-border bg-surface-2 px-5 py-3">
                  <h2 className="font-display text-body font-semibold text-ink">
                    Ringkasan karakter tiap topologi
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="tech-table min-w-[34rem]">
                    <thead>
                      <tr>
                        <th scope="col">Topologi</th>
                        <th scope="col">Bentuk jaringan</th>
                        <th scope="col">Jika satu tautan putus</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="font-medium text-ink">Bus</td>
                        <td>Satu kabel utama (backbone) dengan cabang ke tiap PC</td>
                        <td>Segmen di sisi putusnya terputus dari jaringan</td>
                      </tr>
                      <tr>
                        <td className="font-medium text-ink">Ring</td>
                        <td>Lingkaran tertutup, data searah jarum jam</td>
                        <td>Aliran berhenti karena tidak ada jalur alternatif pada ring tunggal</td>
                      </tr>
                      <tr>
                        <td className="font-medium text-ink">Star</td>
                        <td>Setiap PC tersambung ke satu switch pusat</td>
                        <td>Hanya PC yang kabelnya putus yang terisolasi</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <Callout tone={score / total >= 0.8 ? "ok" : "warn"} label="Rekomendasi belajar">
                {p.saran}
                {score < total && (
                  <>
                    {" "}
                    Materi yang paling sering tertukar biasanya ada pada{" "}
                    <Link href="/materi/ring" className="font-medium text-signal-bright hover:underline">
                      modul Ring
                    </Link>
                    .
                  </>
                )}
              </Callout>

              <section className="overflow-hidden rounded-lg border border-border bg-surface">
                <div className="border-b border-border bg-surface-2 px-5 py-3">
                  <h2 className="font-display text-body font-semibold text-ink">
                    Pembahasan tiap soal
                  </h2>
                </div>
                <div className="divide-y divide-border">
                  {QUIZ.map((q) => {
                    const dipilih = jawaban[q.id];
                    const isBenar = dipilih === q.answer;
                    const dijawab = dipilih !== undefined;
                    return (
                      <details key={q.id} className="group">
                        <summary className="flex cursor-pointer items-start gap-3 px-5 py-3.5 hover:bg-surface-2/60">
                          <span className="font-mono text-caption text-ink-3">
                            {String(q.id).padStart(2, "0")}
                          </span>
                          <span className="flex-1 text-caption text-ink">{q.q}</span>
                          {dijawab ? (
                            <span className={isBenar ? "text-ok" : "text-fault"}>
                              {isBenar ? <IconCheck size={14} /> : <IconCross size={14} />}
                            </span>
                          ) : (
                            <span className="text-micro text-ink-4">Belum dijawab</span>
                          )}
                        </summary>
                        <div className="border-t border-border-3 bg-canvas/60 px-5 py-4">
                          <p className="text-micro font-semibold text-ok">Kunci jawaban</p>
                          <p className="mt-1 text-caption text-ink">
                            {HURUF[q.answer]}. {q.options[q.answer]}
                          </p>
                          {dijawab && !isBenar && (
                            <p className="mt-2 text-caption text-fault">
                              Jawabanmu: {HURUF[dipilih]}. {q.options[dipilih]}
                            </p>
                          )}
                          <p className="mt-3 text-caption leading-relaxed text-ink-2">{q.explain}</p>
                        </div>
                      </details>
                    );
                  })}
                </div>
              </section>

              <p className="font-mono text-micro text-ink-4">
                {benar} dari {total} soal dijawab benar · Percobaan ke-{quizAttempts}
              </p>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

export default function HasilPage() {
  return (
    <RequireAuth>
      <Suspense
        fallback={
          <div className="grid min-h-[60vh] place-items-center bg-canvas">
            <p className="text-caption text-ink-3">Memuat hasil…</p>
          </div>
        }
      >
        <HasilInner />
      </Suspense>
    </RequireAuth>
  );
}
