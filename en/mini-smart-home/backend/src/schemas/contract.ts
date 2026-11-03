// contract.ts - Appendix A (data contract 1.6, Module 28) as Zod schemas: a contract that runs.
// Every message from a device is checked against these schemas before it is stored ("never trust the device").
// Module 28 (contract 1.6): vitals may carry reset_reason, fw, and the ota update report; the "update" cmd is spelled out (sha256,
// size); config may carry intervals.vitals_s. The old form (firmware up to 1.6.0) stays valid.
// This file is copied EXACTLY to frontend/src/schemas/contract.ts (npm run check-schema): it may only import zod.
import { z } from "zod";

z.config(z.locales.en()); // Zod error messages in English

export const DeviceId = z.string().regex(/^[0-9a-f]{12}$/, "device_id must be 12 lowercase hexadecimal digits");

const Time = z.iso.datetime(); // UTC time, for example 2026-10-19T02:10:05Z
const Version = z.string().regex(/^\d+\.\d+\.\d+$/, "version must look like x.y.z");
const decimal = (min: number, max: number) => z.number().min(min).max(max).nullable();
const integer = (min: number, max: number) => z.number().int().min(min).max(max).nullable();

// the state of the four actuators, the same in ack (contract 1.0) and in Node 1 telemetry (contract 1.3)
export const State = z.strictObject({
  fan: z.boolean(),
  lamp: z.boolean(),
  pump: z.boolean(),
  curtain: z.number().int().min(0).max(180),
});

// Node 1 telemetry (contract 1.0) plus three RS-485 sensor fields that may be missing (contract 1.2) and the actuator
// state (contract 1.3; older firmware doesn't write it yet, so it may be missing)
export const TelemetryNode1 = z.strictObject({
  ts: Time,
  fw: Version,
  temperature: decimal(-40, 80),
  humidity: integer(0, 100),
  light: z.number().int().min(0).max(4095),
  soil: z.number().int().min(0).max(100),
  motion: z.boolean(),
  water_level: integer(0, 100),
  soil_rs485: decimal(0, 100).optional(),
  soil_temperature: decimal(-55, 125).optional(),
  ec: integer(0, 20000).optional(),
  state: State.optional(),
});

// Node 2 telemetry (contract 1.1), published by Node 1 on behalf of Node 2; recognized by the pressure field
export const TelemetryNode2 = z.strictObject({
  ts: Time,
  fw: Version,
  temperature: decimal(-40, 80),
  humidity: integer(0, 100),
  pressure: decimal(300, 1100),
  soil_temperature: decimal(-55, 125),
  soil: integer(0, 100),
  battery: decimal(2.5, 4.5).optional(),
});

// offline-mode (used since Module 28): the device stops ON PURPOSE, for example before installing new firmware. Published by
// the device itself before it disconnects cleanly, so the broker doesn't publish the "offline" will.
export const Status = z.enum(["online", "offline", "offline-mode"]);

// Module 28: why the device restarted the last time (contract section 6). Only these seven values; any other ESP-IDF reason
// is written UNKNOWN.
export const ResetReason = z.enum(["POWERON", "BROWNOUT", "SW", "PANIC", "WDT", "DEEPSLEEP", "UNKNOWN"]);

// Module 28: the result report of one firmware update inside vitals (contract 1.6). id = the id of its update command; the device
// keeps it in NVS before restarting and repeats it in at most 3 vitals (vitals QoS 0 can get lost).
export const OtaReport = z.strictObject({
  id: z.string().min(1).max(39),
  result: z.enum(["succeeded", "rollback", "failed"]),
  version: Version, // the version it TRIED to install (to_version), not the version that is running
  message: z.string().max(80).optional(),
});

