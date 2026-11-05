// klaim.test.ts - uji kode klaim (Modul 28) TANPA database dan broker: tabel kode_klaim dan devices diganti tiruan di memori
// (vi.mock "../db/klaim.ts"; transaksinya ditiru: langkah broker gagal = tidak ada yang berubah), akun broker diganti tiruan.
// Pengaman SUNGGUHAN ikut dipasang: membuat kode khusus admin, menukar kode TANPA login tetapi dibatasi 10 per menit per IP.
// Jalankan: npm test
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://tiruan:tiruan@127.0.0.1:1/tiruan";
  process.env.JWT_SECRET = "rahasia-uji-yang-cukup-panjang-untuk-zod-0123456789";
});

const tabel = vi.hoisted(() => ({
  kode: new Map<string, { nama: string | null; lokasi: string | null; kedaluwarsa: number; dipakai: string | null }>(),
  perangkat: new Map<string, { kunci_hash: string; dicabut: boolean }>(),
  akunBroker: [] as string[],
  brokerGagal: false,
}));
vi.mock("../db/klaim.ts", () => ({
  simpanKodeKlaim: async (hash: string, nama: string | null, lokasi: string | null, _oleh: string, menit: number) => {
    const kedaluwarsa = Date.now() + menit * 60_000;
    tabel.kode.set(hash, { nama, lokasi, kedaluwarsa, dipakai: null });
    return new Date(kedaluwarsa);
  },
  daftarKodeKlaim: async () => [],
  tukarKodeKlaim: async (hash: string, id: string, kunciHash: string, diBroker: () => Promise<void>) => {
    const k = tabel.kode.get(hash);
    if (k === undefined || k.dipakai !== null || k.kedaluwarsa <= Date.now()) return { status: "kode-salah" };
    const lama = tabel.perangkat.get(id);
    if (lama !== undefined && !lama.dicabut) return { status: "masih-aktif" };
    await diBroker(); // galat di sini = ROLLBACK: kode dan perangkat tidak berubah
    k.dipakai = id;
    tabel.perangkat.set(id, { kunci_hash: kunciHash, dicabut: false });
    return { status: "berhasil", nama: k.nama, lokasi: k.lokasi };
  },
}));
vi.mock("../services/akun-broker.ts", () => ({
  antreAkun: (kerja: () => Promise<unknown>) => kerja(), // antrean asli diuji di akun-broker.test.ts
  pasangAkunPerangkat: async (id: string) => {
    if (tabel.brokerGagal) throw new Error("broker gerbang pi1 tidak menjawab createClient dalam 3 detik");
    tabel.akunBroker.push(id);
    return "dibuat";
  },
  tempatAkun: () => "broker gerbang pi1",
}));
vi.mock("../services/kejadian.ts", () => ({ catatKejadian: () => {} }));
vi.mock("../services/realtime.ts", () => ({ putuskanSesi: () => {} }));

import Fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { pasangKeamanan } from "../auth/keamanan.ts";
import { hashKunci } from "../auth/kunci.ts";
import { isiDaftar, izinPerangkat } from "../services/daftar.ts";
import { ruteKlaim } from "./klaim.ts";

const app = Fastify();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
await pasangKeamanan(app);
await app.register(ruteKlaim);
await app.ready();
isiDaftar([]); // buku tamu perangkat "sudah dimuat" (server.ts memuatnya dari database sebelum mendengar broker)
afterAll(() => app.close());

const cookie = (peran: "admin" | "viewer") => `akses=${app.jwt.sign({ sub: "1", peran, sid: 1 })}`;
let ipBerikut = 1; // setiap tes memakai alamat IP sendiri, supaya batas 10 per menit tidak terbawa antar-tes
let ip = "";
beforeEach(() => { ip = `198.51.100.${ipBerikut++}`; tabel.brokerGagal = false; });
const buatKode = async (isi: object = { nama: "Node 1 garasi", lokasi: "garasi" }) => app.inject({
  method: "POST", url: "/provision/kode", payload: isi, headers: { cookie: cookie("admin") } });
const klaim = (kode: string, device_id: string) => app.inject({ method: "POST", url: "/provision/klaim", remoteAddress: ip,
  payload: { kode, device_id } }); // TANPA cookie dan TANPA Origin: seperti ESP32

