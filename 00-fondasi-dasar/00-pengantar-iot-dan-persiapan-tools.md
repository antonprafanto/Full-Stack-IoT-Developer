# 🚀 Modul 0.0: Pengantar IoT & Menyiapkan Lab Virtual Pertama Anda

> **Fase 0: Fondasi Dasar**  
> **Target Pembaca:** Siapa saja yang baru pertama kali menyentuh dunia hardware/software (0% pengalaman sebelumnya).  
> **Estimasi Waktu Belajar:** 20–30 Menit  
> **Prasyarat Alat:** Cukup Browser Web (Google Chrome / Edge / Firefox) dan koneksi internet.

---

## 🧭 Daftar Isi Modul
1. [Apa Itu IoT Sebenarnya? (Analogi Tubuh Manusia)](#1-apa-itu-iot-sebenarnya-analogi-tubuh-manusia)
2. [Komputer Laptop vs Mikrokontroler (ESP32): Apa Bedanya?](#2-komputer-laptop-vs-mikrokontroler-esp32-apa-bedanya)
3. [Keamanan Fisik: "Apakah Saya Bisa Kesetrum atau Merusak Laptop?"](#3-keamanan-fisik-apakah-saya-bisa-kesetrum-atau-merusak-laptop)
4. [Bagaimana Kode yang Kita Ketik Masuk ke Chip Silikon?](#4-bagaimana-kode-yang-kita-ketik-masuk-ke-chip-silikon)
5. [Mengenal Tombol Fisik `EN` (Reset) dan `BOOT` pada ESP32](#5-mengenal-tombol-fisik-en-reset-dan-boot-pada-esp32)
6. [Laboratorium Virtual: Mulai Praktik di Wokwi Simulator (Tanpa Beli Alat)](#6-laboratorium-virtual-mulai-praktik-di-wokwi-simulator-tanpa-beli-alat)
7. [Glosarium Istilah & Rangkuman](#7-glosarium-istilah--rangkuman)

---

## 1. Apa Itu IoT Sebenarnya? (Analogi Tubuh Manusia)

**IoT (*Internet of Things*)** terdengar seperti istilah yang sangat canggih, tetapi konsep dasarnya persis seperti **cara kerja tubuh manusia**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ANALOGI IOT & TUBUH MANUSIA                     │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Panca Indra  (Mata, Kulit, Hidung)  ══► SENSOR (Suhu, Cahaya, Gas)  │
│ 2. Otak         (Memproses Pikiran)    ══► MIKROKONTROLER (ESP32)      │
│ 3. Saraf        (Mengirim Pesan Cepat) ══► JARINGAN (Wi-Fi, MQTT, BLE) │
│ 4. Otot / Tangan(Melakukan Tindakan)   ══► AKTUATOR (Relay, Lampu, Pompa)│
└────────────────────────────────────────────────────────────────────────┘
```

- **Sensor (Indra):** Merasakan dunia fisik di sekitarnya. Contoh: Sensor suhu merasakan ruangan panas $32^\circ\text{C}$.
- **Mikrokontroler (Otak):** Membaca angka $32^\circ\text{C}$ tersebut dan mengambil keputusan: *"Wah, ruangan terlalu panas, saya harus menyalakan AC!"*.
- **Jaringan (Saraf):** Mengirimkan data suhu tersebut ke smartphone pemilik rumah melalui internet.
- **Aktuator (Otot):** Menggerakkan sakelar elektronik (*Relay*) untuk benar-benar menyalakan listrik AC.

---

## 2. Komputer Laptop vs Mikrokontroler (ESP32): Apa Bedanya?

Banyak pemula mengira mikrokontroler seperti ESP32 adalah komputer kecil seperti laptop. Mari kita bedakan:

```
┌──────────────────────────────────────┬──────────────────────────────────────┐
│       KOMPUTER / LAPTOP / HP         │        MIKROKONTROLER (ESP32)        │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Punya Sistem Operasi (Windows/Linux) │ TIDAK butuh Sistem Operasi (OS)      │
│ Menjalankan ratusan aplikasi serentak│ Hanya fokus 1 program seumur hidupnya │
│ Butuh daya besar (15W - 100W)        │ Butuh daya sangat mini (< 0.5 Watt)  │
│ Booting butuh waktu 10-30 detik      │ Menyala instan dalam hitungan milidetik│
│ RAM: 8.000.000 KB (8 GB)             │ RAM: 520 KB (Sangat hemat & efisien) │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

> 💡 **Pola Pikir Penting:**  
> Mikrokontroler dirancang untuk **ketahanan tanpa henti (*bare-metal execution*)**. Begitu diberi colokan listrik, chip ESP32 langsung menjalankan instruksi Anda detik itu juga, berputar terus menerus selama bertahun-tahun tanpa perlu di-*shutdown*.

---

## 3. Keamanan Fisik: "Apakah Saya Bisa Kesetrum atau Merusak Laptop?"

Bagi siapa pun yang baru pertama kali melihat kabel dan komponen elektronik, ada rasa takut yang sangat wajar. Mari kita luruskan mitos-mitos ini:

> [!NOTE]
> ### 🛡️ 3 Fakta Keamanan yang Perlu Anda Ketahui:
> 1. **Tegangan Rendah (3.3V & 5V DC):** Tegangan yang keluar dari port USB laptop atau baterai ESP32 berkisar antara **3.3 Volt hingga 5 Volt**. Listrik di bawah 24 Volt **sama sekali tidak bisa menembus hambatan kulit manusia**. Anda bisa memegang kabelnya dengan tangan telanjang tanpa rasa sakit atau kesetrum.
> 2. **Proteksi Port USB Laptop:** Port USB pada komputer/laptop modern telah dilengkapi sirkuit proteksi *Overcurrent Protection*. Jika Anda tidak sengaja menyentuhkan kabel positif ke negatif, laptop Anda otomatis memutus arus sesaat untuk melindungi dirinya sendiri.
> 3. **Harga Komponen Murah:** Jika Anda salah merangkai dan lampu LED putus, harga satu lampu LED hanyalah sekitar **Rp 200 – Rp 500**. Jangan takut salah, karena semua insinyur terbaik di dunia belajar dari komponen yang pernah mereka putuskan!

---

## 4. Bagaimana Kode yang Kita Ketik Masuk ke Chip Silikon?

Bagaimana tulisan teks bahasa C++ yang kita ketik di laptop bisa berubah menjadi aksi fisik (lampu menyala)?

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ALUR DARI KODE KE CHIP FISIK                    │
│                                                                        │
│   [ 1. Kode Sumber C++ ] (File teks manusia: main.cpp / sketch.ino)    │
│            │                                                           │
│            ▼ (Diterjemahkan oleh Kompiler: xtensa-esp32-elf-gcc)       │
│   [ 2. File Biner Mesin ] (Kumpulan angka 1 dan 0: firmware.bin)       │
│            │                                                           │
│            ▼ (Dikirim lewat kabel data USB via software esptool)       │
│   [ 3. Chip USB-to-UART ] (Jembatan penerjemah: CP2102 / CH340)        │
│            │ (Mengubah sinyal USB menjadi sinyal Serial RX/TX)         │
│            ▼                                                           │
│   [ 4. Memori SPI Flash ESP32 ] ──► [ Prosesor Eksekusi Nyalakan Lampu]│
└────────────────────────────────────────────────────────────────────────┘
```

### Penjelasan Komponen Penerjemah:
1. **Kompiler (*Compiler*):** Program di laptop yang bertugas menerjemahkan kata-kata bahasa Inggris (seperti `digitalWrite(2, HIGH)`) menjadi jutaan angka biner `1` dan `0` yang dipahami prosesor.
2. **Chip USB-to-UART (Jembatan):** Chip kecil warna hitam di dekat colokan micro-USB/Type-C ESP32 (biasanya bertipe **CP2102** atau **CH340**). Chip inilah yang membuat laptop Anda mengenali ESP32 sebagai **Port COM** (misal: `COM3` di Windows atau `/dev/ttyUSB0` di Linux/Mac).

---

## 5. Mengenal Tombol Fisik `EN` (Reset) dan `BOOT` pada ESP32

Jika Anda melihat papan board ESP32, Anda akan menemukan **2 tombol kecil** di samping kanan dan kiri colokan USB:

```
                  ┌────────────────────────┐
                  │      ANTENA WI-FI      │
                  │  ┌──────────────────┐  │
                  │  │  CHIP ESP-WROOM  │  │
                  │  └──────────────────┘  │
                  │                        │
       [ TOMBOL ] │                        │ [ TOMBOL ]
       [   EN   ] │                        │ [  BOOT  ]
       (Restart)  │      [ CHIP USB ]      │ (Download)
                  │      [  CP2102  ]      │
                  └─────────┬────┬─────────┘
                            │USB │
                            └────┘
```

1. **Tombol `EN` (*Enable / Reset*):**
   - **Fungsi:** Memulai ulang (*restart*) program ESP32 dari awal baris pertama. Sama seperti tombol restart pada PC.
2. **Tombol `BOOT` (*Bootloader / GPIO 0*):**
   - **Fungsi:** Memaksa ESP32 masuk ke mode siap menerima file biner baru dari laptop (*Flash Download Mode*).
   - **Kapan Digunakan?** Board ESP32 modern biasanya sudah bisa masuk mode download otomatis. Namun jika saat upload muncul pesan `Connecting........_____.....`, **cukup tekan dan tahan tombol BOOT selama 2 detik**, lalu lepaskan begitu proses upload berjalan.

---

## 6. Laboratorium Virtual: Mulai Praktik di Wokwi Simulator (Tanpa Beli Alat)

Salah satu keunggulan belajar IoT zaman sekarang adalah adanya simulator virtual browser. Anda bisa merakit kabel, menancapkan sensor, dan menguji kode program **tanpa perlu membeli alat fisik sama sekali**.

### 🛠️ Langkah-Langkah Membuka Wokwi Simulator:
1. Buka browser Anda (Google Chrome / Edge) dan kunjungi tautan: 👉 **[wokwi.com/esp32](https://wokwi.com/esp32)**
2. Pilih template **"ESP32"** (dengan bahasa C++ / Arduino).
3. Anda akan melihat 2 panel utama:
   - **Panel Kiri:** Editor teks untuk menulis kode C++.
   - **Panel Kanan:** Area kerja visual interaktif yang menampilkan papan board ESP32.
4. Klik tombol bulat **Hijau (Play / Start Simulation)** di bagian atas.
5. Selamat! Anda baru saja menjalankan mikrokontroler virtual pertama Anda!

```
┌───────────────────────────────────┬───────────────────────────────────┐
│        PANEL KIRI (KODE C++)      │     PANEL KANAN (SIRKUIT VIRTUAL) │
├───────────────────────────────────┼───────────────────────────────────┤
│ void setup() {                    │          ┌─────────────┐          │
│   pinMode(2, OUTPUT);             │          │    ESP32    │          │
│ }                                 │          │             │          │
│                                   │          │  ● LED Nyala│          │
│ void loop() {                     │          └──────┬──────┘          │
│   digitalWrite(2, HIGH);          │                 │                 │
│ }                                 │          [ ▶ PLAY BUTTON ]        │
└───────────────────────────────────┴───────────────────────────────────┘
```

---

## 7. Glosarium Istilah & Rangkuman

| Istilah Teknis | Bahasa Manusia / Definisi Sederhana |
| :--- | :--- |
| **Bare-Metal** | Menjalankan program langsung pada chip silikon tanpa perantara sistem operasi (Windows/Linux/Android). |
| **Firmware** | Kode program permanen yang ditanamkan ke dalam memori mikrokontroler untuk mengontrol hardware. |
| **Flashing / Upload** | Proses menyalin file program biner dari laptop ke dalam memori chip ESP32. |
| **Baud Rate** | Kecepatan ketukan sinyal data per detik antara ESP32 dan laptop (standar umum: 115200 bit per detik). |
| **Port COM** | Pintu komunikasi serial di Windows tempat kabel USB ESP32 terhubung. |

---

> 🎉 **Selamat!** Anda telah memahami bagaimana mikrokontroler bekerja, alur kompilasi kode, dan cara membuka lab virtual Wokwi.
> 
> 👉 **Langkah Selanjutnya:** Mari kita pelajari bagaimana listrik mengalir, hukum Ohm, dan anatomi breadboard di **[Modul 0.1: Dasar Listrik & Komponen Fisik](01-dasar-listrik-dan-komponen.md)**!
