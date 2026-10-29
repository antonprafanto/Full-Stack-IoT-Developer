-- 004_retention.sql - drop raw readings older than 90 days (Module 18).
-- TimescaleDB drops whole binders (chunks), not rows one by one: fast, without DELETE.
-- The hourly summary (readings_hourly) stays, because the summary clerk's window (3 days) is much shorter than 90 days.
SELECT add_retention_policy('readings', drop_after => INTERVAL '90 days');
