"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import AuthShell from "@/components/auth-shell";
import { IconWarning } from "@/components/icons";
import { Btn, Callout, Field, Input, Select, cx } from "@/components/ui";
import type { UserRole } from "@/lib/auth-session";
import { useAuth } from "@/lib/store";

const KELAS = ["X", "XI", "XII"];

export default function SignupPage() {
  const router = useRouter();
  const { signup, isDemo, teacherAccessCode } = useAuth();
  const [role, setRole] = useState<UserRole>("siswa");
  const [form, setForm] = useState({
    name: "",
    email: "",
    kelas: "XI",
    pass: "",
    teacherCode: "",
  });
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
    const message = await signup(
      form.name,
      form.email,
      form.pass,
      form.kelas,
      role,
      form.teacherCode,
    );
    setBusy(false);
    if (message) {
      setErr(message);
      return;
    }
    router.push(role === "guru" ? "/guru" : "/misi");
  }

  return (
    <AuthShell
      chapter="Pendaftaran akun"
      title="Daftar akun belajar"
      lead="Pilih peran sebagai Peserta Didik (Siswa) atau Pendidik (Guru dengan kode akses khusus)."
      footer={
        <p className="text-caption text-ink-3">
          Sudah punya akun?{" "}
          <Link href="/auth/login" className="text-signal-bright hover:underline">
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

        {/* Pilihan Peran */}
        <div>
          <p className="mb-1.5 text-caption font-medium text-ink-2">Daftar sebagai</p>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["siswa", "Peserta Didik (Siswa)"],
                ["guru", "Pendidik (Guru)"],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                aria-pressed={role === val}
                onClick={() => {
                  setRole(val);
                  setErr(null);
                }}
                className={cx(
                  "cursor-pointer rounded-md border px-3 py-2.5 text-caption font-medium transition-colors",
                  role === val
                    ? "border-signal bg-signal-tint text-signal-bright"
                    : "border-border bg-canvas text-ink-2 hover:border-border-2 hover:text-ink",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <Field label="Nama lengkap" htmlFor="name">
          <Input
            id="name"
            name="name"
            autoComplete="name"
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder={role === "guru" ? "Nama lengkap pendidik" : "Nama sesuai absensi"}
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

        {role === "siswa" ? (
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
        ) : (
          <Field
            label="Kode Akses Guru"
            htmlFor="teacher-code"
            hint={
              isDemo
                ? `Kode akses demo: ${teacherAccessCode} (melindungi panel kelas agar tidak bisa didaftarkan sembarang siswa).`
                : "Masukkan kode akses resmi yang diberikan pengelola mata kuliah."
            }
          >
            <Input
              id="teacher-code"
              name="teacherCode"
              required
              value={form.teacherCode}
              onChange={(e) => set("teacherCode", e.target.value)}
              placeholder="GURU-XXXX-XXXX"
            />
          </Field>
        )}

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

        <div className="flex items-start gap-2.5">
          <input
            id="setuju"
            name="setuju"
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[#22b8cf]"
          />
          <label htmlFor="setuju" className="text-caption text-ink-2">
            Saya menyetujui{" "}
            <Link href="/ketentuan" className="text-signal-bright hover:underline">
              ketentuan penggunaan
            </Link>{" "}
            dan penanganan data akun saya.
          </label>
        </div>

        <Btn type="submit" size="lg" className="w-full" disabled={busy}>
          {busy
            ? "Mendaftarkan…"
            : role === "guru"
              ? "Daftar sebagai Guru"
              : "Daftar dan mulai"}
        </Btn>
      </form>
    </AuthShell>
  );
}
