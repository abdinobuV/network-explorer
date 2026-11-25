/**
 * Mesin Asisten Belajar AI Pedagogis — menerapkan Pertemuan 12 (AI & Generative AI).
 *
 * Fitur utama:
 *  - Evaluasi struktur prompt TCCO: Task, Context, Constraint, Output (Slide 14-15)
 *  - 7 fungsi AI untuk peserta didik: Explain, Example, Practice, Feedback, Brainstorm, Compare, Reflect (Slide 12)
 *  - Mode Asisten Guru: draft studi kasus, soal, rubrik + pedagogical judgment (Slide 10-11)
 *  - Anti-ketergantungan ("Apa yang kamu pikirkan sendiri sebelum bertanya?" — Slide 31)
 *  - Prinsip verifikasi "Ask AI, Then Think" & anti-hallucination (Slide 17-20, 27)
 *  - Transparansi Penggunaan AI 5W+C (Slide 24-25)
 */

import { ADAPTIVE_DRILLS, CONCEPT_META, TOPOLOGI, type ConceptKey, type TopoKey } from "@/lib/data";
import { TOPO_SPECS } from "@/lib/topology-model";
import type { AiFunctionKind } from "@/lib/analytics";

export interface PromptStructureResult {
  score: number; // 0..4
  found: {
    task: boolean;
    context: boolean;
    constraint: boolean;
    output: boolean;
  };
  suggestions: string[];
}

export interface AiTutorRequest {
  fn: AiFunctionKind;
  topic: ConceptKey;
  prompt: string;
  priorThought?: string;
  weakestConcept?: ConceptKey | null;
  iterationStep?: number;
}

export interface AiTutorResponse {
  title: string;
  modeLabel: string;
  body: string;
  followUpQuestion: string;
  verifyHints: string[];
  primarySourceLinks: Array<{ label: string; href: string }>;
  biasOrLimitNote: string;
  engine: "pedagogical-local" | "generative-api";
}

export const AI_FUNCTIONS: Array<{
  id: AiFunctionKind;
  label: string;
  role: "siswa" | "guru";
  short: string;
  sampleTask: string;
}> = [
  {
    id: "explain",
    label: "Explain",
    role: "siswa",
    short: "Meminta penjelasan konsep secara bertahap",
    sampleTask: "Jelaskan mengapa satu kabel putus berdampak berbeda pada topologi ini",
  },
  {
    id: "example",
    label: "Example",
    role: "siswa",
    short: "Meminta contoh nyata atau analogi sehari-hari",
    sampleTask: "Berikan satu contoh kasus di laboratorium sekolah dan satu analogi sederhana",
  },
  {
    id: "practice",
    label: "Practice",
    role: "siswa",
    short: "Membuat latihan adaptif sesuai kebutuhanmu",
    sampleTask: "Buat dua soal latihan singkat tentang gangguan jaringan beserta petunjuk berpikirnya",
  },
  {
    id: "feedback",
    label: "Feedback",
    role: "siswa",
    short: "Memeriksa draf jawaban atau argumenmu",
    sampleTask: "Periksa argumen saya tentang pemilihan topologi dan tunjukkan bagian yang masih kurang tepat",
  },
  {
    id: "brainstorm",
    label: "Brainstorm",
    role: "siswa",
    short: "Mengembangkan ide perancangan jaringan",
    sampleTask: "Bantu saya menyusun alternatif skenario perancangan jaringan 24 PC untuk ruang praktik",
  },
  {
    id: "compare",
    label: "Compare",
    role: "siswa",
    short: "Membandingkan dua konsep secara terstruktur",
    sampleTask: "Bandingkan topologi Bus, Ring, dan Star dari sisi biaya, isolasi gangguan, dan skalabilitas",
  },
  {
    id: "reflect",
    label: "Reflect",
    role: "siswa",
    short: "Mengajukan pertanyaan refleksi mendalam",
    sampleTask: "Ajukan tiga pertanyaan refleksi agar saya bisa menguji apakah saya benar-benar paham",
  },
  {
    id: "teacher-draft",
    label: "Draft Guru",
    role: "guru",
    short: "Menyusun draft studi kasus, soal, atau rubrik (guru tetap menilai)",
    sampleTask: "Buat tiga studi kasus sederhana tentang pemilihan topologi jaringan untuk siswa SMA/SMK lengkap dengan draft rubrik",
  },
];

