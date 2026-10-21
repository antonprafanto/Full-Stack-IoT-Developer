// realtime.ts - Socket.IO: data flows to the terminal and the browser without a refresh (Module 19).
// Every device has one room named "device:<device_id>". A client that wants to watch one device sends
// "follow", and then receives only that device's telemetry. Status changes and the event log go to every client.
import { Server } from "socket.io";
import type { FastifyInstance } from "fastify";
import { DeviceId } from "../schemas/contract.ts";
import type { Status, TelemetryNode1, TelemetryNode2 } from "../schemas/contract.ts";
import type { SavedEvent } from "../db/archive.ts";
import { findDevice } from "./store.ts";

type Telemetry = TelemetryNode1 | TelemetryNode2;

// the server's answer to "follow" (a Socket.IO ack): success or not, and that device's last reading
interface FollowAnswer {
  ok: boolean;
  message?: string;
  latest?: Telemetry | null;
}

// events from the server to the client, with their content
interface ToClient {
  telemetry: (deviceId: string, content: Telemetry) => void;
  status: (deviceId: string, status: Status) => void;
  event: (event: SavedEvent) => void;
}

// events from the client to the server; "respond" is the Socket.IO ack
interface FromClient {
  follow: (deviceId: string, respond: (answer: FollowAnswer) => void) => void;
  unfollow: (deviceId: string) => void;
}

let io: Server<FromClient, ToClient> | undefined;

export function startRealtime(app: FastifyInstance): void {
  io = new Server<FromClient, ToClient>(app.server); // rides on Fastify's HTTP server, at the address /socket.io/
  io.on("connection", (socket) => {
    app.log.info(`realtime client connected: ${socket.id}`);
    socket.on("follow", (deviceId, respond) => {
      if (typeof respond !== "function") return; // the client didn't ask for an answer: ignore it
      if (!DeviceId.safeParse(deviceId).success) { // never trust the client, just as we never trust the device
        return respond({ ok: false, message: "device_id must be 12 lowercase hexadecimal digits" });
      }
      socket.join(`device:${deviceId}`);
      app.log.info(`client ${socket.id} follows ${deviceId}`);
      // messages missed while the client was disconnected aren't sent again, so send its last reading now
      respond({ ok: true, latest: findDevice(deviceId)?.telemetry ?? null });
    });
    socket.on("unfollow", (deviceId) => {
      socket.leave(`device:${deviceId}`);
    });
    socket.on("disconnect", (reason) => app.log.info(`realtime client disconnected: ${socket.id} (${reason})`));
  });
  // When the server is closed gracefully, disconnect every Socket.IO client first; otherwise app.close() waits for them.
  app.addHook("preClose", (done) => {
    io?.local.disconnectSockets(true);
    done();
  });
}

// send one telemetry ONLY to the clients that follow that device
export function broadcastTelemetry(deviceId: string, content: Telemetry): void {
  io?.to(`device:${deviceId}`).emit("telemetry", deviceId, content);
}

// send a status change to ALL clients
export function broadcastStatus(deviceId: string, status: Status): void {
  io?.emit("status", deviceId, status);
}

// send one row of the event log to ALL clients
export function broadcastEvent(event: SavedEvent): void {
  io?.emit("event", event);
}
