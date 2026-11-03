// ota.test.ts - uji aturan pembaruan firmware Modul 28 (D14) TANPA database dan broker: tabel firmware/pembaruan diganti
// tiruan di memori (vi.mock "../db/armada.ts"), penerbit MQTT tiruan menjawab ack seperti simulator alat/. Gudang memori
// (gudang.ts: status, tungguAck) tetap yang asli. Yang diuji: syarat kirim (online, bukan Node 2, tidak dicabut, satu
// pembaruan berjalan, versi berbeda, turun versi butuh paksa, rilis uji hanya satu perangkat), ack = DITERIMA bukan
// selesai, canary dulu baru semua, laporan vitals.ota menutup barisnya, dan penyimpulan bila laporan hilang. Jalankan: npm test
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://tiruan:tiruan@127.0.0.1:1/tiruan";
  process.env.JWT_SECRET = "rahasia-uji-yang-cukup-panjang-untuk-zod-0123456789";
  process.env.ALAMAT_SERVER = "https://iot.namaanda.my.id";
});

const db = vi.hoisted(() => ({
  rilis: new Map<string, { jenis: "node1"; versi: string; ukuran: number; sha256: string; uji: boolean; ditarik: Date | null }>(),
  perangkat: new Map<string, { device_id: string; jenis: string; terdaftar: Date | null; dicabut: Date | null; status: string;
    fw: string | null; canary: boolean }>(),
  pembaruan: [] as { id: string; device_id: string; dari_versi: string | null; ke_versi: string; canary: boolean; status: string;
    pesan: string | null; dibuat: Date; diperbarui: Date }[],
}));
const berjalan = (id: string) => db.pembaruan.some((p) => p.device_id === id && ["dikirim", "diterima", "mengunduh"].includes(p.status));
const calon = (id: string) => { const p = db.perangkat.get(id); return p && { ...p, berjalan: berjalan(id) }; };
vi.mock("../db/armada.ts", () => ({
  ambilRilis: async (_j: string, v: string) => db.rilis.get(v),
  calonSatu: async (id: string) => calon(id),
  calonPembaruan: async () => [...db.perangkat.keys()].map(calon),
  mulaiPembaruan: async (p: { id: string; deviceId: string; dari: string | null; ke: string; canary: boolean }) => {
    if (berjalan(p.deviceId)) return false; // indeks unik pembaruan_satu_berjalan
    db.pembaruan.push({ id: p.id, device_id: p.deviceId, dari_versi: p.dari, ke_versi: p.ke, canary: p.canary, status: "dikirim",
      pesan: null, dibuat: new Date(), diperbarui: new Date() });
    return true;
  },
  ubahStatusPembaruan: async (id: string, _d: string, status: string, pesan: string | null, dari: string[]) => {
    const b = db.pembaruan.find((p) => p.id === id && dari.includes(p.status));
    if (b) Object.assign(b, { status, pesan: pesan ?? b.pesan, diperbarui: new Date() });
    return b;
  },
  laporHasilPembaruan: async (id: string, _d: string, status: string, pesan: string | null) => {
    const b = db.pembaruan.find((p) => p.id === id && ["dikirim", "diterima", "mengunduh", "kedaluwarsa"].includes(p.status));
    if (b) Object.assign(b, { status, pesan, diperbarui: new Date() });
    return b;
  },
  simpulkanPembaruan: async (id: string, fw: string, uptime: number) => db.pembaruan
    .filter((p) => p.device_id === id && ["dikirim", "diterima", "mengunduh"].includes(p.status)
      && (Date.now() - p.dibuat.getTime()) / 1000 > uptime)
    .map((p) => Object.assign(p, { status: p.ke_versi === fw ? "berhasil" : "gagal", pesan: "disimpulkan server: ..." })),
  ringkasanCanary: async (_j: string, v: string) => ({
    berhasil: db.pembaruan.filter((p) => p.canary && p.ke_versi === v && p.status === "berhasil").length,
    gagal: db.pembaruan.filter((p) => p.canary && p.ke_versi === v && ["rollback", "gagal"].includes(p.status)).length,
  }),
  pembaruanDikenal: async (id: string, d: string) => db.pembaruan.some((p) => p.id === id && p.device_id === d),
  tandaiMengunduh: async () => undefined,
  kedaluwarsakanPembaruan: async () => [],
  catatFwDb: async () => {},
  catatResetReasonDb: async () => {},
}));

