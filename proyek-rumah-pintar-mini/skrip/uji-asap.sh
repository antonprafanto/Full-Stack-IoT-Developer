#!/bin/sh
# uji-asap.sh - Modul 29: "uji asap" sesudah memasang. Apakah rumah (pusat, compose.cloud.yml) benar-benar menyala dengan
# versi ini? Dipakai skrip/pasang.sh (VPS, Pi jalur gratis) dan job staging robot (.github/workflows/ci.yml). Dengan
# tangan, dari akar proyek (tempat compose.cloud.yml dan .env):
#   sh skrip/uji-asap.sh          versi yang diharapkan = "version" di backend/package.json
#   sh skrip/uji-asap.sh 2.0.1    versi yang diharapkan ditulis sendiri
# Yang diperiksa, semuanya lewat Docker Compose di mesin ini:
#   1. sesudah 15 detik tidak ada layanan yang jatuh bangun (Restarting). "up --wait" hanya bisa menunggu layanan yang punya
#      pemeriksaan kesehatan (healthcheck); Mosquitto atau Caddy yang mogok berulang dianggapnya beres. Batasnya: layanan
#      yang baru mogok sesudah ±10 detik berjalan bisa lolos (Docker langsung menyalakannya lagi, jadi saat diperiksa
#      terlihat "running"); pemantau yang terus berjaga = Modul 30.
#   2. backend dan web berjalan dengan image bertag versi itu
#   3. GET /health backend: "versi" = versi itu dan "database": true (/health tetap selalu 200; pemantau = Modul 30)
#   4. dashboard lewat Caddy: halaman utama, dan /api/health (Caddy meneruskan /api ke backend yang baru)
# Kode keluar 0 = LULUS semua; 1 = ada yang GAGAL, pesannya menyebut yang mana. Skrip ini hanya MEMBACA: tidak menyalakan,
# mematikan, atau mengubah apa pun.
set -eu

# pindah ke akar proyek (folder di atas skrip/)
cd "$(dirname "$0")/.."
versi="${1:-$(sed -n 's/^  "version": "\([^"]*\)".*/\1/p' backend/package.json | head -n 1)}"
gagal() { echo "GAGAL  $*" >&2; exit 1; }
[ -n "$versi" ] || gagal "versi yang diharapkan tidak diketahui: sh skrip/uji-asap.sh <versi>"

# 1) Beri waktu layanan yang baru dibuat ulang untuk mogok kalau memang akan mogok, lalu cari yang jatuh bangun
sleep 15
jatuh=$(docker compose ps --status restarting --format '{{.Service}}') \
  || gagal "docker compose ps gagal (Docker menyala? dijalankan dari folder proyek yang benar?)"
[ -z "$jatuh" ] || gagal "layanan jatuh bangun (Restarting): $(echo "$jatuh" | tr '\n' ' ')-> docker compose logs <layanan>"
echo "LULUS  tidak ada layanan yang jatuh bangun (15 detik sesudah dinyalakan)"

# 2) Image yang sedang berjalan
for layanan in backend web; do
  image=$(docker compose ps --format '{{.Image}}' "$layanan") || gagal "docker compose ps $layanan gagal"
  case "$image" in
    */rumah-pintar-mini-"$layanan":"$versi") echo "LULUS  $layanan berjalan dengan $image" ;;
    "") gagal "$layanan tidak berjalan (docker compose ps -a)" ;;
    *) gagal "$layanan berjalan dengan $image, bukan versi $versi" ;;
  esac
done

# 3) /health ditanya dari DALAM kontainer backend (image node tidak membawa curl; cara yang sama dengan healthcheck-nya)
kesehatan=$(docker compose exec -T backend node -e \
  "fetch('http://127.0.0.1:8080/health').then((j) => j.text()).then((t) => console.log(t))") \
  || gagal "backend tidak menjawab /health (docker compose logs backend)"
case "$kesehatan" in
  *"\"versi\":\"$versi\""*) ;;
  *) gagal "backend /health tidak menyebut versi $versi: $kesehatan" ;;
esac
case "$kesehatan" in
  *'"database":true'*) ;;
  *) gagal "backend tidak tersambung ke database: $kesehatan" ;;
esac
echo "LULUS  /health backend: $kesehatan"
case "$kesehatan" in
  *'"broker":true'*) ;;
  # bukan GAGAL: tepat sesudah menyala backend bisa masih menyambung; broker yang mati sudah tertangkap langkah 1
  *) echo "PERINGATAN  backend belum tersambung ke broker (\"broker\":false): cek lagi sebentar, docker compose logs backend" ;;
esac

# 4) Dashboard lewat Caddy. DOMAIN_WEB dibaca dari kontainer web (Compose mengisinya ":80" bila kosong di .env).
domain=$(docker compose exec -T web printenv DOMAIN_WEB) || gagal "layanan web tidak berjalan (docker compose ps -a)"
case "$domain" in
  :*|"")
    # tanpa domain (laptop, staging, Pi jalur gratis): Caddy melayani dashboard di pintu 80 DI DALAM kontainernya. Di Pi
    # jalur gratis pintu itu tidak dibuka ke WiFi rumah (yang dibuka pintu perangkat 8081), jadi ditanya dari dalam.
    halaman=$(docker compose exec -T web wget -q -O - http://127.0.0.1:80/) || gagal "Caddy tidak menyajikan dashboard"
    api=$(docker compose exec -T web wget -q -O - http://127.0.0.1:80/api/health) || gagal "Caddy tidak meneruskan /api"
    alamat="http://127.0.0.1:80 (di dalam kontainer web)"
    ;;
  *)
    # dengan domain (VPS): HTTPS sungguhan dengan sertifikat Let's Encrypt, tetapi nama domainnya diarahkan ke mesin ini
    # sendiri (--resolve), tanpa bertanya ke DNS atau keluar ke internet
    command -v curl > /dev/null || gagal "curl tidak ada di mesin ini: sudo apt install curl"
    pintu=$(docker compose port web 443 | sed 's/.*://')
    [ -n "$pintu" ] || gagal "pintu HTTPS 443 layanan web tidak dibuka di mesin ini (PORT_HTTPS di .env?)"
    halaman=$(curl -fsS --max-time 20 --resolve "$domain:$pintu:127.0.0.1" "https://$domain:$pintu/") \
      || gagal "https://$domain/ tidak menjawab dari mesin ini (docker compose logs web)"
    api=$(curl -fsS --max-time 20 --resolve "$domain:$pintu:127.0.0.1" "https://$domain:$pintu/api/health") \
      || gagal "https://$domain/api/health tidak menjawab (docker compose logs web)"
    alamat="https://$domain"
    ;;
esac
case "$halaman" in
  *'<div id="root">'*) ;;
  *) gagal "halaman utama di $alamat bukan dashboard Rumah Pintar Mini" ;;
esac
case "$api" in
  *"\"versi\":\"$versi\""*) ;;
  *) gagal "$alamat/api/health tidak menyebut versi $versi: $api" ;;
esac
echo "LULUS  dashboard dan /api/health lewat Caddy ($alamat)"
echo "LULUS  uji asap versi $versi"
