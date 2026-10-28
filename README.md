# Fullstack IoT Developer: Zero to Expert

🌐 **Bahasa Indonesia** · [English](en/README.md)

Kurikulum belajar mandiri **32 modul** dalam Bahasa Indonesia, dari orang awam total sampai mampu membangun sistem IoT lengkap: sensor → ESP32 → Raspberry Pi → server Node.js → dashboard di HP. Satu modul dikerjakan dalam satu minggu, jadi seluruh kurikulum memakan waktu sekitar 8 bulan. Tidak perlu latar belakang elektronika maupun pemrograman.

**[Silabus](SILABUS.md)** · **[Pelacak progres](PROGRES.md)** · **[Mulai dari Modul 1](fase-0-fondasi/modul-01-peta-besar-iot/README.md)** · **[Proyek Rumah Pintar Mini](proyek-rumah-pintar-mini/README.md)**

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="aset/arsitektur-fullstack-iot-gelap.png">
  <img src="aset/arsitektur-fullstack-iot.png" alt="Arsitektur proyek Rumah Pintar Mini dalam lima lapisan. 1, Perangkat: Node 1 Rumah (ESP32 dengan lima sensor, layar OLED, lampu, kipas, pompa, dan tirai) dan Node 2 Kebun (ESP32 berbaterai) yang mengirim datanya ke Node 1 lewat ESP-NOW. 2, Gateway: Raspberry Pi dengan broker MQTT Mosquitto, Node-RED opsional, dan antrean data saat internet putus; Node 1 tersambung ke sini lewat MQTT via Wi-Fi. 3, Backend dan data, di seberang batas jaringan rumah: server Node.js (Fastify dan TypeScript) dengan REST API, WebSocket, aturan otomatis, notifikasi Telegram, serta login dan API key perangkat, tersambung ke gateway lewat MQTT dengan TLS dan ke database PostgreSQL dengan TimescaleDB lewat SQL. 4, Dashboard: aplikasi web React (PWA) lewat HTTPS dan WebSocket, serta Grafana yang membaca database lewat SQL. 5, Operasi di bawah semuanya: Docker Compose, deploy dengan HTTPS, OTA firmware, CI/CD dan pengujian, monitoring dan backup, serta proyek akhir.">
</picture>

