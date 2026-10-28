# Kunci Tantangan 2 Modul 26: Uptime Kuma (profil `pantau`) dan satu monitor lewat nama layanan

**Tugas:** nyalakan layanan `uptime-kuma` yang sudah tertulis di `compose.cloud.yml` dengan profil `pantau`, selesaikan wizard-nya
(database SQLite + akun admin), lalu buat **satu** monitor HTTP yang memeriksa backend lewat **nama layanan**. Tanpa notifikasi dan
tanpa monitor lain: pemantauan sungguhan (Telegram, halaman status, monitor broker dan database) adalah Modul 30.

Tidak ada berkas kunci: semuanya diatur lewat layar Uptime Kuma, dan datanya tersimpan di lemari `data-kuma` (milik Compose).

## Langkah

1. Dari akar proyek: `docker compose --profile pantau up -d`. Hanya `uptime-kuma` yang baru dibuat; layanan lain tetap `Running`
   (sekali-jalan berjalan sekali lagi lalu `Exited`). Unduhan pertama `louislam/uptime-kuma:2.5.8-slim` sekitar 183 MB (878 MB di disk).
   Cara lain: tulis `COMPOSE_PROFILES=pantau` di `.env` akar, lalu cukup `docker compose up -d`.
2. Tunggu sampai `docker compose ps uptime-kuma` menulis `Up …` (sekitar 10 detik sampai halaman bisa dibuka; tanda `(healthy)` baru
   muncul belakangan), lalu buka **`http://localhost:3001`** di laptop (loketnya `127.0.0.1:3001`, hanya laptop ini).
3. Layar pertama **Which database would you like to use?**: pilih **SQLite** (bukan **MariaDB/MySQL**), lalu **Next**. Uptime Kuma
   menyiapkan databasenya (sekitar 15 detik).
4. Layar **Create your admin account**: isi **Username**, **Password**, **Repeat Password** (sandi baru dari pengelola sandi, bukan
   sandi lain milikmu), lalu **Create**. Nama tombol di kunci ini = layar berbahasa Inggris (browser lab penulis); bahasa layar bisa
   diganti lewat pilihan **Language** (ada **Bahasa Indonesia**), dan bisa saja langsung mengikuti bahasa browsermu.
5. Di dashboard (**No Monitors, please add one**): **Add New Monitor**.
   - **Monitor Type**: biarkan **HTTP(s)** (bawaan).
   - **Friendly Name**: `Backend`.
   - **URL**: **`http://backend:8080/health`**.
   - **Heartbeat Interval**: biarkan `60` (sekali semenit). **Notifications**: jangan diatur.
   - **Save**.
6. Dalam beberapa detik monitor **Backend** berwarna hijau: **Up**, pesan `200 - OK`.

**Kenapa `backend:8080`, bukan `localhost:8080`?** Uptime Kuma berjalan di kontainernya sendiri; di dalam kontainer itu, `localhost`
adalah Uptime Kuma sendiri. Karena `uptime-kuma` tertulis di `compose.cloud.yml`, ia ikut lorong rumah `rumahpintar_default`, dan di
lorong itu setiap layanan dikenal dengan namanya: `backend` = kontainer backend, port `8080` = port di DALAM kontainernya (bukan loket
laptop). Monitor ini memakai `GET /health`; backend 1.3.0 tidak mencatat ketukan `/health` yang berhasil, jadi log backend tetap
bersih walau diketuk setiap menit.

**Batas monitor ini:** `/health` backend 1.3.0 menjawab `200` selama prosesnya hidup, termasuk saat broker atau database putus (isinya
`"broker":false` / `"database":false`). Jadi monitor ini hanya menjawab "backend hidup?", belum "rumah sehat?". Pemeriksaan yang lebih
jujur dan kabar ke Telegram dibahas di Modul 30.

## Menghentikan dan membersihkan

- **Penting:** `docker compose down` **tanpa** `--profile pantau` TIDAK menghentikan Uptime Kuma. Di lab penulis kontainernya tetap
  `Up`, dan lorong rumah tidak bisa dihapus (`Network rumahpintar_default  Resource is still in use`). Pakai
  `docker compose --profile pantau down` (atau `COMPOSE_PROFILES=pantau` di `.env`).
- Mematikan Uptime Kuma saja: `docker compose --profile pantau stop uptime-kuma`.
- Akun dan monitor tersimpan di lemari `data-kuma` milik Compose; mereka ikut terhapus hanya oleh `down -v` (yang tetap dilarang).

## Hasilnya (lab penulis)

Raspberry Pi 5, Ubuntu 26.04 arm64, Docker Engine 29.1.3, Compose 2.40.3, Chrome 156 tanpa layar, 28 Okt 2026 ±16.41–16.43 WIB.
Proyek lab `m26kode` dan loket lab `127.0.0.1:6085` (pengganti 3001).

- `--profile pantau up -d` 7,2 detik (image sudah ada); `uptime-kuma Up 13 seconds (health: starting)`. Halaman `/` menjawab
  `302` ke `/setup-database` sekitar 15 detik sesudah kontainer dibuat. Log: `Starting Setup Database`, `Waiting for user action...`.
- Sebelum wizard, dari dalam kontainer Uptime Kuma: `docker compose exec uptime-kuma curl -sS http://backend:8080/health` →
  `{"ok":true,"broker":true,"database":true,"diterima":0,"ditolak":0,"diabaikan":0}` (200), dan `getent hosts backend` → alamat
  kontainer backend di lorong.
- Wizard (layar persis): **Which database would you like to use?** → pilihan **MariaDB/MySQL** dan **SQLite** → **Next** → **Create
  your admin account** (**Username**, **Password**, **Repeat Password**, **Create**) → dashboard **No Monitors, please add one** →
  **Add New Monitor** (**Monitor Type** bawaan `HTTP(s)`, **Friendly Name**, **URL**, **Heartbeat Interval (Check every 60 seconds)**)
  → **Save**.
- Monitor: **Backend**, `http://backend:8080/health`, **Check every 60 seconds (1 minute)**, **Up**, Response 25 ms, baris kejadian
  `Up  2026-10-28 16:43:03  200 - OK`. Log backend dalam 3 menit itu: 0 baris `/health`.
- RAM Uptime Kuma ±185 MiB (tanpa monitor lain).
- `docker compose down` tanpa `--profile`: semua layanan bawaan `Removed`, tetapi `m26kode-uptime-kuma-1 Up 5 minutes (healthy)` dan
  `Network m26kode_default  Resource is still in use` (exit 0). `docker compose --profile pantau … down` → `uptime-kuma Removed`,
  `Network … Removed`.
