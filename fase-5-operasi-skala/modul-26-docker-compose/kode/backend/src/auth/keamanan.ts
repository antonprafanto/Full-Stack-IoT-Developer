// keamanan.ts - pengaman API (Modul 20): CORS, cookie, JWT ("gelang konser"), rate limit, dan "satpam" yang memeriksa
// SETIAP permintaan HTTP: asal halaman (Origin), wajib login (kecuali daftar rute terbuka), dan akun viewer hanya boleh
// melihat.
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import { env } from "../config/env.ts";
import type { Peran } from "../db/pengguna.ts";
import { UMUR_AKSES_DETIK, UMUR_SESI_DETIK } from "./token.ts";

// isi "gelang" (JWT akses): nomor akun (sub), perannya, dan nomor sesi (sid). Bukan rahasia: siapa pun yang memegang
// token bisa membaca isinya, jadi jangan menaruh email, nama, atau data pribadi lain di sini.
export interface IsiToken {
  sub: string;
  peran: Peran;
  sid: number;
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: IsiToken; // yang ditandatangani reply.jwtSign
    user: IsiToken & { iat: number; exp: number }; // yang dibaca req.jwtVerify ke req.user
  }
}

export const COOKIE_AKSES = "akses";
export const COOKIE_SESI = "sesi";

// httpOnly: JavaScript di halaman tidak bisa membaca cookie (pencuri lewat XSS tidak mendapat token).
// sameSite strict: browser tidak mengirim cookie pada permintaan yang dipicu situs lain (CSRF).
// secure auto: atribut Secure dipasang kalau permintaannya lewat HTTPS (Fase 5); di http://127.0.0.1 tidak.
const DASAR = { httpOnly: true, sameSite: "strict", secure: "auto" } as const;
export const OPSI_AKSES = { ...DASAR, path: "/", maxAge: UMUR_AKSES_DETIK }; // path "/" WAJIB: tanpa itu hanya /auth/...
export const OPSI_SESI = { ...DASAR, path: "/auth", maxAge: UMUR_SESI_DETIK }; // hanya dikirim ke /auth/...

// Rute yang boleh diketuk TANPA login. Semua rute lain wajib login, termasuk rute baru yang kelak ditambahkan.
export const RUTE_TERBUKA = new Set([
  "POST /auth/login", "POST /auth/refresh", "POST /auth/logout",
  "GET /health", "HEAD /health", // HEAD: healthcheck Docker Compose (Modul 26) mengetuk HEAD /health
]);
const MEMBACA = new Set(["GET", "HEAD"]); // satu-satunya metode yang boleh dipakai akun viewer
// Halaman web (origin) yang boleh MENGUBAH sesuatu lewat browser: daftar CORS + server ini sendiri (Swagger UI di /docs).
export const ASAL_BOLEH = new Set([...env.CORS_ORIGIN, `http://${env.HOST}:${env.PORT}`, `http://localhost:${env.PORT}`]);

export async function pasangKeamanan(app: FastifyInstance): Promise<void> {
  // CORS dipasang PALING DULU: preflight (OPTIONS) dari browser tidak membawa cookie, jadi harus dijawab sebelum satpam.
  await app.register(cors, {
    origin: env.CORS_ORIGIN, // daftar persis, bukan "*": dengan credentials, "*" ditolak browser
    credentials: true, // izinkan browser mengirim cookie dari halaman di origin itu
    // bawaan plugin hanya GET, HEAD, POST. PUT /rules/:id (Modul 19) dan DELETE /rules/:id (Modul 24) harus ditulis di sini:
    // tanpa itu browser sudah menolak di tahap preflight, walaupun rutenya ada (curl dan Bruno tidak terpengaruh)
    methods: ["GET", "HEAD", "POST", "PUT", "DELETE"],
  });
  await app.register(cookie); // tanpa secret: JWT sudah bertanda tangan, refresh token dicek ke database
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: { cookieName: COOKIE_AKSES, signed: false },
    sign: { expiresIn: UMUR_AKSES_DETIK }, // angka = detik (900); teks seperti "1h30m" ditolak sejak 10.2.3
    verify: { onlyCookie: true }, // gelang hanya dibaca dari cookie, bukan dari header Authorization
  });
  await app.register(rateLimit, {
    global: false, // hanya rute yang memintanya (POST /auth/login); hitungan disimpan di memori: restart = mulai dari nol
    errorResponseBuilder: (_req, konteks) => Object.assign(
      new Error(`terlalu banyak percobaan: coba lagi dalam ${Math.ceil(konteks.ttl / 1000)} detik`),
      { statusCode: konteks.statusCode }, // 429
    ),
  });
  app.addHook("onRequest", satpam); // satu satpam di pintu depan: berlaku untuk SEMUA rute
}

async function satpam(req: FastifyRequest, reply: FastifyReply) {
  // CSRF: <form> di halaman lain pada host yang sama (misalnya aplikasi lain di http://127.0.0.1:3000) tetap membawa
  // cookie SameSite=Strict karena masih satu "site". Browser selalu menulis header Origin pada POST/PUT; curl, Bruno, dan
  // Node tidak menulisnya, jadi mereka tidak terganggu.
  const asal = req.headers.origin;
  if (!MEMBACA.has(req.method) && asal !== undefined && !ASAL_BOLEH.has(asal)) {
    req.log.warn(`ditolak (403): ${req.method} ${req.url} dari halaman ${asal}`);
    return reply.code(403).send({ pesan: `permintaan dari halaman ${asal} ditolak` });
  }
  const url = req.routeOptions.url; // pola rute, misalnya /devices/:id/command (undefined = tidak ada: tamu 401, sudah login 404)
  if (RUTE_TERBUKA.has(`${req.method} ${url}`) || url === "/docs" || url?.startsWith("/docs/")) return;
  try {
    await req.jwtVerify(); // ada cookie akses? tanda tangannya asli? belum kedaluwarsa? isinya masuk req.user
  } catch {
    return reply.code(401).send({ pesan: "belum login atau sesi sudah habis: login lewat POST /auth/login" });
  }
  if (req.user.peran !== "admin" && !MEMBACA.has(req.method)) { // diperiksa SEBELUM isi permintaan divalidasi
    req.log.warn(`ditolak (403): akun ${req.user.sub} (${req.user.peran}) mencoba ${req.method} ${req.url}`);
    return reply.code(403).send({ pesan: "akun viewer hanya boleh melihat; perintah dan perubahan khusus admin" });
  }
}
