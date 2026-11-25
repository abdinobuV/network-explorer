# Arsitektur

Dokumen ini menjelaskan bagaimana aplikasi disusun dan **mengapa** disusun seperti itu.

---

## 1. Prinsip utama

1. **Tata letak terpisah dari logika.** Halaman (`src/app`) hanya mengatur tampilan; seluruh
   aturan belajar (XP, level, tahap, validitas pemasangan) berada di `src/lib` sebagai fungsi murni.
2. **Tidak ada angka hardcode untuk hal yang bisa dihitung.** XP, level, persentase, dan waktu
   belajar dihitung dari daftar kegiatan nyata.
3. **Tidak ada satu sumber kebenaran ganda.** Setiap nilai progres hanya punya satu tempat
   penulisan (`progress-store.ts`).

---

## 2. Alur data progres

```
AKEUN AKTIF
   │
   ├─► auth-session.ts  ──►  localStorage["misi-session"]      (mode demo)
   │                   └──►  Firebase Auth session             (mode Firebase)
   │
   └─► progress-store.ts
          │
          ├─ baca  ─► localStorage["misi-prog-<uid>"]
          │            (migrasi dari "misi-prog" versi lama)
          │
          ├─ gabung ─► mergeProgress(lokal, cloud)  ← hanya setelah load selesai
          │
          └─ tulis ─► Firestore users/<uid>  (debounce 800 ms)
```

### Kenapa ada “gerbang” (`hydratedUid`)

Pada versi pertama, efek push ke Firestore berjalan begitu `uid` tersedia — **sebelum**
`loadCloudProg()` selesai. Akibatnya XP default bisa tertimpa ke cloud sebelum data pengguna
dimuat. Sekarang push hanya boleh terjadi setelah dokumen cloud digabung:

```ts
if (hydratedUid !== uid) return;   // belum hydrated → jangan push
```

`mergeProgress()` juga memilih XP **terbesar** untuk kunci yang sama, jadi penggabungan tidak
pernah menurunkan nilai.

---

## 3. Store tanpa `useState` + `useEffect`

Awalnya state sesi dan progres memakai `useState` + `useEffect`. Dua masalah:

- `setState` sinkron di dalam effect memicu render bertingkat (peringatan `react-hooks/set-state-in-effect`).
- Pembacaan `localStorage` saat render menyebabkan ketidakcocokan hidrasi.

Sekarang **`src/lib/storage.ts`** menyediakan penyimpanan lokal yang aman SSR, dan komponen React
membaca lewat `useSyncExternalStore`:

```ts
const user = useSyncExternalStore(subscribeSession, getSession, getServerSession);
const ready = useSyncExternalStore(subscribeSession, getSessionReady, getServerSessionReady);
```

Konsekuensinya: 7 error lint lama hilang tanpa `eslint-disable`, dan logika progres bisa diuji
langsung tanpa merender komponen.

---

## 4. Model topologi

`src/lib/topology-model.ts` mendefinisikan Bus, Ring, dan Star sebagai data:

```ts
interface TopoSpec {
  nodes: TopoNode[];     // perangkat + posisi + nomor port
  links: TopoLink[];     // tautan wajib
  cables: Cable[];       // kabel di palet + sasaran drop yang sah
  rule: string;          // aturan pemasangan (ditampilkan ke siswa)
}
```

Konsekuensi penting: **aturan pemasangan berbeda per topologi** berasal dari data, bukan dari
kode khusus per halaman.

| Topologi | Sasaran drop tiap kabel |
|---|---|
| Bus | `BACKBONE` |
| Ring | PC berikutnya searah jarum jam (PC-01 → PC-02 → PC-03 → PC-04 → PC-01) |
| Star | `SWITCH` |

Fungsi `pathBetween(spec, dari, ke, tautanPutus)` menghitung jalur terpendek dan dipakai sandbox
untuk menganimasi paket serta menentukan hop (latency).

---

## 5. Lembar kerja pemasangan kabel

`src/components/cable-board.tsx`.

- **Satu** `DndContext` membungkus palet **dan** kanvas. Versi awal memakai dua `DndContext`
  terpisah sehingga kabel tidak pernah bisa dipindahkan antar bagian (@dnd-kit tidak mendukung
  lintas context).
- `DragOverlay` menampilkan bayangan **kabel SVG** yang mengikuti kursor menuju perangkat yang
  sedang disorot.
- Penolakan disertai:getaran, garis merah, bunyi, dan baris log berisi alasannya.
- Jalur alternatif keyboard: pilih kabel di palet → tekan perangkat sasaran (validasi tetap sama).

---

## 6. Aksesibilitas

| Kekhawatiran | Penerapan |
|---|---|
| Formulir tanpa label | `Field` memaksa `htmlFor` + `id` |
| Modal kuis | `role="dialog"`, `aria-modal`, fokus otomatis, Escape, `aria-live` |
| Diagram SVG | `role="img"` + `aria-label` deskriptif |
| Tombol ikon | `aria-label` (mis. tombol lihat kata sandi) |
| Toggle | `role="switch"` + `aria-checked` |
| Tombol warna saja | Status visual selalu berpasangan dengan teks |
| Fokus keyboard | `:focus-visible` dengan outline biru pada seluruh aplikasi |

---

## 7. Learning Analytics & Asisten AI Pedagogis (Pengembangan UAS)

### 7.1 Arsitektur Learning Analytics (`src/lib/analytics.ts` & `src/lib/analytics-store.ts`)

