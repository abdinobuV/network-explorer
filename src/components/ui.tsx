import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/* =============================================================================
   KOMPONEN ANTARMUKA — Network Lab Gelap
   Satu sumber gaya untuk seluruh halaman. Permukaan solid bertingkat, tipografi
   sentence-case yang jernih, dan monospace khusus untuk data teknis.
   ========================================================================== */

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/* ---------------------------------------------------------------- Lebar halaman */

const WIDTHS = {
  narrow: "max-w-3xl",
  page: "max-w-6xl",
  wide: "max-w-[88rem]",
  sheet: "max-w-5xl",
} as const;

export function Container({
  width = "page",
  className,
  children,
}: {
  width?: keyof typeof WIDTHS;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx("mx-auto w-full px-4 sm:px-6", WIDTHS[width], className)}>{children}</div>
  );
}

/* ---------------------------------------------------------------- Label konteks */

/** Penanda konteks ringkas dalam sentence case — bukan label kapital dekoratif. */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  rule?: boolean;
}) {
  return (
    <p className={cx("text-caption font-medium text-signal-bright", className)}>{children}</p>
  );
}

/* ---------------------------------------------------------------- Permukaan */

export function Paper({
  tone = "plain",
  className,
  children,
}: {
  tone?: "plain" | "sunk" | "raised";
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        "rounded-lg border border-border",
        tone === "sunk" && "bg-canvas",
        tone === "raised" && "bg-surface-2",
        tone === "plain" && "bg-surface",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------- Catatan */

export function Callout({
  tone = "note",
  label,
  children,
  className,
}: {
  tone?: "note" | "warn" | "ok" | "error";
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    note: "border-border border-l-signal bg-signal-tint/70 text-ink",
    warn: "border-caution/30 border-l-caution bg-caution-tint/80 text-ink",
    ok: "border-ok/30 border-l-ok bg-ok-tint/80 text-ink",
    error: "border-fault/35 border-l-fault bg-fault-tint/85 text-ink",
  } as const;
  const labelTones = {
    note: "text-signal-bright",
    warn: "text-caution",
    ok: "text-ok",
    error: "text-fault",
  } as const;
  const labels = { note: "Catatan", warn: "Perhatian", ok: "Tepat", error: "Kesalahan" } as const;

  return (
    <div className={cx("rounded-md border border-l-[3px] px-4 py-3.5", tones[tone], className)}>
      <p className={cx("mb-1 text-micro font-semibold", labelTones[tone])}>
        {label ?? labels[tone]}
      </p>
      <div className="text-caption leading-relaxed text-ink-2">{children}</div>
    </div>
  );
}

/* ---------------------------------------------------------------- Tombol */

type BtnTone = "primary" | "signal" | "ghost" | "quiet" | "danger";

const BTN_TONES: Record<BtnTone, string> = {
  primary:
    "bg-ok text-ok-ink border-ok font-semibold hover:brightness-105 disabled:hover:brightness-100",
  signal:
    "bg-signal text-ok-ink border-signal font-semibold hover:brightness-105 disabled:hover:brightness-100",
  ghost:
    "bg-surface text-ink border-border-2 font-medium hover:border-signal hover:text-signal-bright hover:bg-signal-tint/50 disabled:hover:border-border-2 disabled:hover:bg-surface disabled:hover:text-ink",
  quiet:
    "bg-transparent text-ink-2 border-transparent font-medium hover:bg-surface-2 hover:text-ink",
  danger:
    "bg-fault-tint text-fault border-fault/50 font-medium hover:bg-fault hover:text-white",
};

const BTN_SIZES = {
  sm: "px-3.5 py-1.5 text-caption",
  md: "px-4 py-2 text-caption",
  lg: "px-6 py-3 text-body",
} as const;

export function Btn({
  tone = "primary",
  size = "md",
  className,
  ...rest
}: ComponentProps<"button"> & { tone?: BtnTone; size?: keyof typeof BTN_SIZES }) {
  return (
    <button
      className={cx(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-45",
        BTN_TONES[tone],
        BTN_SIZES[size],
        className,
      )}
      {...rest}
    />
  );
}

export function BtnLink({
  tone = "primary",
  size = "md",
  className,
  ...rest
}: ComponentProps<typeof Link> & { tone?: BtnTone; size?: keyof typeof BTN_SIZES }) {
  return (
    <Link
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-md border transition-colors",
        BTN_TONES[tone],
        BTN_SIZES[size],
        className,
      )}
      {...rest}
    />
  );
}

