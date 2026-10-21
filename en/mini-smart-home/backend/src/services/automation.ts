// automation.ts - runs the automation rules from the rules table (Module 19): loads the rules into memory, evaluates every
// reading with the pure brain (rules/engine.ts), acts through issueCommand(), sends the fan threshold to the device (config),
// installs the schedule rules (schedule.ts), and records every action in the event log.
import { Rule } from "../schemas/rules.ts";
import type { SwitchAction, StoredRule, ThresholdCondition } from "../schemas/rules.ts";
import type { TelemetryNode1, TelemetryNode2 } from "../schemas/contract.ts";
import { INITIAL_MEMORY, evaluateThreshold } from "../rules/engine.ts";
import type { Memory } from "../rules/engine.ts";
import { getAllRules, insertRule, updateRule, contractTime } from "../db/archive.ts";
import type { RuleRow } from "../db/archive.ts";
import { findDevice, waitForAck } from "./store.ts";
import { makeCommandId, sendConfig, summarize } from "./mqtt.ts";
import { issueCommand } from "./commands.ts";
import type { CommandResult } from "./commands.ts";
import { installSchedules } from "./schedule.ts";
import { recordEvent } from "./events.ts";
import { notifyIfNeeded } from "./telegram.ts";
import { log } from "./log.ts";

const STALE_READING_MS = 60_000; // a reading whose ts is older than 60 seconds (late data) is not evaluated
let rules: StoredRule[] = []; // every valid rule, by number
const memory = new Map<number, Memory>(); // rule number -> evaluateThreshold memory

// Reload every rule from the database. Invalid rows (for example edited by hand in DBeaver) are skipped.
export async function loadRules(): Promise<void> {
  const valid: StoredRule[] = [];
  for (const row of await getAllRules()) {
    const result = Rule.safeParse({ name: row.name, active: row.active, condition: row.condition, action: row.action });
    if (!result.success) {
      log.warn(`rule ${row.id} skipped: ${summarize(result.error)}`);
      continue;
    }
    valid.push({ ...result.data, id: row.id, created_at: contractTime(row.created_at), updated_at: contractTime(row.updated_at) });
  }
  rules = valid;
  log.info(`rules loaded: ${valid.filter((a) => a.active).length} active of ${valid.length}`);
  installSchedules(valid); // schedule rules: the node-cron tasks are taken down and installed again
}

export function allRules(): StoredRule[] {
  return rules;
}

export function findRule(id: number): StoredRule | undefined {
  return rules.find((a) => a.id === id);
}

// POST /rules: save a new rule, which applies right away
export async function createRule(content: Rule): Promise<StoredRule> {
  return afterChange(await insertRule(content), "created");
}

// PUT /rules/:id: the result is undefined if no rule has that number
export async function replaceRule(id: number, content: Rule): Promise<StoredRule | undefined> {
  const row = await updateRule(id, content);
  return row === undefined ? undefined : afterChange(row, "changed");
}

async function afterChange(row: RuleRow, word: string): Promise<StoredRule> {
  memory.delete(row.id); // a new threshold = a new "for" count
  await loadRules();
  const a = findRule(row.id);
  if (a === undefined) throw new Error(`rule ${row.id} is invalid after saving`);
  const message = `Rule ${a.id} (${a.name}) ${word} through the API: ${describeRule(a)}`;
  log.info(message);
  recordEvent({ device_id: null, kind: "rule-changed", source: "api", rule_id: a.id, message,
    data: { name: a.name, active: a.active, condition: a.condition, action: a.action } });
  sendAllConfigs();
  return a;
}

// a short sentence for the log and the event log
function describeRule(a: StoredRule): string {
  const { condition: c, action } = a;
  const inactive = a.active ? "" : " (inactive)";
  if (c.kind === "schedule" && action.kind === "command") {
    return `${action.command.target} ${action.device_id} = ${action.command.value} every "${c.cron}" WIB${inactive}`;
  }
  if (c.kind === "threshold" && action.kind === "switch") {
    return `${action.target} ${action.device_id} on when ${c.quantity} ${c.device_id} is above ${c.on_above} `
      + `for ${c.for_seconds} seconds, off below ${c.off_below}${inactive}`;
  }
  return "unknown rule shape";
}

// Send the safety threshold to every device that has a fan rule based on temperature: temp_fan_on = on_above
// (contract 1.3, retained config). Called every time the backend connects to the broker and every time a rule changes.
export function sendAllConfigs(): void {
  const done = new Set<string>(); // one device, one threshold: the active fan rule with the lowest number
  for (const a of rules) {
    const { condition, action } = a;
    if (!a.active || condition.kind !== "threshold" || action.kind !== "switch") continue;
    if (condition.quantity !== "temperature" || action.target !== "fan" || done.has(action.device_id)) continue;
    done.add(action.device_id);
    void sendThreshold(action.device_id, condition.on_above, a.id);
  }
}

