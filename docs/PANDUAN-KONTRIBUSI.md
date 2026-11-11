# Panduan kontribusi tim

Dokumen singkat agar semua anggota tim bekerja dengan cara yang sama.

---

## Menjalankan

```bash
npm install
cp .env.example .env.local
npm run dev
```

Selalu kerjakan di **mode demo** selama pengembangan (kosongkan `NEXT_PUBLIC_FIREBASE_*` di
`.env.local`) supaya tidak mengotori data akun percobaan.

## Sebelum mengirim perubahan

```bash
npm run verify
```

Perintah ini menjalankan lint, pemeriksaan tipe, unit test, dan build. **Tidak boleh ada error.**
Peringatan (warning) sebaiknya ikut dibersihkan.

##omaly جديدة

```bash
npm test              # unit test
npm run test:e2e      # uji asap (butuh npx playwright install chromium)
```

### Menulis tes

- **Unit** → `src/lib/*.test.ts`. Uji fungsi murni; jangan perlu merender React.
- **Asap** → `e2e/smoke.spec.ts`. Uji alur pengguna nyata dari sudut pandang pengunjung.

### Menambah halaman

1. Buat berkas di `src/app/<rute>/page.tsx`.
2. Susun dengan komponen dari `@/components/ui` (`Container`, `PageHeader`, `Paper`, `Callout`,
   `TechTable`, `Btn`, `Field`, `Badge`, `Meter`, `Eyebrow`). Jangan menulis gaya ad-hoc.
3. Ikon dari `@/components/icons`. Jangan memakai emoji sebagai ikon.
4. protected → bungkus dengan `<RequireAuth>`.
5. Tambahkan `id="konten-utama"` bila halaman memakai skip-link.

### Menambah gaya

- Warna, radius, ukuran teks → token di blok `@theme` pada `src/app/globals.css`.
- Komponen baru → `src/components/ui.tsx`.
- Jangan menambah kelas CSS global ad-hoc; pakai utilitas Tailwind atau komponen yang sudah ada.

### Aturan bahasa

Semua teks antarmuka memakai **Bahasa Indonesia** yang baku dan lugas. Hindari singkatan yang tidak
dipakai siswa. Angka, nomor port, dan kode ditulis dalam font mono agar mudah dibaca.

---

## Pembagian tugas yang masuk akal

| Area | Berkas | Catatan |
|---|---|---|
| Materi & isi bab | `src/lib/data.ts`, `src/app/materi` | Teks, soal, video |
| Praktik & simulasi | `src/lib/topology-model.ts`, `src/components/cable-board.tsx`, `src/app/praktik`, `src/app/sandbox` | Interaksi |
| Akun & cloud | `src/lib/auth-session.ts`, `src/lib/progress-store.ts`, `src/app/auth` | Firebase |
| Tampilan | `src/app/globals.css`, `src/components/ui.tsx`, `src/components/icons.tsx` | Design kit |
| Tes | `src/lib/*.test.ts`, `e2e/` | Otomasi |
| Dokumentasi | `README.md`, `docs/`, `laporan_uts/` | Laporan & presentasi |

---

## Yang **tidak** boleh diubah tanpa pemberitahuan di tim

- `src/lib/progression.ts` — semua aturan XP bergantung padanya.
- `firestore.rules` — perubahan butuh `npm run deploy:rules` dan bisa memutus data pengguna.
- `src/lib/topology-model.ts` — dipakai bersama oleh materi, praktik, dan sandbox.
