# Dockerfile - cetakan (image) web Rumah Pintar Mini (Modul 26; PWA sejak Modul 27, layar Armada sejak Modul 28, nomor versi
# di layar dan image dua prosesor sejak Modul 29, versi 2.0.0). Dua tahap ("multi-stage"):
#   tahap "bangun": Node.js mengubah kode React + TypeScript menjadi berkas siap saji (npm run build -> folder dist/,
#                   termasuk manifest.webmanifest dan service worker sw.js sejak Modul 27)
#   tahap akhir   : hanya Caddy + isi dist/. Node.js, node_modules, dan kode sumber tertinggal di tahap bangun.
# Modul 29: image yang dipakai VPS dan Pi dibangun ROBOT (GitHub Actions, .github/workflows/ci.yml) untuk dua jenis prosesor
# sekaligus, linux/amd64 (VPS, kebanyakan laptop) dan linux/arm64 (Raspberry Pi, Mac Apple silicon), lalu dikirim ke GHCR;
# VPS dan Pi hanya menariknya. Di laptop kamu tetap bisa membangunnya sendiri dari folder proyek: docker compose build web
# (atau dari folder ini saja, tanpa folder backend: docker build -t rumah-pintar-mini-web:<versi> . , versi = package.json)

# Tag persis (sama dengan cetakan backend), bukan "latest": cetakan yang sama hari ini dan bulan depan.
# Modul 29: --platform=$BUILDPLATFORM = tahap ini selalu berjalan di prosesor MESIN PEMBANGUN (robot GitHub: amd64), juga saat
# membangun image arm64. Hasilnya (dist/: HTML, CSS, JavaScript) sama untuk semua prosesor, jadi prosesor lain tidak perlu
# ditiru (QEMU, lambat). Hanya tahap akhir (Caddy) yang diambil sesuai prosesor tujuan.
FROM --platform=$BUILDPLATFORM node:24.22.1-alpine3.24 AS bangun
WORKDIR /app
# package*.json disalin LEBIH DULU daripada kode: selama daftar library tidak berubah, lapisan "npm ci" diambil dari cache
# dan build ulang sesudah mengubah kode jauh lebih cepat. (Nomor versi juga tertulis di package*.json, jadi build untuk
# versi baru selalu menjalankan npm ci lagi.) Semua library ikut (termasuk alat pengembang TypeScript dan Vite), karena tahap
# ini memang membangun; tidak satu pun ikut ke image akhir.
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Alamat API DIBAKAR ke JavaScript saat build: Vite mengganti import.meta.env.VITE_API_BASE dengan teks ini. "/api" =
# jalur di alamat halaman yang sama, diteruskan Caddy ke backend (caddy/Caddyfile). Mengubahnya = build ulang image.
# Isinya alamat, BUKAN rahasia: semua VITE_... ikut terkirim ke browser siapa pun.
ARG VITE_API_BASE=/api
RUN npm run build

# Tahap akhir: Caddy (tanpa Node.js). Tag persis.
FROM caddy:2.11.7-alpine
# Menautkan image di GHCR ke repositori GitHub-mu (Modul 26 Praktik 10). Ganti <akun> dengan nama akun GitHub-mu (huruf
# kecil) dan rumah-pintar-mini dengan nama repositorimu bila berbeda. Modul 29: image buatan robot mendapat label source
# dari robot sendiri (labels: di ci.yml, menimpa baris ini), jadi baris ini hanya berpengaruh pada image yang kamu bangun
# sendiri. Keterangan (description) menggantikan keterangan bawaan image Caddy di image satu prosesor yang kamu kirim
# sendiri. Image dua prosesor buatan robot berupa indeks: menurut dokumen GHCR, halaman paketnya mengambil keterangan dari
# annotations indeks, bukan dari LABEL ini.
LABEL org.opencontainers.image.source="https://github.com/<akun>/rumah-pintar-mini" \
      org.opencontainers.image.description="Dashboard Rumah Pintar Mini (React) disajikan Caddy"
# Caddyfile bawaan di dalam image, supaya image ini bisa dicoba sendirian (docker run). Docker Compose memasang folder
# caddy/ dari repo di atasnya.
COPY caddy/Caddyfile /etc/caddy/Caddyfile
# Hanya hasil build yang dibawa dari tahap bangun: berkas HTML, CSS, JavaScript, ikon, manifest, dan sw.js (sekitar 1 MB).
COPY --from=bangun /app/dist /srv
# Tanpa CMD dan EXPOSE: image Caddy sudah membawanya ("caddy run --config /etc/caddy/Caddyfile --adapter caddyfile",
# port 80 di dalam kontainer). Loket di laptop diatur compose.cloud.yml (ports).
