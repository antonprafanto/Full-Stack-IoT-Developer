// armada.test.ts - uji rute halaman /armada (Modul 28) TANPA database dan broker: kueri db/armada.ts diganti tiruan, perintah
// update (services/ota.ts) diganti tiruan yang mencatat panggilannya (aturan kirimnya sendiri diuji ota.test.ts). Pengaman
// SUNGGUHAN ikut dipasang: semua peran boleh melihat, tombol khusus admin. Jalankan: npm test
import { afterAll, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://tiruan:tiruan@127.0.0.1:1/tiruan";
  process.env.JWT_SECRET = "rahasia-uji-yang-cukup-panjang-untuk-zod-0123456789";
  process.env.ALAMAT_SERVER = "https://iot.namaanda.my.id";
  process.env.AKUN_BROKER_OTOMATIS = "gerbang:pi1";
});

const W = new Date("2026-10-31T01:00:00Z");
const BARIS = { nama: null, lokasi: null, status: "online", terakhir_dilihat: W, penghubung: null, dicabut: null, canary: false,
  jeda_vitals_s: null, fw_dilihat: W, reset_reason: null, kesehatan_ts: null, rssi: null, heap_free: null, uptime_s: null,
  kesehatan_reset_reason: null, p_id: null, p_status: null, p_dari: null, p_ke: null, p_pesan: null, p_dibuat: null,
  p_diperbarui: null, p_selesai: null };
const catatan = vi.hoisted(() => ({ update: [] as unknown[], jeda: [] as unknown[] }));
vi.mock("../db/armada.ts", () => ({
  semuaRilis: async () => [
    { jenis: "node1", versi: "1.7.1", uji: false, ditarik: null },
    { jenis: "node1", versi: "1.7.2", uji: true, ditarik: null }, // rilis uji tidak pernah "terbaru"
  ],
  dataArmada: async () => [
    { ...BARIS, device_id: "a4cf12e5b7c0", jenis: "node1", fw: "1.7.0", canary: true, kesehatan_ts: W, rssi: -61, heap_free: 183200,
      uptime_s: 12, kesehatan_reset_reason: "SW", p_id: "c-20261031-010000-1", p_status: "berhasil", p_dari: "1.6.0",
      p_ke: "1.7.0", p_dibuat: W, p_diperbarui: W, p_selesai: W },
    { ...BARIS, device_id: "246f28b1c7d4", jenis: "node2", fw: "1.0.0", penghubung: "a4cf12e5b7c0" },
    { ...BARIS, device_id: "f00d00000009", jenis: "node1", fw: "1.7.0", dicabut: W, status: "online" },
  ],
  riwayatPembaruan: async () => [],
  ubahCanary: async (id: string, canary: boolean) => (id === "a4cf12e5b7c0" ? { device_id: id, canary } : undefined),
  ubahJedaVitals: async (id: string, detik: number) => (id === "a4cf12e5b7c0"
    ? { device_id: id, jeda_vitals_s: detik, fw: "1.6.0" } : undefined),
}));
vi.mock("../services/ota.ts", async (asli) => ({
  ...(await asli<typeof import("../services/ota.ts")>()), // alasanTidakBisa asli
  mintaUpdate: async (id: string, versi: string, oleh: string, paksa: boolean) => {
    catatan.update.push({ id, versi, oleh, paksa });
    if (versi === "1.7.2") return { status: "ditolak", id: "c-2", device_id: id, pesan: "masih dalam masa uji 60 detik" };
    if (versi === "9.9.9") return { status: "tidak-dikirim", device_id: id, kode: 404, pesan: "firmware versi itu belum diunggah" };
    return { status: "diterima", id: "c-1", device_id: id, dari: "1.7.0", ke: versi, lama_ms: 12 };
  },
  perbaruiArmada: async (versi: string, sasaran: string) => (sasaran === "semua"
    ? { kode: 409, pesan: `belum ada perangkat canary yang berhasil memakai ${versi}: perbarui canary dulu` }
    : { versi, sasaran, dikirim: [{ status: "diterima", id: "c-3", device_id: "a4cf12e5b7c0", dari: "1.7.0", ke: versi, lama_ms: 9 }],
      dilewati: [{ device_id: "f00d00000009", alasan: "perangkat sudah dinonaktifkan (kuncinya dicabut)" }] }),
}));
vi.mock("../services/otomasi.ts", () => ({
  aturJedaVitals: (id: string, detik: number) => { catatan.jeda.push({ id, detik }); },
  kirimConfigUntuk: () => "c-20261031-010000-9",
}));
vi.mock("../services/realtime.ts", () => ({ putuskanSesi: () => {} }));

import Fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { pasangKeamanan } from "../auth/keamanan.ts";
import { ruteArmada } from "./armada.ts";

const app = Fastify();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
await pasangKeamanan(app);
await app.register(ruteArmada);
await app.ready();
afterAll(() => app.close());

