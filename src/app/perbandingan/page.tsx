"use client";

import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { Container, Eyebrow, PageHeader, Callout, BtnLink } from "@/components/ui";
import { TopoMini } from "@/components/topo";
import { TOPOLOGI } from "@/lib/data";
import { TOPO_SPECS } from "@/lib/topology-model";
import { IconArrow } from "@/components/icons";

const ASPEK = [
  {
    aspek: "Bentuk dasar",
    bus: "Satu kabel utama (backbone) dengan cabang ke tiap komputer",
    ring: "Lingkaran tertutup; tiap komputer tersambung ke dua tetangganya",
    star: "Bintang; semua komputer tersambung ke satu switch pusat",
  },
  {
    aspek: "Jalur data",
    bus: "Berbagi satu media; setiap komputer memeriksa alamat tujuan",
    ring: "Satu arah saja, searah jarum jam",
    star: "Switch meneruskan frame hanya ke port tujuan",
  },
  {
    aspek: "Kabel per komputer",
    bus: "Tidak selalu satu; memakai cabang dari backbone",
    ring: "Dua per komputer (ke kedua tetangganya)",
    star: "Satu per komputer menuju switch",
  },
  {
    aspek: "Kalau satu kabel putus",
    bus: "Segmen di sisi putusnya kehilangan akses ke seluruh jaringan",
    ring: "Aliran berhenti total pada ring tunggal",
    star: "Hanya komputer tersebut yang terisolasi; komputer lain tetap terhubung",
  },
  {
    aspek: "Biaya pemasangan",
    bus: "Murah; sedikit kabel",
    ring: "Sedang; banyak kabel",
    star: "Mahal; satu switch dan satu kabel per komputer",
  },
  {
    aspek: "Kemudahan upgrade",
    bus: "Sulit; menambah komputer berarti menyentuh backbone",
    ring: "Sulit; penambahan mengganggu alur ring",
    star: "Mudah; cukup satu port kosong pada switch",
  },
  {
    aspek: "Ketahanan gangguan",
    bus: "Rendah — titik pusat pada backbone",
    ring: "Rendah pada ring tunggal; tinggi bila memakai ring ganda",
    star: "Tinggi — gangguan terisolasi per komputer",
  },
];

export default function PerbandinganPage() {
  return (
    <RequireAuth>
      <div>
        <Navbar />
        <Container width="page" className="py-10">
          <PageHeader
            chapter="Tabel referensi"
            title="Perbandingan tiga topologi"
            lead="Tujuh aspek yang paling sering dipakai saat memilih topologi jaringan."
          />

          <div className="mt-6 overflow-x-auto border border-rule">
            <table className="tech-table min-w-[54rem]">
              <caption className="sr-only">Perbandingan topologi Bus, Ring, dan Star</caption>
              <thead>
                <tr>
                  <th scope="col" className="w-48">
                    Aspek
                  </th>
                  <th scope="col">Bus</th>
                  <th scope="col">Ring</th>
                  <th scope="col">Star</th>
                </tr>
              </thead>
              <tbody>
                {ASPEK.map((a) => (
                  <tr key={a.aspek}>
                    <th
                      scope="row"
                      className="border-b border-rule-3 bg-transparent font-medium text-ink"
                    >
                      {a.aspek}
                    </th>
                    <td>{a.bus}</td>
                    <td>{a.ring}</td>
                    <td>{a.star}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {(["bus", "ring", "star"] as const).map((key) => (
              <div key={key} className="border border-rule bg-paper p-4">
                <div className="drafting-grid border border-rule p-2">
                  <TopoMini kind={key} />
                </div>
                <h2 className="mt-3 font-serif text-title">{TOPOLOGI[key].title}</h2>
                <p className="mt-1 text-caption text-ink-2">{TOPO_SPECS[key].summary}</p>
                <BtnLink href={`/praktik/${key}`} tone="ghost" size="sm" className="mt-3">
                  Coba pasang <IconArrow size={13} />
                </BtnLink>
              </div>
            ))}
          </div>

          <section className="mt-8 border border-rule bg-paper-2 p-6">
            <Eyebrow>Studi kasus</Eyebrow>
            <h2 className="mt-2 font-serif text-head">Laboratorium sekolah dengan 24 komputer</h2>
            <p className="mt-3 max-w-3xl text-caption leading-relaxed text-ink-2">
              Sekolah sedang membangun laboratorium komputer dengan 24 PC. Syarat dari sekolah:
              bila satu komputer atau satu kabel bermasalah, komputer lain di lab tetap dapat
              saling berkomunikasi; penambahan PC baru harus cepat; dan biaya perangkat pusat
              sebaiknya tidak membebani anggaran.
            </p>

            <div className="mt-5 overflow-x-auto border border-rule bg-paper">
              <table className="tech-table min-w-[40rem]">
                <thead>
                  <tr>
                    <th scope="col">Kandidat</th>
                    <th scope="col">Penilaian</th>
                    <th scope="col">Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-medium text-ink">Bus</td>
                    <td>
                      Kerusakan satu bagian backbone dapat menjatuhkan separuh lab. Penambahan PC
                      juga merepotkan.
                    </td>
                    <td className="font-mono text-redpen">Tidak</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-ink">Ring</td>
                    <td>
                      Satu ruas yang putus menghentikan seluruh aliran data pada lab. Tidak
                      memenuhi syarat resilience.
                    </td>
                    <td className="font-mono text-redpen">Tidak</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-ink">Star</td>
                    <td>
                      Satu switch 24 port menutupi seluruh kebutuhan. Kabel PC yang putus hanya
                      mengisolasi satu PC. Penambahan PC cukup pakai port kosong.
                    </td>
                    <td className="font-mono text-green">Disarankan</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-5">
              <Callout tone="ok" label="Kesimpulan">
                Topologi <span className="font-medium">Star</span> paling sesuai untuk laboratorium
                sekolah: gangguan terisolasi, penambahan komputer mudah, dan satu switch 24 port
                sudah cukup untuk seluruh lab.
              </Callout>
            </div>
          </section>
        </Container>
        <Footer help />
      </div>
    </RequireAuth>
  );
}
