"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { QUIZ } from "@/lib/data";
import { useProg } from "@/lib/store";

export default function Kuis() {
  const r = useRouter();
  const { addXp, setQuizBest } = useProg();
  const [idx, setIdx] = useState(0);
  const [ans, setAns] = useState<Record<number, number>>({});
  const [marked, setMarked] = useState<Record<number, boolean>>({});
  const [feedback, setFeedback] = useState<null | { ok: boolean; explain: string }>(null);
  const q = QUIZ[idx];
  const answered = Object.keys(ans).length;
  const pct = Math.round((answered / QUIZ.length) * 100);

  const choose = (o: number) => {
    setAns((a) => ({ ...a, [q.id]: o }));
    const ok = o === q.answer;
    setFeedback({ ok, explain: q.explain });
  };

  const submit = () => {
    let score = 0;
    QUIZ.forEach((x) => { if (ans[x.id] === x.answer) score++; });
    const xp = score * 100;
    addXp(xp);
    setQuizBest(score);
    try { localStorage.setItem("misi-quiz-last", JSON.stringify({ score, total: QUIZ.length, answers: ans })); } catch {}
    r.push(`/kuis/hasil?score=${score}&total=${QUIZ.length}`);
  };

  return (
    <RequireAuth>
    <div>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-xs font-bold text-[#00c2e0]">EVALUASI • STUDI TOPOLOGI DASAR</div>
        <h1 className="text-3xl font-extrabold">Kuis Akhir</h1>
        <p className="text-slate-400">Uji pemahamanmu tentang struktur, aliran data, dan gangguan jaringan. Pilih satu jawaban untuk setiap soal.</p>
        <div className="mt-5 grid gap-5 md:grid-cols-[1fr_320px]">
          <div>
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#22d3ee]">Soal {idx + 1} dari {QUIZ.length}</span>
                <span className={`chip ${ans[q.id] !== undefined ? "bg-[#00e676]/20 text-[#00e676]" : ""}`}>
                  {ans[q.id] === undefined ? "BELUM DIJAWAB" : "SUDAH DIJAWAB"}
                </span>
              </div>
              <div className="mt-3 text-xs text-slate-400">{q.tag}</div>
              <h2 className="mt-1 text-xl font-extrabold">{q.q}</h2>
              <p className="mt-2 text-sm text-slate-400">{q.case}</p>
              <div className="mt-4 space-y-3">
                {q.options.map((o, i) => (
                  <button
                    key={i}
                    onClick={() => choose(i)}
                    className={`w-full rounded-xl border p-4 text-left text-sm ${
                      ans[q.id] === i ? "border-[#00c2e0] bg-[#00c2e0]/10" : "border-white/10 bg-black/30 hover:border-[#00c2e0]/50"
                    }`}
                  >
                    <span className="mr-2 inline-grid h-5 w-5 place-items-center rounded-full border border-white/30 text-xs">{ans[q.id] === i ? "●" : "○"}</span>
                    <b>{["A", "B", "C", "D"][i]}.</b> {o}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <button disabled={idx === 0} onClick={() => { setIdx(idx - 1); setFeedback(null); }} className="rounded-lg bg-white/10 px-4 py-2 text-sm font-bold disabled:opacity-40">← Sebelumnya</button>
              <div className="flex gap-3">
                <button onClick={() => setMarked((m) => ({ ...m, [q.id]: !m[q.id] }))} className="btn-ghost px-4 py-2 text-sm">
                  {marked[q.id] ? "★ Ditandai" : "Tandai untuk Ditinjau"}
                </button>
                {idx < QUIZ.length - 1 ? (
                  <button onClick={() => { setIdx(idx + 1); setFeedback(null); }} className="btn-neon px-5 py-2 text-sm">Berikutnya →</button>
                ) : (
                  <button onClick={submit} disabled={answered < QUIZ.length} className="btn-neon px-5 py-2 text-sm disabled:opacity-40">
                    Kumpulkan ({answered}/{QUIZ.length})
                  </button>
                )}
              </div>
            </div>
            {answered < QUIZ.length && idx === QUIZ.length - 1 && (
              <p className="mt-2 text-right text-xs text-slate-500">Lengkapi {QUIZ.length - answered} jawaban untuk mengumpulkan.</p>
            )}
          </div>
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-extrabold">Progres pengerjaan</h3>
              <div className="mt-1 flex justify-between text-xs text-slate-400"><span>{answered} dari {QUIZ.length} dijawab</span><span className="text-[#22d3ee]">{pct}%</span></div>
              <div className="mt-2 h-1.5 rounded bg-white/10"><div className="h-full rounded bg-[#00c2e0]" style={{ width: `${pct}%` }} /></div>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {QUIZ.map((x, i) => (
                  <button
                    key={x.id}
                    onClick={() => { setIdx(i); setFeedback(null); }}
                    className={`rounded-lg border py-2 text-sm font-bold ${i === idx ? "border-[#00c2e0] text-[#22d3ee]" : ans[x.id] !== undefined ? "border-[#00e676]/60 bg-[#00e676]/10 text-[#00e676]" : "border-white/10 bg-black/30 text-slate-300"}`}
                  >
                    {i + 1}{marked[x.id] ? " ★" : ""}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-xs text-slate-400">■ Soal aktif ○ Belum dijawab</div>
            </div>
            <div className="card p-5">
              <h3 className="font-extrabold">💡 Petunjuk pengerjaan</h3>
              <p className="mt-1 text-xs text-slate-400">Baca kondisi kasus dengan teliti. Pilih satu opsi, lalu gunakan Berikutnya untuk melanjutkan.</p>
              <p className="mt-2 text-xs text-slate-400">Gunakan nomor soal untuk meninjau ulang. Pembahasan muncul setelah kuis dikumpulkan.</p>
              <button onClick={submit} disabled={answered < QUIZ.length} className="mt-3 w-full rounded-lg bg-white/10 py-2 text-sm font-bold disabled:opacity-40">Kumpulkan Kuis</button>
              <p className="mt-2 text-xs text-slate-500">Lengkapi {QUIZ.length} jawaban untuk mengumpulkan.</p>
            </div>
          </div>
        </div>
      </main>
      <div className="border-t border-white/10 bg-[#0c1d3a]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 text-xs text-slate-400">
          <span>MISI TOPOLOGI • Informatika SMA Kelas XI</span>
          <span>🛡 {ans[q.id] === undefined ? "Jawaban belum dipilih" : "Jawaban tersimpan"} • Tidak ada batas waktu</span>
        </div>
      </div>

      {feedback && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setFeedback(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center text-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className={`mx-auto grid h-14 w-14 place-items-center rounded-full text-2xl ${feedback.ok ? "bg-[#00e676]/15" : "bg-red-100"}`}>
              {feedback.ok ? "✅" : "❌"}
            </div>
            <h3 className="mt-3 text-2xl font-extrabold">{feedback.ok ? "Tepat Sekali!" : "Belum tepat."}</h3>
            <p className="mt-2 text-sm text-slate-600">{feedback.explain}</p>
            <div className={`mx-auto mt-3 inline-block rounded-lg px-4 py-1.5 text-sm font-bold ${feedback.ok ? "bg-[#00e676]/15 text-[#00a650]" : "bg-slate-100 text-slate-600"}`}>
              {feedback.ok ? "+100 XP Berhasil Didapatkan!" : "Yuk lanjut — pembahasan lengkap ada di hasil akhir."}
            </div>
            <button onClick={() => { setFeedback(null); if (idx < QUIZ.length - 1) setIdx(idx + 1); }} className="btn-cyan mt-5 w-full py-3">
              {idx < QUIZ.length - 1 ? "Lanjut ke Soal Berikutnya →" : "Lanjutkan Misi (Selesai)"}
            </button>
          </div>
        </div>
      )}
    </div>
    </RequireAuth>
  );
}
