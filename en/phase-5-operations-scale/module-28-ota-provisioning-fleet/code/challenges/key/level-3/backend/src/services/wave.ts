// wave.ts - Module 28 Challenge 3 (key): an automatic firmware update in WAVES for many devices.
// The "Update all" button (Module 28) sends to every device AT ONCE after one canary has succeeded. The automatic wave is
// more careful, and doesn't need to be watched:
//   1. the canary first: every Node 1 marked canary is updated;
//   2. a healthy wait: the canaries already running the new version must stay healthy for 10 minutes (online, still the new version,
//      no restart), checked every 5 seconds;
//   3. the rest step by step: wave 1 = 2 devices, wave 2 = 4, then 8, and so on (twice as many). The next wave
//      is only sent after ALL the devices of the previous wave are finished.
// EMERGENCY BRAKE: just one device going back to the old version (rollback), failing, or without word until OTA_TIMEOUT_MINUTES
// (expired) = the wave STOPS and the rest aren't sent. Skipped devices (offline, kind not known yet, refusing the command) don't
// pull the brake: they are noted in the summary.
// Telegram: ONE summary per stage (canary, wave 1, wave 2, ...), replacing two messages per device
// (🔄 stopped on purpose and ✅ online again, telegram.ts). The 📴 "hasn't come back" message is still sent per device: that's a danger sign.
// The wave lives in the backend's memory: a backend restart = the wave stops and doesn't continue by itself.
import { getRelease, updateCandidates, canarySummary } from "../db/fleet.ts";
import type { UpdateRow } from "../db/fleet.ts";
import { findDevice } from "./store.ts";
import { requestUpdate } from "./ota.ts";
import type { UpdateResult } from "./ota.ts";
import { muteStopNotice, notify } from "./telegram.ts";
import { log } from "./log.ts";

export const DEFAULT_WAIT_MINUTES = 10; // the canary's healthy waiting period; a request may shorten it (the author's lab: 1 minute)
export const DEFAULT_INITIAL_SIZE = 2; // the first wave after the canary
const WATCH_MS = 5000; // the canary is checked every 5 seconds during the waiting period
const BOOT_TIME_SLACK_MS = 10_000; // the estimated boot time may drift a few seconds before it counts as "restarted"
const BRAKE = new Set(["rollback", "failed", "expired"]); // the results that pull the emergency brake
const FINAL = new Set(["succeeded", "rollback", "failed", "expired"]); // the final results reported through ota.ts

// the result of one device in this wave. already = already running that version before (not sent)
export type DeviceWaveStatus = "running" | "succeeded" | "already" | "rollback" | "failed" | "expired" | "rejected" | "skipped";
export interface DeviceResult { status: DeviceWaveStatus; message: string | null }
export interface Stage { name: string; devices: string[] }

// ---------- pure logic (tested by Vitest without the database, the broker, and Telegram) ----------

// Split the device list into waves that grow: initialSize, then twice as many with every wave.
// For example 20 devices with initialSize 2 -> 2, 4, 8, 6.
export function splitWaves(list: string[], initialSize: number): string[][] {
  const result: string[][] = [];
  let start = 0;
  let size = initialSize;
  while (start < list.length) {
    result.push(list.slice(start, start + size));
    start += size;
    size *= 2;
  }
  return result;
}

// The verdict of one stage from the result of each of its devices: "brake" if one did rollback/failed/expired (even if others are
// still running), "waiting" if some are still running, otherwise "passed".
export function stageValue(results: DeviceResult[]): "brake" | "waiting" | "passed" {
  if (results.some((h) => BRAKE.has(h.status))) return "brake";
  if (results.some((h) => h.status === "running")) return "waiting";
  return "passed";
}

const WORDS: Record<DeviceWaveStatus, string> = {
  succeeded: "succeeded", already: "already running this version", rollback: "back to the old version (rollback)", failed: "failed",
  expired: "no word (expired)", rejected: "refused the command", skipped: "skipped", running: "still running",
};

// "3 succeeded, 1 skipped (f00d00000007: device is offline: ...)". The successful ones are only counted; the ones with a problem are
// written with their device_id and the reason (at most 5 per kind, so that the Telegram message stays short).
export function resultText(devices: string[], results: Record<string, DeviceResult>): string {
  const parts: string[] = [];
  for (const s of Object.keys(WORDS) as DeviceWaveStatus[]) {
    const matching = devices.filter((id) => (results[id]?.status ?? "running") === s);
    if (matching.length === 0) continue;
    if (s === "succeeded" || s === "already") {
      parts.push(`${matching.length} ${WORDS[s]}`);
      continue;
    }
    const detail = matching.slice(0, 5).map((id) => (results[id]?.message ? `${id}: ${results[id].message}` : id)).join("; ");
    parts.push(`${matching.length} ${WORDS[s]} (${detail}${matching.length > 5 ? `; and ${matching.length - 5} others` : ""})`);
  }
  return parts.length === 0 ? "no devices" : parts.join(", ");
}

