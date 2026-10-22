// auth.ts - rute /auth (Modul 20): login, refresh, logout, dan "siapa saya". JWT akses (15 menit) dan refresh token
// (7 hari) dikirim sebagai cookie httpOnly, tidak pernah di isi jawaban, jadi JavaScript di halaman tidak bisa membacanya.
// Tantangan Tingkat 2: POST /auth/logout-semua, keluar dari semua perangkat sekaligus (misalnya saat HP hilang).
import { z } from "zod";
import type { FastifyReply } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { COOKIE_AKSES, COOKIE_SESI, OPSI_AKSES, OPSI_SESI } from "../auth/keamanan.ts";
import { cocokkanSandi } from "../auth/sandi.ts";
import { buatTokenSesi, hashToken, nilaiTokenLama, UMUR_SESI_DETIK } from "../auth/token.ts";
import {
  ambilPengguna, buatSesi, cariSesiTokenLama, cariUntukLogin, hapusSemuaSesi, hapusSesi, hapusSesiDenganToken, putarSesi,
} from "../db/pengguna.ts";
import type { Pengguna } from "../db/pengguna.ts";
import { putuskanSesi } from "../services/realtime.ts";

const Galat = z.object({ pesan: z.string() });
const Profil = z.object({
  id: z.number(), email: z.string(), nama: z.string(), peran: z.enum(["admin", "viewer"]),
}).describe("akun yang sedang login");
const Masuk = z.object({
  email: z.email("email tidak sah").max(254).describe("email akun, misalnya budi@rumah.test"),
  sandi: z.string().min(1).max(200).describe("kata sandi akun"),
});

const profil = (p: Pengguna) => ({ id: p.id, email: p.email, nama: p.nama, peran: p.peran });

// tanda tangani JWT akses baru, lalu taruh di cookie "akses"
async function pasangAkses(reply: FastifyReply, p: Pengguna, sid: number): Promise<void> {
  const token = await reply.jwtSign({ sub: String(p.id), peran: p.peran, sid });
  reply.setCookie(COOKIE_AKSES, token, OPSI_AKSES);
}

// kosongkan kedua cookie (atribut sama dengan saat dipasang; clearCookie sendiri mengisi Max-Age=0)
function hapusCookie(reply: FastifyReply): void {
  reply.clearCookie(COOKIE_AKSES, OPSI_AKSES).clearCookie(COOKIE_SESI, OPSI_SESI);
}

const TERBUKA = { security: [] }; // Swagger: rute ini tidak butuh cookie (tanpa gembok)