async function sendThreshold(deviceId: string, temperature: number, ruleId: number): Promise<void> {
  const id = makeCommandId();
  const waiting = waitForAck(id, 5000); // start waiting BEFORE sending, like a set command
  sendConfig(deviceId, id, { temp_fan_on: temperature });
  log.info(`config ${id} to ${deviceId}: temp_fan_on ${temperature} from rule ${ruleId} (retained)`);
  const ack = await waiting;
  if (ack === null) {
    log.warn(`config ${id} to ${deviceId}: no answer in 5 seconds; the config stays retained on the broker until the device connects`);
  } else {
    log.info(`config ${id} to ${deviceId}: ack ok=${ack.ok}${ack.message === undefined ? "" : ` (${ack.message})`}`);
  }
}

// Called by mqtt.ts for every telemetry that passes the contract.
export function evaluateReading(deviceId: string, content: TelemetryNode1 | TelemetryNode2): void {
  const now = Date.now();
  if (now - Date.parse(content.ts) > STALE_READING_MS) return; // late data: not the current state
  const reading: Record<string, unknown> = content;
  for (const a of rules) {
    const { condition, action } = a;
    if (!a.active || condition.kind !== "threshold" || action.kind !== "switch" || condition.device_id !== deviceId) continue;
    const raw = reading[condition.quantity];
    const value = typeof raw === "number" ? raw : null; // null: a failed sensor, or a field the device doesn't have
    const previous = memory.get(a.id) ?? initialMemory(action);
    const { memory: updated, decision } = evaluateThreshold(condition, previous, value, now);
    memory.set(a.id, updated);
    if (decision !== null) {
      void act(a, condition, action, decision, value, content.ts, previous);
    } else if (updated.active && action.notify) { // still on: a reminder at most once every 30 minutes (shouldNotify)
      const [emoji, name, unit] = LABEL[condition.quantity];
      void notifyIfNeeded(`rule:${a.id}`, "danger",
        `${emoji} ${name} still ${value === null ? "-" : num.format(value)}${unit} — ${action.target} stays on (reminder)`,
        content.ts, true);
    } else if (previous.since === null && updated.since !== null) {
      log.info(`rule ${a.id} (${a.name}): ${condition.quantity} ${value} above ${condition.on_above}; `
        + `${action.target} turned on if it lasts ${condition.for_seconds} seconds`);
    } else if (previous.since !== null && updated.since === null) {
      log.info(`rule ${a.id} (${a.name}): count restarted (${condition.quantity} ${value ?? "unreadable"})`);
    }
  }
}

// After the backend restarts or the rule is changed: if the device reports that its actuator is on, treat the rule
// as on so that it gets turned off when the time comes.
function initialMemory(action: SwitchAction): Memory {
  return { ...INITIAL_MEMORY, active: findDevice(action.device_id)?.reported?.[action.target] === true };
}

async function act(a: StoredRule, condition: ThresholdCondition, action: SwitchAction, decision: "turn-on" | "turn-off",
  value: number | null, readingTs: string, previous: Memory): Promise<void> {
  const turnOn = decision === "turn-on";
  const result = await issueCommand(action.device_id, { target: action.target, value: turnOn }, "rule", a.id);
  if (result.status === "not-sent") {
    memory.set(a.id, previous); // the decision hasn't been carried out: the next reading decides again
    log.warn(`rule ${a.id} (${a.name}): ${action.target} can't be turned ${turnOn ? "on" : "off"}: ${result.message}`);
    return;
  }
  const message = sentence(condition, action, turnOn, value, result);
  log.info(`rule ${a.id} (${a.name}): ${message}`);
  recordEvent({ device_id: action.device_id, kind: "rule", source: "rule", rule_id: a.id, message,
    data: { decision, value, reading_ts: readingTs, command: result.id, result: result.status } });
  // Telegram AFTER the ack result is known so that its message is honest; the delay is measured from the trigger reading
  if (action.notify) void notifyIfNeeded(`rule:${a.id}`, turnOn ? "danger" : "safe", message, readingTs);
}

const LABEL: Record<string, [string, string, string]> = { // quantity -> [emoji, name, unit]
  temperature: ["🌡️", "Temperature", " °C"], humidity: ["💧", "Humidity", " %"], light: ["💡", "Light", ""],
  soil: ["🌱", "Soil", " %"], water_level: ["🚰", "Water level", " %"], soil_rs485: ["🌱", "Soil (RS-485)", " %"],
  soil_temperature: ["🌡️", "Soil temperature", " °C"],
};
const num = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }); // 33 -> "33", 27.8 -> "27.8"

// A sentence for humans, for example "🌡️ Temperature 33 °C — fan turned on automatically" (the same as its Telegram message).
function sentence(condition: ThresholdCondition, action: SwitchAction, turnOn: boolean, value: number | null,
  result: CommandResult): string {
  const [emoji, name, unit] = LABEL[condition.quantity];
  const text = value === null ? "-" : num.format(value);
  if (result.status === "no-ack") return `⚠️ ${name} ${text}${unit} — ${action.target} did NOT answer the command (will retry)`;
  if (result.status === "answered" && !result.ack.ok) {
    return `⚠️ ${name} ${text}${unit} — ${action.target} command refused by the device: ${result.ack.message}`;
  }
  return turnOn ? `${emoji} ${name} ${text}${unit} — ${action.target} turned on automatically`
    : `✅ ${name} down to ${text}${unit} — ${action.target} turned off`;
}
