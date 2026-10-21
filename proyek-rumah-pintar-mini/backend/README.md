# Backend Rumah Pintar Mini

🌐 **Bahasa Indonesia** · [English](../../en/mini-smart-home/backend/README.md)

Backend v0.4 proyek Rumah Pintar Mini: server Node.js 24 dengan TypeScript ringan yang mendengarkan semua pesan MQTT `rpm/#`, memeriksa setiap pesan dengan kontrak data 1.3 (skema Zod), menyimpan keadaan terakhir setiap perangkat di memori, mengarsipkan semua pesan ke database PostgreSQL dengan tambahan TimescaleDB (lewat Docker), dan menyediakan API berdokumentasi. Riwayat bacaan bisa diminta mentah atau sudah diringkas per 15 menit, per jam, atau per hari. Sejak Modul 19, bacaan juga mengalir *live* lewat Socket.IO, semua perintah lewat satu pintu (dengan keadaan yang diinginkan dan yang dilaporkan), aturan otomatis dan jadwal disimpan di database dan bisa diubah lewat API tanpa memulai ulang server, setiap kejadian penting dicatat, dan peringatan dikirim lewat Telegram.

## Menjalankan

1. Pasang Node.js 24 LTS dan Docker Desktop.
2. Jalankan database, cukup sekali (ganti `ganti-sandi-ini` dengan sandimu; pakai huruf, angka, dan tanda minus saja):

   ```text
   docker run -d --name rumahpintar-db -p 127.0.0.1:5432:5432 -e POSTGRES_PASSWORD=ganti-sandi-ini -e POSTGRES_DB=rumahpintar -e TIMESCALEDB_TELEMETRY=off -v rumahpintar-data:/var/lib/postgresql/data --restart unless-stopped timescale/timescaledb:2.30.2-pg17
   ```

3. Di folder ini, jalankan `npm install`.
4. Salin `.env.example` menjadi `.env`, lalu isi `MQTT_URL` (alamat broker) dan sandi database di `DATABASE_URL`.
5. Buat tabel-tabelnya dengan `npm run migrasi`.
6. Petugas ringkasan hanya meringkas ulang 3 hari terakhir. Riwayat yang lebih tua dan masuk sekaligus (bacaan yang sudah ada sebelum migrasi `003`, data latihan dari `npm run isi-riwayat`, atau uji beban di bawah) baru tersimpan di buku ringkasan per jam kalau diringkas **sekali** dengan perintah ini, sesudah datanya masuk:

   ```text
   docker exec rumahpintar-db psql -U postgres -d rumahpintar -c "CALL refresh_continuous_aggregate('readings_per_jam', NULL, now() - INTERVAL '1 hour');"
   ```

   Jangan mengulang perintah ini setelah retensi (migrasi `004`) membuang data lama: jendela `NULL` ikut menghapus ringkasan lama yang bacaan mentahnya sudah dibuang.
7. (Tidak wajib) Untuk peringatan Telegram, isi `TELEGRAM_BOT_TOKEN` (token dari @BotFather) dan `TELEGRAM_CHAT_ID` (angka yang dibalas bot saat kamu mengirim `/start`) di `.env`. Kosong = notifikasi Telegram mati. Token itu rahasia, seperti kata sandi.
8. Jalankan `npm run dev`, lalu buka dokumentasinya di `http://127.0.0.1:8080/docs`.

| Perintah | Gunanya |
| :--- | :--- |
| `npm run dev` | menjalankan server dan memulainya ulang setiap kali kode disimpan |
| `npm start` | menjalankan server tanpa mulai ulang otomatis; **Ctrl + C** menghentikannya dengan rapi (di Windows, `npm run dev` + **Ctrl + C** mematikan server seketika) |
| `npm run cek` | memeriksa tipe TypeScript, termasuk file uji (jalankan sebelum setiap *commit*) |
| `npm test` | menjalankan *unit test* *rules engine* (`src/aturan/*.test.ts`) dengan Vitest |
| `npm run migrasi` | menjalankan file SQL baru di folder `migrasi/` (aman diulang) |
| `npm run isi-riwayat` | mengisi data latihan 7 hari untuk perangkat latihan `f00d00000001` dan `f00d00000002` |

