"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import AuthShell from "@/components/auth-shell";
import { IconWarning } from "@/components/icons";
import { Btn, Callout, Field, Input } from "@/components/ui";
import { sendResetEmail } from "@/lib/firebase";
import { useAuth } from "@/lib/store";

export default function LupaPage() {
  const { isDemo } = useAuth();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr(null);
    setOk(false);

    if (isDemo) {
      setBusy(false);
      setErr(
        "Mode demo aktif, sehingga tidak ada server email. Pada mode Firebase, tautan reset dikirim ke email terdaftar.",
      );
      return;
    }

    const message = await sendResetEmail(email);
    setBusy(false);
    if (message) {
      setErr(message);
      return;
    }
    setOk(true);
  }

  return (
    <AuthShell
      chapter="Lembar pemulihan"
      title="Atur ulang kata sandi"
      lead="Masukkan email akunmu. Kami mengirim tautan untuk membuat kata sandi baru."
      footer={
        <p className="text-caption text-ink-3">
          Ingat kata sandinya?{" "}
          <Link href="/auth/login" className="text-blueprint hover:underline">
            Kembali ke halaman masuk
          </Link>
        </p>
      }
    >
      {ok ? (
        <Callout tone="ok">
          Tautan reset sudah dikirim ke <span className="font-mono">{email}</span>. Buka tautan
          tersebut pada peramban yang sama untuk mengatur kata sandi baru.
        </Callout>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {err && (
            <Callout tone="error">
              <span className="flex items-start gap-2">
                <IconWarning size={15} className="mt-0.5 shrink-0" />
                <span>{err}</span>
              </span>
            </Callout>
          )}

          <Field label="Email akun" htmlFor="email">
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

          <Btn type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? "Mengirim…" : "Kirim tautan reset"}
          </Btn>

          <Callout tone="note">
            Demi keamanan, kami hanya menampilkan jawaban bahwa email terdaftar atau tidak.
          </Callout>
        </form>
      )}
    </AuthShell>
  );
}
