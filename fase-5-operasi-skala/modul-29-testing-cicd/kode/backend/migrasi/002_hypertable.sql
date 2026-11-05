-- 002_hypertable.sql - tabel readings menjadi hypertable (Modul 18).
-- Namanya tetap readings, tetapi TimescaleDB kini menyimpannya per "jilid" (chunk) berisi 1 hari bacaan,
-- dipotong setiap pukul 00.00 UTC (= 07.00 WIB). Bacaan yang sudah ada ikut dipindah ke jilidnya (migrate_data).

-- Kunci tabel devices sebentar supaya tidak terjadi deadlock (saling tunggu) dengan backend yang sedang menulis.
LOCK TABLE devices IN SHARE ROW EXCLUSIVE MODE;
SELECT create_hypertable('readings', by_range('ts', INTERVAL '1 day'), migrate_data => true);
