// broker-accounts.test.ts - tests of the automatic broker accounts (Module 28) WITHOUT a broker: the control topic publisher (mqtt.ts)
// is replaced by a mock that records the commands and, when asked, answers like Mosquitto 2.1.2's dynamic security plugin (the
// answer form from the M28 research lab). Tested: the gateway topic through the bridge, the read default = deny BEFORE createClient
// (an M28 verification finding), createClient, an existing account gets a new key, no answer within 3 seconds = tried ONCE more,
// then an error (the timer set AFTER publishing, no unhandled rejection), the backend not connected, deleteClient, and the queue of
// account steps (one at a time; waiting for a turn > 5 seconds = an error without being carried out). Run: npm test
import { afterEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => { // env.ts checks .env when imported: valid fake settings, broker accounts through the gateway pi1
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://fake:fake@127.0.0.1:1/fake";
  process.env.JWT_SECRET = "test-secret-long-enough-for-zod-0123456789";
  process.env.AUTO_BROKER_ACCOUNTS = "gateway:pi1";
});

const broker = vi.hoisted(() => ({
  connected: true,
  published: [] as { topic: string; command: Record<string, unknown> }[],
  // answer(command) -> the "error" content (string) or undefined; null = SILENT (the answer never comes)
  answer: (_c: Record<string, unknown>): string | undefined | null => undefined,
}));
vi.mock("./mqtt.ts", () => ({
  publishControl: (topic: string, content: string) => {
    if (!broker.connected) return false;
    const command = (JSON.parse(content) as { commands: Record<string, unknown>[] }).commands[0];
    broker.published.push({ topic, command });
    const error = broker.answer(command);
    if (error !== null) { // the answer arrives on the .../response topic a few milliseconds later
      setTimeout(() => void import("./broker-accounts.ts").then((m) => m.deliverControlAnswer(JSON.stringify({
        responses: [{ command: command.command, correlationData: command.correlationData, ...(error ? { error } : {}) }],
      }))), 5);
    }
    return true;
  },
}));

import { QUEUE_LIMIT_MS, ANSWER_LIMIT_MS, accountQueue, removeDeviceAccount, addDeviceAccount, accountPlace, controlTopic }
  from "./broker-accounts.ts";

afterEach(() => {
  broker.published.length = 0;
  broker.connected = true;
  broker.answer = () => undefined;
  vi.useRealTimers();
});

