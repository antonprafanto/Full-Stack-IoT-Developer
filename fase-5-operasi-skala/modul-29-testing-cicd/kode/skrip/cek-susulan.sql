-- cek-susulan.sql - bukti uji "cabut internet rumah 10 menit" Rumah Pintar Mini (Modul 27): apakah bacaan SATU perangkat
-- selama internet putus ada di database pusat (VPS, atau Pi jalur gratis) dengan waktu kejadian (ts) aslinya, tanpa celah
-- dan tanpa baris kembar. Bacaan susulan = tiba (kolom diterima) lebih dari 60 detik sesudah waktu kejadiannya.
--
-- Jalankan dari akar proyek di mesin PUSAT, kira-kira satu menit sesudah internet tersambung lagi. Tiga isian (psql -v):
--   perangkat = device_id, misalnya a4cf12e5b7c0;  mulai, selesai = jam WIB sedikit sebelum putus dan sesudah sambung
--   Linux, macOS, VPS, Pi (bash/zsh; satu baris):
--     docker compose exec -T db psql -U postgres -d rumahpintar -v perangkat=a4cf12e5b7c0 -v "mulai=2026-10-29 10:00" -v "selesai=2026-10-29 10:20" < skrip/cek-susulan.sql
--   PowerShell (Windows; tidak diuji penulis): Get-Content skrip/cek-susulan.sql | docker compose exec -T db psql ... (isian sama)
--
-- Lulus bila: celah_terbesar paling lama sekitar 10 detik (Node 1 mengirim tiap 10 detik, ditambah kiriman segera saat
-- keadaan berganti), celah_lebih_12_detik = 0, kembar = 0, dan tiba_susulan > 0 (bukti bacaan itu memang datang belakangan).
-- Tabel per menit menunjukkan menit-menit saat putus tetap berisi bacaan.
\set ON_ERROR_STOP on
\if :{?perangkat}
\else
  \echo 'isi perangkat, mulai, dan selesai: psql ... -v perangkat=<device_id> -v "mulai=YYYY-MM-DD HH:MM" -v "selesai=YYYY-MM-DD HH:MM"'
  \quit
\endif
\if :{?mulai}
\else
  \echo 'mulai belum diisi: -v "mulai=YYYY-MM-DD HH:MM" (jam WIB)'
  \quit
\endif
\if :{?selesai}
\else
  \echo 'selesai belum diisi: -v "selesai=YYYY-MM-DD HH:MM" (jam WIB)'
  \quit
\endif
-- jam yang diketik dan jam yang ditampilkan = WIB (jam di database selalu disimpan dalam UTC); QUIET = tanpa baris "SET"
\set QUIET on
SET TIME ZONE 'Asia/Jakarta';
\set QUIET off

\echo '== Ringkasan (jam WIB) =='
WITH b AS (
  SELECT ts, diterima, ts - lag(ts) OVER (ORDER BY ts) AS jeda
  FROM readings
  WHERE device_id = :'perangkat' AND ts >= :'mulai' AND ts < :'selesai'
)
SELECT count(*) AS bacaan,
       to_char(min(ts), 'HH24:MI:SS') AS pertama,
       to_char(max(ts), 'HH24:MI:SS') AS terakhir,
       max(jeda) AS celah_terbesar,
       count(*) FILTER (WHERE jeda > interval '12 seconds') AS celah_lebih_12_detik,
       count(*) FILTER (WHERE diterima - ts > interval '60 seconds') AS tiba_susulan,
       (SELECT count(*) FROM (SELECT 1 FROM readings
          WHERE device_id = :'perangkat' AND ts >= :'mulai' AND ts < :'selesai'
          GROUP BY device_id, ts HAVING count(*) > 1) AS k) AS kembar
FROM b;

\echo '== Per menit: jumlah bacaan dan yang tiba belakangan (susulan) =='
SELECT to_char(date_trunc('minute', ts), 'HH24:MI') AS menit,
       count(*) AS bacaan,
       count(*) FILTER (WHERE diterima - ts > interval '60 seconds') AS susulan,
       to_char(max(diterima), 'HH24:MI:SS') AS tiba_terakhir
FROM readings
WHERE device_id = :'perangkat' AND ts >= :'mulai' AND ts < :'selesai'
GROUP BY 1
ORDER BY 1;

\echo '== Celah lebih dari 12 detik (kosong = tidak ada bacaan yang hilang) =='
WITH b AS (
  SELECT ts, ts - lag(ts) OVER (ORDER BY ts) AS jeda
  FROM readings
  WHERE device_id = :'perangkat' AND ts >= :'mulai' AND ts < :'selesai'
)
SELECT to_char(ts - jeda, 'HH24:MI:SS') AS dari, to_char(ts, 'HH24:MI:SS') AS sampai, jeda
FROM b
WHERE jeda > interval '12 seconds'
ORDER BY ts;
