# Pemanasan ulang Modul 27: rumahmu, alamatmu, dan kartu identitas situs

Bahan untuk 🔁 Pemanasan ulang Modul 27 (±30 menit, 5 langkah). Tidak ada yang dinyalakan, dihapus, atau diubah: semuanya hanya
**membaca** keadaan rumahmu dan internet, supaya kosakata minggu ini (alamat IP publik, DNS, sertifikat, loket) sudah pernah kamu lihat
sendiri sebelum dipakai.

| Berkas | Isinya |
| :--- | :--- |
| [`lembar.md`](lembar.md) | lembar isian lima langkah di bawah (salin ke catatan belajarmu, misalnya `belajar-iot/modul-27/pemanasan.md`) |

## Urutan langkah

1. **Inventaris rumah Modul 26.** Di laptop, dari akar proyek: `docker compose ps -a`. Semua layanan panjang `Up` (backend, db, dan
   Grafana `(healthy)`), layanan sekali jalan `Exited (0)`. Kit B: di Pi, dari folder `edge`, `docker compose ps -a` (gerbang `Up`).
   Lalu catat **sidik jari riwayat** dengan `skrip/sidik-jari.sql` (cara menjalankannya tertulis di kepala berkas; Modul 26 Praktik 1):
   angka `bacaan` dan `sidik_jari` ini dibandingkan lagi sesudah riwayat pindah ke VPS di Praktik 7. Matikan simulator dulu supaya tidak
   ada bacaan baru di antaranya.
2. **Alamat rumahmu di internet.** Buka halaman admin router (alamatnya biasanya tertulis di stiker router) dan cari alamat **WAN** atau
   **Internet**. Lalu, dari HP yang memakai WiFi rumah, buka situs pemeriksa "IP saya" (cari "what is my IP"). Kalau kedua angka SAMA,
   router-mu memegang alamat publik sendiri. Kalau BERBEDA (misalnya router menulis `100.64.x.x` atau `10.x.x.x`), penyedia internetmu
   memakai **NAT bersama** (sering disebut CGNAT): banyak rumah berbagi satu alamat publik, jadi tamu dari internet memang tidak bisa
   mengetuk rumahmu, dengan atau tanpa *port forwarding*. Itu salah satu alasan Modul 27 tidak membuka pintu di router: jembatan dan
   Cloudflare Tunnel sama-sama sambungan KELUAR dari rumah. Jangan menempel alamat IP rumahmu di forum, chat, atau *pull request*.
3. **Buku telepon internet (DNS).** Di terminal mana pun (Windows, macOS, Linux, Pi): `nslookup api.open-meteo.com 1.1.1.1` (nama
   server cuaca Modul 10, ditanyakan ke server DNS publik `1.1.1.1`). Jawabannya alamat IP (record **A**). Bandingkan dengan
   `nslookup open-meteo.com 1.1.1.1` (situs web Open-Meteo): alamatnya lain sama sekali. Lalu
   `nslookup -type=CNAME www.github.com 1.1.1.1`: `www.github.com` adalah **nama lain** (record **CNAME**) untuk `github.com`. Untuk
   melihat **TTL** (berapa detik jawaban boleh disimpan sebelum ditanyakan lagi), tambahkan `-debug`:
   `nslookup -debug open-meteo.com 1.1.1.1`, lalu cari baris `ttl = …`.
