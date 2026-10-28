# Kunci Tantangan 1 Modul 26: dashboard Compose dari HP (mode HP lewat `.env`)

**Tugas:** buka dashboard mode rumah (Caddy di `compose.cloud.yml`) dari HP di WiFi rumah, **hanya dengan mengubah `.env` akar**,
tanpa menyentuh `compose.cloud.yml`, Caddyfile, atau kode. Bila port 80 di laptopmu sudah dipakai program lain, pakai loket web 8081.
Sesudah mencoba, kembalikan ke mode laptop.

Berkas kunci: [`env-mode-hp.contoh`](env-mode-hp.contoh) (baris `.env` yang diubah, dengan IP contoh `192.168.1.20`).

## Dua setelan, dua penjaga

| Setelan di `.env` akar | Mode laptop (bawaan) | Mode HP (sementara) | Yang dijaganya |
| :--- | :--- | :--- | :--- |
| `ALAMAT_WEB` | `127.0.0.1` | `0.0.0.0` | **loket**: siapa yang bisa mengetuk dashboard. `127.0.0.1` = hanya laptop ini; `0.0.0.0` = semua perangkat di jaringan yang sama |
| `CORS_ORIGIN` | `http://localhost,http://127.0.0.1` | ditambah `http://<IP-laptop>` | **satpam backend**: halaman mana yang boleh *login* dan mengirim perintah. Tanpa baris ini, halaman di HP terbuka, tetapi **Masuk** dijawab `403` |
| `PORT_WEB` (bila 80 terpakai) | `80` | `8081` | nomor loket di laptop. Asal halaman (*origin*) = skema + nama host + port, jadi port selain 80 WAJIB ikut ditulis di **setiap** alamat `CORS_ORIGIN`, termasuk `localhost` |

Hanya loket web yang dibuka. Backend (`127.0.0.1:8080`), database, dan Grafana tetap `127.0.0.1` (aturan aman nomor 1): HP tidak
butuh semuanya, karena halaman dan API sampai lewat satu pintu, Caddy. Loket web tetap tanpa *port forwarding* di router: belum ada
HTTPS (Modul 27), jadi sandi melewati WiFi tanpa enkripsi. Untuk penguji, pakai akun sementara dan hapus sesudahnya.

## Langkah

1. Cari IPv4 WiFi laptop: Windows `ipconfig` (bagian `Wireless LAN adapter Wi-Fi`), macOS `ipconfig getifaddr en0`, Linux/Pi
   `hostname -I` (alamat pertama).
2. Di `.env` akar ubah dua baris (contoh lengkap di `env-mode-hp.contoh`):
   ```text
   ALAMAT_WEB=0.0.0.0
   CORS_ORIGIN=http://localhost,http://127.0.0.1,http://192.168.1.20
   ```
   Dengan loket 8081:
   ```text
   ALAMAT_WEB=0.0.0.0
   PORT_WEB=8081
   CORS_ORIGIN=http://localhost:8081,http://127.0.0.1:8081,http://192.168.1.20:8081
   ```
3. Dari akar proyek: `docker compose up -d`. Compose membuat ulang hanya layanan yang setelannya berubah, ditandai `Recreate` /
   `Recreated`: `backend` dan `migrasi` (keduanya memakai `CORS_ORIGIN` lewat `x-setelan-backend`) serta `web` (loketnya). Database,
   broker, dan Grafana tetap `Running`; layanan sekali jalan berjalan sekali lagi lalu `Exited`. `web` baru menyala lagi sesudah
   backend kembali `(healthy)`.
4. `docker compose ps web` → kolom PORTS `0.0.0.0:80->80/tcp` (atau `0.0.0.0:8081->80/tcp`).
5. Di HP (WiFi rumah yang sama, bukan WiFi tamu): `http://192.168.1.20` (atau `http://192.168.1.20:8081`), lalu **Masuk**. *Login* di
   laptop tidak ikut ke HP: *cookie* melekat pada nama host. Coba lencana **Live** dan F5 di layar **Peta**.
6. Kembalikan: `ALAMAT_WEB=127.0.0.1`, `CORS_ORIGIN` tanpa alamat IP (dan `PORT_WEB` semula bila tadi diganti), lalu `docker compose
   up -d` lagi. Lakukan juga sebelum laptop dibawa ke jaringan lain. Alamat IP bisa berubah besok; kalau HP tidak bisa membuka lagi,
   cari IP-nya lagi dan ubah `CORS_ORIGIN`.

## Hasilnya (lab penulis)

Raspberry Pi 5, Ubuntu 26.04 arm64, Docker Engine 29.1.3, Compose 2.40.3, 28 Okt 2026 ±16.48 WIB. Loket lab **6086** menggantikan
8081 (port 80/8081 di mesin penulis bukan miliknya), dan "HP" diperankan permintaan ke alamat IP WiFi mesin dari mesin itu sendiri;
**HP sungguhan tidak diuji penulis**. IP disamarkan menjadi `<IP-laptop>`.

Rumah sudah menyala dengan setelan mode laptop, lalu `.env` diubah (`PORT_WEB` dan `CORS_ORIGIN`) dan `docker compose up -d`
dijalankan lagi: **19,9 detik**, `Recreate` → `Recreated` untuk `migrasi`, `backend`, dan `web`; `db`, `mosquitto`, `grafana`
`Running`; `akun-broker` dan `akun-grafana` `Started` → `Exited`. Lalu dengan `ALAMAT_WEB=0.0.0.0`:

```text
$ docker compose ps web
web   Up 1 second   443/tcp, 2019/tcp, 443/udp, 0.0.0.0:6086->80/tcp
$ ss -ltn | grep 6086
LISTEN 0      4096         0.0.0.0:6086       0.0.0.0:*
```

| Permintaan | Jawaban |
| :--- | :--- |
| `http://<IP-laptop>:6086/peta` | `200` (halaman dashboard) |
| `POST http://<IP-laptop>:6086/api/auth/login`, halaman `http://<IP-laptop>:6086` | `200` (masuk) |
| sama, halaman `http://localhost:6086` | `200` |
| sama, halaman `http://<IP-laptop>` (port lupa ditulis di `CORS_ORIGIN`) | `403 {"pesan":"permintaan dari halaman http://<IP-laptop> ditolak"}` |

Catatan: dengan `ALAMAT_WEB=0.0.0.0`, Docker di Linux membuka loket untuk IPv4 saja (`0.0.0.0:6086`), tidak seperti broker yang
ditulis tanpa alamat (`0.0.0.0:…` dan `[::]:…`). Windows dan macOS (Docker Desktop) tidak diuji: Windows bisa menanyakan izin
firewall, dan Mac Docker Desktop 4.97 punya setelan baru untuk membuka port di bawah 1024 ke jaringan (lihat Modul 26).