describe("automatic broker accounts through dynamic security (AUTO_BROKER_ACCOUNTS=gateway:pi1)", () => {
  it("the gateway control topic = msh-gateway/pi1/... at the central broker (the bridge moves it to the gateway's $CONTROL)", () => {
    expect(controlTopic()).toEqual({ command: "msh-gateway/pi1/dynamic-security/v1",
      answer: "msh-gateway/pi1/dynamic-security/v1/response" });
    expect(accountPlace()).toBe("gateway broker pi1");
  });

  it("a new device: the READ default = deny first, then one createClient (username = device_id, password = key, no role)", async () => {
    expect(await addDeviceAccount("f00d00000003", "k".repeat(43))).toBe("created");
    expect(broker.published).toHaveLength(2);
    expect(broker.published[0].topic).toBe("msh-gateway/pi1/dynamic-security/v1");
    expect(broker.published[0].command).toMatchObject({ command: "setDefaultACLAccess",
      acls: [{ acltype: "publishClientReceive", allow: false }] });
    expect(broker.published[1].command).toMatchObject({ command: "createClient", username: "f00d00000003", password: "k".repeat(43) });
    expect(broker.published[1].command).not.toHaveProperty("roles");
  });

  it("the broker refuses setDefaultACLAccess: an error, createClient is NOT sent (no account made with an open read permission)", async () => {
    broker.answer = (c) => (c.command === "setDefaultACLAccess" ? "Permission denied" : undefined);
    await expect(addDeviceAccount("f00d00000003", "k".repeat(43))).rejects.toThrow("setDefaultACLAccess: Permission denied");
    expect(broker.published.map((p) => p.command.command)).toEqual(["setDefaultACLAccess"]);
  });

  it("the account already exists (key rotation): setClientPassword then enableClient", async () => {
    broker.answer = (c) => (c.command === "createClient" ? "Client already exists" : undefined);
    expect(await addDeviceAccount("f00d00000003", "b".repeat(43))).toBe("changed");
    expect(broker.published.map((p) => p.command.command))
      .toEqual(["setDefaultACLAccess", "createClient", "setClientPassword", "enableClient"]);
  });

  it("no answer within 3 seconds: tried ONCE more; the second answer comes = success", async () => {
    vi.useFakeTimers();
    let n = 0;
    broker.answer = () => (++n === 1 ? null : undefined); // the first attempt is lost (the bridge just connected)
    const result = addDeviceAccount("f00d00000004", "c".repeat(43));
    await vi.advanceTimersByTimeAsync(ANSWER_LIMIT_MS + 50);
    expect(await result).toBe("created");
    expect(broker.published.map((p) => p.command.command)).toEqual(["setDefaultACLAccess", "setDefaultACLAccess", "createClient"]);
  });

  it("silent twice: an error with a clear reason (the caller answers 503), without an unhandled rejection", async () => {
    vi.useFakeTimers();
    broker.answer = () => null;
    const result = addDeviceAccount("f00d00000005", "d".repeat(43));
    const caught = expect(result).rejects.toThrow("gateway broker pi1 didn't answer setDefaultACLAccess within 3 seconds");
    await vi.advanceTimersByTimeAsync(2 * ANSWER_LIMIT_MS + 10);
    await caught;
    expect(broker.published).toHaveLength(2);
  });

  it("the backend isn't connected to the broker: an error at once, no 3-second wait", async () => {
    broker.connected = false;
    await expect(addDeviceAccount("f00d00000006", "e".repeat(43))).rejects.toThrow("isn't connected to the broker");
  });

  it("delete: deleted, or none (an old Module 21 account in the password file), any other error is thrown", async () => {
    expect(await removeDeviceAccount("f00d00000003")).toBe("deleted");
    broker.answer = () => "Client not found";
    expect(await removeDeviceAccount("a4cf12e5b7c0")).toBe("none");
    broker.answer = () => "Internal error";
    await expect(removeDeviceAccount("a4cf12e5b7c0")).rejects.toThrow("deleteClient a4cf12e5b7c0: Internal error");
  });

  it("the queue: account steps run ONE AT A TIME, in order of arrival; one step's error doesn't stop the queue", async () => {
    const order: string[] = [];
    const step = (name: string, fails = false) => async () => {
      order.push(`${name} start`);
      await new Promise((r) => setTimeout(r, 5));
      order.push(`${name} done`);
      if (fails) throw new Error(`${name} failed`);
      return name;
    };
    const results = await Promise.allSettled([accountQueue(step("A", true)), accountQueue(step("B")), accountQueue(step("C"))]);
    expect(order).toEqual(["A start", "A done", "B start", "B done", "C start", "C done"]);
    expect(results.map((r) => r.status)).toEqual(["rejected", "fulfilled", "fulfilled"]);
  });

  it("the queue: waiting for a turn longer than 5 seconds (a silent broker) = an error WITHOUT being carried out (database and broker untouched)", async () => {
    vi.useFakeTimers();
    let done = 0;
    const slow = accountQueue(() => new Promise((r) => setTimeout(r, 2 * ANSWER_LIMIT_MS))); // for example createClient silent twice
    const waiting = accountQueue(async () => { done++; });
    const caught = expect(waiting).rejects.toThrow("the previous broker account step hasn't finished after 5 seconds");
    await vi.advanceTimersByTimeAsync(2 * ANSWER_LIMIT_MS + 10);
    await slow;
    await caught;
    expect(done).toBe(0);
    expect(QUEUE_LIMIT_MS).toBeLessThan(2 * ANSWER_LIMIT_MS);
  });
});
