// contract.ts - Appendix A (data contract 1.2) as Zod schemas: a contract that runs.
// Every message from a device is checked against these schemas before it is stored ("never trust the device").
import { z } from "zod";

z.config(z.locales.en()); // Zod error messages in English

export const DeviceId = z.string().regex(/^[0-9a-f]{12}$/, "device_id must be 12 lowercase hexadecimal digits");

const Time = z.iso.datetime(); // UTC time, for example 2026-10-19T02:10:05Z
const Version = z.string().regex(/^\d+\.\d+\.\d+$/, "version must look like x.y.z");
const decimal = (min: number, max: number) => z.number().min(min).max(max).nullable();
const integer = (min: number, max: number) => z.number().int().min(min).max(max).nullable();

// Node 1 telemetry (contract 1.0) plus three RS-485 sensor fields that may be missing (contract 1.2)
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

export const Status = z.enum(["online", "offline", "offline-mode"]);

export const Vitals = z.strictObject({
  ts: Time,
  rssi: z.number().int().max(0),
  uptime_s: z.number().int().min(0),
  heap_free: z.number().int().min(0),
});

export const State = z.strictObject({
  fan: z.boolean(),
  lamp: z.boolean(),
  pump: z.boolean(),
  curtain: z.number().int().min(0).max(180),
});

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

export type TelemetryNode1 = z.infer<typeof TelemetryNode1>;
export type TelemetryNode2 = z.infer<typeof TelemetryNode2>;
export type Status = z.infer<typeof Status>;
export type Vitals = z.infer<typeof Vitals>;
export type Ack = z.infer<typeof Ack>;
export type SetCommand = z.infer<typeof SetCommand>;
