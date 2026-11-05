-- beban-1-juta.sql - uji beban Modul 18: bacaan palsu setiap 10 detik selama 120 hari terakhir
-- untuk perangkat uji beef00000001, yaitu 120 x 8.640 + 1 = 1.036.801 bacaan ("sejuta baris").
-- Bacaan terakhir jatuh pada menit penuh terakhir, jadi detiknya selalu :00, :10, ..., :50.
-- Angkanya mengikuti pola harian (siang lebih panas dan terang, malam lebih lembap) ditambah sedikit "dadu".
-- Dadunya berbenih (setseed), jadi urutan angka acaknya sama di laptop siapa pun.
-- Cukup dijalankan sekali: kalau perangkat uji sudah punya bacaan, INSERT yang kedua dilewati.
-- Dijalankan dengan psql di dalam kontainer database (lihat README modul, Praktik 4).
\timing on

-- perangkat uji dulu supaya bacaannya lolos aturan kunci tamu (readings -> devices)
INSERT INTO devices (device_id, jenis, nama, lokasi)
VALUES ('beef00000001', 'node1', 'Uji beban', 'lab')
ON CONFLICT (device_id) DO NOTHING;

SELECT setseed(0.18);  -- benih dadu: urutan angka random() sesudah ini selalu sama

INSERT INTO readings (device_id, ts, fw, suhu, kelembapan, cahaya, tanah, gerak, level_air)
SELECT 'beef00000001', ts, '1.4.0',
       round((27 + 4 * sin(pi() * (jam - 9) / 12) + random() - 0.5)::numeric, 1),  -- 22,5-31,5 derajat, terpanas pukul 15.00
       round(75 - 10 * sin(pi() * (jam - 9) / 12) + 4 * (random() - 0.5)),         -- 63-87 persen, kebalikan suhu
       round(greatest(0, 3400 * sin(pi() * (jam - 6) / 12)) + 60 * random()),      -- gelap di malam hari, paling terang pukul 12.00
       round(68 - 1.5 * mod(jam + 6, 12) + random()),                               -- disiram pukul 06.00 dan 18.00, lalu mengering
       random() < 0.1,                                                              -- sesekali ada yang lewat
       round(90 - 2 * jam)                                                          -- tandon penuh pukul 00.00, lalu surut
FROM (SELECT ts, extract(epoch FROM (ts AT TIME ZONE 'Asia/Jakarta')::time) / 3600 AS jam  -- jam WIB berkoma: 0 - 23,99
      FROM generate_series(date_trunc('minute', now()) - INTERVAL '120 days',  -- dari menit penuh 120 hari lalu
                           date_trunc('minute', now()),                       -- sampai menit penuh terakhir
                           INTERVAL '10 seconds') AS ts) AS waktu
WHERE NOT EXISTS (SELECT 1 FROM readings WHERE device_id = 'beef00000001');  -- sudah pernah dimuat? lewati

ANALYZE readings;  -- perbarui statistik supaya perencana kueri tahu ada sejuta baris baru

SELECT count(*) AS bacaan_uji FROM readings WHERE device_id = 'beef00000001';
