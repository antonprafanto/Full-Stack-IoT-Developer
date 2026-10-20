// server.ts - the first Mini Smart Home server (Module 16, Quick Win)
import Fastify from "fastify";

const app = Fastify({ logger: true });

app.get("/health", async () => {
  return { ok: true, message: "Mini Smart Home backend is alive" };
});

await app.listen({ port: 8080, host: "127.0.0.1" });
