-- 011_ota_dan_armada.sql - pembaruan firmware lewat udara (OTA), data armada, dan pendaftaran dengan kode klaim (Modul 28).
-- Berkas ini hanya MENAMBAH: tabel baru, dan kolom baru yang boleh kosong atau punya nilai bawaan. Backend 1.4.0 tetap bisa
-- berjalan di atas skema ini (jalan mundur: image 1.4.0 dinyalakan lagi tanpa menghapus apa pun).

-- 1) Rilis firmware yang diunggah admin (berkas .bin-nya di lemari data-firmware, bukan di database). Node 2 (ESP-NOW)
--    tidak diperbarui lewat udara di jalur utama, jadi jenisnya hanya node1. Satu versi = satu berkas yang tidak boleh
--    ditimpa: firmware yang berubah selalu mendapat nomor versi baru.
CREATE TABLE firmware (
  jenis      text NOT NULL CHECK (jenis IN ('node1')),
  -- SemVer x.y.z TANPA nol di depan (1.07.1 ditolak: sebagai angka sama dengan 1.7.1, sebagai teks berbeda), paling banyak
  -- 5 angka per bagian; pola yang sama dengan POLA_VERSI_RILIS di src/services/versi.ts
  versi      text NOT NULL CHECK (versi ~ '^(0|[1-9][0-9]{0,4})\.(0|[1-9][0-9]{0,4})\.(0|[1-9][0-9]{0,4})$'),
  ukuran     integer NOT NULL CHECK (ukuran > 0 AND ukuran <= 1966080),    -- paling besar = satu rak program Minimal SPIFFS
  sha256     text NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),             -- sidik jari isi berkas, dihitung server saat unggah
  catatan    text CHECK (length(catatan) <= 200),                          -- misalnya "sapaan versi baru di OLED"
  uji        boolean NOT NULL DEFAULT false,  -- rilis UJI (misalnya 1.7.2 yang sengaja rusak): hanya untuk satu perangkat
  pengunggah text,                            -- nomor akun admin yang mengunggah
  dibuat     timestamptz NOT NULL DEFAULT now(),
  ditarik    timestamptz,                     -- rilis buruk yang ditarik admin: tidak dikirim dan tidak bisa diunduh lagi
  PRIMARY KEY (jenis, versi)
);

-- 2) Keadaan terakhir setiap perangkat, supaya halaman /armada tidak perlu memindai seluruh riwayat.
ALTER TABLE devices
  ADD COLUMN fw            text CHECK (fw ~ '^\d+\.\d+\.\d+$'),   -- versi firmware yang terakhir DILAPORKAN perangkat
  ADD COLUMN fw_dilihat    timestamptz,                         -- kapan versi itu terakhir dilaporkan (jam server)
  ADD COLUMN reset_reason  text
             CHECK (reset_reason IN ('POWERON', 'BROWNOUT', 'SW', 'PANIC', 'WDT', 'DEEPSLEEP', 'UNKNOWN')),
  ADD COLUMN canary        boolean NOT NULL DEFAULT false,      -- perangkat uji: menerima rilis baru lebih dulu
  ADD COLUMN jeda_vitals_s integer CHECK (jeda_vitals_s BETWEEN 60 AND 3600);  -- NULL = belum diatur (firmware: 300 detik)

-- isi awal fw dari riwayat: versi pada bacaan TERBARU setiap perangkat (Node 2: versi yang dibawa paketnya). LATERAL +
-- LIMIT 1 memakai indeks (device_id, ts) tabel readings, jadi tetap cepat walaupun riwayatnya jutaan baris.
UPDATE devices d SET fw = r.fw, fw_dilihat = r.diterima
FROM devices d2
CROSS JOIN LATERAL (SELECT fw, diterima FROM readings WHERE device_id = d2.device_id ORDER BY ts DESC LIMIT 1) r
WHERE d.device_id = d2.device_id AND r.fw ~ '^\d+\.\d+\.\d+$';

-- 3) vitals membawa alasan restart dan versi firmware (kontrak 1.6, firmware 1.7.0 ke atas). Baris lama tetap NULL.
ALTER TABLE device_health
  ADD COLUMN reset_reason text
             CHECK (reset_reason IN ('POWERON', 'BROWNOUT', 'SW', 'PANIC', 'WDT', 'DEEPSLEEP', 'UNKNOWN')),
  ADD COLUMN fw           text CHECK (fw ~ '^\d+\.\d+\.\d+$');

