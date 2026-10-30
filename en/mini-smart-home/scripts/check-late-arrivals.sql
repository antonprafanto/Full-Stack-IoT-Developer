-- check-late-arrivals.sql - the proof of the Mini Smart Home "unplug the home internet for 10 minutes" test (Module 27): are the
-- readings of ONE device during the outage in the central database (the VPS, or the free-path Pi) with their original event time
-- (ts), with no gaps and no duplicate rows? A late arrival = it arrived (the received_at column) more than 60 seconds after its event time.
--
-- Run it from the project root on the CENTRAL machine, about a minute after the internet is connected again. Three values (psql -v):
--   device = the device_id, for example a4cf12e5b7c0;  start, end = WIB times a little before the outage and after reconnecting
--   Linux, macOS, VPS, Pi (bash/zsh; one line):
--     docker compose exec -T db psql -U postgres -d smarthome -v device=a4cf12e5b7c0 -v "start=2026-10-29 10:00" -v "end=2026-10-29 10:20" < scripts/check-late-arrivals.sql
--   PowerShell (Windows; not tested by the author): Get-Content scripts/check-late-arrivals.sql | docker compose exec -T db psql ... (same values)
--
-- Passes when: largest_gap is about 10 seconds at most (Node 1 sends every 10 seconds, plus an immediate send when its
-- state changes), gaps_over_12_seconds = 0, duplicates = 0, and arrived_late > 0 (proof that those readings really came later).
-- The per-minute table shows that the minutes of the outage still hold readings.
\set ON_ERROR_STOP on
\if :{?device}
\else
  \echo 'fill in device, start, and end: psql ... -v device=<device_id> -v "start=YYYY-MM-DD HH:MM" -v "end=YYYY-MM-DD HH:MM"'
  \quit
\endif
\if :{?start}
\else
  \echo 'start not filled in: -v "start=YYYY-MM-DD HH:MM" (WIB time)'
  \quit
\endif
\if :{?end}
\else
  \echo 'end not filled in: -v "end=YYYY-MM-DD HH:MM" (WIB time)'
  \quit
\endif
-- the typed times and the shown times = WIB (the database always stores times in UTC); QUIET = no "SET" line
\set QUIET on
SET TIME ZONE 'Asia/Jakarta';
\set QUIET off

\echo '== Summary (WIB times) =='
WITH b AS (
  SELECT ts, received_at, ts - lag(ts) OVER (ORDER BY ts) AS gap
  FROM readings
  WHERE device_id = :'device' AND ts >= :'start' AND ts < :'end'
)
SELECT count(*) AS readings,
       to_char(min(ts), 'HH24:MI:SS') AS first,
       to_char(max(ts), 'HH24:MI:SS') AS last,
       max(gap) AS largest_gap,
       count(*) FILTER (WHERE gap > interval '12 seconds') AS gaps_over_12_seconds,
       count(*) FILTER (WHERE received_at - ts > interval '60 seconds') AS arrived_late,
       (SELECT count(*) FROM (SELECT 1 FROM readings
          WHERE device_id = :'device' AND ts >= :'start' AND ts < :'end'
          GROUP BY device_id, ts HAVING count(*) > 1) AS k) AS duplicates
FROM b;

\echo '== Per minute: readings and the ones that arrived later (late arrivals) =='
SELECT to_char(date_trunc('minute', ts), 'HH24:MI') AS minute,
       count(*) AS readings,
       count(*) FILTER (WHERE received_at - ts > interval '60 seconds') AS late,
       to_char(max(received_at), 'HH24:MI:SS') AS last_arrival
FROM readings
WHERE device_id = :'device' AND ts >= :'start' AND ts < :'end'
GROUP BY 1
ORDER BY 1;

\echo '== Gaps over 12 seconds (empty = no reading was lost) =='
WITH b AS (
  SELECT ts, ts - lag(ts) OVER (ORDER BY ts) AS gap
  FROM readings
  WHERE device_id = :'device' AND ts >= :'start' AND ts < :'end'
)
SELECT to_char(ts - gap, 'HH24:MI:SS') AS from_time, to_char(ts, 'HH24:MI:SS') AS to_time, gap
FROM b
WHERE gap > interval '12 seconds'
ORDER BY ts;