const cookie = (peran: "admin" | "viewer") => `akses=${app.jwt.sign({ sub: peran === "admin" ? "1" : "2", peran, sid: 1 })}`;
const minta = (method: "GET" | "POST" | "PUT", url: string, payload?: object, peran: "admin" | "viewer" = "admin") =>
  app.inject({ method, url, ...(payload === undefined ? {} : { payload }), headers: { cookie: cookie(peran) } });

describe("GET /armada", () => {
  it("viewer boleh melihat; rilis uji bukan rilis terbaru; Node 1 lama perlu diperbarui dan bisa diperbarui", async () => {
    const jawab = await minta("GET", "/armada", undefined, "viewer");
    expect(jawab.statusCode).toBe(200);
    const isi = jawab.json();
    expect(isi.rilis_terbaru).toEqual({ node1: "1.7.1" });
    expect(isi.pengaturan).toEqual({ ota_siap: true, akun_broker: "broker gerbang pi1" });
    expect(isi.perangkat[0]).toMatchObject({ device_id: "a4cf12e5b7c0", fw: "1.7.0", perlu_update: true, bisa_update: true,
      canary: true, kesehatan: { rssi: -61, reset_reason: "SW" }, pembaruan: { status: "berhasil", dari: "1.6.0", ke: "1.7.0" } });
  });

  it("Node 2: OTA tidak tersedia (lewat kabel); perangkat dinonaktifkan: kunci dicabut, status offline, tidak bisa diperbarui", async () => {
    const [, node2, dicabut] = (await minta("GET", "/armada")).json().perangkat;
    expect(node2).toMatchObject({ jenis: "node2", kunci: "tanpa-kunci", fw: "1.0.0", perlu_update: false, bisa_update: false });
    expect(node2.alasan_tidak_bisa).toContain("lewat kabel");
    expect(dicabut).toMatchObject({ kunci: "dicabut", status: "offline", bisa_update: false, perlu_update: false });
  });
});

describe("tombol admin", () => {
  it("viewer menekan Perbarui: 403 (satpam); admin: 202 diterima (BUKAN selesai)", async () => {
    expect((await minta("POST", "/devices/a4cf12e5b7c0/update", { versi: "1.7.1" }, "viewer")).statusCode).toBe(403);
    const jawab = await minta("POST", "/devices/a4cf12e5b7c0/update", { versi: "1.7.1" });
    expect(jawab.statusCode).toBe(202);
    expect(jawab.json()).toMatchObject({ status: "diterima", id: "c-1", ke: "1.7.1" });
    expect(catatan.update.at(-1)).toEqual({ id: "a4cf12e5b7c0", versi: "1.7.1", oleh: "1", paksa: false });
  });

  it("perangkat menolak: 422 dengan alasannya; belum diunggah: 404; versi bukan x.y.z: 400", async () => {
    expect((await minta("POST", "/devices/a4cf12e5b7c0/update", { versi: "1.7.2" })).json())
      .toEqual({ pesan: "perangkat menolak: masih dalam masa uji 60 detik" });
    expect((await minta("POST", "/devices/a4cf12e5b7c0/update", { versi: "9.9.9" })).statusCode).toBe(404);
    expect((await minta("POST", "/devices/a4cf12e5b7c0/update", { versi: "1.7" })).statusCode).toBe(400);
  });

  it("perbarui canary 202 (yang dilewati beserta alasan); perbarui semua sebelum canary berhasil 409", async () => {
    const canary = await minta("POST", "/armada/update", { versi: "1.7.1", sasaran: "canary" });
    expect(canary.statusCode).toBe(202);
    expect(canary.json().dilewati[0].alasan).toContain("dinonaktifkan");
    const semua = await minta("POST", "/armada/update", { versi: "1.7.1", sasaran: "semua" });
    expect(semua.statusCode).toBe(409);
    expect(semua.json().pesan).toContain("canary");
  });

  it("jeda vitals 60-3600 detik; firmware lama mendapat catatan; Node 2/tak dikenal 404", async () => {
    const jawab = await minta("PUT", "/devices/a4cf12e5b7c0/jeda", { vitals_s: 60 });
    expect(jawab.statusCode).toBe(200);
    expect(jawab.json()).toMatchObject({ jeda_vitals_s: 60, config_id: "c-20261031-010000-9" });
    expect(jawab.json().catatan).toContain("mulai 1.7.0");
    expect(catatan.jeda).toEqual([{ id: "a4cf12e5b7c0", detik: 60 }]);
    expect((await minta("PUT", "/devices/a4cf12e5b7c0/jeda", { vitals_s: 30 })).statusCode).toBe(400);
    expect((await minta("PUT", "/devices/246f28b1c7d4/jeda", { vitals_s: 60 })).statusCode).toBe(404);
  });

  it("canary: tandai dan lepas; bukan Node 1 aktif 404", async () => {
    expect((await minta("PUT", "/devices/a4cf12e5b7c0/canary", { canary: true })).json()).toEqual({ device_id: "a4cf12e5b7c0", canary: true });
    expect((await minta("PUT", "/devices/246f28b1c7d4/canary", { canary: true })).statusCode).toBe(404);
  });
});
