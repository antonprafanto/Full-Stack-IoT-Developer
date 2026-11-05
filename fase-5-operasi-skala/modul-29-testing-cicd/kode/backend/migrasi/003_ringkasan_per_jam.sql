-- 003_ringkasan_per_jam.sql - "buku ringkasan" per jam dari readings: continuous aggregate (Modul 18).
-- Petugas TimescaleDB menulis ringkasannya sendiri. Jam sesudah jam terakhir yang sudah diringkas dihitung langsung
-- dari readings (materialized_only = false), jadi jam yang sedang berjalan pun ikut tampil.
-- WITH NO DATA wajib: migrasi berjalan di dalam transaksi (BEGIN ... COMMIT), sedangkan mengisi ringkasan tidak boleh.
-- Riwayat yang sudah ada diringkas sekali lewat psql: CALL refresh_continuous_aggregate(...).
--
-- Setiap besaran punya rata-rata (_rata) dan banyaknya nilai yang terisi (_n; nilai NULL tidak ikut dihitung).
-- Dari keduanya, rata-rata harian selalu tepat: jumlahkan (rata x n) semua jam, lalu bagi dengan jumlah n semua jam.
CREATE MATERIALIZED VIEW readings_per_jam
WITH (timescaledb.continuous, timescaledb.materialized_only = false) AS
SELECT time_bucket('1 hour', ts) AS jam,
       device_id,
       avg(suhu)         AS suhu_rata,
       min(suhu)         AS suhu_min,
       max(suhu)         AS suhu_maks,
       count(suhu)       AS suhu_n,
       avg(kelembapan)   AS kelembapan_rata,
       count(kelembapan) AS kelembapan_n,
       avg(tanah)        AS tanah_rata,
       min(tanah)        AS tanah_min,      -- tanah paling kering dalam jam itu
       count(tanah)      AS tanah_n,
       avg(cahaya)       AS cahaya_rata,
       count(cahaya)     AS cahaya_n,
       count(*)          AS jumlah_bacaan   -- semua bacaan dalam jam itu, termasuk yang sebagian kolomnya NULL
FROM readings
GROUP BY jam, device_id
WITH NO DATA;

-- Jadwal petugas: setiap 30 menit, ringkas ulang 3 hari terakhir, kecuali 1 jam terakhir yang masih terus bertambah.
SELECT add_continuous_aggregate_policy('readings_per_jam',
  start_offset      => INTERVAL '3 days',
  end_offset        => INTERVAL '1 hour',
  schedule_interval => INTERVAL '30 minutes');
