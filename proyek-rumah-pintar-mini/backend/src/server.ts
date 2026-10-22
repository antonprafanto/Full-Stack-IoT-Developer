// server.ts - pintu masuk backend Rumah Pintar Mini v0.5 (Modul 20: login, JWT di cookie, peran, dan pengaman API, di atas
// Modul 19: data realtime, perintah satu pintu, aturan otomatis, jadwal, dan notifikasi Telegram).
// Jalankan: npm run dev (otomatis mulai ulang saat file disimpan) atau npm start.
import Fastify, { LogController } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { env } from "./config/env.ts";
import { pasangKeamanan } from "./auth/keamanan.ts";
import { ruteAuth } from "./routes/auth.ts";
import { ruteKesehatan } from "./routes/kesehatan.ts";
import { rutePerangkat } from "./routes/perangkat.ts";
import { ruteAturan } from "./routes/aturan.ts";
import { hentikanMqtt, mulaiMqtt } from "./services/mqtt.ts";
import { mulaiRealtime } from "./services/realtime.ts";
import { muatAturan } from "./services/otomasi.ts";
import { hentikanJadwal } from "./services/jadwal.ts";
import { hentikanTelegram, mulaiTelegram } from "./services/telegram.ts";
import { pakaiLog } from "./services/log.ts";
import { databaseHidup } from "./db/arsip.ts";
import { pool } from "./db/pool.ts";

const app = Fastify({
  logger: { transport: { target: "pino-pretty", options: { translateTime: "SYS:HH:MM:ss", ignore: "pid,hostname,reqId" } } },
  logController: new LogController({ disableRequestLogging: true }), // log bawaan per permintaan terlalu panjang...
});
pakaiLog(app.log); // Modul 19: layanan lain (perintah, aturan, jadwal, Telegram) menulis ke log yang sama
app.addHook("onResponse", async (req, reply) => {
  // ...jadi diganti satu baris per permintaan (hook = "middleware" Fastify). Hanya metode, alamat, dan kode jawaban:
  // isi permintaan (sandi!) dan cookie (token!) tidak pernah ditulis ke log.
  req.log.info(`${req.method} ${req.url} -> ${reply.statusCode} (${Math.round(reply.elapsedTime)} ms)`);
});
app.setValidatorCompiler(validatorCompiler); // skema Zod memeriksa isi permintaan...
app.setSerializerCompiler(serializerCompiler); // ...dan bentuk jawaban

await pasangKeamanan(app); // Modul 20: CORS, cookie, JWT, rate limit, dan satpam di setiap permintaan (SEBELUM rute)
await app.register(swagger, {
  openapi: {
    info: {
      title: "Rumah Pintar Mini API",
      description: "Backend v0.5 (Modul 20). Semua rute butuh login, kecuali yang tidak bergembok. Login dulu lewat "
        + "POST /auth/login (Try it out): browser menyimpan cookie akses dan mengirimnya sendiri ke rute lain. "
        + "Akun viewer hanya boleh melihat (GET); perintah dan perubahan dijawab 403.",
      version: "0.5.0",
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

if (await databaseHidup()) app.log.info("database siap");
else app.log.warn("database belum bisa dihubungi: periksa kontainer database dan DATABASE_URL di .env");
try {
  await muatAturan(); // Modul 19: aturan otomatis dari tabel rules
} catch (galat) {
  app.log.error(`aturan otomatis belum bisa dimuat: ${(galat as Error).message}`);
}
mulaiRealtime(app); // Modul 19: Socket.IO di alamat /socket.io/ (Modul 20: ikut dikunci)
mulaiMqtt(env.MQTT_URL, app.log);
mulaiTelegram(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_CHAT_ID, env.TELEGRAM_API_ROOT); // Modul 19: tidak ditunggu
await app.listen({ port: env.PORT, host: env.HOST });
app.log.info(`dokumentasi API: http://${env.HOST}:${env.PORT}/docs`);

// Modul 19: berhenti dengan rapi saat Ctrl + C (SIGINT) atau SIGTERM. Begitu sinyal ini punya pendengar, Ctrl + C tidak
// lagi mematikan Node.js, jadi semua yang masih terbuka ditutup satu per satu, lalu process.exit(0).
async function berhenti(sinyal: string): Promise<void> {
  app.log.info(`${sinyal} diterima: backend berhenti dengan rapi`);
  try {
    await hentikanTelegram(); // konfirmasi update terakhir ke Telegram
    await hentikanJadwal(); // node-cron: tunggu tugas yang sedang berjalan
    await app.close(); // preClose memutus klien Socket.IO, lalu server HTTP ditutup
    await hentikanMqtt(); // DISCONNECT ke broker
    await pool.end(); // tutup kolam sambungan database
  } catch (galat) {
    app.log.error(`gagal berhenti dengan rapi: ${(galat as Error).message}`);
  }
  app.log.info("backend berhenti");
  process.exit(0);
}
process.once("SIGINT", () => void berhenti("SIGINT"));
process.once("SIGTERM", () => void berhenti("SIGTERM"));
