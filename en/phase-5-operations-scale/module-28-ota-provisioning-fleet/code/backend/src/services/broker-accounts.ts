// broker-accounts.ts - every device's broker account is created, changed, and deleted AUTOMATICALLY by the backend (Module 28),
// through Mosquitto 2.1's "dynamic security" plugin (mosquitto_dynamic_security.so, already in the eclipse-mosquitto:2.1.2-alpine image).
// That plugin takes commands as JSON on the control topic $CONTROL/dynamic-security/v1 and answers on .../response.
// No mosquitto_passwd and no broker reload: a new account can be used right away, a deleted account is disconnected right away.
//
// Which broker are the commands sent to? The setting AUTO_BROKER_ACCOUNTS (config/env.ts):
//   center         -> $CONTROL/dynamic-security/v1 at the central broker (where the backend is connected)
//   gateway:pi1    -> msh-gateway/pi1/dynamic-security/v1 at the central broker. The bridge of the Pi gateway named pi1 moves it to
//                     $CONTROL/dynamic-security/v1 at the GATEWAY broker (two "topic" lines in edge/bridge.example.conf), then
//                     brings the answer back. Node 1 connects to the gateway broker, so its account must be there.
//   off            -> no commands: accounts are made by hand as in Module 21
// A device's topic permissions STAY the %u pattern in edge/acl-broker (Module 21), for WRITING and READING: dynamic security
// accounts get no role at all, and for an account without a role whose permission is "deny", the plugin leaves the decision to
// acl-broker. The WRITE default is "deny" ever since the plugin makes its file, but the READ default (publishClientReceive) = "allow":
// without denyDefaultRead() below, a device account could read other devices' msh/# and $SYS (an M28 code verification finding).
// Who may write the control topic? Only the backend account (edge/acl-broker block 3). Whoever can write it
// is the "admin" of the broker accounts, so never give another account that permission (or the permission "#").
import { randomUUID } from "node:crypto";
import { env } from "../config/env.ts";
import { publishControl } from "./mqtt.ts";
import { log } from "./log.ts";

export const ANSWER_LIMIT_MS = 3000; // a healthy broker (or a gateway through the bridge) answers within tens of milliseconds

interface Answer {
  command: string;
  error?: string; // present = the command failed, for example "Client already exists" or "Client not found"
  correlationData?: string;
}

// The command topic and its answer topic, or null if AUTO_BROKER_ACCOUNTS=off.
export function controlTopic(): { command: string; answer: string } | null {
  const mode = env.AUTO_BROKER_ACCOUNTS;
  if (mode.kind === "off") return null;
  const command = mode.kind === "center" ? "$CONTROL/dynamic-security/v1" : `msh-gateway/${mode.name}/dynamic-security/v1`;
  return { command, answer: `${command}/response` };
}

// For log sentences and steps: "central broker", "gateway broker pi1", or "by hand (Module 21)".
export function accountPlace(): string {
  const mode = env.AUTO_BROKER_ACCOUNTS;
  return mode.kind === "center" ? "central broker" : mode.kind === "gateway" ? `gateway broker ${mode.name}` : "by hand (Module 21)";
}

// Commands waiting for an answer, by their correlationData (a unique mark the broker sends back as it is).
const waiting = new Map<string, (answer: Answer) => void>();

// Called by mqtt.ts for every message on the answer topic. Its content is {"responses":[{...}, ...]}.
export function deliverControlAnswer(text: string): void {
  let content: { responses?: Answer[] };
  try {
    content = JSON.parse(text) as { responses?: Answer[] };
  } catch {
    return; // not JSON: not a plugin answer
  }
  for (const answer of content.responses ?? []) {
    if (answer.correlationData !== undefined) waiting.get(answer.correlationData)?.(answer);
  }
}

// Send once, wait at most 3 seconds for its answer. The order MATTERS: publish FIRST, only then set the timer.
// (The M28 lab's draft code set the timer first; while the backend wasn't connected to the broker, its timeout error
// wasn't caught by anyone and killed the whole backend process: "unhandled rejection".)
function sendOnce(command: Record<string, unknown>): Promise<Answer> {
  const topic = controlTopic();
  if (topic === null) return Promise.reject(new Error("AUTO_BROKER_ACCOUNTS=off: broker accounts are made by hand"));
  const correlation = randomUUID();
  const content = JSON.stringify({ commands: [{ ...command, correlationData: correlation }] });
  if (!publishControl(topic.command, content)) return Promise.reject(new Error("the backend isn't connected to the broker right now"));
  return new Promise<Answer>((done, fail) => {
    const timer = setTimeout(() => {
      waiting.delete(correlation);
      fail(new Error(`${accountPlace()} didn't answer ${String(command.command)} within ${ANSWER_LIMIT_MS / 1000} seconds`));
    }, ANSWER_LIMIT_MS);
    waiting.set(correlation, (answer) => {
      clearTimeout(timer);
      waiting.delete(correlation);
      done(answer);
    });
  });
}

