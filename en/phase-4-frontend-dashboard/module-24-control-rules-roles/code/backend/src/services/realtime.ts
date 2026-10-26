// realtime.ts - Socket.IO: data flows to the terminal and the browser without a refresh (Module 19), locked in Module 20.
// Every device has one room named "device:<device_id>". A client that wants to watch one device sends
// "follow", and then receives only that device's telemetry. Status changes and the event log go to every client.
// Socket.IO answers /socket.io/ requests itself BEFORE Fastify sees them, so the Fastify guard (onRequest hook) does NOT
// guard this door: Socket.IO has its own guard (allowRequest + io.use) with the same rules and the same cookie.
import { Server } from "socket.io";
import type { FastifyInstance } from "fastify";
import { DeviceId } from "../schemas/contract.ts";
import type { Status, TelemetryNode1, TelemetryNode2 } from "../schemas/contract.ts";
import type { SavedEvent } from "../db/archive.ts";
import { findDevice } from "./store.ts";
import { env } from "../config/env.ts";
import { ALLOWED_ORIGINS, ACCESS_COOKIE } from "../auth/security.ts";
import type { TokenPayload } from "../auth/security.ts";

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

// Module 20: the data the server remembers for every client: the content of its wristband (access JWT) when it connected
interface SocketData {
  user: TokenPayload & { iat: number; exp: number };
}

let io: Server<FromClient, ToClient, Record<string, never>, SocketData> | undefined;

export function startRealtime(app: FastifyInstance): void {
  io = new Server<FromClient, ToClient, Record<string, never>, SocketData>(app.server, { // rides on Fastify's HTTP server
    cors: { origin: env.CORS_ORIGIN, credentials: true }, // the same origin list as the API (Module 22)
    // Module 20: the page's origin follows the SAME rule as the guard: no Origin = a Node client (the small terminal)
    allowRequest: (req, callback) => callback(null, req.headers.origin === undefined || ALLOWED_ORIGINS.has(req.headers.origin)),
  });
  // Module 20: the Socket.IO door guard. It runs once when a client connects (the handshake), with the same cookie.
  io.use((socket, next) => {
    const cookie = app.parseCookie(socket.request.headers.cookie ?? "");
    const token = cookie[ACCESS_COOKIE];
    if (token === undefined) return next(new Error("not logged in"));
    try {
      socket.data.user = app.jwt.verify<TokenPayload & { iat: number; exp: number }>(token);
      next();
    } catch {
      next(new Error("session expired or invalid: refresh or log in again"));
    }
  });
  io.on("connection", (socket) => {
    const { sub, role, sid, exp } = socket.data.user;
    app.log.info(`realtime client connected: ${socket.id} (account ${sub}, ${role})`);
    void socket.join(`session:${sid}`); // logging out of this session = cut all its connections (disconnectSession)
    // the wristband is only checked at the door: when it expires, the connection is cut; the client refreshes, reconnects
    const expiry = setTimeout(() => socket.disconnect(true), exp * 1000 - Date.now());
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
    socket.on("disconnect", (reason) => {
      clearTimeout(expiry);
      app.log.info(`realtime client disconnected: ${socket.id} (${reason})`);
    });
  });
  // When the server is closed gracefully, disconnect every Socket.IO client first; otherwise app.close() waits for them.
  app.addHook("preClose", (done) => {
    io?.local.disconnectSockets(true);
    done();
  });
}

// Module 20: a logout or a revoked session -> cut all the Socket.IO connections of that session
export function disconnectSession(sid: number): void {
  io?.in(`session:${sid}`).disconnectSockets(true);
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
