"use client";

import { useSyncExternalStore } from "react";
import { dismissToast, getServerToasts, getToasts, subscribeToast } from "@/lib/toast";
import { IconCheck, IconCross, IconInfo } from "@/components/icons";
import { cx } from "@/components/ui";

/** Wadah notifikasi. Pasang sekali di layout. */
export default function ToastViewport() {
  const toasts = useSyncExternalStore(subscribeToast, getToasts, getServerToasts);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cx(
            "pointer-events-auto flex items-start gap-2.5 border px-4 py-3 shadow-lift",
            t.tone === "ok" && "border-green/50 bg-green-2 text-ink",
            t.tone === "error" && "border-redpen/50 bg-redpen-2 text-ink",
            t.tone === "default" && "border-rule bg-paper text-ink",
          )}
        >
          <span className="mt-0.5 shrink-0">
            {t.tone === "ok" ? (
              <IconCheck size={15} className="text-green" />
            ) : t.tone === "error" ? (
              <IconCross size={15} className="text-redpen" />
            ) : (
              <IconInfo size={15} className="text-blueprint" />
            )}
          </span>
          <p className="flex-1 text-caption leading-relaxed">{t.message}</p>
          <button
            type="button"
            onClick={() => dismissToast(t.id)}
            aria-label="Tutup notifikasi"
            className="font-mono text-micro text-ink-3 hover:text-ink"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
