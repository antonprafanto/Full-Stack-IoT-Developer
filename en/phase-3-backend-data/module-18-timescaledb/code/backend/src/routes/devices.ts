// devices.ts - the /devices routes: the device list, the latest reading, the history from the database (raw or summarized),
// and commands.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { Ack, DeviceId, SetCommand, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/contract.ts";
import { findDevice, allDevices, waitForAck } from "../services/store.ts";
import { brokerConnected, makeCommandId, sendCommand } from "../services/mqtt.ts";
import { getSummary, getHistory, archiveCommand, contractTime } from "../db/archive.ts";

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

export const deviceRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get("/devices", {
    schema: {
      tags: ["devices"],
      summary: "List every device ever heard",
      response: {
        200: z.array(z.object({
          device_id: z.string(),
          kind: Kind,
          status: z.union([Status, z.literal("unknown")]),
          last_seen: z.string(),
        })).describe("every device recorded in memory"),
      },
    },
  }, async () => {
    return allDevices().map((d) => ({
      device_id: d.device_id,
      kind: d.kind,
      status: d.status,
      last_seen: d.last_seen,
    }));
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
        404: ErrorBody.describe("the device has never been heard"),
        409: ErrorBody.describe("the device is offline, is Node 2, or its kind isn't known yet"),
        503: ErrorBody.describe("the backend is not connected to the broker"),
        504: ErrorBody.describe("no ack within 5 seconds"),
      },
    },
  }, async (req, reply) => {
    const d = findDevice(req.params.id);
    if (d === undefined) return reply.code(404).send({ message: `device ${req.params.id} has never been heard` });
    if (d.kind === "node2") return reply.code(409).send({ message: "Node 2 doesn't accept commands (contract section 2)" });
    if (d.kind !== "node1") return reply.code(409).send({ message: "device kind not known yet: wait for its first telemetry" });
    if (d.status !== "online") return reply.code(409).send({ message: `device is ${d.status}, command not sent` });
    if (!brokerConnected()) return reply.code(503).send({ message: "the backend isn't connected to the broker" });

    const commandId = makeCommandId();
    const start = Date.now();
    const ackPending = waitForAck(commandId, 5000); // start waiting before sending
    sendCommand(d.device_id, commandId, req.body);
    const ack = await ackPending;
    const elapsed = Date.now() - start;
    archiveCommand(commandId, d.device_id, req.body, new Date(start), ack, elapsed)
      .catch((error) => req.log.error(`couldn't record command ${commandId} in the database: ${error.message}`));
    if (ack === null) {
      req.log.warn(`command ${commandId} to ${d.device_id}: no ack within 5 seconds`);
      return reply.code(504).send({ message: `no ack for ${commandId} within 5 seconds` });
    }
    req.log.info(`command ${commandId} to ${d.device_id}: ack ok=${ack.ok} in ${elapsed} ms`);
    return { id: commandId, wait_ms: elapsed, ack };
  });
};
