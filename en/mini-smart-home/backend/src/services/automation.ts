// automation.ts - runs the automation rules from the rules table (Module 19): loads the rules into memory, evaluates every
// reading with the pure brain (rules/engine.ts), acts through issueCommand(), sends the fan threshold to the device (config),
// installs the schedule rules (schedule.ts), and records every action in the event log.
// Module 24: threshold rules now work both ways (threshold = rises above, below-threshold = falls below), their action may be
// a switch or a command sent once (for example the pump for 5 seconds), and rules can be deleted (deleteRule).
import { Rule } from "../schemas/rules.ts";
import type { CommandAction, SwitchAction, StoredRule, ThresholdCondition, BelowThresholdCondition } from "../schemas/rules.ts";
import type { SetCommand, TelemetryNode1, TelemetryNode2 } from "../schemas/contract.ts";
import { INITIAL_MEMORY, evaluateThreshold, evaluateBelowThreshold } from "../rules/engine.ts";
import type { Memory } from "../rules/engine.ts";
import { getAllRules, deleteRuleDb, insertRule, updateRule, contractTime } from "../db/archive.ts";
import type { RuleRow } from "../db/archive.ts";
import { findDevice, waitForAck } from "./store.ts";
import { makeCommandId, sendConfig, summarize } from "./mqtt.ts";
import { forgetRuleWishes, issueCommand } from "./commands.ts";
import type { CommandResult } from "./commands.ts";
import { installSchedules } from "./schedule.ts";
import { recordEvent } from "./events.ts";
import { notifyIfNeeded } from "./telegram.ts";
import { log } from "./log.ts";

type ReadingCondition = ThresholdCondition | BelowThresholdCondition; // Module 24: conditions judged from sensor readings, both ways
type RuleAction = SwitchAction | CommandAction; // Module 24: threshold rules may use both

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

// Module 24, DELETE /rules/:id: the result is undefined if no rule has that number. The rule stops applying right away.
// Its command and event history stays in the database (its rule_id becomes NULL, migration 007). This "deleted" event is
// also written with rule_id null: the row no longer exists, so the database refuses that number. The number goes in data.
export async function deleteRule(id: number): Promise<{ id: number; name: string } | undefined> {
  const row = await deleteRuleDb(id);
  if (row === undefined) return undefined;
  rules = rules.filter((a) => a.id !== row.id); // stops being evaluated NOW, before the database is read again
  memory.delete(row.id);
  forgetRuleWishes(row.id); // a device that restarts doesn't receive this rule's command again
  await loadRules(); // the list in memory and the schedule tasks are updated too
  const message = `Rule ${row.id} (${row.name}) deleted through the API`;
  log.info(message);
  recordEvent({ device_id: null, kind: "rule-changed", source: "api", rule_id: null, message,
    data: { id: row.id, name: row.name, deleted: true } });
  sendAllConfigs();
  return row;
}

async function afterChange(row: RuleRow, word: string): Promise<StoredRule> {
  memory.delete(row.id); // a new threshold = a new "for" count
  await loadRules();
  const a = findRule(row.id);
  if (a === undefined) throw new Error(`rule ${row.id} is invalid after saving`);
  if (!a.active) forgetRuleWishes(a.id); // Module 24: an inactive rule doesn't act anymore, also not through reconciliation
  const message = `Rule ${a.id} (${a.name}) ${word} through the API: ${describeRule(a)}`;
  log.info(message);
  recordEvent({ device_id: null, kind: "rule-changed", source: "api", rule_id: a.id, message,
    data: { name: a.name, active: a.active, condition: a.condition, action: a.action } });
  sendAllConfigs();
  return a;
}

// Module 24: the words for the two threshold directions. on/off = the conditions, for example "above 30"/"below 28" (rising)
// or "below 30"/"above 35" (falling); back = which way the reading moves when the rule turns off again.
function direction(c: ReadingCondition): { on: string; off: string; back: string } {
  return c.kind === "threshold"
    ? { on: `above ${c.on_above}`, off: `below ${c.off_below}`, back: "down" }
    : { on: `below ${c.on_below}`, off: `above ${c.off_above}`, back: "up" };
}

