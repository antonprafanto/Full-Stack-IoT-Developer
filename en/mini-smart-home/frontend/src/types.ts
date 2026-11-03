// types.ts - data shapes from the data contract (Syllabus Appendix A, DATA-CONTRACT.md 1.6) and from the backend API responses.
// The field names are exactly the ones the backend sends, so data from the server "fits" right away.
// Module 25: backend 1.2 adds the map point (lat, lng) to the GET /devices answer.
// Module 28: backend 1.5 adds the fleet page (GET /fleet), firmware releases, over-the-air updates (OTA), and claim codes.
// This file only holds types (labels for TypeScript): when the page runs in the browser, Vite has already removed all these lines.
// Value choices are written as unions of text ("a" | "b"), not enums: our template forbids enums (erasableSyntaxOnly).

// the device kind according to the backend
export type Kind = "node1" | "node2" | "unknown";

// the status from the msh/<device_id>/status topic; "unknown" = registered, but it has never sent a status.
// Module 28: "offline-mode" = the device stops ON PURPOSE (for example restarting to install new firmware), NOT the offline
// mode of Module 19 (the local safety while the broker can't be reached). On screen it is written "stopped on purpose".
export type DeviceStatus = "online" | "offline" | "offline-mode" | "unknown";

// the key field in GET /devices (Module 21)
export type KeyStatus = "active" | "revoked" | "no-key" | "unregistered";

// one row of the GET /devices response
export type Device = {
  device_id: string; // 12 hexadecimal digits in lower case, for example "a4cf12e5b7c0"
  name: string | null; // null = the admin hasn't named it yet
  location: string | null;
  // Module 25: the device's point on the map, in decimal degrees (latitude -90 to 90, longitude -180 to 180).
  // null = the admin hasn't set the point yet. The backend always fills both as a pair (both numbers or both null).
  lat: number | null; // latitude, for example -6.1754
  lng: number | null; // longitude, for example 106.8272
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
  // Module 28: ota (firmware updates), provisioning (a new device through a claim code), revoked (a device deactivated)
  kind: "rule" | "rule-changed" | "schedule" | "status" | "offline-report" | "command" | "ota" | "provisioning" | "revoked";
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
  ota: (notice: OtaNotice) => void; // Module 28: the progress of one firmware update, to ALL dashboards
};

// events from the dashboard to the server; "respond" is the Socket.IO ack (a function the server calls to answer)
export type FromClient = {
  follow: (deviceId: string, respond: (answer: FollowAnswer) => void) => void;
  unfollow: (deviceId: string) => void;
};

// ---- Module 23: the live chart and the history ----

// one raw reading from GET /devices/:id/readings (without bucket). All thirteen fields are always there;
// a field the device doesn't have (for example pressure on Node 1) holds null.
export type Reading = {
  ts: string;
  fw: string;
  temperature: number | null;
  humidity: number | null;
  light: number | null;
  soil: number | null;
  motion: boolean | null;
  water_level: number | null;
  pressure: number | null;
  soil_temperature: number | null;
  battery: number | null;
  soil_rs485: number | null;
  ec: number | null;
};

// the GET /devices/:id/readings answer without bucket: readings oldest first, at most 1,000
export type ReadingsAnswer = {
  device_id: string;
  from: string;
  to: string;
  count: number;
  truncated: boolean; // true = more than 1,000 readings; only the OLDEST 1,000 are sent
  readings: Reading[];
};

// one point of the live chart: t = the reading time in milliseconds (from the device's ts); null = no value
export type Point = {
  t: number;
  temperature: number | null;
  humidity: number | null;
  light: number | null;
};

// one summary bucket (bucket=15m or 1h): the average of every reading in that bucket.
// The backend only summarizes these four quantities; pressure, battery, and the water tank aren't in the summary history.
export type SummaryPoint = {
  time: string; // start of the bucket, UTC
  avg_temp: number | null;
  min_temp: number | null;
  max_temp: number | null;
  avg_humidity: number | null;
  avg_soil: number | null;
  avg_light: number | null;
  reading_count: number;
};

// the GET /devices/:id/readings?bucket=… answer  (a bucket without readings isn't sent at all)
export type SummaryAnswer = {
  device_id: string;
  from: string;
  to: string;
  bucket: "15m" | "1h" | "1d";
  count: number;
  summary: SummaryPoint[];
};

// the three range options on the History screen
export type HistoryRange = "1hour" | "24hours" | "7days";

// history already made uniform by api.ts: even raw readings (1 hour) are turned into the SummaryPoint shape
export type HistoryData = {
  from: string;
  to: string;
  points: SummaryPoint[]; // oldest first
};

// ---- Module 28: the fleet, firmware releases, over-the-air updates (OTA), and claim codes (backend 1.5) ----

// the journey of one update: sent -> accepted (the device's ack) -> downloading -> succeeded, rollback, or failed.
// rejected = the device refused the command; expired = no word from the device for OTA_TIMEOUT_MINUTES (default 10 minutes).
export type UpdateStatus = "sent" | "accepted" | "downloading" | "rejected" | "succeeded" | "rollback" | "failed" | "expired";

