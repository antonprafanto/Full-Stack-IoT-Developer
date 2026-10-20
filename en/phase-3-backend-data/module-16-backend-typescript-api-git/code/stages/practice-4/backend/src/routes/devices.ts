// devices.ts - the /devices routes: the list of devices ever heard.
import type { FastifyPluginAsync } from "fastify";
import { allDevices } from "../services/store.ts";

export const deviceRoutes: FastifyPluginAsync = async (app) => {
  app.get("/devices", async () => {
    return allDevices().map((d) => ({
      device_id: d.device_id,
      kind: d.kind,
      status: d.status,
      last_seen: d.last_seen,
    }));
  });
};
