"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import AuthShell from "@/components/auth-shell";
import { IconEye, IconWarning } from "@/components/icons";
import { Btn, Callout, Field, Input } from "@/components/ui";
import { useAuth } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginGoogle, isDemo, demoEmail, demoPassword } = useAuth();
  const [email, setEmail] = useState(isDemo ? demoEmail : "");
  const [pass, setPass] = useState(isDemo ? demoPassword : "");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr(null);
    const message = await login(email, pass);
    setBusy(false);
    if (message) {
      setErr(message);
      return;
    }
    router.push("/misi");
  }

  async function onGoogle() {
    if (busy) return;
    setBusy(true);
    setErr(null);
    const message = await loginGoogle();
    setBusy(false);
    if (message) {
      setErr(message);
      return;
    }
    router.push("/misi");
  }

  return (
    <AuthShell
      chapter="Lembar masuk"
      title="Masuk ke buku latihan"
      lead="Progres, nilai, dan lencana tersimpan pada akunmu — di perangkat ini atau di cloud."
      footer={
        <p className="text-caption text-ink-3">
          Belum punya akun?{" "}
          <Link href="/auth/signup" className="text-blueprint hover:underline">
            Daftar sekarang
          </Link>{" "}
          ·{" "}
          <Link href="/auth/lupa" className="text-blueprint hover:underline">
            Lupa kata sandi
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

        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@sekolah.sch.id"
          />
        </Field>

        <Field label="Kata sandi" htmlFor="password">
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              required
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              aria-pressed={show}
              className="absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center text-ink-3 hover:text-ink"
            >
              <IconEye size={16} />
            </button>
          </div>
        </Field>

        <Btn type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Memproses…" : "Masuk"}
        </Btn>

        {!isDemo && (
          <>
            <div className="flex items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-rule" />
              <span className="font-mono text-micro uppercase tracking-[0.12em] text-ink-4">atau</span>
              <span className="h-px flex-1 bg-rule" />
            </div>
            <Btn
              type="button"
              tone="ghost"
              size="lg"
              className="w-full"
              onClick={onGoogle}
              disabled={busy}
            >
              Masuk dengan Google
            </Btn>
          </>
        )}

        {isDemo && (
          <Callout tone="warn">
            Mode demo aktif. Gunakan akun bawaan{" "}
            <span className="font-mono">{demoEmail}</span> /{" "}
            <span className="font-mono">{demoPassword}</span> — atau daftar akun sendiri. Data
            hanya tersimpan di peramban ini.
          </Callout>
        )}
      </form>
    </AuthShell>
  );
}
