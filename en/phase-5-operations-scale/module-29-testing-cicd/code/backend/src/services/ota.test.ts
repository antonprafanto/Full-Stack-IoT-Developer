// ota.test.ts - tests of the Module 28 firmware update rules (D14) WITHOUT a database or a broker: the firmware/updates tables are
// replaced by in-memory mocks (vi.mock "../db/fleet.ts"), a mock MQTT publisher answers with acks like the tools/ simulator. The
// in-memory store (store.ts: status, waitForAck) stays the real one. Tested: the sending conditions (online, not Node 2, not revoked,
// one update running, a different version, a downgrade needs force, a test release only for one device), ack = ACCEPTED, not
// finished, the canary first then all, a vitals.ota report closes its row, and concluding when the report is lost. Run: npm test
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://fake:fake@127.0.0.1:1/fake";
  process.env.JWT_SECRET = "test-secret-long-enough-for-zod-0123456789";
  process.env.SERVER_URL = "https://iot.yourname.my.id";
});

const db = vi.hoisted(() => ({
  releases: new Map<string, { kind: "node1"; version: string; size: number; sha256: string; test: boolean; withdrawn_at: Date | null }>(),
  devices: new Map<string, { device_id: string; kind: string; registered_at: Date | null; revoked_at: Date | null; status: string;
    fw: string | null; canary: boolean }>(),
  updates: [] as { id: string; device_id: string; from_version: string | null; to_version: string; canary: boolean; status: string;
    message: string | null; created_at: Date; updated_at: Date }[],
}));
const running = (id: string) => db.updates.some((u) => u.device_id === id && ["sent", "accepted", "downloading"].includes(u.status));
const candidate = (id: string) => { const d = db.devices.get(id); return d && { ...d, running: running(id) }; };
vi.mock("../db/fleet.ts", () => ({
  getRelease: async (_k: string, v: string) => db.releases.get(v),
  oneCandidate: async (id: string) => candidate(id),
  updateCandidates: async () => [...db.devices.keys()].map(candidate),
  startUpdate: async (u: { id: string; deviceId: string; from: string | null; to: string; canary: boolean }) => {
    if (running(u.deviceId)) return false; // the unique index updates_one_running
    db.updates.push({ id: u.id, device_id: u.deviceId, from_version: u.from, to_version: u.to, canary: u.canary, status: "sent",
      message: null, created_at: new Date(), updated_at: new Date() });
    return true;
  },
  changeUpdateStatus: async (id: string, _d: string, status: string, message: string | null, from: string[]) => {
    const r = db.updates.find((u) => u.id === id && from.includes(u.status));
    if (r) Object.assign(r, { status, message: message ?? r.message, updated_at: new Date() });
    return r;
  },
  reportUpdateResult: async (id: string, _d: string, status: string, message: string | null) => {
    const r = db.updates.find((u) => u.id === id && ["sent", "accepted", "downloading", "expired"].includes(u.status));
    if (r) Object.assign(r, { status, message, updated_at: new Date() });
    return r;
  },
  concludeUpdate: async (id: string, fw: string, uptime: number) => db.updates
    .filter((u) => u.device_id === id && ["sent", "accepted", "downloading"].includes(u.status)
      && (Date.now() - u.created_at.getTime()) / 1000 > uptime)
    .map((u) => Object.assign(u, { status: u.to_version === fw ? "succeeded" : "failed", message: "concluded by the server: ..." })),
  canarySummary: async (_k: string, v: string) => ({
    succeeded: db.updates.filter((u) => u.canary && u.to_version === v && u.status === "succeeded").length,
    failed: db.updates.filter((u) => u.canary && u.to_version === v && ["rollback", "failed"].includes(u.status)).length,
  }),
  knownUpdate: async (id: string, d: string) => db.updates.some((u) => u.id === id && u.device_id === d),
  markDownloading: async () => undefined,
  expireUpdates: async () => [],
  recordFwDb: async () => {},
  recordResetReasonDb: async () => {},
}));

// a mock device: answers an update with an ack (ok:true, or ok:false with a reason) exactly like the tools/ simulator
const device = vi.hoisted(() => ({ answer: "ok" as "ok" | "silent" | string, published: [] as Record<string, unknown>[] }));
vi.mock("./mqtt.ts", () => ({
  brokerConnected: () => true,
  makeCommandId: (() => { let n = 0; return () => `c-20261031-010000-${++n}`; })(),
  sendUpdate: (deviceId: string, id: string, content: Record<string, unknown>) => {
    device.published.push({ deviceId, id, ...content });
    if (device.answer === "silent") return;
    setTimeout(() => void import("./store.ts").then((s) => s.deliverAck({ id, ts: null, ok: device.answer === "ok",
      ...(device.answer === "ok" ? {} : { message: device.answer }), state: { fan: false, lamp: false, pump: false, curtain: 90 } })), 2);
  },
}));
const events = vi.hoisted(() => [] as { kind: string; message: string }[]);
vi.mock("./events.ts", () => ({ recordEvent: (e: { kind: string; message: string }) => { events.push(e); } }));
vi.mock("./realtime.ts", () => ({ broadcastOta: () => {} }));

