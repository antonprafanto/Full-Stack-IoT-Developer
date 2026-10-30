# Dockerfile - cetakan (image) backend Rumah Pintar Mini (Modul 26; isinya tetap sama di 1.4.0, Modul 27).
# Dua tahap ("multi-stage"):
#   tahap "paket": memasang library npm persis menurut package-lock.json, TANPA alat pengembang (TypeScript, Vitest, Vite)
#   tahap akhir  : Node.js 24 + library dari tahap "paket" + kode src/ dan migrasi/, berjalan sebagai pengguna "node" (bukan root)
# Tidak ada tahap kompilasi: Node 24 menjalankan berkas .ts langsung (type stripping, Modul 16).
# Dibangun dari folder proyek dengan: docker compose build backend   (atau: docker build -t rumah-pintar-mini-backend:1.4.0 ./backend)

# Tag persis, bukan "latest" atau "24-alpine": cetakan yang sama hari ini dan bulan depan. Alpine = image Node terkecil;
# bcrypt membawa versi siap pakai untuk Alpine (musl), jadi tidak perlu kompiler.
FROM node:24.22.1-alpine3.24 AS paket
WORKDIR /app
# package*.json disalin LEBIH DULU daripada kode: selama daftar library tidak berubah, lapisan "npm ci" diambil dari cache
# dan build ulang sesudah mengubah kode hanya beberapa detik.
COPY package.json package-lock.json ./
# --omit=dev: alat pengembang tidak ikut. Sejak 1.3.0, pino-pretty ada di "dependencies" karena dipakai saat server berjalan
# (tanpa itu server di kontainer mogok: unable to determine transport target for "pino-pretty"). Cache npm tidak perlu
# dibersihkan: tahap ini dibuang, hanya folder node_modules yang dibawa ke tahap akhir.
RUN npm ci --omit=dev

FROM node:24.22.1-alpine3.24
# Menautkan image di GHCR ke repositori GitHub-mu (Modul 26 Praktik 10). Ganti <akun> dengan nama akun GitHub-mu (huruf
# kecil) dan rumah-pintar-mini dengan nama repositorimu bila berbeda. Tanpa label ini, paket di GHCR tidak tertaut ke repo.
LABEL org.opencontainers.image.source="https://github.com/<akun>/rumah-pintar-mini"
ENV NODE_ENV=production
WORKDIR /app
COPY --from=paket /app/node_modules ./node_modules
COPY package.json ./
COPY migrasi ./migrasi
COPY src ./src
# Pengguna "node" (uid 1000) sudah tersedia di image node. Server tidak butuh hak root: kalau ada celah, kerusakannya lebih kecil.
USER node
# Hanya catatan "server ini mendengar di 8080 di dalam kontainer". Loket di laptop diatur compose.cloud.yml (ports).
EXPOSE 8080
# Bentuk daftar (exec), bukan "npm start": sinyal berhenti dari Docker (SIGTERM) langsung sampai ke Node, jadi backend
# berhenti dengan rapi. Tanpa --env-file: di kontainer, setelan datang dari Docker Compose (environment), bukan dari .env.
CMD ["node", "src/server.ts"]