// a duration in everyday words: "45 s", "3 min 12 s"
export function durationText(ms: number): string {
  const seconds = Math.round(ms / 1000);
  return seconds < 60 ? `${seconds} s` : `${Math.floor(seconds / 60)} min${seconds % 60 === 0 ? "" : ` ${seconds % 60} s`}`;
}

// ---------- the wave that is running (only one at a time) ----------

type State = "running" | "wait-healthy" | "finished" | "stopped";
interface Wave {
  version: string;
  startedBy: string; // the number of the admin account that started it
  waitMinutes: number;
  stages: Stage[]; // [canary, wave 1, wave 2, ...]
  stageIndex: number; // the stage that is running (0 = canary)
  state: State;
  reason: string | null; // why it stopped
  results: Record<string, DeviceResult>;
  sent: Map<string, string>; // update command id -> device_id (everything this wave ever sent)
  waiting: Set<string>; // the command ids of this stage that have no final result yet
  early: Map<string, UpdateRow>; // final results that arrive before their command id is recorded (rare: an ack after more than 5 seconds)
  canary: { id: string; bootTime: number | null }[]; // the canaries watched during the waiting period + their estimated boot time
  timer?: ReturnType<typeof setInterval>;
  checkScheduled: boolean; // checkStage() is already scheduled for the notices that arrive at the same time
  startedAt: number;
  finishedAt: number | null;
}
let current: Wave | null = null;

const isRunning = (g: Wave) => g.state === "running" || g.state === "wait-healthy";
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 19) + "Z";

// The state of the last wave for GET /fleet/wave (null = none yet since the backend started)
export function waveState() {
  const g = current;
  if (g === null) return null;
  return {
    version: g.version, state: g.state, stage_index: g.stageIndex, wait_minutes: g.waitMinutes, reason: g.reason,
    started_at: iso(g.startedAt), finished_at: g.finishedAt === null ? null : iso(g.finishedAt),
    stages: g.stages.map((t) => ({ name: t.name, devices: t.devices.map((id) => ({ device_id: id,
      status: g.results[id]?.status ?? "queued", message: g.results[id]?.message ?? null })) })),
  };
}

// POST /fleet/wave. The starting conditions are the same as "Update all" (the release exists, isn't withdrawn, isn't a test release, no
// canary ever failed on this version), plus: at least one canary, and no other wave running.
export async function startWave(version: string, startedBy: string, options: { waitMinutes?: number; initialSize?: number } = {}):
  Promise<{ code: 404 | 409; message: string } | { code: 202; state: NonNullable<ReturnType<typeof waveState>> }> {
  if (current !== null && isRunning(current)) {
    return { code: 409, message: `wave ${current.version} is still running: wait until it finishes, or stop it first` };
  }
  const release = await getRelease("node1", version);
  if (release === undefined) return { code: 404, message: `firmware node1 ${version} not uploaded yet` };
  if (release.withdrawn_at !== null) return { code: 409, message: `firmware ${version} already withdrawn` };
  if (release.test) return { code: 409, message: `${version} TEST release: never sent to many devices` };
  const history = await canarySummary("node1", version);
  if (history.failed > 0) {
    return { code: 409, message: `${history.failed} canary device(s) failed or rolled back on ${version}: don't spread it` };
  }
  const candidates = (await updateCandidates()).filter((c) => c.revoked_at === null); // ordered by device_id (the db/fleet.ts query)
  const canary = candidates.filter((c) => c.canary).map((c) => c.device_id);
  if (canary.length === 0) return { code: 409, message: "no canary device yet: tick Canary on a device card on the Fleet screen first" };
  const waves = splitWaves(candidates.filter((c) => !c.canary).map((c) => c.device_id), options.initialSize ?? DEFAULT_INITIAL_SIZE);
  const g: Wave = {
    version, startedBy, waitMinutes: options.waitMinutes ?? DEFAULT_WAIT_MINUTES, stageIndex: 0, state: "running", reason: null, results: {},
    stages: [{ name: "canary", devices: canary },
      ...waves.map((devices, i) => ({ name: `wave ${i + 1} of ${waves.length}`, devices }))],
    sent: new Map(), waiting: new Set(), early: new Map(), canary: [], checkScheduled: false, startedAt: Date.now(), finishedAt: null,
  };
  current = g;
  log.info(`wave ${version} started by account ${startedBy}: canary ${canary.join(", ")}, then ${waves.length} wave(s) `
    + `(${waves.map((p) => p.length).join(", ")} devices), healthy wait ${g.waitMinutes} min`);
  void runStage(g);
  return { code: 202, state: waveState()! };
}