// perangkat tiruan: menjawab update dengan ack (ok:true, atau ok:false dengan alasan) persis seperti simulator alat/
const perangkat = vi.hoisted(() => ({ jawab: "ok" as "ok" | "diam" | string, terbit: [] as Record<string, unknown>[] }));
vi.mock("./mqtt.ts", () => ({
  brokerTersambung: () => true,
  buatIdPerintah: (() => { let n = 0; return () => `c-20261031-010000-${++n}`; })(),
  kirimUpdate: (deviceId: string, id: string, isi: Record<string, unknown>) => {
    perangkat.terbit.push({ deviceId, id, ...isi });
    if (perangkat.jawab === "diam") return;
    setTimeout(() => void import("./gudang.ts").then((g) => g.serahkanAck({ id, ts: null, ok: perangkat.jawab === "ok",
      ...(perangkat.jawab === "ok" ? {} : { pesan: perangkat.jawab }), state: { kipas: false, lampu: false, pompa: false, tirai: 90 } })), 2);
  },
}));
const kejadian = vi.hoisted(() => [] as { jenis: string; pesan: string }[]);
vi.mock("./kejadian.ts", () => ({ catatKejadian: (k: { jenis: string; pesan: string }) => { kejadian.push(k); } }));
vi.mock("./realtime.ts", () => ({ siarkanOta: () => {} }));

import { alasanTidakBisa, catatVitalsPembaruan, mintaUpdate, perbaruiArmada } from "./ota.ts";
import { simpanStatus } from "./gudang.ts";
// Catatan: ota.ts mengingat versi terakhir setiap perangkat di memori (lebih segar daripada database), dan ingatan itu
// bertahan antar-tes di berkas ini. Karena itu setiap tes memakai device_id-nya sendiri.

const RILIS = (versi: string, uji = false) => ({ jenis: "node1" as const, versi, ukuran: 1196032, sha256: "0".repeat(64), uji,
  ditarik: null });
function node1(id: string, fw: string | null, canary = false, status = "online") {
  db.perangkat.set(id, { device_id: id, jenis: "node1", terdaftar: new Date(), dicabut: null, status, fw, canary });
  simpanStatus(id, status as "online");
}
const tunggu = () => new Promise((r) => setTimeout(r, 20));

beforeEach(() => {
  db.rilis.clear();
  db.perangkat.clear();
  db.pembaruan.length = 0;
  kejadian.length = 0;
  perangkat.jawab = "ok";
  perangkat.terbit.length = 0;
  for (const v of ["1.7.0", "1.7.1"]) db.rilis.set(v, RILIS(v));
  db.rilis.set("1.7.2", RILIS("1.7.2", true));
});

describe("alasanTidakBisa: syarat kirim (D14), fungsi murni", () => {
  const SIAP = { jenis: "node1", terdaftar: true, dicabut: false, status: "online", fw: "1.7.0", berjalan: false };
  const r = (versi: string, uji = false) => ({ versi, uji, ditarik: null });
  it("perangkat online, versi berbeda: boleh (null)", () => {
    expect(alasanTidakBisa(SIAP, r("1.7.1"))).toBeNull();
  });
  it("tidak online (juga offline-mode), Node 2, dicabut, sedang berjalan, versi sama: 409 dengan alasannya", () => {
    expect(alasanTidakBisa({ ...SIAP, status: "offline" }, r("1.7.1"))?.pesan).toContain("tidak diantre");
    expect(alasanTidakBisa({ ...SIAP, status: "offline-mode" }, r("1.7.1"))?.kode).toBe(409);
    expect(alasanTidakBisa({ ...SIAP, jenis: "node2" }, r("1.7.1"))?.pesan).toContain("perbarui lewat kabel");
    expect(alasanTidakBisa({ ...SIAP, dicabut: true }, r("1.7.1"))?.pesan).toContain("dinonaktifkan");
    expect(alasanTidakBisa({ ...SIAP, berjalan: true }, r("1.7.1"))?.pesan).toContain("pembaruan lain");
    expect(alasanTidakBisa(SIAP, r("1.7.0"))?.pesan).toBe("perangkat sudah memakai 1.7.0");
  });
  it("turun versi butuh paksa; rilis uji ditolak untuk banyak perangkat; rilis ditarik dan belum diunggah", () => {
    expect(alasanTidakBisa({ ...SIAP, fw: "1.7.1" }, r("1.7.0"))?.pesan).toContain("turun versi");
    expect(alasanTidakBisa({ ...SIAP, fw: "1.7.1" }, r("1.7.0"), { paksa: true })).toBeNull();
    expect(alasanTidakBisa(SIAP, r("1.7.2", true))).toBeNull(); // satu perangkat: boleh
    expect(alasanTidakBisa(SIAP, r("1.7.2", true), { banyak: true })?.pesan).toContain("rilis UJI");
    expect(alasanTidakBisa(SIAP, { versi: "1.7.1", uji: false, ditarik: new Date() })?.pesan).toContain("ditarik");
    expect(alasanTidakBisa(SIAP, undefined)?.kode).toBe(404);
    expect(alasanTidakBisa({ ...SIAP, terdaftar: false }, r("1.7.1"))?.kode).toBe(404);
  });
});

