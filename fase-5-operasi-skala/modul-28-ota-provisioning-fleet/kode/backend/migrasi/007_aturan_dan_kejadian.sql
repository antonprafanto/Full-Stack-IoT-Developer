-- 007_aturan_dan_kejadian.sql - aturan otomatis bisa diubah lewat API, setiap perintah mencatat siapa yang menyuruh,
-- dan buku kejadian "siapa menyalakan apa, kapan" (Modul 19).
-- Nomor 006 sengaja dilewati: 006_device_health.sql adalah Tantangan Tingkat 3 Modul 18 yang mungkin sudah kamu buat.

-- Tabel rules sudah disiapkan sejak Modul 17 (migrasi 001). Kini dicatat kapan terakhir diubah, dan kondisi serta aksi
-- wajib berupa objek JSON { ... }.
ALTER TABLE rules
  ADD COLUMN diubah timestamptz NOT NULL DEFAULT now(),
  ADD CONSTRAINT rules_kondisi_objek CHECK (jsonb_typeof(kondisi) = 'object'),
  ADD CONSTRAINT rules_aksi_objek CHECK (jsonb_typeof(aksi) = 'object');

-- Setiap perintah kini mencatat siapa yang menyuruh. Perintah lama semuanya dari API, jadi bawaannya 'api'.
ALTER TABLE commands
  ADD COLUMN sumber    text NOT NULL DEFAULT 'api' CHECK (sumber IN ('api', 'aturan', 'jadwal', 'telegram')),
  ADD COLUMN aturan_id integer REFERENCES rules (id) ON DELETE SET NULL, -- aturan yang menyuruh (kalau ada)
  ADD COLUMN state     jsonb;                                            -- ack.state; NULL = tidak ada ack

-- Buku kejadian: satu baris untuk setiap hal yang perlu diketahui manusia.
CREATE TABLE events (
  id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  waktu     timestamptz NOT NULL DEFAULT now(),
  device_id text REFERENCES devices (device_id),  -- NULL untuk kejadian yang bukan milik satu perangkat
  jenis     text NOT NULL
            CHECK (jenis IN ('aturan', 'aturan-diubah', 'jadwal', 'status', 'mode-offline', 'perintah')),
  sumber    text NOT NULL,                        -- api, aturan, jadwal, telegram, atau perangkat
  aturan_id integer REFERENCES rules (id) ON DELETE SET NULL,
  pesan     text NOT NULL,                        -- kalimat untuk manusia, sama dengan pesan Telegram-nya
  data      jsonb                                 -- rincian mentah: bacaan, perintah, hasil
);
CREATE INDEX events_waktu_idx ON events (waktu DESC);
