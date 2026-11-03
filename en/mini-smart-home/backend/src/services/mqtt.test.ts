// mqtt.test.ts - tests for STATUS messages from the broker (Module 25) WITHOUT a broker, a database, or Telegram: the mqtt
// library and mqtt.ts's neighbours are replaced by fakes (vi.mock); the in-memory store (store.ts) stays the real one. What is
// tested: which status messages are passed on to Telegram (notifyStatus), including an "online" that arrives as a RETAINED
// Since Module 27 also: the client name and session the backend asks for when it connects (the mqtt.connect options).
// Since Module 28 also: contract 1.6 vitals (fw, reset_reason, ota), the "stopped on purpose" sentence for offline-mode, the update
// and config commands it publishes (retained or not), and the broker account answers on the control topic.
// message after a broker restart. Run: npm test
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FastifyBaseLogger } from "fastify";

const mock = vi.hoisted(() => ({
  listeners: new Map<string, (...args: unknown[]) => void>(), // the fake MQTT client's events ("message", "connect", ...)
  options: [] as Record<string, unknown>[], // the options of every mqtt.connect call, in order
  published: [] as { topic: string; payload: string; options: { qos: number; retain: boolean } }[], // Module 28: the published messages
  subscribed: [] as string[], // Module 28: the subscribed topics
  notifyStatus: vi.fn(),
  events: [] as { kind: string; message: string }[],
  recordUpdateVitals: vi.fn(),
  recordFw: vi.fn(),
  deliverControlAnswer: vi.fn(),
}));
vi.mock("mqtt", () => ({
  default: {
    connect: (_url: string, options: Record<string, unknown>) => {
      mock.options.push(options);
      return { options: {}, connected: true,
        on: (event: string, fn: (...args: unknown[]) => void) => mock.listeners.set(event, fn),
        subscribe: (topic: string) => { mock.subscribed.push(topic); },
        publish: (topic: string, payload: string, options: { qos: number; retain: boolean }) => { mock.published.push({ topic, payload, options }); } };
    },
  },
}));
vi.mock("../db/archive.ts", () => ({ archiveStatus: async () => {}, archiveTelemetry: async () => true, archiveVitals: async () => {} }));
vi.mock("./realtime.ts", () => ({ broadcastStatus: () => {}, broadcastTelemetry: () => {} }));
vi.mock("./commands.ts", () => ({ recordReport: () => {}, deviceRestarted: () => {} }));
vi.mock("./automation.ts", () => ({ sendAllConfigs: () => {}, evaluateReading: () => {} }));
vi.mock("./events.ts", () => ({ recordEvent: (e: { kind: string; message: string }) => { mock.events.push(e); } }));
vi.mock("./telegram.ts", () => ({ notify: async () => true, notifyStatus: mock.notifyStatus }));
vi.mock("./registry.ts", () => ({ devicePermission: () => "registered", recordIgnored: () => {} })); // every device is registered
// Module 28: new neighbours. Without these mocks, env.ts (imported by broker-accounts.ts and ota.ts) checks a .env that doesn't exist
// in the tests and then stops the process (an M28 research lab finding: this test file failed to load)
vi.mock("./broker-accounts.ts", () => ({
  controlTopic: () => ({ command: "msh-gateway/pi1/dynamic-security/v1", answer: "msh-gateway/pi1/dynamic-security/v1/response" }),
  deliverControlAnswer: mock.deliverControlAnswer,
}));
vi.mock("./ota.ts", () => ({ recordFw: mock.recordFw, recordUpdateVitals: mock.recordUpdateVitals }));

import { clearConfig, statusSentence, sendConfig, sendUpdate, startMqtt, publishControl } from "./mqtt.ts";

const log = { info: () => {}, warn: () => {}, error: () => {} } as unknown as FastifyBaseLogger;
startMqtt("mqtt://127.0.0.1:1", null, log);

// one status message from the broker, exactly as the backend receives it (retained = a message the broker keeps)
function statusArrives(deviceId: string, status: string, retained: boolean): void {
  mock.listeners.get("message")?.(`msh/${deviceId}/status`, Buffer.from(status), { retain: retained });
}

beforeEach(() => mock.notifyStatus.mockClear());

describe("device status to Telegram (notifyStatus)", () => {
  it("broker restart: the offline will, then a RETAINED online (the device connected first) is still passed on", () => {
    statusArrives("f00d00000001", "online", false);
    mock.notifyStatus.mockClear();
    statusArrives("f00d00000001", "offline", false); // the broker stops: the device's will is published (📴 waits 60 seconds)
    statusArrives("f00d00000001", "online", true); // the broker is back, the device first: its message is a retained one
    // without the second online, a false 📴 is sent 60 seconds later and the next 📴 for this device never comes
    expect(mock.notifyStatus.mock.calls).toEqual([["f00d00000001", "offline"], ["f00d00000001", "online"]]);
  });

  it("a RETAINED offline when the backend starts = an old state: not reported; an unchanged status isn't either", () => {
    statusArrives("f00d00000002", "offline", true);
    statusArrives("f00d00000002", "offline", false);
    expect(mock.notifyStatus).not.toHaveBeenCalled();
  });
});