-- 4) Riwayat pembaruan: satu baris = satu perintah update ke satu perangkat (id = id perintahnya, c-20261031-...).
--    Status berjalan: dikirim (cmd terbit) -> diterima (ack ok:true) -> mengunduh (perangkat mengambil berkasnya).
--    Status akhir: ditolak (ack ok:false), berhasil, rollback (firmware baru gagal dan perangkat kembali sendiri ke versi
--    lama), gagal (unduh/pemeriksaan gagal, versi lama tetap jalan), kedaluwarsa (tanpa kabar terlalu lama).
CREATE TABLE pembaruan (
  id         text PRIMARY KEY,
  device_id  text NOT NULL REFERENCES devices (device_id),
  jenis      text NOT NULL DEFAULT 'node1',
  dari_versi text CHECK (dari_versi ~ '^\d+\.\d+\.\d+$'),        -- NULL = versi lama belum pernah dilaporkan
  ke_versi   text NOT NULL,
  canary     boolean NOT NULL DEFAULT false,  -- perangkat ini canary SAAT perintahnya dikirim (syarat "perbarui semua")
  status     text NOT NULL DEFAULT 'dikirim'
             CHECK (status IN ('dikirim', 'diterima', 'mengunduh', 'ditolak', 'berhasil', 'rollback', 'gagal', 'kedaluwarsa')),
  pesan      text,                            -- alasan dari perangkat (ack atau laporan vitals.ota) atau dari server
  oleh       text,                            -- nomor akun admin yang menekan tombol
  dibuat     timestamptz NOT NULL DEFAULT now(),
  diperbarui timestamptz NOT NULL DEFAULT now(),
  selesai    timestamptz,                     -- terisi begitu statusnya berstatus akhir
  FOREIGN KEY (jenis, ke_versi) REFERENCES firmware (jenis, versi),
  CHECK ((selesai IS NULL) = (status IN ('dikirim', 'diterima', 'mengunduh')))
);
CREATE INDEX pembaruan_perangkat_idx ON pembaruan (device_id, dibuat DESC);
-- paling banyak SATU pembaruan yang masih berjalan per perangkat: pembaruan kedua ditolak database sendiri
CREATE UNIQUE INDEX pembaruan_satu_berjalan ON pembaruan (device_id) WHERE status IN ('dikirim', 'diterima', 'mengunduh');

-- 5) Kode klaim sekali pakai untuk mendaftarkan perangkat baru dalam satu menit. Database hanya menyimpan SHA-256 kodenya,
--    seperti kunci perangkat (Modul 21): kodenya sendiri hanya tampil sekali kepada admin.
CREATE TABLE kode_klaim (
  kode_hash   text PRIMARY KEY CHECK (kode_hash ~ '^[0-9a-f]{64}$'),
  nama        text CHECK (length(nama) <= 60),   -- nama dan lokasi yang langsung dipakai perangkat yang mengklaim
  lokasi      text CHECK (length(lokasi) <= 60),
  oleh        text,                              -- nomor akun admin pembuatnya
  dibuat      timestamptz NOT NULL DEFAULT now(),
  kedaluwarsa timestamptz NOT NULL,
  dipakai     timestamptz,                       -- kapan ditukar dengan kunci; NULL = belum dipakai
  device_id   text REFERENCES devices (device_id),
  CHECK ((dipakai IS NULL) = (device_id IS NULL)),
  CHECK (kedaluwarsa > dibuat AND kedaluwarsa <= dibuat + interval '60 minutes')
);

-- 6) Jenis kejadian baru di buku kejadian (Modul 19): ota, provisioning (perangkat mendaftar lewat kode klaim), dan
--    dicabut (perangkat dinonaktifkan admin). Nama batasan lama memang events_jenis_check (nama bawaan PostgreSQL).
ALTER TABLE events DROP CONSTRAINT events_jenis_check;
ALTER TABLE events ADD CONSTRAINT events_jenis_check
  CHECK (jenis IN ('aturan', 'aturan-diubah', 'jadwal', 'status', 'mode-offline', 'perintah', 'ota', 'provisioning', 'dicabut'));