// POST /fleet/wave/stop: the running stage isn't taken back (its commands were already sent), but the
// next stage is never sent. null = no wave is running.
export function stopWave(by: string) {
  if (current === null || !isRunning(current)) return null;
  markStopped(current, "halt", `stopped by the admin (account ${by})`);
  return waveState();
}

// Send stage g.stageIndex to all its devices at once, then wait for their final results through waveNotice().
async function runStage(g: Wave): Promise<void> {
  const stage = g.stages[g.stageIndex];
  let currentFw: Map<string, string | null>;
  try {
    const release = await getRelease("node1", g.version); // the admin may withdraw the release halfway
    if (release === undefined || release.withdrawn_at !== null) return markStopped(g, "halt", `firmware ${g.version} already withdrawn`);
    currentFw = new Map((await updateCandidates()).map((c) => [c.device_id, c.fw]));
  } catch (error) {
    return markStopped(g, "halt", `database problem: ${(error as Error).message}`);
  }
  if (current !== g || g.state !== "running") return; // stopped by the admin while waiting for the database
  const toSend = stage.devices.filter((id) => currentFw.get(id) !== g.version);
  for (const id of stage.devices) if (!toSend.includes(id)) g.results[id] = { status: "already", message: null };
  for (const id of toSend) muteStopNotice(id, true); // this device's 🔄/✅ are replaced by the wave summary
  const all = await Promise.all(toSend.map((id) => requestUpdate(id, g.version, g.startedBy)
    .catch((error: Error): UpdateResult => ({ status: "not-sent", device_id: id, code: 503, message: error.message }))));
  let serverError: string | null = null;
  for (const h of all) {
    if (h.status === "rejected" || h.status === "not-sent") { // skipped (offline, Node 2, ...), NOT an emergency brake
      g.results[h.device_id] = { status: h.status === "rejected" ? "rejected" : "skipped", message: h.message };
      muteStopNotice(h.device_id, false);
      if (h.status === "not-sent" && h.code === 503) serverError = h.message; // broker down, SERVER_URL empty, ...
    } else { // accepted or no-ack: sent, its final result follows through ota.ts
      g.results[h.device_id] = { status: "running", message: null };
      g.sent.set(h.id, h.device_id);
      g.waiting.add(h.id);
      const early = g.early.get(h.id);
      if (early !== undefined) saveResult(g, early);
    }
  }
  if (serverError !== null && g.waiting.size === 0) return markStopped(g, "halt", `server problem: ${serverError}`);
  checkStage(g);
}

// Called by ota.ts (announce) for EVERY change of an update status. The wave only cares about the final results of its own commands.
export function waveNotice(u: UpdateRow): void {
  const g = current;
  if (g === null || !FINAL.has(u.status)) return;
  if (!g.sent.has(u.id)) { // not recorded yet: maybe a result that arrived before requestUpdate() finished waiting for the ack
    if (isRunning(g) && u.to_version === g.version && g.stages[g.stageIndex].devices.includes(u.device_id)) g.early.set(u.id, u);
    return;
  }
  saveResult(g, u);
  // Checked after all the notices that arrive AT THE SAME TIME are recorded (the expiry watcher reports several devices at once):
  // the emergency brake summary then names all of them, not just the first one.
  if (!g.checkScheduled) {
    g.checkScheduled = true;
    queueMicrotask(() => { g.checkScheduled = false; checkStage(g); });
  }
}

function saveResult(g: Wave, u: UpdateRow): void {
  const id = g.sent.get(u.id) ?? u.device_id;
  g.sent.set(u.id, id);
  g.early.delete(u.id);
  g.waiting.delete(u.id);
  g.results[id] = { status: u.status as DeviceWaveStatus, message: u.message }; // a device report that comes later is recorded too
  muteStopNotice(id, false);
}

// Is the stage finished? The emergency brake, the healthy wait (after the canary), the next stage, or finished.
function checkStage(g: Wave): void {
  if (current !== g || g.state !== "running") return;
  const stage = g.stages[g.stageIndex];
  const value = stageValue(stage.devices.map((id) => g.results[id] ?? { status: "running", message: null }));
  if (value === "waiting") return;
  if (value === "brake") return markStopped(g, "brake", null);
  if (g.stageIndex === 0 && !stage.devices.some((id) => ["succeeded", "already"].includes(g.results[id]?.status ?? ""))) {
    return markStopped(g, "halt", "no canary is running this version (all skipped)");
  }
  if (g.stageIndex === g.stages.length - 1) return finish(g);
  const next = g.stages[g.stageIndex + 1];
  if (g.stageIndex === 0) return startHealthyWait(g, next);
  void notify(`🌊 Wave ${g.version} · ${stage.name}: ${resultText(stage.devices, g.results)}. On to ${next.name} `
    + `(${next.devices.length} device(s)).`);
  g.stageIndex++;
  void runStage(g);
}

