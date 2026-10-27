-- 008_login_dan_sesi.sql - akun bisa login (Modul 20): sidik jari kata sandi (hash bcrypt) di tabel users, dan tabel sesi
-- untuk refresh token. Satu baris sesi = satu login yang masih aktif di satu browser atau perangkat.

-- Tabel users sudah disiapkan sejak Modul 17 (migrasi 001), tetapi belum punya kata sandi. Yang disimpan hanya sidik
-- jarinya (hash bcrypt, 60 huruf, diawali $2b$). Akun yang sandi_hash-nya kosong (NULL) tidak bisa login.
-- Email selalu disimpan dengan huruf kecil, jadi Budi@Rumah.test dan budi@rumah.test adalah akun yang sama.
ALTER TABLE users
  ADD COLUMN sandi_hash   text CHECK (sandi_hash ~ '^\$2[aby]\$\d\d\$[./A-Za-z0-9]{53}$'),
  ADD COLUMN sandi_diubah timestamptz,
  ADD CONSTRAINT users_email_huruf_kecil CHECK (email = lower(email));

-- Login yang masih aktif. Refresh token aslinya (32 byte acak) hanya ada di cookie browser; database menyimpan SHA-256-nya,
-- jadi orang yang mencuri isi database tidak bisa memakainya. Setiap POST /auth/refresh menukar token lama dengan token
-- baru (rotasi): token_hash diganti, token sebelumnya dipindah ke token_lama. Kalau token_lama dipakai lagi, besar
-- kemungkinan token itu dicuri, jadi sesinya dihapus (semua yang memakai sesi itu harus login ulang).
CREATE TABLE sesi (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pengguna_id integer NOT NULL REFERENCES users (id) ON DELETE CASCADE, -- akun dihapus = semua sesinya ikut terhapus
  token_hash  text NOT NULL UNIQUE,                                      -- SHA-256 refresh token yang berlaku sekarang
  token_lama  text,                                                      -- SHA-256 refresh token sebelumnya
  dibuat      timestamptz NOT NULL DEFAULT now(),                        -- kapan login
  diperbarui  timestamptz NOT NULL DEFAULT now(),                        -- kapan terakhir di-refresh (rotasi)
  kedaluwarsa timestamptz NOT NULL                                       -- 7 hari setelah login: sesudah itu login lagi
);
CREATE INDEX sesi_pengguna_idx ON sesi (pengguna_id);
CREATE INDEX sesi_token_lama_idx ON sesi (token_lama);
