// lokasi.test.ts - uji titik perangkat di peta (Modul 25) TANPA database: tabel devices diganti tiruan di memori (vi.mock),
// server Fastify dijalankan tanpa jaringan (app.inject). Bagian pertama menguji skema Lokasi saja (batas, NaN, koma desimal);
// bagian kedua menguji rute PUT /devices/:id/lokasi bersama satpam SUNGGUHAN (keamanan.ts), seperti aturan.test.ts:
// tamu 401, viewer 403, admin 200, device_id yang tidak ada 404. Jalankan: npm test
import { afterAll, describe, expect, it, vi } from "vitest";

vi.hoisted(() => { // env.ts memeriksa .env saat diimpor: beri setelan palsu yang sah (tidak ada yang benar-benar dihubungi)
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://tiruan:tiruan@127.0.0.1:1/tiruan";
  process.env.JWT_SECRET = "rahasia-uji-yang-cukup-panjang-untuk-zod-0123456789";
  process.env.CORS_ORIGIN = "http://localhost:5173"; // halaman dashboard (Vite) yang boleh memanggil API dari browser
});

// tabel devices tiruan: satu perangkat terdaftar tanpa titik peta
const tabel = vi.hoisted(() => new Map<string, Record<string, unknown>>([["a4cf12e5b7c0", {
  device_id: "a4cf12e5b7c0", jenis: "node1", nama: "Node 1 ruang tamu", lokasi: "ruang tamu", lat: null, lng: null,
  status: "online", terakhir_dilihat: new Date(), terdaftar: new Date(), kunci_dibuat: new Date(), dicabut: null,
  penghubung: null,
}]]));
vi.mock("../db/perangkat.ts", () => ({
  semuaPerangkatDb: async () => [...tabel.values()],
  ubahLokasi: async (id: string, lat: number | null, lng: number | null) => { // seperti UPDATE ... RETURNING
    const b = tabel.get(id);
    if (b === undefined) return undefined;
    Object.assign(b, { lat, lng });
    return b;
  },
  daftarkanPerangkat: async () => { throw new Error("tidak dipakai di tes ini"); },
  gantiKunciPerangkat: async () => { throw new Error("tidak dipakai di tes ini"); },
  cabutPerangkat: async () => { throw new Error("tidak dipakai di tes ini"); },
}));

import Fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { pasangKeamanan } from "../auth/keamanan.ts";
import { Lokasi, rutePerangkat } from "./perangkat.ts";

const app = Fastify();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
await pasangKeamanan(app); // CORS, cookie, JWT, dan satpam yang sama dengan server.ts
await app.register(rutePerangkat);
await app.ready();
afterAll(() => app.close());

// "gelang" (JWT akses) yang sah karena ditandatangani dengan JWT_SECRET tes di atas, dikirim sebagai cookie akses
const gelang = (peran: "admin" | "viewer") => ({ akses: app.jwt.sign({ sub: peran === "admin" ? "1" : "2", peran, sid: 1 }) });
const put = (id: string, isi: unknown, peran?: "admin" | "viewer") => app.inject({ method: "PUT", url: `/devices/${id}/lokasi`,
  ...(typeof isi === "string" ? { payload: isi, headers: { "content-type": "application/json" } } : { payload: isi as object }),
  ...(peran === undefined ? {} : { cookies: gelang(peran) }) });
// contoh titik FIKTIF di tempat umum (sekitar Monas, Jakarta), bukan rumah siapa pun
const MONAS = { lat: -6.1754, lng: 106.8272 };

describe("skema Lokasi", () => {
  it("batas rentang ikut diterima: -90, 90, -180, 180; juga null + null (hapus titik)", () => {
    for (const isi of [{ lat: -90, lng: -180 }, { lat: 90, lng: 180 }, MONAS, { lat: null, lng: null }]) {
      expect(Lokasi.safeParse(isi).success).toBe(true);
    }
  });

  it("di luar rentang ditolak dengan pesan yang menyebut batasnya", () => {
    const lintang = Lokasi.safeParse({ lat: 90.0001, lng: 0 });
    expect(lintang.success).toBe(false);
    expect(lintang.error?.issues[0]).toMatchObject({ path: ["lat"], message: "lintang paling besar 90" });
    const bujur = Lokasi.safeParse({ lat: 0, lng: -180.5 });
    expect(bujur.error?.issues[0]).toMatchObject({ path: ["lng"], message: "bujur paling kecil -180" });
  });

  it("NaN dan Infinity bukan angka berhingga: ditolak", () => {
    const pesan = "harus angka berhingga (bukan NaN atau Infinity)";
    expect(Lokasi.safeParse({ lat: Number.NaN, lng: 106.8 }).error?.issues[0]).toMatchObject({ path: ["lat"], message: pesan });
    expect(Lokasi.safeParse({ lat: -6.2, lng: Number.POSITIVE_INFINITY }).error?.issues[0])
      .toMatchObject({ path: ["lng"], message: pesan });
  });

  it("koma desimal \"-6,2\" adalah teks, bukan angka: ditolak dengan petunjuk titik desimal", () => {
    const hasil = Lokasi.safeParse({ lat: "-6,2", lng: 106.8 });
    expect(hasil.error?.issues[0]).toMatchObject({
      path: ["lat"], message: "harus angka dengan titik desimal, misalnya -6.1754 (bukan teks \"-6,1754\")",
    });
  });

  it("setengah titik, kolom yang hilang, dan kolom asing (teks lokasi) ditolak", () => {
    expect(Lokasi.safeParse({ lat: -6.2, lng: null }).error?.issues[0]).toMatchObject({ path: ["lng"],
      message: "lat dan lng diisi berpasangan: keduanya angka, atau keduanya null untuk menghapus titik" });
    expect(Lokasi.safeParse({ lat: -6.2 }).error?.issues[0]).toMatchObject({ path: ["lng"],
      message: "wajib diisi: angka, atau null untuk menghapus titik" });
    expect(Lokasi.safeParse({ ...MONAS, lokasi: "taman" }).success).toBe(false);
  });
});

