// perangkat.test.ts - uji rute daftar resmi perangkat (Modul 21) TANPA database: tabel devices diganti tiruan di memori
// (vi.mock), server Fastify dijalankan tanpa jaringan (app.inject). Yang diuji: kunci tampil sekali, yang tersimpan hanya
// sidik jarinya, registrasi ganda ditolak, ganti kunci, cabut, perangkat ESP-NOW tanpa kunci. Satpam login (Modul 20) tidak
// ikut dipasang di sini: 401 dan 403 sudah dijaga keamanan.ts untuk SEMUA rute. Jalankan: npm test
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";

vi.hoisted(() => { // env.ts memeriksa .env saat diimpor: beri setelan palsu yang sah (tidak ada yang benar-benar dihubungi)
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://tiruan:tiruan@127.0.0.1:1/tiruan";
  process.env.JWT_SECRET = "rahasia-uji-yang-cukup-panjang-untuk-zod-0123456789";
});

// tabel devices tiruan: device_id -> baris (termasuk kunci_hash, yang di database sungguhan juga ada)
const tabel = vi.hoisted(() => new Map<string, Record<string, unknown>>());
vi.mock("../db/perangkat.ts", () => {
  const KOSONG = { jenis: "belum-diketahui", nama: null, lokasi: null, status: "belum-diketahui", terakhir_dilihat: null,
    terdaftar: null, kunci_hash: null, kunci_dibuat: null, dicabut: null, penghubung: null };
  const tanpaHash = (b: Record<string, unknown>) => { const { kunci_hash: _, ...sisa } = b; return sisa; };
  return {
    semuaPerangkatDb: async () => [...tabel.values()].map(tanpaHash),
    daftarkanPerangkat: async (id: string, nama: string | null, lokasi: string | null, penghubung: string | null,
      kunciHash: string | null) => {
      const lama = tabel.get(id);
      if (lama?.terdaftar) return undefined;
      const baru = { ...KOSONG, ...lama, device_id: id, nama: nama ?? lama?.nama ?? null, lokasi, penghubung,
        jenis: penghubung ? "node2" : (lama?.jenis ?? "belum-diketahui"), terdaftar: new Date(), kunci_hash: kunciHash,
        kunci_dibuat: kunciHash ? new Date() : null, dicabut: null };
      tabel.set(id, baru);
      return tanpaHash(baru);
    },
    gantiKunciPerangkat: async (id: string, kunciHash: string) => {
      const b = tabel.get(id);
      if (!b?.terdaftar || b.penghubung) return undefined;
      Object.assign(b, { kunci_hash: kunciHash, kunci_dibuat: new Date(), dicabut: null });
      return tanpaHash(b);
    },
    cabutPerangkat: async (id: string) => {
      const b = tabel.get(id);
      if (!b?.terdaftar || b.dicabut) return undefined;
      Object.assign(b, { kunci_hash: null, kunci_dibuat: null, dicabut: new Date() });
      return tanpaHash(b);
    },
  };
});

import Fastify from "fastify";
import type { LightMyRequestResponse } from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { rutePerangkat } from "./perangkat.ts";
import { isiDaftar, izinPerangkat } from "../services/daftar.ts";

const app = Fastify();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
// pengganti satpam: setiap permintaan dianggap datang dari akun admin nomor 1
app.addHook("onRequest", async (req) => {
  req.user = { sub: "1", peran: "admin", sid: 1, iat: 0, exp: 0 };
});
await app.register(rutePerangkat);

const sha256 = (teks: string) => createHash("sha256").update(teks).digest("hex");
const post = (url: string, body?: object): Promise<LightMyRequestResponse> =>
  app.inject({ method: "POST", url, ...(body === undefined ? {} : { payload: body }) });

beforeAll(() => {
  // satu baris lama dari Modul 17-20 (dibuat otomatis, belum terdaftar), lalu daftar di memori dimuat seperti saat server mulai
  tabel.set("a4cf12e5b7c0", { device_id: "a4cf12e5b7c0", jenis: "node1", nama: null, lokasi: null, status: "online",
    terakhir_dilihat: new Date(), terdaftar: null, kunci_hash: null, kunci_dibuat: null, dicabut: null, penghubung: null });
  isiDaftar([...tabel.values()] as never);
});
afterAll(() => app.close());

