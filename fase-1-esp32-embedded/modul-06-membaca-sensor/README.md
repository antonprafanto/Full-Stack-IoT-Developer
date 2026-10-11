# Modul 6 — Membaca Sensor: Analog, Digital, & Kalibrasi

*Fase 1 · Minggu 6 · Perangkat keras (*hardware*): **Kit A Tahap 1** (lihat 🧰) — semua praktik juga bisa dicoba di Wokwi · Prasyarat: **Modul 5** (meja kerja dua breadboard dan Node 1 v0.2.0) · Waktu: 8–10 jam, dicicil dalam seminggu*

[⬅️ Modul 5](../modul-05-gpio-dan-peta-pin/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · [Modul 7 ➡️](../modul-07-bus-sensor-oled-skematik/README.md)

---

Minggu lalu, Node 1 mendapatkan "tangan": relay, pompa, servo, dan buzzer. Namun, tangan tanpa indra hanya bisa menunggu perintah. Minggu ini kita memasang **lima indra** Node 1 sehingga ia bisa **merasakan** keadaan rumah sendiri:

| Indra | Sensor | Pertanyaan yang dijawabnya |
| :--- | :--- | :--- |
| Kulit | **DHT22** | Berapa suhu dan kelembapan udara di ruangan? |
| Mata | **LDR** | Ruangan sedang terang atau gelap? |
| Akar tanaman | **Sensor tanah kapasitif** | Tanah di pot masih basah atau sudah kering? |
| "Radar" gerakan | **PIR** | Ada orang yang lewat? |
| Penggaris gema | **HC-SR04** | Berapa sisa air di tandon pompa? |

Kelima sensor itu "berbicara" dengan cara yang berbeda-beda: ada yang mengeluarkan **tegangan** (analog), ada yang hanya berkata **ya/tidak** (digital), dan ada yang mengirim **pulsa atau deretan data**. Minggu ini kamu belajar mendengarkan ketiganya, mengubah angka mentahnya menjadi satuan yang dimengerti manusia (°C, %, cm), dan — ini yang paling penting — **mengenali kapan sensor "berbohong"**: kabel longgar, bacaan bergoyang, atau angka yang belum dikalibrasi.

Di akhir minggu, Node 1 v0.3.0 punya dua aturan otomatis pertamanya: **siram otomatis** saat tanah kering — yang **menolak** menyalakan pompa kalau air tandon tinggal sedikit — dan **lampu otomatis** saat ada gerakan di tempat gelap.

![Peta jalan Modul 6. Atas, enam fase kurikulum dari Fase 0 Fondasi sampai Fase 5 Operasi dan skala; Fase 1 ESP32, Modul 5 sampai 9, disorot, Modul 1 sampai 5 bertanda selesai, dan Modul 6 ditandai KAMU DI SINI dengan catatan lima indra untuk Node 1. Bawah, kotak Modul 6 minggu ini, sekitar 8 sampai 10 jam yang dicicil dengan Kit A Tahap 1, berisi sebelas hal: KC, Kemenangan Cepat, sensor cahaya di Wokwi; P1, LDR dan pembagi tegangan; P2, derau, rata-rata bergerak, dan Serial Plotter; P3, kalibrasi sensor tanah dengan segelas air; P4, DHT22 dengan library; P5, sensor gerak PIR; P6, HC-SR04 dan pembagi tegangan untuk level air tandon; P7, monitor lima sensor; P8, siram otomatis dan lampu otomatis; P9, menyimpan ke GitHub; dan tanda plus, Tambahan: Node 1 versi 0.3.0 dan PETA-PIN.md versi 2. Tanda bintang menandai P3, P6, dan P8 sebagai bagian dari syarat lulus](aset/peta-jalan-modul-06.png)

> [!NOTE]
> **Cara memakai modul ini.**
>
> - Setiap kotak kode punya tombol salin di pojok kanan atasnya. Semua sketsa juga tersedia sebagai file di folder [`kode/`](kode/), lengkap dengan `diagram.json` (dan `libraries.txt` kalau perlu) untuk Wokwi.
> - Kotak yang didahului kata **Hasilnya** hanya untuk dicocokkan, bukan diketik.
> - **Belum punya semua sensornya?** Semua praktik bisa dicoba di Wokwi. Di Wokwi, sensor tanah diganti dengan **potensiometer** (Wokwi belum punya sensor tanah), dan nilai sensor lain diubah dengan menggeser *slider* (penggeser). Yang tidak bisa disimulasikan hanyalah urusan dunia nyata: derau, gelas air, dan multimeter. Bagian itu ditandai jelas.
> - **Papan ESP32 di Wokwi minggu ini diputar menyamping**: colokan USB di kiri, deretan pin VIN…EN di atas, dan deretan 3V3…D23 di bawah — persis seperti papan di breadboard-mu. Jadi, kabel sensor di Wokwi masuk ke deretan yang sama dengan di mejamu.
> - Pengguna macOS: ganti **Ctrl** dengan **Cmd** untuk menyimpan, menyalin, dan menempel.

> [!WARNING]
> **Tiga aturan keselamatan minggu ini.**
>
> 1. **Sebelum mengubah kabel apa pun, matikan MB102, lalu cabut USB** (aturan emas nomor 5 dari Modul 5). Menyalakannya lagi juga berurutan: colokkan USB dulu, baru nyalakan MB102.
> 2. **Pin ESP32 tidak tahan 5 V.** Sinyal dari sensor yang diberi 5 V (PIR dan HC-SR04) hanya boleh masuk ke pin lewat jalur yang aman: PIR sudah mengeluarkan 3,3 V, sedangkan ECHO HC-SR04 **wajib** lewat pembagi tegangan (Konsep 3). DHT22, LDR, dan sensor tanah selalu diberi **3,3 V dari rel bawah**, tidak pernah 5 V.
> 3. **Jauhkan air dari listrik.** Gelas air untuk kalibrasi dan tandon pompa diletakkan di nampan, jauh dari breadboard, adaptor, dan laptop. Bagian elektronik sensor tanah (bagian atas yang ada chip dan colokannya) tidak boleh basah (Konsep 6).

Ritme modul ini sama dengan Modul 1–5. Bagian lipat di 🚨 (klik judulnya) cukup dibuka saat kamu membutuhkannya; bagian lipat di 🔬 boleh dilewati. Setiap praktik diawali kotak **🖥️** yang menyebut alat dan komponen yang dipakai.

## Daftar isi

1. [🎯 Setelah modul ini kamu bisa…](#-setelah-modul-ini-kamu-bisa)
2. [🧰 Yang perlu disiapkan](#-yang-perlu-disiapkan)
3. [🏆 Kemenangan Cepat: sensor cahaya pertamamu, langsung di Wokwi (10 menit)](#-kemenangan-cepat-sensor-cahaya-pertamamu-langsung-di-wokwi-10-menit)
4. [🧠 Konsep "Mengapa"](#-konsep-mengapa)
   - [1 Lima indra Node 1](#1-lima-indra-node-1-tiga-cara-sensor-berbicara) · [2 ADC](#2-adc-penggaris-12-bit-dan-keterbatasannya) · [3 Pembagi tegangan](#3-pembagi-tegangan-satu-rumus-dua-kegunaan) · [4 Derau](#4-derau-rata-rata-bergerak-dan-kapasitor-100-nf) · [5 Kalibrasi](#5-dari-angka-mentah-ke-satuan-map-constrain-dan-kalibrasi-dua-titik) · [6 Sensor tanah](#6-sensor-kelembapan-tanah-kapasitif) · [7 Lembar data](#7-membaca-lembar-data-lima-hal-yang-dicari) · [8 DHT22](#8-dht22-protokol-satu-kabel-dan-library) · [9 PIR](#9-pir-sensor-gerak-yang-cukup-berkata-ya-atau-tidak) · [10 HC-SR04](#10-hc-sr04-mengukur-jarak-dengan-gema) · [11 Kontrak data](#11-kontrak-data-dan-saat-sensor-berbohong)
5. [🔧 Praktik langkah demi langkah](#-praktik-langkah-demi-langkah)
   - [1 LDR](#praktik-1--ldr-dan-pembagi-tegangan-30-menit) · [2 Derau & Serial Plotter](#praktik-2--derau-rata-rata-bergerak-dan-serial-plotter-25-menit) · [3 Kalibrasi tanah ⭐](#praktik-3--kalibrasi-sensor-tanah-dengan-segelas-air-30-menit) · [4 DHT22](#praktik-4--dht22-suhu-dan-kelembapan-dengan-library-25-menit) · [5 PIR](#praktik-5--pir-sensor-gerak-dan-pemanasan-1-menit-20-menit) · [6 Level air tandon ⭐](#praktik-6--hc-sr04-dan-pembagi-tegangan-level-air-tandon-40-menit) · [7 Monitor lima sensor](#praktik-7--monitor-lima-sensor-rapi-setiap-2-detik-20-menit) · [8 Siram & lampu otomatis ⭐](#praktik-8--siram-otomatis-dan-lampu-otomatis-30-menit) · [9 GitHub](#praktik-9--simpan-ke-github-15-menit)
6. [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)
7. [🔬 Bedah Teknis (opsional)](#-bedah-teknis-opsional)
8. [🧩 Tantangan mandiri](#-tantangan-mandiri)
9. [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini)
10. [📖 Glosarium](#-glosarium) · [📝 Kuis](#-kuis-5-soal) · [✅ Checklist kelulusan](#-checklist-kelulusan-modul-6)
11. [📚 Sumber & atribusi gambar](#-sumber--atribusi-gambar)

---
## 🎯 Setelah modul ini kamu bisa…

- **Membaca tiga jenis keluaran sensor**: tegangan analog (`analogRead`), sinyal digital ya/tidak (`digitalRead`), serta pulsa dan deretan data (`pulseIn` dan library DHT).
- **Menjelaskan cara kerja ADC 12-bit ESP32 beserta keterbatasannya**, dan memastikan **semua sensor analogmu ada di pin ADC1**.
- **Merakit pembagi tegangan** untuk LDR dan untuk menurunkan sinyal ECHO 5 V HC-SR04 menjadi ±3,4 V yang aman bagi ESP32 — lalu membuktikannya dengan multimeter.
- **Meredam derau** dengan rata-rata dan kapasitor 100 nF, lalu melihat bedanya di Serial Plotter.
- **Mengalibrasi sensor** dengan dua titik acuan: sensor tanah (udara 0 %, air 100 %) dan tandon (kosong 0 %, penuh 100 %), memakai `map()` dan `constrain()`.
- **Membaca lembar data** (*datasheet*) sensor, cukup bagian yang penting saja.
- **Mengisi `struct BacaanSensor` persis sesuai kontrak data** (Lampiran A Silabus) dan menandai bacaan yang gagal supaya tidak dipercaya begitu saja.
- **Menulis dua aturan otomatis yang aman**: siram otomatis yang menolak menyalakan pompa saat tandon hampir kosong, dan lampu otomatis.

---

## 🧰 Yang perlu disiapkan

| Kebutuhan | Keterangan |
| :--- | :--- |
| **Meja kerja dari Modul 5** | Dua breadboard, papan ESP32, MB102 + adaptor 5 V 2 A + kabel USB A–A, serta semua komponen Node 1 (tombol, buzzer, servo, modul relay, kipas, pompa + MOSFET). **Biarkan semuanya terpasang**; minggu ini kita hanya menambah sensor. Satu-satunya yang dicabut adalah potensiometer di breadboard bawah (Praktik 3). |
| **Kit A Tahap 1 — komponen yang mulai dipakai minggu ini** | Modul **DHT22** (3 kaki); **LDR** 5 mm; sensor kelembapan tanah **kapasitif** v1.2 atau v2.0; sensor gerak PIR **HC-SR501**; sensor jarak ultrasonik **HC-SR04** (versi biasa, HC-SR04+/HC-SR04P, atau RCWL-1601 — di modul ini semuanya dipasang dengan cara yang sama); kapasitor keramik **100 nF** (bertuliskan "104"); resistor **10 kΩ** (2 buah) dan **4,7 kΩ** (1 buah); kabel jumper jantan–jantan dan jantan–betina (sekitar 10 jantan–jantan dan 10–14 jantan–betina). |
| **Wadah tandon** | Wadah plastik bekas, misalnya wadah es krim 1 liter atau baskom kecil, dengan **lebar dan kedalaman minimal 10 cm**. Pompa dari Modul 5 dipindahkan ke wadah ini, dan HC-SR04 dipasang di atasnya (Praktik 6). Gelas minum terlalu sempit karena gema memantul dari dindingnya. Siapkan juga sepotong karton tebal (atau penggaris cadangan) sebagai "jembatan" penopang sensor di atas wadah, selotip, dan penggaris untuk mengukur. |
| **Segelas air + nampan + lap** | Untuk kalibrasi sensor tanah (Praktik 3). Pot berisi tanah (opsional) untuk uji coba sungguhan. |
| **Pelindung sensor tanah** (opsional, sangat dianjurkan) | Selongsong bakar (*heat shrink*) plus pengering rambut untuk mengerutkannya, atau cat kuku bening, untuk melapisi bagian elektronik dan tepi papan sensor tanah (Konsep 6). Spidol untuk menandai garis batas. |
| **Obeng kecil** | Obeng minus atau plus berujung kecil untuk memutar kenop PIR (Praktik 5). |
| **Multimeter** | Dari Modul 2. Dipakai di Praktik 1 dan 6. |
| **Laptop + Arduino IDE 2 + kabel USB data** | Sudah terpasang sejak Modul 2. Serial Plotter sudah ada di dalam Arduino IDE; library baru dipasang di Praktik 4. |
| **Browser + Wokwi** | Untuk Kemenangan Cepat dan untuk mencoba setiap praktik sebelum merakit. |

**Versi yang dipakai di modul ini:**

| Alat | Versi | Catatan |
| :--- | :--- | :--- |
| Arduino IDE | **2.3.x** (saat ditulis: 2.3.10) | Dari Modul 2. Serial Plotter ada di menu **Tools**. |
| Paket papan **esp32 by Espressif Systems** | **3.3.x** (saat ditulis: 3.3.12) | Dari Modul 2. |
| Library **DHT sensor library** (Adafruit) | **1.4.7** | Dipasang di Praktik 4. |
| Library **Adafruit Unified Sensor** | **1.1.15** | Pendamping wajib library DHT; ikut ditawarkan saat memasang library DHT. |
| Library **ESP32Servo** | **3.2.1** | Dari Modul 5; dipakai lagi oleh Node 1. |

---

## 🏆 Kemenangan Cepat: sensor cahaya pertamamu, langsung di Wokwi (10 menit)

Minggu lalu, ESP32 sudah membaca kenop potensiometer dengan `analogRead()`. Sekarang ia membaca sensor sungguhan yang besarnya bisa **berapa saja**: terangnya cahaya. Kita mulai di Wokwi supaya kamu langsung melihat hasilnya tanpa merakit apa pun.

> 🖥️ **Alat yang dipakai di bagian ini:** browser, situs [Wokwi](https://wokwi.com). Tidak perlu kit, tidak perlu memasang apa pun.

1. Buka **https://wokwi.com/projects/new/esp32** di browser. Muncul proyek ESP32 kosong: kode di kiri, papan di kanan.
2. Klik kanan tautan [`kode/modul06_cahaya_pertama/diagram.json`](kode/modul06_cahaya_pertama/diagram.json) → **Buka di tab baru**, lalu klik tombol **Copy raw file** (ikon dua kotak) di kanan atas isi file itu. Kembali ke tab Wokwi, klik tab **`diagram.json`** di atas editor, pilih semua isinya (**Ctrl + A**), lalu tempel (**Ctrl + V**). Di kanan, papan ESP32 kini menyamping — sama seperti di breadboard-mu — dan di atasnya berdiri modul sensor cahaya yang kaki AO-nya turun ke pin **VP** (kaki VCC dan GND-nya memutar ke 3V3 dan GND di deretan bawah).
3. Klik tab **`sketch.ino`**, hapus isinya, lalu tempel kode ini:

   ```cpp
   // Modul 6 - Kemenangan Cepat: membaca cahaya pertamamu
   // Sensor cahaya (LDR) di VP (GPIO 36). Makin terang, makin KECIL angka mentahnya,
   // jadi kita membaliknya: cahaya = 4095 - mentah (makin terang, makin besar).

   const int PIN_LDR = 36;  // VP: LDR (peta pin kanonik)

   void setup() {
     Serial.begin(115200);
     Serial.println("Sensor cahaya siap. Ubah terangnya, lalu lihat angkanya.");
   }

   void loop() {
     int mentah = analogRead(PIN_LDR);  // 0 sampai 4095
     int cahaya = 4095 - mentah;        // dibalik: makin terang, makin besar
     Serial.print("mentah = ");
     Serial.print(mentah);
     Serial.print("   cahaya = ");
     Serial.println(cahaya);
     delay(500);
   }
   ```

4. Klik tombol hijau **▶**. Setelah `Sensor cahaya siap. …` muncul di Serial Monitor (di bawah panel simulasi), setiap setengah detik tercetak `mentah = 1001   cahaya = 3094`.
5. **Klik modul sensor cahaya** di panel simulasi. Sebuah jendela kecil berjudul `Photoresistor (LDR)` muncul dengan penggeser (*slider*) **ILLUMINATION (LUX)** — terang cahaya dalam satuan lux. Geser ke kiri (gelap), lalu ke kanan (terang), sambil memperhatikan Serial Monitor. Jendela itu ditutup dengan tanda **✕** di pojok kanannya.

![Tangkapan layar Wokwi: papan ESP32 menyamping dengan modul sensor cahaya berdiri di atasnya; kaki AO tersambung ke VP, sedangkan kaki VCC dan GND memutar ke pin 3V3 dan GND di deretan bawah. Penanda 1: LDR kecil berwarna merah di ujung atas modul; modul itu diklik sehingga jendela Photoresistor (LDR) terbuka. Penanda 2: penggeser ILLUMINATION (LUX) digeser ke kiri sampai sekitar 10 lux. Penanda 3: Serial Monitor menampilkan mentah = 3413 dan cahaya = 682; sebelumnya mentah = 1001 dan cahaya = 3094](aset/wokwi-cahaya-pertama.png)

*Tangkapan layar [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), Oktober 2026; dipakai untuk tujuan pendidikan, penanda oleh penulis.*

**Hasilnya** kira-kira seperti ini (penggeser Wokwi tidak selalu bisa berhenti tepat di angka bulat, jadi angkamu boleh sedikit berbeda):

| Posisi penggeser | Mirip keadaan | `mentah` | `cahaya` |
| :--- | :--- | ---: | ---: |
| ±1 lux | kamar gelap di malam hari | ±3938 | ±157 |
| ±10 lux | kamar remang-remang | ±3413 | ±682 |
| 500 lux (posisi awal) | ruangan yang terang | 1001 | 3094 |
| ±10.000 lux | dekat jendela di siang hari | ±156 | ±3939 |

Selamat — ESP32-mu sekarang bisa "melihat" terang dan gelap! Dua hal di kode itu perlu kamu perhatikan:

- **`analogRead(PIN_LDR)`** membaca **tegangan** di pin VP dan menjawabnya dengan angka **`0`–`4095`**. Pin tidak perlu `pinMode` dulu. Konsep 2 menjelaskan dari mana angka `4095` berasal.
- **Angkanya terbalik**: makin terang, `mentah` makin **kecil**. Konsep 3 menjelaskan sebabnya. Karena manusia lebih mudah berpikir "makin terang, makin besar", kita membaliknya dengan `cahaya = 4095 - mentah`. Nama `cahaya` itu bukan kebetulan: kontrak data proyek kita (Lampiran A Silabus) memakai nama kolom yang sama.

Penasaran? Geser penggeser ke ujung paling kanan (100.000 lux, seterang matahari siang) lalu ke ujung paling kiri. Perhatikan: di dekat kedua ujung, angkanya hanya bergeser sedikit walaupun terangnya berubah sampai sepuluh kali lipat. Sensor juga punya batas — ini salah satu cara sensor "berbohong" yang dibahas di Konsep 11.

---
## 🧠 Konsep "Mengapa"

Sebelas konsep, satu per bagian — **tidak perlu dibaca sekaligus**. Konsep dan praktik dikerjakan berselang-seling dengan urutan ini:

1. Konsep 1–3 → Praktik 1 (LDR)
2. Konsep 4 → Praktik 2 (derau dan Serial Plotter)
3. Konsep 5–6 → Praktik 3 (kalibrasi sensor tanah)
4. Konsep 7–8 → Praktik 4 (DHT22)
5. Konsep 9 → Praktik 5 (PIR)
6. Konsep 10 → Praktik 6 (HC-SR04 dan level air tandon)
7. Konsep 11 → Praktik 7–9 (monitor lima sensor, aturan otomatis, GitHub)
8. 🧩 Tantangan → ➕ Rumah Pintar Mini → 📝 Kuis → ✅ Checklist

Di setiap titik pindah ada kotak ➡️ (maju ke praktik) dan ⬆️ (kembali ke konsep) yang tautannya tinggal diklik.

> 🖥️ **Perlu mencoba kode di bagian Konsep?** Tidak wajib — semua kode akan kamu jalankan di Praktik. Kode di bagian Konsep hanya potongan; versi utuhnya ada di sketsa Praktik, yang bisa dicoba di Wokwi dengan `diagram.json` dari folder [`kode/`](kode/), persis seperti Kemenangan Cepat.

### 1. Lima indra Node 1: tiga cara sensor berbicara

**Sensor** adalah komponen yang mengubah sesuatu di dunia nyata — terang, panas, basah, jarak, gerakan — menjadi **sinyal listrik**. ESP32 tidak bisa merasakan panas atau melihat cahaya; ia hanya bisa membaca listrik di kakinya. Jadi, tugas kita adalah memahami "bahasa listrik" setiap sensor. Ada tiga bahasa:

1. **Analog** — tegangan yang bisa bernilai **berapa saja** di antara 0 dan 3,3 V, seperti keran yang bisa dibuka sedikit demi sedikit. Makin terang, makin basah, atau makin jauh, tegangannya ikut bergeser. LDR dan sensor tanah berbicara dengan bahasa ini. ESP32 membacanya dengan **`analogRead()`** dan menjawab dengan angka `0`–`4095`.
2. **Digital** — hanya **dua keadaan**, HIGH atau LOW, seperti sakelar. PIR berbicara dengan bahasa ini: HIGH = ada gerakan. ESP32 membacanya dengan **`digitalRead()`**, persis seperti tombol di Modul 5.
3. **Pulsa dan data** — sinyalnya tetap digital (HIGH/LOW), tetapi **informasinya tersimpan di waktunya**. HC-SR04 menjawab dengan satu pulsa: makin lama pulsanya HIGH, makin jauh bendanya. DHT22 mengirim deretan 40 pulsa pendek-panjang yang menyandikan angka suhu dan kelembapan. ESP32 membacanya dengan **`pulseIn()`** atau dengan bantuan library.

| Sensor | Mengukur | Bahasa | Pin (peta pin kanonik) | Daya |
| :--- | :--- | :--- | :--- | :--- |
| **DHT22** | suhu dan kelembapan udara | data digital lewat satu kabel | D14 | 3,3 V |
| **LDR** + resistor 10 kΩ | terang-gelap | analog (lewat pembagi tegangan) | VP (GPIO 36) | 3,3 V |
| **Sensor tanah kapasitif** | kelembapan tanah | analog | VN (GPIO 39) | 3,3 V |
| **PIR HC-SR501** | gerakan manusia atau hewan | digital | D34 | 5 V (keluarannya tetap 3,3 V) |
| **HC-SR04** | jarak, untuk level air tandon | pulsa | TRIG di D15, ECHO di D35 (lewat pembagi tegangan) | 5 V |

Belum pernah melihat sensor-sensor itu? Begini rupanya — cocokkan dengan isi kit-mu:

![Kolase foto sensor Node 1, berjudul Kenali sensormu. Dari kiri: modul DHT22, sensor putih berkisi di atas papan hitam kecil dengan tiga kaki bertuliskan plus, out, minus; LDR 5 milimeter, kepala bulat oranye dengan garis berkelok dan dua kaki panjang; modul PIR HC-SR501 tampak belakang, papan putih bertulisan biru dengan dua kenop oranye, kubah putih di baliknya, dan tiga kaki berpangkal kuning; modul HC-SR04 biru dengan dua silinder logam berkasa dan empat kaki bertuliskan Vcc, Trig, Echo, Gnd; serta ilustrasi sensor tanah kapasitif, papan hitam memanjang berujung runcing. Keterangan: bentuk sebenarnya bisa sedikit berbeda antarpabrik](aset/foto-sensor-node-1.jpg)

*Foto: [Suyash Dwivedi](https://commons.wikimedia.org/wiki/File:AM2302_%28DHT22%29_digital_temperature_and_humidity_sensor_module.jpg) (DHT22, CC BY-SA 4.0), [Nevit Dilmen](https://commons.wikimedia.org/wiki/File:LDR_1480405_6_7_HDR_Enhancer_1.jpg) (LDR, CC BY-SA 3.0), [Sjilla](https://commons.wikimedia.org/wiki/File:PIR_motion_sensor_for_Arduino_oblique_view.jpg) (PIR, CC BY-SA 4.0), dan [Nevit Dilmen](https://commons.wikimedia.org/wiki/File:HC_SR04_Ultrasonic_sensor_1480322_3_4_HDR_Enhancer.jpg) (HC-SR04, CC BY-SA 3.0), semuanya dari Wikimedia Commons; ilustrasi sensor tanah dan susunan kolase oleh penulis. Foto dipotong dan diperkecil. Lisensi foto: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) dan [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/); kolase ini berlisensi [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).*

![Lima sensor Node 1 dikelompokkan menurut bahasanya. Kolom analog: LDR dengan resistor 10 kiloohm ke VP atau GPIO 36, dan sensor tanah kapasitif ke VN atau GPIO 39; keduanya diberi 3,3 volt dan dibaca analogRead sebagai angka 0 sampai 4095. Kolom digital: PIR HC-SR501 ke D34, diberi 5 volt, tetapi mengeluarkan 3,3 volt, dibaca digitalRead sebagai HIGH atau LOW. Kolom pulsa dan data, dibaca dengan pulseIn() atau library karena informasinya ada di waktu: HC-SR04 untuk jarak dan level air tandon, dengan TRIG di D15 dan ECHO lewat pembagi tegangan ke D35, diberi 5 volt; serta DHT22 untuk suhu dan kelembapan udara di D14, diberi 3,3 volt. Catatan bawah: pin analog semuanya di ADC1; ECHO lewat pembagi tegangan sehingga tinggal sekitar 3,4 volt; sinyal yang masuk ke pin ESP32 selalu di bawah batas 3,6 volt](aset/lima-sensor-node-1.png)

Pin-pin itu sudah **dipesan** sejak Modul 5 di `PETA-PIN.md`, dan setiap pilihan ada alasannya:

- **LDR dan sensor tanah di VP dan VN** — keduanya pin ADC1, satu-satunya pembaca analog yang tetap bekerja saat WiFi menyala (Konsep 2).
- **PIR dan ECHO di D34 dan D35** — pin hanya masukan yang cocok untuk sensor. Keduanya dipilih alih-alih VP/VN karena catatan *ESP32 Series SoC Errata*: masukan digital di GPIO 36 dan 39 bisa tertarik ke bawah sesaat ketika ADC atau WiFi aktif (Modul 5).
- **DHT22 di D14** — pin aman yang bisa menjadi masukan sekaligus keluaran; DHT22 memerlukan keduanya (Konsep 8).
- **TRIG di D15** — pin *strapping* yang aman dipakai sebagai **keluaran**. TRIG memang hanya keluaran.

Satu hal lagi yang akan terus muncul minggu ini: **sensor bisa "berbohong"**. Kabel longgar, angka yang bergoyang, sensor yang belum dikalibrasi, atau sensor yang lupa diberi listrik semuanya menghasilkan angka — angka yang salah. Konsep 11 mengajarkan cara membedakan angka jujur dari angka bohong.

### 2. ADC: penggaris 12-bit dan keterbatasannya

**ADC** (*Analog-to-Digital Converter*, pengubah analog ke digital) adalah bagian chip yang mengukur tegangan di sebuah pin lalu menjawabnya dengan angka. Bayangkan sebuah **penggaris**: panjangnya dari 0 sampai sekitar 3,3 V, dan garis skalanya ada **4.096** buah, bernomor `0` sampai `4095`. Angka 4.096 berasal dari **12 bit**: dua belas angka 2 yang dikalikan (2 × 2 × … × 2 = 2¹² = 4.096). Jarak antargaris sangat rapat, sekitar 3,3 V ÷ 4095 ≈ 0,8 mV.

Untuk perkiraan kasar, angka mentah bisa diubah kembali menjadi tegangan:

```cpp
float tegangan = mentah * 3.3 / 4095;  // perkiraan kasar: 1001 -> sekitar 0,81 V
```

Sayangnya, penggaris ADC ESP32 **tidak sempurna**. Ada empat hal yang perlu kamu tahu:

1. **Ujung-ujungnya tumpul.** Dengan pengaturan bawaan, ADC ESP32 hanya bisa membaca dengan baik antara ±0,15 V dan ±3,1 V. Tegangan di bawah ±0,15 V semuanya terbaca `0`, dan di atas ±3,1 V semuanya sudah `4095`. Di bagian tengah pun, garis skalanya tidak lurus sempurna (**tidak linear**). Di papan asli, angkanya biasanya sedikit lebih kecil daripada penggaris lurus dan berbeda di setiap chip: tegangan yang sama bisa terbaca `1850` di satu papan dan `1950` di papan lain. Untuk keputusan seperti "gelap atau terang" atau persentase yang dikalibrasi dengan keadaan nyata (Konsep 5), ini tidak masalah. Kalau butuh tegangan yang lebih tepat, ada `analogReadMilliVolts()` (🔬).
2. **Angkanya bergoyang.** Walaupun tegangannya diam, bacaan berturut-turut bisa berbeda belasan sampai puluhan angka. Ini **derau** (Konsep 4).
3. **ADC2 mogok saat WiFi menyala.** ESP32 punya dua ADC. ADC2 (GPIO 0, 2, 4, 12–15, 25–27; GPIO 0 tidak dikeluarkan di papan 30 pin) dipinjam oleh radio WiFi sehingga `analogRead()` di pin-pin itu gagal selama WiFi menyala — dan mulai Modul 10, WiFi selalu menyala. Karena itu, **semua sensor analog proyek kita ada di ADC1**: GPIO 32–39, yang di papan kita berarti GPIO 32, 33, 34, 35, 36 (VP), dan 39 (VN).
4. **Batas tegangan.** Pin ESP32 dirancang untuk paling tinggi 3,3 V. Menurut lembar data ESP32, batas atas tegangan masukan adalah 3,3 V + 0,3 V = **3,6 V**. Sinyal 5 V harus diturunkan dulu (Konsep 3).

![Penggaris ADC 12-bit ESP32, gambaran. Sumbu tegangan dari 0 sampai 3,3 volt dipetakan ke angka 0 sampai 4095. Garis putus-putus abu-abu adalah penggaris lurus yang ideal, sama dengan cara Wokwi menghitung; titik biru menandai contohnya, 0,81 volt sekitar 1001. Garis merah ESP32 sebenarnya datar di 0 di bawah sekitar 0,15 volt, lalu berjalan sedikit di bawah garis ideal di sebagian besar rentang, naik lebih curam mendekati 3,1 volt, dan datar di 4095 di atasnya. Di samping, kotak hijau ADC1 dengan tulisan tetap bekerja saat WiFi menyala: GPIO 32, 33, 34, 35, 36 atau VP untuk LDR, dan 39 atau VN untuk sensor tanah, dengan catatan GPIO 34 sampai 39 hanya masukan; kotak abu-abu ADC2 dengan tulisan mogok saat WiFi menyala: GPIO 0, 2, 4, 12 sampai 15, dan 25 sampai 27, dengan catatan GPIO 0 tidak dikeluarkan di papan 30 pin; dan kotak merah batas tegangan pin 3,3 ditambah 0,3 sama dengan 3,6 volt](aset/adc-penggaris.png)

> [!IMPORTANT]
> **Syarat lulus: semua sensor analogmu di pin ADC1.** Di Node 1, LDR ada di **VP (GPIO 36)** dan sensor tanah di **VN (GPIO 39)** — keduanya ADC1. Kalau suatu hari kamu menambah sensor analog lain, pilih juga dari GPIO 32–39, dan cek dulu `PETA-PIN.md`.

Di Wokwi, ADC disimulasikan sebagai penggaris yang lurus sempurna dan tenang. Karena itu, angka di Wokwi dan di papan asli untuk keadaan yang sama bisa berbeda sampai sekitar 200 — wajar. Di papan asli, angka mentahnya biasanya sedikit lebih kecil daripada hitungan penggaris lurus.

### 3. Pembagi tegangan: satu rumus, dua kegunaan

**LDR** (*Light Dependent Resistor*, resistor peka cahaya) adalah resistor yang hambatannya berubah mengikuti cahaya. Di ruangan berlampu, hambatannya beberapa kiloohm; dalam gelap total bisa 1 MΩ (satu juta ohm) atau lebih. LDR tipe GL5528 yang umum dijual, misalnya, berhambatan sekitar 10–20 kΩ pada cahaya 10 lux. Masalahnya, **ESP32 tidak bisa mengukur hambatan** — hanya tegangan. Jadi, hambatan itu kita ubah menjadi tegangan dengan **pembagi tegangan** (*voltage divider*).

Pembagi tegangan hanyalah **dua resistor yang disambung berurutan** di antara sumber tegangan dan GND. Arus yang sama mengalir melewati keduanya, dan tegangannya **terbagi sebanding dengan hambatan masing-masing**: resistor yang hambatannya lebih besar kebagian tegangan lebih banyak. Tegangan di titik sambungan tengahnya sama dengan bagian yang diterima resistor bawah:

```text
V_tengah = V_masuk × R_bawah ÷ (R_atas + R_bawah)
```

**Kegunaan 1: LDR.** Di rangkaian kita, resistor **10 kΩ** di atas (ke 3,3 V) dan **LDR** di bawah (ke GND), dan titik tengahnya masuk ke VP:

| Keadaan | Hambatan LDR (kira-kira) | Tegangan titik tengah | `mentah` (kira-kira) | `cahaya` (kira-kira) |
| :--- | ---: | ---: | ---: | ---: |
| Dekat jendela, siang | 1 kΩ | 3,3 × 1 ÷ 11 = 0,30 V | 370 (papan asli: ±200) | 3725 |
| Ruangan berlampu | 5 kΩ | 3,3 × 5 ÷ 15 = 1,10 V | 1365 | 2730 |
| Remang-remang | 20 kΩ | 3,3 × 20 ÷ 30 = 2,20 V | 2730 | 1365 |
| Kamar gelap | 200 kΩ | 3,3 × 200 ÷ 210 = 3,14 V | 3897 (papan asli: mentok 4095) | 198 (papan asli: 0) |

*(Angka `mentah` dihitung dengan penggaris lurus `tegangan × 4095 ÷ 3,3`; papan aslimu akan sedikit berbeda.)*

Sekarang kamu tahu kenapa angka di Kemenangan Cepat terbalik: makin terang, hambatan LDR makin kecil sehingga resistor bawah kebagian tegangan lebih **sedikit**. Seandainya LDR diletakkan di atas dan resistor 10 kΩ di bawah, angkanya justru naik saat terang. Kita sengaja memilih susunan pertama karena modul sensor cahaya di Wokwi juga tersusun begitu sehingga sketsa yang sama bekerja di Wokwi dan di papan asli.

**Kegunaan 2: menurunkan sinyal ECHO 5 V.** HC-SR04 diberi 5 V sehingga pulsa di kaki ECHO-nya juga 5 V — terlalu tinggi untuk pin ESP32. Rumus yang **sama** menyelamatkan kita: resistor **4,7 kΩ** di atas (dari ECHO) dan **10 kΩ** di bawah (ke GND):

```text
V_tengah = 5 V × 10 ÷ (4,7 + 10) = 5 × 10 ÷ 14,7 ≈ 3,40 V
```

Tegangan 3,40 V di bawah batas 3,6 V, tetapi masih cukup tinggi untuk dibaca HIGH (ESP32 menganggap HIGH mulai sekitar 0,75 × 3,3 V ≈ 2,5 V). Kalau kedua resistornya **tertukar**, hasilnya 5 × 4,7 ÷ 14,7 ≈ 1,60 V: aman, tetapi di bawah ambang HIGH yang dijamin (±2,5 V) sehingga pulsanya bisa tidak terbaca sama sekali (`Tidak ada gema`) atau terbaca tidak menentu (jarak melompat-lompat). Kalau resistor **10 kΩ lupa dipasang**, pin menerima 5 V melalui resistor 4,7 kΩ — inilah yang harus dicegah. Karena itu, di Praktik 6 pembagi tegangan diukur dulu dengan multimeter sebelum dipercaya.

![Dua pembagi tegangan dengan rumus yang sama. Kiri, pembagi LDR: 3,3 volt ke resistor 10 kiloohm di atas, titik tengah ke VP atau GPIO 36, lalu LDR di bawah ke GND; saat terang LDR sekitar 1 kiloohm sehingga titik tengah sekitar 0,30 volt, saat gelap sekitar 200 kiloohm sehingga sekitar 3,14 volt. Kanan, pembagi ECHO: pulsa 5 volt dari kaki ECHO HC-SR04 ke resistor 4,7 kiloohm di atas, titik tengah ke D35, lalu resistor 10 kiloohm di bawah ke GND; hasilnya sekitar 3,40 volt, di bawah batas 3,6 volt dan di atas ambang HIGH sekitar 2,5 volt. Di atas kedua gambar tertulis rumus V tengah sama dengan V masuk kali R bawah dibagi R atas tambah R bawah. Catatan kanan bawah: kalau resistornya tertukar, hasilnya sekitar 1,60 volt, aman, tetapi di bawah ambang HIGH](aset/pembagi-tegangan.png)

> ➡️ **Siap praktik?** Lanjut ke [Praktik 1 — LDR dan pembagi tegangan](#praktik-1--ldr-dan-pembagi-tegangan-30-menit). Setelah selesai, kembali ke [Konsep 4](#4-derau-rata-rata-bergerak-dan-kapasitor-100-nf).

### 4. Derau, rata-rata bergerak, dan kapasitor 100 nF

Di Praktik 1 kamu akan melihat sendiri: walaupun LDR tidak disentuh dan lampu tidak diubah, angka `mentah` di papan asli tidak pernah diam. Ia bergoyang naik-turun belasan sampai puluhan angka. Goyangan acak itu disebut **derau** (*noise*). Sumbernya macam-macam: radio WiFi di dalam ESP32 sendiri, riak kecil pada catu daya, kabel jumper panjang yang ikut "menangkap" gangguan seperti antena, dan — khusus LDR — lampu listrik di rumahmu yang sebenarnya berkedip 100 kali per detik, terlalu cepat untuk mata, tetapi tidak untuk sensor.

Derau terlihat sepele, tetapi bisa merepotkan. Bayangkan lampu otomatis dengan ambang gelap `1000`: kalau bacaan cahaya bergoyang di antara `990` dan `1010`, lampunya bisa menyala-padam berulang kali. Ada tiga obat, dan ketiganya dipakai minggu ini:

**1. Rata-rata sesaat** (*oversampling*). Baca sensor 20 kali berturut-turut dengan cepat, lalu ambil rata-ratanya. Goyangan ke atas dan ke bawah saling meniadakan. Cara ini dipakai di Praktik 3 dan di Node 1:

```cpp
// Rata-rata 20 bacaan analog berturut-turut supaya derau teredam.
int bacaAnalogRata(int pin) {
  long jumlah = 0;
  for (int i = 0; i < 20; i++) {
    jumlah += analogRead(pin);
    delay(2);
  }
  return jumlah / 20;
}
```

**2. Rata-rata bergerak** (*moving average*). Simpan **10 bacaan terakhir** di sebuah *array* — deretan laci bernomor dari Modul 3. Setiap ada bacaan baru, laci yang isinya **paling lama** ditimpa, lalu rata-rata kesepuluh laci dihitung ulang. Hasilnya garis yang halus, tetapi tetap mengikuti perubahan sungguhan, hanya sedikit terlambat. Nomor laci berputar 0, 1, 2, …, 9, lalu kembali ke 0 berkat operator `%` (sisa bagi, Modul 3):

```cpp
jumlah -= riwayat[posisi];              // keluarkan bacaan paling lama dari jumlah,
riwayat[posisi] = mentah;               // timpa lacinya dengan bacaan baru,
jumlah += mentah;                       // lalu masukkan bacaan baru ke jumlah
posisi = (posisi + 1) % JUMLAH_SAMPEL;  // laci berikutnya; sesudah laci 9 kembali ke 0
int rata = jumlah / JUMLAH_SAMPEL;
```

Makin banyak laci, makin halus garisnya, tetapi makin lambat ia mengikuti perubahan. Sepuluh laci dengan 20 bacaan per detik berarti rata-rata selama setengah detik terakhir — cukup untuk sensor rumah.

**3. Kapasitor 100 nF** — obat perangkat keras. Kapasitor keramik kecil bertuliskan "104" dipasang di antara titik tengah pembagi tegangan (yang masuk ke pin ADC) dan GND. Di Modul 5, kapasitor 100 µF menjadi "tandon kecil" penahan lonjakan arus servo; di sini kapasitor yang jauh lebih kecil menjadi **peredam kejut** untuk tegangan: lonjakan-lonjakan cepat diserapnya sebelum sampai ke ADC. Espressif sendiri, pembuat chip ESP32, menganjurkan kapasitor 100 nF di pin ADC ditambah pembacaan berulang (*multisampling*, sama dengan rata-rata sesaat di atas) untuk meredam derau. Tulisan "104" berarti angka 10 diikuti empat angka nol, dalam pikofarad: 100.000 pF = 100 nF. Kapasitor keramik tidak berkutub, jadi kakinya boleh terbalik.

![Grafik derau dan rata-rata bergerak. Sumbu datar waktu sekitar 6 detik, sumbu tegak angka analogRead sekitar 1950 sampai 2150. Garis tipis bergerigi berlabel mentah bergoyang kira-kira plus-minus 30 di sekitar 2000; di tengah grafik nilainya melompat naik ke sekitar 2100 karena tangan menutupi LDR. Garis tebal halus berlabel rata-rata 10 bacaan mengikuti di tengah goyangan dan naik lebih landai sekitar setengah detik setelah lompatan. Di bawah grafik, sepuluh laci bernomor 0 sampai 9 dengan panah posisi yang berputar kembali ke 0 setelah laci 9, berlabel laci paling lama ditimpa bacaan baru. Di kanan, kapasitor keramik bertuliskan 104 di antara titik tengah pembagi dan GND, berlabel peredam kejut 100 nF](aset/derau-rata-rata.png)

Untuk melihat derau dengan jelas, angka saja kurang membantu. Arduino IDE punya **Serial Plotter** yang menggambar angka-angka dari Serial menjadi garis grafik — kita memakainya di Praktik 2.

> ➡️ **Siap praktik?** Lanjut ke [Praktik 2 — Derau, rata-rata bergerak, dan Serial Plotter](#praktik-2--derau-rata-rata-bergerak-dan-serial-plotter-25-menit). Setelah selesai, kembali ke [Konsep 5](#5-dari-angka-mentah-ke-satuan-map-constrain-dan-kalibrasi-dua-titik).

### 5. Dari angka mentah ke satuan: `map()`, `constrain()`, dan kalibrasi dua titik

Angka seperti `2915` atau `1301` tidak berarti apa-apa bagi manusia. Yang ingin kita tahu adalah "kelembapan tanah 37 %" atau "isi tandon 64 %". Mengubah angka mentah menjadi satuan nyata disebut **kalibrasi**, dan cara paling sederhana adalah **kalibrasi dua titik**:

1. Ukur angka mentah di **dua keadaan yang jawabannya kita tahu**. Untuk sensor tanah: di udara (paling kering, kita sebut 0 %) dan di dalam air (paling basah, 100 %).
2. Tarik **garis lurus** di antara kedua titik itu. Semua keadaan di antaranya bisa diterjemahkan dengan garis itu.

Fungsi **`map()`** dari Modul 5 melakukan persis langkah kedua. Misalnya, sensor tanahmu terbaca `3000` di udara dan `1300` di air:

```cpp
int persen = map(mentah, 3000, 1300, 0, 100);  // 3000 -> 0, 1300 -> 100, 2150 -> 50
```

Urutan "terbalik" (dari `3000` turun ke `1300`) tidak masalah: `map()` tetap menarik garis dari titik pertama ke titik kedua. Di dalamnya, `map()` hanya menghitung rumus ini dengan **bilangan bulat** (pecahannya dibuang, ingat Kejutan 1 di Modul 3):

```text
hasil = (nilai − dariA) × (keB − keA) ÷ (dariB − dariA) + keA
```

Satu jebakan penting: **`map()` tidak memagari hasilnya.** Kalau suatu siang udara sangat kering dan sensor terbaca `3500` — lebih kering daripada saat kalibrasi — `map()` menjawab `-29`. Kalau sensor terbenam terlalu dalam dan terbaca `1000`, jawabannya `117`. Kelembapan −29 % atau 117 % jelas tidak masuk akal. Karena itu, hasil `map()` selalu dipagari dengan **`constrain()`** (juga dari Modul 5):

```cpp
int tanah = constrain(persen, 0, 100);  // -29 menjadi 0, 117 menjadi 100
```

![Kalibrasi dua titik sensor tanah. Sumbu datar angka mentah dari 0 sampai 4095, sumbu tegak berlabel kelembapan tanah dalam persen. Titik merah kering di 3000 mentah, 0 persen, berlabel di udara; titik biru basah di 1300 mentah, 100 persen, berlabel di air. Garis lurus menghubungkan keduanya; titik tengah 2150 menjadi 50 persen. Di luar kedua titik, garis putus-putus berlanjut sampai minus 29 persen di 3500 dan 117 persen di 1000, berlabel hasil map() saja; garis tebal mendatar di 0 dan 100 persen berlabel setelah constrain](aset/kalibrasi-dua-titik.png)

Dua catatan lagi:

- **Setiap sensor berbeda**, bahkan dua sensor dari kantong yang sama. Angka `3000` dan `1300` di atas hanya contoh; kamu akan mengukur milikmu sendiri di Praktik 3, lalu menuliskannya di kode sebagai konstanta.
- **`map()` hanya untuk bilangan bulat.** Untuk angka berkoma, misalnya jarak 12,4 cm, rumus yang sama kita tulis sendiri dengan `float` (Praktik 6).

### 6. Sensor kelembapan tanah kapasitif

Ada dua jenis sensor kelembapan tanah yang dijual murah. Jenis **resistif** punya dua kaki logam telanjang dan mengukur arus yang mengalir lewat tanah. Masalahnya, logam yang dialiri arus di tanah basah cepat berkarat — kadang dalam hitungan minggu. Kurikulum ini memakai jenis **kapasitif** (v1.2 atau v2.0), yang **tidak punya logam terbuka** sama sekali.

**Cara kerjanya.** Di dalam bagian papan yang panjang, ada dua bidang tembaga yang dilapisi cat papan. Keduanya membentuk **kapasitor**, dan tanah di sekelilingnya ikut menjadi "pengisi" di antara kedua bidang itu. Air jauh lebih pandai menyimpan muatan listrik daripada udara (sekitar 80 kali), jadi makin basah tanahnya, makin besar nilai kapasitornya. Sebuah chip pewaktu kecil (keluarga 555) di bagian atas papan mengubah besar kapasitor itu menjadi tegangan di kaki **AOUT**: **makin basah, makin rendah tegangannya**. Sama seperti LDR, angkanya terbalik — dan `map()` dari Konsep 5 membereskannya.

Di ESP32 dengan catu 3,3 V, sensor di udara biasanya terbaca sekitar `2800`–`3300`, dan di dalam air sekitar `1200`–`1600`. Angka pastinya berbeda di setiap sensor. Karena itu, setiap sensor wajib dikalibrasi.

| Kaki (tulisan di papan) | Disambung ke | Catatan |
| :--- | :--- | :--- |
| **GND** | rel bawah (−) | |
| **VCC** | rel bawah (+), 3,3 V | Sensor bekerja di 3,3–5,5 V; keluarannya paling tinggi sekitar 3 V. |
| **AOUT** | VN (GPIO 39) | Keluaran analog. |

**Melindungi bagian elektroniknya.** Hanya bagian yang panjang yang boleh masuk ke tanah atau air. Bagian atas — tempat chip, komponen kecil, dan colokan kabel — **tidak tahan air**. Pembuat sensor ini mewanti-wanti agar sensor tidak dibenamkan melewati garis batas yang tercetak di papan (sebagian sensor tidak punya garis; kalau begitu, buat garis sendiri 2 cm di bawah zona elektronik). Empat kebiasaan baik:

1. **Benamkan hanya sampai garis batas.** Saat menyiram tanaman, siram tanahnya, bukan bagian atas sensornya.
2. **Lapisi bagian atas** dengan selongsong bakar (*heat shrink*) yang dipanaskan sampai mengerut, atau olesi dengan **cat kuku bening**. Olesi juga **tepi papan** yang terpotong di sepanjang bagian yang masuk tanah: serat papan di tepinya menyerap air dan membuat bacaan bergeser pelan-pelan.
3. **Buat lengkungan tetes** (*drip loop*): biarkan kabel sensor turun sedikit lebih rendah daripada colokannya sebelum naik ke breadboard supaya air menetes dari titik terendah kabel, bukan merambat ke colokan.
4. **Jangan biarkan sensor terendam berjam-jam** saat kalibrasi; beberapa puluh detik sudah cukup.

![Ilustrasi sensor kelembapan tanah kapasitif v1.2 berdiri tegak. Bagian atas berlabel zona elektronik, jaga tetap kering, berisi chip pewaktu delapan kaki bertuliskan TLC555, regulator kecil, dan colokan tiga kaki bertuliskan GND, VCC, AOUT. Di bawahnya garis putih berlabel garis batas, jangan dibenamkan melewati garis ini. Bagian panjang di bawah berlabel zona sensor, boleh masuk tanah atau air, tanpa logam terbuka. Di samping, tiga cara melindungi (warnanya hanya penanda): selongsong bakar yang menutupi zona elektronik, cat kuku bening di tepi papan yang terpotong, dan kabel dengan lengkungan tetes. Catatan bawah: kalau chip-nya bertuliskan NE555, sensor bisa tidak bekerja di 3,3 volt](aset/sensor-tanah-kapasitif.png)

**Waspada sensor "cacat pabrik".** Sensor ini banyak ditiru, dan sebagian tiruannya bermasalah:

- **Chip pewaktunya NE555**, bukan TLC555. Lihat tulisan pada chip berkaki delapan di bagian atas sensor. NE555 butuh paling sedikit 4,5 V, padahal regulator di papan sensor hanya memberinya sekitar 3 V sehingga sensor bisa tidak bekerja sama sekali — angkanya nyaris tidak berubah antara udara dan air.
- **Resistor 1 MΩ di jalur keluarannya tidak tersambung** sehingga bacaannya sangat lambat berubah.

Kit A berisi **dua** sensor tanah (yang satu untuk Node 2 di Modul 14), jadi kalau yang pertama bermasalah, coba yang kedua.

Terakhir, ingat bahwa angka persen dari sensor ini **relatif**: jenis tanah, kepadatannya, dan suhunya ikut memengaruhi bacaan. Untuk keputusan "kering, perlu disiram" atau "masih basah", itu sudah lebih dari cukup.

Wokwi belum punya sensor tanah, jadi kedudukannya digantikan oleh **potensiometer**: memutar kenopnya sama dengan mengubah basah-keringnya tanah.

> ➡️ **Siap praktik?** Lanjut ke [Praktik 3 — Kalibrasi sensor tanah dengan segelas air](#praktik-3--kalibrasi-sensor-tanah-dengan-segelas-air-30-menit). Setelah selesai, kembali ke [Konsep 7](#7-membaca-lembar-data-lima-hal-yang-dicari).

### 7. Membaca lembar data: lima hal yang dicari

**Lembar data** (*datasheet*) adalah dokumen resmi dari pembuat komponen: ukurannya, batas tegangannya, dan cara memakainya. Biasanya berupa PDF berbahasa Inggris, panjangnya 5–30 halaman, penuh tabel dan grafik. Kabar baiknya, pemula cukup mencari **lima hal**. Di dalam kurung tertulis kata kunci bahasa Inggris yang biasanya muncul di lembar data supaya mudah dicari dengan **Ctrl + F**:

1. **Tegangan kerja** (*operating voltage*, *power supply*, VCC, VDD) — sensor ini boleh diberi berapa volt?
2. **Bentuk dan level keluaran** (*output signal*, *logic level*) — keluarannya analog, digital, atau pulsa? Setinggi berapa volt? Kalau lebih dari 3,3 V, perlu pembagi tegangan.
3. **Rentang dan akurasi** (*range*, *accuracy*, *resolution*) — bisa mengukur dari berapa sampai berapa, dan paling banyak meleset seberapa jauh?
4. **Waktu** (*sampling period*, *trigger pulse*, *response time*, *initialization*) — perlu jeda berapa lama antarbacaan? Perlu pemanasan?
5. **Kaki** (*pin definition*, *pinout*) — kaki mana untuk apa? Tetap cocokkan dengan tulisan di modulmu sendiri: urutan kaki **modul** bisa berbeda antarpabrik walaupun sensornya sama.

Hasilnya bisa kamu tulis sebagai "kartu ringkas". Ini kartu ringkas kelima sensor minggu ini, diambil dari lembar data masing-masing (tautannya ada di 📚):

| Sensor | Tegangan kerja | Keluaran | Rentang dan akurasi | Waktu yang penting |
| :--- | :--- | :--- | :--- | :--- |
| DHT22 (AM2302) | 3,3–5,5 V (disarankan 5 V) | digital, satu kabel | −40 sampai 80 °C, ±0,5 °C; 0–100 %RH (kelembapan relatif), ±2 %RH | jeda minimal 2 detik antarbacaan |
| HC-SR04 | 5 V | pulsa ECHO setinggi tegangan catunya (5 V!) | 2 cm sampai 4 m | pulsa TRIG 10 µs; jeda minimal 60 ms antarukuran |
| PIR HC-SR501 | 4,5–20 V | HIGH 3,3 V, LOW 0 V | jarak sekitar 3–7 m, sudut pandang sampai 110° | pemanasan sekitar 1 menit; HIGH bertahan sekitar 5 detik sampai 5 menit |
| Sensor tanah kapasitif v1.2 | 3,3–5,5 V | analog 0–3 V | relatif, wajib dikalibrasi | — |
| LDR GL5528 | — (komponen pasif) | berupa hambatan | 10–20 kΩ pada 10 lux; 1 MΩ atau lebih dalam gelap total | butuh 20–30 ms untuk berubah |

![Kartu ringkas lembar data DHT22. Kiri, tiruan halaman lembar data berbahasa Inggris dengan lima bagian disorot warna: Power supply 3.3 sampai 5.5 V DC (recommended 5 V), Output signal digital signal via single-bus, Measuring range, Accuracy, dan Resolution, Sensing period average 2 s, serta gambar empat kaki bernomor 1 VDD, 2 DATA, 3 NULL, 4 GND. Kanan, kartu ringkas berbahasa Indonesia dengan lima baris bernomor yang sesuai: tegangan kerja 3,3 sampai 5,5 volt, disarankan 5 volt, di kurikulum ini 3,3 volt; keluaran digital satu kabel; rentang minus 40 sampai 80 derajat Celsius plus-minus 0,5 derajat dan 0 sampai 100 persen plus-minus 2 persen; waktu jeda minimal 2 detik; kaki modul 3 kaki, baca tulisan di modulmu. Catatan: gambar ini ringkasan ulang, bukan salinan lembar data](aset/lembar-data-dht22.png)

Perhatikan satu baris DHT22 yang menarik: pembuatnya **menyarankan 5 V**, tetapi kita memberinya **3,3 V**. Keduanya ada di dalam rentang tegangan kerjanya, dan kita punya alasan kuat memilih 3,3 V (Konsep 8). Inilah gunanya membaca lembar data: kamu tahu batas yang aman, lalu memilih sendiri yang paling cocok untuk rangkaianmu.

Satu lagi yang sering keliru: **resolusi bukan akurasi**. DHT22 menampilkan suhu dengan langkah 0,1 °C (resolusi), tetapi bacaannya bisa meleset sampai ±0,5 °C dari suhu sebenarnya (akurasi). Bagian 🔬 membahasnya lebih jauh.

### 8. DHT22: protokol satu kabel dan library

**DHT22** (juga dijual dengan nama AM2302; warnanya **putih**) mengukur suhu dan kelembapan udara. Di dalam kotaknya ada sensor kelembapan, sensor suhu, dan sebuah chip kecil yang mengukur keduanya lalu mengirim hasilnya sebagai **data digital** lewat **satu kabel saja**. Kabel yang sama dipakai bergantian dua arah, seperti percakapan lewat *walkie-talkie*:

1. **ESP32 mengetuk**: kabel DATA ditarik ke LOW paling sedikit 1 ms ("halo, tolong ukur"), lalu dilepas.
2. **DHT22 menjawab**: LOW selama 80 µs, lalu HIGH selama 80 µs ("siap, ini datanya").
3. **DHT22 mengirim 40 bit.** Setiap bit diawali LOW selama 50 µs, lalu HIGH. HIGH yang **pendek** (±26 µs) berarti **0**, HIGH yang **panjang** (±70 µs) berarti **1**.
4. Keempat puluh bit itu adalah **16 bit kelembapan + 16 bit suhu + 8 bit *checksum***. *Checksum* adalah angka pemeriksa: jumlah bagian-bagian sebelumnya. Kalau jumlahnya tidak cocok, berarti ada bit yang rusak di jalan, dan bacaan itu dibuang.

Seluruh percakapan selesai dalam ±5 ms. Inilah sebabnya DHT22 butuh pin yang bisa menjadi **keluaran** (untuk mengetuk) sekaligus **masukan** (untuk mendengar jawaban) — dan D14 bisa keduanya.

![Diagram waktu percakapan DHT22 lewat satu kabel. Garis sinyal DATA dari kiri ke kanan: bagian ESP32 mengetuk berupa LOW paling sedikit 1 milidetik, lalu dilepas HIGH 20 sampai 40 mikrodetik; bagian DHT22 menjawab berupa LOW 80 mikrodetik lalu HIGH 80 mikrodetik; lalu deretan bit, masing-masing diawali LOW 50 mikrodetik, dengan HIGH pendek sekitar 26 mikrodetik berlabel bit 0 dan HIGH panjang sekitar 70 mikrodetik berlabel bit 1. Di bawahnya, 40 bit dibagi menjadi tiga kotak: 16 bit kelembapan, 16 bit suhu, dan 8 bit checksum. Catatan: seluruhnya sekitar 5 milidetik, tidak sesuai skala](aset/dht22-satu-kabel.png)

Menghitung waktu dalam mikrodetik seperti itu melelahkan, jadi kita memakai **library**: **DHT sensor library** buatan Adafruit, yang memerlukan pendamping bernama **Adafruit Unified Sensor**. Memakainya cukup beberapa baris:

```cpp
#include <DHT.h>

DHT dht(14, DHT22);  // kaki DATA di GPIO 14, jenis sensornya DHT22

// di setup():
dht.begin();

// di loop(), paling cepat sekali tiap 2 detik:
float suhu = dht.readTemperature();     // derajat Celsius
float kelembapan = dht.readHumidity();  // persen
```

Tiga aturan main DHT22:

- **Jeda minimal 2 detik.** Kalau ditanya lebih cepat, library tidak mengukur ulang, tetapi mengembalikan bacaan sebelumnya.
- **Kalau gagal, jawabannya `NAN`** (*Not a Number*, "bukan angka"): kabel DATA lepas, sensor belum diberi listrik, atau *checksum* tidak cocok. `NAN` tidak bisa dibandingkan seperti angka biasa, jadi kita memeriksanya dengan fungsi **`isnan()`**: `if (isnan(suhu)) { … }`.
- **Modul tiga kaki sudah punya resistor *pull-up*** (biasanya 10 kΩ) dari DATA ke VCC supaya kabel DATA bernilai HIGH saat tidak ada yang berbicara. Akibatnya, tegangan di kabel DATA **sama dengan VCC modul**. Kalau modul diberi 5 V, pin D14 ikut menerima 5 V — karena itulah modul DHT22 kita **selalu diberi 3,3 V**.

Urutan dan tulisan kaki pada modul tiga kaki berbeda-beda antarpabrik — ada yang bertuliskan "+ out −", ada yang "VCC DATA GND", ada pula "S" untuk sinyal. Selalu baca tulisan di modulmu sendiri. Satu hal lagi: kalau sensormu berwarna **biru**, itu **DHT11**, saudaranya yang lebih murah dan kurang akurat. Kurikulum ini memakai DHT22, tetapi library yang sama bisa membaca DHT11 kalau `DHT22` di kode diganti dengan `DHT11`.

> ➡️ **Siap praktik?** Lanjut ke [Praktik 4 — DHT22: suhu dan kelembapan dengan library](#praktik-4--dht22-suhu-dan-kelembapan-dengan-library-25-menit). Setelah selesai, kembali ke [Konsep 9](#9-pir-sensor-gerak-yang-cukup-berkata-ya-atau-tidak).

### 9. PIR: sensor gerak yang cukup berkata "ya" atau "tidak"

Setiap benda hangat — termasuk tubuhmu — memancarkan **sinar inframerah**, "cahaya panas" yang tidak terlihat mata. **PIR** (*Passive Infrared*, inframerah pasif) tidak memancarkan apa pun; ia hanya **menerima**. Di balik kubah putihnya ada sensor yang terbelah dua. Saat benda hangat **bergerak** melintasi pandangannya, kedua belahan itu menerima panas yang berbeda, dan rangkaian di papan mengubah perbedaan itu menjadi sinyal **HIGH** di kaki **OUT**. Kubah putih itu adalah **lensa Fresnel**: lensa bergerigi yang membagi pandangan sensor menjadi banyak "petak" sehingga gerakan dari petak ke petak mudah terdeteksi. Karena yang dideteksi hanya gerakan, orang yang berdiri diam lama-lama tidak terdeteksi lagi.

Modul **HC-SR501** yang kita pakai:

- Diberi **5 V dari rel atas** (MB102). Rentang tegangan kerjanya 4,5–20 V, jadi 3,3 V tidak cukup.
- Keluarannya **HIGH 3,3 V** (papan PIR punya regulator 3,3 V sendiri) dan **LOW 0 V** sehingga kaki OUT **aman disambung langsung** ke D34, tanpa pembagi tegangan.
- Butuh **pemanasan** sekitar **1 menit** setelah diberi listrik. Selama itu, OUT bisa HIGH sendiri beberapa kali. Menjauhlah dari depan sensor saat menunggu.

Di bagian belakang papan ada tiga pengatur:

| Pengatur | Fungsinya | Saran untuk modul ini |
| :--- | :--- | :--- |
| Kenop **Sx** (sensitivitas) | Jangkauan deteksi, kira-kira 3–7 m. | Putar penuh **berlawanan arah jarum jam** dulu: jangkauan ±3 m sudah cukup untuk uji di meja. |
| Kenop **Tx** (waktu) | Lama OUT bertahan HIGH setelah gerakan, kira-kira 5 detik sampai 5 menit. | Putar penuh **berlawanan arah jarum jam** (dilihat dari belakang papan); di kebanyakan modul, itulah waktu paling singkat (±5 detik) sehingga mudah diuji. Nanti, untuk lampu sungguhan, perpanjang, misalnya menjadi 1 menit. |
| Jumper atau bantalan solder **H / L** | **H**: bisa dipicu ulang — OUT tetap HIGH selama masih ada gerakan. **L**: sekali picu — OUT kembali LOW setelah waktu Tx habis walaupun gerakan berlanjut. | **H** (biasanya sudah bawaan; bantalan solder umumnya sudah tersambung ke H dari pabrik). |

Setelah OUT kembali LOW, PIR "buta" sekitar 2,5 detik dan tidak bisa mendeteksi apa pun. Ini normal.

![Foto modul PIR HC-SR501 dari belakang dengan tiga penanda. Penanda 1 pada dua kenop oranye: Sx mengatur jarak sekitar 3 sampai 7 meter, Tx mengatur lama HIGH sekitar 5 detik sampai 5 menit, dan urutan kenop berbeda antarpabrik. Penanda 2, cincin di pojok kanan atas, mengelilingi pilihan L dan H: H berarti bisa dipicu ulang, biasanya bawaan; bentuknya jumper kuning atau bantalan solder bertuliskan L dan H seperti di foto. Penanda 3 pada tiga kaki di tepi bawah, VCC, OUT, dan GND; tulisannya ada di sisi depan dan sering tertutup kubah. Kanan, grafik kaki OUT ke D34: LOW, naik HIGH 3,3 volt saat ada gerakan, bertahan selama waktu Tx, turun ke LOW, lalu buta sekitar 2,5 detik. Pita bawah: setelah diberi listrik, pemanasan sekitar 1 menit, dan OUT bisa HIGH sendiri](aset/pir-anatomi.jpg)

*Foto: [Sjilla](https://commons.wikimedia.org/wiki/File:PIR_motion_sensor_for_Arduino_oblique_view.jpg), Wikimedia Commons, CC BY-SA 4.0; penanda dan grafik oleh penulis. Foto dipotong dan diperkecil. Gambar gabungan ini berlisensi [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).*

Tulisan VCC, OUT, dan GND biasanya tersembunyi di bawah kubah. **Lepaskan kubahnya pelan-pelan** (cukup ditarik lurus ke atas; kubahnya hanya dijepit) untuk membacanya, lalu pasang lagi. Urutan kakinya tidak selalu sama antarpabrik. Begitu juga tulisan Sx dan Tx: tidak selalu tercetak, dan urutan kedua kenop berbeda-beda. Tidak apa-apa — di Praktik 5 kamu akan mengenali kenop Tx dengan cara menguji.

Membaca PIR sama mudahnya dengan membaca tombol: `digitalRead(34) == HIGH` berarti ada gerakan. Di Wokwi, modul PIR punya tombol **Simulate motion** yang membuat OUT HIGH selama 5 detik, tanpa perlu pemanasan.

> ➡️ **Siap praktik?** Lanjut ke [Praktik 5 — PIR: sensor gerak dan pemanasan 1 menit](#praktik-5--pir-sensor-gerak-dan-pemanasan-1-menit-20-menit). Setelah selesai, kembali ke [Konsep 10](#10-hc-sr04-mengukur-jarak-dengan-gema).

### 10. HC-SR04: mengukur jarak dengan gema

Pernah berteriak di dalam gua lalu mendengar gemanya? Makin jauh dinding gua, makin lama gemanya kembali. **HC-SR04** bekerja persis seperti itu, dan kelelawar sudah memakai cara ini jutaan tahun lebih dulu. Kedua "mata" sensor ini sebenarnya pengeras suara (T, *transmitter*) dan mikrofon (R, *receiver*) untuk **ultrasonik**: bunyi 40.000 getaran per detik (40 kHz), jauh di atas batas pendengaran manusia.

1. ESP32 memberi pulsa **HIGH selama 10 µs** ke kaki **TRIG** — perintah "berteriak".
2. Sensor memancarkan delapan getaran ultrasonik, lalu menaikkan kaki **ECHO** menjadi HIGH sambil menunggu.
3. Begitu gemanya kembali, ECHO turun lagi menjadi LOW. **Lama ECHO HIGH = waktu bunyi pergi ke benda dan pulang lagi.**

Kecepatan bunyi di udara sekitar 343 m/s (pada 20 °C), atau 0,0343 cm per mikrodetik. Karena bunyinya pergi dan pulang, jaraknya adalah separuh perjalanan:

```text
jarak (cm) = lama ECHO (µs) × 0,0343 ÷ 2 = lama ECHO (µs) ÷ 58 (kira-kira)
```

Angka 58 itu juga yang tercantum di lembar data HC-SR04. Contohnya, ECHO HIGH selama 580 µs berarti 10 cm.

ESP32 mengukur lama pulsa dengan **`pulseIn()`**:

```cpp
unsigned long durasi = pulseIn(PIN_ECHO, HIGH, 30000);  // mikrodetik; menyerah setelah 30 ms
if (durasi == 0) {
  // tidak ada gema: terlalu jauh, terhalang, atau kabel lepas
}
float jarak = durasi / 58.0;
```

`pulseIn()` menunggu ECHO menjadi HIGH, menghitung berapa mikrodetik ia bertahan HIGH, lalu menjawab dengan angka itu. Kalau dalam 30.000 µs (30 ms, setara jarak sekitar 5 m) tidak ada pulsa, ia menyerah dan menjawab `0`.

**Batas-batasnya.** HC-SR04 mengukur 2 cm sampai 4 m. Pancaran bunyinya sempit (sekitar 15°) dan paling baik memantul dari permukaan rata yang menghadap lurus ke sensor — dan permukaan air termasuk pemantul yang bagus. Permukaan miring atau lembut (kain, busa) bisa membelokkan atau menyerap bunyi. Beri jeda minimal 60 ms antarukuran supaya gema yang lama tidak tertukar dengan gema yang baru.

**Mengukur isi tandon.** Sensor dipasang **di atas tandon, menghadap ke bawah**. Makin penuh airnya, makin dekat permukaan air, makin pendek jaraknya. Ini kalibrasi dua titik lagi (Konsep 5):

- **`JARAK_KOSONG`** — jarak sensor ke dasar wadah (tandon kosong, 0 %).
- **`JARAK_PENUH`** — jarak sensor ke permukaan air saat tandon penuh (100 %). Sisakan minimal 3 cm antara sensor dan air karena HC-SR04 tidak bisa mengukur jarak yang terlalu dekat.

```text
level air (%) = (JARAK_KOSONG − jarak) ÷ (JARAK_KOSONG − JARAK_PENUH) × 100
```

Misalnya, `JARAK_KOSONG` 20 cm dan `JARAK_PENUH` 5 cm. Kalau sensor mengukur 12,4 cm, isi tandon = (20 − 12,4) ÷ 15 × 100 ≈ 50 %.

![Cara kerja HC-SR04 dan pengukuran tandon. Kiri atas, diagram waktu: TRIG mendapat pulsa HIGH 10 mikrodetik, sensor memancarkan delapan getaran 40 kilohertz, lalu ECHO HIGH selama waktu pergi-pulang bunyi, misalnya 580 mikrodetik untuk 10 sentimeter; rumus jarak sama dengan lama ECHO dibagi 58. Kanan, HC-SR04 di atas wadah tandon berisi air dan pompa, menghadap ke bawah, ditempel di bawah jembatan karton yang melintang di mulut wadah; panah JARAK_KOSONG dari sensor ke dasar wadah, 20 sentimeter; panah JARAK_PENUH dari sensor ke permukaan air saat penuh, 5 sentimeter; panah jarak saat ini ke permukaan air, 12,4 sentimeter; hasilnya level air sekitar 50 persen. Catatan: sisakan minimal 3 sentimeter antara sensor dan air, dan kaki ECHO 5 volt wajib lewat pembagi tegangan](aset/hc-sr04-gema.png)

**Soal tegangan.** HC-SR04 biasa butuh 5 V, dan pulsa ECHO-nya ikut 5 V — karena itu, ECHO **wajib** lewat pembagi tegangan 4,7 kΩ + 10 kΩ (Konsep 3). Ada versi yang bisa bekerja di 3,3 V, misalnya HC-SR04+ (atau HC-SR04P) dan RCWL-1601; kalau diberi 3,3 V, ECHO-nya juga 3,3 V. Supaya rangkaian semua pembelajar sama, **di kurikulum ini semua versi diberi 5 V dari rel atas dan ECHO-nya selalu lewat pembagi tegangan**. Cara itu aman dan berhasil untuk semua versi.

Kecepatan bunyi juga bergantung pada suhu udara (naik sekitar 0,6 m/s setiap 1 °C). Di ruangan biasa, pengaruhnya hanya beberapa milimeter untuk tandon kita. Bagian 🔬 menunjukkan cara memakai suhu DHT22 untuk mengoreksinya.

> ➡️ **Siap praktik?** Lanjut ke [Praktik 6 — HC-SR04 dan pembagi tegangan: level air tandon](#praktik-6--hc-sr04-dan-pembagi-tegangan-level-air-tandon-40-menit). Setelah selesai, kembali ke [Konsep 11](#11-kontrak-data-dan-saat-sensor-berbohong).

### 11. Kontrak data dan saat sensor "berbohong"

Mulai Modul 10 (lewat HTTP; Modul 11 memindahkannya ke MQTT), Node 1 akan mengirim bacaannya ke server sebagai pesan JSON. Server, database, dan dashboard yang dibangun di modul-modul berikutnya sudah sepakat soal nama dan satuan setiap kolom — kesepakatan itu disebut **kontrak data**, dan tertulis di [Lampiran A Silabus](../../SILABUS.md#14-lampiran-a--kontrak-data-rumah-pintar-mini):

```jsonc
{ "ts": "2026-10-09T09:41:30Z", "fw": "1.0.0",
  "suhu": 28.5, "kelembapan": 71, "cahaya": 412, "tanah": 37, "gerak": false, "level_air": 64 }
```

Karena itu, `struct BacaanSensor` yang kamu kenal sejak Modul 3 kini diisi **persis** dengan nama-nama kolom itu — termasuk `level_air` yang memakai garis bawah. Biasanya kita menulis nama variabel dengan gaya `levelAir`; khusus kolom kontrak data, kita ikuti kontraknya huruf demi huruf.

```cpp
// Formulir data sensor. Nama kolomnya PERSIS sesuai kontrak data (Lampiran A Silabus).
struct BacaanSensor {
  float suhu;      // derajat Celsius; NAN kalau DHT22 gagal dibaca
  int kelembapan;  // persen; -1 kalau DHT22 gagal dibaca
  int cahaya;      // 0 (gelap gulita) sampai 4095 (sangat terang)
  int tanah;       // persen: 0 = kering seperti di udara, 100 = basah seperti di air
  bool gerak;      // true kalau PIR melihat gerakan
  int level_air;   // persen isi tandon; -1 kalau gema HC-SR04 tidak kembali
};
```

| Kolom | Tipe | Satuan dan artinya | Kalau gagal dibaca |
| :--- | :--- | :--- | :--- |
| `suhu` | `float` | derajat Celsius, satu angka di belakang koma | `NAN` |
| `kelembapan` | `int` | persen kelembapan udara (%RH) | `-1` |
| `cahaya` | `int` | `0` (gelap gulita) sampai `4095` (sangat terang) | — |
| `tanah` | `int` | persen: `0` = sekering udara, `100` = sebasah air | — |
| `gerak` | `bool` | `true` = ada gerakan | — |
| `level_air` | `int` | persen isi tandon: `0` = kosong, `100` = penuh | `-1` |

**Kapan sensor "berbohong"?** Sensor yang bermasalah jarang diam saja; ia tetap menjawab — dengan angka yang salah. Beberapa yang akan kamu temui:

- **Kabel DATA DHT22 lepas** → library menjawab `NAN`.
- **HC-SR04 tidak mendengar gema** (terlalu jauh, terhalang, kabel ECHO lepas, atau MB102 belum dinyalakan) → `pulseIn()` menjawab `0`.
- **Kabel sensor analog lepas** → pin ADC mengambang dan angkanya melompat-lompat tanpa sebab.
- **Di luar rentang kalibrasi** → `map()` menghasilkan −29 % kalau tidak dipagari `constrain()`.
- **Derau** → angkanya bergoyang di sekitar nilai sebenarnya.
- **Belum dikalibrasi** → persentasenya meleset jauh.
- **PIR yang baru dinyalakan** → gerakan palsu selama menit pertama.
- **Di ujung rentang sensor** → angkanya mentok atau hampir tidak berubah: LDR di bawah terik matahari, ADC di atas ±3,1 V, benda yang lebih dekat daripada 2 cm untuk HC-SR04.

Aturan kita sederhana: **jangan pernah menganggap bacaan yang gagal sebagai bacaan yang sah.** Tandai dengan nilai khusus — `NAN` untuk `suhu`, `-1` untuk `kelembapan` dan `level_air` — dan cetak `--` di Serial Monitor. (Cara menuliskan nilai gagal itu di dalam JSON dibahas di Modul 11.) Lalu, buat aturan otomatis agar memilih **tindakan yang aman** saat bacaannya tidak diketahui. Contohnya pompa: aturan "tolak kalau isi tandon di bawah 20 %" otomatis juga menolak saat isi tandon tidak terbaca karena `-1` lebih kecil daripada `20`. Satu `if` menangkal dua bahaya sekaligus. Inilah aturan pengaman lokal pertama Node 1; di Modul 19, aturan semacam ini bisa diatur dari server.

![Kontrak data dalam tiga bagian. Kiri, formulir struct BacaanSensor dengan enam kolom: suhu 28,5 derajat Celsius, kelembapan 71 persen, cahaya 412 dari 0 sampai 4095, tanah 37 persen, gerak false, dan level_air 64 persen. Tengah, panah berlabel Modul 10–11 menuju pesan JSON telemetry dengan nama kolom yang sama persis. Kanan atas, kotak bacaan gagal: suhu NAN, kelembapan minus 1, dan level_air minus 1, yang di Serial Monitor tampil sebagai suhu=-- C dan level_air=-- %. Kanan bawah, aturan pompa: kalau level_air kurang dari 20, pompa DITOLAK; minus 1 yang berarti tidak terbaca juga kurang dari 20 sehingga ikut ditolak](aset/kontrak-data-bacaan.png)

> ➡️ **Siap praktik?** Lanjut ke [Praktik 7 — Monitor lima sensor, rapi setiap 2 detik](#praktik-7--monitor-lima-sensor-rapi-setiap-2-detik-20-menit), lalu Praktik 8 dan 9. Setelah itu, lanjutkan ke [🧩 Tantangan mandiri](#-tantangan-mandiri).

---
## 🔧 Praktik langkah demi langkah

Sembilan praktik, **berurutan**: setiap sensor dipasang di meja kerja yang sama dari Modul 5 dan dibiarkan terpasang sehingga di akhir modul kelimanya menjadi bagian Node 1. Praktik bertanda ⭐ di daftar isi adalah bagian dari syarat lulus:

1. **Praktik 3** — sensor tanah terbaca ±0 % di udara dan ±100 % di air.
2. **Praktik 6 dan 8** — level air tandon terukur, lalu pompa menolak menyala saat tandon kosong.
3. Syarat ketiga, **semua sensor analog di pin ADC1**, otomatis terpenuhi kalau kamu mengikuti tabel kabel: LDR di VP dan sensor tanah di VN (Konsep 2).

Setiap praktik bisa dicoba dulu di Wokwi dengan `diagram.json` dari folder [`kode/`](kode/), persis seperti Kemenangan Cepat, lalu dirakit di papan asli. Langkah yang hanya bisa dilakukan di papan asli (multimeter, gelas air, kapasitor) diberi tanda.

> [!TIP]
> **Cara menyimpan sketsa minggu ini.** Untuk setiap sketsa, pilih **File → New Sketch** di Arduino IDE, hapus isi bawaannya (**Ctrl + A**, lalu **Delete**), tempel kodenya (**Ctrl + V**), lalu pilih **File → Save** dan beri nama sesuai yang disebut di praktiknya, misalnya `modul06_ldr_pembagi`. Saat menyimpan sketsa pertama (Praktik 1), buat dulu folder `modul-06` di **Documents → GitHub → belajar-iot** dengan tombol **New folder** di jendela Save, lalu simpan semua sketsa minggu ini di sana (caranya sama dengan Modul 5 Praktik 9). *Commit* setiap kali satu praktik selesai.
>
> **Sebelum mengeklik Upload**, pastikan kotak papan di bilah atas Arduino IDE bertuliskan **DOIT ESP32 DEVKIT V1** dan port-nya benar. Macet di `Connecting…`? Tahan **BOOT** begitu `Connecting…` muncul, lepaskan saat `Writing at …` mulai berjalan. Serial Monitor selalu di **115200 baud**.

> [!IMPORTANT]
> **Kebiasaan merakit minggu ini** (sama dengan Modul 5): **sebelum memasang atau memindah kabel, matikan MB102, lalu cabut USB.** Setelah selesai merakit, colokkan USB dulu, baru nyalakan MB102. Praktik 1–4 hanya memakai 3,3 V dari ESP32, jadi MB102 boleh tetap mati sampai Praktik 5.
>
> **Cara membaca nama lubang** juga sama: angka = kolom, huruf = baris, dan keterangan (atas) atau (bawah) menunjukkan breadboard-nya. Contoh: **34g (bawah)** berarti kolom 34, baris g, breadboard bawah. Lubang yang sudah dipakai komponen Modul 5 tidak pernah dipakai lagi, kecuali lubang potensiometer yang dicabut di Praktik 3; gambar meja kerja di setiap praktik menampilkan komponen lama dengan warna pudar.

Di akhir modul, folder latihanmu berisi:

```text
belajar-iot/
└── modul-06/
    ├── modul06_ldr_pembagi/            ← Praktik 1
    ├── modul06_derau_plotter/          ← Praktik 2
    ├── modul06_kalibrasi_tanah/        ← Praktik 3 ⭐
    ├── modul06_dht22/                  ← Praktik 4
    ├── modul06_pir_gerak/              ← Praktik 5
    ├── modul06_jarak_tandon/           ← Praktik 6 ⭐
    ├── modul06_monitor_lima_sensor/    ← Praktik 7
    ├── modul06_siram_lampu_otomatis/   ← Praktik 8 ⭐
    ├── catatan-kalibrasi.md            ← Praktik 9 (angka dari Praktik 1, 3, dan 6)
    └── meja-kerja-sensor.jpg           ← Praktik 9 (foto rakitanmu)
```

### Praktik 1 — LDR dan pembagi tegangan (30 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** (atau Wokwi), LDR, resistor **10 kΩ** (4 gelang: cokelat-hitam-oranye; 5 gelang: cokelat-hitam-hitam-merah; ragu? ukur dulu dengan multimeter di mode Ω), tiga kabel jumper jantan–jantan (oranye, hitam, dan abu-abu yang panjang, ±20 cm), multimeter + dua kabel cadangan sebagai perpanjangan *probe*, dan senter HP. Konsep yang dipakai: 1–3.

#### 1.1 Pasang pembagi tegangan LDR

Pastikan MB102 mati dan USB tercabut. Semua komponen di bawah ini dipasang di **breadboard bawah**, di sebelah kanan potensiometer Modul 5, kecuali ujung kabel abu-abu yang naik ke **breadboard atas**.

| Komponen | Dari | Ke | Gunanya |
| :--- | :--- | :--- | :--- |
| Kabel **oranye** | 30j | rel bawah **(+)** | 3,3 V ke ujung atas pembagi tegangan |
| Resistor **10 kΩ** | 30g | 34g | resistor atas pembagi |
| **LDR** | satu kaki di 34i | kaki lainnya di 36i | resistor bawah pembagi; LDR tidak berkutub, jadi kakinya boleh terbalik |
| Kabel **hitam** | 36j | rel bawah **(−)** | ujung bawah pembagi ke GND |
| Kabel **abu-abu** (panjang) | 34f | **17f (atas)** | titik tengah pembagi ke **VP (GPIO 36)** |

Kolom 34 adalah **titik tengah** pembagi tegangan: lubang 34f, 34g, dan 34i tersambung di dalam breadboard (Modul 2: lima lubang satu kolom = satu jalur). Kaki LDR dibuka sedikit lebih lebar supaya pas di 34i dan 36i, lalu ditancapkan pelan-pelan dengan kepala LDR menghadap ke atas, ke arah lampu ruangan. Kabel abu-abu menyeberang ke breadboard atas lewat ujung kanan papan ESP32, sejajar dengan kabel hijau potensiometer dari Modul 5.

![Ilustrasi meja kerja setelah Praktik 1, dilihat dari atas. Komponen Modul 5 digambar pudar. Di breadboard bawah, tambahan baru berwarna terang: kabel oranye dari 30j ke rel bawah plus, resistor 10 kiloohm dari 30g ke 34g, LDR dengan kaki di 34i dan 36i, kabel hitam dari 36j ke rel bawah minus, dan kabel abu-abu panjang dari 34f naik melewati ujung kanan papan ESP32 ke 17f di breadboard atas, tepat di atas kaki VP. Label: kolom 34 titik tengah pembagi, dengan garis penunjuk ke 34f; rel bawah 3,3 volt dari ESP32. Servo, relay, kipas, dan pompa Modul 5 tidak digambar, hanya pangkal kabelnya](aset/meja-kerja-ldr.png)

#### 1.2 Ukur titik tengahnya dengan multimeter (hanya di papan asli)

1. Dengan USB masih tercabut, tancapkan satu kabel cadangan di **rel bawah (−)** dan satu lagi di **34h (bawah)** — lubang kosong di kolom titik tengah.
2. Colokkan USB laptop ke papan ESP32 (rel bawah kini 3,3 V). Putar sakelar multimeter ke **V⎓ 20**, lalu tempelkan *probe* hitam ke kabel di rel (−) dan *probe* merah ke kabel di 34h.
3. Catat angkanya dalam keadaan biasa. Lalu, **tutup LDR dengan telapak tangan** (gelap) dan catat lagi. Terakhir, **sorot LDR dengan senter HP** (terang) dan catat.

Di ruangan berlampu, angkanya biasanya sekitar 0,5–1,5 V; saat ditutup tangan naik mendekati 3 V; saat disorot senter turun ke beberapa persepuluh volt. Persis seperti tabel di Konsep 3: **gelap = tegangan tinggi, terang = tegangan rendah**. Setelah selesai, cabut USB dulu, baru cabut kedua kabel cadangan.

#### 1.3 Baca dengan ESP32

1. Colokkan lagi USB ke papan ESP32. Buat sketsa baru `modul06_ldr_pembagi`, tempel kode ini, lalu klik **Upload**:

   ```cpp
   // Modul 6 - Praktik 1: LDR dan pembagi tegangan
   // Rangkaian: 3,3 V -> resistor 10 kiloohm -> titik tengah -> LDR -> GND.
   // Titik tengah ke VP (GPIO 36). Makin terang, hambatan LDR makin kecil,
   // tegangan titik tengah turun, dan angka mentahnya ikut turun.

   const int PIN_LDR = 36;          // VP: LDR (peta pin kanonik)
   const int AMBANG_GELAP = 1000;   // cahaya di bawah ini dianggap gelap (sesuaikan dengan ruanganmu)
   const int AMBANG_TERANG = 2500;  // cahaya di atas ini dianggap terang

   void setup() {
     Serial.begin(115200);
   }

   void loop() {
     int mentah = analogRead(PIN_LDR);      // 0 sampai 4095
     float tegangan = mentah * 3.3 / 4095;  // perkiraan kasar dengan "penggaris lurus" (Konsep 2)
     int cahaya = 4095 - mentah;            // dibalik: makin terang, makin besar

     Serial.print("mentah=");
     Serial.print(mentah);
     Serial.print("  tegangan~");
     Serial.print(tegangan, 2);  // 2 angka di belakang titik desimal
     Serial.print(" V  cahaya=");
     Serial.print(cahaya);
     if (cahaya < AMBANG_GELAP) {
       Serial.println("  (gelap)");
     } else if (cahaya < AMBANG_TERANG) {
       Serial.println("  (redup)");
     } else {
       Serial.println("  (terang)");
     }
     delay(500);
   }
   ```

2. Buka Serial Monitor (115200 baud). Setiap setengah detik muncul satu baris, misalnya:

   **Hasilnya** (angkamu pasti berbeda, bergantung pada lampu ruanganmu):

   ```text
   mentah=1342  tegangan~1.08 V  cahaya=2753  (terang)
   mentah=1355  tegangan~1.09 V  cahaya=2740  (terang)
   mentah=1331  tegangan~1.07 V  cahaya=2764  (terang)
   ```

3. Tutup LDR dengan tangan, lalu sorot dengan senter. Label di ujung baris berganti antara `(gelap)`, `(redup)`, dan `(terang)`.

Tiga hal yang perlu diperhatikan:

- **Arduino menulis pecahan dengan titik**, bukan koma: `1.08` berarti 1,08 V.
- **Bandingkan `tegangan~` dengan angka multimeter** di langkah 1.2. Biasanya `tegangan~` sedikit lebih rendah daripada multimeter, dengan selisih 0,05–0,2 V — itulah penggaris ADC yang tidak sempurna (Konsep 2). Untuk keputusan gelap-terang, selisih itu tidak penting. Penasaran cara mengoreksinya? Lihat 🔬.
- **Angka `mentah` tidak pernah diam** walaupun tanganmu tidak bergerak. Itu derau, bahan Praktik 2.

#### 1.4 Atur ambang gelap untuk ruanganmu

Catat angka `cahaya` dalam dua keadaan: lampu kamar **menyala** dan lampu kamar **padam** (atau tirai ditutup). Ambang gelap yang baik ada di antara keduanya, lebih dekat ke angka "padam". Misalnya, lampu menyala `2750` dan lampu padam `300`: ambang `1000` sudah cocok. Kalau ambang `1000` tidak cocok untuk ruanganmu, ubah angka di baris `const int AMBANG_GELAP = 1000;`, klik **Upload**, lalu pastikan label `(gelap)` muncul saat lampu padam. Catat kedua angka itu dulu di kertas atau aplikasi catatan di HP; di Praktik 9 kamu memindahkannya ke file `catatan-kalibrasi.md`. Praktik 8 memakainya lagi.

**Di Wokwi:** pakai [`diagram.json`](kode/modul06_ldr_pembagi/diagram.json) Praktik 1 (isinya sama dengan Kemenangan Cepat). Geser penggeser lux: sekitar 500 lux terbaca `mentah=1001  tegangan~0.81 V  cahaya=3094  (terang)`, sekitar 100 lux `mentah=2045  tegangan~1.65 V  cahaya=2050  (redup)`, dan sekitar 10 lux `mentah=3413  tegangan~2.75 V  cahaya=682  (gelap)`. Di Wokwi, angkanya diam sempurna — Wokwi tidak menyimulasikan derau.

> ⬆️ **Selesai Praktik 1?** Kembali ke [Konsep 4](#4-derau-rata-rata-bergerak-dan-kapasitor-100-nf) (➡️ di sana akan mengantarmu ke Praktik 2).

### Praktik 2 — Derau, rata-rata bergerak, dan Serial Plotter (25 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** dengan **Serial Plotter** (atau Wokwi), rangkaian LDR dari Praktik 1, dan kapasitor keramik **100 nF** (bertuliskan "104"). Konsep yang dipakai: 4.

#### 2.1 Unggah sketsa penggambar grafik

Buat sketsa baru `modul06_derau_plotter`, tempel kode ini, lalu klik **Upload**:

```cpp
// Modul 6 - Praktik 2: derau, rata-rata bergerak, dan Serial Plotter
// Membaca LDR 20 kali per detik, lalu mengirim dua garis untuk Serial Plotter:
// "mentah" (apa adanya) dan "rata" (rata-rata 10 bacaan terakhir).
// Wokwi tidak punya derau: ubah DERAU_BUATAN menjadi 150 supaya efeknya terlihat.

const int PIN_LDR = 36;        // VP: LDR (peta pin kanonik)
const int JUMLAH_SAMPEL = 10;  // berapa bacaan terakhir yang dirata-ratakan
const int DERAU_BUATAN = 0;    // 0 untuk papan asli; 150 untuk mencoba di Wokwi

int riwayat[JUMLAH_SAMPEL];  // 10 laci berisi bacaan-bacaan terakhir
int posisi = 0;              // nomor laci yang akan ditimpa berikutnya
long jumlah = 0;             // jumlah isi semua laci

void setup() {
  Serial.begin(115200);
  // Isi semua laci dengan bacaan pertama supaya rata-ratanya tidak mulai dari 0.
  int awal = analogRead(PIN_LDR);
  for (int i = 0; i < JUMLAH_SAMPEL; i++) {
    riwayat[i] = awal;
    jumlah += awal;
  }
}

void loop() {
  int mentah = analogRead(PIN_LDR) + random(-DERAU_BUATAN, DERAU_BUATAN + 1);

  jumlah -= riwayat[posisi];              // keluarkan bacaan paling lama dari jumlah,
  riwayat[posisi] = mentah;               // timpa lacinya dengan bacaan baru,
  jumlah += mentah;                       // lalu masukkan bacaan baru ke jumlah
  posisi = (posisi + 1) % JUMLAH_SAMPEL;  // laci berikutnya; sesudah laci 9 kembali ke 0
  int rata = jumlah / JUMLAH_SAMPEL;

  // Format Serial Plotter: nama:nilai, dipisahkan dengan koma. Jangan cetak teks lain di sketsa ini.
  Serial.print("mentah:");
  Serial.print(mentah);
  Serial.print(",rata:");
  Serial.println(rata);
  delay(50);  // 20 bacaan per detik
}
```

Setiap baris yang dikirim berbentuk `mentah:1342,rata:1338`. Bentuk **`nama:nilai`** yang dipisahkan dengan koma itu dimengerti Serial Plotter: setiap nama menjadi satu garis berwarna. Karena itulah sketsa ini sengaja tidak mencetak kalimat apa pun — Serial Plotter akan menganggap setiap kata sebagai garis baru bernama `value 1`, `value 2`, dan seterusnya.

`random(-DERAU_BUATAN, DERAU_BUATAN + 1)` menambahkan angka acak dari −150 sampai 150 kalau `DERAU_BUATAN` diubah menjadi 150 (ingat Modul 3: batas atas `random()` tidak ikut terpilih). Di papan asli, biarkan `0`: derau sungguhan sudah ada dengan sendirinya.

#### 2.2 Buka Serial Plotter

1. Kalau Serial Monitor masih terbuka, biarkan saja; keduanya boleh terbuka bersamaan.
2. Pilih **Tools → Serial Plotter**, atau klik ikon grafik di pojok kanan atas Arduino IDE (di sebelah kiri ikon kaca pembesar Serial Monitor). Jendela baru terbuka.
3. Periksa pilihan kecepatan di pojok kanan bawah jendela itu: harus **115200 baud**.

Dua garis berjalan dari kanan ke kiri: **mentah** dan **rata**, dengan nama dan warnanya di bagian atas. Serial Plotter selalu menampilkan 50 titik terakhir, jadi grafiknya terus bergeser.

![Ilustrasi jendela Serial Plotter Arduino IDE 2. Di atas, legenda dengan dua kotak centang berwarna, mentah dan rata; di kanan atas, sakelar Interpolate, tombol STOP, dan ikon hapus. Di tengah, grafik dengan sumbu tegak sekitar 1300 sampai 1400: garis mentah bergerigi naik-turun sekitar plus-minus 20, garis rata halus di tengahnya. Di bawah, kotak Type Message dengan tombol Send, pilihan akhir baris, dan pilihan 115200 baud. Penanda: 1 legenda, klik kotak centang untuk menyembunyikan garis; 2 STOP untuk membekukan grafik; 3 angka sumbu tegak, perhatikan skalanya; 4 kecepatan harus 115200 baud. Label ilustrasi](aset/arduino-serial-plotter.png)

#### 2.3 Bereksperimen dengan derau

1. **Diamkan.** Garis mentah bergerigi, garis rata halus di tengahnya. Lihat angka di sumbu kiri: Serial Plotter otomatis memperbesar grafik supaya kedua garis memenuhi layar, jadi goyangan ±10 pun tampak seperti gelombang besar. Selalu baca skalanya.
2. **Tutup LDR dengan tangan, lalu buka lagi.** Kedua garis melompat. Perhatikan: garis rata menyusul sedikit terlambat, sekitar setengah detik — itulah harga yang dibayar untuk kehalusannya.
3. **Dekatkan lampu meja (LED atau neon) ke LDR** — bukan cahaya matahari, yang tidak berkedip. Di bawah sebagian lampu LED atau neon, garis mentah bergoyang lebih kencang karena kedipan lampu 100 kali per detik.
4. **Klik kotak centang mentah** di legenda untuk menyembunyikannya, lalu klik lagi untuk memunculkannya. Tombol **STOP** membekukan grafik supaya bisa diamati; **RUN** menjalankannya lagi.

#### 2.4 Pasang kapasitor 100 nF (hanya di papan asli)

1. Tutup jendela Serial Plotter, lalu cabut USB (MB102 memang masih mati).
2. Tancapkan kapasitor keramik **"104"** dengan satu kaki di **34h (bawah)** dan kaki lainnya di **36h (bawah)**: dari kolom titik tengah ke kolom GND. Kapasitor keramik tidak berkutub.
3. Colokkan USB lagi, lalu buka kembali **Tools → Serial Plotter**.

Bandingkan garis mentah sebelum dan sesudahnya. Biasanya goyangannya mengecil, misalnya dari ±20 menjadi ±5. Kalau ruanganmu memang tenang, bedanya bisa kecil — itu juga hasil yang benar. **Biarkan kapasitor itu terpasang**: ia menjadi bagian tetap Node 1.

![Potongan dekat breadboard bawah, kolom 23 sampai 41, setelah Praktik 2; komponen Modul 5 digambar pudar. Komponen Praktik 1 digambar biasa: kabel oranye 30j ke rel plus, resistor 10 kiloohm 30g sampai 34g, LDR 34i dan 36i, kabel hitam 36j ke rel minus, kabel abu-abu dari 34f. Tambahan baru dilingkari: kapasitor keramik oranye bertuliskan 104, dengan kaki di 34h dan 36h, tepat di atas LDR. Label: kolom 34 titik tengah, kolom 36 GND, kapasitor tidak berkutub](aset/meja-kerja-kapasitor.png)

**Di Wokwi:** pakai [`diagram.json`](kode/modul06_derau_plotter/diagram.json) Praktik 2 dan ubah `DERAU_BUATAN` menjadi `150`. Wokwi juga punya penggambar grafik: jalankan simulasi, lalu klik **ikon grafik** di pojok kanan bawah Serial Monitor Wokwi. Garis mentah bergerigi ±150, sedangkan garis rata jauh lebih tenang. Wokwi tidak menuliskan nama garisnya; di tangkapan layar ini, hijau = `mentah` dan oranye = `rata`. Geser penggeser lux untuk melihat garis rata menyusul. Kapasitor tidak perlu dicoba di Wokwi karena Wokwi tidak punya derau.

![Tangkapan layar Wokwi: Serial Monitor sudah berganti menjadi grafik Serial plotter dengan dua garis, mentah berwarna hijau yang bergerigi sekitar plus-minus 150 di sekitar 1001 dan rata berwarna oranye yang jauh lebih halus, dengan angka sumbu sekitar 850 di bawah dan 3560 di atas; di tengah grafik keduanya naik karena penggeser lux digeser ke arah gelap. Penanda 1: ikon grafik di pojok kanan bawah Serial Monitor; penanda 2: garis mentah dengan derau buatan; penanda 3: garis rata yang menyusul sedikit terlambat; penanda 4: penggeser lux di jendela Photoresistor digeser ke sekitar 10 lux](aset/wokwi-plotter.png)

*Tangkapan layar [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), Oktober 2026; dipakai untuk tujuan pendidikan, penanda oleh penulis.*

> ⬆️ **Selesai Praktik 2?** Kembali ke [Konsep 5](#5-dari-angka-mentah-ke-satuan-map-constrain-dan-kalibrasi-dua-titik) dan baca sampai Konsep 6 (➡️ di sana akan mengantarmu ke Praktik 3).

### Praktik 3 — Kalibrasi sensor tanah dengan segelas air (30 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** (atau Wokwi, dengan potensiometer sebagai pengganti sensor tanah), sensor kelembapan tanah kapasitif beserta kabel bawaannya, tiga kabel jumper jantan–jantan (sebaiknya hitam, hijau, dan oranye), segelas air di atas nampan, lap, spidol, dan — kalau ada — selongsong bakar (plus pengering rambut) atau cat kuku bening. Konsep yang dipakai: 5 dan 6.
>
> ⭐ **Wajib** — syarat lulus pertama: sensor tanah terbaca ±0 % di udara dan ±100 % di air.

#### 3.1 Periksa sensormu dulu

1. **Baca tulisan chip** berkaki delapan di bagian atas sensor. Kalau tertulis "TLC555" (atau berakhiran "555C"), bagus. Kalau tertulis "NE555", sensor itu bisa tidak bekerja di 3,3 V (Konsep 6); siapkan sensor kedua dari kit (kit berisi dua sensor tanah; yang kedua sebenarnya untuk Node 2 di Modul 14).
2. **Cari garis batas** di papan sensor. Tidak ada garis? Buat garis dengan spidol **2 cm di bawah zona elektronik**, lalu benamkan sensor hanya sampai garis itu.
3. **Lindungi bagian elektroniknya** sebelum dipakai pertama kali (opsional, sangat dianjurkan). Colokkan dulu kabel bawaan sensor ke colokan tiga kakinya, baru pasang selongsong bakar sampai menutupi zona elektronik dan pangkal colokan, lalu panaskan pelan-pelan dengan pengering rambut sampai mengerut (jangan pakai api). Kalau selongsongnya tidak mau mengerut, pakai cat kuku bening saja: olesi zona elektronik dan tepi papan. Cat kuku butuh sekitar 30 menit untuk kering; sementara itu, kerjakan langkah 3.2, tetapi jangan mencelupkan sensor sebelum catnya kering.

#### 3.2 Ganti potensiometer dengan sensor tanah

Matikan MB102 dan cabut USB dulu. Potensiometer dari Modul 5 adalah "sensor latihan" untuk pin VN; sekarang sensor sungguhannya datang.

1. **Cabut potensiometer** dari 24h, 26h, dan 28h (bawah). **Biarkan ketiga kabelnya** — hitam di 24j, hijau di 26j, dan oranye di 28j — tetap di tempatnya. Kabel-kabel itu kini menjadi jalur sensor tanah.
2. **Siapkan kabel sensor.** Colokkan kabel bawaan ke colokan tiga kaki di sensor (kalau belum). Ujung lainnya biasanya berupa tiga lubang betina. Tancapkan satu kabel jantan–jantan ke setiap lubang itu. Ikuti **tulisan di papan sensor** (GND, VCC, AOUT), bukan warna kabel bawaannya karena warnanya tidak seragam antarpabrik. Telusuri setiap kabel dari kaki bertuliskan GND, VCC, dan AOUT sampai ke lubang betinanya: lubang dari GND disambung jumper **hitam**, dari AOUT jumper **hijau**, dan dari VCC jumper **oranye**. Urutan kaki sensor (GND, VCC, AOUT) berbeda dengan urutan kolom 24, 26, 28, jadi jumper hijau dan oranye bersilangan — itu memang benar.
3. **Tancapkan ke breadboard bawah:**

   | Kaki sensor | Jumper | Ke | Lalu tersambung ke |
   | :--- | :--- | :--- | :--- |
   | **GND** | hitam | **24h** (bawah) | rel bawah (−), lewat kabel hitam di 24j |
   | **AOUT** | hijau | **26h** (bawah) | **VN (GPIO 39)**, lewat kabel hijau 26j → 16f (atas) |
   | **VCC** | oranye | **28h** (bawah) | rel bawah (+) 3,3 V, lewat kabel oranye di 28j |

4. Baringkan sensor dalam keadaan kering di nampan, jauh dari breadboard. Buat **lengkungan tetes** pada kabelnya (Konsep 6).

![Ilustrasi meja kerja setelah Praktik 3. Komponen Modul 5 dan Praktik 1–2 digambar pudar; potensiometer sudah tidak ada. Di breadboard bawah, tiga kabel jantan–jantan baru, hitam di 24h, hijau di 26h, dan oranye di 28h, sedikit menyamping dari kabel lama hitam 24j ke rel minus, hijau 26j yang naik ke 16f di atas kaki VN, dan oranye 28j ke rel plus. Ketiga kabel baru masuk ke ujung betina kabel sensor yang lubangnya berurutan GND, VCC, AOUT: hitam dari GND ke 24h, oranye dari VCC ke 28h, dan hijau dari AOUT ke 26h sehingga kabel hijau dan oranye bersilangan. Sensor tanah kapasitif terbaring di nampan di bawah meja kerja, dengan lengkungan tetes pada kabelnya. Gelas air di sampingnya. Label: ikuti tulisan di papan sensor, bukan warna kabelnya](aset/meja-kerja-tanah.png)

#### 3.3 Unggah sketsa kalibrasi

Colokkan USB. Buat sketsa baru `modul06_kalibrasi_tanah`, tempel kode ini, lalu klik **Upload**:

```cpp
// Modul 6 - Praktik 3: kalibrasi sensor kelembapan tanah kapasitif
// Sensor di VN (GPIO 39). Makin basah, makin KECIL angka mentahnya.
// Cara kalibrasi: (1) catat angka mentah saat sensor di udara -> KERING;
// (2) catat angka mentah saat sensor dicelup air sampai garis batas -> BASAH;
// (3) tulis keduanya di bawah ini, lalu unggah lagi. Hasilnya: udara 0 %, air 100 %.

const int PIN_TANAH = 39;    // VN: sensor tanah (peta pin kanonik)
const int KERING = 3000;     // angka mentah di udara (ganti dengan catatanmu)
const int BASAH = 1300;      // angka mentah di air (ganti dengan catatanmu)
const int JUMLAH_BACA = 20;  // banyaknya bacaan yang dirata-ratakan

// Membaca sensor 20 kali berturut-turut, lalu mengembalikan rata-ratanya.
int bacaTanahMentah() {
  long jumlah = 0;
  for (int i = 0; i < JUMLAH_BACA; i++) {
    jumlah += analogRead(PIN_TANAH);
    delay(5);
  }
  return jumlah / JUMLAH_BACA;
}

void setup() {
  Serial.begin(115200);
  Serial.println("Kalibrasi sensor tanah: catat angka mentah di udara dan di air.");
}

void loop() {
  int mentah = bacaTanahMentah();
  int persen = map(mentah, KERING, BASAH, 0, 100);  // KERING -> 0, BASAH -> 100
  int tanah = constrain(persen, 0, 100);            // pagari supaya tetap 0-100

  Serial.print("mentah=");
  Serial.print(mentah);
  Serial.print("  hasil map=");
  Serial.print(persen);
  Serial.print("  tanah=");
  Serial.print(tanah);
  Serial.println(" %");
  delay(1000);
}
```

Buka Serial Monitor. Setiap detik muncul satu baris berisi tiga angka: `mentah` (rata-rata 20 bacaan), `hasil map` (sebelum dipagari), dan `tanah` (sesudah dipagari).

#### 3.4 Catat angka udara dan angka air

1. **Udara.** Gantung sensor dengan memegang **kabelnya** (jangan memegang papannya — tanganmu ikut terbaca), atau letakkan di nampan kering tanpa menyentuh apa pun. Tunggu 10 detik sampai angkanya tenang, lalu catat angka `mentah` yang paling sering muncul. Inilah nilai `KERING`-mu, misalnya `2948`.
2. **Air.** Celupkan sensor ke gelas air **tepat sampai garis batas** — tidak lebih. Tunggu 10 detik, lalu catat angka `mentah`-nya. Inilah nilai `BASAH`-mu, misalnya `1352`.
3. Angkat sensor dan keringkan dengan lap.

**Hasilnya** kira-kira seperti ini, masih dengan angka contoh `3000` dan `1300` di kode:

```text
mentah=2948  hasil map=3  tanah=3 %
mentah=2951  hasil map=2  tanah=2 %
mentah=1352  hasil map=96  tanah=96 %
mentah=1349  hasil map=97  tanah=97 %
```

Catat kedua angkamu di kertas atau aplikasi catatan di HP; di Praktik 9 kamu memindahkannya ke `catatan-kalibrasi.md`. Kalau selisih angka udara dan air **kurang dari 500**, sensormu kemungkinan bermasalah (Konsep 6) — coba sensor kedua.

#### 3.5 Tulis angkamu di kode, lalu buktikan

1. Ubah `const int KERING = 3000;` menjadi angka udaramu, dan `const int BASAH = 1300;` menjadi angka airmu. Contoh: `const int KERING = 2948;` dan `const int BASAH = 1352;`.
2. Klik **Upload** lagi.
3. Ulangi langkah 3.4: di udara, Serial Monitor kini menunjukkan **`tanah=0 %`** atau angka di dekatnya; di air, **`tanah=100 %`** atau di dekatnya (misalnya 98 atau 99).

**Itulah syarat lulus pertama. ⭐** Selisih beberapa persen itu wajar: angka mentah sedikit bergoyang (derau), dan `map()` memotong pecahan (99,9 menjadi 99). Perhatikan juga kolom `hasil map`: kalau sensor sedikit lebih kering daripada saat kalibrasi, misalnya karena tertiup kipas, `hasil map` bisa `-2`, tetapi `tanah` tetap `0` berkat `constrain()`.

Mau mencoba di tanah sungguhan? Benamkan sensor ke pot tanah sampai garis batas. Tanah yang kering biasanya terbaca 10–30 %, dan setelah disiram 60–90 %. Tunggu beberapa menit setelah menyiram supaya air meresap.

**Di Wokwi:** pakai [`diagram.json`](kode/modul06_kalibrasi_tanah/diagram.json) Praktik 3. Potensiometer di atas pin VN berperan sebagai sensor tanah.

1. Jalankan simulasi. Di posisi awal terbaca `mentah=3002  hasil map=0  tanah=0 %` — anggap saja ini "udara".
2. Klik potensiometernya, lalu putar kenopnya ke kiri (seret dengan mouse, atau tekan panah **←** berkali-kali) sampai `mentah` sekitar `1300` ("air"): `tanah` menjadi ±99 %.
3. Tekan **End** supaya mentok ke kanan: `mentah=4095  hasil map=-64  tanah=0 %`. Tekan **Home** supaya mentok ke kiri: `mentah=0  hasil map=176  tanah=100 %`. Begitulah `constrain()` menyelamatkan angka yang mustahil.

> ⬆️ **Selesai Praktik 3?** Kembali ke [Konsep 7](#7-membaca-lembar-data-lima-hal-yang-dicari) dan baca sampai Konsep 8 (➡️ di sana akan mengantarmu ke Praktik 4).

### Praktik 4 — DHT22: suhu dan kelembapan dengan library (25 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** (dengan **Library Manager**) atau Wokwi, modul DHT22 tiga kaki, dan tiga kabel jumper jantan–betina (oranye, hitam, dan kuning). Konsep yang dipakai: 7 dan 8.

#### 4.1 Pasang DHT sensor library

1. Di Arduino IDE, klik ikon **Library Manager** di bilah kiri (ikon ketiga, bergambar buku), sama seperti di Modul 3 dan 5.
2. Ketik **DHT sensor library** di kotak pencarian. Pilih entri **DHT sensor library** yang di bawah judulnya tertulis **by Adafruit** — ada beberapa library DHT lain dengan nama mirip.
3. Pastikan menu versinya menunjukkan **1.4.7** (pilih dari daftar kalau sudah ada versi lebih baru), lalu klik **INSTALL**.
4. Muncul jendela `Install library dependencies` dengan pesan `The library DHT sensor library:1.4.7 needs another dependency currently not installed:` dan di bawahnya `- Adafruit Unified Sensor`. Artinya, library DHT butuh satu library pendamping. Klik **INSTALL ALL** — **bukan** **INSTALL WITHOUT DEPENDENCIES**. (Arduino IDE 2.3.10 tetap menampilkan jendela ini walaupun Adafruit Unified Sensor sudah pernah terpasang. Klik saja **INSTALL ALL**; tidak ada yang rusak.)
5. Tunggu sampai notifikasi `Successfully installed library DHT sensor library:1.4.7` muncul di kanan bawah, panel **Output** berisi baris `Installed Adafruit Unified Sensor@1.1.15` dan `Installed DHT sensor library@1.4.7`, dan entri itu bertuliskan `1.4.7 installed`.

![Ilustrasi Library Manager Arduino IDE 2. Penanda 1 pada ikon buku Library Manager di bilah kiri. Kotak pencarian berisi DHT sensor library; entri DHT sensor library by Adafruit dengan menu versi 1.4.7 dan tombol INSTALL, ditandai penanda 2, pilih 1.4.7 lalu klik INSTALL. Di bawahnya, entri lain DHT sensor library for ESPx by beegee_tokyo dengan catatan bukan yang ini. Di sebelah kanan, jendela Install library dependencies berisi pesan The library DHT sensor library:1.4.7 needs another dependency currently not installed, minus Adafruit Unified Sensor, Would you like to install the missing dependency, dengan dua tombol INSTALL WITHOUT DEPENDENCIES dan INSTALL ALL; penanda 3 pada INSTALL ALL. Di bawah, panel Output berisi baris Downloading, Installing, dan Installed untuk Adafruit Unified Sensor@1.1.15 dan DHT sensor library@1.4.7. Label ilustrasi](aset/arduino-library-dht.png)

Kalau telanjur mengeklik **INSTALL WITHOUT DEPENDENCIES**, kompilasi nanti gagal dengan pesan `fatal error: Adafruit_Sensor.h: No such file or directory`. Obatnya: cari **Adafruit Unified Sensor** di Library Manager, lalu pasang versi **1.1.15**.

**Di Wokwi**, library tidak dipasang lewat Library Manager Arduino IDE, melainkan lewat file `libraries.txt`. Langkahnya ada di akhir praktik ini.

#### 4.2 Pasang modul DHT22

Matikan MB102 dan cabut USB. Baca dulu tulisan di modul DHT22-mu: biasanya "+", "out", dan "−", atau "VCC", "DATA", dan "GND". Pasang kabel jantan–betina: ujung betina ke kaki modul, ujung jantan ke breadboard.

| Kaki modul | Kabel | Ke | Catatan |
| :--- | :--- | :--- | :--- |
| **+** / VCC | **oranye** | rel bawah **(+)**, kolom 11 | 3,3 V — **jangan** ke rel atas yang 5 V |
| **−** / GND | **hitam** | rel bawah **(−)**, kolom 12 | |
| **out** / DATA | **kuning** | **8f (atas)** | tepat di atas kaki **D14** |

Letakkan modul DHT22 sedikit di luar meja kerja, menjauh dari papan ESP32 dan MB102 yang hangat saat bekerja. Biarkan modul itu menggantung di kabelnya atau berdiri di samping breadboard — sensor suhu yang terlalu dekat dengan chip yang hangat akan "melaporkan" suhu chip, bukan suhu ruangan. Kabel DHT22 yang diberi 3,3 V paling panjang 1 m (lembar data AM2302); kabel jumper 20 cm aman.

![Ilustrasi meja kerja setelah Praktik 4. Komponen lama digambar pudar. Modul DHT22 putih di luar breadboard, di kiri bawah, dengan tiga kabel jantan–betina baru: oranye dari kaki plus ke rel bawah plus kolom 11, hitam dari kaki minus ke rel bawah minus kolom 12, dan kuning dari kaki out naik melewati ujung kiri papan ESP32 ke 8f di breadboard atas, tepat di atas kaki D14. Label: 3,3 volt dari rel bawah, jangan 5 volt; jauhkan sensor dari chip yang hangat](aset/meja-kerja-dht22.png)

#### 4.3 Baca suhu dan kelembapan

Colokkan USB. Buat sketsa baru `modul06_dht22`, tempel kode ini, lalu klik **Upload**:

```cpp
// Modul 6 - Praktik 4: suhu dan kelembapan dengan DHT22
// Kaki DATA modul DHT22 ke D14. Modul DHT22 diberi 3,3 V, BUKAN 5 V.
// Library: DHT sensor library by Adafruit 1.4.7 (ikut terpasang: Adafruit Unified Sensor 1.1.15).

#include <DHT.h>

const int PIN_DHT = 14;  // D14: DHT22 (peta pin kanonik)

DHT dht(PIN_DHT, DHT22);  // "objek" sensor: kaki DATA-nya di pin mana, jenisnya apa

void setup() {
  Serial.begin(115200);
  dht.begin();
  Serial.println("DHT22 siap. Bacaan pertama muncul 2 detik lagi.");
}

void loop() {
  delay(2000);  // DHT22 paling cepat dibaca sekali setiap 2 detik

  float suhu = dht.readTemperature();     // derajat Celsius
  float kelembapan = dht.readHumidity();  // persen

  if (isnan(suhu) || isnan(kelembapan)) {  // NAN = "bukan angka": pembacaan gagal
    Serial.println("Gagal membaca DHT22! Periksa kabel DATA, VCC, dan GND.");
    return;  // lewati sisa loop(); putaran berikutnya mencoba lagi
  }

  Serial.print("suhu=");
  Serial.print(suhu, 1);  // 1 angka di belakang titik desimal
  Serial.print(" C  kelembapan=");
  Serial.print(kelembapan, 0);
  Serial.println(" %");
}
```

**Hasilnya** di Serial Monitor (angkamu mengikuti cuaca di rumahmu):

```text
DHT22 siap. Bacaan pertama muncul 2 detik lagi.
suhu=28.4 C  kelembapan=71 %
suhu=28.4 C  kelembapan=71 %
```

Ada tiga hal baru di kode itu:

- **`DHT dht(PIN_DHT, DHT22);`** membuat sebuah "objek" bernama `dht` — semacam asisten yang tahu cara berbicara dengan DHT22 di pin 14. Seperti `Servo servoTirai;` di Modul 5.
- **`return;`** di dalam `loop()` berarti "lewati sisa putaran ini". `loop()` lalu dimulai lagi dari awal, menunggu 2 detik, dan mencoba lagi.
- **`isnan()`** menjawab `true` kalau isinya `NAN` (Konsep 8). Tanda `||` berarti "atau" (Modul 3).

#### 4.4 Uji sensornya

1. **Embuskan napas pelan** ke arah sensor dari jarak sekitar 10 cm. Dalam beberapa bacaan, kelembapan naik (bisa sampai 90 % lebih) dan suhu naik sedikit. Setelah semenit, angkanya kembali seperti semula.
2. **Jepit sensor di antara dua jari** selama setengah menit: suhu naik pelan-pelan.
3. **Uji gagal:** matikan MB102 (kalau menyala) dan cabut USB, lalu cabut ujung kabel kuning dari 8f. Colokkan USB lagi: setiap 2 detik muncul `Gagal membaca DHT22! Periksa kabel DATA, VCC, dan GND.` Begitulah `NAN` terlihat dari luar. Cabut USB, tancapkan lagi kabel kuning di 8f, lalu colokkan USB: bacaan normal kembali.

**Di Wokwi:**

1. Buka proyek ESP32 baru di Wokwi, lalu ganti isi tab `diagram.json` dengan [`diagram.json`](kode/modul06_dht22/diagram.json) Praktik 4.
2. Ganti isi tab `sketch.ino` dengan kode di langkah 4.3.
3. Klik tab **Library Manager** → tombol bulat **+** → ketik **DHT sensor library** → klik hasilnya. Setelah tab `libraries.txt` muncul, ganti seluruh isinya dengan isi [`libraries.txt`](kode/modul06_dht22/libraries.txt) dari folder praktik ini, yang memuat kedua library beserta versinya:

   ```text
   # Library untuk sketsa ini (dipakai Wokwi). Di Arduino IDE, pasang lewat Library Manager.
   DHT sensor library@1.4.7
   Adafruit Unified Sensor@1.1.15
   ```

4. Klik tombol hijau **▶** untuk menjalankan simulasi.
5. Klik sensor DHT22 di panel simulasi: muncul jendela `Editing DHT22` dengan penggeser **Temperature** (suhu) dan **Humidity** (kelembapan). Geser keduanya; dua detik kemudian, Serial Monitor mengikuti.

Di Wokwi, DHT22 digambar sebagai sensor empat kaki tanpa resistor *pull-up* (kaki ketiganya, NC, tidak dipakai); modul tiga kaki di kit-mu sudah membawa resistor itu.

![Tangkapan layar Wokwi: papan ESP32 menyamping, sensor DHT22 putih di atasnya dengan kaki SDA lurus turun ke D14, VCC memutar lewat sisi kiri ke 3V3, dan GND memutar lewat sisi kanan ke GND di deretan bawah. Penanda 1: sensor DHT22 diklik, jendela Editing DHT22 terbuka; penanda 2: penggeser Temperature di 35,0 derajat Celsius dan Humidity di 40,0 persen; penanda 3: Serial Monitor berganti dari suhu=28.5 C kelembapan=71 persen menjadi suhu=35.0 C kelembapan=40 persen](aset/wokwi-dht22.png)

*Tangkapan layar [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), Oktober 2026; dipakai untuk tujuan pendidikan, penanda oleh penulis.*

> ⬆️ **Selesai Praktik 4?** Kembali ke [Konsep 9](#9-pir-sensor-gerak-yang-cukup-berkata-ya-atau-tidak) (➡️ di sana akan mengantarmu ke Praktik 5).

### Praktik 5 — PIR: sensor gerak dan pemanasan 1 menit (20 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** (atau Wokwi), modul PIR **HC-SR501**, tiga kabel jumper jantan–betina (merah, hitam, dan biru), obeng kecil, serta MB102 — PIR butuh 5 V dari rel atas. Konsep yang dipakai: 9.

#### 5.1 Siapkan PIR

1. **Lepaskan kubah putihnya** pelan-pelan (tarik lurus ke atas) dan baca tulisan di samping ketiga kaki: "VCC", "OUT", dan "GND". Ingat urutannya.
2. Di bagian belakang papan, cari pilihan **L/H**. Kalau berupa **jumper** kuning, pastikan di posisi **H** (pindahkan dengan kuku atau pinset kalau di L). Kalau berupa **bantalan solder** bertuliskan L dan H tanpa jumper, biarkan saja: biasanya sudah tersambung ke H dari pabrik.
3. Dengan obeng kecil, putar **kedua kenop** penuh **berlawanan arah jarum jam**. Di kebanyakan modul, itu memberi waktu HIGH paling singkat (±5 detik) dan jangkauan paling dekat (±3 m) — pas untuk diuji di meja. Kamu belum perlu tahu mana kenop Sx dan mana Tx; langkah 5.4 akan mengungkapnya.
4. Pasang lagi kubahnya.

#### 5.2 Pasang PIR

Matikan MB102 dan cabut USB. Pasang kabel jantan–betina: ujung betina ke kaki PIR, ujung jantan ke breadboard atas.

| Kaki PIR | Kabel | Ke | Catatan |
| :--- | :--- | :--- | :--- |
| **VCC** | **merah** | rel atas **(+)**, kolom 20 | 5 V dari MB102 |
| **GND** | **hitam** | rel atas **(−)**, kolom 21 | kalau lubang rel itu sudah terisi (misalnya oleh kabel Tantangan Tingkat 3 Modul 5), pakai lubang rel (−) kosong terdekat |
| **OUT** | **biru** | **15f (atas)** | tepat di atas kaki **D34**; OUT hanya 3,3 V, jadi aman disambung langsung ke pin |

Hadapkan PIR menjauhimu, misalnya ke arah pintu atau ruangan, supaya kamu bisa mengujinya dengan berjalan atau melambaikan tangan.

![Ilustrasi meja kerja setelah Praktik 5. Komponen lama digambar pudar. Modul PIR HC-SR501 dengan kubah putih di atas breadboard atas, di luar papan, dengan tiga kabel jantan–betina baru: merah dari VCC ke rel atas plus kolom 20, hitam dari GND ke rel atas minus kolom 21, dan biru dari OUT turun ke 15f, tepat di atas kaki D34. Label: PIR diberi 5 volt dari MB102, keluarannya 3,3 volt sehingga aman disambung langsung ke pin](aset/meja-kerja-pir.png)

#### 5.3 Unggah dan tunggu pemanasan

Colokkan USB, **nyalakan MB102** (PIR baru mendapat listrik saat MB102 menyala), lalu buat sketsa baru `modul06_pir_gerak`, tempel kode ini, dan klik **Upload**:

```cpp
// Modul 6 - Praktik 5: sensor gerak PIR HC-SR501
// Kaki OUT PIR ke D34. LED status di D4 menyala selama PIR melihat gerakan.
// PIR butuh "pemanasan" kira-kira 1 menit setelah mendapat listrik.

const int PIN_PIR = 34;          // D34: PIR (peta pin kanonik), hanya masukan
const int PIN_LED = 4;           // LED status
const int DETIK_PEMANASAN = 60;  // ubah menjadi 3 kalau mencoba di Wokwi

bool gerakSebelumnya = false;  // keadaan PIR pada putaran sebelumnya

void setup() {
  Serial.begin(115200);
  pinMode(PIN_PIR, INPUT);  // tanpa pull-up: PIR sendiri yang memberi HIGH atau LOW
  pinMode(PIN_LED, OUTPUT);
  Serial.print("Pemanasan PIR ");
  Serial.print(DETIK_PEMANASAN);
  Serial.println(" detik. Menjauhlah dari depan sensor...");
  for (int sisa = DETIK_PEMANASAN; sisa > 0; sisa--) {
    if (sisa % 10 == 0) {  // lapor setiap 10 detik
      Serial.print("  sisa ");
      Serial.print(sisa);
      Serial.println(" detik");
    }
    delay(1000);
  }
  Serial.println("PIR siap. Lambaikan tangan di depannya!");
}

void loop() {
  bool gerak = digitalRead(PIN_PIR) == HIGH;  // HIGH = ada gerakan
  if (gerak) {
    digitalWrite(PIN_LED, HIGH);
  } else {
    digitalWrite(PIN_LED, LOW);
  }

  // Cetak hanya saat keadaannya BERUBAH supaya Serial Monitor tidak banjir.
  if (gerak && !gerakSebelumnya) {
    Serial.println("Ada gerakan!");
  }
  if (!gerak && gerakSebelumnya) {
    Serial.println("Sepi lagi.");
  }
  gerakSebelumnya = gerak;
  delay(50);
}
```

Buka Serial Monitor dan menjauhlah dari depan PIR selama hitungan mundur.

**Hasilnya:**

```text
Pemanasan PIR 60 detik. Menjauhlah dari depan sensor...
  sisa 60 detik
  sisa 50 detik
  sisa 40 detik
  sisa 30 detik
  sisa 20 detik
  sisa 10 detik
PIR siap. Lambaikan tangan di depannya!
Ada gerakan!
Sepi lagi.
```

Kode ini memakai gagasan yang sama dengan tombol di Modul 5: **tanggapi perubahan, bukan keadaan**. Variabel `gerakSebelumnya` mengingat keadaan putaran lalu sehingga `Ada gerakan!` hanya tercetak sekali saat OUT naik, dan `Sepi lagi.` sekali saat OUT turun.

#### 5.4 Bereksperimen dengan PIR

1. **Lambaikan tangan** sekitar 1–2 m di depan PIR: `Ada gerakan!` muncul dan LED status D4 (LED merah di breadboard bawah, terpasang sejak Modul 2) menyala.
2. **Diam**, lalu tunggu: sekitar 5 detik kemudian muncul `Sepi lagi.` dan LED padam. Selama ±2,5 detik setelahnya, PIR "buta".
3. **Terus bergerak** selama 15 detik: dengan jumper di H, OUT tetap HIGH selama kamu bergerak, dan `Sepi lagi.` baru muncul ±5 detik setelah kamu berhenti.
4. **Kenali kenop Tx.** Putar salah satu kenop sedikit searah jarum jam, lalu uji lagi. Kalau waktu tunggu sebelum `Sepi lagi.` bertambah, itulah **Tx**; kalau tidak berubah, itu **Sx** (jangkauan). Kenop boleh diputar saat rangkaian menyala; pakai obeng dan jangan menyentuh kaki-kaki di papan. Kembalikan kenop ke posisi semula setelah mencoba.

**Di Wokwi:** pakai [`diagram.json`](kode/modul06_pir_gerak/diagram.json) Praktik 5, lalu ubah `DETIK_PEMANASAN` menjadi `3` — PIR Wokwi tidak perlu pemanasan. Klik modul PIR: muncul jendela `PIR Motion Sensor` dengan tombol **Simulate motion**. Klik tombol itu: `Ada gerakan!` tercetak dan LED status menyala, lalu ±5 detik kemudian muncul `Sepi lagi.` Di Wokwi, PIR mengambil daya dari pin VIN sebagai pengganti rel atas 5 V; di mejamu tetap dari MB102.

![Tangkapan layar Wokwi: papan ESP32 menyamping, modul PIR di atasnya dengan kaki OUT lurus turun ke D34, VCC ke VIN, dan GND ke GND di deretan atas; resistor dan LED status merah di bawah papan, tersambung ke D4. Penanda 1: modul PIR diklik, jendela PIR Motion Sensor dengan tombol Simulate motion terbuka; penanda 2: LED status D4 menyala; penanda 3: Serial Monitor menampilkan PIR siap, Lambaikan tangan di depannya, lalu Ada gerakan](aset/wokwi-pir.png)

*Tangkapan layar [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), Oktober 2026; dipakai untuk tujuan pendidikan, penanda oleh penulis.*

> ⬆️ **Selesai Praktik 5?** Kembali ke [Konsep 10](#10-hc-sr04-mengukur-jarak-dengan-gema) (➡️ di sana akan mengantarmu ke Praktik 6).

### Praktik 6 — HC-SR04 dan pembagi tegangan: level air tandon (40 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** (atau Wokwi), sensor **HC-SR04**, resistor **4,7 kΩ** (4 gelang: kuning-ungu-merah; 5 gelang: kuning-ungu-hitam-cokelat) dan **10 kΩ** (4 gelang: cokelat-hitam-oranye; 5 gelang: cokelat-hitam-hitam-merah; ragu? ukur dulu dengan multimeter di mode Ω), empat kabel jumper jantan–betina (merah, hitam, ungu, putih) plus beberapa cadangan sebagai perpanjangan kalau tandon agak jauh, dua kabel jantan–jantan (satu hitam pendek, satu merah untuk uji sementara), multimeter + dua kabel cadangan, wadah tandon + air, karton tebal (atau penggaris cadangan) + selotip untuk jembatan, penggaris untuk mengukur, sebuah gelas, dan pompa dari Modul 5. Konsep yang dipakai: 3 dan 10.
>
> ⭐ **Wajib** — bekal syarat lulus kedua: level air tandon terukur, lalu dipakai di Praktik 8 untuk menolak menyalakan pompa.

#### 6.1 Pasang pembagi tegangan di jalur D35

Matikan MB102 dan cabut USB. Semua komponen di langkah ini dipasang di **breadboard atas**.

| Komponen | Dari | Ke | Gunanya |
| :--- | :--- | :--- | :--- |
| Resistor **10 kΩ** (cokelat-hitam-oranye) | 14e | 14g | resistor bawah pembagi; menyeberangi parit tengah |
| Kabel **hitam** pendek | 14a | rel atas **(−)**, kolom 15 | ujung bawah pembagi ke GND |
| Resistor **4,7 kΩ** (kuning-ungu-merah) | 14h | 19h | resistor atas pembagi |

Kenapa di kolom 14? Kolom 14 baris f–j adalah jalur kaki **D35** (kakinya di 14i). Jadi, titik tengah pembagi langsung menempel pada jalur D35, tanpa kabel tambahan. Resistor 10 kΩ menyeberangi parit tengah: kaki yang ke GND (di 14e) masuk ke jalur kolom 14 baris a–e, yang dihubungkan ke GND oleh kabel hitam dari 14a. Resistor 4,7 kΩ membentang dari jalur D35 (14h) ke kolom 19 (19h); nanti kabel ECHO masuk ke kolom 19 itu. Ingat, "atas" dan "bawah" pada pembagi tegangan adalah perannya di rumus (dekat sumber atau dekat GND), bukan letaknya di breadboard.

**Kaki ESP32-mu di baris h** (hanya baris f dan g yang bebas, Modul 5 Praktik 1.3)? Pasang 10 kΩ di 14d–14f dan 4,7 kΩ di 14g–19g; kabel hitam tetap dari 14a, dan kabel ECHO tetap di 19f. Di langkah 6.2, tempelkan *probe* merah langsung ke kaki resistor di 14g.

**Hanya baris f yang bebas?** Jadikan belahan a–e kolom 14 sebagai titik tengahnya: pasang kabel pendek dari 14e ke 14f (menyambung ke jalur D35), resistor 10 kΩ dari 14b ke 17b, kabel hitam dari 17a ke rel atas (−) kolom 17, dan resistor 4,7 kΩ dari 14d ke 19d. Kabel ECHO dan kabel merah sementara lalu masuk ke **19a** (bukan 19f), dan di langkah 6.2 ukur di 14a.

**Periksa gelang warnanya dua kali.** Kalau kedua resistor tertukar, pin D35 hanya menerima ±1,6 V — di bawah ambang HIGH yang dijamin — sehingga gemanya bisa tidak terbaca (Konsep 3).

![Ilustrasi meja kerja setelah Praktik 6, dengan kotak perbesaran kolom 13 sampai 21 breadboard atas. Komponen lama digambar pudar. Tambahan baru disorot: resistor 10 kiloohm cokelat-hitam-oranye dari 14e ke 14g menyeberangi parit tengah, kabel hitam pendek dari 14a ke rel atas minus kolom 15, resistor 4,7 kiloohm kuning-ungu-merah dari 14h ke 19h, dan sensor HC-SR04 di luar papan dengan empat kabel jantan–betina: merah VCC ke rel atas plus kolom 26, hitam GND ke rel atas minus kolom 27, putih ECHO ke 19f, dan ungu TRIG turun ke 6e di breadboard bawah, tepat di bawah kaki D15. Di kotak perbesaran, penanda 1 resistor 10 kiloohm, 2 kabel hitam pendek, 3 resistor 4,7 kiloohm, dan 4 kabel putih ECHO di 19f. Label: kolom 14 baris f sampai j adalah jalur D35, titik tengah pembagi; ECHO 5 volt menjadi sekitar 3,4 volt](aset/meja-kerja-hcsr04.png)

#### 6.2 Ukur pembagi tegangannya dulu (hanya di papan asli)

Sebelum HC-SR04 dipasang, kita pura-pura menjadi kaki ECHO yang sedang HIGH: memberi 5 V ke ujung atas pembagi, lalu mengukur hasilnya.

> [!CAUTION]
> Kolom **18**, tepat di kiri kolom 19, adalah kaki **EN**. Hitung kolomnya dari angka yang tercetak di breadboard: kabel merah sementara dan kabel ECHO membawa 5 V dan harus masuk ke kolom **19**.

1. Dengan MB102 mati dan USB tercabut, tancapkan kabel **merah** sementara dari rel atas **(+)**, kolom 22, ke **19f (atas)**.
2. Tancapkan satu kabel cadangan di **14f (atas)**, lubang kosong di jalur D35, dan satu lagi di lubang kosong **rel atas (−)**. Jauhkan ujung bebas keduanya dari rel (+) dan dari kabel merah.
3. Colokkan USB, lalu nyalakan MB102.
4. Putar multimeter ke **V⎓ 20**, lalu tempelkan *probe* merah ke kabel di 14f dan *probe* hitam ke kabel di rel (−).
5. Bacaan yang benar: **sekitar 3,1–3,6 V** (perhitungannya 3,40 V; toleransi resistor dan tegangan adaptor menggesernya sedikit).
   - **Sekitar 1,6 V**: kedua resistor tertukar. Matikan MB102, cabut USB, tukar posisinya, lalu ukur lagi.
   - **Di atas 3,6 V** (bisa ±3,8 V, bisa sampai ±5 V): resistor 10 kΩ atau kabel hitam 14a tidak tersambung. **Segera matikan MB102**, cabut USB, periksa, lalu ukur lagi. Jangan lanjut sebelum angkanya di bawah 3,6 V. (Rangkaian sudah benar, tetapi tetap di atas 3,6 V? Ukur rel atas: adaptormu mungkin lebih dari 5,2 V. Kalau benar begitu, pakai adaptor 5 V lain; jangan lanjut selama angkanya di atas 3,6 V.)
   - **0 V**: kabel merah tidak masuk rel atas (+), MB102 belum menyala, atau resistor 4,7 kΩ tidak sampai ke kolom 19. Matikan MB102 dan cabut USB sebelum membetulkannya.
6. Matikan MB102, cabut USB, lalu **cabut kabel merah sementara** dan kedua kabel cadangan.

#### 6.3 Pasang HC-SR04

Pastikan MB102 masih mati dan USB masih tercabut. Pasang kabel jantan–betina: ujung betina ke kaki HC-SR04, ujung jantan ke breadboard.

| Kaki HC-SR04 | Kabel | Ke | Catatan |
| :--- | :--- | :--- | :--- |
| **VCC** | **merah** | rel atas **(+)**, kolom 26 | 5 V dari MB102 — juga untuk HC-SR04+ dan RCWL-1601 |
| **TRIG** | **ungu** | **6e (bawah)** | tepat di bawah kaki **D15** |
| **ECHO** | **putih** | **19f (atas)** | ke ujung atas resistor 4,7 kΩ, **tidak pernah langsung ke pin** |
| **GND** | **hitam** | rel atas **(−)**, kolom 27 | |

Kabelnya kurang panjang untuk sampai ke tandon nanti? Sambung dua kabel jantan–betina: ujung jantan kabel pertama ditancapkan ke ujung betina kabel kedua.

#### 6.4 Coba ukur jarak di meja

Colokkan USB, lalu nyalakan MB102 (HC-SR04 hanya mendapat listrik saat MB102 menyala). Buat sketsa baru `modul06_jarak_tandon`, tempel kode ini, lalu klik **Upload**:

```cpp
// Modul 6 - Praktik 6: HC-SR04 sebagai pengukur level air tandon
// TRIG di D15. ECHO lewat pembagi tegangan (4,7 kiloohm + 10 kiloohm) ke D35.
// Sensor menghadap ke bawah, di atas tandon (wadah air pompa).

const int PIN_TRIG = 15;          // D15: HC-SR04 TRIG (peta pin kanonik)
const int PIN_ECHO = 35;          // D35: HC-SR04 ECHO, lewat pembagi tegangan
const float JARAK_KOSONG = 20.0;  // cm dari sensor ke dasar tandon (ukur sendiri)
const float JARAK_PENUH = 5.0;    // cm dari sensor ke permukaan air saat tandon penuh (ukur sendiri)

// Mengukur jarak satu kali, dalam cm. Menjawab -1 kalau gemanya tidak kembali.
float ukurJarakCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);  // perintah "berteriak": HIGH selama 10 mikrodetik
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long durasi = pulseIn(PIN_ECHO, HIGH, 30000);  // lama pulsa ECHO; tunggu paling lama 30 ms
  if (durasi == 0) {
    return -1;  // tidak ada gema: terlalu jauh, terhalang, atau kabel lepas
  }
  return durasi / 58.0;  // setiap 58 mikrodetik = 1 cm (bunyi pergi dan pulang)
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  digitalWrite(PIN_TRIG, LOW);
}

void loop() {
  delay(1000);  // ukur sekali setiap detik
  float jarak = ukurJarakCm();
  if (jarak < 0) {
    Serial.println("Tidak ada gema. Periksa kabel dan arah sensor.");
  } else {
    // Rumusnya sama dengan map(jarak, JARAK_KOSONG, JARAK_PENUH, 0, 100), tetapi untuk angka berkoma.
    int persen = (JARAK_KOSONG - jarak) * 100 / (JARAK_KOSONG - JARAK_PENUH);
    int levelAir = constrain(persen, 0, 100);
    Serial.print("jarak=");
    Serial.print(jarak, 1);
    Serial.print(" cm  level_air=");
    Serial.print(levelAir);
    Serial.println(" %");
  }
}
```

Hadapkan sensor ke dinding atau buku, lalu buka Serial Monitor. Untuk sementara, perhatikan angka `jarak` saja; `level_air` baru bermakna setelah dikalibrasi di langkah 6.6.

**Hasilnya** (sensor menghadap buku sekitar 30 cm di depannya):

```text
jarak=30.6 cm  level_air=0 %
jarak=30.4 cm  level_air=0 %
```

Gerakkan tanganmu maju-mundur di depan sensor, lalu cocokkan dengan penggaris: di 10 cm, `jarak` seharusnya terbaca sekitar 10 cm (selisih beberapa milimeter itu wajar). Muncul `Tidak ada gema. …` terus-menerus? Lihat 🚨.

Tiga hal baru di kode itu:

- **`delayMicroseconds(10)`** menunggu 10 **mikro**detik — sepersejuta detik dikalikan sepuluh. `delay()` biasa terlalu kasar untuk pulsa sependek itu.
- **`unsigned long`** adalah bilangan bulat besar yang tidak pernah negatif — cocok untuk menampung lama pulsa dalam mikrodetik.
- **Rumus `level_air`** adalah isi `map()` yang ditulis ulang dengan `float` (Konsep 5). Hasilnya disimpan ke `int` sehingga pecahannya terbuang, lalu dipagari dengan `constrain()`.

#### 6.5 Pasang di atas tandon

1. Matikan MB102 dan cabut USB. **Pindahkan pompa** dari gelas (Modul 5) ke dalam **wadah tandon**, dengan ujung selangnya tetap di gelas atau pot "tanaman". Tuang dulu air gelas lama ke tandon; gelas yang kini kosong menjadi "gelas tanaman" supaya tidak meluap saat disiram. Isi wadah dengan air sampai batas yang kamu anggap **penuh** — sisakan ruang minimal 3 cm di bawah sensor nanti.
2. Buat **jembatan**: letakkan karton tebal (atau penggaris cadangan) melintang di atas mulut wadah, lalu rekatkan kedua ujungnya ke bibir wadah dengan selotip supaya tidak bergeser. Tempelkan HC-SR04 di sisi bawah jembatan itu dengan selotip, **"mata"-nya menghadap ke bawah** dan tidak tertutup apa pun. Pilih posisi yang tidak tepat di atas pompa atau selang karena keduanya juga memantulkan bunyi.
3. Letakkan tandon di nampan, sejauh mungkin dari breadboard, adaptor, dan laptop (sambung kabel kalau perlu).

![Ilustrasi tandon dari samping, tidak sesuai skala: wadah berisi air di atas nampan dengan pompa di dasar sebelah kiri; selang pompa naik lalu turun ke gelas tanaman di kiri wadah. Di atas mulut wadah, karton tebal melintang sebagai jembatan, HC-SR04 ditempel selotip di bawahnya menghadap ke bawah, tidak tepat di atas pompa atau selang. Empat kabel sensor keluar ke kanan menuju meja kerja. Garis putus-putus biru menandai batas penuh. Panah ukur: JARAK_PENUH dari muka sensor ke air saat penuh, JARAK_KOSONG dari muka sensor ke dasar wadah. Catatan: sisakan minimal 3 sentimeter antara sensor dan air, jangan tepat di atas pompa atau selang, wadah lebar minimal 10 sentimeter dengan sensor tegak lurus, dan pompa tidak boleh menyala saat tandon kosong](aset/tandon-hcsr04.png)

#### 6.6 Kalibrasi tandon: penuh dan kosong

1. Colokkan USB, lalu nyalakan MB102. Tunggu sampai permukaan air tenang (riak air membuat angka melompat-lompat).
2. **Penuh.** Catat angka `jarak` saat tandon penuh, misalnya `6.2`. Inilah nilai `JARAK_PENUH`-mu.
3. **Kosong.** Matikan MB102, cabut USB, lalu ciduk air tandon dengan gelas sampai habis tanpa menggeser jembatan (pompanya biarkan di dalam). Colokkan USB, nyalakan MB102, lalu catat `jarak`-nya, misalnya `19.5`. Inilah nilai `JARAK_KOSONG`-mu. Cocokkan dengan penggaris, dari muka sensor (permukaan "mata" yang berlubang) ke dasar wadah: kalau angka sensor lebih pendek daripada hasil penggaris dan selisihnya 2 cm atau lebih, sensor "melihat" pompa atau selang — geser sensornya (langkah 6.5), lalu ukur ulang. Setelah itu, matikan MB102, cabut USB, dan kembalikan airnya — **pompa tidak boleh dinyalakan saat tandon kosong**.
4. Colokkan USB dan nyalakan MB102, lalu ubah konstanta di kode, misalnya `const float JARAK_KOSONG = 19.5;` dan `const float JARAK_PENUH = 6.2;`, dan klik **Upload**.
5. Uji: tandon penuh terbaca ±100 %; ambil air dengan gelas sampai kira-kira separuh, terbaca ±50 %; hampir kosong, terbaca mendekati 0 %.

**Hasilnya** (setelah kalibrasi, airnya diambil sedikit demi sedikit):

```text
jarak=6.3 cm  level_air=99 %
jarak=12.8 cm  level_air=50 %
jarak=17.9 cm  level_air=12 %
```

Catat kedua angka kalibrasi tandonmu di kertas atau HP; di Praktik 9 kamu memindahkannya ke `catatan-kalibrasi.md`.

**Di Wokwi:** pakai [`diagram.json`](kode/modul06_jarak_tandon/diagram.json) Praktik 6. Diagram itu sengaja memuat kedua resistor pembagi supaya rangkaiannya sama dengan di mejamu (Wokwi sendiri tidak membutuhkannya). Di Wokwi, HC-SR04 mengambil daya dari pin VIN sebagai pengganti rel atas 5 V.

1. Jalankan simulasi, lalu klik HC-SR04: muncul jendela `Editing Ultrasonic Distance Sensor` dengan penggeser **Distance** (2–400 cm).
2. Di posisi awal 12 cm, terbaca `jarak=12.1 cm  level_air=52 %` (angka di belakang koma bisa sedikit berbeda, misalnya `12.2`).
3. Geser ke kanan sampai 20 cm atau lebih: `level_air=0 %`. Geser mentok ke kiri (2 cm): `level_air=100 %`.

![Tangkapan layar Wokwi: HC-SR04 di atas papan ESP32 yang menyamping, kaki ECHO turun lewat resistor 4,7 kiloohm tegak ke D35, resistor 10 kiloohm mendatar dari titik tengah ke GND, TRIG memutar lewat ujung kiri papan ke D15 di deretan bawah, VCC ke VIN, dan GND ke deretan bawah. Penanda 1: HC-SR04 diklik, jendela Editing Ultrasonic Distance Sensor terbuka; penanda 2: penggeser Distance di 12 sentimeter; penanda 3: Serial Monitor menampilkan jarak=12.1 cm level_air=52 persen](aset/wokwi-hcsr04.png)

*Tangkapan layar [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), Oktober 2026; dipakai untuk tujuan pendidikan, penanda oleh penulis.*

> ⬆️ **Selesai Praktik 6?** Kembali ke [Konsep 11](#11-kontrak-data-dan-saat-sensor-berbohong) (➡️ di sana akan mengantarmu ke Praktik 7).

### Praktik 7 — Monitor lima sensor, rapi setiap 2 detik (20 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** (atau Wokwi) dan kelima sensor yang sudah terpasang sejak Praktik 1–6, dengan MB102 menyala (PIR dan HC-SR04 butuh 5 V). Tidak ada kabel baru. Konsep yang dipakai: 11 (dan semua konsep sebelumnya).

Kelima sensor kini bekerja sendiri-sendiri. Saatnya menyatukan bacaan kelima sensor itu ke dalam satu formulir `BacaanSensor` yang nama kolomnya persis sesuai kontrak data, lalu mencetaknya rapi setiap 2 detik.

1. Buat sketsa baru `modul06_monitor_lima_sensor` dan tempel kode di bawah ini.
2. **Sebelum mengeklik Upload**, ganti empat angka di bagian `Hasil kalibrasimu` dengan catatanmu dari Praktik 3 dan 6.
3. Colokkan USB, nyalakan MB102, lalu klik **Upload**.

```cpp
// Modul 6 - Praktik 7: monitor lima sensor Node 1, rapi setiap 2 detik
// Semua bacaan masuk ke satu formulir BacaanSensor yang nama kolomnya
// persis sesuai kontrak data (Lampiran A Silabus): suhu, kelembapan, cahaya, tanah, gerak, level_air.
// Library: DHT sensor library by Adafruit 1.4.7 (+ Adafruit Unified Sensor 1.1.15).

#include <DHT.h>

// ---------- Peta pin kanonik (sensor Modul 6) ----------
const int PIN_DHT = 14;    // D14: DHT22
const int PIN_LDR = 36;    // VP: LDR
const int PIN_TANAH = 39;  // VN: sensor tanah kapasitif
const int PIN_PIR = 34;    // D34: PIR
const int PIN_TRIG = 15;   // D15: HC-SR04 TRIG
const int PIN_ECHO = 35;   // D35: HC-SR04 ECHO, lewat pembagi tegangan

// ---------- Hasil kalibrasimu (Praktik 3 dan 6) ----------
const int TANAH_KERING = 3000;    // angka mentah sensor tanah di udara
const int TANAH_BASAH = 1300;     // angka mentah sensor tanah di air
const float JARAK_KOSONG = 20.0;  // cm: sensor ke dasar tandon
const float JARAK_PENUH = 5.0;    // cm: sensor ke permukaan air saat tandon penuh

DHT dht(PIN_DHT, DHT22);

// Formulir data sensor. Nama kolomnya PERSIS sesuai kontrak data (Lampiran A Silabus).
struct BacaanSensor {
  float suhu;      // derajat Celsius; NAN kalau DHT22 gagal dibaca
  int kelembapan;  // persen; -1 kalau DHT22 gagal dibaca
  int cahaya;      // 0 (gelap gulita) sampai 4095 (sangat terang)
  int tanah;       // persen: 0 = kering seperti di udara, 100 = basah seperti di air
  bool gerak;      // true kalau PIR melihat gerakan
  int level_air;   // persen isi tandon; -1 kalau gema HC-SR04 tidak kembali
};

// Rata-rata 20 bacaan analog berturut-turut supaya derau teredam (Konsep 4).
int bacaAnalogRata(int pin) {
  long jumlah = 0;
  for (int i = 0; i < 20; i++) {
    jumlah += analogRead(pin);
    delay(2);
  }
  return jumlah / 20;
}

int bacaCahaya() {
  return 4095 - bacaAnalogRata(PIN_LDR);  // dibalik: makin terang, makin besar
}

int bacaTanahPersen() {
  int persen = map(bacaAnalogRata(PIN_TANAH), TANAH_KERING, TANAH_BASAH, 0, 100);
  return constrain(persen, 0, 100);
}

// Mengukur jarak satu kali, dalam cm. Menjawab -1 kalau gemanya tidak kembali.
float ukurJarakCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long durasi = pulseIn(PIN_ECHO, HIGH, 30000);
  if (durasi == 0) {
    return -1;
  }
  return durasi / 58.0;
}

int bacaLevelAir() {
  float jarak = ukurJarakCm();
  if (jarak < 0) {
    return -1;  // tidak diketahui
  }
  int persen = (JARAK_KOSONG - jarak) * 100 / (JARAK_KOSONG - JARAK_PENUH);
  return constrain(persen, 0, 100);
}

// Mengisi formulir dengan bacaan kelima sensor.
BacaanSensor bacaSensor() {
  BacaanSensor b;
  b.suhu = dht.readTemperature();
  float kelembapan = dht.readHumidity();
  if (isnan(kelembapan)) {
    b.kelembapan = -1;
  } else {
    b.kelembapan = round(kelembapan);  // dibulatkan ke bilangan bulat terdekat
  }
  b.cahaya = bacaCahaya();
  b.tanah = bacaTanahPersen();
  b.gerak = digitalRead(PIN_PIR) == HIGH;
  b.level_air = bacaLevelAir();
  return b;
}

// Mencetak angka, atau "--" kalau nilainya tidak sah (kurang dari 0).
void cetakNilai(int nilai) {
  if (nilai < 0) {
    Serial.print("--");
  } else {
    Serial.print(nilai);
  }
}

void cetakBacaan(BacaanSensor b) {
  Serial.print("suhu=");
  if (isnan(b.suhu)) {
    Serial.print("--");
  } else {
    Serial.print(b.suhu, 1);
  }
  Serial.print(" C  kelembapan=");
  cetakNilai(b.kelembapan);
  Serial.print(" %  cahaya=");
  Serial.print(b.cahaya);
  Serial.print("  tanah=");
  Serial.print(b.tanah);
  Serial.print(" %  gerak=");
  if (b.gerak) {
    Serial.print("ya");
  } else {
    Serial.print("tidak");
  }
  Serial.print("  level_air=");
  cetakNilai(b.level_air);
  Serial.println(" %");
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  digitalWrite(PIN_TRIG, LOW);
  Serial.println("Monitor lima sensor Node 1. Satu baris setiap 2 detik.");
}

void loop() {
  delay(2000);  // juga memenuhi syarat DHT22: paling cepat sekali tiap 2 detik
  BacaanSensor bacaan = bacaSensor();
  cetakBacaan(bacaan);
}
```

**Hasilnya** (satu baris setiap 2 detik; angkamu mengikuti keadaan di rumahmu):

```text
Monitor lima sensor Node 1. Satu baris setiap 2 detik.
suhu=28.4 C  kelembapan=71 %  cahaya=2744  tanah=37 %  gerak=tidak  level_air=64 %
suhu=28.4 C  kelembapan=71 %  cahaya=2751  tanah=37 %  gerak=ya  level_air=64 %
```

Kode ini panjang, tetapi isinya hanya potongan-potongan dari Praktik 1–6 yang ditata ulang:

- **Setiap sensor punya fungsi pembaca sendiri** (`bacaCahaya()`, `bacaTanahPersen()`, `bacaLevelAir()`), yang sudah mengurus derau, kalibrasi, dan pembalikan angka.
- **`bacaSensor()` mengisi satu formulir utuh** dan mengembalikannya — persis pola `bacaSensorPalsu()` di Modul 3, tetapi kali ini dengan bacaan sungguhan.
- **Nilai tidak sah ditandai**, bukan disembunyikan: `kelembapan` dan `level_air` menjadi `-1`, `suhu` tetap `NAN`, dan `cetakBacaan()` mencetak `--` untuk ketiganya. `round()` membulatkan kelembapan ke bilangan bulat terdekat (71,6 menjadi 72) karena kontrak data memakai bilangan bulat.

**Uji "sensor berbohong".** Setiap kali mencabut atau memasang kabel, matikan MB102 dan cabut USB dulu, lalu nyalakan lagi dengan urutan USB dulu, baru MB102:

1. Cabut kabel kuning DHT22 dari 8f: kolom suhu dan kelembapan menjadi `suhu=-- C  kelembapan=-- %`. Pasang kembali.
2. Cabut kabel putih ECHO dari 19f: `level_air=-- %`. Pasang kembali.
3. Matikan MB102 saja (USB tetap tercolok): PIR dan HC-SR04 kehilangan listrik sehingga `level_air=-- %` dan `gerak=tidak`. Sensor yang tidak bertenaga tidak bisa memberi tahu bahwa dirinya mati — ia hanya diam. Nyalakan MB102 lagi.

**Di Wokwi:** pakai [`diagram.json`](kode/modul06_monitor_lima_sensor/diagram.json) dan [`libraries.txt`](kode/modul06_monitor_lima_sensor/libraries.txt) Praktik 7.

1. Jalankan simulasi. Diagram ini lebar; **klik area kosong di panel simulasi, lalu tekan tombol F** di papan ketik supaya seluruh rangkaian terlihat (**-** dan **+** untuk memperkecil dan memperbesar).
2. Klik setiap sensor untuk mengubah nilainya, seperti di Praktik 1–6; potensiometer di diagram ini mulai di posisi "lembap" (±70 %).

Supaya tidak semrawut, kabel daya di diagram gabungan ini digambar sebagai **simbol**: segitiga terbalik (▽) berarti GND, dan panah bertuliskan **VCC** berarti 3,3 V dari papan. Di Wokwi, PIR dan HC-SR04 ikut memakai simbol VCC itu dan tetap bekerja; **di mejamu, keduanya tetap diberi 5 V dari rel atas.**

> ➡️ **Selesai Praktik 7?** Lanjut langsung ke [Praktik 8](#praktik-8--siram-otomatis-dan-lampu-otomatis-30-menit).

### Praktik 8 — Siram otomatis dan lampu otomatis (30 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** (atau Wokwi) dan seluruh meja kerja: kelima sensor, pompa di dalam tandon (Praktik 6), dan relay lampu di D32 dari Modul 5. Siapkan juga gelas air untuk sensor tanah, serta tutup botol atau gelas kecil yang tidak tembus cahaya untuk menutup LDR. Konsep yang dipakai: 5 dan 11.
>
> ⭐ **Wajib** — syarat lulus kedua: pompa menolak menyala saat tandon kosong.

Dua aturan otomatis pertama Node 1:

- **Siram otomatis.** Kalau tanah lebih kering daripada 30 % (angka `tanah_siram` di Lampiran A), nyalakan pompa selama 3 detik — **tetapi** periksa tandon dulu tepat sebelum pompa menyala. Kalau isi tandon di bawah 20 %, atau tidak terbaca, **tolak**. Sesudah mencoba (berhasil atau ditolak), tunggu 15 laporan (±30 detik) sebelum mencoba lagi supaya air sempat meresap dan Serial Monitor tidak dibanjiri pesan.
- **Lampu otomatis.** Kalau PIR melihat gerakan **dan** ruangan gelap, nyalakan relay lampu. Kalau sudah sepi, padamkan lagi.

#### 8.1 Unggah sketsanya

Sketsa ini adalah Praktik 7 ditambah aturan otomatis, jadi paling praktis disalin utuh:

1. Buat sketsa baru `modul06_siram_lampu_otomatis`.
2. Klik kanan tautan [`modul06_siram_lampu_otomatis.ino`](kode/modul06_siram_lampu_otomatis/modul06_siram_lampu_otomatis.ino) → **Buka di tab baru**, klik **Copy raw file**, lalu tempel ke sketsa barumu.
3. Ganti empat angka kalibrasi (Praktik 3 dan 6) dan, kalau perlu, `AMBANG_GELAP` (Praktik 1.4) dengan catatanmu.
4. Colokkan USB, nyalakan MB102, lalu klik **Upload**.

Bagian baru di sketsa itu ada di bawah dua tanda `BARU di Praktik 8`, ditambah dua konstanta pin di peta pin (`PIN_POMPA` dan `PIN_RELAY_LAMPU`), dua variabel keadaan (`lampuMenyala` dan `sisaJedaSiram`), beberapa baris di `setup()` (pin pompa dan relay lampu disiapkan, lalu lampu langsung dimatikan) dan dua panggilan baru di akhir `loop()`: `siramOtomatis(bacaan);` dan `lampuOtomatis(bacaan);`. Yang terpenting adalah fungsi pompanya:

```cpp
// Pompa hanya menyala kalau air tandon cukup. Tandon diukur tepat sebelum pompa menyala.
void jalankanPompa(int detik) {
  detik = constrain(detik, 1, 10);  // batas aman: 1-10 detik
  delay(60);  // lembar data HC-SR04: jeda minimal 60 ms sejak ukuran sebelumnya (Konsep 10)
  int levelAir = bacaLevelAir();
  if (levelAir < LEVEL_AIR_MINIMUM) {  // -1 (tidak terbaca) juga lebih kecil, jadi ikut ditolak
    Serial.print("pompa DITOLAK: air tandon ");
    if (levelAir < 0) {
      Serial.println("tidak terbaca");
    } else {
      Serial.print("tinggal ");
      Serial.print(levelAir);
      Serial.println(" %");
    }
    return;
  }
  Serial.print("pompa menyala ");
  Serial.print(detik);
  Serial.println(" detik...");
  digitalWrite(PIN_POMPA, HIGH);
  delay(detik * 1000);  // untuk sementara masih memblokir; Modul 8 membuatnya tanpa delay()
  digitalWrite(PIN_POMPA, LOW);
}

void siramOtomatis(BacaanSensor b) {
  if (sisaJedaSiram > 0) {  // baru saja mencoba menyiram: tunggu dulu
    sisaJedaSiram--;
    return;
  }
  if (b.tanah < AMBANG_TANAH_SIRAM) {
    Serial.print("Tanah kering (");
    Serial.print(b.tanah);
    Serial.print(" %): ");
    jalankanPompa(DETIK_SIRAM);  // pengaman tandon ada di dalam jalankanPompa()
    sisaJedaSiram = JEDA_SIRAM;  // berhasil atau ditolak, jangan coba lagi selama kira-kira 30 detik
  }
}

void lampuOtomatis(BacaanSensor b) {
  bool gelap = b.cahaya < AMBANG_GELAP;
  if (b.gerak && gelap && !lampuMenyala) {
    Serial.println("Ada gerakan di tempat gelap: lampu menyala.");
    aturLampu(true);
  }
  if (!b.gerak && lampuMenyala) {
    Serial.println("Sepi: lampu padam.");
    aturLampu(false);
  }
}
```

Perhatikan tiga keputusan rancangan:

- **Pengaman tandon ada di dalam `jalankanPompa()`**, bukan di aturan siram. Jadi, perintah dari mana pun untuk menyalakan pompa — aturan otomatis hari ini, perintah Serial di Node 1, atau perintah lewat MQTT di Modul 11 — tetap diperiksa. Pompa mini yang berputar tanpa air cepat rusak.
- **Tandon diukur ulang tepat sebelum pompa menyala**, 60 ms setelah ukuran terakhir (lembar data HC-SR04, Konsep 10). Ini penting terutama untuk perintah manual dan, kelak, perintah dari internet yang bisa datang kapan saja.
- **Satu `if` menangkal dua bahaya**: isi tandon rendah dan isi tandon tidak terbaca (`-1`), seperti dijelaskan di Konsep 11.

#### 8.2 Uji siram otomatis

1. **Tandon penuh, tanah kering.** Gantung sensor tanah di udara (kering, 0 %). Dalam 2 detik muncul `Tanah kering (0 %): pompa menyala 3 detik...`, dan pompa mengalirkan air ke gelas tanaman. Sekitar 30 detik kemudian, aturan mencoba lagi karena sensor masih di udara. Setelah melihat satu atau dua kali siraman, **celupkan sensor ke gelas air** (100 %): siraman berhenti.
2. **⭐ Tandon kosong.** Matikan MB102, cabut USB, lalu ciduk air tandon dengan gelas sampai habis tanpa menggeser jembatan (pompanya tetap di dalam tandon yang kini kosong). Angkat sensor dari gelas air, keringkan dengan lap, dan biarkan di udara; lalu colokkan USB dan nyalakan MB102. Muncul `Tanah kering (0 %): pompa DITOLAK: air tandon tinggal 0 %` — angka persennya boleh sedikit di atas nol — dan **pompa diam**. Pesan itu berulang setiap ±30 detik selama tandon kosong. **Inilah syarat lulus kedua.** Kalau yang muncul lebih dulu `pompa DITOLAK: air tandon tidak terbaca`, berarti MB102 baru menyala setelah pembacaan pertama; tunggu ±30 detik sampai pesan `tinggal 0 %` muncul.
3. **Isi lagi tandonnya.** Dalam ±30 detik, aturan mencoba lagi dan kali ini pompa menyala. Celupkan sensor tanah ke gelas air supaya siraman berhenti.
4. **Tandon tidak terbaca.** Matikan MB102, cabut USB, lalu cabut kabel putih ECHO dari 19f. Colokkan USB dan nyalakan MB102 lagi, dengan sensor tanah di udara: muncul `pompa DITOLAK: air tandon tidak terbaca`. Matikan MB102, cabut USB, lalu pasang kembali kabelnya dan celupkan lagi sensor tanah ke gelas air.

**Hasilnya** (potongan Serial Monitor saat uji 1 dan 2):

```text
suhu=28.4 C  kelembapan=71 %  cahaya=2744  tanah=0 %  gerak=tidak  level_air=96 %
Tanah kering (0 %): pompa menyala 3 detik...
…
suhu=28.5 C  kelembapan=70 %  cahaya=2740  tanah=0 %  gerak=tidak  level_air=0 %
Tanah kering (0 %): pompa DITOLAK: air tandon tinggal 0 %
```

#### 8.3 Uji lampu otomatis

Lampu otomatis butuh dua syarat sekaligus: gelap **dan** ada gerakan. Supaya mudah diuji, kita "menggelapkan" LDR saja, bukan seluruh ruangan.

1. **Nyalakan lagi.** Colokkan USB, lalu nyalakan MB102. Tunggu ±1 menit sampai PIR selesai pemanasan.
2. **Tutup LDR** dengan tutup botol atau gelas kecil yang tidak tembus cahaya: angka `cahaya` turun di bawah ambang gelap.
3. **Lambaikan tangan** di depan PIR: relay lampu berbunyi "klik" dan muncul `Ada gerakan di tempat gelap: lampu menyala.` (Kalau kamu membuat lampu LED di Tantangan Tingkat 3 Modul 5, LED itu ikut menyala.)
4. **Diam**: ±5 detik kemudian (waktu Tx PIR) muncul `Sepi: lampu padam.` dan relay melepas.
5. **Angkat penutup LDR**, lalu lambaikan tangan lagi: kali ini lampu **tidak** menyala karena ruangan terang.

Selama satu menit pertama setelah MB102 dinyalakan, PIR masih dalam masa pemanasan dan bisa melaporkan gerakan palsu sehingga lampu bisa menyala sendiri sebentar. Itu wajar.

**Di Wokwi:** pakai [`diagram.json`](kode/modul06_siram_lampu_otomatis/diagram.json) dan [`libraries.txt`](kode/modul06_siram_lampu_otomatis/libraries.txt) Praktik 8. Jalankan simulasi, lalu klik area kosong di panel simulasi dan tekan **F** supaya seluruh rangkaian terlihat. LED berlabel **pompa** mewakili pompa, dan relay dengan LED berlabel **lampu** mewakili relay lampu.

**Uji tolak:**

1. Klik HC-SR04, lalu **lebih dulu** geser **Distance** ke kanan sampai 20 cm atau lebih (`level_air=0 %`).
2. Klik potensiometer, lalu tekan **End** supaya mentok ke kanan (`tanah=0 %`). Muncul `Tanah kering (0 %): pompa DITOLAK: air tandon tinggal 0 %`, dan LED pompa tetap padam. (Kalau urutannya dibalik, pompa sempat menyala sekali karena tandon masih berisi — persis seperti di papan asli.)
3. Geser **Distance** kembali ke kiri sampai sekitar 12 cm (di bawah 17 cm): sekitar 30 detik kemudian muncul `pompa menyala 3 detik...`, dan LED pompa menyala.

**Uji lampu:**

1. Seret kenop potensiometer ke tengah (`tanah` di atas 30 %) supaya siram otomatis berhenti.
2. Klik modul LDR, lalu geser penggeser lux mentok ke kiri (gelap).
3. Klik PIR, lalu klik **Simulate motion**: LED lampu menyala, dan ±5 detik kemudian padam.

![Tangkapan layar Wokwi rangkaian Praktik 8 yang diperkecil dengan tombol F, lalu dipotong dan diperbesar; label putih nama komponen ditambahkan penulis. Di atas, jendela Editing Ultrasonic Distance Sensor dengan Distance 20 sentimeter (penanda 1). Di bawahnya, papan ESP32 menyamping di tengah bawah; di kiri DHT22 (D14), LED biru muda berlabel LED = pompa yang padam (penanda 4), serta relay dengan LED kuning berlabel relay + LED = lampu; di kanan PIR (D34), potensiometer pengganti sensor tanah yang diputar mentok ke kanan (penanda 2), modul LDR (VP), dan HC-SR04 (tandon). Paling bawah, Serial Monitor dengan baris Tanah kering (0 persen): pompa DITOLAK: air tandon tinggal 0 persen (penanda 3), dan di sampingnya keterangan penanda 1 sampai 4](aset/wokwi-siram-ditolak.png)

*Tangkapan layar [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), Oktober 2026; dipakai untuk tujuan pendidikan, penanda oleh penulis.*

> ➡️ **Selesai Praktik 8?** Lanjut ke [Praktik 9](#praktik-9--simpan-ke-github-15-menit).

### Praktik 9 — Simpan ke GitHub (15 menit)

> 🖥️ **Alat yang dipakai:** **Arduino IDE**, **VS Code** (dari Modul 4), kamera HP, dan **GitHub Desktop** (dari Modul 3). Konsep yang dipakai: tidak ada konsep baru.

1. **Simpan sketsa ke repositori.** Sudah menyimpan langsung ke folder `modul-06` sejak awal (kotak **Tip** di awal bagian Praktik)? Lewati langkah ini. Kalau belum, buka sketsanya satu per satu (**File → Sketchbook**), lalu pilih **File → Save As…** dan simpan ke **Documents → GitHub → belajar-iot → modul-06** (buat dulu folder `modul-06` dengan **New folder** saat menyimpan sketsa pertama). Yang wajib ada: `modul06_kalibrasi_tanah`, `modul06_jarak_tandon`, dan `modul06_siram_lampu_otomatis`.
2. **Tulis catatan kalibrasimu.** Di VS Code, buka folder `belajar-iot` (**File → Open Folder…**). Di panel Explorer, klik folder `modul-06` dulu supaya file baru masuk ke sana, lalu klik ikon **New File…** dan beri nama `catatan-kalibrasi.md`. Isi dengan angka-angkamu, misalnya:

   ```markdown
   # Catatan kalibrasi sensor (Modul 6)

   | Sensor | Keadaan | Angka |
   | --- | --- | --- |
   | LDR (`cahaya`) | lampu kamar menyala | 2750 |
   | LDR (`cahaya`) | lampu kamar padam | 300 |
   | Sensor tanah (`mentah`) | di udara = KERING | 2948 |
   | Sensor tanah (`mentah`) | di air = BASAH | 1352 |
   | HC-SR04 (`jarak`) | tandon penuh = JARAK_PENUH | 6,2 cm |
   | HC-SR04 (`jarak`) | tandon kosong = JARAK_KOSONG | 19,5 cm |
   ```

   Simpan dengan **Ctrl + S**. Catatan ini berguna: kalau suatu hari kamu memasang sensor pengganti, kamu tahu angka mana yang harus diukur ulang.
3. **Foto rakitanmu.** Ambil satu foto dari atas: kedua breadboard, kelima sensor, dan tandon harus terlihat. Pastikan tidak ada barang pribadi yang ikut terfoto. Pindahkan foto itu ke laptop (lewat kabel data, aplikasi berbagi, atau surel ke dirimu sendiri), ubah namanya menjadi **`meja-kerja-sensor.jpg`**, lalu salin ke folder `modul-06` (di GitHub Desktop, **Repository → Show in Explorer** membuka folder repositori yang benar; macOS: **Show in Finder**).
4. Di GitHub Desktop, pastikan kotak **Current repository** bertuliskan **belajar-iot**. Tab **Changes** berisi file-file baru di `modul-06`. Pengguna macOS: hilangkan centang `.DS_Store` kalau muncul.
5. Isi **Summary** dengan `Modul 6: lima sensor, kalibrasi, siram dan lampu otomatis`, klik **Commit … to main**, lalu **Push origin**.
6. Klik **Repository → View on GitHub** dan buka folder `modul-06`: sketsa, catatan, dan fotomu sudah ada di sana.

Tanpa GitHub Desktop? Pakai jalur pengganti di catatan akhir [Modul 4 Praktik 10](../../fase-0-fondasi/modul-04-javascript-nodejs/README.md#praktik-10--simpan-ke-github-checkpoint-fase-0-15-menit).

> ➡️ **Sesudah Praktik 9:** kerjakan [🧩 Tantangan mandiri](#-tantangan-mandiri) (minimal Tingkat 1) dan [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini) — di sana kelima sensor dan kedua aturan otomatis masuk ke Node 1 — lalu tutup dengan [📝 Kuis](#-kuis-5-soal) dan [✅ Checklist kelulusan](#-checklist-kelulusan-modul-6). Bagian 🚨 dan 🔬 di antaranya cukup dibuka saat perlu.

---
## 🚨 Kalau Tidak Jalan?

Minggu ini, masalah yang paling sering muncul bukan di kode, melainkan di **kabel yang salah lubang** dan **sensor yang belum diberi listrik**. Dua kebiasaan sebelum membongkar apa pun: **matikan MB102 dan cabut USB sebelum mengubah kabel**, dan **ubah satu hal saja, lalu uji lagi**. **Sedang macet? Lewati tabel di bawah** — daftar gejala (judul-judul lipat yang bisa diklik) ada tepat setelahnya. Tabel ini merangkum hal yang sering ditemui di tutorial lain, tetapi berbeda di kurikulum ini.

| Yang sering ditemui di tutorial lain | Yang benar untuk kurikulum ini | Kenapa |
| :--- | :--- | :--- |
| Sensor analog di GPIO 2, 4, 12–15, atau 25–27 | Hanya GPIO 32–39 (ADC1); di Node 1: VP dan VN | Pin-pin itu milik ADC2, yang tidak bisa dipakai saat WiFi menyala (mulai Modul 10). |
| `map(nilai, 0, 1023, …)` atau `analogReadResolution(10)` | Biarkan 12 bit: `0`–`4095` | Kebiasaan Arduino Uno (10 bit). Di ESP32, angka 1023 membuat persentase meleset jauh. |
| ECHO HC-SR04 langsung ke pin ESP32 | ECHO lewat pembagi 4,7 kΩ + 10 kΩ | ECHO HC-SR04 setinggi tegangan catunya (5 V); batas pin ESP32 3,6 V. |
| Modul DHT22 diberi 5 V "supaya stabil" | 3,3 V dari rel bawah | Resistor *pull-up* di modul ikut 5 V sehingga pin D14 menerima 5 V. |
| `DHTesp` (**DHT sensor library for ESPx**) atau library DHT lain | **DHT sensor library by Adafruit** 1.4.7 | Nama fungsinya berbeda (`getTemperature()` dan seterusnya); kode modul ini memakai `readTemperature()` dan `readHumidity()`. |
| Sensor tanah dengan dua kaki logam telanjang | Sensor **kapasitif** v1.2/v2.0 | Kaki logam yang dialiri arus cepat berkarat di tanah basah. |
| DHT22 dibaca berkali-kali di `loop()` tanpa jeda | Paling cepat sekali setiap 2 detik | Lebih cepat daripada itu, library mengembalikan bacaan lama. |
| `pulseIn(PIN_ECHO, HIGH)` tanpa batas waktu | `pulseIn(PIN_ECHO, HIGH, 30000)` | Tanpa batas waktu, `pulseIn()` menunggu sampai 1 detik kalau ECHO tidak pernah naik (kabel lepas, sensor tanpa listrik); kalau gemanya tidak kembali, ia menjawab pulsa ±38 ms dari sensor — jarak palsu ±650 cm. |
| PIR langsung dipercaya begitu dinyalakan | Tunggu pemanasan ±1 menit | Menit pertama bisa berisi gerakan palsu. |

<details>
<summary><b><code>Build failed!</code> / <code>Compilation error</code> — pesan error minggu ini</b></summary>

Aturannya tetap sama dengan Modul 3: **lihat nomor baris**, betulkan **error pertama** saja, lalu kompilasi ulang.

| Pesan (potongan) | Artinya | Obatnya |
| :--- | :--- | :--- |
| `fatal error: DHT.h: No such file or directory` | Library DHT belum terpasang. | Praktik 4.1. Di Wokwi, isi `libraries.txt` dengan dua baris dari folder praktik; jangan mengandalkan tombol **INSTALL "DHT SENSOR LIBRARY" LIBRARY** yang ditawarkan karena versinya tidak dikunci. |
| `fatal error: Adafruit_Sensor.h: No such file or directory` | Library pendamping **Adafruit Unified Sensor** belum terpasang (biasanya karena mengeklik **INSTALL WITHOUT DEPENDENCIES**). | Cari **Adafruit Unified Sensor** di Library Manager dan pasang versi 1.1.15. |
| `'DHT' does not name a type`, disusul `'dht' was not declared in this scope` | Baris `#include <DHT.h>` hilang atau salah ketik. | Tambahkan `#include <DHT.h>` di bagian paling atas sketsa. |
| `'struct BacaanSensor' has no member named 'levelAir'; did you mean 'level_air'?` | Nama kolom `struct` salah ketik. | Ikuti kontrak data huruf demi huruf: `level_air`, dengan garis bawah (Konsep 11). Kompiler bahkan menyarankan nama yang benar. |

</details>

<details>
<summary><b>LDR: angkanya selalu <code>4095</code>, selalu <code>0</code>, atau melompat-lompat</b></summary>

Ingat susunannya: 3,3 V → 10 kΩ → **kolom 34** → LDR → GND, dan kolom 34 → 17f (VP).

- **`mentah` selalu `4095`** (`cahaya` selalu `0`), apa pun cahayanya: LDR tidak tersambung sehingga titik tengah hanya ditarik resistor 10 kΩ ke 3,3 V. Periksa kedua kaki LDR di 34i dan 36i, serta kabel hitam 36j.
- **`mentah` selalu `0`** (`cahaya` selalu `4095`): ujung atas pembagi tidak mendapat 3,3 V. Periksa kabel oranye 30j dan resistor 30g–34g. USB sudah tercolok?
- **Angkanya melompat-lompat tanpa sebab**, bahkan saat LDR ditutup: pin VP mengambang. Kabel abu-abu tidak masuk ke kolom 34 (bawah) atau ke **17f (atas)** — kolom 17 adalah kaki VP; kolom 16 adalah VN.
- **Makin terang, `mentah` makin besar**: posisi LDR dan resistor 10 kΩ tertukar. Rangkaiannya tetap aman; pindahkan supaya angkanya sama dengan Wokwi dan kode modul ini.
- **Angkanya hanya berubah sedikit**: resistornya mungkin bukan 10 kΩ. Periksa gelangnya: cokelat-hitam-oranye.

</details>

<details>
<summary><b>Sensor tanah: angka udara dan air hampir sama, selalu <code>0</code>/<code>4095</code>, atau bergeser pelan-pelan</b></summary>

- **Selisih udara dan air kurang dari 500**: chip pewaktunya kemungkinan NE555 (lihat tulisan pada chip) atau resistor 1 MΩ di jalur keluarannya tidak tersambung (Konsep 6). Coba sensor kedua dari kit.
- **Selalu `0` atau selalu `4095`**: kabel AOUT tidak sampai ke 26h, kabel hijau 26j → 16f bergeser, jumper hijau dan oranye tertukar (AOUT harus ke 26h dan VCC ke 28h — keduanya memang bersilangan), atau VCC dan GND sensor tertukar. **Kalau tertukar, segera cabut USB** (matikan MB102 dulu kalau menyala); sensor bisa rusak.
- **Angka berubah saat kamu memegang bagian atas sensor**: tanganmu ikut menjadi "kapasitor". Pegang sensor di kabelnya, atau letakkan sensornya.
- **Angka bergeser pelan-pelan selama berhari-hari**: tepi papan menyerap air. Keringkan, lalu olesi tepinya dengan cat kuku bening (Konsep 6).
- **`tanah` 100 % padahal tanahnya baru disiram sedikit**: sensor terbenam melewati garis batas, atau ada genangan air di sekitarnya. Benamkan hanya sampai garis.

</details>

<details>
<summary><b>DHT22: <code>Gagal membaca DHT22!</code> terus-menerus, atau angkanya aneh</b></summary>

- **Periksa kabelnya**: DATA ke **8f (atas)** — kolom 8 adalah D14; VCC ke rel bawah (+); GND ke rel bawah (−). Tulisan kaki modulmu sudah dicocokkan, bukan sekadar urutan di gambar?
- **Pin di kode** harus `14`, dan jenisnya `DHT22`.
- **Sensormu DHT22 "telanjang" berkaki empat** (tanpa papan modul)? Kaki dihitung dari kiri dengan kisi sensor menghadapmu: kaki 1 = VCC, kaki 2 = DATA, kaki 3 tidak dipakai, kaki 4 = GND. Kamu juga perlu menambah resistor 10 kΩ dari DATA ke 3,3 V sebagai *pull-up* (dua resistor 10 kΩ dari daftar alat sudah terpakai di Praktik 1 dan 6; ambil satu lagi dari paket resistormu). Modul tiga kaki sudah membawanya.
- **Suhu selalu 2–3 °C lebih tinggi** daripada termometer ruangan: sensor terlalu dekat dengan papan ESP32 atau MB102 yang hangat. Jauhkan.
- **Sensormu biru (DHT11)?** Dengan kode `DHT22`, DHT11 biasanya tidak menjawab sama sekali (`Gagal membaca DHT22!` terus) atau memberi angka mustahil (suhu ratusan derajat, kelembapan di atas 100 %). Ganti `DHT22` di kode dengan `DHT11`. Sebaliknya, kode `DHT11` dengan DHT22 putih membuat suhu terbaca sekitar 1–2 °C — kembalikan ke `DHT22`.
- **Kelembapan macet di 99,9 %**: ada embun di dalam sensor, misalnya karena terlalu lama diembus napas. Biarkan sensor mengering beberapa menit.

</details>

<details>
<summary><b>PIR: selalu HIGH, tidak pernah HIGH, atau "melihat hantu"</b></summary>

- **Tidak pernah HIGH**: MB102 belum dinyalakan (PIR butuh 5 V dari rel atas), kabel OUT tidak masuk ke **15f (atas)**, atau VCC dan GND tertukar. Periksa juga kenop Sx yang mungkin terputar ke jangkauan paling pendek.
- **Selalu HIGH**: masih pemanasan (tunggu semenit penuh), kenop Tx di waktu paling lama (sampai 5 menit), atau PIR menghadap benda yang bergerak atau berubah panas — tirai yang tertiup angin, kipas, embusan AC, atau sinar matahari yang berpindah.
- **Kadang HIGH sendiri walaupun tidak ada orang**: modul PIR peka terhadap gangguan radio. Jauhkan PIR minimal 20 cm dari antena ESP32 (bagian papan yang bergaris zigzag) dan dari kabel-kabel panjang.
- **Tidak mendeteksi orang yang duduk diam**: memang begitu cara PIR bekerja (Konsep 9). PIR mendeteksi gerakan, bukan kehadiran.

</details>

<details>
<summary><b>HC-SR04: <code>Tidak ada gema</code> terus, angkanya melompat, atau jaraknya salah</b></summary>

- **`Tidak ada gema` terus-menerus**:
  - MB102 belum dinyalakan; HC-SR04 butuh 5 V dari rel atas.
  - Kabel ECHO tidak masuk ke **19f**, kabel TRIG tidak masuk ke **6e (bawah)**, atau VCC dan GND tertukar.
  - Kedua resistor pembagi tertukar: pin D35 hanya menerima ±1,6 V, di bawah ambang HIGH yang dijamin. Ukur seperti Praktik 6.2.
  - Kabel merah sementara Praktik 6.2 masih tertancap di 19f sehingga ECHO tersambung langsung ke 5 V. Matikan MB102, cabut USB, lalu cabut kabel itu.
  - Benda terlalu jauh (lebih dari 4 m), terlalu dekat (kurang dari 2 cm), miring, atau lembut (kain, busa).
- **Angkanya melompat-lompat** (misalnya `12.3`, `47.1`, `12.4`): gema memantul dari dinding wadah yang sempit, dari pompa atau selang, atau permukaan air sedang beriak. Pakai wadah yang lebih lebar, letakkan sensor di tengah dan tegak lurus menghadap air, lalu tunggu sampai air tenang.
- **Selalu terbaca 2–3 cm**: ada sesuatu tepat di depan "mata" sensor, misalnya selotip atau tepi jembatan karton.
- **Jaraknya normal, tetapi pembagi belum pernah diukur?** Tanpa resistor 10 kΩ, sensor tetap "bekerja" padahal D35 menerima lebih dari 3,6 V. Ukur seperti Praktik 6.2.
- **`level_air` selalu meleset beberapa persen**: salah satu angka kalibrasi diambil dari penggaris, bukan dari `jarak` di Serial Monitor, atau jembatannya bergeser. Ulangi Praktik 6.6 dan pakai angka `jarak` untuk keduanya.

</details>

<details>
<summary><b>Pompa tidak menolak walaupun tandon kosong, atau menolak terus walaupun penuh</b> (penting!)</summary>

- **Tidak menolak walaupun tandon kosong** — berbahaya karena pompa bisa berputar tanpa air:
  - `JARAK_KOSONG` terlalu besar. Misalnya, dasar wadah sebenarnya 19,5 cm, tetapi kamu menulis 30: tandon kosong terbaca (30 − 19,5) ÷ (30 − 6,2) × 100 ≈ 44 % sehingga lolos pemeriksaan. Ukur ulang (Praktik 6.6).
  - Sensor melihat pompa atau selang, bukan dasar wadah, sehingga jaraknya terbaca lebih pendek dan tandon dikira berisi. Geser sensor menjauhi pompa.
  - `JARAK_KOSONG` dan `JARAK_PENUH` **tertukar**: tandon kosong justru terbaca ±100 %. `JARAK_KOSONG` harus angka yang lebih besar.
- **Menolak terus walaupun penuh**:
  - Pesannya `tidak terbaca`: masalah HC-SR04 (lihat bagian di atas).
  - Pesannya `tinggal 0 %`: `JARAK_KOSONG` dan `JARAK_PENUH` tertukar (berbahaya, lihat di atas), `JARAK_KOSONG` lebih kecil daripada jarak air saat penuh, atau permukaan air kurang dari 3 cm dari sensor.
- **Pompa menyala setiap 30 detik tanpa henti**: sensor tanah masih menggantung di udara (selalu 0 %). Celupkan ke gelas air atau benamkan ke tanah yang basah.

</details>

<details>
<summary><b>Lampu otomatis tidak pernah menyala, atau tidak mau padam</b></summary>

- **Tidak pernah menyala**: angka `cahaya` saat LDR ditutup masih di atas `AMBANG_GELAP`. Lihat angkanya di Serial Monitor, lalu naikkan ambangnya (Praktik 1.4). Periksa juga PIR (bagian di atas) dan kabel relay lampu dari Modul 5 (IN1 → 13f). Kenop Tx PIR yang terlalu singkat juga bisa membuat gerakan terlewat: Node 1 hanya melihat PIR setiap ±2 detik, jadi putar Tx sedikit searah jarum jam.
- **Tidak mau padam**: PIR masih melihat gerakan (kenop Tx terlalu lama, atau ada benda bergerak di depannya). Lampu hanya padam setelah PIR kembali LOW.
- **Relay berbunyi "klik", tetapi lampu LED-mu tidak menyala**: periksa rangkaian lampu di Tantangan Tingkat 3 Modul 5. Tanpa rangkaian itu, bunyi "klik" relay sudah cukup sebagai tanda.

</details>

<details>
<summary><b>Serial Plotter: kosong, garisnya aneh, atau muncul <code>value 1</code></b></summary>

- **Kosong**: kecepatan di pojok kanan bawah jendela Serial Plotter bukan **115200 baud**, atau port belum dipilih.
- **Muncul garis bernama `value 1`, `value 2`, …**: sketsa mencetak kalimat biasa, dan Serial Plotter menganggap setiap kata sebagai garis baru. Pakai sketsa Praktik 2 apa adanya, dan jangan menambahkan `Serial.println("…")` berisi kalimat.
- **Muncul garis aneh tepat setelah papan menyala ulang atau selesai diunggah**: pesan *boot* ESP32 ikut tergambar. Klik ikon hapus (tempat sampah) atau tutup lalu buka lagi jendelanya.
- **Garisnya tampak bergelombang besar padahal angkanya hampir sama**: Serial Plotter memperbesar grafik otomatis. Baca angka di sumbu kirinya (Praktik 2.3).
- **Nama garis terpotong atau tergabung**: nama di depan titik dua tidak boleh berisi spasi. `mentah:1342` benar; `nilai mentah:1342` salah.

</details>

<details>
<summary><b>Khusus Wokwi</b></summary>

- **Mengeklik sensor tidak memunculkan jendelanya**: jendela sensor lain sedang terbuka. Tutup dulu dengan tanda **✕**, lalu klik lagi sensornya.
- **Sebagian rangkaian terpotong di luar layar**: klik area kosong di panel simulasi, lalu tekan **F** di papan ketik. Tombol **-** dan **+** memperkecil dan memperbesar.
- **Angka Wokwi tidak bergoyang sama sekali**: memang begitu; Wokwi tidak menyimulasikan derau. Pakai `DERAU_BUATAN` di Praktik 2.
- **`analogReadMilliVolts()` di Wokwi tidak cocok dengan perhitunganmu**: misalnya `mentah` `1001` dilaporkan sebagai 984 mV, padahal tegangan di diagram ±0,81 V. Wokwi menghitungnya dengan cara yang berbeda. Di papan asli, fungsi ini justru lebih tepat daripada perkiraan kasar (🔬).
- **Diagram gabungan memakai simbol ▽ dan VCC**: segitiga = GND, VCC = 3,3 V dari papan. PIR, HC-SR04, relay, dan servo di Wokwi memakai simbol itu juga; di mejamu, keempatnya tetap mendapat 5 V dari rel atas (MB102).
- **LED kecil berlabel LED1 di modul relay Wokwi menyala terbalik**: abaikan, sama seperti di Modul 5.

</details>

## 🔬 Bedah Teknis (opsional)

Bagian ini untuk yang penasaran "di balik layar". Boleh dilewati tanpa mengganggu modul berikutnya. Klik judulnya untuk membuka.

<details>
<summary><b>Mengoreksi penggaris ADC yang melengkung dengan <code>analogReadMilliVolts()</code></b></summary>

Setiap chip ESP32 diukur di pabrik, dan hasil pengukurannya disimpan di dalam chip itu sendiri (di bagian memori khusus bernama eFuse). Fungsi **`analogReadMilliVolts(pin)`** memakai data itu untuk meluruskan penggaris ADC, lalu langsung menjawab dalam **milivolt** (1 V = 1.000 mV). Hasilnya jauh lebih dekat dengan angka multimeter daripada perkiraan kasar `mentah × 3,3 ÷ 4095`.

**Coba (hanya di papan asli):** unggah sketsa ini dengan rangkaian LDR Praktik 1, lalu bandingkan angka `kasar` dan `terkoreksi` dengan multimeter di **34j** (cara Praktik 1.2; lubang 34h sudah dipakai kapasitor), dalam beberapa keadaan cahaya:

```cpp
// Bonus Modul 6: perkiraan kasar vs analogReadMilliVolts() di VP (GPIO 36)
void setup() {
  Serial.begin(115200);
}

void loop() {
  int mentah = analogRead(36);
  int kasar = mentah * 3300 / 4095;        // "penggaris lurus", dalam milivolt
  int koreksi = analogReadMilliVolts(36);  // diluruskan dengan data kalibrasi pabrik
  Serial.print("mentah=");
  Serial.print(mentah);
  Serial.print("  kasar=");
  Serial.print(kasar);
  Serial.print(" mV  terkoreksi=");
  Serial.print(koreksi);
  Serial.println(" mV");
  delay(500);
}
```

Biasanya angka `terkoreksi` hanya berselisih beberapa puluh milivolt dari multimeter, sedangkan angka `kasar` bisa meleset sampai ratusan milivolt. Kapan ini penting? Saat yang ingin kamu ketahui memang **tegangannya**, misalnya tegangan baterai Node 2 kelak (pin VP Node 2 dicadangkan untuk itu di `PETA-PIN.md`). Untuk sensor yang dikalibrasi terhadap keadaan nyata — LDR, sensor tanah — angka mentah sudah cukup karena kelengkungan penggaris ikut "terkalibrasi".

Ingat juga dua batas ini: di bawah ±0,15 V dan di atas ±3,1 V, ADC tetap tidak bisa membedakan apa-apa, dengan atau tanpa koreksi. Selain itu, di Wokwi angka `analogReadMilliVolts()` tidak cocok dengan tegangan di diagram (🚨, bagian Wokwi), jadi percobaan ini hanya bermakna di papan asli.
</details>

<details>
<summary><b>Akurasi ±0,5 °C itu artinya apa?</b></summary>

Lembar data DHT22 menyebut dua angka yang sering tertukar:

- **Resolusi 0,1 °C** — langkah terkecil yang bisa ditampilkan: 28,4; 28,5; 28,6; dan seterusnya.
- **Akurasi ±0,5 °C** — seberapa jauh angka itu boleh meleset dari suhu yang sebenarnya. Kalau suhu kamarmu tepat 28,0 °C, DHT22 yang sehat boleh menampilkan angka berapa saja dari 27,5 sampai 28,5.

Akibatnya, dua DHT22 yang diletakkan berdampingan bisa berbeda sampai 1 °C, dan keduanya tetap "benar" menurut lembar datanya. Kelembapan juga begitu: akurasinya ±2 %RH (paling buruk ±5 %RH), jadi selisih 71 % dan 74 % antara dua sensor masih wajar.

Mau lebih tepat? Bandingkan dengan termometer yang kamu percaya, di tempat yang sama, setelah keduanya didiamkan 15 menit. Kalau DHT22-mu selalu lebih tinggi 0,3 °C, tambahkan koreksi:

```cpp
const float KOREKSI_SUHU = -0.3;  // hasil membandingkan dengan termometer acuan
// ...
float suhu = dht.readTemperature() + KOREKSI_SUHU;
```

Ini kalibrasi **satu titik**: angkanya hanya digeser. Kalibrasi dua titik di Konsep 5 lebih lengkap karena ikut mengatur kemiringan garisnya. Yang lebih sering merusak akurasi justru **letak sensor**: menempel di dekat chip yang hangat, terkena sinar matahari, atau tertiup embusan AC (Praktik 4.2).
</details>

<details>
<summary><b>Koreksi kecepatan bunyi dengan suhu dari DHT22</b></summary>

Angka 58 di rumus HC-SR04 mengandaikan kecepatan bunyi sekitar 343 m/s, yaitu kecepatan bunyi di udara bersuhu 20 °C. Kecepatan bunyi naik sekitar 0,6 m/s setiap kenaikan 1 °C:

```text
kecepatan bunyi (m/s) ≈ 331,3 + 0,606 × suhu (°C)
```

Pada 35 °C, kecepatannya ±352,5 m/s, sekitar 2,7 % lebih cepat daripada pada 20 °C. Untuk jarak 20 cm, selisihnya sekitar 5 mm — kecil untuk tandon kita, tetapi bisa penting untuk jarak beberapa meter. Karena Node 1 sudah punya DHT22, koreksinya hanya beberapa baris:

```cpp
// jarak dalam cm, memakai suhu udara dari DHT22
float hitungJarakCm(unsigned long durasi, float suhu) {
  if (isnan(suhu)) {
    suhu = 20;  // DHT22 gagal dibaca: pakai suhu anggapan
  }
  float kecepatan = 331.3 + 0.606 * suhu;     // meter per detik
  return durasi * kecepatan / 10000.0 / 2;    // m/s -> cm/µs, lalu dibagi 2 (pergi-pulang)
}
```

Perhatikan cara fungsi ini memperlakukan `NAN`: ia tidak berhenti bekerja, tetapi memakai anggapan yang wajar. Kalau suhunya tidak diketahui, hasil yang sedikit kurang tepat masih lebih berguna daripada tidak ada hasil sama sekali.
</details>

<details>
<summary><b>Histeresis: dua ambang supaya lampu tidak berkedip</b></summary>

Lampu otomatis kita memakai satu ambang: `cahaya < 1000` berarti gelap. Bayangkan senja, saat angka cahaya perlahan turun melewati `1000` sambil bergoyang karena derau: `1003`, `998`, `1001`, `996`… Keputusan "gelap" bisa berganti-ganti setiap laporan. Untuk lampu otomatis kita, masalahnya kecil karena keputusan gelap hanya dipakai saat menyalakan. Namun, untuk aturan yang menyalakan **dan** mematikan berdasarkan satu angka — misalnya kipas berdasarkan suhu di Modul 19 — relay bisa berbunyi "klik-klik" berulang kali.

Obatnya **histeresis**: dua ambang dengan jarak di antaranya. Keputusan "gelap" baru berlaku setelah cahaya turun di bawah `900`, dan baru dicabut setelah cahaya naik di atas `1100`. Di antara keduanya, keputusan lama dipertahankan:

```cpp
const int AMBANG_MASUK_GELAP = 900;    // mulai dianggap gelap di bawah angka ini
const int AMBANG_KELUAR_GELAP = 1100;  // baru dianggap terang lagi di atas angka ini
bool gelap = false;              // keputusan terakhir, diingat antarputaran

void perbaruiGelap(int cahaya) {
  if (!gelap && cahaya < AMBANG_MASUK_GELAP) {
    gelap = true;
  }
  if (gelap && cahaya > AMBANG_KELUAR_GELAP) {
    gelap = false;
  }
}
```

Kamu sudah sering bertemu histeresis tanpa sadar: AC yang menyala saat ruangan mencapai 26 °C dan baru mati setelah turun ke 24 °C, atau dispenser air panas yang tidak menyala-padam setiap detik.
</details>

---
## 🧩 Tantangan mandiri

Tiga tingkat, dari yang paling ringan. Kerjakan minimal Tingkat 1. Semuanya memakai rakitan yang sudah ada di meja kerjamu.

> 🖥️ **Alat:** **Arduino IDE** dan rakitan lengkap Praktik 1–8. Mau mencoba di Wokwi dulu? Tingkat 1 dan 3 bisa memakai [`diagram.json` Node 1](kode/node-1-rumah/diagram.json) beserta [`libraries.txt`](kode/node-1-rumah/libraries.txt)-nya, yang memuat semua sensor dan aktuator, termasuk buzzer. Tingkat 2 cukup dengan [`diagram.json` Praktik 7](kode/modul06_monitor_lima_sensor/diagram.json).

**Tingkat 1 — Ubah sedikit: alarm tandon kosong.** Buat buzzer pasif dari Modul 5 berbunyi "tiit-tiit" setiap kali pompa ditolak supaya penghuni rumah tahu tandon perlu diisi. Petunjuk:

- Buka `modul06_siram_lampu_otomatis`, lalu **segera** pilih **File → Save As…** dan beri nama `modul06_alarm_tandon` sebelum mengubah apa pun.
- Tambahkan `const int PIN_BUZZER = 27;` di peta pin, dan `ledcAttach(PIN_BUZZER, 2000, 10);` di akhir `setup()`.
- Buat fungsi `void bunyiAlarm()` yang membunyikan dua nada pendek: `ledcWriteTone(PIN_BUZZER, 2000)`, `delay(150)`, `ledcWriteTone(PIN_BUZZER, 0)`, `delay(100)`, lalu sekali lagi.
- Panggil `bunyiAlarm()` di cabang **ditolak** dalam `jalankanPompa()`, tepat sebelum `return;`.
- Berhasil kalau buzzer berbunyi dua kali bersamaan dengan pesan `pompa DITOLAK`, dan diam saat pompa diizinkan.

**Tingkat 2 — Gabungkan: lima sensor dalam satu grafik.** Tampilkan suhu, kelembapan, cahaya, tanah, dan level air **bersamaan** di Serial Plotter. Petunjuk:

- Simpan `modul06_monitor_lima_sensor` dengan nama baru `modul06_grafik_sensor`.
- Ganti isi `cetakBacaan()` supaya fungsi itu mencetak satu baris berformat `suhu:28.4,kelembapan:71,cahaya_skala:66,tanah:37,level_air:64` (ingat Praktik 2: tanpa kalimat lain, nama tanpa spasi). Hapus juga `Serial.println(...)` di `setup()`; kalimat pembuka itu akan tergambar sebagai garis aneh.
- Masalahnya: cahaya berkisar `0`–`4095`, sedangkan yang lain `0`–`100`, sehingga garis-garis lain tampak gepeng di dasar grafik. Kirim `cahaya / 41` sebagai gantinya supaya skalanya juga kira-kira 0–100. Beri nama garisnya `cahaya_skala`.
- Ubah `delay(2000)` di `loop()` menjadi `delay(500)`. DHT22 tetap aman: kalau ditanya lebih cepat daripada setiap 2 detik, library mengembalikan bacaan sebelumnya.
- Berhasil kalau kelima garis terlihat bersamaan dan masing-masing bereaksi saat sensornya diganggu (ditutup, diembus, dicelup, digerakkan).

**Tingkat 3 — Rancang sendiri: sensor tanah yang jujur.** Saat ini, kalau kabel AOUT sensor tanah tercabut, pin VN mengambang dan Node 1 bisa mengira tanah kering — lalu menyiram tanpa henti. Rancang pemeriksaan yang menandai bacaan tanah **tidak sah** (`-1`), dan pastikan siram otomatis **tidak pernah** menyiram saat `tanah` bernilai `-1`. Petunjuk awal:

- Angka mentah yang jauh di luar rentang kalibrasi — misalnya lebih dari `TANAH_KERING + 300`, atau kurang dari `TANAH_BASAH - 300` — patut dicurigai. Uji dulu angka berapa yang muncul saat kabel AOUT dicabut (matikan MB102 dan cabut USB dulu; nyalakan lagi dengan urutan USB dulu, baru MB102).
- Cetak `--` untuk tanah yang tidak sah, seperti `kelembapan` dan `level_air`.
- Pikirkan: apa tindakan yang aman saat tanah tidak diketahui — menyiram atau tidak menyiram? Tulis alasanmu sebagai komentar di kode.

Tidak ada kunci jawaban untuk Tingkat 3 — kalau pemeriksaanmu menangkap kabel yang dicabut tanpa salah menuduh sensor yang sehat, kamu benar.

---

## ➕ Tambahan ke "Rumah Pintar Mini"

Sumbangan Modul 6 ke proyek benang merah: **kelima indra Node 1 dibaca sungguhan**, angka-angka contoh di `bacaSensor()` hilang untuk selamanya, dan rak `kendalikanAktuator()` yang kosong sejak Modul 3 akhirnya berisi **dua aturan otomatis pertama**. Hasilnya: Node 1 **v0.3.0**. Seperti minggu lalu, rak-rak itu kamu isi sendiri dari potongan kode Praktik; versi rujukan lengkapnya ada di [`proyek-rumah-pintar-mini/firmware/node-1-rumah/`](../../proyek-rumah-pintar-mini/firmware/node-1-rumah/node-1-rumah.ino).

> 🖥️ **Alat yang dipakai:** **Arduino IDE** (dengan library ESP32Servo dari Modul 5 serta DHT sensor library dan Adafruit Unified Sensor dari Praktik 4), **VS Code**, **GitHub Desktop**, dan rakitan lengkap. Tanpa papan? Semua langkah bisa diuji di Wokwi dengan [`diagram.json`](kode/node-1-rumah/diagram.json) dan [`libraries.txt`](kode/node-1-rumah/libraries.txt) Node 1; tekan **F** untuk melihat seluruh rangkaian. Di diagram itu, daya digambar sebagai simbol ▽ (GND) dan VCC (3,3 V); lampu, kipas, dan pompa diwakili LED berlabel — jangan tiru di papan asli (🚨, bagian Wokwi).

### A. Perbarui `PETA-PIN.md`

Sejak Modul 5, kelima sensor berstatus "dipesan" di `PETA-PIN.md`. Sekarang statusnya "terpasang".

1. Di VS Code, buka folder repositori proyekmu (**File → Open Folder…** → **Documents → GitHub → rumah-pintar-mini**), lalu buka `PETA-PIN.md`.
2. Buka versi rujukan [`PETA-PIN.md`](../../proyek-rumah-pintar-mini/PETA-PIN.md) di tab baru, klik **Copy raw file**, lalu ganti seluruh isi file-mu dengannya (**Ctrl + A**, lalu **Ctrl + V**). Yang berubah: enam baris sensor di tabel Node 1 kini **terpasang** beserta catatan pemasangannya, tabel rel daya menyebut sensor 5 V (PIR dan HC-SR04) di rel atas, dan tabel **Riwayat** mendapat baris versi 2. Peta pin memang satu untuk semua pembelajar, jadi boleh disalin utuh.
3. Simpan (**Ctrl + S**).

### B. Isi rak-rak Node 1 menjadi v0.3.0

Buka **`node-1-rumah.ino`** di Arduino IDE: **File → Open…** → **Documents → GitHub → rumah-pintar-mini → firmware → node-1-rumah**. Kerjakan perubahan berikut dari atas ke bawah. Setiap selesai satu langkah, klik **Verify** (✓) supaya salah ketik langsung ketahuan. Urutan langkahnya sudah diatur supaya setiap Verify di tengah jalan berhasil; kalau muncul error, periksa langkah yang baru saja kamu kerjakan.

**Langkah 1 — Bagian paling atas: komentar, library, dan versi.** Ganti semua baris dari baris pertama sampai `const String VERSI_FIRMWARE = "0.2.0";` dengan blok ini:

```cpp
// Node 1 "Rumah" - firmware v0.3.0 (diperbarui di Modul 6)
// Proyek benang merah: Rumah Pintar Mini.
//
// Baru di v0.3.0: kelima sensor Node 1 dibaca sungguhan (DHT22, LDR, sensor tanah,
// PIR, HC-SR04), ditambah dua aturan otomatis versi lokal pertama:
// "siram otomatis" (ditolak kalau air tandon terlalu sedikit) dan "lampu otomatis".
// Aktuator tetap bisa dicoba lewat Serial Monitor, misalnya:
// lampu on, kipas off, pompa 3, tirai 90, bunyi, status.
//
// Library: ESP32Servo versi 3.2.1, DHT sensor library versi 1.4.7
// (ikut terpasang: Adafruit Unified Sensor versi 1.1.15).

#include <ESP32Servo.h>
#include <DHT.h>
#include <esp_system.h>  // esp_reset_reason()

const String VERSI_FIRMWARE = "0.3.0";
```

**Langkah 2 — Peta pin.** Tepat di bawah baris `const int PIN_BUZZER = 27;       // Modul 5, buzzer pasif`, tambahkan enam baris ini:

```cpp
const int PIN_DHT = 14;          // Modul 6, DHT22
const int PIN_LDR = 36;          // Modul 6, VP: LDR (ADC1)
const int PIN_TANAH = 39;        // Modul 6, VN: sensor tanah kapasitif (ADC1)
const int PIN_PIR = 34;          // Modul 6, PIR
const int PIN_TRIG = 15;         // Modul 6, HC-SR04 TRIG
const int PIN_ECHO = 35;         // Modul 6, HC-SR04 ECHO lewat pembagi tegangan
```

Lalu **hapus** baris komentar `// Modul 6: DHT22 = 14, LDR = 36 (VP), tanah = 39 (VN), PIR = 34, HC-SR04 TRIG = 15, ECHO = 35` di bawahnya — pin-pin itu sudah tidak "dipesan" lagi, melainkan terpasang.

**Langkah 3 — Kalibrasi, aturan, formulir, dan keadaan.** Ganti semua baris dari `// Formulir data sensor. Nama kolomnya mengikuti kontrak data (Lampiran A Silabus).` sampai `int hitungPutaran = 0;` dengan blok di bawah ini. Jangan lupa mengganti empat angka kalibrasi dengan catatanmu dari Praktik 3 dan 6, dan `AMBANG_GELAP` dengan hasil Praktik 1.4.

```cpp
// ---------- Modul 6: hasil kalibrasimu (Praktik 3 dan 6) ----------
const int TANAH_KERING = 3000;    // angka mentah sensor tanah di udara
const int TANAH_BASAH = 1300;     // angka mentah sensor tanah di air
const float JARAK_KOSONG = 20.0;  // cm: sensor ke dasar tandon
const float JARAK_PENUH = 5.0;    // cm: sensor ke permukaan air saat tandon penuh

// ---------- Modul 6: aturan otomatis versi lokal ----------
const int AMBANG_TANAH_SIRAM = 30;  // Lampiran A: "tanah_siram"
const int LEVEL_AIR_MINIMUM = 20;   // pompa ditolak kalau isi tandon di bawah 20 %
const int DETIK_SIRAM = 3;          // lama pompa menyala saat menyiram otomatis
const int JEDA_SIRAM = 15;          // sesudah mencoba menyiram, tunggu 15 laporan (kira-kira 30 detik)
const int AMBANG_GELAP = 1000;      // cahaya di bawah ini dianggap gelap

// Formulir data sensor. Nama kolomnya PERSIS sesuai kontrak data (Lampiran A Silabus).
struct BacaanSensor {
  float suhu;      // derajat Celsius; NAN kalau DHT22 gagal dibaca
  int kelembapan;  // persen; -1 kalau DHT22 gagal dibaca
  int cahaya;      // 0 (gelap gulita) sampai 4095 (sangat terang)
  int tanah;       // persen: 0 = kering seperti di udara, 100 = basah seperti di air
  bool gerak;      // true kalau PIR melihat gerakan
  int level_air;   // persen isi tandon; -1 kalau gema HC-SR04 tidak kembali
};

// Keadaan aktuator saat ini (nanti dikirim di "ack", Lampiran A)
bool lampuMenyala = false;
bool kipasMenyala = false;
int sudutTirai = 90;

bool lampuDariOtomatis = false;  // true kalau lampu dinyalakan oleh lampuOtomatis()
int sisaJedaSiram = 0;           // berapa laporan lagi sebelum boleh mencoba menyiram lagi

Servo servoTirai;
DHT dht(PIN_DHT, DHT22);
int hitungPutaran = 0;
```

**Langkah 4 — `aturLampu()`.** Tambahkan satu baris di bawah `lampuMenyala = nyala;` sehingga fungsinya menjadi:

```cpp
void aturLampu(bool nyala) {
  lampuMenyala = nyala;
  lampuDariOtomatis = false;  // anggap perintah manual; lampuOtomatis() menandai miliknya sendiri
  if (nyala) {
    digitalWrite(PIN_RELAY_LAMPU, LOW);  // relay aktif LOW
  } else {
    digitalWrite(PIN_RELAY_LAMPU, HIGH);
  }
}
```

**Langkah 5 — Rak sensor.** Ganti semua baris dari label `// ---------- Modul 6-7: membaca sensor sungguhan ----------` sampai kurung kurawal penutup fungsi `bacaSensor()` dengan blok ini. Labelnya ikut berubah menjadi "Modul 6" karena kelima sensor Node 1 kini lengkap.

```cpp
// ---------- Modul 6: membaca sensor sungguhan ----------
// Rata-rata 20 bacaan analog berturut-turut supaya derau teredam.
int bacaAnalogRata(int pin) {
  long jumlah = 0;
  for (int i = 0; i < 20; i++) {
    jumlah += analogRead(pin);
    delay(2);
  }
  return jumlah / 20;
}

int bacaCahaya() {
  return 4095 - bacaAnalogRata(PIN_LDR);  // dibalik: makin terang, makin besar
}

int bacaTanahPersen() {
  int persen = map(bacaAnalogRata(PIN_TANAH), TANAH_KERING, TANAH_BASAH, 0, 100);
  return constrain(persen, 0, 100);
}

// Mengukur jarak satu kali, dalam cm. Menjawab -1 kalau gemanya tidak kembali.
float ukurJarakCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long durasi = pulseIn(PIN_ECHO, HIGH, 30000);
  if (durasi == 0) {
    return -1;
  }
  return durasi / 58.0;
}

int bacaLevelAir() {
  float jarak = ukurJarakCm();
  if (jarak < 0) {
    return -1;  // tidak diketahui
  }
  int persen = (JARAK_KOSONG - jarak) * 100 / (JARAK_KOSONG - JARAK_PENUH);
  return constrain(persen, 0, 100);
}

BacaanSensor bacaSensor() {
  BacaanSensor b;
  b.suhu = dht.readTemperature();
  float kelembapan = dht.readHumidity();
  if (isnan(kelembapan)) {
    b.kelembapan = -1;
  } else {
    b.kelembapan = round(kelembapan);  // dibulatkan ke bilangan bulat terdekat
  }
  b.cahaya = bacaCahaya();
  b.tanah = bacaTanahPersen();
  b.gerak = digitalRead(PIN_PIR) == HIGH;
  b.level_air = bacaLevelAir();
  return b;
}
```

**Langkah 6 — `jalankanPompa()` mendapat pengaman tandon.** Ganti seluruh fungsi `jalankanPompa()` dengan versi Praktik 8 di bawah ini. Blok ini diawali satu baris komentar baru, jadi tempel juga baris itu tepat di atas fungsinya:

```cpp
// Modul 6: pompa hanya menyala kalau air tandon cukup. Tandon diukur tepat sebelum pompa menyala.
void jalankanPompa(int detik) {
  detik = constrain(detik, 1, 10);  // batas aman: 1-10 detik
  delay(60);  // lembar data HC-SR04: jeda minimal 60 ms sejak ukuran sebelumnya (Konsep 10)
  int levelAir = bacaLevelAir();
  if (levelAir < LEVEL_AIR_MINIMUM) {  // -1 (tidak terbaca) juga lebih kecil, jadi ikut ditolak
    Serial.print("pompa DITOLAK: air tandon ");
    if (levelAir < 0) {
      Serial.println("tidak terbaca");
    } else {
      Serial.print("tinggal ");
      Serial.print(levelAir);
      Serial.println(" %");
    }
    return;
  }
  Serial.print("pompa menyala ");
  Serial.print(detik);
  Serial.println(" detik...");
  digitalWrite(PIN_POMPA, HIGH);
  delay(detik * 1000);  // untuk sementara masih memblokir; Modul 8 membuatnya tanpa delay()
  digitalWrite(PIN_POMPA, LOW);
}
```

**Langkah 7 — `siapkanPin()` menyiapkan sensor.** Di akhir fungsi `siapkanPin()`, tepat di bawah `ledcAttach(PIN_BUZZER, 2000, 10);` dan sebelum kurung kurawal penutup `}`, tambahkan satu baris kosong, lalu baris-baris ini:

```cpp
  // Modul 6: sensor
  dht.begin();
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_TRIG, OUTPUT);
  digitalWrite(PIN_TRIG, LOW);
  pinMode(PIN_ECHO, INPUT);
```

**Langkah 8 — Perintah `pompa`.** Di `periksaPerintahSerial()`, **hapus** baris `Serial.println("pompa menyala...");`. Sekarang `jalankanPompa()` sendiri yang mengumumkan bahwa pompa menyala atau ditolak; kalau baris itu dibiarkan, Node 1 bisa mencetak `pompa menyala...` tepat sebelum `pompa DITOLAK`.

**Langkah 9 — Rak aturan otomatis.** Ganti semua baris dari label `// ---------- Modul 6 & 19: aturan otomatis (siram, lampu, kipas) ----------` sampai kurung kurawal penutup fungsi `kendalikanAktuator()` dengan blok ini:

```cpp
// ---------- Modul 6 & 19: aturan otomatis (siram, lampu, kipas) ----------
void siramOtomatis(BacaanSensor b) {
  if (sisaJedaSiram > 0) {  // baru saja mencoba menyiram: tunggu dulu
    sisaJedaSiram--;
    return;
  }
  if (b.tanah < AMBANG_TANAH_SIRAM) {
    Serial.print("Tanah kering (");
    Serial.print(b.tanah);
    Serial.print(" %): ");
    jalankanPompa(DETIK_SIRAM);  // pengaman tandon ada di dalam jalankanPompa()
    sisaJedaSiram = JEDA_SIRAM;  // berhasil atau ditolak, jangan coba lagi selama kira-kira 30 detik
  }
}

void lampuOtomatis(BacaanSensor b) {
  bool gelap = b.cahaya < AMBANG_GELAP;
  if (b.gerak && gelap && !lampuMenyala) {
    Serial.println("Ada gerakan di tempat gelap: lampu otomatis menyala.");
    aturLampu(true);
    lampuDariOtomatis = true;
  }
  if (!b.gerak && lampuDariOtomatis) {  // hanya mematikan lampu yang ia nyalakan sendiri
    Serial.println("Sepi: lampu otomatis padam.");
    aturLampu(false);
  }
}

void kendalikanAktuator(BacaanSensor b) {
  siramOtomatis(b);
  lampuOtomatis(b);
  // Modul 19 menambahkan kipas otomatis (Lampiran A: "suhu_kipas_on")
}
```

`lampuOtomatis()` di sini sedikit berbeda dengan Praktik 8: ada variabel **`lampuDariOtomatis`**. Node 1 punya tombol dan perintah `lampu on`/`lampu off`, jadi aturan otomatis perlu tahu **siapa yang menyalakan lampu**. Kalau kamu menyalakannya sendiri dengan tombol atau perintah, aturan otomatis tidak akan mematikannya saat sepi; ia hanya memadamkan lampu yang ia nyalakan sendiri. Itulah sebabnya `aturLampu()` di Langkah 4 selalu menghapus tanda itu, dan `lampuOtomatis()` memasangnya lagi setelah menyalakan lampu. Catatan: yang dilindungi hanya lampu yang *dinyalakan* manusia; kalau kamu *mematikannya* selagi masih ada gerakan di tempat gelap, aturan otomatis menyalakannya lagi pada laporan berikutnya.

**Langkah 10 — `cetakBacaan()`.** Ganti semua baris dari `// Mencetak bacaan ke Serial Monitor (alat bantu kita sendiri).` sampai kurung kurawal penutup fungsi `cetakBacaan()` dengan blok ini:

```cpp
// Mencetak angka, atau "--" kalau nilainya tidak sah (kurang dari 0).
void cetakNilai(int nilai) {
  if (nilai < 0) {
    Serial.print("--");
  } else {
    Serial.print(nilai);
  }
}

// Mencetak bacaan ke Serial Monitor (alat bantu kita sendiri).
void cetakBacaan(BacaanSensor b) {
  Serial.print("suhu=");
  if (isnan(b.suhu)) {
    Serial.print("--");
  } else {
    Serial.print(b.suhu, 1);
  }
  Serial.print(" C  kelembapan=");
  cetakNilai(b.kelembapan);
  Serial.print(" %  cahaya=");
  Serial.print(b.cahaya);
  Serial.print("  tanah=");
  Serial.print(b.tanah);
  Serial.print(" %  gerak=");
  if (b.gerak) {
    Serial.print("ya");
  } else {
    Serial.print("tidak");
  }
  Serial.print("  level_air=");
  cetakNilai(b.level_air);
  Serial.println(" %");
}
```

`setup()` dan `loop()` **tidak berubah**: `loop()` sudah memanggil `bacaSensor()`, `cetakBacaan()`, dan `kendalikanAktuator()` sejak Modul 3. Itulah gunanya rak-rak yang dibuat sejak awal — minggu ini kamu cukup mengisinya.

### C. Uji Node 1

1. Klik **Verify**. Kalau muncul error, bandingkan baris yang ditunjuk pesan error dengan [versi rujukan](../../proyek-rumah-pintar-mini/firmware/node-1-rumah/node-1-rumah.ino).
2. Pastikan tandon berisi air dan sensor tanah tertancap di tanah lembap atau dicelupkan ke gelas air (supaya siram otomatis tidak langsung bekerja). Colokkan USB, nyalakan MB102, lalu klik **Upload**. Buka Serial Monitor (**New Line**, 115200 baud).

   **Hasilnya:**

   ```text
   Node 1 Rumah - firmware 0.3.0
   Alasan restart terakhir: POWERON
   status: lampu=off kipas=off tirai=90
   suhu=28.4 C  kelembapan=71 %  cahaya=2744  tanah=63 %  gerak=tidak  level_air=96 %
   ```

3. **Pengaman pompa untuk perintah manual.** Kosongkan tandon (matikan MB102 dan cabut USB dulu, seperti Praktik 8.2), lalu colokkan USB, nyalakan MB102, buka lagi Serial Monitor, dan ketik `pompa 3`: Node 1 menjawab `pompa DITOLAK: air tandon tinggal 0 %`. Isi lagi tandonnya dengan cara yang sama, lalu ketik `pompa 2`: muncul `pompa menyala 2 detik...` dan pompa benar-benar menyala. Ketik juga `pompa xyz`: tetap dijawab `Butuh angka detik. Contoh: pompa 3`.
4. **Lampu otomatis.** Tutup LDR, lalu lambaikan tangan di depan PIR: `Ada gerakan di tempat gelap: lampu otomatis menyala.` Diam: `Sepi: lampu otomatis padam.`
5. **Perintah manual menang.** Ketik `lampu on`, tutup LDR, lambaikan tangan, lalu diam: lampu **tetap menyala** karena kamu yang menyalakannya. Ketik `lampu off` untuk mematikannya. Tombol manual D13 juga tetap bekerja seperti di Modul 5.
6. **Siram otomatis.** Angkat sensor tanah ke udara: dalam 2 detik muncul `Tanah kering (0 %): pompa menyala 3 detik...`. Celupkan lagi ke air.
7. Perintah Modul 5 lainnya (`kipas on`, `tirai 45`, `bunyi`, `status`) tetap bekerja.

![Tangkapan layar Wokwi Node 1 v0.3.0 lengkap, diperkecil dengan tombol F, lalu dipotong dan diperbesar; label putih nama komponen ditambahkan penulis. Di atas, jendela PIR Motion Sensor dengan tombol Simulate motion yang dikotaki merah. Rangkaian: papan ESP32 menyamping di tengah bawah dengan LED status D4 di bawahnya; di kiri tombol D13, DHT22, buzzer, servo tirai, LED = pompa, relay + LED = kipas, dan relay + LED = lampu yang LED kuningnya menyala (penanda 2); di kanan PIR (D34), potensiometer pengganti sensor tanah, LDR (VP), dan HC-SR04 (tandon). Paling bawah, Serial Monitor dengan baris pompa DITOLAK: air tandon tinggal 0 persen setelah perintah pompa 3 dengan Distance 20 sentimeter (penanda 1) dan baris Ada gerakan di tempat gelap: lampu otomatis menyala. (penanda 3), serta keterangan ketiga penanda di sampingnya](aset/wokwi-node-1-v3.png)

*Tangkapan layar [Wokwi](https://wokwi.com), © Wokwi (CodeMagic LTD), Oktober 2026; dipakai untuk tujuan pendidikan, penanda oleh penulis.*

### D. *Commit* dan *push*

1. Di GitHub Desktop, pilih **`rumah-pintar-mini`** di kotak **Current repository** — selalu lihat kotak ini sebelum *commit*!
2. Tab **Changes** berisi dua file yang berubah: `PETA-PIN.md` dan `firmware/node-1-rumah/node-1-rumah.ino`.
3. Isi **Summary** dengan `Node 1 v0.3.0: lima sensor, siram dan lampu otomatis (Modul 6)`, klik **Commit 2 files to main**, lalu **Push origin**.

> [!IMPORTANT]
> **Aturan otomatis yang aman selalu bertanya "bagaimana kalau sensornya berbohong?"** Pompa menolak menyala saat tandon tidak terbaca, dan lampu otomatis tidak berani mematikan lampu yang dinyalakan manusia. Pola pikir ini akan terus dipakai: di Modul 19, aturan otomatis bisa diatur dari server, tetapi pengaman lokal seperti ini tetap tinggal di Node 1 — supaya rumah tetap aman walaupun internet putus.

---
## 📖 Glosarium

| Istilah | Arti ramah awam |
| :--- | :--- |
| **Sensor** | Komponen yang mengubah sesuatu di dunia nyata (terang, panas, basah, jarak, gerakan) menjadi sinyal listrik. |
| **Analog / digital** | Sinyal analog bisa bernilai berapa saja di antara 0 dan 3,3 V; sinyal digital hanya HIGH atau LOW. |
| **ADC** | *Analog-to-Digital Converter*: bagian chip yang mengukur tegangan dan menjawab dengan angka. ADC ESP32 12 bit: `0`–`4095`. |
| **Bit** (12 bit) | Satuan terkecil data digital. Dua belas bit berarti 2¹² = 4.096 kemungkinan angka. |
| **ADC1 / ADC2** | Dua ADC di ESP32. ADC2 tidak bisa dipakai saat WiFi menyala, jadi sensor analog kita selalu di ADC1 (GPIO 32–39). |
| **Tidak linear** | Tidak berbanding lurus; penggaris ADC ESP32 tidak lurus sempurna dan tumpul di kedua ujungnya. |
| **Mengambang** (*floating*) | Keadaan pin yang tidak tersambung ke apa pun sehingga bacaannya melompat-lompat tanpa sebab. |
| **Pembagi tegangan** (*voltage divider*) | Dua resistor berurutan yang membagi tegangan sebanding dengan hambatannya: V_tengah = V_masuk × R_bawah ÷ (R_atas + R_bawah). |
| **LDR** | *Light Dependent Resistor*, resistor peka cahaya: hambatannya mengecil saat terang. |
| **Lux** | Satuan terang cahaya. Kamar gelap ±1 lux, ruangan berlampu ratusan lux, terik matahari hingga ±100.000 lux. |
| **Derau** (*noise*) | Goyangan acak kecil pada sinyal listrik yang membuat bacaan sensor tidak pernah diam. |
| **Rata-rata sesaat** (*oversampling*) | Membaca sensor berkali-kali dengan cepat, lalu mengambil rata-ratanya. |
| **Rata-rata bergerak** (*moving average*) | Rata-rata dari sejumlah bacaan **terakhir**; setiap bacaan baru menggantikan yang paling lama. |
| **Kapasitor keramik 100 nF** ("104") | Kapasitor kecil tak berkutub yang dipasang dari pin ADC ke GND sebagai peredam derau. |
| **Serial Plotter** | Alat di Arduino IDE (dan Wokwi) yang menggambar angka dari Serial menjadi garis grafik. |
| **Kalibrasi** | Mencocokkan angka mentah sensor dengan keadaan nyata. Kalibrasi dua titik memakai dua keadaan yang jawabannya diketahui (misalnya udara dan air). |
| **`map()` / `constrain()`** | `map()` mengubah skala angka mengikuti garis lurus (tanpa memagari); `constrain()` memagari angka supaya tetap di antara batas bawah dan atas. |
| **Sensor tanah kapasitif / resistif** | Kapasitif mengukur perubahan kapasitansi tanpa logam terbuka (awet); resistif mengalirkan arus lewat dua kaki logam (cepat berkarat). |
| **Garis batas** | Garis di papan sensor tanah; bagian di atasnya (elektronik) tidak boleh basah. |
| **Selongsong bakar** (*heat shrink*) | Selang plastik yang mengerut saat dipanaskan; dipakai untuk membungkus dan melindungi. |
| **Lengkungan tetes** (*drip loop*) | Kabel yang dibuat melengkung lebih rendah daripada colokannya supaya tetesan air jatuh dari titik terendah kabel. |
| **Lembar data** (*datasheet*) | Dokumen resmi pembuat komponen berisi batas tegangan, rentang, akurasi, waktu, dan kaki. |
| **Resolusi / akurasi** | Resolusi = langkah terkecil yang bisa ditampilkan (DHT22: 0,1 °C). Akurasi = seberapa jauh bacaan boleh meleset dari yang sebenarnya (DHT22: ±0,5 °C). |
| **%RH** | *Relative humidity*, kelembapan relatif: seberapa penuh udara oleh uap air, 0–100 %. |
| **Resistor *pull-up*** | Resistor dari kabel data ke VCC yang menjaga kabel tetap HIGH saat tidak ada yang menariknya ke LOW; modul DHT22 tiga kaki sudah membawanya. |
| **Protokol satu kabel** | Cara bercakap dua arah lewat satu kabel data, bergantian, dengan aturan waktu yang ketat (dipakai DHT22). |
| ***Checksum*** | Angka pemeriksa di akhir kiriman data; kalau tidak cocok, datanya rusak di jalan. |
| **Library pendamping** (*dependency*) | Library lain yang dibutuhkan sebuah library supaya bisa bekerja; contohnya Adafruit Unified Sensor untuk library DHT. |
| **`NAN`** | *Not a Number*, "bukan angka": jawaban library DHT saat pembacaan gagal. Diperiksa dengan `isnan()`. |
| **PIR** | *Passive Infrared*: sensor yang menangkap perubahan pancaran panas (inframerah) dari benda hangat yang bergerak. |
| **Lensa Fresnel** | Kubah plastik bergerigi di depan PIR yang membagi pandangannya menjadi banyak petak. |
| **Pemanasan** (*warm-up*) | Waktu tunggu setelah sensor diberi listrik sampai bacaannya bisa dipercaya; PIR butuh sekitar 1 menit. |
| **Ultrasonik** | Bunyi di atas batas pendengaran manusia (HC-SR04: 40 kHz). |
| **`pulseIn()`** | Fungsi yang mengukur berapa lama sebuah pin bertahan HIGH (atau LOW), dalam mikrodetik. |
| **Mikrodetik** (µs) | Sepersejuta detik. |
| **Tandon** | Wadah air untuk pompa; level airnya diukur dengan HC-SR04. |
| **Kontrak data** | Kesepakatan nama dan satuan setiap data yang dipakai seluruh bagian proyek (Lampiran A Silabus). |
| **Nilai tidak sah** | Nilai khusus penanda bacaan gagal, misalnya `NAN` atau `-1`, supaya tidak dikira bacaan sungguhan. |
| **Pengaman lokal** | Aturan keselamatan yang dijalankan perangkat itu sendiri, misalnya pompa menolak menyala saat tandon kosong, sehingga tetap bekerja walaupun internet putus. |
| ***Errata*** | Daftar resmi kekeliruan atau keanehan chip yang ditemukan setelah chip itu dibuat, beserta cara menghindarinya. |
| **Histeresis** | Dua ambang dengan jarak di antaranya (misalnya gelap di bawah 900, terang lagi di atas 1100) supaya keputusan tidak berganti-ganti di sekitar satu angka. |

---

## 📝 Kuis 5 soal

Jawab dulu di catatanmu, baru buka kuncinya. Lulus = minimal 4 benar.

1. HC-SR04 diberi 5 V, dan kaki ECHO-nya disambung ke pembagi tegangan dengan resistor 4,7 kΩ di atas dan 10 kΩ di bawah. (a) Berapa tegangan di titik tengahnya saat ECHO HIGH? (b) Apakah aman untuk pin ESP32, dan apakah masih terbaca HIGH? (c) Apa yang terjadi kalau kedua resistornya tertukar?
2. Temanmu memasang sensor tanah di GPIO 25. Semuanya berjalan lancar — sampai ia menyalakan WiFi di Modul 10, dan bacaannya tiba-tiba kacau. (a) Kenapa? (b) Pin mana saja yang seharusnya dipilih untuk sensor analog? (c) Di pin apa LDR dan sensor tanah Node 1 dipasang?
3. Sensor tanahmu terbaca `3100` di udara dan `1400` di air. (a) Berapa hasil `map(2250, 3100, 1400, 0, 100)`? (b) Suatu siang sensor terbaca `3400`. Berapa hasil `map()`-nya, kenapa angka itu bermasalah, dan bagaimana memperbaikinya?
4. Sketsa DHT22-mu terus mencetak `Gagal membaca DHT22!`. (a) Nilai apa yang dikembalikan `readTemperature()` saat gagal, dan bagaimana kode mendeteksinya? (b) Sebutkan dua kemungkinan penyebabnya. (c) Kenapa modul DHT22 kita diberi 3,3 V, bukan 5 V?
5. Di Node 1, `bacaLevelAir()` menjawab `-1`. (a) Apa artinya? (b) Apa yang dilakukan `jalankanPompa()` kalau diminta menyala saat itu, dan kenapa satu `if` cukup untuk menangkal dua keadaan berbahaya? (c) Kenapa pengaman tandon ditaruh di dalam `jalankanPompa()`, bukan di dalam `siramOtomatis()`?

<details>
<summary><b>Kunci jawaban & penjelasan</b></summary>

1. (a) 5 × 10 ÷ (4,7 + 10) = 5 × 10 ÷ 14,7 ≈ **3,40 V**. (b) **Aman** karena di bawah batas pin ESP32 3,6 V (3,3 V + 0,3 V), dan **terbaca HIGH** karena di atas ambang sekitar 0,75 × 3,3 V ≈ 2,5 V. (c) Hasilnya 5 × 4,7 ÷ 14,7 ≈ **1,60 V**: tetap aman, tetapi di bawah ambang HIGH yang dijamin (±2,5 V) sehingga `pulseIn()` bisa tidak melihat pulsa sama sekali (sketsa mencetak `Tidak ada gema`) atau membacanya tidak menentu.
2. (a) GPIO 25 termasuk **ADC2**, yang dipinjam radio WiFi; selama WiFi menyala, `analogRead()` di pin ADC2 gagal. (b) Pin **ADC1**: GPIO 32–39, yang di papan 30 pin kita berarti GPIO 32, 33, 34, 35, 36 (VP), dan 39 (VN). (c) LDR di **VP (GPIO 36)** dan sensor tanah di **VN (GPIO 39)** — keduanya ADC1. Inilah syarat lulus ketiga.
3. (a) (2.250 − 3.100) × (100 − 0) ÷ (1.400 − 3.100) + 0 = −85.000 ÷ (−1.700) = **50**, jadi 50 %. (b) (3.400 − 3.100) × 100 ÷ (1.400 − 3.100) = 30.000 ÷ (−1.700) = −17,6, dan karena `map()` memakai bilangan bulat, hasilnya **−17**. Kelembapan −17 % mustahil; `map()` memang tidak memagari hasilnya kalau angka mentah keluar dari rentang kalibrasi. Obatnya `constrain(persen, 0, 100)` sehingga −17 menjadi **0 %**.
4. (a) **`NAN`** ("bukan angka"), dideteksi dengan **`isnan(suhu)`** — `NAN` tidak bisa dibandingkan seperti angka biasa. (b) Dua dari: kabel DATA lepas atau salah lubang (seharusnya 8f, di atas D14); VCC atau GND tidak tersambung atau tertukar; pin di kode bukan 14 atau jenisnya bukan `DHT22`; sensor DHT22 telanjang berkaki empat dipakai tanpa resistor *pull-up*; atau sensornya rusak. (c) Modul tiga kaki punya resistor *pull-up* dari DATA ke VCC sehingga tegangan kabel DATA sama dengan VCC. Kalau modul diberi 5 V, pin D14 menerima 5 V, melewati batas 3,6 V.
5. (a) HC-SR04 **tidak mendengar gema**: level air **tidak diketahui** — misalnya kabel ECHO lepas, MB102 mati, atau sensor terhalang. (b) Pompa **ditolak** dengan pesan `pompa DITOLAK: air tandon tidak terbaca`. Satu `if (levelAir < LEVEL_AIR_MINIMUM)` cukup karena `-1` lebih kecil daripada `20` sehingga "isi tandon hampir habis" dan "isi tandon tidak diketahui" sama-sama berakhir dengan tindakan yang aman: pompa tidak menyala. (c) Supaya **semua** perintah yang menyalakan pompa ikut diperiksa: aturan siram otomatis, perintah Serial `pompa 3`, dan kelak perintah dari server (Modul 11). Kalau pengaman hanya ada di `siramOtomatis()`, perintah manual bisa menjalankan pompa di tandon kosong.

</details>

---

## ✅ Checklist kelulusan Modul 6

Centang dengan jujur. Kotak ⭐ adalah **syarat lulus resmi** dari Silabus; sisanya sangat dianjurkan. Kalau semuanya tercentang, tandai Modul 6 di salinan [`PROGRES.md`](../../PROGRES.md) milikmu dan lanjut ke Modul 7.

- [ ] LDR terpasang di VP; tegangan titik tengahnya terbukti berubah dengan cahaya (multimeter), dan ambang gelap untuk ruanganku sudah kutentukan (Praktik 1).
- [ ] Aku sudah melihat derau dan rata-rata bergerak di Serial Plotter, dan kapasitor 100 nF terpasang di 34h–36h (Praktik 2).
- [ ] ⭐ **Sensor tanahku terbaca ±0 % di udara dan ±100 % di air** setelah kalibrasi (Praktik 3).
- [ ] DHT22 terbaca dari catu 3,3 V, dan pesan gagal muncul (bukan angka ngawur) saat kabel DATA dicabut (Praktik 4).
- [ ] PIR mendeteksi gerakan setelah pemanasan, dan LED status ikut menyala (Praktik 5).
- [ ] Pembagi tegangan ECHO terukur 3,1–3,6 V (±3,4 V) **sebelum** HC-SR04 dipasang, dan level air tandon sudah kukalibrasi (Praktik 6).
- [ ] Monitor lima sensor mencetak satu baris rapi setiap 2 detik, dan bacaan yang gagal tampil sebagai `--` (Praktik 7).
- [ ] ⭐ **Pompa menolak menyala saat tandon kosong** (Praktik 8).
- [ ] Lampu otomatis menyala saat gelap dan ada gerakan, lalu padam saat sepi (Praktik 8).
- [ ] ⭐ **Semua sensor analogku ada di pin ADC1**: LDR di VP (GPIO 36) dan sensor tanah di VN (GPIO 39) (Konsep 2).
- [ ] Folder `modul-06`, `catatan-kalibrasi.md`, dan `meja-kerja-sensor.jpg` sudah ter-*push* ke repositori `belajar-iot` (Praktik 9).
- [ ] Node 1 v0.3.0 dan `PETA-PIN.md` versi 2 sudah ter-*push* ke repositori `rumah-pintar-mini`, dan pengaman pompa serta lampu otomatisnya sudah kuuji (➕).
- [ ] ⭐ **Kuis: minimal 4 dari 5 benar.**

**Lulus jika** (sesuai Silabus): *bacaan sensor tanahmu menunjukkan ±0 % di udara dan ±100 % di air, pompa menolak menyala saat tandon kosong, dan semua sensor analogmu ada di pin ADC1.*

**Menuju tanda lulus Fase 1** ([Silabus §8](../../SILABUS.md#8-evaluasi--tanda-kelulusan-tiap-fase)): Node 1 kini punya tangan dan indra, dan foto rakitan sensormu menambah koleksi foto rangkaian Fase 1. Firmware v1.0 yang tangguh dan sanggup berjalan 24 jam menyusul di Modul 8, sketsa baterai terukur di Modul 9, dan video 30 detik di akhir Fase 1.

---

## 📚 Sumber & atribusi gambar

Diagram dan ilustrasi buatan sendiri dilisensikan **CC BY 4.0**, dan file sumber `.svg`-nya disertakan di folder `aset/` supaya bisa kamu ubah. Dua gambar yang memuat foto Wikimedia Commons (`pir-anatomi` dan `foto-sensor-node-1`) berlisensi **CC BY-SA 4.0**, mengikuti lisensi fotonya, dan hanya tersedia sebagai `.jpg`. Ilustrasi meja kerja, modul sensor, dan jendela Arduino IDE digambar ulang mengikuti bentuk aslinya; ukuran dan tata letak komponen asli bisa sedikit berbeda antarpabrik. Rekap lengkap juga ada di [`aset/SUMBER.md`](aset/SUMBER.md).

| File | Sumber | Lisensi / keterangan |
| :--- | :--- | :--- |
| `peta-jalan-modul-06`, `lima-sensor-node-1`, `derau-rata-rata`, `kalibrasi-dua-titik` (`.png` + `.svg`) | Diagram orisinal kurikulum Fullstack IoT Developer. | CC BY 4.0 |
| `kontrak-data-bacaan` (`.png` + `.svg`) | Diagram orisinal. Nama kolom dan contoh nilai mengikuti Lampiran A Silabus. | CC BY 4.0 |
| `adc-penggaris`, `pembagi-tegangan` (`.png` + `.svg`) | Diagram orisinal (gambaran). Rentang ukur ADC (±150–3.100 mV pada atenuasi bawaan) dari dokumentasi ADC Arduino-ESP32, bentuk kurvanya mengikuti kalibrasi 11 dB ESP-IDF; batas tegangan pin dan ambang HIGH dari lembar data ESP32; hambatan LDR dari lembar data GL5528. | CC BY 4.0 |
| `sensor-tanah-kapasitif`, `lembar-data-dht22`, `dht22-satu-kabel`, `hc-sr04-gema`, `tandon-hcsr04` (`.png` + `.svg`) | Diagram dan ilustrasi orisinal, digambar ulang (bukan foto atau salinan lembar data). Angka dan waktu mengikuti lembar data DHT22/AM2302 (Aosong), HC-SR04 (ElecFreaks), wiki sensor tanah kapasitif DFRobot SEN0193, dan catatan sensor tiruan dari Makerguides. | CC BY 4.0 |
| `pir-anatomi.jpg` | Foto [*PIR motion sensor for Arduino oblique view*](https://commons.wikimedia.org/wiki/File:PIR_motion_sensor_for_Arduino_oblique_view.jpg) oleh Sjilla (Wikimedia Commons), dipotong dan diperkecil, ditambah penanda dan grafik keluaran oleh penulis. Angka dari lembar data HC-SR501 dan panduan PIR Adafruit. | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), mengikuti fotonya |
| `foto-sensor-node-1.jpg` | Kolase foto Wikimedia Commons: [DHT22](https://commons.wikimedia.org/wiki/File:AM2302_%28DHT22%29_digital_temperature_and_humidity_sensor_module.jpg) oleh Suyash Dwivedi (CC BY-SA 4.0), [LDR](https://commons.wikimedia.org/wiki/File:LDR_1480405_6_7_HDR_Enhancer_1.jpg) dan [HC-SR04](https://commons.wikimedia.org/wiki/File:HC_SR04_Ultrasonic_sensor_1480322_3_4_HDR_Enhancer.jpg) oleh Nevit Dilmen (CC BY-SA 3.0), serta [PIR](https://commons.wikimedia.org/wiki/File:PIR_motion_sensor_for_Arduino_oblique_view.jpg) oleh Sjilla (CC BY-SA 4.0). Ilustrasi sensor tanah dan susunan kolase oleh penulis. | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), mengikuti foto-fotonya |
| `meja-kerja-ldr`, `meja-kerja-kapasitor`, `meja-kerja-tanah`, `meja-kerja-dht22`, `meja-kerja-pir`, `meja-kerja-hcsr04` (`.png` + `.svg`) | Ilustrasi orisinal meja kerja dua breadboard (lanjutan meja kerja Modul 5), digambar lubang demi lubang sesuai tabel di modul ini. Servo, relay, kipas, dan pompa Modul 5 tidak digambar, hanya pangkal kabelnya. | CC BY 4.0 |
| `arduino-serial-plotter`, `arduino-library-dht` (`.png` + `.svg`) | Ilustrasi orisinal yang digambar ulang dari Arduino IDE 2.3.10. Teks tombol dan dialog diambil dari kode sumber Arduino IDE dan Serial Plotter-nya. | CC BY 4.0 untuk ilustrasinya |
| `wokwi-cahaya-pertama.png`, `wokwi-plotter.png`, `wokwi-dht22.png`, `wokwi-pir.png`, `wokwi-hcsr04.png`, `wokwi-siram-ditolak.png`, `wokwi-node-1-v3.png` | Tangkapan layar simulator [Wokwi](https://wokwi.com) (Oktober 2026) yang menjalankan kode dan `diagram.json` modul ini, dipotong dan disusun ulang. Penanda dan label nama komponen oleh penulis. | © Wokwi (CodeMagic LTD); dipakai untuk tujuan pendidikan. |

Rujukan yang dipakai saat menulis:

- Espressif: [lembar data ESP32](https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf) (§5.1 batas mutlak catu, §5.3 ambang HIGH/LOW dan batas tegangan masukan), [*ESP32 Series SoC Errata*](https://www.espressif.com/sites/default/files/documentation/esp32_errata_en.pdf) (GPIO 36/39), [kalibrasi ADC ESP-IDF, bagian "Minimize Noise"](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/peripherals/adc/adc_calibration.html#minimize-noise) (kapasitor 100 nF dan pembacaan berulang), dan [ADC ESP-IDF v4.4](https://docs.espressif.com/projects/esp-idf/en/v4.4/esp32/api-reference/peripherals/adc.html) (ADC2 dan WiFi).
- Paket Arduino-ESP32 3.3.x: dokumentasi [ADC](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/adc.html) (`analogRead()` 12 bit, rentang tiap atenuasi, `analogReadMilliVolts()`).
- Lembar data sensor: [DHT22/AM2302 (Aosong)](https://files.seeedstudio.com/wiki/Grove-Temperature_and_Humidity_Sensor_Pro/res/AM2302-EN.pdf) dan [versi lamanya](https://cdn-shop.adafruit.com/datasheets/Digital+humidity+and+temperature+sensor+AM2302.pdf); [HC-SR04 (ElecFreaks)](https://cdn.sparkfun.com/datasheets/Sensors/Proximity/HCSR04.pdf); [HC-SR501](https://courses.ece.cornell.edu/ece5990/ECE5725_Spring2020_Projects/May_15_Demo/Smart%20Lock/W_pp445_yl656/datasheet/31227sc.pdf) (salinan lembar data MPJA) dan [panduan PIR Adafruit](https://learn.adafruit.com/pir-passive-infrared-proximity-motion-sensor/testing-a-pir); [LDR GL5528](https://static.rapidonline.com/pdf/58-0134_v1.pdf); [sensor tanah kapasitif DFRobot SEN0193](https://wiki.dfrobot.com/sen0193); serta catatan sensor tanah tiruan (chip NE555, resistor 1 MΩ) dari [Makerguides](https://www.makerguides.com/capacitive-soil-moisture-sensor-with-arduino/) dan lembar data [NE555 (Texas Instruments)](https://www.ti.com/lit/ds/symlink/ne555.pdf).
- Library [DHT sensor library](https://github.com/adafruit/DHT-sensor-library) 1.4.7 dan [Adafruit Unified Sensor](https://github.com/adafruit/Adafruit_Sensor) 1.1.15 (kode sumber: `NAN` saat gagal, jeda minimal 2.000 ms); kecepatan bunyi dari [HyperPhysics](http://hyperphysics.phy-astr.gsu.edu/hbase/Sound/souspe3.html).
- Arduino IDE 2.3.10: teks jendela `Install library dependencies`, menu **Tools → Serial Plotter**, dan format `nama:nilai` Serial Plotter diperiksa langsung dari kode aplikasinya.
- Dokumentasi komponen Wokwi: [DHT22](https://docs.wokwi.com/parts/wokwi-dht22), [sensor cahaya](https://docs.wokwi.com/parts/wokwi-photoresistor-sensor), [HC-SR04](https://docs.wokwi.com/parts/wokwi-hc-sr04), [PIR](https://docs.wokwi.com/parts/wokwi-pir-motion-sensor), dan [pintasan papan ketik editor diagram](https://docs.wokwi.com/guides/diagram-editor).

Semua sketsa di modul ini sudah dijalankan di Wokwi dengan paket esp32 versi 3, DHT sensor library 1.4.7, Adafruit Unified Sensor 1.1.15, dan ESP32Servo 3.2.1, dan semua pesan error yang dikutip adalah keluaran asli kompilernya.

---

[⬅️ Modul 5](../modul-05-gpio-dan-peta-pin/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · **Berikutnya: [Modul 7 — Protokol Bus Sensor: I2C, 1-Wire, SPI, Layar OLED, & Membaca Skematik](../modul-07-bus-sensor-oled-skematik/README.md) ➡️**
