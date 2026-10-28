# Dockerfile - kunci Tantangan 3 Modul 26: cetakan (image) simulator perangkat dari folder alat/.
# Satu tahap saja: alat/ tidak punya langkah build (berkas .js langsung dijalankan Node), dan library-nya hanya mqtt +
# socket.io-client, jadi image-nya sudah kecil tanpa tahap kedua.
# Taruh berkas ini di alat/Dockerfile (bersama alat/.dockerignore). Dibangun oleh Compose: layanan simulator di
# compose.simulasi.yml (build: ./alat).

# Tag persis, sama dengan cetakan backend dan web.
FROM node:24.22.1-alpine3.24
WORKDIR /app
# daftar library dulu, kodenya belakangan (cache lapisan npm ci, sama seperti backend/Dockerfile)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY *.js ./
# simulator menyimpan "NVS" perangkat palsu di data/arsip-simulator.json. Folder /app milik root, jadi folder data/
# dibuat di sini dan diserahkan ke pengguna node; tanpa itu simulator gagal menulis (EACCES) saat menerima perintah config.
RUN mkdir data && chown node:node data
USER node
# Bentuk daftar (exec), bukan "npm start". Simulator tidak menangani sinyal SIGTERM, dan Node sebagai PID 1 mengabaikannya:
# karena itu layanan simulator di compose.simulasi.yml memakai "init: true". Alamat broker dan jumlah perangkat ditulis
# di compose.simulasi.yml (command), bukan di sini.
CMD ["node", "simulator-perangkat.js"]
