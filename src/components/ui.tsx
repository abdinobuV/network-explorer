import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/* =============================================================================
   DESIGN KIT — "Buku Teknis"
   Semua komponen di sini adalah satu-satunya sumber gaya untuk aplikasi.
   Tidak ada lagi kelas .card/.btn-* yang dipakai langsung di halaman.
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

/* ---------------------------------------------------------------- Label kecil */

/** Label mono dengan garis pendahuluan — pengganti "eyebrow" cyan lama. */
export function Eyebrow({
  children,
  className,
  rule = true,
}: {
  children: ReactNode;
  className?: string;
  rule?: boolean;
}) {
  return (
    <p
      className={cx(
        "flex items-center gap-2 font-mono text-micro uppercase tracking-[0.14em] text-ink-3",
        className,
      )}
    >
      {rule && <span aria-hidden="true" className="h-px w-6 bg-rule-2" />}
      {children}
    </p>
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
        "border border-rule",
        tone === "sunk" && "bg-paper-3",
        tone === "raised" && "bg-paper-2",
        tone === "plain" && "bg-paper",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------- Catatan */

/** Kotak catatan dengan garis kiri berwarna + label mono. */
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
    note: "border-l-blueprint bg-blueprint-3 text-ink",
    warn: "border-l-amber bg-amber-2 text-ink",
    ok: "border-l-green bg-green-2 text-ink",
    error: "border-l-redpen bg-redpen-2 text-ink",
  } as const;
  const labels = { note: "Catatan", warn: "Peringatan", ok: "Tepat", error: "Kesalahan" } as const;

  return (
    <div className={cx("border border-rule border-l-[3px] px-4 py-3", tones[tone], className)}>
      <p className="mb-1 font-mono text-micro uppercase tracking-[0.14em] text-ink-3">
        {label ?? labels[tone]}
      </p>
      <div className="text-caption leading-relaxed text-ink-2">{children}</div>
    </div>
  );
}

/* ---------------------------------------------------------------- Tombol */

type BtnTone = "primary" | "ghost" | "quiet" | "danger";

const BTN_TONES: Record<BtnTone, string> = {
  primary:
    "bg-ink text-paper border-ink hover:bg-ink-2 disabled:hover:bg-ink",
  ghost:
    "bg-transparent text-ink border-rule-2 hover:border-ink hover:bg-paper-2 disabled:hover:border-rule-2 disabled:hover:bg-transparent",
  quiet: "bg-transparent text-ink-2 border-transparent hover:bg-paper-2 hover:text-ink",
  danger: "bg-transparent text-redpen border-redpen/50 hover:bg-redpen hover:text-paper",
};