describe("mintaUpdate: satu perangkat", () => {
  it("ack ok:true = DITERIMA (bukan selesai); url = ALAMAT_SERVER/fw/node-1/<versi>.bin, sha256 + ukuran dari rilis", async () => {
    node1("f00d00000001", "1.7.0");
    const hasil = await mintaUpdate("f00d00000001", "1.7.1", "1");
    expect(hasil).toMatchObject({ status: "diterima", dari: "1.7.0", ke: "1.7.1" });
    expect(perangkat.terbit[0]).toMatchObject({ url: "https://iot.namaanda.my.id/fw/node-1/1.7.1.bin", sha256: "0".repeat(64),
      ukuran: 1196032, versi: "1.7.1" });
    expect(db.pembaruan[0]).toMatchObject({ status: "diterima", dari_versi: "1.7.0", ke_versi: "1.7.1" });
  });

  it("perangkat menolak (masa uji): status ditolak beserta alasannya", async () => {
    node1("f00d00000001", "1.7.0");
    perangkat.jawab = "masih dalam masa uji 60 detik";
    expect(await mintaUpdate("f00d00000001", "1.7.1", "1")).toMatchObject({ status: "ditolak", pesan: "masih dalam masa uji 60 detik" });
    expect(db.pembaruan[0]).toMatchObject({ status: "ditolak", pesan: "masih dalam masa uji 60 detik" });
  });

  it("perintah kedua saat yang pertama masih berjalan: 409 (satu pembaruan per perangkat)", async () => {
    node1("f00d00000001", "1.7.0");
    perangkat.jawab = "diam"; // tanpa ack: baris tetap "dikirim"
    expect((await mintaUpdate("f00d00000001", "1.7.1", "1")).status).toBe("tanpa-ack");
    expect(await mintaUpdate("f00d00000001", "1.7.1", "1")).toMatchObject({ status: "tidak-dikirim", kode: 409 });
  }, 10_000);

  it("perangkat offline: tidak dikirim, tidak diantre", async () => {
    node1("f00d00000001", "1.7.0", false, "offline");
    expect(await mintaUpdate("f00d00000001", "1.7.1", "1")).toMatchObject({ status: "tidak-dikirim", kode: 409 });
    expect(perangkat.terbit).toHaveLength(0);
  });
});

