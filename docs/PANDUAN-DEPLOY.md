# Panduan deploy ke Vercel

Semua langkah diuji terhadap versi aplikasi saat ini (Next.js 16 + Firebase).
Waktutotal: ± 20 menit.

---

## A. Yang perlu disiapkan lebih dulu (Firebase Console)

>Lakukan bagian ini **sebelum** deploy, karena perubahan di sini butuh beberapa menit untuk aktif.

### A1. Pastikan Sign-in method aktif
**Firebase Console → Authentication → Sign-in method**

| Metode | Status | Catatan |
|---|---|---|
| Email/Password | ✅ Aktif | Wajib untuk login akun demo & akun siswa |
| Google | ✅ Aktif | Wajib bila ingin tombol "Masuk dengan Google" |

### A2. Daikan domain Vercel
**Firebase Console → Authentication → Settings → Authorized domains**

Tambahkan domain yang akan dipakai:

```
network-explorer-xi.vercel.app        # domain produksi
<domain>.vercel.app                   # preview deployment (opsional)
localhost                             # untuk pengembangan lokal
```

Tanpa ini, **login Google akan gagal** dengan pesan
`auth/unauthorized-domain`.

### A3. Arahkan reset kata sandi ke aplikasi
**Firebase Console → Authentication → Settings → Action URL for password reset**

Isi dengan:

```
https://network-explorer-xi.vercel.app/auth/reset-kata-sandi
```

Lalu pilih **Continue**. Dengan ini halaman reset milik aplikasi yang dipakai,
bukan halaman bawaan Firebase. (Kalau dibiarkan kosong, tautan email tetap
mengarah ke halaman Firebase — aplikasinya masih berfungsi, hanya bukan
halaman yang kita buat.)

### A4. Deploy aturan Firestore
Aturan keamanan **wajib** di-deploy, kalau tidak seluruh tulis dari browser
ditolak dengan pesan `permission-denied`.

```bash
npm install -g firebase-tools      # sekali saja
firebase login                     # buka browser, masuk dengan akun yang punya proyek
npm run deploy:rules
```

Kalau muncul pertanyaan:
- `Select a project` → pilih **misi-topologi**
- `Allow Firebase to automatically configure rules` → **No**

Verifikasi: di Firebase Console → **Firestore Database → Rules**, isinya
sudah sama dengan `firestore.rules` di repo.

> **Penting:** `.firebaserc` menunjuk ke proyek `misi-topologi`. Kalau proyek
> Firebase-mu berbeda, ubah dulu nilai `projects.default` di file itu.

---

## B. Deploy ke Vercel

### Cara 1 — lewat GitHub (disarankan)

1. Buka **[vercel.com/new](https://vercel.com/new)** dan login dengan GitHub.
2. **Add New → Project → Import** → pilih repo `abdinobuV/network-explorer`.
3. Biarkan semua deteksi otomatis:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: *(kosongkan — Next.js menanganinya)*
   - Install Command: `npm install`
4. **Environment Variables** — klik, lalu tambahkan keenam variabel ini
   (nilai diambil dari Firebase Console → Project Settings → General → Your apps → SDK setup):

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | dari Firebase |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | dari Firebase |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `misi-topologi` |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | dari Firebase |
   | `NEXT_PUBLIC_FIREBASE_SENDER_ID` | dari Firebase |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | dari Firebase |

   > **Jangan** tambahkan `NEXT_PUBLIC_DEMO_MODE` — biarkan kosong supaya
   > aplikasi memakai Firebase sungguhan, bukan mode demo.

   Vercel menyediakan tombol **"Copy all"** untuk menyalin seluruh pasangan
   `KEY=value` sekaligus.

5. Klik **Deploy**. Build pertama ± 2 menit.
6. Vercel memberi domain acak, misalnya
   `network-explorer-xi.vercel.app`. **Catat domainnya** — dipakai di langkah A2.
7. Kembali ke Firebase Console → Authorized domains → tambahkan domain tadi.
   Login Google baru bisa dipakai setelah ini.

### Cara 2 — lewat Vercel CLI

```bash
npm install -g vercel
vercel login
vercel                 # preview: Yes, untuk memakai env dari .env.local
vercel --prod         # deploy ke produksi
```

Saat ditanya **Environment Variables**, pilih **Yes** dan tempel keenam variabel
di atas (satu per baris, format `KEY=value`).

---

## B'. Deploy otomatis lewat CLI

Semua langkah di atas bisa dijalankan dari terminal tanpa membuka dashboard Vercel.
Ada dua mode: **login sekali** (paling mudah) dan **token** (tanpa interaksi sama sekali,
cocok untuk CI).

### Mode 1 — Login sekali (disarankan)

Sekali login, semua perintah berikutnya berjalan otomatis:

```bash
npx vercel login                            # membuka browser, sekali saja
npx vercel link --yes --project <nama>      # mengaitkan folder dengan project Vercel
npx firebase-tools login                    # membuka browser, sekali saja

npm run deploy:env                          # salin 6 variabel dari .env.local ke Vercel
npm run deploy:all                          # aturan Firestore + deploy produksi
```

Perintah yang tersedia:

| Perintah | Fungsi |
|---|---|
| `npm run deploy:check` | Memeriksa prasyarat, tidak mengubah apa pun |
| `npm run deploy:env` | Menyalin `NEXT_PUBLIC_FIREBASE_*` dari `.env.local` ke project Vercel |
| `npm run deploy:rules` | Deploy `firestore.rules` ke Firebase |
| `npm run deploy` | Deploy ke produksi (Vercel) |
| `npm run deploy:preview` | Deploy preview (URL sementara) |
| `npm run deploy:all` | Aturan Firestore + deploy produksi dalam satu perintah |

### Mode 2 — Token (tanpa interaksi, untuk CI)

Buat dua token:

| Token | Cara membuatnya |
|---|---|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) → **Create Token** |
| `FIREBASE_TOKEN` | Firebase Console → ⚙ Project Settings → **Service accounts** → **Generate new private key** → ambil nilai `firebase_token` dari JSON-nya |

