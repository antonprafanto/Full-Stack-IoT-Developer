// perintah.test.ts - uji rekonsiliasi perintah (Modul 19) dengan batas umur perintah tangan (Modul 27): perintah dashboard
// yang tidak dijawab perangkat dikirim lagi bila perangkat terdengar dalam 2 menit, tetapi TIDAK dikirim lagi sesudah internet
// rumah putus lama (kiriman susulan tiba belakangan). Tanpa broker, database, atau perangkat: gudang, mqtt, arsip, kejadian,
// log, dan daftar diganti tiruan (vi.mock), jam diganti jam tiruan (vi.useFakeTimers). Jalankan: npm test
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Keadaan } from "../schemas/kontrak.ts";

// satu Node 1 tiruan yang terlihat "online" (seperti di VPS saat internet rumah putus: status retained tetap online)
const tiruan = vi.hoisted(() => ({
  perangkat: { jenis: "node1", status: "online", reported: null as Keadaan | null, reported_ts: null as string | null },
  kiriman: [] as { target: string; nilai: unknown }[],
  catatan: [] as string[],
}));
vi.mock("./gudang.ts", () => ({
  cariPerangkat: () => tiruan.perangkat,
  simpanLaporan: (_id: string, keadaan: Keadaan) => { tiruan.perangkat.reported = keadaan; return true; },
  tungguAck: async () => null, // perangkat tidak pernah menjawab: internet rumah putus
}));
vi.mock("./mqtt.ts", () => ({
  brokerTersambung: () => true,
  buatIdPerintah: () => "c-20261029-090000-1",
  kirimPerintah: (_id: string, _idPerintah: string, perintah: { target: string; nilai: unknown }) => {
    tiruan.kiriman.push(perintah);
  },
}));
vi.mock("../db/arsip.ts", () => ({ arsipkanPerintah: async () => {} }));
vi.mock("./kejadian.ts", () => ({ catatKejadian: () => {} }));
vi.mock("./log.ts", () => ({
  log: { info: (p: string) => tiruan.catatan.push(p), warn: (p: string) => tiruan.catatan.push(p), error: () => {} },
}));
vi.mock("./daftar.ts", () => ({ izinPerangkat: () => "terdaftar" }));

import { catatLaporan, perangkatMenyalaUlang, perintahkan } from "./perintah.ts";

const MATI: Keadaan = { kipas: false, lampu: false, pompa: false, tirai: 0 };
// keinginan server disimpan per device_id di dalam perintah.ts: setiap tes memakai device_id sendiri
const ID = ["a4cf12e5b7c1", "a4cf12e5b7c2", "a4cf12e5b7c3", "a4cf12e5b7c4"];
const menit = (n: number) => vi.advanceTimersByTime(n * 60_000);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-29T09:00:00Z"));
  tiruan.perangkat.reported = { ...MATI };
  tiruan.kiriman.length = 0;
  tiruan.catatan.length = 0;
});
afterEach(() => vi.useRealTimers());

describe("perintah tangan tanpa ack (Modul 27)", () => {
  it("perangkat terdengar lagi dalam 2 menit: perintah lampu dikirim lagi (rekonsiliasi Modul 19 tetap jalan)", async () => {
    expect((await perintahkan(ID[0], { target: "lampu", nilai: true }, "api")).status).toBe("tanpa-ack");
    menit(1); // 60 detik kemudian telemetry tiba, lampu masih mati
    catatLaporan(ID[0], MATI, "2026-10-29T09:01:00Z");
    expect(tiruan.kiriman).toEqual([{ target: "lampu", nilai: true }, { target: "lampu", nilai: true }]);
  });

  it("internet rumah putus 10 menit: susulan tiba, perintah lampu yang sudah dilaporkan gagal TIDAK dikirim lagi", async () => {
    expect((await perintahkan(ID[1], { target: "lampu", nilai: true }, "api")).status).toBe("tanpa-ack");
    menit(10);
    catatLaporan(ID[1], MATI, "2026-10-29T09:00:30Z"); // kiriman susulan (ts lama) ...
    catatLaporan(ID[1], MATI, "2026-10-29T09:10:00Z"); // ... lalu kiriman baru
    expect(tiruan.kiriman).toEqual([{ target: "lampu", nilai: true }]); // hanya kiriman pertama
    expect(tiruan.catatan).toContain(
      `perintah lampu = true (api) ke ${ID[1]} tidak dikerjakan lebih dari 2 menit: tidak dikirim lagi`);
  });

  it("perintah dari Telegram diperlakukan sama; keinginan aturan otomatis tetap dicoba lagi sesudah 10 menit", async () => {
    await perintahkan(ID[2], { target: "lampu", nilai: true }, "telegram");
    await perintahkan(ID[2], { target: "kipas", nilai: true }, "aturan", 3);
    menit(10);
    catatLaporan(ID[2], MATI, "2026-10-29T09:10:00Z");
    expect(tiruan.kiriman).toEqual([
      { target: "lampu", nilai: true }, { target: "kipas", nilai: true }, { target: "kipas", nilai: true }]);
  });

  it("perintah yang PERNAH dikerjakan tetap dipulihkan sesudah perangkat menyala ulang, berapa pun umurnya", async () => {
    await perintahkan(ID[3], { target: "lampu", nilai: true }, "api");
    catatLaporan(ID[3], { ...MATI, lampu: true }, "2026-10-29T09:00:05Z"); // lampu menyala: keinginan terpenuhi
    menit(30);
    perangkatMenyalaUlang(ID[3], 12); // listrik Node 1 sempat padam: relay mati semua
    catatLaporan(ID[3], MATI, "2026-10-29T09:30:00Z");
    expect(tiruan.kiriman).toEqual([{ target: "lampu", nilai: true }, { target: "lampu", nilai: true }]);
  });
});