describe("daftar resmi perangkat", () => {
  let kunciPertama = "";

  it("baris lama belum terdaftar: GET /devices menandainya belum-terdaftar", async () => {
    expect(izinPerangkat("a4cf12e5b7c0")).toBe("belum-terdaftar");
    const jawab = await app.inject({ method: "GET", url: "/devices" });
    expect(jawab.statusCode).toBe(200);
    expect(jawab.json()[0]).toMatchObject({ device_id: "a4cf12e5b7c0", kunci: "belum-terdaftar", terdaftar: null });
  });

  it("POST /devices: 201, kunci 43 huruf tampil SEKALI, database hanya menyimpan SHA-256-nya", async () => {
    const jawab = await post("/devices", { device_id: "a4cf12e5b7c0", nama: "Node 1 ruang tamu" });
    expect(jawab.statusCode).toBe(201);
    const isi = jawab.json();
    expect(isi.kunci).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(isi.langkah.length).toBe(3);
    kunciPertama = isi.kunci;
    expect(tabel.get("a4cf12e5b7c0")?.kunci_hash).toBe(sha256(kunciPertama));
    expect(JSON.stringify([...tabel.values()])).not.toContain(kunciPertama);
    expect(izinPerangkat("a4cf12e5b7c0")).toBe("terdaftar");
  });

  it("GET /devices tidak pernah memuat kunci maupun sidik jarinya", async () => {
    const teks = (await app.inject({ method: "GET", url: "/devices" })).body;
    expect(teks).not.toContain(kunciPertama);
    expect(teks).not.toContain(sha256(kunciPertama));
    expect(teks).not.toContain("kunci_hash");
    expect(JSON.parse(teks)[0]).toMatchObject({ kunci: "aktif", nama: "Node 1 ruang tamu" });
  });

  it("registrasi kedua untuk device_id yang sama: 409", async () => {
    const jawab = await post("/devices", { device_id: "a4cf12e5b7c0" });
    expect(jawab.statusCode).toBe(409);
    expect(jawab.json().pesan).toContain("sudah terdaftar");
  });

  it("isi yang tidak sah: 400 (device_id huruf besar, kolom asing)", async () => {
    expect((await post("/devices", { device_id: "A4CF12E5B7C0" })).statusCode).toBe(400);
    expect((await post("/devices", { device_id: "a4cf12e5b7c1", kunci: "pilihan-sendiri" })).statusCode).toBe(400);
  });

  it("ganti kunci: kunci baru berbeda, sidik jari kunci lama langsung terhapus", async () => {
    const jawab = await post("/devices/a4cf12e5b7c0/kunci");
    expect(jawab.statusCode).toBe(200);
    const baru = jawab.json().kunci as string;
    expect(baru).not.toBe(kunciPertama);
    expect(tabel.get("a4cf12e5b7c0")?.kunci_hash).toBe(sha256(baru));
  });

  it("perangkat ESP-NOW (Node 2): tanpa kunci, penghubung wajib terdaftar, jawaban berisi baris ACL", async () => {
    expect((await post("/devices", { device_id: "246f28b1c7d4", penghubung: "0123456789ab" })).statusCode).toBe(409);
    const jawab = await post("/devices", { device_id: "246f28b1c7d4", nama: "Node 2 kebun", penghubung: "a4cf12e5b7c0" });
    expect(jawab.statusCode).toBe(201);
    expect(jawab.json().kunci).toBeNull();
    expect(jawab.json().langkah).toContain("topic write rpm/246f28b1c7d4/telemetry");
    expect((await post("/devices/246f28b1c7d4/kunci")).statusCode).toBe(404); // perangkat ESP-NOW tidak punya kunci
  });

  it("cabut: 200, buku tamu langsung mencatat dicabut, cabut kedua 404, sidik jarinya terhapus", async () => {
    expect((await post("/devices", { device_id: "f00d00000001" })).statusCode).toBe(201);
    const jawab = await post("/devices/f00d00000001/cabut");
    expect(jawab.statusCode).toBe(200);
    expect(jawab.json().dicabut).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
    expect(izinPerangkat("f00d00000001")).toBe("dicabut");
    expect(tabel.get("f00d00000001")?.kunci_hash).toBeNull();
    expect((await post("/devices/f00d00000001/cabut")).statusCode).toBe(404);
    const daftar = (await app.inject({ method: "GET", url: "/devices" })).json();
    expect(daftar.find((p: { device_id: string }) => p.device_id === "f00d00000001").kunci).toBe("dicabut");
  });

  it("perangkat yang dicabut bisa dihidupkan lagi dengan kunci baru", async () => {
    const jawab = await post("/devices/f00d00000001/kunci");
    expect(jawab.statusCode).toBe(200);
    expect(izinPerangkat("f00d00000001")).toBe("terdaftar");
  });
});