// why the device started the last time (contract 1.6 section 6). null = older firmware (before 1.7.0) doesn't report it yet.
export type ResetReason = "POWERON" | "BROWNOUT" | "SW" | "PANIC" | "WDT" | "DEEPSLEEP" | "UNKNOWN";

// the last update of one device (also one row of GET /devices/:id/updates). Times = UTC.
export type Update = {
  id: string; // the update command's id
  status: UpdateStatus;
  from: string | null; // the version before the update (null = not known yet)
  to: string; // the version it tried to install
  message: string | null; // the reason from the device or the server, for example "sha256 doesn't match"
  created_at: string;
  updated_at: string;
  finished_at: string | null; // null = still running
};

// the Socket.IO "ota" event: ONE update status change, sent by the server to every dashboard
export type OtaNotice = {
  device_id: string;
  id: string;
  status: UpdateStatus;
  from: string | null;
  to: string;
  message: string | null;
  time: string; // the server time (UTC), the same as the updated_at column in the database
};

// the device's last vitals (health). Node 2 doesn't send vitals, so its field is null.
export type Health = {
  ts: string; // when the device made those vitals (UTC)
  rssi: number; // the Wi-Fi signal strength in dBm: the closer to 0, the stronger
  heap_free: number; // free RAM, bytes
  uptime_s: number; // seconds since the last start
  reset_reason: ResetReason | null;
};

// one row of GET /fleet
export type FleetRow = {
  device_id: string;
  name: string | null;
  location: string | null;
  kind: Kind;
  status: DeviceStatus; // a deactivated device is always "offline"
  key: "active" | "revoked" | "no-key"; // revoked = deactivated; no-key = a Node 2 via Node 1
  linked_via: string | null;
  last_seen: string | null; // the server time when the last telemetry or vitals arrived
  canary: boolean; // a test device that gets new releases first
  vitals_interval_s: number | null; // null = not set yet (the firmware uses its default of 300 seconds)
  fw: string | null; // the firmware version reported last (Node 2: the version from its packet)
  fw_seen_at: string | null;
  needs_update: boolean; // a Node 1 with a version older than the latest release
  health: Health | null;
  update: Update | null; // the last update; null = never
  can_update: boolean; // may be updated to the latest release NOW
  blocked_reason: string | null; // the server's sentence if it can't
};

// the GET /fleet answer
export type FleetData = {
  latest_release: { node1: string | null }; // the highest release that isn't a test and isn't withdrawn
  settings: {
    ota_ready: boolean; // false = SERVER_URL in .env isn't set
    broker_accounts: string; // AUTO_BROKER_ACCOUNTS: off, center, or gateway:<name>
  };
  devices: FleetRow[];
};

// one firmware release in GET /firmware (and the upload answer)
export type Release = {
  kind: "node1";
  version: string;
  size: number; // bytes
  sha256: string; // computed by the server from the file content it received
  notes: string | null;
  test: boolean; // a TEST release: only for one device, never "update all"
  uploaded_by: string | null; // the admin account's number
  created_at: string;
  withdrawn_at: string | null;
  url: string | null; // the device download address; null = SERVER_URL isn't set
};

// A release in the GET /firmware list carries its canary summary
export type FullRelease = Release & {
  canary_succeeded: number;
  canary_failed: number;
  can_update_all: boolean; // the "Update all" button may be used for this version
  update_all_reason: string | null;
};

export type ReleaseList = {
  latest: { node1: string | null };
  releases: FullRelease[]; // in upload order
};

// the result of ONE update command. "accepted" = the device accepted the command (NOT finished: the result follows through the ota event)
export type UpdateResult = {
  device_id: string;
  id: string | null;
  status: "accepted" | "no-ack" | "rejected" | "not-sent";
  from?: string | null;
  to?: string;
  wait_ms?: number;
  message?: string;
};

// the POST /fleet/update answer (update canary / update all)
export type FleetResult = {
  version: string;
  target: "canary" | "all";
  sent: UpdateResult[];
  skipped: { device_id: string; reason: string }[]; // not queued: these devices were sent nothing
};

// the POST /provision/code answer: the code is shown only ONCE (the database only stores its fingerprint)
export type NewClaimCode = {
  code: string; // XXXX-XXXX
  expires_at: string; // UTC
  minutes: number;
  name: string | null;
  location: string | null;
};

// one row of GET /provision/code (WITHOUT the code)
export type ClaimCode = {
  name: string | null;
  location: string | null;
  created_by: string | null;
  created_at: string;
  expires_at: string;
  state: "valid" | "used" | "expired";
  used_at: string | null;
  device_id: string | null; // the device that used it
};

// the POST /devices/:id/revoke answer ("Deactivate")
export type DeactivateResult = {
  device_id: string;
  revoked_at: string;
  steps: string[]; // what still has to be done by hand (if anything)
  broker_account: "deleted" | "none" | "manual" | "no-key";
};

// the PUT /devices/:id/intervals answer
export type IntervalResult = {
  device_id: string;
  vitals_interval_s: number;
  config_id: string | null;
  note: string | null; // for example older firmware that doesn't know the interval yet
};
