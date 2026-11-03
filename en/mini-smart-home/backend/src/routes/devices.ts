// devices.ts - the /devices routes: the device list, the latest reading, the history from the database (raw or summarized),
// commands, and the actuator state (desired/reported, Module 19). Module 21: the official device registry (registration, key
// rotation, revoke); GET /devices is now read from the database. Module 25: GET /devices carries the map point (lat, lng), and
// the admin moves that point with PUT /devices/:id/location.
// Module 28: registration, key rotation, and revoke also create/change/delete the device's broker account automatically
// (AUTO_BROKER_ACCOUNTS, services/broker-accounts.ts), inside the same transaction: the broker fails = the database doesn't change (503).
// Revoke = "Deactivate" on /fleet: the broker disconnects the device at once, its status is written offline, its retained config deleted.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { Ack, DeviceId, State, SetCommand, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/contract.ts";
import { findDevice } from "../services/store.ts";
import { revokeDevice, registerDevice, rotateDeviceKey, allDevicesDb, setDeviceLocation } from "../db/devices.ts";
import type { DeviceRow } from "../db/devices.ts";
import { makeKey, hashKey } from "../auth/key.ts";
import { recordRevoked, recordRegistered, devicePermission } from "../services/registry.ts";
import { deviceState, issueCommand } from "../services/commands.ts";
import { getSummary, getHistory, contractTime } from "../db/archive.ts";
import { accountQueue, removeDeviceAccount, addDeviceAccount, accountPlace } from "../services/broker-accounts.ts";
import { saveStatus } from "../services/store.ts";
import { clearConfig } from "../services/mqtt.ts";
import { broadcastStatus } from "../services/realtime.ts";
import { recordEvent } from "../services/events.ts";
import { forgetStatusNotice } from "../services/telegram.ts";

const MINUTE = 60 * 1000; // in milliseconds, like Date.getTime()
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MAX_BUCKETS = 1000; // at most 1,000 buckets (chart points) per request

// The bucket dictionary: the width of a bucket, the default range when from is empty, and a shift so days start at 00:00 WIB.
const BUCKETS = {
  "15m": { width: 15 * MINUTE, defaultSpan: DAY, shift: 0 },
  "1h": { width: HOUR, defaultSpan: 7 * DAY, shift: 0 },
  "1d": { width: DAY, defaultSpan: 30 * DAY, shift: 7 * HOUR }, // WIB = UTC + 7 hours
};

// The range actually asked for. An empty to = now. An empty from = 1 hour before to (raw readings) or the bucket's
// default range. With a bucket, the start of the range is rounded down to a bucket start, so the first bucket is whole.
function computeRange(q: { from?: string; to?: string; bucket?: keyof typeof BUCKETS }) {
  const toTime = q.to ? new Date(q.to) : new Date();
  if (q.bucket === undefined) {
    return { fromTime: q.from ? new Date(q.from) : new Date(toTime.getTime() - HOUR), toTime };
  }
  const { width, defaultSpan, shift } = BUCKETS[q.bucket];
  const start = q.from ? new Date(q.from).getTime() : toTime.getTime() - defaultSpan;
  return { fromTime: new Date(Math.floor((start + shift) / width) * width - shift), toTime }; // for example 10:37 -> 10:30
}

