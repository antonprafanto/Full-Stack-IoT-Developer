// commands.ts - one door for ALL commands to the devices (Module 19): the API, automation rules, schedules, and Telegram
// use the same function, issueCommand(). It also records the state the server WANTS (desired) for the actuators whose
// state lasts (fan, lamp, curtain), then matches it against the state the device REPORTS (reported).
import type { Ack, State, SetCommand } from "../schemas/contract.ts";
import { findDevice, saveReport, waitForAck } from "./store.ts";
import { brokerConnected, makeCommandId, sendCommand } from "./mqtt.ts";
import { archiveCommand } from "../db/archive.ts";
import { recordEvent } from "./events.ts";
import { log } from "./log.ts";

export type Source = "api" | "rule" | "schedule" | "telegram"; // who gave the order

// The result of one command. "answered" = there is an ack (ok true or false), "no-ack" = no answer within 5 seconds,
// "not-sent" = the command wasn't published at all (the API uses its code as the HTTP code).
export type CommandResult =
  | { status: "answered"; id: string; wait_ms: number; ack: Ack }
  | { status: "no-ack"; id: string; wait_ms: number }
  | { status: "not-sent"; code: 404 | 409 | 503; message: string };

const ACK_TIMEOUT_MS = 5000; // every cmd is answered by an ack within 5 seconds (contract rule 4)
const RETRY_INTERVAL_MS = 30_000; // reconciliation: at most once every 30 seconds per actuator

// the pump has no lasting state: its command is a 1-10 second pulse that turns off by itself
type LastingCommand = Extract<SetCommand, { target: "fan" | "lamp" | "curtain" }>;

// One wish of the server for one actuator.
interface Wish {
  command: LastingCommand;
  source: Source;
  ruleId: number | null;
  triedAt: number; // when its command was last sent (milliseconds, like Date.now())
  fulfilled: boolean; // has the device ever reported the wished state?
}

const wishes = new Map<string, Map<string, Wish>>(); // device_id -> (target -> wish)
const ackPending = new Set<string>(); // "<device_id>/<target>" whose command is waiting for an ack

export async function issueCommand(deviceId: string, command: SetCommand, source: Source,
  ruleId: number | null = null): Promise<CommandResult> {
  const d = findDevice(deviceId);
  if (d === undefined) return { status: "not-sent", code: 404, message: `device ${deviceId} has never been heard` };
  if (d.kind === "node2") return { status: "not-sent", code: 409, message: "Node 2 doesn't accept commands (contract section 2)" };
  if (d.kind !== "node1") {
    return { status: "not-sent", code: 409, message: "device kind not known yet: wait for its first telemetry" };
  }
  if (d.status !== "online") return { status: "not-sent", code: 409, message: `device is ${d.status}, command not sent` };
  if (!brokerConnected()) return { status: "not-sent", code: 503, message: "the backend isn't connected to the broker" };
  const key = `${deviceId}/${command.target}`;
  if (ackPending.has(key)) { // one actuator, one command being waited for
    return { status: "not-sent", code: 409, message: `the previous ${command.target} command is still waiting for its ack` };
  }

  if (command.target !== "pump") recordWish(deviceId, command, source, ruleId);
  const id = makeCommandId();
  const start = Date.now();
  ackPending.add(key);
  const waiting = waitForAck(id, ACK_TIMEOUT_MS); // start waiting BEFORE sending
  sendCommand(deviceId, id, command);
  const ack = await waiting;
  ackPending.delete(key);
  const elapsed = Date.now() - start;
  archiveCommand(id, deviceId, command, new Date(start), ack, elapsed, source, ruleId)
    .catch((error) => log.error(`couldn't record command ${id} in the database: ${error.message}`));
  if (ack === null) {
    log.warn(`command ${id} (${source}) to ${deviceId}: no ack within 5 seconds`);
    return { status: "no-ack", id, wait_ms: elapsed };
  }
  if (!ack.ok) wishes.get(deviceId)?.delete(command.target); // refused by the device: don't try again
  log.info(`command ${id} (${source}) to ${deviceId}: ${command.target} = ${command.value}, ack ok=${ack.ok} in ${elapsed} ms`);
  return { status: "answered", id, wait_ms: elapsed, ack };
}

function recordWish(deviceId: string, command: LastingCommand, source: Source, ruleId: number | null): void {
  let deviceWishes = wishes.get(deviceId);
  if (deviceWishes === undefined) {
    deviceWishes = new Map();
    wishes.set(deviceId, deviceWishes);
  }
  deviceWishes.set(command.target, { command, source, ruleId, triedAt: Date.now(), fulfilled: false });
}

// Called by mqtt.ts every time a telemetry or ack of a device arrives. state = the state in that message (null for
// telemetry from older firmware that doesn't carry state yet).
export function recordReport(deviceId: string, state: State | null, ts: string | null): void {
  if (state !== null && saveReport(deviceId, state, ts)) {
    for (const w of wishes.get(deviceId)?.values() ?? []) {
      if (state[w.command.target] === w.command.value) w.fulfilled = true;
    }
  }
  reconcile(deviceId);
}

// Reconciliation: send again the wishes the device hasn't been seen carrying out YET. A wish that was fulfilled once
// isn't forced again: if a local rule of the device or MQTTX changes the actuator afterwards, the server doesn't fight it.
function reconcile(deviceId: string): void {
  const d = findDevice(deviceId);
  if (d === undefined || d.reported === null || d.status !== "online") return;
  for (const w of wishes.get(deviceId)?.values() ?? []) {
    const { target, value } = w.command;
    if (w.fulfilled || d.reported[target] === value) continue; // already as wished
    if (ackPending.has(`${deviceId}/${target}`)) continue; // the previous command is still being waited for
    if (Date.now() - w.triedAt < RETRY_INTERVAL_MS) continue; // too soon: wait first
    const message = `${target} ${deviceId} reported ${d.reported[target]}, but ${value} is desired (${w.source}); `
      + "command sent again";
    log.warn(`reconcile: ${message}`);
    recordEvent({ device_id: deviceId, kind: "command", source: w.source, rule_id: w.ruleId, message, data: w.command });
    void issueCommand(deviceId, w.command, w.source, w.ruleId);
  }
}

// Called by mqtt.ts when vitals carries a small uptime_s: the device has just started (again), and all its relays are off
// at startup. Even the wishes that were already fulfilled are reconciled again.
export function deviceRestarted(deviceId: string, uptime: number): void {
  const list = wishes.get(deviceId);
  if (list === undefined || list.size === 0) return;
  log.warn(`${deviceId} has just restarted (uptime ${uptime} seconds): the server's wishes are reconciled again`);
  for (const w of list.values()) w.fulfilled = false;
}

// For GET /devices/:id/state: desired, reported, when reported arrived, and the actuators that don't match yet.
export function deviceState(deviceId: string) {
  const d = findDevice(deviceId);
  if (d === undefined) return undefined;
  const desired: { fan?: boolean; lamp?: boolean; curtain?: number } = {};
  const diff: string[] = [];
  for (const { command } of wishes.get(deviceId)?.values() ?? []) {
    if (command.target === "curtain") desired.curtain = command.value;
    else desired[command.target] = command.value;
    if (d.reported === null || d.reported[command.target] !== command.value) diff.push(command.target);
  }
  return { device_id: deviceId, desired, reported: d.reported, reported_at: d.reported_at, diff };
}
