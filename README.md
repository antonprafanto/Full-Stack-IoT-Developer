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
> Silabus v1.0 disetujui pada 9 Oktober 2026, dan materi modul ditulis berurutan. Saat ini tersedia **Modul 1–9 dari 32**: seluruh Fase 0 dan Fase 1. Daftar lengkap 32 modul ada di [PROGRES.md](PROGRES.md).

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
| 10 | WiFi & HTTP: Perangkat Mulai Berbicara dengan Jaringan | segera terbit — [ringkasannya di Silabus](SILABUS.md#modul-10--wifi--http-perangkat-mulai-berbicara-dengan-jaringan) | Arduino IDE, Kit A |

Modul per fase juga terdaftar di halaman fasenya: **[Fase 0 — Fondasi](fase-0-fondasi/README.md)** dan **[Fase 1 — ESP32 Embedded](fase-1-esp32-embedded/README.md)**.

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
