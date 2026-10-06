import Link from "next/link";
import { Navbar, Footer } from "@/components/chrome";

export default function KonfirmasiPage() {
  return (
    <div>
      <Navbar pub />
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="card p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#00e676]/15 text-3xl">✉️</div>
          <h1 className="mt-4 text-2xl font-extrabold">Instruksi reset terkirim!</h1>
          <p className="mt-2 text-sm text-slate-400">Periksa kotak masuk (dan folder spam) emailmu, klik tautan reset di dalamnya untuk membuat kata sandi baru, lalu masuk kembali.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/auth/login" className="btn-cyan px-6 py-2.5 text-sm">Kembali ke Login →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