export const ITERATION_CHIPS: Array<{ label: string; append: string }> = [
  { label: "+ Fokus lab sekolah", append: "Gunakan konteks laboratorium komputer sekolah 24 PC." },
  { label: "+ Bahasa sederhana", append: "Gunakan bahasa sederhana, maksimal 150 kata." },
  { label: "+ Sertakan analogi", append: "Sertakan satu analogi aktivitas sehari-hari." },
  { label: "+ 2 pertanyaan cek", append: "Tambahkan dua pertanyaan untuk mengecek pemahaman saya." },
  { label: "+ Format tabel/poin", append: "Sajikan dalam bentuk poin terstruktur yang ringkas." },
];

/**
 * Mengevaluasi kelengkapan 4 unsur Struktur Prompt Sederhana (Pert-12 Slide 14–15):
 * Task, Context, Constraint, Output.
 */
export function evaluatePromptStructure(prompt: string): PromptStructureResult {
  const p = prompt.toLowerCase().trim();
  const task =
    /\b(jelaskan|buat|buatkan|bandingkan|periksa|beri|berikan|susun|ajukan|analisis|rancang|evaluasi|bantu|tuliskan|uji)\b/.test(
      p,
    );
  const context =
    /\b(siswa|kelas|sma|smk|lab|laboratorium|sekolah|pemula|bus|ring|star|switch|backbone|ping|jaringan|topologi|guru)\b/.test(
      p,
    );
  const constraint =
    /\b(sederhana|singkat|maksimal|maks|kata|kalimat|tanpa|jangan|bahasa|langkah|fokus|khusus|hanya)\b/.test(
      p,
    );
  const output =
    /\b(analogi|contoh|tabel|poin|soal|pertanyaan|kasus|rubrik|daftar|langkah|kesimpulan|ringkasan|feedback|umpan balik)\b/.test(
      p,
    );

  const score = [task, context, constraint, output].filter(Boolean).length;
  const suggestions: string[] = [];
  if (!task) suggestions.push("Tambahkan Task: kata kerja perintah yang jelas (mis. Jelaskan / Bandingkan / Periksa).");
  if (!context) suggestions.push("Tambahkan Context: untuk siapa dan situasi apa (mis. siswa kelas XI / lab 24 PC).");
  if (!constraint) suggestions.push("Tambahkan Constraint: batasan panjang atau gaya bahasa (mis. bahasa sederhana, maks 150 kata).");
  if (!output) suggestions.push("Tambahkan Output: bentuk hasil yang diinginkan (mis. 1 analogi + 2 pertanyaan pemahaman).");

  return { score, found: { task, context, constraint, output }, suggestions };
}

export function composeStructuredPrompt(parts: {
  task: string;
  context: string;
  constraint: string;
  output: string;
}): string {
  const segments = [
    parts.context.trim() ? `Konteks: ${parts.context.trim()}.` : "",
    parts.task.trim() ? `${parts.task.trim()}.` : "",
    parts.constraint.trim() ? `Batasan: ${parts.constraint.trim()}.` : "",
    parts.output.trim() ? `Format hasil: ${parts.output.trim()}.` : "",
  ].filter(Boolean);
  return segments.join(" ");
}

/** Menyusun pernyataan transparansi penggunaan AI (Pert-12 Slide 24–25). */
export function buildTransparencyStatement(input: {
  what: string;
  why: string;
  how: string;
  verify: string;
  contribution: string;
}): string {
  const what = input.what.trim() || "Asisten Belajar AI Network Explorer";
  const why = input.why.trim() || "membantu memahami konsep topologi jaringan";
  const how = input.how.trim() || "melalui prompting terstruktur dan iteratif";
  const verify =
    input.verify.trim() || "dibandingkan dengan modul resmi, glosarium, dan simulasi Sandbox";
  const contribution =
    input.contribution.trim() || "seluruh analisis akhir, jawaban, dan refleksi disusun sendiri oleh siswa";
  return `${what} digunakan untuk ${why} ${how}. Seluruh hasil telah diperiksa dengan cara ${verify}, dan ${contribution}.`;
}

function asTopo(concept: ConceptKey): TopoKey {
  return concept === "bus" || concept === "ring" || concept === "star" ? concept : "star";
}

