# Modul 7 — Protokol Bus Sensor: I2C, 1-Wire, SPI, Layar OLED, & Membaca Skematik

🌐 **Bahasa Indonesia** · [English](../../en/phase-1-esp32-embedded/module-07-sensor-bus-oled-schematics/README.md)

*Fase 1 · Minggu 7 · Perangkat keras (*hardware*): **Kit A Tahap 2** (lihat 🧰) — hampir semua praktik juga bisa dicoba di Wokwi · Prasyarat: **Modul 6** (Node 1 v0.3.0 dengan lima sensor) · Waktu: 8–10 jam, dicicil dalam seminggu*

[⬅️ Modul 6](../modul-06-membaca-sensor/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · [Modul 8 ➡️](../modul-08-firmware-tangguh/README.md)

---

Minggu lalu, Node 1 mendapat lima indra. Setiap sensor menempati pin sendiri sehingga pin ESP32 yang masih bebas makin sedikit. Minggu ini kita belajar cara yang dipakai hampir semua perangkat elektronik modern untuk menghemat kabel: **bus**, yaitu jalur bersama yang dipakai banyak perangkat sekaligus. Bandingkan dengan jalan raya: alih-alih membangun jalan pribadi ke setiap rumah, kita membangun satu jalan tol yang punya banyak pintu keluar.

Ada empat komponen baru dari Kit A Tahap 2, dan masing-masing memakai salah satu dari tiga jenis bus:

| Komponen baru | Bus | Gunanya untuk proyek kita |
| :--- | :--- | :--- |
| **Layar OLED** 0,96 inci | **I2C** — 2 kabel data | Node 1 bisa menampilkan bacaannya sendiri, tanpa laptop. |
| **BME280** | **I2C** — 2 kabel yang **sama** dengan layar | Latihan untuk Node 2 di kebun: suhu, kelembapan, dan tekanan udara. |
| **DS18B20** tahan air | **1-Wire** — 1 kabel data | Suhu air atau tanah; beberapa sensor bisa berbagi satu kabel. |
| **Modul microSD** (opsional) | **SPI** — 4 kabel data | Buku catatan *offline* (luring): bacaan tetap tersimpan walaupun internet putus. |

Pada akhir minggu, Node 1 v0.4.0 punya **layar status** dengan tata letak rancanganmu sendiri dan, kalau kamu memasang microSD, mencatat bacaannya ke kartu. Selain itu, kamu belajar satu keterampilan yang akan terus terpakai: **membaca skematik**, yaitu "peta" rangkaian yang ada di setiap lembar data dan halaman produk. Dengan keterampilan ini, kamu akhirnya bisa melihat isi modul relay yang kamu pakai sejak Modul 5.

![Peta jalan Modul 7. Atas, enam fase kurikulum dari Fase 0 Fondasi sampai Fase 5 Operasi dan skala; Fase 1 ESP32, Modul 5 sampai 9, disorot, Modul 1 sampai 6 bertanda selesai, dan Modul 7 ditandai KAMU DI SINI dengan catatan banyak perangkat, sedikit kabel. Bawah, kotak Modul 7 minggu ini, sekitar 8 sampai 10 jam yang dicicil dengan Kit A Tahap 2, berisi sepuluh hal: KC, Kemenangan Cepat, layar OLED pertama di Wokwi; P1, layar OLED dan pemindai I2C; P2, kotak peralatan layar: huruf, koordinat, dan ikon; P3, BME280 di bus yang sama; P4, DS18B20 di bus 1-Wire; P5, opsional, catatan CSV di kartu microSD; P6, layar status Node 1 rancanganmu; P7, membaca skematik modul relay dan menggambar ulang Node 1; P8, menyimpan ke GitHub; dan tanda plus, Tambahan: Node 1 versi 0.4.0 dan PETA-PIN.md versi 3. Tanda bintang menandai P6 dan P7 sebagai bagian dari syarat lulus](aset/peta-jalan-modul-07.png)

> [!NOTE]
> **Cara memakai modul ini.**
>
> - Setiap kotak kode punya tombol salin di pojok kanan atasnya. Semua sketsa juga tersedia sebagai file di folder [`kode/`](kode/), lengkap dengan `diagram.json` (dan `libraries.txt` kalau perlu) untuk Wokwi.
> - Kotak yang didahului kata **Hasilnya** hanya untuk dicocokkan, bukan diketik.
> - **Belum punya Kit A Tahap 2?** Layar OLED, DS18B20, dan modul microSD tersedia di Wokwi. Hanya BME280 yang belum ada; diagram Wokwi Praktik 3 memakai sepupu lamanya, **BMP180**, sebagai pengganti (penjelasannya di Praktik 3). Membaca skematik cukup dengan kertas dan pensil.
> - **Papan ESP32 di Wokwi tetap diputar menyamping** seperti Modul 6: colokan USB di kiri, deretan pin VIN…EN di atas, dan deretan 3V3…D23 di bawah.
> - Server Wokwi yang gratis kadang ramai. Kalau muncul jendela `Build Servers Busy`, programmu sedang antre untuk disusun: tunggu beberapa menit. Kalau simulasi tidak kunjung berjalan, klik **CLOSE**, hentikan simulasi (tombol **■**), lalu coba lagi nanti. Sketsa yang memakai banyak library, seperti Node 1, paling sering terkena antrean ini.
> - Pengguna macOS: ganti **Ctrl** dengan **Cmd** untuk menyimpan, menyalin, dan menempel.

> [!WARNING]
> **Tiga aturan keselamatan minggu ini.**
>
> 1. **Sebelum memasang atau memindah kabel apa pun, matikan MB102, lalu cabut USB.** Menyalakannya lagi juga berurutan: colokkan USB dulu, baru nyalakan MB102 (aturan emas nomor 5 dari Modul 5).
> 2. **Layar OLED, BME280, dan DS18B20 diberi 3,3 V dari rel bawah, tidak pernah 5 V.** Pada banyak modul, resistor *pull-up* di jalur datanya tersambung ke kaki VCC modul. Kalau VCC diberi 5 V, jalur data ikut naik ke 5 V, padahal pin ESP32 tidak tahan 5 V. Satu-satunya pengecualian adalah modul microSD beregulator (Praktik 5): kaki VCC-nya memang butuh 5 V, tetapi sinyalnya tetap 3,3 V karena modul itu punya penerjemah tegangan sendiri.
> 3. **Hanya ujung baja probe DS18B20 dan sebagian kabel hitamnya yang boleh basah.** Ujung kawat di terminal sekrup, adaptor, dan breadboard tetap kering. Gelas air untuk percobaan diletakkan di nampan, jauh dari breadboard dan laptop, seperti di Modul 6.

Ritme modul ini sama dengan Modul 1–6. Bagian lipat di 🚨 (klik judulnya) cukup dibuka saat kamu membutuhkannya; bagian lipat di 🔬 boleh dilewati. Setiap praktik diawali kotak **🖥️** yang menyebut alat dan komponen yang dipakai.

## Daftar isi

1. [🎯 Setelah modul ini kamu bisa…](#-setelah-modul-ini-kamu-bisa)
2. [🧰 Yang perlu disiapkan](#-yang-perlu-disiapkan)
3. [🏆 Kemenangan Cepat: layar OLED pertamamu, langsung di Wokwi (10 menit)](#-kemenangan-cepat-layar-oled-pertamamu-langsung-di-wokwi-10-menit)
4. [🧠 Konsep "Mengapa"](#-konsep-mengapa)
   - [1 Bus](#1-bus-jalan-pribadi-atau-jalan-tol) · [2 I2C](#2-i2c-dua-kabel-banyak-alamat) · [3 Layar OLED](#3-layar-oled-titik-koordinat-dan-kertas-gambar) · [4 BME280](#4-bme280-tiga-sensor-dalam-satu-kotak-kecil--dan-kembarannya-yang-menipu) · [5 1-Wire](#5-1-wire-banyak-sensor-satu-kabel-dan-nomor-seri) · [6 SPI & microSD](#6-spi-dan-kartu-microsd-lebih-banyak-kabel-lebih-cepat) · [7 Menggabungkan perangkat](#7-menggabungkan-banyak-perangkat-tanpa-saling-mengganggu) · [8 Simbol skematik](#8-membaca-skematik-simbol-simbol-dasar) · [9 Skematik modul relay](#9-membaca-skematik-modul-membedah-modul-relay)
5. [🔧 Praktik langkah demi langkah](#-praktik-langkah-demi-langkah)
   - [1 OLED & pemindai I2C](#praktik-1--layar-oled-dan-pemindai-i2c-35-menit) · [2 Kotak peralatan layar](#praktik-2--kotak-peralatan-layar-huruf-koordinat-dan-ikon-25-menit) · [3 BME280](#praktik-3--bme280-di-bus-yang-sama-30-menit) · [4 DS18B20](#praktik-4--ds18b20-suhu-air-lewat-satu-kabel-30-menit) · [5 microSD (opsional)](#praktik-5--opsional-catatan-csv-di-kartu-microsd-35-menit) · [6 Layar status Node 1 ⭐](#praktik-6--layar-status-node-1-rancanganmu-sendiri-40-menit) · [7 Skematik ⭐](#praktik-7--membaca-skematik-dan-menggambar-ulang-node-1-45-menit) · [8 GitHub](#praktik-8--simpan-ke-github-15-menit)
6. [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)
7. [🔬 Bedah Teknis (opsional)](#-bedah-teknis-opsional)
8. [🧩 Tantangan mandiri](#-tantangan-mandiri)
9. [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini)
10. [📖 Glosarium](#-glosarium) · [📝 Kuis](#-kuis-5-soal) · [✅ Checklist kelulusan](#-checklist-kelulusan-modul-7)
11. [📚 Sumber & atribusi gambar](#-sumber--atribusi-gambar)

---

## 🎯 Setelah modul ini kamu bisa…

- **Menjelaskan mengapa ada bus** dan membedakan tiga bus minggu ini: **I2C** (dua kabel data, setiap perangkat punya alamat), **1-Wire** (satu kabel data, setiap sensor punya nomor seri), dan **SPI** (empat kabel data, setiap perangkat punya kaki "pilih aku").
- **Menyambungkan beberapa perangkat I2C ke dua kabel yang sama** dan menemukan alamatnya dengan pemindai I2C, termasuk membaca alamat heksadesimal seperti `0x3C`.
- **Menampilkan teks, angka besar, garis, batang persen, dan ikon buatanmu sendiri** di layar OLED 128 × 64 titik.
- **Membaca BME280 dan memastikan chip-nya asli**, bukan BMP280 yang dijual dengan nama mirip.
- **Membaca beberapa DS18B20 di satu kabel** lewat nomor serinya dan mengenali dua angka "bohong" khas sensor ini: 85 °C dan −127 °C.
- (Opsional) **Mencatat bacaan ke kartu microSD** sebagai file CSV yang bisa dibuka di laptop.
- **Menggabungkan banyak perangkat tanpa saling mengganggu.**
- **Membaca skematik bersimbol dasar**, termasuk skematik modul relay, dan **menggambar ulang Node 1 sebagai skematik**.

---

## 🧰 Yang perlu disiapkan

| Kebutuhan | Keterangan |
| :--- | :--- |
| **Meja kerja dari Modul 6** | Dua breadboard, papan ESP32, MB102 + adaptor 5 V 2 A + kabel USB A–A, serta semua komponen Node 1 (lima sensor dan semua aktuator). **Biarkan semuanya terpasang.** Minggu ini kita hanya menambah perangkat bus di depan breadboard bawah. |
| **Kit A Tahap 2 — komponen yang mulai dipakai minggu ini** | Layar **OLED 0,96 inci SSD1306 I2C** empat kaki dengan *header* (deretan kaki) tersolder; modul **BME280 I2C** dengan *header* tersolder; sensor **DS18B20 tahan air** beserta **modul adaptornya**; (opsional) **modul microSD SPI** + kartu microSD 4–16 GB. |
| **Kabel jumper** | 2 kabel **jantan–jantan** untuk jembatan bus I2C, dan sekitar 10 kabel **jantan–betina**: 4 untuk layar (terpasang terus), sisanya dipakai bergantian untuk BME280 (4), DS18B20 (3), dan microSD (6). |
| **Resistor 4,7 kΩ** | Dari paket resistor Kit A Tahap 1. Hanya perlu kalau DS18B20-mu tanpa modul adaptor (Praktik 4). |
| **Segelas air + nampan + lap** | Untuk mencelupkan ujung probe DS18B20 (Praktik 4). |
| **Obeng kecil** | Obeng pipih (obeng minus) kecil dari Modul 5, untuk terminal sekrup adaptor DS18B20 (Praktik 4). |
| **Laptop + Arduino IDE 2 + kabel USB data** | Sudah terpasang sejak Modul 2. Library baru dipasang di Praktik 1, 3, dan 4. |
| **Pembaca kartu (*card reader*) microSD** | Opsional, untuk membuka file catatan di laptop (Praktik 5). Banyak laptop punya slot kartu SD; kartu microSD bisa masuk lewat adaptor SD yang biasanya ikut dalam kemasan kartu. |
| **Kertas berpetak (atau kertas biasa) + pensil** | Untuk merancang tata letak layar (Praktik 6) dan menggambar skematik (Praktik 7). Kalau lebih suka menggambar di laptop, kamu juga bisa memakai situs [diagrams.net](https://app.diagrams.net) yang gratis untuk Praktik 7. |
| **Browser + Wokwi** | Untuk Kemenangan Cepat dan untuk mencoba setiap praktik sebelum merakit. |

> [!TIP]
> **Cek isi kiriman Kit A Tahap 2 sebelum mulai.**
>
> - **Layar:** ukurannya **0,96 inci**, chip-nya **SSD1306**, kakinya **empat** (bertuliskan "GND VCC SCL SDA" atau "VCC GND SCL SDA"). Layar **1,3 inci** biasanya memakai chip lain, **SH1106**, yang tidak cocok dengan library minggu ini: gambarnya bergeser atau berantakan. Layar berkaki tujuh adalah versi SPI, juga bukan yang kita pakai.
> - **Layar "dua warna":** banyak layar 0,96 inci menampilkan 16 baris titik teratas dengan warna **kuning** dan sisanya **biru**. Warna itu bawaan kacanya; kode tidak bisa mengubahnya, dan itu bukan kerusakan. Di antara pita kuning dan biru ada celah tipis, jadi huruf yang melintasi batasnya tampak terbelah dua warna. Itu juga bukan kerusakan.
> - **BME280:** penjual sering mengirim **BMP280** (tanpa sensor kelembapan) dengan nama mirip. Belum perlu khawatir; Konsep 4 dan Praktik 3 mengajarkan cara memastikannya.
> - **DS18B20:** versi "modul" atau "adaptor" punya terminal sekrup dan tiga kaki *header*, tinggal colok. Versi kabel telanjang ujungnya berupa serabut kawat yang sulit ditancapkan ke breadboard.

![Kolase Kenali komponen Tahap 2, empat kartu. Satu, foto layar OLED 0,96 inci biru dengan empat kaki bertuliskan GND, VCC, SCL, SDA, sedang menampilkan daftar file; catatan: 128 kali 64 titik, chip SSD1306, bus I2C, urutan kaki bisa berbeda. Dua, foto papan BME280 merah dari SparkFun dengan kotak logam sensor kecil di tengah; catatan: suhu, kelembapan, tekanan, bus I2C, modul di kit biasanya papan ungu bertuliskan GY-BME280, dan sensornya kotak logam persegi kecil. Tiga, foto DS18B20 tahan air: kabel hitam panjang dengan ujung tabung baja dan tiga kawat merah, hitam, dan kuning, ditambah perbesaran ujung ketiga kawat itu; catatan: bus 1-Wire, merah VCC, hitam GND, kuning atau putih DATA, adaptor membuatnya tinggal colok. Empat, ilustrasi modul microSD biru enam kaki bertuliskan GND, VCC, MISO, MOSI, SCK, CS dengan slot kartu; catatan: bus SPI, kartu 4 sampai 16 GB, format FAT32, opsional](aset/kenali-komponen-tahap-2.jpg)

*Foto dari Wikimedia Commons: layar OLED dipotong dari foto Turbospok (CC BY-SA 4.0), BME280 oleh SparkFun (CC BY 2.0), DS18B20 oleh Leonardo Postay (CC BY-SA 4.0); ilustrasi modul microSD dan susunan kolase oleh penulis. Rinciannya di [📚 Sumber & atribusi gambar](#-sumber--atribusi-gambar).*

**Versi yang dipakai di modul ini:**

| Alat | Versi | Catatan |
| :--- | :--- | :--- |
| Arduino IDE | **2.3.x** (saat ditulis: 2.3.10) | Dari Modul 2. |
| Paket papan **esp32 by Espressif Systems** | **3.3.x** (saat ditulis: 3.3.12) | Dari Modul 2. Sudah membawa library **Wire** (I2C), **SPI**, dan **SD**, jadi ketiganya tidak perlu dipasang. |
| Library **Adafruit SSD1306** | **2.5.17** | Dipasang di Praktik 1. |
| Library **Adafruit GFX Library** | **1.12.6** | Pendamping wajib SSD1306; ikut ditawarkan saat memasang SSD1306. |
| Library **Adafruit BusIO** | **1.17.4** | Pendamping wajib GFX dan BME280; ikut ditawarkan. |
| Library **Adafruit BME280 Library** | **2.3.0** | Dipasang di Praktik 3. |
| Library **Adafruit Unified Sensor** | **1.1.15** | Dari Modul 6; dipakai lagi oleh BME280. |
| Library **OneWire** | **2.3.8** | Dipasang di Praktik 4. **Harus dipasang sendiri**: tidak ikut ditawarkan oleh DallasTemperature. |
| Library **DallasTemperature** | **4.0.6** | Dipasang di Praktik 4. |
| Library **DHT sensor library** dan **ESP32Servo** | **1.4.7** dan **3.2.1** | Dari Modul 6 dan 5; dipakai lagi oleh Node 1. |

---

## 🏆 Kemenangan Cepat: layar OLED pertamamu, langsung di Wokwi (10 menit)

Selama enam modul, ESP32 hanya bisa "berbicara" lewat Serial Monitor di laptop. Sekarang ia mendapat layarnya sendiri. Kita mulai di Wokwi supaya kamu langsung melihat hasilnya tanpa merakit apa pun.

> 🖥️ **Alat yang dipakai di bagian ini:** browser, situs [Wokwi](https://wokwi.com). Tidak perlu kit, tidak perlu memasang apa pun.

1. Buka **https://wokwi.com/projects/new/esp32** di browser. Muncul proyek ESP32 kosong: kode di kiri, papan di kanan.
2. Klik kanan tautan [`kode/modul07_oled_pertama/diagram.json`](kode/modul07_oled_pertama/diagram.json) → **Buka di tab baru**, lalu klik tombol **Copy raw file** (ikon dua kotak) di kanan atas isi file itu. Kembali ke tab Wokwi, klik tab **`diagram.json`** di atas editor, pilih semua isinya (**Ctrl + A**), lalu tempel (**Ctrl + V**). Di kanan, papan ESP32 kini menyamping, dan di bawahnya ada layar OLED biru dengan empat kaki. Kabel biru menyambung kaki **SDA** layar ke **D21**, kabel kuning menyambung **SCL** ke **D22**, dan dua kaki lainnya masuk ke simbol daya: ▽ untuk GND dan VCC untuk 3,3 V. Kabel biru dan kuning bersilangan satu kali; memang begitu, alasannya ada di Praktik 1.
3. Klik tab **`sketch.ino`**, hapus isinya, lalu tempel kode ini:

   ```cpp
   // Modul 7 - Kemenangan Cepat: layar OLED pertamamu
   // Layar OLED 0,96" (chip SSD1306, 128 x 64 titik) di bus I2C: SDA ke D21, SCL ke D22.
   // Library: Adafruit SSD1306 2.5.17 (ikut terpasang: Adafruit GFX Library 1.12.6 dan Adafruit BusIO 1.17.4).

   #include <Wire.h>
   #include <Adafruit_GFX.h>
   #include <Adafruit_SSD1306.h>

   const int PIN_SDA = 21;           // D21: jalur data I2C (peta pin kanonik)
   const int PIN_SCL = 22;           // D22: jalur detak I2C (peta pin kanonik)
   const byte ALAMAT_LAYAR = 0x3C;   // "alamat rumah" layar di bus I2C

   Adafruit_SSD1306 layar(128, 64, &Wire, -1);  // lebar 128, tinggi 64, lewat bus I2C, tanpa kaki reset

   void setup() {
     Serial.begin(115200);
     Wire.begin(PIN_SDA, PIN_SCL);
     layar.begin(SSD1306_SWITCHCAPVCC, ALAMAT_LAYAR);  // SWITCHCAPVCC: layar membuat tegangan tingginya sendiri

     layar.clearDisplay();               // 1. kosongkan "kertas gambar" di memori ESP32
     layar.setTextColor(SSD1306_WHITE);  //    huruf putih (= titik menyala)
     layar.setTextSize(2);               //    huruf ukuran 2: tinggi 16 titik
     layar.setCursor(0, 0);              //    mulai dari pojok kiri atas
     layar.println("Halo,");             // 2. gambar teksnya
     layar.println("Node 1!");
     layar.display();                    // 3. kirim gambar itu ke layar lewat I2C

     Serial.println("Layar OLED siap.");
     delay(2000);
   }

   void loop() {
     layar.clearDisplay();
     layar.setTextSize(1);
     layar.setCursor(0, 0);
     layar.println("Detik sejak menyala:");
     layar.setTextSize(4);   // angka besar: tinggi 32 titik
     layar.setCursor(0, 20);
     layar.println(millis() / 1000);
     layar.display();
     delay(1000);
   }
   ```

4. Sketsa ini memakai library tambahan, jadi Wokwi perlu tahu daftarnya. Klik tab **Library Manager** → tombol bulat **+** → ketik **Adafruit SSD1306** → klik hasilnya. Setelah tab `libraries.txt` muncul, ganti seluruh isinya dengan isi [`libraries.txt`](kode/modul07_oled_pertama/libraries.txt) dari folder Kemenangan Cepat, yang memuat ketiga library beserta versinya:

   ```text
   # Library untuk sketsa ini (dipakai Wokwi). Di Arduino IDE, pasang lewat Library Manager.
   Adafruit SSD1306@2.5.17
   Adafruit GFX Library@1.12.6
   Adafruit BusIO@1.17.4
   ```

5. Klik tombol hijau **▶**. Pertama kali, Wokwi butuh satu sampai dua menit untuk menyusun program. Setelah itu, layar menampilkan `Halo,` dan `Node 1!` dengan huruf besar selama dua detik. Kemudian tulisan berganti menjadi `Detik sejak menyala:` dengan angka besar di bawahnya yang bertambah setiap detik. Di Serial Monitor (di bawah panel simulasi) muncul dulu beberapa baris pesan bawaan ESP32 saat menyala, misalnya `entry 0x400805dc`; baris dari sketsamu hanya satu, yang terakhir: `Layar OLED siap.`.

![Tangkapan layar Wokwi Kemenangan Cepat, dipotong dan disusun ulang. Kiri atas, rangkaian di panel simulasi: papan ESP32 menyamping dengan layar OLED biru di kanan bawahnya; kabel biru dari D21 ke kaki SDA dan kabel kuning dari D22 ke kaki SCL bersilangan satu kali (penanda 1); kaki VCC ke simbol VCC dan kaki GND ke simbol segitiga, dengan catatan di bawahnya bahwa keduanya simbol daya Wokwi. Kanan atas, dua perbesaran layar: dua detik pertama menampilkan Halo, dan Node 1! dengan huruf besar, lalu tulisan Detik sejak menyala: dengan angka 6 besar di bawahnya. Bawah, Serial Monitor: beberapa baris pesan bawaan ESP32 saat menyala, lalu Layar OLED siap. (penanda 2)](aset/wokwi-oled-pertama.png)

*Tangkapan layar [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), Oktober 2026; dipakai untuk tujuan pendidikan, penanda oleh penulis.*

Selamat — Node 1 punya layar! Perhatikan tiga hal di kode:

- **`layar.begin(SSD1306_SWITCHCAPVCC, ALAMAT_LAYAR)`** menyalakan layar. `0x3C` adalah **alamat** layar di bus I2C, seperti nomor rumah. Bagian `SSD1306_SWITCHCAPVCC` memberi tahu library bahwa layar menaikkan sendiri tegangan 3,3 V menjadi tegangan tinggi yang dibutuhkan titik-titiknya. Konsep 2 menjelaskan alamat, dan Konsep 3 menjelaskan layarnya.
- **Gambar disiapkan dulu, baru dikirim.** `clearDisplay()` mengosongkan "kertas gambar" di memori ESP32, perintah `print` dan teman-temannya menggambar di kertas itu, dan baru `display()` yang mengirim seluruh gambar ke layar. Kalau kamu lupa memanggil `display()`, layar tidak berubah sama sekali.
- **`setTextSize(4)`** membuat angka empat kali lebih besar daripada huruf biasa: tingginya 32 titik, separuh tinggi layar.

Penasaran? Ganti `"Halo,"` dengan namamu, atau ganti `setTextSize(4)` dengan `setTextSize(5)`, lalu klik **▶** lagi. Angka ukuran 5 masih muat untuk tiga digit; coba juga ukuran 8 dan lihat apa yang terjadi saat angkanya lebih lebar daripada layar.

---

## 🧠 Konsep "Mengapa"

Sembilan konsep, satu per bagian — **tidak perlu dibaca sekaligus**. Konsep dan praktik dikerjakan berselang-seling dengan urutan ini:

1. Konsep 1–2 → Praktik 1 (layar OLED dan pemindai I2C)
2. Konsep 3 → Praktik 2 (kotak peralatan layar)
3. Konsep 4 → Praktik 3 (BME280)
4. Konsep 5 → Praktik 4 (DS18B20)
5. Konsep 6 → Praktik 5 (catatan microSD, opsional)
6. Konsep 7 → Praktik 6 (layar status Node 1)
7. Konsep 8–9 → Praktik 7–8 (skematik dan GitHub)
8. 🧩 Tantangan → ➕ Rumah Pintar Mini → 📝 Kuis → ✅ Checklist

Di setiap titik pindah ada kotak ➡️ (maju ke praktik) dan ⬆️ (kembali ke konsep) yang tautannya tinggal diklik.

> 🖥️ **Perlu mencoba kode di bagian Konsep?** Tidak wajib — semua kode akan kamu jalankan di Praktik. Kode di bagian Konsep hanya potongan; versi utuhnya ada di sketsa Praktik, yang bisa dicoba di Wokwi dengan `diagram.json` dari folder [`kode/`](kode/), persis seperti Kemenangan Cepat.

### 1. Bus: jalan pribadi atau jalan tol?

Sampai Modul 6, setiap komponen mendapat **jalan pribadi**: satu atau dua pin ESP32 yang hanya dipakai komponen itu. Misalnya, LED status di D4, DHT22 di D14, PIR di D34, dan seterusnya. Cara ini mudah dipahami, tetapi boros. Node 1 sudah memakai 13 pin, padahal pin yang aman hanya sekitar 22 (Modul 5).

Sekarang bayangkan layar OLED. Layar itu punya 128 × 64 = 8.192 titik cahaya. Tidak mungkin setiap titik mendapat pin sendiri. Karena itu, perangkat yang datanya banyak "mengobrol" dengan ESP32 lewat beberapa kabel saja, dan kabel-kabel itu boleh dipakai bersama oleh perangkat lain. Kabel bersama inilah yang disebut **bus**.

Bus mirip **jalan tol**. Satu jalan dipakai banyak kendaraan, ada aturan siapa yang boleh lewat, dan setiap tujuan punya "pintu keluar" sendiri. Di bus, aturannya sederhana: ESP32 yang mengatur lalu lintas, dan hanya satu perangkat yang boleh berbicara pada satu waktu. Perangkat tujuan dipilih dengan salah satu dari tiga cara: lewat **alamat**, lewat **nomor seri**, atau lewat **kabel "pilih aku"** khusus.

![Diagram dua panel. Kiri, Jalan pribadi seperti Modul 5 dan 6: ESP32 dengan empat garis terpisah, D4 ke LED status, D14 ke DHT22, D34 ke PIR, serta D32 dan D33 ke relay; catatan: satu perangkat memakai satu pin atau lebih, jadi pin cepat habis. Kanan, Jalan tol alias bus di Modul 7: ESP32 dengan dua garis, SDA dari D21 dan SCL dari D22, yang dipakai bersama oleh layar OLED beralamat 0x3C, BME280 beralamat 0x76, dan kotak putus-putus untuk perangkat berikutnya beralamat 0x??; catatan: dua kabel untuk semua, setiap perangkat punya nomor rumah. Di bawahnya, tabel tiga bus minggu ini: I2C dengan dua kabel data, SDA dan SCL, memilih lewat alamat 7-bit misalnya 0x3C, 100 sampai 400 ribu bit per detik, untuk layar OLED dan BME280; 1-Wire dengan satu kabel DATA, memilih lewat nomor seri 64-bit, sekitar 16 ribu bit per detik, untuk DS18B20; SPI dengan empat kabel, SCK, MOSI, MISO, dan CS, memilih lewat kabel CS sendiri, jutaan bit per detik, untuk kartu microSD](aset/bus-jalan-tol.png)

Minggu ini kamu memakai tiga bus:

| | **I2C** | **1-Wire** | **SPI** |
| :--- | :--- | :--- | :--- |
| Kabel data | 2: SDA dan SCL | 1: DATA (disebut juga DQ) | 4: SCK, MOSI, MISO, CS |
| Cara memilih perangkat | **alamat** 7-bit, misalnya `0x3C` | **nomor seri** 64-bit dari pabrik | kabel **CS** ("pilih aku") sendiri untuk setiap perangkat |
| Perkiraan kecepatan | 100–400 ribu bit per detik | sekitar 16 ribu bit per detik | jutaan bit per detik |
| Dipakai minggu ini untuk | layar OLED, BME280 | DS18B20 | kartu microSD |

Selain kabel data, setiap perangkat tetap butuh **daya**, yaitu VCC dan GND. Ada satu "bus" lagi yang sebenarnya sudah kamu pakai sejak Modul 2 tanpa kamu sadari: **UART**, jalur `Serial` ke laptop. UART hanya menyambung dua perangkat, jadi bukan bus sungguhan; ceritanya ada di 🔬.

### 2. I2C: dua kabel, banyak alamat

**I2C** (dibaca *ai-squared-si* atau *ai-tu-si*) memakai dua kabel data:

- **SCL** (*serial clock*, detak): ESP32 mengirim ketukan teratur di kabel ini, seperti penabuh drum yang memberi tempo.
- **SDA** (*serial data*, data): pada setiap ketukan, satu bit data lewat di kabel ini, dari ESP32 ke perangkat atau sebaliknya.

Di ESP32 DevKit V1, I2C memakai **D21 untuk SDA** dan **D22 untuk SCL**. Pasangan ini sudah dipesan sejak Modul 5 di `PETA-PIN.md`, dan di kode ditulis dengan `Wire.begin(21, 22)`. `Wire` adalah nama library I2C bawaan paket esp32.

**Alamat.** Setiap perangkat I2C punya alamat 7-bit, yaitu angka 0 sampai 127, seperti nomor rumah di sebuah jalan. Perangkat biasa memakai alamat 8 sampai 119 (`0x08`–`0x77`); sisanya dicadangkan untuk keperluan khusus. Layar OLED biasanya beralamat `0x3C`, sedangkan BME280 beralamat `0x76` atau `0x77`. Saat ESP32 ingin berbicara dengan layar, ia "memanggil" alamat `0x3C` lewat SDA. Semua perangkat mendengar panggilan itu, tetapi hanya pemilik alamat yang menjawab "ya, saya di sini". Jawaban pendek itu disebut **ACK** (*acknowledge*). Akibatnya, **dua perangkat dengan alamat sama tidak boleh berada di satu bus**: keduanya akan menjawab bersamaan, persis seperti dua rumah bernomor sama yang membingungkan kurir.

**Mengapa ditulis `0x3C`, bukan 60?** Awalan `0x` menandai angka **heksadesimal** (basis 16). Sistem bilangan ini memakai enam belas lambang, yaitu 0–9 lalu A–F (A = 10, B = 11, …, F = 15). Lembar data hampir selalu menulis alamat dengan cara ini karena setiap digit heksadesimal tepat mewakili empat bit. Cara mengubahnya ke angka biasa: digit kiri dikalikan 16, lalu ditambah digit kanan.

| Ditulis | Hitungannya | Angka biasa | Siapa? |
| :--- | :--- | ---: | :--- |
| `0x3C` | 3 × 16 + 12 (C) | 60 | layar OLED |
| `0x76` | 7 × 16 + 6 | 118 | BME280 (kaki SDO ke GND) |
| `0x77` | 7 × 16 + 7 | 119 | BME280 (kaki SDO ke VCC) |

Di kode, `0x3C` dan `60` sama persis artinya; kita memakai `0x3C` supaya cocok dengan lembar data.

**Resistor *pull-up*.** Perangkat I2C tidak pernah "mendorong" kabel SDA atau SCL ke 3,3 V. Perangkat itu hanya bisa **menarik kabel ke 0 V** atau melepaskannya. Yang mengembalikan kabel ke 3,3 V saat semua perangkat melepaskannya adalah dua resistor *pull-up*, yaitu resistor dari SDA dan SCL ke VCC. Cara kerjanya seperti pegas pintu yang menutup pintu sendiri setelah dilepas. Hampir semua modul layar dan sensor I2C sudah membawa resistor ini. Karena resistor itu biasanya tersambung ke kaki VCC modul, **modul I2C kita selalu diberi 3,3 V**: kalau diberi 5 V, SDA dan SCL ikut tertarik ke 5 V dan pin ESP32 bisa rusak.

![Diagram bus I2C. Di kiri, ESP32 sebagai pengendali bus, dengan D21 untuk SDA (data) dan D22 untuk SCL (detak). Dua garis bus horizontal, SDA biru dan SCL kuning, masing-masing ditarik ke 3,3 volt oleh resistor pull-up; catatan di kanan atas: resistor pull-up biasanya sudah ada di modul dan mengembalikan kabel ke 3,3 volt, sedangkan perangkat hanya menarik kabel ke 0 volt; VCC dan GND setiap perangkat tidak digambar. Di bawah bus menggantung dua perangkat: layar OLED beralamat 0x3C dan BME280 beralamat 0x76. Gelembung percakapan di bawah bus: ESP32 bertanya, 0x3C, ada?; di bawah layar, ACK: ya, saya di sini; di bawah BME280, diam: bukan alamatku. Paling bawah, kotak membaca heksadesimal: 0x3C sama dengan 3 kali 16 ditambah 12 (C) sama dengan 60, 0x76 sama dengan 118, dan 0x77 sama dengan 119; A sampai F berarti 10 sampai 15, dan awalan 0x menandai angka heksadesimal](aset/i2c-alamat.png)

**Pemindai I2C.** Kalau kamu tidak tahu alamat sebuah modul, ESP32 bisa "mengetuk" setiap alamat dari 1 sampai 126 satu per satu (alamat 0 dan 127 punya tugas khusus, jadi tidak perlu diketuk) dan mencatat mana yang menjawab. Inti sketsanya hanya dua baris:

```cpp
Wire.beginTransmission(alamat);         // ketuk pintu alamat ini
byte jawaban = Wire.endTransmission();  // 0 = ada yang menjawab "ya, saya di sini"
```

Pemindai inilah alat pertama yang dipakai teknisi saat sebuah modul I2C "tidak mau jalan". Kalau pemindai tidak menemukan apa pun, masalahnya hampir pasti di kabel, daya, atau modulnya sendiri (misalnya layar versi SPI berkaki tujuh atau modul yang rusak), bukan di kode layar.

**Kabel jembatan di breadboard.** Kaki D21 dan D22 ada di deretan kaki **bawah** papan ESP32, di lubang 14b dan 17b breadboard bawah. Lubang yang pasti bebas di jalurnya hanya baris d dan e (baris c kadang tertutup tepi papan, seperti di Modul 5), jadi tidak cukup untuk banyak perangkat. Supaya beberapa perangkat I2C bisa menancap dengan rapi, kita membuat "jalan tol" sendiri di breadboard bawah dengan dua kabel jembatan: **jalur 19 (baris f–j) menjadi SCL** dan **jalur 20 (baris f–j) menjadi SDA**. Setiap perangkat I2C cukup menancapkan kabel SCL-nya di jalur 19 dan SDA-nya di jalur 20. Praktik 1 menunjukkan caranya.

**I2C untuk jarak dekat.** I2C dirancang untuk perangkat di dalam satu papan atau satu kotak. Dengan kabel jumper biasa, usahakan seluruh bus tidak lebih panjang daripada sekitar 50 cm. Kabel yang terlalu panjang membuat bacaan kadang gagal.

> ➡️ **Siap praktik?** Lanjut ke [Praktik 1 — Layar OLED dan pemindai I2C](#praktik-1--layar-oled-dan-pemindai-i2c-35-menit). Setelah selesai, kembali ke [Konsep 3](#3-layar-oled-titik-koordinat-dan-kertas-gambar).

### 3. Layar OLED: titik, koordinat, dan "kertas gambar"

**OLED** (*organic light-emitting diode*) adalah layar yang setiap titiknya memancarkan cahaya sendiri, tanpa lampu latar. Akibatnya, bagian yang hitam benar-benar hitam, dan tulisan tetap jelas walaupun layarnya kecil. Layar kita punya **128 × 64 titik**. Setiap titik hanya bisa menyala atau padam; tidak ada warna lain. Di belakang kacanya ada chip **SSD1306** yang mengatur semua titik itu, dan chip inilah yang diajak bicara oleh ESP32 lewat I2C di alamat `0x3C`.

**Koordinat.** Setiap titik punya koordinat (x, y). Titik (0, 0) ada di **pojok kiri atas**. Nilai x bertambah ke kanan sampai 127, sedangkan nilai y bertambah **ke bawah** sampai 63. Arah y ini kebalikan dari grafik pelajaran matematika di sekolah, jadi sering membingungkan pada awalnya.

**"Kertas gambar" di memori.** Library Adafruit menyimpan salinan semua 8.192 titik di memori ESP32. Salinan ini disebut *buffer* (penyangga). Setiap titik cukup disimpan sebagai 1 bit (menyala atau padam), dan 8 bit = 1 byte, jadi salinan itu hanya 1.024 byte. Semua perintah gambar hanya mengubah salinan ini. Layar baru berubah saat `display()` dipanggil dan seluruh salinan dikirim lewat I2C. Pola ini sudah kamu lihat di Kemenangan Cepat:

```cpp
layar.clearDisplay();   // 1. kosongkan kertas gambar
layar.setCursor(0, 0);  // 2. gambar sebanyak apa pun...
layar.print("28.5");
layar.display();        // 3. ...lalu kirim sekali ke layar
```

Karena gambar dikirim sekaligus, layar tidak berkedip walaupun kamu menggambar puluhan benda. Sebaliknya, kalau kamu lupa memanggil `display()`, layar tidak berubah sama sekali.

**Huruf.** Huruf bawaan library menempati kotak **6 × 8 titik** (5 titik huruf + 1 titik jarak). `setTextSize(n)` memperbesar kotak itu n kali:

| Ukuran | Satu huruf | Muat per baris | Muat per layar |
| :---: | :---: | :---: | :---: |
| 1 | 6 × 8 titik | 21 huruf | 8 baris |
| 2 | 12 × 16 titik | 10 huruf | 4 baris |
| 3 | 18 × 24 titik | 7 huruf | 2 baris |
| 4 | 24 × 32 titik | 5 huruf | 2 baris |

`setCursor(x, y)` menentukan **pojok kiri atas** huruf pertama. Pada ukuran 1, huruf ke-22 dan seterusnya akan turun ke baris berikutnya, jadi rancang teksmu supaya muat.

**Bentuk.** Selain huruf, library menyediakan garis (`drawLine`), kotak (`drawRect` untuk bingkai, `fillRect` untuk kotak penuh), dan lingkaran (`drawCircle`). Dengan `drawRect` dan `fillRect`, kamu bisa membuat **batang persen** seperti indikator baterai ponsel.

**Tanda derajat.** Huruf di layar ini mengikuti tabel huruf komputer lama bernama **CP437**. Tanda ° ada di nomor 248 sehingga tanda itu ditulis dengan `layar.write(248)`, bukan `print("°")`. Kalau kamu mengetik `°` langsung di kode, layar menampilkan dua huruf aneh: di kode, tanda itu tersimpan sebagai dua byte. Supaya nomor 248 benar-benar ° di library ini, panggil `layar.cp437(true)` sekali di `setup()`.

**Ikon.** Ikon kecil dibuat dari **gambar biner** (*bitmap*): setiap baris titik ditulis sebagai angka biner, dengan 1 berarti menyala dan 0 berarti padam. Ikon 8 × 8 berarti delapan angka, masing-masing delapan digit. Kamu bisa merancangnya di kertas berpetak, lalu menyalinnya baris demi baris:

```cpp
const unsigned char IKON_MATAHARI[] = {
  0b00011000,  //    ##
  0b01000010,  //  #    #
  0b00111100,  //   ####
  0b10111101,  // # #### #
  0b10111101,  // # #### #
  0b00111100,  //   ####
  0b01000010,  //  #    #
  0b00011000,  //    ##
};
layar.drawBitmap(0, 0, IKON_MATAHARI, 8, 8, SSD1306_WHITE);  // gambar di (0, 0), ukuran 8 x 8
```

**Tulisan terbalik.** Kotak putih (`fillRect`) yang ditulisi huruf hitam (`setTextColor(SSD1306_BLACK)`) langsung menarik perhatian. Cara ini cocok untuk peringatan seperti "ADA ORANG".

![Diagram layar OLED 128 kali 64 titik. Kiri atas, kisi koordinat: titik nol koma nol di pojok kiri atas, x bertambah ke kanan dari 0 sampai 127, panah y ke bawah, pojok kanan bawah 127 koma 63, dan titik contoh 64 koma 32 di tengah; pita 16 baris teratas diberi catatan pita kuning pada layar dua warna. Kanan atas, ukuran huruf setTextSize: ukuran 1 sebesar 6 kali 8 titik, ukuran 2 sebesar 12 kali 16 titik, dan ukuran 3 sebesar 18 kali 24 titik; titik merah di pojok kiri atas setiap kotak adalah setCursor. Tengah, kertas gambar atau buffer di memori ESP32, 128 kali 64 titik kali 1 bit sama dengan 1.024 byte, dalam tiga langkah: satu, clearDisplay mengosongkan kertas; dua, print, drawLine, fillRect, dan perintah lain menggambar sebanyak apa pun; tiga, display mengirim seluruh kertas lewat I2C. Bawah, ikon matahari 8 kali 8 pada kisi berpetak, di sampingnya delapan baris angka biner yang sama dengan IKON_MATAHARI di kode, dengan 1 berarti titik menyala dan 0 padam, perintah drawBitmap(0, 0, IKON_MATAHARI, 8, 8, SSD1306_WHITE), dan saran: hitamkan kotak yang ingin kamu nyalakan di kertas berpetak, lalu tulis setiap baris dari kiri ke kanan sebagai 0 dan 1](aset/oled-koordinat.png)

**Merancang layar yang enak dibaca.** Layar kecil cepat penuh, jadi pakailah tiga aturan sederhana ini:

1. **Yang paling penting paling besar.** Suhu dan kelembapan, misalnya, ditulis dengan angka besar, sedangkan satuannya cukup kecil.
2. **Rapikan kolom.** Taruh nama di kiri, angka rata kanan, dan batang di paling kanan supaya mata tidak perlu mencari-cari.
3. **Rencanakan kasus terburuk.** Angka terpanjang (misalnya `-40.0` atau `100%`) dan bacaan yang gagal (`--`) harus tetap muat dan tidak saling menindih.

Kalau layarmu dua warna, taruh judul atau angka utama di **16 baris teratas** yang berwarna kuning.

> ➡️ **Siap praktik?** Lanjut ke [Praktik 2 — Kotak peralatan layar: huruf, koordinat, dan ikon](#praktik-2--kotak-peralatan-layar-huruf-koordinat-dan-ikon-25-menit). Setelah selesai, kembali ke [Konsep 4](#4-bme280-tiga-sensor-dalam-satu-kotak-kecil--dan-kembarannya-yang-menipu).

### 4. BME280: tiga sensor dalam satu kotak kecil — dan kembarannya yang menipu

**BME280** buatan Bosch mengukur tiga hal sekaligus: **suhu**, **kelembapan udara**, dan **tekanan udara**. Sensornya hanya sebesar 2,5 × 2,5 mm dan dipasang di modul kecil yang bisa berbicara lewat I2C. Dalam proyek kita, BME280 nanti dipasang di **Node 2 di kebun** (Modul 14). Minggu ini kamu berlatih memakainya dulu di Node 1, di samping DHT22.

| Besaran | Rentang | Akurasi (lembar data) | Satuan di kode |
| :--- | :--- | :--- | :--- |
| Suhu | −40 sampai +85 °C | ±1 °C | °C dari `readTemperature()` |
| Kelembapan relatif | 0–100 % | ±3 % | % dari `readHumidity()` |
| Tekanan udara | 300–1.100 hPa | ±1 hPa | paskal dari `readPressure()`, dibagi 100 menjadi hPa |

**Tekanan udara** adalah berat udara di atas sensor. Di tepi pantai, nilainya sekitar 1.013 hPa (hektopaskal), dan makin ke atas makin kecil: kira-kira **berkurang 12 hPa setiap naik 100 meter**. Karena itu, BME280 di Bandung atau Malang menunjukkan angka yang jauh lebih kecil daripada di Jakarta atau Surabaya. Perubahan tekanan dalam beberapa jam juga bisa menjadi tanda cuaca berubah.

**Dua kemungkinan alamat.** BME280 bisa beralamat `0x76` atau `0x77`, bergantung pada sambungan kaki **SDO**-nya di modul. Modul ungu bertuliskan "GY-BME280" biasanya `0x76`; modul Adafruit biasanya `0x77`. Sketsa Praktik 3 mencoba keduanya, jadi kamu tidak perlu menebak.

**Kembaran yang menipu: BMP280.** Bosch juga membuat **BMP280**, sensor yang hanya mengukur suhu dan tekanan, **tanpa kelembapan**. Modulnya hampir sama persis, alamatnya sama (`0x76`/`0x77`), dan penjual sering menulis keduanya sebagai "BME/BMP280". Untungnya, setiap chip Bosch punya **chip ID**: satu angka di dalam chip yang bisa dibaca seperti kartu identitas.

| Chip | Chip ID | Mengukur |
| :--- | :---: | :--- |
| **BME280** | `0x60` | suhu, kelembapan, tekanan |
| BMP280 | `0x58` (contoh awal pabrik: `0x56` atau `0x57`) | suhu, tekanan |
| BMP180 | `0x55` | suhu, tekanan (generasi lama) |
| BME680 | `0x61` | suhu, kelembapan, tekanan, gas |

Library Adafruit membaca chip ID ini saat `bme.begin()` dan **menolak** chip yang ID-nya bukan `0x60`. ID yang terbaca bisa dilihat dengan `bme.sensorID()`. Ada juga ciri yang kasatmata walaupun tidak selalu mudah dilihat tanpa kaca pembesar: kotak logam BME280 **persegi** (2,5 × 2,5 mm), sedangkan kotak logam BMP280 **persegi panjang** (2,0 × 2,5 mm).

![Perbandingan BME280 dan BMP280 berjudul Lihat bentuk kotak logamnya; keduanya buatan Bosch dan bisa memakai alamat I2C yang sama, 0x76 atau 0x77. Kiri, foto makro chip BME280 di atas papan modul: kotak logam persegi 2,5 kali 2,5 mm dengan lubang kecil di tutupnya tempat udara masuk, chip ID 0x60, mengukur suhu, kelembapan, dan tekanan; aslinya kotak ini lebih kecil daripada butir beras. Kanan, foto modul BMP280 biru dengan lingkaran merah pada kotak logam sensornya: persegi panjang 2,0 kali 2,5 mm, chip ID 0x58, mengukur suhu dan tekanan tanpa kelembapan; catatan: tulisan di papan modul, misalnya GY-BMP280, bisa tidak cocok dengan chip yang benar-benar terpasang. Bawah, kotak cara paling pasti: jalankan sketsa Praktik 3; chip ID 0x60 berarti sensormu asli BME280, sedangkan chip ID 0x58 berarti BMP280 yang hanya membaca suhu dan tekanan](aset/bme-vs-bmp.jpg)

*Foto: chip BME280 oleh Laserlicht (CC BY-SA 4.0) dan modul BMP280 oleh AGermanBeck (CC BY-SA 4.0), Wikimedia Commons; label oleh penulis.*

**DHT22 atau BME280?** Keduanya mengukur suhu dan kelembapan. BME280 lebih cepat bereaksi, lebih stabil, dan bisa membaca tekanan sehingga lebih cocok untuk Node 2 di luar ruangan. DHT22 tetap bertugas di Node 1. Di Praktik 3, keduanya dibaca berdampingan supaya kamu bisa melihat bahwa dua sensor yang sama-sama sehat jarang menunjukkan angka yang persis sama. Selisih sekitar 1 °C dan beberapa persen kelembapan masih wajar karena masing-masing punya batas akurasi.

**Jauhkan dari benda hangat.** Sensor suhu mengukur udara **di dekatnya**. Kalau modul BME280 menempel pada papan ESP32 atau regulator yang hangat, suhunya terbaca terlalu tinggi. Letakkan modulnya beberapa sentimeter dari papan.

> ➡️ **Siap praktik?** Lanjut ke [Praktik 3 — BME280 di bus yang sama](#praktik-3--bme280-di-bus-yang-sama-30-menit). Setelah selesai, kembali ke [Konsep 5](#5-1-wire-banyak-sensor-satu-kabel-dan-nomor-seri).

### 5. 1-Wire: banyak sensor, satu kabel, dan nomor seri

**1-Wire** adalah bus yang paling hemat: hanya **satu kabel data** (ditambah GND dan biasanya VCC). Sensor 1-Wire yang paling terkenal adalah **DS18B20**, sensor suhu yang sering dijual dalam **probe tahan air**: chip mungilnya dibungkus tabung baja, lalu disambungkan ke kabel panjang. Probe ini cocok untuk mengukur suhu air tandon atau suhu tanah, dan nanti dipasang di Node 2.

| | DS18B20 |
| :--- | :--- |
| Rentang | −55 sampai +125 °C |
| Akurasi | ±0,5 °C (pada −10 sampai +85 °C) |
| Kehalusan | 0,0625 °C pada resolusi 12-bit |
| Waktu ukur | sampai 750 ms pada resolusi 12-bit |
| Daya | 3,0–5,5 V; di proyek kita **selalu 3,3 V** |

**Nomor seri dari pabrik.** Setiap DS18B20 punya **nomor seri 64-bit** yang tertanam sejak dibuat, dan tidak ada dua sensor yang nomornya sama. Nomor itu ditulis sebagai delapan pasang angka heksadesimal, misalnya `28-FF-64-1E-0F-6A-D3-3C`. Pasangan pertama (`28`) adalah kode keluarga DS18B20, enam pasangan berikutnya nomor seri sesungguhnya, dan pasangan terakhir angka pemeriksa (CRC, *cyclic redundancy check*) untuk mendeteksi data yang rusak di jalan. Jadi, kalau di satu kabel ada tiga probe (misalnya di tandon, di pot, dan di luar), ESP32 bisa bertanya ke masing-masing lewat nomor serinya.

**Resistor *pull-up* 4,7 kΩ.** Seperti I2C, kabel DATA hanya ditarik ke 0 V oleh perangkat; yang mengembalikannya ke 3,3 V adalah resistor 4,7 kΩ dari DATA ke VCC. **Modul adaptor** DS18B20 sudah membawa resistor ini. Kalau probe-mu tanpa adaptor, resistornya harus kamu pasang sendiri (lihat Praktik 4).

**Cara membaca: semua mengukur bersamaan, lalu ditanya satu per satu.**

```cpp
sensorSuhu.requestTemperatures();                // serukan kepada SEMUA sensor: "ukur sekarang!" (sampai 750 ms)
float suhu = sensorSuhu.getTempC(nomorSeri[0]);  // tanya satu sensor lewat nomor serinya
```

Ada dua library yang bekerja berlapis. **OneWire** mengurus "bahasa kabel" 1-Wire, sedangkan **DallasTemperature** menerjemahkan bahasa itu menjadi perintah yang mudah, seperti `requestTemperatures()` dan `getTempC()`. Keduanya harus terpasang. Jebakannya: saat modul ini ditulis, DallasTemperature 4.0.6 **tidak menawarkan** OneWire sebagai pendamping, jadi OneWire harus dipasang sendiri (Praktik 4).

**Dua angka "bohong" yang perlu kamu hafal.**

- **85,00 °C** adalah angka bawaan di dalam sensor yang **baru menyala** dan belum sempat mengukur. Angka ini muncul lagi setiap kali sensor menyala ulang, misalnya karena dayanya terputus-putus atau terlalu lemah.
- **−127 °C** bukan suhu sama sekali, melainkan tanda dari library bahwa bacaannya **tidak bisa dipercaya**. Nama resminya `DEVICE_DISCONNECTED_C`. Penyebab paling umum: sensor tidak menjawab karena kabelnya lepas, *pull-up*-nya tidak ada, atau sensornya rusak.

Ada satu kejutan. DallasTemperature 4.0.6 sudah mengenali angka bawaan 85,00 °C (juga tanda daya kurang) dari isi memori sensor, lalu melaporkannya sebagai **−127**. Jadi, dengan library minggu ini, sensor yang baru menyala ulang pun biasanya muncul sebagai −127; angka 85,00 °C mentah hanya sesekali lolos, misalnya pada sensor tiruan. Sketsa Praktik 4 tetap menangkap kedua angka itu dan menulis pesan yang jelas, sesuai semangat Konsep 11 Modul 6: sensor yang berbohong harus **ditandai**, bukan dipercaya begitu saja.

![Diagram bus 1-Wire. Di kiri, ESP32 dengan kaki RX2, GPIO 16. Satu garis DATA (DQ) ungu memanjang ke kanan, ditarik ke 3,3 volt oleh resistor pull-up 4,7 kiloohm. Tiga probe DS18B20 menggantung di garis itu: probe tandon, probe pot, dan probe luar, masing-masing dengan nomor seri berbeda, misalnya 28-FF-64-1E-0F-6A-D3-3C; catatan kecil: VCC dan GND setiap probe tidak digambar. Kotak di bawahnya membedah nomor itu: 28 adalah kode keluarga DS18B20, enam pasangan tengah nomor seri, dan pasangan terakhir, 3C, angka pemeriksa CRC. Kiri bawah, kotak cara membaca: satu, requestTemperatures, semua sensor mengukur bersamaan paling lama 750 milidetik; dua, getTempC dengan nomor seri, sensor ditanya satu per satu. Paling bawah, kotak dua angka bohong: 85,00 derajat Celsius adalah isi bawaan sensor yang baru menyala, dan library 4.0.6 biasanya melaporkannya sebagai minus 127; minus 127 derajat Celsius berarti bacaan tidak bisa dipercaya karena kabel lepas, tanpa pull-up, sensor rusak, atau sensor baru menyala ulang](aset/onewire-ds18b20.png)

**Warna kabel probe.** Kebanyakan probe memakai **merah = VCC**, **hitam = GND**, dan **kuning** (kadang putih) **= DATA**. Tetap cocokkan dengan tulisan di adaptor atau keterangan penjual karena ada pabrik yang memakai warna lain.

**Mengapa di RX2 (GPIO 16)?** Di Node 1, GPIO 16 dan 17 (RX2 dan TX2) dipesan untuk RS-485 di Modul 15. Sampai saat itu, GPIO 16 boleh **dipinjam** untuk latihan DS18B20, sesuai catatan di `PETA-PIN.md`. Di Node 2, DS18B20 nanti mendapat pin tetapnya sendiri, yaitu GPIO 27.

> ➡️ **Siap praktik?** Lanjut ke [Praktik 4 — DS18B20: suhu air lewat satu kabel](#praktik-4--ds18b20-suhu-air-lewat-satu-kabel-30-menit). Setelah selesai, kembali ke [Konsep 6](#6-spi-dan-kartu-microsd-lebih-banyak-kabel-lebih-cepat).

### 6. SPI dan kartu microSD: lebih banyak kabel, lebih cepat

**SPI** (*serial peripheral interface*) memakai empat kabel data; imbalannya, kecepatannya tinggi:

| Kabel | Kepanjangan | Tugas | Pin ESP32 kita |
| :--- | :--- | :--- | :--- |
| **SCK** | *serial clock* | detak dari ESP32 | D18 |
| **MOSI** | *master out, slave in* | data **dari** ESP32 **ke** perangkat | D23 |
| **MISO** | *master in, slave out* | data **dari** perangkat **ke** ESP32 | D19 |
| **CS** | *chip select* | "pilih aku": `LOW` = perangkat ini yang diajak bicara | D5 |

Keempat pin itu adalah pin SPI bawaan ESP32, dan sudah dipesan untuk microSD di `PETA-PIN.md` sejak Modul 5. Kalau ada beberapa perangkat SPI, ketiga kabel pertama dipakai bersama, sedangkan setiap perangkat mendapat **kabel CS sendiri**. Perangkat yang CS-nya `HIGH` diam saja, seperti murid yang namanya tidak dipanggil. Di beberapa modul dan lembar data, MOSI dan MISO ditulis dengan nama lain: **DI** (*data in*) dan **DO** (*data out*) dilihat dari sisi kartu, atau **SDI**/**SDO**. Wokwi memakai nama DI dan DO.

**Kartu microSD** cocok diajak bicara lewat SPI karena data yang disimpan bisa banyak. Kartu ini bekerja dengan **3,3 V**. Modul microSD enam kaki yang umum dijual membawa dua "penolong":

- **regulator** yang menurunkan 5 V menjadi 3,3 V untuk kartu sehingga kaki VCC modul ini justru **butuh 5 V**;
- **penerjemah tegangan** di jalur data sehingga sinyal ke ESP32 tetap 3,3 V.

Ada juga modul tanpa regulator yang langsung diberi 3,3 V. Cara membedakannya: modul beregulator punya chip regulator berkaki tiga dengan satu sirip lebar (biasanya bertuliskan "AMS1117-3.3") dan satu chip lagi berkaki banyak, yaitu penerjemah tegangannya. Praktik 5.2 memandumu memeriksanya. Kalau masih ragu, pilih 3,3 V dulu: pilihan itu tidak merusak apa pun, paling-paling kartunya tidak terbaca.

**Isi kartu: file dan folder.** Seperti *flashdisk* (diska lepas), kartu memakai **sistem file**, yaitu cara menata data supaya laptop bisa membacanya. Library **SD** di ESP32 membaca kartu berformat **FAT32**. Kartu 4–16 GB biasanya sudah berformat FAT32 dari pabrik; kartu 64 GB ke atas biasanya berformat exFAT dan perlu diformat ulang, jadi pakailah kartu 4–16 GB seperti saran Silabus. Kode untuk menulis satu baris ke file terlihat seperti ini:

```cpp
File file = SD.open("/catatan.csv", FILE_APPEND);  // nama file selalu diawali "/"
file.println("15,3094");                           // tulis satu baris
file.close();                                      // WAJIB: baru setelah ditutup, isinya tersimpan
```

`FILE_APPEND` berarti "tambahkan di akhir"; isi lama tidak hilang. Baris yang belum di-`close()` bisa hilang kalau listrik tiba-tiba putus.

**CSV: tabel dalam bentuk teks.** **CSV** (*comma-separated values*) adalah file teks biasa yang setiap barisnya berisi satu catatan, dan kolom-kolomnya dipisahkan dengan koma. Baris pertama berisi nama kolom:

```text
uptime_s,cahaya
6,3094
11,3102
16,1450
```

File seperti ini bisa dibuka di Notepad atau dimasukkan ke program lembar kerja seperti Excel dan Google Sheets, lalu dibuat grafiknya. Kolom `uptime_s` berisi **detik sejak papan menyala**; namanya sama dengan kolom `uptime_s` di kontrak data (Lampiran A Silabus). Karena papan belum punya jam sungguhan, angka ini kembali ke nol setiap kali papan menyala ulang. Di Modul 10, ESP32 mengambil jam dari internet dan kolom ini diganti dengan waktu sungguhan.

![Diagram SPI dan modul microSD. Kiri, ESP32 dengan empat kabel berpanah: SCK, detak, dari D18 ke modul; MOSI dari D23, dari ESP32 ke kartu; MISO dari kartu ke D19; dan CS dari D5, LOW berarti pilih aku. Tengah, kotak modul microSD beregulator berisi regulator 5 volt ke 3,3 volt, penerjemah tegangan, dan kartu microSD 3,3 volt berformat FAT32; catatan di bawahnya: VCC modul ini 5 volt dari MB102 di rel atas, sedangkan modul tanpa regulator diberi 3,3 volt dari rel bawah. Kanan atas, catatan.csv dibuka di Notepad: baris judul uptime_s koma cahaya, lalu 6,3094; 11,3102; 16,1450; dan 21,3088. Kanan bawah, file yang sama dibuka di lembar kerja sebagai grafik garis cahaya yang turun sesaat saat LDR ditutup tangan. Bawah, kotak Ingat: kalau ada beberapa perangkat SPI, SCK, MOSI, dan MISO dipakai bersama dan setiap perangkat punya CS sendiri; nama file selalu diawali garis miring, FILE_APPEND menambah di akhir, dan close() wajib supaya tersimpan; uptime_s adalah detik sejak papan menyala, kembali ke 0 setiap restart, dan jam sungguhan datang di Modul 10](aset/spi-microsd.png)

**Kartu juga bisa aus.** Setiap bagian kartu hanya tahan ditulis ulang sekian ribu kali. Praktik 5 menulis setiap 5 detik supaya hasilnya cepat terlihat. Node 1 menulis kira-kira setiap 30 detik; untuk pemakaian latihan, jumlah tulis itu masih jauh dari batas aus kartu.

**Opsional, dan boleh dilepas nanti.** Modul microSD memakai empat pin. Silabus menyebutnya opsional: modul ini boleh dilepas setelah Modul 11, saat Node 1 sudah mengirim datanya ke server.

> ➡️ **Siap praktik?** Lanjut ke [Praktik 5 — (Opsional) Catatan CSV di kartu microSD](#praktik-5--opsional-catatan-csv-di-kartu-microsd-35-menit). Setelah selesai (atau kalau kamu melewatinya), kembali ke [Konsep 7](#7-menggabungkan-banyak-perangkat-tanpa-saling-mengganggu).

### 7. Menggabungkan banyak perangkat tanpa saling mengganggu

Setelah minggu ini, Node 1 punya lima sensor Modul 6, layar di bus I2C, dan mungkin kartu microSD di bus SPI. Supaya semuanya akur, patuhi tujuh aturan berikut:

1. **Satu pin, satu tugas.** Periksa `PETA-PIN.md` sebelum memakai pin apa pun (aturan Modul 5). Bus juga punya pin tetap: I2C di D21/D22, SPI di D18/D19/D23/D5.
2. **Alamat I2C harus unik.** Layar `0x3C` dan BME280 `0x76` boleh berbagi bus, tetapi dua layar beralamat `0x3C` tidak. Banyak modul punya jumper atau titik solder untuk mengganti alamat.
3. **Nomor seri 1-Wire sudah unik dari pabrik**, jadi probe boleh ditambah sesukamu di kabel yang sama.
4. **Setiap perangkat SPI punya CS sendiri**, dan semua CS lain harus `HIGH` saat satu perangkat diajak bicara. Library mengurus ini selama setiap perangkat diberi pin CS yang berbeda.
5. **Semua sinyal harus 3,3 V, dan semua GND disatukan.** Perangkat yang dayanya 5 V (seperti modul microSD beregulator) hanya boleh tersambung ke ESP32 kalau sinyalnya sudah diterjemahkan ke 3,3 V.
6. **Kabel bus sependek mungkin**, terutama I2C (Konsep 2).
7. **Hitung waktu.** Setiap pekerjaan butuh waktu: DS18B20 sampai 750 ms, satu kali `display()` sekitar 25 ms, satu baris CSV beberapa sampai puluhan milidetik (kadang lebih lama saat kartu sedang merapikan isinya). Node 1 masih memakai `delay()`, jadi bacaan yang lama membuat tombol terasa lambat. Modul 8 mengajarkan cara mengatasinya tanpa `delay()`.

![Peta bus Node 1 versi 0.4.0; garis putus-putus berarti hanya selama latihan Modul 7. Di tengah, ESP32. Kiri atas, bus I2C dari D21 (SDA) dan D22 (SCL) lewat jalur 19 dan 20 breadboard bawah: layar OLED 0x3C terpasang, dan BME280 0x76 bergaris putus-putus untuk latihan, nanti dipasang di Node 2 pada Modul 14. Kiri bawah, bus 1-Wire dari RX2, GPIO 16, ke DS18B20 bergaris putus-putus yang dipinjam sementara; GPIO 16 kembali ke RS-485 di Modul 15. Kanan atas, pin tetap Modul 5–6 alias jalan pribadi: sensor D14 DHT22, VP LDR, VN tanah, D34 PIR, D15 dan D35 HC-SR04; aktuator D32 dan D33 relay, D25 pompa, D26 servo, D27 buzzer, D4 LED, D13 tombol. Kanan bawah, bus SPI dari D18, D19, D23, dan CS D5 ke modul microSD opsional yang boleh dilepas setelah Modul 11. Bawah, kotak Supaya akur: alamat I2C unik di satu bus, setiap perangkat SPI punya CS sendiri, semua sinyal 3,3 volt dan semua GND disatukan, serta satu pin satu tugas menurut PETA-PIN.md](aset/peta-bus-node1.png)

> ➡️ **Siap praktik?** Lanjut ke [Praktik 6 — Layar status Node 1 rancanganmu sendiri](#praktik-6--layar-status-node-1-rancanganmu-sendiri-40-menit). Setelah selesai, kembali ke [Konsep 8](#8-membaca-skematik-simbol-simbol-dasar).

### 8. Membaca skematik: simbol-simbol dasar

Gambar meja kerja di modul ini menunjukkan **di mana** benda diletakkan: lubang 19j, rel bawah kolom 17, dan seterusnya. **Skematik** menunjukkan hal lain: **apa tersambung ke apa**. Bandingkan peta rute KRL atau MRT dengan peta jalan. Peta rute tidak memedulikan belokan rel dan jarak sesungguhnya; yang penting urutan stasiun dan tempat berpindah jalur. Skematik juga begitu sehingga satu rangkaian bisa dibaca dengan cepat di mana pun, tanpa memedulikan bentuk breadboard-nya.

Hampir semua lembar data, halaman produk, dan dokumentasi modul memakai skematik. Begitu kamu bisa membacanya, kamu tidak lagi bergantung pada foto rakitan orang lain.

**Enam aturan membaca skematik:**

1. **Garis = sambungan.** Panjang dan belokan garis tidak berarti apa-apa.
2. **Titik tebal di persimpangan = tersambung.** Dua garis yang bersilangan **tanpa** titik **tidak** tersambung; satu kabel hanya melompati kabel lain.
3. **Simbol GND** (garis bertingkat atau segitiga) di mana pun berarti tersambung ke GND yang sama. Karena itu, skematik tidak perlu menggambar kabel GND yang panjang.
4. **Simbol daya** (panah atau garis pendek) berlabel `3V3` atau `5V` berarti tersambung ke sumber tegangan itu.
5. **Label yang sama berarti tersambung** walaupun tidak ada garis di antaranya. Label `SDA` di dekat ESP32 dan label `SDA` di dekat layar adalah kabel yang sama. Label seperti ini disebut ***net label*** (label sambungan).
6. **Setiap komponen punya kode dan nilai.** R1 = resistor pertama, C2 = kapasitor kedua, D1 = dioda, Q1 = transistor, U1 = chip, K1 = relay, J1 = konektor, SW1 = sakelar. Nilainya ditulis singkat: `10k` = 10 kΩ, `4k7` = 4,7 kΩ (huruf k menggantikan koma), `100n` = 100 nF.

![Lembar simbol skematik dasar dalam kisi tiga kolom dan enam baris. Hampir setiap kotak berisi simbol, namanya, kode hurufnya, dan contoh bendanya di kit: kabel dan titik sambungan, dengan contoh dua garis bersilangan tanpa titik berarti tidak tersambung; resistor gaya kotak dan gaya zigzag; potensiometer; LDR, yaitu resistor dengan dua panah cahaya masuk; kapasitor biasa dan kapasitor elektrolit bertanda plus; LED dengan dua panah keluar; dioda dengan anoda dan katoda; tombol tekan; sakelar, dengan contoh sakelar MB102; baterai; GND bergaris bertingkat dan segitiga; simbol daya 3V3 dan 5V; transistor NPN dengan kaki B, C, E; MOSFET kanal-N dengan kaki G, D, S; motor, lingkaran berhuruf M; relay berupa kumparan dan kontak COM, NO, NC; optocoupler berupa LED dan fototransistor dalam satu kotak; dan modul berupa kotak dengan nama kaki. Bawah, contoh pembagi tegangan LDR Modul 6 digambar dua kali. Kiri, potongan breadboard bawah kolom 29 sampai 37: resistor 10 kiloohm dari 30g ke 34g, kapasitor 104 di 34h dan 36h, LDR di 34i dan 36i, kabel oranye 30j ke rel plus, kabel hitam 36j ke rel minus, dan kabel abu-abu dari 34f naik ke VP. Kanan, skematiknya: 3V3, R1 10 kiloohm, titik tengah ke kaki VP ESP32, lalu LDR dan C1 100 nanofarad ke satu simbol GND. Penanda bernomor 1 sampai 6 menunjuk benda yang sama di kedua gambar](aset/simbol-skematik.png)

Perhatikan contoh di bagian bawah gambar: rangkaian LDR yang kamu rakit di Modul 6 hanya butuh lima simbol di skematik. Itulah kekuatan skematik — rangkaian yang sama, tetapi jauh lebih ringkas.

**Cara membaca skematik yang belum kamu kenal:**

1. **Cari dayanya dulu.** Temukan semua simbol VCC dan GND. Sekarang kamu tahu tegangan berapa yang dipakai dan bagian mana yang "di atas" atau "di bawah".
2. **Ikuti jalan sinyal.** Skematik biasanya digambar dari kiri (masukan) ke kanan (keluaran). Mulailah dari kaki yang kamu kenal, misalnya `IN` atau `SDA`, lalu ikuti garisnya komponen demi komponen.
3. **Baca kode dan nilai.** Cocokkan dengan tulisan kecil di papan aslinya; kode seperti "R3" atau "C1" biasanya tercetak di dekat komponennya.

### 9. Membaca skematik modul: membedah modul relay

Di Modul 5, isi modul relay hanya diceritakan dengan kata-kata: ada *optocoupler*, transistor, dioda *flyback*, dan LED. Sekarang kamu bisa melihat **skematiknya**. Gambar di bawah ini adalah skematik sederhana satu kanal modul relay aktif LOW ber-*optocoupler*, seperti yang ada di kit.

![Skematik sederhana satu kanal modul relay aktif LOW, dibagi dua latar: sisi masukan dari ESP32 di kiri dan sisi kumparan 5 volt di kanan, dipisahkan oleh garis putus-putus. Kiri bawah, konektor J1 dengan kaki VCC, IN, dan GND. Dari VCC 5 volt, arus melewati resistor R1 1 kiloohm, LED indikator LED1, lalu LED di dalam optocoupler U1 PC817, dan berakhir di kaki IN; penanda 1 di jalur IN. Di dalam U1, dua panah cahaya menyeberangi garis pemisah ke fototransistor; penanda 2. Atas, jumper menyambung VCC ke JD-VCC tepat di garis pemisah; penanda 5. Kanan, dari JD-VCC, fototransistor menyalakan transistor NPN Q1 S8050 lewat resistor R2 1 kiloohm; Q1 menarik kumparan relay K1 ke GND; dioda D1 1N4148 terpasang terbalik sejajar kumparan, garis katodanya di sisi JD-VCC; penanda 3. Garis putus-putus dari kumparan menuju tuas kontak: tanpa arus, COM menyentuh NC; terminal NC, NO, dan COM di tepi kanan; penanda 4. Bawah, keterangan kelima penanda. Catatan: nilai komponen dan tata letak modulmu bisa sedikit berbeda](aset/skematik-modul-relay.png)

Ikuti jalan arusnya dengan lima penanda di gambar:

1. **Mengapa aktif LOW?** Arus dari VCC (5 V) mengalir lewat R1, LED indikator, dan LED di dalam *optocoupler*, lalu keluar lewat kaki **IN**. Arus hanya bisa keluar kalau IN ditarik ke 0 V (`LOW`). Saat IN `HIGH`, beda tegangan di jalur itu terlalu kecil untuk menyalakan kedua LED sehingga arus tidak mengalir; Modul 5 sudah menjelaskan mengapa `HIGH` ESP32 yang hanya 3,3 V pun biasanya cukup untuk mematikan relay. Inilah sebabnya modulmu aktif LOW dan LED indikator menyala begitu IN diberi `LOW`.
2. **Dua sisi yang dipisah cahaya.** LED di dalam *optocoupler* menyinari fototransistor di sebelahnya. Perintah menyeberang lewat **cahaya**, bukan lewat kabel. Karena itu, lonjakan listrik dari kumparan relay tidak masuk langsung ke kaki IN dan pin ESP32. Pemisahan penuhnya baru terjadi kalau jumper JD-VCC dicabut dan sisi kumparan diberi catu daya dengan GND sendiri. Di meja kerja kita, jumper itu terpasang, jadi kedua sisi masih berbagi 5 V dan GND, dan pelindung utamanya tetap dioda D1.
3. **Dioda *flyback* D1.** Saat transistor Q1 mematikan kumparan, kumparan sempat "menyentak" balik dengan tegangan tinggi. D1 yang dipasang terbalik di samping kumparan menyalurkan sentakan itu supaya Q1 tidak rusak. Ingat MOSFET pompa di Modul 5? Dioda 1N4007 di sana tugasnya sama persis.
4. **Kontak COM, NO, NC.** Begitu kumparan bermagnet, tuas di dalam relay pindah dari NC ke NO, persis seperti gambar cara kerja relay di Modul 5.
5. **Jumper JD-VCC.** Jumper ini menyambung daya kumparan (JD-VCC) ke VCC. Kalau dicabut, kumparan tidak mendapat listrik: LED indikator tetap menyala karena sisi masukan masih bertenaga, tetapi relay tidak berbunyi "klik". Itulah gejala yang dibahas di 🚨 Modul 5.

**Di mana mencari skematik modul?** Mulailah dari halaman produk dan lembar datanya. Pembuat modul *open-source* (sumber terbuka) seperti Adafruit dan SparkFun selalu menerbitkan skematiknya. Modul murah tanpa merek sering tidak punya dokumentasi. Dalam kasus itu, cari skematik modul serupa (kata kunci: nama modul + *schematic*), lalu cocokkan dengan papanmu: baca kode di badan komponen dan periksa sambungannya dengan mode kontinuitas (bip) multimeter dari Modul 2, **selagi modul tidak bertenaga**. Skematik dari internet hanya **mirip** dengan modulmu, jadi selalu cocokkan dulu.

> ➡️ **Siap praktik?** Lanjut ke [Praktik 7 — Membaca skematik dan menggambar ulang Node 1](#praktik-7--membaca-skematik-dan-menggambar-ulang-node-1-45-menit), lalu Praktik 8. Setelah itu, lanjutkan ke [🧩 Tantangan mandiri](#-tantangan-mandiri).

---

## 🔧 Praktik langkah demi langkah

Delapan praktik, **berurutan**. Layar OLED yang dipasang di Praktik 1 tetap terpasang sampai akhir dan menjadi bagian Node 1. BME280 (Praktik 3) dan DS18B20 (Praktik 4) hanya dipinjam sebentar, lalu dilepas dan disimpan untuk Node 2. Modul microSD (Praktik 5) opsional. Praktik bertanda ⭐ di daftar isi adalah bagian dari syarat lulus:

1. **Praktik 6** — layar OLED menampilkan semua bacaan Node 1 dengan tata letak rancanganmu sendiri.
2. **Praktik 7** — kamu bisa membaca skematik modul relay dan menggambar ulang Node 1 sebagai skematik.

Setiap praktik bisa dicoba dulu di Wokwi persis seperti Kemenangan Cepat: buka proyek ESP32 baru, tempel isi `diagram.json` praktik itu dari folder [`kode/`](kode/), lalu tempel kodenya ke tab `sketch.ino`. Kalau praktik itu punya `libraries.txt`, munculkan tab itu lewat **Library Manager** → **+** seperti langkah 4 Kemenangan Cepat, lalu ganti seluruh isinya. Setelah itu, baru rakit di papan asli. Langkah yang hanya bisa dilakukan di papan asli diberi tanda.

> [!TIP]
> **Cara menyimpan sketsa minggu ini.** Untuk setiap sketsa, pilih **File → New Sketch** di Arduino IDE, hapus isi bawaannya (**Ctrl + A**, lalu **Delete**), tempel kodenya (**Ctrl + V**), lalu pilih **File → Save** dan beri nama sesuai yang disebut di praktiknya, misalnya `modul07_pemindai_i2c`. Saat menyimpan sketsa pertama (Praktik 1), buat dulu folder `modul-07` di **Documents → GitHub → belajar-iot** dengan tombol **New folder** di jendela Save, lalu simpan semua sketsa minggu ini di sana. *Commit* setiap kali satu praktik selesai.
>
> **Sebelum mengeklik Upload**, pastikan kotak papan di bilah atas Arduino IDE bertuliskan **DOIT ESP32 DEVKIT V1** dan port-nya benar. Macet di `Connecting…`? Tahan **BOOT** begitu `Connecting…` muncul, lepaskan saat `Writing at …` mulai berjalan. Serial Monitor selalu di **115200 baud**.
>
> **Baris pertama tidak terlihat di Serial Monitor?** Pesan dari `setup()` hanya dicetak sekali, saat papan baru menyala, dan sering sudah lewat sebelum Serial Monitor sempat dibuka. Tekan tombol **EN** di papan ESP32 untuk mengulang program dari awal; Serial Monitor tetap tersambung dan mencetaknya lagi.
>
> **Membuka lagi sketsa lama:** pilih **File → Open Recent**, atau **File → Open…** lalu buka **Documents → GitHub → belajar-iot → modul-07**. Sketsa minggu ini tidak muncul di **File → Sketchbook** karena disimpan di luar folder Sketchbook.

> [!IMPORTANT]
> **Kebiasaan merakit minggu ini** (sama dengan Modul 5–6): **sebelum memasang atau memindah kabel, matikan MB102, lalu cabut USB.** Setelah selesai merakit, colokkan USB dulu, baru nyalakan MB102. Praktik 1–4 hanya memakai 3,3 V dari ESP32, jadi MB102 boleh tetap mati sampai Praktik 5.
>
> **Cara membaca nama lubang** juga sama: angka = kolom, huruf = baris. Semua lubang baru minggu ini ada di **breadboard bawah**, kecuali satu: kabel VCC modul microSD beregulator ke **rel atas** (Praktik 5). Contoh: **19j** berarti kolom 19, baris j, breadboard bawah. Gambar meja kerja di setiap praktik menampilkan komponen lama dengan warna pudar, dan kotak perbesarannya menuliskan nama kaki ESP32 di atas kolom yang segaris dengan kaki itu.

Pada akhir modul, folder latihanmu berisi:

```text
belajar-iot/
└── modul-07/
    ├── modul07_pemindai_i2c/       ← Praktik 1
    ├── modul07_oled_pertama/       ← Praktik 1 (sketsa Kemenangan Cepat)
    ├── modul07_oled_tata_letak/    ← Praktik 2
    ├── modul07_bme280/             ← Praktik 3
    ├── modul07_ds18b20/            ← Praktik 4
    ├── modul07_log_microsd/        ← Praktik 5 (opsional)
    ├── modul07_layar_node1/        ← Praktik 6 ⭐
    ├── skematik-node1.jpg          ← Praktik 7 ⭐ (foto atau ekspor gambar skematikmu)
    └── catatan-modul07.md          ← Praktik 8 (alamat, nomor seri, dan jawaban Praktik 7)
```

### Praktik 1 — Layar OLED dan pemindai I2C (35 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** (dengan **Library Manager**) atau Wokwi, layar OLED 0,96 inci, 2 kabel jumper **jantan–jantan** (biru dan kuning), dan 4 kabel jumper **jantan–betina** (hitam, oranye, kuning, biru). Konsep yang dipakai: 1 dan 2.

#### 1.1 Pasang library Adafruit SSD1306

1. Di Arduino IDE, klik ikon **Library Manager** di bilah kiri (ikon ketiga, bergambar buku), sama seperti di Modul 6.
2. Ketik **Adafruit SSD1306** di kotak pencarian. Pilih entri yang namanya persis **Adafruit SSD1306** dan di bawah judulnya tertulis **by Adafruit**. Ada beberapa nama mirip, misalnya **Adafruit SSD1306 Wemos Mini OLED**, **Adafruit SSD1306 EMULATOR**, dan **ESP8266 and ESP32 OLED driver for SSD1306 displays**; bukan itu yang kita pakai.
3. Di menu versi, pilih **2.5.17**, lalu klik **INSTALL**.
4. Muncul jendela `Install library dependencies` dengan pesan `The library Adafruit SSD1306:2.5.17 needs some other dependencies currently not installed:`, diikuti daftar **Adafruit BusIO** dan **Adafruit GFX Library**, lalu pertanyaan `Would you like to install all the missing dependencies?`. Klik **INSTALL ALL**: SSD1306 butuh GFX untuk menggambar, dan GFX butuh BusIO untuk berbicara lewat I2C.
5. Tunggu sampai panel **Output** di bawah mencetak `Installed Adafruit SSD1306@2.5.17` dan muncul pemberitahuan `Successfully installed library Adafruit SSD1306:2.5.17` di pojok kanan bawah.

![Ilustrasi Library Manager Arduino IDE 2. Penanda 1 pada ikon buku Library Manager di bilah kiri. Kotak pencarian berisi Adafruit SSD1306; entri Adafruit SSD1306 by Adafruit dengan menu versi 2.5.17 dan tombol INSTALL, ditandai penanda 2; di bawahnya entri Adafruit SSD1306 Wemos Mini OLED by Adafruit + mcauser dengan catatan bukan yang ini, dan ESP8266 and ESP32 OLED driver for SSD1306 displays dengan catatan bukan juga. Di sebelah kanan, jendela Install library dependencies berisi pesan The library Adafruit SSD1306:2.5.17 needs some other dependencies currently not installed, minus Adafruit BusIO, minus Adafruit GFX Library, Would you like to install all the missing dependencies, dengan dua tombol INSTALL WITHOUT DEPENDENCIES dan INSTALL ALL; penanda 3 pada INSTALL ALL. Di bawah, panel Output berisi baris Downloading, Installing, dan Installed untuk Adafruit BusIO@1.17.4, Adafruit GFX Library@1.12.6, dan Adafruit SSD1306@2.5.17. Label penanda: pilih 2.5.17, klik INSTALL; lalu klik INSTALL ALL. Catatan di bawah gambar: ilustrasi, bukan tangkapan layar](aset/arduino-library-ssd1306.png)

Kalau telanjur mengeklik **INSTALL WITHOUT DEPENDENCIES**, kompilasi nanti gagal dengan pesan `fatal error: Adafruit_GFX.h: No such file or directory`. Obatnya: cari dan pasang **Adafruit GFX Library** versi 1.12.6 dan **Adafruit BusIO** versi 1.17.4 di Library Manager.

#### 1.2 Pasang kabel jembatan bus dan layar

Pastikan MB102 mati dan USB tercabut. Lihat dulu tulisan di keempat kaki layarmu. Urutan yang paling umum adalah **GND, VCC, SCL, SDA**, tetapi ada layar yang urutannya **VCC, GND, SCL, SDA**. Ikuti **tulisannya**, bukan urutan di gambar. Pada layar berurutan VCC, GND, SCL, SDA, kabel hitam dan oranye akan bersilangan. Itu tidak apa-apa asalkan kaki **GND** masuk ke rel (−) kolom 17 dan kaki **VCC** ke rel (+) kolom 18.

| Komponen | Dari | Ke | Gunanya |
| :--- | :--- | :--- | :--- |
| Kabel **biru** (jantan–jantan) | 14d | 20f | jalur kaki D21 (SDA) disambung ke jalur 20 baris f–j |
| Kabel **kuning** (jantan–jantan) | 17e | 19f | jalur kaki D22 (SCL) disambung ke jalur 19 baris f–j |
| Kabel **hitam** (jantan–betina) | kaki **GND** layar | rel bawah **(−)** kolom 17 | GND |
| Kabel **oranye** (jantan–betina) | kaki **VCC** layar | rel bawah **(+)** kolom 18 | 3,3 V dari ESP32 |
| Kabel **kuning** (jantan–betina) | kaki **SCL** layar | 19j | jalur SCL |
| Kabel **biru** (jantan–betina) | kaki **SDA** layar | 20j | jalur SDA |

Ujung betina dipasang pada kaki layar; ujung jantan ditancapkan ke breadboard. Letakkan layar di meja, di depan breadboard bawah, dengan muka menghadap ke atas supaya mudah dibaca dari tempat dudukmu.

![Ilustrasi meja kerja setelah Praktik 1, dilihat dari atas. Komponen Modul 5 dan 6 digambar pudar. Tambahan baru berwarna terang di breadboard bawah: kabel biru dari 14d ke 20f dan kabel kuning dari 17e turun lewat parit ke 19f. Di depan breadboard bawah, layar OLED biru menghadap ke atas dengan empat kaki di tepi atasnya: kabel hitam dari GND ke rel bawah minus kolom 17, oranye dari VCC ke rel bawah plus kolom 18, kuning dari SCL ke 19j, dan biru dari SDA ke 20j, keempatnya lurus tanpa bersilangan. Label: jalur 19 baris f sampai j sama dengan SCL, jalur 20 baris f sampai j sama dengan SDA; layar diberi 3,3 volt dari rel bawah. Kotak perbesaran kolom 12 sampai 22 dengan empat penanda menjelaskan kedua kabel jembatan dan keempat kabel layar. Kotak catatan ungu: jalur 19 baris f sampai j sama dengan SCL dan jalur 20 baris f sampai j sama dengan SDA, inilah jalan tol I2C-mu; lubang 19g sampai 19i dan 20g sampai 20i masih kosong untuk perangkat I2C berikutnya; kaki D21 ada di 14b dan kaki D22 di 17b, di deretan kaki bawah papan ESP32](aset/meja-kerja-oled.png)

**Mengapa di Wokwi kabel SCL dan SDA bersilangan, tetapi di mejamu tidak?** Di papan ESP32, D21 (SDA) ada di **kiri** D22 (SCL). Di layar, urutannya terbalik: SCL di kiri SDA. Di Wokwi, kabel layar langsung menuju D21 dan D22, jadi keduanya harus bersilangan. Di meja kerja, kedua kabel jembatan sudah "menukar" urutannya: jalur SCL (19) ada di kiri jalur SDA (20). Silang atau tidak, listriknya sama; yang penting setiap ujung masuk ke lubang yang benar.

#### 1.3 Temukan alamat layar dengan pemindai I2C

1. Colokkan USB laptop ke papan ESP32. MB102 boleh tetap mati.
2. Buat sketsa baru `modul07_pemindai_i2c` (sekaligus buat folder `modul-07`; lihat kotak **Tip** di atas), tempel kode ini, lalu klik **Upload**:

   ```cpp
   // Modul 7 - Praktik 1: pemindai I2C
   // "Mengetuk pintu" alamat 1 sampai 126 satu per satu, lalu mencetak alamat yang menjawab.
   // Bus I2C: SDA ke D21, SCL ke D22. Tidak perlu library tambahan: Wire sudah ikut paket esp32.

   #include <Wire.h>

   const int PIN_SDA = 21;  // D21: jalur data I2C (peta pin kanonik)
   const int PIN_SCL = 22;  // D22: jalur detak I2C (peta pin kanonik)

   // Menebak nama perangkat dari alamatnya. Hanya perangkat kurikulum ini yang dikenal.
   String tebakNama(byte alamat) {
     if (alamat == 0x3C || alamat == 0x3D) {
       return "layar OLED SSD1306";
     }
     if (alamat == 0x76) {
       return "BME280 atau BMP280 (kaki SDO ke GND)";
     }
     if (alamat == 0x77) {
       return "BME280 atau BMP280 (kaki SDO ke VCC), atau BMP180";
     }
     return "perangkat lain (cek lembar datanya)";
   }

   // Mencetak alamat dalam bentuk heksadesimal dua digit, misalnya 0x3C atau 0x08.
   void cetakAlamat(byte alamat) {
     Serial.print("0x");
     if (alamat < 0x10) {
       Serial.print("0");
     }
     Serial.print(alamat, HEX);
   }

   void setup() {
     Serial.begin(115200);
     Wire.begin(PIN_SDA, PIN_SCL);
     delay(500);
     Serial.println();
     Serial.println("Pemindai I2C siap.");
   }

   void loop() {
     Serial.println("Memindai alamat 0x01 sampai 0x7E...");
     int jumlah = 0;
     for (byte alamat = 1; alamat < 127; alamat++) {
       Wire.beginTransmission(alamat);         // ketuk pintu alamat ini
       byte jawaban = Wire.endTransmission();  // 0 = ada yang menjawab "ya, saya di sini"
       if (jawaban == 0) {
         Serial.print("  Ada perangkat di ");
         cetakAlamat(alamat);
         Serial.print(" -> ");
         Serial.println(tebakNama(alamat));
         jumlah++;
       }
     }
     if (jumlah == 0) {
       Serial.println("  Tidak ada yang menjawab. Periksa kabel SDA, SCL, VCC, dan GND.");
     } else {
       Serial.print("Selesai: ");
       Serial.print(jumlah);
       Serial.println(" perangkat ditemukan.");
     }
     Serial.println();
     delay(5000);  // pindai ulang setiap 5 detik supaya hasilnya tetap terlihat walaupun Serial Monitor baru dibuka
   }
   ```

3. Buka Serial Monitor (**115200 baud**). Setiap 5 detik muncul hasil pindaian.

**Hasilnya:**

```text
Pemindai I2C siap.
Memindai alamat 0x01 sampai 0x7E...
  Ada perangkat di 0x3C -> layar OLED SSD1306
Selesai: 1 perangkat ditemukan.
```

Baris `Pemindai I2C siap.` hanya terlihat kalau Serial Monitor sudah terbuka saat papan menyala; tidak apa-apa kalau terlewat. Layarnya sendiri masih gelap: sketsa ini hanya mengetuk alamat, tidak menyalakan layar. Kalau hasilmu berbeda:

- **`0x3D`, bukan `0x3C`:** sebagian kecil layar memakai alamat ini. Ingat angkanya; di semua sketsa minggu ini, ganti `0x3C` pada baris `const byte ALAMAT_LAYAR = 0x3C;` dengan `0x3D`.
- **`Tidak ada yang menjawab.`:** periksa kabel SDA, SCL, VCC, dan GND, serta kedua kabel jembatan. Buka juga 🚨.
- **Di balik layarmu tertulis "0x78" atau "0x7A"?** Itu alamat yang sama dalam bentuk 8-bit: `0x3C` × 2 = `0x78`, dan `0x3D` × 2 = `0x7A`. Di kode, tetap tulis alamat yang ditemukan pemindai.

**Coba buat kesalahan paling umum dengan sengaja.** Cabut USB, lalu tukar ujung kabel kuning dan biru dari layar (kuning ke 20j, biru ke 19j). Colokkan USB lagi: pemindai menulis `Tidak ada yang menjawab.`. Sebabnya, layar kini menerima ketukan drum (detak) di kaki SDA-nya dan data di kaki SCL-nya sehingga ia tidak pernah "mendengar" alamatnya dipanggil. Ingat penjelasan ini; checklist kelulusan menanyakannya. Cabut USB, kembalikan kedua kabel ke tempatnya (kuning 19j, biru 20j), lalu colokkan USB: `0x3C` muncul lagi. Kesalahan ini sering terjadi, dan pemindai menangkapnya dalam hitungan detik.

**Di Wokwi:** pakai [`diagram.json`](kode/modul07_pemindai_i2c/diagram.json) Praktik 1 (sama dengan Kemenangan Cepat). Sketsa ini tidak butuh `libraries.txt` karena library **Wire** sudah ikut paket esp32. Hasilnya persis sama.

#### 1.4 Nyalakan layar aslimu

1. Buat sketsa baru `modul07_oled_pertama`, tempel kode [Kemenangan Cepat](#-kemenangan-cepat-layar-oled-pertamamu-langsung-di-wokwi-10-menit) (atau salin dari file [`kode/modul07_oled_pertama/modul07_oled_pertama.ino`](kode/modul07_oled_pertama/modul07_oled_pertama.ino)), lalu klik **Upload**.
2. Layar menampilkan `Halo,` dan `Node 1!` selama dua detik, lalu hitungan detik dengan angka besar — sama seperti di Wokwi. Layar tetap gelap? Buka [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan), bagian **Layar tetap gelap**.

Kalau layarmu dua warna, `Halo,` tampil kuning dan `Node 1!` biru: tulisan ukuran 2 setinggi 16 titik sehingga baris pertama tepat mengisi pita kuning. Layar yang tidak dipakai oleh sebuah sketsa tetap menampilkan gambar terakhirnya sampai listriknya diputus. Jadi, kalau nanti kamu mengunggah sketsa lain yang tidak memakai layar, angka terakhir yang membeku di layar itu normal.

> ⬆️ **Selesai Praktik 1?** Kembali ke [Konsep 3](#3-layar-oled-titik-koordinat-dan-kertas-gambar) (➡️ di sana akan mengantarmu ke Praktik 2).

### Praktik 2 — Kotak peralatan layar: huruf, koordinat, dan ikon (25 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** (atau Wokwi) dan rakitan Praktik 1. Tidak ada kabel baru. Konsep yang dipakai: 3.

#### 2.1 Unggah sketsa tiga halaman

Buat sketsa baru `modul07_oled_tata_letak`, tempel kode ini, lalu klik **Upload**:

```cpp
// Modul 7 - Praktik 2: kotak peralatan layar OLED
// Tiga "halaman" bergantian setiap 3 detik: ukuran huruf, koordinat, lalu ikon dan angka besar.
// Layar OLED: SDA ke D21, SCL ke D22.
// Library: Adafruit SSD1306 2.5.17 (ikut terpasang: Adafruit GFX Library 1.12.6 dan Adafruit BusIO 1.17.4).

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

const int PIN_SDA = 21;          // D21: jalur data I2C (peta pin kanonik)
const int PIN_SCL = 22;          // D22: jalur detak I2C (peta pin kanonik)
const byte ALAMAT_LAYAR = 0x3C;  // "alamat rumah" layar di bus I2C

Adafruit_SSD1306 layar(128, 64, &Wire, -1);

// Ikon 8 x 8 titik. Setiap angka biner adalah satu baris: 1 = titik menyala, 0 = padam.
const unsigned char IKON_TERMOMETER[] = {
  0b00011000,
  0b00100100,
  0b00100100,
  0b00111100,
  0b00111100,
  0b01111110,
  0b01111110,
  0b00111100,
};
const unsigned char IKON_TETES[] = {
  0b00011000,
  0b00011000,
  0b00111100,
  0b00111100,
  0b01111110,
  0b01111110,
  0b01111110,
  0b00111100,
};
const unsigned char IKON_MATAHARI[] = {
  0b00011000,
  0b01000010,
  0b00111100,
  0b10111101,
  0b10111101,
  0b00111100,
  0b01000010,
  0b00011000,
};
const unsigned char IKON_TANAMAN[] = {
  0b11000011,
  0b01100110,
  0b00111100,
  0b00011000,
  0b00011000,
  0b11111111,
  0b01111110,
  0b00111100,
};
const unsigned char IKON_TANDON[] = {
  0b10000001,
  0b10000001,
  0b10000001,
  0b11011011,
  0b11111111,
  0b11111111,
  0b11111111,
  0b01111110,
};
const unsigned char IKON_ORANG[] = {
  0b00011000,
  0b00011000,
  0b01111110,
  0b00011000,
  0b00011000,
  0b00100100,
  0b01000010,
  0b01000010,
};

int halaman = 1;        // halaman yang sedang tampil: 1, 2, atau 3
int persenContoh = 45;  // angka contoh untuk batang persen; naik 10 setiap kali halaman 3 tampil

// Halaman 1: tiga ukuran huruf. Satu huruf ukuran 1 = 6 x 8 titik (termasuk jarak antarhuruf).
void halamanUkuranHuruf() {
  layar.setTextSize(1);
  layar.setCursor(0, 0);
  layar.print("Ukuran 1: kecil");
  layar.setTextSize(2);
  layar.setCursor(0, 16);  // mulai di bawah pita kuning layar dua warna
  layar.print("Ukuran 2");
  layar.setTextSize(3);
  layar.setCursor(0, 40);  // 40 + 24 = 64: tepat sampai baris terbawah
  layar.print("Uk. 3");
}

// Halaman 2: koordinat. x bertambah ke kanan, y bertambah ke BAWAH.
void halamanKoordinat() {
  layar.drawRect(0, 0, 128, 64, SSD1306_WHITE);   // bingkai di tepi layar
  layar.setTextSize(1);
  layar.setCursor(3, 3);
  layar.print("(0,0)");
  layar.setCursor(44, 3);
  layar.print("x");
  layar.write(26);                                 // panah ke kanan (nomor 26 di tabel huruf)
  layar.setCursor(3, 28);
  layar.print("y");
  layar.write(25);                                 // panah ke bawah (nomor 25)
  layar.drawLine(60, 32, 68, 32, SSD1306_WHITE);   // tanda + di tengah layar
  layar.drawLine(64, 28, 64, 36, SSD1306_WHITE);
  layar.setCursor(70, 24);
  layar.print("(64,32)");
  layar.setCursor(76, 53);
  layar.print("(127,63)");
}

// Halaman 3: ikon, angka besar dengan satuan kecil, batang persen, dan tulisan terbalik.
void halamanIkon() {
  layar.drawBitmap(0, 0, IKON_TERMOMETER, 8, 8, SSD1306_WHITE);
  layar.drawBitmap(14, 0, IKON_TETES, 8, 8, SSD1306_WHITE);
  layar.drawBitmap(28, 0, IKON_MATAHARI, 8, 8, SSD1306_WHITE);
  layar.drawBitmap(42, 0, IKON_TANAMAN, 8, 8, SSD1306_WHITE);
  layar.drawBitmap(56, 0, IKON_TANDON, 8, 8, SSD1306_WHITE);
  layar.drawBitmap(70, 0, IKON_ORANG, 8, 8, SSD1306_WHITE);

  layar.setTextSize(3);         // angka besar: satu huruf 18 x 24 titik
  layar.setCursor(0, 16);
  layar.print("28.5");
  layar.setTextSize(1);         // satuan kecil di pojok kanan atas angka
  layar.setCursor(74, 16);
  layar.write(248);             // tanda derajat (nomor 248 di tabel huruf)
  layar.print("C");

  layar.fillRect(88, 30, 40, 11, SSD1306_WHITE);      // kotak putih...
  layar.setTextColor(SSD1306_BLACK);                  // ...ditulisi huruf hitam = tulisan terbalik
  layar.setCursor(91, 32);
  layar.print("GERAK");
  layar.setTextColor(SSD1306_WHITE);                  // kembalikan ke huruf putih

  layar.setCursor(0, 46);
  layar.print("Tanah ");
  layar.print(persenContoh);
  layar.print("%");
  layar.drawRect(0, 56, 128, 8, SSD1306_WHITE);               // bingkai batang
  layar.fillRect(2, 58, 124 * persenContoh / 100, 4, SSD1306_WHITE);  // isi batang sesuai persen

  persenContoh = persenContoh + 10;
  if (persenContoh > 100) {
    persenContoh = 0;
  }
}

void setup() {
  Serial.begin(115200);
  Wire.begin(PIN_SDA, PIN_SCL);
  layar.begin(SSD1306_SWITCHCAPVCC, ALAMAT_LAYAR);
  layar.cp437(true);  // pakai tabel huruf CP437 yang benar supaya nomor 248 = tanda derajat
  layar.setTextColor(SSD1306_WHITE);
  Serial.println("Kotak peralatan layar siap. Halaman berganti setiap 3 detik.");
}

void loop() {
  layar.clearDisplay();
  if (halaman == 1) {
    halamanUkuranHuruf();
  } else if (halaman == 2) {
    halamanKoordinat();
  } else {
    halamanIkon();
  }
  layar.display();
  Serial.print("Halaman ");
  Serial.println(halaman);

  halaman++;
  if (halaman > 3) {
    halaman = 1;
  }
  delay(3000);
}
```

Layar berganti halaman setiap 3 detik, dan Serial Monitor mencetak `Halaman 1`, `Halaman 2`, `Halaman 3`, lalu kembali ke `Halaman 1`.

![Tangkapan layar Wokwi Praktik 2: layar OLED pada ketiga halaman, disusun berdampingan. Halaman 1, ukuran huruf: Ukuran 1: kecil dengan huruf kecil, Ukuran 2 lebih besar, dan Uk. 3 paling besar. Halaman 2, koordinat: bingkai di tepi layar, (0,0) di pojok kiri atas dengan panah x ke kanan, panah y ke bawah, tanda tambah di (64,32), dan (127,63) di pojok kanan bawah. Halaman 3: enam ikon kecil berderet di atas, angka 28.5 besar dengan derajat C kecil, kotak putih bertuliskan GERAK yang terbalik, dan Tanah 45% dengan batang persen](aset/wokwi-oled-tata-letak.png)

*Tangkapan layar [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), Oktober 2026; dipakai untuk tujuan pendidikan, penanda oleh penulis.*

| Halaman | Yang ditunjukkan | Perintah pentingnya |
| :---: | :--- | :--- |
| 1 | tiga ukuran huruf: kecil, sedang, besar | `setTextSize()`, `setCursor()` |
| 2 | koordinat: (0, 0) di kiri atas, x ke kanan, y ke **bawah**, (127, 63) di kanan bawah | `drawRect()`, `drawLine()`, `write(26)` dan `write(25)` untuk panah |
| 3 | enam ikon, angka besar dengan °C kecil, tulisan terbalik `GERAK`, dan batang persen | `drawBitmap()`, `write(248)`, `fillRect()` |

Batang `Tanah` di halaman 3 bertambah 10 % setiap kali halaman itu muncul, dimulai dari 45 %, lalu kembali ke 0 % setelah melewati 100 %. Perhatikan panjang isinya: `124 * persenContoh / 100` titik dari lebar 124 titik di dalam bingkai.

**Di Wokwi:** pakai [`diagram.json`](kode/modul07_oled_tata_letak/diagram.json) dan [`libraries.txt`](kode/modul07_oled_tata_letak/libraries.txt) Praktik 2.

#### 2.2 Bereksperimen

Ubah satu hal, klik **Upload**, lihat hasilnya, lalu lanjut ke perubahan berikutnya:

1. **Namamu di halaman 1.** Ganti `"Ukuran 1: kecil"` dengan namamu. Satu baris ukuran 1 memuat 21 huruf; huruf ke-22 dan seterusnya turun ke baris berikutnya.
2. **Pindahkan tanda + di halaman 2** ke titik (100, 20). Tanda itu terdiri atas dua garis: ubah baris `layar.drawLine(60, 32, 68, 32, SSD1306_WHITE);` menjadi `layar.drawLine(96, 20, 104, 20, SSD1306_WHITE);`, dan baris `layar.drawLine(64, 28, 64, 36, SSD1306_WHITE);` menjadi `layar.drawLine(100, 16, 100, 24, SSD1306_WHITE);`. Tulisan `(64,32)` tidak ikut pindah karena tulisan punya `setCursor` sendiri; ubah juga kalau mau.
3. **Ikon buatanmu.** Gambar kotak 8 × 8 di kertas berpetak, hitamkan kotak yang ingin kamu nyalakan, lalu tulis setiap baris sebagai angka biner. Contohnya, ikon hati:

   ```cpp
   const unsigned char IKON_ORANG[] = {  // isinya diganti dengan gambar hati; namanya dibiarkan supaya kode lain tidak perlu diubah
     0b01100110,
     0b11111111,
     0b11111111,
     0b11111111,
     0b01111110,
     0b00111100,
     0b00011000,
     0b00000000,
   };
   ```

   Ganti isi `IKON_ORANG` dengan rancanganmu, lalu lihat ikon keenam di halaman 3.

> ⬆️ **Selesai Praktik 2?** Kembali ke [Konsep 4](#4-bme280-tiga-sensor-dalam-satu-kotak-kecil--dan-kembarannya-yang-menipu) (➡️ di sana akan mengantarmu ke Praktik 3).

### Praktik 3 — BME280 di bus yang sama (30 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** (dengan **Library Manager**) atau Wokwi, modul BME280, 4 kabel jumper **jantan–betina** (oranye, hitam, kuning, biru), dan rakitan Praktik 1 (layar tetap terpasang). DHT22 dari Modul 6 ikut dibaca sebagai pembanding. Konsep yang dipakai: 2 dan 4.

#### 3.1 Pasang library Adafruit BME280

1. Di **Library Manager**, ketik **Adafruit BME280**. Pilih **Adafruit BME280 Library** yang di bawah judulnya tertulis **by Adafruit**, versi **2.3.0**, lalu klik **INSTALL**.
2. Jendela `Install library dependencies` muncul lagi dengan daftar **Adafruit BusIO** dan **Adafruit Unified Sensor** walaupun keduanya sudah terpasang (Unified Sensor sejak Modul 6, BusIO sejak Praktik 1). Arduino IDE 2.3.10 memang tetap menampilkan jendela ini. Klik **INSTALL ALL**; versinya sama, jadi tidak ada yang rusak.

#### 3.2 Pasang BME280 di jalur bus

Pastikan MB102 mati dan USB tercabut. Modul BME280 di kit biasanya punya **empat kaki** (VCC atau VIN, GND, SCL, SDA). Kalau modulmu punya **enam kaki** (VCC, GND, SCL, SDA, CSB, SDO), dua kaki terakhir **dibiarkan kosong**.

| Kabel (jantan–betina) | Dari kaki BME280 | Ke | Gunanya |
| :--- | :--- | :--- | :--- |
| **Oranye** | **VCC** (atau VIN) | rel bawah **(+)** kolom 14 | 3,3 V dari ESP32 |
| **Hitam** | **GND** | rel bawah **(−)** kolom 14 | GND |
| **Kuning** | **SCL** | 19h | jalur SCL, satu jalur dengan SCL layar di 19j |
| **Biru** | **SDA** | 20i | jalur SDA, satu jalur dengan SDA layar di 20j |

Lubang kosong lain di jalur 19 (19g, 19i) dan jalur 20 (20g, 20h) juga boleh dipakai; yang penting SCL di jalur 19 dan SDA di jalur 20. Letakkan modul BME280 beberapa sentimeter dari papan ESP32 supaya tidak ikut terhangatkan (Konsep 4).

![Ilustrasi meja kerja setelah Praktik 3. Komponen lama, termasuk layar OLED dan kedua kabel jembatan, digambar pudar. Di depan breadboard bawah, sedikit lebih jauh dari layar, modul BME280 ungu dengan empat kaki VCC, GND, SCL, SDA. Kabel oranye dari VCC naik lewat celah kolom 13 lalu melengkung masuk ke rel bawah plus kolom 14; kabel hitam dari GND lurus ke rel bawah minus kolom 14; kabel kuning dari SCL naik ke baris h lalu ke kanan sampai 19h; kabel biru dari SDA naik ke baris i lalu ke kanan sampai 20i. Kotak perbesaran kolom 12 sampai 22 dengan empat penanda menjelaskan keempat kabel; catatan: dua perangkat, dua kabel data yang sama, itulah bus](aset/meja-kerja-bme280.png)

#### 3.3 Pindai lagi: dua perangkat, satu bus

Colokkan USB, lalu buka lagi sketsa `modul07_pemindai_i2c`: **File → Open Recent → modul07_pemindai_i2c** (atau **File → Open…** → **Documents → GitHub → belajar-iot → modul-07 → modul07_pemindai_i2c**). Klik **Upload**, lalu buka Serial Monitor (**115200 baud**).

**Hasilnya** (alamat BME280-mu bisa `0x76` atau `0x77`):

```text
Memindai alamat 0x01 sampai 0x7E...
  Ada perangkat di 0x3C -> layar OLED SSD1306
  Ada perangkat di 0x76 -> BME280 atau BMP280 (kaki SDO ke GND)
Selesai: 2 perangkat ditemukan.
```

Dua perangkat menjawab dari kabel yang sama. Itulah bus I2C: kabelnya bersama, alamatnya berbeda. Pemindai hanya tahu **alamat**; ia belum bisa membedakan BME280 dari BMP280. Itu tugas langkah berikutnya.

#### 3.4 Baca BME280 dan bandingkan dengan DHT22

Buat sketsa baru `modul07_bme280`, tempel kode ini, lalu klik **Upload**:

```cpp
// Modul 7 - Praktik 3: BME280 di bus I2C, dibandingkan dengan DHT22
// BME280: SDA ke D21, SCL ke D22 (bus yang sama dengan layar OLED). DHT22 tetap di D14.
// Library: Adafruit BME280 Library 2.3.0 (ikut terpasang: Adafruit Unified Sensor 1.1.15 dan Adafruit BusIO 1.17.4)
//          dan DHT sensor library 1.4.7 (dari Modul 6).

#include <Wire.h>
#include <Adafruit_BME280.h>
#include <DHT.h>

const int PIN_SDA = 21;  // D21: jalur data I2C (peta pin kanonik)
const int PIN_SCL = 22;  // D22: jalur detak I2C (peta pin kanonik)
const int PIN_DHT = 14;  // D14: DHT22 (peta pin kanonik)

Adafruit_BME280 bme;
DHT dht(PIN_DHT, DHT22);
bool bmeSiap = false;  // true kalau BME280 asli ditemukan

// Menjawab true kalau ada perangkat yang merespons di alamat itu (cara pemindai I2C).
bool adaPerangkat(byte alamat) {
  Wire.beginTransmission(alamat);
  return Wire.endTransmission() == 0;
}

void cetakHex(int nilai) {
  Serial.print("0x");
  if (nilai < 0x10) {
    Serial.print("0");
  }
  Serial.print(nilai, HEX);
}

// Mencari BME280 di kedua alamatnya, lalu memeriksa "kartu identitas"-nya (chip ID).
bool siapkanBme() {
  byte alamat = 0;
  if (adaPerangkat(0x76)) {
    alamat = 0x76;
  } else if (adaPerangkat(0x77)) {
    alamat = 0x77;
  }
  if (alamat == 0) {
    Serial.println("Tidak ada perangkat di 0x76 maupun 0x77. Periksa keempat kabel BME280.");
    return false;
  }
  Serial.print("Ada perangkat di ");
  cetakHex(alamat);
  Serial.println(". Memeriksa chip ID-nya...");

  if (bme.begin(alamat)) {
    Serial.println("Chip ID 0x60: benar BME280 (suhu, kelembapan, dan tekanan).");
    return true;
  }
  int id = bme.sensorID();  // chip ID yang baru saja dibaca dari perangkat itu
  Serial.print("Chip ID-nya ");
  cetakHex(id);
  Serial.print(", bukan 0x60. ");
  if (id == 0x56 || id == 0x57 || id == 0x58) {
    Serial.println("Ini BMP280: hanya suhu dan tekanan, TANPA kelembapan.");
  } else if (id == 0x55) {
    Serial.println("Ini BMP180: sepupu lama BME280, hanya suhu dan tekanan.");
  } else if (id == 0x61) {
    Serial.println("Ini BME680: punya sensor gas juga, butuh library lain.");
  } else {
    Serial.println("Chip tidak dikenal.");
  }
  return false;
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Wire.begin(PIN_SDA, PIN_SCL);
  dht.begin();
  bmeSiap = siapkanBme();
  Serial.println("Bacaan pertama muncul 2 detik lagi.");
}

void loop() {
  delay(2000);  // DHT22 paling cepat dibaca sekali setiap 2 detik

  float suhuDht = dht.readTemperature();
  float lembapDht = dht.readHumidity();

  Serial.print("DHT22 : suhu=");
  if (isnan(suhuDht) || isnan(lembapDht)) {
    Serial.println("-- (gagal dibaca)");
  } else {
    Serial.print(suhuDht, 1);
    Serial.print(" C  kelembapan=");
    Serial.print(lembapDht, 0);
    Serial.println(" %");
  }

  if (!bmeSiap) {
    Serial.println("BME280: tidak siap (lihat pesan di atas)");
    return;
  }
  float suhuBme = bme.readTemperature();         // derajat Celsius
  float lembapBme = bme.readHumidity();          // persen
  float tekanan = bme.readPressure() / 100.0;    // paskal dibagi 100 = hPa
  Serial.print("BME280: suhu=");
  Serial.print(suhuBme, 1);
  Serial.print(" C  kelembapan=");
  Serial.print(lembapBme, 0);
  Serial.print(" %  tekanan=");
  Serial.print(tekanan, 1);
  Serial.println(" hPa");

  if (!isnan(suhuDht) && !isnan(lembapDht)) {
    Serial.print("selisih: suhu ");
    Serial.print(fabs(suhuBme - suhuDht), 1);  // fabs = nilai mutlak, selalu positif
    Serial.print(" C, kelembapan ");
    Serial.print(fabs(lembapBme - lembapDht), 0);
    Serial.println(" %");
  }
  Serial.println();
}
```

Setelah `Done uploading` muncul, buka Serial Monitor (**115200 baud**). Sketsa baru selalu terbuka di jendela Arduino IDE tersendiri, jadi Serial Monitor-nya perlu dibuka lagi. Baris tentang chip ID hanya dicetak **sekali**, sesaat setelah papan menyala. Kalau yang terlihat hanya baris `DHT22 :` dan `BME280:`, tekan tombol **EN** di papan ESP32: program mulai dari awal dan baris chip ID tercetak lagi.

**Hasilnya** di papan asli kira-kira seperti ini (angkamu pasti berbeda):

```text
Ada perangkat di 0x76. Memeriksa chip ID-nya...
Chip ID 0x60: benar BME280 (suhu, kelembapan, dan tekanan).
Bacaan pertama muncul 2 detik lagi.
DHT22 : suhu=28.5 C  kelembapan=71 %
BME280: suhu=29.1 C  kelembapan=66 %  tekanan=1009.6 hPa
selisih: suhu 0.6 C, kelembapan 5 %
```

Kalau yang muncul `Chip ID-nya 0x58, bukan 0x60. Ini BMP280: hanya suhu dan tekanan, TANPA kelembapan.`, sensormu BMP280. Simpan foto pesan itu sebagai bukti kalau ingin mengajukan keluhan kepada penjual. BMP280 tetap bisa dipakai untuk suhu dan tekanan, tetapi butuh library lain. Selain itu, Node 2 membutuhkan BME280 yang asli. Kamu tetap boleh melanjutkan modul ini: lewati percobaan 3.5 (sketsa ini hanya membaca BME280 asli), dan untuk checklist cukup jelaskan arti chip ID `0x58`. BME280 asli baru dibutuhkan di Modul 14, jadi masih ada waktu untuk menukar atau membelinya.

**Di Wokwi:** pakai [`diagram.json`](kode/modul07_bme280/diagram.json) dan [`libraries.txt`](kode/modul07_bme280/libraries.txt) Praktik 3. Wokwi belum punya BME280, jadi diagram itu memasang **BMP180** di bus I2C (selain layar dan DHT22). BMP180 adalah sensor tekanan generasi lama dari Bosch, beralamat `0x77`, dengan chip ID `0x55`. Hasilnya menunjukkan bahwa pemeriksaan chip ID bekerja, persis seperti saat sensor palsu tertangkap:

```text
Ada perangkat di 0x77. Memeriksa chip ID-nya...
Chip ID-nya 0x55, bukan 0x60. Ini BMP180: sepupu lama BME280, hanya suhu dan tekanan.
Bacaan pertama muncul 2 detik lagi.
DHT22 : suhu=28.5 C  kelembapan=71 %
BME280: tidak siap (lihat pesan di atas)
DHT22 : suhu=28.5 C  kelembapan=71 %
BME280: tidak siap (lihat pesan di atas)
```

![Tangkapan layar Wokwi Praktik 3, dipotong dan diberi penanda. Rangkaian: DHT22 di atas papan ESP32 dengan kabel data kuning ke D14 (penanda 2); modul BMP180 biru di kiri bawah dengan kabel VCC, GND, SCL, dan SDA, sebagai pengganti BME280 karena Wokwi belum punya BME280, alamatnya 0x77 (penanda 1); dan layar OLED di kanan bawah pada bus I2C yang sama, alamat 0x3C, tidak dipakai sketsa ini (penanda 3). Bawah, Serial Monitor: Ada perangkat di 0x77. Memeriksa chip ID-nya..., lalu baris yang dikotaki, Chip ID-nya 0x55, bukan 0x60. Ini BMP180: sepupu lama BME280, hanya suhu dan tekanan. (penanda 4: pemeriksaan chip ID bekerja), dan Bacaan pertama muncul 2 detik lagi.](aset/wokwi-bme280.png)

*Tangkapan layar [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), Oktober 2026; dipakai untuk tujuan pendidikan, penanda oleh penulis.*

Jalankan juga sketsa pemindai dengan diagram yang sama: hentikan simulasi (**■**), ganti isi tab `sketch.ino` dengan kode pemindai Praktik 1.3, lalu klik **▶**. Wokwi menemukan dua perangkat, `0x3C` (layar) dan `0x77` (BMP180).

#### 3.5 Bereksperimen (papan asli)

1. **Embuskan napas** pelan ke arah kedua sensor dari jarak sekitar 10 cm. Kelembapan keduanya naik. Perhatikan mana yang bereaksi lebih dulu: biasanya BME280.
2. **Jepit BME280 di antara dua jari** selama setengah menit. Suhunya naik, sedangkan suhu DHT22 tidak karena hanya BME280 yang kamu hangatkan.
3. **Bandingkan tekanan** dengan prakiraan cuaca daring untuk kotamu, yang biasanya menulis tekanan dalam hPa atau mbar (1 hPa sama dengan 1 mbar). Kalau kotamu berada di dataran tinggi, angka BME280 jauh lebih kecil karena prakiraan cuaca menuliskan tekanan yang sudah dihitung ulang seolah-olah diukur di permukaan laut. Bedanya sekitar 12 hPa untuk setiap 100 meter ketinggian kotamu.

#### 3.6 Lepaskan dan simpan BME280

Setelah selesai, matikan MB102 (kalau menyala), cabut USB, lalu lepas keempat kabel BME280. Simpan modulnya di kotak kering untuk Node 2 (Modul 14). Layar dan kedua kabel jembatan tetap terpasang.

> ⬆️ **Selesai Praktik 3?** Kembali ke [Konsep 5](#5-1-wire-banyak-sensor-satu-kabel-dan-nomor-seri) (➡️ di sana akan mengantarmu ke Praktik 4).

### Praktik 4 — DS18B20: suhu air lewat satu kabel (30 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** (dengan **Library Manager**) atau Wokwi, probe DS18B20 tahan air + modul adaptornya, 3 kabel jumper **jantan–betina** (oranye, ungu, hitam), obeng kecil untuk terminal sekrup adaptor, segelas air di atas nampan, dan lap. Layar tetap terpasang; BME280 sudah dilepas. Konsep yang dipakai: 5.

#### 4.1 Pasang dua library sekaligus: OneWire dan DallasTemperature

1. Di **Library Manager**, ketik **OneWire**. Pilih yang namanya persis **OneWire**, dengan nama pembuat yang diawali **Jim Studt, Tom Pollard, …**, versi **2.3.8**, lalu klik **INSTALL**. Jangan pilih **OneWireNg**, **OneWireHub**, atau **MAX31850 OneWire**.
2. Ketik **DallasTemperature**. Pilih **DallasTemperature** dengan nama pembuat yang diawali **Miles Burton**, versi **4.0.6**, lalu klik **INSTALL**.

Kali ini **tidak ada** jendela `Install library dependencies`: DallasTemperature 4.0.6 tidak mendaftarkan OneWire sebagai pendampingnya. Karena itulah OneWire dipasang sendiri di langkah 1. Kalau kamu lupa memasang OneWire, kompilasi gagal dengan pesan `fatal error: OneWire.h: No such file or directory`.

#### 4.2 Pasang adaptor dan probe

Pastikan MB102 mati dan USB tercabut.

1. **Sambungkan probe ke adaptor.** Longgarkan tiga sekrup di terminal hijau adaptor, masukkan ujung kawat probe sesuai tulisan di sampingnya (biasanya merah ke VCC, hitam ke GND, kuning atau putih ke DAT), lalu kencangkan lagi. Tarik pelan setiap kawat untuk memastikan kawat itu terjepit kuat.
2. **Sambungkan adaptor ke breadboard:**

| Kabel (jantan–betina) | Dari kaki adaptor | Ke | Gunanya |
| :--- | :--- | :--- | :--- |
| **Oranye** | **VCC** | rel bawah **(+)** kolom 14 | 3,3 V dari ESP32, **jangan 5 V** |
| **Ungu** | **DAT** (kadang ditulis DQ, OUT, atau S) | **9e** | jalur kaki RX2 (GPIO 16) |
| **Hitam** | **GND** | rel bawah **(−)** kolom 16 | GND |

> [!CAUTION]
> **9e, bukan 9f–9j.** Kaki RX2 ada di 9b, dan jalurnya hanya baris a–e. Kolom 9 di bawah parit (baris f–j) adalah jalur kaki katoda LED status yang dipasang di Modul 5, dan jalur itu tersambung ke GND. Kabel DAT yang tertancap di sana membuat sensor tidak pernah terbaca.

![Ilustrasi meja kerja setelah Praktik 4. BME280 sudah dilepas; layar OLED dan kedua kabel jembatan digambar pudar. Di depan breadboard bawah, adaptor DS18B20 biru dengan tiga kaki VCC, DAT, GND dan terminal sekrup hijau; kabel hitam probe tahan air keluar dari terminal ke ujung baja. Kabel oranye dari VCC lurus ke rel bawah plus kolom 14; kabel ungu dari DAT naik di kolom 15 sampai parit tengah, lalu ke kiri sampai kolom 9 dan naik ke 9e; kabel hitam dari GND lurus ke rel bawah minus kolom 16. Label: DAT ke 9e, jalur RX2 (GPIO 16), di atas parit; DS18B20 diberi 3,3 volt dari rel bawah, jangan 5 volt. Kotak perbesaran kolom 7 sampai 17 dengan nama kaki ESP32 di atasnya dan tiga penanda untuk ketiga kabel. Kotak catatan ungu: awas, 9e di atas parit tidak sama dengan 9f sampai 9j di bawah parit karena kolom 9 baris f sampai j adalah jalur katoda LED status yang tersambung ke GND; resistor 4,7 kiloohm sudah ada di adaptor, jadi tidak perlu dipasang lagi](aset/meja-kerja-ds18b20.png)

**Probe tanpa adaptor?** Ujung kawatnya berupa serabut yang sulit ditancapkan ke breadboard. Cara paling mudah adalah membeli adaptornya atau meminta bantuan orang lain untuk menyolder ujung kawat ke kaki *header*. Kalau ujung kawatmu sudah bisa ditancapkan, sambungkan kawat merah ke rel bawah (+) kolom 14, kawat hitam ke rel bawah (−) kolom 16, dan kawat kuning ke **9e**. Setelah itu, pasang sendiri resistor **4,7 kΩ** (4 gelang: kuning-ungu-merah; 5 gelang: kuning-ungu-hitam-cokelat) dari **9d** ke **4d**. Lubang 4d berada di jalur kaki 3V3 ESP32, jadi resistor itu menarik kabel DATA ke 3,3 V. Sambil menunggu adaptor atau bantuan menyolder, kerjakan versi Wokwi-nya (akhir 4.3) supaya kamu tetap bisa melanjutkan modul ini.

#### 4.3 Baca suhunya

Colokkan USB, lalu sentuh adaptor dan probe sebentar. Kalau ada yang terasa hangat, cabut USB segera: VCC dan GND kemungkinan terbalik. Buat sketsa baru `modul07_ds18b20`, tempel kode ini, lalu klik **Upload**:

```cpp
// Modul 7 - Praktik 4: sensor suhu DS18B20 di bus 1-Wire
// Kaki DATA DS18B20 ke RX2 (GPIO 16, dipinjam sementara). Resistor pull-up 4,7 kOhm dari DATA ke 3,3 V
// (modul adaptor biasanya sudah membawanya). DS18B20 diberi 3,3 V, BUKAN 5 V.
// Library: OneWire 2.3.8 dan DallasTemperature 4.0.6. Pasang KEDUANYA: DallasTemperature tidak menawarkan OneWire.

#include <OneWire.h>
#include <DallasTemperature.h>

const int PIN_SATU_KABEL = 16;  // RX2: bus 1-Wire (dipinjam sementara, lihat PETA-PIN.md)
const int MAKS_SENSOR = 4;      // sketsa ini mencatat paling banyak 4 sensor

OneWire satuKabel(PIN_SATU_KABEL);           // "jalan" 1-Wire-nya
DallasTemperature sensorSuhu(&satuKabel);    // "penerjemah" DS18B20 yang memakai jalan itu
DeviceAddress nomorSeri[MAKS_SENSOR];        // tempat menyimpan nomor seri (8 byte) setiap sensor
int jumlahSensor = 0;

// Mencetak nomor seri 8 byte, misalnya 28-FF-64-1E-0F-6A-D3-3C.
void cetakNomorSeri(DeviceAddress nomor) {
  for (int i = 0; i < 8; i++) {
    if (nomor[i] < 0x10) {
      Serial.print("0");
    }
    Serial.print(nomor[i], HEX);
    if (i < 7) {
      Serial.print("-");
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  sensorSuhu.begin();  // menyusuri bus dan menghitung sensor yang menjawab
  jumlahSensor = sensorSuhu.getDeviceCount();
  if (jumlahSensor > MAKS_SENSOR) {
    jumlahSensor = MAKS_SENSOR;
  }
  Serial.print("Ditemukan ");
  Serial.print(jumlahSensor);
  Serial.println(" sensor DS18B20.");
  for (int i = 0; i < jumlahSensor; i++) {
    sensorSuhu.getAddress(nomorSeri[i], i);
    Serial.print("  Sensor ");
    Serial.print(i + 1);
    Serial.print(": nomor seri ");
    cetakNomorSeri(nomorSeri[i]);
    Serial.println();
  }
  if (jumlahSensor == 0) {
    Serial.println("Periksa kabel DATA (RX2), VCC (3,3 V), GND, dan resistor 4,7 kOhm, lalu tekan EN.");
  }
}

void loop() {
  if (jumlahSensor == 0) {  // belum ada sensor: ingatkan setiap 5 detik, kalau-kalau pesan di setup() terlewat
    Serial.println("Belum ada DS18B20 yang terbaca. Cabut USB, periksa kabel, lalu colokkan lagi.");
    delay(5000);
    return;
  }
  sensorSuhu.requestTemperatures();  // serukan kepada SEMUA sensor sekaligus: "ukur sekarang!" (sampai 750 ms)
  for (int i = 0; i < jumlahSensor; i++) {
    float suhu = sensorSuhu.getTempC(nomorSeri[i]);  // tanya satu per satu lewat nomor serinya
    Serial.print("Sensor ");
    Serial.print(i + 1);
    Serial.print(": ");
    if (suhu == DEVICE_DISCONNECTED_C) {  // -127: library tidak memercayai bacaan ini
      Serial.println("tidak terbaca! Kabelnya lepas atau dayanya terputus-putus?");
    } else if (suhu == 85.0) {            // 85: angka bawaan sensor yang baru menyala (library 4.0.6 biasanya menggantinya dengan -127)
      Serial.println("85.00 C (curiga: sensor baru menyala atau dayanya kurang)");
    } else {
      Serial.print(suhu, 2);
      Serial.println(" C");
    }
  }
  delay(2000);
}
```

Buka Serial Monitor (**115200 baud**). Daftar sensor dan nomor serinya hanya dicetak **sekali**, saat papan baru menyala; sesudah itu yang muncul hanya suhu setiap 2 detik. Kalau baris `Ditemukan … sensor DS18B20.` dan nomor seri tidak terlihat, tekan tombol **EN** di papan ESP32 untuk mengulang program dari awal.

**Hasilnya** di papan asli kira-kira seperti ini (nomor seri dan suhumu pasti berbeda):

```text
Ditemukan 1 sensor DS18B20.
  Sensor 1: nomor seri 28-FF-64-1E-0F-6A-D3-3C
Sensor 1: 27.94 C
Sensor 1: 27.94 C
Sensor 1: 28.00 C
```

Muncul `Ditemukan 0 sensor DS18B20.` (dan setiap 5 detik `Belum ada DS18B20 yang terbaca…`)? Cabut USB, lalu periksa kabel DAT: harus di **9e**, bukan 9f–9j. Penyebab lainnya ada di [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan), bagian DS18B20.

Salin nomor seri sensormu ke kertas atau Notepad dulu (blok teksnya di Serial Monitor, lalu **Ctrl + C**). File `catatan-modul07.md` baru dibuat di Praktik 8, dan nomor itu akan dipakai lagi di Node 2.

**Di Wokwi:** pakai [`diagram.json`](kode/modul07_ds18b20/diagram.json) dan [`libraries.txt`](kode/modul07_ds18b20/libraries.txt) Praktik 4. Diagram itu memasang **dua** DS18B20 di satu kabel DATA, ditambah resistor *pull-up* 4,7 kΩ, supaya kamu bisa melihat dua nomor seri sekaligus. Klik salah satu sensor: muncul jendela `DALLAS DS18B20 TEMPERATURE SENSOR` dengan penggeser **Temperature**. Geser penggesernya, dan beberapa detik kemudian Serial Monitor mencetak suhu baru sensor itu.

```text
Ditemukan 2 sensor DS18B20.
  Sensor 1: nomor seri 28-3A-2B-1C-0D-0E-0F-13
  Sensor 2: nomor seri 28-7F-6E-5D-4C-3B-2A-8D
Sensor 1: 26.50 C
Sensor 2: 31.25 C
```

![Tangkapan layar Wokwi Praktik 4, dipotong dan diberi penanda. Atas, jendela DALLAS DS18B20 TEMPERATURE SENSOR yang muncul setelah sensor pertama diklik: penggeser Temperature digeser sampai 60.0°C (penanda 1), dengan Device Address 28 3A 2B 1C 0D 0E 0F. Tengah, rangkaian: papan ESP32 dengan kabel oranye dari RX2 ke kaki data kedua DS18B20 (penanda 3); resistor pull-up 4,7 kiloohm dari kabel itu ke simbol VCC (penanda 2); kaki VCC kedua sensor ke simbol VCC dan kaki GND ke simbol segitiga. Bawah, Serial Monitor: Ditemukan 2 sensor DS18B20., dua baris nomor seri, 28-3A-2B-1C-0D-0E-0F-13 dan 28-7F-6E-5D-4C-3B-2A-8D (penanda 4), lalu Sensor 1: 60.00 C (penanda 5) dan Sensor 2: 31.25 C](aset/wokwi-ds18b20.png)

*Tangkapan layar [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), Oktober 2026; dipakai untuk tujuan pendidikan, penanda oleh penulis.*

#### 4.4 Bereksperimen (papan asli)

1. **Genggam ujung baja probe.** Suhu naik pelan-pelan mendekati suhu tanganmu (sekitar 33–35 °C), lalu turun lagi setelah dilepas. Perhatikan bahwa angkanya bergerak dalam langkah kecil sekitar 0,06 °C: itulah kehalusan 0,0625 °C pada resolusi 12-bit.
2. **Celupkan ujung baja ke segelas air** di atas nampan. Hanya ujung baja dan sebagian kabelnya yang boleh masuk air; adaptor dan breadboard tetap kering. Tunggu sekitar satu menit sampai angkanya stabil.
3. **Tambahkan beberapa es batu** ke gelas, lalu lihat suhunya turun. Jangan memakai air panas atau air mendidih: kabel probe murah belum tentu tahan panas.

**Angka −127 dan 85 di dunia nyata.** Kalau muncul `tidak terbaca! …`, periksa sambungan DAT dan GND dulu (sekrup terminal, lubang 9e), lalu daya sensor (kabel VCC ke rel bawah (+)). Library 4.0.6 juga melaporkan sensor yang menyala ulang karena dayanya terputus-putus sebagai −127. Pesan `85.00 C (curiga: …)` jarang muncul dengan library ini; kalau muncul terus, artinya sama: dayanya terputus-putus. Jangan mencoba memancing pesan ini dengan mencabut kabel saat papan menyala; ingat aturan merakit minggu ini.

#### 4.5 Lepaskan dan simpan DS18B20

Matikan MB102 (kalau menyala), cabut USB, lalu lepas ketiga kabel adaptor. Keringkan probe dengan lap, lalu simpan bersama adaptornya untuk Node 2.

> ⬆️ **Selesai Praktik 4?** Kembali ke [Konsep 6](#6-spi-dan-kartu-microsd-lebih-banyak-kabel-lebih-cepat) (➡️ di sana akan mengantarmu ke Praktik 5).

### Praktik 5 — (Opsional) Catatan CSV di kartu microSD (35 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** atau Wokwi, modul microSD, kartu microSD 4–16 GB yang **boleh dikosongkan**, 6 kabel jumper **jantan–betina** (hitam, merah, biru, hijau, abu-abu, ungu), pembaca kartu untuk laptop, dan MB102 (modul beregulator butuh 5 V dari rel atas). Tidak ada library baru: **SD** dan **SPI** sudah ikut paket esp32. Konsep yang dipakai: 6.
>
> Praktik ini **opsional**. Kalau kamu tidak punya modul microSD, kerjakan versi Wokwi-nya saja atau langsung lanjut ke Konsep 7.

#### 5.1 Siapkan kartunya (di laptop)

> [!WARNING]
> **Memformat kartu menghapus seluruh isinya.** Pakai kartu kosong atau kartu yang isinya sudah dipindahkan. Pastikan *drive* (kandar) yang akan kamu format benar-benar kartu microSD, bukan *flashdisk* atau *harddisk* (cakram keras) lain.

1. Masukkan kartu ke pembaca kartu laptop (pakai adaptor SD kalau perlu).
2. **Windows:** buka **File Explorer**, klik kanan *drive* kartu → **Properties**. Kalau di baris **File system** tertulis `FAT32`, kartu siap; lewati langkah 3. Kalau tertulis format lain (misalnya `exFAT`), lanjut ke langkah 3.
   **macOS:** buka **Disk Utility**, pilih kartunya di bilah kiri. Kalau formatnya `MS-DOS (FAT32)`, kartu siap.
3. **Format sebagai FAT32.** Windows: klik kanan *drive* kartu → **Format…** → di **File system** pilih **FAT32** → **Start**. macOS: **Disk Utility** → pilih kartu → **Erase** → **Format: MS-DOS (FAT)** → **Erase**. Kalau Windows tidak menawarkan FAT32, kartumu lebih besar daripada 32 GB; pakailah kartu 4–16 GB.
4. Keluarkan kartu dengan aman (Windows: klik kanan *drive* kartu di **File Explorer** → **Eject**; macOS: tombol **⏏** di samping nama kartu di **Finder**), lalu masukkan ke slot modul microSD dengan **kontak emas menghadap papan modul** (sisi bertulisan menghadap ke atas) sampai terdengar "klik" kecil. Ada juga slot yang tidak berbunyi; dorong saja sampai kartu tidak bisa masuk lebih dalam.

#### 5.2 Pasang modul microSD

Pastikan MB102 mati dan USB tercabut. DS18B20 sudah dilepas di Praktik 4. Letakkan modul microSD di meja, di depan breadboard bawah, di sebelah kanan layar.

**Sebelum memasang kabel merah, kenali jenis modulmu.**

- Kaki dayanya bertuliskan "VCC" atau "5V", dan di papannya ada chip hitam kecil bertuliskan "AMS1117-3.3" (tiga kaki di satu sisi, satu sirip lebar di sisi lain): ini modul **beregulator**. Kabel merah ke rel **atas** (+) kolom 22, yaitu rel 5 V dari MB102 di breadboard atas.
- Kaki dayanya bertuliskan "3V3" atau "3.3V", atau papannya tidak punya chip regulator: ini modul **3,3 V saja**. Kabel merah ke rel **bawah** (+) kolom 21.
- **Masih ragu? Mulailah dari rel bawah (3,3 V).** Kalau ternyata modulmu beregulator, akibat terburuknya kartu tidak terbaca, dan kamu tinggal memindahkan kabel merah ke rel atas (dengan MB102 mati dan USB tercabut). Sebaliknya, 5 V pada modul 3,3 V bisa merusak kartu dan pin ESP32.

Setelah itu, pasang keenam kabel menurut **tulisan di modulmu**:

| Kabel (jantan–betina) | Dari kaki modul | Ke | Gunanya |
| :--- | :--- | :--- | :--- |
| **Hitam** | **GND** | rel bawah **(−)** kolom 21 | GND |
| **Merah** | **VCC** | modul beregulator: rel **atas** **(+)** kolom 22; modul 3,3 V saja: rel **bawah** **(+)** kolom 21 | daya modul (lihat penjelasan di atas tabel) |
| **Biru** | **MISO** (kadang ditulis **DO**) | 13e | jalur D19: data dari kartu ke ESP32 |
| **Hijau** | **MOSI** (kadang ditulis **DI**) | 18e | jalur D23: data dari ESP32 ke kartu |
| **Abu-abu** | **SCK** (kadang **CLK**) | 12e | jalur D18: detak |
| **Ungu** | **CS** | 11e | jalur D5: "pilih aku" |

Kabel merah ke rel atas cukup panjang untuk melewati papan ESP32; selipkan di samping kanan papan. Kabel-kabel modul boleh bersilangan.

![Peta kabel modul microSD. Atas, modul microSD biru besar, contoh enam kaki, dengan regulator, penerjemah tegangan, dan kartu microSD; keenam kakinya di sisi kanan, masing-masing disambungkan dengan garis berwarna ke kotak tujuannya: GND hitam ke rel bawah minus kolom 21, GND bersama; VCC merah ke rel atas plus kolom 22, 5 volt dari MB102 untuk modul beregulator, umumnya enam kaki, dengan catatan modul 3,3 volt tanpa regulator ke rel bawah plus kolom 21; MISO biru ke 13e, jalur D19, data dari kartu ke ESP32; MOSI hijau ke 18e, jalur D23, data dari ESP32 ke kartu; SCK abu-abu ke 12e, jalur D18, detak SPI; CS ungu ke 11e, jalur D5, pilih aku. Bawah, perbesaran breadboard bawah kolom 8 sampai 23, dengan nama kaki ESP32, D4 sampai D23, di atas kolom 8 sampai 18; kabel layar OLED dan kedua kabel jembatan digambar pudar. Lingkaran berwarna menandai 11e CS, 12e SCK, 13e MISO, 18e MOSI, rel bawah minus kolom 21 untuk GND, dan rel bawah plus kolom 21 untuk VCC modul 3,3 volt. Kotak saran: sebelum memasang, matikan MB102, lalu cabut USB; sesudah selesai, colokkan USB, nyalakan MB102, lalu tekan EN di papan ESP32 karena program mencari kartu sekali saja dan modul beregulator baru hidup dari MB102; kartu microSD 4 sampai 16 GB, format FAT32. Catatan bawah: kabel-kabel modul boleh bersilangan atau lewat di bawah lengkungan kabel jembatan](aset/peta-kabel-microsd.png)

#### 5.3 Tulis catatan pertamamu

1. Colokkan USB dulu, **baru nyalakan MB102** (modul beregulator butuh 5 V dari rel atas).
2. Buat sketsa baru `modul07_log_microsd`, tempel kode ini, lalu klik **Upload**:

   ```cpp
   // Modul 7 - Praktik 5 (opsional): mencatat bacaan ke kartu microSD sebagai file CSV
   // Modul microSD di bus SPI: SCK ke D18, MISO ke D19, MOSI ke D23, CS ke D5.
   // Sensor cahaya (LDR) tetap di VP seperti Modul 6.
   // Tidak perlu memasang library apa pun: SD dan SPI sudah ikut paket esp32.

   #include <SPI.h>
   #include <SD.h>

   const int PIN_SD_CS = 5;    // D5: "pilih aku" untuk kartu microSD (peta pin kanonik)
   const int PIN_LDR = 36;     // VP: LDR (peta pin kanonik)
   const char* NAMA_FILE = "/catatan.csv";  // nama file di kartu, selalu diawali garis miring
   const int DETIK_PER_CATATAN = 5;         // satu baris setiap 5 detik

   bool kartuSiap = false;

   // Mencetak seluruh isi file ke Serial Monitor.
   void cetakIsiFile() {
     File file = SD.open(NAMA_FILE, FILE_READ);
     if (!file) {
       Serial.println("(file belum ada)");
       return;
     }
     while (file.available()) {
       Serial.write(file.read());  // salin huruf demi huruf, apa adanya
     }
     file.close();
   }

   // Menambahkan satu baris di akhir file. Menjawab true kalau berhasil.
   bool tambahBaris(String baris) {
     File file = SD.open(NAMA_FILE, FILE_APPEND);  // APPEND = menambah di akhir, isi lama tidak hilang
     if (!file) {
       return false;
     }
     file.println(baris);
     file.close();  // WAJIB: baru setelah ditutup, isinya benar-benar tersimpan di kartu
     return true;
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     Serial.println();
     if (!SD.begin(PIN_SD_CS)) {
       Serial.println("Kartu microSD tidak terbaca! Periksa kartunya (FAT32), keenam kabel, dan daya modul.");
       return;  // kartuSiap tetap false, jadi loop() tidak mencoba menulis
     }
     kartuSiap = true;
     Serial.print("Kartu terbaca, ukurannya ");
     Serial.print(SD.cardSize() / (1024 * 1024));
     Serial.println(" MB.");

     if (!SD.exists(NAMA_FILE)) {
       tambahBaris("uptime_s,cahaya");  // baris pertama CSV = nama-nama kolom
       Serial.println("File baru dibuat: catatan.csv");
     }
     Serial.println("---- isi catatan.csv saat ini ----");
     cetakIsiFile();
     Serial.println("---- akhir file ----");
   }

   void loop() {
     if (!kartuSiap) {  // kartu belum terbaca: ingatkan setiap 5 detik, kalau-kalau pesan di setup() terlewat
       Serial.println("Kartu belum terbaca. MB102 baru dinyalakan? Tekan EN. Tetap gagal? Matikan MB102, cabut USB, lalu periksa kartu dan kabel.");
       delay(5000);
       return;
     }
     delay(DETIK_PER_CATATAN * 1000);
     unsigned long detik = millis() / 1000;          // detik sejak papan menyala
     int cahaya = 4095 - analogRead(PIN_LDR);        // dibalik seperti Modul 6: makin terang, makin besar
     String baris = String(detik) + "," + String(cahaya);
     if (tambahBaris(baris)) {
       Serial.print("ditulis: ");
       Serial.println(baris);
     } else {
       Serial.println("Gagal menulis! Kartunya tercabut?");
     }
   }
   ```

3. Buka Serial Monitor (**115200 baud**). Setiap 5 detik, satu baris baru ditulis ke kartu. Baris-baris awal, dari `Kartu terbaca…` sampai `---- akhir file ----`, hanya dicetak sekali saat papan menyala; kalau tidak terlihat, tekan **EN**. Kalau yang muncul `Kartu belum terbaca…` setiap 5 detik, lihat [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan), bagian microSD.

**Hasilnya** saat pertama kali dijalankan dengan kartu 8 GB kira-kira seperti ini (ukuran dan angka cahayamu pasti berbeda):

```text
Kartu terbaca, ukurannya 7580 MB.
File baru dibuat: catatan.csv
---- isi catatan.csv saat ini ----
uptime_s,cahaya
---- akhir file ----
ditulis: 6,3094
ditulis: 11,3102
ditulis: 16,1450
```

Baris `16,1450` di contoh ini ditulis saat LDR ditutupi tangan. Ukuran kartu dicetak dalam MB menurut hitungan komputer (1 MB = 1.048.576 byte), jadi kartu "8 GB" terbaca sedikit di bawah 8.000 MB.

#### 5.4 Buktikan catatannya awet

1. Tekan tombol **EN** di papan ESP32. Program mulai dari awal, lalu mencetak isi lama file: semua baris tadi masih ada. Baris baru ditambahkan di bawahnya, dengan `uptime_s` yang kembali mulai dari angka kecil karena papan baru menyala ulang.
2. Matikan MB102, cabut USB, dan tunggu beberapa detik. Nyalakan lagi dengan urutan biasa: colokkan USB dulu, nyalakan MB102, **lalu tekan tombol EN** di papan ESP32. Tombol EN perlu ditekan karena program mencari kartu hanya sekali, tepat setelah papan menyala. Saat USB baru dicolokkan, modul microSD beregulator belum mendapat 5 V dari MB102, jadi Serial Monitor mungkin menulis `Kartu microSD tidak terbaca!` lalu `Kartu belum terbaca…`; itu wajar. Setelah EN ditekan, Serial Monitor mencetak isi lama file: semuanya masih utuh. Itulah gunanya kartu: catatan tidak hilang walaupun listrik putus. (Dengan modul 3,3 V saja, kartu langsung terbaca, dan menekan EN pun tidak apa-apa.)

#### 5.5 Buka catatannya di laptop

1. **Matikan MB102, lalu cabut USB.** Jangan mencabut kartu saat papan menyala; kartu bisa rusak kalau dicabut ketika sedang ditulis.
2. Keluarkan kartu dari modul, masukkan ke pembaca kartu laptop, lalu buka file `catatan.csv`:
   - **Notepad** (Windows) atau **TextEdit** (macOS): isinya sama persis dengan yang tercetak di Serial Monitor.
   - **Excel:** buka Excel kosong, pilih **Data → From Text/CSV** (Excel berbahasa Indonesia: **Data → Dari Teks/CSV**), pilih `catatan.csv`, pastikan **Delimiter** (**Pemisah**) bertuliskan **Comma** (**Koma**), lalu klik **Load** (**Muat**). Jangan membuka file CSV dengan klik dua kali: Excel berpengaturan wilayah Indonesia memakai titik koma sebagai pemisah, jadi semua isinya bisa masuk ke satu kolom.
   - **Google Sheets:** **File → Import → Upload**, pilih `catatan.csv`, pilih **Comma** di **Separator type**, lalu klik **Import data**.
   - Kolom `uptime_s` dan `cahaya` tampil sebagai tabel, dan kamu bisa membuat grafik garisnya.
3. Keluarkan kartu dengan aman, lalu kembalikan ke slot modul.

**Di Wokwi:** pakai [`diagram.json`](kode/modul07_log_microsd/diagram.json) Praktik 5. Diagram itu memasang kartu microSD dan modul sensor cahaya. Kartu Wokwi berukuran 8 MB dan isinya dibuat ulang setiap kali simulasi dimulai, jadi `File baru dibuat` selalu muncul di awal. Karena itu, langkah 5.4 hanya bisa dibuktikan di papan asli: mengeklik tombol kecil di gambar papan ESP32 Wokwi tidak membuatnya menyala ulang, sedangkan menekan **▶** lagi berarti kartu baru yang kosong.

```text
Kartu terbaca, ukurannya 8 MB.
File baru dibuat: catatan.csv
---- isi catatan.csv saat ini ----
uptime_s,cahaya
---- akhir file ----
ditulis: 6,3094
ditulis: 11,3094
ditulis: 16,3094
```

![Tangkapan layar Wokwi Praktik 5, dipotong dan diberi penanda. Rangkaian: modul sensor cahaya di atas papan ESP32 dengan kaki AO ke VP (penanda 2); kartu microSD merah di kanan bawah papan dengan kaki CS ke D5, DI ke D23, SCK ke D18, DO ke D19, VCC ke simbol VCC, dan GND ke simbol segitiga (penanda 1: kartu microSD Wokwi 8 MB; DI sama dengan MOSI, DO sama dengan MISO). Bawah, Serial Monitor: Kartu terbaca, ukurannya 8 MB., File baru dibuat: catatan.csv (penanda 3: kartu Wokwi selalu kosong saat simulasi dimulai), isi file berupa baris judul uptime_s,cahaya, lalu ditulis: 6,3094 dan ditulis: 11,3094 (penanda 4: satu baris CSV baru setiap 5 detik)](aset/wokwi-microsd.png)

*Tangkapan layar [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), Oktober 2026; dipakai untuk tujuan pendidikan, penanda oleh penulis.*

**Biarkan modul microSD terpasang** kalau kamu ingin Node 1 v0.4.0 mencatat bacaannya (bagian ➕). Kalau tidak, matikan MB102, cabut USB, lalu lepas modulnya.

> ⬆️ **Selesai Praktik 5?** Kembali ke [Konsep 7](#7-menggabungkan-banyak-perangkat-tanpa-saling-mengganggu) (➡️ di sana akan mengantarmu ke Praktik 6).

### Praktik 6 — Layar status Node 1 rancanganmu sendiri (40 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** atau Wokwi, rakitan layar dari Praktik 1, kertas berpetak (atau kertas biasa) dan pensil. Tidak ada kabel baru. Konsep yang dipakai: 3 dan 7.
>
> ⭐ **Wajib** — syarat lulus pertama: layar OLED menampilkan semua bacaan Node 1 dengan tata letak yang kamu rancang sendiri.

Inilah syarat lulus pertama: layar yang menampilkan **semua bacaan Node 1** (suhu, kelembapan, cahaya, tanah, gerak, dan level air) dengan tata letak yang **kamu rancang sendiri**. Supaya mudah, kita merancang dengan **bacaan contoh** dulu. Bacaan sensor sungguhan baru dipakai di bagian ➕; sensornya sendiri sudah terpasang sejak Modul 6, jadi tidak ada kabel yang perlu dipasang.

#### 6.1 Rancang di kertas dulu

Gambarlah persegi panjang berukuran 128 × 64 kotak di kertas berpetak (satu kotak = satu titik; di kertas milimeter, persegi panjang itu berukuran 12,8 × 6,4 cm). Setelah itu, putuskan:

1. **Apa yang paling penting?** Tampilkan bagian itu paling besar dan paling atas. Kalau layarmu dua warna, 16 baris teratas berwarna kuning.
2. **Berapa panjang angka terpanjang** setiap bacaan? Suhu bisa `-40.0` sampai `80.0` (batas DHT22), kelembapan sampai `100`, cahaya sampai `4095`, tanah dan level air sampai `100%`.
3. **Bagaimana menampilkan bacaan yang gagal?** Kontrak data Modul 6 menandainya dengan `NAN` dan `-1`; di layar, tulislah `--` supaya tidak tampak seperti angka sungguhan.

Sebagai contoh, rancangan rujukan di sketsa berikut menaruh suhu dan kelembapan dengan angka besar di pita atas, tiga bacaan dengan ikon dan batang persen di tengah, serta baris gerak yang **terbalik** (latar putih) saat ada orang.

![Rancangan rujukan layar status Node 1 di atas kisi 128 kali 64 titik; ukuran dan koordinat diambil dari sketsa Praktik 6. Pita atas, y 0 sampai 15: suhu 28.5 dan kelembapan 71 dengan angka ukuran 2; suhu mulai x 0, kelembapan rata kanan sampai x 122, sedangkan derajat C dan persen ukuran 1. Garis pemisah di y 17, drawFastHLine(0, 17, 128, …). Tiga baris ukuran 1 di y 21, 32, dan 43: ikon di x 0, nama di x 11, angka rata kanan sampai x 82, dan batang persen mulai x 86 selebar 42 titik yang isinya 38 kali persen dibagi 100 titik, untuk Cahaya 3094, Tanah 45 persen, dan Air 80 persen. Baris gerak di y 54 dengan ikon orang, dibalik menjadi latar putih bertuliskan Gerak: ADA ORANG saat ada gerakan. Bawah, kotak uji kasus terburuk sebelum memakai rancanganmu: angka terpanjang, -40.0 derajat C dan 100 persen di pita atas masih menyisakan celah; cahaya terbesar, 4095 tetap berakhir di x 82 sebelum batang; sensor gagal, suhu NAN menjadi --.-, kelembapan dan level air -1 menjadi -- dengan batang kosong; layar dua warna, angka utama di 16 baris teratas yang kuning dan sisanya biru; rancanganmu sendiri, ubah minimal dua hal lalu ulangi uji keempat contoh Praktik 6](aset/desain-layar-node1.png)

#### 6.2 Unggah rancangan rujukan

Buat sketsa baru `modul07_layar_node1`, tempel kode ini, lalu klik **Upload**:

```cpp
// Modul 7 - Praktik 6: merancang layar status Node 1
// Layar OLED menampilkan bacaan kelima sensor Node 1. Untuk merancang, kita memakai bacaan CONTOH yang berganti
// setiap 3 detik, termasuk "kasus terburuk": angka sepanjang mungkin dan sensor yang gagal dibaca.
// Layar OLED: SDA ke D21, SCL ke D22.
// Library: Adafruit SSD1306 2.5.17 (ikut terpasang: Adafruit GFX Library 1.12.6 dan Adafruit BusIO 1.17.4).

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

const int PIN_SDA = 21;          // D21: jalur data I2C (peta pin kanonik)
const int PIN_SCL = 22;          // D22: jalur detak I2C (peta pin kanonik)
const byte ALAMAT_LAYAR = 0x3C;  // "alamat rumah" layar di bus I2C

// Formulir data sensor, sama persis dengan Node 1 (Modul 6).
struct BacaanSensor {
  float suhu;      // derajat Celsius; NAN kalau DHT22 gagal dibaca
  int kelembapan;  // persen; -1 kalau DHT22 gagal dibaca
  int cahaya;      // 0 (gelap gulita) sampai 4095 (sangat terang)
  int tanah;       // persen: 0 = kering seperti di udara, 100 = basah seperti di air
  bool gerak;      // true kalau PIR melihat gerakan
  int level_air;   // persen isi tandon; -1 kalau gema HC-SR04 tidak kembali
};

// Empat bacaan contoh. Isinya berurutan sesuai dengan kolom formulir di atas:
// suhu, kelembapan, cahaya, tanah, gerak, level_air.
BacaanSensor contoh[4] = {
  {28.5, 71, 3094, 45, false, 80},     // 1. siang biasa
  {26.0, 78, 157, 44, true, 79},       // 2. malam, ada orang lewat
  {-40.0, 100, 4095, 100, true, 100},  // 3. kasus terpanjang: semua angka sepanjang mungkin
  {NAN, -1, 0, 0, false, -1},          // 4. DHT22 dan HC-SR04 gagal dibaca
};
const char* namaContoh[4] = {"siang biasa", "malam, ada orang lewat", "kasus terpanjang", "sensor gagal"};
int nomorContoh = 0;

// ---------- Modul 7: layar OLED ----------
Adafruit_SSD1306 layar(128, 64, &Wire, -1);  // lebar 128, tinggi 64, lewat bus I2C, tanpa kaki reset
bool layarAda = false;                       // true kalau layar menjawab di alamat 0x3C

// Ikon 8 x 8 titik: 1 = titik menyala, 0 = padam.
const unsigned char IKON_MATAHARI[] = {
  0b00011000,
  0b01000010,
  0b00111100,
  0b10111101,
  0b10111101,
  0b00111100,
  0b01000010,
  0b00011000,
};
const unsigned char IKON_TANAMAN[] = {
  0b11000011,
  0b01100110,
  0b00111100,
  0b00011000,
  0b00011000,
  0b11111111,
  0b01111110,
  0b00111100,
};
const unsigned char IKON_TANDON[] = {
  0b10000001,
  0b10000001,
  0b10000001,
  0b11011011,
  0b11111111,
  0b11111111,
  0b11111111,
  0b01111110,
};
const unsigned char IKON_ORANG[] = {
  0b00011000,
  0b00011000,
  0b01111110,
  0b00011000,
  0b00011000,
  0b00100100,
  0b01000010,
  0b01000010,
};

// Mencari layar di bus I2C, lalu menyalakannya. Kalau layar tidak ada, program tetap berjalan.
void siapkanLayar() {
  Wire.begin(PIN_SDA, PIN_SCL);
  Wire.beginTransmission(ALAMAT_LAYAR);
  layarAda = Wire.endTransmission() == 0;  // ada yang menjawab di 0x3C?
  if (!layarAda) {
    Serial.println("Layar OLED tidak ditemukan di 0x3C. Node 1 tetap jalan tanpa layar.");
    return;
  }
  layar.begin(SSD1306_SWITCHCAPVCC, ALAMAT_LAYAR);
  layar.cp437(true);  // tabel huruf CP437 yang benar supaya nomor 248 = tanda derajat
  layar.setTextColor(SSD1306_WHITE);
  layar.clearDisplay();
  layar.setTextSize(1);
  layar.setCursor(0, 0);
  layar.println("Node 1 Rumah");
  layar.println("menunggu bacaan...");
  layar.display();
}

// Menulis teks rata kanan: huruf terakhirnya berakhir tepat sebelum x = kanan.
void tulisRataKanan(String teks, int kanan, int y, int ukuran) {
  layar.setTextSize(ukuran);
  layar.setCursor(kanan - teks.length() * 6 * ukuran, y);  // satu huruf = 6 titik x ukuran
  layar.print(teks);
}

// Batang persen: bingkai selebar "lebar" titik, isinya sepanjang persen. Persen di bawah 0 = kosong.
void gambarBatang(int x, int y, int lebar, int persen) {
  layar.drawRect(x, y, lebar, 8, SSD1306_WHITE);
  if (persen > 0) {
    layar.fillRect(x + 2, y + 2, (lebar - 4) * persen / 100, 4, SSD1306_WHITE);
  }
}

// Satu baris layar: ikon, nama, angka rata kanan, lalu batang persen.
// Tanda * pada "const unsigned char* ikon" berarti fungsi ini menerima ikon mana pun yang dikirim
// (mirip const char* untuk teks di Modul 3). Biarkan apa adanya.
void barisBatang(int y, const unsigned char* ikon, String nama, String angka, int persen) {
  layar.drawBitmap(0, y, ikon, 8, 8, SSD1306_WHITE);
  layar.setTextSize(1);
  layar.setCursor(11, y);
  layar.print(nama);
  tulisRataKanan(angka, 82, y, 1);
  gambarBatang(86, y, 42, persen);
}

void tampilkanDiLayar(BacaanSensor b) {
  if (!layarAda) {
    return;
  }
  layar.clearDisplay();

  // Baris atas: suhu di kiri dan kelembapan di kanan. Angkanya besar, satuannya kecil.
  String teksSuhu = "--.-";
  if (!isnan(b.suhu)) {
    teksSuhu = String(b.suhu, 1);
  }
  layar.setTextSize(2);
  layar.setCursor(0, 0);
  layar.print(teksSuhu);
  layar.setTextSize(1);
  layar.write(248);  // tanda derajat
  layar.print("C");

  String teksLembap = "--";
  if (b.kelembapan >= 0) {
    teksLembap = String(b.kelembapan);
  }
  tulisRataKanan(teksLembap, 122, 0, 2);
  layar.setTextSize(1);
  layar.setCursor(122, 0);
  layar.print("%");

  layar.drawFastHLine(0, 17, 128, SSD1306_WHITE);  // garis pemisah

  // Tiga baris dengan batang persen. Cahaya 0-4095 diubah dulu menjadi 0-100 untuk batangnya.
  barisBatang(21, IKON_MATAHARI, "Cahaya", String(b.cahaya), b.cahaya * 100 / 4095);
  barisBatang(32, IKON_TANAMAN, "Tanah", String(b.tanah) + "%", b.tanah);
  String teksAir = "--";
  if (b.level_air >= 0) {
    teksAir = String(b.level_air) + "%";
  }
  barisBatang(43, IKON_TANDON, "Air", teksAir, b.level_air);

  // Baris gerak: dibalik (latar putih) kalau ada gerakan supaya langsung menarik perhatian.
  if (b.gerak) {
    layar.fillRect(0, 53, 128, 10, SSD1306_WHITE);
    layar.drawBitmap(0, 54, IKON_ORANG, 8, 8, SSD1306_BLACK);
    layar.setTextColor(SSD1306_BLACK);
    layar.setCursor(11, 54);
    layar.print("Gerak: ADA ORANG");
    layar.setTextColor(SSD1306_WHITE);
  } else {
    layar.drawBitmap(0, 54, IKON_ORANG, 8, 8, SSD1306_WHITE);
    layar.setCursor(11, 54);
    layar.print("Gerak: sepi");
  }

  layar.display();
}
// ---------- Akhir bagian layar. Mulai dari "Ikon 8 x 8" sampai di sini nanti dipindahkan ke Node 1. ----------

// ---------- Panggung latihan Praktik 6: setup() dan loop() di bawah ini TIDAK ikut dipindahkan. ----------
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  siapkanLayar();
  delay(1000);
}

void loop() {
  Serial.print("Contoh ");
  Serial.print(nomorContoh + 1);
  Serial.print(": ");
  Serial.println(namaContoh[nomorContoh]);
  tampilkanDiLayar(contoh[nomorContoh]);

  nomorContoh++;
  if (nomorContoh > 3) {
    nomorContoh = 0;
  }
  delay(3000);
}
```

Bagian dari baris `// Ikon 8 x 8 titik: 1 = titik menyala, 0 = padam.` sampai kurung kurawal penutup fungsi `tampilkanDiLayar()` (tepat di atas komentar `// ---------- Akhir bagian layar. … ----------`) nanti dipindahkan ke Node 1 di bagian ➕. `setup()` dan `loop()` di bawahnya **tidak** ikut dipindahkan: keduanya hanya "panggung latihan" yang menampilkan empat bacaan contoh bergantian setiap 3 detik dan mencetak nama contohnya di Serial Monitor:

| Contoh | Isinya | Yang diuji |
| :---: | :--- | :--- |
| 1 | siang biasa | tampilan normal |
| 2 | malam, ada orang lewat | cahaya kecil dan baris gerak terbalik |
| 3 | kasus terpanjang | `-40.0`, `100`, `4095`, `100%`: apakah semuanya muat? |
| 4 | sensor gagal | DHT22 dan HC-SR04 gagal: `--.-`, `--`, dan batang kosong |

![Tangkapan layar Wokwi Praktik 6: layar OLED pada keempat contoh bacaan, disusun dua kali dua. Contoh 1, siang biasa: 28.5 derajat C dan 71 persen besar di atas, lalu Cahaya 3094, Tanah 45 persen, dan Air 80 persen, masing-masing dengan ikon dan batang persen, serta Gerak: sepi. Contoh 2, malam, ada orang lewat: 26.0 derajat C dan 78 persen, Cahaya 157 dengan batang hampir kosong, Tanah 44 persen, Air 79 persen, dan baris Gerak: ADA ORANG yang terbalik berlatar putih. Contoh 3, kasus terpanjang: -40.0 derajat C dan 100 persen, Cahaya 4095, Tanah 100 persen, Air 100 persen, dan Gerak: ADA ORANG; semuanya muat. Contoh 4, sensor gagal: --.- derajat C dan -- persen, Cahaya 0, Tanah 0 persen, Air -- dengan batang kosong, dan Gerak: sepi](aset/wokwi-layar-node1.png)

*Tangkapan layar [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), Oktober 2026; dipakai untuk tujuan pendidikan, penanda oleh penulis.*

**Di Wokwi:** pakai [`diagram.json`](kode/modul07_layar_node1/diagram.json) dan [`libraries.txt`](kode/modul07_layar_node1/libraries.txt) Praktik 6.

#### 6.3 Jadikan rancanganmu sendiri

Ubah sketsa itu sampai sesuai rancangan kertasmu. Buat paling sedikit **dua perubahan**, misalnya:

- pindahkan kelembapan ke baris tengah dan beri ikon tetes. Salin dulu larik `IKON_TETES` dari sketsa Praktik 2 dan tempel di samping ikon lain, di bawah baris `// Ikon 8 x 8 titik: …`; tanpa itu, **Verify** gagal dengan pesan `'IKON_TETES' was not declared in this scope`. Karena baris tengah kini berisi empat bacaan setinggi 8 titik, geser nilai y-nya supaya tidak saling menindih;
- ganti batang persen dengan angka besar, atau sebaliknya;
- tampilkan cahaya sebagai kata `terang`/`redup`/`gelap` dengan ambang buatanmu. Contoh lengkapnya: di dalam `tampilkanDiLayar()`, ganti baris `barisBatang(21, IKON_MATAHARI, "Cahaya", String(b.cahaya), b.cahaya * 100 / 4095);` dengan

  ```cpp
  String teksCahaya = "terang";
  if (b.cahaya < 1000) {
    teksCahaya = "gelap";
  } else if (b.cahaya < 2500) {
    teksCahaya = "redup";
  }
  barisBatang(21, IKON_MATAHARI, "Sinar", teksCahaya, b.cahaya * 100 / 4095);
  ```

  Nama barisnya dipendekkan menjadi `Sinar` karena kata `terang` (6 huruf, rata kanan sampai x = 82) akan menempel ke tulisan `Cahaya`. Itulah gunanya menguji kasus terburuk. Angka 1000 ditulis langsung (bukan memakai nama konstanta baru) supaya tidak bentrok dengan `AMBANG_GELAP` milik Node 1 saat dipindahkan nanti;
- ubah tulisan baris gerak, atau ganti ikonnya dengan rancanganmu.

Taruh semua tambahanmu (ikon, fungsi bantu) di antara baris `// Ikon 8 x 8 titik: …` dan akhir fungsi `tampilkanDiLayar()` supaya nanti ikut terbawa ke Node 1 di bagian ➕.

Setiap selesai mengubah, klik **Upload** dan tunggu keempat contoh lewat. **Rancanganmu lulus** kalau pada keempat contoh semua bacaan terbaca jelas, tidak ada tulisan yang saling menindih atau terpotong di tepi layar, dan bacaan yang gagal tampil sebagai `--`, bukan angka aneh. Simpan sketsa akhirnya; isinya akan dipindahkan ke Node 1 di bagian ➕.

> ⬆️ **Selesai Praktik 6?** Kembali ke [Konsep 8](#8-membaca-skematik-simbol-simbol-dasar) dan baca sampai Konsep 9 (➡️ di sana akan mengantarmu ke Praktik 7).

### Praktik 7 — Membaca skematik dan menggambar ulang Node 1 (45 menit)

> 🖥️ **Alat dan komponen:** kertas (berpetak lebih enak) dan pensil — atau situs [diagrams.net](https://app.diagrams.net) di laptop, modul relay dari Modul 5 yang **tetap terpasang** di meja kerja, dan senter HP untuk melihat tulisan kecil (kaca pembesar kalau ada). Matikan MB102 dan cabut USB selama mengamati modul. Konsep yang dipakai: 8 dan 9.
>
> ⭐ **Wajib** — syarat lulus kedua: kamu bisa membaca skematik modul relay dari dokumentasinya dan menggambar ulang Node 1 sebagai skematik.

Inilah syarat lulus kedua: membaca skematik modul dari dokumentasinya, lalu memakai simbol-simbol yang sama untuk menggambar rangkaianmu sendiri.

#### 7.1 Baca skematik modul relay

Buka lagi gambar skematik modul relay di [Konsep 9](#9-membaca-skematik-modul-membedah-modul-relay), lalu **tutup keterangan bernomor di bagian bawah gambar** (gulir supaya hanya skematiknya yang terlihat, atau tutup dengan selembar kertas). Yang dilatih di sini adalah menelusuri garis, bukan menyalin keterangan. Jawab enam pertanyaan ini **dengan kata-katamu sendiri** sambil menunjuk garisnya dengan ujung pensil, di kertas atau di `catatan-modul07.md` (Praktik 8), baru buka kuncinya:

1. Lewat komponen apa saja arus mengalir dari VCC ke kaki IN?
2. Mengapa modul ini aktif LOW?
3. Komponen mana yang memisahkan sisi ESP32 dari sisi kumparan relay, dan bagaimana caranya?
4. Apa yang bisa terjadi pada transistor Q1 kalau dioda D1 tidak ada?
5. Misalkan jumper JD-VCC dicabut dan kaki JD-VCC tidak diberi daya. Apa yang terlihat saat IN diberi `LOW`?
6. Kaki emitor Q1 tidak bergaris ke kaki GND J1. Apakah keduanya tersambung? Dari mana kamu tahu?

<details>
<summary><b>Kunci jawaban</b></summary>

1. Lewat **R1**, **LED indikator**, dan **LED di dalam *optocoupler* U1**, berurutan.
2. Arus baru mengalir kalau kaki IN ditarik ke 0 V. Saat IN `HIGH`, beda tegangannya terlalu kecil untuk menyalakan kedua LED, jadi relay diam.
3. ***Optocoupler* U1.** LED di dalamnya menyinari fototransistor di sebelahnya sehingga perintah menyeberang lewat cahaya, tanpa kabel langsung dari kaki IN ke sisi kumparan. (Selama jumper JD-VCC terpasang, kedua sisi masih berbagi VCC dan GND; pemisahan penuh baru terjadi kalau jumper dicabut dan sisi kumparan diberi catu daya sendiri.)
4. Saat kumparan dimatikan, kumparan menyentakkan tegangan tinggi sesaat. Tanpa D1, sentakan itu menghantam Q1 dan lama-kelamaan bisa merusaknya.
5. LED indikator menyala karena sisi masukan tetap bertenaga, tetapi relay **tidak** berbunyi "klik" karena kumparannya tidak mendapat listrik. Gejala ini sama dengan yang dibahas di 🚨 Modul 5.
6. **Ya.** Keduanya berakhir di simbol GND, dan semua simbol GND tersambung ke GND yang sama (Konsep 8, aturan 3).

</details>

#### 7.2 Cocokkan dengan modul aslimu

Lihat modul relay di meja kerjamu dari atas. Tulisan di komponennya sangat kecil, jadi pakai senter HP. Cari bagian-bagian ini dan centang yang berhasil kamu temukan:

- ***Optocoupler*:** chip hitam kecil berkaki empat, satu untuk setiap kanal. Tulisannya sering mengandung angka "817" (misalnya "PC817" atau "EL817").
- **Transistor:** komponen hitam sangat kecil berkaki tiga di dekat relay. Pada banyak modul, kodenya "J3Y", yaitu kode singkat transistor S8050.
- **Dioda:** komponen kecil bergaris di salah satu ujungnya, letaknya dekat kaki kumparan relay.
- **Resistor:** kotak mungil bertuliskan tiga angka, misalnya "102" (artinya 10 dan dua nol di belakangnya, yaitu 1.000 Ω = 1 kΩ).
- **LED indikator** dan **jumper JD-VCC**: sudah kamu kenal sejak Modul 5.

Tidak semua kode akan sama dengan contoh di atas; modul dari pabrik berbeda memakai komponen yang berbeda. Yang penting, kamu bisa menunjuk "ini *optocoupler*, ini transistor, ini dioda" dan mencocokkannya dengan simbol di skematik.

#### 7.3 Gambar ulang Node 1 sebagai skematik

Sekarang giliranmu membuat skematik. Kamu tidak perlu menggambar semuanya sekaligus; ikuti urutan ini:

1. **Kotak ESP32 di tengah.** Gambar persegi panjang besar, lalu tulis nama kaki yang dipakai Node 1 di tepinya: pin sensor dan layar di satu sisi, pin aktuator di sisi lain. Daftarnya ada di `PETA-PIN.md`.
2. **Simbol daya.** Gambar simbol `3V3` dan `GND` di dekat ESP32. Untuk beban, gambar simbol `5V` dengan catatan "dari MB102".
3. **Komponen sederhana dengan simbolnya.** Gambar LED status + resistor 220 Ω di D4; tombol D13 ke GND; LDR + resistor 10 kΩ + kapasitor 100 nF di VP; pembagi 4,7 kΩ + 10 kΩ di D35 (ECHO HC-SR04); MOSFET dengan resistor 220 Ω dari D25 ke gerbangnya dan resistor 10 kΩ dari D25 ke GND, dioda 1N4007, dan pompa; buzzer + resistor 220 Ω di D27; kapasitor elektrolit 100 µF di kaki daya servo.
4. **Modul sebagai kotak berlabel kaki.** DHT22, sensor tanah, PIR, HC-SR04, modul relay, servo, dan layar OLED cukup digambar sebagai kotak dengan nama kakinya, misalnya kotak "OLED" berkaki GND, VCC, SCL, SDA.
5. **Pakai label nama untuk sambungan jauh**, seperti `SDA`, `SCL`, dan `5V`, supaya gambarmu tidak penuh garis yang bersilangan (Konsep 8, aturan 5).
6. **Periksa sekali lagi.** Pastikan setiap komponen punya jalan ke daya dan ke GND, dan setiap kabel di meja kerjamu ada di gambar.

Setelah selesai, bandingkan dengan skematik rujukan di bawah. Gambarmu boleh berbeda bentuk asalkan sambungannya sama. Kalau kamu memakai perbaikan JD-VCC dari 🚨 Modul 5, gambar kaki VCC modul relay ke `3V3` dan kaki JD-VCC-nya ke `5V` (jumper-nya dicabut), sesuai rakitanmu.

![Skematik rujukan Node 1 bagian sensor dan layar. Di tengah, kotak ESP32 DevKit V1 dengan simbol 3V3 di atas dan GND di bawah; urutan kakinya disusun supaya rapi, bukan urutan di papan. Kiri: pembagi tegangan LDR, dari 3V3 lewat R1 10 kiloohm ke titik tengah yang masuk ke VP, lalu LDR ke GND, dengan C1 100 nanofarad dari VP ke GND; sensor tanah kapasitif dengan AOUT ke VN dan daya 3V3; PIR HC-SR501 dengan OUT ke D34 dan daya 5V, catatan keluaran OUT hanya 3,3 volt; DHT22 dengan out ke D14 dan daya 3V3. Kanan: layar OLED SSD1306 alamat 0x3C dengan SCL ke D22 dan SDA ke D21, daya 3V3; HC-SR04 dengan Trig dari D15 dan Echo lewat R2 4,7 kiloohm ke D35, serta R3 10 kiloohm dari D35 ke GND, daya 5V; modul microSD opsional bergaris putus-putus dengan CS di D5, SCK di D18, MOSI di D23, dan MISO di D19, daya 5V dengan catatan modul 3,3 volt saja ke 3V3. Bawah, catatan: 3V3 dari pin 3V3 ESP32 di rel bawah, 5V dari rel atas MB102, ESP32 dari USB laptop, semua GND disatukan; garis putus-putus berarti opsional (Praktik 5); label SCL dan SDA hanya nama kabel; LED status ada di skematik aktuator](aset/skematik-node1-sensor.png)

![Skematik rujukan Node 1 bagian aktuator. Di tengah, kotak ESP32 dengan GND di bawah. Kiri atas: modul relay dua kanal aktif LOW sebagai kotak dengan VCC ke 5V, IN1 dari D32 untuk lampu, IN2 dari D33 untuk kipas, dan GND; 5V masuk ke COM2, NO2 menuju kipas, lalu ke GND; catatan: kontak relay 1 belum dipakai. Kiri bawah: pompa dari 5V ke kaki D MOSFET Q1 IRLZ44N, dioda D2 1N4007 sejajar pompa dengan garis katoda di sisi 5V, gerbang dari D25 lewat R5 220 ohm, dan R6 10 kiloohm dari titik antara D25 dan R5 ke GND, sama seperti rakitan Modul 5; kaki S ke GND. Kanan: servo SG90 dengan sinyal oranye dari D26, kaki plus merah ke 5V, kaki minus cokelat ke GND, dan kapasitor elektrolit C2 100 mikrofarad di antara 5V dan GND; buzzer pasif dari D27 ke kaki plusnya, kaki minusnya lewat R7 220 ohm ke GND; tombol dari D13 ke GND dengan catatan INPUT_PULLUP; LED status dari D4 lewat R4 220 ohm dan LED ke GND. Bawah, catatan: 5V dari rel atas MB102 untuk semua beban, tidak pernah dari ESP32; semua GND disatukan](aset/skematik-node1-aktuator.png)

**Mau menggambar di laptop?** Buka **https://app.diagrams.net**. Saat ditanya tempat menyimpan, pilih **Device** (perangkat ini), lalu buat diagram kosong. Ketik kata kunci seperti **resistor**, **led**, atau **ground** di kotak pencarian bentuk di panel kiri. Setelah selesai, simpan gambarnya lewat **File → Export as → PNG…**.

#### 7.4 Simpan hasilnya

Potret gambar kertasmu dari atas dengan cahaya terang, atau ekspor gambar diagrams.net-mu. Beri nama **`skematik-node1.jpg`** (atau `.png`), lalu salin ke folder `modul-07`. Foto ini ikut di-*commit* di Praktik 8.

Untuk memindahkan foto dari HP ke laptop, pakai cara yang paling kamu kuasai: kabel USB HP, Google Drive, atau WhatsApp Web (kirim ke dirimu sendiri **sebagai dokumen** supaya gambarnya tidak dikecilkan). Pastikan nama filenya persis `skematik-node1.jpg`, huruf kecil semua.

### Praktik 8 — Simpan ke GitHub (15 menit)

> 🖥️ **Alat yang dipakai:** **Arduino IDE**, **VS Code** (dari Modul 4), dan **GitHub Desktop** (dari Modul 3). Konsep yang dipakai: tidak ada konsep baru.

1. **Simpan sketsa ke repositori.** Sudah menyimpan langsung ke folder `modul-07` sejak awal (kotak **Tip** di awal bagian Praktik)? Lewati langkah ini. Kalau belum, buka sketsanya satu per satu (**File → Sketchbook**), lalu pilih **File → Save As…** dan simpan ke **Documents → GitHub → belajar-iot → modul-07**. Yang wajib ada: `modul07_layar_node1` (rancanganmu dari Praktik 6).
2. **Tulis catatan minggu ini.** Di VS Code, buka folder `belajar-iot` (**File → Open Folder…**). Klik folder `modul-07` di panel Explorer, lalu klik ikon **New File…** dan beri nama `catatan-modul07.md`. Isi dengan temuanmu, misalnya:

   ```markdown
   # Catatan Modul 7

   | Perangkat | Bus | Alamat atau nomor seri |
   | --- | --- | --- |
   | Layar OLED | I2C | 0x3C |
   | BME280 | I2C | 0x76, chip ID 0x60 |
   | DS18B20 | 1-Wire | 28-FF-64-1E-0F-6A-D3-3C |

   ## Jawaban Praktik 7.1
   1. ...
   ```

   Simpan dengan **Ctrl + S**. Alamat dan nomor seri ini dipakai lagi saat merakit Node 2.
3. Pastikan `skematik-node1.jpg` dari Praktik 7 sudah ada di folder `modul-07`. Di GitHub Desktop, **Repository → Show in Explorer** membuka folder repositori yang benar (macOS: **Show in Finder**).
4. Di GitHub Desktop, pastikan kotak **Current repository** bertuliskan **belajar-iot**. Tab **Changes** berisi file-file baru di `modul-07`. Pengguna macOS: hilangkan centang `.DS_Store` kalau muncul.
5. Isi **Summary** dengan `Modul 7: layar OLED, bus I2C/1-Wire/SPI, skematik Node 1`, klik **Commit … to main**, lalu **Push origin**.
6. Klik **Repository → View on GitHub** dan buka folder `modul-07`: sketsa, catatan, dan gambar skematikmu sudah ada di sana.

Tanpa GitHub Desktop? Pakai jalur pengganti di catatan akhir [Modul 4 Praktik 10](../../fase-0-fondasi/modul-04-javascript-nodejs/README.md#praktik-10--simpan-ke-github-checkpoint-fase-0-15-menit).

> ➡️ **Sesudah Praktik 8:** kerjakan [🧩 Tantangan mandiri](#-tantangan-mandiri) (minimal Tingkat 1) dan [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini) — di sana layar rancanganmu masuk ke Node 1 — lalu tutup dengan [📝 Kuis](#-kuis-5-soal) dan [✅ Checklist kelulusan](#-checklist-kelulusan-modul-7). Bagian 🚨 dan 🔬 di antaranya cukup dibuka saat perlu.

---

## 🚨 Kalau Tidak Jalan?

Mulailah dari **pemindai I2C** (Praktik 1.3) untuk semua masalah layar dan BME280: kalau pemindai tidak menemukan perangkatnya, masalahnya hampir pasti di kabel, daya, atau modulnya sendiri, bukan di kode. Klik judul masalah untuk membuka penjelasannya.

> [!IMPORTANT]
> Setiap kali memeriksa atau memindah kabel: **matikan MB102, lalu cabut USB**. Setelah selesai, colokkan USB dulu, baru nyalakan MB102.

<details>
<summary><b><code>Build failed!</code> / <code>Compilation error</code> — pesan error minggu ini</b></summary>

| Pesan (potongan) | Artinya | Obatnya |
| :--- | :--- | :--- |
| `fatal error: Adafruit_SSD1306.h: No such file or directory` | Library layar belum terpasang. | Praktik 1.1. Di Wokwi, isi `libraries.txt` dengan tiga baris dari folder praktiknya. |
| `fatal error: Adafruit_GFX.h: No such file or directory` | Pendamping **Adafruit GFX Library** belum terpasang (biasanya karena mengeklik **INSTALL WITHOUT DEPENDENCIES**). | Pasang **Adafruit GFX Library** 1.12.6 dan **Adafruit BusIO** 1.17.4 di Library Manager. |
| `fatal error: Adafruit_I2CDevice.h: No such file or directory` | Pendamping **Adafruit BusIO** belum terpasang. | Pasang **Adafruit BusIO** 1.17.4. |
| `fatal error: Adafruit_BME280.h: No such file or directory` | Library BME280 belum terpasang. | Praktik 3.1. |
| `fatal error: OneWire.h: No such file or directory` | **OneWire** belum terpasang. DallasTemperature 4.0.6 tidak menawarkannya. | Praktik 4.1 langkah 1: pasang **OneWire** 2.3.8. |
| `fatal error: DallasTemperature.h: No such file or directory` | Library DallasTemperature belum terpasang. | Praktik 4.1 langkah 2. |
| `'layar' was not declared in this scope` | Baris `Adafruit_SSD1306 layar(...)` hilang atau salah tempat, atau namanya salah ketik. | Bandingkan bagian atas sketsamu dengan kode di modul. |
| `'IKON_TETES' was not declared in this scope` | Ikon dipakai sebelum lariknya ikut ditempel ke sketsa. | Salin larik `IKON_TETES` dari sketsa Praktik 2 ke bawah baris `// Ikon 8 x 8 titik: …` (Praktik 6.3). |
| `redefinition of 'void setup()'` atau `redefinition of 'const int …'` | Ada nama yang ditulis dua kali, biasanya karena `setup()`/`loop()` atau konstanta dari sketsa Praktik 6 ikut tersalin ke Node 1. | Hapus salinan yang dobel. Dari sketsa Praktik 6, hanya ikon, fungsi bantu, dan `tampilkanDiLayar()` yang dipindahkan (➕ Langkah 4). |

</details>

<details>
<summary><b>Layar tetap gelap</b></summary>

1. **Jalankan pemindai I2C.** Kalau `0x3C` tidak muncul, periksa kabel (lihat masalah "Pemindai I2C" di bawah).
2. **Pemindai menemukan `0x3D`**: ganti `0x3C` dengan `0x3D` di baris `const byte ALAMAT_LAYAR` sketsamu.
3. **Pemindai menemukan `0x3C`, tetapi layar tetap gelap**: pastikan sketsa yang kamu unggah memanggil `layar.begin(...)` dan `layar.display()`. Sketsa pemindai memang tidak menyalakan layar.
4. **Kabel VCC dan GND tertukar**: pada layar berurutan VCC-GND-SCL-SDA, kabel ke rel harus mengikuti **tulisan** di layar. Kesalahan ini bisa merusak layar dalam hitungan detik. Matikan MB102 (kalau menyala), lalu **segera** cabut USB, betulkan, dan coba lagi. Kalau pemindai kini menemukan `0x3C`, tetapi layar tetap gelap dengan sketsa yang benar, layarnya mungkin sudah rusak.
5. **Lapisan plastik pelindung** di kaca layar tidak menghalangi tampilan; boleh dikupas, boleh juga dibiarkan.

</details>

<details>
<summary><b>Layar menyala, tetapi gambarnya bergeser, bergaris acak, atau terpotong</b></summary>

- **Sebagian besar layar penuh titik acak (seperti semut di TV) dan hanya sepotong pita yang berubah, atau gambar bergeser sekitar dua titik dengan garis acak di tepi kanan:** layarmu kemungkinan besar memakai chip **SH1106** (umum pada layar 1,3 inci), bukan SSD1306. Library minggu ini khusus SSD1306. Tukar dengan layar 0,96 inci SSD1306, atau cari library khusus SH1106 setelah modul ini selesai.
- **Layarmu ternyata 0,91 inci** (128 × 32 titik, bentuknya memanjang): ubah `Adafruit_SSD1306 layar(128, 64, &Wire, -1);` menjadi `Adafruit_SSD1306 layar(128, 32, &Wire, -1);` dan rancang ulang tata letaknya untuk empat baris huruf ukuran 1.
- **Tulisan terpotong di kanan atau turun ke baris berikutnya:** teksmu terlalu panjang untuk ukurannya. Lihat tabel ukuran huruf di Konsep 3.
- **Tanda derajat tampil sebagai dua huruf aneh:** kamu mengetik `°` langsung di `print()`. Pakai `layar.write(248)` dan pastikan `layar.cp437(true)` dipanggil di `setup()`.

</details>

<details>
<summary><b>Pemindai I2C: <code>Tidak ada yang menjawab</code>, atau alamat acak bermunculan</b></summary>

- **SDA dan SCL tertukar** (paling sering): kabel SCL harus di jalur 19 dan SDA di jalur 20, baik dari layar maupun dari BME280.
- **Kabel jembatan salah lubang:** biru harus 14d → 20f, kuning 17e → 19f. Lubang 14a–14e satu jalur dengan kaki D21, dan 17a–17e satu jalur dengan D22; baris f–j kolom 14 dan 17 **tidak** tersambung ke kaki itu.
- **Daya:** VCC ke rel bawah (+), GND ke rel bawah (−). Rel bawah mendapat 3,3 V dari kabel oranye 4e Modul 5; kalau sensor Modul 6 di rel yang sama berfungsi, rel itu sehat.
- **Alamat acak bermunculan** (misalnya `0x08`, `0x51`, `0x7E` berganti-ganti): ada sambungan yang longgar. Tekan setiap ujung kabel bus sampai mantap.
- **Kabel terlalu panjang**: usahakan seluruh kabel bus di bawah sekitar 50 cm.

</details>

<details>
<summary><b>BME280: <code>Tidak ada perangkat di 0x76 maupun 0x77</code>, chip ID bukan <code>0x60</code>, atau angkanya aneh</b></summary>

- **Tidak ada perangkat:** periksa keempat kabel seperti pada masalah pemindai di atas. Pada modul **enam kaki**, jangan sambungkan kaki **CSB** ke GND: CSB yang `LOW` memindahkan BME280 ke mode SPI sehingga tidak menjawab di I2C. Biarkan CSB dan SDO kosong.
- **`Chip ID-nya 0x58`** (atau `0x56`, `0x57`): itu BMP280, tanpa sensor kelembapan. Lihat Praktik 3.4.
- **`Chip ID-nya 0xFF`** atau angka lain yang tidak ada di tabel Konsep 4: komunikasinya terganggu. Periksa kabel, lalu tekan **EN**.
- **Suhu BME280 1–3 °C lebih tinggi daripada DHT22:** modulnya kemungkinan terhangatkan oleh papan ESP32 atau tanganmu, atau sedikit oleh pengukurannya sendiri (library Adafruit membuat sensor mengukur terus-menerus). Jauhkan modulnya beberapa sentimeter dan tunggu beberapa menit. Selisih sampai sekitar 1 °C masih wajar.
- **Tekanan jauh lebih kecil daripada prakiraan cuaca:** wajar di dataran tinggi (Praktik 3.5).

</details>

<details>
<summary><b>DS18B20: <code>Ditemukan 0 sensor</code>, <code>tidak terbaca!</code>, atau <code>85.00 C</code></b></summary>

- **`Ditemukan 0 sensor DS18B20.`** Penyebab paling sering: kabel DAT masuk ke **9f–9j**, bukan **9e** (lihat peringatan di Praktik 4.2). Periksa juga kawat probe di terminal sekrup adaptor: kencangkan sekrupnya dan pastikan warnanya sesuai tulisan. Untuk probe tanpa adaptor, pastikan resistor 4,7 kΩ terpasang dari 9d ke 4d. Selama belum ada sensor yang terbaca, sketsa mengingatkan setiap 5 detik dengan `Belum ada DS18B20 yang terbaca…`. Betulkan kabelnya dengan USB tercabut (lihat kotak di awal bagian ini), colokkan lagi, lalu tekan **EN** kalau baris `Ditemukan … sensor DS18B20.` terlewat.
- **`tidak terbaca! …`** (nilai −127): sensor terbaca saat menyala, lalu hilang atau menyala ulang. Ada sambungan yang longgar (biasanya di terminal sekrup), atau daya sensor terputus-putus. Periksa kawat DAT, GND, dan VCC probe, dan pastikan VCC dari rel bawah (+).
- **`85.00 C (curiga: …)`** terus-menerus (jarang dengan library 4.0.6, lebih sering pada sensor tiruan): sensor menyala ulang karena dayanya terputus-putus. Periksa hal yang sama.
- **Probe atau adaptor terasa hangat:** VCC dan GND kemungkinan terbalik. Matikan MB102 (kalau menyala), lalu **segera** cabut USB, dan cocokkan lagi warna kawat dengan tulisan di adaptor.
- **Angkanya melompat 0,06 °C bolak-balik:** itu wajar; kehalusan sensor memang 0,0625 °C.

</details>

<details>
<summary><b>microSD: <code>Kartu microSD tidak terbaca!</code>, <code>Kartu belum terbaca…</code>, atau <code>Gagal menulis!</code></b></summary>

- **MB102 belum menyala saat program mencari kartu:** modul beregulator butuh 5 V dari rel atas, dan program hanya mencari kartu sekali, tepat setelah papan menyala. Karena urutan menyalakan selalu USB dulu, baru MB102, **tekan tombol EN setelah MB102 menyala** supaya program mencari kartunya lagi.
- **Modul beregulator diberi 3,3 V** (VCC di rel bawah): regulatornya butuh masukan yang lebih tinggi daripada keluarannya, jadi kartu mendapat tegangan yang terlalu rendah dan tidak terbaca. Pindahkan VCC ke rel atas (+) kolom 22 (dengan MB102 mati dan USB tercabut).
- **MISO dan MOSI tertukar:** di modul yang bertuliskan "DI" dan "DO", DO (data keluar dari kartu) adalah MISO ke 13e, dan DI (data masuk ke kartu) adalah MOSI ke 18e.
- **Format kartu bukan FAT32**, atau kartunya lebih dari 32 GB: lihat Praktik 5.1.
- **Kartu belum masuk sampai "klik"**, atau kontak kartunya kotor: matikan MB102 dan cabut USB dulu, baru keluarkan kartunya. Bersihkan kontak emasnya dengan kain kering, masukkan lagi sampai "klik", lalu nyalakan (USB dulu, MB102, lalu tekan **EN**).
- **`Gagal menulis! Kartunya tercabut?`** saat sedang berjalan: kartu tercabut atau sambungannya goyah. Matikan MB102, cabut USB, betulkan, lalu nyalakan lagi (USB dulu, MB102, lalu tekan **EN**).
- **Nama file tanpa garis miring** (misalnya `"catatan.csv"`): di ESP32, nama file harus diawali `/`.

</details>

<details>
<summary><b>Node 1 v0.4.0: layar tidak muncul, kartu tidak terbaca, atau Node 1 terasa lebih lambat</b></summary>

- **Serial Monitor mencetak `Layar OLED tidak ditemukan di 0x3C. Node 1 tetap jalan tanpa layar.`** Node 1 hanya mencari layar sekali, saat menyala. Matikan MB102 dan cabut USB, betulkan kabel layarnya, lalu nyalakan lagi (USB dulu, baru MB102); Node 1 mencari layarnya lagi saat menyala. Kalau baris awalnya terlewat di Serial Monitor, tekan **EN**.
- **`Kartu microSD tidak terbaca: catatan CSV dimatikan.`** Ini normal kalau kamu tidak memasang modul microSD. Kalau modulnya terpasang, pesan ini muncul setiap kali Node 1 dinyalakan dengan urutan "USB dulu, baru MB102" karena saat itu modul beregulator belum bertenaga. Tekan **EN** setelah MB102 menyala. Kalau pesannya tetap muncul, lihat masalah microSD di atas.
- **Baris-baris awal (versi firmware, layar, kartu) tidak terlihat di Serial Monitor:** semuanya dicetak sekali saat Node 1 menyala, sering sebelum Serial Monitor sempat tersambung. Tekan **EN** untuk mengulangnya.
- **Node 1 butuh sekitar satu detik lebih lama saat menyala** kalau modul microSD tidak terpasang: program mencoba menghubungi kartu beberapa kali sebelum menyerah. Itu wajar.
- **Tombol D13 terasa sedikit kurang peka:** setiap 2 detik, Node 1 membaca semua sensor dan memperbarui layar; selama itu, tombol tidak diperiksa. Tekan tombol sedikit lebih lama. Modul 8 menghapus jeda ini dengan `millis()`.

</details>

<details>
<summary><b>Khusus Wokwi</b></summary>

- **Muncul jendela `Build Servers Busy`**: server penyusun program Wokwi yang gratis sedang ramai, dan programmu masih antre. Tunggu beberapa menit. Kalau simulasi tidak kunjung berjalan, klik **CLOSE**, hentikan simulasi (tombol **■**), lalu coba lagi nanti. Sketsa dengan banyak library, seperti Node 1, paling sering terkena antrean ini; sketsa praktik yang lebih kecil biasanya lancar.
- **`Failed to fetch` setelah lama menunggu**: koneksi ke server Wokwi terputus. Klik **▶** lagi.
- **Sebagian rangkaian terpotong di luar panel**: klik area kosong di panel simulasi, lalu tekan **F** supaya seluruh rangkaian muat. Kalau kursor masih di editor kode, huruf f malah terketik di sketsamu; hapus lagi huruf itu.
- **Kabel SDA dan SCL di diagram Wokwi bersilangan**: memang begitu (Praktik 1.2 menjelaskan sebabnya).
- **Praktik 3 di Wokwi menunjukkan BMP180, bukan BME280**: Wokwi belum punya BME280. Pesan `Chip ID-nya 0x55` justru menunjukkan bahwa pemeriksaan chip ID bekerja.
- **Layar Wokwi hanya satu warna**: Wokwi tidak meniru layar dua warna kuning-biru.
- **File di kartu microSD Wokwi hilang setelah simulasi dihentikan**: kartu Wokwi memang dibuat ulang setiap kali simulasi dimulai. Bukti bahwa catatan bertahan saat papan menyala ulang (Praktik 5.4) hanya bisa dilihat di papan asli.
- **Diagram gabungan memakai simbol ▽ dan VCC**: segitiga = GND, VCC = 3,3 V dari papan, sama seperti Modul 6.

</details>

## 🔬 Bedah Teknis (opsional)

Bagian ini untuk yang penasaran. Tidak ada yang wajib dipraktikkan, dan modul berikutnya tidak bergantung pada bagian ini.

<details>
<summary><b>UART: "bus" tertua yang sudah kamu pakai sejak Modul 2</b></summary>

Setiap kali kamu membuka Serial Monitor, ESP32 berbicara lewat **UART** (*universal asynchronous receiver-transmitter*). Cara berkomunikasi ini berasal dari zaman mesin ketik jarak jauh (*teletype*), puluhan tahun sebelum I2C dan SPI ada.

- **Tanpa kabel detak.** UART hanya punya dua kabel data: **TX** (kirim) dan **RX** (terima). Karena tidak ada detak, kedua pihak harus **sepakat lebih dulu** tentang kecepatannya, yaitu *baud rate* (laju baud). Itulah sebabnya angka `115200` harus sama di `Serial.begin(115200)` dan di pojok Serial Monitor. Kalau berbeda, yang muncul adalah huruf-huruf acak.
- **Setiap byte dibungkus.** Satu byte dikirim sebagai 10 bit: 1 bit awal, 8 bit data, dan 1 bit akhir. Jadi, 115.200 bit per detik berarti sekitar 11.520 huruf per detik.
- **Kabelnya bersilangan.** TX satu perangkat masuk ke RX perangkat lain, dan sebaliknya. Di papan ESP32, TX0 dan RX0 (GPIO 1 dan 3) tersambung ke chip USB (CP2102 atau CH340) yang meneruskannya ke laptop. Itulah sebabnya kedua pin itu dihindari di `PETA-PIN.md`.
- **Hanya berdua.** UART menyambung dua perangkat saja, jadi bukan bus sungguhan. Di Modul 15, kamu akan memakai **RS-485**: UART yang dikirim lewat sepasang kabel khusus supaya bisa menjangkau ratusan meter dan dipakai bergantian oleh banyak perangkat.

ESP32 punya tiga UART. UART2 keluar di pin RX2 dan TX2 (GPIO 16 dan 17), yang dipesan untuk RS-485 dan minggu ini dipinjam untuk DS18B20.

</details>

<details>
<summary><b>Resistor <i>pull-up</i>: mengapa 4,7 kΩ dan apa jadinya kalau terlalu banyak modul</b></summary>

Di I2C dan 1-Wire, kabel data kembali ke 3,3 V hanya lewat resistor *pull-up*. Kabel dan kaki setiap perangkat menyimpan sedikit muatan listrik (kapasitansi) sehingga tegangannya naik pelan-pelan, mirip ember yang diisi lewat keran kecil:

- **Resistor terlalu besar** (keran terlalu kecil): tegangan kabel naik terlalu lambat, terutama pada 400 kHz. Spesifikasi I2C membatasi waktu naik ini paling lama 1.000 ns pada 100 kHz dan 300 ns pada 400 kHz.
- **Resistor terlalu kecil** (keran terlalu besar): perangkat harus menarik arus besar untuk menurunkan kabel ke 0 V. Spesifikasi I2C hanya menjamin kemampuan menarik 3 mA, jadi pada 3,3 V resistornya sebaiknya tidak lebih kecil daripada sekitar 1 kΩ.

Nilai 4,7 kΩ adalah jalan tengah yang aman untuk kabel pendek. Masalahnya, **setiap modul membawa pasangan *pull-up*-nya sendiri**, dan resistor-resistor itu tersambung paralel. Dua *pull-up* 10 kΩ yang tersambung paralel setara dengan 5 kΩ, sedangkan empat *pull-up* 4,7 kΩ setara dengan sekitar 1,2 kΩ, sudah mendekati batas bawah. Untuk dua atau tiga modul seperti di Node 1, tidak ada masalah. Kalau suatu hari kamu memasang banyak modul I2C, lepaskan sebagian *pull-up*-nya; banyak modul menyediakan jumper atau titik solder untuk itu.

</details>

<details>
<summary><b><i>Clock stretching</i>: saat perangkat I2C meminta "tunggu sebentar"</b></summary>

Biasanya ESP32 yang mengatur tempo di kabel SCL. Namun, ada perangkat I2C yang kadang butuh waktu, misalnya sensor yang sedang mengukur. Perangkat seperti itu boleh **menahan SCL di 0 V** setelah menerima satu byte. Selama SCL ditahan, ESP32 tidak bisa melanjutkan detaknya dan otomatis menunggu. Teknik ini disebut ***clock stretching*** (detak yang "ditarik" lebih panjang).

Layar SSD1306 dan BME280 tidak memakainya, tetapi beberapa sensor kelembapan dan sensor gas memakainya. Di ESP32, yang menentukan lama menunggu adalah perangkat keras I2C-nya sendiri: dengan paket esp32 3.3.x, SCL yang ditahan lebih dari sekitar **2 ms** dianggap macet, dan percakapannya gagal. `Wire.setTimeOut()` (bawaan 50 ms) hanya mengatur batas waktu satu percakapan secara keseluruhan, jadi tidak menolong di sini. Kalau suatu saat sensor I2C-mu sering gagal tanpa sebab yang jelas, baca lembar datanya: sensor seperti itu biasanya punya mode tanpa *clock stretching* (misalnya "no hold master"), dan library-nya bisa diatur untuk memakai mode itu.

</details>

<details>
<summary><b>Mengapa <code>display()</code> butuh sekitar 25 ms dan mengapa layar kita memakai 400 kHz</b></summary>

Setiap `display()` mengirim seluruh "kertas gambar": 1.024 byte ditambah sedikit byte pengatur. Setiap byte di I2C butuh 9 detak (8 bit + 1 bit ACK), jadi totalnya sekitar 9.400 detak. Pada kecepatan standar 100 kHz, itu hampir 0,1 detik. Karena itu, library Adafruit SSD1306 diam-diam menaikkan kecepatan bus ke **400 kHz** selama `display()`, lalu menurunkannya lagi ke 100 kHz. Hasilnya, satu kali `display()` hanya sekitar 25 ms.

Pelajarannya: memperbarui layar itu "mahal". Node 1 cukup memperbaruinya setiap 2 detik, bersama laporan sensor, bukan pada setiap putaran `loop()`.

</details>

<details>
<summary><b>1-Wire lebih dalam: pulsa reset, daya parasit, dan angka pemeriksa CRC</b></summary>

- **Setiap percakapan diawali pulsa reset.** ESP32 menarik kabel DATA ke 0 V selama sekitar 480 mikrodetik, lalu melepasnya. Setiap sensor yang ada menjawab dengan menarik kabel sebentar ("aku di sini"). Setelah itu, setiap bit dikirim dalam jendela waktu sekitar 60–120 mikrodetik sehingga kecepatannya hanya sekitar 16 ribu bit per detik.
- **Daya parasit.** DS18B20 bisa bekerja dengan **dua kabel saja** (DATA dan GND): ia menyimpan sedikit listrik dari kabel DATA selama kabel itu `HIGH`. Cara ini menghemat satu kabel, tetapi kurang andal untuk kabel panjang atau banyak sensor. Proyek kita selalu memakai tiga kabel (daya normal).
- **CRC.** Pasangan angka terakhir di nomor seri, dan satu byte di setiap bacaan suhu, adalah **angka pemeriksa**. Library menghitung ulang angka itu, tetapi pada saat yang berbeda. CRC nomor seri diperiksa saat sensor dicari (`begin()`): sensor yang CRC-nya rusak tidak ikut dihitung. CRC bacaan diperiksa setiap kali suhu dibaca: kalau tidak cocok karena data rusak di jalan, bacaan dianggap gagal dan hasilnya −127 °C.

</details>

<details>
<summary><b>Mengapa microSD memakai SPI, padahal ESP32 punya jalur khusus kartu SD</b></summary>

ESP32 punya jalur khusus kartu SD yang lebih cepat, yaitu **SDMMC** (library `SD_MMC`), dengan empat kabel data sekaligus. Namun, jalur itu memakai pin tetap: GPIO 2, 4, 12, 13, 14, dan 15. Di Node 1, keenam pin itu sudah dipakai atau sengaja dihindari: LED status (4), tombol (13), DHT22 (14), TRIG (15), RS-485 (2), dan GPIO 12 yang berbahaya saat menyala (Modul 5). SPI bisa memakai pin mana saja yang kita pilih, dan untuk mencatat satu baris setiap 30 detik, kecepatannya lebih dari cukup.

Ada satu catatan untuk masa depan. Pada sebagian modul microSD murah, penerjemah tegangannya **tidak pernah melepas** kabel MISO, bahkan saat CS `HIGH`. Selama kartu itu menjadi satu-satunya perangkat SPI, tidak ada masalah. Kalau kelak kamu menambah perangkat SPI lain di kabel yang sama dan perangkat itu tidak terbaca, curigai MISO modul microSD.

</details>

---

## 🧩 Tantangan mandiri

Tiga tingkat, dari yang paling ringan. Kerjakan minimal Tingkat 1. Semuanya memakai sketsa `modul07_layar_node1` dari Praktik 6, jadi bisa dicoba di Wokwi tanpa merakit apa pun.

> 🖥️ **Alat:** **Arduino IDE** dan rakitan layar dari Praktik 1, atau Wokwi dengan [`diagram.json`](kode/modul07_layar_node1/diagram.json) dan [`libraries.txt`](kode/modul07_layar_node1/libraries.txt) Praktik 6. Sebelum mengubah apa pun, buka `modul07_layar_node1` (**File → Open Recent**), lalu **segera** pilih **File → Save As…** dan simpan di folder `modul-07` dengan nama baru, misalnya `modul07_tantangan1`.

**Tingkat 1 — Ubah sedikit: layar redup pada malam hari.** Layar yang terang benderang di kamar gelap itu menyilaukan. Petunjuk:

- Tambahkan `const int AMBANG_GELAP = 1000;` di bagian atas (angka yang sama dengan Node 1). Kalau kelak hasil tantangan ini kamu pindahkan ke Node 1, jangan ikut menyalin baris ini: Node 1 sudah punya `AMBANG_GELAP`.
- Di awal `tampilkanDiLayar()`, sesudah pemeriksaan `layarAda`, panggil `layar.dim(true)` kalau `b.cahaya < AMBANG_GELAP`, dan `layar.dim(false)` kalau tidak. Fungsi `dim()` meredupkan seluruh layar.
- Berhasil kalau layar meredup saat contoh 2 (malam, cahaya `157`) dan contoh 4 (cahaya `0`) tampil, lalu terang lagi di contoh 1 dan 3. Di Wokwi, perbedaan terang ini mungkin tidak terlihat; periksa di layar asli.

**Tingkat 2 — Gabungkan: peringatan tandon kosong.** Pakai aturan Modul 6: pompa menolak menyala kalau air tandon di bawah 20 %. Buat layar ikut memperingatkan. Petunjuk:

- Tambahkan contoh kelima di larik `contoh`, misalnya `{27.0, 65, 2500, 25, false, 12}` (air 12 %), dan namanya di `namaContoh`. Ubah juga `[4]` menjadi `[5]` di kedua larik, serta `nomorContoh > 3` menjadi `nomorContoh > 4` di `loop()`.
- Di `tampilkanDiLayar()`, kalau `b.level_air` di antara 0 dan 19, gambar baris "Air" dengan tulisan terbalik (latar putih), misalnya `ISI TANDON!`, seperti baris gerak.
- Berhasil kalau peringatan muncul di contoh kelima, tetapi **tidak** muncul di contoh 4 (level air `-1` berarti tidak terbaca, bukan kosong).

**Tingkat 3 — Rancang sendiri: layar yang tidak "terbakar".** Titik OLED yang terus menampilkan gambar yang sama selama berbulan-bulan lama-kelamaan meredup dan meninggalkan bayangan (*burn-in*). Node 1 akan menyala 24 jam sehari. Rancang cara supaya layarnya awet. Petunjuk awal:

- `layar.ssd1306_command(SSD1306_DISPLAYOFF)` mematikan layar tanpa menghapus gambarnya, dan `layar.ssd1306_command(SSD1306_DISPLAYON)` menyalakannya lagi.
- Gagasan: matikan layar kalau tidak ada gerakan selama beberapa menit, lalu nyalakan lagi saat PIR melihat gerakan. Gagasan lain: geser seluruh tata letak satu titik setiap jam.
- Pikirkan: apa yang harus tetap terlihat saat layar mati supaya penghuni tahu Node 1 masih hidup? (Petunjuk: LED status.)

Tidak ada kunci jawaban untuk Tingkat 3 — kalau layarmu tetap informatif saat dibutuhkan dan beristirahat saat tidak ada yang melihat, kamu benar.

---

## ➕ Tambahan ke "Rumah Pintar Mini"

Sumbangan Modul 7 ke proyek benang merah: rak `tampilkanDiLayar()` yang kosong sejak Modul 3 akhirnya berisi **layar status rancanganmu**, dan Node 1 bisa (opsional) **mencatat bacaannya ke kartu microSD**. Hasilnya: Node 1 **v0.4.0**. Versi rujukan lengkapnya ada di [`proyek-rumah-pintar-mini/firmware/node-1-rumah/`](../../proyek-rumah-pintar-mini/firmware/node-1-rumah/node-1-rumah.ino).

> 🖥️ **Alat yang dipakai:** **Arduino IDE** (dengan library dari Modul 5–6 dan **Adafruit SSD1306** dari Praktik 1), **VS Code**, **GitHub Desktop**, dan rakitan lengkap dengan layar OLED (modul microSD opsional). Tanpa papan? Semua langkah bisa diuji di Wokwi dengan [`diagram.json`](kode/node-1-rumah/diagram.json) dan [`libraries.txt`](kode/node-1-rumah/libraries.txt) Node 1; jalankan simulasi, klik area kosong di panel simulasi, lalu tekan **F** untuk melihat seluruh rangkaian (kalau kursor masih di editor kode, huruf f malah terketik di kodemu). Diagram itu sama dengan Modul 6, ditambah layar OLED di bawah papan; LED status dipindahkan sedikit ke bawah supaya kabel layar punya jalan. Diagram itu juga sengaja tidak memasang microSD.

### A. Perbarui `PETA-PIN.md`

1. Di VS Code, buka folder repositori proyekmu (**File → Open Folder…** → **Documents → GitHub → rumah-pintar-mini**), lalu buka `PETA-PIN.md`.
2. Buka versi rujukan [`PETA-PIN.md`](../../proyek-rumah-pintar-mini/PETA-PIN.md) di tab baru, klik **Copy raw file**, lalu ganti seluruh isi file-mu dengannya (**Ctrl + A**, lalu **Ctrl + V**). Yang berubah:
   - baris I2C kini **terpasang** (layar OLED, jalur bus di kolom 19 dan 20);
   - baris microSD menyebut cara memasangnya, termasuk kebiasaan menekan EN untuk modul beregulator;
   - catatan GPIO 16 menyebut bahwa latihan DS18B20 sudah selesai;
   - tabel **Rel daya** kini menyebut layar OLED di rel bawah dan modul microSD (opsional) di rel atas atau rel bawah;
   - ada tabel baru **Bus di breadboard**;
   - tabel **Riwayat** mendapat baris versi 3.
3. Simpan (**Ctrl + S**).

### B. Isi rak layar: Node 1 menjadi v0.4.0

Buka **`node-1-rumah.ino`** di Arduino IDE: **File → Open…** → **Documents → GitHub → rumah-pintar-mini → firmware → node-1-rumah**. Kerjakan perubahan berikut dari atas ke bawah. Setiap selesai satu langkah, klik **Verify** (✓). Urutan langkahnya sudah diatur supaya setiap Verify di tengah jalan berhasil; kalau muncul error, periksa langkah yang baru saja kamu kerjakan.

**Langkah 1 — Bagian paling atas: komentar, library, dan versi.** Ganti semua baris dari baris pertama sampai `const String VERSI_FIRMWARE = "0.3.0";` dengan blok ini:

```cpp
// Node 1 "Rumah" - firmware v0.4.0 (diperbarui di Modul 7)
// Proyek benang merah: Rumah Pintar Mini.
//
// Baru di v0.4.0: layar OLED menampilkan semua bacaan kira-kira setiap 2 detik, dan (opsional)
// kira-kira setiap 30 detik bacaan dicatat ke kartu microSD sebagai satu baris CSV.
// Tanpa layar atau tanpa kartu, Node 1 tetap berjalan seperti v0.3.0.
// Aktuator tetap bisa dicoba lewat Serial Monitor, misalnya:
// lampu on, kipas off, pompa 3, tirai 90, bunyi, status.
//
// Library: ESP32Servo versi 3.2.1, DHT sensor library versi 1.4.7
// (ikut terpasang: Adafruit Unified Sensor versi 1.1.15), Adafruit SSD1306 versi 2.5.17
// (ikut terpasang: Adafruit GFX Library versi 1.12.6 dan Adafruit BusIO versi 1.17.4).
// Wire, SPI, dan SD sudah ikut paket esp32.

#include <ESP32Servo.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <SD.h>
#include <esp_system.h>  // esp_reset_reason()

const String VERSI_FIRMWARE = "0.4.0";
```

**Langkah 2 — Peta pin.** Di bawah baris `const int PIN_ECHO = 35; …`, ada tiga baris komentar yang diawali `// Dipesan untuk modul berikutnya`, `// Modul 7:`, dan `// Modul 15:`. Ganti ketiganya dengan blok ini:

```cpp
const int PIN_SDA = 21;          // Modul 7, I2C: layar OLED
const int PIN_SCL = 22;          // Modul 7, I2C: layar OLED
const int PIN_SD_CS = 5;         // Modul 7, microSD (opsional); SCK = 18, MISO = 19, MOSI = 23
// Dipesan untuk modul berikutnya (jangan dipakai untuk hal lain):
// Modul 15: RS-485 RX = 16, TX = 17, DE/RE = 2
```

**Langkah 3 — Benda-benda Modul 7.** Tepat di bawah baris `int hitungPutaran = 0;`, tambahkan satu baris kosong, lalu blok ini:

```cpp
// ---------- Modul 7: layar OLED dan (opsional) kartu microSD ----------
const byte ALAMAT_LAYAR = 0x3C;               // alamat layar OLED di bus I2C
const int LAPORAN_PER_CATATAN = 15;           // 15 laporan x 2 detik = kira-kira 30 detik
const char* NAMA_FILE_CATATAN = "/node1.csv";  // nama file di kartu, selalu diawali garis miring
Adafruit_SSD1306 layar(128, 64, &Wire, -1);   // lebar 128, tinggi 64, lewat bus I2C, tanpa kaki reset
bool layarAda = false;                        // true kalau layar menjawab di alamat 0x3C
bool kartuAda = false;                        // true kalau kartu microSD terbaca saat menyala
int hitungLaporan = 0;                        // laporan sejak baris CSV terakhir
```

**Langkah 4 — Isi rak layar.** Cari rak kosong yang dibuat sejak Modul 3:

```cpp
// ---------- Modul 7: menampilkan bacaan di layar OLED ----------
void tampilkanDiLayar(BacaanSensor b) {
  // belum diisi
}
```

Ganti keempat baris itu dengan blok di bawah ini. Isinya sama dengan bagian sketsa Praktik 6 dari baris `// Ikon 8 x 8 titik: …` sampai akhir fungsi `tampilkanDiLayar()`; baris `Adafruit_SSD1306 layar…` dan `bool layarAda…` sudah masuk di Langkah 3.

**Kalau di Praktik 6 kamu mengubah tata letaknya (dan itulah syarat lulus Modul 7), pakai versimu sendiri, bukan blok di bawah ini:**

1. Buka sketsa `modul07_layar_node1` milikmu (**File → Open Recent**).
2. Blok mulai dari baris `// Ikon 8 x 8 titik: 1 = titik menyala, 0 = padam.` sampai kurung kurawal penutup `}` fungsi `tampilkanDiLayar()`, tepat di atas komentar `// ---------- Akhir bagian layar. … ----------`. Baris `Adafruit_SSD1306 layar…`, `bool layarAda…`, `setup()`, dan `loop()` **tidak** ikut diblok. Salin (**Ctrl + C**).
3. Kembali ke `node-1-rumah.ino`. Biarkan baris komentar `// ---------- Modul 7: menampilkan bacaan di layar OLED ----------`; blok tiga baris rak kosong di bawahnya (dari `void tampilkanDiLayar(BacaanSensor b) {` sampai `}`), lalu tempel (**Ctrl + V**).
4. Klik **Verify**. Kalau muncul `redefinition of …`, ada nama yang dobel, misalnya konstanta buatanmu yang namanya sudah ada di Node 1 (seperti `AMBANG_GELAP`). Hapus salinanmu dan pakai yang sudah ada, atau ganti namanya.

Kalau tata letakmu sama dengan rujukan, tempel blok ini:

```cpp
// ---------- Modul 7: menampilkan bacaan di layar OLED ----------
// Ikon 8 x 8 titik: 1 = titik menyala, 0 = padam.
const unsigned char IKON_MATAHARI[] = {
  0b00011000,
  0b01000010,
  0b00111100,
  0b10111101,
  0b10111101,
  0b00111100,
  0b01000010,
  0b00011000,
};
const unsigned char IKON_TANAMAN[] = {
  0b11000011,
  0b01100110,
  0b00111100,
  0b00011000,
  0b00011000,
  0b11111111,
  0b01111110,
  0b00111100,
};
const unsigned char IKON_TANDON[] = {
  0b10000001,
  0b10000001,
  0b10000001,
  0b11011011,
  0b11111111,
  0b11111111,
  0b11111111,
  0b01111110,
};
const unsigned char IKON_ORANG[] = {
  0b00011000,
  0b00011000,
  0b01111110,
  0b00011000,
  0b00011000,
  0b00100100,
  0b01000010,
  0b01000010,
};

// Mencari layar di bus I2C, lalu menyalakannya. Kalau layar tidak ada, program tetap berjalan.
void siapkanLayar() {
  Wire.begin(PIN_SDA, PIN_SCL);
  Wire.beginTransmission(ALAMAT_LAYAR);
  layarAda = Wire.endTransmission() == 0;  // ada yang menjawab di 0x3C?
  if (!layarAda) {
    Serial.println("Layar OLED tidak ditemukan di 0x3C. Node 1 tetap jalan tanpa layar.");
    return;
  }
  layar.begin(SSD1306_SWITCHCAPVCC, ALAMAT_LAYAR);
  layar.cp437(true);  // tabel huruf CP437 yang benar supaya nomor 248 = tanda derajat
  layar.setTextColor(SSD1306_WHITE);
  layar.clearDisplay();
  layar.setTextSize(1);
  layar.setCursor(0, 0);
  layar.println("Node 1 Rumah");
  layar.println("menunggu bacaan...");
  layar.display();
}

// Menulis teks rata kanan: huruf terakhirnya berakhir tepat sebelum x = kanan.
void tulisRataKanan(String teks, int kanan, int y, int ukuran) {
  layar.setTextSize(ukuran);
  layar.setCursor(kanan - teks.length() * 6 * ukuran, y);  // satu huruf = 6 titik x ukuran
  layar.print(teks);
}

// Batang persen: bingkai selebar "lebar" titik, isinya sepanjang persen. Persen di bawah 0 = kosong.
void gambarBatang(int x, int y, int lebar, int persen) {
  layar.drawRect(x, y, lebar, 8, SSD1306_WHITE);
  if (persen > 0) {
    layar.fillRect(x + 2, y + 2, (lebar - 4) * persen / 100, 4, SSD1306_WHITE);
  }
}

// Satu baris layar: ikon, nama, angka rata kanan, lalu batang persen.
// Tanda * pada "const unsigned char* ikon" berarti fungsi ini menerima ikon mana pun yang dikirim
// (mirip const char* untuk teks di Modul 3). Biarkan apa adanya.
void barisBatang(int y, const unsigned char* ikon, String nama, String angka, int persen) {
  layar.drawBitmap(0, y, ikon, 8, 8, SSD1306_WHITE);
  layar.setTextSize(1);
  layar.setCursor(11, y);
  layar.print(nama);
  tulisRataKanan(angka, 82, y, 1);
  gambarBatang(86, y, 42, persen);
}

void tampilkanDiLayar(BacaanSensor b) {
  if (!layarAda) {
    return;
  }
  layar.clearDisplay();

  // Baris atas: suhu di kiri dan kelembapan di kanan. Angkanya besar, satuannya kecil.
  String teksSuhu = "--.-";
  if (!isnan(b.suhu)) {
    teksSuhu = String(b.suhu, 1);
  }
  layar.setTextSize(2);
  layar.setCursor(0, 0);
  layar.print(teksSuhu);
  layar.setTextSize(1);
  layar.write(248);  // tanda derajat
  layar.print("C");

  String teksLembap = "--";
  if (b.kelembapan >= 0) {
    teksLembap = String(b.kelembapan);
  }
  tulisRataKanan(teksLembap, 122, 0, 2);
  layar.setTextSize(1);
  layar.setCursor(122, 0);
  layar.print("%");

  layar.drawFastHLine(0, 17, 128, SSD1306_WHITE);  // garis pemisah

  // Tiga baris dengan batang persen. Cahaya 0-4095 diubah dulu menjadi 0-100 untuk batangnya.
  barisBatang(21, IKON_MATAHARI, "Cahaya", String(b.cahaya), b.cahaya * 100 / 4095);
  barisBatang(32, IKON_TANAMAN, "Tanah", String(b.tanah) + "%", b.tanah);
  String teksAir = "--";
  if (b.level_air >= 0) {
    teksAir = String(b.level_air) + "%";
  }
  barisBatang(43, IKON_TANDON, "Air", teksAir, b.level_air);

  // Baris gerak: dibalik (latar putih) kalau ada gerakan supaya langsung menarik perhatian.
  if (b.gerak) {
    layar.fillRect(0, 53, 128, 10, SSD1306_WHITE);
    layar.drawBitmap(0, 54, IKON_ORANG, 8, 8, SSD1306_BLACK);
    layar.setTextColor(SSD1306_BLACK);
    layar.setCursor(11, 54);
    layar.print("Gerak: ADA ORANG");
    layar.setTextColor(SSD1306_WHITE);
  } else {
    layar.drawBitmap(0, 54, IKON_ORANG, 8, 8, SSD1306_WHITE);
    layar.setCursor(11, 54);
    layar.print("Gerak: sepi");
  }

  layar.display();
}
```

**Langkah 5 — Catatan CSV (opsional, tetapi tetap ditempel).** Tepat di bawah blok yang baru kamu tempel di Langkah 4 (baris terakhirnya `}` sesudah `layar.display();`) dan di atas komentar `// ---------- Modul 6 & 19: aturan otomatis (siram, lampu, kipas) ----------`, tambahkan satu baris kosong, lalu blok ini. Tanpa modul microSD, kode ini hanya mencetak satu pesan saat menyala dan tidak melakukan apa-apa lagi:

```cpp
// ---------- Modul 7 (opsional): catatan CSV di kartu microSD ----------
// Kalau kartu terbaca saat menyala, pencatatan diaktifkan. Tanpa kartu, Node 1 tetap berjalan.
void siapkanKartu() {
  kartuAda = SD.begin(PIN_SD_CS);
  if (!kartuAda) {
    Serial.println("Kartu microSD tidak terbaca: catatan CSV dimatikan.");
    return;
  }
  if (!SD.exists(NAMA_FILE_CATATAN)) {
    File file = SD.open(NAMA_FILE_CATATAN, FILE_WRITE);
    file.println("uptime_s,suhu,kelembapan,cahaya,tanah,gerak,level_air");  // baris judul kolom
    file.close();
  }
  Serial.println("Kartu microSD siap: bacaan dicatat ke node1.csv setiap kira-kira 30 detik.");
}

// Satu baris CSV setiap LAPORAN_PER_CATATAN laporan. Bacaan yang gagal ditulis sebagai sel kosong.
void catatKeKartu(BacaanSensor b) {
  if (!kartuAda) {
    return;
  }
  hitungLaporan++;
  if (hitungLaporan < LAPORAN_PER_CATATAN) {
    return;
  }
  hitungLaporan = 0;

  String baris = String(millis() / 1000) + ",";  // uptime_s: detik sejak papan menyala
  if (!isnan(b.suhu)) {
    baris += String(b.suhu, 1);
  }
  baris += ",";
  if (b.kelembapan >= 0) {
    baris += String(b.kelembapan);
  }
  baris += "," + String(b.cahaya) + "," + String(b.tanah) + ",";
  if (b.gerak) {
    baris += "true";
  } else {
    baris += "false";
  }
  baris += ",";
  if (b.level_air >= 0) {
    baris += String(b.level_air);
  }

  File file = SD.open(NAMA_FILE_CATATAN, FILE_APPEND);  // APPEND = menambah di akhir file
  if (!file) {
    Serial.println("Gagal menulis ke kartu microSD (tercabut?). Catatan CSV dihentikan.");
    kartuAda = false;
    return;
  }
  file.println(baris);
  file.close();  // baru setelah ditutup, isinya benar-benar tersimpan di kartu
}
```

**Langkah 6 — Panggil semuanya.** Di `setup()`, tambahkan dua baris di antara `siapkanPin();` dan `cetakStatus();`:

```cpp
  siapkanPin();
  siapkanLayar();  // Modul 7
  siapkanKartu();  // Modul 7 (opsional)
  cetakStatus();
```

Di `loop()`, tambahkan satu baris tepat di bawah `tampilkanDiLayar(bacaan);`:

```cpp
    tampilkanDiLayar(bacaan);
    catatKeKartu(bacaan);
```

`tampilkanDiLayar(bacaan)` sendiri sudah dipanggil sejak Modul 3, kira-kira setiap 2 detik. Sejak hari itu, fungsi ini hanya menunggu diisi — dan minggu ini kamu mengisinya.

### C. Uji Node 1

1. Klik **Verify**. Kalau muncul error, bandingkan baris yang ditunjuk pesan error dengan [versi rujukan](../../proyek-rumah-pintar-mini/firmware/node-1-rumah/node-1-rumah.ino).
2. Pastikan tandon berisi air dan sensor tanah tertancap di tanah lembap (seperti Modul 6). Colokkan USB, nyalakan MB102, lalu klik **Upload**. Buka Serial Monitor (**New Line**, **115200 baud**).

   **Hasilnya** (tanpa modul microSD; angkamu pasti berbeda):

   ```text
   Node 1 Rumah - firmware 0.4.0
   Alasan restart terakhir: POWERON
   Kartu microSD tidak terbaca: catatan CSV dimatikan.
   status: lampu=off kipas=off tirai=90
   suhu=28.4 C  kelembapan=71 %  cahaya=2744  tanah=63 %  gerak=tidak  level_air=96 %
   ```

   Dengan modul microSD terpasang, baris `Kartu microSD tidak terbaca: …` diganti dengan `Kartu microSD siap: bacaan dicatat ke node1.csv setiap kira-kira 30 detik.`. **Kebiasaan baru selama modul microSD beregulator terpasang:** setiap kali menyalakan Node 1 (USB dulu, lalu MB102), tekan **EN** sekali supaya Node 1 menemukan kartunya. Tanpa itu, Node 1 mencetak `Kartu microSD tidak terbaca: catatan CSV dimatikan.` dan tidak mencatat apa pun. Sesaat setelah unggahan selesai, EN tidak perlu ditekan karena papan menyala ulang sendiri, dan saat itu MB102 sudah menyala. Kalau baris-baris pertama di atas tidak terlihat di Serial Monitor, tombol EN juga mengulangnya.
3. **Layar.** Sesaat setelah menyala, layar menampilkan `Node 1 Rumah` dan `menunggu bacaan...`. Dua detik kemudian, layar status rancanganmu muncul dengan bacaan **sungguhan** dan diperbarui kira-kira setiap dua detik.
4. **Uji setiap baris:** tutup LDR (batang cahaya memendek); embuskan napas ke DHT22 (kelembapan naik); lambaikan tangan di depan PIR (baris gerak terbalik); angkat sensor tanah ke udara (batang tanah menuju 0 %, dan dalam 2 detik pompa menyala 3 detik seperti di Modul 6). **Begitu pompa berhenti, tancapkan lagi sensornya ke tanah lembap** (atau celupkan ke gelas air). Kalau dibiarkan di udara, pompa menyiram lagi kira-kira setiap 30 detik dan gelas tanamanmu bisa meluap.
5. **Perintah Modul 5–6 tetap bekerja:** ketik `status`, `lampu on`, `lampu off`, dan `pompa 2`.
6. **(Dengan microSD)** Biarkan Node 1 berjalan beberapa menit, lalu matikan MB102, cabut USB, keluarkan kartunya, dan buka `node1.csv` di laptop. Baris pertamanya berisi nama kolom `uptime_s,suhu,kelembapan,cahaya,tanah,gerak,level_air`, dan setiap baris berikutnya berisi angka-angkanya dengan urutan yang sama, misalnya `32,28.4,71,2744,63,false,96`. Bacaan yang gagal tampil sebagai sel kosong, misalnya `92,,,2744,63,false,`. Kalau Google Sheets atau Excel-mu berpengaturan wilayah Indonesia, angka berdesimal titik seperti `28.4` bisa terbaca keliru, misalnya sebagai teks atau tanggal. Cara paling mudah, juga bagi pengguna Excel: buat spreadsheet kosong di Google Sheets, ubah dulu **File → Settings → Locale** menjadi **United States**, lalu impor `node1.csv` lewat **File → Import → Upload**. Di **Import location**, pilih **Replace current sheet** supaya datanya masuk ke spreadsheet yang pengaturannya sudah kamu ubah.
7. **Tanpa layar pun, Node 1 tetap berjalan.** Matikan MB102, cabut USB, lalu lepas kabel SDA layar dari 20j. Nyalakan lagi (USB dulu, baru MB102), lalu tekan **EN** supaya pesan awalnya tercetak saat Serial Monitor sudah tersambung: `Layar OLED tidak ditemukan di 0x3C. Node 1 tetap jalan tanpa layar.`. Semua aturan otomatis tetap bekerja. Setelah itu, matikan MB102, cabut USB, kembalikan kabelnya, lalu nyalakan lagi (USB, MB102, lalu EN).

![Tangkapan layar Wokwi Node 1 v0.4.0 lengkap, diperkecil dengan tombol F lalu dipotong; label putih nama komponen ditambahkan penulis. Rangkaian: papan ESP32 di tengah dengan layar OLED dan LED status D4 di bawahnya; di kiri dan atas tombol D13, DHT22, buzzer, servo tirai, LED = pompa, relay + LED = kipas, dan relay + LED = lampu; di kanan atas PIR (D34), potensiometer pengganti sensor tanah, LDR (VP), dan HC-SR04 (tandon). Kiri bawah, perbesaran layar setelah PIR diklik lalu tombol Simulate motion ditekan: 28.5 derajat C, 71 persen, Cahaya 3094, Tanah 70 persen, Air 52 persen, dan baris Gerak: ADA ORANG yang terbalik berlatar putih (penanda 1). Kanan bawah, Serial Monitor: Node 1 Rumah - firmware 0.4.0, Alasan restart terakhir: POWERON, Kartu microSD tidak terbaca: catatan CSV dimatikan., status: lampu=off kipas=off tirai=90, lalu baris laporan yang berganti dari gerak=tidak menjadi gerak=ya (penanda 2). Catatan: bacaan lain adalah nilai awal sensor di diagram Wokwi](aset/wokwi-node-1-v4.png)

*Tangkapan layar [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), Oktober 2026; dipakai untuk tujuan pendidikan, penanda oleh penulis.*

### D. *Commit* dan *push*

1. Di GitHub Desktop, pilih **`rumah-pintar-mini`** di kotak **Current repository** — selalu lihat kotak ini sebelum *commit*!
2. Tab **Changes** berisi dua file yang berubah: `PETA-PIN.md` dan `firmware/node-1-rumah/node-1-rumah.ino`.
3. Isi **Summary** dengan `Node 1 v0.4.0: layar status OLED dan catatan CSV opsional (Modul 7)`, klik **Commit 2 files to main**, lalu **Push origin**.

> [!IMPORTANT]
> **Perangkat tambahan tidak boleh membuat Node 1 mogok.** Layar dan kartu microSD itu "bonus": kalau salah satunya tidak ada atau rusak, Node 1 menulis satu pesan lalu tetap menjalankan tugas utamanya — membaca sensor dan menjaga pompa. Prinsip yang sama berlaku di Modul 11: saat internet putus, Node 1 tetap bekerja di rumah.

---

## 📖 Glosarium

| Istilah | Arti singkat |
| :--- | :--- |
| **Bus** | Kabel bersama yang dipakai banyak perangkat sekaligus, dengan aturan siapa yang boleh berbicara. |
| **UART** | Jalur komunikasi dua perangkat lewat TX dan RX, misalnya `Serial` ke laptop. Tanpa kabel detak, jadi kecepatannya (*baud rate*) harus disepakati. |
| **I2C** | Bus dua kabel data (SDA dan SCL). Setiap perangkat punya alamat 7-bit. |
| **SDA** / **SCL** | *Serial data* (jalur data) dan *serial clock* (jalur detak) di I2C. Di ESP32 kita: D21 dan D22. |
| **Alamat I2C** | "Nomor rumah" perangkat di bus I2C, misalnya `0x3C` untuk layar OLED. |
| **ACK** | Jawaban singkat "ya, saya di sini" dari perangkat yang alamatnya dipanggil. |
| **Heksadesimal** | Cara menulis angka dengan basis 16 (0–9 lalu A–F), ditandai awalan `0x`. `0x3C` = 60. |
| **Pemindai I2C** | Sketsa yang "mengetuk" setiap alamat dan mencatat mana yang menjawab. |
| **Kabel jembatan** | Kabel jantan–jantan yang menyambung jalur kaki D21/D22 ke jalur bus di kolom 20/19 supaya banyak perangkat I2C bisa menancap di jalur yang sama. |
| ***Pull-up*** | Resistor yang mengembalikan kabel data ke 3,3 V saat tidak ada perangkat yang menariknya ke 0 V. |
| **OLED** | Layar yang setiap titiknya memancarkan cahaya sendiri, tanpa lampu latar. |
| **SSD1306** | Chip pengatur layar OLED 128 × 64 titik yang kita pakai. Layar 1,3 inci sering memakai SH1106, yang berbeda. |
| ***Buffer*** (kertas gambar) | Salinan semua titik layar di memori ESP32. Digambar dulu, lalu dikirim dengan `display()`. |
| ***Bitmap*** | Gambar yang disimpan sebagai deretan angka biner: 1 = titik menyala, 0 = padam. |
| **CP437** | Tabel huruf komputer lama yang dipakai layar kita; tanda ° bernomor 248. |
| **BME280** | Sensor Bosch untuk suhu, kelembapan, dan tekanan udara; chip ID `0x60`. |
| **BMP280** | "Kembaran" BME280 tanpa sensor kelembapan; chip ID `0x58`. |
| **Chip ID** | Angka identitas di dalam chip yang bisa dibaca untuk memastikan jenisnya. |
| **hPa** (hektopaskal) | Satuan tekanan udara. Di tepi pantai sekitar 1.013 hPa; 1 hPa sama dengan 1 mbar. |
| **1-Wire** | Bus satu kabel data. Setiap perangkat punya nomor seri 64-bit dari pabrik. |
| **DS18B20** | Sensor suhu 1-Wire, sering dijual dalam probe tahan air. |
| **Nomor seri** | Kode 64-bit unik DS18B20 dari pabrik, misalnya `28-FF-64-1E-0F-6A-D3-3C`; di lembar data disebut *ROM code*. |
| **CRC** | Angka pemeriksa di akhir nomor seri dan di setiap bacaan DS18B20, untuk mendeteksi data yang rusak di jalan. |
| **SPI** | Bus empat kabel data (SCK, MOSI, MISO, CS) yang cepat. |
| **MOSI** / **MISO** | Jalur data dari ESP32 ke perangkat, dan dari perangkat ke ESP32. Di modul microSD sering ditulis DI dan DO. |
| **CS** (*chip select*) | Kabel "pilih aku" di SPI; `LOW` berarti perangkat itu yang diajak bicara. |
| **Regulator** | Komponen yang menurunkan tegangan, misalnya dari 5 V menjadi 3,3 V. Modul microSD beregulator butuh 5 V di kaki VCC-nya. |
| **Penerjemah tegangan** (*level shifter*) | Komponen yang mengubah sinyal 5 V menjadi 3,3 V atau sebaliknya supaya pin ESP32 aman. |
| **FAT32** | Sistem file yang dipahami library **SD** ESP32. Kartu 4–16 GB biasanya sudah memakai format ini. |
| **CSV** | File teks berisi tabel; kolomnya dipisahkan dengan koma, baris pertama berisi nama kolom. |
| **`uptime_s`** | Detik sejak papan menyala; namanya sama dengan kolom di kontrak data (Lampiran A). |
| **Skematik** | Gambar rangkaian dengan simbol yang menunjukkan apa tersambung ke apa, bukan letak bendanya. |
| ***Net label*** | Label nama di skematik; label yang sama berarti tersambung walaupun tidak ada garisnya. |
| ***Optocoupler*** | LED dan fototransistor dalam satu kemasan; memisahkan dua rangkaian lewat cahaya. |
| **Dioda *flyback*** | Dioda di samping kumparan (relay, pompa) yang meredam sentakan tegangan saat kumparan dimatikan. |
| ***Burn-in*** | Bayangan permanen di layar OLED karena gambar yang sama menyala terlalu lama. |

---

## 📝 Kuis 5 soal

1. Layar OLED (`0x3C`) dan BME280 (`0x76`) dipasang di kabel SDA dan SCL yang sama. (a) Bagaimana ESP32 tahu perangkat mana yang sedang diajak bicara? (b) Apa yang terjadi kalau kamu menambahkan layar OLED kedua yang juga beralamat `0x3C`?
2. (a) Ubah `0x3C` dan `0x77` menjadi angka biasa, lalu jelaskan mengapa lembar data lebih suka menulis alamat dengan heksadesimal. (b) Sketsamu memanggil `layar.print("28.5");`, tetapi layar OLED tidak berubah sama sekali, padahal pemindai menemukan `0x3C`. Perintah apa yang kemungkinan lupa dipanggil, dan mengapa perintah itu perlu?
3. Sketsa Praktik 3 mencetak `Chip ID-nya 0x58, bukan 0x60.`. (a) Sensor apa yang terpasang? (b) Bacaan apa yang tidak bisa kamu dapatkan darinya? (c) Mengapa pemindai I2C saja tidak bisa membedakannya?
4. DS18B20 di tandon kadang melaporkan `-127`, lalu normal lagi, lalu `-127` lagi. Sebutkan dua kemungkinan artinya. Bagian rangkaian mana yang akan kamu periksa lebih dulu?
5. Di skematik modul relay, (a) komponen mana yang membuat modul ini aktif LOW? (b) Apa tugas dioda yang dipasang terbalik di samping kumparan? (c) Mengapa skematik tidak perlu menggambar kabel GND yang panjang ke setiap komponen?

<details>
<summary><b>Kunci jawaban & penjelasan</b></summary>

1. (a) Setiap percakapan diawali **alamat**. Semua perangkat mendengar, tetapi hanya pemilik alamat yang menjawab dengan ACK. (b) Kedua layar sama-sama menjawab ACK dan menerima perintah yang sama, jadi keduanya menampilkan gambar yang **persis sama**: kamu tidak bisa mengatur masing-masing. Untuk perangkat yang juga **dibaca**, seperti sensor, jawaban keduanya bertabrakan sehingga datanya kacau. Karena itu, alamat di satu bus harus unik. Ganti alamat salah satunya (banyak layar punya titik solder `0x3C`/`0x3D`) atau pindahkan ke bus I2C kedua (ESP32 punya dua).
2. (a) `0x3C` = 3 × 16 + 12 = **60**; `0x77` = 7 × 16 + 7 = **119**. Setiap digit heksadesimal tepat mewakili empat bit sehingga pola bit di dalam chip lebih mudah dibaca dari angka heksadesimal. (b) **`layar.display()`**. Perintah gambar seperti `print()` hanya mengubah "kertas gambar" (*buffer*) di memori ESP32; layar baru berubah setelah `display()` mengirim seluruh kertas itu lewat I2C.
3. (a) **BMP280.** (b) **Kelembapan**; BMP280 hanya mengukur suhu dan tekanan. (c) Pemindai hanya menanyakan **alamat**, dan BMP280 memakai alamat yang sama dengan BME280 (`0x76`/`0x77`). Jenis chip baru bisa diketahui dari **chip ID**.
4. `-127` berarti library **tidak memercayai** bacaannya. Ada dua kemungkinan: sensor **tidak menjawab** (sambungan DAT atau GND longgar), atau sensor **baru menyala ulang** karena dayanya terputus-putus (library 4.0.6 mengubah angka bawaan 85,00 °C menjadi −127). Keduanya menunjuk ke **sambungan**: periksa sekrup terminal adaptor dan kabel VCC, DAT, serta GND probe.
5. (a) Jalur **R1 → LED indikator → LED di dalam *optocoupler* → kaki IN**: arus baru mengalir kalau IN ditarik ke 0 V. (b) **Meredam sentakan tegangan** dari kumparan saat dimatikan supaya transistor tidak rusak (dioda *flyback*). (c) Karena semua **simbol GND** dianggap tersambung ke GND yang sama; skematik cukup menaruh simbol itu di dekat setiap komponen.

</details>

---

## ✅ Checklist kelulusan Modul 7

Centang semuanya sebelum lanjut ke Modul 8:

- [ ] Pemindai I2C menemukan layar OLED-ku di alamat `0x3C` (atau `0x3D`), dan aku bisa menjelaskan mengapa SDA dan SCL tidak boleh tertukar.
- [ ] Aku bisa menampilkan teks, angka besar, batang persen, dan ikon buatanku sendiri di layar OLED.
- [ ] BME280 terbaca dengan chip ID `0x60`, **atau** aku bisa menjelaskan apa arti chip ID lain yang muncul (cukup di Wokwi kalau belum punya BME280).
- [ ] DS18B20 terbaca beserta nomor serinya (cukup di Wokwi kalau probe-ku belum bisa dipasang), dan aku tahu arti angka 85 °C dan −127 °C.
- [ ] (Opsional) Catatan CSV di kartu microSD tetap ada setelah papan menyala ulang, dan bisa kubuka di laptop.
- [ ] ⭐ **Layar OLED menampilkan semua bacaan Node 1** (suhu, kelembapan, cahaya, tanah, gerak, level air) dengan **tata letak rancanganku sendiri**, tetap rapi di keempat contoh Praktik 6, dan sudah terpasang di Node 1 v0.4.0.
- [ ] ⭐ **Aku bisa membaca skematik modul relay** (keenam pertanyaan Praktik 7.1 terjawab) dan **menggambar ulang Node 1 sebagai skematik**.
- [ ] `PETA-PIN.md` versi 3 dan Node 1 v0.4.0 sudah di-*commit* dan di-*push* ke repositori `rumah-pintar-mini`; sketsa, catatan, dan gambar skematik ada di `belajar-iot/modul-07`.
- [ ] BME280 dan DS18B20 sudah dilepas dan disimpan untuk Node 2.
- [ ] ⭐ **Kuis: minimal 4 dari 5 benar.**

**Lulus jika** (sesuai Silabus): *layar OLED menampilkan semua bacaan Node 1 dengan tata letak yang kamu rancang sendiri, dan kamu bisa membaca skematik modul relay atau sensor dari dokumentasinya.*

**Menuju tanda lulus Fase 1** ([Silabus §8](../../SILABUS.md#8-evaluasi--tanda-kelulusan-tiap-fase)): Node 1 kini bisa menampilkan bacaannya sendiri, dan skematik Node 1 buatanmu melengkapi foto rangkaian Fase 1. Firmware v1.0 yang tangguh dan sanggup berjalan 24 jam menyusul di Modul 8, sketsa baterai terukur di Modul 9, dan video 30 detik di akhir Fase 1.

Semua tercentang? Selamat — Node 1 kini punya layar sendiri, dan kamu bisa membaca "peta" rangkaian elektronik. Di **Modul 8**, Node 1 belajar menjadi tangguh: tanpa `delay()`, dengan penjaga yang me-*restart* program macet, dan dengan pengaturan yang tetap tersimpan walaupun listrik padam.

---

## 📚 Sumber & atribusi gambar

**Lembar data dan dokumentasi yang dipakai** (diakses Oktober 2026):

- [Lembar data BME280 (Bosch Sensortec, PDF)](https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bme280-ds002.pdf) — rentang, akurasi, ukuran kemasan, alamat I2C, chip ID `0x60`, dan kaki CSB/SDO.
- [Lembar data BMP280 (Bosch Sensortec, PDF)](https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bmp280-ds001.pdf) — ukuran kemasan 2,0 × 2,5 mm dan chip ID `0x58`.
- [Lembar data DS18B20 (Maxim Integrated, kini Analog Devices; salinan SparkFun, PDF)](https://cdn.sparkfun.com/datasheets/Sensors/Temp/DS18B20.pdf) — rentang, akurasi, resolusi, waktu konversi, nomor seri 64-bit, nilai awal 85 °C, dan daya parasit.
- [Lembar data SSD1306 (Solomon Systech)](https://cdn-shop.adafruit.com/datasheets/SSD1306.pdf) — alamat `0x3C`/`0x3D` (dalam bentuk 8-bit: `0x78`/`0x7A`) dan cara kerja chip layar.
- [Dokumentasi layar OLED 0,96 inci Heltec](https://github.com/Heltec-Aaron-Lee/heltec0.96OLED) — peringatan bahwa VCC dan GND yang tertukar bisa merusak layar dalam waktu kurang dari satu detik.
- Kode sumber library: [Adafruit SSD1306](https://github.com/adafruit/Adafruit_SSD1306) 2.5.17, [Adafruit GFX Library](https://github.com/adafruit/Adafruit-GFX-Library) 1.12.6, [Adafruit BME280 Library](https://github.com/adafruit/Adafruit_BME280_Library) 2.3.0, [DallasTemperature](https://github.com/milesburton/Arduino-Temperature-Control-Library) 4.0.6, [OneWire](https://github.com/PaulStoffregen/OneWire) 2.3.8, dan [arduino-esp32](https://github.com/espressif/arduino-esp32) 3.3.12 (library `Wire`, `SPI`, dan `SD`, serta driver I2C `esp32-hal-i2c-ng.c`), ditambah [ESP-IDF](https://github.com/espressif/esp-idf) 5.5 (batas tahan SCL bawaan di `hal/esp32/include/hal/i2c_ll.h`).
- [Spesifikasi bus I2C (NXP UM10204)](https://www.nxp.com/docs/en/user-guide/UM10204.pdf) — waktu naik sinyal, arus tarik 3 mA, dan *clock stretching*.

**Gambar.** Diagram dan ilustrasi buatan sendiri dilisensikan **CC BY 4.0**, dan file sumber `.svg`-nya disertakan di folder `aset/` supaya bisa kamu ubah. Dua gambar yang memuat foto Wikimedia Commons (`kenali-komponen-tahap-2` dan `bme-vs-bmp`) berlisensi **CC BY-SA 4.0**, mengikuti lisensi fotonya, dan hanya tersedia sebagai `.jpg`. Ilustrasi meja kerja, modul, dan jendela Arduino IDE digambar ulang mengikuti bentuk aslinya; ukuran dan tata letak komponen asli bisa sedikit berbeda antarpabrik. Rekap lengkap juga ada di [`aset/SUMBER.md`](aset/SUMBER.md).

| File | Sumber | Lisensi / keterangan |
| :--- | :--- | :--- |
| `peta-jalan-modul-07`, `bus-jalan-tol`, `peta-bus-node1`, `desain-layar-node1` (`.png` + `.svg`) | Diagram orisinal kurikulum Fullstack IoT Developer. Kecepatan bus dari spesifikasi I2C NXP dan lembar data DS18B20. | CC BY 4.0 |
| `i2c-alamat`, `oled-koordinat`, `onewire-ds18b20`, `spi-microsd` (`.png` + `.svg`) | Diagram orisinal. Alamat dan ukuran layar dari lembar data SSD1306; alamat `0x76`/`0x77` dari lembar data BME280; *pull-up* dari spesifikasi I2C NXP; ukuran huruf dan *buffer* 1.024 byte dari kode sumber Adafruit GFX 1.12.6 dan Adafruit SSD1306 2.5.17; nomor seri 64-bit, waktu konversi, dan angka 85 °C dari lembar data DS18B20, serta cara library menandai −127 dari kode sumber DallasTemperature 4.0.6; jalur SPI dari kode sumber library `SD` Arduino-ESP32. | CC BY 4.0 |
| `simbol-skematik`, `skematik-modul-relay`, `skematik-node1-sensor`, `skematik-node1-aktuator` (`.png` + `.svg`) | Diagram orisinal. Skematik modul relay **disederhanakan** dari susunan umum modul relay ber-*optocoupler* (PC817, transistor S8050, dioda *flyback*); nilai komponen modulmu bisa berbeda. Skematik Node 1 digambar dari `PETA-PIN.md` versi 3. | CC BY 4.0 |
| `meja-kerja-oled`, `meja-kerja-bme280`, `meja-kerja-ds18b20`, `peta-kabel-microsd` (`.png` + `.svg`) | Ilustrasi orisinal meja kerja dua breadboard (lanjutan meja kerja Modul 5–6), digambar lubang demi lubang sesuai tabel di modul ini. | CC BY 4.0 |
| `arduino-library-ssd1306` (`.png` + `.svg`) | Ilustrasi orisinal yang digambar ulang dari Library Manager Arduino IDE 2.3.10 (bukan tangkapan layar). Teks dialog diambil dari kode sumber Arduino IDE; nama dan kalimat library dari `library.properties` Adafruit SSD1306 2.5.17 dan Adafruit SSD1306 Wemos Mini OLED 1.1.2. | CC BY 4.0 untuk ilustrasinya |
| `kenali-komponen-tahap-2.jpg` | Kolase foto Wikimedia Commons: [layar OLED](https://commons.wikimedia.org/wiki/File:MicroSD_card_connected_to_Arduino_nano_with_OLED_display.jpg) dipotong dari foto Turbospok (CC BY-SA 4.0), [BME280](https://commons.wikimedia.org/wiki/File:SparkFun_Atmospheric_Sensor_Breakout_-_BME280_13676.jpg) oleh SparkFun ([CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)), dan [DS18B20](https://commons.wikimedia.org/wiki/File:Sensor_DS18B20.jpg) oleh Leonardo Postay (CC BY-SA 4.0). Ilustrasi modul microSD dan susunan kolase oleh penulis. | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), mengikuti foto-fotonya |
| `bme-vs-bmp.jpg` | Foto Wikimedia Commons: [chip BME280](https://commons.wikimedia.org/wiki/File:BME280.jpg) oleh Laserlicht (CC BY-SA 4.0) dan [modul BMP280](https://commons.wikimedia.org/wiki/File:BMP280Sensor.jpg) oleh AGermanBeck (CC BY-SA 4.0), keduanya dipotong; label oleh penulis. Ukuran kemasan dan chip ID dari lembar data Bosch. | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), mengikuti fotonya |
| `wokwi-oled-pertama.png`, `wokwi-oled-tata-letak.png`, `wokwi-bme280.png`, `wokwi-ds18b20.png`, `wokwi-microsd.png`, `wokwi-layar-node1.png`, `wokwi-node-1-v4.png` | Tangkapan layar simulator [Wokwi](https://wokwi.com) (Oktober 2026) yang menjalankan kode dan `diagram.json` modul ini, dipotong dan disusun ulang. Penanda dan label oleh penulis. | © Wokwi (CodeMagic LTD); dipakai untuk tujuan pendidikan. |

Semua sketsa di modul ini, termasuk Node 1 v0.4.0, sudah dijalankan di Wokwi dengan paket esp32 versi 3 dan versi library di tabel 🧰, dan setiap langkah antara di bagian ➕ sudah diperiksa dengan kompiler. Pesan error yang dikutip mengikuti keluaran kompiler GCC di paket esp32.

---

[⬅️ Modul 6](../modul-06-membaca-sensor/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · **Berikutnya: [Modul 8 — Firmware Tangguh: millis(), State Machine, Kode Modular, Watchdog, & Debugging](../modul-08-firmware-tangguh/README.md) ➡️**