Lalu set di terminal (PowerShell):

```powershell
$env:VERCEL_TOKEN   = "<token dari Vercel>"
$env:FIREBASE_TOKEN = "<token dari Firebase>"
npm run deploy:all
```

> **Jangan** menulis token ke dalam file yang ikut di-commit. Kalau memakai GitHub
> Actions, simpan keduanya di **Settings → Secrets and variables → Actions**.

### Yang perlu dilakukan sekali, apa pun modenya

- Firebase Console → **Authorized domains** → tambahkan domain Vercel (bagian A2).
- Firebase Console → **Action URL for password reset** → arahkan ke
  `https://<domain>/auth/reset-kata-sandi` (bagian A3).

Keduanya hanya bisa dilakukan lewat dashboard, tidak ada yang bisa diper automate.

---

## C. Setelah deploy — checklist verifikasi

Buka `https://network-explorer-xi.vercel.app` dan cek:

- [ ] **Sampul** tampil dengan benar, tanpa galat di konsol
- [ ] Masuk dengan `navigator@example.com` / `password123`
      → bila gagal, periksa **Authorized domains** (A2) dan **Email/Password** (A1)
- [ ] Masuk dengan akun Google
      → bila gagal dengan `auth/unauthorized-domain`, ulangi A2
- [ ] Buka **Misi → Materi Bus → Lanjut ke lembar praktik**, pasang satu kabel
      → status "cloud tersimpan" di navigasi berubah
- [ ] Buka **Pengaturan → Hapus seluruh progres**, lalu **Progres**
      → XP kembali 0 dan activity log kosong (membuktikan data memang dari cloud)
- [ ] Buka **Rapor** (`/cetak`) → tekan Ctrl+P, pratinjau harus rapi satu halaman
- [ ] Install PWA: di Chrome tekan ikon install di bilah alamat
      → aplikasi terbuka dalam mode standalone dan tetap bisa dibuka saat offline

---

## D. Kalau ada masalah

| Gejala | Penyebab | Solusi |
|---|---|---|
| `auth/unauthorized-domain` | Domain belum diizinkan | Tambah domain di A2, tunggu 1–2 menit |
| `auth/operation-not-allowed` | Metode sign-in belum dinyalakan | Nyalakan di A1 |
| `auth/invalid-credential` | Akun belum terdaftar di Firebase | Daftar lewat aplikasi (mode demo hanya lokal) |
| `permission-denied` saat menyimpan progres | `firestore.rules` belum di-deploy | Jalankan A4 |
| `Failed to load resource` di konsol | CSP memblokir domain yang belum terdaftar | Tambahkan domainnya di `connect-src`/`frame-src` pada `next.config.ts` |
| Tampilan lama tert cached | Service worker menahan aset lama | Hard refresh (`Ctrl+Shift+R`) dua kali |
| Login Google memutar infinitely | Popup diblokir browser | Izinkan pop-up untuk domain kamu |

---

## E. Deploy berikutnya

Otomatis. Setiap `git push` ke branch `main` memicu build baru di Vercel
(Preview untuk branch lain, Production untuk `main`).

Untuk melihat log build: **Vercel → Project → Deployments → klik deployment →
Logs**.

Jangan lupa, kalau kamu mengubah `firestore.rules`, jalankan lagi `npm run deploy:rules`
— Vercel tidak otomatis mengirim aturan Firebase.
