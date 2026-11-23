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
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-2 px-4 py-2.5">
        <p className="text-caption font-medium text-ink">Video ringkasan {spec.title}</p>
        <a
          href={info.video.watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-micro font-medium text-signal-bright hover:underline"
        >
          Buka di YouTube
          <IconExternal size={12} />
        </a>
      </div>

      <div className="aspect-video bg-canvas">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${info.video.id}?start=${info.video.start}&rel=0`}
          title={info.video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <p className="text-caption text-ink-3">
          {info.video.title} ({info.video.channel}). Aktifkan teks terjemahan Indonesia lewat
          tombol <span className="font-mono text-ink-2">CC</span> pada pemutar.
        </p>
        <a
          href={`${info.video.watchUrl}&t=${info.video.start}s`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-micro text-signal-bright hover:underline"
        >
          Menit {Math.floor(info.video.start / 60)}:{String(info.video.start % 60).padStart(2, "0")}
          <IconExternal size={12} />
        </a>
      </div>
    </div>
  );
}
