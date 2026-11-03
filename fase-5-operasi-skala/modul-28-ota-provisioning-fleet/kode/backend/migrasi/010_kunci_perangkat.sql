-- 010_kunci_perangkat.sql - daftar resmi perangkat dan kuncinya (Modul 21). Sampai Modul 20, baris devices dibuat otomatis
-- untuk perangkat APA PUN yang mengirim pesan. Mulai Modul 21, perangkat harus didaftarkan admin (POST /devices); pesan dari
-- perangkat yang belum terdaftar atau sudah dicabut diabaikan backend.
-- Nomor 009 sengaja dilewati: 009_pengguna_di_perintah.sql adalah Tantangan Tingkat 3 Modul 20 yang mungkin sudah kamu buat.

-- Kunci perangkat (32 byte acak) hanya ditampilkan SEKALI saat dibuat; database menyimpan SHA-256-nya saja (64 huruf
-- heksadesimal), sama seperti refresh token di Modul 20. Perangkat ESP-NOW (Node 2) tidak tersambung ke broker, jadi tidak
-- punya kunci: datanya diterbitkan perangkat penghubungnya (Node 1).
ALTER TABLE devices
  ADD COLUMN terdaftar    timestamptz,                                 -- kapan didaftarkan admin; NULL = belum terdaftar
  ADD COLUMN kunci_hash   text CHECK (kunci_hash ~ '^[0-9a-f]{64}$'),  -- SHA-256 kunci yang berlaku sekarang
  ADD COLUMN kunci_dibuat timestamptz,                                 -- kapan kunci itu dibuat (registrasi atau ganti kunci)
  ADD COLUMN dicabut      timestamptz,                                 -- kapan dicabut; NULL = boleh mengirim data
  ADD COLUMN penghubung   text REFERENCES devices (device_id),         -- perangkat yang menerbitkan datanya (Node 2 -> Node 1)
  ADD CONSTRAINT devices_kunci_lengkap CHECK ((kunci_hash IS NULL) = (kunci_dibuat IS NULL)),
  ADD CONSTRAINT devices_penghubung_tanpa_kunci CHECK (penghubung IS NULL OR kunci_hash IS NULL),
  ADD CONSTRAINT devices_bukan_penghubung_sendiri CHECK (penghubung <> device_id),
  ADD CONSTRAINT devices_dicabut_tanpa_kunci CHECK (dicabut IS NULL OR kunci_hash IS NULL);

-- Baris lama (dibuat otomatis Modul 17-20) tetap ada beserta riwayatnya, tetapi belum terdaftar: data barunya diabaikan sampai
-- admin mendaftarkan device_id itu (riwayatnya tidak hilang).
