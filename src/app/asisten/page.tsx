"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { NextStepFooter } from "@/components/journey-stepper";
import {
  Badge,
  Btn,
  BtnLink,
  Callout,
  Container,
  Field,
  Input,
  PageHeader,
  Select,
  Textarea,
  cx,
} from "@/components/ui";
import {
  IconArrow,
  IconCheck,
  IconInfo,
  IconRefresh,
  IconShield,
  IconSparkle,
} from "@/components/icons";
import {
  AI_FUNCTIONS,
  ITERATION_CHIPS,
  buildTransparencyStatement,
  composeStructuredPrompt,
  evaluatePromptStructure,
  type AiTutorResponse,
} from "@/lib/ai-tutor";
import type { AiFunctionKind } from "@/lib/analytics";
import { CONCEPT_META, HALLUCINATION_CASES, type ConceptKey } from "@/lib/data";
import { useAuth, useLearningAnalytics } from "@/lib/store";
import { toast } from "@/lib/toast";

const ASK_THEN_THINK_STEPS = [
  { id: "ask", title: "Ask", desc: "Gunakan AI untuk memperoleh ide atau penjelasan awal." },
  { id: "check", title: "Check", desc: "Periksa apakah fakta teknis & logikanya masuk akal." },
  { id: "compare", title: "Compare", desc: "Bandingkan dengan modul resmi, glosarium, atau Sandbox." },
  { id: "improve", title: "Improve", desc: "Perbaiki prompt / revisi hasil jika masih kurang tepat." },
  { id: "explain", title: "Explain", desc: "Pastikan kamu bisa menjelaskannya kembali dengan bahasamu sendiri." },
] as const;

const SAMR_MAP = [
  ["Substitution", "AI menggantikan pencarian contoh definisi topologi secara manual."],
  ["Augmentation", "AI menghasilkan variasi latihan & analogi cepat sesuai konteks kelas XI."],
  ["Modification", "Siswa mengkritik output AI & memverifikasi halusinasi lewat Sandbox."],
  [
    "Redefinition",
    "Sistem memadukan Learning Analytics + AI untuk latihan adaptif berbeda tiap siswa.",
  ],
] as const;

/** Merender teks markdown ringan (**tebal** dan *miring*) secara aman tanpa innerHTML. */
function RichBody({ text }: { text: string }) {
  return (
    <div className="space-y-2 text-body leading-relaxed text-ink-2">
      {text.split("\n").map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i}>
            {parts.map((seg, j) =>
              seg.startsWith("**") && seg.endsWith("**") ? (
                <strong key={j} className="font-semibold text-ink">
                  {seg.slice(2, -2)}
                </strong>
              ) : (
                <span key={j}>{seg}</span>
              ),
            )}
          </p>
        );
      })}
    </div>
  );
}

