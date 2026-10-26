// rules.ts - the automation rule schema for the SERVER (Module 19). Module 24: every rule shape moved to rule-basics.ts, which
// has no node-cron, so the dashboard can use a copy of it in the browser. Only one check that needs node-cron is added here:
// can the cron expression of a schedule rule really be run?
import type { z } from "zod";
import cron from "node-cron";
import { Rule as BaseRule } from "./rule-basics.ts";

// Everything in rule-basics.ts is available from this file too (ThresholdCondition, BelowThresholdCondition, SwitchAction,
// RuleFields, their types, and so on), so the other backend files keep importing from rules.ts as they have since Module 19.
// The Rule below replaces the Rule of rule-basics.ts: a name written in this file itself always wins.
export * from "./rule-basics.ts";

// The body of POST /rules and PUT /rules/:id on the server: the basic shape + a cron expression node-cron can really run.
export const Rule = BaseRule.refine((a) => a.condition.kind !== "schedule" || cron.validate(a.condition.cron), {
  message: "invalid cron expression",
  path: ["condition", "cron"],
});

export type Rule = z.infer<typeof Rule>; // the same name for the value and its type, as in rule-basics.ts
