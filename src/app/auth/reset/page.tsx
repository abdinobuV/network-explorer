"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Navbar, Footer } from "@/components/chrome";

export default function ResetPage() {
  const r = useRouter();
  const [msg, setMsg] = useState("");
  return (
    <div>
      <Navbar pub />
      <main className="mx-auto max-w-xl px-4 py-12">
        <div className="card p-8">
          <span className="chip">BUAT KATA SANDI BARU</span>
          <h1 className="mt-3 text-2xl font-extrabold">Reset Kata Sandi</h1>
          <form
            className="mt-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target as HTMLFormElement);
              const a = String(fd.get("a") || "");
              const b = String(fd.get("b") || "");
              if (a.length < 8) return setMsg("Minimal 8 karakter.");
              if (a !== b) return setMsg("Konfirmasi tidak sama.");
              try {
                const users = JSON.parse(localStorage.getItem("misi-users") || "[]");
                if (users[0]) {
                  users[0].pass = a;
                  localStorage.setItem("misi-users", JSON.stringify(users));
                }
              } catch {}
              r.push("/auth/login");
            }}
          >
            <div><label className="text-sm font-bold">Kata sandi baru</label><input name="a" type="password" className="input mt-1" required /></div>
            <div><label className="text-sm font-bold">Konfirmasi kata sandi</label><input name="b" type="password" className="input mt-1" required /></div>
            {msg && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{msg}</p>}
            <button className="btn-cyan w-full py-3">Simpan Kata Sandi Baru</button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
