# Kunci Tantangan 3 Modul 26: simulator dalam kontainer (profil `simulasi`)

**Tugas:** laptop teman yang tidak punya Node.js, Kit A, atau Kit B tetap mendapat data *live* dari satu perangkat palsu. Buat cetakan
untuk folder `alat/` (`alat/Dockerfile`), lalu layanan `simulator` dengan profil `simulasi` yang mengirim data ke broker pusat. Berkas
utama `compose.cloud.yml` **tidak diubah**: layanan baru ditulis di berkas Compose tambahan.

| Berkas kunci | Ditaruh di proyek sebagai |
| :--- | :--- |
| [`alat/Dockerfile`](alat/Dockerfile) | `alat/Dockerfile` (satu tahap `node:24.22.1-alpine3.24`, `npm ci --omit=dev`, folder `data/` milik `node`, `USER node`) |
| [`alat/.dockerignore`](alat/.dockerignore) | `alat/.dockerignore` (`node_modules`, `.env`, `data`) |
| [`compose.simulasi.yml`](compose.simulasi.yml) | `compose.simulasi.yml` di akar proyek, di sebelah `compose.cloud.yml` |

## Langkah

1. Salin tiga berkas di atas ke tempatnya.
2. Di `.env` akar, ganti baris `COMPOSE_FILE` supaya Compose membaca dua berkas sekaligus (pemisah `:` di Linux, macOS, dan Pi; `;` di
   Windows):
   ```text
   COMPOSE_FILE=compose.cloud.yml:compose.simulasi.yml
   ```
3. Daftarkan perangkat latihan `f00d00000001` (sekali saja per database), sebagai admin: Bruno `daftarkan perangkat latihan` (loket
   `127.0.0.1:8080`), atau tanpa Bruno lewat `http://localhost:8080/docs` → `POST /auth/login` lalu `POST /devices` dengan **Try it out**.
   Jawabannya `201` dan memuat `kunci` (tampil sekali). Simpan di pengelola sandi.
4. Buat akun broker `f00d00000001` di broker pusat dengan sandi = kunci itu, lalu nyalakan ulang broker (dari akar proyek):
   ```text
   docker compose exec -u mosquitto mosquitto mosquitto_passwd /mosquitto/data/sandi-broker f00d00000001
   docker compose restart mosquitto
   ```
5. Tambahkan kuncinya ke `.env` akar: `KUNCI_F00D00000001=<kunci dari langkah 3>`.
6. `docker compose --profile simulasi up -d`. Pertama kali, Compose mencari dulu image `rumah-pintar-mini-alat:1.0.0` di Docker Hub
   (`simulator Warning pull access denied for rumah-pintar-mini-alat, repository does not exist or may require 'docker login'`: wajar,
   image ini memang hanya ada di laptopmu), lalu membangunnya dari `alat/Dockerfile` (`rumah-pintar-mini-alat:1.0.0  Built`).
7. `docker compose logs simulator` → `1 perangkat palsu menuju mqtt://mosquitto:1883. …` dan `f00d00000001: online`. Angka
   `diterima` di `http://localhost/api/health` naik setiap 10 detik, dan di dashboard (`http://localhost`) perangkat itu tampil
   **Online** dengan data yang bergerak, seperti simulator di Modul 22–25.
8. Menghentikan: `docker compose --profile simulasi stop simulator` (atau `--profile simulasi down` bersama seluruh rumah; `down` tanpa
   `--profile simulasi` membiarkan simulator tetap jalan).

## Yang perlu diperhatikan

- **`init: true`.** Simulator tidak punya penangan sinyal berhenti, dan Node sebagai proses pertama di kontainer (PID 1) mengabaikan
  SIGTERM. Tanpa `init: true`, `docker compose stop simulator` menunggu 10 detik lalu mematikannya paksa (lab: 10,5 detik); dengan
  `init: true`, 0,5 detik. Status `offline` perangkat tetap terbit lewat wasiat (*Last Will*) yang dikirim broker.
- **`${KUNCI_F00D00000001:-}`, bukan `:?`.** Compose memeriksa variabel di SELURUH berkas, termasuk layanan berprofil yang tidak
  dinyalakan. Dengan `:?`, `docker compose up -d` biasa (tanpa simulator) pun berhenti dengan `required variable KUNCI_F00D00000001 is
  missing a value`. Tanpa kunci, menurut kodenya simulator menulis `f00d00000001: kunci belum ada di alat/.env …` (di kontainer, artinya
  `.env` akar), lalu berhenti dengan kode 1, dan Docker mencobanya lagi dengan jeda yang makin panjang (tidak diuji di lab).
- **`image:` + `build:` dengan nama lokal dan tag persis.** Tanpa `image:`, Compose menamai cetakannya sendiri dengan tag `latest`.
  Peringatan *pull access denied* hanya muncul selama image belum ada di laptop.
- **`logging` ditulis lengkap.** Anchor `*log` di `compose.cloud.yml` tidak bisa dirujuk dari berkas lain.
- **Mengetik perintah simulator** (`suhu 33`, `kebun mulai`) tidak bisa di kontainer ini (tidak ada terminal yang tersambung). Untuk itu,
  jalankan simulator dengan Node seperti biasa (`alat/README.md`).
- Cara lain yang juga benar: menempel blok `simulator` ke dalam `compose.cloud.yml`. Kunci ini memakai berkas terpisah supaya berkas
  utama tetap sama dengan milik teman sekelasmu.

## Hasilnya (lab penulis)

Raspberry Pi 5, Ubuntu 26.04 arm64, Docker Engine 29.1.3, Compose 2.40.3, 28 Okt 2026 ±16.44–16.47 WIB. Proyek lab `m26kode` (loket
6080–6084), berkas kunci dipakai apa adanya; hanya jalur `build` diarahkan ke salinan lab folder `alat/` + dua berkas kunci (berkas
ketiga `-f` khusus lab). Perangkat didaftarkan lewat `POST /api/devices` (Caddy) → `201` + `kunci`; akun broker → `Adding password for
user f00d00000001`.

```text
$ docker compose --profile simulasi up -d          # 30,2 detik (npm ci 12 detik), exit 0
 simulator Pulling
 simulator Warning pull access denied for rumah-pintar-mini-alat, repository does not exist or may require 'docker login'
 ...
#9 11.52 added 51 packages, and audited 52 packages in 10s
 ...
 rumah-pintar-mini-alat:1.0.0  Built
 Container m26kode-simulator-1  Started
$ docker compose logs simulator
simulator-1  | 1 perangkat palsu menuju mqtt://mosquitto:1883. Ketik misalnya "suhu 33", "tanah 25", "tandon 15", "tanah acak", atau "kebun mulai". Hentikan dengan Ctrl+C.
simulator-1  | f00d00000001: online
$ curl -s http://localhost/api/health
{"ok":true,"broker":true,"database":true,"diterima":5,"ditolak":0,"diabaikan":0}
```

Dashboard tidak dibuka di uji ini (yang diperiksa: log simulator dan `diterima` di `/health`, 5 lalu 14 bacaan).
Image `rumah-pintar-mini-alat:1.0.0`: 267 MB di disk, 67,6 MB terkompres, `arm64`, `User=node`. RAM simulator ±37 MiB. `up -d`
berikutnya (image sudah ada): `simulator Running`, tanpa peringatan. Dengan `--profile simulasi` saja (tanpa berkas tambahan di
`COMPOSE_FILE`) Compose tidak mengenal layanan `simulator` sama sekali.
