-- pengguna-grafana.sql - akun database KHUSUS Grafana yang hanya bisa MEMBACA (Modul 25).
-- Sejak Modul 26 dijalankan otomatis oleh layanan sekali-jalan akun-grafana (compose.cloud.yml) bila grafana_baca belum ada.
-- Setiap docker compose up, layanan itu juga menyamakan sandinya dengan GRAFANA_BACA_SANDI di .env. Berkas ini sengaja TANPA
-- sandi, supaya sandi tidak pernah tersimpan di Git. Cara Modul 25 (tanpa Compose, kini hanya sejarah): jalankan SEKALI di
-- psql sebagai postgres, lalu ketik sandinya dengan \password grafana_baca (grafana/README.md, Sebelum Modul 26).
-- Dua lapis pengaman: (1) setiap transaksi akun ini hanya-baca, (2) izinnya hanya SELECT pada tabel dan kolom di bawah.

CREATE ROLE grafana_baca LOGIN CONNECTION LIMIT 5;              -- boleh masuk, paling banyak 5 sambungan sekaligus
ALTER ROLE grafana_baca SET default_transaction_read_only = on;  -- setiap transaksinya hanya-baca
ALTER ROLE grafana_baca SET statement_timeout = '10s';           -- kueri panel yang kebablasan dihentikan sesudah 10 detik
GRANT CONNECT ON DATABASE rumahpintar TO grafana_baca;
GRANT USAGE ON SCHEMA public TO grafana_baca;
GRANT SELECT ON readings, readings_per_jam, device_health, events, commands TO grafana_baca;
-- devices: hanya kolom-kolom ini, TANPA kunci_hash dan kunci_dibuat (sidik jari kunci perangkat tidak perlu dilihat Grafana).
-- Akibatnya SELECT * FROM devices ditolak (permission denied): di Grafana, selalu tulis nama kolomnya.
GRANT SELECT (device_id, jenis, nama, lokasi, lat, lng, status, terakhir_dilihat, dibuat, terdaftar, dicabut, penghubung)
  ON devices TO grafana_baca;
-- users, sesi, rules, schema_migrations: TIDAK diberikan (sidik jari sandi dan token sesi tidak boleh terbaca Grafana)
