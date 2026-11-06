-- load-1-million.sql - Module 18 load test: fake readings every 10 seconds for the last 120 days
-- for the test device beef00000001, that is 120 x 8,640 + 1 = 1,036,801 readings ("a million rows").
-- The last reading falls on the last full minute, so its seconds are always :00, :10, ..., :50.
-- The numbers follow a daily pattern (hotter and brighter by day, more humid at night) plus a little "dice".
-- The dice are seeded (setseed), so the sequence of random numbers is the same on anyone's laptop.
-- Running it once is enough: if the test device already has readings, the second INSERT is skipped.
-- Run it with psql inside the database container (see the module README, Practice 4).
\timing on

-- the test device first, so that its readings pass the foreign key rule (readings -> devices)
INSERT INTO devices (device_id, kind, name, location)
VALUES ('beef00000001', 'node1', 'Load test', 'lab')
ON CONFLICT (device_id) DO NOTHING;

SELECT setseed(0.18);  -- the dice seed: the sequence of random() numbers after this is always the same

INSERT INTO readings (device_id, ts, fw, temperature, humidity, light, soil, motion, water_level)
SELECT 'beef00000001', ts, '1.4.0',
       round((27 + 4 * sin(pi() * (hour - 9) / 12) + random() - 0.5)::numeric, 1),  -- 22.5-31.5 degrees, hottest at 15:00
       round(75 - 10 * sin(pi() * (hour - 9) / 12) + 4 * (random() - 0.5)),         -- 63-87 percent, the opposite of temperature
       round(greatest(0, 3400 * sin(pi() * (hour - 6) / 12)) + 60 * random()),      -- dark at night, brightest at 12:00
       round(68 - 1.5 * mod(hour + 6, 12) + random()),                               -- watered at 06:00 and 18:00, then drying
       random() < 0.1,                                                               -- now and then someone walks by
       round(90 - 2 * hour)                                                          -- the water tank is full at 00:00, then drops
FROM (SELECT ts, extract(epoch FROM (ts AT TIME ZONE 'Asia/Jakarta')::time) / 3600 AS hour  -- WIB hour with decimals: 0 - 23.99
      FROM generate_series(date_trunc('minute', now()) - INTERVAL '120 days',  -- from the full minute 120 days ago
                           date_trunc('minute', now()),                       -- to the last full minute
                           INTERVAL '10 seconds') AS ts) AS times
WHERE NOT EXISTS (SELECT 1 FROM readings WHERE device_id = 'beef00000001');  -- loaded before? skip it

ANALYZE readings;  -- refresh the statistics so that the query planner knows there are a million new rows

SELECT count(*) AS test_readings FROM readings WHERE device_id = 'beef00000001';