const ErrorBody = z.object({ message: z.string() });
const Kind = z.enum(["node1", "node2", "unknown"]);
const BucketParam = z.enum(["15m", "1h", "1d"]);
const IdParam = z.object({ id: DeviceId.describe("the device's device_id, for example a4cf12e5b7c0") });
const Range = z.object({
  from: z.iso.datetime({ offset: true }).optional()
    .describe("start of the range, e.g. 2026-10-20T10:00:00+07:00 (default: 1 hour before to; with bucket: 1, 7, or 30 days)"),
  to: z.iso.datetime({ offset: true }).optional().describe("end of the range, not included (default: now)"),
  bucket: BucketParam.optional()
    .describe("summarize per 15 minutes (15m), per hour (1h), or per WIB day (1d); without bucket = raw readings"),
}).refine((r) => !r.from || !r.to || new Date(r.from) < new Date(r.to), { // a reversed range is refused with code 400
  message: "must be later than from", path: ["to"],
  when: (result) => result.issues.length === 0, // the order is only checked when from and to have passed the format checks
}).refine((r) => { // a summary with too many buckets is refused with code 400 as well
  if (r.bucket === undefined) return true; // raw readings are already limited to 1,000 readings by getHistory
  const { fromTime, toTime } = computeRange(r);
  return Math.ceil((toTime.getTime() - fromTime.getTime()) / BUCKETS[r.bucket].width) <= MAX_BUCKETS;
}, {
  message: `range too long: at most ${MAX_BUCKETS} buckets (15m about 10 days, 1h about 41 days, `
    + "1d about 2.7 years)",
  path: ["from"],
  when: (result) => result.issues.length === 0,
});
const num = z.number().nullable(); // a column the device doesn't have holds null
const Reading = z.object({
  ts: z.string(), fw: z.string(), temperature: num, humidity: num, light: num, soil: num, motion: z.boolean().nullable(),
  water_level: num, pressure: num, soil_temperature: num, battery: num, soil_rs485: num, ec: num,
});
const SummaryPoint = z.object({
  time: z.string(), avg_temp: num, min_temp: num, max_temp: num, avg_humidity: num, avg_soil: num,
  avg_light: num, reading_count: z.number(),
});

// Module 21: one row of the device list. key = its key's state, not its key (the database doesn't store the key).
const Device = z.object({
  device_id: z.string(),
  name: z.string().nullable(),
  location: z.string().nullable(),
  lat: z.number().nullable().describe("Module 25: latitude of the device's point on the map (decimal degrees); null = not set yet"),
  lng: z.number().nullable().describe("Module 25: longitude of the device's point on the map (decimal degrees); null = not set yet"),
  kind: Kind,
  status: z.string().describe("online, offline, offline-mode, or unknown (the last MQTT status)"),
  last_seen: z.string().nullable().describe("server time when this device's last message arrived"),
  key: z.enum(["active", "revoked", "no-key", "unregistered"])
    .describe("active = allowed to send data; no-key = an ESP-NOW device via its linking device; unregistered = an old row"),
  registered_at: z.string().nullable().describe("when the admin registered it"),
  key_created_at: z.string().nullable().describe("when the key that is valid now was made"),
  revoked_at: z.string().nullable().describe("when its key was revoked"),
  linked_via: z.string().nullable().describe("an ESP-NOW device: the device_id that publishes its data"),
});
const Registration = z.strictObject({
  device_id: DeviceId.describe("the device's device_id (12 lowercase hexadecimal digits from the MAC address), for example a4cf12e5b7c0"),
  name: z.string().min(1).max(60).optional().describe("an easy-to-remember name, for example Node 1 living room"),
  location: z.string().min(1).max(60).optional().describe("for example living room"),
  linked_via: DeviceId.optional()
    .describe("only for an ESP-NOW device (Node 2): the device_id of the Node 1 that publishes its data; this device gets no key"),
});
// Module 25: the body of PUT /devices/:id/location. Numbers with a decimal POINT (JSON has no decimal comma): "-6,2" is text,
// so it is refused with 400. The range is the same as the CHECK in migration 001. Zod 4's z.number() also refuses NaN and Infinity.
// strictObject: other fields (for example the "location" text) are refused with 400; this route ONLY moves the point on the map.
const decimalNumber = (example: string) => z.number({ // error message: field missing, NaN/Infinity, or text
  error: (issue) => issue.input === undefined ? "required: a number, or null to remove the point"
    : typeof issue.input === "number" ? "must be a finite number (not NaN or Infinity)"
      : `must be a number with a decimal point, for example ${example} (not the text "${example.replace(".", ",")}")`,
});
export const LocationBody = z.strictObject({
  lat: decimalNumber("-6.1754").min(-90, "latitude at least -90").max(90, "latitude at most 90").nullable()
    .describe("latitude in decimal degrees, -90 to 90; Jakarta is about -6.2. null = remove the point"),
  lng: decimalNumber("106.8272").min(-180, "longitude at least -180").max(180, "longitude at most 180").nullable()
    .describe("longitude in decimal degrees, -180 to 180; Jakarta is about 106.8. null = remove the point"),
}).refine((l) => (l.lat === null) === (l.lng === null), { // half a point can't be drawn on the map
  message: "lat and lng go in pairs: both numbers, or both null to remove the point", path: ["lng"],
});
const NewKey = z.object({
  device_id: z.string(),
  key: z.string().nullable().describe("43 characters; shown ONLY this once. null for an ESP-NOW device"),
  steps: z.array(z.string()).describe("what to do next"),
});
const DATABASE_DOWN = "the database can't be reached right now, try again shortly";
// Module 28: an error in the middle of a transaction can come from the database OR from the broker (a dynamic security account). The
// database doesn't change (ROLLBACK), but an account command that was already sent can be held up in a stuck bridge and still be carried
// out by the broker as soon as its connection is back (M28 behaviour lab): repeating the same step makes the database and broker match.
const transactionError = (error: unknown) => `not saved in the database yet (the database or ${accountPlace()} has a problem: `
  + `${(error as Error).message}). A command that already reached the broker may still be carried out as soon as its connection is back: `
  + `repeat this step in a moment so the database and the broker match again`;

