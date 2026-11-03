// ota.ts - over-the-air firmware updates (OTA) on the server side (Module 28).
// The flow (contract 1.6): the admin presses Update -> requestUpdate() checks the conditions -> cmd "update" (QoS 1, NOT retained)
// -> ack ok:true within 5 seconds = the device ACCEPTED the command (not finished yet!) -> the device publishes the status
// offline-mode, disconnects from MQTT cleanly, downloads the file through the locked route /fw (status "downloading"), checks it,
// then restarts -> the new firmware is valid if within 60 seconds it connects to the broker and publishes; if not, the device
// goes back to the old version by itself (rollback) -> the result is reported in vitals.ota -> recordUpdateVitals() closes the row.
// No word for OTA_TIMEOUT_MINUTES -> expired (the watcher below).
// The server DECIDES and sends the command; a device never checks by itself every hour "is there a new version".
import { env } from "../config/env.ts";
import { getRelease, updateCandidates, oneCandidate, recordFwDb, recordResetReasonDb, expireUpdates,
  reportUpdateResult, startUpdate, knownUpdate, canarySummary, concludeUpdate, markDownloading,
  changeUpdateStatus } from "../db/fleet.ts";
import type { UpdateRow, ReleaseRow, UpdateCandidate } from "../db/fleet.ts";
import type { Vitals } from "../schemas/contract.ts";
import { findDevice, waitForAck } from "./store.ts";
import { brokerConnected, makeCommandId, sendUpdate } from "./mqtt.ts";
import { recordEvent } from "./events.ts";
import { broadcastOta } from "./realtime.ts";
import { compareVersions } from "./version.ts";
import { log } from "./log.ts";

const ACK_TIMEOUT_MS = 5000; // every cmd is answered by an ack within 5 seconds (contract rule 4)
export const FOLDER: Record<string, string> = { node1: "node-1" }; // the kind in the database -> the folder and URL path (Appendix A)

// The result of one update command. "accepted" = ack ok:true; "no-ack" = sent but not answered within 5 seconds (the result
// may still come through vitals, or expire); "rejected" = ack ok:false; "not-sent" = the conditions aren't met.
export type UpdateResult =
  | { status: "accepted" | "no-ack"; id: string; device_id: string; from: string | null; to: string; wait_ms: number }
  | { status: "rejected"; id: string; device_id: string; message: string }
  | { status: "not-sent"; device_id: string; code: 404 | 409 | 503; message: string };

// The state of a device that decides whether it may be sent an update (from the database + the latest status in memory).
export interface CandidateState {
  kind: string;
  registered: boolean;
  revoked: boolean;
  status: string;
  fw: string | null;
  running: boolean;
}

// The Module 28 rules (D14), a pure function tested by Vitest. null = may be sent; otherwise the HTTP code and the reason.
//   many  = a command for many devices at once ("update canary" / "update all"): a TEST release is refused
//   force = the admin installs a version OLDER than the current one on purpose
export function blockedReason(d: CandidateState, release: Pick<ReleaseRow, "version" | "test" | "withdrawn_at"> | undefined,
  options: { many?: boolean; force?: boolean } = {}): { code: 404 | 409; message: string } | null {
  if (!d.registered) return { code: 404, message: "device not registered yet" };
  if (d.revoked) return { code: 409, message: "device already deactivated (its key revoked)" };
  if (d.kind === "node2") return { code: 409, message: "Node 2 (ESP-NOW) can't be updated over the air: update it by cable" };
  if (d.kind !== "node1") return { code: 409, message: "device kind not known yet: wait for its first telemetry" };
  if (release === undefined) return { code: 404, message: "that firmware version hasn't been uploaded yet" };
  if (release.withdrawn_at !== null) return { code: 409, message: `firmware ${release.version} already withdrawn` };
  if (release.test && options.many) {
    return { code: 409, message: `${release.version} TEST release: only for one device (Update per device), never for all` };
  }
  if (d.status !== "online") {
    return { code: 409, message: `device is ${d.status}: update commands are only sent to online devices (not queued)` };
  }
  if (d.running) return { code: 409, message: "the device is still running another update" };
  if (d.fw === release.version) return { code: 409, message: `device is already running ${release.version}` };
  if (d.fw !== null && compareVersions(release.version, d.fw) < 0 && !options.force) {
    return { code: 409, message: `downgrade (${d.fw} to ${release.version}): send with force if it's on purpose` };
  }
  return null;
}

