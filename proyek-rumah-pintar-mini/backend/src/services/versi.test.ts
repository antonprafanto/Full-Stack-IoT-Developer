// versi.test.ts - uji bandingkanVersi() (Modul 28): nomor versi dibandingkan per bagian sebagai ANGKA, bukan sebagai teks.
// Jalankan: npm test
import { describe, expect, it } from "vitest";
import { POLA_VERSI_RILIS, bandingkanVersi, versiTertinggi } from "./versi.ts";

describe("bandingkanVersi", () => {
  it("MAJOR, lalu MINOR, lalu PATCH; hasil -1, 0, atau 1", () => {
    expect(bandingkanVersi("1.7.1", "1.7.0")).toBe(1);
    expect(bandingkanVersi("1.7.0", "1.7.1")).toBe(-1);
    expect(bandingkanVersi("1.7.1", "1.7.1")).toBe(0);
    expect(bandingkanVersi("2.0.0", "1.99.99")).toBe(1);
    expect(bandingkanVersi("1.6.0", "1.7.0")).toBe(-1);
  });

  it("1.10.0 LEBIH BARU daripada 1.9.0 (perbandingan teks biasa salah di sini)", () => {
    // oxlint-disable-next-line no-constant-binary-expression -- sengaja: dua teks tetap untuk menunjukkan perbandingan teks salah
    expect("1.10.0" < "1.9.0").toBe(true); // teks: "1" < "9", jadi salah
    expect(bandingkanVersi("1.10.0", "1.9.0")).toBe(1);
    expect(bandingkanVersi("1.7.10", "1.7.9")).toBe(1);
  });

  it("bentuk yang salah dilempar sebagai galat, bukan diam-diam dianggap sama", () => {
    expect(() => bandingkanVersi("v1.7.1", "1.7.0")).toThrow("x.y.z");
    expect(() => bandingkanVersi("1.7", "1.7.0")).toThrow("x.y.z");
    expect(() => bandingkanVersi("1.7.2-uji", "1.7.0")).toThrow("x.y.z");
  });

  it("versi RILIS: tanpa nol di depan, paling banyak 5 angka per bagian (1.07.1 = 1.7.1 sebagai angka, beda sebagai teks)", () => {
    for (const v of ["0.0.0", "1.7.1", "1.10.0", "10.0.99999"]) expect(POLA_VERSI_RILIS.test(v)).toBe(true);
    for (const v of ["1.07.1", "01.7.1", "1.7.01", "1.7", "1.7.1-uji", "v1.7.1", "1.7.123456"]) expect(POLA_VERSI_RILIS.test(v)).toBe(false);
    expect(bandingkanVersi("1.07.1", "1.7.1")).toBe(0); // inilah sebabnya rilis berawalan nol ditolak
  });

  it("versiTertinggi: rilis terbaru dari sebuah daftar, null kalau kosong", () => {
    expect(versiTertinggi(["1.7.0", "1.10.0", "1.9.3"])).toBe("1.10.0");
    expect(versiTertinggi([])).toBeNull();
  });
});
