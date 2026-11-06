// engine.test.ts - the project's first unit tests (Module 19): the rules brain without MQTT, a database, or a real clock.
// Module 24: plus the "below threshold" rule (water when the soil is dry) and rule schema 1.1. Run: npm test
import { describe, expect, it } from "vitest";
import { INITIAL_RECORD, INITIAL_MEMORY, REMINDER_MS, evaluateThreshold, evaluateBelowThreshold, shouldNotify } from "./engine.ts";
import type { Memory, Decision } from "./engine.ts";
import { Rule } from "../schemas/rules.ts";
import type { BelowThresholdCondition, ThresholdCondition } from "../schemas/rules.ts";
import { Rule as BaseRule } from "../schemas/rule-basics.ts"; // Module 24: the version without node-cron (copied in the frontend)

// an example fan rule: on above 30 °C for 2 minutes, off below 28 °C
const FAN: ThresholdCondition = {
  kind: "threshold", device_id: "f00d00000001", quantity: "temperature", on_above: 30, off_below: 28, for_seconds: 120,
};
const T0 = Date.parse("2026-10-21T13:00:00+07:00"); // a pretend clock: the tests don't need to wait 2 real minutes
const ON: Memory = { active: true, since: null, last: T0 }; // a rule whose fan is already on

// Evaluate a few readings [seconds since T0, value] in order. The result is the last memory and every decision.
function run(readings: [number, number | null][], initial: Memory = INITIAL_MEMORY) {
  let memory = initial;
  const decisions: Decision[] = [];
  for (const [second, value] of readings) {
    const result = evaluateThreshold(FAN, memory, value, T0 + second * 1000);
    memory = result.memory;
    decisions.push(result.decision);
  }
  return { memory, decisions };
}

// a reading every 10 seconds from second `start` to `end`, all with the value `value`
function every10Seconds(start: number, end: number, value: number | null): [number, number | null][] {
  const list: [number, number | null][] = [];
  for (let second = start; second <= end; second += 10) list.push([second, value]);
  return list;
}

describe("fan rule (evaluateThreshold)", () => {
  it("temperature 29.5 °C: no decision, the fan stays off", () => {
    const { memory, decisions } = run(every10Seconds(0, 300, 29.5));
    expect(decisions.every((k) => k === null)).toBe(true);
    expect(memory.active).toBe(false);
  });

  it("temperature 31 °C for only 60 seconds: still waiting", () => {
    const { memory, decisions } = run(every10Seconds(0, 60, 31));
    expect(decisions.at(-1)).toBeNull();
    expect(memory.since).toBe(T0); // the count starts from the first hot reading
  });

  it("temperature 31 °C for 120 seconds: the fan is turned on, only once", () => {
    const { decisions } = run(every10Seconds(0, 150, 31));
    expect(decisions[12]).toBe("turn-on"); // the 13th reading, second 120
    expect(decisions.filter((k) => k === "turn-on")).toHaveLength(1); // seconds 130-150 don't turn it on again
  });

  it("exactly 30 °C in the middle of the count: the count starts again (it must be ABOVE 30)", () => {
    const { memory, decisions } = run([...every10Seconds(0, 60, 31), [70, 30], ...every10Seconds(80, 190, 31)]);
    expect(decisions).not.toContain("turn-on"); // seconds 80 to 190 are only 110 seconds
    expect(memory.since).toBe(T0 + 80_000);
  });

  it("already on, temperature 29 °C (between 28 and 30): stays on", () => {
    const { memory, decisions } = run(every10Seconds(10, 100, 29), ON);
    expect(decisions.every((k) => k === null)).toBe(true);
    expect(memory.active).toBe(true);
  });

  it("already on, temperature 27.9 °C: the fan is turned off", () => {
    const { memory, decisions } = run([[10, 27.9]], ON);
    expect(decisions[0]).toBe("turn-off");
    expect(memory.active).toBe(false);
  });

  it("a null reading (failed sensor): no decision, the count starts again", () => {
    const { memory, decisions } = run([...every10Seconds(0, 100, 31), [110, null], ...every10Seconds(120, 200, 31)]);
    expect(decisions).not.toContain("turn-on");
    expect(memory.since).toBe(T0 + 120_000);
  });

  it("a gap between readings of more than 60 seconds: the count starts again", () => {
    const { memory, decisions } = run([[0, 31], [50, 31], [130, 31]]); // second 50 to 130 = 80 seconds without news
    expect(decisions).not.toContain("turn-on");
    expect(memory.since).toBe(T0 + 130_000);
  });
});

