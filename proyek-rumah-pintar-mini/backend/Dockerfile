# Dockerfile - cetakan (image) backend Rumah Pintar Mini (Modul 26; 1.4.0 Modul 27; 1.5.0 Modul 28: + folder firmware;
# 2.0.0 Modul 29: satu cetakan untuk DUA jenis prosesor tanpa emulasi).
# Dua tahap ("multi-stage"):
#   tahap "paket": memasang library npm persis menurut package-lock.json, TANPA alat pengembang (TypeScript, Vitest, oxlint)
#   tahap akhir  : Node.js 24 + library dari tahap "paket" + kode src/ dan migrasi/, berjalan sebagai pengguna "node" (bukan root)
# Tidak ada tahap kompilasi: Node 24 menjalankan berkas .ts langsung (type stripping, Modul 16).
# Mulai Modul 29 cetakan ini dibangun ROBOT (GitHub Actions, .github/workflows/ci.yml) untuk linux/amd64 (VPS) dan linux/arm64
# (Pi) sekaligus, lalu dikirim ke GHCR; VPS dan Pi hanya menarik. Membangun sendiri di laptop tetap bisa:
#   docker compose build backend   (atau: docker build -t rumah-pintar-mini-backend:<versi> ./backend, versi = package.json)

# Tag persis, bukan "latest" atau "24-alpine": cetakan yang sama hari ini dan bulan depan. Alpine = image Node terkecil;
# bcrypt membawa versi siap pakai untuk Alpine (musl), jadi tidak perlu kompiler.
# Modul 29: --platform=$BUILDPLATFORM = tahap ini SELALU berjalan di prosesor mesin pembangun (runner amd64 robot, atau laptopmu),
# juga saat membangun cetakan arm64 untuk Pi: tanpa emulasi QEMU, jadi secepat membangun untuk satu prosesor. Aman karena
# library di sini JavaScript biasa, kecuali bcrypt, yang membawa versi siap pakai linux-x64 DAN linux-arm64 (musl) di dalam
# paketnya dan memilih yang cocok saat server berjalan.
FROM --platform=$BUILDPLATFORM node:24.22.1-alpine3.24 AS paket
WORKDIR /app
# package*.json disalin LEBIH DULU daripada kode: selama daftar library tidak berubah, lapisan "npm ci" diambil dari cache
# dan build ulang sesudah mengubah kode hanya beberapa detik. (Nomor versi juga tertulis di package*.json, jadi build untuk
# versi baru selalu menjalankan npm ci lagi.)
COPY package.json package-lock.json ./
# --omit=dev: alat pengembang tidak ikut. Sejak 1.3.0, pino-pretty ada di "dependencies" karena dipakai saat server berjalan
# (tanpa itu server di kontainer mogok: unable to determine transport target for "pino-pretty"). Cache npm tidak perlu
# dibersihkan: tahap ini dibuang, hanya folder node_modules yang dibawa ke tahap akhir.
RUN npm ci --omit=dev
# Modul 29: folder firmware dibuat DI SINI (prosesor pembangun), lalu disalin ke tahap akhir: tahap akhir tanpa RUN sama sekali
RUN mkdir -p /app/data-firmware

# Tahap akhir = prosesor SASARAN (amd64 atau arm64). Hanya COPY, tanpa RUN: tidak ada program yang perlu DIJALANKAN untuk
# prosesor lain, jadi tidak perlu emulator.
FROM node:24.22.1-alpine3.24
# Menautkan image di GHCR ke repositori GitHub-mu (Modul 26 Praktik 10). Ganti <akun> dengan nama akun GitHub-mu (huruf
# kecil) dan rumah-pintar-mini dengan nama repositorimu bila berbeda. Tanpa label ini, paket di GHCR tidak tertaut ke repo.
# Modul 29: cetakan yang dibangun robot mendapat label ini otomatis (ci.yml, labels:) dan menimpa baris ini; baris ini tetap
# berguna untuk cetakan yang kamu bangun dan kirim sendiri.
LABEL org.opencontainers.image.source="https://github.com/<akun>/rumah-pintar-mini"
ENV NODE_ENV=production
WORKDIR /app
COPY --from=paket /app/node_modules ./node_modules
COPY package.json ./
COPY migrasi ./migrasi
COPY src ./src
# Modul 28: folder berkas firmware (.bin) yang diunggah admin, milik pengguna node. compose.cloud.yml memasang lemari
# data-firmware di sini; lemari yang masih kosong mengambil pemilik folder ini, jadi backend (bukan root) bisa menulisnya.
# Modul 29: disalin dari tahap "paket" dengan pemilik node (--chown), pengganti RUN mkdir && chown di tahap ini.
COPY --from=paket --chown=node:node /app/data-firmware /app/data-firmware
# Pengguna "node" (uid 1000) sudah tersedia di image node. Server tidak butuh hak root: kalau ada celah, kerusakannya lebih kecil.
USER node
# Hanya catatan "server ini mendengar di 8080 di dalam kontainer". Loket di laptop diatur compose.cloud.yml (ports).
EXPOSE 8080
# Bentuk daftar (exec), bukan "npm start": sinyal berhenti dari Docker (SIGTERM) langsung sampai ke Node, jadi backend
# berhenti dengan rapi. Tanpa --env-file: di kontainer, setelan datang dari Docker Compose (environment), bukan dari .env.
CMD ["node", "src/server.ts"]
