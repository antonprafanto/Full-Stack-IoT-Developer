# Kemenangan Cepat Modul 26: dua layanan, satu perintah

Bahan untuk 🏆 Kemenangan Cepat Modul 26 (±25 menit). Satu berkas [`compose.yaml`](compose.yaml) berisi **dua layanan**: `broker`
(broker MQTT latihan) dan `pengirim` (mengirim satu pesan ke broker setiap 2 detik). Satu perintah menyalakan keduanya, dan pengirim
menemukan broker hanya dari **nama layanannya**, `broker`. Proyek "Rumah Pintar Mini" belum disentuh sama sekali: data aslimu baru
dipindah di Praktik 4.

| Berkas | Isinya |
| :--- | :--- |
| `compose.yaml` | dua layanan dari image yang sama, `eclipse-mosquitto:2.1.2-alpine` (image broker pusat proyek, sekitar 13 MB unduhan) |

**Latihan saja.** Broker ini **tanpa akun** (setelan `/mosquitto-no-auth.conf` bawaan image), berbeda dengan aturan Modul 21 "broker
selalu berkunci". Itu aman di sini karena loketnya hanya `127.0.0.1:1884` (hanya laptop ini, bukan WiFi rumah), dan semuanya dibongkar
di langkah 6.

## Urutan langkah

Sebelumnya (di 🧰, di luar hitungan 25 menit): `docker pull eclipse-mosquitto:2.1.2-alpine`. Salin folder `kemenangan-cepat` ini ke
folder latihanmu (misalnya `belajar-iot/modul-26/kemenangan-cepat`), lalu buka terminal di folder itu.

1. **Nyalakan:** `docker compose up -d`. Tanpa `-f`, karena `compose.yaml` adalah nama berkas bawaan Compose. Nama proyeknya = nama
   folder (`kemenangan-cepat`): Compose membuat lorong `kemenangan-cepat_default`, lalu kontainer `kemenangan-cepat-broker-1` dan
   `kemenangan-cepat-pengirim-1` (broker lebih dulu, karena `depends_on`).
2. **Lihat keadaannya:** `docker compose ps`. Dua baris `Up`; loket broker `127.0.0.1:1884->1883/tcp`. Pengirim tidak punya loket di
   laptop (kolom PORTS hanya `1883/tcp`, catatan bawaan image): ia hanya bicara di dalam lorong.
3. **Baca log pengirim:** `docker compose logs -f pengirim` → `terkirim pesan ke-1`, `ke-2`, … setiap 2 detik. **Ctrl + C** hanya
   berhenti membaca log; kontainernya tetap jalan.
