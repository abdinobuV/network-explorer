"use client";

import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { NextStepFooter } from "@/components/journey-stepper";
import { Container, PageHeader, Callout, BtnLink } from "@/components/ui";
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
    bus: "Memakai cabang (drop cable) dari backbone",
    ring: "Dua tautan per komputer (ke kedua tetangganya)",
    star: "Satu kabel langsung menuju switch",
  },
  {
    aspek: "Kalau satu kabel putus",
    bus: "Segmen di sisi putusnya kehilangan akses ke jaringan",
    ring: "Aliran berhenti total pada ring tunggal",
    star: "Hanya komputer tersebut yang terisolasi; komputer lain tetap aktif",
  },
  {
    aspek: "Biaya pemasangan",
    bus: "Rendah karena memakai sedikit kabel",
    ring: "Sedang dengan panjang kabel merata",
    star: "Lebih tinggi karena butuh switch dan kabel tiap komputer",
  },
  {
    aspek: "Kemudahan penambahan PC",
    bus: "Sulit karena harus menyentuh backbone",
    ring: "Sulit karena memutus dan menyambung ulang cincin",
    star: "Mudah; cukup colok ke port kosong pada switch",
  },
  {
    aspek: "Ketahanan gangguan",
    bus: "Rendah karena bergantung pada backbone",
    ring: "Rendah pada ring tunggal; tinggi bila memakai ring ganda",
    star: "Tinggi karena gangguan terisolasi per komputer",
  },
];

export default function PerbandinganPage() {
  return (
    <RequireAuth>
      <div className="bg-canvas">
        <Navbar />
        <main id="konten-utama">
          <Container width="page" className="py-10">
            <PageHeader
              chapter="Referensi analisis"
              title="Perbandingan tiga topologi"
              lead="Tujuh aspek utama yang dipakai saat memilih arsitektur jaringan."
            />

            <div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface">
              <div className="overflow-x-auto">
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
                          className="border-b border-border-3 bg-transparent font-semibold text-ink"
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
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {(["bus", "ring", "star"] as const).map((key) => (
                <div key={key} className="rounded-lg border border-border bg-surface p-5">
                  <div className="lab-grid rounded-md border border-border-3 p-2">
                    <TopoMini kind={key} />
                  </div>
                  <h2 className="mt-4 font-display text-title">{TOPOLOGI[key].title}</h2>
                  <p className="mt-1.5 text-caption text-ink-2">{TOPO_SPECS[key].summary}</p>
                  <BtnLink href={`/praktik/${key}`} tone="ghost" size="sm" className="mt-4">
                    Coba pasang <IconArrow size={13} />
                  </BtnLink>
                </div>
              ))}
            </div>

            <section className="mt-8 rounded-lg border border-border bg-surface p-6">
              <p className="text-caption font-medium text-signal-bright">Studi kasus</p>
              <h2 className="mt-1 font-display text-head">Laboratorium sekolah dengan 24 komputer</h2>
              <p className="mt-2.5 max-w-3xl text-caption leading-relaxed text-ink-2">
                Sekolah membangun laboratorium komputer berisi 24 PC. Syaratnya: jika satu komputer
                atau kabel bermasalah, komputer lain harus tetap bisa berkomunikasi; penambahan PC
                baru harus cepat; dan pengelolaan gangguan mudah dilakukan.
              </p>

              <div className="mt-5 overflow-hidden rounded-md border border-border bg-canvas">
                <div className="overflow-x-auto">
                  <table className="tech-table min-w-[40rem]">
                    <thead>
                      <tr>
                        <th scope="col">Kandidat</th>
                        <th scope="col">Pertimbangan</th>
                        <th scope="col">Keputusan</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="font-medium text-ink">Bus</td>
                        <td>
                          Kerusakan satu titik pada backbone memutus sebagian atau seluruh lab.
                          Penambahan komputer juga merepotkan.
                        </td>
                        <td className="font-mono text-fault">Tidak cocok</td>
                      </tr>
                      <tr>
                        <td className="font-medium text-ink">Ring</td>
                        <td>
                          Satu ruas kabel putus menghentikan aliran data di seluruh ruangan.
                        </td>
                        <td className="font-mono text-fault">Tidak cocok</td>
                      </tr>
                      <tr>
                        <td className="font-medium text-ink">Star</td>
                        <td>
                          Satu switch 24 port memenuhi seluruh kebutuhan. Kabel putus hanya
                          mengisolasi satu PC, dan penambahan PC cukup memakai port kosong.
                        </td>
                        <td className="font-mono text-ok">Disarankan</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-5">
                <Callout tone="ok" label="Kesimpulan">
                  Topologi <span className="font-medium text-ink">Star</span> paling sesuai untuk
                  laboratorium sekolah karena gangguan terisolasi, penambahan komputer mudah, dan
                  satu switch 24 port mencukupi seluruh ruangan.
                </Callout>
              </div>
            </section>

            <NextStepFooter
              prev={{ label: "Sandbox Star", href: "/sandbox/star" }}
              next={{
                label: "Lanjut ke Tahap 3: Kuis Akhir",
                href: "/kuis",
                description:
                  "Setelah membandingkan Bus, Ring, dan Star, uji pemahamanmu di 10 soal studi kasus.",
              }}
              hint="TAHAP 2 SELESAI → LANJUT KE TAHAP 3 (EVALUASI AKHIR)"
            />
          </Container>
        </main>
        <Footer help />
      </div>
    </RequireAuth>
  );
}
