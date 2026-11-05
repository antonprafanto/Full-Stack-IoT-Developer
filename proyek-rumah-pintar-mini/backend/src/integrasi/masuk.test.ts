// masuk.test.ts - tes INTEGRASI login (Modul 20) dengan tabel users dan sesi SUNGGUHAN (Modul 29).
// Yang tidak bisa diuji tiruan: bcrypt mencocokkan sandi dengan sidik jari yang tersimpan, sesi (refresh token) tersimpan
// hanya sebagai SHA-256-nya, rotasi refresh dalam SATU perintah UPDATE, dan logout yang benar-benar menghapus barisnya.
// Jalankan (database uji menyala, DATABASE_URL_UJI terisi; lihat siapkan.ts): npm run test:integrasi
import { createHash } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { adaDatabaseUji, siapkanUji } from "./siapkan.ts";
import type { Uji } from "./siapkan.ts";

// akun milik berkas ini saja; domain .test memang disediakan untuk uji (tidak pernah ada di internet)
const EMAIL = "uji-integrasi-masuk@rumah.test";
const SANDI = "kalimat sandi khusus tes integrasi";
const sha256 = (teks: string) => createHash("sha256").update(teks).digest("hex");

// satu cookie dari jawaban (light-my-request sudah membaca kepala Set-Cookie-nya)
function cookie(jawab: { cookies: { name: string; value: string }[] }, nama: string): string {
  const ketemu = jawab.cookies.find((c) => c.name === nama);
  if (ketemu === undefined) throw new Error(`cookie ${nama} tidak ada di jawaban`);
  return ketemu.value;
}

describe.skipIf(!adaDatabaseUji)("integrasi (database uji): login, refresh, logout", () => {
  let uji: Uji;
  let sidikSandi = ""; // sidik jari bcrypt SANDI, dibuat sekali (bcrypt sengaja lambat: ±0,3 detik)
  const masuk = (email: string, sandi: string) => uji.app.inject({ method: "POST", url: "/auth/login", payload: { email, sandi } });
  const sesiAkun = () => uji.pool.query<{ token_hash: string; token_lama: string | null }>(
    "SELECT s.token_hash, s.token_lama FROM sesi s JOIN users u ON u.id = s.pengguna_id WHERE u.email = $1", [EMAIL]);

  beforeAll(async () => {
    uji = await siapkanUji();
    const { buatSidikJari } = await import("../auth/sandi.ts"); // fungsi yang sama dengan npm run pengguna (cost 12)
    sidikSandi = await buatSidikJari(SANDI);
  }, 60_000);
  beforeEach(async () => { // akun baru untuk setiap tes; sesi lamanya ikut terhapus (ON DELETE CASCADE)
    await uji.pool.query("DELETE FROM users WHERE email = $1", [EMAIL]);
    await uji.pool.query(
      "INSERT INTO users (email, nama, peran, sandi_hash, sandi_diubah) VALUES ($1, 'Uji Masuk', 'viewer', $2, now())",
      [EMAIL, sidikSandi]);
  });
  afterAll(async () => {
    if (!uji) return; // siapkanUji() gagal: galatnya sudah dilaporkan
    await uji.pool.query("DELETE FROM users WHERE email = $1", [EMAIL]);
    await uji.tutup();
  });

  it("sandi benar: dua cookie httpOnly, sesi tersimpan di database hanya sebagai SHA-256 refresh token", async () => {
    const jawab = await masuk(EMAIL, SANDI);
    expect(jawab.statusCode).toBe(200);
    expect(jawab.json()).toMatchObject({ email: EMAIL, peran: "viewer" });
    expect(jawab.cookies.find((c) => c.name === "akses")).toMatchObject({ httpOnly: true, path: "/" });
    expect(jawab.cookies.find((c) => c.name === "sesi")).toMatchObject({ httpOnly: true, path: "/auth" });

    const sesi = await sesiAkun();
    expect(sesi.rows).toEqual([{ token_hash: sha256(cookie(jawab, "sesi")), token_lama: null }]);
    // gelang dari login ini membuka rute bergembok: /auth/me membaca akunnya dari database
    const saya = await uji.app.inject({ method: "GET", url: "/auth/me", cookies: { akses: cookie(jawab, "akses") } });
    expect(saya.json()).toMatchObject({ email: EMAIL, nama: "Uji Masuk" });
  });

  it("sandi salah dan email tak terdaftar: 401 yang sama, tanpa cookie dan tanpa sesi baru", async () => {
    const salah = await masuk(EMAIL, "bukan sandi akun ini sama sekali");
    const asing = await masuk("tidak-terdaftar@rumah.test", SANDI);
    expect(salah.statusCode).toBe(401);
    expect(asing.statusCode).toBe(401);
    expect(asing.json()).toEqual(salah.json()); // jawabannya sama: penebak tidak tahu email mana yang terdaftar
    expect(salah.cookies).toEqual([]);
    expect((await sesiAkun()).rowCount).toBe(0);
  });

  it("refresh: cookie sesi ditukar yang baru (rotasi); database menyimpan sidik token baru dan token lama", async () => {
    const login = await masuk(EMAIL, SANDI);
    const sesiLama = cookie(login, "sesi");
    const segar = await uji.app.inject({ method: "POST", url: "/auth/refresh", cookies: { sesi: sesiLama } });
    expect(segar.statusCode).toBe(200);

    const sesiBaru = cookie(segar, "sesi");
    expect(sesiBaru).not.toBe(sesiLama);
    expect((await sesiAkun()).rows).toEqual([{ token_hash: sha256(sesiBaru), token_lama: sha256(sesiLama) }]);
  });

  it("logout: baris sesi dihapus, kedua cookie dikosongkan, cookie sesi lama tidak bisa refresh lagi", async () => {
    const sesi = cookie(await masuk(EMAIL, SANDI), "sesi");
    const keluar = await uji.app.inject({ method: "POST", url: "/auth/logout", cookies: { sesi } });
    expect(keluar.statusCode).toBe(200);
    expect(cookie(keluar, "akses")).toBe("");
    expect(cookie(keluar, "sesi")).toBe("");
    expect((await sesiAkun()).rowCount).toBe(0);

    const lagi = await uji.app.inject({ method: "POST", url: "/auth/refresh", cookies: { sesi } });
    expect(lagi.statusCode).toBe(401);
  });
});
