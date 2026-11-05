# Backend Rumah Pintar Mini

🌐 **Bahasa Indonesia** · [English](../../../../en/mini-smart-home/backend/README.md)

Backend 2.0 proyek Rumah Pintar Mini: server Node.js 24 dengan TypeScript ringan yang mendengarkan semua pesan MQTT `rpm/#`, memeriksa setiap pesan dengan kontrak data 1.6 (skema Zod; pesan bentuk lama tetap sah), menyimpan keadaan terakhir setiap perangkat di memori, mengarsipkan semua pesan ke database PostgreSQL dengan tambahan TimescaleDB (lewat Docker), dan menyediakan API berdokumentasi. Riwayat bacaan bisa diminta mentah atau sudah diringkas per 15 menit, per jam, atau per hari. Sejak Modul 19, bacaan juga mengalir *live* lewat Socket.IO, semua perintah lewat satu pintu (dengan keadaan yang diinginkan dan yang dilaporkan), aturan otomatis dan jadwal disimpan di database dan bisa diubah lewat API tanpa memulai ulang server, setiap kejadian penting dicatat, dan peringatan dikirim lewat Telegram. Sejak Modul 20, API dan Socket.IO **berkunci untuk manusia**: tamu harus *login* dulu, akun `viewer` hanya boleh melihat, percobaan *login* dibatasi, dan halaman web lain tidak bisa menyuruh server atas nama pengguna. Sejak Modul 21, backend juga **berkunci untuk perangkat**: hanya perangkat yang didaftarkan admin (dengan kunci per perangkat) yang datanya diproses, pesan dari perangkat yang belum terdaftar atau kuncinya dicabut diabaikan, dan backend sendiri masuk ke broker dengan akunnya sendiri. 🎉 **Checkpoint Fase 3: rumah berkunci untuk manusia dan perangkat.**

