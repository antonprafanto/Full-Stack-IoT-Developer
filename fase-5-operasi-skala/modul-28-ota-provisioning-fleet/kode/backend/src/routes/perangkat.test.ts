// perangkat.test.ts - uji rute daftar resmi perangkat (Modul 21) TANPA database: tabel devices diganti tiruan di memori
// (vi.mock), server Fastify dijalankan tanpa jaringan (app.inject). Yang diuji: kunci tampil sekali, yang tersimpan hanya
// sidik jarinya, registrasi ganda ditolak, ganti kunci, cabut, perangkat ESP-NOW tanpa kunci. Satpam login (Modul 20) tidak
// ikut dipasang di sini: 401 dan 403 sudah dijaga keamanan.ts untuk SEMUA rute.
// Modul 28: akun broker otomatis (akun-broker.ts diganti tiruan) di dalam transaksi yang sama, dan "Nonaktifkan" (cabut):
// status ditulis offline, config retained dihapus, kejadian dicabut. Jalankan: npm test
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";

vi.hoisted(() => { // env.ts memeriksa .env saat diimpor: beri setelan palsu yang sah (tidak ada yang benar-benar dihubungi)
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://tiruan:tiruan@127.0.0.1:1/tiruan";
  process.env.JWT_SECRET = "rahasia-uji-yang-cukup-panjang-untuk-zod-0123456789";
});

// tabel devices tiruan: device_id -> baris (termasuk kunci_hash, yang di database sungguhan juga ada)
const tabel = vi.hoisted(() => new Map<string, Record<string, unknown>>());
// Modul 28: akun broker tiruan. mode "manual" = AKUN_BROKER_OTOMATIS=mati (seperti Modul 21)
const broker = vi.hoisted(() => ({ mode: "manual" as "manual" | "otomatis" | "gagal" | "akun-lama", log: [] as string[],
  config: [] as string[], kejadian: [] as { jenis: string; pesan: string }[] }));
vi.mock("../services/akun-broker.ts", () => ({
  antreAkun: (kerja: () => Promise<unknown>) => kerja(), // antrean asli diuji di akun-broker.test.ts
  tempatAkun: () => (broker.mode === "manual" ? "tangan (Modul 21)" : "broker gerbang pi1"),
  pasangAkunPerangkat: async (id: string) => {
    if (broker.mode === "gagal") throw new Error("broker gerbang pi1 tidak menjawab createClient dalam 3 detik");
    if (broker.mode === "manual") return "manual";
    broker.log.push(`buat ${id}`);
    return "dibuat";
  },
  hapusAkunPerangkat: async (id: string) => {
    if (broker.mode === "gagal") throw new Error("broker gerbang pi1 tidak menjawab deleteClient dalam 3 detik");
    if (broker.mode === "manual") return "manual";
    broker.log.push(`hapus ${id}`);
    return broker.mode === "akun-lama" ? "tidak-ada" : "dihapus";
  },
}));
vi.mock("../services/mqtt.ts", () => ({
  brokerTersambung: () => true, buatIdPerintah: () => "c-1", kirimPerintah: () => {},
  hapusConfig: (id: string) => { broker.config.push(id); },
}));
vi.mock("../services/kejadian.ts", () => ({ catatKejadian: (k: { jenis: string; pesan: string }) => { broker.kejadian.push(k); } }));
vi.mock("../db/perangkat.ts", () => {
  const KOSONG = { jenis: "belum-diketahui", nama: null, lokasi: null, lat: null, lng: null, status: "belum-diketahui",
    terakhir_dilihat: null, terdaftar: null, kunci_hash: null, kunci_dibuat: null, dicabut: null, penghubung: null };
  const tanpaHash = (b: Record<string, unknown>) => { const { kunci_hash: _, ...sisa } = b; return sisa; };
  return {
    semuaPerangkatDb: async () => [...tabel.values()].map(tanpaHash),
    // Modul 28: langkah broker (diBroker) dijalankan SEBELUM tabel diubah; galat = tidak ada yang berubah (transaksi)
    daftarkanPerangkat: async (id: string, nama: string | null, lokasi: string | null, penghubung: string | null,
      kunciHash: string | null, diBroker = async (_b: unknown) => {}) => {
      const lama = tabel.get(id);
      if (lama?.terdaftar) return undefined;
      const baru = { ...KOSONG, ...lama, device_id: id, nama: nama ?? lama?.nama ?? null, lokasi, penghubung,
        jenis: penghubung ? "node2" : (lama?.jenis ?? "belum-diketahui"), terdaftar: new Date(), kunci_hash: kunciHash,
        kunci_dibuat: kunciHash ? new Date() : null, dicabut: null };
      await diBroker(tanpaHash(baru));
      tabel.set(id, baru);
      return tanpaHash(baru);
    },
    gantiKunciPerangkat: async (id: string, kunciHash: string, diBroker = async (_b: unknown) => {}) => {
      const b = tabel.get(id);
      if (!b?.terdaftar || b.penghubung) return undefined;
      await diBroker(tanpaHash(b));
      Object.assign(b, { kunci_hash: kunciHash, kunci_dibuat: new Date(), dicabut: null });
      return tanpaHash(b);
    },
    cabutPerangkat: async (id: string, diBroker = async (_b: unknown) => {}) => {
      const b = tabel.get(id);
      if (!b?.terdaftar || b.dicabut) return undefined;
      await diBroker(tanpaHash(b));
      Object.assign(b, { kunci_hash: null, kunci_dibuat: null, dicabut: new Date(), status: "offline" });
      return tanpaHash(b);
    },
  };
});

