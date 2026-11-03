// kode-klaim.test.ts - uji kode klaim sekali pakai (Modul 28): bentuk XXXX-XXXX Crockford Base32, kode yang diketik manusia
// dirapikan dulu (huruf kecil, spasi, O/0, I/L/1), dan database hanya menerima sidik jarinya. Jalankan: npm test
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { buatKodeKlaim, hashKodeKlaim, rapikanKodeKlaim } from "./kode-klaim.ts";

describe("kode klaim", () => {
  it("bentuknya XXXX-XXXX dari 32 huruf Crockford (tanpa I, L, O, U), dan selalu berbeda", () => {
    const kode = Array.from({ length: 200 }, buatKodeKlaim);
    for (const k of kode) expect(k).toMatch(/^[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/);
    expect(new Set(kode).size).toBe(200);
  });

  it("kode yang diketik dirapikan: huruf kecil, spasi, tanpa tanda -, O dibaca 0, I dan L dibaca 1", () => {
    expect(rapikanKodeKlaim("7k2m-qf9d")).toBe("7K2MQF9D");
    expect(rapikanKodeKlaim(" 7K2M QF9D ")).toBe("7K2MQF9D");
    expect(rapikanKodeKlaim("O1IL-ABCD")).toBe("0111ABCD");
  });

  it("bentuk yang tetap salah = null (U bukan huruf Crockford, panjang salah)", () => {
    expect(rapikanKodeKlaim("UUUU-UUUU")).toBeNull();
    expect(rapikanKodeKlaim("7K2M-QF9")).toBeNull();
    expect(rapikanKodeKlaim("7K2M-QF9DX")).toBeNull();
  });

  it("sidik jari = SHA-256 bentuk rapinya: kode yang ditulis berbeda tetapi sama artinya punya sidik jari yang sama", () => {
    const rapi = rapikanKodeKlaim("7k2m-qf9d") ?? "";
    expect(hashKodeKlaim(rapi)).toBe(createHash("sha256").update("7K2MQF9D").digest("hex"));
    expect(hashKodeKlaim(rapikanKodeKlaim("7K2M QF9D") ?? "")).toBe(hashKodeKlaim(rapi));
  });
});
