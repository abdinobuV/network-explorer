"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import AuthShell from "@/components/auth-shell";
import { IconWarning } from "@/components/icons";
import { Btn, Callout, Field, Input, Select } from "@/components/ui";
import { useAuth } from "@/lib/store";

const KELAS = ["X", "XI", "XII"];

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", kelas: "XI", pass: "" });
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setErr(null);

    if (!agree) {
      setErr("Centang persetujuan ketentuan terlebih dahulu.");
      return;
    }

    setBusy(true);
    const message = await signup(form.name, form.email, form.pass, form.kelas);
    setBusy(false);
    if (message) {
      setErr(message);
      return;
    }
    router.push("/misi");
  }

  return (
    <AuthShell
      chapter="Lembar pendaftaran"
      title="Daftar akun belajar"
      lead="Satu akun untuk excused tiga bab materi, lembar praktik, dan kuis akhir."
      footer={
        <p className="text-caption text-ink-3">
          Sudah punya akun?{" "}
          <Link href="/auth/login" className="text-blueprint hover:underline">
            Masuk di sini
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {err && (
          <Callout tone="error">
            <span className="flex items-start gap-2">
              <IconWarning size={15} className="mt-0.5 shrink-0" />
              <span>{err}</span>
            </span>
          </Callout>
        )}

        <Field label="Nama lengkap" htmlFor="name">
          <Input
            id="name"
            name="name"
            autoComplete="name"
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Nama sesuai absensi"
          />
        </Field>

        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="nama@sekolah.sch.id"
          />
        </Field>

        <Field label="Kelas" htmlFor="kelas">
          <Select
            id="kelas"
            name="kelas"
            value={form.kelas}
            onChange={(e) => set("kelas", e.target.value)}
          >
            {KELAS.map((k) => (
              <option key={k} value={k}>
                Kelas {k}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Kata sandi"
          htmlFor="password"
          hint="Minimal 8 karakter. Jangan pakai nama sekolah atau tanggal lahir."
        >
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={form.pass}
            onChange={(e) => set("pass", e.target.value)}
          />
        </Field>

        <div className="flex items-start gap-2">
          <input
            id="setuju"
            name="setuju"
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[#1b4d7a]"
          />
          <label htmlFor="setuju" className="text-caption text-ink-2">
            Saya menyetujui{" "}
            <Link href="/ketentuan" className="text-blueprint hover:underline">
              ketentuan penggunaan
            </Link>{" "}
            dan penanganan data akun saya.
          </label>
        </div>

        <Btn type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Mendaftarkan…" : "Daftar dan mulai"}
        </Btn>
      </form>
    </AuthShell>
  );
}
