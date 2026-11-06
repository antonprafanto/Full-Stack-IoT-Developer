-- 011_ota_and_fleet.sql - over-the-air firmware updates (OTA), fleet data, and registration with a claim code (Module 28).
-- This file only ADDS: new tables, and new columns that may be empty or have a default value. Backend 1.4.0 can still
-- run on top of this schema (the way back: the 1.4.0 image started again without deleting anything).

-- 1) Firmware releases uploaded by the admin (their .bin files live in the firmware-data cupboard, not in the database). Node 2
--    (ESP-NOW) isn't updated over the air on the main path, so the only kind is node1. One version = one file that may not be
--    overwritten: changed firmware always gets a new version number.
CREATE TABLE firmware (
  kind         text NOT NULL CHECK (kind IN ('node1')),
  -- SemVer x.y.z WITHOUT leading zeros (1.07.1 is refused: as a number it equals 1.7.1, as text it differs), at most
  -- 5 digits per part; the same pattern as RELEASE_VERSION_PATTERN in src/services/version.ts
  version      text NOT NULL CHECK (version ~ '^(0|[1-9][0-9]{0,4})\.(0|[1-9][0-9]{0,4})\.(0|[1-9][0-9]{0,4})$'),
  size         integer NOT NULL CHECK (size > 0 AND size <= 1966080),    -- at most = one Minimal SPIFFS program shelf
  sha256       text NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),           -- the file content's fingerprint, computed by the server
  notes        text CHECK (length(notes) <= 200),                         -- for example "a new-version greeting on the OLED"
  test         boolean NOT NULL DEFAULT false,  -- a TEST release (for example a 1.7.2 broken on purpose): only for one device
  uploaded_by  text,                            -- the number of the admin account that uploaded it
  created_at   timestamptz NOT NULL DEFAULT now(),
  withdrawn_at timestamptz,                     -- a bad release withdrawn by the admin: not sent and can't be downloaded anymore
  PRIMARY KEY (kind, version)
);

-- 2) The last state of every device, so the /fleet page doesn't need to scan the whole history.
ALTER TABLE devices
  ADD COLUMN fw                text CHECK (fw ~ '^\d+\.\d+\.\d+$'),   -- the firmware version the device REPORTED last
  ADD COLUMN fw_seen_at        timestamptz,                         -- when that version was last reported (server clock)
  ADD COLUMN reset_reason      text
             CHECK (reset_reason IN ('POWERON', 'BROWNOUT', 'SW', 'PANIC', 'WDT', 'DEEPSLEEP', 'UNKNOWN')),
  ADD COLUMN canary            boolean NOT NULL DEFAULT false,      -- a test device: gets new releases first
  ADD COLUMN vitals_interval_s integer CHECK (vitals_interval_s BETWEEN 60 AND 3600);  -- NULL = not set yet (firmware: 300 seconds)

-- fill in fw from the history: the version in each device's NEWEST reading (Node 2: the version its packet carries). LATERAL +
-- LIMIT 1 uses the (device_id, ts) index of the readings table, so it stays fast even with millions of rows of history.
UPDATE devices d SET fw = r.fw, fw_seen_at = r.received_at
FROM devices d2
CROSS JOIN LATERAL (SELECT fw, received_at FROM readings WHERE device_id = d2.device_id ORDER BY ts DESC LIMIT 1) r
WHERE d.device_id = d2.device_id AND r.fw ~ '^\d+\.\d+\.\d+$';

-- 3) vitals carry the restart reason and the firmware version (contract 1.6, firmware 1.7.0 and newer). Old rows stay NULL.
ALTER TABLE device_health
  ADD COLUMN reset_reason text
             CHECK (reset_reason IN ('POWERON', 'BROWNOUT', 'SW', 'PANIC', 'WDT', 'DEEPSLEEP', 'UNKNOWN')),
  ADD COLUMN fw           text CHECK (fw ~ '^\d+\.\d+\.\d+$');

-- 4) The update history: one row = one update command to one device (id = its command id, c-20261031-...).
--    Running statuses: sent (cmd published) -> accepted (ack ok:true) -> downloading (the device fetches its file).
--    Final statuses: rejected (ack ok:false), succeeded, rollback (the new firmware failed and the device went back to the old
--    version by itself), failed (download/check failed, the old version keeps running), expired (no word for too long).
CREATE TABLE updates (
  id           text PRIMARY KEY,
  device_id    text NOT NULL REFERENCES devices (device_id),
  kind         text NOT NULL DEFAULT 'node1',
  from_version text CHECK (from_version ~ '^\d+\.\d+\.\d+$'),        -- NULL = the old version was never reported
  to_version   text NOT NULL,
  canary       boolean NOT NULL DEFAULT false,  -- this device was a canary WHEN its command was sent (the "update all" condition)
  status       text NOT NULL DEFAULT 'sent'
               CHECK (status IN ('sent', 'accepted', 'downloading', 'rejected', 'succeeded', 'rollback', 'failed', 'expired')),
  message      text,                            -- the reason from the device (ack or the vitals.ota report) or from the server
  requested_by text,                            -- the number of the admin account that pressed the button
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  finished_at  timestamptz,                     -- filled in as soon as the status is a final one
  FOREIGN KEY (kind, to_version) REFERENCES firmware (kind, version),
  CHECK ((finished_at IS NULL) = (status IN ('sent', 'accepted', 'downloading')))
);
CREATE INDEX updates_device_idx ON updates (device_id, created_at DESC);
-- at most ONE update still running per device: the database itself refuses a second one
CREATE UNIQUE INDEX updates_one_running ON updates (device_id) WHERE status IN ('sent', 'accepted', 'downloading');

-- 5) Single-use claim codes to register a new device within one minute. The database only stores the code's SHA-256,
--    like device keys (Module 21): the code itself is shown only once, to the admin.
CREATE TABLE claim_codes (
  code_hash   text PRIMARY KEY CHECK (code_hash ~ '^[0-9a-f]{64}$'),
  name        text CHECK (length(name) <= 60),     -- the name and location the claiming device gets right away
  location    text CHECK (length(location) <= 60),
  created_by  text,                                -- the number of the admin account that made it
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL,
  used_at     timestamptz,                         -- when it was exchanged for a key; NULL = not used yet
  device_id   text REFERENCES devices (device_id),
  CHECK ((used_at IS NULL) = (device_id IS NULL)),
  CHECK (expires_at > created_at AND expires_at <= created_at + interval '60 minutes')
);

-- 6) New event kinds in the event log (Module 19): ota, provisioning (a device registered through a claim code), and
--    revoked (a device deactivated by the admin). The old constraint is indeed named events_kind_check (PostgreSQL's default).
ALTER TABLE events DROP CONSTRAINT events_kind_check;
ALTER TABLE events ADD CONSTRAINT events_kind_check
  CHECK (kind IN ('rule', 'rule-changed', 'schedule', 'status', 'offline-report', 'command', 'ota', 'provisioning', 'revoked'));
