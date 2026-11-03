// kontrak.test.ts - uji skema kontrak data 1.6 (Modul 28): vitals baru dan lama sama-sama sah, aturan "datang bersama",
// bentuk cmd update, jeda, dan ukuran pesan terpanjang terhadap wadah MQTT perangkat (512 byte, setBufferSize Node 1).
// Jalankan: npm test
import { describe, expect, it } from "vitest";
import { CmdUpdate, Jeda, Vitals } from "./kontrak.ts";

const LAMA = { ts: "2026-10-31T01:00:00Z", rssi: -61, uptime_s: 86400, heap_free: 183200 }; // vitals firmware 1.6.0

describe("vitals kontrak 1.6", () => {
  it("bentuk lama (firmware sampai 1.6.0) tetap sah; bentuk 1.7.0 dengan reset_reason, fw, dan ota juga sah", () => {
    expect(Vitals.safeParse(LAMA).success).toBe(true);
    expect(Vitals.safeParse({ ...LAMA, reset_reason: "POWERON", fw: "1.7.0" }).success).toBe(true);
    expect(Vitals.safeParse({ ...LAMA, reset_reason: "SW", fw: "1.7.1",
      ota: { id: "c-20261031-010000-1", hasil: "rollback", versi: "1.7.2", pesan: "tidak tersambung ke broker dalam 60 detik" } })
      .success).toBe(true);
  });

  it("reset_reason dan fw selalu bersama; ota hanya bersama fw; alasan di luar tujuh nilai ditolak", () => {
    expect(Vitals.safeParse({ ...LAMA, reset_reason: "SW" }).success).toBe(false);
    expect(Vitals.safeParse({ ...LAMA, fw: "1.7.0" }).success).toBe(false);
    expect(Vitals.safeParse({ ...LAMA, ota: { id: "c-1", hasil: "berhasil", versi: "1.7.1" } }).success).toBe(false);
    expect(Vitals.safeParse({ ...LAMA, reset_reason: "EXT", fw: "1.7.0" }).success).toBe(false);
  });

  it("laporan ota: hasil hanya berhasil/rollback/gagal, pesan paling panjang 80 huruf", () => {
    const dasar = { ...LAMA, reset_reason: "SW", fw: "1.7.1" };
    expect(Vitals.safeParse({ ...dasar, ota: { id: "c-1", hasil: "kembali", versi: "1.7.2" } }).success).toBe(false);
    expect(Vitals.safeParse({ ...dasar, ota: { id: "c-1", hasil: "gagal", versi: "1.7.2", pesan: "x".repeat(81) } }).success)
      .toBe(false);
  });
});

describe("cmd update dan config kontrak 1.6", () => {
  const SAH = { id: "c-20261031-010000-2", ts: "2026-10-31T01:00:00Z", aksi: "update", versi: "1.7.1",
    url: "https://iot.namaanda.my.id/fw/node-1/1.7.1.bin", sha256: "0".repeat(64), ukuran: 1196032 };

  it("bentuk sah; url harus menunjuk berkas versi yang sama; sha256 huruf kecil; ukuran paling besar satu rak", () => {
    expect(CmdUpdate.safeParse(SAH).success).toBe(true);
    expect(CmdUpdate.safeParse({ ...SAH, url: "https://iot.namaanda.my.id/fw/node-1/1.7.0.bin" }).success).toBe(false);
    expect(CmdUpdate.safeParse({ ...SAH, url: "https://iot.namaanda.my.id/firmware.bin" }).success).toBe(false);
    expect(CmdUpdate.safeParse({ ...SAH, sha256: "A".repeat(64) }).success).toBe(false);
    expect(CmdUpdate.safeParse({ ...SAH, ukuran: 1966081 }).success).toBe(false);
  });

  it("jeda hanya vitals_s 60-3600 detik (telemetry tetap 10 detik: kunci lain ditolak)", () => {
    expect(Jeda.safeParse({ vitals_s: 60 }).success).toBe(true);
    expect(Jeda.safeParse({ vitals_s: 59 }).success).toBe(false);
    expect(Jeda.safeParse({ vitals_s: 300, telemetry_s: 30 }).success).toBe(false);
  });

  it("pesan terpanjang yang sah muat di wadah MQTT perangkat 512 byte (kepala MQTT + topik + isi)", () => {
    const topik = (jenis: string) => `rpm/a4cf12e5b7c0/${jenis}`;
    const paket = (jenis: string, isi: object) => 5 + 2 + topik(jenis).length + Buffer.byteLength(JSON.stringify(isi));
    const update = { ...SAH, id: "c-".padEnd(39, "9"), versi: "999.999.999",
      url: `https://${"a".repeat(200 - "https:///fw/node-1/999.999.999.bin".length)}/fw/node-1/999.999.999.bin` };
    expect(CmdUpdate.safeParse(update).success).toBe(true);
    expect(update.url.length).toBe(200);
    const vitals = { ts: "2026-10-31T01:00:00Z", rssi: -100, uptime_s: 2147483647, heap_free: 4294967295, offline_s: 2147483647,
      kipas_lokal: 65535, reset_reason: "BROWNOUT", fw: "999.999.999",
      ota: { id: "c-".padEnd(39, "9"), hasil: "berhasil", versi: "999.999.999", pesan: "x".repeat(80) } };
    expect(Vitals.safeParse(vitals).success).toBe(true);
    // angka persisnya dicatat di KODE-LAPORAN: paket update dan vitals terpanjang
    expect(paket("cmd", update)).toBeLessThanOrEqual(512);
    expect(paket("vitals", vitals)).toBeLessThanOrEqual(512);
  });
});
