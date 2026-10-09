# 🎓 Silabus — Fullstack IoT Developer: Zero to Expert

> **Kurikulum 24 modul (±30 minggu belajar santai, ±7 bulan) untuk orang awam total hingga mampu membangun sistem IoT lengkap dari sensor sampai dashboard di HP.**
> Hardware: **ESP32 + Raspberry Pi** · Software: **JavaScript (Node.js + React) untuk semua sisi server & tampilan, sedikit C++ untuk chip** · Bahasa pengantar: **Indonesia, ramah awam**.
>
> Status dokumen: **Draf v0.2 — menunggu tinjauan** (9 Oktober 2026). Perubahan dari v0.1 dirangkum di [§13](#13-riwayat-revisi). Hal yang masih terbuka untuk diputuskan ada di [§11](#11-catatan-untuk-peninjau).

---

## Daftar Isi

1. [Untuk siapa kurikulum ini & apa hasil akhirnya](#1-untuk-siapa-kurikulum-ini--apa-hasil-akhirnya)
2. [Gambaran besar: apa yang akan kita bangun](#2-gambaran-besar-apa-yang-akan-kita-bangun)
3. [Pilihan teknologi & alasannya](#3-pilihan-teknologi--alasannya)
4. [Cara belajar di kurikulum ini](#4-cara-belajar-di-kurikulum-ini)
5. [Prasyarat, peralatan, & perkiraan biaya](#5-prasyarat-peralatan--perkiraan-biaya)
6. [Peta kurikulum (ringkasan 6 fase)](#6-peta-kurikulum-ringkasan-6-fase)
7. [Rincian 24 modul](#7-rincian-24-modul)
8. [Evaluasi & tanda kelulusan tiap fase](#8-evaluasi--tanda-kelulusan-tiap-fase)
9. [Struktur folder repositori](#9-struktur-folder-repositori)
10. [Setelah "expert": peta jalan lanjutan](#10-setelah-expert-peta-jalan-lanjutan)
11. [Catatan untuk peninjau](#11-catatan-untuk-peninjau)
12. [Glosarium mini: istilah yang muncul di silabus ini](#12-glosarium-mini-istilah-yang-muncul-di-silabus-ini)
13. [Riwayat revisi](#13-riwayat-revisi)

> 💡 **Kalau Anda pemula total:** bacalah §1, §2, §4, dan §5 dulu. §7 (rincian modul) memang berisi banyak nama alat yang belum Anda kenal — itu wajar; setiap nama akan dijelaskan di modulnya masing-masing, dan [§12 Glosarium](#12-glosarium-mini-istilah-yang-muncul-di-silabus-ini) menerjemahkan istilah yang paling sering muncul.

---

## 1. Untuk siapa kurikulum ini & apa hasil akhirnya

**Kurikulum ini ditulis untuk orang yang belum pernah menyentuh kabel, breadboard, atau menulis satu baris kode pun.** Kalau Anda bisa memakai laptop, menginstal aplikasi, dan punya rasa penasaran, itu sudah cukup sebagai modal awal. Tidak ada prasyarat matematika di luar perkalian dan pembagian.

Istilah *Fullstack IoT Developer* sendiri artinya sederhana: orang yang bisa membuat **seluruh rantai** sebuah produk IoT — dari **perangkat fisik** yang membaca sensor, **jaringan** yang mengirim datanya, **server** yang menyimpan dan mengolahnya, sampai **tampilan** yang dilihat pengguna di HP atau laptop. Kebanyakan kursus hanya mengajarkan satu potong rantai itu. Kurikulum ini mengajarkan semuanya, berurutan, dengan satu proyek yang tumbuh dari modul ke modul.

**Anda akan belajar dua bahasa pemrograman, dan ini disengaja:** sedikit **C++** untuk memprogram chip ESP32 (karena JavaScript tidak praktis untuk chip sekecil itu), dan **JavaScript** untuk semua sisanya — server, database, dashboard. Modul 3 dan 4 memastikan Anda nyaman dengan keduanya sebelum dipakai sungguhan.

### Setelah menyelesaikan 24 modul, Anda akan mampu:

1. **Merangkai sensor dan alat kendali** (lampu LED, kipas kecil, pompa mini, motor servo) ke ESP32 dengan aman, tanpa takut korslet atau merusak barang.
2. **Menulis program untuk chip** (istilahnya: *firmware*) yang rapi dan tangguh: membaca banyak sensor sekaligus, hemat baterai, tidak macet berhari-hari, dan bisa diperbarui dari jarak jauh tanpa kabel (istilahnya: *OTA*).
3. **Menghubungkan perangkat ke internet** lewat WiFi dan membuatnya "berbicara" dengan bahasa standar industri IoT (istilahnya: *MQTT* dan *HTTP*).
4. **Menyiapkan Raspberry Pi** — komputer mungil seukuran kartu kredit — sebagai "kantor pos" lokal yang tetap bekerja saat internet putus.
5. **Membangun server** (istilahnya: *backend*) dengan Node.js yang menerima data, menjalankan aturan otomatis ("jika suhu > 30 °C, nyalakan kipas"), dan mengirim peringatan ke Telegram Anda.
6. **Menyimpan riwayat data** bertahun-tahun di database (PostgreSQL + TimescaleDB) dan menjawab pertanyaan seperti "berapa rata-rata suhu per jam minggu lalu?".
7. **Membuat dashboard web** yang angkanya bergerak sendiri (istilahnya: *realtime*), bisa dibuka di HP, punya grafik, tombol kendali, dan halaman login.
8. **Memasang semuanya ke internet** supaya bisa dibuka dari mana saja, 24 jam, dengan alamat sendiri dan gembok hijau di browser (istilahnya: *deploy*, *domain*, *HTTPS*) — baik di Raspberry Pi di rumah maupun di server sewaan (*VPS*).
9. **Menjaga sistem tetap hidup dan aman**: Anda diberi tahu lebih dulu saat ada yang rusak (*monitoring*), data tidak pernah hilang (*backup*), perubahan kode diuji dan dipasang otomatis (*CI/CD*), dan orang iseng tidak bisa masuk (*autentikasi*, kunci per perangkat).
10. **Menyelesaikan satu proyek akhir** (*capstone*) layak portofolio yang bisa Anda tunjukkan ke pemberi kerja atau klien.

Semua istilah dalam kurung di atas **diajarkan dari nol** di modulnya; Anda tidak diharapkan memahaminya sekarang.

### Yang sengaja *tidak* dicakup (agar pemula tidak kewalahan)

Desain PCB profesional, protokol industri (CAN bus, OPC-UA), TinyML/Edge AI mendalam, Matter/Thread, LoRaWAN secara praktik, aplikasi HP *native* (Android/iOS), dan regulasi/sertifikasi produk. Semua itu disinggung sebagai **wawasan** di modul terkait dan dirangkum menjadi peta jalan di [§10](#10-setelah-expert-peta-jalan-lanjutan). Prinsipnya: lebih baik benar-benar menguasai satu rantai lengkap daripada mengenal 30 teknologi setengah-setengah.

---

## 2. Gambaran besar: apa yang akan kita bangun

Sepanjang kurikulum, kita membangun **satu proyek benang merah bernama "Rumah Pintar Mini"**: sebuah sistem yang memantau suhu, kelembapan, cahaya, dan kelembapan tanah, lalu mengendalikan **lampu LED, kipas kecil, dan pompa mini bertegangan rendah (5 V dari USB)** — mula-mula lewat tombol fisik, lalu lewat WiFi, lalu lewat dashboard di HP, dan akhirnya otomatis berdasarkan aturan. Proyek ini sengaja dipilih karena komponennya murah, hasilnya terlihat langsung, dan polanya sama persis dengan sistem IoT komersial (*smart farming*, pemantauan gudang, *smart building*).

> ⚠️ **Tentang listrik rumah 220 V:** kurikulum ini **tidak pernah** menyambungkan apa pun ke listrik PLN 220 V. Semua yang kita kendalikan bertegangan rendah (3,3 V / 5 V dari USB) yang aman disentuh. Cara kerja relay untuk 220 V dibahas sebagai pengetahuan dan peringatan, bukan praktik.

![Diagram arsitektur fullstack IoT: sensor dan aktuator terhubung ke ESP32, ESP32 mengirim data lewat WiFi dan MQTT ke Raspberry Pi sebagai gateway, gateway meneruskan ke server Node.js dan database PostgreSQL, lalu dashboard React menampilkan data ke pengguna; lapisan operasi (Docker, deploy, OTA, monitoring) melingkupi semuanya](aset/arsitektur-fullstack-iot.png)

*Diagram arsitektur yang akan dibangun. Setiap kotak berwarna adalah satu fase kurikulum. (Gambar dibuat khusus untuk kurikulum ini, lisensi CC BY 4.0 — sumber SVG ada di `aset/arsitektur-fullstack-iot.svg`.)*

Begini cara membaca diagramnya dengan analogi sehari-hari:

| Lapisan | Analogi | Yang terjadi |
| :--- | :--- | :--- |
| **1. Perangkat (ESP32)** | Indra & tangan | Sensor "merasakan" suhu, ESP32 "memutuskan" lalu "menggerakkan" relay. |
| **2. Gateway (Raspberry Pi)** | Kantor pos lokal | Semua surat (data) dari perangkat di rumah dikumpulkan di sini dulu, baru dikirim ke pusat. Kalau jalan ke pusat putus, surat ditahan, bukan dibuang. |
| **3. Backend & Data** | Kantor pusat & gudang arsip | Menyimpan semua riwayat, menjawab pertanyaan, menjalankan aturan otomatis, dan mengirim perintah balik. |
| **4. Dashboard** | Layar di meja Anda | Tempat manusia melihat angka, grafik, dan menekan tombol. |
| **5. Operasi** | Satpam, teknisi, & tukang servis | Memastikan semuanya tetap hidup, aman, bisa diperbarui, dan tidak kehilangan data. |

Setiap modul menambahkan satu "organ" ke proyek ini. Di akhir Modul 8 Anda punya perangkat mandiri yang bekerja tanpa internet; akhir Modul 12 perangkat itu "bicara" lewat MQTT ke gateway di rumah; akhir Modul 16 ada server yang mengingat semuanya; akhir Modul 20 ada dashboard di HP (masih di jaringan rumah); akhir Modul 23 semuanya sudah online di internet dengan aman; Modul 24 adalah proyek capstone Anda sendiri.

**Peran yang berubah seiring waktu (agar tidak bingung nanti):** di Modul 11 kita memakai **Node-RED** (alat *drag-and-drop*) sebagai dashboard & otomasi pertama supaya cepat melihat hasil. Mulai Modul 13, **server Node.js buatan sendiri** mengambil alih peran otak sistem, dan Node-RED "pensiun" menjadi alat bantu opsional untuk melihat lalu lintas data. Demikian pula halaman web kecil di dalam ESP32 (Modul 9) hanya batu loncatan sebelum MQTT (Modul 10).

---

## 3. Pilihan teknologi & alasannya

Semua pilihan di bawah ini **gratis / open-source**, populer di industri, dan punya komunitas Indonesia yang besar sehingga mudah mencari bantuan. **Untuk setiap kebutuhan hanya ada satu pilihan utama** — alternatif disebut sekilas di kotak "bedah teknis" modul terkait, supaya pemula tidak lumpuh memilih.

| Lapisan | Pilihan utama | Kenapa ini, bukan yang lain? |
| :--- | :--- | :--- |
| Mikrokontroler | **ESP32 DevKit V1** (modul ESP32-WROOM-32, 30 pin) | Rp 45–80 ribu sudah termasuk WiFi + Bluetooth. Dokumentasi dan contoh paling melimpah. Arduino Uno tidak punya WiFi. Varian lain (S3/C3/C6) punya pinout berbeda — kita tunda sampai Anda mahir. |
| Bahasa firmware | **C++ (Arduino framework)**, core arduino-esp32 3.3.x, **Arduino IDE 2** | Satu-satunya pilihan yang ramah pemula sekaligus dipakai industri. PlatformIO disinggung sebagai opsi di Modul 8. |
| Simulator | **Wokwi** (di browser) | Modul 1–8 bisa dikerjakan **±90 % tanpa hardware** (tabel substitusi di §5.4). |
| Gateway | **Raspberry Pi 4 Model B 4 GB** + Raspberry Pi OS (Debian 13 "Trixie") | Komputer Linux mungil berdaya rendah. Pi 5 juga bisa (lebih kencang, adaptor berbeda). Di awal, laptop Anda bisa menggantikannya. |
| Broker pesan | **MQTT — Eclipse Mosquitto** | Protokol standar de facto IoT. Ringan, jalan di Pi, dipahami semua platform cloud. |
| Library MQTT di ESP32 | **PubSubClient** | Paling banyak contohnya. Keterbatasannya (hanya QoS 0 untuk kirim, buffer 256 byte) dibahas jujur di Modul 10. |
| Low-code | **Node-RED** | Dashboard & otomasi *drag-and-drop* untuk "kemenangan cepat" di Modul 11 sebelum menulis server sendiri. Berbasis Node.js, jadi tetap satu keluarga. |
| Backend | **Node.js 24 LTS** + **Fastify** | Satu bahasa (JavaScript) untuk server dan dashboard. Fastify modern, cepat, dan dokumentasinya rapi. (Express sangat mirip; kalau Anda menemukan tutorial Express, polanya sama.) |
| Database | **PostgreSQL 17** + ekstensi **TimescaleDB** | Belajar SQL yang berlaku di mana-mana, plus kemampuan khusus data deret waktu (ribuan data sensor per menit) tanpa belajar database baru. |
| Realtime | **Socket.IO** (WebSocket) | Angka di dashboard berubah tanpa *refresh*. |
| Frontend | **React 19 + Vite + Tailwind CSS**, state dengan **Zustand** | Framework UI paling banyak lowongannya. Next.js dikenalkan sebagai wawasan di Modul 19. |
| Grafik & visual | **Recharts**, **Grafana** | Recharts untuk dashboard buatan sendiri; Grafana untuk dashboard teknis tanpa koding. |
| Uji API | **Bruno** | Gratis, offline, koleksi tersimpan di repo (bagus untuk portofolio). |
| Deploy | **Docker + Docker Compose**, **Caddy** (HTTPS otomatis), **Cloudflare Tunnel** (akses Pi dari luar tanpa buka port) | Satu perintah menjalankan semua layanan, di Pi maupun VPS. |
| Notifikasi | **Telegram Bot API** | Gratis, tanpa verifikasi bisnis, 10 menit jadi. |
| Versi kode | **Git** lewat **GitHub Desktop** (lalu perintah `git` di terminal saat sudah nyaman) + **GitHub Actions** | Portofolio Anda adalah repositori GitHub ini sendiri. |
| Tipe statis (opsional) | **JSDoc + `// @ts-check`**, lalu **TypeScript** di peta jalan | Banyak lowongan meminta TypeScript; kita kenalkan secara bertahap tanpa membebani pemula. |

---

## 4. Cara belajar di kurikulum ini

### 4.1 Anatomi setiap modul (selalu sama, supaya Anda hafal ritmenya)

Setiap modul adalah satu artikel panjang (≈ 1 minggu belajar santai, 6–10 jam; modul bertanda ⏳ boleh 2 minggu) dengan urutan tetap:

1. **🎯 Setelah modul ini Anda bisa…** — 3–5 kalimat konkret.
2. **🧰 Yang perlu disiapkan** — komponen, aplikasi yang diinstal **di modul ini** (bukan sebelumnya), dan modul prasyarat.
3. **🏆 Kemenangan Cepat (10 menit pertama)** — langsung praktik, lihat hasil nyata (lampu menyala, angka muncul), *baru* teori.
4. **🧠 Konsep "Mengapa"** — dijelaskan dengan analogi dunia nyata, satu konsep per bagian, istilah asing selalu diterjemahkan saat pertama muncul.
5. **🔧 Praktik Langkah-demi-Langkah** — instruksi mikro 1-2-3, setiap baris kode diberi komentar bahasa manusia, diagram rangkaian fisik (bukan hanya skematik simbol).
6. **🚨 Kotak "Kalau Tidak Jalan?"** — daftar error paling umum di tahap itu dan solusinya.
7. **🔬 Bedah Teknis Mendalam (opsional, bisa dilipat)** — untuk yang ingin tahu "di balik layar" atau alternatif alat.
8. **🧩 Tantangan Mandiri** — 3 tingkat: ubah sedikit → isi bagian rumpang → buat sendiri dari nol.
9. **➕ Tambahan ke "Rumah Pintar Mini"** — apa yang modul ini sumbangkan ke proyek benang merah.
10. **📖 Glosarium & 📝 Kuis singkat** (5 soal) + **✅ Checklist kelulusan modul**.
11. **📚 Sumber & atribusi gambar** — setiap gambar yang diambil dari internet dicantumkan sumber dan lisensinya.

### 4.2 Prinsip penulisan materi (janji penulis kepada pembaca)

- **Analogi dulu, istilah belakangan.** Tegangan = tekanan air di tandon; MQTT = kantor pos; API = pelayan restoran yang membawa pesanan ke dapur.
- **Jelaskan *mengapa*, bukan hanya *bagaimana*.** "Pakai resistor 220 Ω" selalu diikuti "karena tanpa itu LED terbakar dalam sepersekian detik, begini hitungannya."
- **Tidak ada lompatan gaib.** Tidak pernah berasumsi Anda sudah tahu cara membuka terminal, menekan tombol BOOT, atau apa itu `npm`. Aplikasi diinstal **tepat saat dibutuhkan**, bukan semuanya di minggu pertama.
- **Aman secara emosional.** Listrik 3,3 V / 5 V dari USB **aman disentuh**; laptop punya pengaman arus; error adalah bagian normal dari belajar, bukan tanda Anda tidak berbakat.
- **Satu konsep baru per halaman.** Kalau ada dua konsep, salah satunya ditunda ke modul berikutnya.
- **Praktik → Teori → Eksperimen (metode "sandwich").** Coba dulu, baru dibedah, lalu ubah-ubah sendiri.
- **Bantuan bertahap (*faded scaffolding*).** Kode lengkap → kode rumpang → kerangka kosong → tantangan tanpa contekan.
- **Jujur soal keterbatasan.** Kalau sebuah alat punya kelemahan (misalnya board DevKit boros baterai), itu ditulis, bukan disembunyikan.
- **Visual yang jujur.** Gambar hanya dipakai jika benar-benar memperjelas bagian yang sedang dibahas; gambar dari internet selalu disertai sumber & lisensi; gambar buatan sendiri dibuat sederhana dan berlabel.

### 4.3 Dua jalur belajar & estimasi waktu yang jujur

| Jalur | Untuk siapa | Durasi | Cara |
| :--- | :--- | :--- | :--- |
| **Lengkap** | Awam total | ±30 minggu (±7 bulan) @ 6–10 jam/minggu | Ikuti Modul 1 → 24 berurutan; modul bertanda ⏳ (8, 11, 14, 16, 21, 24) ambil 2 minggu. |
| **Cepat** | Sudah bisa salah satu bahasa pemrograman & nyaman dengan terminal | ±22–24 minggu | Baca cepat Modul 3 & 4 (cukup kerjakan kuisnya), modul ⏳ biasanya cukup 1 minggu. |

> Bagaimana jika hanya 3–4 jam seminggu? Tidak masalah — kurikulum ini tidak kedaluwarsa. Selesaikan dalam setahun pun hasilnya sama.

### 4.4 Kalau macet: aturan 2 jam & ke mana bertanya

Pembelajar mandiri paling sering berhenti bukan karena materinya sulit, tapi karena **macet sendirian** di satu error kecil. Karena itu:

1. **Aturan 2 jam.** Kalau satu masalah tidak selesai dalam 2 jam, tandai, lewati, lanjut ke bagian berikutnya, dan kembali besok. Otak yang istirahat sering menemukan jawabannya sendiri.
2. **Cek kotak "Kalau Tidak Jalan?"** di modul itu — 80 % masalah pemula ada di sana.
3. **Bertanya dengan baik** (diajarkan di Modul 1): lampirkan foto rangkaian, kode lengkap, dan pesan error persisnya; sebutkan apa yang sudah dicoba. Tempat bertanya: *issue* di repositori ini, forum Wokwi (Discord), komunitas ESP32/Arduino Indonesia (Facebook/Telegram), forum Arduino & Raspberry Pi resmi, r/esp32.
4. **Pakai asisten AI (ChatGPT/Claude/Gemini) dengan bijak**: bagus untuk menjelaskan pesan error dan memberi ide, tapi **selalu uji jawabannya** — asisten AI sering percaya diri pada pin atau library yang salah. Modul 1 memberi contoh cara bertanya ke AI yang menghasilkan jawaban berguna.

---

## 5. Prasyarat, peralatan, & perkiraan biaya

### 5.0 Prasyarat lingkungan (periksa sebelum mulai)

| Kebutuhan | Minimum | Catatan |
| :--- | :--- | :--- |
| **Laptop/PC** | Windows 10/11, macOS, atau Linux; RAM 8 GB; ruang kosong 20 GB; port USB | **Chromebook, tablet, dan HP tidak bisa** menjalankan Arduino IDE & Docker. Laptop lama 2015+ umumnya cukup. |
| **WiFi 2,4 GHz** | Router/hotspot yang memancarkan jaringan 2,4 GHz | ESP32 **tidak bisa** tersambung ke WiFi 5 GHz. Router modern sering "menggabungkan" keduanya (*band steering*) — materi menjelaskan cara memisahkannya. **Hotspot HP** (2,4 GHz) adalah cadangan yang selalu berhasil. |
| **Jaringan tanpa halaman login** | WiFi rumah/hotspot, bukan WiFi kampus/kos berhalaman login | ESP32 tidak bisa mengisi halaman login (*captive portal*) WiFi kampus/kafe. |
| **Internet** | Untuk mengunduh alat (±3 GB total) & Fase 2+ | Kuota HP cukup untuk belajar; VPS di Fase 5 butuh koneksi stabil. |
| **Akun** | Google/email, GitHub (gratis), Telegram | Dibuat di modul yang membutuhkannya. |
| **Kemampuan dasar** | Memakai browser, menginstal aplikasi, mengetik | Tidak perlu pernah coding atau menyolder. |

### 5.1 Perangkat lunak (semua gratis, diinstal **tepat saat dibutuhkan**)

| Alat | Fungsi | Diinstal di |
| :--- | :--- | :--- |
| Wokwi (browser, tanpa instal) | Simulator ESP32 | Modul 1 |
| Akun GitHub (web) | Menyimpan hasil belajar | Modul 1 |
| Arduino IDE 2.x + core arduino-esp32 + driver USB (CH340/CP2102) | Menulis & mengunggah firmware | Modul 2 |
| GitHub Desktop | Git tanpa terminal | Modul 3 |
| Visual Studio Code + Node.js 24 LTS | Editor kode & menjalankan JavaScript (perkenalan terminal di sini) | Modul 4 |
| Serial Plotter (bawaan Arduino IDE) | Melihat grafik sensor | Modul 6 |
| Mosquitto + MQTT Explorer | Broker & "kaca pembesar" lalu lintas MQTT | Modul 10 |
| Raspberry Pi Imager, klien SSH (bawaan Windows/macOS) | Menyiapkan Pi | Modul 11 |
| Bruno | Menguji API | Modul 13 |
| PostgreSQL 17 + TimescaleDB, DBeaver | Database & GUI-nya | Modul 14 |
| Grafana | Dashboard teknis | Modul 20 |
| Docker Desktop (laptop) / Docker Engine (Pi, VPS) | Menjalankan semua layanan dengan satu perintah | Modul 21 |
| Uptime Kuma | Pemantau layanan | Modul 23 |

### 5.2 Kit A — ESP32 & elektronika dasar

Perkiraan harga marketplace Indonesia, Oktober 2026 — **bisa berubah**. Pesan **Tahap 1 di Minggu 1** agar sampai sebelum Modul 2; Tahap 2 bisa menyusul. Materi menyertakan **kata kunci pencarian & foto "benar vs salah"** untuk tiap komponen.

| Komponen | Jml | Perkiraan harga | Pertama dipakai | Catatan membeli |
| :--- | :---: | ---: | :---: | :--- |
| **TAHAP 1** | | | | |
| ESP32 DevKit V1, 30 pin, chip USB CP2102 atau CH340 | 1 (idealnya 2) | Rp 45–80 rb | Modul 2 | Kata kunci: *"ESP32 DevKit V1 30 pin"*. **Jangan** beli ESP32-S3/C3/C6, ESP32-CAM, atau versi "U" (tanpa antena) — pinout & cara pakainya beda. Node ke-2 dipakai Modul 12. |
| Kabel micro-USB **data** | 1 | Rp 10–20 rb | Modul 2 | Kabel cas murah sering tidak punya jalur data → "board tidak terdeteksi". Kata kunci: *"kabel micro USB data"*. |
| Breadboard 830 titik | 2 | Rp 15–30 rb/buah | Modul 2 | DevKit V1 memakan hampir seluruh lebar breadboard; dua breadboard dijejerkan lebih lega. |
| Kabel jumper (M-M, M-F, F-F) | 1 set | Rp 10–25 rb | Modul 2 | |
| LED 5 mm aneka warna + resistor pack (220 Ω, 1 kΩ, 4,7 kΩ, 10 kΩ) | 1 set | Rp 10–20 rb | Modul 2 | 4,7 kΩ dipakai DS18B20 (Modul 7). |
| Push button, potensiometer 10 kΩ, buzzer pasif | 2 bh | Rp 10–15 rb | Modul 5 | |
| Kapasitor elektrolit 100 µF & keramik 100 nF | 2 bh | Rp 3–5 rb | Modul 2 | Belajar polaritas; peredam *noise* sensor (Modul 6). |
| DHT22 (modul 3 pin) | 1 | Rp 25–50 rb | Modul 6 | DHT11 lebih murah tapi kurang akurat; kurikulum memakai DHT22. |
| LDR 5 mm | 2 | Rp 3–5 rb | Modul 6 | |
| Sensor kelembapan tanah **kapasitif** v1.2/v2.0 | 1 | Rp 10–20 rb | Modul 6 | Bukan yang berpelat tembaga terbuka (cepat berkarat). |
| Sensor jarak ultrasonik **3,3 V-kompatibel** (HC-SR04+ / RCWL-1601) — atau HC-SR04 biasa + 2 resistor | 1 | Rp 10–25 rb | Modul 6 | HC-SR04 biasa mengeluarkan 5 V di pin ECHO; **pin ESP32 tidak tahan 5 V** → perlu pembagi tegangan (dijelaskan di Modul 6). |
| Sensor gerak PIR HC-SR501 | 1 | Rp 10–20 rb | Modul 6 | |
| Modul relay 1–2 channel 5 V, *low-level trigger*, dengan optocoupler | 1 | Rp 8–20 rb | Modul 5 | Dipicu sinyal 3,3 V ESP32 (dibahas cara ceknya). |
| Kipas DC 5 V kecil (40 mm) **atau** motor DC + baling-baling | 1 | Rp 10–20 rb | Modul 5 | Beban untuk relay. |
| Motor servo SG90 | 1 | Rp 15–25 rb | Modul 5 | |
| Multimeter digital sederhana | 1 | Rp 50–100 rb | Modul 2 | Investasi seumur hidup. |
| **TAHAP 2** | | | | |
| Layar OLED 0,96" SSD1306 I2C (**pin header sudah tersolder**) | 1 | Rp 25–45 rb | Modul 7 | Banyak modul dijual tanpa header tersolder — cari yang *"sudah solder"*. |
| Sensor BME280 I2C (**header tersolder**) | 1 | Rp 20–50 rb | Modul 7 | Hati-hati BMP280 (tanpa kelembapan) dijual dengan nama mirip. |
| DS18B20 tahan air + **terminal adapter/modul** | 1 | Rp 15–30 rb | Modul 7 | Versi kabel telanjang perlu disolder; versi "modul DS18B20" tinggal colok. |
| Modul microSD (SPI) + kartu microSD 4–16 GB | 1 | Rp 5–15 rb + kartu | Modul 7 | |
| Pompa mini 3–5 V + selang | 1 | Rp 15–30 rb | Modul 5–6 | Untuk "siram tanaman otomatis". |
| Transistor NPN/MOSFET logic-level + dioda 1N4007 | 2 | Rp 3–5 rb | Modul 5 | Kendali pompa/motor tanpa relay (bedah teknis). |
| USB power meter **atau** modul INA219 | 1 | Rp 20–40 rb | Modul 8 | Mengukur arus saat tidur; multimeter murah tidak bisa mengukur mikroampere. |
| Baterai Li-ion 18650 + holder + modul charger TP4056 (dengan proteksi) | 1 set | Rp 30–60 rb | Modul 12 | Node kebun tanpa kabel. **Opsional.** |
| Kotak proyek plastik + terminal sekrup/perfboard | 1 | Rp 15–40 rb | Modul 22 | "Dari breadboard ke kotak". |
| **Total Kit A** | | **≈ Rp 450–750 rb** | | Kit "ESP32 starter" paketan sering lebih murah; materi memberi daftar isi minimum yang harus ada. |

### 5.3 Kit B — Raspberry Pi sebagai gateway (dibutuhkan mulai Modul 11)

| Komponen | Perkiraan harga | Catatan |
| :--- | ---: | :--- |
| Raspberry Pi 4 Model B 4 GB (pilihan utama) — atau Pi 5 4 GB | Rp 900 rb – 1,8 jt | Pi 4 lebih dari cukup; Pi 5 lebih kencang untuk database. |
| microSD 32 GB kelas A1/A2 + **card reader USB** | Rp 70–120 rb | Card reader dipakai menulis OS dari laptop. |
| Adaptor daya resmi (Pi 4: USB-C 5 V 3 A; Pi 5: 5 V 5 A) | Rp 100–250 rb | Adaptor HP sering kurang kuat → Pi restart sendiri. |
| Casing + heatsink/kipas | Rp 50–150 rb | |
| **Total Kit B** | **≈ Rp 1,2 – 2,3 jt** | |

**Alternatif hemat (jalur "tanpa Pi"):** sampai Modul 20, laptop/PC lama Anda bisa menjalankan semua peran Pi (Mosquitto, Node-RED, database). Setiap modul yang memakai Pi menyediakan **kriteria lulus alternatif** untuk jalur laptop. Raspberry Pi Zero 2 W (Rp 350–500 rb) juga cukup untuk broker + Node-RED, meski berat untuk database.

### 5.4 Belajar tanpa hardware: apa yang bisa dan tidak bisa di Wokwi

Wokwi menyediakan ESP32, LED, tombol, potensiometer, buzzer, servo, relay, DHT22, LDR, HC-SR04, PIR, DS18B20, OLED SSD1306, dan modul microSD — jadi **±90 % praktik Modul 1–8 bisa dikerjakan tanpa membeli apa pun.** Yang tidak bisa:

| Praktik | Di Wokwi | Pengganti di simulator |
| :--- | :--- | :--- |
| Sensor tanah kapasitif (Modul 6) | Tidak ada | Potensiometer sebagai "tanah basah/kering" |
| BME280 (Modul 7) | Tidak ada | DHT22 / sensor suhu NTC |
| Mengukur arus *deep sleep* (Modul 8) | Tidak bisa | Pelajari konsepnya; ukur saat kit datang |
| Uji "24 jam tanpa restart" (Modul 8) | Tidak praktis | Uji 30 menit di simulator + *uptime counter* |
| Kabel kendor, kabel cas, driver USB (Modul 2) | Tidak ada | Inilah mengapa hardware asli tetap disarankan |

### 5.5 Biaya layanan (Fase 5, opsional tapi sangat disarankan)

| Layanan | Biaya | Dipakai di |
| :--- | ---: | :--- |
| Nama domain (`.my.id` Rp 15–30 rb/tahun; `.com` Rp 150–200 rb/tahun) | Rp 15–200 rb/tahun | Modul 21 (HTTPS, Cloudflare Tunnel, Let's Encrypt **butuh** domain) |
| VPS (IDCloudHost, Biznet Gio, DigitalOcean — 1 vCPU/1–2 GB) | Rp 50–100 rb/bulan | Modul 21–23 |
| Cloudflare Tunnel, Let's Encrypt, GitHub Actions (repo publik), Telegram | Gratis | |

> **Ringkasan biaya:** mulai dengan **Rp 0** (Wokwi) untuk Modul 1–8, **±Rp 500–750 rb** untuk pengalaman hardware nyata, **±Rp 2 jt** jika ingin gateway Raspberry Pi sungguhan, dan **±Rp 50–100 rb/bulan + domain** untuk 3 bulan terakhir jika mengambil jalur VPS.

---

## 6. Peta kurikulum (ringkasan 6 fase)

| Fase | Nama | Modul | Minggu (jalur lengkap) | Hasil nyata di akhir fase |
| :---: | :--- | :---: | :---: | :--- |
| **0** | Fondasi: listrik, kode, & peralatan | 1–4 | 1–4 | LED berkedip di Wokwi & di meja Anda; nyaman menulis C++ dan JavaScript sederhana. |
| **1** | ESP32 Embedded: sensor & aktuator | 5–8 ⏳ | 5–9 | Perangkat "Rumah Pintar Mini" mandiri: membaca 5 sensor, kendali relay/servo, layar OLED, firmware tangguh. |
| **2** | Konektivitas: WiFi, MQTT, & gateway Pi | 9–12 ⏳ | 10–14 | Perangkat bicara MQTT ke broker di Raspberry Pi, dashboard Node-RED, node kedua via ESP-NOW. |
| **3** | Backend & data: Node.js + PostgreSQL | 13–16 ⏳⏳ | 15–20 | Server menyimpan riwayat, menjalankan aturan otomatis, kirim Telegram, punya login & kunci perangkat. |
| **4** | Frontend: dashboard React realtime | 17–20 | 21–24 | Dashboard di HP (jaringan rumah): grafik live, tombol kendali, riwayat, Grafana, peta. |
| **5** | Operasi & skala: deploy, OTA, CI/CD, capstone | 21–24 ⏳⏳ | 25–30 | Semua online dengan domain + HTTPS + TLS, OTA, monitoring, backup, CI/CD, dan proyek akhir portofolio. |

---

## 7. Rincian 24 modul

Format tiap modul:
**Setelah modul ini Anda bisa** (hasil) · **Konsep inti** (dalam bahasa manusia — inilah yang wajib dipahami) · **Alat yang dipakai** (nama-nama program/library; tidak perlu dihafal sekarang) · **Opsional / bedah teknis** (boleh dilewati pemula) · **Praktik & proyek mini** · **➕ Rumah Pintar Mini** (sumbangan ke proyek benang merah) · **✅ Lulus jika** (bukti konkret).

---

### 🟧 FASE 0 — FONDASI: LISTRIK, KODE, & PERALATAN (Modul 1–4)

> Tujuan fase: menghilangkan rasa takut. Di akhir fase ini Anda sudah "berbicara" dengan chip lewat kode, memahami kenapa listrik USB aman, dan punya alat kerja yang dipasang satu per satu saat dibutuhkan.

#### Modul 1 — Peta Besar IoT & Kemenangan Pertama dalam 10 Menit
*Fase 0 · Minggu 1 · Hardware: tidak perlu (Wokwi di browser) · Prasyarat: tidak ada*

- **Setelah modul ini Anda bisa:** menjelaskan IoT dan "fullstack" ke orang lain dengan bahasa sehari-hari; membuat LED berkedip di simulator; menyimpan hasil belajar pertama di GitHub; tahu cara bertanya saat macet.
- **Konsep inti:** contoh IoT di sekitar kita (meteran listrik pintar, pelacak ojek online, sensor banjir); komputer vs mikrokontroler ("otak kecil yang hanya menjalankan satu program, tanpa Windows"); kode → kompiler → chip (analogi resep → juru masak → masakan); tur singkat kelima lapisan sistem; apa itu repositori GitHub ("folder di internet yang mengingat setiap perubahan"); aturan keselamatan dasar; **cara bertanya yang baik** (foto, kode, pesan error) dan cara memakai asisten AI tanpa tersesat; **memesan Kit A Tahap 1** sekarang supaya sampai Minggu 2.
- **Alat yang dipakai:** Wokwi (tanpa instal apa pun), akun GitHub (unggah file lewat browser — belum perlu Git).
- **Opsional / bedah teknis:** sejarah singkat Arduino & ESP32; apa isi file `diagram.json` Wokwi.
- **Praktik & proyek mini:** Blink pertama di Wokwi → ubah kecepatan kedip → tambah LED kedua → pola kedip "nama Anda"; buat repositori `belajar-iot` dan unggah tangkapan layar + kode lewat web.
- **➕ Rumah Pintar Mini:** halaman "visi proyek" (apa yang ingin Anda pantau & kendalikan di rumah/kebun Anda sendiri).
- **✅ Lulus jika:** LED di Wokwi berkedip dengan pola yang Anda rancang sendiri, dan tangkapan layarnya ada di repositori GitHub Anda.

#### Modul 2 — Listrik Ramah Awam, Breadboard, & Unggah Pertama ke ESP32 Asli
*Fase 0 · Minggu 2 · Hardware: Kit A Tahap 1 (bisa Wokwi dulu bila kit belum sampai) · Prasyarat: Modul 1*

- **Setelah modul ini Anda bisa:** menjelaskan tegangan/arus/hambatan dengan analogi air; menghitung resistor LED; merangkai di breadboard tanpa korslet; mengunggah program ke ESP32 sungguhan; tahu persis mengapa 5 V USB aman tapi 220 V PLN tidak — **dan mengapa pin ESP32 hanya boleh menerima 3,3 V.**
- **Konsep inti:** tegangan–arus–hambatan (tandon, pipa, keran) dan daya; Hukum Ohm (satu rumus saja); DC vs AC; anatomi breadboard (jalur dalam yang tak terlihat); kaki LED panjang-pendek, kode warna resistor, polaritas kapasitor & dioda; kabel jumper; *common ground* ("semua harus sepakat titik nol-nya"); mengukur dengan multimeter; apa itu korslet dan apa yang terjadi; **3,3 V vs 5 V: ESP32 "berbicara" 3,3 V — pin 5 V dan 3V3 di board, mana yang boleh ke sensor, mana yang dilarang masuk ke pin GPIO**; **unggah pertama ke board asli**: memasang core ESP32 di Arduino IDE, driver USB, memilih port COM, tombol BOOT/EN, Serial Monitor.
- **Alat yang dipakai:** Arduino IDE 2 + core arduino-esp32 + driver CH340/CP2102 (**diinstal di modul ini**), multimeter.
- **Opsional / bedah teknis:** apa yang dilakukan regulator AMS1117 di board; mengapa LED tiap warna "minum" tegangan berbeda.
- **Praktik & proyek mini:** LED + resistor 220 Ω di breadboard (lalu coba 10 kΩ → redup, mengapa?); mengukur tegangan baterai & nilai resistor; Blink dari pin GPIO ESP32 asli; sengaja "merusak" rangkaian di Wokwi untuk melihat peringatan; **kotak "Kalau Tidak Jalan?" terbesar di seluruh kurikulum** (kabel cas, driver, port COM, tombol BOOT, antivirus).
- **➕ Rumah Pintar Mini:** rangkaian LED indikator status yang akan terus dipakai.
- **✅ Lulus jika:** LED di breadboard berkedip dari program yang Anda unggah sendiri ke ESP32 asli, dan Anda bisa menghitung resistor untuk LED merah 2 V pada pin 3,3 V (dan menjelaskan kenapa jawabannya bukan "pakai 5 V saja").

#### Modul 3 — Pemrograman C++ untuk ESP32 dari Nol
*Fase 0 · Minggu 3 · Hardware: tidak perlu (Wokwi / ESP32 di meja) · Prasyarat: Modul 2*

- **Setelah modul ini Anda bisa:** menulis program C++ sederhana untuk ESP32 tanpa mencontek; membaca pesan error kompiler tanpa panik; menyimpan setiap kemajuan dengan Git.
- **Konsep inti:** `setup()` vs `loop()` ("ritual pagi" vs "rutinitas seharian"); variabel & tipe data (`int`, `float`, `bool`, `String`); operator; `if/else`; `for/while`; fungsi dengan parameter & nilai balik; array; `struct` (mengelompokkan data sensor); `#define` & `const`; Serial Monitor sebagai "jendela ke otak chip"; komentar & gaya rapi; apa itu library dan cara memasangnya; **Git dasar lewat GitHub Desktop**: *commit* ("menyimpan foto kemajuan") dan *push* ("mengunggah").
- **Alat yang dipakai:** Arduino IDE 2, Wokwi, GitHub Desktop (**diinstal di modul ini**).
- **Opsional / bedah teknis:** apa yang terjadi saat kompilasi; perbedaan `String` dan `char[]`.
- **Praktik & proyek mini:** kalkulator Serial; pola kedip morse nama Anda; fungsi `nyalakanLED(berapaKali)`; array suhu dummy → hitung rata-rata; struct `BacaanSensor`; lampu lalu lintas 3 LED.
- **➕ Rumah Pintar Mini:** kerangka program dengan fungsi-fungsi terpisah yang akan diisi di Fase 1; repositori proyek dibuat lewat GitHub Desktop.
- **✅ Lulus jika:** kuis 5 soal ≥ 4 benar dan program "lampu lalu lintas 3 LED" jalan dari kode yang Anda tulis sendiri dan ter-*push* ke GitHub.

#### Modul 4 — JavaScript & Node.js dari Nol (Bahasa untuk Server & Dashboard)
*Fase 0 · Minggu 4 · Hardware: tidak perlu · Prasyarat: Modul 3*

- **Setelah modul ini Anda bisa:** membuka terminal tanpa takut; menjalankan JavaScript di Node.js; memahami *asynchronous* (menunggu tanpa membeku) yang menjadi inti semua kode IoT di sisi server.
- **Konsep inti:** **terminal/PowerShell dasar** (membuka, berpindah folder, menjalankan perintah, membaca output — 10 perintah saja); `let/const`; string, angka, boolean; array & objek (`{ suhu: 28.5 }`) dan JSON ("format surat universal"); fungsi & *arrow function*; `if`, perulangan, `map/filter`; **async/await & Promise** dengan analogi memesan makanan; `npm` & `package.json` ("daftar belanja library"); membaca/menulis file; `import/export`; `console.log` untuk debug; **tabel C++ vs JavaScript** berdampingan agar tidak tertukar.
- **Alat yang dipakai:** Visual Studio Code + Node.js 24 LTS (**diinstal di modul ini**).
- **Opsional / bedah teknis:** *event loop* Node.js; JSDoc + `// @ts-check` sebagai "pemeriksa ejaan" gratis untuk JavaScript (pintu masuk ke TypeScript nanti).
- **Praktik & proyek mini:** skrip yang membaca file JSON berisi 100 bacaan sensor palsu lalu mencetak min/maks/rata-rata; simulasi "menunggu sensor" dengan `setTimeout` + `await`; skrip kecil yang memanggil API cuaca publik (`fetch`).
- **➕ Rumah Pintar Mini:** pembuat data dummy (`generate-dummy.js`) yang akan dipakai menguji server & dashboard sebelum hardware tersambung.
- **✅ Lulus jika:** skrip statistik sensor Anda jalan dari terminal dan Anda bisa menjelaskan apa yang terjadi jika `await` dihapus.

---

### 🟧 FASE 1 — ESP32 EMBEDDED: SENSOR & AKTUATOR (Modul 5–8)

> Tujuan fase: perangkat "Rumah Pintar Mini" yang berdiri sendiri — membaca lingkungan, menampilkan di layar, dan menggerakkan sesuatu — dengan firmware yang tidak gampang hang.

#### Modul 5 — Anatomi ESP32, GPIO, & Mengendalikan Dunia Nyata
*Fase 1 · Minggu 5 · Hardware: Kit A Tahap 1 · Prasyarat: Modul 3*

- **Setelah modul ini Anda bisa:** tahu pin mana yang aman dan mana "jebakan"; mengendalikan LED, relay, buzzer, servo, dan kipas; membaca tombol dengan benar.
- **Konsep inti:** peta pinout ESP32 DevKit V1 & **daftar pin yang harus dihindari** (pin *strapping* 0/2/5/12/15, pin flash 6–11, pin input-only 34–39) — **mulai sekarang semua sensor analog dipasang di pin ADC1 (GPIO 32–39)** karena ADC2 mati saat WiFi aktif (Modul 9); `pinMode`/`digitalWrite`/`digitalRead`; *pull-up* internal ("kenapa tombol saya kebaca acak?"); *debounce*; PWM (redup-terang, nada buzzer, sudut servo); modul relay: cara kerja, *low-level trigger*, cara mengecek apakah terpicu oleh 3,3 V; arus maksimum pin (±12 mA) & kapan butuh transistor; **beban hanya DC/tegangan rendah — 220 V dibahas sebagai peringatan, bukan praktik**; keluarga ESP32 (S3/C3/C6) sekilas: mengapa kita tetap di WROOM-32.
- **Alat yang dipakai:** Arduino IDE, library ESP32Servo.
- **Opsional / bedah teknis:** transistor/MOSFET + dioda *flyback* untuk pompa/motor tanpa relay; DAC & sensor sentuh bawaan ESP32.
- **Praktik & proyek mini:** tombol → toggle LED (dengan debounce); dimmer LED via potensiometer; buzzer memainkan nada; servo 0–180°; relay menyalakan kipas DC 5 V.
- **➕ Rumah Pintar Mini:** relay lampu & kipas, servo "tirai", tombol manual.
- **✅ Lulus jika:** satu tombol menyalakan/mematikan relay tanpa "bouncing", dan Anda bisa menyebutkan 3 pin ESP32 yang sebaiknya tidak dipakai beserta alasannya.

#### Modul 6 — Membaca Sensor: Analog, Digital, & Kalibrasi
*Fase 1 · Minggu 6 · Hardware: Kit A Tahap 1 · Prasyarat: Modul 5*

- **Setelah modul ini Anda bisa:** membaca lima jenis sensor yang berbeda cara kerjanya, mengubah angka mentah → satuan nyata, dan tahu kapan sensor "berbohong".
- **Konsep inti:** ADC ("penggaris 12-bit": 0–4095) & keterbatasannya di ESP32; pembagi tegangan untuk LDR — **dan pembagi tegangan yang sama untuk menurunkan ECHO 5 V HC-SR04 ke 3,3 V**; sensor kapasitif tanah & kalibrasi kering/basah; DHT22 (protokol satu kabel, library); HC-SR04 (mengukur jarak lewat waktu gema); PIR (digital sederhana, *warm-up* 1 menit); *noise* & rata-rata bergerak; `map()` & pembatasan nilai; kapasitor 100 nF sebagai peredam *noise*; membaca datasheet bagian yang penting saja.
- **Alat yang dipakai:** library DHT sensor (Adafruit), Serial Plotter.
- **Opsional / bedah teknis:** mengapa ADC ESP32 tidak linier dan cara mengoreksinya; akurasi ±0,5 °C itu artinya apa.
- **Praktik & proyek mini:** monitor Serial yang mencetak 5 bacaan rapi tiap 2 detik; Serial Plotter; kalibrasi sensor tanah dengan gelas air; "alarm jarak" ultrasonik + buzzer; "siram otomatis" sederhana: tanah kering → pompa 3 detik.
- **➕ Rumah Pintar Mini:** semua sensor lingkungan terpasang; struct `BacaanSensor` terisi data asli.
- **✅ Lulus jika:** bacaan sensor tanah menunjukkan ±0 % di udara dan ±100 % di air, grafik LDR naik-turun saat Anda menutupnya dengan tangan, dan semua sensor analog Anda ada di pin ADC1.

#### Modul 7 — Protokol Bus Sensor: I2C, 1-Wire, SPI, & Layar OLED
*Fase 1 · Minggu 7 · Hardware: Kit A Tahap 2 · Prasyarat: Modul 6*

- **Setelah modul ini Anda bisa:** menghubungkan beberapa perangkat pintar dengan hanya 2–4 kabel; menampilkan data di layar OLED; memahami "alamat" perangkat.
- **Konsep inti:** mengapa ada protokol bus (analogi jalan tol vs jalan pribadi); **I2C** (SDA/SCL, alamat seperti 0x3C, *I2C scanner*); OLED SSD1306 (teks, angka besar, ikon sederhana); BME280 via I2C; **1-Wire** DS18B20 (banyak sensor, satu kabel, masing-masing punya "nomor seri", resistor pull-up 4,7 kΩ); **SPI** (lebih cepat, lebih banyak kabel) dengan microSD untuk *logging* offline; menggabungkan banyak sensor tanpa saling mengganggu.
- **Alat yang dipakai:** library Adafruit SSD1306 & GFX, Adafruit BME280, OneWire + DallasTemperature, SD.
- **Opsional / bedah teknis:** *clock stretching*, *pull-up* pada bus, UART sebagai "protokol" paling tua.
- **Praktik & proyek mini:** I2C scanner; OLED menampilkan suhu & kelembapan dengan tata letak rapi; dua DS18B20 di satu kabel; menyimpan log CSV ke microSD.
- **➕ Rumah Pintar Mini:** layar OLED status + log CSV lokal (cadangan saat tidak ada internet).
- **✅ Lulus jika:** OLED menampilkan semua bacaan sensor dengan layout yang Anda desain sendiri, dan file CSV di microSD bisa dibuka di Excel/LibreOffice.

#### Modul 8 — Firmware Tangguh: millis(), State Machine, Catu Daya, Hemat Daya, & Debugging ⏳
*Fase 1 · Minggu 8–9 · Hardware: Kit A (+ USB power meter) · Prasyarat: Modul 7*

- **Setelah modul ini Anda bisa:** menulis firmware yang mengerjakan banyak hal "sekaligus" tanpa `delay()`, tidak hang, bisa hidup tanpa laptop, hemat baterai, dan mudah di-debug — standar firmware yang layak dipakai sungguhan.
- **Konsep inti:** jebakan `delay()` & pola `millis()` (analogi melirik jam dinding); *state machine* sederhana (IDLE → MEMBACA → MENGIRIM → TIDUR); memecah kode ke beberapa file `.h/.cpp`; *watchdog timer* ("penjaga yang me-restart kalau program macet"); **catu daya tanpa laptop**: adaptor 5 V, *power bank* (jebakan auto-off saat arus kecil), baterai 18650 + TP4056, *brownout*; *deep sleep* & *light sleep*; **jujur soal DevKit V1**: saat tidur masih "minum" ±10 mA karena regulator & chip USB-nya, jadi baterai bertahan hari–minggu, bukan bulan — board khusus low-power dibahas di bedah teknis; menyimpan setelan di NVS/Preferences (tetap ada setelah mati listrik); *logging* bertingkat (DEBUG/INFO/ERROR); **metode debugging sistematis** (ubah satu hal, bagi dua, isolasi).
- **Alat yang dipakai:** Arduino IDE, library Preferences, USB power meter / INA219.
- **Opsional / bedah teknis:** *interrupt* (menghitung pulsa tanpa melewatkan); FreeRTOS task di dua core ESP32; PlatformIO sebagai pengganti Arduino IDE; board low-power (FireBeetle, TinyPICO); pointer & *reference* sekadar untuk membaca kode orang lain.
- **Praktik & proyek mini:** refaktor seluruh firmware Fase 1 ke pola `millis()` + state machine; ESP32 jalan dari power bank/adaptor; ESP32 tidur 30 detik, bangun, baca sensor, tidur lagi — ukur arusnya; sengaja membuat *infinite loop* dan lihat watchdog menyelamatkan.
- **➕ Rumah Pintar Mini:** firmware v1.0 — mandiri, modular, hemat daya. 🎉 **Checkpoint Fase 1.**
- **✅ Lulus jika:** perangkat berjalan 24 jam dari adaptor tanpa restart (dicek lewat *uptime counter* di OLED; di Wokwi: 30 menit) dan kode Anda tidak lagi memakai `delay()` di `loop()`.

---

### 🟦 FASE 2 — KONEKTIVITAS: WIFI, MQTT, & GATEWAY RASPBERRY PI (Modul 9–12)

> Tujuan fase: perangkat "berbicara" ke dunia luar dengan protokol standar, dan ada "kantor pos" lokal (Raspberry Pi) yang menampung semuanya. **Semua masih di jaringan rumah Anda** — membuka ke internet adalah urusan Fase 5.

#### Modul 9 — WiFi & HTTP: Perangkat Mulai Berbicara dengan Jaringan
*Fase 2 · Minggu 10 · Hardware: Kit A · Prasyarat: Modul 8, Modul 4 (JSON)*

- **Setelah modul ini Anda bisa:** menghubungkan ESP32 ke WiFi dengan andal (termasuk saat WiFi putus-nyambung), mengirim & menerima data lewat HTTP, dan mengendalikan relay dari browser HP.
- **Konsep inti:** cara kerja WiFi & alamat IP (alamat rumah vs nomor rumah); **hanya 2,4 GHz**; `WiFi.begin` → *reconnect* otomatis; menyimpan kredensial tanpa menulisnya di kode (WiFiManager / *captive portal* — "portal login seperti WiFi hotel"); sinkronisasi jam lewat NTP (& zona waktu WIB); **HTTP** sebagai surat-menyurat (GET/POST, status 200/404/500, header, body JSON); ArduinoJson; memanggil API publik (Open-Meteo); ESP32 sebagai *web server* kecil dengan **dua tautan `/on` dan `/off`** (halaman HTML cantik menunggu Modul 17 — kode HTML siap-tempel disediakan); menemukan perangkat di jaringan: **IP tetap lewat router (*DHCP reservation*)** sebagai jalur utama, mDNS `.local` sebagai bonus (tidak jalan di Android); **skema partisi "Minimal SPIFFS (1.9 MB APP with OTA)"** ditetapkan mulai sekarang agar firmware tidak "kehabisan tempat" di modul-modul berikut; **jebakan ADC2 saat WiFi aktif** (ini sebabnya Modul 5 mewajibkan ADC1).
- **Alat yang dipakai:** library WiFiManager, ArduinoJson, HTTPClient, WebServer.
- **Opsional / bedah teknis:** apa itu DNS; HTTPS di ESP32 (sertifikat — dibahas tuntas di Modul 21); ESPAsyncWebServer.
- **Praktik & proyek mini:** ESP32 mengirim bacaan sensor ke layanan uji gratis (*webhook* — "URL yang mencatat apa pun yang dikirim ke sana") tiap menit; `/on` `/off` relay dari browser HP; portal konfigurasi WiFi; uji cabut router 1 menit.
- **➕ Rumah Pintar Mini:** perangkat tersambung ke jaringan rumah, jam akurat, bisa dikendalikan dari browser (sementara, sampai MQTT di Modul 10).
- **✅ Lulus jika:** Anda bisa mematikan lampu dari HP lewat tautan ESP32, dan perangkat tersambung kembali sendiri setelah router dimatikan 1 menit.

#### Modul 10 — MQTT: Bahasa Resmi Dunia IoT
*Fase 2 · Minggu 11 · Hardware: Kit A + laptop sebagai broker · Prasyarat: Modul 9*

- **Setelah modul ini Anda bisa:** memahami *publish/subscribe* sampai ke tulang; menjalankan broker sendiri di laptop; membuat ESP32 mengirim data dan menerima perintah lewat MQTT dengan desain topik yang rapi.
- **Konsep inti:** mengapa HTTP kurang cocok untuk ribuan perangkat; model pub/sub (analogi grup WhatsApp: *broker* = server WA, *topic* = nama grup); instalasi Mosquitto di laptop (**jebakan Mosquitto 2.x: default hanya menerima dari laptop sendiri — perlu 2 baris konfigurasi — dan firewall Windows**); `mosquitto_pub/sub` & MQTT Explorer; desain nama topik (`rumah/ruangtamu/suhu`, wildcard `+` dan `#`); **QoS 0/1/2** (surat biasa / tercatat / kurir tanda tangan) — **didemokan dari laptop**, karena PubSubClient di ESP32 hanya bisa mengirim QoS 0; *retained message* ("papan pengumuman"); **Last Will & Testament** ("surat wasiat" → status online/offline otomatis); *keep-alive*; **`setBufferSize()`** karena buffer default 256 byte memotong JSON diam-diam; pola *command → ack*; *payload* JSON vs angka polos.
- **Alat yang dipakai:** Mosquitto, MQTT Explorer, library PubSubClient.
- **Opsional / bedah teknis:** MQTT 5 vs 3.1.1; library alternatif (esp_mqtt bawaan ESP-IDF) yang mendukung QoS 1/2; MQTT over WebSocket.
- **Praktik & proyek mini:** ESP32 publish 5 sensor tiap 10 detik; subscribe `rumah/+/perintah` → relay; LWT menampilkan ONLINE/OFFLINE di MQTT Explorer; uji QoS 1 vs 0 dengan `mosquitto_sub` sambil mematikan WiFi; web server `/on` `/off` dipensiunkan.
- **➕ Rumah Pintar Mini:** seluruh komunikasi pindah ke MQTT dengan skema topik yang terdokumentasi.
- **✅ Lulus jika:** Anda bisa menggambar diagram pub/sub proyek Anda di kertas, dan perintah dari MQTT Explorer menyalakan relay < 1 detik.

#### Modul 11 — Raspberry Pi: Gateway Linux yang Selalu Hidup ⏳
*Fase 2 · Minggu 12–13 · Hardware: Kit B (atau laptop / Pi Zero 2 W) · Prasyarat: Modul 10, Modul 4 (terminal)*

- **Setelah modul ini Anda bisa:** menyiapkan Raspberry Pi tanpa monitor (*headless*), nyaman dengan perintah Linux dasar, dan memindahkan broker + dashboard Node-RED ke Pi sehingga sistem hidup 24/7 tanpa laptop.
- **Konsep inti:** peran gateway & *edge* (kenapa tidak semua langsung ke cloud: biaya, internet putus, privasi); Raspberry Pi Imager + setelan SSH/WiFi sebelum boot; **SSH** ("terminal jarak jauh"); **Linux dasar** 20 perintah yang cukup (`cd`, `ls`, `nano`, `sudo`, `apt`, `systemctl`, `journalctl`); IP tetap; Mosquitto di Pi + *username/password*; **Node-RED**: *flow* MQTT → dashboard gauge/grafik/tombol dalam 15 menit; otomasi sederhana di Node-RED (jika suhu > 30 → publish perintah kipas); *systemd service* agar jalan otomatis saat boot; backup kartu SD; kapan Pi perlu *reboot* otomatis.
- **Alat yang dipakai:** Raspberry Pi Imager, SSH, Mosquitto, Node-RED + node-red-dashboard.
- **Opsional / bedah teknis:** GPIO Raspberry Pi (perbandingan dengan ESP32; proyek kita tidak memakainya); Pi sebagai *access point* sendiri; apa bedanya Pi 4 & Pi 5.
- **Praktik & proyek mini:** Pi hidup headless & dapat di-SSH; broker pindah ke Pi; dashboard Node-RED menampilkan semua sensor dan tombol relay; otomasi kipas; membaca log.
- **➕ Rumah Pintar Mini:** gateway permanen; dashboard v0 (Node-RED) yang bisa dibuka dari HP di rumah.
- **✅ Lulus jika:** cabut laptop, sistem tetap jalan: HP membuka dashboard Node-RED di Pi dan tombol kipas berfungsi. *(Jalur laptop: Mosquitto + Node-RED jalan sebagai service 24 jam tanpa membuka IDE/terminal.)*

#### Modul 12 — Banyak Perangkat & Protokol Lain: ESP-NOW, BLE, dan Memilih yang Tepat
*Fase 2 · Minggu 14 · Hardware: Kit A (2 ESP32, baterai opsional) + HP · Prasyarat: Modul 11*

- **Setelah modul ini Anda bisa:** menambah node kedua yang bicara langsung ke node pertama tanpa router; mengenal Bluetooth Low Energy; punya "peta" untuk memilih protokol nirkabel yang tepat untuk masalah nyata.
- **Konsep inti:** **ESP-NOW** (ESP32 ↔ ESP32 tanpa router, jarak jauh, hemat daya) & pola *sensor node → gateway node*; **jebakan channel**: node ESP-NOW harus di channel WiFi yang sama dengan router gateway; **BLE** dasar: ESP32 sebagai *peripheral* yang dibaca aplikasi HP (nRF Connect) — dipakai untuk memberi nama/konfigurasi perangkat, **sebagai sketsa terpisah** (BLE + WiFi + TLS sekaligus akan kehabisan memori); **tabel keputusan protokol** (jarak, daya, bandwidth, biaya) untuk LoRa/LoRaWAN, Zigbee/Thread & Matter, NB-IoT/LTE-M, Modbus — sebagai **wawasan, tanpa praktik**; keamanan dasar nirkabel (enkripsi ESP-NOW, jangan siarkan kredensial).
- **Alat yang dipakai:** library esp_now & BLE bawaan core ESP32, aplikasi nRF Connect (HP).
- **Opsional / bedah teknis:** *mesh* ESP-NOW; BLE *advertising* untuk sensor baterai koin; mengapa OTA node ESP-NOW rumit (dibahas lagi di Modul 22).
- **Praktik & proyek mini:** node kebun (ESP32 #2, baterai, deep sleep) kirim via ESP-NOW ke node utama → MQTT → Node-RED; konfigurasi nama perangkat lewat BLE dari HP; **uji: matikan router — kedua ESP32 tetap saling bicara (ESP-NOW tidak butuh router), data muncul lagi di Pi saat router hidup**.
- **➕ Rumah Pintar Mini:** node kebun nirkabel kedua. 🎉 **Checkpoint Fase 2.**
- **✅ Lulus jika:** data dari node kedua tampil di Node-RED, dan Anda bisa memilih protokol yang tepat untuk 5 skenario soal (mis. "sensor di sawah 3 km dari rumah" → LoRa).

---

### 🟩 FASE 3 — BACKEND & DATA: NODE.JS + POSTGRESQL (Modul 13–16)

> Tujuan fase: "kantor pusat" yang mengingat semuanya, mengambil keputusan, dan punya kunci pintu. Semua masih berjalan di jaringan rumah (Pi atau laptop); mengunci dengan TLS/HTTPS dan membuka ke internet adalah urusan Fase 5. Setiap modul Fase 3 **dimulai dengan "pemanasan ulang JavaScript 1 jam"** karena Modul 4 sudah 2 bulan berlalu.

#### Modul 13 — Backend Node.js Pertama: Menerima Data & Membuat API
*Fase 3 · Minggu 15 · Hardware: Kit A + B (atau laptop) · Prasyarat: Modul 4, Modul 10*

- **Setelah modul ini Anda bisa:** membangun server Node.js yang mendengarkan MQTT, memvalidasi data, dan menyediakan API yang rapi — dengan struktur proyek yang tidak memalukan saat dilihat orang lain.
- **Konsep inti:** apa itu backend & API (pelayan restoran: menerima pesanan, membawa ke dapur, mengantar hasil); struktur proyek (`src/`, `routes/`, `services/`, `config/`); `.env` ("jangan pernah commit password"); *route*, *handler*, *middleware*; MQTT client di Node → menerima semua topik → menyimpan ke memori dulu; validasi payload ("jangan percaya perangkat"); REST API: `GET /devices`, `GET /devices/:id/latest`, `POST /devices/:id/command`; kode status & pesan error yang jelas; **Node-RED pensiun sebagai otak**, tetap boleh dipakai untuk mengintip data.
- **Alat yang dipakai:** Fastify, mqtt.js, Zod (validasi), dotenv, pino (log), Bruno (**diinstal di modul ini**), nodemon.
- **Opsional / bedah teknis:** ESLint + Prettier (perapi otomatis); JSDoc + `// @ts-check` di seluruh backend; Express sebagai pembanding.
- **Praktik & proyek mini:** server menerima data 2 node & menyajikannya via API; endpoint perintah → publish MQTT → relay menyala; data dummy dari Modul 4 dipakai untuk menguji tanpa hardware; koleksi Bruno disimpan di repo.
- **➕ Rumah Pintar Mini:** backend v0.1 (tanpa database).
- **✅ Lulus jika:** `GET /devices/esp32-1/latest` di Bruno mengembalikan JSON bacaan terbaru, dan `POST .../command` menyalakan relay.

#### Modul 14 — Database: PostgreSQL + TimescaleDB untuk Data Sensor ⏳
*Fase 3 · Minggu 16–17 · Hardware: — · Prasyarat: Modul 13*

- **Setelah modul ini Anda bisa:** merancang tabel yang benar, menulis SQL untuk pertanyaan nyata, dan menyimpan data deret waktu secara efisien.
- **Konsep inti:** mengapa database (bukan file CSV); **instalasi PostgreSQL dengan installer biasa di laptop** (Docker baru di Modul 21); DBeaver; **minggu 1 — SQL dasar**: `CREATE TABLE`, `INSERT`, `SELECT`, `WHERE`, `ORDER BY`, `JOIN`, `GROUP BY`; perancangan skema `devices`, `sensors`, `readings`, `commands`, `users`; `timestamptz` (jebakan WIB vs UTC); koneksi dari Node (`pg` + *pool*); migrasi skema (file SQL bernomor); **minggu 2 — TimescaleDB**: *hypertable*, `time_bucket` ("rata-rata per 15 menit"), *continuous aggregate*, *retention policy* ("buang data mentah > 90 hari, simpan rata-rata per jam selamanya"), kompresi; *index*; *batch insert*; backup & restore (`pg_dump`).
- **Alat yang dipakai:** PostgreSQL 17, TimescaleDB, DBeaver, library `pg`.
- **Opsional / bedah teknis:** ORM (Drizzle) — kapan membantu, kapan menghalangi belajar SQL; InfluxDB sebagai pembanding.
- **Praktik & proyek mini:** semua data MQTT tersimpan; API riwayat `GET /devices/:id/readings?from=&to=&bucket=1h`; query "jam berapa tanah paling kering tiap hari minggu ini?"; memuat 1 juta baris dummy & membandingkan kecepatan dengan/tanpa hypertable; backup lalu restore ke database kosong.
- **➕ Rumah Pintar Mini:** riwayat permanen; backend v0.2.
- **✅ Lulus jika:** Anda bisa menulis SQL rata-rata suhu per jam 7 hari terakhir tanpa contekan, dan backup-restore berhasil.

#### Modul 15 — Realtime, Kendali Dua Arah, Aturan Otomatis, & Notifikasi
*Fase 3 · Minggu 18 · Hardware: Kit A + B · Prasyarat: Modul 14*

- **Setelah modul ini Anda bisa:** data mengalir ke browser tanpa *refresh*, perintah dari server sampai ke perangkat dengan konfirmasi, aturan otomatis bisa diatur tanpa mengubah kode, dan Anda ditelepon (ya, Telegram) saat ada masalah.
- **Konsep inti:** WebSocket vs HTTP *polling* (telepon vs mengecek kotak surat); *room* per perangkat; pola **command → ack → timeout** ("perintah dianggap gagal jika tak dijawab 5 detik"); **device state** (*desired* vs *reported*: "yang saya mau" vs "yang benar-benar terjadi"); status online/offline dari LWT; **rules engine** sederhana berbasis data: tabel `rules` (jika `suhu > 30` selama 2 menit → `kipas ON`, *hysteresis* agar tidak kedip-kedip); penjadwalan (siram tiap 06.00); **Telegram Bot**: kirim peringatan & terima `/status`; *debouncing* notifikasi (jangan spam); *event log* "siapa menyalakan apa, kapan"; **unit test pertama** untuk rules engine (logika murni = paling mudah diuji).
- **Alat yang dipakai:** Socket.IO, node-cron, grammY/node-telegram-bot-api, Vitest.
- **Opsional / bedah teknis:** *message queue* saat perintah menumpuk; *idempotency*.
- **Praktik & proyek mini:** terminal kecil yang menampilkan data live via Socket.IO; aturan kipas & siram otomatis dibuat lewat API, bukan kode; bot Telegram kirim "🌡️ Suhu 33 °C — kipas dinyalakan otomatis"; 10 unit test rules engine hijau.
- **➕ Rumah Pintar Mini:** otak otomasi + notifikasi; backend v0.3.
- **✅ Lulus jika:** mengubah ambang suhu lewat API langsung mengubah perilaku kipas tanpa restart server, dan Telegram Anda menerima peringatan ≤ 10 detik.

#### Modul 16 — Keamanan Dasar: Login, Peran, Kunci Perangkat, & Hak Akses Broker ⏳
*Fase 3 · Minggu 19–20 · Hardware: Kit A + B · Prasyarat: Modul 15*

- **Setelah modul ini Anda bisa:** sistem tidak bisa dibuka sembarang orang, perangkat palsu tidak bisa menyusup, dan tiap perangkat hanya boleh "bicara" di topiknya sendiri. *(Mengunci jalur komunikasi dengan TLS/HTTPS — yang butuh domain publik — dilakukan di Modul 21.)*
- **Konsep inti:** model ancaman sederhana ("siapa yang mungkin iseng & apa akibatnya"); **minggu 1 — pengguna**: *hashing* password ("simpan sidik jari, bukan wajah"), **JWT** ("gelang masuk konser") & *refresh token*, peran admin/viewer, *rate limiting*, CORS (kenapa browser menolak), *secrets* di `.env` + `.gitignore` + GitHub secret scanning; **minggu 2 — perangkat**: **API key per perangkat** & registrasi/*provisioning* sederhana, Mosquitto *username/password* + **ACL** (perangkat hanya boleh publish ke topiknya sendiri); **jujur: di jaringan rumah, lalu lintas masih tanpa enkripsi** — mengapa itu belum masalah di LAN dan mengapa wajib dibereskan sebelum ke internet (Modul 21); daftar periksa OWASP IoT Top 10 versi ramah awam.
- **Alat yang dipakai:** bcrypt, @fastify/jwt, @fastify/rate-limit, @fastify/cors, Mosquitto ACL.
- **Opsional / bedah teknis:** OAuth/login Google; *secure boot* & *flash encryption* ESP32; privasi data pengguna.
- **Praktik & proyek mini:** login (API) + proteksi semua endpoint; akun viewer tidak bisa menyalakan relay; ESP32 memakai username/password broker; uji: perangkat yang mem-publish ke topik perangkat lain ditolak ACL dan tercatat di log.
- **➕ Rumah Pintar Mini:** backend v1.0 — berkunci. 🎉 **Checkpoint Fase 3.**
- **✅ Lulus jika:** MQTT Explorer tanpa password ditolak broker, akun viewer gagal menyalakan relay (HTTP 403), dan perangkat yang "menyamar" ke topik lain ditolak ACL.

---

### 🟪 FASE 4 — FRONTEND: DASHBOARD REACT REALTIME (Modul 17–20)

> Tujuan fase: wajah produk — dashboard yang enak dipakai di HP maupun laptop, oleh orang yang tidak tahu apa itu MQTT. Masih dibuka lewat jaringan rumah; "bisa dibuka dari mana saja" menyusul di Modul 21.

#### Modul 17 — HTML, CSS, & React dari Nol untuk Dashboard IoT
*Fase 4 · Minggu 21 · Hardware: — · Prasyarat: Modul 13 (API)*

- **Setelah modul ini Anda bisa:** memahami cara halaman web dibangun dan membuat antarmuka React pertama yang menampilkan data dari API Anda.
- **Konsep inti:** HTML (kerangka), CSS (kulit), JavaScript (otot) — 1 hari untuk dasar, **termasuk membedah halaman `/on` `/off` Modul 9**; Tailwind agar tidak menulis CSS panjang; apa itu React & mengapa komponen (balok LEGO); JSX; *props* & *state*; `useState`, `useEffect`; `fetch` ke API backend; daftar perangkat & kartu sensor; *loading* & *error state*; struktur folder frontend.
- **Alat yang dipakai:** Vite, React 19, Tailwind CSS, React DevTools.
- **Opsional / bedah teknis:** JSDoc/`@ts-check` di komponen; *Virtual DOM* itu apa.
- **Praktik & proyek mini:** halaman "Daftar Perangkat" + "Detail Perangkat" dari API (bisa dengan data dummy Modul 4); komponen `KartuSensor` yang dipakai ulang; *responsive* HP/laptop.
- **➕ Rumah Pintar Mini:** dashboard v0.1 (statis).
- **✅ Lulus jika:** dashboard menampilkan bacaan terbaru semua sensor dari API, rapi di layar HP.

#### Modul 18 — Dashboard Realtime: Grafik, Gauge, Riwayat, & Status
*Fase 4 · Minggu 22 · Hardware: Kit A + B · Prasyarat: Modul 17, Modul 15*

- **Setelah modul ini Anda bisa:** angka bergerak sendiri, grafik yang bisa dibaca, dan riwayat yang bisa dijelajahi.
- **Konsep inti:** Socket.IO client & `useEffect` untuk langganan/berhenti langganan; *state management* ringan agar data live tersedia di semua halaman; grafik garis realtime (jendela 5 menit), grafik riwayat, **gauge dengan `RadialBarChart`** (Recharts tidak punya komponen gauge siap pakai); memilih visual yang jujur (skala, satuan, warna status); pemilih rentang waktu (1 jam / 24 jam / 7 hari) → API `bucket`; indikator online/offline & "terakhir dilihat"; tabel riwayat dengan *pagination*; performa: jangan *re-render* 10× per detik; dark mode.
- **Alat yang dipakai:** socket.io-client, Zustand, Recharts, date-fns.
- **Opsional / bedah teknis:** *virtualized list*; *downsampling* di sisi server.
- **Praktik & proyek mini:** grafik suhu live; halaman riwayat 7 hari dengan rata-rata per jam; kartu status perangkat merah/hijau; ekspor CSV.
- **➕ Rumah Pintar Mini:** dashboard v0.2 (live).
- **✅ Lulus jika:** menutup LDR dengan tangan membuat grafik di HP turun < 2 detik, dan riwayat 7 hari termuat < 1 detik.

#### Modul 19 — Kendali, Form Aturan, & Login di Dashboard
*Fase 4 · Minggu 23 · Hardware: Kit A + B · Prasyarat: Modul 18, Modul 16*

- **Setelah modul ini Anda bisa:** pengguna bisa mengendalikan perangkat dan mengatur aturan otomatis dengan aman dari HP di jaringan rumah.
- **Konsep inti:** tombol kendali dengan *optimistic UI* + konfirmasi *ack* (dan *rollback* jika gagal); form aturan (ambang, durasi, aksi) dengan validasi; halaman login, menyimpan token dengan aman, *protected route*, peran viewer vs admin; notifikasi di layar (*toast*); aksesibilitas dasar (kontras, ukuran sentuh); **"tambahkan ke layar utama" sebagai bookmark** — menjadikannya aplikasi sungguhan (PWA) butuh HTTPS, jadi menunggu Modul 21.
- **Alat yang dipakai:** React Router, react-hook-form, Zod (dipakai ulang dari backend).
- **Opsional / bedah teknis:** **Next.js 16** — apa bedanya dengan Vite + React, kapan perlu (SEO, SSR), kapan tidak (dashboard internal).
- **Praktik & proyek mini:** toggle lampu/kipas dengan status "menunggu konfirmasi…"; CRUD aturan; login/logout; uji oleh orang lain.
- **➕ Rumah Pintar Mini:** dashboard v1.0 — lengkap untuk pengguna akhir (di jaringan rumah).
- **✅ Lulus jika:** orang lain (bukan Anda) bisa login dari HP-nya lewat WiFi rumah, menyalakan lampu, dan membuat aturan "siram jika tanah < 30 %" tanpa bantuan.

#### Modul 20 — Visualisasi Profesional: Grafana, Peta Perangkat, & Laporan
*Fase 4 · Minggu 24 · Hardware: Kit A + B · Prasyarat: Modul 14, Modul 18*

- **Setelah modul ini Anda bisa:** punya dua jenis dashboard — buatan sendiri untuk pengguna, dan Grafana untuk tim teknis — serta tahu kapan memakai yang mana.
- **Konsep inti:** **Grafana** terhubung ke TimescaleDB: panel, variabel, *alert* ke Telegram; perbandingan jujur Node-RED vs Grafana vs React; peta perangkat dengan Leaflet/OpenStreetMap; laporan harian otomatis (CSV/PDF lewat Telegram); **wawasan**: platform IoT siap pakai (ThingsBoard, Home Assistant, Blynk, Antares) — kapan membeli, kapan membangun.
- **Alat yang dipakai:** Grafana (**diinstal di modul ini**), react-leaflet.
- **Opsional / bedah teknis:** *embed* panel Grafana di React; Grafana Loki untuk log.
- **Praktik & proyek mini:** dashboard Grafana "Kesehatan Sistem" (RSSI, uptime, heap tiap node); alert "node offline > 5 menit"; peta node; laporan harian via Telegram.
- **➕ Rumah Pintar Mini:** dashboard teknis + laporan. 🎉 **Checkpoint Fase 4.**
- **✅ Lulus jika:** Grafana mengirim alert Telegram saat Anda mencabut node kedua, dan laporan harian tiba otomatis.

---

### ⬛ FASE 5 — OPERASI & SKALA: DEPLOY, OTA, CI/CD, & CAPSTONE (Modul 21–24)

> Tujuan fase: dari "jalan di jaringan rumah saya" menjadi "jalan di internet, 24/7, terenkripsi, bisa diperbarui, dan tidak kehilangan data" — lalu membuktikannya dengan proyek akhir.

#### Modul 21 — Docker, Deploy ke Internet, TLS/HTTPS, & Aplikasi di HP (PWA) ⏳
*Fase 5 · Minggu 25–26 · Hardware: Kit B + VPS (sangat disarankan, Rp 50–100 rb/bulan) + domain · Prasyarat: Modul 16, Modul 19*

- **Setelah modul ini Anda bisa:** menjalankan seluruh sistem dengan satu perintah di mesin mana pun, membukanya ke internet dengan domain + gembok hijau, mengenkripsi jalur MQTT, dan memasang dashboard sebagai aplikasi di HP.
- **Konsep inti:** **minggu 1 — Docker**: masalah "di laptop saya jalan"; *image*, *container*, *volume*, *network* (analogi kontainer kapal); `Dockerfile` backend & frontend; **Docker Compose** menyatukan Mosquitto + PostgreSQL/Timescale + API + Web + Grafana (+ Node-RED opsional); *healthcheck* & *restart policy*; jalan di Pi (ARM64). **Minggu 2 — ke internet**: memilih & menyewa VPS, SSH key, *firewall* (ufw); domain & DNS; **Caddy** sebagai *reverse proxy* + HTTPS otomatis (Let's Encrypt); **TLS untuk MQTT (port 8883)** — sertifikat yang sama dipakai Mosquitto (Caddy tidak memproksi MQTT), memasang root CA Let's Encrypt di ESP32; **arsitektur hibrida**: Pi tetap gateway lokal, VPS jadi pusat — **Mosquitto *bridge* Pi → VPS dengan antrean (*store-and-forward*)** sehingga data tidak hilang saat internet rumah putus; **Cloudflare Tunnel** untuk jalur gratis: dashboard & API di Pi bisa diakses dari luar tanpa membuka port, **tetapi broker MQTT tidak bisa lewat tunnel biasa** (hanya HTTP/WebSocket) — jadi perangkat di lokasi lain butuh VPS atau MQTT over WebSocket; **PWA**: *manifest*, ikon, *service worker* → "Tambahkan ke layar utama" sungguhan (butuh HTTPS yang baru ada sekarang).
- **Alat yang dipakai:** Docker + Compose, Caddy, Cloudflare Tunnel, Let's Encrypt, `WiFiClientSecure` di ESP32, vite-plugin-pwa.
- **Opsional / bedah teknis:** Nginx sebagai pembanding; `docker compose` vs Kubernetes (kapan tidak perlu); MQTT over WebSocket lewat tunnel.
- **Praktik & proyek mini:** `docker compose up -d` menjalankan semua di Pi; versi cloud di VPS dengan `https://iot.namaanda.my.id`; ESP32 tersambung ke broker VPS via TLS 8883; bridge Pi→VPS; uji cabut internet rumah 10 menit → data muncul susulan; PWA terpasang di HP; uji dari jaringan seluler.
- **➕ Rumah Pintar Mini:** online di internet, terenkripsi, tahan putus internet.
- **✅ Lulus jika:** teman di kota lain membuka dashboard Anda lewat HTTPS dan melihat angka berubah; tangkapan `tcpdump` menunjukkan lalu lintas MQTT ke VPS sudah terenkripsi; data 10 menit saat internet rumah putus muncul susulan di VPS.

#### Modul 22 — OTA Update, Provisioning, Fleet, & Dari Breadboard ke Kotak
*Fase 5 · Minggu 27 · Hardware: Kit A (2 ESP32, kotak proyek) + server · Prasyarat: Modul 21, Modul 8*

- **Setelah modul ini Anda bisa:** memperbarui firmware 1 atau 100 perangkat tanpa menyentuhnya, mendaftarkan perangkat baru dalam 1 menit, tahu kesehatan setiap perangkat, dan memindahkan rangkaian dari breadboard ke kotak yang layak dipasang.
- **Konsep inti:** mengapa OTA wajib ("perangkat di atap"); **HTTP OTA** dari server (untuk node WiFi) — partisi ganda & *rollback* otomatis kalau firmware baru gagal (skema partisi dari Modul 9 akhirnya terpakai); **versi firmware** (SemVer) & *manifest*; pola *canary* (update 1 perangkat dulu); **jujur: node ESP-NOW tidak punya jalur HTTP** → di jalur utama tidak di-OTA; **provisioning**: ID unik dari MAC, pendaftaran lewat BLE/captive portal + *claim code*; konfigurasi jarak jauh (interval, ambang) via MQTT *retained*; **device vitals** (RSSI, uptime, heap, alasan reset) → tabel `device_health`; *fleet view* di dashboard; menonaktifkan perangkat hilang; **dari breadboard ke kotak**: perfboard/terminal sekrup, kabel yang tidak kendor, catu daya sendiri, casing, label, foto "sebelum–sesudah".
- **Alat yang dipakai:** library Update/HTTPUpdate ESP32, ArduinoOTA (LAN), Preferences.
- **Opsional / bedah teknis:** OTA node ESP-NOW (perintah "masuk mode update" → sambung WiFi sementara → OTA → kembali); *signed firmware*; solder dasar (video); ESP32 modul WROOM tanpa DevKit.
- **Praktik & proyek mini:** pipeline: build firmware v1.1 → unggah ke server → ESP32 cek versi tiap jam → update sendiri → laporkan sukses; sengaja kirim firmware rusak → rollback; daftarkan ESP32 ketiga (pinjam/Wokwi) dalam 1 menit; node utama pindah ke kotak proyek.
- **➕ Rumah Pintar Mini:** siap dipasang di banyak lokasi.
- **✅ Lulus jika:** ESP32 utama ter-update ke versi baru tanpa kabel, firmware yang sengaja rusak otomatis kembali ke versi lama, dan node utama terpasang rapi di kotak dengan catu daya sendiri.

#### Modul 23 — Keandalan: Monitoring, Backup, Testing, Kerja Tim dengan Git, & CI/CD
*Fase 5 · Minggu 28 · Hardware: server · Prasyarat: Modul 21, Modul 15 (unit test)*

- **Setelah modul ini Anda bisa:** tahu lebih dulu dari pengguna saat ada yang rusak, tidak pernah kehilangan data, bekerja dengan Git seperti di tim sungguhan, dan setiap perubahan kode diuji & dipasang otomatis.
- **Konsep inti:** *observability* ramah awam: log, metrik, alert; **Uptime Kuma** untuk layanan + Grafana alerting untuk data; *healthcheck endpoint*; **backup otomatis** PostgreSQL ke tempat lain (rclone → Google Drive) & **uji restore** ("backup yang belum pernah di-restore = tidak ada backup"); *log rotation*; **testing**: *integration test* API, uji firmware otomatis di Wokwi CI; **Git untuk tim**: *branch*, *pull request*, *code review* (meninjau kode orang lain & menerima tinjauan), `git` di terminal; **GitHub Actions**: lint → test → build image → deploy; **deploy ke VPS lewat SSH, deploy ke Pi secara *pull* (Watchtower / cron `docker compose pull`) karena Pi di rumah tidak bisa "dihubungi" dari GitHub**; *staging* vs *production*; SemVer & `CHANGELOG`; dokumentasi yang bisa diikuti orang lain (README, diagram, *runbook* "kalau X rusak lakukan Y"); **biaya & skala**: perkiraan biaya bulanan, apa yang berubah di 1 vs 100 vs 10.000 perangkat (kapan butuh EMQX cluster, Kafka, dsb. — wawasan).
- **Alat yang dipakai:** Uptime Kuma, rclone, Vitest, GitHub Actions, Watchtower.
- **Opsional / bedah teknis:** Prometheus + exporter; OpenTelemetry; migrasi ke TypeScript penuh.
- **Praktik & proyek mini:** alert Telegram saat API mati; backup harian + restore ke database kosong; 20 test hijau; *pull request* pertama yang di-review (oleh teman, atau oleh diri sendiri dengan *checklist*); `git push` → deploy otomatis ke VPS dan Pi memperbarui dirinya; *runbook* 1 halaman.
- **➕ Rumah Pintar Mini:** v2.0 — tingkat produksi.
- **✅ Lulus jika:** Anda mematikan kontainer API dan menerima alert < 2 menit; *pull request* kecil yang di-*merge* tampil di produksi tanpa Anda SSH.

#### Modul 24 — Capstone: Proyek Akhir, Portofolio, & Langkah Karier ⏳
*Fase 5 · Minggu 29–30 (boleh lebih) · Hardware: pilihan Anda · Prasyarat: semua modul*

- **Setelah modul ini Anda bisa:** membuktikan semua kemampuan dalam satu proyek orisinal yang didokumentasikan seperti produk sungguhan, dan tahu langkah berikutnya.
- **Konsep inti:** memilih proyek (tabel ide + tingkat kesulitan): *smart farming/hidroponik*, *monitoring energi rumah/kos* (PZEM-004T), *cold chain* (suhu kulkas/vaksin), *smart parking*, *kualitas udara* (PM2.5/MQ-135), *pemantauan tandon & pompa*, *pelacak aset GPS* — atau ide sendiri; **dokumen rancangan 1 halaman** (masalah, pengguna, arsitektur, komponen, risiko); jadwal 2 minggu; **standar portofolio**: README dengan foto/video demo, diagram arsitektur, cara menjalankan dalam 5 menit, daftar fitur, keterbatasan jujur; presentasi 5 menit; *code review* mandiri dengan *checklist*; **karier**: peta peran (firmware, backend, fullstack IoT, solution engineer), jenis perusahaan & kisaran gaji di Indonesia, cara membaca lowongan (termasuk kenapa banyak yang minta TypeScript), komunitas, freelance & membuat produk kecil sendiri.
- **Alat yang dipakai:** semua yang sudah dipelajari.
- **Opsional / bedah teknis:** sertifikasi yang relevan; menulis artikel teknis tentang proyek Anda.
- **Praktik & proyek mini:** mengerjakan & mempresentasikan capstone; *peer review* (bila belajar berkelompok); menerbitkan repositori.
- **➕ Rumah Pintar Mini:** menjadi dasar atau "adik" dari capstone Anda.
- **✅ Lulus jika:** repositori capstone Anda bisa dijalankan orang lain hanya dengan membaca README, dan video demo 3 menit menunjukkan alur sensor → dashboard → kendali → notifikasi. 🎓 **Selesai: Fullstack IoT Developer.**

---

## 8. Evaluasi & tanda kelulusan tiap fase

Tidak ada ujian formal — kurikulum ini untuk belajar mandiri — tetapi setiap fase punya **tiga bukti** yang harus ada di repositori Anda sebelum lanjut:

| Fase | Kuis (5 soal/modul) | Proyek checkpoint | Artefak di GitHub |
| :---: | :--- | :--- | :--- |
| 0 | ≥ 4 benar tiap modul | Lampu lalu lintas (C++) + skrip statistik (JS) | Kode + tangkapan layar Wokwi |
| 1 | ≥ 4 benar | Perangkat mandiri 24 jam tanpa restart | Firmware v1.0 + foto rangkaian + video 30 detik |
| 2 | ≥ 4 benar | Sistem 2 node + gateway Pi | Diagram topik MQTT + flow Node-RED (JSON) |
| 3 | ≥ 4 benar | Backend berkunci dengan aturan & Telegram | Koleksi Bruno + skema SQL + hasil uji |
| 4 | ≥ 4 benar | Dashboard dipakai orang lain tanpa dibantu | Video demo HP + tautan Grafana |
| 5 | — | Sistem online + TLS + OTA + CI/CD + capstone | README produk + video demo 3 menit |

Setiap modul juga diakhiri **checklist "Saya bisa…"** yang Anda centang sendiri — jujur pada diri sendiri lebih penting daripada cepat.

---

## 9. Struktur folder repositori

Setiap modul adalah satu folder berisi artikel (`README.md`), gambar (`aset/`), dan kode (`kode/`) agar bisa dibaca langsung di GitHub maupun di-*clone* dan dijalankan.

```
Full-Stack-IoT-Developer/
├── README.md                      ← halaman depan: cara memakai repo ini
├── SILABUS.md                     ← dokumen ini
├── PROGRES.md                     ← checklist 24 modul yang bisa Anda centang
├── aset/                          ← gambar yang dipakai lintas modul
├── fase-0-fondasi/
│   ├── modul-01-peta-besar-iot/
│   │   ├── README.md              ← artikel modul
│   │   ├── aset/                  ← gambar modul ini (+ SUMBER.md untuk atribusi)
│   │   └── kode/                  ← sketsa Arduino / proyek Wokwi / skrip JS
│   ├── modul-02-listrik-dan-unggah-pertama/
│   ├── modul-03-cpp-untuk-esp32/
│   └── modul-04-javascript-nodejs/
├── fase-1-esp32-embedded/         ← modul 05–08
├── fase-2-konektivitas/           ← modul 09–12
├── fase-3-backend-data/           ← modul 13–16
├── fase-4-frontend-dashboard/     ← modul 17–20
├── fase-5-operasi-skala/          ← modul 21–24
├── proyek-rumah-pintar-mini/      ← kode proyek benang merah, versi terbaru
│   ├── firmware/
│   ├── gateway/
│   ├── backend/
│   ├── frontend/
│   └── docker-compose.yml
└── _arsip-lama/                   ← kurikulum versi sebelumnya (tidak perlu dibaca)
```

**Aturan gambar di seluruh materi** (sesuai permintaan): gambar dari internet hanya dipakai jika lisensinya mengizinkan (CC0, CC BY, CC BY-SA, dokumentasi resmi produsen) dan **selalu** disertai keterangan *"Sumber: … , lisensi …"* tepat di bawah gambar plus rekap di `aset/SUMBER.md`; gambar buatan sendiri (diagram SVG/PNG, foto rangkaian) diberi label jelas dan hanya dibuat jika benar-benar memperjelas paragraf tempat ia berada; tidak ada gambar hiasan.

---

## 10. Setelah "expert": peta jalan lanjutan

Setelah 24 modul, Anda sudah bisa bekerja sebagai Fullstack IoT Developer. Jika ingin **spesialisasi**, inilah cabang yang masuk akal — masing-masing bisa menjadi kurikulum lanjutan tersendiri:

| Arah | Topik kunci | Cocok jika Anda suka… |
| :--- | :--- | :--- |
| **TypeScript & arsitektur backend** | TypeScript penuh, *clean architecture*, *message queue*, multi-tenant | Kode yang rapi & tim besar |
| **Firmware profesional** | ESP-IDF murni, FreeRTOS mendalam, *secure boot*, *flash encryption*, *unit test* firmware, Zephyr RTOS | Mengutak-atik chip & efisiensi |
| **Desain hardware** | KiCad (skematik & PCB), DFM, *power budgeting*, baterai & *energy harvesting*, EMC | Membuat produk fisik sendiri |
| **Wireless & industri** | LoRaWAN + ChirpStack, Zigbee/Thread + Matter, Modbus RTU/TCP, CAN bus, OPC-UA, Sparkplug B | Pabrik, pertanian skala besar, otomotif |
| **Edge AI / TinyML** | Edge Impulse, TensorFlow Lite Micro, deteksi anomali getaran/suara, kamera ESP32-CAM | Membuat perangkat "pintar" sungguhan |
| **Aplikasi HP native** | React Native / Flutter, notifikasi push, BLE dari HP | Produk konsumen |
| **Cloud & skala besar** | AWS IoT Core / Azure IoT Hub, EMQX cluster, Kafka, Kubernetes, *data lake* | Jutaan perangkat & tim besar |
| **Keamanan & kepatuhan** | *Pen-testing* perangkat, SBOM, EU Cyber Resilience Act, NIST IR 8259, PSTI | Produk yang dijual ke pasar global |

---

## 11. Catatan untuk peninjau

Hal-hal yang **mudah diubah sekarang** (sebelum materi ditulis) dan saya ingin konfirmasi:

1. **Proyek benang merah "Rumah Pintar Mini"** — cocok? Alternatif: "Kebun Pintar" (lebih ke pertanian), "Monitoring Kos" (energi & keamanan), atau campuran. Nama bisa diganti kapan saja.
2. **Estimasi jujur ±30 minggu** (bukan 24) untuk jalur lengkap, karena 6 modul ditandai ⏳ (2 minggu). Alternatifnya: memecah modul ⏳ menjadi 30 modul × 1 minggu. Mana yang lebih Anda sukai?
3. **Modul 4 (JavaScript dari nol)** ditaruh di Fase 0 agar pembaca langsung kenal dua bahasa yang akan dipakai; Fase 3 dibuka dengan "pemanasan ulang" 1 jam. Alternatif: dipindah ke awal Fase 3 supaya Fase 0–2 murni hardware.
4. **Modul 20 (Grafana, peta, laporan)** bisa dianggap "bonus". Jika ingin lebih ramping, modul ini bisa dilebur ke Modul 18 & 23, dan slotnya dipakai untuk modul "Dari breadboard ke kotak + solder dasar" (sekarang menumpang di Modul 22).
5. **VPS berbayar + domain di Modul 21** (±Rp 50–100 rb/bulan + Rp 15–200 rb/tahun) — materi selalu menyediakan jalur gratis (Pi + Cloudflare Tunnel) dengan keterbatasan yang dijelaskan jujur. Setuju dijadikan "sangat disarankan, tidak wajib"?
6. **TypeScript** dikenalkan bertahap (JSDoc + `@ts-check` sebagai opsional sejak Modul 4/13/17, TypeScript penuh di peta jalan). Cukup, atau ingin TypeScript menjadi jalur utama sejak Modul 13?
7. **Target panjang artikel per modul**: 2.500–4.500 kata + 6–12 gambar + kode lengkap (modul ⏳ bisa 2× lipat atau dipecah menjadi dua artikel). Cukup, atau ingin lebih ringkas/lebih dalam?

Setelah silabus ini disetujui, penulisan dimulai dari **Modul 1** dan berjalan berurutan, satu modul per iterasi, masing-masing langsung di-*push* ke GitHub.

---

## 12. Glosarium mini: istilah yang muncul di silabus ini

Satu kalimat per istilah, bahasa manusia. Semua akan dibahas tuntas di modulnya.

| Istilah | Artinya |
| :--- | :--- |
| **Mikrokontroler / ESP32** | Chip "otak kecil" yang hanya menjalankan satu program, murah, dan punya WiFi. |
| **Firmware** | Program yang ditanam di dalam chip. |
| **GPIO / pin** | Kaki-kaki logam di board tempat kabel sensor & lampu dicolokkan. |
| **Breadboard** | Papan berlubang untuk merangkai tanpa solder. |
| **Sensor / aktuator** | Yang merasakan (suhu, cahaya) / yang menggerakkan (relay, motor). |
| **Relay** | Saklar yang dikendalikan listrik kecil untuk menyalakan beban yang lebih besar. |
| **I2C, SPI, 1-Wire** | Tiga "bahasa kabel" agar beberapa sensor bisa berbagi kabel yang sama. |
| **Wokwi** | Simulator ESP32 di browser — belajar tanpa membeli apa pun. |
| **Simulator vs hardware asli** | Yang satu di layar, yang satu di meja; keduanya menjalankan kode yang sama. |
| **Terminal / command line** | Jendela hitam tempat mengetik perintah ke komputer; menakutkan di awal, biasa setelah seminggu. |
| **Git / GitHub / commit / push** | Cara menyimpan "foto" setiap kemajuan kode dan mengunggahnya ke internet. |
| **JSON** | Format teks universal untuk mengirim data, misalnya `{ "suhu": 28.5 }`. |
| **HTTP / API / REST** | Cara program saling "surat-menyurat" lewat internet; API = daftar pesanan yang bisa diminta ke server. |
| **MQTT / broker / topic / publish / subscribe** | Sistem "kantor pos" untuk IoT: perangkat mengirim ke nama grup (topic), siapa pun yang berlangganan grup itu menerima. |
| **QoS** | Tingkat jaminan pesan sampai (surat biasa / tercatat / kurir tanda tangan). |
| **Gateway / edge** | Komputer kecil di lokasi (Raspberry Pi) yang mengumpulkan data sebelum dikirim ke pusat. |
| **Raspberry Pi / Linux / SSH** | Komputer mungil; sistem operasinya; cara mengendalikannya dari jauh lewat terminal. |
| **Node-RED** | Alat *drag-and-drop* untuk menyambung data & membuat dashboard tanpa koding. |
| **Backend / server** | Program di "kantor pusat" yang menerima, menyimpan, memutuskan. |
| **Frontend / dashboard** | Tampilan yang dilihat manusia di browser/HP. |
| **Node.js / JavaScript** | Bahasa untuk backend dan frontend; Node.js menjalankannya di luar browser. |
| **Database / SQL / PostgreSQL / TimescaleDB** | Gudang arsip data; bahasa bertanya ke gudang itu; produk yang kita pakai; tambahan khusus data berurutan waktu. |
| **Realtime / WebSocket** | Angka berubah sendiri tanpa menekan *refresh*. |
| **Rules engine** | Daftar aturan "jika … maka …" yang bisa diubah tanpa mengubah kode. |
| **Autentikasi / JWT / API key** | Cara memastikan siapa yang masuk (manusia pakai login, perangkat pakai kunci rahasia). |
| **TLS / HTTPS / sertifikat** | "Amplop tersegel" untuk data di internet; gembok hijau di browser. |
| **Docker / container / compose** | Cara membungkus program beserta semua kebutuhannya agar jalan sama di mana saja; compose = menjalankan beberapa sekaligus. |
| **Deploy / VPS / domain / DNS** | Memasang ke server; server sewaan di internet; nama alamat; buku telepon internet. |
| **OTA** | Memperbarui firmware lewat udara (WiFi), tanpa kabel. |
| **Provisioning / fleet** | Mendaftarkan perangkat baru; mengelola banyak perangkat sekaligus. |
| **Monitoring / alert / backup** | Mengawasi sistem; diberi tahu saat rusak; salinan data untuk jaga-jaga. |
| **CI/CD / GitHub Actions** | Robot yang otomatis menguji dan memasang kode setiap kali Anda menyimpan perubahan. |
| **PWA** | Situs web yang bisa "di-install" di HP seperti aplikasi. |
| **Capstone** | Proyek akhir yang membuktikan semua kemampuan. |

---

## 13. Riwayat revisi

**v0.2 (9 Okt 2026)** — hasil audit mandiri + tinjauan independen (persona *senior IoT engineer* dan *pemula total*):

- **Urutan diperbaiki:** TLS/HTTPS dan PWA dipindah dari Modul 16/19 ke Modul 21 (keduanya butuh domain publik & HTTPS yang baru ada di sana); *store-and-forward* dan Mosquitto *bridge* Pi→VPS didefinisikan di Modul 21 (uji "internet putus" di Modul 12 diganti uji "router mati"); PostgreSQL di Modul 14 diinstal dengan installer biasa (Docker baru di Modul 21); HTML di Modul 9 disederhanakan menjadi tautan `/on` `/off` karena HTML baru diajarkan di Modul 17; aplikasi diinstal *just-in-time* (Modul 1 hanya Wokwi + GitHub web; Arduino IDE di Modul 2; GitHub Desktop di Modul 3; VS Code + Node.js + terminal di Modul 4).
- **Keamanan listrik:** level logika 3,3 V vs 5 V ditambahkan ke Modul 2/5/6 (ECHO HC-SR04, relay *low-level trigger*, contoh soal diganti 3,3 V); batasan "tanpa 220 V" dinyatakan sejak §2.
- **Jebakan teknis yang kini disebut eksplisit:** pin ADC1 wajib sejak Modul 5 (ADC2 mati saat WiFi), skema partisi OTA sejak Modul 9, channel ESP-NOW = channel router, PubSubClient hanya QoS 0 + `setBufferSize`, Mosquitto 2.x default *localhost* + firewall Windows, mDNS tidak jalan di Android (IP tetap jadi jalur utama), DevKit V1 boros saat *deep sleep* (±10 mA), node ESP-NOW tidak di-OTA di jalur utama, Cloudflare Tunnel tidak meneruskan MQTT, deploy ke Pi secara *pull* (Watchtower), Recharts tanpa gauge (RadialBarChart).
- **Daftar belanja dilengkapi** (microSD + modul, kipas DC, 18650 + TP4056, transistor + dioda, kapasitor, resistor 4,7 kΩ, card reader, USB power meter, kotak proyek), dibagi 2 tahap, diberi kolom "pertama dipakai", kata kunci pencarian, dan peringatan board yang salah beli; biaya domain & VPS ditambahkan (§5.5).
- **Ramah awam:** §1 ditulis ulang dengan istilah teknis dalam kurung + pernyataan jujur "dua bahasa"; §4.4 aturan 2 jam & ke mana bertanya; §5.0 prasyarat lingkungan (laptop, WiFi 2,4 GHz, tanpa halaman login); §5.4 tabel apa yang bisa/tidak di Wokwi (klaim "100 %" → "±90 %"); tiap modul dipecah menjadi **Konsep inti / Alat yang dipakai / Opsional**; satu pilihan utama per kebutuhan (Fastify, PubSubClient, Zustand, bcrypt, Bruno, Pi 4, DHT22); kuis disamakan 5 soal; kriteria lulus alternatif untuk jalur tanpa Pi; §12 glosarium mini.
- **Kesiapan kerja:** TypeScript bertahap (JSDoc/`@ts-check`), Git untuk tim (*branch*, *pull request*, *code review*) di Modul 23, "dari breadboard ke kotak" di Modul 22, *interrupt* & metode debugging di Modul 8, unit test pertama di Modul 15, catu daya tanpa laptop di Modul 8.
- **Estimasi waktu dijujurkan:** 24 modul tetap, 6 modul bertanda ⏳ (2 minggu) → ±30 minggu jalur lengkap.

**v0.1 (9 Okt 2026)** — draf pertama.
