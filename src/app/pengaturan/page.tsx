"use client";
import Link from "next/link";
import { useState } from "react";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { useAuth } from "@/lib/store";
import { signOutFirebase } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Pengaturan() {
  const { user, fuser, update, logout } = useAuth();
  const r = useRouter();
  const [name, setName] = useState(fuser?.displayName ?? user?.name ?? "Siswa Navigator");
  const [kelas, setKelas] = useState(user?.kelas ?? "XI");
  const [tips, setTips] = useState(true);
  const [sound, setSound] = useState(false);
  const [saved, setSaved] = useState("");

  return (
    <RequireAuth>
    <div>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-xs font-bold text-[#00c2e0]">AKUN SISWA</div>
        <h1 className="text-3xl font-extrabold">Pengaturan Akun</h1>
        <p className="text-slate-400">Kelola identitas, keamanan, dan cara kamu belajar.</p>
        <div className="mt-5 grid gap-5 md:grid-cols-[240px_1fr]">
          <aside className="space-y-2">
            <div className="rounded-lg border border-[#00c2e0] bg-[#00c2e0]/10 px-4 py-2.5 text-sm font-bold text-[#22d3ee]">👤 Edit Profil</div>
            <div className="px-4 py-2.5 text-sm text-slate-400">🔒 Keamanan</div>
            <div className="px-4 py-2.5 text-sm text-slate-400">🎚 Preferensi Belajar</div>
            <p className="px-4 pt-4 text-xs text-slate-500">Perubahan profil tidak mengubah XP, level, atau pencapaian belajarmu.</p>
            <Link href="/profil" className="px-4 text-xs text-[#22d3ee]">← Kembali ke Profil Siswa</Link>
          </aside>
          <div className="space-y-4">
            <div className="card p-6">
              <div className="flex justify-between"><div><h3 className="font-extrabold">Edit Profil</h3>
                <p className="text-sm text-slate-400">Gunakan nama yang ingin tampil dalam misi belajarmu.</p></div>
                <span className="grid h-11 w-11 place-items-center rounded-full border border-[#00c2e0] bg-gradient-to-br from-fuchsia-500 to-cyan-500">🧑‍🚀</span></div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div><label className="text-sm font-bold">Nama siswa</label><input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div><label className="text-sm font-bold">Kelas</label>
                  <select className="input mt-1" value={kelas} onChange={(e) => setKelas(e.target.value)}><option>X</option><option>XI</option><option>XII</option></select></div>
              </div>
              <div className="mt-3 rounded-lg bg-black/30 p-3 text-sm text-slate-400">✉ Email akun: {fuser?.email ?? user?.email ?? "navigator@example.com"} <span className="float-right text-xs">{fuser ? "Akun Google tersinkron ☁" : "Data contoh"}</span></div>
              <div className="mt-3 flex justify-end gap-3">
                <button onClick={() => { setName(user?.name ?? ""); setKelas(user?.kelas ?? "XI"); }} className="btn-ghost px-5 py-2 text-sm">Batal</button>
                <button onClick={() => { update({ name, kelas }); setSaved("Perubahan disimpan."); setTimeout(() => setSaved(""), 2500); }} className="btn-cyan px-5 py-2 text-sm">Simpan Perubahan</button>
              </div>
              {saved && <p className="mt-2 text-right text-sm text-[#00e676]">{saved}</p>}
            </div>
            <div className="card flex items-center justify-between p-6">
              <div><h3 className="font-extrabold">🔒 Kata sandi</h3><p className="text-sm text-slate-400">Jaga akunmu dengan kata sandi yang unik.</p></div>
              <Link href="/auth/lupa" className="btn-ghost px-5 py-2 text-sm">Ubah Kata Sandi</Link>
            </div>
            <div className="card p-6">
              <h3 className="font-extrabold">Preferensi Belajar</h3>
              <div className="mt-3 flex items-center justify-between">
                <div><b className="text-sm">Petunjuk saat latihan</b><p className="text-xs text-slate-400">Tampilkan bantuan singkat ketika menyusun jaringan.</p></div>
                <button onClick={() => setTips(!tips)} className={`h-6 w-11 rounded-full p-0.5 ${tips ? "bg-[#00c2e0]" : "bg-white/10"}`}><span className={`block h-5 w-5 rounded-full bg-white transition ${tips ? "ml-auto" : ""}`} /></button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div><b className="text-sm">Suara simulasi</b><p className="text-xs text-slate-400">Putar suara ketika paket data berpindah.</p></div>
                <button onClick={() => setSound(!sound)} className={`h-6 w-11 rounded-full p-0.5 ${sound ? "bg-[#00c2e0]" : "bg-white/10"}`}><span className={`block h-5 w-5 rounded-full bg-white transition ${sound ? "ml-auto" : ""}`} /></button>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 p-5">
              <div><b className="text-sm">Selesai belajar untuk sekarang?</b><p className="text-xs text-slate-400">Keluar jika menggunakan komputer bersama. Progres tetap tersimpan.</p></div>
              <button onClick={async () => { await signOutFirebase(); logout(); r.push("/auth/login"); }} className="btn-ghost px-5 py-2 text-sm">Keluar</button>
            </div>
          </div>
        </div>
      </main>
      <Footer help />
    </div>
    </RequireAuth>
  );
}