// database + memory: the status in the store (from the latest status message) is fresher than the devices.status column
function candidateState(c: UpdateCandidate): CandidateState {
  const m = findDevice(c.device_id);
  return { kind: m?.kind !== undefined && m.kind !== "unknown" ? m.kind : c.kind, registered: c.registered_at !== null,
    revoked: c.revoked_at !== null, status: m?.status ?? c.status, fw: lastFw.get(c.device_id) ?? c.fw, running: c.running };
}

// The same conditions for every device: the backend is connected to the broker and knows its download address.
function serverReason(): string | null {
  if (env.SERVER_URL === "") return "SERVER_URL not set in .env: the devices don't know where to download firmware from";
  if (!brokerConnected()) return "the backend isn't connected to the broker right now";
  return null;
}

// Send one update command to one device that ALREADY passed blockedReason(), then wait for its ack.
async function sendOne(deviceId: string, from: string | null, release: ReleaseRow, canary: boolean, requestedBy: string):
  Promise<UpdateResult> {
  const id = makeCommandId();
  if (!(await startUpdate({ id, deviceId, from, to: release.version, canary, requestedBy }))) {
    return { status: "not-sent", device_id: deviceId, code: 409, message: "the device is still running another update" };
  }
  const url = `${env.SERVER_URL}/fw/${FOLDER[release.kind]}/${release.version}.bin`;
  const start = Date.now();
  const waiting = waitForAck(id, ACK_TIMEOUT_MS); // start waiting BEFORE sending, like a set command
  sendUpdate(deviceId, id, { version: release.version, url, sha256: release.sha256, size: release.size });
  log.info(`update ${id} to ${deviceId}: ${from ?? "?"} → ${release.version} (${release.size} bytes)${canary ? ", canary" : ""}`);
  const ack = await waiting;
  const elapsed = Date.now() - start;
  if (ack === null) {
    log.warn(`update ${id} to ${deviceId}: no ack within 5 seconds; the result waits for the device's vitals or expires`);
    return { status: "no-ack", id, device_id: deviceId, from, to: release.version, wait_ms: elapsed };
  }
  if (!ack.ok) {
    const row = await changeUpdateStatus(id, deviceId, "rejected", ack.message ?? null, ["sent"]);
    if (row !== undefined) announce(row, "device");
    return { status: "rejected", id, device_id: deviceId, message: ack.message ?? "" };
  }
  // ack ok:true = ACCEPTED, not finished. If the device already started downloading, the status "downloading" stays.
  const row = await changeUpdateStatus(id, deviceId, "accepted", null, ["sent"]);
  if (row !== undefined) announce(row, "device");
  return { status: "accepted", id, device_id: deviceId, from, to: release.version, wait_ms: elapsed };
}

// POST /devices/:id/update: one device, one version. A test release is allowed (one device).
export async function requestUpdate(deviceId: string, version: string, requestedBy: string, force = false): Promise<UpdateResult> {
  const server = serverReason();
  if (server !== null) return { status: "not-sent", device_id: deviceId, code: 503, message: server };
  const candidate = await oneCandidate(deviceId);
  if (candidate === undefined) return { status: "not-sent", device_id: deviceId, code: 404, message: "device not registered yet" };
  const release = await getRelease("node1", version);
  const state = candidateState(candidate);
  const reason = blockedReason(state, release, { force });
  if (reason !== null || release === undefined) {
    return { status: "not-sent", device_id: deviceId, code: reason?.code ?? 404, message: reason?.message ?? "" };
  }
  return sendOne(deviceId, state.fw, release, candidate.canary, requestedBy);
}

// The result of POST /fleet/update
export interface FleetResult {
  version: string;
  target: "canary" | "all";
  sent: UpdateResult[];
  skipped: { device_id: string; reason: string }[];
}

