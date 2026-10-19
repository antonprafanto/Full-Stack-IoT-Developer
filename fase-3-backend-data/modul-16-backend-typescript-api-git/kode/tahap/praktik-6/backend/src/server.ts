// server.ts - pintu masuk backend Rumah Pintar Mini v0.1 (Modul 16).
// Jalankan: npm run dev (otomatis mulai ulang saat file disimpan) atau npm start.
import Fastify, { LogController } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { env } from "./config/env.ts";
import { ruteKesehatan } from "./routes/kesehatan.ts";
import { rutePerangkat } from "./routes/perangkat.ts";
import { mulaiMqtt } from "./services/mqtt.ts";

const app = Fastify({
  logger: { transport: { target: "pino-pretty", options: { translateTime: "SYS:HH:MM:ss", ignore: "pid,hostname,reqId" } } },
  logController: new LogController({ disableRequestLogging: true }), // log bawaan per permintaan terlalu panjang...
});
app.addHook("onResponse", async (req, reply) => {
  // ...jadi diganti satu baris per permintaan (hook = "middleware" Fastify)
  req.log.info(`${req.method} ${req.url} -> ${reply.statusCode} (${Math.round(reply.elapsedTime)} ms)`);
});
app.setValidatorCompiler(validatorCompiler); // skema Zod memeriksa isi permintaan...
app.setSerializerCompiler(serializerCompiler); // ...dan bentuk jawaban

await app.register(swagger, {
  openapi: { info: { title: "Rumah Pintar Mini API", description: "Backend v0.1 (Modul 16)", version: "0.1.0" } },
  transform: jsonSchemaTransform, // skema Zod yang sama menjadi dokumentasi OpenAPI
});
await app.register(swaggerUi, { routePrefix: "/docs" });
await app.register(ruteKesehatan);
await app.register(rutePerangkat);

mulaiMqtt(env.MQTT_URL, app.log);
await app.listen({ port: env.PORT, host: env.HOST });
app.log.info(`dokumentasi API: http://${env.HOST}:${env.PORT}/docs`);