describe("perbaruiArmada: canary dulu, baru semua", () => {
  it("semua DITOLAK sebelum ada canary yang berhasil; sesudah canary berhasil, semua yang memenuhi syarat dikirim sekaligus", async () => {
    node1("f00d00000001", "1.7.0", true);
    node1("f00d00000002", "1.7.0");
    node1("f00d00000003", "1.7.0", false, "offline");
    expect(await perbaruiArmada("1.7.1", "semua", "1")).toMatchObject({ kode: 409 });
    const canary = await perbaruiArmada("1.7.1", "canary", "1");
    expect(canary).toMatchObject({ dikirim: [{ device_id: "f00d00000001", status: "diterima" }], dilewati: [] });
    // perangkat canary melaporkan berhasil di vitals berikutnya
    catatVitalsPembaruan("f00d00000001", { ts: "2026-10-31T01:01:00Z", rssi: -60, uptime_s: 8, heap_free: 180000,
      reset_reason: "SW", fw: "1.7.1", ota: { id: db.pembaruan[0].id, hasil: "berhasil", versi: "1.7.1" } });
    await tunggu();
    db.perangkat.get("f00d00000001")!.fw = "1.7.1";
    const semua = await perbaruiArmada("1.7.1", "semua", "1");
    expect(semua).toMatchObject({ dikirim: [{ device_id: "f00d00000002", status: "diterima" }] });
    expect("dilewati" in semua && semua.dilewati.map((d) => d.device_id)).toEqual(["f00d00000001", "f00d00000003"]);
  });

  it("canary yang ROLLBACK mengunci tombol semua; rilis uji tidak pernah untuk banyak perangkat", async () => {
    node1("f00d00000011", "1.7.0", true);
    await perbaruiArmada("1.7.1", "canary", "1");
    catatVitalsPembaruan("f00d00000011", { ts: "2026-10-31T01:02:10Z", rssi: -60, uptime_s: 6, heap_free: 180000,
      reset_reason: "SW", fw: "1.7.0", ota: { id: db.pembaruan[0].id, hasil: "rollback", versi: "1.7.1" } });
    await tunggu();
    expect(db.pembaruan[0].status).toBe("rollback");
    expect(await perbaruiArmada("1.7.1", "semua", "1")).toMatchObject({ kode: 409, pesan: expect.stringContaining("rollback") });
    expect(await perbaruiArmada("1.7.2", "canary", "1")).toMatchObject({ kode: 409, pesan: expect.stringContaining("rilis UJI") });
  });
});

describe("hasil dari vitals perangkat", () => {
  it("laporan hilang: vitals sesudah menyala ulang dengan versi baru = berhasil (disimpulkan), dengan versi lama = gagal", async () => {
    node1("f00d00000021", "1.7.0");
    node1("f00d00000022", "1.7.0");
    await mintaUpdate("f00d00000021", "1.7.1", "1");
    await mintaUpdate("f00d00000022", "1.7.1", "1");
    for (const p of db.pembaruan) p.dibuat = new Date(Date.now() - 90_000); // perintah dikirim 90 detik lalu
    catatVitalsPembaruan("f00d00000021", { ts: "2026-10-31T01:02:00Z", rssi: -60, uptime_s: 20, heap_free: 1, reset_reason: "SW", fw: "1.7.1" });
    catatVitalsPembaruan("f00d00000022", { ts: "2026-10-31T01:02:00Z", rssi: -60, uptime_s: 20, heap_free: 1, reset_reason: "SW", fw: "1.7.0" });
    await tunggu();
    expect(db.pembaruan.map((p) => p.status)).toEqual(["berhasil", "gagal"]);
    expect(kejadian.at(-1)?.pesan).toContain("disimpulkan server");
  });

  it("laporan ota ber-id ASING (tidak dikirim server ini): peringatan + kejadian ota SEKALI; laporan ulang yang dikenal: diam", async () => {
    node1("f00d00000041", "1.7.0");
    await mintaUpdate("f00d00000041", "1.7.1", "1");
    const v = (id: string) => ({ ts: "2026-10-31T01:02:00Z", rssi: -60, uptime_s: 20, heap_free: 1, reset_reason: "SW" as const,
      fw: "1.7.1", ota: { id, hasil: "berhasil" as const, versi: "1.7.1" } });
    const idSah = db.pembaruan[0].id;
    for (let i = 0; i < 3; i++) catatVitalsPembaruan("f00d00000041", v(idSah)); // laporan sah diulang 3 kali
    await tunggu();
    expect(kejadian.filter((k) => k.pesan.includes("tidak dikirim server ini"))).toHaveLength(0);
    for (let i = 0; i < 3; i++) catatVitalsPembaruan("f00d00000041", v("c-palsu-0001")); // update dari akun lain
    await tunggu();
    const asing = kejadian.filter((k) => k.pesan.includes("tidak dikirim server ini"));
    expect(asing).toHaveLength(1);
    expect(asing[0]).toMatchObject({ jenis: "ota" });
    expect(asing[0].pesan).toContain("c-palsu-0001");
  });

  it("vitals tanpa menyala ulang (uptime lebih lama dari umur perintah) tidak menyimpulkan apa pun", async () => {
    node1("f00d00000031", "1.7.0");
    await mintaUpdate("f00d00000031", "1.7.1", "1");
    catatVitalsPembaruan("f00d00000031", { ts: "2026-10-31T01:02:00Z", rssi: -60, uptime_s: 5000, heap_free: 1, reset_reason: "POWERON", fw: "1.7.0" });
    await tunggu();
    expect(db.pembaruan[0].status).toBe("diterima");
  });
});
