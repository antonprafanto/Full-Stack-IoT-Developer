// mqtt.test.ts - tests for STATUS messages from the broker (Module 25) WITHOUT a broker, a database, or Telegram: the mqtt
// library and mqtt.ts's neighbours are replaced by fakes (vi.mock); the in-memory store (store.ts) stays the real one. What is
// tested: which status messages are passed on to Telegram (notifyStatus), including an "online" that arrives as a RETAINED
// Since Module 27 also: the client name and session the backend asks for when it connects (the mqtt.connect options).
// message after a broker restart. Run: npm test
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FastifyBaseLogger } from "fastify";

const mock = vi.hoisted(() => ({
  listeners: new Map<string, (...args: unknown[]) => void>(), // the fake MQTT client's events ("message", "connect", ...)
  options: [] as Record<string, unknown>[], // the options of every mqtt.connect call, in order
  notifyStatus: vi.fn(),
}));
vi.mock("mqtt", () => ({
  default: {
    connect: (_url: string, options: Record<string, unknown>) => {
      mock.options.push(options);
      return { options: {}, on: (event: string, fn: (...args: unknown[]) => void) => mock.listeners.set(event, fn) };
    },
  },
}));
vi.mock("../db/archive.ts", () => ({ archiveStatus: async () => {}, archiveTelemetry: async () => true, archiveVitals: async () => {} }));
vi.mock("./realtime.ts", () => ({ broadcastStatus: () => {}, broadcastTelemetry: () => {} }));
vi.mock("./commands.ts", () => ({ recordReport: () => {}, deviceRestarted: () => {} }));
vi.mock("./automation.ts", () => ({ sendAllConfigs: () => {}, evaluateReading: () => {} }));
vi.mock("./events.ts", () => ({ recordEvent: async () => {} }));
vi.mock("./telegram.ts", () => ({ notify: async () => true, notifyStatus: mock.notifyStatus }));
vi.mock("./registry.ts", () => ({ devicePermission: () => "registered", recordIgnored: () => {} })); // every device is registered

import { startMqtt } from "./mqtt.ts";

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
