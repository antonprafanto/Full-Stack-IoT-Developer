-- 001_skema_awal.sql - skema awal database Rumah Pintar Mini (Modul 17).
-- Satu tabel untuk setiap jenis data. Semua waktu bertipe timestamptz: disimpan dalam UTC, ditampilkan sesuai zona sesi.

-- Perangkat yang pernah terdengar. Baris dibuat otomatis oleh backend saat pesan pertamanya tiba.
CREATE TABLE devices (
  device_id        text PRIMARY KEY CHECK (device_id ~ '^[0-9a-f]{12}$'),
  jenis            text NOT NULL DEFAULT 'belum-diketahui' CHECK (jenis IN ('node1', 'node2', 'belum-diketahui')),
  nama             text,             -- nama yang mudah diingat, misalnya 'Node 1 ruang tamu' (diisi manusia)
  lokasi           text,             -- misalnya 'ruang tamu' atau 'kebun belakang'
  lat              double precision CHECK (lat BETWEEN -90 AND 90),
  lng              double precision CHECK (lng BETWEEN -180 AND 180),
  status           text NOT NULL DEFAULT 'belum-diketahui',
  terakhir_dilihat timestamptz,      -- waktu server saat pesan terakhir perangkat ini tiba
  dibuat           timestamptz NOT NULL DEFAULT now()
);

-- Satu baris untuk setiap pesan telemetry. Kolom yang tidak dimiliki perangkat berisi NULL.
CREATE TABLE readings (
  device_id   text NOT NULL REFERENCES devices (device_id),
  ts          timestamptz NOT NULL,                -- waktu bacaan dari perangkat (kontrak bagian 4)
  diterima    timestamptz NOT NULL DEFAULT now(),  -- waktu pesan tiba di backend
  fw          text NOT NULL,
  suhu        double precision,
  kelembapan  integer,
  cahaya      integer,
  tanah       integer,
  gerak       boolean,
  level_air   integer,
  tekanan     double precision,
  suhu_tanah  double precision,
  baterai     double precision,
  tanah_rs485 double precision,
  ec          integer,
  PRIMARY KEY (device_id, ts)                      -- satu bacaan per perangkat per waktu: kiriman ganda tertolak
);

-- Kesehatan perangkat dari pesan vitals (kontrak bagian 6).
CREATE TABLE device_health (
  device_id text NOT NULL REFERENCES devices (device_id),
  ts        timestamptz NOT NULL,
  rssi      integer NOT NULL,
  uptime_s  integer NOT NULL,
  heap_free integer NOT NULL,
  PRIMARY KEY (device_id, ts)
);

-- Setiap perintah dari API beserta jawaban ack-nya (kontrak bagian 7-8).
CREATE TABLE commands (
  id        text PRIMARY KEY,                      -- id perintah, misalnya c-20261020-041128-1
  device_id text NOT NULL REFERENCES devices (device_id),
  dikirim   timestamptz NOT NULL DEFAULT now(),
  target    text NOT NULL,
  nilai     jsonb NOT NULL,                        -- true/false untuk lampu dan kipas, angka untuk pompa dan tirai
  ack_ok    boolean,                               -- NULL = tidak ada ack dalam 5 detik
  ack_pesan text,
  lama_ms   integer
);

-- Disiapkan sekarang, dipakai nanti: akun pengguna (Modul 20 menambah sandi dan login).
CREATE TABLE users (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email  text NOT NULL UNIQUE,
  nama   text NOT NULL,
  peran  text NOT NULL DEFAULT 'viewer' CHECK (peran IN ('admin', 'viewer')),
  dibuat timestamptz NOT NULL DEFAULT now()
);

-- Disiapkan sekarang, dipakai nanti: aturan otomatis (Modul 19), misalnya "suhu di atas 30 -> kipas nyala".
CREATE TABLE rules (
  id      integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nama    text NOT NULL,
  aktif   boolean NOT NULL DEFAULT true,
  kondisi jsonb NOT NULL,
  aksi    jsonb NOT NULL,
  dibuat  timestamptz NOT NULL DEFAULT now()
);
