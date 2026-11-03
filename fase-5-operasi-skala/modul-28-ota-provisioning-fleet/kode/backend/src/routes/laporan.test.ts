// laporan.test.ts - uji rute POST /laporan/kirim (Modul 25) TANPA database dan TANPA Telegram: layanan laporan diganti tiruan
// (vi.mock), server Fastify dijalankan tanpa jaringan (app.inject), satpam SUNGGUHAN (keamanan.ts) ikut dipasang seperti di
// aturan.test.ts: tamu 401, viewer 403, admin 200. Juga kode jawaban saat Telegram mati (409), menolak (502), dan saat
// database tidak bisa dibaca (503). Jalankan: npm test
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => { // env.ts memeriksa .env saat diimpor: beri setelan palsu yang sah (tidak ada yang benar-benar dihubungi)
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://tiruan:tiruan@127.0.0.1:1/tiruan";
  process.env.JWT_SECRET = "rahasia-uji-yang-cukup-panjang-untuk-zod-0123456789";
});

// layanan laporan tiruan: mengingat apa yang diminta, menjawab sesuai "keadaan" yang diatur tiap tes
const tiruan = vi.hoisted(() => ({
  keadaan: "terkirim" as "terkirim" | "mati" | "ditolak" | "database-mati",
  diminta: [] as boolean[], // nilai hariIni setiap panggilan
}));
vi.mock("../services/laporan.ts", () => ({
  kirimLaporan: async (hariIni: boolean) => {
    tiruan.diminta.push(hariIni);
    if (tiruan.keadaan === "database-mati") throw new Error("connect ECONNREFUSED 127.0.0.1:5432");
    if (tiruan.keadaan === "mati") return { status: "dilewati", pesan: "Telegram mati (TELEGRAM_BOT_TOKEN belum diisi)" };
    if (tiruan.keadaan === "ditolak") {
      return { status: "gagal", pesan: "Telegram tidak menerima laporan-2026-10-26.csv; lihat log backend" };
    }
    return hariIni
      ? { status: "terkirim", berkas: "laporan-2026-10-27-sementara.csv", perangkat: 2, ukuran_byte: 260, keterangan: "📊 …",
        rentang: { dari: new Date("2026-10-26T17:00:00Z"), sampai: new Date("2026-10-27T03:15:42.123Z"), tanggal: "2026-10-27",
          hariIni } }
      : { status: "terkirim", berkas: "laporan-2026-10-26.csv", perangkat: 3, ukuran_byte: 398, keterangan: "📊 …",
        rentang: { dari: new Date("2026-10-25T17:00:00Z"), sampai: new Date("2026-10-26T17:00:00Z"), tanggal: "2026-10-26",
          hariIni } };
  },
}));

import Fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { pasangKeamanan } from "../auth/keamanan.ts";
import { ruteLaporan } from "./laporan.ts";

const app = Fastify();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
await pasangKeamanan(app); // CORS, cookie, JWT, dan satpam yang sama dengan server.ts
await app.register(ruteLaporan);
await app.ready();
afterAll(() => app.close());

// "gelang" (JWT akses) yang sah karena ditandatangani dengan JWT_SECRET tes di atas, dikirim sebagai cookie akses
const gelang = (peran: "admin" | "viewer") => ({ akses: app.jwt.sign({ sub: peran === "admin" ? "1" : "2", peran, sid: 1 }) });
const kirim = (url: string, peran?: "admin" | "viewer") =>
  app.inject({ method: "POST", url, ...(peran === undefined ? {} : { cookies: gelang(peran) }) });

beforeEach(() => {
  tiruan.keadaan = "terkirim";
  tiruan.diminta = [];
});

describe("POST /laporan/kirim", () => {
  it("tamu 401 dan viewer 403: laporan tidak dibuat sama sekali", async () => {
    expect((await kirim("/laporan/kirim")).statusCode).toBe(401);
    const jawab = await kirim("/laporan/kirim", "viewer");
    expect(jawab.statusCode).toBe(403);
    expect(jawab.json()).toEqual({ pesan: "akun viewer hanya boleh melihat; perintah dan perubahan khusus admin" });
    expect(tiruan.diminta).toEqual([]);
  });

  it("admin tanpa pilihan: laporan kemarin (sama dengan laporan terjadwal), waktu dalam UTC", async () => {
    const jawab = await kirim("/laporan/kirim", "admin");
    expect(jawab.statusCode).toBe(200);
    expect(jawab.json()).toEqual({ berkas: "laporan-2026-10-26.csv", dari: "2026-10-25T17:00:00Z",
      sampai: "2026-10-26T17:00:00Z", perangkat: 3, ukuran_byte: 398, keterangan: "📊 …" });
    expect(tiruan.diminta).toEqual([false]);
  });

  it("?hari=ini: laporan sementara hari ini; ?hari=kemarin sama dengan tanpa pilihan; ?hari=besok 400", async () => {
    const ini = await kirim("/laporan/kirim?hari=ini", "admin");
    expect(ini.statusCode).toBe(200);
    expect(ini.json()).toMatchObject({ berkas: "laporan-2026-10-27-sementara.csv", sampai: "2026-10-27T03:15:42Z" });
    expect((await kirim("/laporan/kirim?hari=kemarin", "admin")).statusCode).toBe(200);
    expect((await kirim("/laporan/kirim?hari=besok", "admin")).statusCode).toBe(400);
    expect(tiruan.diminta).toEqual([true, false]);
  });

  it("Telegram mati 409, Telegram menolak 502, database mati 503: semuanya dengan pesan untuk manusia", async () => {
    tiruan.keadaan = "mati";
    const mati = await kirim("/laporan/kirim", "admin");
    expect(mati.statusCode).toBe(409);
    expect(mati.json()).toEqual({ pesan: "laporan tidak dikirim: Telegram mati (TELEGRAM_BOT_TOKEN belum diisi)" });
    tiruan.keadaan = "ditolak";
    expect((await kirim("/laporan/kirim", "admin")).statusCode).toBe(502);
    tiruan.keadaan = "database-mati";
    const db = await kirim("/laporan/kirim", "admin");
    expect(db.statusCode).toBe(503);
    expect(db.json()).toEqual({ pesan: "database sedang tidak bisa dihubungi, coba lagi sebentar lagi" });
  });
});
