import { describe, expect, it } from "vitest";
import {
  buildTransparencyStatement,
  composeStructuredPrompt,
  evaluatePromptStructure,
  generatePedagogicalResponse,
} from "@/lib/ai-tutor";

describe("Struktur Prompt TCCO (Pert-12)", () => {
  it("memberi skor rendah pada prompt yang terlalu umum", () => {
    const res = evaluatePromptStructure("Topologi");
    expect(res.score).toBeLessThanOrEqual(1);
    expect(res.suggestions.length).toBeGreaterThanOrEqual(3);
  });

  it("memberi skor 4/4 pada prompt lengkap Task-Context-Constraint-Output", () => {
    const prompt = composeStructuredPrompt({
      task: "Jelaskan perbedaan topologi Bus dan Star",
      context: "untuk siswa kelas XI di lab sekolah",
      constraint: "bahasa sederhana, maksimal 150 kata",
      output: "sertakan satu analogi dan dua pertanyaan pemahaman",
    });
    const res = evaluatePromptStructure(prompt);
    expect(res.score).toBe(4);
    expect(res.found).toEqual({
      task: true,
      context: true,
      constraint: true,
      output: true,
    });
  });
});

describe("Mesin Asisten AI Pedagogis & Transparansi", () => {
  it("menghasilkan respons sesuai konteks, pemikiran awal, dan link sumber primer", () => {
    const res = generatePedagogicalResponse({
      fn: "explain",
      topic: "bus",
      prompt: "Jelaskan dampak backbone putus untuk siswa SMA",
      priorThought: "Menurut saya semua PC jadi putus kalau kabel utama rusak.",
      weakestConcept: "bus",
    });

    expect(res.body).toContain("pemikiran awalmu");
    expect(res.body).toContain("Learning Analytics");
    expect(res.primarySourceLinks.length).toBeGreaterThan(0);
    expect(res.biasOrLimitNote).toContain("Verify before cite");
  });

  it("menyertakan peringatan pedagogical judgment pada mode guru", () => {
    const res = generatePedagogicalResponse({
      fn: "teacher-draft",
      topic: "star",
      prompt: "Buat tiga studi kasus topologi untuk SMK",
    });
    expect(res.body).toContain("pedagogical judgment");
    expect(res.modeLabel).toContain("Mode Guru");
  });

  it("menyusun pernyataan transparansi 5W+C yang rapi", () => {
    const statement = buildTransparencyStatement({
      what: "Asisten AI Network Explorer",
      why: "membandingkan konsep Ring dan Star",
      how: "dengan prompt TCCO dan 2 iterasi",
      verify: "menguji langsung di Sandbox",
      contribution: "kesimpulan dan jawaban kuis disusun sendiri oleh siswa",
    });
    expect(statement).toContain("Asisten AI Network Explorer");
    expect(statement).toContain("Sandbox");
  });
});
