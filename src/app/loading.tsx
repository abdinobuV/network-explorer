export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="text-center">
        <p className="font-mono text-caption uppercase tracking-[0.16em] text-ink-3">Memuat…</p>
        <div className="mx-auto mt-3 flex gap-1" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="h-1.5 w-6 bg-rule-2 pulse-line"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