/* ---------------------------------------------------------------- Formulir */

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-caption font-medium text-ink-2">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-micro text-ink-3">{hint}</p>}
      {error && (
        <p className="text-micro text-fault" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const CONTROL =
  "w-full rounded-md border border-border-2 bg-canvas px-3.5 py-2.5 text-body text-ink placeholder:text-ink-4 " +
  "focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/25 disabled:bg-surface-2 disabled:text-ink-3";

export function Input({ className, ...rest }: ComponentProps<"input">) {
  return <input className={cx(CONTROL, className)} {...rest} />;
}

export function Textarea({ className, ...rest }: ComponentProps<"textarea">) {
  return <textarea className={cx(CONTROL, "min-h-24 resize-y", className)} {...rest} />;
}

export function Select({ className, ...rest }: ComponentProps<"select">) {
  return <select className={cx(CONTROL, "pr-8", className)} {...rest} />;
}

export function Toggle({
  checked,
  onChange,
  label,
  id,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  id: string;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={id} className="block text-body font-medium text-ink">
          {label}
        </label>
        {description && <p className="mt-0.5 text-caption text-ink-3">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx(
          "relative mt-0.5 h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors",
          checked ? "border-signal bg-signal" : "border-border-2 bg-surface-3",
        )}
      >
        <span
          aria-hidden="true"
          className={cx(
            "absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-all",
            checked ? "left-[22px] bg-ok-ink" : "left-[3px] bg-ink-3",
          )}
        />
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------- Badge & meter */

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: "neutral" | "blue" | "green" | "amber" | "red";
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    neutral: "border-border-2 text-ink-2 bg-surface-2",
    blue: "border-signal/35 text-signal-bright bg-signal-tint",
    green: "border-ok/35 text-ok bg-ok-tint",
    amber: "border-caution/35 text-caution bg-caution-tint",
    red: "border-fault/40 text-fault bg-fault-tint",
  } as const;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-xs border px-2.5 py-0.5 text-micro font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Indikator LED bersegmen — dipakai untuk progres kabel/tahap. */
export function Meter({
  value,
  total,
  label,
  className,
}: {
  value: number;
  total: number;
  label?: string;
  className?: string;
}) {
  const safe = Math.max(0, Math.min(value, total));
  return (
    <div className={cx("flex min-w-0 items-center gap-3", className)}>
      <div
        className="flex min-w-0 flex-1 gap-1"
        role="meter"
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={label ?? "Kemajuan"}
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={cx(
              "h-2.5 flex-1 max-w-6 min-w-2 rounded-[2px] border",
              i < safe ? "border-ok bg-ok" : "border-border-2 bg-surface-3",
            )}
          />
        ))}
      </div>
      <span className="shrink-0 font-mono text-caption text-ink-2">
        {safe}/{total}
      </span>
    </div>
  );
}

/** Bar persentase untuk progres 0–100. */
export function PercentBar({
  value,
  label,
  className,
}: {
  value: number;
  label?: string;
  className?: string;
}) {
  const safe = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cx("flex items-center gap-3", className)}>
      <div
        className="h-2.5 flex-1 overflow-hidden rounded-xs border border-border-2 bg-surface-3"
        role="progressbar"
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Kemajuan"}
      >
        <div className="h-full bg-signal transition-all" style={{ width: `${safe}%` }} />
      </div>
      <span className="font-mono text-caption text-ink-2">{safe}%</span>
    </div>
  );
}

/* ---------------------------------------------------------------- Gambar skema */

export function Figure({
  no,
  caption,
  source,
  children,
  className,
}: {
  no: string;
  caption: string;
  source?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure className={cx("m-0", className)}>
      <div className="overflow-hidden rounded-lg border border-border bg-surface p-3">{children}</div>
      <figcaption className="mt-2.5 text-caption text-ink-3">
        <span className="font-mono text-micro text-ink-2">Skema {no}.</span> {caption}
        {source && <span className="text-ink-4"> ({source})</span>}
      </figcaption>
    </figure>
  );
}

/* ---------------------------------------------------------------- Kepala halaman */

export function PageHeader({
  chapter,
  title,
  lead,
  meta,
  children,
  className,
}: {
  chapter?: string;
  title: string;
  lead?: string;
  meta?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cx("border-b border-border pb-6", className)}>
      {chapter && <p className="text-caption font-medium text-signal-bright">{chapter}</p>}
      <div className="mt-1.5 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-head leading-tight">{title}</h1>
        {meta && <div className="font-mono text-micro text-ink-2">{meta}</div>}
      </div>
      {lead && <p className="mt-2.5 max-w-2xl text-lead text-ink-2">{lead}</p>}
      {children}
    </header>
  );
}

/* ---------------------------------------------------------------- Misc */

export function StatusDot({
  tone = "grey",
  label,
}: {
  tone?: "grey" | "green" | "amber" | "red" | "blue";
  label?: string;
}) {
  const tones = {
    grey: "bg-ink-4",
    green: "bg-ok",
    amber: "bg-caution",
    red: "bg-fault",
    blue: "bg-signal",
  } as const;
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true" className={cx("inline-block h-2 w-2 rounded-full", tones[tone])} />
      {label && <span className="text-micro font-medium text-ink-2">{label}</span>}
    </span>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded-xs border border-border-2 bg-surface-2 px-1.5 py-0.5 font-mono text-micro text-ink">
      {children}
    </kbd>
  );
}

/** Baris log terminal monospace untuk ruang praktik dan sandbox. */
export function LogLine({
  time,
  children,
  tone = "default",
}: {
  time?: string;
  children: ReactNode;
  tone?: "default" | "ok" | "error";
}) {
  const tones = {
    default: "text-ink-2",
    ok: "text-ok",
    error: "text-fault",
  } as const;
  return (
    <p className="flex gap-3 font-mono text-micro leading-relaxed">
      {time && <span className="shrink-0 text-ink-4">{time}</span>}
      <span className={tones[tone]}>{children}</span>
    </p>
  );
}
