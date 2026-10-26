// rules.ts - automation rules (Module 19) for humans: the shape of one row of the GET /rules answer, and describeRule(), which
// turns a rule's JSON into a plain sentence. This sentence is made in the browser, so it can differ a little from the log
// and event sentences the backend makes.
import { z } from "zod";
import { RuleFields } from "./schemas/rule-basics";
import type { Quantity, Rule } from "./schemas/rule-basics";
import type { SetCommand } from "./schemas/contract";

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

// the name and unit of every quantity, for the sentences
const QUANTITIES: Record<Quantity, { name: string; unit: string }> = {
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