// vitals (contract 1.0) plus the offline-mode report (contract 1.3): offline_s and local_fan always come together.
// Module 28 (contract 1.6): reset_reason and fw (always together, required since firmware 1.7.0), and the ota update report
// (only together with fw). Vitals from older firmware without all three stay valid.
export const Vitals = z
  .strictObject({
    ts: Time,
    rssi: z.number().int().max(0),
    uptime_s: z.number().int().min(0),
    heap_free: z.number().int().min(0),
    offline_s: z.number().int().min(0).optional(),
    local_fan: z.number().int().min(0).optional(),
    reset_reason: ResetReason.optional(),
    fw: Version.optional(),
    ota: OtaReport.optional(),
  })
  .refine((v) => (v.offline_s === undefined) === (v.local_fan === undefined),
    "the offline-mode report must be complete: offline_s and local_fan always come together")
  .refine((v) => (v.reset_reason === undefined) === (v.fw === undefined),
    "reset_reason and fw always come together (firmware 1.7.0 and newer)")
  .refine((v) => v.ota === undefined || v.fw !== undefined, "the ota report only together with fw");

export const Ack = z
  .strictObject({
    id: z.string().min(1).max(39),
    ts: Time.nullable(),
    ok: z.boolean(),
    message: z.string().optional(),
    state: State,
  })
  .refine((a) => a.ok || a.message !== undefined, "message is required when ok is false"); // contract section 8

// the body of POST /devices/:id/command: one actuator and its value (contract section 7)
export const SetCommand = z.discriminatedUnion("target", [
  z.strictObject({ target: z.literal("lamp"), value: z.boolean() }),
  z.strictObject({ target: z.literal("fan"), value: z.boolean() }),
  z.strictObject({ target: z.literal("pump"), value: z.number().int().min(1).max(10) }),
  z.strictObject({ target: z.literal("curtain"), value: z.number().int().min(0).max(180) }),
]);

// Module 28: the content of the "update" cmd the server publishes (contract 1.6 section 7). NEVER retained. url = the final
// address of the firmware file (no redirect: HTTPUpdate doesn't follow 3xx), sha256 = the fingerprint of the file's content (64
// lowercase hexadecimal digits), size = the file's length in bytes, at most one Minimal SPIFFS program shelf.
export const CmdUpdate = z.strictObject({
  id: z.string().min(1).max(39),
  ts: Time,
  action: z.literal("update"),
  version: Version,
  url: z.string().max(200).regex(/^https?:\/\/[^\s/]+\/fw\/node-1\/\d+\.\d+\.\d+\.bin$/,
    "url must be http(s)://<address>/fw/node-1/<version>.bin"),
  sha256: z.string().regex(/^[0-9a-f]{64}$/, "sha256 must be 64 lowercase hexadecimal digits"),
  size: z.number().int().min(1).max(1966080),
}).refine((c) => c.url.endsWith(`/${c.version}.bin`), "url must point to the file of the same version as version");

// Module 28: the sending intervals that can be set from afar through the "config" cmd (contract 1.6). Only vitals: telemetry stays every
// 10 seconds (contract rule 3).
export const Intervals = z.strictObject({
  vitals_s: z.number().int().min(60).max(3600),
});

// the thresholds of the local safety rules, sent with the "config" cmd (contract 1.3 section 7): at least one key
export const Thresholds = z
  .strictObject({
    temp_fan_on: z.number().min(15).max(45).optional(),
    soil_watering: z.number().int().min(0).max(100).optional(),
  })
  .refine((a) => a.temp_fan_on !== undefined || a.soil_watering !== undefined, "thresholds must contain temp_fan_on or soil_watering");

export type State = z.infer<typeof State>;
export type Thresholds = z.infer<typeof Thresholds>;
export type TelemetryNode1 = z.infer<typeof TelemetryNode1>;
export type TelemetryNode2 = z.infer<typeof TelemetryNode2>;
export type Status = z.infer<typeof Status>;
export type Vitals = z.infer<typeof Vitals>;
export type ResetReason = z.infer<typeof ResetReason>;
export type OtaReport = z.infer<typeof OtaReport>;
export type CmdUpdate = z.infer<typeof CmdUpdate>;
export type Intervals = z.infer<typeof Intervals>;
export type Ack = z.infer<typeof Ack>;
export type SetCommand = z.infer<typeof SetCommand>;
