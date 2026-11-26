import { expect, test } from "@playwright/test";

/**
 * Uji asap (smoke test) alur utama aplikasi.
 * Berjalan pada mode demo (NEXT_PUBLIC_DEMO_MODE=1) agar deterministik
 * dan tidak menyentuh Firebase.
 */

const EMAIL = "navigator@example.com";
const SANDI = "password123";
const GURU_EMAIL = "guru@example.com";
const GURU_SANDI = "guru12345";

async function masuk(page: import("@playwright/test").Page) {
  await page.goto("/auth/login");
  await page.getByLabel("Email", { exact: true }).fill(EMAIL);
  await page.locator("#password").fill(SANDI);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await page.waitForURL("**/misi");
}

async function masukGuru(page: import("@playwright/test").Page) {
  await page.goto("/auth/login");
  await page.getByLabel("Email", { exact: true }).fill(GURU_EMAIL);
  await page.locator("#password").fill(GURU_SANDI);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await page.waitForURL("**/guru");
}

test.describe("tamu", () => {
  test("halaman sampul tampil dan bisa dimasuki", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Network Explorer");
    await expect(page.getByRole("link", { name: "Mulai belajar" })).toBeVisible();
  });

  test("halaman yang dilindungi mengalihkan ke login", async ({ page }) => {
    await page.goto("/misi");
    await page.waitForURL("**/auth/login");
    await expect(page.getByRole("heading", { name: /Masuk ke Network Explorer/i })).toBeVisible();
  });

  test("halaman publik terbuka", async ({ page }) => {
    for (const ruta of ["/beranda", "/privasi", "/ketentuan", "/auth/signup", "/auth/lupa"]) {
      await page.goto(ruta);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });
});

test.describe("siswa", () => {
  test("masuk dan melihat peta misi", async ({ page }) => {
    await masuk(page);
    await expect(page.getByRole("heading", { name: "Peta misi belajar" })).toBeVisible();
    await expect(page.getByText("Topologi Bus").first()).toBeVisible();
  });

  test("membaca bab dan membuka lembar praktik", async ({ page }) => {
    await masuk(page);
    await page.goto("/materi/star");
    await expect(page.getByRole("heading", { name: "Topologi Star" })).toBeVisible();
    await expect(page.getByText("Cara kerja").first()).toBeVisible();

    await page.getByRole("link", { name: /Lanjut ke lembar praktik/i }).click();
    await page.waitForURL("**/praktik/star");
    await expect(page.getByText("Palet kabel")).toBeVisible();
  });

  test("memasang kabel pada lembar praktik", async ({ page }) => {
    await masuk(page);
    await page.goto("/praktik/star");

    // Jalur papan: pilih kabel, lalu tekan perangkat sasaran.
    await page.getByRole("button", { name: "Kabel PC-01" }).click();
    await page.getByRole("button", { name: "SWITCH", exact: true }).click();

    await expect(page.getByText(/PC-01 → SWITCH — tersambung/)).toBeVisible();
  });

  test("menolak sambungan yang salah dan menjelaskan alasannya", async ({ page }) => {
    await masuk(page);
    await page.goto("/praktik/ring");

    // Pada Ring, Kabel PC-01 hanya boleh menuju PC-02.
    await page.getByRole("button", { name: "Kabel PC-01" }).click();
    await page.getByRole("button", { name: "PC-03", exact: true }).click();

    await expect(page.getByText(/DITOLAK/).first()).toBeVisible();
    await expect(page.getByText(/harus menuju PC-02/).first()).toBeVisible();
  });

  test("menjalankan simulasi dan mencatat aktivitas", async ({ page }) => {
    await masuk(page);
    await page.goto("/sandbox/bus");
    await page.getByRole("button", { name: /Kirim data/i }).click();
    await expect(page.getByText(/BALASAN diterima/)).toBeVisible({ timeout: 15_000 });

    // Uji interaksi langsung: Rakit dari kosong → pasang kembali → cek Ring Ganda
    await page.getByRole("button", { name: "Rakit dari kosong" }).click();
    await expect(page.getByText("0/4 kabel terpasang")).toBeVisible();
    await page.getByRole("button", { name: "Sambung semua" }).click();
    await expect(page.getByText("4/4 kabel terpasang")).toBeVisible();

    await page.goto("/progres");
    await expect(page.getByText("Aktivitas terbaru")).toBeVisible();
  });

  test("mengerjakan kuis dan melihat hasil", async ({ page }) => {
    await masuk(page);
    await page.goto("/kuis");

    for (let i = 0; i < 10; i++) {
      await page.getByRole("button", { name: /^Jawaban A\./ }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.getByRole("dialog").getByRole("button", { name: /Lanjut ke soal|Selesai/ }).click();
    }

    await page.getByRole("button", { name: /Kumpulkan kuis/i }).click();
    await page.waitForURL("**/kuis/hasil**");
    await expect(page.getByRole("heading", { name: "Hasil kuis akhir" })).toBeVisible();
    await expect(page.getByText("Pembahasan tiap soal", { exact: true })).toBeVisible();
  });

  test("membuka rapor cetak", async ({ page }) => {
    await masuk(page);
    await page.goto("/cetak");
    await expect(page.getByRole("heading", { name: "Rapor Belajar" })).toBeVisible();
  });

  test("siswa hanya melihat analitik pribadinya dan diblokir dari panel guru", async ({ page }) => {
    await masuk(page);
    await page.goto("/analitik");
    await expect(page.getByRole("heading", { name: "Dashboard Learning Analytics" })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Tinjauan Kelas/i })).toHaveCount(0);

    // Siswa yang mencoba membuka /guru langsung ditolak (Access Control)
    await page.goto("/guru");
    await expect(page.getByRole("heading", { name: /Halaman ini khusus untuk akun Guru/i })).toBeVisible();
  });

  test("menggunakan Asisten Belajar AI dengan pemikiran awal dan verifikasi", async ({ page }) => {
    await masuk(page);
    await page.goto("/asisten");
    await expect(page.getByRole("heading", { name: /Asisten Belajar AI/i })).toBeVisible();
    await page
      .getByLabel(/Langkah 0/i)
      .fill("Menurut saya pada Star hanya PC yang putus kabelnya yang terisolasi.");
    await page.getByRole("button", { name: /Tanya Asisten AI/i }).click();
    await expect(page.getByText(/Checklist Verifikasi: Ask AI, Then Think/i)).toBeVisible();
  });
});

test.describe("guru", () => {
  test("guru masuk ke dashboard pemantauan murid, simpan catatan, dan langsung melihat analitik kelas", async ({
    page,
  }) => {
    await masukGuru(page);
    await expect(
      page.getByRole("heading", { name: /Dashboard Pemantauan Murid/i }),
    ).toBeVisible();
    await expect(page.getByText("Alya Putri Rahma").first()).toBeVisible();
    await expect(page.getByText("Dimas Pratama").first()).toBeVisible();

    // Simpan catatan pendampingan guru untuk murid terpilih
    await page
      .getByLabel(/Catatan Pendampingan Guru/i)
      .fill("Sudah dikonfirmasi jadwal pendampingan tambahan.");
    await page.getByRole("button", { name: /Simpan Catatan Guru/i }).click();

    // Guru yang membuka /analitik langsung melihat Analitik Kelas (bukan tugas siswa)
    await page.goto("/analitik");
    await expect(page.getByRole("heading", { name: /Analitik Kelas/i })).toBeVisible();
    await expect(page.getByText(/Fokus Intervensi Soal #5/i)).toBeVisible();
  });
});
