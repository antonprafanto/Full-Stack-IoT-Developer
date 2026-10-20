# Backend Rumah Pintar Mini

🌐 **Bahasa Indonesia** · [English](../../../../en/phase-3-backend-data/module-17-sql-and-database-schema/code/backend/README.md)

Backend v0.2 proyek Rumah Pintar Mini: server Node.js 24 dengan TypeScript ringan yang mendengarkan semua pesan MQTT `rpm/#`, memeriksa setiap pesan dengan kontrak data 1.2 (skema Zod), menyimpan keadaan terakhir setiap perangkat di memori, mengarsipkan semua pesan ke database PostgreSQL (image TimescaleDB, lewat Docker), dan menyediakan API berdokumentasi.

## Menjalankan

1. Pasang Node.js 24 LTS dan Docker Desktop.
2. Jalankan database, cukup sekali (ganti `ganti-sandi-ini` dengan sandimu; pakai huruf, angka, dan tanda minus saja):

   ```text
   docker run -d --name rumahpintar-db -p 127.0.0.1:5432:5432 -e POSTGRES_PASSWORD=ganti-sandi-ini -e POSTGRES_DB=rumahpintar -e TIMESCALEDB_TELEMETRY=off -v rumahpintar-data:/var/lib/postgresql/data --restart unless-stopped timescale/timescaledb:2.30.2-pg17
   ```

3. Di folder ini, jalankan `npm install`.
4. Salin `.env.example` menjadi `.env`, lalu isi `MQTT_URL` (alamat broker) dan sandi database di `DATABASE_URL`.
5. Buat tabel-tabelnya dengan `npm run migrasi`.
6. Jalankan `npm run dev`, lalu buka dokumentasinya di `http://127.0.0.1:8080/docs`.

| Perintah | Gunanya |
| :--- | :--- |
| `npm run dev` | menjalankan server dan memulainya ulang setiap kali kode disimpan |
| `npm start` | menjalankan server tanpa mulai ulang otomatis |
| `npm run cek` | memeriksa tipe TypeScript (jalankan sebelum setiap *commit*) |
| `npm run migrasi` | menjalankan file SQL baru di folder `migrasi/` (aman diulang) |
| `npm run isi-riwayat` | mengisi data latihan 7 hari untuk perangkat latihan `f00d00000001` dan `f00d00000002` |

## API

| Rute | Gunanya |
| :--- | :--- |
| `GET /health` | server hidup? tersambung ke broker dan database? berapa pesan diterima dan ditolak? |
| `GET /devices` | semua perangkat yang terdengar sejak server menyala |
| `GET /devices/:id/latest` | bacaan `telemetry` terbaru satu perangkat |
| `GET /devices/:id/vitals` | kesehatan terakhir satu perangkat |
| `GET /devices/:id/readings?from=…&to=…` | riwayat bacaan dari database (bawaan: satu jam terakhir; paling banyak 1.000 bacaan) |
| `POST /devices/:id/command` | kirim perintah `set` ke Node 1, tunggu `ack`-nya paling lama 5 detik, lalu catat di tabel `commands` |

Koleksi Bruno untuk semua rute ada di folder `bruno/` (pilih *environment* `lokal`).

## Database

Bentuk tabel ditulis sebagai file SQL bernomor di folder `migrasi/`. File yang sudah diterapkan tidak boleh diubah; setiap perubahan baru masuk ke file dengan nomor berikutnya. Tabelnya: `devices`, `readings`, `device_health`, `commands`, `users` dan `rules` (disiapkan untuk modul berikutnya), serta `schema_migrations` (catatan migrasi yang sudah diterapkan).

## Batasan v0.2

- `GET /devices`, `latest`, dan `vitals` masih dibaca dari memori, jadi kosong lagi setiap server dimulai ulang. Riwayat bacaan dan perintah tersimpan permanen di database.
- Bacaan yang datang saat database tidak bisa dihubungi tidak tersimpan.
- Server hanya menerima tamu dari laptop ini (`127.0.0.1`) karena API belum punya *login*.
