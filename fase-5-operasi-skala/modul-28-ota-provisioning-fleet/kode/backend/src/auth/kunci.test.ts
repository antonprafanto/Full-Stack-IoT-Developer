// kunci.test.ts - unit test kunci perangkat (Modul 21): bentuk kunci, sidik jari SHA-256, dan pencocokan waktu-konstan.
// Tanpa database dan tanpa broker. Jalankan: npm test
import { describe, expect, it } from "vitest";
import { Kunci, buatKunci, cocokkanKunci, hashKunci } from "./kunci.ts";

describe("kunci perangkat", () => {
  it("43 huruf base64url, lolos skema Kunci, dan tidak pernah sama", () => {
    const a = buatKunci();
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(Kunci.safeParse(a).success).toBe(true);
    const banyak = new Set(Array.from({ length: 1000 }, () => buatKunci()));
    expect(banyak.size).toBe(1000);
  });
  it("skema Kunci menolak kunci yang terpotong atau berisi huruf lain", () => {
    expect(Kunci.safeParse("a".repeat(42)).success).toBe(false);
    expect(Kunci.safeParse("a".repeat(42) + "=").success).toBe(false); // base64 biasa, bukan base64url
    expect(Kunci.safeParse(" " + "a".repeat(42)).success).toBe(false); // spasi ikut tertempel
  });
  it("sidik jari = SHA-256 heksadesimal 64 huruf, selalu sama untuk kunci yang sama", () => {
    expect(hashKunci("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    const k = buatKunci();
    expect(hashKunci(k)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashKunci(k)).toBe(hashKunci(k));
    expect(hashKunci(k)).not.toContain(k);
  });
  it("cocokkanKunci: kunci benar cocok, kunci lain tidak, perangkat tanpa kunci (dicabut) tidak pernah cocok", () => {
    const k = buatKunci();
    const sidik = hashKunci(k);
    expect(cocokkanKunci(k, sidik)).toBe(true);
    expect(cocokkanKunci(buatKunci(), sidik)).toBe(false);
    expect(cocokkanKunci(k.slice(0, 42) + (k.endsWith("A") ? "B" : "A"), sidik)).toBe(false); // beda satu huruf terakhir
    expect(cocokkanKunci(k, null)).toBe(false);
  });
});
