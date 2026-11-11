# Network Explorer — Buku Praktis Topologi Jaringan

Aplikasi belajar mandiri mata Informatika kelas XI, topik **topologi jaringan** (Bus, Ring, Star).
Siswa membaca bab, lalu **merangkai jaringan sendiri** di lembar kerja teknik — menarik kabel dari
palet ke perangkat yang benar, lalu menguji jaringannya dengan mengirim data dan mencabut kabel.

Dibuat oleh **Kelompok 3**, Program Studi Pendidikan TIK, Universitas Negeri Medan.

---

## Isi aplikasi

| Bagian | Rute | Isi |
|---|---|---|
| Sampul & daftar isi | `/`, `/beranda` | Pengantar, cara belajar, FAQ |
| Materi | `/materi/[bus\|ring\|star]` | Tiga bab: cara kerja, kelebihan, kekurangan, cek pemahaman, video, narasi |
| Praktik | `/praktik/[topo]` | Lembar kerja pemasangan kabel (drag & drop) |
| Simulasi | `/sandbox/[topo]` | Kirim data, cabut kabel, lihat dampaknya |
| Evaluasi | `/kuis`, `/kuis/hasil` | 10 soal studi kasus + pembahasan |
| Referensi | `/perbandingan`, `/glosarium`, `/panduan` | Tabel perbandingan, indeks istilah, panduan belajar |
| Progres | `/progres`, `/profil`, `/cetak` | Kartu progres, profil siswa, rapor siap cetak |
| Akun | `/auth/*` | Masuk, daftar, lupa & atur ulang kata sandi |

Aturan pemasangan **berbeda tiap topologi** — inilah inti pembelajarannya:

- **Bus** — setiap PC disambung ke satu **backbone**.
- **Ring** — setiap PC disambung ke **PC berikutnya searah jarum jam** sampai cincin tertutup.
- **Star** — setiap PC disambung ke satu **switch pusat**.

---

## Teknologi

- Next.js 16 (App Router, Turbopack) + React 19
- TypeScript (strict) + Tailwind CSS v4 (token di `@theme`, tanpa `tailwind.config`)
- Firebase 12 — Authentication (email/password + Google) dan Firestore (penyimpanan progres)
- @dnd-kit/core — drag & drop pada lembar kerja
- Web Audio API — efek suara disintesis (tanpa berkas audio)
- Web Speech API — narasi lisan (tanpa berkas audio)
- Vitest + Testing Library (unit) dan Playwright (uji asap end-to-end)

---

## Menjalankan di komputer sendiri

```bash
npm install
cp .env.example .env.local     # isi bila ingin memakai Firebase
npm run dev
```

Buka <http://localhost:3000>.

### Mode demo (tanpa Firebase)

Bila `.env.local` belum diisi atau `NEXT_PUBLIC_DEMO_MODE=1`, aplikasi berjalan **tanpa server**:

- Akun demo bawaan: `navigator@example.com` / `password123`
- Progres, XP, dan nilai disimpan di `localStorage` peramban
- Kata sandi demo disimpan sebagai **hash SHA-256**, bukan teks polos

Mode demo cocok untuk presentasi di kelas tanpa koneksi.

### Mode Firebase

