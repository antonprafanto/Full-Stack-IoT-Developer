// server.ts - the entry point of the Mini Smart Home backend v0.1 (Module 16).
// Run: npm run dev (restarts automatically when a file is saved) or npm start.
import Fastify, { LogController } from "fastify";
import { env } from "./config/env.ts";
import { healthRoutes } from "./routes/health.ts";
import { deviceRoutes } from "./routes/devices.ts";
import { startMqtt } from "./services/mqtt.ts";

const app = Fastify({
  logger: { transport: { target: "pino-pretty", options: { translateTime: "SYS:HH:MM:ss", ignore: "pid,hostname,reqId" } } },
  logController: new LogController({ disableRequestLogging: true }), // the built-in log per request is too long...
});
app.addHook("onResponse", async (req, reply) => {
  // ...so it's replaced by one line per request. A hook like this is called middleware.
  req.log.info(`${req.method} ${req.url} -> ${reply.statusCode} (${Math.round(reply.elapsedTime)} ms)`);
});

await app.register(healthRoutes);
await app.register(deviceRoutes);

startMqtt(env.MQTT_URL, app.log);
await app.listen({ port: env.PORT, host: env.HOST });