const BTN_SIZES = {
  sm: "px-3 py-1.5 text-caption",
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
        "inline-flex items-center justify-center gap-2 rounded-xs border font-medium transition-colors",
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
        "inline-flex items-center justify-center gap-2 rounded-xs border font-medium transition-colors",
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
      <label htmlFor={htmlFor} className="font-mono text-micro uppercase tracking-[0.12em] text-ink-3">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-caption text-ink-3">{hint}</p>}
      {error && (
        <p className="text-caption text-redpen" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const CONTROL =
  "w-full rounded-xs border border-rule-2 bg-paper px-3 py-2 text-body text-ink placeholder:text-ink-4 " +
  "focus:border-blueprint focus:outline-none focus:ring-2 focus:ring-blueprint/25 disabled:bg-paper-3";

export function Input({ className, ...rest }: ComponentProps<"input">) {
  return <input className={cx(CONTROL, className)} {...rest} />;
}

export function Textarea({ className, ...rest }: ComponentProps<"textarea">) {
  return <textarea className={cx(CONTROL, "min-h-24 resize-y", className)} {...rest} />;
}
export function Select({ className, ...rest }: ComponentProps<"select">) {
  return <select className={cx(CONTROL, "appearance-none pr-8", className)} {...rest} />;
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
        <label htmlFor={id} className="block text-caption font-medium text-ink">
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
          "relative mt-0.5 h-5 w-9 shrink-0 rounded-full border transition-colors",
          checked ? "border-blueprint bg-blueprint" : "border-rule-2 bg-paper-3",
        )}
      >
        <span
          aria-hidden="true"
          className={cx(
            "absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full transition-all",
            checked ? "left-[18px] bg-paper" : "left-[3px] bg-ink-4",
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
    neutral: "border-rule-2 text-ink-2 bg-paper-2",
    blue: "border-blueprint/40 text-blueprint bg-blueprint-3",
    green: "border-green/40 text-green bg-green-2",
    amber: "border-amber/40 text-amber bg-amber-2",
    red: "border-redpen/40 text-redpen bg-redpen-2",
  } as const;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-xs border px-2 py-0.5 font-mono text-micro uppercase tracking-[0.1em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Meter bersegmen — untuk "3/4 tersambung". */
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
    <div className={cx("flex items-center gap-3", className)}>
      <div
        className="flex gap-1"
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
              "h-2.5 w-6 border",
              i < safe ? "border-blueprint bg-blueprint" : "border-rule-2 bg-paper-3",
            )}
          />
        ))}
      </div>
      <span className="font-mono text-caption text-ink-2">
        {safe}/{total}
      </span>
    </div>
  );
}

/** Bar persentase — untuk angka 0–100 (bukan jumlah butir). */
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
        className="h-2.5 flex-1 border border-rule-2 bg-paper-3"
        role="progressbar"
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Kemajuan"}
      >
        <div className="h-full bg-blueprint" style={{ width: `${safe}%` }} />
      </div>
      <span className="font-mono text-caption text-ink-2">{safe}%</span>
    </div>
  );
}

/* ---------------------------------------------------------------- Gambar teknik */

/** Pembungkus gambar: nomor gambar + caption + sumber. */
export function Figure({
  no,
  caption,
  source,
  children,
  className,
}: {
  /** Nomor gambar, mis. "1.1". */
  no: string;
  caption: string;
  source?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure className={cx("m-0", className)}>
      <div className="border border-rule bg-paper-3 p-3">{children}</div>
      <figcaption className="mt-2 font-mono text-micro text-ink-3">
        <span className="text-ink-2">Gambar {no}.</span> {caption}
        {source && <span className="text-ink-4"> — {source}</span>}
      </figcaption>
    </figure>
  );
}

/* ---------------------------------------------------------------- Kepala halaman */

/** Kepala halaman ala bab buku: nomor bab, judul, ringkasan, meta. */
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
    <header className={cx("border-b border-rule pb-6", className)}>
      {chapter && <Eyebrow>{chapter}</Eyebrow>}
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-head leading-tight">{title}</h1>
        {meta && <div className="font-mono text-micro text-ink-3">{meta}</div>}
      </div>
      {lead && <p className="mt-3 max-w-2xl text-lead text-ink-2">{lead}</p>}
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
    green: "bg-green",
    amber: "bg-amber",
    red: "bg-redpen",
    blue: "bg-blueprint",
  } as const;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true" className={cx("inline-block h-2 w-2 rounded-full", tones[tone])} />
      {label && <span className="font-mono text-micro uppercase tracking-[0.1em] text-ink-3">{label}</span>}
    </span>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded-xs border border-rule-2 bg-paper-2 px-1.5 py-0.5 font-mono text-micro text-ink-2">
      {children}
    </kbd>
  );
}

/** Baris log monospace (dipakai di ruang praktik & sandbox). */
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
    default: "text-ink-3",
    ok: "text-green",
    error: "text-redpen",
  } as const;
  return (
    <p className="flex gap-3 font-mono text-micro leading-relaxed">
      {time && <span className="shrink-0 text-ink-4">{time}</span>}
      <span className={tones[tone]}>{children}</span>
    </p>
  );
}