// POST /fleet/update: the canary first, then all (D14). "all" is only allowed after at least one canary SUCCEEDED with this
// version and no canary rolled back/failed with it. A Node 1 that doesn't meet the conditions (offline, deactivated, already
// running that version, ...) is skipped with its reason, without a queue. Node 2 is never a candidate (updateCandidates()).
export async function updateFleet(version: string, target: "canary" | "all", requestedBy: string, force = false):
  Promise<FleetResult | { code: 404 | 409 | 503; message: string }> {
  const server = serverReason();
  if (server !== null) return { code: 503, message: server };
  const release = await getRelease("node1", version);
  if (release === undefined) return { code: 404, message: `firmware node1 ${version} not uploaded yet` };
  if (release.withdrawn_at !== null) return { code: 409, message: `firmware ${version} already withdrawn` };
  if (release.test) return { code: 409, message: `${version} TEST release: only through Update per device, never for many devices` };
  if (target === "all") {
    const canary = await canarySummary("node1", version);
    if (canary.failed > 0) {
      return { code: 409, message: `${canary.failed} canary device(s) failed or rolled back on ${version}: check first, don't spread it` };
    }
    if (canary.succeeded === 0) {
      return { code: 409, message: `no canary device has run ${version} successfully yet: update the canary first` };
    }
  }
  const allCandidates = (await updateCandidates()).filter((c) => target === "all" || c.canary);
  if (allCandidates.length === 0) {
    return { code: 409, message: target === "canary" ? "no canary device yet: tick Canary on a device card on the Fleet screen first"
      : "no registered Node 1 yet" };
  }
  const skipped: FleetResult["skipped"] = [];
  const sent: Promise<UpdateResult>[] = [];
  for (const c of allCandidates) {
    const state = candidateState(c);
    const reason = blockedReason(state, release, { many: true, force });
    if (reason !== null) skipped.push({ device_id: c.device_id, reason: reason.message });
    else sent.push(sendOne(c.device_id, state.fw, release, c.canary, requestedBy)); // all at once, not one by one
  }
  return { version, target, sent: await Promise.all(sent), skipped };
}

// The news of one update status change: the log, the event log (kind ota, the Socket.IO "event"), and the Socket.IO "ota" event
// for the /fleet page.
function announce(u: UpdateRow, source: "api" | "device"): void {
  const from = u.from_version ?? "?";
  const sentences: Record<string, string> = {
    accepted: `${u.device_id} accepted the update command ${from} → ${u.to_version}`,
    downloading: `${u.device_id} is downloading firmware ${u.to_version}`,
    rejected: `${u.device_id} rejected update ${u.to_version}: ${u.message ?? "no reason"}`,
    succeeded: `${u.device_id} updated successfully ${from} → ${u.to_version}`,
    rollback: `${u.device_id} FAILED to run ${u.to_version} and went back to ${from} by itself (rollback)`,
    failed: `${u.device_id} failed to install ${u.to_version}, still running ${from}: ${u.message ?? "no reason"}`,
    expired: `update ${u.device_id} to ${u.to_version} expired: no word for ${env.OTA_TIMEOUT_MINUTES} minutes`,
  };
  const message = (sentences[u.status] ?? `${u.device_id} update ${u.to_version}: ${u.status}`)
    + (u.message?.startsWith("concluded by the server") ? " (concluded by the server, the device's report didn't arrive)" : "");
  if (u.status === "succeeded" || u.status === "accepted" || u.status === "downloading") log.info(message);
  else log.warn(message);
  if (u.status !== "downloading") { // "downloading" is enough on Socket.IO: the event log needn't have a row per small step
    recordEvent({ device_id: u.device_id, kind: "ota", source, rule_id: null, message,
      data: { id: u.id, status: u.status, from: u.from_version, to: u.to_version, message: u.message } });
  }
  broadcastOta({ device_id: u.device_id, id: u.id, status: u.status, from: u.from_version, to: u.to_version, message: u.message,
    time: u.updated_at.toISOString().slice(0, 19) + "Z" });
}