Seluruh komputasi analitik berada di fungsi murni `computeAnalytics(progress, analytics)` dan `evaluateCertification(...)` sehingga deterministik dan teruji langsung di Vitest (`analytics.test.ts`).

**8 Learning Data (Digital Traces) yang direkam otomatis:**
1. Frekuensi login & stempel waktu sesi (`loginCount`, `lastLoginAt`).
2. Akses bab materi, tab media yang dibuka (diagram/narasi/video), dan *time on task* (`materi`).
3. Akurasi praktik kabel: sambungan benar, sambungan ditolak, penyelesaian, dan durasi tercepat (`praktik`).
4. Uji simulasi Sandbox: pengiriman ping, ping gagal, dan eksperimen cabut kabel (`simulasi`).
5. Riwayat evaluasi lengkap: jenis tes (`pretest` / `posttest` / `adaptive`), skor, durasi, dan peta jawaban per butir soal (`quizHistory`).
6. Bukti refleksi tertulis siswa pada Cek Pemahaman & Studio AI (`reflections`).
7. Jejak sesi AI: fungsi AI, skor kelengkapan prompt TCCO, jumlah iterasi, langkah verifikasi *Ask AI, Then Think*, pernyataan transparansi 5W+C, dan penyelesaian Lab Deteksi Hallucination (`aiSessions`, `hallucinationSolved`).
8. Kronologi aktivitas digital (`traces`).

**4 Tingkat Analytics yang dihasilkan:**
- **Descriptive:** Progress vs Mastery (*"Progress 100% belum tentu memahami 100%"*), rata-rata skor, perubahan Pre→Post, akurasi praktik, *time on task*, dan kualitas interaksi (menghindari *vanity metrics*).
- **Diagnostic:** Analisis 10 butir soal, identifikasi soal tersulit (*Most Difficult Question*) & konsep terlemah, serta pipeline **Data → Informasi → Interpretasi → Keputusan**.
- **Predictive:** Indikator dini pola hambatan belajar dengan prinsip **etika non-labeling** (*prediksi bukan kepastian; data tidak menggantikan professional judgment guru*).
- **Prescriptive:** Rekomendasi adaptif personal yang mengarahkan langsung ke modul lemah, Sandbox, atau **Latihan Adaptif** (`/kuis?mode=adaptive&focus=...`).

### 7.2 Asisten Belajar AI (`src/lib/ai-tutor.ts` & `src/app/api/ai-tutor/route.ts`)

- Mendukung **7 fungsi siswa** (`Explain`, `Example`, `Practice`, `Feedback`, `Brainstorm`, `Compare`, `Reflect`) dan **1 Mode Guru** (`Draft Guru` dengan peringatan *pedagogical judgment*).
- Menerapkan gerbang anti-ketergantungan (*pemikiran awal sebelum bertanya*), evaluasi prompt **TCCO** (*Task, Context, Constraint, Output*), *iterative prompting*, checklist **Ask AI, Then Think**, Lab Deteksi Hallucination, serta generator Pernyataan Transparansi **5W+C**.
- Berjalan tanpa ketergantungan API eksternal lewat Mesin Pedagogis Lokal, dan otomatis memakai Gemini API bila `GEMINI_API_KEY` diisi di sisi server.

---

## 8. Keputusan desain visual

Arahnya **“Network Lab / Patch-Bay Gelap”** (dengan mode cetak otomatis kertas putih untuk rapor & sertifikat):

| Aspek | Keputusan |
|---|---|
| Palet | Kanvas navy-slate `#0b1220`, permukaan bertingkat `#111b2e`–`#1c2c47`, sinyal cyan `#22b8cf`, LED hijau `#2fd17a`, fault merah `#f25c72` |
| Tipografi | Space Grotesk (display) · IBM Plex Sans (isi) · IBM Plex Mono (ID perangkat, port, latensi, metrik, XP) — diserve sendiri |
| Visualisasi | Komponen SVG ringan tanpa library berat (Line Chart, Bar Chart, Donut Chart) |
| Ikon | Ikon garis SVG kustom menggantikan seluruh emoji |
| Cetak | `@media print` mengalihkan warna otomatis ke kertas putih tinta gelap untuk Rapor Proses & Sertifikat Kompetensi |

Token warna, radius, dan skala tipografi berada di blok `@theme` pada `src/app/globals.css`.

---

## 9. Mode demo vs Firebase

Mode dipilih otomatis:

```ts
export const isDemoMode =
  process.env.NEXT_PUBLIC_DEMO_MODE === "1" || !isFirebaseConfigured;
```

- **Mode demo** — seluruh data di `localStorage`, kata sandi di-hash SHA-256.
- **Mode Firebase** — akun sungguhan, progres & analitik disinkronkan ke Firestore.

Keduanya memakai antarmuka `AuthApi` yang sama, sehingga halaman tidak perlu tahu mode mana yang
aktif.

---

## 10. Pengujian

| Jenis | Alat | Cakupan |
|---|---|---|
| Unit (50 tes) | Vitest | XP/level/tahap, anti-farming kuis, penggabungan cloud, Learning Analytics 4-tingkat & sertifikasi, prompt TCCO & Asisten AI, model topologi, jalur sandbox, penyimpanan lokal, hash kata sandi |
| Asap E2E (12 tes) | Playwright | Sampul, guard rute, masuk, baca bab, pasang kabel (benar & salah), simulasi, kuis, rapor cetak, Dashboard Learning Analytics (Mode Siswa & Guru), Asisten Belajar AI |

`npm run verify` menjalankan lint → typecheck → unit test → build. Uji asap dijalankan terpisah
(`npm run test:e2e`) karena memerlukan peramban.
