# Backend Rumah Pintar Mini

Backend v0.1 proyek Rumah Pintar Mini: server Node.js 24 dengan TypeScript ringan yang mendengarkan semua pesan MQTT `rpm/#`, memeriksa setiap pesan dengan kontrak data 1.2 (skema Zod), menyimpan keadaan terakhir setiap perangkat di memori, dan menyediakan API berdokumentasi.

## Menjalankan

1. Pasang Node.js 24 LTS.
2. Di folder ini, jalankan `npm install`.
3. Salin `.env.example` menjadi `.env`, lalu isi `MQTT_URL` dengan alamat broker.
4. Jalankan `npm run dev`, lalu buka dokumentasinya di `http://127.0.0.1:8080/docs`.

| Perintah | Gunanya |
| :--- | :--- |
| `npm run dev` | menjalankan server dan memulainya ulang setiap kali kode disimpan |
| `npm start` | menjalankan server tanpa mulai ulang otomatis |
| `npm run cek` | memeriksa tipe TypeScript (jalankan sebelum setiap *commit*) |

## API

| Rute | Gunanya |
| :--- | :--- |
| `GET /health` | server hidup? tersambung ke broker? berapa pesan diterima dan ditolak? |
| `GET /devices` | semua perangkat yang pernah terdengar |
| `GET /devices/:id/latest` | bacaan `telemetry` terbaru satu perangkat |
| `GET /devices/:id/vitals` | kesehatan terakhir satu perangkat |
| `POST /devices/:id/command` | kirim perintah `set` ke Node 1, lalu tunggu `ack`-nya paling lama 5 detik |

Koleksi Bruno untuk semua rute ada di folder `bruno/` (pilih *environment* `lokal`).

## Batasan v0.1

- Data hanya disimpan di memori, jadi hilang saat server dimatikan. Database menyusul.
- Server hanya menerima tamu dari laptop ini (`127.0.0.1`) karena API belum punya *login*.