describe("Telegram alerts (shouldNotify)", () => {
  it("notifies on a change, reminds every 30 minutes while in danger, notifies again on recovery", () => {
    let record = INITIAL_RECORD;
    let result = shouldNotify(record, "danger", T0);
    expect(result.send).toBe(true); // safe -> danger
    record = result.record;
    expect(shouldNotify(record, "danger", T0 + 10 * 60_000).send).toBe(false); // 10 minutes later: quiet
    result = shouldNotify(record, "danger", T0 + REMINDER_MS);
    expect(result.send).toBe(true); // 30 minutes later: a reminder
    record = result.record;
    expect(shouldNotify(record, "safe", T0 + REMINDER_MS + 60_000).send).toBe(true); // danger -> safe: a recovery message
  });
});

describe("rule schema (Zod)", () => {
  it("refuses an off_below that isn't smaller than on_above", () => {
    const rule = {
      name: "Automatic fan", active: true, condition: FAN,
      action: { kind: "switch", device_id: "f00d00000001", target: "fan", notify: true },
    };
    expect(Rule.safeParse(rule).success).toBe(true);
    const reversed = { ...rule, condition: { ...FAN, off_below: 30 } }; // 30 isn't smaller than 30
    expect(Rule.safeParse(reversed).success).toBe(false);
  });

  it("schedule rule: \"0 6 * * *\" accepted, \"61 * * * *\" refused", () => { // Practice 5
    const watering = {
      name: "Morning watering", active: true, condition: { kind: "schedule", cron: "0 6 * * *" },
      action: { kind: "command", device_id: "f00d00000001", command: { target: "pump", value: 10 }, notify: true },
    };
    expect(Rule.safeParse(watering).success).toBe(true);
    expect(Rule.safeParse({ ...watering, condition: { kind: "schedule", cron: "61 * * * *" } }).success).toBe(false);
  });
});

// ---------- Module 24: the below-threshold condition ----------

// an example watering rule: soil below 30 % for 20 seconds -> the pump once; ready again after the soil rises above 35 %
const WATERING: BelowThresholdCondition = {
  kind: "below-threshold", device_id: "f00d00000001", quantity: "soil", on_below: 30, off_above: 35, for_seconds: 20,
};

// the same as run() above, but for the watering rule
function runWatering(readings: [number, number | null][], initial: Memory = INITIAL_MEMORY) {
  let memory = initial;
  const decisions: Decision[] = [];
  for (const [second, value] of readings) {
    const result = evaluateBelowThreshold(WATERING, memory, value, T0 + second * 1000);
    memory = result.memory;
    decisions.push(result.decision);
  }
  return { memory, decisions };
}