import { blockedReason, recordUpdateVitals, requestUpdate, updateFleet } from "./ota.ts";
import { saveStatus } from "./store.ts";
// Note: ota.ts remembers each device's last version in memory (fresher than the database), and that memory
// lasts between the tests of this file. That's why every test uses its own device_id.

const RELEASE = (version: string, test = false) => ({ kind: "node1" as const, version, size: 1196032, sha256: "0".repeat(64), test,
  withdrawn_at: null });
function node1(id: string, fw: string | null, canary = false, status = "online") {
  db.devices.set(id, { device_id: id, kind: "node1", registered_at: new Date(), revoked_at: null, status, fw, canary });
  saveStatus(id, status as "online");
}
const wait = () => new Promise((r) => setTimeout(r, 20));

beforeEach(() => {
  db.releases.clear();
  db.devices.clear();
  db.updates.length = 0;
  events.length = 0;
  device.answer = "ok";
  device.published.length = 0;
  for (const v of ["1.7.0", "1.7.1"]) db.releases.set(v, RELEASE(v));
  db.releases.set("1.7.2", RELEASE("1.7.2", true));
});

describe("blockedReason: the sending conditions (D14), a pure function", () => {
  const READY = { kind: "node1", registered: true, revoked: false, status: "online", fw: "1.7.0", running: false };
  const r = (version: string, test = false) => ({ version, test, withdrawn_at: null });
  it("a device online, a different version: allowed (null)", () => {
    expect(blockedReason(READY, r("1.7.1"))).toBeNull();
  });
  it("not online (offline-mode too), Node 2, revoked, already running, the same version: 409 with its reason", () => {
    expect(blockedReason({ ...READY, status: "offline" }, r("1.7.1"))?.message).toContain("not queued");
    expect(blockedReason({ ...READY, status: "offline-mode" }, r("1.7.1"))?.code).toBe(409);
    expect(blockedReason({ ...READY, kind: "node2" }, r("1.7.1"))?.message).toContain("update it by cable");
    expect(blockedReason({ ...READY, revoked: true }, r("1.7.1"))?.message).toContain("deactivated");
    expect(blockedReason({ ...READY, running: true }, r("1.7.1"))?.message).toContain("another update");
    expect(blockedReason(READY, r("1.7.0"))?.message).toBe("device is already running 1.7.0");
  });
  it("a downgrade needs force; a test release is refused for many devices; a withdrawn and a not-uploaded release", () => {
    expect(blockedReason({ ...READY, fw: "1.7.1" }, r("1.7.0"))?.message).toContain("downgrade");
    expect(blockedReason({ ...READY, fw: "1.7.1" }, r("1.7.0"), { force: true })).toBeNull();
    expect(blockedReason(READY, r("1.7.2", true))).toBeNull(); // one device: allowed
    expect(blockedReason(READY, r("1.7.2", true), { many: true })?.message).toContain("TEST release");
    expect(blockedReason(READY, { version: "1.7.1", test: false, withdrawn_at: new Date() })?.message).toContain("withdrawn");
    expect(blockedReason(READY, undefined)?.code).toBe(404);
    expect(blockedReason({ ...READY, registered: false }, r("1.7.1"))?.code).toBe(404);
  });
});

describe("requestUpdate: one device", () => {
  it("ack ok:true = ACCEPTED (not finished); url = SERVER_URL/fw/node-1/<version>.bin, sha256 + size from the release", async () => {
    node1("f00d00000001", "1.7.0");
    const result = await requestUpdate("f00d00000001", "1.7.1", "1");
    expect(result).toMatchObject({ status: "accepted", from: "1.7.0", to: "1.7.1" });
    expect(device.published[0]).toMatchObject({ url: "https://iot.yourname.my.id/fw/node-1/1.7.1.bin", sha256: "0".repeat(64),
      size: 1196032, version: "1.7.1" });
    expect(db.updates[0]).toMatchObject({ status: "accepted", from_version: "1.7.0", to_version: "1.7.1" });
  });

  it("the device refuses (the trial period): the status rejected with its reason", async () => {
    node1("f00d00000001", "1.7.0");
    device.answer = "still in the 60-second trial period";
    expect(await requestUpdate("f00d00000001", "1.7.1", "1")).toMatchObject({ status: "rejected", message: "still in the 60-second trial period" });
    expect(db.updates[0]).toMatchObject({ status: "rejected", message: "still in the 60-second trial period" });
  });

  it("a second command while the first is still running: 409 (one update per device)", async () => {
    node1("f00d00000001", "1.7.0");
    device.answer = "silent"; // no ack: the row stays "sent"
    expect((await requestUpdate("f00d00000001", "1.7.1", "1")).status).toBe("no-ack");
    expect(await requestUpdate("f00d00000001", "1.7.1", "1")).toMatchObject({ status: "not-sent", code: 409 });
  }, 10_000);

  it("a device offline: not sent, not queued", async () => {
    node1("f00d00000001", "1.7.0", false, "offline");
    expect(await requestUpdate("f00d00000001", "1.7.1", "1")).toMatchObject({ status: "not-sent", code: 409 });
    expect(device.published).toHaveLength(0);
  });
});

