# ⬛ Fase 5 — Operasi & Skala: Deploy, OTA, CI/CD, & Capstone (Modul 26–32)

🌐 **Bahasa Indonesia** · [English](../en/phase-5-operations-scale/README.md)

> **Tujuan fase:** dari "jalan di jaringan rumah saya" menjadi "jalan di internet, 24/7, terenkripsi, bisa diperbarui, dan tidak kehilangan data", lalu membuktikannya dengan proyek akhir. Fase ini dimulai di jaringan rumah: Modul 26 membungkus seluruh sistem dalam Docker Compose, dan internet, HTTPS, serta TLS menyusul di Modul 27.

Kerjakan modulnya **berurutan**. Satu modul = satu minggu, dicicil; waktu setiap modul tertulis di kepala artikelnya, dan Modul 31 boleh 2–3 minggu. Klik judul modul untuk membuka artikelnya.

| Minggu | Modul | Perangkat keras | Alat yang dipasang di modul ini | Status |
| :---: | :--- | :--- | :--- | :--- |
| 26 | **[Modul 26 — Docker & Docker Compose: Satu Perintah untuk Semua Layanan](modul-26-docker-compose/README.md)** | Kit B (Raspberry Pi OS 64-bit), atau laptop saja dengan simulator Modul 21 dan Kebun tiruan; ditambah hasil Modul 25 di `main` dan ruang disk ±6 GB | Docker Desktop ≥ 4.96.2 atau Docker Engine 29 (Pi: repo apt Docker), Docker Compose, Caddy 2.11.7 (`caddy:2.11.7-alpine`), Mosquitto 2.1.2 dalam kontainer (`eclipse-mosquitto:2.1.2-alpine`), `node:24.22.1-alpine3.24` (dasar cetakan), GHCR (manual) | ✅ tersedia |
| 27 | Modul 27 — Ke Internet: VPS, Domain, HTTPS, TLS MQTT, Bridge Pi → VPS, & Aplikasi di HP (PWA) | Kit A + B + VPS 2 GB (sangat disarankan) + domain | Caddy (HTTPS), Cloudflare Tunnel, Let's Encrypt, `WiFiClientSecure` di ESP32, vite-plugin-pwa | ⏳ segera terbit — [ringkasan](../SILABUS.md#modul-27--ke-internet-vps-domain-https-tls-mqtt-bridge-pi--vps--aplikasi-di-hp-pwa) |
| 28 | Modul 28 — OTA Update, Provisioning, Fleet, & Dari Breadboard ke Kotak | Kit A (2 ESP32, kotak proyek) + server | library Update/HTTPUpdate ESP32, Preferences, WiFiManager | ⏳ segera terbit — [ringkasan](../SILABUS.md#modul-28--ota-update-provisioning-fleet--dari-breadboard-ke-kotak) |
| 29 | Modul 29 — Testing & CI/CD: Setiap Perubahan Diuji dan Dipasang Otomatis | server | Vitest, GitHub Actions, GHCR, `docker buildx`, systemd timer | ⏳ segera terbit — [ringkasan](../SILABUS.md#modul-29--testing--cicd-setiap-perubahan-diuji-dan-dipasang-otomatis) |
| 30 | Modul 30 — Monitoring, Backup, Runbook: Tahu Lebih Dulu, Tidak Pernah Kehilangan Data | server | Uptime Kuma, Grafana alerting, rclone, cron/systemd timer | ⏳ segera terbit — [ringkasan](../SILABUS.md#modul-30--monitoring-backup-runbook-tahu-lebih-dulu-tidak-pernah-kehilangan-data) |
| 31 | Modul 31 — Capstone: Rancang & Bangun Proyek Akhir Anda | pilihanmu | semua yang sudah dipelajari | ⏳ segera terbit — [ringkasan](../SILABUS.md#modul-31--capstone-rancang--bangun-proyek-akhir-anda) |
| 32 | Modul 32 — Portofolio, Biaya & Skala, & Langkah Karier | — | GitHub (README, *release*), perekam layar | ⏳ segera terbit — [ringkasan](../SILABUS.md#modul-32--portofolio-biaya--skala--langkah-karier) |

## 🎯 Tanda lulus Fase 5

Fase terakhir ini ditutup dengan proyek akhir. Sebelum menyebut dirimu Fullstack IoT Developer 🎓, pastikan bukti-bukti ini sudah ada di repositori GitHub-mu ([Silabus §8](../SILABUS.md#8-evaluasi--tanda-kelulusan-tiap-fase)):

1. Kuis setiap modul (5 soal) **≥ 4 benar** untuk Modul 26–30.
2. **Proyek checkpoint:** sistem *online* + TLS + OTA + CI/CD + *monitoring* + capstone.
3. **Artefak:** README produk + *runbook* + video demo 3 menit.

Modul 26 membuka fase ini: seluruh Rumah Pintar Mini **terbungkus Docker** dan menyala dengan satu perintah. Backend 1.3.0 dan dashboard 1.2.0 kini punya cetakan (*image*) dua tahap; dashboard disajikan Caddy di `http://localhost` tanpa Vite, dan F5 aman di semua alamat. Satu berkas `compose.cloud.yml` menyalakan database, broker pusat, backend, web, dan Grafana dengan `docker compose up -d`, ditambah tiga layanan sekali jalan yang menyiapkan akun dan migrasi. Riwayat dan Grafana pindah ke Compose di atas lemari yang sama tanpa kehilangan data, dibuktikan dengan sidik jari riwayat yang sama persis, dan Grafana kini menyala lengkap dari berkas (*provisioning*). Layanan bangkit sendiri berkat pemeriksaan kesehatan (*healthcheck*) dan aturan bangkit (*restart policy*). Di Pi, broker gerbang pindah ke kontainer lewat `edge/compose.edge.yml` dan meneruskan data ke laptop lewat jembatan LAN, tanpa firmware baru; tanpa Pi, simulator dan Kebun tiruan menggantikannya. Kamu juga mencadangkan lemari dan menguji pulihnya, menitipkan cetakan di toko image GHCR, lalu menguji "laptop bersih": dari `git clone` sampai halaman **Masuk** dalam < 10 menit, dengan riwayat yang tetap ada sesudah `docker compose down` lalu `up -d`. Semuanya masih di jaringan rumah, dan laptop yang tidur ikut menidurkan bot, *alert*, dan laporan pagi; internet, HTTPS, dan TLS menyusul di Modul 27.

## 📂 Isi setiap folder modul

| Isi | Gunanya |
| :--- | :--- |
| `README.md` | Artikel modulnya — mulai membaca dari sini. GitHub menampilkannya otomatis saat kamu membuka folder modul. |
| `kode/` | Kode setiap tahap praktik, siap dibandingkan dengan milikmu. Di Modul 26: `pemanasan/` (lembar inventaris, `latihan.yaml`, dan `latihan.env`), `kemenangan-cepat/` (`compose.yaml` dua layanan: broker latihan dan pengirim), `tahap/praktik-4` dan `praktik-5` (`compose.cloud.yml` di akhir praktik itu), berkas akar proyek (`compose.cloud.yml`, `.env.example`, `.gitignore`, `.gitattributes`, `README.md`, dan `skrip/sidik-jari.sql`), `backend/` (backend 1.3.0 dengan `Dockerfile`, keadaan akhir) beserta `backend-1.3.diff` (perubahannya dari v1.2), `frontend/` (dashboard 1.2.0 dengan `Dockerfile` dan `caddy/Caddyfile`, keadaan akhir) beserta `frontend-1.2.diff`, `grafana/` (berkas *provisioning*) beserta `grafana.diff`, `edge/` (`compose.edge.yml`, `pusat.conf`, `gerbang.conf`, `jembatan.contoh.conf`, `jembatan/README.md`, `.env.example`, `acl-broker` dengan blok `7) jembatan-pi`, serta `gateway-pi.conf` dan `mosquitto-lan.conf` berlabel tanpa Docker) beserta `edge.diff`, `alat/` (README untuk broker pusat), `.github/` (templat *pull request*), dan `tantangan/kunci/` (mode HP lewat `.env`, Uptime Kuma, dan simulator dalam kontainer). File `.env`, `edge/.env`, dan `edge/jembatan/pusat.conf` tidak pernah disertakan: salin `.env.example` (akar dan `edge/`), lalu isi milikmu sendiri. |
| `aset/` | Gambar-gambar artikel, beserta `SUMBER.md` yang mencatat sumber dan lisensi setiap gambar. |

---

[⬅️ Fase 4 — Frontend Dashboard](../fase-4-frontend-dashboard/README.md) · [Halaman depan](../README.md) · [Silabus](../SILABUS.md) · [Pelacak progres](../PROGRES.md) · **Mulai: [Modul 26](modul-26-docker-compose/README.md) ➡️**
