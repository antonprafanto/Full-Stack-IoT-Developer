// app.ts - assembles the Mini Smart Home Fastify server WITHOUT starting it (Module 29). Its content moved as is from server.ts
// (Modules 19-28): the logger, one log line per request, the Zod schema checker, the API protection (Module 20), the /docs
// documentation, and 8 groups of routes.
// Why separate? The integration tests (src/integration/) call buildApp() and then knock on its routes with app.inject() and a
// REAL test database. So what is tested is THE SAME assembly as in production, not a mock assembly made by the tests: a route
// someone forgot to register shows up too (example: without claimRoutes, three claim tests turn red with 404), and so does a
// missing login guard (GET /devices without a login must be 401). server.ts only starts the rest (database, MQTT, Telegram,
// schedules, Socket.IO) and listens at its counter.
import Fastify, { LogController } from "fastify";
import type { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { env } from "./config/env.ts";
import { SERVER_VERSION } from "./config/server-version.ts";
import { setupSecurity } from "./auth/security.ts";
import { authRoutes } from "./routes/auth.ts";
import { healthRoutes } from "./routes/health.ts";
import { deviceRoutes } from "./routes/devices.ts";
import { ruleRoutes } from "./routes/rules.ts";
import { reportRoutes } from "./routes/reports.ts";
import { firmwareRoutes } from "./routes/firmware.ts";
import { fleetRoutes } from "./routes/fleet.ts";
import { claimRoutes } from "./routes/claims.ts";
import { useLog, shouldLog } from "./services/log.ts";

export interface AppOptions {
  // "pretty" (the default, server.ts) = the colored pino-pretty log, as since Module 19.
  // "errors-only" (the integration tests) = only errors are written, one JSON line without colors: the Vitest output stays
  // clean, but the reason for a 503 answer (for example an SQL query the database refused) can still be read when a test is red.
  log?: "pretty" | "errors-only";
}

export async function buildApp(options: AppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options.log === "errors-only"
      ? { level: "error" }
      : { transport: { target: "pino-pretty", options: { translateTime: "SYS:HH:MM:ss", ignore: "pid,hostname,reqId" } } },
    logController: new LogController({ disableRequestLogging: true }), // the built-in log per request is too long...
    // Module 27: the X-Forwarded-For/-Proto headers from Caddy are only trusted when they come from a proxy in TRUST_PROXY (in
    // compose.cloud.yml: uniquelocal = the Docker hallway). Empty (dev mode) = those headers are ignored, as in v1.3.
    trustProxy: env.TRUST_PROXY,
  });
  useLog(app.log); // Module 19: other services (commands, rules, schedules, Telegram) write to the same log
  app.addHook("onResponse", async (req, reply) => {
    // ...so it's replaced by one line per request (hook = Fastify's "middleware"). Only the method, the address, and the status
    // code: the request content (passwords!) and the cookies (tokens!) are never written to the log. Module 26: successful /health
    // knocks (the Docker healthcheck every 15 seconds) aren't logged, so the log doesn't fill up with the same line.
    if (!shouldLog(req.method, req.url, reply.statusCode)) return;
    req.log.info(`${req.method} ${req.url} -> ${reply.statusCode} (${Math.round(reply.elapsedTime)} ms)`);
  });
  if (env.TRUST_PROXY !== false) { // Module 27: one line at startup, proof that the TRUST_PROXY setting was read
    app.log.info(`trusted proxies (TRUST_PROXY): ${env.TRUST_PROXY === true ? "all" : env.TRUST_PROXY.join(", ")}`);
  }
  app.setValidatorCompiler(validatorCompiler); // Zod schemas check the content of requests...
  app.setSerializerCompiler(serializerCompiler); // ...and the shape of replies

  await setupSecurity(app); // Module 20: CORS, cookies, JWT, rate limit, and the guard on every request (BEFORE the routes)
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Mini Smart Home API",
        description: "The Mini Smart Home backend. Every route needs a login, except the ones without a padlock. Log in first with "
          + "POST /auth/login (Try it out): the browser keeps the access cookie and sends it by itself to the other routes. "
          + "Viewer accounts can only look (GET); commands and changes are answered with 403. Devices are registered by an admin "
          + "with POST /devices; a key is shown only once, and messages from unregistered or revoked devices are ignored. "
          + "Since v1.1, a threshold rule can point downwards (below-threshold, for example water when the soil is below 30 %), can "
          + "send one command when it turns on, and rules can be deleted (DELETE /rules/:id). Since v1.2, GET /devices carries "
          + "each device's map point (lat, lng), and the admin moves it with PUT /devices/:id/location. "
          + "The daily CSV report is sent to Telegram at REPORT_SCHEDULE (default 07:00 WIB); POST /reports/send "
          + "sends it right now. Since v1.3 (Module 26), the backend also runs as a container in Docker Compose: "
          + "the dashboard calls it through the Caddy web server with the prefix /api, while this page is opened at "
          + "http://localhost:8080/docs (in the container, a login from http://127.0.0.1:8080/docs is refused with 403). Since v1.4 "
          + "(Module 27), the backend can be opened from the internet behind Caddy HTTPS: with TRUST_PROXY (in Compose: uniquelocal) "
          + "the backend uses the visitor's IP address and protocol from Caddy, so the login cookies are Secure and the limit of 10 "
          + "login attempts applies per visitor. Since v1.5 (Module 28): over-the-air firmware updates (upload POST /firmware/:kind/:version, "
          + "the command POST /devices/:id/update, the canary, then POST /fleet/update), the firmware download for devices at "
          + "GET /fw/node-1/<version>.bin locked with the device key, the data of the /fleet page (GET /fleet), single-use claim "
          + "codes (POST /provision/code for the admin, POST /provision/claim for the device), the vitals interval set from afar, and "
          + "device broker accounts that are created and deleted automatically (AUTO_BROKER_ACCOUNTS). Since 2.0.0 (Module 29): one "
          + "version number for the backend and the dashboard, read from package.json (the number next to this page's title), and "
          + "GET /health names the running version.",
        version: SERVER_VERSION, // Module 29: from package.json, no longer written by hand here
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
  await app.register(reportRoutes); // Module 25
  await app.register(firmwareRoutes); // Module 28: firmware releases and the locked download /fw
  await app.register(fleetRoutes); // Module 28: the /fleet page, update commands, the canary, the vitals interval
  await app.register(claimRoutes); // Module 28: claim codes
  return app;
}
