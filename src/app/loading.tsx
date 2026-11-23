export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center bg-canvas">
      <div className="text-center">
        <p className="text-caption text-ink-3">Memuat…</p>
        <div className="mx-auto mt-3 flex gap-1.5" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="h-1.5 w-6 rounded-xs bg-signal pulse-line"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
