import Link from "next/link";

export default function Splash() {
  return (
    <main className="flex min-h-screen items-center px-4 py-6">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-6 md:grid-cols-2 md:gap-10">
        <div className="text-center md:text-left">
          <span className="chip border border-[#00c2e0]/50">MISSION CONTROL • WEB INTERAKTIF SMA</span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
            Network Explorer:
            <br />
            <span className="text-[#00e676]">Misi Topologi</span>
          </h1>
          <p className="mt-3 text-slate-400">
            Pelajari bagaimana komputer saling terhubung, bertukar data, dan bangun jaringan idamanmu secara
            interaktif!
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row md:justify-start sm:justify-center">
            <Link href="/beranda" className="btn-neon px-8 py-3.5 text-base">
              Mulai Misi Sekarang <span className="ml-1">→</span>
            </Link>
            <Link href="/auth/login" className="btn-ghost px-8 py-3.5 text-base">
              Masuk
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">Versi 1.2.0 • Kurikulum Merdeka TI SMA Kelas XI</p>
        </div>
        <div className="card w-full p-6 shadow-[0_0_60px_rgba(0,194,224,0.15)]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="h-3 w-2/3 rounded bg-white/10" />
              <div className="h-3 w-full rounded bg-white/10" />
              <div className="h-3 w-1/2 rounded bg-[#00e676]" />
            </div>
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-2 border-[#00c2e0] bg-[#00c2e0]/10">
              <span className="h-8 w-8 rounded-full bg-[#00e676]" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="ml-auto h-3 w-2/3 rounded bg-white/10" />
              <div className="ml-auto h-3 w-1/2 rounded bg-[#00c2e0]" />
              <div className="ml-auto h-3 w-full rounded bg-white/10" />
            </div>
          </div>
          <div className="mx-auto mt-3 flex max-w-xs items-center justify-between">
            <span className="h-3 w-3 rounded-full bg-[#00e676]" />
            <span className="h-px flex-1 bg-white/10" />
            <span className="h-3 w-3 rounded-full bg-[#00c2e0]" />
          </div>
          <Link href="/misi" className="mt-4 block text-center text-xs text-slate-400 hover:text-white hover:underline">
            Langsung ke Misi Utama →
          </Link>
        </div>
      </div>
    </main>
  );
}
