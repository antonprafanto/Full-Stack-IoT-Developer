-- temperature-query.sql - the first panel's query in Grafana (Module 25, Quick Win): the temperature of every device, from the readings table.
-- Paste it into the panel's query editor (Code mode), format "Time series". Grafana replaces two macros before the query is sent:
--   $__timeGroupAlias(ts, $__interval) -> time_bucket('60.000s',ts) AS "time" (example for the range Last 1 hour: the bucket
--                                         width follows the range at the top right; visible in Query inspector. time_bucket =
--                                         a TimescaleDB function, because the TimescaleDB switch is on)
--   $__timeFilter(ts)                  -> ts BETWEEN '…Z' AND '…Z' (the dashboard's time range, written in UTC)
-- The column device_id AS metric = one line per device. The grafana_reader account is enough: readings may be read (SELECT).
SELECT
  $__timeGroupAlias(ts, $__interval),
  device_id AS metric,
  avg(temperature) AS temperature
FROM readings
WHERE $__timeFilter(ts)
GROUP BY 1, 2
ORDER BY 1
