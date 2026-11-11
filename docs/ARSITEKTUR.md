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

## 7. Keputusan desain visual

Arahnya **“buku teknis / gambar teknik”**, bukan dashboard gelap:

| Aspek | Keputusan |
|---|---|
| Palet | Kertas hangat `#f4f1e8`, tinta `#1b1a16`, aksen *drafting blue* `#1b4d7a`, *red-pen* `#b3352b` |
| Tipografi | IBM Plex Serif (judul) · Sans (isi) · Mono (angka, port, label) — diserve sendiri |
| Bentuk | Radius 2 px, garis rambut 1 px, tanpa gradien dekoratif, tanpa glow, tanpa glassmorphism |
| Ikon | 25 ikon garis SVG kustom menggantikan seluruh emoji |
| Nomor gambar | Gambar diberi nomor bab (`Gambar 1.1`) seperti buku teks |

Token warna, radius, dan skala tipografi berada di blok `@theme` pada `src/app/globals.css`.

---

## 8. Mode demo vs Firebase

Mode dipilih otomatis:

```ts
export const isDemoMode =
  process.env.NEXT_PUBLIC_DEMO_MODE === "1" || !isFirebaseConfigured;
```

- **Mode demo** — seluruh data di `localStorage`, kata sandi di-hash SHA-256.
- **Mode Firebase** — akun sungguhan, progres di Firestore.

Keduanya memakai antarmuka `AuthApi` yang sama, sehingga halaman tidak perlu tahu mode mana yang
aktif.

---

## 9. Pengujian

| Jenis | Alat | Cakupan |
|---|---|---|
| Unit | Vitest | XP/level/tahap, anti-farming kuis, penggabungan cloud, model topologi, jalur sandbox, penyimpanan lokal, hash kata sandi |
| Asap | Playwright | Sampul, guard rute, masuk, baca bab, pasang kabel (benar & salah), simulasi, kuis, rapor cetak |

`npm run verify` menjalankan lint → typecheck → unit test → build. Uji asap dijalankan terpisah
(`npm run test:e2e`) karena memerlukan peramban.
