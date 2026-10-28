-- grafana-user.sql - a database account ONLY for Grafana that can only READ (Module 25).
-- Run it ONCE in psql as postgres (how: grafana/README.md). This file deliberately has NO password: the password is typed
-- afterwards with \password grafana_reader, so that it is never stored in Git or in the terminal history.
-- Two layers of protection: (1) every transaction of this account is read-only, (2) its rights are only SELECT on the tables and columns below.

CREATE ROLE grafana_reader LOGIN CONNECTION LIMIT 5;               -- may log in, at most 5 connections at once
ALTER ROLE grafana_reader SET default_transaction_read_only = on;  -- every transaction of it is read-only
ALTER ROLE grafana_reader SET statement_timeout = '10s';           -- a runaway panel query is stopped after 10 seconds
GRANT CONNECT ON DATABASE smarthome TO grafana_reader;
GRANT USAGE ON SCHEMA public TO grafana_reader;
GRANT SELECT ON readings, readings_hourly, device_health, events, commands TO grafana_reader;
-- devices: only these columns, WITHOUT key_hash and key_created_at (Grafana doesn't need to see device key fingerprints).
-- As a result SELECT * FROM devices is refused (permission denied): in Grafana, always write the column names.
GRANT SELECT (device_id, kind, name, location, lat, lng, status, last_seen, created_at, registered_at, revoked_at, linked_via)
  ON devices TO grafana_reader;
-- users, sessions, rules, schema_migrations: NOT granted (password fingerprints and session tokens must not be readable by Grafana)
