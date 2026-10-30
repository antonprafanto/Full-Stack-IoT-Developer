#!/bin/sh
# perbarui-sertifikat-mqtt.sh - Modul 27, HANYA di VPS (jalur utama). Caddy memperbarui sertifikat Let's Encrypt-nya sendiri
# (menurut jadwal penerbitnya; untuk Let's Encrypt kira-kira saat sepertiga umurnya tersisa), tetapi broker Mosquitto tidak
# ikut membaca yang baru. Skrip ini dijalankan cron VPS seminggu sekali: salin lagi sertifikat broker (layanan
# sertifikat-mqtt), lalu muat ulang broker tanpa mematikannya (kill -HUP 1 di dalam kontainer: PID sama, jembatan Pi tidak
# putus).
# Baris cron (crontab -e di VPS, satu baris; ganti /home/rumah/rumah-pintar-mini dengan folder proyekmu):
#   17 3 * * 1 sh /home/rumah/rumah-pintar-mini/skrip/perbarui-sertifikat-mqtt.sh >> /home/rumah/perbarui-sertifikat.log 2>&1
# Mencoba sekali dengan tangan (dari akar proyek): sh skrip/perbarui-sertifikat-mqtt.sh
# Penjadwal yang lebih lengkap (systemd timer, pemantau) menyusul di Modul 30.
set -eu

# pindah ke akar proyek (folder di atas skrip/), tempat compose.cloud.yml dan .env berada
cd "$(dirname "$0")/.."
echo "=== $(date '+%Y-%m-%d %H:%M:%S %Z') perbarui sertifikat broker"
docker compose run --rm sertifikat-mqtt
# Muat ulang dijalankan SETIAP minggu, juga saat salinan di atas menulis "tidak berubah": "docker compose up -d" (misalnya
# sesudah git pull) ikut menyalin sertifikat baru tanpa memuat ulang broker, jadi "tidak berubah" belum berarti broker sudah
# memakai sertifikat itu. Muat ulang membaca SELURUH konfigurasi lagi, termasuk acl-broker: daftar izin yang salah ketik
# membuat broker berhenti saat cron berjalan (Senin 03.17 jam VPS), tanpa ada yang menunggui. Sesudah mengubah acl-broker
# atau *.conf, selalu "docker compose restart mosquitto" saat itu juga (Modul 21) dan periksa lognya, jangan menunggu
# skrip ini. (Jangan memeriksa dengan "mosquitto --test-config" di kontainer yang sedang jalan: proses uji itu menimpa
# berkas antrean dan pesan retained broker, mosquitto.db, dengan basis data kosong milik root.)
docker compose exec -T mosquitto kill -HUP 1
echo "broker dimuat ulang"
