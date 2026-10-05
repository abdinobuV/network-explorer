import Link from "next/link";

export default function Splash() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-16 text-center">
      <span className="chip border border-[#00c2e0]/50">MISSION CONTROL • WEB INTERAKTIF SMA</span>
      <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-6xl">
        Network Explorer:
        <br />
        <span className="text-[#00e676]">Misi Topologi</span>
      </h1>
      <p className="mt-4 max-w-2xl text-slate-400">
        Pelajari bagaimana komputer saling terhubung, bertukar data, dan bangun jaringan idamanmu secara
        interaktif!
      </p>
      <div className="card mt-8 w-full max-w-xl p-8 shadow-[0_0_60px_rgba(0,194,224,0.15)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="h-3 w-2/3 rounded bg-white/10" />
            <div className="h-3 w-full rounded bg-white/10" />
            <div className="h-3 w-1/2 rounded bg-[#00e676]" />
          </div>
          <div className="grid h-28 w-28 place-items-center rounded-full border-2 border-[#00c2e0] bg-[#00c2e0]/10">
            <span className="h-10 w-10 rounded-full bg-[#00e676]" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="ml-auto h-3 w-2/3 rounded bg-white/10" />
            <div className="ml-auto h-3 w-1/2 rounded bg-[#00c2e0]" />
            <div className="ml-auto h-3 w-full rounded bg-white/10" />
          </div>
        </div>
        <div className="mx-auto mt-4 flex max-w-xs items-center justify-between">
          <span className="h-3 w-3 rounded-full bg-[#00e676]" />
          <span className="h-px flex-1 bg-white/10" />
          <span className="h-3 w-3 rounded-full bg-[#00c2e0]" />
        </div>
      </div>
      <Link href="/beranda" className="btn-neon mt-8 px-10 py-4 text-lg">
        Mulai Misi Sekarang <span className="ml-2">→</span>
      </Link>
      <p className="mt-6 text-xs text-slate-500">Versi 1.2.0 • Kurikulum Merdeka Teknologi Informasi SMA Kelas XI</p>
      <div className="mt-4 flex gap-4 text-sm">
        <Link href="/auth/login" className="text-[#22d3ee] hover:underline">Masuk</Link>
        <Link href="/misi" className="text-slate-400 hover:underline">Langsung ke Misi Utama</Link>
      </div>
    </main>
  );
}