describe("the backend's MQTT client name and session (Module 27)", () => {
  it("without an account: a random client name backend-xxxxxx and a clean session (clean true), as before Module 27", () => {
    const options = mock.options[0]; // the startMqtt call above (without an account)
    expect(options?.clientId).toMatch(/^backend-[0-9a-f]{1,6}$/);
    expect(options?.clean).toBe(true);
    expect(options?.username).toBeUndefined();
  });

  it("with an account: client name = account name and a PERSISTENT session (clean false), so the broker holds QoS 1 messages while the backend is away", () => {
    startMqtt("mqtt://127.0.0.1:1", { username: "backend", password: "test-password" }, log);
    const options = mock.options.at(-1);
    expect(options?.clientId).toBe("backend");
    expect(options?.clean).toBe(false);
    expect(options?.username).toBe("backend");
  });
});

// Module 28 -----------------------------------------------------------------------------------------------------------
const messageArrives = (topic: string, payload: string) => mock.listeners.get("message")?.(topic, Buffer.from(payload), { retain: false });
const VITALS_16 = { ts: "2026-10-31T01:00:00Z", rssi: -60, uptime_s: 12, heap_free: 180000 };

describe("contract 1.6 in mqtt.ts (Module 28)", () => {
  it("offline-mode = stopped ON PURPOSE: an event-log sentence without the word disconnected (the daily report doesn't count it)", () => {
    mock.events.length = 0;
    statusArrives("f00d00000003", "online", false);
    statusArrives("f00d00000003", "offline-mode", false);
    expect(statusSentence("f00d00000003", "offline-mode")).not.toContain("disconnected");
    expect(statusSentence("f00d00000003", "offline")).toBe("f00d00000003 disconnected (offline)");
    expect(mock.notifyStatus).toHaveBeenLastCalledWith("f00d00000003", "offline-mode");
  });

  it("firmware 1.7.0 vitals (reset_reason + fw + ota) are accepted and passed to the update recorder; 1.6.0 vitals stay valid", () => {
    mock.recordUpdateVitals.mockClear();
    messageArrives("msh/f00d00000001/vitals", JSON.stringify({ ...VITALS_16, reset_reason: "SW", fw: "1.7.1",
      ota: { id: "c-20261031-010000-1", result: "succeeded", version: "1.7.1" } }));
    messageArrives("msh/f00d00000001/vitals", JSON.stringify(VITALS_16)); // the old form
    expect(mock.recordUpdateVitals).toHaveBeenCalledTimes(2);
    expect(mock.recordUpdateVitals.mock.calls[0][1]).toMatchObject({ fw: "1.7.1", reset_reason: "SW" });
  });

  it("vitals with reset_reason but no fw, or a reason outside the seven values, are REFUSED (not passed on)", () => {
    mock.recordUpdateVitals.mockClear();
    messageArrives("msh/f00d00000001/vitals", JSON.stringify({ ...VITALS_16, reset_reason: "SW" }));
    messageArrives("msh/f00d00000001/vitals", JSON.stringify({ ...VITALS_16, reset_reason: "REBOOT", fw: "1.7.0" }));
    expect(mock.recordUpdateVitals).not.toHaveBeenCalled();
  });

  it("telemetry carries fw: the version is recorded for /fleet (Node 2 too, from its packet)", () => {
    mock.recordFw.mockClear();
    messageArrives("msh/246f28b1c7d4/telemetry", JSON.stringify({ ts: "2026-10-31T01:00:00Z", fw: "1.0.0", temperature: 29.4, humidity: 78,
      pressure: 1008.6, soil_temperature: 27.3, soil: 41 }));
    expect(mock.recordFw).toHaveBeenCalledWith("246f28b1c7d4", "1.0.0");
  });

  it("update is NEVER retained (QoS 1); the combined config is retained; clearConfig = an empty retained message", () => {
    mock.published.length = 0;
    sendUpdate("f00d00000001", "c-20261031-010000-2", { version: "1.7.1", url: "https://iot.yourname.my.id/fw/node-1/1.7.1.bin",
      sha256: "a".repeat(64), size: 1196032 });
    sendConfig("f00d00000001", "c-20261031-010000-3", { thresholds: { temp_fan_on: 30 }, intervals: { vitals_s: 60 } });
    clearConfig("f00d00000001");
    expect(mock.published.map((p) => p.options)).toEqual([{ qos: 1, retain: false }, { qos: 1, retain: true }, { qos: 1, retain: true }]);
    expect(JSON.parse(mock.published[0].payload)).toMatchObject({ action: "update", version: "1.7.1", size: 1196032 });
    expect(JSON.parse(mock.published[1].payload)).toMatchObject({ action: "config", thresholds: { temp_fan_on: 30 }, intervals: { vitals_s: 60 } });
    expect(mock.published[2]).toMatchObject({ topic: "msh/f00d00000001/cmd", payload: "" });
  });

  it("the broker account control topic: subscribed when connected, its answers go to broker-accounts.ts (not taken as msh/...)", () => {
    mock.listeners.get("connect")?.();
    expect(mock.subscribed).toContain("msh-gateway/pi1/dynamic-security/v1/response");
    messageArrives("msh-gateway/pi1/dynamic-security/v1/response", '{"responses":[]}');
    expect(mock.deliverControlAnswer).toHaveBeenCalledWith('{"responses":[]}');
    expect(publishControl("msh-gateway/pi1/dynamic-security/v1", "{}")).toBe(true);
    expect(mock.published.at(-1)?.options).toEqual({ qos: 1, retain: false });
  });
});
