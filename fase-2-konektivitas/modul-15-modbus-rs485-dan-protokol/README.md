# Modul 15 — Lab Modbus RTU/RS-485 & Memilih Protokol yang Tepat

🌐 **Bahasa Indonesia** · [English](../../en/phase-2-connectivity/module-15-modbus-rs485-and-protocols/README.md)

*Fase 2 · Minggu 15 · Perangkat keras (*hardware*): **Kit A Tahap 2** — dua modul RS-485 MAX485, kabel UTP 5 m, dan papan ESP32 kedua (papan Node 2 yang dipinjam sebentar dari kebun); ditambah Node 1, gateway Pi, dan HP dari Modul 12–14 · Prasyarat: **Modul 14** (dua papan dan Node 1 v1.3.0), **Modul 7** (bus dan skematik), dan pembagi tegangan **Modul 6** · Waktu: 8–10 jam, dicicil dalam seminggu*

[⬅️ Modul 14](../modul-14-node-2-esp-now/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · [Modul 16 ➡️ (segera terbit — baca ringkasannya di Silabus)](../../SILABUS.md#modul-16--backend-pertama-dengan-typescript-ringan-menerima-data-api--git-untuk-tim)

---

Rumah Pintar Mini sekarang punya dua perangkat: Node 1 di dalam rumah dan Node 2 di kebun, yang berbicara lewat udara. Di dunia kerja, terutama di pertanian modern, *greenhouse* (rumah kaca), dan pabrik, kamu akan sering bertemu dengan jenis perangkat yang lain lagi: **sensor industri**. Sensor tanah NPK di kebun sawit, pengukur aliran air, dan pengatur kecepatan pompa (*inverter*) jarang memakai WiFi. Mereka berbicara lewat **kabel dua kawat yang bisa sepanjang ratusan meter** (namanya **RS-485**) dengan "bahasa" yang sudah dipakai pabrik sejak 1979 (namanya **Modbus**). Minggu ini Node 1 belajar bahasa itu.

| Yang terjadi sekarang | Penyebabnya | Obatnya minggu ini |
| :--- | :--- | :--- |
| Node 1 hanya bisa membaca sensor yang dipasang langsung di pinnya, paling jauh beberapa puluh sentimeter. | Kabel sensor biasa (1-Wire, I2C, analog) tidak tahan jarak jauh dan gangguan listrik. | **RS-485**: dua kawat terpilin yang membawa sinyal **diferensial**, tahan ratusan meter (Konsep 1–3, Kemenangan Cepat) |
| Satu kabel dipakai dua arah, padahal dua alat tidak boleh "bicara" bersamaan. | RS-485 dua kawat hanya punya satu jalur. | **Modul MAX485 dan pin DE/RE**: tombol bicara *walkie-talkie* (Konsep 2, Praktik 1) |
| Sensor industri tidak mengirim apa-apa sebelum ditanya. | Sensor seperti itu memakai **Modbus RTU**: ia hanya menjawab pertanyaan. | Node 1 belajar bertanya: alamat, kode fungsi, nomor **loker** (*register*), dan CRC (Konsep 4–6, Praktik 2–4) |
| Setiap merek sensor menaruh datanya di loker yang berbeda, dengan skala yang berbeda. | Peta loker ditentukan pembuatnya, bukan standar. | **Membaca lembar data sensor RS-485** (Konsep 7) |
| Dashboard belum mengenal sensor industri. | Kontrak data belum punya kolomnya. | **Node 1 v1.4.0** dan **kontrak data 1.2**: bacaan Modbus ikut `telemetry` dan tampil di Node-RED (Praktik 5–6) |
| Kamu belum punya "peta" untuk memilih protokol: WiFi, ESP-NOW, RS-485, LoRa, Zigbee, atau NB-IoT. | Setiap protokol punya kelebihan dan harga sendiri. | **Tabel keputusan protokol** dan lima skenario soal (Konsep 8, Praktik 7) |

Di akhir minggu, papan Node 2 yang dipinjam sebentar berperan sebagai **sensor tanah RS-485 tiruan**: ia menyimpan kelembapan tanah, suhu tanah, dan EC (daya hantar listrik) di loker Modbus, persis seperti sensor tanah industri. **Node 1 v1.4.0** bertanya kepadanya setiap 10 detik lewat kabel UTP 5 m, memasukkan jawabannya ke `telemetry`, dan Node-RED menampilkannya di grup **Sensor RS-485** di HP-mu. Setelah lab selesai, papan Node 2 kembali ke kebun, sedangkan Node 1 tetap siap membaca sensor RS-485 sungguhan kelak (misalnya untuk *capstone* *smart farming* atau pertanian cerdas di Modul 31, Fase 5).

![Peta jalan Modul 15. Atas, enam fase kurikulum dari Fase 0 Fondasi (Modul 1–4) sampai Fase 5 Operasi dan skala (Modul 26–32); Fase 2 Konektivitas, Modul 10 sampai 15, disorot. Modul 1 sampai 14 bertanda selesai, dan Modul 15 ditandai KAMU DI SINI dengan catatan: Node 1 membaca sensor industri lewat kabel RS-485, checkpoint Fase 2. Di bawahnya, kotak Modul 15 minggu ini, 8 sampai 10 jam dicicil, dengan Kit A Tahap 2: dua modul MAX485, kabel UTP 5 m, resistor 4,7 kiloohm dan 10 kiloohm, dan papan kedua (Node 2 dipinjam). Daftar kegiatan: Kemenangan Cepat, halo lewat dua kawat; Praktik 1, walkie-talkie, bergantian bicara (DE/RE); Praktik 2, sensor tanah RS-485 tiruan di papan kedua; Praktik 3, bingkai Modbus dengan tangan; Praktik 4, ModbusMaster membaca tiga loker; Praktik 5, Node 1 v1.4.0, sensor RS-485 masuk telemetry; Praktik 6, grup Sensor RS-485 di Node-RED dengan kabel 5 m; Praktik 7, memilih protokol untuk lima skenario; dan Tambahan: kontrak 1.2, peta pin 6, simpan. Praktik 5, 6, 7, dan Tambahan bertanda bintang, wajib untuk lulus. Catatan bawah: Wokwi belum punya komponen RS-485 dan belum bisa menyambungkan dua ESP32; jalur Wokwi memakai chip tiruan Sensor Tanah RS-485 untuk menguji bahasa Modbus-nya (Praktik 3–5); kabel 5 m dan dua papan yang bercakap lewat kabel butuh papan asli.](aset/peta-jalan-modul-15.png)

> [!NOTE]
> **Cara memakai modul ini.**
>
> - **Dua papan, dua jendela.** Seperti Modul 14, kamu sering mencolokkan dua ESP32 ke laptop sekaligus: papan **Node 1** dan papan **kedua** (papan Node 2 yang dipinjam, atau ESP32 ketiga kalau kamu punya). Buka setiap sketsa di **jendela Arduino IDE sendiri**: setiap jendela punya pilihan papan, port, dan Serial Monitor sendiri.
> - **Setiap kotak perintah disertai keterangan tempatnya:** **Serial Monitor Node 1**, **Serial Monitor papan kedua**, **editor Node-RED** (browser), **di Pi** (terminal SSH), atau **di laptop**. Alamat `192.168.1.37` dan `device_id` Node 1 `a4cf12e5b7c0` hanya contoh; pakai milikmu sendiri.
> - **Kotak Hasilnya.** Semua sketsa dan firmware modul ini sudah dikompilasi dengan paket esp32 3.3.12. Sketsa yang bisa disimulasikan sudah dijalankan di Wokwi dengan "sensor tanah RS-485" tiruan, dan sketsa sensor tiruannya sudah diuji di Wokwi dengan dua UART yang disilang. Keluaran dua papan sungguhan yang tersambung kabel RS-485 ditandai **contoh**: angka milidetik di layarmu bisa sedikit berbeda. Tangkapan layar Node-RED adalah tangkapan asli dengan data Node 1 tiruan.
> - **Belum punya modul MAX485 atau papan kedua?** Ikuti **jalur Wokwi**. Wokwi tidak punya komponen RS-485 dan belum bisa menyambungkan dua ESP32, jadi modul ini menyediakan **chip tiruan** "Sensor Tanah RS-485" untuk Wokwi. Chip itu meniru bahasa Modbus-nya (bingkai, CRC, alamat, loker), bukan listrik kabelnya. Uji kabel 5 m tetap butuh papan asli. Kriteria lulus jalur Wokwi ada di ✅.
> - **Belum punya Raspberry Pi?** Ikuti **jalur laptop** seperti Modul 12–14: broker dan Node-RED berjalan di laptop, dan alamat `192.168.1.37` diganti dengan alamat IP laptopmu ([tabel 8.2 Modul 13](../modul-13-node-red-dashboard/README.md#82-sesuaikan-alamat-di-semua-langkah)).
> - Pengguna macOS: ganti **Ctrl** dengan **Cmd** untuk pintasan di browser dan di editor Node-RED, kecuali disebut lain.

> [!WARNING]
> **Aturan aman minggu ini.**
>
> 1. **Modul MAX485 diberi 5 V, dan kaki RO-nya selalu lewat pembagi tegangan.** RO mengeluarkan hampir 5 V, padahal pin ESP32 hanya tahan sampai 3,6 V. Pembaginya sama dengan pembagi di kaki ECHO HC-SR04 di Modul 6: 4,7 kΩ dan 10 kΩ (Kemenangan Cepat langkah 3). Jangan memberi modul MAX485 3,3 V: modul ini dibuat untuk 5 V.
> 2. **Aturan emas catu daya Modul 5 tetap berlaku di Node 1.** Modul MAX485 Node 1 mendapat 5 V dari rel atas (MB102). Urutannya: USB dulu, baru MB102; matikan MB102 dulu, baru cabut USB.
> 3. **Aturan baterai Modul 9 tetap berlaku di papan Node 2.** Sebelum papan Node 2 dicolokkan ke laptop, cabut dulu kabel VIN dan GND-nya dari rangkaian baterai. Selama lab, papan itu hidup dari USB laptop.
> 4. **Cabut listrik sebelum mengubah kabel** (aturan keselamatan Modul 5), termasuk saat menukar kawat A dan B.
> 5. **Sensor RS-485 sungguhan sering butuh 12–24 V** dari adaptor sendiri. Jangan pernah menyambung kabel catu sensor itu ke pin ESP32 atau ke rel breadboard. Konsep 7 dan 🧩 Tingkat 3 menjelaskan cara menyambungnya dengan aman.

Ritme modul ini sama dengan Modul 1–14. Bagian lipat di 🚨 (klik judulnya) cukup dibuka saat kamu membutuhkannya; bagian lipat di 🔬 boleh dilewati. Setiap praktik diawali kotak **🖥️** yang menyebut alat yang dipakai.

## Daftar isi

1. [🎯 Setelah modul ini kamu bisa…](#-setelah-modul-ini-kamu-bisa)
2. [🧰 Yang perlu disiapkan](#-yang-perlu-disiapkan)
3. [🏆 Kemenangan Cepat: halo lewat dua kawat (55 menit)](#-kemenangan-cepat-halo-lewat-dua-kawat-55-menit)
4. [🧠 Konsep "Mengapa"](#-konsep-mengapa)
   - [1 Sensor industri](#1-sensor-industri-dan-kabel-ratusan-meter) · [2 Setengah dupleks](#2-satu-pasang-kawat-dua-arah-max485-dan-tombol-bicara-dere) · [3 Bus RS-485](#3-bus-rs-485-rantai-terminator-dan-gnd-bersama) · [4 Modbus](#4-modbus-rtu-bertanya-ke-loker-bernomor) · [5 Bingkai & CRC](#5-bingkai-dan-crc-surat-bersegel) · [6 Angka di loker](#6-angka-di-loker-16-bit-skala-tanda-dan-nomor-yang-bergeser) · [7 Lembar data](#7-membaca-lembar-data-sensor-rs-485) · [8 Memilih protokol](#8-memilih-protokol-yang-tepat)
5. [🔧 Praktik langkah demi langkah](#-praktik-langkah-demi-langkah)
   - [1 *Walkie-talkie*](#praktik-1--walkie-talkie-bergantian-bicara-lewat-satu-pasang-kawat-30-menit) · [2 Sensor tiruan](#praktik-2--sensor-tanah-rs-485-tiruan-di-papan-kedua-30-menit) · [3 Bingkai manual](#praktik-3--bingkai-modbus-dengan-tangan-40-menit) · [4 ModbusMaster](#praktik-4--modbusmaster-membaca-tiga-loker-40-menit) · [5 Node 1 v1.4.0](#praktik-5--node-1-v140-sensor-rs-485-masuk-telemetry-50-menit) · [6 Dashboard & kabel 5 m](#praktik-6--grup-sensor-rs-485-di-node-red-dan-uji-kabel-5-m-45-menit) · [7 Memilih protokol](#praktik-7--memilih-protokol-tabel-keputusan-dan-lima-skenario-40-menit)
6. [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)
7. [🔬 Bedah Teknis (opsional)](#-bedah-teknis-opsional)
8. [🧩 Tantangan mandiri](#-tantangan-mandiri)
9. [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini)
10. [📖 Glosarium](#-glosarium) · [📝 Kuis](#-kuis-5-soal) · [✅ Checklist kelulusan](#-checklist-kelulusan-modul-15)
11. [📚 Sumber & atribusi gambar](#-sumber--atribusi-gambar)

---

## 🎯 Setelah modul ini kamu bisa…

1. **Menjelaskan mengapa sensor pertanian dan pabrik memakai RS-485**: sinyal diferensial di sepasang kawat terpilin yang tahan gangguan sampai ratusan meter, dan mengapa satu kabel dipakai bergantian (setengah dupleks).
2. **Merakit dua modul MAX485** dengan pembagi tegangan di kaki RO dan pin DE/RE, lalu mengatur arah bicara dari kode tanpa memotong huruf terakhir.
3. **Memahami Modbus RTU sampai ke byte-nya**: klien (*client*) dan server (dulu disebut *master* dan *slave*), alamat, kode fungsi 03, 04, dan 06, loker (*register*) *holding* dan *input*, CRC, *exception* (penolakan resmi), dan *timeout* (batas waktu habis).
4. **Menjadikan ESP32 sebuah sensor Modbus tiruan** dengan library **ModbusRTUSlave** dan membacanya dengan library **ModbusMaster**.
5. **Membaca lembar data sensor RS-485 sungguhan**: catu daya, warna kabel, laju baud, alamat, peta loker, skala, dan nomor yang bergeser satu.
6. **Memasukkan bacaan Modbus ke `telemetry`** sesuai kontrak data 1.2 dan menampilkannya di dashboard Node-RED.
7. **Memilih protokol yang tepat** (WiFi, ESP-NOW, RS-485/Modbus, LoRa/LoRaWAN, Zigbee/Thread, NB-IoT/LTE-M) untuk masalah nyata dengan tabel keputusan.

## 🧰 Yang perlu disiapkan

| Barang | Keterangan |
| :--- | :--- |
| **Dua modul "TTL to RS485" MAX485** | Papan kecil biru dengan chip MAX485, empat kaki di satu sisi (**RO**, **RE**, **DE**, **DI**), empat kaki di sisi lain (**VCC**, **B**, **A**, **GND**), dan terminal sekrup **A** dan **B**. Satu untuk Node 1, satu untuk papan kedua. |
| **Papan kedua** | Papan Node 2 dari Modul 14, dipinjam selama lab. Sensor-sensornya boleh tetap terpasang. Punya ESP32 ketiga? Pakai itu supaya Node 2 tetap di kebun, dan siapkan breadboard cadangan 400 lubang untuk pembaginya (Kemenangan Cepat langkah 4). |
| **Resistor** | 2 × **4,7 kΩ** (kuning-ungu-merah, atau kuning-ungu-hitam-cokelat untuk kode 5 gelang) dan 2 × **10 kΩ** (cokelat-hitam-oranye, atau cokelat-hitam-hitam-merah). Satu pasang untuk setiap modul MAX485. |
| **Kabel jumper** | Jantan–betina 12 buah, betina–betina 4 buah, dan jantan–jantan 2 buah, ditambah beberapa cadangan. Yang 20 cm lebih leluasa. Untuk kabel VCC modul Node 1 (Kemenangan Cepat langkah 3), pakai yang paling panjang: kabel itu menyusur sisi kiri meja kerja sampai rel atas. |
| **Kabel UTP (kabel LAN) 5 m** | Untuk Praktik 6. Kabel LAN bekas juga boleh: potong konektornya, lalu kupas ujung kawatnya sekitar 7 mm. Kawat UTP yang kaku (*solid*) bisa langsung ditancapkan ke breadboard. Kawat serabut (kabel LAN yang lentur) tidak: untuk kawat GND-nya, lilitkan ujung serabut erat-erat ke kaki logam kabel jumper jantan–jantan, bungkus dengan selotip, lalu tancapkan kabel jumper itu (Praktik 6.4). |
| **Obeng minus kecil** | Untuk terminal sekrup modul MAX485. |
| **Tang kupas kabel** (atau tang potong dan *cutter*) | Untuk Praktik 6: mengupas selubung luar kabel UTP sekitar 3 cm dan ujung tiga kawatnya sekitar 7 mm. |
| **Multimeter** | Untuk mengukur tegangan VIN papan kedua dan memeriksa pembagi tegangan. |
| **Node 1 v1.3.0, gateway Pi, Node-RED, dan HP** | Semuanya dari Modul 12–14. |
| **Laptop** | **Arduino IDE 2** dengan paket **esp32 3.3.12**, library dari Modul 6–14, **MQTTX**, terminal untuk SSH ke Pi, **VS Code** dengan folder `rumah-pintar-mini`, dan **GitHub Desktop**. |
| **Dua kabel USB data** | Supaya Node 1 dan papan kedua bisa tercolok bersamaan. |
| **Jalur Wokwi** (tanpa modul MAX485 atau tanpa papan kedua) | Akun [Wokwi](https://wokwi.com) seperti Modul 2–14. Chip tiruan "Sensor Tanah RS-485" ada di folder [`kode/wokwi-sensor-tanah-rs485`](kode/wokwi-sensor-tanah-rs485). |
| **Opsional** | Konverter USB–RS485 (Rp15–30 ribu) untuk membaca bus dari laptop (🔬), sensor tanah RS-485 sungguhan (Rp150–250 ribu, bersama adaptor 12 V) untuk 🧩 Tingkat 3, dan dua resistor 470–560 Ω (🚨). |

**Pasang dua library baru.** Klik ikon **Library Manager** di bilah kiri Arduino IDE, lalu:

1. Ketik `ModbusMaster`, cari entri **ModbusMaster by Doc Walker**, pilih versi **2.0.1**, lalu klik **INSTALL**. Library ini dipakai Node 1 untuk **bertanya**.
2. Ketik `ModbusRTUSlave`, cari entri **ModbusRTUSlave by C. M. Bulliner**, pilih versi **3.1.2**, lalu klik **INSTALL**. Kalau muncul jendela `Install library dependencies`, klik **INSTALL ALL**: library ini butuh tiga library kecil buatan orang yang sama (**ModbusADU**, **ModbusRTUComm**, dan **ModbusSlaveLogic**). Library ini dipakai papan kedua untuk **menjawab**.

Versi yang dipakai modul ini (Oktober 2026): paket **esp32 3.3.12**, **ModbusMaster 2.0.1**, **ModbusRTUSlave 3.1.2** (ikut terpasang: **ModbusADU 1.0.2**, **ModbusRTUComm 1.3.2**, **ModbusSlaveLogic 1.0.1**), dan library Node 1 dari Modul 6–14. Silabus semula menyebut library **eModbus** untuk papan kedua. Modul ini menggantinya dengan **ModbusRTUSlave** karena eModbus tidak ada di Library Manager dan butuh pemasangan manual yang lebih rumit; 🔬 membahas kapan eModbus layak dipakai.

---

## 🏆 Kemenangan Cepat: halo lewat dua kawat (55 menit)

Targetnya: papan kedua mengirim `halo 1`, `halo 2`, dan seterusnya lewat **dua kawat** (A dan B), dan Serial Monitor Node 1 menampilkannya. Sekalian, kedua modul MAX485 terpasang dengan benar dan siap dipakai sepanjang minggu ini.

> 🖥️ **Alat:** **Arduino IDE** dengan dua jendela, papan Node 1 dan papan kedua tercolok ke laptop lewat USB, multimeter, dan obeng kecil. Dari Kemenangan Cepat sampai Praktik 4, papan Node 1 menjalankan sketsa latihan, jadi di dashboard Node 1 tertulis `offline` dan otomasi kipas berhenti. Itu wajar; Praktik 5 memasang lagi firmware Node 1, kali ini versi 1.4.0. Nama dan kata sandi WiFi yang tersimpan di papan Node 1 tetap aman selama pilihan **Tools → Erase All Flash Before Sketch Upload** tetap **Disabled** (bawaannya).
>
> 🖥️ **Jalur Wokwi:** Kemenangan Cepat dan Praktik 1 butuh dua papan yang bercakap lewat kabel, sedangkan Wokwi belum bisa menyambungkan dua ESP32 (dicek di FAQ Wokwi, Oktober 2026). Baca langkah-langkahnya beserta hasilnya, lalu lanjut ke Konsep 1–3. Buat juga `catatan-modul15.md` seperti di akhir langkah 4 (tanpa angka VIN): Praktik 7 dan 🧩 memakainya. Jalur Wokwi mulai dipakai di Praktik 3.

### Langkah 1 — Siapkan kedua papan (5 menit)

1. Tempel label **Node 1** dan **papan kedua** di kedua papan dan kabel USB-nya. Label **Node 2** dari Modul 14 boleh tetap ada; selama lab, papan itu kita sebut "papan kedua".
2. **Papan kedua:** memakai ESP32 ketiga? Lewati butir ini: Node 2 tetap di kebun, dan langkah 4 menjelaskan breadboard untuk ESP32 ketigamu. Memakai papan Node 2? Ambil papan itu dari tempatnya. Lepas dulu dua kabel yang menuju rangkaian baterai (aturan Modul 9, seperti di Modul 14): kabel dari pin **VIN** ke rel atas (+) kolom 29 dan kabel dari pin **GND** deretan kiri (tepat di atas VIN) ke rel atas (−) kolom 28. Cabut kedua ujung setiap kabel (dari pin papan dan dari rel atas), lalu simpan kabelnya: pin **VIN** dipakai modul MAX485 di langkah 4. Kabel hitam dari pin **GND** deretan kanan (di atas 3V3) ke rel bawah (−) **jangan** dicabut: kabel itulah yang memberi GND ke modul MAX485 di langkah 4. USB-nya belum perlu dicolokkan. Baterainya boleh tetap di dudukannya, tetapi selama itu rel atas (+) tetap berisi 5,0 V, jadi jangan menancapkan apa pun ke rel atas. Rangkaian baterai tidak dipakai selama lab. Sensor-sensor Node 2 juga boleh tetap terpasang.
3. **Papan Node 1:** matikan MB102 meja kerja dulu, lalu cabut kabel USB papan dari *charger*-nya. Jangan colokkan ke laptop dulu: langkah 2 dan 3 mengubah kabel, jadi papan harus tanpa listrik.

Sejak papan Node 2 dicabut dari baterainya, Node 1 tidak lagi mendengar paket ESP-NOW-nya. Kalau Node 1 masih menjalankan firmware v1.3.0, status Node 2 di dashboard berubah menjadi `offline` setelah 16 menit. Itu wajar: Node 1 memang bertugas melaporkan Node 2 yang tidak terdengar.

### Langkah 2 — Geser LED status Node 1 satu kolom ke kiri (5 menit)

Mulai minggu ini, pin **D4** dipakai untuk mengatur arah bicara modul MAX485 (pin DE/RE, Konsep 2). LED status yang selama ini di D4 pindah ke **D2**. Mengapa bukan modul MAX485 saja yang memakai D2? Modul MAX485 menarik pin DE/RE-nya ke 5 V lewat resistor. Kalau pin itu D2, papan bisa gagal masuk mode unggah (🚨 punya ceritanya). D4 tidak punya masalah itu.

Semua sambungan di langkah ini ada di **breadboard bawah**, dan USB papan Node 1 tetap tercabut.

| Komponen | Posisi lama | Posisi baru |
| :--- | :--- | :--- |
| Resistor 220 Ω | 8e → 8g | **7e → 7g** (7e = jalur kaki D2) |
| LED merah | kaki panjang 8i, kaki pendek 9i | kaki panjang **7i**, kaki pendek **8i** |
| Kabel hitam | 9j → rel bawah (−) | **8j** → rel bawah (−); ujung di rel tidak perlu dipindah |

Setelah langkah ini, **jalur kolom 8 baris f–j adalah jalur katoda LED (GND)**, sedangkan kolom 9 baris f–j kosong dan siap dipakai di langkah 3.

### Langkah 3 — Rakit modul MAX485 di Node 1 (15 menit)

Modul MAX485 tidak ditancapkan ke breadboard. Kakinya terlalu berjauhan, jadi kaki-kakinya disambung kabel jantan–betina: ujung betina di kaki modul, ujung jantan di breadboard. Letakkan modulnya di meja, di sisi bawah breadboard bawah seperti di gambar (bukan di kolongnya), dengan terminal sekrupnya menghadap keluar. Sebelum mulai, pastikan USB papan Node 1 masih tercabut dan MB102 mati.

![Ilustrasi meja kerja Node 1 setelah Langkah 3, dilihat dari atas, dengan komponen lama dipudarkan. Di breadboard bawah, yang baru disorot: LED status pindah ke D2, yaitu resistor 220 ohm dari 7e ke 7g, LED merah dengan kaki panjang di 7i dan kaki pendek di 8i, dan kabel hitam dari 8j ke rel bawah minus kolom 8; resistor 10 kiloohm cokelat-hitam-oranye berbaring di baris c dari 5c ke 9c; resistor 4,7 kiloohm kuning-ungu-merah dari 9e ke 9g menyeberangi parit tengah. Modul MAX485 biru terletak di meja, di sisi bawah breadboard bawah (bukan di kolongnya), kaki DI, DE, RE, dan RO menghadap breadboard, terminal sekrupnya menghadap keluar. Kabelnya: RO hijau ke 9i, DE kuning ke 8e, RE merah muda ke 8d, DI biru ke 10e, GND hitam ke rel bawah minus kolom 14, dan VCC merah menyusur sisi kiri meja ke rel atas plus kolom 3 yang berisi 5 volt dari MB102. Kaki A dan B belum disambung. Kotak perbesaran kolom 3 sampai 15 memberi nomor 1 sampai 7 pada sambungan di dalam kotak (kabel VCC disebut di catatan samping), dan menegaskan bahwa kolom 9 baris a sampai e adalah jalur RX2, titik tengah pembagi, sedangkan kolom 9 baris f sampai j adalah jalur RO yang hanya terhubung lewat resistor 4,7 kiloohm; lubang 8c di bawah badan resistor 10 kiloohm dibiarkan kosong.](aset/rangkaian-rs485-node1.png)

| Komponen | Dari | Ke | Gunanya |
| :--- | :--- | :--- | :--- |
| Resistor **10 kΩ** (cokelat-hitam-oranye) | 9c | 5c | resistor bawah pembagi: dari jalur RX2 ke jalur GND |
| Resistor **4,7 kΩ** (kuning-ungu-merah) | 9e | 9g | resistor atas pembagi; menyeberangi parit tengah |
| Kabel jantan–betina | kaki **RO** modul | 9i | keluaran penerima modul (5 V) masuk ke pembagi |
| Kabel jantan–betina | kaki **DE** modul | 8e | jalur D4 |
| Kabel jantan–betina | kaki **RE** modul | 8d | jalur D4 juga: DE dan RE kini disatukan oleh jalur kolom 8 |
| Kabel jantan–betina | kaki **DI** modul | 10e | jalur TX2 (GPIO 17) |
| Kabel jantan–betina **hitam** | kaki **GND** modul | rel bawah (−) kolom 14 | GND bersama |
| Kabel jantan–betina **merah** | kaki **VCC** modul | rel atas (+) kolom 3 | 5 V dari MB102, **bukan** rel bawah yang 3,3 V |

Pola pembagi ini sama dengan pembagi ECHO HC-SR04 di Modul 6: dari 5 V, titik tengahnya mendapat 5 × 10 / (4,7 + 10) ≈ **3,4 V**, aman untuk pin ESP32. Titik tengahnya adalah jalur RX2 (kolom 9 baris a–e), tempat kaki RX2 papan tertancap.

> 💡 **Awas dua belahan kolom 9.** Kolom 9 **di atas** parit (9a–9e) adalah jalur kaki **RX2**. Kolom 9 **di bawah** parit (9f–9j) adalah jalur kaki **RO** modul. Satu-satunya penghubung keduanya adalah resistor 4,7 kΩ. Kalau kabel RO tertancap di 9a–9e, hampir 5 V masuk langsung ke RX2.

Periksa sebelum menyalakan (dengan mata dan jari):

- Kabel merah VCC modul masuk rel **atas** (+), yang berlabel **5V**, bukan rel bawah (+) yang berlabel **3V3**.
- Lubang **8c**, tepat di bawah badan resistor 10 kΩ (9c–5c), dibiarkan kosong: kabel DE di **8e**, RE di **8d**.
- Kabel RO di 9i, **bukan** 9a–9e.

### Langkah 4 — Rakit modul MAX485 di papan kedua (10 menit)

Papan kedua tidak tertancap di breadboard, jadi pembagi tegangannya dipasang di **belahan bawah breadboard mini** (baris f–j), yang masih kosong. Rangkaian baterai di belahan atas tidak disentuh. Pastikan USB papan kedua tercabut. Memakai ESP32 ketiga? Siapkan breadboard 400 lubang seperti breadboard mini Node 2, sambungkan dulu pin **GND** papan (deretan kanan, di atas 3V3) ke rel bawah (−) kolom 28 dengan kabel jantan–betina hitam seperti Modul 14 Praktik 2.2, lalu ikuti tabel di bawah. Langkah 1 butir 2 dan ➕ A langkah 2–5 tidak berlaku untukmu, tetapi ➕ A langkah 1 (`rs485 off` dan melepas kabel UTP dari Node 1) tetap dikerjakan.

![Ilustrasi Langkah 4 dalam dua panel. Panel atas, perbesaran belahan bawah breadboard mini kolom 11 sampai 30, baris f sampai j dan rel bawah, dengan nomor 1 sampai 8: kabel hijau RO modul masuk 14f; resistor 4,7 kiloohm kuning-ungu-merah dari 14h ke 18h; resistor 10 kiloohm cokelat-hitam-oranye dari 18i ke 22i; kabel hitam dari 22j ke rel bawah minus kolom 22; kabel ungu dari 18f ke pin RX2 papan; kabel kuning DE ke 24f dan kabel merah muda RE ke 24g; kabel cokelat dari 24i ke pin D4 papan; kabel hitam GND modul ke rel bawah minus kolom 23. Kabel pudar adalah kabel Modul 14 yang tetap terpasang: sensor Node 2, 3V3 papan di rel plus kolom 29, dan GND papan di rel minus kolom 28. Belahan atas berisi rangkaian baterai Modul 9 dan tidak disentuh. Panel bawah, peta kabel antara modul MAX485 dan papan kedua: kabel biru DI ke pin TX2 dan kabel merah VCC ke pin VIN, keduanya betina–betina; ujung kabel DE, RE, dan RO menuju 24f, 24g, dan 14f; GND modul menuju rel bawah minus 23; pin RX2 dan D4 papan menerima kabel dari 18f dan 24i; kaki A dan B baru disambung di Langkah 5. USB papan kedua ke laptop dicolokkan setelah semua kabel terpasang.](aset/rangkaian-rs485-papan-kedua.png)

| Komponen | Dari | Ke | Gunanya |
| :--- | :--- | :--- | :--- |
| Kabel jantan–betina | kaki **RO** modul | 14f | keluaran penerima modul masuk ke pembagi |
| Resistor **4,7 kΩ** | 14h | 18h | resistor atas pembagi |
| Resistor **10 kΩ** | 18i | 22i | resistor bawah pembagi |
| Kabel jantan–jantan **hitam** | 22j | rel bawah (−) kolom 22 | ujung pembagi ke GND |
| Kabel jantan–betina | 18f | pin **RX2** papan | titik tengah pembagi (sekitar 3,2 V) ke RX2 (GPIO 16) |
| Kabel jantan–betina | kaki **DE** modul | 24f | |
| Kabel jantan–betina | kaki **RE** modul | 24g | DE dan RE disatukan oleh jalur kolom 24 |
| Kabel jantan–betina | 24i | pin **D4** papan | jalur DE/RE ke D4 |
| Kabel betina–betina | kaki **DI** modul | pin **TX2** papan | TX2 (GPIO 17) |
| Kabel betina–betina **merah** | kaki **VCC** modul | pin **VIN** papan | 5 V dari USB laptop, lewat pin VIN |
| Kabel jantan–betina **hitam** | kaki **GND** modul | rel bawah (−) kolom 23 | GND bersama |

Rel bawah (−) breadboard mini sudah tersambung ke GND papan lewat kabel hitam Modul 14. Rel **atas** (−) tidak: kabel GND ke rangkaian baterai sudah dicabut di langkah 1, jadi jangan pakai rel atas.

Sekarang ukur tegangan VIN. Kaki VCC dan GND modul sudah tertutup ujung betina kabel, jadi ukurlah di papan kedua. Tancapkan satu kabel cadangan ke lubang kosong di rel bawah (−) breadboard mini sebagai perpanjangan *probe* (Modul 5). Colokkan USB papan kedua ke laptop, lalu putar multimeter ke **V⎓ 20** (*probe* merah di lubang **VΩmA**, bukan **10A**). Tempelkan *probe* hitam ke ujung logam kabel cadangan tadi dan *probe* merah ke titik solder kaki **VIN** di permukaan atas papan kedua (di sebelah tulisan VIN). Hati-hati: ujung *probe* merah tidak boleh ikut menyentuh titik solder **GND** tepat di sebelahnya. Layar biasanya menunjukkan **sekitar 4,6–4,8 V**, bukan 5,0 V, karena papan ESP32 punya dioda pelindung di antara colokan USB dan pin VIN. Lembar data MAX485 meminta 4,75–5,25 V; untuk lab di meja dengan kabel 5 m dan laju 9600 baud, angka sedikit di bawahnya masih cukup. Kalau kelak dipasang permanen, beri modul 5 V penuh seperti di Node 1. Angkanya minus? *Probe* merah dan hitam tertukar. Angkanya **0**? Cabut USB, pastikan kabel cadangan ada di rel bawah (−) dan kabel hitam Modul 14 dari pin **GND** deretan kanan ke rel bawah (−) masih terpasang, colokkan lagi USB-nya, lalu ukur ulang dengan ujung *probe* merah menempel kuat di titik solder VIN. Lihat juga lampu kecil di modul MAX485 papan kedua: selama USB tercolok, lampu itu harus menyala. Kalau padam, cabut USB, lalu periksa kabel VCC modul ke pin **VIN** dan kabel GND modul ke rel bawah (−) kolom 23.

Buat file `catatan-modul15.md` di folder `modul-15` repositori `belajar-iot` (**Documents → GitHub → belajar-iot → modul-15**; buat foldernya kalau belum ada, seperti Modul 14). Di VS Code: **File → New Text File**, kemudian **File → Save As…**. Tulis angka VIN itu di sana. File ini dipakai lagi di Praktik 6 dan 7.

### Langkah 5 — Sambungkan kedua modul (5 menit)

Cabut lagi USB papan kedua, lalu cabut juga kabel cadangan *probe* dari rel bawah (−) breadboard mini. Untuk Kemenangan Cepat sampai Praktik 5, kedua modul disambung kabel pendek; kabel UTP 5 m baru dipasang di Praktik 6. Jadi, letakkan breadboard mini papan kedua rapat di samping breadboard bawah meja kerja Node 1, dengan kedua modul MAX485 berdekatan: ketiga kabel di bawah ini hanya sekitar 20 cm.

1. Pasang kabel betina–betina dari kaki **A** modul Node 1 ke kaki **A** modul papan kedua.
2. Pasang kabel betina–betina dari kaki **B** modul Node 1 ke kaki **B** modul papan kedua.
3. Pasang kabel jantan–jantan hitam dari **rel bawah (−) kolom 15** meja kerja Node 1 ke **rel bawah (−) kolom 20** breadboard mini. Inilah kawat ketiga, **GND bersama** (Konsep 3).

**A ke A, B ke B.** Jangan disilang. Kalau kedua modulmu sama persis (biasanya dibeli sepasang dari penjual yang sama), tulisan A dan B-nya cocok. Modul dari pembuat lain? Tetap mulai dengan A ke A. Kalau pesan `halo` tidak muncul di langkah 6, tukar A dan B di salah satu modul dengan listrik dicabut, seperti di langkah 7: menukarnya tidak merusak apa pun. Resistor kecil bertulisan "121" di dekat terminal sekrup (terminator 120 Ω) biarkan saja: dua modul di dua ujung kabel memang butuh dua terminator (Konsep 3).

### Langkah 6 — Unggah sketsa dan lihat `halo`-nya (10 menit)

1. Colokkan USB **papan kedua** ke laptop. Di jendela Arduino IDE pertama, buka **File → New Sketch**, hapus isinya, lalu tempel kode di bawah ini. Simpan sebagai `modul15_halo_kirim` di folder `modul-15`. Pilih **DOIT ESP32 DEVKIT V1** dan port papan kedua, lalu klik **Upload**.

   ```cpp
   // Modul 15 - Kemenangan Cepat, papan KEDUA (papan Node 2 yang dipinjam): si pengirim.
   // Setiap detik mengirim satu baris teks lewat modul MAX485 ke kabel RS-485.
   // Papan ini "bicara terus": DE/RE dibuat HIGH sekali di setup() dan tidak pernah diturunkan.
   // Paket esp32 3.3.12; tidak butuh library tambahan.

   const int PIN_RS485_RX = 16;    // RX2 <- RO modul MAX485 (lewat pembagi tegangan); belum dipakai di sketsa ini
   const int PIN_RS485_TX = 17;    // TX2 -> DI modul MAX485
   const int PIN_RS485_DE_RE = 4;  // D4 -> DE dan RE modul MAX485 yang disatukan

   unsigned long nomor = 0;

   void setup() {
     Serial.begin(115200);
     delay(1000);
     pinMode(PIN_RS485_DE_RE, OUTPUT);
     digitalWrite(PIN_RS485_DE_RE, HIGH);  // HIGH = pemancar modul menyala: papan ini memegang kabel untuk bicara
     // Pin WAJIB ditulis: tanpa pin, paket esp32 3.x memakai GPIO 4 dan 25 untuk Serial2, bukan 16 dan 17.
     Serial2.begin(9600, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);
     Serial.println();
     Serial.println("Papan kedua siap mengirim lewat RS-485 (9600 baud).");
   }

   void loop() {
     nomor++;
     Serial2.printf("halo %lu dari papan kedua\n", nomor);  // ke kabel RS-485
     Serial.printf("terkirim: halo %lu\n", nomor);          // ke Serial Monitor papan ini
     delay(1000);
   }
   ```

2. Colokkan USB **papan Node 1** ke laptop, **baru** nyalakan MB102 (aturan emas: USB dulu, baru MB102). Modul MAX485 Node 1 kini mendapat 5 V; lampu kecil di modul menyala.
3. Buka **File → New Sketch** lagi. Arduino IDE membuka jendela kedua. Hapus isinya, tempel kode di bawah ini, lalu simpan sebagai `modul15_halo_dengar` di folder `modul-15`. Di jendela kedua ini, pilih **DOIT ESP32 DEVKIT V1** dan port papan Node 1 (sketsa latihan kecil muat di rak program bawaan, seperti di Modul 14), klik **Upload**, lalu buka **Serial Monitor** jendela ini (115200 baud). Ragu port yang mana? Cabut papan kedua sebentar: port yang tetap ada adalah milik Node 1.

   ```cpp
   // Modul 15 - Kemenangan Cepat, papan NODE 1: si pendengar.
   // Menampilkan setiap baris teks yang tiba lewat kabel RS-485. Papan ini "diam terus":
   // DE/RE dibuat LOW sekali di setup(), jadi pemancar modul MAX485-nya tidak pernah menyala.
   // Paket esp32 3.3.12; tidak butuh library tambahan.

   const int PIN_RS485_RX = 16;    // RX2 <- RO modul MAX485, lewat pembagi tegangan 4,7 kΩ + 10 kΩ
   const int PIN_RS485_TX = 17;    // TX2 -> DI modul MAX485; belum dipakai di sketsa ini
   const int PIN_RS485_DE_RE = 4;  // D4 -> DE dan RE modul MAX485 yang disatukan

   char baris[80];  // huruf yang sedang dikumpulkan sampai tanda akhir baris
   int panjang = 0;
   unsigned long waktuHurufTerakhir = 0;
   unsigned long waktuCetakTerakhir = 0;

   // Mencetak isi "baris". Kalau ada huruf yang tidak bisa dibaca, semua isinya dicetak sebagai angka heksadesimal.
   void cetakBaris(bool utuh) {
     bool semuaTeks = utuh;
     for (int i = 0; i < panjang; i++) {
       uint8_t b = (uint8_t)baris[i];
       if (b < 32 || b > 126) {
         semuaTeks = false;
       }
     }
     baris[panjang] = '\0';
     if (semuaTeks) {
       Serial.printf("diterima: %s\n", baris);
     } else {
       Serial.print("diterima, tetapi bukan teks yang utuh:");
       for (int i = 0; i < panjang; i++) {
         Serial.printf(" %02X", (uint8_t)baris[i]);
       }
       Serial.println();
     }
     panjang = 0;
     waktuCetakTerakhir = millis();
   }

   void setup() {
     Serial.begin(115200);
     delay(1000);
     pinMode(PIN_RS485_DE_RE, OUTPUT);
     digitalWrite(PIN_RS485_DE_RE, LOW);  // LOW = penerima modul menyala, pemancarnya mati: papan ini hanya mendengar
     // Pin WAJIB ditulis: tanpa pin, paket esp32 3.x memakai GPIO 4 dan 25 untuk Serial2, bukan 16 dan 17.
     Serial2.begin(9600, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);
     Serial.println();
     Serial.println("Papan Node 1 mendengarkan kabel RS-485 (9600 baud)...");
     waktuCetakTerakhir = millis();
   }

   void loop() {
     while (Serial2.available() > 0) {
       char huruf = Serial2.read();
       waktuHurufTerakhir = millis();
       if (huruf == '\n') {
         cetakBaris(true);  // satu baris lengkap
       } else if (huruf != '\r') {
         baris[panjang] = huruf;
         panjang++;
         if (panjang >= (int)sizeof(baris) - 1) {
           cetakBaris(false);  // terlalu panjang tanpa akhir baris: pasti bukan kiriman yang benar
         }
       }
     }
     if (panjang > 0 && millis() - waktuHurufTerakhir > 200) {
       cetakBaris(false);  // potongan tanpa akhir baris, lalu kabel diam
     }
     if (millis() - waktuCetakTerakhir > 3000) {
       Serial.println("... 3 detik tanpa kiriman. Periksa kabel A, B, GND, dan listrik kedua modul.");
       waktuCetakTerakhir = millis();
     }
   }
   ```

4. **Hasilnya** di Serial Monitor Node 1 (contoh):

   ```text
   Papan Node 1 mendengarkan kabel RS-485 (9600 baud)...
   diterima: halo 37 dari papan kedua
   diterima: halo 38 dari papan kedua
   diterima: halo 39 dari papan kedua
   ```

   Angkanya tidak mulai dari 1 karena papan kedua sudah mengirim sejak tadi. Baris pertama bisa saja terpotong (misalnya `diterima: o 36 dari papan kedua`): Node 1 mulai mendengar di tengah kalimat. Serial Monitor papan kedua (jendela pertama) menulis `terkirim: halo 37`, `terkirim: halo 38`, dan seterusnya.

   Yang muncul hanya `... 3 detik tanpa kiriman. Periksa kabel A, B, GND, dan listrik kedua modul.`? Buka bagian lipat "Kemenangan Cepat: tidak ada kiriman sama sekali" di [🚨](#-kalau-tidak-jalan).

### Langkah 7 — Eksperimen: tukar A dan B (5 menit)

1. Matikan MB102, lalu cabut USB dari kedua papan (aturan keselamatan: cabut listrik sebelum mengubah kabel).
2. Di modul papan kedua saja, tukar kedua kabelnya: kabel dari A Node 1 kini di kaki **B**, kabel dari B Node 1 di kaki **A**.
3. Colokkan USB papan kedua, colokkan USB papan Node 1, lalu nyalakan MB102. Serial Monitor Node 1 kini menulis baris aneh seperti `diterima, tetapi bukan teks yang utuh: 00 F5 ...` (angka di layarmu pasti berbeda), atau hanya `... 3 detik tanpa kiriman`.
4. Matikan MB102, cabut kedua USB, kembalikan kabelnya seperti sebelum butir 2 (A ke A dan B ke B, kecuali kalau di langkah 6 kamu memang harus menukarnya), lalu nyalakan lagi seperti langkah 6. Pesan `halo` muncul lagi.

Kabel A dan B yang tertukar tidak merusak apa pun; hanya isinya yang terbalik. Ingat gejala ini: kelak, saat kamu memasang sensor dari pabrik lain, A dan B yang tertukar adalah tersangka nomor satu.

**Apa yang barusan terjadi?** `Serial2` di papan kedua mengirim huruf-huruf seperti biasa lewat pin TX2, tetapi modul MAX485 mengubahnya menjadi **dua sinyal yang saling berlawanan** di kawat A dan B. Modul MAX485 di Node 1 membaca **selisih** kedua kawat itu dan mengubahnya kembali menjadi huruf di pin RX2. Kali ini arah bicaranya dikunci: papan kedua selalu bicara (DE/RE dibuat HIGH sekali di `setup()`), sedangkan Node 1 selalu mendengar (DE/RE LOW). Mirip siaran radio: satu pemancar, satu pendengar. Praktik 1 membuat keduanya **bergantian** bicara.

> ➡️ **Selesai Kemenangan Cepat?** Baca [Konsep 1](#1-sensor-industri-dan-kabel-ratusan-meter) sampai [Konsep 3](#3-bus-rs-485-rantai-terminator-dan-gnd-bersama), lalu kerjakan praktik sesuai urutan di awal 🧠 Konsep. Biarkan rangkaian ini terpasang: semua praktik minggu ini memakainya.

---

## 🧠 Konsep "Mengapa"

Delapan konsep berikut menjelaskan **mengapa** sensor industri disambung seperti ini, satu per bagian, dan **tidak perlu dibaca sekaligus**. Konsep dan praktik dikerjakan berselang-seling dengan urutan ini:

1. Kemenangan Cepat → **Konsep 1–3** → Praktik 1 (*walkie-talkie*)
2. **Konsep 4–6** → Praktik 2, 3, dan 4 (sensor tiruan, bingkai manual, ModbusMaster)
3. **Konsep 7** → Praktik 5 dan 6 (Node 1 v1.4.0, dashboard, kabel 5 m)
4. **Konsep 8** → Praktik 7 (memilih protokol) → 🧩 Tantangan → ➕ Tambahan

> 🖥️ **Perlu mencoba sesuatu di bagian Konsep?** Tidak wajib. Potongan kode di bagian Konsep diambil dari sketsa dan firmware yang kamu pakai di Praktik.

### 1. Sensor industri dan kabel ratusan meter

Bayangkan *greenhouse* (rumah kaca) melon seluas setengah hektare. Sepuluh sensor tanah tertanam di bedengan, dan panel kendali ada di gudang, 200 meter dari bedengan terjauh. Di dekat bedengan ada pompa air dan kipas besar yang motornya menyebarkan gangguan listrik. Bagaimana data sepuluh sensor itu sampai ke panel?

- **WiFi?** Sinyalnya melemah di antara rangka besi dan daun yang basah, setiap sensor butuh listrik untuk radionya, dan perlu kata sandi WiFi di setiap alat.
- **Kabel sensor biasa** seperti di Node 1 (analog, 1-Wire, I2C)? Kabel jenis ini hanya tahan beberapa meter, bahkan kurang. Sinyalnya diukur terhadap GND. Di kabel 200 m, gangguan dari motor menempel pada kawat sinyal, dan GND di kedua ujung pun bisa berbeda sehingga angka 0 dan 1 tertukar-tukar.

Dunia industri memakai jalan ketiga: **RS-485**. Setiap bit dikirim lewat **sepasang kawat yang dipilin** (A dan B) dengan dua tegangan yang **saling berlawanan**: saat A naik, B turun. Penerima tidak peduli berapa tegangan masing-masing kawat; ia hanya membaca **selisih** A dan B. Gangguan dari motor mengenai kedua kawat yang dipilin rapat itu **sama besar**, jadi selisihnya tidak berubah. Cara ini disebut **sinyal diferensial**.

![Diagram sinyal biasa dan sinyal diferensial. Kiri, sinyal biasa, satu kawat ditambah GND: penerima membaca tegangan kawat terhadap GND, dan dua lonjakan gangguan merah melewati garis ambang sehingga diberi tanda silang; angka 0 terbaca 1 dan sebaliknya. Cara ini cocok untuk kabel pendek di papan atau breadboard (UART, I2C, sensor analog), bukan ratusan meter. Kanan, RS-485 diferensial dengan dua kawat terpilin: kawat A dan B selalu berlawanan, dan gangguan mengenai keduanya dengan lonjakan yang sama. Penerima membaca A dikurangi B sehingga lonjakannya hilang dan setiap bit diberi tanda centang; penerima masih yakin membaca selisih sekecil 0,2 volt. Catatan bawah: kabel RS-485 bisa sepanjang sekitar 1.200 m pada laju rendah (spesifikasi Modbus: 1.000 m pada 9600 baud).](aset/sinyal-diferensial.png)

Analoginya dua penumpang perahu yang tingginya berbeda 10 cm. Ombak mengangkat dan menurunkan perahu, tetapi selisih tinggi keduanya tetap 10 cm. Penerima RS-485 hanya mengukur selisih itu, dan ia tetap yakin membacanya walaupun selisihnya mengecil sampai **0,2 V**. Hasilnya, RS-485 bisa menjangkau **sekitar 1.200 meter** pada laju rendah. Spesifikasi Modbus menyebut **1.000 m** pada 9600 baud, dan sekitar 600 m kalau memakai kabel LAN kategori 5 (Cat5) biasa. Satu pasang kawat juga bisa dipakai bergantian oleh banyak alat, sampai 32 alat yang memakai chip pemancar-penerima (*transceiver*) standar seperti MAX485 (Konsep 3).

RS-485 hanya mengatur **listriknya**: bagaimana bit lewat di kabel. Isi pembicaraannya diatur protokol lain. Di pertanian dan pabrik, protokol yang paling sering dipakai di atas RS-485 adalah **Modbus RTU** (Konsep 4). Ibaratnya, RS-485 adalah **jalur telepon**, sedangkan Modbus adalah **tata cara bercakap** di telepon itu. Inilah yang kamu bangun minggu ini:

![Diagram perjalanan satu bacaan sensor tanah dari kabel dua kawat ke MQTT, lalu ke dashboard. Kiri, papan kedua sebagai sensor tanah tiruan berlabel server Modbus (dulu slave): loker 0 berisi 585 yang berarti 58,5 persen, loker 1 berisi 253 yang berarti 25,3 derajat Celsius, loker 2 EC 1.200 mikrosiemens per sentimeter, loker 3 alamat 1; ia menjawab hanya kalau ditanya. Kabel A/B RS-485 (UTP 5 m ditambah GND, Modbus RTU 9600 8N1) dengan modul MAX485 di kedua ujung menuju Node 1 Rumah v1.4.0 berlabel klien Modbus (dulu master), yang bertanya setiap 10 detik: server 1, fungsi 03, loker 0 sampai 2, lalu menambahkan tiga kolom ke telemetry: tanah_rs485, suhu_tanah, dan ec. Panah MQTT lewat WiFi ke Gateway Pi 192.168.1.37 berisi Mosquitto dan Node-RED dengan grup Sensor RS-485, lalu ke HP dengan dashboard Rumah. Catatan: RS-485 adalah jalur telepon (listrik di kabel), Modbus RTU adalah tata cara bercakap di jalur itu; modul MAX485 di kedua ujung menerjemahkan huruf UART menjadi sinyal diferensial di kawat A dan B. Sensor tanah RS-485 sungguhan bekerja persis seperti papan kedua: mikrokontroler kecil di dalamnya membaca elektroda, menyimpan hasilnya di loker, lalu menjawab lewat RS-485.](aset/dari-sensor-rs485-ke-hp.png)

| | Papan kedua (sensor tiruan) | Node 1 "Rumah" | Gateway Pi |
| :--- | :--- | :--- | :--- |
| Perannya | **server Modbus**: menyimpan kelembapan tanah, suhu tanah, dan EC di loker, lalu menjawab kalau ditanya | **klien Modbus**: bertanya setiap 10 detik, lalu memasukkan jawabannya ke `telemetry` | broker dan Node-RED, seperti biasa |
| Berbicara dengan | Node 1, lewat kabel RS-485 | papan kedua (RS-485) dan broker (MQTT lewat WiFi) | Node 1 dan HP |
| Kabel | modul MAX485 | modul MAX485 | — |

Sensor tanah RS-485 sungguhan bekerja persis seperti papan kedua: di dalamnya ada mikrokontroler kecil yang membaca elektroda tanahnya, menyimpan hasilnya di loker, lalu menjawab lewat RS-485. Jadi, minggu ini kamu sekaligus melihat "isi perut" sensor industri.

### 2. Satu pasang kawat, dua arah: MAX485 dan tombol bicara DE/RE

ESP32 tidak bisa langsung "berbicara RS-485". Ia hanya punya UART: pin TX untuk mengirim dan pin RX untuk menerima, masing-masing satu kawat terhadap GND (Modul 7). **Modul MAX485** menjadi penerjemahnya:

| Kaki modul | Nama panjang | Tersambung ke | Tugasnya |
| :--- | :--- | :--- | :--- |
| **DI** | *Driver Input* | TX2 (GPIO 17) | huruf dari ESP32 yang akan dikirim ke kabel |
| **RO** | *Receiver Output* | RX2 (GPIO 16), lewat pembagi tegangan | huruf dari kabel untuk ESP32 |
| **DE** | *Driver Enable* | D4 | HIGH = pemancar modul menyala |
| **RE** | *Receiver Enable* (aktif LOW) | D4, disatukan dengan DE | LOW = penerima modul menyala |
| **A**, **B** | — | kabel bus | pasangan kawat diferensial |
| **VCC**, **GND** | — | 5 V dan GND | listrik modul |

Kawat A dan B hanya **satu pasang**. Kalau dua alat mengirim bersamaan, sinyal keduanya bertabrakan dan isinya rusak. Karena itu, RS-485 dua kawat bekerja **setengah dupleks** (*half duplex*): bergantian, seperti ***walkie-talkie***. Tekan tombol bicara, bicara, lepaskan, lalu dengarkan jawaban. Di modul MAX485, tombol bicara itu adalah pin **DE** dan **RE** yang disatukan:

- **D4 HIGH** = DE aktif dan RE mati: modul **bicara**. Huruf dari TX2 keluar ke kabel, dan modul tidak mendengar apa pun.
- **D4 LOW** = DE mati dan RE aktif: modul **dengar**. Huruf dari kabel masuk ke RX2, dan pemancar modul diam sehingga tidak mengganggu alat lain.

![Diagram modul MAX485 dan tombol bicara DE/RE: satu pasang kawat dipakai bergantian, seperti walkie-talkie. Kiri, D4 HIGH berarti bicara: TX2 (GPIO 17) ESP32 masuk ke kaki DI, pemancar menyala dan mengirim huruf ke kawat A dan B sekaligus, dengan tegangan yang selalu berlawanan, sedangkan penerima (kaki RO ke RX2, GPIO 16) mati. Kanan, D4 LOW berarti dengar: pemancar diam, dan penerima membaca selisih kawat A dikurangi B, lalu meneruskan hurufnya ke RX2. Kaki DE dan RE disatukan dan disambung ke D4. Kotak urutan bicara yang benar: 1 D4 HIGH, tekan tombol bicara; 2 Serial2.print, titip huruf ke antrean UART; 3 Serial2.flush, tunggu huruf terakhir keluar; 4 D4 LOW, lepas dan kembali mendengar. Kotak tegangan: modul MAX485 diberi 5 volt; DI, DE, dan RE sudah menganggap 2,0 volt sebagai HIGH, jadi 3,3 volt dari ESP32 cukup; RO mengeluarkan hampir 5 volt, lalu lewat pembagi 4,7 kiloohm ditambah 10 kiloohm menjadi sekitar 3,4 volt di RX2, aman untuk pin ESP32; pin RX dan TX Serial2 selalu ditulis: Serial2.begin(9600, SERIAL_8N1, 16, 17).](aset/max485-dan-de-re.png)

Ada satu jebakan waktu yang penting. `Serial2.print()` di ESP32 tidak menunggu huruf-hurufnya benar-benar keluar; ia hanya menitipkannya ke antrean pengirim UART lalu langsung kembali. Kalau tombol bicara langsung dilepas, huruf yang masih antre terpotong di tengah jalan. Obatnya `Serial2.flush()`: di paket esp32 3.x, fungsi ini menunggu sampai antrean kosong **dan** bit terakhir sudah keluar dari pin. Urutannya selalu begini:

```cpp
digitalWrite(PIN_RS485_DE_RE, HIGH);  // tekan tombol bicara
Serial2.print(teks);
Serial2.flush();                      // tunggu sampai huruf terakhir benar-benar keluar ke kabel
digitalWrite(PIN_RS485_DE_RE, LOW);   // lepas tombol bicara: kembali mendengar
```

Praktik 1 membuktikannya: tanpa `flush()`, balasannya hilang.

Tiga hal lain tentang modul biru ini:

- **Modul ini butuh 5 V** (lembar data MAX485: 4,75–5,25 V). Masukan DI, DE, dan RE sudah menganggap 2,0 V sebagai HIGH, jadi 3,3 V dari ESP32 cukup. Keluaran RO lain cerita: tegangannya hampir 5 V, padahal batas aman pin ESP32 3,6 V. Karena itu, RO selalu lewat **pembagi tegangan 4,7 kΩ + 10 kΩ**, sama dengan pembagi ECHO HC-SR04 di Modul 6.
- **Saat modul bicara, RO mengambang** (penerimanya mati), dan resistor di modul menariknya ke atas. Setelah lewat pembagi, RX2 hanya mendapat sekitar 2 V, angka "abu-abu" yang bisa terbaca sebagai huruf sampah. Karena itu, setiap kali selesai bicara, kode modul ini **membuang isi antrean terima** sebelum mendengarkan jawaban.
- **Modul ini menarik DE dan RE ke 5 V lewat resistor 10 kΩ.** Kalau pin DE/RE-nya D2, papan bisa gagal masuk mode unggah karena D2 adalah pin *strapping* yang harus LOW atau mengambang saat papan masuk mode unggah (Modul 5). Itulah sebabnya D4 dipakai untuk DE/RE dan LED status pindah ke D2. `PETA-PIN.md` naik ke versi 6.

> ⚠️ **Tulis pin `Serial2` setiap kali.** Di paket esp32 3.x, `Serial2.begin(9600)` tanpa pin memakai **GPIO 4 dan 25**, bukan 16 dan 17 seperti tutorial lama (paket 2.x). Di Node 1, GPIO 25 adalah gerbang MOSFET **pompa**! Jadi, di modul ini selalu tertulis lengkap: `Serial2.begin(9600, SERIAL_8N1, 16, 17)`, yaitu laju, format, pin RX, lalu pin TX.

### 3. Bus RS-485: rantai, terminator, dan GND bersama

Satu pasang kawat RS-485 bisa dipakai bersama oleh banyak alat. Kumpulan alat di satu kabel itu disebut **bus**, seperti bus I2C di Modul 7, hanya jauh lebih panjang. Ada empat aturan supaya bus panjang tetap sehat:

1. **Bentuknya rantai** (*daisy chain*): kabel utama berjalan dari alat ke alat. Cabang dari kabel utama ke sebuah alat harus pendek (spesifikasi Modbus: paling panjang 20 m), dan bentuk bintang (banyak kabel dari satu titik) tidak boleh.
2. **Terminator 120 Ω di kedua ujung kabel utama, dan hanya di sana.** Sinyal yang tiba di ujung kabel bisa memantul balik seperti ombak yang menabrak dinding kolam. Resistor 120 Ω yang sama dengan "hambatan" kabelnya meredam pantulan itu. Modul MAX485 biru sudah membawa satu terminator (resistor kecil bertulisan "121" di dekat terminal sekrup). Dua modul di dua ujung kabel = tepat dua terminator. Kalau kelak ada alat ketiga di tengah, terminator alat itu harus dilepas.
3. **Ada kawat ketiga: GND bersama.** Penerima RS-485 tahan terhadap perbedaan GND kedua alat sampai beberapa volt, tetapi tetap butuh acuan. Spesifikasi Modbus meminta kawat ketiga yang menyambungkan GND semua alat. Di kabel UTP, kawat itu diambil dari pasangan lain.
4. **Huruf A dan B tidak sama di semua pabrik.** Menurut lembar data MAX485, A adalah kawat "tidak terbalik", tetapi sebagian pabrik menamai sebaliknya, dan spesifikasi Modbus memakai nama D0 dan D1. Pegangannya sederhana: antarmodul yang sama, A ke A dan B ke B; dengan alat pabrik lain, kalau sama sekali tidak ada jawaban, tukar A dan B (Kemenangan Cepat langkah 7 sudah membuktikan tidak ada yang rusak).

![Diagram bus RS-485, satu pasang kawat untuk banyak alat. Node 1 sebagai klien di ujung kiri, lalu kabel utama A dan B berjalan ke kanan dengan cabang pendek ke sensor 1 sampai 4 yang beralamat 1 sampai 4; sensor 4 berada di ujung kanan. Terminator 120 ohm dipasang di antara A dan B hanya di dua ujung kabel utama, dan kawat ketiga GND menyatukan semua alat. Catatan: bentuknya rantai, bukan bintang; satu klien, sampai 32 beban standar; kabel utama sampai sekitar 1.200 m pada laju rendah, makin cepat makin pendek; cabang ke setiap alat dibuat pendek, menurut spesifikasi Modbus paling panjang 20 m. Huruf A dan B tidak sama di semua pabrik: dengan alat pabrik lain, kalau sama sekali tidak ada jawaban, tukar A dan B.](aset/bus-rs485.png)

Menurut standarnya, satu bus RS-485 sanggup melayani **32 beban**. Satu chip MAX485 dihitung satu beban, jadi satu bus bisa berisi sampai 32 alat seperti ini; chip lain yang "lebih ringan" bisa lebih banyak. Untuk lab minggu ini, bus kita hanya berisi dua alat dan kabelnya 5 m, jadi pantulan dan beban belum jadi masalah. Aturannya tetap diterapkan sejak awal supaya kebiasaannya benar.

> ➡️ **Saatnya praktik!** Konsep 1–3 cukup untuk [Praktik 1 — *Walkie-talkie*](#praktik-1--walkie-talkie-bergantian-bicara-lewat-satu-pasang-kawat-30-menit). Setelah itu, kembali ke Konsep 4.

### 4. Modbus RTU: bertanya ke loker bernomor

**Modbus** dibuat perusahaan Modicon pada 1979 untuk PLC (komputer pengendali pabrik) dan sampai sekarang menjadi "bahasa" yang paling banyak dipakai alat industri. Versi yang berjalan di kabel serial seperti RS-485 disebut **Modbus RTU**. Versi untuk jaringan Ethernet atau WiFi disebut Modbus TCP (🔬).

Aturan percakapannya mirip tanya jawab di loket:

- Di satu bus hanya ada **satu penanya**, disebut **klien** (*client*): di modul ini, Node 1. Alat yang ditanya disebut **server**: sensor tanah (papan kedua). Dokumen lama, banyak library, dan lembar data sensor murah masih memakai istilah lama ***master*** (untuk klien) dan ***slave*** (untuk server); organisasi Modbus menggantinya pada 2020. Modul ini memakai klien dan server, tetapi menyebut istilah lama setiap kali kamu akan menemuinya, misalnya pada nama library **ModbusMaster**.
- **Server tidak pernah bicara duluan.** Ia hanya menjawab pertanyaan yang ditujukan kepadanya, dan server tidak pernah bercakap dengan server lain. Karena itu, tidak ada tabrakan: klien yang mengatur giliran.
- Setiap server punya **alamat** 1 sampai 247, unik di bus itu. Alamat 0 adalah **siaran** untuk semua server: hanya untuk perintah tulis, dan tidak ada yang menjawab.

Isi sensor disimpan di **loker bernomor** (Modbus menyebutnya *register*). Setiap loker berisi satu angka 16 bit (0 sampai 65.535). Ada dua lemari loker yang akan sering kamu temui:

| Lemari | Isi | Dibaca dengan | Ditulis dengan |
| :--- | :--- | :--- | :--- |
| ***Holding register*** | angka yang boleh dibaca dan ditulis, misalnya setelan alamat atau laju baud; banyak sensor murah juga menaruh hasil ukurnya di sini | **fungsi 03** | **fungsi 06** (satu loker) |
| ***Input register*** | angka hasil ukur, hanya-baca | **fungsi 04** | — |

Selain itu, ada *coil* dan *discrete input* yang isinya hanya 1 bit (nyala-padam), dipakai misalnya untuk relay. Minggu ini kita hanya butuh loker 16 bit.

Satu pertanyaan Modbus kira-kira berbunyi: **"Server 1, fungsi 03: bacakan 3 loker mulai loker 0."** Jawabannya: "Server 1, fungsi 03, 6 byte: 585, 253, 1.200." Kalau pertanyaannya tidak bisa dikerjakan, misalnya loker yang diminta tidak ada, server menjawab dengan ***exception*** (penolakan resmi) beserta alasannya. Kalau server tidak menjawab sama sekali, klien menunggu sampai batas waktunya habis (***timeout***). Konsep 5 membedah pertanyaan dan jawaban itu sampai ke byte-nya.

### 5. Bingkai dan CRC: surat bersegel

Pertanyaan dan jawaban Modbus RTU dikirim sebagai deretan byte yang disebut **bingkai** (*frame*). Setiap bingkai selalu tersusun sama: **alamat server** (1 byte), **kode fungsi** (1 byte), **data** (panjangnya bergantung pada fungsinya), lalu **CRC** (2 byte). Byte biasanya ditulis dalam **heksadesimal**: dua karakter (0–9 dan A–F) per byte, dari `00` (0) sampai `FF` (255). Berikut pertanyaan "server 1, fungsi 03, bacakan 3 loker mulai loker 0" dan jawabannya, persis seperti yang lewat di kabel (kamu akan melihatnya sendiri di Praktik 3):

![Diagram bingkai Modbus RTU untuk pertanyaan server 1, fungsi 03, bacakan 3 loker mulai loker 0, dari rekaman Praktik 3. Pertanyaan Node 1, 8 byte: 01 alamat server 1; 03 fungsi baca holding; 00 00 mulai loker 0; 00 03 sebanyak 3 loker; 05 CB CRC dengan byte rendah dulu. Jawaban server, 11 byte: 01 dari server 1; 03 fungsi 03 normal; 06 enam byte data; 02 49 loker 0 sama dengan 585, yaitu 58,5 persen; 00 FD loker 1 sama dengan 253, yaitu 25,3 derajat Celsius; 04 B0 loker 2 sama dengan 1.200; 6F DD CRC. Jawaban penolakan atau exception, 5 byte: 01 server 1; 83, yaitu 03 ditambah 80, berarti ditolak; 02 kode loker tidak ada; C0 F1 CRC. Kotak cara membaca dua byte loker: byte tinggi dulu, 02 49 sama dengan 2 kali 256 ditambah 73, yaitu 585, karena 49 heksadesimal sama dengan 4 kali 16 ditambah 9, yaitu 73; CRC dihitung dari semua byte sebelumnya, dan bingkai rusak dibuang diam-diam sehingga penanya mendapat timeout.](aset/bingkai-modbus.png)

| Pertanyaan Node 1 | `01` | `03` | `00 00` | `00 03` | `05 CB` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Artinya | alamat server 1 | fungsi 03: baca *holding register* | mulai loker 0 | sebanyak 3 loker | CRC |

| Jawaban server | `01` | `03` | `06` | `02 49` | `00 FD` | `04 B0` | `6F DD` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Artinya | dari server 1 | fungsi 03 (jawaban normal) | 6 byte data | loker 0 = 585 | loker 1 = 253 | loker 2 = 1.200 | CRC |

Setiap loker berisi dua byte, **byte tinggi dulu**. Cara menghitungnya: byte pertama dikalikan 256, lalu ditambah byte kedua. Jadi, `02 49` = 2 × 256 + 73 = **585** (`49` heksadesimal = 4 × 16 + 9 = 73), `00 FD` = **253**, dan `04 B0` = 4 × 256 + 176 = **1.200**.

Dua byte terakhir adalah **CRC** (*Cyclic Redundancy Check*), semacam **segel** yang dihitung dari semua byte sebelumnya dengan rumus tetap. Penerima menghitung ulang segel itu dari byte yang ia terima. Kalau hasilnya berbeda (satu bit saja berubah di jalan), bingkai dianggap rusak. Pertanyaan yang rusak **dibuang diam-diam** oleh server: ia tidak menjawab apa pun, dan klien hanya melihat ***timeout***. Jawaban yang rusak ditolak klien sebagai galat CRC (di ModbusMaster, kode `0xE3`). Uniknya, CRC ditulis **byte rendah dulu**: segel `0xCB05` dikirim sebagai `05 CB`. Kamu tidak perlu menghitung CRC dengan tangan; library dan sketsa Praktik 3 yang mengerjakannya.

Bagaimana penerima tahu di mana sebuah bingkai berakhir? Modbus RTU tidak punya tanda awal atau tanda akhir. Penandanya **diam**: bingkai dianggap selesai kalau kabel diam selama paling sedikit **3,5 huruf**. Pada 9600 baud, satu byte butuh sekitar 1,04 ms (8 bit data ditambah bit awal dan bit akhir), jadi 3,5 huruf ≈ **4 ms**. Sebaliknya, jeda lebih dari 1,5 huruf di **tengah** bingkai membuat bingkai itu dianggap rusak.

Dari angka itu, kamu bisa menghitung lama satu tanya jawab:

![Diagram lama satu tanya jawab Modbus pada 9600 baud; satu byte sekitar 1,04 milidetik (8 bit data ditambah bit awal dan bit akhir); angka dari rekaman uji Wokwi. Tiga jalur pada sumbu 0 sampai 30 milidetik: D4 (DE/RE) HIGH dari 0 sampai sekitar 8,3 milidetik lalu LOW; DI (TX2) mengirim 01 03 00 00 00 03 05 CB selama sekitar 8,3 milidetik; RO (RX2) menerima 01 03 06 02 49 00 FD 04 B0 6F DD selama sekitar 11,5 milidetik setelah diam sekitar 4 milidetik. Totalnya sekitar 24 milidetik dengan chip Wokwi dan sekitar 28 milidetik dengan sketsa papan kedua. Catatan merah: kalau server tidak menjawab, library ModbusMaster menunggu 2.000 milidetik sebelum menyerah dengan kode 0xE2, sekitar 70 kali lebih lama daripada tanya jawab yang berhasil, dan selama itu loop() Node 1 berhenti.](aset/waktu-transaksi.png)

Pertanyaan 8 byte butuh sekitar 8,3 ms, server menunggu kabel diam sekitar 4 ms, lalu jawaban 11 byte butuh sekitar 11,5 ms. Totalnya **sekitar 24–28 ms** (dalam uji Wokwi: 24 ms dengan chip tiruan, 28 ms dengan sketsa papan kedua). Kalau server tidak menjawab, library ModbusMaster menunggu **2 detik** sebelum menyerah. Selisih "28 ms" dan "2.000 ms" itu penting: Konsep 6 dan Praktik 5 memakainya.

Kalau server menolak pertanyaan, jawabannya pendek, misalnya `01 83 02 C0 F1`: kode fungsinya `83` (= `03` + `80`, tanda penolakan), lalu **kode *exception*** `02`. Ada empat kode yang perlu kamu kenal:

| Kode | Nama resmi | Artinya |
| :---: | :--- | :--- |
| `01` | ILLEGAL FUNCTION | server tidak mengenal kode fungsi itu |
| `02` | ILLEGAL DATA ADDRESS | loker yang diminta tidak ada (atau sebagian di luar batas) |
| `03` | ILLEGAL DATA VALUE | isi permintaannya tidak sah, misalnya jumlah loker 0 |
| `04` | SERVER DEVICE FAILURE | server gagal mengerjakannya |

### 6. Angka di loker: 16 bit, skala, tanda, dan nomor yang bergeser

Satu loker hanya berisi bilangan bulat 16 bit. Sensor tanah perlu menyimpan pecahan dan angka minus. Untuk itu, ada empat kebiasaan yang selalu tertulis di lembar data:

1. **Skala.** Pecahan disimpan sebagai bilangan bulat yang dikalikan. Kelembapan 58,5 % disimpan sebagai **585** dengan skala ×10, jadi kodenya membagi dengan 10: `getResponseBuffer(0) / 10.0`. Lembar data menulisnya misalnya "unit 0.1 %RH" atau "×10". Skala tiap sensor berbeda: ada yang ×10, ada yang ×100.
2. **Tanda.** Angka minus disimpan dengan cara **komplemen dua**: −5,0 °C = −50 disimpan sebagai `FF CE` (65.486 kalau dibaca apa adanya). Kodenya harus menyuruh ESP32 membaca angka itu sebagai bilangan **bertanda** 16 bit: `(int16_t)getResponseBuffer(1) / 10.0`. Lupa `(int16_t)`? Suhu −5,0 °C terbaca 6.548,6 °C.
3. **Dua loker untuk satu angka.** Angka yang butuh lebih dari 16 bit (misalnya penghitung energi) memakai dua loker berurutan. Urutan kedua loker itu tidak diatur standar dan berbeda antarpabrik (🔬).
4. **Nomor yang bergeser satu.** Di dalam bingkai, loker pertama bernomor **0**. Namun, banyak lembar data dan aplikasi lama menulis nomor gaya Modicon: **40001** untuk *holding register* pertama dan **30001** untuk *input register* pertama. Jadi, "40001" di lembar data = loker **0** di kode, "40003" = loker 2. Kalau lembar datanya menulis alamat heksadesimal seperti `0x0012` atau `0012H`, itu biasanya sudah nomor di dalam bingkai: pakai apa adanya. Masih ragu? Coba N dan N−1, lalu pilih yang hasilnya masuk akal.

Lembar data sensor tiruan kita, yang akan kamu pasang di papan kedua di Praktik 2:

![Lembar data sensor tanah RS-485 tiruan: alamat server 1, 9600 baud 8N1, dua lemari loker 16 bit. Lemari holding register, dibaca fungsi 03, loker 3 ditulis fungsi 06: loker 0 berisi 585, kelembapan tanah dikalikan 10, jadi 58,5 persen; loker 1 berisi 253, suhu tanah dikalikan 10 dan bertanda, jadi 25,3 derajat Celsius; loker 2 berisi 1.200, EC dalam mikrosiemens per sentimeter tanpa pengali; loker 3 berisi 1, alamat server 1 sampai 247, boleh ditulis. Lemari input register, dibaca fungsi 04 dan hanya-baca: loker 0 sampai 2 isinya sama dengan holding. Kotak angka minus, komplemen dua: minus 5,0 derajat dikalikan 10 sama dengan minus 50, disimpan FF CE atau 65.486; dibaca dengan int16_t menjadi minus 50, lalu minus 5,0 derajat; kalau lupa int16_t, terbaca 6.548,6 derajat. Catatan bawah: lembar data gaya lama menulis 40001 untuk holding register pertama, sama dengan loker 0 di kode; loker di luar 0 sampai 3 (fungsi 03) atau 0 sampai 2 (fungsi 04) dijawab exception 02, dan perintah tulis ke loker 0 sampai 2 diabaikan.](aset/lemari-loker-modbus.png)

Terakhir, bedakan dua jenis kegagalan karena gejalanya di layar sangat berbeda:

| | ***Exception*** | ***Timeout*** |
| :--- | :--- | :--- |
| Artinya | server hidup, mendengar, dan menolak dengan alasan | tidak ada jawaban yang sah sama sekali |
| Contoh penyebab | loker tidak ada (`02`), fungsi tidak dikenal (`01`) | alamat server salah, A dan B tertukar, laju baud berbeda, pertanyaan rusak di jalan (CRC salah), server mati, kabel putus |
| Lamanya di ModbusMaster | cepat, sekitar 20 ms | **2 detik**, lalu kode `0xE2` |
| Yang dilakukan | perbaiki pertanyaannya (nomor loker, fungsi) | periksa kabel, alamat, dan setelan serial |

> ➡️ **Saatnya praktik!** Konsep 4–6 cukup untuk [Praktik 2 — Sensor tanah RS-485 tiruan](#praktik-2--sensor-tanah-rs-485-tiruan-di-papan-kedua-30-menit), [Praktik 3 — Bingkai Modbus dengan tangan](#praktik-3--bingkai-modbus-dengan-tangan-40-menit), dan [Praktik 4 — ModbusMaster](#praktik-4--modbusmaster-membaca-tiga-loker-40-menit). Setelah itu, kembali ke Konsep 7.

### 7. Membaca lembar data sensor RS-485

Suatu hari kamu akan membeli sensor tanah RS-485 sungguhan untuk proyek *smart farming*. Sensor seperti itu datang dengan lembar data (sering hanya PDF dari penjualnya). Lima hal ini yang harus kamu temukan dulu, sebelum menyambung kabel apa pun:

1. **Catu daya.** Banyak sensor industri butuh **12–24 V**, bukan 5 V. Lembar data sensor tanah JXCT, misalnya, menulis *"Power supply 12-24V DC"*. Sensor seperti ini butuh adaptor sendiri. Yang disambung ke bus RS-485 hanya A, B, dan GND (GND adaptor disatukan dengan GND bus), dan kawat catu 12 V **tidak pernah** menyentuh pin ESP32 atau rel breadboard.
2. **Warna kabel.** Umumnya cokelat = catu (+), hitam = catu (−), kuning = A, biru = B. Namun, tidak selalu begitu: sensor Seeed memakai kuning = A dan **putih** = B, ditambah kabel hijau untuk mode setelan. JXCT bahkan memperingatkan bahwa salah sambung bisa membakar alatnya.
3. **Setelan serial dan alamat.** Kebanyakan sensor murah memakai **9600 baud, 8N1** (8 bit data, tanpa paritas, 1 bit akhir) dan alamat bawaan **1**. Sebagian memakai 4800 baud. Spesifikasi Modbus sendiri menyebut 19200 baud dengan paritas genap sebagai bawaan; yang penting, setelan kedua sisi **harus sama persis**.
4. **Kode fungsi yang didukung.** JXCT hanya menerima fungsi 03; sensor lain menerima 03 dan 04.
5. **Peta loker, skala, dan tanda.** Inilah bagian yang paling berbeda antarpabrik:

| | JXCT JXBS-3001 (tanah NPK/7-in-1) | Seeed S-Temp&VWC&EC-02 | Sensor tiruan modul ini |
| :--- | :--- | :--- | :--- |
| Catu | 12–24 V | 3,6–30 V (angka dari wiki Seeed untuk seri penerusnya, -02A) | 5 V dari papan |
| Kabel A / B | kuning / biru | kuning / putih | — |
| Setelan bawaan | 9600 8N1, alamat 1 | 9600 8N1 | 9600 8N1, alamat 1 |
| Kelembapan tanah | loker `0x0012`, ×10 | loker `0x0001`, ×100 | loker 0, ×10 |
| Suhu tanah | loker `0x0013`, ×10, bertanda | loker `0x0000`, ×100, bertanda | loker 1, ×10, bertanda |
| EC (µS/cm) | loker `0x0015` | loker `0x0002` | loker 2 |
| Alamat server tersimpan di | loker `0x0100` | loker `0x0200` | loker 3 (tidak tersimpan setelah *restart*) |

Perhatikan: urutan, nomor loker, dan skalanya berbeda semua. Kode yang membaca sensor A tidak bisa dipakai apa adanya untuk sensor B. Itulah sebabnya Node 1 v1.4.0 mengumpulkan peta lokernya di satu tempat (`rs485.cpp`).

Satu pelajaran lagi: **lembar data murah bisa salah.** Lembar data JXCT memberi contoh permintaan `01 03 00 12 00 02 65 CB`, padahal segel CRC yang benar untuk byte itu adalah `64 0E`; `65 CB` adalah segel untuk loker `0x0002`, sisa salin-tempel dari dokumen lain. Kalau contoh itu disalin mentah-mentah ke alat penguji, sensornya diam. Jadi, jangan menyalin bingkai heksadesimal dari PDF; biarkan library atau alat yang menghitung CRC-nya.

> ➡️ **Saatnya praktik!** Konsep 7 cukup untuk [Praktik 5 — Node 1 v1.4.0](#praktik-5--node-1-v140-sensor-rs-485-masuk-telemetry-50-menit) dan [Praktik 6 — Grup Sensor RS-485 di Node-RED](#praktik-6--grup-sensor-rs-485-di-node-red-dan-uji-kabel-5-m-45-menit). Setelah itu, kembali ke Konsep 8.

### 8. Memilih protokol yang tepat

Rumah Pintar Mini kini memakai tiga "jalan" sekaligus: **WiFi** (Node 1 ke router), **ESP-NOW** (Node 2 ke Node 1), dan **RS-485/Modbus** (sensor industri ke Node 1). Di luar sana masih ada LoRa, Zigbee, Thread, Matter, BLE (*Bluetooth Low Energy*, Bluetooth hemat daya), dan NB-IoT. Tidak ada satu protokol yang terbaik untuk semua keperluan. Setiap protokol menukar satu kelebihan dengan kekurangan lain: makin jauh jangkauannya, biasanya makin sedikit data yang bisa dikirim; makin hemat baterainya, biasanya makin butuh perangkat penghubung khusus.

Cara memilih yang paling aman adalah **menjawab beberapa pertanyaan dulu**, baru melihat tabel. Pohon keputusan sesudah daftar berikut merangkum pertanyaan-pertanyaan itu menjadi jalan pintas, dan tabel di bawahnya memberi angka-angkanya. Pertanyaannya:

1. **Seberapa jauh** sensor dari pengumpul datanya (router, gateway, Pi)?
2. **Ada listrik, atau harus baterai?** Baterai besar (18650) atau baterai koin (CR2032)?
3. **Seberapa sering mengirim, dan berapa banyak datanya?** Beberapa angka per menit, atau foto setiap detik?
4. **Ada WiFi atau sinyal seluler di lokasi sensor?** Kalau seluler, siap membayar paket operatornya setiap bulan?
5. **Berapa banyak node?** Satu-dua, atau puluhan?
6. **Perlu perintah balik** (menyalakan pompa) dengan cepat?
7. **Bisa menarik kabel?**

![Pohon keputusan memilih protokol: jawab pertanyaan dari atas ke bawah dan berhenti di jawaban ya pertama. 1, sensornya bisa dipasangi kabel dan lingkungannya industri dengan banyak gangguan? Ya: RS-485 / Modbus RTU, atau Modbus TCP kalau sudah ada Ethernet atau PLC. 2, ada WiFi di lokasi dan ada listrik? Ya: WiFi, langsung ke MQTT seperti Node 1. 3, kurang dari sekitar 150 m dari ESP32 yang tersambung WiFi, dan pakai baterai 18650? Ya: ESP-NOW, seperti Node 2 di Modul 14. 4, perangkat rumah pintar, atau harus tahan lama dengan baterai koin? Ya: Zigbee / Thread dengan Matter, butuh hub atau border router. 5, perangkat tersebar luas atau bergerak, ada sinyal operator seluler, dan siap membayar paket? Ya: NB-IoT, dengan kartu SIM khusus; LTE-M belum tercatat di Indonesia. 6, kilometer, data kecil, kirim jarang, tanpa listrik? Ya: LoRa / LoRaWAN, 920–923 MHz (AS923-2), paling lama 1 persen waktu. Catatan bawah: untuk bicara dengan HP yang ada di dekatnya, misalnya timbangan, jam tangan, atau setelan awal perangkat, pakai BLE; pohon ini penyederhanaan, jawaban akhirnya tetap ditimbang dengan tabel Konsep 8 dan biaya di lokasimu.](aset/pohon-memilih-protokol.png)

| Protokol | Jarak tipikal | Daya | Laju dan ukuran pesan | Biaya perangkat (perkiraan Oktober 2026) | Topologi dan infrastruktur | Cocok untuk |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **WiFi 2,4 GHz** | puluhan meter di dalam rumah (menembus 1–2 dinding) | boros: radio ESP32 sampai 240 mA, menyambung 1–3 detik → paling cocok **berlistrik** | sangat cepat (ESP32 sekitar 20 Mbit/s); pesan bebas | ESP32 Rp45–90 ribu; router sudah ada | bintang ke **router**; langsung ke IP dan MQTT | perangkat berlistrik dekat router (Node 1) |
| **ESP-NOW** | sekitar 150 m stabil di ruang terbuka (batas sekitar 300 m) | radio sama dengan WiFi, tetapi menyala hanya **milidetik** → baterai 18650 bisa | sekitar 200 kbit/s; 250 byte per paket (ESP-NOW versi 2: sampai 1.470 byte) | ESP32 kedua Rp45–90 ribu | ESP32 ke ESP32, **tanpa router**; perlu ESP32 gateway untuk ke internet | sensor baterai di halaman atau kebun dekat rumah (Node 2) |
| **RS-485 / Modbus RTU** | sampai sekitar 1 km **kabel** pada 9600 baud | sensor biasanya mendapat listrik lewat kabel (sering 12–24 V) | lambat tetapi cukup: 9.600–19.200 bit/s; bingkai paling banyak 256 byte | modul MAX485 Rp5–20 ribu + kabel; sensor industri Rp0,5–2 juta | **bus kabel**, satu klien, sampai 32 beban; tanpa izin radio | sensor dan mesin **industri**, lokasi yang bisa dipasangi kabel dan penuh gangguan listrik |
| **LoRa / LoRaWAN** | sekitar 1–5 km di kota, sampai sekitar 15 km di pedesaan (antena tinggi, pandangan bebas) | kirim sekitar 120 mA tetapi sebentar, tidur 0,2 µA → baterai tahan bertahun-tahun kalau jarang mengirim | **sangat lambat**: 0,25–5,5 kbit/s; 51–242 byte; di Indonesia paling lama 1 % waktu untuk mengirim | modul sekitar Rp120 ribu; gateway LoRaWAN Rp2,7–5 juta | LoRa: titik-ke-titik; LoRaWAN: node → **gateway** → *network server* | sensor **jauh tanpa listrik** (sawah, tangki), kirim jarang dan sedikit |
| **Zigbee** | puluhan meter per lompatan; jaringan **jala** (*mesh*: setiap alat ikut meneruskan pesan alat lain) memperluasnya | sangat hemat (chip sekitar 7 mA saat kirim, di bawah 1 µA saat siaga) → **baterai koin** | 250 kbit/s di radio (nyata sekitar 17 kbit/s); paling banyak 127 byte | sensor jadi sekitar Rp200 ribu; *dongle* (colokan USB) koordinator sekitar Rp0,5 juta | **jala** + ***hub*** (koordinator); ESP32 DevKit **tidak bisa** | rumah pintar dengan banyak sensor dan sakelar berbaterai |
| **Thread + Matter** | seperti Zigbee | Thread hemat (baterai koin); Matter lewat WiFi seboros WiFi | 250 kbit/s di radio | papan ESP32-C6/H2 Rp0,1–0,3 juta | Thread: jala + ***border router*** (gerbang jaringan Thread ke jaringan rumah); Matter: bahasa bersama lintas merek di atas WiFi atau Thread | produk rumah pintar **lintas merek** |
| **BLE** | beberapa meter sampai puluhan meter | chip khusus sangat hemat; di ESP32 sekitar 130 mA | 1 Mbit/s di radio; 20 byte per notifikasi bawaan | sudah ada di ESP32 | **HP ↔ perangkat** | berbicara dengan HP, setelan awal perangkat |
| **NB-IoT / LTE-M** | sejauh **sinyal operator** (kilometer, lebih tembus gedung) | tidur 0,8–3,2 µA, kirim ratusan mA → klaim baterai 10 tahun | NB-IoT sekitar 127–158 kbit/s puncak | modul Rp0,5–1,3 juta + **kartu SIM dan paket** | bintang ke **BTS operator**; tanpa gateway sendiri | perangkat **tersebar luas atau bergerak** di area bersinyal |

Angka di tabel adalah **kisaran pegangan**, bukan janji: jarak sangat bergantung pada antena, tinggi pemasangan, dan halangan, sedangkan harga cepat berubah. Arus di tabel adalah arus chip atau modul radio, bukan arus papan. Ingat pelajaran Modul 9 dan 14: papan DevKit sendiri menyedot sekitar 4–5 mA saat tidur. Arus sebesar itu menghabiskan baterai koin CR2032 (sekitar 235 mAh) dalam sekitar dua hari, jadi sensor baterai koin selalu memakai chip radio khusus, bukan ESP32 DevKit.

Beberapa hal yang sering keliru:

- **LoRa tidak sama dengan LoRaWAN.** LoRa adalah **jenis radionya**: dua modul LoRa bisa langsung bercakap, tanpa internet. LoRaWAN adalah **jaringannya**: node LoRa → *gateway* (mengubah paket radio menjadi paket IP) → *network server* (server jaringan) di internet.
- **LoRa di Indonesia** memakai pita **920–923 MHz**, dan rencana frekuensi LoRaWAN resmi untuk Indonesia adalah **AS923-2**. Menurut Permen Kominfo 2/2023 (masih berlaku per Oktober 2026), perangkat ujung boleh memancar paling kuat 20 dBm EIRP (daya pancar setelah dihitung dengan penguatan antenanya) dan paling lama 1 % waktu (*duty cycle* 1 %). Pita 433 MHz juga sah, tetapi dayanya dibatasi jauh lebih kecil (12,15 dBm EIRP), dan modul 433 MHz (SX1278) tidak bisa dipindah ke 920–923 MHz. Awas jebakan: daftar rencana frekuensi The Things Network (Juli 2026) masih mengaitkan Indonesia dengan `Asia 923-925 MHz`, yang kanalnya di luar pita sah; pilih **Asia 920-923 MHz (AS923 Group 2)**.
- **Batas 1 % itu nyata.** Satu pesan 12 byte di LoRa paling lambat (SF12) butuh sekitar 1,5 detik di udara, jadi paling banyak sekitar 24 pesan per jam. Sensor yang mengirim setiap 15 menit aman; LoRa untuk foto atau kiriman setiap detik tidak.
- **ESP32 DevKit V1 tidak bisa memakai Zigbee atau Thread** karena tidak punya radio IEEE 802.15.4. Papan yang bisa adalah ESP32-C6 atau ESP32-H2. Zigbee juga selalu butuh **hub** (koordinator), dan Thread butuh ***border router*** (sering sudah ada di *speaker* atau *hub* pintar). Matter lewat WiFi bisa berjalan di ESP32, tetapi contoh resminya meminta skema partisi lain (tanpa ruang OTA) dan penghapusan seluruh *flash* sebelum mengunggah, termasuk nama dan kata sandi WiFi yang tersimpan di NVS. Jadi, **jangan** pasang Matter di Node 1.
- **NB-IoT hanya lewat operator seluler** (Permen Kominfo 2/2023 Pasal 10): butuh kartu SIM khusus dan paket, yang di Indonesia dijual sebagai layanan perusahaan lewat konsultasi. Daftar GSMA (November 2025) hanya mencatat NB-IoT Telkomsel dan XL Axiata untuk Indonesia; **LTE-M belum tercatat**. Sinyal 4G di HP belum tentu berarti ada sinyal NB-IoT.
- **Kata "gateway" punya empat arti di kurikulum ini.** Node 1 adalah gateway ESP-NOW ke MQTT (Modul 14); *gateway* LoRaWAN mengubah radio LoRa menjadi paket internet; *gateway* Modbus menerjemahkan Modbus TCP ke Modbus RTU (🔬). Gateway Pi (Modul 12) adalah gerbang rumah ke dunia luar.

Bagian aturan di atas adalah wawasan, bukan nasihat hukum. Untuk produk yang dijual, perangkat radio wajib bersertifikat dan pemakaian di luar ruangan mungkin wajib didaftarkan; urusan itu biasanya ditangani produsen atau importirnya.

> ➡️ **Saatnya praktik!** Konsep 8 cukup untuk [Praktik 7 — Memilih protokol](#praktik-7--memilih-protokol-tabel-keputusan-dan-lima-skenario-40-menit).

---

## 🔧 Praktik langkah demi langkah

Tujuh praktik, **berurutan**. Praktik bertanda ⭐ di kotak 🖥️-nya adalah bagian dari syarat lulus.

> [!IMPORTANT]
> **Papan Node 1 minggu ini berganti program beberapa kali.** Dari Kemenangan Cepat sampai Praktik 4, papan Node 1 menjalankan sketsa latihan (pilihan papan **DOIT ESP32 DEVKIT V1**). Praktik 5 mengunggah **Node 1 v1.4.0** (pilihan papan **ESP32 Dev Module**, **Minimal SPIFFS**, **DIO**, seperti sejak Modul 10), firmware yang dipakai seterusnya. Selama papan Node 1 menjalankan sketsa latihan, dashboard menulis Node 1 `offline`; itu wajar. Nama dan kata sandi WiFi yang tersimpan di papan Node 1 tetap aman selama **Tools → Erase All Flash Before Sketch Upload** tetap **Disabled**.
>
> **Papan kedua juga.** Kemenangan Cepat dan Praktik 1 memakai sketsa teks; mulai Praktik 2, papan kedua menjalankan **sensor tanah tiruan** sampai lab selesai (➕ A mengembalikannya menjadi Node 2).

### Praktik 1 — *Walkie-talkie*: bergantian bicara lewat satu pasang kawat (30 menit)

> 🖥️ **Alat:** **Arduino IDE** dengan dua jendela, papan Node 1 dan papan kedua yang tercolok ke laptop, rangkaian Kemenangan Cepat, dan MB102 menyala. Konsep yang dipakai: 1–3.
>
> 🖥️ **Jalur Wokwi:** praktik ini butuh dua papan yang bercakap lewat kabel. Baca langkah dan hasilnya, lalu lanjut ke Konsep 4.

Kali ini kedua papan **bergantian** bicara di kabel yang sama. Node 1 mengirim `ping 1`, lalu langsung diam dan mendengar. Papan kedua mendengar, lalu membalas `pong 1`. Keduanya memakai fungsi `kirimBaris()` yang sama: tekan tombol bicara, kirim, tunggu huruf terakhir keluar, lepaskan tombol bicara.

#### 1.1 Papan kedua: si pembalas

1. Di jendela Arduino IDE papan kedua, buka **File → New Sketch**, hapus isinya, lalu tempel kode ini. Simpan sebagai `modul15_pong` di folder `modul-15`.

   ```cpp
   // Modul 15 - Praktik 1, papan KEDUA: "pong".
   // Mendengar terus. Setiap kali satu baris "ping N" lengkap tiba, papan ini bicara sebentar untuk membalas "pong N",
   // lalu kembali mendengar. Arah bicara diatur dengan pin DE/RE: HIGH = bicara, LOW = dengar.
   // Paket esp32 3.3.12; tidak butuh library tambahan.

   const int PIN_RS485_RX = 16;    // RX2 <- RO modul MAX485, lewat pembagi tegangan 4,7 kΩ + 10 kΩ
   const int PIN_RS485_TX = 17;    // TX2 -> DI modul MAX485
   const int PIN_RS485_DE_RE = 4;  // D4 -> DE dan RE modul MAX485 yang disatukan

   char baris[40];  // huruf yang sedang dikumpulkan sampai tanda akhir baris
   int panjang = 0;

   // Bicara sebentar, lalu kembali mendengar. Persis seperti tombol bicara walkie-talkie.
   void kirimBaris(const char* teks) {
     digitalWrite(PIN_RS485_DE_RE, HIGH);  // tekan tombol bicara
     Serial2.print(teks);
     Serial2.flush();                      // tunggu sampai huruf terakhir benar-benar keluar ke kabel
     digitalWrite(PIN_RS485_DE_RE, LOW);   // lepas tombol bicara: kembali mendengar
     while (Serial2.available() > 0) {
       Serial2.read();  // buang sampah yang mungkin terbaca selama papan ini bicara
     }
   }

   void setup() {
     Serial.begin(115200);
     delay(1000);
     pinMode(PIN_RS485_DE_RE, OUTPUT);
     digitalWrite(PIN_RS485_DE_RE, LOW);  // mulai dengan mendengar
     Serial2.begin(9600, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);  // pin wajib ditulis (paket esp32 3.x)
     Serial.println();
     Serial.println("Papan kedua mendengarkan; setiap ping akan dibalas pong.");
   }

   void loop() {
     while (Serial2.available() > 0) {
       char huruf = Serial2.read();
       if (huruf == '\n') {
         baris[panjang] = '\0';
         if (strncmp(baris, "ping ", 5) == 0) {
           char balasan[48];
           snprintf(balasan, sizeof(balasan), "pong %s\n", baris + 5);  // nomornya sama dengan nomor ping
           kirimBaris(balasan);
           Serial.printf("dengar \"%s\" -> balas \"pong %s\"\n", baris, baris + 5);
         } else {
           Serial.printf("dengar sesuatu yang bukan ping: \"%s\"\n", baris);
         }
         panjang = 0;
       } else if (huruf != '\r' && panjang < (int)sizeof(baris) - 1) {
         baris[panjang] = huruf;
         panjang++;
       }
     }
   }
   ```

2. Pastikan papan **DOIT ESP32 DEVKIT V1** dan port papan kedua terpilih, klik **Upload**, lalu buka Serial Monitor-nya (115200 baud). Baris pertamanya berbunyi `Papan kedua mendengarkan; setiap ping akan dibalas pong.` Kalau baris itu terlewat, tekan **EN** di papan kedua.

Perhatikan bagian akhir `kirimBaris()`. Setelah tombol bicara dilepas, sketsa membuang isi antrean terima. Selama papan ini bicara, penerima modulnya mati dan RX2 bisa membaca huruf sampah (Konsep 2). Huruf sampah itu tidak boleh ikut menempel di depan `ping` berikutnya.

#### 1.2 Papan Node 1: si penanya

1. Di jendela Arduino IDE papan Node 1, buka **File → New Sketch**, hapus isinya, tempel kode ini, lalu simpan sebagai `modul15_ping` di folder `modul-15`.

   ```cpp
   // Modul 15 - Praktik 1, papan NODE 1: "ping".
   // Setiap 2 detik bicara sebentar ("ping N"), lalu mendengar balasan "pong N" dari papan kedua,
   // lewat SATU pasang kawat yang sama. Arah bicara diatur dengan pin DE/RE: HIGH = bicara, LOW = dengar.
   // Paket esp32 3.3.12; tidak butuh library tambahan.

   const int PIN_RS485_RX = 16;    // RX2 <- RO modul MAX485, lewat pembagi tegangan 4,7 kΩ + 10 kΩ
   const int PIN_RS485_TX = 17;    // TX2 -> DI modul MAX485
   const int PIN_RS485_DE_RE = 4;  // D4 -> DE dan RE modul MAX485 yang disatukan
   const unsigned long JEDA_PING = 2000;     // satu ping setiap 2 detik
   const unsigned long BATAS_TUNGGU = 500;   // balasan ditunggu paling lama 0,5 detik

   unsigned long nomor = 0;

   // Bicara sebentar, lalu kembali mendengar. Persis seperti tombol bicara walkie-talkie.
   void kirimBaris(const char* teks) {
     digitalWrite(PIN_RS485_DE_RE, HIGH);  // tekan tombol bicara
     Serial2.print(teks);
     Serial2.flush();                      // tunggu sampai huruf terakhir benar-benar keluar ke kabel
     digitalWrite(PIN_RS485_DE_RE, LOW);   // lepas tombol bicara: kembali mendengar
     while (Serial2.available() > 0) {
       Serial2.read();  // buang sampah yang mungkin terbaca selama papan ini bicara
     }
   }

   void setup() {
     Serial.begin(115200);
     delay(1000);
     pinMode(PIN_RS485_DE_RE, OUTPUT);
     digitalWrite(PIN_RS485_DE_RE, LOW);  // mulai dengan mendengar
     Serial2.begin(9600, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);  // pin wajib ditulis (paket esp32 3.x)
     Serial2.setTimeout(BATAS_TUNGGU);
     Serial.println();
     Serial.println("Papan Node 1 siap: ping setiap 2 detik.");
   }

   void loop() {
     nomor++;
     char teks[24];
     snprintf(teks, sizeof(teks), "ping %lu\n", nomor);
     while (Serial2.available() > 0) {
       Serial2.read();  // buang sisa huruf lama supaya balasan yang dibaca benar-benar balasan ping ini
     }
     unsigned long mulai = millis();
     kirimBaris(teks);
     String balasan = Serial2.readStringUntil('\n');  // menunggu paling lama BATAS_TUNGGU
     unsigned long lama = millis() - mulai;
     if (balasan.length() == 0) {
       Serial.printf("ping %lu -> tidak ada balasan dalam %lu ms\n", nomor, BATAS_TUNGGU);
     } else if (balasan.startsWith("pong ")) {
       Serial.printf("ping %lu -> %s (%lu ms pulang-pergi)\n", nomor, balasan.c_str(), lama);
     } else {
       Serial.printf("ping %lu -> balasan rusak (%u huruf)\n", nomor, balasan.length());
     }
     delay(JEDA_PING);
   }
   ```

2. Pilih **DOIT ESP32 DEVKIT V1** dan port papan Node 1, klik **Upload**, lalu buka Serial Monitor-nya.

`Serial2.readStringUntil('\n')` menunggu sampai tanda akhir baris tiba, paling lama `BATAS_TUNGGU` (setengah detik, diatur dengan `Serial2.setTimeout()` di `setup()`). Cara menunggu seperti ini boleh untuk sketsa latihan; firmware Node 1 tidak boleh menunggu selama itu di `loop()`, dan Praktik 5 membahas akibatnya.

#### 1.3 Hasilnya

Serial Monitor Node 1 (contoh):

```text
Papan Node 1 siap: ping setiap 2 detik.
ping 1 -> pong 1 (15 ms pulang-pergi)
ping 2 -> pong 2 (15 ms pulang-pergi)
ping 3 -> pong 3 (15 ms pulang-pergi)
```

Serial Monitor papan kedua (contoh):

```text
dengar "ping 1" -> balas "pong 1"
dengar "ping 2" -> balas "pong 2"
dengar "ping 3" -> balas "pong 3"
```

Mengapa sekitar 15 ms? `ping 1` ditambah tanda akhir baris adalah 7 huruf, dan setiap huruf pada 9600 baud butuh sekitar 1,04 ms: kira-kira 7 ms untuk pergi. Balasan `pong 1` juga 7 huruf: kira-kira 7 ms untuk pulang. Hampir seluruh waktunya habis di kabel. Angka di layarmu bisa berbeda satu-dua milidetik.

Yang muncul `ping 1 -> tidak ada balasan dalam 500 ms`? Periksa dulu Serial Monitor papan kedua. Kalau papan kedua menulis `dengar "ping 1" ...`, pesan Node 1 sampai, tetapi balasannya tidak: buka bagian lipat "Praktik 1: ping sampai, pong tidak" di [🚨](#-kalau-tidak-jalan). Kalau papan kedua tidak menulis apa-apa, kembali ke Kemenangan Cepat: pesan `halo` harus muncul dulu. Pesan `halo` muncul, tetapi papan kedua tetap tidak mendengar ping? Pesan `halo` hanya menguji arah papan kedua → Node 1. Matikan MB102 dan cabut kedua USB, lalu periksa kabel yang baru dipakai di arah sebaliknya: kabel DI Node 1 di **10e**, pembagi papan kedua (14f, resistor 14h–18h dan 18i–22i, kabel hitam 22j, dan kabel 18f ke pin **RX2**), dan terutama kabel dari 24i ke pin **D4** papan kedua. Tanpa kabel itu, resistor di modul menahan DE dan RE di HIGH sehingga penerima papan kedua mati terus.

#### 1.4 Eksperimen: lepas tombol bicara terlalu cepat

1. Di jendela `modul15_pong` (papan kedua), ubah baris `Serial2.flush();` menjadi komentar dengan menambahkan `//` di depannya:

   ```cpp
   //  Serial2.flush();                      // tunggu sampai huruf terakhir benar-benar keluar ke kabel
   ```

2. Klik **Upload**. Sekarang Serial Monitor Node 1 menulis (contoh):

   ```text
   ping 12 -> tidak ada balasan dalam 500 ms
   ping 13 -> tidak ada balasan dalam 500 ms
   ```

   Anehnya, Serial Monitor papan kedua tetap menulis `dengar "ping 12" -> balas "pong 12"`. Papan kedua **merasa** sudah membalas. Padahal, `Serial2.print()` hanya menitipkan huruf-huruf `pong 12` ke antrean UART, lalu D4 langsung diturunkan. Pemancar modul sudah mati sebelum huruf pertama sempat keluar. Di layarmu, kadang muncul `balasan rusak` sebagai ganti `tidak ada balasan`: sepotong huruf sempat lolos.

3. Hapus lagi `//` di depan `Serial2.flush();`, lalu klik **Upload**. Balasannya kembali.

Inilah alasan mengapa kedua library Modbus minggu ini (ModbusRTUSlave di Praktik 2 dan ModbusMaster di Praktik 4), juga sketsa Praktik 3, selalu menunggu huruf terakhir keluar sebelum menurunkan DE/RE. Kalau kelak kamu menulis kode RS-485 sendiri, urutan "bicara → kirim → `flush()` → dengar" tidak boleh dibalik.

> ⬆️ **Selesai Praktik 1?** Kembali ke [Konsep 4](#4-modbus-rtu-bertanya-ke-loker-bernomor).

### Praktik 2 — Sensor tanah RS-485 tiruan di papan kedua (30 menit)

> 🖥️ **Alat:** **Arduino IDE** (jendela papan kedua), library **ModbusRTUSlave** 3.1.2 (🧰), dan rangkaian Kemenangan Cepat. Konsep yang dipakai: 4–6.
>
> 🖥️ **Jalur Wokwi:** di Wokwi, peran sensor tanah dimainkan **chip tiruan** "Sensor Tanah RS-485" dengan lembar data yang sama persis (langkah 2.1). Chip itu kamu pasang di Praktik 3. Baca praktik ini untuk memahami lembar data dan kodenya.

Papan kedua kini menjadi **server Modbus**: ia menyimpan bacaan di loker dan hanya menjawab kalau ditanya. Seperti sensor sungguhan, ia datang dengan lembar data.

#### 2.1 Lembar data sensor tanah RS-485 tiruan

| Butir | Isi |
| :--- | :--- |
| Antarmuka | RS-485 dua kawat (modul MAX485), Modbus RTU |
| Setelan serial | **9600 baud, 8N1** (8 bit data, tanpa paritas, 1 bit akhir) |
| Alamat server bawaan | **1** (bisa diganti 1–247 lewat loker 3) |
| Kode fungsi | **03** (baca *holding register*), **04** (baca *input register*), **06** (tulis satu *holding register*) |
| Catu | 5 V lewat pin VIN papan |

| Loker | Isi | Skala | Fungsi | Contoh |
| :---: | :--- | :--- | :--- | :--- |
| 0 | kelembapan tanah | ×10, satuan % | 03 atau 04 | 585 = 58,5 % |
| 1 | suhu tanah | ×10, satuan °C, **bertanda** | 03 atau 04 | 253 = 25,3 °C; 65.486 (`FF CE`) = −5,0 °C |
| 2 | EC (daya hantar listrik tanah) | ×1, satuan µS/cm | 03 atau 04 | 1.200 |
| 3 | alamat server | 1–247 | 03 (baca), 06 (tulis) | 1 |

Catatan lembar data:

- Loker 0–2 **hanya-baca**. Perintah tulis ke loker itu dijawab seolah berhasil, tetapi isinya diabaikan; Serial Monitor papan kedua mencatatnya.
- Loker 3 hanya ada di lemari *holding register*. Alamat baru langsung berlaku setelah jawaban dikirim, tetapi **tidak tersimpan**: setelah papan di-*restart*, alamatnya kembali 1. Sensor sungguhan biasanya menyimpannya permanen.
- Permintaan untuk loker di luar 0–3 (atau di luar 0–2 untuk fungsi 04) dijawab dengan *exception* `02`. Fungsi lain, misalnya 05 (tulis *coil*), dijawab dengan *exception* `01`.
- Lampu biru di papan berkedip setiap kali papan menjawab.

#### 2.2 Unggah sketsa sensor tiruan

1. Di jendela Arduino IDE papan kedua, buka **File → New Sketch**, hapus isinya, lalu tempel kode ini. Simpan sebagai `modul15_sensor_tiruan` di folder `modul-15`.

   ```cpp
   // Modul 15 - Praktik 2, papan KEDUA: "sensor tanah RS-485" tiruan (server Modbus RTU).
   // Papan ini menjawab permintaan Modbus dari Node 1 lewat modul MAX485, persis seperti sensor tanah industri.
   // Lembar datanya ada di README Modul 15 (Praktik 2): alamat server 1, 9600 baud 8N1, loker (register) 0-3.
   // Bacaannya bisa diubah lewat Serial Monitor papan ini: kelembapan 62.5, suhu -5.0, ec 800, info.
   // Library: ModbusRTUSlave versi 3.1.2 (ikut terpasang: ModbusADU versi 1.0.2, ModbusRTUComm versi 1.3.2,
   // dan ModbusSlaveLogic versi 1.0.1). Paket esp32 3.3.12.

   #include <ModbusRTUSlave.h>

   const int PIN_RS485_RX = 16;    // RX2 <- RO modul MAX485, lewat pembagi tegangan 4,7 kΩ + 10 kΩ
   const int PIN_RS485_TX = 17;    // TX2 -> DI modul MAX485
   const int PIN_RS485_DE_RE = 4;  // D4 -> DE dan RE modul MAX485 yang disatukan
   const int PIN_LED = 2;          // LED biru di papan: berkedip setiap kali papan ini menjawab
   const unsigned long BAUD_RS485 = 9600;
   const uint8_t ALAMAT_BAWAAN = 1;

   ModbusRTUSlave server(Serial2, PIN_RS485_DE_RE);  // library ini sendiri yang menaikkan DE/RE saat menjawab

   // "Loker" Modbus. Loker 0-2 berisi bacaan dan ada di dua lemari: holding register (dibaca dengan fungsi 03)
   // dan input register (dibaca dengan fungsi 04). Loker holding 3 berisi alamat server dan boleh ditulis (fungsi 06).
   uint16_t lokerHolding[4];
   uint16_t lokerInput[3];

   // Bacaan "sebenarnya" sensor tiruan ini, sudah dikalikan 10 seperti di lembar datanya.
   int kelembapan10 = 585;  // 58,5 %
   int suhu10 = 253;        // 25,3 °C (boleh negatif)
   int ec = 1200;           // µS/cm, tanpa pengali
   uint8_t alamat = ALAMAT_BAWAAN;

   unsigned long jumlahJawaban = 0;
   unsigned long waktuLedNyala = 0;
   char baris[41];  // perintah dari Serial Monitor, paling panjang 40 huruf
   int panjangBaris = 0;

   // Menyalin bacaan sebenarnya ke loker. Suhu negatif disimpan sebagai komplemen dua: -5,0 °C = -50 = 0xFFCE.
   void isiLoker() {
     lokerHolding[0] = lokerInput[0] = (uint16_t)kelembapan10;
     lokerHolding[1] = lokerInput[1] = (uint16_t)suhu10;
     lokerHolding[2] = lokerInput[2] = (uint16_t)ec;
     lokerHolding[3] = alamat;
   }

   // Dipanggil setelah setiap permintaan: loker 0-2 hanya-baca, loker 3 boleh berisi alamat baru 1-247.
   void periksaTulisan() {
     uint16_t benar[3] = {(uint16_t)kelembapan10, (uint16_t)suhu10, (uint16_t)ec};
     for (int i = 0; i < 3; i++) {
       if (lokerHolding[i] != benar[i]) {
         Serial.printf("Ada yang menulis loker %d: diabaikan, loker 0-2 hanya-baca.\n", i);
       }
     }
     if (lokerHolding[3] != alamat) {
       if (lokerHolding[3] >= 1 && lokerHolding[3] <= 247) {
         alamat = lokerHolding[3];
         server.begin(alamat, BAUD_RS485);  // mulai sekarang hanya menjawab alamat baru
         Serial.printf("Alamat server diganti menjadi %u (setelah restart kembali ke %u).\n", alamat, ALAMAT_BAWAAN);
       } else {
         Serial.printf("Alamat %u ditolak: harus 1 sampai 247.\n", lokerHolding[3]);
       }
     }
     isiLoker();
   }

   void cetakInfo() {
     Serial.printf("info: alamat %u, kelembapan %.1f %%, suhu %.1f C, ec %d uS/cm, sudah menjawab %lu permintaan\n",
                   alamat, kelembapan10 / 10.0, suhu10 / 10.0, ec, jumlahJawaban);
   }

   // Mengubah teks menjadi angka. Menjawab false kalau teksnya bukan angka (misalnya "abc").
   bool bacaAngka(const char* teks, float& hasil) {
     char* akhir;
     hasil = strtof(teks, &akhir);
     return akhir != teks && *akhir == '\0';
   }

   void kerjakanPerintah() {
     float angka = 0;
     if (strcmp(baris, "info") == 0) {
       cetakInfo();
       return;
     }
     if (strncmp(baris, "kelembapan ", 11) == 0) {
       if (!bacaAngka(baris + 11, angka) || angka < 0 || angka > 100) {
         Serial.println("Butuh angka 0 sampai 100. Contoh: kelembapan 62.5");
         return;
       }
       kelembapan10 = lroundf(angka * 10);
     } else if (strncmp(baris, "suhu ", 5) == 0) {
       if (!bacaAngka(baris + 5, angka) || angka < -40 || angka > 80) {
         Serial.println("Butuh angka -40 sampai 80. Contoh: suhu -5.0");
         return;
       }
       suhu10 = lroundf(angka * 10);
     } else if (strncmp(baris, "ec ", 3) == 0) {
       if (!bacaAngka(baris + 3, angka) || angka < 0 || angka > 20000) {
         Serial.println("Butuh angka 0 sampai 20000. Contoh: ec 800");
         return;
       }
       ec = lroundf(angka);
     } else {
       Serial.println("Perintah tidak dikenal. Contoh: kelembapan 62.5 | suhu -5.0 | ec 800 | info");
       return;
     }
     isiLoker();  // bacaan baru langsung masuk loker
     cetakInfo();
   }

   // Mengumpulkan huruf dari Serial Monitor tanpa menunggu; satu baris lengkap langsung dikerjakan.
   void periksaSerial() {
     while (Serial.available() > 0) {
       char huruf = Serial.read();
       if (huruf == '\n') {
         baris[panjangBaris] = '\0';
         panjangBaris = 0;
         kerjakanPerintah();
       } else if (huruf != '\r' && panjangBaris < 40) {
         baris[panjangBaris] = huruf;
         panjangBaris++;
       }
     }
   }

   void setup() {
     Serial.begin(115200);
     delay(1000);
     pinMode(PIN_LED, OUTPUT);
     isiLoker();
     server.configureHoldingRegisters(lokerHolding, 4);
     server.configureInputRegisters(lokerInput, 3);
     // Urutannya penting: Serial2 dimulai dulu (pin wajib ditulis), baru server.begin().
     Serial2.begin(BAUD_RS485, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);
     server.begin(alamat, BAUD_RS485);
     Serial.println();
     Serial.println("Sensor tanah RS-485 tiruan siap (Modbus RTU, 9600 baud 8N1).");
     Serial.println("Loker 0 = kelembapan x10, 1 = suhu x10, 2 = EC, 3 = alamat server (boleh ditulis).");
     cetakInfo();
   }

   void loop() {
     if (server.poll()) {  // true = ada permintaan untuk alamat ini, dan sudah dijawab
       jumlahJawaban++;
       Serial.printf("[%lu] menjawab permintaan client\n", jumlahJawaban);
       digitalWrite(PIN_LED, HIGH);
       waktuLedNyala = millis();
       periksaTulisan();
     }
     if (digitalRead(PIN_LED) == HIGH && millis() - waktuLedNyala >= 50) {
       digitalWrite(PIN_LED, LOW);  // kedip singkat 50 ms
     }
     periksaSerial();
   }
   ```

2. Pilih **DOIT ESP32 DEVKIT V1** dan port papan kedua, klik **Upload**, lalu buka Serial Monitor-nya. **Hasilnya** (rekaman uji Wokwi):

   ```text
   Sensor tanah RS-485 tiruan siap (Modbus RTU, 9600 baud 8N1).
   Loker 0 = kelembapan x10, 1 = suhu x10, 2 = EC, 3 = alamat server (boleh ditulis).
   info: alamat 1, kelembapan 58.5 %, suhu 25.3 C, ec 1200 uS/cm, sudah menjawab 0 permintaan
   ```

   Gagal kompilasi dengan pesan `ModbusRTUSlave.h: No such file or directory`? Library-nya belum terpasang (🧰).

Papan Node 1 masih menjalankan sketsa `modul15_ping` dari Praktik 1. Sekarang `ping`-nya tidak dijawab lagi: papan kedua kini hanya berbicara Modbus, bukan "ping-pong". Biarkan saja; Praktik 3 mengganti sketsa Node 1.

#### 2.3 Bagian penting kodenya

- **`ModbusRTUSlave server(Serial2, PIN_RS485_DE_RE);`** — library diberi tahu **jalan** keluar-masuknya (`Serial2`) dan **tombol bicaranya** (D4). Saat menjawab, library sendiri yang menaikkan D4, mengirim, menunggu huruf terakhir keluar, lalu menurunkan D4.
- **`configureHoldingRegisters(lokerHolding, 4)`** dan **`configureInputRegisters(lokerInput, 3)`** — library diberi dua lemari loker berupa larik (*array*) `uint16_t`. Nomor loker = nomor laci larik: loker 0 = `lokerHolding[0]`, dan seterusnya. Isinya diisi `isiLoker()`.
- **`Serial2.begin(...)` sebelum `server.begin(alamat, BAUD_RS485)`** — library ini tidak menyalakan `Serial2` sendiri. `server.begin()` hanya mencatat alamat, menghitung lama "kabel diam" dari laju baud (Konsep 5), dan membuang sisa huruf lama. Jadi, `Serial2` harus sudah menyala, lengkap dengan pin 16 dan 17.
- **`server.poll()` di `loop()`** — kalau tidak ada pertanyaan, fungsi ini langsung kembali tanpa menunggu. Kalau ada, ia membaca bingkainya, memeriksa CRC dan alamat, mengisi jawaban dari larik loker, mengirimnya, lalu menjawab `true`. Pertanyaan untuk alamat lain diabaikan (`false`).
- **`(uint16_t)suhu10`** — suhu −5,0 °C (−50) disimpan sebagai komplemen dua, `FF CE` (Konsep 6). Pembacanya yang wajib mengubahnya kembali dengan `(int16_t)`.
- **`periksaTulisan()`** — library menulis loker apa pun yang diminta fungsi 06. Fungsi ini yang membuat loker 0–2 tetap hanya-baca dan menerapkan alamat baru dari loker 3.

#### 2.4 Ubah bacaannya dari Serial Monitor

Pastikan pilihan akhir baris di bagian atas Serial Monitor papan kedua adalah **New Line**, seperti Modul 8: tanpa tanda akhir baris, sketsa minggu ini tidak pernah mengerjakan perintahmu. Lalu ketik di kotak kirimnya dan tekan **Enter**:

| Ketik | Artinya |
| :--- | :--- |
| `kelembapan 62.5` | kelembapan tanah menjadi 62,5 % (loker 0 = 625) |
| `suhu -5.0` | suhu tanah −5,0 °C (loker 1 = 65.486) |
| `ec 800` | EC 800 µS/cm |
| `info` | tampilkan semua bacaan, alamat, dan jumlah jawaban |

Pakai **titik** sebagai tanda desimal karena ESP32 membaca angka dengan cara Inggris. **Hasilnya** setelah mengetik `suhu -5.0`, `kelembapan 62.5`, lalu `ec 800`, dengan urutan itu (rekaman uji Wokwi; angka `sudah menjawab` di layarmu masih 0):

```text
info: alamat 1, kelembapan 58.5 %, suhu -5.0 C, ec 1200 uS/cm, sudah menjawab 15 permintaan
info: alamat 1, kelembapan 62.5 %, suhu -5.0 C, ec 1200 uS/cm, sudah menjawab 16 permintaan
info: alamat 1, kelembapan 62.5 %, suhu -5.0 C, ec 800 uS/cm, sudah menjawab 16 permintaan
```

Salah ketik dijawab dengan contoh yang benar, misalnya `Butuh angka 0 sampai 100. Contoh: kelembapan 62.5` untuk `kelembapan 150`.

Setelah mencoba, tekan **EN** di papan kedua supaya bacaannya kembali ke 58,5 %, 25,3 °C, dan 1.200 µS/cm. Contoh-contoh di Praktik 3 dan 4 memakai angka itu.

Sensor tiruan ini belum pernah ditanya siapa pun. Praktik 3 mengajukan pertanyaan pertamanya, byte demi byte.

### Praktik 3 — Bingkai Modbus dengan tangan (40 menit)

> 🖥️ **Alat:** **Arduino IDE** dengan dua jendela; papan Node 1 dan papan kedua tercolok ke laptop, dan MB102 menyala (USB dulu, baru MB102); papan kedua menjalankan `modul15_sensor_tiruan` (Praktik 2); papan Node 1 akan menjalankan sketsa baru. Konsep yang dipakai: 5–6.
>
> 🖥️ **Jalur Wokwi:** mulai dari praktik ini, jalur Wokwi berjalan penuh. Siapkan proyeknya di langkah 3.1W, lalu kerjakan langkah 3.2–3.4 dengan Serial Monitor Wokwi. Semua kotak **Hasilnya** di praktik ini adalah rekaman uji Wokwi.

Sebelum memakai library, kamu akan mengirim pertanyaan Modbus **byte demi byte** dan membaca jawabannya sendiri. Sketsa Node 1 kali ini hanya melakukan tiga hal: menambahkan CRC ke byte yang kamu ketik, mengirimkannya dengan tombol bicara yang benar, lalu mencetak jawaban yang tiba.

#### 3.1 Unggah sketsa bingkai ke papan Node 1

1. Di jendela Arduino IDE papan Node 1, buka **File → New Sketch**, hapus isinya, tempel kode ini, lalu simpan sebagai `modul15_bingkai_mentah` di folder `modul-15`.

   ```cpp
   // Modul 15 - Praktik 3, papan NODE 1: bingkai Modbus "dengan tangan".
   // Ketik byte permintaan TANPA CRC di Serial Monitor, misalnya:  01 03 00 00 00 03
   // Sketsa ini menghitung CRC, mengirim bingkainya lewat RS-485, lalu mencetak jawaban server byte demi byte.
   // Tambahkan x di akhir baris untuk sengaja merusak CRC, misalnya:  01 03 00 00 00 03 x
   // Paket esp32 3.3.12; tidak butuh library tambahan.

   const int PIN_RS485_RX = 16;    // RX2 <- RO modul MAX485, lewat pembagi tegangan 4,7 kΩ + 10 kΩ
   const int PIN_RS485_TX = 17;    // TX2 -> DI modul MAX485
   const int PIN_RS485_DE_RE = 4;  // D4 -> DE dan RE modul MAX485 yang disatukan
   const unsigned long BATAS_TUNGGU = 1000;  // jawaban ditunggu paling lama 1 detik
   const unsigned long JEDA_SELESAI = 5;     // kabel diam lebih dari 5 ms setelah byte terakhir = jawaban selesai

   char baris[100];  // perintah dari Serial Monitor
   int panjangBaris = 0;

   // CRC-16/MODBUS: mulai dari 0xFFFF, polinom 0xA001 (spesifikasi Modbus jalur serial, Lampiran B).
   uint16_t hitungCrc(const uint8_t* data, size_t panjang) {
     uint16_t crc = 0xFFFF;
     for (size_t i = 0; i < panjang; i++) {
       crc ^= data[i];
       for (int bit = 0; bit < 8; bit++) {
         if (crc & 1) {
           crc = (crc >> 1) ^ 0xA001;
         } else {
           crc = crc >> 1;
         }
       }
     }
     return crc;
   }

   void cetakByte(const char* judul, const uint8_t* data, size_t panjang) {
     Serial.printf("%s (%u byte):", judul, (unsigned)panjang);
     for (size_t i = 0; i < panjang; i++) {
       Serial.printf(" %02X", data[i]);
     }
     Serial.println();
   }

   const char* namaException(uint8_t kode) {
     if (kode == 0x01) {
       return "ILLEGAL FUNCTION: kode fungsi tidak dikenal server";
     }
     if (kode == 0x02) {
       return "ILLEGAL DATA ADDRESS: loker yang diminta tidak ada";
     }
     if (kode == 0x03) {
       return "ILLEGAL DATA VALUE: isi permintaan tidak sah";
     }
     if (kode == 0x04) {
       return "SERVER DEVICE FAILURE: server gagal mengerjakannya";
     }
     return "kode lain";
   }

   // Menjelaskan jawaban server. "awal" = nomor loker pertama yang diminta (untuk fungsi 03 dan 04).
   void jelaskanJawaban(const uint8_t* j, size_t n, uint16_t awal) {
     if (n < 4 || hitungCrc(j, n) != 0) {  // CRC atas seluruh bingkai, termasuk 2 byte CRC-nya: hasil 0 = utuh
       Serial.println("  CRC jawaban SALAH: bingkai ini rusak di jalan.");
       return;
     }
     Serial.println("  CRC jawaban cocok: bingkai utuh.");
     uint8_t fungsi = j[1];
     if (fungsi & 0x80) {
       Serial.printf("  Exception: fungsi %02X ditolak dengan kode %02X = %s\n", fungsi & 0x7F, j[2], namaException(j[2]));
     } else if (fungsi == 0x03 || fungsi == 0x04) {
       int jumlah = j[2] / 2;  // 2 byte per loker
       for (int i = 0; i < jumlah && 4 + 2 * i < (int)n - 2; i++) {
         uint16_t nilai = (j[3 + 2 * i] << 8) | j[4 + 2 * i];  // byte tinggi dulu (big-endian)
         Serial.printf("  loker %u: %02X %02X = %u", awal + i, j[3 + 2 * i], j[4 + 2 * i], nilai);
         if (nilai > 32767) {
           Serial.printf(" (kalau bertanda: %d)", (int16_t)nilai);
         }
         Serial.println();
       }
     } else if (fungsi == 0x06) {
       Serial.println("  Fungsi 06 berhasil: jawaban normalnya adalah gema (salinan persis) permintaan.");
     }
   }

   // Mengubah teks seperti "01 03 00 00 00 03 x" menjadi byte. Menjawab false kalau ada yang salah ketik.
   bool bacaPermintaan(char* teks, uint8_t* bingkai, size_t& n, bool& rusak) {
     n = 0;
     rusak = false;
     char* potongan = strtok(teks, " ");
     while (potongan != nullptr) {
       if (strcmp(potongan, "x") == 0 || strcmp(potongan, "X") == 0) {
         rusak = true;
       } else {
         char* akhir;
         long nilai = strtol(potongan, &akhir, 16);
         if (*akhir != '\0' || strlen(potongan) > 2) {
           Serial.printf("\"%s\" bukan byte heksadesimal (00 sampai FF).\n", potongan);
           return false;
         }
         if (n >= 30) {
           Serial.println("Terlalu panjang: paling banyak 30 byte.");
           return false;
         }
         bingkai[n] = (uint8_t)nilai;
         n++;
       }
       potongan = strtok(nullptr, " ");
     }
     if (n < 2) {
       Serial.println("Paling sedikit 2 byte: alamat server dan kode fungsi. Contoh: 01 03 00 00 00 03");
       return false;
     }
     return true;
   }

   void kirimDanDengar() {
     uint8_t bingkai[32];
     size_t n = 0;
     bool rusak = false;
     if (!bacaPermintaan(baris, bingkai, n, rusak)) {
       return;
     }
     uint16_t awal = (n >= 4) ? (bingkai[2] << 8) | bingkai[3] : 0;
     uint16_t crc = hitungCrc(bingkai, n);
     if (rusak) {
       crc = crc ^ 0xFFFF;  // sengaja dirusak: semua bitnya dibalik
     }
     bingkai[n] = crc & 0xFF;  // byte RENDAH CRC dikirim dulu
     bingkai[n + 1] = crc >> 8;
     n = n + 2;

     while (Serial2.available() > 0) {
       Serial2.read();  // buang sisa lama
     }
     digitalWrite(PIN_RS485_DE_RE, HIGH);  // bicara
     Serial2.write(bingkai, n);
     Serial2.flush();                      // tunggu byte terakhir keluar
     digitalWrite(PIN_RS485_DE_RE, LOW);   // dengar
     while (Serial2.available() > 0) {
       Serial2.read();  // buang sampah yang mungkin terbaca selama papan ini bicara (Konsep 2)
     }
     if (rusak) {
       cetakByte("kirim, CRC sengaja dirusak", bingkai, n);
     } else {
       cetakByte("kirim", bingkai, n);
     }

     uint8_t jawaban[64];
     size_t m = 0;
     unsigned long mulai = millis();
     unsigned long waktuByteTerakhir = mulai;
     while (true) {
       if (Serial2.available() > 0) {
         uint8_t b = Serial2.read();
         if (m < sizeof(jawaban)) {
           jawaban[m] = b;
           m++;
         }
         waktuByteTerakhir = millis();
       } else if (m == 0 && millis() - mulai > BATAS_TUNGGU) {
         break;  // tidak ada satu byte pun
       } else if (m > 0 && millis() - waktuByteTerakhir > JEDA_SELESAI) {
         break;  // kabel diam: jawaban selesai
       }
     }
     if (m == 0) {
       Serial.printf("terima: tidak ada jawaban dalam %lu ms (timeout)\n", BATAS_TUNGGU);
       return;
     }
     Serial.printf("terima dalam %lu ms setelah permintaan selesai.\n", waktuByteTerakhir - mulai);
     cetakByte("terima", jawaban, m);
     jelaskanJawaban(jawaban, m, awal);
   }

   void setup() {
     Serial.begin(115200);
     delay(1000);
     pinMode(PIN_RS485_DE_RE, OUTPUT);
     digitalWrite(PIN_RS485_DE_RE, LOW);  // mulai dengan mendengar
     Serial2.begin(9600, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);  // pin wajib ditulis (paket esp32 3.x)
     Serial.println();
     Serial.println("Ketik byte permintaan tanpa CRC, lalu Enter. Contoh: 01 03 00 00 00 03");
   }

   void loop() {
     while (Serial.available() > 0) {
       char huruf = Serial.read();
       if (huruf == '\n') {
         baris[panjangBaris] = '\0';
         panjangBaris = 0;
         Serial.printf("> %s\n", baris);
         kirimDanDengar();
       } else if (huruf != '\r' && panjangBaris < (int)sizeof(baris) - 1) {
         baris[panjangBaris] = huruf;
         panjangBaris++;
       }
     }
   }
   ```

2. Pilih **DOIT ESP32 DEVKIT V1** dan port papan Node 1, klik **Upload**, lalu buka Serial Monitor-nya. Baris pertamanya berbunyi `Ketik byte permintaan tanpa CRC, lalu Enter. Contoh: 01 03 00 00 00 03`.

Fungsi `hitungCrc()` adalah resep CRC-16 Modbus dari spesifikasinya: mulai dari `0xFFFF`, lalu setiap byte "diaduk" delapan kali dengan angka `0xA001`. Kamu tidak perlu menghafalnya. Yang penting: CRC dihitung dari **semua** byte sebelumnya, dan menghitung CRC atas seluruh bingkai yang utuh (termasuk dua byte CRC-nya) selalu menghasilkan 0. Itulah cara `jelaskanJawaban()` memeriksa jawaban.

#### 3.1W Jalur Wokwi: proyek dengan chip "Sensor Tanah RS-485"

Chip tiruan Wokwi terdiri atas dua file: `sensor-tanah.chip.json` (nama kaki dan penggeser) dan `sensor-tanah.chip.c` (perilakunya). Keduanya ada di folder [`kode/wokwi-sensor-tanah-rs485`](kode/wokwi-sensor-tanah-rs485), bersama `diagram.json` proyeknya.

1. Buka proyek ESP32 baru di [wokwi.com](https://wokwi.com).
2. Di tab **`diagram.json`**, ganti seluruh isinya dengan isi [`kode/wokwi-sensor-tanah-rs485/diagram.json`](kode/wokwi-sensor-tanah-rs485/diagram.json) (buka di GitHub, klik **Copy raw file**, lalu tempel).
3. Buat file **`sensor-tanah.chip.json`** lewat **▾ → New file...** (panah kecil di ujung kanan deretan tab), lalu tempel isi [`sensor-tanah.chip.json`](kode/wokwi-sensor-tanah-rs485/sensor-tanah.chip.json) ke tab baru itu.
4. Dengan cara yang sama, buat file **`sensor-tanah.chip.c`** dan tempel isi [`sensor-tanah.chip.c`](kode/wokwi-sensor-tanah-rs485/sensor-tanah.chip.c). Nama kedua file harus persis karena `diagram.json` mencari chip bernama `sensor-tanah`. Gambar rangkaian baru lengkap setelah kedua file itu ada.
5. Di tab **`sketch.ino`**, ganti seluruh isinya dengan kode `modul15_bingkai_mentah` dari langkah 3.1.
6. Klik **▶** (*Start the simulation*). Wokwi mengompilasi sketsa ESP32 **dan** chip-nya, jadi tunggu lebih lama daripada biasanya. Chip tampil sebagai papan hijau bertulisan "Sensor Tanah RS-485 (tiruan)", tersambung ke RX2, TX2, dan D4 seperti modul MAX485 sungguhan.

Di bawah simulasi kini ada dua tab: **SERIAL MONITOR** (ESP32) dan **CHIPS CONSOLE** (pesan dari chip tiruan, misalnya `Sensor tanah RS-485 tiruan siap: alamat 1, 9600 baud 8N1.`). Simpan proyek ini (**SAVE**): Praktik 4 memakainya lagi. Proyek ini juga membawa **Logic Analyzer** ungu (nomor 3 di gambar) untuk 🔬. Akibatnya, setiap kali simulasi dihentikan, browser mengunduh file `wokwi-logic.vcd`. Itu wajar dan aman; file itu boleh dihapus kalau tidak kamu pakai.

![Tangkapan layar Wokwi proyek Praktik 3 dengan lima nomor. Kiri, rangkaian: 1 ESP32, papan Node 1 di jalur Wokwi; 2 chip tiruan hijau bertulisan Sensor Tanah RS-485 (tiruan), dibuat dari sensor-tanah.chip.json dan sensor-tanah.chip.c, tersambung ke RX2, TX2, dan D4 seperti modul MAX485 sungguhan, dengan kaki VCC ke simbol VCC Wokwi; 3 Wokwi Logic, Logic Analyzer ungu yang merekam DI, RO, dan DE/RE untuk Bedah Teknis. Kanan, 4 dua tab di bawah simulasi: SERIAL MONITOR untuk pesan ESP32 dan CHIPS CONSOLE untuk pesan chip tiruan. Bawah, 5 panel penggeser yang muncul saat chip diklik selama simulasi berjalan: Kelembapan tanah (%) 62.5, Suhu tanah (°C) -5, dan EC (µS/cm) 1200 sebagai contoh; bawaannya 58,5 persen, 25,3 derajat Celsius, dan 1.200 mikrosiemens per sentimeter.](aset/wokwi-sensor-tanah-rs485.png)

Chip ini meniru **bahasa Modbus**-nya (bingkai, CRC, jeda 3,5 huruf, alamat, loker, *exception*) dan tombol bicara DE/RE: kalau D4 masih HIGH saat chip menjawab, jawabannya hilang, persis seperti modul sungguhan. Yang **tidak** ditirunya adalah listrik: kawat A dan B, terminator, panjang kabel, dan tegangan catu. Kaki VCC chip cukup disambung ke simbol VCC Wokwi, sedangkan modul MAX485 sungguhan tetap wajib diberi 5 V. Bacaannya bisa diubah dengan penggeser: klik chip saat simulasi berjalan.

#### 3.2 Pertanyaan pertama: "server 1, bacakan 3 loker mulai loker 0"

Di papan asli, pastikan pilihan akhir baris di Serial Monitor Node 1 juga **New Line** (seperti 2.4). Lalu ketik di kotak kirimnya dan tekan **Enter**:

```text
01 03 00 00 00 03
```

**Hasilnya** (rekaman uji Wokwi):

```text
> 01 03 00 00 00 03
kirim (8 byte): 01 03 00 00 00 03 05 CB
terima dalam 14 ms setelah permintaan selesai.
terima (11 byte): 01 03 06 02 49 00 FD 04 B0 6F DD
  CRC jawaban cocok: bingkai utuh.
  loker 0: 02 49 = 585
  loker 1: 00 FD = 253
  loker 2: 04 B0 = 1200
```

Sketsa menambahkan `05 CB` (CRC) di belakang enam byte yang kamu ketik, persis seperti tabel Konsep 5. Jawabannya pun sama persis dengan tabel itu. Di papan asli, lampu biru papan kedua berkedip sekali dan Serial Monitor-nya menulis `[1] menjawab permintaan client`. Angka milidetiknya sedikit lebih besar, sekitar 18 ms, karena sketsa papan kedua menunggu kabel diam sedikit lebih lama daripada chip Wokwi.

Bandingkan dengan lembar data (Praktik 2.1): 585 ÷ 10 = 58,5 %, 253 ÷ 10 = 25,3 °C, dan EC 1.200 µS/cm.

#### 3.3 Enam pertanyaan lain

Ketik satu per satu. Setiap baris di kolom kedua adalah rekaman uji Wokwi; di papan asli hasilnya sama, kecuali angka milidetiknya.

| Ketik | Hasilnya | Artinya |
| :--- | :--- | :--- |
| `01 04 00 00 00 03` | `kirim (8 byte): 01 04 00 00 00 03 B0 0B`, lalu `terima (11 byte): 01 04 06 02 49 00 FD 04 B0 2E 3B` | fungsi 04 (*input register*) memberi isi yang sama; CRC-nya berbeda karena satu byte berubah |
| `01 03 00 03 00 01` | `terima (7 byte): 01 03 02 00 01 79 84` dan `loker 3: 00 01 = 1` | loker 3 berisi alamat server |
| `01 03 00 05 00 01` | `terima (5 byte): 01 83 02 C0 F1` dan `Exception: fungsi 03 ditolak dengan kode 02 = ILLEGAL DATA ADDRESS: loker yang diminta tidak ada` | loker 5 tidak ada; server hidup dan menolak dengan cepat |
| `01 03 00 00 00 03 x` | `kirim, CRC sengaja dirusak (8 byte): 01 03 00 00 00 03 FA 34`, lalu `terima: tidak ada jawaban dalam 1000 ms (timeout)` | segel rusak: server membuang bingkainya dan diam (di Wokwi, **CHIPS CONSOLE** menulis `Bingkai rusak atau CRC salah (8 byte): diam, seperti alat sungguhan.`) |
| `02 03 00 00 00 03` | `kirim (8 byte): 02 03 00 00 00 03 05 F8`, lalu `terima: tidak ada jawaban dalam 1000 ms (timeout)` | tidak ada server beralamat 2: tidak ada yang menjawab |
| `01 05 00 00 FF 00` | `terima (5 byte): 01 85 01 83 50` dan `Exception: fungsi 05 ditolak dengan kode 01 = ILLEGAL FUNCTION: kode fungsi tidak dikenal server` | fungsi 05 (tulis *coil*) tidak dikenal sensor ini |

Perhatikan dua *timeout* di tabel itu. Dari sisi Node 1, "segel rusak" dan "alamat salah" tampak **sama persis**: diam. Itulah sebabnya *timeout* selalu membuat kita memeriksa kabel, alamat, dan setelan serial (Konsep 6), sedangkan *exception* membuat kita memeriksa pertanyaannya.

#### 3.4 Ganti alamat sensor dengan fungsi 06

Di lapangan, dua sensor tanah yang dibeli dari toko yang sama biasanya sama-sama beralamat 1. Sebelum keduanya dipasang di satu bus, alamat salah satunya harus diganti, dan caranya adalah menulis loker alamatnya dengan fungsi 06. Coba di sensor tiruanmu:

1. Ketik `01 06 00 03 00 02` ("server 1, tulis loker 3 dengan angka 2"). **Hasilnya:**

   ```text
   > 01 06 00 03 00 02
   kirim (8 byte): 01 06 00 03 00 02 F8 0B
   terima dalam 11 ms setelah permintaan selesai.
   terima (8 byte): 01 06 00 03 00 02 F8 0B
     CRC jawaban cocok: bingkai utuh.
     Fungsi 06 berhasil: jawaban normalnya adalah gema (salinan persis) permintaan.
   ```

   Jawaban fungsi 06 adalah **gema**: salinan persis pertanyaannya. Serial Monitor papan kedua menulis `Alamat server diganti menjadi 2 (setelah restart kembali ke 1).` (di Wokwi, **CHIPS CONSOLE** menulis `Alamat server diganti menjadi 2 (simulasi baru = kembali ke 1).`).

2. Ketik lagi `01 03 00 00 00 03`. Kali ini ***timeout***: server 1 sudah tidak ada.
3. Ketik `02 03 00 03 00 01` ("server 2, bacakan loker 3"). **Hasilnya:** `terima (7 byte): 02 03 02 00 02 7D 85` dan `loker 3: 00 02 = 2`.
4. Kembalikan alamatnya: ketik `02 06 00 03 00 01`. Jawabannya gema `02 06 00 03 00 01 B8 39`, dan sensor kembali beralamat 1.

Sekarang kamu bisa membaca dan menulis bingkai Modbus dengan tangan. Di firmware sungguhan, tidak ada yang mengetik byte satu per satu: Praktik 4 menyerahkan pekerjaan itu kepada library.

### Praktik 4 — ModbusMaster: membaca tiga loker (40 menit)

> 🖥️ **Alat:** **Arduino IDE** dengan dua jendela, library **ModbusMaster** 2.0.1 (🧰), papan Node 1 dan papan kedua tercolok ke laptop, dan MB102 menyala; papan kedua menjalankan `modul15_sensor_tiruan` (tekan **EN** di papan kedua dulu supaya bacaannya kembali ke angka bawaan). Konsep yang dipakai: 4–6.
>
> 🖥️ **Jalur Wokwi:** buka lagi proyek Praktik 3. Ganti isi tab **`sketch.ino`** dengan kode di langkah 4.1, lalu tambahkan library lewat tab **Library Manager** → **+** → ketik `ModbusMaster` → klik entri **ModbusMaster** (atau buat file **`libraries.txt`** yang isinya sama dengan [`kode/wokwi-sensor-tanah-rs485/libraries.txt`](kode/wokwi-sensor-tanah-rs485/libraries.txt)). Bacaan sensor tiruannya diubah lewat penggeser chip, bukan lewat Serial Monitor.

Di Praktik 3, kamu menyusun byte sendiri. Library **ModbusMaster** mengerjakan semuanya: menyusun bingkai, menghitung CRC, menekan dan melepas tombol bicara lewat fungsi yang kamu berikan, menunggu jawaban, memeriksa CRC dan alamatnya, lalu menyerahkan isi loker dalam bentuk angka. Nama library-nya masih memakai istilah lama: *master* = klien.

#### 4.1 Unggah sketsa pembaca

1. Di jendela Arduino IDE papan Node 1, buka **File → New Sketch**, hapus isinya, tempel kode ini, lalu simpan sebagai `modul15_baca_register` di folder `modul-15`.

   ```cpp
   // Modul 15 - Praktik 4, papan NODE 1: membaca "sensor tanah RS-485" dengan library ModbusMaster.
   // Setiap 5 detik membaca loker 0-2, mengubahnya menjadi angka sebenarnya, dan menulis lama transaksinya.
   // Perintah di Serial Monitor: fungsi 3 | fungsi 4 | server 2 | loker 3 | tulis 3 2
   // Library: ModbusMaster versi 2.0.1 (Doc Walker). Paket esp32 3.3.12.

   #include <ModbusMaster.h>

   const int PIN_RS485_RX = 16;    // RX2 <- RO modul MAX485, lewat pembagi tegangan 4,7 kΩ + 10 kΩ
   const int PIN_RS485_TX = 17;    // TX2 -> DI modul MAX485
   const int PIN_RS485_DE_RE = 4;  // D4 -> DE dan RE modul MAX485 yang disatukan
   const unsigned long JEDA_BACA = 5000;

   ModbusMaster sensor;
   uint8_t alamatServer = 1;  // alamat sensor yang ditanya (lembar data: bawaan 1)
   uint8_t kodeFungsi = 3;    // 3 = baca holding register, 4 = baca input register
   unsigned long waktuBacaTerakhir = 0;
   char baris[41];
   int panjangBaris = 0;

   // Dipanggil ModbusMaster tepat sebelum mengirim permintaan.
   void sebelumKirim() {
     digitalWrite(PIN_RS485_DE_RE, HIGH);  // tekan tombol bicara
   }

   // Dipanggil ModbusMaster setelah Serial2.flush(): byte terakhir permintaan sudah keluar.
   void sesudahKirim() {
     digitalWrite(PIN_RS485_DE_RE, LOW);  // lepas tombol bicara: dengarkan jawaban
     while (Serial2.available() > 0) {
       Serial2.read();  // buang sampah yang mungkin terbaca selama papan ini bicara
     }
   }

   const char* artiHasil(uint8_t kode) {
     switch (kode) {
       case ModbusMaster::ku8MBSuccess: return "berhasil";
       case ModbusMaster::ku8MBIllegalFunction: return "exception 01: fungsi tidak dikenal server";
       case ModbusMaster::ku8MBIllegalDataAddress: return "exception 02: loker yang diminta tidak ada";
       case ModbusMaster::ku8MBIllegalDataValue: return "exception 03: isi permintaan tidak sah";
       case ModbusMaster::ku8MBSlaveDeviceFailure: return "exception 04: server gagal";
       case ModbusMaster::ku8MBInvalidSlaveID: return "alamat server di jawaban salah";
       case ModbusMaster::ku8MBInvalidFunction: return "kode fungsi di jawaban salah";
       case ModbusMaster::ku8MBResponseTimedOut: return "tidak ada jawaban (timeout)";
       case ModbusMaster::ku8MBInvalidCRC: return "CRC jawaban salah";
       default: return "kode lain";
     }
   }

   // Membaca loker 0-2 dengan fungsi yang sedang dipilih, lalu mencetak hasilnya.
   void bacaSensor() {
     unsigned long mulai = millis();
     uint8_t hasil;
     if (kodeFungsi == 4) {
       hasil = sensor.readInputRegisters(0, 3);    // mulai loker 0, sebanyak 3
     } else {
       hasil = sensor.readHoldingRegisters(0, 3);  // mulai loker 0, sebanyak 3
     }
     unsigned long lama = millis() - mulai;
     if (hasil == ModbusMaster::ku8MBSuccess) {
       float kelembapan = sensor.getResponseBuffer(0) / 10.0;  // lembar data: x10
       float suhu = (int16_t)sensor.getResponseBuffer(1) / 10.0;  // x10 dan BERTANDA: suhu bisa di bawah nol
       uint16_t ec = sensor.getResponseBuffer(2);              // tanpa pengali
       Serial.printf("server %u, fungsi %02u: kelembapan %.1f %%, suhu %.1f C, EC %u uS/cm (%lu ms)\n", alamatServer,
                     kodeFungsi, kelembapan, suhu, ec, lama);
     } else {
       Serial.printf("server %u, fungsi %02u: GAGAL, kode 0x%02X = %s (%lu ms)\n", alamatServer, kodeFungsi, hasil,
                     artiHasil(hasil), lama);
     }
   }

   // Membaca satu loker saja dan mencetak isinya apa adanya.
   void bacaSatuLoker(uint16_t nomor) {
     uint8_t hasil;
     if (kodeFungsi == 4) {
       hasil = sensor.readInputRegisters(nomor, 1);
     } else {
       hasil = sensor.readHoldingRegisters(nomor, 1);
     }
     if (hasil == ModbusMaster::ku8MBSuccess) {
       Serial.printf("loker %u (fungsi %02u) berisi %u\n", nomor, kodeFungsi, sensor.getResponseBuffer(0));
     } else {
       Serial.printf("loker %u (fungsi %02u): GAGAL, kode 0x%02X = %s\n", nomor, kodeFungsi, hasil, artiHasil(hasil));
     }
   }

   void tulisLoker(uint16_t nomor, uint16_t nilai) {
     uint8_t hasil = sensor.writeSingleRegister(nomor, nilai);  // fungsi 06
     Serial.printf("tulis loker %u = %u ke server %u: %s\n", nomor, nilai, alamatServer, artiHasil(hasil));
   }

   void kerjakanPerintah() {
     unsigned int a = 0;
     unsigned int b = 0;
     if (sscanf(baris, "fungsi %u", &a) == 1 && (a == 3 || a == 4)) {
       kodeFungsi = a;
       Serial.printf("Mulai sekarang memakai fungsi %02u.\n", kodeFungsi);
     } else if (sscanf(baris, "server %u", &a) == 1 && a >= 1 && a <= 247) {
       alamatServer = a;
       sensor.begin(alamatServer, Serial2);  // ganti alamat yang ditanya
       Serial.printf("Mulai sekarang bertanya ke server %u.\n", alamatServer);
     } else if (sscanf(baris, "loker %u", &a) == 1 && a <= 65535) {
       bacaSatuLoker(a);
     } else if (sscanf(baris, "tulis %u %u", &a, &b) == 2 && a <= 65535 && b <= 65535) {
       tulisLoker(a, b);
     } else {
       Serial.println("Perintah: fungsi 3 | fungsi 4 | server 2 | loker 3 | tulis 3 2");
     }
   }

   void setup() {
     Serial.begin(115200);
     delay(1000);
     pinMode(PIN_RS485_DE_RE, OUTPUT);
     digitalWrite(PIN_RS485_DE_RE, LOW);  // mulai dengan mendengar
     Serial2.begin(9600, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);  // pin wajib ditulis (paket esp32 3.x)
     sensor.begin(alamatServer, Serial2);
     sensor.preTransmission(sebelumKirim);
     sensor.postTransmission(sesudahKirim);
     Serial.println();
     Serial.println("Membaca sensor tanah RS-485 setiap 5 detik.");
   }

   void loop() {
     if (millis() - waktuBacaTerakhir >= JEDA_BACA) {
       waktuBacaTerakhir = millis();
       bacaSensor();
     }
     while (Serial.available() > 0) {
       char huruf = Serial.read();
       if (huruf == '\n') {
         baris[panjangBaris] = '\0';
         panjangBaris = 0;
         kerjakanPerintah();
       } else if (huruf != '\r' && panjangBaris < 40) {
         baris[panjangBaris] = huruf;
         panjangBaris++;
       }
     }
   }
   ```

2. Pilih **DOIT ESP32 DEVKIT V1** dan port papan Node 1, klik **Upload**, lalu buka Serial Monitor-nya.

   Kalau **Compiler warnings** di **File → Preferences** diatur ke **More** atau **All** (Modul 8), Arduino IDE menulis dua peringatan dari dalam library ModbusMaster, yaitu `'uint16_t crc16_update(uint16_t, uint8_t)' defined but not used` dan `'read' is used uninitialized`. Keduanya ada di bagian library yang tidak dipakai sketsa ini, jadi aman diabaikan. Dengan pilihan bawaan Arduino IDE (**None**) atau **Default**, keduanya tidak muncul.

#### 4.2 Hasilnya

Setiap 5 detik, Serial Monitor Node 1 menulis (rekaman uji Wokwi):

```text
Membaca sensor tanah RS-485 setiap 5 detik.
server 1, fungsi 03: kelembapan 58.5 %, suhu 25.3 C, EC 1200 uS/cm (24 ms)
server 1, fungsi 03: kelembapan 58.5 %, suhu 25.3 C, EC 1200 uS/cm (24 ms)
```

Di papan asli, angka di dalam kurung sekitar **28 ms**, sedikit lebih besar karena sketsa papan kedua menunggu kabel diam lebih lama daripada chip Wokwi (angka ini diukur dengan menjalankan sketsa papan kedua di Wokwi; lihat "Tentang kotak Hasilnya" di 📚). Lampu biru papan kedua berkedip setiap 5 detik. Angka 24–28 ms itu cocok dengan hitungan Konsep 5.

#### 4.3 Bagian penting kodenya

- **`sensor.begin(alamatServer, Serial2);`** — library diberi tahu alamat server yang ditanya dan jalur serialnya. `Serial2` tetap harus kamu nyalakan sendiri, lengkap dengan pin 16 dan 17.
- **`sensor.preTransmission(sebelumKirim);`** dan **`sensor.postTransmission(sesudahKirim);`** — library tidak tahu pin DE/RE-mu, jadi kamu memberinya dua fungsi: "tekan tombol bicara" dan "lepas tombol bicara". Library memanggil `sebelumKirim()` tepat sebelum mengirim, lalu memanggil `Serial2.flush()` dan `sesudahKirim()` setelah byte terakhir keluar. `sesudahKirim()` juga membuang huruf sampah, seperti `kirimBaris()` di Praktik 1.
- **`sensor.readHoldingRegisters(0, 3)`** — fungsi 03, mulai loker 0, sebanyak 3. Jawabannya **kode hasil**, bukan isi loker. `ku8MBSuccess` (0) berarti berhasil; selain itu, `artiHasil()` menerjemahkannya. Isi loker baru diambil dengan **`sensor.getResponseBuffer(0)`**, `(1)`, dan `(2)`, dan **hanya** kalau kode hasilnya berhasil. Kalau gagal, rak jawaban (tempat library menaruh isi loker) masih berisi angka lama yang tidak boleh dipakai.
- **`(int16_t)sensor.getResponseBuffer(1) / 10.0`** — suhu wajib dibaca bertanda, lalu dibagi 10 (Konsep 6).

#### 4.4 Coba sendiri

Ketik perintah ini di Serial Monitor Node 1 satu per satu. Hasil di kolom kedua adalah rekaman uji Wokwi.

| Ketik | Hasilnya | Pelajarannya |
| :--- | :--- | :--- |
| `loker 3` | `loker 3 (fungsi 03) berisi 1` | alamat server tersimpan di loker 3 |
| `loker 5` | `loker 5 (fungsi 03): GAGAL, kode 0x02 = exception 02: loker yang diminta tidak ada` | *exception* datang cepat |
| `fungsi 4` | `Mulai sekarang memakai fungsi 04.`, lalu setiap 5 detik `server 1, fungsi 04: kelembapan 58.5 %, …` | lemari *input register* berisi bacaan yang sama |
| `loker 3` (masih fungsi 04) | `loker 3 (fungsi 04): GAGAL, kode 0x02 = exception 02: loker yang diminta tidak ada` | loker alamat hanya ada di lemari *holding register* |
| `fungsi 3` | `Mulai sekarang memakai fungsi 03.` | kembali ke fungsi 03 |
| `tulis 0 999` | `tulis loker 0 = 999 ke server 1: berhasil`, tetapi bacaan berikutnya tetap `kelembapan 58.5 %` | loker 0 hanya-baca; papan kedua (Wokwi: tab **CHIPS CONSOLE**) menulis `Ada yang menulis loker 0: diabaikan, loker 0-2 hanya-baca.` |

Lalu ubah bacaan sensornya. **Papan asli:** ketik `suhu -5.0` di Serial Monitor **papan kedua**. **Wokwi:** klik chip, lalu geser **Suhu tanah (°C)** ke −5. Bacaan Node 1 berikutnya: `suhu -5.0 C`. Sekarang buktikan pentingnya `(int16_t)`: hapus `(int16_t)` dari baris suhu di `bacaSensor()`, lalu unggah lagi (Wokwi: hentikan simulasi, klik **▶** lagi, klik chip, lalu geser lagi **Suhu tanah (°C)** ke −5). Bacaannya menjadi `suhu 6548.6 C` karena `FF CE` dibaca sebagai 65.486 lalu dibagi 10. Kembalikan `(int16_t)`, unggah lagi, lalu kembalikan suhunya ke 25,3 °C (`suhu 25.3` di papan kedua, atau tekan **EN** di papan kedua).

#### 4.5 Lambatnya sebuah *timeout*

1. Ketik `tulis 3 2`: alamat sensor menjadi 2. Hasilnya `tulis loker 3 = 2 ke server 1: berhasil`.
2. Tunggu bacaan berikutnya. **Hasilnya** (rekaman uji Wokwi):

   ```text
   server 1, fungsi 03: GAGAL, kode 0xE2 = tidak ada jawaban (timeout) (2009 ms)
   ```

   Node 1 masih bertanya ke server 1, yang kini tidak ada. Library menunggu **2 detik** penuh sebelum menyerah. Selama dua detik itu, `loop()` sketsa ini **berhenti**: tidak ada perintah Serial yang dikerjakan.

3. Ketik `server 2`. Bacaan berikutnya kembali berhasil: `server 2, fungsi 03: kelembapan 58.5 %, suhu 25.3 C, EC 1200 uS/cm (24 ms)`.
4. Kembalikan semuanya: ketik `tulis 3 1`, lalu `server 1`.

**Papan asli:** coba juga lepas kabel **A** sebentar. Matikan MB102 dulu, cabut kedua USB, lepas kabel A di salah satu modul, lalu colokkan lagi kedua USB dan nyalakan MB102 (aturan keselamatan dan aturan emas catu daya). Hasilnya sama: `GAGAL, kode 0xE2` setelah sekitar 2.000 ms. Untuk memasang lagi kabelnya, ulangi urutan yang sama: matikan MB102, cabut kedua USB, pasang kabel A, colokkan kedua USB, lalu nyalakan MB102. Bacaannya kembali.

Bandingkan dua angka ini: tanya jawab yang berhasil sekitar **28 ms**, sedangkan *timeout* **2.009 ms**, tujuh puluh kali lebih lama. Batas 2 detik itu tertanam di dalam library ModbusMaster dan tidak bisa diubah dari sketsa. Node 1 v1.4.0 di Praktik 5 dirancang supaya *timeout* seperti ini tidak membuat Node 1 tersendat terus-menerus.

> ⬆️ **Selesai Praktik 2–4?** Kembali ke [Konsep 7](#7-membaca-lembar-data-sensor-rs-485).

### Praktik 5 — Node 1 v1.4.0: sensor RS-485 masuk telemetry (50 menit)

> 🖥️ **Alat:** **Arduino IDE** dengan `node-1-rumah.ino` dari repositori `rumah-pintar-mini`, papan Node 1 (USB ke laptop, MB102 menyala), papan kedua yang menjalankan `modul15_sensor_tiruan`, browser untuk membuka file kurikulum di GitHub, **MQTTX**, dan terminal untuk pemeriksa kontrak. Konsep yang dipakai: 6–7.
>
> ⭐ **Wajib** — syarat lulus Modul 15 meminta bacaan Modbus tampil di dashboard, dan jalannya lewat `telemetry` Node 1.
>
> 🖥️ **Jalur Wokwi:** kerjakan semua perubahan di proyek Wokwi Node 1-mu (Modul 11–14), dengan `PAKAI_WOKWI` tetap `true`; perubahan `node-1-rumah.ino` (langkah 5.6) dikerjakan di tab `sketch.ino`. Tambahkan juga chip tiruan dan library ModbusMaster seperti langkah 5.8W **sebelum** mengeklik **▶**: langkah 5.8W menggantikan 5.7 langkah 1 (unggah lewat Arduino IDE), sedangkan 5.7 langkah 2–3 tetap berlaku. Di langkah 5.10, pakai broker publik seperti Modul 14: `node pemeriksa-kontrak.js broker.emqx.io` diikuti `device_id` Node 1 simulasimu, dan sambungan **Broker publik** di MQTTX. Semua kotak **Hasilnya** di praktik ini adalah rekaman uji Wokwi.

Dari Praktik 4, kamu tahu dua hal: tanya jawab yang berhasil hanya sekitar 28 ms, tetapi *timeout* membuat `loop()` diam **2 detik**. Firmware Node 1 tidak boleh sering diam selama itu karena tombol, layar, MQTT, dan jembatan Node 2 semuanya berjalan di `loop()` yang sama (Modul 8). Karena itu, Node 1 v1.4.0 dirancang begini:

- Sensor RS-485 dibaca **setiap 10 detik**, sama dengan jadwal `telemetry`, bukan setiap 2 detik seperti sensor lain.
- Kalau sensor **tiga kali berturut-turut** tidak menjawab, Node 1 hanya mencoba **setiap 60 detik**, sampai sensornya menjawab lagi. Jawaban yang rusak di jalan (CRC, alamat, atau kode fungsi di jawaban salah) dicoba ulang sekali setelah kabel diam sebentar. Penyebabnya kadang satu "byte hantu" yang terbaca saat kabel berganti arah; bagian lipat 🚨 "Sesekali `CRC jawaban salah` …" dan 🔬 "Terminator, bias, dan byte hantu" menjelaskannya.
- Ada **sakelar**: perintah Serial `rs485 on` dan `rs485 off`, yang disimpan di NVS seperti `ambang` di Modul 8. Bawaannya **mati** karena Node 1 yang belum punya sensor RS-485 tidak perlu bertanya ke kabel kosong.
- Kalau sakelarnya hidup, `telemetry` mendapat tiga kolom baru menurut **kontrak data 1.2**: `tanah_rs485`, `suhu_tanah`, dan `ec`. Kalau pembacaan terakhir gagal, ketiganya `null`. Kalau sakelarnya mati, ketiganya tidak ditulis sama sekali.

Node 1 v1.4.0 = v1.3.0 + **dua file baru** + **perubahan kecil di enam file**:

| File | Perubahan | Cara |
| :--- | :--- | :--- |
| `rs485.h` / `.cpp` | **baru**: membaca sensor RS-485, sakelar `rs485 on`/`off`, kolom `telemetry` | salin dari kurikulum (langkah 5.1) |
| `konfigurasi.h` | versi `1.4.0`, LED status pindah ke D2, pin dan jadwal RS-485 | ketik (langkah 5.2) |
| `pengaturan.h` / `.cpp` | sakelar `rs485` di NVS | ketik (langkah 5.3) |
| `perintah.cpp` | perintah `rs485`, `rs485 on`, `rs485 off` | ketik (langkah 5.4) |
| `jaringan.cpp` | tiga kolom baru di `telemetry`, wadah JSON diperbesar | ketik (langkah 5.5) |
| `node-1-rumah.ino` | memanggil `siapkanRS485()` dan `perbaruiRS485()` | ketik (langkah 5.6) |

#### 5.1 Dua file baru

1. Di Arduino IDE, buka **File → Open…** → **Documents → GitHub → rumah-pintar-mini → firmware → node-1-rumah** → `node-1-rumah.ino`.
2. Buat dua tab baru (**⋯ → New Tab**, ketik namanya lengkap dengan akhirannya, lalu klik **OK**; di Wokwi: **▾ → New file...**): **`rs485.h`** dan **`rs485.cpp`**.
3. Isi keduanya seperti di Modul 14: buka file di bawah ini di tab baru browser, klik ikon **Copy raw file**, kembali ke Arduino IDE, lalu tempel (**Ctrl + V**).
   - [`kode/node-1-rumah/rs485.h`](kode/node-1-rumah/rs485.h)
   - [`kode/node-1-rumah/rs485.cpp`](kode/node-1-rumah/rs485.cpp)
4. Baca `rs485.cpp` sebentar. `sebelumKirim()` dan `sesudahKirim()` sama dengan Praktik 4. `bacaLoker()` bertanya "fungsi 03, loker 0–2" (konstanta `LOKER_AWAL` dan `JUMLAH_LOKER` di bagian atas file). Kalau jawabannya rusak di jalan, ia menunggu kabel diam sebentar (20 ms pada 9600 baud), lalu bertanya sekali lagi. `perbaruiRS485()` mengatur jadwal 10 detik dan 60 detik, menyimpan hasil, dan mencatat galat. `tulisKolomRS485()` menulis tiga kolom `telemetry`. Peta lokernya (loker 0 dibagi 10, loker 1 dibagi 10 dan bertanda, loker 2 apa adanya) mengikuti lembar data sensor tiruan; untuk sensor sungguhan, bagian inilah yang disesuaikan (🧩 Tingkat 3).

#### 5.2 `konfigurasi.h`

1. Ubah nomor versinya:

   ```cpp
   const char VERSI_FIRMWARE[] = "1.3.0";
   ```

   menjadi:

   ```cpp
   const char VERSI_FIRMWARE[] = "1.4.0";
   ```

2. Pindahkan LED status ke D2 (sudah kamu pindahkan di breadboard pada Kemenangan Cepat). Ubah:

   ```cpp
   const int PIN_LED_STATUS = 4;    // Modul 2
   ```

   menjadi:

   ```cpp
   const int PIN_LED_STATUS = 2;    // Modul 2; pindah dari D4 ke D2 di Modul 15 (D4 kini untuk DE/RE RS-485)
   ```

3. Ganti dua baris komentar "dipesan" ini:

   ```cpp
   // Dipesan untuk modul berikutnya (jangan dipakai untuk hal lain):
   // Modul 15: RS-485 RX = 16, TX = 17, DE/RE = 2
   ```

   dengan tiga baris pin:

   ```cpp
   const int PIN_RS485_RX = 16;     // Modul 15, RX2 <- RO modul MAX485 lewat pembagi tegangan 4,7 kΩ + 10 kΩ
   const int PIN_RS485_TX = 17;     // Modul 15, TX2 -> DI modul MAX485
   const int PIN_RS485_DE_RE = 4;   // Modul 15, D4 -> DE dan RE modul MAX485 yang disatukan
   ```

4. Di **paling bawah** file, setelah baris `CADANGAN_OFFLINE_NODE2`, tambahkan:

   ```cpp

   // ---------- Modul 15: sensor tanah RS-485 (Modbus RTU) ----------
   // Dipakai atau tidaknya diatur dengan perintah Serial "rs485 on" / "rs485 off" (disimpan di NVS).
   const unsigned long BAUD_RS485 = 9600;              // lembar data sensor: 9600 baud, 8N1
   const uint8_t ALAMAT_SENSOR_RS485 = 1;              // alamat server sensor (lembar data: bawaan 1)
   const unsigned long JEDA_BACA_RS485 = 10000;        // sensor dibaca setiap 10 detik
   const unsigned long JEDA_BACA_RS485_LAMBAT = 60000;  // setelah 3 kali tanpa jawaban: setiap 60 detik
   ```

#### 5.3 `pengaturan.h` dan `pengaturan.cpp`

1. Di **`pengaturan.h`**, di bawah baris `unsigned long jumlahNyala();`, tambahkan:

   ```cpp
   bool sensorRS485Dipakai();                // Modul 15: true setelah perintah "rs485 on"
   void simpanSensorRS485Dipakai(bool pakai);  // Modul 15: "rs485 on" / "rs485 off", disimpan di NVS
   ```

2. Di **`pengaturan.cpp`**, di bawah baris `static unsigned long nyalaKe = 0;`, tambahkan:

   ```cpp
   static bool pakaiRS485 = false;  // Modul 15: bawaannya tidak dipakai (sensor belum dipasang)
   ```

3. Masih di `pengaturan.cpp`, di fungsi `muatPengaturan()`, tepat di bawah baris `logInfo("Nyala ke-%lu. …`, tambahkan:

   ```cpp
     pakaiRS485 = arsip.getBool("rs485", false);  // label belum pernah ditulis = tidak dipakai
   ```

4. Di **paling bawah** `pengaturan.cpp`, setelah fungsi `jumlahNyala()`, tambahkan:

   ```cpp

   bool sensorRS485Dipakai() {
     return pakaiRS485;
   }

   void simpanSensorRS485Dipakai(bool pakai) {
     if (pakai == pakaiRS485 && arsip.isKey("rs485")) {
       return;  // sudah sama: tidak perlu menulis ulang (jumlah tulis flash terbatas)
     }
     arsip.putBool("rs485", pakai);
     pakaiRS485 = pakai;
     logInfo("Sensor RS-485 %s (disimpan ke NVS)", pakai ? "dipakai" : "tidak dipakai");
   }
   ```

   Pola ini sama dengan `simpanAmbangTanahSiram()` dari Modul 8: label `rs485` di map `node1`, dan NVS hanya ditulis kalau isinya berubah.

#### 5.4 `perintah.cpp`

1. Di bawah baris `#include "jembatan.h"`, tambahkan:

   ```cpp
   #include "rs485.h"
   ```

2. Cari baris `} else if (perintah == "kirim") {`, lalu sisipkan **di atasnya**:

   ```cpp
     } else if (perintah == "rs485") {
       cetakInfoRS485();  // Modul 15: sensor tanah RS-485
       return;
     } else if (perintah == "rs485 on") {
       pakaiRS485(true);  // Modul 15: mulai membaca sensor setiap 10 detik
       cetakInfoRS485();
       return;
     } else if (perintah == "rs485 off") {
       pakaiRS485(false);  // Modul 15: berhenti membaca; kolomnya hilang dari telemetry
       cetakInfoRS485();
       return;
   ```

3. Di daftar perintah paling bawah, ubah baris:

   ```cpp
       Serial.println("kirim, node2, node2 nol, restart");
   ```

   menjadi:

   ```cpp
       Serial.println("kirim, node2, node2 nol, rs485, rs485 on, rs485 off, restart");
   ```

#### 5.5 `jaringan.cpp`

1. Di bawah baris `#include "layar.h"`, tambahkan:

   ```cpp
   #include "rs485.h"
   ```

2. Di fungsi `terbitkanTelemetry()`, cari baris `char isi[192];`, lalu ganti satu baris itu dengan dua baris ini:

   ```cpp
     tulisKolomRS485(dokumen);  // Modul 15: tanah_rs485, suhu_tanah, ec (hanya kalau sensor RS-485 dipakai)
     char isi[256];  // Modul 15: diperbesar dari 192 untuk tiga kolom RS-485
   ```

   `telemetry` dengan tiga kolom baru panjangnya sekitar 170 huruf, terlalu mepet untuk wadah 192 byte.

#### 5.6 `node-1-rumah.ino`

1. Ganti baris pertama:

   ```cpp
   // Node 1 "Rumah" - firmware v1.3.0 (Modul 14: jembatan ESP-NOW untuk Node 2 "Kebun")
   ```

   dengan:

   ```cpp
   // Node 1 "Rumah" - firmware v1.4.0 (Modul 15: sensor tanah RS-485 lewat Modbus RTU)
   ```

   Lalu, di atas baris `// Baru di v1.3.0: …`, sisipkan tiga baris ini:

   ```cpp
   // Baru di v1.4.0: Node 1 menjadi klien Modbus RTU. Setiap 10 detik ia membaca tiga loker sensor tanah RS-485
   // (lewat modul MAX485 di Serial2) dan menambahkan tanah_rs485, suhu_tanah, dan ec ke telemetry (kontrak data 1.2).
   // Sensornya dipakai setelah perintah "rs485 on". LED status pindah ke D2 karena D4 kini menjadi pin DE/RE.
   ```

2. Di daftar perintah, ganti baris:

   ```cpp
   // ambang, ambang 35, ambang bawaan, log debug, log info, log error, wifi, wifi lupa, kirim, node2, node2 nol, restart.
   ```

   dengan dua baris:

   ```cpp
   // ambang, ambang 35, ambang bawaan, log debug, log info, log error, wifi, wifi lupa, kirim, node2, node2 nol,
   // rs485, rs485 on, rs485 off, restart.
   ```

3. Di daftar library, ganti `WiFiManager versi 2.0.17, ArduinoJson versi 7.4.3, dan PubSubClient3 versi 3.3.2.` dengan `WiFiManager versi 2.0.17, ArduinoJson versi 7.4.3, PubSubClient3 versi 3.3.2, dan ModbusMaster versi 2.0.1.`.
4. Di bawah baris `#include "jembatan.h"  // Modul 14: Node 2 lewat ESP-NOW`, tambahkan:

   ```cpp
   #include "rs485.h"     // Modul 15: sensor tanah RS-485
   ```

5. Di `setup()`, di bawah baris `siapkanJembatan();  // Modul 14: sesudah WiFi menyala`, tambahkan:

   ```cpp
     siapkanRS485();     // Modul 15
   ```

6. Di `loop()`, di bawah baris `jalankanSiklus();`, tambahkan:

   ```cpp
     perbaruiRS485();      // Modul 15: sensor RS-485 setiap 10 detik; menunggu sampai 2 detik kalau sensor diam
   ```

#### 5.7 Unggah

1. Pastikan papan yang terpilih adalah **ESP32 Dev Module**, dengan **Partition Scheme** **Minimal SPIFFS** dan **Flash Mode** **DIO** (setelan Node 1 sejak Modul 10), dan port papan **Node 1**. Klik **Upload**. Arduino IDE menulis kira-kira `Sketch uses 1186768 bytes (60%) of program storage space. Maximum is 1966080 bytes.`
2. Buka Serial Monitor Node 1. Di antara baris-baris awalnya ada (contoh):

   ```text
   [00:00:02] INFO  Node 1 Rumah - firmware 1.4.0
   …
   [00:00:03] INFO  Sensor RS-485 tidak dipakai. Sudah terpasang? Ketik: rs485 on
   ```

   Gagal kompilasi dengan `ModbusMaster.h: No such file or directory`? Pasang library-nya (🧰). Gagal dengan `'tulisKolomRS485' was not declared in this scope`? Baris `#include "rs485.h"` di `jaringan.cpp` (langkah 5.5) terlewat. Pesan serupa untuk `cetakInfoRS485` atau `pakaiRS485` berarti baris itu terlewat di `perintah.cpp` (langkah 5.4), dan untuk `siapkanRS485` atau `perbaruiRS485`, di `node-1-rumah.ino` (langkah 5.6).

3. Lampu status kini berkedip di **D2**, dan lampu biru bawaan papan ikut berkedip bersamanya. Kalau lampu merah di breadboard tidak berkedip, periksa langkah 2 Kemenangan Cepat.

#### 5.8W Jalur Wokwi: tambahkan chip ke proyek Node 1

1. Di proyek Wokwi Node 1-mu, buat file **`sensor-tanah.chip.json`** dan **`sensor-tanah.chip.c`** lewat **▾ → New file...**, dengan isi yang sama dengan langkah 3.1W.
2. Di tab **`diagram.json`**, ganti seluruh isinya dengan isi [`kode/node-1-rumah/diagram.json`](kode/node-1-rumah/diagram.json). Isinya rangkaian Node 1 Modul 14 dengan LED status di D2 dan chip sensor tanah di RX2, TX2, dan D4. Sebelum mengganti, salin dulu baris `"macAddress": …` dari tab `diagram.json` proyekmu (alamat MAC pilihanmu sendiri sejak Modul 11), lalu tempelkan ke `catatan-modul15.md` supaya tidak hilang saat kamu mengeklik **Copy raw file** (langkah 5.11 memakainya lagi). Isi baru ini memakai `24:0a:c4:00:01:10` bawaan, jadi kembalikan baris milikmu sesudah menempel. Tanpa itu, `device_id` Node 1 simulasimu berubah, bisa kembar dengan milik orang lain di broker publik, dan tidak cocok lagi dengan topik di Node-RED-mu.
3. Di tab **`libraries.txt`**, ganti seluruh isinya dengan isi [`kode/node-1-rumah/libraries.txt`](kode/node-1-rumah/libraries.txt) (sama dengan Modul 14, ditambah `ModbusMaster@2.0.1`).
4. Klik **▶**.

#### 5.9 Nyalakan sakelarnya

Ketik di kotak kirim Serial Monitor Node 1:

```text
rs485
```

Jawabannya `rs485: tidak dipakai, jadi kolomnya tidak ikut telemetry. Sensor sudah terpasang? Ketik: rs485 on`. Sekarang ketik:

```text
rs485 on
```

**Hasilnya** (rekaman uji Wokwi):

```text
[00:00:25] INFO  Sensor RS-485 dipakai (disimpan ke NVS)
rs485: dipakai, server 1, 9600 baud 8N1, dibaca setiap 10 detik
rs485: belum pernah membaca
rs485: berhasil 0, timeout 0, galat lain 0
[00:00:25] INFO  RS-485: tanah_rs485=58.5 %  suhu_tanah=25.3 C  ec=1200 uS/cm  (24 ms)
…
[00:00:35] INFO  RS-485: tanah_rs485=58.5 %  suhu_tanah=25.3 C  ec=1200 uS/cm  (24 ms)
```

Di papan asli, angka di dalam kurung sekitar 28 ms. Karena sakelarnya tersimpan di NVS, Node 1 tetap membaca sensor RS-485 setelah *restart* atau listrik padam, sampai kamu mengetik `rs485 off`. Di Wokwi lain ceritanya: NVS kosong lagi setiap kali simulasi dihentikan lalu dijalankan ulang (Modul 8), jadi ketik lagi `rs485 on` setiap memulai simulasi baru. Untuk meniru listrik padam di Wokwi, ketik `restart`.

#### 5.10 Periksa `telemetry` dan kontrak data 1.2

1. **Perbarui pemeriksa kontrak ke versi 1.2.** Sejak kontrak 1.2, kolom `suhu_tanah` bisa datang dari Node 1, padahal pemeriksa versi 1.1 menganggap `suhu_tanah` sebagai tanda `telemetry` Node 2. Buka [`proyek-rumah-pintar-mini/alat/pemeriksa-kontrak.js`](../../proyek-rumah-pintar-mini/alat/pemeriksa-kontrak.js) di GitHub, klik **Copy raw file**, lalu di VS Code ganti seluruh isi `alat/pemeriksa-kontrak.js` di repositori `rumah-pintar-mini`-mu dengan isi yang baru disalin, lalu simpan.
2. Jalankan pemeriksanya **di laptop** (folder `alat`), seperti Modul 13–14 (jalur Wokwi: ganti alamatnya dengan `broker.emqx.io`, lalu tambahkan `device_id` Node 1 simulasimu):

   ```bash
   node pemeriksa-kontrak.js 192.168.1.37
   ```

   **Hasilnya** (rekaman uji di broker lab): setiap 10 detik muncul `rpm/a4cf12e5b7c0/telemetry  LULUS`. Pemeriksa versi 1.2 juga memastikan ketiga kolom RS-485 selalu datang bersama.

3. Di **MQTTX**, berlangganan `rpm/a4cf12e5b7c0/telemetry` (ganti `a4cf12e5b7c0` dengan `device_id` Node 1-mu). **Hasilnya** (rekaman uji Wokwi; isi kolom sensor rumahmu pasti berbeda):

   ```json
   {"ts":"2026-10-18T22:04:05Z","fw":"1.4.0","suhu":28.5,"kelembapan":71,"cahaya":3094,"tanah":70,"gerak":false,"level_air":52,"tanah_rs485":58.5,"suhu_tanah":25.3,"ec":1200}
   ```

#### 5.11 Uji sensor mati

Sekarang buktikan bahwa sensor yang mati tidak membuat Node 1 tersendat terus.

1. Cabut USB **papan kedua**. Sensor tiruan dan modul MAX485-nya padam, seperti sensor sungguhan yang listriknya putus. **Wokwi:** sambungan tidak bisa dicabut selagi simulasi berjalan. Hentikan simulasi, klik chip sensor tanah di rangkaian, tekan **Delete**, lalu klik **▶** dan ketik lagi `rs485 on` (NVS Wokwi selalu kosong di simulasi baru).
2. Tunggu sekitar 40 detik (di Wokwi bisa sampai sekitar 2 menit karena simulasinya berjalan lebih lambat daripada waktu sungguhan). **Hasilnya** (rekaman uji Wokwi, dengan chip dilepas dari rangkaian; jam di depan baris tentu berbeda):

   ```text
   [00:00:33] ERROR RS-485 gagal: tidak ada jawaban (timeout) (kode 0xE2, 2010 ms)
   …
   [00:00:45] ERROR RS-485 gagal: tidak ada jawaban (timeout) (kode 0xE2, 2010 ms)
   …
   [00:00:57] ERROR RS-485 gagal: tidak ada jawaban (timeout) (kode 0xE2, 2010 ms)
   [00:00:57] ERROR Sensor RS-485 tidak menjawab 3 kali berturut-turut: mulai sekarang dicoba setiap 60 detik.
   ```

   Jarak antarbaris 12 detik, bukan 10: jadwal 10 detik dihitung dari **akhir** pembacaan sebelumnya, dan setiap pembacaan yang gagal memakan 2 detik. Ketik `rs485`, dan jawabannya kini `rs485: dipakai, server 1, 9600 baud 8N1, dibaca setiap 60 detik`, `rs485: bacaan terakhir GAGAL: tidak ada jawaban (timeout) (kode 0xE2, 1 detik lalu)`, dan `rs485: berhasil 0, timeout 3, galat lain 0` (di papan asli, angka `berhasil` lebih besar karena sensornya sempat terbaca; di Wokwi tetap 0 seperti rekaman).

   `telemetry` kini membawa `"tanah_rs485":null,"suhu_tanah":null,"ec":null`, dan pemeriksa kontrak tetap menulis `LULUS`: bacaan gagal memang harus ditulis `null` (kontrak data, aturan 7).

3. Ketik `info`. Baris `putaran loop() terlama` kini sekitar **2.000 ms** atau sedikit lebih: itulah *timeout* ModbusMaster. (Di Wokwi, angka ini sudah sekitar 2.000 ms sejak awal karena menyambung ke broker publik juga memakan waktu sekitar 2 detik; rekaman uji menulis 2.297 ms.) Masih jauh di bawah batas *watchdog* 5 detik, dan setelah tiga kali gagal, kejadian seperti itu hanya terulang setiap 60 detik.
4. Colokkan lagi USB papan kedua. Dalam satu menit, Serial Monitor Node 1 kembali menulis `RS-485: tanah_rs485=58.5 % …`, dan jadwalnya pulih menjadi setiap 10 detik. **Wokwi:** hentikan simulasi, tempel lagi `diagram.json` dari langkah 5.8W (dengan `macAddress`-mu), klik **▶**, lalu ketik `rs485 on`.

> ➡️ **Lanjut** ke [Praktik 6 — Grup Sensor RS-485 di Node-RED](#praktik-6--grup-sensor-rs-485-di-node-red-dan-uji-kabel-5-m-45-menit) tanpa kembali ke konsep.

### Praktik 6 — Grup Sensor RS-485 di Node-RED dan uji kabel 5 m (45 menit)

> 🖥️ **Alat:** browser laptop dengan editor Node-RED (Modul 13), HP yang tersambung ke WiFi rumah, Node 1 v1.4.0 dengan `rs485 on`, papan kedua yang menjalankan sensor tiruan, kabel UTP 5 m, tang kupas kabel, obeng kecil, dan *charger* Node 1. Konsep yang dipakai: 6–7.
>
> ⭐ **Wajib** — syarat lulus Modul 15 meminta nilai Modbus tampil di dashboard dan terbaca lewat kabel RS-485 paling sedikit 5 m.
>
> 🖥️ **Jalur laptop dan jalur Wokwi:** caranya sama, di Node-RED laptopmu (Praktik 8 Modul 13). Di langkah 6.2, pilih **Server** yang sama dengan node `telemetry Node 1`-mu, dan isi topiknya dengan `device_id` Node 1-mu (jalur Wokwi: `device_id` papan simulasi). Langkah 6.4 dan 6.5 (kabel 5 m) hanya untuk papan asli; di Wokwi, klik chip, geser **Kelembapan tanah (%)** atau **Suhu tanah (°C)**, lalu lihat angkanya berubah di HP.

Grup baru ini berisi sembilan node ditambah satu node pengaturan (grupnya sendiri), jadi, seperti di Modul 14, kamu **mengimpornya** dari kurikulum.

#### 6.1 Impor potongan flow Sensor RS-485

1. Buka [`kode/node-red-sensor-rs485.json`](kode/node-red-sensor-rs485.json) di GitHub, lalu klik ikon **Copy raw file**.
2. Di editor Node-RED, buka tab **Rumah Pintar Mini**, lalu gulir ruang kerja ke bawah sampai ada ruang kosong di bawah bagian 5 (Kebun).
3. Buka menu utama (ikon bergaris tiga di kanan atas) → **Import**, atau tekan **Ctrl + I**. Tempel (**Ctrl + V**) ke kotak teks jendela `Import nodes`, lalu klik **Import**.
4. Gerakkan mouse ke ruang kosong tadi, lalu klik sekali untuk meletakkan node-node yang menempel di penunjuk mouse.

Seperti Modul 14, beberapa node bersegitiga merah: pengaturan broker dan halaman dashboard-nya belum tersambung ke milikmu.

#### 6.2 Sambungkan ke broker dan ke `device_id` Node 1-mu

1. Klik dua kali node **telemetry Node 1 (RS-485)**. Di daftar **Server** yang kosong, pilih **Mosquitto di gateway** (pengaturan broker dari Modul 13). Jangan klik tombol **+** di sebelahnya.
2. Di isian **Topic**, ganti `a4cf12e5b7c0` dengan `device_id` Node 1-mu, lalu klik **Done**.
3. Klik dua kali widget mana saja di bagian 6, misalnya teks **Keadaan sensor**. Klik ikon pensil di sebelah baris **Group**, pilih **Rumah [/dashboard/rumah]** di daftar **Page**, lalu klik **Update** dan **Done**. Segitiga merah di keempat widget hilang bersamaan.
4. Klik **Deploy**.

Node `telemetry Node 1 (RS-485)` berlangganan topik yang sama dengan node `telemetry Node 1` di bagian 1. Itu tidak apa-apa: satu sambungan broker bisa dipakai banyak node, dan setiap pesan sampai ke keduanya.

#### 6.3 Lihat grup Sensor RS-485 di HP

Buka dashboard di HP (`http://192.168.1.37:1880/dashboard/rumah`), lalu gulir ke paling bawah. Grup **Sensor RS-485** muncul di bawah kartu **Kebun** dan terisi dalam 10 detik.

![Dua tangkapan layar dashboard Rumah, diambil di browser laptop selebar layar HP (412 piksel) dan masing-masing dibingkai sebagai HP, digulir ke paling bawah sehingga grup Sensor RS-485 tampak di bawah grafik Kebun. Kiri, sensor terbaca: Keadaan sensor terbaca, jarum Kelembapan tanah (RS-485) 58.5 persen, jarum Suhu tanah (RS-485) 25.3 derajat Celsius, dan EC (daya hantar listrik) 1200 µS/cm. Kanan, sensor tidak menjawab: Keadaan sensor tidak terbaca, kedua jarum tetap menunjuk 58.5 dan 25.3, dan EC hanya berisi tanda hubung. Tiga nomor dijelaskan di kanan: 1 Keadaan sensor, yaitu terbaca, tidak terbaca kalau kolomnya null (pembacaan terakhir gagal), atau tidak dipakai kalau kolomnya tidak ada (rs485 off); 2 dua jarum, kelembapan tanah dan suhu tanah RS-485, yang membeku di angka terakhir yang sah karena node switch menahan null; 3 EC, teks dari JSONata dalam µS/cm, berisi tanda hubung kalau null. Pesan: karena jarum bisa membeku, selalu baca baris Keadaan sensor lebih dulu. Data dari Node 1 tiruan di lab penulis.](aset/hp-sensor-rs485.png)

| Widget | Asal angkanya | Catatan |
| :--- | :--- | :--- |
| **Keadaan sensor** | ada tidaknya `tanah_rs485` di `telemetry` | `terbaca`; `tidak terbaca` kalau kolomnya `null` (pembacaan terakhir gagal); `tidak dipakai` kalau kolomnya tidak ada (`rs485 off`) |
| **Kelembapan tanah (RS-485)** | `tanah_rs485` | dijaga node **switch** `kelembapan RS-485 terbaca?` (aturan **is not null**) |
| **Suhu tanah (RS-485)** | `suhu_tanah` | dijaga node **switch** `suhu tanah RS-485 terbaca?` |
| **EC (daya hantar listrik)** | `ec` | teks dengan JSONata; `-` kalau `null` |

Mengapa ada widget **Keadaan sensor**? Karena node switch menahan pesan ber-`null`, jarum tetap menunjuk angka terakhir yang sah saat sensornya mati. Tanpa baris keadaan, jarum yang "membeku" itu tampak seperti bacaan yang masih segar. Langkah 6.5 memperlihatkannya.

#### 6.4 ⭐ Ganti kabel pendek dengan kabel UTP 5 m

Inilah uji yang sebenarnya: dua alat dengan **sumber listrik terpisah**, dihubungkan kabel RS-485 sepanjang 5 m.

1. Matikan MB102, lalu cabut USB dari kedua papan (aturan keselamatan).
2. Lepas kedua kabel betina–betina A–A dan B–B, juga kabel hitam GND bersama dari langkah 5 Kemenangan Cepat.
3. Siapkan kabel UTP: kupas selubung luarnya sekitar 3 cm di kedua ujung. Di dalamnya ada **empat pasang** kawat terpilin. Pilih **satu pasang** untuk A dan B, misalnya **biru** (A) dan **putih-biru** (B), lalu satu kawat dari pasangan lain untuk GND, misalnya **cokelat**. Kupas ujung ketiga kawat itu sekitar 7 mm. Kawatnya serabut? Pilin ujung setiap kawat sampai rapat supaya tidak ada helai yang mencuat ke terminal sebelahnya. Untuk kawat cokelat, pakai cara di 🧰 (lilitkan ke kaki kabel jumper jantan–jantan dan bungkus dengan selotip), lalu di langkah 4 dan 5 tancapkan ujung lain kabel jumper itu. Kawat lain potong pendek atau lipat ke belakang supaya tidak menyentuh apa pun.
4. **Sisi Node 1:** kendurkan sekrup terminal **A** modul MAX485, masukkan kawat biru, kencangkan. Ulangi untuk kawat putih-biru di terminal **B**. Tancapkan kawat cokelat ke **rel bawah (−) kolom 15** meja kerja Node 1.
5. **Sisi papan kedua:** masukkan kawat biru ke terminal **A** dan putih-biru ke terminal **B**, lalu tancapkan kawat cokelat ke **rel bawah (−) kolom 20** breadboard mini. Warna yang sama harus masuk huruf yang sama di kedua ujung. Kalau di Kemenangan Cepat A dan B memang harus kamu tukar, tukar juga di sini.
6. Tarik pelan setiap kawat di terminal sekrup: tidak boleh lepas.
7. Bentangkan kabelnya, atau letakkan kedua papan berjauhan sepanjang kabel. Gulungan rapi juga boleh: yang diuji adalah panjang kawatnya.
8. Colokkan USB papan kedua ke laptop. Colokkan USB papan Node 1 ke ***charger*-nya sendiri**, bukan ke laptop, lalu nyalakan MB102. Kini kedua papan punya sumber listrik yang berbeda, dan kawat cokelatlah yang menyatukan GND keduanya.
9. Tunggu sekitar satu menit (Node 1 menyambung ke WiFi dan broker). Grup **Sensor RS-485** di HP kembali `terbaca` dengan angka 58,5 %, 25,3 °C, dan 1.200 µS/cm. Lampu biru papan kedua pun berkedip setiap 10 detik.

Mau melihat statistiknya? Pemeriksa kontrak di laptop terus menulis `LULUS` untuk setiap `telemetry`. Untuk membaca hitungan berhasil dan *timeout*, pindahkan USB Node 1 sebentar dari *charger* ke laptop: matikan MB102, pindahkan colokan USB-nya, lalu nyalakan lagi MB102. Papan menyala ulang dan hitungannya mulai dari 0, jadi tunggu beberapa menit sebelum membuka Serial Monitor dan mengetik `rs485`. Selama itu kedua papan mendapat listrik dari laptop yang sama, jadi hitungan ini hanya menguji panjang kabelnya, bukan sumber listrik yang terpisah. Setelah itu, kembalikan USB Node 1 ke *charger*-nya dengan urutan yang sama.

#### 6.5 Uji sensor diam di dashboard

1. Cabut USB **papan kedua**. Dalam sekitar 20 detik, **Keadaan sensor** berubah menjadi `tidak terbaca`, **EC** menjadi `-`, tetapi kedua jarum tetap di angka terakhir.
2. Colokkan lagi USB papan kedua. Dalam sekitar satu menit (ingat jadwal 60 detik setelah tiga kali *timeout*, ditambah jadwal `telemetry` 10 detik), **Keadaan sensor** kembali `terbaca`.

Kalau langkah 6.4 dan 6.5 berhasil, bagian perangkat dari syarat lulus Modul 15 sudah terpenuhi: **Node 1 membaca loker Modbus dari ESP32 kedua lewat kabel 5 m, dan nilainya tampil di dashboard.** Catat di `catatan-modul15.md`: tanggal uji, panjang kabel, dan pasangan warna yang kamu pakai untuk A dan B.

> ⬆️ **Selesai Praktik 5–6?** Kembali ke [Konsep 8](#8-memilih-protokol-yang-tepat).

### Praktik 7 — Memilih protokol: tabel keputusan dan lima skenario (40 menit)

> 🖥️ **Alat:** `catatan-modul15.md`, tabel dan pohon keputusan di Konsep 8. Tidak butuh papan. Konsep yang dipakai: 8.
>
> ⭐ **Wajib** — syarat lulus Modul 15 meminta kamu memilih protokol yang tepat untuk lima skenario.

Untuk setiap skenario, kerjakan tiga hal di `catatan-modul15.md` **sebelum** membuka kuncinya:

1. Jawab dulu pertanyaan penentu Konsep 8 yang relevan (jarak, listrik, seberapa sering, ada sinyal dan siap membayar paket, jumlah node, perintah balik, kabel).
2. Tulis protokol pilihanmu.
3. Tulis **paling sedikit dua alasan**, masing-masing merujuk ke pertanyaan penentu.

Jawabanmu dianggap benar kalau protokolnya sama dengan kunci (atau salah satu dari dua jawaban yang sama-sama benar) **dan** paling sedikit dua alasanmu masuk akal. Menghafal kunci tidak ada gunanya: penalaranmulah yang dinilai.

#### Skenario 1 — Sawah 3 km dari rumah, tanpa listrik

Pak Darto di Klaten ingin memantau kelembapan tanah dan suhu di sawahnya, sekitar 3 km dari rumah. Di sawah tidak ada listrik PLN dan tidak ada WiFi. Data cukup dikirim setiap 15 menit dan ditampilkan di dashboard di rumah. Pak Darto tidak mau membayar langganan bulanan.

<details>
<summary>Kunci jawaban skenario 1</summary>

**LoRa**, di pita **920–923 MHz**: titik-ke-titik ke modul penerima di rumah, atau LoRaWAN dengan gateway sendiri di atap rumah.

- **Jarak kilometer.** WiFi dan ESP-NOW hanya sekitar 150–300 m di ruang terbuka; LoRa bisa sampai beberapa kilometer, apalagi kalau antena di rumah dipasang tinggi.
- **Tanpa listrik.** Radio LoRa tidur 0,2 µA dan hanya menyala sebentar, jadi cocok untuk baterai (ditambah panel surya kecil).
- **Data kecil dan jarang.** Satu pesan 12 byte setiap 15 menit memakai jauh di bawah batas 1 % waktu kirim.
- **Pengecoh:** NB-IoT tersingkir karena Pak Darto tidak mau membayar langganan bulanan; lagi pula, sinyal NB-IoT di sawah belum tentu ada. Modul 433 MHz memang sah, tetapi dayanya dibatasi jauh lebih kecil dan tidak cocok dengan jaringan LoRaWAN Indonesia.

</details>

#### Skenario 2 — Sensor suhu di kamar sebelah router

Rina ingin memantau suhu dan kelembapan kamar tidurnya. Router WiFi ada di ruang tengah, terhalang satu dinding dari kamar. Sensornya dicolokkan ke *charger* HP.

<details>
<summary>Kunci jawaban skenario 2</summary>

**WiFi**, seperti Node 1: ESP32 → WiFi → MQTT.

- **Dekat router.** Puluhan meter di dalam rumah masih terjangkau WiFi.
- **Ada listrik.** Borosnya radio WiFi tidak masalah kalau sensornya dicolokkan ke *charger*.
- **Tanpa perangkat tambahan.** Tidak perlu gateway atau langganan baru; datanya langsung ke broker di Pi.
- **Pengecoh:** ESP-NOW butuh ESP32 kedua sebagai jembatan (berlebihan); LoRa dan NB-IoT untuk jarak yang jauh lebih besar; BLE hanya kalau datanya cukup dilihat di HP saat berada di dekat sensor.

</details>

#### Skenario 3 — Sepuluh sensor tanah industri di *greenhouse* 200 m

Sebuah *greenhouse* melon di Lembang memasang sepuluh sensor tanah industri (kelembapan, suhu, EC) yang keluarannya **RS-485**, berjajar sepanjang 200 m. Di sana banyak pompa dan kipas listrik. Kabel boleh ditarik di sepanjang rak.

<details>
<summary>Kunci jawaban skenario 3</summary>

**RS-485 / Modbus RTU**: satu bus berbentuk rantai, alamat 1–10, misalnya 9600 8N1, terminator 120 Ω di kedua ujung.

- **Sensornya sudah berbicara Modbus RTU** lewat RS-485; tinggal disambung dan ditanya bergiliran.
- **Kabel boleh ditarik.** Panjang 200 m masih jauh di bawah batas sekitar 1 km untuk 9600 baud.
- **Banyak gangguan listrik.** Sinyal diferensial di kabel terpilin tahan gangguan dari motor pompa dan kipas (Konsep 1).
- **Sepuluh node** masih jauh di bawah 32 beban per bus, dan satu klien membaca semuanya bergiliran.
- **Pengecoh:** WiFi atau ESP-NOW berarti mengubah setiap sensor menjadi nirkabel dan memberinya listrik sendiri-sendiri; LoRa lambat dan dibatasi 1 % waktu kirim untuk sepuluh sensor yang sering dibaca.

</details>

#### Skenario 4 — Sensor pintu dengan baterai koin, rumah sudah punya *hub*

Keluarga Wijaya sudah punya *hub* rumah pintar yang mendukung Zigbee, Thread, dan Matter. Mereka ingin sensor pintu kecil dengan **baterai koin CR2032** yang tahan lama.

<details>
<summary>Kunci jawaban skenario 4</summary>

**Zigbee**, atau **Thread/Matter** kalau *hub*-nya juga berfungsi sebagai *border router* Thread. Keduanya benar.

- **Baterai koin kecil.** CR2032 hanya sekitar 235 mAh. Chip Zigbee/Thread menyedot sekitar 7 mA saat mengirim dan di bawah 1 µA saat siaga, jadi cocok.
- **ESP32 DevKit tidak cocok.** Arus tidur papannya sekitar 4,9 mA (Modul 14) sehingga baterai itu habis dalam sekitar dua hari (235 ÷ 4,9 ≈ 48 jam). Lagi pula, ESP32 klasik tidak punya radio 802.15.4.
- ***Hub* sudah ada.** Sensor tinggal dipasangkan ke *hub*, dan jaringan jalanya diperkuat lampu atau stopkontak pintar.
- **Pengecoh:** WiFi terlalu boros; ESP-NOW butuh ESP32 di kedua sisi dan arus tidur papannya besar; LoRa berlebihan untuk satu rumah.

</details>

#### Skenario 5 — Pelacak sapi di padang yang luas, ada sinyal seluler

Seorang peternak di Sumba melepas lima puluh ekor sapi di padang seluas puluhan kilometer persegi. Ia ingin posisi GPS setiap sapi terkirim setiap 30 menit. Di padang itu HP masih mendapat sinyal operator, dan ia siap membayar paket data bulanan untuk setiap pelacak.

<details>
<summary>Kunci jawaban skenario 5</summary>

**NB-IoT**. LTE-M sebenarnya paling tepat untuk benda yang bergerak, tetapi per Oktober 2026 belum tercatat tersedia di Indonesia.

- **Area puluhan kilometer dan sapinya berpindah-pindah.** Membangun gateway sendiri di mana-mana mahal, sedangkan jaringan operator sudah ada.
- **Data kecil dan jarang.** Posisi dan tegangan baterai hanya puluhan byte; modul NB-IoT tidur sekitar 0,8–3,2 µA di antara kiriman.
- **Syaratnya:** kartu SIM dan paket NB-IoT dari operator, dan cakupan NB-IoT di lokasi harus dicek dulu (bukan sekadar sinyal 4G di HP).
- **Pengecoh:** LoRaWAN juga mungkin kalau tidak ada sinyal NB-IoT (gateway di atas bukit), tetapi jaringannya harus dibangun dan dirawat sendiri; WiFi, ESP-NOW, dan BLE tidak menjangkau.

</details>

#### Latihan tambahan (tidak wajib)

**A. Pot cabai di ujung halaman.** Sensor kelembapan tanah bertenaga baterai 18650 di pot cabai, sekitar 40 m dari rumah. Sinyal WiFi di sana lemah, tetapi di dalam rumah ada ESP32 (Node 1) yang tersambung ke WiFi dan broker.

<details>
<summary>Kunci latihan A</summary>

**ESP-NOW**, persis pola Node 2 di Modul 14: bangun, kirim satu paket dalam milidetik ke Node 1, lalu tidur lagi. Tidak perlu router atau kata sandi WiFi di kebun, dan jarak 40 m masih jauh di bawah batas sekitar 150 m. WiFi biasa butuh 1–3 detik untuk menyambung setiap kali bangun sehingga boros; LoRa berlebihan karena butuh modul tambahan di kedua sisi.

</details>

**B. Lima kolam lele, 800 m dari rumah.** Kolam-kolamnya menyusuri pematang dan jalan desa. Di pondok kolam ada listrik PLN. Yang ingin dipantau: suhu air dan oksigen terlarut setiap 5 menit, ditambah menyalakan aerator dari rumah.

<details>
<summary>Kunci latihan B</summary>

**RS-485/Modbus RTU atau LoRa: keduanya benar**, dan alasannyalah yang dinilai. Pertanyaan penentunya: **bolehkah dan amankah menarik kabel 800 m?**

- **RS-485** benar kalau kabel boleh dan aman ditarik. Jarak 800 m masih di bawah sekitar 1 km pada 9600 baud, asalkan kabelnya pasangan terpilin khusus RS-485; kabel LAN Kategori 5 biasa hanya disarankan sampai sekitar 600 m (Konsep 1). RS-485 andal, tanpa urusan frekuensi, dan perintah aerator sampai seketika. Kekurangannya ada di biaya kabel: kabel UTP biasa saja sekitar Rp7.250 per meter, atau sekitar Rp5,8 juta untuk 800 m, dan kabel khusus RS-485 biasanya lebih mahal. Tambahkan juga pelindung petir untuk kabel di luar ruangan.
- **LoRa** benar kalau kabel sulit ditarik (melewati tanah orang atau jalan, rawan putus): dua modul 920–923 MHz dan antenanya jauh lebih murah, dan penerima di pondok bisa terus mendengar perintah aerator karena ada listrik PLN.

</details>

> ➡️ **Selesai Praktik 7?** Kerjakan [🧩 Tantangan mandiri](#-tantangan-mandiri) (minimal Tingkat 1), lalu [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini).

---

## 🚨 Kalau Tidak Jalan?

Banyak tutorial MAX485 dan Modbus di internet ditulis untuk Arduino Uno atau untuk paket esp32 2.x. Kalau sebuah tutorial memakai cara di kolom kiri, terjemahkan ke cara minggu ini:

| Tutorial lama | Cara sekarang (modul ini, paket esp32 3.3) |
| :--- | :--- |
| `Serial2.begin(9600);` tanpa pin | `Serial2.begin(9600, SERIAL_8N1, 16, 17);` — tanpa pin, paket 3.x memakai GPIO 4 dan 25 (di Node 1: DE/RE dan **pompa**) |
| `SoftwareSerial rs485(10, 11);` (Arduino Uno) | ESP32 punya UART perangkat keras: pakai `Serial2` |
| `node.begin(1, Serial);` (Uno hanya punya satu UART) | `sensor.begin(1, Serial2);`; `Serial` tetap untuk Serial Monitor |
| RO modul langsung ke pin RX | RO lewat pembagi 4,7 kΩ + 10 kΩ (Konsep 2) |
| modul MAX485 diberi 3,3 V | modul MAX485 diberi **5 V**; untuk 3,3 V, beli modul MAX3485 atau SP3485 |
| DE/RE di GPIO 2 | DE/RE di **D4**; D2 adalah pin *strapping* (bagian lipat "Unggahan gagal" di bawah) |
| `digitalWrite(DE, LOW)` langsung setelah `print()` | `flush()` dulu, baru DE/RE LOW (Praktik 1.4); library Modbus sudah melakukannya |
| alamat loker dari lembar data "40001" dipakai apa adanya | "40001" = loker **0** di kode (Konsep 6) |
| contoh `RTUserver` eModbus disalin mentah | contoh itu menolak loker 0 dan memakai RX 17, TX 16, 19200 baud: sesuaikan dulu (🔬) |

Bagian di bawah ini dilipat; klik judulnya untuk membuka.

<details>
<summary><b>Kemenangan Cepat: tidak ada kiriman sama sekali</b></summary>

Serial Monitor Node 1 hanya menulis `... 3 detik tanpa kiriman. Periksa kabel A, B, GND, dan listrik kedua modul.` Periksa satu per satu, dengan listrik dicabut setiap kali mengubah kabel:

1. **Lampu kecil di kedua modul menyala?** Kalau lampu modul Node 1 padam, MB102 belum menyala atau kabel VCC-nya tidak tertancap di rel atas (+). Kalau lampu modul papan kedua padam, periksa kabel VCC ke pin **VIN**, GND modul ke rel bawah (−) breadboard mini, dan kabel hitam Modul 14 dari pin **GND** deretan kanan papan ke rel bawah (−) kolom 28 (kabel inilah yang tidak boleh ikut tercabut di Kemenangan Cepat langkah 1).
2. **Papan kedua benar-benar mengirim?** Serial Monitor-nya harus menulis `terkirim: halo …` setiap detik. Kalau tidak, sketsanya belum terunggah ke papan yang benar.
3. **DI di jalur TX2, RO di jalur RX2 lewat pembagi?** Di Node 1: DI di 10e, RO di 9i, resistor 4,7 kΩ 9e–9g, dan 10 kΩ 9c–5c. Di papan kedua: DI ke pin **TX2**, dan titik tengah pembagi (kolom 18) ke pin **RX2**. RX dan TX yang tertukar adalah salah sambung yang paling sering.
4. **DE dan RE keduanya tersambung?** Kalau hanya DE yang tersambung, resistor di modul menarik RE ke HIGH dan penerimanya **selalu mati**. Di Node 1, DE di 8e dan RE di 8d; di papan kedua, keduanya di kolom 24 yang disambung ke **D4**.
5. **Tegangan pembagi.** Dengan multimeter (**V⎓ 20**), ukur antara jalur RX2 dan rel bawah (−) Node 1 saat papan kedua mengirim terus. Siapkan dulu titik ukurnya dengan listrik dicabut (matikan MB102 dulu, baru cabut kedua USB): tancapkan dua kabel cadangan ke **9d** (lubang kosong di jalur RX2) dan ke rel bawah (−). Colokkan lagi kedua USB, nyalakan MB102, lalu tempelkan *probe* merah ke kabel 9d dan *probe* hitam ke kabel rel. Angkanya harus sekitar 3,3–3,4 V. Lebih dari 3,6 V (biasanya sekitar 4 V karena dioda pelindung di dalam pin RX2 menahannya) berarti kabel RO tertancap di sisi yang salah (9a–9e): matikan MB102 dan cabut USB saat itu juga, lalu pindahkan kabel RO ke 9i. 0 V berarti resistor 4,7 kΩ tidak menyeberangi parit. Setelah selesai, matikan MB102, cabut kedua USB, lalu cabut kedua kabel cadangan.
6. **A ke A, B ke B?** Coba tukar sekali (Kemenangan Cepat langkah 7). Tidak merusak apa pun.

</details>

<details>
<summary><b>Baris aneh: <code>diterima, tetapi bukan teks yang utuh: …</code></b></summary>

Huruf tiba, tetapi isinya rusak. Penyebabnya, dari yang paling sering:

- **A dan B tertukar** (bitnya terbalik). Tukar di salah satu ujung.
- **Laju baud berbeda.** Kedua sketsa harus memakai `Serial2.begin(9600, …)`.
- **GND bersama terlepas** saat kedua papan memakai sumber listrik berbeda (Praktik 6). Periksa kawat GND di kedua rel (−).

Satu baris aneh **tepat setelah papan dinyalakan** itu wajar: Node 1 mulai mendengar di tengah huruf.

</details>

<details>
<summary><b>Unggahan gagal: <code>Wrong boot mode detected</code> atau <code>Failed to connect to ESP32</code></b></summary>

Pesan yang berisi `Wrong boot mode detected` berarti papan tidak masuk mode unggah. Penyebab yang khas minggu ini: **ada kabel DE/RE modul MAX485 di pin D2**. Modul MAX485 biru menarik DE dan RE ke 5 V lewat resistor 10 kΩ, padahal D2 harus LOW (atau mengambang) supaya papan bisa masuk mode unggah (dokumentasi esptool, "Boot Mode Selection").

- Pastikan DE/RE di **D4** (Node 1: 8e dan 8d; papan kedua: kolom 24 → D4), dan LED status di **D2** (7e).
- Untuk pesan `Failed to connect` biasa, pakai cara Modul 2: tahan **BOOT** begitu `Connecting…` muncul, lalu lepaskan saat `Writing at …` mulai berjalan.

</details>

<details>
<summary><b>Praktik 1: ping sampai, pong tidak</b></summary>

Papan kedua menulis `dengar "ping …" -> balas "pong …"`, tetapi Node 1 menulis `tidak ada balasan dalam 500 ms`. Pesan pergi lancar, jadi kabel A, B, dan GND sudah benar; yang bermasalah arah pulangnya:

1. **`Serial2.flush();` di `modul15_pong` masih menjadi komentar** (eksperimen Praktik 1.4 belum dikembalikan).
2. **Kabel DE/RE papan kedua (kolom 24 ke pin D4) goyah atau terlepas.** Tanpa kabel itu, resistor di modul menarik DE dan RE ke HIGH: pemancar papan kedua menyala terus dan penerimanya mati terus. Kalau kabel itu lepas sama sekali, gejalanya justru lain: papan kedua tidak mendengar ping sama sekali (Praktik 1.3) walaupun pesan `halo` di Kemenangan Cepat tetap muncul karena di sana DE/RE memang HIGH terus. Kalau kabelnya goyah, gejalanya bisa berganti-ganti. Periksa kabel di 24f, 24g, dan dari 24i ke pin **D4**.
3. **DI papan kedua tidak di TX2.**
4. **Pembagi RO Node 1** (9e–9g dan 9c–5c) belum terpasang benar: Node 1 bisa mengirim, tetapi tidak bisa mendengar.

</details>

<details>
<summary><b>Praktik 3–6: selalu <i>timeout</i> (<code>tidak ada jawaban</code>, kode <code>0xE2</code>)</b></summary>

*Timeout* berarti tidak ada jawaban yang sah sama sekali (Konsep 6). Periksa:

1. **Papan kedua menjalankan `modul15_sensor_tiruan`?** Serial Monitor-nya menulis `[n] menjawab permintaan client` setiap kali menjawab. Kalau baris itu tidak muncul, pertanyaannya tidak sampai atau alamatnya salah.
2. **Alamatnya cocok?** Ketik `info` di Serial Monitor papan kedua; alamatnya mungkin masih 2 dari Praktik 3.4 atau 4.5. Tekan **EN** di papan kedua untuk kembali ke alamat 1.
3. **Kabel dan baud:** periksa seperti di bagian lipat Kemenangan Cepat di atas. Kalau Kemenangan Cepat dan Praktik 1 dulu berhasil dan kabelnya belum diubah sejak itu, kabel bukan tersangka utama. **Baru memasang kabel UTP 5 m (Praktik 6.4)?** Justru kabel itulah tersangka pertama: warna yang sama harus masuk huruf yang sama di kedua ujung (misalnya biru di A, putih-biru di B), sekrup terminal harus menjepit tembaga kawat (bukan selubung plastiknya), dan kawat cokelat harus tertancap di rel bawah (−) kolom 15 Node 1 **dan** rel bawah (−) kolom 20 breadboard mini. Matikan listrik sebelum memperbaikinya.
4. **Wokwi:** buka tab **CHIPS CONSOLE**. Pesan `DE/RE ESP32 masih HIGH: penerimanya mati, jawaban ini akan hilang.` berarti `sesudahKirim()` tidak menurunkan D4. Pesan `Bingkai rusak atau CRC salah` berarti bingkai yang tiba tidak utuh.

</details>

<details>
<summary><b>Sesekali <code>CRC jawaban salah</code> (<code>0xE3</code>) atau <code>alamat di jawaban salah</code> (<code>0xE0</code>)</b></summary>

Kadang-kadang satu "byte hantu" muncul tepat saat kabel berganti arah: kedua modul membawa terminator 120 Ω, tetapi resistor bias di modul terlalu lemah untuk menahan kabel yang sedang diam pada keadaan "1" (🔬 menghitungnya). Node 1 v1.4.0 sudah mengulang pembacaan seperti ini sekali secara otomatis.

Kejadian ini terlalu sering kalau `galat lain` di perintah `rs485` terus bertambah, atau kalau angka di dalam kurung baris `RS-485:` sering sekitar 60–80 ms, bukan sekitar 28 ms (pembacaan pertamanya rusak, lalu diulang). Kalau begitu, pasang **dua resistor bias** di modul Node 1 saja, dengan listrik dicabut (matikan MB102 dulu, baru cabut USB): 470–560 Ω dari kaki **A** ke 5 V dan 470–560 Ω dari kaki **B** ke GND. Satu pasang untuk seluruh bus sudah cukup (spesifikasi Modbus meminta 450–650 Ω).

</details>

<details>
<summary><b>Suhu terbaca <code>6548.6 C</code>, atau angkanya sepuluh kali terlalu besar</b></summary>

- `6548.6` = −5,0 °C yang dibaca **tanpa tanda**. Pastikan ada `(int16_t)` sebelum `getResponseBuffer(1)` (Konsep 6).
- Yang muncul 585, bukan 58,5? Pembagian dengan 10 terlewat. Ingat: skala setiap sensor ditentukan lembar datanya (×10 atau ×100).

</details>

<details>
<summary><b><code>exception 02: loker yang diminta tidak ada</code></b></summary>

Nomor lokernya salah, atau jumlahnya melewati batas. Sensor tiruan hanya punya loker 0–3 (fungsi 03) dan 0–2 (fungsi 04). Untuk sensor sungguhan, periksa lagi lembar datanya: "40001" berarti loker 0 (Konsep 6), dan alamat heksadesimal seperti `0x0012` dipakai apa adanya.

</details>

<details>
<summary><b>Node 1 v1.4.0: kolom RS-485 tidak muncul di <code>telemetry</code></b></summary>

Ketik `rs485` di Serial Monitor Node 1. Kalau jawabannya `rs485: tidak dipakai …`, ketik `rs485 on`. Sakelarnya tersimpan di NVS, jadi papan yang pernah diberi `rs485 off` tetap mati sampai dinyalakan lagi. Kalau jawabannya `dipakai`, tetapi `telemetry` di MQTTX tetap tanpa kolom RS-485, periksa langkah 5.5: baris `tulisKolomRS485(dokumen);` harus berada **sebelum** `char isi[256];`.

</details>

<details>
<summary><b>Pemeriksa kontrak: <code>telemetry</code> Node 1 ditandai <code>GAGAL  (telemetry Node 2)</code></b></summary>

Di bawahnya tertulis `kolom "tekanan" tidak ada`, `kolom "cahaya" tidak ada di kontrak data`, dan seterusnya. Pemeriksa kontrakmu masih versi 1.1: versi itu menganggap setiap pesan yang berisi `suhu_tanah` sebagai `telemetry` Node 2, lalu memeriksanya dengan daftar kolom Node 2. Perbarui ke versi 1.2 (Praktik 5.10).

</details>

<details>
<summary><b>Dashboard: grup Sensor RS-485 kosong, atau tertulis <code>tidak dipakai</code></b></summary>

- **Kosong sama sekali:** isian **Topic** node `telemetry Node 1 (RS-485)` belum berisi `device_id` Node 1-mu, atau **Server**-nya belum dipilih (Praktik 6.2).
- **`tidak dipakai`:** Node 1 tidak menulis kolom RS-485. Ketik `rs485 on` di Serial Monitor Node 1.
- **`tidak terbaca`:** Node 1 menulis kolomnya, tetapi isinya `null` karena sensor tidak menjawab. Lihat bagian lipat *timeout* di atas.

</details>

<details>
<summary><b>Wokwi: chip tidak muncul, atau galat saat mengompilasi chip</b></summary>

- Nama kedua file harus persis **`sensor-tanah.chip.json`** dan **`sensor-tanah.chip.c`** karena `diagram.json` memakai jenis part `chip-sensor-tanah`.
- Isi file `.chip.c` harus utuh dari baris pertama sampai `chip_init`. Salin lagi dengan **Copy raw file**.
- Simulasi dengan chip butuh waktu kompilasi lebih lama. Tunggu sampai tombol **▶** berubah menjadi tombol berhenti.

</details>

<details>
<summary><b>Papan kedua sering gagal menjawab, padahal Node 1 baik-baik saja</b></summary>

Modul MAX485 papan kedua mendapat listrik dari pin VIN, sekitar 4,6–4,8 V (Kemenangan Cepat langkah 4). Biasanya itu cukup, tetapi kalau angkamu jauh di bawahnya (misalnya karena kabel USB yang panjang dan tipis), modulnya bisa bekerja setengah hati. Coba kabel USB yang lebih pendek, atau colokkan papan kedua ke *charger* HP 5 V yang bagus.

</details>

<details>
<summary><b>Sensor RS-485 sungguhan diam</b></summary>

1. **Catunya cukup?** Banyak sensor butuh 12–24 V dari adaptor sendiri (Konsep 7). GND adaptor harus disatukan dengan GND bus.
2. **Setelan serialnya?** Coba 9600, lalu 4800 baud; hampir semua sensor murah memakai 8N1.
3. **Alamatnya?** Biasanya 1. Lembar data sensor JXCT dan Seeed menyebut loker alamatnya (`0x0100` dan `0x0200`).
4. **A dan B?** Kuning biasanya A dan biru B (Seeed: putih). Kalau tidak ada jawaban sama sekali, tukar sekali.
5. **Fungsi dan loker?** JXCT hanya menerima fungsi 03. Baca satu loker dulu (Praktik 4: `loker 18` karena `0x0012` = 18) sebelum membaca banyak.
6. **Contoh bingkai di PDF-nya?** Jangan disalin mentah: CRC di contoh lembar data bisa salah (Konsep 7).

</details>

---

## 🔬 Bedah Teknis (opsional)

Bagian ini boleh dilewati. Setiap butir dilipat; klik judulnya untuk membuka.

<details>
<summary><b>Modbus TCP: pertanyaan yang sama, amplop yang berbeda</b></summary>

Di pabrik, PLC, meter listrik, dan *inverter* sering tersambung ke jaringan Ethernet, bukan ke kabel RS-485. Bahasanya tetap Modbus, tetapi versi **Modbus TCP**: pesannya dikirim lewat TCP/IP ke **port 502**. Isi pertanyaannya (kode fungsi, nomor loker, jumlah) **sama persis** dengan Modbus RTU. Yang berubah hanya amplopnya:

| | Modbus RTU (RS-485) | Modbus TCP (Ethernet/WiFi) |
| :--- | :--- | :--- |
| Alamat tujuan | alamat server 1–247 di byte pertama | alamat IP perangkat, ditambah *Unit Identifier* 1 byte |
| Pemeriksa kerusakan | CRC 2 byte | tidak ada CRC Modbus; TCP dan Ethernet yang menjaganya |
| Pemisah bingkai | kabel diam 3,5 huruf | kolom *Length* di kepala bingkai |
| Kepala bingkai | — | **MBAP** 7 byte: *Transaction Identifier* (2), *Protocol Identifier* (2, selalu 0), *Length* (2), *Unit Identifier* (1) |
| Ukuran maksimum | 256 byte | 260 byte |

Pertanyaan "bacakan 3 loker mulai loker 0" dalam dua versi:

```text
RTU:  01 03 00 00 00 03 05 CB
TCP:  00 01 00 00 00 06 01 03 00 00 00 03
      \___/ \___/ \___/ \/ \_____________/
        |     |     |   |        +-- isi yang sama: fungsi 03, mulai loker 0, sebanyak 3
        |     |     |   +----------- Unit Identifier 1
        |     |     +--------------- Length: 6 byte sesudahnya
        |     +--------------------- Protocol Identifier: 0 = Modbus
        +--------------------------- Transaction Identifier 1, disalin server ke jawabannya
```

Jawabannya: `00 01 00 00 00 09 01 03 06 02 49 00 FD 04 B0`, yaitu isi loker yang sama dengan Praktik 3, tanpa CRC. Bingkai ini dihitung dan dicocokkan dengan contoh resmi di *MODBUS Messaging on TCP/IP Implementation Guide* V1.0b.

Modbus TCP juga sering muncul sebagai ***gateway*** Modbus: kotak kecil (atau ESP32) yang menerima Modbus TCP dari jaringan, lalu meneruskannya sebagai Modbus RTU ke bus RS-485 di belakangnya. *Unit Identifier* menentukan server RS-485 mana yang dituju. Untuk perangkat Modbus TCP langsung (tanpa *gateway*), spesifikasinya menyarankan *Unit Identifier* `0xFF`, tetapi banyak alat menerima 0 atau 1; periksa lembar datanya.

Untuk mencoba dari laptop atau Pi, alat baris perintah **mbpoll** bisa berbicara Modbus TCP: `mbpoll -m tcp -a 1 -t 4 -r 1 -c 3 192.168.1.50` (`-t 4` = *holding register*, `-r 1` = loker 0 karena mbpoll mulai menghitung dari 1). Di Node-RED ada node **node-red-contrib-modbus**. Library ESP32 yang bisa menjadi server Modbus TCP antara lain **eModbus** dan **modbus-esp8266**; contoh sketsanya lolos kompilasi dengan paket esp32 3.3.12 saat riset modul ini, tetapi belum diuji di papan. Di Rumah Pintar Mini, jalur utamanya tetap MQTT (`telemetry`), bukan Modbus TCP.

</details>

<details>
<summary><b>Terminator, bias, dan "byte hantu": menghitung kabel yang diam</b></summary>

Saat tidak ada yang bicara, kedua modul hanya mendengar. Selisih tegangan A dan B saat itu ditentukan resistor bias di setiap modul (20 kΩ dari A ke VCC dan 20 kΩ dari B ke GND, menurut skema modul yang beredar) dan kedua terminator 120 Ω.

- Dua modul paralel: 10 kΩ ke atas, 10 kΩ ke bawah, dan 120 Ω ∥ 120 Ω = 60 Ω di antara A dan B.
- Selisih A–B saat diam: 5 V × 60 / (10.000 + 60 + 10.000) ≈ **15 mV**.
- Penerima MAX485 hanya **dijamin** membaca "1" kalau selisihnya paling sedikit **200 mV**. Di bawah itu, yang menahannya hanya histeresis kecil penerima.

Jadi, tepat setelah satu alat selesai bicara, penerima sesekali bisa membaca satu byte palsu, misalnya `00`. Library melaporkannya sebagai CRC salah atau alamat salah, dan Node 1 v1.4.0 mengulang sekali. Obat yang benar adalah **satu pasang resistor bias yang kuat untuk seluruh bus**: misalnya 560 Ω dari A ke 5 V dan 560 Ω dari B ke GND di modul Node 1 membuat selisih saat diam menjadi 5 × 60 / (560 + 60 + 560) ≈ **254 mV**, di atas 200 mV. Spesifikasi Modbus meminta 450–650 Ω, satu pasang saja per bus.

Mengapa kabel 5 m di lab tidak terganggu pantulan? Tepi sinyal MAX485 naik dalam belasan nanodetik, dan pantulan di kabel 5 m reda dalam waktu kurang dari 1 µs. Satu bit pada 9600 baud lamanya 104 µs, dan UART mencuplik di tengah bit, jadi pantulan sudah lama hilang saat bit dibaca. Terminator baru benar-benar penting untuk kabel ratusan meter atau laju tinggi. Di kabel panjang, aturan Konsep 3 (rantai, cabang pendek, terminator hanya di dua ujung) menjadi wajib.

</details>

<details>
<summary><b>Membaca bus dari laptop: konverter USB–RS485, QModMaster, dan mbpoll</b></summary>

Konverter USB–RS485 (sekitar Rp15–30 ribu) membuat laptop menjadi klien Modbus. Kebanyakan memakai chip USB-serial CH340 atau FT232; *driver*-nya sama dengan papan ESP32 ber-CH340 di Modul 2. Sambungkan A ke A, B ke B, dan GND kalau konverternya punya terminal GND.

**Aturan penting: satu bus, satu klien.** Hentikan dulu pembacaan Node 1 (`rs485 off`) sebelum laptop bertanya supaya tidak ada dua klien yang bicara bersamaan.

- **Windows: QModMaster** (gratis, sumber terbuka). Isi setelannya sama dengan sensor tiruan: mode RTU, port COM konverternya, 9600 baud 8N1, alamat server 1, fungsi 03 (baca *holding register*), mulai loker 0, sebanyak 3. Jendela lalu lintas busnya menampilkan bingkai mentah, persis seperti Praktik 3.
- **Linux, macOS, dan Raspberry Pi: mbpoll.** Perintah untuk sensor tiruan:

  ```bash
  mbpoll -m rtu -a 1 -b 9600 -P none -t 4 -r 1 -c 3 /dev/ttyUSB0
  ```

  `-m rtu` wajib (bawaannya TCP), `-P none` wajib (bawaannya paritas genap), `-b 9600` wajib (bawaannya 19200), dan `-r 1` berarti loker 0 karena mbpoll mulai menghitung dari 1.

Urutan pemeriksaan (*debug*) yang disarankan untuk sensor baru: baca dulu dari laptop (membuktikan catu, laju baud, alamat, dan A/B), baru sambungkan ke Node 1.

</details>

<details>
<summary><b>Tombol bicara otomatis: mode RS-485 perangkat keras ESP32</b></summary>

Di modul ini, pin DE/RE diatur kode (`preTransmission`/`postTransmission`). UART ESP32 juga bisa mengaturnya sendiri lewat pin RTS:

```cpp
Serial2.begin(9600, SERIAL_8N1, 16, 17);
Serial2.setPins(-1, -1, -1, 4);                // RTS = D4, disambung ke DE dan RE
Serial2.setMode(UART_MODE_RS485_HALF_DUPLEX);  // RTS HIGH selama mengirim, LOW sesudah bit terakhir
```

Dalam mode ini, *driver* UART ESP-IDF menaikkan RTS setiap kali mengisi antrean kirim dan menurunkannya setelah bit terakhir keluar, lalu ikut membuang huruf yang terbaca selama mengirim. ModbusMaster tidak perlu lagi diberi `preTransmission` dan `postTransmission`. Varian sketsa ini lolos kompilasi saat riset modul ini, tetapi belum diuji penulis di papan, jadi modul ini tetap memakai cara manual yang konsepnya terlihat jelas.

</details>

<details>
<summary><b>eModbus: library server dan klien yang tidak memblokir</b></summary>

Silabus semula menyebut **eModbus** untuk papan kedua. Library ini bagus: kliennya tidak memblokir (jawaban datang lewat *callback*, seperti ESP-NOW di Modul 14), dan ia juga bisa berbicara Modbus TCP. Namun, untuk pemula ada empat hambatan (dicek Oktober 2026):

1. **Tidak ada di Library Manager.** Harus diunduh sebagai ZIP dari rilis GitHub `v1.7.6.stable`, lalu dipasang lewat **Sketch → Include Library → Add .ZIP Library…**.
2. **Butuh library "Async TCP"** walaupun hanya dipakai untuk RTU; tanpanya kompilasi gagal dengan `AsyncTCP.h: No such file or directory`. Pasang **Async TCP** oleh **ESP32Async** (versi 3.5.0), bukan library lain yang namanya mirip.
3. **Contoh resminya perlu disesuaikan**: contoh `RTUserver` menolak loker 0 dan memakai RX 17, TX 16, dan 19200 baud.
4. **Tidak bisa dipakai di Wokwi gratis** karena Wokwi gratis hanya mengenal library dari Library Manager.

Karena itu, modul ini memakai **ModbusRTUSlave** untuk papan kedua. Kalau kelak Node 1 harus membaca banyak sensor tanpa pernah tersendat 2 detik, klien eModbus (atau **ModbusRTUMaster**, yang batas waktunya bisa diatur) layak dicoba.

</details>

<details>
<summary><b>Angka 32 bit: dua loker dan urutan yang berbeda-beda</b></summary>

Meter listrik dan penghitung aliran sering menyimpan angka besar (misalnya kWh, atau angka desimal *float*) di **dua loker berurutan**. Spesifikasi Modbus hanya menetapkan urutan byte **di dalam** satu loker (byte tinggi dulu). Urutan **kedua loker** tidak diatur, jadi ada pabrik yang menaruh separuh atas di loker pertama ("ABCD") dan ada yang sebaliknya ("CDAB", sering disebut *word swap*). Lembar data yang baik menuliskannya. Kalau tidak, baca kedua loker, lalu coba kedua urutan dan pilih yang hasilnya masuk akal.

</details>

<details>
<summary><b>Melihat bingkai di Wokwi dengan Logic Analyzer</b></summary>

Proyek Wokwi `kode/wokwi-sensor-tanah-rs485` membawa **Logic Analyzer** delapan kanal yang merekam tiga jalur: DI (TX2), RO (RX2), dan DE_RE (D4). Lampu kecilnya berkedip hijau saat ada sinyal.

1. Jalankan simulasi dengan sketsa Praktik 4 sampai Serial Monitor menulis baris `server 1, fungsi 03: …` pertama (5 detik menurut jam simulasi; Wokwi berjalan lebih lambat daripada waktu sungguhan, jadi kamu bisa menunggu sekitar 15 detik), lalu **hentikan**. Menurut dokumentasi Wokwi, browser mengunduh file `wokwi-logic.vcd`.
2. Buka file itu dengan **PulseView** (gratis): klik panah kecil di sebelah tombol **Open** → **Import Value Change Dump data...**. Isi **Downsampling factor** dengan 50 supaya tidak berat.
3. Tambahkan pengurai (*decoder*) **UART** pada jalur DI dan RO, 9600 baud. Kamu akan melihat `01 03 00 00 00 03 05 CB` lewat di DI saat DE_RE tinggi, lalu jawaban `01 03 06 …` di RO setelah DE_RE turun.

</details>

<details>
<summary><b><i>Master/slave</i> dan <i>client/server</i></b></summary>

Pada Juli 2020, organisasi Modbus mengumumkan penggantian istilah "master-slave" dengan "client-server" di semua dokumennya. Klien (*client*) = alat yang memulai pertanyaan (dulu *master*); server = alat yang menjawab (dulu *slave*). Spesifikasi jalur serial versi lama, banyak library (ModbusMaster, ModbusRTUSlave), dan lembar data sensor masih memakai istilah lama, jadi kamu akan terus menemui keduanya. Artinya sama.

</details>

---

## 🧩 Tantangan mandiri

Tiga tingkat, dari mengubah sedikit sampai membuat sendiri. Kunci Tingkat 1 dan 2 ada di bagian lipat; Tingkat 3 sengaja hanya diberi petunjuk. Kerjakan minimal Tingkat 1. Tingkat 1 dan 2 bisa dikerjakan di jalur Wokwi, kecuali bukti langkah 3 Tingkat 1: chip di proyek Node 1 selalu mulai di alamat 1, dan Node 1 v1.4.0 tidak punya perintah untuk menulis loker, jadi di Wokwi cukup ketik `rs485 on` (NVS Wokwi selalu kosong di simulasi baru) dan pastikan jawabannya menulis `server 7` (bacaannya memang *timeout*).

### Tingkat 1 — Dua sensor di satu bus (ubah sedikit)

Seorang pemilik *greenhouse* ingin menambah sensor kedua di bus yang sama. Kedua sensornya baru dan sama-sama beralamat 1.

1. Kalau Node 1 sedang di *charger*-nya, colokkan dulu ke laptop: matikan MB102, pindahkan colokan USB-nya dari *charger* ke laptop, lalu nyalakan lagi MB102. Unggah lagi sketsa `modul15_baca_register` (Praktik 4) ke papan Node 1 (pilihan papan **DOIT ESP32 DEVKIT V1**; Wokwi: proyek Praktik 3–4), ubah alamat sensor tiruanmu menjadi **7**, lalu baca loker 0–2 dari alamat baru itu. Jangan tekan **EN** di papan kedua sampai langkah 3 selesai: alamat barunya hilang setelah *restart*.
2. Jelaskan di `catatan-modul15.md`: apa yang terjadi kalau dua sensor beralamat sama tersambung ke satu bus, lalu klien bertanya ke alamat itu?
3. Ubah `ALAMAT_SENSOR_RS485` di `konfigurasi.h` Node 1 supaya Node 1 v1.4.0 membaca sensor beralamat 7, lalu unggah Node 1 v1.4.0 lagi dengan setelan Praktik 5.7 (**ESP32 Dev Module**, **Minimal SPIFFS**, **DIO**). Setelah itu, kembalikan semuanya ke alamat 1 dan unggah lagi.

<details>
<summary><b>Kunci Tingkat 1</b></summary>

1. Ketik `tulis 3 7` (masih bertanya ke server 1), lalu `server 7`. Bacaan berikutnya: `server 7, fungsi 03: kelembapan 58.5 %, …`. Di Wokwi, **CHIPS CONSOLE** menulis `Alamat server diganti menjadi 7 (simulasi baru = kembali ke 1).`
2. Keduanya menjawab **bersamaan**. Kedua pemancar menyala pada waktu yang sama, sinyalnya bertabrakan, dan klien menerima bingkai rusak (CRC salah) atau tidak menerima apa-apa. Itulah sebabnya alamat setiap sensor baru diganti **sebelum** dipasang di bus, satu per satu, saat ia sendirian di kabel.
3. Tulis `const uint8_t ALAMAT_SENSOR_RS485 = 7;`, unggah, lalu periksa dengan perintah `rs485`: `rs485: dipakai, server 7, …`. Kembalikan alamat sensor tiruan dengan menekan **EN** di papan kedua (setelah *restart* alamatnya kembali ke 1; `tulis 3 1` hanya bisa dipakai selama sketsa Praktik 4 masih di Node 1), lalu tulis lagi `ALAMAT_SENSOR_RS485 = 1` dan unggah Node 1 v1.4.0.

</details>

### Tingkat 2 — Grafik 24 jam kelembapan tanah RS-485 (isi bagian rumpang)

Tambahkan grafik 24 jam ke grup **Sensor RS-485**, dengan sumbu waktu dari `ts` seperti grafik Kebun di Modul 14. Lengkapi bagian rumpang (`____`) rancangan ini:

```text
[telemetry Node 1 (RS-485)] → [switch "kelembapan RS-485 terbaca?"]
                                  → [change "waktu bacaan (ms)": Set msg.payload.waktu to ____ ]
                                      → [chart "Kelembapan tanah RS-485 (24 jam)": X: key: ____ , Y: key: ____ ]
```

<details>
<summary><b>Kunci Tingkat 2</b></summary>

- Node change: **Set** `msg.payload.waktu` **to the value** jenis **J: expression**, isi `$toMillis(payload.ts)`.
- Node chart: **Group** `Sensor RS-485`, **Type** `Line`; di bagian **Properties**, **Series:** jenis **a**z (teks) berisi `Kelembapan tanah`, **X:** jenis **key:** berisi `waktu`, dan **Y:** jenis **key:** berisi `tanah_rs485`; **X-Axis Limit** `last` `24` `Hours`.
- Mengapa switch dipasang lebih dulu? Supaya titik `null` (sensor tidak menjawab) tidak masuk grafik sebagai angka 0.

</details>

### Tingkat 3 — Sensor tanah RS-485 sungguhan (buat dari nol)

Punya sensor tanah RS-485 sungguhan, misalnya seri JXCT? Ganti sensor tiruan dengan sensor itu.

Petunjuk:

1. **Baca lembar datanya dulu** (Konsep 7): catu (sering 12–24 V), warna kabel A dan B, laju baud, alamat, kode fungsi, dan peta loker beserta skalanya.
2. **Listriknya:** adaptor 12 V tersendiri untuk sensor. Kabel catu sensor **hanya** ke adaptor; GND adaptor disatukan dengan GND bus (rel bawah (−) Node 1); A dan B sensor ke terminal A dan B modul MAX485 Node 1. Papan kedua tidak dipakai, dan terminator 120 Ω di modul Node 1 tetap terpasang (ujung bus yang lain adalah sensornya).
3. **Uji dulu dengan `modul15_baca_register`:** baca satu loker (`loker 18` untuk `0x0012`), baru banyak loker.
4. **Ubah `rs485.cpp`:** ubah `LOKER_AWAL` dan `JUMLAH_LOKER` di bagian atas file sesuai lembar data (JXCT: kelembapan `0x0012`, suhu `0x0013`, EC `0x0015`, jadi `LOKER_AWAL = 0x0012` dan `JUMLAH_LOKER = 4`). Di `perbaruiRS485()`, sesuaikan indeks `getResponseBuffer()` dan skalanya.
5. Nama kolom `telemetry` **tidak** berubah: `tanah_rs485`, `suhu_tanah`, dan `ec` tetap berarti sama, dari sensor mana pun (kontrak data 1.2).

---

## ➕ Tambahan ke "Rumah Pintar Mini"

Minggu ini Node 1 belajar bahasa industri: **Node 1 v1.4.0** bisa membaca sensor tanah RS-485 lewat Modbus RTU dan memasukkan bacaannya ke `telemetry`. Dashboard mendapat grup **Sensor RS-485**. Tiga dokumen proyek ikut naik versi: kontrak data 1.2, peta pin 6, dan pemeriksa kontrak 1.2. Papan Node 2 kembali ke kebun.

![Diagram proyek Rumah Pintar Mini setelah Modul 15; garis putus-putus berarti menyusul. Node 2 Kebun v1.0.0 dengan baterai 18650, kembali ke kebun setelah dipinjam lab, mengirim ESP-NOW ke Node 1 Rumah v1.4.0: lima sensor, aktuator, dan jembatan Node 2 seperti sebelumnya, LED status di D2, dan bagian baru sensor RS-485: MAX485 di RX2/TX2 dengan DE/RE di D4, Modbus RTU setiap 10 detik, sakelar NVS rs485 on / off, telemetry ditambah tanah_rs485, suhu_tanah, dan ec. Kotak putus-putus sensor tanah RS-485 tersambung ke Node 1 lewat garis putus-putus berlabel A/B (kelak): di lab, papan kedua tiruan; kelak, sensor sungguhan untuk capstone smart farming. Node 1 mengirim MQTT ke Gateway Raspberry Pi 192.168.1.37 yang berisi Mosquitto dan Node-RED (dashboard, kartu Kebun, grup Sensor RS-485 yang baru, otomasi kipas), lalu ke HP. Bawah, GitHub rumah-pintar-mini: firmware/node-1-rumah v1.4.0, firmware/node-2-kebun v1.0.0, KONTRAK-DATA.md 1.2, PETA-PIN.md 6, alat/pemeriksa-kontrak.js 1.2, dan edge/node-red-flows.json ditambah Sensor RS-485. Kotak checkpoint Fase 2: WiFi, MQTT, gateway Pi, Node-RED, ESP-NOW, dan RS-485 sudah terpasang di satu proyek. Kotak putus-putus Modul 16 backend dan Modul 17 database menyusul.](aset/diagram-proyek-modul-15.png)

> 🖥️ **Alat yang dipakai:** **Arduino IDE** dengan `node-2-kebun.ino` (Modul 14) dan `node-1-rumah.ino`, papan Node 1 dan papan kedua, obeng kecil, *charger* HP kalau baterai Node 2 perlu diisi (Modul 9), editor Node-RED, **VS Code** dengan folder `rumah-pintar-mini`, dan **GitHub Desktop**.
>
> **Jalur Wokwi:** kerjakan B, C, dan D. Langkah A hanya untuk papan asli. Pastikan perubahan Praktik 5 juga tersimpan di folder `firmware` repositorimu, dengan `PAKAI_WOKWI` tetap `false` di repositori. Jangan ikut menyalin file khusus Wokwi (`diagram.json`, `libraries.txt`, `sensor-tanah.chip.json`, dan `sensor-tanah.chip.c`) ke folder itu: Arduino IDE ikut mengompilasi `sensor-tanah.chip.c` dan gagal dengan `wokwi-api.h: No such file or directory`.
>
> ⭐ **Wajib** — langkah D adalah syarat lulus Modul 15.

| File di `rumah-pintar-mini` | Perubahan |
| :--- | :--- |
| `firmware/node-1-rumah/` | **v1.4.0**: `rs485.h` dan `rs485.cpp` baru, perubahan kecil di enam file (Praktik 5) |
| `alat/pemeriksa-kontrak.js` | versi 1.2 (Praktik 5.10) |
| `KONTRAK-DATA.md` | versi 1.2 (langkah B) |
| `PETA-PIN.md` | versi 6 (langkah B) |
| `edge/node-red-flows.json` | ditambah bagian 6 Sensor RS-485 (langkah C) |

### A. Kembalikan papan kedua menjadi Node 2

1. **Di Node 1**, matikan pembacaan sensor RS-485 karena sensornya akan pergi: ketik `rs485 off` di Serial Monitor Node 1 (kalau Node 1 sedang di *charger*-nya, colokkan sebentar ke laptop: matikan MB102 dulu, lalu nyalakan lagi setelah USB laptop tercolok). Kolom RS-485 hilang dari `telemetry`, dan grup **Sensor RS-485** menulis `tidak dipakai`. Modul MAX485 dan pembaginya **tetap terpasang** di Node 1 (`PETA-PIN.md` versi 6), siap untuk sensor sungguhan kelak. Lepas kabel UTP-nya tanpa listrik di kedua ujungnya: matikan MB102, cabut USB Node 1, lalu cabut juga USB papan kedua. Kendurkan sekrup terminal **A** dan **B** modul Node 1, tarik kawat biru dan putih-biru, lalu cabut kawat cokelat dari rel bawah (−) kolom 15 (ujung kabel di papan kedua baru dilepas di langkah 2). Setelah itu, colokkan USB Node 1 ke *charger*-nya sendiri, baru nyalakan MB102 (aturan emas).
2. **Di papan kedua** (USB-nya sudah tercabut di langkah 1), lepas modul MAX485, kedua resistor, dan kabel-kabelnya dari breadboard mini dan dari pin papan (RX2, TX2, D4, VIN), termasuk kawat UTP dan kabel GND lab di rel bawah (−) kolom 20, 22, dan 23. Kabel Modul 14 di rel bawah (kabel sensor serta kabel 3V3 dan GND papan di kolom 28–29) jangan dicabut. Simpan modul dan kabel UTP-nya.
3. Colokkan lagi USB papan kedua ke laptop (kabel VIN dan GND ke rangkaian baterai belum dipasang). Buka `node-2-kebun.ino` dari repositori `rumah-pintar-mini` (folder `firmware/node-2-kebun`), pilih **DOIT ESP32 DEVKIT V1** dan port papan kedua, lalu klik **Upload**. Papan ini kini kembali menjadi **Node 2 v1.0.0**.
4. Cabut USB-nya. Kalau baterainya sudah lama tidak diisi, isi penuh dulu lewat colokan USB TP4056 sambil ditunggui, seperti Modul 14 ➕ A langkah 2. Lalu pasang lagi dua kabel yang kamu simpan di langkah 1 Kemenangan Cepat, seperti di Modul 14 ➕ B: dari pin **VIN** papan ke rel atas (+) kolom 29, dan dari pin **GND** papan (deretan kiri, di atas VIN) ke rel atas (−) kolom 28 breadboard mini. Setelah itu, kembalikan Node 2 ke tempatnya di kebun.
5. Dalam beberapa menit, kartu **Kebun** di HP kembali `online` dengan bacaan baru.

### B. Kontrak data 1.2 dan peta pin 6

1. Di VS Code dengan folder `rumah-pintar-mini`, buka `KONTRAK-DATA.md`, lalu salin dulu isi tabel **Perangkatku** (paling bawah) ke `catatan-modul15.md`: penggantian berikut ikut mengosongkan tabel itu. Buka [`proyek-rumah-pintar-mini/KONTRAK-DATA.md`](../../proyek-rumah-pintar-mini/KONTRAK-DATA.md) di tab baru, klik **Copy raw file**, lalu ganti seluruh isi file-mu dengannya (**Ctrl + A**, lalu **Ctrl + V**). Isi lagi tabel **Perangkatku** dari catatanmu, lalu simpan (**Ctrl + S**). Versi 1.2 menambahkan bagian **Kolom sensor RS-485 di `telemetry` Node 1** dan baris riwayat 1.2.
2. Lakukan hal yang sama untuk `PETA-PIN.md` dengan [`proyek-rumah-pintar-mini/PETA-PIN.md`](../../proyek-rumah-pintar-mini/PETA-PIN.md). Versi 6 mencatat LED status di **D2**, DE/RE RS-485 di **D4**, RX2/TX2 yang kini terpasang, bagian baru **RS-485 di meja kerja Node 1**, dan baris riwayat versi 6.

### C. Ekspor ulang flow Node-RED

1. **Di editor Node-RED**, pastikan node comment `6 · Sensor RS-485: tiga kolom Modbus di telemetry Node 1 (Modul 15)` berada di atas node-node bagian 6, dan node debug `lihat kolom RS-485` dalam keadaan pudar (mati). Klik **Deploy** kalau ada yang kamu ubah.
2. Ekspor seperti ➕ D Modul 13: menu utama → **Export** → **all flows** → **formatted** → **Download**.
3. Di folder **Downloads**, ubah nama `flows.json` menjadi `node-red-flows.json`, lalu pindahkan ke **Documents → GitHub → rumah-pintar-mini → edge** dan pilih **Replace the file in the destination** (macOS: **Replace**).
4. Di VS Code, buka `edge/node-red-flows.json`, tekan **Ctrl + F**, lalu cari `Sensor RS-485`: harus ketemu. Cari juga `password`: tidak boleh ketemu.

### D. ⭐ Simpan ke GitHub

1. Di GitHub Desktop, pilih repositori **`rumah-pintar-mini`**. Daftar **Changes** berisi `firmware/node-1-rumah` (dua file baru dan enam file yang berubah), `alat/pemeriksa-kontrak.js`, `KONTRAK-DATA.md`, `PETA-PIN.md`, dan `edge/node-red-flows.json`. Isi **Summary** dengan `Modul 15: Node 1 v1.4.0 membaca sensor RS-485 (Modbus RTU), kontrak 1.2, peta pin 6`, klik **Commit … to main**, lalu **Push origin**.
2. Di repositori **`belajar-iot`**, folder `modul-15` berisi sketsa latihanmu (`modul15_halo_kirim`, `modul15_halo_dengar`, `modul15_ping`, `modul15_pong`, `modul15_sensor_tiruan`, `modul15_bingkai_mentah`, dan `modul15_baca_register`) serta `catatan-modul15.md`. Lakukan *commit* dan *push* juga.

**Bukti lulus Modul 15** (bandingkan dengan ✅ di bawah): nilai Modbus dari papan kedua tampil di grup Sensor RS-485 lewat kabel 5 m (Praktik 6), jawabanmu untuk lima skenario beserta alasannya ada di `catatan-modul15.md` (Praktik 7), dan semuanya tersimpan di repositori (langkah D).

---

## 📖 Glosarium

| Istilah | Arti |
| :--- | :--- |
| **RS-485** | Standar listrik untuk mengirim data lewat sepasang kawat terpilin (A dan B) dengan sinyal diferensial, sampai sekitar 1.200 m. Hanya mengatur listriknya, bukan isi pesannya. |
| **Sinyal diferensial** | Cara mengirim bit dengan dua tegangan yang saling berlawanan di dua kawat; penerima hanya membaca selisihnya sehingga gangguan yang mengenai kedua kawat sama besar tidak berpengaruh. |
| **Setengah dupleks** (*half duplex*) | Satu jalur dipakai dua arah secara bergantian, seperti *walkie-talkie*. |
| **MAX485** | Chip penerjemah antara UART (TX/RX) dan RS-485 (A/B). Modul birunya membawa terminator 120 Ω dan butuh 5 V. |
| **DE/RE** | *Driver Enable* dan *Receiver Enable*: pin "tombol bicara" modul MAX485. Disatukan: HIGH = bicara, LOW = dengar. |
| **Terminator** | Resistor 120 Ω di kedua ujung kabel RS-485 yang meredam pantulan sinyal. |
| **Bias** | Pasangan resistor yang menahan kabel RS-485 pada keadaan "1" saat tidak ada yang bicara. |
| **Bus** | Satu jalur yang dipakai bersama oleh banyak alat; untuk RS-485 bentuknya rantai (*daisy chain*). |
| **Modbus RTU** | Protokol tanya jawab industri yang dikirim sebagai byte biner lewat kabel serial seperti RS-485. |
| **Modbus TCP** | Versi Modbus untuk jaringan TCP/IP (Ethernet atau WiFi), port 502, dengan kepala MBAP dan tanpa CRC. |
| **Klien/server** (*client/server*) | Klien bertanya, server menjawab. Istilah lamanya *master* (klien) dan *slave* (server). |
| **Alamat server** | Nomor 1–247 yang unik untuk setiap server di satu bus; 0 = siaran. |
| **Loker** (*register*) | Tempat bernomor untuk satu angka 16 bit di dalam server Modbus. *Holding register* boleh dibaca dan ditulis; *input register* hanya-baca. |
| **Kode fungsi** | Byte kedua bingkai yang menyebut jenis pertanyaan: 03 baca *holding register*, 04 baca *input register*, 06 tulis satu *holding register*. |
| **Bingkai** (*frame*) | Satu pesan Modbus utuh: alamat, kode fungsi, data, dan CRC. |
| **CRC** | Dua byte "segel" yang dihitung dari isi bingkai; penerima menghitung ulang untuk memastikan tidak ada bit yang berubah di jalan. |
| ***Exception*** | Penolakan resmi dari server, beserta kode alasannya (01–04). |
| ***Timeout*** | Klien berhenti menunggu karena tidak ada jawaban yang sah; di ModbusMaster setelah 2 detik (kode `0xE2`). |
| **Skala** | Pengali yang dipakai untuk menyimpan pecahan di loker, misalnya ×10: 58,5 % disimpan sebagai 585. |
| **Komplemen dua** | Cara menyimpan angka minus di bilangan biner; −50 disimpan sebagai `FF CE` dan dibaca dengan `(int16_t)`. |
| **EC** (daya hantar listrik) | Ukuran seberapa mudah tanah menghantarkan listrik, dalam µS/cm; makin banyak garam dan pupuk yang terlarut, makin besar angkanya. Di sensor tiruan modul ini, isinya ada di loker 2. |
| **LoRa / LoRaWAN** | LoRa: radio jarak jauh berdaya kecil. LoRaWAN: jaringan di atas LoRa (node → *gateway* → *network server*). Di Indonesia: 920–923 MHz, rencana AS923-2. |
| ***Duty cycle*** | Bagian waktu yang boleh dipakai sebuah perangkat untuk memancar; LoRa di Indonesia paling banyak 1 %. |
| **Jaringan jala** (*mesh*) | Jaringan yang setiap alatnya ikut meneruskan pesan alat lain sehingga jangkauannya bertambah setiap ada alat baru. |
| **Zigbee** | Protokol jaringan jala berdaya sangat kecil untuk rumah pintar, butuh *hub* (koordinator). |
| **Thread / Matter** | Thread: jaringan jala IPv6 berdaya kecil yang butuh *border router*. Matter: bahasa bersama perangkat rumah pintar lintas merek, berjalan di atas WiFi atau Thread. |
| **NB-IoT / LTE-M** | Jaringan seluler khusus perangkat IoT yang hemat daya; butuh kartu SIM dan paket dari operator. |
| **BLE** (*Bluetooth Low Energy*) | Bluetooth hemat daya untuk berbicara dengan HP dari jarak dekat, misalnya saat setelan awal perangkat. |

## 📝 Kuis (5 soal)

1. Mengapa sepuluh sensor tanah di *greenhouse* 200 m disambung dengan RS-485, bukan dengan kabel UART biasa (TX, RX, dan GND) yang dipanjangkan? Jelaskan dengan kata "selisih".
2. Node 1 menulis `GAGAL, kode 0xE2 = tidak ada jawaban (timeout)` setiap kali bertanya. Sebutkan tiga kemungkinan penyebabnya, dan jelaskan mengapa kesalahan seperti itu tidak pernah muncul sebagai *exception*.
3. Sebuah sensor tiruan menjawab `01 03 06 02 49 FF CE 04 B0 …` (`…` mewakili dua byte CRC). Berapa kelembapan tanah, suhu tanah, dan EC-nya menurut lembar data Praktik 2? Tunjukkan hitunganmu untuk suhu.
4. Lembar data sensor A menulis "40001 = kelembapan tanah (×10)", sedangkan lembar data sensor B menulis "alamat `0x0012` = kelembapan tanah (×10)". Berapa nomor loker yang ditulis di `readHoldingRegisters()` untuk masing-masing?
5. Seorang teman menulis kode kirim RS-485 begini: `digitalWrite(DE_RE, HIGH); Serial2.print(teks); digitalWrite(DE_RE, LOW);`, dan memasang DE/RE di D2. Sebutkan dua masalah yang akan ia temui, dan cara memperbaikinya.

<details>
<summary><b>Kunci jawaban</b></summary>

1. Kabel UART biasa membawa sinyal yang diukur terhadap GND. Di kabel 200 m dekat pompa dan kipas, gangguan menempel di kawat sinyal, dan GND di kedua ujung pun bisa berbeda sehingga 0 dan 1 tertukar. RS-485 mengirim setiap bit sebagai dua tegangan berlawanan di sepasang kawat terpilin, dan penerimanya hanya membaca **selisih** keduanya. Gangguan mengenai kedua kawat sama besar, jadi selisihnya tetap. Penerima masih yakin membaca selisih sekecil 0,2 V sehingga kabelnya bisa ratusan meter (Konsep 1).
2. Misalnya: alamat server salah (atau sudah diganti), A dan B tertukar, laju baud atau format serial berbeda, DE/RE tidak tersambung, server mati, atau kabel putus. Semua itu membuat server tidak menerima bingkai yang utuh dan ditujukan kepadanya, atau jawabannya tidak sampai. *Exception* hanya bisa dikirim server yang **menerima dan memahami** pertanyaan lalu menolaknya; bingkai rusak atau salah alamat justru dibuang diam-diam (Konsep 5–6).
3. Kelembapan: `02 49` = 585 → **58,5 %**. Suhu: `FF CE` = 65.486 kalau dibaca tanpa tanda; sebagai bilangan bertanda 16 bit, 65.486 − 65.536 = −50, lalu dibagi 10 → **−5,0 °C**. EC: `04 B0` = 4 × 256 + 176 = **1.200 µS/cm**.
4. Sensor A: "40001" adalah gaya Modicon untuk *holding register* pertama, jadi lokernya **0**. Sensor B: alamat heksadesimal biasanya sudah nomor di dalam bingkai, jadi lokernya **`0x0012`** (18). Kalau hasilnya tidak masuk akal, coba N dan N−1 (Konsep 6).
5. Pertama, tanpa `Serial2.flush()`, DE/RE turun sebelum huruf-huruf selesai keluar sehingga pesannya terpotong atau hilang (Praktik 1.4); obatnya `flush()` sebelum `digitalWrite(DE_RE, LOW)`. Kedua, modul MAX485 menarik DE/RE ke 5 V, padahal D2 harus LOW atau mengambang supaya papan bisa masuk mode unggah, jadi unggahan bisa gagal dengan `Wrong boot mode detected`; obatnya memakai pin yang bukan pin *strapping*, misalnya D4. (Bonus: `Serial2.begin()` juga wajib menuliskan pin 16 dan 17.)

</details>

---

## ✅ Checklist kelulusan Modul 15

Syarat lulus dari Silabus: **Node 1 bisa membaca register Modbus dari ESP32 kedua dan nilainya tampil di dashboard, dan kamu bisa memilih protokol yang tepat untuk lima skenario soal.** Jalur Wokwi: butir library, Praktik 3, Praktik 4, ⭐ Praktik 5, ⭐ Praktik 7, dan ⭐ ➕ D bisa dicentang tanpa papan (Praktik 3–5 dengan chip tiruan), dan grup Sensor RS-485 boleh kamu buktikan dulu dengan chip tiruan di Node-RED laptopmu (Praktik 6). Butir Kemenangan Cepat, Praktik 1, Praktik 2, ➕ A, dan uji kabel 5 m di Praktik 6.4 baru bisa dicentang setelah papan kedua dan modul MAX485-mu ada.

- [ ] Library ModbusMaster 2.0.1 dan ModbusRTUSlave 3.1.2 terpasang (🧰).
- [ ] Kedua modul MAX485 terpasang dengan pembagi tegangan di RO dan DE/RE di D4, LED status Node 1 pindah ke D2, dan papan kedua mengirim `halo` ke Node 1 lewat dua kawat (Kemenangan Cepat).
- [ ] Ping-pong berjalan, dan aku bisa menjelaskan mengapa `flush()` harus dipanggil sebelum tombol bicara dilepas (Praktik 1).
- [ ] Papan kedua menjadi sensor tanah RS-485 tiruan, dan aku bisa membaca lembar datanya (Praktik 2).
- [ ] Aku mengirim bingkai Modbus dengan tangan, membaca jawabannya byte demi byte, dan membedakan *exception* dari *timeout* (Praktik 3).
- [ ] ModbusMaster membaca tiga loker lengkap dengan skala dan tanda, dan aku mengganti alamat sensor dengan fungsi 06 (Praktik 4).
- [ ] ⭐ Node 1 v1.4.0 menulis `tanah_rs485`, `suhu_tanah`, dan `ec` ke `telemetry` setelah `rs485 on`, dan pemeriksa kontrak 1.2 menulis `LULUS` (Praktik 5).
- [ ] ⭐ Grup Sensor RS-485 di dashboard menampilkan nilai Modbus dari papan kedua lewat kabel UTP paling sedikit 5 m, dengan kedua papan memakai sumber listrik yang berbeda (Praktik 6).
- [ ] ⭐ Aku memilih protokol yang tepat untuk lima skenario Praktik 7, masing-masing dengan paling sedikit dua alasan yang masuk akal.
- [ ] Papan kedua kembali menjadi Node 2 v1.0.0 di kebun, dan Node 1 diberi `rs485 off` (➕ A).
- [ ] ⭐ Node 1 v1.4.0, `KONTRAK-DATA.md` 1.2, `PETA-PIN.md` 6, pemeriksa kontrak 1.2, dan flow Node-RED sudah di-*commit* dan di-*push* ke `rumah-pintar-mini` (➕ D).

🎉 ***Checkpoint* Fase 2 selesai.** Dalam enam minggu, Node 1 belajar WiFi dan HTTP, berbicara MQTT sesuai kontrak data, mendapat gateway Raspberry Pi dan dashboard Node-RED, menjembatani Node 2 lewat ESP-NOW, dan kini membaca sensor industri lewat RS-485. Lihat lagi [halaman Fase 2](../README.md) dan centang semua modulnya di [Pelacak progres](../../PROGRES.md).

> ➡️ **Modul berikutnya:** Modul 16 — Backend Pertama dengan TypeScript Ringan. Fase 3 dimulai: kamu membangun server Node.js yang mendengarkan semua pesan MQTT Rumah Pintar Mini, memeriksanya terhadap kontrak data, dan menyediakan API berdokumentasi, lengkap dengan alur kerja Git untuk tim.

---

## 📚 Sumber & atribusi gambar

**Dokumentasi, spesifikasi, kode sumber, dan lembar data yang dipakai** (diakses Oktober 2026):

- Spesifikasi Modbus dari [modbus.org](https://www.modbus.org/modbus-specifications): *MODBUS Application Protocol Specification* V1.1b3 (model data, kode fungsi, *exception*, urutan byte), *MODBUS over Serial Line Specification and Implementation Guide* V1.02 (alamat, bingkai RTU, jeda 3,5 huruf, CRC, laju, terminator, bias, panjang kabel, GND bersama), dan *MODBUS Messaging on TCP/IP Implementation Guide* V1.0b (MBAP, port 502, *Unit Identifier*); *Modicon Modbus Protocol Reference Guide* PI-MBUS-300 Rev. J ([salinan arsip](https://web.archive.org/web/20191201000251id_/http://www.modbus.org/docs/PI_MBUS_300.pdf); penomoran 40001); [siaran pers modbus.org, Juli 2020](https://www.modbus.org/news/modbus-organization-replaces-master-slave-with-client-server) (istilah *client/server*).
- Texas Instruments: [*The RS-485 Design Guide*](https://www.ti.com/lit/pdf/slla272) (SLLA272D) dan [*RS-422 and RS-485 Standards Overview*](https://www.ti.com/lit/pdf/slla070) (SLLA070D): sinyal diferensial, beban, jarak, terminator, bias. Lembar data [MAX481/MAX483/MAX485](https://www.analog.com/media/en/technical-documentation/data-sheets/MAX1487-MAX491.pdf) (Maxim/Analog Devices, 19-0122 Rev 10): catu 4,75–5,25 V, ambang 200 mV, VIH masukan, *fail-safe*. Skema modul MAX485 biru dari toko [ProtoSupplies](https://protosupplies.com/product/max485-ttl-to-rs-485-interface-module/) (dokumen toko, dicocokkan dengan kode resistor di foto modul).
- Espressif: [ESP32 Series Datasheet](https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf) v5.3 (pin *strapping* GPIO 2, batas tegangan masukan), [esptool: Boot Mode Selection](https://docs.espressif.com/projects/esptool/en/latest/esp32/advanced-topics/boot-mode-selection.html), kode sumber [arduino-esp32 3.3.12](https://github.com/espressif/arduino-esp32/tree/3.3.12) (`HardwareSerial`: pin bawaan Serial2, `flush()`, `setMode()`) beserta panduan migrasi 2.x ke 3.0, dan dokumentasi UART [ESP-IDF v5.5.5](https://docs.espressif.com/projects/esp-idf/en/v5.5.5/esp32/api-reference/peripherals/uart.html) (mode RS-485 setengah dupleks).
- Library: [ModbusMaster](https://github.com/4-20ma/ModbusMaster) 2.0.1 (batas waktu 2 detik, kode hasil), [ModbusRTUSlave](https://github.com/CMB27/ModbusRTUSlave) 3.1.2 (beserta [ModbusRTUComm](https://github.com/CMB27/ModbusRTUComm), [ModbusSlaveLogic](https://github.com/CMB27/ModbusSlaveLogic), dan [ModbusADU](https://github.com/CMB27/ModbusADU)), [ModbusRTUMaster](https://github.com/CMB27/ModbusRTUMaster), [eModbus](https://emodbus.github.io) 1.7.6, dan [Async TCP](https://github.com/ESP32Async/AsyncTCP) (ESP32Async).
- Lembar data sensor: *JXBS-3001 Soil Sensor User Manual* (JXCT, versi 2.0, 2020; [salinan di forum](https://embdev.net/attachment/640888/7_in_Soil_Sensor_Datasheet.pdf)) dan [*Soil Moisture & Temperature & EC Sensor User Manual* S-Temp&VWC&EC-02](https://files.seeedstudio.com/wiki/Soil_Moisture_Temperature_EC_Sensor/SoilMoisture_Temperature_ECSensorUserManual-S-Temp&VWC&EC-02.pdf) beserta [wiki-nya](https://wiki.seeedstudio.com/Sensor/SenseCAP/SenseCAP_Probe/Soil-Moisture-Temperature-EC-Sensor/) (Seeed).
- Alat: [QModMaster](https://sourceforge.net/projects/qmodmaster/), [mbpoll](https://github.com/epsilonrt/mbpoll), [PulseView](https://sigrok.org/wiki/Downloads), [node-red-contrib-modbus](https://www.npmjs.com/package/node-red-contrib-modbus).
- Wokwi: [FAQ](https://docs.wokwi.com/faq) (beberapa mikrokontroler dalam satu proyek belum didukung), [Chips API](https://docs.wokwi.com/chips-api/getting-started) ([UART](https://docs.wokwi.com/chips-api/uart), [attributes](https://docs.wokwi.com/chips-api/attributes)), [Logic Analyzer Guide](https://docs.wokwi.com/guides/logic-analyzer), dan [panduan library](https://docs.wokwi.com/guides/libraries).
- Memilih protokol: [Peraturan Menteri Kominfo Nomor 2 Tahun 2023](https://peraturan.go.id/files/permenkominfo-no-2-tahun-2023.pdf) (status di [JDIH Komdigi](https://jdih.komdigi.go.id/produk_hukum/view/id/862/t/peraturan+menteri+komunikasi+dan+informatika+nomor+2+tahun+2023): berlaku), [LoRaWAN Regional Parameters RP002-1.0.5](https://resources.lora-alliance.org/document/rp002-1-0-5-lorawan-regional-parameters) dan [About LoRaWAN](https://lora-alliance.org/about-lorawan/) (LoRa Alliance), [rencana frekuensi The Things Network](https://github.com/TheThingsNetwork/lorawan-frequency-plans) dan [kebijakan *duty cycle*-nya](https://www.thethingsnetwork.org/docs/lorawan/duty-cycle/), [Antares](https://antares.id/product/connectivity) (Telkom), daftar [Mobile IoT Network Launches](https://www.gsma.com/solutions-and-impact/technologies/internet-of-things/mobile-iot-commercial-launches/) (GSMA), [NB-IoT Telkomsel](https://www.telkomsel.com/enterprise/product-list-iot/nb-iot), lembar data Semtech SX1276/77/78/79, TI CC2652R, Nordic nRF52840 (*product brief*), dan Energizer CR2032, dokumentasi [arduino-esp32 3.3.12](https://github.com/espressif/arduino-esp32/blob/3.3.12/docs/en/libraries.rst) (dukungan Zigbee, Thread, dan Matter), [CSA: Matter](https://csa-iot.org/all-solutions/matter/) dan [Zigbee](https://csa-iot.org/all-solutions/zigbee/), [Thread Group](https://www.threadgroup.org/What-is-Thread/Overview), [Bluetooth SIG: jangkauan](https://www.bluetooth.com/learn-about-bluetooth/key-attributes/range/), [3GPP: NB-IoT](https://www.3gpp.org/news-events/3gpp-news/nb-iot-complete), dan [ESP-Techpedia: perbandingan solusi *mesh*](https://docs.espressif.com/projects/esp-techpedia/en/latest/esp-friends/solution-introduction/mesh/mesh-comparison.html). Harga perangkat adalah perkiraan harga pasar Oktober 2026 dari toko daring dan daftar belanja Silabus, bukan harga resmi.

**Gambar.** Diagram dan ilustrasi buatan sendiri dilisensikan **CC BY 4.0**, dan file sumber `.svg`-nya disertakan di folder `aset/` supaya bisa kamu ubah. Daftar lengkapnya, per file, ada di [`aset/SUMBER.md`](aset/SUMBER.md).

| File | Sumber | Lisensi / keterangan |
| :--- | :--- | :--- |
| `peta-jalan-modul-15`, `dari-sensor-rs485-ke-hp`, `sinyal-diferensial`, `max485-dan-de-re`, `bus-rs485` (`.png` + `.svg`) | Diagram orisinal kurikulum Fullstack IoT Developer. Perilaku RS-485 dan MAX485 dari panduan TI dan lembar data MAX485; susunan pin modul dari skema toko ProtoSupplies. | CC BY 4.0 |
| `bingkai-modbus`, `waktu-transaksi`, `lemari-loker-modbus`, `pohon-memilih-protokol`, `diagram-proyek-modul-15` (`.png` + `.svg`) | Diagram orisinal. Bingkai dan waktu dari spesifikasi Modbus dan rekaman uji Wokwi Praktik 3–4; pohon keputusan dirangkum dari sumber "Memilih protokol" di atas. | CC BY 4.0 |
| `rangkaian-rs485-node1`, `rangkaian-rs485-papan-kedua` (`.png` + `.svg`) | Ilustrasi orisinal, lubang dan pin persis seperti tabel Kemenangan Cepat; meja kerja melanjutkan ilustrasi Modul 5–7, breadboard mini melanjutkan Modul 9 dan 14. | CC BY 4.0 |
| `hp-sensor-rs485.png` | Tangkapan layar asli FlowFuse Dashboard 1.33.0 selebar layar HP (412 piksel) dari laptop penulis, dengan data Node 1 tiruan; judul, bingkai HP, nomor, dan keterangan oleh penulis. | FlowFuse Dashboard berlisensi Apache 2.0; gambar: CC BY 4.0 |
| `wokwi-sensor-tanah-rs485.png` | Tangkapan layar simulator [Wokwi](https://wokwi.com) (Oktober 2026) yang menjalankan proyek `kode/wokwi-sensor-tanah-rs485`, dipotong dan disusun ulang; chip "Sensor Tanah RS-485 (tiruan)" buatan kurikulum. Judul, nomor, dan keterangan oleh penulis. | © Wokwi (CodeMagic LTD); dipakai untuk tujuan pendidikan. Judul, nomor, dan keterangan: CC BY 4.0 |

**Tentang kotak Hasilnya.** Semua sketsa dan firmware modul ini sudah dikompilasi dengan paket esp32 3.3.12 untuk papan yang dipakai di praktiknya (Node 1 v1.4.0: 1.186.768 byte). Sketsa klien (Praktik 3–4) dan Node 1 v1.4.0 dijalankan di Wokwi dengan chip tiruan; sketsa sensor tiruan (Praktik 2) dijalankan di Wokwi dengan dua UART di satu ESP32 yang disilang ke klien ModbusMaster. Keluaran dua papan sungguhan yang dihubungkan kabel RS-485 (Kemenangan Cepat, Praktik 1, angka milidetik papan asli, dan uji kabel 5 m) belum direkam penulis di papan asli, jadi ditandai **contoh**. Tangkapan dashboard diambil dari Node-RED di laptop penulis dengan Node 1 tiruan.

---

[⬅️ Modul 14](../modul-14-node-2-esp-now/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · **Berikutnya: Modul 16 — Backend Pertama dengan TypeScript Ringan** (segera terbit; [ringkasannya di Silabus](../../SILABUS.md#modul-16--backend-pertama-dengan-typescript-ringan-menerima-data-api--git-untuk-tim))
