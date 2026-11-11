import { beforeEach, describe, expect, it } from "vitest";
import { hashPassword } from "@/lib/auth-session";
import { resetStorageCache } from "@/lib/storage";

describe("hash kata sandi (mode demo)", () => {
  beforeEach(() => {
    localStorage.clear();
    resetStorageCache();
  });

  it("menghasilkan sidik digital yang konsisten", async () => {
    const a = await hashPassword("password123");
    const b = await hashPassword("password123");
    expect(a).toBe(b);
    expect(a).not.toBe("password123");
  });

  it("menghasilkan sidik digital berbeda untuk sandi berbeda", async () => {
    const a = await hashPassword("password123");
    const b = await hashPassword("password124");
    expect(a).not.toBe(b);
  });

  it("tidak menyimpan teks polos kata sandi", async () => {
    const hash = await hashPassword("rahasia-123");
    expect(hash).not.toContain("rahasia-123");
    expect(hash.length).toBeGreaterThan(16);
  });
});