const iso = (time: Date | null) => (time === null ? null : contractTime(time));

function present(r: DeviceRow) {
  const key = r.registered_at === null ? "unregistered" as const
    : r.revoked_at !== null ? "revoked" as const
      : r.linked_via !== null ? "no-key" as const : "active" as const;
  return {
    device_id: r.device_id, name: r.name, location: r.location, lat: r.lat, lng: r.lng, kind: r.kind, status: r.status,
    last_seen: iso(r.last_seen), key, registered_at: iso(r.registered_at), key_created_at: iso(r.key_created_at),
    revoked_at: iso(r.revoked_at), linked_via: r.linked_via,
  };
}

// the next steps, so the key is installed on the device and on the broker right away. Module 28: the broker account is made by
// the backend itself unless AUTO_BROKER_ACCOUNTS=off (account = "manual").
function keySteps(id: string, account: "created" | "changed" | "manual"): string[] {
  return ["Save this key now: the key is shown only this once (the database only stores its fingerprint).",
    `Device: type  key <key>  in the Serial Monitor (simulator: KEY_${id.toUpperCase()}=<key> in tools/.env)`,
    account === "manual"
      ? `Broker: mosquitto_passwd <broker password file> ${id} on the broker machine, paste the key twice, then reload the broker`
      : `Broker: account ${id} already ${account} automatically at ${accountPlace()} (dynamic security): no manual step at the broker`];
}

function noKeySteps(id: string, linkedVia: string): string[] {
  return ["An ESP-NOW device with no key. Make sure these three lines are in the broker ACL file, then restart the broker:",
    `user ${linkedVia}`, `topic write msh/${id}/telemetry`, `topic write msh/${id}/status`];
}

