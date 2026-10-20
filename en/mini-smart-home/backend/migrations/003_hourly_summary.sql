-- 003_hourly_summary.sql - an hourly "summary book" of readings: a continuous aggregate (Module 18).
-- The TimescaleDB clerk writes the summaries by itself. Hours after the last hour already summarized are computed directly
-- from readings (materialized_only = false), so even the hour that is still running shows up.
-- WITH NO DATA is required: migrations run inside a transaction (BEGIN ... COMMIT), and filling the summary there is not allowed.
-- The history that already exists is summarized once from psql: CALL refresh_continuous_aggregate(...).
--
-- Every measured quantity has an average (avg_) and a count of the values filled in (_n; NULL values are not counted).
-- From the two, a daily average is always exact: add up (avg x n) over all hours, then divide by the sum of n over all hours.
CREATE MATERIALIZED VIEW readings_hourly
WITH (timescaledb.continuous, timescaledb.materialized_only = false) AS
SELECT time_bucket('1 hour', ts) AS hour,
       device_id,
       avg(temperature)   AS avg_temp,
       min(temperature)   AS min_temp,
       max(temperature)   AS max_temp,
       count(temperature) AS temp_n,
       avg(humidity)      AS avg_humidity,
       count(humidity)    AS humidity_n,
       avg(soil)          AS avg_soil,
       min(soil)          AS min_soil,       -- the driest soil within that hour
       count(soil)        AS soil_n,
       avg(light)         AS avg_light,
       count(light)       AS light_n,
       count(*)           AS reading_count   -- every reading within that hour, including those with some columns NULL
FROM readings
GROUP BY hour, device_id
WITH NO DATA;

-- The clerk's schedule: every 30 minutes, summarize the last 3 days again, except the last hour that is still growing.
SELECT add_continuous_aggregate_policy('readings_hourly',
  start_offset      => INTERVAL '3 days',
  end_offset        => INTERVAL '1 hour',
  schedule_interval => INTERVAL '30 minutes');
