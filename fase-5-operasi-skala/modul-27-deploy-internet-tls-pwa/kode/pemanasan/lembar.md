# Lembar pemanasan Modul 27

Salin lembar ini ke catatan belajarmu (misalnya `belajar-iot/modul-27/pemanasan.md`), lalu isi kolom **Milikmu**. **Jangan** menyalin
sandi, token, isi `.env`, atau alamat IP publik rumahmu ke tempat yang dibagikan (repositori publik, forum, chat).

## 1. Rumah Modul 26

| Yang dicatat | Perintah / tempat | Contoh | Milikmu |
| :--- | :--- | :--- | :--- |
| Layanan pusat (laptop) | `docker compose ps -a` (akar proyek) | backend, db, grafana `Up … (healthy)`; mosquitto, web `Up`; akun-broker, migrasi, akun-grafana `Exited (0)` | |
| Gerbang (Kit B, Pi) | `docker compose ps -a` (folder `edge`) | `rumahpintar-gerbang-mosquitto-1` `Up` | |
| Sidik jari riwayat | `skrip/sidik-jari.sql` | `bacaan` = …, `sidik_jari` = … (32 huruf), akun = …, perangkat = … | |
| Backend yang sedang menyala | `docker compose ps backend` dan terminal `npm run dev` | satu saja (Modul 26) | |

## 2. Alamat rumah di internet

| Yang dicatat | Tempat | Milikmu (cukup SAMA / BERBEDA, tanpa angkanya) |
| :--- | :--- | :--- |
| Alamat WAN di router vs alamat dari situs "IP saya" | halaman admin router; HP lewat WiFi rumah | |
| Kesimpulan | sama = alamat publik sendiri; berbeda = NAT bersama (CGNAT) | |

## 3. DNS

| Pertanyaan | Perintah | Contoh (29 Okt 2026) | Milikmu |
| :--- | :--- | :--- | :--- |
| Record A | `nslookup api.open-meteo.com 1.1.1.1` | dua alamat server Open-Meteo (`188.40.99.226`, `167.114.211.86`) | |
| Record A situs web | `nslookup open-meteo.com 1.1.1.1` | dua alamat Cloudflare (`104.21.40.60`, `172.67.178.9`): awan oranye | |
| Record CNAME | `nslookup -type=CNAME www.github.com 1.1.1.1` | `canonical name = github.com.` | |
| TTL | `nslookup -debug open-meteo.com 1.1.1.1` | `ttl = 300` (atau lebih kecil) | |

## 4. Kartu identitas sebuah situs

| Yang dicatat | Contoh (`api.open-meteo.com`, 29 Okt 2026; salah satu dari dua servernya) | Milikmu |
| :--- | :--- | :--- |
| Nama yang dijamin | `*.open-meteo.com` (daftar *Subject Alternative Name*) | |
| Penerbit → akar | `YE2` (Let's Encrypt) → `Root YE` → `ISRG Root X2` (server lainnya: `YR1` → `Root YR` → `ISRG Root X1`) | |
| Berlaku | 31 Agu – 29 Nov 2026 (90 hari; terbit mulai 10 Feb 2027: 64 hari) | |

## 5. Loket

| Loket | Dipakai siapa sekarang? (contoh) | Rencana Modul 27 | Milikmu |
| :--- | :--- | :--- | :--- |
| 80 | dashboard Compose (`web`) | tetap: dashboard di laptop | |
| 443 | (kosong) | Compose memesan `127.0.0.1:443`; bila terpakai: `PORT_HTTPS` di `.env` | |
| 1883 | broker pusat Compose (`mosquitto`) | tetap; `ALAMAT_MQTT` menentukan siapa yang boleh mengetuk | |
| 8883 | (kosong) | Compose memesan `127.0.0.1:8883`; bila terpakai: `PORT_MQTTS` di `.env` | |
