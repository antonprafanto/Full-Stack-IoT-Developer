// contract.test.ts - tests of the data contract 1.6 schemas (Module 28): new and old vitals are both valid, the "come together"
// rules, the shape of the update cmd, intervals, and the longest message against the device's MQTT buffer (512 bytes, Node 1's setBufferSize).
// Run: npm test
import { describe, expect, it } from "vitest";
import { CmdUpdate, Intervals, Vitals } from "./contract.ts";

const OLD = { ts: "2026-10-31T01:00:00Z", rssi: -61, uptime_s: 86400, heap_free: 183200 }; // firmware 1.6.0 vitals

describe("contract 1.6 vitals", () => {
  it("the old form (firmware up to 1.6.0) stays valid; the 1.7.0 form with reset_reason, fw, and ota is valid too", () => {
    expect(Vitals.safeParse(OLD).success).toBe(true);
    expect(Vitals.safeParse({ ...OLD, reset_reason: "POWERON", fw: "1.7.0" }).success).toBe(true);
    expect(Vitals.safeParse({ ...OLD, reset_reason: "SW", fw: "1.7.1",
      ota: { id: "c-20261031-010000-1", result: "rollback", version: "1.7.2", message: "not connected to the broker within 60 seconds" } })
      .success).toBe(true);
  });

  it("reset_reason and fw always together; ota only together with fw; a reason outside the seven values is refused", () => {
    expect(Vitals.safeParse({ ...OLD, reset_reason: "SW" }).success).toBe(false);
    expect(Vitals.safeParse({ ...OLD, fw: "1.7.0" }).success).toBe(false);
    expect(Vitals.safeParse({ ...OLD, ota: { id: "c-1", result: "succeeded", version: "1.7.1" } }).success).toBe(false);
    expect(Vitals.safeParse({ ...OLD, reset_reason: "EXT", fw: "1.7.0" }).success).toBe(false);
  });

  it("the ota report: result only succeeded/rollback/failed, a message of at most 80 characters", () => {
    const base = { ...OLD, reset_reason: "SW", fw: "1.7.1" };
    expect(Vitals.safeParse({ ...base, ota: { id: "c-1", result: "back", version: "1.7.2" } }).success).toBe(false);
    expect(Vitals.safeParse({ ...base, ota: { id: "c-1", result: "failed", version: "1.7.2", message: "x".repeat(81) } }).success)
      .toBe(false);
  });
});

describe("contract 1.6 update cmd and config", () => {
  const VALID = { id: "c-20261031-010000-2", ts: "2026-10-31T01:00:00Z", action: "update", version: "1.7.1",
    url: "https://iot.yourname.my.id/fw/node-1/1.7.1.bin", sha256: "0".repeat(64), size: 1196032 };

  it("a valid form; the url must point to the file of the same version; a lowercase sha256; a size of at most one shelf", () => {
    expect(CmdUpdate.safeParse(VALID).success).toBe(true);
    expect(CmdUpdate.safeParse({ ...VALID, url: "https://iot.yourname.my.id/fw/node-1/1.7.0.bin" }).success).toBe(false);
    expect(CmdUpdate.safeParse({ ...VALID, url: "https://iot.yourname.my.id/firmware.bin" }).success).toBe(false);
    expect(CmdUpdate.safeParse({ ...VALID, sha256: "A".repeat(64) }).success).toBe(false);
    expect(CmdUpdate.safeParse({ ...VALID, size: 1966081 }).success).toBe(false);
  });

  it("intervals: only vitals_s 60-3600 seconds (telemetry stays 10 seconds: other keys are refused)", () => {
    expect(Intervals.safeParse({ vitals_s: 60 }).success).toBe(true);
    expect(Intervals.safeParse({ vitals_s: 59 }).success).toBe(false);
    expect(Intervals.safeParse({ vitals_s: 300, telemetry_s: 30 }).success).toBe(false);
  });

  it("the longest valid message fits the device's 512-byte MQTT buffer (MQTT header + topic + content)", () => {
    const topic = (kind: string) => `msh/a4cf12e5b7c0/${kind}`;
    const packet = (kind: string, content: object) => 5 + 2 + topic(kind).length + Buffer.byteLength(JSON.stringify(content));
    const update = { ...VALID, id: "c-".padEnd(39, "9"), version: "999.999.999",
      url: `https://${"a".repeat(200 - "https:///fw/node-1/999.999.999.bin".length)}/fw/node-1/999.999.999.bin` };
    expect(CmdUpdate.safeParse(update).success).toBe(true);
    expect(update.url.length).toBe(200);
    const vitals = { ts: "2026-10-31T01:00:00Z", rssi: -100, uptime_s: 2147483647, heap_free: 4294967295, offline_s: 2147483647,
      local_fan: 65535, reset_reason: "BROWNOUT", fw: "999.999.999",
      ota: { id: "c-".padEnd(39, "9"), result: "succeeded", version: "999.999.999", message: "x".repeat(80) } };
    expect(Vitals.safeParse(vitals).success).toBe(true);
    // the exact numbers are in the author's code report: the longest update and vitals packets
    expect(packet("cmd", update)).toBeLessThanOrEqual(512);
    expect(packet("vitals", vitals)).toBeLessThanOrEqual(512);
  });
});
