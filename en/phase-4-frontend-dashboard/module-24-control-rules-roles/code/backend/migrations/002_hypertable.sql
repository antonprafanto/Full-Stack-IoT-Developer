-- 002_hypertable.sql - the readings table becomes a hypertable (Module 18).
-- Its name stays readings, but TimescaleDB now stores it in "binders" (chunks) of 1 day of readings each,
-- cut every day at 00:00 UTC (= 07:00 WIB). Readings that already exist are moved into their binder (migrate_data).

-- Lock the devices table for a moment so that no deadlock (waiting for each other) happens with a backend that is writing.
LOCK TABLE devices IN SHARE ROW EXCLUSIVE MODE;
SELECT create_hypertable('readings', by_range('ts', INTERVAL '1 day'), migrate_data => true);
