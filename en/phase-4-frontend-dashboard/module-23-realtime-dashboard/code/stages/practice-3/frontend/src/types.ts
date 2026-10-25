// types.ts - data shapes from the data contract (Syllabus Appendix A, DATA-CONTRACT.md 1.4) and from the backend v1.0 API responses.
// The field names are exactly the ones the backend sends, so data from the server "fits" right away.
// This file only holds types (labels for TypeScript): when the page runs in the browser, Vite has already removed all these lines.
// Value choices are written as unions of text ("a" | "b"), not enums: our template forbids enums (erasableSyntaxOnly).

// the device kind according to the backend
export type Kind = "node1" | "node2" | "unknown";

// the status from the msh/<device_id>/status topic; "unknown" = registered, but it has never sent a status
export type DeviceStatus = "online" | "offline" | "offline-mode" | "unknown";

// the key field in GET /devices (Module 21)
export type KeyStatus = "active" | "revoked" | "no-key" | "unregistered";

// one row of the GET /devices response
export type Device = {
  device_id: string; // 12 hexadecimal digits in lower case, for example "a4cf12e5b7c0"
  name: string | null; // null = the admin hasn't named it yet
  location: string | null;
  kind: Kind;
  status: DeviceStatus;
  last_seen: string | null; // UTC time, for example "2026-10-23T09:41:30Z"
  key: KeyStatus;
  registered_at: string | null;
  key_created_at: string | null;
  revoked_at: string | null;
  linked_via: string | null; // Node 2 only: the device_id of the Node 1 that forwards its data
};

// the state of Node 1's four actuators (contract 1.3)
export type State = {
  fan: boolean;
  lamp: boolean;
  pump: boolean;
  curtain: number; // the curtain servo's angle, 0-180 degrees
};

// Node 1's telemetry. "| null" = the sensor failed to read (rule 7)
export type TelemetryNode1 = {
  ts: string; // reading time in UTC, made by the device (rule 1)
  fw: string; // firmware version
  temperature: number | null; // °C
  humidity: number | null; // %
  light: number; // 0 (pitch dark) to 4095 (very bright)
  soil: number; // % soil moisture
  motion: boolean;
  water_level: number | null; // % of the water tank filled
  // the ? mark = the field may be missing entirely
  soil_rs485?: number | null; // RS-485 soil sensor (contract 1.2): these three fields always come together
  soil_temperature?: number | null; // °C
  ec?: number | null; // µS/cm
  state?: State; // contract 1.3
};

// Node 2's telemetry (contract 1.1), forwarded by Node 1 through ESP-NOW
export type TelemetryNode2 = {
  ts: string;
  fw: string;
  temperature: number | null;
  humidity: number | null;
  pressure: number | null; // hPa
  soil_temperature: number | null;
  soil: number | null;
  battery?: number | null; // volts; the field is missing if no battery meter is fitted
};

export type Telemetry = TelemetryNode1 | TelemetryNode2;

// the response of POST /auth/login, POST /auth/refresh, and GET /auth/me
export type User = {
  id: number;
  email: string;
  name: string;
  role: "admin" | "viewer";
};

// ---- Module 23: Socket.IO events, copied from backend/src/services/realtime.ts ----

// the server's answer to "follow" (a Socket.IO ack): success or not, and that device's last reading
export type FollowAnswer = {
  ok: boolean;
  message?: string;
  latest?: Telemetry | null; // null = the backend hasn't received a reading from that device since it started
};

// one row of the event log (Module 19's events in the database)
export type SavedEvent = {
  id: number;
  occurred_at: string; // server time, UTC
  device_id: string | null;
  kind: "rule" | "rule-changed" | "schedule" | "status" | "offline-report" | "command";
  source: string; // api, rule, schedule, telegram, device
  rule_id: number | null;
  message: string; // a sentence for humans
  data?: unknown;
};

// events from the server to the dashboard. The values come one after another, not as one object: telemetry carries TWO values (deviceId, content).
export type ToClient = {
  telemetry: (deviceId: string, content: Telemetry) => void;
  status: (deviceId: string, status: "online" | "offline" | "offline-mode") => void;
  event: (event: SavedEvent) => void;
};

// events from the dashboard to the server; "respond" is the Socket.IO ack (a function the server calls to answer)
export type FromClient = {
  follow: (deviceId: string, respond: (answer: FollowAnswer) => void) => void;
  unfollow: (deviceId: string) => void;
};