function AsistenInner() {
  const sp = useSearchParams();
  const { isGuru } = useAuth();
  const initialMode: AiFunctionKind =
    isGuru && sp.get("mode") === "teacher" ? "teacher-draft" : "explain";
  const initialTopicRaw = sp.get("topic") as ConceptKey | null;
  const initialTopic: ConceptKey =
    initialTopicRaw && CONCEPT_META[initialTopicRaw] ? initialTopicRaw : "star";

  const { data, summary, addReflection, recordAiTransparency, markHallucinationSolved } =
    useLearningAnalytics();

  const availableFunctions = useMemo(
    () => AI_FUNCTIONS.filter((item) => item.role === "siswa" || isGuru),
    [isGuru],
  );

  const [activeTab, setActiveTab] = useState<"studio" | "hallucination" | "transparansi">("studio");
  const [fn, setFn] = useState<AiFunctionKind>(initialMode);
  const [topic, setTopic] = useState<ConceptKey>(summary.weakestConcept?.concept ?? initialTopic);
  const [priorThought, setPriorThought] = useState("");
  const [promptText, setPromptText] = useState(
    `Anda adalah guru Informatika. Jelaskan konsep ${CONCEPT_META[initialTopic].label} untuk siswa SMA kelas XI di laboratorium komputer. Gunakan bahasa sederhana maksimal 150 kata, sertakan satu analogi dan dua pertanyaan pemahaman.`,
  );

  // Builder TCCO
  const [showBuilder, setShowBuilder] = useState(false);
  const [bTask, setBTask] = useState("Jelaskan cara kerja dan dampak kabel putus");
  const [bContext, setBContext] = useState("untuk siswa SMA kelas XI di lab 24 PC");
  const [bConstraint, setBConstraint] = useState("bahasa sederhana, maksimal 150 kata");
  const [bOutput, setBOutput] = useState("1 analogi sehari-hari dan 2 pertanyaan pemahaman");

  const [iterations, setIterations] = useState(0);
  const [busy, setBusy] = useState(false);
  const [response, setResponse] = useState<AiTutorResponse | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [ownReflection, setOwnReflection] = useState("");

  // Hallucination Lab state
  const [selectedHallucination, setSelectedHallucination] = useState<Record<string, string>>({});
  const [revealedHallucination, setRevealedHallucination] = useState<Record<string, boolean>>({});

  // Transparansi 5W+C state
  const [tWhat, setTWhat] = useState("Asisten Belajar AI Network Explorer");
  const [tWhy, setTWhy] = useState("membantu memahami dan membandingkan konsep topologi jaringan");
  const [tHow, setTHow] = useState("dengan struktur prompt TCCO dan perbaikan iteratif");
  const [tVerify, setTVerify] = useState(
    "membandingkan penjelasan dengan modul resmi, glosarium, dan uji cabut kabel di Sandbox",
  );
  const [tContribution, setTContribution] = useState(
    "seluruh jawaban kuis, pemasangan kabel, dan kesimpulan akhir disusun mandiri oleh siswa",
  );

  const promptEval = useMemo(() => evaluatePromptStructure(promptText), [promptText]);
  const verifiedCount = Object.values(checkedSteps).filter(Boolean).length;
  const generatedStatement = useMemo(
    () =>
      buildTransparencyStatement({
        what: tWhat,
        why: tWhy,
        how: tHow,
        verify: tVerify,
        contribution: tContribution,
      }),
    [tWhat, tWhy, tHow, tVerify, tContribution],
  );

  async function submitPrompt(nextIterationCount?: number) {
    if (!promptText.trim()) {
      toast("Tulis instruksi prompt terlebih dahulu.", "error");
      return;
    }
    if (fn !== "teacher-draft" && priorThought.trim().length < 8) {
      toast(
        "Tulis minimal 1 kalimat pemikiran awalmu dulu sebelum bertanya ke AI (mencegah ketergantungan).",
        "error",
      );
      return;
    }

    const step = nextIterationCount ?? iterations + 1;
    setBusy(true);
    try {
      const res = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fn,
          topic,
          prompt: promptText,
          priorThought,
          weakestConcept: summary.weakestConcept?.concept ?? null,
          iterationStep: step,
        }),
      });
      const json = (await res.json()) as AiTutorResponse;
      setResponse(json);
      setIterations(step);
      setCheckedSteps({ ask: true });
    } catch {
      toast("Gagal menghubungi asisten AI. Coba lagi.", "error");
    } finally {
      setBusy(false);
    }
  }

  function applyIterationChip(append: string) {
    const updated = promptText.trim().endsWith(".")
      ? `${promptText.trim()} ${append}`
      : `${promptText.trim()}. ${append}`;
    setPromptText(updated);
    toast("Iterasi prompt ditambahkan. Tekan Kirim untuk memperbarui respons.", "default");
  }

  function saveProcessEvidence() {
    if (ownReflection.trim().length < 15) {
      toast("Tulis kesimpulan dengan bahasamu sendiri minimal 15 karakter.", "error");
      return;
    }
    addReflection({
      context: `Studio AI (${fn}) · ${CONCEPT_META[topic].short}`,
      topo: topic === "troubleshooting" ? undefined : topic,
      text: ownReflection,
      source: "ai-studio",
    });
    recordAiTransparency({
      fn,
      promptElementsCount: promptEval.score,
      iterations: Math.max(1, iterations),
      verifiedSteps: verifiedCount,
      what: tWhat,
      why: `mempelajari ${CONCEPT_META[topic].label} dengan mode ${fn}`,
      how: `prompt TCCO (${promptEval.score}/4 unsur) melalui ${Math.max(1, iterations)} iterasi`,
      verify: `${verifiedCount}/5 langkah Ask AI, Then Think`,
      contribution: ownReflection.trim().slice(0, 140),
      statement: buildTransparencyStatement({
        what: tWhat,
        why: `mempelajari ${CONCEPT_META[topic].label} (${fn})`,
        how: `menggunakan prompt terstruktur (${promptEval.score}/4 unsur) dan ${Math.max(1, iterations)} iterasi`,
        verify: `verifikasi ${verifiedCount}/5 langkah Ask AI, Then Think dan modul resmi`,
        contribution: "kesimpulan akhir disusun ulang dengan bahasa sendiri oleh siswa",
      }),
    });
    setOwnReflection("");
    toast("Bukti proses & catatan transparansi AI tersimpan ke Rapor!", "ok");
  }

  function saveManualTransparency() {
    recordAiTransparency({
      fn,
      promptElementsCount: promptEval.score,
      iterations: Math.max(1, iterations),
      verifiedSteps: Math.max(3, verifiedCount),
      what: tWhat,
      why: tWhy,
      how: tHow,
      verify: tVerify,
      contribution: tContribution,
      statement: generatedStatement,
    });
    toast("Pernyataan transparansi AI 5W+C disimpan ke Rapor & Sertifikat.", "ok");
  }

  return (
    <div className="bg-canvas">
      <Navbar />
      <main id="konten-utama">
        <Container width="page" className="py-10">
          <PageHeader
            chapter="Pert-12 · AI & Generative AI yang Bertanggung Jawab"
            title="Asisten Belajar AI & Studio Prompt"
            lead="Kolaborasi Human–AI untuk berpikir kritis: pikirkan dulu sebelum bertanya, susun prompt TCCO secara iteratif, verifikasi setiap output, dan dokumentasikan prosesmu."
            meta={
              <span className="inline-flex items-center gap-2.5">
                <Badge tone="blue">Human remains accountable</Badge>
              </span>
            }
          >
            <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Bagian Studio AI">
              {(
                [
                  ["studio", "1. Studio Prompt & Tutor AI"],
                  [
                    "hallucination",
                    `2. Lab Deteksi Hallucination (${data.hallucinationSolved.length}/${HALLUCINATION_CASES.length})`,
                  ],
                  [
                    "transparansi",
                    `3. Pernyataan Transparansi 5W+C (${data.aiSessions.length})`,
                  ],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === key}
                  onClick={() => setActiveTab(key)}
                  className={cx(
                    "cursor-pointer rounded-md border px-3.5 py-2 text-caption font-medium transition-colors",
                    activeTab === key
                      ? "border-signal bg-signal-tint text-signal-bright"
                      : "border-border bg-surface text-ink-2 hover:border-border-2 hover:text-ink",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </PageHeader>

          {/* =============================================================== */}
          {/* TAB 1: STUDIO PROMPT & TUTOR AI                                 */}
          {/* =============================================================== */}
          {activeTab === "studio" && (
            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
              <div className="space-y-6">
                {summary.weakestConcept && (
                  <Callout tone="note" label="Terhubung dengan Learning Analytics">
                    Data belajarmu menunjukkan{" "}
                    <span className="font-semibold text-ink">
                      {summary.weakestConcept.label}
                    </span>{" "}
                    membutuhkan penguatan. Topik fokus otomatis diarahkan ke sana — kamu bebas
                    mengubahnya kapan saja.
                  </Callout>
                )}

                {/* Pilih fungsi AI (Slide 12 + Mode Guru Slide 10-11) */}
                <section className="rounded-lg border border-border bg-surface p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-display text-title">Pilih peran & fungsi AI</h2>
                    <span className="font-mono text-micro text-ink-3">
                      {isGuru ? "7 fungsi siswa + 1 mode khusus guru" : "7 fungsi belajar peserta didik"}
                    </span>
                  </div>
                  <div className="mt-3.5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {availableFunctions.map((item) => {
                      const active = fn === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setFn(item.id);
                            setPromptText(
                              `${item.sampleTask} untuk topik ${CONCEPT_META[topic].label} (siswa SMA kelas XI, bahasa sederhana maks 150 kata).`,
                            );
                          }}
                          aria-pressed={active}
                          className={cx(
                            "cursor-pointer rounded-md border p-3 text-left transition-colors",
                            active
                              ? "border-signal bg-signal-tint"
                              : "border-border bg-canvas/50 hover:border-border-2 hover:bg-surface-2",
                          )}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={cx(
                                "font-display text-caption font-semibold",
                                active ? "text-signal-bright" : "text-ink",
                              )}
                            >
                              {item.label}
                            </span>
                            {item.role === "guru" && <Badge tone="amber">Guru</Badge>}
                          </div>
                          <p className="mt-1 text-micro text-ink-3">{item.short}</p>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Form Prompt + Anti-Ketergantungan + TCCO */}
                <section className="rounded-lg border border-border bg-surface p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Topik fokus" htmlFor="ai-topic">
                      <Select
                        id="ai-topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value as ConceptKey)}
                      >
                        {(Object.keys(CONCEPT_META) as ConceptKey[]).map((k) => (
                          <option key={k} value={k}>
                            {CONCEPT_META[k].label}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <div className="flex flex-col justify-end">
                      <Btn
                        type="button"
                        tone="ghost"
                        onClick={() => setShowBuilder((v) => !v)}
                        className="w-full"
                      >
                        {showBuilder
                          ? "Tutup Builder TCCO"
                          : "Gunakan Builder Prompt TCCO (4 Unsur)"}
                      </Btn>
                    </div>
                  </div>

                  {/* Builder TCCO (Slide 14-15) */}
                  {showBuilder && (
                    <div className="mt-4 rounded-md border border-signal/35 bg-canvas/70 p-4">
                      <p className="font-mono text-micro text-signal-bright">
                        STRUKTUR PROMPT SEDERHANA (PERT-12 SLIDE 14–15)
                      </p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <Field label="1. Task (Apa yang dilakukan?)" htmlFor="b-task">
                          <Input
                            id="b-task"
                            value={bTask}
                            onChange={(e) => setBTask(e.target.value)}
                          />
                        </Field>
                        <Field label="2. Context (Untuk siapa & situasi apa?)" htmlFor="b-ctx">
                          <Input
                            id="b-ctx"
                            value={bContext}
                            onChange={(e) => setBContext(e.target.value)}
                          />
                        </Field>
                        <Field label="3. Constraint (Apa batasannya?)" htmlFor="b-con">
                          <Input
                            id="b-con"
                            value={bConstraint}
                            onChange={(e) => setBConstraint(e.target.value)}
                          />
                        </Field>
                        <Field label="4. Output (Bagaimana bentuk hasilnya?)" htmlFor="b-out">
                          <Input
                            id="b-out"
                            value={bOutput}
                            onChange={(e) => setBOutput(e.target.value)}
                          />
                        </Field>
                      </div>
                      <Btn
                        type="button"
                        tone="signal"
                        size="sm"
                        className="mt-3"
                        onClick={() => {
                          setPromptText(
                            composeStructuredPrompt({
                              task: `${bTask} pada ${CONCEPT_META[topic].label}`,
                              context: bContext,
                              constraint: bConstraint,
                              output: bOutput,
                            }),
                          );
                          setShowBuilder(false);
                          toast("Prompt terstruktur TCCO berhasil dirakit.", "ok");
                        }}
                      >
                        Rakit ke kotak prompt
                      </Btn>
                    </div>
                  )}

                  {/* Gerbang Anti-Ketergantungan (Slide 31) */}
                  {fn !== "teacher-draft" && (
                    <div className="mt-5">
                      <Field
                        label="Langkah 0 — Apa yang sudah kamu pikirkan sendiri sebelum bertanya ke AI?"
                        htmlFor="prior-thought"
                        hint="Mencegah risiko ketergantungan (Pert-12 Slide 31): tuliskan dugaan, jawaban sementara, atau bagian yang membuatmu bingung."
                      >
                        <Textarea
                          id="prior-thought"
                          value={priorThought}
                          onChange={(e) => setPriorThought(e.target.value)}
                          placeholder="Contoh: Menurut saya pada topologi Star, kalau satu kabel PC putus maka hanya PC itu yang mati karena tiap PC punya kabel sendiri ke switch..."
                          className="min-h-20"
                        />
                      </Field>
                    </div>
                  )}

                  {/* Kotak Prompt + Live Skor TCCO */}
                  <div className="mt-5">
                    <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                      <label htmlFor="prompt-input" className="text-caption font-medium text-ink-2">
                        Prompt untuk Asisten AI
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {(
                          [
                            ["Task", promptEval.found.task],
                            ["Context", promptEval.found.context],
                            ["Constraint", promptEval.found.constraint],
                            ["Output", promptEval.found.output],
                          ] as const
                        ).map(([lbl, ok]) => (
                          <Badge key={lbl} tone={ok ? "green" : "neutral"}>
                            {ok ? "✓" : "○"} {lbl}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Textarea
                      id="prompt-input"
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      className="min-h-24"
                    />
                    {promptEval.suggestions.length > 0 && (
                      <p className="mt-1.5 text-micro text-caution">
                        Saran prompt ({promptEval.score}/4 unsur): {promptEval.suggestions[0]}
                      </p>
                    )}
                  </div>

                  {/* Iterative Prompting Chips (Slide 16) */}
                  <div className="mt-4">
                    <p className="text-micro font-medium text-ink-3">
                      Iterative Prompting — perbaiki prompt secara bertahap:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {ITERATION_CHIPS.map((chip) => (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => applyIterationChip(chip.append)}
                          className="cursor-pointer rounded-xs border border-border-2 bg-surface-2 px-2.5 py-1 text-micro text-ink-2 transition-colors hover:border-signal hover:text-signal-bright"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Btn type="button" onClick={() => void submitPrompt()} disabled={busy}>
                      <IconSparkle size={15} />
                      {busy
                        ? "Memproses respons…"
                        : iterations > 0
                          ? `Kirim Iterasi #${iterations + 1}`
                          : "Tanya Asisten AI"}
                    </Btn>
                    {iterations > 0 && (
                      <span className="font-mono text-micro text-ink-3">
                        Iterasi ke-{iterations} · Skor TCCO {promptEval.score}/4
                      </span>
                    )}
                  </div>
                </section>

                {/* Respons AI + Protokol Ask AI, Then Think */}
                {response && (
                  <section className="space-y-5 rounded-lg border border-signal/40 bg-surface p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
                      <div>
                        <p className="font-mono text-micro text-signal-bright">
                          {response.modeLabel}
                        </p>
                        <h3 className="mt-1 font-display text-title text-ink">{response.title}</h3>
                      </div>
                      <Badge tone={response.engine === "generative-api" ? "green" : "blue"}>
                        {response.engine === "generative-api"
                          ? "Generative AI Live"
                          : "Mesin Pedagogis Lokal"}
                      </Badge>
                    </div>

                    <RichBody text={response.body} />

                    <Callout tone="warn" label="Output AI bukan otomatis benar (Verify before cite)">
                      {response.biasOrLimitNote}
                    </Callout>

                    {/* Sumber primer untuk verifikasi */}
                    <div>
                      <p className="text-micro font-semibold text-ink">
                        Bandingkan dengan sumber primer aplikasi:
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {response.primarySourceLinks.map((lnk) => (
                          <BtnLink key={lnk.href} href={lnk.href} tone="ghost" size="sm">
                            {lnk.label} <IconArrow size={12} />
                          </BtnLink>
                        ))}
                      </div>
                    </div>

                    {/* Checklist Ask AI, Then Think (Slide 27) */}
                    <div className="rounded-md border border-border bg-canvas/70 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-display text-body font-semibold text-ink">
                          Checklist Verifikasi: Ask AI, Then Think
                        </p>
                        <span className="font-mono text-micro text-ok">
                          {verifiedCount}/5 langkah
                        </span>
                      </div>
                      <div className="mt-3 space-y-2">
                        {ASK_THEN_THINK_STEPS.map((st) => (
                          <label
                            key={st.id}
                            className="flex cursor-pointer items-start gap-2.5 text-caption text-ink-2"
                          >
                            <input
                              type="checkbox"
                              checked={!!checkedSteps[st.id]}
                              onChange={(e) =>
                                setCheckedSteps((prev) => ({ ...prev, [st.id]: e.target.checked }))
                              }
                              className="mt-1 h-4 w-4 accent-ok"
                            />
                            <span>
                              <strong className="text-ink">{st.title}:</strong> {st.desc}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Pertanyaan lanjutan + Bukti Proses (Slide 22) */}
                    <div className="rounded-md border border-ok/35 bg-ok-tint/40 p-4">
                      <p className="text-micro font-semibold text-ok">
                        Pertanyaan lanjutan untuk menguji pemahamanmu sendiri:
                      </p>
                      <p className="mt-1 text-caption text-ink">{response.followUpQuestion}</p>
                      <div className="mt-3">
                        <Field
                          label="Tulis kesimpulan / jawaban dengan bahasamu sendiri (Bukti Proses)"
                          htmlFor="own-reflection"
                        >
                          <Textarea
                            id="own-reflection"
                            value={ownReflection}
                            onChange={(e) => setOwnReflection(e.target.value)}
                            placeholder="Jelaskan kembali intinya dengan kalimatmu sendiri setelah memverifikasi ke modul / Sandbox..."
                            className="min-h-20"
                          />
                        </Field>
                        <Btn
                          type="button"
                          size="sm"
                          className="mt-3"
                          onClick={saveProcessEvidence}
                        >
                          <IconCheck size={14} /> Simpan sebagai Bukti Proses & Transparansi
                        </Btn>
                      </div>
                    </div>
                  </section>
                )}
              </div>

              {/* Panel Samping: Panduan Human-AI Collaboration & SAMR */}
              <aside className="space-y-5">
                <div className="rounded-lg border border-border bg-surface p-5">
                  <p className="text-caption font-semibold text-ink">Human–AI Collaboration</p>
                  <ol className="mt-3 space-y-2 text-caption text-ink-2">
                    {[
                      "1. Manusia menentukan tujuan belajar.",
                      "2. AI membantu menghasilkan alternatif.",
                      "3. Manusia menilai & mengkritik.",
                      "4. AI membantu revisi bertahap.",
                      "5. Manusia memverifikasi & mengambil keputusan.",
                    ].map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                  <p className="mt-3 font-mono text-micro text-signal-bright">
                    Human remains accountable.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-surface p-5">
                  <p className="text-caption font-semibold text-ink">AI dalam Kerangka SAMR</p>
                  <dl className="mt-3 space-y-2.5 text-micro">
                    {SAMR_MAP.map(([lvl, desc]) => (
                      <div key={lvl} className="border-b border-border-3 pb-2 last:border-0">
                        <dt className="font-mono font-semibold text-signal-bright">{lvl}</dt>
                        <dd className="mt-0.5 text-ink-2">{desc}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="rounded-lg border border-border bg-surface p-5">
                  <p className="text-caption font-semibold text-ink">
                    Tidak semua aktivitas butuh AI
                  </p>
                  <p className="mt-2 text-caption leading-relaxed text-ink-3">
                    Gunakan AI ketika ada nilai tambah pedagogis (analisis kasus, umpan balik,
                    alternatif solusi). Pemasangan kabel dan uji ping tetap wajib kamu coba sendiri!
                  </p>
                </div>
              </aside>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 2: LAB DETEKSI HALLUCINATION & BIAS (Slide 17–20)           */}
          {/* =============================================================== */}
          {activeTab === "hallucination" && (
            <div className="mt-8 space-y-6">
              <Callout tone="warn" label="Jangan percaya hanya karena terdengar meyakinkan">
                Generative AI memprediksi pola bahasa — ia bisa mengarang sitasi jurnal, salah
                menyebut konfigurasi teknis, atau mencampur konsep antar topologi. Temukan jenis
                kesalahan pada 3 kasus di bawah untuk mengasah literasi verifikasimu!
              </Callout>

              <div className="space-y-5">
                {HALLUCINATION_CASES.map((hc, idx) => {
                  const picked = selectedHallucination[hc.id] ?? "";
                  const solved = data.hallucinationSolved.includes(hc.id);
                  const revealed = revealedHallucination[hc.id] || solved;
                  const choices = [
                    "Referensi Palsu",
                    "Pencampuran Konsep",
                    "Hallucination Teknis",
                  ] as const;

                  return (
                    <article
                      key={hc.id}
                      className="rounded-lg border border-border bg-surface p-6"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-mono text-micro text-signal-bright">
                          KASUS VERIFIKASI #{idx + 1}
                        </p>
                        {solved ? (
                          <Badge tone="green">
                            <IconCheck size={12} /> Terverifikasi
                          </Badge>
                        ) : (
                          <Badge tone="amber">Perlu diperiksa</Badge>
                        )}
                      </div>
                      <h2 className="mt-1.5 font-display text-title">{hc.judul}</h2>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="rounded-md border border-border bg-canvas/60 p-4">
                          <p className="text-micro font-semibold text-ink-3">Prompt Siswa</p>
                          <p className="mt-1.5 text-caption text-ink">{hc.promptSiswa}</p>
                        </div>
                        <div className="rounded-md border border-caution/40 bg-caution-tint/50 p-4">
                          <p className="text-micro font-semibold text-caution">
                            Output AI (Terdengar meyakinkan, tetapi keliru!)
                          </p>
                          <p className="mt-1.5 text-caption leading-relaxed text-ink">
                            “{hc.outputAi}”
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-caption font-medium text-ink">
                          Masalah utama apa yang terjadi pada output AI di atas?
                        </p>
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {choices.map((ch) => (
                            <Btn
                              key={ch}
                              type="button"
                              size="sm"
                              tone={
                                revealed && ch === hc.jenisMasalah
                                  ? "primary"
                                  : picked === ch
                                    ? "signal"
                                    : "ghost"
                              }
                              onClick={() => {
                                setSelectedHallucination((prev) => ({ ...prev, [hc.id]: ch }));
                                if (ch === hc.jenisMasalah) {
                                  setRevealedHallucination((prev) => ({ ...prev, [hc.id]: true }));
                                  markHallucinationSolved(hc.id);
                                  toast("Tepat! Kamu berhasil mendeteksi halusinasi AI.", "ok");
                                } else {
                                  toast(
                                    "Belum tepat — baca lagi detail klaim pada output AI.",
                                    "error",
                                  );
                                }
                              }}
                            >
                              {ch}
                            </Btn>
                          ))}
                        </div>
                      </div>

                      {revealed && (
                        <div className="mt-5 rounded-md border border-ok/35 bg-ok-tint/50 p-4 space-y-2.5">
                          <p className="text-micro font-semibold text-ok">
                            Analisis Verifikasi ({hc.jenisMasalah})
                          </p>
                          <p className="text-caption text-ink">
                            <strong>Kesalahan AI:</strong> {hc.temuanKeliru}
                          </p>
                          <p className="text-caption text-ink-2">
                            <strong>Fakta benar:</strong> {hc.faktaBenar}
                          </p>
                          <ul className="list-disc space-y-1 pl-5 text-micro text-ink-2">
                            {hc.langkahVerifikasi.map((step) => (
                              <li key={step}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 3: PERNYATAAN TRANSPARANSI AI 5W+C (Slide 23–25)            */}
          {/* =============================================================== */}
          {activeTab === "transparansi" && (
            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <section className="rounded-lg border border-border bg-surface p-6 space-y-4">
                <div>
                  <p className="font-mono text-micro text-signal-bright">
                    INTEGRITAS AKADEMIK · PERT-12 SLIDE 23–25
                  </p>
                  <h2 className="mt-1 font-display text-title">
                    Generator Pernyataan Penggunaan AI (5W + Contribution)
                  </h2>
                  <p className="mt-1 text-caption text-ink-2">
                    Tujuan transparansi bukan sekadar pengakuan memakai AI, tetapi menjelaskan
                    secara jujur bagaimana AI digunakan, diverifikasi, dan apa kontribusi
                    intelektualmu sendiri.
                  </p>
                </div>

                <Field label="What? — AI apa yang digunakan?" htmlFor="t-what">
                  <Input id="t-what" value={tWhat} onChange={(e) => setTWhat(e.target.value)} />
                </Field>
                <Field label="Why? — Untuk tujuan apa?" htmlFor="t-why">
                  <Input id="t-why" value={tWhy} onChange={(e) => setTWhy(e.target.value)} />
                </Field>
                <Field label="How? — Bagaimana AI digunakan?" htmlFor="t-how">
                  <Input id="t-how" value={tHow} onChange={(e) => setTHow(e.target.value)} />
                </Field>
                <Field label="Verify? — Bagaimana hasil diperiksa?" htmlFor="t-verify">
                  <Textarea
                    id="t-verify"
                    value={tVerify}
                    onChange={(e) => setTVerify(e.target.value)}
                    className="min-h-20"
                  />
                </Field>
                <Field
                  label="Contribution? — Apa kontribusi intelektualmu sendiri?"
                  htmlFor="t-contrib"
                >
                  <Textarea
                    id="t-contrib"
                    value={tContribution}
                    onChange={(e) => setTContribution(e.target.value)}
                    className="min-h-20"
                  />
                </Field>

                <div className="rounded-md border border-signal/35 bg-canvas/70 p-4">
                  <p className="text-micro font-semibold text-signal-bright">
                    Pratinjau Pernyataan Transparansi (otomatis masuk Rapor Cetak)
                  </p>
                  <p className="mt-2 text-caption italic leading-relaxed text-ink">
                    “{generatedStatement}”
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Btn type="button" onClick={saveManualTransparency}>
                    <IconShield size={15} /> Simpan ke Portofolio & Rapor
                  </Btn>
                  <BtnLink href="/cetak" tone="ghost">
                    Lihat di Rapor Cetak <IconArrow size={14} />
                  </BtnLink>
                </div>
              </section>

              <aside className="space-y-5">
                <div className="rounded-lg border border-border bg-surface p-5">
                  <h3 className="font-display text-body font-semibold text-ink">
                    Riwayat Transparansi Tercatat ({data.aiSessions.length})
                  </h3>
                  {data.aiSessions.length === 0 ? (
                    <p className="mt-2 text-caption text-ink-3">
                      Belum ada catatan transparansi AI. Simpan pernyataan di samping agar tercetak
                      pada rapor prosesmu.
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-3">
                      {data.aiSessions.slice(0, 5).map((s) => (
                        <li
                          key={s.id}
                          className="rounded-md border border-border-3 bg-canvas/60 p-3 text-micro"
                        >
                          <p className="font-mono text-signal-bright">
                            {new Date(s.at).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                            })}{" "}
                            · {s.fn} ({s.verifiedSteps}/5 verifikasi)
                          </p>
                          <p className="mt-1 text-ink-2">{s.statement}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <Callout tone="note" label="Apakah memakai AI itu plagiarisme?">
                  Tergantung aturan tugas, transparansi, dan kontribusi intelektualmu. Menyamarkan
                  hasil AI sebagai pekerjaan sendiri tetap merupakan pelanggaran integritas
                  akademik.
                </Callout>
              </aside>
            </div>
          )}

          <NextStepFooter
            prev={{ label: "Dashboard Analitik", href: "/analitik" }}
            next={{
              label: "Lanjut ke Tahap 5 (Akhir): Sertifikat & Rapor Proses",
              href: "/cetak",
              description:
                "Cek 5 syarat kelulusan, tinjau bukti proses & transparansi AI, lalu cetak Sertifikat Kompetensi Digital.",
            }}
            hint="TAHAP 4 SELESAI → TAHAP 5 (KELULUSAN)"
          />

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-micro text-ink-3">
            <span className="inline-flex items-center gap-2">
              <IconInfo size={14} className="text-signal-bright" />
              Prinsip TPACK: Content (Topologi) + Pedagogy (Guided Inquiry) + Technology (AI &
              Analytics)
            </span>
            <div className="flex flex-wrap gap-4">
              <Link href="/analitik" className="text-signal-bright hover:underline">
                <span className="inline-flex items-center gap-1">
                  <IconRefresh size={12} /> Lihat Dashboard Analitik
                </span>
              </Link>
              <Link href="/misi" className="text-signal-bright hover:underline">
                Peta Misi
              </Link>
            </div>
          </div>
        </Container>
      </main>
      <Footer help />
    </div>
  );
}

export default function AsistenPage() {
  return (
    <RequireAuth>
      <Suspense
        fallback={
          <div className="grid min-h-[60vh] place-items-center bg-canvas">
            <p className="text-caption text-ink-3">Memuat Asisten Belajar AI…</p>
          </div>
        }
      >
        <AsistenInner />
      </Suspense>
    </RequireAuth>
  );
}
