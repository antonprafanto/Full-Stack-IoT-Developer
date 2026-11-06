// registry.test.ts - unit tests for the device guest book (Module 21): who is registered and who has been revoked, and the
// second-layer "IGNORED" log that doesn't flood. No database and no broker. Run: npm test
import { describe, expect, it } from "vitest";
import { LOG_GAP_MS, recordRevoked, recordRegistered, loadRegistry, devicePermission, ignoredLine, permissionOf } from "./registry.ts";

describe("device guest book", () => {
  it("pure decision: not loaded, unregistered, registered, revoked", () => {
    expect(permissionOf(false, { revoked: false })).toBe("not-loaded"); // database not read yet: don't trust anyone
    expect(permissionOf(true, undefined)).toBe("unregistered");
    expect(permissionOf(true, { revoked: false })).toBe("registered");
    expect(permissionOf(true, { revoked: true })).toBe("revoked");
  });
  it("registry from the database: an old row with no registration date still counts as unregistered", () => {
    const now = new Date();
    const count = loadRegistry([
      { device_id: "a4cf12e5b7c0", registered_at: now, revoked_at: null },
      { device_id: "f00d00000001", registered_at: null, revoked_at: null }, // auto-created in Modules 17-20
      { device_id: "c0ba00000001", registered_at: now, revoked_at: now },
    ]);
    expect(count).toBe(2);
    expect(devicePermission("a4cf12e5b7c0")).toBe("registered");
    expect(devicePermission("f00d00000001")).toBe("unregistered");
    expect(devicePermission("c0ba00000001")).toBe("revoked");
    recordRevoked("a4cf12e5b7c0"); // POST /devices/:id/revoke
    expect(devicePermission("a4cf12e5b7c0")).toBe("revoked");
    recordRegistered("a4cf12e5b7c0"); // POST /devices/:id/key brings it back to life
    expect(devicePermission("a4cf12e5b7c0")).toBe("registered");
  });
});

describe("IGNORED log (second layer)", () => {
  it("the first message is logged, the next ones within a minute aren't, then it logs again with the missed count", () => {
    const t0 = Date.parse("2026-10-23T08:00:00+08:00");
    const topic = "msh/c0ba00000002/telemetry";
    expect(ignoredLine(topic, "c0ba00000002", "revoked", t0))
      .toBe("IGNORED msh/c0ba00000002/telemetry: c0ba00000002 its key has been revoked");
    expect(ignoredLine(topic, "c0ba00000002", "revoked", t0 + 10_000)).toBeNull();
    expect(ignoredLine(topic, "c0ba00000002", "revoked", t0 + 20_000)).toBeNull();
    expect(ignoredLine(topic, "c0ba00000002", "revoked", t0 + LOG_GAP_MS))
      .toBe("IGNORED msh/c0ba00000002/telemetry: c0ba00000002 its key has been revoked (+2 more messages since the last log)");
  });
  it("the gap is counted per device", () => {
    const t0 = Date.parse("2026-10-23T09:00:00+08:00");
    expect(ignoredLine("msh/f00d00000009/status", "f00d00000009", "unregistered", t0)).toContain("not registered");
    expect(ignoredLine("msh/f00d00000010/status", "f00d00000010", "unregistered", t0)).not.toBeNull();
  });
});
