# Panduan Demonstrasi Proyek UAS

Checklist sebelum dan saat presentasi UAS (**Learning Analytics, Dashboard & Responsible AI**). Target waktu: **10–12 menit**.

---

## Sebelum presentasi

- [ ] `npm run verify` hijau (`lint` + `typecheck` + 50 unit test + `next build`).
- [ ] `npm run test:e2e` hijau (12/12 uji Playwright lulus).
- [ ] Pastikan akun demo siap: `navigator@example.com` / `password123`.
- [ ] Siapkan juga 2 berkas pengumpulan di folder `laporan_uas/`:
  - `Dokumen_Proyek_UAS_Network_Explorer_Kelompok3.docx`
  - `Modul_Penggunaan_Multimedia_UAS_Network_Explorer_Kelompok3.docx`

---

## Alur Demonstrasi UAS (10–12 Menit)

| # | Durasi | Rute | Poin Utama yang Ditunjukkan ke Dosen |
|---|---|---|---|
| 1 | 0:45 | `/` → `/beranda` | Ringkasan peningkatan dari UTS ke UAS: 3 modul topologi, Learning Analytics 4-tingkat, Asisten AI bertanggung jawab, dan Sertifikat Kompetensi Digital. |
| 2 | 1:00 | Masuk → `/misi` | Tunjukkan banner **Personalized Learning (Rekomendasi Adaptif)** di bagian atas yang berubah otomatis sesuai data belajar siswa. |
| 3 | 1:30 | `/materi/star` & `/praktik/star` | Tunjukkan **perekaman Learning Data nyata**: waktu baca materi, kotak **Cek Pemahaman tertulis** (bukti proses), serta praktik pasang kabel (coba 1 sambungan benar dan 1 sambungan ditolak agar terlihat terekam di akurasi praktik). |
| 4 | 1:00 | `/sandbox/star` | Kirim ping → cabut satu kabel → kirim ping lagi. Jelaskan bahwa jumlah uji ping & uji gangguan kabel langsung tercatat sebagai *digital traces*. |
| 5 | 1:30 | `/kuis` → `/kuis/hasil` | Tunjukkan 3 mode evaluasi: **Pre-Test Diagnostik**, **Kuis Akhir (Post-Test)**, dan **Latihan Adaptif**. Tunjukkan rekomendasi personal di `/kuis/hasil` yang otomatis menunjuk konsep yang paling sering salah. |
| 6 | 3:00 | `/analitik` (**Sorotan UAS**) | 1) Klik **Pratinjau data contoh** untuk menampilkan data multi-percobaan (Pre-Test 50% → Post-Test 80%).<br>2) Tunjukkan **4 tingkat analytics**: Descriptive (*Progress vs Mastery* + anti-*vanity metrics*), 5 visualisasi (Line, Bar, Donut, Progress Bar, Table), Diagnostic (*Data → Informasi → Interpretasi → Keputusan* + Analisis 10 Butir Soal), Predictive (etika non-labeling), dan Prescriptive (tombol Latihan Adaptif).<br>3) Beralih ke tab **Tinjauan Kelas (Mode Guru)** — tampilkan 32 siswa, Soal #5 tersulit (38%), dan prinsip *data tidak menggantikan guru*.<br>4) Tunjukkan panel **Privasi & Kendali Data** (toggle consent + Ekspor JSON). |
| 7 | 2:00 | `/asisten` | 1) Tunjukkan **Langkah 0 (Anti-Ketergantungan)** dan **Builder Prompt TCCO (4/4 unsur)** + chip iterasi.<br>2) Kirim prompt → tampilkan checklist **Ask AI, Then Think**.<br>3) Buka tab **Lab Deteksi Hallucination** (3 kasus kesalahan AI) dan **Pernyataan Transparansi 5W+C**. |
| 8 | 1:00 | `/cetak` | Tunjukkan 5 syarat kelayakan sertifikat, **Sertifikat Kompetensi Digital** ber-ID verifikasi (`NE-XI-2026-XXXXXX`), ringkasan Learning Analytics, **Bukti Proses & Refleksi**, serta **Pernyataan Transparansi AI** yang siap cetak PDF. |

---

## Poin Cerita Penting untuk Tanya-Jawab Dosen

1. **8 Learning Data Nyata (melebihi syarat minimal 5):** login, waktu & tab materi/video, akurasi & tolakan praktik kabel, uji ping/gangguan Sandbox, riwayat kuis per butir soal (Pre/Post/Adaptif), refleksi tertulis, sesi verifikasi AI, dan log *digital traces*.
2. **Bukan sekadar grafik, tetapi mendukung keputusan belajar:** setiap grafik menjawab pertanyaan spesifik (Line = tren waktu, Bar = soal/konsep tersulit, Donut = Progress vs Mastery, Table = jejak individual) dan berujung pada **Prescriptive Recommendation (Latihan Adaptif)**.
3. **Menghindari Vanity Metrics & Labeling:** dashboard tidak menilai siswa dari jumlah klik mentah, dan sinyal prediktif selalu disertai konteks alternatif serta penegasan *professional judgment* guru.
4. **Offline-ready & Privacy-first:** berjalan 100% di mode demo tanpa server eksternal; siswa dapat menjeda pelacakan, mengekspor JSON, atau menghapus jejak datanya kapan saja.

---

## Mengambil Ulang Screenshot & Dokumen UAS

```bash
# 1. Jalankan server produksi di port 3214
npm run build
npx next start -p 3214

# 2. Ambil 10 screenshot terbaru UAS
python laporan_uas/shot_uas.py

# 3. Bangun ulang Dokumen Proyek UAS & Modul Penggunaan (.docx)
python laporan_uas/build_uas_docs.py
```