// The estimated BOOT time of a device from its last vitals (ts minus uptime). If the boot time moves forward, that device
// restarted (vitals are sent every time a device connects, so a restart is always visible). null = no vitals yet.
function bootTimeOf(id: string): number | null {
  const v = findDevice(id)?.vitals;
  return v === null || v === undefined ? null : Date.parse(v.ts) - v.uptime_s * 1000;
}

// The version reported by the device's NEWEST message (telemetry or vitals, by comparing their ts). Right after a restart,
// the last telemetry in memory is still from the OLD version, while the vitals sent on connecting already carry the new version.
function latestFw(id: string): string | null {
  const p = findDevice(id);
  const t = p?.telemetry ?? null;
  const v = p?.vitals?.fw !== undefined ? p.vitals : null;
  if (t === null || v === null) return t?.fw ?? v?.fw ?? null;
  return Date.parse(v.ts) >= Date.parse(t.ts) ? v.fw ?? null : t.fw;
}

// A health problem of a canary during the waiting period, or null if all of them are healthy.
function checkCanary(g: Wave): string | null {
  for (const c of g.canary) {
    const p = findDevice(c.id);
    if (p?.status !== "online") {
      const word = p?.status === "offline-mode" ? "stopped on purpose (offline-mode)" : p?.status === "offline" ? "disconnected (offline)"
        : "not heard";
      return `canary ${c.id} ${word} during the healthy wait`;
    }
    const fw = latestFw(c.id);
    if (fw !== null && fw !== g.version) return `canary ${c.id} now runs ${fw}, not ${g.version}`;
    const bootTime = bootTimeOf(c.id);
    if (bootTime !== null && c.bootTime !== null && bootTime > c.bootTime + BOOT_TIME_SLACK_MS) {
      return `canary ${c.id} restarted during the healthy wait (${p.vitals?.reset_reason ?? "reason not reported"})`;
    }
    c.bootTime ??= bootTime;
  }
  return null;
}

function startHealthyWait(g: Wave, next: Stage): void {
  const canary = g.stages[0];
  g.state = "wait-healthy";
  g.canary = canary.devices.filter((id) => ["succeeded", "already"].includes(g.results[id]?.status ?? ""))
    .map((id) => ({ id, bootTime: bootTimeOf(id) }));
  void notify(`🌊 Wave ${g.version} · canary: ${resultText(canary.devices, g.results)}. Waiting ${g.waitMinutes} min: the canary must `
    + `stay online with ${g.version}, then ${next.name} (${next.devices.length} device(s)).`);
  log.info(`wave ${g.version}: canary passed, healthy wait ${g.waitMinutes} min`);
  const end = Date.now() + g.waitMinutes * 60_000;
  g.timer = setInterval(() => {
    const problem = checkCanary(g);
    if (problem !== null) return markStopped(g, "brake", problem);
    if (Date.now() < end) return;
    clearInterval(g.timer);
    log.info(`wave ${g.version}: canary healthy for ${g.waitMinutes} min, ${next.name} sent`);
    g.state = "running";
    g.stageIndex = 1;
    void runStage(g);
  }, WATCH_MS);
}

function finish(g: Wave): void {
  const stage = g.stages[g.stageIndex];
  g.state = "finished";
  g.finishedAt = Date.now();
  const all = g.stages.flatMap((t) => t.devices);
  const text = `✅ Wave ${g.version} FINISHED · ${stage.name}: ${resultText(stage.devices, g.results)}. All stages: `
    + `${resultText(all, g.results)}, in ${durationText(g.finishedAt - g.startedAt)}.`;
  log.info(text);
  void notify(text);
}

// brake = the emergency brake (a device failed, or a canary isn't healthy); halt = stopping without a device failure
function markStopped(g: Wave, kind: "brake" | "halt", reason: string | null): void {
  if (!isRunning(g)) return;
  clearInterval(g.timer);
  const waitPeriod = g.state === "wait-healthy";
  g.state = "stopped";
  g.finishedAt = Date.now();
  g.reason = reason ?? `emergency brake at ${g.stages[g.stageIndex].name}`;
  const stage = g.stages[g.stageIndex];
  const remaining = g.stages.slice(g.stageIndex + 1).reduce((n, t) => n + t.devices.length, 0);
  const head = kind === "brake" ? `🛑 Wave ${g.version} STOPPED (emergency brake)` : `⏹️ Wave ${g.version} stopped`;
  const text = head + (reason !== null ? `: ${reason}` : "")
    + (waitPeriod ? "" : ` · ${stage.name}: ${resultText(stage.devices, g.results)}`)
    + `. ${remaining} other device(s) NOT sent${kind === "brake" ? ": check first, then withdraw the release" : ""}.`;
  log.warn(text);
  void notify(text);
}