export const deviceRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get("/devices", {
    schema: {
      tags: ["devices"],
      summary: "Devices in the database: the registered ones, the revoked ones, and old rows that aren't registered",
      response: {
        200: z.array(Device).describe("ordered by device_id; the key and its fingerprint are never included"),
        503: ErrorBody.describe("the database can't be reached right now"),
      },
    },
  }, async (req, reply) => {
    try {
      return (await allDevicesDb()).map(present);
    } catch (error) {
      req.log.error(`the device list couldn't be read: ${(error as Error).message}`);
      return reply.code(503).send({ message: DATABASE_DOWN });
    }
  });

  // ---- Module 21: register a device, rotate its key, revoke its key (admin only: the guard refuses viewers for POST) ----

  app.post("/devices", {
    schema: {
      tags: ["devices"],
      summary: "Register a device; its key is shown ONLY ONCE, in this answer",
      body: Registration,
      response: {
        201: NewKey.describe("device registered; save its key now"),
        409: ErrorBody.describe("already registered (use key rotation), or an invalid linked_via"),
        503: ErrorBody.describe("a database or broker problem: the database didn't change, repeat this step in a moment"),
      },
    },
  }, async (req, reply) => {
    const { device_id: id, name, location, linked_via: linkedVia } = req.body;
    if (linkedVia !== undefined) { // an ESP-NOW device: no key, its data is published by its linking device
      if (linkedVia === id) return reply.code(409).send({ message: "linked_via can't be the device itself" });
      if (devicePermission(linkedVia) !== "registered") {
        return reply.code(409).send({ message: `linked_via ${linkedVia} is not registered or has been revoked; register Node 1 first` });
      }
    }
    const key = linkedVia === undefined ? makeKey() : null;
    let account = "manual" as Awaited<ReturnType<typeof addDeviceAccount>>;
    try {
      // Module 28: the broker account inside the same transaction; accountQueue = one broker account step at a time
      const row = await accountQueue(() => registerDevice(id, name ?? null, location ?? null, linkedVia ?? null,
        key === null ? null : hashKey(key), // the database only receives its fingerprint
        async () => { if (key !== null) account = await addDeviceAccount(id, key); }));
      if (row === undefined) {
        return reply.code(409).send({ message: `${id} is already registered; for a new key use POST /devices/${id}/key` });
      }
      recordRegistered(id);
      req.log.info(`device ${id} registered by account ${req.user.sub}${linkedVia === undefined ? "" : ` (via ${linkedVia})`}`);
      const steps = linkedVia === undefined ? keySteps(id, account) : noKeySteps(id, linkedVia);
      return reply.code(201).send({ device_id: id, key, steps });
    } catch (error) {
      req.log.error(`registration of ${id} failed: ${(error as Error).message}`);
      return reply.code(503).send({ message: transactionError(error) });
    }
  });

  app.post("/devices/:id/key", {
    schema: {
      tags: ["devices"],
      summary: "Make a new key (the old key stops working at once); also brings a revoked device back to life",
      params: IdParam,
      response: {
        200: NewKey.describe("the new key; save it now"),
        404: ErrorBody.describe("the device isn't registered, or an ESP-NOW device (it has no key)"),
        503: ErrorBody.describe("a database or broker problem: the database didn't change, repeat this step in a moment"),
      },
    },
  }, async (req, reply) => {
    const id = req.params.id;
    const key = makeKey();
    let account = "manual" as Awaited<ReturnType<typeof addDeviceAccount>>;
    try {
      const row = await accountQueue(() => rotateDeviceKey(id, hashKey(key), async () => {
        account = await addDeviceAccount(id, key);
      }));
      if (row === undefined) return reply.code(404).send({ message: `${id} isn't registered, or a device with no key (ESP-NOW)` });
      recordRegistered(id);
      req.log.info(`a new key for ${id} was made by account ${req.user.sub}${account === "manual" ? "" : ` (broker account ${account})`}`);
      return { device_id: id, key, steps: keySteps(id, account) };
    } catch (error) {
      req.log.error(`key rotation for ${id} failed: ${(error as Error).message}`);
      return reply.code(503).send({ message: transactionError(error) });
    }
  });

  app.post("/devices/:id/revoke", {
    schema: {
      tags: ["devices"],
      summary: "Deactivate a device (lost or stolen): revoke its key, disconnect it from the broker, and mark it offline",
      description: "Module 28 (\"Deactivate\" on /fleet): besides revoking the key (Module 21), the backend deletes that device's broker "
        + "account (AUTO_BROKER_ACCOUNTS) so the broker disconnects it at once, writes its status offline (the broker doesn't "
        + "publish the will when it disconnects this way), and deletes its retained config. It comes back only with a key "
        + "rotation (POST /devices/:id/key) or a new claim code.",
      params: IdParam,
      response: {
        200: z.object({
          device_id: z.string(), revoked_at: z.string(), steps: z.array(z.string()),
          broker_account: z.enum(["deleted", "none", "manual", "no-key"])
            .describe("deleted = disconnected by the broker at once; none = an old Module 21 account (remove by hand); manual = off"),
        }).describe("deactivated"),
        404: ErrorBody.describe("the device isn't registered or has already been revoked"),
        503: ErrorBody.describe("a database or broker problem: the database didn't change, repeat this step in a moment"),
      },
    },
  }, async (req, reply) => {
    const id = req.params.id;
    let account = "no-key" as Awaited<ReturnType<typeof removeDeviceAccount>> | "no-key";
    try {
      const row = await accountQueue(() => revokeDevice(id, async (r) => {
        if (r.linked_via === null) account = await removeDeviceAccount(id);
      }));
      if (row === undefined) return reply.code(404).send({ message: `${id} isn't registered or has already been revoked` });
      recordRevoked(id);
      // Module 28: the status offline is written by the server (revokeDevice already changed the database), the retained config is
      // deleted from the broker, and the Telegram notice still waiting for this device is forgotten
      saveStatus(id, "offline");
      broadcastStatus(id, "offline");
      if (row.linked_via === null) clearConfig(id);
      forgetStatusNotice(id);
      const message = `${id} deactivated by account ${req.user.sub}` + (account === "deleted" ? `: its broker account deleted at ${accountPlace()}`
        : account === "none" ? `: no dynamic security account at ${accountPlace()} (an old Module 21 account?)` : "");
      req.log.warn(message);
      recordEvent({ device_id: id, kind: "revoked", source: "api", rule_id: null, message, data: { broker_account: account } });
      return {
        device_id: id, revoked_at: contractTime(row.revoked_at ?? new Date()), broker_account: account,
        steps: row.linked_via !== null
          ? [`Remove the two msh/${id}/... lines from the user ${row.linked_via} block in the broker ACL file, then restart the broker`]
          : account === "deleted" ? [`Broker account ${id} already deleted at ${accountPlace()}: the device is disconnected at once and can't `
            + "connect again. Bring it back only with a key rotation or a new claim code.",
            `Registered the Module 21 way before? Make sure its old line is gone from the broker password file (mosquitto_passwd -D `
            + `<broker password file> ${id}, then restart the broker): without a dynamic security account the broker accepts that OLD key again.`]
            : [`Remove its account from the broker${account === "none" ? " (an old Module 21 account in the password file)" : ""}: `
              + `mosquitto_passwd -D <broker password file> ${id}`,
              "Then restart that broker (in a container: docker compose restart mosquitto); until then the broker still accepts the device"],
      };
    } catch (error) {
      req.log.error(`revoke of ${id} failed: ${(error as Error).message}`);
      return reply.code(503).send({ message: transactionError(error) });
    }
  });

  // ---- Module 25: the device's point on the map (admin only: the guard refuses viewers for PUT, like POST above) ----

  app.put("/devices/:id/location", {
    schema: {
      tags: ["devices"],
      summary: "Set the device's point on the map: { lat, lng } with a decimal point; { lat: null, lng: null } removes the point",
      params: IdParam,
      body: LocationBody,
      response: {
        200: Device.describe("the device with its new point (the same shape as one row of GET /devices)"),
        404: ErrorBody.describe("that device_id isn't in the device list"),
        503: ErrorBody.describe("the database can't be reached right now"),
      },
    },
  }, async (req, reply) => {
    const id = req.params.id;
    const { lat, lng } = req.body;
    try {
      const row = await setDeviceLocation(id, lat, lng);
      if (row === undefined) return reply.code(404).send({ message: `${id} isn't in the device list` });
      // the coordinates are deliberately NOT written to the log: a home's point is personal data
      req.log.info(`map point of ${id} ${lat === null ? "removed" : "set"} by account ${req.user.sub}`);
      return present(row);
    } catch (error) {
      req.log.error(`location of ${id} couldn't be saved: ${(error as Error).message}`);
      return reply.code(503).send({ message: DATABASE_DOWN });
    }
  });

  app.get("/devices/:id/latest", {
    schema: {
      tags: ["devices"],
      summary: "The latest telemetry reading of one device",
      params: IdParam,
      response: {
        200: z.object({
          device_id: z.string(),
          kind: Kind,
          status: z.union([Status, z.literal("unknown")]),
          telemetry: z.union([TelemetryNode1, TelemetryNode2]),
        }).describe("that device's latest reading"),
        404: ErrorBody.describe("no telemetry from that device yet"),
      },
    },
  }, async (req, reply) => {
    const d = findDevice(req.params.id);
    if (d === undefined || d.telemetry === null) {
      return reply.code(404).send({ message: `no telemetry from ${req.params.id} yet` });
    }
    return { device_id: d.device_id, kind: d.kind, status: d.status, telemetry: d.telemetry };
  });

  app.get("/devices/:id/vitals", {
    schema: {
      tags: ["devices"],
      summary: "The last health report of one device (vitals)",
      params: IdParam,
      response: {
        200: z.object({ device_id: z.string(), vitals: Vitals }).describe("that device's latest vitals"),
        404: ErrorBody.describe("no vitals from that device yet"),
      },
    },
  }, async (req, reply) => {
    const d = findDevice(req.params.id);
    if (d === undefined || d.vitals === null) {
      return reply.code(404).send({ message: `no vitals from ${req.params.id} yet` });
    }
    return { device_id: d.device_id, vitals: d.vitals };
  });

  app.get("/devices/:id/readings", {
    schema: {
      tags: ["devices"],
      summary: "History of one device from the database: raw readings (at most 1,000) or a summary per bucket",
      params: IdParam,
      querystring: Range,
      response: {
        200: z.union([
          z.object({
            device_id: z.string(), from: z.string(), to: z.string(), count: z.number(), truncated: z.boolean(),
            readings: z.array(Reading),
          }),
          z.object({
            device_id: z.string(), from: z.string(), to: z.string(), bucket: BucketParam, count: z.number(),
            summary: z.array(SummaryPoint),
          }),
        ]).describe("without bucket: raw readings, truncated = there were more than 1,000 readings; with bucket: one summary "
          + "point per bucket. Both oldest first"),
        503: ErrorBody.describe("the database can't be reached right now"),
      },
    },
  }, async (req, reply) => {
    const { fromTime, toTime } = computeRange(req.query);
    const bucket = req.query.bucket;
    try {
      if (bucket !== undefined) {
        const summary = await getSummary(req.params.id, fromTime, toTime, bucket);
        return {
          device_id: req.params.id, from: contractTime(fromTime), to: contractTime(toTime), bucket, count: summary.length,
          summary,
        };
      }
      const { readings, truncated } = await getHistory(req.params.id, fromTime, toTime);
      return {
        device_id: req.params.id, from: contractTime(fromTime), to: contractTime(toTime), count: readings.length, truncated,
        readings,
      };
    } catch (error) {
      req.log.error(`history of ${req.params.id} couldn't be read from the database: ${(error as Error).message}`);
      return reply.code(503).send({ message: "the database can't be reached right now, try again shortly" });
    }
  });

  app.post("/devices/:id/command", {
    schema: {
      tags: ["devices"],
      summary: "Send one set command to a device, then wait for its ack (5 seconds at most)",
      params: IdParam,
      body: SetCommand,
      response: {
        200: z.object({ id: z.string(), wait_ms: z.number(), ack: Ack }).describe("the device answered with an ack"),
        404: ErrorBody.describe("the device isn't registered (Module 21) or has never been heard"),
        409: ErrorBody.describe("the device's key has been revoked (Module 21), the device is offline, is Node 2, its kind isn't "
          + "known yet, or an earlier command for the same actuator is still waiting for its ack"),
        503: ErrorBody.describe("the backend is not connected to the broker"),
        504: ErrorBody.describe("no ack within 5 seconds"),
      },
    },
  }, async (req, reply) => {
    const result = await issueCommand(req.params.id, req.body, "api"); // Module 19: through the same single door
    if (result.status === "not-sent") return reply.code(result.code).send({ message: result.message });
    if (result.status === "no-ack") return reply.code(504).send({ message: `no ack for ${result.id} within 5 seconds` });
    return { id: result.id, wait_ms: result.wait_ms, ack: result.ack };
  });

  app.get("/devices/:id/state", {
    schema: {
      tags: ["devices"],
      summary: "Actuator state: what the server wants (desired) and what the device reports (reported)",
      params: IdParam,
      response: {
        200: z.object({
          device_id: z.string(),
          desired: z.object({ fan: z.boolean().optional(), lamp: z.boolean().optional(), curtain: z.number().optional() })
            .describe("the state the server wants for the fan, the lamp, and the curtain (not the pump: its command runs once)"),
          reported: State.nullable().describe("the last state the device reported through telemetry or ack"),
          reported_at: z.string().nullable().describe("server time when that report arrived"),
          diff: z.array(z.string()).describe("the actuators whose state doesn't match the server's wish yet"),
        }).describe("desired, reported, and the difference"),
        404: ErrorBody.describe("the device has never been heard"),
      },
    },
  }, async (req, reply) => {
    const state = deviceState(req.params.id);
    if (state === undefined) return reply.code(404).send({ message: `device ${req.params.id} has never been heard` });
    return state;
  });
};
