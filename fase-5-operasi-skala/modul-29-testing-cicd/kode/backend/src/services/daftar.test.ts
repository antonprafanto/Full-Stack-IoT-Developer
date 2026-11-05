// daftar.test.ts - unit test buku tamu perangkat (Modul 21): siapa yang terdaftar dan siapa yang sudah dicabut, dan log
// "DIABAIKAN" lapis kedua yang tidak membanjir. Tanpa database dan tanpa broker. Jalankan: npm test
import { describe, expect, it } from "vitest";
import { JEDA_LOG_MS, catatDicabut, catatTerdaftar, isiDaftar, izinPerangkat, kalimatAbaikan, nilaiIzin } from "./daftar.ts";

describe("buku tamu perangkat", () => {
  it("keputusan murni: belum dimuat, belum terdaftar, terdaftar, dicabut", () => {
    expect(nilaiIzin(false, { dicabut: false })).toBe("belum-dimuat"); // database belum terbaca: jangan percaya siapa pun
    expect(nilaiIzin(true, undefined)).toBe("belum-terdaftar");
    expect(nilaiIzin(true, { dicabut: false })).toBe("terdaftar");
    expect(nilaiIzin(true, { dicabut: true })).toBe("dicabut");
  });
  it("daftar dari database: baris lama tanpa tanggal terdaftar tetap dianggap belum terdaftar", () => {
    const sekarang = new Date();
    const jumlah = isiDaftar([
      { device_id: "a4cf12e5b7c0", terdaftar: sekarang, dicabut: null },
      { device_id: "f00d00000001", terdaftar: null, dicabut: null }, // dibuat otomatis Modul 17-20
      { device_id: "c0ba00000001", terdaftar: sekarang, dicabut: sekarang },
    ]);
    expect(jumlah).toBe(2);
    expect(izinPerangkat("a4cf12e5b7c0")).toBe("terdaftar");
    expect(izinPerangkat("f00d00000001")).toBe("belum-terdaftar");
    expect(izinPerangkat("c0ba00000001")).toBe("dicabut");
    catatDicabut("a4cf12e5b7c0"); // POST /devices/:id/cabut
    expect(izinPerangkat("a4cf12e5b7c0")).toBe("dicabut");
    catatTerdaftar("a4cf12e5b7c0"); // POST /devices/:id/kunci menghidupkan lagi
    expect(izinPerangkat("a4cf12e5b7c0")).toBe("terdaftar");
  });
});

describe("log DIABAIKAN (lapis kedua)", () => {
  it("pesan pertama dicatat, pesan berikutnya dalam semenit tidak, lalu dicatat lagi dengan jumlah yang terlewat", () => {
    const t0 = Date.parse("2026-10-23T08:00:00+08:00");
    const topik = "rpm/c0ba00000002/telemetry";
    expect(kalimatAbaikan(topik, "c0ba00000002", "dicabut", t0))
      .toBe("DIABAIKAN rpm/c0ba00000002/telemetry: c0ba00000002 kuncinya sudah dicabut");
    expect(kalimatAbaikan(topik, "c0ba00000002", "dicabut", t0 + 10_000)).toBeNull();
    expect(kalimatAbaikan(topik, "c0ba00000002", "dicabut", t0 + 20_000)).toBeNull();
    expect(kalimatAbaikan(topik, "c0ba00000002", "dicabut", t0 + JEDA_LOG_MS))
      .toBe("DIABAIKAN rpm/c0ba00000002/telemetry: c0ba00000002 kuncinya sudah dicabut (+2 pesan lain sejak catatan terakhir)");
  });
  it("jeda dihitung per perangkat", () => {
    const t0 = Date.parse("2026-10-23T09:00:00+08:00");
    expect(kalimatAbaikan("rpm/f00d00000009/status", "f00d00000009", "belum-terdaftar", t0)).toContain("belum terdaftar");
    expect(kalimatAbaikan("rpm/f00d00000010/status", "f00d00000010", "belum-terdaftar", t0)).not.toBeNull();
  });
});
