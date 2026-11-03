// fleet.ts - the routes of the /fleet page (Module 28): the device list with each device's firmware version, health, and last update;
// update commands for one device, for the canary devices, or for all; the canary mark; and the vitals interval.
// Every role may LOOK (GET); the buttons that change something are admin-only (the security.ts guard answers 403 for a viewer).
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { env } from "../config/env.ts";
import { DeviceId } from "../schemas/contract.ts";
import { fleetData, updateHistory, allReleases, changeCanary, changeVitalsInterval } from "../db/fleet.ts";
import type { FleetRow, UpdateRow } from "../db/fleet.ts";
import { contractTime } from "../db/archive.ts";
import { findDevice } from "../services/store.ts";
import { blockedReason, requestUpdate, updateFleet } from "../services/ota.ts";
import type { UpdateResult } from "../services/ota.ts";
import { setVitalsInterval, sendConfigFor } from "../services/automation.ts";
import { accountPlace } from "../services/broker-accounts.ts";
import { RELEASE_VERSION_PATTERN, compareVersions, highestVersion } from "../services/version.ts";

const ErrorBody = z.object({ message: z.string() });
const Version = z.string().regex(RELEASE_VERSION_PATTERN, "version must look like x.y.z without leading zeros, for example 1.7.1");
const IdParam = z.object({ id: DeviceId.describe("the device's device_id, for example a4cf12e5b7c0") });
const DATABASE_DOWN = "the database can't be reached right now, try again shortly";
const iso = (t: Date | null) => (t === null ? null : contractTime(t));

const Update = z.object({
  id: z.string().describe("the update command's id"),
  status: z.string().describe("sent, accepted, downloading, rejected, succeeded, rollback, failed, or expired"),
  from: z.string().nullable(),
  to: z.string(),
  message: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  finished_at: z.string().nullable(),
});
const presentUpdate = (u: UpdateRow) => ({ id: u.id, status: u.status, from: u.from_version, to: u.to_version,
  message: u.message, created_at: contractTime(u.created_at), updated_at: contractTime(u.updated_at), finished_at: iso(u.finished_at) });

const PageRow = z.object({
  device_id: z.string(),
  name: z.string().nullable(),
  location: z.string().nullable(),
  kind: z.string(),
  status: z.string().describe("online, offline, offline-mode (stopped on purpose), or unknown"),
  key: z.enum(["active", "revoked", "no-key"]).describe("revoked = deactivated; no-key = a Node 2 via Node 1"),
  linked_via: z.string().nullable(),
  last_seen: z.string().nullable().describe("the server time when the last telemetry or vitals arrived (not a status message)"),
  canary: z.boolean(),
  vitals_interval_s: z.number().nullable().describe("the vitals interval set by the admin; null = not set yet (firmware: 300 seconds)"),
  fw: z.string().nullable().describe("the firmware version reported last (Node 2: the version from its packet)"),
  fw_seen_at: z.string().nullable(),
  needs_update: z.boolean().describe("a Node 1 with a version older than the latest release"),
  health: z.object({
    ts: z.string(), rssi: z.number(), heap_free: z.number(), uptime_s: z.number(),
    reset_reason: z.string().nullable().describe("POWERON, BROWNOUT, SW, PANIC, WDT, DEEPSLEEP, UNKNOWN; null = older firmware"),
  }).nullable().describe("the last vitals; null = never (Node 2 doesn't send vitals)"),
  update: Update.nullable().describe("this device's last update"),
  can_update: z.boolean().describe("the Update to the latest release button may be used now"),
  blocked_reason: z.string().nullable(),
});

const RUNNING = new Set(["sent", "accepted", "downloading"]);

function pageRow(r: FleetRow, latest: string | null) {
  const m = findDevice(r.device_id); // the status in memory is fresher than the devices.status column
  const status = r.revoked_at !== null ? "offline" : m?.status ?? r.status;
  const key = r.revoked_at !== null ? "revoked" as const : r.linked_via !== null ? "no-key" as const : "active" as const;
  const running = r.u_status !== null && RUNNING.has(r.u_status);
  const reason = latest === null ? (r.kind === "node2" ? "Node 2 (ESP-NOW): OTA isn't available, update it by cable"
    : "no firmware release yet")
    : blockedReason({ kind: r.kind, registered: true, revoked: r.revoked_at !== null, status, fw: r.fw, running },
      { version: latest, test: false, withdrawn_at: null })?.message ?? null;
  return {
    device_id: r.device_id, name: r.name, location: r.location, kind: r.kind, status, key, linked_via: r.linked_via,
    last_seen: iso(r.last_seen), canary: r.canary, vitals_interval_s: r.vitals_interval_s, fw: r.fw,
    fw_seen_at: iso(r.fw_seen_at),
    needs_update: r.kind === "node1" && r.revoked_at === null && latest !== null && r.fw !== null && compareVersions(r.fw, latest) < 0,
    health: r.health_ts === null ? null : { ts: contractTime(r.health_ts), rssi: r.rssi ?? 0, heap_free: r.heap_free ?? 0,
      uptime_s: r.uptime_s ?? 0, reset_reason: r.health_reset_reason ?? r.reset_reason },
    update: r.u_id === null ? null : { id: r.u_id, status: r.u_status ?? "", from: r.u_from, to: r.u_to ?? "", message: r.u_message,
      created_at: iso(r.u_created_at) ?? "", updated_at: iso(r.u_updated_at) ?? "", finished_at: iso(r.u_finished_at) },
    can_update: reason === null, blocked_reason: reason,
  };
}

