// rules.test.ts - tests of the automation rule sentences (Module 29): a rule's JSON stored on the server becomes the sentence
// the home owner reads on the Rules screen. Pure functions: no browser, no backend. Run from the frontend folder: npm test
import { describe, expect, it } from "vitest";
import { describeRule } from "./rules";
import type { Rule } from "./schemas/rule-basics";

// device_id -> a name humans know (in the dashboard, this name comes from the device list)
function name(deviceId: string): string {
  return deviceId === "f00d00000001" ? "Living room" : "Garden";
}

describe("rules as sentences (rules.ts)", () => {
  it("describeRule: the Module 19 fan rule and the morning watering schedule become sentences", () => {
    const fan: Rule = {
      name: "automatic fan",
      active: true,
      condition: { kind: "threshold", device_id: "f00d00000001", quantity: "temperature", on_above: 30, off_below: 28.5, for_seconds: 60 },
      action: { kind: "switch", device_id: "f00d00000001", target: "fan", notify: false },
    };
    expect(describeRule(fan, name)).toBe(
      "If the temperature on Living room is above 30 °C for 60 seconds, turn on the fan. " +
        "The fan turns off again after the temperature falls below 28.5 °C.",
    );

    const morningWatering: Rule = {
      name: "morning watering",
      active: true,
      condition: { kind: "schedule", cron: "0 6 * * *" }, // minute 0, hour 6, every day
      action: { kind: "command", device_id: "f00d000000b2", command: { target: "pump", value: 5 }, notify: true },
    };
    expect(describeRule(morningWatering, name)).toBe("Every day at 06:00 WIB, water for 5 seconds on Garden. Notify via Telegram.");
  });
});
