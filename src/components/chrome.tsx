"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { useAuth, useProg } from "@/lib/store";
import { levelProgress } from "@/lib/progression";
import { isDemoMode } from "@/lib/firebase";
import {
  getServerSoundEnabled,
  isSoundEnabled,
  setSoundEnabled,
  sfx,
  subscribeSound,
} from "@/lib/sound";
import {
  IconBook,
  IconChart,
  IconCloud,
  IconGrid,
  IconList,
  IconShield,
  IconVolume,
  IconVolumeOff,
} from "@/components/icons";
import { Container, cx } from "@/components/ui";

/* ------------------------------------------------------------------ Logo */

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center border border-ink bg-ink text-paper">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none">
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="4" cy="4" r="1.6" fill="currentColor" />
          <circle cx="20" cy="4" r="1.6" fill="currentColor" />
          <circle cx="4" cy="20" r="1.6" fill="currentColor" />
          <circle cx="20" cy="20" r="1.6" fill="currentColor" />
        </svg>
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block font-mono text-caption font-medium uppercase tracking-[0.18em] text-ink">
            Network Explorer
          </span>
          <span className="hidden font-mono text-micro uppercase tracking-[0.14em] text-ink-3 sm:block">
            Buku Praktis Topologi
          </span>
        </span>
      )}
    </Link>
  );
}

/* ------------------------------------------------------------------ Tombol suara */

function SoundToggle() {
  const on = useSyncExternalStore(subscribeSound, isSoundEnabled, getServerSoundEnabled);

  return (
    <button
      type="button"
      onClick={() => {
        const next = !on;
        setSoundEnabled(next);
        if (next) sfx("click");
      }}
      aria-pressed={on}
      aria-label={on ? "Matikan efek suara" : "Aktifkan efek suara"}
      title={on ? "Matikan efek suara" : "Aktifkan efek suara"}
      className="grid h-8 w-8 place-items-center border border-rule-2 text-ink-3 transition-colors hover:border-ink hover:text-ink"
    >
      {on ? <IconVolume size={15} /> : <IconVolumeOff size={15} />}
    </button>
  );
}

/* ------------------------------------------------------------------ Navigasi */

const MAIN_NAV = [
  { label: "Misi", href: "/misi" },
  { label: "Sandbox", href: "/sandbox/star" },
  { label: "Progres", href: "/progres" },
];

const SUB_NAV = [
  { label: "Panduan", href: "/panduan", icon: IconBook },
  { label: "Topologi", href: "/perbandingan", icon: IconList },
  { label: "Kuis akhir", href: "/kuis", icon: IconShield },
  { label: "Glosarium", href: "/glosarium", icon: IconGrid },
  { label: "Rapor", href: "/cetak", icon: IconChart },
];