export const ruteAuth: FastifyPluginAsyncZod = async (app) => {
  app.post("/auth/login", {
    config: { rateLimit: { max: 10, timeWindow: 60_000 } }, // percobaan ke-11 dalam semenit dari IP yang sama: 429
    schema: {
      tags: ["akun"], ...TERBUKA,
      summary: "Login dengan email dan sandi; hasilnya dua cookie httpOnly (akses 15 menit, sesi 7 hari)",
      body: Masuk,
      response: {
        200: Profil,
        401: Galat.describe("email atau sandi salah (sengaja tidak dibedakan)"),
        429: z.object({ statusCode: z.number(), error: z.string(), message: z.string() })
          .describe("lebih dari 10 percobaan login dalam semenit dari alamat IP yang sama"),
        503: Galat.describe("database sedang tidak bisa dihubungi"),
      },
    },
  }, async (req, reply) => {
    const email = req.body.email.toLowerCase();
    try {
      const akun = await cariUntukLogin(email);
      const cocok = await cocokkanSandi(req.body.sandi, akun?.sandi_hash); // akun tidak ada: tetap dihitung, hasil false
      if (akun === undefined || !cocok) {
        req.log.warn(`login gagal: ${akun === undefined ? "email tidak terdaftar" : `akun ${akun.id}`} (IP ${req.ip})`);
        return reply.code(401).send({ pesan: "email atau sandi salah" });
      }
      const tokenSesi = buatTokenSesi();
      const sid = await buatSesi(akun.id, hashToken(tokenSesi), UMUR_SESI_DETIK);
      await pasangAkses(reply, akun, sid);
      reply.setCookie(COOKIE_SESI, tokenSesi, OPSI_SESI);
      req.log.info(`login: akun ${akun.id} (${akun.peran}), sesi ${sid}, IP ${req.ip}`);
      return profil(akun);
    } catch (galat) {
      req.log.error(`login gagal diproses: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: "database sedang tidak bisa dihubungi, coba lagi sebentar lagi" });
    }
  });

  app.post("/auth/refresh", {
    schema: {
      tags: ["akun"], ...TERBUKA,
      summary: "Tukar cookie sesi dengan JWT akses baru (cookie sesi ikut diganti: rotasi)",
      response: {
        200: Profil,
        401: Galat.describe("cookie sesi tidak ada, kedaluwarsa, sudah logout, atau dicabut: login lagi"),
      },
    },
  }, async (req, reply) => {
    const token = req.cookies[COOKIE_SESI];
    if (token === undefined || token === "") return reply.code(401).send({ pesan: "belum login: cookie sesi tidak ada" });
    const hash = hashToken(token);
    const tokenBaru = buatTokenSesi();
    const sesi = await putarSesi(hash, hashToken(tokenBaru));
    if (sesi !== undefined) {
      const akun = await ambilPengguna(sesi.pengguna_id); // peran dibaca lagi dari database: perubahan peran berlaku di sini
      if (akun !== undefined) {
        reply.setCookie(COOKIE_SESI, tokenBaru,
          { ...OPSI_SESI, maxAge: Math.floor((sesi.kedaluwarsa.getTime() - Date.now()) / 1000) }); // sisa umur sesi
        await pasangAkses(reply, akun, sesi.id);
        return profil(akun);
      }
    } else {
      const lama = await cariSesiTokenLama(hash);
      if (lama !== undefined && nilaiTokenLama(lama.diperbarui, Date.now()) === "toleransi") {
        const akun = await ambilPengguna(lama.pengguna_id); // permintaan bersamaan: cukup gelang baru, sesi tetap
        if (akun !== undefined) {
          await pasangAkses(reply, akun, lama.id);
          return profil(akun);
        }
      } else if (lama !== undefined) {
        await hapusSesi(lama.id);
        putuskanSesi(lama.id); // Modul 20 Praktik 7: sambungan Socket.IO sesi itu ikut diputus
        req.log.warn(`refresh token lama sesi ${lama.id} (akun ${lama.pengguna_id}) dipakai lagi: sesi dicabut (IP ${req.ip})`);
      }
    }
    hapusCookie(reply);
    return reply.code(401).send({ pesan: "sesi sudah tidak berlaku: silakan login lagi" });
  });

  app.post("/auth/logout", {
    schema: {
      tags: ["akun"], ...TERBUKA,
      summary: "Logout: sesi di database dihapus, kedua cookie dikosongkan, sambungan Socket.IO sesi ini diputus",
      response: { 200: Galat.describe("selalu berhasil, juga kalau memang belum login") },
    },
  }, async (req, reply) => {
    const token = req.cookies[COOKIE_SESI];
    let sid = token ? await hapusSesiDenganToken(hashToken(token)) : undefined;
    if (sid === undefined) { // cookie sesi tidak terbawa? coba nomor sesi dari gelang akses yang masih sah
      try {
        await req.jwtVerify(); // isi gelang masuk ke req.user
        sid = req.user.sid;
        await hapusSesi(sid);
      } catch { /* tidak login: tidak ada yang perlu dihapus */ }
    }
    if (sid !== undefined) {
      putuskanSesi(sid); // Modul 20 Praktik 7: sambungan Socket.IO sesi ini ikut diputus
      req.log.info(`logout: sesi ${sid}`);
    }
    hapusCookie(reply);
    return { pesan: "sudah logout" };
  });

  // Tantangan Tingkat 2: rute BERGEMBOK (tanpa TERBUKA, tidak ada di RUTE_TERBUKA), hanya untuk yang sedang login.
  app.post("/auth/logout-semua", {
    schema: {
      tags: ["akun"],
      summary: "Logout dari semua perangkat: semua sesi akun ini dicabut, semua sambungan Socket.IO-nya diputus",
      response: {
        200: z.object({ pesan: z.string(), jumlah: z.number().describe("berapa sesi yang dicabut") })
          .describe("semua sesi akun ini sudah dicabut, kedua cookie dikosongkan"),
      },
    },
  }, async (req, reply) => {
    const penggunaId = Number(req.user.sub); // req.user diisi satpam dari gelang yang sah; sub berupa teks
    const nomorSesi = await hapusSemuaSesi(penggunaId); // hapus dulu: sambungan yang diputus tidak bisa refresh lagi
    for (const sid of nomorSesi) putuskanSesi(sid); // setiap sesi punya room Socket.IO sendiri ("sesi:<sid>")
    hapusCookie(reply); // sama dengan POST /auth/logout
    req.log.info(`logout semua: akun ${penggunaId}, ${nomorSesi.length} sesi dicabut`);
    return { pesan: "semua sesi akun ini sudah dicabut", jumlah: nomorSesi.length };
  });

  app.get("/auth/me", {
    schema: {
      tags: ["akun"],
      summary: "Siapa yang sedang login (dibaca dari database, bukan dari isi JWT)",
      response: { 200: Profil, 401: Galat.describe("belum login, atau akunnya sudah dihapus") },
    },
  }, async (req, reply) => {
    const akun = await ambilPengguna(Number(req.user.sub)); // req.user diisi satpam dari gelang yang sah
    if (akun === undefined) return reply.code(401).send({ pesan: "akun ini sudah tidak ada" });
    return profil(akun);
  });
};
