import Link from "next/link";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { TopoMini } from "@/components/topo";

const ROWS: [string, string, string, string][] = [
  ["Struktur", "Semua node berbagi satu kabel utama (backbone).", "Node membentuk jalur cincin tertutup.", "Setiap node punya kabel ke perangkat pusat."],
  ["Aliran data", "Sinyal menyebar di backbone; semua node menerima sinyal.", "Data melewati node berurutan; ring klasik memakai token.", "Switch belajar alamat MAC; unicast yang dikenal diteruskan ke port tujuan."],
  ["Kabel & perangkat", "Kabel koaksial bersama, konektor, dan terminator di kedua ujung.", "Kabel antar-node dan antarmuka ring; tidak perlu terminator bus.", "Kabel UTP per node dan switch dengan jumlah port yang cukup."],
  ["Kelebihan", "Hemat kabel untuk jaringan kecil dan sederhana.", "Akses teratur dengan token; tabrakan data dapat dihindari.", "Mudah diperluas; kerusakan kabel satu PC dapat diisolasi."],
  ["Kekurangan", "Media bersama rentan collision; pelacakan gangguan sulit.", "Penambahan node dan pemulihan gangguan lebih rumit.", "Lebih banyak kabel dan biaya switch; bergantung perangkat pusat."],
  ["Dampak gangguan", "Backbone putus atau terminator bermasalah dapat melumpuhkan segmen.", "Putus pada ring tunggal bisa menghentikan aliran; ring ganda dapat punya jalur cadangan.", "Kabel satu PC putus: PC itu terisolasi. Switch pusat gagal: semua PC di switch terputus."],
  ["Konteks penggunaan", "Ethernet koaksial lama; cocok sebagai contoh media bersama.", "Jaringan token ring lama; ring redundan juga dipakai pada jaringan khusus.", "LAN modern: laboratorium, kantor, dan jaringan lokal sekolah."],
];

export default function Perbandingan() {
  return (
    <RequireAuth>
    <div>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-xs font-bold text-[#00c2e0]">REFERENSI • BUS / RING / STAR</div>
        <h1 className="text-3xl font-extrabold">Pola berbeda, kebutuhan berbeda.</h1>
        <p className="text-slate-400">Bandingkan cara kerja dan titik lemah setiap topologi sebelum memilih jaringan yang tepat.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {(
            [
              ["Bus", "Satu jalur bersama", "bus"],
              ["Ring", "Jalur melingkar", "ring"],
              ["Star", "Koneksi ke pusat", "star"],
            ] as const
          ).map(([t, s, k]) => (
            <div key={k} className="card flex items-center gap-4 p-5">
              <div><div className="text-xl font-extrabold">{t}</div><div className="text-xs text-slate-400">{s}</div></div>
              <div className="flex-1"><TopoMini kind={k} /></div>
            </div>
          ))}
        </div>
        <div className="card mt-5 overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-sm">
            <thead><tr className="bg-[#00c2e0]/10 text-left text-[#22d3ee]"><th className="p-3">Aspek</th><th className="p-3">Bus</th><th className="p-3">Ring</th><th className="p-3">Star</th></tr></thead>
            <tbody>
              {ROWS.map(([a, b, c, d]) => (
                <tr key={a} className="border-t border-white/10 align-top text-slate-300">
                  <td className="p-3 font-bold text-white">{a}</td><td className="p-3">{b}</td><td className="p-3">{c}</td><td className="p-3">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-400">ⓘ Bentuk Star saja tidak menjamin bebas collision. Ethernet dengan switch dan koneksi full-duplex tidak mengalami collision pada link tersebut; Star berbasis hub masih berbagi collision domain.</p>
        <div className="card mt-4 grid gap-4 border-[#00c2e0]/50 p-6 md:grid-cols-[1fr_1.5fr_auto] md:items-center">
          <div><span className="chip">CONTOH PEMILIHAN</span><div className="mt-2 text-lg font-extrabold">Laboratorium sekolah: 24 PC</div>
            <p className="text-xs text-slate-400">Perlu mudah diperluas dan tetap berjalan saat kabel satu PC rusak.</p></div>
          <div><div className="font-extrabold text-[#00e676]">Pilih Star dengan switch</div>
            <p className="text-sm text-slate-300">Sediakan port untuk 24 PC serta uplink dan cadangan, kabel UTP per PC, dan daya yang stabil. Switch pusat tetap menjadi titik kegagalan: rencanakan perangkat pengganti.</p></div>
          <Link href="/misi" className="btn-ghost px-5 py-2 text-sm">Kembali ke Materi</Link>
        </div>
      </main>
      <Footer help />
    </div>
    </RequireAuth>
  );
}
