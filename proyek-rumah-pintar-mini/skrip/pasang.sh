#!/bin/sh
# pasang.sh - Modul 29: pasang RILIS terbaru Rumah Pintar Mini di mesin ini. Satu skrip untuk VPS dan Pi:
#   VPS: dipanggil robot (job pasang-vps di .github/workflows/ci.yml) lewat SSH dengan kunci khusus. Baris kunci itu di
#        ~/.ssh/authorized_keys pengguna rumah membuatnya HANYA bisa menjalankan skrip ini, apa pun perintah yang dikirim:
#          restrict,command="sh /home/rumah/rumah-pintar-mini/skrip/pasang.sh" ssh-ed25519 AAAA... robot-pasang
#   Pi : dipanggil jam weker systemd setiap 15 menit (skrip/systemd/rumahpintar-perbarui.timer). GitHub tidak bisa mengetuk
#        Pi di balik router rumah, jadi Pi yang bertanya sendiri.
#   Tangan, dari akar proyek (sekali, saat beralih dari "membangun image sendiri" ke "menarik image buatan robot"):
#        sh skrip/pasang.sh
# Selalu dipanggil lewat "sh" oleh pemilik salinan repo (anggota grup docker), BUKAN dengan sudo. Berkas di repo tidak
# bertanda boleh-dijalankan, dan jangan di-chmod +x di VPS/Pi (Git menganggapnya suntingan, lalu skrip ini berhenti).
#
# RILIS = tag Git v<versi> (misalnya v2.0.1) di cabang main GitHub. Robot membuatnya SESUDAH image versi itu ada di GHCR dan
# lulus staging; tag yang tidak ada di main (misalnya dibuat tangan di cabang lain) diabaikan. Jadi mesin ini hanya memasang
# commit yang sudah diuji robot, dan tidak pernah menunggu image yang belum ada.
# Urutan: tag rilis terbaru -> majukan main ke tag itu (--ff-only) -> tarik image -> nyalakan ulang yang berubah
# (--no-build: mesin ini tidak pernah membangun image) -> restart broker bila konfigurasinya berubah -> uji asap.
# Gagal di langkah mana pun = berhenti dengan pesan GAGAL dan kode keluar 1. Gagal sebelum "up" (misalnya image belum bisa
# ditarik): kontainer lama tetap berjalan, tetapi salinan repo sudah di rilis baru, jadi berkas yang dibaca langsung dari
# repo (misalnya dashboard Grafana) bisa sudah berganti. Pi mengulang di putaran berikutnya (15 menit kemudian); VPS
# mengulang saat robot datang lagi (rilis berikutnya, atau Re-run failed jobs pada job pasang-vps), atau dengan
# sh skrip/pasang.sh di VPS. Skrip ini TIDAK PERNAH menjalankan down -v, prune, atau git reset --hard.
#
# Yang dipasang dipilih PASANG_BAGIAN (diisi berkas unit systemd; bawaan: pusat):
#   pusat           compose.cloud.yml di akar proyek: VPS (jalur utama), juga laptop
#   gerbang         edge/compose.edge.yml: Pi jalur utama (Pi = gerbang saja; image resmi Mosquitto + konfigurasi edge/)
#   pusat gerbang   keduanya: Pi jalur gratis (Pi = pusat + gerbang)
set -eu

jam() { date '+%Y-%m-%d %H:%M:%S %Z'; }
kabar() { echo "$(jam) $*"; }
gagal() { echo "$(jam) GAGAL: $*" >&2; exit 1; }

# Ada jalur ini yang berubah sejak rilis yang terpasang sebelumnya? (tanpa catatan rilis lama: dianggap tidak)
ada_yang_berubah() {
  [ -n "$lama_commit" ] && [ -n "$(git diff --name-only "$lama_commit" HEAD -- "$@")" ]
}

# Restart SEKALI per rilis: putaran yang mengulang sesudah uji asap gagal tidak me-restart layanan yang sama lagi (broker
# yang di-restart = semua perangkat putus sesaat). Catatannya (.git/rumahpintar-terpasang.restart) dihapus begitu rilis
# itu terpasang.
restart_sekali() { # restart_sekali <bagian> <layanan>
  if grep -qxF "$tag $1 $2" "$catatan.restart" 2> /dev/null; then
    kabar "$2 sudah di-restart untuk $tag: dilewati"
    return 0
  fi
  docker compose restart "$2" || gagal "restart $2 gagal: docker compose logs $2"
  echo "$tag $1 $2" >> "$catatan.restart"
}