**v1.1 (Modul 24)** menambah tiga hal kecil yang dibutuhkan dashboard v1.0: aturan **di bawah ambang** (misalnya siram kalau tanah di bawah 30 %), aturan ambang yang **mengirim perintah sekali** (misalnya pompa 5 detik), dan **hapus aturan** (`DELETE /rules/:id`). Tanpa migrasi database dan tanpa perubahan kontrak data (tetap 1.4); rinciannya di [Catatan versi 1.1](#catatan-versi-11).

**v1.2 (Modul 25)** menambah dua hal untuk peta perangkat dan laporan harian: `GET /devices` kini membawa **titik peta** setiap perangkat (`lat`, `lng`), dan admin memindahkannya lewat `PUT /devices/:id/lokasi`; backend juga mengirim **laporan harian CSV** lewat bot Telegram setiap pagi (bawaan 07.00 WIB, setelan `LAPORAN_JADWAL`), dan `POST /laporan/kirim` mengirimnya sekarang juga. Tanpa migrasi database, tanpa paket npm baru, kontrak data tetap 1.4; rinciannya di [Peta dan laporan harian](#peta-dan-laporan-harian-modul-25) dan [Catatan versi 1.2](#catatan-versi-12).

**v1.3 (Modul 26)** membuat backend bisa berjalan sebagai **kontainer Docker** di `compose.cloud.yml` (akar proyek), bersama database, broker pusat, dashboard, dan Grafana: satu perintah `docker compose up -d` menyalakan semuanya, dan backend yang berhenti sendiri dinyalakan lagi oleh Docker. Isinya kecil: `pino-pretty` pindah ke `dependencies` (dipakai saat server berjalan), skrip npm tidak lagi mogok bila `.env` tidak ada, ketukan `/health` yang berhasil tidak lagi memenuhi log, plus `Dockerfile` dan `.dockerignore`. Tanpa migrasi database, tanpa paket npm baru, kontrak data tetap 1.4; rinciannya di [Catatan versi 1.3](#catatan-versi-13).

**v1.4 (Modul 27)** menyiapkan backend untuk **internet**, di balik Caddy yang memasang HTTPS (VPS atau Raspberry Pi dengan Cloudflare Tunnel): setelan baru `TRUST_PROXY` membuat backend memercayai keterangan Caddy tentang tamunya, jadi *cookie* *login* mendapat atribut `Secure` di halaman `https://` dan pembatas *login* (10 percobaan per menit) menghitung **per tamu**, bukan semua tamu sebagai satu alamat. `CORS_ORIGIN` kini diperiksa bentuknya saat server menyala (alamat dashboard seperti `https://iot.namaanda.my.id`, tanpa `/` di akhir), dan perintah tangan yang tidak dijawab perangkat tidak lagi dikirim ulang diam-diam lama sesudah dashboard melaporkannya gagal (misalnya saat internet rumah putus). Tanpa migrasi database dan tanpa paket npm baru; kontrak data naik ke **1.5** tanpa perubahan bentuk pesan. Rinciannya di [Di internet, di balik Caddy HTTPS](#di-internet-di-balik-caddy-https-modul-27) dan [Catatan versi 1.4](#catatan-versi-14).

**v1.5 (Modul 28)** membuat backend mengurus **armada perangkat**: admin mengunggah berkas firmware `.bin`, lalu memerintahkan Node 1 memperbarui dirinya **lewat udara** (OTA) satu per satu, ke perangkat *canary* dulu, lalu ke semua; perangkat mengunduh berkasnya lewat rute **berkunci** `/fw/node-1/<versi>.bin` (kunci perangkat Modul 21, bukan berkas publik) dan melaporkan hasilnya (`berhasil`, `rollback`, `gagal`) di `vitals`. Halaman `/armada` dashboard membaca `GET /armada` (versi, kesehatan termasuk alasan *restart*, pembaruan terakhir setiap perangkat). Perangkat baru mendaftar sendiri dalam satu menit dengan **kode klaim** sekali pakai buatan admin, akun broker setiap perangkat dibuat dan dihapus **otomatis** lewat plugin *dynamic security* Mosquitto (setelan `AKUN_BROKER_OTOMATIS`), dan perangkat yang hilang bisa **dinonaktifkan**: langsung diputus broker. Migrasi baru `011_ota_dan_armada.sql`, tanpa paket npm baru; kontrak data naik ke **1.6**. Rinciannya di [Pembaruan firmware, armada, dan kode klaim](#pembaruan-firmware-armada-dan-kode-klaim-modul-28) dan [Catatan versi 1.5](#catatan-versi-15).

**2.0.0 (Modul 29)** tidak menambah rute atau tabel. `2.0.0` adalah **satu nomor versi produk** untuk backend dan dashboard (sama dengan tag image dan tag Git `v2.0.0`), dan backend kini **diuji robot** sebelum dipasang otomatis ke VPS dan Pi. `GET /health` menyebut `versi` yang sedang berjalan dan dokumentasi `/docs` memakai nomor yang sama (keduanya dibaca dari `package.json`); rakitan server pindah ke `src/app.ts` (`buatApp()`), supaya **20 *integration test*** dengan database uji (`src/integrasi/`) menguji rakitan yang sama dengan produksi; `npm run lint` (oxlint) ikut memeriksa kode; `Dockerfile` membangun cetakan untuk dua jenis prosesor (amd64 dan arm64) tanpa emulasi. Tanpa migrasi database, tanpa paket produksi baru (oxlint hanya alat pengembang), kontrak data tetap 1.6. Rinciannya di [Diuji dengan database uji](#diuji-dengan-database-uji-modul-29) dan [Catatan versi 2.0](#catatan-versi-20).

Ada dua cara menjalankan backend, dan **hanya satu yang boleh menyala** pada satu waktu (dua backend dengan token Telegram yang sama saling berebut, `409 Conflict`; dua backend juga berebut loket 8080):

| Cara | Kapan | Setelannya dari |
| :--- | :--- | :--- |
| **Mode rumah** (Docker Compose) | sehari-hari: rumah menyala, dashboard di `http://localhost` | `.env` di **akar proyek** (contohnya `.env.example` akar) |
| **Mode kembang** (`npm run dev`) | saat mengubah kode backend | `backend/.env` (contohnya `backend/.env.example` di folder ini) |

## Menjalankan dengan Docker Compose (Modul 26)

Semua perintah di bagian ini diketik dari **akar proyek** (folder yang berisi `compose.cloud.yml`), sama di PowerShell, Terminal macOS, dan Linux. Langkah lengkapnya, termasuk memindahkan database dan Grafana lama ke Compose tanpa kehilangan data, ada di [Modul 26](../../../modul-26-docker-compose/README.md).

1. Salin `.env.example` (akar) menjadi `.env`, lalu isi rahasianya dan `TOKO_IMAGE` (`ghcr.io/` + nama akun GitHub-mu dalam huruf kecil; bukan rahasia). Pindah dari Modul 25: `POSTGRES_PASSWORD` = sandi postgres **lama**-mu (lemari `rumahpintar-data` sudah menyimpannya). Di Linux, macOS, dan Pi: `chmod 600 .env`.
2. Laptop baru saja (lemari Modul 17 dan 25 belum ada): `docker volume create rumahpintar-data` dan `docker volume create rumahpintar-grafana-data`.
3. `docker compose up -d`. Pertama kali, Compose menarik cetakan backend dan dashboard dari toko image, atau membangunnya sendiri dari `Dockerfile` kalau belum ada di toko (beberapa menit). Layanan `migrasi` menerapkan berkas `migrasi/` yang baru lalu berhenti sendiri, backend menyala sesudahnya. `docker compose ps -a` menunjukkan `backend` `(healthy)` dan `migrasi` `Exited (0)` (tanpa `-a`, layanan sekali jalan yang sudah selesai tidak tampil).
4. Akun pertama (sandi ditanyakan dua kali): `docker compose exec backend node src/db/kelola-pengguna.ts tambah admin@rumah.test "Admin Rumah" admin`. Akun yang sudah ada di lemari lama tetap berlaku.

| Perintah (dari akar proyek) | Gunanya |
| :--- | :--- |
| `docker compose ps -a` | keadaan semua layanan, termasuk layanan sekali jalan yang sudah selesai (`Exited (0)`): `(healthy)` = backend menjawab `HEAD /health` |
| `docker compose logs -f backend` | log backend (jam WIB); **Ctrl + C** hanya berhenti membaca, backend tetap jalan. `--since 10m` = 10 menit terakhir |
| `docker compose exec backend node src/db/kelola-pengguna.ts <perintah>` | semua perintah `npm run pengguna -- …` di tabel Mode kembang (`npm run pengguna -- …` juga jalan di kontainer, dengan baris `.env not found. Continuing without it.`) |
| `docker compose exec backend node src/db/isi-riwayat.ts` | data latihan 7 hari (laptop tanpa riwayat), lalu ringkas sekali dengan perintah langkah 7 Mode kembang |
| `docker compose build backend` lalu `docker compose up -d backend` | **di laptop**: membangun ulang cetakan sesudah kode berubah (tag = `version` di `package.json`). Sejak Modul 29, VPS dan Pi tidak membangun: mereka menarik cetakan buatan robot (`sh skrip/pasang.sh`) |
| `docker compose stop backend` / `docker compose start backend` | mematikan dan menyalakan lagi; yang dimatikan dengan `stop` TIDAK dinyalakan Docker sendiri |

Dokumentasi API tetap di loket lama, **`http://localhost:8080/docs`** (bukan `127.0.0.1`: di kontainer backend mendengar di `0.0.0.0`, jadi *login* lewat **Try it out** dari halaman `http://127.0.0.1:8080/docs` ditolak `403`). Kalau `PORT_BACKEND` di `.env` akar bukan 8080 (misalnya 8082), tambahkan `http://localhost:8082` ke `CORS_ORIGIN` di `.env` itu lalu `docker compose up -d`; tanpa itu *login* dari `http://localhost:8082/docs` juga ditolak `403`. Koleksi Bruno (`baseUrl` `http://127.0.0.1:8080`) dan `alat/terminal-live.js` tetap jalan tanpa perubahan. Dashboard memanggil backend lewat Caddy di `http://localhost/api/…`.

Cetakan backend dibangun dari [`Dockerfile`](Dockerfile) (dua tahap `node:24.22.1-alpine3.24`, `npm ci --omit=dev`, pengguna `node`, `CMD ["node", "src/server.ts"]`; sejak Modul 29 tahap `paket` berjalan di prosesor mesin pembangun lewat `FROM --platform=$BUILDPLATFORM` dan tahap akhir tanpa `RUN`, jadi satu mesin membangun cetakan amd64 dan arm64 tanpa emulasi); [`.dockerignore`](.dockerignore) menahan `.env`, `node_modules`, `backup`, Bruno, uji beban, berkas uji, dan (Modul 29) folder `src/integrasi/`. Di dalam kontainer, setelan datang dari `compose.cloud.yml` (`HOST=0.0.0.0`, `MQTT_URL=mqtt://mosquitto:1883`, `DATABASE_URL=…@db:5432/…`, `TZ=Asia/Jakarta`), bukan dari `backend/.env`.

## Di internet, di balik Caddy HTTPS (Modul 27)

Di VPS (atau di Pi pada jalur gratis), tamu dari internet tidak pernah bersambung langsung ke backend: semua permintaan masuk ke Caddy (layanan `web`), dan Caddy meneruskan `/api/…` ke `backend:8080` lewat HTTP biasa di lorong Docker. Backend hanya melihat **Caddy** sebagai tamunya. Caddy menitipkan keterangan tentang tamu yang sebenarnya di kepala `X-Forwarded-For` (alamat IP tamu) dan `X-Forwarded-Proto` (`https`), tetapi kepala semacam itu juga bisa ditulis siapa saja, jadi backend hanya memercayainya dari penerus yang disebut di **`TRUST_PROXY`**:

| `TRUST_PROXY` | Artinya | Dipakai di |
| :--- | :--- | :--- |
| kosong (bawaan backend) | tidak memercayai penerus mana pun: alamat tamu = alamat sambungan, protokol = `http` | mode kembang (`npm run dev`, tanpa Caddy) |
| `uniquelocal` | memercayai penerus di alamat privat (`10.x`, `172.16–31.x`, `192.168.x`, `fc00::/7`), termasuk lorong Docker tempat Caddy berada | **`compose.cloud.yml`** (bawaannya, di laptop, VPS, dan Pi) |
| `true` | memercayai siapa pun, juga tamu yang memalsukan kepala | hindari |
| alamat/CIDR, dipisah koma | misalnya `172.18.0.0/16`; boleh juga `loopback`, `linklocal` | kalau ingin lebih sempit dari `uniquelocal` |

Angka (jumlah lompatan/*hop*, resep lama `trustProxy: 1`) **ditolak** saat server menyala: Fastify 5 sengaja tidak memercayai penerus yang hanya dihitung jumlahnya, jadi setelan itu diam-diam tidak berbuat apa-apa. Isi yang salah membuat server berhenti dengan alasannya, misalnya `Setelan TRUST_PROXY di .env: angka (jumlah hop) tidak dipakai Fastify 5 (tidak dipercaya sama sekali); di balik Caddy tulis uniquelocal`. Setelan yang terbaca ditulis sekali di log saat menyala: `penerus tepercaya (TRUST_PROXY): uniquelocal`.

Akibatnya di balik Caddy HTTPS:

- *Cookie* `akses` dan `sesi` mendapat atribut **`Secure`** (browser hanya mengirimnya lewat HTTPS). `secure: "auto"` di `src/auth/keamanan.ts` sudah ada sejak Modul 20; yang kurang hanyalah keterangan `https` dari Caddy. Di `http://localhost` (laptop) *cookie* tetap tanpa `Secure`, jadi *login* di laptop tetap jalan.
- Pembatas *login* menghitung **per tamu**: 10 *login* salah dari satu HP tidak membuat tamu lain dijawab `429`. Log `login gagal: … (IP …)` juga menulis alamat tamu, bukan alamat Caddy.
- **`CORS_ORIGIN`** di `.env` akar = alamat dashboard yang diketik tamu, persis, misalnya `CORS_ORIGIN=https://iot.namaanda.my.id` (boleh beberapa, dipisah koma). Tanpa itu, *login* dari dashboard ditolak satpam `403` (`permintaan dari halaman https://iot.namaanda.my.id ditolak`). Garis miring di akhir (`https://iot.namaanda.my.id/`), jalur, atau alamat tanpa `http(s)://` ditolak saat server menyala, karena browser tidak pernah mengirim `Origin` berbentuk seperti itu.

Diuji di `src/config/env.test.ts` (setiap bentuk `TRUST_PROXY` dan `CORS_ORIGIN`) dan `src/routes/proksi.test.ts` (rute *login* sungguhan dengan "Caddy" tiruan: *cookie* `Secure`, `429` per tamu, kepala palsu dari tamu langsung tidak dipercaya, dan perilaku lama tanpa `trustProxy` sebagai pembanding). Langkah memindahkan pusat ke VPS ada di [Modul 27](../../../modul-27-deploy-internet-tls-pwa/README.md).

## Mode kembang (tanpa kontainer backend)

Untuk mengubah kode backend, jalankan backend langsung dengan Node di laptop, memakai database dan broker pusat dari Compose. Mulai dari akar proyek: `docker compose up -d`, lalu `docker compose stop backend web` (backend dan dashboard kontainer dimatikan; database, broker, dan Grafana tetap menyala). Selesai mengembangkan: **Ctrl + C** di terminal `npm run dev`, lalu `docker compose start backend web`.

1. Pasang Node.js 24 LTS dan Docker Desktop.
2. Database = layanan `db` di `compose.cloud.yml`, di loket lama `127.0.0.1:5432` (bagian sebelumnya). Sebelum Modul 26, database dijalankan sendiri, cukup sekali: `docker run -d --name rumahpintar-db -p 127.0.0.1:5432:5432 -e POSTGRES_PASSWORD=ganti-sandi-ini -e POSTGRES_DB=rumahpintar -e TIMESCALEDB_TELEMETRY=off -v rumahpintar-data:/var/lib/postgresql/data --restart unless-stopped timescale/timescaledb:2.30.2-pg17` (sandi: huruf, angka, dan tanda minus saja). Jangan menjalankan kontainer itu bersama Compose: nama lemarinya sama.
3. Di folder ini, jalankan `npm install`.
4. Salin `.env.example` menjadi `.env`, lalu isi sandi database di `DATABASE_URL` (= `POSTGRES_PASSWORD` di `.env` akar). `MQTT_URL` sudah menunjuk broker pusat di laptop ini (`mqtt://127.0.0.1:1883`); sebelum Modul 26 isinya alamat IP Pi. Isi `MQTT_PASSWORD` dengan sandi akun broker `backend` (= `MQTT_PASSWORD` di `.env` akar; akunnya dibuat layanan `akun-broker`). Kalau brokermu belum dikunci, `MQTT_USERNAME` dan `MQTT_PASSWORD` boleh dikosongkan (backend masuk tanpa akun, dengan peringatan).
5. Buat kunci tanda tangan JWT dengan perintah ini, lalu tempel hasilnya (43 karakter acak) di `JWT_SECRET` pada `.env`. Langkah ini wajib **sebelum** langkah berikutnya: server, `npm run migrasi`, dan `npm run pengguna` menolak berjalan kalau `JWT_SECRET` kosong, kurang dari 32 karakter, atau masih berisi contoh.

   ```text
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```

6. Buat tabel-tabelnya dengan `npm run migrasi` (di Compose, layanan `migrasi` sudah melakukannya; mengulanginya aman).
7. Petugas ringkasan hanya meringkas ulang 3 hari terakhir. Riwayat yang lebih tua dan masuk sekaligus (bacaan yang sudah ada sebelum migrasi `003`, data latihan dari `npm run isi-riwayat`, atau uji beban di bawah) baru tersimpan di buku ringkasan per jam kalau diringkas **sekali** dengan perintah ini (dari akar proyek), sesudah datanya masuk:

   ```text
   docker compose exec db psql -U postgres -d rumahpintar -c "CALL refresh_continuous_aggregate('readings_per_jam', NULL, now() - INTERVAL '1 hour');"
   ```

   Jangan mengulang perintah ini setelah retensi (migrasi `004`) membuang data lama: jendela `NULL` ikut menghapus ringkasan lama yang bacaan mentahnya sudah dibuang.
8. Buat akun pertama: satu `admin` dan (sebaiknya) satu `viewer`. Sandi ditanyakan dua kali dan hanya tampil sebagai `*`; jalankan di terminal VS Code (PowerShell) atau Terminal macOS, bukan di jendela Git Bash.

   ```text
   npm run pengguna -- tambah admin@rumah.test "Admin Rumah" admin
   npm run pengguna -- tambah viewer@rumah.test "Tamu Rumah" viewer
   ```

9. (Tidak wajib) Untuk peringatan Telegram, isi `TELEGRAM_BOT_TOKEN` (token dari @BotFather) dan `TELEGRAM_CHAT_ID` (angka yang dibalas bot saat kamu mengirim `/start`) di `.env`. Kosong = notifikasi Telegram mati. Token itu rahasia, seperti kata sandi. Sejak Modul 25, bot yang sama juga mengirim laporan harian CSV setiap pagi; jamnya diatur `LAPORAN_JADWAL` di `.env` (cron 5 bidang dalam WIB, bawaan `0 7 * * *` = 07.00 WIB). Baris `# TELEGRAM_API_ROOT=` di `.env.example` biarkan tetap berkomentar: baris itu hanya dipakai untuk server Bot API tiruan di lab.
10. Jalankan `npm run dev`, lalu buka dokumentasinya di `http://127.0.0.1:8080/docs`. Untuk mencoba rute bergembok di sana, *login* dulu lewat **Try it out** di `POST /auth/login`; browser menyimpan *cookie*-nya dan mengirimnya sendiri ke rute lain (tombol **Authorize** tidak dipakai).

| Perintah | Gunanya |
| :--- | :--- |
| `npm run dev` | menjalankan server dan memulainya ulang setiap kali kode atau `.env` disimpan |
| `npm start` | menjalankan server tanpa mulai ulang otomatis (sejak 1.3 juga jalan tanpa berkas `.env`, misalnya di kontainer); **Ctrl + C** menghentikannya dengan rapi (di Windows, `npm run dev` + **Ctrl + C** mematikan server seketika) |
| `npm run cek` | memeriksa tipe TypeScript, termasuk file uji (jalankan sebelum setiap *commit*) |
| `npm run lint` | Modul 29: memeriksa kode dengan oxlint ([`.oxlintrc.json`](.oxlintrc.json)), kesalahan umum yang lolos dari pemeriksa tipe; yang diharapkan `Found 0 warnings and 0 errors.`. Satu peringatan pun membuatnya gagal (`--deny-warnings`), jadi robot juga merah |
| `npm test` | menjalankan *unit test* dengan Vitest: *rules engine* dan skema aturan (`src/aturan/*.test.ts`; sejak Modul 24 juga aturan di bawah ambang), *login* (`src/auth/auth.test.ts`), kunci perangkat (`src/auth/kunci.test.ts`, Modul 21), buku tamu dan lapis kedua (`src/services/daftar.test.ts`), rute registrasi (`src/routes/perangkat.test.ts`), rute hapus aturan beserta satpamnya: tamu 401, *viewer* 403, *preflight* `DELETE` (`src/routes/aturan.test.ts`, Modul 24), dan aturan siram yang berjalan: pompa dikirim sekali, padam tanpa perintah, perintah yang ditolak ditandai `ok: false`, aturan yang dihapus atau dinonaktifkan tidak bertindak lagi (`src/services/otomasi.test.ts`, Modul 24), lalu (Modul 25) titik peta: skema lokasi dan rute `PUT /devices/:id/lokasi` beserta satpamnya (`src/routes/lokasi.test.ts`), pembuat CSV (`src/services/csv.test.ts`), laporan harian: rentang kemarin WIB, isi CSV, Telegram mati atau menolak, jadwal WIB yang terlambat tetap melaporkan hari yang benar, jadwal terlewat hanya dikabarkan (`src/services/laporan.test.ts`), rute `POST /laporan/kirim` (`src/routes/laporan.test.ts`), berkas laporan terkirim dengan namanya dan kabar 📴/✅ setelah 60 detik (`src/services/telegram.test.ts`), status `online` *retained* sesudah broker dimulai ulang (`src/services/mqtt.test.ts`), setelan `LAPORAN_JADWAL` (`src/config/env.test.ts`), dan (Modul 26) saringan log: ketukan `/health` yang berhasil tidak dicatat (`src/services/log.test.ts`). Modul 29: bila `DATABASE_URL_UJI` diisi, 20 *integration test* (`src/integrasi/`) ikut jalan; tanpa itu dilewati (`Tests  203 passed \| 20 skipped (223)`) |
| `npm run test:integrasi` | Modul 29: hanya 20 *integration test* dengan database uji; butuh `DATABASE_URL_UJI` (lihat [Diuji dengan database uji](#diuji-dengan-database-uji-modul-29)) |
| `npm run migrasi` | menjalankan file SQL baru di folder `migrasi/` (aman diulang) |
| `npm run isi-riwayat` | mengisi data latihan 7 hari untuk perangkat latihan `f00d00000001` dan `f00d00000002` |
| `npm run pengguna -- tambah <email> "<nama>" <admin\|viewer>` | membuat akun; sandi ditanyakan dan hanya tampil sebagai `*` (minimal 15 karakter, maksimal 72 *byte*) |
| `npm run pengguna -- sandi <email>` | mengganti sandi; semua sesi akun itu dicabut (harus *login* lagi) |
| `npm run pengguna -- peran <email> <admin\|viewer>` | mengganti peran (berlaku paling lambat 15 menit lagi, saat gelangnya diperbarui) |
| `npm run pengguna -- hapus <email>` | menghapus akun beserta semua sesinya |
| `npm run pengguna -- daftar` | menampilkan semua akun (tanpa sidik jari sandi) |

Untuk uji beban, `uji/beban-1-juta.sql` memuat 1.036.801 bacaan palsu (satu setiap 10 detik selama 120 hari) untuk perangkat uji `beef00000001`. Jalankan dari akar proyek (database = layanan `db` Compose):

```text
docker compose cp backend/uji/beban-1-juta.sql db:/tmp/beban-1-juta.sql
docker compose exec db psql -U postgres -d rumahpintar -f /tmp/beban-1-juta.sql
```

## *Login* dan pengaman

- **Akun** hanya dibuat dari terminal (`npm run pengguna`); tidak ada rute pendaftaran di API. Database menyimpan sidik jari sandi (bcrypt, *cost* 12), bukan sandinya.
- **`POST /auth/login`** menjawab dua *cookie* `HttpOnly; SameSite=Strict`: `akses` (JWT 15 menit, `Path=/`) dan `sesi` (*refresh token* 7 hari, `Path=/auth`; database hanya menyimpan SHA-256-nya). Email salah dan sandi salah dijawab sama: `401 {"pesan":"email atau sandi salah"}`. Lewat Caddy (mode rumah, Modul 26) alamatnya berawalan `/api`, jadi Caddy menulis ulang jalur *cookie* `sesi` menjadi `Path=/api/auth` (`frontend/caddy/Caddyfile`); backend sendiri tidak berubah.
- **Gelang habis?** `POST /auth/refresh` menukar *cookie* `sesi` dengan gelang baru dan kartu terusan baru (rotasi). Kartu terusan lama yang dipakai lagi 30 detik atau lebih sesudah diganti dianggap curian: sesinya dicabut. **`POST /auth/logout`** menghapus sesi, mengosongkan kedua *cookie*, dan memutus sambungan Socket.IO sesi itu.
- **Rute terbuka** (tanpa *login*): `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET`/`HEAD /health`, dan `/docs`. Sejak Modul 28 juga dua rute untuk **perangkat** yang memeriksa sendiri dengan lebih ketat: unduh firmware `GET`/`HEAD /fw/:folder/:berkas` (kunci perangkat + MAC) dan `POST /provision/klaim` (kode klaim, 10 percobaan per menit per alamat IP). Semua rute lain, termasuk rute baru dan URL yang tidak ada, menjawab `401` bagi tamu.
- **Peran**: `admin` boleh semua; `viewer` hanya `GET`/`HEAD` (selain itu `403`).
- ***Rate limit***: paling banyak 10 percobaan `POST /auth/login` per menit dari alamat IP yang sama; percobaan ke-11 dijawab `429` dengan kepala `retry-after`. Hitungannya di memori: server dimulai ulang = mulai dari nol. Di balik Caddy, "alamat IP yang sama" baru berarti "tamu yang sama" bila `TRUST_PROXY` diisi (Modul 27; `compose.cloud.yml` mengisinya `uniquelocal`).
- **CORS dan asal halaman**: halaman web di `CORS_ORIGIN` (`.env`, bawaan `http://localhost:5173,http://127.0.0.1:5173` untuk Modul 22; mode rumah: `http://localhost,http://127.0.0.1` dari `.env` akar; di internet, Modul 27: `https://iot.namaanda.my.id`) boleh memanggil API dari browser dengan *cookie*. Permintaan selain `GET`/`HEAD` yang membawa kepala `Origin` dari halaman lain ditolak `403`; curl, Bruno, dan Node tidak mengirim `Origin`, jadi tidak terganggu.
- **Bruno**: koleksi `bruno/` punya permintaan `login admin`, `login viewer`, `login salah`, `siapa saya`, `refresh`, dan `logout`, serta (Modul 21) `daftarkan Node 1`, `daftarkan Node 2 lewat Node 1`, `daftarkan perangkat latihan`, `ganti kunci perangkat latihan`, dan `cabut kunci perangkat latihan`, dan (Modul 24) `buat aturan siram tanah` dan `hapus aturan` (ganti angka di alamat `hapus aturan` dengan `id` dari jawaban `buat aturan siram tanah`; bawaannya `4`, nomor aturan pertama sesudah tiga aturan Modul 19), serta (Modul 25) `daftarkan Kebun tiruan` (Node 2 palsu `f00d000000b2` lewat `f00d00000001`, untuk jalur tanpa Node 2; lihat `alat/README.md`), `atur lokasi perangkat`, dan `kirim laporan sekarang` (`?hari=ini`). Sandinya dibaca dari `bruno/.env` (tidak ikut Git) berisi `SANDI_ADMIN=…` dan `SANDI_VIEWER=…`. Kirim `login admin` atau `login viewer` dulu; *cookie*-nya dipakai otomatis oleh permintaan lain.

## API

| Rute | Siapa | Gunanya |
| :--- | :--- | :--- |
| `POST /auth/login` | terbuka | *login* dengan `{ "email": …, "sandi": … }`; jawabannya `{ id, email, nama, peran }` + *cookie* `akses` dan `sesi` |
| `POST /auth/refresh` | terbuka (*cookie* `sesi`) | gelang baru + kartu terusan baru |
| `POST /auth/logout` | terbuka | menghapus sesi dan kedua *cookie*; selalu `{"pesan":"sudah logout"}` |
| `GET /auth/me` | login | akun yang sedang *login* (dibaca dari database) |
| `GET /health` | terbuka | server hidup? versi berapa (`versi`, Modul 29, dari `package.json`)? tersambung ke broker dan database? berapa pesan `diterima`, `ditolak` (gagal kontrak), dan `diabaikan` (dari perangkat tak terdaftar/dicabut, Modul 21)? |
| `GET /devices` | login | daftar perangkat dari database: yang terdaftar, yang dicabut, dan baris lama yang belum terdaftar; kolom `kunci` menandai `aktif`/`dicabut`/`tanpa-kunci`/`belum-terdaftar` (sidik jari kunci tidak pernah ikut); sejak Modul 25 juga titik peta `lat`/`lng` (`null` = belum diisi) |
| `POST /devices` | admin | daftarkan perangkat (Modul 21): jawabannya memuat `kunci` 43 huruf **yang hanya tampil sekali ini** dan `langkah` berikutnya; `penghubung` untuk perangkat ESP-NOW (Node 2) yang datanya diterbitkan Node 1 (tanpa kunci) |
| `POST /devices/:id/kunci` | admin | buat kunci baru (kunci lama langsung tidak berlaku); juga menghidupkan lagi perangkat yang dicabut |
| `POST /devices/:id/cabut` | admin | cabut kunci perangkat yang hilang atau dicuri: backend langsung mengabaikan datanya, perintah kepadanya dijawab 409. Sejak Modul 28 = **Nonaktifkan** di `/armada`: akun brokernya juga dihapus (perangkat diputus seketika), statusnya ditulis `offline`, dan `config` *retained*-nya dihapus |
| `PUT /devices/:id/lokasi` | admin | atur titik perangkat di peta (Modul 25): `{ "lat": -6.1754, "lng": 106.8272 }` dengan **titik** desimal; `{ "lat": null, "lng": null }` menghapus titiknya. Jawabannya satu baris perangkat seperti di `GET /devices`; teks `lokasi` tidak ikut berubah |
| `GET /devices/:id/latest` | login | bacaan `telemetry` terbaru satu perangkat |
| `GET /devices/:id/vitals` | login | kesehatan terakhir satu perangkat |
| `GET /devices/:id/readings?from=…&to=…` | login | riwayat bacaan mentah dari database (bawaan: satu jam terakhir; paling banyak 1.000 bacaan) |
| `GET /devices/:id/readings?bucket=15m\|1h\|1d&from=…&to=…` | login | ringkasan riwayat per 15 menit, per jam, atau per hari WIB (bawaan: 1 hari, 7 hari, atau 30 hari terakhir; paling banyak 1.000 ember) |
| `POST /devices/:id/command` | admin | kirim perintah `set` ke Node 1, tunggu `ack`-nya paling lama 5 detik, lalu catat di tabel `commands` (dengan `sumber` `api`); perangkat yang belum terdaftar dijawab 404, yang kuncinya dicabut 409 |
| `GET /devices/:id/state` | login | keadaan aktuator: yang diinginkan server (`desired`), yang terakhir dilaporkan perangkat (`reported`, dari `telemetry.state` atau `ack.state`), kapan laporan itu tiba, dan aktuator yang belum cocok (`selisih`) |
| `GET /rules` | login | semua aturan otomatis yang sedang dipakai server; aturan jadwal ditambah `berikutnya` (UTC) |
| `POST /rules` | admin | buat aturan baru: ambang naik (`kondisi.jenis` `ambang`) atau, sejak Modul 24, ambang turun (`ambang-bawah`) dengan aksi `sakelar` atau `perintah` (dikirim sekali), atau jadwal (`jadwal` + `perintah`); langsung berlaku |
| `PUT /rules/:id` | admin | ganti seluruh isi satu aturan; langsung berlaku tanpa memulai ulang server, dan ambang aturan kipas dikirim ke perangkat sebagai `config` *retained* |
| `DELETE /rules/:id` | admin | hapus satu aturan (Modul 24); langsung tidak berlaku, jawabannya `{ id, nama, pesan }`. Keadaan yang diinginkannya ikut dilupakan, jadi perangkat yang menyala ulang tidak menerima lagi perintah aturan itu; aktuator yang sedang dinyalakannya dibiarkan apa adanya. Riwayat perintah dan kejadiannya tetap ada (kolom `aturan_id`-nya menjadi kosong). Untuk menyimpan aturan tanpa menjalankannya, pakai `PUT` dengan `"aktif": false` |
| `POST /rules/:id/jalankan` | admin | jalankan aksi satu aturan jadwal sekarang juga (untuk menguji, tanpa menunggu jamnya) |
| `POST /laporan/kirim` | admin | kirim laporan harian CSV ke Telegram sekarang juga (Modul 25), isinya sama dengan laporan terjadwal (kemarin 00.00–24.00 WIB); `?hari=ini` = laporan sementara hari ini sejak 00.00 WIB. Jawabannya `{ berkas, dari, sampai, perangkat, ukuran_byte, keterangan }` |
| `POST /firmware/:jenis/:versi` | admin | Modul 28: unggah berkas firmware (`jenis` = `node1`). Badan = isi berkas apa adanya (`Content-Type: application/octet-stream`, paling besar 2 MiB), `?catatan=…&uji=true` pilihan. Ditolak `400` bila bait pertamanya bukan `0xE9` (misalnya `.merged.bin`) atau lebih besar dari satu rak program (1.966.080 byte); `409` bila versinya sudah ada (versi tidak bisa ditimpa). SHA-256 dihitung server |
| `GET /firmware` | login | Modul 28: daftar rilis ("*manifest*" dari database): versi, ukuran, SHA-256, catatan, `uji`, `ditarik`, alamat unduh, ringkasan *canary* (`canary_berhasil`, `canary_gagal`, `boleh_semua`), dan `terbaru` (rilis tertinggi yang bukan uji dan tidak ditarik) |
| `POST /firmware/:jenis/:versi/tarik` | admin | Modul 28: tarik rilis buruk: tidak dikirim lagi dan tidak bisa diunduh lagi |
| `GET`/`HEAD /fw/node-1/<versi>.bin` | **perangkat** | Modul 28: unduh firmware. Basic Auth `device_id:kunci` + kepala `x-ESP32-STA-MAC` milik perangkat itu (persis permintaan HTTPUpdate). `200` + `Content-Length` + `x-SHA256`, `304` bila `x-ESP32-version` sama, `403` kunci salah/dinonaktifkan/MAC lain, `404` versi tidak ada/ditarik |
| `GET /armada` | login | Modul 28: data halaman `/armada`: `rilis_terbaru`, `pengaturan` (`ota_siap`, `akun_broker`), dan setiap perangkat terdaftar dengan `fw`, `perlu_update`, `kesehatan` (RSSI, *heap*, *uptime*, `reset_reason`), `pembaruan` terakhir, `canary`, `jeda_vitals_s`, `bisa_update` + `alasan_tidak_bisa` |
| `POST /devices/:id/update` | admin | Modul 28: perbarui firmware satu Node 1 (`{ "versi": "1.7.1" }`, turun versi butuh `"paksa": true`). `202` = perangkat **menerima** perintahnya (bukan selesai); `409` bila tidak online, sedang memperbarui, versi sama, Node 2, dinonaktifkan; `422` bila perangkat menolak (misalnya masa uji 60 detik) |
| `POST /armada/update` | admin | Modul 28: `{ "versi", "sasaran": "canary" \| "semua" }`. `semua` baru boleh sesudah paling sedikit satu *canary* berhasil memakai versi itu dan tidak ada *canary* yang `rollback`/`gagal`; rilis uji selalu ditolak. Jawabannya `dikirim` dan `dilewati` (dengan alasan) |
| `GET /devices/:id/pembaruan` | login | Modul 28: riwayat pembaruan satu perangkat (20 terakhir) |
| `PUT /devices/:id/canary` | admin | Modul 28: `{ "canary": true }` tandai perangkat uji yang menerima rilis baru lebih dulu |
| `PUT /devices/:id/jeda` | admin | Modul 28: `{ "vitals_s": 60 }` (60–3600) jeda `vitals` Node 1, dikirim lewat `config` *retained* gabungan; `telemetry` tetap 10 detik |
| `POST /provision/kode` | admin | Modul 28: buat kode klaim sekali pakai `XXXX-XXXX` (`{ nama, lokasi, menit }`, 5–60 menit, bawaan 30); kodenya **hanya tampil sekali** |
| `GET /provision/kode` | login | Modul 28: kode klaim terakhir tanpa kodenya: `berlaku`, `dipakai` (oleh perangkat mana), atau `kedaluwarsa` |
| `POST /provision/klaim` | **perangkat** | Modul 28: `{ "kode", "device_id" }` → `201 { device_id, kunci, mqtt_username }`. `403` kode salah/kedaluwarsa/dipakai (satu jawaban), `409` perangkat masih aktif, `429` percobaan ke-11 dalam semenit, `503` broker/database bermasalah (kode **tidak** hangus). Lewat Caddy: `POST /api/provision/klaim` |

"login" = akun apa pun yang sudah *login* (`admin` atau `viewer`). Data *live* tersedia lewat **Socket.IO** di alamat yang sama (`/socket.io/`), juga dengan *cookie* `akses`: kirim `ikuti` dengan `device_id` (jawabannya membawa bacaan terakhir) untuk menerima acara `telemetry` perangkat itu; acara `status` dan `kejadian` dikirim ke semua klien. Tanpa *cookie*, sambungan ditolak (`connect_error` `belum login`); saat gelang kedaluwarsa, server memutus sambungan dan klien harus *refresh* lalu menyambung lagi. Contoh klien: `alat/terminal-live.js` (akun dibaca dari `alat/.env`).

Aturan otomatis disimpan di tabel `rules` sebagai data JSON yang diperiksa Zod. Aturan ambang menyala kalau besarannya **di atas** `nyala_di_atas` terus-menerus selama `selama_detik` detik, lalu padam **di bawah** `padam_di_bawah`. Aturan jadwal memakai cron 5 bidang dan selalu dihitung dalam WIB (`Asia/Jakarta`), apa pun zona waktu laptopnya. Contoh aturan kipas:

```json
{"nama":"Kipas otomatis","aktif":true,
 "kondisi":{"jenis":"ambang","device_id":"a4cf12e5b7c0","besaran":"suhu","nyala_di_atas":30,"padam_di_bawah":28,"selama_detik":120},
 "aksi":{"jenis":"sakelar","device_id":"a4cf12e5b7c0","target":"kipas","kabari":true}}
```

Sejak Modul 24 (v1.1), aturan ambang juga bisa berarah **turun** (`ambang-bawah`): menyala kalau besarannya **di bawah** `nyala_di_bawah` terus-menerus selama `selama_detik` detik, lalu padam (siap lagi) **di atas** `padam_di_atas`, yang harus lebih besar daripada `nyala_di_bawah` (histeresis). Kedua arah ambang boleh memakai aksi `sakelar` (kipas atau lampu menyala selama aturan menyala) atau aksi `perintah`, yang dikirim **sekali** saat aturan menyala; saat aturan padam tidak ada perintah yang dikirim. Jadwal tetap hanya boleh memakai aksi `perintah`. Contoh "siram jika tanah < 30 %":

```json
{"nama":"Siram jika tanah < 30 %","aktif":true,
 "kondisi":{"jenis":"ambang-bawah","device_id":"a4cf12e5b7c0","besaran":"tanah","nyala_di_bawah":30,"padam_di_atas":35,"selama_detik":10},
 "aksi":{"jenis":"perintah","device_id":"a4cf12e5b7c0","perintah":{"target":"pompa","nilai":5},"kabari":true}}
```

Saat tanah bertahan di bawah 30 % selama 10 detik, pompa menyiram 5 detik dan kejadian `🌱 Tanah 25 % — pompa menyiram 5 detik otomatis` tercatat. Pompa tidak menyiram lagi selama tanah belum sempat naik di atas 35 % (`✅ Tanah naik ke 36 % — aturan siap lagi`); keputusan hanya diambil saat aturan berganti keadaan. Kalau perangkat menolak perintahnya (misalnya `pompa ditolak: air tandon kurang`) atau tidak menjawab dalam 5 detik, kejadiannya berbunyi `⚠️ Tanah 25 % — perintah pompa ditolak perangkat: pompa ditolak: air tandon kurang` (atau `… pompa TIDAK menjawab perintah (tidak dikirim ulang)`), dan aturan itu baru menyiram lagi pada kekeringan berikutnya atau setelah aturannya disimpan ulang (misalnya dinonaktifkan lalu diaktifkan lagi); tanpa jeda ini, tandon yang kosong akan memicu kejadian yang sama setiap beberapa detik.

Bentuk aturan ditulis di `src/schemas/aturan-dasar.ts` (tanpa node-cron, sehingga salinan identiknya bisa dipakai dashboard di browser, Modul 24); `src/schemas/aturan.ts` memakai semua isinya lalu menambah satu pemeriksaan yang hanya bisa di server: isi ekspresi cron (`ekspresi cron tidak sah`).

Dengan `bucket`, jawabannya berbentuk `{ device_id, dari, sampai, ember, jumlah, ringkasan: [ { waktu, suhu_rata, suhu_min, suhu_maks, kelembapan_rata, tanah_rata, cahaya_rata, jumlah_bacaan } ] }`. `waktu` adalah awal ember (UTC), dan `dari` dibulatkan ke bawah ke awal ember. Ringkasan per 15 menit dihitung langsung dari bacaan mentah, ringkasan per jam dibaca dari `readings_per_jam`, dan ringkasan per hari menggabungkan ringkasan per jam menjadi hari WIB. Rata-rata hariannya tepat sama dengan hitungan dari bacaan mentah karena setiap jam menyimpan rata-rata dan banyaknya nilai (`suhu_rata` dan `suhu_n`, dan seterusnya).

Koleksi Bruno untuk semua rute ada di folder `bruno/` (pilih *environment* `lokal`). Sejak Modul 27 ada *environment* `internet` (`baseUrl` `https://iot.namaanda.my.id/api`, lewat Caddy di VPS; ganti nama domainnya dengan milikmu); *cookie* `sesi` di sana berjalur `/api/auth`, sama seperti di dashboard.

## Peta dan laporan harian (Modul 25)

**Titik peta.** Kolom `lat` (lintang) dan `lng` (bujur) sudah ada di tabel `devices` sejak migrasi `001`; sejak v1.2 keduanya ikut `GET /devices`, sehingga halaman Peta di dashboard bisa menggambar setiap perangkat. Titiknya diatur admin lewat `PUT /devices/:id/lokasi` (Bruno: `atur lokasi perangkat`):

```json
{ "lat": -6.1754, "lng": 106.8272 }
```

Angkanya derajat desimal dengan **titik**, karena JSON tidak mengenal koma desimal. `lat` −90 sampai 90 (Jakarta sekitar −6,2) dan `lng` −180 sampai 180 (Jakarta sekitar 106,8), keduanya diisi berpasangan; `{ "lat": null, "lng": null }` menghapus titiknya. Kolom lain ditolak, jadi teks `lokasi` ("ruang tamu") tidak ikut berubah. Jawaban yang mungkin:

| Kode | Contoh `pesan` / `message` |
| :--- | :--- |
| `200` | satu baris perangkat, sama dengan `GET /devices`, dengan titik barunya |
| `400` | `body/lat harus angka dengan titik desimal, misalnya -6.1754 (bukan teks "-6,1754")`, `body/lat lintang paling besar 90`, `body/lng lat dan lng diisi berpasangan: keduanya angka, atau keduanya null untuk menghapus titik`; `{"lat": -6,2}` tanpa tanda petik bahkan bukan JSON: `Body is not valid JSON but content-type is set to 'application/json'` |
| `403` | akun `viewer` (satpam Modul 20) |
| `404` | `f00d0000ffff tidak ada di daftar perangkat` |

Titik rumah adalah data pribadi: log backend hanya mencatat `titik <device_id> di peta diatur oleh akun 1`, tanpa angkanya. Untuk contoh dan tangkapan layar, pakai titik fiktif di tempat umum (contoh di atas: sekitar Monas, Jakarta).

**Laporan harian CSV.** Setiap hari pada jam `LAPORAN_JADWAL` (bawaan `0 7 * * *` = 07.00 WIB; cron **5** bidang, selalu dihitung dalam WIB apa pun zona waktu laptopnya), backend meringkas data **kemarin 00.00–24.00 WIB** untuk setiap perangkat terdaftar yang kuncinya belum dicabut, lalu bot Telegram Modul 19 mengirimnya ke chat pemilik sebagai berkas `laporan-YYYY-MM-DD.csv` (tanggal = hari yang dilaporkan) dengan keterangan `📊 Laporan harian Rumah Pintar Mini 26 Okt 2026: 3 perangkat`. Semua dihitung dalam satu kueri SQL (`src/services/laporan.ts`):

| Kolom | Isinya | Sumber |
| :--- | :--- | :--- |
| `device_id`, `nama`, `jenis` | perangkatnya (`nama` kosong → `device_id`) | `devices` |
| `jumlah_bacaan` | banyaknya `telemetry` hari itu (Node 1 sekitar 8.640, Node 2 sekitar 288; 0 = diam seharian) | `readings_per_jam` |
| `suhu_rata`, `suhu_min`, `suhu_maks`, `kelembapan_rata`, `tanah_rata`, `tanah_min` | ringkasan harian (rata-rata tepat dari rata-rata per jam × banyaknya nilai, seperti `bucket=1d`) | `readings_per_jam` |
| `rssi_rata`, `rssi_terburuk`, `heap_terendah`, `menyala_ulang` | kesehatan dari `vitals`; `menyala_ulang` = berapa kali `uptime_s` turun. Kosong untuk Node 2 (tidak mengirim `vitals`) | `device_health` |
| `kali_terputus` | berapa kali statusnya menjadi `offline`/`offline-mode` | `events` |

Formatnya sama dengan unduhan CSV dashboard Modul 23 (`src/services/csv.ts`): pemisah titik koma, koma desimal, BOM di awal berkas, CRLF di akhir setiap baris; formatnya disiapkan untuk Excel atau LibreOffice Calc dengan setelan regional Indonesia. Berkasnya dikirim sebagai `Buffer` (`new InputFile(Buffer.from(isi, "utf8"), nama)`): `new InputFile("teks…")` dianggap jalur berkas oleh grammY dan gagal (`ENOENT`).

Untuk menguji tanpa menunggu jamnya, kirim `POST /laporan/kirim` (Bruno: `kirim laporan sekarang`). Tanpa pilihan, isinya laporan kemarin yang sama; `?hari=ini` mengirim laporan sementara hari ini sejak 00.00 WIB (berkas `laporan-YYYY-MM-DD-sementara.csv`), berguna kalau sistemmu baru menyala hari ini. Kalau `TELEGRAM_BOT_TOKEN` atau `TELEGRAM_CHAT_ID` kosong, rute ini menjawab `409 {"pesan":"laporan tidak dikirim: Telegram mati (TELEGRAM_BOT_TOKEN belum diisi)"}` dan laporan terjadwal hanya mencatat `laporan harian dilewati: Telegram mati (…)` di log; Telegram yang menolak atau tak terjangkau = `502`, database mati = `503`.

Contoh log backend saat laporan terjadwal berjalan (jadwal uji `20 21 * * *`, lalu dikembalikan ke `0 7 * * *`):

```text
INFO: laporan harian dijadwalkan: "20 21 * * *" Asia/Jakarta, berikutnya 26 Okt 2026, 21.20 WIB
INFO: laporan harian berjalan sesuai jadwal
INFO: Telegram terkirim: berkas laporan-2026-10-25.csv (380 byte), 📊 Laporan harian Rumah Pintar Mini 25 Okt 2026: 3 perangkat
```

## Pembaruan firmware, armada, dan kode klaim (Modul 28)

Langkah lengkapnya (urutan pasang, firmware Node 1 1.7.0, latihan 1.7.1 dan rollback 1.7.2-uji, kotak) ada di Modul 28. Di sini ringkasan sisi server.

| Setelan (`.env`) | Isi | Bawaan |
| :--- | :--- | :--- |
| `ALAMAT_SERVER` | alamat server untuk **perangkat**: `url` di perintah `update` = `ALAMAT_SERVER` + `/fw/node-1/<versi>.bin`, dan alamat yang **sama persis** diketik di kolom **Alamat server** portal (juga saat klaim). Firmware 1.7.0 (kontrak 1.6) hanya mengunduh dari alamat server yang tersimpan padanya: `url` lain dijawab `ack ok:false` `url bukan server rumah ini`. VPS: `https://iot.namaanda.my.id`; jaringan rumah saja: `http://<alamat IP rumah>` (hanya `10.x`, `172.16–31.x`, `192.168.x`, karena kunci perangkat ikut terkirim; alamat lain dengan `http://` ditolak saat server menyala), misalnya Pi jalur gratis `http://192.168.1.37` (tanpa `:8081`: itu pintu di dalam kontainer). Bentuknya harus bisa disimpan Node 1 apa adanya, jadi backend menolak menyala bila alamatnya lebih dari **64 huruf**, memakai huruf besar, diakhiri `/` atau berjalur (`/api`), nama servernya berisi selain huruf kecil, angka, titik, dan `-` (misalnya garis bawah `_`), atau port-nya di luar `1`–`65535`; pesannya menyebut alasannya (`Setelan ALAMAT_SERVER di .env: "…" …`) | kosong = pembaruan lewat udara **mati** (`/armada` menulis `ota_siap: false`) |
| `AKUN_BROKER_OTOMATIS` | `pusat` (perangkat masuk langsung ke broker pusat), `gerbang:<nama>` (perangkat masuk ke broker gerbang Pi bernama itu, misalnya `gerbang:pi1`; perintah akun lewat jembatan), atau `mati` | `mati` = akun broker dibuat tangan seperti Modul 21 |
| `FIRMWARE_DIR` | folder berkas `.bin` yang diunggah. Di kontainer: `/app/data-firmware` = lemari `data-firmware` | `data-firmware` (relatif dari folder backend; tidak ikut Git) |
| `OTA_BATAS_MENIT` | pembaruan tanpa kabar selama itu ditandai `kedaluwarsa` | 10 |

**Alur satu pembaruan** (kontrak 1.6). `POST /devices/:id/update` menerbitkan `cmd` `{"aksi":"update","versi","url","sha256","ukuran"}` (QoS 1, **tidak pernah** *retained*) dan mencatat satu baris di tabel `pembaruan`:

| Status | Artinya | Dari mana backend tahu |
| :--- | :--- | :--- |
| `dikirim` | perintah sudah terbit | — |
| `diterima` | perangkat menjawab `ack ok:true` dalam 5 detik: perintahnya **diterima**, belum selesai | `ack` |
| `mengunduh` | perangkat yang sah mulai mengambil berkasnya | rute `/fw` |
| `ditolak` | `ack ok:false` (misalnya masih masa uji 60 detik sesudah pembaruan sebelumnya) | `ack` |
| `berhasil` / `rollback` / `gagal` | firmware baru sah; firmware baru gagal dan perangkat kembali sendiri ke versi lama; unduhan/pemeriksaan gagal dan versi lama tetap jalan | `vitals.ota` (diulang perangkat di paling banyak 3 `vitals`); bila laporannya hilang, backend **menyimpulkan** dari `vitals` sesudah perangkat menyala ulang (`fw` baru = berhasil, `fw` lama = gagal; pesannya diawali `disimpulkan server:`) |
| `kedaluwarsa` | tanpa kabar `OTA_BATAS_MENIT` menit | pengawas setiap 30 detik |

Satu perangkat hanya boleh punya **satu** pembaruan yang berjalan (indeks unik `pembaruan_satu_berjalan`). Perangkat yang sedang tidak `online` (juga `offline-mode`) dijawab `409`: perintah update **tidak diantre**. Setiap perubahan status dicatat di buku kejadian (`jenis` `ota`) dan disiarkan lewat Socket.IO sebagai acara **`ota`** `{ device_id, id, status, dari, ke, pesan, waktu }`, jadi halaman `/armada` berubah tanpa *polling*.

**Canary.** Tandai satu Node 1 dengan `PUT /devices/:id/canary`. `POST /armada/update` `sasaran: "canary"` mengirim ke semua *canary*; `sasaran: "semua"` baru terbuka sesudah paling sedikit satu *canary* `berhasil` memakai versi itu dan tidak ada *canary* yang `rollback`/`gagal`. Rilis **uji** (`?uji=true` saat unggah, misalnya 1.7.2 yang sengaja rusak) hanya bisa dikirim lewat Perbarui per perangkat dan tidak pernah dihitung "terbaru".

**Unggah dari terminal** (tanpa dashboard; *cookie* dari `curl` *login* seperti Modul 20, berkasnya `kue.txt`, tidak ikut Git):

```text
curl -s -b kue.txt -H "Content-Type: application/octet-stream" --data-binary @node-1-rumah.ino.bin "http://127.0.0.1:8080/firmware/node1/1.7.1?catatan=latihan%20OTA"
```

**Memeriksa unduhan seperti perangkat** (kunci perangkat dari `POST /devices` atau klaim; jangan ditulis ke berkas atau riwayat yang dibagikan):

```text
curl --http1.0 -sI -u a4cf12e5b7c0:<kunci> -H "x-ESP32-STA-MAC: A4:CF:12:E5:B7:C0" -H "x-ESP32-version: 1.7.0" https://iot.namaanda.my.id/fw/node-1/1.7.1.bin
```

Jawaban yang benar: `200`, `content-type: application/octet-stream`, `content-length` = ukuran berkas, `x-sha256`, **tanpa** `content-encoding`. Tanpa kunci atau MAC yang cocok: `403`; versi tidak ada: `404` (bukan halaman dashboard: Caddy memeriksa blok `/fw/*` di `frontend/caddy/Caddyfile` sebelum *fallback* halaman, di mana pun letaknya di berkas itu). Pengalihan (3xx) tidak pernah dipakai: HTTPUpdate tidak mengikutinya.

**Kode klaim** (perangkat baru dalam satu menit): admin `POST /provision/kode` → kode `XXXX-XXXX` (tampil sekali, 5–60 menit, bawaan 30; database hanya menyimpan SHA-256-nya) → kode diketik di portal papan baru → perangkat `POST <ALAMAT_SERVER>/api/provision/klaim` `{kode, device_id}` → `201 {device_id, kunci, mqtt_username}`. Dalam satu transaksi: kode dikunci, perangkat didaftarkan (perangkat yang **masih aktif** tidak bisa diklaim: `409`), kode ditandai terpakai, akun broker dibuat. Akun broker gagal (gerbang tidak menjawab 3 detik, dicoba sekali lagi) = `503` dan **kode tidak hangus**. Klaim butuh awalan `/api` dari Caddy: di mode kembang tanpa Caddy (`http://127.0.0.1:8080`) alamat itu dijawab `401 belum login…`, jadi uji klaim lewat Compose (`http://127.0.0.1`), atau daftarkan perangkat palsu dengan `POST /devices`.

**Akun broker otomatis** (*dynamic security*). Dengan `AKUN_BROKER_OTOMATIS` bukan `mati`, registrasi (`POST /devices`), ganti kunci, klaim, dan Nonaktifkan membuat/mengganti/menghapus akun broker perangkat di dalam transaksi database yang sama: broker gagal = database tidak berubah (`503`). Perintah yang sempat terkirim lewat jembatan yang macet bisa tetap dikerjakan broker begitu sambungannya pulih, jadi ulangi langkah yang sama sesudah broker menjawab lagi (`edge/README.md`, bagian "Batas jujur"). Perintahnya JSON di topik kontrol `$CONTROL/dynamic-security/v1` (`pusat`) atau `rpm-gerbang/<nama>/dynamic-security/v1` (`gerbang:<nama>`, dipindah jembatan ke broker gerbang); izinnya dua pasang baris untuk akun `backend` di `edge/acl-broker`. Izin topik perangkat, untuk menulis **dan** membaca, tetap pola `%u` Modul 21: sebelum setiap pembuatan akun, backend mengirim `setDefaultACLAccess` (izin baca bawaan untuk akun tanpa peran = tolak; bawaan plugin = izinkan, sehingga tanpa itu akun perangkat bisa membaca `rpm/#` perangkat lain, temuan verifikasi M28). Langkah akun broker dikerjakan satu per satu (antrean): paling banyak satu transaksi database menunggu broker, dan langkah yang menunggu giliran lebih dari 5 detik dijawab `503` tanpa dikerjakan. Akun perangkat lama Modul 21 (berkas sandi) tidak dikenal *dynamic security*: Nonaktifkan menjawab `akun_broker: "tidak-ada"` dan langkah `mosquitto_passwd -D` + *restart* broker. Pindah ke akun otomatis: ganti kunci perangkat itu (`POST /devices/:id/kunci` lewat Bruno; `/armada` tidak punya tombol ganti kunci), ketik kunci barunya di Serial, hapus baris lamanya dengan `mosquitto_passwd -D`, lalu *restart* broker (lihat `edge/README.md`).

**Berhenti sengaja.** Perangkat menerbitkan `status` `offline-mode` sebelum memasang firmware baru (dan sebelum `restart` dari Serial), lalu memutus MQTT dengan rapi (wasiat `offline` tidak terbit). Telegram menulis `🔄 <device_id> berhenti sengaja (pembaruan firmware atau restart), sebentar lagi online kembali`, lalu `✅ … online lagi sesudah berhenti sengaja (N detik)`; `📴 … tidak kembali sesudah berhenti sengaja` baru dikirim kalau perangkat tidak `online` dalam **3 menit** (rollback butuh sekitar 70 detik). Laporan harian tidak menghitungnya di `kali_terputus`.

## Diuji dengan database uji (Modul 29)

203 *unit test* lama (`npm test`) memakai tabel tiruan (`vi.mock`) dan server tanpa jaringan (`app.inject`): cepat dan tanpa Docker, tetapi tidak pernah menjalankan satu pun kueri SQL, jadi kesalahan di lapis `src/db/` lolos dari mereka. Contoh yang dibuktikan penulis: kalau `src/db/perangkat.ts` menulis sidik kunci dengan `upper($5)` (huruf besar), 203 tes tetap hijau, tetapi `CHECK (kunci_hash ~ '^[0-9a-f]{64}$')` di migrasi `010` menolak barisnya dan `POST /devices` dijawab `503`. **20 *integration test*** di [`src/integrasi/`](src/integrasi) menangkapnya: rute yang sama, lewat rakitan server yang sama dengan produksi (`buatApp()` di [`src/app.ts`](src/app.ts)), dengan database TimescaleDB **sungguhan** yang kosong dan sekali pakai.

1. Nyalakan database uji (satu baris, sama di PowerShell, Terminal macOS, dan Linux). Datanya di `--tmpfs` (memori), jadi hilang saat kontainernya berhenti; loket `5433` supaya tidak bertabrakan dengan database rumah di `5432`; sandinya bukan rahasia karena database ini hanya berisi data uji dan hanya bisa diketuk dari laptop ini:

   ```text
   docker run --rm -d --name rumahpintar-db-uji -p 127.0.0.1:5433:5432 --tmpfs /var/lib/postgresql/data -e POSTGRES_PASSWORD=uji-bukan-rahasia -e POSTGRES_DB=rumahpintar_uji -e TIMESCALEDB_TELEMETRY=off timescale/timescaledb:2.30.2-pg17
   ```

2. Tunggu sampai siap (sekitar 5 detik): ulangi perintah ini sampai menjawab `accepting connections`.

   ```text
   docker exec rumahpintar-db-uji pg_isready -h 127.0.0.1 -U postgres -d rumahpintar_uji
   ```

3. Jalankan tesnya dari folder `backend`:

   ```bash
   DATABASE_URL_UJI=postgres://postgres:uji-bukan-rahasia@127.0.0.1:5433/rumahpintar_uji npm run test:integrasi
   ```

   ```powershell
   $env:DATABASE_URL_UJI = "postgres://postgres:uji-bukan-rahasia@127.0.0.1:5433/rumahpintar_uji"
   npm run test:integrasi
   ```

   Setiap berkas tes menjalankan migrasi `001`–`011` lebih dulu (program yang sama dengan layanan `migrasi` di Compose; kalau sudah lengkap: `0 migrasi baru diterapkan`), lalu tesnya. Hasilnya `Test Files  6 passed (6)` dan `Tests  20 passed (20)`. Dengan `DATABASE_URL_UJI` terisi, `npm test` menjalankan 203 *unit test* dan 20 *integration test* sekaligus (`Tests  223 passed (223)`), seperti robot; tanpa itu `npm test` tetap tanpa Docker (`Tests  203 passed | 20 skipped (223)`).
4. Selesai: `docker stop rumahpintar-db-uji` (kontainernya terhapus sendiri karena `--rm`, datanya hilang bersama `--tmpfs`). PowerShell: hapus juga setelannya dari jendela itu, `Remove-Item Env:DATABASE_URL_UJI`; tanpa itu `npm test` berikutnya di jendela yang sama mencari database uji yang sudah mati (`database uji tidak bisa dihubungi`). Di bash setelan itu hanya berlaku untuk satu perintah.

| Berkas di `src/integrasi/` | Tes | Yang hanya bisa dibuktikan database sungguhan |
| :--- | :---: | :--- |
| `perangkat.test.ts` | 4 | daftar → hanya sidik SHA-256 yang tersimpan (`CHECK kunci_hash`); daftar ulang `409` tanpa menimpa baris; `GET /devices` tanpa kunci maupun sidiknya (tanpa *login*: `401`), dan `GET /health` menyebut versi `package.json` + `"database":true`; cabut → sidik dihapus, status `offline`, kejadian `dicabut` di `events` |
| `bacaan.test.ts` | 3 | riwayat 1 jam terakhir urut waktu (`ORDER BY ts`); ringkasan 15 menit dengan `time_bucket()` TimescaleDB hanya untuk perangkat itu; kiriman ganda = satu baris (`PRIMARY KEY` + `ON CONFLICT`) |
| `masuk.test.ts` | 4 | *login* (bcrypt; sesi tersimpan sebagai SHA-256 *refresh token*); sandi salah dan email asing sama-sama `401`; *refresh* memutar token dalam satu `UPDATE`; *logout* menghapus barisnya |
| `aturan.test.ts` | 3 | aturan tersimpan sebagai JSONB, isi tidak sah `400` tanpa baris baru; ganti → kolom `diubah` maju, nomor asing `404`; hapus → kejadiannya tetap ada dengan `aturan_id` `NULL` (`ON DELETE SET NULL`) |
| `klaim.test.ts` | 3 | kode ditukar sekali dalam satu transaksi, database hanya menyimpan sidik kodenya; kode terpakai `403`, perangkat aktif tidak bisa direbut kode baru (`409`, kode tidak hangus); kode kedaluwarsa `403` |
| `firmware-armada.test.ts` | 3 | unggah: ukuran dan SHA-256 tersimpan, versi sama `409`, perangkat mengunduh dengan kuncinya (`403` untuk kunci lain); rilis uji tidak pernah menjadi rilis terbaru, rilis yang ditarik keluar dari hitungan; `GET /armada` membaca kesehatan TERAKHIR dan pembaruan terakhir (`LATERAL`) |

Aturan main tes integrasi (semuanya di [`src/integrasi/siapkan.ts`](src/integrasi/siapkan.ts)):

- **Hanya database `…_uji`.** Nama database di `DATABASE_URL_UJI` wajib berakhiran `_uji` (diperiksa sebelum tersambung, lalu sekali lagi dengan `current_database()`), karena tes menulis dan menghapus baris. Alamat database rumahmu ditolak dengan `DATABASE_URL_UJI menunjuk database "rumahpintar", bukan database uji …`.
- **Tanpa broker, tanpa Telegram, tanpa rahasia sungguhan.** Setelan tes ditulis ulang sebelum kode server diimpor: `MQTT_URL` alamat mati, `JWT_SECRET` acak sekali pakai, `FIRMWARE_DIR` folder sementara, `AKUN_BROKER_OTOMATIS=mati`, Telegram kosong.
- **Setiap tes mandiri.** Setiap berkas memakai `device_id`, email, nama aturan, dan versi firmware miliknya sendiri, membersihkannya sebelum setiap tes, dan meninggalkan database kosong lagi. Vitest menjalankan berkas-berkas tes bersamaan; migrasinya diantre dengan `pg_advisory_lock`. Satu pengecualian: "rilis terbaru" dihitung dari SEMUA baris tabel `firmware`, jadi hanya `firmware-armada.test.ts` yang boleh menulis tabel itu, dan tesnya berhenti dengan pesan jelas (`tabel firmware di database uji berisi rilis lain …`) bila database uji pernah dipakai mengunggah firmware lain.
- **Di robot, tidak ada tes yang boleh dilewati.** Job `uji` merah bila keluaran `npm test` memuat `skipped` (misalnya `DATABASE_URL_UJI` salah ketik di `ci.yml`, sehingga 20 *integration test* diam-diam dilewati).

**Versi.** [`src/config/versi-server.ts`](src/config/versi-server.ts) membaca `version` dari `package.json` saat server menyala; nomor itu tampil di `GET /health` (`"versi":"2.0.0"`), di judul `/docs`, dan di baris log `backend Rumah Pintar Mini 2.0.0 menyala`. Menaikkan versi (misalnya 2.0.0 → 2.0.1): di folder `backend` DAN `frontend`, `npm version 2.0.1 --no-git-tag-version` (mengubah `package.json` dan dua tempat di `package-lock.json`, tanpa *commit* atau tag), lalu tiga baris `image:` di `compose.cloud.yml` dan entri baru `CHANGELOG.md` di akar proyek; robot memeriksa semuanya sama (`skrip/cek-versi.mjs`).

**Lint.** `npm run lint` menjalankan oxlint 1.89.0, versi yang sama dengan frontend (ESLint tidak dipakai: `typescript-eslint` belum menerima TypeScript 7), dengan [`.oxlintrc.json`](.oxlintrc.json): aturan bawaan oxlint (kelompok *correctness*: aturan inti ditambah *plugin* `typescript` dan `oxc`), sama dengan frontend tanpa `react`; *plugin* bawaan `unicorn` sengaja tidak dipakai (daftar `plugins` menggantikan bawaannya). Semua aturan itu bertingkat peringatan, jadi skripnya memakai `--deny-warnings`: satu peringatan pun membuat `npm run lint` berkode keluar 1 dan robot merah. Satu aturan sengaja dimatikan di satu baris, beserta alasannya, di `src/services/versi.test.ts` (perbandingan dua teks tetap yang memang sedang diuji).

## Keamanan perangkat dan broker (Modul 21)

Sampai Modul 20, backend membuat baris `devices` otomatis untuk perangkat **apa pun** yang mengirim pesan, dan siapa pun yang bisa menghubungi broker boleh menerbitkan ke topik mana pun. Modul 21 menutup keduanya.

- **Daftar resmi + kunci per perangkat.** Perangkat harus didaftarkan admin lewat `POST /devices`. Jawabannya memuat **kunci** 32 *byte* acak (43 huruf `base64url`) yang **hanya tampil sekali**; database hanya menyimpan sidik jari SHA-256-nya (seperti *refresh token* Modul 20). `POST /devices/:id/kunci` membuat kunci baru (yang lama langsung mati), `POST /devices/:id/cabut` mencabutnya. Jawaban registrasi juga memuat `langkah`: pasang kunci yang sama ke perangkat (ketik `kunci <isi>` di Serial Monitor, atau `KUNCI_<DEVICE_ID>=…` di `alat/.env` untuk simulator) dan ke broker (`mosquitto_passwd` di mesin broker). Perangkat ESP-NOW (Node 2) didaftarkan dengan `penghubung` (device\_id Node 1) dan **tidak** diberi kunci: datanya diterbitkan Node 1.
- **Lapis kedua di backend.** Walaupun broker sudah menjaga pintu, backend memeriksa lagi: pesan dari perangkat yang **belum terdaftar** atau **sudah dicabut** diabaikan seketika (dicatat `DIABAIKAN …` paling sering sekali semenit per perangkat, dihitung di `/health` sebagai `diabaikan`), perintah kepadanya dijawab 404/409, dan backend **tidak lagi** membuat baris `devices` otomatis. Jadi walaupun berkas sandi broker dan database sempat tidak sama, perangkat yang tidak berhak tetap tertolak.
- **Akun broker milik backend.** Backend masuk ke broker dengan akunnya sendiri (`MQTT_USERNAME`/`MQTT_PASSWORD` di `.env`, **bukan** di dalam `MQTT_URL`), bukan sebagai perangkat atau manusia. Kalau broker menolak akunnya (CONNACK 5), backend mencatatnya sekali dan mencoba lagi tiap 60 detik; begitu akunnya diperbaiki di broker dan broker dimuat ulang, backend pulih sendiri tanpa dijalankan ulang.
- **Broker (di luar backend).** Berkas contoh `edge/mosquitto-lan.conf`, `edge/gateway-pi.conf`, dan `edge/acl-broker` mengunci broker dengan `allow_anonymous false`, `password_file`, `acl_file` (pola `%u` = `device_id`), dan `use_username_as_clientid`; sejak Modul 26 versi kontainernya `edge/pusat.conf` (broker pusat Compose, tempat backend masuk sebagai `mqtt://mosquitto:1883`) dan `edge/gerbang.conf` (broker gerbang Pi). Lihat `edge/README.md`.

**🎉 Checkpoint Fase 3.** Rumah kini berkunci untuk manusia (akun, login, peran, pengaman API — Modul 20) *dan* untuk perangkat (kunci per perangkat, lapis kedua, akun broker, ACL — Modul 21). Yang **belum** aman, dan jujur disebut: lalu lintas MQTT dan HTTP masih tanpa enkripsi di LAN (kunci terbaca polos oleh penyadap di jaringan yang sama) — wajib TLS sebelum dibuka ke internet (Modul 27); kunci di NVS ESP32 terbaca siapa pun yang memegang papan (*flash encryption*, 🔬); dan hitungan *rate limit* masih di memori.

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
| `008_login_dan_sesi.sql` | `users.sandi_hash` (sidik jari bcrypt) dan `users.sandi_diubah`, email wajib huruf kecil, tabel `sesi` (SHA-256 *refresh token* sekarang dan sebelumnya, kedaluwarsa 7 hari; ikut terhapus bersama akunnya) |
| `010_kunci_perangkat.sql` | kolom kunci di `devices`: `terdaftar`, `kunci_hash` (SHA-256, 64 huruf heksadesimal), `kunci_dibuat`, `dicabut`, dan `penghubung` (Node 2 → Node 1); empat `CHECK` yang menjaga kunci, pencabutan, dan penghubung tetap konsisten (nomor 009 sengaja dilewati: dipakai Tantangan Tingkat 3 Modul 20) |
| `011_ota_dan_armada.sql` | Modul 28: tabel `firmware` (rilis: versi, ukuran ≤ 1.966.080, SHA-256, catatan, `uji`, pengunggah, `ditarik`), `pembaruan` (riwayat per perangkat: dari/ke versi, status, pesan, `canary`; satu yang berjalan per perangkat), `kode_klaim` (SHA-256 kode, kedaluwarsa ≤ 60 menit, sekali pakai); kolom `devices.fw`, `fw_dilihat`, `reset_reason`, `canary`, `jeda_vitals_s` (isi awal `fw` dari bacaan terbaru), `device_health.reset_reason` dan `fw`; jenis kejadian `ota`, `provisioning`, `dicabut`. Hanya menambah: backend 1.4.0 tetap jalan di atasnya |

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

Sejak Modul 26 database adalah layanan `db` di `compose.cloud.yml`, jadi perintahnya memakai `docker compose exec db` dan `docker compose cp db:…` (diketik dari **akar proyek**; folder `backup/` di sana tidak ikut Git). Fotokopi seluruh database dibuat **di dalam kontainer** (memakai `pg_dump` yang versinya pasti cocok), lalu disalin ke folder `backup/`:

```text
docker compose exec db pg_dump -U postgres -d rumahpintar -Fc -f /tmp/rumahpintar.dump
mkdir backup
docker compose cp db:/tmp/rumahpintar.dump backup/rumahpintar-2026-10-28.dump
```

Ganti `2026-10-28` di nama berkas dengan tanggal hari ini supaya backup-backup berikutnya tidak saling menimpa. Pada backup berikutnya, `mkdir backup` boleh dilewati karena foldernya sudah ada. Sejak Modul 20, fotokopi ini juga berisi akun dan sidik jari sandinya: simpan sebaik menyimpan `.env`. Akun database (peran `postgres`, `grafana_baca`) **tidak** ikut `pg_dump` satu database: di database yang benar-benar baru, `grafana_baca` dibuat lagi oleh layanan `akun-grafana` saat `docker compose up -d`. Lemari database jangan dicadangkan dengan menyalin isi lemarinya (`tar`) selama database menyala: hasilnya bisa rusak; pakai `pg_dump`.

Perintah di bagian ini sama persis di PowerShell (Windows), Terminal macOS, dan Linux. `pg_dump` menulis satu peringatan *circular foreign-key constraints* (`detail: continuous_agg`) beserta dua `hint`; itu wajar. Jangan membuat berkas dump dengan `>` (misalnya `pg_dump … > berkas.dump`): di Windows PowerShell 5.1 berkasnya rusak, jadi selalu pakai `-f` lalu `docker compose cp`. Di Git Bash, tulis `//tmp/…` (dua garis miring) karena Git Bash mengubah `/tmp/…` menjadi folder Windows. Sebelum Modul 26 (kontainer `rumahpintar-db` dari `docker run`), perintahnya sama dengan `docker exec rumahpintar-db` dan `docker cp rumahpintar-db:…`.

Membangun ulang di database baru `rumahpintar_pulih` (di kontainer yang sama; TimescaleDB harus versi yang sama, 2.30.2):

```text
docker compose cp backup/rumahpintar-2026-10-28.dump db:/tmp/pulih.dump
docker compose exec db createdb -U postgres -T template0 rumahpintar_pulih
docker compose exec db psql -U postgres -d rumahpintar_pulih -c "CREATE EXTENSION timescaledb;"
docker compose exec db psql -U postgres -d rumahpintar_pulih -c "SELECT timescaledb_pre_restore();"
docker compose exec db pg_restore -U postgres -d rumahpintar_pulih /tmp/pulih.dump
docker compose exec db psql -U postgres -d rumahpintar_pulih -c "SELECT timescaledb_post_restore();"
```

Jangan memakai `pg_restore -j`, dan jangan melewatkan `timescaledb_pre_restore()` atau `timescaledb_post_restore()`. Untuk membuktikan datanya sama, jalankan dulu `CALL run_job(…);` di `rumahpintar` dengan nomor *job* `Retention Policy` (nomornya terlihat lewat kueri `timescaledb_information.jobs` di bagian Database). Database salinan langsung menjalankan *job* retensinya begitu dipulihkan, jadi database asli harus sudah membuang jilid yang sama. Lalu jalankan kueri ini di psql pada `rumahpintar` dan `rumahpintar_pulih`, dan bandingkan satu barisnya:

```sql
SELECT (SELECT count(*) FROM readings) AS bacaan,
       (SELECT md5(string_agg(md5(r::text), '' ORDER BY r.device_id, r.ts)) FROM readings AS r) AS sidik_jari,
       (SELECT count(*) FROM readings_per_jam) AS ringkasan,
       (SELECT count(*) FROM show_chunks('readings')) AS jilid,
       (SELECT count(*) FROM timescaledb_information.jobs WHERE job_id >= 1000) AS tugas;
```

Setelah terbukti, hapus salinannya dengan `docker compose exec db dropdb -U postgres rumahpintar_pulih`. Uji pulih ke proyek Compose terpisah dengan lemari sendiri (tanpa menyentuh lemari `rumahpintar-data`) ada di Modul 26 Praktik 9. Jangan pernah memakai `docker compose down -v`, `docker volume rm rumahpintar-data`, atau `docker system prune --volumes` di laptop yang menyimpan riwayat asli.

## Catatan versi 2.0

Backend 2.0.0 dibuat di Modul 29 supaya setiap perubahan diuji robot, dibungkus menjadi cetakan untuk dua jenis prosesor, dan dipasang otomatis ke VPS dan Pi. Nomornya MAYOR karena cara memasang berubah, bukan API-nya.

- **Satu nomor versi produk**: backend 1.5.0 dan dashboard 1.4.0 menjadi `2.0.0`, sama dengan tag image di `compose.cloud.yml`, tag Git `v2.0.0`, dan entri teratas `CHANGELOG.md` di akar proyek. `package-lock.json` ikut bernomor sama (dua tempat).
- **`src/app.ts` (baru)**: `buatApp()` merakit server (log, satpam, `/docs`, semua rute) tanpa menyalakannya; isinya pindahan apa adanya dari `src/server.ts`, dengan pilihan `log: "galat-saja"` untuk tes. `src/server.ts` tinggal menyalakan database, aturan, Socket.IO, MQTT, Telegram, laporan, dan pengawas pembaruan, lalu mendengar di loketnya, plus satu baris log saat menyala: `backend Rumah Pintar Mini 2.0.0 menyala`.
- **`src/config/versi-server.ts` (baru)**: versi dari `package.json` untuk `GET /health` (kolom `versi`; kodenya tetap selalu `200`) dan OpenAPI `info.version` (sebelumnya `1.5.0` ditulis tangan; deskripsi `/docs` juga tidak lagi menyebut "Backend v1.4").
- **`src/integrasi/` (baru)**: `siapkan.ts` + 6 berkas, 20 *integration test* dengan database uji ([Diuji dengan database uji](#diuji-dengan-database-uji-modul-29)).
- **`package.json`**: skrip `lint` (oxlint) dan `test:integrasi`; alat pengembang baru `oxlint` 1.89.0 (versi persis, sama dengan lock frontend). Tidak ada paket produksi baru. **`.oxlintrc.json` (baru)**.
- **`Dockerfile`**: tahap `paket` = `FROM --platform=$BUILDPLATFORM`; folder `/app/data-firmware` dibuat di tahap itu lalu disalin dengan `COPY --chown=node:node` (tahap akhir tanpa `RUN`). Isi cetakan sama, folder firmware tetap milik `node`. **`.dockerignore`**: juga menahan `src/integrasi` dan `.oxlintrc.json`.
- Tanpa migrasi database, kontrak data tetap 1.6, Bruno tidak berubah. **Turun versi**: cetakan 1.5.0 tetap jalan di atas database yang sama (skemanya tidak berubah); yang hilang hanya `versi` di `/health`.
- **Tes**: 203 *unit test* lama di 25 berkas tetap hijau (satu-satunya ubahan: satu komentar oxlint di `src/services/versi.test.ts`), ditambah 20 *integration test* di 6 berkas.

## Catatan versi 1.5

Backend 1.5.0 dibuat di Modul 28 supaya Node 1 bisa diperbarui lewat udara, perangkat baru bisa mendaftar sendiri, dan admin bisa melihat serta mengurus seluruh armada.

- **Migrasi `011_ota_dan_armada.sql`** (tabel `firmware`, `pembaruan`, `kode_klaim`; kolom versi, alasan *restart*, *canary*, jeda vitals; jenis kejadian baru). Hanya menambah, jadi backend 1.4.0 tetap jalan di atasnya (jalan mundur).
- **Kontrak data 1.6** (`src/schemas/kontrak.ts`, disalin sama persis ke dashboard): `vitals` boleh membawa `reset_reason` + `fw` (selalu bersama) dan laporan `ota` (`id`, `hasil` `berhasil`/`rollback`/`gagal`, `versi`, `pesan` ≤ 80 huruf); skema `CmdUpdate` dan `Jeda`. **Backend 1.4.0 menolak `vitals` firmware 1.7.0** (`Kunci tidak dikenali`), jadi pasang backend 1.5.0 **sebelum** firmware 1.7.0. `ack` tidak berubah.
- **Rute baru**: `src/routes/firmware.ts` (unggah, daftar, tarik, unduh berkunci `/fw`), `src/routes/armada.ts` (`/armada`, update satu/canary/semua, riwayat, *canary*, jeda), `src/routes/klaim.ts` (kode klaim). Unggahan memakai `bodyLimit` 2 MiB **hanya di rute itu** dan badan mentah `application/octet-stream` (tanpa paket *multipart*).
- **Layanan baru**: `src/services/ota.ts` (syarat kirim `alasanTidakBisa()`, kirim + tunggu ack, laporan `vitals.ota`, penyimpulan, pengawas kedaluwarsa), `src/services/akun-broker.ts` (*dynamic security*: batas jawaban 3 detik, dicoba sekali lagi; pengatur waktu dipasang **sesudah** menerbitkan, pelajaran *unhandled rejection* dari calon kode lab), `src/services/versi.ts` (`bandingkanVersi()`, tanpa paket `semver`), `src/auth/kode-klaim.ts`, `src/db/armada.ts`, `src/db/klaim.ts`, `denganTransaksi()` di `src/db/pool.ts`.
- **Diubah**: `mqtt.ts` (`kirimUpdate` tidak *retained*, `config` gabungan ambang + jeda, `hapusConfig`, topik kontrol akun broker, `fw` dari `telemetry` dan `vitals`, kalimat `offline-mode` "berhenti sengaja"), `otomasi.ts` (`config` gabungan per perangkat, hanya untuk perangkat terdaftar), `arsip.ts` (`device_health.reset_reason`/`fw`; **pesan status tidak lagi memajukan `terakhir_dilihat`**), `routes/perangkat.ts` + `db/perangkat.ts` (akun broker di dalam transaksi; cabut = Nonaktifkan: status `offline`, `config` dihapus, kejadian `dicabut`), `telegram.ts` (`offline-mode`), `realtime.ts` (acara `ota`), `keamanan.ts` (`RUTE_TERBUKA` + `/fw` dan klaim), `env.ts`, `server.ts` (dua baris log saat menyala: alamat unduh firmware dan tempat akun broker).
- **Tes**: 8 berkas uji baru (`versi`, `kode-klaim`, `kontrak`, `akun-broker`, `ota`, rute `firmware`, `armada`, `klaim`) dan 6 berkas lama diperluas; `src/services/mqtt.test.ts` kini memberi tiruan tetangga barunya (tanpa itu berkas tes gagal dimuat karena `env.ts`).
- **Bruno**: 11 permintaan baru (armada, rilis, perbarui, riwayat, *canary*, perbarui canary/semua, tarik, buat kode, klaim perangkat tiruan, jeda). Unggah berkas biner: `curl` di atas.
- `Dockerfile`: folder `/app/data-firmware` milik pengguna `node` (lemari `data-firmware` yang masih kosong mewarisi pemiliknya). `.dockerignore` dan `.gitignore`: `data-firmware`. Tanpa paket npm baru (`package-lock.json` hanya berganti nomor versi). Versi `1.5.0` di `package.json`, `/docs`, dan tag cetakan.
- **Turun versi**: image 1.4.0 tetap jalan di atas skema 011 (kolom baru diabaikan), tetapi menolak `vitals` firmware 1.7.0 dan tidak punya rute armada.
- **Perbaikan sesudah verifikasi kode** (masih 1.5.0, belum terbit): izin baca bawaan akun perangkat *dynamic security* = tolak (`setDefaultACLAccess` sebelum `createClient`); langkah akun broker satu per satu (antrean, kolam database tidak habis saat broker diam); unggahan dengan versi/jenis salah dijawab `400` (bukan `500`); berkas sementara unggahan bernama unik (unggahan serentak versi yang sama tidak lagi merusak isi lemari); versi rilis tanpa nol di depan (juga CHECK migrasi 011); laporan `vitals.ota` ber-id asing = peringatan + kejadian `ota`; kalimat `409` canary tanpa istilah API. Sebelum BEKU: `ALAMAT_SERVER` diperiksa dengan batas yang bisa disimpan firmware 1.7.0 (paling panjang 64 huruf, huruf kecil, nama server tanpa `_`, port 1–65535, tanpa `/` di akhir; aturan yang sama dengan portal Node 1 dan simulator). 203 tes di 25 berkas.

## Catatan versi 1.4

Backend 1.4.0 dibuat di Modul 27 supaya backend aman dibuka dari internet di balik Caddy HTTPS.

- **`TRUST_PROXY`** (`src/config/env.ts`, skema Zod): kosong/`false` = mati, `true`, `uniquelocal`/`loopback`/`linklocal`, atau alamat/CIDR dipisah koma (huruf besar dan spasi dirapikan); angka ditolak dengan alasannya. Hasilnya dipakai `Fastify({ trustProxy })` di `src/server.ts`, dan satu baris log `penerus tepercaya (TRUST_PROXY): …` saat menyala. `compose.cloud.yml` mengisinya `uniquelocal` (bagian [Di internet, di balik Caddy HTTPS](#di-internet-di-balik-caddy-https-modul-27)). Kode *cookie* dan pembatas *login* tidak berubah; komentar di `src/auth/keamanan.ts` diperbarui.
- **`CORS_ORIGIN` diperiksa bentuknya**: setiap alamat harus `http(s)://nama[:port]` tanpa `/` di akhir dan tanpa jalur; yang lain menghentikan server dengan pesan `Setelan CORS_ORIGIN di .env: "…" bukan alamat halaman: …`. Isi yang sudah benar (Modul 20–26) tetap diterima.
- **Perintah tangan yang basi tidak dikirim lagi** (`src/services/perintah.ts`). Sejak Modul 19, perintah lampu, kipas, atau tirai yang tidak dijawab perangkat dalam 5 detik tetap "diinginkan" server dan dikirim lagi saat perangkat terdengar lagi (rekonsiliasi). Saat internet rumah putus, dashboard di VPS melaporkan perintah itu gagal, lalu kiriman susulan yang tiba belakangan membuat perintahnya dikirim lagi, bisa berjam-jam kemudian. Sejak v1.4, perintah dari dashboard/API dan Telegram yang **belum pernah** dikerjakan perangkat hanya dikirim lagi bila perangkat terdengar dalam **2 menit** sesudah percobaan terakhir; sesudah itu dilupakan dengan log `perintah lampu = true (api) ke … tidak dikerjakan lebih dari 2 menit: tidak dikirim lagi`. Keinginan aturan otomatis dan jadwal, serta keadaan yang sudah pernah dikerjakan lalu hilang karena perangkat menyala ulang, tetap dicocokkan seperti Modul 19. Diuji `src/services/perintah.test.ts`.
- **Sesi MQTT tetap** (`src/services/mqtt.ts`, `clean: false` bila backend masuk dengan akun, dengan nama klien = nama akun, misalnya `backend`): broker pusat mengingat langganan backend dan menahan pesan QoS 1 selama backend belum tersambung, lalu mengirimnya begitu backend masuk lagi. Tanpa ini, antrean jembatan Pi yang tiba sesaat sesudah broker pusat dinyalakan ulang (`docker compose restart mosquitto`, VPS *reboot*), lebih dulu daripada backend, hilang tanpa jejak; begitu juga bacaan yang tiba selama kontainer backend dibuat ulang. Log broker menulis `c0` (sesi tetap) di baris `New client connected … as backend (p4, c0, …)`. Backend tanpa akun (mode lama, nama klien acak) tetap bersesi bersih. Sesi ini hanya aman bila tidak ada klien lain yang bisa memakai nama `backend`: broker pusat menulis `use_username_as_clientid true` di **setiap** pintunya, termasuk pintu TLS 8883 di VPS (`edge/pusat-internet.conf`).
- **Tes baru**: `src/routes/proksi.test.ts` (7 tes), `src/services/perintah.test.ts` (4 tes), 6 tes tambahan di `src/config/env.test.ts`, dan 2 tes tambahan di `src/services/mqtt.test.ts` (nama klien dan sesi). Seluruhnya 118 tes di 17 berkas.
- **Bruno**: *environment* baru `bruno/environments/internet.yml` (`baseUrl` `https://iot.namaanda.my.id/api`).
- **Tanpa migrasi database dan tanpa paket npm baru** (`package-lock.json` hanya berganti nomor versi). Kontrak data naik ke **1.5** (alamat broker di internet dan aturan simpan-teruskan jembatan) tanpa perubahan bentuk pesan, jadi skema `src/schemas/kontrak.ts` tidak berubah; firmware tidak berubah.
- **Turun versi**: backend 1.3 tetap jalan dengan database dan `.env` yang sama (setelan `TRUST_PROXY` diabaikan), hanya kembali ke *cookie* tanpa `Secure` dan pembatas *login* bersama di balik Caddy.
- `Dockerfile` dan `.dockerignore` tidak berubah isinya (hanya komentar versi di kepala `Dockerfile`). Versi `1.4.0` di `package.json`, di `/docs`, dan di tag cetakan (`…/rumah-pintar-mini-backend:1.4.0`).

## Catatan versi 1.3

Backend 1.3.0 dibuat di Modul 26 supaya backend bisa dikemas menjadi cetakan (*image*) dan dijalankan Docker Compose bersama layanan lain.

- **`pino-pretty` pindah dari `devDependencies` ke `dependencies`** (`package.json` + `package-lock.json`: versi tetap 13.2.0, hanya tanda `"dev": true` miliknya dan dependensinya yang hilang). Logger `src/server.ts` memakainya saat server berjalan, jadi cetakan yang hanya memasang paket produksi (`npm ci --omit=dev`) dengan versi 1.2 mogok: `Error: unable to determine transport target for "pino-pretty"`.
- **Skrip `start`, `migrasi`, `isi-riwayat`, dan `pengguna` memakai `--env-file-if-exists=.env`** (Node 24): tanpa berkas `.env` (di kontainer, setelan datang dari Compose) skripnya tetap jalan dengan pesan `.env not found. Continuing without it.`, bukan berhenti dengan `node: .env: not found`. `dev` tetap `--env-file=.env`: mode kembang wajib punya `.env`.
- **Ketukan `/health` yang berhasil tidak dicatat di log** (`perluDicatat()` di `src/services/log.ts`, diuji `src/services/log.test.ts`): healthcheck Docker mengetuk `HEAD /health` setiap 15 detik. `/health` yang gagal (kode 400 ke atas) dan semua alamat lain tetap tercatat.
- **`Dockerfile` dan `.dockerignore` baru** (bagian [Menjalankan dengan Docker Compose](#menjalankan-dengan-docker-compose-modul-26)). Healthcheck ditulis di `compose.cloud.yml`, bukan di `Dockerfile`, supaya ada di satu tempat.
- **`.env.example`** kini untuk mode kembang: `MQTT_URL=mqtt://127.0.0.1:1883` (broker pusat di laptop, layanan `mosquitto` Compose; sebelumnya alamat IP Pi), komentar tentang `.env` akar dan aturan satu backend.
- Komentar `RUTE_TERBUKA` di `src/auth/keamanan.ts` diperbarui (healthcheck Docker memakai `HEAD /health`); kode pengamannya tidak berubah.
- **Tanpa migrasi database dan tanpa paket npm baru.** Kontrak data tetap **1.4**; firmware tidak berubah.
- **Turun versi**: backend 1.2 tetap jalan sebagai mode kembang dengan database yang sama; sebagai kontainer (`--omit=dev`) 1.2 mogok karena `pino-pretty`.
- Versi `1.3.0` di `package.json`, di `/docs`, dan di tag cetakan (`…/rumah-pintar-mini-backend:1.3.0`).

## Catatan versi 1.2

Backend 1.2.0 dibuat di Modul 25 supaya dashboard 1.1 bisa menggambar peta perangkat dan supaya laporan harian datang sendiri lewat Telegram.

- **`lat` dan `lng` di `GET /devices`** (`BarisPerangkat` dan `KOLOM` di `src/db/perangkat.ts`, skema `Perangkat` dan `tampilkan()` di `src/routes/perangkat.ts`). Bentuk jawaban lain tidak berubah; klien lama cukup mengabaikan dua kolom baru ini.
- **`PUT /devices/:id/lokasi`** (admin): skema `Lokasi` (Zod: `lat` −90..90, `lng` −180..180, angka berhingga, berpasangan; `null` + `null` menghapus titik; kolom lain ditolak) dan `ubahLokasi()` di `src/db/perangkat.ts`. `PUT` sudah ada di `methods` CORS sejak Modul 19, jadi dashboard bisa memanggilnya dari browser tanpa perubahan `src/auth/keamanan.ts`.
- **Laporan harian**: `src/services/csv.ts` (resep CSV Modul 23 di server), `src/services/laporan.ts` (rentang kemarin WIB, kueri ringkasan, `buatLaporanCsv()`, jadwal node-cron `timezone: "Asia/Jakarta"` dengan `noOverlap` dan pencatat jadwal terlewat seperti `src/services/jadwal.ts`), `kirimBerkas()` dan `alasanTelegramMati()` di `src/services/telegram.ts` (bot yang sama, `sendDocument`), `LAPORAN_JADWAL` di `src/config/env.ts` (cron 5 bidang; 6 bidang ditolak karena artinya lain), dan rute `POST /laporan/kirim` (`src/routes/laporan.ts`). Jadwal laporan ikut berhenti rapi lewat `hentikanJadwal()` (`cron.shutdown()`).
- **`.env.example`**: `LAPORAN_JADWAL=0 7 * * *` dan baris berkomentar `# TELEGRAM_API_ROOT=` (setelan yang sudah ada sejak Modul 19 tetapi belum pernah tertulis).
- **Tanpa migrasi database dan tanpa paket npm baru**: `lat`/`lng` sudah ada sejak migrasi `001`, node-cron 4.6.0 dan grammY 1.46.0 sudah dipakai sejak Modul 19. Kontrak data tetap **1.4**; firmware tidak berubah.
- **Turun versi**: backend 1.1 yang menerima database yang sama tetap jalan (titik peta tersimpan di kolom yang memang sudah ada); hanya laporan dan rute barunya yang hilang.
- **Perbaikan: 📴 palsu sesudah broker dimulai ulang** (`src/services/mqtt.ts`). Saat broker berhenti, wasiat `offline` setiap perangkat terbit dan backend mulai menunggu 60 detik sebelum mengirim 📴. Kalau perangkat tersambung lagi LEBIH DULU dari backend, kabar `online`-nya tiba sebagai pesan *retained*, dan v1.1 mengabaikan pesan *retained* untuk Telegram: 📴 palsu terkirim semenit kemudian, lalu 📴 berikutnya untuk perangkat itu tidak pernah datang sampai backend dimulai ulang. Sejak v1.2, `online` *retained* juga membatalkan 📴 yang sedang menunggu (dua baris, diuji `src/services/mqtt.test.ts`).
- **Jadwal laporan memakai jam jadwalnya**: jadwal yang baru berjalan beberapa menit kemudian (misalnya `LAPORAN_JADWAL=50 23 * * *` dan laptop baru bangun pukul 00.01) tetap melaporkan hari sebelum jam jadwal itu, bukan hari yang baru saja berakhir.
- Versi `1.2.0` di `package.json` dan di `/docs`.

## Catatan versi 1.1

Backend 1.1.0 dibuat di Modul 24 supaya dashboard v1.0 bisa membuat aturan "siram jika tanah < 30 %" dan menghapus aturan.

- **Kondisi `ambang-bawah`** (`nyala_di_bawah`, `padam_di_atas`, `selama_detik`), dinilai otak yang sama dengan kondisi `ambang` (`nilaiAmbangBawah` di `src/aturan/mesin.ts`).
- **Aksi `perintah` untuk kondisi ambang** (naik atau turun): dikirim sekali saat aturan menyala. Pasangan yang ditolak tinggal jadwal + sakelar, dengan pesan `400` baru `kondisi jadwal berpasangan dengan aksi perintah; aksi sakelar hanya untuk kondisi ambang atau ambang-bawah` (v1.0: `kondisi ambang berpasangan dengan aksi sakelar; kondisi jadwal dengan aksi perintah`, dan ambang + perintah masih ditolak).
- **`DELETE /rules/:id`** (admin), dan `DELETE` ditambahkan ke `methods` CORS di `src/auth/keamanan.ts` supaya browser lolos *preflight*. Kejadian `aturan-diubah` untuk aturan yang dihapus ditulis dengan `aturan_id` kosong (nomornya ada di `data.id`), karena barisnya sudah tidak ada. Perintah dan kejadian aturan yang dihapus saat perintahnya masih menunggu *ack* juga tetap tercatat, dengan `aturan_id` kosong.
- **Aturan yang dihapus atau dinonaktifkan tidak bertindak lagi**, juga lewat rekonsiliasi: keadaan yang diinginkannya dilupakan (`lupakanKeinginanAturan()` di `src/services/perintah.ts`). Di v1.0, lampu yang dinyalakan aturan yang sudah dinonaktifkan dinyalakan lagi saat perangkatnya menyala ulang.
- **`data.ok` di kejadian `aturan` dan `jadwal`**: `true` kalau perangkat menjawab ok, `false` kalau perintahnya ditolak, tidak dijawab, tidak terkirim, atau jadwalnya terlewat, `null` kalau tidak ada perintah yang dikirim (aturan siap lagi). Dashboard v1.0 memakainya untuk warna kabar, tanpa menebak dari kalimat.
- **Pengingat Telegram** aturan `perintah` berbunyi `… — aturan "Siram jika tanah < 30 %" belum siap lagi (menunggu tanah di atas 35) (pengingat)`, bukan "masih menyala": pompanya sudah lama padam.
- **Skema dipecah dua**: `src/schemas/aturan-dasar.ts` (semua bentuk aturan, hanya butuh `zod` dan `kontrak.ts`, disalin identik ke `frontend/src/skema/`) dan `src/schemas/aturan.ts` (menambah pemeriksaan cron dengan node-cron, hanya di server). Berkas lain di backend tetap mengimpor dari `aturan.ts`.
- **Tanpa migrasi database**: kondisi dan aksi disimpan sebagai JSON (`jsonb`), dan `commands.aturan_id` serta `events.aturan_id` sudah `ON DELETE SET NULL` sejak migrasi `007`. Kontrak data tetap **1.4**; firmware tidak berubah.
- **Turun versi**: backend v1.0 yang membaca aturan berbentuk baru tidak mogok; aturan itu dilewati dengan peringatan `aturan N dilewati: …` (lihat `muatAturan()`), aturan lainnya tetap berjalan. Aturan yang dilewati juga TIDAK tampil di `GET /rules` v1.0 (dashboard seolah kehilangan aturan itu); datanya utuh di database dan tampil lagi begitu naik ke 1.1. Jangan menyimpan aturan bernomor itu lewat `PUT` v1.0: isinya akan ditimpa bentuk v1.0.
- Versi `1.1.0` di `package.json` dan di `/docs`.

<a id="batasan-v15"></a>

## Batasan v2.0

- `GET /devices/:id/latest`, `vitals`, dan `state` masih dibaca dari memori, jadi kosong lagi setiap server dimulai ulang. Keadaan yang diinginkan (`desired`) dan hitungan "selama" setiap aturan juga hilang saat server dimulai ulang; riwayat bacaan, perintah, aturan, kejadian, akun, dan sesi tersimpan permanen di database.
- Bacaan yang datang saat database tidak bisa dihubungi tidak tersimpan.
- Bacaan mentah hanya disimpan 90 hari; yang lebih tua tinggal ringkasan per jamnya.
- Hari pada ringkasan `1d` adalah hari WIB (`Asia/Jakarta`), juga bagi perangkat di WITA atau WIT. Jadwal aturan juga dihitung dalam WIB.
- Aturan dan jadwal hanya berjalan selama backend menyala. Jadwal yang terlambat lebih dari 15 menit (misalnya laptop tidur pukul 06.00) tidak dijalankan belakangan, hanya dicatat; kalau backend mati pada jam itu, tidak ada yang dicatat. Saat broker tak terjangkau, Node 1 menjalankan pengaman kipasnya sendiri dengan ambang dari `config`.
- **Laporan harian juga hanya terkirim selama backend menyala** (Modul 25). Laptop yang tidur lebih dari 15 menit melewati `LAPORAN_JADWAL` tidak mengirimnya belakangan: log dan Telegram hanya mencatat `⏰ Laporan harian pada … terlewat`; kirim manual dengan `POST /laporan/kirim`. Kalau backend mati pada jam itu, tidak ada catatan sama sekali. Sejak Modul 26, backend di kontainer dinyalakan lagi oleh Docker kalau berhenti sendiri, tetapi hanya selama Docker (Docker Desktop di laptop) menyala: laptop yang tidur tetap melewatkan jadwal. Sejak Modul 27, backend bisa tinggal di VPS (atau Pi) yang menyala terus. Laporan hanya dikirim ke satu chat (`TELEGRAM_CHAT_ID`), dan laporan hari pertama (kemarin belum ada data) memang kosong: pakai `?hari=ini`. Broker yang dimulai ulang terhitung satu kali putus (`kali_terputus`) untuk setiap Node 1 yang tersambung saat itu: wasiat `offline`-nya memang terbit.
- **`devices.terakhir_dilihat`** sejak v1.5 hanya dimajukan `telemetry` dan `vitals`, tidak lagi oleh pesan `status` (wasiat `offline` dari broker, status Node 2 yang diterbitkan Node 1, status *retained* yang dikirim ulang broker saat backend menyala). Untuk "kapan perangkat terakhir mengirim BACAAN" (misalnya *alert* "node diam" di Grafana, Modul 25), tetap pakai `readings.diterima` bacaan terbarunya.
- Perubahan aturan langsung di database (misalnya lewat DBeaver) baru terbaca saat server dimulai ulang atau saat aturan lain diubah lewat API; pakai API `/rules`.
- **Aturan otomatis dimuat sekali saat server menyala.** Kalau database belum bisa dihubungi saat itu, log menulis `aturan otomatis belum bisa dimuat: …` dan tidak mencoba lagi (daftar perangkat dicoba lagi setiap 10 detik): aturan tidak bertindak dan layar **Aturan** kosong, padahal backend tetap `(healthy)`. Di Compose, `docker compose up` menunggu database siap lebih dulu, tetapi sesudah laptop dinyalakan ulang atau Docker Desktop dibuka, Docker menyalakan semua kontainer sekaligus tanpa urutan itu. Gejala itu muncul? `docker compose restart backend`.
- Aturan dengan aksi `perintah` (misalnya pompa sekali) hanya bertindak saat aturannya berganti keadaan. Karena hitungannya hilang saat server dimulai ulang atau aturannya diubah, perintahnya dikirim sekali lagi kalau kondisinya masih terpenuhi sesudah itu.
- Menonaktifkan atau menghapus aturan kipas **tidak** mencabut `config` *retained* `suhu_kipas_on` yang sudah terkirim: Node 1 tetap memakai angka terakhir itu sebagai pengaman lokal saat broker tak terjangkau.
- Menghapus atau menonaktifkan aturan `sakelar` yang sedang menyala **tidak** memadamkan aktuatornya: kipas atau lampu dibiarkan dalam keadaan terakhir (server tidak mengirim perintah apa pun). Padamkan lewat tombol dashboard atau `POST /devices/:id/command`.
- Backend hanya mengirim `suhu_kipas_on`, tidak pernah `tanah_siram`. Node 1 v1.6.0 tetap menyiram sendiri (3 detik, lalu jeda 30 detik) kalau tanah di bawah ambang lokalnya, bawaan 30 %, juga saat backend menyala. Supaya aturan siram di server yang bertindak lebih dulu, turunkan ambang lokal di bawah ambang aturan server lewat Serial Monitor (`ambang 20`); siram lokal lalu baru bertindak kalau tanah tetap mengering sampai di bawah 20 %, misalnya saat backend mati atau WiFi putus. Pengaman tandon firmware (`pompa ditolak: air tandon kurang` di bawah 20 %) tetap menjaga keduanya.
- Gelang (JWT akses) yang sudah dibagikan tetap berlaku sampai kedaluwarsa (paling lama 15 menit), juga sesudah *logout*, ganti peran, ganti sandi, atau hapus akun; sambungan Socket.IO yang sedang berjalan pun baru diputus saat gelangnya habis (kecuali *logout* dari sesi itu sendiri, atau kartu terusan lama yang dipakai lagi 30 detik atau lebih sesudah diganti, yang langsung memutusnya).
- Hitungan *rate limit* disimpan di memori satu server: dimulai ulang = nol, dan tidak cocok untuk beberapa server sekaligus.
- *Cookie* hanya `Secure` di balik HTTPS dengan `TRUST_PROXY` terisi (Modul 27); di `http://localhost` dan mode HP (`http://<IP laptop>`) tetap tanpa `Secure`. Mode kembang: server hanya menerima tamu dari laptop ini (`HOST=127.0.0.1`). Mode rumah: di dalam kontainer `HOST=0.0.0.0` (supaya Caddy dan healthcheck bisa masuk), tetapi loket di laptop (dan di VPS) tetap `127.0.0.1:8080`, dan dashboard lewat Caddy hanya di `127.0.0.1` kecuali `ALAMAT_WEB` diubah (mode HP, atau `0.0.0.0` di VPS).
- **`TRUST_PROXY=uniquelocal` memercayai SEMUA alamat privat**, bukan hanya Caddy. Di VPS, program yang berjalan di VPS itu sendiri dan mengetuk loket `127.0.0.1:8080` lewat Docker juga datang dari alamat privat lorong, jadi ia bisa menulis `X-Forwarded-For` palsu (misalnya untuk lolos dari pembatas *login*). Hanya pemegang akses ke VPS yang bisa melakukannya. Tamu dari internet selalu lewat Caddy, yang menimpa kepala palsu mereka.
- **Saat internet rumah putus, backend di VPS tidak tahu.** Perangkat tetap tampil `online` (status *retained* dari jembatan) dengan angka yang membeku, aturan otomatis di server diam (tidak ada bacaan baru, dan bacaan susulan lebih dari 60 detik diabaikan aturan), dan pengaman lokal Node 1 TIDAK menyala karena broker Pi tetap terjangkau (siram lokal tetap jalan). Sesudah tersambung lagi, bacaan susulan masuk database dengan `ts` aslinya (tanpa dobel: `kiriman ganda dilewati`) dan ikut disiarkan ke dashboard *live* sekaligus, berurutan dari yang tertua. Kabar jembatan (`$SYS/broker/connection/jembatan-pi/state`) belum dibaca backend. Selama backend tidak tersambung, broker pusat hanya menahan pesan QoS 1 (yang lewat jembatan) dan paling banyak 1000 pesan (bawaan Mosquitto); pesan QoS 0 yang langsung masuk broker pusat (perangkat tanpa gerbang) tetap hilang.
- **Perintah tangan yang tidak dijawab** dikirim lagi hanya bila perangkat terdengar dalam 2 menit (v1.4); di dalam 2 menit itu, perintah yang sempat dilaporkan gagal masih bisa dikerjakan belakangan.
- **`/health` selalu menjawab 200**, juga saat broker atau database putus (isinya `broker: false` / `database: false`). Healthcheck Docker hanya membuktikan "proses hidup dan menjawab", dan status `unhealthy` tidak membuat Docker menyalakan ulang kontainer. `/health` yang menjawab 503 saat ada yang putus, dan pemantau sungguhan, menyusul di Modul 30.
- **Swagger UI tidak bisa dipakai lewat Caddy** (`http://localhost/api/docs`): aset halamannya dicari di alamat yang salah, dan tombol **Try it out** memanggil API tanpa awalan `/api`. Pakai loket backend: `http://localhost:8080/docs`.
- **Di jaringan rumah, lalu lintas MQTT masih tanpa enkripsi** (Node 1 ke broker Pi, port 1883): nama pengguna dan kunci perangkat terkirim polos di LAN (buktikan sendiri dengan `alat/penyadap.js`). Yang keluar ke internet sejak Modul 27 terenkripsi: dashboard dan API lewat HTTPS (Caddy), jembatan Pi → VPS lewat TLS di port 8883. Backend sendiri tetap memakai `mqtt://mosquitto:1883` polos di dalam lorong Docker (tidak pernah keluar dari VPS). Kunci di NVS ESP32 juga terbaca siapa pun yang memegang papan (*flash encryption*, 🔬).
- **Pembaruan firmware hanya untuk Node 1** (Node 2 ESP-NOW tidak tersambung ke router: perbarui lewat kabel). Perintah update hanya untuk perangkat yang sedang `online`: tidak diantre. Hasil akhirnya bergantung pada laporan perangkat (`vitals.ota`); tanpa laporan, backend menyimpulkan dari versi sesudah perangkat menyala ulang, atau menandai `kedaluwarsa`. Backend tidak bisa membuktikan sendiri bahwa rollback terjadi di papan.
- **Berkas firmware hanya di lemari `data-firmware`**, bukan di database: `docker compose down -v` menghapusnya (unggah lagi berkas yang **sama persis**: dipulihkan `200`; isi lain dengan versi yang sama tetap ditolak `409`). Ikutkan lemari itu di resep cadangan.
- **SHA-256 di perintah update = pemeriksaan keutuhan, bukan tanda tangan.** Siapa pun yang memegang akun admin dashboard bisa mengunggah firmware apa pun (*signed firmware* = 🔬 Modul 28).
- **Akun broker otomatis**: siapa pun yang boleh menulis topik kontrol (`$CONTROL/dynamic-security/v1`, `rpm-gerbang/+/dynamic-security/v1`) adalah admin akun broker; di `edge/acl-broker` hanya akun `backend`. Kunci perangkat ikut lewat topik itu (di dalam lorong Docker, dan lewat jembatan TLS 8883 di jalur utama). Saat jembatan putus, perintah akun tidak ditahan (dicoba sekali lagi, lalu `503`). Akun lama Modul 21 di berkas sandi harus dipindah tangan.
- **Perangkat yang dinonaktifkan**: status `online` *retained* lamanya bisa tertinggal di broker (akun `backend` tidak boleh menulis topik `status`); backend mengabaikannya (lapis kedua). Grafana "Node diam" bisa mengirim `✅ … kembali mengirim data.` saat perangkat yang sedang 🔴 dinonaktifkan (perangkat itu hilang dari kueri): pesan itu berarti "tidak lagi dipantau", bukan "kembali". Perbaikan *alert* = Modul 30.
- **Kode klaim** dibatasi 10 percobaan per menit per alamat IP di memori (dimulai ulang = nol). Perangkat di belakang satu router rumah berbagi satu alamat IP.
- **Akun yang boleh menulis `rpm/+/cmd`** (backend, `nodered` Modul 13) kini juga bisa memerintahkan pembaruan firmware. Firmware 1.7.0 hanya mengunduh dari alamat server yang tersimpan padanya dan memeriksa SHA-256, jadi akun itu tidak bisa memasang berkas dari luar atau memanen kunci, tetapi masih bisa menyuruh perangkat memasang rilis lain yang ada di server (misalnya versi lama yang belum ditarik). Laporan pembaruan yang id-nya tidak pernah dikirim server ini dicatat sebagai peringatan + kejadian `ota`. Jaga sandi `nodered`; tarik rilis lama yang buruk.
- **Langkah akun broker satu per satu.** Saat broker atau jembatan diam, langkah kedua dan seterusnya (daftar, ganti kunci, klaim, Nonaktifkan) menunggu giliran paling lama 5 detik, lalu `503` tanpa dikerjakan: ulangi sesudah broker menjawab lagi.
- **Jalan mundur broker** (kembali ke `edge/*.conf` Modul 27 tanpa plugin *dynamic security*): semua akun perangkat yang dibuat, diganti, atau diklaim di Modul 28 hilang dari otentikasi. Pertahankan dua baris `plugin …`, atau buat dulu akun itu dengan `mosquitto_passwd` (lihat `edge/README.md`).
- **Tes integrasi belum mencakup semua SQL armada dan klaim** (Modul 29). Yang diuji dengan database uji: kode klaim sekali pakai, kode kedaluwarsa, perangkat aktif tidak bisa direbut, rilis dan tanda uji, unduhan berkunci, kueri `/armada`. Yang masih hanya dibuktikan di lab penulis dengan database sungguhan: satu pembaruan berjalan per perangkat (indeks unik), dua perangkat yang menukar kode yang sama bersamaan (`FOR UPDATE`), laporan yang menimpa `kedaluwarsa`, dan penyimpulan hasil pembaruan.
- **Tes integrasi butuh Docker dan image `timescale/timescaledb:2.30.2-pg17`** (unduhan sekitar 535–552 MB, terpasang sekitar 2 GB). Tanpa `DATABASE_URL_UJI` tes itu dilewati di laptop, tetapi robot menjalankannya di setiap *pull request*.
- **Versi rilis tanpa nol di depan.** Unggahan dan perintah pembaruan hanya menerima `x.y.z` tanpa nol di depan dan paling banyak 5 angka per bagian (`1.07.1` ditolak `400`); versi yang DILAPORKAN perangkat tetap mengikuti kontrak data (`x.y.z` biasa, supaya firmware lama tidak tiba-tiba ditolak).
- Daftar perangkat terdaftar dimuat ke memori saat server menyala; perubahan `devices` langsung di database (bukan lewat API) baru terbaca saat server dimulai ulang. `GET /devices` sendiri selalu dibaca segar dari database.
- **`npm audit` menulis `4 moderate severity vulnerabilities`** (per 4 Nov 2026; oxlint, alat pengembang baru Modul 29, tidak menambah satu pun). Robot hanya merah untuk celah `high` atau `critical` di paket produksi (`npm audit --omit=dev --audit-level=high`, kode keluar `0` per 4 Nov 2026); laporan lengkap tetap dibaca manusia lewat butir *pull request*. Keempatnya satu rantai milik halaman `/docs`: `@fastify/swagger-ui` 6.1.2 → `@fastify/static` 10.1.6 → `glob` 13.0.6 → `minimatch` 10.2.6 ([GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4), [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)). Perbaikannya baru ada di `glob` 14.0.2 dan `minimatch` 11.0.1 (versi besar baru), sedangkan semua versi `@fastify/static`, juga yang terbaru (10.1.8), masih meminta `glob` 13: `npm update` di dalam rentang versi `package.json` tidak menghapus satu pun. **Jangan** menjalankan `npm audit fix --force`: menurut baris `Will install …`-nya, "perbaikan" itu memasang `@fastify/swagger-ui` 2.1.0 yang kuno. Di backend ini `glob` tidak pernah dipanggil: `@fastify/static` hanya memakainya untuk pilihan `wildcard: false`, sedangkan Swagger UI memakai bawaan `wildcard: true`. Tunggu rilis `@fastify/static` yang memakai `glob` 14.
