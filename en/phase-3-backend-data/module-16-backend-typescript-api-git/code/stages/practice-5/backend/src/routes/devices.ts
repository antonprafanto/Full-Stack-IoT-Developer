// devices.ts - the /devices routes: the device list and the latest reading.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { DeviceId, Status, TelemetryNode1, TelemetryNode2 } from "../schemas/contract.ts";
import { findDevice, allDevices } from "../services/store.ts";

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
};
