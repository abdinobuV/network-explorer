"use client";

import Link from "next/link";
import { Navbar, Footer } from "@/components/chrome";
import RequireAuth from "@/components/require-auth";
import { Container, Eyebrow, PageHeader, Meter, Badge, StatusDot } from "@/components/ui";
import { TopoMini } from "@/components/topo";
import { TOPOLOGI } from "@/lib/data";
import { TOPO_SPECS } from "@/lib/topology-model";
import { useProg } from "@/lib/store";
import { XP, levelProgress, materiKey, praktikKey, simulasiKey } from "@/lib/progression";
import { IconArrow, IconCheck, IconShield } from "@/components/icons";

const URUT = ["bus", "ring", "star"] as const;

export default function MisiPage() {
  const { done, xp, quizBest } = useProg();
  const lv = levelProgress(xp);

  return (
    <RequireAuth>
      <div>
        <Navbar />
        <Container width="page" className="py-10">
          <PageHeader
            chapter="Daftar isi"
            title="Peta misi belajar"
            lead="Tiga bab materi, tiga lembar praktik, satu simulasi, satu kuis akhir. Kerjakan berurutan — tiap bab membuka lembar berikutnya."
            meta={
              <span className="inline-flex items-center gap-2">
                <StatusDot tone="blue" label={`Tingkat ${lv.level}`} />
                <span>{xp.toLocaleString("id-ID")} XP</span>
              </span>
            }
          />

          <div className="mt-8">
            <div className="overflow-x-auto border border-rule">
              <table className="tech-table min-w-[42rem]">
                <caption className="sr-only">Daftar bab dan status penyelesaian</caption>
                <thead>
                  <tr>
                    <th scope="col" className="w-12">
                      Bab
                    </th>
                    <th scope="col">Topologi</th>
                    <th scope="col">Aturan pemasangan</th>
                    <th scope="col" className="w-48">
                      Kemajuan
                    </th>
                    <th scope="col" className="w-28">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {URUT.map((key, i) => {
                    const t = TOPOLOGI[key];
                    const spec = TOPO_SPECS[key];
                    const keys = [materiKey(key), praktikKey(key), simulasiKey(key)];
                    const doneCount = keys.filter((k) => done[k]).length;
                    const lengkap = doneCount === keys.length;
                    return (
                      <tr key={key}>
                        <td className="font-mono text-ink-3">{String(i + 1).padStart(2, "0")}</td>
                        <td>
                          <Link
                            href={`/materi/${key}`}
                            className="font-medium text-ink underline-offset-4 hover:text-blueprint hover:underline"
                          >
                            {t.title}
                          </Link>
                          <p className="mt-0.5 text-caption text-ink-3">{spec.subtitle}</p>
                        </td>
                        <td className="max-w-sm text-caption">{spec.rule}</td>
                        <td>
                          <Meter
                            value={doneCount}
                            total={keys.length}
                            label={`Kemajuan ${t.title}`}
                          />
                        </td>
                        <td>
                          {lengkap ? (
                            <Badge tone="green">
                              <IconCheck size={12} /> Selesai
                            </Badge>
                          ) : doneCount > 0 ? (
                            <Badge tone="amber">Berjalan</Badge>
                          ) : (
                            <Badge tone="neutral">Belum</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {URUT.map((key, i) => (
              <Link
                key={key}
                href={`/materi/${key}`}
                className="group border border-rule bg-paper p-4 transition-colors hover:border-blueprint"
              >
                <div className="drafting-grid border border-rule p-2">
                  <TopoMini kind={key} />
                </div>
                <p className="mt-3 font-mono text-micro uppercase tracking-[0.14em] text-ink-4">
                  Bab {String(i + 1).padStart(2, "0")} · {TOPOLOGI[key].level.split("•")[1]?.trim()}
                </p>
                <h2 className="mt-1 font-serif text-title group-hover:text-blueprint">
                  {TOPOLOGI[key].title}
                </h2>
                <p className="mt-1.5 text-caption text-ink-2">{TOPOLOGI[key].desc}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-micro uppercase tracking-[0.12em] text-blueprint">
                  Buka bab <IconArrow size={13} />
                </span>
              </Link>
            ))}
          </div>

          <section className="mt-10 border border-rule bg-paper-2 p-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <Eyebrow>Evaluasi akhir</Eyebrow>
                <h2 className="mt-2 font-serif text-head">Kuis akhir</h2>
                <p className="mt-2 max-w-lg text-caption text-ink-2">
                  Sepuluh soal studi kasus, masing-masing dengan pembahasan. Nilai terbaik dicatat;
                  XP hanya bertambah bila nilaimu menjadi rekor baru.
                  {quizBest !== null && (
                    <>
                      {" "}
                      Rekormu saat ini:{" "}
                      <span className="font-mono">
                        {quizBest}/10
                      </span>
                      .
                    </>
                  )}
                </p>
              </div>
              <Link
                href="/kuis"
                className="inline-flex items-center gap-2 rounded-xs border border-ink bg-ink px-5 py-2.5 font-mono text-caption uppercase tracking-[0.12em] text-paper hover:bg-ink-2"
              >
                <IconShield size={15} /> Kerjakan kuis
              </Link>
            </div>
          </section>

          <section className="mt-8 border border-rule">
            <div className="border-b border-rule bg-paper-2 px-5 py-3">
              <Eyebrow>Penilaian</Eyebrow>
            </div>
            <table className="tech-table">
              <thead>
                <tr>
                  <th scope="col">Rentang nilai</th>
                  <th scope="col">Predikat</th>
                  <th scope="col">Tindak lanjut</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-mono">80–100</td>
                  <td>Baik sekali</td>
                  <td>Lanjutkan ke simulasi lanjutan dan coba menjelaskan ke teman.</td>
                </tr>
                <tr>
                  <td className="font-mono">60–79</td>
                  <td>Baik</td>
                  <td>Ulangi bab dengan nilai terendah, lalu kerjakan ulang kuis.</td>
                </tr>
                <tr>
                  <td className="font-mono">0–59</td>
                  <td>Perlu diulang</td>
                  <td>Baca ulang bab dan ulangi lembar praktik sebelum mengulang kuis.</td>
                </tr>
              </tbody>
            </table>
          </section>

          <p className="mt-6 font-mono text-micro text-ink-4">
            Total XP yang bisa diperoleh:{" "}
            {(XP.materi + XP.praktik + XP.simulasi) * 3 + XP.kuisPerJawaban * 10} XP
          </p>
        </Container>
        <Footer help />
      </div>
    </RequireAuth>
  );
}
