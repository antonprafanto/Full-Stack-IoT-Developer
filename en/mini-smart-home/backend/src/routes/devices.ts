// devices.ts - the /devices routes: the device list, the latest reading, the history from the database, and commands.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { Ack, DeviceId, SetCommand, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/contract.ts";
import { findDevice, allDevices, waitForAck } from "../services/store.ts";
import { brokerConnected, makeCommandId, sendCommand } from "../services/mqtt.ts";
import { getHistory, archiveCommand, contractTime } from "../db/archive.ts";

const ErrorBody = z.object({ message: z.string() });
const Kind = z.enum(["node1", "node2", "unknown"]);
const IdParam = z.object({ id: DeviceId.describe("the device's device_id, for example a4cf12e5b7c0") });
const Range = z.object({
  from: z.iso.datetime({ offset: true }).optional()
    .describe("start of the range, e.g. 2026-10-20T10:00:00+07:00 (default: 1 hour before to)"),
  to: z.iso.datetime({ offset: true }).optional().describe("end of the range, not included (default: now)"),
}).refine((r) => !r.from || !r.to || new Date(r.from) < new Date(r.to), { // a reversed range is refused with code 400
  message: "must be later than from", path: ["to"],
  when: (result) => result.issues.length === 0, // the order is only checked when from and to have passed the format checks
});
const num = z.number().nullable(); // a column the device doesn't have holds null
const Reading = z.object({
  ts: z.string(), fw: z.string(), temperature: num, humidity: num, light: num, soil: num, motion: z.boolean().nullable(),
  water_level: num, pressure: num, soil_temperature: num, battery: num, soil_rs485: num, ec: num,
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
      summary: "Reading history of one device from the database (at most 1,000 readings)",
      params: IdParam,
      querystring: Range,
      response: {
        200: z.object({
          device_id: z.string(), from: z.string(), to: z.string(), count: z.number(), truncated: z.boolean(),
          readings: z.array(Reading),
        }).describe("readings in that range, oldest first; truncated = there were more than 1,000 readings"),
        503: ErrorBody.describe("the database can't be reached right now"),
      },
    },
  }, async (req, reply) => {
    const toTime = req.query.to ? new Date(req.query.to) : new Date();
    const fromTime = req.query.from ? new Date(req.query.from) : new Date(toTime.getTime() - 60 * 60 * 1000);
    try {
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
