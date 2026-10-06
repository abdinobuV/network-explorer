"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, useProg } from "@/lib/store";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#00c2e0] text-[#06121f] font-black">
        ⁂
      </span>
      <span className="font-extrabold tracking-wide">MISI TOPOLOGI</span>
    </Link>
  );
}

export function Navbar({ pub = false }: { pub?: boolean }) {
  const path = usePathname();
  const { user, fuser } = useAuth();
  const displayName = fuser?.displayName ?? user?.name ?? "Siswa Navigator";
  const avatar = fuser?.photoURL ?? null;
  const { xp, cloudOn, syncing } = useProg();
  const level = 4 + Math.floor(Math.max(0, xp - 2450) / 1000);
  if (pub) {
    return (
      <header className="border-b border-white/10 bg-[#0c1d3a]/90 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="hidden gap-6 text-sm text-slate-300 md:flex">
            <a href="/beranda#tentang" className="hover:text-white">Tentang</a>
            <a href="/beranda#topologi" className="hover:text-white">Topologi</a>
            <a href="/beranda#cara" className="hover:text-white">Cara Belajar</a>
            <a href="/beranda#faq" className="hover:text-white">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-semibold text-[#22d3ee]">Masuk</Link>
            <Link href="/auth/signup" className="btn-cyan px-4 py-2 text-sm">Mulai Belajar</Link>
          </div>
        </div>
      </header>
    );
  }
  const main = [
    ["Misi Utama", "/misi"],
    ["Sandbox Jaringan", "/sandbox"],
    ["Progres Belajar", "/progres"],
  ];
  const sub = [
    ["Panduan Belajar", "/panduan"],
    ["Progres Belajar", "/progres"],
    ["Perbandingan Topologi", "/perbandingan"],
    ["Kuis Akhir", "/kuis"],
    ["Glosarium & Bantuan", "/glosarium"],
  ];
  return (
    <header className="sticky top-0 z-40 bg-[#0c1d3a]/95 backdrop-blur border-b border-white/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Logo />
        <nav className="hidden gap-6 text-sm md:flex">
          {main.map(([l, h]) => (
            <Link key={h} href={h} className={path === h || path.startsWith(h + "/") ? "text-[#22d3ee] font-semibold" : "text-slate-300 hover:text-white"}>
              {l}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 text-right">
          <div className="leading-tight">
            <div className="max-w-[110px] truncate text-sm font-bold sm:max-w-none">{displayName}</div>
            <div className="text-xs text-[#00e676]">
              XP: {xp.toLocaleString("id-ID")} / Level {level}
              {cloudOn && <span className="ml-1 text-[#22d3ee]">{syncing ? "☁ …" : "☁ ✓"}</span>}
            </div>
          </div>
          <Link href="/profil" className="grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-[#00c2e0] bg-gradient-to-br from-fuchsia-500 to-cyan-500 text-sm">
            {avatar ? <img src={avatar} alt="foto profil" className="h-full w-full object-cover" /> : "🧑‍🚀"}
          </Link>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl gap-5 overflow-x-auto px-4 py-2 text-sm">
          {sub.map(([l, h]) => (
            <Link key={h} href={h} className={path === h ? "text-[#22d3ee] font-semibold border-b-2 border-[#22d3ee] pb-1" : "text-slate-400 hover:text-white pb-1"}>
              {l}
            </Link>
          ))}
          <Link href="/profil" className={path === "/profil" ? "text-[#22d3ee] font-semibold border-b-2 border-[#22d3ee] pb-1" : "text-slate-400 hover:text-white pb-1"}>Profil Siswa</Link>
          <Link href="/pengaturan" className={path === "/pengaturan" ? "text-[#22d3ee] font-semibold border-b-2 border-[#22d3ee] pb-1" : "text-slate-400 hover:text-white pb-1"}>Pengaturan Akun</Link>
        </div>
      </div>
    </header>
  );
}

export function Footer({ help = false }: { help?: boolean }) {
  return (
    <footer className="mt-12 border-t border-white/10 bg-[#0c1d3a]">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
        <span>MISI TOPOLOGI • Informatika SMA Kelas XI</span>
        {help ? (
          <Link href="/glosarium" className="text-[#22d3ee]">Butuh bantuan? Buka Glosarium &amp; Bantuan</Link>
        ) : (
          <span className="flex gap-2 text-[#22d3ee]">
            <Link href="/glosarium" className="hover:underline">Bantuan</Link> •
            <Link href="/privasi" className="hover:underline">Privasi</Link> •
            <Link href="/ketentuan" className="hover:underline">Ketentuan</Link>
          </span>
        )}
      </div>
    </footer>
  );
}

export function PageHead({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <div className="mb-6">
      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[#00c2e0]">{eyebrow}</div>
      <h1 className="text-3xl font-extrabold md:text-4xl">{title}</h1>
      {desc && <p className="mt-2 max-w-3xl text-slate-400">{desc}</p>}
    </div>
  );
}
