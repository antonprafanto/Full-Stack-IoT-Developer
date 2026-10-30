# Modul 27 — Ke Internet: VPS, Domain, HTTPS, TLS MQTT, Bridge Pi → VPS, & Aplikasi di HP (PWA)

🌐 **Bahasa Indonesia** · [English](../../en/phase-5-operations-scale/module-27-deploy-internet-tls-pwa/README.md)

*Fase 5 · Minggu 27 · Perangkat keras: **Kit A + B** + **VPS 2 GB** (sangat disarankan) + **domain** (jalur gratis: Kit A + B + domain + akun Cloudflare gratis; tanpa Pi: laptop menjadi gerbang) · Prasyarat: **Modul 26** (backend 1.3.0, frontend 1.2.0, `compose.cloud.yml` di `main`), Modul 21 (broker berkunci) · Waktu: jalur utama ±10 jam, jalur gratis ±7,5 jam, dicicil dalam satu minggu, ditambah menunggu domain dan DNS aktif · Biaya: domain (±Rp 15–30 rb/tahun, perkiraan) + VPS bulan pertama (±Rp 80–200 rb, harga Okt 2026, cek ulang); jalur gratis: domain saja*

[⬅️ Modul 26](../modul-26-docker-compose/README.md) · [Fase 5](../README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · [Modul 28 ➡️ (segera terbit — baca ringkasannya di Silabus)](../../SILABUS.md#modul-28--ota-update-provisioning-fleet--dari-breadboard-ke-kotak)

---

[Modul 26 ditutup](../modul-26-docker-compose/README.md#-checklist-kelulusan-modul-26) dengan janji: `compose.cloud.yml` yang sama pindah ke VPS dengan domain dan HTTPS (di Caddyfile, `:80` diganti nama domain), jembatan Pi naik ke TLS dan belajar menahan data saat internet putus, dan dashboard menjadi aplikasi di HP; jalur gratisnya menjalankan semuanya di Pi lewat Cloudflare Tunnel (profil `terowongan`). Menurut [Silabus](../../SILABUS.md#-fase-5--operasi--skala-deploy-ota-cicd--capstone-modul-2632), Fase 5 membawa sistemmu menjadi "jalan di internet, 24/7, terenkripsi, bisa diperbarui, dan tidak kehilangan data". Modul 26 membungkus rumahmu; **Modul 27 membawanya keluar rumah**.

Banyak janji lama dilunasi minggu ini. [Modul 4](../../fase-0-fondasi/modul-04-javascript-nodejs/README.md#13-http-surat-menyurat-antarprogram) menunda `https://`, versi yang isinya disandikan, ke Modul 27. [Modul 10](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#8-https-dan-setinsecure-amplop-tersegel-yang-kurirnya-tidak-diperiksa) memperkenalkan amplop tersegel dan kartu identitas kurir, lalu memberi `setInsecure()` label "sementara, sampai Modul 27"; [Modul 11](../../fase-2-konektivitas/modul-11-mqtt-dan-kontrak-data/README.md#3-broker-di-laptop-mosquitto-dua-baris-konfigurasi-dan-firewall) menyisihkan pintu 8883 untuk MQTT terenkripsi. [Modul 20](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#5-cookie-httponly-bukan-localstorage) menyiapkan *cookie* `Secure` yang menunggu HTTPS dan setelan `trustProxy`. [Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#10-jujur-lalu-lintas-di-rumah-masih-polos) mengakui kunci perangkat masih lewat polos dan melarang *port forwarding* sebelum ada TLS. [Modul 24](../../fase-4-frontend-dashboard/modul-24-kendali-aturan-peran/README.md#11-dipakai-orang-lain-aksesibilitas-dasar-layar-utama-dan-uji-pengguna) memasang pintasan di layar utama sambil berkata PWA butuh HTTPS, dan [Modul 25](../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md#103-tautan-grafana-json-di-github-tangkapan-layar-dan-catatan-kapan-memakai-yang-mana-5-menit) menunda tautan Grafana yang hidup sampai Grafana bisa dibuka lewat HTTPS. [Modul 26](../modul-26-docker-compose/README.md#10-dua-berkas-sampai-akhir-pusat-dan-gerbang) mencatat batas jujur: jembatan pertamanya belum TLS dan belum menahan data, yang disebutnya "inti Modul 27", dan berkas Compose tetap dua.

| Yang terjadi sekarang | Penyebabnya | Obatnya minggu ini |
| :--- | :--- | :--- |
| Laptop tidur, rumah pintar ikut tidur: bot Telegram, aturan otomatis, *alert* "Node diam" di Grafana, dan laporan pagi berhenti. | Pusat (`compose.cloud.yml`) berjalan di laptop, yang tidak menyala 24 jam. | **Mesin yang menyala 24 jam**: VPS sewaan (jalur utama) atau Pi-mu sendiri (jalur gratis) ([Konsep 1](#1-dari-rumah-ke-internet-tiga-pintu-dua-jalur)–2, [Praktik 5](#praktik-5--jalur-utama-sewa-vps-dan-amankan-pintunya-60-menit), 7, dan [11](#praktik-11--jalur-gratis-semua-di-pi-dan-cloudflare-tunnel-85-menit)) |
| Dashboard hanya terbuka di WiFi rumah ([mode HP Modul 23](../../fase-4-frontend-dashboard/modul-23-dashboard-realtime/README.md#12-hp-lewat-wifi-rumah-mode-hp-dan-mode-laptop)), lewat `http://` tanpa gembok. | Rumahmu belum punya nama di internet, dan belum ada yang memasang sertifikat untuknya. | **Domain milikmu dan HTTPS otomatis**: Caddy dan Let's Encrypt, di jalur gratis Cloudflare ([Konsep 5](#5-domain-dan-dns-buku-telepon-internet)–7, [Praktik 6](#praktik-6--domain-dan-dns-nama-milikmu-di-buku-telepon-internet-25-menit-ditambah-waktu-tunggu), 7, dan 11) |
| Kunci perangkat dan pesan MQTT lewat polos di pintu 1883: penyadap Modul 21 bisa membacanya. | Pintu 1883 adalah kartu pos: masih bisa diterima di dalam rumah, tidak di internet. | **TLS di pintu 8883**: yang keluar rumah selalu di dalam amplop tersegel ([Konsep 8](#8-tls-untuk-mqtt-pintu-8883-salinan-sertifikat-dan-muat-ulang), [Praktik 8](#praktik-8--jalur-utama-pintu-mqtt-8883-dengan-tls-35-menit)–9) |
| Bacaan yang dikirim selama pusat tak terjangkau hilang. | Jembatan Modul 26 menyambung ulang sendiri, tetapi tidak menahan pesan. | **Jembatan simpan-teruskan** (*store-and-forward*): Pi menahan bacaan, lalu meneruskannya belakangan dengan `ts` aslinya ([Konsep 9](#9-jembatan-simpan-teruskan-siapa-menahan-apa), [Praktik 4](#praktik-4--simpan-teruskan-di-rumah-dulu-jembatan-lan-dan-latihan-putus-10-menit-30-menit), 9, dan 10) |
| "Pasang di layar utama" hanya pintasan yang membuka browser. | Aplikasi web yang bisa dipasang (PWA) butuh konteks aman (HTTPS, atau `localhost` di laptop), *manifest*, ikon, dan pekerja latar (*service worker*). | **Dashboard 1.3.0 menjadi PWA** ([Konsep 11](#11-pwa-dari-pintasan-menjadi-aplikasi), [Praktik 3](#praktik-3--dashboard-130-jadi-pwa-di-httplocalhost-40-menit) dan [12](#praktik-12--pwa-di-hp-jaringan-seluler-dan-teman-di-kota-lain-40-menit)) |
| Di balik Caddy, semua tamu tampak satu alamat: satu penebak sandi membuat semua tamu kena `429`, dan *cookie* belum `Secure`. | Backend belum memercayai keterangan tamu yang diteruskan Caddy. | **Backend 1.4.0 dengan `TRUST_PROXY`** (Konsep 7, [Praktik 2](#praktik-2--backend-140-trust_proxy-sesi-broker-tetap-dan-perintah-tangan-2-menit-20-menit), [7.8](#78--gembok-di-httpsiotnamaandamyid-308-login-dan-cookie-secure-6-menit)–7.9) |

Di akhir minggu, rumahmu daring, terenkripsi, dan tahan putus internet. Itulah syarat lulus dari [Silabus](../../SILABUS.md#modul-27--ke-internet-vps-domain-https-tls-mqtt-bridge-pi--vps--aplikasi-di-hp-pwa): "teman di kota lain membuka dashboard Anda lewat HTTPS dan melihat angka berubah; MQTTX **tanpa** TLS ditolak di port 8883 VPS dan log Mosquitto menunjukkan koneksi TLS dari bridge; data 10 menit saat internet rumah putus muncul susulan tanpa dobel." Modul ini memecahnya menjadi empat bukti:

- **T1** HTTPS dari luar rumah: temanmu membuka `https://iot.namaanda.my.id` dari jaringannya sendiri, masuk dengan akun *viewer* sementara, dan melihat angka Node 1 berganti. Belum ada teman? HP-mu sendiri lewat data seluler, dicatat sebagai pengganti.
- **T2a** pintu 8883 hanya menerima TLS: sambungan tanpa TLS ke `mqtt.namaanda.my.id:8883` ditolak, dan 1883 polos di VPS terbukti tak terjangkau dari luar (berkat `ALAMAT_MQTT`, bukan ufw: [Konsep 4](#4-tembok-api-yang-bocor-ufw-dan-docker)).
- **T2b** log Mosquitto VPS mencatat jembatan Pi masuk lewat TLS.
- **T3** internet rumah dicabut 10 menit; sesudah tersambung lagi, bacaan selang itu tiba susulan di VPS dengan jam kejadiannya, **tanpa celah dan tanpa dobel**. "Tanpa dobel" sudah dijamin database sejak Modul 17; yang sulit justru "tanpa celah", jadi T3 memeriksa keduanya.

Bunyi per jalur: **jalur gratis** membuktikan T1 lewat Cloudflare Tunnel, **T2-gratis** (broker sama sekali tidak terjangkau dari luar rumah), dan **T3-gratis** (a: riwayat di Pi tetap utuh selama internet putus; b: latihan simpan-teruskan di LAN); jembatannya tidak keluar rumah, jadi tanpa T2b. Jalur tanpa Pi, tanpa Kit, Wokwi, dan laptop saja ada di tabel **Pilih jalurmu** di bawah. Silabus (v1.0.29) mencatat pecahan T1–T3 ini dan bunyi setiap jalur di baris ✅; kalimat ✅-nya tetap.

Untuk Rumah Pintar Mini, backend naik ke **1.4.0** (`TRUST_PROXY`, sesi broker tetap, dan perintah tangan yang tidak dikerjakan dalam 2 menit tidak dikirim lagi; tanpa migrasi, tanpa paket baru), dashboard ke **1.3.0** (PWA: satu paket baru `vite-plugin-pwa` 2.0.0 khusus *build*, ikon, dan pesan luring). `compose.cloud.yml` tetap satu berkas untuk tiga tempat (laptop, VPS, dan Pi jalur gratis; bedanya hanya `.env`), `edge/` belajar simpan-teruskan dan TLS, dan `skrip/` mendapat tiga skrip baru. Kontrak data naik ke **1.5** (alamat broker di internet; bentuk pesan tetap), dan firmware Node 1 (v1.6.0) serta Node 2 (v1.0.0) tidak berubah. Image pihak ketiga sama dengan Modul 26, dan `cloudflared` kini dinyalakan (jalur gratis). Modul 27 bukan Checkpoint: kuisnya ikut [tanda lulus Fase 5](../../SILABUS.md#8-evaluasi--tanda-kelulusan-tiap-fase).

**Pilih jalurmu** sesudah Praktik 4: Praktik 1–4 sama untuk semua jalur.

| Jalur | Mesin 24 jam | Biaya (Okt 2026, cek ulang) | Bukti ✅ | Praktik | Waktu |
| :-- | :-- | :-- | :-- | :-- | :-- |
| **Utama** (disarankan) | VPS 2 GB; Pi tetap gerbang | domain ±Rp 15–30 rb/tahun + VPS ±Rp 80–200 rb/bulan | T1, T2a, T2b, T3 | 1–10, 12 | ±10 jam |
| **Gratis** | Pi menjalankan semuanya, tamu masuk lewat Cloudflare Tunnel | domain saja | T1 lewat Tunnel, T2-gratis, T3-gratis | 1–4, 6, 11, 12 | ±7,5 jam |
| **Tanpa Pi** | VPS; laptop menjadi gerbang ([pola Modul 26](../modul-26-docker-compose/README.md#67-jalur-laptop-pengganti-l4-lalu-gerbang-di-laptop-yang-sama-525-menit)) | seperti jalur utama | T1–T3; T3 = WiFi laptop dimatikan (belum diuji penulis) | seperti jalur utama | ±10 jam |
| **Tanpa Kit** | sesuai jalurmu | sesuai jalurmu | T1–T3 dengan simulator dan Kebun tiruan | sesuai jalurmu | sama |
| **Wokwi** | sesuai jalurmu | sesuai jalurmu | seperti tanpa Kit; ESP32 dengan TLS hanya di 🧩 Tingkat 1 dan 🔬 (belum dikompilasi penulis) | sesuai jalurmu | sama |
| **Laptop saja, tanpa domain** | tidak ada | Rp 0 | belum bisa lulus: Let's Encrypt dan Tunnel butuh domain | 1–4 tetap berguna | — |

VPS dipakai di Modul 27–30 ([Silabus §5.5](../../SILABUS.md#55-biaya-layanan-fase-5)), lalu boleh dihentikan.

> [!NOTE]
> **Cara memakai modul ini.**
>
> - **Tanda.** ⭐ = wajib untuk lulus. Praktik yang judulnya diawali **Jalur utama:** (Praktik 5, 7, 8, 9) atau **Jalur gratis:** (Praktik 11) hanya untuk jalur itu. Kotak 🔀 (**Jalur gratis:** …, **Tanpa Pi:** …) menjelaskan yang berbeda di jalur lain.
> - **Praktik 1–4 tanpa biaya** dan dikerjakan di laptop dan Pi sebelum kamu menyewa VPS; yang dibeli lebih dulu hanya domain di 6.1, karena kedua jalur membutuhkannya dan menunggu *nameserver* aktif bisa berjam-jam.
> - **Satu backend per token bot.** Sejak [7.6](#76--satu-backend-per-token-bot-hentikan-backend-laptop-3-menit) (jalur gratis: [11.4](#114--pindah-riwayat-ke-pi-sidik-jari-sama-backend-laptop-berhenti-12-menit)), token bot Telegram hanya dipegang backend di VPS (atau Pi); laptop menjadi mesin pengembangan.
> - **Tabel bukti**: tempat setiap syarat dibuktikan, dan tandanya.
>
>   | Syarat | Jalur utama | Jalur gratis | Yang kamu lihat |
>   | :-: | :-- | :-- | :-- |
>   | T1 | [12.4](#124--t1-teman-di-kota-lain-membuka-dashboard-mu-lewat-https-15-menit) | [11.8](#118--t1-gratis-dan-t2-gratis-dashboard-dari-hp-broker-tetap-di-rumah-6-menit) lalu 12.4 | gembok di bilah alamat, lencana **Live**, angka Node 1 berganti |
>   | T2a | [8.3](#83--t2a-tanpa-tls-ditolak-di-8883-dan-1883-tak-terjangkau-dari-luar-10-menit) | 11.8 (T2-gratis: 1883 dan 8883 gagal) | MQTTX tanpa TLS ditolak; log broker `… wrong version number` |
>   | T2b | [9.3](#93--t2b-log-vps-mencatat-jembatan-pi-lewat-tls-6-menit) | — (jembatan LAN polos, [11.6](#116--gerbang-ke-pusat-di-pi-yang-sama-jembatan-lan-ke-pusat1884-8-menit)) | `New bridge connected … as jembatan-pi (p4, c1, k60, u'jembatan-pi').` dan `negotiated TLSv1.3` |
>   | T3 | [10.5](#105--t3-skripcek-susulansql-di-vps-tanpa-celah-dan-tanpa-dobel-8-menit) | [11.9](#119--t3-gratis-internet-rumah-putus-10-menit-riwayat-pi-tetap-utuh-15-menit) dan [4.4](#44--putus-10-menit-di-lan-lalu-skripcek-susulansql-tanpa-celah-tanpa-dobel-11-menit) | `skrip/cek-susulan.sql`: `celah_lebih_12_detik 0`, ±6 bacaan per menit, `kembar 0` |
>
> - **Kotak 🖥️ di setiap praktik menyebut mesin, alat, dan foldernya**: **VS Code** di laptop (terminal di **akar proyek** `rumah-pintar-mini`, `backend`, `frontend`, atau `alat`); **terminal SSH ke VPS** (`ssh rumah@203.0.113.10`, folder `/home/rumah/rumah-pintar-mini`); **terminal SSH ke Pi** (folder `rumah-pintar-mini/edge`; jalur gratis juga akar proyek); **Chrome** atau **Edge**, juga untuk panel penyedia VPS, registrar, dan dasbor Cloudflare; **HP**; **MQTTX**; **Bruno**; **GitHub**; dan **Telegram**.
> - **Kotak Hasilnya.** Penulis tidak punya VPS, domain, atau HP, jadi keluaran direkam di **Raspberry Pi 5 dengan Ubuntu 26.04.1 LTS (arm64)**: Docker Engine 29.1.3, Compose 2.40.3 (paket Ubuntu), Chrome 156 tanpa layar, dan Node 24.21.0. Satu mesin itu memerankan laptop, Pi, VPS, dan "internet" sekaligus; kotak yang memakai CA tiruan diberi label **Hasilnya (lab penulis, CA tiruan):**.
>
>   | Dunia nyatamu | Tiruan di lab penulis |
>   | :-- | :-- |
>   | VPS `203.0.113.10` | kontainer satu IP di lorong Docker yang menjadi "internet" |
>   | Let's Encrypt | Pebble 2.10.1 (CA tiruan): akarnya baru setiap menyala; rantai dan masa berlakunya bukan milik Let's Encrypt |
>   | DNS Cloudflare | pebble-challtestsrv (*record* A tiruan) |
>   | internet rumah dicabut | `docker network disconnect` (paket dibuang diam-diam) |
>   | HP dan teman di kota lain | Chrome tanpa layar selebar 375/412 px, dengan aturan nama dan akar CA tiruan khusus profil lab |
>   | MQTTX | mqtt.js 5.16.1 (mesin di balik MQTTX) dan `mosquitto_sub` |
>   | Node 1 | simulator `alat/` apa adanya (QoS 0 tiap 10 detik) dan Kebun tiruan |
>   | Cloudflare Tunnel | tidak tersambung (token kosong); diganti kontainer kecil di lorong proyek |
>   | Telegram | server Bot API tiruan |
>
>   Di naskah, nama tiruan diganti nama milikmu (`iot.contoh.test` menjadi `iot.namaanda.my.id`, IP lab menjadi alamat contoh dokumentasi). Waktu dan ukuran hanya **contoh**: angka dari CA tiruan atau Pi bukan angka Let's Encrypt atau VPS. Jam ditulis WIB. Cara menirunya ada di [🔬](#-bedah-teknis-opsional), rinciannya di [📚](#-sumber--atribusi-gambar).
> - **Status jujur: penulis belum menguji** VPS sungguhan (SSH, ufw, Docker dari apt, *build* amd64 di 2 GB), domain `.my.id` dan *nameserver*-nya, Cloudflare (zona `.my.id`, DNS, Tunnel), Let's Encrypt produksi, HP Android dan iPhone (pemasangan PWA, rupa ikon), jaringan seluler, teman di kota lain, router yang dicabut, MQTTX, ESP32 dengan TLS, Windows, macOS, Docker Desktop, Raspberry Pi OS, Pi 2 GB, dan jalur tanpa Pi. Langkahnya ditulis dari dokumentasi resmi dan ditandai di tempatnya. Kamulah penguji pertamanya: jangan mencentang butir yang belum benar-benar terjadi di [✅](#-checklist-kelulusan-modul-27).
> - Pengguna macOS: ganti **Ctrl** dengan **Cmd** untuk pintasan VS Code dan browser. **Kecuali di terminal:** menghentikan program tetap **Ctrl + C**, juga di Mac. VPS selalu Linux: perintahnya diketik di terminal SSH, dari OS laptop apa pun.

> [!WARNING]
> **Aturan aman minggu ini.**
>
> 1. **`.env`, `TUNNEL_TOKEN`, dan berkas kunci (`*.key`, kunci SSH privat) tidak pernah masuk Git**, forum, atau AI. Begitu juga keluaran `docker compose config` tanpa `--quiet`, yang mencetak semua rahasia ([7.2](#72-env-vps-rahasia-baru-dan-kolom-vps-di-tabel-nilai-per-tempat-10-menit), [11.7](#117--cloudflare-tunnel-token-di-env-rute-ke-httpweb80-dan-profil-terowongan-12-menit)).
> 2. **Jangan `docker compose down -v`, `docker volume rm rumahpintar…`, atau `docker system prune --volumes`.** Di VPS, lemari Caddy menyimpan akun dan sertifikatmu, dan Let's Encrypt hanya menerbitkan 5 sertifikat bernama persis sama per minggu; di Pi, lemari gerbang menyimpan antrean; lemari `external` menyimpan riwayatmu ([Konsep 6](#6-sertifikat-dibahas-tuntas-rantai-nama-dan-tanggal), [7.7](#77--docker-compose-up--d-di-vps-dua-sertifikat-dari-lets-encrypt-8-menit)).
> 3. **Jangan membuka 1883 ke internet.** Di VPS, biarkan `ALAMAT_MQTT=127.0.0.1`, karena ufw TIDAK menutup loket yang dibuka Docker (Konsep 4, 8.3).
> 4. **Jangan `setInsecure()`, `--insecure`, atau `bridge_insecure`.** Ketiganya melemahkan pemeriksaan kartu identitas server (Konsep 8, [🧩 Tingkat 1](#tingkat-1--cuaca-modul-10-tanpa-setinsecure-periksa-kartu-identitas-server-ubah-sedikit-20-menit)).
> 5. **Satu backend per token bot Telegram.** Backend kedua dengan token yang sama ditolak `409 Conflict` (7.6).
> 6. **Jangan *port forwarding* ke Pi atau laptop.** Jembatan dan Cloudflare Tunnel sama-sama sambungan keluar dari rumah (Konsep 1).
> 7. **Jangan menutup sesi SSH lama sebelum *login* dengan kunci di jendela kedua berhasil**, dan izinkan 22 di ufw sebelum `ufw enable` ([5.4](#54--matikan-login-sandi-dan-root-00-kunciconf-sshd--t-dan-jendela-kedua-10-menit), [5.5](#55--ufw-izinkan-22-dulu-lalu-80-443-dan-8883-8-menit)).

Seperti Modul 16–26, modul ini diawali [🔁 Pemanasan ulang rumahmu, alamatmu, dan kartu identitas situs](#-pemanasan-ulang-rumahmu-alamatmu-dan-kartu-identitas-situs-30-menit). Hari pertama cukup pemanasan, [🏆 Kemenangan Cepat](#-kemenangan-cepat-amplop-tersegel-tanpa-kartu-identitas-15-menit), Konsep 1 dan 5, **beli domain di [6.1](#61-beli-domain-myid-di-registrar-terakreditasi-pandi-7-menit) dan [6.2](#62-cloudflare-paket-gratis-ganti-nameserver-lalu-tunggu-aktif-8-menit)** (menunggu *nameserver* aktif bisa berjam-jam), lalu [Praktik 1](#praktik-1--meja-kerja-cabang-sidik-jari-dan-cadangan-15-menit) sampai [Praktik 3](#praktik-3--dashboard-130-jadi-pwa-di-httplocalhost-40-menit) di laptop; rumahmu tetap menyala. Sebelas konsep dibaca berselang-seling dengan praktiknya; urutannya ada di awal [🧠](#-konsep-mengapa). Bagian lipat di [🚨](#-kalau-tidak-jalan) dibuka saat perlu; bagian lipat di [🔬](#-bedah-teknis-opsional) boleh dilewati.

## Daftar isi

1. [🎯 Setelah modul ini kamu bisa…](#-setelah-modul-ini-kamu-bisa)
2. [🧰 Yang perlu disiapkan](#-yang-perlu-disiapkan)
3. [🔁 Pemanasan ulang rumahmu, alamatmu, dan kartu identitas situs (30 menit)](#-pemanasan-ulang-rumahmu-alamatmu-dan-kartu-identitas-situs-30-menit)
4. [🏆 Kemenangan Cepat: amplop tersegel tanpa kartu identitas (15 menit)](#-kemenangan-cepat-amplop-tersegel-tanpa-kartu-identitas-15-menit)
5. [🧠 Konsep "Mengapa"](#-konsep-mengapa)
   - [1 Tiga pintu, dua jalur](#1-dari-rumah-ke-internet-tiga-pintu-dua-jalur) · [2 VPS](#2-vps-komputer-sewaan-yang-menyala-24-jam) · [3 Kunci SSH](#3-kunci-ssh-dan-pengguna-biasa-login-sandi-dan-root-dimatikan) · [4 ufw dan Docker](#4-tembok-api-yang-bocor-ufw-dan-docker) · [5 Domain dan DNS](#5-domain-dan-dns-buku-telepon-internet) · [6 Sertifikat](#6-sertifikat-dibahas-tuntas-rantai-nama-dan-tanggal) · [7 Caddy dan `TRUST_PROXY`](#7-caddy-sebagai-pintu-depan-https-otomatis-dan-trust_proxy) · [8 TLS untuk MQTT](#8-tls-untuk-mqtt-pintu-8883-salinan-sertifikat-dan-muat-ulang) · [9 Jembatan simpan-teruskan](#9-jembatan-simpan-teruskan-siapa-menahan-apa) · [10 Cloudflare Tunnel](#10-jalur-gratis-cloudflare-tunnel) · [11 PWA](#11-pwa-dari-pintasan-menjadi-aplikasi)
6. [🔧 Praktik langkah demi langkah](#-praktik-langkah-demi-langkah)
   - [1 Meja kerja](#praktik-1--meja-kerja-cabang-sidik-jari-dan-cadangan-15-menit) · [2 Backend 1.4.0](#praktik-2--backend-140-trust_proxy-sesi-broker-tetap-dan-perintah-tangan-2-menit-20-menit) · [3 PWA di `localhost`](#praktik-3--dashboard-130-jadi-pwa-di-httplocalhost-40-menit) · [4 Simpan-teruskan di rumah](#praktik-4--simpan-teruskan-di-rumah-dulu-jembatan-lan-dan-latihan-putus-10-menit-30-menit) · [5 VPS](#praktik-5--jalur-utama-sewa-vps-dan-amankan-pintunya-60-menit) · [6 Domain dan DNS](#praktik-6--domain-dan-dns-nama-milikmu-di-buku-telepon-internet-25-menit-ditambah-waktu-tunggu) · [7 Pusat di VPS](#praktik-7--jalur-utama-pusat-di-vps-dengan-https-75-menit) · [8 Pintu 8883](#praktik-8--jalur-utama-pintu-mqtt-8883-dengan-tls-35-menit) · [9 Jembatan TLS](#praktik-9--jalur-utama-jembatan-pi--vps-lewat-tls-35-menit) · [10 Cabut internet](#praktik-10--uji-cabut-internet-rumah-10-menit-30-menit) · [11 Jalur gratis](#praktik-11--jalur-gratis-semua-di-pi-dan-cloudflare-tunnel-85-menit) · [12 HP dan teman](#praktik-12--pwa-di-hp-jaringan-seluler-dan-teman-di-kota-lain-40-menit) · [13 Perangkat di lokasi lain (opsional)](#praktik-13--opsional-perangkat-di-lokasi-lain-lewat-mqtts-tanpa-gerbang-20-menit)
   - Jalur utama: Praktik 1–10 dan 12 · Jalur gratis: Praktik 1–4, 6, 11, dan 12
7. [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)
8. [🔬 Bedah Teknis (opsional)](#-bedah-teknis-opsional)
9. [🧩 Tantangan mandiri](#-tantangan-mandiri)
10. [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini)
11. [📖 Glosarium](#-glosarium) · [📝 Kuis](#-kuis-5-soal) · [✅ Checklist kelulusan](#-checklist-kelulusan-modul-27)

## 🎯 Setelah modul ini kamu bisa…

1. **Membuka dashboard ke internet** dengan domain milikmu dan ikon gembok di bilah alamat: Caddy meminta dan memperbarui sertifikat Let's Encrypt sendiri, dan `http://` dialihkan ke `https://`.
2. **Menyewa VPS dan mengamankan pintunya**: kunci SSH, *login* sandi dan root dimatikan, dan ufw. Kamu juga tahu bahwa loket yang dibuka Docker melewati ufw, jadi alamat di depan loketlah yang menentukan siapa boleh mengetuk.
3. **Menulis *record* DNS** untuk `iot.` dan `mqtt.`, lalu menjelaskan kenapa `mqtt.` harus *DNS only* (awan abu-abu) di Cloudflare.
4. **Membaca kartu identitas (sertifikat) sebuah situs**: rantainya sampai akar ISRG Root X1 (RSA) atau X2 (ECDSA), namanya, dan tanggalnya. Kamu juga tahu masa berlaku sertifikat Let's Encrypt memendek: 90 hari, lalu 64 hari mulai 10 Feb 2027, lalu 45 hari mulai 16 Feb 2028.
5. **Memasang amplop tersegel di pintu MQTT 8883**: salinan sertifikat Caddy untuk Mosquitto, muat ulang broker VPS tanpa memutus jembatan, dan cron mingguan untuk perpanjangannya.
6. **Membuat Pi menahan data saat internet putus**, lalu meneruskannya belakangan dengan `ts` aslinya, dan membuktikan "tanpa celah, tanpa dobel" dengan `skrip/cek-susulan.sql`.
7. **Menjelaskan "naik disimpan di Pi, turun tidak disimpan"**: perintah lampu saat internet putus tidak ditahan broker, dan backend melupakannya sesudah 2 menit, supaya tidak dikerjakan basi.
8. **Menjalankan backend di balik pintu depan** dengan `TRUST_PROXY`: *cookie* `Secure` di `https://` dan batas `429` per tamu, bukan bersama.
9. **Memasang dashboard sebagai aplikasi di HP** (PWA) dan tahu batasnya: tampilannya tetap terbuka saat luring, tetapi angka selalu dari jaringan, tanpa notifikasi *push*, dan versi baru tampil pada pembukaan berikutnya.
10. **Memindahkan riwayat ke mesin baru** (VPS atau Pi) dan membuktikannya dengan sidik jari yang sama, lalu **memilih jalurmu** (VPS, atau Pi dengan Cloudflare Tunnel) beserta biayanya.

## 🧰 Yang perlu disiapkan

Kolom **Utama** dan **Gratis** menunjukkan jalur yang membutuhkannya (tabel **Pilih jalurmu** di atas).

| Yang disiapkan | Utama | Gratis | Keterangan |
| :--- | :-: | :-: | :--- |
| **Hasil Modul 26** di `main` | ✓ | ✓ | Backend 1.3.0, frontend 1.2.0, dan `compose.cloud.yml` yang menyala; Kit B: gerbang `edge/compose.edge.yml` di Pi dengan jembatan LAN. Diperiksa di [🔁 Langkah 1](#langkah-1--inventaris-rumah-modul-26-dan-sidik-jari-riwayat). |
| **Domain `.my.id`** di registrar terakreditasi PANDI | ✓ | ✓ | Perorangan boleh; email terverifikasi, KTP bila diminta (Kebijakan Pendaftaran PANDI v9.0, 30 Sep 2024, mungkin sudah diperbarui). ±Rp 15–30 rb/tahun: perkiraan Silabus, harga resmi tidak ditemukan penulis ([6.1](#61-beli-domain-myid-di-registrar-terakreditasi-pandi-7-menit)). |
| **Akun Cloudflare** paket gratis | DNS | DNS dan Tunnel | Dukungan zona `.my.id` belum diverifikasi penulis. Bila ditolak, jalur utama memakai DNS registrar, jalur gratis butuh domain lain ([6.2](#62-cloudflare-paket-gratis-ganti-nameserver-lalu-tunggu-aktif-8-menit)). |
| **VPS** 2 GB RAM, 1–2 vCPU, disk ≥ 25 GB, Ubuntu Server 26.04 LTS, amd64 | ✓ | — | Contoh harga per 29 Okt 2026: **Rp 80.000/bulan** (penyedia lokal: 1 *core*, 2 GB, 60 GB) dan **$12/bulan** (penyedia luar: 1 vCPU, 2 GiB, 50 GiB). Cek ulang di situs penyedianya ([5.1](#51-pilih-dan-sewa-vps-2-gb-lalu-tempel-kunci-publik-ed25519-8-menit), [Silabus §5.5](../../SILABUS.md#55-biaya-layanan-fase-5)). |
| **Pi** (Kit B) | gerbang | pusat dan gerbang | Jalur gratis: Pi 2 GB atau lebih, dengan microSD *high-endurance* atau SSD ([Silabus §5.3](../../SILABUS.md#53-kit-b--raspberry-pi-sebagai-gateway-dibutuhkan-mulai-modul-12), [11.1](#111-pi-siap-menjadi-pusat-git-pull-ram-dan-kartu-penyimpanan-6-menit)). Tanpa Pi: laptop menjadi gerbang. |
| **Laptop dengan klien SSH** | ✓ | ✓ | OpenSSH (`ssh`, `scp`, `ssh-keygen`) bawaan Linux, macOS, dan Windows 10–11; Windows dan macOS tidak diuji penulis. |
| **HP dengan paket data seluler** | ✓ | ✓ | Membuka dashboard dari luar WiFi rumah dan memasang PWA. |
| **Satu teman di kota lain** | ✓ | ✓ | Bukti T1 ([12.4](#124--t1-teman-di-kota-lain-membuka-dashboard-mu-lewat-https-15-menit)). Belum ada teman? HP-mu sendiri lewat data seluler, dicatat sebagai pengganti. |
| **10 menit tanpa internet rumah** | ✓ | ✓ | Bukti T3. Ketahui dulu cara memutus internet tanpa mematikan WiFi ([10.2](#102--cabut-internet-rumah-bukan-wifi-rumah-2-menit)). |
| **MQTTX 1.13.1** | ✓ | ✓ | Sejak Modul 11; bukti T2a ([8.3](#83--t2a-tanpa-tls-ditolak-di-8883-dan-1883-tak-terjangkau-dari-luar-10-menit)) dan T2-gratis. |
| **GitHub** | ✓ | ✓ | Sudah ada; cabang `fitur/ke-internet` dibuat di [1.1](#11-cabang-fiturke-internet-dari-main-yang-terbaru-3-menit). |

Versi yang dipakai modul ini (Oktober 2026; Silabus v1.0.29 mencatatnya di daftar alat Modul 27):

| Komponen | Versi | Catatan |
| :--- | :--- | :--- |
| `caddy` | `2.11.7-alpine` | sama dengan Modul 26, kini dengan HTTPS |
| `eclipse-mosquitto` | `2.1.2-alpine` | sama; pintu 8883 dan jembatan TLS; membawa berkas akar ISRG Root X1 dan X2 |
| `cloudflare/cloudflared` | `2026.10.5` | jalur gratis; 2026.10.6 terbit 29 Okt, sengaja tetap versi yang dikunci |
| `timescale/timescaledb`, `grafana/grafana`, `node` | `2.30.2-pg17`, `13.2.4`, `24.22.1-alpine3.24` | tetap |
| `vite-plugin-pwa` | `2.0.0` | satu-satunya paket npm baru (khusus *build* frontend), versi persis |
| Docker Engine di VPS | 29.x dari repo apt Docker | terbaru 29.9.2 (20 Okt 2026); penulis: paket Ubuntu 29.1.3 dan Compose 2.40.3 |
| Ubuntu Server di VPS | 26.04 LTS | 24.04 LTS bila penyedia belum menyediakannya |
| OpenSSH, ufw | bawaan Ubuntu | kunci SSH ed25519 |
| Let's Encrypt | layanan, bukan unduhan | Caddy yang memintanya |
| Arduino-ESP32 | 3.3.12 | hanya 🧩 Tingkat 1 dan 🔬; jangan 4.0.0-RC1 |

**Berkas yang berubah minggu ini** (§9 Silabus v1.0.29 ikut mencatat tiga skrip baru dan `edge/pusat-internet.conf`; cocokkan semuanya dengan `kode/` di [➕ A](#a-cocokkan-proyekmu-akar-edge-skrip-backend-140-dan-frontend-130)):

| Tempat | Berkas |
| :--- | :--- |
| Akar proyek | `compose.cloud.yml` (satu berkas untuk laptop, VPS, dan Pi), `.env.example` (blok "Di internet (Modul 27)"), `.gitattributes` (+ `*.sql`), README, `KONTRAK-DATA.md` 1.5, templat *pull request* |
| `skrip/` | tiga baru: `salin-sertifikat.sh`, `perbarui-sertifikat-mqtt.sh`, `cek-susulan.sql` |
| `frontend/caddy/` | `Caddyfile`: nama domain, `/grafana/`, dan nama broker dijawab 404 |
| `edge/` | `pusat-internet.conf` (baru), `gerbang.conf`, `jembatan.contoh.conf`, `acl-broker`, `compose.edge.yml`, `.env.example`, README; `pusat.conf` hanya komentar |
| `backend/` 1.4.0 | `env.ts`, `server.ts`, `mqtt.ts`, `perintah.ts` beserta tesnya, `bruno/environments/internet.yml`, `.env.example`, `package.json`, README |
| `frontend/` 1.3.0 | `vite.config.ts`, `index.html`, ikon di `public/` dan `favicon.svg`, `src/api.ts`, `TombolSakelar.tsx`, `package.json` dan *lock*, README |
| `grafana/`, `alat/` | README saja |
| Tetap | firmware Node 1 1.6.0 dan Node 2 1.0.0, migrasi `001…010`, *provisioning* Grafana |

**Waktunya** ±10 jam untuk jalur utama dan ±7,5 jam untuk jalur gratis, belum termasuk menunggu domain dan DNS aktif: pemanasan 30 menit, Kemenangan Cepat 15, konsep ±100, praktik 405 (jalur gratis 255; Praktik 13 opsional +20), ➕ 30, serta kuis dan checklist 20.

## 🔁 Pemanasan ulang rumahmu, alamatmu, dan kartu identitas situs (30 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** di laptop (terminal di akar proyek), **terminal SSH ke Pi** (folder `rumah-pintar-mini/edge`, Kit B), **Chrome** atau **Edge**, dan **HP** di WiFi rumah.

Lima bekal, semuanya hanya **membaca**: tidak ada yang dinyalakan atau diubah. Salin [`lembar.md`](kode/pemanasan/lembar.md) (**Copy raw file**) ke `belajar-iot/modul-27/pemanasan.md` dan isi kolom **Milikmu**, tanpa sandi, token, isi `.env`, atau IP publik rumahmu. **Nanti di …** menunjuk tempat pemakaiannya.

### Langkah 1 — Inventaris rumah Modul 26 dan sidik jari riwayat

Di terminal akar proyek laptop: `docker compose ps -a`. Rumah yang sehat: `backend`, `db`, dan `grafana` `Up … (healthy)`, `mosquitto` dan `web` `Up`, layanan sekali jalan (`akun-broker`, `migrasi`, `akun-grafana`) `Exited (0)`. Kit B, sama di Pi (folder `edge`): `rumahpintar-gerbang-mosquitto-1` `Up`.

Lalu ambil sidik jari riwayat dengan skrip [Modul 26](../modul-26-docker-compose/README.md#12--hentikan-penulis-data-lalu-ambil-sidik-jari-riwayat-dengan-skripsidik-jarisql-8-menit) (bash/zsh):

```text
docker compose exec -T db psql -U postgres -d rumahpintar < skrip/sidik-jari.sql
```

PowerShell (tidak diuji penulis): `Get-Content skrip/sidik-jari.sql | docker compose exec -T db psql -U postgres -d rumahpintar`.

**Hasilnya (lab penulis; angkamu berbeda):**

```text
 bacaan |            sidik_jari            | ringkasan | jilid | tugas | akun | perangkat
--------+----------------------------------+-----------+-------+-------+------+-----------
   2296 | 5f3a77fd8df10b214810c0b2330f9704 |       383 |     9 |     3 |    2 |         3
(1 row)
```

Angkanya berubah selama data masuk; hari ini cukup kenali bentuknya. **Nanti di [7.5](#75--pindah-riwayat-ke-vps-cadangan-scp-pulihkan-lalu-sidik-jari-sama-14-menit) (jalur gratis: [11.4](#114--pindah-riwayat-ke-pi-sidik-jari-sama-backend-laptop-berhenti-12-menit)):** sidik jari diambil lagi sesudah data dihentikan, dan sesudah pindah harus sama persis.

### Langkah 2 — Alamat rumahmu di internet: router lawan situs "IP saya"

*Tidak direkam penulis (butuh router dan HP).* Buka halaman admin router (alamatnya biasanya di stikernya) dan cari alamat **WAN** atau **Internet**. Lalu, dari HP di WiFi rumah, buka situs "IP saya" (cari "what is my IP"; bandingkan IPv4-nya). **Sama** = router-mu memegang alamat publik sendiri. **Berbeda** (misalnya WAN-nya `100.64.x.x` atau `10.x.x.x`) = penyedia internetmu memakai **NAT bersama** (sering disebut CGNAT): banyak rumah berbagi satu alamat publik, jadi tamu dari internet tidak bisa mengetuk rumahmu, dengan atau tanpa *port forwarding*. Di lembar, tulis SAMA atau BERBEDA, tanpa angkanya.

**Nanti di [Konsep 1](#1-dari-rumah-ke-internet-tiga-pintu-dua-jalur):** jembatan Pi dan Cloudflare Tunnel sama-sama sambungan **keluar** dari rumah, tanpa pintu di router, jadi jalan di kedua keadaan.

### Langkah 3 — Buku telepon internet: `nslookup`, *record* A, CNAME, dan TTL

Di terminal mana pun (penulis hanya mencoba Linux), tanyakan server cuaca Modul 10 ke DNS publik `1.1.1.1`:

```text
nslookup api.open-meteo.com 1.1.1.1
```

**Hasilnya (lab penulis, internet sungguhan, 29 Okt 2026; bisa berubah):**

```text
Server:		1.1.1.1
Address:	1.1.1.1#53

Non-authoritative answer:
Name:	api.open-meteo.com
Address: 188.40.99.226
Name:	api.open-meteo.com
Address: 167.114.211.86
```

Setiap `Address:` sesudah `Name:` = satu *record* **A** (nama → IP); nama ini punya dua server. Lalu, satu per satu:

```text
nslookup open-meteo.com 1.1.1.1
nslookup -type=CNAME www.github.com 1.1.1.1
nslookup -debug open-meteo.com 1.1.1.1
```

Di lab penulis: `open-meteo.com` → `104.21.40.60` dan `172.67.178.9`, alamat **Cloudflare**, bukan server Open-Meteo; `www.github.com` → `canonical name = github.com.`, *record* **CNAME** (nama lain sebuah nama); `-debug` → `ttl = 300`, **TTL** = berapa detik jawaban boleh diingat (bisa lebih kecil: sisa simpanan di `1.1.1.1`). **Nanti di [Konsep 5](#5-domain-dan-dns-buku-telepon-internet) dan [6.4](#64--nslookup-buku-telepon-internet-sudah-mengenal-namamu-5-menit):** alamat Cloudflare itu, lalu `nslookup` namamu sendiri.

### Langkah 4 — Kartu identitas sebuah situs: rantai, nama, dan tanggal

Di Chrome atau Edge, buka `https://api.open-meteo.com` (isinya teks galat JSON; wajar). Klik ikon di kiri bilah alamat, lalu buka rincian sertifikatnya (menunya beda per versi; tidak direkam penulis). Catat tiga hal: **nama** yang dijamin, **penerbit** dan rantainya sampai **akar**, dan **tanggal berlaku**.

**Hasilnya (lab penulis, 29 Okt 2026, lewat `openssl s_client`, bukan browser):** dua server bergiliran, dua rantai. `167.114.211.86` (kunci ECDSA): `*.open-meteo.com` ← `YE2` (Let's Encrypt) ← `Root YE` ← **ISRG Root X2**, berlaku 31 Agu – 29 Nov 2026 (90 hari). `188.40.99.226` (kunci RSA): `open-meteo.com` ← `YR1` ← `Root YR` ← **ISRG Root X1**. Server ECDSA juga **mengirim** kartu X2 bertanda tangan X1 untuk klien yang hanya mengenal X1 (misalnya jembatan Pi); `openssl` berhenti di X2. Terbitan Let's Encrypt mulai 10 Feb 2027 berlaku 64 hari. `https://open-meteo.com` (lewat Cloudflare) berpenerbit lain: `WE1` (Google Trust Services).

`setInsecure()` di [Modul 10](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#8-https-dan-setinsecure-amplop-tersegel-yang-kurirnya-tidak-diperiksa) melewatkan ketiga pemeriksaan ini. **Nanti di [🏆](#-kemenangan-cepat-amplop-tersegel-tanpa-kartu-identitas-15-menit) dan [Konsep 6](#6-sertifikat-dibahas-tuntas-rantai-nama-dan-tanggal):** kartu dengan rantai gagal, lalu kartu namamu sendiri.

### Langkah 5 — Siapa memakai loket 80, 443, 1883, dan 8883?

Loket Modul 27: 80 dan 443 (web), 1883 (broker polos), 8883 (broker TLS). Program di luar Docker:

- Linux dan Pi: `ss -ltnp` (kolom keempat = alamat:loket; nama program perlu `sudo`).
- macOS: `lsof -nP -iTCP -sTCP:LISTEN` *(tidak diuji penulis)*.
- Windows (PowerShell): `Get-NetTCPConnection -State Listen | Where-Object LocalPort -in 80,443,1883,8883` *(tidak diuji penulis)*.

Loket yang dibuka Docker:

```text
docker ps --format 'table {{.Names}}\t{{.Ports}}'
```

Sesudah Modul 26, biasanya 80 dipakai `web` dan 1883 `mosquitto` pusat; 443 dan 8883 kosong (`443/tcp` tanpa `->` = belum dipesan). **Nanti di [2.3](#23-composecloudyml-modul-27-dan-blok-di-internet-di-env-laptop-4-menit):** Compose Modul 27 di laptop memesan `127.0.0.1:443` dan `127.0.0.1:8883`. Terpakai program lain (VPN, server web)? Catat: loketnya dipindah lewat `PORT_HTTPS` / `PORT_MQTTS` di `.env` ([🚨](#-kalau-tidak-jalan): `port is already allocated`).

<details>
<summary>Kunci uji dirimu</summary>

1. **Langkah 2: kenapa lewat WiFi rumah?** Lewat data seluler, yang terlihat alamat operator selulermu.
2. **Langkah 4: sekali X1, sekali X2. Salah?** Tidak: dua server, dua jenis kunci, dua rantai, sama-sama berujung akar tepercaya.

</details>

## 🏆 Kemenangan Cepat: amplop tersegel tanpa kartu identitas (15 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** di repositori `belajar-iot` dengan terminalnya, **Docker**, dan **Chrome** (Edge, Windows, dan macOS tidak diuji penulis).

Dua pelindung HTTPS dari [Konsep 8 Modul 10](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#8-https-dan-setinsecure-amplop-tersegel-yang-kurirnya-tidak-diperiksa) kini kamu lihat terpisah: **amplop tersegel** (isi terenkripsi) tanpa **kartu identitas kurir** (sertifikat) yang dijamin **lembaga tepercaya**. Satu kontainer Caddy menyajikan satu halaman lewat `https://` dengan kartu buatannya sendiri. Rp 0, semua jalur; proyek "Rumah Pintar Mini" tidak disentuh.

> [!NOTE]
> **Latihan saja, peringatan disengaja.** Peringatan keras browser di Langkah 3 memang yang ingin kita lihat. Di situs sungguhan, peringatan seperti itu berarti **berhenti**, apalagi di halaman yang meminta sandi. Loketnya hanya `127.0.0.1:8443` (laptop ini saja) dan dibongkar di Langkah 6.

### Langkah 1 — Baca `compose.yaml` dan `Caddyfile`, lalu nyalakan dengan `docker compose up -d` (3 menit)

1. Di repositori `belajar-iot`, buat folder `modul-27/kemenangan-cepat` berisi folder `halaman`.
2. Di folder `kemenangan-cepat`, buat dua berkas berikut (**Copy raw file** dari [`compose.yaml`](kode/kemenangan-cepat/compose.yaml) dan [`Caddyfile`](kode/kemenangan-cepat/Caddyfile)), lalu simpan (**Ctrl + S**). Nama `Caddyfile` tanpa ekstensi, dengan C besar.

```yaml
# compose.yaml - Kemenangan Cepat Modul 27: amplop tersegel tanpa kartu identitas.
# Nama berkas ini adalah nama BAWAAN Docker Compose, jadi di folder ini cukup: docker compose up -d   (tanpa -f)
# LATIHAN SAJA: Caddy menyajikan satu halaman lewat HTTPS dengan sertifikat buatannya SENDIRI ("Caddy Local Authority"), yang
# tidak dikenal browser mana pun. Browser akan memperingatkan: itu memang yang ingin kita lihat. Hanya bisa dibuka dari laptop
# ini (127.0.0.1), dan dibongkar di langkah terakhir dengan: docker compose down
services:
  amplop:
    # image yang sama dengan pintu depan proyek (layanan web), tag persis, tanpa "latest"
    image: caddy:2.11.7-alpine
    ports:
      # kiri = loket di laptopmu (8443, supaya tidak bentrok dengan 443), kanan = port HTTPS di dalam kontainer.
      # 127.0.0.1 = hanya laptop ini, bukan seluruh WiFi.
      - "127.0.0.1:8443:443"
    volumes:
      # setelan Caddy dan halaman latihan dari folder ini, hanya-baca (:ro)
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - ./halaman:/srv:ro
    # Tanpa lemari: sertifikat buatan Caddy tersimpan di dalam kontainer saja dan ikut hilang saat "docker compose down".
```

```text
# Caddyfile - Kemenangan Cepat Modul 27: HTTPS dengan sertifikat buatan Caddy sendiri (tls internal).
{
	# tanpa "loket admin" (2019), seperti di proyek
	admin off
	# Caddy biasanya mencoba memasang akar sertifikatnya ke daftar akar tepercaya komputer. Di dalam kontainer itu tidak
	# berguna (daftar akar laptopmu tidak tersentuh), jadi dilewati.
	skip_install_trust
}

# Alamat situs: nama localhost. Caddy melayani HTTPS di port 443 kontainer (loket 8443 di laptop).
localhost {
	# "tls internal" = sertifikat diterbitkan penerbit lokal milik Caddy sendiri ("Caddy Local Authority"), bukan Let's Encrypt.
	# Isi sambungan tetap terenkripsi, tetapi browser tidak mengenal penerbitnya, jadi identitas situs tidak terbukti.
	tls internal
	root * /srv
	file_server
}
```

Baca komentarnya. Intinya: image pintu depan proyekmu (sudah ada sejak Modul 26), loket 8443 (bukan 443), dan `tls internal` = kartu dari penerbit lokal milik Caddy, bukan Let's Encrypt.

3. Buat `halaman/index.html`, isi dengan [`index.html`](kode/kemenangan-cepat/halaman/index.html) (**Copy raw file**), lalu simpan.

4. Klik kanan folder `kemenangan-cepat` → **Open in Integrated Terminal**, lalu:

```text
docker compose up -d
```

**Hasilnya (lab penulis; waktumu berbeda):**

```text
[+] Running 2/2
 ✔ Network kemenangan-cepat_default     Created   0.1s
 ✔ Container kemenangan-cepat-amplop-1  Started   1.1s
```

Nama proyek = nama folder. `docker compose ps` menulis `Up`, dengan loket `127.0.0.1:8443->443/tcp`.

### Langkah 2 — Caddy membuat kartu identitasnya sendiri: `docker compose logs` (2 menit)

```text
docker compose logs
```

**Hasilnya (lab penulis; potongan dari 24 baris JSON):**

```text
"msg":"root certificate trust store installation disabled; unconfigured clients may show warnings"
"msg":"enabling automatic TLS certificate management","domains":["localhost"]
"msg":"certificate obtained successfully","identifier":"localhost","issuer":"local"
```

Kartu untuk `localhost` terbit sekejap dari penerbit lokal (`"issuer":"local"`). Baris pertama: akarnya tidak dipasang ke mana pun (`skip_install_trust`), jadi tak satu pun browser mengenalnya. Tiga baris `warn` wajar: `admin endpoint disabled` (`admin off`), serta `HTTP/2 skipped …` dan `HTTP/3 skipped …` (pengalih HTTP di port 80 kontainer).

### Langkah 3 — Buka `https://localhost:8443`: peringatan `Koneksi Anda tidak pribadi` (3 menit)

Di Chrome, buka `https://localhost:8443` (lengkap dengan `https://`).

**Hasilnya (lab penulis, Chrome 156 berbahasa Indonesia; di Linux bahasanya ikut bahasa sistem):** judul tab `Kesalahan privasi`, judul halaman `Koneksi Anda tidak pribadi`, kode `NET::ERR_CERT_AUTHORITY_INVALID`, tombol **Lanjutan** dan tombol biru **Kembali agar aman**.

Baca dulu, jangan buru-buru diklik. Kodenya berarti "penerbit kartu identitas ini tidak dikenal": Chrome tidak bisa memastikan yang menjawab benar-benar `localhost`, bukan penyamar.

### Langkah 4 — Kartu identitasnya: diterbitkan Caddy Local Authority, rantainya gagal (3 menit)

Klik ikon di kiri bilah alamat, lalu buka rincian sertifikatnya (nama menunya berbeda per versi). Periksa tiga hal seperti di [🔁 Langkah 4](#langkah-4--kartu-identitas-sebuah-situs-rantai-nama-dan-tanggal).

**Hasilnya (lab penulis, lewat `openssl`; jendela ini tidak bisa direkam):** kartu `localhost` berlaku **12 jam**, ditandatangani `Caddy Local Authority - ECC Intermediate` (berlaku 7 hari), yang ditandatangani `Caddy Local Authority - 2026 ECC Root`; putusannya `Verify return code: 20 (unable to get local issuer certificate)`.

**Nama** cocok dan **tanggal** masih berlaku. Yang gagal hanya **rantai**: akarnya hanya ada di dalam kontainer ini ([Konsep 6](#6-sertifikat-dibahas-tuntas-rantai-nama-dan-tanggal)).

### Langkah 5 — Lanjutkan dengan sengaja: terenkripsi, tetapi identitasnya tidak terbukti (2 menit)

Hanya di latihan ini: klik **Lanjutan** (berganti **Sembunyikan lanjutan**), lalu tautan **Lanjutkan ke localhost (tidak aman)** di bawahnya. Halaman `Halo dari amplop tersegel` tampil. Sambungannya TLS 1.3, jadi isinya tersegel dari penguping, tetapi tak ada lembaga tepercaya yang menjamin siapa yang menjawab. Inilah `setInsecure()` Modul 10 dilihat dari browser; bedanya, ESP32 tidak pernah memperingatkanmu.

Layar Langkah 3 dan 5 di lab penulis (Chrome 156 tanpa layar di Linux):

![Komposit tiga tangkapan layar asli Chrome 156 berbahasa Indonesia di Linux, laptop 1280 piksel, untuk Kemenangan Cepat: https://localhost:8443 dilayani Caddy 2.11.7 dengan sertifikat buatannya sendiri (tls internal). Kiri atas, langkah 3: segitiga merah, judul Koneksi Anda tidak pribadi (nomor 1), kalimat Penyerang mungkin mencoba mencuri informasi Anda dari localhost (misalnya, sandi, pesan, atau kartu kredit), kode NET::ERR_CERT_AUTHORITY_INVALID (nomor 2), kotak saran perlindungan yang ditingkatkan, tombol Lanjutan di kiri (nomor 4) dan tombol biru Kembali agar aman di kanan (nomor 3), pilihan yang benar untuk situs sungguhan. Kanan atas, sesudah klik Lanjutan: tombol berganti Sembunyikan lanjutan, lalu kalimat Server ini tidak dapat membuktikan bahwa ini adalah localhost; sertifikat keamanannya tidak dipercaya oleh sistem operasi komputer Anda (nomor 4) dan tautan Lanjutkan ke localhost (tidak aman) (nomor 5), yang hanya boleh dipakai di latihan ini. Kiri bawah, sesudah tautan itu: halaman Halo dari amplop tersegel (nomor 6), isi terenkripsi tetapi identitas situs tidak terbukti, sama dengan setInsecure() Modul 10. Di bawahnya kotak catatan langkah 4 yang tidak tertangkap karena bilah alamat tidak tampak: menurut openssl, daun localhost berlaku 12 jam, diterbitkan Caddy Local Authority - ECC Intermediate, akarnya Caddy Local Authority - 2026 ECC Root, Verify return code 20 (unable to get local issuer certificate). Legenda bernomor di kanan bawah.](aset/amplop-tanpa-kartu.png)

### Langkah 6 — Bongkar dengan `docker compose down`, tanpa sisa (2 menit)

```text
docker compose down
```

**Hasilnya (lab penulis, dipendekkan):**

```text
 ✔ Container kemenangan-cepat-amplop-1  Removed   0.5s
 ✔ Network kemenangan-cepat_default     Removed   0.2s
```

Kartu buatan Caddy ikut hilang (tanpa lemari); loket 8443 bebas lagi.

**Tiga cara bicara dengan server** (Modul 10 Konsep 8, dilengkapi):

| | Isi terenkripsi? | Identitas diperiksa? | Di ESP32 | Di browser |
| :-- | :-: | :-: | :-- | :-- |
| HTTP polos (kartu pos) | tidak | tidak | `http://…` | dashboard Modul 26 di WiFi rumah |
| HTTPS tanpa kartu identitas | ya | tidak | `setInsecure()` | Kemenangan Cepat ini |
| HTTPS dengan kartu identitas | ya | ya | `setCACert()` atau bundel akar | minggu ini: `https://iot.namaanda.my.id` ([7.8](#78--gembok-di-httpsiotnamaandamyid-308-login-dan-cookie-secure-6-menit); jalur gratis [11.8](#118--t1-gratis-dan-t2-gratis-dashboard-dari-hp-broker-tetap-di-rumah-6-menit)) |

> ➡️ **Berikutnya:** kartu identitas yang dikenali semua HP butuh nama domain milikmu, dan itulah isi [Konsep 5](#5-domain-dan-dns-buku-telepon-internet) dan [Konsep 6](#6-sertifikat-dibahas-tuntas-rantai-nama-dan-tanggal). Baca dulu [Konsep 1](#1-dari-rumah-ke-internet-tiga-pintu-dua-jalur) dan Konsep 5, lalu beli domainmu di [6.1](#61-beli-domain-myid-di-registrar-terakreditasi-pandi-7-menit) dan [6.2](#62-cloudflare-paket-gratis-ganti-nameserver-lalu-tunggu-aktif-8-menit) hari ini juga: menunggu *nameserver* aktif bisa berjam-jam. Rumahmu tetap menyala selama [Praktik 1](#praktik-1--meja-kerja-cabang-sidik-jari-dan-cadangan-15-menit) sampai [Praktik 4](#praktik-4--simpan-teruskan-di-rumah-dulu-jembatan-lan-dan-latihan-putus-10-menit-30-menit).

## 🧠 Konsep "Mengapa"

Sebelas konsep ini tidak perlu dibaca sekaligus. Bacalah berselang-seling dengan praktiknya:

1. Kemenangan Cepat (sudah kamu kerjakan) → Konsep 1 dan Konsep 5 → beli domain di 6.1–6.2 (menunggu *nameserver* aktif bisa berjam-jam, jadi mulai hari ini)
2. Praktik 1 (meja kerja) → bagian `TRUST_PROXY` di Konsep 7 → Praktik 2 (backend 1.4.0)
3. Konsep 11 → Praktik 3 (dashboard menjadi PWA di `http://localhost`)
4. Konsep 9 → Praktik 4 (simpan-teruskan di rumah dulu). Praktik 1–4 tanpa biaya; sesudah ini, pilih jalurmu
5. Jalur utama: Konsep 2–4 → Praktik 5 (VPS) → 6.3–6.4 (*record* A ke IP VPS) → Konsep 6–7 → Praktik 7 → Konsep 8 → Praktik 8 dan Praktik 9 → Praktik 10
6. Jalur gratis: 6.4 (begitu *nameserver* aktif) → Konsep 10 → Praktik 11
7. Semua jalur: Praktik 12 (aplikasi di HP dan teman di kota lain); Praktik 13 opsional (jalur utama)

Potongan berkas, perintah, dan tabel di bagian konsep cukup dibaca; semuanya diketik dan dijalankan di praktik.

Modul 26 ditutup dengan janji: `compose.cloud.yml` yang sama pindah ke mesin yang menyala 24 jam dengan domain dan HTTPS, jembatan Pi naik ke TLS dan belajar menahan data, dan dashboard menjadi aplikasi di HP ([Konsep 10 Modul 26](../modul-26-docker-compose/README.md#10-dua-berkas-sampai-akhir-pusat-dan-gerbang)). Konsep 1–4 menjawab di mana rumahmu tinggal di internet dan bagaimana pintunya dijaga, Konsep 5–8 memberinya nama dan amplop tersegel, dan Konsep 9–11 membuatnya tahan putus, membuka jalur gratis, dan bisa dipasang di HP.

### 1. Dari rumah ke internet: tiga pintu, dua jalur

Sampai Modul 26, Rumah Pintar Mini hidup di dalam pagar rumah: Node 1 mengirim ke broker gerbang di Pi, jembatan LAN meneruskannya ke pusat di laptop, dan dashboard dibuka di `http://localhost` atau lewat WiFi rumah. Begitu laptop tidur, atau kamu sedang di luar rumah, semuanya tak terjangkau. Tabel [Silabus §2.2](../../SILABUS.md#22-di-mana-otak-nya-berjalan-dari-waktu-ke-waktu) menyiapkan dua baris untuk Modul 27 dan seterusnya, dan modul ini menyebutnya dua **jalur**:

- **Jalur utama:** otak rumah (Mosquitto, API, database, Grafana, web) pindah ke **VPS**, komputer sewaan yang menyala 24 jam (Konsep 2). Pi tetap gerbang, dan menahan data saat internet rumah putus (Konsep 9).
- **Jalur gratis:** semuanya tinggal di Pi, dan dashboard keluar rumah lewat **Cloudflare Tunnel** ([Konsep 10](#10-jalur-gratis-cloudflare-tunnel)). Broker MQTT hanya ada di jaringan rumah.

**Tiga pintu di VPS.** VPS punya alamat IP publik (contoh modul ini `203.0.113.10`; milikmu tertulis di panel penyedia), dan siapa pun di internet bisa mengetuknya. Karena itu hanya tiga pintu yang dibuka:

| Pintu | Loket | Untuk siapa | Isinya |
| :-- | :-- | :-- | :-- |
| Web | **443** (TCP, juga UDP untuk HTTP/3, versi HTTP terbaru; [🔬](#-bedah-teknis-opsional) *HSTS dan HTTP/3*) dan **80** | tamu mana pun, dan Let's Encrypt | 443: dashboard, API `/api`, dan Grafana `/grafana/` lewat HTTPS. 80: tamu yang mengetik `http://` dialihkan ke `https://`. Let's Encrypt memeriksa lewat 80 atau 443 bahwa namamu memang menunjuk VPS ini (Konsep 6–7) |
| Broker TLS | **8883** | jembatan Pi, dan perangkat di lokasi lain ([Praktik 13](#praktik-13--opsional-perangkat-di-lokasi-lain-lewat-mqtts-tanpa-gerbang-20-menit)) | MQTT di dalam amplop tersegel, alamatnya `mqtts://` (Konsep 8) |
| SSH | **22** | kamu saja, dengan kunci SSH | terminal VPS (Konsep 3) |

Selebihnya, yaitu broker polos 1883, database 5432, Grafana 3000, dan backend 8080, tetap di dalam VPS dan hanya bisa diketuk dari VPS itu sendiri ([Konsep 4](#4-tembok-api-yang-bocor-ufw-dan-docker)).

**Yang tetap di rumah.** Node 1 (firmware 1.6.0, tidak berubah) tetap mengirim ke Pi di `192.168.1.37:1883`, polos, dengan akun lamanya. Kontrak data 1.5 membedakan dua alamat broker: **di rumah** = alamat IP + 1883 polos; **di internet** = nama domain (`mqtt.namaanda.my.id`) + 8883 + TLS 1.2 ke atas, dengan sertifikat yang diperiksa. Kartu pos 1883 hanya beredar di dalam rumah. Yang keluar rumah hanya jembatan Pi, di dalam amplop, dengan topik pilihan: `telemetry`, `status`, `vitals`, dan `ack` naik, `cmd` turun. Itulah janji [Modul 12](../../fase-2-konektivitas/modul-12-raspberry-pi-dan-linux/README.md#1-gateway-dan-edge-kantor-pos-yang-selalu-buka-di-rumah): data mentah tetap di rumah, dan yang dikirim keluar hanya yang perlu. Node-RED di Pi juga tetap di rumah: dashboard-nya, yang menurut [🔬 Modul 13](../../fase-2-konektivitas/modul-13-node-red-dashboard/README.md#-bedah-teknis-opsional) menunggu TLS, tidak dibuka ke internet dan tetap `http://` di WiFi rumah; dari luar rumah, pakai dashboard di `https://iot.namaanda.my.id`.

**Tanpa *port forwarding*, di kedua jalur.** Tidak satu pun pintu dibuka di router rumah. Jembatan Pi dan `cloudflared` sama-sama membuka sambungan **keluar** dari rumah, seperti HP-mu membuka sebuah situs, dan lalu lintas dua arah memakai sambungan itu: perintah lampu turun lewat jalan yang sama. Jadi pesan [Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#10-jujur-lalu-lintas-di-rumah-masih-polos), broker rumah tidak boleh terjangkau dari internet, tetap berlaku sampai akhir kurikulum. Ada alasan kedua. Kalau di [🔁 Langkah 2](#langkah-2--alamat-rumahmu-di-internet-router-lawan-situs-ip-saya) alamat WAN router-mu berbeda dengan alamat "IP saya", penyedia internetmu memakai NAT bersama, dan rumahmu memang tidak bisa diketuk dari luar, dengan atau tanpa *port forwarding*. Sambungan keluar tetap jalan.

| | Jalur utama | Jalur gratis |
| :-- | :-- | :-- |
| Pusat (otak) | VPS sewaan | Pi yang sama dengan gerbang |
| Tamu masuk lewat | Caddy di VPS, `https://iot.namaanda.my.id` | tepi Cloudflare, lalu terowongan Cloudflare ke Caddy di Pi |
| HTTPS dipasang oleh | Caddy, dengan sertifikat Let's Encrypt | Cloudflare, di tepinya |
| Broker dari internet | `mqtt.namaanda.my.id:8883` (TLS) | tidak ada |
| Jembatan Pi | keluar rumah ke VPS, lewat TLS | di dalam Pi: gerbang 1883 → pusat 1884, polos |
| Dikerjakan di | [Praktik 5](#praktik-5--jalur-utama-sewa-vps-dan-amankan-pintunya-60-menit), [Praktik 7](#praktik-7--jalur-utama-pusat-di-vps-dengan-https-75-menit)–10 | [Praktik 11](#praktik-11--jalur-gratis-semua-di-pi-dan-cloudflare-tunnel-85-menit) |

**Satu berkas, tiga tempat.** [Modul 26](../modul-26-docker-compose/README.md#10-dua-berkas-sampai-akhir-pusat-dan-gerbang) berjanji tetap dua berkas Compose, tanpa berkas ketiga, dan janji itu ditepati. `compose.cloud.yml` yang sama menyala di laptop (seperti Modul 26, `http://localhost`), di VPS (domain, HTTPS, dan pintu 8883), dan di Pi jalur gratis (ditambah profil `terowongan`); gerbang tetap `edge/compose.edge.yml`. Yang berbeda hanya isi `.env`, misalnya `DOMAIN_WEB`, `DOMAIN_MQTT`, `KONF_PUSAT`, dan `ALAMAT_WEB`. Setelan yang dibiarkan kosong berarti perilaku Modul 26, kecuali loket broker 1883: bawaannya kini `127.0.0.1` ([Konsep 4](#4-tembok-api-yang-bocor-ufw-dan-docker)), jadi laptop Kit B perlu `ALAMAT_MQTT=0.0.0.0` di [1.4](#14--kit-b-alamat_mqtt-di-env-laptop-supaya-jembatan-pi-tetap-tersambung-3-menit). Tabel nilai per tempatnya ada di [7.2](#72-env-vps-rahasia-baru-dan-kolom-vps-di-tabel-nilai-per-tempat-10-menit).

![Diagram dua jalur ke internet (Konsep 1 dan 10), keadaan Rumah Pintar Mini sesudah Modul 27; tidak ada port forwarding di router pada kedua jalur. Kiri, rumah: Node 2 Kebun v1.0.0 lewat ESP-NOW ke Node 1 Rumah v1.6.0 (firmware tetap), MQTT polos ke 192.168.1.37:1883. Raspberry Pi: mosquitto gerbang loket 1883, edge/compose.edge.yml, simpan-teruskan: antrean ditahan di Pi saat internet putus. Kotak putus-putus, jalur gratis saja: pusat juga di Pi, compose.cloud.yml dengan .env kolom Pi (web Caddy :80, backend, db, grafana, broker pusat 1884 hanya 172.17.0.1), jembatan LAN ke pusat:1884 lewat host-gateway, cloudflared profil terowongan membuka terowongan KELUAR ke Cloudflare. Tengah atas, VPS sewaan jalur utama: Ubuntu 26.04, 2 GB, contoh IP 203.0.113.10; compose.cloud.yml yang sama, .env kolom VPS, KONF_PUSAT=pusat-internet.conf; backend 1.4.0 cookie Secure; web Caddy HTTPS otomatis, 80 dan 443; db riwayat dipindah; grafana lewat /grafana/; mosquitto 8883 TLS, 1883 lokal; sertifikat-mqtt, salin + cron mingguan; pintu terbuka 22, 80/443, 8883. Dari gerbang: jembatan TLS keluar ke 8883, akar ISRG X1, perintah turun lewat jalan sama. Tengah bawah, Cloudflare jalur gratis: HTTPS di tepi Cloudflare lalu lewat terowongan ke web:80 di Pi; iot. = CNAME ke terowongan, tanpa mqtt.: MQTT tidak lewat terowongan; Cloudflare melihat isi lalu lintas. Kanan: tamu di mana pun (HP data seluler, teman, PWA) ke https://iot.namaanda.my.id lewat 443; laptop admin, kunci SSH ed25519, lewat 22 (ssh -L untuk loket 127.0.0.1); tamu jalur gratis ke alamat sama. Keduanya sambungan KELUAR dari rumah. Pita: backend 1.4.0, dashboard 1.3.0, kontrak data 1.5, firmware tetap. Bawah, GitHub, cabang fitur/ke-internet, pull request Online di internet: HTTPS, TLS MQTT, jembatan tahan putus, PWA; berkas berubah: compose.cloud.yml, .env.example, Caddyfile, pusat-internet.conf baru, gerbang.conf + 4 baris, jembatan.contoh.conf, acl-broker, skrip sertifikat + cek-susulan.sql, backend (118 tes), frontend PWA, KONTRAK-DATA, README. Tidak pernah ikut Git: .env, TUNNEL_TOKEN, edge/.env, jembatan/pusat.conf, kunci SSH, lemari Caddy, backup/. Menyusul: Modul 28 OTA, Modul 29 GitHub Actions, Modul 30 Uptime Kuma dan backup. Jujur: saat internet putus dashboard tetap Online (data basi), aturan server diam; diuji di internet tiruan, bukan VPS atau HP sungguhan.](aset/dua-jalur-ke-internet.png)

> ⬆️ **Sudah membaca Konsep 1?** Baca juga [Konsep 5](#5-domain-dan-dns-buku-telepon-internet), lalu beli domainmu di [6.1](#61-beli-domain-myid-di-registrar-terakreditasi-pandi-7-menit) dan [6.2](#62-cloudflare-paket-gratis-ganti-nameserver-lalu-tunggu-aktif-8-menit). Sambil menunggu *nameserver* aktif, kerjakan [Praktik 1](#praktik-1--meja-kerja-cabang-sidik-jari-dan-cadangan-15-menit). Konsep 2–4 baru dibutuhkan sebelum [Praktik 5](#praktik-5--jalur-utama-sewa-vps-dan-amankan-pintunya-60-menit).

### 2. VPS: komputer sewaan yang menyala 24 jam

Sejak Modul 19, dan lagi di [Konsep 8 Modul 26](../modul-26-docker-compose/README.md#8-menyala-berurutan-dan-bangkit-sendiri-healthcheck-depends_on-restart-policy-dan-log), kalimat yang sama berulang: laptop tidur, rumah tidur. Bot Telegram, aturan otomatis, *alert* "Node diam", dan laporan pagi hanya hidup selama laptop menyala. [Server yang menyala terus](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#9-notifikasi-telegram-penting-cepat-dan-tidak-cerewet) baru terwujud minggu ini.

**VPS** (*virtual private server*) adalah komputer sewaan di pusat data yang menyala 24 jam: **rumah kedua yang selalu terjaga**. Penyedia membagi server besar menjadi banyak komputer virtual, dan satu di antaranya milikmu, lengkap dengan Linux, disk, dan alamat IP publik. Seperti Pi di Modul 12, VPS tidak punya layar: kamu masuk lewat SSH (Konsep 3) dan mengetik semua perintah di terminal. Di jalur gratis, peran rumah kedua dipegang Pi-mu sendiri.

**Ukuran: 2 GB RAM.** [Modul 26](../modul-26-docker-compose/README.md#115-catatan-belajar-tiga-angka-docker-stats-lalu-bersihkan-proyek-uji-5-menit) mengukur ±486 MiB di laptop dan menyebutnya bekal VPS 2 GB. Di VPS tiruan lab penulis, seluruh pusat memakai ±517 MiB menjelang akhir lab: Grafana 238, database 154, backend 103, web 16, dan Mosquitto 6 MiB (pengukuran lain penulis saat diam: ±0,4–0,65 GB). Grafana paling besar, dan angkanya naik-turun ([Modul 25](../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md#2-grafana-tinggal-di-samping-database-satu-docker-run-dan-sebuah-lorong) mencatat ±200–470 MiB). Tambahkan Ubuntu dan Docker sendiri, lalu lonjakan saat image dibangun di VPS (`npm ci` dan Vite), dan jelaslah kenapa [Silabus §5.5](../../SILABUS.md#55-biaya-layanan-fase-5) menulis bahwa 1 GB tidak cukup. Pilih **2 GB RAM, 1–2 vCPU (inti prosesor virtual), disk ≥ 25 GB** (cukup untuk image dan riwayat sampai Modul 30; perkiraan penulis). *Swap* 2 GB di [5.6](#56-swap-2-gb-untuk-build-image-5-menit), yaitu sebagian disk yang dipakai sebagai RAM tambahan, menjadi cadangan saat *build*; kebutuhan memori *build* di VPS 2 GB belum diukur penulis ([🚨](#-kalau-tidak-jalan) bila *build* berhenti karena kehabisan memori). Angka VPS-mu sendiri kamu lihat di [7.11](#711-docker-stats-ram-vps-saat-diam-3-menit).

**Jenis prosesor.** Modul ini menganggap VPS-mu berprosesor Intel atau AMD (**amd64**; lihat spesifikasi di halaman penyedia), sedangkan Pi dan Mac Apple silicon berprosesor **arm64**. Cetakan resmi (Caddy, Mosquitto, TimescaleDB, Grafana) berisi keduanya, tetapi cetakan buatanmu hanya untuk prosesor mesin yang membangunnya: image backend dan web dari Pi atau Mac ditolak VPS amd64 dengan `no matching manifest for linux/amd64` ([Konsep 11 Modul 26](../modul-26-docker-compose/README.md#11-toko-image-ghcr-dan-arsitektur)). Jalan keluar modul ini: bangun image langsung di VPS dengan `docker compose build` ([7.4](#74-docker-compose-build-di-vps-sebelum-layanan-lain-menyala-12-menit)), atau, bila laptopmu Intel atau AMD (amd64), bangun dan titipkan ke toko image seperti [Praktik 10 Modul 26](../modul-26-docker-compose/README.md#praktik-10--toko-image-ghcr-manual-35-menit) lalu VPS cukup menariknya. Satu image untuk dua jenis prosesor dibuat otomatis di Modul 29.

**Sistem, lokasi, dan harga.** Pilih **Ubuntu Server 26.04 LTS** (bila penyedia belum menyediakannya, 24.04 LTS; keduanya didukung Docker), lokasi **Indonesia atau Singapura** supaya dekat dengan HP-mu, dan tagihan bulanan atau per jam. Harga yang dibaca penulis pada 29 Okt 2026 (cek ulang; harga berubah dan belum tentu termasuk pajak): **Rp 80.000/bulan** di satu penyedia lokal (1 *core*, 2 GB, disk 60 GB) dan **$12/bulan** di satu penyedia luar (1 vCPU, 2 GiB, disk 50 GiB). Silabus (v1.0.29) mencatat kisaran ±Rp 80–200 rb/bulan, dan jalur gratis tetap membayar domain. Silabus memakai VPS di Modul 27–30, jadi sewa bulanan atau per jam membuatmu bebas berhenti sesudahnya.

**Yang menjaga dirinya sendiri, dan yang tidak.** Menurut dokumentasi Ubuntu, Ubuntu Server memasang pembaruan keamanan sendiri (`unattended-upgrades`, aktif bawaan) tanpa menyalakan ulang VPS ([5.8](#58-jam-vps-dalam-utc-dan-pembaruan-keamanan-otomatis-6-menit)). Docker yang kamu pasang dari repo Docker ([5.7](#57--docker-engine-dari-repo-apt-docker-dan-grup-docker-12-menit)) tidak ikut, jadi memperbaruinya tetap pekerjaan tanganmu. VPS juga bisa hilang: tagihan lupa dibayar, salah hapus, atau gangguan di penyedia. *Snapshot* (foto disk) di panel penyedia bukan cadangan, karena biasanya tersimpan di penyedia yang sama. Sampai cadangan otomatis ke tempat lain di [Modul 30](../../SILABUS.md#modul-30--monitoring-backup-runbook-tahu-lebih-dulu-tidak-pernah-kehilangan-data), cadanganmu adalah resep manual [1.3](#13--cadangan-sebelum-mengubah-apa-pun-pg_dump-lalu-docker-compose-cp-ke-backup-5-menit) yang dijalankan di VPS, lalu arsipnya dibawa ke laptop dengan `scp` (arah kebalikan [7.5](#75--pindah-riwayat-ke-vps-cadangan-scp-pulihkan-lalu-sidik-jari-sama-14-menit)).

### 3. Kunci SSH dan pengguna biasa: *login* sandi dan root dimatikan

Di Modul 12 kamu masuk ke Pi dengan `ssh` dan kata sandi, dan itu cukup karena Pi hanya bisa diketuk dari WiFi rumah. VPS lain cerita: pintu 22-nya terbuka ke seluruh internet, dan seperti kata [Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#10-jujur-lalu-lintas-di-rumah-masih-polos) tentang broker, pintu yang terbuka ke internet diketuk penebak sandi otomatis setiap hari. Tiga kebiasaan menjawabnya.

**Masuk dengan kunci, bukan sandi.** Kunci SSH adalah sepasang berkas: satu rahasia di laptop (`~/.ssh/id_ed25519`), satu dititipkan di server (`id_ed25519.pub`), seperti di [🔬 Modul 12](../../fase-2-konektivitas/modul-12-raspberry-pi-dan-linux/README.md#-bedah-teknis-opsional) (lipatan *Masuk tanpa kata sandi dengan kunci SSH*). Jenisnya **ed25519**, yang dianjurkan dokumentasi Ubuntu. Kunci publik ditempel di panel penyedia saat VPS dibuat ([5.1](#51-pilih-dan-sewa-vps-2-gb-lalu-tempel-kunci-publik-ed25519-8-menit)), lalu dititipkan lagi untuk pengguna barumu ([5.3](#53-pengguna-biasa-rumah-dengan-sudo-dan-kunci-ssh-mu-6-menit)). Lindungi kunci privat dengan *passphrase* (kata sandi pelindung kunci, seperti di Modul 12), dan jangan pernah menyalinnya keluar dari laptop.

**Bekerja sebagai pengguna biasa.** Pengguna `root` boleh melakukan apa saja, dan namanya diketahui semua orang, jadi penyerang tinggal menebak sandinya. Kamu membuat pengguna **`rumah`** dan memasukkannya ke grup `sudo`: perintah biasa berjalan tanpa hak istimewa, dan hanya perintah berawalan `sudo` yang berjalan sebagai root, sesudah sandi `rumah` ditanyakan. Sesudah itu, root tidak boleh masuk lewat SSH sama sekali. Catatan dari Modul 26 tetap berlaku: grup `docker` setara root ([6.1 Modul 26](../modul-26-docker-compose/README.md#61-pi-docker-engine-dari-repo-apt-docker-grup-docker-dan-git-20-menit)), jadi di VPS pun hanya `rumah` yang masuk grup itu ([5.7](#57--docker-engine-dari-repo-apt-docker-dan-grup-docker-12-menit)).

**Matikan *login* sandi dengan berkas sendiri.** Setelan server SSH (`sshd`) ada di `/etc/ssh/sshd_config`, tetapi berkas itu lebih dulu membaca semua berkas `/etc/ssh/sshd_config.d/*.conf`, urut abjad, dan untuk sebagian besar setelan **nilai pertama yang menang**. Jebakannya: VPS yang disiapkan alat cloud-init bisa membawa berkas `50-cloud-init.conf` berisi `PasswordAuthentication yes`, yang mengalahkan `no` di berkas utama. Karena itu [5.4](#54--matikan-login-sandi-dan-root-00-kunciconf-sshd--t-dan-jendela-kedua-10-menit) menulis berkas sendiri, `/etc/ssh/sshd_config.d/00-kunci.conf`, yang terbaca lebih dulu daripada `50-…`:

```text
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
```

Baris kedua menutup jalan lain untuk mengetik sandi (tanya-jawab di layar). Dua pemeriksaan membedakan "benar tulisannya" dari "benar dipakai": `sudo sshd -t` hanya memeriksa tata tulis berkas (tanpa keluaran = benar), sedangkan `sudo sshd -T` mencetak nilai yang benar-benar dipakai, dengan nama berhuruf kecil (`passwordauthentication no`). Hanya yang kedua membuktikan bahwa `50-cloud-init.conf` tidak menang.

**Jendela kedua.** Sesudah setelan baru berlaku, jangan menutup sesi SSH yang sedang terbuka. Buka terminal kedua dan masuk sebagai `rumah` dengan kunci. Berhasil? Baru jendela pertama boleh ditutup. Gagal? Jendela pertama yang masih terbuka adalah jalan pulangmu untuk membetulkan setelan. Seperti mengganti kunci pintu rumah: coba kunci baru dari luar dulu, sebelum pintu belakang ditutup.

**Sidik jari VPS.** Sapaan SSH pertama menunjukkan **sidik jari kunci** VPS, dan laptop mencatatnya di `known_hosts`, sama dengan Pi di [Modul 12](../../fase-2-konektivitas/modul-12-raspberry-pi-dan-linux/README.md#4-ssh-terminal-jarak-jauh) ([5.2](#52-ssh-pertama-dan-sidik-jari-host-5-menit)). VPS yang dibuat ulang dengan IP yang sama punya sidik jari baru, dan SSH menolak dengan `REMOTE HOST IDENTIFICATION HAS CHANGED` (obatnya di [🚨](#-kalau-tidak-jalan)).

Penghalau penebak sandi seperti fail2ban tidak wajib di sini, karena *login* sandi sudah mati ([🔬](#-bedah-teknis-opsional), lipatan *Pilihan yang tidak dipakai …*). Semua isi konsep ini berasal dari dokumentasi Ubuntu dan OpenSSH; penulis tidak punya VPS, jadi langkahnya tidak direkam.

### 4. Tembok api yang bocor: ufw dan Docker

Di Modul 11 kamu bertemu **tembok api** (*firewall*) di laptop, penjaga yang memutuskan sambungan masuk mana yang boleh lewat ([1.4 Modul 11](../../fase-2-konektivitas/modul-11-mqtt-dan-kontrak-data/README.md#14-izinkan-mosquitto-lewat-firewall)); di Ubuntu namanya **ufw**. Di VPS, ufw dinyalakan. Ada dua hal yang wajib dipahami.

**Izinkan 22 dulu.** ufw bawaan Ubuntu mati. Begitu dinyalakan, ia menolak sambungan masuk yang tidak ada di daftar izinnya, termasuk SSH-mu sendiri bila 22 belum didaftarkan. Karena itu `sudo ufw allow 22/tcp` ditulis **paling dulu**, baru `sudo ufw enable` ([5.5](#55--ufw-izinkan-22-dulu-lalu-80-443-dan-8883-8-menit)). Telanjur terkunci? Panel penyedia biasanya punya konsol web ([🚨](#-kalau-tidak-jalan)).

**ufw tidak menjaga loket Docker.** Inilah kejutan minggu ini. Menurut dokumentasi Docker, Docker dan ufw tidak cocok satu sama lain: paket menuju loket kontainer dibelokkan Docker **sebelum** aturan ufw sempat membacanya. Halaman Docker tentang loket bahkan dibuka dengan peringatan bahwa membuka loket kontainer, pada bawaannya, tidak aman: "Publishing container ports is insecure by default." Jadi setiap baris `ports:` di `compose.cloud.yml` adalah **pintu samping Docker**, dan ufw tidak pernah ditanya. `sudo ufw deny 1883` tidak menutup loket broker yang dibuka Docker.

**Yang menentukan: alamat di depan loket.** Karena ufw tidak ditanya, penjaga loket kontainer di dalam VPS tinggal satu, yaitu alamat yang tertulis di depannya, seperti di [Konsep 7 Modul 26](../modul-26-docker-compose/README.md#7-lorong-dibedah-network-compose-loket-dan-pintu-depan):

- **`127.0.0.1`** = hanya VPS itu sendiri yang bisa mengetuk. Dari internet, loket itu seperti tidak ada.
- **`0.0.0.0`** = semua antarmuka IPv4 VPS, artinya seluruh internet.

Broker di `compose.cloud.yml` Modul 27 punya dua loket (layanan `mosquitto` di [`kode/compose.cloud.yml`](kode/compose.cloud.yml); berkas utuhnya kamu salin di [2.3](#23-composecloudyml-modul-27-dan-blok-di-internet-di-env-laptop-4-menit)):

```yaml
    ports:
      - "${ALAMAT_MQTT:-127.0.0.1}:${PORT_MQTT:-1883}:1883"
      - "${ALAMAT_WEB:-127.0.0.1}:${PORT_MQTTS:-8883}:8883"
```

Bawaan keduanya kini `127.0.0.1`. Di Modul 26, loket 1883 tidak beralamat sama sekali, artinya semua antarmuka: bisa diterima di laptop di balik router (berakun, tanpa *port forwarding*), tetapi berbahaya di VPS, karena kartu pos 1883 akan terbuka ke seluruh internet tanpa ufw bisa menahannya. Di VPS, `.env` mengisi `ALAMAT_WEB=0.0.0.0` (pintu web 80 dan 443, serta broker TLS 8883) dan membiarkan `ALAMAT_MQTT=127.0.0.1`; backend tetap memanggil broker lewat lorong, `mosquitto:1883`, tanpa lewat loket. **Jangan pernah mengisi `ALAMAT_MQTT=0.0.0.0` di VPS.** Sebaliknya, laptop Kit B justru perlu baris itu supaya jembatan Pi tetap masuk dari WiFi rumah ([1.4](#14--kit-b-alamat_mqtt-di-env-laptop-supaya-jembatan-pi-tetap-tersambung-3-menit)). Satu lagi: `0.0.0.0` hanya membuka IPv4 (dokumentasi Docker; tidak diuji penulis), jadi di DNS cukup *record* A, jangan AAAA ([6.3](#63--jalur-utama-record-a-iot-dan-mqtt-ke-ip-vps-dns-only-tanpa-aaaa-5-menit)).

Seluruh loket proyek di VPS:

| Layanan | Loket | Siapa bisa mengetuk | Jalan masuk |
| :-- | :-- | :-- | :-- |
| `web` (Caddy) | `0.0.0.0`: 80, 443 (TCP dan UDP) | seluruh internet | tamu dan Let's Encrypt, langsung |
| `mosquitto`, TLS | `0.0.0.0:8883` | seluruh internet | jembatan Pi, perangkat di lokasi lain |
| `mosquitto`, polos | `127.0.0.1:1883` | VPS sendiri | backend lewat lorong |
| `backend` | `127.0.0.1:8080` | VPS sendiri | tamu lewat Caddy `/api` |
| `grafana` | `127.0.0.1:3000` | VPS sendiri | tamu lewat Caddy `/grafana/` |
| `db` | `127.0.0.1:5432` | VPS sendiri | tidak ada untuk tamu |
| `sshd` (program VPS, bukan kontainer) | 22 | seluruh internet (diizinkan ufw) | kamu, dengan kunci SSH |

Loket `127.0.0.1` tetap bisa kamu buka dari laptop, lewat terowongan SSH `ssh -L` (misalnya Swagger di 8080 atau DBeaver ke 5432; [🧩 Tingkat 2](#tingkat-2--pintu-admin-lewat-terowongan-ssh-swagger-dan-dbeaver-dari-laptop-isi-bagian-rumpang-25-menit)).

Lalu, untuk apa ufw? Ia tetap menjaga program yang berjalan langsung di VPS, terutama `sshd`, dan menolak sambungan ke program lain di VPS yang tidak kamu izinkan. Baris 80, 443, dan 8883 di ufw ([5.5](#55--ufw-izinkan-22-dulu-lalu-80-443-dan-8883-8-menit)) adalah catatan niat; yang benar-benar membuka atau menutup pintu kontainer adalah alamat di baris `ports:` (tabel di atas). Buktinya diambil dari luar di [8.3](#83--t2a-tanpa-tls-ditolak-di-8883-dan-1883-tak-terjangkau-dari-luar-10-menit): sambungan tanpa TLS ke 8883 ditolak, dan 1883 tak terjangkau. Di internet tiruan lab penulis, dengan baris `ports:` apa adanya, 1883 polos memang tidak terjangkau dari luar, tetapi terjangkau dari dalam mesin "VPS" itu sendiri. ufw dan VPS sungguhan tidak diuji penulis; urutannya mengikuti dokumentasi Ubuntu dan Docker.

![Diagram tembok api yang bocor, ufw dan Docker (Konsep 4): di VPS, paket ke loket kontainer dibelokkan Docker SEBELUM aturan ufw dibaca. Atas, jalan paket dari internet: paket ke :22 untuk program di mesin melewati ufw (22/tcp ALLOW: masuk; yang tidak diizinkan ditolak) lalu sampai ke sshd, program di mesin VPS, bukan kontainer. Paket ke :443 dan :1883 untuk loket Docker masuk ke NAT Docker, yang membelokkan paket yang cocok dengan baris ports: SEBELUM ufw membacanya; ufw tidak pernah ditanya untuk paket yang dibelokkan. :443 masuk ke web (Caddy) di loket 0.0.0.0:443. :1883 tidak cocok dengan baris mana pun (loket mosquitto hanya 127.0.0.1:1883): tidak dibelokkan, tidak sampai, dan di IP publik tidak ada yang menjawab. Yang menentukan siapa boleh mengetuk adalah alamat di ports:. Tengah: 0.0.0.0, semua antarmuka IPv4, siapa pun di internet bisa mengetuk, dipakai web 80/443 dan mosquitto 8883 (ALAMAT_WEB), cukup record A, jangan AAAA; 127.0.0.1, hanya mesin VPS, dari internet tidak terjangkau (lab tiruan: 1883 polos tidak terjangkau dari luar, terjangkau dari VPS), dari laptop lewat ssh -L 5432:127.0.0.1:5432. Tabel loket proyek di VPS (baris ports: ringkas): web 80, 443, 443/udp di 0.0.0.0, terbuka, untuk Let's Encrypt dan tamu; mosquitto 8883 di 0.0.0.0, terbuka, MQTT TLS untuk jembatan Pi dan perangkat di luar; mosquitto 1883 (ALAMAT_MQTT) di 127.0.0.1, tertutup, backend lewat lorong mosquitto:1883; backend 127.0.0.1:8080, grafana 127.0.0.1:3000, db 127.0.0.1:5432, uptime-kuma 127.0.0.1:3001 tertutup, tamu lewat Caddy /api dan /grafana/, kamu lewat ssh -L; sshd port 22, program mesin, terbuka bila ufw mengizinkan, kunci SSH ed25519, login sandi mati. Bawah kiri, ufw di VPS, urutan penting: sudo ufw allow 22/tcp lebih dulu, lalu allow 80/tcp, 443/tcp, 443/udp, 8883/tcp, sudo ufw enable, sudo ufw status verbose. Bawah kanan: 22/tcp lebih dulu supaya ufw enable tidak mengunci SSH-mu; ufw menjaga program di mesin, baris 80, 443, 8883 hanya catatan niat; ufw deny 1883 atau 5432 TIDAK menutup loket Docker; uji dari luar lewat data seluler, MQTTX ke mqtt.namaanda.my.id:1883 harus gagal. Jujur: ufw dan VPS sungguhan tidak diuji penulis; urutan dari dokumen Ubuntu dan Docker.](aset/tembok-api-docker.png)

> ⬆️ **Sudah membaca Konsep 2–4?** Lanjut ke [Praktik 5](#praktik-5--jalur-utama-sewa-vps-dan-amankan-pintunya-60-menit) (jalur utama: sewa VPS), lalu kerjakan [6.3](#63--jalur-utama-record-a-iot-dan-mqtt-ke-ip-vps-dns-only-tanpa-aaaa-5-menit) dan [6.4](#64--nslookup-buku-telepon-internet-sudah-mengenal-namamu-5-menit) begitu IP VPS-mu ada. Jalur gratis tidak menyewa VPS: lanjut ke [Konsep 10](#10-jalur-gratis-cloudflare-tunnel) dan [Praktik 11](#praktik-11--jalur-gratis-semua-di-pi-dan-cloudflare-tunnel-85-menit).

### 5. Domain dan DNS: buku telepon internet

Di [Modul 10](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#1-jaringan-rumah-router-alamat-ip-dan-alamat-mac), **DNS** adalah **buku telepon**: manusia mengingat nama, perangkat butuh nomor IP. Di [🔁 Langkah 3](#langkah-3--buku-telepon-internet-nslookup-record-a-cname-dan-ttl) kamu sudah membukanya dengan `nslookup`. Minggu ini kamu menyewa satu nama di buku itu dan menulis baris-barisnya sendiri. Tanpa nama, Let's Encrypt tidak mau memberi kartu identitas yang dikenali semua HP (Konsep 6), dan Cloudflare Tunnel tidak punya alamat untuk diumumkan (Konsep 10). Jadi, domain dibutuhkan **kedua jalur**.

**Empat pemeran.**

| Pemeran | Di buku telepon | Di modul ini |
| :-- | :-- | :-- |
| **domain** | nama yang kamu sewa per tahun | `namaanda.my.id` |
| **registrar** | toko tempat menyewa nama | registrar terakreditasi PANDI, pengelola `.id` ([6.1](#61-beli-domain-myid-di-registrar-terakreditasi-pandi-7-menit)) |
| ***nameserver*** | kantor yang menjawab semua pertanyaan tentang namamu | dua *nameserver* Cloudflare, ditulis di panel registrar ([6.2](#62-cloudflare-paket-gratis-ganti-nameserver-lalu-tunggu-aktif-8-menit)) |
| ***record*** | satu baris "nama → jawaban" | `iot` dan `mqtt` → IP VPS-mu ([6.3](#63--jalur-utama-record-a-iot-dan-mqtt-ke-ip-vps-dns-only-tanpa-aaaa-5-menit)) |

Menurut Kebijakan Pendaftaran PANDI v9.0 (30 Sep 2024; mungkin sudah diperbarui), `.my.id` diperuntukkan bagi perorangan, organisasi, atau entitas lain; registrar meminta email yang terverifikasi, dan registri boleh meminta dokumen identitas seperti KTP. Nama `iot.` dan `mqtt.` di bawahnya tidak dibeli lagi: kamu menulisnya sendiri sebagai *record*.

**Milikmu sendiri, juga bagi Let's Encrypt.** `.my.id` tercantum di *Public Suffix List* (daftar akhiran publik), jadi `namaanda.my.id` dihitung sebagai domain milikmu sendiri, bukan bagian dari satu domain besar `my.id`. Batas "50 sertifikat baru per domain per 7 hari" (Konsep 6) dihitung untuk namamu, bukan dibagi dengan semua pemakai `.my.id`.

**Jenis *record* yang perlu kamu kenal.**

- **A** = nama → alamat IPv4, misalnya `iot` → `203.0.113.10` (ganti dengan IP VPS-mu). Jalur utama hanya butuh dua baris A: `iot` dan `mqtt`.
- **AAAA** = nama → alamat IPv6. **Jangan dibuat.** Loket `0.0.0.0` di VPS hanya membuka IPv4 (Konsep 4), jadi tamu yang menuruti baris AAAA tidak sampai (dokumen Docker; tidak diuji penulis).
- **CNAME** = nama → nama lain, seperti `www.github.com canonical name = github.com.` di pemanasan. Jalur gratis memakainya untuk rute terowongan (di bawah).
- **TTL** = berapa detik jawaban boleh diingat penanya (pemanasan: `ttl = 300`, lima menit). Selama menyiapkan, pilih TTL kecil: kalau kamu salah ketik IP lalu membetulkannya, HP yang sudah sempat bertanya tetap memakai jawaban lama sampai TTL-nya habis.

**Jalan sebuah pertanyaan.** Saat temanmu mengetik `https://iot.namaanda.my.id`, HP-nya bertanya ke **penanya DNS** (*resolver*) milik penyedia internetnya atau ke `1.1.1.1`. Penanya mencari tahu *nameserver* mana yang memegang namamu (dari catatan registri `.id`), lalu bertanya ke *nameserver* Cloudflare, yang menjawab `203.0.113.10`. Sesudah itu HP menyambung **langsung** ke VPS-mu di port 443. Buku telepon hanya memberi nomor, tidak ikut mengantar surat. Di [6.4](#64--nslookup-buku-telepon-internet-sudah-mengenal-namamu-5-menit), `nslookup iot.namaanda.my.id 1.1.1.1` menanyakan hal yang sama dan harus menjawab `Address: 203.0.113.10`.

**Awan abu-abu lawan awan oranye.** Setiap *record* A di Cloudflare punya sakelar status *proxy* berbentuk awan:

| | **Awan abu-abu** (*DNS only*) | **Awan oranye** (*proxied*) |
| :-- | :-- | :-- |
| Jawaban DNS | IP VPS-mu yang asli | alamat Cloudflare |
| Tamu menyambung ke | VPS-mu, langsung | Cloudflare, yang meneruskan ke VPS |
| Port yang sampai | semua yang dibuka VPS: 80, 443, 8883 | hanya port web: HTTP 80, 8080, 8880, 2052, 2082, 2086, 2095 dan HTTPS 443, 2053, 2083, 2087, 2096, 8443 |
| Di modul ini | `mqtt.` (wajib) dan `iot.` (jalur utama) | rute terowongan `iot.` (jalur gratis) |

**8883 tidak ada di daftar awan oranye.** Port lain butuh layanan Spectrum, yang untuk semua port TCP hanya ada di paket Enterprise. `mqtt.` berawan oranye berarti jembatan Pi mengetuk pintu Cloudflare yang tidak pernah membuka 8883, dan MQTT tidak sampai. Itulah maksud Silabus "*record* DNS `mqtt.` harus DNS only". Contoh nyata di pemanasan: `api.open-meteo.com` menjawab IP server Open-Meteo sendiri (abu-abu), sedangkan `open-meteo.com` menjawab `104.21.40.60`, alamat Cloudflare (oranye).

Di jalur utama, `iot.` juga abu-abu, supaya hanya satu penjaga yang mengurus kartu identitas: Caddy di VPS-mu (Konsep 6–7). Susunan `iot.` berawan oranye di depan VPS tidak dibahas dan tidak diuji modul ini. Akibat awan abu-abu: IP VPS terlihat oleh siapa saja yang bertanya. Itu wajar, karena alamat VPS memang publik; yang menjaganya adalah tembok api dan loket `127.0.0.1` ([Konsep 4](#4-tembok-api-yang-bocor-ufw-dan-docker)).

**Jalur gratis: tanpa *record* A.** Router rumah tidak membuka pintu apa pun (Konsep 1), jadi tidak ada baris "nama → IP rumah". Di [11.7](#117--cloudflare-tunnel-token-di-env-rute-ke-httpweb80-dan-profil-terowongan-12-menit), kamu membuat rute terowongan untuk `iot.namaanda.my.id`; rute itu memakai baris CNAME berawan oranye yang menunjuk ke nama terowonganmu (`<id-terowongan>.cfargotunnel.com`). Periksa sendiri di daftar DNS bahwa baris itu ada; penulis tidak bisa memastikan dasbor selalu membuatnya. Baris `mqtt.` tidak dibuat, karena broker jalur gratis hanya ada di rumah (Konsep 10).

**Jujur soal lab.** Penulis tidak membeli domain dan tidak punya akun Cloudflare: langkah Praktik 6 diambil dari dokumen resmi, dan DNS di lab penulis tiruan di Docker. Lama menunggu *nameserver* aktif tidak diketahui penulis. Dukungan Cloudflare paket gratis untuk `.my.id` juga belum diperiksa penulis. Kalau ditolak, jalur utama tetap bisa menulis *record* A yang sama di panel registrar, sedangkan jalur gratis butuh domain lain.

![Diagram domain dan DNS, buku telepon internet (Konsep 5): namaanda.my.id disewa di registrar, isinya dicatat di Cloudflare. Atas: 1 registrar (toko domain) terakreditasi PANDI (pengelola .id): sewa namaanda.my.id, dibayar per tahun, .my.id boleh untuk perorangan, email terverifikasi, KTP bila diminta; isian nameserver diganti dua nama dari Cloudflare. 2 Cloudflare paket gratis: tambah situs, nameserver ditempel di registrar, status Active (lama menunggunya tidak pasti); sejak itu catatan ditulis di Cloudflare. 3 catatan DNS jalur utama: A iot 203.0.113.10 DNS only dan A mqtt 203.0.113.10 DNS only (IP VPS-mu, contoh), TTL kecil 300 s saat menyiapkan, tanpa AAAA. Tengah, HP bertanya di mana iot.namaanda.my.id: HP ke resolver (DNS penyedia internet atau 1.1.1.1), ke registri .id (nama ini dicatat di nameserver Cloudflare), ke nameserver Cloudflare yang menjawab A 203.0.113.10, TTL 300; lalu HP menyambung langsung ke 203.0.113.10:443; resolver menyimpan jawaban selama TTL; cek dengan nslookup iot.namaanda.my.id 1.1.1.1. Lab penulis: DNS tiruan di Docker, bukan Cloudflare. Bawah kiri, DNS only, awan abu-abu: jawaban IP VPS asli, tamu langsung ke VPS, 443 ke Caddy, 8883 ke Mosquitto, sertifikat Let's Encrypt milik Caddy; wajib untuk mqtt., di jalur utama iot. juga. Bawah kanan, proxied, awan oranye: jawaban IP Cloudflare; Cloudflare hanya meneruskan port web, HTTP 80, 8080, 8880, 2052, 2082, 2086, 2095 dan HTTPS 443, 2053, 2083, 2087, 2096, 8443; 8883 tidak ada, MQTT tidak sampai; port lain hanya Spectrum, paket Enterprise; contoh nyata open-meteo.com dijawab 104.21.40.60. Paling bawah kiri, jalur gratis, catatan untuk terowongan: iot CNAME id-terowongan.cfargotunnel.com, proxied (dasbor: Networking, Tunnels, Create Tunnel; Routes, Add route, Published application, Service URL http://web:80); periksa di daftar DNS bahwa CNAME ini ada; tanpa record mqtt karena broker hanya di rumah. Kanan: .my.id ada di Public Suffix List, jadi batas Let's Encrypt 50 sertifikat baru per minggu milik domainmu sendiri. Jujur: langkah registrar dan Cloudflare dari dokumen, penulis tidak punya akunnya; dukungan zona .my.id di Cloudflare gratis belum dicek, bila ditolak jalur utama memakai DNS registrar dan jalur gratis butuh domain lain.](aset/buku-telepon-dns.png)

> ⬆️ **Sudah membaca Konsep 5?** Beli domainmu di [6.1](#61-beli-domain-myid-di-registrar-terakreditasi-pandi-7-menit) dan ganti *nameserver*-nya di [6.2](#62-cloudflare-paket-gratis-ganti-nameserver-lalu-tunggu-aktif-8-menit) sekarang. *Record* A di [6.3](#63--jalur-utama-record-a-iot-dan-mqtt-ke-ip-vps-dns-only-tanpa-aaaa-5-menit) menunggu IP VPS dari [5.1](#51-pilih-dan-sewa-vps-2-gb-lalu-tempel-kunci-publik-ed25519-8-menit); sementara itu kerjakan [Praktik 1](#praktik-1--meja-kerja-cabang-sidik-jari-dan-cadangan-15-menit).

### 6. Sertifikat dibahas tuntas: rantai, nama, dan tanggal

[Modul 04](../../fase-0-fondasi/modul-04-javascript-nodejs/README.md#13-http-surat-menyurat-antarprogram) menjanjikan `https://` dibahas di modul ini, dan [Konsep 8 Modul 10](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#8-https-dan-setinsecure-amplop-tersegel-yang-kurirnya-tidak-diperiksa) memberi HTTPS dua pelindung: **amplop tersegel** (enkripsi) dan **kartu identitas kurir** (sertifikat) yang ditandatangani **lembaga tepercaya**. Sejak itu `setInsecure()` memakai amplopnya tanpa memeriksa kartunya, "sementara, sampai Modul 27". Inilah pemeriksaan lengkapnya (pratinjaunya di [🔬 Modul 10](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#-bedah-teknis-opsional) lipatan *Apa yang sebenarnya diperiksa sertifikat HTTPS*).

**Tiga pemeriksaan, setiap kali tersambung.** Browser, HP, `mosquitto_sub`, dan jembatan Pi memeriksa tiga hal yang sama (paket esp32 bawaan melewatkan tanggal, [🔬](#-bedah-teknis-opsional)):

1. **Rantai.** Kartu milikmu (**daun**, untuk `iot.namaanda.my.id`) ditandatangani **penerbit antara**, semacam kantor cabang. Kartu kantor cabang ditandatangani **akar**, lembaga tepercaya yang namanya sudah tertanam di HP, laptop, dan Pi. Klien menelusuri tanda tangan itu sampai bertemu akar yang ia kenal. Gagal: browser menampilkan `Koneksi Anda tidak pribadi`, mqtt.js (mesin MQTTX) menulis `unable to get local issuer certificate` (prototipe riset).
2. **Nama.** Nama yang diketik harus tertulis di sertifikat (bagian *Subject Alternative Name*, SAN). Kartu `mqtt.namaanda.my.id` tidak berlaku untuk `iot.`, dan **tidak berlaku untuk alamat IP**: `mosquitto_sub` ke `203.0.113.10` ditolak (dengan `-d`: `certificate verify failed`, prototipe riset). Karena itu jembatan dan perangkat selalu memanggil nama.
3. **Tanggal.** Hari ini harus di antara "berlaku mulai" dan "berlaku sampai", jadi jam klien harus benar. Gagal: `certificate has expired` (lab penulis, Konsep 8).

**Rantai Let's Encrypt per Oktober 2026 ("Generation Y").** Let's Encrypt menandatangani dua jenis kunci, dengan rantai yang berbeda:

```text
ECDSA:  daun ← YE1 atau YE2 ← Root YE ← ISRG Root X2 ← ISRG Root X1
RSA:    daun ← YR1 atau YR2 ← Root YR ← ISRG Root X1
```

Root YE dan Root YR adalah akar baru yang belum dikenal kebanyakan perangkat, jadi disambung ke akar lama lewat tanda tangan silang. Klien berhenti di akar pertama yang ia kenal. HP dan browser kini mengenal ISRG Root X1 dan X2, sehingga rantai ECDSA berhenti di **X2**, rantai RSA di **X1**. Kamu sudah melihatnya sendiri di [🔁 Langkah 4](#langkah-4--kartu-identitas-sebuah-situs-rantai-nama-dan-tanggal): dua server `api.open-meteo.com`, dua rantai, satu berujung X1 dan satu X2. Jadi bunyi yang benar: akarnya **X1 (RSA) atau X2 (ECDSA)**. Caddy membuat kunci ECDSA (P-256) bila tidak diminta lain, dan daun di lab penulis memang ECDSA. Klien yang hanya menanam X1, seperti jembatan Pi (berkas `ca-cert-ISRG_Root_X1.pem` yang sudah ada di image Mosquitto) dan ESP32, tetap sampai ke X1: menurut dokumen Let's Encrypt, rantai ECDSA yang dikirim server juga membawa kartu X2 yang ditandatangani X1. Rantai sungguhan ini di jembatan Pi belum diuji penulis (lab memakai akar tiruan).

**Kapan akarnya berganti?** X1 dipercaya program akar perangkat sampai sekitar 2030 (perkiraan), berkas sertifikatnya sendiri berlaku sampai 4 Jun 2035, dan Let's Encrypt belum mengumumkan kapan berhenti menyambungkan rantainya ke X1. Kalau saat itu tiba, Pi cukup menarik image Mosquitto baru, sedangkan ESP32 yang menanam akar butuh firmware baru (lewat OTA, Modul 28). Jangan memasang `preferred_chains smallest` di Caddyfile (🔬): rantai terpendek bisa berhenti di akar baru yang belum dikenal klien ber-X1.

**Umurnya makin pendek.** Sertifikat Let's Encrypt berlaku **90 hari** sampai 9 Feb 2027, **64 hari** mulai 10 Feb 2027, dan **45 hari** mulai 16 Feb 2028 (pengumuman Let's Encrypt, dibaca 29 Okt 2026). Caddy menanyakan jadwal perpanjangan ke penerbitnya (log `got renewal info`) lalu memperbarui sendiri; untuk Let's Encrypt kira-kira saat sepertiga umurnya tersisa, sekitar hari ke-60 dari 90. Yang **tidak** ikut otomatis adalah salinan untuk broker (Konsep 8). Let's Encrypt juga berhenti mengirim surel peringatan kedaluwarsa sejak 4 Jun 2025 (OCSP, layanan cek pencabutan kartu, juga berhenti 6 Agu 2025), jadi tidak ada yang mengingatkanmu; pemantau sertifikat menyusul di Modul 30.

**ACME: cara Caddy meminta kartu.** Let's Encrypt tidak mengenalmu, jadi Caddy harus membuktikan bahwa ia menguasai nama itu. Caranya disebut **ACME**, dan berjalan otomatis:

1. Caddy mendaftar akun. Caddyfile kita tanpa opsi `email`, jadi penerbitnya hanya Let's Encrypt (cadangan ZeroSSL butuh email, 🔬). Akun tanpa email lolos di CA tiruan lab penulis; Let's Encrypt belum dicoba.
2. Caddy meminta dua kartu bersamaan: `iot.` dan `mqtt.`.
3. Let's Encrypt mengetuk namamu dari internet lewat port **80** (tantangan HTTP-01) atau **443** (TLS-ALPN-01). Di lab penulis, Caddy kadang memakai yang pertama, kadang yang kedua, jadi kedua pintu harus terbuka (Konsep 7) dan *record* A sudah menunjuk VPS (Konsep 5). Cara ketiga, DNS-01, tanpa pintu terbuka sama sekali, ada di 🔬.
4. Lolos: log `certificate obtained successfully`. Di lab penulis itu terjadi beberapa detik sesudah Caddy menyala, dengan CA tiruan; waktu Let's Encrypt sungguhan belum diukur penulis.

**Batas laju: jangan hapus lemari Caddy.** Dokumen *Rate Limits* Let's Encrypt (dibaca 29 Okt 2026): 50 sertifikat baru per domain per 7 hari; **5 sertifikat untuk set nama yang persis sama per 7 hari, tak bisa ditawar**; 5 kali gagal pembuktian per nama per akun per jam. Gagal terus-menerus membuat penerbitan untuk nama itu **dijeda**, bukan akunmu diblokir. Batas kedua itulah jebakannya. Lemari Caddy `data-caddy` menyimpan akun ACME, sertifikat, dan kuncinya; `docker compose down -v` menghapusnya, Caddy meminta ulang, dan lima kali dalam seminggu sudah habis. Saat mencoba ulang sesudah gagal, Caddy otomatis memakai **CA latihan** Let's Encrypt (dokumen menyebutnya *staging*, bukan lingkungan *staging* Modul 29) supaya jatah sungguhan tidak terbuang; langkah latihan terpisah tidak perlu.

![Diagram sertifikat: rantai, nama, tanggal (Konsep 6), rantai Let's Encrypt Generation Y per Oktober 2026. Kiri, rantai, panah berarti ditandatangani oleh, dibaca dari bawah ke atas. Puncak: ISRG Root X1, akar lama RSA 4096, dipercaya hampir semua HP, laptop, dan Pi. Kolom ECDSA (kunci bawaan Caddy), dari bawah: daun iot.namaanda.my.id (juga mqtt.namaanda.my.id) milikmu, YE1 atau YE2 (sertifikat antara), Root YE (akar baru yang belum dipercaya HP, versi bertanda tangan X2), ISRG Root X2 (akar ECDSA; versinya yang bertanda tangan X1 ikut dikirim untuk klien lama), lalu X1. Kolom RSA pembanding: daun RSA bila Caddy diminta RSA (Bedah Teknis), YR1 atau YR2, Root YR bertanda tangan X1, lalu X1. Rantai berhenti: HP, laptop, browser punya X1 dan X2, ECDSA berhenti di X2, RSA di X1; jembatan Pi memakai bridge_cafile ca-cert-ISRG_Root_X1.pem yang sudah ada di image Mosquitto, lewat X2 bertanda tangan X1 sampai X1 (dokumen; belum diuji); ESP32 opsional menanam X1 + X2 atau bundel CA. Kanan, tiga pemeriksaan klien setiap tersambung: 1 rantai sampai akar yang sudah ada di klien, gagal di lab tiruan: unable to get local issuer certificate; 2 nama yang diketik tertulis di sertifikat, mqtt.namaanda.my.id, bukan IP, gagal: Hostname/IP does not match certificate's altnames; 3 tanggal, hari ini di antara berlaku mulai dan berlaku sampai, jam klien harus benar, gagal: certificate has expired. Browser: lolos semua = gembok, gagal = Koneksi Anda tidak pribadi (Kemenangan Cepat). Tengah, umur sertifikat Let's Encrypt makin pendek, Caddy memperbarui sendiri kira-kira saat sepertiga umur tersisa: hari ini 90 hari, sekitar hari 60; mulai 10 Feb 2027 64 hari, sekitar hari 43; mulai 16 Feb 2028 45 hari, sekitar hari 30. Tidak ada lagi surel peringatan (pemantau di Modul 30); umur lebih pendek tidak mengganti akar. Bawah kiri, ACME: Caddy membuktikan nama lewat port 80 (HTTP-01) atau 443 (TLS-ALPN-01), DNS harus sudah menunjuk VPS; akun tanpa email; batas 5 sertifikat yang sama per 7 hari, jangan hapus lemari Caddy dengan down -v; lab tiruan: Pebble sekitar 6 s, bukan angka Let's Encrypt. Bawah kanan: X1 dipercaya program akar sampai sekitar 2030, berkasnya sampai 4 Jun 2035, pensiun belum diumumkan; akar berganti: Pi cukup menarik image baru, ESP32 butuh firmware baru (OTA, Modul 28).](aset/rantai-sertifikat.png)

Kemenangan Cepat memperlihatkan kebalikannya: kartu dari Caddy Local Authority di [KC Langkah 4](#langkah-4--kartu-identitasnya-diterbitkan-caddy-local-authority-rantainya-gagal-3-menit) lolos pemeriksaan nama dan tanggal, tetapi rantainya tidak sampai ke akar tepercaya mana pun.

### 7. Caddy sebagai pintu depan: HTTPS otomatis dan `TRUST_PROXY`

Sejak [Modul 26](../modul-26-docker-compose/README.md#7-lorong-dibedah-network-compose-loket-dan-pintu-depan), Caddy di layanan `web` adalah **pintu depan** (*reverse proxy*): satu alamat untuk halaman, API, dan Socket.IO. Minggu ini ia mendapat dua tugas baru: memasang HTTPS sendiri di VPS, dan memberi tahu backend siapa tamu yang sebenarnya. Tugas kedua, `TRUST_PROXY`, kamu baca lebih dulu, sebelum Praktik 2.

**`TRUST_PROXY`: siapa tamu yang sebenarnya?** Di balik Caddy, backend hanya melihat satu tamu: Caddy, dengan IP kontainer `web` di lorong (`172.19.0.x`) dan sambungan HTTP biasa. Dua janji tertunda karenanya:

1. *Cookie* `akses` dan `sesi` tidak pernah mendapat atribut `Secure`. Sejak [Modul 20](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#5-cookie-httponly-bukan-localstorage) backend memasangnya dengan `secure: "auto"`: `Secure` hanya bila permintaan datang lewat HTTPS, padahal yang HTTPS adalah sambungan tamu ke Caddy, bukan Caddy ke backend.
2. [Pembatas *login*](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#8-rate-limiting-jam-pasir-untuk-penebak-sandi) 10 percobaan per menit per IP melihat satu IP untuk semua tamu, jadi satu penebak sandi membuat semua penghuni ikut ditolak `429` ([Modul 26](../modul-26-docker-compose/README.md#7-lorong-dibedah-network-compose-loket-dan-pintu-depan)).

Caddy sebenarnya sudah menitipkan keterangan tamu di kepala permintaan: `X-Forwarded-For` (alamat tamu) dan `X-Forwarded-Proto` (`https`). Kepala seperti itu mudah dipalsukan, jadi Fastify, kerangka backend kita, mengabaikannya sampai diberi tahu siapa **penerus tepercaya**. Itulah `TRUST_PROXY` di backend 1.4.0 ([2.1](#21-tiga-perubahan-di-src-envts-dan-serverts-mqttts-serta-perintahts-8-menit)):

| Nilai | Artinya |
| :-- | :-- |
| kosong (bawaan backend) | tidak memercayai siapa pun (seperti 1.3); untuk `npm run dev` tanpa Caddy |
| `uniquelocal` | percaya penerus di alamat privat (10.x, 172.16–31.x, 192.168.x, fc00::/7), termasuk lorong Docker tempat Caddy; bawaan `compose.cloud.yml` |
| `true` | percaya siapa pun, juga tamu yang memalsukan kepala: hindari |
| angka (resep lama `trustProxy: 1`) | ditolak saat menyala: `angka (jumlah hop) tidak dipakai Fastify 5 (tidak dipercaya sama sekali); di balik Caddy tulis uniquelocal` |

`compose.cloud.yml` mengisinya untuk ketiga tempat lewat `TRUST_PROXY: ${TRUST_PROXY:-uniquelocal}`, jadi baris `TRUST_PROXY=` yang kosong di `.env` akar berarti `uniquelocal`, dan log backend menulis `penerus tepercaya (TRUST_PROXY): uniquelocal` ([2.4](#24--docker-compose-up--d---build-backend-penerus-tepercaya-dan-sesi-tetap-3-menit)). Memercayai Caddy aman karena Caddy **menimpa** `X-Forwarded-*` kiriman tamu dengan tulisannya sendiri. Di lab penulis (HTTPS tiruan, tiga tamu): tamu A salah sandi 11 kali → `401` sepuluh kali lalu `429`; tamu B dengan sandi benar → `200` dan *cookie* `Secure`; tamu C yang mengirim `X-Forwarded-For: 203.0.113.9` palsu tetap tercatat dengan alamat aslinya; tamu A dengan sandi benar pada menit yang sama tetap `429`. Kamu membuktikannya di VPS pada [7.8](#78--gembok-di-httpsiotnamaandamyid-308-login-dan-cookie-secure-6-menit) dan [7.9](#79--429-per-tamu-bukan-bersama-5-menit). Di `http://localhost` laptop, *cookie* tetap tanpa `Secure`, dan itu benar: halamannya memang HTTP. Membaca bagian ini sebelum Praktik 2? Cukup sampai di sini.

**HTTPS otomatis: satu Caddyfile untuk tiga tempat.** Baris alamat situs di `frontend/caddy/Caddyfile` kini:

```text
{$DOMAIN_WEB::80} {$DOMAIN_MQTT} {
```

`{$NAMA}` diisi dari variabel layanan `web`, asalnya `.env`. Laptop dan Pi jalur gratis mengosongkan `DOMAIN_WEB`, jadi alamat situsnya `:80`: HTTP biasa seperti Modul 26, lengkap dengan empat `warn` yang wajar. Di VPS, `DOMAIN_WEB=iot.namaanda.my.id` dan `DOMAIN_MQTT=mqtt.namaanda.my.id` membuat Caddy meminta kartu untuk kedua nama, melayani HTTPS di 443, mengalihkan `http://` ke `https://`, dan memperbarui kartunya sendiri. Janji [Modul 26](../modul-26-docker-compose/README.md#4-dapur-dan-meja-saji-multi-stage-image-kecil-dan-caddy) "`:80` cukup diganti nama domain" ditepati tanpa menyunting Caddyfile. Satu keanehan: Caddy memakai nilai pengganti `:80` hanya bila variabelnya **tidak ada**, bukan bila kosong, jadi `compose.cloud.yml` sendiri yang menulis `DOMAIN_WEB: ${DOMAIN_WEB:-:80}`.

Tiga syarat dari dokumen Caddy, dan tempat kamu memenuhinya: *record* A menunjuk VPS ([6.3](#63--jalur-utama-record-a-iot-dan-mqtt-ke-ip-vps-dns-only-tanpa-aaaa-5-menit)); port 80 dan 443 terbuka dari internet (ufw di [5.5](#55--ufw-izinkan-22-dulu-lalu-80-443-dan-8883-8-menit), `ALAMAT_WEB=0.0.0.0` di Konsep 4); dan lemari data Caddy awet, karena menurut dokumennya data itu "must not be treated as a cache" (lemari `data-caddy`, Konsep 6). Di lab penulis, `http://iot.namaanda.my.id` dijawab `HTTP/1.1 308 Permanent Redirect`, dan halamannya `HTTP/2 200` dengan `alt-svc: h3=":443"; ma=2592000`: Caddy juga menawarkan HTTP/3 lewat UDP, karena itu loket `443/udp` ikut dibuka. Caddy tidak menambahkan HSTS (🔬).

**Lima rute di balik satu pintu.**

| Tamu mengetuk | Caddy mengantar ke |
| :-- | :-- |
| nama `mqtt.namaanda.my.id` | `404` `Alamat ini untuk broker MQTT (port 8883), bukan dashboard.` |
| `/api/*`, juga Socket.IO | `backend:8080`, awalan `/api` dibuang, ditambah `X-Forwarded-*` |
| `/grafana/*` | `grafana:3000`, *cookie* diberi `Secure` |
| `/assets/*` | berkas hasil *build*; yang tidak ada dijawab `404` |
| selain itu | dashboard (`dist/`), alamat layar dijawab `index.html` dengan `no-cache` |

Socket.IO ikut lewat `wss://` di alamat yang sama, tanpa mengubah `soket.ts`. Tiga hal lagi:

- `CORS_ORIGIN` di VPS harus persis `https://iot.namaanda.my.id`, tanpa `/` di akhir. Asal lain membuat satpam backend menolak `POST` dengan `403`; garis miring di akhir kini membuat backend berhenti saat menyala dengan pesan `"…" bukan alamat halaman: …`.
- Layanan `web` sengaja tidak menunggu backend (kalau menunggu, Caddy, penyalin sertifikat, broker, dan backend saling menunggu selamanya), jadi beberapa detik pertama sesudah semuanya menyala, `/api` dijawab `502`. Wajar.
- Jalur gratis: tamu datang lewat `cloudflared`, yang menulis `X-Forwarded-*` sendiri (lab: tiruan); `PROKSI_TEPERCAYA=private_ranges` di `.env` Pi ([11.2](#112-env-akar-di-pi-kolom-pi-di-tabel-nilai-per-tempat-8-menit)) membuat Caddy memercayainya. Di VPS dan laptop barisnya kosong: Caddy tidak memercayai siapa pun ([Konsep 10](#10-jalur-gratis-cloudflare-tunnel)).

**Grafana lewat HTTPS: tautannya hidup.** [Modul 25](../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md#103-tautan-grafana-json-di-github-tangkapan-layar-dan-catatan-kapan-memakai-yang-mana-5-menit) berjanji Grafana "baru bisa dibuka dari internet lewat HTTPS di Modul 27". Kini ia tinggal di `https://iot.namaanda.my.id/grafana/`: satu nama, satu sertifikat, juga lewat Cloudflare Tunnel. `GRAFANA_ALAMAT` di `.env` memberi tahu Grafana alamat itu, jadi tautan di pesan *alert* Telegram ikut `https://`. Halaman *login* Grafana kini terbuka bagi siapa saja di internet, jadi pakai sandi admin yang kuat dan bagikan akun **Viewer** saja ([7.10](#710-grafana-di-grafana-admin-akun-viewer-dan-dashboard-dari-berkas-5-menit)). Di lab penulis, sesudah beberapa kali salah sandi, Grafana menolak bahkan sandi yang benar selama beberapa menit, tanpa memberi tahu bahwa akunnya dikunci.

![Diagram Caddy sebagai pintu depan (Konsep 7): satu frontend/caddy/Caddyfile, satu alamat untuk dashboard, API, Socket.IO, dan Grafana. Kiri, tamu (HP, browser, aplikasi): http://iot dijawab 308 ke https://iot (HTTP/2, gembok); https://mqtt salah alamat. Tengah, web = Caddy, caddy:2.11.7-alpine: HTTPS di 443 (TCP + UDP); sertifikat dan kunci di lemari data-caddy (jangan down -v); tanpa HSTS (Bedah Teknis); kompres zstd gzip, JavaScript sekitar 1 MB tiba sekitar 300 kB; alamat situs {$DOMAIN_WEB::80} {$DOMAIN_MQTT}. Kanan, lima rute: nama mqtt dijawab 404 dengan kalimat Alamat ini untuk broker MQTT (port 8883), bukan dashboard.; /api/* ke backend:8080, awalan /api dibuang, ditambah X-Forwarded-For (IP tamu) dan X-Forwarded-Proto: https, cookie Path=/auth menjadi /api/auth, Socket.IO ikut lewat wss; /grafana/* ke grafana:3000, awalan tetap, /grafana dialihkan ke /grafana/, cookie diberi Secure; /assets/* ke berkas di /srv/assets, yang tidak ada 404; lainnya ke /srv (isi dist/), alamat layar dijawab index.html, Cache-Control: no-cache juga untuk sw.js dan manifest. Tengah, satu Caddyfile tiga tempat (DOMAIN_WEB kosong di .env diisi :80 oleh compose.cloud.yml, karena Caddy hanya memakai nilai pengganti bila variabel tidak ada): laptop, :80, HTTP di http://localhost; VPS, DOMAIN_WEB=iot.namaanda.my.id, Caddy meminta sertifikat, HTTPS 443, memperbaruinya sendiri; Pi jalur gratis, :80, HTTPS dipasang Cloudflare, PROKSI_TEPERCAYA=private_ranges. Bawah, trustProxy, backend percaya keterangan Caddy tentang tamu (lab tiruan, tiga tamu). Tanpa trustProxy (backend 1.3): semua tamu terlihat sebagai IP Caddy (lab 172.19.0.4) dan http; cookie login tanpa Secure; tamu A salah sandi 11 kali membuat tamu B yang sandinya benar ikut 429; tamu C dengan X-Forwarded-For palsu ikut 429. Dengan TRUST_PROXY=uniquelocal (backend 1.4.0): IP asli tiap tamu dan https; cookie Secure; hanya tamu A 429, tamu B masuk 200; kepala palsu C ditimpa Caddy. Log backend: penerus tepercaya (TRUST_PROXY): uniquelocal; angka jumlah hop seperti TRUST_PROXY=1 ditolak; CORS_ORIGIN harus https://iot.namaanda.my.id persis, selain itu 403.](aset/caddy-pintu-depan.png)

> ⬆️ **Sudah membaca Konsep 6–7?** Lanjut ke [Praktik 7](#praktik-7--jalur-utama-pusat-di-vps-dengan-https-75-menit). Kalau kamu baru membaca bagian `TRUST_PROXY` di Konsep 7 sebelum [Praktik 2](#praktik-2--backend-140-trust_proxy-sesi-broker-tetap-dan-perintah-tangan-2-menit-20-menit), kembalilah ke Praktik 2; [Konsep 6](#6-sertifikat-dibahas-tuntas-rantai-nama-dan-tanggal) dan sisa Konsep 7 menunggu sampai sebelum Praktik 7.

### 8. TLS untuk MQTT: pintu 8883, salinan sertifikat, dan muat ulang

[Modul 11](../../fase-2-konektivitas/modul-11-mqtt-dan-kontrak-data/README.md#3-broker-di-laptop-mosquitto-dua-baris-konfigurasi-dan-firewall) menyimpan pintu 8883 untuk modul ini, dan [Konsep 10 Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#10-jujur-lalu-lintas-di-rumah-masih-polos) memperlihatkan nama pengguna dan kunci perangkat terbaca polos oleh penyadap. Di internet, pesan melewati jaringan milik banyak orang, jadi broker juga butuh **amplop tersegel**: **TLS di pintu 8883**, dengan alamat `mqtts://mqtt.namaanda.my.id:8883`. Seluruh sambungan terenkripsi, termasuk paket CONNECT yang membawa sandi.

**1883 polos tetap ada, tetapi tidak ke internet.** Kartu pos 1883 hanya beredar di tempat tertutup: di LAN rumah (Node 1 → Pi, firmware 1.6.0 tidak berubah) dan di dalam lorong VPS (backend → `mqtt://mosquitto:1883`). Janji [Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#26-akun-broker-backend-di-env-8-menit) "`mqtts://` mulai Modul 27" tidak perlu dipakai backend, karena sambungan itu tidak pernah keluar dari VPS. Loket 1883 VPS hanya `127.0.0.1` (Konsep 4); buktinya di [8.3](#83--t2a-tanpa-tls-ditolak-di-8883-dan-1883-tak-terjangkau-dari-luar-10-menit).

Broker VPS memakai `edge/pusat-internet.conf` (`KONF_PUSAT=pusat-internet.conf`): isinya sama dengan `pusat.conf`, ditambah empat baris:

```text
listener 8883
use_username_as_clientid true
certfile /mosquitto/sertifikat/broker.crt
keyfile /mosquitto/sertifikat/broker.key
```

Akun, sandi, dan daftar izin Modul 21 berlaku juga di sini; versi TLS terendahnya 1.2. **`use_username_as_clientid true` berlaku per pintu**, jadi ditulis lagi di bawah `listener 8883`. Tanpa baris itu, akun mana pun, misalnya akun uji `pemeriksa` di MQTTX, bisa masuk dari internet dengan nama klien `backend` atau `jembatan-pi`, menendang klien aslinya, dan menghapus antrean yang ditahan broker untuk backend (lab penulis, sebelum baris itu ada). Dengan baris itu, percobaan yang sama tercatat `as pemeriksa (p4, c1, k60, u'pemeriksa')` ([8.4](#84-nama-klien-lewat-8883-tidak-bisa-dipinjam-akun-lain-4-menit), [Konsep 8 Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#8-nama-klien-bisa-dipalsukan-use_username_as_clientid)).

**Sertifikatnya dari Caddy, tetapi tidak bisa dibaca langsung.** Caddy sudah meminta kartu `mqtt.namaanda.my.id` bersama `iot.` (Konsep 7). Mosquitto 2.x menyala sebagai root, lalu **turun hak** menjadi pengguna `mosquitto` (uid 1883) **sebelum** membaca sertifikat; ChangeLog Mosquitto 2.0.0 sudah memperingatkan pemakai Let's Encrypt. Padahal lemari Caddy hanya boleh dibaca root (folder `drwx------`, berkas `-rw-------`). Disuruh membaca berkas Caddy langsung, broker berhenti dengan `Error: Unable to load server certificate "…". Check certfile.` dan `Permission denied` (prototipe riset). Memasang lemari Caddy ke broker atau membuat *symlink* tidak menolong: berkasnya tetap milik root.

**Penyalin sertifikat: layanan sekali jalan `sertifikat-mqtt`.** Ia memakai image Mosquitto yang sama, berjalan sebagai root, membaca lemari Caddy **hanya-baca**, dan menjalankan [`skrip/salin-sertifikat.sh`](kode/skrip/salin-sertifikat.sh) (isinya dibaca di [8.1](#81--salinan-sertifikat-untuk-broker-sertifikat-mqtt-dan-pintu-8883-5-menit)): cari kartu `mqtt.` terbaru (saat VPS baru menyala, tunggu paling lama 5 menit), salin ke nama sementara di lemari `data-sertifikat`, `chown 1883:1883`, `chmod 644` untuk sertifikat (isinya memang dikirim ke setiap klien) dan `600` untuk kunci, lalu ganti nama dengan `mv` supaya broker tidak pernah membaca berkas yang separuh tersalin. Sesudah itu `Exited (0)`, dan barulah Compose menyalakan `mosquitto`. Di laptop dan Pi jalur gratis, `DOMAIN_MQTT` kosong: penyalin menulis `… dilewati`, dan broker tetap polos.

**Muat ulang, bukan *restart*.** Mosquitto tidak memantau berkasnya; salinan baru dipakai sesudah broker membacanya ulang.

| Cara | Akibat |
| :-- | :-- |
| `docker compose exec mosquitto kill -HUP 1` (**muat ulang**, HUP) | broker membaca ulang seluruh berkasnya tanpa dimatikan: `Reloading config.`, PID sama, jembatan tidak putus (lab penulis). Kunci yang salah pemilik hanya menghasilkan `Error when reloading certificate …`, sertifikat lama tetap dipakai (prototipe riset) |
| `docker compose restart mosquitto` (mati lalu menyala) | dengan kunci yang salah pemilik: jatuh bangun, `Restarting (1)` berulang (prototipe riset) |
| `docker compose kill -s SIGHUP mosquitto` | **jangan**: Docker mencatat broker dihentikan, jadi broker tidak dinyalakan lagi sesudah *crash* atau *reboot* (riset Modul 26) |

Dua batas penting. **HUP hanya untuk broker pusat di VPS**, sesudah sertifikat baru. Di Pi gerbang, sesudah mengubah berkas apa pun, selalu `docker compose restart mosquitto` atau `docker compose up -d --force-recreate mosquitto`: di lab penulis, HUP pada broker gerbang dua kali dari dua putaran membuang antrean "jendela buta" ([Konsep 9](#9-jembatan-simpan-teruskan-siapa-menahan-apa); 12 bacaan) saat internet kemudian putus, dan penyebabnya belum diketahui penulis. Lalu, sesudah mengubah `acl-broker` atau `*.conf` di VPS, tetap `restart` saat itu juga (aturan Modul 21) dan baca lognya: muat ulang mingguan membaca seluruh konfigurasi, jadi daftar izin yang salah ketik membuat broker berhenti Senin pagi.

**Perpanjangan: cron mingguan.** Caddy memperbarui kartunya sendiri (Konsep 6), dan pintu 443 langsung memakai yang baru; pintu 8883 tidak. Di lab penulis (CA tiruan berumur pendek), 443 sudah berganti nomor seri, sedangkan 8883 tetap yang lama sampai skrip dijalankan. Obatnya **cron**, jam weker di VPS yang menjalankan skrip menurut jadwal (penjadwal lengkap di Modul 30). Satu baris di [8.6](#86--perpanjangan-skripperbarui-sertifikat-mqttsh-dan-cron-mingguan-8-menit):

```text
17 3 * * 1 sh /home/rumah/rumah-pintar-mini/skrip/perbarui-sertifikat-mqtt.sh >> /home/rumah/perbarui-sertifikat.log 2>&1
```

Artinya: setiap Senin pukul 03.17 jam VPS (biasanya UTC, = 10.17 WIB), jalankan `sertifikat-mqtt` lagi, lalu muat ulang broker. Muat ulangnya dikerjakan **setiap minggu**, juga saat penyalin menulis `tidak berubah: dilewati`, karena `docker compose up -d` (misalnya sesudah `git pull`) ikut menyalin kartu baru tanpa memuat ulang broker (lab penulis). Dengan umur 90 hari, Caddy memperbarui kira-kira 30 hari sebelum habis, jadi jadwal mingguan masih longgar; di era 45 hari pun tersisa lebih dari seminggu (hitungan dari fakta Let's Encrypt, tidak diuji). Lupa cron? Jembatan yang sedang tersambung tetap jalan, karena kartu hanya diperiksa saat jabat tangan, tetapi setiap sambungan **baru** ditolak (`certificate has expired`, lab penulis), juga jembatan Pi yang putus sebentar: antreannya menahan data sampai skrip dijalankan.

**Cara klien memeriksa broker.** Panggil **nama**, bukan IP (Konsep 6). Jembatan Pi memeriksa akar dengan `bridge_cafile /etc/ssl/certs/ca-cert-ISRG_Root_X1.pem` ([9.2](#92-pi-edgejembatanpusatconf-menuju-mqttnamaandamyid8883-10-menit)). Klien polos yang mengetuk 8883 ditolak, dan log broker menulis `wrong version number` lalu `disconnected: Protocol error.`: itulah bukti T2a. `mosquitto_sub` 2.1 dengan `-p 8883` otomatis memakai TLS dan daftar akar sistem, jadi uji polos butuh `--no-tls`. `--insecure`, `bridge_insecure`, dan `setInsecure()` melemahkan pemeriksaan sertifikat: jangan pernah dipakai. TLS di sini **satu arah**: broker membuktikan diri dengan sertifikat, perangkat dengan akun dan kuncinya; sertifikat per perangkat (mTLS) tetap di [🔬 Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#-bedah-teknis-opsional).

**Kontrak data 1.5.** [`KONTRAK-DATA.md`](kode/KONTRAK-DATA.md) kini menulis alamat broker di internet: **nama domain** (bukan IP), port `8883`, **TLS 1.2 atau lebih baru**; perangkat memeriksa rantai sampai akar yang ia percaya (ISRG Root X1), nama, dan tanggal; tanpa pemeriksaan (misalnya `setInsecure()`) tidak sah; pintu polos 1883 broker internet tidak boleh terbuka ke luar. Akun, topik, dan bentuk pesan sama dengan di rumah. Perangkat di lokasi lain yang langsung TLS ke VPS, tanpa Pi dan tanpa antrean luring, dicoba dengan simulator di [13.2](#132-simulator-ke-mqttsmqttnamaandamyid8883-8-menit); versi ESP32-nya ada di [🔬](#-bedah-teknis-opsional), dan sketsa cuaca Modul 10 tanpa `setInsecure()` di 🧩 Tingkat 1.

![Diagram sertifikat ke Mosquitto: salin, izinkan, muat ulang (Konsep 8). Caddy meminta sertifikat untuk mqtt.namaanda.my.id, Mosquitto memakai salinannya di pintu 8883. Atas: Let's Encrypt ke web (Caddy, root); lemari data-caddy menyimpan /data/caddy/certificates/penerbit/mqtt.../ (.crt, .key, .json), folder drwx------ root, berkas -rw------- root: hanya root boleh membaca. Lalu sertifikat-mqtt, sekali jalan, root, menjalankan skrip/salin-sertifikat.sh, lemari Caddy hanya-baca: 1 cari .crt terbaru (tunggu sampai 5 menit); 2 isi sama, betulkan pemilik; 3 salin ke nama sementara .baru; 4 chown 1883:1883, chmod 644 dan 600; 5 ganti nama dengan mv; lalu Exited (0). Lalu lemari data-sertifikat: broker.crt -rw-r--r-- 1883, broker.key -rw------- 1883. Lalu mosquitto dengan pusat-internet.conf: menyala sebagai root, turun hak menjadi mosquitto (uid 1883), baru membaca certfile dan keyfile, pintu 8883 TLS. Garis merah: tanpa penyalin, Mosquitto membaca lemari Caddy langsung, Permission denied, broker berhenti. Folder penerbit Let's Encrypt acme-v02.api.letsencrypt.org-directory (lab tiruan pebble-14000-dir). Urutan: web meminta sertifikat, sertifikat-mqtt menunggu sampai 5 menit lalu menyalin, baru mosquitto menyala. Tengah, muat ulang broker VPS (di Pi gerbang: restart, bukan HUP; lab tiruan): benar, docker compose exec mosquitto kill -HUP 1, log Reloading config., PID sama, RestartCount 0, jembatan tidak putus; kunci salah pemilik: Error when reloading certificate, sertifikat lama tetap dipakai. Salah di VPS, docker compose restart mosquitto: kunci salah pemilik: jatuh-bangun, Restarting (1) 6 kali dalam 12 detik. Jangan docker compose kill -s SIGHUP mosquitto: Docker mencatatnya dihentikan, broker tidak dinyalakan lagi sesudah crash atau reboot. Bawah: sertifikat 90 hari, sekitar hari 60 Caddy memperbarui sendiri dan 443 langsung baru, cron tiap Senin 03.17 jam VPS membuat 8883 ikut baru. Satu baris cron, tanpa ganti baris: 17 3 * * 1 sh /home/rumah/rumah-pintar-mini/skrip/perbarui-sertifikat-mqtt.sh, keluaran ke perbarui-sertifikat.log; skrip menjalankan sertifikat-mqtt lalu exec -T mosquitto kill -HUP 1. Lab tiruan (Pebble, umur 600 s): 8883 seri lama sampai skrip, sesudahnya seri baru, PID sama. Lupa sampai habis: jembatan yang tersambung tetap jalan, sambungan baru ditolak certificate has expired. up -d menyalin tanpa memuat ulang, jadi HUP tetap tiap minggu.](aset/sertifikat-ke-mosquitto.png)

> ⬆️ **Sudah membaca Konsep 8?** Lanjut ke [Praktik 8](#praktik-8--jalur-utama-pintu-mqtt-8883-dengan-tls-35-menit): pintu 8883 di VPS memakai salinan sertifikat Caddy. [Praktik 9](#praktik-9--jalur-utama-jembatan-pi--vps-lewat-tls-35-menit) lalu menyambungkan jembatan Pi lewat pintu yang sama.

### 9. Jembatan simpan-teruskan: siapa menahan apa

[Silabus](../../SILABUS.md#2-gambaran-besar-apa-yang-akan-kita-bangun) menyebut gerbang Pi **kantor pos lokal**: "Kalau jalan ke pusat putus, surat ditahan, bukan dibuang." [Konsep 10 Modul 26](../modul-26-docker-compose/README.md#10-dua-berkas-sampai-akhir-pusat-dan-gerbang) mengakui janji itu belum ditepati: jembatan LAN belum menahan data, jadi bacaan yang terbit selama pusat mati hilang. Konsep ini inti modul: gerbang Pi belajar **simpan-teruskan** (*store-and-forward*), yaitu menahan pesan perangkat selama jembatan putus, lalu meneruskannya belakangan.

**Dua rak tunggu, dua tempat.** Di [Modul 14](../../fase-2-konektivitas/modul-14-node-2-esp-now/README.md#7-node-1-sebagai-jembatan-cap-waktu-rak-tunggu-dan-status-node-2), Node 1 menahan bacaan Node 2 di **rak tunggu** di RAM-nya (paling banyak 96 bacaan) selama router mati. Antrean Modul 27 tinggal di broker **gerbang** di Pi, untuk semua perangkat rumah, dan ditulis ke lemari `rumahpintar-gerbang_data-broker`, jadi hampir semuanya selamat walau Pi mati. Bukan di VPS: VPS tidak bisa menahan pesan yang belum sampai kepadanya.

**Siapa menahan apa.**

| Arah | Pesan | Selama jembatan putus |
| :-- | :-- | :-- |
| naik, Pi → pusat | `telemetry`, `status`, `vitals`, `ack` | **ditahan** di antrean Pi, lalu dikirim belakangan dengan `ts` aslinya |
| turun, pusat → Pi | `cmd` (lampu, kipas, pompa) | **tidak disimpan** broker mana pun; dashboard sudah melaporkannya gagal |
| turun | `config` *retained* (ambang pengaman lokal, Modul 19) | tiba lagi begitu jembatan tersambung, seperti semua pesan *retained* |

Semboyannya: **naik disimpan di Pi, turun tidak disimpan**. Kontrak data 1.5 menulisnya sebagai aturan 11 di [`KONTRAK-DATA.md`](kode/KONTRAK-DATA.md) (aturan 13 di [Lampiran A Silabus](../../SILABUS.md#14-lampiran-a--kontrak-data-rumah-pintar-mini)). Bentuk pesannya tidak berubah, jadi firmware tetap 1.6.0.

**Setelannya.** Di `edge/gerbang.conf`, berlaku untuk seluruh broker gerbang (dua baris pertama sudah ada sejak Modul 26):

```text
persistence true
persistence_location /mosquitto/data/
autosave_interval 30
queue_qos0_messages true
max_queued_messages 100000
upgrade_outgoing_qos true
```

Di `edge/jembatan/pusat.conf`, salinan `edge/jembatan.contoh.conf` yang berisi sandi dan tidak ikut Git (di Praktik 4 alamatnya masih `pusat:1883`):

```text
connection pusat
address mqtt.namaanda.my.id:8883
bridge_cafile /etc/ssl/certs/ca-cert-ISRG_Root_X1.pem
# …
cleansession true
local_cleansession false
notifications true
topic rpm/+/telemetry out 1
topic rpm/+/status out 1
topic rpm/+/vitals out 1
topic rpm/+/ack out 1
topic rpm/+/cmd in 1
```

Catatan `#` hanya boleh di **awal** baris; di belakang setelan, catatan ikut terbaca sebagai isinya.

**Kenapa bukan setelan Silabus apa adanya.** Silabus menulis jembatan dengan `topic # out 1` dan `cleansession false`, tanpa `upgrade_outgoing_qos` dan `autosave_interval`. Penulis memasangnya, lalu mencabut internet tiruan 10 menit. Dua hal tidak lolos: sebagian bacaan hilang di awal putus, dan perintah yang dilaporkan gagal tetap dikerjakan beberapa menit kemudian. Setelan di atas menutup keduanya.

**Jendela buta.** Internet yang putus tidak mengirim kabar: Pi dan VPS tidak langsung tahu. Jembatan baru dianggap mati sesudah *keepalive* 60 detik terlewat tanpa jawaban. Di lab penulis, broker VPS menyatakan jembatan putus 82–91 detik sesudah internet dicabut, dan gerbang baru sadar sekitar 110–120 detik. Selang itu disebut **jendela buta**: gerbang mengira jembatannya masih hidup dan terus mengirim ke sambungan yang sudah mati. Pesan QoS 1 aman, karena yang tidak dijawab dikirim ulang. Pesan QoS 0, cara Node 1 menerbitkan `telemetry` sejak Modul 11, lenyap begitu saja. `topic … out 1` tidak menolong: menurut kode Mosquitto, QoS yang keluar dari broker adalah yang lebih kecil dari QoS terbit dan QoS langganan, jadi pesan QoS 0 tetap QoS 0. `queue_qos0_messages true` (tanpanya QoS 0 dibuang) pun hanya menahan pesan **sesudah** gerbang sadar. Prototipe riset penulis (lab sebelum kode modul ini selesai), dengan setelan Silabus dan putus 10 menit, kehilangan 59 dari 302 pesan QoS 0 perangkat uji yang terbit tiap 2 detik, dan 12 dari 61 pesan pada irama Node 1 (tiap 10 detik); pesan QoS 1 utuh.

**Obatnya `upgrade_outgoing_qos true`.** Broker gerbang meneruskan pesan ke jembatan dengan QoS langganannya, yaitu 1, jadi pesan di jendela buta ikut menunggu jawaban pusat dan dikirim ulang. Setelan ini berlaku untuk semua pelanggan broker gerbang, dan itu tidak berbahaya bagi proyek ini. Pada kode akhir, uji T3 lab penulis (putus 10 menit 37 detik): 90 bacaan Node 1 terbit di gerbang, 90 tersimpan di VPS, termasuk yang terbit di jendela buta; 0 hilang, 0 dobel. Gambar di bawah membandingkan dua kali cabut 10 menit pada hari yang sama. Setelan Silabus berlubang 1 menit 20 detik (7 bacaan) di awal putus, lalu utuh karena gerbang sudah sadar; setelan Modul 27 utuh. Di putaran lain lubangnya 2 menit (11 bacaan); letaknya selalu di awal putus.

![Komposit tangkapan layar asli halaman Riwayat Latihan ruang tamu, rentang 1 jam, dashboard 1.3.0 di VPS tiruan, Chrome 156 di Linux, laptop 1280 piksel, diambil 01.20 WIB 30 Okt 2026 sesudah gerbang Pi tiruan dua kali dicabut dari internet tiruan 10 menit; simulator f00d00000001 menerbitkan QoS 0 tiap 10 detik. Atas: Bacaan mentah 1 jam terakhir (satu titik = satu kiriman) · 352 titik; grafik garis biru Suhu (°C), sumbu 24 sampai 36, jam 00.20 sampai 01.20, nilai bergerak acak 25 sampai 33. Dua pita merah muda tambahan penulis menandai jam putus: pita 1 (nomor 1) putus 1, setelan bunyi Silabus asli, 00.28.15 sampai 00.38.40 WIB; di awal pita itu garis terputus, kotak bernomor 2 menandai lubang 1 menit 20 detik, 00.28.07 sampai 00.29.27, jendela buta saat internet sudah putus tetapi gerbang belum sadar: 7 bacaan hilang; sisa pita 1 tetap bergaris. Pita 2 (nomor 3) putus 2, setelan Modul 27, 00.42.24 sampai 00.52.48 WIB: garis utuh tanpa celah; cek-susulan.sql 84 bacaan, celah_terbesar 00:00:10, tiba_susulan 60, kembar 0. Bawah kiri, potongan tabel terbaru dulu, kolom Waktu, Suhu, Kelembapan: 00.29.47, 00.29.37, 00.29.27 lalu langsung 00.28.07 (nomor 4, jam melompat), 00.27.57, 00.27.47. Bawah kanan, tabel yang sama untuk putus 2 (nomor 6 di samping judulnya: grafik dan tabel tidak menandai bacaan susulan, jumlahnya terbaca di tiba_susulan): 00.42.47, 00.42.37, 00.42.27, 00.42.17 (nomor 5, tetap tiap 10 detik melewati jam cabut), 00.42.07, 00.41.57. Legenda bernomor di bawah.](aset/susulan-tanpa-lubang.png)

**Naik disimpan, turun tidak disimpan.** `cleansession false` membuat broker **pusat** menyimpan sesi jembatan, termasuk pesan yang **turun** ke rumah. Dengan setelan itu, perintah lampu yang kamu tekan saat internet putus disimpan pusat, padahal dashboard sudah menulis *toast* gagal, lalu diantar ke Node 1 begitu jembatan pulih: 2 menit 17 detik kemudian di prototipe riset, 3 menit 27 detik dan 4 menit 26 detik kemudian di pembanding pada kode akhir. Lampu atau pompa yang tiba-tiba bergerak beberapa menit kemudian berbahaya; karena itu pula [Modul 11](../../fase-2-konektivitas/modul-11-mqtt-dan-kontrak-data/README.md#6-qos-surat-biasa-surat-tercatat-dan-kurir-bertanda-tangan) membuat "Node 1 sengaja tidak memakai sesi persisten". Modul 27 memisahkan dua sisi jembatan. `cleansession true` = sesi di pusat **bersih**: pusat tidak menyimpan `cmd` untuk jembatan yang putus. `local_cleansession false` = sesi di gerbang **tetap**: antrean naik tetap ditahan. Log broker pusat ikut berubah: jembatan masuk dengan `c1` (sesi bersih), bukan `c0` seperti di Modul 26.

Backend 1.4.0 menjaga dari sisinya ([2.1](#21-tiga-perubahan-di-src-envts-dan-serverts-mqttts-serta-perintahts-8-menit)). Perintah tangan yang belum dikerjakan perangkat lebih dari 2 menit dilupakan (`… tidak dikerjakan lebih dari 2 menit: tidak dikirim lagi`), sedangkan yang lebih baru dikirim lagi begitu perangkat terdengar, sesuai bunyi *toast*-nya. Jadi, kalau internet kembali kurang dari 2 menit sesudah kamu menekan tombol, lampu tetap menyala belakangan. Perilaku ini kamu coba di [4.5](#45--perintah-lampu-saat-putus-naik-disimpan-turun-tidak-disimpan-3-menit).

**Listrik rumah padam.** Internet dan Pi mati bersamaan. `persistence true` menulis antrean ke lemari hanya saat broker berhenti dengan rapi, atau setiap `autosave_interval`, yang bawaannya 1800 detik (30 menit). Prototipe riset mematikan broker gerbang secara paksa (tiruan listrik padam) ±1,5 menit sesudah simpanan terakhir. Dengan bawaan, semua yang diantre sesudah simpanan itu hilang, termasuk pesan QoS 1: 45, 9, dan 44 pesan dari tiga perangkat uji. Dengan `autosave_interval 30`: 4, 0, dan 4. Harganya satu kali tulis ke kartu dan satu baris log `Saving in-memory database …` setiap ±30 detik.

**Batas, kabar, dan topik.**

- `max_queued_messages` = batas antrean per klien, dan jembatan adalah satu klien. Bawaan 1000 cukup ±1,5 jam untuk dua perangkat berirama Node 1; 100000 cukup berhari-hari. Kedua batas itu belum diuji penulis.
- `notifications true` membuat jembatan menerbitkan **kabar jembatan** `$SYS/broker/connection/jembatan-pi/state` di broker pusat: `1` tersambung, `0` putus, saudara kabar 📴/✅ Modul 19. Daftar izin pusat butuh baris `topic write` untuk topik itu di blok `7) jembatan-pi`, karena `#` tidak mencakup topik berawalan `$`. Isi antrean gerbang terlihat di `$SYS/broker/store/messages/count` (akun `pemantau`, [4.3](#43--kabar-jembatan-state-1-dengan-akun-pemantau-3-menit)): naik selama putus, lalu turun lagi; ±60 di antaranya pesan *retained* yang selalu ada.
- Topiknya tetap sempit seperti Modul 26, bukan `#`: yang dikirim keluar hanya yang perlu (janji Modul 12), dan `cmd` turun lewat baris `in 1`-nya sendiri.

**Tanpa dobel: `ts` dan `ON CONFLICT`.** Susulan tiba dengan `ts` aslinya, yang dibuat perangkat (aturan 1 Lampiran A), jadi tercatat pada waktu kejadian, bukan waktu tiba ([Modul 17](../../fase-3-backend-data/modul-17-sql-dan-skema-database/README.md#10-dari-backend-pool-parameter-1-dan-kiriman-ganda)). Bila jembatan mengirim ulang pesan yang tanda terimanya hilang, kunci `(device_id, ts)` dengan `ON CONFLICT DO NOTHING` menyimpannya sekali, dan backend mencatat `kiriman ganda dilewati`. Karena kunci itu, kolom `kembar` di `skrip/cek-susulan.sql` selalu 0; bukti yang bermakna adalah enam bacaan per menit tanpa celah lebih dari 12 detik ([4.4](#44--putus-10-menit-di-lan-lalu-skripcek-susulansql-tanpa-celah-tanpa-dobel-11-menit), [10.5](#105--t3-skripcek-susulansql-di-vps-tanpa-celah-dan-tanpa-dobel-8-menit)). Bacaan yang sangat tua tetap masuk, juga ke [jilid yang sudah dipadatkan](../../fase-3-backend-data/modul-18-timescaledb/README.md#8-columnstore-memadatkan-jilid-lama), hanya sedikit lebih lambat.

**Susulan bukan keadaan sekarang.** Begitu jembatan pulih, puluhan bacaan tiba dalam beberapa detik (lab penulis: 64 bacaan dalam detik yang sama). Backend meneruskannya ke dashboard berurutan, dan kartu berakhir di bacaan terbaru. Aturan otomatis mengabaikan bacaan yang `ts`-nya lebih tua dari 60 detik: di lab penulis, delapan bacaan susulan bersuhu di atas 31 °C tidak menyalakan kipas.

**Sesi tetap backend.** Antrean yang sampai di pusat masih harus sampai ke backend. Dengan **sesi bersih** (backend 1.3.0), pesan yang tiba saat backend belum berlangganan, misalnya beberapa detik sesudah broker pusat dinyalakan lagi, hilang tanpa jejak (lab penulis: satu dari empat percobaan). Backend 1.4.0 memakai **sesi tetap**: nama kliennya selalu `backend`, dan broker pusat menahan pesan QoS 1 untuknya selama ia belum tersambung. Karena itu, setiap kali backend menyambung ulang, log broker pusat menulis `Client backend [<IP>:<port>] disconnected: session taken over.` lalu `… as backend (p4, c0, k60, u'backend').` Itu normal, bukan penyamar. Perbandingannya ada di [🔬](#-bedah-teknis-opsional) *Sesi bersih lawan sesi tetap*.

**Dua catatan untuk Pi.** Selama putus, setiap percobaan jembatan bisa menahan broker gerbang beberapa detik, sehingga pesan untuk pelanggan lokal di Pi terlambat (lab penulis: sampai hampir 6 detik; isu Mosquitto #3402). Penawarnya opsional di [9.6](#96-nama-vps-di-extra_hosts-gerbang-opsional-3-menit). Lalu, sesudah mengubah setelan gerbang, selalu `docker compose restart mosquitto` atau `docker compose up -d --force-recreate mosquitto`, **bukan** HUP (muat ulang, Konsep 8): di lab penulis, HUP di gerbang membuang antrean jendela buta.

**Dua celah yang diakui jujur.**

1. **`Online` padahal internet rumah putus.** Node 1 tetap tersambung ke gerbang di rumah, jadi wasiat `offline`-nya tidak pernah terbit. Dashboard di VPS tetap menulis `Online`, dan lencana **Live** tetap hijau karena HP-mu tersambung ke VPS. Tandanya di dashboard: ±30 detik sesudah bacaan terakhir, kartunya menulis `Online · terakhir dilihat N menit yang lalu · data basi` ([10.3](#103-selama-putus-online-yang-basi-tombol-lampu-dan-telegram-node-diam-12-menit)). Kabar `jembatan-pi/state 0` sebenarnya sudah ada di pusat; pita "Gerbang rumah terputus" yang membacanya adalah [🧩 Tingkat 3](#tingkat-3--pita-gerbang-rumah-terputus-kabar-jembatan-sampai-ke-dashboard-buat-dari-nol-6090-menit).
2. **Aturan server diam.** Selama putus, aturan kipas di server tidak menerima bacaan baru. Node 1 juga tidak masuk mode offline, karena mode itu hanya terjadi bila **broker Pi** tak terjangkau 2 menit ([Modul 19](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#10-pengaman-lokal-node-1-menjaga-rumah-saat-server-hilang)), jadi pengaman lokal kipas pun tidak menyala. Yang tetap jalan: siram dan lampu otomatis Node 1.

**WiFi rumah putus ≠ internet putus.** Antrean ada di Pi, jadi hanya menolong saat **jalan dari Pi ke pusat** putus. Bila **WiFi rumah** yang mati, seperti [uji cabut router Modul 10](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#g--uji-cabut-router-1-menit), Node 1 tidak bisa mencapai Pi, dan bacaannya selama itu tetap hilang, kecuali yang tercatat di kartu microSD Node 1 (Modul 7) dan rak tunggu Node 2. Karena itu [10.2](#102--cabut-internet-rumah-bukan-wifi-rumah-2-menit) mencabut internet, bukan mematikan WiFi.

Silabus v1.0.29 mencatat setelan jembatan ini, aturan 13 Lampiran A, dan batas pengaman lokal tadi di tabel §2.2. Gambar berikut memakai putaran lain dari uji kode akhir (putus 10 menit 24 detik: 84 terbit = 84 tersimpan).

![Diagram jembatan simpan-teruskan, siapa menahan apa (Konsep 9): naik disimpan di Pi, turun tidak disimpan; uji cabut internet rumah 10 menit di lab tiruan. Atas: Node 1 v1.6.0, QoS 0 tiap 10 s, ke broker gerbang Pi: antrean untuk jembatan (batas disetel 100.000), ke lemari tiap 30 s, berjaga bila listrik padam; jembatan ke broker pusat VPS: naik out 1 (telemetry, status, vitals, ack) DITAHAN saat putus, turun cmd in 1 TIDAK ditahan; broker pusat 8883 TLS, kabar jembatan-pi/state 1 atau 0; backend ke db dengan ts asli, ON CONFLICT menolak kembar. Setelan: persistence, autosave_interval 30, queue_qos0_messages, upgrade_outgoing_qos, cleansession true + local_cleansession false, notifications. Tengah, garis waktu (lab tiruan, Node 1 = simulator alat/, 30 Okt 2026, WIB): cabut 00.42.24, sambung 00.52.48, putus 10 menit 24 detik. Node 1 tetap tersambung. Jembatan menurut Pi: jendela buta 112 s, lalu mencoba lagi tiap 5–30 s. Menurut VPS: state 0 sesudah 83 s, state 1 saat masuk lagi. Antrean jembatan di Pi: kosong, naik sampai 68 pesan ditahan, kosong lagi (angka mentah $SYS 59, 127, 59; sekitar 60 = pesan retained yang selalu ada). Database: tidak ada yang tiba selama putus, lalu 65 bacaan susulan dalam 1 detik dengan ts asli. Kejadian: 1 00.43.40 tombol Lampu, toast belum dikonfirmasi perangkat (504); 2 00.48.50 Grafana alert Node diam ke Telegram tiruan; 3 00.53.16 jembatan masuk lagi, backend: perintah lampu tidak dikerjakan lebih dari 2 menit, tidak dikirim lagi. cek-susulan.sql: bacaan 84, celah terbesar 00:00:10, celah lebih dari 12 detik 0, tiba lebih dari 60 s sesudah ts 60, kembar 0; 84 terbit = 84 tersimpan: 0 hilang, 0 dobel. 60, bukan 65: lima bacaan terakhir tiba kurang dari 60 s sesudah ts-nya. Bawah, Silabus lawan Modul 27 (baris listrik = prototipe riset): QoS 0 saat putus, 7 hilang di awal putus lawan 0; perintah lampu saat putus dikerjakan saat jalur kembali (lab 3–4 menit kemudian) lawan tidak disimpan, lebih dari 2 menit tidak dikirim ulang; Pi mati listrik, antrean sejak simpanan terakhir hilang (simpan tiap 30 menit) lawan paling banyak 30 detik terakhir. Silabus: topic # out 1, cleansession false; Modul 27: topik sempit, cleansession true + local_cleansession false, + upgrade_outgoing_qos + autosave_interval 30. Jujur: selama putus dashboard tetap Online dengan data basi, aturan server diam; WiFi rumah putus bukan internet putus.](aset/jembatan-simpan-teruskan.png)

> ⬆️ **Sudah membaca Konsep 9?** Lanjut ke [Praktik 4](#praktik-4--simpan-teruskan-di-rumah-dulu-jembatan-lan-dan-latihan-putus-10-menit-30-menit): setelan jembatan ini dicoba dulu di rumah, lewat jembatan LAN Modul 26. Konsep 9 dipakai lagi di [Praktik 9](#praktik-9--jalur-utama-jembatan-pi--vps-lewat-tls-35-menit), [Praktik 10](#praktik-10--uji-cabut-internet-rumah-10-menit-30-menit), dan [11.9](#119--t3-gratis-internet-rumah-putus-10-menit-riwayat-pi-tetap-utuh-15-menit).

### 10. Jalur gratis: Cloudflare Tunnel

Jalur gratis tidak menyewa VPS: Pi menjalankan pusat **dan** gerbang, menyala 24 jam di rumah, dan dashboard keluar rumah lewat **terowongan Cloudflare** (Cloudflare Tunnel). Yang dibayar hanya domain, karena rute terowongan butuh nama yang *nameserver*-nya di Cloudflare (Konsep 5). Susunannya ada di kotak putus-putus [gambar Konsep 1](#1-dari-rumah-ke-internet-tiga-pintu-dua-jalur).

**Terowongan = sambungan keluar.** Program `cloudflared` di Pi membuka sambungan **keluar** ke Cloudflare (dokumennya: "outbound-only connections"). Tamu yang mengetik `https://iot.namaanda.my.id` tiba di tepi Cloudflare, lalu permintaannya diantar lewat sambungan itu ke Pi. Router tidak membuka pintu apa pun, dan NAT bersama dari [🔁 Langkah 2](#langkah-2--alamat-rumahmu-di-internet-router-lawan-situs-ip-saya) tidak jadi soal. Menurut dokumennya, Tunnel ada di semua paket, termasuk yang gratis.

**Amplopnya dibuka di tepi Cloudflare.** HTTPS dipasang Cloudflare, bukan Caddy: Caddy di Pi tetap `:80` polos seperti Modul 26 (`DOMAIN_WEB` kosong), dan `cloudflared` mengetuk `http://web:80` di lorong yang sama. Artinya, Cloudflare bisa membaca seluruh lalu lintas dashboard-mu, termasuk sandi yang diketik saat *login*. Di jalur utama, amplop baru dibuka Caddy di VPS-mu sendiri.

**MQTT tidak lewat.** Terowongan biasa membawa HTTP dan WebSocket: dashboard, API, Socket.IO, dan Grafana `/grafana/`. Menurut dokumen Cloudflare, layanan lain seperti MQTT butuh `cloudflared` juga di sisi klien, dan itu tidak bisa dipasang di ESP32 atau MQTTX biasa. Jadi broker jalur gratis **hanya di jaringan rumah**, seperti tabel [§2.2 Silabus](../../SILABUS.md#22-di-mana-otak-nya-berjalan-dari-waktu-ke-waktu): tanpa *record* `mqtt.`, tanpa pintu 8883, dan perangkat di lokasi lain (Praktik 13) butuh jalur utama. Itulah bunyi T2-gratis di [11.8](#118--t1-gratis-dan-t2-gratis-dashboard-dari-hp-broker-tetap-di-rumah-6-menit): broker tak terjangkau dari luar. MQTT lewat WebSocket di terowongan ada di 🔬 (tidak diuji penulis).

**Satu Pi, dua proyek, dua broker** (pola [6.7 Modul 26](../modul-26-docker-compose/README.md#67-jalur-laptop-pengganti-l4-lalu-gerbang-di-laptop-yang-sama-525-menit)):

| | Pusat: `compose.cloud.yml`, proyek `rumahpintar` | Gerbang: `edge/compose.edge.yml`, proyek `rumahpintar-gerbang` |
| :-- | :-- | :-- |
| Isi | `web` (Caddy `:80`), `backend`, `db`, `grafana`, broker pusat, `cloudflared` | broker gerbang dengan antreannya (Konsep 9) |
| Loket broker | `1884`, hanya di `172.17.0.1` | `1883` di IP Pi, tetap untuk Node 1 |

Gerbang menyambung ke `pusat:1884` lewat jembatan LAN polos, dengan `ALAMAT_PUSAT=host-gateway` di `edge/.env` ([11.6](#116--gerbang-ke-pusat-di-pi-yang-sama-jembatan-lan-ke-pusat1884-8-menit)): alamat Pi di lorong bawaan Docker (`docker0`), biasanya `172.17.0.1`. Karena itu loket broker pusat cukup dibuka di alamat itu; dengan `0.0.0.0`, pintu polos 1884 ikut terlihat di seluruh WiFi rumah tanpa ada yang butuh. Internet yang putus tidak memutus apa pun di dalam Pi: bacaan tetap masuk ke database Pi ([11.9](#119--t3-gratis-internet-rumah-putus-10-menit-riwayat-pi-tetap-utuh-15-menit)), hanya dashboard yang tak terjangkau dari luar.

**`cloudflared` pindah berkas.** Di Modul 26, layanan `cloudflared` (profil `terowongan`) tertulis di `edge/compose.edge.yml`. Dari sana ia tidak bisa mengetuk `http://web:80`, karena `web` tinggal di lorong proyek lain. Kini ia di `compose.cloud.yml`, satu lorong dengan `web`, tetap berprofil `terowongan`: tidak menyala sampai `.env` Pi menulis `COMPOSE_PROFILES=terowongan` ([11.7](#117--cloudflare-tunnel-token-di-env-rute-ke-httpweb80-dan-profil-terowongan-12-menit)). Silabus v1.0.29 mencatat pindahan ini.

**Siapa tamunya?** Tamu jalur gratis tiba lewat `cloudflared`, yang semestinya menulis `X-Forwarded-*` sendiri. `PROKSI_TEPERCAYA=private_ranges` membuat Caddy memercayai penerus di alamat privat, termasuk `cloudflared` di lorong, sehingga backend tahu tamunya datang lewat HTTPS (*cookie* `Secure`) dan dari alamat mana. Lab penulis membuktikannya dengan program pengganti `cloudflared`; kepala yang dikirim `cloudflared` sungguhan belum diperiksa penulis. Biarkan `ALAMAT_WEB=127.0.0.1`: tamu hanya datang lewat terowongan, sedangkan loket web yang terbuka ke WiFi rumah membuat perangkat di rumah bisa memalsukan alamatnya (🔬).

**Token = kunci terowongan.** Dasbor Cloudflare memberi `TUNNEL_TOKEN` saat terowongan dibuat, dan token itu ditulis di `.env` akar Pi. Token setara sandi: siapa pun yang memegangnya bisa menjalankan terowonganmu, jadi jangan sampai masuk Git, forum, atau AI. Tanpa token yang sah, `cloudflared` jatuh bangun: `docker compose ps` menulis `Restarting (255)`, lognya `Provided Tunnel token is not valid.` (lab penulis).

**Pi sebagai rumah 24 jam.** Pusat lengkap di Pi lab penulis memakai ±0,5 GB RAM saat diam, jadi Pi 2 GB cukup untuk menjalankannya; *build* image di Pi 2 GB belum diukur penulis. Yang paling cepat aus adalah kartu microSD biasa, karena database menulis terus: [Silabus §5.3](../../SILABUS.md#53-kit-b--raspberry-pi-sebagai-gateway-dibutuhkan-mulai-modul-12) menyarankan microSD *high-endurance*, dan [🔬 Modul 12](../../fase-2-konektivitas/modul-12-raspberry-pi-dan-linux/README.md#-bedah-teknis-opsional) menunjukkan cara menyalakan Pi dari SSD.

**Naik kelas kelak.** Kalau suatu hari kamu menyewa VPS, kerjakan Praktik 5–9: pindahkan riwayat dengan resep [7.5](#75--pindah-riwayat-ke-vps-cadangan-scp-pulihkan-lalu-sidik-jari-sama-14-menit), lalu arahkan jembatan Pi ke `mqtt.namaanda.my.id:8883`. Tidak ada yang dibongkar: `compose.cloud.yml` yang sama pindah dengan `.env` kolom VPS.

Penulis tidak punya akun Cloudflare: langkah dasbor Praktik 11 diambil dari dokumen resmi (dibaca 29 Okt 2026), dan `cloudflared` di lab hanya dicoba tanpa token.

> ⬆️ **Sudah membaca Konsep 10?** Jalur gratis: pastikan *nameserver* domainmu sudah aktif ([6.4](#64--nslookup-buku-telepon-internet-sudah-mengenal-namamu-5-menit)), lalu kerjakan [Praktik 11](#praktik-11--jalur-gratis-semua-di-pi-dan-cloudflare-tunnel-85-menit). Jalur utama cukup membacanya sebagai pembanding, lalu kembali ke praktik yang sedang dikerjakan.

### 11. PWA: dari pintasan menjadi aplikasi

Di [9.3 Modul 24](../../fase-4-frontend-dashboard/modul-24-kendali-aturan-peran/README.md#93-mode-hp-untuk-akun-admin-dan-pintasan-di-layar-utama-15-menit), kamu menaruh dashboard di layar utama HP lewat mode HP (`http://192.168.1.10:5173`, IP laptop). Itu **pintasan**: ikon `apple-touch-icon.png` dan nama yang membuka browser di alamat itu. Ia hanya jalan di WiFi rumah ([Konsep 12 Modul 23](../../fase-4-frontend-dashboard/modul-23-dashboard-realtime/README.md#12-hp-lewat-wifi-rumah-mode-hp-dan-mode-laptop)), mati saat laptop tidur atau IP-nya berganti, dan saat luring menampilkan halaman galat browser. [🔬 Modul 24](../../fase-4-frontend-dashboard/modul-24-kendali-aturan-peran/README.md#-bedah-teknis-opsional) menunda aplikasi sungguhan sampai ada HTTPS. Minggu ini dashboard 1.3.0 menjadi **PWA**: dashboard yang bisa **dipasang** seperti aplikasi dan dibuka dari mana saja. Mode HP pensiun untuk akses dari luar rumah.

**Tiga syarat.**

1. **Konteks aman.** Fitur aplikasi hanya jalan di `https://…` atau `http://localhost`. IP LAN tidak dihitung aman: Modul 24 merekam `isSecureContext` = `false` di `http://192.168.1.10:5173`. Karena itu PWA dicoba dulu di `http://localhost` laptop ([Praktik 3](#praktik-3--dashboard-130-jadi-pwa-di-httplocalhost-40-menit)), lalu dipasang di HP sesudah dashboard punya alamat `https://`.
2. **Kartu nama aplikasi (*manifest*).** Berkas `manifest.webmanifest` ditulis `vite-plugin-pwa` 2.0.0 saat `npm run build`, dari isi `vite.config.ts` ([3.3](#33-viteconfigts-manifest-service-worker-dan-tiga-jalur-yang-selalu-ke-jaringan-6-menit)): nama `Rumah Pintar Mini`, nama pendek `Rumah Pintar` di bawah ikon, bahasa `id`, alamat awal `/`, tampilan `standalone` (jendela sendiri tanpa bilah alamat), dan ikon 64, 192, dan 512 px, ditambah 512 px *maskable* yang boleh dipotong peluncur Android menjadi lingkaran. Semuanya dari rumah garis Modul 24, yang juga menggantikan logo petir bawaan Vite di `favicon.svg`.
3. **Pekerja latar (*service worker*).** Penjaga kecil di browser, `sw.js`, menyimpan **cangkang** dashboard (halaman, JavaScript, CSS, ikon: 10 berkas, ±1 MB), jadi aplikasi terbuka cepat, juga saat luring: layar **Masuk** tetap tampil dengan pesan `Tidak bisa menghubungi server. Periksa sambungan internetmu, lalu coba lagi.`, bukan halaman galat. Chrome versi baru mengizinkan pemasangan walau tanpa pekerja latar, tetapi tanpanya aplikasi tidak terbuka saat luring.

**Angka selalu dari jaringan.** Cangkang tidak memuat satu angka pun. Tiga jalur tidak pernah dijawab dari simpanan: `/api` (data, *login*, perintah), `/grafana`, dan `/socket.io` (daftar `navigateFallbackDenylist`). Di lab penulis, tanpa `/grafana` di daftar itu, browser yang pernah membuka dashboard menampilkan `Halaman tidak ditemukan` milik dashboard di `https://iot.namaanda.my.id/grafana/`. Akibatnya, angka di layar tidak pernah basi diam-diam dari simpanan HP, tetapi tanpa internet juga tidak ada data luring, perintah tidak disimpan untuk dikirim nanti, dan tidak ada notifikasi *push*; kabar penting tetap lewat Telegram.

**Memasang.** Chrome di laptop dan Android menawarkannya dari menu pemasangan aplikasi (namanya bisa berbeda per versi). iPhone memakai Safari: ⋯ → **Bagikan** → **Tambah ke Layar Utama** → nyalakan **Buka sebagai App Web** → **Tambah** ([12.2](#122-iphone-tambah-ke-layar-utama-dari-safari-6-menit), dari dokumen Apple). Di lab penulis, Chrome 156 tanpa layar menyatakan dashboard boleh dipasang (daftar galat pemasangan kosong) di `http://localhost` dan di HTTPS tiruan. Pemasangannya sendiri, dialognya, dan rupa ikon di HP belum dicoba penulis: itu langkahmu di [3.6](#36--manifest-service-worker-dan-pasang-dashboard-dari-httplocalhost-7-menit) dan [12.1](#121--android-pasang-dashboard-dari-chrome-8-menit).

**Versi baru tampil pada pembukaan berikutnya.** Dengan `registerType: 'autoUpdate'`, sesudah image web dibangun ulang, versi baru tampil pada **pembukaan berikutnya**, begitu browser selesai mengambilnya (biasanya beberapa detik). Tab yang sedang terbuka tidak memuat ulang sendiri, jadi isian formulir aman. Di lab penulis, muat ulang pertama masih versi lama, muat ulang kedua versi baru ([12.5](#125-catat-bukti-t1-lalu-versi-baru-aplikasi-5-menit)).

**Jebakan `npm run preview`.** `npm run preview` dan `npm run dev` memakai alamat yang sama, `http://localhost:5173`. *Build* yang disajikan `preview` memasang pekerja latar di sana, dan `npm run dev` sesudahnya tetap menampilkan dashboard lama dari simpanan. Obatnya: DevTools → **Application** → **Storage** → **Clear site data** ([3.7](#37-luring-cangkang-dashboard-tetap-terbuka-lalu-jebakan-npm-run-preview-3-menit), [🚨](#-kalau-tidak-jalan)). Untuk PWA, Caddyfile tidak perlu diubah: ia sudah menyajikan `manifest.webmanifest` dengan tipe `application/manifest+json` dan `sw.js` dengan `no-cache`.

![Diagram dari pintasan menjadi aplikasi PWA (Konsep 11), dashboard 1.3.0; vite-plugin-pwa 2.0.0 menulis manifest dan service worker saat npm run build. Kiri atas, pintasan di layar utama (Modul 24 sampai 26, mode HP): alamat http://192.168.1.10 (IP laptop); bukan konteks aman, isSecureContext = false; hanya ikon apple-touch-icon.png 180 px + nama; tanpa service worker, luring = halaman galat browser; Android: terbuka di Chrome; IP laptop berubah atau laptop tidur = pintasan mati; di luar WiFi rumah tidak bisa. Panah Modul 27 ke kanan, aplikasi terpasang (PWA), lewat VPS atau terowongan Cloudflare, 24 jam: alamat https://iot.namaanda.my.id (atau http://localhost), konteks aman; manifest + ikon 192/512 + maskable; service worker menyimpan cangkang; jendela sendiri (standalone); luring: cangkang tetap terbuka + pesan jelas; dari WiFi lain atau data seluler. Tengah, empat bagian (lab: Chrome 156 tanpa layar, daftar galat pemasangan kosong di localhost dan HTTPS tiruan): 1 alamat aman, https atau localhost, IP WiFi http://192.168 tidak dihitung aman; 2 manifest.webmanifest: Rumah Pintar Mini, start_url /, standalone, theme_color #1d293d; 3 ikon pwa-192x192.png, pwa-512x512.png, maskable-icon-512x512.png (+ 64 px), dari favicon.svg rumah Modul 24; 4 service worker sw.js, generateSW, autoUpdate, cangkang 10 berkas sekitar 1.062 KiB, bukan syarat pasang di Chrome baru tetapi membuat luring jalan. Bawah tengah, sw.js, pekerja latar di browser, memeriksa setiap permintaan: dari simpanan (cangkang) index.html, JavaScript, CSS, favicon.svg, ikon, manifest, registerSW.js, layar terbuka cepat juga saat luring, dan luring dashboard menulis Tidak bisa menghubungi server. Periksa sambungan internetmu, lalu coba lagi.; selalu ke server: /api (data, login, perintah), /grafana, Socket.IO wss://.../api/socket.io/, jadi angka tidak pernah dari simpanan HP. Bawah kiri, versi baru (autoUpdate): image web dibangun ulang; pembukaan pertama masih versi lama sambil versi baru diambil; pembukaan berikutnya versi baru (lab: muat ulang ke-2; isian formulir aman). Bawah kanan, memasang: Android Chrome menu titik tiga, pilihan pemasangan aplikasi; iPhone Safari Bagikan, Tambah ke Layar Utama, nyalakan Buka sebagai App Web, Tambah; laptop tombol pasang di bilah alamat. Jujur: HP sungguhan tidak diuji (Chrome tanpa layar 412 px); tanpa notifikasi push, tanpa data luring.](aset/pwa-dari-pintasan.png)

> ⬆️ **Sudah membaca Konsep 11?** Lanjut ke [Praktik 3](#praktik-3--dashboard-130-jadi-pwa-di-httplocalhost-40-menit): PWA dicoba dulu di `http://localhost`. Pemasangan di HP sungguhan menunggu [Praktik 12](#praktik-12--pwa-di-hp-jaringan-seluler-dan-teman-di-kota-lain-40-menit), sesudah dashboard-mu punya alamat `https://`.

## 🔧 Praktik langkah demi langkah

Praktik 1–4, 6, 10, dan 12 wajib untuk semua jalur (jalur gratis mengganti Praktik 10 dengan [11.9](#119--t3-gratis-internet-rumah-putus-10-menit-riwayat-pi-tetap-utuh-15-menit)); Praktik 5, 7, 8, dan 9 wajib untuk jalur utama; Praktik 11 wajib untuk jalur gratis; [Praktik 13](#praktik-13--opsional-perangkat-di-lokasi-lain-lewat-mqtts-tanpa-gerbang-20-menit) opsional. Langkah bertanda ⭐ (1.2, 1.3, 1.4, 2.2, 2.4, 3.5, 3.6, 4.3, 4.4, 4.5, 5.4, 5.5, 5.7, 6.3, 6.4, 7.5–7.9, 8.1, 8.3, 8.6, 9.3, 9.4, 10.2, 10.5, 11.4, 11.6–11.9, 12.1 (iPhone: 12.2), 12.3, dan 12.4) adalah buktinya, ditambah [➕ E](#e--gabungkan-fiturke-internet-ke-main-lewat-pull-request-online-di-internet-https-tls-mqtt-jembatan-tahan-putus-pwa). Syarat lulus **T1** dibuktikan di [12.4](#124--t1-teman-di-kota-lain-membuka-dashboard-mu-lewat-https-15-menit) (jalur gratis: [11.8](#118--t1-gratis-dan-t2-gratis-dashboard-dari-hp-broker-tetap-di-rumah-6-menit) lalu 12.4), **T2a** di [8.3](#83--t2a-tanpa-tls-ditolak-di-8883-dan-1883-tak-terjangkau-dari-luar-10-menit) (jalur gratis: **T2-gratis** di 11.8), **T2b** di [9.3](#93--t2b-log-vps-mencatat-jembatan-pi-lewat-tls-6-menit), dan **T3** di [10.5](#105--t3-skripcek-susulansql-di-vps-tanpa-celah-dan-tanpa-dobel-8-menit) (jalur gratis: 11.9 ditambah latihan [4.4](#44--putus-10-menit-di-lan-lalu-skripcek-susulansql-tanpa-celah-tanpa-dobel-11-menit)). Praktik 1–4 tanpa biaya dan dikerjakan di laptop dan Pi sebelum kamu menyewa VPS; yang dibeli lebih dulu hanya domain di [6.1](#61-beli-domain-myid-di-registrar-terakreditasi-pandi-7-menit), karena kedua jalur membutuhkannya dan menunggu *nameserver* aktif bisa berjam-jam.

Semua `docker compose` pusat dijalankan dari **akar proyek** di mesin yang disebut kotak 🖥️ (laptop, VPS, atau Pi jalur gratis); gerbang dari folder `edge` di Pi. Praktik yang mengubah berkas diakhiri *commit* di cabang `fitur/ke-internet` (1.1); cabang itu di-*push* pertama kali di [4.1](#41-edgegerbangconf-empat-baris-penahan-antrean-lalu-push-cabang-6-menit) (Pi mengambil `edge/` baru), diambil VPS dengan `git clone` di 7.1 (jalur gratis: Pi di 11.1), lalu digabung ke `main` di ➕ E. Satu backend per token bot: backend laptop berhenti di 7.6 (jalur gratis: 11.4). [`kode/`](kode/) hanya berisi berkas yang berubah, empat *diff*, dan bahan modul: salin satu per satu seperti petunjuk praktiknya, jangan menimpa seluruh foldermu.

Jalur lain memakai urutan yang sama; bedanya di kotak 🔀:

- **Tanpa Pi:** VPS seperti jalur utama, dan laptop menjadi gerbang ([pola Modul 26 6.7](../modul-26-docker-compose/README.md#67-jalur-laptop-pengganti-l4-lalu-gerbang-di-laptop-yang-sama-525-menit)). Kriteria lulusnya = jalur utama, kecuali T3: internet diputus dengan mematikan WiFi laptop ([10.2](#102--cabut-internet-rumah-bukan-wifi-rumah-2-menit); belum diuji penulis).
- **Tanpa Kit:** simulator `alat/` dan Kebun tiruan menggantikan Node 1 dan Node 2, lewat gerbang di Pi atau laptop.
- **Wokwi:** sama dengan tanpa Kit; ESP32 dengan TLS hanya di 🧩 Tingkat 1 dan 🔬.

**Cara mencicil (lima hari):** hari 1 🔁, 🏆, Konsep 1 dan 5, 6.1–6.2, Praktik 1–3 (bagian `TRUST_PROXY` Konsep 7 sebelum Praktik 2, Konsep 11 sebelum Praktik 3) · hari 2 Konsep 9, Praktik 4, lalu (jalur utama) Konsep 2–4, Praktik 5, 6.3–6.4 · hari 3 Konsep 6–7, Praktik 7 · hari 4 Konsep 8, Praktik 8–9 · hari 5 Praktik 10, Praktik 12, ➕. Jalur gratis: hari 2 Konsep 9, Praktik 4, 6.4, Konsep 10 · hari 3 Praktik 11 · hari 4 Praktik 12, ➕.

> [!IMPORTANT]
> **Rumahmu tetap menyala sampai [7.5](#75--pindah-riwayat-ke-vps-cadangan-scp-pulihkan-lalu-sidik-jari-sama-14-menit).** Sejak 7.5, bacaan rumah tidak lagi sampai ke laptop, dan baru sampai ke VPS sesudah jembatan Pi tersambung di [9.2](#92-pi-edgejembatanpusatconf-menuju-mqttnamaandamyid8883-10-menit) (jalur gratis: [11.4](#114--pindah-riwayat-ke-pi-sidik-jari-sama-backend-laptop-berhenti-12-menit) sampai [11.6](#116--gerbang-ke-pusat-di-pi-yang-sama-jembatan-lan-ke-pusat1884-8-menit)), jadi kerjakan hari 3 dan 4 berdekatan. Selama 7.5–9.2, gerbang Pi menahan bacaan Node 1 di antreannya (lab penulis, jeda 7 menit: 0 hilang, 0 dobel di VPS).

### Praktik 1 — Meja kerja: cabang, sidik jari, dan cadangan (15 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** di laptop dengan folder `rumah-pintar-mini` dan terminal di **akar proyek** (Git dan `docker compose`). Rumah Modul 26 tetap menyala; Kit B: Pi tidak disentuh. Bahannya: [🔁 Langkah 1](#langkah-1--inventaris-rumah-modul-26-dan-sidik-jari-riwayat) dan resep cadangan [Modul 26 9.1](../modul-26-docker-compose/README.md#91-pg_dump-di-dalam-kontainer-lalu-docker-compose-cp-ke-backup-8-menit).
>
> ⭐ **Wajib** — langkah 1.2, 1.3, dan 1.4 (Kit B): sidik jari riwayat tercatat, arsip cadangan ada di `backup/`, dan `.env` laptop memuat `ALAMAT_MQTT=0.0.0.0`.

#### 1.1 Cabang `fitur/ke-internet` dari `main` yang terbaru (3 menit)

Di terminal akar proyek:

```text
git switch main
git pull
git switch -c fitur/ke-internet
```

**Hasilnya** (lab penulis):

```text
Already on 'main'
Your branch is up to date with 'origin/main'.
Already up to date.
Switched to a new branch 'fitur/ke-internet'
```

Praktik 1 tidak mengubah berkas proyek, jadi tanpa *commit*.

#### 1.2 ⭐ Sidik jari riwayat di laptop dengan `skrip/sidik-jari.sql` (4 menit)

Skripnya sudah ada di proyekmu sejak [Modul 26](../modul-26-docker-compose/README.md#12--hentikan-penulis-data-lalu-ambil-sidik-jari-riwayat-dengan-skripsidik-jarisql-8-menit) (bash/zsh):

```text
docker compose exec -T db psql -U postgres -d rumahpintar < skrip/sidik-jari.sql
```

PowerShell (tidak diuji penulis): `Get-Content skrip/sidik-jari.sql | docker compose exec -T db psql -U postgres -d rumahpintar`.

**Hasilnya** (lab penulis, 22.24 WIB; angkamu berbeda):

```text
 bacaan |            sidik_jari            | ringkasan | jilid | tugas | akun | perangkat
--------+----------------------------------+-----------+-------+-------+------+-----------
   2313 | 2e6d178c2f561cfe7a24e9d11d501252 |       383 |     9 |     3 |    2 |         3
(1 row)
```

Salin judul kolom dan barisnya ke `belajar-iot/modul-27/sidik-jari.md` dengan judul "Sebelum Modul 27 (1.2)" dan jamnya (WIB). Rumah masih menyala, jadi angkanya terus bergerak: ini pembanding kasar sebelum kamu mengubah apa pun. Sidik jari yang menentukan diambil lagi sesudah aliran data dihentikan di 7.5 (jalur gratis: 11.4), dan di mesin tujuan harus sama persis.

**Kamu lulus langkah ⭐ ini** kalau baris sidik jari lengkap beserta jam WIB-nya tersimpan di `sidik-jari.md`.

#### 1.3 ⭐ Cadangan sebelum mengubah apa pun: `pg_dump` lalu `docker compose cp` ke `backup/` (5 menit)

Kalau Praktik 2–4 merusak sesuatu, arsip ini dipulihkan dengan resep [Modul 26 9.2](../modul-26-docker-compose/README.md#92-proyek-uji-uji-pulih-di-lemari-baru-resep-pulih-timescaledb-15-menit). Resepnya = Modul 26 9.1:

```text
docker compose exec db pg_dump -U postgres -d rumahpintar -Fc -f /tmp/rumahpintar.dump
```

**Hasilnya:** empat baris wajar seperti Modul 26, dibuka `pg_dump: warning: there are circular foreign-key constraints on this table:`. Belum punya folder `backup` (Praktik 9 Modul 26)? Buat di Explorer VS Code (**New Folder…**). Pakai tanggal hari ini di nama arsipnya:

```text
docker compose cp db:/tmp/rumahpintar.dump backup/rumahpintar-2026-10-29.dump
```

**Hasilnya** (lab penulis):

```text
[+] Copying 1/1
 ✔ rumahpintar-db-1 copy rumahpintar-db-1:/tmp/rumahpintar.dump to backup/rumahpintar-2026-10-29.dump Copied          0.0s
```

Cek `git status --short`: kosong, karena `backup/` diabaikan Git sejak Modul 26. Arsip ini berisi seluruh riwayat dan akunmu: simpan sebagai data pribadi.

**Kamu lulus langkah ⭐ ini** kalau `backup/` berisi arsip bertanggal hari ini dan `git status --short` tidak menyebutnya.

#### 1.4 ⭐ Kit B: `ALAMAT_MQTT` di `.env` laptop supaya jembatan Pi tetap tersambung (3 menit)

Mulai [2.3](#23-composecloudyml-modul-27-dan-blok-di-internet-di-env-laptop-4-menit), `compose.cloud.yml` Modul 27 membuka pintu broker polos 1883 hanya untuk laptop itu sendiri (`127.0.0.1`), kecuali `.env` berkata lain. Bawaan yang sempit ini penting di VPS ([Konsep 4](#4-tembok-api-yang-bocor-ufw-dan-docker)), padahal gerbang Pi mengetuk laptop dari WiFi rumah. Sebelum berkas itu dipakai, tambahkan satu baris ke `.env` di akar proyek laptop, lalu simpan (**Ctrl + S**):

```text
ALAMAT_MQTT=0.0.0.0
```

`0.0.0.0` = semua antarmuka IPv4 (Modul 26: juga IPv6). Berkas Compose Modul 26 belum memakainya, jadi belum ada yang berubah; buktinya muncul di [2.4](#24--docker-compose-up--d---build-backend-penerus-tepercaya-dan-sesi-tetap-3-menit): loket broker `0.0.0.0:1883->1883/tcp`. Tanpa baris ini, Compose diam saja, jembatan Pi gagal berulang kali (lab penulis, log gerbang: `Client local.jembatan-pi [(null):0] disconnected: Broken pipe.` lalu `Bridge pusat next backoff will be 30000 ms`; di jaringan rumahmu bunyinya bisa lain), dan dashboard hanya menampilkan data basi ([🚨](#-kalau-tidak-jalan) *Jembatan Kit B tidak tersambung lagi sesudah kode Modul 27*). Dengan `0.0.0.0`, pintu 1883 polos terbuka ke seluruh WiFi: di WiFi umum, jalankan `docker compose stop mosquitto`, lalu `docker compose start mosquitto` di rumah.

> 🔀 **Tanpa Pi:** simulator ke `mqtt://127.0.0.1:1883` tidak butuh baris ini. Gerbang di laptop (pola Modul 26 6.7, dipakai 🔀 Praktik 4) mengetuk pusat lewat `host-gateway` (alamat laptop dilihat dari dalam kontainer, bukan `127.0.0.1`): tambahkan juga baris ini.

**Kamu lulus langkah ⭐ ini** kalau `.env` laptopmu memuat `ALAMAT_MQTT=0.0.0.0` (Kit B atau gerbang di laptop).

> ⬆️ **Selesai Praktik 1?** Baca bagian `TRUST_PROXY` di [Konsep 7](#7-caddy-sebagai-pintu-depan-https-otomatis-dan-trust_proxy) (cukup bagian itu dulu), lalu lanjut ke [Praktik 2](#praktik-2--backend-140-trust_proxy-sesi-broker-tetap-dan-perintah-tangan-2-menit-20-menit).

### Praktik 2 — Backend 1.4.0: `TRUST_PROXY`, sesi broker tetap, dan perintah tangan 2 menit (20 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** di folder `rumah-pintar-mini`: terminal di folder **`backend`** (npm) dan di **akar proyek** (`docker compose`, Git). Rumahmu tetap menyala. Konsep yang dipakai: 7 (bagian `TRUST_PROXY`); sesi tetap dijelaskan di 2.1.
>
> ⭐ **Wajib** — langkah 2.2 dan 2.4: 118 tes lulus, lalu backend 1.4.0 menyala di Compose dengan `penerus tepercaya (TRUST_PROXY): uniquelocal` dan sesi tetap (`c0`).

Backend naik ke **1.4.0**: tiga perubahan, tanpa migrasi, tanpa paket baru. Keadaan akhirnya ada di [`kode/backend/`](kode/backend/), semua perubahannya di [`kode/backend-1.4.diff`](kode/backend-1.4.diff) (15 berkas). Cara menyalin sama dengan Modul 26: ketik potongannya atau **Copy raw file** berkas bernama sama.

#### 2.1 Tiga perubahan di `src/`: `env.ts` dan `server.ts`, `mqtt.ts`, serta `perintah.ts` (8 menit)

**(a) `TRUST_PROXY`** ([Konsep 7](#7-caddy-sebagai-pintu-depan-https-otomatis-dan-trust_proxy)). `src/config/env.ts` memeriksanya saat menyala (angka ditolak), lalu:

```ts
  TRUST_PROXY: z.string().default("")
    // …
    .transform((daftar): boolean | string[] => (daftar.length === 0 || daftar.join() === "false" ? false
      : daftar.join() === "true" ? true : daftar)),
```

Kosong = `false` (tak memercayai siapa pun); `uniquelocal` atau alamat/rentang = daftar penerus tepercaya. `src/server.ts` menyerahkannya ke Fastify (`trustProxy: env.TRUST_PROXY,`) dan mencatat `penerus tepercaya (TRUST_PROXY): …`. Inilah obat yang dijanjikan Modul 20 dan 26 (Konsep 7: *cookie* tanpa `Secure`, `429` bersama). `CORS_ORIGIN` kini diperiksa: `https://iot.namaanda.my.id/` (garis miring di akhir) menghentikan server dengan `"…" bukan alamat halaman: …`, bukan diam-diam `403`.

**(b) Sesi broker tetap** (`src/services/mqtt.ts`):

```ts
    clientId: idKlien,
    // …
    clean: akun === null,
```

`idKlien` = nama akun (`backend`), jadi sesinya selalu sama; alasannya di komentar berkas itu. Dengan **sesi bersih** (1.3.0), bila broker pusat dinyalakan ulang dan jembatan Pi masuk lebih dulu dari backend, antrean dari Pi tiba tanpa pelanggan dan dibuang (lab: 1 dari 4 percobaan). Dengan **sesi tetap**, broker mengingat langganan `backend` dan menahan pesan QoS 1 untuknya sampai ia masuk (lab: 0 hilang). Selengkapnya di [Konsep 9](#9-jembatan-simpan-teruskan-siapa-menahan-apa) dan [🔬](#-bedah-teknis-opsional) *Sesi bersih lawan sesi tetap*.

**(c) Perintah tangan 2 menit** (`src/services/perintah.ts`):

```ts
const UMUR_PERINTAH_TANGAN_MS = 120_000;
```

Saat internet rumah putus, dashboard melaporkan **Lampu** gagal; tanpa batas ini, perintahnya dikirim lagi begitu kiriman yang tertahan tiba dan lampu menyala menit atau jam kemudian. Kini perintah dashboard atau Telegram yang tak dikerjakan lebih dari 2 menit dilupakan: `perintah lampu = true (api) ke <device_id> tidak dikerjakan lebih dari 2 menit: tidak dikirim lagi` ([4.5](#45--perintah-lampu-saat-putus-naik-disimpan-turun-tidak-disimpan-3-menit)).

**Berkas lain:** tes `src/config/env.test.ts`, `src/services/mqtt.test.ts`, `src/routes/proksi.test.ts` (baru), `src/services/perintah.test.ts` (baru); `src/auth/keamanan.ts` dan `Dockerfile` (komentar; jangan menimpa `LABEL`-mu); `bruno/environments/internet.yml` (baru, `baseUrl`); `.env.example` (`TRUST_PROXY=` kosong untuk mode kembang); `package.json` dan `package-lock.json` (versi 1.4.0); `README.md`.

#### 2.2 ⭐ `npm ci`, `npm run cek`, `npm test`, dan `npm audit`: 118 tes lulus (5 menit)

Di terminal folder `backend`, satu per satu: `npm ci`, `npm run cek`, `npm test`, lalu `npm audit`.

**Hasilnya (lab penulis, dipotong):**

```text
added 225 packages, and audited 226 packages in 22s
found 0 vulnerabilities
> rumah-pintar-mini-backend@1.4.0 cek
> tsc --noEmit
 Test Files  17 passed (17)
      Tests  118 passed (118)
found 0 vulnerabilities
```

(Modul 26: 15 berkas / 99 tes.) Merah? Bandingkan berkasmu dengan `kode/backend/`.

**Kamu lulus langkah ⭐ ini** kalau `npm test` menulis `17 passed (17)` dan `118 passed (118)`, dan `npm audit` `found 0 vulnerabilities`.

#### 2.3 `compose.cloud.yml` Modul 27 dan blok "Di internet" di `.env` laptop (4 menit)

Di akar proyek, ganti isi `compose.cloud.yml` dan `.env.example` dengan [`kode/compose.cloud.yml`](kode/compose.cloud.yml) dan [`kode/.env.example`](kode/.env.example) (**Copy raw file**; `TOKO_IMAGE` lamamu di `.env.example`, bila ada, tulis lagi). Untuk backend (tag di `migrasi` dan `backend`):

```yaml
x-setelan-backend: &setelan-backend
  # …
  TRUST_PROXY: ${TRUST_PROXY:-uniquelocal}
# …
    image: ${TOKO_IMAGE:?isi TOKO_IMAGE di .env}/rumah-pintar-mini-backend:1.4.0
```

**Bersamaan**, salin dua skrip baru ke `skrip/`: [`salin-sertifikat.sh`](kode/skrip/salin-sertifikat.sh) dan [`perbarui-sertifikat-mqtt.sh`](kode/skrip/perbarui-sertifikat-mqtt.sh) (dibahas di Praktik 8). Di Windows, bila bilah status VS Code menulis `CRLF`, klik → `LF`, simpan: CR merusak skrip `sh` (Modul 26: `illegal option -`; Windows tidak diuji).

> [!WARNING]
> Tanpa `salin-sertifikat.sh`, rumahmu berhenti menerima data. Lab penulis: `service "sertifikat-mqtt" didn't complete successfully: exit 2` dan `sh: can't open '/skrip/salin-sertifikat.sh': No such file or directory`, lalu `mosquitto` dan `backend` tertahan `Created`. Salin skripnya, ulangi 2.4.

Lalu tempel bagian yang diawali `# --- Di internet (Modul 27) ---` dari `.env.example` baru ke akhir `.env` laptop, apa adanya: semua kosong kecuali `PORT_HTTPS=443` dan `PORT_MQTTS=8883`. Kosong = perilaku Modul 26; `TRUST_PROXY` kosong = `uniquelocal` dari Compose (`false` = perilaku 1.3). Nilai VPS dan Pi: [7.2](#72-env-vps-rahasia-baru-dan-kolom-vps-di-tabel-nilai-per-tempat-10-menit). Kit B: `ALAMAT_MQTT=0.0.0.0` dari 1.4 tetap. Periksa:

```text
docker compose config --quiet
```

**Hasilnya (lab penulis):** tanpa keluaran = cocok. `.env` Modul 26 lama pun lolos: diamnya Compose bukan bukti jembatan Kit B aman.

Sampai [3.5](#35--npm-run-build-dengan-pwa-v200-lalu-image-web-130-7-menit), nyalakan hanya layanan yang disebut namanya: di lab penulis, `docker compose up -d` tanpa nama membangun image `web:1.3.0` dari dashboard 1.2.0 yang belum PWA (3.5 menggantinya). Simpan ke Git (`.env` tidak ikut):

```text
git add backend skrip compose.cloud.yml .env.example
git commit -m "Backend 1.4.0 dan compose.cloud.yml Modul 27"
```

#### 2.4 ⭐ `docker compose up -d --build backend`: penerus tepercaya dan sesi tetap (3 menit)

Di akar proyek:

```text
docker compose up -d --build backend
```

Compose membangun cetakan 1.4.0 (±45 detik di Pi 5 penulis), membuat lemari `rumahpintar_data-sertifikat` dan `rumahpintar_data-caddy`, menjalankan `sertifikat-mqtt` (baru), lalu membuat ulang `mosquitto` dan `backend`; `web` dan `grafana` tidak disentuh. `port is already allocated`? Loket 8883 (di 3.5 juga 443) terpakai: ganti `PORT_MQTTS`/`PORT_HTTPS` di `.env`, misalnya 8884/8443, lalu ulangi perintah di atas (bukan `up -d` saja; [🚨](#-kalau-tidak-jalan)).

Jalankan `docker compose ps -a`; di lab penulis: `backend` 1.4.0 `Up … (healthy)`, `migrasi` dan `sertifikat-mqtt` `Exited (0)`, `mosquitto` dengan `127.0.0.1:1883->1883/tcp, 127.0.0.1:8883->8883/tcp` (Kit B: `0.0.0.0:1883->1883/tcp, 127.0.0.1:8883->8883/tcp`). 8883 hanya dipesan: `pusat.conf` tanpa pintu TLS. Lalu `docker compose logs sertifikat-mqtt`, `docker compose logs backend`, dan `docker compose logs mosquitto`.

**Hasilnya (lab penulis, dipotong; jam backend WIB, angka log broker = detik; jeda 71 detik = broker lab dibuat ulang, biasanya ±2 detik):**

```text
sertifikat-mqtt-1  | DOMAIN_MQTT kosong: tanpa sertifikat broker (laptop atau Pi jalur gratis), dilewati
backend-1  | [22:29:31] INFO: penerus tepercaya (TRUST_PROXY): uniquelocal
backend-1  | [22:30:42] INFO: tersambung ke broker mqtt://mosquitto:1883 sebagai backend
mosquitto-1  | 1793287842: New client connected from 172.19.0.5:47684 as backend (p4, c0, k60, u'backend').
```

`c0` = sesi tetap (1.3.0: `c1`). Bila broker menulis `… disconnected: session taken over.` tepat sebelum `New … connected`, itu normal: sesi lama klien itu sendiri, bukan penyamar. Kit B: dalam ±30 detik jembatan Pi masuk lagi (`… as jembatan-pi (p4, c0, …)`, setelan Modul 26 sampai Praktik 4); tidak? Periksa 1.4. *Cookie* di `http://localhost` tetap tanpa `Secure`, benar untuk HTTP; buktinya di [7.8](#78--gembok-di-httpsiotnamaandamyid-308-login-dan-cookie-secure-6-menit).

**Kamu lulus langkah ⭐ ini** kalau `sertifikat-mqtt` `Exited (0)` (`dilewati`), `backend` 1.4.0 `(healthy)`, dan log memuat `penerus tepercaya (TRUST_PROXY): uniquelocal` serta `as backend (p4, c0, k60, u'backend')`.

> ⬆️ **Selesai Praktik 2?** Baca [Konsep 11](#11-pwa-dari-pintasan-menjadi-aplikasi), lalu lanjut ke [Praktik 3](#praktik-3--dashboard-130-jadi-pwa-di-httplocalhost-40-menit): dashboard 1.3.0 menjadi aplikasi.

### Praktik 3 — Dashboard 1.3.0 jadi PWA di `http://localhost` (40 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** di folder `rumah-pintar-mini`: terminal di folder **`frontend`** untuk `npm`, terminal di **akar proyek** untuk `docker compose` dan Git; **Chrome** dengan DevTools (**F12**) di laptop (Edge serupa, tidak diuji penulis); internet untuk `npm`. Rumahmu tetap menyala; Pi tidak disentuh. Konsep yang dipakai: 11.
>
> ⭐ **Wajib** — langkah 3.5 dan 3.6: `npm run build` ditutup `PWA v2.0.0` dan image web 1.3.0 menyala, lalu di `http://localhost`: *manifest* tanpa galat, *service worker* `activated`, dan dashboard terpasang sebagai aplikasi.

Dashboard naik ke **1.3.0**: satu paket pengembang, empat ikon, satu berkas setelan, dan tiga perubahan kecil, tanpa layar baru. Keadaan akhirnya [`kode/frontend/`](kode/frontend/), perubahannya [`kode/frontend-1.3.diff`](kode/frontend-1.3.diff) (tanpa `package-lock.json` dan PNG: keduanya kamu dapat di 3.1 dan 3.2; Caddyfile-nya: 7.1). Cara menyalin sama dengan Praktik 2.

#### 3.1 `vite-plugin-pwa` 2.0.0 persis, dan `npm audit` tanpa `--force` (8 menit)

Paket ini menulis *manifest* dan pekerja latar (*service worker*) saat `npm run build`. Ia paket **pengembang** (`-D`: hanya dipakai saat *build*, tidak ikut ke browser) dengan versi **persis** (`-E`: tanpa `^`). Di terminal folder `frontend`:

```text
npm install -D -E vite-plugin-pwa@2.0.0
```

**Hasilnya (lab penulis, dipotong; waktunya berbeda di mesinmu):**

```text
npm warn deprecated glob@11.1.0: Old versions of glob are not supported, …

added 314 packages, and audited 425 packages in 1m
…
4 low severity vulnerabilities
…
```

`npm warn deprecated` datang dari paket pembantu alat *build*: wajar. Lihat temuannya:

```text
npm audit
```

**Hasilnya (lab penulis, dipotong):**

```text
deepmerge  >=4.2.0
deepmerge mergeObject() allows prototype poisoning of returned objects - https://github.com/advisories/GHSA-gcqx-w48m-w2h4
fix available via `npm audit fix --force`
Will install vite-plugin-pwa@0.2.1, which is a breaking change
…
4 low severity vulnerabilities
```

Keempatnya satu masalah: `deepmerge`, di ujung rantai `vite-plugin-pwa` → `workbox-build` → `@rollup/plugin-node-resolve`. Ia hanya berjalan di laptopmu saat `npm run build`, dan per 29 Okt 2026 belum ada versi perbaikannya. **Jangan** menjalankan `npm audit fix --force`: menurut baris `Will install …` di atas, "perbaikan"-nya memasang 0.2.1 yang kuno dan bisa merusak *build*. Bukti bahwa yang ikut ke browser bersih:

```text
npm audit --omit=dev
```

**Hasilnya** (lab penulis): `found 0 vulnerabilities`.

Di lab penulis, `package.json` kini sama dengan [`kode/frontend/package.json`](kode/frontend/package.json) (`"vite-plugin-pwa": "2.0.0"` di `devDependencies`) kecuali nomor versi (3.4). `node_modules` membesar dari ±245 MB menjadi ±321 MB.

#### 3.2 Ikon aplikasi dan `favicon.svg` rumah (5 menit)

*Manifest* butuh ikon; Chrome meminta ukuran 192 dan 512 px. Penulis membuatnya dari rumah garis Modul 24 dengan Chrome dan Pillow. Gambar tidak bisa ditempel seperti teks: buka setiap berkas di GitHub, klik **Download raw file**, lalu simpan di folder `frontend/public` dengan nama persis sama: [`pwa-64x64.png`](kode/frontend/public/pwa-64x64.png) (787 B), [`pwa-192x192.png`](kode/frontend/public/pwa-192x192.png) (1.587 B), [`pwa-512x512.png`](kode/frontend/public/pwa-512x512.png) (4.067 B), dan [`maskable-icon-512x512.png`](kode/frontend/public/maskable-icon-512x512.png) (2.401 B). Tiga yang pertama = rumah di ubin bersudut bulat; yang terakhir berlatar penuh, supaya peluncur Android boleh memotongnya menjadi lingkaran tanpa memotong rumahnya.

Lalu ikon tab: buka [`kode/frontend/public/favicon.svg`](kode/frontend/public/favicon.svg), klik **Copy raw file**, dan tempel menggantikan isi `frontend/public/favicon.svg` (logo petir Vite hilang). `apple-touch-icon.png` Modul 24 tetap, untuk iPhone. Rupa ikon di HP sungguhan belum dicoba penulis.

#### 3.3 `vite.config.ts`: *manifest*, *service worker*, dan tiga jalur yang selalu ke jaringan (6 menit)

Ganti seluruh isi `frontend/vite.config.ts` dengan berkas ini (ketik, atau [`kode/frontend/vite.config.ts`](kode/frontend/vite.config.ts) → **Copy raw file**), lalu simpan:

```ts
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Modul 27: dashboard bisa DIPASANG sebagai aplikasi di HP dan laptop (PWA). Plugin ini menulis dua berkas saat
    // npm run build: manifest.webmanifest (nama, ikon, warna aplikasi) dan sw.js (service worker = petugas kecil di
    // browser yang menyimpan cangkang dashboard). Browser hanya memakainya di alamat aman: https://... atau localhost.
    // Di npm run dev tidak ada service worker (hanya hasil build yang punya).
    VitePWA({
      // versi baru dashboard dipakai tanpa bertanya: sesudah image web dibangun ulang, browser mengambil sw.js baru dan
      // memakainya di pembukaan berikutnya (lihat README "Aplikasi di HP")
      registerType: 'autoUpdate',
      manifest: {
        name: 'Rumah Pintar Mini',
        // nama pendek di bawah ikon layar utama (sama dengan apple-mobile-web-app-title di index.html)
        short_name: 'Rumah Pintar',
        description: 'Dashboard Rumah Pintar Mini: sensor, kendali, dan riwayat rumahmu',
        lang: 'id',
        // halaman pertama saat ikon diketuk, dan batas alamat yang dianggap "di dalam aplikasi"
        start_url: '/',
        scope: '/',
        // jendela sendiri tanpa bilah alamat, seperti aplikasi biasa
        display: 'standalone',
        // warna layar pembuka (= latar halaman, bg-slate-100) dan warna bilah atas (sama dengan theme-color di index.html)
        background_color: '#f1f5f9',
        theme_color: '#1d293d',
        // ikon di folder public/, dibuat dari favicon.svg (rumah garis yang sama dengan apple-touch-icon.png Modul 24).
        // 192 dan 512 = ukuran yang diminta Chrome untuk tombol Install. "maskable" = versi berlatar penuh yang boleh
        // dipotong peluncur Android menjadi lingkaran atau kotak bulat: gambar rumahnya di tengah, di dalam zona aman.
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // CANGKANG saja yang disimpan service worker: berkas hasil build (HTML, JavaScript, CSS, favicon.svg); ikon di
        // manifest ikut disimpan sendiri oleh plugin. Data rumah (/api/...) dan sambungan live tidak pernah disimpan:
        // selalu diminta ke server, jadi angka di layar tidak pernah basi diam-diam.
        globPatterns: ['**/*.{js,css,html,svg}'],
        // alamat layar seperti /peta atau /perangkat/f00d00000001 dijawab index.html dari simpanan (React Router memilih
        // layarnya), juga saat internet putus: aplikasi tetap terbuka dan menulis pesan bahwa server tidak terjangkau
        navigateFallback: '/index.html',
        // ...KECUALI alamat yang bukan layar dashboard: API (/api), Grafana (/grafana/, Modul 27), dan Socket.IO
        // (/socket.io bila VITE_API_BASE=/). Alamat itu selalu diteruskan ke server, tidak pernah diganti index.html.
        navigateFallbackDenylist: [/^\/api(\/|$)/, /^\/grafana(\/|$)/, /^\/socket\.io(\/|$)/],
      },
    }),
  ],
  // Modul 22: selalu di port 5173 (alamat yang diizinkan CORS_ORIGIN backend).
  // Kalau port itu sedang dipakai, berhenti dengan galat, jangan pindah diam-diam ke 5174.
  server: { port: 5173, strictPort: true },
  // npm run preview (Modul 23 Praktik 8) juga di 5173: port bawaannya (4173) tidak ada di CORS_ORIGIN, jadi login pasti ditolak.
  // Hentikan npm run dev dulu sebelum menjalankan preview.
  preview: { port: 5173, strictPort: true },
})
```

Komentarnya menjelaskan setiap baris. Intinya:

- **`VitePWA({ … })`** = satu-satunya tambahan; `server` dan `preview` (loket 5173, Modul 22–23) tetap.
- **`registerType: 'autoUpdate'`**: pekerja latar baru dipakai tanpa bertanya, tanpa memuat ulang tab yang terbuka (3.7).
- **`manifest`** = kartu nama aplikasi ([Konsep 11](#11-pwa-dari-pintasan-menjadi-aplikasi)); `theme_color` harus sama dengan `theme-color` di `index.html` (3.4).
- **`globPatterns`**: hanya berkas *build* (HTML, JavaScript, CSS, SVG) yang menjadi cangkang; ikon *manifest* ditambahkan plugin. Hasilnya 10 berkas tanpa ganda.
- **`navigateFallback`**: alamat layar seperti `/peta` dijawab `index.html` dari simpanan, juga saat luring.
- **`navigateFallbackDenylist`**: tiga jalur yang **selalu ke jaringan**: `/api` (data, *login*, perintah), `/grafana`, dan `/socket.io`. Di lab penulis, tanpa `/grafana` di sini, browser yang pernah membuka dashboard menjawab `/grafana/` dengan layar dashboard `Halaman tidak ditemukan`. Grafana di alamat yang sama baru dibuka di [7.10](#710-grafana-di-grafana-admin-akun-viewer-dan-dashboard-dari-berkas-5-menit), tetapi pekerja latar dashboard sudah aktif di sana lebih dulu ([🚨](#-kalau-tidak-jalan) *`/grafana/` menampilkan "Halaman tidak ditemukan" milik dashboard*).

`npm run dev` tidak memakai pekerja latar: hanya hasil *build* yang punya.

#### 3.4 `index.html`, pesan luring, *toast* 2 menit, dan versi 1.3.0 (4 menit)

**Copy raw file** dari berkas bernama sama di [`kode/frontend/`](kode/frontend/), atau ketik barisnya:

- **`index.html`**: komentar ikon diperbarui dan satu baris baru di `<head>`, warna bilah atas aplikasi terpasang:

  ```html
      <meta name="theme-color" content="#1d293d" />
  ```

  Tautan *manifest* dan `registerSW.js` ditambahkan plugin ke `dist/index.html` saat *build*.
- **`src/api.ts`**: petunjuk lama saat server tak terjangkau (`localhost:5173`, `CORS_ORIGIN`) menyesatkan di aplikasi yang dibuka dari HP; hasil *build* kini menulis `Tidak bisa menghubungi server. Periksa sambungan internetmu, lalu coba lagi.` (`npm run dev` tetap kalimat lama).
- **`src/components/TombolSakelar.tsx`**: *toast* 504 mengikuti backend 1.4.0 ([2.1](#21-tiga-perubahan-di-src-envts-dan-serverts-mqttts-serta-perintahts-8-menit)): `…: belum dikonfirmasi perangkat; server mencoba lagi bila perangkat terdengar dalam 2 menit.`
- **`Dockerfile`** (komentar; jangan menimpa `LABEL`-mu) dan **`README.md`**.

Lalu nomor versi, di terminal folder `frontend` satu per satu:

```text
npm pkg set version=1.3.0
```

```text
npm install
```

Polanya sama dengan [Modul 26 3.1](../modul-26-docker-compose/README.md#31-frontend-120-tiga-baris-soketts-lalu-lint-build-dan-cek-skema-10-menit): `npm pkg set` diam, `npm install` menyelaraskan versi di `package-lock.json`. Atau salin `package.json` dan `package-lock.json` dari `kode/frontend/`, lalu `npm ci` (lab penulis: `added 424 packages, and audited 425 packages in 54s`).

#### 3.5 ⭐ `npm run build` dengan `PWA v2.0.0`, lalu image web 1.3.0 (7 menit)

Tiga pemeriksaan [Modul 24](../../fase-4-frontend-dashboard/modul-24-kendali-aturan-peran/README.md#101-dashboard-100-lint-build-cek-skema-dan-nomor-versi-15-menit) di terminal folder `frontend`, satu per satu:

```text
npm run lint
```

```text
npm run build
```

```text
npm run cek-skema
```

**Hasilnya (lab penulis, dipotong; tiga perintah berurutan):**

```text
Found 0 warnings and 0 errors.

dist/registerSW.js                  0.13 kB
dist/manifest.webmanifest           0.54 kB
dist/index.html                     1.64 kB │ gzip:   0.85 kB
dist/assets/index-B8JnRmBM.css     37.51 kB │ gzip:  11.61 kB
dist/assets/index-D9JzMwfH.js   1,047.76 kB │ gzip: 312.09 kB

[plugin builtin:vite-reporter]
(!) Some chunks are larger than 500 kB after minification. Consider:
…
✓ built in 5.67s

PWA v2.0.0
mode      generateSW
precache  10 entries (1062.29 KiB)
files generated
  dist/sw.js
  dist/workbox-9c191d2f.js

SAMA  src/skema/kontrak.ts
SAMA  src/skema/aturan-dasar.ts
```

Patokannya: *lint* bersih; *build* lolos dengan peringatan ukuran lama (sejak Modul 23) lalu bagian `PWA v2.0.0` (cangkang 10 berkas, ±1 MB); dua `SAMA`. Nama ber-*hash* dan angkamu berbeda. Lalu image web, di terminal **akar proyek**:

```text
docker compose up -d --build web
```

**Hasilnya (lab penulis):**

```text
[+] Building 64.1s (17/17) FINISHED
[+] Running 2/2
 ✔ ghcr.io/<akun>/rumah-pintar-mini-web:1.3.0  Built                                                       0.0s
 ✔ Container rumahpintar-web-1                 Started                                                     3.3s
```

64 detik karena `npm ci` dalam *build* sudah ada di *cache* mesin penulis; dari nol ±2 menit di Raspberry Pi 5 penulis. Image tetap 90,4 MB. Loket 443 terpakai? [🚨](#-kalau-tidak-jalan). Kini `docker compose up -d` tanpa nama layanan aman lagi ([2.3](#23-composecloudyml-modul-27-dan-blok-di-internet-di-env-laptop-4-menit)). Simpan ke Git dari akar proyek (`node_modules` dan `dist` diabaikan sejak Modul 22):

```text
git add frontend
```

```text
git commit -m "Dashboard 1.3.0: aplikasi terpasang (PWA)"
```

**Kamu lulus langkah ⭐ ini** kalau `npm run build` ditutup `PWA v2.0.0` dengan `precache  10 entries`, dan `up -d --build web` menulis `…-web:1.3.0  Built` dan `Started`.

#### 3.6 ⭐ *Manifest*, *service worker*, dan pasang dashboard dari `http://localhost` (7 menit)

Buka **Chrome** di `http://localhost`, persis alamat ini (konteks aman hanya `https://` atau `localhost`; IP LAN tidak). Masuk dengan akun admin, tekan **F12**, lalu tab **Application**:

1. **Manifest**: tanpa galat; `Rumah Pintar Mini`, nama pendek `Rumah Pintar`, `standalone`, alamat awal `/`, empat ikon.
2. **Service workers**: `sw.js` berstatus `activated`.

**Hasilnya (lab penulis, 22.38 WIB),** dibaca lewat protokol DevTools karena Chrome tanpa layar tidak menampilkan DevTools: `isSecureContext: true`; *service worker* `activated` di `http://localhost/sw.js`, langsung mengendalikan halaman; *manifest* `errors: []`, `standalone`, `start_url /`, `theme_color #1d293d`, 4 ikon (64, 192, 512, 512 `maskable`); daftar galat pemasangan **`[]`** (boleh dipasang). Sesudah masuk: **Live**, *cookie* `akses` dan `sesi` tanpa `Secure`, benar untuk `http://` (bukti `Secure` di [7.8](#78--gembok-di-httpsiotnamaandamyid-308-login-dan-cookie-secure-6-menit)).

Cek `sw.js`: klik namanya di **Service workers**, atau `curl -sI http://localhost/sw.js` (Windows: `curl.exe`, tidak diuji; lab penulis: `200`, `text/javascript`, `no-cache`). Jangan mengetiknya di bilah alamat: sesudah pekerja latar aktif, dashboard menjawabnya `Halaman tidak ditemukan` (lab penulis).

Lalu **pasang**: tombol pemasangan di bilah alamat, atau menu ⋮ → pilihan pemasangan aplikasi (namanya berbeda per versi dan bahasa). Dashboard terbuka di jendela sendiri tanpa bilah alamat, dengan ikon rumah. Bagian ini tidak direkam penulis: Chrome tanpa layar tidak bisa memasang aplikasi, jadi buktinya hanya daftar galat yang kosong. Tidak ditawari? [🚨](#-kalau-tidak-jalan) *Tawaran pemasangan aplikasi tidak muncul*. Aplikasi `localhost` ini latihan; aplikasi sehari-hari dipasang dari `https://` di HP ([12.1](#121--android-pasang-dashboard-dari-chrome-8-menit)).

**Kamu lulus langkah ⭐ ini** kalau **Manifest** tanpa galat, **Service workers** menulis `activated`, dan dashboard terbuka di jendela sendiri dari ikon yang terpasang.

#### 3.7 Luring: cangkang dashboard tetap terbuka, lalu jebakan `npm run preview` (3 menit)

Masih di `http://localhost` dengan DevTools terbuka: tab **Network** → ubah pilihan pembatas jaringan di baris atasnya menjadi **Offline** → muat ulang (**F5**). Tanpa pekerja latar (1.2.0), yang tampil halaman galat browser.

**Hasilnya (lab penulis):** halaman dijawab pekerja latar dari simpanan: layar **Masuk** dengan kotak abu-abu `Tidak bisa menghubungi server. Periksa sambungan internetmu, lalu coba lagi.` Cangkangnya ada, angkanya tidak: `/api` tidak pernah disimpan.

![Komposit dua tangkapan layar asli dashboard Rumah Pintar Mini 1.3.0 (PWA, vite-plugin-pwa 2.0.0) di http://localhost, Chrome 156 di Linux, laptop 1280 piksel, dipotong ke kartu Masuk di tengah layar; image web yang sama dinyalakan sendirian di lab. Kiri, daring: kartu Rumah Pintar Mini, Masuk dengan akun Modul 20 untuk melihat dashboard (nomor 1), kolom Email dengan contoh viewer@rumah.test, Sandi, tombol hijau Masuk; service worker sw.js sudah activated dan mengendalikan halaman. Kanan, luring sesudah muat ulang (Offline seperti di DevTools Network; DevTools tidak tampak): kartu yang sama tetap tampil dari service worker (nomor 2), bukan halaman dinosaurus, dengan kotak abu-abu Tidak bisa menghubungi server. Periksa sambungan internetmu, lalu coba lagi. (nomor 3); tombol Masuk (nomor 4) tetap butuh jaringan karena /api dan Socket.IO tidak pernah disimpan. Legenda bernomor di bawah.](aset/pwa-cangkang-luring.png)

Gambar dari lab penulis: image web 1.3.0 yang sama di `http://localhost`, Chrome tanpa layar. Kembalikan pilihan pembatas ke semula, lalu muat ulang: *cookie* login masih berlaku, jadi dashboard langsung kembali dengan lencana **Live**.

**Versi baru tampil pada pembukaan berikutnya.** Sesudah image web dibangun ulang, browser mengambil versi baru di belakang layar (biasanya beberapa detik) dan memakainya pada pembukaan atau muat ulang berikutnya. Lab penulis: muat ulang pertama masih versi lama, delapan detik kemudian tab tetap tidak memuat ulang sendiri, muat ulang kedua versi baru. Isian formulir aman ([🚨](#-kalau-tidak-jalan) *Versi lama dashboard terus tampil di HP atau browser*).

**Jebakan `npm run preview`.** `preview` dan `npm run dev` sama-sama di `http://localhost:5173`. *Build* yang disajikan `preview` memasang pekerja latar di sana, dan `npm run dev` sesudahnya tetap menampilkan dashboard lama dari simpanan: perubahan kodemu seolah tidak tampil (lab penulis). Obatnya: DevTools → **Application** → **Storage** → **Clear site data**, lalu muat ulang; *cookie* login di alamat itu ikut terhapus ([🚨](#-kalau-tidak-jalan) *`npm run dev` menampilkan dashboard lama*). Pekerja latar dari `http://localhost` (loket 80) tidak mengganggu `npm run dev`: beda loket, beda alamat.

> ⬆️ **Selesai Praktik 3?** Baca [Konsep 9](#9-jembatan-simpan-teruskan-siapa-menahan-apa), lalu lanjut ke [Praktik 4](#praktik-4--simpan-teruskan-di-rumah-dulu-jembatan-lan-dan-latihan-putus-10-menit-30-menit): jembatan yang menahan data saat pusat tak terjangkau, dicoba di rumah dulu.

### Praktik 4 — Simpan-teruskan di rumah dulu: jembatan LAN dan latihan putus 10 menit (30 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** di laptop dengan terminal di **akar proyek** (Git dan `docker compose` pusat); **terminal SSH ke Pi**, folder `rumah-pintar-mini/edge`; **Chrome** atau **Edge** (`http://localhost`); pengelola sandimu (sandi `jembatan-pi` dan `pemantau`). Node 1 menyala dan masuk ke gerbang Pi. Konsep yang dipakai: 9.
>
> ⭐ **Wajib** — langkah 4.3, 4.4, dan 4.5: kabar jembatan `state 1`, putus 10 menit yang menurut `skrip/cek-susulan.sql` tanpa celah dan tanpa dobel, dan perintah lampu saat putus yang tidak dikerjakan belakangan.

Jembatan LAN Modul 26 (gerbang Pi → pusat di laptop) kini memakai setelan simpan-teruskan [Konsep 9](#9-jembatan-simpan-teruskan-siapa-menahan-apa), tetap polos karena tidak keluar rumah; berkas yang sama naik ke VPS di [Praktik 9](#praktik-9--jalur-utama-jembatan-pi--vps-lewat-tls-35-menit). Putus 10 menit di 4.4 = latihan T3, dan bagi jalur gratis **T3-gratis (b)**.

> 🔀 **Tanpa Pi:** gerbang di laptop yang sama ([pola Modul 26 6.7](../modul-26-docker-compose/README.md#67-jalur-laptop-pengganti-l4-lalu-gerbang-di-laptop-yang-sama-525-menit)): perintah "Pi" diketik di terminal kedua, folder `edge` laptop, tanpa `git fetch`/`git switch`. `edge/.env`: `ALAMAT_PUSAT=host-gateway`, `PORT_GERBANG=1884`; `.env` akar: `ALAMAT_MQTT=0.0.0.0` (1.4). Sunting `jembatan/pusat.conf` di VS Code (`cp`, `chmod`, `diff` = Linux/macOS; Windows `copy`). Akun simulator gerbang: langkah 4 Modul 26 6.7, lalu `docker compose up -d`; simulator ke `mqtt://127.0.0.1:1884`; 4.4 memakai varian pengganti. Belum diuji penulis.

#### 4.1 `edge/gerbang.conf`: empat baris penahan antrean, lalu *push* cabang (6 menit)

Pi mengambil berkasnya dari GitHub, jadi semuanya ditulis di laptop dulu. Ganti isi `edge/gerbang.conf` dengan berkas ini (**Copy raw file** dari [`kode/edge/gerbang.conf`](kode/edge/gerbang.conf)):

```text
# gerbang.conf - broker GERBANG Rumah Pintar Mini di Raspberry Pi, di dalam kontainer (Modul 26-27, edge/compose.edge.yml).
# Menggantikan paket Mosquitto apt + /etc/mosquitto/conf.d/gateway-pi.conf (Modul 12 dan 21). Perangkat tetap menyambung ke
# IP Pi port 1883 dengan akun lamanya, jadi firmware tidak berubah. Jalur di bawah = jalur DI DALAM kontainer.
# Sesudah mengubah berkas ini, acl-broker, atau jembatan/pusat.conf: docker compose restart mosquitto (restart, bukan reload).
listener 1883
# tanpa nama pengguna dan sandi yang terdaftar, tidak boleh masuk (Modul 21)
allow_anonymous false
# berkas sandi tinggal di lemari data-broker; berkas lama Pi (/etc/mosquitto/sandi-broker, format 2.0) dibaca Mosquitto 2.1.2
password_file /mosquitto/data/sandi-broker
acl_file /mosquitto/config/acl-broker
# nama klien selalu = nama pengguna (device_id): tidak ada yang bisa menyamar atau menendang perangkat lain
use_username_as_clientid true
# pesan retained dan sesi disimpan di lemari (sama dengan Mosquitto apt di Pi yang menyimpannya saat dimatikan)
persistence true
persistence_location /mosquitto/data/
# Modul 27 (simpan-teruskan): saat jembatan ke pusat putus (internet rumah mati), pesan perangkat untuk jembatan DITAHAN di
# antrean gerbang, lalu dikirim belakangan dengan ts aslinya. Empat baris berikut berlaku untuk seluruh broker gerbang.
# Isi antrean ditulis ke lemari setiap 30 detik (bawaan 1800 = 30 menit): listrik padam se-rumah tidak menghapus antrean
# yang lebih tua dari 30 detik. Harganya: satu kali tulis kartu microSD dan satu baris log setiap 30 detik.
autosave_interval 30
# firmware menerbitkan pesan dengan QoS 0; tanpa baris ini pesan QoS 0 untuk jembatan yang putus dibuang, tidak diantre
queue_qos0_messages true
# batas antrean per klien (jembatan = satu klien). Bawaan 1000 = sekitar 1,5 jam untuk dua perangkat; 100000 = berhari-hari
max_queued_messages 100000
# pesan QoS 0 diteruskan ke jembatan sebagai QoS 1 (dijawab pusat, dikirim ulang bila tak dijawab). Tanpa ini, pesan yang
# terkirim di "jendela buta" (internet sudah putus, gerbang belum sadar, bisa sampai 2 menit) hilang. Opsi tidak baku
# Mosquitto, berlaku untuk semua pelanggan broker ini.
upgrade_outgoing_qos true
# log ke layar kontainer: dibaca dengan docker compose logs mosquitto (dibatasi 3 x 10 MB oleh compose.edge.yml)
log_dest stdout
log_type error
log_type warning
log_type notice
log_type information
# hapus # di depan baris berikut untuk melihat juga pesan yang DITOLAK daftar izin (Denied PUBLISH, Modul 21);
# akibatnya log jauh lebih ramai
# log_type debug
# jembatan ke broker pusat: setiap berkas .conf di folder ini dibaca (edge/jembatan/pusat.conf, berisi sandi, tidak ikut Git)
include_dir /mosquitto/config/jembatan
```

Yang baru hanya empat baris di tengah, dari `autosave_interval 30` sampai `upgrade_outgoing_qos true`; alasannya di komentarnya dan di Konsep 9. Dengan cara yang sama, ganti enam berkas `edge/` lain dan tambahkan satu yang baru:

- [`jembatan.contoh.conf`](kode/edge/jembatan.contoh.conf) (dibaca di 4.2), [`acl-broker`](kode/edge/acl-broker) (baris `$SYS` di blok 7), [`compose.edge.yml`](kode/edge/compose.edge.yml), [`.env.example`](kode/edge/.env.example), [`README.md`](kode/edge/README.md), dan [`pusat.conf`](kode/edge/pusat.conf) (hanya komentar);
- [`pusat-internet.conf`](kode/edge/pusat-internet.conf), berkas baru untuk broker VPS di [Praktik 8](#praktik-8--jalur-utama-pintu-mqtt-8883-dengan-tls-35-menit).

Semua perubahannya: [`kode/edge.diff`](kode/edge.diff). Kemudian tulis lagi device_id-mu di blok 2 `acl-broker` (tanpanya gerbang menolak data Node 2) dan buka lagi blok 2b bila dulu terbuka. Lalu simpan ke cabang dan *push* untuk pertama kali, satu per satu:

```text
git add edge
git commit -m "Gerbang: simpan-teruskan dan contoh jembatan Modul 27"
```

```text
git push -u origin fitur/ke-internet
```

Lalu di terminal SSH ke Pi, folder `rumah-pintar-mini/edge`, satu per satu:

```text
git fetch
```

```text
git switch fitur/ke-internet
```

**Hasilnya** (lab penulis, perintah terakhir): `Switched to a new branch 'fitur/ke-internet'`. Ditolak dengan `error: Your local changes to the following files would be overwritten by checkout:`, `edge/acl-broker`, dan `Aborting`? Berkas itu pernah disunting langsung di Pi (lab: blok 2b dibuka). Jalankan `git stash`, `git switch fitur/ke-internet`, lalu `git stash pop`: suntinganmu digabung otomatis (lab: `Auto-merging edge/acl-broker`, 2b tetap terbuka).

#### 4.2 Jembatan LAN dengan setelan Modul 27: sesi pusat bersih, antrean di Pi tetap (7 menit)

Contoh jembatan Modul 27 (kini juga di Pi):

```text
# jembatan.contoh.conf - CONTOH jembatan (bridge) dari broker gerbang Pi ke broker pusat (Modul 26-27).
# Salin menjadi edge/jembatan/pusat.conf (cp jembatan.contoh.conf jembatan/pusat.conf), lalu ganti nama domain dan sandinya.
# Salinan itu berisi sandi, jadi tidak ikut Git. Sesudah mengubahnya: docker compose restart mosquitto (dari folder edge).
# Catatan Mosquitto: tanda # hanya boleh di AWAL baris (catatan di belakang setelan ikut terbaca sebagai isi setelan).
connection pusat

# --- Ke mana jembatan menyambung: pilih SATU dari dua blok ---
# JALUR UTAMA (Modul 27, pusat di VPS): nama broker di internet + pintu TLS 8883. Tulis NAMA, bukan alamat IP: nama inilah
# yang tertulis di sertifikat, jadi IP atau nama lain ditolak pemeriksaan sertifikat (certificate verify failed).
address mqtt.namaanda.my.id:8883
# akar CA yang dipercaya untuk sertifikat broker VPS: ISRG Root X1, akar Let's Encrypt. Berkasnya sudah ada di dalam image
# Mosquitto (bukan unduhan). Jangan bridge_insecure: tanpa pemeriksaan, siapa pun yang menyamar sebagai VPS diterima.
bridge_cafile /etc/ssl/certs/ca-cert-ISRG_Root_X1.pem
# JALUR RUMAH (Modul 26: pusat di laptop; Modul 27 jalur gratis: pusat di Pi yang sama, PORT_MQTT 1884): polos tanpa TLS,
# karena tidak keluar dari jaringan rumah. Beri # di depan dua baris JALUR UTAMA di atas, lalu hapus # di depan baris ini.
# "pusat" = nama yang diarahkan compose.edge.yml ke ALAMAT_PUSAT di edge/.env; angkanya = loket PORT_MQTT broker pusat
# (laptop 1883, Pi jalur gratis 1884).
# address pusat:1883

# --- Akun di broker PUSAT ---
# nama klien jembatan dibuat tetap. Bawaannya memuat nama kontainer, yang berganti setiap kontainer dibuat ulang.
remote_clientid jembatan-pi
# akun jembatan-pi di broker PUSAT (dibuat dengan mosquitto_passwd di kontainer pusat; izinnya blok 7 di acl-broker)
remote_username jembatan-pi
remote_password ganti-dengan-sandi-akun-jembatan-pi

# --- Simpan-teruskan (Modul 27; pasangannya empat baris di gerbang.conf) ---
# Sesi di PUSAT bersih: perintah (cmd) yang dikirim saat jembatan putus TIDAK disimpan pusat untuk dikirim belakangan
# (dashboard sudah melaporkannya gagal; lampu yang tiba-tiba menyala menit kemudian berbahaya). Sesi di GERBANG tetap:
# pesan perangkat untuk pusat ditahan di antrean gerbang selama jembatan putus, lalu dikirim saat tersambung lagi.
# Ringkasnya: naik disimpan di Pi, turun tidak disimpan.
cleansession true
local_cleansession false
# kabar jembatan untuk pusat: 1 = tersambung, 0 = putus (topik $SYS/broker/connection/jembatan-pi/state, butuh izin di
# acl-broker blok 7)
notifications true

# --- Topik: pesan perangkat naik ke pusat (out), perintah dari backend turun ke perangkat (in), QoS 1 ---
# Hanya yang perlu, bukan "topic # out 1": pesan lain di broker gerbang (misalnya Node-RED) tetap di rumah.
topic rpm/+/telemetry out 1
topic rpm/+/status out 1
topic rpm/+/vitals out 1
topic rpm/+/ack out 1
topic rpm/+/cmd in 1
```

Di contoh, yang aktif blok JALUR UTAMA (VPS, TLS); di rumah dipakai JALUR RUMAH. Sisanya dibahas Konsep 9: `cleansession true` + `local_cleansession false` (naik disimpan di Pi, turun tidak disimpan), `notifications true` (kabar jembatan), dan topik sempit.

**(a) Laptop, akar proyek.** Akun `pemantau` (4.3–4.4) harus ada di KEDUA broker: biasanya sudah sejak Modul 21 (Pi) dan Modul 26 5.5 (laptop), tetapi gerbang lab penulis belum punya. Ragu? Tulis ulang dengan sandi yang sama (entri `akun broker pemantau`), dua kali saat ditanya:

```text
docker compose exec -u mosquitto mosquitto mosquitto_passwd /mosquitto/data/sandi-broker pemantau
```

**Hasilnya** (lab penulis, akun baru): `Adding password for user pemantau`. `acl-broker` baru dibaca broker PUSAT juga (baris `$SYS` blok 7), jadi broker laptop di-*restart* ([Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#44-jalur-perangkat-kunci-pintunya-lalu-restart-10-menit): *restart*, bukan *reload*):

```text
docker compose restart mosquitto
```

**Hasilnya** (lab penulis): `✔ Container rumahpintar-mosquitto-1  Started  1.2s`.

**(b) Pi, folder `edge`.** Ganti `jembatan/pusat.conf` Modul 26 dengan salinan contoh baru:

```text
cp jembatan.contoh.conf jembatan/pusat.conf
```

Buka dengan `nano jembatan/pusat.conf`. Beri `# ` di depan dua baris JALUR UTAMA (`address mqtt.namaanda.my.id:8883` dan `bridge_cafile …`), hapus `# ` di depan `address pusat:1883`, lalu ganti `ganti-dengan-sandi-akun-jembatan-pi` dengan sandi `jembatan-pi` laptop ([Modul 26 6.2](../modul-26-docker-compose/README.md#62-laptop-berkas-gerbang-di-edge-akun-jembatan-pi-lalu-push-cabang-5-menit)). Simpan (**Ctrl + O**, **Enter**, **Ctrl + X**), jalankan `chmod 600 jembatan/pusat.conf`, lalu periksa:

```text
diff jembatan.contoh.conf jembatan/pusat.conf
```

**Hasilnya** (lab penulis; di layarmu sandinya tampil: jangan ditempel ke mana pun):

```text
10c10
< address mqtt.namaanda.my.id:8883
---
> # address mqtt.namaanda.my.id:8883
13c13
< bridge_cafile /etc/ssl/certs/ca-cert-ISRG_Root_X1.pem
---
> # bridge_cafile /etc/ssl/certs/ca-cert-ISRG_Root_X1.pem
18c18
< # address pusat:1883
---
> address pusat:1883
25c25
< remote_password ganti-dengan-sandi-akun-jembatan-pi
---
> remote_password <sandi jembatan-pi laptop>
```

Tepat empat tempat; `edge/.env` (`ALAMAT_PUSAT` = IP laptop) tetap. Akun `pemantau` gerbang: perintah (a), diketik di sini. `compose.edge.yml` ikut berubah, jadi gerbang dibuat ulang (`restart` tidak membaca berkas Compose baru; HUP tidak dipakai di gerbang, Konsep 9):

```text
docker compose up -d --force-recreate mosquitto
```

**Hasilnya** (lab penulis): `✔ Container rumahpintar-gerbang-mosquitto-1  Started  2.4s`. Lalu `docker compose logs mosquitto`. **Hasilnya** (lab penulis, dipotong):

```text
mosquitto-1  | 1793288520: Connecting bridge pusat (pusat:1883)
mosquitto-1  | 1793288523: New client connected from 172.20.0.1:41924 as f00d00000001 (p4, c1, k15, u'f00d00000001').
```

Di laptop, akar proyek: `docker compose logs --since 15m mosquitto`, lalu cari `bridge` dengan **Ctrl + F**. **Hasilnya** (lab penulis, dipotong):

```text
mosquitto-1  | 1793288513: New bridge connected from 172.19.0.1:40448 as jembatan-pi (p4, c0, k60, u'jembatan-pi').
mosquitto-1  | 1793288520: New bridge connected from 172.19.0.1:40462 as jembatan-pi (p4, c1, k60, u'jembatan-pi').
```

Baris pertama: jembatan lama (`c0`, setelan Modul 26) masuk lagi sesudah *restart* (a); baris kedua: gerbang baru dengan **`c1`** = sesi pusat bersih. Di rumahmu, alamat sesudah `from` = IP Node 1 (log Pi) dan IP Pi (log laptop); lab: lorong Docker. `… session taken over.` di antaranya dan peringatan `… world readable permissions …` (sejak Modul 26) wajar. Node 1 lepas sebentar saat gerbang dibuat ulang (lab: ±3 detik), jadi satu-dua bacaan menit itu boleh hilang. Tanpa `c1`? [🚨](#-kalau-tidak-jalan) *Jembatan `not authorised` …*.

#### 4.3 ⭐ Kabar jembatan `state 1` dengan akun `pemantau` (3 menit)

Di laptop, akar proyek, ganti `<sandi>` dengan sandi `pemantau` (tertinggal di riwayat terminal; boleh untuk akun hanya-baca ini):

```text
docker compose exec mosquitto mosquitto_sub -u pemantau -P <sandi> -t '$SYS/broker/connection/jembatan-pi/state' -v -C 1
```

**Hasilnya** (lab penulis):

```text
$SYS/broker/connection/jembatan-pi/state 1
```

`1` = tersambung, `0` = putus. Diam terus? **Ctrl + C**, lalu [🚨](#-kalau-tidak-jalan) *Kabar `jembatan-pi/state` tidak pernah tiba*. `Connection error: Connection Refused: not authorised` = akun `pemantau` belum ada di broker itu (4.2 (a)).

Lalu di Pi, folder `edge`, intip isi antrean gerbang sebelum putus:

```text
docker compose exec mosquitto mosquitto_sub -u pemantau -P <sandi> -t '$SYS/broker/store/messages/count' -v -C 1
```

Lab penulis: 59, hampir semuanya pesan *retained* yang selalu ada (Konsep 9); yang penting nanti kenaikannya.

**Kamu lulus langkah ⭐ ini** kalau broker pusat menjawab `$SYS/broker/connection/jembatan-pi/state 1`.

#### 4.4 ⭐ Putus 10 menit di LAN, lalu `skrip/cek-susulan.sql`: tanpa celah, tanpa dobel (11 menit)

**Sebelum memutus** (saat putus, laptopmu bisa tanpa internet), buat `skrip/cek-susulan.sql` lewat **Copy raw file** dari [`kode/skrip/cek-susulan.sql`](kode/skrip/cek-susulan.sql); kepalanya dibaca sambil menunggu:

```sql
-- cek-susulan.sql - bukti uji "cabut internet rumah 10 menit" Rumah Pintar Mini (Modul 27): apakah bacaan SATU perangkat
-- selama internet putus ada di database pusat (VPS, atau Pi jalur gratis) dengan waktu kejadian (ts) aslinya, tanpa celah
-- dan tanpa baris kembar. Bacaan susulan = tiba (kolom diterima) lebih dari 60 detik sesudah waktu kejadiannya.
--
-- Jalankan dari akar proyek di mesin PUSAT, kira-kira satu menit sesudah internet tersambung lagi. Tiga isian (psql -v):
--   perangkat = device_id, misalnya a4cf12e5b7c0;  mulai, selesai = jam WIB sedikit sebelum putus dan sesudah sambung
--   Linux, macOS, VPS, Pi (bash/zsh; satu baris):
--     docker compose exec -T db psql -U postgres -d rumahpintar -v perangkat=a4cf12e5b7c0 -v "mulai=2026-10-29 10:00" -v "selesai=2026-10-29 10:20" < skrip/cek-susulan.sql
--   PowerShell (Windows; tidak diuji penulis): Get-Content skrip/cek-susulan.sql | docker compose exec -T db psql ... (isian sama)
--
-- Lulus bila: celah_terbesar paling lama sekitar 10 detik (Node 1 mengirim tiap 10 detik, ditambah kiriman segera saat
-- keadaan berganti), celah_lebih_12_detik = 0, kembar = 0, dan tiba_susulan > 0 (bukti bacaan itu memang datang belakangan).
-- Tabel per menit menunjukkan menit-menit saat putus tetap berisi bacaan.
\set ON_ERROR_STOP on
\if :{?perangkat}
\else
  \echo 'isi perangkat, mulai, dan selesai: psql ... -v perangkat=<device_id> -v "mulai=YYYY-MM-DD HH:MM" -v "selesai=YYYY-MM-DD HH:MM"'
  \quit
\endif
\if :{?mulai}
\else
  \echo 'mulai belum diisi: -v "mulai=YYYY-MM-DD HH:MM" (jam WIB)'
  \quit
\endif
\if :{?selesai}
\else
  \echo 'selesai belum diisi: -v "selesai=YYYY-MM-DD HH:MM" (jam WIB)'
  \quit
\endif
-- jam yang diketik dan jam yang ditampilkan = WIB (jam di database selalu disimpan dalam UTC); QUIET = tanpa baris "SET"
\set QUIET on
SET TIME ZONE 'Asia/Jakarta';
\set QUIET off

\echo '== Ringkasan (jam WIB) =='
WITH b AS (
  SELECT ts, diterima, ts - lag(ts) OVER (ORDER BY ts) AS jeda
  FROM readings
  WHERE device_id = :'perangkat' AND ts >= :'mulai' AND ts < :'selesai'
)
SELECT count(*) AS bacaan,
       to_char(min(ts), 'HH24:MI:SS') AS pertama,
       to_char(max(ts), 'HH24:MI:SS') AS terakhir,
       max(jeda) AS celah_terbesar,
       count(*) FILTER (WHERE jeda > interval '12 seconds') AS celah_lebih_12_detik,
       count(*) FILTER (WHERE diterima - ts > interval '60 seconds') AS tiba_susulan,
       (SELECT count(*) FROM (SELECT 1 FROM readings
          WHERE device_id = :'perangkat' AND ts >= :'mulai' AND ts < :'selesai'
          GROUP BY device_id, ts HAVING count(*) > 1) AS k) AS kembar
FROM b;

\echo '== Per menit: jumlah bacaan dan yang tiba belakangan (susulan) =='
SELECT to_char(date_trunc('minute', ts), 'HH24:MI') AS menit,
       count(*) AS bacaan,
       count(*) FILTER (WHERE diterima - ts > interval '60 seconds') AS susulan,
       to_char(max(diterima), 'HH24:MI:SS') AS tiba_terakhir
FROM readings
WHERE device_id = :'perangkat' AND ts >= :'mulai' AND ts < :'selesai'
GROUP BY 1
ORDER BY 1;

\echo '== Celah lebih dari 12 detik (kosong = tidak ada bacaan yang hilang) =='
WITH b AS (
  SELECT ts, ts - lag(ts) OVER (ORDER BY ts) AS jeda
  FROM readings
  WHERE device_id = :'perangkat' AND ts >= :'mulai' AND ts < :'selesai'
)
SELECT to_char(ts - jeda, 'HH24:MI:SS') AS dari, to_char(ts, 'HH24:MI:SS') AS sampai, jeda
FROM b
WHERE jeda > interval '12 seconds'
ORDER BY ts;
```

Salin juga [`.gitattributes`](kode/.gitattributes) ke akar proyek (+ `*.sql text eol=lf`); di Windows, bila bilah status VS Code menulis `CRLF`, klik lalu pilih `LF` (CRLF tidak diuji penulis). Baca juga 4.5: tombolnya ditekan di tengah putus.

**Putuskan jalan Pi → pusat 10 menit**, dan catat jam putus serta sambungnya (WIB):

- **Kit B:** matikan WiFi laptop (laptop berkabel: cabut kabelnya). Gerbang tidak diberi tahu, persis seperti internet putus, jadi jendela buta ikut teruji. SSH ke Pi ikut putus; dashboard `http://localhost` tetap terbuka. Tidak direkam penulis (satu mesin memerankan laptop dan Pi). Sesudah WiFi kembali, IP laptop harus sama (alamat tetap di router, Modul 26 6.3).
- **Pengganti** (tanpa Pi, atau Node 1 diperankan simulator di laptop): di akar proyek laptop `docker compose stop mosquitto`, 10 menit kemudian `docker compose start mosquitto` (`akun-broker` dan `sertifikat-mqtt` ikut jalan: `Exited` wajar). Broker yang mati menolak sambungan seketika, jadi jendela buta TIDAK teruji (itu bagian [Praktik 10](#praktik-10--uji-cabut-internet-rumah-10-menit-30-menit)); antrean tetap selamat berkat sesi tetap backend ([2.1](#21-tiga-perubahan-di-src-envts-dan-serverts-mqttts-serta-perintahts-8-menit)). Selama putus, perintah antrean 4.3 di gerbang menunjukkan angka yang naik ±6 per menit (lab penulis, menit ketiga: `$SYS/broker/store/messages/count 77`).

Sesudah sambung, jembatan mencoba lagi paling lama tiap 30 detik (lab, pengganti: masuk 24 detik sesudah `start`). 🔴 lalu ✅ "Node diam" dari Grafana di Telegram selama latihan ini wajar (Praktik 10).

±1 menit sesudah sambung, di akar proyek laptop (satu baris; `<device_id>` = Node 1, atau `f00d00000001` bila simulator; `mulai` dan `selesai` = jam WIB sedikit sebelum putus dan sesudah sambung):

```text
docker compose exec -T db psql -U postgres -d rumahpintar -v perangkat=<device_id> -v "mulai=YYYY-MM-DD HH:MM" -v "selesai=YYYY-MM-DD HH:MM" < skrip/cek-susulan.sql
```

PowerShell (tidak diuji penulis): `Get-Content skrip/cek-susulan.sql | docker compose exec -T db psql …` dengan isian yang sama.

**Hasilnya** (lab penulis, varian pengganti yang dipendekkan menjadi 3 menit, 22.43–22.46 WIB):

```text
== Ringkasan (jam WIB) ==
 bacaan | pertama  | terakhir | celah_terbesar | celah_lebih_12_detik | tiba_susulan | kembar
--------+----------+----------+----------------+----------------------+--------------+--------
     40 | 22:41:03 | 22:47:53 | 00:00:30       |                    1 |           15 |      0
(1 row)

== Per menit: jumlah bacaan dan yang tiba belakangan (susulan) ==
 menit | bacaan | susulan | tiba_terakhir
-------+--------+---------+---------------
 22:41 |      5 |       0 | 22:41:43
 22:42 |      5 |       0 | 22:42:53
 22:43 |      6 |       3 | 22:46:58
 22:44 |      6 |       6 | 22:46:58
 22:45 |      6 |       6 | 22:46:58
 22:46 |      6 |       0 | 22:46:58
 22:47 |      6 |       0 | 22:47:53
(7 rows)

== Celah lebih dari 12 detik (kosong = tidak ada bacaan yang hilang) ==
   dari   |  sampai  |   jeda
----------+----------+----------
 22:41:43 | 22:42:13 | 00:00:30
(1 row)
```

Cara membacanya:

- Menit putus (22:43–22:46) tetap berisi **6 bacaan** (irama 10 detik Node 1); antrean tiba 22:46:58. Kolom `susulan` hanya menghitung yang tiba lebih dari 60 detik sesudah `ts`-nya, jadi menit 22:46 `0`.
- Satu-satunya celah (30 detik, 22:41) terjadi **sebelum** putus, saat 4.2 me-*restart* pusat dan membuat ulang gerbang. Pilih `mulai` sesudah 4.2.
- `kembar` selalu 0 karena kunci `(device_id, ts)` (Konsep 9), jadi bukan temuan tersendiri.
- Isian kurang? Skrip berhenti dengan `isi perangkat, mulai, dan selesai: …`.

Simpan ke cabang:

```text
git add skrip .gitattributes
git commit -m "skrip/cek-susulan.sql untuk uji putus"
```

Skrip yang sama membuktikan T3 di [10.5](#105--t3-skripcek-susulansql-di-vps-tanpa-celah-dan-tanpa-dobel-8-menit) (VPS) dan [11.9](#119--t3-gratis-internet-rumah-putus-10-menit-riwayat-pi-tetap-utuh-15-menit) (Pi jalur gratis).

**Kamu lulus langkah ⭐ ini** kalau putus 10 menitmu menghasilkan `celah_lebih_12_detik 0`, daftar celah `(0 rows)`, ±6 bacaan per menit di menit-menit putus, dan `tiba_susulan` lebih dari 0. Jalur gratis: simpan keluarannya sebagai bukti T3-gratis (b).

#### 4.5 ⭐ Perintah lampu saat putus: naik disimpan, turun tidak disimpan (3 menit)

Kerjakan di menit ke-2 atau ke-3 putus 4.4, supaya saat sambung sudah lewat lebih dari 2 menit. Di dashboard `http://localhost`, buka Node 1 yang lampunya **Mati**, lalu klik **Lampu**. Kit B: tombol menulis `Menunggu konfirmasi perangkat…`, lalu muncul *toast* dari [3.4](#34-indexhtml-pesan-luring-toast-2-menit-dan-versi-130-4-menit):

```text
Lampu: belum dikonfirmasi perangkat; server mencoba lagi bila perangkat terdengar dalam 2 menit.
```

Sesudah sambung dan susulan tiba, di akar proyek laptop: `docker compose logs backend`. **Hasilnya** (lab penulis, uji putus internet tiruan Praktik 10, kode yang sama; dipotong):

```text
[23:08:57] WARN: perintah c-20261029-160852-3 (api) ke f00d00000001: tidak ada ack dalam 5 detik
[23:18:12] INFO: perintah lampu = true (api) ke f00d00000001 tidak dikerjakan lebih dari 2 menit: tidak dikirim lagi
```

Lampu tetap **Mati**. Inilah "turun tidak disimpan": broker pusat tidak menyimpan `cmd` untuk jembatan yang putus (`cleansession true`), dan backend 1.4.0 melupakan perintah tangan yang tak dikerjakan lebih dari 2 menit. Kalau sambungan kembali kurang dari 2 menit sesudah kamu menekan tombol, backend mengirimnya lagi dan lampu menyala belakangan, sesuai bunyi *toast* (log: `… perintah dikirim lagi`).

Varian pengganti: backend tahu brokernya mati dan langsung menolak (lab penulis, lewat API: `503` `{"pesan":"backend sedang tidak tersambung ke broker"}`). *Toast* 504 dan `tidak dikirim lagi` baru kamu lihat di Praktik 10.

**Kamu lulus langkah ⭐ ini** kalau lampu tetap **Mati** sesudah sambung. Kit B: *toast* 504 muncul saat putus dan log backend memuat `… tidak dikirim lagi`. Pengganti: *toast* `… tidak tersambung ke broker` (503).

> ⬆️ **Selesai Praktik 4?** Saatnya memilih jalur (tabel "Pilih jalurmu" di awal modul). Jalur utama: baca [Konsep 2](#2-vps-komputer-sewaan-yang-menyala-24-jam) sampai [Konsep 4](#4-tembok-api-yang-bocor-ufw-dan-docker), lalu [Praktik 5](#praktik-5--jalur-utama-sewa-vps-dan-amankan-pintunya-60-menit). Jalur gratis: kerjakan [6.4](#64--nslookup-buku-telepon-internet-sudah-mengenal-namamu-5-menit) bila *nameserver* sudah aktif, baca [Konsep 10](#10-jalur-gratis-cloudflare-tunnel), lalu [Praktik 11](#praktik-11--jalur-gratis-semua-di-pi-dan-cloudflare-tunnel-85-menit).

### Praktik 5 — Jalur utama: sewa VPS dan amankan pintunya (60 menit)

> 🖥️ **Alat yang dipakai:** **terminal di laptop** (terminal VS Code, PowerShell, atau Terminal macOS) untuk `ssh-keygen` dan `ssh`; **panel penyedia VPS** di browser; **terminal SSH ke VPS** mulai 5.2 (selalu Linux; `sudo` dan `nano` diketik di sini), dua jendela sekaligus di 5.4; pengelola sandimu. Rumahmu di laptop dan Pi tidak disentuh. Konsep yang dipakai: 2, 3, dan 4.
>
> ⭐ **Wajib untuk jalur utama** — langkah 5.4, 5.5, dan 5.7: `sshd -T` menunjukkan *login* sandi dan root mati, jendela kedua berhasil masuk, ufw aktif dengan 22 diizinkan, dan `docker version` (bagian `Server`) menjawab tanpa `sudo` saat kamu masuk sebagai `rumah`.

> [!NOTE]
> **Tidak direkam penulis.** Penulis tidak punya VPS. Langkah praktik ini ditulis dari dokumentasi resmi Ubuntu (OpenSSH, ufw, pembaruan otomatis) dan Docker (*Install Docker Engine on Ubuntu*), dibaca 29 Okt 2026; tiruan `sshd -T` di kontainer Ubuntu pun tidak jadi dibuat. Karena itu praktik ini tanpa kotak **Hasilnya**: yang perlu kamu lihat ditulis sebagai **Hasil yang diharapkan**. Panel penyedia berbeda-beda, jadi menunya sengaja ditulis umum.

> 🔀 **Jalur gratis:** tidak menyewa VPS. Lewati praktik ini: kerjakan [6.4](#64--nslookup-buku-telepon-internet-sudah-mengenal-namamu-5-menit) begitu *nameserver* aktif, baca [Konsep 10](#10-jalur-gratis-cloudflare-tunnel), lalu [Praktik 11](#praktik-11--jalur-gratis-semua-di-pi-dan-cloudflare-tunnel-85-menit).

Praktik ini tidak mengubah berkas proyek, jadi tanpa *commit*. Di setiap perintah, ganti `203.0.113.10` (alamat contoh khusus dokumentasi) dengan IP VPS-mu.

#### 5.1 Pilih dan sewa VPS 2 GB, lalu tempel kunci publik ed25519 (8 menit)

**Pilih paketnya** di situs penyedia (alasannya di [Konsep 2](#2-vps-komputer-sewaan-yang-menyala-24-jam)):

| Pilihan | Isi |
| :-- | :-- |
| RAM | 2 GB (1 GB tidak cukup) |
| Prosesor dan disk | 1–2 vCPU, disk ≥ 25 GB |
| Sistem | Ubuntu Server 26.04 LTS (belum ada: 24.04 LTS), amd64 |
| Lokasi | Indonesia atau Singapura |
| Tagihan | bulanan atau per jam |

**Siapkan kunci SSH di laptop.** Sudah membuatnya di [🔬 Modul 12](../../fase-2-konektivitas/modul-12-raspberry-pi-dan-linux/README.md#-bedah-teknis-opsional) (lipatan *Masuk tanpa kata sandi dengan kunci SSH*)? Pakai kunci itu. Belum? Di terminal laptop:

```text
ssh-keygen -t ed25519
```

Tekan **Enter** untuk nama berkas bawaan, lalu isi *passphrase* (kata sandi pelindung kunci; dianjurkan, simpan di pengelola sandimu). Kalau ternyata ditanya apakah berkas yang sudah ada boleh ditimpa, jawab `n`: kuncimu sudah ada, dan mungkin dipakai Pi.

Tampilkan kunci publiknya (Linux/macOS):

```text
cat ~/.ssh/id_ed25519.pub
```

Windows PowerShell (tidak diuji penulis): `type $env:USERPROFILE\.ssh\id_ed25519.pub`. Keluarannya satu baris panjang yang diawali `ssh-ed25519`. Saat membuat VPS, tempel baris itu **utuh** ke kolom kunci SSH di panel penyedia. Yang ditempel selalu isi berkas berakhiran `.pub`; `id_ed25519` tanpa `.pub` adalah kunci privat dan tidak pernah keluar dari laptop. Penyedia tanpa kolom kunci SSH? Masuk sekali dengan sandi root dari mereka; kuncimu dititipkan di 5.3, dan *login* sandi dimatikan di 5.4.

Begitu VPS menyala, panel menampilkan **alamat IPv4 publik**-nya. Catat di `belajar-iot/modul-27/` bersama nama paket dan harga bulanannya (dipakai lagi di [➕ F](#f-simpan-catatan-belajar-bukti-t1t3-sidik-jari-biaya-bulanan-dan-docker-stats)).

#### 5.2 SSH pertama dan sidik jari host (5 menit)

Dari terminal laptop:

```text
ssh root@203.0.113.10
```

Panelmu menyebut nama pengguna lain? Pakai nama itu; perintah sesudahnya tetap sama karena semuanya diawali `sudo`. Seperti sapaan pertama ke Pi di [Modul 12](../../fase-2-konektivitas/modul-12-raspberry-pi-dan-linux/README.md#4-ssh-terminal-jarak-jauh), SSH menunjukkan **sidik jari kunci** VPS (deretan sesudah `SHA256:`) dan bertanya apakah kamu yakin. Bila panel penyedia menampilkan sidik jari itu (misalnya di konsol web), cocokkan dulu; lalu ketik `yes` dan tekan **Enter**. Laptop mencatatnya di `known_hosts`, dan sejak itu memeriksa bahwa yang menjawab selalu VPS yang sama (VPS dibuat ulang dengan IP yang sama: `REMOTE HOST IDENTIFICATION HAS CHANGED`, [🚨](#-kalau-tidak-jalan)). Dengan kunci dari 5.1, yang ditanyakan sesudahnya hanya *passphrase* kuncimu (bila ada), bukan sandi VPS.

**Hasil yang diharapkan:** *prompt* VPS, biasanya berisi nama pengguna dan nama VPS. Periksa jenis prosesornya:

```text
dpkg --print-architecture
```

`amd64` sesuai anggapan modul ini ([Konsep 2](#2-vps-komputer-sewaan-yang-menyala-24-jam)); `arm64` pun jalan, karena image dibangun di VPS sendiri di [7.4](#74-docker-compose-build-di-vps-sebelum-layanan-lain-menyala-12-menit).

#### 5.3 Pengguna biasa `rumah` dengan `sudo` dan kunci SSH-mu (6 menit)

Masih di sesi pertama (VPS):

```text
sudo adduser rumah
```

Isi sandi yang kuat dua kali dan simpan di pengelola sandimu: sandi ini ditanyakan `sudo`, bukan dipakai untuk masuk lewat SSH. Pertanyaan lain (nama lengkap dan seterusnya) boleh dilewati dengan **Enter**. Masukkan `rumah` ke grup `sudo`:

```text
sudo usermod -aG sudo rumah
```

Lalu titipkan kunci publikmu untuk `rumah`. Biarkan jendela VPS ini terbuka, lalu di terminal **laptop** yang baru (Linux/macOS):

```text
ssh-copy-id rumah@203.0.113.10
```

Perintah ini menanyakan sandi `rumah` sekali, lalu menyalin `id_ed25519.pub` ke `/home/rumah/.ssh/authorized_keys`. Windows tidak punya `ssh-copy-id`, dan sebagian penyedia sudah mematikan *login* sandi sehingga perintah ini ditolak `Permission denied (publickey)`. Untuk keduanya, tempel kuncinya lewat sesi pertama di VPS (tidak diuji penulis):

```text
sudo mkdir -p /home/rumah/.ssh
sudo nano /home/rumah/.ssh/authorized_keys
```

Tempel baris `ssh-ed25519 …` dari 5.1 (Windows: klik kanan; macOS: **Cmd + V**; Linux: **Ctrl + Shift + V**), simpan (**Ctrl + O**, **Enter**), keluar (**Ctrl + X**), lalu serahkan folder itu kepada `rumah`:

```text
sudo chown -R rumah:rumah /home/rumah/.ssh
sudo chmod 700 /home/rumah/.ssh
sudo chmod 600 /home/rumah/.ssh/authorized_keys
```

Keluar dari VPS (`exit`), lalu masuk sebagai pengguna barumu:

```text
ssh rumah@203.0.113.10
```

**Hasil yang diharapkan:** masuk tanpa ditanya sandi `rumah`. Pastikan `sudo` bekerja sebelum root ditutup di 5.4:

```text
sudo whoami
```

Sesudah sandi `rumah`, jawabannya `root`.

#### 5.4 ⭐ Matikan *login* sandi dan root: `00-kunci.conf`, `sshd -T`, dan jendela kedua (10 menit)

Alasannya di [Konsep 3](#3-kunci-ssh-dan-pengguna-biasa-login-sandi-dan-root-dimatikan). Masih sebagai `rumah` di VPS, lihat dulu isi folder setelan SSH:

```text
ls /etc/ssh/sshd_config.d/
```

Ada `50-cloud-init.conf`? Itulah jebakan Konsep 3. Biarkan saja: berkasmu bernomor `00` sehingga terbaca lebih dulu dan menang. Buat berkasnya:

```text
sudo nano /etc/ssh/sshd_config.d/00-kunci.conf
```

Ketik tiga baris ini persis, simpan (**Ctrl + O**, **Enter**), dan keluar (**Ctrl + X**):

```text
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
```

Periksa tata tulisnya:

```text
sudo sshd -t
```

Tanpa keluaran = benar. Ada pesan galat? Ia menyebut berkas dan barisnya: betulkan dulu, jangan lanjut. Lalu periksa nilai yang benar-benar dipakai:

```text
sudo sshd -T | grep -Ei 'passwordauthentication|kbdinteractive|permitrootlogin'
```

**Hasil yang diharapkan** (dokumentasi OpenSSH, tidak direkam): tiga baris berhuruf kecil, `passwordauthentication no`, `kbdinteractiveauthentication no`, dan `permitrootlogin no` (urutannya bisa lain). Ada yang bukan `no`? Berkasmu tidak terbaca atau kalah ([🚨](#-kalau-tidak-jalan) *Login sandi masih menyala menurut `sshd -T`*). Kalau sudah tiga kali `no`, berlakukan:

```text
sudo systemctl restart ssh.service
```

Sesi yang sedang terbuka tidak terputus. **Jangan tutup jendela ini.** Buka terminal **kedua** di laptop dan masuk lagi:

```text
ssh rumah@203.0.113.10
```

Berhasil? Baru jendela pertama boleh ditutup. Gagal? Di jendela pertama yang masih terbuka, hapus berkasnya (`sudo rm /etc/ssh/sshd_config.d/00-kunci.conf`), jalankan lagi `sudo systemctl restart ssh.service`, lalu periksa kunci `rumah` di 5.3.

Terakhir, buktikan dari luar. Di terminal laptop yang tidak sedang tersambung ke VPS, coba masuk sebagai root, lalu sebagai `rumah` tanpa kunci:

```text
ssh root@203.0.113.10
```

```text
ssh -o PubkeyAuthentication=no rumah@203.0.113.10
```

**Hasil yang diharapkan:** keduanya ditolak `Permission denied (publickey)`. Root tidak bisa masuk sama sekali, dan tanpa kunci tidak ada jalan masuk: tidak ada pertanyaan sandi.

**Kamu lulus langkah ⭐ ini** kalau `sshd -T` menunjukkan tiga nilai `no`, jendela kedua masuk sebagai `rumah` dengan kunci, dan dua percobaan terakhir ditolak `Permission denied (publickey)`.

#### 5.5 ⭐ ufw: izinkan 22 dulu, lalu 80, 443, dan 8883 (8 menit)

Tembok api yang di [Modul 11](../../fase-2-konektivitas/modul-11-mqtt-dan-kontrak-data/README.md#14-izinkan-mosquitto-lewat-firewall) menjaga laptopmu kini menjaga VPS. Urutannya penting ([Konsep 4](#4-tembok-api-yang-bocor-ufw-dan-docker)): begitu ufw menyala, sambungan masuk yang tidak terdaftar ditolak, termasuk SSH-mu. Izinkan 22 **paling dulu** (`ufw` tidak dikenal? Pasang dulu: `sudo apt install ufw`):

```text
sudo ufw allow 22/tcp
```

Lalu pintu web (80 untuk Let's Encrypt dan pengalih ke `https://`; 443 untuk HTTPS, lewat TCP dan juga UDP untuk HTTP/3) serta broker TLS:

```text
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw allow 8883/tcp
```

Nomor 22 ditulis langsung, tanpa profil aplikasi ufw `OpenSSH`. Nyalakan:

```text
sudo ufw enable
```

ufw memperingatkan bahwa perintah ini bisa mengganggu sambungan SSH yang sedang terbuka: ketik `y`, lalu **Enter**. Periksa:

```text
sudo ufw status verbose
```

**Hasil yang diharapkan** (dokumentasi Ubuntu, tidak direkam): status aktif, sambungan masuk ditolak sebagai bawaan, dan lima aturan `ALLOW` untuk 22/tcp, 80/tcp, 443/tcp, 443/udp, dan 8883/tcp (masing-masing dengan salinan untuk IPv6). Lalu buka jendela baru dan masuk lagi seperti 5.4: SSH harus tetap terbuka. Gagal? Jangan tutup jendela lama: betulkan aturan 22 (atau `sudo ufw disable`), lalu coba lagi ([🚨](#-kalau-tidak-jalan) *Terkunci dari VPS …*). Panel penyediamu punya tembok api sendiri? Buka nomor yang sama di sana juga; tembok itu berdiri di depan VPS, dan ufw tidak bisa melewatinya.

Ingat Konsep 4: aturan 80, 443, dan 8883 di ufw hanya catatan niat. Loket kontainer dibuka Docker tanpa bertanya kepada ufw, jadi `sudo ufw deny 1883` tidak menutup loket broker; penjaga 1883 adalah `ALAMAT_MQTT=127.0.0.1` di `.env` VPS ([7.2](#72-env-vps-rahasia-baru-dan-kolom-vps-di-tabel-nilai-per-tempat-10-menit)). Buktinya diambil dari luar di [8.3](#83--t2a-tanpa-tls-ditolak-di-8883-dan-1883-tak-terjangkau-dari-luar-10-menit).

**Kamu lulus langkah ⭐ ini** kalau `ufw status verbose` aktif dengan kelima aturan `ALLOW`, dan SSH dari jendela baru tetap masuk.

#### 5.6 *Swap* 2 GB untuk *build* image (5 menit)

*Swap* = sebagian disk yang dipakai sebagai RAM cadangan: lambat, tetapi bisa mencegah *build* image di [7.4](#74-docker-compose-build-di-vps-sebelum-layanan-lain-menyala-12-menit) berhenti karena kehabisan memori (`npm ci` dan Vite boros memori). Ini saran penulis untuk VPS 2 GB, bukan langkah dokumentasi resmi, dan belum diuji di VPS. Lihat dulu apakah penyedia sudah memberinya:

```text
free -h
```

Baris `Swap:` sudah berisi (bukan `0B`)? Penyedia sudah memberinya: lewati langkah ini. Kalau `0B`, buat berkas *swap* 2 GB:

```text
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

Supaya tetap aktif sesudah VPS dinyalakan ulang, buka `/etc/fstab`:

```text
sudo nano /etc/fstab
```

Tambahkan satu baris ini di paling bawah, simpan, lalu keluar. Jangan mengubah baris lain di berkas itu:

```text
/swapfile none swap sw 0 0
```

`free -h` sekali lagi: baris `Swap:` kini ±2 GB.

#### 5.7 ⭐ Docker Engine dari repo apt Docker dan grup `docker` (12 menit)

Caranya sama dengan Pi di [6.1 Modul 26](../modul-26-docker-compose/README.md#61-pi-docker-engine-dari-repo-apt-docker-grup-docker-dan-git-20-menit), hanya halamannya untuk **Ubuntu**: <https://docs.docker.com/engine/install/ubuntu/>, bagian *Install using the apt repository*. Salin perintahnya dari halaman itu:

1. Copot paket tak resmi yang bentrok (`docker.io`, `docker-compose`, `docker-compose-v2`, `docker-doc`, `docker-buildx`, `podman-docker`, `containerd`, `runc`) dengan perintah pembuka halaman itu. Di VPS baru biasanya belum ada yang terpasang.
2. Pasang kunci dan sumber repo Docker (*Set up Docker's apt repository*).
3. Pasang paketnya:

```text
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Skrip `get.docker.com` tidak dipakai, sama dengan Modul 26. Jujur saja: mesin lab penulis memakai paket Ubuntu (Docker 29.1.3, Compose 2.40.3), justru paket yang disuruh dicopot halaman itu. Perintah `docker compose` di modul ini sama; versi dari repo Docker lebih baru (terbaru 29.9.2, 20 Okt 2026). Lalu masukkan `rumah` ke grup `docker`:

```text
sudo usermod -aG docker rumah
```

Grup `docker` setara root (6.1 Modul 26), jadi hanya `rumah` yang masuk. Keluar (`exit`) dan masuk lagi supaya keanggotaannya berlaku, lalu periksa tanpa `sudo`:

```text
docker version
```

```text
docker compose version
```

**Hasil yang diharapkan** (tidak direkam di VPS): bagian `Client` dan `Server` dari `docker version`, lalu satu baris `Docker Compose version …`. Bagian `Server` itulah buktinya; `docker compose version` tetap menjawab walau grupnya belum berlaku. Ditolak `permission denied` yang menyebut `docker.sock`? Kamu belum keluar-masuk SSH. Terakhir, Git untuk [7.1](#71-git-push-di-laptop-git-clone-di-vps-6-menit): `git --version` (tidak dikenal? `sudo apt install git`).

**Kamu lulus langkah ⭐ ini** kalau, sebagai `rumah` tanpa `sudo`, `docker version` menampilkan bagian `Server` dan `docker compose version` menjawab.

#### 5.8 Jam VPS dalam UTC dan pembaruan keamanan otomatis (6 menit)

```text
timedatectl
```

Baris `Time zone` di VPS biasanya menyebut `UTC`, tujuh jam di belakang WIB. Biarkan saja. Jadwal backend (laporan pagi 07.00) dan log backend tetap WIB, karena zonanya ditulis di kode ([Modul 19](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#8-penjadwalan-jam-beker-untuk-server)) dan Compose memberi backend `TZ: Asia/Jakarta`. Log Caddy dan Grafana selalu UTC (tambah 7 jam). Yang memakai jam VPS: **cron**, jam weker VPS, di [8.6](#86--perpanjangan-skripperbarui-sertifikat-mqttsh-dan-cron-mingguan-8-menit): Senin 03.17 jam VPS (UTC) = 10.17 WIB.

Pembaruan keamanan Ubuntu sudah otomatis (`unattended-upgrades`). Lihat setelannya:

```text
cat /etc/apt/apt.conf.d/20auto-upgrades
```

**Hasil yang diharapkan** (dokumentasi Ubuntu, tidak direkam): dua baris, `Update-Package-Lists` dan `Unattended-Upgrade`, keduanya bernilai `"1"` (menyala). VPS tidak dinyalakan ulang otomatis, dan Docker dari repo-nya sendiri tidak ikut diperbarui ([Konsep 2](#2-vps-komputer-sewaan-yang-menyala-24-jam)): memperbaruinya tetap pekerjaan tanganmu.

> ⬆️ **Selesai Praktik 5?** IP VPS-mu sudah ada: kerjakan [6.3](#63--jalur-utama-record-a-iot-dan-mqtt-ke-ip-vps-dns-only-tanpa-aaaa-5-menit) dan [6.4](#64--nslookup-buku-telepon-internet-sudah-mengenal-namamu-5-menit) (*record* A dan `nslookup`), lalu baca [Konsep 6](#6-sertifikat-dibahas-tuntas-rantai-nama-dan-tanggal) dan [Konsep 7](#7-caddy-sebagai-pintu-depan-https-otomatis-dan-trust_proxy) sebelum [Praktik 7](#praktik-7--jalur-utama-pusat-di-vps-dengan-https-75-menit).

### Praktik 6 — Domain dan DNS: nama milikmu di buku telepon internet (25 menit, ditambah waktu tunggu)

> 🖥️ **Alat yang dipakai:** **browser** di laptop untuk situs **registrar** dan **dasbor Cloudflare**; **terminal mana pun** (laptop, Pi, atau VPS) untuk `nslookup` di 6.4. Rumahmu tidak disentuh dan tidak ada berkas proyek yang berubah, jadi tanpa *commit*. Praktik ini terbelah: 6.1–6.2 di hari pertama, 6.3–6.4 belakangan (jalur utama sesudah Praktik 5, jalur gratis hanya 6.4; lihat ➡️ akhir 6.2). Konsep yang dipakai: 5.
>
> ⭐ **Wajib** — langkah 6.3 (jalur utama) dan 6.4: *record* A `iot` dan `mqtt` berawan abu-abu menunjuk IP VPS-mu, dan `nslookup` ke `1.1.1.1` menjawab IP itu untuk kedua nama (jalur gratis: *nameserver* Cloudflare sudah aktif).

> [!NOTE]
> **Tidak direkam penulis.** Penulis tidak membeli domain dan tidak punya akun Cloudflare. Aturan di 6.1–6.3 diambil dari Kebijakan Pendaftaran PANDI v9.0 dan dokumentasi Cloudflare (dibaca 29 Okt 2026); urutan klik di registrar dan dasbor ditulis umum. Hanya 6.4 yang punya kotak **Hasilnya**, dari server DNS tiruan di lab penulis.

#### 6.1 Beli domain `.my.id` di registrar terakreditasi PANDI (7 menit)

Kedua jalur butuh domain ([Konsep 5](#5-domain-dan-dns-buku-telepon-internet)), dan hanya ini yang dibeli sebelum Praktik 1–4. Di situs registrar Indonesia yang terakreditasi PANDI (mereknya sengaja tidak disebut):

1. Cari nama pilihanmu di kotak pencarian domain, misalnya `namaanda.my.id`. Pakai huruf kecil, angka, atau tanda hubung; pilih yang pendek dan mudah diketik di HP, karena nama ini tampil di alamat dashboard dan di setiap sertifikat.
2. Daftar sebagai **perorangan** dengan email yang masih kamu buka. Menurut kebijakan PANDI v9.0 (30 Sep 2024; mungkin sudah diperbarui), email itu wajib terverifikasi, jadi klik tautan verifikasi yang dikirim ke sana. Siapkan KTP bila diminta.
3. Bayar untuk satu tahun. Paket tambahan (*hosting*, email) tidak dibutuhkan: cukup domainnya. Catat harga tahun pertama, harga perpanjangan, dan tanggal habisnya di `belajar-iot/modul-27/` ([➕ F](#f-simpan-catatan-belajar-bukti-t1t3-sidik-jari-biaya-bulanan-dan-docker-stats)). Silabus memperkirakan ±Rp 15–30 rb/tahun; harga resmi tidak ditemukan penulis.

Sudah punya domain lain? Boleh dipakai: ganti `namaanda.my.id` di seluruh modul dengan domainmu. Simpan sandi akun registrar (dan Cloudflare di 6.2) di pengelola sandimu dan nyalakan verifikasi dua langkah bila ditawarkan: siapa pun yang memegang akun itu bisa mengarahkan namamu ke server lain. Lupa memperpanjang = dashboard dan broker ikut hilang dari internet.

#### 6.2 Cloudflare paket gratis: ganti *nameserver*, lalu tunggu aktif (8 menit)

Langkah ini memindahkan "kantor yang menjawab pertanyaan tentang namamu" dari registrar ke Cloudflare. Jalur gratis wajib mengerjakannya (Cloudflare Tunnel butuh domain di Cloudflare); jalur utama boleh memilih 🔀 di bawah.

1. Buat akun di Cloudflare, tambahkan domainmu (`namaanda.my.id`, tanpa `iot.` atau `www.`), lalu pilih paket gratis.
2. Cloudflare memberimu **dua nama *nameserver***. Salin keduanya persis ke catatanmu.
3. Di panel registrar, buka pengaturan *nameserver* domain itu, ganti *nameserver* bawaan registrar dengan dua nama dari Cloudflare, lalu simpan.
4. Tunggu sampai dasbor Cloudflare menyatakan domainmu aktif. Penulis tidak tahu berapa lama untuk `.my.id`: bisa beberapa menit, bisa berjam-jam.

Sejak *nameserver* pindah, semua *record* ditulis di Cloudflare; baris DNS di panel registrar tidak dipakai lagi. Daftar DNS di Cloudflare sudah berisi baris lain (misalnya bawaan registrar)? Biarkan, kecuali baris bernama `iot` atau `mqtt`: hapus dulu. Dukungan paket gratis Cloudflare untuk `.my.id` belum diperiksa penulis. Kalau domainmu ditolak, lihat [🚨](#-kalau-tidak-jalan) *Cloudflare menolak domain `.my.id`*.

> 🔀 **Tanpa Cloudflare (jalur utama saja):** biarkan *nameserver* bawaan registrar, lewati 6.2, dan tulis dua *record* A di 6.3 di panel DNS registrar. Di sana tidak ada sakelar awan: jawabannya selalu IP yang kamu tulis, sama dengan *DNS only*. Jalur gratis tidak punya pilihan ini.

> ➡️ **Berhenti di sini dulu.** Menunggu *nameserver* aktif bisa berjam-jam. Sementara itu kerjakan [Praktik 1](#praktik-1--meja-kerja-cabang-sidik-jari-dan-cadangan-15-menit) sampai [Praktik 4](#praktik-4--simpan-teruskan-di-rumah-dulu-jembatan-lan-dan-latihan-putus-10-menit-30-menit) (tanpa biaya). Jalur utama kembali ke [6.3](#63--jalur-utama-record-a-iot-dan-mqtt-ke-ip-vps-dns-only-tanpa-aaaa-5-menit) sesudah [Praktik 5](#praktik-5--jalur-utama-sewa-vps-dan-amankan-pintunya-60-menit) memberimu IP VPS; jalur gratis kembali ke [6.4](#64--nslookup-buku-telepon-internet-sudah-mengenal-namamu-5-menit) sebelum [Praktik 11](#praktik-11--jalur-gratis-semua-di-pi-dan-cloudflare-tunnel-85-menit).

#### 6.3 ⭐ Jalur utama: *record* A `iot` dan `mqtt` ke IP VPS, *DNS only*, tanpa AAAA (5 menit)

Butuh alamat IPv4 VPS dari [5.1](#51-pilih-dan-sewa-vps-2-gb-lalu-tempel-kunci-publik-ed25519-8-menit). Di dasbor Cloudflare, buka bagian DNS domainmu dan tambahkan dua *record*:

| Jenis | Nama | Isi (IPv4) | Status *proxy* | TTL |
| :-- | :-- | :-- | :-- | :-- |
| A | `iot` | `203.0.113.10` (ganti dengan IP VPS-mu) | awan abu-abu (*DNS only*) | kecil, misalnya 5 menit |
| A | `mqtt` | IP yang sama | awan abu-abu (*DNS only*) | kecil, misalnya 5 menit |

- **Nama** biasanya cukup `iot` atau `mqtt`; panel menambahkan `.namaanda.my.id` sendiri. Kalau panel meminta nama lengkap, tulis `iot.namaanda.my.id`.
- **Sakelar awan diperiksa sebelum menyimpan:** harus abu-abu. `mqtt.` berawan oranye dijawab dengan alamat Cloudflare, yang tidak pernah membuka 8883, sehingga jembatan Pi tidak akan sampai; `iot.` abu-abu supaya Caddy di VPS sendiri yang memegang kartu identitasnya ([Konsep 5](#5-domain-dan-dns-buku-telepon-internet)).
- **Jangan buat *record* AAAA** untuk kedua nama itu: loket `0.0.0.0` di VPS hanya IPv4 ([Konsep 4](#4-tembok-api-yang-bocor-ufw-dan-docker)).
- **TTL kecil** selama menyiapkan: kalau IP salah ketik lalu dibetulkan, penanya yang sudah sempat bertanya tetap memakai jawaban lama sampai TTL-nya habis.

Jangan menyalakan pusat di VPS ([7.7](#77--docker-compose-up--d-di-vps-dua-sertifikat-dari-lets-encrypt-8-menit)) sebelum 6.4 menjawab IP yang benar: Caddy langsung meminta sertifikat, dan kegagalan ikut dihitung batas laju Let's Encrypt ([Konsep 6](#6-sertifikat-dibahas-tuntas-rantai-nama-dan-tanggal)).

> 🔀 **Jalur gratis:** jangan buat `iot` maupun `mqtt` di sini. `iot` dibuat sebagai rute terowongan di [11.7](#117--cloudflare-tunnel-token-di-env-rute-ke-httpweb80-dan-profil-terowongan-12-menit), dan broker jalur gratis tidak keluar rumah, jadi `mqtt` tidak dibutuhkan.

**Kamu lulus langkah ⭐ ini** kalau daftar DNS memuat dua *record* A, `iot` dan `mqtt`, keduanya menunjuk IP VPS-mu dengan awan abu-abu, tanpa *record* AAAA untuk kedua nama itu.

#### 6.4 ⭐ `nslookup`: buku telepon internet sudah mengenal namamu (5 menit)

Perintahnya sama dengan [🔁 Langkah 3](#langkah-3--buku-telepon-internet-nslookup-record-a-cname-dan-ttl), kali ini untuk namamu. Di terminal mana pun (laptop, Pi, atau VPS), satu per satu:

```text
nslookup iot.namaanda.my.id 1.1.1.1
```

```text
nslookup mqtt.namaanda.my.id 1.1.1.1
```

**Hasilnya (lab penulis, DNS tiruan; nama dan IP diganti padanannya):** bagian jawaban untuk `iot.`

```text
Non-authoritative answer:
Name:	iot.namaanda.my.id
Address: 203.0.113.10
```

Untuk `mqtt.` sama, dengan `Name:` `mqtt.namaanda.my.id`. Di atasnya ada dua baris `Server:` dan `Address:`, yaitu server yang kamu tanya: di laptopmu `1.1.1.1` seperti di pemanasan, di lab penulis server DNS tiruan. `Non-authoritative answer` wajar: yang menjawab adalah penanya `1.1.1.1`, bukan *nameserver* domainmu. Yang dicari: satu baris `Address:` di bagian jawaban, persis IP VPS-mu. Muncul alamat Cloudflare, seperti jawaban `open-meteo.com` di pemanasan? Awannya masih oranye: ubah ke abu-abu di 6.3. IP lain: betulkan isinya di 6.3. Nama tidak ditemukan, atau jawabannya masih IP lama? Lihat [🚨](#-kalau-tidak-jalan) *`nslookup` belum menjawab, atau jawabannya masih yang lama*.

> 🔀 **Jalur gratis:** `iot` dan `mqtt` belum ada, jadi 6.4-mu = memastikan *nameserver* Cloudflare sudah aktif:
>
> ```text
> nslookup -type=NS namaanda.my.id 1.1.1.1
> ```
>
> Jawabannya harus menyebut dua nama *nameserver* dari 6.2 (bentuk keluarannya tidak direkam penulis). Masih nama bawaan registrar? Tunggu, lalu ulangi. `iot` baru menjawab sesudah rute terowongan dibuat di [11.7](#117--cloudflare-tunnel-token-di-env-rute-ke-httpweb80-dan-profil-terowongan-12-menit).

Dari HP lewat data seluler, namamu dibuktikan lagi di [7.8](#78--gembok-di-httpsiotnamaandamyid-308-login-dan-cookie-secure-6-menit) (jalur gratis: 11.8).

**Kamu lulus langkah ⭐ ini** kalau kedua `nslookup` menjawab satu `Address:` yang sama dengan IP VPS-mu (jalur gratis: `nslookup -type=NS` menyebut dua *nameserver* dari Cloudflare).

> ⬆️ **Selesai Praktik 6?** Jalur utama: baca [Konsep 6](#6-sertifikat-dibahas-tuntas-rantai-nama-dan-tanggal) dan [Konsep 7](#7-caddy-sebagai-pintu-depan-https-otomatis-dan-trust_proxy), lalu lanjut ke [Praktik 7](#praktik-7--jalur-utama-pusat-di-vps-dengan-https-75-menit). Jalur gratis: baca [Konsep 10](#10-jalur-gratis-cloudflare-tunnel), lalu lanjut ke [Praktik 11](#praktik-11--jalur-gratis-semua-di-pi-dan-cloudflare-tunnel-85-menit).

### Praktik 7 — Jalur utama: pusat di VPS dengan HTTPS (75 menit)

> 🖥️ **Alat yang dipakai:** **terminal SSH ke VPS** (`ssh rumah@203.0.113.10`, folder `/home/rumah/rumah-pintar-mini`) untuk hampir semua langkah; **VS Code** di laptop, terminal di **akar proyek**, untuk 7.1, 7.5, dan 7.6; **Chrome** atau **Edge** di laptop (dengan DevTools) untuk 7.8–7.10; **HP lewat data seluler** untuk 7.8–7.9. Konsep yang dipakai: 6 dan 7.
>
> ⭐ **Wajib untuk jalur utama** — langkah 7.5, 7.6, 7.7, 7.8, dan 7.9: sidik jari riwayat di VPS sama dengan laptop, backend laptop berhenti, Caddy mendapat dua sertifikat, `https://iot.namaanda.my.id` bergembok dengan *cookie* `Secure`, dan batas *login* dihitung per tamu.

Kotak **Hasilnya** di sini direkam di VPS tiruan lab penulis (kontainer di Pi 5, CA tiruan pengganti Let's Encrypt). VPS dan Let's Encrypt sungguhan belum dicoba penulis, jadi waktu dan ukurannya hanya contoh. Jalur gratis melewati praktik ini.

#### 7.1 `git push` di laptop, `git clone` di VPS (6 menit)

VPS mengambil kode dari GitHub lewat `git` di terminal ([Modul 16](../../fase-3-backend-data/modul-16-backend-typescript-api-git/README.md#3-git-di-terminal-tombol-yang-sama-tanpa-tombol)), jadi semua yang dibutuhkannya harus sudah ada di cabang `fitur/ke-internet`.

**Laptop, VS Code.** Buka `frontend/caddy/Caddyfile`. Baris alamat situsnya masih `:80 {` (Modul 26)? Berkas ini belum versi Modul 27: buka [`kode/frontend/caddy/Caddyfile`](kode/frontend/caddy/Caddyfile), klik **Copy raw file**, tempel menggantikan seluruh isinya, lalu simpan. Barisnya kini `{$DOMAIN_WEB::80} {$DOMAIN_MQTT} {` (dibaca di 7.7); dengan `DOMAIN_WEB` kosong, laptop tetap `http://localhost`. Di terminal akar proyek, satu per satu:

```text
git add frontend/caddy/Caddyfile
git commit -m "Caddyfile Modul 27: HTTPS, /grafana/, nama broker"
git push
```

**VPS, terminal SSH** (folder awal `/home/rumah`; repo publik sejak Modul 3, tanpa *login*):

```text
git clone https://github.com/<akun>/rumah-pintar-mini.git
```

```text
cd rumah-pintar-mini
git switch fitur/ke-internet
```

**Hasilnya** (lab penulis):

```text
branch 'fitur/ke-internet' set up to track 'origin/fitur/ke-internet'.
Switched to a new branch 'fitur/ke-internet'
```

Semua `docker compose` di VPS diketik di folder ini.

#### 7.2 `.env` VPS: rahasia baru dan kolom VPS di tabel nilai per tempat (10 menit)

`compose.cloud.yml` di VPS sama persis dengan di laptop; yang membuatnya bekerja sebagai VPS hanya `.env`:

```text
cp .env.example .env
```

Rahasianya **baru**: lemari VPS masih kosong, jadi formulir `POSTGRES_…` dibaca dan semua sandi mulai dari nol. VPS tanpa Node.js, jadi pakai baris kedua di kepala `.env.example`, sekali per rahasia:

```text
docker run --rm node:24.22.1-alpine3.24 node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Buka dengan `nano .env`, lalu isi (tempel seperti 5.3):

- `POSTGRES_PASSWORD`, `JWT_SECRET`, `MQTT_PASSWORD`, `GRAFANA_BACA_SANDI`, `GRAFANA_ADMIN_SANDI`: lima hasil berbeda, simpan di pengelola sandimu. Sandi admin Grafana wajib kuat: halaman *login*-nya terbuka ke internet (7.10).
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, dan `TOKO_IMAGE` (misalnya `ghcr.io/<akun>`): **sama** dengan `.env` laptop.
- Kolom **VPS** tabel ini (ganti `namaanda.my.id` dengan domainmu); setelan lain biarkan seperti contohnya.

| Setelan | Laptop (Modul 26) | VPS (jalur utama) | Pi (jalur gratis) |
| :-- | :-- | :-- | :-- |
| `DOMAIN_WEB` | kosong | `iot.namaanda.my.id` | kosong |
| `DOMAIN_MQTT` | kosong | `mqtt.namaanda.my.id` | kosong |
| `KONF_PUSAT` | kosong (= `pusat.conf`) | `pusat-internet.conf` | kosong |
| `CORS_ORIGIN` | `http://localhost,http://127.0.0.1` | `https://iot.namaanda.my.id` | `https://iot.namaanda.my.id` |
| `ALAMAT_WEB` | `127.0.0.1` (mode HP `0.0.0.0`) | `0.0.0.0` | `127.0.0.1` |
| `ALAMAT_MQTT` | `127.0.0.1` (Kit B `0.0.0.0`) | `127.0.0.1` | `172.17.0.1` (cek `ip -4 addr show docker0`) |
| `PORT_MQTT` | `1883` | `1883` | `1884` |
| `GRAFANA_ALAMAT` | kosong | `https://iot.namaanda.my.id/grafana/` | `https://iot.namaanda.my.id/grafana/` |
| `PROKSI_TEPERCAYA` | kosong | kosong | `private_ranges` |
| `TUNNEL_TOKEN` | kosong | kosong | token dasbor Cloudflare |
| `COMPOSE_PROFILES` | kosong | kosong | `terowongan` |

Kolom laptop = `.env`-mu sejak [2.3](#23-composecloudyml-modul-27-dan-blok-di-internet-di-env-laptop-4-menit) (Kit B wajib `ALAMAT_MQTT=0.0.0.0`, 1.4; `PORT_HTTPS`/`PORT_MQTTS` tetap dipesan, `port is already allocated` → 8443/8884). Kolom Pi dipakai di [11.2](#112-env-akar-di-pi-kolom-pi-di-tabel-nilai-per-tempat-8-menit). `DOMAIN_WEB` kosong menjadi `:80` di dalam `web`; `TRUST_PROXY` kosong = `uniquelocal` (`false` = perilaku 1.3); `0.0.0.0` hanya IPv4, jadi tanpa *record* AAAA. Bagian `compose.cloud.yml` yang membaca kolom VPS (cuplikan; utuhnya [`kode/compose.cloud.yml`](kode/compose.cloud.yml)):

```yaml
  mosquitto:
    # …
      - type: bind
        source: ./edge/${KONF_PUSAT:-pusat.conf}
    # …
    ports:
      - "${ALAMAT_MQTT:-127.0.0.1}:${PORT_MQTT:-1883}:1883"
      - "${ALAMAT_WEB:-127.0.0.1}:${PORT_MQTTS:-8883}:8883"
  # …
  web:
    # …
    environment:
      DOMAIN_WEB: ${DOMAIN_WEB:-:80}
      DOMAIN_MQTT: ${DOMAIN_MQTT:-}
    # …
      - data-caddy:/data
    ports:
      - "${ALAMAT_WEB:-127.0.0.1}:${PORT_WEB:-80}:80"
      - "${ALAMAT_WEB:-127.0.0.1}:${PORT_HTTPS:-443}:443"
      - "${ALAMAT_WEB:-127.0.0.1}:${PORT_HTTPS:-443}:443/udp"
```

Pintu tamu 80, 443, dan 8883 ikut `ALAMAT_WEB=0.0.0.0`; pintu polos 1883 dijaga `ALAMAT_MQTT=127.0.0.1`, karena ufw tidak menutup loket Docker (Konsep 4). Simpan (**Ctrl + O**, **Enter**), keluar (**Ctrl + X**), lalu:

```text
chmod 600 .env
docker compose config --quiet
```

**Hasilnya** (lab penulis): tanpa keluaran = cocok. `config` tanpa `--quiet` mencetak semua rahasia; `.env` tidak pernah ikut Git.

#### 7.3 Dua lemari `external` di VPS (3 menit)

Riwayat dan Grafana tinggal di lemari milikmu, yang di VPS belum ada:

```text
docker volume create rumahpintar-data
docker volume create rumahpintar-grafana-data
```

**Hasilnya:** nama masing-masing lemari. Riwayat terisi di 7.5, Grafana di 7.7.

#### 7.4 `docker compose build` di VPS sebelum layanan lain menyala (12 menit)

Cetakan buatan laptop belum tentu cocok dengan prosesor VPS ([Konsep 2](#2-vps-komputer-sewaan-yang-menyala-24-jam)), jadi VPS membangun backend 1.4.0 dan dashboard 1.3.0 sendiri, selagi RAM-nya lega:

```text
docker compose build
```

**Hasilnya** (lab penulis, dipotong):

```text
[+] Building 2/2
 ✔ ghcr.io/<akun>/rumah-pintar-mini-web:1.3.0      Built
 ✔ ghcr.io/<akun>/rumah-pintar-mini-backend:1.4.0  Built
```

Pi 5 penulis: ±67 detik karena sebagian ber-*cache*, *build* lain ±130 detik; VPS amd64 2 GB belum diukur. `Killed` = memori habis: *swap* ([5.6](#56-swap-2-gb-untuk-build-image-5-menit)), lalu ulangi. `Cannot find module '/app/src/db/migrasi.ts'` di 7.7 = izin klon terlalu sempit ([🚨](#-kalau-tidak-jalan)).

> 🔀 **Laptop amd64 (Intel atau AMD):** bangun dan titipkan cetakannya di toko image seperti [Praktik 10 Modul 26](../modul-26-docker-compose/README.md#praktik-10--toko-image-ghcr-manual-35-menit), lalu di VPS ganti langkah ini dengan `docker compose pull`.

#### 7.5 ⭐ Pindah riwayat ke VPS: cadangan, `scp`, pulihkan, lalu sidik jari sama (14 menit)

Riwayat, akun dashboard, perangkat, dan aturan pindah dengan resep cadangan ([1.3](#13--cadangan-sebelum-mengubah-apa-pun-pg_dump-lalu-docker-compose-cp-ke-backup-5-menit)) dan pulih ([Modul 26 9.2](../modul-26-docker-compose/README.md#92-proyek-uji-uji-pulih-di-lemari-baru-resep-pulih-timescaledb-15-menit)). Supaya sidik jarinya bisa dibandingkan, aliran data ke laptop dihentikan dulu. **Laptop, akar proyek:**

```text
docker compose stop mosquitto
```

**Hasilnya** (lab penulis): `✔ Container rumahpintar-mosquitto-1  Stopped`. Kit B (juga gerbang di laptop): gerbang kini menahan bacaan Node 1 di antreannya sampai jembatannya menuju VPS di [9.2](#92-pi-edgejembatanpusatconf-menuju-mqttnamaandamyid8883-10-menit) (lab penulis: 51 dari 51 tiba, tanpa dobel); jangan nyalakan lagi broker laptop sebelum itu, nanti antreannya diserahkan ke laptop. Simulator yang langsung ke pusat laptop: **Ctrl + C**; bacaannya selama pindahan tidak ditahan. Lalu sidik jari ([1.2](#12--sidik-jari-riwayat-di-laptop-dengan-skripsidik-jarisql-4-menit), juga bentuk PowerShell-nya) dan cadangan bertanggal hari ini, satu per satu:

```text
docker compose exec -T db psql -U postgres -d rumahpintar < skrip/sidik-jari.sql
docker compose exec db pg_dump -U postgres -d rumahpintar -Fc -f /tmp/rumahpintar.dump
docker compose cp db:/tmp/rumahpintar.dump backup/rumahpintar-2026-10-29.dump
```

Catat baris sidik jarinya di `sidik-jari.md` sebagai "Sebelum pindah (7.5)". **VPS:** `mkdir -p backup`. **Laptop:** kirim arsipnya lewat SSH (`scp` ada di OpenSSH Windows, macOS, dan Linux; Windows tidak diuji):

```text
scp backup/rumahpintar-2026-10-29.dump rumah@203.0.113.10:/home/rumah/rumah-pintar-mini/backup/
```

Lab penulis memakai `cp` (laptop dan VPS satu mesin). **VPS:** resep Modul 26 9.2 tanpa `-p` dan `--env-file`, karena proyek VPS memang `rumahpintar` dengan lemari baru. Nyalakan hanya `db`:

```text
docker compose up -d db
```

Ulangi `docker compose ps db` sampai `STATUS` menulis `(healthy)` (lab: 19 detik). Lalu satu per satu:

```text
docker compose cp backup/rumahpintar-2026-10-29.dump db:/tmp/pulih.dump
docker compose exec db psql -U postgres -d rumahpintar -c "SELECT timescaledb_pre_restore();"
docker compose exec db pg_restore -U postgres -d rumahpintar /tmp/pulih.dump
docker compose exec db psql -U postgres -d rumahpintar -c "SELECT timescaledb_post_restore();"
docker compose exec -T db psql -U postgres -d rumahpintar < skrip/sidik-jari.sql
```

**Hasilnya** (lab penulis): `t`; `pg_restore: warning: errors ignored on restore: 31` dengan kode keluar 1, wajar seperti Modul 26 (izin untuk `grafana_baca`, yang dibuat `akun-grafana` di 7.7); `t`; lalu sidik jari:

```text
 bacaan |            sidik_jari            | ringkasan | jilid | tugas | akun | perangkat
--------+----------------------------------+-----------+-------+-------+------+-----------
   2480 | 89664903e2718360c271405a0edd4f43 |       145 |     9 |     3 |    2 |         3
(1 row)
```

Baris yang sama persis tercetak di laptop (22.55 WIB) dan VPS (22.56 WIB). Angkamu tentu lain.

**Kamu lulus langkah ⭐ ini** kalau baris sidik jari VPS sama persis dengan "Sebelum pindah (7.5)".

#### 7.6 ⭐ Satu backend per token bot: hentikan backend laptop (3 menit)

Backend kedua dengan token bot yang sama ditolak Telegram dengan `409 Conflict`, dan backend VPS menyala di 7.7. **Laptop, akar proyek:**

```text
docker compose stop backend
```

**Hasilnya** (lab penulis): `✔ Container rumahpintar-backend-1  Stopped`. Mode kembang: **Ctrl + C** di terminal `backend`. Grafana laptop juga memakai bot itu dan sejak 7.5 tak menerima bacaan, jadi bisa mengabari 🔴 "Node diam": hentikan dengan `docker compose stop grafana` (🔴 dari Grafana VPS sampai 9.2 wajar). Laptop kini mesin pengembangan: sesudah 9.2, rumah laptop atau mode kembang boleh menyala lagi, asal `TELEGRAM_BOT_TOKEN` di `.env` akar dan `backend/.env` kosong, dan `ALAMAT_MQTT=127.0.0.1`.

**Kamu lulus langkah ⭐ ini** kalau `docker compose ps` di laptop tidak lagi menampilkan `backend`.

#### 7.7 ⭐ `docker compose up -d` di VPS: dua sertifikat dari Let's Encrypt (8 menit)

Syarat Konsep 7: `nslookup` di [6.4](#64--nslookup-buku-telepon-internet-sudah-mengenal-namamu-5-menit) menjawab IP VPS untuk kedua nama, dan 80 serta 443 terbuka (5.5, juga tembok api panel penyedia bila ada). Berkas yang menyuruh Caddy, dari 7.1:

```text
# Caddyfile - pintu depan dashboard Rumah Pintar Mini (Modul 26-27): menyajikan isi dist/ dan meneruskan /api/... ke backend.
# Salinan berkas ini ikut di dalam image web. Docker Compose memasang FOLDER frontend/caddy/ di atasnya (bukan berkas
# tunggal), jadi berkas di repo inilah yang dipakai. Sesudah mengubahnya: docker compose restart web
# {$NAMA} = isi variabel NAMA dari bagian environment layanan web di compose.cloud.yml (asalnya .env), dibaca saat Caddy
# menyala; {$NAMA:isi} = "isi" bila NAMA tidak ada sama sekali (variabel yang ada tetapi kosong TETAP kosong, jadi nilai
# pengganti untuk .env yang kosong ditulis di compose.cloud.yml). Sesudah mengubah .env: docker compose up -d (web dibuat ulang).
{
	# Caddy biasanya membuka "loket admin" (2019) untuk mengubah setelan sambil jalan. Tidak kita pakai: setelan hanya
	# dibaca dari berkas ini saat Caddy menyala.
	admin off
	# Modul 27, jalur gratis saja (Pi + Cloudflare Tunnel). Di sana tamu tiba lewat cloudflared, yang sendiri sudah
	# menulis alamat tamu dan "https" di kepala X-Forwarded-*. Caddy biasanya menimpa kepala itu (siapa saja bisa
	# memalsukannya), kecuali bila datang dari penerus tepercaya: PROKSI_TEPERCAYA=private_ranges = alamat privat, termasuk
	# lorong Docker tempat cloudflared berada. Kosong (laptop, VPS) = tidak memercayai siapa pun. _strict = alamat tamu
	# dibaca dari kanan (yang ditambahkan penerus), bukan dari kiri (yang bisa ditulis tamu sendiri).
	servers {
		trusted_proxies static {$PROKSI_TEPERCAYA}
		trusted_proxies_strict
	}
}

# Alamat situs. DOMAIN_WEB kosong di .env = ":80" (diisikan compose.cloud.yml): HTTP biasa di port 80 kontainer, untuk alamat
# apa pun yang diketik di browser (localhost, IP laptop; Pi jalur gratis di belakang cloudflared), persis Modul 26.
# ("auto_https off" TIDAK membuat Caddy melayani HTTP; alamat ":80" inilah yang membuatnya.)
# Modul 27, DOMAIN_WEB terisi (VPS): nama domain, misalnya iot.namaanda.my.id. Caddy meminta sertifikat Let's Encrypt
# sendiri, melayani HTTPS di 443, mengalihkan http:// ke https://, dan memperbarui sertifikatnya sebelum habis. Tanpa
# opsi "email" di atas, penerbitnya hanya Let's Encrypt. DOMAIN_MQTT (mqtt.namaanda.my.id) ikut diminta di sini supaya Caddy
# juga mengurus sertifikat broker; Mosquitto memakai SALINANNYA (layanan sertifikat-mqtt).
{$DOMAIN_WEB::80} {$DOMAIN_MQTT} {
	# nama broker bukan halaman web: jawab singkat. mqtt.invalid = nama yang tidak pernah ada (akhiran .invalid), supaya
	# baris ini tetap sah saat DOMAIN_MQTT kosong (laptop, Pi jalur gratis).
	@broker host {$DOMAIN_MQTT} mqtt.invalid
	handle @broker {
		respond "Alamat ini untuk broker MQTT (port 8883), bukan dashboard." 404
	}

	# jawaban dikompres sebelum dikirim: JavaScript dashboard ±1 MB tiba di browser sekitar 300 kB
	encode zstd gzip

	# /api/devices -> backend:8080/devices (awalan /api dibuang dulu). Sambungan live ikut: /api/socket.io/ -> backend:8080/socket.io/
	# "backend" = nama layanan di compose.cloud.yml (lorong Compose), bukan localhost. Caddy menambah kepala X-Forwarded-For
	# (alamat tamu) dan X-Forwarded-Proto (https) untuk backend; backend 1.4 memercayainya karena TRUST_PROXY (Modul 27).
	handle_path /api/* {
		reverse_proxy backend:8080 {
			# Backend memasang cookie "sesi" (kartu terusan 7 hari) berjalur /auth, padahal browser memanggilnya lewat
			# /api/auth. Tanpa baris ini browser tidak mengirim cookie itu ke /api/auth/refresh, dan kamu terlempar ke
			# layar Masuk setiap 15 menit. Baris ini mengganti jalurnya di jawaban backend: Path=/auth -> Path=/api/auth.
			header_down Set-Cookie "Path=/auth" "Path=/api/auth"
		}
	}

	# Modul 27: Grafana lewat alamat yang sama, di bawah /grafana/ (https://iot.namaanda.my.id/grafana/). Awalan /grafana
	# TIDAK dibuang: Grafana sendiri melayani jalur itu bila GRAFANA_ALAMAT di .env berakhiran /grafana/ (compose.cloud.yml).
	# GRAFANA_ALAMAT kosong (laptop) = Grafana tetap di http://localhost:3000; jalur ini tidak dipakai (Grafana mengalihkannya
	# ke /login, yang dijawab dashboard).
	redir /grafana /grafana/
	handle /grafana/* {
		reverse_proxy grafana:3000 {
			# cookie login Grafana diberi atribut Secure (browser hanya mengirimnya lewat HTTPS); Grafana sendiri tidak
			# memasangnya karena sambungan Caddy -> Grafana adalah HTTP biasa
			header_down Set-Cookie "^(.*)$" "$1; Secure"
		}
	}

	# /assets/...: JavaScript dan CSS hasil build. Namanya bersidik (misalnya index-DcefnpS2.js) dan berganti setiap
	# build, jadi browser boleh menyimpannya lama. Berkas yang tidak ada dijawab 404 (bukan index.html): galatnya jujur.
	handle /assets/* {
		root * /srv
		file_server
	}

	# Selain /api, /grafana, dan /assets: berkas dashboard di /srv (isi dist/). Alamat layar seperti /peta atau
	# /perangkat/f00d00000001 bukan berkas, jadi dijawab index.html, lalu React Router memilih layarnya ("SPA fallback",
	# janji Modul 24). Tanpa ini, F5 di layar mana pun selain / menjawab 404.
	handle {
		root * /srv
		# no-cache = browser wajib bertanya dulu ke Caddy sebelum memakai index.html simpanannya (Caddy menjawab 304 bila
		# belum berubah). Tanpa ini, sesudah image web dibangun ulang browser bisa tetap menampilkan dashboard LAMA sampai F5.
		# Modul 27: berlaku juga untuk service worker (sw.js) dan manifest aplikasi HP (PWA), jadi versi baru cepat terbaca.
		header Cache-Control "no-cache"
		try_files {path} /index.html
		file_server
	}
}
```

`{$DOMAIN_WEB::80} {$DOMAIN_MQTT}` = dua nama, satu situs: Caddy meminta kartu untuk keduanya, `mqtt.` dijawab `404`, `/api` dan `/grafana` diteruskan seperti tabel rute Konsep 7. Nyalakan semuanya:

```text
docker compose up -d
```

**Hasilnya** (lab penulis, ±15 detik): empat lemari baru `Created` (`rumahpintar_data-caddy`, `…-caddy-config`, `…-broker`, `…-sertifikat`), `db` `Healthy`, layanan sekali jalan `migrasi`, `akun-broker`, `akun-grafana`, dan `sertifikat-mqtt` `Exited`, lalu `web`, `mosquitto`, `backend`, dan `grafana` `Started`. Di `docker compose ps -a`, keempat layanan sekali jalan `Exited (0)` dan `backend` 1.4.0 `(healthy)`. Kolom `PORTS` di VPS-mu: `web` 80 dan 443 pada `0.0.0.0`; `mosquitto` 1883 hanya `127.0.0.1`, 8883 pada `0.0.0.0` (di lab kosong, karena "VPS"-nya kontainer). Beberapa detik pertama `/api` boleh `502`. Log Caddy, disaring:

```text
docker compose logs web | grep -E 'obtaining|account registered|solve challenge|renewal|obtained successfully'
```

**Hasilnya (lab penulis, CA tiruan; dipotong):**

```text
web-1  | {"level":"info","ts":1793289446.7526991,"logger":"tls.obtain","msg":"obtaining certificate","identifier":"mqtt.namaanda.my.id"}
web-1  | {…,"msg":"obtaining certificate","identifier":"iot.namaanda.my.id"}
web-1  | {…,"msg":"new ACME account registered","contact":[],"status":"valid"}
web-1  | {…,"msg":"trying to solve challenge","identifier":"iot.namaanda.my.id","challenge_type":"http-01",…}
web-1  | {…,"msg":"got renewal info","names":["iot.namaanda.my.id"],…}
web-1  | {…,"msg":"certificate obtained successfully","identifier":"iot.namaanda.my.id","issuer":"…"}
web-1  | {…,"msg":"certificate obtained successfully","identifier":"mqtt.namaanda.my.id","issuer":"…"}
```

`ts` = angka detik (UTC). Akun ACME dibuat tanpa email (`"contact":[]`), dan `got renewal info` = jadwal perpanjangan dari penerbit (Konsep 6); tantangannya kali ini `http-01` lewat 80, di uji lain `tls-alpn-01` lewat 443 (Caddy memilih acak). Di lab, kartu terbit 5–6 detik sesudah Caddy menyala, angka CA tiruan; Let's Encrypt sungguhan belum diukur penulis. Kartunya ada di `/data/caddy/certificates/acme-v02.api.letsencrypt.org-directory/<nama>/` (di lab penulis folder ini bernama lain, CA tiruan); salinan untuk broker di 8.1. Beberapa menit tanpa `certificate obtained successfully`, atau ada `error`? [🚨](#-kalau-tidak-jalan) *Caddy tidak mendapat sertifikat …*.

Sejak ini `rumahpintar_data-caddy` menyimpan akun dan kartumu: **jangan `docker compose down -v`**, karena Let's Encrypt hanya memberi 5 kartu bernama persis sama per minggu ([Konsep 6](#6-sertifikat-dibahas-tuntas-rantai-nama-dan-tanggal)). `docker compose down` tanpa `-v` aman.

**Kamu lulus langkah ⭐ ini** kalau log `web` memuat `certificate obtained successfully` untuk `iot.` dan `mqtt.`, `sertifikat-mqtt` `Exited (0)`, dan layanan lain `Up` atau `(healthy)`.

#### 7.8 ⭐ Gembok di `https://iot.namaanda.my.id`: 308, *login*, dan *cookie* `Secure` (6 menit)

**Laptop, terminal** (Windows: ketik `curl.exe`; tidak diuji penulis), satu per satu:

```text
curl -sI http://iot.namaanda.my.id/
curl -sI https://iot.namaanda.my.id/
curl -s https://iot.namaanda.my.id/api/health
curl -s -w ' [%{http_code}]\n' https://mqtt.namaanda.my.id/
```

**Hasilnya (lab penulis, CA tiruan; dipotong):**

```text
HTTP/1.1 308 Permanent Redirect
Location: https://iot.namaanda.my.id/

HTTP/2 200
alt-svc: h3=":443"; ma=2592000
cache-control: no-cache
{"ok":true,"broker":true,"database":true,"diterima":0,"ditolak":0,"diabaikan":0}
Alamat ini untuk broker MQTT (port 8883), bukan dashboard. [404]
```

`curl` memeriksa kartu Caddy (rantai, nama, tanggal) sebelum menjawab `HTTP/2 200`, tanpa `strict-transport-security` (HSTS, Konsep 7). `diterima` masih 0: bacaan baru menunggu jembatan di 9.2.

**Chrome di laptop:** ketik `http://iot.namaanda.my.id`; halaman pindah sendiri ke `https://` dengan gembok di bilah alamat (penerbitnya Let's Encrypt; gembok tidak direkam penulis, Chrome lab tanpa layar). Masuk dengan akun admin **lama**, yang ikut riwayat. DevTools → **Application** → **Cookies**: `akses` (Path `/`) dan `sesi` (Path `/api/auth`), kolom **Secure** dan **HttpOnly** tercentang (lab penulis: keduanya juga `SameSite` `Strict`). Lalu buka alamat yang sama dari HP lewat data seluler (WiFi mati): buku telepon internet mengenal namamu dari luar rumah. Swagger tetap dari laptop lewat terowongan SSH ([🧩 Tingkat 2](#tingkat-2--pintu-admin-lewat-terowongan-ssh-swagger-dan-dbeaver-dari-laptop-isi-bagian-rumpang-25-menit)).

**Kamu lulus langkah ⭐ ini** kalau `http://` dialihkan `308` ke `https://` bergembok, akun admin lama bisa masuk, dan kedua *cookie* bertanda **Secure**.

#### 7.9 ⭐ 429 per tamu, bukan bersama (5 menit)

Batas [Modul 20](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#8-rate-limiting-jam-pasir-untuk-penebak-sandi) = 10 percobaan *login* per menit per tamu. Dalam satu menit:

1. **Chrome di laptop** (**Keluar** dulu): masuk sebagai admin dengan sandi salah 11 kali. Layar **Masuk** menulis `email atau sandi salah`, lalu `terlalu banyak percobaan: coba lagi dalam … detik` (bunyi kode backend; layar ini tidak direkam penulis).
2. **HP lewat data seluler**: masuk dengan sandi benar, berhasil. Lewat WiFi rumah, HP berbagi alamat publik dengan laptop dan ikut ditolak.
3. **VPS:**

```text
docker compose logs --since 3m backend | grep -E 'login|429'
```

**Hasilnya** (lab penulis, tiga tamu tiruan dengan `curl`; dipotong):

```text
backend-1  | [23:00:11] WARN: login gagal: akun 1 (IP 198.51.100.31)
backend-1  | [23:00:12] INFO: POST /auth/login -> 429 (18 ms)
backend-1  | [23:00:21] WARN: login gagal: akun 1 (IP 198.51.100.33)
backend-1  | [23:00:29] INFO: login: akun 1 (admin), sesi 7, IP 198.51.100.32
backend-1  | [23:00:36] INFO: POST /auth/login -> 429 (5 ms)
```

Tamu `…31` ditolak sejak percobaan ke-11, juga dengan sandi benar pukul 23.00.36. Tamu `…33` mengirim `X-Forwarded-For: 203.0.113.9` palsu, tetapi tercatat dengan alamat aslinya. Tamu `…32` (= HP-mu) masuk. Jam log backend WIB.

**Kamu lulus langkah ⭐ ini** kalau laptop kena `429` sementara HP masuk dalam menit yang sama, dan log mencatat dua IP berbeda.

#### 7.10 Grafana di `/grafana/`: admin, akun Viewer, dan dashboard dari berkas (5 menit)

Chrome di laptop: `https://iot.namaanda.my.id/grafana/` → halaman *login* Grafana. Masuk sebagai `admin` dengan `GRAFANA_ADMIN_SANDI` dari `.env` VPS (lemari baru: sandi Grafana laptop tidak berlaku). Dashboard **Kesehatan Sistem** di folder **Rumah Pintar Mini**, aturan **Node diam**, dan *contact point* Telegram sudah ada, dari *provisioning* Modul 26. Tautan *alert* kini `https://`; "tautan Grafana" Checkpoint Fase 4 boleh alamat `/grafana/` ini ([Modul 25](../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md#103-tautan-grafana-json-di-github-tangkapan-layar-dan-catatan-kapan-memakai-yang-mana-5-menit)). Di lab penulis, *login*, dashboard, dan Grafana Live (`wss://`, `101`) jalan, dan *cookie* `grafana_session` bertanda `Secure`.

Orang lain diberi akun sendiri berperan **Viewer**, lewat menu administrasi pengguna Grafana (nama menunya tidak direkam penulis); sandi admin tidak dibagikan. Sesudah beberapa kali salah sandi, Grafana menolak sementara juga sandi yang benar selama beberapa menit, tanpa pemberitahuan ([🚨](#-kalau-tidak-jalan)). Tangkapan dari lab penulis (Chrome di Linux, CA tiruan, alamat lab); di browsermu alamatnya `https://iot.namaanda.my.id/grafana/`, bergembok:

![Komposit dua tangkapan layar asli Grafana 13.2.4 bertema gelap di VPS tiruan, Chrome 156 di Linux, laptop 1280 piksel, Praktik 7.10, 30 Okt 2026 00.56 WIB; alamat lab https://iot.contoh.test/grafana/ sebagai pengganti https://iot.namaanda.my.id/grafana/, internet dan sertifikat tiruan. Kiri atas, halaman /grafana/login: logo, Welcome to Grafana (nomor 1), Email or username, Password, tombol biru Log in, Forgot your password? (nomor 2). Kanan atas: legenda bernomor; cookie grafana_session ber-Path /grafana bertanda Secure, Grafana Live lewat wss 101. Bawah, sesudah masuk, menu kiri ditutup: remah roti Dashboards, Rumah Pintar Mini, Kesehatan Sistem (nomor 3, dari provisioning); Node All; Last 1 hour WIB, Refresh 1m (nomor 4, rentang 1 jam dipilih lab); panel RSSI (kekuatan sinyal WiFi) Latihan ruang tamu sekitar -68 sampai -41 dbm sejak 00.19 dengan garis putus-putus -75, Uptime (lama menyala) 35 minutes, Heap (sisa memori) 180 sampai 198 kB (nomor 5); Paket Node 2 per jam (seharusnya 12) satu batang oranye 7; tabel Menit terlambat dari jadwal: f00d000000b2 Kebun (tiruan) -2.1, f00d00000001 Latihan ruang tamu 0.1 (nomor 6). Data dari simulator dan Kebun tiruan.](aset/grafana-lewat-https.png)

Isi Grafana yang dulu kamu buat lewat layar di laptop tidak ikut pindah: lemari Grafana VPS baru, isinya hanya *provisioning*.

#### 7.11 `docker stats`: RAM VPS saat diam (3 menit)

```text
docker stats --no-stream
```

**Hasilnya** (lab penulis, kolom `MEM USAGE / LIMIT`): grafana ±238 MiB, db ±154, backend ±103, web ±16, mosquitto ±6; jumlah ±517 MiB (pengukuran lain: ±0,4–0,65 GB). VPS 2 GB cukup; Grafana paling besar dan angkanya naik-turun. Catat angkamu untuk [➕ F](#f-simpan-catatan-belajar-bukti-t1t3-sidik-jari-biaya-bulanan-dan-docker-stats).

> ⬆️ **Selesai Praktik 7?** Baca [Konsep 8](#8-tls-untuk-mqtt-pintu-8883-salinan-sertifikat-dan-muat-ulang), lalu lanjut ke [Praktik 8](#praktik-8--jalur-utama-pintu-mqtt-8883-dengan-tls-35-menit). Sejak [7.5](#75--pindah-riwayat-ke-vps-cadangan-scp-pulihkan-lalu-sidik-jari-sama-14-menit) bacaan rumahmu belum sampai ke VPS sampai jembatan Pi tersambung di [9.2](#92-pi-edgejembatanpusatconf-menuju-mqttnamaandamyid8883-10-menit), jadi jangan menunda terlalu lama.

### Praktik 8 — Jalur utama: pintu MQTT 8883 dengan TLS (35 menit)

> 🖥️ **Alat yang dipakai:** **terminal SSH ke VPS**, folder `/home/rumah/rumah-pintar-mini`; **terminal di laptop**, folder mana pun, sebagai tamu dari luar VPS; **MQTTX 1.13.1** di laptop; pengelola sandimu. Konsep yang dipakai: 8 (dan 4 untuk loket).
>
> ⭐ **Wajib untuk jalur utama** — langkah 8.1, 8.3, dan 8.6: salinan sertifikat milik uid `1883` dan pintu 8883 terbuka, **T2a** (tanpa TLS ditolak di 8883, 1883 tak terjangkau dari luar), dan skrip perpanjangan di cron.

> 🔀 **Jalur gratis:** brokermu tetap di rumah, tanpa pintu 8883. Lewati Praktik 8 dan 9; pengganti T2a adalah **T2-gratis** di [11.8](#118--t1-gratis-dan-t2-gratis-dashboard-dari-hp-broker-tetap-di-rumah-6-menit).

Tanpa *commit*: akun broker tinggal di lemari VPS, cron di VPS. Kotak **Hasilnya** dari lab penulis dengan VPS dan Let's Encrypt tiruan.

#### 8.1 ⭐ Salinan sertifikat untuk broker: `sertifikat-mqtt` dan pintu 8883 (5 menit)

Penyalinnya sudah bekerja di [7.7](#77--docker-compose-up--d-di-vps-dua-sertifikat-dari-lets-encrypt-8-menit) (`sertifikat-mqtt` `Exited (0)`); skripnya kamu salin di [2.3](#23-composecloudyml-modul-27-dan-blok-di-internet-di-env-laptop-4-menit). Komentarnya adalah pelajarannya; urutannya dibahas di [Konsep 8](#8-tls-untuk-mqtt-pintu-8883-salinan-sertifikat-dan-muat-ulang):

```sh
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
```

Di VPS:

```text
docker compose logs sertifikat-mqtt
```

**Hasilnya (lab penulis, CA tiruan):**

```text
sertifikat-mqtt-1  | sertifikat mqtt.namaanda.my.id disalin dari /caddy/caddy/certificates/acme-v02.api.letsencrypt.org-directory/mqtt.namaanda.my.id/mqtt.namaanda.my.id.crt (8 detik menunggu)
sertifikat-mqtt-1  | broker yang sedang menyala memuat ulang dengan: docker compose exec mosquitto kill -HUP 1
```

Di lab penulis, folder penerbit di tengah jalur itu bernama lain (CA tiruan); di VPS-mu namanya `acme-v02.api.letsencrypt.org-directory` dan detik menunggunya berbeda. `… tidak berubah: dilewati` sesudah `up -d` berikutnya wajar.

```text
docker compose logs mosquitto | grep -E '8883|Opening|running'
```

**Hasilnya (lab penulis, dipotong; angka di depan = detik):**

```text
mosquitto-1  | 1793289454: Info: running mosquitto as user: mosquitto.
mosquitto-1  | 1793289454: Opening ipv4 listen socket on port 8883.
```

Broker sudah turun hak menjadi `mosquitto` dan tetap bisa membaca sertifikatnya. Pintu 8883 dibuka empat baris terakhir [`edge/pusat-internet.conf`](kode/edge/pusat-internet.conf) (`listener 8883`, `use_username_as_clientid true`, `certfile …`, `keyfile …`; isi lainnya sama dengan `pusat.conf`), yang dipilih `KONF_PUSAT` di 7.2. 1883 juga mendengar di dalam kontainer, untuk backend di lorong; dari internet ia tertutup loket `127.0.0.1` (8.3). Pemilik salinannya:

```text
docker compose exec mosquitto ls -ln /mosquitto/sertifikat/
```

**Hasilnya (lab penulis; ukuran dan tanggal berbeda, jam kontainer UTC):**

```text
total 8
-rw-r--r--    1 1883     1883          1263 Oct 29 15:57 broker.crt
-rw-------    1 1883     1883           227 Oct 29 15:57 broker.key
```

`1883` = pengguna `mosquitto`; sertifikat boleh dibaca siapa pun, kunci hanya oleh pemiliknya.

**Kamu lulus langkah ⭐ ini** kalau `sertifikat-mqtt` menulis `… disalin dari …`, log broker memuat `Opening ipv4 listen socket on port 8883.`, dan `broker.key` milik `1883` dengan `-rw-------`. `GAGAL: 5 menit tanpa sertifikat …` atau `Unable to load server certificate`? [🚨](#-kalau-tidak-jalan).

#### 8.2 Akun `pemeriksa`, `jembatan-pi`, dan `pemantau` di broker VPS (5 menit)

Lemari `data-broker` VPS masih baru: berkas sandinya hanya berisi akun `backend` buatan `akun-broker`; daftar izinnya (`edge/acl-broker`) ikut `git clone`. Tambahkan tiga akun, masing-masing dengan sandi BARU ([satu akun untuk setiap program](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#6-penjaga-pintu-broker-berkas-sandi-dan-satu-akun-untuk-setiap-program)):

- `pemeriksa`: akun uji 8.3–8.4, hanya membaca `rpm/#`. Sandinya khusus uji (8.3 mengirimnya polos): sesudah 8.4, ganti lalu *restart*.
- `jembatan-pi`: jembatan Pi ([9.1](#91-akun-dan-izin-jembatan-pi-di-broker-vps-4-menit)). Sandinya **berbeda** dari `jembatan-pi` laptop.
- `pemantau`: kabar jembatan di [9.5](#95-kabar-jembatan-di-vps-dan-antrean-gerbang-yang-kembali-turun-4-menit).

Akun perangkat tidak perlu: Node 1 tetap masuk ke Pi, bacaannya naik lewat jembatan. Di VPS, satu akun per perintah:

```text
docker compose exec -u mosquitto mosquitto mosquitto_passwd /mosquitto/data/sandi-broker pemeriksa
```

**Hasilnya (lab penulis; sandi diketik dua kali tanpa tampil):**

```text
Password:
Reenter password:
Adding password for user pemeriksa
```

Ulangi dengan `jembatan-pi` lalu `pemantau`. Sesudah itu *restart*, bukan *reload* ([Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#44-jalur-perangkat-kunci-pintunya-lalu-restart-10-menit)); belum ada jembatan, jadi hanya backend yang lepas sebentar:

```text
docker compose restart mosquitto
```

**Hasilnya (lab penulis):** `[+] Restarting 1/1`, lalu `✔ Container rumahpintar-mosquitto-1  Started  0.5s`.

#### 8.3 ⭐ T2a: tanpa TLS ditolak di 8883, dan 1883 tak terjangkau dari luar (10 menit)

Coba **dari laptop**, bukan dari terminal SSH ke VPS: dari dalam VPS, 1883 memang menjawab di `127.0.0.1`.

**Lewat MQTTX (bukti Silabus; tidak direkam penulis).** **Host** `mqtt.namaanda.my.id`, **Port** `8883`, **Username** `pemeriksa`, **Password** sandinya, sakelar **SSL/TLS** mati → **Connect**: tidak tersambung (lab: mqtt.js, mesin MQTTX, `ECONNRESET`). **SSL/TLS** nyala dengan sertifikat CA tepercaya bawaan (namanya bisa berbeda di versimu) → tersambung. **Port** `1883`, **SSL/TLS** mati: tidak tersambung.

**Lewat terminal laptop (yang direkam penulis).** Butuh `mosquitto_sub` 2.1 ke atas (versi lama belum mengenal `--no-tls`). Ragu, atau Windows/macOS? Awali setiap perintah dengan `docker run --rm eclipse-mosquitto:2.1.2-alpine`: image broker di laptopmu, lengkap dengan akar ISRG Root X1 dan X2 (bentuk ini tidak direkam penulis). Pertama, tanpa TLS:

```text
mosquitto_sub --no-tls -h mqtt.namaanda.my.id -p 8883 -u pemeriksa -P <sandi> -t 'rpm/+/status' -v -C 1 -W 10
```

Sesudah berhenti, kode keluarnya (PowerShell: `$LASTEXITCODE`, tidak diuji penulis):

```text
echo $?
```

**Hasilnya (lab penulis, CA tiruan):** diam 10 detik tanpa satu baris pun, lalu `255`. Diam bukan "menunggu": klien mencoba sekali per detik dan setiap kali ditolak. Di VPS:

```text
docker compose logs --since 2m mosquitto
```

**Hasilnya (lab penulis, dipotong; berulang tiap detik):**

```text
mosquitto-1  | 1793289884: New connection from 198.51.100.101:44732 on port 8883.
mosquitto-1  | 1793289884: OpenSSL Error while trying to get the error[0]: error:0A00010B:SSL routines::wrong version number
mosquitto-1  | 1793289884: Client 198.51.100.101 [198.51.100.101:44732] disconnected: Protocol error.
```

`wrong version number` = broker menunggu jabat tangan TLS, tetapi yang datang paket MQTT polos: kartu pos di pintu amplop. Dari laptopmu, alamat sesudah `from` = alamat rumahmu di internet ([🔁 Langkah 2](#langkah-2--alamat-rumahmu-di-internet-router-lawan-situs-ip-saya); lab: tamu tiruan). Kedua, dengan TLS: buang `--no-tls`. Untuk `-p 8883`, klien 2.1 memakai TLS sendiri dan memeriksa kartu broker dengan daftar akar sistem, tanpa `--cafile`:

```text
mosquitto_sub -h mqtt.namaanda.my.id -p 8883 -u pemeriksa -P <sandi> -t 'rpm/+/status' -v -C 1
```

**Hasilnya (lab penulis, CA tiruan; jembatan Pi lab sudah tersambung):** `rpm/f00d00000001/status online`, `echo $?` → `0`. Jembatanmu baru naik di 9.2, jadi broker VPS belum punya pesan status, dan perintahnya menunggu tanpa keluaran. Itu bukan penolakan: log VPS mencatat `New client connected from … as pemeriksa (p4, c1, k60, u'pemeriksa').` dan `Client pemeriksa negotiated TLSv1.3 …`. Tekan **Ctrl + C**. Galat TLS? [🚨](#-kalau-tidak-jalan).

Ketiga, pintu polos 1883:

```text
mosquitto_sub -h mqtt.namaanda.my.id -p 1883 -u pemeriksa -P <sandi> -t 'rpm/+/status' -v -C 1 -W 10
```

**Hasil yang diharapkan:** gagal; bunyinya bergantung jaringan (tidak direkam penulis). Diam belum bukti (belum ada pesan): log VPS harus tanpa `on port 1883` dari alamat rumahmu. Lab penulis (internet tiruan, baris `ports:` apa adanya): tak terjangkau dari luar, menjawab dari dalam "VPS". Yang menutupnya bukan ufw, melainkan `ALAMAT_MQTT=127.0.0.1` ([Konsep 4](#4-tembok-api-yang-bocor-ufw-dan-docker)).

**Kamu lulus langkah ⭐ ini** kalau perintah tanpa TLS berakhir tanpa pesan dengan `255` (MQTTX: tidak tersambung), log VPS menulis `wrong version number` dan `disconnected: Protocol error.`, dan log VPS tanpa `on port 1883` dari rumahmu. Simpan potongan lognya di `belajar-iot/modul-27/` (➕ F).

#### 8.4 Nama klien lewat 8883 tidak bisa dipinjam akun lain (4 menit)

`use_username_as_clientid true` di bawah `listener 8883` mencegah akun lain menyamar menjadi `backend` atau `jembatan-pi` ([Konsep 8 Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#8-nama-klien-bisa-dipalsukan-use_username_as_clientid)). Dari laptop, minta nama klien `backend` dengan akun `pemeriksa` (menunggu seperti di 8.3; sesudah 5 detik, **Ctrl + C**):

```text
mosquitto_sub -h mqtt.namaanda.my.id -p 8883 -i backend -u pemeriksa -P <sandi> -t 'rpm/+/status' -v -C 1
```

Lalu di VPS: `docker compose logs --since 2m mosquitto | grep -E 'pemeriksa|backend'`. **Hasilnya (lab penulis, CA tiruan, dipotong):**

```text
mosquitto-1  | 1793289970: New client connected from 198.51.100.101:57774 as pemeriksa (p4, c1, k60, u'pemeriksa').
```

`-i backend` diabaikan, backend tidak tertendang. Tanda bahaya = `as backend (… u'<akun lain>')`: opsi itu hilang dari bawah `listener 8883` ([🚨](#-kalau-tidak-jalan)). `Client backend … disconnected: session taken over.` tepat sebelum `as backend (p4, c0, k60, u'backend')` = sesi lama milik backend sendiri (Praktik 2): normal.

#### 8.5 Bukti dari lab penulis: penyadap tidak bisa membaca kunci lagi (3 menit)

Cukup dibaca. Penulis memasang `alat/penyadap.js` ([8.1 Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#81--lihat-sendiri-kunci-terkirim-polos-10-menit)) di depan pintu 8883 VPS tiruan ([`alat/README.md`](kode/alat/README.md)). **Hasilnya (lab penulis, klien tanpa TLS, dipotong):**

```text
  nama pengguna : pemeriksa
  kunci (sandi) : <sandi pemeriksa>   <- terbaca polos oleh siapa pun di jalur ini
  broker 203.0.113.10:8883 tidak bisa dihubungi (ECONNRESET)
```

Sandinya bocor **sebelum** broker menolak: uji tanpa TLS hanya dengan `pemeriksa`, jangan dengan kunci perangkat atau `jembatan-pi`. Klien TLS: penyadap hanya mencatat `sambungan baru dari … -> 203.0.113.10:8883`, tanpa nama dan kunci. (Di lab, pemeriksaan sertifikat dilemahkan khusus uji ini karena klien mengetuk penyadap di `127.0.0.1`, bukan nama broker.)

#### 8.6 ⭐ Perpanjangan: `skrip/perbarui-sertifikat-mqtt.sh` dan cron mingguan (8 menit)

Caddy memperbarui kartunya sendiri, broker tidak ([Konsep 8](#8-tls-untuk-mqtt-pintu-8883-salinan-sertifikat-dan-muat-ulang)). Skrip ini (disalin di 2.3) menjalankan penyalin lagi, lalu memuat ulang broker:

```sh
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
```

Coba sekali di VPS, akar proyek:

```text
sh skrip/perbarui-sertifikat-mqtt.sh
```

**Hasilnya (lab penulis, CA tiruan; jam ditulis WIB, VPS biasanya menulis `UTC`):**

```text
=== 2026-10-29 23:06:25 WIB perbarui sertifikat broker
sertifikat mqtt.namaanda.my.id tidak berubah: dilewati
broker dimuat ulang
```

`tidak berubah` pun tetap dimuat ulang (alasannya di komentar skrip). Log broker (`docker compose logs --since 1m mosquitto`): `… Reloading config.` (lab: tanpa `New bridge connected` baru, jembatan tidak putus).

**Pasang cron** (tidak direkam penulis) sebagai `rumah`, tanpa `sudo`: skrip lalu berjalan sebagai `rumah`, anggota grup `docker` sejak [5.7](#57--docker-engine-dari-repo-apt-docker-dan-grup-docker-12-menit).

```text
crontab -e
```

Pertama kali, Ubuntu biasanya menanyakan editor: pilih `nano`. Tambahkan baris ini di paling bawah (= baris 8 komentar skrip tanpa `#`; folder lain? ganti kedua jalurnya), lalu simpan (**Ctrl + O**, **Enter**, **Ctrl + X**):

```text
17 3 * * 1 sh /home/rumah/rumah-pintar-mini/skrip/perbarui-sertifikat-mqtt.sh >> /home/rumah/perbarui-sertifikat.log 2>&1
```

Artinya: menit 17, jam 3, setiap tanggal, setiap bulan, hari 1 = Senin 03.17 jam VPS (UTC: 10.17 WIB); keluaran dan galat ditambahkan ke log. `crontab -l` harus menampilkan baris itu; Senin berikutnya, `cat /home/rumah/perbarui-sertifikat.log` memuat tiga baris seperti di atas.

Tiga aturan menyertainya. (1) Sesudah mengubah `acl-broker` atau `*.conf` di VPS, langsung `docker compose restart mosquitto` dan baca lognya: salah ketik yang menunggu muat ulang cron membuat broker berhenti Senin pagi ([🚨](#-kalau-tidak-jalan)). (2) Jangan `mosquitto --test-config` di kontainer yang menyala: ia menimpa `mosquitto.db` (antrean, pesan *retained*) dengan berkas kosong milik root. (3) HUP hanya untuk broker VPS ini; gerbang Pi selalu `restart`. Lupa cron? Jembatan yang tersambung tetap jalan, tetapi sambungan **baru** ditolak begitu salinan 8883 kedaluwarsa (lab: `certificate has expired`), termasuk jembatan yang putus sebentar: jalankan skrip dengan tangan.

**Kamu lulus langkah ⭐ ini** kalau skrip menulis `broker dimuat ulang`, log broker `Reloading config.`, dan `crontab -l` menampilkan baris cron-mu.

> ⬆️ **Selesai Praktik 8?** Lanjut ke [Praktik 9](#praktik-9--jalur-utama-jembatan-pi--vps-lewat-tls-35-menit): jembatan Pi naik ke pintu 8883 yang baru kamu buktikan. Setelannya sama dengan [Praktik 4](#praktik-4--simpan-teruskan-di-rumah-dulu-jembatan-lan-dan-latihan-putus-10-menit-30-menit); yang berubah hanya alamat dan pemeriksaan sertifikat.

### Praktik 9 — Jalur utama: jembatan Pi → VPS lewat TLS (35 menit)

> 🖥️ **Alat yang dipakai:** **terminal SSH ke Pi**, folder `rumah-pintar-mini/edge`; **terminal SSH ke VPS**, folder `/home/rumah/rumah-pintar-mini`; **Chrome** atau **Edge** di laptop, atau HP (9.4); **VS Code** di laptop (9.6 saja); pengelola sandimu (sandi `jembatan-pi` dan `pemantau` VPS dari 8.2, sandi `pemantau` gerbang dari 4.2). Node 1 menyala dan masuk ke gerbang Pi. Konsep yang dipakai: 8 dan 9.
>
> ⭐ **Wajib untuk jalur utama** — langkah 9.3 dan 9.4: log VPS mencatat jembatan Pi lewat TLS (**T2b**), lalu Node 1 *live* di dashboard VPS dan **Lampu** dijawab `ack`.

Jembatan simpan-teruskan [Praktik 4](#praktik-4--simpan-teruskan-di-rumah-dulu-jembatan-lan-dan-latihan-putus-10-menit-30-menit) naik ke internet. Setelannya tetap ([Konsep 9](#9-jembatan-simpan-teruskan-siapa-menahan-apa)); yang berubah hanya tujuan (kini **nama** broker VPS di pintu 8883) dan pemeriksaan kartu identitas VPS dengan akar ISRG Root X1 yang sudah ada di image Mosquitto ([Konsep 8](#8-tls-untuk-mqtt-pintu-8883-salinan-sertifikat-dan-muat-ulang)). Sejak [7.5](#75--pindah-riwayat-ke-vps-cadangan-scp-pulihkan-lalu-sidik-jari-sama-14-menit), gerbang menahan bacaan Node 1; di lab penulis, antrean itu menyusul ke VPS begitu jembatan tersambung. Tanpa *commit* (kecuali 9.6): `edge/jembatan/pusat.conf` berisi sandi, di luar Git. Kotak **Hasilnya** dari lab penulis dengan internet, VPS, dan CA tiruan.

> 🔀 **Tanpa Pi:** gerbang di laptop ([pola Modul 26 6.7](../modul-26-docker-compose/README.md#67-jalur-laptop-pengganti-l4-lalu-gerbang-di-laptop-yang-sama-525-menit)) memakai jembatan TLS yang sama: kerjakan 9.2 di terminal kedua, folder `edge` laptop, tanpa `git pull`, dan sunting berkasnya di VS Code; `PORT_GERBANG=1884` tetap. Belum diuji penulis. **Jalur gratis:** lewati praktik ini; jembatanmu tetap polos di rumah ([11.6](#116--gerbang-ke-pusat-di-pi-yang-sama-jembatan-lan-ke-pusat1884-8-menit)).

#### 9.1 Akun dan izin `jembatan-pi` di broker VPS (4 menit)

Jembatan masuk ke broker VPS dengan akun `jembatan-pi` dan hanya boleh memakai topik blok `7) jembatan-pi` di `edge/acl-broker`. Izinnya ikut `git clone` (7.1), karena berkas itu kamu perbarui di [4.1](#41-edgegerbangconf-empat-baris-penahan-antrean-lalu-push-cabang-6-menit). Periksa di VPS, akar proyek:

```text
grep -A 6 '^user jembatan-pi' edge/acl-broker
```

Yang harus tampil (tujuh baris berkas):

```text
user jembatan-pi
topic write rpm/+/telemetry
topic write rpm/+/status
topic write rpm/+/vitals
topic write rpm/+/ack
topic read rpm/+/cmd
topic write $SYS/broker/connection/jembatan-pi/state
```

Empat topik naik, satu turun (`cmd`), dan baris terakhir untuk kabar jembatan (`#` tidak mencakup topik berawalan `$`). Akunnya sudah dibuat di [8.2](#82-akun-pemeriksa-jembatan-pi-dan-pemantau-di-broker-vps-5-menit)? Lanjut ke 9.2. Belum? Buat dengan sandi BARU, berbeda dari `jembatan-pi` laptop, lalu *restart*:

```text
docker compose exec -u mosquitto mosquitto mosquitto_passwd /mosquitto/data/sandi-broker jembatan-pi
```

```text
docker compose restart mosquitto
```

**Hasilnya** (lab penulis): `Adding password for user jembatan-pi`, lalu `✔ Container rumahpintar-mosquitto-1  Started  0.5s`.

#### 9.2 Pi: `edge/jembatan/pusat.conf` menuju `mqtt.namaanda.my.id:8883` (10 menit)

Di terminal SSH ke Pi, folder `rumah-pintar-mini/edge`, ambil dulu *commit* yang di-*push* di 7.1:

```text
git pull
```

Di [4.2](#42-jembatan-lan-dengan-setelan-modul-27-sesi-pusat-bersih-antrean-di-pi-tetap-7-menit) kamu menyalakan blok JALUR RUMAH; kini kebalikannya. Cara paling sederhana: salin ulang contohnya, yang blok JALUR UTAMA-nya aktif:

```text
cp jembatan.contoh.conf jembatan/pusat.conf
```

Buka dengan `nano jembatan/pusat.conf`, lalu ganti dua hal:

1. Di baris `address mqtt.namaanda.my.id:8883`, tulis nama broker milikmu dari [6.3](#63--jalur-utama-record-a-iot-dan-mqtt-ke-ip-vps-dns-only-tanpa-aaaa-5-menit). **Nama**, bukan IP: kartu identitas VPS hanya berlaku untuk nama itu.
2. `ganti-dengan-sandi-akun-jembatan-pi` → sandi `jembatan-pi` **VPS**, bukan sandi laptop.

Baris `bridge_cafile` biarkan: berkas akarnya sudah ada di image. Simpan (**Ctrl + O**, **Enter**, **Ctrl + X**), jalankan `chmod 600 jembatan/pusat.conf`, lalu periksa dengan `diff jembatan.contoh.conf jembatan/pusat.conf`. **Hasilnya** (lab penulis): tepat dua tempat, `10c10` (baris `address`; di lab nama broker tiruan) dan `25c25` (baris `remote_password`; sandinya tampil di layarmu, jangan ditempel ke mana pun).

Terakhir, kosongkan `ALAMAT_PUSAT` di `edge/.env` (`nano .env`, sampai barisnya `ALAMAT_PUSAT=`): jembatan kini memanggil nama domain, bukan `pusat`. Setelan Compose ikut berubah, jadi gerbang dibuat ulang, bukan HUP ([Konsep 9](#9-jembatan-simpan-teruskan-siapa-menahan-apa)):

```text
docker compose up -d --force-recreate mosquitto
```

**Hasilnya** (lab penulis): `✔ Container rumahpintar-gerbang-mosquitto-1  Started  3.0s`. Node 1 lepas beberapa detik saat gerbang dibuat ulang, jadi riwayat menit itu boleh memuat satu celah pendek (lab penulis: 20 detik).

#### 9.3 ⭐ T2b: log VPS mencatat jembatan Pi lewat TLS (6 menit)

Di Pi:

```text
docker compose logs mosquitto
```

**Hasilnya** (lab penulis, CA tiruan, dipotong; 23.02 WIB):

```text
mosquitto-1  | 1793289761: Loading config file '/mosquitto/config/jembatan/pusat.conf'
mosquitto-1  | 1793289761: Restored 46 client messages
mosquitto-1  | 1793289761: Opening ipv4 listen socket on port 1883.
mosquitto-1  | 1793289761: Connecting bridge pusat (mqtt.namaanda.my.id:8883)
mosquitto-1  | 1793289761: mosquitto version 2.1.2 running
mosquitto-1  | 1793289764: New client connected from 172.20.0.1:33886 as f00d00000001 (p4, c1, k15, u'f00d00000001').
```

`Restored 46 client messages` = pesan yang ditahan sejak 7.5, dipulihkan dari lemari gerbang; baris terakhir = Node 1 (lab: simulator) masuk lagi. Di VPS, akar proyek:

```text
docker compose logs mosquitto | grep jembatan-pi
```

**Hasilnya** (lab penulis, CA tiruan):

```text
mosquitto-1  | 1793289761: New bridge connected from 198.51.100.20:43084 as jembatan-pi (p4, c1, k60, u'jembatan-pi').
mosquitto-1  | 1793289761: Client jembatan-pi negotiated TLSv1.3 cipher TLS_AES_256_GCM_SHA384
```

Itulah **T2b**: jembatan masuk lewat amplop tersegel (TLS 1.3), sedangkan tamu polos di pintu yang sama ditolak `wrong version number` (8.3). `c1` = sesi pusat bersih, setelan Modul 27 (jembatan Modul 26 dan setelan Silabus lama menulis `c0`, Konsep 9); alamat sesudah `from` = alamat rumahmu di internet ([🔁 Langkah 2](#langkah-2--alamat-rumahmu-di-internet-router-lawan-situs-ip-saya)), bukan IP Pi di LAN. Di lab penulis, berkas akar di gerbang diganti akar CA tiruan: rantai Let's Encrypt sungguhan di jembatan belum diuji penulis.

Log Pi hanya mengulang `Connecting bridge pusat …`, tanpa `New bridge connected` di VPS? [🚨](#-kalau-tidak-jalan) *Jembatan `not authorised` …* (sandi) atau *`certificate verify failed` …* (nama atau akar).

**Kamu lulus langkah ⭐ ini** kalau log VPS memuat `New bridge connected … as jembatan-pi (p4, c1, k60, u'jembatan-pi').` dan `Client jembatan-pi negotiated TLSv1.3 …`. Simpan kedua barisnya di `belajar-iot/modul-27/` (➕ F).

#### 9.4 ⭐ Node 1 *live* di dashboard VPS, lalu tombol Lampu sampai `ack` (8 menit)

Buka `https://iot.namaanda.my.id` di laptop atau HP, masuk sebagai admin:

1. Lencana **Live** menyala, kartu Node 1 `Online`, dan angka di halaman detailnya berganti (lab penulis, Chrome lewat internet tiruan: `terakhir dilihat 15 detik yang lalu` → `6 detik yang lalu` dalam 21 detik). Kebun (Node 2) menyusul `Online` `lewat penghubung` dalam ±5 menit.
2. Klik **Lampu**: lampu Node 1 menyala, dan sakelar bergeser sesudah `ack` kembali dari Pi. Perintah turun lewat `topic rpm/+/cmd in 1`, jawabannya naik lewat `topic rpm/+/ack out 1`. **Hasilnya** (lab penulis, lewat API dari internet tiruan): `ack` dalam 70 milidetik (`"lama_ms":70`), dan simulator menulis `f00d00000001: perintah c-20261029-160402-1 -> ok=true`. Matikan lagi lampunya.

Aturan yang kamu simpan di dashboard VPS juga turun lewat jalan itu (lab kode penulis: simulator menulis `ambang disimpan {"suhu_kipas_on":31,"tanah_siram":30}`). 🔴 "Node diam" dari Grafana VPS selama 7.5–9.2, bila ada, wajar; ✅ menyusul sesudah data mengalir lagi.

**Kamu lulus langkah ⭐ ini** kalau dashboard VPS menampilkan **Live** dengan angka Node 1 yang berganti, dan **Lampu** dijawab `ack` (lampu Node 1 benar-benar menyala).

#### 9.5 Kabar jembatan di VPS dan antrean gerbang yang kembali turun (4 menit)

Di VPS, dengan akun `pemantau` VPS:

```text
docker compose exec mosquitto mosquitto_sub -u pemantau -P <sandi> -t '$SYS/broker/connection/jembatan-pi/state' -v -C 1
```

**Hasilnya** (lab penulis):

```text
$SYS/broker/connection/jembatan-pi/state 1
```

Lalu di Pi, dengan akun `pemantau` gerbang, perintah antrean [4.3](#43--kabar-jembatan-state-1-dengan-akun-pemantau-3-menit):

```text
docker compose exec mosquitto mosquitto_sub -u pemantau -P <sandi> -t '$SYS/broker/store/messages/count' -v -C 1
```

Angkanya kembali seperti di 4.3 (lab penulis, beberapa menit sesudah 9.2: `59`, hampir semuanya pesan *retained*): antrean pindahan sudah terkirim. Lab penulis: bacaan Node 1 selama pindahan 51 terbit di gerbang, 51 tersimpan di VPS, tanpa dobel.

#### 9.6 Nama VPS di `extra_hosts` gerbang (opsional, 3 menit)

Selama internet rumah putus, setiap percobaan jembatan menanyakan nama broker VPS ke DNS, dan broker gerbang tertahan beberapa detik menunggu jawabannya. Perangkat tidak terputus, tetapi pesan untuk pelanggan lokal di Pi (Node-RED, `mosquitto_sub`) ikut terlambat (lab penulis: sampai hampir 6 detik; isu Mosquitto #3402). Nama yang ditulis tetap di `compose.edge.yml` tidak ditanyakan ke DNS. Barisnya sudah ada, berkomentar (cuplikan [`kode/edge/compose.edge.yml`](kode/edge/compose.edge.yml)):

```yaml
    extra_hosts:
      # …
      - "pusat:${ALAMAT_PUSAT:-host-gateway}"
      # …
      # - "mqtt.namaanda.my.id:203.0.113.10"
```

Di laptop, buka `edge/compose.edge.yml` di VS Code, hapus `# ` di depan baris terakhir (sejajar dengan `- "pusat:…"`), lalu isi nama broker dan IP VPS-mu. Di terminal akar proyek, satu per satu:

```text
git add edge/compose.edge.yml
git commit -m "Gerbang: nama broker VPS di extra_hosts"
git push
```

Di Pi: `git pull`, lalu `docker compose up -d --force-recreate mosquitto`. Lab kode penulis: dengan baris itu, `Error creating bridge: Try again.` tidak muncul lagi selama putus, dan jeda pesan lokal di bawah 1 detik. Harganya: IP VPS terpaku di berkas. VPS atau IP-nya berganti? Ubah baris ini juga; tanpa itu jembatan tidak tersambung ([🚨](#-kalau-tidak-jalan)).

> ⬆️ **Selesai Praktik 9?** Lanjut ke [Praktik 10](#praktik-10--uji-cabut-internet-rumah-10-menit-30-menit): cabut internet rumah 10 menit, lalu buktikan susulannya tanpa celah dan tanpa dobel.

### Praktik 10 — Uji cabut internet rumah 10 menit (30 menit)

> 🖥️ **Alat yang dipakai:** **HP** dengan data seluler (WiFi HP dimatikan) dan dashboard `https://iot.namaanda.my.id`; laptop di WiFi rumah dengan **terminal SSH ke Pi**, folder `rumah-pintar-mini/edge`; router/modem rumahmu; sesudah sambung, **terminal SSH ke VPS**, folder `/home/rumah/rumah-pintar-mini`; **Telegram**; pengelola sandimu (sandi `pemantau`). Konsep yang dipakai: 9.
>
> ⭐ **Wajib** — langkah 10.2 dan 10.5 (jalur gratis: [11.9](#119--t3-gratis-internet-rumah-putus-10-menit-riwayat-pi-tetap-utuh-15-menit)): internet rumah dicabut 10 menit sementara WiFi rumah tetap menyala, lalu **T3**: `skrip/cek-susulan.sql` di VPS menunjukkan menit-menit putus tetap utuh, tanpa celah dan tanpa dobel.

Inilah ujian sungguhan [Konsep 9](#9-jembatan-simpan-teruskan-siapa-menahan-apa): di [4.4](#44--putus-10-menit-di-lan-lalu-skripcek-susulansql-tanpa-celah-tanpa-dobel-11-menit) kamu memutus jembatan LAN, kini jembatan TLS ke VPS kehilangan internet tanpa pemberitahuan, jendela buta ikut teruji. Tanpa *commit*. Kotak **Hasilnya** dari lab penulis: "cabut" = gerbang dilepas dari internet tiruan (`docker network disconnect`: paket dibuang diam-diam, seperti kabel WAN dicabut), "HP" = Chrome tanpa layar; router, HP, dan data seluler sungguhan tidak diuji penulis. Baca sampai 10.4 sebelum mencabut.

#### 10.1 Siapkan HP, terminal Pi, dan jam mulai (3 menit)

Selama putus, laptop di WiFi rumah ikut tanpa internet: SSH ke VPS putus, SSH ke Pi tetap jalan. Siapkan catatan jam cabut dan sambung (WIB, untuk 10.5), lalu:

1. **HP:** matikan WiFi-nya, nyalakan data seluler, buka `https://iot.namaanda.my.id`, masuk, lalu buka detail Node 1. Lencana **Live** menyala, angkanya berganti.
2. **Node 1:** catat `device_id`-nya (yang kamu pakai di 4.4) dan pastikan lampunya **Mati**. Tanpa Kit: simulator `alat/` di laptop, lewat Pi, seperti lab penulis.
3. **Terminal SSH ke Pi**, folder `edge`: isi antrean gerbang sebelum putus, dengan perintah [4.3](#43--kabar-jembatan-state-1-dengan-akun-pemantau-3-menit) (`<sandi>` = sandi `pemantau` di Pi):

   ```text
   docker compose exec mosquitto mosquitto_sub -u pemantau -P <sandi> -t '$SYS/broker/store/messages/count' -v -C 1
   ```

   **Hasilnya (lab penulis):** `$SYS/broker/store/messages/count 59`. Catat angkamu.

#### 10.2 ⭐ Cabut internet rumah, bukan WiFi rumah (2 menit)

Yang diputus hanya jalan Pi → VPS, tanpa pemberitahuan, persis gangguan ISP; Node 1 → Pi lewat WiFi tetap hidup. Pilih satu cara, lalu catat jam cabut (WIB):

- **Router WiFi terpisah dari modem fiber (ONT) ISP:** cabut kabel di colokan WAN router WiFi, atau matikan ONT-nya. WiFi rumah tetap menyala.
- **Router *combo*** (ONT dan WiFi dalam satu kotak, umum dari ISP): mematikannya ikut mematikan WiFi. Pakai pengganti di terminal SSH ke VPS: `docker compose stop mosquitto`, 10 menit kemudian `docker compose start mosquitto` (`Exited` untuk `akun-broker` dan `sertifikat-mqtt` wajar). Jujur saja: broker yang berhenti menolak sambungan seketika, jadi jendela buta tidak teruji; antrean tetap selamat berkat sesi tetap backend ([2.1](#21-tiga-perubahan-di-src-envts-dan-serverts-mqttts-serta-perintahts-8-menit)).
- **Tanpa Pi** (gerbang di laptop, 🔀 Praktik 4): matikan WiFi laptop (berkabel: cabut kabelnya); simulator ke gerbang laptop tetap jalan. Belum diuji penulis.

**Jangan** mematikan Pi (antreannya ikut padam: itu uji listrik padam) dan **jangan** mematikan WiFi rumah (Node 1 tidak sampai ke Pi dan bacaannya hilang: "WiFi rumah putus ≠ internet putus", Konsep 9). Cara yang sama dipakai jalur gratis di [11.9](#119--t3-gratis-internet-rumah-putus-10-menit-riwayat-pi-tetap-utuh-15-menit).

**Kamu lulus langkah ⭐ ini** kalau selama 10 menit laptop di WiFi rumah tidak bisa membuka situs mana pun, sementara Node 1 tetap menyala dan SSH ke Pi tetap jalan (pengganti: `docker compose stop` menulis `Stopped`).

#### 10.3 Selama putus: `Online` yang basi, tombol Lampu, dan Telegram "Node diam" (12 menit)

**Menit ke-1, HP.** Detail Node 1 tetap `Online`, tetapi ±30 detik sesudah bacaan terakhir muncul `data basi` (lab penulis, menit ke-1: `Online · terakhir dilihat 1 menit yang lalu · data basi`), dan grafiknya mulai kosong. Lencana **Live** tetap hijau: HP-mu tersambung ke VPS, yang terputus rumahmu. Celah jujur pertama Konsep 9: Node 1 masih tersambung ke Pi, jadi tak ada yang mengabarkan `offline` (pita "Gerbang rumah terputus" = [🧩 Tingkat 3](#tingkat-3--pita-gerbang-rumah-terputus-kabar-jembatan-sampai-ke-dashboard-buat-dari-nol-6090-menit)). Celah kedua: aturan otomatis server diam tanpa bacaan baru, dan pengaman lokal Node 1 tidak menyala karena hanya menyala bila broker Pi tak terjangkau ([Modul 19](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#10-pengaman-lokal-node-1-menjaga-rumah-saat-server-hilang)); siram dan lampu otomatis Node 1 tetap jalan (Silabus v1.0.29, tabel §2.2).

![Komposit tiga tangkapan layar asli dashboard Rumah Pintar Mini 1.3.0 di VPS tiruan, dibuka dari internet tiruan di mode perangkat Chrome 375 piksel (bukan HP sungguhan) selama internet rumah dicabut 00.42.24 sampai 00.52.48 WIB, Praktik 10.3: gerbang Pi tiruan dilepas dari lorong internet lab, perangkat tetap tersambung ke gerbang. Kiri, menit ke-5,5, Daftar Perangkat: lencana Live tetap hijau (nomor 1); kartu Latihan ruang tamu berlencana Online (nomor 2), Suhu 29.5 °C, terakhir dilihat 6 menit yang lalu · data basi dengan kata data basi berwarna oranye (nomor 3); kartu Kebun (tiruan) Online lewat penghubung, terakhir dilihat 7 menit yang lalu tanpa data basi (nomor 3). Tengah, menit ke-5,5, detail Node 1: node1 Online, terakhir dilihat 6 menit yang lalu · data basi (nomor 3); bagian Kendali dilewati; kartu grafik Suhu 5 menit terakhir kosong, jam 00.44 sampai 00.48, Belum ada bacaan dalam 5 menit terakhir. (nomor 4); diperbarui pukul 00.42.17 WIB, bacaan terakhir sebelum dicabut (nomor 5). Kanan, menit ke-1: sesudah tombol Lampu ditekan, tombol kembali Lampu Mati (nomor 6) dan toast merah Lampu: belum dikonfirmasi perangkat; server mencoba lagi bila perangkat terdengar dalam 2 menit. (nomor 6). Legenda bernomor di bawah: antrean gerbang menahan sekitar 36 pesan saat itu, aturan otomatis server diam, API 504.](aset/online-padahal-terputus.png)

Gambar dari lab penulis (VPS dan CA tiruan, Chrome tanpa layar selebar HP, putaran ulang 10 menit 24 detik); di HP-mu alamatnya `https://iot.namaanda.my.id` dan gemboknya terlihat di bilah alamat. Kartu Kebun tanpa `data basi` itu wajar: jadwalnya 5 menit.

**Menit ke-1 sampai ke-3, HP: tekan Lampu** (lampu **Mati**). Tombol menulis `Menunggu konfirmasi perangkat…`, lalu muncul *toast* dari [3.4](#34-indexhtml-pesan-luring-toast-2-menit-dan-versi-130-4-menit):

```text
Lampu: belum dikonfirmasi perangkat; server mencoba lagi bila perangkat terdengar dalam 2 menit.
```

Turun tidak disimpan ([4.5](#45--perintah-lampu-saat-putus-naik-disimpan-turun-tidak-disimpan-3-menit)): broker tidak menahan perintah ini, backend hanya mengingatnya 2 menit. Pengganti router *combo*: perintah langsung ditolak (`503`, seperti pengganti 4.5).

**Terminal Pi: antrean naik.** Ulangi perintah antrean 10.1 tiap beberapa menit (panah atas, **Enter**). Lab penulis: naik terus dari 59 sampai 125 menjelang sambung (±66 pesan ditahan). Sesudah ±2 menit, `docker compose logs --since 5m mosquitto` di Pi berulang menulis `Connecting bridge pusat (mqtt.namaanda.my.id:8883)` lalu `Error creating bridge: Try again.` (tanpa 9.6): gerbang sudah sadar dan terus mencoba, normal selama putus.

**Menit ke-6, Telegram.** Grafana di VPS tidak mendengar Node 1 dan mengirim 🔴 "Node diam", seperti yang diterima server Telegram tiruan di lab penulis 6 menit sesudah bacaan terakhir:

```text
🔴 Latihan ruang tamu (f00d00000001) tidak mengirim data, terlambat 5.5 menit dari jadwalnya
```

Di Telegram-mu: nama dan `device_id` Node 1-mu. Node 1 sehat; pusat saja yang tidak mendengarnya.

#### 10.4 Sambung lagi: jembatan pulih, susulan tiba (2 menit)

Sesudah 10 menit, pasang lagi kabelnya atau nyalakan ONT (pengganti: `docker compose start mosquitto` di VPS), lalu catat jam sambung = saat laptop bisa membuka situs lagi. Gerbang mencoba jembatan paling lama tiap 30 detik: beberapa detik sampai ±30 detik kemudian jembatan masuk, dan seluruh antrean menyusul dalam hitungan detik dengan `ts` aslinya. Kartu yang sudah terbuka di HP baru berganti sesudah susulan tiba; antrean gerbang kembali ke angka 10.1. Di terminal SSH ke VPS, akar proyek:

```text
docker compose logs --since 20m mosquitto | grep jembatan-pi
```

**Hasilnya (lab penulis, CA tiruan; dipotong, awalan `mosquitto-1  | <detik>:` dibuang):**

```text
Client jembatan-pi [198.51.100.20:53652] disconnected: exceeded timeout.
New bridge connected from 198.51.100.20:39938 as jembatan-pi (p4, c1, k60, u'jembatan-pi').
Client jembatan-pi negotiated TLSv1.3 cipher TLS_AES_256_GCM_SHA384
```

Baris pertama: VPS baru sadar 91 detik sesudah cabut. Dua berikutnya: 7 detik sesudah sambung (putaran gambar 10.3: 28 detik); 64 bacaan yang antre tiba di VPS dalam detik yang sama. Di VPS-mu, alamat sesudah `from` = alamat rumahmu di internet. Lalu:

```text
docker compose logs --since 20m backend | grep perintah
```

**Hasilnya (lab penulis, putaran gambar 10.3; dipotong):**

```text
[00:53:16] INFO: perintah lampu = true (api) ke f00d00000001 tidak dikerjakan lebih dari 2 menit: tidak dikirim lagi
```

Muncul begitu Node 1 terdengar lagi: perintah tangan yang lebih tua dari 2 menit dilupakan (backend 1.4.0, [2.1](#21-tiga-perubahan-di-src-envts-dan-serverts-mqttts-serta-perintahts-8-menit)).

#### 10.5 ⭐ T3: `skrip/cek-susulan.sql` di VPS, tanpa celah dan tanpa dobel (8 menit)

Skripnya sama dengan [4.4](#44--putus-10-menit-di-lan-lalu-skripcek-susulansql-tanpa-celah-tanpa-dobel-11-menit) dan sudah ada di VPS sejak `git clone` di 7.1. ±1 menit sesudah jembatan masuk, di VPS, akar proyek (satu baris; `<device_id>` = Node 1; `mulai` dan `selesai` = jam WIB sedikit sebelum cabut dan sesudah sambung):

```text
docker compose exec -T db psql -U postgres -d rumahpintar -v perangkat=<device_id> -v "mulai=YYYY-MM-DD HH:MM" -v "selesai=YYYY-MM-DD HH:MM" < skrip/cek-susulan.sql
```

**Hasilnya (lab penulis, CA tiruan; cabut 23.29.00, sambung 23.39.38 WIB):**

```text
== Ringkasan (jam WIB) ==
 bacaan | pertama  | terakhir | celah_terbesar | celah_lebih_12_detik | tiba_susulan | kembar
--------+----------+----------+----------------+----------------------+--------------+--------
     90 | 23:27:00 | 23:41:51 | 00:00:11       |                    0 |           58 |      0
(1 row)

== Per menit: jumlah bacaan dan yang tiba belakangan (susulan) ==
 menit | bacaan | susulan | tiba_terakhir
-------+--------+---------+---------------
 23:27 |      6 |       0 | 23:27:50
 23:28 |      6 |       0 | 23:28:50
 23:29 |      6 |       5 | 23:39:46
 23:30 |      6 |       6 | 23:39:46
 23:31 |      6 |       6 | 23:39:46
 23:32 |      6 |       6 | 23:39:46
 23:33 |      6 |       6 | 23:39:46
 23:34 |      6 |       6 | 23:39:46
 23:35 |      6 |       6 | 23:39:46
 23:36 |      6 |       6 | 23:39:46
 23:37 |      6 |       6 | 23:39:46
 23:38 |      6 |       5 | 23:39:46
 23:39 |      6 |       0 | 23:39:51
 23:40 |      6 |       0 | 23:40:51
 23:41 |      6 |       0 | 23:41:51
(15 rows)

== Celah lebih dari 12 detik (kosong = tidak ada bacaan yang hilang) ==
 dari | sampai | jeda
------+--------+------
(0 rows)
```

Cara membacanya:

- Menit putus 23:29–23:38 tetap **6 bacaan**, tersimpan pada waktu kejadiannya. `susulan` hanya menghitung yang tiba lebih dari 60 detik sesudah `ts`-nya: 58 dari 64 yang antre di 10.4. Menit 23:29 hanya 5: bacaan 23:29:00 sampai sebelum cabut.
- `celah_lebih_12_detik 0` dan `(0 rows)`: tak ada bacaan hilang, juga di jendela buta. `celah_terbesar 00:00:11` = irama 10 detik + ±1 detik saat gerbang sibuk.
- `kembar` selalu 0 (kunci `(device_id, ts)`, Konsep 9). Penulis juga mencocokkan yang terbit di gerbang dengan yang tersimpan di VPS: 90 = 90.

Ada celah di awal putus? [🚨](#-kalau-tidak-jalan) *Bacaan hilang …* (lab penulis: broker gerbang yang pernah di-HUP membuang antrean jendela buta). Simpan keluaranmu untuk ➕ F.

**Kamu lulus langkah ⭐ ini (T3)** kalau putus 10 menitmu menghasilkan `celah_lebih_12_detik 0`, daftar celah `(0 rows)`, ±6 bacaan per menit di menit-menit putus, `kembar 0`, dan `tiba_susulan` lebih dari 0.

#### 10.6 Saksi lain: log backend, aturan otomatis, grafik, dan lampu (3 menit)

Di VPS: `docker compose logs --since 20m backend | grep -c 'kiriman ganda dilewati'`. **Hasilnya (lab penulis):** `0`; lebih dari 0 pun boleh (kiriman ulang yang ditolak database). Lalu:

- **Aturan otomatis diam atas susulan:** aturan mengabaikan bacaan yang `ts`-nya lebih tua dari 60 detik. Lab penulis: tanpa satu pun baris `aturan …` untuk susulan, juga untuk 8 bacaan susulan di atas 31 °C (uji lab kode).
- **Riwayat →** lalu **1 jam** di HP: garis Node 1 tanpa lubang di jam putus.
- **Lampu tetap Mati.** Sambung kurang dari 2 menit sesudah menekan tombol? Lampu menyala belakangan, sesuai bunyi *toast* (log: `… perintah dikirim lagi`).
- **Telegram:** `✅ Latihan ruang tamu kembali mengirim data.` (Telegram tiruan) menyusul paling lama ±5 menit sesudah susulan tiba (lab: 33 detik dan 5 menit 15 detik). 🔴 Kebun boleh datang sesaat sesudah sambung; ✅-nya menyusul.

> ⬆️ **Selesai Praktik 10?** Lewati [Praktik 11](#praktik-11--jalur-gratis-semua-di-pi-dan-cloudflare-tunnel-85-menit) (khusus jalur gratis) dan lanjut ke [Praktik 12](#praktik-12--pwa-di-hp-jaringan-seluler-dan-teman-di-kota-lain-40-menit): dashboard menjadi aplikasi di HP, lalu temanmu membukanya dari kota lain.

### Praktik 11 — Jalur gratis: semua di Pi dan Cloudflare Tunnel (85 menit)

> 🖥️ **Alat yang dipakai:** **terminal SSH ke Pi** (Modul 12, misalnya `ssh budi@192.168.1.37`), folder **akar proyek** `rumah-pintar-mini` (pusat) atau `rumah-pintar-mini/edge` (gerbang); **VS Code** di laptop, terminal di **akar proyek** (11.1, 11.4); **dasbor Cloudflare** di Chrome atau Edge (11.7); **HP** dengan data seluler, **MQTTX** di laptop (11.8). Tanpa Kit: simulator `alat/` tetap ke gerbang Pi. Konsep yang dipakai: 10, 9, dan bagian `PROKSI_TEPERCAYA` di Konsep 7.
>
> ⭐ **Wajib untuk jalur gratis** — langkah 11.4, 11.6, 11.7, 11.8, dan 11.9: sidik jari riwayat di Pi sama, gerbang tersambung ke pusat, terowongan menyala, **T1-gratis** dan **T2-gratis** (dashboard terbuka dari luar, broker tidak), lalu **T3-gratis** (riwayat Pi utuh saat internet putus 10 menit).

> [!NOTE]
> **Bagian Cloudflare tidak direkam penulis:** penulis tanpa akun Cloudflare, dan token sungguhan sengaja tidak dipakai di lab. Langkah dasbor 11.7 dari dokumen resmi (dibaca 29 Okt 2026); `cloudflared` yang tersambung, HP, data seluler, dan Pi 2 GB belum dicoba penulis. Yang direkam: "Pi" tiruan dengan pusat di loket 1884, gerbang, jembatan lewat `host-gateway`, `cloudflared` tanpa token, dan kontainer pengganti `cloudflared`.

Urutannya sama dengan [Praktik 7](#praktik-7--jalur-utama-pusat-di-vps-dengan-https-75-menit), dengan Pi sebagai "VPS"; di sini hanya bedanya. Jalur utama melewati praktik ini. *Commit* hanya Caddyfile di 11.1.

#### 11.1 Pi siap menjadi pusat: `git pull`, RAM, dan kartu penyimpanan (6 menit)

Caddy membaca `frontend/caddy/Caddyfile` dari folder proyek, dan versi Modul 27-nya (penerus tepercaya, rute `/grafana/`) disalin di 7.1, yang dilewati jalur gratis. **Laptop:** kerjakan bagian laptop [7.1](#71-git-push-di-laptop-git-clone-di-vps-6-menit): Caddyfile lewat **Copy raw file**, lalu `git add`, `git commit`, dan `git push`. **Pi** (di cabang `fitur/ke-internet` sejak 4.1), satu per satu:

```text
cd ~/rumah-pintar-mini
git pull
```

Gerbang tetap menyala. **RAM:** `free -h`, kolom `total` baris `Mem:`. Pusat dan gerbang di "Pi" lab penulis memakai ±472 MiB saat diam; Pi 2 GB belum diukur. **Kartu:** database kini menulis 24 jam sehari. `findmnt -n -o SOURCE /` menulis `/dev/mmcblk0…` bila sistemmu di microSD (tidak direkam penulis). microSD biasa cepat aus: pakai *high-endurance* ([Silabus §5.3](../../SILABUS.md#53-kit-b--raspberry-pi-sebagai-gateway-dibutuhkan-mulai-modul-12)) atau SSD ([🔬 Modul 12](../../fase-2-konektivitas/modul-12-raspberry-pi-dan-linux/README.md#-bedah-teknis-opsional)).

#### 11.2 `.env` akar di Pi: kolom Pi di tabel nilai per tempat (8 menit)

Di Pi, akar proyek: `cp .env.example .env`. Isi seperti [7.2](#72-env-vps-rahasia-baru-dan-kolom-vps-di-tabel-nilai-per-tempat-10-menit): rahasia **baru** (lemari Pi kosong; baris `docker run` di 7.2), sandi admin Grafana yang kuat (halaman *login*-nya ikut terbuka), serta `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, dan `TOKO_IMAGE` yang sama dengan laptop. Lalu kolom **Pi** tabel 7.2, mulai dari alamat broker pusat:

```text
ip -4 addr show docker0 | grep inet
```

**Hasilnya** (lab penulis): `inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0`. Angka sebelum `/16` = nilai `ALAMAT_MQTT`; bila lain, tulis angkamu. `nano .env`, ubah lima baris ini (tanpa `/` di akhir `CORS_ORIGIN`):

```text
CORS_ORIGIN=https://iot.namaanda.my.id
PORT_MQTT=1884
ALAMAT_MQTT=172.17.0.1
GRAFANA_ALAMAT=https://iot.namaanda.my.id/grafana/
PROKSI_TEPERCAYA=private_ranges
```

Pusat di 1884, karena 1883 di Pi milik broker gerbang. Sisanya biarkan: `ALAMAT_WEB=127.0.0.1` (tamu hanya lewat terowongan); `DOMAIN_WEB`, `DOMAIN_MQTT`, `KONF_PUSAT`, dan `TRUST_PROXY` kosong; `TUNNEL_TOKEN` dan `COMPOSE_PROFILES` di 11.7. Simpan, `chmod 600 .env`, lalu `docker compose config --quiet`. **Hasilnya** (lab penulis): tanpa keluaran = cocok.

#### 11.3 Dua lemari `external` dan `docker compose build` di Pi (12 menit)

Akar proyek, satu per satu:

```text
docker volume create rumahpintar-data
docker volume create rumahpintar-grafana-data
docker compose build
```

**Hasilnya** (lab penulis): nama kedua lemari, lalu `Built` untuk backend `1.4.0` dan web `1.3.0` (arm64, untuk Pi sendiri), seperti [7.4](#74-docker-compose-build-di-vps-sebelum-layanan-lain-menyala-12-menit). Pi 5 penulis tanpa *cache*: ±2–3 menit; Pi 2 GB belum diukur. Memori habis? *Swap* [5.6](#56-swap-2-gb-untuk-build-image-5-menit) (tidak diuji di Pi).

#### 11.4 ⭐ Pindah riwayat ke Pi: sidik jari sama, backend laptop berhenti (12 menit)

Resep [7.5](#75--pindah-riwayat-ke-vps-cadangan-scp-pulihkan-lalu-sidik-jari-sama-14-menit) ke Pi. Kerjakan 11.4–11.6 tanpa jeda: sejak perintah pertama, bacaan rumah tertahan di antrean gerbang.

**Laptop, akar proyek:** `docker compose stop mosquitto`, sidik jari, `pg_dump`, dan `docker compose cp`, persis 7.5; catat sidik jarinya sebagai "Sebelum pindah (11.4)". Token bot kini dipegang Pi ([7.6](#76--satu-backend-per-token-bot-hentikan-backend-laptop-3-menit)), jadi:

```text
docker compose stop backend grafana
```

**Pi, akar proyek:** `mkdir -p backup`. **Laptop** (pengguna dan IP Pi-mu):

```text
scp backup/rumahpintar-2026-10-29.dump budi@192.168.1.37:rumah-pintar-mini/backup/
```

**Pi, akar proyek:** perintah VPS di 7.5 apa adanya, dari `docker compose up -d db` (tunggu `(healthy)`) sampai sidik jari. **Hasilnya** (lab penulis): `pg_restore` seperti 7.5 (tidak direkam ulang), lalu tabel sidik jari yang sama persis dengan 7.5 (`2480`, `89664903e2718360c271405a0edd4f43`).

**Kamu lulus langkah ⭐ ini** kalau sidik jari Pi sama persis dengan "Sebelum pindah (11.4)", dan `docker compose ps` di laptop tidak lagi menampilkan `backend`.

#### 11.5 `docker compose up -d` di Pi, tanpa profil (6 menit)

`COMPOSE_PROFILES` masih bertanda `#`, jadi `cloudflared` belum ikut. Akar proyek: `docker compose up -d`, lalu `docker compose ps -a`. **Hasilnya** (lab penulis, ±8 detik): empat lemari baru `Created`, layanan sekali jalan `Exited (0)`, `backend` `(healthy)`, `mosquitto` di `127.0.0.1:8883->8883/tcp, 172.17.0.1:1884->1883/tcp`, dan `web` di `127.0.0.1:80->80/tcp, 127.0.0.1:443->443/tcp, …`. Semua loket di `127.0.0.1`, kecuali broker pusat di `172.17.0.1:1884` untuk gerbang; 443 dan 8883 dipesan tanpa dipakai. Log `sertifikat-mqtt` menulis `DOMAIN_MQTT kosong: … dilewati`, log `web` empat baris `"warn"` seperti Modul 26 (`server is listening only on the HTTP port, …`). Wajar: HTTPS dipasang di tepi Cloudflare.

#### 11.6 ⭐ Gerbang ke pusat di Pi yang sama: jembatan LAN ke `pusat:1884` (8 menit)

Pi kini punya dua broker: `docker compose exec mosquitto` di **akar proyek** = pusat, di folder **`edge`** = gerbang.

**(a) Akar proyek.** Broker pusat berlemari baru: buat akun `jembatan-pi` dengan sandi BARU, lalu *restart* (izinnya, blok 7 `acl-broker`, sudah ada sejak 4.1):

```text
docker compose exec -u mosquitto mosquitto mosquitto_passwd /mosquitto/data/sandi-broker jembatan-pi
```

```text
docker compose restart mosquitto
```

**Hasilnya** seperti [9.1](#91-akun-dan-izin-jembatan-pi-di-broker-vps-4-menit). Akun `pemantau` untuk kabar `state` (4.3): cara yang sama.

**(b) Folder `edge`.** `nano jembatan/pusat.conf` (salinan [4.2](#42-jembatan-lan-dengan-setelan-modul-27-sesi-pusat-bersih-antrean-di-pi-tetap-7-menit)): ubah `address pusat:1883` menjadi `address pusat:1884`, dan `remote_password` menjadi sandi (a). `nano .env`: `ALAMAT_PUSAT=host-gateway` (tadinya IP laptop). `diff jembatan.contoh.conf jembatan/pusat.conf` sama dengan di 4.2, kecuali `> address pusat:1884` (lab penulis). Buat ulang gerbang (bukan HUP, Konsep 9):

```text
docker compose up -d --force-recreate mosquitto
```

Lalu di `edge` dan di akar proyek: `docker compose logs --since 2m mosquitto | grep -iE 'bridge|jembatan'`. **Hasilnya (lab penulis, dipotong; gerbang lalu pusat):**

```text
mosquitto-1  | 1793293219: Connecting bridge pusat (pusat:1884)
mosquitto-1  | 1793293219: New bridge connected from 172.22.0.1:34438 as jembatan-pi (p4, c1, k60, u'jembatan-pi').
```

`c1` = setelan Modul 27; sesudah `from` = alamat lorong gerbang, di Pi-mu bisa lain. Database "Pi" lab penulis lalu menerima 19 bacaan Node 1 tiruan dalam 2 menit, di atas irama ±12: antrean pindahan ikut tiba (tidak dicocokkan satu per satu). `not authorised`? [🚨](#-kalau-tidak-jalan) *Jembatan `not authorised` …*.

**Kamu lulus langkah ⭐ ini** kalau log pusat Pi memuat `as jembatan-pi (p4, c1, k60, u'jembatan-pi')`; bacaannya terbukti sampai di 11.8.

#### 11.7 ⭐ Cloudflare Tunnel: token di `.env`, rute ke `http://web:80`, dan profil `terowongan` (12 menit)

**Chrome, dasbor Cloudflare** (domain dari [6.2](#62-cloudflare-paket-gratis-ganti-nameserver-lalu-tunggu-aktif-8-menit), *nameserver* aktif menurut [6.4](#64--nslookup-buku-telepon-internet-sudah-mengenal-namamu-5-menit)); label dari dokumen, bisa sedikit berbeda:

1. **Networking** → **Tunnels** → **Create Tunnel**, beri nama.
2. Menurut dokumennya, dasbor lalu menunjukkan perintah `docker run` bertag `latest` yang diakhiri `--token` dan deretan huruf panjang. Jangan dijalankan (`cloudflared` bertag `2026.10.5` sudah ada di `compose.cloud.yml`); salin deretan sesudah `--token` saja ke pengelola sandimu.
3. **Routes** → **Add route** → **Published application**: **Hostname** `iot.namaanda.my.id`, **Service URL** `http://web:80` (layanan Caddy di lorong proyek).
4. Daftar DNS harus memuat CNAME `iot` berawan oranye ke `<id-terowongan>.cfargotunnel.com` ([Konsep 5](#5-domain-dan-dns-buku-telepon-internet)); penulis tidak bisa memastikan dasbor selalu membuatnya. Tidak ada? [🚨](#-kalau-tidak-jalan) *Halaman galat Cloudflare …*.

Token = sandi terowongan: jangan ke Git, forum, atau AI; bocor? Buat terowongan baru, lalu hapus yang lama. **Pi, akar proyek:** `nano .env`, tempel token di `TUNNEL_TOKEN=`, hapus `# ` di depan `COMPOSE_PROFILES=terowongan`, simpan, `docker compose config --quiet`, lalu `docker compose up -d` (`cloudflared` dibuat; layanan sekali jalan `Exited` lagi, wajar). ±20 detik kemudian:

```text
docker compose ps -a cloudflared --format '{{.Service}} {{.Status}}'
```

Yang benar `cloudflared Up …` (log tersambungnya tidak direkam penulis). Token kosong atau salah salin? **Hasilnya** (lab penulis, token kosong; ditambah `docker compose logs cloudflared`, dipotong):

```text
cloudflared Restarting (255) 5 seconds ago
cloudflared-1  | Provided Tunnel token is not valid.
cloudflared-1  | See 'cloudflared tunnel run --help'.
```

Salin ulang tokennya, lalu `docker compose up -d` lagi.

**Kamu lulus langkah ⭐ ini** kalau `cloudflared` tetap `Up` (bukan `Restarting`) dan daftar DNS memuat `iot` menuju terowonganmu.

#### 11.8 ⭐ T1-gratis dan T2-gratis: dashboard dari HP, broker tetap di rumah (6 menit)

**T1-gratis.** HP (WiFi mati, data seluler): buka `https://iot.namaanda.my.id`. Gemboknya milik Cloudflare: amplop dibuka di tepinya, lalu terowongan mengantarnya ke Caddy di Pi (Konsep 10). Masuk dengan akun admin **lama**: lencana **Live** menyala, angka Node 1 berganti. Chrome di laptop (juga lewat Cloudflare): DevTools → **Application** → **Cookies**, `akses` dan `sesi` bertanda **Secure**. Di Pi, akar proyek: `docker compose logs --since 5m backend | grep login`; sesudah `IP` seharusnya alamat HP-mu di internet, bukan `172.…`.

Kepala dari `cloudflared` sungguhan belum diperiksa penulis; lab menirunya: kontainer mengetuk `http://web:80` dengan `X-Forwarded-For: 1.2.3.4, 198.51.100.7` (kiri palsu kiriman tamu, kanan alamat aslinya) dan `X-Forwarded-Proto: https`. **Hasilnya (lab penulis, pengganti `cloudflared`; dipotong):**

```text
HTTP/1.1 200 OK
Set-Cookie: akses=<token>; Max-Age=900; Path=/; HttpOnly; Secure; SameSite=Strict
Set-Cookie: sesi=<token>; Max-Age=604800; Path=/api/auth; HttpOnly; Secure; SameSite=Strict
backend-1  | [00:01:51] INFO: login: akun 1 (admin), sesi 7, IP 198.51.100.7
```

Alamat palsu diabaikan. Tanpa **Secure**, atau semua tamu beralamat lorong? Periksa `PROKSI_TEPERCAYA` dan Caddyfile 11.1. Grafana ikut lewat terowongan di `/grafana/`: sandi admin dari `.env` Pi, akun **Viewer** untuk dibagikan ([7.10](#710-grafana-di-grafana-admin-akun-viewer-dan-dashboard-dari-berkas-5-menit)).

**T2-gratis.** MQTTX di laptop yang memakai *hotspot* HP (dari luar rumah): **Host** `iot.namaanda.my.id`, **Port** `1883`, lalu `8883` dengan sakelar **SSL/TLS** menyala (namanya bisa sedikit beda). Keduanya tidak tersambung: `iot.` menunjuk Cloudflare, yang hanya membawa HTTP; *record* `mqtt.` tidak ada; router tidak membuka pintu. Bunyi gagalnya tidak direkam penulis.

**Kamu lulus langkah ⭐ ini (T1-gratis dan T2-gratis)** kalau HP lewat data seluler membuka dashboard bergembok dan melihat **Live** dengan angka berganti, kedua *cookie* bertanda **Secure**, dan MQTTX dari luar rumah tidak tersambung lewat 1883 maupun 8883.

#### 11.9 ⭐ T3-gratis: internet rumah putus 10 menit, riwayat Pi tetap utuh (15 menit)

Node 1, gerbang, dan pusat ada di rumah: internet putus hanya menutup jalan tamu dari luar, jadi buktinya riwayat utuh, bukan susulan. Tidak direkam penulis.

1. Catat jam (WIB), lalu cabut internet rumah dengan cara [10.2](#102--cabut-internet-rumah-bukan-wifi-rumah-2-menit). Router *combo*: di Pi, akar proyek, `docker compose stop cloudflared`, lalu `docker compose start cloudflared` 10 menit kemudian.
2. Selama putus, HP lewat data seluler seharusnya mendapat halaman galat Cloudflare; SSH ke Pi tetap jalan.
3. Sambung lagi, catat jamnya. `cloudflared` seharusnya tersambung sendiri (belum? `docker compose logs cloudflared`); dashboard terbuka lagi, grafik Node 1 tanpa lubang.
4. Pi, akar proyek: `skrip/cek-susulan.sql` dengan perintah [4.4](#44--putus-10-menit-di-lan-lalu-skripcek-susulansql-tanpa-celah-tanpa-dobel-11-menit).

Baca seperti [10.5](#105--t3-skripcek-susulansql-di-vps-tanpa-celah-dan-tanpa-dobel-8-menit), tetapi `tiba_susulan` boleh 0: tidak ada yang perlu ditahan. Simpan bersama keluaran 4.4 (**T3-gratis (b)**) dan `docker stats --no-stream` untuk [➕ F](#f-simpan-catatan-belajar-bukti-t1t3-sidik-jari-biaya-bulanan-dan-docker-stats).

**Kamu lulus langkah ⭐ ini (T3-gratis)** kalau `cek-susulan.sql` di Pi untuk selang putus menulis `celah_lebih_12_detik 0`, daftar celah `(0 rows)`, dan ±6 bacaan per menit, lalu dashboard terbuka lagi dari HP.

**Naik kelas kelak:** kerjakan [Praktik 5](#praktik-5--jalur-utama-sewa-vps-dan-amankan-pintunya-60-menit) sampai [Praktik 9](#praktik-9--jalur-utama-jembatan-pi--vps-lewat-tls-35-menit). Riwayat dan bot dari Pi (7.5–7.6), `iot` terowongan diganti *record* A ke VPS (6.3), jembatan ke `mqtt.namaanda.my.id:8883`; berkasnya sama, `.env` berganti.

> ⬆️ **Selesai Praktik 11?** Lanjut ke [Praktik 12](#praktik-12--pwa-di-hp-jaringan-seluler-dan-teman-di-kota-lain-40-menit): pasang dashboard di HP lewat alamat Tunnel-mu, lalu minta temanmu membukanya.

### Praktik 12 — PWA di HP, jaringan seluler, dan teman di kota lain (40 menit)

> 🖥️ **Alat yang dipakai:** **HP**-mu (Chrome Android atau Safari iPhone) dengan data seluler; **terminal SSH ke VPS**, folder `/home/rumah/rumah-pintar-mini`, di 12.4 (jalur gratis: **terminal SSH ke Pi**, akar proyek); pesan pribadi ke temanmu. Tanpa *commit*. Konsep yang dipakai: 11.
>
> ⭐ **Wajib** — langkah 12.1 (iPhone: 12.2), 12.3, dan 12.4: dashboard terpasang di HP dan terbuka tanpa bilah alamat, angkanya berganti lewat data seluler, lalu **T1**: temanmu membuka `https://iot.namaanda.my.id` dari jaringannya sendiri dan melihat angka berubah.

> [!NOTE]
> **Tidak direkam penulis.** Penulis tidak punya HP, data seluler, atau teman penguji di kota lain. Langkah iPhone diambil dari Panduan Pengguna iPhone Apple berbahasa Indonesia (dibaca 29 Okt 2026); nama menu pemasangan Chrome Android belum diverifikasi. Kotak **Hasilnya** dari Chrome tanpa layar selebar HP (375 dan 412 px) lewat HTTPS tiruan; gembok, dialog pemasangan, dan ikon di HP tidak tertangkap.

Dashboard-mu kini ber-`https://`, jadi HP mana pun bisa memasangnya ([Konsep 11](#11-pwa-dari-pintasan-menjadi-aplikasi), [3.6](#36--manifest-service-worker-dan-pasang-dashboard-dari-httplocalhost-7-menit)). Mode HP Modul 23 pensiun untuk akses dari luar: `ALAMAT_WEB` laptop boleh kembali `127.0.0.1`. Jalur gratis: langkahnya sama, lewat Tunnel-mu.

#### 12.1 ⭐ Android: pasang dashboard dari Chrome (8 menit)

1. **Chrome** di HP: buka `https://iot.namaanda.my.id` (gembok di bilah alamat), lalu masuk.
2. Menu ⋮ → pilihan pemasangan aplikasi (namanya berbeda per versi), lalu setujui.
3. Ketuk ikon rumah di layar utama (nama pendeknya `Rumah Pintar`): dashboard terbuka tanpa bilah alamat (*standalone*). Pintasan Modul 24 boleh dihapus.

**Hasilnya (lab penulis, 412 px):** `isSecureContext: true`, *service worker* `activated`, *manifest* `errors: []`, daftar galat pemasangan **`[]`**. Tidak ditawari? [🚨](#-kalau-tidak-jalan) *Tawaran pemasangan aplikasi tidak muncul*.

**Kamu lulus langkah ⭐ ini** kalau ikon rumah di layar utama membuka dashboard tanpa bilah alamat (iPhone: lewat 12.2).

#### 12.2 iPhone: Tambah ke Layar Utama dari Safari (6 menit)

Pakai **Safari** (tidak diuji penulis):

1. Buka `https://iot.namaanda.my.id`, lalu masuk.
2. Ketuk ⋯ → **Bagikan** → **Tambah ke Layar Utama** (bila tidak ada: **Edit Tindakan**).
3. Nyalakan **Buka sebagai App Web**, lalu ketuk **Tambah**.

#### 12.3 ⭐ WiFi HP dimatikan: Live lewat data seluler (6 menit)

Matikan WiFi HP, nyalakan data seluler, buka aplikasi dari ikonnya (masuk lagi bila diminta), lalu buka detail Node 1: lencana **Live** menyala dan angka berganti dalam ±20 detik (Node 1 mengirim tiap 10 detik).

**Hasilnya (lab penulis):** detail dibaca dua kali berjarak 21 detik, teksnya berubah (`terakhir dilihat 15 detik yang lalu` → `6 detik yang lalu`).

**Kamu lulus langkah ⭐ ini** kalau **Live** menyala dan angka Node 1 berganti saat HP hanya memakai data seluler.

#### 12.4 ⭐ T1: teman di kota lain membuka dashboard-mu lewat HTTPS (15 menit)

**1. Akun *viewer* sementara** (melihat saja, tanpa tombol kendali). Terminal SSH ke VPS, akar proyek (jalur gratis: Pi, [Praktik 11](#praktik-11--jalur-gratis-semua-di-pi-dan-cloudflare-tunnel-85-menit)); sandi kuat baru diketik dua kali:

```text
docker compose exec backend node src/db/kelola-pengguna.ts tambah <email-teman> "<Nama Teman>" viewer
```

**Hasilnya (lab penulis; surel disamarkan):**

```text
Sandi baru: ************************
Ketik sekali lagi: ************************
akun 3 dibuat: <email-teman> (Teman Kota Lain, viewer)
```

**2. Kirim lewat pesan pribadi**, bukan grup: alamat `https://iot.namaanda.my.id`, surel, dan sandinya.

**3. Teman membuka sendiri** dari jaringannya, tanpa dipandu: gembok, **Masuk**, lencana **Live**, namanya dengan `(viewer)`, detail Node 1 tanpa tombol kendali, angka berganti tanpa muat ulang. Minta tangkapan layarnya, jamnya, dan nama jaringannya. Belum ada teman? Pakai akun ini di HP-mu lewat data seluler, dicatat sebagai pengganti.

**Hasilnya (lab penulis, "HP teman" = Chrome mode perangkat 375 px):** `Teman Kota Lain (viewer)` dan **Live**; bagian kendali tidak tampil; tanpa muat ulang, `diperbarui pukul 00.25.27 WIB` menjadi `00.25.47 WIB` dan kelembapan tanah 51% menjadi 29%.

![Komposit empat tangkapan layar asli dashboard Rumah Pintar Mini 1.3.0 dengan backend 1.4.0 di VPS tiruan, dibuka lewat HTTPS dari internet tiruan (lorong Docker, sertifikat dari CA tiruan Pebble, alamat lab iot.contoh.test sebagai pengganti iot.namaanda.my.id), di mode perangkat Chrome 375 piksel di Linux, bukan HP sungguhan; bilah alamat dan gembok tidak tertangkap. Praktik 12.4, 30 Okt 2026 pukul 00.25 WIB. Kiri atas, halaman Masuk: Email teman@contoh.test dan Sandi berisi titik-titik (nomor 1, akun viewer sementara). Tengah atas, Daftar Perangkat sesudah Masuk: lencana hijau Live (nomor 2), Teman Kota Lain (viewer) (nomor 3), kartu Latihan ruang tamu Online, kunci aktif, Suhu 25.4 °C, terakhir dilihat baru saja (nomor 4), kartu Latihan teras belum terdaftar, dan kartu Kebun (tiruan) Online lewat penghubung (nomor 4). Kiri bawah, detail Node 1 pukul 00.25.27 WIB: node1 Online, langsung grafik Suhu 5 menit terakhir tanpa bagian Kendali (nomor 5), diperbarui pukul 00.25.27 WIB (nomor 6), Kelembapan tanah 51 persen, Air tandon 45 persen. Kanan bawah, 20 detik kemudian tanpa memuat ulang: diperbarui pukul 00.25.47 WIB (nomor 6), Kelembapan tanah 29 persen, Air tandon 61 persen, grafik bergeser. Kolom kanan: legenda bernomor; cookie akses dan sesi bertanda Secure, Socket.IO lewat wss. Akun teman dihapus sesudahnya. Data dari simulator dan Kebun tiruan.](aset/dashboard-dari-luar.png)

Gambar dari lab penulis (VPS dan CA tiruan, bukan HP sungguhan; surel di layar **Masuk** = akun lab); di HP temanmu, bilah alamatnya menampilkan gembok dan `https://iot.namaanda.my.id`.

**4. Hapus akunnya** sesudah bukti terkumpul:

```text
docker compose exec backend node src/db/kelola-pengguna.ts hapus <email-teman>
```

**Hasilnya (lab penulis):** `<email-teman> dihapus beserta semua sesinya`.

**Kamu lulus langkah ⭐ ini (T1)** kalau temanmu (atau HP-mu lewat data seluler, dicatat sebagai pengganti) melihat gembok, **Live**, dan angka Node 1 berubah dari luar rumahmu, lalu akunnya sudah dihapus.

#### 12.5 Catat bukti T1, lalu versi baru aplikasi (5 menit)

Catat untuk [➕ F](#f-simpan-catatan-belajar-bukti-t1t3-sidik-jari-biaya-bulanan-dan-docker-stats): jam (WIB), jaringan dan kota, siapa yang membuka, dan tangkapannya; tanpa sandi dan surel temanmu.

Sesudah image web kelak dibangun ulang, versi baru tampil pada pembukaan berikutnya: tutup aplikasi dari daftar aplikasi terakhir, lalu buka lagi; masih versi lama? Ulangi sekali. Isian formulir aman ([🚨](#-kalau-tidak-jalan) *Versi lama dashboard terus tampil di HP atau browser*).

> ⬆️ **Selesai Praktik 12?** Semua syarat lulus jalurmu sudah terbukti. [Praktik 13](#praktik-13--opsional-perangkat-di-lokasi-lain-lewat-mqtts-tanpa-gerbang-20-menit) opsional dan butuh broker VPS (jalur utama); kalau dilewati, lanjut ke [➕ Tambahan](#-tambahan-ke-rumah-pintar-mini).

### Praktik 13 — (Opsional) Perangkat di lokasi lain lewat `mqtts://`, tanpa gerbang (20 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** di laptop, terminal di folder `alat`; **Bruno** (*environment* **internet**); **terminal SSH ke VPS**, folder `/home/rumah/rumah-pintar-mini`. Tanpa *commit* (`alat/.env` di luar Git). Konsep yang dipakai: 8.

Bayangkan papan di kebun atau rumah nenek, jauh dari Pi-mu: ia masuk langsung ke pintu 8883 VPS dengan amplop TLS (skenario opsional Silabus). Perannya dimainkan simulator `alat/` apa adanya, perangkat latihan `f00d00000001`. Jalur gratis: lewati, brokernya hanya di rumah.

#### 13.1 Perangkat latihan dan akunnya di broker VPS (8 menit)

1. **Backend VPS.** `f00d00000001` terdaftar sejak Modul 21 dan ikut pindah di 7.5, jadi `KUNCI_F00D00000001` di `alat/.env` tetap berlaku. Belum terdaftar atau kuncinya hilang? Bruno, *environment* **internet** (ganti dulu `baseUrl`-nya ke domainmu; Bruno tidak diuji penulis): **login admin**, lalu **daftarkan perangkat latihan** atau **ganti kunci perangkat latihan**; salin kuncinya ke `alat/.env`.
2. **Broker VPS** (pola [8.2](#82-akun-pemeriksa-jembatan-pi-dan-pemantau-di-broker-vps-5-menit)): nama akun = `device_id`, sandinya = kunci itu, ditempel dua kali. Lalu *restart*:

```text
docker compose exec -u mosquitto mosquitto mosquitto_passwd /mosquitto/data/sandi-broker f00d00000001
```

```text
docker compose restart mosquitto
```

Jembatan Pi dan backend tersambung lagi sendiri; bacaan sesaat itu ditahan Pi. Daftar izin tetap: butir 1 `edge/acl-broker` mengurung setiap perangkat di topiknya sendiri.

> 🔀 **Tanpa Kit:** `f00d00000001` sudah menjadi Node 1-mu lewat Pi. Daftarkan `f00d00000002` (ubah `device_id` di Bruno), buat akunnya di broker VPS, simpan kuncinya di `alat/.env.vps` (`KUNCI_F00D00000002=…`; `.env.*` diabaikan Git), lalu di 13.2 pakai `--env-file=.env.vps`, angka `2`, dan `grep f00d00000002`: perangkat pertama dilewati (`kunci belum ada di alat/.env`), yang kedua `online` (cara lab penulis).

#### 13.2 Simulator ke `mqtts://mqtt.namaanda.my.id:8883` (8 menit)

Di terminal folder `alat`, perhatikan `mqtts://` (dengan amplop), **nama** broker (sertifikatnya untuk nama, bukan IP), dan 8883. Tanpa berkas CA: Node.js sudah membawa akar ISRG Root X1 dan X2 (lab penulis memberinya akar CA tiruan lewat `NODE_EXTRA_CA_CERTS`).

```text
node --env-file=.env simulator-perangkat.js mqtts://mqtt.namaanda.my.id:8883 1
```

**Hasilnya (lab penulis, CA tiruan; dipotong):**

```text
1 perangkat palsu menuju mqtts://mqtt.namaanda.my.id:8883. …
f00d00000001: online
```

Di VPS: `docker compose logs --since 2m mosquitto | grep f00d00000001`. **Hasilnya (lab penulis; awalan `mosquitto-1  | <detik>:` dibuang):**

```text
New client connected from 198.51.100.10:36770 as f00d00000001 (p4, c1, k15, u'f00d00000001').
Client f00d00000001 negotiated TLSv1.3 cipher TLS_AES_256_GCM_SHA384
```

`c1` = sesi bersih, seperti Node 1. Kartunya di dashboard VPS **Online**. Berhenti dengan **Ctrl + C**.

#### 13.3 Batasnya: tanpa antrean luring, dan ESP32 langsung TLS (4 menit)

- **Tanpa antrean luring.** Tidak ada Pi yang menahan: internet di lokasi itu putus = bacaan selama itu hilang. Karena itu Node 1 di rumah tetap lewat gerbang.
- **Kuncinya aman di jalan:** terbungkus amplop, tak terbaca penyadap ([8.5](#85-bukti-dari-lab-penulis-penyadap-tidak-bisa-membaca-kunci-lagi-3-menit)).
- **ESP32 sungguhan** butuh `WiFiClientSecure` dengan akar ISRG Root X1 (+X2), nama `mqtt.namaanda.my.id`, 8883, akun di broker VPS, dan jam NTP untuk `ts`: [🔬](#-bedah-teknis-opsional) *ESP32 langsung TLS ke VPS* dan [🧩 Tingkat 1](#tingkat-1--cuaca-modul-10-tanpa-setinsecure-periksa-kartu-identitas-server-ubah-sedikit-20-menit). Belum dikompilasi penulis; firmware Node 1 tetap 1.6.0.
- Tidak dipakai lagi? Ulangi perintah akun 13.1 dengan `-D` sesudah `mosquitto_passwd`, lalu *restart* (tidak direkam penulis).

> ⬆️ **Selesai Praktik 13?** Lanjut ke [➕ Tambahan](#-tambahan-ke-rumah-pintar-mini); [🧩 Tantangan](#-tantangan-mandiri) boleh dikerjakan sesudahnya, di cabang baru dari `main`.

## 🚨 Kalau Tidak Jalan?

Klik judul yang mirip masalahmu (Compose dasar: [🚨 Modul 26](../modul-26-docker-compose/README.md#-kalau-tidak-jalan); akun dan ACL broker: [🚨 Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#-kalau-tidak-jalan)). Lirik dulu `docker compose ps -a` dan `docker compose logs <layanan>` di mesin yang bermasalah (gerbang: folder `edge` di Pi). Galat dikutip dari lab penulis (internet dan CA tiruan), kecuali yang ditandai "prototipe riset" atau "tidak direkam"; arti pesan berbahasa Inggris di sebelahnya. Bertanya di forum atau ke AI? Tempel log, jangan `.env`, token, kunci, atau keluaran `docker compose config`.

<details>
<summary><b>Petunjuk lama → yang benar untuk versi kita (Caddy 2.11.7, Mosquitto 2.1.2, Let's Encrypt 2026–2028, <code>cloudflared</code> 2026.10.5, vite-plugin-pwa 2.0.0)</b></summary>

| Petunjuk lama | Yang benar untuk versi kita | Kenapa |
| :--- | :--- | :--- |
| `certbot` + salin tangan | Caddy meminta dan memperbarui sendiri | Konsep 6–7 |
| "sertifikat 90 hari" | 90 hari sampai 9 Feb 2027, 64 hari mulai 10 Feb 2027, 45 hari mulai 16 Feb 2028 | Let's Encrypt |
| "Let's Encrypt menyurati sebelum kedaluwarsa" | berhenti sejak 4 Jun 2025 | pantau sendiri (Modul 30) |
| jembatan `topic # out 1` + `cleansession false` | topik sempit, `cleansession true` + `local_cleansession false`, `upgrade_outgoing_qos true`, `autosave_interval 30` | Konsep 9 |
| `bridge_capath /etc/ssl/certs` | `bridge_cafile /etc/ssl/certs/ca-cert-ISRG_Root_X1.pem` | akarnya ada di image |
| `docker compose kill -s SIGHUP mosquitto` | VPS: `docker compose exec mosquitto kill -HUP 1`; gerbang Pi: `restart` atau `up -d --force-recreate` | `kill -s` membatalkan aturan bangkit; HUP gerbang membuang antrean (lab) |
| "cek dengan `mosquitto --test-config`" | jangan di broker yang menyala: *restart*, baca log | menimpa `mosquitto.db` |
| `trustProxy: true` atau `1` | `TRUST_PROXY=uniquelocal` | `true` memercayai pemalsu; angka ditolak |
| `mosquitto_sub --cafile …` wajib | 2.1: `-p 8883` otomatis TLS + akar sistem; uji polos `--no-tls` | *man page* 2.1 |
| `cloudflared:latest` (contoh dasbor) | `cloudflare/cloudflared:2026.10.5` | `latest` berubah sendiri |
| `setInsecure()` | akar diperiksa (🧩 Tingkat 1) | amplop tanpa kartu |
| `vite-plugin-pwa` 0.x, `npm audit fix --force` | `2.0.0` persis | `--force` memasang 0.2.1 |
| "Nginx butuh certbot" | modul ACME resmi Nginx | 🔬 |

</details>

**Sertifikat dan Caddy**

<details>
<summary><b>Caddy tidak mendapat sertifikat: DNS belum menunjuk, pintu 80 atau 443 tertutup, <i>record</i> AAAA, atau batas 5 per minggu</b></summary>

Di VPS: `docker compose logs web | grep -E 'error|challenge'`. Periksa urut: (1) `nslookup iot.namaanda.my.id 1.1.1.1` (juga `mqtt.`) menjawab IP VPS ([6.4](#64--nslookup-buku-telepon-internet-sudah-mengenal-namamu-5-menit)); (2) 80 dan 443 terbuka: `ALAMAT_WEB=0.0.0.0` di `.env`, *firewall* panel penyedia bila ada (ufw tidak menjaga loket Docker); (3) tanpa *record* AAAA (loket `0.0.0.0` hanya IPv4); (4) batas: 5 kartu bernama persis sama per 7 hari, tak bisa ditawar, jadi jangan `down -v` (lemari `rumahpintar_data-caddy` ikut hilang). Gagal beruntun membuat penerbitan nama itu dijeda, bukan akunmu diblokir.

Caddy mencoba lagi sendiri. Sesudah penyebabnya beres, `docker compose restart web` sekali saja (batas 5 kegagalan validasi per nama per jam). Lab penulis (CA tiruan): nama tanpa *record* → `"msg":"challenge failed"`; keterangan Let's Encrypt sungguhan tidak direkam.

</details>

<details>
<summary><b><code>sertifikat-mqtt</code> berhenti dengan <code>GAGAL: 5 menit tanpa sertifikat …</code>, lalu <code>mosquitto</code> tidak menyala</b></summary>

Penyalin menunggu kartu `mqtt.` paling lama 5 menit, lalu menulis `GAGAL: 5 menit tanpa sertifikat mqtt.namaanda.my.id dari Caddy. Periksa: docker compose logs web` (exit 1). `mosquitto` baru dinyalakan sesudah penyalin sukses, jadi broker dan backend tertahan `Created`. Bereskan Caddy, lalu `docker compose up -d`. Lab penulis: `service "sertifikat-mqtt" didn't complete successfully: exit 2` dan `sh: can't open '/skrip/salin-sertifikat.sh': No such file or directory` (berkas tidak ada) = `skrip/` belum disalin ([2.3](#23-composecloudyml-modul-27-dan-blok-di-internet-di-env-laptop-4-menit)).

</details>

<details>
<summary><b>Browser memperingatkan <code>NET::ERR_CERT_…</code> di <code>https://iot.namaanda.my.id</code></b></summary>

Akhiran kode menyebut pemeriksaan yang gagal ([Konsep 6](#6-sertifikat-dibahas-tuntas-rantai-nama-dan-tanggal)): `…AUTHORITY_INVALID` = rantai (penerbit tak dikenal, seperti di KC; satu-satunya yang direkam penulis), `…COMMON_NAME_INVALID` = nama, `…DATE_INVALID` = tanggal. Sebabnya bisa: membuka IP VPS atau nama lain (kartu hanya untuk `iot.` dan `mqtt.namaanda.my.id`), atau jam laptop/HP salah. Jangan klik **Lanjutan** untuk dashboard sungguhan: itulah `setInsecure()` versi browser.

</details>

<details>
<summary><b><code>KONF_PUSAT</code> keliru: broker tidak menyala, atau <code>bind source path does not exist</code></b></summary>

Lab penulis, `KONF_PUSAT=pusat-internet.cnf` (salah ketik; berkas yang dipasang tidak ada):

```text
Error response from daemon: invalid mount config for type "bind": bind source path does not exist: /home/rumah/rumah-pintar-mini/edge/pusat-internet.cnf
```

Compose tidak membuat folder pengganti. Betulkan `.env` (VPS: `KONF_PUSAT=pusat-internet.conf`), lalu `docker compose up -d`. `pusat-internet.conf` tanpa `DOMAIN_MQTT` juga membuat broker gagal: kartunya tidak pernah disalin (tidak direkam penulis). Laptop dan Pi jalur gratis: `KONF_PUSAT` kosong.

</details>

**Mosquitto dan pintu 8883**

<details>
<summary><b><code>Unable to load server certificate</code> atau <code>Unable to load server key file</code>, dengan <code>Permission denied</code></b></summary>

Prototipe riset penulis, lemari Caddy dipasang langsung ke broker:

```text
Error: Unable to load server certificate "/caddy/caddy/certificates/…/mqtt.namaanda.my.id.crt". Check certfile.
OpenSSL Error [0]: error:8000000D:system library::Permission denied
```

Broker turun hak menjadi `mosquitto` (uid 1883) sebelum membaca kartu milik root (*Permission denied* = izin ditolak), lalu berhenti ([Konsep 8](#8-tls-untuk-mqtt-pintu-8883-salinan-sertifikat-dan-muat-ulang)). `… Check keyfile.` = kuncinya, misalnya salinan tangan. Samakan `volumes:` `mosquitto` dengan berkas modul (hanya `data-sertifikat`), tanpa *symlink*, lalu `docker compose up -d`: `sertifikat-mqtt` menyalin dan membetulkan pemiliknya (cek seperti 8.1).

</details>

<details>
<summary><b>Broker jatuh bangun sesudah <code>restart</code>, atau <code>Error when reloading certificate</code> sesudah HUP</b></summary>

Prototipe riset penulis, `broker.key` milik root: `restart` → `Restarting (1)` berulang (6 kali dalam ±12 detik) dengan `Error: Unable to load server key file …`. HUP justru aman: `Error when reloading certificate '/mosquitto/sertifikat/broker.crt' or key '/mosquitto/sertifikat/broker.key'.` (gagal memuat ulang), broker tetap memakai kartu lama. Di VPS: `docker compose run --rm sertifikat-mqtt` (membetulkan pemilik), lalu `docker compose restart mosquitto` bila jatuh bangun, atau `docker compose exec mosquitto kill -HUP 1` bila masih jalan.

</details>

<details>
<summary><b><code>wrong version number</code> di log broker, atau <code>mosquitto_sub --no-tls</code> diam lalu exit 255</b></summary>

Di [8.3](#83--t2a-tanpa-tls-ditolak-di-8883-dan-1883-tak-terjangkau-dari-luar-10-menit) itulah yang diharapkan (T2a): klien polos di pintu amplop; broker menulis `… wrong version number` (yang datang bukan TLS) dan `disconnected: Protocol error.`. Diam lalu `255` = ditolak, bukan macet (`-d`: `Client null sending CONNECT` berulang). Padahal ingin tersambung? Kliennya lupa amplop: sakelar **SSL/TLS** MQTTX mati, `mqtt://` alih-alih `mqtts://` (mqtt.js: `ECONNRESET`), atau perangkat tanpa `WiFiClientSecure` (🔬).

</details>

<details>
<summary><b><code>certificate verify failed</code>, <code>unable to get local issuer certificate</code>, atau <code>ERR_TLS_CERT_ALTNAME_INVALID</code></b></summary>

Kartunya ditolak klien (prototipe riset penulis):

- **Nama:** `mosquitto_sub -d` ke IP VPS → `… certificate verify failed` (pemeriksaan gagal); mqtt.js ke `iot.` di 8883 → `ERR_TLS_CERT_ALTNAME_INVALID …` (nama tidak tercantum). Pakai `mqtt.namaanda.my.id`, juga di `address` jembatan.
- **Rantai:** klien tanpa akar yang cocok → `unable to get local issuer certificate` (penerbit tak dikenal). Pakai akar sistem; jembatan: `bridge_cafile` contoh apa adanya.
- **Tanggal:** jam Pi atau laptop yang salah.

Jembatan hanya mengulang `Connecting bridge pusat …`; alasannya di log gerbang tidak direkam penulis.

</details>

<details>
<summary><b><code>certificate has expired</code>, <code>Error: Protocol error</code>, atau <code>Unable to connect (A TLS error occurred).</code></b></summary>

Lab penulis, salinan di 8883 dibiarkan kedaluwarsa: simulator `certificate has expired` (kartu kedaluwarsa), `mosquitto_sub` `Error: Protocol error` (exit 14). Jembatan yang tersambung tetap jalan, sambungan **baru** ditolak (juga jembatan yang putus sebentar). Di VPS: `sh skrip/perbarui-sertifikat-mqtt.sh`, lalu `crontab -l` ([8.6](#86--perpanjangan-skripperbarui-sertifikat-mqttsh-dan-cron-mingguan-8-menit)). `Error: Protocol error`, juga `Unable to connect (A TLS error occurred).` (exit 1), muncul pula bila akarnya tak dikenal (lab, CA tiruan): lipatan di atas.

</details>

<details>
<summary><b>Backend atau jembatan tersambung lalu terputus bergantian: <code>use_username_as_clientid</code> hilang di pintu 8883</b></summary>

Tanda bahaya di log VPS: `as backend (… u'<akun lain>')` atau `as jembatan-pi (… u'<akun lain>')`, diselingi `session taken over`. Baris itu berlaku per pintu; tanpanya di bawah `listener 8883`, akun mana pun bisa memakai nama `backend` dan saling menendang dengan backend-mu (uji pemeriksa penulis: 8 dari 8 bacaan tertahan hilang). Samakan `edge/pusat-internet.conf` dengan berkas modul, `docker compose restart mosquitto`, ulangi [8.4](#84-nama-klien-lewat-8883-tidak-bisa-dipinjam-akun-lain-4-menit): harus `as pemeriksa`.

</details>

<details>
<summary><b>Broker mati Senin pagi: <code>acl-broker</code> rusak, lalu HUP dari cron</b></summary>

Cron memuat ulang broker VPS tiap Senin 03.17 jam VPS (UTC; 10.17 WIB), dan muat ulang membaca lagi `acl-broker`: suntingan salah ketik yang belum pernah di-*restart* menghentikan broker tanpa ada yang menunggui. Di VPS: `docker compose logs --since 3h mosquitto`; betulkan (`git diff edge/acl-broker`), `docker compose restart mosquitto`, baca log sampai `mosquitto version 2.1.2 running`. Sesudah mengubah `acl-broker` atau `*.conf`, *restart* saat itu juga.

</details>

**Jembatan dan susulan**

<details>
<summary><b><code>Error creating bridge: Try again.</code> terus-menerus, juga sesudah pindah VPS</b></summary>

Selama internet rumah putus, gerbang mengulang `Connecting bridge pusat (mqtt.namaanda.my.id:8883)` lalu `Error creating bridge: Try again.` (lab penulis; nama broker tak bisa ditanyakan, coba lagi nanti): normal, jembatan masuk lagi dalam ±30 detik sesudah internet kembali. Terus-menerus padahal internet jalan: `address` di `edge/jembatan/pusat.conf` salah ketik, atau *record* `mqtt` belum ada. Pindah VPS atau IP berganti: perbarui *record* A dan baris `extra_hosts` 9.6 bila dipakai, lalu di Pi `git pull` dan `docker compose up -d --force-recreate mosquitto`.

</details>

<details>
<summary><b>Jembatan <code>not authorised</code>: sandi <code>jembatan-pi</code> berbeda per broker, atau <code>ALAMAT_PUSAT</code> kosong</b></summary>

Broker tujuan menolak akun jembatan (*not authorised* = tidak diizinkan; bunyi di log gerbang tidak direkam penulis) dan tidak pernah menulis `New bridge connected`. (1) `remote_password` di `edge/jembatan/pusat.conf` = sandi `jembatan-pi` di broker **tujuannya**: laptop (4.2), VPS (8.2), atau pusat Pi jalur gratis (11.6); sandinya sengaja berbeda. (2) Sesudah `mosquitto_passwd`, broker tujuan di-*restart*. (3) Kit B ke laptop: `ALAMAT_PUSAT` kosong = `host-gateway`, jembatan mengetuk Pi sendiri; isi IP laptop. Lalu di `edge`: `docker compose up -d --force-recreate mosquitto`.

</details>

<details>
<summary><b>Jembatan Kit B tidak tersambung lagi sesudah kode Modul 27</b></summary>

`.env` laptop tanpa `ALAMAT_MQTT=0.0.0.0` ([1.4](#14--kit-b-alamat_mqtt-di-env-laptop-supaya-jembatan-pi-tetap-tersambung-3-menit)): 1883 hanya untuk laptop sendiri, tanpa peringatan. Lab penulis: `docker compose ps mosquitto` menulis `127.0.0.1:1883->1883/tcp`, log gerbang berulang (sambungan terputus; coba lagi 30 detik lagi):

```text
Connecting bridge pusat (pusat:1883)
Client local.jembatan-pi [(null):0] disconnected: Broken pipe.
Bridge pusat next backoff will be 30000 ms
```

Tambahkan barisnya, `docker compose up -d mosquitto`, pastikan `0.0.0.0:1883->1883/tcp`; jembatan masuk lagi dalam ±30 detik (lab: 21 detik). Di jaringan rumahmu bunyinya bisa lain.

</details>

<details>
<summary><b>Kabar <code>jembatan-pi/state</code> tidak pernah tiba</b></summary>

Langganan diam terus padahal jembatan tersambung: (1) blok `7) jembatan-pi` di `edge/acl-broker` broker **pusat** memuat `topic write $SYS/broker/connection/jembatan-pi/state` (`#` tidak mencakup topik `$`; salin berkas modul, *restart* pusat); (2) `edge/jembatan/pusat.conf` memuat `notifications true` (lalu buat ulang gerbang); (3) topik ditulis dalam petik tunggal: di bash, `$SYS` di dalam petik ganda lenyap. `Connection Refused: not authorised` = akun `pemantau` belum ada di broker itu.

</details>

<details>
<summary><b>Bacaan hilang sesudah broker pusat di-<i>restart</i>, atau lampu menyala beberapa menit kemudian</b></summary>

**Bacaan hilang**, tiga sebab:

- **Broker gerbang pernah di-HUP.** Lab penulis, 2 dari 2 putaran: sesudah `kill -HUP 1` di gerbang, 12 bacaan jendela buta hilang saat gerbang menyadari putus (antrean turun 71 → ±60); tanpa HUP, 0 hilang. Penyebabnya belum diteliti. Di Pi selalu `docker compose up -d --force-recreate mosquitto` atau `restart`, juga sebelum uji putus.
- **Backend 1.3.0** (sesi bersih): antrean yang tiba sebelum backend berlangganan lagi hilang (lab kode: 1 dari 4 kali broker pusat dimatikan lalu dinyalakan). Log `as backend (p4, c1, …)` = lama, `c0` = 1.4.0 ([2.1](#21-tiga-perubahan-di-src-envts-dan-serverts-mqttts-serta-perintahts-8-menit)).
- **`gerbang.conf` tanpa `upgrade_outgoing_qos true`**: lab, lubang 1–2 menit di awal putus.

**Lampu menyala menit kemudian:** jembatan masih `cleansession false` (log VPS `as jembatan-pi (p4, c0, …)`; ulangi 4.2/9.2) atau backend 1.3.0. Lab penulis, setelan lama: lampu bergerak 3–4 menit sesudah dashboard melapor gagal, dengan log `ack c-… tiba, tetapi tidak ada perintah yang menunggunya`. Wajar bila internet kembali kurang dari 2 menit sesudah tombol ditekan: `… perintah dikirim lagi`, sesuai *toast*.

</details>

<details>
<summary><b>Dashboard menulis <code>Online</code> padahal internet rumah putus</b></summary>

Celah yang diketahui ([Konsep 9](#9-jembatan-simpan-teruskan-siapa-menahan-apa)): Node 1 tetap tersambung ke Pi, jadi tak ada yang mengabarkan `offline` ke VPS. Tandanya, sesudah bacaan terakhir: `· data basi` ±30 detik (Kebun: 16 menit), 🔴 "Node diam" ±6 menit. `$SYS/broker/connection/jembatan-pi/state 0` di VPS = gerbang putus (pita di dashboard: 🧩 Tingkat 3). Selama itu aturan otomatis server diam dan pengaman lokal Node 1 tidak menyala.

</details>

**Backend, Caddy, dan Grafana**

<details>
<summary><b>403 saat <i>login</i>, atau server berhenti dengan <code>bukan alamat halaman</code>: <code>CORS_ORIGIN</code></b></summary>

Lab penulis, halaman dari alamat di luar `CORS_ORIGIN`: `{"pesan":"permintaan dari halaman http://iot.namaanda.my.id ditolak"} [403]`. VPS dan Pi jalur gratis: persis `CORS_ORIGIN=https://iot.namaanda.my.id`. Dengan `/` di akhir, backend 1.4.0 menolak menyala: `migrasi` exit 1 seperti lipatan berikut, lognya memuat `… bukan alamat halaman: …` (dari kode; tidak direkam). Betulkan `.env`, `docker compose up -d`.

</details>

<details>
<summary><b>429 untuk semua tamu, <i>cookie</i> tanpa <code>Secure</code>, atau angka di <code>TRUST_PROXY</code> ditolak</b></summary>

Lab penulis, `TRUST_PROXY=false` di VPS: *cookie* `akses` tanpa `Secure`, dan sesudah tamu A salah sembilan kali, tamu B dari alamat lain ikut `429` (semua tamu dikira Caddy). Hapus barisnya (bawaan Compose `uniquelocal`), `docker compose up -d backend`, cari `penerus tepercaya (TRUST_PROXY): uniquelocal` di log (7.9). `TRUST_PROXY=1`: `service "migrasi" didn't complete successfully: exit 1`, backend `Created`, dan `docker compose logs migrasi`:

```text
migrasi-1  | Setelan TRUST_PROXY di .env: angka (jumlah hop) tidak dipakai Fastify 5 (tidak dipercaya sama sekali); di balik Caddy tulis uniquelocal
```

Jalur gratis: tanpa `PROKSI_TEPERCAYA=private_ranges`, semua tamu dikira `cloudflared`.

</details>

<details>
<summary><b><code>port is already allocated</code> untuk 443 atau 8883 di laptop</b></summary>

Compose Modul 27 memesan `127.0.0.1:443` dan `127.0.0.1:8883` di laptop juga; Docker menolak bila program lain (VPN, server web) memakainya. Cari pemakainya ([🔁 Langkah 5](#langkah-5--siapa-memakai-loket-80-443-1883-dan-8883)), atau tulis `PORT_HTTPS=8443` dan `PORT_MQTTS=8884` di `.env` laptop, lalu `docker compose up -d`. Di VPS biarkan 443 dan 8883.

</details>

<details>
<summary><b><code>Error: Cannot find module '/app/src/db/migrasi.ts'</code> di VPS</b></summary>

Lab kode penulis (modul tidak ditemukan): klon dibuat dengan `umask 077`, jadi berkasnya hanya terbaca pemiliknya, sedangkan image berjalan sebagai pengguna `node`. Cek `umask` (`0077`; Ubuntu biasanya `0002` atau `0022`). Di akar proyek VPS: `chmod -R go+rX backend frontend edge grafana skrip` (`.env` tetap `600`; belum diuji persis), lalu `docker compose build` dan `docker compose up -d`.

</details>

<details>
<summary><b>Telegram <code>409 Conflict</code>: dua backend memegang satu token bot</b></summary>

Satu token bot untuk satu backend (7.6). Lab penulis Modul 26, backend kedua: `ERROR: bot Telegram berhenti: Call to 'getUpdates' failed! (409: Conflict: …)` (bentrok). Laptop: `docker compose stop backend` (mode kembang: **Ctrl + C**); VPS (jalur gratis: Pi): `docker compose restart backend`, karena bot tidak pulih sendiri.

</details>

<details>
<summary><b><code>/grafana/</code> menampilkan "Halaman tidak ditemukan" milik dashboard</b></summary>

Pekerja latar menjawabnya dengan cangkang dashboard: `navigateFallbackDenylist` tanpa `/grafana` ([3.3](#33-viteconfigts-manifest-service-worker-dan-tiga-jalur-yang-selalu-ke-jaringan-6-menit)), atau pekerja latar lama. Samakan berkasnya, bangun ulang image web, muat ulang dua kali (atau **Clear site data**). Di laptop, Grafana di `http://localhost:3000`, bukan `/grafana/`. `/sw.js` di bilah alamat juga dijawab begitu: wajar.

</details>

<details>
<summary><b>Grafana menolak sandi yang benar, atau <i>login</i> Grafana lewat IP LAN gagal</b></summary>

Sesudah beberapa kali salah, Grafana sementara menolak juga sandi yang benar, diam-diam (lab penulis: `Invalid username or password` = nama atau sandi salah, pulih dalam beberapa menit): tunggu, lalu coba sekali. Lewat `http://<IP LAN>/grafana/`, *cookie* Grafana bertanda `Secure` tidak disimpan browser: pakai `http://localhost:3000` di laptop atau alamat `https://`.

</details>

**Aplikasi di HP (PWA)**

<details>
<summary><b>Tawaran pemasangan aplikasi tidak muncul</b></summary>

Bukan konteks aman (`http://<IP LAN>` mode HP Modul 24; pakai `https://` atau `http://localhost`, [Konsep 11](#11-pwa-dari-pintasan-menjadi-aplikasi)); sudah terpasang (cari ikon rumah); atau DevTools → **Application** → **Manifest** menulis galat, misalnya ikon 192/512 yang tidak diunduh lewat **Download raw file** (3.2). **Service workers** harus `activated`. iPhone memasang lewat **Bagikan** (12.2).

</details>

<details>
<summary><b>Versi lama dashboard terus tampil di HP atau browser</b></summary>

Versi baru diambil di belakang layar dan tampil pada pembukaan berikutnya; tab tidak memuat ulang sendiri, isian formulir aman (lab penulis: muat ulang kedua). Tutup semua tab dashboard (HP: tutup aplikasinya dari daftar terakhir), buka lagi, ulangi sekali. Masih lama? Pastikan image web baru menyala (3.5). Jalan terakhir: **Clear site data**.

</details>

<details>
<summary><b><code>npm run dev</code> menampilkan dashboard lama: <i>service worker</i> dari <code>npm run preview</code></b></summary>

Keduanya di `http://localhost:5173`, dan pekerja latar hasil `preview` terus menyajikan cangkang lama (3.7). DevTools → **Application** → **Storage** → **Clear site data**, lalu muat ulang (*cookie* login ikut terhapus). Penangkal otomatis tidak dipasang: ulangi setiap kali selesai memakai `preview`.

</details>

**VPS dan SSH**

<details>
<summary><b>SSH menolak: <code>Permission denied (publickey)</code></b></summary>

Pesan OpenSSH (izin ditolak; tidak direkam penulis). Untuk `root` sesudah [5.4](#54--matikan-login-sandi-dan-root-00-kunciconf-sshd--t-dan-jendela-kedua-10-menit), itu benar. Untuk `rumah`: kunci publikmu belum di `/home/rumah/.ssh/authorized_keys` (5.3), nama pengguna salah, atau laptop memakai kunci lain (`ssh -v` menunjukkan kunci yang dicoba). Betulkan dari sesi yang masih terbuka, atau lipatan *Terkunci dari VPS …*.

</details>

<details>
<summary><b><code>REMOTE HOST IDENTIFICATION HAS CHANGED</code> sesudah VPS dibuat ulang</b></summary>

VPS yang dipasang ulang membawa sidik jari kunci baru, sedangkan `known_hosts` laptopmu mengingat yang lama ([Konsep 3](#3-kunci-ssh-dan-pengguna-biasa-login-sandi-dan-root-dimatikan)). Memang baru membuat ulang? `ssh-keygen -R 203.0.113.10`, SSH lagi, cocokkan sidik jari dengan panel penyedia (5.2). Tidak membuat ulang apa pun? Berhenti dan tanyakan penyedia: bisa jadi penyamar.

</details>

<details>
<summary><b>Terkunci dari VPS: ufw tanpa 22, atau <code>sshd</code> salah setel</b></summary>

Buka konsol web di panel penyedia (tidak diuji penulis), masuk sebagai `rumah` dengan sandi dari `adduser`: larangan *login* sandi hanya untuk SSH. Lalu `sudo ufw allow 22/tcp`, `sudo sshd -t` (diam = benar; selain itu menunjuk baris salah), betulkan, `sudo systemctl restart ssh.service`.

</details>

<details>
<summary><b><i>Login</i> sandi masih menyala menurut <code>sshd -T</code></b></summary>

OpenSSH memakai nilai **pertama** yang ditemuinya, dan berkas di `/etc/ssh/sshd_config.d/` dibaca urut abjad. Berkasmu harus bernama `00-kunci.conf` di folder itu, supaya dibaca sebelum `50-cloud-init.conf` (di VPS ber-cloud-init berisi `PasswordAuthentication yes`); periksa dengan `ls /etc/ssh/sshd_config.d/`. Betulkan, ulangi `sshd -t` dan `sshd -T` dari 5.4, `sudo systemctl restart ssh.service`, uji jendela kedua.

</details>

<details>
<summary><b><i>Build</i> di VPS berhenti karena kehabisan memori, atau <code>no matching manifest for linux/amd64</code></b></summary>

Memori 2 GB habis: *build* dihentikan sistem (tidak direkam penulis; umumnya `Killed`). Pasang *swap* ([5.6](#56-swap-2-gb-untuk-build-image-5-menit)), bangun sebelum layanan lain menyala (7.4), atau satu per satu: `docker compose build backend`, lalu `web`. `… already exists` sekali (lab penulis: `migrasi` dan `backend` membangun image yang sama bersamaan): ulangi perintahnya. `no matching manifest …` = image di toko dibuat di arm64 (Pi, Mac Apple silicon): bangun di VPS, atau *push* dari laptop Intel/AMD (Modul 26 Praktik 10).

</details>

**DNS dan Cloudflare**

<details>
<summary><b><code>nslookup</code> belum menjawab, atau jawabannya masih yang lama</b></summary>

Belum menjawab: *nameserver* belum aktif ([6.2](#62-cloudflare-paket-gratis-ganti-nameserver-lalu-tunggu-aktif-8-menit); lamanya tidak diketahui penulis). `nslookup -type=NS namaanda.my.id 1.1.1.1` harus menyebut dua *nameserver* Cloudflare; kalau sudah, periksa nama *record*-nya. Jawaban lama: penanya mengingatnya sampai TTL habis; tanya `1.1.1.1`, tunggu, pakai TTL kecil. Jalur utama: kedua *record* berawan abu-abu; `mqtt.` oranye tidak melewatkan 8883 ([Konsep 5](#5-domain-dan-dns-buku-telepon-internet)).

</details>

<details>
<summary><b>Cloudflare menolak domain <code>.my.id</code></b></summary>

Dukungan paket gratis untuk `.my.id` belum diverifikasi penulis. Jalur utama tetap bisa: biarkan *nameserver* registrar, buat *record* A `iot` dan `mqtt` (tanpa AAAA) di panel registrar (🔀 6.3). Jalur gratis butuh domain yang dikelola Cloudflare: domain lain, atau jalur utama.

</details>

<details>
<summary><b><code>Provided Tunnel token is not valid.</code> dan <code>Restarting (255)</code></b></summary>

Lab penulis (token kosong): `cloudflared` `Restarting (255)`, log `Provided Tunnel token is not valid.` (token tidak sah). `TUNNEL_TOKEN` di `.env` Pi kosong, terpotong, atau lebih dari deretan sesudah `--token`: salin ulang sebagai satu baris ([11.7](#117--cloudflare-tunnel-token-di-env-rute-ke-httpweb80-dan-profil-terowongan-12-menit)), `docker compose up -d`. Tidak ada `cloudflared` di `ps -a`? `#` di depan `COMPOSE_PROFILES=terowongan` belum dihapus. Token bocor: buat terowongan baru.

</details>

<details>
<summary><b>Halaman galat Cloudflare di alamat dashboard jalur gratis</b></summary>

Halamannya dari Cloudflare (kodenya tidak direkam penulis). Periksa urut: `cloudflared` `Up`; **Service URL** persis `http://web:80` (`localhost` contoh dokumen = kontainer `cloudflared` sendiri); `docker compose ps web` `Up`; DNS `iot` = CNAME oranye ke `<id-terowongan>.cfargotunnel.com`, tanpa *record* A `iot` sisa. Internet rumah putus? Wajar sampai tersambung (11.9).

</details>

**Pesan yang boleh diabaikan**

<details>
<summary><b>Boleh diabaikan: <code>session taken over</code> sekali, <code>world readable</code>, <code>kiriman ganda dilewati</code>, 502 sesaat, jam UTC di log, dan <code>npm warn deprecated</code></b></summary>

- `Client backend … disconnected: session taken over.` sekali, tepat sebelum `as backend (p4, c0, k60, u'backend')`: sesi tetap backend dilanjutkan.
- `Warning: File /mosquitto/config/acl-broker has world readable permissions. …`: sejak Modul 26; ACL tetap berlaku.
- `kiriman ganda dilewati`: kiriman ulang ditolak kunci `(device_id, ts)`; `kembar` tetap 0.
- `/api` 502 beberapa detik sesudah `up -d`: `web` sengaja tidak menunggu backend (Konsep 7).
- Jam UTC di log Caddy, Grafana, dan cron VPS (+7 = WIB); log backend sudah WIB.
- `npm warn deprecated glob@11.1.0: …` dan `4 low severity vulnerabilities` (alat *build* frontend; `--omit=dev` → 0). Jangan `npm audit fix --force`.
- Empat `warn` Caddy di laptop dan Pi jalur gratis: HTTPS-nya di VPS atau di Cloudflare.

</details>

## 🔬 Bedah Teknis (opsional)

Boleh dilewati: pilihan opsional Silabus, cerita di balik setelan kita, dan cara penulis meniru internet. Kecuali ditandai "lab penulis", isinya dari dokumentasi resmi (dibaca 29 Okt 2026) dan **belum dijalankan penulis**: cukup dibaca.

<details>
<summary><b>Nginx sebagai pembanding: modul ACME resmi, tanpa certbot</b></summary>

Anggapan "Nginx butuh certbot" sudah usang: Nginx (*stable* 1.30.6 saat ditulis) kini punya modul ACME resmi, `ngx_http_acme_module` (paket `nginx-module-acme`), dengan tantangan HTTP-01 atau TLS-ALPN-01 dan tanpa nama *wildcard* (`*.namaanda.my.id`, semua nama sekaligus). Bedanya ada di jumlah baris: di Nginx kamu sendiri yang memuat modulnya, mendaftarkan penerbit ACME, memasang sertifikat di setiap blok `server`, dan menulis pengalihan ke `https://`. Caddyfile kita tidak memuat satu baris pun tentang sertifikat ([Konsep 7](#7-caddy-sebagai-pintu-depan-https-otomatis-dan-trust_proxy)). Yang sama di keduanya: Mosquitto tetap butuh salinan kartu dan muat ulang (Konsep 8).

</details>

<details>
<summary><b>acme.sh dan DNS-01: sertifikat tanpa pintu terbuka</b></summary>

HTTP-01 dan TLS-ALPN-01 butuh port 80 atau 443 yang terbuka ke internet. **DNS-01** membuktikan kepemilikan nama lewat *record* TXT di DNS-mu, tanpa pintu terbuka. Gunanya: *wildcard*, dan kartu sungguhan untuk server yang tak terjangkau dari internet, misalnya broker TLS di LAN jalur gratis. Image Caddy resmi tanpa *plugin* DNS (perlu image buatan sendiri); yang sering dipakai: **acme.sh** (3.1.6), misalnya `acme.sh --issue --dns dns_cf -d namaanda.my.id -d '*.namaanda.my.id'`. Tiga catatan:

- CA bawaannya ZeroSSL; pindah dengan `acme.sh --set-default-ca --server letsencrypt`.
- DNS Cloudflare butuh token API (`CF_Token`, izin *Zone → DNS → Edit*) yang disimpan di `~/.acme.sh/account.conf`. Token itu bisa mengubah DNS domainmu: perlakukan seperti `TUNNEL_TOKEN`.
- `--reloadcmd` bisa me-*restart* broker sesudah kartu disalin; dari dalam kontainer, ia butuh soket Docker yang setara root ([🔬 Modul 26](../modul-26-docker-compose/README.md#-bedah-teknis-opsional), lipatan *Grup `docker` setara root …*).

</details>

<details>
<summary><b>MQTT lewat WebSocket di terowongan (tidak diuji penulis)</b></summary>

Terowongan Cloudflare membawa HTTP dan WebSocket, bukan MQTT biasa ([Konsep 10](#10-jalur-gratis-cloudflare-tunnel)). MQTT yang dibungkus WebSocket ([🔬 Modul 11](../../fase-2-konektivitas/modul-11-mqtt-dan-kontrak-data/README.md#-bedah-teknis-opsional)) bisa lewat. Sketsa jalur gratis:

1. Broker pusat di Pi mendapat pintu kedua (WebSocket sudah bawaan Mosquitto 2.1). Baris ketiga ditulis lagi karena berlaku per pintu (Konsep 8):

   ```text
   listener 9001
   protocol websockets
   use_username_as_clientid true
   ```

2. Rute baru di terowongan yang sama: **Hostname** `ws.namaanda.my.id`, **Service URL** `http://mosquitto:9001` (satu lorong, tanpa loket baru).
3. Klien (MQTTX, mqtt.js) ke `wss://ws.namaanda.my.id`, dengan akun yang sama.

Batasnya: broker terjangkau dari internet (T2-gratis gugur); PubSubClient di ESP32 tidak bisa WebSocket; sandi MQTT terbaca Cloudflare karena amplopnya dibuka di tepinya; dan menurut dokumennya WebSocket yang lama diam ditutup, jadi klien wajib ber-*keepalive* dan menyambung ulang sendiri.

</details>

<details>
<summary><b>Rantai ECDSA lawan RSA, dan bahaya <code>preferred_chains smallest</code></b></summary>

Caddy membuat kunci ECDSA P-256 bila tidak diminta lain (kode CertMagic, pustaka HTTPS Caddy); di lab penulis, `curl -v` menulis `id-ecPublicKey`. Rantai ECDSA ([Konsep 6](#6-sertifikat-dibahas-tuntas-rantai-nama-dan-tanggal)) satu mata lebih panjang karena lewat ISRG Root X2 sebelum X1: browser tak merasakannya, perangkat kecil memeriksa lebih banyak kartu. Bila kelak ESP32 kesulitan (belum diukur penulis), opsi global `key_type rsa2048` meminta kunci RSA: `daun ← YR1/YR2 ← Root YR ← ISRG Root X1`.

`preferred_chains smallest` memilih rantai terpendek yang ditawarkan penerbit, yang bisa berhenti di Root YE atau Root YR. Menurut Let's Encrypt, rantai ke akar baru itu belum diharapkan jalan di daftar akar utama mana pun, dan klien yang hanya menanam X1 akan menolaknya. Rantai bawaan sudah benar: biarkan.

</details>

<details>
<summary><b>CA latihan Let's Encrypt dan opsi <code>email</code> di Caddy</b></summary>

**CA latihan.** Dokumen Caddy sangat menyarankan CA latihan Let's Encrypt (*staging*) selama menguji, lewat satu baris di blok global:

```text
acme_ca https://acme-staging-v02.api.letsencrypt.org/directory
```

Batas lajunya jauh lebih longgar, tetapi kartunya tidak dipercaya browser, jembatan Pi, atau ESP32 (peringatan seperti Kemenangan Cepat). Modul ini tidak memakainya karena Caddy sudah pindah sendiri ke CA latihan saat mencoba ulang sesudah gagal (Konsep 6). Memakainya juga? Sesudahnya hapus barisnya, `docker compose restart web`, tunggu `certificate obtained successfully`, lalu jalankan skrip [8.6](#86--perpanjangan-skripperbarui-sertifikat-mqttsh-dan-cron-mingguan-8-menit): `sertifikat-mqtt` memilih berkas paling baru. Belum dicoba penulis.

**Opsi `email`.** Tanpa `email` (Caddyfile kita), penerbitnya hanya Let's Encrypt; dengan `email`, menurut kode Caddy 2.11.7, ZeroSSL ditambahkan sebagai cadangan; dengan `acme_ca`, hanya CA itu. Surel peringatan kedaluwarsa bukan alasan: Let's Encrypt menghentikannya sejak 4 Jun 2025.

</details>

<details>
<summary><b>HSTS dan HTTP/3</b></summary>

**HSTS** (*Strict-Transport-Security*) berpesan ke browser: "untuk nama ini, selalu `https://` selama N detik". Tanpanya, `iot.namaanda.my.id` yang diketik tanpa `https://` bisa berangkat dulu sebagai kartu pos ke port 80 sebelum dialihkan `308`, dan di WiFi umum kartu pos itu bisa dicegat. Caddy tidak menambahkannya: Hasilnya [7.8](#78--gembok-di-httpsiotnamaandamyid-308-login-dan-cookie-secure-6-menit) tanpa baris `strict-transport-security`. Pasang satu baris di blok situs, umur kecil dulu, lalu `docker compose restart web`:

```text
header Strict-Transport-Security "max-age=86400"
```

Harganya: selama umur itu, browser yang pernah berkunjung menolak namamu tanpa HTTPS yang sah, dan peringatan sertifikat tidak bisa dilewati. Jangan `includeSubDomains` atau `preload` (izin menanam namamu di daftar bawaan browser) untuk domain latihan.

**HTTP/3.** `alt-svc: h3=":443"; ma=2592000` di 7.8 = tawaran Caddy: "aku juga bisa HTTP/3 lewat UDP 443; ingat 30 hari". Karena itu ada loket dan izin ufw `443/udp`. UDP terhalang? Browser tetap memakai HTTP/2. HTTP/3 tidak diuji terpisah oleh penulis.

</details>

<details>
<summary><b>ESP32 langsung TLS ke VPS: <code>WiFiClientSecure</code> (tidak dikompilasi penulis)</b></summary>

Skenario opsional Silabus: ESP32 di lokasi lain, tanpa Pi, langsung ke `mqtts://mqtt.namaanda.my.id:8883` (versi simulator: [Praktik 13](#praktik-13--opsional-perangkat-di-lokasi-lain-lewat-mqtts-tanpa-gerbang-20-menit)). Firmware Node 1 tetap 1.6.0; bila kelak kamu menulisnya, ini yang berubah di `jaringan.cpp` menurut kode paket esp32 3.3.12 dan contoh resmi `WiFiClientSecure`:

```cpp
#include <WiFiClientSecure.h>
static WiFiClientSecure klienJaringan;        // dulu: WiFiClient
static PubSubClient mqtt(klienJaringan);
// … sebelum menyambung:
klienJaringan.useBuiltinCACertBundle();       // atau setCACert(AKAR_ISRG_X1)
mqtt.setServer("mqtt.namaanda.my.id", 8883);  // nama, bukan IP
```

- **Akar:** bundel bawaan memuat ISRG Root X1 dan X2; `setCACert()` menerima X1 saja (`akar_isrg_x1.h` di [🧩 Tingkat 1](#tingkat-1--cuaca-modul-10-tanpa-setinsecure-periksa-kartu-identitas-server-ubah-sedikit-20-menit)) atau, menurut kodenya, X1 dan X2 bersambung. Akar berganti kelak = firmware baru (OTA, Modul 28).
- **Nama:** firmware 1.6.0 sengaja memakai alamat IP; lewat IP, pemeriksaan nama gagal.
- **Tanggal:** pada konfigurasi bawaan paket esp32 tidak diperiksa, jadi perpanjangan tetap tugas VPS. NTP tetap perlu untuk `ts`.
- **Akun** perangkat di broker VPS ([13.1](#131-perangkat-latihan-dan-akunnya-di-broker-vps-8-menit)); **tanpa antrean luring**: internet putus = bacaan hilang.

Belum dikompilasi atau dicoba penulis di papan; memori untuk jabat tangan TLS belum diukur.

</details>

<details>
<summary><b>Sesi bersih lawan sesi tetap: kenapa backend 1.4.0 memakai sesi tetap</b></summary>

| | Sesi bersih | Sesi tetap |
| :-- | :-- | :-- |
| Saat klien putus | broker melupakan langganannya | broker mengingat langganan dan menahan pesan QoS 1 untuknya |
| Di proyek ini | Node 1; jembatan di sisi pusat (`cleansession true`) | backend 1.4.0; jembatan di sisi gerbang (`local_cleansession false`) |
| Log broker | `c1` | `c0` |

**Kenapa backend?** Lab kode penulis dengan backend sesi bersih: dari empat kali broker pusat dinyalakan ulang, sekali jembatan masuk lebih dulu, dan seluruh antrean (3 bacaan) dibuang karena belum ada pelanggan. Backend sengaja dinyalakan 25 detik sesudah broker: 6 terbit, 0 tersimpan; dengan sesi tetap: 9 terbit, 9 tersimpan. Hal ini bisa terjadi pada `restart mosquitto`, *reboot* VPS, atau backend dibuat ulang ([2.1](#21-tiga-perubahan-di-src-envts-dan-serverts-mqttts-serta-perintahts-8-menit)). **Kenapa bukan Node 1?** Ia menerima perintah, dan sesi tetap menyimpan perintah basi ([Modul 11](../../fase-2-konektivitas/modul-11-mqtt-dan-kontrak-data/README.md#6-qos-surat-biasa-surat-tercatat-dan-kurir-bertanda-tangan)); backend menerima data ber-`ts`, dan data terlambat tetap data.

**Wajar:** `… disconnected: session taken over.` setiap backend menyambung ulang; bukan penyamar karena `use_username_as_clientid true` di setiap pintu (Konsep 8). **Batas:** hanya pesan QoS 1 yang ditahan (QoS 0 perangkat tanpa gerbang, Praktik 13, tetap hilang selama backend mati), paling banyak 1000 pesan (bawaan Mosquitto, ±1,5 jam untuk dua perangkat berirama Node 1).

**Bonus T2a: isi "diam" di [8.3](#83--t2a-tanpa-tls-ditolak-di-8883-dan-1883-tak-terjangkau-dari-luar-10-menit).** Tambah `-d` (`-W 4` cukup):

```text
mosquitto_sub -d --no-tls -h mqtt.namaanda.my.id -p 8883 -u pemeriksa -P <sandi> -t 'rpm/+/status' -v -C 1 -W 4
```

**Hasilnya (lab penulis, CA tiruan):** empat baris, lalu `echo $?` → `255`.

```text
Client null sending CONNECT
Client null sending CONNECT
Client null sending CONNECT
Client null sending CONNECT
```

Satu percobaan per detik, masing-masing ditolak (`wrong version number`). `null`: `mosquitto_sub` membiarkan broker yang memberi nama klien.

</details>

<details>
<summary><b>Pilihan yang tidak dipakai: <code>bridge_tls_use_os_certs</code>, <code>keepalive_interval</code>, <code>persist-sqlite</code>, mTLS, dan fail2ban</b></summary>

- **`bridge_tls_use_os_certs true`** (baru di Mosquitto 2.1) menggantikan `bridge_cafile`: jembatan memercayai seluruh daftar akar di image, jadi akar baru datang bersama image baru. Kita tetap menulis `bridge_cafile` ISRG Root X1 supaya akar yang dipercaya terlihat, seperti bunyi Silabus. Tidak diuji.
- **`keepalive_interval` lebih kecil** (bawaan 60 detik, minimal 5) memperpendek jendela buta ([Konsep 9](#9-jembatan-simpan-teruskan-siapa-menahan-apa)) dengan ping lebih sering. Sejak `upgrade_outgoing_qos true`, jendela buta tak lagi menghilangkan data. Tidak diuji.
- ***Plugin* `persist-sqlite`** ada di image 2.1.2 dan disarankan dokumen Mosquitto, tetapi tidak boleh bersama `persistence true`. Kita memakai yang terakhir + `autosave_interval 30`, yang sudah diuji putus 10 menit.
- **Jalur gratis + `ALAMAT_WEB=0.0.0.0`** (mode HP di Pi): `private_ranges` juga memercayai perangkat WiFi rumah yang mengetuk Caddy langsung sehingga ia bisa memalsukan alamatnya di log dan pembatas *login*. Biarkan `127.0.0.1`.
- **mTLS** (sertifikat per perangkat): [🔬 Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#-bedah-teknis-opsional).
- **fail2ban** (paket Ubuntu 26.04) menghalau penebak sandi SSH; *login* sandi sudah mati (5.4), jadi tidak dipasang.

</details>

<details>
<summary><b>Bagaimana penulis meniru internet: Pebble, lorong Docker, dan <code>docker network disconnect</code></b></summary>

Semua kotak Hasilnya direkam di satu Raspberry Pi 5 (Ubuntu 26.04, Docker 29.1.3, Compose 2.40.3), tanpa VPS, domain, atau HP. Resepnya juga latihan aman bagi pembaca Linux sebelum membayar:

1. **Internet** = lorong Docker sendiri: `docker network create --subnet 10.27.10.0/24 internet-tiruan`.
2. **Let's Encrypt** = **Pebble** 2.10.1, CA uji buatan Let's Encrypt (`ghcr.io/letsencrypt/pebble:2.10.1`), disetel `httpPort 80` dan `tlsPort 443`. **DNS** = `pebble-challtestsrv` 2.10.1: *record* A `iot.contoh.test` dan `mqtt.contoh.test` → `10.27.10.10` lewat API-nya (`/add-a`), dan Pebble bertanya ke DNS ini (`-dnsserver`). `.test` khusus uji; jangan memakai nama sungguhan milik orang lain.
3. **VPS** = kontainer pemegang IP `10.27.10.10`; `web` dan `mosquitto` berbagi jaringannya. Caddyfile proyek + satu blok global lab: `cert_issuer acme https://pebble:14000/dir` dengan `trusted_roots` dan `profile default` (90 hari). Gerbang dan klien memakai DNS tiruan dan akar Pebble.
4. **Cabut internet rumah** = `docker network disconnect` dari kontainer gerbang (paket dibuang diam-diam); sambung lagi dengan `docker network connect`.
5. **HP dan teman** = Chrome 156 tanpa layar, profil sendiri: `--host-resolver-rules` (nama → IP "VPS") dan `--ignore-certificate-errors-spki-list` (kartu Pebble diterima hanya di profil itu).

Tanpa mengubah `/etc/hosts`, *firewall*, atau daftar akar sistem. Bedanya dengan dunia nyata: Pebble membuat akar **baru setiap menyala**, rantainya bukan X1/X2, dan waktu terbitnya (±5–6 detik) bukan waktu Let's Encrypt. Cloudflare Tunnel tidak ditiru (`cloudflared` tanpa token, diganti penerus kecil); MQTTX diganti mqtt.js dan `mosquitto_sub`. Tidak dicoba: pembaruan PWA `prompt` atau muat ulang otomatis lewat `virtual:pwa-register` (dashboard memakai `autoUpdate`). Rincian: [📚](#-sumber--atribusi-gambar).

</details>

## 🧩 Tantangan mandiri

> 🖥️ **Alat yang dipakai:** Tingkat 1: **Arduino IDE** dengan Node 1 (lalu unggah lagi `node-1-rumah`), atau Wokwi. Tingkat 2: terminal laptop, **Chrome**, **DBeaver**. Tingkat 3: **VS Code** di `rumah-pintar-mini`, **terminal SSH ke VPS**, **Chrome**.

Semuanya opsional (tanpa ⭐). Tingkat 3 menambah berkas: kerjakan sesudah [➕ Tambahan](#-tambahan-ke-rumah-pintar-mini), di cabang baru dari `main` (`git switch main`, `git pull`, `git switch -c fitur/pita-jembatan`).

### Tingkat 1 — Cuaca Modul 10 tanpa `setInsecure()`: periksa kartu identitas server (ubah sedikit, 20 menit)

> [!NOTE]
> Belum dikompilasi atau dicoba penulis (papan maupun Wokwi); nama fungsi dari kode esp32 3.3.12.

Sketsa `modul10_cuaca` memanggil `klien.setInsecure()` "sementara" ([Modul 10](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#8-https-dan-setinsecure-amplop-tersegel-yang-kurirnya-tidak-diperiksa)): amplop tersegel, kartu identitas kurir tak diperiksa. Simpan sebagai `modul27_cuaca_aman` (**File → Save As…**), lalu ganti **satu baris** itu supaya ESP32 memeriksa rantai dan nama seperti browser ([Konsep 6](#6-sertifikat-dibahas-tuntas-rantai-nama-dan-tanggal)). Petunjuk: `WiFiClientSecure` bisa memakai bundel akar bawaan esp32 3.3.12, atau satu akar yang kamu tanam.

**Lulus kalau:** Serial Monitor tetap seperti Modul 10 (`Kode status: 200, …`), dan dengan akar SALAH di `setCACert()` permintaannya gagal (`Gagal mengirim: …`).

<details>
<summary><b>Kunci Tingkat 1</b></summary>

```cpp
  WiFiClientSecure klien;
  klien.useBuiltinCACertBundle();   // dulu: klien.setInsecure();
```

Bundel bawaan = ±150 akar tepercaya di firmware, termasuk ISRG Root X1 dan X2; fungsinya baru di 3.3.12 (Wokwi saat Modul 10: 3.3.7). Versi lama (kompilasi gagal) atau satu akar saja: buat tab [`akar_isrg_x1.h`](kode/tantangan/kunci/tingkat-1/modul27_cuaca_aman/akar_isrg_x1.h) lewat **Copy raw file** (cocokkan sidik SHA-256-nya dengan halaman Let's Encrypt; berlaku sampai 4 Jun 2035), `#include "akar_isrg_x1.h"`, lalu `klien.setCACert(AKAR_ISRG_X1);`. X1 cukup: kedua server `api.open-meteo.com` mengirim rantai berujung X1 (dicek penulis 29 Okt 2026). **Tanggal** tetap tak diperiksa (setelan bawaan esp32; belum diuji di papan); alamatnya wajib **nama**, bukan IP.

</details>

### Tingkat 2 — Pintu admin lewat terowongan SSH: Swagger dan DBeaver dari laptop (isi bagian rumpang, 25 menit)

> [!NOTE]
> `ssh -L` (fitur standar OpenSSH) belum dijalankan penulis sama sekali.

Loket backend 8080, database 5432, dan Grafana 3000 di VPS hanya `127.0.0.1` ([Konsep 4](#4-tembok-api-yang-bocor-ufw-dan-docker)), jadi Swagger tak bisa dipakai dari internet ([7.8](#78--gembok-di-httpsiotnamaandamyid-308-login-dan-cookie-secure-6-menit)). **Terowongan SSH** membuka loket di laptop dan meneruskan ketukannya, terenkripsi, ke `127.0.0.1` VPS: tanpa pintu baru, ufw tetap. Backend laptop harus mati (7.6). Isi `____`:

```text
ssh -L ____:127.0.0.1:____ rumah@203.0.113.10
http://localhost:____/docs
ssh -L ____:127.0.0.1:5432 rumah@203.0.113.10
```

Baris 2 dibuka di Chrome selama baris 1 tersambung; baris 3 untuk DBeaver (**Host** `localhost`, **Port** `____`, akun hanya-baca `grafana_baca`). Bonus: semuanya dalam SATU perintah, tanpa terminal VPS.

**Lulus kalau:** **Execute** pada `POST /auth/login` di Swagger dijawab `200`, dan DBeaver membuka database `rumahpintar`.

<details>
<summary><b>Kunci Tingkat 2</b></summary>

```text
ssh -L 8080:127.0.0.1:8080 rumah@203.0.113.10
http://localhost:8080/docs
ssh -L 15432:127.0.0.1:5432 rumah@203.0.113.10
ssh -N -L 8080:127.0.0.1:8080 -L 15432:127.0.0.1:5432 -L 3000:127.0.0.1:3000 rumah@203.0.113.10
```

`-L 15432:127.0.0.1:5432` = loket **laptop** 15432 → terowongan → ketuk `127.0.0.1:5432` dari sisi VPS. `-N` = terowongan saja (berhenti: **Ctrl + C**).

- **Swagger wajib `8080` dan `localhost`:** satpam hanya menerima *login* dari halaman di `CORS_ORIGIN` dan `http://localhost:8080`; loket lain, menurut kode: `403` `… halaman http://localhost:18080 ditolak`.
- **`15432`**: tak bentrok dengan database laptop (DBeaver tak memeriksa asal halaman).
- **Grafana** sudah di `/grafana/` (7.10); `-L 3000` hanya bila `GRAFANA_ALAMAT` kosong.

Aman: hanya pemegang kunci SSH-mu bisa membuatnya; loket laptop hanya `127.0.0.1`.

</details>

### Tingkat 3 — Pita "Gerbang rumah terputus": kabar jembatan sampai ke dashboard (buat dari nol, 60–90 menit)

Saat internet rumah putus, dashboard VPS menulis `Online · … · data basi` ([10.3](#103-selama-putus-online-yang-basi-tombol-lampu-dan-telegram-node-diam-12-menit); celah jujur [Konsep 9](#9-jembatan-simpan-teruskan-siapa-menahan-apa)). Padahal broker pusat tahu: kabar jembatan `$SYS/broker/connection/jembatan-pi/state` ([4.3](#43--kabar-jembatan-state-1-dengan-akun-pemantau-3-menit)) menjadi `0` sesudah jembatan diam melewati *keepalive* (±1,5 menit). Buat pita di bawah kepala dashboard, `Gerbang rumah terputus sejak HH.MM.SS WIB (jembatan-pi)`, di semua dashboard yang terbuka:

1. `edge/acl-broker`: akun `backend` boleh membaca `$SYS/broker/connection/+/state` (`#` di `rpm/#` tak mencakup topik berawalan `$`; tanpa izin, langganan diam tanpa galat).
2. `src/services/mqtt.ts` berlangganan topik itu, menyerahkan pesan `$SYS/…` ke berkas baru `jembatan.ts`: bereaksi hanya saat keadaan berubah, menulis log.
3. `realtime.ts`: acara Socket.IO `jembatan` ke semua klien; dashboard baru langsung menerima keadaan terakhir.
4. Komponen `PitaJembatan.tsx` di `TataLetak.tsx` (tipe acara: `types.ts`), soket yang satu, pendengar dilepas di *cleanup* (aturan Modul 23).

Uji `npm run cek` + `npm test` (`backend`) dan `npm run lint` + `npm run build` (`frontend`), *commit*, *push*. Di VPS, akar proyek: `git fetch`, `git switch fitur/pita-jembatan`, `docker compose up -d --build backend web`, lalu `docker compose restart mosquitto` (ACL baru). Cabut internet rumah seperti 10.2 (bukan `stop mosquitto`). Selesai: `git switch main`, ulangi dua perintah Compose itu. Khusus jalur utama (jembatan jalur gratis tak lewat internet).

**Lulus kalau:** pita muncul ±1,5 menit sesudah putus, bertahan saat dimuat ulang, dan hilang beberapa detik sesudah tersambung.

<details>
<summary><b>Kunci Tingkat 3</b></summary>

[`tingkat-3/`](kode/tantangan/kunci/tingkat-3/): dua berkas baru (salin ke jalur yang sama) `backend/src/services/jembatan.ts` dan `frontend/src/components/PitaJembatan.tsx`, plus `perubahan.diff` (lima berkas, +28/−1, termasuk `edge/acl-broker`). Simpan diff di akar proyek, `git apply perubahan.diff` (ditolak karena blok 2b terbuka? `git apply -C2 perubahan.diff`), lalu hapus diff-nya. "Sejak" = jam backend mendengar kabar putus; kabar *retained* lama tak berjam. Acara `jembatan` juga sampai ke viewer (tak rahasia, seperti `status`).

**Hasilnya** (lab penulis; "putus" = `docker network disconnect` gerbang tiruan di LAN):

```text
backend-1  | [18:34:56] INFO: jembatan jembatan-pi tersambung
backend-1  | [18:37:24] WARN: jembatan jembatan-pi TERPUTUS: data dari rumah tertahan di gerbang sampai tersambung lagi
backend-1  | [18:37:35] INFO: jembatan jembatan-pi tersambung
```

Pita `Gerbang rumah terputus sejak 18.37.24 WIB (jembatan-pi). …` muncul 69 detik sesudah dicabut, bertahan saat dimuat ulang, hilang 6 detik sesudah disambung (Chrome tanpa layar). 118 tes backend lulus; lint dan `tsc -b` dashboard bersih. Belum dicoba penulis: VPS, HP, dan internet rumah sungguhan.

</details>

## ➕ Tambahan ke "Rumah Pintar Mini"

Minggu ini Rumah Pintar Mini **online di internet, terenkripsi, tahan putus**: pusatnya (backend 1.4.0, dashboard 1.3.0 sebagai PWA, Grafana di `/grafana/`) menyala terus di VPS dengan HTTPS atau di Pi lewat Cloudflare Tunnel, jembatan Pi masuk lewat TLS di 8883 (jalur utama), dan gerbang menahan bacaan saat internet putus. Kodenya sudah di-*commit* di `fitur/ke-internet`. A mencocokkan, B–D merapikan dokumen, E menggabungkan ke `main`, F menyimpan catatanmu (±30 menit). Gambar Konsep 1 kini juga gambar proyekmu:

![Diagram dua jalur ke internet (Konsep 1 dan 10), keadaan Rumah Pintar Mini sesudah Modul 27; tidak ada port forwarding di router pada kedua jalur. Kiri, rumah: Node 2 Kebun v1.0.0 lewat ESP-NOW ke Node 1 Rumah v1.6.0 (firmware tetap), MQTT polos ke 192.168.1.37:1883. Raspberry Pi: mosquitto gerbang loket 1883, edge/compose.edge.yml, simpan-teruskan: antrean ditahan di Pi saat internet putus. Kotak putus-putus, jalur gratis saja: pusat juga di Pi, compose.cloud.yml dengan .env kolom Pi (web Caddy :80, backend, db, grafana, broker pusat 1884 hanya 172.17.0.1), jembatan LAN ke pusat:1884 lewat host-gateway, cloudflared profil terowongan membuka terowongan KELUAR ke Cloudflare. Tengah atas, VPS sewaan jalur utama: Ubuntu 26.04, 2 GB, contoh IP 203.0.113.10; compose.cloud.yml yang sama, .env kolom VPS, KONF_PUSAT=pusat-internet.conf; backend 1.4.0 cookie Secure; web Caddy HTTPS otomatis, 80 dan 443; db riwayat dipindah; grafana lewat /grafana/; mosquitto 8883 TLS, 1883 lokal; sertifikat-mqtt, salin + cron mingguan; pintu terbuka 22, 80/443, 8883. Dari gerbang: jembatan TLS keluar ke 8883, akar ISRG X1, perintah turun lewat jalan sama. Tengah bawah, Cloudflare jalur gratis: HTTPS di tepi Cloudflare lalu lewat terowongan ke web:80 di Pi; iot. = CNAME ke terowongan, tanpa mqtt.: MQTT tidak lewat terowongan; Cloudflare melihat isi lalu lintas. Kanan: tamu di mana pun (HP data seluler, teman, PWA) ke https://iot.namaanda.my.id lewat 443; laptop admin, kunci SSH ed25519, lewat 22 (ssh -L untuk loket 127.0.0.1); tamu jalur gratis ke alamat sama. Keduanya sambungan KELUAR dari rumah. Pita: backend 1.4.0, dashboard 1.3.0, kontrak data 1.5, firmware tetap. Bawah, GitHub, cabang fitur/ke-internet, pull request Online di internet: HTTPS, TLS MQTT, jembatan tahan putus, PWA; berkas berubah: compose.cloud.yml, .env.example, Caddyfile, pusat-internet.conf baru, gerbang.conf + 4 baris, jembatan.contoh.conf, acl-broker, skrip sertifikat + cek-susulan.sql, backend (118 tes), frontend PWA, KONTRAK-DATA, README. Tidak pernah ikut Git: .env, TUNNEL_TOKEN, edge/.env, jembatan/pusat.conf, kunci SSH, lemari Caddy, backup/. Menyusul: Modul 28 OTA, Modul 29 GitHub Actions, Modul 30 Uptime Kuma dan backup. Jujur: saat internet putus dashboard tetap Online (data basi), aturan server diam; diuji di internet tiruan, bukan VPS atau HP sungguhan.](aset/dua-jalur-ke-internet.png)

> 🖥️ **Alat yang dipakai:** **VS Code** di folder `rumah-pintar-mini`, terminal di **akar proyek** (F: folder `belajar-iot`); **Chrome** atau **Edge** yang sudah masuk ke GitHub; di E juga **terminal SSH ke VPS** dan **terminal SSH ke Pi**. Rumahmu tetap menyala.
>
> ⭐ **Wajib** — langkah E: *pull request* ke `main`.

### A. Cocokkan proyekmu: akar, `edge/`, `skrip/`, `backend/` 1.4.0, dan `frontend/` 1.3.0

Berkas cabangmu harus sama dengan berkas senamanya di [`kode/`](kode/), kecuali dokumen B–D, `KONTRAK-DATA.md`, dan yang memang milikmu (`LABEL` di `Dockerfile` dan JSON dashboard ekspor Modul 26, device_id di blok 2 dan blok 2b `edge/acl-broker`, `extra_hosts` 9.6). Periksa di Explorer: `compose.cloud.yml` (layanan `sertifikat-mqtt` dan `cloudflared`), `.gitattributes`; tiga berkas baru di `skrip/`; `frontend/caddy/Caddyfile` (`{$DOMAIN_WEB::80} {$DOMAIN_MQTT} {`); `edge/pusat-internet.conf` dan empat baris baru `edge/gerbang.conf`; versi `1.4.0` dan `1.3.0` di `package.json` backend dan frontend.

Salin dulu tabel **Perangkatku**-mu, lalu ganti isi `KONTRAK-DATA.md` dengan [versi 1.5](kode/KONTRAK-DATA.md) (**Copy raw file**) dan isi lagi. Bentuk pesannya tetap, jadi firmware, migrasi, dan *provisioning* Grafana tidak berubah. Yang baru: alamat broker di internet (nama domain, 8883, TLS 1.2 ke atas) dan aturan simpan-teruskan (`cmd` tidak ditahan), yaitu aturan **11** di proyek = aturan **13** [Lampiran A Silabus](../../SILABUS.md#14-lampiran-a--kontrak-data-rumah-pintar-mini).

### B. Perbarui README proyek, lalu README `backend/`, `frontend/`, `edge/`, `grafana/`, dan `alat/`

**README akar.** Buka [README rujukan](kode/README.md), klik **Raw**, salin bagian `## Di internet (Modul 27)` sampai sebelum `## Yang akan menyusul`, lalu tempel di akhir `README.md` akar repositorimu. Ganti jalur `[Modul 27](…)` di dalamnya dengan alamat halaman ini.

**README folder.** `backend/`, `frontend/`, dan `edge/` sudah disalin di 2.1, 3.4, dan 4.1 (`edge/`: isi lagi tabel kepalanya dengan data Pi-mu). Ganti isi `grafana/README.md` dan `alat/README.md` dengan [`kode/grafana/README.md`](kode/grafana/README.md) dan [`kode/alat/README.md`](kode/alat/README.md) (**Copy raw file**).

**Bruno.** Janji [Modul 16](../../fase-3-backend-data/modul-16-backend-typescript-api-git/README.md#58-environment-lokal) terpenuhi: pindah ke internet cukup mengganti `baseUrl`. Di `backend/bruno/environments/internet.yml` (2.1), ganti `iot.namaanda.my.id` dengan domainmu. Nama domain bukan rahasia, jadi berkas ini ikut *commit*.

### C. Lengkapi `.env.example` akar dan `edge/`: tanpa domain, IP, atau rahasia aslimu

Keduanya disalin di 2.3 dan 4.1; cocokkan lagi dengan [`kode/.env.example`](kode/.env.example) dan [`kode/edge/.env.example`](kode/edge/.env.example): setelan barunya tanpa nilai milikmu, `# COMPOSE_PROFILES=terowongan` berkomentar, contohnya tetap `namaanda.my.id`. Sandi dan token sungguhan hanya di `.env` setiap tempat, ber-`chmod 600`, di luar Git ([7.2](#72-env-vps-rahasia-baru-dan-kolom-vps-di-tabel-nilai-per-tempat-10-menit)).

### D. Tambahkan butir Modul 27 ke templat *pull request*

Ganti isi `.github/pull_request_template.md` dengan [templat rujukan](kode/.github/pull_request_template.md) (**Copy raw file**): sebelas butir **(Modul 27)** dan tiga butir lama yang disesuaikan, misalnya:

```markdown
- [ ] **(Modul 26)** Di laptop: loket database, Grafana, backend, dan Uptime Kuma hanya `127.0.0.1`; dashboard `ALAMAT_WEB` kembali `127.0.0.1` sesudah mencoba mode HP; tidak ada *port forwarding* di router rumah (di VPS: butir Modul 27)
- [ ] **(Modul 27)** Uji cabut internet rumah sudah dijalankan: `skrip/cek-susulan.sql` menunjukkan `celah_lebih_12_detik 0` dan `kembar 0` di database pusat
- [ ] **(Modul 27)** Grafana yang dibuka di `https://iot…/grafana/` memakai sandi admin yang kuat, dan orang lain diberi akun viewer (bukan sandi admin)
```

### E. ⭐ Gabungkan `fitur/ke-internet` ke `main` lewat *pull request* "Online di internet: HTTPS, TLS MQTT, jembatan tahan putus, PWA"

Di terminal akar proyek laptop, `git status` hanya menyebut berkas A–D (`.env`, `backup/`, dan `edge/jembatan/pusat.conf` diabaikan `.gitignore`). Lalu satu per satu (plus berkas perbaikan A):

```text
git add README.md KONTRAK-DATA.md .env.example edge/.env.example grafana/README.md alat/README.md edge/README.md backend/bruno/environments/internet.yml .github/pull_request_template.md
```

```text
git commit -m "Dokumen Modul 27: README, kontrak 1.5, dan templat PR"
```

```text
git push
```

1. Di GitHub: **Compare & pull request** (base `main`), judul `Online di internet: HTTPS, TLS MQTT, jembatan tahan putus, PWA`, tulis perubahan dan bukti T1–T3 sejujur catatanmu (misalnya `T1: HP sendiri lewat data seluler`), salin butir **(Modul 27)** templat D (`main` masih templat lama), lalu **Create pull request**.
2. ***Review*:** **Files changed** (lab penulis: 48 berkas) tanpa `.env` (hanya `.env.example`), `TUNNEL_TOKEN`, `*.key`/`*.pem`, kunci SSH, isi lemari Caddy, `edge/jembatan/*.conf`, `backup/`, atau keluaran `docker compose config`; lalu **Review changes** → **Comment** → **Submit review**. Ada yang terlarang? Jangan di-*merge*: `git rm -r --cached` + nama berkasnya (rahasia: ganti juga nilainya), *commit*, *push* lagi.
3. **Create a merge commit** → **Merge pull request** → **Confirm merge** → **Delete branch**.
4. Laptop, satu per satu: `git switch main`, `git pull`, `git branch -d fitur/ke-internet`. VPS (akar proyek) dan Pi (folder `rumah-pintar-mini`; jalur gratis: Pi saja): `git switch main` lalu langsung `git pull` (sebelum `pull`, berkasnya masih versi Modul 26). Hanya dokumen yang berubah, jadi tanpa `docker compose up -d` (kecuali A mengubah berkas Compose); cron tetap. Pi menolak karena `edge/acl-broker`? Seperti 4.1: `git stash`, `git switch main`, `git pull`, `git stash pop`.

Tombolnya sama dengan [Modul 16](../../fase-3-backend-data/modul-16-backend-typescript-api-git/README.md#86-buka-pull-request-di-github); penulis hanya menguji di repo git lokal, bukan GitHub.

**Kamu lulus langkah ⭐ ini** kalau *pull request* itu ditinjau dengan butir **(Modul 27)**, di-*merge*, dan `main` di setiap mesinmu memuat backend `1.4.0`, frontend `1.3.0`, dan `edge/pusat-internet.conf`. Centang ➕ E di [✅](#-checklist-kelulusan-modul-27).

### F. Simpan catatan belajar: bukti T1–T3, sidik jari, biaya bulanan, dan `docker stats`

Di `belajar-iot/modul-27/` tambahkan `catatan.md`, tanpa sandi, token, chat_id, surel temanmu, atau isi `.env`; bahannya `sidik-jari.md` dan bukti yang kamu simpan saat praktik:

```markdown
# Catatan Modul 27 — Online, terenkripsi, tahan putus

| Hal | Punyaku |
| :--- | :--- |
| Jalur (utama / gratis / tanpa Pi / tanpa Kit) | … |
| T1: jam WIB, jaringan, kota, siapa, tangkapan (12.4) | … |
| T2a (8.3) atau T2-gratis (11.8) | … |
| T2b: dua baris log VPS (9.3) | … |
| T3: `celah_lebih_12_detik`, `tiba_susulan`, `kembar` (10.5 / 11.9) | … |
| Sidik jari sebelum = sesudah pindah (7.5 / 11.4) | sama / beda |
| Biaya: VPS per bulan, domain per tahun | Rp … / Rp … |
| `docker stats` saat diam (7.11 / 11.9) | … MiB |
| Cron sertifikat, dalam WIB (8.6) | … |
| Belum kuuji | … |
```

Di bawahnya, tempel keluaran `cek-susulan.sql` T3 dan `docker compose ps -a` VPS (jalur gratis: Pi) sebagai blok kode. *Commit* dan *push*.

## 📖 Glosarium

| Istilah | Arti |
| :--- | :--- |
| **ACME** | Cara Caddy meminta dan memperbarui sertifikat sendiri, sesudah membuktikan lewat port 80 atau 443 bahwa ia menguasai nama itu. |
| **Akar** (ISRG Root X1, X2) | Lembaga tepercaya di ujung rantai, yang namanya tertanam di HP, laptop, dan Pi: X1 (RSA) atau X2 (ECDSA, juga sampai ke X1). |
| **Antrean** (gerbang) | Rak tunggu broker gerbang di Pi untuk pesan yang belum sampai ke pusat, disimpan ke lemari setiap ±30 detik. |
| **CA** dan **penerbit antara** | Lembaga tepercaya yang menandatangani sertifikat, dan kantor cabangnya, yang ditandatangani akar. |
| **CA latihan** | Let's Encrypt *staging*, dipakai Caddy saat mencoba ulang supaya jatah tidak habis. Bukan *staging* Modul 29. |
| **Cloudflare Tunnel** (terowongan) | Sambungan keluar dari `cloudflared` ke Cloudflare, yang membawa tamu HTTPS ke `http://web:80` tanpa membuka pintu router; MQTT tidak lewat. |
| ***Cookie* `Secure`** | *Cookie* yang hanya dikirim browser lewat HTTPS. |
| **Cron** | Jam weker di VPS yang menjalankan skrip menurut jadwal (di sini: sertifikat broker, Senin 03.17 jam VPS). |
| **DNS** | Buku telepon internet: nama → nomor IP, ditanyakan dengan `nslookup`. |
| ***DNS only*** dan ***proxied*** | Awan abu-abu menjawab IP VPS asli (semua port sampai); awan oranye menjawab alamat Cloudflare (hanya port web), jadi `mqtt.` wajib abu-abu. |
| **Domain**, **registrar**, ***nameserver*** | Nama yang kamu sewa per tahun (`namaanda.my.id`), toko tempat menyewanya (terakreditasi PANDI), dan kantor yang menjawab pertanyaan tentang nama itu. |
| **HTTPS** dan **TLS** | TLS = amplop tersegel plus kartu identitas yang diperiksa; HTTPS = HTTP di dalamnya, tandanya gembok di bilah alamat. |
| **HUP** (muat ulang) | `kill -HUP 1`: broker VPS membaca ulang sertifikatnya tanpa mati, jembatan tidak putus. Broker gerbang Pi selalu di-`restart`. |
| **Jembatan simpan-teruskan** (*store-and-forward*) | Gerbang menahan bacaan di antrean selama jalan ke pusat putus, lalu meneruskannya dengan `ts` aslinya: naik disimpan di Pi, turun tidak disimpan. |
| **Jendela buta** | Selang antara internet putus dan gerbang sadar (lab penulis: sekitar 1–2 menit); QoS 0 di selang itu hilang tanpa `upgrade_outgoing_qos true`. |
| **Kabar jembatan** | `$SYS/broker/connection/jembatan-pi/state` di broker pusat: `1` tersambung, `0` putus. |
| **Konteks aman** | `https://…` atau `http://localhost`: hanya di sini pekerja latar jalan dan pemasangan ditawarkan. |
| **Let's Encrypt** | Penerbit sertifikat gratis lewat ACME, berlaku 90 hari (64 hari mulai 10 Feb 2027, 45 hari mulai 16 Feb 2028); paling banyak 5 sertifikat bernama sama per 7 hari. |
| **Loket Docker** (pintu samping Docker) | Loket `ports:`, tak dijaga ufw; penjaganya alamat di depannya: `127.0.0.1` hanya mesin itu, `0.0.0.0` semua jaringannya (di VPS: seluruh internet IPv4). |
| ***Manifest*** | Kartu nama aplikasi: nama, ikon, alamat awal, dan tampilan `standalone`. |
| **`mqtts://`** dan **8883** | MQTT di dalam amplop, dipanggil dengan nama (`mqtts://mqtt.namaanda.my.id:8883`). Kartu pos 1883 hanya di rumah dan di lorong VPS. |
| **Pekerja latar** (*service worker*) | Penjaga kecil di browser yang menyimpan **cangkang** dashboard (tanpa angka) untuk dibuka saat luring. |
| **Pengguna biasa** dan **`sudo`** | Kamu bekerja di VPS sebagai `rumah`, bukan root; hanya perintah berawalan `sudo` berhak penuh. |
| **Pintu depan** (*reverse proxy*) | Caddy: satu alamat HTTPS untuk halaman, `/api`, dan `/grafana/`, pemegang sertifikat, pengalih `http://` (`308`). |
| **PWA** | Dashboard yang bisa dipasang seperti aplikasi: konteks aman + *manifest* + pekerja latar. |
| **QoS 0** dan **QoS 1** | Surat biasa tanpa tanda terima (cara Node 1 menerbitkan `telemetry`), dan surat tercatat yang dikirim ulang sampai dijawab. |
| **Rantai** | Tanda tangan bersambung dari sertifikatmu lewat penerbit antara sampai akar; tanpa akar yang dikenal klien, ditolak. |
| ***Record*** A, AAAA, CNAME | Baris buku telepon: nama → IPv4; nama → IPv6 (jangan dibuat: loket `0.0.0.0` hanya IPv4); nama → nama lain. |
| **SAN** | Daftar nama sah di sertifikat; panggil broker dengan nama, bukan IP. |
| **Sertifikat** (kartu identitas) | Diperiksa tiga hal: rantai, nama, dan tanggal. Caddy memintanya untuk `iot.` dan `mqtt.`; `sertifikat-mqtt` menyalinnya untuk broker. |
| **Sesi bersih** dan **sesi tetap** | Broker melupakan langganan klien yang putus (Node 1; jembatan di sisi pusat), atau menahan pesan QoS 1 untuknya (backend 1.4.0; jembatan di sisi gerbang). |
| **`setInsecure()`** | "Amplop tanpa memeriksa kartu" di Modul 10, "sementara, sampai Modul 27": kini jangan dipakai. 🧩 Tingkat 1 menggantinya dengan pemeriksaan akar. |
| **SSH**, **kunci SSH** (ed25519), **sidik jari host** | Terminal jarak jauh lewat pintu 22; masuk dengan sepasang berkas, satu rahasia di laptop dan satu dititipkan; kunci VPS dicatat di `known_hosts`. |
| **Susulan** | Bacaan yang tiba belakangan sesudah jembatan pulih, tercatat pada `ts` kejadiannya (`tiba_susulan` di `skrip/cek-susulan.sql`). |
| **`TRUST_PROXY`** (penerus tepercaya) | Backend 1.4.0 memercayai `X-Forwarded-For` dan `-Proto` hanya dari alamat privat (`uniquelocal`), yaitu Caddy: IP tamu asli, `429` per tamu, *cookie* `Secure`. |
| **TTL** | Berapa detik jawaban DNS boleh diingat penanya (`ttl = 300` = lima menit). |
| **ufw** | Tembok api (*firewall*) Ubuntu di VPS: 22 dulu, lalu 80, 443, dan 8883. Tidak menjaga loket Docker. |
| **VPS** | Komputer sewaan yang menyala 24 jam, rumah kedua yang selalu terjaga, dengan IP publik (`203.0.113.10`). |

## 📝 Kuis (5 soal)

[Tanda lulus Fase 5](../../SILABUS.md#8-evaluasi--tanda-kelulusan-tiap-fase) meminta paling sedikit 4 benar di setiap kuis Modul 26–30.

1. *Record* A `iot` dan `mqtt` di Cloudflare menunjuk `203.0.113.10`. (a) Apa yang terjadi pada jembatan Pi bila awan `mqtt` oranye? (b) Awan abu-abu membuat IP VPS terlihat oleh siapa saja. Lalu apa yang menjaganya?
2. Di VPS kamu mengetik `sudo ufw deny 1883`, lalu mengisi `ALAMAT_MQTT=0.0.0.0` supaya MQTTX bisa mencoba. (a) Apakah 1883 tertutup dari internet? (b) Apa yang benar-benar menutupnya, dan bagaimana backend tetap sampai ke broker?
3. Sesudah internet rumah putus 10 menit, `cek-susulan.sql` menulis `tiba_susulan 58` dan `kembar 0`. (a) Kenapa susulan tercatat pada jam kejadian dan tidak pernah kembar? (b) Apa yang membuat "tanpa celah" baru benar minggu ini?
4. Saat internet rumah putus, kamu menekan **Lampu** dari HP; internet kembali 5 menit kemudian. (a) Apa yang kamu lihat, dan apa nasib perintah itu? (b) Kenapa perintah sengaja tidak ditahan, padahal bacaan ditahan?
5. (a) Kenapa dashboard bisa dipasang dari `http://localhost` dan `https://iot.namaanda.my.id`, tetapi tidak dari `http://192.168.1.10` (mode HP)? (b) Aplikasi itu dibuka saat HP luring. Apa yang tampil?

<details>
<summary><b>Kunci jawaban</b></summary>

1. (a) Awan oranye menjawab alamat Cloudflare, yang hanya meneruskan port web; 8883 tidak termasuk, jadi MQTT jembatan tidak sampai. Awan abu-abu menjawab IP VPS asli ([Konsep 5](#5-domain-dan-dns-buku-telepon-internet)). (b) Alamat VPS memang publik; penjaganya ufw untuk program di VPS dan alamat loket `127.0.0.1` untuk kontainer.
2. (a) Tidak. Docker membelokkan paket ke loket kontainer sebelum ufw membacanya, jadi kartu pos 1883, termasuk akun dan sandi perangkat, terbuka ke seluruh internet IPv4. (b) Kembalikan `ALAMAT_MQTT=127.0.0.1` (bawaan): loket hanya untuk VPS sendiri, dibuktikan T2a (8.3). Backend memanggil `mqtt://mosquitto:1883` lewat lorong, bukan loket ([Konsep 4](#4-tembok-api-yang-bocor-ufw-dan-docker)).
3. (a) `ts` buatan perangkat ikut ditahan dan diteruskan apa adanya. Kunci utama `(device_id, ts)` dengan `ON CONFLICT DO NOTHING` melewati kiriman ulang (`kiriman ganda dilewati`), jadi `kembar` selalu 0. (b) Jendela buta: setelan Silabus apa adanya kehilangan QoS 0 yang terbit sebelum gerbang sadar. `upgrade_outgoing_qos true` meneruskannya sebagai QoS 1, yang dikirim ulang sampai dijawab (lab penulis: 90 terbit, 90 tersimpan) ([Konsep 9](#9-jembatan-simpan-teruskan-siapa-menahan-apa)).
4. (a) *Toast* `Lampu: belum dikonfirmasi perangkat; …`; sesudah sambung, log backend `… tidak dikerjakan lebih dari 2 menit: tidak dikirim lagi`, lampu tidak berubah. (b) Lampu atau pompa yang bergerak beberapa menit kemudian, padahal dashboard sudah melaporkan gagal, berbahaya (pembanding `cleansession false` di lab penulis: 3–4 menit kemudian). `cleansession true`: pusat tidak menyimpan `cmd`; `local_cleansession false`: gerbang tetap menahan antrean naik ([Konsep 9](#9-jembatan-simpan-teruskan-siapa-menahan-apa)).
5. (a) Pekerja latar dan pemasangan hanya ada di konteks aman, `https://` atau `localhost`: lewat kartu pos `http://`, isi halaman bisa diubah di jalan, padahal pekerja latar menjawab setiap permintaan dan menetap di browser. (b) Layar **Masuk** dengan pesan luring, bukan halaman galat browser. Angka lama tidak ada: cangkang tidak memuatnya, dan `/api` serta `/socket.io` selalu ke jaringan ([Konsep 11](#11-pwa-dari-pintasan-menjadi-aplikasi)).

</details>

---

## ✅ Checklist kelulusan Modul 27

Syarat lulus dari [Silabus](../../SILABUS.md#modul-27--ke-internet-vps-domain-https-tls-mqtt-bridge-pi--vps--aplikasi-di-hp-pwa): "teman di kota lain membuka dashboard Anda lewat HTTPS dan melihat angka berubah; MQTTX **tanpa** TLS ditolak di port 8883 VPS dan log Mosquitto menunjukkan koneksi TLS dari bridge; data 10 menit saat internet rumah putus muncul susulan tanpa dobel." Pecahannya **T1, T2a, T2b, T3**. **Tanpa Pi:** seperti jalur utama, T3 = WiFi laptop dimatikan (belum diuji penulis). **Tanpa Kit** dan **Wokwi:** T1–T3 dengan simulator dan Kebun tiruan. **Tanpa domain:** belum bisa lulus.

> [!NOTE]
> **Penulis belum menguji VPS, domain, Let's Encrypt produksi, Cloudflare, HP, jaringan seluler, teman, router, MQTTX, dan ESP32 dengan TLS**: kotak Hasilnya berasal dari internet tiruan ([📚](#-sumber--atribusi-gambar)). Centang hanya yang sudah terjadi padamu; yang belum, tulis "belum" di catatan (➕ F) dan *pull request*-mu.

- [ ] **T1** Temanmu membuka `https://iot.namaanda.my.id` dari jaringannya: gembok, **Live**, angka Node 1 berganti; akunnya sudah dihapus (12.4). Pengganti tercatat: HP-mu lewat data seluler. **T1-gratis:** lewat Tunnel (11.8, 12.4).
- [ ] **T2a** Tanpa TLS ke 8883 ditolak (MQTTX, atau `echo $?` → `255`), log VPS `wrong version number`; 1883 tak terjangkau dari luar (8.3). **T2-gratis:** MQTTX dari luar rumah gagal di 1883 dan 8883 (11.8).
- [ ] **T2b** Log VPS memuat `as jembatan-pi (p4, c1, k60, u'jembatan-pi').` dan `negotiated TLSv1.3` (9.3). Jalur gratis: tidak ada.
- [ ] **T3** Internet rumah dicabut 10 menit, WiFi rumah tetap menyala; `cek-susulan.sql` di VPS: `celah_lebih_12_detik 0`, `(0 rows)`, ±6 bacaan per menit, `kembar 0` (10.5). **T3-gratis:** riwayat Pi utuh (11.9) dan latihan LAN (4.4).
- [ ] Pemanasan cocok dengan "Kunci uji dirimu" (🔁); `Koneksi Anda tidak pribadi` dan kartunya dipahami, `down` tanpa sisa (Kemenangan Cepat).
- [ ] ⭐ Cabang `fitur/ke-internet`, sidik jari tercatat, arsip di `backup/`; Kit B: `ALAMAT_MQTT=0.0.0.0` (Praktik 1).
- [ ] ⭐ 118 tes lulus; backend 1.4.0 dengan `penerus tepercaya (TRUST_PROXY): uniquelocal` dan sesi tetap `c0` (Praktik 2).
- [ ] ⭐ `PWA v2.0.0`, image web 1.3.0; **Manifest** tanpa galat, *service worker* `activated`, terpasang dari `http://localhost` (Praktik 3).
- [ ] ⭐ `state 1`; putus 10 menit di LAN tanpa celah dan tanpa dobel; lampu yang ditekan saat putus tetap **Mati** (Praktik 4).
- [ ] ⭐ Jalur utama: `sshd -T` tiga `no`, jendela kedua masuk dengan kunci; ufw aktif; Docker tanpa `sudo` (Praktik 5).
- [ ] ⭐ Jalur utama: *record* A `iot` dan `mqtt` berawan abu-abu, tanpa AAAA, dan `nslookup` menjawab IP VPS; jalur gratis: *nameserver* Cloudflare aktif (Praktik 6).
- [ ] ⭐ Jalur utama: sidik jari VPS = laptop; backend laptop berhenti; dua sertifikat; `308`, gembok, *cookie* **Secure**; `429` per tamu (Praktik 7).
- [ ] ⭐ Jalur utama: `broker.key` milik `1883`, pintu 8883 terbuka; skrip perpanjangan menulis `broker dimuat ulang` (Praktik 8).
- [ ] ⭐ Jalur utama: Node 1 **Live** di dashboard VPS, **Lampu** dijawab `ack` (Praktik 9).
- [ ] ⭐ Jalur gratis: sidik jari Pi sama, backend laptop berhenti; jembatan LAN masuk ke pusat Pi; `cloudflared` `Up` (Praktik 11).
- [ ] ⭐ Dashboard terpasang di HP (12.1 atau 12.2); **Live** lewat data seluler (Praktik 12).
- [ ] Simulator lewat `mqtts://` tampil **Online** (Praktik 13, opsional).
- [ ] Keamanan: VPS hanya membuka 22, 80, 443, dan 8883, cron sertifikat di `crontab -l` (jalur utama); `.env` setiap mesin `chmod 600`, tidak di Git; sandi admin Grafana kuat, orang lain memakai akun Viewer.
- [ ] Proyek cocok dengan `kode/`; README, kontrak 1.5, `.env.example`, templat *pull request*, dan catatan belajar diperbarui (➕ A–D, F).
- [ ] ⭐ *Pull request* "Online di internet: HTTPS, TLS MQTT, jembatan tahan putus, PWA" digabung ke `main`, tanpa `.env`, `TUNNEL_TOKEN`, berkas kunci, atau isi lemari Caddy; setiap mesin sudah `git pull` (➕ E).

**Rumah Pintar Mini kini online di internet, terenkripsi, dan tahan putus internet.** Dashboard terbuka lewat HTTPS dari mana saja, juga sebagai aplikasi di HP, kunci perangkat tidak lagi lewat polos di internet, dan bacaan selama internet rumah putus menyusul tanpa celah dan tanpa dobel. Batasnya: firmware Node 1 masih diunggah lewat kabel, dan Node 1 masih di breadboard.

> ➡️ **Modul berikutnya:** Modul 28 — OTA Update, Provisioning, Fleet, & Dari Breadboard ke Kotak (segera terbit; [ringkasannya di Silabus](../../SILABUS.md#modul-28--ota-update-provisioning-fleet--dari-breadboard-ke-kotak)). Node 1 diperbarui tanpa kabel (OTA lewat HTTP dari server) dan kembali sendiri ke versi lama bila gagal (*rollback*), versinya tampil di halaman `/armada`, dan rangkaiannya pindah ke kotak proyek.

## 📚 Sumber & atribusi gambar

**Sumber resmi** (dibaca Oktober 2026, terakhir 29 Okt; isinya rilis terbaru):

- **Caddy 2.11**: [HTTPS otomatis](https://caddyserver.com/docs/automatic-https), [`reverse_proxy`](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy), [opsi global](https://caddyserver.com/docs/caddyfile/options) (`trusted_proxies`), [lemari data](https://caddyserver.com/docs/conventions). **Mosquitto 2.1**: [`mosquitto.conf(5)`](https://mosquitto.org/man/mosquitto-conf-5.html), [`mosquitto-tls(7)`](https://mosquitto.org/man/mosquitto-tls-7.html) (janji Modul 21), [`mosquitto_sub(1)`](https://mosquitto.org/man/mosquitto_sub-1.html) (`--no-tls`), [ChangeLog](https://github.com/eclipse-mosquitto/mosquitto/blob/master/ChangeLog.txt) (2.0.0: turun hak sebelum membaca sertifikat).
- **Let's Encrypt**: [64 hari mulai 10 Feb 2027](https://letsencrypt.org/2026/10/07/64-day-certs), [45 hari mulai 16 Feb 2028](https://letsencrypt.org/2025/12/02/from-90-to-45), [rantai dan akar](https://letsencrypt.org/certificates/), [batas laju](https://letsencrypt.org/docs/rate-limits/), [akhir surel kedaluwarsa](https://letsencrypt.org/2025/06/26/expiration-notification-service-has-ended); `my.id` di [Public Suffix List](https://publicsuffix.org/list/public_suffix_list.dat).
- **VPS**: Docker [Engine di Ubuntu](https://docs.docker.com/engine/install/ubuntu/), [*firewall*](https://docs.docker.com/engine/network/packet-filtering-firewalls/) (Docker dan ufw "incompatible"), [grup `docker`](https://docs.docker.com/engine/install/linux-postinstall/); Ubuntu [OpenSSH](https://ubuntu.com/server/docs/how-to/security/openssh-server/), [ufw](https://ubuntu.com/server/docs/how-to/security/firewalls/), [pembaruan otomatis](https://ubuntu.com/server/docs/how-to/software/automatic-updates/).
- **Domain dan Cloudflare**: [Kebijakan Pendaftaran PANDI v9.0](https://pandi.id/public/files/2024/10/kebijakan-pendaftaran-nama-domain-versi-9-0-bilingual-new-1729151599.pdf) (30 Sep 2024; mungkin sudah diperbarui); Cloudflare [status *proxy*](https://developers.cloudflare.com/dns/proxy-status/), [port yang diproksi](https://developers.cloudflare.com/fundamentals/reference/network-ports/) (tanpa 8883), [Tunnel](https://developers.cloudflare.com/tunnel/), [membuat Tunnel](https://developers.cloudflare.com/tunnel/get-started/) (**Published application**).
- **Backend dan PWA**: Fastify [`trustProxy`](https://fastify.dev/docs/latest/Reference/Server/), [`@fastify/cookie`](https://github.com/fastify/fastify-cookie) (`secure: "auto"`), [vite-plugin-pwa 2.0.0](https://github.com/vite-pwa/vite-plugin-pwa/releases/tag/v2.0.0), web.dev [syarat pemasangan](https://web.dev/articles/install-criteria), MDN [konteks aman](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts), Apple [Panduan Pengguna iPhone](https://support.apple.com/id-id/guide/iphone/iphea86e5236/ios) (id-id). **Hanya 🔬 dan 🧩**: Arduino-ESP32 3.3.12 [`WiFiClientSecure`](https://github.com/espressif/arduino-esp32/blob/master/libraries/NetworkClientSecure/README.md). Syarat lulus dari [Silabus §7 Modul 27](../../SILABUS.md#modul-27--ke-internet-vps-domain-https-tls-mqtt-bridge-pi--vps--aplikasi-di-hp-pwa) (v1.0.29).

**Gambar.** Rincian per file: [`aset/SUMBER.md`](aset/SUMBER.md).

| File | Sumber | Lisensi / keterangan |
| :--- | :--- | :--- |
| 8 diagram (`dua-jalur-ke-internet` … `pwa-dari-pintasan`) | Diagram orisinal dari `kode/` dan lab tiruan penulis; rantai Let's Encrypt dari dokumennya dan `openssl s_client` ke `api.open-meteo.com`. Angka = lab tiruan; IP = **contoh**; ufw, SSH, registrar, Cloudflare, dan HP dari dokumen, **tidak diuji**. | CC BY 4.0 (`.svg` di `aset/`) |
| 6 komposit (`amplop-tanpa-kartu` … `dashboard-dari-luar`) | Tangkapan asli Chrome 156 tanpa layar di mesin rekaman, CA tiruan (lebar 1280 px; 375 px = mode perangkat Chrome, **bukan HP**); bilah alamat, gembok, dan dialog pemasangan tidak tertangkap. Akun uji lab; sandi dan token tak tampak. | Chromium (BSD), Caddy (Apache-2.0), Grafana OSS (AGPLv3), React dan Recharts (MIT) tampil apa adanya untuk tujuan pendidikan; judul, nomor, keterangan CC BY 4.0 |

**Tentang kotak Hasilnya.** "Lab penulis" umumnya **lab akhir**, 29 Oktober 2026 ±22.05 WIB sampai 30 Oktober ±01.30 WIB, pada `kode/` persis, di **Raspberry Pi 5 16 GB dengan Ubuntu 26.04.1 LTS (arm64)**: Docker Engine 29.1.3 dan Compose 2.40.3 (paket Ubuntu, bukan repo Docker di 5.7), Node.js 24.21.0, dan Chrome 156 tanpa layar. Beberapa kotak dari lab kode beberapa jam sebelumnya (mis. backend sesi bersih, sertifikat broker kedaluwarsa); angka bertanda "prototipe riset" dari lab riset siang itu dengan kode calon. 🔁 langkah 3–4 direkam di internet sungguhan (29 Okt ±18.45 WIB).

Mesin itu memerankan laptop, Pi, VPS, HP, teman, dan "internet" (tabel di awal modul, resep di [🔬](#-bedah-teknis-opsional)): lorong Docker `10.27.10.0/24`, Pebble 2.10.1 (akarnya baru setiap menyala), pebble-challtestsrv sebagai DNS, `docker network disconnect` sebagai kabel WAN. Klien "dari internet" = kontainer sekali pakai di lorong itu yang memercayai akar Pebble; jembatan Pi tiruan memakai akar Pebble di jalur berkas ISRG Root X1; Caddyfile "VPS" = Caddyfile proyek + 5 baris global penunjuk Pebble. Chrome tanpa layar menerima kartu Pebble hanya di profil lab dan tidak bisa memasang PWA (buktinya hanya daftar galat pemasangan yang kosong). Node 1 = simulator `f00d00000001` (di lab bernama "Latihan ruang tamu"), Node 2 = Kebun tiruan `f00d000000b2`; `device_id`-mu berbeda.

| Rekaman lab | Ditulis di naskah |
| :--- | :--- |
| `iot.contoh.test`, `mqtt.contoh.test` | `iot.namaanda.my.id`, `mqtt.namaanda.my.id` |
| IP "VPS" `10.27.10.10`; rumah `10.27.10.20`; tamu `10.27.10.1xx` | `203.0.113.10`; `198.51.100.20`; `198.51.100.<n>` (blok alamat dokumentasi) |
| folder penerbit `pebble-14000-dir` | `acme-v02.api.letsencrypt.org-directory` |
| nama proyek, kontainer, lemari, image lab | `rumahpintar…`, `rumahpintar-gerbang…`, `kemenangan-cepat`, `ghcr.io/<akun>` |
| jalur mesin; IP LAN; gerbang "Pi" | `/home/kamu/…` (laptop), `/home/rumah/…` (VPS); `192.168.1.10`; `192.168.1.37` |

Penggantian hanya pada baris yang selain itu sama persis; nama akar dan nomor seri tiruan tidak ditampilkan. Loket naskah = loketmu: backend direkam di loket lain (8080 di mesin penulis dipakai program lain), lalu ditulis 8080. Kit B: broker laptop direkam di `172.17.0.1` (pengganti `0.0.0.0`). Di "VPS" lab akhir, Caddy dan Mosquitto memakai IP "VPS" tanpa `ports:`, sehingga 1883 ikut terjangkau (artefak lab); bukti 1883 tertutup di 8.3 dari lab kode dengan baris `ports:` apa adanya.

Jam ditulis WIB: jam mesin penulis (WITA, WIB + 1 jam) di terminal ditulis ulang; log backend sudah WIB (`TZ` di Compose), log Caddy dan Grafana UTC (+7 jam), Mosquitto mencetak angka detik. Detik, ukuran, dan angka sensor = **contoh**. Uji cabut 10 menit punya dua putaran pada kode yang sama: kotak 10.5 (90 bacaan, 10 menit 37 detik) dan diagram Konsep 9 serta dua komposit (84 bacaan, 10 menit 24 detik).

Telegram = server Bot API **tiruan** (token palsu; alias `api.telegram.org` khusus lab yang **tidak ada** di proyekmu); kotak pesan = teks yang diterima tiruan itu. GitHub = repo git lokal (proyek Modul 26 dari repo terbit): `git clone`/`git push` ditulis `https://github.com/<akun>/rumah-pintar-mini.git`; *pull request* ➕ E tidak direkam. `scp` diganti `cp` (laptop dan "VPS" satu mesin); MQTTX diganti mqtt.js 5.16.1 dan `mosquitto_sub`.

Yang **tidak** diuji: VPS sungguhan (SSH, `sshd -T`, ufw, *swap*, Docker dari repo apt, *build* amd64 di 2 GB), domain `.my.id` (PANDI, *nameserver*), Cloudflare (zona, DNS only, Tunnel dan tokennya), Let's Encrypt produksi, HP Android dan iPhone, jaringan seluler, teman di kota lain, router (cabut WAN, NAT bersama), MQTTX, ESP32 dengan TLS (kode 🔬 dan 🧩 Tingkat 1 tidak dikompilasi), terowongan SSH (🧩 Tingkat 2), Windows, macOS, Docker Desktop, PowerShell, Raspberry Pi OS, Pi 2 GB, dan jalur tanpa Pi.

Yang **belum terbukti** saat terbit: label sakelar TLS MQTTX dan menu pemasangan Chrome Android; zona `.my.id` di Cloudflare paket gratis; rantai Generation Y di jembatan dan ESP32; waktu terbit dan batas laju Let's Encrypt sungguhan, juga akun tanpa email (yang terekam: Caddy membuatnya di CA tiruan); kepala yang dikirim `cloudflared` sungguhan; antrean jembatan pada beban besar; antrean gerbang selama pindahan 7.5 → 9.2 di jaringan sungguhan (lab tiruan: 51 dari 51 tiba). Uji asap di dunia nyata belum ada saat naskah ini selesai (30 Okt 2026).

---

[⬅️ Modul 26](../modul-26-docker-compose/README.md) · [Fase 5](../README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · **Berikutnya: Modul 28 — OTA Update, Provisioning, Fleet, & Dari Breadboard ke Kotak** (segera terbit; [ringkasannya di Silabus](../../SILABUS.md#modul-28--ota-update-provisioning-fleet--dari-breadboard-ke-kotak))