function dbFailed(what: string) {
  return (error: Error) => log.error(`failed to ${what} in the database: ${error.message}`);
}

// ---------- from the device's messages ----------

// The last version per device (telemetry every 10 seconds): the database is only written when the version changes, or at most
// once every 10 minutes (so that fw_seen_at stays fresh).
const lastFw = new Map<string, string>();
const fwWritten = new Map<string, number>();
const FW_REFRESH_MS = 10 * 60_000;

export function recordFw(deviceId: string, fw: string): void {
  const now = Date.now();
  if (lastFw.get(deviceId) === fw && now - (fwWritten.get(deviceId) ?? 0) < FW_REFRESH_MS) return;
  lastFw.set(deviceId, fw);
  fwWritten.set(deviceId, now);
  recordFwDb(deviceId, fw).catch(dbFailed(`record fw ${deviceId}`));
}

// Called by mqtt.ts for every vitals that passes the contract: fw, reset_reason, and the update report (contract 1.6).
export function recordUpdateVitals(deviceId: string, v: Vitals): void {
  if (v.fw !== undefined) recordFw(deviceId, v.fw);
  if (v.reset_reason !== undefined) recordResetReasonDb(deviceId, v.reset_reason).catch(dbFailed(`record reset_reason ${deviceId}`));
  if (v.ota !== undefined) {
    const { id, result, version, message } = v.ota;
    reportUpdateResult(id, deviceId, result, message ?? null)
      .then(async (row) => {
        // the same report is repeated in several vitals (contract 1.6): the second and third change nothing. A report
        // whose id this server NEVER sent is recorded as a warning (an update command from another account?).
        if (row === undefined) {
          if (!(await knownUpdate(id, deviceId))) announceForeignReport(deviceId, id, result, version);
          return;
        }
        if (row.to_version !== version) log.warn(`ota report ${id} from ${deviceId} names ${version}, but its command was ${row.to_version}`);
        announce(row, "device");
      })
      .catch(dbFailed(`record the update result ${id}`));
  } else if (v.fw !== undefined) { // a report can get lost (vitals QoS 0): the server concludes from the version and uptime
    concludeUpdate(deviceId, v.fw, v.uptime_s)
      .then((rows) => { for (const r of rows) announce(r, "device"); })
      .catch(dbFailed(`conclude the update of ${deviceId}`));
  }
}

// An update report whose id is unknown = an update this dashboard did NOT order, for example an update from
// another account that may write msh/+/cmd (nodered, Module 13). Before, such a report was quietly thrown away (an M28
// verification finding). Once per report: the device repeats it in up to 3 vitals.
const foreignReports = new Set<string>();
function announceForeignReport(deviceId: string, id: string, result: string, version: string): void {
  const key = `${deviceId} ${id}`;
  if (foreignReports.has(key)) return;
  if (foreignReports.size >= 200) foreignReports.clear(); // a small memory only
  foreignReports.add(key);
  const message = `${deviceId} reports update ${id} (${result} ${version}) that this server didn't send: an update command `
    + "from another account that may write msh/+/cmd? Check who holds its password";
  log.warn(message);
  recordEvent({ device_id: deviceId, kind: "ota", source: "device", rule_id: null, message,
    data: { id, result, version, known: false } });
}

// Called by the /fw route when a valid device starts downloading the file of that version.
export function recordDownloadStart(deviceId: string, version: string): void {
  markDownloading(deviceId, version)
    .then((row) => { if (row !== undefined) announce(row, "device"); })
    .catch(dbFailed(`mark the download of ${deviceId}`));
}

// ---------- the expiry watcher ----------

let watcher: ReturnType<typeof setInterval> | undefined;

export function startUpdateWatcher(): void {
  watcher = setInterval(() => {
    expireUpdates(env.OTA_TIMEOUT_MINUTES)
      .then((rows) => { for (const r of rows) announce(r, "api"); })
      .catch(() => {}); // the database is down: tried again 30 seconds later
  }, 30_000);
}

export function stopUpdateWatcher(): void {
  clearInterval(watcher);
}
