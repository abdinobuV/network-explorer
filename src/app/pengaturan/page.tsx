"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore, type FormEvent } from "react";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { Container, Eyebrow, PageHeader, Btn, Field, Input, Select, Callout, Toggle } from "@/components/ui";
import { IconLogout, IconWarning } from "@/components/icons";
import { useAuth, useProg } from "@/lib/store";
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

  const [nama, setNama] = useState(user?.name ?? "");
  const [kelas, setKelas] = useState(user?.kelas ?? "XI");
  const [pesan, setPesan] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  /* Preferensi dibaca langsung dari penyimpanan — tanpa setState di dalam effect. */
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

  function ubahSuara(v: boolean) {
    setSoundEnabled(v);
  }

  function ubahJalur(v: boolean) {
    setPref("showPaths", v);
  }

  return (
    <RequireAuth>
      <div>
        <Navbar />
        <Container width="page" className="py-10">
          <PageHeader
            chapter="Lembar pengaturan"
            title="Pengaturan akun"
            lead="Ubah data akunmu, atur preferensi belajar, dan kelola progres yang tersimpan."
          />

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-6">
              {/* Data akun */}
              <section className="border border-rule bg-paper">
                <div className="border-b border-rule bg-paper-2 px-5 py-3">
                  <Eyebrow>1. Data akun</Eyebrow>
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
              <section className="border border-rule bg-paper">
                <div className="border-b border-rule bg-paper-2 px-5 py-3">
                  <Eyebrow>2. Preferensi belajar</Eyebrow>
                </div>
                <div className="space-y-5 p-5">
                  <Toggle
                    id="suara"
                    label="Efek suara"
                    description="Bunyi klik dan notifikasi saat memasang kabel. Disintesis di peramban, tanpa berkas audio."
                    checked={suara}
                    onChange={ubahSuara}
                  />
                  <div className="border-t border-rule-3 pt-5">
                    <Toggle
                      id="jalur"
                      label="Tampilkan jalur pemasangan"
                      description="Menampilkan garis putus-putus sebagai petunjuk sebelum memasang kabel."
                      checked={jalur}
                      onChange={ubahJalur}
                    />
                  </div>
                </div>
              </section>

              {/* Progres */}
              <section className="border border-rule bg-paper">
                <div className="border-b border-rule bg-paper-2 px-5 py-3">
                  <Eyebrow>3. Data progres</Eyebrow>
                </div>
                <div className="space-y-4 p-5">
                  <p className="text-caption text-ink-2">
                    Saat ini tercatat <span className="font-mono">{activity.length}</span> kegiatan
                    belajar. {isDemo ? "Mode demo: data hanya ada di peramban ini." : "Data disinkronkan ke cloud."}
                    {syncState === "error" && (
                      <span className="mt-1 block text-redpen">
                        Sinkronisasi bermasalah: {syncError}
                      </span>
                    )}
                  </p>
                  <Btn
                    tone="danger"
                    onClick={() => {
                      reset();
                      toast("Seluruh progres belajar telah dihapus.", "default");
                    }}
                  >
                    Hapus seluruh progres
                  </Btn>
                </div>
              </section>

              {/* Keluar */}
              <section className="border border-rule bg-paper p-5">
                <Eyebrow>4. Sesi</Eyebrow>
                <p className="mt-2 text-caption text-ink-2">
                  Keluar dari akun ini. Progres yang sudah tersimpan tidak akan hilang.
                </p>
                <Btn tone="ghost" className="mt-4" onClick={keluar} disabled={busy}>
                  <IconLogout size={15} /> Keluar dari akun
                </Btn>
              </section>
            </div>

            <aside className="space-y-5">
              <div className="border border-rule bg-paper p-5">
                <Eyebrow>Status sinkronisasi</Eyebrow>
                <p className="mt-2 font-mono text-caption text-ink">
                  {isDemo ? "Lokal (peramban)" : syncState}
                </p>
                <p className="mt-1 text-caption text-ink-3">
                  {isDemo
                    ? "Isi .env.local dan kosongkan NEXT_PUBLIC_DEMO_MODE untuk memakai Firebase."
                    : "Progres dikirim otomatis beberapa detik setelah perubahan."}
                </p>
              </div>

              <div className="border border-rule bg-paper p-5">
                <Eyebrow>Tautan cepat</Eyebrow>
                <ul className="mt-2 space-y-1.5 text-caption">
                  {[
                    ["Kunci kata sandi", "/auth/lupa"],
                    ["Peta misi", "/misi"],
                    ["Rapor belajar", "/cetak"],
                  ].map(([label, href]) => (
                    <li key={href}>
                      <Link href={href} className="text-blueprint hover:underline">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </Container>
        <Footer help />
      </div>
    </RequireAuth>
  );
}
