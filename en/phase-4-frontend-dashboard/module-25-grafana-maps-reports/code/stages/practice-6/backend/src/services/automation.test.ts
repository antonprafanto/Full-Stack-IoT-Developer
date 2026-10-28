// automation.test.ts - tests for automation.ts (Module 24) WITHOUT a database, MQTT, or Telegram: all its neighbours are
// replaced by fakes (vi.mock). Only which commands are "sent" to the device and which events are written are recorded. Tested:
// a watering rule (below-threshold + command) waters ONCE, turns off without a command and is then ready again, a command the
// device refuses is marked ok: false, and a rule that is deleted or deactivated doesn't act anymore. Run: npm test
import { beforeEach, describe, expect, it, vi } from "vitest";

const table = vi.hoisted(() => ({ rules: [] as Record<string, unknown>[] })); // the fake rules table
const sent = vi.hoisted(() => [] as { target: string; value: unknown }[]); // the commands "sent" to the device
const events = vi.hoisted(() => [] as { rule_id: number | null; message: string; data?: unknown }[]);
const answer = vi.hoisted(() => ({ ok: true, message: undefined as string | undefined })); // the fake device's ack
const forgotten = vi.hoisted(() => [] as number[]); // rule numbers whose wishes commands.ts forgot

vi.mock("../db/archive.ts", () => ({
  getAllRules: async () => table.rules,
  insertRule: async () => { throw new Error("not used"); },
  updateRule: async (id: number, content: Record<string, unknown>) => {
    const old = table.rules.find((b) => b.id === id);
    if (old === undefined) return undefined;
    const fresh = { ...old, ...content };
    table.rules = table.rules.map((b) => (b.id === id ? fresh : b));
    return fresh;
  },
  deleteRuleDb: async (id: number) => {
    const row = table.rules.find((b) => b.id === id);
    if (row === undefined) return undefined;
    table.rules = table.rules.filter((b) => b.id !== id);
    return { id, name: row.name };
  },
  contractTime: (w: Date) => w.toISOString().slice(0, 19) + "Z",
}));
vi.mock("./commands.ts", () => ({
  issueCommand: async (_device: string, command: { target: string; value: unknown }) => {
    sent.push(command);
    return { status: "answered", id: `c-${sent.length}`, wait_ms: 5,
      ack: { id: `c-${sent.length}`, ts: null, ok: answer.ok, message: answer.message, state: {} } };
  },
  forgetRuleWishes: (ruleId: number) => { forgotten.push(ruleId); },
}));
vi.mock("./events.ts", () => ({ recordEvent: (e: { rule_id: number | null; message: string }) => { events.push(e); } }));
vi.mock("./store.ts", () => ({ findDevice: () => undefined, waitForAck: async () => null }));
vi.mock("./mqtt.ts", () => ({ makeCommandId: () => "c-config", sendConfig: () => {}, summarize: () => "" }));
vi.mock("./schedule.ts", () => ({ installSchedules: () => {} }));
vi.mock("./telegram.ts", () => ({ notifyIfNeeded: async () => {} }));

import { deleteRule, evaluateReading, loadRules, replaceRule } from "./automation.ts";
import type { Rule } from "../schemas/rules.ts";
import type { TelemetryNode1 } from "../schemas/contract.ts";

const ID = "f00d00000001";
const WATERING: Rule = { name: "Water if soil < 30 %", active: true,
  condition: { kind: "below-threshold", device_id: ID, quantity: "soil", on_below: 30, off_above: 35, for_seconds: 0 },
  action: { kind: "command", device_id: ID, command: { target: "pump", value: 5 }, notify: false } };
const wait = () => new Promise((r) => setTimeout(r, 0)); // give act() (async) a chance to finish
async function reading(soil: number) {
  evaluateReading(ID, { ts: new Date().toISOString().slice(0, 19) + "Z", soil } as unknown as TelemetryNode1);
  await wait();
}

let ruleNo = 0; // every test uses a new rule number: a rule's memory in automation.ts lasts between tests

describe("automation: the watering rule (below-threshold + command)", () => {
  beforeEach(async () => {
    table.rules = [{ ...structuredClone(WATERING), id: ++ruleNo, created_at: new Date(), updated_at: new Date() }];
    sent.length = 0;
    events.length = 0;
    forgotten.length = 0;
    answer.ok = true;
    answer.message = undefined;
    await loadRules();
  });

  it("soil 25: the pump for 5 seconds is sent ONCE, even though the soil stays at 25", async () => {
    await reading(25);
    await reading(25);
    await reading(26);
    expect(sent).toEqual([{ target: "pump", value: 5 }]);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ rule_id: ruleNo, message: "🌱 Soil 25 % — pump watering for 5 seconds automatically",
      data: { result: "answered", ok: true } });
  });

  it("soil rises to 36: the rule turns off WITHOUT a command (ok null), then it is ready to water again", async () => {
    await reading(25);
    await reading(36);
    expect(sent).toHaveLength(1); // turning off sends nothing
    expect(events.at(-1)).toMatchObject({ rule_id: ruleNo, message: "✅ Soil up to 36 % — rule ready again",
      data: { command: null, result: "no-command", ok: null } });
    await reading(25);
    expect(sent).toHaveLength(2); // the next dry spell: it waters again
  });

  it("the device refuses (tank too low): a ⚠️ event with ok: false, and no retry while the soil stays dry", async () => {
    answer.ok = false;
    answer.message = "pump refused: tank water too low";
    await reading(25);
    await reading(25);
    expect(sent).toHaveLength(1);
    expect(events[0]).toMatchObject({ message: "⚠️ Soil 25 % — pump command refused by the device: pump refused: tank water too low",
      data: { result: "answered", ok: false } });
  });

  it("deleted: its event has rule_id null, its wishes are forgotten, and a dry reading afterwards doesn't water", async () => {
    expect(await deleteRule(ruleNo)).toEqual({ id: ruleNo, name: "Water if soil < 30 %" });
    expect(events.at(-1)).toMatchObject({ rule_id: null, data: { id: ruleNo, deleted: true } });
    expect(forgotten).toEqual([ruleNo]);
    await reading(25);
    expect(sent).toHaveLength(0);
  });

  it("deactivated: its wishes are forgotten and the rule doesn't water anymore", async () => {
    await replaceRule(ruleNo, { ...structuredClone(WATERING), active: false });
    expect(forgotten).toEqual([ruleNo]);
    await reading(25);
    expect(sent).toHaveLength(0);
  });
});