pasang_pusat() {
  kabar "pusat: tarik image $tag (compose.cloud.yml)"
  docker compose pull --quiet || gagal "image untuk $tag belum bisa ditarik (sebabnya di pesan Docker di atas). Paket GHCR \
masih privat? TOKO_IMAGE di .env salah ketik atau berhuruf besar? Setelan wajib baru belum ada di .env? Kontainer lama \
tetap berjalan."
  docker compose up -d --no-build --wait --wait-timeout 300 || gagal "pusat gagal dinyalakan atau belum sehat (paling \
lama 5 menit): docker compose ps -a, lalu docker compose logs <layanan>"
  # Berkas yang dibaca kontainer langsung dari repo (bind mount): "up" tidak melihat isinya berubah, jadi layanan yang
  # membacanya di-restart di sini. backend dan web tidak perlu: tag image keduanya naik setiap rilis, jadi selalu dibuat
  # ulang.
  # (Broker pusat hanya memakai salah satu dari pusat.conf dan pusat-internet.conf, KONF_PUSAT di .env; ubahan berkas yang
  # tidak dipakai juga me-restartnya: sekali putus yang tidak perlu, tidak berbahaya.)
  if ada_yang_berubah edge/acl-broker edge/pusat.conf edge/pusat-internet.conf; then
    kabar "konfigurasi broker pusat berubah: restart mosquitto"
    restart_sekali pusat mosquitto
  fi
  if ada_yang_berubah grafana/provisioning; then
    kabar "provisioning Grafana berubah: restart grafana"
    restart_sekali pusat grafana
  fi
  sh skrip/uji-asap.sh "${tag#v}"
  docker compose ps --format 'table {{.Service}}\t{{.Image}}\t{{.Status}}'
}

pasang_gerbang() {
  # Gerbang tidak punya image buatan sendiri: yang diperbarui adalah image resmi bertag persis di edge/compose.edge.yml dan
  # konfigurasi broker dari repo. edge/jembatan/pusat.conf (sandi jembatan) tidak ikut Git: ubahannya tetap tangan.
  restart=tidak
  if ada_yang_berubah edge/gerbang.conf edge/acl-broker; then restart=ya; fi
  kabar "gerbang: tarik image $tag (edge/compose.edge.yml)"
  (
    cd edge
    docker compose pull --quiet || gagal "image gerbang belum bisa ditarik (sebabnya di pesan Docker di atas): internet? \
Setelan wajib baru belum ada di edge/.env? Kontainer lama tetap berjalan."
    docker compose up -d --no-build --wait --wait-timeout 120 \
      || gagal "gerbang gagal dinyalakan: docker compose ps -a dan docker compose logs mosquitto (folder edge)"
    if [ "$restart" = ya ]; then
      # restart, BUKAN kill -HUP: di gerbang, HUP membuang antrean simpan-teruskan yang belum terkirim ke pusat (Modul 27)
      kabar "konfigurasi broker gerbang berubah: restart mosquitto"
      restart_sekali gerbang mosquitto
    fi
    # up --wait tidak bisa menunggu Mosquitto (tanpa healthcheck): beri waktu 15 detik, lalu cari yang jatuh bangun. Broker
    # yang baru mogok sesudah ±10 detik berjalan bisa lolos (terlihat "running"); pemantau yang terus berjaga = Modul 30.
    sleep 15
    [ -z "$(docker compose ps --status restarting --format '{{.Service}}')" ] \
      || gagal "broker gerbang jatuh bangun (Restarting): docker compose logs mosquitto (folder edge)"
    echo "LULUS  gerbang: tidak ada layanan yang jatuh bangun (15 detik sesudah dinyalakan)"
    docker compose ps --format 'table {{.Service}}\t{{.Image}}\t{{.Status}}'
  )
}

pasang() {
  # Bukan root: git yang berjalan sebagai root meninggalkan berkas milik root di .git, lalu putaran berikutnya (timer,
  # robot) gagal menulis catatannya dan memasang ulang setiap kali.
  [ "$(id -u)" != 0 ] || gagal "jangan dijalankan dengan sudo atau sebagai root: jalankan sebagai pemilik salinan repo \
(anggota grup docker). Docker menolak tanpa sudo? Keluar lalu masuk lagi supaya grup docker berlaku."
  # akar proyek (folder di atas skrip/): compose.cloud.yml, .env, dan folder edge/
  cd "$(dirname "$0")/.."
  # "pusat gerbang", "pusat,gerbang", dan spasi ganda dianggap sama
  bagian=$(echo $(echo "${PASANG_BAGIAN:-pusat}" | tr ',' ' '))
  [ -n "$bagian" ] || gagal "PASANG_BAGIAN kosong; yang dikenal: pusat, gerbang, atau \"pusat gerbang\""
  for b in $bagian; do
    case "$b" in
      pusat|gerbang) ;;
      *) gagal "PASANG_BAGIAN berisi \"$b\"; yang dikenal: pusat, gerbang, atau \"pusat gerbang\"" ;;
    esac
  done
  # Catatan rilis terakhir yang BERHASIL dipasang skrip ini, di folder .git (tidak pernah ikut commit). Jalur lengkap, karena
  # bagian gerbang bekerja dari folder edge/.
  catatan="$(git rev-parse --absolute-git-dir)/rumahpintar-terpasang"

  # 1) Salinan repo di mesin ini: di cabang main dan tanpa suntingan. Ubahan selalu lewat pull request, bukan di VPS/Pi.
  cabang=$(git symbolic-ref --quiet --short HEAD || echo "(bukan cabang)")
  [ "$cabang" = main ] || gagal "salinan repo di mesin ini sedang di $cabang, bukan main: git switch main"
  kotor=$(git status --porcelain --untracked-files=no)
  [ -z "$kotor" ] || gagal "ada berkas yang disunting langsung di mesin ini (lihat: git diff):
