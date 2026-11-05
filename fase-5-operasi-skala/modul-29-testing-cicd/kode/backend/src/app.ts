// app.ts - merakit server Fastify Rumah Pintar Mini TANPA menyalakannya (Modul 29). Isinya pindahan apa adanya dari server.ts
// (Modul 19-28): pencatat log, satu baris log per permintaan, pemeriksa skema Zod, pengaman API (Modul 20), dokumentasi
// /docs, dan 8 kelompok rute.
// Kenapa dipisah? Tes integrasi (src/integrasi/) memanggil buatApp() lalu mengetuk rutenya lewat app.inject() dengan database
// uji SUNGGUHAN. Jadi yang diuji adalah rakitan YANG SAMA dengan produksi, bukan rakitan tiruan buatan tes: rute yang lupa
// didaftarkan ikut ketahuan (contoh: tanpa ruteKlaim, tiga tes klaim merah dengan 404), begitu juga satpam login yang hilang
// (GET /devices tanpa login harus 401). server.ts tinggal menyalakan sisanya (database, MQTT, Telegram, jadwal, Socket.IO)
// dan mendengar di loketnya.
import Fastify, { LogController } from "fastify";
import type { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { env } from "./config/env.ts";
import { VERSI_SERVER } from "./config/versi-server.ts";
import { pasangKeamanan } from "./auth/keamanan.ts";
import { ruteAuth } from "./routes/auth.ts";
import { ruteKesehatan } from "./routes/kesehatan.ts";
import { rutePerangkat } from "./routes/perangkat.ts";
import { ruteAturan } from "./routes/aturan.ts";
import { ruteLaporan } from "./routes/laporan.ts";
import { ruteFirmware } from "./routes/firmware.ts";
import { ruteArmada } from "./routes/armada.ts";
import { ruteKlaim } from "./routes/klaim.ts";
import { pakaiLog, perluDicatat } from "./services/log.ts";

export interface OpsiApp {
  // "berwarna" (bawaan, server.ts) = log berwarna pino-pretty seperti sejak Modul 19.
  // "galat-saja" (tes integrasi) = hanya galat yang ditulis, satu baris JSON tanpa warna: keluaran Vitest tetap bersih, tetapi
  // alasan jawaban 503 (misalnya kueri SQL yang ditolak database) tetap terbaca saat tes merah.
  log?: "berwarna" | "galat-saja";
}

export async function buatApp(opsi: OpsiApp = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: opsi.log === "galat-saja"
      ? { level: "error" }
      : { transport: { target: "pino-pretty", options: { translateTime: "SYS:HH:MM:ss", ignore: "pid,hostname,reqId" } } },
    logController: new LogController({ disableRequestLogging: true }), // log bawaan per permintaan terlalu panjang...
    // Modul 27: header X-Forwarded-For/-Proto dari Caddy hanya dipercaya bila datang dari penerus di TRUST_PROXY (di
    // compose.cloud.yml: uniquelocal = lorong Docker). Kosong (mode kembang) = header itu diabaikan, seperti v1.3.
    trustProxy: env.TRUST_PROXY,
  });
  pakaiLog(app.log); // Modul 19: layanan lain (perintah, aturan, jadwal, Telegram) menulis ke log yang sama
  app.addHook("onResponse", async (req, reply) => {
    // ...jadi diganti satu baris per permintaan (hook = "middleware" Fastify). Hanya metode, alamat, dan kode jawaban:
    // isi permintaan (sandi!) dan cookie (token!) tidak pernah ditulis ke log. Modul 26: ketukan /health yang berhasil
    // (healthcheck Docker setiap 15 detik) tidak dicatat, supaya log tidak penuh baris yang sama.
    if (!perluDicatat(req.method, req.url, reply.statusCode)) return;
    req.log.info(`${req.method} ${req.url} -> ${reply.statusCode} (${Math.round(reply.elapsedTime)} ms)`);
  });
  if (env.TRUST_PROXY !== false) { // Modul 27: satu baris saat menyala, bukti setelan TRUST_PROXY terbaca
    app.log.info(`penerus tepercaya (TRUST_PROXY): ${env.TRUST_PROXY === true ? "semua" : env.TRUST_PROXY.join(", ")}`);
  }
  app.setValidatorCompiler(validatorCompiler); // skema Zod memeriksa isi permintaan...
  app.setSerializerCompiler(serializerCompiler); // ...dan bentuk jawaban

  await pasangKeamanan(app); // Modul 20: CORS, cookie, JWT, rate limit, dan satpam di setiap permintaan (SEBELUM rute)
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Rumah Pintar Mini API",
        description: "Backend Rumah Pintar Mini. Semua rute butuh login, kecuali yang tidak bergembok. Login dulu lewat "
          + "POST /auth/login (Try it out): browser menyimpan cookie akses dan mengirimnya sendiri ke rute lain. "
          + "Akun viewer hanya boleh melihat (GET); perintah dan perubahan dijawab 403. Perangkat didaftarkan admin lewat "
          + "POST /devices; kuncinya hanya tampil sekali, dan pesan dari perangkat tak terdaftar atau dicabut diabaikan. "
          + "Sejak v1.1, aturan ambang bisa berarah turun (ambang-bawah, misalnya siram kalau tanah di bawah 30 %), boleh "
          + "mengirim satu perintah saat menyala, dan aturan bisa dihapus (DELETE /rules/:id). Sejak v1.2, GET /devices "
          + "membawa titik peta setiap perangkat (lat, lng), dan admin memindahkannya lewat PUT /devices/:id/lokasi. "
          + "Laporan harian CSV dikirim ke Telegram sesuai LAPORAN_JADWAL (bawaan 07.00 WIB); POST /laporan/kirim "
          + "mengirimnya sekarang juga. Sejak v1.3 (Modul 26), backend juga berjalan sebagai kontainer di Docker Compose: "
          + "dashboard memanggilnya lewat penyaji web Caddy dengan awalan /api, sedangkan halaman ini dibuka di "
          + "http://localhost:8080/docs (di kontainer, login dari http://127.0.0.1:8080/docs ditolak 403). Sejak v1.4 "
          + "(Modul 27), backend bisa dibuka dari internet di balik Caddy HTTPS: dengan TRUST_PROXY (di Compose: uniquelocal) "
          + "backend memakai alamat IP dan protokol tamu dari Caddy, jadi cookie login ber-Secure dan batas 10 percobaan "
          + "login berlaku per tamu. Sejak v1.5 (Modul 28): pembaruan firmware lewat udara (unggah POST /firmware/:jenis/:versi, "
          + "perintah POST /devices/:id/update, canary lalu POST /armada/update), unduhan firmware untuk perangkat di "
          + "GET /fw/node-1/<versi>.bin yang dikunci kunci perangkat, data halaman /armada (GET /armada), kode klaim sekali "
          + "pakai (POST /provision/kode untuk admin, POST /provision/klaim untuk perangkat), jeda vitals jarak jauh, dan "
          + "akun broker perangkat yang dibuat serta dihapus otomatis (AKUN_BROKER_OTOMATIS). Sejak 2.0.0 (Modul 29): satu "
          + "nomor versi untuk backend dan dashboard, dibaca dari package.json (angka di samping judul halaman ini), dan "
          + "GET /health menyebut versi yang sedang berjalan.",
        version: VERSI_SERVER, // Modul 29: dari package.json, bukan lagi ditulis tangan di sini
      },
      components: {
        securitySchemes: { // Modul 20: rute bergembok butuh cookie akses dari POST /auth/login
          cookieAkses: { type: "apiKey", in: "cookie", name: "akses", description: "JWT akses (httpOnly) dari POST /auth/login" },
        },
      },
      security: [{ cookieAkses: [] }], // bawaan: semua rute bergembok; rute terbuka menulis security: []
    },
    transform: jsonSchemaTransform, // skema Zod yang sama menjadi dokumentasi OpenAPI
  });
  await app.register(swaggerUi, { routePrefix: "/docs" });
  await app.register(ruteAuth); // Modul 20
  await app.register(ruteKesehatan);
  await app.register(rutePerangkat);
  await app.register(ruteAturan); // Modul 19
  await app.register(ruteLaporan); // Modul 25
  await app.register(ruteFirmware); // Modul 28: rilis firmware dan unduhan berkunci /fw
  await app.register(ruteArmada); // Modul 28: halaman /armada, perintah update, canary, jeda vitals
  await app.register(ruteKlaim); // Modul 28: kode klaim
  return app;
}
