// devices.ts - the /devices routes: the device list, the latest reading, and commands.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { Ack, DeviceId, SetCommand, Status, TelemetryNode1, TelemetryNode2 } from "../schemas/contract.ts";
import { findDevice, allDevices, waitForAck } from "../services/store.ts";
import { brokerConnected, makeCommandId, sendCommand } from "../services/mqtt.ts";

const ErrorBody = z.object({ message: z.string() });
const Kind = z.enum(["node1", "node2", "unknown"]);
const IdParam = z.object({ id: DeviceId.describe("the device's device_id, for example a4cf12e5b7c0") });

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
    if (ack === null) {
      req.log.warn(`command ${commandId} to ${d.device_id}: no ack within 5 seconds`);
      return reply.code(504).send({ message: `no ack for ${commandId} within 5 seconds` });
    }
    req.log.info(`command ${commandId} to ${d.device_id}: ack ok=${ack.ok} in ${elapsed} ms`);
    return { id: commandId, wait_ms: elapsed, ack };
  });
};
