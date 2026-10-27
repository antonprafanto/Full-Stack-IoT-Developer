-- kueri-suhu.sql - kueri panel pertama di Grafana (Modul 25, Kemenangan Cepat): suhu setiap perangkat, dari tabel readings.
-- Tempel di editor kueri panel (mode Code), format "Time series". Grafana mengganti dua makro sebelum kueri dikirim:
--   $__timeGroupAlias(ts, $__interval) -> time_bucket('60.000s',ts) AS "time" (contoh untuk rentang Last 1 hour: lebar
--                                         ember mengikuti rentang di kanan atas; terlihat di Query inspector. time_bucket =
--                                         fungsi TimescaleDB, karena sakelar TimescaleDB dinyalakan)
--   $__timeFilter(ts)                  -> ts BETWEEN '…Z' AND '…Z' (rentang waktu dashboard, ditulis dalam UTC)
-- Kolom device_id AS metric = satu garis per perangkat. Akun grafana_baca cukup: readings boleh dibaca (SELECT).
SELECT
  $__timeGroupAlias(ts, $__interval),
  device_id AS metric,
  avg(suhu) AS suhu
FROM readings
WHERE $__timeFilter(ts)
GROUP BY 1, 2
ORDER BY 1
