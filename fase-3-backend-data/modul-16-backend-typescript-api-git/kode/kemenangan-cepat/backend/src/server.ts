// server.ts - server pertama Rumah Pintar Mini (Modul 16, Kemenangan Cepat)
import Fastify from "fastify";

const app = Fastify({ logger: true });

app.get("/health", async () => {
  return { ok: true, pesan: "backend Rumah Pintar Mini hidup" };
});

await app.listen({ port: 8080, host: "127.0.0.1" });
