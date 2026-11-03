// wave.test.ts - Module 28 Challenge 3 (key): tests of the automatic wave WITHOUT the database, the broker, and Telegram. The
// db/fleet.ts queries, the update command (ota.ts), and Telegram are replaced by mocks; the in-memory store (store.ts) stays the real
// one, so the canary's status and vitals are filled in like real MQTT messages. The devices' update results are "reported" through
// waveNotice(), the same path as ota.ts. Fake timers (vi.useFakeTimers) shorten the waiting period. Run: npm test
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UpdateRow } from "../db/fleet.ts";
import type { DeviceResult } from "./wave.ts";

const db = vi.hoisted(() => ({
  releases: new Map<string, { version: string; test: boolean; withdrawn_at: Date | null }>(),
  devices: [] as { device_id: string; canary: boolean; revoked_at: Date | null; fw: string | null }[],
  canaryFailed: 0,
}));
vi.mock("../db/fleet.ts", () => ({
  getRelease: async (_k: string, v: string) => db.releases.get(v),
  updateCandidates: async () => db.devices.map((p) => ({ ...p, kind: "node1", registered_at: new Date(), status: "online", running: false })),
  canarySummary: async () => ({ succeeded: 0, failed: db.canaryFailed }),
}));
// a mock update command: every device accepts it (ack ok), except the ones set otherwise in `answers`
const ota = vi.hoisted(() => ({ sent: [] as string[], answers: new Map<string, { status: string; message: string }>(), n: 0 }));
vi.mock("./ota.ts", () => ({
  requestUpdate: async (id: string, version: string) => {
    ota.sent.push(id);
    const other = ota.answers.get(id);
    if (other?.status === "rejected") return { status: "rejected", id: `c-${++ota.n}`, device_id: id, message: other.message };
    if (other !== undefined) return { status: "not-sent", device_id: id, code: 409, message: other.message };
    return { status: "accepted", id: `c-${id}-${version}`, device_id: id, from: "1.7.0", to: version, wait_ms: 5 };
  },
}));
const tg = vi.hoisted(() => ({ messages: [] as string[], muted: new Set<string>() }));
vi.mock("./telegram.ts", () => ({
  notify: async (text: string) => { tg.messages.push(text); return true; },
  muteStopNotice: (id: string, mute: boolean) => { if (mute) tg.muted.add(id); else tg.muted.delete(id); },
}));

import { splitWaves, stopWave, waveNotice, waveState, startWave, stageValue, resultText, durationText }
  from "./wave.ts";
import { saveStatus, saveTelemetry, saveVitals } from "./store.ts";

const id = (n: number) => `f00d${String(n).padStart(8, "0")}`;
const settle = async () => { for (let i = 0; i < 30; i++) await Promise.resolve(); }; // run through the chain of mock awaits
// the result report of one device, like announce() in ota.ts after vitals.ota arrives
function report(deviceId: string, version: string, status: string, message: string | null = null): void {
  waveNotice({ id: `c-${deviceId}-${version}`, device_id: deviceId, kind: "node1", from_version: "1.7.0", to_version: version,
    canary: false, status, message, requested_by: "1", created_at: new Date(), updated_at: new Date(), finished_at: new Date() } as UpdateRow);
}
// a healthy canary in the in-memory store: online, the vitals sent on connecting carry the new version (a small uptime = just started)
function canaryHealthy(deviceId: string, version: string): void {
  saveStatus(deviceId, "online");
  saveVitals(deviceId, { ts: new Date().toISOString().slice(0, 19) + "Z", rssi: -60, heap_free: 180000, uptime_s: 6,
    reset_reason: "SW", fw: version });
}
// one fleet: device 1 = canary, the rest ordinary, all still on 1.7.0
function fleet(count: number): void {
  db.devices = Array.from({ length: count }, (_, i) => ({ device_id: id(i + 1), canary: i === 0, revoked_at: null, fw: "1.7.0" }));
}

beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2026-11-02T03:00:00Z") });
  db.releases = new Map([["1.7.4", { version: "1.7.4", test: false, withdrawn_at: null }], ["1.7.2", { version: "1.7.2", test: true, withdrawn_at: null }]]);
  db.canaryFailed = 0;
  ota.sent = [];
  ota.answers = new Map();
  tg.messages = [];
  tg.muted = new Set();
});
afterEach(() => {
  stopWave("test"); // a wave still running at the end of a test is stopped (its timer is cleared too)
  vi.useRealTimers();
});

describe("pure logic", () => {
  it("splitWaves: growing, twice as many (20 devices -> 2, 4, 8, 6)", () => {
    const twenty = Array.from({ length: 20 }, (_, i) => id(i + 2));
    expect(splitWaves(twenty, 2).map((g) => g.length)).toEqual([2, 4, 8, 6]);
    expect(splitWaves(twenty, 5).map((g) => g.length)).toEqual([5, 10, 5]);
    expect(splitWaves([], 2)).toEqual([]);
    expect(splitWaves(twenty, 2).flat()).toEqual(twenty); // nothing lost or doubled
  });

  it("stageValue: one rollback/failed/expired = brake even if others are still running; skipped/rejected isn't a brake", () => {
    const h = (status: string) => ({ status, message: null }) as DeviceResult;
    expect(stageValue([h("succeeded"), h("running"), h("rollback")])).toBe("brake");
    expect(stageValue([h("expired")])).toBe("brake");
    expect(stageValue([h("succeeded"), h("running")])).toBe("waiting");
    expect(stageValue([h("succeeded"), h("already"), h("skipped"), h("rejected")])).toBe("passed");
  });

  it("resultText and durationText: the successful ones are counted, the ones with a problem are named with their reason", () => {
    const results: Record<string, DeviceResult> = { [id(2)]: { status: "succeeded", message: null },
      [id(3)]: { status: "succeeded", message: null }, [id(4)]: { status: "skipped", message: "device is offline" } };
    expect(resultText([id(2), id(3), id(4)], results)).toBe("2 succeeded, 1 skipped (f00d00000004: device is offline)");
    expect(durationText(45_000)).toBe("45 s");
    expect(durationText(192_000)).toBe("3 min 12 s");
  });
});

