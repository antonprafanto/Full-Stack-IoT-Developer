// bridge.ts - Module 27 Challenge 3: the status message of the home gateway (Pi) bridge, from the central broker.
// A bridge with "notifications true" writes 1 (connected) in the topic $SYS/broker/connection/<name>/state on the central
// broker, and leaves a will of 0 (down): when the home internet goes down, the central broker itself publishes 0 as soon as
// it notices its bridge is silent (±1.5 minutes; bridge keepalive 60 seconds). Both are retained messages, so a backend that
// has just started knows the last state at once. The backend passes it to the dashboard as the Socket.IO event "bridge".
import type { FastifyBaseLogger } from "fastify";
import { broadcastBridge } from "./realtime.ts";

export interface BridgeState {
  connected: boolean;
  // when the backend HEARD the change (ISO, UTC); null = an old retained message, the real time is unknown
  since: string | null;
}

const bridges = new Map<string, BridgeState>(); // bridge name (remote_clientid, e.g. pi-bridge) -> state

export function allBridges(): [string, BridgeState][] {
  return [...bridges];
}

// topic = $SYS/broker/connection/<name>/state, text = "1" or "0"
export function receiveBridgeStatus(topic: string, text: string, retained: boolean, log: FastifyBaseLogger): void {
  const parts = topic.split("/");
  if (parts.length !== 5 || (text !== "0" && text !== "1")) return; // not a bridge status message we know
  const name = parts[3];
  const connected = text === "1";
  if (bridges.get(name)?.connected === connected) return; // unchanged
  const state: BridgeState = { connected, since: retained ? null : new Date().toISOString() };
  bridges.set(name, state);
  if (connected) log.info(`bridge ${name} connected`);
  else log.warn(`bridge ${name} DISCONNECTED: data from home is held at the gateway until it reconnects`);
  broadcastBridge(name, state);
}
