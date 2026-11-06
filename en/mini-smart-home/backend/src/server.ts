// server.ts - the entry point of the Mini Smart Home backend 2.0 (Module 29: the Fastify server assembly moved to app.ts,
// buildApp(), so the integration tests test the same assembly as production; the server version is read from package.json and
// shows in /health and /docs). This file only starts the rest: the database, the automation rules, Socket.IO, MQTT, Telegram,
// the daily report, and the firmware update watcher, then listens at its counter.
// History: v1.5 Module 28: over-the-air firmware updates with locked downloads, a canary, single-use claim codes, automatic
// device broker accounts through dynamic security, and the data of the /fleet page; v1.4 Module 27: the backend on the internet,
// behind Caddy HTTPS (TRUST_PROXY makes the backend trust what Caddy says about the visitor: Secure login cookies over HTTPS and
// a login limit per visitor); v1.3 Module 26: it can run as a Docker container in compose.cloud.yml; v1.2 Module 25: the
// device's point on the map and the daily CSV report through Telegram; v1.1 Module 24: "below-threshold" rules such as watering
// when the soil is dry, threshold rules may send one command, and rules can be deleted; v1.0 Module 21: the device registry and
// its keys, the backend's own broker account, unregistered/revoked devices ignored; Module 20: login, JWT in cookies, roles, and
// API protection; and Module 19: realtime data, one door for commands, automation rules, schedules, and Telegram notifications.
// Run: npm run dev (automatically restarts when a file is saved) or npm start. In a container (Module 26): node src/server.ts,
// its settings come from Docker Compose, not from a .env file (see Dockerfile).
import { env } from "./config/env.ts";
import { SERVER_VERSION } from "./config/server-version.ts";
import { buildApp } from "./app.ts";
import { brokerConnected, stopMqtt, startMqtt } from "./services/mqtt.ts";
import { startRealtime } from "./services/realtime.ts";
import { loadVitalsIntervals, sendAllConfigs, loadRules } from "./services/automation.ts";
import { stopUpdateWatcher, startUpdateWatcher } from "./services/ota.ts";
import { accountPlace } from "./services/broker-accounts.ts";
import { stopSchedules } from "./services/schedule.ts";
import { stopTelegram, startTelegram } from "./services/telegram.ts";
import { startReports } from "./services/reports.ts";
import { databaseAlive } from "./db/archive.ts";
import { allDevicesDb } from "./db/devices.ts";
import { loadRegistry } from "./services/registry.ts";
import { pool } from "./db/pool.ts";

const app = await buildApp(); // Module 29: Fastify + protection + /docs + every route (app.ts), not listening at any counter yet
app.log.info(`Mini Smart Home backend ${SERVER_VERSION} started`); // Module 29: the same version as /health

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
    const rows = await allDevicesDb();
    const count = loadRegistry(rows);
    loadVitalsIntervals(rows.map((r) => ({ device_id: r.device_id, vitals_interval_s: r.vitals_interval_s ?? null }))); // Module 28
    app.log.info(`device registry loaded: ${count} registered devices`);
    // Module 28: a config is only sent to registered devices; if the broker connected first, send it now
    if (brokerConnected()) sendAllConfigs();
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
startReports(env.REPORT_SCHEDULE); // Module 25: the daily CSV report to Telegram (node-cron, WIB)
startUpdateWatcher(); // Module 28: a firmware update without word for OTA_TIMEOUT_MINUTES minutes = expired
// Module 28: two lines at startup, the proof that the firmware update and broker account settings were read
app.log.info(env.SERVER_URL === "" ? "over-the-air firmware updates OFF: SERVER_URL not set"
  : `firmware download address for devices: ${env.SERVER_URL}/fw/node-1/<version>.bin`);
app.log.info(`device broker accounts: ${accountPlace()} (AUTO_BROKER_ACCOUNTS)`);
await app.listen({ port: env.PORT, host: env.HOST });
app.log.info(`API docs: http://${env.HOST}:${env.PORT}/docs`);

// Module 19: stop gracefully on Ctrl + C (SIGINT) or SIGTERM. As soon as these signals have a listener, Ctrl + C no
// longer kills Node.js, so everything still open is closed one by one, then process.exit(0).
async function stopGracefully(signal: string): Promise<void> {
  app.log.info(`${signal} received: the backend is stopping gracefully`);
  try {
    await stopTelegram(); // confirm the last update to Telegram
    await stopSchedules(); // node-cron: wait for the tasks that are running (the rule schedules and, since Module 25, the daily report)
    stopUpdateWatcher(); // Module 28
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
