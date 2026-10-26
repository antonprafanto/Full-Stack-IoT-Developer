// rules.ts - automation rules (Module 19) for humans: the shape of one row of the GET /rules answer, and describeRule(), which
// turns a rule's JSON into a plain sentence. This sentence is made in the browser, so it can differ a little from the log
// and event sentences the backend makes. Practice 8: plus the form's default values, device options, friendly error messages,
// and the 400 error reader.
import { z } from "zod";
import { RuleFields } from "./schemas/rule-basics";
import type { CommandAction, Quantity, Rule, SwitchAction } from "./schemas/rule-basics";
import type { SetCommand } from "./schemas/contract";
import type { Device } from "./types";

// One row of the GET /rules answer: the rule's content plus its number and times. The same shape as FullRule in
// backend/src/routes/rules.ts (that route file can't be copied, so its five lines are written again here).
export const FullRule = z.object({
  id: z.number(),
  ...RuleFields.shape,
  created_at: z.string(),
  updated_at: z.string(),
  next_run: z.string().nullable(), // an active schedule rule: when it runs again (UTC); otherwise null
});
export type FullRule = z.infer<typeof FullRule>;

// the name and unit of every quantity, for the sentences and the form's options
export const QUANTITIES: Record<Quantity, { name: string; unit: string }> = {
  temperature: { name: "temperature", unit: " °C" },
  humidity: { name: "air humidity", unit: " %" },
  light: { name: "light", unit: "" }, // 0 (dark) to 4095 (bright), no unit
  soil: { name: "soil moisture", unit: " %" },
  water_level: { name: "water tank", unit: " %" },
  soil_rs485: { name: "RS-485 soil moisture", unit: " %" },
  soil_temperature: { name: "soil temperature", unit: " °C" },
};

// numbers in the English style (28.5, 3,500); a form field that is still empty (NaN) is written "…"
function num(n: number): string {
  return Number.isFinite(n) ? n.toLocaleString("en-US") : "…";
}

// "0 6 * * *" -> "Every day at 06:00 WIB"; other patterns are written as they are
function describeCron(cron: string): string {
  const daily = /^(\d{1,2}) (\d{1,2}) \* \* \*$/.exec(cron.trim());
  if (daily) return "Every day at " + daily[2].padStart(2, "0") + ":" + daily[1].padStart(2, "0") + " WIB";
  const everyMinutes = /^\*\/(\d{1,2}) \* \* \* \*$/.exec(cron.trim());
  if (everyMinutes) return "Every " + everyMinutes[1] + " minutes";
  return `On the cron schedule "${cron}" (WIB time)`;
}

// one command as a verb: "water for 5 seconds", "turn on the lamp", "turn the curtain to 90°"
function describeCommand(p: SetCommand): string {
  if (p.target === "pump") return "water for " + num(p.value) + " seconds";
  if (p.target === "curtain") return "turn the curtain to " + num(p.value) + "°";
  return (p.value ? "turn on the " : "turn off the ") + p.target;
}

// describeRule - a rule's JSON -> a sentence. nameOf turns a device_id into a name humans know.
export function describeRule(a: Rule, nameOf: (deviceId: string) => string): string {
  const c = a.condition;
  const action = a.action;
  let sentence: string;

  if (c.kind === "schedule") {
    // a schedule may only go with a command action (schema), but the form may be half filled in
    const what = action.kind === "command" ? describeCommand(action.command) : "turn on the " + action.target;
    sentence = describeCron(c.cron) + ", " + what + " on " + nameOf(action.device_id) + ".";
  } else {
    const q = QUANTITIES[c.quantity];
    const rising = c.kind === "threshold"; // threshold = above; below-threshold = below
    const limit = rising ? c.on_above : c.on_below;
    const release = rising ? c.off_below : c.off_above;
    const forText = c.for_seconds > 0 ? " for " + num(c.for_seconds) + " seconds" : "";
    // the acting device's name is only written when it differs from the measured device
    const at = action.device_id === c.device_id ? "" : " on " + nameOf(action.device_id);
    sentence = "If the " + q.name + " on " + nameOf(c.device_id) + (rising ? " is above " : " is below ") + num(limit) + q.unit + forText + ", ";
    const releaseText = "the " + q.name + (rising ? " falls below " : " rises above ") + num(release) + q.unit;
    if (action.kind === "switch") {
      sentence += "turn on the " + action.target + at + ". The " + action.target + " turns off again after " + releaseText + ".";
    } else {
      sentence += describeCommand(action.command) + at + " (once). The rule is ready again after " + releaseText + ".";
    }
  }
  if (action.notify) sentence += " Notify via Telegram.";
  return sentence;
}

