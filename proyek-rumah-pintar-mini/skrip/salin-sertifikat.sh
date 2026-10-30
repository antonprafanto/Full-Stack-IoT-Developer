#!/bin/sh
# salin-sertifikat.sh - Modul 27. Dijalankan layanan sekali jalan "sertifikat-mqtt" di compose.cloud.yml (image Mosquitto,
# sebagai root), bukan di laptop atau VPS langsung. Menyalin sertifikat Caddy untuk nama broker (DOMAIN_MQTT) ke lemari
# data-sertifikat sebagai milik pengguna mosquitto (uid 1883): Mosquitto 2.x membaca sertifikat SESUDAH turun hak dari root
# menjadi pengguna mosquitto, sedangkan berkas di lemari Caddy hanya boleh dibaca root (folder 0700, berkas 0600).
#   /caddy  = lemari Caddy (data-caddy), hanya-baca      /keluar = lemari data-sertifikat (dibaca Mosquitto)
# Sesudah salinan baru, broker yang sedang menyala memuat ulang dengan: docker compose exec mosquitto kill -HUP 1
set -eu

# Laptop dan Pi jalur gratis tidak punya nama broker: tidak ada yang disalin, broker tetap polos (pusat.conf)
if [ -z "${DOMAIN_MQTT:-}" ]; then
  echo "DOMAIN_MQTT kosong: tanpa sertifikat broker (laptop atau Pi jalur gratis), dilewati"
  exit 0
fi

# Caddy menyimpan sertifikat di /caddy/caddy/certificates/<penerbit>/<nama>/<nama>.crt (kuncinya <nama>.key di sebelahnya).
# Nama folder penerbit tidak ditulis mati (Let's Encrypt, CA latihan, atau CA lain bila opsi email/acme_ca dipakai): yang
# dipakai adalah berkas paling baru. Saat VPS baru menyala, Caddy mungkin belum selesai memintanya: tunggu, paling lama 5 menit.
mulai=$(date +%s)
while :; do
  crt=$(find /caddy/caddy/certificates -type f -name "${DOMAIN_MQTT}.crt" -exec ls -t {} + 2>/dev/null | head -n 1)
  if [ -n "$crt" ] && [ -s "$crt" ]; then break; fi
  if [ $(( $(date +%s) - mulai )) -ge 300 ]; then
    echo "GAGAL: 5 menit tanpa sertifikat ${DOMAIN_MQTT} dari Caddy. Periksa: docker compose logs web" >&2
    exit 1
  fi
  sleep 2
done
key="${crt%.crt}.key"

# Isi sama dengan salinan yang ada (misalnya cron mingguan sebelum Caddy memperbarui): tidak disalin ulang, tetapi pemilik
# dan izinnya tetap dibetulkan (salinan tangan sebagai root membuat Mosquitto gagal menyala).
if [ -f /keluar/broker.crt ] && [ -f /keluar/broker.key ] && cmp -s "$crt" /keluar/broker.crt && cmp -s "$key" /keluar/broker.key; then
  chown 1883:1883 /keluar/broker.crt /keluar/broker.key
  chmod 644 /keluar/broker.crt
  chmod 600 /keluar/broker.key
  echo "sertifikat ${DOMAIN_MQTT} tidak berubah: dilewati"
  exit 0
fi

# Salin ke nama sementara dulu, lalu ganti nama: Mosquitto tidak pernah membaca berkas yang baru separuh tersalin.
# 644 = sertifikat boleh dibaca siapa pun (isinya memang dikirim ke setiap klien); 600 = kunci hanya untuk pemiliknya.
cp "$crt" /keluar/broker.crt.baru
cp "$key" /keluar/broker.key.baru
chown 1883:1883 /keluar/broker.crt.baru /keluar/broker.key.baru
chmod 644 /keluar/broker.crt.baru
chmod 600 /keluar/broker.key.baru
mv /keluar/broker.crt.baru /keluar/broker.crt
mv /keluar/broker.key.baru /keluar/broker.key
echo "sertifikat ${DOMAIN_MQTT} disalin dari $crt ($(( $(date +%s) - mulai )) detik menunggu)"
echo "broker yang sedang menyala memuat ulang dengan: docker compose exec mosquitto kill -HUP 1"
