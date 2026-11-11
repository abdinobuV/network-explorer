# Changelog

Semua perubahan penting pada aplikasi ini dicatat di sini.
Format berdasarkan [Keep a Changelog](https://keepachangelog.com/id/1.1.0/).

## [2.0.0] — 2026

Edisi kedua: aplikasi dipoles ulang sebagai **buku praktis topologi** dengan lembar kerja
pemasangan kabel yang benar-benar interaktif.

### Ditambahkan

- **Lembar kerja pemasangan kabel** (`/praktik/[topo]`) dengan aturan berbeda per topologi:
  Bus → backbone, Ring → PC berikutnya searah jarum jam, Star → switch pusat.
- **Kabel bayangan** yang mengikuti kursor saat diseret, penolakan sambungan yang bergetar disertai
  alasan, dan kemampuan mencabut kabel yang terpasang.
- **Sertifikat pemasangan** yang dapat dicetak setelah seluruh kabel tersambung.
- **Simulasi sadar-topologi** (`/sandbox/[topo]`): paket berjalan mengikuti jalur yang benar-benar
  dirangkai, latency dihitung dari jumlah hop, dan sambungan yang dicabut ditampilkan sebagai
  tautan putus.
- **Narasi audio** memakai Web Speech API (bahasa Indonesia) — tanpa berkas audio.
- **Efek suara** disintesis dengan Web Audio API (klik, ding, buzz, cabut), dapat dimatikan.
- **Rapor cetak** (`/cetak`) berisi identitas, XP, latchan, jejak belajar, dan tabel nilai.
- **Halaman pengaturan ulang kata sandi** (`/auth/reset-kata-sandi`) memakai `verifyPasswordResetCode`.
- **Mode demo** yang dapat dipaksa lewat `NEXT_PUBLIC_DEMO_MODE=1`; kata sandi demo disimpan
  sebagai hash SHA-256.
- **Notifikasi singkat** (toast) dan halaman `error`, `not-found`, serta `loading`.
- **PWA**: manifest, ikon 192/512/maskable, service worker (cache-first untuk aset, network-first
  untuk navigasi) dan dukungan offline.
- **Sistem desain baru**: token `@theme` di Tailwind v4, 25 ikon garis SVG kustom, dan komponen
  `Container`, `Paper`, `Callout`, `TechTable`, `Btn`, `Field`, `Toggle`, `Meter`, `Figure`, `ActionBar`.
- **Tipografi IBM Plex** (Serif/Sans/Mono) yang diserve sendiri dari repo.
- **Alat pengujian**: Vitest (40 unit test) dan Playwright (10 uji asap end-to-end).

### Diperbaiki

- **Drag & drop pada lembar praktik tidak pernah berfungsi** karena terdapat dua `DndContext`
  terpisah; kini satu konteks mencakup palet dan kanvas.
- **Race condition sinkronisasi Firestore** yang dapat menimpa XP cloud dengan nilai yang lebih
  rendah; push kini hanya terjadi setelah data cloud digabung, dan penggabungan selalu memilih
  nilai terbesar.
- **Angka XP, level, dan waktu belajar palsu** (default 2450 XP, "45 menit", Bus 100 %) diganti
  perhitungan nyata dari daftar kegiatan.
- **Nilai kuis bisa di-inflate** dengan mengulang kuis; XP kini hanya bertambah bila nilai menjadi
  rekor baru.
- **Rute tidak valid** (`/materi/xyz`) diam-diam menampilkan bab Star; kini menghasilkan 404.
- **Halaman `/praktik` dan `/sandbox` selalu menampilkan topologi Star**; kini mengikuti topologi
  yang dipilih, dan sandbox menjadi rute dinamis.
- **Semua galat Firestore ditelan**; status sinkronisasi kini tampil di navigasi dan di
  Pengaturan.
- **Sembilan halaman tanpa footer** dan empat bilah aksi bawah yang diduplikasi; kini memakai
  komponen bersama.
- **Password mode demo disimpan sebagai teks polos** di `localStorage`; kini di-hash.
- **Data profil pengguna Google tidak tersimpan** dan "Batal" mengosongkan nama; kini tersimpan
  untuk kedua mode.
- **Konten video mengarang** (narasi dan gambar contoh) diganti sumber yang sebenarnya.
- 7 error ESLint (`react-hooks/set-state-in-effect`, `any`) dihilangkan secara struktural dengan
  `useSyncExternalStore`.

### Diubah

- Arah visual: dari dasbor gelap neon (cyan/hijau, gradien, glassmorphism, emoji) menjadi **buku
  teknis** di atas kertas dengan garis tinta, nomor bab, dan penomoran gambar.
- Progres berpindah dari peta `done` + angka XP terpisah menjadi **daftar kegiatan** yang
  menjadi sumber tunggal XP, level, dan lencana.
- Vidio diputar dengan `youtube-nocookie.com` (tanpa cookie).
- Ditambahkan Content-Security-Policy dan header keamanan lain.
