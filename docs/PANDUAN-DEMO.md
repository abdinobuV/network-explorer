# Panduan demo

Checklist sebelum dan saat presentasi. Target waktu: **8–10 menit**.

---

## Sebelum presentasi

- [ ] `npm run verify` hijau (lint + typecheck + test + build).
- [ ] `npm run test:e2e` hijau bila ada waktu.
- [ ] Buka aplikasi sekali di peramban yang akan dipakai, pastikan mode demo aktif.
- [ ] Pastikan data lama sudah dibersihkan: **Pengaturan → Hapus seluruh progres**.
- [ ] Siapkan koneksi internet (video YouTube) atau pastikan video sudah pernah dibuka agar ter-cache.
- [ ] Buka tab baru untuk kode akun demo:
      `navigator@example.com` / `password123`

---

## Alur demo (urutan yang disarankan)

| # | Durasi | Langkah | Yang ditunjukkan |
|---|---|---|---|
| 1 | 0:30 | `/` → sampul | Buku ini disusun seperti buku teknik, bukan dashboard |
| 2 | 0:30 | `/beranda` | Tiga bab, empat langkah belajar |
| 3 | 1:00 | Masuk → `/misi` | Peta misi; tabel status; target XP terlihat nyata (bukan angka contoh) |
| 4 | 1:30 | `/materi/star` | Struktur bab: cara kerja, kelebihan, kekurangan, cek pemahaman, narasi audio (TTS), video |
| 5 | 3:00 | `/praktik/star` | **Sorotan utama**: tarik kabel ke switch, coba salah sasaran (ditolak + alasannya), cabut kabel, bunyi, sertifikat |
| 6 | 1:30 | `/sandbox/star` | Kirim data → animasi paket → cabut satu kabel → kirim lagi → dampaknya terlihat |
| 7 | 1:30 | `/kuis` | Satu soal + pembahasan langsung, tandai soal, kumpulkan |
| 8 | 0:30 | `/kuis/hasil` | Nilai, analisis per bab, rekomendasi |
| 9 | 0:30 | `/progres` dan `/cetak` | Progres terhitung otomatis; rapor siap cetak |

---

## Poin yang layak/story

1. **Aturan pemasangan berbeda tiap topologi** — Bus ke backbone, Ring ke PC berikutnya searah
   jarum jam, Star ke switch. Ini yang membedakan tiga level secara materi, bukan hanya gambar.
2. **XP tidak bisa di-inflate** — mengulang kuis dengan nilai lebih rendah tidak menambah XP.
3. **Angka di dashboard bukan angka contoh** — semua berasal dari kegiatan yang benar-benar
   dikerjakan, lengkap dengan kronologi waktu.
4. **Bisa dipakai tanpa internet** — mode demo + service worker.

---

## Kalau ada kendala saat demo

| Masalah | Solusi |
|---|---|
| Internet mati | Mode demo tetap jalan; video tidak bisa dibuka — jelaskan verbally saja |
| Firebase error saat sinkron | Progress masih tersimpan lokal; status sinkronisasi di navigasi berubah jadi “gagal” |
| Keluhan drag-drop di proyektor | Gunakan jalur alternatif keyboard: pilih kabel di palet → tekan perangkat sasaran |
| Suara terlalu keras | Tombol suara di navigasi (ikon speaker) |
| Animasi mengganggu | Reduce Motion di sistem operasi |

---

## Screenshot untuk laporan

`laporan_uts/shot.py` mengambil 10 tangkapan layar dari aplikasi yang berjalan.

```bash
# jalankan aplikasi lebih dulu di port 3212
npm run dev -- --port 3212

# lalu jalankan skrip
python laporan_uts/shot.py
```

Skrip memakai Playwright (Python) dan menyuntik sesi demo ke `localStorage` supaya seluruh
halaman terlindungi dapat diambil tanpa harus login satu per satu.