<sub>Lima lapisan sistem yang dibangun sepanjang kurikulum; nomor lapisan mengikuti urutan fase. Penjelasan setiap lapisan ada di [Silabus §2](SILABUS.md#2-gambaran-besar-apa-yang-akan-kita-bangun).</sub>

## Sekilas

- **Perangkat keras.** Dua ESP32 DevKit V1 (Node "Rumah" dan Node "Kebun") dan Raspberry Pi 5 sebagai gateway (Pi 4 tetap didukung). Sekitar 90 % isi Modul 1–9 bisa dikerjakan tanpa perangkat keras lewat simulator Wokwi.
- **Perangkat lunak.** Sedikit C++ (Arduino) untuk chip, lalu JavaScript/TypeScript ringan untuk semua sisanya: Node.js 24, Fastify, PostgreSQL + TimescaleDB, MQTT (Mosquitto), Modbus RTU, React 19, dan Docker.
- **Proyek benang merah.** "Rumah Pintar Mini" tumbuh dari LED berkedip (Modul 1) menjadi sistem online dengan TLS, OTA, CI/CD, dan monitoring (Modul 30), lalu menjadi proyek akhir Anda sendiri (Modul 31–32). Semuanya bertegangan rendah (USB 5 V); kurikulum ini tidak pernah menyentuh listrik 220 V.
- **Biaya.** Mulai Rp0 dengan simulator; sekitar Rp500–950 ribu untuk kit ESP32 (dua papan); sekitar Rp1,3–2,2 juta kalau ingin memakai Raspberry Pi sungguhan; VPS dan domain opsional di dua bulan terakhir.
- **Bahasa.** Ditulis dalam Bahasa Indonesia. Edisi bahasa Inggris yang lengkap, termasuk kode, gambar, dan kontrak data proyek, ada di folder [`en/`](en/README.md).

## Mulai dari mana?

1. Baca **[SILABUS.md](SILABUS.md)**: peta lengkap 6 fase dan 32 modul, prasyarat, alat yang dibutuhkan, dan cara belajar (sekitar 20 menit). Pemula cukup membaca §1, §2, §4, dan §5 dulu; glosarium ada di §12, dan "kontrak data" proyek di Lampiran A.
2. Salin **[PROGRES.md](PROGRES.md)** ke catatan Anda sendiri (atau *fork* repositori ini) untuk mencentang kemajuan.
3. Buka **[Modul 1](fase-0-fondasi/modul-01-peta-besar-iot/README.md)** dan kerjakan berurutan. Setiap modul dikerjakan dalam satu minggu, 6–10 jam (Modul N = Minggu N).

## Modul yang sudah tersedia

> [!NOTE]
> Silabus v1.0 disetujui pada 9 Oktober 2026, dan materi modul ditulis berurutan. Saat ini tersedia **Modul 1–26 dari 32**: seluruh Fase 0, Fase 1, Fase 2, Fase 3, dan Fase 4, serta Modul 26 dari Fase 5. Daftar lengkap 32 modul ada di [PROGRES.md](PROGRES.md).

| Modul | Judul | Setelah modul ini Anda bisa… | Alat utama |
| :---: | :--- | :--- | :--- |
| 1 | **[Peta Besar IoT & Kemenangan Pertama dalam 10 Menit](fase-0-fondasi/modul-01-peta-besar-iot/README.md)** | menjelaskan IoT dengan bahasa sehari-hari, membuat LED berkedip di simulator, dan menyimpan hasil belajar pertama di GitHub | Wokwi, akun GitHub |
| 2 | **[Listrik Ramah Awam, Breadboard, & Unggah Pertama ke ESP32 Asli](fase-0-fondasi/modul-02-listrik-dan-unggah-pertama/README.md)** | merangkai LED di breadboard tanpa korsleting, menghitung resistor, dan mengunggah program ke ESP32 sungguhan | Arduino IDE 2, multimeter, Kit A |
| 3 | **[Pemrograman C++ untuk ESP32 dari Nol](fase-0-fondasi/modul-03-cpp-untuk-esp32/README.md)** | menulis program C++ sendiri (variabel, `if`, perulangan, fungsi, *array*, `struct`), membaca pesan error, memakai library, dan menyimpan kemajuan dengan GitHub Desktop | Wokwi, Arduino IDE 2, GitHub Desktop |
| 4 | **[JavaScript & Node.js dari Nol (Bahasa untuk Server & Dashboard)](fase-0-fondasi/modul-04-javascript-nodejs/README.md)** | membuka terminal tanpa takut, menulis JavaScript di Node.js (variabel, JSON, `map`/`filter`, `async`/`await`), memasang library dengan npm, dan membuat server mini yang menerima data dari program lain | Visual Studio Code, Node.js 24, terminal |
| 5 | **[Anatomi ESP32, Peta Pin Kanonik, Catu Daya, & Mengendalikan Dunia Nyata](fase-1-esp32-embedded/modul-05-gpio-dan-peta-pin/README.md)** | memilih pin ESP32 yang aman, memberi daya beban tanpa membuat ESP32 *restart*, membaca tombol tanpa pantulan, dan mengendalikan LED, buzzer, servo, relay, kipas, serta pompa | Arduino IDE 2, Wokwi, Kit A + MB102 |
| 6 | **[Membaca Sensor: Analog, Digital, & Kalibrasi](fase-1-esp32-embedded/modul-06-membaca-sensor/README.md)** | membaca lima sensor (cahaya, kelembapan tanah, suhu-kelembapan udara, gerak, jarak), mengubah angka mentah menjadi persen lewat kalibrasi, meredam derau, dan membuat siram otomatis yang menolak menyala saat tandon kosong | Arduino IDE 2 + Serial Plotter, Wokwi, Kit A + multimeter |
| 7 | **[Protokol Bus Sensor: I2C, 1-Wire, SPI, Layar OLED, & Membaca Skematik](fase-1-esp32-embedded/modul-07-bus-sensor-oled-skematik/README.md)** | menyambung beberapa perangkat ke kabel bersama (I2C, 1-Wire, SPI), menampilkan semua bacaan Node 1 di layar OLED rancangan sendiri, mencatat bacaan ke kartu microSD (opsional), dan membaca skematik | Arduino IDE 2, Wokwi, Kit A Tahap 2 |
| 8 | **[Firmware Tangguh: millis(), State Machine, Kode Modular, Watchdog, & Debugging](fase-1-esp32-embedded/modul-08-firmware-tangguh/README.md)** | menulis firmware yang mengerjakan banyak hal "sekaligus" tanpa `delay()`, memecah program menjadi beberapa file, menyimpan setelan di NVS supaya tidak hilang saat listrik padam, memasang *watchdog* yang me-*restart* program macet, dan mencari *bug* secara sistematis | Arduino IDE 2, Wokwi, Kit A |
| 9 | **[Catu Daya & Hemat Daya: Adaptor, Baterai, Deep Sleep, & Mengukur Arus](fase-1-esp32-embedded/modul-09-catu-daya-dan-hemat-daya/README.md)** | memberi listrik ke perangkat tanpa laptop dengan aman, membuat ESP32 tidur dan bangun sendiri, merakit catu baterai 18650 yang aman, mengukur arus dengan INA219 lalu menghitung umur baterai, dan menuntaskan *checkpoint* Fase 1 | Arduino IDE 2, multimeter, Kit A Tahap 2 (ESP32 ke-2, INA219, 18650 + TP4056 + MT3608) |
| 10 | **[WiFi & HTTP: Perangkat Mulai Berbicara dengan Jaringan](fase-2-konektivitas/modul-10-wifi-dan-http/README.md)** | menyambungkan ESP32 ke WiFi rumah tanpa menulis kata sandi di kode, membuatnya tersambung lagi sendiri saat WiFi putus, mengambil jam dari internet, mengirim bacaan sensor ke laptop lewat HTTP, dan menyalakan lampu dari browser HP | Arduino IDE 2, Kit A, laptop + Node.js, HP |
| 11 | **[MQTT: Bahasa Resmi Dunia IoT & Kontrak Data Proyek](fase-2-konektivitas/modul-11-mqtt-dan-kontrak-data/README.md)** | menjalankan broker MQTT sendiri di laptop, membuat ESP32 menerbitkan bacaan dan menerima perintah lewat broker, status *online*/*offline* otomatis, perintah yang selalu dijawab `ack`, serta kontrak data proyek lengkap dengan alat pemeriksanya | Mosquitto, MQTTX, Kit A, laptop + Node.js |
| 12 | **[Raspberry Pi & Linux Dasar: Gateway yang Selalu Hidup](fase-2-konektivitas/modul-12-raspberry-pi-dan-linux/README.md)** | menyiapkan Raspberry Pi tanpa monitor, masuk lewat SSH, sekitar 20 perintah Linux dasar, alamat tetap, dan broker Mosquitto sebagai layanan yang menyala dan bangkit sendiri: gateway 24 jam yang membuat Rumah Pintar Mini tetap hidup tanpa laptop | Raspberry Pi (Kit B) atau laptop, SSH, Mosquitto |
| 13 | **[Node-RED & Dashboard 2: Dashboard Pertama Tanpa Koding](fase-2-konektivitas/modul-13-node-red-dashboard/README.md)** | memasang Node-RED di gateway sebagai layanan, menyusun flow tanpa menulis program, dashboard v0 di HP (jarum, tangki air, grafik, sakelar yang menunggu `ack`), otomasi kipas berhisteresis, dan menyimpan flow ke repositori | Node-RED di Pi (Kit B) atau laptop, HP |
| 14 | **[Node 2 "Kebun": Sensor Bertenaga Baterai via ESP-NOW](fase-2-konektivitas/modul-14-node-2-esp-now/README.md)** | Node 2 bertenaga baterai di kebun berbicara langsung ke Node 1 lewat ESP-NOW tanpa router: mencari channel router, paket 33 byte, Node 1 sebagai jembatan ke MQTT yang tetap mendengar saat router mati, kartu Kebun di Node-RED, ukur arus dan umur baterai, serta enkripsi ESP-NOW | 2 ESP32, baterai 18650, BME280, DS18B20, INA219 |
| 15 | **[Lab Modbus RTU/RS-485 & Memilih Protokol yang Tepat](fase-2-konektivitas/modul-15-modbus-rs485-dan-protokol/README.md)** | membaca sensor industri lewat kabel RS-485 dengan Modbus RTU: modul MAX485 dan tombol bicara DE/RE, papan kedua sebagai sensor tanah tiruan, bingkai dan CRC dengan tangan, ModbusMaster, Node 1 v1.4.0 memasukkan bacaannya ke `telemetry` dan dashboard lewat kabel 5 m, serta memilih protokol yang tepat untuk lima skenario | 2 ESP32, 2 MAX485, kabel UTP 5 m |
| 16 | **[Backend Pertama dengan TypeScript Ringan: Menerima Data, API, & Git untuk Tim](fase-3-backend-data/modul-16-backend-typescript-api-git/README.md)** | membangun server Node.js dengan TypeScript ringan yang mendengarkan semua pesan MQTT, menolak data yang melanggar kontrak (Zod), dan menyediakan API berdokumentasi (`/docs`) untuk membaca perangkat serta menyalakan relay sambil menunggu `ack`; menguji dengan Bruno dan simulator 10 perangkat; bekerja seperti tim dengan *branch*, *pull request*, dan *review* | Node.js 24, Fastify, Zod, Bruno, Git |
| 17 | **[Database Pertama: SQL Dasar & Skema "Rumah Pintar Mini" (PostgreSQL via Docker)](fase-3-backend-data/modul-17-sql-dan-skema-database/README.md)** | menjalankan database PostgreSQL di laptop dengan satu perintah Docker, merancang tabel Rumah Pintar Mini lewat migrasi bernomor, menulis SQL untuk pertanyaan nyata (rata-rata suhu per hari, jam tanah paling kering), mencegah kiriman ganda, dan membuat backend v0.2 menyimpan semua pesan serta menyediakan API riwayat | Docker Desktop, PostgreSQL 17, DBeaver, `pg` |
| 18 | **[TimescaleDB: Data Deret Waktu, Agregasi Otomatis, Retensi, & Backup](fase-3-backend-data/modul-18-timescaledb/README.md)** | mengubah tabel bacaan menjadi hypertable yang dijilid per hari, meringkas data per 15 menit, per jam, dan per hari WIB dengan `time_bucket`, mengukur kecepatan sejuta baris dengan jujur (`EXPLAIN (ANALYZE)`), membuat ringkasan per jam yang diperbarui otomatis, membuang dan memadatkan data lama tanpa kehilangan ringkasannya, membuktikan backup bisa dipulihkan, dan menambahkan riwayat per ember ke backend v0.3 | TimescaleDB, psql, `pg_dump`/`pg_restore` |
| 19 | **[Realtime, Kendali Dua Arah, Aturan Otomatis (Cloud & Lokal), & Notifikasi](fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md)** | mengalirkan bacaan *live* lewat Socket.IO, mengirim semua perintah lewat satu pintu dengan keadaan yang diinginkan dan yang dilaporkan, menulis mesin aturan sebagai data beserta *unit test* Vitest, mengubah ambang lewat API tanpa *restart*, menjadwalkan siram pagi, memasang bot Telegram yang mengabari dalam 10 detik, dan membuat Node 1 v1.5.0 tetap menjaga kipas saat broker hilang | Socket.IO, node-cron, grammY, Vitest |
| 20 | **[Keamanan Pengguna: Login, JWT di Cookie, Peran, & Pengaman API](fase-3-backend-data/modul-20-keamanan-pengguna/README.md)** | membuat akun dengan sandi yang disimpan sebagai sidik jari bcrypt, *login* dengan JWT di *cookie* `HttpOnly` beserta *refresh token* dan *logout*, mengunci semua *endpoint* dan Socket.IO dengan satpam yang membedakan peran `admin` dan `viewer`, menahan penebak sandi setelah 10 percobaan per menit, memasang CORS dan pemeriksaan asal, serta menjaga rahasia tetap di `.env` | bcrypt, @fastify/jwt, @fastify/cookie, @fastify/rate-limit, @fastify/cors |
| 21 | **[Keamanan Perangkat: API Key, Provisioning Sederhana, & Hak Akses Broker (ACL)](fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md)** | memberi setiap perangkat kunci sendiri (API key 43 huruf yang hanya disimpan sebagai sidik jari SHA-256), mendaftarkannya lewat `POST /devices` sebagai *provisioning* sederhana, membuat backend mengabaikan perangkat tak terdaftar atau dicabut (lapis kedua), mengunci broker Mosquitto dengan berkas sandi dan daftar izin (ACL) pola `%u` + `use_username_as_clientid`, menyimpan kunci di NVS Node 1 (v1.6.0) lewat Serial, mencabut kunci perangkat yang hilang, dan jujur bahwa lalu lintas masih polos | Mosquitto, Zod, Bruno |
| 22 | **[HTML, CSS, & React (TypeScript) dari Nol untuk Dashboard IoT](fase-4-frontend-dashboard/modul-22-react-dasar/README.md)** | membedah halaman sakelar Modul 10 dengan HTML, CSS, dan JavaScript di DevTools, lalu membangun **dashboard v0.1** di folder `frontend`: proyek Vite `react-ts` dengan Tailwind CSS v4, komponen `KartuSensor` bertipe dari kontrak data, formulir *login* yang memakai *cookie* `HttpOnly` Modul 20 lewat CORS (selalu dibuka di `http://localhost:5173`), daftar perangkat berlencana *status* dan *kunci* Modul 21, detail bacaan terbaru semua sensor dengan jam WIB, *refresh* sesi sekali saat gelang habis, tampilan rapi di layar HP 375 px, serta lulus `npm run build` dan `npm run lint` | Vite, React, Tailwind CSS, React DevTools |
| 23 | **[Dashboard Realtime: Grafik, Gauge, Riwayat, & Status](fase-4-frontend-dashboard/modul-23-dashboard-realtime/README.md)** | membuat dashboard ***live***: satu soket Socket.IO berkunci *cookie* yang pulih sendiri saat gelang habis atau backend dimulai ulang, toko Zustand agar angka bergerak sendiri di semua layar, kartu status merah/hijau dengan "terakhir dilihat", grafik garis 5 menit, *gauge* yang jujur, riwayat 1 jam/24 jam/7 hari dari ember TimescaleDB (dimuat < 1 detik) dengan tabel berhalaman dan ekspor CSV, mode gelap ikut setelan sistem, serta membuka dashboard dari HP lewat WiFi rumah (mode HP) lalu mengembalikannya ke mode laptop | socket.io-client, Zustand, Recharts, date-fns |
| 24 | **[Kendali, Form Aturan, Peran, & Rute Terproteksi](fase-4-frontend-dashboard/modul-24-kendali-aturan-peran/README.md)** | mengubah dashboard yang hanya melihat menjadi **dashboard v1.0** yang memerintah: setiap layar beralamat sendiri (React Router 8.5.0) sehingga **Back** dan **F5** bekerja, rute terproteksi, tombol kendali khusus admin (satpam backend tetap menjawab `403`), **Keluar** yang tuntas, tombol lampu dan kipas yang langsung berganti sambil menulis `Menunggu konfirmasi perangkat…` lalu mundur sendiri kalau gagal, kabar di layar (*toast*), formulir aturan yang diperiksa skema Zod yang sama dengan backend 1.1 sampai "siram jika tanah < 30 %" benar-benar menyiram, serta aksesibilitas dasar dan uji oleh orang lain dari HP-nya lewat WiFi rumah | React Router, react-hook-form, Zod |
| 25 | **[Visualisasi Profesional: Grafana, Peta Perangkat, & Laporan](fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md)** | memasang Grafana 13.2.4 di samping database dengan satu `docker run` (hanya `127.0.0.1:3000`) dan akun database hanya-baca `grafana_baca`, merakit dashboard "Kesehatan Sistem" untuk tim teknis (RSSI, *uptime*, dan *heap* Node 1, paket per jam Node 2, variabel `$node`), membuat *alert* "node diam" ke Telegram yang tiba saat baterai Node 2 (atau Kebun tiruan) dicabut, menaikkan backend ke 1.2 untuk titik `lat`/`lng` dan laporan harian CSV yang tiba sendiri di Telegram setiap pagi, menggambar halaman **Peta** di dashboard 1.1 dengan react-leaflet dan ubin OpenStreetMap, menyimpan dashboard Grafana sebagai berkas di Git, menimbang kapan membeli platform IoT jadi, dan menutup 🎉 Checkpoint Fase 4 | Grafana, react-leaflet, Leaflet + OpenStreetMap |
| 26 | **[Docker & Docker Compose: Satu Perintah untuk Semua Layanan](fase-5-operasi-skala/modul-26-docker-compose/README.md)** | membungkus seluruh rumah dalam Docker: cetakan (*image*) dua tahap untuk backend 1.3.0 dan dashboard 1.2.0 yang disajikan Caddy di `http://localhost` (F5 aman di semua alamat), satu `compose.cloud.yml` yang menyalakan database, broker pusat, backend, web, dan Grafana dengan `docker compose up -d`, memindahkan riwayat dan Grafana ke Compose di atas lemari lama tanpa kehilangan data (sidik jari riwayat sama persis), Grafana yang menyala lengkap dari berkas (*provisioning*) tanpa *alert* ganda, layanan yang bangkit sendiri berkat *healthcheck* dan *restart policy*, broker gerbang di Pi dalam kontainer (`edge/compose.edge.yml`) dengan jembatan LAN ke laptop tanpa firmware baru, cadangan lemari beserta uji pulihnya, cetakan di toko image GHCR, dan uji laptop bersih: dari `git clone` sampai halaman **Masuk** dalam < 10 menit, dengan riwayat yang tetap ada sesudah `docker compose down` lalu `up -d` | Docker Desktop / Docker Engine, Docker Compose, Caddy, GHCR |
| 27 | Ke Internet: VPS, Domain, HTTPS, TLS MQTT, Bridge Pi → VPS, & Aplikasi di HP (PWA) | segera terbit — [ringkasannya di Silabus](SILABUS.md#modul-27--ke-internet-vps-domain-https-tls-mqtt-bridge-pi--vps--aplikasi-di-hp-pwa) | Kit A + B + VPS 2 GB (sangat disarankan) + domain |

Modul per fase juga terdaftar di halaman fasenya: **[Fase 0 — Fondasi](fase-0-fondasi/README.md)**, **[Fase 1 — ESP32 Embedded](fase-1-esp32-embedded/README.md)**, **[Fase 2 — Konektivitas](fase-2-konektivitas/README.md)**, **[Fase 3 — Backend & Data](fase-3-backend-data/README.md)**, **[Fase 4 — Frontend Dashboard](fase-4-frontend-dashboard/README.md)**, dan **[Fase 5 — Operasi & Skala](fase-5-operasi-skala/README.md)**.

## Peta kurikulum

| Fase | Modul (= Minggu) | Fokus | Hasil nyata |
| :---: | :---: | :--- | :--- |
| 0 | 1–4 | Fondasi: listrik ramah awam & unggah pertama ke ESP32, C++, JavaScript/Node.js, peralatan dipasang saat dibutuhkan | LED berkedip di simulator & di meja; nyaman membaca kode |
| 1 | 5–9 | ESP32 embedded: peta pin kanonik, catu daya, sensor, I2C/1-Wire/SPI, OLED, firmware tangguh, hemat daya & baterai | Node 1 "Rumah" mandiri yang hidup 24 jam tanpa restart; bekal Node 2 bertenaga baterai |
| 2 | 10–15 | Konektivitas: WiFi & HTTP, MQTT + kontrak data, Raspberry Pi & Linux, Node-RED, Node 2 via ESP-NOW, lab Modbus RTU/RS-485 | Dua node + gateway Pi di jaringan rumah |
| 3 | 16–21 | Backend & data: Fastify + TypeScript ringan + OpenAPI, SQL & skema, TimescaleDB, realtime & aturan otomatis (cloud + pengaman lokal), keamanan pengguna & perangkat | Server yang mengingat, memutuskan, dan berkunci |
| 4 | 22–25 | Frontend: React dashboard realtime, kendali, peran, Grafana & peta | Dashboard di HP yang bisa dipakai orang lain |
| 5 | 26–32 | Operasi: Docker Compose, deploy ke internet + TLS/HTTPS + bridge Pi→VPS + PWA, OTA & fleet, testing & CI/CD, monitoring & backup, **capstone** & portofolio | Sistem online 24/7 terenkripsi + proyek portofolio |

Rincian setiap modul (tujuan, konsep inti, alat, praktik, dan kriteria lulus) ada di [Silabus §7](SILABUS.md#7-rincian-32-modul).

## Cara bernavigasi

- **Baris navigasi** di awal dan akhir setiap modul: ⬅️ modul sebelumnya · Silabus · Pelacak progres · modul berikutnya ➡️.
- **Daftar isi** ada di awal setiap artikel. Di GitHub, tombol **Outline** (ikon bergaris di kanan atas tampilan file) juga memunculkan semua judul bagian.
- **Kode** setiap modul ada di folder `kode/` modul itu. Buka filenya, lalu klik ikon salin (**Copy raw file**) di kanan atas tampilan file untuk menyalin seluruh isinya.
- **Gambar** ada di folder `aset/` setiap modul, lengkap dengan sumber dan lisensinya di `aset/SUMBER.md`.
- **Proyek benang merah** "Rumah Pintar Mini" versi terbaru ada di [`proyek-rumah-pintar-mini/`](proyek-rumah-pintar-mini/README.md).

## Struktur repositori

```
fase-0-fondasi/ … fase-5-operasi-skala/   ← 32 folder modul: README.md (artikel) + aset/ + kode/
fase-0-fondasi/README.md                  ← daftar modul satu fase (setiap fase punya halaman seperti ini)
proyek-rumah-pintar-mini/                 ← kode proyek benang merah (firmware 2 node, alat bantu, edge, backend, frontend, compose)
aset/                                     ← gambar lintas modul
_arsip-lama/                              ← kurikulum versi sebelumnya (tidak perlu dibaca)
```

Rincian lengkap struktur folder ada di [Silabus §9](SILABUS.md#9-struktur-folder-repositori). Folder fase berikutnya dibuat saat modul pertamanya terbit.

## Gambar dan atribusi

Gambar dari internet hanya dipakai kalau lisensinya mengizinkan, dan **selalu** disertai sumber serta lisensinya tepat di bawah gambar (dan direkap di `aset/SUMBER.md` setiap modul). Diagram buatan sendiri dilisensikan **CC BY 4.0**; file `.svg`-nya disertakan supaya bisa diubah.

## Kontribusi

Menemukan salah ketik, penjelasan yang membingungkan, atau rangkaian yang tidak jalan? Buka *issue* atau *pull request*. Kritik dari pemula adalah masukan paling berharga untuk materi ramah awam.

## Lisensi

Teks dan diagram: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.id) · Kode contoh: [MIT](https://opensource.org/licenses/MIT). Gambar pihak ketiga mengikuti lisensi masing-masing sebagaimana dicantumkan.

---

Dibuat oleh [antonprafanto](https://github.com/antonprafanto) · Kodingindonesia
