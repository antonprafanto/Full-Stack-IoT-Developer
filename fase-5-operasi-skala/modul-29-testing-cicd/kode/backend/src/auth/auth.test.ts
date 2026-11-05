// auth.test.ts - unit test logika login (Modul 20): aturan sandi, sidik jari bcrypt, refresh token, dan token lama.
// Tanpa database dan tanpa server. Jalankan: npm test
import { describe, expect, it } from "vitest";
import { Sandi, buatSidikJari, cocokkanSandi } from "./sandi.ts";
import { TOLERANSI_MS, buatTokenSesi, hashToken, nilaiTokenLama } from "./token.ts";

describe("aturan sandi (Sandi)", () => {
  it("14 karakter ditolak, 15 karakter diterima", () => {
    expect(Sandi.safeParse("a".repeat(14)).success).toBe(false);
    expect(Sandi.safeParse("a b c d e f g h").success).toBe(true); // tepat 15 karakter: spasi ikut dihitung
  });
  it("lebih dari 72 byte ditolak: bcrypt diam-diam memotongnya", () => {
    expect(Sandi.safeParse("a".repeat(72)).success).toBe(true);
    expect(Sandi.safeParse("a".repeat(73)).success).toBe(false);
    expect(Sandi.safeParse("😀".repeat(19)).success).toBe(false); // 19 emoji = 38 karakter JavaScript, tetapi 76 byte
  });
});

// bcrypt sengaja lambat (sekitar 0,3 detik per hitungan di laptop i5, bisa >1 detik di laptop sibuk atau lambat), jadi batas
// waktu tes ini dinaikkan dari bawaan Vitest 5 detik menjadi 30 detik.
const LAMBAT = 30_000;

describe("sidik jari sandi (bcrypt)", () => {
  it("sandi benar cocok, sandi salah tidak, dan sidik jari selalu berbeda (garam acak)", async () => {
    const satu = await buatSidikJari("sandi khusus untuk tes ini");
    const dua = await buatSidikJari("sandi khusus untuk tes ini");
    expect(satu).toMatch(/^\$2b\$12\$.{53}$/);
    expect(satu).not.toBe(dua);
    expect(await cocokkanSandi("sandi khusus untuk tes ini", satu)).toBe(true);
    expect(await cocokkanSandi("sandi khusus untuk tes itu", satu)).toBe(false);
  }, LAMBAT);
  it("akun tidak ada (sidik jari kosong): hasilnya false, bukan galat", async () => {
    expect(await cocokkanSandi("apa saja", undefined)).toBe(false);
    expect(await cocokkanSandi("apa saja", null)).toBe(false);
  }, LAMBAT);
});

describe("refresh token", () => {
  it("43 karakter base64url, tidak pernah sama", () => {
    const a = buatTokenSesi();
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(buatTokenSesi()).not.toBe(a);
  });
  it("hash SHA-256 selalu sama untuk token yang sama (bisa dicari di database)", () => {
    expect(hashToken("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(hashToken("abd")).not.toBe(hashToken("abc"));
  });
  it("token lama dipakai lagi: dalam 30 detik = toleransi, sesudahnya = curian", () => {
    const diganti = new Date("2026-10-22T06:00:00+07:00");
    expect(nilaiTokenLama(diganti, diganti.getTime() + 5_000)).toBe("toleransi");
    expect(nilaiTokenLama(diganti, diganti.getTime() + TOLERANSI_MS)).toBe("curian");
    expect(nilaiTokenLama(diganti, diganti.getTime() + 60 * 60_000)).toBe("curian");
  });
});
