// rule-basics.ts - the shape of an automation rule (Module 19) as a Zod schema, WITHOUT node-cron (split off in Module 24). A rule
// is DATA, not code: only the shapes known here may come in, both through the API and from the database.
// Module 24: this file is used in TWO places. The backend uses it through rules.ts (plus the cron check that needs
// node-cron), and the dashboard uses an IDENTICAL COPY of it in frontend/src/schemas/, so the rule form checks the input with
// exactly the same rules as the server. That is why this file may only import zod and contract.ts (both also run in the
// browser). Always change it in the backend first, copy it to the frontend again, then run npm run check-schema in frontend.
import { z } from "zod";
import { DeviceId, SetCommand } from "./contract.ts";

// the telemetry quantities a threshold rule may use
export const Quantity = z.enum(["temperature", "humidity", "light", "soil", "water_level", "soil_rs485", "soil_temperature"]);

// "If <quantity> of that device stays above <on_above> continuously for <for_seconds> seconds, the rule turns on;
// the rule turns off again when <quantity> is below <off_below>." For example, the fan turns on above 30 °C.
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

// Module 24: the opposite direction. "If <quantity> stays BELOW <on_below> continuously for <for_seconds> seconds, the rule
// turns on; the rule turns off again when <quantity> is above <off_above>." For example water when the soil is below 30 %, and
// only water again after the soil has risen above 35 %. That 30-35 gap is hysteresis, the same as in the threshold condition.
export const BelowThresholdCondition = z.strictObject({
  kind: z.literal("below-threshold"),
  device_id: DeviceId,
  quantity: Quantity,
  on_below: z.number(),
  off_above: z.number(),
  for_seconds: z.number().int().min(0).max(3600),
}).refine((c) => c.off_above > c.on_below, {
  message: "off_above must be greater than on_below (hysteresis)",
  path: ["off_above"],
});

// "Every <cron> (WIB time) ..." — a 5-field cron expression: minute hour day month weekday, for example "0 6 * * *".
// Only the number of fields is checked here. Whether each field makes sense (for example minute 61) is checked by node-cron
// on the server (rules.ts), because node-cron can't run in a browser.
export const ScheduleCondition = z.strictObject({
  kind: z.literal("schedule"),
  cron: z.string()
    .refine((text) => text.trim().split(/\s+/).length === 5, "a schedule uses 5 fields: minute hour day month weekday"),
});

// "... then turn on <target> of that device while the rule is on, and turn it off again when the rule turns off."
export const SwitchAction = z.strictObject({
  kind: z.literal("switch"),
  device_id: DeviceId,
  target: z.enum(["fan", "lamp"]),
  notify: z.boolean(), // send a Telegram message when this rule acts?
});

// "... then send one set command", for example the pump for 5 seconds. Uses the same command schema as the API.
// Module 24: also allowed for threshold and below-threshold conditions. The command is sent ONCE when the rule turns on;
// nothing is sent when the rule turns off (the pump turns itself off when its seconds are up).
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
  condition: z.discriminatedUnion("kind", [ThresholdCondition, BelowThresholdCondition, ScheduleCondition]),
  action: z.discriminatedUnion("kind", [SwitchAction, CommandAction]),
});

// The body of POST /rules and PUT /rules/:id, with the combined checks. The server adds one more check in rules.ts.
export const Rule = RuleFields
  // A switch action means "on while the rule is on". A schedule only has a start, no end, so a schedule may only send
  // a command. Every other pair is allowed (Module 24).
  .refine((a) => a.condition.kind !== "schedule" || a.action.kind === "command", {
    message: "a schedule condition goes with a command action; a switch action only goes with a threshold or below-threshold condition",
    path: ["action", "kind"],
  })
  // The threshold of a fan rule is also sent to the device as temp_fan_on (config, contract 1.3), so its range must be the
  // same as what the device accepts: 15-45 °C.
  .refine((a) => a.condition.kind !== "threshold" || a.action.kind !== "switch" || a.condition.quantity !== "temperature"
    || a.action.target !== "fan" || (a.condition.on_above >= 15 && a.condition.on_above <= 45), {
    message: "for a fan rule, on_above must be 15-45 °C (it is also sent to the device as temp_fan_on)",
    path: ["condition", "on_above"],
  });

export type Quantity = z.infer<typeof Quantity>;
export type ThresholdCondition = z.infer<typeof ThresholdCondition>;
export type BelowThresholdCondition = z.infer<typeof BelowThresholdCondition>;
export type ScheduleCondition = z.infer<typeof ScheduleCondition>;
export type SwitchAction = z.infer<typeof SwitchAction>;
export type CommandAction = z.infer<typeof CommandAction>;
export type Rule = z.infer<typeof Rule>;

// a rule already stored in the database: plus its number and its times
export type StoredRule = Rule & { id: number; created_at: string; updated_at: string };
