"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar, Footer } from "@/components/chrome";
import { TopoMini } from "@/components/topo";
import { useAuth } from "@/lib/store";

function AuthShell({ title, sub, children, side = "Setiap koneksi punya cerita. Jelajahi milikmu." }: { title: string; sub: string; children: React.ReactNode; side?: string }) {
  return (
    <div>
      <Navbar pub />
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2 md:items-center">
        <div>
          <span className="chip">SMA KELAS XI • INFORMATIKA</span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight">{side}</h1>
          <p className="mt-3 text-slate-400">Pahami Bus, Ring, dan Star melalui materi visual, praktik, simulasi, dan kuis.</p>
          <div className="card mt-6 p-5">
            <div className="rounded-xl bg-[#0a1428] p-4"><TopoMini kind="star" /></div>
            <p className="mt-2 text-center text-xs text-[#22d3ee]">Amati pola. Coba sendiri. Pahami alasannya.</p>
          </div>
        </div>
        <div className="card p-6 md:p-8">
          <h2 className="text-2xl font-extrabold">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{sub}</p>
          <div className="mt-5">{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function LoginForm() {
  const { login, user, ready } = useAuth();
  const r = useRouter();
  useEffect(() => {
    if (ready && user) r.replace("/misi");
  }, [ready, user, r]);
  const [email, setEmail] = useState("navigator@example.com");
  const [pass, setPass] = useState("password123");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const m = login(email, pass);
        if (m) setErr(m);
        else r.push("/misi");
      }}
      className="space-y-4"
    >
      <div>
        <label className="text-sm font-bold">Email</label>
        <input className="input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="navigator@example.com" />
        <p className="mt-1 text-xs text-slate-500">Gunakan email yang kamu pakai saat mendaftar.</p>
      </div>
      <div>
        <label className="text-sm font-bold">Kata sandi</label>
        <div className="relative">
          <input className="input mt-1 pr-24" type={show ? "text" : "password"} value={pass} onChange={(e) => setPass(e.target.value)} />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#22d3ee]">👁 {show ? "Sembunyi" : "Tampilkan"}</button>
        </div>
      </div>
      <div className="text-right text-sm"><Link href="/auth/lupa" className="text-[#22d3ee]">Lupa kata sandi?</Link></div>
      {err && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{err}</p>}
      <button className="btn-cyan w-full py-3">Masuk →</button>
      <p className="text-center text-sm text-slate-400">Belum punya akun? <Link href="/auth/signup" className="text-[#22d3ee] font-semibold">Daftar sekarang</Link></p>
      <p className="text-center text-xs text-slate-500">🛡 Jangan bagikan kata sandimu kepada siapa pun.</p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthShell title="Selamat datang kembali." sub="Masuk untuk melanjutkan misi belajarmu.">
      <LoginForm />
    </AuthShell>
  );
}
