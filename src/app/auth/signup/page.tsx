"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar, Footer } from "@/components/chrome";
import { TopoMini } from "@/components/topo";
import { useAuth } from "@/lib/store";

export default function SignupPage() {
  const { signup, user, ready } = useAuth();
  const r = useRouter();
  useEffect(() => {
    if (ready && user) r.replace("/misi");
  }, [ready, user, r]);
  const [f, setF] = useState({ name: "", email: "", kelas: "XI", pass: "" });
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState("");
  return (
    <div>
      <Navbar pub />
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2">
        <div>
          <span className="chip">SMA KELAS XI • INFORMATIKA</span>
          <h1 className="mt-4 text-4xl font-extrabold">Setiap koneksi punya cerita. Jelajahi milikmu.</h1>
          <p className="mt-3 text-slate-400">Pahami Bus, Ring, dan Star melalui materi visual, praktik, simulasi, dan kuis.</p>
          <div className="card mt-6 p-5">
            <div className="rounded-xl bg-[#0a1428] p-4"><TopoMini kind="star" /></div>
            <p className="mt-2 text-center text-xs text-[#22d3ee]">Amati pola. Coba sendiri. Pahami alasannya.</p>
          </div>
        </div>
        <div className="card p-6 md:p-8">
          <h2 className="text-2xl font-extrabold">Mulai misi pertamamu.</h2>
          <p className="text-sm text-slate-400">Buat akun siswa untuk menyimpan perjalanan belajarmu.</p>
          <form
            className="mt-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!agree) return setErr("Centang persetujuan Ketentuan & Privasi dulu.");
              const m = signup({ name: f.name, email: f.email, kelas: f.kelas, pass: f.pass });
              if (m) setErr(m);
              else r.push("/misi");
            }}
          >
            <div><label className="text-sm font-bold">Nama siswa</label><input className="input mt-1" placeholder="Nama yang ingin ditampilkan" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            <div><label className="text-sm font-bold">Email</label><input className="input mt-1" placeholder="nama@example.com" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
            <div><label className="text-sm font-bold">Kelas</label>
              <select className="input mt-1" value={f.kelas} onChange={(e) => setF({ ...f, kelas: e.target.value })}>
                <option value="XI">Pilih kelas XI</option><option value="X">X</option><option value="XI">XI</option><option value="XII">XII</option>
              </select>
            </div>
            <div><label className="text-sm font-bold">Kata sandi</label><input className="input mt-1" type="password" placeholder="Buat kata sandi" value={f.pass} onChange={(e) => setF({ ...f, pass: e.target.value })} />
              <p className="mt-1 text-xs text-slate-500">Gunakan minimal 8 karakter dengan huruf besar, huruf kecil, dan angka.</p></div>
            <label className="flex items-start gap-2 text-xs text-slate-400">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
              Saya menyetujui Ketentuan Penggunaan dan telah membaca Kebijakan Privasi.
            </label>
            {err && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{err}</p>}
            <button className="btn-cyan w-full py-3">Buat Akun →</button>
            <p className="text-center text-sm text-slate-400">Sudah punya akun? <Link href="/auth/login" className="font-semibold text-[#22d3ee]">Masuk</Link></p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
