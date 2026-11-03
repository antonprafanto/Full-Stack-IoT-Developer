-- sidik-jari.sql - "sidik jari" riwayat Rumah Pintar Mini (Modul 26): satu baris angka untuk membuktikan bahwa riwayat
-- di database TIDAK hilang dan TIDAK berubah sesudah dipindah ke Docker Compose (Praktik 1 dan 4) atau sesudah
-- "docker compose down" lalu "up" (Praktik 8). Dasarnya kueri Modul 18 Praktik 7.2, ditambah jumlah akun dan perangkat.
--
-- Jalankan SEBELUM dan SESUDAH, dengan backend dan simulator mati (tidak ada bacaan baru di antaranya), dari akar proyek.
-- Simpan keluarannya ke berkas, lalu bandingkan:
--   Linux, macOS, Pi (bash/zsh):
--     docker compose exec -T db psql -U postgres -d rumahpintar < skrip/sidik-jari.sql
--   PowerShell (Windows; tidak diuji penulis):
--     Get-Content skrip/sidik-jari.sql | docker compose exec -T db psql -U postgres -d rumahpintar
--   Sebelum Modul 26 (kontainer lama rumahpintar-db): ganti "docker compose exec -T db" dengan "docker exec -i rumahpintar-db".
-- (-T / -i = isi berkas ini dikirim ke psql lewat masukan standar, tanpa layar terminal di kontainer.)
--
-- Yang menentukan: kolom bacaan dan sidik_jari HARUS sama persis (juga akun dan perangkat). Kolom ringkasan boleh
-- berbeda tanpa ada data yang hilang: tugas latar TimescaleDB (lihat kolom tugas) bisa meringkas ulang buku ringkasan per
-- jam di antara dua pengukuran.
SELECT (SELECT count(*) FROM readings) AS bacaan,
       (SELECT md5(string_agg(md5(r::text), '' ORDER BY r.device_id, r.ts)) FROM readings AS r) AS sidik_jari,
       (SELECT count(*) FROM readings_per_jam) AS ringkasan,
       (SELECT count(*) FROM show_chunks('readings')) AS jilid,
       (SELECT count(*) FROM timescaledb_information.jobs WHERE job_id >= 1000) AS tugas,
       (SELECT count(*) FROM users) AS akun,
       (SELECT count(*) FROM devices) AS perangkat;
