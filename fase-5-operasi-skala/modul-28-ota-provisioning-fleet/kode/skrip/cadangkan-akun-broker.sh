#!/bin/sh
# cadangkan-akun-broker.sh - Modul 28: salin akun broker dari lemari Docker ke folder backup/ (tidak ikut Git):
#   - dynamic-security.json = akun PERANGKAT yang dibuat backend (kode klaim, ganti kunci) + akun admin plugin
#   - sandi-broker          = akun layanan (backend, jembatan-pi, pemantau, ...) dan akun perangkat lama Modul 21
#   - data-firmware/        = berkas firmware yang diunggah admin (hanya di PUSAT, tempat layanan backend berjalan)
# Lemari broker dan lemari firmware milik Compose: "docker compose down -v" menghapusnya. Tanpa cadangan ini, setiap perangkat
# harus diberi kunci baru dan setiap firmware diunggah ulang. Pelengkap resep cadangan database Modul 26 (pg_dump).
#
# Jalankan dari AKAR proyek untuk broker pusat (laptop, VPS, Pi jalur gratis):  sh skrip/cadangkan-akun-broker.sh
#           dari folder edge di Pi untuk broker gerbang:                     sh ../skrip/cadangkan-akun-broker.sh
# Hasilnya: backup/akun-broker-<tanggal-jam>/ di folder tempat perintah diketik, hanya bisa dibaca pemiliknya. Isinya RAHASIA
# (sidik jari sandi, dan berkas .bin Node 1 bisa berisi kunci ESP-NOW): jangan dikirim ke forum, isu, atau AI.
#
# Memulihkan ke lemari baru (broker belum pernah menyala dengan Modul 28, atau lemarinya hilang), dari folder yang sama:
#   docker compose cp backup/akun-broker-<tanggal-jam>/dynamic-security.json mosquitto:/mosquitto/data/
#   docker compose cp backup/akun-broker-<tanggal-jam>/sandi-broker mosquitto:/mosquitto/data/
#   docker compose restart mosquitto        (saat menyala, image menyerahkan kedua berkas ke pengguna mosquitto)
#   pusat saja: docker compose cp -a backup/akun-broker-<tanggal-jam>/data-firmware/. backend:/app/data-firmware/
#               (-a: berkas jadi milik pengguna kontainer, node)
set -eu

tujuan="backup/akun-broker-$(date +%Y-%m-%d-%H%M)"
mkdir -p "$tujuan"
chmod 700 "$tujuan"

# docker compose cp menyalin dari kontainer layanan yang sedang menyala (lemarinya ikut terbaca)
for berkas in dynamic-security.json sandi-broker; do
  if docker compose cp "mosquitto:/mosquitto/data/$berkas" "$tujuan/$berkas" 2>/dev/null; then
    echo "disalin: $berkas"
  else
    echo "tidak ada: $berkas (broker belum pernah memakai berkas ini, atau layanan mosquitto tidak menyala)"
  fi
done

# Berkas firmware hanya ada di pusat. Di gerbang (folder edge) tidak ada layanan backend: dilewati.
if docker compose ps --services --status running 2>/dev/null | grep -qx backend; then
  docker compose cp backend:/app/data-firmware "$tujuan/data-firmware"
  echo "disalin: data-firmware ($(find "$tujuan/data-firmware" -name '*.bin' | wc -l) berkas .bin)"
fi

chmod -R go-rwx "$tujuan"
echo "selesai: $tujuan"
