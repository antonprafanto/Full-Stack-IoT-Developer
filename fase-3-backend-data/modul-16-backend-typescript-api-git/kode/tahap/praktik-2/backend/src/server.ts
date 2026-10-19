// server.ts - pintu masuk backend Rumah Pintar Mini v0.1 (Modul 16).
// Jalankan: npm run dev (mulai ulang otomatis saat file disimpan) atau npm start.
import Fastify, { LogController } from "fastify";
import { env } from "./config/env.ts";
import { ruteKesehatan } from "./routes/kesehatan.ts";

const app = Fastify({
  logger: { transport: { target: "pino-pretty", options: { translateTime: "SYS:HH:MM:ss", ignore: "pid,hostname,reqId" } } },
  logController: new LogController({ disableRequestLogging: true }), // log bawaan per permintaan terlalu panjang...
});
app.addHook("onResponse", async (req, reply) => {
  // ...jadi diganti satu baris per permintaan. Hook seperti ini disebut middleware.
  req.log.info(`${req.method} ${req.url} -> ${reply.statusCode} (${Math.round(reply.elapsedTime)} ms)`);
});

await app.register(ruteKesehatan);
await app.listen({ port: env.PORT, host: env.HOST });
