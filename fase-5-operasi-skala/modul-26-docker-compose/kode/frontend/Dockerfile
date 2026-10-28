# Dockerfile - cetakan (image) web Rumah Pintar Mini 1.2.0 (Modul 26). Dua tahap ("multi-stage"):
#   tahap "bangun": Node.js mengubah kode React + TypeScript menjadi berkas siap saji (npm run build -> folder dist/)
#   tahap akhir   : hanya Caddy + isi dist/. Node.js, node_modules, dan kode sumber tertinggal di tahap bangun.
# Dibangun dari folder proyek dengan: docker compose build web   (atau dari folder ini saja, tanpa folder backend:
# docker build -t rumah-pintar-mini-web:1.2.0 .)

# Tag persis (sama dengan cetakan backend), bukan "latest": cetakan yang sama hari ini dan bulan depan.
FROM node:24.22.1-alpine3.24 AS bangun
WORKDIR /app
# package*.json disalin LEBIH DULU daripada kode: selama daftar library tidak berubah, lapisan "npm ci" diambil dari cache
# dan build ulang sesudah mengubah kode jauh lebih cepat. Semua library ikut (termasuk alat pengembang TypeScript dan Vite),
# karena tahap ini memang membangun; tidak satu pun ikut ke image akhir.
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
# kecil) dan rumah-pintar-mini dengan nama repositorimu bila berbeda. Keterangan (description) menggantikan keterangan
# bawaan image Caddy, supaya halaman paketmu di GHCR tidak menulis bahwa isinya "web server Caddy" saja.
LABEL org.opencontainers.image.source="https://github.com/<akun>/rumah-pintar-mini" \
      org.opencontainers.image.description="Dashboard Rumah Pintar Mini (React) disajikan Caddy"
# Caddyfile bawaan di dalam image, supaya image ini bisa dicoba sendirian (docker run). Docker Compose memasang folder
# caddy/ dari repo di atasnya.
COPY caddy/Caddyfile /etc/caddy/Caddyfile
# Hanya hasil build yang dibawa dari tahap bangun: berkas HTML, CSS, JavaScript, dan ikon (sekitar 1 MB).
COPY --from=bangun /app/dist /srv
# Tanpa CMD dan EXPOSE: image Caddy sudah membawanya ("caddy run --config /etc/caddy/Caddyfile --adapter caddyfile",
# port 80 di dalam kontainer). Loket di laptop diatur compose.cloud.yml (ports).
