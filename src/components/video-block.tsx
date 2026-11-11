"use client";

import { TOPO_SPECS } from "@/lib/topology-model";
import { TOPOLOGI } from "@/lib/data";
import { IconExternal } from "@/components/icons";

/**
 * Penanam video YouTube (tanpa cookie). Setiap topologi memakai titik waktu
 * berbeda dari satu video ringkasan.
 */
export default function VideoBlock({ topo }: { topo: keyof typeof TOPOLOGI }) {
  const info = TOPOLOGI[topo];
  const spec = TOPO_SPECS[topo];

  return (
    <div className="border border-rule bg-paper">
      <div className="flex items-center justify-between gap-3 border-b border-rule bg-paper-2 px-3 py-2">
        <p className="font-mono text-micro uppercase tracking-[0.12em] text-ink-3">
          Video ringkasan · {spec.title}
        </p>
        <a
          href={info.video.watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-micro uppercase tracking-[0.1em] text-blueprint hover:underline"
        >
          Buka di YouTube
          <IconExternal size={12} />
        </a>
      </div>

      <div className="aspect-video bg-ink">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${info.video.id}?start=${info.video.start}&rel=0`}
          title={info.video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <p className="text-caption text-ink-3">
          {info.video.title} — {info.video.channel}. Video berbahasa Inggris; aktifkan subtitle
          Indonesia lewat tombol <span className="font-mono">CC</span> pada pemutar.
        </p>
        <a
          href={`${info.video.watchUrl}&t=${info.video.start}s`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-micro uppercase tracking-[0.1em] text-blueprint hover:underline"
        >
          Mulai dari menit {Math.floor(info.video.start / 60)}:{String(info.video.start % 60).padStart(2, "0")}
          <IconExternal size={12} />
        </a>
      </div>
    </div>
  );
}
