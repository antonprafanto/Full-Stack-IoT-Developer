# 🎓 Silabus — Fullstack IoT Developer: Zero to Expert

> **Kurikulum 24 modul (±6 bulan) untuk orang awam total hingga mampu membangun sistem IoT lengkap dari sensor sampai dashboard.**
> Hardware: **ESP32 + Raspberry Pi** · Software: **JavaScript end-to-end (Node.js + React)** · Bahasa pengantar: **Indonesia, ramah awam**.
>
> Status dokumen: **Draf v0.1 — menunggu tinjauan** (9 Oktober 2026). Bagian yang masih bisa diubah ditandai di [§11](#11-catatan-untuk-peninjau).

---

## Daftar Isi

1. [Untuk siapa kurikulum ini & apa hasil akhirnya](#1-untuk-siapa-kurikulum-ini--apa-hasil-akhirnya)
2. [Gambaran besar: apa yang akan kita bangun](#2-gambaran-besar-apa-yang-akan-kita-bangun)
3. [Pilihan teknologi & alasannya](#3-pilihan-teknologi--alasannya)
4. [Cara belajar di kurikulum ini](#4-cara-belajar-di-kurikulum-ini)
5. [Peralatan & perkiraan biaya](#5-peralatan--perkiraan-biaya)
6. [Peta kurikulum (ringkasan 6 fase)](#6-peta-kurikulum-ringkasan-6-fase)
7. [Rincian 24 modul](#7-rincian-24-modul)
8. [Evaluasi & tanda kelulusan tiap fase](#8-evaluasi--tanda-kelulusan-tiap-fase)
9. [Struktur folder repositori](#9-struktur-folder-repositori)
10. [Setelah "expert": peta jalan lanjutan](#10-setelah-expert-peta-jalan-lanjutan)
11. [Catatan untuk peninjau](#11-catatan-untuk-peninjau)

---

## 1. Untuk siapa kurikulum ini & apa hasil akhirnya

**Kurikulum ini ditulis untuk orang yang belum pernah menyentuh kabel, breadboard, atau menulis satu baris kode pun.** Kalau Anda bisa memakai laptop, menginstal aplikasi, dan punya rasa penasaran, itu sudah cukup sebagai modal awal. Tidak ada prasyarat matematika di luar perkalian dan pembagian.

Istilah *Fullstack IoT Developer* sendiri artinya sederhana: orang yang bisa membuat **seluruh rantai** sebuah produk IoT — dari **perangkat fisik** yang membaca sensor, **jaringan** yang mengirim datanya, **server** yang menyimpan dan mengolahnya, sampai **tampilan** yang dilihat pengguna di HP atau laptop. Kebanyakan kursus hanya mengajarkan satu potong rantai itu. Kurikulum ini mengajarkan semuanya, berurutan, dengan satu proyek yang tumbuh dari modul ke modul.

### Setelah menyelesaikan 24 modul, Anda akan mampu:

1. Merangkai sensor dan aktuator (lampu, relay, motor servo) ke ESP32 dengan aman, tanpa takut korslet.
2. Menulis firmware ESP32 yang rapi dan tangguh: membaca banyak sensor, hemat daya, tidak "hang", bisa di-update dari jarak jauh (OTA).
3. Menghubungkan perangkat ke internet lewat WiFi dan berbicara dengan protokol standar industri IoT: **MQTT** dan **HTTP**.
4. Menyiapkan Raspberry Pi sebagai *gateway* lokal yang tetap bekerja saat internet putus.
5. Membangun backend Node.js: API, pemrosesan data realtime, aturan otomatis ("jika suhu > 30 °C nyalakan kipas"), notifikasi Telegram.
6. Merancang database PostgreSQL + TimescaleDB untuk menyimpan jutaan baris data sensor dan menjawab pertanyaan seperti "rata-rata suhu per jam minggu lalu".
7. Membuat dashboard web React yang realtime, bisa dibuka di HP, dengan grafik, tombol kendali, dan login.
8. Mem-*deploy* semuanya dengan Docker ke Raspberry Pi maupun VPS cloud, lengkap dengan domain, HTTPS, monitoring, backup, dan CI/CD.
9. Mengamankan sistem: autentikasi pengguna, API key perangkat, TLS, dan kebiasaan "jangan pernah hardcode password".
10. Menyelesaikan satu **proyek akhir (capstone)** layak portofolio yang bisa Anda tunjukkan ke pemberi kerja atau klien.

### Yang sengaja *tidak* dicakup (agar pemula tidak kewalahan)

Desain PCB profesional, protokol industri (CAN bus, OPC-UA), TinyML/Edge AI mendalam, Matter/Thread, LoRaWAN secara praktik, dan regulasi/sertifikasi produk. Semua itu disinggung sebagai **wawasan** di modul terkait dan dirangkum menjadi peta jalan di [§10](#10-setelah-expert-peta-jalan-lanjutan). Prinsipnya: lebih baik benar-benar menguasai satu rantai lengkap daripada mengenal 30 teknologi setengah-setengah.

---

## 2. Gambaran besar: apa yang akan kita bangun

Sepanjang kurikulum, kita membangun **satu proyek benang merah bernama "Rumah Pintar Mini"**: sebuah sistem yang memantau suhu, kelembapan, cahaya, dan kelembapan tanah, lalu mengendalikan lampu, kipas, dan pompa — mula-mula lewat tombol fisik, lalu lewat WiFi, lalu lewat dashboard di HP, dan akhirnya otomatis berdasarkan aturan. Proyek ini sengaja dipilih karena komponennya murah, hasilnya terlihat langsung, dan polanya sama persis dengan sistem IoT komersial (*smart farming*, pemantauan gudang, *smart building*).

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

Setiap modul menambahkan satu "organ" ke proyek ini. Di akhir Modul 8 Anda punya perangkat mandiri yang bekerja tanpa internet; akhir Modul 12 perangkat itu "bicara" lewat MQTT; akhir Modul 16 ada server yang mengingat semuanya; akhir Modul 20 ada dashboard di HP; akhir Modul 24 semuanya sudah online di internet dan Anda punya proyek capstone sendiri.

---

## 3. Pilihan teknologi & alasannya

Semua pilihan di bawah ini **gratis / open-source**, populer di industri, dan punya komunitas Indonesia yang besar sehingga mudah mencari bantuan.

| Lapisan | Teknologi | Kenapa ini, bukan yang lain? |
| :--- | :--- | :--- |
| Mikrokontroler | **ESP32** (DevKit V1 / WROOM-32) | Rp 45–80 ribu sudah termasuk WiFi + Bluetooth. Dokumentasi dan contoh paling melimpah. Arduino Uno tidak punya WiFi; harus beli modul tambahan. |
| Bahasa firmware | **C++ (Arduino framework)**, core arduino-esp32 3.x | Satu-satunya pilihan yang ramah pemula sekaligus dipakai industri. *(JavaScript tidak praktis untuk firmware — ini satu-satunya lapisan yang bukan JS, dan Modul 3 akan memastikan Anda nyaman dengannya.)* |
| Simulator | **Wokwi** (browser) | Modul 1–8 bisa dicoba **100 % tanpa hardware**; cocok untuk belajar sebelum kit datang atau saat bepergian. |
| Gateway | **Raspberry Pi 4/5** + Raspberry Pi OS (Debian 13 "Trixie") | Komputer Linux mungil berdaya rendah. Di awal, laptop Anda bisa menggantikannya. |
| Broker pesan | **MQTT — Eclipse Mosquitto** | Protokol standar de facto IoT. Ringan, bisa jalan di Pi, dipahami semua platform cloud. |
| Low-code | **Node-RED** | Dashboard & otomasi dengan *drag-and-drop*, memberi "kemenangan cepat" sebelum menulis backend sendiri. Berbasis Node.js, jadi tetap satu keluarga. |
| Backend | **Node.js 24 LTS** + **Fastify** (atau Express) | Satu bahasa (JavaScript) untuk backend dan frontend; kurva belajar paling landai untuk pemula fullstack. |
| Database | **PostgreSQL** + ekstensi **TimescaleDB** | Belajar SQL yang berlaku di mana-mana, plus kemampuan khusus data deret waktu (ribuan data sensor per menit) tanpa belajar database baru. |
| Realtime | **WebSocket (Socket.IO)** | Angka di dashboard berubah tanpa *refresh*. |
| Frontend | **React 19 + Vite + Tailwind CSS** | Framework UI paling banyak lowongannya. Next.js 16 dikenalkan sebagai opsi di Fase 4. |
| Grafik & visual | **Recharts**, **Grafana** | Recharts untuk dashboard buatan sendiri; Grafana untuk dashboard profesional tanpa koding. |
| Deploy | **Docker + Docker Compose**, **Caddy** (HTTPS otomatis), **Cloudflare Tunnel** | Satu perintah untuk menjalankan semua layanan, di Pi maupun VPS. |
| Notifikasi | **Telegram Bot API** | Gratis, tanpa verifikasi bisnis, 10 menit jadi. |
| Versi & CI/CD | **Git + GitHub + GitHub Actions** | Portofolio Anda adalah repositori GitHub ini sendiri. |

---

## 4. Cara belajar di kurikulum ini

### 4.1 Anatomi setiap modul (selalu sama, supaya Anda hafal ritmenya)

Setiap modul adalah satu artikel panjang (≈ 1 minggu belajar santai, 6–10 jam) dengan urutan tetap:

1. **🎯 Apa yang akan Anda bisa setelah modul ini** — 3–5 kalimat konkret.
2. **🏆 Kemenangan Cepat (10 menit pertama)** — langsung praktik, lihat hasil nyata (lampu menyala, angka muncul), *baru* teori.
3. **🧠 Teori "Mengapa"** — dijelaskan dengan analogi dunia nyata, satu konsep per bagian, istilah asing selalu diterjemahkan saat pertama muncul.
4. **🔧 Praktik Langkah-demi-Langkah** — instruksi mikro 1-2-3, setiap baris kode diberi komentar bahasa manusia, diagram rangkaian fisik (bukan hanya skematik simbol).
5. **🚨 Kotak "Kalau Tidak Jalan?"** — daftar error paling umum di tahap itu dan solusinya.
6. **🔬 Bedah Teknis Mendalam (opsional, bisa dilipat)** — untuk yang ingin tahu "di balik layar".
7. **🧩 Tantangan Mandiri** — 3 tingkat: ubah sedikit → isi bagian rumpang → buat sendiri dari nol.
8. **➕ Tambahan ke "Rumah Pintar Mini"** — apa yang modul ini sumbangkan ke proyek benang merah.
9. **📖 Glosarium & 📝 Kuis singkat** (5 soal) + **✅ Checklist kelulusan modul**.
10. **📚 Sumber & atribusi gambar** — setiap gambar yang diambil dari internet dicantumkan sumber dan lisensinya.

### 4.2 Prinsip penulisan materi (janji penulis kepada pembaca)

- **Analogi dulu, istilah belakangan.** Tegangan = tekanan air di tandon; MQTT = kantor pos; API = pelayan restoran yang membawa pesanan ke dapur.
- **Jelaskan *mengapa*, bukan hanya *bagaimana*.** "Pakai resistor 220 Ω" selalu diikuti "karena tanpa itu LED terbakar dalam sepersekian detik, begini hitungannya."
- **Tidak ada lompatan gaib.** Tidak pernah berasumsi Anda sudah tahu cara membuka terminal, menekan tombol BOOT, atau apa itu `npm`.
- **Aman secara emosional.** Listrik 3,3 V / 5 V dari USB **aman disentuh**; laptop punya pengaman arus; error adalah bagian normal dari belajar, bukan tanda Anda tidak berbakat.
- **Satu konsep baru per halaman.** Kalau ada dua konsep, salah satunya ditunda ke modul berikutnya.
- **Praktik → Teori → Eksperimen (metode "sandwich").** Coba dulu, baru dibedah, lalu ubah-ubah sendiri.
- **Bantuan bertahap (*faded scaffolding*).** Kode lengkap → kode rumpang → kerangka kosong → tantangan tanpa contekan.
- **Visual yang jujur.** Gambar hanya dipakai jika benar-benar memperjelas bagian yang sedang dibahas; gambar dari internet selalu disertai sumber & lisensi; gambar buatan sendiri dibuat sederhana dan berlabel.

### 4.3 Dua jalur belajar

| Jalur | Untuk siapa | Durasi | Cara |
| :--- | :--- | :--- | :--- |
| **Lengkap** | Awam total | 24 minggu (±6 bulan) @ 6–10 jam/minggu | Ikuti Modul 1 → 24 berurutan. |
| **Cepat** | Sudah bisa salah satu bahasa pemrograman | 18–20 minggu | Baca cepat Modul 3 & 4 (cukup kerjakan kuisnya), sisanya tetap berurutan. |

> Bagaimana jika hanya 3–4 jam seminggu? Tidak masalah — kurikulum ini tidak kedaluwarsa. Selesaikan dalam setahun pun hasilnya sama.

---

## 5. Peralatan & perkiraan biaya

### 5.1 Perangkat lunak (semua gratis)

| Kebutuhan | Alat | Dipakai mulai |
| :--- | :--- | :--- |
| Menulis & mengunggah firmware | Arduino IDE 2.x (+ opsional PlatformIO di VS Code) | Modul 1 |
| Simulasi tanpa hardware | Wokwi (browser) | Modul 1 |
| Editor kode umum | Visual Studio Code | Modul 1 |
| Menjalankan JavaScript | Node.js 24 LTS | Modul 4 |
| Melihat lalu lintas MQTT | MQTT Explorer | Modul 10 |
| Menulis gambar ke microSD | Raspberry Pi Imager | Modul 11 |
| Database | PostgreSQL 17 + TimescaleDB, DBeaver (GUI) | Modul 14 |
| Kontainer | Docker Desktop (laptop) / Docker Engine (Pi, VPS) | Modul 21 |
| Versi kode | Git + akun GitHub | Modul 1 |

### 5.2 Kit A — ESP32 & elektronika dasar (dibutuhkan mulai Modul 2, dipakai sampai akhir)

Perkiraan harga marketplace Indonesia, Oktober 2026. **Harga bisa berubah**; di materi akan ada tips memilih penjual dan barang KW yang perlu dihindari.

| Komponen | Jumlah | Perkiraan harga | Catatan |
| :--- | :---: | ---: | :--- |
| ESP32 DevKit V1 (30 pin, chip CP2102/CH340) | 1 (idealnya 2) | Rp 45–80 rb | Node kedua dipakai di Modul 12 (ESP-NOW). |
| Kabel micro-USB **data** (bukan hanya cas) | 1 | Rp 10–20 rb | Penyebab #1 "board tidak terdeteksi". |
| Breadboard 830 titik | 1 | Rp 15–30 rb | |
| Kabel jumper (M-M, M-F, F-F) | 1 set | Rp 10–25 rb | |
| LED 5 mm aneka warna + resistor pack (220 Ω, 1 kΩ, 10 kΩ) | 1 set | Rp 10–20 rb | |
| Push button, potensiometer 10 kΩ, buzzer | masing-masing 2 | Rp 10–15 rb | |
| Sensor suhu & kelembapan **DHT22** (atau DHT11 yang lebih murah) | 1 | Rp 25–50 rb | |
| LDR (sensor cahaya) | 2 | Rp 3–5 rb | |
| Sensor kelembapan tanah kapasitif | 1 | Rp 10–20 rb | Pilih *capacitive*, bukan yang berkarat. |
| Sensor jarak ultrasonik HC-SR04 | 1 | Rp 10–20 rb | |
| Sensor gerak PIR HC-SR501 | 1 | Rp 10–20 rb | |
| Modul relay 1–2 channel 5 V (opto) | 1 | Rp 8–20 rb | Kendali lampu/kipas/pompa. |
| Motor servo SG90 | 1 | Rp 15–25 rb | |
| Layar OLED 0,96" SSD1306 (I2C) | 1 | Rp 25–45 rb | |
| Sensor BME280 / BMP280 (I2C) | 1 | Rp 20–50 rb | Latihan protokol I2C. |
| Sensor suhu DS18B20 tahan air | 1 | Rp 15–30 rb | Latihan protokol 1-Wire. |
| Pompa mini 3–5 V + selang (opsional) | 1 | Rp 15–30 rb | Untuk "siram tanaman otomatis". |
| Multimeter digital sederhana | 1 | Rp 50–100 rb | Investasi seumur hidup. |
| **Total Kit A** | | **≈ Rp 350–600 rb** | Kit "ESP32 starter" paketan sering lebih murah. |

### 5.3 Kit B — Raspberry Pi sebagai gateway (dibutuhkan mulai Modul 11)

| Komponen | Perkiraan harga | Catatan |
| :--- | ---: | :--- |
| Raspberry Pi 4 Model B 4 GB **atau** Raspberry Pi 5 4 GB | Rp 900 rb – 1,8 jt | Pi 4 sudah lebih dari cukup; Pi 5 lebih kencang untuk database. |
| microSD 32 GB kelas A1/A2 | Rp 60–100 rb | |
| Adaptor daya resmi (USB-C 5 V 3 A untuk Pi 4; 5 V 5 A untuk Pi 5) | Rp 100–250 rb | Adaptor HP sering kurang kuat → Pi restart sendiri. |
| Casing + heatsink/kipas | Rp 50–150 rb | |
| **Total Kit B** | **≈ Rp 1,2 – 2,3 jt** | |

**Alternatif hemat:** sampai Modul 20, laptop/PC lama Anda bisa menjalankan semua peran Pi (Mosquitto, Node-RED, database). Raspberry Pi Zero 2 W (Rp 350–500 rb) juga cukup untuk broker + Node-RED, meski berat untuk database. Materi akan selalu menyediakan jalur "tanpa Pi".

> **Ringkasan biaya:** bisa mulai dengan **Rp 0** (Wokwi) untuk Modul 1–8, **±Rp 500 rb** untuk pengalaman hardware nyata, dan **±Rp 2 jt** total jika ingin gateway Raspberry Pi sungguhan.

---

## 6. Peta kurikulum (ringkasan 6 fase)

| Fase | Nama | Modul | Minggu | Hasil nyata di akhir fase |
| :---: | :--- | :---: | :---: | :--- |
| **0** | Fondasi: listrik, kode, & peralatan | 1–4 | 1–4 | LED berkedip di Wokwi & di meja Anda; nyaman menulis C++ dan JavaScript sederhana. |
| **1** | ESP32 Embedded: sensor & aktuator | 5–8 | 5–8 | Perangkat "Rumah Pintar Mini" mandiri: membaca 5 sensor, kendali relay/servo, layar OLED, firmware tangguh. |
| **2** | Konektivitas: WiFi, MQTT, & gateway Pi | 9–12 | 9–12 | Perangkat terhubung ke broker MQTT di Raspberry Pi, dashboard Node-RED, node kedua via ESP-NOW. |
| **3** | Backend & data: Node.js + PostgreSQL | 13–16 | 13–16 | Server menyimpan riwayat, menjalankan aturan otomatis, kirim Telegram, punya login & API key. |
| **4** | Frontend: dashboard React realtime | 17–20 | 17–20 | Dashboard di HP: grafik live, tombol kendali, riwayat, Grafana, peta. |
| **5** | Operasi & skala: deploy, OTA, CI/CD, capstone | 21–24 | 21–24 | Semua online dengan domain + HTTPS, OTA, monitoring, backup, dan proyek akhir portofolio. |

---

## 7. Rincian 24 modul

Format tiap modul: **Tujuan** (apa yang Anda bisa setelahnya) · **Topik** · **Praktik & proyek mini** · **➕ Rumah Pintar Mini** (sumbangan ke proyek benang merah) · **✅ Lulus jika** (bukti konkret).

---

### 🟧 FASE 0 — FONDASI: LISTRIK, KODE, & PERALATAN (Modul 1–4)

> Tujuan fase: menghilangkan rasa takut. Di akhir fase ini Anda sudah "berbicara" dengan chip lewat kode, memahami kenapa listrik USB aman, dan punya alat kerja lengkap.

#### Modul 1 — Peta Besar IoT & Kemenangan Pertama dalam 10 Menit
*Fase 0 · Minggu 1 · Hardware: tidak perlu (Wokwi)*

- **Tujuan:** memahami apa itu IoT dan "fullstack" dengan bahasa sehari-hari; mengenali kelima lapisan sistem; membuat LED berkedip di simulator sebelum tahu teori apa pun; menyiapkan semua alat kerja.
- **Topik:** contoh IoT di sekitar kita (meteran listrik pintar, GoFood driver tracking, sensor banjir); komputer vs mikrokontroler ("otak kecil yang hanya menjalankan satu program"); alur kode → kompiler → chip; tur singkat lapisan 1–5; instalasi Arduino IDE 2, VS Code, Git, Node.js; membuat akun GitHub & Wokwi; aturan keselamatan dasar.
- **Praktik:** Blink pertama di Wokwi (tanpa akun) → ubah kecepatan kedip → tambah LED kedua; membuat repositori GitHub pribadi `belajar-iot` dan commit pertama.
- **➕ Rumah Pintar Mini:** halaman "visi proyek" di README pribadi Anda.
- **✅ Lulus jika:** LED di Wokwi berkedip dengan pola yang Anda rancang sendiri, dan tangkapan layarnya ada di repositori GitHub Anda.

#### Modul 2 — Listrik Ramah Awam: Tegangan, Arus, Breadboard, & Anti-Korslet
*Fase 0 · Minggu 2 · Hardware: Kit A (bisa Wokwi dulu)*

- **Tujuan:** memahami tegangan/arus/hambatan lewat analogi tandon air; menghitung resistor LED dengan Hukum Ohm; membaca breadboard & polaritas komponen; memakai multimeter; tahu persis mengapa 5 V USB aman tapi 220 V PLN tidak.
- **Topik:** V–I–R dan daya; Hukum Ohm (satu rumus saja); DC vs AC; anatomi breadboard (jalur dalam yang tak terlihat); kaki LED panjang-pendek, kode warna resistor, polaritas kapasitor & dioda; kabel jumper; *common ground* ("semua harus sepakat titik nol-nya"); mengukur dengan multimeter; apa itu korslet dan apa yang terjadi saat terjadi.
- **Praktik:** LED + resistor 220 Ω di breadboard (lalu coba 10 kΩ → redup, mengapa?); mengukur tegangan baterai & resistor; LED dari pin GPIO ESP32; sengaja "merusak" rangkaian di Wokwi untuk melihat peringatan.
- **➕ Rumah Pintar Mini:** rangkaian LED indikator status yang akan terus dipakai.
- **✅ Lulus jika:** Anda bisa menjelaskan ke teman kenapa LED butuh resistor *dan* menghitung nilainya untuk LED biru 3 V pada sumber 5 V.

#### Modul 3 — Pemrograman C++ untuk ESP32 dari Nol
*Fase 0 · Minggu 3 · Hardware: tidak perlu (Wokwi)*

- **Tujuan:** menulis program C++ sederhana untuk ESP32 tanpa mencontek; membaca pesan error kompiler tanpa panik.
- **Topik:** `setup()` vs `loop()` ("ritual pagi" vs "rutinitas seharian"); variabel & tipe data (`int`, `float`, `bool`, `String`); operator; `if/else`; `for/while`; fungsi dengan parameter & nilai balik; array; `struct` (mengelompokkan data sensor); `#define` & `const`; Serial Monitor sebagai "jendela ke otak chip"; komentar; gaya penulisan rapi; apa itu library dan cara memasangnya; **tanpa pointer dulu** (disentuh seperlunya di Modul 8).
- **Praktik:** kalkulator Serial; pola kedip morse nama Anda; fungsi `nyalakanLED(berapaKali)`; array suhu dummy → hitung rata-rata; struct `BacaanSensor`.
- **➕ Rumah Pintar Mini:** kerangka program dengan fungsi-fungsi terpisah yang akan diisi di Fase 1.
- **✅ Lulus jika:** kuis 10 soal ≥ 8 benar dan program "lampu lalu lintas 3 LED" jalan dari kode yang Anda tulis sendiri.

#### Modul 4 — JavaScript & Node.js dari Nol (Bahasa untuk Server & Dashboard)
*Fase 0 · Minggu 4 · Hardware: tidak perlu*

- **Tujuan:** nyaman menulis JavaScript modern di Node.js; memahami konsep *asynchronous* (menunggu tanpa membeku) yang menjadi inti semua kode IoT di sisi server.
- **Topik:** menjalankan file `.js`; `let/const`; string, angka, boolean; array & objek (`{ suhu: 28.5 }`) dan JSON ("format surat universal"); fungsi & *arrow function*; `if`, perulangan, `map/filter`; **async/await & Promise** dengan analogi memesan makanan; `npm` & `package.json`; membaca/menulis file; modul `import/export`; `console.log` sebagai alat debug; perbedaan JS dengan C++ yang baru dipelajari (tabel samping-sampingan agar tidak tertukar).
- **Praktik:** skrip yang membaca file JSON berisi 100 bacaan sensor palsu lalu mencetak min/maks/rata-rata; simulasi "menunggu sensor" dengan `setTimeout` + `await`; skrip kecil yang memanggil API cuaca publik (`fetch`).
- **➕ Rumah Pintar Mini:** pembuat data dummy (`generate-dummy.js`) yang akan dipakai menguji backend & dashboard sebelum hardware tersambung.
- **✅ Lulus jika:** skrip statistik sensor Anda jalan dan Anda bisa menjelaskan apa yang terjadi jika `await` dihapus.

---

### 🟧 FASE 1 — ESP32 EMBEDDED: SENSOR & AKTUATOR (Modul 5–8)

> Tujuan fase: perangkat "Rumah Pintar Mini" yang berdiri sendiri — membaca lingkungan, menampilkan di layar, dan menggerakkan sesuatu — dengan firmware yang tidak gampang hang.

#### Modul 5 — Anatomi ESP32, GPIO, & Mengendalikan Dunia Nyata
*Fase 1 · Minggu 5 · Hardware: Kit A*

- **Tujuan:** tahu pin mana yang aman dipakai dan mana yang "jebakan"; mengendalikan LED, relay, buzzer, dan servo; membaca tombol dengan benar.
- **Topik:** peta pinout ESP32 DevKit V1 & daftar pin yang harus dihindari (pin *strapping*, pin flash, input-only); tombol EN vs BOOT; `pinMode`/`digitalWrite`/`digitalRead`; *pull-up* internal ("kenapa tombol saya kebaca acak?"); *debounce*; PWM dengan `ledcWrite` (redup-terang, nada buzzer, sudut servo); modul relay: cara kerja, *active-low*, batas aman (**hanya beban DC/tegangan rendah di kurikulum ini; 220 V dibahas sebagai peringatan**); arus maksimum pin & kapan butuh transistor.
- **Praktik:** tombol → toggle LED (dengan debounce); dimmer LED via potensiometer; buzzer memainkan nada; servo 0–180°; relay menyalakan kipas DC 5 V.
- **➕ Rumah Pintar Mini:** relay lampu & kipas, servo "tirai", tombol manual.
- **✅ Lulus jika:** satu tombol menyalakan/mematikan relay tanpa "bouncing", dan Anda bisa menyebutkan 3 pin ESP32 yang sebaiknya tidak dipakai beserta alasannya.

#### Modul 6 — Membaca Sensor: Analog, Digital, & Kalibrasi
*Fase 1 · Minggu 6 · Hardware: Kit A*

- **Tujuan:** membaca lima jenis sensor yang berbeda cara kerjanya, memahami angka mentah → satuan nyata, dan tahu kapan sensor "berbohong".
- **Topik:** ADC ("penggaris 12-bit": 0–4095) & keterbatasannya di ESP32; pembagi tegangan untuk LDR; sensor kapasitif tanah & kalibrasi kering/basah; DHT22 (protokol satu kabel timing-sensitif, library); HC-SR04 (mengukur jarak lewat waktu gema); PIR (digital sederhana, *warm-up time*); *noise* & rata-rata bergerak (*moving average*); *mapping* & pembatasan nilai; membaca datasheet bagian yang penting saja.
- **Praktik:** monitor Serial yang mencetak 5 bacaan rapi tiap 2 detik; Serial Plotter untuk melihat grafik; kalibrasi sensor tanah dengan gelas air; "alarm jarak" ultrasonik + buzzer.
- **➕ Rumah Pintar Mini:** semua sensor lingkungan terpasang; struct `BacaanSensor` terisi data asli.
- **✅ Lulus jika:** bacaan sensor tanah Anda menunjukkan 0 % di udara dan ±100 % di air, dan grafik LDR naik-turun saat Anda menutupnya dengan tangan.

#### Modul 7 — Protokol Bus Sensor: I2C, SPI, 1-Wire, & Layar OLED
*Fase 1 · Minggu 7 · Hardware: Kit A*

- **Tujuan:** menghubungkan beberapa perangkat pintar dengan hanya 2–4 kabel; menampilkan data di layar OLED; memahami "alamat" perangkat.
- **Topik:** mengapa ada protokol bus (analogi jalan tol vs jalan pribadi); **I2C** (SDA/SCL, alamat 0x3C, *I2C scanner*); OLED SSD1306 (teks, angka besar, ikon sederhana); BME280 via I2C; **1-Wire** DS18B20 (banyak sensor, satu kabel, masing-masing punya "nomor seri"); **SPI** (lebih cepat, lebih banyak kabel) dengan kartu microSD untuk *logging* offline; *pull-up* resistor pada bus; menggabungkan banyak sensor tanpa saling mengganggu.
- **Praktik:** I2C scanner; OLED menampilkan suhu & kelembapan dengan tata letak rapi; dua DS18B20 di satu kabel; menyimpan log CSV ke microSD.
- **➕ Rumah Pintar Mini:** layar OLED status + log CSV lokal (cadangan saat tidak ada internet).
- **✅ Lulus jika:** OLED menampilkan semua bacaan sensor dengan layout yang Anda desain sendiri, dan file CSV di microSD bisa dibuka di Excel/LibreOffice.

#### Modul 8 — Firmware Tangguh: millis(), State Machine, Hemat Daya, & Debugging
*Fase 1 · Minggu 8 · Hardware: Kit A*

- **Tujuan:** menulis firmware yang mengerjakan banyak hal "sekaligus" tanpa `delay()`, tidak hang, hemat baterai, dan mudah di-debug — standar firmware yang layak dipakai sungguhan.
- **Topik:** jebakan `delay()` & pola `millis()` (analogi melirik jam dinding); *state machine* sederhana (IDLE → MEMBACA → MENGIRIM → TIDUR); memecah kode menjadi beberapa file `.h/.cpp`; *watchdog timer* ("penjaga yang me-restart kalau program macet"); *deep sleep* & *light sleep* (dari jam ke bulan masa baterai); menyimpan setelan di NVS/Preferences (tetap ada setelah mati listrik); *logging* bertingkat (DEBUG/INFO/ERROR); pointer & *reference* sekadar untuk membaca kode orang lain; pengenalan PlatformIO; **Bedah Teknis Mendalam (opsional):** FreeRTOS task di dua core ESP32.
- **Praktik:** refaktor seluruh firmware Fase 1 ke pola `millis()` + state machine; ESP32 tidur 30 detik, bangun, baca sensor, tidur lagi — ukur arusnya; sengaja membuat *infinite loop* dan lihat watchdog menyelamatkan.
- **➕ Rumah Pintar Mini:** firmware v1.0 — mandiri, modular, hemat daya. 🎉 **Checkpoint Fase 1.**
- **✅ Lulus jika:** perangkat berjalan 24 jam tanpa restart (dicek lewat *uptime counter* di OLED) dan kode Anda tidak lagi memakai `delay()` di `loop()`.

---

### 🟦 FASE 2 — KONEKTIVITAS: WIFI, MQTT, & GATEWAY RASPBERRY PI (Modul 9–12)

> Tujuan fase: perangkat "berbicara" ke dunia luar dengan protokol standar, dan ada "kantor pos" lokal (Raspberry Pi) yang menampung semuanya.

#### Modul 9 — WiFi & HTTP: Perangkat Mulai Berbicara dengan Internet
*Fase 2 · Minggu 9 · Hardware: Kit A*

- **Tujuan:** menghubungkan ESP32 ke WiFi dengan andal (termasuk saat WiFi putus-nyambung), mengirim & menerima data lewat HTTP, dan membuat halaman web mini di dalam ESP32.
- **Topik:** cara kerja WiFi & alamat IP (analogi alamat rumah vs nomor rumah); `WiFi.begin` → *reconnect* otomatis; menyimpan kredensial tanpa menulisnya di kode (WiFiManager / *captive portal* — "portal login seperti WiFi hotel"); sinkronisasi jam lewat NTP; **HTTP** sebagai surat-menyurat (GET/POST, status 200/404/500, header, body JSON); ArduinoJson untuk membuat & membaca JSON; memanggil API publik (cuaca BMKG/Open-Meteo); ESP32 sebagai *web server* kecil untuk kendali LED dari browser HP; mDNS (`rumahpintar.local`).
- **Praktik:** ESP32 mengirim bacaan sensor ke layanan uji gratis (webhook) tiap menit; halaman web di ESP32 dengan tombol ON/OFF relay; portal konfigurasi WiFi.
- **➕ Rumah Pintar Mini:** perangkat online, jam akurat, bisa dikendalikan dari browser di jaringan rumah.
- **✅ Lulus jika:** Anda bisa mematikan lampu dari HP lewat halaman web ESP32, dan perangkat tersambung kembali sendiri setelah router dimatikan 1 menit.

#### Modul 10 — MQTT: Bahasa Resmi Dunia IoT
*Fase 2 · Minggu 10 · Hardware: Kit A + laptop sebagai broker*

- **Tujuan:** memahami *publish/subscribe* sampai ke tulang; menjalankan broker sendiri; membuat ESP32 mengirim data dan menerima perintah lewat MQTT dengan desain topik yang rapi.
- **Topik:** mengapa HTTP kurang cocok untuk ribuan perangkat; model pub/sub (analogi grup WhatsApp: *broker* = server WA, *topic* = nama grup); instalasi Mosquitto di laptop; `mosquitto_pub/sub` & MQTT Explorer; desain nama topik (`rumah/ruangtamu/suhu`, wildcard `+` dan `#`); **QoS 0/1/2** (analogi surat biasa/tercatat/kurir tanda tangan); *retained message* ("papan pengumuman"); **Last Will & Testament** ("surat wasiat" → status online/offline otomatis); *keep-alive*; library PubSubClient/AsyncMqttClient; pola *command → ack*; *payload* JSON vs angka polos.
- **Praktik:** ESP32 publish 5 sensor tiap 10 detik; subscribe `rumah/+/perintah` → relay; LWT menampilkan "ONLINE/OFFLINE" di MQTT Explorer; uji QoS dengan mematikan WiFi di tengah jalan.
- **➕ Rumah Pintar Mini:** seluruh komunikasi pindah ke MQTT dengan skema topik yang terdokumentasi.
- **✅ Lulus jika:** Anda bisa menggambar diagram pub/sub proyek Anda di kertas, dan perintah dari MQTT Explorer menyalakan relay < 1 detik.

#### Modul 11 — Raspberry Pi: Gateway Linux yang Selalu Hidup
*Fase 2 · Minggu 11 · Hardware: Kit B (atau laptop/Pi Zero 2 W)*

- **Tujuan:** menyiapkan Raspberry Pi tanpa monitor (*headless*), nyaman dengan perintah Linux dasar, dan memindahkan broker + dashboard Node-RED ke Pi sehingga sistem hidup 24/7 tanpa laptop.
- **Topik:** peran gateway & *edge* (kenapa tidak semua langsung ke cloud: biaya, internet putus, privasi); Raspberry Pi Imager + setelan SSH/WiFi sebelum boot; **Linux dasar** 20 perintah yang cukup (`cd`, `ls`, `nano`, `sudo`, `apt`, `systemctl`, `journalctl`); IP statis/mDNS; Mosquitto di Pi + *username/password*; **Node-RED**: *flow* MQTT → dashboard gauge/grafik/tombol dalam 15 menit; otomasi sederhana di Node-RED (jika suhu > 30 → publish perintah kipas); *systemd service* agar jalan otomatis saat boot; GPIO Pi dari Node.js (`onoff`) sekadar perbandingan dengan ESP32; backup kartu SD; kapan Pi perlu *reboot* otomatis.
- **Praktik:** Pi hidup headless & dapat di-SSH; broker pindah ke Pi; dashboard Node-RED menampilkan semua sensor dan tombol relay; otomasi kipas; pemantauan log.
- **➕ Rumah Pintar Mini:** gateway permanen; dashboard v0 (Node-RED) yang bisa dibuka dari HP di rumah.
- **✅ Lulus jika:** cabut laptop, sistem tetap jalan: HP membuka dashboard Node-RED di Pi dan tombol kipas berfungsi.

#### Modul 12 — Banyak Perangkat & Protokol Lain: ESP-NOW, BLE, dan Memilih yang Tepat
*Fase 2 · Minggu 12 · Hardware: Kit A (2 ESP32) + HP*

- **Tujuan:** menambah node kedua yang bicara langsung ke node pertama tanpa WiFi; mengenal Bluetooth Low Energy; punya "peta" untuk memilih protokol yang tepat untuk masalah nyata.
- **Topik:** **ESP-NOW** (ESP32 ↔ ESP32 tanpa router, jarak jauh, hemat daya) & pola *sensor node → gateway node*; **BLE** dasar: ESP32 sebagai *peripheral* yang dibaca aplikasi HP (nRF Connect) — untuk konfigurasi/provisioning; *buffering* data di gateway saat internet putus (*store-and-forward* sederhana di Node-RED/SQLite); **wawasan** (tanpa praktik): LoRa/LoRaWAN (kilometer, data kecil), Zigbee/Thread & Matter (smart home), NB-IoT/LTE-M (seluler), Modbus (industri) — **tabel keputusan**: jarak, daya, bandwidth, biaya; keamanan dasar nirkabel (enkripsi ESP-NOW, jangan broadcast kredensial).
- **Praktik:** node tanah (ESP32 #2, baterai, deep sleep) kirim via ESP-NOW ke node utama → MQTT; konfigurasi nama perangkat lewat BLE dari HP; matikan internet, nyalakan lagi: data tidak hilang.
- **➕ Rumah Pintar Mini:** node kebun nirkabel kedua; sistem toleran putus internet. 🎉 **Checkpoint Fase 2.**
- **✅ Lulus jika:** data dari node kedua tampil di Node-RED, dan Anda bisa memilih protokol yang tepat untuk 5 skenario soal (mis. "sensor di sawah 3 km dari rumah" → LoRa).

---

### 🟩 FASE 3 — BACKEND & DATA: NODE.JS + POSTGRESQL (Modul 13–16)

> Tujuan fase: "kantor pusat" yang mengingat semuanya, mengambil keputusan, dan bisa dipercaya.

#### Modul 13 — Backend Node.js Pertama: Menerima Data & Membuat API
*Fase 3 · Minggu 13 · Hardware: Kit A + B (atau laptop)*

- **Tujuan:** membangun server Node.js yang mendengarkan MQTT, memvalidasi data, dan menyediakan REST API yang rapi — dengan struktur proyek yang tidak memalukan saat dilihat orang lain.
- **Topik:** apa itu backend & API (analogi pelayan restoran); struktur proyek (`src/`, `routes/`, `services/`, `config/`); `.env` & *environment variable* ("jangan pernah commit password"); Fastify/Express: *route*, *handler*, *middleware*; MQTT client di Node (`mqtt.js`) → menerima semua topik → menyimpan ke memori dulu; validasi payload (Zod) — "jangan percaya perangkat"; REST API: `GET /devices`, `GET /devices/:id/latest`, `POST /devices/:id/command`; kode status & pesan error yang jelas; uji API dengan Bruno/Postman/`curl`; `nodemon`, *logging* (pino); ESLint + Prettier.
- **Praktik:** server menerima data 2 node & menyajikannya via API; endpoint perintah → publish MQTT → relay menyala; data dummy dari Modul 4 dipakai untuk menguji tanpa hardware.
- **➕ Rumah Pintar Mini:** backend v0.1 (tanpa database).
- **✅ Lulus jika:** `curl http://pi.local:3000/devices/esp32-1/latest` mengembalikan JSON bacaan terbaru, dan `POST .../command` menyalakan relay.

#### Modul 14 — Database: PostgreSQL + TimescaleDB untuk Data Sensor
*Fase 3 · Minggu 14 · Hardware: —*

- **Tujuan:** merancang tabel yang benar, menulis SQL untuk pertanyaan nyata, dan menyimpan data deret waktu secara efisien.
- **Topik:** mengapa database (bukan file CSV); instalasi PostgreSQL (lokal/Docker); DBeaver; **SQL dasar**: `CREATE TABLE`, `INSERT`, `SELECT`, `WHERE`, `ORDER BY`, `JOIN`, `GROUP BY`; perancangan skema: `devices`, `sensors`, `readings`, `commands`, `users`; tipe data & *timestamp dengan zona waktu* (jebakan WIB vs UTC); **TimescaleDB**: *hypertable*, `time_bucket` ("rata-rata per 15 menit"), *continuous aggregate*, *retention policy* ("buang data mentah > 90 hari, simpan rata-rata per jam selamanya"), kompresi; *index*; koneksi dari Node (`pg` + *connection pool*); migrasi skema (file SQL bernomor); *batch insert*; backup & restore (`pg_dump`).
- **Praktik:** semua data MQTT tersimpan; API riwayat `GET /devices/:id/readings?from=&to=&bucket=1h`; query "jam berapa tanah paling kering tiap hari minggu ini?"; memuat 1 juta baris dummy & membandingkan kecepatan dengan/tanpa hypertable.
- **➕ Rumah Pintar Mini:** riwayat permanen; backend v0.2.
- **✅ Lulus jika:** Anda bisa menulis SQL rata-rata suhu per jam 7 hari terakhir tanpa melihat contekan, dan backup-restore database berhasil.

#### Modul 15 — Realtime, Kendali Dua Arah, Aturan Otomatis, & Notifikasi
*Fase 3 · Minggu 15 · Hardware: Kit A + B*

- **Tujuan:** data mengalir ke browser tanpa *refresh*, perintah dari server sampai ke perangkat dengan konfirmasi, aturan otomatis bisa diatur tanpa mengubah kode, dan Anda ditelepon (ya, Telegram) saat ada masalah.
- **Topik:** WebSocket vs HTTP *polling* (analogi telepon vs mengecek kotak surat); Socket.IO server: *room* per perangkat; pola **command → ack → timeout** ("perintah dianggap gagal jika tak dijawab 5 detik"); **device state / shadow** (*desired* vs *reported*, "yang saya mau" vs "yang benar-benar terjadi"); status online/offline dari LWT; **rules engine** sederhana berbasis data: tabel `rules` (jika `suhu > 30` selama 2 menit → `kipas ON`, *hysteresis* agar tidak kedip-kedip); penjadwalan (*cron*: siram tiap 06.00); **Telegram Bot**: kirim peringatan & terima perintah `/status`; *debouncing* notifikasi (jangan spam); *event log* audit "siapa menyalakan apa, kapan".
- **Praktik:** terminal kecil yang menampilkan data live via Socket.IO; aturan kipas & siram otomatis dibuat lewat API, bukan kode; bot Telegram kirim "🌡️ Suhu 33 °C — kipas dinyalakan otomatis".
- **➕ Rumah Pintar Mini:** otak otomasi + notifikasi; backend v0.3.
- **✅ Lulus jika:** mengubah ambang suhu lewat API langsung mengubah perilaku kipas tanpa restart server, dan Telegram Anda menerima peringatan dalam ≤ 10 detik.

#### Modul 16 — Keamanan Dasar yang Wajib: Login, API Key Perangkat, & TLS
*Fase 3 · Minggu 16 · Hardware: Kit A + B*

- **Tujuan:** sistem tidak bisa dibuka sembarang orang, perangkat palsu tidak bisa menyusup, dan data tidak lewat internet dalam bentuk telanjang.
- **Topik:** model ancaman sederhana ("siapa yang mungkin iseng & apa akibatnya"); *hashing* password (bcrypt/argon2) — "simpan sidik jari, bukan wajah"; **JWT** & *refresh token*; peran pengguna (admin/viewer); **API key per perangkat** & registrasi/*provisioning* perangkat; Mosquitto *username/password* + **ACL** (perangkat hanya boleh publish ke topiknya sendiri); **TLS** untuk MQTT (8883) & HTTPS — sertifikat, CA, *self-signed* vs Let's Encrypt, memasang sertifikat CA di ESP32; *rate limiting* & CORS; *secrets* di `.env` + `.gitignore` + GitHub secret scanning; daftar periksa OWASP IoT Top 10 versi ramah awam; **wawasan:** *secure boot* & *flash encryption* ESP32.
- **Praktik:** halaman login (API) + proteksi semua endpoint; ESP32 pakai API key & TLS ke broker; akun "viewer" tidak bisa menyalakan relay; uji: perangkat dengan kredensial salah ditolak, ditulis ke log.
- **➕ Rumah Pintar Mini:** backend v1.0 aman. 🎉 **Checkpoint Fase 3.**
- **✅ Lulus jika:** MQTT Explorer tanpa password ditolak broker, dan tangkapan Wireshark/`tcpdump` menunjukkan lalu lintas MQTT sudah terenkripsi.

---

### 🟪 FASE 4 — FRONTEND: DASHBOARD REACT REALTIME (Modul 17–20)

> Tujuan fase: wajah produk — dashboard yang enak dipakai di HP maupun laptop, oleh orang yang tidak tahu apa itu MQTT.

#### Modul 17 — HTML, CSS, & React dari Nol untuk Dashboard IoT
*Fase 4 · Minggu 17 · Hardware: —*

- **Tujuan:** memahami cara halaman web dibangun dan membuat antarmuka React pertama yang menampilkan data dari API Anda.
- **Topik:** HTML (kerangka), CSS (kulit), JavaScript (otot) — 1 hari saja untuk dasar; **Tailwind CSS** agar tidak perlu menulis CSS panjang; apa itu React & mengapa komponen (analogi balok LEGO); Vite; JSX; *props* & *state*; `useState`, `useEffect`; `fetch` ke API backend; daftar perangkat & kartu sensor; *loading* & *error state*; *React DevTools*; struktur folder frontend.
- **Praktik:** halaman "Daftar Perangkat" + "Detail Perangkat" dari API (dengan data dummy Modul 4 agar bisa dikerjakan tanpa hardware); komponen `KartuSensor` yang dipakai ulang; *responsive* HP/laptop.
- **➕ Rumah Pintar Mini:** dashboard v0.1 (statis).
- **✅ Lulus jika:** dashboard menampilkan bacaan terbaru semua sensor dari API, rapi di layar HP.

#### Modul 18 — Dashboard Realtime: Grafik, Gauge, Riwayat, & Status
*Fase 4 · Minggu 18 · Hardware: Kit A + B*

- **Tujuan:** angka bergerak sendiri, grafik yang bisa dibaca, dan riwayat yang bisa dijelajahi.
- **Topik:** Socket.IO client & `useEffect` untuk langganan/berhenti langganan; *state management* ringan (Zustand/Context) agar data live tersedia di semua halaman; **Recharts**: *line chart* realtime (jendela 5 menit), *area chart* riwayat, *gauge*; memilih visual yang jujur (skala, satuan, warna status); pemilih rentang waktu (1 jam / 24 jam / 7 hari) → API `bucket`; indikator online/offline & "terakhir dilihat"; tabel riwayat dengan *pagination*; performa: jangan *re-render* 10× per detik; dark mode.
- **Praktik:** grafik suhu live; halaman riwayat 7 hari dengan rata-rata per jam; kartu status perangkat merah/hijau; ekspor CSV.
- **➕ Rumah Pintar Mini:** dashboard v0.2 (live).
- **✅ Lulus jika:** menutup sensor LDR dengan tangan membuat grafik di HP turun dalam < 2 detik, dan riwayat 7 hari termuat < 1 detik.

#### Modul 19 — Kendali, Form Aturan, Login, & Aplikasi di HP (PWA)
*Fase 4 · Minggu 19 · Hardware: Kit A + B*

- **Tujuan:** pengguna bisa mengendalikan perangkat dan mengatur aturan otomatis dengan aman, dari aplikasi yang bisa "di-install" di HP.
- **Topik:** tombol kendali dengan *optimistic UI* + konfirmasi *ack* (dan *rollback* jika gagal); form aturan (ambang, durasi, aksi) dengan validasi; halaman login, menyimpan token dengan aman, *protected route*, peran viewer vs admin; notifikasi di browser (*toast*); **PWA**: *manifest*, ikon, *service worker* → "Tambahkan ke layar utama"; aksesibilitas dasar (kontras, ukuran sentuh); **pilihan lanjutan:** migrasi ke **Next.js 16** (routing, SSR) — kapan perlu, kapan tidak.
- **Praktik:** toggle lampu/kipas dengan status "menunggu konfirmasi…"; CRUD aturan; login/logout; PWA terpasang di HP Android/iOS.
- **➕ Rumah Pintar Mini:** dashboard v1.0 — lengkap untuk pengguna akhir.
- **✅ Lulus jika:** orang lain (bukan Anda) bisa login, menyalakan lampu, dan membuat aturan "siram jika tanah < 30 %" dari HP-nya tanpa bantuan.

#### Modul 20 — Visualisasi Profesional: Grafana, Peta Perangkat, & Laporan
*Fase 4 · Minggu 20 · Hardware: Kit A + B*

- **Tujuan:** punya dua jenis dashboard — buatan sendiri untuk pengguna, dan Grafana untuk tim teknis — serta tahu kapan memakai yang mana.
- **Topik:** **Grafana** terhubung ke TimescaleDB: panel, variabel, *alert* ke Telegram; perbandingan jujur Node-RED vs Grafana vs React; peta perangkat dengan **Leaflet/OpenStreetMap** (koordinat statis atau GPS); laporan harian otomatis (PDF/CSV lewat email/Telegram); *embed* panel Grafana di React; **wawasan:** platform IoT siap pakai (ThingsBoard, Blynk, Home Assistant, Antares) — kapan membeli, kapan membangun.
- **Praktik:** dashboard Grafana "Kesehatan Sistem" (RSSI, uptime, heap tiap node); alert "node offline > 5 menit"; peta node; laporan harian via Telegram.
- **➕ Rumah Pintar Mini:** dashboard teknis + laporan. 🎉 **Checkpoint Fase 4.**
- **✅ Lulus jika:** Grafana mengirim alert Telegram saat Anda mencabut node kedua, dan laporan harian tiba otomatis.

---

### ⬛ FASE 5 — OPERASI & SKALA: DEPLOY, OTA, CI/CD, & CAPSTONE (Modul 21–24)

> Tujuan fase: dari "jalan di meja saya" menjadi "jalan di internet, 24/7, bisa diperbarui, dan tidak kehilangan data" — lalu membuktikannya dengan proyek akhir.

#### Modul 21 — Docker & Deploy: ke Raspberry Pi dan ke Cloud
*Fase 5 · Minggu 21 · Hardware: Kit B + VPS (opsional, ±Rp 50–100 rb/bulan)*

- **Tujuan:** menjalankan seluruh sistem dengan satu perintah di mesin mana pun, lalu membukanya ke internet dengan domain dan HTTPS.
- **Topik:** masalah "di laptop saya jalan"; **Docker** (analogi kontainer kapal): *image*, *container*, *volume*, *network*; `Dockerfile` untuk backend & frontend; **Docker Compose** menyatukan Mosquitto + PostgreSQL/Timescale + API + Web + Grafana; variabel lingkungan & *secrets*; *healthcheck* & *restart policy*; deploy ke Pi (ARM64) vs **VPS** (DigitalOcean/IDCloudHost/Biznet Gio — cara memilih & biaya); domain & DNS; **Caddy** sebagai *reverse proxy* + HTTPS otomatis (Let's Encrypt); **Cloudflare Tunnel** agar Pi di rumah bisa diakses dari luar tanpa membuka port router; arsitektur hibrida: Pi tetap gateway lokal, VPS jadi pusat; *firewall* (ufw) & SSH key.
- **Praktik:** `docker compose up -d` menjalankan semua di Pi; versi cloud di VPS dengan `https://iot.namaanda.com`; ESP32 dialihkan ke broker cloud via TLS; uji dari jaringan seluler.
- **➕ Rumah Pintar Mini:** online di internet.
- **✅ Lulus jika:** teman di kota lain membuka dashboard Anda lewat HTTPS dan melihat angka berubah.

#### Modul 22 — OTA Update, Provisioning, & Mengelola Banyak Perangkat (Fleet)
*Fase 5 · Minggu 22 · Hardware: Kit A (2 ESP32) + server*

- **Tujuan:** memperbarui firmware 1 atau 100 perangkat tanpa menyentuhnya, mendaftarkan perangkat baru dalam 1 menit, dan tahu kesehatan setiap perangkat.
- **Topik:** mengapa OTA wajib ("perangkat di atap"); **ArduinoOTA** (LAN) vs **HTTP OTA** dari server (internet); partisi ganda & *rollback* otomatis kalau firmware baru gagal; **versi firmware** (SemVer) & *manifest*; pola *canary* (update 1 perangkat dulu); **provisioning**: ID unik dari MAC, pendaftaran lewat BLE/captive portal, *claim code*; konfigurasi jarak jauh (interval kirim, ambang) via MQTT *retained*; **device vitals**: RSSI, uptime, heap, suhu chip, alasan reset — dikirim ke tabel `device_health`; *remote log*; *fleet view* di dashboard; menonaktifkan perangkat yang hilang/dicuri.
- **Praktik:** pipeline: build firmware v1.1 → unggah ke server → ESP32 cek versi tiap jam → update sendiri → laporkan sukses; sengaja kirim firmware rusak → rollback; daftarkan ESP32 ketiga (pinjam/Wokwi) dalam 1 menit.
- **➕ Rumah Pintar Mini:** siap dipasang di banyak lokasi.
- **✅ Lulus jika:** dua ESP32 ter-update ke versi baru tanpa kabel, dan firmware yang sengaja rusak otomatis kembali ke versi lama.

#### Modul 23 — Keandalan: Monitoring, Backup, Testing, & CI/CD
*Fase 5 · Minggu 23 · Hardware: server*

- **Tujuan:** tahu lebih dulu dari pengguna saat ada yang rusak, tidak pernah kehilangan data, dan setiap perubahan kode diuji & di-deploy otomatis.
- **Topik:** *observability* ramah awam: log, metrik, alert; **Uptime Kuma** / Grafana alerting untuk layanan & perangkat; *healthcheck endpoint*; **backup otomatis** PostgreSQL ke penyimpanan lain (rclone → Drive/S3) & **uji restore** ("backup yang belum pernah di-restore = tidak ada backup"); *log rotation*; **testing**: unit test (Vitest) untuk rules engine & validasi, *integration test* API, uji firmware otomatis di Wokwi CI; **GitHub Actions**: lint → test → build image → deploy ke VPS saat `git push` ke `main`; *staging* vs *production*; *semantic versioning* & `CHANGELOG`; dokumentasi (README yang bisa diikuti orang lain, diagram arsitektur, *runbook* "kalau X rusak lakukan Y"); perkiraan **biaya bulanan** sistem (VPS, domain, listrik Pi) & skala (1 vs 100 vs 10.000 perangkat — apa yang berubah, kapan butuh broker cluster/EMQX, Kafka, dsb.).
- **Praktik:** alert Telegram saat API mati; backup harian + restore ke database kosong; 20 unit test hijau; `git push` → deploy otomatis; *runbook* 1 halaman.
- **➕ Rumah Pintar Mini:** v2.0 — tingkat produksi.
- **✅ Lulus jika:** Anda mematikan kontainer API dan menerima alert < 2 menit; `git push` perubahan kecil tampil di produksi tanpa Anda SSH.

#### Modul 24 — Capstone: Proyek Akhir, Portofolio, & Langkah Karier
*Fase 5 · Minggu 24 (boleh 2–3 minggu) · Hardware: pilihan Anda*

- **Tujuan:** membuktikan semua kemampuan dalam satu proyek orisinal yang didokumentasikan seperti produk sungguhan, dan tahu langkah berikutnya.
- **Topik:** memilih proyek (tabel ide + tingkat kesulitan): *smart farming/hidroponik*, *monitoring energi rumah/kos* (PZEM-004T), *cold chain* (suhu kulkas/vaksin), *smart parking*, *monitoring kualitas udara* (PM2.5/MQ-135), *pemantauan tandon & pompa*, *pelacak aset GPS* — atau ide sendiri; **dokumen rancangan 1 halaman** (masalah, pengguna, arsitektur, daftar komponen, risiko); jadwal 2 minggu; **standar portofolio**: README dengan foto/video demo, diagram arsitektur, cara menjalankan dalam 5 menit, daftar fitur, keterbatasan jujur; presentasi 5 menit; *code review* mandiri dengan *checklist*; **karier**: peta peran (firmware, backend, fullstack IoT, solution engineer), kisaran gaji & jenis perusahaan di Indonesia, cara membaca lowongan, sertifikasi yang relevan (opsional), komunitas (Wokwi, ESP32 Indonesia, Home Assistant ID), freelance & *bootstrapping* produk kecil.
- **Praktik:** mengerjakan & mempresentasikan capstone; *peer review* (bila belajar berkelompok); menerbitkan repositori.
- **➕ Rumah Pintar Mini:** menjadi dasar atau "adik" dari capstone Anda.
- **✅ Lulus jika:** repositori capstone Anda bisa dijalankan orang lain hanya dengan membaca README, dan video demo 3 menit menunjukkan alur sensor → dashboard → kendali → notifikasi. 🎓 **Selesai: Fullstack IoT Developer.**

---

## 8. Evaluasi & tanda kelulusan tiap fase

Tidak ada ujian formal — kurikulum ini untuk belajar mandiri — tetapi setiap fase punya **tiga bukti** yang harus ada di repositori Anda sebelum lanjut:

| Fase | Kuis (5 soal/modul) | Proyek checkpoint | Artefak di GitHub |
| :---: | :--- | :--- | :--- |
| 0 | ≥ 80 % | Lampu lalu lintas (C++) + skrip statistik (JS) | Kode + tangkapan layar Wokwi |
| 1 | ≥ 80 % | Perangkat mandiri 24 jam tanpa restart | Firmware v1.0 + foto rangkaian + video 30 detik |
| 2 | ≥ 80 % | Sistem 2 node + gateway Pi tahan putus internet | Diagram topik MQTT + flow Node-RED (JSON) |
| 3 | ≥ 80 % | Backend aman dengan aturan & Telegram | Koleksi API (Bruno) + skema SQL + hasil uji |
| 4 | ≥ 80 % | Dashboard dipakai orang lain tanpa dibantu | Video demo HP + tautan Grafana |
| 5 | — | Sistem online + OTA + CI/CD + capstone | README produk + video demo 3 menit |

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
│   ├── modul-02-listrik-ramah-awam/
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
| **Firmware profesional** | ESP-IDF murni, FreeRTOS mendalam, *secure boot*, *flash encryption*, *unit test* firmware, Zephyr RTOS | Mengutak-atik chip & efisiensi |
| **Desain hardware** | KiCad (skematik & PCB), DFM, *power budgeting*, baterai & *energy harvesting*, EMC | Membuat produk fisik sendiri |
| **Wireless & industri** | LoRaWAN + ChirpStack, Zigbee/Thread + Matter, Modbus RTU/TCP, CAN bus, OPC-UA, Sparkplug B | Pabrik, pertanian skala besar, otomotif |
| **Edge AI / TinyML** | Edge Impulse, TensorFlow Lite Micro, deteksi anomali getaran/suara, kamera ESP32-CAM | Membuat perangkat "pintar" sungguhan |
| **Cloud & skala besar** | AWS IoT Core / Azure IoT Hub, EMQX cluster, Kafka, Kubernetes, *data lake*, multi-tenant | Jutaan perangkat & tim besar |
| **Keamanan & kepatuhan** | *Pen-testing* perangkat, SBOM, EU Cyber Resilience Act, NIST IR 8259, PSTI | Produk yang dijual ke pasar global |

---

## 11. Catatan untuk peninjau

Hal-hal yang **mudah diubah sekarang** (sebelum materi ditulis) dan saya ingin konfirmasi:

1. **Proyek benang merah "Rumah Pintar Mini"** — cocok? Alternatif: "Kebun Pintar" (lebih ke pertanian), "Monitoring Kos" (energi & keamanan), atau campuran. Nama bisa diganti kapan saja.
2. **Modul 4 (JavaScript dari nol)** ditaruh di Fase 0 agar pembaca langsung kenal dua bahasa yang akan dipakai. Alternatif: dipindah ke awal Fase 3 (tepat sebelum backend) supaya Fase 0–2 murni hardware. Keduanya punya kelebihan.
3. **Fastify vs Express** untuk backend — Fastify lebih modern & cepat, Express lebih banyak tutorial Indonesia. Saya condong ke Fastify, tapi mudah ditukar.
4. **Modul 20 (Grafana, peta, laporan)** bisa dianggap "bonus"; jika ingin kurikulum lebih ramping, modul ini bisa dilebur dan Fase 4 jadi 3 modul, dengan 1 modul tambahan di Fase 5 (misalnya "Edge computing di Pi dengan Node.js").
5. **VPS berbayar di Modul 21** (±Rp 50–100 rb/bulan) — materi akan selalu menyediakan jalur gratis (Pi + Cloudflare Tunnel, atau free tier), tapi pengalaman VPS sungguhan sangat berharga. Setuju dijadikan "sangat disarankan, tidak wajib"?
6. **Gaya penomoran**: `Modul 1–24` berurutan global (seperti sekarang) atau `0.1, 0.2, … 5.4` per fase (seperti versi lama)? Penomoran global lebih sederhana untuk pemula.
7. **Target durasi artikel per modul**: saya rencanakan 2.500–4.500 kata + 6–12 gambar + kode lengkap. Cukup, atau ingin lebih ringkas/lebih dalam?

Setelah silabus ini disetujui, penulisan dimulai dari **Modul 1** dan berjalan berurutan, satu modul per iterasi, masing-masing langsung di-*push* ke GitHub.
