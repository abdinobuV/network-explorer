"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Navbar, Footer } from "@/components/chrome";
import { TopoMini } from "@/components/topo";
import { isFirebaseConfigured, sendResetEmail } from "@/lib/firebase";

export default function LupaPage() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div>
      <Navbar pub />
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2 md:items-center">
        <div>
          <span className="chip">AKSES AKUN</span>
          <h1 className="mt-4 text-4xl font-extrabold">Kembali terhubung. Lanjutkan misimu.</h1>
          <p className="mt-3 text-slate-400">Pulihkan akses akun dengan aman, lalu kembali ke materi dan misi belajarmu.</p>
          <div className="card mt-6 p-5"><div className="rounded-xl bg-[#0a1428] p-4"><TopoMini kind="star" /></div>
            <p className="mt-2 text-center text-xs text-[#22d3ee]">Amati pola. Coba sendiri. Pahami alasannya.</p></div>
        </div>
        <div className="card p-6 md:p-8">
          <span className="chip">PEMULIHAN AKUN</span>
          <div className="mt-3 text-3xl">🔑</div>
          <h2 className="mt-2 text-2xl font-extrabold">Lupa kata sandi?</h2>
          <p className="text-sm text-slate-400">Masukkan email yang kamu gunakan untuk akun MISI TOPOLOGI.</p>
          <form
            className="mt-5 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!email.trim()) return setErr("Isi email dulu.");
              if (!isFirebaseConfigured) {
                r.push("/auth/konfirmasi");
                return;
              }
              setBusy(true);
              const m = await sendResetEmail(email);
              setBusy(false);
              if (m) setErr(m);
              else r.push("/auth/konfirmasi");
            }}
          >
            <div><label className="text-sm font-bold">Email</label><input value={email} onChange={(e) => setEmail(e.target.value)} required className="input mt-1" placeholder="nama@example.com" /></div>
            <div className="rounded-lg bg-[#00c2e0]/10 p-3 text-xs text-slate-300">ⓘ Tautan reset ASLI dikirim ke email tersebut. Klik tautan di email untuk membuat kata sandi baru.</div>
            {err && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{err}</p>}
            <button disabled={busy} className="btn-cyan w-full py-3 disabled:opacity-60">
              {busy ? "Mengirim..." : "Kirim Instruksi Reset"}
            </button>
            <p className="text-center text-sm"><Link href="/auth/login" className="text-[#22d3ee]">← Kembali ke Login</Link></p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
