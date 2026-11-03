// schedule.ts - schedule rules (Module 19): commands that run at a set time, for example "water for 10 seconds every day
// at 06:00 WIB", with node-cron 4.6.0. Their time zone is ALWAYS Asia/Jakarta (WIB), whatever the laptop's time zone is.
import cron from "node-cron";
import type { ScheduledTask } from "node-cron";
import type { StoredRule } from "../schemas/rules.ts";
import { issueCommand } from "./commands.ts";
import type { CommandResult } from "./commands.ts";
import { recordEvent } from "./events.ts";
import { notify } from "./telegram.ts";
import { log } from "./log.ts";

export const ZONE = "Asia/Jakarta";
const tasks = new Map<number, ScheduledTask>(); // rule number -> node-cron task

// a WIB time for humans, for example "22 Oct 2026, 06:00 WIB"
const wibFormat = new Intl.DateTimeFormat("en-GB", { timeZone: ZONE, dateStyle: "medium", timeStyle: "short" });
export const wibTime = (time: Date) => `${wibFormat.format(time)} WIB`;

// Take down every old task, then install them again from the list of rules. Called every time the rules are reloaded.
export function installSchedules(rules: StoredRule[]): void {
  for (const t of tasks.values()) t.destroy();
  tasks.clear();
  for (const a of rules) {
    if (!a.active || a.condition.kind !== "schedule") continue;
    const t = cron.schedule(a.condition.cron, () => runSchedule(a), {
      name: `rule-${a.id}`,
      timezone: ZONE, // without this, the schedule follows the laptop's zone (a UTC+8 laptop waters at 05:00 WIB)
      noOverlap: true, // if the previous run hasn't finished yet, don't run twice at the same time
      missedExecutionTolerance: 15 * 60_000, // up to 15 minutes late (for example a laptop that just woke up) still runs
    });
    t.on("execution:missed", (context) => scheduleMissed(a, context.date));
    tasks.set(a.id, t);
    const next = t.getNextRun();
    log.info(`schedule of rule ${a.id} (${a.name}) installed: "${a.condition.cron}" ${ZONE}, `
      + `next ${next === null ? "-" : wibTime(next)}`);
  }
}

// for GET /rules: when this rule's schedule runs again (null if it isn't a schedule rule or isn't active)
export function nextRun(id: number): Date | null {
  return tasks.get(id)?.getNextRun() ?? null;
}

// Run the action of a schedule rule now: called by node-cron at its time, or by POST /rules/:id/run to test it.
export async function runSchedule(a: StoredRule): Promise<CommandResult> {
  if (a.action.kind !== "command") throw new Error(`rule ${a.id} is not a schedule rule`);
  const { device_id: deviceId, command } = a.action;
  log.info(`schedule of rule ${a.id} (${a.name}) running: ${command.target} = ${command.value} to ${deviceId}`);
  const result = await issueCommand(deviceId, command, "schedule", a.id);
  let message: string;
  if (result.status === "answered" && result.ack.ok) {
    message = command.target === "pump" ? `🚿 ${a.name}: pump on for ${command.value} seconds`
      : `⏰ ${a.name}: ${command.target} = ${command.value}`;
  } else if (result.status === "answered") {
    message = `⚠️ ${a.name}: ${command.target} command refused by the device (${result.ack.message})`;
  } else if (result.status === "no-ack") {
    message = `⚠️ ${a.name}: ${deviceId} did not answer the ${command.target} command`;
  } else {
    message = `⚠️ ${a.name}: ${command.target} command not sent (${result.message})`;
  }
  log.info(`schedule of rule ${a.id}: ${message}`);
  // Module 24: ok = the command was carried out (answered with ok); the dashboard uses it for the color of the notice
  recordEvent({ device_id: deviceId, kind: "schedule", source: "schedule", rule_id: a.id, message,
    data: { command, result: result.status, ok: result.status === "answered" && result.ack.ok } });
  if (a.action.notify) void notify(message);
  return result;
}

// node-cron 4 does NOT replay a missed schedule (for example a laptop asleep at 06:00): all we can do is record it.
function scheduleMissed(a: StoredRule, time: Date): void {
  const message = `⏰ Schedule ${a.name} at ${wibTime(time)} missed (laptop asleep or backend busy?)`;
  log.warn(message);
  recordEvent({ device_id: null, kind: "schedule", source: "schedule", rule_id: a.id, message, data: { missed: time, ok: false } });
  if (a.action.notify) void notify(message);
}

// stopping gracefully: stop every task and wait for the ones that are running (node-cron 4.6.0)
export async function stopSchedules(): Promise<void> {
  await cron.shutdown();
}