// Module 24: the command a rule sends when it TURNS ON. A switch action turns its target on; a command action sends its
// command as it is (for example the pump for 5 seconds).
function commandOnTurnOn(action: RuleAction): SetCommand {
  return action.kind === "switch" ? { target: action.target, value: true } : action.command;
}

// ...and when it TURNS OFF: a switch action turns its target off again; a command action sends nothing (null), because its
// command has already finished by itself (the pump stops when its seconds are up). The rule is only "ready again" for the next dry spell.
function commandOnTurnOff(action: RuleAction): SetCommand | null {
  return action.kind === "switch" ? { target: action.target, value: false } : null;
}

// Module 24: one command in words, for example "pump watering for 5 seconds", "lamp turned on", "curtain set to 0°"
function commandWords(p: SetCommand): string {
  if (p.target === "pump") return `pump watering for ${p.value} seconds`;
  if (p.target === "curtain") return `curtain set to ${p.value}°`;
  return `${p.target} turned ${p.value ? "on" : "off"}`;
}

// a short sentence for the log and the event log
function describeRule(a: StoredRule): string {
  const { condition: c, action } = a;
  const inactive = a.active ? "" : " (inactive)";
  if (c.kind === "schedule") {
    if (action.kind !== "command") return "unknown rule shape"; // already prevented by the schema; only just in case
    return `${action.command.target} ${action.device_id} = ${action.command.value} every "${c.cron}" WIB${inactive}`;
  }
  const { on, off } = direction(c);
  if (action.kind === "switch") {
    return `${action.target} ${action.device_id} on when ${c.quantity} ${c.device_id} is ${on} `
      + `for ${c.for_seconds} seconds, off ${off}${inactive}`;
  }
  return `${action.command.target} ${action.device_id} = ${action.command.value} once when ${c.quantity} ${c.device_id} `
    + `is ${on} for ${c.for_seconds} seconds, ready again ${off}${inactive}`; // Module 24
}

// Send the safety threshold to every device that has a fan rule based on temperature: temp_fan_on = on_above
// (contract 1.3, retained config). Called every time the backend connects to the broker and every time a rule changes.
// Note: a fan rule that is deactivated or deleted does NOT withdraw the old config. The device keeps using the last
// temp_fan_on as its local safety rule (which only works while the broker can't be reached).
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
    // schedule rules aren't evaluated from readings: node-cron keeps their time (schedule.ts)
    if (!a.active || condition.kind === "schedule" || condition.device_id !== deviceId) continue;
    const raw = reading[condition.quantity];
    const value = typeof raw === "number" ? raw : null; // null: a failed sensor, or a field the device doesn't have
    const previous = memory.get(a.id) ?? initialMemory(action);
    const { memory: updated, decision } = condition.kind === "threshold"
      ? evaluateThreshold(condition, previous, value, now) // rising: "above"
      : evaluateBelowThreshold(condition, previous, value, now); // Module 24, falling: "below"
    memory.set(a.id, updated);
    if (decision !== null) {
      void act(a, condition, action, decision, value, content.ts, previous);
    } else if (updated.active && action.notify) { // still on: a reminder at most once every 30 minutes (shouldNotify)
      const [emoji, name, unit] = LABEL[condition.quantity];
      // Module 24: a command rule (for example the pump) has already acted; what it waits for is its "ready again" condition
      const state = action.kind === "switch" ? `${action.target} stays on`
        : `rule "${a.name}" not ready again yet (waiting for ${condition.quantity} ${direction(condition).off})`;
      void notifyIfNeeded(`rule:${a.id}`, "danger",
        `${emoji} ${name} still ${value === null ? "-" : num.format(value)}${unit} — ${state} (reminder)`,
        content.ts, true);
    } else if (previous.since === null && updated.since !== null) {
      log.info(`rule ${a.id} (${a.name}): ${condition.quantity} ${value} ${direction(condition).on}; `
        + `${commandWords(commandOnTurnOn(action))} if it lasts ${condition.for_seconds} seconds`);
    } else if (previous.since !== null && updated.since === null) {
      log.info(`rule ${a.id} (${a.name}): count restarted (${condition.quantity} ${value ?? "unreadable"})`);
    }
  }
}