describe("automatic wave", () => {
  it("starting conditions: not uploaded 404; a test release, withdrawn, no canary, a canary that failed before, or still running 409", async () => {
    fleet(3);
    expect(await startWave("9.9.9", "1")).toMatchObject({ code: 404 });
    expect(await startWave("1.7.2", "1")).toMatchObject({ code: 409, message: "1.7.2 TEST release: never sent to many devices" });
    db.releases.set("1.7.3", { version: "1.7.3", test: false, withdrawn_at: new Date() });
    expect(await startWave("1.7.3", "1")).toMatchObject({ code: 409, message: "firmware 1.7.3 already withdrawn" });
    db.canaryFailed = 1;
    expect(await startWave("1.7.4", "1")).toMatchObject({ code: 409 });
    db.canaryFailed = 0;
    db.devices[0].canary = false;
    expect(await startWave("1.7.4", "1")).toMatchObject({ code: 409, message: expect.stringContaining("no canary device yet") });
    db.devices[0].canary = true;
    expect(await startWave("1.7.4", "1")).toMatchObject({ code: 202 });
    expect(await startWave("1.7.4", "1")).toMatchObject({ code: 409, message: expect.stringContaining("still running") });
    await settle();
    expect(ota.sent).toEqual([id(1)]); // only the canary is sent the command
  });

  it("smooth run: canary, healthy wait, then waves of 2 and 3 devices; ONE Telegram message per stage", async () => {
    fleet(6); // canary + 5 devices -> waves 2, 3
    const first = await startWave("1.7.4", "1", { waitMinutes: 1 });
    expect(first).toMatchObject({ code: 202 });
    await settle();
    expect(ota.sent).toEqual([id(1)]);
    expect(tg.muted.has(id(1))).toBe(true); // the canary's 🔄/✅ are muted while its update runs
    canaryHealthy(id(1), "1.7.4");
    report(id(1), "1.7.4", "succeeded");
    await settle();
    expect(tg.muted.has(id(1))).toBe(false);
    expect(tg.messages).toEqual(["🌊 Wave 1.7.4 · canary: 1 succeeded. Waiting 1 min: the canary must stay online with 1.7.4, then "
      + "wave 1 of 2 (2 device(s))."]);
    await vi.advanceTimersByTimeAsync(55_000);
    expect(ota.sent).toHaveLength(1); // still waiting
    await vi.advanceTimersByTimeAsync(10_000);
    await settle();
    expect(ota.sent).toEqual([id(1), id(2), id(3)]);
    for (const d of [id(2), id(3)]) report(d, "1.7.4", "succeeded");
    await settle();
    expect(ota.sent).toEqual([id(1), id(2), id(3), id(4), id(5), id(6)]);
    for (const d of [id(4), id(5), id(6)]) report(d, "1.7.4", "succeeded");
    await settle();
    expect(tg.messages).toHaveLength(3); // canary, wave 1, wave 2 (= the final summary); not 2 messages x 6 devices
    expect(tg.messages[1]).toBe("🌊 Wave 1.7.4 · wave 1 of 2: 2 succeeded. On to wave 2 of 2 (3 device(s)).");
    expect(tg.messages[2]).toMatch(/^✅ Wave 1\.7\.4 FINISHED · wave 2 of 2: 3 succeeded\. All stages: 6 succeeded, in 1 min/);
    expect(waveState()).toMatchObject({ state: "finished", stage_index: 2 });
  });

  it("emergency brake at the canary: rollback = stop, the other devices are NEVER sent the command", async () => {
    fleet(21);
    await startWave("1.7.4", "1", { waitMinutes: 1 });
    await settle();
    report(id(1), "1.7.4", "rollback", "not connected to the broker within 60 seconds");
    await settle();
    await vi.advanceTimersByTimeAsync(10 * 60_000);
    expect(ota.sent).toEqual([id(1)]);
    expect(tg.messages).toEqual(["🛑 Wave 1.7.4 STOPPED (emergency brake) · canary: 1 back to the old version (rollback) (f00d00000001: "
      + "not connected to the broker within 60 seconds). 20 other device(s) NOT sent: check first, then withdraw the release."]);
    expect(waveState()).toMatchObject({ state: "stopped", reason: "emergency brake at canary" });
  });

  it("emergency brake halfway: one device of wave 2 fails = wave 3 isn't sent; a skipped one doesn't pull the brake", async () => {
    fleet(8); // canary + 7 -> waves 2, 4, 1
    ota.answers.set(id(3), { status: "not-sent", message: "device is offline: update commands are only sent to online devices (not queued)" });
    await startWave("1.7.4", "1", { waitMinutes: 1 });
    await settle();
    canaryHealthy(id(1), "1.7.4");
    report(id(1), "1.7.4", "succeeded");
    await vi.advanceTimersByTimeAsync(61_000);
    await settle();
    report(id(2), "1.7.4", "succeeded"); // id(3) skipped: wave 1 still passes
    await settle();
    expect(tg.messages[1]).toBe("🌊 Wave 1.7.4 · wave 1 of 3: 1 succeeded, 1 skipped (f00d00000003: device is offline: "
      + "update commands are only sent to online devices (not queued)). On to wave 2 of 3 (4 device(s)).");
    report(id(4), "1.7.4", "succeeded");
    report(id(5), "1.7.4", "expired", "no word from the device");
    await vi.advanceTimersByTimeAsync(60_000);
    expect(ota.sent).not.toContain(id(8)); // wave 3 is never sent
    expect(tg.messages.at(-1)).toBe("🛑 Wave 1.7.4 STOPPED (emergency brake) · wave 2 of 3: 1 succeeded, 1 no word (expired) "
      + "(f00d00000005: no word from the device), 2 still running (f00d00000006; f00d00000007). 1 other device(s) NOT sent: check "
      + "first, then withdraw the release.");
    report(id(6), "1.7.4", "succeeded"); // a result that comes after the brake is still recorded
    await settle();
    expect(waveState()?.stages[2].devices.find((p) => p.device_id === id(6))?.status).toBe("succeeded");
    expect(tg.messages).toHaveLength(3); // no extra message after the brake
  });

  it("several final notices that arrive at the same time (the expiry watcher): ONE brake summary that names all of them", async () => {
    fleet(4); // canary + 3 -> waves 2, 1
    await startWave("1.7.4", "1", { waitMinutes: 1 });
    await settle();
    canaryHealthy(id(1), "1.7.4");
    report(id(1), "1.7.4", "succeeded");
    await vi.advanceTimersByTimeAsync(61_000);
    await settle();
    for (const d of [id(2), id(3)]) report(d, "1.7.4", "expired", "no word from the device"); // one round of the watcher
    await settle();
    expect(tg.messages.at(-1)).toBe("🛑 Wave 1.7.4 STOPPED (emergency brake) · wave 1 of 2: 2 no word (expired) "
      + "(f00d00000002: no word from the device; f00d00000003: no word from the device). 1 other device(s) NOT sent: "
      + "check first, then withdraw the release.");
    expect(tg.messages).toHaveLength(2);
  });

  it("healthy wait: a canary that disconnects or restarts = emergency brake, wave 1 isn't sent", async () => {
    fleet(4);
    await startWave("1.7.4", "1", { waitMinutes: 10 });
    await settle();
    canaryHealthy(id(1), "1.7.4");
    saveTelemetry(id(1), { ts: "2026-11-02T02:59:00Z", fw: "1.7.0", temperature: 29, humidity: 70, light: 900, soil: 40, motion: false,
      water_level: 80 }); // OLD telemetry (before the restart): not a reason for the brake, the vitals are newer
    report(id(1), "1.7.4", "succeeded");
    await vi.advanceTimersByTimeAsync(3 * 60_000);
    expect(tg.messages).toHaveLength(1); // still healthy
    saveVitals(id(1), { ts: new Date().toISOString().slice(0, 19) + "Z", rssi: -60, heap_free: 180000, uptime_s: 4,
      reset_reason: "PANIC", fw: "1.7.4" }); // restarted because of an error, the version is still 1.7.4
    await vi.advanceTimersByTimeAsync(5_000);
    expect(tg.messages.at(-1)).toBe("🛑 Wave 1.7.4 STOPPED (emergency brake): canary f00d00000001 restarted during the healthy wait "
      + "(PANIC). 3 other device(s) NOT sent: check first, then withdraw the release.");
    expect(ota.sent).toEqual([id(1)]);
  });

  it("a canary already running its version (a repeated wave) and the admin stopping it: the next stage isn't sent", async () => {
    fleet(6);
    db.devices[0].fw = "1.7.4"; // the canary is already 1.7.4: not sent again, still watched in the waiting period
    canaryHealthy(id(1), "1.7.4");
    await startWave("1.7.4", "1", { waitMinutes: 1 });
    await settle();
    expect(ota.sent).toEqual([]);
    expect(tg.messages[0]).toMatch(/^🌊 Wave 1\.7\.4 · canary: 1 already running this version\. Waiting 1 min/);
    await vi.advanceTimersByTimeAsync(61_000);
    await settle();
    expect(ota.sent).toEqual([id(2), id(3)]);
    expect(stopWave("1")).toMatchObject({ state: "stopped", reason: "stopped by the admin (account 1)" });
    report(id(2), "1.7.4", "succeeded");
    report(id(3), "1.7.4", "succeeded");
    await settle();
    expect(ota.sent).toEqual([id(2), id(3)]); // wave 2 isn't sent
    expect(tg.messages.at(-1)).toBe("⏹️ Wave 1.7.4 stopped: stopped by the admin (account 1) · wave 1 of 2: 2 still running "
      + "(f00d00000002; f00d00000003). 3 other device(s) NOT sent.");
    expect(stopWave("1")).toBeNull(); // nothing is running anymore
  });
});