// ---- Practice 8: the rule form ----

type RuleCondition = Rule["condition"];

// the default values of every "When?" option. Used when the option changes: the whole condition is replaced at once.
export function defaultCondition(kind: RuleCondition["kind"], deviceId: string): RuleCondition {
  if (kind === "threshold") {
    return { kind, device_id: deviceId, quantity: "temperature", on_above: 30, off_below: 28, for_seconds: 60 };
  }
  if (kind === "below-threshold") {
    return { kind, device_id: deviceId, quantity: "soil", on_below: 30, off_above: 35, for_seconds: 10 };
  }
  return { kind, cron: "0 6 * * *" };
}

// the default values of every "Then?" option: switch (on while the rule is on) or a one-time command (water 5 seconds by default)
export function defaultAction(kind: Rule["action"]["kind"], deviceId: string, notify: boolean): SwitchAction | CommandAction {
  if (kind === "switch") return { kind, device_id: deviceId, target: "lamp", notify };
  return { kind, device_id: deviceId, command: { target: "pump", value: 5 }, notify };
}

// the default value of every command kind
export function defaultCommand(target: SetCommand["target"]): SetCommand {
  if (target === "pump") return { target, value: 5 };
  if (target === "curtain") return { target, value: 90 };
  return { target, value: true };
}

// the "New rule" form's content: Module 19's fan rule (temperature above 30 °C), on the first device that takes commands
export function defaultRule(devices: Device[]): Rule {
  const first = devices.find((p) => p.kind !== "node2") ?? devices[0];
  const id = first?.device_id ?? "";
  return { name: "", active: true, condition: defaultCondition("threshold", id), action: { kind: "switch", device_id: id, target: "fan", notify: false } };
}

// a stored rule -> the form's content: only the four fields that may be sent (the id and times are set by the backend)
export function toFormValues(a: FullRule): Rule {
  return { name: a.name, active: a.active, condition: a.condition, action: a.action };
}

// device_id -> the device name for the preview and the form's options; a device that isn't in the list is still written
// as its device_id
export function deviceNameOf(devices: Device[], deviceId: string): string {
  return devices.find((p) => p.device_id === deviceId)?.name ?? deviceId;
}

// the device options in the form: every device for "measured", all but Node 2 for "acting" (Node 2 doesn't take
// commands). A device stored in the rule but no longer in the list is still offered, so it doesn't disappear.
export function deviceOptions(devices: Device[], selected: string, takesCommands: boolean): string[] {
  const list = devices.filter((p) => !takesCommands || p.kind !== "node2").map((p) => p.device_id);
  return list.includes(selected) || selected === "" ? list : [selected, ...list];
}

// Friendlier error messages for the form. They only replace Zod's BUILT-IN messages (for example "Invalid input: expected
// number, received NaN" for an empty number field). Messages written in the schema (hysteresis, 5-field schedule, device_id)
// stay exactly the ones the backend sends. Mounted through zodResolver(Rule, { error: friendlyMessages }), so the schema
// itself isn't changed and stays identical to the backend's.
export const friendlyMessages: z.core.$ZodErrorMap = (issue) => {
  if (issue.code === "invalid_type" && issue.expected === "number") return "Enter a number";
  if (issue.code === "invalid_type" && issue.expected === "int") return "Enter a whole number (no decimals)";
  if (issue.code === "too_small" && issue.origin === "string") return "Required";
  if (issue.code === "too_big" && issue.origin === "string") return "At most " + issue.maximum + " characters";
  if (issue.code === "too_small" && issue.origin === "number") return "At least " + issue.minimum;
  if (issue.code === "too_big" && issue.origin === "number") return "At most " + issue.maximum;
  return undefined; // otherwise: Zod's built-in message (in English, from contract.ts)
};

// A 400 error from the backend (Fastify) is one sentence:
// "body/condition/cron invalid cron expression, body/name Too small: …"
// -> [{ field: "condition.cron", message: "invalid cron expression" }, { field: "name", message: "Too small: …" }]
// field uses dots, the same as react-hook-form's field names; "" = doesn't point at one field.
export function parse400(message: string): { field: string; message: string }[] {
  return message.split(/, (?=body\/)/).map((part) => {
    const match = /^body\/(\S*) (.*)$/s.exec(part);
    if (match === null) return { field: "", message: part };
    return { field: match[1].replaceAll("/", "."), message: match[2] };
  });
}