describe("watering rule, soil below the threshold (evaluateBelowThreshold)", () => {
  it("soil exactly 30 %: no watering (it must be BELOW 30)", () => {
    const { memory, decisions } = runWatering(every10Seconds(0, 120, 30));
    expect(decisions.every((k) => k === null)).toBe(true);
    expect(memory.active).toBe(false);
  });

  it("soil 25 % for only 10 seconds: still waiting", () => {
    const { memory, decisions } = runWatering(every10Seconds(0, 10, 25));
    expect(decisions.at(-1)).toBeNull();
    expect(memory.since).toBe(T0); // the count starts from the first dry reading
  });

  it("soil 25 % for 20 seconds: turns on (the pump is sent) only once, even though the soil stays at 25 %", () => {
    const { decisions } = runWatering(every10Seconds(0, 120, 25));
    expect(decisions[2]).toBe("turn-on"); // the 3rd reading, second 20
    expect(decisions.filter((k) => k === "turn-on")).toHaveLength(1); // a decision only at the edge
  });

  it("soil rises to 31 % in the middle of the count: the count starts again", () => {
    const { memory, decisions } = runWatering([[0, 25], [10, 31], [20, 25], [30, 25]]);
    expect(decisions).not.toContain("turn-on"); // seconds 20 to 30 are only 10 seconds
    expect(memory.since).toBe(T0 + 20_000);
  });

  it("already on: 33 % and exactly 35 % stay on (hysteresis gap), 36 %: off, ready to water again", () => {
    const { memory, decisions } = runWatering([[10, 33], [20, 35], [30, 36]], ON);
    expect(decisions).toEqual([null, null, "turn-off"]);
    expect(memory.active).toBe(false);
  });

  it("a null reading (failed sensor): no decision, the count starts again", () => {
    const { memory, decisions } = runWatering([[0, 25], [10, null], [20, 25]]);
    expect(decisions).not.toContain("turn-on");
    expect(memory.since).toBe(T0 + 20_000);
  });
});

describe("rule schema 1.1 (Zod)", () => {
  const soilWatering = {
    name: "Water if soil < 30 %", active: true, condition: WATERING,
    action: { kind: "command", device_id: "f00d00000001", command: { target: "pump", value: 5 }, notify: false },
  };

  it("\"water if soil < 30 %\" accepted, and the v1.0 fan rule is still accepted", () => {
    expect(Rule.safeParse(soilWatering).success).toBe(true);
    expect(Rule.safeParse({ name: "Automatic fan", active: true, condition: FAN,
      action: { kind: "switch", device_id: "f00d00000001", target: "fan", notify: true } }).success).toBe(true);
  });

  it("an off_above that isn't greater than on_below is refused, its error in the off_above field", () => {
    const result = Rule.safeParse({ ...soilWatering, condition: { ...WATERING, off_above: 30 } });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toMatchObject({
      path: ["condition", "off_above"], message: "off_above must be greater than on_below (hysteresis)",
    });
  });

  it("a rising threshold rule may send a command once (for example close the curtain when it is too bright)", () => {
    const curtain = { ...soilWatering, name: "Close curtain on glare",
      condition: { kind: "threshold", device_id: "f00d00000001", quantity: "light", on_above: 3500, off_below: 3000,
        for_seconds: 60 },
      action: { kind: "command", device_id: "f00d00000001", command: { target: "curtain", value: 0 }, notify: false } };
    expect(Rule.safeParse(curtain).success).toBe(true);
  });

  it("a schedule with a switch action is still refused: a schedule has no time to turn off", () => {
    const result = Rule.safeParse({ ...soilWatering, condition: { kind: "schedule", cron: "0 6 * * *" },
      action: { kind: "switch", device_id: "f00d00000001", target: "lamp", notify: false } });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => i.message)).toContain(
      "a schedule condition goes with a command action; a switch action only goes with a threshold or below-threshold condition");
  });

  it("rule-basics.ts (also used by the dashboard) only checks the 5 cron fields; rules.ts (server) checks their content", () => {
    const minute61 = { ...soilWatering, condition: { kind: "schedule", cron: "61 * * * *" } };
    expect(BaseRule.safeParse(minute61).success).toBe(true);
    const result = Rule.safeParse(minute61);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toMatchObject({ path: ["condition", "cron"], message: "invalid cron expression" });
    expect(BaseRule.safeParse({ ...soilWatering, condition: { kind: "schedule", cron: "0 6 * *" } }).success).toBe(false);
  });
});