// One dynamic security command: no answer within 3 seconds = tried ONCE more (for example the Pi bridge has just connected
// again and the first command got lost on the way, like a cmd the bridge doesn't hold, contract rule 11). Failing twice =
// an error; the caller answers 503 and changes NOTHING in the database.
export async function controlCommand(command: Record<string, unknown>): Promise<Answer> {
  try {
    return await sendOnce(command);
  } catch (error) {
    log.warn(`broker accounts: ${(error as Error).message}; trying once more`);
    return await sendOnce(command);
  }
}

// The default READ permission for accounts without a role = deny (setDefaultACLAccess publishClientReceive), so that the
// pattern "pattern read msh/%u/cmd" in acl-broker applies: a device only receives its own cmd. Sent before EVERY
// device account is created: cheap (one command, tens of milliseconds), unchanged when repeated, stored in that broker's
// dynamic-security.json (survives restarts, goes with the backup script), and still right even if the gateway broker was just
// recreated. Fails = an error, the account isn't created (the caller answers 503).
let defaultReadLogged = false;
async function denyDefaultRead(): Promise<void> {
  const answer = await controlCommand({ command: "setDefaultACLAccess", acls: [{ acltype: "publishClientReceive", allow: false }] });
  if (answer.error !== undefined) throw new Error(`setDefaultACLAccess: ${answer.error}`);
  if (!defaultReadLogged) { // once per backend start is enough: the log needn't have one line per device
    defaultReadLogged = true;
    log.info(`broker accounts: default read permission of device accounts at ${accountPlace()} = deny (the acl-broker %u pattern applies)`);
  }
}

// Broker account steps run ONE AT A TIME (a queue). Every step (register, key rotation, claim, Deactivate) holds
// one database connection (its transaction) while it waits for the broker's answer: while the broker or the bridge is silent, up to ±6 seconds.
// The backend's database pool has only 5 connections (db/pool.ts), so five steps at once while the broker is silent = the whole
// backend without a database (GET /devices answers 503 too; an M28 code verification finding). With a queue, at most ONE connection
// waits for the broker. A step that has waited for its turn more than 5 seconds isn't carried out at all: an error (503),
// the database and the broker aren't touched, the claim code isn't used up, and the claiming board doesn't wait too long.
export const QUEUE_LIMIT_MS = 5000;
let queueTail: Promise<unknown> = Promise.resolve();
export function accountQueue<T>(work: () => Promise<T>): Promise<T> {
  if (controlTopic() === null) return work(); // AUTO_BROKER_ACCOUNTS=off: there's no broker to wait for
  const queuedAt = Date.now();
  const turn = queueTail.then(() => {
    if (Date.now() - queuedAt > QUEUE_LIMIT_MS) {
      throw new Error(`the previous broker account step hasn't finished after ${QUEUE_LIMIT_MS / 1000} seconds (${accountPlace()} slow?)`);
    }
    return work();
  });
  queueTail = turn.catch(() => undefined); // an error in this step doesn't stop the queue
  return turn;
}

// An account for a device that was just registered/claimed (created), or a new key for an account that already exists (changed; a
// device connected with the old key is disconnected by the broker at once). "manual" = AUTO_BROKER_ACCOUNTS=off.
export async function addDeviceAccount(deviceId: string, key: string): Promise<"created" | "changed" | "manual"> {
  if (controlTopic() === null) return "manual";
  await denyDefaultRead();
  const create = await controlCommand({ command: "createClient", username: deviceId, password: key,
    textname: "Mini Smart Home device (made by the backend)" });
  if (create.error === undefined) return "created";
  if (!/exist/i.test(create.error)) throw new Error(`createClient ${deviceId}: ${create.error}`);
  // the account already exists (the device was registered before, or the first attempt did arrive): change its key, then enable it
  const changed = await controlCommand({ command: "setClientPassword", username: deviceId, password: key });
  if (changed.error !== undefined) throw new Error(`setClientPassword ${deviceId}: ${changed.error}`);
  const enabled = await controlCommand({ command: "enableClient", username: deviceId });
  if (enabled.error !== undefined) throw new Error(`enableClient ${deviceId}: ${enabled.error}`);
  return "changed";
}

// Delete a device account (a lost/stolen device). The broker disconnects it at once ("administrative action") and
// refuses its next connection (code 5). THE WILL ISN'T PUBLISHED when it disconnects this way, so the "offline" status is written by
// the backend itself (routes/devices.ts). "none" = that account doesn't exist in dynamic security: usually an old Module 21 account in
// the broker password file, which must be deleted with mosquitto_passwd -D and then a broker restart.
export async function removeDeviceAccount(deviceId: string): Promise<"deleted" | "none" | "manual"> {
  if (controlTopic() === null) return "manual";
  const removed = await controlCommand({ command: "deleteClient", username: deviceId });
  if (removed.error === undefined) return "deleted";
  if (/not found/i.test(removed.error)) return "none";
  throw new Error(`deleteClient ${deviceId}: ${removed.error}`);
}