describe("PUT /devices/:id/lokasi", () => {
  it("tamu (belum login): 401, titiknya tidak berubah", async () => {
    expect((await put("a4cf12e5b7c0", MONAS)).statusCode).toBe(401);
    expect(tabel.get("a4cf12e5b7c0")?.lat).toBeNull();
  });

  it("viewer: boleh melihat GET /devices (200), tetapi memindahkan titik dijawab 403", async () => {
    expect((await app.inject({ method: "GET", url: "/devices", cookies: gelang("viewer") })).statusCode).toBe(200);
    const jawab = await put("a4cf12e5b7c0", MONAS, "viewer");
    expect(jawab.statusCode).toBe(403);
    expect(jawab.json()).toEqual({ pesan: "akun viewer hanya boleh melihat; perintah dan perubahan khusus admin" });
    expect(tabel.get("a4cf12e5b7c0")?.lat).toBeNull();
  });

  it("admin: 200 dengan baris perangkat lengkap, dan GET /devices langsung membawa titik barunya", async () => {
    const jawab = await put("a4cf12e5b7c0", MONAS, "admin");
    expect(jawab.statusCode).toBe(200);
    expect(jawab.json()).toMatchObject({ device_id: "a4cf12e5b7c0", lokasi: "ruang tamu", ...MONAS, kunci: "aktif" });
    const daftar = (await app.inject({ method: "GET", url: "/devices", cookies: gelang("viewer") })).json();
    expect(daftar[0]).toMatchObject(MONAS);
  });

  it("admin: { lat: null, lng: null } menghapus titiknya", async () => {
    const jawab = await put("a4cf12e5b7c0", { lat: null, lng: null }, "admin");
    expect(jawab.statusCode).toBe(200);
    expect(jawab.json()).toMatchObject({ lat: null, lng: null });
  });

  it("admin: koma desimal, di luar rentang, dan 1e999 (Infinity sesudah JSON.parse) dijawab 400", async () => {
    const koma = await put("a4cf12e5b7c0", { lat: "-6,2", lng: 106.8 }, "admin");
    expect(koma.statusCode).toBe(400);
    expect(koma.json().message).toContain("harus angka dengan titik desimal");
    expect((await put("a4cf12e5b7c0", { lat: -91, lng: 106.8 }, "admin")).statusCode).toBe(400);
    const takHingga = await put("a4cf12e5b7c0", "{\"lat\": 1e999, \"lng\": 106.8}", "admin");
    expect(takHingga.statusCode).toBe(400);
    expect(takHingga.json().message).toBe("body/lat harus angka berhingga (bukan NaN atau Infinity)");
    expect(tabel.get("a4cf12e5b7c0")?.lat).toBeNull(); // tidak ada yang tersimpan
  });

  it("device_id yang tidak ada di daftar: 404 dengan pesan persis; device_id tidak sah: 400", async () => {
    const jawab = await put("f00d000000ff", MONAS, "admin");
    expect(jawab.statusCode).toBe(404);
    expect(jawab.json()).toEqual({ pesan: "f00d000000ff tidak ada di daftar perangkat" });
    expect((await put("BUKAN-ID", MONAS, "admin")).statusCode).toBe(400);
  });

  it("browser dari dashboard (CORS_ORIGIN): preflight mengizinkan PUT", async () => {
    const preflight = await app.inject({ method: "OPTIONS", url: "/devices/a4cf12e5b7c0/lokasi",
      headers: { origin: "http://localhost:5173", "access-control-request-method": "PUT" } });
    expect(preflight.statusCode).toBe(204);
    expect(preflight.headers["access-control-allow-methods"]).toContain("PUT");
  });
});