// After the backend restarts or the rule is changed: if the device reports that its actuator is on, treat the rule
// as on so that it gets turned off when the time comes. Module 24: a command rule (for example the pump, once)
// always starts as off, so if its condition still holds, its command is sent once more.
function initialMemory(action: RuleAction): Memory {
  if (action.kind === "command") return INITIAL_MEMORY;
  return { ...INITIAL_MEMORY, active: findDevice(action.device_id)?.reported?.[action.target] === true };
}

async function act(a: StoredRule, condition: ReadingCondition, action: RuleAction, decision: "turn-on" | "turn-off",
  value: number | null, readingTs: string, previous: Memory): Promise<void> {
  const turnOn = decision === "turn-on";
  const command = turnOn ? commandOnTurnOn(action) : commandOnTurnOff(action);
  let result: CommandResult | null = null; // stays null if nothing is sent (a command rule turning off)
  if (command !== null) {
    result = await issueCommand(action.device_id, command, "rule", a.id);
    if (result.status === "not-sent") {
      memory.set(a.id, previous); // the decision hasn't been carried out: the next reading decides again
      log.warn(`rule ${a.id} (${a.name}): ${command.target} can't be turned ${turnOn ? "on" : "off"}: ${result.message}`);
      return;
    }
  }
  const message = sentence(condition, action, turnOn, value, result);
  log.info(`rule ${a.id} (${a.name}): ${message}`);
  // Module 24: ok = whether the action was carried out (true = the device answered ok; false = refused or no answer;
  // null = no command was sent). The dashboard uses it for the color of the notice, without guessing from the sentence.
  const ok = result === null ? null : result.status === "answered" && result.ack.ok;
  recordEvent({ device_id: action.device_id, kind: "rule", source: "rule", rule_id: a.id, message,
    data: { decision, value, reading_ts: readingTs, command: result?.id ?? null, result: result?.status ?? "no-command", ok } });
  // Telegram AFTER the ack result is known so that its message is honest; the delay is measured from the trigger reading
  if (action.notify) void notifyIfNeeded(`rule:${a.id}`, turnOn ? "danger" : "safe", message, readingTs);
}

const LABEL: Record<string, [string, string, string]> = { // quantity -> [emoji, name, unit]
  temperature: ["🌡️", "Temperature", " °C"], humidity: ["💧", "Humidity", " %"], light: ["💡", "Light", ""],
  soil: ["🌱", "Soil", " %"], water_level: ["🚰", "Water level", " %"], soil_rs485: ["🌱", "Soil (RS-485)", " %"],
  soil_temperature: ["🌡️", "Soil temperature", " °C"],
};
const num = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }); // 33 -> "33", 27.8 -> "27.8"

// A sentence for humans (the same as its Telegram message), for example "🌡️ Temperature 33 °C — fan turned on automatically".
// Module 24: also "🌱 Soil 25 % — pump watering for 5 seconds automatically" and, when the soil is wet again, "✅ Soil up
// to 36 % — rule ready again". result = null if no command was sent.
function sentence(condition: ReadingCondition, action: RuleAction, turnOn: boolean, value: number | null,
  result: CommandResult | null): string {
  const [emoji, name, unit] = LABEL[condition.quantity];
  const text = value === null ? "-" : num.format(value);
  const target = action.kind === "switch" ? action.target : action.command.target;
  if (result?.status === "no-ack") {
    // commands.ts only sends the fan, lamp, and curtain again (reconciliation); not the pump, so don't promise it
    const next = target === "pump" ? "not sent again" : "will retry";
    return `⚠️ ${name} ${text}${unit} — ${target} did NOT answer the command (${next})`;
  }
  if (result?.status === "answered" && !result.ack.ok) {
    return `⚠️ ${name} ${text}${unit} — ${target} command refused by the device: ${result.ack.message}`;
  }
  if (turnOn) return `${emoji} ${name} ${text}${unit} — ${commandWords(commandOnTurnOn(action))} automatically`;
  const { back } = direction(condition);
  return action.kind === "switch" ? `✅ ${name} ${back} to ${text}${unit} — ${action.target} turned off`
    : `✅ ${name} ${back} to ${text}${unit} — rule ready again`;
}