Untuk uji beban, `uji/beban-1-juta.sql` memuat 1.036.801 bacaan palsu (satu setiap 10 detik selama 120 hari) untuk perangkat uji `beef00000001`. Jalankan dari folder ini:

```text
docker cp uji/beban-1-juta.sql rumahpintar-db:/tmp/beban-1-juta.sql
docker exec rumahpintar-db psql -U postgres -d rumahpintar -f /tmp/beban-1-juta.sql
```

## API

| Rute | Gunanya |
| :--- | :--- |
| `GET /health` | server hidup? tersambung ke broker dan database? berapa pesan diterima dan ditolak? |
| `GET /devices` | semua perangkat yang terdengar sejak server menyala |
| `GET /devices/:id/latest` | bacaan `telemetry` terbaru satu perangkat |
| `GET /devices/:id/vitals` | kesehatan terakhir satu perangkat |
| `GET /devices/:id/readings?from=…&to=…` | riwayat bacaan mentah dari database (bawaan: satu jam terakhir; paling banyak 1.000 bacaan) |
| `GET /devices/:id/readings?bucket=15m\|1h\|1d&from=…&to=…` | ringkasan riwayat per 15 menit, per jam, atau per hari WIB (bawaan: 1 hari, 7 hari, atau 30 hari terakhir; paling banyak 1.000 ember) |
| `POST /devices/:id/command` | kirim perintah `set` ke Node 1, tunggu `ack`-nya paling lama 5 detik, lalu catat di tabel `commands` (dengan `sumber` `api`) |
| `GET /devices/:id/state` | keadaan aktuator: yang diinginkan server (`desired`), yang terakhir dilaporkan perangkat (`reported`, dari `telemetry.state` atau `ack.state`), kapan laporan itu tiba, dan aktuator yang belum cocok (`selisih`) |
| `GET /rules` | semua aturan otomatis yang sedang dipakai server; aturan jadwal ditambah `berikutnya` (UTC) |
| `POST /rules` | buat aturan baru: ambang (`kondisi.jenis` `ambang` + `aksi.jenis` `sakelar`) atau jadwal (`jadwal` + `perintah`); langsung berlaku |
| `PUT /rules/:id` | ganti seluruh isi satu aturan; langsung berlaku tanpa memulai ulang server, dan ambang aturan kipas dikirim ke perangkat sebagai `config` *retained* |
| `POST /rules/:id/jalankan` | jalankan aksi satu aturan jadwal sekarang juga (untuk menguji, tanpa menunggu jamnya) |

Data *live* tersedia lewat **Socket.IO** di alamat yang sama (`/socket.io/`): kirim `ikuti` dengan `device_id` (jawabannya membawa bacaan terakhir) untuk menerima acara `telemetry` perangkat itu; acara `status` dan `kejadian` dikirim ke semua klien. Contoh klien: `alat/terminal-live.js`.

Aturan otomatis disimpan di tabel `rules` sebagai data JSON yang diperiksa Zod. Aturan ambang menyala kalau besarannya **di atas** `nyala_di_atas` terus-menerus selama `selama_detik` detik, lalu padam **di bawah** `padam_di_bawah`. Aturan jadwal memakai cron 5 bidang dan selalu dihitung dalam WIB (`Asia/Jakarta`), apa pun zona waktu laptopnya. Contoh aturan kipas:

```json
{"nama":"Kipas otomatis","aktif":true,
 "kondisi":{"jenis":"ambang","device_id":"a4cf12e5b7c0","besaran":"suhu","nyala_di_atas":30,"padam_di_bawah":28,"selama_detik":120},
 "aksi":{"jenis":"sakelar","device_id":"a4cf12e5b7c0","target":"kipas","kabari":true}}
```