/**
 * Mesin respons pedagogis bawaan (deterministik, akurat sesuai kurikulum Network Explorer).
 * Dipakai langsung di mode demo/offline dan sebagai fallback aman dari Route Handler.
 */
export function generatePedagogicalResponse(req: AiTutorRequest): AiTutorResponse {
  const topoKey = asTopo(req.topic);
  const info = TOPOLOGI[topoKey];
  const spec = TOPO_SPECS[topoKey];
  const meta = CONCEPT_META[req.topic];
  const prior = req.priorThought?.trim();
  const iterNote =
    req.iterationStep && req.iterationStep > 1
      ? ` (Iterasi prompt ke-${req.iterationStep} — respons diperdalam sesuai penyempurnaanmu)`
      : "";

  const priorAck = prior
    ? `**Tanggapan atas pemikiran awalmu:** Kamu sudah memulai dengan dugaan sendiri ("${prior.slice(0, 140)}${prior.length > 140 ? "…" : ""}"). Langkah berpikir mandiri sebelum bertanya AI ini penting agar kemampuan analisis tetap terlatih.\n\n`
    : "";

  const adaptiveNote =
    req.weakestConcept && req.weakestConcept === req.topic
      ? `\n\n**Catatan Learning Analytics:** Data belajar menunjukkan konsep **${CONCEPT_META[req.weakestConcept].label}** sedang membutuhkan penguatan ekstra. Fokuskan verifikasi pada titik lemah ini.`
      : "";

  const primarySourceLinks = [
    { label: `Modul ${meta.short}`, href: meta.materiHref },
    { label: `Sandbox ${meta.short}`, href: meta.sandboxHref },
    { label: "Tabel Perbandingan", href: "/perbandingan" },
    { label: "Glosarium Resmi", href: "/glosarium" },
  ];

  const verifyHints = [
    `Cocokkan penjelasan ini dengan bab ${meta.label} dan aturan kabel (${spec.rule}).`,
    `Uji klaim dampak gangguan langsung di Sandbox ${meta.short} dengan mencabut satu kabel lalu mengirim ping.`,
    "Pastikan kamu bisa menjelaskan ulang konsepnya dengan kalimatmu sendiri tanpa melihat layar AI.",
  ];

  const biasOrLimitNote =
    "Output AI dihasilkan berdasarkan pola teks dan tidak otomatis benar. Selalu lakukan verifikasi terhadap sumber primer (modul & hasil simulasi) sebelum menyimpulkan atau mengutip (Verify before cite).";

  switch (req.fn) {
    case "explain":
      return {
        title: `Penjelasan Terstruktur: ${meta.label}${iterNote}`,
        modeLabel: "Explain · Meminta Penjelasan",
        body:
          priorAck +
          (req.topic === "troubleshooting"
            ? `Saat perintah **ping** gagal (Request Timed Out), jangan langsung menyimpulkan kabel putus. Lakukan diagnosis berurutan dari lapisan paling dasar:\n1. **Lapisan fisik:** Pastikan kabel terpasang sesuai aturan topologi dan perangkat pusat (switch/backbone) menyala.\n2. **Lapisan logis:** Periksa apakah alamat IP sumber dan tujuan berada pada jaringan/subnet yang benar.\n3. **Lapisan kebijakan:** Periksa firewall — balasan ICMP Echo Reply bisa saja diblokir meski kabel normal.`
            : `**Inti konsep ${info.title}:** ${info.long}\n\n**Alur kerjanya dalam 3 langkah:**\n1. ${info.cara[0]}\n2. ${info.cara[1]}\n3. ${info.cara[2]}\n\n**Aturan pemasangan kabel:** ${spec.rule}`) +
          adaptiveNote,
        followUpQuestion:
          req.topic === "troubleshooting"
            ? "Jika semua kabel di lab Star menyala hijau tetapi ping ke satu PC tetap timeout, dua hal apa yang perlu kamu periksa berikutnya?"
            : info.cek.q,
        verifyHints,
        primarySourceLinks,
        biasOrLimitNote,
        engine: "pedagogical-local",
      };

    case "example":
      return {
        title: `Contoh Nyata & Analogi: ${meta.label}${iterNote}`,
        modeLabel: "Example · Meminta Contoh",
        body:
          priorAck +
          `**Analogi kehidupan sehari-hari:** ${info.analogi}\n\n` +
          `**Contoh situasi laboratorium sekolah:**\n` +
          (req.topic === "bus"
            ? "- Bayangkan 1 ruang kecil dengan 5 PC yang dihubungkan ke satu kabel utama (backbone) dengan terminator di ujung kiri dan kanan. Biaya awalnya murah, tetapi begitu kabel utama terinjak dan putus di tengah, PC di sisi kiri tidak lagi bisa mengirim berkas ke sisi kanan."
            : req.topic === "ring"
              ? "- Bayangkan 5 PC saling terhubung melingkar searah jarum jam (PC-01 → PC-02 → … → PC-05 → PC-01). Aliran data teratur karena bergiliran (token), namun saat PC-03 dimatikan atau kabelnya dicabut pada ring tunggal, cincin terbuka dan pengiriman berhenti."
              : "- Bayangkan lab 24 PC di sekolah dengan satu switch di meja guru. Ketika kabel PC-07 longgar, hanya PC-07 yang kehilangan koneksi; 23 komputer lainnya tetap dapat mengikuti ujian atau berbagi berkas melalui switch.") +
          adaptiveNote,
        followUpQuestion:
          "Coba buat satu contoh situasi baru di sekolah atau rumahmu sendiri yang cocok memakai topologi ini — lalu sebutkan satu risikonya!",
        verifyHints,
        primarySourceLinks,
        biasOrLimitNote,
        engine: "pedagogical-local",
      };

    case "practice": {
      const drills = ADAPTIVE_DRILLS[req.topic];
      const list = drills
        .slice(0, 2)
        .map(
          (d, i) =>
            `**Latihan ${i + 1}:** ${d.q}\n   - A. ${d.options[0]}\n   - B. ${d.options[1]}\n   - C. ${d.options[2]}`,
        )
        .join("\n\n");
      return {
        title: `Latihan Adaptif Terarah: ${meta.label}${iterNote}`,
        modeLabel: "Practice · Soal Latihan",
        body:
          priorAck +
          `Berikut dua soal latihan adaptif untuk menguji pemahamanmu pada **${meta.label}** (jawaban sengaja tidak langsung dibuka agar kamu melatih recall mandiri terlebih dahulu):\n\n${list}\n\n💡 *Tips:* Tulis pilihan beserta alasanmu di kotak Refleksi Proses di bawah, atau kerjakan versi interaktifnya di mode Latihan Adaptif.` +
          adaptiveNote,
        followUpQuestion:
          "Pilihan mana yang kamu anggap paling tepat untuk Latihan 1 dan 2, dan bukti simulasi apa yang mendukung jawabanmu?",
        verifyHints: [
          "Coba jawab sendiri dulu tanpa membuka kunci (hindari berhenti melakukan recall — Pert-12 Slide 31).",
          `Uji skenario pada soal melalui Latihan Adaptif (/kuis?mode=adaptive&focus=${req.topic}).`,
        ],
        primarySourceLinks: [
          { label: `Mulai Latihan Adaptif ${meta.short}`, href: `/kuis?mode=adaptive&focus=${req.topic}` },
          ...primarySourceLinks.slice(0, 2),
        ],
        biasOrLimitNote,
        engine: "pedagogical-local",
      };
    }

    case "feedback": {
      const textToCheck = `${prior ?? ""} ${req.prompt}`.toLowerCase();
      const mentionsKey =
        (req.topic === "bus" && /(backbone|terminator|tabrakan|collision|satu kabel)/.test(textToCheck)) ||
        (req.topic === "ring" && /(melingkar|cincin|searah|token|putus|ganda)/.test(textToCheck)) ||
        (req.topic === "star" && /(switch|pusat|isolasi|terpisah|mac|unicast)/.test(textToCheck)) ||
        (req.topic === "troubleshooting" && /(fisik|kabel|ip|firewall|icmp|ping)/.test(textToCheck));

      return {
        title: `Umpan Balik Formatif atas Argumenmu${iterNote}`,
        modeLabel: "Feedback · Memeriksa Pekerjaan",
        body:
          `**Hasil telaah awal terhadap argumenmu:**\n` +
          (mentionsKey
            ? `- **Kekuatan:** Argumenmu sudah menyentuh kata kunci inti pada ${meta.label}. Ini menunjukkan konsep dasarnya mulai tepat.\n- **Saran perbaikan:** Pastikan kamu tidak hanya menyebut nama perangkat/ciri, tetapi menjelaskan **hubungan sebab-akibat** (mengapa dampaknya terjadi saat gangguan muncul).`
            : `- **Bagian yang perlu dilengkapi:** Tulisanmu belum secara eksplisit menyebut mekanisme inti **${meta.label}** (${req.topic === "bus" ? "backbone, terminator, atau collision" : req.topic === "ring" ? "jalur melingkar satu arah, token, atau ring ganda" : req.topic === "star" ? "switch pusat, tabel MAC, atau isolasi gangguan per kabel" : "urutan cek fisik → IP → firewall/ICMP"}).\n- **Langkah revisi:** Coba tambahkan 1 kalimat sebab-akibat setelah membaca kembali ringkasan modul.`) +
          `\n\n**Kriteria jawaban yang kuat:** (1) Menyebut arsitektur dengan benar, (2) Menjelaskan dampak jika 1 tautan/perangkat pusat rusak, (3) Memberi alasan pemilihan sesuai konteks kasus.` +
          adaptiveNote,
        followUpQuestion:
          "Setelah melihat umpan balik ini, kalimat mana dari jawaban awalmu yang ingin kamu revisi agar lebih presisi?",
        verifyHints,
        primarySourceLinks,
        biasOrLimitNote,
        engine: "pedagogical-local",
      };
    }

    case "compare":
      return {
        title: `Perbandingan Konsep: Bus vs Ring vs Star${iterNote}`,
        modeLabel: "Compare · Membandingkan Konsep",
        body:
          priorAck +
          `| Aspek | Bus | Ring (Tunggal) | Star |\n` +
          `|---|---|---|---|\n` +
          `| Jalur utama | 1 backbone bersama | Cincin tertutup satu arah | Kabel terpisah ke Switch pusat |\n` +
          `| 1 kabel PC putus | Segmen terbelah jika backbone putus | Seluruh aliran terhenti | Hanya PC tersebut yang terisolasi |\n` +
          `| Single point of failure | Kabel backbone | Setiap node/ruas kabel | Switch pusat |\n` +
          `| Risiko collision | Tinggi saat ramai | Rendah (giliran/token) | Sangat rendah (switch full-duplex) |\n` +
          `| Kebutuhan kabel | Paling hemat | Sedang | Lebih banyak (per node ke switch) |` +
          adaptiveNote,
        followUpQuestion:
          "Jika anggaran terbatas untuk 5 PC sementara dibanding lab permanen 24 PC, bagaimana pilihan topologimu berubah dan mengapa?",
        verifyHints: [
          "Bandingkan isi tabel ini dengan halaman Perbandingan resmi (/perbandingan).",
          "Uji ketiga topologi secara bergantian di Sandbox (/sandbox/bus, /sandbox/ring, /sandbox/star).",
        ],
        primarySourceLinks,
        biasOrLimitNote,
        engine: "pedagogical-local",
      };

    case "brainstorm":
      return {
        title: `Alternatif Solusi Perancangan Jaringan${iterNote}`,
        modeLabel: "Brainstorm · Mengembangkan Ide",
        body:
          priorAck +
          `Berikut 3 alternatif rancangan yang bisa kamu kritik dan pilih sendiri berdasarkan kebutuhan kasus:\n\n` +
          `1. **Alternatif A — Star dengan Switch 24-port:** Cocok untuk lab sekolah modern karena gangguan satu PC tidak memengaruhi siswa lain dan troubleshooting cepat. *Pertimbangan:* siapkan UPS/cadangan untuk switch.\n` +
          `2. **Alternatif B — Dual Ring (Ring Ganda):** Cocok jika prioritas utama adalah redundansi jalur melingkar agar trafik dapat diputar saat satu ruas putus. *Pertimbangan:* konfigurasi & penambahan node lebih kompleks.\n` +
          `3. **Alternatif C — Bus Sederhana:** Hanya relevan untuk ilustrasi historis atau skenario sangat kecil & sementara dengan kabel minimal. *Pertimbangan:* tidak disarankan untuk lab aktif karena rawan collision dan backbone putus.` +
          adaptiveNote,
        followUpQuestion:
          "Dari ketiga alternatif di atas, mana yang paling sesuai untuk konteks sekolahmu dan kendala nyata apa yang mungkin muncul saat implementasi?",
        verifyHints,
        primarySourceLinks,
        biasOrLimitNote,
        engine: "pedagogical-local",
      };

    case "reflect":
      return {
        title: `Pertanyaan Refleksi Metakognitif: ${meta.label}${iterNote}`,
        modeLabel: "Reflect · Pertanyaan Refleksi",
        body:
          priorAck +
          `Gunakan tiga pertanyaan refleksi berikut untuk mengecek kedalaman pemahamanmu (bukan sekadar hafalan):\n\n` +
          `1. **Penjelasan mandiri:** Jika seorang teman belum pernah belajar jaringan, bagaimana kamu menjelaskan cara kerja **${meta.short}** dalam 3 kalimat tanpa membaca catatan?\n` +
          `2. **Prediksi gangguan:** Titik mana pada **${meta.short}** yang paling krusial, dan apa yang kamu lihat di Sandbox saat titik itu diputus?\n` +
          `3. **Evaluasi proses:** Kesalahan apa yang sempat kamu buat saat memasang kabel atau menjawab kuis, dan konsep apa yang akhirnya meluruskannya?` +
          adaptiveNote,
        followUpQuestion:
          "Tuliskan jawabanmu untuk minimal satu pertanyaan refleksi di panel Bukti Proses agar tercatat pada Rapor & Sertifikatmu.",
        verifyHints,
        primarySourceLinks,
        biasOrLimitNote,
        engine: "pedagogical-local",
      };

    case "teacher-draft":
      return {
        title: `Draft Guru: 3 Studi Kasus & Rubrik (${meta.label})${iterNote}`,
        modeLabel: "Mode Guru · Draft Bahan Ajar (Perlu Pedagogical Judgment)",
        body:
          `> **Prinsip Pert-12 Slide 10–11:** AI menghasilkan draft awal; guru tetap memeriksa kebenaran, menyesuaikan tingkat kesulitan, memperbaiki konteks lokal, dan melakukan pedagogical judgment.\n\n` +
          `**Draft 3 Studi Kasus Pemilihan Topologi (SMA/SMK):**\n` +
          `1. **Kasus 1 (Lab Ujian 24 PC):** Sekolah mengadakan ujian berbasis komputer. Kerusakan 1 kabel PC tidak boleh menghentikan ujian peserta lain. *Tugas siswa:* tentukan topologi, gambar skema, dan jelaskan titik rawan tunggalnya.\n` +
          `2. **Kasus 2 (Ruang Ekstrakurikuler 5 PC Sementara):** Panitia lomba butuh koneksi lokal 1 hari dengan panjang kabel seminimal mungkin. *Tugas siswa:* bandingkan risiko Bus vs Star sederhana.\n` +
          `3. **Kasus 3 (Jaringan Antar-Gedung Kritis):** Jalur melingkar antar-ruang server butuh cadangan jika satu sisi kabel putus. *Tugas siswa:* jelaskan perbedaan Ring tunggal vs Ring ganda.\n\n` +
          `**Draft Rubrik Penilaian Berbasis Proses (Skala 1–4):**\n` +
          `- **Ketepatan konsep (35%):** Kesesuaian topologi & analisis dampak gangguan.\n` +
          `- **Bukti praktik & simulasi (30%):** Keberhasilan pemasangan kabel & log uji cabut kabel di Sandbox.\n` +
          `- **Bukti proses & refleksi (35%):** Riwayat iterasi pemahaman, verifikasi fakta, dan transparansi penggunaan AI (5W+C).`,
        followUpQuestion:
          "Penyesuaian konteks lokal apa (jumlah PC lab, jam pelajaran, atau level kesulitan) yang akan guru ubah dari draft ini sebelum diberikan ke kelas?",
        verifyHints: [
          "Periksa kesesuaian draft kasus dengan capaian pembelajaran (CP) Informatika Fase F.",
          "Tambahkan komponen penilaian proses (outline, revisi, refleksi lisan/tertulis), bukan hanya produk akhir.",
        ],
        primarySourceLinks: [
          { label: "Dashboard Analitik Guru", href: "/analitik" },
          { label: "Panduan Pembelajaran", href: "/panduan" },
        ],
        biasOrLimitNote:
          "Draft ini dibuat otomatis sebagai bahan awal guru. Keputusan pedagogis, kurasi soal, dan penilaian tetap sepenuhnya berada pada pendidik.",
        engine: "pedagogical-local",
      };
  }
}
