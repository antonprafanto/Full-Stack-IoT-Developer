# Modul 9 — Catu Daya & Hemat Daya: Adaptor, Baterai, Deep Sleep, & Mengukur Arus

🌐 **Bahasa Indonesia** · [English](../../en/phase-1-esp32-embedded/module-09-power-and-low-power/README.md)

*Fase 1 · Minggu 9 · Perangkat keras (*hardware*): **meja kerja Node 1 dari Modul 8**, **papan ESP32 kedua**, modul **INA219**, dan satu set **baterai 18650 + TP4056 + MT3608** (lihat 🧰) — sebagian besar praktik minggu ini butuh papan asli · Prasyarat: **Modul 8** (Node 1 v1.0) · Waktu: 8–10 jam, dicicil dalam seminggu; uji 24 jam di bagian ➕ berjalan sendiri*

[⬅️ Modul 8](../modul-08-firmware-tangguh/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · [Modul 10 ➡️ (segera terbit — baca ringkasannya di Silabus)](../../SILABUS.md#modul-10--wifi--http-perangkat-mulai-berbicara-dengan-jaringan)

---

Node 1 v1.0 sudah tangguh: tidak pernah menunggu dengan diam, ingat setelannya, dan bangkit sendiri kalau macet. Namun, ada satu hal yang belum berubah sejak Modul 2: **Node 1 masih menyusu ke laptop**. Begitu laptop dimatikan, tertidur, atau dibawa pergi, Node 1 ikut padam. Sementara itu, Node 2 "Kebun" yang akan kita bangun di Modul 14 nanti dipasang di halaman, jauh dari stopkontak.

| Yang terjadi sekarang | Penyebabnya | Obatnya minggu ini |
| :--- | :--- | :--- |
| Node 1 hanya hidup selama laptop menyala dan tidak tertidur. | ESP32 masih mengambil listrik dari USB laptop. | Adaptor sendiri untuk ESP32 (Konsep 1–2, Praktik 1, bagian ➕) |
| *Power bank* tampak cocok untuk perangkat kecil, tetapi bisa mati sendiri. | Banyak *power bank* mematikan diri kalau arus yang ditarik kecil. | Mengenali jebakannya dan memilih sumber yang tepat (Konsep 2, Praktik 7) |
| Di kebun tidak ada stopkontak, padahal baterai 18650 hanya bertegangan 3,0–4,2 V. | Papan ESP32 DevKit butuh 5 V di pin VIN atau USB. | Pengisi TP4056 dan penaik tegangan MT3608 (Konsep 6–7, Praktik 5) |
| ESP32 yang terus bangun menghabiskan baterai dalam sekitar sehari. | Chip, regulator, dan LED di papan terus menyedot arus. | Tidur dalam (*deep sleep*) dan bangun sendiri (Konsep 4–5, Praktik 2–4) |
| Kita belum tahu berapa lama baterainya bertahan. | Arusnya belum pernah diukur. | Mengukur arus dengan INA219, lalu menghitung umur baterai (Konsep 8–10, Praktik 6) |

Minggu ini Node 1 mendapat **catu daya permanennya sendiri**, dan kamu menyiapkan **kerangka Node 2**: papan ESP32 kedua yang hidup dari baterai, bangun setiap 30 detik untuk membaca suhu, lalu tidur lagi. Untuk mengukur arusnya, Node 1 sendiri yang menjadi **alat ukur**. Di akhir modul, kamu menyelesaikan ***checkpoint* (titik periksa) Fase 1** 🎉: Node 1 hidup 24 jam dari adaptor, dan arus tidur sketsa baterai sudah terukur.

![Peta jalan Modul 9. Atas, enam fase kurikulum dari Fase 0 Fondasi sampai Fase 5 Operasi dan skala; Fase 1 ESP32, Modul 5 sampai 9, disorot, Modul 1 sampai 8 bertanda selesai, dan Modul 9 ditandai KAMU DI SINI dengan catatan catu daya, tidur, dan checkpoint Fase 1. Bawah, kotak Modul 9 minggu ini, sekitar 8 sampai 10 jam yang dicicil, ditambah INA219, 18650, TP4056, MT3608, dan ESP32 kedua, berisi sepuluh hal: KC, Kemenangan Cepat, ESP32 tidur dan bangun sendiri; P1, Node 1 tanpa laptop, adaptor sendiri; P2, tiga ingatan: RAM, memori RTC, NVS; P3, bangun oleh tombol, lalu tidur ringan; P4, kerangka Node 2 di papan kedua; P5, rakit catu baterai 18650 ke TP4056 ke MT3608; P6, Node 1 jadi alat ukur arus (INA219); P7, uji power bank: mati sendiri?; P8, simpan sketsa dan catatan ke GitHub; dan tanda plus, Tambahan: Node 1 24 jam dari adaptor dan checkpoint. Tanda bintang menandai P6 dan uji 24 jam sebagai syarat lulus](aset/peta-jalan-modul-09.png)

> [!NOTE]
> **Cara memakai modul ini.**
>
> - Minggu ini ada **dua papan ESP32**. **Papan Node 1** adalah papan di meja kerjamu sejak Modul 2. **Papan kedua** adalah calon Node 2. Setiap langkah selalu menyebut papan mana yang dipakai.
> - Setiap kotak kode punya tombol salin di pojok kanan atasnya. Semua sketsa juga tersedia sebagai file di folder [`kode/`](kode/).
> - Kotak yang didahului kata **Hasilnya** hanya untuk dicocokkan, bukan diketik.
> - **Wokwi belum bisa menjalankan *deep sleep* (tidur dalam) sketsa Arduino ESP32 dengan benar.** Saat modul ini diuji (Oktober 2026), sketsa yang memanggil `esp_deep_sleep_start()` membuat papan simulasi langsung *restart* dengan pesan `rst:0x8 (TG1WDT_SYS_RESET)`, bukan tidur. Karena itu, Kemenangan Cepat dan sebagian besar praktik minggu ini dikerjakan di papan asli. Yang bisa dicoba di Wokwi hanya *light sleep* (tidur ringan) dengan alarm timer di Praktik 3B. Arus listrik juga tidak bisa diukur di simulator. Belum punya kitnya? Baca konsepnya dulu, lalu kerjakan praktiknya begitu barangnya datang.
> - Kotak **Hasilnya** untuk sketsa *deep sleep* dan pengukur arus adalah **contoh keluaran di papan asli**, bukan rekaman Wokwi: keluaran *deep sleep* disusun dari dokumentasi dan contoh resmi Espressif, sedangkan angka pengukur arus mengikuti hasil ukur papan sejenis yang dikutip di 📚. Angka di papanmu pasti sedikit berbeda. Baris-baris dari ROM papan (yang diawali `ets`, `rst:`, `load:`, dan seterusnya) sebagian diringkas dengan `…`, dan tanggal di baris `ets` bisa berbeda di papanmu.
> - Pengguna macOS: ganti **Ctrl** dengan **Cmd** untuk menyimpan, memilih semua, menyalin, dan menempel.

> [!WARNING]
> **Aturan keselamatan minggu ini.** Baterai Li-ion menyimpan energi yang besar. Baterai yang korsleting atau rusak bisa sangat panas, mengeluarkan asap, bahkan terbakar.
>
> 1. **Jangan pernah menyambung kutub (+) dan (−) baterai secara langsung**, termasuk lewat benda logam (obeng, kunci, perhiasan, penjepit kertas). Simpan baterai di tempatnya, bukan di saku atau di laci bersama barang logam.
> 2. **Jangan memakai baterai yang penyok, bocor, menggembung, atau pembungkus plastiknya robek.** Jangan menusuk, membanting, atau membakarnya. Baterai bekas dibuang ke tempat penampungan limbah elektronik, bukan ke tempat sampah biasa.
> 3. **Perhatikan kutub saat memasang baterai ke dudukannya** (tanda + di dudukan bertemu ujung + baterai yang menonjol). Kutub terbalik bisa langsung merusak modul pengisi dan membuat baterai panas.
> 4. **Isi baterai hanya sambil ditunggui**, di atas permukaan yang tidak mudah terbakar (ubin, piring keramik), jauh dari sinar matahari langsung dan benda yang mudah terbakar. Raba baterainya sesekali: hangat masih wajar, **panas** berarti cabut *charger*-nya, jauhkan baterai dari benda mudah terbakar, dan jangan dipakai lagi.
> 5. **Atur modul MT3608 ke 5,0 V dengan multimeter sebelum menyambungkannya ke papan ESP32.** Setelan pabriknya tidak bisa ditebak, dan modul ini sanggup mengeluarkan sampai 28 V.
> 6. **Satu papan ESP32, satu sumber listrik.** Papan yang diberi 5 V lewat pin VIN tidak boleh sekaligus dicolokkan ke USB. **Pin 3V3 tidak pernah diberi 5 V, dan tidak pernah diberi baterai** (baterai penuh bertegangan 4,2 V, sedangkan chip ESP32 hanya tahan sekitar 3,6 V).
> 7. **Multimeter hanya dipakai di posisi tegangan (V⎓) minggu ini, dengan *probe* merah di lubang VΩmA.** Lubang 10A (yang dipakai untuk mengukur arus di Modul 5) tidak dipakai minggu ini. Jangan menempelkan *probe* ke kutub baterai saat multimeter di posisi arus (A atau mA) atau saat *probe* merah masih di lubang 10A: itu sama dengan menyambung kedua kutub langsung.
>
> Aturan emas catu daya Modul 5 tetap berlaku untuk Node 1.

Ritme modul ini sama dengan Modul 1–8. Bagian lipat di 🚨 (klik judulnya) cukup dibuka saat kamu membutuhkannya; bagian lipat di 🔬 boleh dilewati. Setiap praktik diawali kotak **🖥️** yang menyebut alat dan komponen yang dipakai.

## Daftar isi

1. [🎯 Setelah modul ini kamu bisa…](#-setelah-modul-ini-kamu-bisa)
2. [🧰 Yang perlu disiapkan](#-yang-perlu-disiapkan)
3. [🏆 Kemenangan Cepat: ESP32 tidur dan bangun sendiri (10 menit)](#-kemenangan-cepat-esp32-tidur-dan-bangun-sendiri-10-menit)
4. [🧠 Konsep "Mengapa"](#-konsep-mengapa)
   - [1 Tiga pintu listrik](#1-tiga-pintu-listrik-papan-esp32-usb-vin-dan-3v3) · [2 Adaptor & *power bank*](#2-adaptor-dan-power-bank-sama-sama-5-v-wataknya-berbeda) · [3 *Brownout*](#3-brownout-saat-tegangan-sesaat-anjlok) · [4 Tidur](#4-tidur-aktif-tidur-ringan-dan-tidur-dalam) · [5 Tiga ingatan](#5-tiga-ingatan-ram-memori-rtc-dan-nvs) · [6 Baterai 18650](#6-baterai-li-ion-18650-tegangannya-berubah-kapasitasnya-sering-dilebih-lebihkan) · [7 TP4056 & MT3608](#7-tp4056-dan-mt3608-pengisi-dan-penaik-tegangan) · [8 Mengukur arus](#8-mengukur-arus-ina219-bukan-multimeter) · [9 Umur baterai](#9-menghitung-umur-baterai) · [10 Jujur soal DevKit V1](#10-jujur-soal-devkit-v1-mengapa-baterainya-hanya-tahan-beberapa-hari)
5. [🔧 Praktik langkah demi langkah](#-praktik-langkah-demi-langkah)
   - [1 Node 1 tanpa laptop](#praktik-1--node-1-tanpa-laptop-adaptor-sendiri-20-menit) · [2 Tiga ingatan](#praktik-2--tiga-ingatan-ram-memori-rtc-dan-nvs-20-menit) · [3 Bangun & tidur ringan](#praktik-3--bangun-oleh-alarm-atau-tombol-dan-tidur-ringan-30-menit) · [4 Kerangka Node 2](#praktik-4--kerangka-node-2-di-papan-kedua-25-menit) · [5 Catu baterai](#praktik-5--rakit-catu-baterai-18650--tp4056--mt3608-40-menit) · [6 Ukur arus ⭐](#praktik-6--node-1-jadi-alat-ukur-arus-ina219-45-menit) · [7 *Power bank*](#praktik-7--uji-power-bank-mati-sendiri-15-menit) · [8 GitHub](#praktik-8--simpan-ke-github-15-menit)
6. [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)
7. [🔬 Bedah Teknis (opsional)](#-bedah-teknis-opsional)
8. [🧩 Tantangan mandiri](#-tantangan-mandiri)
9. [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini)
10. [📖 Glosarium](#-glosarium) · [📝 Kuis](#-kuis-5-soal) · [✅ Checklist kelulusan](#-checklist-kelulusan-modul-9)
11. [📚 Sumber & atribusi gambar](#-sumber--atribusi-gambar)

---

## 🎯 Setelah modul ini kamu bisa…

- **Memberi listrik ke Node 1 tanpa laptop** dengan aman, dan tahu kapan memakai colokan USB, pin VIN, atau pin 3V3 (dan kapan tidak boleh).
- **Menjelaskan dua jebakan catu daya**: *power bank* yang mati sendiri dan tegangan yang anjlok (*brownout*), lalu mencegahnya.
- **Merakit catu baterai** 18650 → TP4056 → MT3608 → VIN dengan aman, termasuk mengatur MT3608 ke 5,0 V dengan multimeter.
- **Membuat ESP32 tidur** (*deep sleep* dan *light sleep*) dan bangun sendiri oleh alarm timer atau tombol.
- **Memilih tempat menyimpan data** di perangkat yang tidur: RAM, memori RTC, atau NVS.
- **Mengukur arus** saat bangun dan saat tidur dengan modul INA219, lalu **menghitung umur baterai** sendiri.
- **Menjelaskan dengan jujur** mengapa papan ESP32 DevKit V1 tidak cocok untuk perangkat berbaterai yang harus bertahan berbulan-bulan, dan apa pilihan lainnya.
- **Menuntaskan *checkpoint* Fase 1**: Node 1 hidup 24 jam dari adaptor, dan kerangka Node 2 siap dipakai di Modul 14.

---

## 🧰 Yang perlu disiapkan

| Apa | Keterangan |
| :--- | :--- |
| **Meja kerja Node 1 dari Modul 8** | Lengkap, dengan firmware Node 1 v1.0. **Biarkan semuanya terpasang.** |
| **Adaptor untuk papan Node 1** | ***Charger* HP 5 V bermerek, minimal 1 A**, dengan kabel USB yang cocok dengan colokan papan ESP32-mu (kabel data dari Modul 2 juga boleh). Kalau uji 24 jam Modul 8 sudah memakai *charger*, pakai yang sama. **Bukan** *power bank* (Konsep 2). |
| **Papan ESP32 DevKit V1 kedua + kabel USB data kedua** | Dari Kit A Tahap 2. Papan inilah calon Node 2. |
| **Modul INA219** | Pengukur arus dan tegangan ber-I2C. Pilih yang **kakinya (*header*) sudah tersolder**, sama seperti layar OLED dan BME280 di Modul 7. |
| **Baterai Li-ion 18650 + dudukan (*holder*) 18650 berkabel** | Baterai asli dari toko yang tepercaya, kapasitas 2.000–3.500 mAh. Hindari baterai bertuliskan 6.000–9.900 mAh: baterai 18650 sebesar itu tidak ada (Konsep 6). Pilih baterai **tanpa proteksi** (panjangnya sekitar 65 mm): proteksinya sudah ada di TP4056, sedangkan baterai berproteksi (sekitar 70 mm) sering tidak muat di dudukan biasa. Dudukan untuk satu baterai, dengan dua kabel yang ujungnya sebaiknya sudah dilapisi timah (mengilap dan kaku). |
| **Modul pengisi TP4056 dengan proteksi** | Versi **6 bantalan** (dua untuk listrik masuk, B+ dan B− untuk baterai, OUT+ dan OUT− untuk beban), dengan colokan USB-C atau micro-USB. Versi 4 bantalan tidak punya proteksi: jangan dibeli. |
| **Modul penaik tegangan MT3608** | Modul kecil dengan potensiometer biru bersekrup kuningan. Untuk TP4056 dan MT3608, pilih yang **kakinya (*header*) sudah tersolder**, atau minta penjual menyolderkannya. Jarak kaki kedua modul ini tidak cocok dengan jarak lubang breadboard, jadi modulnya **tidak ditancapkan**: setiap kakinya disambung dengan kabel jantan–betina. |
| ***Charger* HP kedua (atau yang tadi, bergantian)** | Untuk mengisi baterai lewat colokan TP4056, dengan kabel yang cocok dengan colokan TP4056-mu (USB-C atau micro-USB; kabel cas biasa sudah cukup). |
| **Breadboard mini 400 titik** | Barang baru yang murah. Rangkaian baterai dirakit di sini, dan breadboard ini dipakai lagi untuk Node 2 di Modul 14. |
| **Kabel jumper** | Sekitar **16 kabel jantan–betina** (10 untuk rangkaian baterai, 6 untuk INA219), 3 **jantan–jantan** (2 sebagai titik ukur multimeter di Praktik 5, 1 untuk GND bersama di Praktik 6), dan 3 **betina–betina** (untuk DS18B20). |
| **DS18B20 tahan air + modul adaptornya** | Disimpan sejak Modul 7 untuk Node 2. |
| **Kapasitor elektrolit 100 µF** | Sisa paket Kit A (yang satu lagi sudah terpasang di meja kerja sejak Modul 5). Opsional, tetapi disarankan (Konsep 3). |
| **Multimeter** | Dari Modul 2, di posisi **V⎓ 20**. Juga **obeng kecil** (obeng minus) untuk sekrup potensiometer MT3608. |
| ***Power bank*** (opsional) | Hanya untuk Praktik 7. Pakai yang kamu punya. |
| **Kertas + pensil (atau file catatan)** | Untuk mencatat hasil ukur dan menghitung umur baterai. |

**Versi yang dipakai di modul ini:**

| Alat | Versi | Catatan |
| :--- | :--- | :--- |
| Arduino IDE | **2.3.x** (saat ditulis: 2.3.10) | Sejak Modul 2. |
| Paket papan **esp32 by Espressif Systems** | **3.3.x** (saat ditulis: 3.3.12) | Sejak Modul 2. Fungsi tidur (`esp_sleep_…`, `esp_deep_sleep_start()`) sudah ikut di dalamnya. |
| Library **Adafruit INA219** | **1.2.3** | Baru minggu ini (Praktik 6). **Library Manager** menawarkan beberapa library pendamping; **Adafruit BusIO** yang benar-benar dipakai sudah terpasang sejak Modul 7. |
| Library **OneWire** dan **DallasTemperature** | **2.3.8** dan **4.0.6** | Sudah terpasang sejak Modul 7 (Praktik 4). |

> [!TIP]
> **Belanja untuk minggu ini.** Daftar Kit A di Silabus sudah memuat INA219 dan satu set baterai 18650 + TP4056 + MT3608. Yang mungkin belum kamu punya hanyalah breadboard mini, kabel jumper betina–betina, dan tambahan kabel jantan–betina. Papan ESP32 kedua juga bagian dari Tahap 2 dan sudah dipakai mulai Praktik 4; kalau belum punya, pesan sekarang. Saat memesan, tanyakan kepada penjual apakah TP4056, MT3608, dan INA219-nya sudah dipasangi kaki. Kalau belum, banyak penjual mau menyolderkannya dengan biaya kecil.

---

## 🏆 Kemenangan Cepat: ESP32 tidur dan bangun sendiri (10 menit)

Sejak Modul 2, papan ESP32-mu tidak pernah beristirahat: begitu menyala, ia terus bekerja sampai listriknya dicabut. Sekarang kita suruh ia tidur 5 detik, bangun sendiri, berkedip sekali, lalu tidur lagi, sambil menghitung sudah berapa kali ia bangun.

> 🖥️ **Alat yang dipakai di bagian ini:** **Arduino IDE** dan **Serial Monitor**, **papan Node 1** yang dicolokkan ke laptop, dengan **MB102 dimatikan**. LED status D4 di meja kerja menjadi tanda "aku bangun". Wokwi belum bisa menyimulasikan *deep sleep*, jadi bagian ini dikerjakan di papan asli.

1. **Matikan MB102** (tekan tombol dayanya sampai LED MB102 padam; kalau tombolmu tidak memutus jalur USB, cabut kabel A–A-nya seperti di Modul 5). Beban seperti relay, pompa, dan servo tidak dipakai di praktik tidur. Colokkan kabel USB papan Node 1 ke laptop.
2. Di Arduino IDE, buka **File → New Sketch**, hapus isinya, lalu tempel kode ini. Simpan dengan nama `modul09_tidur_pertama` di folder `modul-09` repositori `belajar-iot` (buat foldernya kalau belum ada, seperti modul-modul sebelumnya).

   ```cpp
   // Modul 9 - Kemenangan Cepat: ESP32 tidur 5 detik, bangun sendiri, lalu tidur lagi
   // Rangkaian: LED status di D4 (lewat resistor 220 ohm). Tombol D13 belum dipakai di sini.
   // Setiap kali bangun, LED berkedip sekali dan Serial mencetak sudah berapa kali papan bangun.

   const int PIN_LED_STATUS = 4;
   const unsigned long LAMA_TIDUR_DETIK = 5;  // lama tidur, dalam detik

   RTC_DATA_ATTR int jumlahBangun = 0;  // disimpan di memori RTC: tetap ada selama deep sleep

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_LED_STATUS, OUTPUT);

     jumlahBangun++;
     Serial.print("Bangun ke-");
     Serial.print(jumlahBangun);
     if (esp_sleep_get_wakeup_cause() == ESP_SLEEP_WAKEUP_TIMER) {
       Serial.println(": dibangunkan alarm timer.");
     } else {
       Serial.println(": baru dinyalakan.");
     }

     digitalWrite(PIN_LED_STATUS, HIGH);  // kedip singkat: tanda "aku bangun"
     delay(200);
     digitalWrite(PIN_LED_STATUS, LOW);

     Serial.printf("Tidur %lu detik... sampai jumpa!\n", LAMA_TIDUR_DETIK);
     Serial.flush();  // tunggu sampai semua huruf terkirim, baru tidur
     esp_sleep_enable_timer_wakeup(LAMA_TIDUR_DETIK * 1000000ULL);  // satuannya mikrodetik
     esp_deep_sleep_start();  // tidur sekarang; saat bangun, program mulai lagi dari setup()
   }

   void loop() {
     // Tidak pernah dijalankan: setelah deep sleep, papan selalu mulai lagi dari setup().
   }
   ```

3. Pastikan papan yang terpilih **DOIT ESP32 DEVKIT V1** dan port-nya benar, lalu klik **Upload**. Begitu `Done uploading` muncul, buka **Serial Monitor** (**115200 baud**).
4. Perhatikan LED status di D4: setiap 5 detik ia **berkedip sekali**. Di antara kedipan itu, ESP32 sedang tidur.

   **Hasilnya** (contoh keluaran di papan asli; baris ROM diringkas). Baris `Bangun ke-1` bisa sudah lewat sebelum Serial Monitor terbuka; tidak apa-apa kalau layarmu baru mulai dari `Bangun ke-2`:

   ```text
   rst:0x1 (POWERON_RESET),boot:0x13 (SPI_FAST_FLASH_BOOT)
   …
   Bangun ke-1: baru dinyalakan.
   Tidur 5 detik... sampai jumpa!
   ets Jul 29 2019 12:21:46

   rst:0x5 (DEEPSLEEP_RESET),boot:0x13 (SPI_FAST_FLASH_BOOT)
   …
   Bangun ke-2: dibangunkan alarm timer.
   Tidur 5 detik... sampai jumpa!
   ets Jul 29 2019 12:21:46

   rst:0x5 (DEEPSLEEP_RESET),boot:0x13 (SPI_FAST_FLASH_BOOT)
   …
   Bangun ke-3: dibangunkan alarm timer.
   Tidur 5 detik... sampai jumpa!
   ```

Selamat — ESP32-mu baru saja tidur dan bangun sendiri. Perhatikan tiga hal:

- **Setiap kali bangun, papan mulai lagi dari `setup()`**, seperti baru dinyalakan. Baris-baris ROM (`ets …`, `rst:…`) ikut tercetak lagi. Alasan menyalanya kini `rst:0x5 (DEEPSLEEP_RESET)`: "bangun dari tidur dalam". Pada sketsa *deep sleep*, `loop()` tidak pernah dijalankan.
- **`jumlahBangun` tetap ingat hitungannya**, padahal semua variabel biasa terhapus setiap kali papan bangun. Rahasianya adalah kata `RTC_DATA_ATTR`: variabel itu disimpan di **memori RTC** (RTC: *real-time clock*, jam waktu nyata), bagian kecil chip yang tetap menyala selama tidur (Konsep 5).
- **Dua baris sebelum tidur penting.** `esp_sleep_enable_timer_wakeup()` memasang alarm (satuannya **mikrodetik**: 5 detik = 5.000.000 µs, ditulis `LAMA_TIDUR_DETIK * 1000000ULL`, yaitu 5 × 1.000.000), sedangkan `Serial.flush()` menunggu semua huruf terkirim. Di papan ini, perintah tidur sebenarnya juga menunggu huruf terakhir terkirim, tetapi `flush()` tetap kebiasaan baik yang dipakai contoh resmi Espressif: di jenis tidur atau papan lain, kalimat terakhir bisa terpotong atau baru muncul setelah papan bangun.

Tekan tombol **EN** di papan ESP32: hitungannya kembali ke `Bangun ke-1: baru dinyalakan.` Tombol EN sama dengan mencabut lalu memasang lagi listriknya, dan isi memori RTC ikut terhapus. Di Praktik 2, kamu akan melihat ketiga "ingatan" ESP32 berdampingan.

Biarkan sketsa ini berjalan dulu; kita lanjut ke konsep. Kalau ingin berhenti, cabut saja USB-nya: papan yang sedang tidur tidak perlu "dibangunkan" dulu sebelum dicabut.

## 🧠 Konsep "Mengapa"

Sepuluh konsep, satu per bagian — **tidak perlu dibaca sekaligus**. Konsep dan praktik dikerjakan berselang-seling dengan urutan ini:

1. Konsep 1–3 → Praktik 1 (Node 1 tanpa laptop)
2. Konsep 4–5 → Praktik 2–4 (tiga ingatan, bangun oleh tombol, tidur ringan, dan kerangka Node 2)
3. Konsep 6–7 → Praktik 5 (catu baterai)
4. Konsep 8–10 → Praktik 6–8 (mengukur arus dan menghitung umur baterai, uji *power bank*, dan GitHub)
5. 🧩 Tantangan → ➕ Rumah Pintar Mini (Node 1 permanen dari adaptor, kerangka Node 2, dan *checkpoint* Fase 1) → 📝 Kuis → ✅ Checklist

Di setiap titik pindah ada kotak ➡️ (maju ke praktik) dan ⬆️ (kembali ke konsep) yang tautannya tinggal diklik.

> 🖥️ **Perlu mencoba kode di bagian Konsep?** Tidak wajib — semua kode akan kamu jalankan di Praktik. Kode di bagian Konsep hanya potongan; versi utuhnya ada di sketsa Praktik dan di folder [`kode/`](kode/). Ingat, sebagian besar sketsa minggu ini memakai *deep sleep*, jadi dijalankan di papan asli, bukan di Wokwi.

### 1. Tiga pintu listrik papan ESP32: USB, VIN, dan 3V3

Sejak Modul 2, listrik papan ESP32-mu selalu masuk lewat satu jalan: kabel USB dari laptop. Sebenarnya, papan DevKit V1 punya **tiga pintu** tempat listrik bisa masuk. Ketiganya berujung di tempat yang sama, yaitu chip ESP32 yang hanya mau **3,3 V**, tetapi jalan yang dilaluinya berbeda.

![Diagram tiga pintu listrik papan ESP32 DevKit V1; ketiganya berujung di chip ESP32 yang hanya mau 3,3 volt. Atas, jalan listrik di dalam papan dari kiri ke kanan: colokan USB, 5 volt masuk (pintu 1); dioda, pintu satu arah; jalur 5 volt yang bercabang ke pin VIN di tepi papan (pintu 2); regulator AMS1117-3.3 yang butuh masukan sekitar 4,5 volt atau lebih; jalur 3,3 volt yang bercabang ke pin 3V3 (pintu 3), LED merah, dan chip USB-serial; lalu chip ESP32 dan memori flash yang hanya tahan sampai 3,6 volt. Catatan: semua pin GND tersambung jadi satu. Bawah, tiga kartu aturan. Pintu 1, colokan USB: boleh laptop, charger HP 5 volt, atau power bank; dioda menahan listrik dari VIN supaya tidak mengalir balik ke laptop; minggu ini untuk Node 1 dari charger-nya sendiri. Pintu 2, pin VIN: boleh 5 volt yang stabil, misalnya MT3608 5,0 volt; jangan baterai Li-ion langsung (3,0 sampai 4,2 volt) dan jangan bersamaan dengan kabel USB; minggu ini untuk papan kedua dari baterai. Pintu 3, pin 3V3: jangan 5 volt dari mana pun dan jangan baterai Li-ion langsung (sampai 4,2 volt) karena pin ini masuk sesudah regulator, tanpa penjaga; minggu ini hanya keluaran 3,3 volt untuk sensor](aset/tiga-pintu-listrik.png)

Ikuti jalan listriknya dari colokan USB:

1. **Colokan USB** menerima 5 V dari laptop atau *charger*. Listrik itu lebih dulu melewati sebuah **dioda** (Modul 2), "pintu satu arah" yang mencegah listrik dari pin VIN mengalir balik ke laptop. Dioda ini memakan beberapa persepuluh volt.
2. Sesudah dioda, listrik tiba di **jalur 5 V** papan. Jalur inilah yang tersambung ke **pin VIN**. Itu sebabnya VIN terbaca "sekitar 5 V", sedikit di bawahnya, saat papan dicolokkan ke laptop.
3. Jalur 5 V masuk ke **regulator** AMS1117-3.3, komponen hitam kecil berkaki tiga di dekat colokan USB. Tugasnya menurunkan tegangan menjadi **3,3 V** yang tenang dan rata, berapa pun tegangan masukannya (asal cukup).
4. Hasilnya tiba di **jalur 3,3 V**, yang tersambung ke **pin 3V3**, chip ESP32, memori *flash*, LED merah tanda menyala, dan chip USB-serial (chip penerjemah USB dari Modul 2).

Karena jalannya berbeda, setiap pintu punya aturannya sendiri:

| Pintu | Masuk ke | Boleh diberi | Jangan pernah | Di modul ini |
| :--- | :--- | :--- | :--- | :--- |
| **Colokan USB** | sebelum dioda | 5 V dari laptop, *charger* HP, atau *power bank* | — | Node 1, dari *charger*-nya sendiri (Praktik 1 dan ➕ A) |
| **Pin VIN** | jalur 5 V, sesudah dioda | 5 V yang stabil dari sumber lain (minggu ini: MT3608 yang diatur 5,0 V) | baterai Li-ion langsung; sumber lain **saat** USB juga tercolok | papan kedua, dari baterai lewat MT3608 (Praktik 5) |
| **Pin 3V3** | jalur 3,3 V, **sesudah** regulator (tanpa penjaga) | hanya 3,3 V yang sudah diatur | 5 V; baterai Li-ion langsung (sampai 4,2 V) | **bukan pintu masuk**: hanya keluaran untuk sensor kecil, seperti sejak Modul 5 |

Tiga hal yang perlu diingat:

- **Regulator butuh "ruang napas".** AMS1117 baru bisa mengeluarkan 3,3 V yang tenang kalau masukannya lebih tinggi sekitar 1,1 V (lembar datanya menjamin paling banyak 1,3 V), jadi masukannya perlu sekitar **4,5 V** ke atas. Kalau masukannya hanya 3,7 V (baterai Li-ion), keluarannya ikut turun di bawah 3,3 V, dan ESP32 bisa *restart* sendiri saat sibuk. Inilah alasan Silabus menulis "regulator DevKit butuh ≥ 4,5 V", dan alasan kita memasang penaik tegangan MT3608 di Konsep 7.
- **Pin 3V3 tidak punya penjaga.** Listrik yang masuk lewat pin ini langsung menuju chip ESP32 tanpa melewati regulator. Chip ESP32 hanya tahan sampai sekitar **3,6 V**, sedangkan baterai Li-ion yang penuh bertegangan **4,2 V**. Satu kabel ke pin yang salah sudah cukup untuk merusaknya.
- **Satu papan, satu sumber listrik.** Papan yang mendapat listrik lewat VIN tidak dicolokkan ke USB pada saat yang sama. Dioda di jalur USB memang menahan sebagian masalah, tetapi dua sumber yang tegangannya sedikit berbeda tetap bisa saling mendorong. Mau mengunggah program ke papan yang sedang hidup dari baterai? Cabut dulu kabel VIN dan GND-nya, baru colokkan USB.

Untuk **Node 1**, kita memilih jalan paling sederhana: **tetap lewat colokan USB**, hanya laptopnya yang diganti dengan *charger* HP. Tidak ada kabel baru, jalur listriknya tidak berubah, dan semua aturan emas Modul 5 tetap berlaku. Pin VIN baru kita pakai untuk **papan kedua** yang hidup dari baterai.

### 2. Adaptor dan *power bank*: sama-sama 5 V, wataknya berbeda

Sumber 5 V ber-USB yang paling mudah didapat ada dua: ***charger* HP** (adaptor) dan ***power bank***. Keduanya mengeluarkan 5 V, tetapi wataknya berbeda.

**Adaptor (*charger* HP)** mengubah listrik PLN 220 V menjadi 5 V. Selama stopkontaknya menyala, ia terus memberi listrik, berapa pun arus yang diminta, dari nol sampai batasnya. Cara memilihnya untuk Node 1:

- **Keluaran 5 V, minimal 1 A.** Angkanya tertulis di badan *charger*, misalnya "Output: 5V⎓2A". Espressif, pembuat ESP32, menyarankan sumber yang sanggup memberi **paling sedikit 500 mA** karena saat WiFi mengirim data (mulai Modul 10) arusnya melonjak sesaat sampai ratusan mA. *Charger* 1 A sudah lega.
- ***Charger* pengisian cepat (*fast charging*, misalnya QC atau PD) juga boleh.** *Charger* jenis ini selalu mulai dari 5 V, dan baru menaikkan tegangannya (9 V, 12 V) kalau perangkatnya memintanya lewat "tawar-menawar" khusus. Papan ESP32 tidak pernah meminta, jadi tetap mendapat 5 V.
- **Bermerek dan tidak rusak.** *Charger* murahan tanpa merek sering memberi tegangan yang naik-turun dan isolasinya buruk. Untuk perangkat yang menyala 24 jam sehari, pilih yang bagus.
- **Kabelnya juga penting.** Kabel USB yang panjang dan tipis "memakan" beberapa persepuluh volt saat arusnya besar. Pakai kabel yang pendek dan tidak murahan.

***Power bank*** (bank daya) berisi baterai Li-ion, ditambah rangkaian yang menaikkan tegangannya menjadi 5 V. Untuk mengisi HP, *power bank* sangat praktis. Untuk ESP32, ada **jebakan**: kebanyakan *power bank* **mematikan diri sendiri** kalau arus yang ditarik terlalu kecil. Ambangnya berbeda-beda: hasil uji beberapa *power bank* menunjukkan batas antara sekitar 10 dan 150 mA, dan *power bank* padam setelah sekitar 10–20 detik di bawah batas itu. Ini fitur hemat baterai: *power bank* menyangka HP-nya sudah penuh atau sudah dicabut.

Masalahnya, papan ESP32 yang sedang tidur hanya menarik beberapa mA, jauh di bawah ambang itu. Akibatnya, setelah tidur sebentar, papanmu tidak pernah bangun lagi karena *power bank*-nya sudah padam. Bahkan papan yang terus bangun tanpa WiFi (sekitar 55–65 mA) bisa terkena jebakan ini di sebagian *power bank*. Di Praktik 7, kamu mengujinya sendiri.

![Diagram jebakan power bank: mati sendiri saat arusnya kecil, dengan contoh papan ESP32 yang bangun 1 detik lalu tidur 30 detik; batas dan waktunya berbeda di setiap power bank. Atas, adaptor (charger HP), bertanda centang: grafik arus 0 sampai 70 detik dengan lonjakan bangun sekitar 55 miliampere pada detik ke-2, ke-33, dan ke-64, di antaranya tidur sekitar 5 miliampere; adaptor terus memberi listrik, berapa pun arusnya. Bawah, power bank, bertanda silang, yang menyangka HP-nya sudah penuh, lalu mematikan diri: garis putus-putus merah batas power bank, contohnya 30 miliampere; setelah bangun pada detik ke-2, arus tidur di bawah batas selama sekitar 15 detik, lalu pada detik ke-18 power bank padam dan arusnya menjadi nol; kotak putus-putus pada detik ke-33 dan ke-64 menandai papan yang tidak pernah bangun lagi. Catatan bawah: hasil uji beberapa power bank, batasnya sekitar 10 sampai 150 miliampere, dan padam setelah sekitar 10 sampai 20 detik di bawah batas itu; papan yang tidur hanya menarik beberapa miliampere](aset/jebakan-power-bank.png)

| | Adaptor (*charger* HP) | *Power bank* | Baterai 18650 + TP4056 + MT3608 |
| :--- | :--- | :--- | :--- |
| Sumber energinya | listrik PLN | baterai di dalamnya | baterai 18650 |
| Butuh stopkontak? | ya, terus-menerus | hanya saat diisi ulang | hanya saat diisi ulang |
| Mati sendiri saat arusnya kecil? | tidak | **sering ya** | tidak |
| Cocok untuk | **Node 1** (selalu dekat stopkontak) | mengisi HP; uji singkat | **Node 2** (di kebun, Modul 14) |

> [!NOTE]
> **Node 1 tidak pernah tidur.** Node 1 menjaga relay lampu, pompa, dan nanti WiFi serta MQTT, jadi ia harus selalu bangun dan selalu mendapat listrik dari adaptor. Semua yang kita pelajari tentang tidur di modul ini ditujukan untuk perangkat bertenaga baterai seperti Node 2.

### 3. *Brownout*: saat tegangan sesaat anjlok

Di Modul 5, kamu sudah bertemu tulisan `Brownout detector was triggered`. Penyebabnya waktu itu adalah kipas yang mengambil listrik dari USB laptop. Kali ini kita bahas lebih dalam karena minggu ini ESP32 akan hidup dari sumber yang lebih lemah daripada laptop: baterai.

***Brownout*** (tegangan anjlok) terjadi saat tegangan jalur 3,3 V turun sesaat di bawah batas aman, yang pada setelan bawaan paket esp32 bernilai sekitar **2,43 V**. (Modul 5 menyebut 2,4–2,8 V karena batas ini bisa diatur di rentang itu.) Begitu itu terjadi, **detektor *brownout*** di dalam chip ESP32 sengaja me-*restart* papan supaya chip tidak bekerja ngawur dengan tegangan yang kurang. Setelah menyala lagi, halaman status Node 1 v1.0 menulis `Restart: BROWNOUT`. Kalau tegangannya jatuh sangat dalam sampai chip benar-benar padam, yang tercatat malah `POWERON`.

Dari mana anjloknya? ESP32 tidak menarik arus dengan rata. Saat bekerja biasa, ia menarik puluhan mA; saat WiFi mengirim data, arusnya melonjak sampai **ratusan mA** dalam waktu sangat singkat. Setiap bagian di jalan listriknya punya sedikit hambatan: kabel yang panjang dan tipis, sambungan yang longgar, dioda, dan regulator. Ingat Hukum Ohm dari Modul 2: semakin besar arusnya, semakin banyak tegangan yang "dimakan" setiap hambatan. Kalau jumlahnya cukup besar, sisa tegangan untuk chip jatuh di bawah batas.

![Diagram brownout: setiap hambatan di jalan memakan sedikit tegangan, dan makin besar arusnya, makin banyak tegangan yang hilang di jalan; angkanya hanya contoh; pita merah menandai batas brownout sekitar 2,4 sampai 2,8 volt. Kiri, adaptor bagus, kabel pendek, arus biasa: charger 5 volt, sesudah kabel 4,95 volt (berkurang 0,05), sesudah dioda 4,65 volt (berkurang 0,3), lalu regulator memberi chip ESP32 3,3 volt; tanda centang, tetap 3,3 volt, aman. Kanan, sumber lemah, kabel panjang, arus melonjak: charger 4,6 volt, sesudah kabel 3,9 volt (berkurang 0,7), sesudah dioda 3,5 volt (berkurang 0,4), lalu regulator hanya bisa memberi chip 2,3 volt, di bawah pita merah; tanda silang, jatuh di bawah batas, papan restart. Bawah, tiga obatnya: 1, sumber dan kabel yang kuat (adaptor minimal 1 ampere, kabel pendek; MT3608 diatur 5,0 volt); 2, pisahkan beban (relay, pompa, servo tetap dari MB102); 3, kapasitor 100 mikrofarad sebagai tandon kecil di dekat pintu masuk listrik](aset/brownout-tangga.png)

Ada tiga obat, dari yang paling penting:

1. **Sumber dan kabel yang kuat.** Adaptor minimal 1 A, kabel pendek yang bagus, dan sambungan yang kencang. Untuk baterai: MT3608 diatur ke 5,0 V supaya regulator punya ruang napas (Konsep 1 dan 7).
2. **Pisahkan beban.** Relay, pompa, dan servo tetap dari MB102 (aturan emas nomor 1), jadi lonjakan arusnya tidak lewat jalur ESP32.
3. **Kapasitor penyangga.** Kapasitor elektrolit 100 µF di dekat pintu masuk listrik bekerja seperti "tandon kecil" (Modul 5): saat arus melonjak sesaat, kapasitor menyumbang dari isinya sehingga tegangannya tidak sempat anjlok. Di Praktik 5, kita memasangnya di keluaran MT3608.

> [!WARNING]
> **Jangan mematikan detektor *brownout*.** Di internet banyak beredar "obat" berupa satu baris kode yang mematikan detektor ini. Hasilnya, ESP32 memang tidak lagi *restart*, tetapi terus bekerja dengan tegangan kurang: isi memori bisa rusak, data ke *flash* bisa tertulis setengah jalan, dan perilakunya menjadi acak. Itu sama dengan mencabut alarm asap karena bunyinya mengganggu. Cari dan perbaiki penyebab tegangannya anjlok.

> ➡️ **Siap praktik?** Lanjut ke [Praktik 1 — Node 1 tanpa laptop](#praktik-1--node-1-tanpa-laptop-adaptor-sendiri-20-menit). Setelah selesai, kembali ke [Konsep 4](#4-tidur-aktif-tidur-ringan-dan-tidur-dalam).

### 4. Tidur: aktif, tidur ringan, dan tidur dalam

> ⬆️ **Baru selesai Praktik 1?** Node 1 kini bisa hidup tanpa laptop. Dua konsep berikutnya menyiapkan perangkat yang hidup dari baterai: cara **tidur**, dan apa yang **diingat** selama tidur.

Di Kemenangan Cepat, ESP32 tidur 5 detik lalu bangun sendiri. Sebenarnya, ESP32 punya beberapa tingkat tidur. Bayangkan seorang pegawai kantor:

- **Aktif**: ia bekerja penuh di mejanya. Semua lampu dan komputer menyala.
- **Tidur ringan (*light sleep*)**: ia tidur siang di kursinya. Semua berkas di meja tetap di tempatnya, dan begitu dibangunkan, ia langsung **melanjutkan** pekerjaan dari kalimat terakhir yang ditulisnya.
- **Tidur dalam (*deep sleep*)**: ia pulang ke rumah. Mejanya dibereskan dan lampu kantor dimatikan; yang ia bawa hanya **buku saku** kecil dan **jam weker**. Besok paginya, ia mulai lagi **dari awal**: membuka kantor, menyalakan komputer, lalu membaca buku sakunya untuk mengingat pekerjaan kemarin.

Di ESP32, "buku saku" itu adalah **memori RTC** (Konsep 5), dan "jam weker" adalah **alarm timer** yang tetap berdetak selama tidur. Mulai lagi dari awal berarti **mulai lagi dari `setup()`**, seperti yang kamu lihat di Kemenangan Cepat.

![Tabel bergambar tingkat tidur ESP32; makin dalam tidurnya, makin sedikit yang menyala; arus chip ESP32 saja menurut lembar data, pada skala yang naik sepuluh kali lipat setiap garis dari 0,001 sampai 1.000 miliampere. Empat baris. Aktif dengan WiFi, seperti bekerja sambil menelepon: prosesor, RAM, radio WiFi, alarm timer, dan memori RTC semuanya menyala; arus 95 sampai 240 miliampere. Aktif tanpa WiFi, seperti bekerja di meja: semuanya menyala kecuali radio; 20 sampai 68 miliampere. Tidur ringan, seperti tidur siang di kursi: prosesor dan RAM dijeda dengan isi tetap, radio mati, alarm timer dan memori RTC menyala; 0,8 miliampere; setelah bangun, program lanjut ke baris berikutnya. Tidur dalam, seperti pulang ke rumah: prosesor, RAM, dan radio mati, hanya alarm timer dan memori RTC yang menyala; 0,01 miliampere atau 10 mikroampere; setelah bangun, program mulai lagi dari setup(). Catatan bawah: papan DevKit V1 utuh jauh lebih boros saat tidur karena regulator, LED, dan chip USB-nya tidak ikut tidur (Konsep 10)](aset/tingkat-tidur.png)

| Keadaan | Yang tetap menyala | Arus chip ESP32 saja (menurut lembar data) | Setelah bangun, program… |
| :--- | :--- | :--- | :--- |
| **Aktif dengan WiFi** | semuanya, termasuk radio | sekitar 95–100 mA saat menerima, sampai sekitar 240 mA saat mengirim | — |
| **Aktif tanpa WiFi** | prosesor, RAM, dan semua periferal | sekitar 20–68 mA, bergantung pada kecepatan prosesor | — |
| **Tidur ringan** | RAM (isinya terjaga), alarm timer | sekitar 0,8 mA | **lanjut** dari baris sesudah `esp_light_sleep_start()` |
| **Tidur dalam** | hanya bagian RTC: alarm timer, memori RTC 8 KB, dan pin RTC | sekitar 0,01 mA (10 µA) | **mulai lagi** dari awal `setup()` |

Angka-angka ini untuk **chip ESP32 saja**. Papan DevKit V1 punya regulator, LED, dan chip USB yang tidak ikut tidur, jadi arus seluruh papan jauh lebih besar. Itulah yang kamu ukur di Praktik 6 dan bahas di Konsep 10.

**Membuat ESP32 tidur dalam** cukup tiga baris, seperti di Kemenangan Cepat:

```cpp
Serial.flush();                                   // tunggu semua huruf terkirim
esp_sleep_enable_timer_wakeup(30 * 1000000ULL);  // pasang alarm 30 detik (satuannya mikrodetik)
esp_deep_sleep_start();                           // tidur; baris di bawahnya tidak pernah dijalankan
```

`ULL` di belakang angka berarti "hitung dengan bilangan bulat yang sangat besar". Tanpa `ULL`, alarm yang lebih lama daripada sekitar 35 menit menghasilkan angka mikrodetik yang terlalu besar untuk bilangan bulat biasa sehingga alarmnya kacau.

**Tidur ringan** juga dipicu satu baris, `esp_light_sleep_start()`. Bedanya, baris itu **kembali** saat papan bangun, dan program lanjut ke baris berikutnya.

**Siapa yang boleh membangunkan?** Sebelum tidur, kamu memasang satu atau beberapa **pintu bangun** (*wake-up source*). Yang kita pakai minggu ini:

| Pintu bangun | Fungsinya | Untuk | Praktik |
| :--- | :--- | :--- | :--- |
| **Alarm timer** | `esp_sleep_enable_timer_wakeup(mikrodetik)` | tidur dalam dan tidur ringan | KC, 2, 3, 4 |
| **ext0**: satu pin RTC menjadi HIGH atau LOW | `esp_sleep_enable_ext0_wakeup(pin, 0 atau 1)` | tidur dalam | 3 |
| **GPIO**: pin mana pun menjadi HIGH atau LOW | `gpio_wakeup_enable(...)` lalu `esp_sleep_enable_gpio_wakeup()` | tidur ringan | 3B |

Masih ada pintu lain, misalnya **ext1** (beberapa pin RTC sekaligus) dan sentuhan (*touch*), tetapi alarm timer dan ext0 sudah cukup untuk Node 2. Setelah bangun, `esp_sleep_get_wakeup_cause()` memberi tahu pintu mana yang terbuka.

**Kapan memakai yang mana?**

- **Tidur dalam** untuk perangkat yang lama sekali menganggur di antara dua tugas singkat, misalnya sensor kebun yang membaca suhu setiap 30 detik sampai setiap jam. Inilah pola Node 2: **bangun → baca → (nanti: kirim) → tidur**.
- **Tidur ringan** untuk jeda pendek yang sering, saat program harus ingat banyak hal atau harus segera bereaksi.
- **Tidak tidur sama sekali** untuk perangkat yang harus selalu siap dan selalu mendapat listrik dari adaptor, seperti **Node 1**.

> [!NOTE]
> **Wokwi dan tidur.** Seperti disebut di awal modul, Wokwi belum bisa menyimulasikan *deep sleep*: papan simulasi langsung *restart* dengan pesan `rst:0x8 (TG1WDT_SYS_RESET)`, dan isi memori RTC hilang. *Light sleep* dengan alarm timer bisa dicoba (Praktik 3B), tetapi pintu bangun GPIO belum disimulasikan.

### 5. Tiga ingatan: RAM, memori RTC, dan NVS

Pegawai yang pulang ke rumah kehilangan isi mejanya, tetapi tetap membawa buku sakunya. ESP32 punya tiga tempat menyimpan angka, dan masing-masing selamat dari kejadian yang berbeda:

- **RAM** adalah **meja kerja**. Tempatnya luas dan cepat, dan semua variabel biasa tinggal di sini. Namun, isinya hilang setiap kali papan tidur dalam, *restart*, atau kehilangan listrik.
- **Memori RTC** adalah **buku saku**. Ukurannya kecil, hanya **8 KB**, tetapi tetap menyala selama tidur dalam. Isinya hilang kalau papan *restart* atau kehilangan listrik.
- **NVS** (Modul 8) adalah **lemari arsip** di memori *flash*. Isinya tetap ada walaupun listrik dicabut berhari-hari, tetapi menulisnya lebih lambat, dan *flash* bisa aus kalau ditulis terlalu sering.

![Tabel bergambar tiga ingatan ESP32: variabel yang sama, tiga tempat menyimpan, mana yang selamat dari apa. Tiga kolom: RAM (variabel biasa), memori RTC (RTC_DATA_ATTR), dan NVS di flash (Preferences, Modul 8). Bangun dari deep sleep: RAM hilang, memori RTC tetap, NVS tetap. Restart oleh program (ESP.restart): RAM hilang, memori RTC hilang, NVS tetap. Tombol EN atau listrik dicabut: RAM hilang, memori RTC hilang, NVS tetap. Program diunggah ulang: RAM hilang, memori RTC hilang, NVS tetap. Baris ukuran dan sifatnya: RAM besar, sekitar 520 kilobyte dan sebagian dipakai sistem, cepat, tanpa batas tulis, untuk kerja sehari-hari; memori RTC kecil, 8 kilobyte, cepat, tanpa batas tulis, untuk hal kecil di antara dua tidur; NVS bagian flash sekitar 20 kilobyte, tulis seperlunya karena flash bisa aus, untuk setelan dan angka penting](aset/tiga-ingatan.png)

Memindahkan variabel ke memori RTC cukup dengan menambahkan `RTC_DATA_ATTR` di depannya:

```cpp
int hitungRam = 0;                 // di RAM: kembali ke 0 setiap kali bangun dari tidur dalam
RTC_DATA_ATTR int hitungRtc = 0;   // di memori RTC: angka 0 hanya dipakai saat papan benar-benar baru menyala
```

Baris `RTC_DATA_ATTR int hitungRtc = 0;` tidak berarti "isi dengan 0 setiap kali bangun". Angka 0 itu hanya dipakai sekali, saat papan baru dinyalakan, di-*restart*, atau baru diunggahi program. Setelah bangun dari tidur dalam, isinya dibiarkan apa adanya.

Lalu, kapan memakai yang mana?

| Pertanyaan | Simpan di |
| :--- | :--- |
| Hanya dipakai selama papan bangun? (misalnya hasil hitungan sementara) | **RAM** (variabel biasa) |
| Perlu diingat dari satu kali bangun ke kali berikutnya, dan berubah setiap kali bangun? (misalnya jumlah bangun, bacaan sebelumnya) | **Memori RTC** (`RTC_DATA_ATTR`) |
| Harus selamat walaupun baterainya dicabut? (misalnya ambang, setelan, nama perangkat) | **NVS** (`Preferences`) |

Satu kebiasaan yang perlu dijaga: **jangan menulis NVS setiap kali bangun**. Papan yang bangun setiap 30 detik bangun 2.880 kali sehari; kalau setiap kali bangun ia menulis NVS, *flash*-nya cepat aus. Simpan angka yang berubah-ubah di memori RTC, dan tulis NVS hanya kalau ada setelan yang benar-benar berubah, sesuai aturan Modul 8.

> ➡️ **Siap praktik?** Lanjut ke [Praktik 2 — Tiga ingatan](#praktik-2--tiga-ingatan-ram-memori-rtc-dan-nvs-20-menit), lalu [Praktik 3](#praktik-3--bangun-oleh-alarm-atau-tombol-dan-tidur-ringan-30-menit) dan [Praktik 4](#praktik-4--kerangka-node-2-di-papan-kedua-25-menit). Setelah itu, kembali ke [Konsep 6](#6-baterai-li-ion-18650-tegangannya-berubah-kapasitasnya-sering-dilebih-lebihkan).

### 6. Baterai Li-ion 18650: tegangannya berubah, kapasitasnya sering dilebih-lebihkan

> ⬆️ **Baru selesai Praktik 4?** Papan kedua kini tidur dan bangun membaca suhu, tetapi masih menyusu ke laptop. Saatnya memberinya baterai.

Nama **18650** adalah ukurannya: diameter **18** mm, panjang **65** mm, dan angka **0** berarti bentuknya silinder. Baterai ini ada di dalam banyak *power bank*, senter, dan baterai laptop lama. Isinya **Li-ion** (litium-ion), jenis baterai isi ulang yang sama dengan baterai HP. Kutub positifnya ada di ujung yang **menonjol** (pada baterai tanpa proteksi, tonjolannya kecil, jadi lihat juga tanda + di pembungkusnya), dan kutub negatifnya di ujung yang rata.

**Tegangannya berubah sepanjang pemakaian.** Adaptor selalu memberi 5 V, tetapi tegangan baterai Li-ion turun perlahan seiring isinya terpakai:

| Keadaan baterai | Tegangan |
| :--- | :--- |
| Penuh, baru selesai diisi | **4,2 V** |
| Tegangan "nominal" yang tertulis di badannya | 3,6–3,7 V |
| Hampir habis | sekitar 3,3–3,4 V |
| Batas bawah: harus berhenti dipakai | 2,5–2,65 V, menurut lembar data baterainya |

Dari 4,2 V sampai sekitar 3,5 V, tegangannya turun pelan dan landai. Di bawah itu, tegangannya jatuh dengan cepat. Baterai yang terus dipakai di bawah batas bawahnya bisa rusak permanen, dan baterai yang diisi melebihi 4,2 V bisa menjadi panas dan berbahaya. Karena itu, baterai Li-ion **selalu** diisi dengan pengisi khusus, dan dijaga oleh **rangkaian proteksi** (Konsep 7).

![Diagram baterai Li-ion 18650, tegangannya turun seiring pemakaian; bentuk kurva contoh saat arusnya kecil. Kiri, gambar baterai tegak berukuran 18 kali 65 milimeter dengan kutub plus menonjol di atas dan kutub minus rata di bawah. Kanan, kurva tegangan terhadap isi yang sudah terpakai dari 0 sampai 100 persen: mulai dari penuh 4,2 volt, turun landai melewati garis nominal 3,6 sampai 3,7 volt yang tertulis di badannya, lalu setelah garis hampir habis sekitar 3,3 sampai 3,4 volt jatuh cepat; di bawahnya pita merah dengan garis batas bawah pabrik 2,5 sampai 2,65 volt dan garis putus-putus chip proteksi memutus sekitar 2,4 volt. Bawah, kapasitas yang jujur: batang hijau baterai asli 2.000 sampai 3.500 miliampere-jam, dan batang berbingkai merah bertuliskan 10.000 miliampere-jam yang palsu, dengan isi sungguhan sekitar 500 miliampere-jam; catatan: satu baterai bertuliskan 10.000 miliampere-jam hanya berisi sekitar 500 miliampere-jam saat diuji, dan baterai 18650 asli beratnya sekitar 45 sampai 48 gram, sehingga yang jauh lebih ringan patut dicurigai](aset/baterai-18650.png)

**Kapasitas: mAh.** Angka seperti **2.500 mAh** (miliampere-jam) menunjukkan berapa banyak muatan yang bisa diberikan baterai: kira-kira 2.500 mA selama 1 jam, atau 250 mA selama 10 jam, atau 25 mA selama 100 jam. Dalam kenyataan, tidak semuanya bisa dipakai, dan di Konsep 9 kita menghitungnya dengan jujur.

**Kapasitasnya sering dilebih-lebihkan.** Baterai 18650 terbaik yang dijual saat ini berkapasitas sekitar **3.500 mAh**. Di toko daring, banyak baterai bertuliskan 6.000, 8.800, bahkan 9.900 mAh dengan harga murah. Baterai seperti itu **palsu**. Satu baterai bertuliskan 10.000 mAh, misalnya, ternyata hanya berisi sekitar **500 mAh** saat diuji, dan mutunya pun tidak bisa dipercaya. Pegangan sederhana saat membeli:

- Pilih kapasitas **2.000–3.500 mAh** dari merek yang dikenal dan toko yang tepercaya. Hati-hati: merek terkenal pun banyak dipalsukan.
- Hindari baterai bekas bongkaran laptop atau *power bank*: umurnya tidak diketahui, dan bisa saja sudah rusak di dalam.
- Baterai 18650 asli beratnya sekitar 45–48 g. Yang terasa jauh lebih ringan patut dicurigai.

**Aturan keselamatan** di awal modul berlaku penuh di sini. Tiga yang paling penting: jangan pernah menyambung kedua kutubnya secara langsung, jangan memakai baterai yang penyok atau menggembung, dan selalu tunggui saat mengisi.

### 7. TP4056 dan MT3608: pengisi dan penaik tegangan

Baterai 18650 tidak bisa langsung disambung ke ESP32. Ada dua masalah: baterainya perlu **diisi ulang dengan aman**, dan tegangannya (3,0–4,2 V) **terlalu rendah** untuk pin VIN yang butuh sekitar 4,5 V ke atas (Konsep 1). Dua modul kecil menyelesaikannya.

![Diagram rantai catu baterai papan kedua; setiap modul punya tugasnya sendiri, dan semua tegangan diukur dari GND bersama (OUT minus). Empat kotak berurutan dengan panah. Baterai 18650, menyimpan energi: 3,0 sampai 4,2 volt, turun pelan seiring pemakaian. TP4056 dengan proteksi, mengisi dan menjaga, mendapat charger HP 5 volt saat mengisi: B plus dan B minus dari baterai, OUT plus dan OUT minus ke beban, memutus kalau baterai terlalu kosong, terlalu penuh, atau korsleting; keluarannya 3,0 sampai 4,2 volt yang sudah dijaga. MT3608, menaikkan tegangan: VIN plus dan VIN minus dari OUT TP4056, VOUT plus dan VOUT minus ke papan, diatur ke 5,0 volt dengan multimeter tanpa beban; keluarannya 5,0 volt. Papan kedua, bangun, baca, tidur: VIN ke regulator AMS1117 lalu 3,3 volt untuk ESP32, dan USB papan dicabut selama hidup dari baterai. Catatan bawah: 1, arus di sisi baterai kira-kira 1,6 kali arus di sisi 5 volt karena menaikkan tegangan butuh arus lebih besar, ditambah sedikit daya yang menjadi panas (efisiensi sekitar 85 persen); 2, GND seluruh rangkaian diambil dari OUT minus karena B minus hanya untuk baterai, dan di antara B minus dan OUT minus ada sakelar milik chip proteksi; 3, pin 3V3 tidak pernah diberi tegangan baterai karena baterai penuh 4,2 volt, sedangkan chip ESP32 hanya tahan sampai 3,6 volt](aset/rantai-catu-baterai.png)

**TP4056 dengan proteksi** adalah **pengisi** sekaligus **penjaga** baterai. Di atas modul 6 bantalan ini ada dua bagian:

- **Chip TP4056, si pengisi.** Ia menerima 5 V dari colokan USB-nya, lalu mengisi baterai dalam dua tahap: mula-mula dengan arus tetap, sekitar 1 A pada kebanyakan modul; begitu baterai mencapai 4,2 V, tegangannya ditahan tetap, sedangkan arusnya mengecil sendiri. Saat arusnya tinggal sepersepuluh, pengisian selesai. Lampu **merah** berarti sedang mengisi, dan lampu **biru** (di sebagian modul hijau) berarti penuh.
- **Chip proteksi, si penjaga** (biasanya DW01A beserta chip sakelarnya, 8205A). Ia memutus baterai dari beban kalau tegangannya turun di bawah sekitar **2,4 V** (terlalu kosong) atau kalau arusnya lebih dari sekitar **3 A**, misalnya karena korsleting, dan menghentikan pengisian kalau tegangannya melewati sekitar **4,3 V** (terlalu penuh).

Bantalannya ada tiga pasang:

| Bantalan | Ke mana | Catatan |
| :--- | :--- | :--- |
| **IN+ / IN−** | listrik 5 V untuk mengisi | Kita cukup memakai colokan USB-nya; kedua bantalan ini tidak disambung. |
| **B+ / B−** | kutub baterai | Kabel merah dudukan baterai ke B+, kabel hitam ke B−. |
| **OUT+ / OUT−** | beban (di sini: MT3608) | **Beban selalu diambil dari OUT** karena hanya jalur ini yang dijaga chip proteksi. |

Satu hal kecil tetapi penting: **B− tidak sama dengan OUT−**. Di antara keduanya ada "sakelar" milik chip proteksi. Karena itu, **GND seluruh rangkaian diambil dari OUT−**, bukan dari B−. Kabel hitam baterai hanya masuk ke B−.

> [!CAUTION]
> **TP4056 versi 4 bantalan** (hanya IN dan B, tanpa OUT) tidak punya chip proteksi. Jangan dipakai untuk rangkaian ini.

TP4056 terasa **hangat sampai panas** saat mengisi karena kelebihan tegangan dari 5 V ke tegangan baterai dibuang menjadi panas. Itu wajar untuk modulnya asal diletakkan di permukaan yang tidak mudah terbakar dan tidak disentuh. Yang tidak boleh panas adalah **baterainya** (aturan keselamatan nomor 4). Mengisi baterai 2.500 mAh dari kosong sampai penuh butuh sekitar 3 jam.

**Dua kebiasaan baik.** Pertama, **lepaskan bebannya saat mengisi** (cabut kabel VIN papan kedua): TP4056 menganggap baterai penuh saat arus pengisiannya tinggal sepersepuluh, dan beban yang ikut menyedot arus bisa mengacaukan hitungan itu. Kedua, **isi ulang sebelum baterainya habis**. MT3608 tetap mengeluarkan 5,0 V sampai chip proteksi memutus di sekitar 2,4 V, sedikit di bawah batas bawah yang dianjurkan pabrik baterai (2,5–2,65 V). Artinya, papan kedua baru berhenti bekerja setelah proteksi memutus. Jadi, isi ulang baterainya sebelum umur baterai hasil hitunganmu (Konsep 9 dan Praktik 6) terlewati, dan kalau papan kedua telanjur berhenti, isi ulang hari itu juga: jangan dibiarkan kosong berhari-hari.

**MT3608 adalah penaik tegangan** (*boost converter*). Ia mengubah tegangan baterai yang naik-turun (3,0–4,2 V) menjadi tegangan yang lebih tinggi dan tetap, yang kita atur menjadi **5,0 V**. Caranya: sebuah sakelar elektronik di dalamnya membuka dan menutup sekitar 1,2 juta kali per detik untuk mengisi dan mengosongkan sebuah kumparan sehingga tegangannya "dipompa" naik. Besar tegangan keluarannya diatur dengan **potensiometer** biru bersekrup kuningan. Bantalannya **VIN+ / VIN−** (masuk dari OUT+/OUT− TP4056) dan **VOUT+ / VOUT−** (keluar ke papan ESP32). VIN− dan VOUT− tersambung jadi satu di dalam modul.

Dua sifat MT3608 yang perlu kamu tahu:

- **Daya tidak bisa dibuat dari ketiadaan.** Saat tegangannya dinaikkan dari 3,7 V menjadi 5 V, arus di sisi baterai menjadi **lebih besar** daripada arus di sisi 5 V. Ditambah sedikit daya yang terbuang menjadi panas (kita perkirakan efisiensinya 85 %), arus baterai kira-kira **1,6 kali** arus di sisi 5 V. MT3608 sendiri juga menyedot sekitar 1 mA, berapa pun bebannya. Faktor **1,6** itulah yang kita pakai untuk menghitung umur baterai di Konsep 9; arus 1 mA tadi cukup diingat sebagai alasan umur sungguhannya sedikit lebih pendek.
- **Ia tidak bisa menurunkan tegangan, dan setelan pabriknya tidak bisa ditebak.** Ada yang keluarannya hanya sedikit di bawah tegangan baterai, ada yang jauh lebih tinggi; modul ini sanggup mengeluarkan sampai 28 V. Itulah alasan aturan keselamatan nomor 5: atur ke 5,0 V dengan multimeter **sebelum** disambung ke ESP32.

Rantai lengkapnya, dari baterai sampai chip:

| Tahap | Tegangan |
| :--- | :--- |
| Baterai 18650 | 3,0–4,2 V, turun pelan seiring pemakaian |
| Keluar dari TP4056 (OUT+/OUT−) | sama dengan baterai, tetapi sudah dijaga proteksi |
| Keluar dari MT3608 (VOUT+/VOUT−) | **5,0 V**, tetap sampai chip proteksi memutus baterai |
| Pin VIN papan kedua → regulator papan | 3,3 V untuk chip ESP32 |

Kenapa repot menaikkan ke 5 V, lalu diturunkan lagi ke 3,3 V oleh regulator papan? Karena pintu 5 V papan DevKit V1 (colokan USB dan VIN) butuh sekitar 4,5 V ke atas, sedangkan pintu 3V3 tidak tahan 4,2 V (Konsep 1). Cara ini memang memboroskan sedikit energi, dan di Konsep 10 kita melihat cara yang lebih hemat untuk perangkat sungguhan.

> ➡️ **Siap praktik?** Lanjut ke [Praktik 5 — Catu baterai](#praktik-5--rakit-catu-baterai-18650--tp4056--mt3608-40-menit). Setelah selesai, kembali ke [Konsep 8](#8-mengukur-arus-ina219-bukan-multimeter).

### 8. Mengukur arus: INA219, bukan multimeter

> ⬆️ **Baru selesai Praktik 5?** Papan kedua kini hidup dari baterai. Berapa lama baterainya bertahan? Untuk menjawabnya, kita harus tahu **berapa arus** yang ditarik papan, saat bangun dan saat tidur.

Mengukur **tegangan** itu mudah: tempelkan kedua *probe* multimeter ke dua titik (Modul 2). Mengukur **arus** berbeda: arusnya harus **lewat** alat ukur. Jalurnya diputus, lalu alat ukur disisipkan di celahnya, seperti meteran air yang dipasang di tengah pipa.

**Mengapa tidak dengan multimeter?** Multimeter murah memang punya posisi mA, bahkan µA, tetapi ada tiga masalah:

1. **Sekeringnya mudah putus.** Posisi mA biasanya hanya dijaga sekering 200–500 mA (baca tulisan di dekat colokannya), bahkan ada multimeter murah yang di posisi itu tidak bersekering sama sekali. Papan yang bangun tanpa WiFi memang hanya menarik puluhan mA, tetapi saat WiFi menyala (mulai Modul 10), arusnya bisa melonjak sampai ratusan mA, cukup untuk memutus sekering sekecil itu. Multimeter pun "mati" di posisi mA sampai sekeringnya diganti.
2. **Multimeter ikut mengganggu.** Untuk mengukur arus, multimeter menyisipkan hambatan di jalurnya. Di posisi **2000µ** (2.000 µA), multimeter murah menyisipkan sekitar 100 Ω. Arus bangun 50 mA yang lewat hambatan itu "butuh" 5 V hanya untuk melewati multimeternya. Tegangan sebesar itu tidak tersedia, jadi papan kekurangan tegangan, *restart*, dan hasil ukurnya kacau (Konsep 3).
3. **Terlalu lambat untuk arus yang naik-turun.** Papan yang bangun sekitar 1 detik lalu tidur 30 detik berganti arus dengan cepat. Angka di layar multimeter melompat-lompat, dan kamu tidak bisa menghitung rata-ratanya.

Ditambah lagi, multimeter di posisi arus yang tidak sengaja ditempelkan ke kedua kutub baterai sama dengan korsleting (aturan keselamatan nomor 7). Karena itu, minggu ini multimeter hanya dipakai untuk mengukur tegangan.

**INA219** menyelesaikan ketiganya. Modul kecil ini berisi **hambatan pengukur** (*shunt*) 0,1 Ω yang dipasang di jalur listrik, dan sebuah chip yang membaca **tegangan kecil** di kedua ujung hambatan itu. Ingat Hukum Ohm: arus = tegangan ÷ hambatan. Arus 10 mA yang lewat hambatan 0,1 Ω menghasilkan tegangan hanya 1 mV, dan chip INA219 bisa membedakan perubahan sekecil 0,01 mV (10 µV). Hasilnya:

| | INA219 dengan setelan modul ini |
| :--- | :--- |
| Arus terkecil yang terbedakan | sekitar 0,1 mA (bacaan kecilnya bisa meleset sekitar 0,1 mA) |
| Arus terbesar | sekitar 400 mA, cukup untuk papan yang bangun tanpa WiFi |
| Tegangan jalur | sampai 16 V dengan setelan ini (chip-nya sendiri sanggup sampai 26 V) |
| Kecepatan | ESP32 bisa membacanya ratusan kali per detik lewat I2C |
| Alamat I2C | `0x40` |

INA219 disambung **seri**: listrik masuk lewat kaki **VIN+**, melewati hambatan 0,1 Ω, lalu keluar lewat kaki **VIN−** menuju beban. Supaya INA219 bisa membaca **tegangan** jalurnya, dan supaya kaki VIN+/VIN− tetap dalam batas kerja chip-nya, GND-nya harus **disatukan** dengan GND rangkaian yang diukur.

**Siapa yang membaca INA219?** Papan Node 1 sendiri. INA219 berbicara lewat I2C (Modul 7), jadi ia cukup disambung ke bus I2C di meja kerja Node 1 dengan empat kabel jantan–betina, di lubang yang dulu dipakai BME280. Papan Node 1, yang tercolok ke laptop, menjalankan sketsa pengukur dan menuliskan hasilnya di Serial Monitor. Sementara itu, papan kedua tetap hidup dari baterainya sendiri, dan arusnya lewat INA219. INA219 sendiri mendapat listrik dari pin 3V3 Node 1, jadi arus INA219 (sekitar 1 mA) tidak ikut terukur.

![Diagram Node 1 menjadi alat ukur arus papan kedua. Kiri, papan Node 1 dari USB laptop dengan MB102 mati, menjalankan sketsa modul09_ukur_arus dan menulis arus setiap detik serta ringkasan setiap siklus di Serial Monitor; empat kabel ke modul INA219: SDA (D21), SCL (D22), 3,3 volt, dan GND. Tengah, modul INA219 beralamat 0x40 berisi chip yang membaca tegangan kecil di kedua ujung hambatan pengukur 0,1 ohm. Jalur 5 volt: dari MT3608 5,0 volt (dari baterai 18650) masuk ke kaki VIN plus, melewati hambatan 0,1 ohm, keluar dari VIN minus menuju pin VIN papan kedua, yang menjalankan sketsa Praktik 4, bangun 1 detik dan tidur 30 detik, dengan USB-nya dicabut. Garis GND bersama menyatukan GND Node 1, INA219, rangkaian baterai, dan papan kedua. Bawah: Hukum Ohm, arus sama dengan tegangan di hambatan dibagi 0,1 ohm; contohnya, 10 miliampere hanya menghasilkan 1 milivolt, cukup untuk dibaca INA219](aset/ukur-arus-ina219.png)

INA219 punya batas juga. Arus tidur chip ESP32 yang telanjang hanya sekitar 0,01 mA (10 µA), jauh di bawah 0,1 mA yang bisa dibedakan INA219. Untuk papan DevKit V1, yang arus tidurnya beberapa mA (Konsep 10), INA219 sudah lebih dari cukup. Alat untuk mengukur µA dengan teliti dibahas di 🔬.

### 9. Menghitung umur baterai

Papan kedua bergantian **bangun sebentar** (arusnya besar) dan **tidur lama** (arusnya kecil). Untuk menghitung umur baterai, kita butuh **arus rata-rata** dalam satu siklus bangun-tidur, lalu menghitung berapa lama baterai sanggup memberikannya.

![Diagram menghitung umur baterai dengan angka contoh untuk latihan. Atas, grafik arus papan kedua di sisi 5 volt selama dua siklus, dengan lebar yang tidak sesuai skala: lonjakan bangun 55 miliampere selama 1 detik, lalu tidur 5 miliampere selama 30 detik. Di sampingnya, satu siklus 31 detik: bangun 55 miliampere kali 1,0 detik sama dengan 55, tidur 5 miliampere kali 30 detik sama dengan 150, jumlahnya 205 miliampere-detik; batang perbandingan menunjukkan tidur menyumbang 73 persen; catatan: arus tidur yang kecil justru menghabiskan sebagian besar baterai. Bawah, empat langkah: 1, rata-rata di sisi 5 volt, 55 tambah 150 dibagi 31 kira-kira 6,6 miliampere; 2, pindah ke sisi baterai, 6,6 kali 1,6 kira-kira 10,6 miliampere; 3, kapasitas terpakai, 2.500 miliampere-jam kali 0,8 sama dengan 2.000 miliampere-jam; 4, umur baterai, 2.000 dibagi 10,6 kira-kira 189 jam atau sekitar 7,9 hari. Catatan: 1,6 karena MT3608 menaikkan tegangan dengan efisiensi sekitar 85 persen, dan MT3608 sendiri menyedot sekitar 1 miliampere lagi; 0,8 karena kapasitas sungguhan lebih kecil daripada angka di badan baterai](aset/umur-baterai.png)

Ada empat langkah. Angka di contoh ini hanya untuk latihan; di Praktik 6, kamu memakai angka hasil ukurmu sendiri.

**Langkah 1 — Arus rata-rata di sisi 5 V.** Kalikan setiap arus dengan lamanya, jumlahkan, lalu bagi dengan lama satu siklus:

```text
arus rata-rata = (arus bangun × lama bangun + arus tidur × lama tidur) ÷ (lama bangun + lama tidur)

Contoh: bangun 55 mA selama 1,0 detik, tidur 5 mA selama 30 detik
        = (55 × 1,0 + 5 × 30) ÷ (1,0 + 30)
        = (55 + 150) ÷ 31
        ≈ 6,6 mA
```

Perhatikan angka 55 dan 150. **Waktu tidur menyumbang hampir tiga perempat** (73 %) dari seluruh pemakaian, padahal arus tidurnya "kecil". Ingat angka ini; di Konsep 10, kita membahas artinya.

**Langkah 2 — Pindahkan ke sisi baterai.** INA219 mengukur di sisi 5 V, sesudah MT3608. Di sisi baterai, arusnya lebih besar (Konsep 7):

```text
arus baterai ≈ arus rata-rata 5 V × 5 V ÷ (tegangan baterai rata-rata × efisiensi MT3608)
             ≈ 6,6 × 5 ÷ (3,7 × 0,85)
             ≈ 6,6 × 1,6
             ≈ 10,6 mA
```

Angka **1,6** ini cukup kamu pakai langsung. MT3608 sendiri juga menyedot sekitar 1 mA (Konsep 7), jadi umur sungguhannya sedikit lebih pendek daripada hasil hitungan ini.

**Langkah 3 — Kapasitas yang benar-benar terpakai.** Angka di badan baterai adalah angka terbaik saat baterai masih baru: kapasitasnya menurun seiring umur dan suhu, dan baterai sebaiknya diisi ulang sebelum benar-benar kosong (Konsep 7). Pakai **80 %** dari kapasitas yang tertulis:

```text
kapasitas terpakai = 2.500 mAh × 0,8 = 2.000 mAh
```

**Langkah 4 — Umur baterai.**

```text
umur = kapasitas terpakai ÷ arus baterai
     = 2.000 mAh ÷ 10,6 mA
     ≈ 189 jam
     ≈ 7,9 hari
```

Hanya **sekitar delapan hari**, padahal baterainya 2.500 mAh. Ini perkiraan; umur sungguhannya bisa sedikit berbeda karena suhu, mutu baterai, dan arus yang tidak selalu sama. Bonus ➕ A mengajakmu membuktikannya.

### 10. Jujur soal DevKit V1: mengapa baterainya hanya tahan beberapa hari

Di Konsep 4, chip ESP32 yang tidur dalam hanya menarik sekitar **0,01 mA**. Namun, papan pengembang seperti DevKit V1 yang tidur dalam menarik sekitar **4–5 mA** menurut hasil ukur beberapa orang pada papan sejenis, dan papan tiruan bisa lebih boros lagi. Itu **sekitar empat ratus kali** arus chip-nya. Ke mana arusnya?

![Diagram jujur soal DevKit V1: chip-nya tidur, papannya tidak; chip ESP32 tidur dalam sekitar 0,01 miliampere, papan pengembang sejenis terukur sekitar 4 sampai 5 miliampere, dan papan tiruan bisa lebih boros. Kiri, gambar papan dengan empat penanda bagian yang tetap menyedot arus saat chip tidur: 1, regulator AMS1117, beberapa miliampere, yaitu "uang jalan" regulator; 2, LED merah tanda menyala, sekitar 1,3 sampai 1,5 miliampere, menyala terus; 3, chip USB-serial CP2102, tetap menyala dari jalur 3,3 volt; 4, chip ESP32, sekitar 0,01 miliampere, satu-satunya yang tidur. Kanan, batang umur baterai 2.500 miliampere-jam (2.000 terpakai) pada skala 0 sampai 60 hari, bila papan bangun 1 detik dengan arus 55 miliampere, lalu tidur dengan arus tidur papannya (DevKit V1: 5 miliampere, lewat MT3608): DevKit V1 tidur 30 detik sekitar 8 hari; DevKit V1 tidur 5 menit sekitar 10 hari; DevKit V1 yang tidak pernah bangun paling lama sekitar 10 hari; papan hemat daya (0,01 miliampere, regulator irit) tidur 30 detik sekitar 47 hari; papan hemat daya tidur 5 menit berbulan-bulan. Bawah, artinya: untuk DevKit V1 memperpanjang tidur hanya sedikit menolong karena arus tidur papannya yang menentukan batas umur baterai; untuk kurikulum ini beberapa hari sudah cukup karena Node 2 diisi ulang lewat colokan TP4056; papan hemat daya memakai regulator irit langsung dari baterai, tidak punya LED yang menyala terus, dan chip USB-nya ikut padam (dibahas di Bedah Teknis)](aset/jujur-devkit-v1.png)

| Bagian papan | Kira-kira arusnya saat chip tidur | Mengapa |
| :--- | :--- | :--- |
| Regulator AMS1117 | beberapa mA (lembar data menulis angka khas 5 mA dan paling banyak 11 mA; di papan nyata biasanya lebih kecil karena seluruh papan terukur hanya 4–5 mA) | Regulator jenis ini butuh "uang jalan" tetap untuk bekerja, berapa pun arus yang dikeluarkannya. Papan yang memakai regulator lain bisa sedikit lebih irit. |
| LED merah tanda menyala | sekitar 1,3–1,5 mA | Menyala terus selama papan berlistrik, juga saat chip tidur. |
| Chip USB-serial (CP2102) | ikut menyedot | Di papan DevKit V1, chip ini mendapat listrik dari jalur 3,3 V, jadi tetap menyala walaupun kabel USB tidak tercolok. |
| Chip ESP32 | sekitar 0,01 mA | Inilah satu-satunya bagian yang benar-benar tidur. Memori *flash*-nya ikut dimatikan selama tidur dalam. |

Papan DevKit V1 dirancang untuk **belajar dan mencoba**: colokkan ke laptop, unggah program, lihat hasilnya. Kenyamanan itu dibayar dengan arus tidur yang besar. Akibatnya:

- **Memperpanjang tidur tidak banyak menolong.** Di contoh Konsep 9, tidur sudah menyumbang hampir tiga perempat pemakaian. Kalau papan bangun setiap 5 menit, sepuluh kali lebih jarang, arus rata-ratanya hanya turun dari sekitar 6,6 mA menjadi sekitar 5,2 mA, dan umurnya hanya bertambah dari sekitar 8 hari menjadi sekitar 10 hari. Berapa pun lamanya tidur, papan ini tidak bisa bertahan lebih dari sekitar 10 hari: arus tidurnya saja (5 mA × 1,6 = 8 mA di sisi baterai) sudah menghabiskan 2.000 mAh dalam 250 jam.
- **Yang menentukan adalah arus tidur papannya.** Seandainya arus tidur seluruh papan benar-benar 0,01 mA, dengan regulator irit yang langsung mengambil listrik dari baterai (tanpa MT3608), contoh yang sama (bangun 1 detik setiap 30 detik) bertahan lebih dari sebulan, dan dengan bangun setiap 5 menit, berbulan-bulan.

Lalu, apa artinya untuk Node 2?

1. **Untuk kurikulum ini, DevKit V1 cukup.** Node 2 di Modul 14 boleh hidup dari baterai selama beberapa hari, lalu diisi ulang lewat colokan TP4056. Tujuan kita adalah memahami pola hemat dayanya, dan pola itu sama persis di papan apa pun.
2. **Untuk perangkat sungguhan yang harus bertahan berbulan-bulan,** pakai papan yang dirancang hemat daya (regulator dengan "uang jalan" sangat kecil, tidak ada LED yang menyala terus, dan chip USB-nya ikut padam saat papan hidup dari baterai), atau modul ESP32 tanpa papan pengembang. Contohnya dibahas di 🔬, bersama panel surya kecil.
3. **Jangan memotong jalan dengan memberi baterai langsung ke pin 3V3** untuk "melompati" regulator. Baterai penuh bertegangan 4,2 V, di atas batas chip ESP32 (Konsep 1).

> ➡️ **Siap praktik?** Lanjut ke [Praktik 6 — Ukur arus](#praktik-6--node-1-jadi-alat-ukur-arus-ina219-45-menit), [Praktik 7](#praktik-7--uji-power-bank-mati-sendiri-15-menit), dan [Praktik 8](#praktik-8--simpan-ke-github-15-menit). Setelah itu, lanjut ke [🧩 Tantangan mandiri](#-tantangan-mandiri) dan [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini).

## 🔧 Praktik langkah demi langkah

Delapan praktik, **berurutan**, dengan **dua papan**:

- **Papan Node 1** dipakai untuk Praktik 1–3 (catu daya dan percobaan tidur) dan menjadi **alat ukur arus** di Praktik 6. Di bagian ➕, papan ini kembali menjalankan Node 1 v1.0, kali ini permanen dari adaptornya sendiri.
- **Papan kedua** (calon Node 2) dipakai mulai Praktik 4: tidur dan bangun membaca suhu, lalu hidup dari baterai (Praktik 5).

Dua bagian ini adalah syarat lulus (Praktik 6 bertanda ⭐ di daftar isi):

1. **Praktik 6** — arus tidur sketsa baterai terukur **kurang dari 15 mA**, dan kamu menghitung sendiri perkiraan umur baterainya.
2. **Bagian ➕ A** — Node 1 hidup **24 jam dari adaptor** (bukan dari laptop) tanpa *restart*.

Praktik 1–3 tidak butuh komponen baru. Praktik 4 butuh papan ESP32 kedua dan tiga kabel jumper betina–betina (lihat kotak **Belanja untuk minggu ini**). Praktik 5–6 butuh baterai, TP4056, MT3608, INA219, dan breadboard mini. Kalau barangnya belum datang, kerjakan Praktik 1–4 dulu.

### Praktik 1 — Node 1 tanpa laptop: adaptor sendiri (20 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE**, meja kerja Node 1 lengkap, ***charger* HP 5 V** (minimal 1 A) dengan kabel USB untuk papan Node 1, adaptor MB102 seperti biasa, dan sepotong selotip kertas untuk label. Konsep yang dipakai: 1, 2, dan 3.

Praktik ini adalah geladi bersih: Node 1 dijalankan dari *charger*, beban-bebannya dicoba, lalu papannya dikembalikan ke laptop untuk Praktik 2–3. Pemasangan permanennya ada di bagian ➕ A, sesudah semua praktik selesai.

#### 1.1 Kembalikan firmware Node 1 v1.0

Kemenangan Cepat tadi menimpa program Node 1. Pasang lagi Node 1 v1.0 dengan cara yang sama seperti Modul 8:

1. Pastikan **MB102 mati**, lalu colokkan papan Node 1 ke laptop.
2. Di Arduino IDE, buka **File → Open…** → **Documents → GitHub → rumah-pintar-mini → firmware → node-1-rumah** → `node-1-rumah.ino`. Kedua puluh empat tab-nya ikut terbuka.
3. Pilih port papan Node 1, klik **Upload**, dan tunggu `Done uploading`.

#### 1.2 Siapkan *charger* dan beri label

1. Colokkan *charger* HP ke stopkontak, sedekat mungkin dengan adaptor MB102. Kalau memakai terminal listrik (colokan T), colokkan keduanya ke terminal yang sama.
2. Tempelkan label selotip bertuliskan **ESP32** di kabel USB papan Node 1, dan **MB102** di kabel A–A adaptor MB102. Label kecil ini mencegah kabel tertukar saat tergesa-gesa: kabel MB102 tidak boleh masuk ke papan ESP32, dan sebaliknya.

#### 1.3 Pindah dari laptop ke *charger*

Ikuti urutan aturan emas Modul 5: **matikan beban dulu, nyalakan beban terakhir**.

1. Pastikan **MB102 mati**.
2. Cabut kabel USB papan Node 1 dari laptop, lalu colokkan ujung yang sama ke ***charger***. LED status Node 1 mulai berdetak, dan layar OLED menyala.
3. **Baru** nyalakan MB102. Kalau memasang modul microSD beregulator, tekan **EN** sekarang (Modul 7), sebelum mencatat angka di langkah 4.
4. Tahan tombol D13 selama 1 detik untuk membuka halaman status. Catat angka **`Nyala ke-`**, lalu periksa baris **`Restart:`**: harus `POWERON`.

#### 1.4 Coba semua bebannya

1. **Tekan tombol sebentar**: relay lampu berbunyi "klik" dan LED indikatornya menyala. Tekan sekali lagi untuk memadamkannya.
2. **Angkat sensor tanah ke udara**: dalam beberapa detik, pompa menyala 3 detik (pastikan tandon berisi air dan selang mengarah ke gelas tanaman atau kembali ke tandon). Celupkan lagi sensornya ke tanah lembap.
3. Tahan tombol lagi untuk membuka halaman status. **`Nyala ke-` harus sama** dengan catatanmu, dan **`Restart:` tetap `POWERON`**.

**Hasilnya:** Node 1 bekerja persis seperti saat tersambung ke laptop. Pompa dan relay tidak membuat ESP32 *restart* karena bebannya mengambil listrik dari MB102, sedangkan ESP32 punya *charger*-nya sendiri. Kalau `Nyala ke-` bertambah atau `Restart:` menulis `BROWNOUT`, buka "Node 1 *restart* saat pompa menyala" di 🚨.

#### 1.5 Kembali ke laptop

Praktik 2–3 memakai papan Node 1 dan Serial Monitor, jadi kembalikan papan ke laptop dengan urutan kebalikannya: **matikan MB102**, cabut kabel ESP32 dari *charger*, lalu colokkan ke laptop.

#### 1.6 Bedah langkahnya

- ***Charger* hanya menggantikan laptop.** Kabelnya tetap masuk ke colokan USB papan, bukan ke pin VIN dan bukan ke MB102. Jalur listrik ESP32 tidak berubah sama sekali sehingga semua aturan emas Modul 5 tetap berlaku (Konsep 1).
- **Dua adaptor, dua jalur.** Lonjakan arus pompa dan servo ditanggung adaptor MB102, sedangkan ESP32 tenang di jalurnya sendiri. Itulah sebabnya ESP32 tidak mengalami *brownout* (Konsep 3).
- **Halaman status adalah "kotak hitam" Node 1.** Tanpa laptop, Serial Monitor tidak bisa dibuka, tetapi `Nyala ke-` dan `Restart:` tetap mencatat apa yang terjadi. Di bagian ➕ A, kedua angka itulah buktimu untuk uji 24 jam.

> ⬆️ **Selesai Praktik 1?** Kembali ke [Konsep 4](#4-tidur-aktif-tidur-ringan-dan-tidur-dalam) (➡️ di akhir Konsep 5 akan mengantarmu ke Praktik 2).

### Praktik 2 — Tiga ingatan: RAM, memori RTC, dan NVS (20 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** dan **Serial Monitor**, **papan Node 1** dari laptop dengan **MB102 dimatikan**, LED status D4 dan tombol D13 yang sudah terpasang. Konsep yang dipakai: 4 dan 5.

Sketsa ini membuat papan tidur 5 detik berulang-ulang, dan setiap kali bangun ia menambah **tiga penghitung** yang disimpan di tiga tempat berbeda. Kita lihat penghitung mana yang selamat dari tidur, dari *restart*, dan dari listrik yang dicabut.

1. Buat sketsa baru bernama `modul09_tiga_ingatan`, tempel kode ini, lalu klik **Upload**:

   ```cpp
   // Modul 9 - Praktik 2: tiga ingatan ESP32 (RAM, memori RTC, dan NVS) melewati deep sleep
   // Rangkaian: LED status di D4 dan tombol di D13 (kaki seberangnya ke GND), sama dengan Kemenangan Cepat.
   // Papan bangun setiap 5 detik dan menambah tiga penghitung. Untuk restart, tahan tombol D13
   // sampai LED menyala, tunggu sebentar, lalu lepaskan.

   #include <Preferences.h>

   const int PIN_LED_STATUS = 4;
   const int PIN_TOMBOL = 13;
   const unsigned long LAMA_TIDUR_DETIK = 5;

   int hitungRam = 0;                // variabel biasa: disimpan di RAM
   RTC_DATA_ATTR int hitungRtc = 0;  // disimpan di memori RTC: bertahan selama deep sleep
   Preferences arsip;                 // NVS dari Modul 8: bertahan walaupun listrik padam

   // Nama pendek untuk alasan papan terakhir kali menyala (seperti Node 1 v1.0).
   const char* namaAlasan() {
     esp_reset_reason_t alasan = esp_reset_reason();
     if (alasan == ESP_RST_POWERON) {
       return "POWERON";  // baru dinyalakan, tombol EN ditekan, atau program selesai diunggah
     }
     if (alasan == ESP_RST_SW) {
       return "SW";  // program sendiri yang meminta restart
     }
     if (alasan == ESP_RST_DEEPSLEEP) {
       return "DEEPSLEEP";  // bangun dari deep sleep
     }
     return "LAIN";
   }

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_LED_STATUS, OUTPUT);
     pinMode(PIN_TOMBOL, INPUT_PULLUP);

     hitungRam++;
     hitungRtc++;
     arsip.begin("modul09", false);
     int hitungNvs = arsip.getInt("hitung", 0) + 1;
     arsip.putInt("hitung", hitungNvs);
     arsip.end();

     Serial.printf("RAM: %d   RTC: %d   NVS: %d   (alasan menyala: %s)\n", hitungRam, hitungRtc, hitungNvs, namaAlasan());

     digitalWrite(PIN_LED_STATUS, HIGH);  // LED menyala 1 detik: kesempatan untuk menahan tombol
     delay(1000);
     bool tombolDitahan = (digitalRead(PIN_TOMBOL) == LOW);
     digitalWrite(PIN_LED_STATUS, LOW);

     if (tombolDitahan) {
       Serial.println("Tombol ditahan: restart sekarang.");
       Serial.flush();
       ESP.restart();  // restart oleh program, mirip menekan tombol EN
     }

     Serial.flush();
     esp_sleep_enable_timer_wakeup(LAMA_TIDUR_DETIK * 1000000ULL);
     esp_deep_sleep_start();
   }

   void loop() {
     // Tidak pernah dijalankan (lihat Kemenangan Cepat).
   }
   ```

2. Buka **Serial Monitor** (**115200 baud**) dan tunggu tiga atau empat kali bangun. LED D4 menyala 1 detik setiap kali papan bangun.
3. ***Restart* oleh program:** tekan dan **tahan** tombol D13 sampai LED menyala, tunggu sampai muncul `Tombol ditahan: restart sekarang.`, lalu **segera** lepaskan. Kalau tombol masih ditahan saat papan menyala lagi, papan *restart* sekali lagi, dan angka NVS-mu melompat lebih jauh daripada contoh.
4. **Tombol EN:** tunggu dua kali bangun lagi, lalu tekan tombol **EN** di papan ESP32.
5. **Listrik dicabut:** cabut USB, tunggu 5 detik, colokkan lagi, lalu buka ulang Serial Monitor kalau perlu.

**Hasilnya** (contoh keluaran di papan asli; baris ROM tidak ditampilkan):

```text
RAM: 1   RTC: 1   NVS: 1   (alasan menyala: POWERON)
RAM: 1   RTC: 2   NVS: 2   (alasan menyala: DEEPSLEEP)
RAM: 1   RTC: 3   NVS: 3   (alasan menyala: DEEPSLEEP)
Tombol ditahan: restart sekarang.
RAM: 1   RTC: 1   NVS: 4   (alasan menyala: SW)
RAM: 1   RTC: 2   NVS: 5   (alasan menyala: DEEPSLEEP)
RAM: 1   RTC: 3   NVS: 6   (alasan menyala: DEEPSLEEP)
RAM: 1   RTC: 1   NVS: 7   (alasan menyala: POWERON)
```

Baris terakhir adalah hasil tombol EN. Setelah listrik dicabut lalu dicolokkan lagi (langkah 5), hasilnya sama: `RTC` kembali ke 1, sedangkan `NVS` lanjut. Baris pertama setelah dicolokkan sering sudah lewat sebelum Serial Monitor tersambung lagi; tunggu baris berikutnya 5 detik kemudian, atau tekan **EN**.

Angka NVS-mu bisa lebih besar kalau sketsa ini pernah berjalan sebelumnya. Cocokkan hasilmu dengan tabel ini, salin tabelnya ke catatanmu (`catatan-modul09.md` di folder `modul-09`), lalu bandingkan dengan Konsep 5:

| Kejadian | RAM | Memori RTC | NVS |
| :--- | :---: | :---: | :---: |
| Bangun dari *deep sleep* | kembali ke 1 | **lanjut** | **lanjut** |
| *Restart* oleh program (`ESP.restart()`) | kembali ke 1 | kembali ke 1 | **lanjut** |
| Tombol EN atau listrik dicabut | kembali ke 1 | kembali ke 1 | **lanjut** |
| Program diunggah ulang | kembali ke 1 | kembali ke 1 | **lanjut** |

#### 2.1 Bedah kodenya

- **`int hitungRam = 0;`** adalah variabel biasa. Setiap kali papan bangun, program mulai dari awal, dan baris ini mengisinya lagi dengan 0. Itu sebabnya `RAM` selalu 1.
- **`RTC_DATA_ATTR int hitungRtc = 0;`** disimpan di memori RTC. Angka 0 di situ hanya dipakai saat papan **benar-benar baru menyala**. Setelah bangun dari *deep sleep*, isinya dibiarkan apa adanya.
- **`arsip.getInt("hitung", 0) + 1`** lalu **`arsip.putInt(...)`** adalah NVS dari Modul 8. Kali ini kita **sengaja** menulis NVS setiap 5 detik untuk percobaan. Untuk program sungguhan, ingat aturan Modul 8: tulis NVS hanya kalau isinya berubah, dan jangan menulisnya terus-menerus selama berhari-hari. Setelah selesai, lanjutkan ke Praktik 3 supaya sketsa ini tidak terus berjalan.
- **`namaAlasan()`** membaca alasan papan menyala dengan `esp_reset_reason()`, seperti halaman status Node 1 v1.0 (Modul 8): `POWERON` (baru dinyalakan atau tombol EN), `SW` (*restart* oleh program), dan `DEEPSLEEP` (bangun dari tidur dalam).
- **`delay(1000)` saat LED menyala** memberi kesempatan 1 detik untuk menahan tombol. Aturan Modul 8 "jangan `delay()` di `loop()`" berlaku untuk perangkat yang harus selalu siap seperti Node 1. Papan yang hidup dari tidur ke tidur memang bekerja singkat lalu tidur lagi, jadi jeda pendek di `setup()` tidak merugikan siapa pun.

> ➡️ **Selesai Praktik 2?** Lanjut ke [Praktik 3](#praktik-3--bangun-oleh-alarm-atau-tombol-dan-tidur-ringan-30-menit).

### Praktik 3 — Bangun oleh alarm atau tombol, dan tidur ringan (30 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** dan **Serial Monitor**, **papan Node 1** dari laptop dengan **MB102 dimatikan**, LED D4 dan tombol D13. Bagian 3B (*light sleep* dengan alarm timer) juga bisa dicoba di Wokwi dengan [`diagram.json`](kode/modul09_tidur_ringan/diagram.json) rangkaian kecil Modul 8. Konsep yang dipakai: 4.

#### 3.1 Dua pintu bangun: alarm timer dan tombol

1. Buat sketsa baru bernama `modul09_bangun_tombol`, tempel kode ini, lalu klik **Upload**:

   ```cpp
   // Modul 9 - Praktik 3: bangun oleh alarm timer ATAU oleh tombol
   // Rangkaian: LED status di D4 dan tombol di D13 (kaki seberangnya ke GND).
   // Papan tidur 20 detik. Tekan tombol D13 kapan saja untuk membangunkannya lebih cepat.

   #include "driver/rtc_io.h"  // pengatur pin RTC: pin yang tetap "terjaga" selama deep sleep

   const int PIN_LED_STATUS = 4;
   const gpio_num_t PIN_TOMBOL_BANGUN = GPIO_NUM_13;  // D13 termasuk pin RTC, jadi bisa membangunkan papan
   const unsigned long LAMA_TIDUR_DETIK = 20;

   RTC_DATA_ATTR int jumlahBangun = 0;
   RTC_DATA_ATTR int jumlahOlehTombol = 0;

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_LED_STATUS, OUTPUT);
     rtc_gpio_deinit(PIN_TOMBOL_BANGUN);  // kembalikan D13 menjadi pin biasa setelah tidur
     pinMode(PIN_TOMBOL_BANGUN, INPUT_PULLUP);

     jumlahBangun++;
     esp_sleep_wakeup_cause_t penyebab = esp_sleep_get_wakeup_cause();
     Serial.print("Bangun ke-");
     Serial.print(jumlahBangun);
     if (penyebab == ESP_SLEEP_WAKEUP_EXT0) {
       jumlahOlehTombol++;
       Serial.println(": dibangunkan TOMBOL.");
     } else if (penyebab == ESP_SLEEP_WAKEUP_TIMER) {
       Serial.println(": dibangunkan alarm timer.");
     } else {
       Serial.println(": baru dinyalakan.");
     }
     Serial.print("Sejauh ini ");
     Serial.print(jumlahOlehTombol);
     Serial.println(" kali dibangunkan tombol.");

     digitalWrite(PIN_LED_STATUS, HIGH);
     delay(500);
     digitalWrite(PIN_LED_STATUS, LOW);

     // Tunggu tombol dilepas dulu. Kalau masih ditekan saat tidur, papan langsung bangun lagi.
     while (digitalRead(PIN_TOMBOL_BANGUN) == LOW) {
       delay(10);
     }
     delay(50);  // tunggu pantulan tombol reda, supaya papan tidak langsung bangun lagi

     Serial.printf("Tidur %lu detik. Tekan tombol untuk membangunkan lebih cepat.\n", LAMA_TIDUR_DETIK);
     Serial.flush();
     esp_sleep_enable_timer_wakeup(LAMA_TIDUR_DETIK * 1000000ULL);  // pintu bangun 1: alarm timer
     esp_sleep_enable_ext0_wakeup(PIN_TOMBOL_BANGUN, 0);              // pintu bangun 2: D13 menjadi LOW
     rtc_gpio_pullup_en(PIN_TOMBOL_BANGUN);   // pastikan pull-up D13 tetap aktif selama tidur
     rtc_gpio_pulldown_dis(PIN_TOMBOL_BANGUN);
     esp_deep_sleep_start();
   }

   void loop() {
     // Tidak pernah dijalankan.
   }
   ```

2. Buka **Serial Monitor**. Papan tidur 20 detik setiap kali.
3. Saat papan tidur, **tekan tombol D13 sebentar**. Papan langsung bangun dengan pesan `dibangunkan TOMBOL.` Setelah itu, jangan sentuh tombolnya: 20 detik kemudian, alarm membangunkannya.

**Hasilnya** (contoh keluaran di papan asli; baris ROM tidak ditampilkan):

```text
Bangun ke-1: baru dinyalakan.
Sejauh ini 0 kali dibangunkan tombol.
Tidur 20 detik. Tekan tombol untuk membangunkan lebih cepat.
Bangun ke-2: dibangunkan TOMBOL.
Sejauh ini 1 kali dibangunkan tombol.
Tidur 20 detik. Tekan tombol untuk membangunkan lebih cepat.
Bangun ke-3: dibangunkan alarm timer.
Sejauh ini 1 kali dibangunkan tombol.
Tidur 20 detik. Tekan tombol untuk membangunkan lebih cepat.
```

#### 3.2 Bedah kodenya

- **`esp_sleep_enable_ext0_wakeup(PIN_TOMBOL_BANGUN, 0)`** memasang pintu bangun kedua: "bangunkan aku kalau D13 menjadi LOW". Pintu ini disebut **ext0** (*external 0*), dan hanya bisa dipasang di pin RTC, yaitu pin yang tetap "terjaga" selama tidur. D13 termasuk pin RTC, jadi tombol Node 1 bisa langsung dipakai.
- **`rtc_gpio_pullup_en(...)`**: memastikan D13 tetap ditarik ke HIGH oleh *pull-up* versi RTC selama tidur. Di ESP32 klasik (chip di DevKit V1, Modul 5), `INPUT_PULLUP` dari `pinMode()` sebenarnya sudah menyalakan *pull-up* yang sama, tetapi contoh resmi Espressif tetap memasangnya sendiri sebelum tidur supaya pasti: kaki D13 yang mengambang bisa membuat papan terbangun sendiri tanpa tombol ditekan. Begitu bangun, **`rtc_gpio_deinit(...)`** mengembalikan D13 menjadi pin biasa supaya `digitalRead()` bisa membacanya lagi.
- **`esp_sleep_get_wakeup_cause()`** menjawab siapa yang membangunkan: `ESP_SLEEP_WAKEUP_EXT0` (tombol), `ESP_SLEEP_WAKEUP_TIMER` (alarm), atau lainnya (baru dinyalakan).
- **Menunggu tombol dilepas sebelum tidur** itu penting. Kalau tombol masih ditekan saat papan tidur, pintu ext0 langsung terbuka dan papan bangun lagi tanpa henti. Setelah tombol dilepas, sketsa menunggu 50 ms lagi supaya pantulan tombol (Modul 8) reda dulu.

#### 3.3 Bagian B: tidur ringan (*light sleep*)

Sekarang bandingkan dengan tidur ringan. Bagian ini bisa dikerjakan di papan Node 1 atau di Wokwi (proyek ESP32 baru, `diagram.json` [rangkaian kecil](kode/modul09_tidur_ringan/diagram.json)).

1. Buat sketsa baru bernama `modul09_tidur_ringan`, tempel kode ini, lalu klik **Upload** (atau **▶** di Wokwi):

   ```cpp
   // Modul 9 - Praktik 3 (bagian B): light sleep, tidur ringan yang tidak melupakan apa pun
   // Rangkaian: tombol di D13 (kaki seberangnya ke GND), sama dengan Praktik 3.
   // Papan tidur ringan 3 detik, lalu LANJUT dari baris berikutnya. Tombol juga bisa membangunkannya.

   const gpio_num_t PIN_TOMBOL_BANGUN = GPIO_NUM_13;
   const unsigned long LAMA_TIDUR_DETIK = 3;

   int hitungRam = 0;  // variabel biasa di RAM: kali ini TIDAK hilang

   void setup() {
     Serial.begin(115200);
     pinMode(PIN_TOMBOL_BANGUN, INPUT_PULLUP);
     Serial.println("Praktik 3B - light sleep: isi RAM dan jam millis() tetap terjaga.");

     esp_sleep_enable_timer_wakeup(LAMA_TIDUR_DETIK * 1000000ULL);  // pintu bangun 1: alarm timer
     gpio_wakeup_enable(PIN_TOMBOL_BANGUN, GPIO_INTR_LOW_LEVEL);     // pintu bangun 2: D13 menjadi LOW
     esp_sleep_enable_gpio_wakeup();
   }

   void loop() {
     hitungRam++;
     Serial.printf("Putaran %d, millis() = %lu ms. Tidur ringan...\n", hitungRam, millis());
     Serial.flush();           // kirim dulu semua huruf; selama tidur ringan, Serial ikut berhenti
     esp_light_sleep_start();  // tidur ringan; begitu bangun, program LANJUT ke baris di bawah ini

     if (esp_sleep_get_wakeup_cause() == ESP_SLEEP_WAKEUP_GPIO) {
       Serial.println("Dibangunkan tombol.");
       while (digitalRead(PIN_TOMBOL_BANGUN) == LOW) {  // tunggu tombol dilepas, supaya tidak langsung bangun lagi
         delay(10);
       }
       delay(50);  // tunggu pantulan tombol reda
     }
   }
   ```

2. Buka **Serial Monitor**. Di papan asli, tekan tombol D13 sesekali saat papan sedang tidur.

**Hasilnya** di Wokwi (tanpa tombol):

```text
Praktik 3B - light sleep: isi RAM dan jam millis() tetap terjaga.
Putaran 1, millis() = 514 ms. Tidur ringan...
Putaran 2, millis() = 3527 ms. Tidur ringan...
Putaran 3, millis() = 6532 ms. Tidur ringan...
Putaran 4, millis() = 9539 ms. Tidur ringan...
Putaran 5, millis() = 12546 ms. Tidur ringan...
Putaran 6, millis() = 15554 ms. Tidur ringan...
```

Tiga hal yang berbeda dari *deep sleep*:

- **Tidak ada baris ROM dan tidak ada `setup()` lagi.** Program **lanjut** dari baris sesudah `esp_light_sleep_start()`, lalu `loop()` berputar seperti biasa.
- **`hitungRam` terus naik** (1, 2, 3, …): isi RAM tetap terjaga selama tidur ringan.
- **`millis()` ikut berjalan selama tidur**: setiap putaran bertambah sekitar 3.000 ms, sesuai lama tidurnya.

Di papan asli, menekan tombol membangunkan papan lebih cepat dengan pesan `Dibangunkan tombol.` Untuk tidur ringan, pintunya berbeda: `gpio_wakeup_enable()` dan `esp_sleep_enable_gpio_wakeup()` bisa memakai pin mana pun, bukan hanya pin RTC. **Di Wokwi, pintu tombol ini belum disimulasikan**: menekan tombol hijau tidak membangunkan papan; hanya alarm timer yang bekerja.

> ➡️ **Selesai Praktik 3?** Lanjut ke [Praktik 4](#praktik-4--kerangka-node-2-di-papan-kedua-25-menit).

### Praktik 4 — Kerangka Node 2 di papan kedua (25 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** dan **Serial Monitor**, **papan kedua** (calon Node 2) yang dicolokkan ke laptop, DS18B20 tahan air + modul adaptornya, dan 3 kabel jumper **betina–betina**. Papan kedua tidak dipasang di breadboard: kabel betina dicolokkan langsung ke kaki papannya. Konsep yang dipakai: 4 dan 5.

Papan Node 1 boleh tetap tercolok ke laptop; minggu ini laptopmu memang melayani dua papan. Yang penting, **pilih port yang benar** setiap kali mengunggah (Modul 2).

1. **Pasang DS18B20 ke papan kedua** (papan belum dicolokkan ke apa pun):

   | Kaki modul adaptor DS18B20 | Kabel (betina–betina) | Kaki papan kedua |
   | :--- | :--- | :--- |
   | **VCC** | oranye | **3V3** (deretan kanan, paling bawah) |
   | **GND** | hitam | **GND** (deretan kanan, di atas 3V3) |
   | **DAT** | ungu | **D27** (deretan kiri, kaki ke-10 dari atas) |

   Arah "kiri" dan "kanan" di sini dilihat dari atas, dengan antena di atas dan colokan USB di bawah, seperti gambar peta pin Modul 5. Ingat Modul 7: DS18B20 diberi **3,3 V**, bukan 5 V. Resistor *pull-up* 4,7 kΩ sudah ada di modul adaptornya. D27 adalah pin DS18B20 untuk Node 2 menurut `PETA-PIN.md`.

2. Colokkan **papan kedua** ke laptop. Di Arduino IDE, buat sketsa baru bernama `modul09_kerangka_node2`, tempel kode ini, pilih **port papan kedua** (port yang baru muncul di daftar setelah papan kedua dicolokkan; port papan Node 1 sudah ada sebelumnya), lalu klik **Upload**:

   ```cpp
   // Modul 9 - Praktik 4: kerangka Node 2 "Kebun" - bangun, baca suhu, tidur 30 detik
   // Papan ESP32 KEDUA (calon Node 2), menurut PETA-PIN.md bagian Node 2:
   //   DS18B20 + modul adaptornya: VCC ke 3V3, GND ke GND, DAT ke D27. Diberi 3,3 V, BUKAN 5 V.
   //   LED biru bawaan papan (GPIO 2) menyala selama papan bangun.
   // Library: OneWire 2.3.8 dan DallasTemperature 4.0.6 (sudah terpasang sejak Modul 7).

   #include <OneWire.h>
   #include <DallasTemperature.h>

   const int PIN_LED_BANGUN = 2;              // LED biru bawaan: tanda "sedang bangun"
   const int PIN_SATU_KABEL = 27;             // bus 1-Wire Node 2: DS18B20
   const unsigned long LAMA_TIDUR_DETIK = 30;

   RTC_DATA_ATTR int jumlahBangun = 0;        // memori RTC: bertahan selama deep sleep
   RTC_DATA_ATTR float suhuSebelumnya = NAN;  // bacaan dari bangun sebelumnya (NAN = belum ada)

   OneWire satuKabel(PIN_SATU_KABEL);
   DallasTemperature sensorSuhu(&satuKabel);

   void setup() {
     pinMode(PIN_LED_BANGUN, OUTPUT);
     digitalWrite(PIN_LED_BANGUN, HIGH);
     Serial.begin(115200);
     jumlahBangun++;

     sensorSuhu.begin();
     sensorSuhu.requestTemperatures();             // ukur sekarang: sampai 750 ms
     float suhu = sensorSuhu.getTempCByIndex(0);   // -127 kalau sensor tidak menjawab

     Serial.print("Bangun ke-");
     Serial.print(jumlahBangun);
     if (esp_sleep_get_wakeup_cause() == ESP_SLEEP_WAKEUP_TIMER) {
       Serial.print(" (timer). ");
     } else {
       Serial.print(" (baru dinyalakan). ");
     }
     if (suhu == DEVICE_DISCONNECTED_C) {
       Serial.println("DS18B20 tidak terbaca: periksa kabel DAT ke D27, VCC ke 3V3, dan GND.");
     } else {
       Serial.printf("Suhu %.1f C", suhu);
       if (!isnan(suhuSebelumnya)) {
         Serial.printf(" (bangun sebelumnya %.1f C)", suhuSebelumnya);
       }
       Serial.println(".");
       suhuSebelumnya = suhu;
     }

     Serial.printf("Bangun selama %lu ms. Tidur %lu detik.\n", millis(), LAMA_TIDUR_DETIK);
     Serial.flush();
     digitalWrite(PIN_LED_BANGUN, LOW);
     esp_sleep_enable_timer_wakeup(LAMA_TIDUR_DETIK * 1000000ULL);
     esp_deep_sleep_start();
   }

   void loop() {
     // Tidak pernah dijalankan: Node 2 selalu mulai dari setup() setiap kali bangun.
   }
   ```

3. Buka **Serial Monitor** untuk port papan kedua. **LED biru bawaan papan** (GPIO 2) menyala sekitar 1 detik setiap kali papan bangun, lalu padam selama papan tidur 30 detik.

**Hasilnya** (contoh keluaran di papan asli; baris ROM tidak ditampilkan):

```text
Bangun ke-1 (baru dinyalakan). Suhu 27.4 C.
Bangun selama 806 ms. Tidur 30 detik.
Bangun ke-2 (timer). Suhu 27.4 C (bangun sebelumnya 27.4 C).
Bangun selama 801 ms. Tidur 30 detik.
Bangun ke-3 (timer). Suhu 27.6 C (bangun sebelumnya 27.4 C).
Bangun selama 802 ms. Tidur 30 detik.
```

Genggam ujung baja *probe*-nya sebentar: suhu pada bangun berikutnya naik, dan kamu bisa melihat bacaan sebelumnya di sebelahnya.

#### 4.1 Bedah kodenya

- **Inilah pola semua sensor bertenaga baterai:** bangun → kerjakan secepatnya → tidur. Seluruh pekerjaan ada di `setup()`, dan `loop()` dibiarkan kosong.
- **`suhuSebelumnya` di memori RTC** membuat papan "ingat" bacaan dari bangun sebelumnya tanpa menulis NVS. Di Modul 14, cara yang sama dipakai untuk menyimpan hal-hal kecil di antara dua kali bangun, misalnya kanal radio ESP-NOW.
- **`requestTemperatures()` menunggu sampai 750 ms**, waktu yang dibutuhkan DS18B20 untuk mengukur dengan ketelitian penuh (Modul 7). Itulah sebagian besar dari "Bangun selama 800-an ms". Semakin singkat papan bangun, semakin awet baterainya (Konsep 9).
- **LED biru di GPIO 2** sengaja dinyalakan di awal dan dipadamkan sebelum tidur. Saat papan nanti hidup dari baterai tanpa laptop, LED inilah satu-satunya tanda bahwa papan masih bangun teratur.
- **`Bangun selama … ms`** dihitung dari `millis()`, yang mulai dari 0 setiap kali papan bangun dari *deep sleep*.

Biarkan papan kedua tetap menjalankan sketsa ini: Praktik 5 dan 6 memakainya. **Cabut USB papan kedua dari laptop** sebelum lanjut, tetapi biarkan ketiga kabel DS18B20 terpasang.

> ⬆️ **Selesai Praktik 4?** Kembali ke [Konsep 6](#6-baterai-li-ion-18650-tegangannya-berubah-kapasitasnya-sering-dilebih-lebihkan) (➡️ di akhir Konsep 7 akan mengantarmu ke Praktik 5).

### Praktik 5 — Rakit catu baterai: 18650 → TP4056 → MT3608 (40 menit)

> 🖥️ **Alat dan komponen:** breadboard mini, baterai 18650 dan dudukannya, modul TP4056 dengan proteksi, modul MT3608, kapasitor elektrolit 100 µF, **multimeter** di posisi **V⎓ 20** dan obeng kecil, *charger* HP dengan kabel yang cocok untuk colokan TP4056, sekitar 10 kabel jumper **jantan–betina** dan 2 kabel **jantan–jantan** pendek sebagai kabel cadangan (titik ukur multimeter), serta **papan kedua** yang masih menjalankan sketsa Praktik 4 (DS18B20 tetap terpasang). Sisihkan juga **1–3 jam** untuk mengisi baterai di 5.3, yang harus ditunggui. Konsep yang dipakai: 1, 3, 6, dan 7.

Sebelum mulai, baca lagi kotak **Aturan keselamatan minggu ini** di awal modul. Kerjakan di meja yang bersih dari benda logam, di atas permukaan yang tidak mudah terbakar. **Baterai baru dimasukkan ke dudukannya setelah kabelnya terpasang dan diperiksa, dan TP4056 baru disambung ke baterai setelah kutubnya terbukti benar.**

Gambar ini memperlihatkan rangkaian lengkapnya di akhir Praktik 5. Nomor merah di gambar dijelaskan di daftar bawahnya, lengkap dengan nomor langkahnya (5.2–5.7). Modul-modulnya tidak ditancapkan ke breadboard (jarak kakinya tidak cocok dengan jarak lubang breadboard); setiap kakinya disambung dengan ujung betina kabel jantan–betina, lalu ujung jantannya ditancapkan ke lubang yang disebut di tabel.

![Ilustrasi rangkaian baterai papan kedua di breadboard mini pada akhir Praktik 5; rel atas minus adalah GND, rel atas plus berisi 5,0 volt dari MT3608, dan modul tidak ditancapkan, melainkan setiap kakinya disambung kabel jantan–betina. Kiri, dudukan 18650 berisi baterai: kabel merah dari kutub plus ke 6d dan kabel hitam dari kutub minus ke 3e (penanda 1). Di atas breadboard, TP4056 dengan colokan USB menghadap ke atas dan kaki di bawahnya: OUT minus ke rel atas minus, B minus ke 3c, B plus ke 6c, dan OUT plus ke 12d. Di sebelah kanannya, MT3608: VIN plus ke 12b, VIN minus ke rel atas minus kolom 10, VOUT plus (kabel oranye) ke rel atas plus kolom 24, dan VOUT minus ke rel atas minus kolom 26 (penanda 2). Penanda 3 di rel atas: atur MT3608 ke 5,0 volt dulu. Kapasitor 100 mikrofarad di kolom 20 di antara rel plus dan rel minus (penanda 4). Kanan, papan kedua tegak dengan USB dicabut dan DS18B20 tetap terpasang (tidak digambar); di deretan kaki kirinya tertulis D27, GND, dan VIN, deretan kaki kanannya digambar pudar dengan nama 3V3 dan GND di luar papan, dan di dekat colokan USB ada LED merah dan LED biru. VIN dari rel atas plus kolom 29 dan GND dari rel atas minus kolom 28; kedua kabelnya lewat di atas breadboard tanpa bersilangan (penanda 5). Semua kabel modul berjalan di antara dua kolom atau dua baris, lalu berbelok masuk ke lubangnya. Daftar bawah: 5.2 baterai, hitam 3e, merah 6d, B minus 3c, B plus 6c, baterai dimasukkan terakhir; 5.4 OUT plus 12d dengan VIN plus 12b, OUT minus, VIN minus, dan VOUT minus ke rel atas minus, VOUT plus ke rel atas plus; 5.5 atur MT3608 ke 5,0 volt dulu, ukur di rel atas plus dan minus; 5.6 kapasitor 100 mikrofarad, kaki panjang plus ke rel plus; 5.7 papan kedua, VIN ke rel atas plus kolom 29, GND ke rel atas minus kolom 28](aset/rangkaian-baterai.png)

#### 5.1 Kenali modul-modulnya

![Kolase Kenali komponen catu baterai, empat kartu foto; subjudulnya: bentuk sebenarnya bisa sedikit berbeda antarpabrik, jadi selalu ikuti tulisan di modulmu. Satu, foto baterai Li-ion 18650 hijau di samping baterai AA biasa di atas kertas berpetak; catatan: 18 kali 65 milimeter, 3,0 sampai 4,2 volt, ujung menonjol adalah kutub plus, kapasitas asli paling besar sekitar 3.500 miliampere-jam. Dua, foto modul TP4056 biru dengan colokan micro-USB di kiri dan tulisan OUT plus, B plus, B minus, OUT minus di ujung kanan; catatan: dekat colokan ada bantalan plus dan minus (IN), lampu merah berarti sedang mengisi, biru atau hijau berarti penuh, colokannya bisa USB-C atau micro-USB. Tiga, foto modul MT3608 biru dengan tulisan VOUT plus dan VOUT minus di kiri, VIN plus dan VIN minus di kanan, potensiometer biru bersekrup kuningan, dan kumparan bertuliskan 220; catatan: VIN dari OUT TP4056, VOUT ke papan, sekrup kuningan mengatur tegangan keluaran, tulisan MT3608 ada di sisi belakang. Empat, foto modul INA219 biru dengan hambatan R100 dan deretan kaki bertuliskan Vcc, Gnd, Scl, Sda, Vin minus, Vin plus; catatan: urutan kaki bisa berbeda, R100 adalah hambatan 0,1 ohm, alamat I2C 0x40, modul di kit sering berwarna ungu](aset/kenali-modul-baterai.jpg)

*Foto dari Wikimedia Commons: baterai 18650 dan AA oleh Lead holder (CC BY-SA 3.0), TP4056 oleh -stk (dipotong, CC BY-SA 4.0), MT3608 oleh Ogidya (dipotong, CC BY-SA 4.0), INA219 oleh oomlout (dipotong, CC BY-SA 2.0); susunan kolase oleh penulis. Rinciannya di [📚 Sumber & atribusi gambar](#-sumber--atribusi-gambar).*

Baca tulisan kecil di samping setiap kaki modulmu. Urutan kaki bisa berbeda antarpenjual, jadi **selalu ikuti tulisannya**, bukan posisinya di gambar.

#### 5.2 Pasang sisi baterai

Breadboard mini punya dua pasang rel di tepinya, sama seperti breadboard besar. Di praktik ini kita memakai **rel atas**: rel **(−)** menjadi **GND**, dan rel **(+)** nanti berisi **5,0 V** dari MT3608.

| Kabel | Dari | Ke breadboard mini | Gunanya |
| :--- | :--- | :--- | :--- |
| hitam dudukan baterai | dudukan 18650 | **3e** | kutub (−) baterai |
| merah dudukan baterai | dudukan 18650 | **6d** | kutub (+) baterai |
| jantan–betina hitam | kaki **B−** TP4056 | **3c** | B− ke kutub (−) |
| jantan–betina merah | kaki **B+** TP4056 | **6c** | B+ ke kutub (+) |

1. Pastikan dudukan masih **kosong** (baterai belum dimasukkan), lalu pasang **dua kabel dudukan saja**: hitam ke **3e**, merah ke **6d**. Selagi dudukan masih kosong, tancapkan juga kedua kabel pendek cadangan di **6a** dan **3a**, lalu renggangkan ujung atasnya: keduanya menjadi titik ukur di langkah 3. Kabel B− dan B+ TP4056 baru dipasang setelah kutub baterainya terbukti benar (di bawah).
2. Masukkan baterai ke dudukannya. Ujung **(+) yang menonjol** bertemu tanda **+** di dudukan.
3. **Ukur tegangan baterai.** Periksa dulu multimeternya: sakelar di **V⎓ 20**, *probe* hitam di lubang **COM**, dan *probe* merah di lubang **VΩmA**, bukan **10A** (aturan keselamatan nomor 7). Ujung atas kedua kabel cadangan di **6a** dan **3a** kini tersambung langsung ke kutub baterai, jadi **tidak boleh bersentuhan** (aturan keselamatan nomor 1). Tempelkan *probe* merah ke ujung logam kabel di kolom 6 dan *probe* hitam ke kabel di kolom 3.

**Hasilnya:** antara **3,0 V** dan **4,2 V**. Baterai baru biasanya terbaca sekitar 3,5–3,8 V. Catat angkanya.

- **Angkanya negatif** (misalnya `-3.71`)? Periksa dulu *probe*-mu: merah di kolom 6, hitam di kolom 3. *Probe* yang tertukar juga membuat angkanya minus (Modul 2). Kalau posisinya sudah benar, baterainya terbalik: **keluarkan baterainya**, periksa tanda + di dudukan dan kabel di kolom 3 dan 6, lalu ulangi langkah 2–3. TP4056 belum tersambung, jadi belum ada yang rusak.
- **0 V, atau di bawah 2,5 V?** Buka "Baterai terbaca 0 V atau sangat rendah" di 🚨. Jangan diisi dulu.
- **Antara 2,5 V dan 3,0 V?** Baterainya sangat kosong, tetapi masih boleh diisi. Lanjutkan, dan di 5.3 raba baterainya lebih sering.

Cabut lagi kedua kabel cadangan dari 6a dan 3a. Selama baterai terpasang, **kolom 3 dan 6 hanya untuk kabel di tabel**. Satu-satunya pengecualian adalah kedua kabel cadangan ini, **sebentar saja** saat mengukur tegangan baterai (5.3 dan 🚨): tancapkan satu per satu, jaga supaya ujung bebasnya tidak pernah bersentuhan, lalu cabut lagi begitu angkanya terbaca.

**Sambungkan TP4056 ke baterai.** Kalau angkanya sudah positif dan kedua kabel cadangan sudah dicabut: **keluarkan lagi baterainya**, pasang kabel **B−** ke **3c** dan **B+** ke **6c**, periksa sekali lagi (kolom **3**: kabel hitam dudukan dan B−; kolom **6**: kabel merah dudukan dan B+), lalu masukkan lagi baterainya dengan arah yang sama seperti tadi.

#### 5.3 Isi baterainya sampai penuh

1. Colokkan *charger* HP ke stopkontak, lalu ke colokan USB TP4056. Lampu **merah** di TP4056 menyala: baterai sedang diisi.
2. **Tunggui pengisiannya** (aturan keselamatan nomor 4). Baterai dari setengah isi butuh sekitar 1–2 jam, dan dari kosong sekitar 3 jam. Sambil menunggu, kamu boleh membaca [Konsep 8](#8-mengukur-arus-ina219-bukan-multimeter) dan [Konsep 9](#9-menghitung-umur-baterai), lalu kembali ke sini untuk langkah 3. Kotak ⬆️ di awal Konsep 8 ditulis untuk yang sudah selesai Praktik 5, jadi abaikan dulu. Sesekali raba baterainya: hangat masih wajar, **panas** berarti cabut *charger*-nya dan buka 🚨. Modul TP4056 sendiri memang hangat, bahkan panas: jangan disentuh.
3. Begitu lampu merah padam dan lampu **biru** (di sebagian modul hijau) menyala, baterai sudah penuh. Cabut *charger*-nya, lalu ukur lagi tegangan baterai seperti langkah 5.2.3.

**Hasilnya:** sekitar **4,2 V** (biasanya 4,15–4,20 V; sampai sekitar 4,25 V masih wajar karena toleransi TP4056). Catat angkanya di `catatan-modul09.md`.

#### 5.4 Sambungkan TP4056 ke MT3608

Kapasitor dan papan kedua **belum** dipasang di langkah ini. Baterai sudah di dudukannya, jadi OUT+ dan OUT− sudah berlistrik: pasang kabel satu per satu, dan tancapkan kabel **VIN+ MT3608 ke 12b paling akhir**. Begitu kabel itu masuk, MT3608 langsung bekerja, dan keluarannya bisa jauh di atas 5 V sebelum diatur.

| Kabel (jantan–betina) | Dari kaki | Ke breadboard mini | Gunanya |
| :--- | :--- | :--- | :--- |
| merah | **OUT+** TP4056 | **12d** | keluaran baterai yang sudah dijaga proteksi |
| hitam | **OUT−** TP4056 | rel atas **(−)** | GND seluruh rangkaian |
| merah | **VIN+** MT3608 | **12b** | MT3608 mengambil listrik dari OUT+ |
| hitam | **VIN−** MT3608 | rel atas **(−)** | GND |
| oranye | **VOUT+** MT3608 | rel atas **(+)** | keluaran 5 V (setelah diatur) |
| hitam | **VOUT−** MT3608 | rel atas **(−)** | GND (di dalam modul, sudah satu dengan VIN−) |

Tidak ada yang tersambung ke **IN+/IN−** TP4056: listrik untuk mengisi masuk lewat colokan USB-nya.

#### 5.5 Atur MT3608 ke 5,0 V, tanpa beban

![Ilustrasi mengatur MT3608 ke 5,0 volt sebelum papan disambung; tanpa beban, kabel langkah 5.4 tetap terpasang tetapi tidak digambar, papan kedua dan kapasitor belum dipasang, dan tegangan diukur di rel atas plus dan minus breadboard mini. Kiri atas, modul MT3608 dilihat dari depan, dengan bantalan VIN minus, VIN plus, VOUT minus, VOUT plus, potensiometer biru 3296, dan kumparan 220; ujung obeng bergagang merah menempel di sekrup kuningan potensiometer, dengan panah putar dua arah. Keterangan: putar sekrup kuningan pelan-pelan, sekitar setengah putaran setiap kali; bisa diputar sekitar 15 sampai 25 putaran penuh, dan di ujungnya memutar terus tidak mengubah apa pun. Kanan, multimeter kuning di posisi V searah 20 dengan layar 5.00; kabel probe hitam dari colokan COM ke kabel cadangan di rel minus, dan kabel probe merah dari colokan V ohm mA ke kabel cadangan di rel plus; keduanya di potongan rel atas breadboard mini. Kiri bawah, sambil memutar lihat multimeter: angkanya makin dekat ke 5,0 volt, lanjutkan ke arah yang sama; angkanya makin jauh, putar ke arah sebaliknya; tidak berubah, terus putar dengan sabar; 4,95 sampai 5,05 volt, berhenti dan tunggu 10 detik, angkanya harus tetap](aset/atur-mt3608.png)

1. Tancapkan kabel pendek cadangan di rel atas **(+)** dan rel atas **(−)**. Tempelkan *probe* merah ke kabel rel (+) dan *probe* hitam ke kabel rel (−).
2. **Baca dulu angkanya tanpa memutar apa pun.** Angka berapa pun mungkin muncul, dari sekitar tegangan baterai sampai lebih dari 20 V. Kalau layar hanya menunjukkan **1** di kiri (atau `OL`), tegangannya di atas 20 V, di luar jangkauan posisi V⎓ 20 (Modul 2). Tidak apa-apa: putar dengan sabar ke satu arah di langkah 3 sampai angka muncul, dan kalau setelah sekitar 25 putaran tetap **1**, putar ke arah sebaliknya. Itulah sebabnya papan ESP32 belum boleh disambung.
3. Dengan obeng kecil, putar sekrup kuningan potensiometer MT3608 **pelan-pelan**, sekitar setengah putaran setiap kali, sambil melihat multimeter:
   - Kalau angkanya **makin dekat ke 5,0 V**, lanjutkan ke arah yang sama.
   - Kalau angkanya **makin jauh dari 5,0 V**, putar ke arah sebaliknya.
   - Kalau angkanya **tidak berubah**, teruskan memutar. Potensiometer ini bisa diputar sekitar 15–25 putaran penuh, dan di bagian ujungnya, memutar terus tidak mengubah apa pun.
4. Berhenti saat multimeter menunjukkan **4,95–5,05 V**. Tunggu 10 detik: angkanya harus tetap.

**Hasilnya:** `5.00` di layar multimeter (boleh 4,95–5,05 V).

Kalau angkanya **tidak mau turun di bawah tegangan baterai** (misalnya berhenti di 3,9 V), potensiometernya justru sudah di ujung bawah: MT3608 tidak bisa menurunkan tegangan, jadi keluarannya hanya meneruskan tegangan baterai. Putar ke arah sebaliknya sampai angkanya naik ke 5,0 V.

#### 5.6 Pasang kapasitor 100 µF

1. Baca tulisan di badan kapasitor: tegangannya harus **10 V atau lebih** (misalnya "16V" atau "25V").
2. Tancapkan kaki **panjang (+)** ke rel atas **(+)**, dan kaki pendek di sisi **bergaris (−)** ke rel atas **(−)**, di mana saja sepanjang relnya. Kalau terbalik, kapasitornya bisa rusak.

Kapasitor sengaja dipasang **sesudah** MT3608 diatur. Sebelum diatur, keluarannya bisa lebih tinggi daripada batas tegangan kapasitornya.

#### 5.7 Sambungkan papan kedua

1. Pastikan **USB papan kedua tercabut** (aturan keselamatan nomor 6).
2. Pasang dua kabel jantan–betina: ujung betina ke kaki papan kedua, ujung jantan ke breadboard mini.

   | Kabel (jantan–betina) | Kaki papan kedua | Ke breadboard mini |
   | :--- | :--- | :--- |
   | merah | **VIN** (deretan kiri, paling bawah) | rel atas **(+)** kolom 29 |
   | hitam | **GND** (deretan kiri, tepat di atas VIN) | rel atas **(−)** kolom 28 |

3. LED merah papan kedua langsung menyala. Perhatikan **LED biru** di dekatnya: ia menyala sekitar 1 detik, padam, lalu menyala lagi kira-kira **setiap 30 detik**.
4. Ukur lagi rel (+) dengan multimeter: tetap sekitar **5,0 V**. Saat LED biru menyala, angkanya boleh turun sedikit. Setelah itu, cabut kedua kabel cadangan dari rel (+) dan rel (−): ujung bebasnya yang berlistrik bisa saling bersentuhan dan membuat korsleting.

**Hasilnya:** papan kedua kini hidup dari baterai, tanpa laptop. Tidak ada Serial Monitor, jadi LED biru itulah tanda bahwa papan bangun, membaca suhu, lalu tidur lagi.

Biarkan rangkaian ini menyala. Di Praktik 6, kita mengukur berapa arus yang ditariknya.

#### 5.8 Bedah langkahnya

- **Mengapa B+/B− dipisah dari OUT+/OUT−?** B+ dan B− langsung ke baterai. OUT+ tersambung langsung ke B+, tetapi OUT− baru tersambung ke B− lewat "sakelar" milik penjaga (chip proteksi). Semua beban diambil dari OUT, jadi kalau terjadi korsleting atau baterainya terlalu kosong, penjaga memutusnya (Konsep 7).
- **Mengapa MT3608 diatur tanpa beban?** Supaya papan ESP32 tidak pernah sedetik pun menerima tegangan yang salah. Mengatur sambil terpasang ke papan sama dengan menebak sambil berharap.
- **Mengapa 5,0 V, bukan 3,3 V?** Pin VIN masuk ke regulator papan yang butuh ruang napas sekitar 1 V lebih (Konsep 1). MT3608 juga tidak bisa diatur ke 3,3 V untuk pin 3V3: ia tidak bisa menurunkan tegangan, jadi dengan baterai penuh keluarannya tetap sekitar 4 V, padahal pin 3V3 hanya tahan sekitar 3,6 V.
- **Kapasitor 100 µF** menjadi "tandon kecil" di rel 5 V. Saat papan bangun dan arusnya melonjak, kapasitor menyumbang dari isinya supaya tegangannya tidak anjlok (Konsep 3).

> ⬆️ **Selesai Praktik 5?** Kembali ke [Konsep 8](#8-mengukur-arus-ina219-bukan-multimeter) (➡️ di sana akan mengantarmu ke Praktik 6).

### Praktik 6 — Node 1 jadi alat ukur arus: INA219 (45 menit)

> 🖥️ **Alat dan komponen:** **Arduino IDE** (dengan **Library Manager**) dan **Serial Monitor**, **papan Node 1** dari laptop dengan **MB102 dimatikan**, modul **INA219**, 6 kabel **jantan–betina** dan 1 kabel **jantan–jantan**, rangkaian baterai dan papan kedua dari Praktik 5, serta kertas dan pensil (atau `catatan-modul09.md`). Konsep yang dipakai: 8, 9, dan 10.
>
> ⭐ **Wajib** — bagian dari syarat lulus: arus tidur sketsa baterai terukur kurang dari 15 mA, dan kamu menghitung sendiri perkiraan umur baterainya.

Di praktik ini, papan Node 1 menjalankan sketsa pengukur, dan INA219 disisipkan di kabel 5 V menuju papan kedua. Kamu akan mencatat arus tidur dan arus bangun, lalu menghitung sendiri umur baterainya.

#### 6.1 Pasang library Adafruit INA219

1. Di Arduino IDE, buka **Library Manager** (ikon buku di bilah kiri), lalu ketik **Adafruit INA219**.
2. Pilih **Adafruit INA219** yang di bawah judulnya tertulis **by Adafruit**, versi **1.2.3**, lalu klik **INSTALL**.
3. Muncul jendela `Install library dependencies` dengan daftar beberapa library pendamping, di antaranya **Adafruit BusIO** dan **Adafruit NeoPixel**. Klik **INSTALL ALL**. Library pendamping yang sudah terpasang sejak Modul 7 tidak rusak; **Adafruit NeoPixel** ikut terpasang walaupun tidak kita pakai (hanya dipakai contoh-contoh bawaan library itu).

#### 6.2 Pasang INA219 di bus I2C Node 1

**Matikan dulu semuanya**: cabut kabel **VIN** papan kedua dari rel (+) breadboard mini (papan kedua padam; ingat lubangnya, kolom 29), pastikan **MB102 mati**, dan **USB papan Node 1 tercabut**. Lalu geser breadboard mini pelan-pelan, bersama papan kedua, sampai dekat breadboard bawah meja kerja Node 1: kabel-kabel INA219 dan kabel GND bersama hanya sekitar 20 cm.

INA219 dipasang di lubang yang dulu dipakai BME280 di Modul 7, dengan warna kabel yang sama:

| Kabel (jantan–betina) | Dari kaki INA219 | Ke meja kerja Node 1 | Gunanya |
| :--- | :--- | :--- | :--- |
| **oranye** | **VCC** | rel bawah **(+)** kolom 14 | 3,3 V dari ESP32 untuk chip INA219 |
| **hitam** | **GND** | rel bawah **(−)** kolom 14 | GND |
| **kuning** | **SCL** | **19h** | jalur SCL, satu jalur dengan layar OLED |
| **biru** | **SDA** | **20i** | jalur SDA, satu jalur dengan layar OLED |

![Ilustrasi meja kerja Node 1 saat Praktik 6. Komponen lama, termasuk layar OLED dan kedua kabel jembatan bus I2C, digambar pudar. Di depan breadboard bawah, di bawah layar, modul INA219 ungu dengan enam kaki VCC, GND, SCL, SDA, VIN minus, dan VIN plus, hambatan R100, dan terminal sekrup yang tidak dipakai. Kabel oranye dari VCC melengkung masuk ke rel bawah plus kolom 14; kabel hitam dari GND ke rel bawah minus kolom 14; kabel kuning dari SCL naik ke baris h lalu ke kanan sampai 19h; kabel biru dari SDA naik ke baris i lalu ke kanan sampai 20i. Kabel putih dari VIN minus dan kabel merah dari VIN plus berbelok ke kanan dan keluar di tepi gambar, berlabel VIN minus ke 27a breadboard mini dan VIN plus ke rel atas plus breadboard mini; kabel hitam dari rel bawah minus kolom 30 turun, lalu ke kanan di antara label rel bawah 3,3 volt dan label GND bersama, dan keluar di tepi kanan menuju rel atas minus breadboard mini. Kotak perbesaran kolom 12 sampai 22 dengan empat penanda menjelaskan kabel VCC, GND, SCL, dan SDA; catatan: pemindai I2C kini menemukan 0x3C (layar) dan 0x40 (INA219), dan kaki VIN plus serta VIN minus tidak masuk ke meja kerja Node 1, melainkan disisipkan di kabel 5 volt papan kedua di breadboard mini. Daftar di bawah gambar: kabel INA219 jantan–betina; VIN plus ke rel atas plus breadboard mini yang berisi 5,0 volt dari MT3608, dan VIN minus ke 27a; GND bersama memakai kabel jantan–jantan hitam dari rel bawah minus kolom 30 ke rel atas minus breadboard mini, dan rel plus kedua breadboard tidak pernah disambung](aset/meja-kerja-ina219.png)

#### 6.3 Sisipkan INA219 di jalur 5 V papan kedua

Sekarang INA219 disisipkan di antara rel (+) breadboard mini dan pin VIN papan kedua, persis seperti meteran air di tengah pipa.

| Kabel | Dari | Ke | Gunanya |
| :--- | :--- | :--- | :--- |
| jantan–betina **merah** | kaki **VIN+** INA219 | rel atas **(+)** breadboard mini, di lubang yang ditinggalkan kabel VIN papan kedua (kolom 29) | arus 5 V **masuk** ke INA219 |
| jantan–betina **putih** (atau warna lain yang belum dipakai) | kaki **VIN−** INA219 | **27a** breadboard mini | arus **keluar** dari INA219 |
| kabel merah **VIN** papan kedua (dari 5.7) | — | **27e**, tetapi baru dicolokkan di 6.5; sampai saat itu biarkan tercabut | papan kedua nanti mendapat 5 V lewat INA219 |
| jantan–jantan **hitam** | rel bawah **(−)** meja kerja Node 1, kolom 30 | rel atas **(−)** breadboard mini, misalnya kolom 9 | **GND bersama** supaya INA219 bisa membaca tegangan |

Periksa tiga hal sebelum menyalakan apa pun:

1. Kabel VIN papan kedua masih tercabut. Tujuannya nanti **27e**, **bukan** rel (+).
2. Satu-satunya kabel antara meja kerja Node 1 dan breadboard mini adalah kabel **GND** hitam. Rel (+) breadboard mini **tidak pernah** disambung ke rel mana pun di meja kerja Node 1.
3. Kaki VCC INA219 di rel bawah (+) meja kerja Node 1 (3,3 V), **bukan** di rel (+) breadboard mini.

![Ilustrasi INA219 disisipkan di kabel 5 volt papan kedua pada Praktik 6; rangkaian Praktik 5 digambar pudar. Kanan atas, di atas papan kedua, modul INA219 ungu dengan kaki di sisi bawahnya, dari kiri VCC, GND, SCL, SDA, VIN minus, VIN plus, sama dengan urutan di gambar meja kerja. Empat kabel I2C, oranye VCC, hitam GND, kuning SCL, dan biru SDA, turun sedikit, berbelok ke kiri, lalu naik ke tepi atas gambar menuju meja kerja Node 1 (penanda 5). Kabel putih dari VIN minus turun, berbelok ke kiri, turun di antara kolom 27 dan 28 tanpa menyentuh lubang rel, lalu masuk ke 27a (penanda 2). Kabel merah dari VIN plus berbelok ke kiri lebih rendah daripada kabel putih, lalu turun ke rel atas plus kolom 29, lubang bekas kabel VIN papan kedua (penanda 1). Kabel merah VIN papan kedua kini dari 27e: turun ke parit tengah, ke kanan sampai keluar dari breadboard, lalu ke kaki VIN papan kedua (penanda 3). Kabel GND papan kedua tetap dari rel atas minus kolom 28. Kabel hitam GND bersama turun dari tepi atas gambar, dari meja kerja Node 1, ke rel atas minus kolom 9, di celah antara TP4056 dan MT3608 (penanda 4). Catatan bawah berwarna merah: rel plus breadboard mini tidak pernah disambung ke rel mana pun di meja kerja Node 1; yang disatukan hanya GND](aset/rangkaian-ukur-arus.png)

#### 6.4 Unggah sketsa pengukur ke papan Node 1

1. Colokkan USB **papan Node 1** ke laptop (MB102 tetap mati). Papan kedua masih padam.
2. Buat sketsa baru bernama `modul09_ukur_arus`, tempel kode ini, pilih **port papan Node 1**, lalu klik **Upload**:

   ```cpp
   // Modul 9 - Praktik 6: Node 1 menjadi alat ukur arus untuk papan kedua (calon Node 2)
   // Papan Node 1 (dari USB laptop) membaca modul INA219 di bus I2C-nya, alamat 0x40:
   //   VCC ke rel bawah (+) 3,3 V, GND ke rel bawah (-), SCL ke jalur 19, SDA ke jalur 20 (seperti BME280 di Modul 7).
   //   Kaki VIN+ dan VIN- INA219 disisipkan di kabel 5 V dari MT3608 ke pin VIN papan kedua.
   // Setiap detik: arus rata-rata, terkecil, dan terbesar. Setiap kali papan kedua bangun lagi: ringkasan satu siklus.
   // Library: Adafruit INA219 1.2.3 (ikut terpasang: Adafruit BusIO 1.17.4).

   #include <Wire.h>
   #include <Adafruit_INA219.h>

   const unsigned long JEDA_SAMPEL = 5;    // ms: satu bacaan arus setiap 5 ms (200 kali per detik)
   const unsigned long JEDA_LAPOR = 1000;  // ms: satu baris laporan setiap 1 detik
   const float AMBANG_BANGUN = 20.0;       // mA: di atas ini, papan kedua dianggap sedang bangun
   const int SAMPEL_PASTI_BANGUN = 3;      // 3 bacaan berturut-turut di atas ambang = benar-benar bangun
   const int SAMPEL_PASTI_TIDUR = 20;      // 20 bacaan berturut-turut (100 ms) di bawah ambang = benar-benar tidur

   Adafruit_INA219 ina219;  // alamat bawaan 0x40
   bool ina219Ada = false;

   unsigned long waktuSampelTerakhir = 0;
   unsigned long waktuLaporTerakhir = 0;

   // Statistik untuk laporan setiap detik
   float jumlahArusDetik = 0;
   int banyakSampelDetik = 0;
   float arusTerkecil = 0;
   float arusTerbesar = 0;
   float teganganTerakhir = 0;

   // Siklus bangun-tidur papan kedua
   bool sedangBangun = false;
   int beruntunAtas = 0;     // berapa bacaan berturut-turut di atas ambang
   int beruntunBawah = 0;    // berapa bacaan berturut-turut di bawah ambang
   float jumlahArusBangun = 0;
   unsigned long sampelBangun = 0;
   float jumlahArusTidur = 0;
   unsigned long sampelTidur = 0;

   void cetakRingkasanSiklus() {
     float detikBangun = sampelBangun * JEDA_SAMPEL / 1000.0;
     float detikTidur = sampelTidur * JEDA_SAMPEL / 1000.0;
     float rataBangun = jumlahArusBangun / sampelBangun;
     float rataTidur = jumlahArusTidur / sampelTidur;
     float rataSiklus = (jumlahArusBangun + jumlahArusTidur) / (sampelBangun + sampelTidur);
     Serial.printf("SIKLUS: bangun %.2f detik, rata-rata %.1f mA | tidur %.2f detik, rata-rata %.2f mA | rata-rata siklus %.2f mA\n",
                   detikBangun, rataBangun, detikTidur, rataTidur, rataSiklus);
   }

   void ambilSampel() {
     float arus = ina219.getCurrent_mA();
     teganganTerakhir = ina219.getBusVoltage_V();

     if (banyakSampelDetik == 0 || arus < arusTerkecil) {
       arusTerkecil = arus;
     }
     if (banyakSampelDetik == 0 || arus > arusTerbesar) {
       arusTerbesar = arus;
     }
     jumlahArusDetik += arus;
     banyakSampelDetik++;

     // Bangun atau tidur? Butuh beberapa bacaan berturut-turut supaya derau sesaat tidak terhitung.
     if (arus > AMBANG_BANGUN) {
       beruntunAtas++;
       beruntunBawah = 0;
     } else {
       beruntunBawah++;
       beruntunAtas = 0;
     }
     if (!sedangBangun && beruntunAtas >= SAMPEL_PASTI_BANGUN) {
       if (sampelBangun > 0 && sampelTidur > 0) {  // satu siklus lengkap sudah terekam
         cetakRingkasanSiklus();
       }
       sedangBangun = true;
       jumlahArusBangun = 0;
       sampelBangun = 0;
       jumlahArusTidur = 0;
       sampelTidur = 0;
     }
     if (sedangBangun && beruntunBawah >= SAMPEL_PASTI_TIDUR) {
       sedangBangun = false;
     }

     if (sedangBangun) {
       jumlahArusBangun += arus;
       sampelBangun++;
     } else {
       jumlahArusTidur += arus;
       sampelTidur++;
     }
   }

   void lapor(unsigned long sekarang) {
     if (banyakSampelDetik == 0) {
       return;
     }
     Serial.printf("[%5lu s] %6.2f mA (terkecil %.2f, terbesar %.2f)  %.2f V  %s\n", sekarang / 1000,
                   jumlahArusDetik / banyakSampelDetik, arusTerkecil, arusTerbesar, teganganTerakhir,
                   sedangBangun ? "BANGUN" : "tidur");
     jumlahArusDetik = 0;
     banyakSampelDetik = 0;
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     Wire.begin();  // SDA = D21, SCL = D22, seperti layar OLED Node 1
     ina219Ada = ina219.begin();
     if (ina219Ada) {
       ina219.setCalibration_16V_400mA();  // rentang sampai 400 mA, bacaan lebih halus untuk arus kecil
       Serial.println("Praktik 6 - alat ukur arus INA219 siap. Ambang bangun: 20 mA.");
     }
   }

   void loop() {
     unsigned long sekarang = millis();

     if (!ina219Ada) {
       if (sekarang - waktuLaporTerakhir >= 2000) {
         waktuLaporTerakhir = sekarang;
         Serial.println("INA219 tidak menjawab di alamat 0x40. Periksa kabel VCC, GND, SCL, dan SDA, lalu tekan EN.");
       }
       return;
     }

     if (sekarang - waktuSampelTerakhir >= JEDA_SAMPEL) {
       waktuSampelTerakhir = sekarang;
       ambilSampel();
     }
     if (sekarang - waktuLaporTerakhir >= JEDA_LAPOR) {
       waktuLaporTerakhir = sekarang;
       lapor(sekarang);
     }
   }
   ```

3. Buka **Serial Monitor** (**115200 baud**). Baris pertama harus `Praktik 6 - alat ukur arus INA219 siap. Ambang bangun: 20 mA.` Kalau baris ini terlewat karena Serial Monitor baru terbuka, tekan **EN** papan Node 1 untuk mengulangnya. Kalau yang muncul `INA219 tidak menjawab di alamat 0x40. …`, periksa keempat kabel I2C di 6.2, lalu tekan **EN**.

#### 6.5 Nyalakan papan kedua dan amati

Colokkan kembali kabel merah **VIN** papan kedua ke **27e**. Papan kedua menyala dari baterai, dan arusnya kini lewat INA219. Baris-baris sebelum kabel ini dicolokkan menunjukkan sekitar `0.00 mA` (angka kecil seperti `-0.10` atau `0.10` saat tidak ada arus itu wajar); begitu dicolokkan, muncul baris `BANGUN` karena papan kedua baru menyala.

**Hasilnya** (contoh keluaran di papan asli; angkamu pasti berbeda):

```text
Praktik 6 - alat ukur arus INA219 siap. Ambang bangun: 20 mA.
[    1 s]   0.01 mA (terkecil -0.10, terbesar 0.10)  5.00 V  tidur
[    2 s]   0.00 mA (terkecil -0.10, terbesar 0.10)  5.00 V  tidur
…
[   13 s]   0.01 mA (terkecil -0.10, terbesar 0.10)  5.00 V  tidur
[   14 s]  29.20 mA (terkecil -0.10, terbesar 61.40)  4.98 V  BANGUN
[   15 s]  31.35 mA (terkecil 4.70, terbesar 58.95)  5.00 V  tidur
[   16 s]   4.94 mA (terkecil 4.70, terbesar 5.20)  5.00 V  tidur
…
[   44 s]   4.92 mA (terkecil 4.65, terbesar 5.15)  5.00 V  tidur
SIKLUS: bangun 1.12 detik, rata-rata 51.6 mA | tidur 29.93 detik, rata-rata 4.92 mA | rata-rata siklus 6.60 mA
[   45 s]  29.37 mA (terkecil 4.70, terbesar 60.85)  4.98 V  BANGUN
[   46 s]  33.54 mA (terkecil 4.75, terbesar 59.10)  5.00 V  tidur
```

Cara membacanya:

- Setiap detik muncul satu baris: **arus rata-rata** selama 1 detik itu, angka **terkecil** dan **terbesar**, **tegangan** di pin VIN papan kedua, dan keadaannya (`BANGUN` atau `tidur`).
- Begitu papan kedua bangun lagi, muncul baris **`SIKLUS`** yang meringkas siklus sebelumnya: berapa lama bangun dan arus rata-ratanya, berapa lama tidur dan arus rata-ratanya, lalu **rata-rata satu siklus**. Baris `SIKLUS` pertama baru muncul saat papan kedua bangun untuk **kedua** kalinya karena ringkasan satu siklus (bangun, lalu tidur) baru bisa dicetak saat siklus berikutnya dimulai.
- Tegangannya sedikit di bawah 5,0 V saat papan bangun: hambatan 0,1 Ω di INA219 dan kabel-kabelnya ikut memakan sedikit tegangan, apalagi saat arusnya besar.
- Baris yang mencakup saat papan bangun berisi campuran bangun dan tidur, jadi rata-ratanya "tanggung" (misalnya 29,37 mA). Angka yang dipakai untuk menghitung adalah baris `SIKLUS`.

Di contoh ini, arus tidur papan kedua sekitar **4,9 mA**, jauh di bawah batas lulus 15 mA. Papanmu mungkin menunjukkan angka yang berbeda karena setiap merek papan memakai komponen yang sedikit berbeda (Konsep 10).

#### 6.6 Catat hasil ukurmu ⭐

Tunggu sampai muncul **tiga** baris `SIKLUS`. Salin baris terakhir ke `catatan-modul09.md`, lalu isi tabel ini:

```markdown
## Hasil ukur arus papan kedua (Praktik 6)

| | Hasil ukur |
| --- | --- |
| Arus tidur (rata-rata) | … mA |
| Arus bangun (rata-rata) | … mA |
| Lama bangun | … detik |
| Lama tidur | … detik |
| Rata-rata satu siklus (sisi 5 V) | … mA |

Arus tidur < 15 mA? ya / tidak
```

**Lulus** kalau arus tidurnya **kurang dari 15 mA**. Lebih dari itu? Buka "Arus tidur lebih dari 15 mA" di 🚨.

#### 6.7 Hitung umur baterainya ⭐

Pakai empat langkah Konsep 9 dengan **angkamu sendiri**, dan tulis setiap langkahnya di catatan (bukan hanya hasil akhirnya):

```markdown
## Perkiraan umur baterai (Praktik 6)

1. Arus rata-rata sisi 5 V (dari baris SIKLUS): … mA
2. Arus di sisi baterai: … mA × 1,6 = … mA
3. Kapasitas terpakai: … mAh (tertulis di baterai) × 0,8 = … mAh
4. Umur baterai: … mAh ÷ … mA = … jam = … hari
```

Kalau di badan baterainya tidak tertulis kapasitas yang masuk akal (misalnya 9.900 mAh), anggap kapasitas tertulisnya **2.000 mAh** (batas bawah baterai 18650 asli) sehingga langkah 3 menjadi 2.000 mAh × 0,8 = 1.600 mAh. Tulis juga alasannya.

#### 6.8 Bedah kodenya

- **`ina219.setCalibration_16V_400mA()`** memilih rentang **sampai 400 mA**. Rentangnya lebih sempit daripada bawaan library, tetapi bacaan arus kecilnya lebih halus. Papan yang bangun tanpa WiFi tidak pernah mendekati 400 mA.
- **Satu bacaan diambil setiap 5 ms** (dua ratus kali per detik) dengan pola `millis()` dari Modul 8 sehingga masa bangun yang hanya sekitar 1 detik pun terekam sekitar dua ratus kali. Setiap bacaan INA219 hanya memotret sekitar 0,5 ms, jadi lonjakan yang jauh lebih singkat daripada 5 ms bisa terlewat, tetapi pengaruhnya pada rata-rata kecil.
- **Bangun atau tidur?** Sketsa menganggap papan kedua bangun kalau **tiga bacaan berturut-turut** di atas 20 mA, dan tidur lagi kalau **dua puluh bacaan berturut-turut** (100 ms) di bawahnya. Syarat "berturut-turut" ini menyaring derau sesaat, sama seperti tombol yang harus tenang 30 ms di Modul 8. Akibatnya, lama bangun di baris `SIKLUS` sekitar 0,1 detik lebih panjang daripada sebenarnya (rata-rata siklusnya tidak terpengaruh). Angka itu juga lebih panjang daripada `Bangun selama … ms` di Praktik 4 karena `millis()` tidak menghitung waktu *boot* paling awal.
- **Rata-rata siklus** dihitung dari **semua** bacaan dalam satu siklus, bukan dari dua angka saja. Hasilnya sama dengan rumus Konsep 9, hanya lebih teliti.
- **`getBusVoltage_V()`** membaca tegangan di kaki VIN− INA219, yaitu tegangan yang benar-benar sampai di pin VIN papan kedua.

#### 6.9 Setelah selesai mengukur

Setelah tabel dan hitunganmu selesai:

1. Cabut USB papan Node 1. Rangkaian INA219 boleh tetap terpasang sampai bagian ➕ A.
2. Papan kedua boleh terus hidup dari baterai. Kalau ingin mengamatinya beberapa hari, lihat "Bonus" di bagian ➕ A.

> ➡️ **Selesai Praktik 6?** Lanjut ke [Praktik 7](#praktik-7--uji-power-bank-mati-sendiri-15-menit).

### Praktik 7 — Uji *power bank*: mati sendiri? (15 menit)

> 🖥️ **Alat dan komponen:** **papan kedua** yang masih menjalankan sketsa Praktik 4 (DS18B20 tetap terpasang), sebuah ***power bank*** yang sudah terisi, dan kabel USB papan kedua. Praktik ini opsional, tetapi sangat disarankan kalau kamu punya *power bank*. Konsep yang dipakai: 2.

1. **Lepaskan dulu papan kedua dari rangkaian baterai**: cabut kabel di pin **VIN** dan **GND** papan kedua, dan biarkan ujung lainnya tetap di breadboard mini. Ujung kabel VIN yang terlepas masih berlistrik 5 V, jadi letakkan kedua ujung itu berjauhan supaya tidak bersentuhan. Ingat aturan "satu papan, satu sumber listrik". Biarkan ketiga kabel DS18B20 terpasang.
2. Colokkan kabel USB papan kedua ke ***power bank***. Kalau *power bank*-nya punya tombol, tekan sekali supaya mulai mengeluarkan listrik.
3. Amati **LED biru** papan kedua selama **5 menit**: seharusnya ia menyala sekitar 1 detik setiap 30 detik. Amati juga lampu indikator *power bank*-nya dan LED merah papan kedua (tanda papan berlistrik). Catat di `catatan-modul09.md`: merek *power bank*, berapa kali LED biru sempat menyala, dan berapa detik setelah LED biru padam, lampu *power bank* dan LED merah papan kedua ikut padam (kalau padam).

**Hasilnya** bergantung pada *power bank*-mu:

- **LED biru hanya menyala sekali (saat papan baru dicolokkan). Sekitar 10–20 detik setelah papan tidur, lampu *power bank* dan LED merah papan kedua padam, dan LED biru tidak pernah menyala lagi.** Inilah jebakannya: *power bank* mengira tidak ada yang sedang diisi, lalu mematikan diri. Papan kedua tidak akan bangun lagi sampai tombol *power bank* ditekan.
- **LED biru tetap berkedip teratur.** *Power bank*-mu mungkin punya mode arus kecil, atau batas arusnya rendah. Tetap tidak disarankan untuk Node 2: perilakunya bisa berubah saat isinya hampir habis, dan sebagian besar *power bank* tidak menjelaskan batasnya di kemasan.

**Solusinya**, dari yang paling dianjurkan:

1. **Pakai sumber yang memang dibuat untuk itu**: adaptor atau *charger* untuk perangkat yang selalu dekat stopkontak (Node 1), dan rangkaian 18650 + TP4056 + MT3608 untuk perangkat bertenaga baterai (Node 2).
2. **Nyalakan mode arus kecil** kalau *power bank*-mu punya (biasanya dengan menekan tombolnya dua atau tiga kali, atau menahannya sekitar 2 detik; lihat buku panduannya). Mode ini dibuat untuk mengisi jam tangan pintar dan *earphone*. Di sebagian merek, mode ini mati sendiri setelah sekitar 2 jam, jadi tetap tidak cocok untuk perangkat yang berjalan berhari-hari. Ada juga *power bank* khusus yang selalu menyala (*always on*), tetapi harganya lebih mahal, dan ia sendiri ikut menyedot beberapa mA.
3. **Jangan mengakali dengan beban pemboros**, misalnya resistor yang sengaja dipanaskan supaya arusnya selalu besar. Baterainya habis untuk pemanas, bukan untuk ESP32.

Selesai mencoba, cabut papan kedua dari *power bank*. Kalau ingin terus mengamatinya, colokkan lagi kedua kabel tadi ke pin **VIN** dan **GND** papan kedua; ujung lainnya masih di **27e** dan rel atas (−) breadboard mini, seperti di akhir Praktik 6.

> ➡️ **Selesai Praktik 7?** Lanjut ke [Praktik 8](#praktik-8--simpan-ke-github-15-menit).

### Praktik 8 — Simpan ke GitHub (15 menit)

> 🖥️ **Alat yang dipakai:** **GitHub Desktop**, **Arduino IDE** (kalau ada sketsa yang perlu dipindahkan), **VS Code** atau Notepad, dan folder `modul-09` di repositori `belajar-iot`.

1. Pastikan folder `modul-09` berisi keenam sketsa minggu ini (`modul09_tidur_pertama`, `modul09_tiga_ingatan`, `modul09_bangun_tombol`, `modul09_tidur_ringan`, `modul09_kerangka_node2`, dan `modul09_ukur_arus`) dan file `catatan-modul09.md`. Ada sketsa yang tersimpan di tempat lain, misalnya di **Documents → Arduino**? Buka sketsa itu di Arduino IDE, pilih **File → Save As…**, lalu simpan ke **Documents → GitHub → belajar-iot → modul-09**.
2. Periksa bahwa `catatan-modul09.md` sudah memuat bagian-bagian di bawah ini. Bagian yang sudah kamu tulis di Praktik 2, 5, 6, dan 7 (misalnya tabel hasil ukur 6.6) tidak perlu ditulis ulang; tambahkan hanya yang belum ada:

   ```markdown
   # Catatan Modul 9 — Catu daya dan hemat daya

   ## Tiga ingatan (Praktik 2)
   (tabel RAM / memori RTC / NVS)

   ## Rangkaian baterai (Praktik 5)
   - Tegangan baterai: … V sebelum diisi, … V setelah penuh

   ## Hasil ukur arus papan kedua (Praktik 6)
   - Arus tidur: … mA
   - Arus bangun: … mA selama … detik
   - Rata-rata satu siklus: … mA (di sisi 5 V)

   ## Perkiraan umur baterai (Praktik 6)
   (tulis langkah hitunganmu sendiri, lengkap dengan angkanya)

   ## Uji power bank (Praktik 7)
   - Merek/tipe: …
   - Hasil: …
   ```

3. Di GitHub Desktop, pilih **`belajar-iot`** di kotak **Current repository**, isi **Summary** dengan `Modul 9: tidur, catu baterai, dan ukur arus`, klik **Commit … to main**, lalu **Push origin**.

> ➡️ **Sesudah Praktik 8:** kerjakan [🧩 Tantangan mandiri](#-tantangan-mandiri) (minimal Tingkat 1) dan [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini) — di sana Node 1 pindah permanen ke adaptornya, menjalani uji 24 jam, dan kamu menuntaskan *checkpoint* Fase 1 — lalu tutup dengan [📝 Kuis](#-kuis-5-soal) dan [✅ Checklist](#-checklist-kelulusan-modul-9). Bagian 🚨 dan 🔬 di antaranya cukup dibuka saat perlu.

---

## 🚨 Kalau Tidak Jalan?

Minggu ini ada tiga sumber bukti. **Serial Monitor** untuk sketsa tidur dan sketsa pengukur; **multimeter di posisi V⎓ 20** untuk rangkaian baterai; dan, saat papan kedua hidup dari baterai tanpa laptop, **LED birunya**, yang seharusnya menyala sekitar 1 detik setiap 30 detik. Klik judul masalah untuk membuka penjelasannya.

> [!IMPORTANT]
> **Sebelum memeriksa atau memindah kabel:**
>
> - **Meja kerja Node 1:** matikan MB102, lalu cabut USB. Setelah selesai, colokkan USB dulu, baru nyalakan MB102.
> - **Rangkaian baterai:** cabut kabel **VIN** papan kedua dan cabut *charger* dari TP4056. Untuk mengubah kabel di sisi baterai (kolom 3 dan 6, atau kaki B+/B−), **keluarkan dulu baterainya** dari dudukan.

<details>
<summary><b><code>Compilation error</code> — pesan error minggu ini</b></summary>

Di depan setiap pesan ada nama file dan nomor barisnya. Baca **pesan error pertama** dulu: error-error berikutnya sering hanya akibat dari yang pertama.

| Pesan (potongan) | Artinya | Obatnya |
| :--- | :--- | :--- |
| `'rtc_gpio_pullup_en' was not declared in this scope` (atau `'rtc_gpio_deinit' …`) | Baris `#include "driver/rtc_io.h"` terlewat. | Tambahkan baris itu di bagian paling atas sketsa (Praktik 3). |
| `invalid conversion from 'int' to 'gpio_num_t'` | Nomor pin ditulis sebagai `int`, misalnya `const int PIN_TOMBOL_BANGUN = 13;`. Fungsi tidur meminta jenis `gpio_num_t`. | Tulis `const gpio_num_t PIN_TOMBOL_BANGUN = GPIO_NUM_13;`, seperti di sketsa Praktik 3. |
| `'esp_sleep_enable_ext0_wakeup' was not declared in this scope`, `'RTC_DATA_ATTR' does not name a type`, atau puluhan error sekaligus | Papan yang terpilih bukan ESP32 biasa, misalnya ESP32-C3 atau Arduino Uno. | Pilih **DOIT ESP32 DEVKIT V1** di **Tools → Board → esp32**. |
| `fatal error: Adafruit_INA219.h: No such file or directory` | Library INA219 belum terpasang. | Pasang **Adafruit INA219** 1.2.3 (Praktik 6.1). |
| `fatal error: Adafruit_BusIO_Register.h: No such file or directory` (atau `Adafruit_I2CDevice.h`) | Library pendamping **Adafruit BusIO** belum terpasang. | Pasang **Adafruit BusIO** 1.17.4 di **Library Manager** (Modul 7). |
| `fatal error: DallasTemperature.h: No such file or directory` | Library DS18B20 dari Modul 7 belum terpasang. | Pasang **OneWire** 2.3.8 dan **DallasTemperature** 4.0.6 (Modul 7, Praktik 4). |

</details>

<details>
<summary><b>Tidak bisa mengunggah ke papan yang sedang tidur</b></summary>

Arduino IDE biasanya bisa membangunkan papan sendiri: sebelum mengunggah, ia "menekan" tombol EN lewat kabel USB. Kalau tetap gagal dengan pesan `Failed to connect to ESP32`:

1. Pastikan port yang terpilih adalah port papan yang benar. Minggu ini laptopmu sering melayani dua papan.
2. Klik **Upload**. Tahan **BOOT** begitu `Connecting…` muncul, lepaskan saat `Writing at …` mulai berjalan, seperti di Modul 2.
3. Papan kedua yang sedang hidup dari baterai: cabut dulu kabel VIN dan GND-nya, baru colokkan USB.

</details>

<details>
<summary><b>Hitungan selalu kembali ke "Bangun ke-1"</b></summary>

- **Variabelnya tidak memakai `RTC_DATA_ATTR`.** Variabel biasa selalu kembali ke angka awalnya setiap kali papan bangun dari *deep sleep* (Konsep 5).
- **Papan bukan bangun dari tidur, melainkan *restart*.** Lihat baris `rst:` di Serial Monitor. `rst:0x5 (DEEPSLEEP_RESET)` berarti bangun dari tidur. Kalau tertulis `POWERON_RESET`, atau ada tulisan `Brownout detector was triggered`, papanmu kehilangan listrik sesaat: periksa kabel USB-nya, atau, untuk papan kedua, rangkaian baterainya (lihat masalah *restart* di bawah).
- **Kamu menekan EN, mencabut listrik, atau mengunggah ulang.** Ketiganya memang menghapus memori RTC (Praktik 2).
- **Di Wokwi**, *deep sleep* belum disimulasikan: papan selalu *restart* dengan `rst:0x8 (TG1WDT_SYS_RESET)` dan memori RTC hilang. Kerjakan sketsa *deep sleep* di papan asli.

</details>

<details>
<summary><b>Praktik 3: papan langsung bangun lagi tanpa henti, atau tombol tidak membangunkan</b></summary>

**Bangun lagi tanpa henti** (pesan `dibangunkan TOMBOL.` terus-menerus):

- Tombol masih ditekan saat papan mulai tidur. Sketsa sudah menunggu tombol dilepas, jadi periksa apakah tombolmu macet atau kakinya salah lubang sehingga D13 selalu tersambung ke GND.
- *Pull-up* D13 hilang: baris `rtc_gpio_pullup_en(PIN_TOMBOL_BANGUN);` terhapus **dan** `INPUT_PULLUP` di baris `pinMode()` tertulis `INPUT` (atau baris itu ikut terhapus). Keduanya menyalakan *pull-up* yang sama (Praktik 3.2); tanpa keduanya, kaki D13 mengambang selama tidur dan bisa terbaca LOW.

**Tombol tidak membangunkan** (hanya alarm timer yang bekerja):

- Periksa kabel tombol D13 seperti di Modul 5: satu kaki ke jalur D13, kaki seberangnya ke GND.
- Pastikan pintu bangunnya `esp_sleep_enable_ext0_wakeup(PIN_TOMBOL_BANGUN, 0);` dengan angka **0** (bangun saat LOW). Angka 1 berarti bangun saat HIGH, padahal tombol kita menarik D13 ke LOW.
- Pintu ext0 hanya bisa dipasang di **pin RTC**. D13 termasuk pin RTC; D21 dan D22, misalnya, tidak.
- **Bagian 3B di Wokwi:** pintu bangun GPIO untuk *light sleep* belum disimulasikan. Menekan tombol hijau memang tidak membangunkan papan; di papan asli, bisa.

</details>

<details>
<summary><b>Node 1 <i>restart</i> saat pompa menyala</b></summary>

Kalau angka `Nyala ke-` bertambah saat pompa atau servo bergerak setelah Node 1 pindah ke *charger*, atau `Restart:` menulis `BROWNOUT`:

1. **Pastikan tidak ada beban yang tersambung ke pin VIN atau 3V3 papan** (aturan emas nomor 1). Periksa kolom 4 breadboard atas (VIN): tidak boleh ada kabel ke rel atas (+).
2. **Periksa *charger*-nya.** Pakai *charger* bermerek minimal 1 A dan kabel USB yang pendek. Coba *charger* dan kabel lain.
3. **Pisahkan stopkontaknya** kalau *charger* ESP32 dan adaptor MB102 memakai terminal listrik yang murah dan longgar.
4. **Periksa kapasitor 100 µF** di rel atas (Modul 5): pastikan masih terpasang dengan kutub yang benar.
5. Kalau Node 1 tetap normal saat dicolokkan ke laptop, masalahnya hampir pasti ada di *charger* atau kabelnya.

</details>

<details>
<summary><b>Baterai terbaca 0 V atau sangat rendah</b></summary>

- **Multimeter di posisi yang salah.** Harus **V⎓ 20** (tegangan searah), *probe* hitam di lubang **COM**, dan *probe* merah di lubang **VΩmA** (Modul 2), bukan di lubang **10A**. Kalau *probe* merah ternyata di lubang 10A, segera angkat kedua *probe*: di lubang itu, menempelkannya ke kutub baterai sama dengan korsleting.
- **Baterai tidak menyentuh pegas atau pelat dudukannya.** Tekan baterainya pelan-pelan ke arah pegas, lalu ukur lagi.
- **Mengukur di titik yang salah.** Tegangan baterai diukur di kolom 6 (B+) dan kolom 3 (B−), bukan di OUT+/OUT−. Kalau proteksi sedang memutus, OUT bisa terbaca 0 V walaupun baterainya berisi.
- **Baterainya benar-benar kosong**, di bawah sekitar 2,5 V. Baterai Li-ion yang terkuras sedalam itu, apalagi kalau sempat lama di bawah 2 V, bisa rusak di dalam dan tidak aman diisi lagi. **Jangan diisi**; pakai baterai lain, dan buang yang ini ke tempat penampungan limbah elektronik. Pengecualiannya hanya baterai yang **baru saja** diputus chip proteksi setelah papan kedua berhenti bekerja (misalnya di Bonus ➕ A): tegangannya memang bisa sedikit di bawah 2,5 V. Yang ini justru harus segera diisi lagi (5.3) sambil ditunggui (Konsep 7).

</details>

<details>
<summary><b>Baterai panas saat diisi</b></summary>

**Cabut *charger*-nya sekarang.** Jangan dipegang terlalu lama. Kalau baterainya bisa dikeluarkan dengan aman (misalnya memakai kain tebal), keluarkan dari dudukannya dan letakkan di permukaan yang tidak mudah terbakar, jauh dari barang lain, sampai dingin.

Baterai yang wajar hanya terasa **hangat** saat diisi. Baterai yang **panas** kemungkinan rusak, palsu, atau pernah korsleting. **Jangan dipakai lagi**, dan buang ke tempat penampungan limbah elektronik. Kalau baterainya menggembung, berasap, atau berbau aneh, jauhkan dari jangkauan siapa pun dan jangan diisi atau dibongkar.

Ingat, yang boleh panas adalah **modul TP4056** (chip pengisinya), bukan baterainya.

</details>

<details>
<summary><b>Lampu TP4056 tidak menyala, berkedip, atau langsung menandakan penuh</b></summary>

- **Tidak ada lampu sama sekali:** *charger* atau kabelnya tidak memberi listrik. Coba colokan dan kabel lain. Kalau colokan TP4056-mu USB-C dan kamu memakai *charger* USB-C dengan kabel USB-C ke USB-C, coba *charger* bercolokan USB-A dengan kabel USB-A ke USB-C: sebagian modul USB-C murah tidak punya resistor kecil yang dibutuhkan *charger* USB-C sebelum mau mengeluarkan listrik.
- **Lampu merah berkedip-kedip, sedangkan lampu satunya menyala:** TP4056 tidak menemukan baterai. Periksa kabel B+ dan B− di kolom 3 dan 6, dan pastikan baterai menyentuh dudukannya.
- **Langsung menyala tanda penuh:** baterainya memang sudah hampir penuh, atau B+/B− tidak tersambung ke baterai. Ukur tegangannya (5.2): kalau di atas 4,1 V, baterainya memang sudah penuh.

</details>

<details>
<summary><b>MT3608 tidak mau menunjukkan 5,0 V</b></summary>

- **Angkanya tidak berubah walau sekrupnya diputar:** potensiometernya bisa diputar sekitar 15–25 putaran penuh, dan di ujungnya memutar terus tidak mengubah apa pun. Putar ke arah sebaliknya dengan sabar sampai angkanya mulai bergerak.
- **Angkanya berhenti di sekitar tegangan baterai** (3,6–4,2 V): setelannya di ujung bawah, dan MT3608 hanya meneruskan tegangan baterai. Putar ke arah sebaliknya sampai angkanya naik.
- **0 V:** MT3608 tidak mendapat listrik. Periksa kabel OUT+ TP4056 dan VIN+ MT3608 di kolom 12, serta kabel OUT− dan VIN− di rel (−). Ukur juga kolom 12 terhadap rel (−): harus sama dengan tegangan baterai. Kalau di sini juga 0 V padahal baterainya berisi (kolom 6 terhadap kolom 3), chip proteksi sedang memutus, misalnya setelah korsleting sesaat atau karena baterai baru pertama kali dipasang: cabut kabel VIN papan kedua, lalu colokkan *charger* ke TP4056 beberapa detik untuk memulihkannya.
- **Angkanya melompat-lompat:** ada sambungan yang longgar. Tekan ujung-ujung kabel jumper ke kaki modul dan ke breadboard.

</details>

<details>
<summary><b>Papan kedua tidak menyala dari baterai, atau LED birunya tidak berkedip</b></summary>

1. **Ukur rel (+) terhadap rel (−) breadboard mini:** harus sekitar 5,0 V. Kalau tidak, kembali ke 5.5.
2. **LED merah papan kedua padam:** kabel VIN atau GND-nya salah kaki, atau masih di lubang yang salah. VIN adalah kaki **paling bawah** di deretan **kiri** (antena di atas, colokan USB di bawah), dan GND tepat di atasnya. Di Praktik 6, kabel VIN papan kedua pindah ke **27e**, dan INA219 harus terpasang di antaranya.
3. **LED merah menyala, tetapi LED biru tidak pernah berkedip:** papan kedua mungkin belum menjalankan sketsa Praktik 4. Cabut kabel VIN dan GND, colokkan papan ke laptop, lalu unggah ulang `modul09_kerangka_node2`.
4. **Baterainya sudah kosong:** ukur kolom 6 terhadap kolom 3. Di bawah sekitar 3,3 V, cabut kabel VIN papan kedua, lalu isi lagi (5.3).

</details>

<details>
<summary><b>Papan kedua <i>restart</i> terus, atau LED birunya berkedip lebih sering daripada setiap 30 detik</b></summary>

Papan yang *restart* karena tegangan anjlok mulai lagi dari awal, menyalakan LED birunya, lalu *restart* lagi (Konsep 3). Periksa satu per satu:

1. **Tegangan MT3608** masih 4,95–5,05 V (5.5), dan **kapasitor 100 µF** terpasang dengan kutub yang benar (5.6).
2. **Isi baterai:** di bawah sekitar 3,4 V, MT3608 harus bekerja keras, dan tegangannya mudah turun saat papan bangun. Cabut kabel VIN papan kedua, lalu isi lagi baterainya (5.3).
3. **Sambungan longgar** di kabel VIN, GND, dan kabel-kabel MT3608: tekan semuanya.
4. Untuk melihat penyebabnya, colokkan papan kedua ke laptop **tanpa** baterai (cabut VIN dan GND dulu), lalu buka Serial Monitor. Kalau di laptop papan tidur dan bangun dengan normal, masalahnya ada di rangkaian baterai.

</details>

<details>
<summary><b>Praktik 6: <code>INA219 tidak menjawab di alamat 0x40</code></b></summary>

1. Periksa keempat kabel I2C INA219 (6.2): VCC ke rel bawah (+), GND ke rel bawah (−), SCL ke jalur **19**, SDA ke jalur **20**. SCL dan SDA yang tertukar adalah kesalahan paling umum.
2. Jalankan pemindai I2C dari Modul 7 (`modul07_pemindai_i2c`). Hasil yang benar: dua perangkat, `0x3C` (layar OLED) dan `0x40`.
3. Kalau pemindai menemukan `0x41`, `0x44`, atau `0x45`, titik solder **A0/A1** di modulmu tidak terbuka seperti biasanya. Ubah baris `Adafruit_INA219 ina219;` menjadi, misalnya, `Adafruit_INA219 ina219(0x41);` sesuai alamat yang ditemukan.
4. Setelah memperbaiki kabel, tekan **EN** papan Node 1. Kalau tadi kamu menjalankan pemindai I2C, unggah lagi `modul09_ukur_arus` ke papan Node 1 dulu.

</details>

<details>
<summary><b>Praktik 6: arusnya 0, negatif, atau tegangannya 0 V</b></summary>

- **Arus 0,00 mA, padahal LED merah papan kedua menyala:** kabel VIN papan kedua masih di rel (+), bukan di **27e**, sehingga arusnya tidak lewat INA219.
- **Arus negatif** (misalnya `-9.70 mA`): kabel **VIN+** dan **VIN−** INA219 tertukar. Tukar posisinya. Angka arusnya sendiri tetap benar, hanya tandanya terbalik.
- **Tegangan 0,00 V atau angka aneh, tetapi arusnya masuk akal:** kabel **GND bersama** (jantan–jantan hitam) antara meja kerja Node 1 dan breadboard mini belum terpasang.

</details>

<details>
<summary><b>Praktik 6: baris <code>SIKLUS</code> tidak pernah muncul</b></summary>

- **Papan kedua tidak tidur:** keadaannya selalu `BANGUN`, arusnya terus di atas 20 mA. Pastikan papan kedua menjalankan sketsa Praktik 4, bukan sketsa lain yang terus bangun.
- **Arus tidurnya di atas 20 mA:** keadaannya juga selalu `BANGUN`, tetapi lihat angka terkecilnya: saat LED biru padam, arusnya turun, hanya tidak sampai di bawah 20 mA. Papanmu boros saat tidur; baca masalah berikutnya.
- **Papan kedua tidak pernah bangun:** keadaannya selalu `tidur`, dan LED birunya tidak berkedip. Lihat "Papan kedua tidak menyala dari baterai".
- **Sketsa baru berjalan sebentar:** baris `SIKLUS` pertama baru muncul saat papan kedua bangun untuk **kedua** kalinya, sekitar 30 detik setelah kabel VIN-nya dicolokkan ke 27e (sampai sekitar 60 detik kalau papan kedua sudah menyala sebelum sketsa pengukur mulai).

</details>

<details>
<summary><b>Arus tidur lebih dari 15 mA</b></summary>

1. **Pastikan papan kedua benar-benar tidur:** LED birunya padam dan angka di Serial Monitor turun jauh dibandingkan dengan saat `BANGUN`.
2. **Periksa modul adaptor DS18B20.** Kalau adaptormu punya LED yang menyala terus, LED itu ikut menyedot arus dari pin 3V3 selama papan tidur. Lepas sementara adaptornya (cabut VIN papan kedua dulu), lalu ukur lagi. Kalau tanpa adaptor arus tidurnya turun di bawah 15 mA, catat kedua angkanya: itu hasil ukur yang sah.
3. **Papan DevKit V1 tidak semuanya sama.** Ada yang memakai regulator atau chip USB lain yang lebih boros (Konsep 10). Kalau masih di atas 15 mA, tulis angkanya apa adanya di catatan, sebutkan merek atau ciri papanmu, lalu tanyakan kepada pembimbing atau di forum kelasmu sebelum menganggap praktik ini gagal.

</details>

---

## 🔬 Bedah Teknis (opsional)

Bagian ini untuk yang penasaran. Tidak ada yang wajib dipraktikkan, dan modul berikutnya tidak bergantung pada bagian ini.

<details>
<summary><b>Papan hemat daya dan modul ESP32 tanpa papan pengembang</b></summary>

Arus tidur seluruh papan, menurut pembuatnya atau hasil ukur orang lain (cara mengukurnya berbeda-beda, jadi anggap sebagai gambaran kasar):

| Papan | Arus tidur dalam | Sumber angka |
| :--- | :--- | :--- |
| Papan pengembang biasa (ESP32-DevKitC, NodeMCU-32S, dan sejenisnya), diberi 5 V | sekitar 3,8–4,7 mA | hasil ukur beberapa penulis |
| **TinyPICO** | sekitar 18 µA (0,018 mA) | pembuatnya, Unexpected Maker |
| **FireBeetle ESP32** (DFRobot) | sekitar 10 µA | klaim pembuat dan satu hasil ukur; pengguna lain mengukur jauh lebih besar saat LED papannya menyala |
| **LOLIN32** (WEMOS), dari baterai 3,7 V | sekitar 0,13 mA | hasil ukur satu penulis |

Ciri papan yang dirancang untuk baterai:

- **Regulatornya irit**: "uang jalan"-nya (arus diam, *quiescent current*) hanya beberapa µA, bukan beberapa mA seperti AMS1117. Regulatornya juga bisa langsung menerima tegangan baterai Li-ion, tanpa penaik tegangan.
- **Tidak ada LED yang menyala terus**, atau LED-nya bisa dimatikan. Di FireBeetle versi 2, misalnya, ada bantalan "low power" yang bisa diputus untuk menghemat sekitar 0,5 mA.
- **Chip USB-nya hanya mendapat listrik dari kabel USB** sehingga ikut padam saat papan hidup dari baterai.
- Sering sudah dilengkapi **pengisi baterai** dan colokan baterai.

Pilihan paling hemat adalah **modul ESP32 tanpa papan pengembang** (misalnya ESP32-WROOM-32) yang dipasang di papan rancanganmu sendiri, dengan regulator irit dan tanpa chip USB. Cara mengunggah programnya berbeda (lewat adaptor USB-serial terpisah), dan merancang papan seperti itu adalah keterampilan tersendiri. Espressif sendiri menyarankan agar arus modul diukur di papan khusus, bukan di papan pengembang, karena rangkaian lain di papan pengembang tetap menyedot arus selama tidur.

</details>

<details>
<summary><b>Mengapa "baterai → regulator irit → 3,3 V" lebih hemat daripada rantai kita</b></summary>

Rantai kita menaikkan tegangan baterai menjadi 5 V, lalu regulator papan menurunkannya lagi menjadi 3,3 V. Setiap tahap membuang energi:

| Tahap | Yang terbuang |
| :--- | :--- |
| MT3608: 3,7 V → 5 V | sekitar 10–15 % daya menjadi panas (perkiraan), ditambah sekitar 1 mA untuk menjalankan MT3608 sendiri |
| AMS1117 di papan: 5 V → 3,3 V | regulator linear membuang selisih tegangannya, (5 − 3,3) ÷ 5 = 34 % daya, menjadi panas, ditambah "uang jalan" beberapa mA |

Papan hemat daya memakai **regulator linear yang irit dan bertegangan jatuh rendah** (*low-dropout*, LDO) langsung dari baterai. Selisih 3,7 V ke 3,3 V kecil, jadi yang terbuang juga kecil, dan "uang jalan"-nya hanya beberapa µA.

Kenapa kita tidak memakainya? Karena papan DevKit V1 tidak punya pintu untuk itu: pin 3V3 tidak boleh diberi tegangan baterai (Konsep 1), dan memasang regulator sendiri ke pin 3V3 sambil regulator bawaan papan masih terpasang adalah cara yang rawan. Rantai MT3608 → VIN aman dan mudah walaupun bukan yang paling irit.

</details>

<details>
<summary><b>Panel surya kecil + TP4056</b></summary>

Node 2 di kebun bisa diisi ulang oleh panel surya kecil yang disambung ke bantalan **IN+/IN−** TP4056. Kedengarannya mudah, tetapi ada beberapa jebakan:

- **Pilih panel sekitar 6 V.** Adafruit, yang menguji pengisi baterai bertenaga surya, mendapati panel 5 V tidak bekerja dan panel 5,5 V hanya kadang-kadang. Sebaliknya, panel "9 V" atau "12 V" bisa merusak TP4056 karena tegangan masuknya paling tinggi 8 V, dan tegangan panel tanpa beban lebih tinggi daripada angka di labelnya.
- **TP4056 dibuat untuk sumber yang kuat**, seperti *charger* HP. Kalau TP4056 meminta arus lebih besar daripada yang sanggup diberikan panel, tegangan panel anjlok, pengisian berhenti, tegangan pulih, lalu begitu seterusnya. Lampu merahnya bisa tetap menyala walaupun yang masuk ke baterai sangat sedikit.
- TP4056 baru mengisi kalau tegangan masuknya cukup tinggi (sekitar 4 V ke atas), jadi ia hanya berguna saat matahari terik. Panel harus di luar, tidak terhalang bayangan, dan tidak di balik kaca.
- Pengisi khusus surya (misalnya yang punya pengatur tegangan masuk) bekerja lebih baik, tetapi itu sudah di luar kit kita.

</details>

<details>
<summary><b><i>ULP coprocessor</i>: otak kecil yang tetap bangun</b></summary>

Selain dua inti utama, chip ESP32 punya prosesor ketiga yang sangat kecil: ***ULP coprocessor*** (*ultra-low-power coprocessor*, prosesor pendamping berdaya sangat rendah). Ia tetap bisa bekerja selama tidur dalam, misalnya membaca ADC atau sensor I2C setiap beberapa detik, dan baru membangunkan prosesor utama kalau angkanya melewati batas. Selama ULP menyala, arus chip naik dari sekitar 10 µA menjadi sekitar 150 µA (atau rata-rata 100 µA kalau ia hanya sesekali bekerja), tetapi tetap jauh lebih kecil daripada membangunkan seluruh chip.

Untuk ESP32 klasik (seperti di DevKit V1), program ULP ditulis dalam bahasa rakitan (*assembly*) khusus atau dengan makro bahasa C yang rumit. Paket esp32 untuk Arduino hanya membawa satu contoh ULP, dan Wokwi belum menyimulasikannya. Untuk papan DevKit V1 kita, menghemat arus papan (Konsep 10) jauh lebih berpengaruh daripada ULP.

</details>

<details>
<summary><b>Pintu bangun lainnya dan <code>RTC_NOINIT_ATTR</code></b></summary>

- **ext1**: membangunkan papan dari beberapa pin RTC sekaligus, dengan `esp_sleep_enable_ext1_wakeup_io(maskPin, mode)`. Di ESP32 klasik, pilihannya "semua pin LOW" (`ESP_EXT1_WAKEUP_ALL_LOW`) atau "salah satu pin HIGH" (`ESP_EXT1_WAKEUP_ANY_HIGH`). Pin RTC di ESP32 adalah GPIO 0, 2, 4, 12–15, 25–27, dan 32–39.
- **Sentuhan**: pin sentuh bisa membangunkan papan saat disentuh (`esp_sleep_enable_touchpad_wakeup()`).
- **Pintu bangun tidak terlepas sendiri.** Pintu yang sudah dipasang tetap terpasang setelah papan bangun. Kalau tidak diperlukan lagi, lepaskan dengan `esp_sleep_disable_wakeup_source()`.
- **`RTC_NOINIT_ATTR`**: mirip `RTC_DATA_ATTR`, tetapi isinya **tidak** diisi ulang saat papan menyala lagi, jadi bisa selamat dari `ESP.restart()` dan *watchdog*. Sebagai gantinya, isinya acak saat papan baru dinyalakan, jadi programmu harus memeriksa sendiri apakah isinya masuk akal (misalnya dengan menyimpan "angka kunci" di sebelahnya).

</details>

<details>
<summary><b>Mengukur arus sekecil µA dengan teliti</b></summary>

INA219 hanya bisa membedakan sekitar 0,1 mA. Untuk mengukur arus tidur papan hemat daya, yang hanya belasan µA, dibutuhkan alat lain:

- **Alat khusus.** Espressif menyarankan Joulescope atau Nordic Power Profiler Kit II. Keduanya bisa berpindah rentang dengan cepat sehingga arus µA saat tidur dan arus ratusan mA saat bangun terukur dalam satu rekaman, tanpa banyak memakan tegangan.
- **Penguat arus kecil.** Alat seperti µCurrent Gold buatan EEVblog dipasang di depan multimeter biasa. Tegangan yang dimakannya hanya sekitar 10–20 µV untuk setiap µA atau mA yang lewat.
- **Trik multimeter.** Pasang kabel jumper yang "menjembatani" kedua *probe* multimeter selama papan menyala dan bangun supaya arus besar lewat jumper, bukan lewat multimeter. Begitu papan tidur, cabut jumper-nya, baca angkanya, lalu pasang lagi sebelum papan bangun. Merepotkan, tetapi cukup untuk sekali ukur. Trik ini hanya untuk pengetahuan: minggu ini multimeter tetap di posisi tegangan (aturan keselamatan nomor 7), dan INA219 sudah cukup untuk papan DevKit V1. Di posisi arus, *probe* multimeter tidak pernah boleh ditempelkan langsung ke kutub baterai.

Ingat juga angka-angka multimeter murah: di posisi **2000µ** (2.000 µA), hambatan di dalamnya sekitar 100 Ω sehingga arus 2 mA saja sudah "memakan" 0,2 V. Itulah sebabnya multimeter di posisi µA membuat papan yang bangun langsung kekurangan tegangan.

</details>

<details>
<summary><b>Memperpendek waktu bangun</b></summary>

Untuk papan yang arus tidurnya sudah kecil, waktu bangun menjadi bagian terbesar dari pemakaian baterai. Beberapa cara memperpendeknya:

- **Turunkan resolusi DS18B20.** Pada 12 bit, satu pengukuran butuh sampai 750 ms. Pada 9 bit (ketelitian 0,5 °C), hanya sekitar 94 ms: `sensorSuhu.setResolution(9);` (Tantangan Tingkat 2).
- **Jangan menunggu dengan sia-sia.** Hindari `delay()` yang tidak perlu, termasuk kedipan LED yang terlalu lama.
- **Turunkan kecepatan prosesor** dengan `setCpuFrequencyMhz(80)` kalau tugasnya ringan. Arusnya turun walaupun pekerjaannya sedikit lebih lama.
- **WiFi adalah yang paling boros.** Mulai Modul 10, menyambung ke WiFi bisa butuh beberapa detik. Itu salah satu alasan Node 2 di Modul 14 memakai ESP-NOW, yang bisa mengirim data tanpa menyambung ke *router* (perangkat pusat jaringan WiFi di rumah).

</details>

<details>
<summary><b>Membaca tegangan baterai sendiri dengan ADC</b></summary>

`PETA-PIN.md` menyisakan pin **VP** (GPIO 36) di Node 2 untuk mengukur tegangan baterai. Caranya memakai **pembagi tegangan** dari Modul 6: dua resistor sama besar, misalnya 2 × 100 kΩ, dari **OUT+ TP4056** ke GND, dengan titik tengahnya ke VP. Tegangan baterai 4,2 V menjadi 2,1 V di titik tengah, aman untuk ADC ESP32.

Dengan begitu, program bisa berhenti sendiri (misalnya tidur sangat lama) begitu baterai turun di bawah sekitar 3,3 V, sebelum chip proteksi terpaksa memutus di 2,4 V. Pasang pembagi tegangan itu di antara OUT+ dan GND rangkaian (yaitu OUT−), jangan di antara B+ dan B−. OUT+ sebenarnya tersambung langsung ke B+, tetapi saat proteksi memutus, OUT− terlepas dari B− sehingga pembagi tegangan itu ikut berhenti menyedot baterai. Pembagi tegangan di antara B+ dan B− akan terus menyedot baterai walaupun proteksi sudah memutus. Jangan pula memasangnya di keluaran MT3608, yang selalu 5,0 V berapa pun isi baterainya.

Dua hal yang perlu diperhatikan: pembagi tegangan itu juga menyedot arus terus-menerus (4,2 V ÷ 200 kΩ = 0,021 mA, kecil dibandingkan dengan arus tidur DevKit V1), dan ADC ESP32 tidak terlalu teliti (Modul 6), jadi kalibrasikan dengan multimeter.

</details>

---

## 🧩 Tantangan mandiri

Tiga tingkat, dari yang paling ringan. Kerjakan minimal Tingkat 1. Semuanya memakai papan kedua; Tingkat 1 dan 2 juga memakai alat ukur Praktik 6.

> 🖥️ **Alat:** **Arduino IDE**, papan kedua, dan rangkaian Praktik 6 (papan Node 1 + INA219). Sebelum mengubah apa pun, buka sketsa `modul09_kerangka_node2`, lalu **segera** pilih **File → Save As…** dan simpan di folder `modul-09` dengan nama baru, misalnya `modul09_tantangan1`. Sketsa praktikmu tetap utuh.
>
> **Setiap kali mengunggah ke papan kedua:** cabut dulu kabel **VIN** dan **GND**-nya dari rangkaian baterai, colokkan USB-nya ke laptop, pilih **port papan kedua** (jangan sampai sketsa ini masuk ke papan Node 1), unggah, cabut USB-nya, lalu pasang lagi kabel VIN (ke **27e**) dan GND (ke rel atas (−) breadboard mini). Satu papan, satu sumber listrik.
>
> **Untuk mengukur:** colokkan lagi USB papan Node 1 ke laptop (MB102 tetap mati). Sketsa `modul09_ukur_arus` masih ada di papan itu sejak Praktik 6, jadi cukup pilih **port papan Node 1** dan buka Serial Monitor.

**Tingkat 1 — Ubah sedikit: tidur 60 detik.** Ubah `LAMA_TIDUR_DETIK` menjadi `60`.

1. **Sebelum mengukur, tebak dulu.** Pakai arus bangun, lama bangun, dan arus tidur dari catatan Praktik 6, lalu hitung arus rata-rata dan umur baterainya dengan rumus Konsep 9 untuk tidur 60 detik.
2. Unggah, lalu ukur dengan sketsa Praktik 6 sampai muncul tiga baris `SIKLUS`.
3. Bandingkan tebakanmu dengan hasil ukurnya, lalu jawab di catatan: **berapa persen umur baterai bertambah** karena tidurnya dua kali lebih lama? Mengapa hanya sedikit? (Petunjuk: Konsep 10.)

**Tingkat 2 — Gabungkan: bangun lebih singkat.** Pakai hasil Tingkat 1 (atau kembali ke 30 detik). Tambahkan `sensorSuhu.setResolution(9);` tepat sesudah `sensorSuhu.begin();`. Pada 9 bit, DS18B20 hanya butuh sekitar 94 ms untuk mengukur, bukan 750 ms, dengan ketelitian 0,5 °C. Setelan ini ikut disimpan di memori sensor, jadi DS18B20-mu tetap 9 bit walaupun sketsanya diganti. Untuk kembali ke 12 bit, jalankan sekali sketsa yang memanggil `sensorSuhu.setResolution(12);`.

- Bandingkan **lama bangun** di baris `SIKLUS` dan baris `Bangun selama … ms` di Serial Monitor (cabut dulu kabel **VIN** dan **GND**-nya dari rangkaian baterai, lalu colokkan papan kedua ke laptop sebentar untuk melihatnya) sebelum dan sesudah perubahan.
- Hitung lagi umur baterainya. Mana yang lebih berpengaruh untuk papan DevKit V1: memperpendek waktu bangun, atau memperpanjang waktu tidur? Bagaimana jawabannya untuk papan yang arus tidurnya hanya 0,01 mA?

**Tingkat 3 — Rancang sendiri: riwayat suhu di memori RTC.** Kerangka Node 2 saat ini hanya ingat **satu** bacaan sebelumnya. Ubah supaya ia ingat **lima** bacaan terakhir di memori RTC, lalu setiap kali bangun mencetak suhu terendah, tertinggi, dan rata-rata kelimanya. Petunjuk awal:

- Siapkan `RTC_DATA_ATTR float riwayatSuhu[5];` dan `RTC_DATA_ATTR int jumlahTersimpan = 0;`. Simpan bacaan baru di laci `(jumlahBangun - 1) % 5` sehingga laci yang paling lama tertimpa lebih dulu.
- Selama riwayatnya belum penuh (kurang dari lima bacaan), hitung hanya dari laci yang sudah terisi.
- Tambahkan aturan: cetak `Berubah!` kalau suhu baru berbeda lebih dari 0,5 °C dari rata-rata riwayatnya. Aturan "laporkan hanya kalau berubah" seperti ini nanti menghemat baterai Node 2: mengirim data lewat radio jauh lebih boros daripada mengukur.
- Uji dengan menggenggam *probe* DS18B20 selama beberapa kali bangun. Kali ini biarkan papan kedua tetap tercolok ke laptop sesudah diunggahi (kabel VIN dan GND rangkaian baterai tetap tercabut) supaya Serial Monitor-nya bisa dibaca; alat ukur tidak diperlukan.

Tidak ada kunci jawaban untuk Tingkat 3. Kalau riwayatnya bertahan dari tidur ke tidur, kembali kosong setelah tombol EN ditekan, dan `Berubah!` muncul saat *probe*-nya digenggam, rancanganmu sudah benar.

---

## ➕ Tambahan ke "Rumah Pintar Mini"

Minggu ini firmware Node 1 **tidak berubah**: Node 1 v1.0 dari Modul 8 sudah siap hidup tanpa laptop, bahkan sudah bisa menerjemahkan alasan *restart* `BROWNOUT` dan `DEEPSLEEP`. Yang berubah adalah **catu dayanya**, ditambah satu folder baru di repositori proyek: **kerangka Node 2**.

| Bagian | Isi | Menurut |
| :--- | :--- | :--- |
| A | Node 1 permanen dari adaptornya sendiri, lalu uji 24 jam ⭐ | Praktik 1 |
| B | Folder `firmware/node-2-kebun` berisi kerangka Node 2 v0.1.0 | Praktik 4 |
| C | `PETA-PIN.md` versi 4 | Konsep 1 dan 7, Praktik 5–6 |
| D | *Checkpoint* Fase 1 🎉: bukti, foto, dan video 30 detik | Silabus §8 |
| E | *Commit* dan *push* | Modul 4 |

> 🖥️ **Alat yang dipakai:** **Arduino IDE**, **VS Code**, **GitHub Desktop**, meja kerja Node 1 dengan *charger*-nya, papan kedua dengan rangkaian baterai, dan HP untuk merekam video.
>
> ⭐ **Wajib** (bagian A) — bagian dari syarat lulus: Node 1 hidup 24 jam dari adaptor, bukan dari laptop, tanpa *restart*.

### A. Node 1 permanen dari adaptor, lalu uji 24 jam

**Sudah lulus uji 24 jam Modul 8 dengan *charger*?** Kalau di Modul 8 papan Node 1-mu sudah memakai *charger* HP (bukan laptop) dan susunannya sama dengan sekarang, hasil itu memenuhi syarat ini: kerjakan langkah 1, 2, dan 4, lalu salin catatan uji Modul 8 ke tabel di bawah. Kalau dulu memakai laptop, kerjakan semua langkahnya.

1. **Kembalikan meja kerja Node 1 ke keadaan Modul 8.** Matikan MB102 (kalau menyala) dan cabut USB papan Node 1. Kalau papan kedua masih hidup dari baterai, cabut dulu kabel VIN-nya dari 27e. Lalu lepas keempat kabel I2C INA219 dari rel bawah dan jalur 19–20, kabel GND bersama (jantan–jantan hitam) ke breadboard mini, serta kabel VIN+ dan VIN− INA219 dari breadboard mini. Kalau papan kedua akan terus hidup dari baterai, colokkan kabel VIN-nya ke rel atas (+) kolom 29, lubang yang baru ditinggalkan kabel VIN+ INA219. Simpan INA219 baik-baik: kamu bisa memakainya lagi kapan pun ingin mengukur arus.
2. **Unggah ulang Node 1 v1.0** seperti Praktik 1.1: colokkan papan Node 1 ke laptop, buka `node-1-rumah.ino` dari repositori `rumah-pintar-mini`, pilih port-nya, lalu klik **Upload**.
3. **Siapkan uji 24 jam** persis seperti bagian ➕ F Modul 8: celupkan sensor tanah ke gelas air, arahkan selang pompa kembali ke tandon dan rekatkan ujungnya, pastikan tandon berisi lebih dari 20 %, dan letakkan meja kerja sesuai aturan keselamatan Modul 8.
4. **Pindahkan ke *charger*** dengan urutan Praktik 1.3: MB102 mati → cabut USB dari laptop → colokkan kabel berlabel **ESP32** ke *charger* → **baru** nyalakan MB102. Kalau memasang modul microSD beregulator, tekan **EN** setelah MB102 menyala (Modul 7), **baru** lanjut ke langkah 5.
5. **Mulai:** tahan tombol 1 detik untuk membuka halaman status. Catat **jam mulai**, angka **`Nyala ke-`**, dan **memori bebas**, atau potret layarnya.
6. **Setelah 24 jam:** buka lagi halaman status. Node 1 **lulus** kalau *uptime*-nya **24:00:00 atau lebih** dan angka **`Nyala ke-` sama** dengan saat mulai. Kalau gagal, buka "Uji 24 jam gagal" di [🚨 Modul 8](../modul-08-firmware-tangguh/README.md#-kalau-tidak-jalan) dan "Node 1 *restart* saat pompa menyala" di [🚨](#-kalau-tidak-jalan) modul ini, perbaiki penyebabnya, lalu ulangi ujinya.

Tulis hasilnya di `catatan-modul09.md` (folder `modul-09` di `belajar-iot`):

```markdown
## Uji 24 jam Node 1 dari adaptor (tanpa laptop)

| | Mulai | Selesai |
| --- | --- | --- |
| Tanggal dan jam | | |
| Menyala selama (uptime) | 00:00:… | |
| Restart | | |
| Nyala ke- | | |
| Memori bebas (KB) | | |

Sumber listrik ESP32: charger … (merek, … A)
Lulus (uptime ≥ 24:00:00 dan "Nyala ke-" sama)? ya / tidak
```

**Bonus: uji umur baterai sungguhan.** Selama Node 1 menjalani uji 24 jamnya, biarkan papan kedua tetap hidup dari baterai, dengan kabel VIN-nya di rel atas (+) breadboard mini seperti di akhir Praktik 5. Isi baterainya sampai penuh dulu (5.3), dengan kabel VIN papan kedua dicabut selama mengisi (Konsep 7). Letakkan rangkaian baterainya di atas piring keramik, jauh dari benda yang mudah terbakar. Lirik LED birunya sesekali. Begitu LED itu tidak lagi menyala setiap 30 detik, catat berapa hari baterainya bertahan, lalu bandingkan dengan perhitunganmu di Praktik 6. Setelah itu, cabut kabel VIN papan kedua dan **segera** isi lagi baterainya dengan TP4056 (5.3): baterai yang sudah diputus proteksi jangan dibiarkan kosong berhari-hari, apalagi sampai Modul 14 (Konsep 7).

### B. Kerangka Node 2 masuk repositori proyek

Sketsa Praktik 4 menjadi versi pertama firmware Node 2, sama seperti sketsa Modul 3 dulu menjadi Node 1 v0.1.0.

1. Di Arduino IDE, buka sketsa `modul09_kerangka_node2`, lalu pilih **File → Save As…**. Masuk ke **Documents → GitHub → rumah-pintar-mini → firmware**, ketik nama **`node-2-kebun`**, lalu klik **Save**. Arduino IDE membuat folder `node-2-kebun` berisi `node-2-kebun.ino`.
2. Buka versi rujukan [`node-2-kebun.ino`](../../proyek-rumah-pintar-mini/firmware/node-2-kebun/node-2-kebun.ino) di tab baru, klik **Copy raw file**, lalu ganti seluruh isi tab `node-2-kebun.ino` dengannya (**Ctrl + A**, lalu **Ctrl + V**). Bedanya dengan sketsa Praktik 4 hanya di dua baris komentar paling atas: nama, nomor versi (**0.1.0**), dan asal listriknya.
3. Simpan (**Ctrl + S**). Kalau ingin, unggah ke papan kedua lewat USB: perilakunya sama persis dengan Praktik 4. Ingat, cabut dulu kabel VIN dan GND rangkaian baterai sebelum mencolokkan USB.

### C. Perbarui `PETA-PIN.md`

1. Di VS Code, buka folder repositori proyekmu (**File → Open Folder…** → **Documents → GitHub → rumah-pintar-mini**), lalu buka `PETA-PIN.md`.
2. Buka versi rujukan [`PETA-PIN.md`](../../proyek-rumah-pintar-mini/PETA-PIN.md) di tab baru, klik **Copy raw file**, lalu ganti seluruh isi file-mu dengannya (**Ctrl + A**, lalu **Ctrl + V**). Yang berubah:
   - **Aturan emas nomor 2** kini berbunyi: ESP32 Node 1 mendapat listrik dari ***charger*-nya sendiri** lewat colokan USB papan; laptop hanya untuk mengunggah program. Aturan nomor 4 (rel 5 V MB102 tidak ke pin VIN selama USB tercolok) dan nomor 5 (urutan nyala-mati) kini berlaku baik untuk USB dari laptop maupun dari *charger*.
   - **Bagian Node 2**: D27 (DS18B20) dan GPIO 2 (LED biru "sedang bangun") kini terpasang sejak Modul 9, dan ada bagian baru **Rangkaian baterai Node 2**: 18650 → TP4056 → MT3608 (5,0 V) → VIN, semuanya di breadboard mini.
   - **Bus I2C Node 1**: alamat `0x40` dipesan untuk INA219 sebagai **alat ukur sementara** (lubangnya sama dengan BME280 di Modul 7), dipasang hanya saat mengukur.
   - **Riwayat**: versi 4.
3. Simpan (**Ctrl + S**).

### D. *Checkpoint* Fase 1 🎉

Dengan modul ini, Fase 1 selesai. Sebelum lanjut ke Fase 2, periksa bukti-bukti di [Silabus §8](../../SILABUS.md#8-evaluasi--tanda-kelulusan-tiap-fase):

| Bukti | Dari | Sudah? |
| :--- | :--- | :---: |
| Kuis Modul 5–9, masing-masing **≥ 4 benar** | 📝 setiap modul | ☐ |
| **Node 1 mandiri 24 jam dari adaptor** | bagian A di atas | ☐ |
| **Sketsa baterai terukur**: arus tidur < 15 mA + perhitungan umur baterai | Praktik 6 | ☐ |
| **Firmware Node 1 v1.0** di `rumah-pintar-mini` | Modul 8 | ☐ |
| **Foto rangkaian** (`meja-kerja.jpg`) dan **skematik Node 1** | Modul 5 dan 7 | ☐ |
| **`PETA-PIN.md`** (kini versi 4) | Modul 5–9 | ☐ |
| **Video 30 detik** | di bawah ini | ☐ |

**Rekam video 30 detik** dengan HP, mendatar, di tempat yang terang. Tidak perlu bagus; yang penting jelas. Contoh urutannya:

1. **Detik 0–10:** meja kerja Node 1 dan *charger*-nya, tanpa laptop. Tahan tombol supaya halaman status (*uptime*, `Nyala ke-`) terlihat.
2. **Detik 10–20:** tekan tombol sebentar (relay lampu berbunyi "klik"), lalu angkat sensor tanah sampai pompa menyala sebentar.
3. **Detik 20–30:** papan kedua di rangkaian baterainya. Tekan tombol **EN** papan kedua: LED birunya langsung menyala sekitar 1 detik, tanda kerangka Node 2 bangun, membaca suhu, lalu tidur lagi. Tanpa EN, kedipan berikutnya bisa baru datang 30 detik lagi.

Simpan videonya dengan nama **`video-fase-1.mp4`** di folder `modul-09` repositori `belajar-iot`. Pilih resolusi **720p** di pengaturan kamera supaya ukurannya kecil: GitHub menolak file yang lebih besar daripada 100 MB, dan sudah memperingatkan sejak 50 MB. Potret juga rangkaian baterainya dari atas dan simpan sebagai **`rangkaian-baterai.jpg`** di folder yang sama. Pastikan tidak ada barang pribadi yang ikut terekam atau terpotret.

### E. *Commit* dan *push*

1. Di GitHub Desktop, pilih **`rumah-pintar-mini`** di kotak **Current repository** — selalu lihat kotak ini sebelum *commit*!
2. Tab **Changes** berisi dua perubahan: folder baru `firmware/node-2-kebun` (berisi `node-2-kebun.ino`) dan `PETA-PIN.md`.
3. Isi **Summary** dengan `Kerangka Node 2 v0.1.0 dan PETA-PIN versi 4`, klik **Commit 2 files to main**, lalu **Push origin**.
4. Ganti ke repositori **`belajar-iot`**. Tab **Changes** berisi `catatan-modul09.md`, `video-fase-1.mp4`, dan `rangkaian-baterai.jpg` (ditambah sketsa yang belum kamu *commit* di Praktik 8). *Commit* dengan ringkasan seperti `Modul 9: uji 24 jam dari adaptor dan checkpoint Fase 1`, lalu **Push origin**.
5. Di github.com, buka folder `modul-09` repositori `belajar-iot`, klik `video-fase-1.mp4`, lalu pastikan videonya bisa diputar atau diunduh.

---

## 📖 Glosarium

| Istilah | Arti singkat |
| :--- | :--- |
| **Adaptor** (*charger*) | Pengubah listrik PLN 220 V menjadi 5 V. Terus memberi listrik selama stopkontaknya menyala, berapa pun arus yang diminta. |
| ***Power bank*** | Baterai Li-ion dengan penaik tegangan ke 5 V. Banyak yang mematikan diri kalau arus yang ditarik terlalu kecil. |
| **Pin VIN** | Pintu masuk ke jalur 5 V papan ESP32, sesudah dioda dan sebelum regulator. Diberi 5 V yang stabil. |
| **Pin 3V3** | Jalur 3,3 V papan ESP32, sesudah regulator. Di kurikulum ini hanya dipakai sebagai keluaran untuk sensor kecil. |
| **Regulator** | Komponen yang mengubah tegangan masukan menjadi tegangan tetap. Di DevKit V1: AMS1117-3.3, dari 5 V menjadi 3,3 V. |
| **Ruang napas regulator** (*dropout*) | Selisih tegangan paling sedikit antara masukan dan keluaran regulator supaya keluarannya tetap. Untuk AMS1117 sekitar 1,1 V (paling banyak 1,3 V). |
| ***Brownout*** | Tegangan yang sesaat anjlok di bawah batas aman. Detektor *brownout* ESP32 lalu me-*restart* papan. |
| **Kapasitor penyangga** | Kapasitor, misalnya 100 µF, di dekat pintu masuk listrik. Menyumbang arus saat ada lonjakan, seperti tandon kecil. |
| ***Deep sleep*** (tidur dalam) | Tidur paling hemat: hampir seluruh chip padam, kecuali bagian RTC. Setelah bangun, program mulai lagi dari `setup()`. |
| ***Light sleep*** (tidur ringan) | Tidur yang menjeda prosesor, tetapi menjaga isi RAM. Setelah bangun, program lanjut dari baris berikutnya. |
| **Pintu bangun** (*wake-up source*) | Hal yang boleh membangunkan papan: alarm timer, pin (ext0, GPIO), sentuhan, dan lainnya. Dipasang sebelum tidur. |
| **ext0** | Pintu bangun dari satu pin RTC yang menjadi HIGH atau LOW. Dipakai untuk tombol D13 di Praktik 3. |
| **Pin RTC** | Pin yang tetap "terjaga" selama tidur dalam sehingga bisa dipakai sebagai pintu bangun. D13 salah satunya. |
| **Memori RTC** | Memori kecil (8 KB) yang tetap menyala selama tidur dalam. Isinya hilang kalau papan *restart* atau kehilangan listrik. |
| **`RTC_DATA_ATTR`** | Tanda di depan variabel supaya disimpan di memori RTC, misalnya `RTC_DATA_ATTR int jumlahBangun = 0;`. |
| **Li-ion 18650** | Baterai isi ulang litium-ion berukuran 18 × 65 mm. Penuh 4,2 V, nominal 3,6–3,7 V. |
| **mAh** (miliampere-jam) | Satuan kapasitas baterai. 2.500 mAh ≈ 25 mA selama 100 jam. |
| **TP4056** | Modul pengisi baterai Li-ion. Versi 6 bantalan juga punya chip proteksi. |
| **Proteksi baterai** | Rangkaian yang memutus baterai saat terlalu kosong, terlalu penuh, atau korsleting. Hanya menjaga jalur OUT+/OUT−. |
| **MT3608** | Modul penaik tegangan (*boost converter*). Di modul ini mengubah 3,0–4,2 V baterai menjadi 5,0 V. |
| **Efisiensi** | Persentase daya yang benar-benar sampai di keluaran. Sisanya menjadi panas. |
| **INA219** | Modul pengukur arus dan tegangan ber-I2C (alamat `0x40`), dengan hambatan pengukur 0,1 Ω. |
| **Hambatan pengukur** (*shunt*) | Hambatan kecil yang dilewati arus. Tegangan di kedua ujungnya sebanding dengan arusnya. |
| **Arus rata-rata** | Arus yang, kalau mengalir terus, menghabiskan muatan yang sama dengan arus bangun-tidur yang berganti-ganti. |
| **Umur baterai** | Kapasitas yang terpakai dibagi arus rata-rata di sisi baterai. |

---

## 📝 Kuis 5 soal

1. Seorang teman menyambung baterai 18650 yang baru penuh **langsung ke pin 3V3** papan DevKit V1. Teman lain menyambungkannya **langsung ke pin VIN**. (a) Apa yang bisa terjadi pada masing-masing papan? (b) Bagaimana cara yang benar memberi listrik dari baterai itu, dan mengapa?
2. Sebuah papan ESP32 dicolokkan ke *power bank*. Selama sketsa biasa (tanpa tidur) berjalan, papannya baik-baik saja. Begitu sketsanya diganti dengan sketsa yang tidur 30 detik, papan itu bangun sekali, lalu tidak pernah bangun lagi. (a) Apa penyebabnya? (b) Sebutkan dua jalan keluarnya.
3. Perhatikan potongan ini:

   ```cpp
   int hitungA = 0;
   RTC_DATA_ATTR int hitungB = 0;

   void setup() {
     hitungA++;
     hitungB++;
     Serial.begin(115200);
     Serial.printf("A=%d B=%d\n", hitungA, hitungB);
     Serial.flush();
     esp_sleep_enable_timer_wakeup(10 * 1000000ULL);
     esp_deep_sleep_start();
   }
   ```

   (a) Apa yang tercetak pada bangun ketiga? (b) Sesudah itu, tombol EN ditekan. Apa yang tercetak? (c) Mengapa `loop()` sketsa ini tidak pernah dijalankan?
4. Papan kedua bangun 1,0 detik dengan arus 50 mA, lalu tidur 29 detik dengan arus 6 mA (keduanya di sisi 5 V). Baterainya 3.000 mAh. Hitung (a) arus rata-rata di sisi 5 V, (b) arus di sisi baterai (pakai faktor 1,6), dan (c) perkiraan umur baterainya dalam hari (pakai 80 % kapasitas).
5. (a) Mengapa arus tidur papan DevKit V1 jauh lebih besar daripada 10 µA di lembar data chip ESP32? Sebutkan dua penyebabnya. (b) Seorang teman ingin baterai Node 2 bertahan dua kali lebih lama, lalu mengubah lama tidurnya dari 30 detik menjadi 60 detik. Apakah usahanya berhasil? Jelaskan.

<details>
<summary><b>Kunci jawaban & penjelasan</b></summary>

1. (a) **Pin 3V3:** listrik masuk langsung ke chip ESP32 tanpa melewati regulator, padahal baterai penuh bertegangan 4,2 V, di atas batas chip (sekitar 3,6 V). Chip bisa rusak. **Pin VIN:** papan tidak rusak, tetapi regulatornya butuh ruang napas sekitar 1 V lebih. Dengan masukan 3,0–4,2 V, keluarannya turun di bawah 3,3 V sehingga papan mudah *restart* karena *brownout*, makin sering saat baterainya berkurang. (b) Baterai → **TP4056** (pengisi dan proteksi, beban dari OUT+/OUT−) → **MT3608** diatur ke **5,0 V** dengan multimeter tanpa beban → pin **VIN** dan GND papan (Konsep 1 dan 7).
2. (a) *Power bank* mematikan diri kalau arus yang ditarik terlalu kecil selama beberapa waktu. Papan yang tidur hanya menarik beberapa mA, jadi *power bank* menyangka tidak ada yang sedang diisi, lalu padam. Papan tidak akan bangun lagi sampai *power bank* dinyalakan. (b) Pakai sumber yang tepat: **adaptor** untuk perangkat yang dekat stopkontak, atau **rangkaian 18650 + TP4056 + MT3608** untuk perangkat berbaterai; atau nyalakan **mode arus kecil** *power bank* kalau ada. Menambah beban pemboros bukan jalan keluar yang baik.
3. (a) **`A=1 B=3`**: `hitungA` di RAM kembali ke 0 setiap kali bangun, sedangkan `hitungB` di memori RTC terus bertambah. (b) **`A=1 B=1`**: tombol EN menghapus memori RTC, sama seperti listrik dicabut. (c) Setelah `esp_deep_sleep_start()`, papan tidur, dan saat bangun program mulai lagi dari `setup()`. Akhir `setup()` tidak pernah tercapai, jadi `loop()` tidak pernah dijalankan.
4. (a) (50 × 1 + 6 × 29) ÷ 30 = (50 + 174) ÷ 30 ≈ **7,5 mA**. (b) 7,5 × 1,6 = **12 mA**. (c) Kapasitas terpakai 3.000 × 0,8 = 2.400 mAh; 2.400 ÷ 12 = 200 jam ≈ **8,3 hari**.
5. (a) Bagian papan yang tidak ikut tidur, misalnya: **regulator AMS1117** yang butuh "uang jalan" beberapa mA, **LED merah** tanda menyala yang terus menyala, dan **chip USB-serial** yang tetap mendapat listrik dari jalur 3,3 V. Chip ESP32-nya sendiri memang hanya sekitar 10 µA. (b) **Hampir tidak.** Tidur sudah menyumbang sebagian besar pemakaian baterai (hampir tiga perempat di contoh Konsep 9), dan arus tidurnya tidak berubah. Dengan angka contoh Konsep 9, arus rata-ratanya hanya turun dari 6,6 mA menjadi (55 × 1,0 + 5 × 60) ÷ 61 ≈ 5,8 mA, jadi umurnya bertambah sekitar 14 %, bukan 100 %. Yang benar-benar menolong adalah menurunkan arus tidur papannya (Konsep 10).

</details>

---

## ✅ Checklist kelulusan Modul 9

Centang semuanya sebelum lanjut ke Modul 10:

- [ ] Aku bisa menjelaskan tiga pintu listrik papan ESP32 (USB, VIN, 3V3), dan tahu mengapa baterai Li-ion tidak boleh masuk langsung ke pin 3V3 maupun VIN.
- [ ] Node 1 bekerja dari *charger*-nya sendiri, dan pompa serta relay tidak membuatnya *restart* (Praktik 1).
- [ ] Aku melihat sendiri bedanya RAM, memori RTC, dan NVS saat papan tidur, di-*restart*, dan dicabut listriknya (Praktik 2).
- [ ] Papan bisa dibangunkan oleh alarm timer **dan** oleh tombol, dan aku tahu bedanya *deep sleep* dengan *light sleep* (Praktik 3).
- [ ] Kerangka Node 2 tidur, bangun setiap 30 detik, membaca DS18B20, lalu tidur lagi (Praktik 4).
- [ ] Rangkaian 18650 → TP4056 → MT3608 (5,0 V) menghidupkan papan kedua tanpa laptop, dan aku mengatur MT3608 dengan multimeter **sebelum** menyambungkannya ke papan (Praktik 5).
- [ ] ⭐ **Arus tidur papan kedua terukur kurang dari 15 mA**, dan aku menulis sendiri langkah-langkah perhitungan umur baterainya (Praktik 6).
- [ ] Aku tahu mengapa *power bank* tidak cocok untuk perangkat yang tidur (Praktik 7).
- [ ] ⭐ **Node 1 hidup 24 jam dari adaptor, bukan dari laptop, tanpa *restart*** (➕ A): *uptime* ≥ 24:00:00 dan angka `Nyala ke-` tidak berubah.
- [ ] `firmware/node-2-kebun` dan `PETA-PIN.md` versi 4 sudah di-*commit* dan di-*push* ke `rumah-pintar-mini`; sketsa, catatan, foto, dan video minggu ini ada di `belajar-iot/modul-09`.
- [ ] ⭐ **Kuis: minimal 4 dari 5 benar.**

**Lulus jika** (sesuai Silabus): *Node 1 hidup dari adaptor (bukan laptop) selama 24 jam, dan sketsa bateraimu terukur < 15 mA saat tidur dengan perhitungan umur baterai yang kamu tulis sendiri.*

🎉 ***Checkpoint* Fase 1.** Kalau semua bukti di tabel ➕ D sudah tercentang, **Fase 1 selesai**. Kamu kini punya Node 1 yang tangguh dan mandiri, serta kerangka Node 2 yang hemat daya. Di **Modul 10**, Node 1 mulai berbicara dengan jaringan lewat WiFi dan HTTP.

---

## 📚 Sumber & atribusi gambar

**Dokumentasi, lembar data, dan hasil uji yang dipakai** (diakses Oktober 2026):

- [ESP32 Series Datasheet](https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf) v5.3 (Espressif) — arus chip di setiap keadaan (aktif, tidur ringan 0,8 mA, tidur dalam 10 µA, ULP) dan saran sumber listrik paling sedikit 0,5 A.
- Dokumentasi ESP-IDF 5.5: [Sleep Modes](https://docs.espressif.com/projects/esp-idf/en/v5.5.5/esp32/api-reference/system/sleep_modes.html) (pintu bangun, pin RTC, *pull-up* RTC, `rtc_gpio_deinit()`, keluaran Serial sebelum tidur), [Deep-sleep Wake Stubs](https://docs.espressif.com/projects/esp-idf/en/v5.5.5/esp32/api-guides/deep-sleep-stub.html) dan [Memory Types](https://docs.espressif.com/projects/esp-idf/en/v5.5.5/esp32/api-guides/memory-types.html) (kapan memori RTC diisi ulang, `RTC_NOINIT_ATTR`), [esp_timer](https://docs.espressif.com/projects/esp-idf/en/v5.5.5/esp32/api-reference/system/esp_timer.html) (`millis()` selama tidur), [ULP](https://docs.espressif.com/projects/esp-idf/en/v5.5.5/esp32/api-reference/system/ulp.html), dan [Current Consumption Measurement of Modules](https://docs.espressif.com/projects/esp-idf/en/v5.5.5/esp32/api-guides/current-consumption-measurement-modules.html) (mengapa multimeter biasa kurang cocok).
- Kode sumber [arduino-esp32](https://github.com/espressif/arduino-esp32) 3.3.12: contoh `TimerWakeUp` dan `ExternalWakeUp`, serta `sdkconfig` bawaannya (detektor *brownout* level 0, sekitar 2,43 V); kode sumber [ESP-IDF](https://github.com/espressif/esp-idf) 5.5.5 (`brownout.c`, `esp_sleep.h`, `esp_system.h`).
- Skematik DOIT ESP32 DevKit V1 yang dibagikan [mischianti.org](https://mischianti.org/doit-esp32-dev-kit-v1-high-resolution-pinout-and-specs/) (dioda SS14 dari USB ke VIN, CP2102 dari jalur 3,3 V, LED merah dengan resistor 1 kΩ). Papan tiruan bisa berbeda.
- Lembar data [AMS1117](http://www.advanced-monolithic.com/pdf/ds1117.pdf) (ruang napas 1,1–1,3 V, arus diam sekitar 5 mA), [TP4056](https://datasheet.lcsc.com/datasheet/pdf/d328ee101cbb1f3719611cd61db479c2.pdf?productCode=C16581) (4,2 V, arus isi, lampu), [DW01A](https://datasheet.lcsc.com/datasheet/pdf/4337bed4215d48fabf2b81d65cba2241.pdf?productCode=C14213) (batas 2,4 V dan 4,3 V), [MT3608](https://www.olimex.com/Products/Breadboarding/BB-PWR-3608/resources/MT3608.pdf) (1,2 MHz, keluaran sampai 28 V), [INA219](https://www.ti.com/lit/ds/symlink/ina219.pdf) (hambatan pengukur, rentang, alamat), dan [DS18B20](https://cdn-shop.adafruit.com/datasheets/DS18B20.pdf) (waktu ukur 94–750 ms).
- Halaman modul [MT3608 di ProtoSupplies](https://protosupplies.com/product/mt3608-mini-adjustable-dc-dc-boost-module/) (arus diam modul sekitar 1 mA, potensiometer multiputar) dan [panduan Adafruit INA219](https://learn.adafruit.com/adafruit-ina219-current-sensor-breakout); library [Adafruit INA219](https://github.com/adafruit/Adafruit_INA219) 1.2.3. Colokan USB-C yang butuh resistor CC di sisi modul: [Hackaday, "All About USB-C: Resistors And Emarkers"](https://hackaday.com/2023/01/04/all-about-usb-c-resistors-and-emarkers/).
- [Battery University](https://batteryuniversity.com/) BU-205, BU-304a, dan BU-409 (tegangan Li-ion, keselamatan, dan mengisi tanpa beban); ulasan baterai di [lygte-info](https://lygte-info.dk/) (lembar data Samsung 25R/35E dan uji baterai palsu "10000 mAh").
- Uji *power bank*: [Zak Kemble](https://blog.zakkemble.net/smart-power-bank-keep-alive/) dan [0110.be](https://0110.be/posts/Powering_low_current_electronics_projects_with_power_banks); mode arus kecil dari halaman bantuan [Xiaomi](https://www.mi.com/uk/support/faq/details/KA-301691/) dan [Anker](https://www.anker.com/eu-en/products/a1268); *power bank* yang selalu menyala dari [Voltaic Systems](https://voltaicsystems.com/always-on/).
- Hasil ukur arus tidur papan: [grillbaer](https://github.com/grillbaer/esp32-power-consumption-test), [Lucidar](https://lucidar.me/en/esp32/power-consumption-of-esp32/), [CircuitDigest](https://circuitdigest.com/microcontroller-projects/esp32-active-mode-and-deep-sleep-mode-power-consumption); TinyPICO dari halaman pembuatnya, Unexpected Maker; FireBeetle dari [wiki](https://wiki.dfrobot.com/dfr0654) dan [forum DFRobot](https://www.dfrobot.com/forum/topic/12177).
- Multimeter: [Fluke, "Can you live with the burden?"](https://www.fluke.com/en-au/learn/blog/electrical/can-you-live-with-the-burden), bedah multimeter murah di [lygte-info](https://lygte-info.dk/review/DMMDT-830B%20UK.html), dan penguat arus kecil [µCurrent GOLD](https://www.eevblog.com/projects/ucurrent/) dari EEVblog; panel surya: [Adafruit, USB, DC & Solar Lipoly Charger](https://learn.adafruit.com/usb-dc-and-solar-lipoly-charger/design-notes).

**Gambar.** Diagram dan ilustrasi buatan sendiri dilisensikan **CC BY 4.0**, dan file sumber `.svg`-nya disertakan di folder `aset/` supaya bisa kamu ubah. Kolase foto mengikuti lisensi foto-fotonya. Rekap lengkap juga ada di [`aset/SUMBER.md`](aset/SUMBER.md).

| File | Sumber | Lisensi / keterangan |
| :--- | :--- | :--- |
| `peta-jalan-modul-09`, `tiga-pintu-listrik`, `jebakan-power-bank`, `brownout-tangga`, `tingkat-tidur`, `tiga-ingatan` (`.png` + `.svg`) | Diagram orisinal kurikulum Fullstack IoT Developer. Angka arus chip dari lembar data ESP32; jalan listrik papan dari skematik DOIT DevKit V1; batas *power bank* dari hasil uji di atas. | CC BY 4.0 |
| `baterai-18650`, `rantai-catu-baterai`, `ukur-arus-ina219`, `umur-baterai`, `jujur-devkit-v1` (`.png` + `.svg`) | Diagram orisinal. Batas tegangan baterai dari Battery University dan lembar data; arus papan sejenis dari hasil ukur di atas; umur baterai dihitung dengan cara Konsep 9. | CC BY 4.0 |
| `rangkaian-baterai`, `atur-mt3608`, `meja-kerja-ina219`, `rangkaian-ukur-arus` (`.png` + `.svg`) | Ilustrasi orisinal, lubangnya persis seperti tabel Praktik 5 dan 6; meja kerja Node 1 melanjutkan ilustrasi Modul 5–7. | CC BY 4.0 |
| `kenali-modul-baterai.jpg` | Foto Wikimedia Commons: [baterai 18650 dan AA](https://commons.wikimedia.org/wiki/File:Liion-18650-AA-battery.jpg) oleh Lead holder (CC BY-SA 3.0), [TP4056](https://commons.wikimedia.org/wiki/File:TP4056_board_P1089956.jpg) oleh -stk (CC BY-SA 4.0), [MT3608](https://commons.wikimedia.org/wiki/File:Voltage_Boost_Converters.jpg) oleh Ogidya (CC BY-SA 4.0), dan [INA219](https://commons.wikimedia.org/wiki/File:Adafruit_INA219_high_side_DC_current_sensor_module.jpg) oleh oomlout (CC BY-SA 2.0); foto TP4056, MT3608, dan INA219 dipotong, semua foto diperkecil, dan label serta susunan kolase oleh penulis. | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), mengikuti foto-fotonya |

Semua sketsa di modul ini, termasuk pengukur arus Praktik 6, sudah dikompilasi dengan paket esp32 versi 3, dan sketsa *light sleep* Praktik 3B dijalankan di Wokwi (dengan alarm timer saja). Karena Wokwi belum menjalankan *deep sleep* sketsa Arduino dengan benar dan tidak punya INA219, kotak **Hasilnya** untuk sketsa *deep sleep* dan pengukur arus adalah contoh keluaran papan asli, bukan rekaman simulator: keluaran sketsa *deep sleep* disusun dari dokumentasi dan contoh resmi Espressif, sedangkan angka pengukur arus mengikuti hasil ukur papan sejenis yang dikutip di atas.

---

[⬅️ Modul 8](../modul-08-firmware-tangguh/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · **Berikutnya: Modul 10 — WiFi & HTTP: Perangkat Mulai Berbicara dengan Jaringan** (segera terbit; [ringkasannya di Silabus](../../SILABUS.md#modul-10--wifi--http-perangkat-mulai-berbicara-dengan-jaringan))
