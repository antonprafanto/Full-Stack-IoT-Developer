-- 007_rules_and_events.sql - automation rules can be changed through the API, every command records who gave the order,
-- and the event log "who turned on what, and when" (Module 19).
-- Number 006 is skipped on purpose: 006_device_health.sql is the Level 3 Challenge of Module 18 that you may have built.

-- The rules table has been ready since Module 17 (migration 001). Now it also records when it was last changed, and the
-- condition and the action must be JSON objects { ... }.
ALTER TABLE rules
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now(),
  ADD CONSTRAINT rules_condition_object CHECK (jsonb_typeof(condition) = 'object'),
  ADD CONSTRAINT rules_action_object CHECK (jsonb_typeof(action) = 'object');

-- Every command now records who gave the order. The old commands all came from the API, so the default is 'api'.
ALTER TABLE commands
  ADD COLUMN source  text NOT NULL DEFAULT 'api' CHECK (source IN ('api', 'rule', 'schedule', 'telegram')),
  ADD COLUMN rule_id integer REFERENCES rules (id) ON DELETE SET NULL, -- the rule that gave the order (if any)
  ADD COLUMN state   jsonb;                                            -- ack.state; NULL = no ack

-- The event log: one row for everything a human needs to know.
CREATE TABLE events (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  device_id   text REFERENCES devices (device_id),  -- NULL for an event that doesn't belong to one device
  kind        text NOT NULL
              CHECK (kind IN ('rule', 'rule-changed', 'schedule', 'status', 'offline-report', 'command')),
  source      text NOT NULL,                        -- api, rule, schedule, telegram, or device
  rule_id     integer REFERENCES rules (id) ON DELETE SET NULL,
  message     text NOT NULL,                        -- a sentence for humans, the same as its Telegram message
  data        jsonb                                 -- the raw details: reading, command, result
);
CREATE INDEX events_occurred_at_idx ON events (occurred_at DESC);
