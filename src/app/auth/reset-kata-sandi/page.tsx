"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import AuthShell from "@/components/auth-shell";
import { IconWarning } from "@/components/icons";
import { Btn, Callout, Field, Input } from "@/components/ui";
import { applyNewPassword, verifyResetCode } from "@/lib/firebase";
import { useAuth } from "@/lib/store";

function ResetInner() {
  const router = useRouter();
  const { isDemo } = useAuth();
  const params = useSearchParams();
  const oobCode = params.get("oobCode") ?? params.get("code") ?? "";

  const [sandi, setSandi] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selesai, setSelesai] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setGalat(null);

    if (sandi.length < 8) {
      setGalat("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (sandi !== konfirmasi) {
      setGalat("Konfirmasi kata sandi tidak sama.");
      return;
    }

    setBusy(true);
    const cek = await verifyResetCode(oobCode);
    if (cek) {
      setBusy(false);
      setGalat(cek);
      return;
    }
    const hasil = await applyNewPassword(oobCode, sandi);
    setBusy(false);
    if (hasil) {
      setGalat(hasil);
      return;
    }
    setSelesai(true);
  }

  if (isDemo) {
    return (
      <Callout tone="warn">
        Mode demo aktif sehingga tidak ada server email. Halaman ini dipakai pada mode Firebase,
        saat tautan reset dari email diarahkan ke sini.
      </Callout>
    );
  }

  if (selesai) {
    return (
      <div className="space-y-4">
        <Callout tone="ok">
          Kata sandi baru tersimpan. Silakan masuk dengan kata sandi tersebut.
        </Callout>
        <Btn
          className="w-full"
          onClick={() => {
            router.push("/auth/login");
          }}
        >
          Ke halaman masuk
        </Btn>
      </div>
    );
  }

  if (!oobCode) {
    return (
      <div className="space-y-4">
        <Callout tone="error">
          <span className="flex items-start gap-2">
            <IconWarning size={15} className="mt-0.5 shrink-0" />
            Tautan reset tidak ditemukan di alamat ini. Minta tautan baru dari halaman lupa kata
            sandi.
          </span>
        </Callout>
        <Link
          href="/auth/lupa"
          className="inline-block font-mono text-caption uppercase tracking-[0.12em] text-blueprint hover:underline"
        >
          Minta tautan baru →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {galat && (
        <Callout tone="error">
          <span className="flex items-start gap-2">
            <IconWarning size={15} className="mt-0.5 shrink-0" />
            <span>{galat}</span>
          </span>
        </Callout>
      )}

      <Field label="Kata sandi baru" htmlFor="sandi" hint="Minimal 8 karakter.">
        <Input
          id="sandi"
          name="sandi"
          type="password"
          autoComplete="new-password"
          required
          value={sandi}
          onChange={(e) => setSandi(e.target.value)}
        />
      </Field>

      <Field label="Ulangi kata sandi baru" htmlFor="konfirmasi">
        <Input
          id="konfirmasi"
          name="konfirmasi"
          type="password"
          autoComplete="new-password"
          required
          value={konfirmasi}
          onChange={(e) => setKonfirmasi(e.target.value)}
        />
      </Field>

      <Btn type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? "Menyimpan…" : "Simpan kata sandi baru"}
      </Btn>
    </form>
  );
}

export default function ResetKataSandiPage() {
  return (
    <AuthShell
      chapter="Lembar pengaturan ulang"
      title="Buat kata sandi baru"
      lead="Masukkan kata sandi baru dan konfirmasinya. Tautan yang kamu buka hanya berlaku sekali."
    >
      <Suspense
        fallback={
          <p className="font-mono text-caption uppercase tracking-[0.12em] text-ink-3">
            Memuat tautan…
          </p>
        }
      >
        <ResetInner />
      </Suspense>
    </AuthShell>
  );
}
