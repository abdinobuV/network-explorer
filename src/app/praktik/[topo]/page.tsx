"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { DndContext, DragEndEvent, useDraggable, useDroppable, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { useProg } from "@/lib/store";

const PCS = ["PC-01", "PC-02", "PC-03", "PC-04"];

function Cable({ id, used }: { id: string; used: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, disabled: used });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined}
      className={`cursor-grab rounded-lg border px-3 py-2.5 text-sm font-semibold ${
        used ? "border-white/10 bg-white/5 text-slate-500 line-through" : "border-[#00c2e0] bg-[#0a1428] text-[#22d3ee]"
      } ${isDragging ? "z-50 opacity-80 shadow-xl" : ""}`}
    >
      🔌 {id} {used ? "✓" : ""}
    </div>
  );
}

function Slot({ pc, connected }: { pc: string; connected: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${pc}` });
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col items-center gap-1 rounded-xl border-2 border-dashed p-3 transition ${
        connected ? "border-[#00e676] bg-[#00e676]/10" : isOver ? "border-[#22d3ee] bg-[#22d3ee]/10" : "border-white/20 bg-[#0a1428]"
      }`}
    >
      <span className="text-3xl">{connected ? "🖥️" : "🖥️"}</span>
      <span className="text-xs">{pc} ({connected ? "Online" : "Offline"})</span>
      <span className="text-[11px] text-slate-400">{connected ? "● Terhubung" : "Tarik kabel ke sini"}</span>
    </div>
  );
}

export default function Praktik() {
  const p = useParams();
  const topo = String(p?.topo || "star");
  const r = useRouter();
  const { markDone } = useProg();
  const [links, setLinks] = useState<Record<string, boolean>>({});
  const [tool, setTool] = useState("Kabel RJ-45");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const doneCount = PCS.filter((pc) => links[pc]).length;
  const complete = doneCount === 4;

  const onEnd = (e: DragEndEvent) => {
    const cable = String(e.active.id);
    const over = String(e.over?.id || "");
    if (!over.startsWith("slot-")) return;
    const pc = over.replace("slot-", "");
    if (cable === `Kabel ${pc}`) setLinks((l) => ({ ...l, [pc]: true }));
  };

  // reset saat ganti alat bukan kabel
  return (
    <RequireAuth>
    <div>
      <Navbar />
      <div className="bg-[#00c2e0] px-4 py-2.5 text-center text-sm font-bold text-[#06121f]">
        ⓘ MISI 3: Tarik kabel dari PC ke Switch pusat untuk melengkapi pola Topologi Star!
      </div>
      <main className="mx-auto grid max-w-7xl gap-0 px-0 md:grid-cols-[240px_1fr]">
        <aside className="border-r border-white/10 bg-[#0c1d3a] p-4">
          <h3 className="font-bold">Palet Perangkat</h3>
          <div className="mt-3 space-y-2">
            {["Computer PC", "Network Switch", "Kabel RJ-45"].map((t) => (
              <button
                key={t}
                onClick={() => setTool(t)}
                className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm ${tool === t ? "border-[#00c2e0] text-[#22d3ee]" : "border-white/10 bg-white/5 text-slate-300"}`}
              >
                {t === "Computer PC" ? "🖥️" : t === "Network Switch" ? "🔀" : "🔌"} {t}
              </button>
            ))}
          </div>
          {tool === "Kabel RJ-45" && (
            <DndContext sensors={sensors} onDragEnd={onEnd}>
              <div className="mt-3 space-y-2">
                {PCS.map((pc) => (
                  <Cable key={pc} id={`Kabel ${pc}`} used={!!links[pc]} />
                ))}
              </div>
              <div className="mt-6">
                <div className="text-xs uppercase text-slate-400">Drop zone = tiap kartu PC →</div>
                <div className="mt-2 grid grid-cols-2 gap-2 md:hidden">
                  {PCS.map((pc) => <Slot key={pc} pc={pc} connected={!!links[pc]} />)}
                </div>
              </div>
            </DndContext>
          )}
          <div className="mt-6 border-t border-white/10 pt-4 text-xs text-slate-400">
            <div className="font-bold text-slate-300">TIPS BELAJAR</div>
            <p className="mt-1">RJ-45 digunakan untuk jaringan area lokal (LAN). Tarik ujung kabel dari port Ethernet PC dan sambungkan ke Port Switch.</p>
            <p className="mt-2">Progres: {doneCount}/4 tersambung {topo !== "star" ? `(mode ${topo})` : ""}</p>
            {!complete && <p className="mt-1 text-[#22d3ee]">Pilih “Kabel RJ-45”, lalu drag tiap kabel ke kartu PC yang cocok.</p>}
          </div>
        </aside>

        <section className="p-6">
          <DndContext sensors={sensors} onDragEnd={onEnd}>
            <div className="card relative mx-auto max-w-2xl p-8">
              <div className="grid grid-cols-2 gap-8">
                {PCS.map((pc) => <Slot key={pc} pc={pc} connected={!!links[pc]} />)}
              </div>
              <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className={`grid h-20 w-20 place-items-center rounded-full border-2 font-bold ${complete ? "border-[#00e676] bg-[#00e676]/15 text-[#00e676]" : "border-[#00e676] bg-[#0a1428] text-[#00e676]"}`}>
                  <div className="text-center text-[10px]">🔀<br />SWITCH</div>
                </div>
              </div>
              <svg className="pointer-events-none absolute inset-0 h-full w-full">
                {PCS.map((pc, i) => {
                  const pos = [[25, 25], [75, 25], [25, 75], [75, 75]][i];
                  return (
                    <line
                      key={pc}
                      x1="50%" y1="50%" x2={`${pos[0]}%`} y2={`${pos[1]}%`}
                      stroke={links[pc] ? "#00e676" : "#475569"}
                      strokeWidth={links[pc] ? 3 : 2}
                      strokeDasharray={links[pc] ? "0" : "5 5"}
                    />
                  );
                })}
              </svg>
            </div>
          </DndContext>
          <div className="mt-6 text-center">
            {complete ? (
              <p className="mb-3 text-sm text-[#00e676]">✓ Semua kabel tersambung! Jaringan Star selesai.</p>
            ) : (
              <p className="mb-3 text-sm text-slate-400">Seret 4 kabel RJ-45 ke tiap PC ({doneCount}/4). Bisa juga klik-kartu sebagai fallback:</p>
            )}
            {!complete && (
              <div className="mb-3 flex justify-center gap-2">
                {PCS.filter((pc) => !links[pc]).map((pc) => (
                  <button key={pc} onClick={() => setLinks((l) => ({ ...l, [pc]: true }))} className="btn-ghost px-3 py-1 text-xs">
                    Sambung {pc}
                  </button>
                ))}
              </div>
            )}
            <button
              disabled={!complete}
              onClick={() => {
                markDone(`praktik-${topo}`, 100);
                r.push("/sandbox");
              }}
              className="btn-neon px-8 py-3"
            >
              ▷ Simulasikan Jaringan
            </button>
            <div className="mt-3"><Link href={`/materi/${topo}`} className="text-xs text-slate-400 hover:underline">← Kembali ke materi</Link></div>
          </div>
        </section>
      </main>
      <Footer help />
    </div>
    </RequireAuth>
  );
}
