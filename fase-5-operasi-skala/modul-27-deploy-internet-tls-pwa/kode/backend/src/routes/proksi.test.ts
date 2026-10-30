// proksi.test.ts - uji TRUST_PROXY (Modul 27): backend di balik Caddy HTTPS. Rute login SUNGGUHAN (auth.ts) dan pengaman
// SUNGGUHAN (keamanan.ts: cookie, pembatas login, satpam) tanpa database: pengguna.ts, sandi.ts, dan realtime.ts diganti
// tiruan (vi.mock), server Fastify dijalankan tanpa jaringan (app.inject). "Caddy" = permintaan dari alamat lorong Docker
// 172.19.0.4 yang membawa X-Forwarded-For (alamat tamu) dan X-Forwarded-Proto: https, seperti yang ditambahkan Caddy
// sungguhan (lab Modul 27). Jalankan: npm test
import { afterAll, describe, expect, it, vi } from "vitest";

vi.hoisted(() => { // env.ts memeriksa .env saat diimpor: beri setelan palsu yang sah (tidak ada yang benar-benar dihubungi)
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://tiruan:tiruan@127.0.0.1:1/tiruan";
  process.env.JWT_SECRET = "rahasia-uji-yang-cukup-panjang-untuk-zod-0123456789";
  process.env.CORS_ORIGIN = "https://iot.namaanda.my.id"; // dashboard di internet (Modul 27)
  process.env.TRUST_PROXY = "uniquelocal"; // nilai bawaan compose.cloud.yml
});

// satu akun tiruan; sandi "benar" hanya satu (tanpa bcrypt: tes tetap cepat)
vi.mock("../db/pengguna.ts", () => ({
  cariUntukLogin: async (email: string) => (email === "budi@rumah.test"
    ? { id: 1, email, nama: "Budi", peran: "admin", sandi_hash: "sidik-tiruan" } : undefined),
  buatSesi: async () => 7,
  ambilPengguna: async () => undefined,
  putarSesi: async () => undefined,
  cariSesiTokenLama: async () => undefined,
  hapusSesi: async () => {},
  hapusSesiDenganToken: async () => undefined,
}));
vi.mock("../auth/sandi.ts", () => ({
  cocokkanSandi: async (sandi: string, sidik: string | null | undefined) => sidik === "sidik-tiruan" && sandi === "sandi-benar",
}));
vi.mock("../services/realtime.ts", () => ({ putuskanSesi: () => {} }));

import Fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { env } from "../config/env.ts";
import { pasangKeamanan } from "../auth/keamanan.ts";
import { ruteAuth } from "./auth.ts";

// server seperti server.ts: dengan trustProxy dari TRUST_PROXY (v1.4), atau tanpa trustProxy sama sekali (v1.3)
async function buatServer(trustProxy: typeof env.TRUST_PROXY) {
  const app = Fastify({ trustProxy });
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  await pasangKeamanan(app);
  await app.register(ruteAuth);
  await app.ready();
  return app;
}
const v14 = await buatServer(env.TRUST_PROXY);
const v13 = await buatServer(false);
afterAll(async () => { await v14.close(); await v13.close(); });

const CADDY = "172.19.0.4"; // alamat kontainer web (Caddy) di lorong Docker: alamat privat = uniquelocal
// login lewat "Caddy": tamu di alamat internet tamuIp, halaman HTTPS dari domain dashboard
const lewatCaddy = (app: typeof v14, tamuIp: string, sandi: string, proto = "https") => app.inject({
  method: "POST", url: "/auth/login", remoteAddress: CADDY,
  headers: { "x-forwarded-for": tamuIp, "x-forwarded-proto": proto, origin: "https://iot.namaanda.my.id" },
  payload: { email: "budi@rumah.test", sandi },
});
const cookie = (jawab: Awaited<ReturnType<typeof lewatCaddy>>, nama: string) =>
  ([] as string[]).concat(jawab.headers["set-cookie"] ?? []).find((baris) => baris.startsWith(`${nama}=`)) ?? "";

describe("TRUST_PROXY=uniquelocal (backend 1.4.0 di balik Caddy)", () => {
  it("setelan terbaca sebagai daftar [uniquelocal]", () => {
    expect(env.TRUST_PROXY).toEqual(["uniquelocal"]);
  });

  it("halaman HTTPS: kedua cookie login (akses dan sesi) ber-Secure", async () => {
    const jawab = await lewatCaddy(v14, "203.0.113.10", "sandi-benar");
    expect(jawab.statusCode).toBe(200);
    expect(cookie(jawab, "akses")).toMatch(/; HttpOnly; Secure; SameSite=Strict$/);
    expect(cookie(jawab, "sesi")).toMatch(/; Path=\/auth; HttpOnly; Secure; SameSite=Strict$/);
  });

  it("halaman HTTP (mode rumah http://localhost): cookie tanpa Secure, supaya tetap bisa login", async () => {
    const jawab = await lewatCaddy(v14, "192.168.1.20", "sandi-benar", "http");
    expect(jawab.statusCode).toBe(200);
    expect(cookie(jawab, "akses")).not.toContain("Secure");
  });

  it("tamu yang datang LANGSUNG (bukan lewat penerus privat) tidak bisa mengaku-aku HTTPS lewat header palsu", async () => {
    const jawab = await v14.inject({
      method: "POST", url: "/auth/login", remoteAddress: "203.0.113.66",
      headers: { "x-forwarded-for": "198.51.100.1", "x-forwarded-proto": "https" },
      payload: { email: "budi@rumah.test", sandi: "sandi-benar" },
    });
    expect(jawab.statusCode).toBe(200);
    expect(cookie(jawab, "akses")).not.toContain("Secure");
  });

  it("10 login salah dari tamu A: percobaan ke-11 A dijawab 429, tamu B (alamat lain) tetap bisa login", async () => {
    for (let i = 0; i < 10; i++) expect((await lewatCaddy(v14, "203.0.113.21", "salah")).statusCode).toBe(401);
    const a = await lewatCaddy(v14, "203.0.113.21", "salah");
    expect(a.statusCode).toBe(429);
    expect(a.json().message).toMatch(/^terlalu banyak percobaan: coba lagi dalam \d+ detik$/);
    expect((await lewatCaddy(v14, "203.0.113.22", "sandi-benar")).statusCode).toBe(200);
  });
});

describe("tanpa trustProxy (perilaku backend 1.3.0 di balik Caddy, alasan Modul 27)", () => {
  it("halaman HTTPS tetapi cookie TANPA Secure: backend hanya melihat sambungan HTTP dari Caddy", async () => {
    const jawab = await lewatCaddy(v13, "203.0.113.10", "sandi-benar");
    expect(jawab.statusCode).toBe(200);
    expect(cookie(jawab, "akses")).not.toContain("Secure");
  });

  it("semua tamu dianggap satu alamat (Caddy): sesudah 10 login salah tamu A, tamu B ikut dijawab 429", async () => {
    const baru = await buatServer(false); // hitungan pembatas login mulai dari nol
    for (let i = 0; i < 10; i++) expect((await lewatCaddy(baru, "203.0.113.31", "salah")).statusCode).toBe(401);
    expect((await lewatCaddy(baru, "203.0.113.31", "salah")).statusCode).toBe(429);
    expect((await lewatCaddy(baru, "203.0.113.32", "sandi-benar")).statusCode).toBe(429);
    await baru.close();
  });
});
