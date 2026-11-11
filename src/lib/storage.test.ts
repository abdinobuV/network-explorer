import { beforeEach, describe, expect, it } from "vitest";
import {
  readItem,
  removeItem,
  resetStorageCache,
  subscribeItem,
  writeItem,
} from "@/lib/storage";

describe("penyimpanan lokal", () => {
  beforeEach(() => {
    localStorage.clear();
    resetStorageCache();
  });

  it("mengembalikan nilai fallback bila kunci tidak ada", () => {
    expect(readItem("tidak-ada", { a: 1 })).toEqual({ a: 1 });
  });

  it("menulis dan membaca balik nilai", () => {
    writeItem("kunci", { nama: "Siswa" });
    expect(readItem("kunci", null)).toEqual({ nama: "Siswa" });
  });

  it("menyimpan snapshot yang sama antar pembacaan", () => {
    const nilai = { xp: 100 };
    writeItem("kunci", nilai);
    expect(readItem("kunci", null)).toBe(readItem("kunci", null));
  });

  it("tidak melempar error saat JSON rusak", () => {
    localStorage.setItem("rusak", "{ bukan json");
    expect(readItem("rusak", "cadangan")).toBe("cadangan");
  });

  it("memberitahu pendengar saat nilai berubah", () => {
    let dipanggil = 0;
    const unsubscribe = subscribeItem("kunci", () => {
      dipanggil += 1;
    });
    writeItem("kunci", 1);
    expect(dipanggil).toBe(1);
    unsubscribe();
    writeItem("kunci", 2);
    expect(dipanggil).toBe(1);
  });

  it("menghapus nilai dan memberi tahu pendengar", () => {
    writeItem("kunci", 1);
    let dipanggil = 0;
    subscribeItem("kunci", () => {
      dipanggil += 1;
    });
    removeItem("kunci");
    expect(readItem("kunci", "kosong")).toBe("kosong");
    expect(dipanggil).toBe(1);
  });
});
