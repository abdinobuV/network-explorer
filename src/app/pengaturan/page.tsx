"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore, type FormEvent } from "react";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { Container, PageHeader, Btn, Field, Input, Select, Callout, Toggle } from "@/components/ui";
import { IconLogout, IconWarning } from "@/components/icons";
import { useAuth, useLearningAnalytics, useProg } from "@/lib/store";
import {
  getServerSoundEnabled,
  isSoundEnabled,
  setSoundEnabled,
  subscribeSound,
} from "@/lib/sound";
import { getPref, setPref, subscribePrefs } from "@/lib/prefs";
import { toast } from "@/lib/toast";

const KELAS = ["X", "XI", "XII"];

export default function PengaturanPage() {
  const router = useRouter();
  const { user, update, logout, isDemo } = useAuth();
  const { reset, syncState, syncError, activity } = useProg();
  const {
    data: analytics,
    setTrackingConsent,
    resetAnalytics,
  } = useLearningAnalytics();

  const [nama, setNama] = useState(user?.name ?? "");
  const [kelas, setKelas] = useState(user?.kelas ?? "XI");
  const [pesan, setPesan] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const suara = useSyncExternalStore(subscribeSound, isSoundEnabled, getServerSoundEnabled);
  const jalur = useSyncExternalStore(
    subscribePrefs,
    () => getPref("showPaths"),
    () => false,
  );

  async function simpan(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setGalat(null);
    setPesan(null);
    const err = await update({ name: nama, kelas });
    setBusy(false);
    if (err) {
      setGalat(err);
      return;
    }
    setPesan("Perubahan disimpan.");
    toast("Perubahan data akun tersimpan.", "ok");
  }

  async function keluar() {
    setBusy(true);
    await logout();
    router.push("/auth/login");
  }

  return (
    <RequireAuth>
      <div className="bg-canvas">
        <Navbar />
        <main id="konten-utama">
          <Container width="page" className="py-10">
            <PageHeader
              chapter="Preferensi akun"
              title="Pengaturan akun"
              lead="Ubah data akunmu, atur preferensi belajar, dan kelola progres yang tersimpan."
            />

            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="space-y-6">
                {/* Data akun */}
                <section className="overflow-hidden rounded-lg border border-border bg-surface">
                  <div className="border-b border-border bg-surface-2 px-5 py-3">
                    <h2 className="font-display text-body font-semibold text-ink">Data akun</h2>
                  </div>
                  <form onSubmit={simpan} className="space-y-4 p-5">
                    {galat && (
                      <Callout tone="error">
                        <span className="flex items-start gap-2">
                          <IconWarning size={15} className="mt-0.5 shrink-0" />
                          {galat}
                        </span>
                      </Callout>
                    )}
                    {pesan && <Callout tone="ok">{pesan}</Callout>}

                    <Field label="Nama tampilan" htmlFor="nama">
                      <Input
                        id="nama"
                        name="nama"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        autoComplete="name"
                      />
                    </Field>

                    <Field label="Kelas" htmlFor="kelas">
                      <Select
                        id="kelas"
                        name="kelas"
                        value={kelas}
                        onChange={(e) => setKelas(e.target.value)}
                      >
                        {KELAS.map((k) => (
                          <option key={k} value={k}>
                            Kelas {k}
                          </option>
                        ))}
                      </Select>
                    </Field>

                    <Field label="Email" htmlFor="email" hint="Email tidak dapat diubah di sini.">
                      <Input id="email" name="email" value={user?.email ?? ""} disabled readOnly />
                    </Field>

                    <div className="flex gap-3">
                      <Btn type="submit" disabled={busy}>
                        {busy ? "Menyimpan…" : "Simpan perubahan"}
                      </Btn>
                      <Btn
                        type="button"
                        tone="quiet"
                        onClick={() => {
                          setNama(user?.name ?? "");
                          setKelas(user?.kelas ?? "XI");
                          setPesan(null);
                        }}
                      >
                        Batal
                      </Btn>
                    </div>
                  </form>
                </section>

                {/* Preferensi */}
                <section className="overflow-hidden rounded-lg border border-border bg-surface">
                  <div className="border-b border-border bg-surface-2 px-5 py-3">
                    <h2 className="font-display text-body font-semibold text-ink">
                      Preferensi belajar
                    </h2>
                  </div>
                  <div className="space-y-5 p-5">
                    <Toggle
                      id="suara"
                      label="Efek suara"
                      description="Bunyi klik dan notifikasi saat memasang kabel. Disintesis di peramban tanpa berkas audio."
                      checked={suara}
                      onChange={(v) => setSoundEnabled(v)}
                    />
                    <div className="border-t border-border-3 pt-5">
                      <Toggle
                        id="jalur"
                        label="Tampilkan jalur pemasangan"
                        description="Menampilkan garis putus-putus sebagai petunjuk sebelum memasang kabel."
                        checked={jalur}
                        onChange={(v) => setPref("showPaths", v)}
                      />
                    </div>
                    <div className="border-t border-border-3 pt-5">
                      <Toggle
                        id="analitik-consent"
                        label="Pencatatan Learning Analytics"
                        description="Rekam waktu belajar, akurasi praktik, dan analisis butir soal untuk rekomendasi adaptif."
                        checked={analytics.trackingConsent}
                        onChange={(v) => setTrackingConsent(v)}
                      />
                    </div>
                  </div>
                </section>

                {/* Progres */}
                <section className="overflow-hidden rounded-lg border border-border bg-surface">
                  <div className="border-b border-border bg-surface-2 px-5 py-3">
                    <h2 className="font-display text-body font-semibold text-ink">Data progres</h2>
                  </div>
                  <div className="space-y-4 p-5">
                    <p className="text-caption text-ink-2">
                      Saat ini tercatat <span className="font-mono text-ink">{activity.length}</span>{" "}
                      kegiatan belajar.{" "}
                      {isDemo
                        ? "Mode demo: data tersimpan di peramban ini saja."
                        : "Data disinkronkan otomatis ke cloud."}
                      {syncState === "error" && (
                        <span className="mt-1 block text-fault">
                          Sinkronisasi bermasalah: {syncError}
                        </span>
                      )}
                    </p>
                    <Btn
                      tone="danger"
                      onClick={() => {
                        reset();
                        resetAnalytics();
                        toast("Seluruh progres dan jejak analitik belajar telah dihapus.", "default");
                      }}
                    >
                      Hapus seluruh progres
                    </Btn>
                  </div>
                </section>

                {/* Keluar */}
                <section className="rounded-lg border border-border bg-surface p-5">
                  <h2 className="font-display text-body font-semibold text-ink">Sesi akun</h2>
                  <p className="mt-1.5 text-caption text-ink-2">
                    Keluar dari akun ini. Progres yang sudah tersimpan tidak akan hilang.
                  </p>
                  <Btn tone="ghost" className="mt-4" onClick={keluar} disabled={busy}>
                    <IconLogout size={15} /> Keluar dari akun
                  </Btn>
                </section>
              </div>

              <aside className="space-y-5">
                <div className="rounded-lg border border-border bg-surface p-5">
                  <p className="text-caption font-semibold text-ink">Status sinkronisasi</p>
                  <p className="mt-2 font-mono text-caption text-signal-bright">
                    {isDemo ? "Lokal (peramban)" : syncState}
                  </p>
                  <p className="mt-1.5 text-caption text-ink-3">
                    {isDemo
                      ? "Isi .env.local dan kosongkan NEXT_PUBLIC_DEMO_MODE untuk memakai Firebase."
                      : "Progres dikirim otomatis beberapa detik setelah perubahan."}
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-surface p-5">
                  <p className="text-caption font-semibold text-ink">Tautan cepat</p>
                  <ul className="mt-2.5 space-y-2 text-caption">
                    {[
                      ["Dashboard Learning Analytics", "/analitik"],
                      ["Asisten Belajar AI", "/asisten"],
                      ["Atur ulang kata sandi", "/auth/lupa"],
                      ["Peta misi", "/misi"],
                      ["Sertifikat & rapor belajar", "/cetak"],
                    ].map(([label, href]) => (
                      <li key={href}>
                        <Link href={href} className="text-signal-bright hover:underline">
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </Container>
        </main>
        <Footer help />
      </div>
    </RequireAuth>
  );
}
