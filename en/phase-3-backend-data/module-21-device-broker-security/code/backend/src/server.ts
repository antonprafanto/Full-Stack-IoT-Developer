// server.ts - the entry point of the Mini Smart Home backend v1.0 (Module 21: the official device registry and its keys, the
// backend's own broker account, messages from unregistered or revoked devices ignored; on top of Module 20: login, JWT in
// cookies, roles, and API protection, and Module 19: realtime data, a single door for commands, automation rules, schedules, and Telegram notifications).
// Run: npm run dev (automatically restarts when a file is saved) or npm start.
import Fastify, { LogController } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { env } from "./config/env.ts";
import { setupSecurity } from "./auth/security.ts";
import { authRoutes } from "./routes/auth.ts";
import { healthRoutes } from "./routes/health.ts";
import { deviceRoutes } from "./routes/devices.ts";
import { ruleRoutes } from "./routes/rules.ts";
import { stopMqtt, startMqtt } from "./services/mqtt.ts";
import { startRealtime } from "./services/realtime.ts";
import { loadRules } from "./services/automation.ts";
import { stopSchedules } from "./services/schedule.ts";
import { stopTelegram, startTelegram } from "./services/telegram.ts";
import { useLog } from "./services/log.ts";
import { databaseAlive } from "./db/archive.ts";
import { allDevicesDb } from "./db/devices.ts";
import { loadRegistry } from "./services/registry.ts";
import { pool } from "./db/pool.ts";

const app = Fastify({
  logger: { transport: { target: "pino-pretty", options: { translateTime: "SYS:HH:MM:ss", ignore: "pid,hostname,reqId" } } },
  logController: new LogController({ disableRequestLogging: true }), // the built-in log per request is too long...
});
useLog(app.log); // Module 19: other services (commands, rules, schedules, Telegram) write to the same log
app.addHook("onResponse", async (req, reply) => {
  // ...so it's replaced by one line per request (hook = Fastify's "middleware"). Only the method, the address, and the status
  // code: the request content (passwords!) and the cookies (tokens!) are never written to the log.
  req.log.info(`${req.method} ${req.url} -> ${reply.statusCode} (${Math.round(reply.elapsedTime)} ms)`);
});
app.setValidatorCompiler(validatorCompiler); // Zod schemas check the content of requests...
app.setSerializerCompiler(serializerCompiler); // ...and the shape of replies

await setupSecurity(app); // Module 20: CORS, cookies, JWT, rate limit, and the guard on every request (BEFORE the routes)
await app.register(swagger, {
  openapi: {
    info: {
      title: "Mini Smart Home API",
      description: "Backend v1.0 (Module 21). Every route needs a login, except the ones without a padlock. Log in first with "
        + "POST /auth/login (Try it out): the browser keeps the access cookie and sends it by itself to the other routes. "
        + "Viewer accounts can only look (GET); commands and changes are answered with 403. Devices are registered by an admin "
        + "with POST /devices; a key is shown only once, and messages from unregistered or revoked devices are ignored.",
      version: "1.0.0",
    },
    components: {
      securitySchemes: { // Module 20: routes with a padlock need the access cookie from POST /auth/login
        accessCookie: { type: "apiKey", in: "cookie", name: "access", description: "access JWT (httpOnly) from POST /auth/login" },
      },
    },
    security: [{ accessCookie: [] }], // default: every route has a padlock; open routes write security: []
  },
  transform: jsonSchemaTransform, // the same Zod schemas become the OpenAPI documentation
});
await app.register(swaggerUi, { routePrefix: "/docs" });
await app.register(authRoutes); // Module 20
await app.register(healthRoutes);
await app.register(deviceRoutes);
await app.register(ruleRoutes); // Module 19

if (await databaseAlive()) app.log.info("database ready");
else app.log.warn("database not reachable yet: check the database container and DATABASE_URL in .env");
try {
  await loadRules(); // Module 19: automation rules from the rules table
} catch (error) {
  app.log.error(`automation rules couldn't be loaded yet: ${(error as Error).message}`);
}
startRealtime(app); // Module 19: Socket.IO at the address /socket.io/ (Module 20: locked too)

// Module 21: the registry of registered devices is loaded from the database BEFORE listening to the broker. If the database
// can't be reached yet, it is retried every 10 seconds (logged at most once a minute); until then every device message is
// ignored: it's better to lose data for a moment than to accept data from a device that isn't allowed.
let registryAttempts = 0;
async function loadDeviceRegistry(): Promise<void> {
  try {
    const count = loadRegistry(await allDevicesDb());
    app.log.info(`device registry loaded: ${count} registered devices`);
  } catch (error) {
    if (registryAttempts % 6 === 0) {
      app.log.error(`device registry couldn't be loaded yet (${(error as Error).message}); retrying every 10 seconds`);
    }
    registryAttempts++;
    setTimeout(() => void loadDeviceRegistry(), 10_000);
  }
}
await loadDeviceRegistry();
if (env.MQTT_USERNAME === "") {
  app.log.warn("MQTT_USERNAME empty: the backend connects to the broker WITHOUT an account (only works on a broker that isn't locked yet)");
}
startMqtt(env.MQTT_URL, env.MQTT_USERNAME === "" ? null : { username: env.MQTT_USERNAME, password: env.MQTT_PASSWORD }, app.log);
startTelegram(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_CHAT_ID, env.TELEGRAM_API_ROOT); // Module 19: not awaited
await app.listen({ port: env.PORT, host: env.HOST });
app.log.info(`API docs: http://${env.HOST}:${env.PORT}/docs`);

// Module 19: stop gracefully on Ctrl + C (SIGINT) or SIGTERM. As soon as these signals have a listener, Ctrl + C no
// longer kills Node.js, so everything still open is closed one by one, then process.exit(0).
async function stopGracefully(signal: string): Promise<void> {
  app.log.info(`${signal} received: the backend is stopping gracefully`);
  try {
    await stopTelegram(); // confirm the last update to Telegram
    await stopSchedules(); // node-cron: wait for the tasks that are running
    await app.close(); // preClose disconnects the Socket.IO clients, then the HTTP server closes
    await stopMqtt(); // DISCONNECT to the broker
    await pool.end(); // close the database connection pool
  } catch (error) {
    app.log.error(`couldn't stop gracefully: ${(error as Error).message}`);
  }
  app.log.info("backend stopped");
  process.exit(0);
}
process.once("SIGINT", () => void stopGracefully("SIGINT"));
process.once("SIGTERM", () => void stopGracefully("SIGTERM"));