describe("updateFleet: the canary first, then all", () => {
  it("all is REFUSED before a canary succeeded; after the canary succeeded, every device that qualifies is sent at once", async () => {
    node1("f00d00000001", "1.7.0", true);
    node1("f00d00000002", "1.7.0");
    node1("f00d00000003", "1.7.0", false, "offline");
    expect(await updateFleet("1.7.1", "all", "1")).toMatchObject({ code: 409 });
    const canary = await updateFleet("1.7.1", "canary", "1");
    expect(canary).toMatchObject({ sent: [{ device_id: "f00d00000001", status: "accepted" }], skipped: [] });
    // the canary device reports success in its next vitals
    recordUpdateVitals("f00d00000001", { ts: "2026-10-31T01:01:00Z", rssi: -60, uptime_s: 8, heap_free: 180000,
      reset_reason: "SW", fw: "1.7.1", ota: { id: db.updates[0].id, result: "succeeded", version: "1.7.1" } });
    await wait();
    db.devices.get("f00d00000001")!.fw = "1.7.1";
    const all = await updateFleet("1.7.1", "all", "1");
    expect(all).toMatchObject({ sent: [{ device_id: "f00d00000002", status: "accepted" }] });
    expect("skipped" in all && all.skipped.map((s) => s.device_id)).toEqual(["f00d00000001", "f00d00000003"]);
  });

  it("a canary that ROLLED BACK locks the all button; a test release is never for many devices", async () => {
    node1("f00d00000011", "1.7.0", true);
    await updateFleet("1.7.1", "canary", "1");
    recordUpdateVitals("f00d00000011", { ts: "2026-10-31T01:02:10Z", rssi: -60, uptime_s: 6, heap_free: 180000,
      reset_reason: "SW", fw: "1.7.0", ota: { id: db.updates[0].id, result: "rollback", version: "1.7.1" } });
    await wait();
    expect(db.updates[0].status).toBe("rollback");
    expect(await updateFleet("1.7.1", "all", "1")).toMatchObject({ code: 409, message: expect.stringContaining("rolled back") });
    expect(await updateFleet("1.7.2", "canary", "1")).toMatchObject({ code: 409, message: expect.stringContaining("TEST release") });
  });
});

describe("results from the device's vitals", () => {
  it("a lost report: vitals after a restart with the new version = succeeded (concluded), with the old version = failed", async () => {
    node1("f00d00000021", "1.7.0");
    node1("f00d00000022", "1.7.0");
    await requestUpdate("f00d00000021", "1.7.1", "1");
    await requestUpdate("f00d00000022", "1.7.1", "1");
    for (const u of db.updates) u.created_at = new Date(Date.now() - 90_000); // the command was sent 90 seconds ago
    recordUpdateVitals("f00d00000021", { ts: "2026-10-31T01:02:00Z", rssi: -60, uptime_s: 20, heap_free: 1, reset_reason: "SW", fw: "1.7.1" });
    recordUpdateVitals("f00d00000022", { ts: "2026-10-31T01:02:00Z", rssi: -60, uptime_s: 20, heap_free: 1, reset_reason: "SW", fw: "1.7.0" });
    await wait();
    expect(db.updates.map((u) => u.status)).toEqual(["succeeded", "failed"]);
    expect(events.at(-1)?.message).toContain("concluded by the server");
  });

  it("an ota report with a FOREIGN id (not sent by this server): a warning + an ota event ONCE; a known repeated report: quiet", async () => {
    node1("f00d00000041", "1.7.0");
    await requestUpdate("f00d00000041", "1.7.1", "1");
    const v = (id: string) => ({ ts: "2026-10-31T01:02:00Z", rssi: -60, uptime_s: 20, heap_free: 1, reset_reason: "SW" as const,
      fw: "1.7.1", ota: { id, result: "succeeded" as const, version: "1.7.1" } });
    const validId = db.updates[0].id;
    for (let i = 0; i < 3; i++) recordUpdateVitals("f00d00000041", v(validId)); // a valid report repeated 3 times
    await wait();
    expect(events.filter((e) => e.message.includes("that this server didn't send"))).toHaveLength(0);
    for (let i = 0; i < 3; i++) recordUpdateVitals("f00d00000041", v("c-fake-0001")); // an update from another account
    await wait();
    const foreign = events.filter((e) => e.message.includes("that this server didn't send"));
    expect(foreign).toHaveLength(1);
    expect(foreign[0]).toMatchObject({ kind: "ota" });
    expect(foreign[0].message).toContain("c-fake-0001");
  });

  it("vitals without a restart (an uptime longer than the command's age) conclude nothing", async () => {
    node1("f00d00000031", "1.7.0");
    await requestUpdate("f00d00000031", "1.7.1", "1");
    recordUpdateVitals("f00d00000031", { ts: "2026-10-31T01:02:00Z", rssi: -60, uptime_s: 5000, heap_free: 1, reset_reason: "POWERON", fw: "1.7.0" });
    await wait();
    expect(db.updates[0].status).toBe("accepted");
  });
});
