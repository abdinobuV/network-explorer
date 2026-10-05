"use client";
import Link from "next/link";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { useAuth, useProg } from "@/lib/store";

export default function Profil() {
  const { user } = useAuth();
  const { xp } = useProg();
  const name = user?.name ?? "Siswa Navigator";
  return (
    <RequireAuth>
    <div>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-xs font-bold text-[#00c2e0]">AKUN SISWA</div>
        <h1 className="text-3xl font-extrabold">Profil Siswa</h1>
        <p className="text-slate-400">Identitas dan pencapaian dalam perjalanan misimu.</p>
        <div className="card mt-5 flex flex-col gap-4 border-[#00c2e0] p-6 md:flex-row md:items-center">
          <span className="grid h-20 w-20 place-items-center rounded-full border-2 border-[#00c2e0] bg-gradient-to-br from-fuchsia-500 to-cyan-500 text-4xl">🧑‍🚀</span>
          <div className="flex-1">
            <span className="chip">SISWA • KELAS {user?.kelas ?? "XI"}</span>
            <div className="mt-1 text-3xl font-extrabold">{name}</div>
            <div className="text-sm text-slate-400">Penjelajah jaringan yang belajar satu koneksi demi satu koneksi.</div>
            <div className="text-xs text-slate-500">{user?.email ?? "navigator@example.com"}</div>
          </div>
          <div className="text-right"><div className="text-2xl font-black">Level 4</div><div className="font-bold text-[#00e676]">XP: {xp.toLocaleString("id-ID")}</div></div>
          <Link href="/pengaturan" className="btn-ghost px-5 py-2 text-sm">Edit Profil</Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_320px]">
          <div className="card p-5">
            <div className="flex justify-between"><h3 className="font-extrabold">Lencana pencapaian</h3><span className="text-xs text-slate-400">2 diraih • 1 terkunci</span></div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {[
                ["🎖", "Penjelajah Bus", "Semua tahap Bus selesai", true],
                ["⚡", "Pengirim Paket", "Uji aliran data pertama", true],
                ["🔒", "Ahli Topologi", "Selesaikan 3 topologi", false],
              ].map(([i, t, d, ok]) => (
                <div key={t as string} className={`rounded-xl border p-4 ${ok ? "border-white/10 bg-black/30" : "border-white/10 bg-black/30 opacity-60"}`}>
                  <div className="text-2xl">{i}</div><div className="mt-1 text-sm font-bold">{t}</div>
                  <div className="text-xs text-slate-400">{d}</div>
                  <div className={`mt-1 text-xs ${ok ? "text-[#00e676]" : "text-slate-500"}`}>{ok ? "Diraih" : "Belum diraih"}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <div className="text-[#22d3ee]">👤</div>
            <h3 className="mt-1 font-extrabold">Ruang belajarmu</h3>
            <p className="mt-1 text-sm text-slate-400">Kelas {user?.kelas ?? "XI"} • Informatika</p>
            <p className="mt-2 text-sm text-slate-400">Ubah identitas dan preferensi belajarmu melalui Pengaturan Akun.</p>
            <Link href="/pengaturan" className="mt-2 inline-block text-sm font-bold text-[#22d3ee]">Buka Pengaturan Akun →</Link>
          </div>
        </div>
        <div className="card mt-4 p-5">
          <div className="flex justify-between"><h3 className="font-extrabold">Aktivitas terbaru</h3><Link href="/progres" className="text-sm text-[#22d3ee]">Lihat Progres Belajar →</Link></div>
          <ul className="mt-2 space-y-2 text-sm">
            <li className="flex justify-between"><span>📖 Materi Star dibaca</span><span className="text-xs text-slate-400">Hari ini, 10.25</span></li>
            <li className="flex justify-between"><span>✈ Simulasi Ring diselesaikan</span><span className="text-xs text-slate-400">Hari ini, 10.12</span></li>
            <li className="flex justify-between"><span>🔌 Praktik Bus diselesaikan</span><span className="text-xs text-slate-400">Kemarin, 14.30</span></li>
          </ul>
        </div>
      </main>
      <Footer help />
    </div>
    </RequireAuth>
  );
}
