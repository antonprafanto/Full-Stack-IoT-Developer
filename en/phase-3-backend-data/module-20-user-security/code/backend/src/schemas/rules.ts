// rules.ts - the shape of an automation rule (Module 19) as a Zod schema. A rule is DATA, not code: only the shapes
// known here may come in, both through the API and from the database.
import { z } from "zod";
import cron from "node-cron";
import { DeviceId, SetCommand } from "./contract.ts";

// the telemetry quantities a threshold rule may use
const Quantity = z.enum(["temperature", "humidity", "light", "soil", "water_level", "soil_rs485", "soil_temperature"]);

// "If <quantity> of that device stays above <on_above> continuously for <for_seconds> seconds, the rule turns on;
// the rule turns off again when <quantity> is below <off_below>."
export const ThresholdCondition = z.strictObject({
  kind: z.literal("threshold"),
  device_id: DeviceId,
  quantity: Quantity,
  on_above: z.number(),
  off_below: z.number(),
  for_seconds: z.number().int().min(0).max(3600),
}).refine((c) => c.off_below < c.on_above, {
  message: "off_below must be smaller than on_above (hysteresis)",
  path: ["off_below"],
});

// "Every <cron> (WIB time) ..." — a 5-field cron expression: minute hour day month weekday, for example "0 6 * * *"
export const ScheduleCondition = z.strictObject({
  kind: z.literal("schedule"),
  cron: z.string()
    .refine((text) => text.trim().split(/\s+/).length === 5, "a schedule uses 5 fields: minute hour day month weekday")
    .refine((text) => cron.validate(text), "invalid cron expression"),
});

// "... then turn on <target> of that device, and turn it off again when the rule turns off."
export const SwitchAction = z.strictObject({
  kind: z.literal("switch"),
  device_id: DeviceId,
  target: z.enum(["fan", "lamp"]),
  notify: z.boolean(), // send a Telegram message when this rule acts?
});

// "... then send one set command", for example the pump for 10 seconds. Uses the same command schema as the API.
export const CommandAction = z.strictObject({
  kind: z.literal("command"),
  device_id: DeviceId,
  command: SetCommand,
  notify: z.boolean(),
});

// The fields of one rule (name, active, condition, action), without the combined checks.
export const RuleFields = z.strictObject({
  name: z.string().min(1).max(60),
  active: z.boolean(),
  condition: z.discriminatedUnion("kind", [ThresholdCondition, ScheduleCondition]),
  action: z.discriminatedUnion("kind", [SwitchAction, CommandAction]),
});

// The body of POST /rules and PUT /rules/:id.
export const Rule = RuleFields
  .refine((a) => (a.condition.kind === "threshold") === (a.action.kind === "switch"), {
    message: "a threshold condition goes with a switch action; a schedule condition with a command action",
    path: ["action", "kind"],
  })
  // The threshold of a fan rule is also sent to the device as temp_fan_on (config, contract 1.3), so its range must be the
  // same as what the device accepts: 15-45 °C.
  .refine((a) => a.condition.kind !== "threshold" || a.action.kind !== "switch" || a.condition.quantity !== "temperature"
    || a.action.target !== "fan" || (a.condition.on_above >= 15 && a.condition.on_above <= 45), {
    message: "for a fan rule, on_above must be 15-45 °C (it is also sent to the device as temp_fan_on)",
    path: ["condition", "on_above"],
  });

export type ThresholdCondition = z.infer<typeof ThresholdCondition>;
export type SwitchAction = z.infer<typeof SwitchAction>;
export type Rule = z.infer<typeof Rule>;

// a rule already stored in the database: plus its number and its times
export type StoredRule = Rule & { id: number; created_at: string; updated_at: string };
