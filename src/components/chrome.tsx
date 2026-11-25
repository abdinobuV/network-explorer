"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { useAuth, useProg } from "@/lib/store";
import { levelProgress } from "@/lib/progression";
import {
  getServerSoundEnabled,
  isSoundEnabled,
  setSoundEnabled,
  sfx,
  subscribeSound,
} from "@/lib/sound";
import { IconCloud, IconVolume, IconVolumeOff } from "@/components/icons";
import { Container, cx } from "@/components/ui";

/* ------------------------------------------------------------------ Logo */

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-md border border-border-2 bg-surface-2 text-signal transition-colors group-hover:border-signal">
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none">
          <path d="M12 4.5v4M12 15.5v4M4.5 12h4M15.5 12h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="12" r="3" stroke="#2fd17a" strokeWidth="1.8" />
          <circle cx="12" cy="3.5" r="1.6" fill="#5ce1f6" />
          <circle cx="12" cy="20.5" r="1.6" fill="#5ce1f6" />
          <circle cx="3.5" cy="12" r="1.6" fill="#5ce1f6" />
          <circle cx="20.5" cy="12" r="1.6" fill="#5ce1f6" />
        </svg>
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block font-display text-body font-bold tracking-tight text-ink">
            Misi Topologi
          </span>
          <span className="hidden text-micro text-ink-3 sm:block">Network Explorer</span>
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
      className="grid h-8 w-8 cursor-pointer place-items-center rounded-md border border-border-2 bg-surface-2 text-ink-2 transition-colors hover:border-signal hover:text-signal-bright"
    >
      {on ? <IconVolume size={15} /> : <IconVolumeOff size={15} />}
    </button>
  );
}

/* ------------------------------------------------------------------ Navigasi */

const MAIN_NAV = [
  { label: "Peta misi", href: "/misi" },
  { label: "Sandbox", href: "/sandbox/star", match: "/sandbox" },
  { label: "Perbandingan", href: "/perbandingan" },
  { label: "Kuis akhir", href: "/kuis" },
  { label: "Analitik", href: "/analitik" },
  { label: "Asisten AI", href: "/asisten" },
  { label: "Progres", href: "/progres" },
];

const UTIL_NAV = [
  { label: "Panduan", href: "/panduan" },
  { label: "Glosarium", href: "/glosarium" },
  { label: "Sertifikat & rapor", href: "/cetak" },
  { label: "Pengaturan", href: "/pengaturan" },
];

export function Navbar({ pub = false }: { pub?: boolean }) {
  const path = usePathname();
  const { user } = useAuth();
  const { xp, cloudOn, syncState, syncError } = useProg();
  const lv = levelProgress(xp);

  if (pub) {
    return (
      <header className="sticky top-0 z-40 border-b border-border bg-canvas/95 backdrop-blur-sm">
        <Container width="page" className="flex items-center justify-between py-3">
          <Logo />
          <nav className="hidden items-center gap-6 text-caption md:flex" aria-label="Navigasi beranda">
            {[
              ["Tentang", "/beranda#tentang"],
              ["Topologi", "/beranda#topologi"],
              ["Cara belajar", "/beranda#cara"],
              ["FAQ", "/beranda#faq"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="text-ink-2 transition-colors hover:text-ink"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-2 py-1.5 text-caption font-medium text-ink-2 transition-colors hover:text-ink"
            >
              Masuk
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center rounded-md bg-ok px-4 py-2 text-caption font-semibold text-ok-ink transition-colors hover:brightness-105"
            >
              Mulai belajar
            </Link>
          </div>
        </Container>
      </header>
    );
  }

  const initial = (user?.name ?? "S").trim().charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas/95 backdrop-blur-sm">
      <Container width="page" className="flex items-center justify-between gap-4 py-2.5">
        <div className="flex items-center gap-6">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
            {MAIN_NAV.map((item) => {
              const prefix = item.match ?? item.href;
              const active = path === item.href || path.startsWith(prefix + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "rounded-md px-3 py-1.5 text-caption font-medium transition-colors",
                    active
                      ? "bg-signal-tint text-signal-bright"
                      : "text-ink-2 hover:bg-surface hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex min-w-0 items-center gap-3">
          <SoundToggle />

          {cloudOn && (
            <span
              title={syncError ?? "Progres tersimpan di cloud"}
              className={cx(
                "hidden items-center gap-1.5 font-mono text-micro sm:inline-flex",
                syncState === "error" ? "text-fault" : "text-ink-3",
              )}
            >
              <IconCloud size={14} />
              {syncState === "loading"
                ? "sinkron"
                : syncState === "saving"
                  ? "menyimpan"
                  : syncState === "error"
                    ? "gagal"
                    : "cloud"}
            </span>
          )}

          <div className="min-w-0 text-right leading-tight">
            <p className="max-w-[120px] truncate text-caption font-medium text-ink sm:max-w-[180px]">
              {user?.name ?? "Siswa"}
            </p>
            <p className="truncate font-mono text-micro text-ok">
              {xp.toLocaleString("id-ID")} XP · Lv.{lv.level}
            </p>
          </div>

          <Link
            href="/profil"
            className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-border-2 bg-surface-2 font-display text-caption font-bold text-signal-bright transition-colors hover:border-signal"
            aria-label="Halaman profil"
          >
            {user?.photoURL ? (
              <Image
                src={user.photoURL}
                alt=""
                width={36}
                height={36}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              initial
            )}
          </Link>
        </div>
      </Container>

      <div className="border-t border-border-3 bg-surface/80">
        <Container width="page" className="flex items-center gap-1 overflow-x-auto py-1.5">
          {/* Tampilkan rute utama di layar < lg agar tetap 1 klik di mobile/tablet */}
          {MAIN_NAV.map((item) => {
            const prefix = item.match ?? item.href;
            const active = path === item.href || path.startsWith(prefix + "/");
            return (
              <Link
                key={`mob-${item.href}`}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "shrink-0 rounded-xs px-2.5 py-1 text-micro font-medium transition-colors lg:hidden",
                  active
                    ? "bg-signal-tint text-signal-bright"
                    : "text-ink-2 hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}

          <span className="mx-1 h-3.5 w-px shrink-0 bg-border lg:hidden" aria-hidden="true" />

          {UTIL_NAV.map((item) => {
            const active = path === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "shrink-0 rounded-xs px-2.5 py-1 text-micro font-medium transition-colors",
                  item.href === "/pengaturan" && "lg:ml-auto",
                  active
                    ? "bg-surface-3 text-ink"
                    : "text-ink-3 hover:bg-surface-2 hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </Container>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ Footer */

export function Footer({ help = false }: { help?: boolean }) {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <Container width="page" className="flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between">
        <p className="text-micro text-ink-3">
          Misi Topologi, Network Explorer — Informatika SMA Kelas XI
        </p>
        <nav className="flex flex-wrap gap-5 text-micro" aria-label="Tautan kaki halaman">
          {help ? (
            <Link href="/glosarium" className="text-signal-bright hover:underline">
              Butuh bantuan? Buka glosarium
            </Link>
          ) : (
            <>
              <Link href="/glosarium" className="text-ink-2 hover:text-signal-bright">
                Glosarium
              </Link>
              <Link href="/privasi" className="text-ink-2 hover:text-signal-bright">
                Privasi
              </Link>
              <Link href="/ketentuan" className="text-ink-2 hover:text-signal-bright">
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
    <p className="rounded-md border border-caution/35 bg-caution-tint px-3.5 py-2.5 text-caption text-ink-2">
      Mode demo aktif: data disimpan di peramban ini saja dan belum disinkronkan ke cloud.
    </p>
  );
}
