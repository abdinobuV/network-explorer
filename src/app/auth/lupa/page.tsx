import Link from "next/link";
import { Navbar, Footer } from "@/components/chrome";
import { TopoMini } from "@/components/topo";

export default function LupaPage() {
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
          <form action="/auth/konfirmasi" className="mt-5 space-y-4">
            <div><label className="text-sm font-bold">Email</label><input required className="input mt-1" defaultValue="navigator@example.com" /></div>
            <div className="rounded-lg bg-[#00c2e0]/10 p-3 text-xs text-slate-300">ⓘ Jika email terhubung ke akun, instruksi pemulihan akan dikirim ke alamat tersebut.</div>
            <button className="btn-cyan w-full py-3">Kirim Instruksi Reset</button>
            <p className="text-center text-sm"><Link href="/auth/login" className="text-[#22d3ee]">← Kembali ke Login</Link></p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
