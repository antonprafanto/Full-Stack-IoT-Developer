-- pemanasan.sql - pemanasan ulang SQL sebelum Modul 25 (langkah 1-3). Tiga kemampuan kecil yang nanti dipakai Grafana dan
-- laporan harian: bacaan terakhir setiap perangkat, "berapa menit yang lalu?", dan rentang "kemarin" menurut jam WIB.
-- Jalankan di psql seperti Modul 17:  docker exec -it rumahpintar-db psql -U postgres -d rumahpintar
-- lalu tempel satu langkah demi satu langkah (setiap kueri diakhiri titik koma).

-- Langkah 1. Bacaan terakhir setiap perangkat. GROUP BY mengumpulkan baris per device_id; count(*) menghitung barisnya,
-- max(diterima) memilih waktu terbaru. diterima = jam SERVER saat bacaan tiba (Modul 17), ts = jam di perangkat.
SELECT device_id, count(*) AS jumlah_bacaan, max(diterima) AS terakhir_diterima
FROM readings
GROUP BY device_id
ORDER BY device_id;

-- Langkah 2. Berapa menit yang lalu? now() - waktu = sebuah selang (interval). EXTRACT(EPOCH FROM selang) = selang itu dalam
-- detik; dibagi 60 = menit. round(angka, 1) = satu angka di belakang koma; round jenis ini butuh tipe numeric, jadi hasil
-- bagi diubah dulu dengan ::numeric. Inilah bekal alert "node diam" di Grafana.
SELECT device_id,
       round((EXTRACT(EPOCH FROM now() - max(diterima)) / 60)::numeric, 1) AS menit_lalu
FROM readings
GROUP BY device_id
ORDER BY device_id;

-- Langkah 3. Rentang "kemarin" menurut jam WIB, bekal laporan harian.
--   now() AT TIME ZONE 'Asia/Jakarta'   = jam dinding di Jakarta sekarang (tanpa zona waktu)
--   date_trunc('day', …)                = dipotong ke pukul 00.00 hari ini (WIB)
--   - INTERVAL '1 day'                  = pukul 00.00 kemarin (WIB)
--   … AT TIME ZONE 'Asia/Jakarta'       = jam dinding WIB itu diubah lagi menjadi waktu sungguhan (timestamptz)
-- psql mencetak waktu sungguhan dalam zona sesinya. Di kontainer database zonanya UTC, jadi 00.00 WIB tercetak 17:00:00+00
-- hari sebelumnya: waktunya sama, hanya cara menulisnya yang berbeda.
SELECT (date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') - INTERVAL '1 day') AT TIME ZONE 'Asia/Jakarta' AS dari,
       date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') AT TIME ZONE 'Asia/Jakarta' AS sampai;

-- Jumlah bacaan kemarin setiap perangkat, dari buku ringkasan per jam readings_per_jam (Modul 18). "sampai" tidak ikut
-- (tanda <), supaya pukul 00.00 hari ini tidak terhitung dua kali (kemarin dan hari ini).
SELECT device_id, sum(jumlah_bacaan) AS bacaan_kemarin
FROM readings_per_jam
WHERE jam >= (date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') - INTERVAL '1 day') AT TIME ZONE 'Asia/Jakarta'
  AND jam <  date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') AT TIME ZONE 'Asia/Jakarta'
GROUP BY device_id
ORDER BY device_id;