export function Navbar({ pub = false }: { pub?: boolean }) {
  const path = usePathname();
  const { user } = useAuth();
  const { xp, cloudOn, syncState, syncError } = useProg();
  const lv = levelProgress(xp);

  if (pub) {
    return (
      <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur-sm">
        <Container width="page" className="flex items-center justify-between py-3">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            {[
              ["Tentang", "/beranda#tentang"],
              ["Topologi", "/beranda#topologi"],
              ["Cara belajar", "/beranda#cara"],
              ["FAQ", "/beranda#faq"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="font-mono text-micro uppercase tracking-[0.14em] text-ink-3 transition-colors hover:text-ink"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="font-mono text-micro uppercase tracking-[0.14em] text-ink-2 transition-colors hover:text-ink"
            >
              Masuk
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center rounded-xs border border-ink bg-ink px-3.5 py-1.5 font-mono text-micro uppercase tracking-[0.12em] text-paper transition-colors hover:bg-ink-2"
            >
              Mulai
            </Link>
          </div>
        </Container>
      </header>
    );
  }

  const initial = (user?.name ?? "S").trim().charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur-sm">
      <Container width="page" className="flex items-center justify-between gap-4 py-2.5">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {MAIN_NAV.map((item) => {
            const active = path === item.href || path.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  "rounded-xs px-3 py-1.5 font-mono text-micro uppercase tracking-[0.12em] transition-colors",
                  active ? "bg-ink text-paper" : "text-ink-3 hover:bg-paper-2 hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex min-w-0 items-center gap-3">
          <SoundToggle />

          {cloudOn && (
            <span
              title={syncError ?? "Progres tersimpan di cloud"}
              className={cx(
                "hidden items-center gap-1 font-mono text-micro uppercase tracking-[0.1em] sm:inline-flex",
                syncState === "error" ? "text-redpen" : "text-ink-3",
              )}
            >
              <IconCloud size={14} />
              {syncState === "loading"
                ? "menyinkron"
                : syncState === "saving"
                  ? "menyimpan"
                  : syncState === "error"
                    ? "gagal"
                    : "tersimpan"}
            </span>
          )}

          <div className="min-w-0 text-right leading-tight">
            <p className="truncate text-caption font-medium text-ink">{user?.name ?? "Siswa"}</p>
            <p className="truncate font-mono text-micro text-ink-3">
              {xp.toLocaleString("id-ID")} XP · Tingkat {lv.level}
            </p>
          </div>

          <Link
            href="/profil"
            className="grid h-8 w-8 place-items-center overflow-hidden rounded-full border border-rule-2 bg-paper-2 font-mono text-caption text-ink transition-colors hover:border-ink"
            aria-label="Halaman profil"
          >
            {user?.photoURL ? (
              <Image
                src={user.photoURL}
                alt=""
                width={32}
                height={32}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              initial
            )}
          </Link>
        </div>
      </Container>

      <div className="border-t border-rule bg-paper-2">
        <Container width="page" className="flex items-center gap-1 overflow-x-auto py-1.5">
          {SUB_NAV.map((item) => {
            const active = path === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-xs px-2.5 py-1 font-mono text-micro uppercase tracking-[0.1em] transition-colors",
                  active ? "bg-paper text-ink" : "text-ink-3 hover:text-ink",
                )}
              >
                <Icon size={13} />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/pengaturan"
            className={cx(
              "ml-auto shrink-0 rounded-xs px-2.5 py-1 font-mono text-micro uppercase tracking-[0.1em] transition-colors",
              path === "/pengaturan" ? "bg-paper text-ink" : "text-ink-3 hover:text-ink",
            )}
          >
            Pengaturan
          </Link>
        </Container>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ Footer */

export function Footer({ help = false }: { help?: boolean }) {
  return (
    <footer className="mt-16 border-t border-rule bg-paper-2">
      <Container width="page" className="flex flex-col gap-2 py-5 md:flex-row md:items-center md:justify-between">
        <p className="font-mono text-micro uppercase tracking-[0.12em] text-ink-3">
          Network Explorer · Buku Praktis Topologi Jaringan · Informatika SMA Kelas XI
        </p>
        <nav className="flex flex-wrap gap-4 font-mono text-micro uppercase tracking-[0.12em]">
          {help ? (
            <Link href="/glosarium" className="text-blueprint hover:underline">
              Butuh bantuan? Buka glosarium
            </Link>
          ) : (
            <>
              <Link href="/glosarium" className="text-blueprint hover:underline">
                Glosarium
              </Link>
              <Link href="/privasi" className="text-blueprint hover:underline">
                Privasi
              </Link>
              <Link href="/ketentuan" className="text-blueprint hover:underline">
                Ketentuan
              </Link>
            </>
          )}
        </nav>
      </Container>
    </footer>
  );
}

/* ------------------------------------------------------------------ Info demo */

export function DemoNotice() {
  const { isDemo } = useAuth();
  if (!isDemo) return null;
  return (
    <p className="border border-amber/40 bg-amber-2 px-3 py-2 text-caption text-ink-2">
      Mode demo aktif: data disimpan di peramban ini saja dan belum disinkronkan ke cloud.
      {isDemoMode ? "" : ""}
    </p>
  );
}
