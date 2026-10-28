-- warmup.sql - an SQL warm-up before Module 25 (steps 1-3). Three small skills that Grafana and the daily report use later:
-- each device's latest reading, "how many minutes ago?", and the "yesterday" range by the WIB clock.
-- Run it in psql as in Module 17:  docker exec -it smarthome-db psql -U postgres -d smarthome
-- then paste one step at a time (every query ends with a semicolon).

-- Step 1. The latest reading of each device. GROUP BY collects the rows per device_id; count(*) counts the rows,
-- max(received_at) picks the newest time. received_at = the SERVER's clock when the reading arrived (Module 17), ts = the device's clock.
SELECT device_id, count(*) AS reading_count, max(received_at) AS last_received
FROM readings
GROUP BY device_id
ORDER BY device_id;

-- Step 2. How many minutes ago? now() - a time = an interval. EXTRACT(EPOCH FROM interval) = that interval in
-- seconds; divided by 60 = minutes. round(number, 1) = one digit after the decimal point; this kind of round needs the numeric
-- type, so the division result is converted first with ::numeric. This is the groundwork for the "silent node" alert in Grafana.
SELECT device_id,
       round((EXTRACT(EPOCH FROM now() - max(received_at)) / 60)::numeric, 1) AS minutes_ago
FROM readings
GROUP BY device_id
ORDER BY device_id;

-- Step 3. The "yesterday" range by the WIB clock, the groundwork for the daily report.
--   now() AT TIME ZONE 'Asia/Jakarta'   = the wall clock in Jakarta now (without a time zone)
--   date_trunc('day', …)                = cut to 00:00 today (WIB)
--   - INTERVAL '1 day'                  = 00:00 yesterday (WIB)
--   … AT TIME ZONE 'Asia/Jakarta'       = that WIB wall-clock time turned back into a real time (timestamptz)
-- psql prints a real time in its session's zone. In the database container the zone is UTC, so 00:00 WIB is printed as 17:00:00+00
-- the day before: the same moment, only written differently.
SELECT (date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') - INTERVAL '1 day') AT TIME ZONE 'Asia/Jakarta' AS from_time,
       date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') AT TIME ZONE 'Asia/Jakarta' AS to_time;

-- Yesterday's number of readings of each device, from the hourly summary book readings_hourly (Module 18). "to_time" is not counted
-- (the < sign), so that 00:00 today isn't counted twice (yesterday and today).
SELECT device_id, sum(reading_count) AS readings_yesterday
FROM readings_hourly
WHERE hour >= (date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') - INTERVAL '1 day') AT TIME ZONE 'Asia/Jakarta'
  AND hour <  date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') AT TIME ZONE 'Asia/Jakarta'
GROUP BY device_id
ORDER BY device_id;
