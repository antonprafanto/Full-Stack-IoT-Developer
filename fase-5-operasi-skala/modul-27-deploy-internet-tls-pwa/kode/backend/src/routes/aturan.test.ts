// aturan.test.ts - uji rute DELETE /rules/:id (Modul 24) TANPA database, MQTT, atau jadwal: otomasi.ts dan jadwal.ts diganti
// tiruan (vi.mock), server Fastify dijalankan tanpa jaringan (app.inject). Berbeda dengan perangkat.test.ts, di sini satpam
// SUNGGUHAN (keamanan.ts) ikut dipasang, supaya terbukti bahwa rute baru otomatis ikut dijaga: tamu 401, viewer 403, halaman
// asing 403, dan browser dari halaman di CORS_ORIGIN boleh mengirim DELETE (preflight). Jalankan: npm test
import { afterAll, describe, expect, it, vi } from "vitest";

vi.hoisted(() => { // env.ts memeriksa .env saat diimpor: beri setelan palsu yang sah (tidak ada yang benar-benar dihubungi)
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://tiruan:tiruan@127.0.0.1:1/tiruan";
  process.env.JWT_SECRET = "rahasia-uji-yang-cukup-panjang-untuk-zod-0123456789";
  process.env.CORS_ORIGIN = "http://localhost:5173"; // halaman dashboard (Vite) yang boleh memanggil API dari browser
});

// tabel rules tiruan: nomor -> nama aturan
const tabel = vi.hoisted(() => new Map<number, string>([[1, "Siram jika tanah < 30 %"], [2, "Kipas otomatis"]]));
vi.mock("../services/otomasi.ts", () => ({
  semuaAturan: () => [],
  cariAturan: () => undefined,
  buatAturan: async () => { throw new Error("tidak dipakai di tes ini"); },
  gantiAturan: async () => undefined,
  hapusAturan: async (id: number) => { // seperti hapusAturanDb: nomor dan nama yang terhapus, atau undefined
    const nama = tabel.get(id);
    if (nama === undefined) return undefined;
    tabel.delete(id);
    return { id, nama };
  },
}));
vi.mock("../services/jadwal.ts", () => ({
  jadwalBerikutnya: () => null,
  jalankanJadwal: async () => { throw new Error("tidak dipakai di tes ini"); },
}));

import Fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { pasangKeamanan } from "../auth/keamanan.ts";
import { ruteAturan } from "./aturan.ts";

const app = Fastify();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
await pasangKeamanan(app); // CORS, cookie, JWT, dan satpam yang sama dengan server.ts
await app.register(ruteAturan);
await app.ready();
afterAll(() => app.close());

// "gelang" (JWT akses) yang sah karena ditandatangani dengan JWT_SECRET tes di atas, dikirim sebagai cookie akses
const gelang = (peran: "admin" | "viewer") => ({ akses: app.jwt.sign({ sub: peran === "admin" ? "1" : "2", peran, sid: 1 }) });
const DASHBOARD = "http://localhost:5173";

describe("DELETE /rules/:id", () => {
  it("tamu (belum login): 401, aturannya tetap ada", async () => {
    const jawab = await app.inject({ method: "DELETE", url: "/rules/1" });
    expect(jawab.statusCode).toBe(401);
    expect(tabel.has(1)).toBe(true);
  });

  it("viewer: boleh melihat daftar aturan (200), tetapi menghapus dijawab 403 dan aturannya tetap ada", async () => {
    expect((await app.inject({ method: "GET", url: "/rules", cookies: gelang("viewer") })).statusCode).toBe(200);
    const jawab = await app.inject({ method: "DELETE", url: "/rules/1", cookies: gelang("viewer") });
    expect(jawab.statusCode).toBe(403);
    expect(jawab.json()).toEqual({ pesan: "akun viewer hanya boleh melihat; perintah dan perubahan khusus admin" });
    expect(tabel.has(1)).toBe(true);
  });

  it("admin: 200 dengan nomor, nama, dan pesan; dihapus sekali lagi: 404", async () => {
    const jawab = await app.inject({ method: "DELETE", url: "/rules/1", cookies: gelang("admin") });
    expect(jawab.statusCode).toBe(200);
    expect(jawab.json()).toEqual({ id: 1, nama: "Siram jika tanah < 30 %", pesan: "aturan 1 (Siram jika tanah < 30 %) dihapus" });
    const lagi = await app.inject({ method: "DELETE", url: "/rules/1", cookies: gelang("admin") });
    expect(lagi.statusCode).toBe(404);
    expect(lagi.json()).toEqual({ pesan: "aturan 1 tidak ada" });
  });

  it("nomor aturan bukan angka: 400", async () => {
    expect((await app.inject({ method: "DELETE", url: "/rules/abc", cookies: gelang("admin") })).statusCode).toBe(400);
  });

  it("browser dari halaman asing: 403 walaupun admin, aturannya tetap ada", async () => {
    const jawab = await app.inject({ method: "DELETE", url: "/rules/2", cookies: gelang("admin"),
      headers: { origin: "http://contoh-asing.test" } });
    expect(jawab.statusCode).toBe(403);
    expect(jawab.json()).toEqual({ pesan: "permintaan dari halaman http://contoh-asing.test ditolak" });
    expect(tabel.has(2)).toBe(true);
  });

  it("browser dari dashboard (CORS_ORIGIN): preflight mengizinkan DELETE, lalu permintaannya diterima", async () => {
    const preflight = await app.inject({ method: "OPTIONS", url: "/rules/2",
      headers: { origin: DASHBOARD, "access-control-request-method": "DELETE" } });
    expect(preflight.statusCode).toBe(204);
    expect(preflight.headers["access-control-allow-methods"]).toBe("GET, HEAD, POST, PUT, DELETE");
    const jawab = await app.inject({ method: "DELETE", url: "/rules/2", cookies: gelang("admin"), headers: { origin: DASHBOARD } });
    expect(jawab.statusCode).toBe(200);
    expect(jawab.headers["access-control-allow-origin"]).toBe(DASHBOARD);
    expect(tabel.has(2)).toBe(false);
  });
});