4. **Kartu identitas sebuah situs.** Di Chrome atau Edge, buka `https://api.open-meteo.com` (server cuaca Modul 10; halamannya
   hanya teks galat JSON, tidak apa-apa), klik ikon di kiri bilah alamat, lalu buka rincian sertifikatnya. Catat tiga hal: **nama** yang
   dijamin sertifikat, **penerbit** dan rantainya sampai akar (Let's Encrypt: berujung di akar ISRG, **ISRG Root X1** untuk rantai
   RSA atau **ISRG Root X2** untuk rantai ECDSA; server mana yang kamu dapat bergiliran), dan **tanggal berlaku**
   (sertifikat Let's Encrypt berlaku 90 hari bila terbit sebelum 10 Feb 2027, lalu 64 hari). Bandingkan dengan `https://open-meteo.com`:
   penerbitnya lain. Inilah janji Modul 10: `setInsecure()` melewatkan ketiga pemeriksaan ini.
5. **Siapa memakai loket web dan broker?** Modul 27 memakai loket 80 dan 443 (web), 1883 (broker polos), dan 8883 (broker TLS).
   - Linux / Raspberry Pi: `ss -ltnp` (kolom keempat = alamat:loket; `sudo` untuk melihat nama program milik pengguna lain).
   - macOS: `lsof -nP -iTCP -sTCP:LISTEN` *(tidak diuji penulis)*.
   - Windows (PowerShell): `Get-NetTCPConnection -State Listen | Where-Object LocalPort -in 80,443,1883,8883` *(tidak diuji penulis)*.
   - Yang dibuka Docker: `docker ps --format 'table {{.Names}}\t{{.Ports}}'`.

   Sejak Modul 27, Compose di laptop juga memesan `127.0.0.1:443` dan `127.0.0.1:8883`; kalau program lain (VPN, server web lain) sudah
   memakai salah satunya, catat di lembar: di Praktik 2 (2.3–2.4) loketnya dipindah lewat `PORT_HTTPS` / `PORT_MQTTS` di `.env`
   (🚨 `port is already allocated`).

## Hasilnya (lab penulis, langkah 3–4)

Raspberry Pi 5, Ubuntu 26.04, 29 Okt 2026 ±18.40–18.50 WIB (jawaban DNS dan rantai sertifikat situs orang lain bisa berubah kapan saja):

```text
$ nslookup api.open-meteo.com 1.1.1.1
Server:		1.1.1.1
Address:	1.1.1.1#53

Non-authoritative answer:
Name:	api.open-meteo.com
Address: 188.40.99.226
Name:	api.open-meteo.com
Address: 167.114.211.86
```

`nslookup open-meteo.com 1.1.1.1` → `104.21.40.60` dan `172.67.178.9`: alamat **Cloudflare**, bukan server Open-Meteo sendiri. Situs
webnya memakai awan oranye (*proxied*), sedangkan nama API-nya menunjuk langsung ke dua servernya (awan abu, *DNS only*): perbedaan yang
dibahas di Konsep 5. `nslookup -type=CNAME www.github.com 1.1.1.1` → `www.github.com	canonical name = github.com.`; `nslookup -debug
open-meteo.com 1.1.1.1` → `ttl = 300` (angka TTL bisa lebih kecil dari aslinya: itu sisa waktu simpanan di server DNS `1.1.1.1`).

Rantai sertifikat yang DIPERIKSA (`openssl s_client` dengan daftar akar Ubuntu, yang memuat ISRG Root X1 dan X2; dicek ulang ±21.00
WIB). Dua server API, dua rantai, dua akar:
- `188.40.99.226`: `open-meteo.com` ← `YR1` (Let's Encrypt, RSA) ← `Root YR` ← **`ISRG Root X1`**
- `167.114.211.86`: `*.open-meteo.com` ← `YE2` (Let's Encrypt, ECDSA) ← `Root YE` ← **`ISRG Root X2`**; berlaku 31 Agu – 29 Nov 2026
  (90 hari). Server ini juga MENGIRIM sertifikat `ISRG Root X2` yang ditandatangani `ISRG Root X1` (terlihat dengan `-showcerts`):
  jembatan bagi klien yang hanya memercayai X1, misalnya ESP32 di Tantangan 1. `openssl` dan browser yang memercayai X2 tidak
  memakainya dan berhenti di X2. Jendela sertifikat browser menampilkan jalur yang diperiksa browser itu (tidak direkam penulis).
- situs web `open-meteo.com` (lewat Cloudflare): penerbit `WE1` (Google Trust Services), bukan Let's Encrypt.