import Fastify from "fastify";
import type { LightMyRequestResponse } from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { rutePerangkat } from "./perangkat.ts";
import { isiDaftar, izinPerangkat } from "../services/daftar.ts";
import { cariPerangkat, simpanStatus } from "../services/gudang.ts";

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
  tabel.set("a4cf12e5b7c0", { device_id: "a4cf12e5b7c0", jenis: "node1", nama: null, lokasi: null, lat: null, lng: null,
    status: "online", terakhir_dilihat: new Date(), terdaftar: null, kunci_hash: null, kunci_dibuat: null, dicabut: null,
    penghubung: null });
  isiDaftar([...tabel.values()] as never);
});
afterAll(() => app.close());

describe("daftar resmi perangkat", () => {
  let kunciPertama = "";

  it("baris lama belum terdaftar: GET /devices menandainya belum-terdaftar", async () => {
    expect(izinPerangkat("a4cf12e5b7c0")).toBe("belum-terdaftar");
    const jawab = await app.inject({ method: "GET", url: "/devices" });
    expect(jawab.statusCode).toBe(200);
    // Modul 25: titik peta ikut tampil; null = belum diisi
    expect(jawab.json()[0]).toMatchObject({ device_id: "a4cf12e5b7c0", kunci: "belum-terdaftar", terdaftar: null, lat: null,
      lng: null });
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

describe("akun broker otomatis dan Nonaktifkan (Modul 28)", () => {
  it("registrasi dengan AKUN_BROKER_OTOMATIS: akun broker dibuat backend; langkah tidak menyuruh mosquitto_passwd", async () => {
    broker.mode = "otomatis";
    const jawab = await post("/devices", { device_id: "f00d00000021", nama: "Latihan Modul 28" });
    expect(jawab.statusCode).toBe(201);
    expect(broker.log).toContain("buat f00d00000021");
    expect(jawab.json().langkah[2]).toContain("otomatis di broker gerbang pi1");
    expect(jawab.json().langkah.join(" ")).not.toContain("mosquitto_passwd");
  });

  it("broker tidak menjawab: 503, database tidak berubah (perangkat tetap belum terdaftar), pembaca disuruh mengulang", async () => {
    broker.mode = "gagal";
    const jawab = await post("/devices", { device_id: "f00d00000022" });
    expect(jawab.statusCode).toBe(503);
    expect(jawab.json().pesan).toContain("belum tersimpan di database");
    expect(jawab.json().pesan).toContain("ulangi langkah ini");
    expect(tabel.has("f00d00000022")).toBe(false);
    expect(izinPerangkat("f00d00000022")).toBe("belum-terdaftar");
  });

  it("Nonaktifkan: akun broker dihapus (diputus seketika), status offline, config retained dihapus, kejadian dicabut", async () => {
    broker.mode = "otomatis";
    simpanStatus("f00d00000021", "online"); // dashboard melihatnya online...
    const jawab = await post("/devices/f00d00000021/cabut");
    expect(jawab.statusCode).toBe(200);
    expect(jawab.json()).toMatchObject({ akun_broker: "dihapus" });
    expect(broker.log).toContain("hapus f00d00000021");
    expect(cariPerangkat("f00d00000021")?.status).toBe("offline"); // ...broker tidak menerbitkan wasiat: server yang menulis
    expect(tabel.get("f00d00000021")?.status).toBe("offline");
    expect(broker.config).toContain("f00d00000021");
    expect(broker.kejadian.at(-1)).toMatchObject({ jenis: "dicabut" });
  });

  it("akun lama Modul 21 (password_file, tidak ada di dynamic security): langkah menyuruh mosquitto_passwd -D lalu restart", async () => {
    broker.mode = "akun-lama";
    expect((await post("/devices", { device_id: "f00d00000023" })).statusCode).toBe(201);
    const jawab = await post("/devices/f00d00000023/cabut");
    expect(jawab.json().akun_broker).toBe("tidak-ada");
    expect(jawab.json().langkah[0]).toContain("mosquitto_passwd -D");
    broker.mode = "manual";
  });

  it("broker gagal saat Nonaktifkan: 503, kunci BELUM dicabut (coba lagi)", async () => {
    broker.mode = "otomatis";
    expect((await post("/devices", { device_id: "f00d00000024" })).statusCode).toBe(201);
    broker.mode = "gagal";
    expect((await post("/devices/f00d00000024/cabut")).statusCode).toBe(503);
    expect(izinPerangkat("f00d00000024")).toBe("terdaftar");
    broker.mode = "manual";
  });
});
