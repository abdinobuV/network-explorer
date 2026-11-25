import { NextResponse } from "next/server";
import {
  generatePedagogicalResponse,
  type AiTutorRequest,
  type AiTutorResponse,
} from "@/lib/ai-tutor";
import type { AiFunctionKind } from "@/lib/analytics";
import { CONCEPT_META, type ConceptKey } from "@/lib/data";

const VALID_FNS = new Set<AiFunctionKind>([
  "explain",
  "example",
  "practice",
  "feedback",
  "brainstorm",
  "compare",
  "reflect",
  "teacher-draft",
]);

const VALID_TOPICS = new Set<ConceptKey>(["bus", "ring", "star", "troubleshooting"]);

/**
 * Route Handler Asisten Belajar AI.
 *
 * - Bila GEMINI_API_KEY diatur pada environment server, memanggil Gemini API
 *   dengan system prompt pedagogis yang ketat (anti-hallucination, berbasis
 *   kurikulum Network Explorer, mendorong berpikir mandiri).
 * - Bila GEMINI_API_KEY tidak diisi (mode demo/offline/default), langsung
 *   mengembalikan respons dari mesin pedagogis bawaan yang akurat & deterministik.
 */
export async function POST(request: Request) {
  let payload: Partial<AiTutorRequest>;
  try {
    payload = (await request.json()) as Partial<AiTutorRequest>;
  } catch {
    return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400 });
  }

  const fn: AiFunctionKind = payload.fn && VALID_FNS.has(payload.fn) ? payload.fn : "explain";
  const topic: ConceptKey =
    payload.topic && VALID_TOPICS.has(payload.topic) ? payload.topic : "star";
  const prompt = String(payload.prompt ?? "").trim().slice(0, 1200);
  const priorThought = String(payload.priorThought ?? "").trim().slice(0, 600);
  const weakestConcept =
    payload.weakestConcept && VALID_TOPICS.has(payload.weakestConcept)
      ? payload.weakestConcept
      : null;
  const iterationStep =
    typeof payload.iterationStep === "number" && payload.iterationStep > 0
      ? Math.min(20, Math.round(payload.iterationStep))
      : 1;

  if (!prompt) {
    return NextResponse.json({ error: "Prompt tidak boleh kosong." }, { status: 400 });
  }

  const reqData: AiTutorRequest = {
    fn,
    topic,
    prompt,
    priorThought,
    weakestConcept,
    iterationStep,
  };

  const fallback = generatePedagogicalResponse(reqData);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(fallback);
  }

  try {
    const systemPrompt = [
      "Anda adalah Asisten Belajar AI pedagogis untuk mata pelajaran Informatika SMA Kelas XI topik Topologi Jaringan (Bus, Ring, Star, dan Diagnostik Ping) di aplikasi Network Explorer.",
      "Prinsip wajib:",
      "1. Gunakan bahasa Indonesia yang jelas, ringkas (maksimal 220 kata), dan akurat secara teknis.",
      "2. JANGAN mengarang referensi, jurnal, atau angka statistik palsu.",
      "3. Bantu siswa berpikir secara bertahap (guided inquiry); jangan menggantikan proses berpikir siswa.",
      "4. Jika ada pemikiran awal siswa, berikan apresiasi atau koreksi konstruktif terlebih dahulu.",
      `5. Topik fokus: ${CONCEPT_META[topic].label}. Fungsi diminta: ${fn}.`,
      weakestConcept
        ? `6. Konteks Learning Analytics: topik terlemah siswa adalah ${CONCEPT_META[weakestConcept].label}.`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const userText = [
      priorThought ? `Pemikiran awal siswa: ${priorThought}` : "",
      `Prompt siswa (iterasi #${iterationStep}): ${prompt}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userText }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
        }),
        signal: AbortSignal.timeout(12_000),
      },
    );

    if (!res.ok) {
      return NextResponse.json(fallback);
    }

    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const generatedText = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!generatedText) {
      return NextResponse.json(fallback);
    }

    const liveResponse: AiTutorResponse = {
      ...fallback,
      body: generatedText,
      engine: "generative-api",
    };
    return NextResponse.json(liveResponse);
  } catch {
    return NextResponse.json(fallback);
  }
}
