"use client";
import { useState } from "react";
import { TOPOLOGI, type TopoKey } from "@/lib/data";

// Player YouTube (youtube-nocookie, Bahasa Inggris + subtitle Indonesia via CC)
// mulai otomatis di chapter tiap topologi. Dilengkapi fallback jika embed diblokir.
export default function VideoBlock({ topo }: { topo: TopoKey }) {
  const v = TOPOLOGI[topo].video;
  const [failed, setFailed] = useState(false);
  const src = `https://www.youtube-nocookie.com/embed/${v.id}?start=${v.start}&rel=0`;

  return (
    <div className="card overflow-hidden p-0">
      <div className="flex items-center justify-between gap-2 p-4 pb-0">
        <div className="text-xs text-slate-400">
          🎬 {v.title} <span className="text-slate-500">• {v.channel}</span>
        </div>
      </div>
      {!failed ? (
        <div className="p-4">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black" style={{ aspectRatio: "16 / 9" }}>
            <iframe
              key={v.id + v.start}
              src={src}
              title={`Video: ${v.title}`}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onError={() => setFailed(true)}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            💡 Video berbahasa Inggris — aktifkan <b>CC → Indonesia</b> pada kontrol player YouTube.
            Video dimulai otomatis di bagian {TOPOLOGI[topo].title}.
          </p>
          <a
            href={`${v.watchUrl}&t=${v.start}s`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-semibold text-[#22d3ee] hover:underline"
          >
            Tonton di YouTube ↗
          </a>
        </div>
      ) : (
        <div className="grid place-items-center p-8 text-center text-sm text-slate-300">
          <div>
            <div className="text-4xl">📺</div>
            <b className="mt-2 block">Video tidak bisa diputar di sini.</b>
            <p className="mt-1 text-xs text-slate-400">Pemilik video membatasi pemutaran embed.</p>
            <a
              href={`${v.watchUrl}&t=${v.start}s`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cyan mt-4 inline-block px-5 py-2 text-sm"
            >
              Tonton di YouTube ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