Dengan `bucket`, jawabannya berbentuk `{ device_id, dari, sampai, ember, jumlah, ringkasan: [ { waktu, suhu_rata, suhu_min, suhu_maks, kelembapan_rata, tanah_rata, cahaya_rata, jumlah_bacaan } ] }`. `waktu` adalah awal ember (UTC), dan `dari` dibulatkan ke bawah ke awal ember. Ringkasan per 15 menit dihitung langsung dari bacaan mentah, ringkasan per jam dibaca dari `readings_per_jam`, dan ringkasan per hari menggabungkan ringkasan per jam menjadi hari WIB. Rata-rata hariannya tepat sama dengan hitungan dari bacaan mentah karena setiap jam menyimpan rata-rata dan banyaknya nilai (`suhu_rata` dan `suhu_n`, dan seterusnya).

Koleksi Bruno untuk semua rute ada di folder `bruno/` (pilih *environment* `lokal`).

## Database

Bentuk tabel ditulis sebagai file SQL bernomor di folder `migrasi/`. File yang sudah diterapkan tidak boleh diubah; setiap perubahan baru masuk ke file dengan nomor berikutnya.

| File | Isinya |
| :--- | :--- |
| `001_skema_awal.sql` | tabel `devices`, `readings`, `device_health`, `commands`, `users`, dan `rules` |
| `002_hypertable.sql` | `readings` menjadi hypertable TimescaleDB, dipotong per hari (00.00 UTC) |
| `003_ringkasan_per_jam.sql` | *continuous aggregate* `readings_per_jam` (rata-rata, terendah, tertinggi, dan banyaknya nilai per jam) beserta jadwal pembaruannya (setiap 30 menit, 3 hari terakhir) |
| `004_retensi.sql` | bacaan mentah yang lebih tua daripada 90 hari dibuang setiap hari; ringkasan per jamnya tetap disimpan |
| `005_columnstore.sql` | bacaan yang lebih tua daripada 7 hari dipadatkan per kolom (columnstore) setiap 12 jam |
| `007_aturan_dan_kejadian.sql` | `rules.diubah` dan pemeriksaan bentuk JSON; `commands.sumber` (`api`, `aturan`, `jadwal`, `telegram`), `commands.aturan_id`, dan `commands.state`; tabel buku kejadian `events` (nomor 006 sengaja dilewati: dipakai Tantangan Tingkat 3 Modul 18) |

Contoh: siapa menyalakan kipas hari ini (WIB)?

```sql
SELECT dikirim AT TIME ZONE 'Asia/Jakarta' AS waktu_wib, device_id, sumber, aturan_id, ack_ok
FROM commands
WHERE target = 'kipas' AND nilai = 'true'
  AND dikirim >= date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') AT TIME ZONE 'Asia/Jakarta'
ORDER BY dikirim;
```

`npm run migrasi` juga membuat tabel `schema_migrations` (catatan migrasi yang sudah diterapkan). Tugas terjadwal TimescaleDB dapat dilihat dengan `SELECT * FROM timescaledb_information.jobs WHERE job_id >= 1000;`.

## Backup & restore

Fotokopi seluruh database dibuat **di dalam kontainer** (memakai `pg_dump` yang versinya pasti cocok), lalu disalin ke folder `backup/` (tidak ikut Git):

```text
docker exec rumahpintar-db pg_dump -U postgres -d rumahpintar -Fc -f /tmp/rumahpintar.dump
mkdir backup
docker cp rumahpintar-db:/tmp/rumahpintar.dump backup/rumahpintar-2026-10-20.dump
```

Ganti `2026-10-20` di nama berkas dengan tanggal hari ini supaya backup-backup berikutnya tidak saling menimpa. Pada backup berikutnya, `mkdir backup` boleh dilewati karena foldernya sudah ada.