4. **Lihat pesannya dari laptop** (MQTTX): koneksi baru, **Host** `127.0.0.1`, **Port** `1884`, tanpa **Username**/**Password**, lalu
   **Connect** dan berlangganan `latihan/#`. Pesan `halo dari kontainer pengirim, pesan ke-…` tiba setiap 2 detik. MQTTX memakai loket
   1884 di laptop, sedangkan pengirim memakai `broker:1883` di dalam lorong: tempatnya berbeda, alamatnya pun berbeda.
5. **Masuk ke kontainer broker:** `docker compose exec broker sh`. Kamu kini di dalam Linux kecil milik broker: `ls /` (ada
   `mosquitto-no-auth.conf`), `getent hosts pengirim` (nama layanan lain dikenal sebagai alamat di lorong), lalu `exit`.
6. **Bongkar:** `docker compose down`. Dua kontainer dan lorongnya dihapus; tidak ada yang tertinggal (folder data dan log broker hanya
   di memori, `tmpfs`). Loket 1884 kembali bebas, dan MQTTX menulis sambungannya terputus.

## Hasilnya (lab penulis)

Raspberry Pi 5, Ubuntu 26.04 arm64, Docker Engine 29.1.3, Compose 2.40.3, 28 Okt 2026 ±16.50 WIB. Di lab penulis nama proyeknya
`m26kode-kc` (bukan `kemenangan-cepat`) dan loketnya `127.0.0.1:6070` (bukan 1884), karena port 1884 di mesin penulis bukan miliknya;
selain itu berkasnya sama persis.

```text
$ docker compose up -d          # 2,2 detik (image sudah ada)
 Network m26kode-kc_default  Creating
 Network m26kode-kc_default  Created
 Container m26kode-kc-broker-1  Creating
 Container m26kode-kc-broker-1  Created
 Container m26kode-kc-pengirim-1  Creating
 Container m26kode-kc-pengirim-1  Created
 Container m26kode-kc-broker-1  Starting
 Container m26kode-kc-broker-1  Started
 Container m26kode-kc-pengirim-1  Starting
 Container m26kode-kc-pengirim-1  Started
$ docker compose ps
NAME                    IMAGE                            COMMAND                  SERVICE    CREATED         STATUS         PORTS
m26kode-kc-broker-1     eclipse-mosquitto:2.1.2-alpine   "/docker-entrypoint.…"   broker     7 seconds ago   Up 6 seconds   127.0.0.1:6070->1883/tcp
m26kode-kc-pengirim-1   eclipse-mosquitto:2.1.2-alpine   "/docker-entrypoint.…"   pengirim   7 seconds ago   Up 5 seconds   1883/tcp
$ docker compose logs pengirim
pengirim-1  | terkirim pesan ke-1
pengirim-1  | terkirim pesan ke-2
$ docker compose exec broker mosquitto_sub -h localhost -t 'latihan/#' -v -C 2
latihan/sapa halo dari kontainer pengirim, pesan ke-5
latihan/sapa halo dari kontainer pengirim, pesan ke-6
$ docker compose down           # 1,6 detik
```

Log broker (`docker compose logs broker`) dimulai dengan `mosquitto version 2.1.2 starting`, `Config loaded from
/mosquitto-no-auth.conf.`, `Opening ipv4 listen socket on port 1883.`, lalu setiap 2 detik tiga baris untuk satu kiriman pengirim:
`New connection from 172.19.0.3:… on port 1883.`, `New client connected from … as auto-…`, `Client auto-… disconnected.`. Angka di
depan setiap baris (misalnya `1793181012`) adalah jam versi Mosquitto: jumlah detik sejak 1 Januari 1970. Baris `Opening http api
listen socket on port 9883` = fitur baru Mosquitto 2.1 di dalam kontainer; loket itu tidak dibuka ke laptop. RAM: broker ±3 MiB,
pengirim ±1,2 MiB. Pesan juga terbaca dari sisi laptop di loket lab (klien MQTT di jaringan mesin, peran MQTTX).

## Jebakan yang terlihat di lab

- **`init: true` di layanan pengirim.** Tanpa baris itu, `sh` menjadi proses pertama di kontainer dan mengabaikan sinyal berhenti, jadi
  `docker compose down` menunggu 10 detik sebelum mematikannya paksa (lab: 11,8 detik, dengan `init: true` 1,6 detik).
- **`tmpfs`.** Image Mosquitto menyiapkan `/mosquitto/data` dan `/mosquitto/log` sebagai lemari. Tanpa `tmpfs`, setiap `up` membuat
  lemari tanpa nama (deretan huruf-angka panjang di `docker volume ls`) yang TIDAK ikut dihapus `docker compose down`.
- **`$$` di perintah pengirim** = tanda `$` untuk `sh`. Dengan `$` tunggal, Compose mengisi `$n` sendiri (dari `.env` atau
  lingkungan terminal) sebelum `sh` sempat melihatnya: setiap perintah `docker compose` (termasuk `up`) menulis dua kali `level=warning msg="The \"n\" variable is not set.
  Defaulting to a blank string."`, dan pesan yang terkirim menjadi `pesan ke-` tanpa angka.
- Loket 1884 sudah dipakai? Ganti angka kiri di `ports` (misalnya `"127.0.0.1:1885:1883"`) dan port di MQTTX.