// the result of one update command in the shape of an API answer
const OneResult = z.object({
  device_id: z.string(),
  id: z.string().nullable().describe("the update command's id; null if it wasn't sent"),
  status: z.enum(["accepted", "no-ack", "rejected", "not-sent"])
    .describe("accepted = ack ok:true (NOT finished yet: the result follows through the ota event/event log); no-ack = sent without an answer"),
  from: z.string().nullable().optional(),
  to: z.string().optional(),
  wait_ms: z.number().optional(),
  message: z.string().optional(),
});
const presentResult = (r: UpdateResult) => (r.status === "not-sent"
  ? { device_id: r.device_id, id: null, status: r.status, message: r.message }
  : r.status === "rejected" ? { device_id: r.device_id, id: r.id, status: r.status, message: r.message }
    : { device_id: r.device_id, id: r.id, status: r.status, from: r.from, to: r.to, wait_ms: r.wait_ms });

export const fleetRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get("/fleet", {
    schema: {
      tags: ["fleet"],
      summary: "The data of the /fleet page: every registered device with its version, health, and last update",
      response: {
        200: z.object({
          latest_release: z.object({ node1: z.string().nullable() }),
          settings: z.object({
            ota_ready: z.boolean().describe("false = SERVER_URL isn't set: the Update button can't be used"),
            broker_accounts: z.string().describe("where the device broker accounts are made (AUTO_BROKER_ACCOUNTS)"),
          }),
          devices: z.array(PageRow),
        }),
        503: ErrorBody,
      },
    },
  }, async (req, reply) => {
    try {
      const releases = await allReleases();
      const latest = highestVersion(releases.filter((r) => r.kind === "node1" && !r.test && r.withdrawn_at === null).map((r) => r.version));
      return {
        latest_release: { node1: latest },
        settings: { ota_ready: env.SERVER_URL !== "", broker_accounts: accountPlace() },
        devices: (await fleetData()).map((r) => pageRow(r, latest)),
      };
    } catch (error) {
      req.log.error(`the fleet data couldn't be read: ${(error as Error).message}`);
      return reply.code(503).send({ message: DATABASE_DOWN });
    }
  });

  app.post("/devices/:id/update", {
    schema: {
      tags: ["fleet"],
      summary: "Update the firmware of ONE device (admin). A 202 answer = the device ACCEPTED the command; the result follows",
      description: "Conditions: a registered Node 1, not deactivated, online now, not running another update, a version "
        + "different from the current one, a release that isn't withdrawn. An older version needs force: true. A test release is allowed (one device). "
        + "An offline device is NOT queued (409). The final result (succeeded, rollback, failed) comes through the device's vitals: see "
        + "GET /devices/:id/updates or the Socket.IO ota event.",
      params: IdParam,
      body: z.strictObject({
        version: Version,
        force: z.boolean().optional().describe("true = an older version may be installed (a downgrade)"),
      }),
      response: {
        202: OneResult.describe("the command was sent (accepted or no-ack)"),
        404: ErrorBody.describe("the device isn't registered, or that firmware version hasn't been uploaded"),
        409: ErrorBody.describe("the conditions aren't met (see the message)"),
        422: ErrorBody.describe("the device refused the command (ack ok:false), for example still in the 60-second trial period"),
        503: ErrorBody.describe("the backend isn't connected to the broker, SERVER_URL is empty, or a database problem"),
      },
    },
  }, async (req, reply) => {
    let result: UpdateResult;
    try {
      result = await requestUpdate(req.params.id, req.body.version, req.user.sub, req.body.force === true);
    } catch (error) {
      req.log.error(`update ${req.params.id} failed: ${(error as Error).message}`);
      return reply.code(503).send({ message: DATABASE_DOWN });
    }
    if (result.status === "not-sent") return reply.code(result.code).send({ message: result.message });
    if (result.status === "rejected") return reply.code(422).send({ message: `device refused: ${result.message}` });
    return reply.code(202).send(presentResult(result));
  });

  app.post("/fleet/update", {
    schema: {
      tags: ["fleet"],
      summary: "Update many devices (admin): the canary first, then all",
      description: "target canary = every Node 1 marked canary. target all = every Node 1 that qualifies, ONLY "
        + "after at least one canary ran this version successfully and no canary rolled back/failed. A test release "
        + "is refused. Devices that don't qualify are skipped (with their reasons), not queued.",
      body: z.strictObject({
        version: Version,
        target: z.enum(["canary", "all"]),
        force: z.boolean().optional().describe("true = a downgrade is allowed"),
      }),
      response: {
        202: z.object({
          version: z.string(), target: z.string(), sent: z.array(OneResult),
          skipped: z.array(z.object({ device_id: z.string(), reason: z.string() })),
        }),
        404: ErrorBody, 409: ErrorBody, 503: ErrorBody,
      },
    },
  }, async (req, reply) => {
    try {
      const result = await updateFleet(req.body.version, req.body.target, req.user.sub, req.body.force === true);
      if ("code" in result) return reply.code(result.code).send({ message: result.message });
      req.log.info(`update ${result.target} to ${result.version} by account ${req.user.sub}: ${result.sent.length} sent, `
        + `${result.skipped.length} skipped`);
      return reply.code(202).send({ ...result, sent: result.sent.map(presentResult) });
    } catch (error) {
      req.log.error(`update ${req.body.target} failed: ${(error as Error).message}`);
      return reply.code(503).send({ message: DATABASE_DOWN });
    }
  });

  app.get("/devices/:id/updates", {
    schema: {
      tags: ["fleet"],
      summary: "The firmware update history of one device (at most 20, newest first)",
      params: IdParam,
      response: { 200: z.array(Update), 503: ErrorBody },
    },
  }, async (req, reply) => {
    try {
      return (await updateHistory(req.params.id)).map(presentUpdate);
    } catch (error) {
      req.log.error(`the update history of ${req.params.id} couldn't be read: ${(error as Error).message}`);
      return reply.code(503).send({ message: DATABASE_DOWN });
    }
  });

  app.put("/devices/:id/canary", {
    schema: {
      tags: ["fleet"],
      summary: "Mark (or unmark) a canary device (admin): a test device that gets new releases first",
      params: IdParam,
      body: z.strictObject({ canary: z.boolean() }),
      response: {
        200: z.object({ device_id: z.string(), canary: z.boolean() }),
        404: ErrorBody.describe("not an active registered Node 1"),
        503: ErrorBody,
      },
    },
  }, async (req, reply) => {
    try {
      const row = await changeCanary(req.params.id, req.body.canary);
      if (row === undefined) return reply.code(404).send({ message: `${req.params.id} isn't an active registered Node 1 (a locked Wi-Fi device)` });
      req.log.info(`${row.device_id} ${row.canary ? "marked" : "no longer"} canary by account ${req.user.sub}`);
      return row;
    } catch (error) {
      req.log.error(`canary ${req.params.id} couldn't be saved: ${(error as Error).message}`);
      return reply.code(503).send({ message: DATABASE_DOWN });
    }
  });

  app.put("/devices/:id/intervals", {
    schema: {
      tags: ["fleet"],
      summary: "Set the vitals interval of one Node 1 (admin), 60-3600 seconds; sent through the retained config (contract 1.6)",
      description: "Only vitals (health). telemetry stays every 10 seconds (contract rule 3): the dashboard's stale-data label "
        + "and Grafana's Silent node alert depend on it. Wi-Fi, the server address, and the broker address can NOT be set from afar.",
      params: IdParam,
      body: z.strictObject({ vitals_s: z.number().int().min(60).max(3600).describe("seconds; the firmware default is 300") }),
      response: {
        200: z.object({
          device_id: z.string(), vitals_interval_s: z.number(),
          config_id: z.string().nullable().describe("the id of the config command that was sent (retained)"),
          note: z.string().nullable(),
        }),
        404: ErrorBody.describe("not an active registered Node 1"),
        503: ErrorBody,
      },
    },
  }, async (req, reply) => {
    try {
      const row = await changeVitalsInterval(req.params.id, req.body.vitals_s);
      if (row === undefined) return reply.code(404).send({ message: `${req.params.id} isn't an active registered Node 1 (a locked Wi-Fi device)` });
      setVitalsInterval(row.device_id, row.vitals_interval_s);
      const configId = sendConfigFor(row.device_id);
      req.log.info(`vitals interval ${row.device_id} = ${row.vitals_interval_s} seconds by account ${req.user.sub}`);
      const oldFirmware = row.fw !== null && compareVersions(row.fw, "1.7.0") < 0;
      return { device_id: row.device_id, vitals_interval_s: row.vitals_interval_s, config_id: configId,
        note: oldFirmware ? `firmware ${row.fw} doesn't know the interval yet (since 1.7.0): saved, applies after it is updated` : null };
    } catch (error) {
      req.log.error(`the interval of ${req.params.id} couldn't be saved: ${(error as Error).message}`);
      return reply.code(503).send({ message: DATABASE_DOWN });
    }
  });
};