Perintah di bagian ini sama persis di PowerShell (Windows), Terminal macOS, dan Linux. `pg_dump` menulis satu peringatan *circular foreign-key constraints* (`detail: continuous_agg`) beserta dua `hint`; itu wajar. Jangan membuat berkas dump dengan `>` (misalnya `pg_dump … > berkas.dump`): di Windows PowerShell 5.1 berkasnya rusak, jadi selalu pakai `-f` lalu `docker cp`. Di Git Bash, tulis `//tmp/…` (dua garis miring) karena Git Bash mengubah `/tmp/…` menjadi folder Windows.

Membangun ulang di database baru `rumahpintar_pulih` (di kontainer yang sama; TimescaleDB harus versi yang sama, 2.30.2):

```text
docker cp backup/rumahpintar-2026-10-20.dump rumahpintar-db:/tmp/pulih.dump
docker exec rumahpintar-db createdb -U postgres -T template0 rumahpintar_pulih
docker exec rumahpintar-db psql -U postgres -d rumahpintar_pulih -c "CREATE EXTENSION timescaledb;"
docker exec rumahpintar-db psql -U postgres -d rumahpintar_pulih -c "SELECT timescaledb_pre_restore();"
docker exec rumahpintar-db pg_restore -U postgres -d rumahpintar_pulih /tmp/pulih.dump
docker exec rumahpintar-db psql -U postgres -d rumahpintar_pulih -c "SELECT timescaledb_post_restore();"
```

Jangan memakai `pg_restore -j`, dan jangan melewatkan `timescaledb_pre_restore()` atau `timescaledb_post_restore()`. Untuk membuktikan datanya sama, jalankan dulu `CALL run_job(…);` di `rumahpintar` dengan nomor *job* `Retention Policy` (nomornya terlihat lewat kueri `timescaledb_information.jobs` di bagian Database). Database salinan langsung menjalankan *job* retensinya begitu dipulihkan, jadi database asli harus sudah membuang jilid yang sama. Lalu jalankan kueri ini di psql pada `rumahpintar` dan `rumahpintar_pulih`, dan bandingkan satu barisnya:

```sql
SELECT (SELECT count(*) FROM readings) AS bacaan,
       (SELECT md5(string_agg(md5(r::text), '' ORDER BY r.device_id, r.ts)) FROM readings AS r) AS sidik_jari,
       (SELECT count(*) FROM readings_per_jam) AS ringkasan,
       (SELECT count(*) FROM show_chunks('readings')) AS jilid,
       (SELECT count(*) FROM timescaledb_information.jobs WHERE job_id >= 1000) AS tugas;
```

Setelah terbukti, hapus salinannya dengan `docker exec rumahpintar-db dropdb -U postgres rumahpintar_pulih`.

## Batasan v0.4

- `GET /devices`, `latest`, `vitals`, dan `state` masih dibaca dari memori, jadi kosong lagi setiap server dimulai ulang. Keadaan yang diinginkan (`desired`) dan hitungan "selama" setiap aturan juga hilang saat server dimulai ulang; riwayat bacaan, perintah, aturan, dan kejadian tersimpan permanen di database.
- Bacaan yang datang saat database tidak bisa dihubungi tidak tersimpan.
- Bacaan mentah hanya disimpan 90 hari; yang lebih tua tinggal ringkasan per jamnya.
- Hari pada ringkasan `1d` adalah hari WIB (`Asia/Jakarta`), juga bagi perangkat di WITA atau WIT. Jadwal aturan juga dihitung dalam WIB.
- Aturan dan jadwal hanya berjalan selama backend menyala. Jadwal yang terlambat lebih dari 15 menit (misalnya laptop tidur pukul 06.00) tidak dijalankan belakangan, hanya dicatat; kalau backend mati pada jam itu, tidak ada yang dicatat. Saat broker tak terjangkau, Node 1 menjalankan pengaman kipasnya sendiri dengan ambang dari `config`.
- Perubahan aturan langsung di database (misalnya lewat DBeaver) baru terbaca saat server dimulai ulang atau saat aturan lain diubah lewat API; pakai API `/rules`.
- Server hanya menerima tamu dari laptop ini (`127.0.0.1`) karena API dan Socket.IO belum punya *login*.