describe("kode klaim: dibuat admin", () => {
  it("201: kode XXXX-XXXX tampil sekali, masa berlaku bawaan 30 menit; viewer 403, tanpa login 401", async () => {
    const jawab = await buatKode();
    expect(jawab.statusCode).toBe(201);
    expect(jawab.json()).toMatchObject({ menit: 30, nama: "Node 1 garasi" });
    expect(jawab.json().kode).toMatch(/^[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/);
    expect(JSON.stringify([...tabel.kode.keys()])).not.toContain(jawab.json().kode.replace("-", "")); // hanya sidik jari
    expect((await app.inject({ method: "POST", url: "/provision/kode", payload: {}, headers: { cookie: cookie("viewer") } }))
      .statusCode).toBe(403);
    expect((await app.inject({ method: "POST", url: "/provision/kode", payload: {} })).statusCode).toBe(401);
  });

  it("menit 5-60 saja", async () => {
    expect((await buatKode({ menit: 4 })).statusCode).toBe(400);
    expect((await buatKode({ menit: 61 })).statusCode).toBe(400);
    expect((await buatKode({ menit: 60 })).statusCode).toBe(201);
  });
});

describe("kode klaim: ditukar PERANGKAT (tanpa login)", () => {
  it("201 {device_id, kunci, mqtt_username}; kunci 43 huruf, database hanya menyimpan sidik jarinya; akun broker dibuat", async () => {
    const kode = (await buatKode()).json().kode as string;
    const jawab = await klaim(kode.toLowerCase(), "f00d00000003"); // huruf kecil boleh
    expect(jawab.statusCode).toBe(201);
    const isi = jawab.json();
    expect(isi).toMatchObject({ device_id: "f00d00000003", mqtt_username: "f00d00000003" });
    expect(isi.kunci).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(tabel.perangkat.get("f00d00000003")?.kunci_hash).toBe(hashKunci(isi.kunci));
    expect(tabel.akunBroker).toContain("f00d00000003");
    expect(izinPerangkat("f00d00000003")).toBe("terdaftar"); // buku tamu backend ikut diperbarui
  });

  it("kode dipakai ulang, kode salah, kode kedaluwarsa: 403 dengan pesan yang SAMA", async () => {
    const kode = (await buatKode()).json().kode as string;
    expect((await klaim(kode, "f00d00000004")).statusCode).toBe(201);
    const ulang = await klaim(kode, "f00d00000005");
    const salah = await klaim("ZZZZ-ZZZZ", "f00d00000005");
    const habis = (await buatKode({ menit: 5 })).json().kode as string;
    for (const k of tabel.kode.values()) if (k.dipakai === null) k.kedaluwarsa = Date.now() - 1;
    const basi = await klaim(habis, "f00d00000005");
    for (const j of [ulang, salah, basi]) expect(j.statusCode).toBe(403);
    expect(new Set([ulang, salah, basi].map((j) => j.json().pesan)).size).toBe(1);
  });

  it("perangkat yang masih aktif tidak bisa diklaim (identitas tidak bisa direbut): 409; yang dicabut boleh", async () => {
    tabel.perangkat.set("a4cf12e5b7c0", { kunci_hash: "x", dicabut: false });
    expect((await klaim((await buatKode()).json().kode, "a4cf12e5b7c0")).statusCode).toBe(409);
    tabel.perangkat.set("a4cf12e5b7c0", { kunci_hash: "x", dicabut: true });
    expect((await klaim((await buatKode()).json().kode, "a4cf12e5b7c0")).statusCode).toBe(201);
  });

  it("broker tidak menjawab: 503 dan kode TIDAK hangus (percobaan berikutnya berhasil)", async () => {
    const kode = (await buatKode()).json().kode as string;
    tabel.brokerGagal = true;
    expect((await klaim(kode, "f00d00000006")).statusCode).toBe(503);
    expect(tabel.perangkat.has("f00d00000006")).toBe(false);
    tabel.brokerGagal = false;
    expect((await klaim(kode, "f00d00000006")).statusCode).toBe(201);
  });

  it("permintaan ke-11 dalam semenit dari alamat IP yang sama: 429 (tebak-tebakan kode dihentikan)", async () => {
    for (let i = 0; i < 10; i++) expect((await klaim("ZZZZ-ZZZZ", "f00d00000007")).statusCode).toBe(403);
    expect((await klaim("ZZZZ-ZZZZ", "f00d00000007")).statusCode).toBe(429);
  });

  it("bentuk isi salah: 400 (device_id huruf besar, kolom asing)", async () => {
    expect((await klaim("7K2M-QF9D", "F00D00000008")).statusCode).toBe(400);
    expect((await app.inject({ method: "POST", url: "/provision/klaim", remoteAddress: ip,
      payload: { kode: "7K2M-QF9D", device_id: "f00d00000008", kunci: "pilih-sendiri" } })).statusCode).toBe(400);
  });
});
