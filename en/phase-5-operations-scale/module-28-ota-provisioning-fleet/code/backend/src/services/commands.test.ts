// commands.test.ts - tests for command reconciliation (Module 19) with the age limit for manual commands (Module 27): a dashboard
// command the device doesn't answer is sent again if the device is heard within 2 minutes, but NOT sent again after a long home
// internet outage (the late arrivals come in afterwards). Without a broker, a database, or a device: store, mqtt, archive,
// events, log, and registry are replaced by fakes (vi.mock), the clock by a fake clock (vi.useFakeTimers). Run: npm test
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { State } from "../schemas/contract.ts";

// one fake Node 1 that looks "online" (as on the VPS while the home internet is down: the retained status stays online)
const mock = vi.hoisted(() => ({
  device: { kind: "node1", status: "online", reported: null as State | null, reported_ts: null as string | null },
  sent: [] as { target: string; value: unknown }[],
  logLines: [] as string[],
}));
vi.mock("./store.ts", () => ({
  findDevice: () => mock.device,
  saveReport: (_id: string, state: State) => { mock.device.reported = state; return true; },
  waitForAck: async () => null, // the device never answers: the home internet is down
}));
vi.mock("./mqtt.ts", () => ({
  brokerConnected: () => true,
  makeCommandId: () => "c-20261029-090000-1",
  sendCommand: (_id: string, _commandId: string, command: { target: string; value: unknown }) => {
    mock.sent.push(command);
  },
}));
vi.mock("../db/archive.ts", () => ({ archiveCommand: async () => {} }));
vi.mock("./events.ts", () => ({ recordEvent: () => {} }));
vi.mock("./log.ts", () => ({
  log: { info: (p: string) => mock.logLines.push(p), warn: (p: string) => mock.logLines.push(p), error: () => {} },
}));
vi.mock("./registry.ts", () => ({ devicePermission: () => "registered" }));

import { deviceRestarted, issueCommand, recordReport } from "./commands.ts";

const ALL_OFF: State = { fan: false, lamp: false, pump: false, curtain: 0 };
// the server's wishes are kept per device_id inside commands.ts: every test uses its own device_id
const ID = ["a4cf12e5b7c1", "a4cf12e5b7c2", "a4cf12e5b7c3", "a4cf12e5b7c4"];
const minutes = (n: number) => vi.advanceTimersByTime(n * 60_000);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-29T09:00:00Z"));
  mock.device.reported = { ...ALL_OFF };
  mock.sent.length = 0;
  mock.logLines.length = 0;
});
afterEach(() => vi.useRealTimers());

describe("manual commands without an ack (Module 27)", () => {
  it("the device is heard again within 2 minutes: the lamp command is sent again (Module 19 reconciliation still works)", async () => {
    expect((await issueCommand(ID[0], { target: "lamp", value: true }, "api")).status).toBe("no-ack");
    minutes(1); // 60 seconds later a telemetry arrives, the lamp is still off
    recordReport(ID[0], ALL_OFF, "2026-10-29T09:01:00Z");
    expect(mock.sent).toEqual([{ target: "lamp", value: true }, { target: "lamp", value: true }]);
  });

  it("the home internet down for 10 minutes: late arrivals come in, a lamp command already reported as failed is NOT sent again", async () => {
    expect((await issueCommand(ID[1], { target: "lamp", value: true }, "api")).status).toBe("no-ack");
    minutes(10);
    recordReport(ID[1], ALL_OFF, "2026-10-29T09:00:30Z"); // a late arrival (an old ts) ...
    recordReport(ID[1], ALL_OFF, "2026-10-29T09:10:00Z"); // ... then a new one
    expect(mock.sent).toEqual([{ target: "lamp", value: true }]); // only the first send
    expect(mock.logLines).toContain(
      `command lamp = true (api) to ${ID[1]} not carried out for more than 2 minutes: not sent again`);
  });

  it("a command from Telegram is treated the same; an automation rule's wish is still retried after 10 minutes", async () => {
    await issueCommand(ID[2], { target: "lamp", value: true }, "telegram");
    await issueCommand(ID[2], { target: "fan", value: true }, "rule", 3);
    minutes(10);
    recordReport(ID[2], ALL_OFF, "2026-10-29T09:10:00Z");
    expect(mock.sent).toEqual([
      { target: "lamp", value: true }, { target: "fan", value: true }, { target: "fan", value: true }]);
  });

  it("a command that WAS carried out is still restored after the device restarts, however old it is", async () => {
    await issueCommand(ID[3], { target: "lamp", value: true }, "api");
    recordReport(ID[3], { ...ALL_OFF, lamp: true }, "2026-10-29T09:00:05Z"); // the lamp is on: the wish is fulfilled
    minutes(30);
    deviceRestarted(ID[3], 12); // Node 1 lost power for a moment: every relay is off
    recordReport(ID[3], ALL_OFF, "2026-10-29T09:30:00Z");
    expect(mock.sent).toEqual([{ target: "lamp", value: true }, { target: "lamp", value: true }]);
  });
});