1. Buat proyek di [Firebase Console](https://console.firebase.google.com).
2. **Authentication → Sign-in method**: aktifkan *Email/Password* dan *Google*.
3. **Authentication → Settings → Authorized domains**: tambahkan domain produksi (mis. domain Vercel).
4. **Authentication → Settings → Action URL for password reset**: arahkan ke
   `https://<domainmu>/auth/reset-kata-sandi` bila ingin memakai halaman reset milik aplikasi.
5. **Firestore Database**: buat database, salin nilainya ke `.env.local`.
6. Pasang aturan keamanan:

   ```bash
   npm run deploy:rules      # memakai .firebaserc + firestore.rules
   ```

7. Kosongkan `NEXT_PUBLIC_DEMO_MODE` pada `.env.local`.

> **Penting:** aturan `firestore.rules` hanya berlaku setelah `npm run deploy:rules` dijalankan.
> Tanpa itu, Firestore menolak seluruh tulis dari klien.

---

## Perintah yang tersedia

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi |
| `npm run lint` | ESLint (termasuk aturan aksesibilitas) |
| `npm run typecheck` | TypeScript tanpa emit |
| `npm test` | Unit test (Vitest) |
| `npm run test:e2e` | Uji asap end-to-end (Playwright) |
| `npm run verify` | lint → typecheck → test → build |
| `npm run deploy:check` | Periksa prasyarat deploy (login, env, project) |
| `npm run deploy:env` | Salin 6 variabel Firebase dari `.env.local` ke project Vercel |
| `npm run deploy:rules` | Deploy `firestore.rules` ke Firebase |
| `npm run deploy` | Deploy ke produksi (Vercel) |
| `npm run deploy:all` | Aturan Firestore + deploy produksi dalam satu perintah |

---

## Deploy

Panduan lengkap ada di **[`docs/PANDUAN-DEPLOY.md`](docs/PANDUAN-DEPLOY.md)**.

Ringkasnya:

1. **Firebase Console** — nyalakan Email/Password & Google, tambahkan domain Vercel ke
   *Authorized domains*, arahkan *Action URL for password reset* ke
   `https://<domain>/auth/reset-kata-sandi`.
2. **Deploy aturan Firestore** (wajib, kalau tidak seluruh tulis ditolak):

   ```bash
   npm install -g firebase-tools
   firebase login
   npm run deploy:rules
   ```

3. **Vercel** — *Import Project* dari GitHub repo ini, isi keenam
   `NEXT_PUBLIC_FIREBASE_*` di Environment Variables, lalu **Deploy**.
4. Kembalikan domain Vercel ke *Authorized domains* di Firebase.

### Vercel (disarankan)

1. Push repo ke GitHub, lalu **Import Project** di Vercel.
2. Tambahkan seluruh `NEXT_PUBLIC_FIREBASE_*` di *Environment Variables*.
3. Deploy. Lalu jalankan `npm run deploy:rules` untuk Firestore.

### Firebase Hosting

`firebase.json` saat ini hanya berisi aturan Firestore. Untuk hosting statis, tambahkan blok
`hosting` dan gunakan `output: "export"` di `next.config.ts` — perhatikan bahwa Firestore/Auth
tetap memerlukan konfigurasi domain yang diizinkan.

---

## Struktur penting

```
src/
├── app/                  # rute (App Router)
├── components/
│   ├── ui.tsx            # design kit: Container, Paper, Callout, TechTable, Btn, Field, …
│   ├── icons.tsx         # ikon garis SVG kustom (pengganti emoji)
│   ├── chrome.tsx        # Logo, Navbar, Footer
│   ├── topo.tsx          # skema teknik Bus/Ring/Star
│   ├── cable-board.tsx   # lembar kerja pemasangan kabel (drag & drop)
│   └── auth-shell.tsx    # cangkang halaman autentikasi
└── lib/
    ├── progression.ts    # aturan XP, level, tahap — fungsi murni
    ├── topology-model.ts # model Bus/Ring/Star + perhitungan jalur
    ├── progress-store.ts # progres lokal + sinkronisasi cloud
    ├── auth-session.ts   # sesi pengguna (mode demo & Firebase)
    ├── storage.ts        # localStorage yang aman untuk SSR
    ├── sound.ts          # efek suara sintetis
    └── toast.ts          # notifikasi singkat
```

Dokumentasi rinci ada di [`docs/`](docs/):

- [`docs/ARSITEKTUR.md`](docs/ARSITEKTUR.md) — struktur, aliran data, keputusan desain
- [`docs/PANDUAN-DEMO.md`](docs/PANDUAN-DEMO.md) — checklist presentasi
- [`docs/PANDUAN-KONTRIBUSI.md`](docs/PANDUAN-KONTRIBUSI.md) — alur kerja tim

---

## Aksesibilitas

- Seluruh interaksi dapat dipakai dengan keyboard; tombol Installing kabel punya jalur alternatif
  (pilih kabel → pilih perangkat sasaran).
- Modal pembahasan kuis memakai `role="dialog"`, `aria-modal`, fokus otomatis, dan tombol Escape.
- Setiap field formulir punya `<label>` yang terhubung lewat `id`/`htmlFor`.
- Diagram SVG diberi `role="img"` dan label deskriptif.
- Animasi dihentikan otomatis bila sistem mengaktifkan *Reduce Motion*.

---

## Lisensi & aset

- Teks, gambar teknik, dan soal: dibuat oleh kelompok pengembang.
- Video: [WhiteboardDoodles](https://www.youtube.com/watch?v=fS9vZewbCs4) (YouTube), diputar dengan
  mode tanpa cookie.
- Font: [IBM Plex](https://www.plex.com/) (SIL Open Font License 1.1), diserve sendiri dari
  `src/app/fonts/`.
