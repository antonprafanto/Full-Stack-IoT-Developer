-- 001_initial_schema.sql - the initial schema of the Mini Smart Home database (Module 17).
-- One table for each kind of data. Every time is a timestamptz: stored in UTC, shown in the session time zone.

-- Devices ever heard. The backend creates a device's row automatically when its first message arrives.
CREATE TABLE devices (
  device_id  text PRIMARY KEY CHECK (device_id ~ '^[0-9a-f]{12}$'),
  kind       text NOT NULL DEFAULT 'unknown' CHECK (kind IN ('node1', 'node2', 'unknown')),
  name       text,             -- an easy-to-remember name, for example 'Node 1 living room' (filled in by a person)
  location   text,             -- for example 'living room' or 'back garden'
  lat        double precision CHECK (lat BETWEEN -90 AND 90),
  lng        double precision CHECK (lng BETWEEN -180 AND 180),
  status     text NOT NULL DEFAULT 'unknown',
  last_seen  timestamptz,      -- server time when this device's last message arrived
  created_at timestamptz NOT NULL DEFAULT now()
);

-- One row for every telemetry message. A column the device doesn't have holds NULL.
CREATE TABLE readings (
  device_id        text NOT NULL REFERENCES devices (device_id),
  ts               timestamptz NOT NULL,                -- the reading time from the device (contract section 4)
  received_at      timestamptz NOT NULL DEFAULT now(),  -- when the message arrived at the backend
  fw               text NOT NULL,
  temperature      double precision,
  humidity         integer,
  light            integer,
  soil             integer,
  motion           boolean,
  water_level      integer,
  pressure         double precision,
  soil_temperature double precision,
  battery          double precision,
  soil_rs485       double precision,
  ec               integer,
  PRIMARY KEY (device_id, ts)                           -- one reading per device per time: a duplicate send is refused
);

-- Device health from the vitals messages (contract section 6).
CREATE TABLE device_health (
  device_id text NOT NULL REFERENCES devices (device_id),
  ts        timestamptz NOT NULL,
  rssi      integer NOT NULL,
  uptime_s  integer NOT NULL,
  heap_free integer NOT NULL,
  PRIMARY KEY (device_id, ts)
);

-- Every command from the API with its ack answer (contract sections 7-8).
CREATE TABLE commands (
  id          text PRIMARY KEY,                      -- the command id, for example c-20261020-041128-1
  device_id   text NOT NULL REFERENCES devices (device_id),
  sent_at     timestamptz NOT NULL DEFAULT now(),
  target      text NOT NULL,
  value       jsonb NOT NULL,                        -- true/false for the lamp and the fan, a number for the pump and the curtain
  ack_ok      boolean,                               -- NULL = no ack within 5 seconds
  ack_message text,
  wait_ms     integer
);

-- Prepared now, used later: user accounts (Module 20 adds passwords and login).
CREATE TABLE users (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email      text NOT NULL UNIQUE,
  name       text NOT NULL,
  role       text NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Prepared now, used later: automation rules (Module 19), for example "temperature above 30 -> fan on".
CREATE TABLE rules (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       text NOT NULL,
  active     boolean NOT NULL DEFAULT true,
  condition  jsonb NOT NULL,
  action     jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