$kotor
Ubah lewat pull request. Kembalikan berkas di sini dengan: git restore <berkas>"

  # 2) Tag rilis terbaru di main GitHub (repo publik: git fetch tanpa akun; --tags juga memperbarui origin/main).
  #    --merged origin/main = hanya tag yang ada di main; --sort=-v:refname = urut nomor versi, terbesar dulu
  git fetch --tags origin || gagal "tidak bisa mengambil tag dari GitHub: baca pesan git di atas (internet? alamat \
origin: git remote -v; tag rilis dipindah di GitHub: would clobber existing tag; berkas .git milik root: Permission denied)"
  tag=$(git tag --list 'v[0-9]*' --merged origin/main --sort=-v:refname | head -n 1)
  if [ -z "$tag" ]; then
    kabar "belum ada rilis (tag v<versi>) di GitHub: tidak ada yang dipasang"
    return 0
  fi
  terpasang=$(cat "$catatan" 2> /dev/null || true)
  if [ "$terpasang" = "$tag $bagian" ]; then
    kabar "$tag sudah terpasang ($bagian): tidak ada rilis baru"
    return 0
  fi
  lama=${terpasang%% *}
  kabar "memasang $tag ($bagian); sebelumnya: ${lama:-belum pernah lewat skrip ini}"

  # 3) Majukan main ke rilis itu. --ff-only = hanya maju lurus: main yang punya commit buatan mesin ini membuat skrip
  #    berhenti, dan main yang sudah di depan tag (sesudah git pull tangan) tidak dimundurkan. ^{commit} = commit tag itu.
  sebelum=$(git rev-parse HEAD)
  git merge --ff-only --quiet "$tag^{commit}" || gagal "main di mesin ini tidak bisa maju lurus ke $tag: baca pesan git di \
atas (commit yang dibuat di sini? berkas tak terlacak bernama sama dengan berkas baru rilis itu? git log --oneline -3)"
  # main yang sudah di DEPAN tag boleh, asal versinya sama (robot menjamin: yang dipasang berubah = versi naik). Versi lain =
  # salinan ini berisi versi yang belum dirilis (git pull tangan): tunggu tag-nya, jangan pasang yang belum lulus staging.
  versi_repo=$(sed -n 's/^  "version": "\([^"]*\)".*/\1/p' backend/package.json | head -n 1)
  [ "$versi_repo" = "${tag#v}" ] || gagal "salinan repo di mesin ini berisi versi $versi_repo, padahal rilis terbaru $tag \
(git pull tangan?). Tidak ada yang dipasang; putaran berikutnya memasangnya begitu robot membuat tag v$versi_repo."
  # Rilis ini membawa pasang.sh yang baru? Shell sudah membaca isi lamanya, jadi skrip dijalankan ulang SEKALI dengan isi
  # barunya (catatan rilis belum ditulis, jadi putaran ulang memasang rilis yang sama dari awal).
  if [ -z "${PASANG_ULANG:-}" ] && ! git diff --quiet "$sebelum" HEAD -- skrip/pasang.sh; then
    kabar "skrip/pasang.sh ikut berubah di $tag: dijalankan ulang dengan isi barunya"
    PASANG_ULANG=1
    export PASANG_ULANG
    exec sh skrip/pasang.sh
  fi
  lama_commit=""
  if [ -n "$lama" ]; then lama_commit=$(git rev-parse --quiet --verify "$lama^{commit}" || true); fi

  # 4) Pasang bagian-bagiannya; satu saja gagal = berhenti (catatan rilis tidak diperbarui, putaran berikutnya mengulang)
  for b in $bagian; do
    if [ "$b" = pusat ]; then pasang_pusat; else pasang_gerbang; fi
  done
  printf '%s\n' "$tag $bagian" > "$catatan"
  rm -f "$catatan.restart"
  kabar "${lama:-belum pernah} -> $tag terpasang ($bagian)"
}

# Fungsi di atas dibaca utuh dulu, baru dijalankan: git merge bisa mengganti berkas skrip ini sendiri di tengah jalan.
pasang "$@"; exit $?
