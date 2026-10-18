# Modul 14 — Node 2 "Kebun": Sensor Bertenaga Baterai via ESP-NOW

🌐 **Bahasa Indonesia** · [English](../../en/phase-2-connectivity/module-14-node-2-esp-now/README.md)

*Fase 2 · Minggu 14 · Perangkat keras (*hardware*): **Kit A Tahap 2** — papan ESP32 kedua (Node 2) dengan rangkaian baterai Modul 9, BME280, DS18B20, sensor tanah kapasitif ke-2, dan INA219; ditambah Node 1, gateway Pi, dan HP dari Modul 12–13 · Prasyarat: **Modul 13** (dashboard Node-RED) dan **Modul 9** (catu daya dan hemat daya) · Waktu: 8–10 jam, dicicil dalam seminggu, ditambah 1–3 jam mengisi baterai sambil ditunggui*

[⬅️ Modul 13](../modul-13-node-red-dashboard/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · [Modul 15 ➡️ (segera terbit — baca ringkasannya di Silabus)](../../SILABUS.md#modul-15--lab-modbus-rturs-485--memilih-protokol-yang-tepat)

---

Rumah Pintar Mini sekarang sudah lengkap di dalam rumah: Node 1 membaca lima sensor dan menggerakkan relay, gateway Pi menjalankan broker dan Node-RED, dan HP-mu menampilkan semuanya. Bagaimana dengan **kebun**? Kebun biasanya jauh dari stopkontak, dan sinyal WiFi di sana sering lemah. Di Modul 9 kamu sudah menyiapkan kerangka Node 2: papan ESP32 kedua yang hidup dari baterai 18650, bangun sebentar, membaca DS18B20, lalu tidur lagi. Sayangnya, bacaannya hanya muncul di Serial Monitor. Minggu ini Node 2 **berbicara**.

| Yang terjadi sekarang | Penyebabnya | Obatnya minggu ini |
| :--- | :--- | :--- |
| Bacaan Node 2 hanya terlihat di Serial Monitor laptop. | Node 2 belum mengirim apa-apa. | **ESP-NOW**: Node 2 mengirim satu paket kecil langsung ke Node 1, tanpa router (Konsep 1–2, Kemenangan Cepat) |
| Kalau Node 2 tersambung ke WiFi seperti Node 1, setiap kali bangun ia menghabiskan beberapa detik dengan radio menyala, dan kata sandi WiFi harus disimpan di papan yang tergeletak di kebun. | WiFi biasa memang dibuat untuk perangkat yang selalu menyala. | ESP-NOW tidak perlu menyambung ke router dan **tidak perlu kata sandi WiFi** (Konsep 2, 10) |
| ESP-NOW dan WiFi rumah berebut satu radio di Node 1; saat router mati, Node 1 bisa "pergi" dari *channel*-nya (kanal radio). | Radio ESP32 hanya bisa berada di satu channel. | Node 2 **mencari channel router** dengan memindai nama WiFi, dan Node 1 **tidak lagi memindai terus-menerus** (Konsep 3, Praktik 1 dan 3) |
| Node 2 baru punya DS18B20. | BME280 dan sensor tanah ke-2 belum dipasang. | **Sensor kebun lengkap** dengan urutan bangun yang hemat, dikemas menjadi **paket 33 byte** (Konsep 4–5, Praktik 2) |
| Broker dan dashboard tidak mengenal Node 2. | Node 2 tidak pernah tersambung ke broker. | **Node 1 menjadi jembatan**: menerbitkan data Node 2 sesuai kontrak data 1.1, dan menahannya selama router mati (Konsep 6–8, Praktik 3–6) |
| Umur baterai Node 2 belum pernah dihitung dengan beban sebenarnya. | Sensor dan radio baru ditambahkan minggu ini. | **Ukur arus dengan INA219** dan hitung umur baterainya (Konsep 9, Praktik 7) |
| Siapa pun yang punya ESP32 bisa mengirim paket palsu ke Node 1. | Paket ESP-NOW tanpa kunci. | **Enkripsi ESP-NOW** dengan kunci yang tidak ikut ke GitHub (Konsep 10, Praktik 8) |

Di akhir minggu, **Node 2 v1.0.0** bangun setiap 5 menit, membaca suhu dan kelembapan udara, tekanan udara, suhu tanah, dan kelembapan tanah, mengirim **satu paket ESP-NOW** ke Node 1, lalu tidur lagi. **Node 1 v1.3.0** menerima paket itu dan menerbitkannya ke broker atas nama Node 2, dengan `device_id` Node 2 sendiri. Node-RED menampilkannya di kartu **Kebun** di HP-mu. Saat router dimatikan, paket Node 2 tetap sampai ke Node 1 dan muncul di dashboard begitu router hidup lagi, pada jam kejadiannya. Satu baterai 18650 cukup untuk sekitar **satu sampai satu setengah minggu**.

![Peta jalan Modul 14. Atas, enam fase kurikulum dari Fase 0 Fondasi (Modul 1–4) sampai Fase 5 Operasi dan skala (Modul 26–32); Fase 2 Konektivitas, Modul 10 sampai 15, disorot. Modul 1 sampai 13 bertanda selesai, dan Modul 14 ditandai KAMU DI SINI dengan catatan: Node 2 di kebun, dari baterai, berbicara langsung ke Node 1. Bawah, kotak Modul 14 minggu ini, 8 sampai 10 jam dicicil, Kit A Tahap 2: papan ESP32 kedua dengan baterai, BME280, DS18B20, sensor tanah ke-2, INA219; ⭐ berarti wajib untuk lulus. Kiri: KC, Kemenangan Cepat, dua ESP32 bercakap tanpa router; P1 channel router dan pindai nama WiFi; P2 sensor Node 2 dan paket 33 byte; P3 Node 1 v1.3.0, jembatan ESP-NOW ke MQTT ⭐; P4 Node 2 v1.0.0, bangun, kirim, tidur ⭐. Kanan: P5 kartu Kebun di Node-RED ⭐; P6 uji matikan router ⭐; P7 ukur arus dan umur baterai; P8 enkripsi ESP-NOW; tambahan: Node 2 terpasang permanen dan uji 72 jam ⭐. Catatan di bawah: Wokwi belum bisa menjalankan ESP-NOW antarpapan dan tidur dalam, serta belum punya BME280; jalur Wokwi menguji sensor Node 2 sebagian dan jembatan Node 1 dengan Node 2 tiruan; uji router, arus, dan baterai butuh papan asli.](aset/peta-jalan-modul-14.png)

> [!NOTE]
> **Cara memakai modul ini.**
>
> - **Dua papan, dua port.** Mulai minggu ini kamu sering mencolokkan dua ESP32 ke laptop sekaligus. Tempel selotip kertas bertuliskan **Node 1** dan **Node 2** di masing-masing papan dan kabelnya. Buka setiap sketsa di **jendela Arduino IDE sendiri**: setiap jendela punya pilihan papan, port, dan Serial Monitor sendiri. Kalau ragu port mana milik siapa, cabut satu papan, lalu lihat port mana yang hilang dari daftar.
> - **Setiap kotak perintah disertai keterangan tempatnya:** **Serial Monitor Node 1** atau **Serial Monitor Node 2** (perintah diketik di kotak kirim), **editor Node-RED** (browser), **di Pi** (terminal SSH), atau **di laptop**. Alamat `192.168.1.37`, nama WiFi `RumahKita`, `device_id` Node 1 `a4cf12e5b7c0`, dan `device_id` Node 2 `246f28b1c7d4` hanya contoh; pakai milikmu sendiri.
> - **Kotak Hasilnya adalah contoh.** Semua sketsa dan firmware modul ini sudah dikompilasi dengan paket esp32 3.3.12, dan bagian yang bisa disimulasikan sudah dijalankan di Wokwi. Namun, angka dari dua papan sungguhan (alamat MAC, channel, kekuatan sinyal, lama bangun, arus) di layarmu **pasti berbeda**. Tangkapan layar Node-RED adalah tangkapan asli dengan data Node 2 tiruan.
> - **Belum punya papan kedua?** Ikuti **jalur Wokwi** di setiap praktik. Wokwi belum bisa menyambungkan dua ESP32 lewat ESP-NOW, belum bisa tidur dalam (*deep sleep*), dan tidak punya BME280. Jadi, jalur Wokwi menguji sensor Node 2 sebagian (DS18B20 dan potensiometer sebagai sensor tanah) dan jembatan Node 1 dengan **Node 2 tiruan** di dalam Node 1. Uji router, arus, dan baterai butuh papan asli. Kriteria lulusnya ada di ✅.
> - **Belum punya Raspberry Pi?** Ikuti **jalur laptop** seperti Modul 12–13: broker Mosquitto dan Node-RED berjalan di laptop. Di setiap langkah, ganti alamat `192.168.1.37` dengan alamat IP laptopmu (pemeriksa kontrak di laptop yang sama memakai `127.0.0.1`), sambungan MQTTX **Gateway Pi** dengan **Lewat IP laptop**, dan perintah **di Pi** dengan terminal di laptop, persis seperti [tabel 8.2 Modul 13](../modul-13-node-red-dashboard/README.md#82-sesuaikan-alamat-di-semua-langkah). Praktik 6 dan ➕ B memberi catatan khusus jalur laptop.
> - Pengguna macOS: ganti **Ctrl** dengan **Cmd** untuk pintasan di browser dan di editor Node-RED, kecuali disebut lain.

> [!WARNING]
> **Aturan aman minggu ini.**
>
> 1. **Aturan baterai Modul 9 tetap berlaku.** Pakai hanya 18650 asli dengan TP4056 berproteksi, jangan mengisi baterai tanpa diawasi, dan **selama Node 2 hidup dari baterai, USB papannya dicabut**. Mau mengunggah program ke Node 2? Cabut dulu kabel VIN dan GND dari rangkaian baterai, baru colokkan USB.
> 2. **Rel atas breadboard mini berisi 5,0 V, rel bawah berisi 3,3 V.** Mulai minggu ini rel bawah dipakai untuk sensor. BME280 dan DS18B20 hanya boleh mendapat 3,3 V dari rel bawah, tidak pernah 5 V (aturan Modul 7).
> 3. **Hanya sensor tanah yang mendapat listrik dari pin GPIO (D32).** Arusnya sekitar 5 mA, masih jauh di bawah batas aman satu pin. Sensor lain tidak boleh disambung ke pin GPIO sebagai sumber listrik.
> 4. **Node 2 tidak pernah menyimpan kata sandi WiFi, dan kata sandi apa pun tidak pernah dikirim lewat ESP-NOW.** Kunci enkripsi ESP-NOW (Praktik 8) disimpan di `kunci.h`, yang tidak ikut ke GitHub, seperti `secrets.h` di Modul 10.
> 5. **Mengubah pengaturan router hanya di router milikmu sendiri,** atau dengan izin pemiliknya. Kalau tidak bisa, Praktik 1.5 memberi jalan lain.

Ritme modul ini sama dengan Modul 1–13. Bagian lipat di 🚨 (klik judulnya) cukup dibuka saat kamu membutuhkannya; bagian lipat di 🔬 boleh dilewati. Setiap praktik diawali kotak **🖥️** yang menyebut alat yang dipakai.

## Daftar isi

1. [🎯 Setelah modul ini kamu bisa…](#-setelah-modul-ini-kamu-bisa)
2. [🧰 Yang perlu disiapkan](#-yang-perlu-disiapkan)
3. [🏆 Kemenangan Cepat: dua ESP32 bercakap tanpa router (30 menit)](#-kemenangan-cepat-dua-esp32-bercakap-tanpa-router-30-menit)
4. [🧠 Konsep "Mengapa"](#-konsep-mengapa)
   - [1 Node sensor & gateway](#1-node-sensor-dan-node-gateway-pola-di-hampir-semua-produk-iot) · [2 ESP-NOW](#2-esp-now-surat-langsung-tanpa-kantor-pos) · [3 Channel](#3-channel-satu-radio-satu-frekuensi) · [4 Urutan bangun](#4-bangun-sebentar-tidur-lama-urutan-bangun-node-2) · [5 Paket 33 byte](#5-paket-33-byte-formulir-yang-sama-di-kedua-ujung) · [6 Callback 3.x](#6-callback-cara-paket-esp32-3x-titip-di-kotak-surat-olah-di-loop) · [7 Node 1 jembatan](#7-node-1-sebagai-jembatan-cap-waktu-rak-tunggu-dan-status-node-2) · [8 Keandalan](#8-keandalan-ack-coba-ulang-dan-menghitung-paket-hilang) · [9 Umur baterai](#9-umur-baterai-yang-menentukan-adalah-saat-tidur) · [10 Keamanan](#10-keamanan-enkripsi-esp-now-dan-rahasia-yang-tidak-disiarkan)
5. [🔧 Praktik langkah demi langkah](#-praktik-langkah-demi-langkah)
   - [1 Channel router](#praktik-1--channel-router-dan-memindai-nama-wifi-40-menit) · [2 Sensor & paket](#praktik-2--sensor-node-2-dan-paket-33-byte-60-menit) · [3 Node 1 v1.3.0](#praktik-3--node-1-v130-jembatan-esp-now-ke-mqtt-40-menit) · [4 Node 2 v1.0.0](#praktik-4--node-2-v100-bangun-kirim-tidur-40-menit) · [5 Kartu Kebun](#praktik-5--kartu-kebun-di-node-red-30-menit) · [6 Uji router](#praktik-6--uji-matikan-router-70-menit) · [7 Arus & baterai](#praktik-7--ukur-arus-dan-hitung-umur-baterai-50-menit) · [8 Enkripsi](#praktik-8--enkripsi-esp-now-30-menit)
6. [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)
7. [🔬 Bedah Teknis (opsional)](#-bedah-teknis-opsional)
8. [🧩 Tantangan mandiri](#-tantangan-mandiri)
9. [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini)
10. [📖 Glosarium](#-glosarium) · [📝 Kuis](#-kuis-5-soal) · [✅ Checklist kelulusan](#-checklist-kelulusan-modul-14)
11. [📚 Sumber & atribusi gambar](#-sumber--atribusi-gambar)

---

## 🎯 Setelah modul ini kamu bisa…

1. **Menjelaskan pola *sensor node* → *gateway node*** (node sensor → node gerbang) dan mengapa pola ini dipakai di hampir semua produk IoT.
2. **Mengirim data langsung dari ESP32 ke ESP32 dengan ESP-NOW**, tanpa router dan tanpa kata sandi, serta membaca arti ACK (tanda terima) dan batas-batasnya.
3. **Menghindari jebakan channel**: Node 2 menemukan channel router dengan memindai nama WiFi dan mengingatnya di memori RTC, sedangkan Node 1 tetap mendengar walaupun router mati.
4. **Menulis *callback* ESP-NOW menurut cara paket esp32 3.x** dengan aman: titip di kotak surat (antrean), olah di `loop()`.
5. **Merakit Node 2 bertenaga baterai** dengan BME280, DS18B20, dan sensor tanah ke-2 yang listriknya dimatikan selama tidur, lalu mengemas bacaannya menjadi paket 33 byte.
6. **Menjadikan Node 1 jembatan ke MQTT** sesuai kontrak data 1.1: cap waktu, status Node 2, dan rak tunggu selama router mati, lalu menampilkan Node 2 di Node-RED.
7. **Mengukur arus Node 2 dengan INA219, menghitung umur baterainya, dan mengenkripsi ESP-NOW.**

## 🧰 Yang perlu disiapkan

| Barang | Keterangan |
| :--- | :--- |
| **Node 2 dari Modul 9** | Papan ESP32 kedua dengan rangkaian baterai di breadboard mini (18650 → TP4056 → MT3608 5,0 V → VIN) dan DS18B20 beserta modul adaptornya. Isi penuh baterainya sebelum Praktik 4: butuh 1–3 jam dan harus ditunggui (Modul 9). |
| **BME280** (dengan *header* tersolder) | Yang kamu pakai untuk latihan di Modul 7. Pastikan benar-benar BME280, bukan BMP280 (Modul 7 sudah mengajarkan cara mengeceknya). |
| **Sensor tanah kapasitif ke-2** dan segelas air | Kembaran sensor Node 1 (Modul 6). Gelas air untuk kalibrasi. |
| **Kabel jumper** | Untuk sensor Node 2 (Praktik 2): jantan–betina 6 buah, betina–betina 2 buah (kuning dan biru; kabel DAT DS18B20 dari Modul 9 tetap dipakai), dan jantan–jantan 1 buah. Untuk Praktik 7.5: jantan–jantan 1 buah lagi. Siapkan juga beberapa kabel cadangan. |
| **INA219** | Alat ukur arus dari Modul 9 beserta kabelnya (6 jantan–betina dan 1 jantan–jantan untuk GND bersama), untuk Praktik 7. |
| **Node 1 v1.2.1, gateway Pi, Node-RED, dan HP** | Semuanya dari Modul 12–13: Node 1 hidup dari *charger*-nya, gateway menyala, dan dashboard v0 bisa dibuka di HP. |
| **Laptop** | **Arduino IDE 2** dengan paket **esp32 3.3.12** dari Modul 2 (lihat di bawah), library dari Modul 6–9, **MQTTX**, terminal untuk SSH ke Pi, **VS Code** dengan folder `rumah-pintar-mini`, dan **GitHub Desktop**. |
| **Dua kabel USB data** | Supaya Node 1 dan Node 2 bisa tercolok bersamaan. Kalau hanya punya satu, cabut-colok bergantian. |
| **Selotip kertas dan spidol** | Untuk label **Node 1**, **Node 2**, dan **3V3**. |
| **Akses ke halaman pengaturan router** (disarankan) | Untuk mengunci channel WiFi (Praktik 1.5). Biasanya dibuka dari browser di alamat seperti `192.168.1.1`. Tidak bisa? Ada jalan lain. |
| **Jalur Wokwi** (tanpa papan kedua) | Akun [Wokwi](https://wokwi.com) seperti Modul 2–13, Node-RED dari Modul 13 (di Pi atau di laptop), dan broker publik `broker.emqx.io`. |

**Periksa versi paket esp32 dulu.** Kode ESP-NOW di modul ini memakai cara penulisan paket esp32 **3.3** dan butuh setidaknya versi **3.3.7**. Klik ikon **Boards Manager** di bilah kiri Arduino IDE, ketik `esp32`, lalu lihat entri **esp32 by Espressif Systems**. Kalau tertulis `3.3.12 installed`, kamu siap. Kalau versinya lebih lama, pilih **3.3.12** di menu versi, lalu klik **UPDATE** (atau **INSTALL**). Mengapa versi sepenting itu? Konsep 6 menjelaskannya, dan 🚨 punya obat untuk error yang muncul kalau versinya tertinggal.

Versi yang dipakai modul ini (Oktober 2026): paket **esp32 3.3.12** (berbasis ESP-IDF v5.5.5), **Adafruit BME280 Library 2.3.0** (ikut terpasang: **Adafruit Unified Sensor 1.1.15** dan **Adafruit BusIO 1.17.4**, sudah ada sejak Modul 7), **OneWire 2.3.8** dan **DallasTemperature 4.0.6** (Modul 7), **Adafruit INA219 1.2.3** (Modul 9), dan library Node 1 dari Modul 6–11. ESP-NOW dan WiFi sudah ikut paket esp32, jadi tidak ada library baru minggu ini.

---

## 🏆 Kemenangan Cepat: dua ESP32 bercakap tanpa router (30 menit)

Targetnya: papan Node 1 menampilkan sapaan yang dikirim papan Node 2 lewat udara, **tanpa router dan tanpa kata sandi**, dan kamu melihat sendiri apa arti "ACK" (tanda terima).

> 🖥️ **Alat:** **Arduino IDE** dengan dua jendela, papan Node 1 dan papan Node 2 yang tercolok ke laptop lewat USB. Dari Kemenangan Cepat sampai Praktik 2, papan Node 1 menjalankan sketsa latihan, jadi di dashboard Node 1 tertulis `offline` dan otomasi kipas berhenti. Itu wajar; Praktik 3 mengembalikan firmware Node 1. Nama dan kata sandi WiFi yang tersimpan di papan Node 1 tetap aman selama pilihan **Tools → Erase All Flash Before Sketch Upload** tetap **Disabled** (bawaannya).
>
> 🖥️ **Jalur Wokwi:** kerjakan langkah 2 di proyek ESP32 baru di Wokwi; papan simulasi beralamat MAC `24:0A:C4:00:01:10`, kecuali kamu memberinya `macAddress` sendiri di `diagram.json` seperti Modul 11. Langkah 3 bisa dicoba di proyek Wokwi kedua, tetapi **hasilnya menyesatkan**: Wokwi selalu menulis `terkirim: penerima membalas ACK` walaupun tidak ada penerima sama sekali. Simulatornya belum bisa menyambungkan dua ESP32 lewat ESP-NOW (dicoba Oktober 2026). Jadi, cukup baca langkah 3–4 beserta hasilnya.

### Langkah 1 — Beri label dan siapkan dua papan (5 menit)

1. Tempel label **Node 1** dan **Node 2** di kedua papan dan di kabel USB-nya.
2. **Papan Node 1:** matikan MB102 meja kerja dulu, cabut kabel USB papan dari *charger*-nya, lalu colokkan ke laptop (urutan nyala-mati Modul 5). Sketsa latihan minggu ini tidak memakai relay, jadi MB102 boleh tetap mati sampai Praktik 3.
3. **Papan Node 2:** kalau masih tersambung ke rangkaian baterai Modul 9, cabut dulu kabel VIN dan GND-nya dari breadboard mini. Baru setelah itu colokkan kabel USB-nya ke laptop.

### Langkah 2 — Papan penerima: kenali alamat MAC-nya (10 menit)

1. Di Arduino IDE, buka **File → New Sketch**, hapus isinya, lalu tempel kode ini. Simpan dengan nama `modul14_penerima` di folder `modul-14` repositori `belajar-iot` (buat foldernya kalau belum ada).

   ```cpp
   // Modul 14 - Kemenangan Cepat, papan PENERIMA (papan Node 1).
   // Mencetak alamat MAC papan ini, lalu menampilkan setiap paket ESP-NOW yang tiba.
   // Tanpa router dan tanpa kata sandi: radio WiFi menyala sebagai stasiun (STA), tetapi tidak tersambung ke mana pun.
   // Butuh paket esp32 versi 3.3.7 atau lebih baru (modul ini memakai 3.3.12).

   #include <WiFi.h>
   #include <esp_now.h>
   #include <esp_mac.h>

   // Satu paket yang dititipkan "petugas WiFi" kepada loop().
   struct Kiriman {
     uint8_t mac[6];  // alamat pengirim
     int8_t rssi;     // kekuatan sinyal, dBm (makin dekat ke 0, makin kuat)
     int panjang;     // jumlah byte yang tiba
     char isi[64];    // isinya, sebagai teks
   };

   QueueHandle_t kotakSurat;  // antrean FreeRTOS: dari petugas WiFi ke loop()
   unsigned long jumlahPaket = 0;

   // Dipanggil petugas WiFi (bukan loop()) setiap kali paket tiba. Cukup menyalin, menitipkan, selesai.
   void saatDiterima(const esp_now_recv_info_t *info, const uint8_t *data, int panjang) {
     Kiriman k;
     memcpy(k.mac, info->src_addr, 6);
     k.rssi = info->rx_ctrl->rssi;
     k.panjang = panjang;
     int salin = panjang < 63 ? panjang : 63;
     memcpy(k.isi, data, salin);
     k.isi[salin] = '\0';
     xQueueSend(kotakSurat, &k, 0);  // 0 = jangan menunggu; kalau kotak penuh, paket ini dilewatkan
   }

   void setup() {
     Serial.begin(115200);
     delay(1000);
     kotakSurat = xQueueCreate(8, sizeof(Kiriman));
     WiFi.mode(WIFI_STA);  // radio menyala, tetapi tidak tersambung ke router mana pun

     uint8_t mac[6];
     esp_read_mac(mac, ESP_MAC_WIFI_STA);
     Serial.println();
     Serial.printf("MAC papan ini: %02X:%02X:%02X:%02X:%02X:%02X\n", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
     Serial.printf("Salin baris ini ke sketsa pengirim: {0x%02X, 0x%02X, 0x%02X, 0x%02X, 0x%02X, 0x%02X}\n", mac[0], mac[1],
                   mac[2], mac[3], mac[4], mac[5]);

     if (esp_now_init() != ESP_OK) {
       Serial.println("ESP-NOW gagal dimulai. Tekan tombol EN untuk mencoba lagi.");
       return;
     }
     esp_now_register_recv_cb(saatDiterima);
     Serial.printf("Menunggu paket ESP-NOW di channel %d...\n", WiFi.channel());
   }

   void loop() {
     Kiriman k;
     while (xQueueReceive(kotakSurat, &k, 0) == pdTRUE) {  // ambil semua titipan yang sudah ada
       jumlahPaket++;
       Serial.printf("Paket ke-%lu dari %02X:%02X:%02X:%02X:%02X:%02X, %d byte, sinyal %d dBm: \"%s\"\n", jumlahPaket,
                     k.mac[0], k.mac[1], k.mac[2], k.mac[3], k.mac[4], k.mac[5], k.panjang, k.rssi, k.isi);
     }
   }
   ```

2. Di jendela ini, pilih papan **DOIT ESP32 DEVKIT V1** dan port papan **Node 1**, lalu klik **Upload**. Ragu port yang mana? Cabut papan Node 2 sebentar: port yang tetap ada adalah milik Node 1. Kalau unggahan berhenti di `Connecting…`, tahan **BOOT** begitu `Connecting…` muncul, lalu lepaskan saat `Writing at …` mulai berjalan.
3. Buka **Serial Monitor** (115200 baud). Kalau baris pertama tidak terlihat, tekan tombol **EN** di papan Node 1.

   **Hasilnya** (contoh; alamat MAC-mu berbeda):

   ```text
   MAC papan ini: A4:CF:12:E5:B7:C0
   Salin baris ini ke sketsa pengirim: {0xA4, 0xCF, 0x12, 0xE5, 0xB7, 0xC0}
   Menunggu paket ESP-NOW di channel 1...
   ```

   Perhatikan alamat MAC-nya: inilah `device_id` Node 1 yang kamu catat di Modul 11 (`a4cf12e5b7c0`), hanya saja ditulis dengan huruf besar dan diberi titik dua setiap dua digit. Kotak suratnya sudah dibuka di channel 1, channel bawaan ESP32 yang tidak tersambung ke router mana pun.

### Langkah 3 — Papan pengirim: kirim sapaan ke alamat itu (10 menit)

1. Buka **File → New Sketch** lagi. Arduino IDE membuka **jendela kedua**. Hapus isinya, tempel kode ini, lalu simpan dengan nama `modul14_pengirim` di folder `modul-14`.

   ```cpp
   // Modul 14 - Kemenangan Cepat, papan PENGIRIM (papan Node 2).
   // Setiap 2 detik mengirim sapaan lewat ESP-NOW langsung ke alamat MAC papan penerima,
   // lalu melaporkan apakah radio penerima membalas "sudah terima" (ACK).
   // Butuh paket esp32 versi 3.3.7 atau lebih baru (modul ini memakai 3.3.12).

   #include <WiFi.h>
   #include <esp_now.h>

   // GANTI dengan baris "Salin baris ini ke sketsa pengirim" dari Serial Monitor papan penerima:
   const uint8_t MAC_PENERIMA[6] = {0xA4, 0xCF, 0x12, 0xE5, 0xB7, 0xC0};

   volatile bool kirimSelesai = false;  // diisi petugas WiFi, dibaca loop()
   volatile bool adaAck = false;
   unsigned long nomor = 0;

   // Dipanggil petugas WiFi setelah radio tahu nasib paketnya: ada ACK dari penerima, atau tidak.
   void saatTerkirim(const esp_now_send_info_t *info, esp_now_send_status_t status) {
     adaAck = (status == ESP_NOW_SEND_SUCCESS);
     kirimSelesai = true;
   }

   void setup() {
     Serial.begin(115200);
     delay(1000);
     WiFi.mode(WIFI_STA);  // radio menyala, tanpa router
     if (esp_now_init() != ESP_OK) {
       Serial.println("ESP-NOW gagal dimulai. Tekan tombol EN untuk mencoba lagi.");
       return;
     }
     esp_now_register_send_cb(saatTerkirim);

     esp_now_peer_info_t peer = {};  // "buku alamat": semua kolom dinolkan dulu
     memcpy(peer.peer_addr, MAC_PENERIMA, 6);
     peer.channel = 0;          // 0 = channel yang sedang dipakai radio papan ini
     peer.ifidx = WIFI_IF_STA;  // kirim lewat antarmuka stasiun (STA)
     peer.encrypt = false;      // tanpa enkripsi dulu (Praktik 8)
     if (esp_now_add_peer(&peer) != ESP_OK) {
       Serial.println("Gagal menambah alamat penerima. Periksa isi MAC_PENERIMA.");
       return;
     }
     Serial.println();
     Serial.printf("Siap mengirim ke %02X:%02X:%02X:%02X:%02X:%02X di channel %d.\n", MAC_PENERIMA[0], MAC_PENERIMA[1],
                   MAC_PENERIMA[2], MAC_PENERIMA[3], MAC_PENERIMA[4], MAC_PENERIMA[5], WiFi.channel());
   }

   void loop() {
     nomor++;
     char isi[32];
     snprintf(isi, sizeof(isi), "halo dari kebun #%lu", nomor);
     kirimSelesai = false;
     esp_err_t hasil = esp_now_send(MAC_PENERIMA, (const uint8_t *)isi, strlen(isi) + 1);  // +1: ikut kirim akhir teks
     if (hasil != ESP_OK) {
       Serial.printf("#%lu tidak bisa dikirim: %s\n", nomor, esp_err_to_name(hasil));
     } else {
       unsigned long mulai = millis();
       while (!kirimSelesai && millis() - mulai < 200) {  // tunggu laporan radio, paling lama 200 ms
         delay(1);
       }
       if (kirimSelesai && adaAck) {
         Serial.printf("#%lu terkirim: penerima membalas ACK.\n", nomor);
       } else {
         Serial.printf("#%lu GAGAL: tidak ada ACK (penerima mati, terlalu jauh, atau beda channel).\n", nomor);
       }
     }
     delay(2000);
   }
   ```

2. Ganti isi kurung kurawal baris `MAC_PENERIMA` dengan isi kurung kurawal baris `Salin baris ini…` dari Serial Monitor Node 1: sorot isinya di Serial Monitor (dari `0x` pertama sampai angka terakhir), salin (**Ctrl + C**), lalu tempel menggantikan isi kurung kurawal di kode. Bagian lain baris kodenya, termasuk titik koma di ujungnya, tidak berubah.
3. Di jendela kedua ini, pilih **DOIT ESP32 DEVKIT V1** dan port papan **Node 2**, klik **Upload**, lalu buka **Serial Monitor** jendela ini (115200 baud). Kalau baris `Siap mengirim …` terlewat, tekan **EN** di papan Node 2.

   **Hasilnya** di Serial Monitor Node 2 (contoh):

   ```text
   Siap mengirim ke A4:CF:12:E5:B7:C0 di channel 1.
   #1 terkirim: penerima membalas ACK.
   #2 terkirim: penerima membalas ACK.
   #3 terkirim: penerima membalas ACK.
   ```

   Pada saat yang sama, di Serial Monitor Node 1 (contoh):

   ```text
   Paket ke-1 dari 24:6F:28:B1:C7:D4, 19 byte, sinyal -41 dBm: "halo dari kebun #1"
   Paket ke-2 dari 24:6F:28:B1:C7:D4, 19 byte, sinyal -42 dBm: "halo dari kebun #2"
   Paket ke-3 dari 24:6F:28:B1:C7:D4, 19 byte, sinyal -41 dBm: "halo dari kebun #3"
   ```

4. **Catat alamat pengirimnya.** Alamat di belakang kata `dari` adalah alamat MAC papan Node 2, calon `device_id` Node 2 (contoh: `24:6F:28:B1:C7:D4` menjadi `246f28b1c7d4`). Buat file `catatan-modul14.md` di folder `modul-14` (di VS Code: **File → New Text File**, kemudian **File → Save As…**), lalu tulis kedua alamat MAC di sana. Keduanya dipakai lagi di Praktik 1–4.

### Langkah 4 — Buktikan arti ACK (5 menit)

1. Cabut kabel USB papan **Node 1**. Dalam dua detik, Serial Monitor Node 2 menulis (contoh):

   ```text
   #9 GAGAL: tidak ada ACK (penerima mati, terlalu jauh, atau beda channel).
   #10 GAGAL: tidak ada ACK (penerima mati, terlalu jauh, atau beda channel).
   ```

2. Colokkan lagi papan Node 1. Begitu papannya menyala, laporan Node 2 kembali menjadi `terkirim: penerima membalas ACK.`

**Apa yang barusan terjadi?** Tidak ada router, tidak ada alamat IP, dan tidak ada kata sandi. Papan Node 2 mengirim 19 byte (18 karakter, yaitu huruf, angka, spasi, dan tanda `#`, ditambah satu tanda akhir teks) langsung ke **alamat MAC** papan Node 1, keduanya di channel 1. Begitu bingkai radionya diterima utuh, **radio** papan Node 1 langsung membalas dengan tanda terima kecil, yaitu **ACK**. Tanpa ACK, Node 2 tahu kirimannya gagal dan bisa mencoba lagi. Inilah dasar Node 2 v1.0.0: mengirim, menunggu ACK, mencoba lagi kalau perlu, lalu tidur.

> ➡️ **Selesai Kemenangan Cepat?** Baca [Konsep 1](#1-node-sensor-dan-node-gateway-pola-di-hampir-semua-produk-iot) sampai [Konsep 3](#3-channel-satu-radio-satu-frekuensi), lalu kerjakan praktik sesuai urutan di awal 🧠 Konsep. Biarkan kedua papan tetap tercolok: Praktik 1 langsung memakainya.

---

## 🧠 Konsep "Mengapa"

Sepuluh konsep berikut menjelaskan **mengapa** Node 2 dibuat seperti ini, satu per bagian, dan **tidak perlu dibaca sekaligus**. Konsep dan praktik dikerjakan berselang-seling dengan urutan ini:

1. Kemenangan Cepat → **Konsep 1–3** → Praktik 1 (channel router)
2. **Konsep 4–5** → Praktik 2 (sensor Node 2 dan paket 33 byte)
3. **Konsep 6–7** → Praktik 3, 4, dan 5 (Node 1 v1.3.0, Node 2 v1.0.0, kartu Kebun)
4. **Konsep 8** → Praktik 6 (uji matikan router)
5. **Konsep 9** → Praktik 7 (arus dan umur baterai)
6. **Konsep 10** → Praktik 8 (enkripsi) → 🧩 Tantangan → ➕ Tambahan

> 🖥️ **Perlu mencoba sesuatu di bagian Konsep?** Tidak wajib. Potongan kode di bagian Konsep diambil dari sketsa dan firmware yang kamu pakai di Praktik.

### 1. Node sensor dan node gateway: pola di hampir semua produk IoT

Lihat produk IoT di sekitarmu: sensor pintu rumah pintar, termometer ruangan yang tersambung ke aplikasi, atau sensor tanah di kebun sawit. Hampir semuanya terdiri atas dua jenis perangkat.

- **Node sensor** (*sensor node*): kecil, murah, hidup dari baterai, dan **tidur hampir sepanjang waktu**. Ia bangun sebentar untuk membaca sensor, mengirim satu pesan pendek lewat radio jarak dekat, lalu tidur lagi. Ia tidak perlu tahu apa-apa tentang internet.
- **Node gateway** (*gateway node*, node gerbang): berlistrik tetap, **selalu bangun**, mendengarkan node sensor, lalu meneruskan pesannya ke jaringan yang lebih besar. *Hub* (pusat kendali) rumah pintar yang dicolokkan ke stopkontak adalah contohnya.

Mengapa dipisah? Karena dua tugas itu bertolak belakang. Radio WiFi yang terus mendengar menyedot sekitar 100 mA, jadi perangkat yang selalu tersambung ke WiFi tidak akan tahan lama dari baterai. Di Modul 9 kamu sudah mengukurnya sendiri: papan yang tidur jauh lebih hemat daripada papan yang bangun. Jadi, perangkat berbaterai dibuat sesederhana dan sesingkat mungkin, sedangkan pekerjaan yang menuntut perangkat selalu bangun diserahkan kepada perangkat yang berlistrik tetap.

Di Rumah Pintar Mini, pola ini muncul di dua tingkat:

![Diagram dari kebun ke HP, rantai pesan Node 2. Kiri, Node 2 Kebun: ESP32 kedua dari baterai 18650, membawa BME280, DS18B20, dan sensor tanah ke-2; bangun setiap 5 menit, sekitar setengah detik, lalu tidur; label node sensor. Panah ESP-NOW, satu paket 33 byte, tanpa router, ke Node 1 Rumah: berlistrik charger, selalu bangun, tersambung ke WiFi rumah; tugas baru: jembatan ESP-NOW ke MQTT; label node gateway tingkat 1. Panah MQTT lewat WiFi rumah ke gateway Raspberry Pi 192.168.1.37 berisi Mosquitto dan Node-RED; label gateway rumah, tingkat 2. Panah web ke HP yang membuka dashboard dengan kartu Kebun. Di bawah Node 1, kotak yang disambung garis putus-putus: Node 1 menerbitkan atas nama Node 2 ke rpm/246f28b1c7d4/telemetry dan rpm/246f28b1c7d4/status. Catatan bawah: Node 2 tidak pernah tersambung ke router dan tidak tahu kata sandi WiFi; data Node 2 tetap memakai device_id Node 2 sendiri walaupun yang menerbitkannya Node 1.](aset/dari-kebun-ke-hp.png)

| | Node 2 "Kebun" | Node 1 "Rumah" | Gateway Pi |
| :--- | :--- | :--- | :--- |
| Listrik | baterai 18650 | *charger* | adaptor resmi Pi |
| Selalu bangun? | tidak: bangun setiap 5 menit, sekitar setengah detik | ya | ya |
| Berbicara dengan | Node 1, lewat ESP-NOW | Node 2 (ESP-NOW) dan broker (MQTT lewat WiFi) | Node 1, Node-RED, dan HP (MQTT, web) |
| Perannya | **node sensor** | sensor + aktuator rumah, sekaligus **node gateway** untuk Node 2 | **gateway rumah** (Modul 12), kelak jembatan ke internet (Modul 27) |

Node 2 tidak pernah tersambung ke broker. **Node 1 menerbitkan pesannya atas nama Node 2**, tetap dengan `device_id` Node 2 sendiri: `rpm/246f28b1c7d4/telemetry`. Bagi broker, Node-RED, dan database kelak, Node 2 tetap perangkat tersendiri. Inilah aturan kontrak data sejak Modul 11 yang baru sekarang terpakai.

### 2. ESP-NOW: surat langsung tanpa kantor pos

Di Modul 10, Node 1 tersambung ke WiFi rumah dengan cara biasa: **mendaftar** dulu ke router dengan nama dan kata sandi WiFi, mendapat alamat IP, baru boleh berbicara. Semua pesannya lewat router, seperti surat yang selalu lewat kantor pos. Cara ini cocok untuk perangkat yang selalu menyala, tetapi mahal untuk Node 2: setiap kali bangun, menyambung ke router butuh beberapa detik dengan radio menyala, dan kata sandi WiFi harus disimpan di papan yang tergeletak di kebun.

**ESP-NOW** adalah protokol buatan Espressif, pembuat chip ESP32. Dengan ESP-NOW, satu ESP32 mengirim **bingkai WiFi khusus** langsung ke **alamat MAC** ESP32 lain, tanpa router, tanpa alamat IP, dan tanpa mendaftar. Bayangkan melempar catatan langsung ke jendela tetangga yang sedang terbuka. Tetangganya berteriak "dapat!", dan teriakan itu adalah **ACK** (*acknowledgement*, tanda terima) yang kamu lihat di Kemenangan Cepat.

![Diagram dua cara mengirim pesan dari kebun. Atas, WiFi biasa, tiga langkah bernomor: 1 mendaftar ke router dengan nama dan kata sandi WiFi, 2 meminta alamat IP (DHCP), 3 baru boleh mengirim pesan lewat router ke Node 1 atau broker; sekitar 1 sampai 3 detik dengan radio menyala; semua pesan lewat router, dan kalau router mati, pesan tidak bisa dikirim. Bawah, ESP-NOW: Node 2 mengirim satu bingkai langsung ke alamat MAC Node 1, A4:CF:12:E5:B7:C0, tanpa router dan tanpa kata sandi WiFi; ikon router di atas panah disilang dan bertuliskan router tidak dipakai; radio Node 1 membalas ACK; kirim dan ACK hanya beberapa milidetik; asalkan keduanya di channel yang sama, ESP-NOW tetap bekerja walaupun router mati. Catatan: unicast ke satu alamat mendapat ACK; siaran ke FF:FF:FF:FF:FF:FF tidak pernah mendapat ACK.](aset/esp-now-vs-wifi.png)

| | WiFi biasa (Node 1 ke router) | ESP-NOW (Node 2 ke Node 1) |
| :--- | :--- | :--- |
| Perlu router menyala? | ya | **tidak** |
| Perlu nama dan kata sandi WiFi? | ya | **tidak** |
| Sebelum bisa mengirim | mendaftar ke router dan meminta alamat IP: biasanya 1–3 detik | langsung: beberapa milidetik |
| Alamat tujuan | alamat IP (misalnya broker `192.168.1.37`) | **alamat MAC** papan tujuan |
| Ukuran satu pesan | besar, tidak terasa batasnya | sampai **250 byte** per paket (versi terbaru sampai 1.470 byte); paket Node 2 hanya 33 byte |
| Bukti terkirim | dari sambungan TCP dan, untuk MQTT, dari QoS | **ACK** dari radio penerima untuk setiap paket *unicast* |
| Bisa sampai ke internet? | ya, lewat router | tidak; perlu node gateway (Node 1) |

Beberapa hal penting tentang ESP-NOW:

- **Unicast dan siaran.** Paket yang dikirim ke satu alamat MAC (*unicast*) dibalas ACK oleh radio penerimanya. Paket ke alamat siaran `FF:FF:FF:FF:FF:FF` (*broadcast*) diterima semua ESP32 di sekitar yang sedang mendengar, tetapi **tidak pernah** dibalas ACK. Node 2 memakai *unicast* ke Node 1 supaya ia tahu kirimannya sampai.
- **ACK berarti "radionya menerima", bukan "programnya sudah mengolah".** ACK dikirim oleh radio penerima begitu bingkai tiba dengan utuh, sebelum program di papan itu menyentuh isinya. Karena itu, Node 2 juga memberi **nomor urut** pada setiap paket supaya Node 1 bisa menghitung paket yang hilang dan membuang paket ganda (Konsep 8).
- **Jarak.** Menurut Espressif, ESP-NOW cukup stabil sampai sekitar 150 m di ruang terbuka dan bisa mencapai 300 m. Di rumah, tembok dan lantai memperpendeknya jauh. Kekuatan sinyalnya bisa kamu lihat sendiri dari angka `sinyal … dBm` di Serial Monitor Node 1: mendekati 0 berarti kuat, sekitar −80 dBm masih nyaman, dan mendekati −90 dBm mulai rawan.
- **Harus di channel yang sama.** Ini jebakan terbesar ESP-NOW. Konsep 3 membahasnya.

### 3. Channel: satu radio, satu frekuensi

WiFi 2,4 GHz dibagi menjadi beberapa ***channel*** (kanal atau saluran), masing-masing selebar sekitar 20 MHz. Di Indonesia dipakai channel 1–13, dan router rumahmu memilih salah satunya, sering kali otomatis (**Auto**). Seperti stasiun radio FM, kamu hanya mendengar siaran di frekuensi yang sedang kamu putar.

ESP32 hanya punya **satu radio**, dan pada satu saat radio itu hanya berada di **satu channel**. Paket ESP-NOW hanya terdengar kalau pengirim dan penerima berada di channel yang sama. Di Kemenangan Cepat, kedua papan tidak tersambung ke router mana pun, jadi keduanya diam di channel bawaan, channel 1. Itulah sebabnya Kemenangan Cepat langsung berhasil.

Node 1 sungguhan **tersambung ke router**, jadi radionya ikut channel router, misalnya channel 6. Node 2 harus mengirim di channel 6 juga. Padahal Node 2 tidak pernah tersambung ke router, jadi tidak ada yang memberitahunya. Jalan keluarnya:

1. **Node 2 memindai nama WiFi rumah**, hanya namanya (misalnya `RumahKita`), tanpa kata sandi. Hasil pindaian menyebut channel router itu, dan itulah channel Node 1.
2. Memindai butuh sekitar **2,2–2,4 detik** dengan radio menyala, kira-kira tiga sampai empat kali tenaga satu kali bangun yang biasa. Jadi, Node 2 **mengingat channel itu di memori RTC** (memori yang selamat selama tidur dalam, Modul 9) dan memakainya lagi tanpa memindai.
3. Node 2 baru **memindai ulang setelah dua kali bangun gagal berturut-turut**. Kalau nama WiFi itu tidak ditemukan, misalnya router sedang mati, channel lama dipertahankan: Node 1 masih menunggu di sana.

![Diagram channel radio. Atas, pita WiFi 2,4 GHz berisi channel 1 sampai 13; router RumahKita di channel 6, ditandai. Node 1, tersambung ke router, radionya di channel 6. Node 2, tidak tersambung: saat pertama bangun memindai nama RumahKita, menemukan channel 6, menyimpannya di memori RTC, lalu mengirim di channel 6; bangun berikutnya langsung memakai channel 6 tanpa memindai, dan baru memindai lagi setelah dua kali bangun gagal berturut-turut. Bawah, dua pita waktu 0 sampai 120 detik saat router mati, dengan garis putus-putus pada saat-saat Node 2 mengirim (contoh, jaraknya dirapatkan): Node 1 v1.2.1 memindai semua channel terus-menerus, sekitar 2,4 detik setiap percobaan, sehingga hampir tidak pernah diam di channel 6 dan paket Node 2 hilang; Node 1 v1.3.0 hanya mencoba setiap 60 detik, lalu kembali ke channel 6 sehingga paket Node 2 tetap diterima. Catatan merah: router di channel 12 atau 13 ditolak ESP32 yang tidak tersambung (aturan dunia, channel 1 sampai 11); kunci router di channel 1, 6, atau 11.](aset/channel-radio.png)

Ada tiga jebakan yang perlu kamu ketahui:

- **Router di channel 12 atau 13.** ESP32 yang tidak tersambung ke router memakai aturan negara "dunia" yang hanya mengizinkan channel 1–11. Node 2 bisa **menemukan** routermu di channel 12, tetapi **tidak boleh pindah** ke sana. Sketsa modul ini mencetak `Channel 12 ditolak ESP32…`; obatnya: ubah channel router menjadi 1, 6, atau 11.
- **Router dengan channel otomatis.** Router yang dinyalakan ulang bisa memilih channel lain. Node 2 baru menyadarinya setelah dua kali bangun gagal (10 menit pada jadwal 5 menit). Karena itu, Praktik 1.5 menyarankan **mengunci channel router** di 1, 6, atau 11.
- **Node 1 saat router mati.** Di Modul 10, Node 1 diajari menyambung lagi sendiri: setiap kali gagal, paket esp32 langsung mencoba lagi, dan setiap percobaan **memindai semua channel** selama sekitar 2,4 detik. Selama router mati, radio Node 1 hampir tidak pernah diam di channel lamanya, jadi paket Node 2 tidak terdengar. Node 1 v1.3.0 (Praktik 3) mematikan sambung ulang otomatis itu (`WiFi.setAutoReconnect(false)`), menyerahkan tugasnya kepada penjaga 60 detik dari Modul 10, dan sesudah setiap percobaan mengembalikan radio ke channel router. Node 1 juga tidak lagi membiarkan radionya tidur sebentar-sebentar (`WiFi.setSleep(false)`) supaya paket Node 2 tidak terlewat. Papan berlistrik *charger* tidak perlu berhemat.

> ➡️ **Saatnya praktik!** Konsep 1–3 cukup untuk [Praktik 1 — Channel router dan memindai nama WiFi](#praktik-1--channel-router-dan-memindai-nama-wifi-40-menit). Setelah itu, kembali ke Konsep 4.

### 4. Bangun sebentar, tidur lama: urutan bangun Node 2

Di Modul 9 kamu belajar bahwa papan yang tidur dalam (*deep sleep*) jauh lebih hemat daripada papan yang bangun. Kamu juga melihat sendiri bahwa kerangka Node 2 waktu itu bangun sekitar 0,8 detik, sebagian besar untuk menunggu DS18B20 mengukur dengan resolusi penuh (Modul 9 Praktik 4). Minggu ini Node 2 membawa tiga sensor dan sebuah radio, jadi **urutan** pekerjaannya selama bangun ikut menentukan umur baterai.

![Diagram urutan bangun Node 2 v1.0.0 dengan grafik arus perkiraan. Sumbu waktu dari 0 sampai sekitar 0,6 detik. Langkah berurutan: 1, LED biru menyala dan pin D32 HIGH, sensor tanah mulai mendapat listrik; 2, DS18B20 mulai mengukur tanpa ditunggu, 10 bit, paling lama 188 ms; 3, BME280 dicari, lalu mengukur sekali dalam mode forced, kemudian tidur sendiri; 4, menunggu DS18B20 selesai dan sensor tanah tenang, paling cepat 300 ms sejak D32 menyala; lalu 20 bacaan sensor tanah dan D32 LOW; 5, radio menyala paling akhir: channel dari ingatan RTC, kirim satu paket, menunggu ACK paling lama 200 ms; 6, radio dimatikan, LED padam, tidur 300 detik. Grafik arus di bawahnya: sekitar 50 mA saat membaca sensor, melonjak ke sekitar 100 sampai 130 mA hanya selama radio menyala, lalu turun ke arus tidur papan sekitar 4 sampai 5 mA. Catatan: angka arus adalah perkiraan di sisi 5 V, termasuk regulator dan LED papan DevKit V1; ukur sendiri dengan INA219 di Praktik 7; di Praktik 2, BME280 selesai sekitar 120 ms dan DS18B20 sekitar 190 ms sejak bangun.](aset/bangun-node2.png)

Prinsipnya: **sensor dulu, radio paling akhir**, dan setiap bagian dimatikan begitu tugasnya selesai. Radio menyedot arus paling besar, jadi radio dinyalakan sesingkat mungkin. Bonusnya, pembacaan ADC sensor tanah tidak terganggu derau radio. Ada tiga keputusan kecil yang pengaruhnya besar:

1. **Sensor tanah mendapat listrik dari pin D32, bukan dari 3V3.** Sensor tanah kapasitif menyedot sekitar 5 mA terus-menerus selama diberi listrik. Pin 3V3 papan tetap berlistrik walaupun ESP32 tidur (regulator papan tidak ikut tidur, Modul 9), jadi sensor yang disambung ke 3V3 ikut menyala sepanjang waktu. Arus tidur Node 2 naik dari sekitar 5 mA menjadi sekitar 10 mA, dan umur baterai tinggal separuh. Dengan VCC dari D32, sensor hanya menyala selama Node 2 bangun: `digitalWrite(32, HIGH)` di awal, `digitalWrite(32, LOW)` setelah dibaca. Arus 5 mA masih jauh di bawah batas aman satu pin ESP32.
2. **BME280 dibaca dalam mode *forced*** (sekali ukur). `bme.begin()` saja membuat BME280 mengukur terus-menerus (mode *normal*) dan bisa menyedot sampai sekitar 0,5 mA selama Node 2 tidur. Dalam mode *forced*, BME280 mengukur sekali, lalu tidur sendiri dengan arus sekitar 0,1 µA:

   ```cpp
   bme.setSampling(Adafruit_BME280::MODE_FORCED, Adafruit_BME280::SAMPLING_X1, Adafruit_BME280::SAMPLING_X1,
                   Adafruit_BME280::SAMPLING_X1, Adafruit_BME280::FILTER_OFF);
   if (!bme.takeForcedMeasurement()) {
     return;
   }
   ```

   Setelan ini (sekali ukur, tanpa penghalus) adalah setelan yang disarankan Bosch, pembuat BME280, untuk stasiun cuaca: cukup untuk bacaan setiap beberapa menit. Ingat juga: `readPressure()` memberi angka dalam **pascal**, jadi dibagi 100 supaya menjadi **hPa** (`1008.6`, bukan `100860`).
3. **DS18B20 diatur 10 bit.** Pada resolusi 12 bit (bawaan), DS18B20 butuh sampai 750 ms untuk satu bacaan dengan kehalusan 0,0625 °C. Padahal ketelitian sensornya sendiri ±0,5 °C (Modul 7), jadi angka sehalus itu hanya kelihatan teliti. Pada 10 bit, satu bacaan paling lama 188 ms dengan kehalusan 0,25 °C, jujur dan lebih cepat. `setResolution(10)` aman dipanggil setiap bangun: library **DallasTemperature** 4.0.6 hanya menulis memori sensor kalau resolusinya memang berbeda. Lalu, `setWaitForConversion(false)` membuat DS18B20 mengukur **sambil** Node 2 membaca BME280.

Dua kebiasaan lain ikut menghemat: `WiFi.persistent(false)` supaya setelan WiFi tidak ditulis ke memori *flash* setiap bangun (aturan Modul 9: jangan menulis NVS berulang-ulang), dan pemindaian channel hanya saat perlu (Konsep 3). Namun, jangan berharap terlalu banyak: arus tidur papan DevKit V1 sendiri (sekitar 4–5 mA, karena regulator dan LED merahnya) tetap menjadi bagian terbesar. Konsep 9 menghitungnya.

### 5. Paket 33 byte: formulir yang sama di kedua ujung

Apa yang dikirim Node 2? Bisa saja teks JSON seperti di MQTT, sekitar 130 byte, masih muat dalam 250 byte. Namun, Node 2 mengirim **paket biner**: deretan byte dengan susunan tetap, seperti formulir yang kolom-kolomnya sudah dicetak. Alasannya:

- **Node 1 mudah memeriksanya.** Paket sah selalu tepat 33 byte, diawali tanda `0x52` dan nomor versi formulir `1`. Paket lain langsung ditolak.
- **Aturan kontrak data cukup ditegakkan di satu tempat.** Node 1 yang membuat JSON-nya: menambahkan `ts`, membulatkan angka, dan menulis `null` untuk bacaan gagal. Node 2 tidak perlu library JSON.
- **Ukurannya tetap kecil.** Satu paket berada di udara kurang dari satu milidetik.

Formulirnya ditulis sekali sebagai `struct` di file `paket-node2.h`, dan file yang **sama persis** dipakai di folder firmware Node 1 dan Node 2:

```cpp
// paket-node2.h - "formulir" paket ESP-NOW dari Node 2 "Kebun" ke Node 1 "Rumah" (Modul 14).
// File ini SAMA PERSIS di folder node-1-rumah dan node-2-kebun. Kalau susunannya diubah, ubah KEDUANYA
// dan naikkan PAKET_VERSI, supaya Node 1 menolak paket lama dengan pesan yang jelas.
// Kedua ujung adalah ESP32 (little-endian, kompiler sama), jadi struct boleh dikirim apa adanya.
#pragma once
#include <stdint.h>

const uint8_t PAKET_TANDA = 0x52;  // huruf 'R' (Rumah Pintar Mini): paket ESP-NOW milik orang lain langsung ditolak
const uint8_t PAKET_VERSI = 1;     // naikkan setiap kali susunan formulir berubah

// __attribute__((packed)) = tanpa celah antarkolom: ukurannya sama persis di pengirim dan penerima.
struct __attribute__((packed)) PaketNode2 {
  uint8_t tanda;       // selalu PAKET_TANDA
  uint8_t versi;       // selalu PAKET_VERSI
  uint8_t fw[3];       // versi firmware Node 2: mayor, minor, tambalan, misalnya {1, 0, 0}
  uint16_t sesi;       // angka acak baru setiap Node 2 menyala dari MATI (bukan dari tidur)
  uint32_t urutan;     // nomor paket: naik 1 setiap kali Node 2 bangun
  uint16_t jedaDetik;  // jadwal bangun Node 2 (misalnya 300); Node 1 memakainya untuk batas "offline"
  uint8_t percobaan;   // kiriman ke berapa dalam satu kali bangun (1 = langsung berhasil)
  float suhu;          // derajat Celsius dari BME280; NAN = gagal dibaca
  float kelembapan;    // persen dari BME280; NAN = gagal dibaca
  float tekanan;       // hPa dari BME280; NAN = gagal dibaca
  float suhuTanah;     // derajat Celsius dari DS18B20; NAN = gagal dibaca
  int8_t tanah;        // persen 0-100 dari sensor tanah ke-2; -1 = gagal dibaca
  uint16_t bateraiMv;  // tegangan baterai dalam milivolt; 0 = tidak diukur
};
static_assert(sizeof(PaketNode2) == 33, "Ukuran PaketNode2 berubah: samakan kedua file dan naikkan PAKET_VERSI");
```

Beberapa kata yang mungkin baru:

- **`uint8_t`, `uint16_t`, `uint32_t`, `int8_t`**: bilangan bulat dengan ukuran pasti (8, 16, atau 32 bit, yaitu 1, 2, atau 4 byte). Huruf `u` berarti tanpa tanda minus. `float` selalu 4 byte di ESP32.
- **`__attribute__((packed))`**: menyuruh kompiler menyusun kolom-kolom **rapat tanpa celah**. Tanpa ini, kompiler boleh menyisipkan byte kosong supaya kolom `float` jatuh di alamat kelipatan empat, dan ukuran struct menjadi lebih dari 33 byte.
- **`static_assert`**: pemeriksaan **saat kompilasi**. Kalau ukuran struct bukan 33 byte, misalnya karena kamu menambah kolom di satu folder saja, Arduino IDE menolak mengompilasi dan menampilkan kalimat di dalam petik ganda itu.
- **`NAN`** (*not a number*, bukan angka): penanda bacaan `float` yang gagal. Saat Node 1 menyusun JSON, library **ArduinoJson** menulis `NAN` sebagai `null`, persis seperti aturan kontrak data. Untuk `tanah`, penandanya `-1`; untuk baterai, `0` berarti "tidak diukur" sehingga kolom `baterai` tidak ditulis sama sekali.

![Diagram peta paket 33 byte, dibaca dari kiri ke kanan seperti deretan kotak bernomor 0 sampai 32. Byte 0 tanda 0x52 huruf R; byte 1 versi formulir 1; byte 2 sampai 4 versi firmware Node 2, 1.0.0; byte 5 sampai 6 sesi; byte 7 sampai 10 urutan; byte 11 sampai 12 jeda bangun dalam detik; byte 13 percobaan; byte 14 sampai 17 suhu udara; byte 18 sampai 21 kelembapan; byte 22 sampai 25 tekanan; byte 26 sampai 29 suhu tanah, masing-masing 4 byte; byte 30 tanah dalam persen; byte 31 sampai 32 baterai dalam milivolt. Isi kotak-kotaknya adalah contoh nyata dari Wokwi, Praktik 2, tanpa BME280, DS18B20 27,0 derajat, dan potensiometer 55 persen: 52 01 01 00 00 AD 9C 01 00 00 00 2C 01 01 00 00 C0 7F 00 00 C0 7F 00 00 C0 7F 00 00 D8 41 37 00 00, dengan tafsiran: AD 9C adalah sesi 0x9CAD; 01 00 00 00 adalah urutan 1; 2C 01 adalah 300 detik; tiga kali 00 00 C0 7F adalah NAN karena Wokwi tidak punya BME280; 00 00 D8 41 adalah 27,0 derajat; 37 adalah 55 persen tanah; 00 00 berarti baterai tidak diukur. Catatan: angka lebih dari satu byte ditulis byte terkecil dulu (little-endian), jadi 2C 01 berarti 0x012C = 300.](aset/peta-paket-33-byte.png)

Satu hal lagi yang tampak aneh di gambar: angka 300 tertulis `2C 01`, bukan `01 2C`. ESP32 menyimpan angka yang lebih dari satu byte dengan **byte terkecil lebih dulu** (*little-endian*): `0x012C` disimpan sebagai `2C`, lalu `01`. Karena Node 1 dan Node 2 sama-sama ESP32 dengan kompiler yang sama, susunan ini cocok di kedua ujung, dan struct boleh dikirim apa adanya. Kalau suatu hari penerimanya bukan ESP32, susunan byte-nya harus diperhatikan.

Kolom `sesi` dan `urutan` dibahas di Konsep 8. Pelajarannya untuk sekarang: **ubah `paket-node2.h` di kedua folder sekaligus, dan naikkan `PAKET_VERSI` setiap kali susunannya berubah.** Node 1 menolak paket berversi lain dengan pesan yang jelas, bukan menafsirkan byte yang salah.

> ➡️ **Saatnya praktik!** Konsep 4–5 cukup untuk [Praktik 2 — Sensor Node 2 dan paket 33 byte](#praktik-2--sensor-node-2-dan-paket-33-byte-60-menit). Setelah itu, kembali ke Konsep 6.

### 6. Callback cara paket esp32 3.x: titip di kotak surat, olah di `loop()`

***Callback*** (fungsi panggil-balik) adalah fungsi yang kamu daftarkan, lalu dipanggil sistem saat sesuatu terjadi. Kamu sudah memakainya di Modul 10: fungsi peristiwa WiFi `saatPeristiwaWiFi` dipanggil paket esp32 setiap kali WiFi tersambung atau putus. ESP-NOW punya dua *callback*:

- ***callback* kirim**, dipanggil setelah radio tahu nasib paketnya (ada ACK atau tidak), didaftarkan dengan `esp_now_register_send_cb()`;
- ***callback* terima**, dipanggil setiap kali paket tiba, didaftarkan dengan `esp_now_register_recv_cb()`.

**Di mana keduanya berjalan?** Bukan di `loop()`. Keduanya dijalankan oleh **petugas WiFi**, sebuah *task* (tugas) milik paket esp32 yang berprioritas tinggi di inti 0, sedangkan `loop()` berjalan di inti 1. Petugas WiFi dan `loop()` benar-benar berjalan **bersamaan**. Akibatnya, ada dua aturan:

1. ***Callback* harus singkat.** Dokumentasi ESP-IDF berpesan agar *callback* tidak dipakai untuk pekerjaan panjang: data yang perlu cukup dititipkan ke **antrean**, lalu diolah oleh tugas lain. Jadi, jangan `Serial.print()`, jangan menyusun JSON, dan jangan `mqtt.publish()` di dalam *callback*.
2. **Salin datanya, jangan simpan penunjuknya.** Alamat pengirim dan isi paket hanya sah selama *callback* berjalan. Setelah itu, tempatnya dipakai lagi.

Untuk satu tanda kecil, cukup **bendera** `volatile bool`, seperti di Modul 10 dan di sketsa pengirim Kemenangan Cepat (`kirimSelesai`, `adaAck`). Namun, isi paket terdiri atas puluhan byte. Menyalinnya lewat beberapa variabel biasa berbahaya: `loop()` bisa membaca separuh paket lama dan separuh paket baru. Yang tepat adalah **antrean FreeRTOS** (*queue*): sebuah **kotak surat** yang menyalin setiap titipan utuh, satu per satu.

![Diagram kotak surat untuk callback ESP-NOW. Kiri, inti 0: petugas WiFi, prioritas tinggi. Paket ESP-NOW tiba, callback saatTerimaEspNow dipanggil: periksa bahwa paketnya bukan siaran dan panjangnya tepat 33 byte, salin isi paket, alamat pengirim, dan kekuatan sinyal, catat millis, lalu xQueueSend dengan waktu tunggu 0 ke kotak surat. Tengah, kotak surat antrean FreeRTOS dengan 8 slot, tiga di antaranya terisi paket. Kanan, inti 1: loop. perbaruiJembatan mengambil isi kotak surat dengan xQueueReceive tanpa menunggu, lalu memeriksa MAC, tanda, dan versi, membuang paket ganda sambil menghitung yang hilang, menyimpan ke rak tunggu, menerbitkan lewat MQTT paling banyak 3, dan mencetak log ke Serial Monitor; centang hijau: semua pekerjaan panjang di sini. Tanda silang merah di dalam callback: jangan Serial.print, jangan mqtt.publish, jangan menyusun JSON, jangan menunggu. Catatan: callback dan loop berjalan bersamaan di dua inti; kotak surat menyalin setiap titipan utuh.](aset/kotak-surat-callback.png)

Polanya, seperti di sketsa penerima Kemenangan Cepat:

```cpp
QueueHandle_t kotakSurat = xQueueCreate(8, sizeof(Kiriman));  // 8 slot, setiap slot sebesar satu Kiriman

void saatDiterima(const esp_now_recv_info_t *info, const uint8_t *data, int panjang) {
  Kiriman k;
  memcpy(k.mac, info->src_addr, 6);  // salin: info dan data hanya sah selama callback berjalan
  // ... salin isi paket ...
  xQueueSend(kotakSurat, &k, 0);     // 0 = jangan menunggu; kotak penuh = paket ini dilewatkan
}

void loop() {
  Kiriman k;
  while (xQueueReceive(kotakSurat, &k, 0) == pdTRUE) {  // ambil yang sudah ada saja, tidak menunggu
    // ... baru di sini boleh mencetak, menyusun JSON, dan menerbitkan ...
  }
}
```

**Mengapa tutorial di internet sering gagal dikompilasi?** Bentuk (*signature*) kedua *callback* itu berubah dua kali. Arduino IDE dengan paket esp32 3.3 hanya menerima bentuk terbaru:

| Paket esp32 | *Callback* terima | *Callback* kirim |
| :--- | :--- | :--- |
| 2.0.x (tutorial lama) | `(const uint8_t *mac, const uint8_t *data, int len)` | `(const uint8_t *mac, esp_now_send_status_t status)` |
| 3.0–3.2 | `(const esp_now_recv_info_t *info, const uint8_t *data, int len)` | masih `(const uint8_t *mac, esp_now_send_status_t status)` |
| **3.3** (modul ini) | `(const esp_now_recv_info_t *info, const uint8_t *data, int len)` | **`(const esp_now_send_info_t *info, esp_now_send_status_t status)`** |

Kode tutorial lama yang dikompilasi dengan paket 3.3 berhenti dengan pesan seperti ini (sudah diuji):

```text
error: invalid conversion from 'void (*)(const uint8_t*, esp_now_send_status_t)' {aka 'void (*)(const unsigned char*, esp_now_send_status_t)'} to 'esp_now_send_cb_t' {aka 'void (*)(const wifi_tx_info_t*, esp_now_send_status_t)'} [-fpermissive]
```

Obatnya: **ganti bentuk fungsinya** seperti baris terakhir tabel. Jangan menambalnya dengan menulis `esp_now_send_cb_t(...)` di depan nama fungsi (*cast*, pemaksaan tipe). Tambalan itu memang lolos kompilasi, tetapi alamat MAC yang dicetak menjadi angka acak karena isi parameter pertamanya bukan lagi alamat MAC. Kesalahan yang diam-diam lebih berbahaya daripada error yang jelas.

Satu peringatan kecil lagi: menaikkan variabel `volatile` dengan `++` membuat kompiler paket esp32 3.3 (yang memakai C++20) memperingatkan `'++' expression of 'volatile'-qualified type is deprecated`. Karena itu, firmware Node 1 menulis `jumlahDibuangPetugas = jumlahDibuangPetugas + 1;`.

### 7. Node 1 sebagai jembatan: cap waktu, rak tunggu, dan status Node 2

Node 1 v1.3.0 mendapat satu modul baru, `jembatan.cpp`. Tugasnya: menerima paket Node 2, lalu menerbitkannya ke broker **atas nama Node 2**, sesuai kontrak data. Jalannya seperti ini:

1. ***Callback* terima** membuang paket siaran, lalu menyalin paket berukuran tepat 33 byte, alamat pengirim, kekuatan sinyal, dan waktu tibanya (`millis()`) ke kotak surat (Konsep 6).
2. **`loop()` memeriksa** paket itu: harus dari alamat `MAC_NODE2` di `konfigurasi.h`, bertanda `0x52`, dan berversi formulir `1`. Paket ganda dibuang, paket hilang dihitung (Konsep 8).
3. Paket sah disimpan di **rak tunggu**: tempat di RAM yang muat sampai **96 bacaan** (8 jam pada jadwal 5 menit, sekitar 4 KB).
4. Selama WiFi dan broker tersambung serta jam Node 1 sudah disetel, Node 1 menerbitkan **paling banyak tiga bacaan tertua per putaran `loop()`**, sebagai JSON ke `rpm/<device_id Node 2>/telemetry`. `loop()` tetap lincah, dan *watchdog* tidak terganggu.

**Siapa membuat `ts`?** Kontrak data Modul 11 berkata: `ts` dibuat perangkat, bukan server, supaya data susulan tercatat pada waktu kejadiannya. Node 2 tidak punya jam yang bisa dipercaya: ia tidak pernah tersambung ke internet untuk NTP, dan jam di dalam chip-nya melenceng selama tidur. Jadi, **Node 1 yang membuat `ts` Node 2**, dari waktu paket itu **tiba**:

```text
ts = jam Node 1 sekarang − (millis() sekarang − millis() saat paket tiba)
```

Kalau broker bisa dijangkau, selisih itu hanya beberapa milidetik. Kalau router mati 30 menit, bacaan menunggu di rak, dan saat akhirnya diterbitkan, `ts`-nya **dimundurkan** sebanyak umur bacaan itu. Bacaan pukul 10.05 tetap bercap 10.05 walaupun baru terbit setelah router hidup lagi pukul 10.36, seperti di gambar berikut. Inilah perubahan aturan 1 di **kontrak data versi 1.1**.

![Diagram jembatan Node 1 dan rak tunggu, tiga panel bersebelahan. Panel 1, router hidup: paket Node 2 tiba pukul 10.00, masuk rak tunggu, dan langsung terbit dengan ts 10.00. Panel 2, router mati 10.05 sampai 10.35: paket tetap tiba lewat ESP-NOW pukul 10.05, 10.10, sampai 10.35, dan menumpuk di rak tunggu, isi 7 dari 96; broker tak terjangkau. Panel 3, router hidup lagi pukul 10.36: Node 1 tersambung lagi, lalu menerbitkan isi rak dari yang tertua, paling banyak 3 per putaran loop, masing-masing dengan ts mundur sesuai waktu tibanya, 10.05, 10.10, dan seterusnya; grafik Node-RED yang memakai ts menampilkan titik-titik itu di jam kejadiannya. Catatan bawah: ts = jam Node 1 sekarang dikurangi (millis() sekarang dikurangi millis() saat paket tiba); rak tunggu ada di RAM, jadi isinya hilang kalau Node 1 restart; rak penuh, 96 bacaan, berarti bacaan tertua tergusur.](aset/jembatan-rak-tunggu.png)

Karena itu, **grafik Kebun di Node-RED harus memakai `ts` sebagai sumbu waktu**, bukan waktu pesan tiba. Gambar di bawah adalah tangkapan layar dari lab penulis: Node 2 tiruan menerbitkan riwayat 24 jam sekaligus, seperti data susulan setelah router hidup lagi. Riwayatnya sengaja dibuat lebih panjang daripada isi rak tunggu (hanya 96 bacaan atau 8 jam) supaya bedanya jelas.

![Dua tangkapan layar grafik Dashboard 2 selebar layar HP, berdampingan, dengan judul dan keterangan; subjudulnya: riwayat 24 jam Node 2 tiruan diterbitkan sekaligus, sengaja lebih panjang daripada isi rak tunggu. Kiri, bertanda centang hijau: sumbu X = ts (waktu bacaan), isian X bertipe key: dan berisi waktu; garis biru suhu udara dan garis merah suhu tanah tersebar sepanjang 24 jam dengan label sumbu 18 (tengah malam), 04:00, 08:00, 12:00, 16:00, 20:00; suhu udara sekitar 20 derajat menjelang subuh dan sekitar 30 derajat sore hari, suhu tanah berubah lebih pelan. Kanan, bertanda silang merah: sumbu X = waktu pesan tiba, isian X bertipe timestamp (bawaan); bentuk garisnya sama, tetapi label sumbunya 21:36:51, 21:36:52, 21:36:53, jadi riwayat 24 jam itu menumpuk dalam sekitar 2 detik saat pesan tiba. Label sumbu kedua grafik dibingkai: hijau di kiri, merah di kanan. Keterangan bawah: data susulan harus digambar menurut ts (waktu bacaan), bukan menurut waktu pesan tiba.](aset/grafik-ts-vs-tiba.png)

*Tangkapan layar asli FlowFuse Dashboard 1.33.0 (lisensi Apache 2.0) dari browser laptop penulis yang dipersempit selebar layar HP, dengan data dari Node 2 tiruan; judul, tanda, dan keterangan oleh penulis.*

**Status Node 2.** Node 1 punya surat wasiat MQTT (Modul 11), tetapi Node 2 tidak pernah tersambung ke broker, jadi tidak punya wasiat sendiri. Statusnya disimpulkan Node 1 dan diterbitkan *retained* di `rpm/<device_id Node 2>/status`:

- `online` begitu paket sah pertama dari Node 2 tiba;
- `offline` kalau tidak ada paket selama **tiga kali jadwal bangun Node 2 ditambah satu menit**. Pada jadwal 5 menit, batasnya 16 menit, jadi satu paket yang hilang tidak membuat Node 2 dianggap mati. Jadwalnya dibaca dari paket (`jedaDetik`), jadi batas ini ikut menyesuaikan saat jadwal uji diubah.

Dengan kata lain, status Node 2 sebenarnya berarti **"Node 1 masih mendengar Node 2"**. Kalau Node 1 sendiri `offline`, status Node 2 tidak lagi bisa dipercaya. Karena itu, kartu Kebun di dashboard menampilkan status Node 2, dan kartu Sensor tetap menampilkan status Node 1.

**Kontrak data 1.1** hanya menambah, tidak mengubah data Node 1:

| Bagian | Perubahan di kontrak 1.1 |
| :--- | :--- |
| Kolom `telemetry` | baru: `tekanan` (hPa), `suhu_tanah` (°C), dan `baterai` (volt, pilihan); `suhu`, `kelembapan`, dan `tanah` dipakai ulang dengan arti yang sama |
| Kolom menurut perangkat | setiap perangkat hanya menulis kolom sensor yang ia punya: Node 1 tidak pernah menulis `tekanan`, Node 2 tidak pernah menulis `cahaya` |
| `ts` Node 2 | dibuat Node 1 saat paket diterima (aturan 1) |
| `status` Node 2 | diterbitkan Node 1: `online` saat paket pertama, `offline` setelah 3 × jadwal + 1 menit |
| `tanah` Node 2 | boleh `null` kalau angka mentahnya mustahil (sensor lepas) |
| Siapa menulis ke topik Node 2 | Node 1, sebagai pengecualian aturan 6 (dicatat di daftar izin broker Modul 21) |

Contoh pesan Node 2 yang diterbitkan Node 1 (menurut kontrak 1.1):

```json
{"ts":"2026-10-25T01:30:12Z","fw":"1.0.0","suhu":29.4,"kelembapan":78,"tekanan":1008.6,"suhu_tanah":27.3,"tanah":41}
```

Perhatikan `fw`: isinya versi firmware **Node 2** yang dibawa paket, bukan versi Node 1. Satu hal lagi perlu diakui dengan jujur: rak tunggu ada di **RAM**. Kalau Node 1 *restart* saat router mati, isi raknya hilang, dan channel router yang diingatnya (juga di RAM) ikut hilang. Akibatnya, Node 1 baru mendengar Node 2 lagi setelah router hidup. Kalau Node 1 baru menyala saat internet mati, jamnya belum disetel, dan bacaan Node 2 menunggu di rak sampai NTP berhasil.

> ➡️ **Saatnya praktik!** Konsep 6–7 cukup untuk [Praktik 3 — Node 1 v1.3.0](#praktik-3--node-1-v130-jembatan-esp-now-ke-mqtt-40-menit), [Praktik 4 — Node 2 v1.0.0](#praktik-4--node-2-v100-bangun-kirim-tidur-40-menit), dan [Praktik 5 — Kartu Kebun di Node-RED](#praktik-5--kartu-kebun-di-node-red-30-menit). Setelah itu, kembali ke Konsep 8.

### 8. Keandalan: ACK, coba ulang, dan menghitung paket hilang

ESP-NOW tidak menjanjikan setiap paket sampai. Paket bisa hilang karena jarak, tembok, gangguan dari perangkat lain, atau karena radio Node 1 sedang memindai channel lain. Node 2 v1.0.0 menghadapinya dengan tiga cara.

**1. Coba ulang dengan jeda yang dipilih.** Setiap kali bangun, Node 2 mencoba mengirim paling banyak tiga kali: percobaan pertama, percobaan kedua 100 ms kemudian, dan percobaan ketiga 2,5 detik setelah itu. Mengapa jeda terakhir panjang? Saat router mati, Node 1 mencoba menyambung lagi setiap 60 detik, dan setiap percobaan memindai semua channel selama sekitar 2,4 detik (Konsep 3). Kalau Node 2 kebetulan mengirim di dalam jendela 2,4 detik itu, percobaan ketiga biasanya jatuh setelah pemindaiannya selesai. Biasanya, tidak selalu: kalau radio Node 1 baru dikembalikan ke channel router beberapa detik sesudah pemindaian (Praktik 3.4), ketiga percobaan bisa gagal semua. Paket itu tercatat `hilang`, dan syarat 90 % di uji Praktik 6 memberi ruang untuk itu. Jeda panjang itu pun jarang memakan baterai: Node 2 hanya menunggunya kalau dua percobaan pertama gagal.

**2. Nomor urut dan nomor sesi.** Setiap paket membawa:

- **`urutan`**: naik satu setiap kali Node 2 bangun, disimpan di memori RTC, dan **tidak** berubah saat percobaan ulang dalam satu kali bangun;
- **`sesi`**: angka acak yang dibuat baru setiap kali Node 2 menyala dari **mati**, misalnya setelah baterai dicabut atau tombol EN ditekan. Memori RTC kosong lagi setelah kejadian seperti itu (Modul 9), dan `urutan` mulai lagi dari 1.

Dengan dua angka itu, Node 1 bisa membedakan empat keadaan:

| Yang tiba di Node 1 | Artinya | Tindakan Node 1 |
| :--- | :--- | :--- |
| sesi sama, `urutan` = terakhir + 1 | paket berikutnya, normal | diterima |
| sesi sama, `urutan` ≤ terakhir | **dobel**: ACK sempat hilang, lalu Node 2 mengirim ulang paket yang sebenarnya sudah diterima | dibuang, dihitung `dobel` |
| sesi sama, `urutan` melompat, misalnya dari 41 ke 44 | dua paket (42 dan 43) **hilang** | diterima; `hilang` bertambah 2 |
| sesi berbeda | Node 2 menyala ulang | hitungan urutan dimulai lagi |

Dokumen ESP-NOW dari Espressif sendiri menyarankan nomor urut seperti ini untuk membuang data ganda. Perintah `node2` di Serial Monitor Node 1 menampilkan semua hitungannya, termasuk **persen paket tiba** = diterima ÷ (diterima + hilang).

**3. Mencari channel lagi setelah dua kali gagal.** Cara ini sudah dibahas di Konsep 3.

**Uji "matikan router" yang jujur.** Silabus meminta: saat router dimatikan, paling sedikit 90 % paket Node 2 tetap tiba, dan datanya muncul lagi di Pi saat router hidup. Di Praktik 6, uji ini diukur dari **nomor urut**, bukan dari perasaan. Ada satu hal yang harus dihitung dulu: kalau Node 2 bangun setiap 5 menit, selama router mati 30 menit, Node 2 hanya mengirim **6 paket**. Satu paket hilang saja membuat angkanya turun ke 83 %: gagal. Karena itu, selama uji, jadwal Node 2 diubah sementara menjadi **60 detik**: sekitar 30 paket dalam 30 menit, dan syarat 90 % berarti paling banyak 3 paket boleh hilang. Karena ESP-NOW tidak butuh router, paket Node 2 harus **tiba di Node 1** tepat pada jadwalnya walaupun router mati. Yang tertunda hanya perjalanan dari Node 1 ke Pi, dan itu memang tugas rak tunggu (Konsep 7).

> ➡️ **Saatnya praktik!** Konsep 8 cukup untuk [Praktik 6 — Uji matikan router](#praktik-6--uji-matikan-router-70-menit). Setelah itu, kembali ke Konsep 9.

### 9. Umur baterai: yang menentukan adalah saat tidur

Di Modul 9 kamu sudah punya rumus umur baterai. Minggu ini rumus itu dipakai dengan beban sungguhan Node 2. Satu siklus Node 2 berlangsung 5 menit (300 detik):

- **bangun**: kurang dari satu detik, termasuk waktu papan menyala sebelum `setup()` berjalan. Arusnya sekitar 50 mA saat membaca sensor dan lebih dari 100 mA selama radio menyala (di sisi 5 V). Muatannya sekitar **50–90 mA·detik**;
- **tidur**: sekitar 299,5 detik dengan arus tidur papan DevKit V1 sekitar 4,9 mA (contoh ukur Modul 9). Muatannya sekitar **1.470 mA·detik**.

Jadi, sekitar **95 %** muatan baterai habis selama Node 2 **tidur**. Memperpendek waktu bangun memang membantu, tetapi sedikit. Yang paling menentukan adalah **apa yang tetap menyala selama tidur**.

![Diagram umur baterai Node 2. Atas, satu siklus 300 detik digambar sebagai batang muatan: bagian bangun sekitar 50 sampai 90 mA kali detik, tipis, dan bagian tidur sekitar 1.470 mA kali detik, hampir seluruh batang; tulisan: sekitar 95 persen muatan terpakai saat tidur. Bawah, perkiraan umur baterai 18650 asli 2.500 mAh untuk enam keadaan, sebagai batang mendatar: desain modul ini, sensor tanah dari D32, BME280 forced, DS18B20 10 bit, sekitar 10 hari; sensor tanah di 3V3, sekitar 5 hari; BME280 dibiarkan mode normal, sekitar 9,4 hari; memindai channel setiap bangun, sekitar 8,9 hari; ketiga kesalahan sekaligus, sekitar 4,6 hari; bangun setiap 30 menit, bukan 5 menit, hanya sekitar 10,6 hari. Garis putus-putus merah di 3 hari: syarat lulus silabus. Catatan: angka adalah perkiraan dengan arus tidur papan 4,9 mA dan faktor 1,6 dari Modul 9; ukur sendiri di Praktik 7.](aset/umur-baterai-node2.png)

Perkiraan untuk baterai 18650 asli **2.500 mAh** (2.000 mAh terpakai, aturan 80 % Modul 9), dengan faktor 1,6 dari Modul 9 untuk MT3608 dan arus tidur papan 4,9 mA:

| Keadaan | Rata-rata sisi 5 V | Sisi baterai (× 1,6) | Perkiraan umur |
| :--- | :---: | :---: | :---: |
| **Desain modul ini** (tanah dari D32, BME280 *forced*, DS18B20 10 bit) | 5,06 mA | 8,1 mA | **sekitar 10 hari** |
| Sensor tanah disambung ke 3V3 | 10,05 mA | 16,1 mA | sekitar 5 hari |
| BME280 dibiarkan mode *normal* | 5,52 mA | 8,8 mA | sekitar 9,4 hari |
| Memindai channel setiap bangun | 5,85 mA | 9,4 mA | sekitar 8,9 hari |
| Ketiga kesalahan itu sekaligus | 11,26 mA | 18,0 mA | sekitar 4,6 hari |
| Desain modul ini, tetapi bangun setiap **30 menit** | 4,93 mA | 7,9 mA | sekitar 10,6 hari |
| Desain modul ini dengan baterai palsu "9.900 mAh" (aslinya sekitar 1.000 mAh) | 5,06 mA | 8,1 mA | sekitar 4 hari |

Tiga pelajaran dari tabel itu:

1. **Satu kabel bisa memotong umur baterai menjadi separuh.** Sensor tanah di 3V3 menyedot 5 mA terus-menerus, sama besarnya dengan arus tidur seluruh papan.
2. **Bangun lebih jarang hampir tidak menolong** di DevKit V1: dari 5 menit ke 30 menit, umurnya hanya naik dari sekitar 10 menjadi sekitar 10,6 hari karena arus tidur papan tetap sama. Untuk umur berbulan-bulan dibutuhkan papan yang memang dirancang hemat daya (Modul 9 🔬).
3. **Syarat lulus "bertahan ≥ 3 hari" punya cadangan besar.** Tiga hari dari 2.000 mAh terpakai berarti arus rata-rata di sisi baterai boleh sampai sekitar 28 mA, sedangkan desain ini sekitar 8 mA. Node 2 baru gagal kalau baterainya palsu **dan** ada kesalahan desain sekaligus.

Angka-angka itu perkiraan. Di Praktik 7 kamu mengukur arus Node 2-mu sendiri dengan INA219 dan menghitung ulang.

> ➡️ **Saatnya praktik!** Konsep 9 cukup untuk [Praktik 7 — Ukur arus dan hitung umur baterai](#praktik-7--ukur-arus-dan-hitung-umur-baterai-50-menit). Setelah itu, kembali ke Konsep 10.

### 10. Keamanan: enkripsi ESP-NOW dan rahasia yang tidak disiarkan

Tanpa enkripsi, paket ESP-NOW bisa didengar ESP32 mana pun di sekitar rumahmu selama ESP32 itu berada di channel yang sama. Isinya hanya data kebun, jadi bukan rahasia besar. Masalah yang lebih nyata: **siapa pun bisa mengirim paket palsu**. Node 1 memang hanya menerima paket dari alamat `MAC_NODE2`, tetapi alamat MAC bisa dipalsukan. Tanpa kunci, Node 1 tidak bisa membedakan Node 2 asli dari peniru.

**Enkripsi ESP-NOW** memakai dua kunci yang masing-masing **tepat 16 byte** (16 huruf atau angka):

- **PMK** (*Primary Master Key*, kunci induk): sama untuk semua perangkat ESP-NOW-mu. Kunci ini dipakai untuk mengamankan LMK.
- **LMK** (*Local Master Key*, kunci pasangan): sama di kedua ujung satu pasangan, di sini Node 1 dan Node 2. Kunci inilah yang mengunci isi setiap paket.

Paket yang dikunci tidak bisa dibaca tanpa kunci, dan paket yang diubah di tengah jalan ditolak penerima. Ada beberapa aturannya:

- **Hanya paket *unicast* yang bisa dienkripsi.** Paket siaran (`FF:FF:FF:FF:FF:FF`) selalu terbuka dan tetap sampai ke *callback* terima walaupun enkripsi dipasang. Karena itu, Node 1 membuang semua paket siaran: tanpa saringan ini, peniru cukup menyiarkan paket dengan alamat pengirim Node 2.
- **Penerima harus mendaftarkan pengirim sebagai pasangan berkunci** dengan LMK yang sama. Karena itu, Node 1 harus tahu alamat MAC Node 2, dan memang sudah tahu (`MAC_NODE2`).
- **Kunci berbeda satu huruf saja, paketnya hilang tanpa pesan error yang jelas.** Node 1 tidak menyebut kunci sama sekali; ia hanya berhenti menerima, lalu beberapa menit kemudian menyatakan Node 2 `offline`. Itu sebabnya enkripsi dipasang **paling akhir** (Praktik 8), setelah jalur tanpa enkripsi terbukti berjalan, supaya kamu punya pembanding.
- Paket esp32 3.3.12 membolehkan sampai dua puluh pasangan ESP-NOW, tujuh di antaranya berkunci. Jumlah itu lebih dari cukup untuk Rumah Pintar Mini.

**Di mana kuncinya disimpan?** Di file **`kunci.h`**, yang **tidak** ikut ke GitHub karena namanya ditulis di `.gitignore`, persis seperti `secrets.h` di Modul 10. Repositori hanya menyimpan contohnya, `kunci.contoh.h`. Selama `kunci.h` belum ada, firmware Node 1 dan Node 2 tetap bisa dikompilasi dan berjalan **tanpa** enkripsi. Kalau panjang kuncimu bukan 16 huruf atau angka, Arduino IDE menolak mengompilasi dengan pesan `KUNCI_PMK di kunci.h harus tepat 16 huruf/angka` (pemeriksaan `static_assert`, Konsep 5).

**"Jangan menyiarkan kredensial."** Kredensial (*credential*) adalah apa pun yang membuka akses: kata sandi WiFi, kata sandi MQTT, atau kunci. Aturannya sederhana:

1. Node 2 **tidak butuh** kata sandi WiFi sama sekali. Ia hanya perlu **nama** WiFi untuk mencari channel. Kata sandi WiFi hanya ada di Node 1, tersimpan di NVS lewat portal (Modul 10). Nama WiFi sendiri bukan kredensial karena router menyiarkannya ke semua HP di sekitar rumah, jadi `NAMA_WIFI` di `node-2-kebun.ino` boleh ikut ke GitHub; di Modul 10, nama WiFi disimpan di `secrets.h` hanya karena selalu berpasangan dengan kata sandinya. Ingat saja bahwa repositorimu terbuka untuk umum: kalau nama WiFi-mu memuat nama lengkap atau alamat rumah, siapa pun bisa membacanya di GitHub.
2. Kata sandi WiFi atau MQTT **tidak pernah** dikirim lewat ESP-NOW, apalagi lewat siaran yang tidak bisa dikunci dan bisa ditangkap ESP32 mana pun di sekitar rumah.
3. Kunci ESP-NOW hanya ada di `kunci.h` di laptopmu dan di dalam kedua papan, tidak di GitHub, tidak di catatan modul, dan tidak di tangkapan layar yang kamu bagikan.

> ➡️ **Saatnya praktik!** Konsep 10 cukup untuk [Praktik 8 — Enkripsi ESP-NOW](#praktik-8--enkripsi-esp-now-30-menit).

---

## 🔧 Praktik langkah demi langkah

Delapan praktik, **berurutan**. Praktik bertanda ⭐ di kotak 🖥️-nya adalah bagian dari syarat lulus.

> [!IMPORTANT]
> **Papan Node 1 minggu ini berganti program beberapa kali.** Dari Kemenangan Cepat sampai Praktik 2, papan Node 1 menjalankan sketsa latihan (Praktik 2 tidak mengunggah apa pun ke Node 1). Praktik 3 mengunggah **Node 1 v1.3.0**, firmware yang dipakai seterusnya. Praktik 7 meminjam papan Node 1 sebentar untuk sketsa ukur arus, lalu v1.3.0 diunggah lagi. Selama papan Node 1 menjalankan sketsa lain, dashboard menulis Node 1 `offline`; itu wajar. Nama dan kata sandi WiFi yang tersimpan di papan Node 1 tidak hilang selama **Erase All Flash Before Sketch Upload** tetap **Disabled**.

### Praktik 1 — Channel router dan memindai nama WiFi (40 menit)

> 🖥️ **Alat:** **Arduino IDE** dengan dua jendela, papan Node 1 dan papan Node 2 yang tercolok ke laptop, dan `catatan-modul14.md`. Konsep yang dipakai: 1–3.
>
> 🖥️ **Jalur Wokwi:** langkah 1.3 bisa dicoba di Wokwi dengan `NAMA_WIFI` diisi `"Wokwi-GUEST"`, nama WiFi simulasi Wokwi. Hasilnya ada di bawah langkah 1.3. Ingat dua keterbatasan Wokwi: laporan `terkirim, ada ACK` di sana palsu (tidak ada penerima), dan tidur dalam di Wokwi berakhir dengan *restart* sehingga memori RTC selalu kosong.

#### 1.1 Papan Node 1 tersambung ke WiFi rumah

1. Di jendela Arduino IDE papan Node 1, buka **File → New Sketch**, hapus isinya, lalu tempel kode ini. Simpan sebagai `modul14_penerima_rumah` di folder `modul-14`.

   ```cpp
   // Modul 14 - Praktik 1, papan PENERIMA (papan Node 1): tersambung ke WiFi rumah seperti Node 1,
   // sambil tetap mendengarkan paket ESP-NOW. Channel radionya sekarang DITENTUKAN ROUTER.
   // Tidak ada kata sandi di sketsa ini: WiFi.begin() tanpa isi memakai WiFi yang tersimpan di papan
   // sejak portal WiFi Modul 10 (Node 1 menyimpannya di NVS).
   // Butuh paket esp32 versi 3.3.7 atau lebih baru (modul ini memakai 3.3.12).

   #include <WiFi.h>
   #include <esp_now.h>
   #include <esp_mac.h>

   struct Kiriman {
     uint8_t mac[6];
     int8_t rssi;
     uint8_t kanal;  // channel tempat paket ini diterima
     int panjang;
     char isi[64];
   };

   QueueHandle_t kotakSurat;
   unsigned long jumlahPaket = 0;

   void saatDiterima(const esp_now_recv_info_t *info, const uint8_t *data, int panjang) {
     Kiriman k;
     memcpy(k.mac, info->src_addr, 6);
     k.rssi = info->rx_ctrl->rssi;
     k.kanal = info->rx_ctrl->channel;
     k.panjang = panjang;
     int salin = panjang < 63 ? panjang : 63;
     memcpy(k.isi, data, salin);
     k.isi[salin] = '\0';
     xQueueSend(kotakSurat, &k, 0);
   }

   void setup() {
     Serial.begin(115200);
     delay(1000);
     kotakSurat = xQueueCreate(8, sizeof(Kiriman));
     WiFi.setSleep(false);  // radio selalu mendengar (bukan modem sleep); dipasang SEBELUM WiFi.mode()
     WiFi.mode(WIFI_STA);

     uint8_t mac[6];
     esp_read_mac(mac, ESP_MAC_WIFI_STA);
     Serial.println();
     Serial.printf("MAC papan ini: %02X:%02X:%02X:%02X:%02X:%02X\n", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);

     WiFi.begin();  // tanpa nama dan kata sandi: pakai WiFi yang tersimpan di papan ini
     Serial.print("Menyambung ke WiFi rumah yang tersimpan");
     unsigned long mulai = millis();
     while (WiFi.status() != WL_CONNECTED && millis() - mulai < 20000) {
       delay(500);
       Serial.print(".");
     }
     Serial.println();
     if (WiFi.status() == WL_CONNECTED) {
       Serial.printf("Tersambung ke \"%s\". Router memakai channel %d.\n", WiFi.SSID().c_str(), WiFi.channel());
     } else {
       Serial.println("Belum tersambung. Belum ada WiFi tersimpan? Unggah lagi Node 1 v1.2.1, isi portal WiFi");
       Serial.println("(Modul 10), lalu unggah sketsa ini lagi. Sementara itu radio tetap di channel 1.");
     }

     if (esp_now_init() != ESP_OK) {
       Serial.println("ESP-NOW gagal dimulai. Tekan tombol EN untuk mencoba lagi.");
       return;
     }
     esp_now_register_recv_cb(saatDiterima);
     Serial.printf("Menunggu paket ESP-NOW di channel %d...\n", WiFi.channel());
   }

   void loop() {
     Kiriman k;
     while (xQueueReceive(kotakSurat, &k, 0) == pdTRUE) {
       jumlahPaket++;
       Serial.printf("Paket ke-%lu dari %02X:%02X:%02X:%02X:%02X:%02X di channel %u, sinyal %d dBm: \"%s\"\n", jumlahPaket,
                     k.mac[0], k.mac[1], k.mac[2], k.mac[3], k.mac[4], k.mac[5], k.kanal, k.rssi, k.isi);
     }
   }
   ```

2. Di jendela baru ini, pilih **DOIT ESP32 DEVKIT V1** dan port papan **Node 1** (jendela baru belum tentu mengingat pilihan jendela lain), klik **Upload**, lalu buka Serial Monitor-nya. Kalau baris `MAC papan ini` terlewat, tekan **EN** di papan Node 1. Jendela `modul14_penerima` dari Kemenangan Cepat boleh ditutup supaya Serial Monitor Node 1 tidak tertukar.

   **Hasilnya** (contoh; nama WiFi dan channel-mu bisa berbeda):

   ```text
   MAC papan ini: A4:CF:12:E5:B7:C0
   Menyambung ke WiFi rumah yang tersimpan....
   Tersambung ke "RumahKita". Router memakai channel 6.
   Menunggu paket ESP-NOW di channel 6...
   ```

3. Tulis nomor channel itu di `catatan-modul14.md`. Kalau yang muncul `Belum tersambung…`, ikuti petunjuk di layar: papan Node 1 belum menyimpan nama dan kata sandi WiFi (misalnya setelah perintah `wifi lupa`).

#### 1.2 Pengirim Kemenangan Cepat sekarang gagal

Lihat Serial Monitor **Node 2**, yang masih menjalankan `modul14_pengirim` dari Kemenangan Cepat. Begitu papan Node 1 pindah ke channel router, laporannya berubah (contoh):

```text
#58 GAGAL: tidak ada ACK (penerima mati, terlalu jauh, atau beda channel).
#59 GAGAL: tidak ada ACK (penerima mati, terlalu jauh, atau beda channel).
```

Papan Node 2 masih mengirim di channel 1, sedangkan papan Node 1 kini mendengar di channel 6. Kebetulan routermu memang di channel 1? Kiriman tetap berhasil; lanjutkan saja, tetapi bayangkan apa yang terjadi kalau suatu hari router pindah channel.

#### 1.3 Node 2 mencari channel sendiri

1. Di jendela papan Node 2, buka **File → New Sketch**, hapus isinya, tempel kode ini, lalu simpan sebagai `modul14_cari_kanal` di folder `modul-14`.

   ```cpp
   // Modul 14 - Praktik 1, papan PENGIRIM (papan Node 2): mencari channel router dengan memindai NAMA WiFi rumah,
   // menyimpannya di memori RTC, lalu bangun-kirim-tidur setiap 10 detik.
   // Node 2 TIDAK butuh kata sandi WiFi: cukup nama WiFi, hanya untuk tahu channel mana yang dipakai router (dan Node 1).
   // Butuh paket esp32 versi 3.3.7 atau lebih baru (modul ini memakai 3.3.12).

   #include <WiFi.h>
   #include <esp_now.h>

   // GANTI dua baris ini:
   const uint8_t MAC_PENERIMA[6] = {0xA4, 0xCF, 0x12, 0xE5, 0xB7, 0xC0};  // MAC papan Node 1
   const char NAMA_WIFI[] = "NamaWiFiRumahmu";                              // nama (SSID) WiFi rumah, persis

   const int GAGAL_SEBELUM_PINDAI = 2;  // setelah 2 kali bangun gagal berturut-turut, cari channel lagi
   const uint64_t TIDUR_DETIK = 10;     // pendek supaya cepat terlihat; Node 2 sungguhan 300 detik

   // Ingatan RTC: selamat dari deep sleep, hilang kalau papan dicabut atau tombol EN ditekan (Modul 9).
   RTC_DATA_ATTR uint8_t kanal = 0;  // 0 = belum tahu
   RTC_DATA_ATTR uint8_t gagalBeruntun = 0;
   RTC_DATA_ATTR uint32_t nomor = 0;

   volatile bool kirimSelesai = false;
   volatile bool adaAck = false;

   void saatTerkirim(const esp_now_send_info_t *info, esp_now_send_status_t status) {
     adaAck = (status == ESP_NOW_SEND_SUCCESS);
     kirimSelesai = true;
   }

   // Memindai satu nama WiFi saja. Hasilnya channel router itu, atau 0 kalau tidak ditemukan.
   uint8_t cariKanal() {
     unsigned long mulai = millis();
     int jumlah = WiFi.scanNetworks(false, false, false, 120, 0, NAMA_WIFI);
     uint8_t hasil = 0;
     for (int i = 0; i < jumlah; i++) {
       if (WiFi.SSID(i) == NAMA_WIFI) {
         hasil = WiFi.channel(i);
         break;
       }
     }
     WiFi.scanDelete();
     if (hasil != 0) {
       Serial.printf("Memindai \"%s\": ketemu di channel %u (%lu ms).\n", NAMA_WIFI, hasil, millis() - mulai);
     } else {
       Serial.printf("Memindai \"%s\": tidak ditemukan (%lu ms).\n", NAMA_WIFI, millis() - mulai);
     }
     return hasil;
   }

   bool kirimSapaan() {
     if (WiFi.setChannel(kanal) != ESP_OK) {
       Serial.printf("Channel %u ditolak ESP32. Router di channel 12 atau 13? Ubah router ke 1, 6, atau 11.\n", kanal);
       return false;
     }
     if (esp_now_init() != ESP_OK) {
       return false;
     }
     esp_now_register_send_cb(saatTerkirim);
     esp_now_peer_info_t peer = {};
     memcpy(peer.peer_addr, MAC_PENERIMA, 6);
     peer.channel = 0;  // 0 = channel radio saat ini (yang baru saja dipasang)
     peer.ifidx = WIFI_IF_STA;
     peer.encrypt = false;
     if (esp_now_add_peer(&peer) != ESP_OK) {
       return false;
     }
     char isi[32];
     snprintf(isi, sizeof(isi), "halo dari kebun #%lu", (unsigned long)nomor);
     kirimSelesai = false;
     if (esp_now_send(MAC_PENERIMA, (const uint8_t *)isi, strlen(isi) + 1) != ESP_OK) {
       return false;
     }
     unsigned long mulai = millis();
     while (!kirimSelesai && millis() - mulai < 200) {  // jangan menunggu selamanya: Node 2 harus tetap bisa tidur
       delay(1);
     }
     return kirimSelesai && adaAck;
   }

   void setup() {
     Serial.begin(115200);
     delay(200);
     nomor++;
     WiFi.persistent(false);  // setelan WiFi cukup di RAM: memori flash tidak ditulis setiap bangun
     WiFi.mode(WIFI_STA);     // radio menyala, TANPA WiFi.begin(): Node 2 tidak pernah tersambung ke router

     if (kanal == 0 || gagalBeruntun >= GAGAL_SEBELUM_PINDAI) {
       uint8_t baru = cariKanal();
       if (baru != 0) {
         kanal = baru;  // tidak ketemu (router mati)? Channel lama dipertahankan: Node 1 masih menunggu di sana
       }
       gagalBeruntun = 0;
     } else {
       Serial.printf("Channel %u diambil dari ingatan RTC, tanpa memindai.\n", kanal);
     }

     bool berhasil = (kanal != 0) && kirimSapaan();
     gagalBeruntun = berhasil ? 0 : gagalBeruntun + 1;
     Serial.printf("Bangun ke-%lu: %s di channel %u (gagal beruntun: %u). Bangun %lu ms, tidur %lu detik.\n",
                   (unsigned long)nomor, berhasil ? "terkirim, ada ACK" : "GAGAL", kanal, gagalBeruntun, millis(),
                   (unsigned long)TIDUR_DETIK);
     Serial.flush();

     esp_now_deinit();
     WiFi.mode(WIFI_OFF);  // matikan radio sebelum tidur
     esp_sleep_enable_timer_wakeup(TIDUR_DETIK * 1000000ULL);
     esp_deep_sleep_start();
   }

   void loop() {
     // Tidak pernah dijalankan: setiap bangun dari deep sleep, papan mulai lagi dari setup().
   }
   ```

2. Isi dua baris yang ditandai `GANTI`: `MAC_PENERIMA` dengan alamat MAC papan Node 1 dari Kemenangan Cepat, dan `NAMA_WIFI` dengan nama WiFi rumahmu, **persis** sampai huruf besar-kecilnya, seperti yang tampil di HP (Modul 10). Kata sandinya tidak perlu.
3. Di jendela baru ini, pilih **DOIT ESP32 DEVKIT V1** dan port papan **Node 2**, klik **Upload**, lalu buka Serial Monitor-nya. Jendela `modul14_pengirim` boleh ditutup sekarang. Di antara laporan, Serial Monitor juga menampilkan baris `ets …` dan `rst:0x5 (DEEPSLEEP_RESET)` setiap kali papan bangun; itu wajar (Modul 9).

   **Hasilnya** di Serial Monitor Node 2 (contoh):

   ```text
   Memindai "RumahKita": ketemu di channel 6 (2231 ms).
   Bangun ke-1: terkirim, ada ACK di channel 6 (gagal beruntun: 0). Bangun 2466 ms, tidur 10 detik.
   Channel 6 diambil dari ingatan RTC, tanpa memindai.
   Bangun ke-2: terkirim, ada ACK di channel 6 (gagal beruntun: 0). Bangun 232 ms, tidur 10 detik.
   ```

   Di Serial Monitor Node 1 (contoh):

   ```text
   Paket ke-1 dari 24:6F:28:B1:C7:D4 di channel 6, sinyal -44 dBm: "halo dari kebun #1"
   Paket ke-2 dari 24:6F:28:B1:C7:D4 di channel 6, sinyal -45 dBm: "halo dari kebun #2"
   ```

   Bandingkan lama bangun pertama dan kedua: memindai menghabiskan lebih dari dua detik dengan radio menyala, dan bangun berikutnya cukup sepersepuluhnya karena channel diambil dari ingatan RTC.

   **Jalur Wokwi** (`NAMA_WIFI` = `"Wokwi-GUEST"`, hasil sungguhan dari simulator, Oktober 2026):

   ```text
   Memindai "Wokwi-GUEST": ketemu di channel 6 (2223 ms).
   Bangun ke-1: terkirim, ada ACK di channel 6 (gagal beruntun: 0). Bangun 4005 ms, tidur 10 detik.
   ```

   Pemindaiannya sungguhan: `Wokwi-GUEST` memang berada di channel 6. Laporan `terkirim, ada ACK` itu palsu, dan setelah "tidur", Wokwi memulai ulang papan (`rst:0x8 (TG1WDT_SYS_RESET)`), jadi memori RTC selalu kosong dan setiap "bangun" memindai lagi. Baris `E (…) phy_init: … calibration data MAC check failed …` yang muncul setelah mulai ulang itu juga keanehan simulator; abaikan. Lanjutkan dengan membaca 1.4 dan 1.5.

#### 1.4 Gagal dua kali, lalu memindai lagi

1. Cabut kabel USB papan **Node 1**. Node 2 terus bangun setiap 10 detik (contoh):

   ```text
   Channel 6 diambil dari ingatan RTC, tanpa memindai.
   Bangun ke-7: GAGAL di channel 6 (gagal beruntun: 1). Bangun 434 ms, tidur 10 detik.
   Channel 6 diambil dari ingatan RTC, tanpa memindai.
   Bangun ke-8: GAGAL di channel 6 (gagal beruntun: 2). Bangun 433 ms, tidur 10 detik.
   Memindai "RumahKita": ketemu di channel 6 (2229 ms).
   Bangun ke-9: GAGAL di channel 6 (gagal beruntun: 1). Bangun 2662 ms, tidur 10 detik.
   ```

   Setelah dua kali bangun gagal, Node 2 memindai lagi untuk memastikan router tidak pindah channel. Router masih di channel 6, jadi channel-nya tetap.
2. Colokkan lagi papan Node 1. Begitu papan itu tersambung ke WiFi (beberapa detik), Node 2 kembali menulis `terkirim, ada ACK`.

#### 1.5 Kunci channel router (disarankan)

Router dengan channel **Auto** bisa pindah channel setiap kali dinyalakan ulang, dan router di channel 12 atau 13 tidak bisa dipakai Node 2 sama sekali (Konsep 3). Kalau router itu milikmu sendiri:

1. Buka halaman pengaturan router dari browser. Alamatnya biasanya tertulis di stiker di bawah router, misalnya `192.168.1.1`. Masuk dengan nama dan kata sandi admin router (milikmu, jangan ditulis di catatan modul).
2. Cari menu WiFi 2,4 GHz (namanya berbeda di setiap merek, misalnya **Wireless**, **WLAN**, atau **WiFi Settings**), lalu cari pilihan **Channel**.
3. Ganti **Auto** dengan **1**, **6**, atau **11**; paling mudah, pilih channel yang sekarang dipakai (dari langkah 1.1) kalau channel itu salah satu dari ketiganya. Simpan. Router biasanya memutus WiFi sebentar.
4. Tekan **EN** di papan Node 1, lalu pastikan Serial Monitor-nya menulis channel yang baru kamu pilih. Kalau channel-nya berubah, Node 2 akan menemukannya sendiri setelah dua kali bangun gagal (langkah 1.4).

**Tidak bisa membuka pengaturan router** (router milik penyedia internet, atau bukan milikmu)? Biarkan **Auto**. Akibatnya, setiap kali router dinyalakan ulang dan berpindah channel, Node 2 kehilangan sekitar dua paket sebelum mencari channel lagi. Hanya kalau router berada di channel **12 atau 13** dan tidak bisa diubah, Node 2 benar-benar tidak bisa dipakai di rumah itu. Mintalah bantuan pemilik router.

> ⬆️ **Selesai Praktik 1?** Kembali ke [Konsep 4](#4-bangun-sebentar-tidur-lama-urutan-bangun-node-2).

### Praktik 2 — Sensor Node 2 dan paket 33 byte (60 menit)

> 🖥️ **Alat:** **Arduino IDE** (jendela papan Node 2), papan Node 2 dengan breadboard mini Modul 9 (kabel VIN dan GND ke rangkaian baterai **dilepas**; kabel USB dicabut selama memasang kabel dan baru dicolokkan lagi di 2.7), BME280, DS18B20 dengan modul adaptornya, sensor tanah ke-2, segelas air, kabel jumper (jantan–betina 6, betina–betina 2, jantan–jantan 1; kabel DAT DS18B20 dari Modul 9 tetap dipakai), dan selotip bertuliskan **3V3**. Konsep yang dipakai: 4–5.
>
> 🖥️ **Jalur Wokwi:** buka proyek ESP32 baru di Wokwi. Di tab **`diagram.json`**, ganti seluruh isinya dengan isi [`kode/modul14_sensor_kebun/diagram.json`](kode/modul14_sensor_kebun/diagram.json) (buka filenya di GitHub, klik ikon **Copy raw file**, lalu tempel). Rangkaiannya: DS18B20 di D27 dan potensiometer sebagai sensor tanah, yang kaki VCC-nya disambung ke **D32**. Wokwi tidak punya BME280, jadi bacaannya akan tercetak `nan`. Lewati langkah 2.1–2.5 dan langkah kalibrasi dengan air; mulailah dari 2.6: tempel kodenya ke tab `sketch.ino`, buat file `paket-node2.h`, tambahkan ketiga library, lalu klik **▶** untuk menjalankan simulasi. Hasilnya ada di akhir 2.8.

#### 2.1 Siapkan papan Node 2

1. Cabut USB papan Node 2 dari laptop (kalau masih tercolok sejak Praktik 1), lalu pastikan kabel VIN dan GND-nya **tidak** tersambung ke breadboard mini (aturan aman 1). Semua kabel di 2.2–2.5 dipasang selagi papan Node 2 tanpa listrik, sesuai aturan keselamatan Modul 5: sebelum mengubah kabel apa pun, cabut listriknya. Rel atas tetap berisi 5,0 V selama baterai ada di dudukannya, jadi selama Praktik 2 jangan menancapkan apa pun ke rel atas. USB baru dicolokkan lagi di 2.7.
2. DS18B20 dari Modul 9 masih tersambung dengan kabel betina–betina langsung ke kaki 3V3, GND, dan D27 papan. Kaki 3V3 dan GND itu dibutuhkan rel bawah di langkah 2.2, padahal satu kaki hanya muat satu ujung betina. Jadi, cabut sekarang kabel **VCC** (oranye) dan **GND** (hitam) DS18B20, dari kaki papan maupun dari modul adaptornya, lalu sisihkan; langkah 2.4 menggantinya dengan kabel jantan–betina. Kabel **DAT** (ungu) tetap di D27.

Semua sambungan langkah 2.2–2.5 ada di gambar dan tabel di bawah. Gambar itu menunjukkan keadaan akhir Praktik 2, saat USB sudah dicolokkan lagi di 2.7; selama memasang kabel, USB tetap tercabut. Papan Node 2 tetap **tidak ditancapkan** ke breadboard, seperti di Modul 9. Dari breadboard mini, kita hanya memakai **rel bawah** sebagai jalur 3,3 V dan GND untuk sensor.

![Ilustrasi rangkaian Node 2 di breadboard mini setelah Praktik 2, dengan empat penanda bernomor. Separuh atas dan rel atas berisi rangkaian baterai Modul 9 yang dipudarkan: dudukan 18650, TP4056, MT3608, dan kapasitor; rel atas plus bertuliskan 5,0 V. Papan Node 2 berdiri di kanan breadboard, tidak ditancapkan, dengan USB tercolok ke laptop; tanda silang merah di kaki VIN dan GND deretan kiri berarti kabelnya ke rel atas dicabut. Bagian yang baru digambar terang. Penanda 1: rel bawah plus diberi stiker 3V3 dan disambung kabel oranye dari kaki 3V3 papan (deretan kanan, paling bawah) ke kolom 29; rel bawah minus disambung kabel hitam dari kaki GND di atasnya ke kolom 28; kedua kabel lewat kanan papan, turun, lalu masuk dari bawah. Penanda 2, BME280 di bawah breadboard: VIN kabel oranye ke rel bawah plus kolom 15, GND kabel hitam ke rel bawah minus kolom 16, serta SCL kabel kuning dan SDA kabel biru yang memutar lewat bawah dan sisi kanan ke kaki D22 dan D21, bersilangan sekali dekat papan. Penanda 3, modul adaptor DS18B20 paling kanan: VCC kabel oranye ke rel bawah plus kolom 24, GND kabel hitam ke rel bawah minus kolom 27, dan DAT kabel ungu ke kaki D27; ujung logamnya menggantung, nanti ditanam di tanah. Penanda 4, sensor tanah ke-2 di antara BME280 dan DS18B20: kabel VCC merah melintas di atas separuh bawah breadboard ke kaki D32, kabel AOUT hijau ke kaki VN, keduanya bersilangan sekali, dan GND hitam ke rel bawah minus kolom 21. Keterangan bawah, merah: rel atas plus 5,0 V, rel bawah plus 3,3 V, jangan tertukar; sensor tanah mendapat listrik dari D32, bukan dari 3V3. Di bawahnya, dua catatan abu-abu: kabel ungu, merah, dan hijau hanya melintas di atas breadboard, tidak ada yang ditancapkan ke lubangnya; warna kabel sensor tanah bisa berbeda, jadi ikuti tulisan di papan sensornya.](aset/rangkaian-node2.png)

| Langkah | Dari | Ke | Kabel |
| :---: | :--- | :--- | :--- |
| 2.2 | kaki **3V3** papan (deretan kanan, paling bawah) | rel bawah (+) kolom 29 | jantan–betina, oranye |
| 2.2 | kaki **GND** papan (deretan kanan, di atas 3V3) | rel bawah (−) kolom 28 | jantan–betina, hitam |
| 2.3 | BME280 **VIN** | rel bawah (+) kolom 15 | jantan–betina, oranye |
| 2.3 | BME280 **GND** | rel bawah (−) kolom 16 | jantan–betina, hitam |
| 2.3 | BME280 **SCL** | kaki **D22** papan | betina–betina, kuning |
| 2.3 | BME280 **SDA** | kaki **D21** papan | betina–betina, biru |
| 2.4 | adaptor DS18B20 **VCC** | rel bawah (+) kolom 24 | jantan–betina, oranye |
| 2.4 | adaptor DS18B20 **GND** | rel bawah (−) kolom 27 | jantan–betina, hitam |
| 2.4 | adaptor DS18B20 **DAT** | kaki **D27** papan (tetap) | betina–betina, ungu |
| 2.5 | sensor tanah **VCC** (ujung kabelnya) | kaki **D32** papan, langsung | — |
| 2.5 | sensor tanah **AOUT** (ujung kabelnya) | kaki **VN** papan, langsung | — |
| 2.5 | sensor tanah **GND** (ujung kabelnya) | rel bawah (−) kolom 21 | jantan–jantan, hitam |

#### 2.2 Rel bawah menjadi jalur 3,3 V

1. Tempel selotip bertuliskan **3V3** di dekat rel bawah (+). Rel atas (+) berisi 5,0 V dari MT3608; jangan sampai tertukar.
2. Sambungkan kaki **3V3** papan (di deretan kanan, paling bawah, dekat colokan USB) ke rel bawah (+) **kolom 29** dengan kabel jantan–betina oranye: ujung betina ke kaki papan, ujung jantan ke lubang rel.
3. Sambungkan kaki **GND** di sebelahnya (deretan kanan, tepat di atas 3V3) ke rel bawah (−) **kolom 28** dengan kabel jantan–betina hitam.

#### 2.3 BME280

Sambungkan keempat kaki BME280 menurut **tulisan di modulnya**, bukan menurut urutan di gambar, karena urutan kaki berbeda antarpabrik: **VIN** (kadang tertulis **VCC**) ke rel bawah (+) kolom 15, **GND** ke rel bawah (−) kolom 16, **SCL** langsung ke kaki **D22**, dan **SDA** langsung ke kaki **D21**. Kalau modulmu punya enam kaki, kaki **CSB** dan **SDO** dibiarkan kosong; alamatnya (`0x76` atau `0x77`) sudah ditentukan rangkaian di modul, dan sketsanya mencoba keduanya.

#### 2.4 DS18B20 pindah ke rel bawah

Kaki 3V3 papan sekarang memberi listrik ke rel bawah, jadi DS18B20 ikut mengambil listrik dari sana. Kabel **VCC** dan **GND** lamanya sudah dicabut di 2.1. Pasang dua kabel jantan–betina baru di modul adaptornya: **VCC** ke rel bawah (+) kolom 24, **GND** ke rel bawah (−) kolom 27. Kabel **DAT** tetap ke kaki **D27**.

#### 2.5 Sensor tanah ke-2: listrik dari D32

1. Pasang kabel bawaan sensor ke colokan tiga kakinya (kalau belum). Ikuti **tulisan di papan sensor** (GND, VCC, AOUT), bukan warna kabelnya, seperti Modul 6.
2. Colokkan ujung kabel dari kaki **VCC** langsung ke kaki **D32** papan, dan ujung kabel dari kaki **AOUT** langsung ke kaki **VN**.
3. Tancapkan satu jumper jantan–jantan hitam ke ujung kabel dari kaki **GND**, lalu tancapkan ujung lainnya ke rel bawah (−) **kolom 21**.

**Jangan** menyambung VCC sensor tanah ke 3V3 seperti di Node 1. Di Node 1 tidak masalah karena Node 1 berlistrik *charger*; di Node 2, sensor yang selalu menyala memotong umur baterai menjadi separuh (Konsep 4 dan 9).

#### 2.6 Sketsa sensor Node 2

1. Di jendela papan Node 2, buka **File → New Sketch**, hapus isinya, lalu tempel kode ini. Simpan sebagai `modul14_sensor_kebun` di folder `modul-14`.

   ```cpp
   // Modul 14 - Praktik 2: sensor Node 2 "Kebun" dibaca dengan urutan hemat daya, lalu dikemas menjadi paket 33 byte.
   // Belum ada radio dan belum tidur: setiap 5 detik satu "bangun pura-pura", hasilnya dicetak supaya bisa diperiksa.
   // Rangkaian (PETA-PIN versi 5): BME280 SDA -> D21, SCL -> D22; DS18B20 DAT -> D27; sensor tanah ke-2 AOUT -> VN (GPIO 39),
   // VCC -> D32 (BUKAN 3V3), GND -> GND. BME280 dan DS18B20 diberi 3,3 V dari rel bawah (+) breadboard mini.
   // Library: Adafruit BME280 Library 2.3.0 (ikut terpasang: Adafruit Unified Sensor 1.1.15, Adafruit BusIO 1.17.4),
   // OneWire 2.3.8, DallasTemperature 4.0.6.

   #include <Wire.h>
   #include <OneWire.h>
   #include <DallasTemperature.h>
   #include <Adafruit_BME280.h>
   #include "paket-node2.h"

   // ---------- Ganti dengan milikmu ----------
   const bool MODE_KALIBRASI = false;  // true = hanya cetak angka mentah sensor tanah ke-2 (langkah kalibrasi)
   const int TANAH_KERING = 3000;      // angka mentah di udara, diukur dengan daya dari D32
   const int TANAH_BASAH = 1300;       // angka mentah di dalam air

   // ---------- Tetap ----------
   const int PIN_SATU_KABEL = 27;           // DS18B20
   const int PIN_SDA = 21;                  // BME280
   const int PIN_SCL = 22;
   const int PIN_TANAH = 39;                // VN: AOUT sensor tanah ke-2
   const int PIN_DAYA_TANAH = 32;           // D32: listrik sensor tanah, menyala hanya saat dibutuhkan
   const unsigned long TENANG_TANAH_MS = 300;  // tunggu sejak sensor tanah dinyalakan sebelum dibaca
   const uint8_t RESOLUSI_DS18B20 = 10;     // 0,25 derajat, paling lama 188 ms

   OneWire satuKabel(PIN_SATU_KABEL);
   DallasTemperature sensorSuhu(&satuKabel);
   Adafruit_BME280 bme;
   uint16_t sesi = 0;
   uint32_t urutan = 0;

   static bool adaPerangkat(uint8_t alamat) {
     Wire.beginTransmission(alamat);
     return Wire.endTransmission() == 0;
   }

   // BME280 mode forced: ukur sekali, lalu sensor kembali tidur sendiri (0,1 uA) sampai disuruh lagi.
   static void bacaBme280(PaketNode2 &p) {
     p.suhu = NAN;
     p.kelembapan = NAN;
     p.tekanan = NAN;
     uint8_t alamat = adaPerangkat(0x76) ? 0x76 : (adaPerangkat(0x77) ? 0x77 : 0);
     if (alamat == 0) {
       Serial.println("BME280 tidak ditemukan di 0x76 maupun 0x77: periksa SDA ke D21, SCL ke D22, VCC, dan GND.");
       return;
     }
     if (!bme.begin(alamat)) {
       Serial.printf("Chip di 0x%02X bukan BME280 (chip ID 0x%02X; 0x58 = BMP280, tanpa kelembapan).\n", alamat,
                     (unsigned int)bme.sensorID());
       return;
     }
     bme.setSampling(Adafruit_BME280::MODE_FORCED, Adafruit_BME280::SAMPLING_X1, Adafruit_BME280::SAMPLING_X1,
                     Adafruit_BME280::SAMPLING_X1, Adafruit_BME280::FILTER_OFF);
     if (!bme.takeForcedMeasurement()) {
       Serial.println("BME280 tidak selesai mengukur.");
       return;
     }
     p.suhu = bme.readTemperature();
     p.kelembapan = bme.readHumidity();
     p.tekanan = bme.readPressure() / 100.0f;  // library memberi pascal; dibagi 100 menjadi hPa
   }

   // Rata-rata 20 bacaan. Angka mentah yang mustahil (sensor lepas atau tanpa listrik) dikirim sebagai -1.
   static int8_t bacaTanah(int &mentah) {
     long jumlah = 0;
     for (int i = 0; i < 20; i++) {
       jumlah += analogRead(PIN_TANAH);
       delay(2);
     }
     mentah = jumlah / 20;
     if (mentah < TANAH_BASAH - 300 || mentah > TANAH_KERING + 300) {
       return -1;
     }
     return constrain(map(mentah, TANAH_KERING, TANAH_BASAH, 0, 100), 0, 100);
   }

   static void kalibrasi() {
     digitalWrite(PIN_DAYA_TANAH, HIGH);
     unsigned long mulai = millis();
     const unsigned long TITIK[] = {10, 50, 100, 200, 400};
     Serial.print("Angka mentah sensor tanah sejak dinyalakan:");
     for (unsigned long t : TITIK) {
       while (millis() - mulai < t) {
         delay(1);
       }
       Serial.printf("  %lu ms: %d", t, analogRead(PIN_TANAH));
     }
     digitalWrite(PIN_DAYA_TANAH, LOW);
     Serial.println();
   }

   static void bangunPuraPura() {
     unsigned long t0 = millis();
     digitalWrite(PIN_DAYA_TANAH, HIGH);  // 1. sensor tanah dinyalakan PALING AWAL: butuh waktu untuk tenang

     PaketNode2 p = {};
     p.tanda = PAKET_TANDA;
     p.versi = PAKET_VERSI;
     p.fw[0] = 1;
     p.fw[1] = 0;
     p.fw[2] = 0;
     p.sesi = sesi;
     p.urutan = ++urutan;
     p.jedaDetik = 300;
     p.percobaan = 1;

     sensorSuhu.requestTemperatures();  // 2. DS18B20 mulai mengukur, tanpa menunggu
     unsigned long mulaiDs = millis();
     bacaBme280(p);                     // 3. BME280 dibaca sementara DS18B20 masih mengukur
     unsigned long tBme = millis() - t0;
     while (!sensorSuhu.isConversionComplete() && millis() - mulaiDs < 800) {  // 4. tunggu DS18B20 selesai
       delay(5);
     }
     float suhuTanah = sensorSuhu.getTempCByIndex(0);  // -127 kalau sensor tidak menjawab
     p.suhuTanah = (suhuTanah == DEVICE_DISCONNECTED_C) ? NAN : suhuTanah;
     unsigned long tDs = millis() - t0;
     while (millis() - t0 < TENANG_TANAH_MS) {  // 5. sensor tanah sudah cukup lama menyala?
       delay(1);
     }
     int mentah = 0;
     p.tanah = bacaTanah(mentah);
     digitalWrite(PIN_DAYA_TANAH, LOW);  // 6. sensor tanah dipadamkan lagi
     unsigned long tSelesai = millis() - t0;

     Serial.printf("Bangun pura-pura #%lu: BME280 selesai %lu ms, DS18B20 %lu ms, tanah %lu ms.\n", (unsigned long)urutan,
                   tBme, tDs, tSelesai);
     Serial.printf("  suhu %.1f C, kelembapan %.0f %%, tekanan %.1f hPa, suhu tanah %.2f C, tanah %d %% (mentah %d)\n",
                   p.suhu, p.kelembapan, p.tekanan, p.suhuTanah, p.tanah, mentah);
     const uint8_t *b = (const uint8_t *)&p;  // lihat paketnya byte demi byte
     Serial.print("  paket 33 byte:");
     for (size_t i = 0; i < sizeof(p); i++) {
       Serial.printf(" %02X", b[i]);
     }
     Serial.println();
   }

   void setup() {
     Serial.begin(115200);
     delay(1000);
     pinMode(PIN_DAYA_TANAH, OUTPUT);
     digitalWrite(PIN_DAYA_TANAH, LOW);
     Wire.begin(PIN_SDA, PIN_SCL);
     sensorSuhu.begin();
     sensorSuhu.setResolution(RESOLUSI_DS18B20);  // EEPROM sensor hanya ditulis kalau resolusinya berbeda
     sensorSuhu.setWaitForConversion(false);      // requestTemperatures() kembali seketika
     sesi = (uint16_t)(esp_random() | 1);
     Serial.println();
     Serial.printf("Praktik 2: ukuran PaketNode2 = %u byte. DS18B20 ditemukan: %u.\n", (unsigned int)sizeof(PaketNode2),
                   (unsigned int)sensorSuhu.getDeviceCount());
   }

   void loop() {
     if (MODE_KALIBRASI) {
       kalibrasi();
       delay(1600);
     } else {
       bangunPuraPura();
       delay(5000);
     }
   }
   ```

2. Buat tab baru untuk formulir paketnya: klik tombol **⋯** (tiga titik) di ujung kanan deretan tab, pilih **New Tab** (**Ctrl + Shift + N**), ketik **`paket-node2.h`** lengkap dengan akhirannya, lalu klik **OK**. Tempel isi `paket-node2.h` dari [Konsep 5](#5-paket-33-byte-formulir-yang-sama-di-kedua-ujung) ke tab baru itu, lalu simpan (**Ctrl + S**). Di Wokwi: **▾ → New file...**, beri nama `paket-node2.h`, lalu tempel isinya.
3. Library yang dipakai sudah terpasang sejak Modul 7: **Adafruit BME280 Library**, **OneWire**, dan **DallasTemperature**. Kalau Arduino IDE menulis `No such file or directory` untuk salah satunya, pasang lewat **Library Manager** seperti di Modul 7. Di Wokwi, tambahkan ketiganya lewat tab **Library Manager**.

#### 2.7 Kalibrasi sensor tanah ke-2 dengan listrik dari D32

Angka `TANAH_KERING` dan `TANAH_BASAH` milik Node 1 tidak berlaku untuk sensor ke-2: setiap sensor berbeda (Modul 6), dan listrik dari pin D32 sedikit di bawah 3,3 V sehingga keluaran sensornya ikut bergeser. Kalibrasi diulang **dengan rangkaian akhir**.

1. Colokkan USB papan Node 2 ke laptop (kabel VIN dan GND-nya tetap lepas dari breadboard mini). Ubah `MODE_KALIBRASI = false` menjadi `MODE_KALIBRASI = true`. Di jendela `modul14_sensor_kebun`, pilih **DOIT ESP32 DEVKIT V1** dan port papan **Node 2**, klik **Upload**, lalu buka Serial Monitor-nya. Kalau baris pertama terlewat, tekan **EN** di papan Node 2.
2. Biarkan sensor di udara, kering. **Hasilnya** (contoh):

   ```text
   Praktik 2: ukuran PaketNode2 = 33 byte. DS18B20 ditemukan: 1.
   Angka mentah sensor tanah sejak dinyalakan:  10 ms: 2612  50 ms: 2988  100 ms: 3010  200 ms: 3014  400 ms: 3015
   Angka mentah sensor tanah sejak dinyalakan:  10 ms: 2598  50 ms: 2985  100 ms: 3009  200 ms: 3013  400 ms: 3015
   ```

   Setiap baris adalah satu kali sensor dinyalakan lewat D32, dibaca lima kali, lalu dipadamkan lagi. Angkanya **naik dulu, lalu tenang**: rangkaian di dalam sensor butuh waktu sesaat setelah mendapat listrik. Inilah alasan Node 2 menyalakan sensor tanah paling awal dan baru membacanya paling cepat 300 ms kemudian (`TENANG_TANAH_MS`). **Periksa angkamu:** kalau angka di kolom 200 ms dan 400 ms masih berselisih lebih dari 20, catat juga hal itu; di Praktik 4 kamu akan menaikkan `TENANG_TANAH_MS` menjadi `500`.
3. Catat angka di kolom **400 ms** sebagai **angka kering**.
4. Celupkan sensor ke gelas air **sampai garis batasnya** (jangan lebih, Modul 6). Tunggu beberapa baris, lalu catat angka di kolom 400 ms sebagai **angka basah**.
5. Selisih angka kering dan angka basah seharusnya lebih dari 500, seperti di Modul 6. Kurang dari itu? Periksa kabel dan tulisan chip di sensornya (🚨).
6. Tulis kedua angka itu di `catatan-modul14.md`, lalu isikan ke `TANAH_KERING` dan `TANAH_BASAH` di sketsa. Keringkan sensornya.

#### 2.8 Bangun pura-pura dan paket 33 byte

1. Ubah lagi `MODE_KALIBRASI = true` menjadi `MODE_KALIBRASI = false`, unggah lagi, lalu buka Serial Monitor. Baris pertama (`Praktik 2: ukuran PaketNode2 …`) hanya dicetak sekali saat papan menyala; kalau terlewat, tekan **EN** di papan Node 2.

   **Hasilnya** (contoh; setiap 5 detik):

   ```text
   Praktik 2: ukuran PaketNode2 = 33 byte. DS18B20 ditemukan: 1.
   Bangun pura-pura #1: BME280 selesai 121 ms, DS18B20 191 ms, tanah 341 ms.
     suhu 29.4 C, kelembapan 78 %, tekanan 1008.6 hPa, suhu tanah 27.25 C, tanah 41 % (mentah 2303)
     paket 33 byte: 52 01 01 00 00 3F 5A 01 00 00 00 2C 01 01 A4 70 EB 41 71 3D 9C 42 7B 24 7C 44 00 00 DA 41 29 00 00
   ```

   Baris pertama memastikan ukuran formulir tepat 33 byte. Baris `Bangun pura-pura` memperlihatkan urutan Konsep 4: BME280 selesai sekitar 120 ms, DS18B20 sekitar 190 ms (10 bit), dan sensor tanah dibaca sesudah 300 ms, lalu dipadamkan. Suhu tanah tercetak dalam kelipatan 0,25 °C (`27.25`), ciri resolusi 10 bit.
2. Cocokkan paketmu dengan [peta paket di Konsep 5](#5-paket-33-byte-formulir-yang-sama-di-kedua-ujung): byte ke-0 `52` (tanda), byte ke-11 dan ke-12 `2C 01` (300 detik), dan byte ke-30 adalah persen tanahmu dalam heksadesimal (`29` = 2 × 16 + 9 = 41, cara hitung Modul 7).
3. Coba dua kegagalan supaya kamu mengenalinya nanti. Seperti uji gagal Modul 6, cabut dulu USB papan Node 2 setiap kali mencabut atau memasang kabel, lalu colokkan lagi. Serial Monitor biasanya tersambung lagi sendiri; kalau tidak, pilih lagi port-nya di bilah atas Arduino IDE, seperti di Modul 8. Pertama, cabut kabel **SDA** BME280 (baris `BME280 tidak ditemukan…`, lalu `suhu nan`, dan tiga kelompok `00 00 C0 7F` di paket). Kedua, cabut juga ujung kabel **VCC** sensor tanah dari kaki D32 (sensor tanpa listrik, angka mentahnya mendekati 0: `tanah -1 %` dan byte `FF`). Terakhir, sambungkan lagi keduanya.

**Jalur Wokwi** (hasil sungguhan dari simulator, Oktober 2026; potensiometer di Wokwi menggantikan sensor tanah):

```text
Praktik 2: ukuran PaketNode2 = 33 byte. DS18B20 ditemukan: 1.
BME280 tidak ditemukan di 0x76 maupun 0x77: periksa SDA ke D21, SCL ke D22, VCC, dan GND.
Bangun pura-pura #1: BME280 selesai 3 ms, DS18B20 224 ms, tanah 340 ms.
  suhu nan C, kelembapan nan %, tekanan nan hPa, suhu tanah 27.00 C, tanah 55 % (mentah 2050)
  paket 33 byte: 52 01 01 00 00 AD 9C 01 00 00 00 2C 01 01 00 00 C0 7F 00 00 C0 7F 00 00 C0 7F 00 00 D8 41 37 00 00
…
Bangun pura-pura #4: BME280 selesai 3 ms, DS18B20 224 ms, tanah 340 ms.
  suhu nan C, kelembapan nan %, tekanan nan hPa, suhu tanah 27.00 C, tanah -1 % (mentah 4095)
  paket 33 byte: 52 01 01 00 00 AD 9C 04 00 00 00 2C 01 01 00 00 C0 7F 00 00 C0 7F 00 00 C0 7F 00 00 D8 41 FF 00 00
```

Wokwi tidak punya BME280, jadi ketiga kolomnya berisi `NAN` (`00 00 C0 7F`). DS18B20 simulasi diatur 27,1 °C, tetapi tercetak `27.00`: resolusi 10 bit hanya punya kelipatan 0,25. Potensiometer di tengah memberi angka mentah sekitar `2050`, yaitu 55 % (`37` dalam heksadesimal). Bangun ke-4 terjadi setelah potensiometer diputar penuh: angka mentah `4095` berada di luar rentang kalibrasi sehingga dikirim sebagai `-1` (`FF`). Coba sendiri dengan mengeklik potensiometernya dan menggeser kenopnya.

> ⬆️ **Selesai Praktik 2?** Kembali ke [Konsep 6](#6-callback-cara-paket-esp32-3x-titip-di-kotak-surat-olah-di-loop).

### Praktik 3 — Node 1 v1.3.0: jembatan ESP-NOW ke MQTT (40 menit)

> 🖥️ **Alat:** **Arduino IDE** dengan `node-1-rumah.ino` dari repositori `rumah-pintar-mini`, papan Node 1 (USB ke laptop), browser untuk membuka file kurikulum di GitHub, dan `catatan-modul14.md`. Konsep yang dipakai: 6–7.
>
> ⭐ **Wajib** — syarat lulus Modul 14 meminta data Node 2 tampil di Node-RED, dan jalannya lewat Node 1.
>
> 🖥️ **Jalur Wokwi:** kerjakan semua perubahan di proyek Wokwi Node 1-mu (Modul 11–13). Perubahan untuk `node-1-rumah.ino` (langkah 3.5) dikerjakan di tab `sketch.ino`, dan `PAKAI_WOKWI` di `konfigurasi.h` tetap `true` seperti sejak Modul 11. Dalam mode Wokwi, `loop()` Node 1 menitipkan paket **Node 2 tiruan** ke kotak surat yang sama setiap 30 detik karena di Wokwi tidak ada Node 2 sungguhan; sisa jembatannya bekerja persis sama dan menerbitkannya ke `broker.emqx.io`. Ganti tiga pasang terakhir `MAC_NODE2` dengan angka pilihanmu sendiri, seperti `macAddress` di Modul 11, supaya topik Node 2 tiruanmu tidak kembar dengan milik orang lain di broker publik.

Node 1 v1.3.0 = v1.2.1 + **tiga file baru** + **perubahan kecil di lima file**. Seperti di Modul 10–11, file baru disalin utuh dari kurikulum, dan perubahan kecil kamu ketik sendiri.

| File | Perubahan | Cara |
| :--- | :--- | :--- |
| `paket-node2.h` | **baru**: formulir paket 33 byte (Konsep 5) | salin dari kurikulum (langkah 3.1) |
| `jembatan.h` / `.cpp` | **baru**: kotak surat, rak tunggu, `ts`, status Node 2, perintah `node2` (Konsep 6–7) | salin dari kurikulum (langkah 3.1) |
| `konfigurasi.h` | versi `1.3.0`, `MAC_NODE2`, ukuran rak tunggu | ketik (langkah 3.2) |
| `jaringan.h` / `.cpp` | `setSleep(false)`, `setAutoReconnect(false)`, channel router, dua fungsi untuk jembatan | ketik (langkah 3.3–3.4) |
| `node-1-rumah.ino` | memanggil `siapkanJembatan()` dan `perbaruiJembatan()` | ketik (langkah 3.5) |
| `perintah.cpp` | perintah Serial `node2` dan `node2 nol` | ketik (langkah 3.6) |

#### 3.1 Tiga file baru

1. Di Arduino IDE, buka **File → Open…** → **Documents → GitHub → rumah-pintar-mini → firmware → node-1-rumah** → `node-1-rumah.ino`. Sketsa Node 1 terbuka dengan semua tabnya.
2. Buat tiga tab baru (**⋯ → New Tab**, ketik namanya lengkap dengan akhirannya, lalu klik **OK**; di Wokwi: **▾ → New file...**): **`paket-node2.h`**, **`jembatan.h`**, dan **`jembatan.cpp`**.
3. Isi masing-masing dengan cara yang sama: klik kanan nama filenya di bawah ini → **Buka di tab baru**, klik ikon **Copy raw file**, kembali ke Arduino IDE, lalu tempel (**Ctrl + V**).
   - [`kode/node-1-rumah/paket-node2.h`](kode/node-1-rumah/paket-node2.h) (sama persis dengan isi di Konsep 5)
   - [`kode/node-1-rumah/jembatan.h`](kode/node-1-rumah/jembatan.h)
   - [`kode/node-1-rumah/jembatan.cpp`](kode/node-1-rumah/jembatan.cpp)
4. Luangkan lima menit untuk membaca `jembatan.cpp`. Komentarnya mengikuti Konsep 6–7: `saatTerimaEspNow()` hanya menyalin paket 33 byte yang bukan siaran ke kotak surat, `terimaPaket()` memeriksa dan menghitung, `buatJsonNode2()` menyusun JSON beserta `ts` yang dimundurkan, dan `terbitkanRak()` menerbitkan paling banyak tiga bacaan per putaran. Fungsi `tiruNode2()` hanya bekerja di mode Wokwi.

#### 3.2 `konfigurasi.h`

1. Ganti nomor versinya:

   ```cpp
   const char VERSI_FIRMWARE[] = "1.2.1";
   ```

   menjadi:

   ```cpp
   const char VERSI_FIRMWARE[] = "1.3.0";
   ```

2. Di **paling bawah** file, setelah baris `JEDA_VITALS`, tambahkan:

   ```cpp

   // ---------- Modul 14: jembatan ESP-NOW untuk Node 2 "Kebun" ----------
   // Alamat MAC WiFi Node 2, dicetak Node 2 saat pertama menyala. Paket ESP-NOW dari alamat lain ditolak.
   const uint8_t MAC_NODE2[6] = {0x24, 0x6F, 0x28, 0xB1, 0xC7, 0xD4};  // GANTI dengan MAC Node 2-mu
   const int ANTREAN_NODE2 = 96;  // rak tunggu: bacaan Node 2 yang ditahan saat broker tak terjangkau (8 jam pada jeda 5 menit)
   const unsigned long CADANGAN_OFFLINE_NODE2 = 60000;  // Node 2 "offline" setelah 3 x jedanya + 1 menit
   ```

3. Ganti isi kurung kurawal `MAC_NODE2` dengan alamat MAC papan Node 2 dari `catatan-modul14.md` (Kemenangan Cepat langkah 3), ditulis per dua digit dengan `0x` di depannya, misalnya `24:6F:28:B1:C7:D4` menjadi `{0x24, 0x6F, 0x28, 0xB1, 0xC7, 0xD4}`.

#### 3.3 `jaringan.h`

Di paling bawah, setelah baris `void lupakanWiFi();`, tambahkan dua baris:

```cpp
bool mqttSiap();                       // Modul 14: true kalau WiFi dan MQTT sedang tersambung
bool terbitkan(const char* topik, const char* isi, bool retained);  // Modul 14: terbit atas nama Node 2
```

#### 3.4 `jaringan.cpp` (tujuh perubahan kecil)

1. **Ingatan channel router.** Cari baris:

   ```cpp
   static unsigned long waktuPenjagaTerakhir = 0;
   ```

   lalu tambahkan **di bawahnya**:

   ```cpp
   static uint8_t kanalRouter = 0;  // Modul 14: channel router saat terakhir tersambung; ESP-NOW ikut channel ini
   ```

2. **Radio tidak tidur dan tidak menyambung ulang sendiri.** Di fungsi `siapkanJaringan()`, cari baris `WiFi.setHostname(NAMA_PERANGKAT);`, lalu sisipkan tiga baris ini **di antara** baris itu dan baris `WiFi.mode(WIFI_STA);`:

   ```cpp
     WiFi.setSleep(false);              // Modul 14: radio selalu mendengar ESP-NOW (dipasang SEBELUM WiFi.mode)
     WiFi.setAutoReconnect(false);      // Modul 14: saat router mati, paket esp32 tidak memindai terus-menerus;
                                        // yang mencoba lagi hanya penjaga 60 detik di jagaSambungan()
   ```

   Urutannya penting: keduanya dipasang **sebelum** `WiFi.mode(WIFI_STA)` supaya berlaku sejak radio pertama kali menyala.
3. **Penjaga mengembalikan channel.** Di atas fungsi `jagaSambungan()`, di bawah baris komentar `// Penjaga (Modul 10, Konsep 4): …`, tambahkan satu baris komentar:

   ```cpp
   // Sejak v1.3.0 (Modul 14) penjaga ini satu-satunya yang menyuruh menyambung lagi: setAutoReconnect(false).
   ```

   Lalu, di dalam fungsi itu, sisipkan blok ini tepat **sesudah** baris `unsigned long sekarang = millis();` dan **sebelum** baris `if (sekarang - peristiwaTerakhir >= BATAS_TANPA_PERCOBAAN`:

   ```cpp
     // Modul 14: 3 detik tanpa peristiwa WiFi dan 3 detik sesudah percobaan penjaga = radio tidak sedang memindai.
     // Kembalikan radio ke channel router supaya paket ESP-NOW Node 2 tetap terdengar selama router mati.
     if (kanalRouter != 0 && sekarang - peristiwaTerakhir >= 3000 && sekarang - waktuPenjagaTerakhir >= 3000
         && WiFi.channel() != kanalRouter) {
       WiFi.setChannel(kanalRouter);
     }
   ```

   Syarat "3 detik tanpa peristiwa" memastikan radio tidak sedang memindai: `WiFi.setChannel()` tidak boleh dipanggil di tengah pemindaian.
4. **Pesan putus yang jujur.** Di fungsi `perbaruiJaringan()`, ganti:

   ```cpp
         logError("WiFi PUTUS (alasan %u: %s). Node 1 tetap bekerja; paket esp32 mencoba menyambung lagi.", alasanPutus,
                  namaAlasan(alasanPutus));
   ```

   dengan:

   ```cpp
         logError("WiFi PUTUS (alasan %u: %s). Node 1 tetap bekerja dan mencoba lagi setiap %lu detik.", alasanPutus,
                  namaAlasan(alasanPutus), BATAS_TANPA_PERCOBAAN / 1000);
   ```

5. **Ingat channel saat tersambung.** Masih di `perbaruiJaringan()`, cari baris `tersambung = true;` (di dalam `if (benderaDapatIp)`), lalu tambahkan **di bawahnya**:

   ```cpp
         kanalRouter = WiFi.channel();  // Modul 14: diingat untuk ESP-NOW
   ```

   Lalu, beberapa baris di bawahnya, ganti log tersambung yang pertama:

   ```cpp
           logInfo("WiFi tersambung ke \"%s\": IP %s, sinyal %d dBm", WiFi.SSID().c_str(),
                   WiFi.localIP().toString().c_str(), WiFi.RSSI());
   ```

   dengan:

   ```cpp
           logInfo("WiFi tersambung ke \"%s\": IP %s, sinyal %d dBm, channel %u", WiFi.SSID().c_str(),
                   WiFi.localIP().toString().c_str(), WiFi.RSSI(), kanalRouter);
   ```

6. **Perintah `wifi` menyebut channel.** Di fungsi `cetakInfoJaringan()`, di bawah baris yang mencetak `wifi: device_id %s, nama %s, jam %s`, tambahkan:

   ```cpp
     Serial.printf("wifi: channel radio %ld, channel router %u (0 = belum pernah tersambung)\n", (long)WiFi.channel(),
                   kanalRouter);  // Modul 14
   ```

7. **Dua fungsi untuk jembatan.** Di **paling bawah** file, setelah fungsi `lupakanWiFi()`, tambahkan:

   ```cpp

   // ---------- Modul 14: dipakai jembatan Node 2 (jembatan.cpp) ----------
   bool mqttSiap() {
     return tersambung && mqtt.connected();
   }

   bool terbitkan(const char* topik, const char* isi, bool retained) {
     if (!mqttSiap()) {
       return false;
     }
     return mqtt.publish(topik, isi, retained);
   }
   ```

   `jembatan.cpp` tidak menyentuh objek `mqtt` secara langsung. Ia meminta tolong `jaringan.cpp` lewat dua fungsi ini, sesuai pembagian tugas setiap file sejak Modul 8.

#### 3.5 `node-1-rumah.ino`

1. Ganti baris pertama:

   ```cpp
   // Node 1 "Rumah" - firmware v1.2.1 (Modul 12: broker pindah ke gateway Raspberry Pi)
   ```

   dengan:

   ```cpp
   // Node 1 "Rumah" - firmware v1.3.0 (Modul 14: jembatan ESP-NOW untuk Node 2 "Kebun")
   ```

   Lalu, di atas baris `// Baru di v1.2.0: …`, sisipkan tiga baris ini:

   ```cpp
   // Baru di v1.3.0: Node 1 mendengar paket ESP-NOW dari Node 2 "Kebun" dan menerbitkannya ke broker atas nama
   // Node 2 (rpm/<device_id Node 2>/telemetry dan /status), termasuk bacaan yang tertahan selama router mati.
   // Radio tidak lagi tidur (setSleep false) dan tidak menyambung ulang sendiri: penjaga 60 detik yang mencoba lagi.
   ```

   Di baris daftar perintah, ganti `wifi, wifi lupa, kirim, restart.` dengan `wifi, wifi lupa, kirim, node2, node2 nol, restart.`.
2. Di bawah baris `#include "jaringan.h"  // Modul 10-11`, tambahkan:

   ```cpp
   #include "jembatan.h"  // Modul 14: Node 2 lewat ESP-NOW
   ```

3. Di `setup()`, di bawah baris `siapkanJaringan();  // Modul 10: …`, tambahkan:

   ```cpp
     siapkanJembatan();  // Modul 14: sesudah WiFi menyala
   ```

4. Di `loop()`, di bawah baris `perbaruiJaringan();    // Modul 10-11: …`, tambahkan:

   ```cpp
     perbaruiJembatan();    // Modul 14: paket Node 2 -> rak tunggu -> broker; tidak pernah menunggu
   ```

#### 3.6 `perintah.cpp`

1. Di bawah baris `#include "jaringan.h"`, tambahkan `#include "jembatan.h"`.
2. Cari blok perintah `wifi lupa`, lalu sisipkan dua perintah baru **di antara** blok itu dan blok `kirim` sehingga bagian itu menjadi:

   ```cpp
     } else if (perintah == "wifi lupa") {
       lupakanWiFi();  // Modul 10: menghapus WiFi tersimpan, lalu restart ke portal
       return;
     } else if (perintah == "node2") {
       cetakInfoNode2();  // Modul 14: statistik paket Node 2
       return;
     } else if (perintah == "node2 nol") {
       nolkanHitunganNode2();  // Modul 14: hitungan mulai dari nol, misalnya tepat saat router dicabut
       cetakInfoNode2();
       return;
     } else if (perintah == "kirim") {
   ```

3. Di pesan `Perintah tidak dikenal`, ganti baris `Serial.println("kirim, restart");` dengan `Serial.println("kirim, node2, node2 nol, restart");`.

Semua perubahan ini juga bisa kamu bandingkan dengan versi rujukan di [`kode/node-1-rumah/`](kode/node-1-rumah/), atau di folder proyek `proyek-rumah-pintar-mini/firmware/node-1-rumah/` setelah modul ini terbit.

#### 3.7 Unggah dan periksa

1. Pastikan papan yang terpilih **ESP32 Dev Module**, dengan **Partition Scheme** **Minimal SPIFFS** dan **Flash Mode** **DIO** (setelan Node 1 sejak Modul 10), dan port papan **Node 1**. Klik **Upload**. Arduino IDE menulis kira-kira `Sketch uses 1181860 bytes (60%) of program storage space`; angka di layarmu boleh sedikit berbeda. Kompilasi berhenti dengan error? Baca **pesan error pertama**, lalu bandingkan tab yang disebutnya dengan [versi rujukan](kode/node-1-rumah/), seperti di Modul 11. Penyebab yang paling sering: tab baru diberi nama tanpa `.h` atau `.cpp` (Arduino IDE lalu membuat file `.ino`, dan muncul `jembatan.h: No such file or directory`), atau satu baris dari langkah 3.2–3.6 terlewat (muncul `'…' was not declared in this scope`).
2. Nyalakan lagi MB102 meja kerja Node 1 (urutannya: USB dulu, baru MB102). Mulai sekarang Node 1 kembali bekerja penuh. Biarkan papan Node 1 tetap tercolok ke laptop sampai bagian ➕ B karena kamu sering membaca Serial Monitor-nya.
3. Buka **Serial Monitor**, lalu tekan **EN** di papan Node 1. Node 1 menyala ulang sehingga baris-baris awalnya tampil, dan modul microSD beregulator, yang baru mendapat listrik setelah MB102 menyala, ikut ditemukan (kebiasaan Modul 7). **Hasilnya** (contoh, dipotong; baris bacaan setiap 2 detik tidak ikut dikutip):

   ```text
   [00:00:01] INFO  Node 1 Rumah - firmware 1.3.0
   [00:00:02] INFO  device_id a4cf12e5b7c0
   [00:00:02] INFO  Menyambung ke WiFi tersimpan "RumahKita" (tanpa menunggu)...
   [00:00:02] INFO  Jembatan Node 2 siap: mendengar ESP-NOW dari 246f28b1c7d4, enkripsi mati.
   [00:00:02] INFO  Watchdog aktif: restart otomatis kalau loop() macet lebih dari 5 detik.
   [00:00:04] INFO  WiFi tersambung ke "RumahKita": IP 192.168.1.23, sinyal -58 dBm, channel 6
   [00:00:04] INFO  MQTT tersambung ke broker 192.168.1.37:1883 dalam 41 ms, sebagai a4cf12e5b7c0
   ```

4. Ketik `wifi` di kotak kirim Serial Monitor, lalu tekan **Enter**. Baris barunya (contoh):

   ```text
   wifi: channel radio 6, channel router 6 (0 = belum pernah tersambung)
   ```

5. Ketik `node2`. Node 2 belum menjalankan firmware-nya, jadi hasilnya seperti ini (contoh):

   ```text
   node2: device_id 246f28b1c7d4, belum terdengar, channel radio 6, enkripsi mati
   node2: diterima 0, hilang 0, dobel 0, ditolak 0, dibuang 0
   node2: terbit 0, menunggu di rak 0 dari 96, tergusur 0
   ```

   Semua angkanya 0 karena papan Node 2 masih menjalankan sketsa sensor Praktik 2, yang tidak memakai radio. Angka `dibuang` bertambah? Berarti ada ESP32 di channel ini yang mengirim paket siaran, atau paket bukan 33 byte ke Node 1, misalnya papan yang masih menjalankan `modul14_cari_kanal` (teks `halo dari kebun`). Petugas WiFi Node 1 langsung membuangnya: itulah pemeriksaan pertama jembatan. Kalau Node 2 belum juga mengirim 16 menit setelah Node 1 menyala, Node 1 menulis `ERROR Node 2 OFFLINE: tidak ada paket selama 960 detik.` Itu wajar: statusnya berubah menjadi `online` begitu paket pertama Node 2 tiba.

**Jalur Wokwi** (`PAKAI_WOKWI = true`; hasil sungguhan dari simulator, Oktober 2026, dipotong):

```text
[00:00:03] INFO  Jembatan Node 2 siap: mendengar ESP-NOW dari 246f28b1c7d4, enkripsi mati.
[00:00:03] INFO  Mode Wokwi: Node 2 tiruan mengirim paket setiap 30 detik.
[00:00:03] INFO  Node 2: paket #1 diterima (percobaan ke-1, sinyal -58 dBm).
[00:00:03] INFO  Node 2 ONLINE.
[00:00:04] INFO  WiFi tersambung ke "Wokwi-GUEST": IP 10.10.0.1, sinyal -86 dBm, channel 6
[00:00:07] INFO  MQTT tersambung ke broker broker.emqx.io:1883 dalam 2273 ms, sebagai 240ac45e114b
[00:00:09] INFO  Jam disetel dari internet: 2026-10-18T14:50:03Z
[00:00:33] INFO  Node 2: paket #2 diterima (percobaan ke-1, sinyal -58 dBm).
```

Lalu perintah `node2` (setelah sekitar 50 detik):

```text
node2: device_id 246f28b1c7d4, online, channel radio 6, enkripsi mati
node2: diterima 2, hilang 0, dobel 0, ditolak 0, dibuang 0
node2: paket tiba 100.0 %
node2: terbit 2, menunggu di rak 0 dari 96, tergusur 0
node2: paket terakhir #2, 18 detik lalu, percobaan ke-1, sinyal -58 dBm, jeda 30 detik
```

Perhatikan paket `#1`: ia tiba **sebelum** WiFi tersambung dan sebelum jam disetel, menunggu di rak, lalu tetap terbit setelah semuanya siap (`terbit 2`). Itulah rak tunggu yang bekerja, versi kecil dari uji router di Praktik 6.

> ➡️ **Lanjut** ke [Praktik 4 — Node 2 v1.0.0](#praktik-4--node-2-v100-bangun-kirim-tidur-40-menit) tanpa kembali ke konsep.

### Praktik 4 — Node 2 v1.0.0: bangun, kirim, tidur (40 menit)

> 🖥️ **Alat:** **Arduino IDE** dengan `node-2-kebun.ino` dari repositori `rumah-pintar-mini`, papan Node 2 (USB ke laptop), papan Node 1 v1.3.0 dengan Serial Monitor-nya, **MQTTX**, dan **VS Code** dengan folder `rumah-pintar-mini` untuk pemeriksa kontrak. Konsep yang dipakai: 4–7.
>
> ⭐ **Wajib** — syarat lulus Modul 14 meminta data Node 2 tampil di Node-RED dengan `device_id` sendiri.
>
> 🖥️ **Jalur Wokwi:** Node 2 v1.0.0 butuh papan asli (ESP-NOW ke papan lain, tidur dalam, dan BME280). Baca langkah 4.1–4.3 untuk memahami firmware-nya, lalu kerjakan langkah 4.4–4.5 dengan Node 2 tiruan dari Praktik 3: di MQTTX, pakai sambungan **Broker publik** dan topik `rpm/` + `device_id` Node 2 tiruanmu + `/#`; pemeriksa kontrak dijalankan dengan `broker.emqx.io` dan `device_id` itu, misalnya `node pemeriksa-kontrak.js broker.emqx.io 246f28a1b2c3` (pakai `device_id` Node 2 tiruanmu sendiri). Node 2 tiruan juga selalu mengirim kolom `baterai` (`3.92`), jadi pesannya punya satu kolom lebih banyak daripada contoh 4.4, dan pemeriksa versi 1.0 di 4.5 langkah 1 menulis satu baris tambahan: `kolom "baterai" tidak ada di kontrak data`.

Node 2 v1.0.0 menggantikan kerangka v0.1.0 dari Modul 9 seluruhnya. Hampir semua bagiannya sudah kamu kenal: urutan bangun dari Praktik 2, pencarian channel dari Praktik 1, dan pengiriman ber-ACK dari Kemenangan Cepat.

#### 4.1 Ganti isi `node-2-kebun.ino`

1. Di jendela papan Node 2, buka **File → Open…** → **Documents → GitHub → rumah-pintar-mini → firmware → node-2-kebun** → `node-2-kebun.ino`. Ini kerangka v0.1.0 dari Modul 9.
2. Pilih semua isinya (**Ctrl + A**), lalu ganti dengan kode ini:

   ```cpp
   // Node 2 "Kebun" - Rumah Pintar Mini - firmware v1.0.0 (Modul 14): sensor bertenaga baterai lewat ESP-NOW
   // Setiap 5 menit: bangun -> baca BME280 + DS18B20 + sensor tanah ke-2 (+ baterai, kalau dipasang) -> kirim satu
   // paket ESP-NOW ke Node 1 -> tidur lagi. Urutannya sengaja: semua sensor dulu (radio masih mati), radio sebentar, tidur.
   // Node 2 tidak pernah tersambung ke router dan tidak tahu kata sandi WiFi: cukup NAMA WiFi rumah, untuk mencari channel.
   // Pin menurut PETA-PIN.md versi 5, bagian Node 2. Papan: DOIT ESP32 DEVKIT V1 (rak program bawaan cukup).
   // Library: Adafruit BME280 Library 2.3.0 (ikut terpasang: Adafruit Unified Sensor 1.1.15, Adafruit BusIO 1.17.4),
   // OneWire 2.3.8, DallasTemperature 4.0.6. WiFi dan ESP-NOW ikut paket esp32 (versi 3.3.7 atau lebih baru).

   #include <Wire.h>
   #include <WiFi.h>
   #include <esp_now.h>
   #include <esp_mac.h>
   #include <OneWire.h>
   #include <DallasTemperature.h>
   #include <Adafruit_BME280.h>
   #include "paket-node2.h"

   // Praktik 8: kunci enkripsi ESP-NOW ada di kunci.h, yang TIDAK ikut ke GitHub (.gitignore).
   // Selama file itu belum ada, ESP-NOW berjalan tanpa enkripsi.
   #if __has_include("kunci.h")
   #include "kunci.h"
   #else
   const bool PAKAI_ENKRIPSI = false;
   const char KUNCI_PMK[] = "";
   const char KUNCI_LMK[] = "";
   #endif
   static_assert(!PAKAI_ENKRIPSI || sizeof(KUNCI_PMK) == 17, "KUNCI_PMK di kunci.h harus tepat 16 huruf/angka");
   static_assert(!PAKAI_ENKRIPSI || sizeof(KUNCI_LMK) == 17, "KUNCI_LMK di kunci.h harus tepat 16 huruf/angka");

   // ---------- Ganti dengan milikmu ----------
   const uint8_t MAC_NODE1[6] = {0xA4, 0xCF, 0x12, 0xE5, 0xB7, 0xC0};  // MAC WiFi Node 1 (= device_id Node 1), per 2 digit
   const char NAMA_WIFI[] = "NamaWiFiRumahmu";  // nama WiFi rumah tempat Node 1 tersambung, PERSIS; kata sandi TIDAK perlu
   const uint8_t KANAL_TETAP = 0;               // 0 = cari sendiri lewat NAMA_WIFI; 1-11 = selalu pakai channel ini
   const int TANAH_KERING = 3000;               // kalibrasi sensor tanah KE-2 dengan daya dari D32 (Praktik 2)
   const int TANAH_BASAH = 1300;
   const uint16_t JEDA_DETIK = 300;             // bangun setiap 5 menit; uji "matikan router" (Praktik 6): 60
   const bool ADA_PEMBAGI_BATERAI = false;      // true kalau pembagi tegangan baterai dipasang ke VP (bedah teknis)
   const float FAKTOR_PEMBAGI = 2.0;            // dua resistor sama besar; koreksi dengan multimeter

   // ---------- Tetap ----------
   const uint8_t VERSI_FW[3] = {1, 0, 0};
   const int PIN_LED_BANGUN = 2;              // LED biru bawaan: menyala selama bangun
   const int PIN_SATU_KABEL = 27;             // DS18B20
   const int PIN_SDA = 21;                    // BME280
   const int PIN_SCL = 22;
   const int PIN_TANAH = 39;                  // VN: AOUT sensor tanah ke-2
   const int PIN_DAYA_TANAH = 32;             // D32: listrik sensor tanah, menyala hanya selama bangun
   const int PIN_BATERAI = 36;                // VP: titik tengah pembagi tegangan (pilihan)
   const unsigned long TENANG_TANAH_MS = 300; // tunggu sejak sensor tanah dinyalakan sebelum dibaca
   const uint8_t RESOLUSI_DS18B20 = 10;       // 0,25 derajat, paling lama 188 ms
   const int MAKS_PERCOBAAN = 3;              // kirim ulang kalau ACK radio Node 1 tidak datang
   const int GAGAL_SEBELUM_PINDAI = 2;        // setelah 2 kali bangun gagal berturut-turut, cari channel lagi

   // ---------- Ingatan RTC: selamat dari deep sleep, hilang kalau baterai dicabut atau EN ditekan ----------
   RTC_DATA_ATTR uint16_t sesi = 0;  // 0 = papan baru menyala dari mati
   RTC_DATA_ATTR uint32_t urutan = 0;
   RTC_DATA_ATTR uint8_t kanal = 0;  // channel yang terakhir dipakai (0 = belum tahu)
   RTC_DATA_ATTR uint8_t gagalBeruntun = 0;

   OneWire satuKabel(PIN_SATU_KABEL);
   DallasTemperature sensorSuhu(&satuKabel);
   Adafruit_BME280 bme;

   volatile bool kirimSelesai = false;  // diisi petugas WiFi, dibaca setup()
   volatile bool kirimBerhasil = false;

   // Dipanggil petugas WiFi setelah radio menerima (atau tidak menerima) ACK dari Node 1.
   static void saatKirimSelesai(const esp_now_send_info_t *info, esp_now_send_status_t status) {
     kirimBerhasil = (status == ESP_NOW_SEND_SUCCESS);
     kirimSelesai = true;
   }

   static bool adaPerangkat(uint8_t alamat) {
     Wire.beginTransmission(alamat);
     return Wire.endTransmission() == 0;
   }

   // BME280 mode forced: ukur sekali, lalu sensor kembali tidur sendiri (0,1 uA) selama Node 2 tidur.
   static void bacaBme280(PaketNode2 &p) {
     p.suhu = NAN;
     p.kelembapan = NAN;
     p.tekanan = NAN;
     Wire.begin(PIN_SDA, PIN_SCL);
     uint8_t alamat = adaPerangkat(0x76) ? 0x76 : (adaPerangkat(0x77) ? 0x77 : 0);
     if (alamat == 0) {
       Serial.println("BME280 tidak ditemukan di 0x76 maupun 0x77: periksa SDA ke D21, SCL ke D22, VCC, dan GND.");
       return;
     }
     if (!bme.begin(alamat)) {
       Serial.printf("Chip di 0x%02X bukan BME280 (chip ID 0x%02X; 0x58 = BMP280, tanpa kelembapan).\n", alamat,
                     (unsigned int)bme.sensorID());
       return;
     }
     bme.setSampling(Adafruit_BME280::MODE_FORCED, Adafruit_BME280::SAMPLING_X1, Adafruit_BME280::SAMPLING_X1,
                     Adafruit_BME280::SAMPLING_X1, Adafruit_BME280::FILTER_OFF);
     if (!bme.takeForcedMeasurement()) {
       return;
     }
     p.suhu = bme.readTemperature();
     p.kelembapan = bme.readHumidity();
     p.tekanan = bme.readPressure() / 100.0f;  // library memberi pascal; dibagi 100 menjadi hPa
   }

   // Rata-rata 20 bacaan. Angka mentah yang mustahil (sensor lepas atau tanpa listrik) dikirim sebagai -1.
   static int8_t bacaTanah() {
     long jumlah = 0;
     for (int i = 0; i < 20; i++) {
       jumlah += analogRead(PIN_TANAH);
       delay(2);
     }
     int mentah = jumlah / 20;
     if (mentah < TANAH_BASAH - 300 || mentah > TANAH_KERING + 300) {
       Serial.printf("Sensor tanah: angka mentah %d mustahil, dikirim sebagai gagal.\n", mentah);
       return -1;
     }
     return constrain(map(mentah, TANAH_KERING, TANAH_BASAH, 0, 100), 0, 100);
   }

   static uint16_t bacaBateraiMv() {
     if (!ADA_PEMBAGI_BATERAI) {
       return 0;  // 0 = tidak diukur; Node 1 tidak menulis kolom baterai
     }
     uint32_t jumlah = 0;
     for (int i = 0; i < 8; i++) {
       jumlah += analogReadMilliVolts(PIN_BATERAI);
     }
     return (uint16_t)(jumlah / 8 * FAKTOR_PEMBAGI);
   }

   // Memindai satu nama WiFi saja: channel router itu = channel Node 1 (Node 1 tersambung ke router).
   static uint8_t cariKanal() {
     int jumlah = WiFi.scanNetworks(false, false, false, 120, 0, NAMA_WIFI);
     uint8_t hasil = 0;
     for (int i = 0; i < jumlah; i++) {
       if (WiFi.SSID(i) == NAMA_WIFI) {
         hasil = WiFi.channel(i);
         break;
       }
     }
     WiFi.scanDelete();
     if (hasil == 0) {
       Serial.printf("WiFi \"%s\" tidak ditemukan: router mati, atau namanya salah tulis?\n", NAMA_WIFI);
     }
     return hasil;
   }

   static bool siapkanEspNow() {
     if (WiFi.setChannel(kanal) != ESP_OK) {
       Serial.printf("Channel %u ditolak ESP32. Router di channel 12 atau 13? Ubah router ke 1, 6, atau 11.\n", kanal);
       return false;
     }
     if (esp_now_init() != ESP_OK) {
       return false;
     }
     esp_now_register_send_cb(saatKirimSelesai);
     esp_now_peer_info_t peer = {};
     memcpy(peer.peer_addr, MAC_NODE1, 6);
     peer.channel = 0;  // 0 = channel radio saat ini (yang baru saja dipasang)
     peer.ifidx = WIFI_IF_STA;
     peer.encrypt = PAKAI_ENKRIPSI;
     if (PAKAI_ENKRIPSI) {  // Praktik 8: PMK dan LMK harus sama persis dengan milik Node 1
       esp_now_set_pmk((const uint8_t *)KUNCI_PMK);
       memcpy(peer.lmk, KUNCI_LMK, ESP_NOW_KEY_LEN);
     }
     return esp_now_add_peer(&peer) == ESP_OK;
   }

   static bool kirimSekali(const PaketNode2 &p) {
     kirimSelesai = false;
     if (esp_now_send(MAC_NODE1, (const uint8_t *)&p, sizeof(p)) != ESP_OK) {
       return false;
     }
     unsigned long mulai = millis();
     while (!kirimSelesai && millis() - mulai < 200) {  // jangan menunggu selamanya: Node 2 harus tetap bisa tidur
       delay(1);
     }
     return kirimSelesai && kirimBerhasil;
   }

   void setup() {
     pinMode(PIN_LED_BANGUN, OUTPUT);
     digitalWrite(PIN_LED_BANGUN, HIGH);
     pinMode(PIN_DAYA_TANAH, OUTPUT);
     digitalWrite(PIN_DAYA_TANAH, HIGH);  // 1. sensor tanah dinyalakan PALING AWAL: butuh waktu untuk tenang
     unsigned long nyalaTanah = millis();
     Serial.begin(115200);
     if (sesi == 0) {  // baru menyala dari mati: buku catatan baru
       sesi = (uint16_t)(esp_random() | 1);
       urutan = 0;
       uint8_t mac[6];
       esp_read_mac(mac, ESP_MAC_WIFI_STA);
       Serial.printf("\nNode 2 Kebun v%u.%u.%u, MAC %02X:%02X:%02X:%02X:%02X:%02X (device_id %02x%02x%02x%02x%02x%02x)\n",
                     VERSI_FW[0], VERSI_FW[1], VERSI_FW[2], mac[0], mac[1], mac[2], mac[3], mac[4], mac[5], mac[0],
                     mac[1], mac[2], mac[3], mac[4], mac[5]);
       Serial.printf("Salin ke MAC_NODE2 di konfigurasi.h Node 1: {0x%02X, 0x%02X, 0x%02X, 0x%02X, 0x%02X, 0x%02X}\n",
                     mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
     }
     urutan++;

     PaketNode2 p = {};
     p.tanda = PAKET_TANDA;
     p.versi = PAKET_VERSI;
     memcpy(p.fw, VERSI_FW, 3);
     p.sesi = sesi;
     p.urutan = urutan;
     p.jedaDetik = JEDA_DETIK;

     // 2. DS18B20 mulai mengukur (tanpa menunggu), sementara sensor lain dibaca.
     sensorSuhu.begin();
     sensorSuhu.setResolution(RESOLUSI_DS18B20);  // EEPROM sensor hanya ditulis kalau resolusinya berbeda
     sensorSuhu.setWaitForConversion(false);
     sensorSuhu.requestTemperatures();
     unsigned long mulaiDs = millis();

     // 3. BME280 dan baterai, selagi radio masih mati.
     bacaBme280(p);
     p.bateraiMv = bacaBateraiMv();

     // 4. Tunggu DS18B20 selesai, lalu baca sensor tanah dan padamkan lagi.
     while (!sensorSuhu.isConversionComplete() && millis() - mulaiDs < 800) {
       delay(5);
     }
     float suhuTanah = sensorSuhu.getTempCByIndex(0);  // -127 kalau sensor tidak menjawab
     p.suhuTanah = (suhuTanah == DEVICE_DISCONNECTED_C) ? NAN : suhuTanah;
     while (millis() - nyalaTanah < TENANG_TANAH_MS) {
       delay(1);
     }
     p.tanah = bacaTanah();
     digitalWrite(PIN_DAYA_TANAH, LOW);

     // 5. Radio sebentar saja: cari channel kalau perlu, kirim, tunggu ACK, coba lagi kalau gagal.
     WiFi.persistent(false);  // setelan WiFi cukup di RAM: memori flash tidak ditulis setiap bangun
     WiFi.mode(WIFI_STA);     // radio menyala TANPA WiFi.begin(): Node 2 tidak pernah tersambung ke router
     if (KANAL_TETAP != 0) {
       kanal = KANAL_TETAP;
     } else if (kanal == 0 || gagalBeruntun >= GAGAL_SEBELUM_PINDAI) {
       uint8_t baru = cariKanal();
       if (baru != 0) {
         kanal = baru;  // tidak ketemu (router mati)? Channel lama dipertahankan: Node 1 masih menunggu di sana
       }
       gagalBeruntun = 0;
     }
     bool terkirim = false;
     if (kanal != 0 && siapkanEspNow()) {
       for (int i = 1; i <= MAKS_PERCOBAAN && !terkirim; i++) {
         p.percobaan = i;
         terkirim = kirimSekali(p);
         if (!terkirim && i < MAKS_PERCOBAAN) {
           delay(i == 1 ? 100 : 2500);  // yang terakhir sekitar 2,6 detik sesudah yang pertama: lewati pindaian Node 1
         }
       }
     }
     gagalBeruntun = terkirim ? 0 : gagalBeruntun + 1;
     esp_now_deinit();
     WiFi.mode(WIFI_OFF);  // ESP-IDF: matikan WiFi sebelum tidur

     // 6. Laporan, lalu tidur.
     Serial.printf("#%lu %s (percobaan ke-%u), channel %u. Suhu %.1f C, lembap %.0f %%, %.1f hPa, tanah %.1f C / %d %%. "
                   "Bangun %lu ms.\n",
                   (unsigned long)urutan, terkirim ? "terkirim" : "GAGAL", p.percobaan, kanal, p.suhu, p.kelembapan,
                   p.tekanan, p.suhuTanah, p.tanah, millis());
     Serial.flush();
     digitalWrite(PIN_LED_BANGUN, LOW);
     esp_sleep_enable_timer_wakeup(JEDA_DETIK * 1000000ULL);
     esp_deep_sleep_start();
   }

   void loop() {
     // Tidak pernah dijalankan: Node 2 selalu mulai dari setup() setiap kali bangun.
   }
   ```

3. Buat tab baru **`paket-node2.h`** (**⋯ → New Tab**), lalu isi tab itu dengan file yang **sama persis** dengan milik Node 1: buka [`kode/node-2-kebun/paket-node2.h`](kode/node-2-kebun/paket-node2.h), klik **Copy raw file**, lalu tempel. Simpan (**Ctrl + S**).

Bagian-bagian `setup()` diberi nomor 1–6 di komentarnya, persis seperti urutan Konsep 4: sensor tanah dinyalakan paling awal, DS18B20 mulai mengukur, BME280 dan baterai dibaca, sensor tanah dibaca lalu dipadamkan, radio menyala sebentar, lalu tidur. Dibandingkan dengan sketsa-sketsa praktik, bagian yang benar-benar baru ada empat: **coba ulang** (`MAKS_PERCOBAAN`, Konsep 8), **kunci enkripsi** yang baru dipakai di Praktik 8, `KANAL_TETAP` (🚨), dan pembacaan baterai yang masih dimatikan (`ADA_PEMBAGI_BATERAI`, 🔬).

#### 4.2 Isi bagian "Ganti dengan milikmu"

| Konstanta | Isi | Dari mana |
| :--- | :--- | :--- |
| `MAC_NODE1` | alamat MAC papan Node 1, per dua digit, misalnya `{0xA4, 0xCF, 0x12, 0xE5, 0xB7, 0xC0}` | Kemenangan Cepat langkah 2 |
| `NAMA_WIFI` | nama WiFi rumah, **persis**, misalnya `"RumahKita"` | Praktik 1.3 |
| `KANAL_TETAP` | biarkan `0` (Node 2 mencari sendiri). Isi dengan nomor channel router hanya kalau rumahmu memakai beberapa titik WiFi bernama sama (WiFi *mesh* atau penguat sinyal), lihat 🚨 | Praktik 1.1 atau perintah `wifi` Node 1 |
| `TANAH_KERING`, `TANAH_BASAH` | angka kering dan basah sensor tanah ke-2 | Praktik 2.7 |
| `JEDA_DETIK` | **ubah sementara menjadi `60`** supaya hasilnya cepat terlihat dan siap untuk uji router di Praktik 6. Bagian ➕ mengembalikannya ke `300`. | — |

Di Praktik 2.7, angka 200 ms dan 400 ms sensor tanahmu berselisih lebih dari 20? Ubah juga `TENANG_TANAH_MS` (di bagian "Tetap") dari `300` menjadi `500`.

#### 4.3 Unggah dan baca kedua Serial Monitor

1. Pilih **DOIT ESP32 DEVKIT V1** dan port papan **Node 2**, lalu klik **Upload**. Firmware Node 2 hanya sekitar 940 ribu byte, masih muat di rak program bawaan.
2. Buka Serial Monitor Node 2. Saat papan baru menyala, Node 2 memperkenalkan diri, lalu laporan muncul setiap kali bangun (contoh; baris `ets …` dan `rst:0x5 (DEEPSLEEP_RESET)` di antara laporan, seperti di Praktik 1.3, tidak ikut dikutip):

   ```text
   Node 2 Kebun v1.0.0, MAC 24:6F:28:B1:C7:D4 (device_id 246f28b1c7d4)
   Salin ke MAC_NODE2 di konfigurasi.h Node 1: {0x24, 0x6F, 0x28, 0xB1, 0xC7, 0xD4}
   #1 terkirim (percobaan ke-1), channel 6. Suhu 29.4 C, lembap 78 %, 1008.6 hPa, tanah 27.5 C / 41 %. Bangun 2843 ms.
   #2 terkirim (percobaan ke-1), channel 6. Suhu 29.4 C, lembap 78 %, 1008.6 hPa, tanah 27.5 C / 41 %. Bangun 552 ms.
   ```

   Bangun pertama lebih lama karena memindai channel; bangun berikutnya sekitar setengah detik. Dua baris perkenalan hanya dicetak saat Node 2 menyala dari mati; kalau terlewat karena Serial Monitor baru dibuka, tekan **EN** di papan Node 2. Kalau `MAC_NODE2` di Node 1 belum sama dengan baris kedua ini, perbaiki dulu (Praktik 3.2), lalu unggah lagi Node 1.
3. Di Serial Monitor **Node 1** (contoh; baris bacaan sensor setiap 2 detik dan `Terbit telemetry` tidak ikut dikutip):

   ```text
   [00:14:31] INFO  Node 2: paket #1 diterima (percobaan ke-1, sinyal -47 dBm).
   [00:14:31] INFO  Node 2 ONLINE.
   [00:15:32] INFO  Node 2: paket #2 diterima (percobaan ke-1, sinyal -46 dBm).
   ```

4. Ketik `node2` di Serial Monitor Node 1 (contoh):

   ```text
   node2: device_id 246f28b1c7d4, online, channel radio 6, enkripsi mati
   node2: diterima 2, hilang 0, dobel 0, ditolak 0, dibuang 0
   node2: paket tiba 100.0 %
   node2: terbit 2, menunggu di rak 0 dari 96, tergusur 0
   node2: paket terakhir #2, 21 detik lalu, percobaan ke-1, sinyal -46 dBm, jeda 60 detik
   ```

#### 4.4 Lihat Node 2 di broker dengan MQTTX

1. Di MQTTX, pada sambungan **Gateway Pi** (Modul 12), tambahkan langganan `rpm/246f28b1c7d4/#` (**New Subscription**, seperti Modul 11; pakai `device_id` Node 2-mu).
2. Pesan `status` bertanda *retained* berisi `online` langsung muncul. Setiap kali Node 2 bangun, satu pesan `telemetry` menyusul (contoh):

   ```json
   {"ts":"2026-10-17T03:12:45Z","fw":"1.0.0","suhu":29.4,"kelembapan":78,"tekanan":1008.6,"suhu_tanah":27.5,"tanah":41}
   ```

   Kolom `baterai` tidak ada karena pembagi tegangan baterai belum dipasang (`ADA_PEMBAGI_BATERAI = false`). `fw` berisi versi **Node 2**, `1.0.0`, bukan `1.3.0` milik Node 1.

#### 4.5 Pemeriksa kontrak versi 1.1

Pemeriksa kontrak dari Modul 11 masih memakai kontrak 1.0. Jalankan dulu tanpa diubah supaya kamu melihat mengapa pemeriksa itu perlu diperbarui:

1. Di VS Code dengan folder `rumah-pintar-mini`, buka terminal (**Terminal → New Terminal**), masuk ke folder `alat` (`cd alat`), lalu jalankan `node pemeriksa-kontrak.js 192.168.1.37` (alamat gateway-mu). Tunggu sampai Node 2 bangun lagi.

   **Hasilnya** untuk pesan Node 2 (keluaran asli pemeriksa versi 1.0):

   ```text
   [23.04.13] rpm/246f28b1c7d4/telemetry  GAGAL
      - kolom "cahaya" tidak ada
      - kolom "gerak" tidak ada
      - kolom "level_air" tidak ada
      - kolom "tekanan" tidak ada di kontrak data
      - kolom "suhu_tanah" tidak ada di kontrak data
   ```

   Pemeriksa versi 1.0 mengira semua `telemetry` adalah milik Node 1. Tekan **Ctrl + C** untuk menghentikannya.
2. Buka `alat/pemeriksa-kontrak.js` di VS Code, pilih semua isinya, lalu ganti dengan versi 1.1 dari kurikulum: buka [`proyek-rumah-pintar-mini/alat/pemeriksa-kontrak.js`](../../proyek-rumah-pintar-mini/alat/pemeriksa-kontrak.js), klik **Copy raw file**, lalu tempel dan simpan (**Ctrl + S**). Perubahannya kecil: daftar kolom `telemetry` sekarang ada dua, untuk Node 1 dan Node 2, dan Node 2 dikenali dari kolom khasnya (`tekanan` atau `suhu_tanah`).
3. Jalankan lagi `node pemeriksa-kontrak.js 192.168.1.37`. **Hasilnya** (contoh, dipotong; `telemetry` Node 1 sebenarnya muncul setiap 10 detik):

   ```text
   Pemeriksa kontrak siap di broker 192.168.1.37:1883 (langganan rpm/#) — tekan Ctrl + C untuk berhenti.
   [10.31.02] rpm/a4cf12e5b7c0/status  LULUS  [retained]
   [10.31.02] rpm/246f28b1c7d4/status  LULUS  [retained]
   [10.31.05] rpm/a4cf12e5b7c0/telemetry  LULUS
   [10.31.38] rpm/246f28b1c7d4/telemetry  LULUS  (telemetry Node 2)
   ```

   Pemeriksa yang sama juga menangkap kesalahan khas Node 2: tekanan yang lupa dibagi 100 (`"tekanan" harus angka 300 sampai 1100 atau null, isinya 100860`) atau kolom Node 1 yang tersasar ke pesan Node 2 (`kolom "gerak" tidak ada di kontrak data`). Tekan **Ctrl + C** kalau sudah selesai.

#### 4.6 Node 2 pindah ke baterai

1. Cabut kabel USB papan Node 2.
2. Sambungkan lagi kabel VIN papan ke rel atas (+) kolom 29 dan kabel GND (deretan kiri, di atas VIN) ke rel atas (−) kolom 28, seperti Modul 9. Rel bawah 3,3 V ikut berlistrik karena regulator papan kini mendapat 5,0 V dari MT3608.
3. Lihat LED biru Node 2: menyala sebentar setiap 60 detik. Di Serial Monitor Node 1, paket Node 2 tetap masuk. Serial Monitor Node 2 sekarang sunyi karena USB-nya dicabut; jendela Node 1 dan perintah `node2` menjadi mata dan telingamu.

> ➡️ **Lanjut** ke [Praktik 5 — Kartu Kebun di Node-RED](#praktik-5--kartu-kebun-di-node-red-30-menit) tanpa kembali ke konsep.

### Praktik 5 — Kartu Kebun di Node-RED (30 menit)

> 🖥️ **Alat:** browser laptop dengan editor Node-RED (Modul 13), HP yang tersambung ke WiFi rumah, Node 1 v1.3.0, dan Node 2 v1.0.0 yang bangun setiap 60 detik. Konsep yang dipakai: 7.
>
> ⭐ **Wajib** — syarat lulus Modul 14 meminta data Node 2 tampil di Node-RED dengan `device_id` sendiri.
>
> 🖥️ **Jalur laptop dan jalur Wokwi:** caranya sama, di Node-RED laptopmu (Praktik 8 Modul 13). Di langkah 5.2, pilih **Server** yang sama dengan node `telemetry Node 1`-mu. Isi topiknya dengan `device_id` Node 2-mu (jalur laptop dengan papan asli) atau `device_id` Node 2 tiruan dari Praktik 3 (jalur Wokwi). Node 2 tiruan selalu mengirim `baterai` 3,92 V, jadi di jalur Wokwi baris **Baterai** di kartumu ikut terisi.

Di Modul 13 kamu sudah menyusun widget satu per satu. Kartu Kebun berisi sembilan belas node, jadi minggu ini kamu **mengimpornya** dari kurikulum, lalu menyambungkannya ke flow milikmu. Karena flow Modul 13-mu kamu susun sendiri, potongan ini belum mengenal pengaturan broker dan halaman dashboard-mu. Ada tiga hal kecil yang perlu kamu sambungkan sendiri, dan semuanya ditandai Node-RED dengan segitiga merah.

#### 5.1 Impor potongan flow Kebun

1. Buka [`kode/node-red-kebun.json`](kode/node-red-kebun.json) di GitHub, lalu klik ikon **Copy raw file**.
2. Di editor Node-RED, buka tab **Rumah Pintar Mini**, lalu gulir ruang kerja ke bawah sampai ada ruang kosong di bawah bagian 4 (`4 · Jawaban Node 1 (ack) …`).
3. Buka menu utama (ikon bergaris tiga di kanan atas) → **Import**, atau tekan **Ctrl + I**. Jendela `Import nodes` terbuka. Tempel (**Ctrl + V**) ke kotak teksnya, lalu klik **Import**.
4. Node-node hasil impor kini **menempel di penunjuk mouse**. Gerakkan mouse ke ruang kosong tadi, lalu klik sekali untuk meletakkannya. Muncul pemberitahuan `Imported:` dengan `18 nodes` dan `1 configuration node` (grup **Kebun**).

Perhatikan segitiga merah kecil di sudut beberapa node: tanda bahwa pengaturannya belum lengkap. Node-RED tetap mau melakukan **Deploy**, tetapi node bersegitiga merah tidak akan bekerja. Langkah 5.2–5.3 menghilangkan semua segitiga itu.

![Tiga tangkapan layar editor Node-RED 5.0.8 setelah potongan flow Kebun diimpor, diberi nomor. Panel 1, kiri: pemberitahuan Imported berisi 18 nodes dan 1 configuration node, dibingkai jingga; di bawahnya bagian 5 Kebun dengan node mqtt in telemetry Node 2 dan status Node 2, empat switch terbaca, change waktu bacaan (ms), debug lihat telemetry Node 2, serta sembilan widget: Suhu udara, Kelembapan udara, Tanah kebun, Suhu tanah, Bacaan terakhir, Tekanan udara, Baterai, grafik Suhu udara dan suhu tanah 24 jam, dan Node 2 (lewat Node 1). Segitiga merah kecil ada di sudut kanan atas kedua node MQTT dan kesembilan widget; beberapa dilingkari merah. Panel 2, kanan atas: bagian Properties node mqtt in telemetry Node 2, dengan daftar Server kosong bergaris merah dan isian Topic rpm/246f28b1c7d4/telemetry, keduanya ditandai; keterangan: pilih Mosquitto di gateway, lalu ganti device_id di Topic. Panel 3, kanan bawah: jendela Edit gauge node > Edit ui-group node dengan tombol Delete, Cancel, dan Update, isian Name Kebun, dan daftar Page kosong bergaris merah yang ditandai; keterangan: dari widget mana saja, klik pensil di sebelah Group, pilih Rumah [/dashboard/rumah], lalu Update.](aset/impor-kebun.png)

*Tangkapan layar asli Node-RED 5.0.8 (lisensi Apache 2.0) dari laptop penulis; judul, nomor, tanda, dan keterangan oleh penulis.*

#### 5.2 Sambungkan kedua node MQTT ke broker dan ke `device_id` Node 2-mu

1. Klik dua kali node **telemetry Node 2**. Daftar **Server** kosong dan bergaris merah: pilih **Mosquitto di gateway** (pengaturan broker dari Modul 13; namanya mungkin sedikit berbeda kalau dulu kamu menamainya lain). Jangan klik tombol **+** di sebelahnya; tombol itu membuat pengaturan broker kedua.
2. Di isian **Topic**, ganti `246f28b1c7d4` dengan `device_id` Node 2-mu (dari `catatan-modul14.md`) sehingga menjadi `rpm/<device_id Node 2-mu>/telemetry`. Klik **Done**.
3. Lakukan hal yang sama untuk node **status Node 2**: pilih **Server**, ganti `device_id` di isian **Topic**, lalu klik **Done**.

#### 5.3 Pasang grup Kebun di halaman Rumah

1. Klik dua kali widget mana saja di bagian 5, misalnya gauge **Suhu udara**. Baris **Group** bertuliskan `[] Kebun`: tanda kurung siku yang kosong berarti grup ini belum punya halaman.
2. Klik ikon pensil di sebelah baris **Group**. Jendela pengaturan grup terbuka dengan judul `Edit ui-group node`. Di daftar **Page** (kosong, bergaris merah), pilih **Rumah [/dashboard/rumah]**, lalu klik **Update**.
3. Kembali di jendela widget, klik **Done**. Segitiga merah di **kesembilan** widget hilang bersamaan karena kesembilannya memakai grup yang sama.
4. Klik **Deploy**. Pemberitahuan `Successfully deployed` muncul. Kalau ternyata masih ada segitiga merah, klik dua kali node itu dan lihat isian mana yang bergaris merah.

#### 5.4 Lihat kartu Kebun di HP

Buka dashboard di HP (`http://192.168.1.37:1880/dashboard/rumah`), lalu gulir ke bawah. Kartu **Kebun** muncul di bawah kartu **Grafik**. Kartu itu langsung terisi begitu Node 2 bangun berikutnya (paling lama sekitar satu menit). Masih kosong? Di editor Node-RED, klik tombol pudar di sisi kanan node debug `lihat telemetry Node 2` sampai berwarna hijau (potongan flow ini membawanya dalam keadaan mati, seperti debug yang kamu pudarkan di ➕ A Modul 13), lalu buka panel **debug** di sisi kanan: setiap kali Node 2 bangun, satu pesan muncul di sana. Panel yang tetap sunyi berarti **Server** atau **Topic** di 5.2 belum benar; lihat juga 🚨 "Node 1 menerima paket Node 2, tetapi tidak ada yang muncul di MQTTX atau Node-RED".

![Dua tangkapan layar kartu Kebun di dashboard Rumah, diambil di browser laptop selebar layar HP (412 piksel), masing-masing dibingkai sebagai HP, dengan lima penanda. HP kiri, awal kartu: penanda 1 di baris Node 2 (lewat Node 1) bertuliskan online, status yang diterbitkan Node 1; penanda 2 di baris Bacaan terakhir 18/10 21:33, jam WIB dari ts; penanda 3 di empat jarum setengah lingkaran: Suhu udara 24.2 derajat, Kelembapan udara 78 persen, Tanah kebun 36 persen, dan Suhu tanah 27.8 derajat. HP kanan, setelah digulir: penanda 4 di baris Tekanan udara 1009.1 hPa dan Baterai 3.92 V; penanda 5 di grafik Suhu udara dan suhu tanah 24 jam dengan garis biru suhu dan garis merah suhu_tanah, bergelombang siang dan malam, sumbu waktu 18, 04:00 sampai 20:00. Keterangan di kanan menjelaskan kelima penanda; data dari Node 2 tiruan di lab penulis. Di dashboard-mu, Baterai tertulis tidak diukur selama pembagi tegangan belum dipasang.](aset/hp-kebun.png)

*Tangkapan layar asli FlowFuse Dashboard 1.33.0 (lisensi Apache 2.0) dari browser laptop penulis yang dipersempit selebar layar HP, dengan data dari Node 2 tiruan; judul, bingkai HP, nomor, dan keterangan oleh penulis.*

Isi kartunya, dari atas:

| Widget | Asal angkanya | Catatan |
| :--- | :--- | :--- |
| **Node 2 (lewat Node 1)** | `rpm/<device_id Node 2>/status` | `online` atau `offline`, diterbitkan **Node 1** (Konsep 7). Lihat juga status Node 1 di kartu Sensor. |
| **Bacaan terakhir** | `ts` di dalam pesan | jam **WIB** dari `ts`, bukan jam pesan tiba. Di WITA atau WIT, klik dua kali widget ini dan ganti `"+0700"` di isian **Value** dengan `"+0800"` atau `"+0900"`. |
| **Suhu udara**, **Kelembapan udara**, **Tanah kebun**, **Suhu tanah** | `suhu`, `kelembapan`, `tanah`, `suhu_tanah` | setiap jarum dijaga node **switch** `… terbaca?` (aturan **is not null**): pesan dengan `null` tidak sampai ke jarum, sama seperti `DHT22 terbaca?` di Modul 13. |
| **Tekanan udara** | `tekanan` | teks dengan JSONata; `tidak terbaca` kalau `null`. |
| **Baterai** | `baterai` | `tidak diukur` selama pembagi tegangan baterai belum dipasang (🔬). Persen di jarum baterai hanya menipu (Modul 9), jadi ditampilkan sebagai volt. |
| **Suhu udara & suhu tanah (24 jam)** | `suhu` dan `suhu_tanah` | sumbu waktunya dari `ts` lewat node **change** `waktu bacaan (ms)`, jadi data susulan tergambar di jam kejadiannya (Konsep 7). Dengan Node 2 bangun setiap 60 detik, grafiknya terisi pelan-pelan. |

Klik dua kali node **change** `waktu bacaan (ms)`. Aturannya hanya satu, yaitu menyalin `ts` menjadi angka milidetik: `$toMillis(payload.ts)` disimpan di `msg.payload.waktu`. Lalu klik dua kali grafiknya: di bagian **Properties**, isian **X:** bertipe **key:** dan berisi `waktu`, bukan bertipe **timestamp**. Tipe **timestamp** berarti "waktu pesan tiba di Node-RED", yang di Konsep 7 menumpuk riwayat 24 jam ke dalam dua detik.

> ⬆️ **Selesai Praktik 3–5?** Kembali ke [Konsep 8](#8-keandalan-ack-coba-ulang-dan-menghitung-paket-hilang).

### Praktik 6 — Uji matikan router (70 menit)

> 🖥️ **Alat:** router WiFi rumahmu (colokan listriknya), papan Node 1 v1.3.0 tercolok ke laptop dengan Serial Monitor terbuka, Node 2 v1.0.0 di baterai dengan `JEDA_DETIK = 60` (Praktik 4), gateway Pi yang tetap menyala, terminal SSH ke Pi, jam, dan `catatan-modul14.md`. Konsep yang dipakai: 7–8.
>
> ⭐ **Wajib** — syarat lulus Modul 14 meminta ≥ 90 % paket Node 2 tiba saat router dimatikan, dan datanya muncul lagi di Pi saat router hidup.
>
> 🖥️ **Jalur laptop** (broker di laptop): laptopmu ikut kehilangan WiFi saat router mati, tetapi brokernya tetap berjalan di laptop. Jalankan perintah pencatat di langkah 6.1 di terminal laptop, tanpa `nohup` dan tanpa `&` di akhir, lalu biarkan jendelanya terbuka. Untuk membaca isi `kebun.log`, buka jendela terminal kedua di folder yang sama; Windows PowerShell tidak mengenal `tail`, jadi ganti `tail -n 3 kebun.log` dengan `Get-Content kebun.log -Tail 3`, dan `tail -n 35 kebun.log` di 6.4 dengan `Get-Content kebun.log -Tail 35`. Di 6.4, pencatat dihentikan dengan **Ctrl + C** di jendela pertama, bukan `kill`, dan baris `nohup: ignoring input` tidak ada. Pastikan juga alamat IP laptopmu dipesan di router (*DHCP reservation*, Modul 11): setelah router menyala ulang, alamat laptop bisa berganti, dan Node 1 tidak menemukan brokernya lagi. **Jalur Wokwi:** uji ini butuh papan asli; baca langkahnya dan perhatikan hasil contohnya.

Kenapa Pi dibiarkan tetap menyala walaupun router mati? Pi tersambung ke router lewat kabel LAN, tetapi broker dan Node-RED berjalan **di dalam Pi**. Selama router mati, tidak ada yang bisa menjangkau Pi, termasuk Node 1 dan laptopmu, tetapi isi Pi tetap bekerja. Begitu router hidup, semuanya tersambung lagi. Uji ini membuktikan dua hal: Node 1 **tetap mendengar** Node 2 selama router mati, dan bacaan yang tertahan **sampai juga ke Pi** dengan jam kejadiannya.

#### 6.1 Persiapan (10 menit)

1. Pastikan Node 2 sudah bangun setiap 60 detik (Praktik 4) dan channel router sudah dikunci (Praktik 1.5). Router dengan channel **Auto** bisa memilih channel lain saat dinyalakan lagi, dan dua paket sesudahnya hilang sebelum Node 2 menemukannya. Pastikan juga laptop tidak akan tidur selama sekitar satu jam: papan Node 1 mendapat listrik dari USB laptop, dan Node 1 yang *restart* kehilangan isi rak tunggunya. Terakhir, beri tahu penghuni rumah bahwa internet akan mati sekitar 30 menit.
2. **Di Pi** (terminal SSH), jalankan pencatat yang tetap hidup walaupun sambungan SSH-mu putus (ganti `device_id`-nya):

   ```bash
   nohup mosquitto_sub -h localhost -t "rpm/246f28b1c7d4/telemetry" -F "%I %p" > kebun.log 2>&1 &
   ```

   - `-h localhost`: berlangganan ke broker di Pi itu sendiri, yang tidak butuh router.
   - `-F "%I %p"`: setiap pesan ditulis sebagai **waktu tiba di Pi** (`%I`) diikuti **isi pesannya** (`%p`).
   - `> kebun.log 2>&1`: semuanya ditulis ke file `kebun.log`, bukan ke layar.
   - `nohup` dan `&` di akhir: perintah berjalan di latar belakang dan **tetap hidup walaupun jendela SSH tertutup**. Ini penting: SSH dari laptop ke Pi lewat router, jadi jendela SSH-mu akan putus begitu router dimatikan.

   **Hasilnya** (contoh): `[1] 4721`. Angka kedua adalah nomor proses pencatatnya; tulis di catatanmu.
3. Tunggu dua menit, lalu periksa: `tail -n 3 kebun.log`. **Hasilnya** (contoh):

   ```text
   nohup: ignoring input
   2026-10-18T10:12:33+0700 {"ts":"2026-10-18T03:12:33Z","fw":"1.0.0","suhu":29.6,"kelembapan":77,"tekanan":1008.5,"suhu_tanah":27.3,"tanah":41}
   2026-10-18T10:13:33+0700 {"ts":"2026-10-18T03:13:33Z","fw":"1.0.0","suhu":29.6,"kelembapan":77,"tekanan":1008.5,"suhu_tanah":27.3,"tanah":41}
   ```

   Baris `nohup: ignoring input` adalah catatan `nohup` sendiri; abaikan. Perhatikan dua jam di setiap baris: waktu tiba di Pi dalam WIB (`10:12:33+0700`), dan `ts` dalam UTC (`03:12:33Z`, sama dengan pukul 10.12.33 WIB). Saat router hidup, keduanya hampir sama.

#### 6.2 Matikan router selama 30 menit

1. Pilih jam yang mudah diingat, misalnya pukul 10.15. Tepat pada jam itu, **cabut colokan listrik router**, lalu langsung ketik `node2 nol` di Serial Monitor Node 1. Semua hitungan `node2` mulai dari nol tepat saat router padam. Tulis jamnya.
2. Dalam beberapa detik, Node 1 menyadari router hilang (contoh; baris bacaan sensor setiap 2 detik tidak ikut dikutip):

   ```text
   [01:02:11] ERROR WiFi PUTUS (alasan 200: BEACON_TIMEOUT). Node 1 tetap bekerja dan mencoba lagi setiap 60 detik.
   [01:02:11] ERROR MQTT ikut putus karena WiFi putus.
   [01:02:34] INFO  Node 2: paket #61 diterima (percobaan ke-1, sinyal -52 dBm).
   [01:03:13] INFO  Penjaga WiFi: 60 detik tanpa percobaan baru, mencoba menyambung lagi.
   [01:03:34] INFO  Node 2: paket #62 diterima (percobaan ke-1, sinyal -53 dBm).
   [01:04:15] INFO  Penjaga WiFi: 60 detik tanpa percobaan baru, mencoba menyambung lagi.
   [01:04:34] INFO  Node 2: paket #63 diterima (percobaan ke-1, sinyal -52 dBm).
   ```

   Paket Node 2 **tetap diterima** walaupun WiFi putus: ESP-NOW tidak butuh router. Sesekali tertulis `percobaan ke-2` atau `ke-3`: kiriman pertama Node 2 tidak mendapat ACK, misalnya karena Node 1 sedang memindai (beberapa detik setelah baris `Penjaga WiFi`) atau ada gangguan sesaat, lalu berhasil pada percobaan berikutnya (Konsep 8). Selama router mati, HP dan laptopmu juga tidak bisa menjangkau Pi, jadi dashboard tidak bisa dibuka; itu wajar. Di dalam Pi, broker menandai Node 1 `offline` sekitar 20 detik setelah router padam (surat wasiat Modul 11), dan setelah router hidup lagi, kartu Sensor mungkin masih menulis `offline` sebentar sampai Node 1 tersambung lagi. (Jalur laptop: dashboard tetap bisa dibuka di laptop sendiri lewat `http://localhost:1880/dashboard/rumah`.)
3. Kira-kira setiap 10 menit, ketik `wifi` dan `node2` (contoh setelah 20 menit, dipotong; baris `wifi: device_id …` dan dua baris `mqtt:` tidak dikutip):

   ```text
   wifi: PUTUS, alasan terakhir 201 (NO_AP_FOUND)
   wifi: channel radio 6, channel router 6 (0 = belum pernah tersambung)
   node2: device_id 246f28b1c7d4, online, channel radio 6, enkripsi mati
   node2: diterima 20, hilang 0, dobel 0, ditolak 0, dibuang 0
   node2: paket tiba 100.0 %
   node2: terbit 0, menunggu di rak 20 dari 96, tergusur 0
   node2: paket terakhir #80, 41 detik lalu, percobaan ke-1, sinyal -52 dBm, jeda 60 detik
   ```

   `channel radio 6, channel router 6`: di antara percobaan penjaga, radio Node 1 kembali ke channel router (Konsep 3). `menunggu di rak 20`: bacaan Node 2 tersimpan di rak tunggu, belum bisa terbit (Konsep 7).

#### 6.3 Hidupkan router lagi

1. Setelah 30 menit, pasang lagi colokan listrik router. Tulis jamnya.
2. Router butuh satu sampai tiga menit untuk siap. Penjaga Node 1 mencoba setiap 60 detik, jadi Node 1 tersambung paling lambat sekitar satu menit setelah router siap (contoh; baris bacaan sensor setiap 2 detik tidak ikut dikutip):

   ```text
   [01:34:11] INFO  Penjaga WiFi: 60 detik tanpa percobaan baru, mencoba menyambung lagi.
   [01:34:14] INFO  WiFi tersambung LAGI setelah 1923 detik: IP 192.168.1.23
   [01:34:15] INFO  MQTT tersambung ke broker 192.168.1.37:1883 dalam 38 ms, sebagai a4cf12e5b7c0
   ```

3. Begitu MQTT tersambung, Node 1 menerbitkan isi rak, tiga bacaan per putaran `loop()`; sekitar tiga puluh bacaan selesai dalam waktu kurang dari satu detik. Ketik `node2` (contoh):

   ```text
   node2: device_id 246f28b1c7d4, online, channel radio 6, enkripsi mati
   node2: diterima 32, hilang 1, dobel 0, ditolak 0, dibuang 0
   node2: paket tiba 97.0 %
   node2: terbit 32, menunggu di rak 0 dari 96, tergusur 0
   node2: paket terakhir #93, 12 detik lalu, percobaan ke-1, sinyal -52 dBm, jeda 60 detik
   ```

#### 6.4 Hitung hasilnya dengan jujur

1. **Persen paket tiba**, dari Node 1: angka `paket tiba` di `node2`. Angka itu dihitung dari **nomor urut** sejak `node2 nol`: diterima ÷ (diterima + hilang). Contoh di atas: 32 ÷ 33 = 97,0 %, lolos syarat ≥ 90 %. Kalau kamu baru mengetik `node2` beberapa menit setelah router hidup, angkanya ikut mencakup paket sesudahnya; itu tidak apa-apa, tetapi catat jamnya.
2. **Data sampai di Pi**, dari `kebun.log`. Masuk lagi ke Pi lewat SSH (jendela lamanya sudah putus), lalu tampilkan baris-baris yang tiba setelah router hidup: `tail -n 35 kebun.log`. **Hasilnya** (contoh, dipotong):

   ```text
   2026-10-18T10:14:34+0700 {"ts":"2026-10-18T03:14:34Z","fw":"1.0.0","suhu":29.7,…}
   2026-10-18T10:47:15+0700 {"ts":"2026-10-18T03:15:34Z","fw":"1.0.0","suhu":29.7,…}
   2026-10-18T10:47:15+0700 {"ts":"2026-10-18T03:16:34Z","fw":"1.0.0","suhu":29.8,…}
   2026-10-18T10:47:15+0700 {"ts":"2026-10-18T03:17:34Z","fw":"1.0.0","suhu":29.8,…}
   …
   2026-10-18T10:47:16+0700 {"ts":"2026-10-18T03:46:35Z","fw":"1.0.0","suhu":30.1,…}
   2026-10-18T10:47:35+0700 {"ts":"2026-10-18T03:47:35Z","fw":"1.0.0","suhu":30.1,…}
   ```

   Lihat baris-baris dengan waktu tiba `10:47:15`: semuanya **tiba** di Pi sekaligus setelah router hidup, tetapi `ts`-nya berurutan per menit selama router mati (`03:15:34Z` = 10.15 WIB, dan seterusnya). Itulah bukti rak tunggu dan `ts` mundur. Hitung baris yang `ts`-nya berada di antara jam padam dan jam hidup: jumlahnya harus sama dengan paket yang diterima Node 1 selama router mati. Kurang satu masih wajar: bacaan yang tiba dalam beberapa detik pertama, sebelum Node 1 menulis `WiFi PUTUS`, sudah telanjur dikirim ke sambungan MQTT yang sebenarnya sudah mati.
3. **Data tampil di Node-RED**: grafik kartu Kebun tersambung tanpa celah di jam-jam router mati karena sumbu waktunya memakai `ts`.
4. Hentikan pencatat. **Di Pi**: `kill 4721` (nomor proses dari langkah 6.1). Lupa nomornya? `pgrep -af mosquitto_sub` menampilkan nomor dan perintahnya.
5. Tulis di `catatan-modul14.md`: jam padam, jam hidup, isi `node2` terakhir, dan persen paket tiba. Inilah buktimu untuk ✅.

Hasilmu di bawah 90 %? Lihat 🚨 "Uji router: paket tiba di bawah 90 %".

> ⬆️ **Selesai Praktik 6?** Kembali ke [Konsep 9](#9-umur-baterai-yang-menentukan-adalah-saat-tidur).

### Praktik 7 — Ukur arus dan hitung umur baterai (50 menit)

> 🖥️ **Alat:** **Arduino IDE** (dua jendela), INA219 dan rangkaian ukur dari [Modul 9 Praktik 6](../../fase-1-esp32-embedded/modul-09-catu-daya-dan-hemat-daya/README.md#praktik-6--node-1-jadi-alat-ukur-arus-ina219-45-menit), papan Node 1 (USB ke laptop; MB102 meja kerja Node 1 dimatikan selama mengukur, seperti Modul 9), Node 2 di baterai, satu jumper jantan–jantan cadangan, dan `catatan-modul14.md`. Konsep yang dipakai: 9.
>
> 🖥️ **Jalur Wokwi:** tidak tersedia; Wokwi belum bisa mengukur arus dan menjalankan tidur dalam. Baca langkahnya, lalu kerjakan hitungan 7.4 dengan angka contoh.

Di Modul 9, papan Node 1 menjadi alat ukur arus untuk papan kedua. Minggu ini caranya sama, dengan satu tambahan penting: **papan Node 1 harus tetap mendengar ESP-NOW**. Kalau tidak, kiriman Node 2 tidak mendapat ACK, Node 2 mencoba lagi dan mencari channel, dan yang terukur adalah bangun yang terburuk, bukan bangun yang biasa.

#### 7.1 Siapkan Node 2 dan rangkaian ukur

1. **Jadwal pendek untuk mengukur.** Lepas kabel VIN dan GND Node 2 dari breadboard mini, colokkan USB-nya, lalu di `node-2-kebun.ino` ubah `JEDA_DETIK = 60` menjadi `JEDA_DETIK = 30`. Unggah, lalu cabut lagi USB-nya. Dengan jadwal 30 detik, baris ringkasan muncul setiap setengah menit; hasilnya nanti dihitung ulang untuk jadwal 5 menit.
2. **Pasang INA219** tanpa listrik di meja kerja Node 1: matikan MB102, lalu cabut USB papan Node 1 (aturan keselamatan Modul 5, seperti Modul 9 Praktik 6.2). Setelah itu, pasang persis seperti Modul 9 Praktik 6: empat kabel I2C-nya ke meja kerja Node 1 ([6.2](../../fase-1-esp32-embedded/modul-09-catu-daya-dan-hemat-daya/README.md#62-pasang-ina219-di-bus-i2c-node-1)), dan kaki **VIN+**/**VIN−**-nya disisipkan di kabel 5 V papan Node 2 ([6.3](../../fase-1-esp32-embedded/modul-09-catu-daya-dan-hemat-daya/README.md#63-sisipkan-ina219-di-jalur-5-v-papan-kedua)): VIN+ dari rel atas (+) kolom 29 dan VIN− ke 27a. Kabel VIN papan Node 2 nanti masuk ke 27e, tetapi seperti di Modul 9, kabel itu baru dicolokkan setelah sketsa ukur berjalan (7.2 langkah 3). GND papan Node 2 kembali ke rel atas (−) kolom 28, dan kabel jantan–jantan hitam GND bersama menyambung rel bawah (−) meja kerja Node 1 kolom 30 ke rel **atas** (−) breadboard mini, misalnya kolom 9, bukan ke rel bawah breadboard mini. Seperti di Modul 9, tidak ada rel (+) breadboard mini yang disambung ke meja kerja Node 1. Sensor Node 2 dan rel bawahnya tidak berubah.

#### 7.2 Sketsa ukur arus yang juga mendengar ESP-NOW

1. Di jendela papan Node 1, buka **File → New Sketch**, hapus isinya, lalu salin isi [`kode/modul14_ukur_arus/modul14_ukur_arus.ino`](kode/modul14_ukur_arus/modul14_ukur_arus.ino) (buka di GitHub, klik **Copy raw file**, lalu tempel). Simpan sebagai `modul14_ukur_arus` di folder `modul-14` repositori `belajar-iot`.

   Isinya adalah sketsa `modul09_ukur_arus` dari Modul 9, ditambah beberapa bagian untuk ESP-NOW. Empat yang terpenting:

   ```cpp
   #include <WiFi.h>
   #include <esp_now.h>  // Modul 14: papan ini juga "mendengar" Node 2 supaya kirimannya mendapat ACK

   volatile uint32_t paketNode2 = 0;  // Modul 14: paket ESP-NOW yang diterima selama mengukur

   // Dipanggil petugas WiFi setiap kali paket ESP-NOW tiba: cukup menghitung, tanpa Serial.
   void saatTerimaEspNow(const esp_now_recv_info_t* info, const uint8_t* data, int panjang) {
     paketNode2 = paketNode2 + 1;  // bukan ++: C++20 memperingatkan ++ pada volatile
   }

   // ... di setup():
     WiFi.setSleep(false);
     WiFi.mode(WIFI_STA);
     WiFi.begin();  // WiFi rumah yang tersimpan sejak portal Modul 10: radio pindah ke channel router, sama dengan Node 2
     if (esp_now_init() == ESP_OK) {
       esp_now_register_recv_cb(saatTerimaEspNow);
     }
   ```

   `WiFi.begin()` tanpa isi memakai WiFi rumah yang tersimpan di papan Node 1, jadi radionya berada di channel router, channel yang dipakai Node 2. Dengan ESP-NOW yang menyala di channel itu, kiriman Node 2 dibalas ACK seperti biasa, dan *callback*-nya cukup menghitung paket. Ringkasan siklusnya juga mendapat satu baris baru: muatan satu kali bangun dan jumlah paket Node 2 yang diterima.
2. Colokkan lagi USB papan Node 1 (MB102 tetap mati), pilih **DOIT ESP32 DEVKIT V1** dan port papan **Node 1**, lalu klik **Upload**. Selama mengukur, firmware Node 1 tidak berjalan, jadi dashboard menulis Node 1 `offline`.
3. Setelah unggahan selesai, buka **Serial Monitor** papan Node 1 (115200 baud). Baris pertamanya harus `Praktik 7 - alat ukur arus INA219 siap…`; kalau terlewat karena Serial Monitor baru terbuka, tekan **EN** papan Node 1 sekarang, selagi Node 2 masih padam. Setelah itu, colokkan kabel VIN papan Node 2 ke **27e**. Node 2 menyala dari baterai, dan arusnya kini lewat INA219.

#### 7.3 Baca hasilnya

**Hasilnya** di Serial Monitor papan Node 1 (contoh; setiap detik muncul satu baris, dan setiap kali Node 2 bangun lagi, muncul ringkasan siklus sebelumnya):

```text
Praktik 7 - alat ukur arus INA219 siap, juga mendengar ESP-NOW. Ambang bangun: 20 mA.
…
[  104 s]   4.93 mA (terkecil 4.80, terbesar 5.10)  5.01 V  tidur
SIKLUS: bangun 0.62 detik, rata-rata 78.4 mA | tidur 29.91 detik, rata-rata 4.95 mA | rata-rata siklus 6.44 mA
        muatan bangun 49 mA.detik | paket Node 2 diterima sejauh ini: 3
[  105 s]  50.94 mA (terkecil 4.85, terbesar 248.30)  4.97 V  BANGUN
[  106 s]   4.95 mA (terkecil 4.80, terbesar 5.15)  5.01 V  tidur
```

Tunggu tiga baris `SIKLUS`, lalu tulis angka dari baris **terakhir** di catatanmu: lama **bangun**, rata-rata arus **bangun**, dan rata-rata arus **tidur**. Baris pertama meringkas bangun pertama Node 2 setelah listriknya tersambung lagi, yang ikut memindai channel, jadi angkanya jauh lebih besar. Angka `terbesar 248.30` di detik bangun adalah semburan saat radio memancar, dan `paket Node 2 diterima sejauh ini` membuktikan Node 2 mendapat ACK. Kalau angkanya tetap 0, lihat 🚨.

#### 7.4 Hitung umur baterai untuk jadwal 5 menit

Rumusnya sama dengan Modul 9, dengan satu langkah tambahan: hasil ukur dengan jadwal 30 detik dipakai untuk menghitung jadwal 300 detik. Dengan angka contoh di atas:

| Langkah | Rumus | Contoh |
| :---: | :--- | :--- |
| 0 | muatan satu kali bangun = lama bangun × arus bangun | 0,62 detik × 78,4 mA ≈ 48,6 mA·detik |
| 1 | rata-rata sisi 5 V untuk jadwal 300 detik = (muatan bangun + arus tidur × (300 − lama bangun)) ÷ 300 | (48,6 + 4,95 × 299,38) ÷ 300 ≈ 5,10 mA |
| 2 | arus di sisi baterai = rata-rata sisi 5 V × 1,6 (MT3608, Modul 9) | 5,10 × 1,6 ≈ 8,16 mA |
| 3 | kapasitas terpakai = kapasitas tertulis × 0,8 | 2.500 × 0,8 = 2.000 mAh |
| 4 | umur = kapasitas terpakai ÷ arus sisi baterai | 2.000 ÷ 8,16 ≈ 245 jam ≈ **10 hari** |

Hasilmu sekitar satu sampai satu setengah minggu? Hasil itu cocok dengan Konsep 9. Bandingkan juga muatan bangun dengan muatan tidur dalam satu siklus 5 menit: 48,6 mA·detik dibandingkan dengan 4,95 × 299,38 ≈ 1.482 mA·detik. Tidurlah yang menentukan.

#### 7.5 Bukti dengan angka: sensor tanah di 3V3 (10 menit, sangat disarankan)

1. Cabut dulu kabel VIN papan Node 2 dari 27e (Node 2 padam; aturan keselamatan Modul 5). Cabut ujung kabel **VCC** sensor tanah dari kaki D32 papan Node 2. Tancapkan jumper jantan–jantan cadangan ke ujung kabel itu, lalu tancapkan ujung lainnya ke **rel bawah (+)** (3,3 V), misalnya kolom 18. Colokkan lagi kabel VIN ke 27e. Sensor tanah sekarang menyala terus, seperti di Node 1.
2. Tunggu tiga baris `SIKLUS`, lalu pakai yang terakhir. Yang pertama muncul begitu VIN dicolokkan lagi dan masih meringkas siklus lama, termasuk waktu Node 2 padam; yang kedua ikut memindai channel karena Node 2 baru menyala lagi. **Hasilnya** (contoh):

   ```text
   SIKLUS: bangun 0.62 detik, rata-rata 83.1 mA | tidur 29.91 detik, rata-rata 9.87 mA | rata-rata siklus 11.36 mA
           muatan bangun 52 mA.detik | paket Node 2 diterima sejauh ini: 9
   ```

   Arus tidur naik sekitar 5 mA, hampir dua kali lipat. Hitung ulang langkah 1–4 dengan angka ini: umurnya tinggal sekitar **lima hari**.
3. Cabut lagi kabel VIN papan Node 2 dari 27e, kembalikan ujung kabel VCC sensor tanah ke kaki **D32**, simpan jumpernya, lalu colokkan lagi VIN ke 27e.

#### 7.6 Kembalikan semuanya

1. Cabut USB papan Node 1 (MB102 masih mati). Cabut kabel VIN papan Node 2 dari 27e (Node 2 padam), lalu lepas INA219: kabel VIN+ dan VIN− dari breadboard mini, keempat kabel I2C dari meja kerja Node 1, dan kabel GND bersama (simpan INA219-nya). Terakhir, colokkan kabel VIN papan Node 2 ke rel atas (+) kolom 29, lubang yang baru ditinggalkan kabel VIN+ INA219, seperti ➕ A Modul 9.
2. Colokkan lagi USB papan Node 1, lalu **unggah lagi Node 1 v1.3.0** (**ESP32 Dev Module**, **Minimal SPIFFS**, **DIO**). Nyalakan MB102 (modul microSD beregulator: tekan **EN** di papan Node 1 sesudahnya, seperti Modul 12). Dashboard kembali menulis Node 1 `online`.
3. Biarkan `JEDA_DETIK` Node 2 di `30` dulu; Praktik 8 mengunggah Node 2 lagi, dan bagian ➕ mengembalikannya ke `300`.

> ⬆️ **Selesai Praktik 7?** Kembali ke [Konsep 10](#10-keamanan-enkripsi-esp-now-dan-rahasia-yang-tidak-disiarkan).

### Praktik 8 — Enkripsi ESP-NOW (30 menit)

> 🖥️ **Alat:** **GitHub Desktop** dengan repositori `rumah-pintar-mini`, **Arduino IDE** dengan dua jendela (`node-1-rumah.ino` dan `node-2-kebun.ino`), papan Node 1 dan papan Node 2 tercolok ke laptop (kabel VIN dan GND Node 2 dilepas dari rangkaian baterai), dan pengelola kata sandi atau catatan pribadimu (bukan catatan modul). Konsep yang dipakai: 10.
>
> 🖥️ **Jalur Wokwi:** Node 1 di Wokwi bisa dikompilasi dengan `kunci.h` (langkah 8.3), tetapi Node 2 tiruan tidak lewat radio, jadi enkripsinya tidak bisa diuji. Kerjakan 8.1–8.3 untuk berlatih menjaga rahasia, lalu baca sisanya.

Firmware Node 1 v1.3.0 dan Node 2 v1.0.0 sudah siap dienkripsi. Selama file **`kunci.h`** belum ada, keduanya berjalan tanpa enkripsi. Begitu `kunci.h` dibuat di kedua folder dengan isi yang sama, ESP-NOW terkunci.

#### 8.1 Pasang penjaga `.gitignore` dulu

Sama seperti `secrets.h` di Modul 10, penjaganya dipasang **sebelum** filenya dibuat supaya `kunci.h` tidak pernah sempat ikut di-*commit*. Bedanya, kali ini penjaganya dipasang di repositori `rumah-pintar-mini`, bukan `belajar-iot`.

1. Di GitHub Desktop, pilih repositori **`rumah-pintar-mini`**.
2. Buka menu **Repository → Repository settings…** (macOS: **Repository Settings…**), lalu pilih tab **Ignored files** (macOS: **Ignored Files**). Kotak teksnya kemungkinan masih kosong karena repositori ini dibuat tanpa `.gitignore` di Modul 3.
3. Tulis `kunci.h` di kotak teks itu (kalau sudah ada isinya, tambahkan di baris paling bawah), lalu klik **Save**.
4. Daftar **Changes** sekarang berisi `.gitignore`, ditambah file-file yang kamu ubah di Praktik 3–4 (firmware Node 1 dan Node 2, serta `alat/pemeriksa-kontrak.js`). *Commit* kali ini hanya untuk `.gitignore`: klik kotak centang di atas daftar sampai semua centang hilang, lalu centang `.gitignore` saja. Isi **Summary** dengan `Abaikan kunci.h (Modul 14)`, klik **Commit … to main**, lalu **Push origin**. File-file lainnya tetap menunggu di **Changes** dan di-*commit* bersama di ➕ E.

#### 8.2 Buat dua kunci 16 huruf

Buat dua deret **tepat 16** huruf dan angka, berbeda satu sama lain, misalnya dengan pembuat kata sandi di pengelola kata sandimu (pilih panjang 16, hanya huruf dan angka, tanpa simbol). Satu untuk **PMK**, satu untuk **LMK** (Konsep 10). Simpan keduanya di pengelola kata sandi atau catatan pribadimu, **bukan** di `catatan-modul14.md` dan bukan di repositori.

#### 8.3 Buat `kunci.h` di kedua folder firmware

1. Di jendela `node-1-rumah`, buat tab baru (**⋯ → New Tab**) bernama **`kunci.h`**, lalu isi dengan teks ini. Ganti kedua deret contohnya dengan kuncimu, tetap di dalam petik ganda:

   ```cpp
   // kunci.h - kunci enkripsi ESP-NOW (Modul 14, Praktik 8). TIDAK ikut ke GitHub: namanya ada di .gitignore.
   // Isinya harus SAMA PERSIS di folder node-1-rumah dan node-2-kebun.
   #pragma once
   const bool PAKAI_ENKRIPSI = true;
   const char KUNCI_PMK[] = "GantiDengan16Hrf";  // tepat 16 huruf/angka
   const char KUNCI_LMK[] = "GantiJuga16Huruf";  // tepat 16 huruf/angka
   ```

2. Simpan (**Ctrl + S**). Di jendela `node-2-kebun`, buat tab **`kunci.h`** dengan isi **yang sama persis**, lalu simpan.
3. Buat juga tab **`kunci.contoh.h`** di kedua jendela, lalu isi dengan [`kode/node-1-rumah/kunci.contoh.h`](kode/node-1-rumah/kunci.contoh.h) (buka di GitHub, klik **Copy raw file**, lalu tempel). Isinya mirip `kunci.h`, tetapi dengan `PAKAI_ENKRIPSI = false` dan kunci contoh. Tidak ada kode yang memakai file ini. Ia boleh ikut ke GitHub dan berguna sebagai pengingat: kalau suatu hari kamu menyalin proyek ke laptop lain, kamu tahu file apa yang harus dibuat.

Panjang kuncimu bukan 16 huruf? Arduino IDE menolak mengompilasi dan menulis (keluaran asli, alamat foldernya dipotong):

```text
jembatan.cpp:22:31: error: static assertion failed: KUNCI_PMK di kunci.h harus tepat 16 huruf/angka
```

#### 8.4 Unggah Node 1, lalu Node 2

1. Unggah **Node 1** lebih dulu (**ESP32 Dev Module**, **Minimal SPIFFS**, **DIO**). Di antara baris-baris awalnya, Serial Monitor Node 1 menulis (contoh, dipotong):

   ```text
   [00:00:02] INFO  Jembatan Node 2 siap: mendengar ESP-NOW dari 246f28b1c7d4, enkripsi nyala.
   ```

2. Node 2 masih menjalankan firmware **tanpa** kunci. Tunggu satu menit, lalu ketik `node2` di Serial Monitor Node 1: angka `diterima` **tetap 0**, dan baris pertamanya masih `belum terdengar` (Node 1 baru saja *restart* karena diunggah, jadi hitungannya mulai dari nol). Node 1 yang sudah mendaftarkan Node 2 sebagai pasangan berkunci hanya mau menerima paket berkunci dari alamat itu. Persis inilah yang menghalangi peniru yang tidak tahu kuncinya.
3. Lepas kabel VIN dan GND papan Node 2 dari breadboard mini, baru colokkan USB-nya ke laptop (aturan aman 1). Unggah **Node 2** (**DOIT ESP32 DEVKIT V1**). Begitu Node 2 menyala lagi, Serial Monitor Node 1 menulis (contoh; baris bacaan sensor setiap 2 detik dan `Terbit telemetry` tidak ikut dikutip):

   ```text
   [00:03:41] INFO  Node 2: paket #1 diterima (percobaan ke-1, sinyal -47 dBm).
   [00:03:41] INFO  Node 2 ONLINE.
   ```

   Ketik `node2`: baris pertamanya menulis `enkripsi nyala`, dan angka `diterima` kembali bertambah setiap kali Node 2 bangun.

#### 8.5 Uji kunci yang keliru satu huruf

1. Di `kunci.h` milik **Node 2** saja, ganti satu huruf `KUNCI_LMK`, lalu unggah ke Node 2.
2. Perhatikan Serial Monitor **Node 1**: tidak ada lagi baris `Node 2: paket … diterima`, dan perintah `node2` menunjukkan angka `diterima` yang berhenti bertambah. Tidak ada pesan tentang kunci yang salah: paket yang kuncinya salah dibuang begitu saja (Konsep 10). Sekitar 2,5 menit kemudian (3 × jadwal 30 detik + 1 menit), Node 1 hanya menulis `ERROR Node 2 OFFLINE: tidak ada paket selama 150 detik.` Bagi Node 1, Node 2 seolah-olah diam.
3. Perhatikan juga Serial Monitor **Node 2**. Laporannya kemungkinan tetap `terkirim` karena ACK dikirim radio Node 1 begitu bingkainya tiba, sebelum isinya dibuka (Konsep 2). Jadi, bukti yang bisa dipercaya hanyalah hitungan di Node 1.
4. Kembalikan huruf itu, unggah lagi Node 2, dan pastikan Node 1 kembali menulis `Node 2: paket #… diterima`.
5. Biarkan Node 2 tetap tercolok USB. Bagian ➕ A mengunggahnya sekali lagi dengan jadwal 5 menit, lalu memasangnya ke baterai untuk seterusnya.

#### 8.6 Pastikan `kunci.h` tidak ikut ke GitHub

Buka GitHub Desktop. Daftar **Changes** boleh berisi `kunci.contoh.h` dan file firmware lain yang kamu ubah, tetapi **tidak boleh** berisi `kunci.h`. Kalau `kunci.h` muncul, jangan di-*commit*: periksa lagi baris `kunci.h` di **Ignored files** (langkah 8.1). Semua perubahan Modul 14 di-*commit* bersama di bagian ➕ E.

> ➡️ **Selesai Praktik 8?** Kerjakan [🧩 Tantangan mandiri](#-tantangan-mandiri) (minimal Tingkat 1), lalu [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini).

---

## 🚨 Kalau Tidak Jalan?

Banyak tutorial ESP-NOW di internet ditulis untuk paket esp32 2.x. Kalau sebuah tutorial memakai cara di kolom kiri, terjemahkan ke cara minggu ini:

| Tutorial lama | Cara sekarang (modul ini, paket esp32 3.3) |
| :--- | :--- |
| *callback* terima `OnDataRecv(const uint8_t *mac, const uint8_t *incomingData, int len)` | `(const esp_now_recv_info_t *info, const uint8_t *data, int len)`; alamat pengirim ada di `info->src_addr` (Konsep 6) |
| *callback* kirim `OnDataSent(const uint8_t *mac_addr, esp_now_send_status_t status)` | `(const esp_now_send_info_t *info, esp_now_send_status_t status)` |
| `esp_now_register_send_cb(esp_now_send_cb_t(OnDataSent))` (dipaksa dengan *cast*) | tanpa *cast*: ganti bentuk fungsinya (Konsep 6) |
| `Serial.print()` di dalam *callback* | titip ke antrean, cetak di `loop()` (Konsep 6) |
| `WiFi.macAddress()` dipanggil sebelum `WiFi.mode()` | hasilnya `00:00:00:00:00:00`; pakai `esp_read_mac(mac, ESP_MAC_WIFI_STA)` seperti sketsa Kemenangan Cepat, yang bisa dipanggil kapan saja |
| `esp_now_peer_info_t peerInfo;` lalu beberapa kolom diisi | `esp_now_peer_info_t peer = {};` supaya semua kolom dinolkan dulu, lalu `peer.ifidx = WIFI_IF_STA;` |
| `struct struct_message { … }` tanpa `packed` | `struct __attribute__((packed)) …` beserta `static_assert` ukurannya (Konsep 5) |
| pengirim memakai channel tebakan (sering channel 1) | pengirim mencari channel router dengan memindai nama WiFi (Konsep 3) |

Bagian di bawah ini dilipat; klik judulnya untuk membuka.

<details>
<summary><b>Kompilasi gagal: <code>invalid conversion from 'void (*)(const uint8_t*, …)' … to 'esp_now_send_cb_t'</code></b></summary>

- Kamu memakai kode dari tutorial lama. Ganti bentuk *callback* sesuai baris terakhir tabel di [Konsep 6](#6-callback-cara-paket-esp32-3x-titip-di-kotak-surat-olah-di-loop). Jangan menambalnya dengan *cast*.
- Kodemu sudah persis seperti modul ini, tetapi error-nya menyebut `esp_now_send_info_t` atau `esp_now_recv_info_t`? Berarti paket esp32 di Arduino IDE-mu masih versi lama yang belum mengenal nama-nama itu. Buka **Boards Manager**, cari `esp32`, lalu pasang **3.3.12** ([🧰](#-yang-perlu-disiapkan)).

</details>

<details>
<summary><b>Node 2 menulis <code>GAGAL</code> terus</b></summary>

`GAGAL` berarti radio Node 1 tidak membalas ACK dalam tiga kali percobaan. Periksa satu per satu:

1. **Papan Node 1 menyala dan menjalankan program yang tersambung ke WiFi?** Selama papan Node 1 menjalankan sketsa lain yang tidak tersambung ke router, radionya diam di channel 1.
2. **Channel-nya sama?** Bandingkan angka `channel` di laporan Node 2 dengan `channel router` dari perintah `wifi` di Serial Monitor Node 1. Kalau berbeda, tekan **EN** di papan Node 2: memori RTC-nya kosong, dan Node 2 memindai lagi.
3. **`MAC_NODE1` benar?** Isinya harus alamat MAC papan Node 1 dari Kemenangan Cepat langkah 2, yaitu `device_id` Node 1 (`a4cf12e5b7c0` menjadi `{0xA4, 0xCF, 0x12, 0xE5, 0xB7, 0xC0}`). Satu digit salah saja, paketnya terbang ke alamat yang tidak ada.
4. **Terlalu jauh?** Dekatkan kedua papan, lalu lihat angka `sinyal` di log Node 1. Sekitar −90 dBm sudah rawan.
5. **Masih gagal?** Isi `KANAL_TETAP` di Node 2 dengan angka `channel router` Node 1 untuk sementara. Kalau dengan cara itu berhasil, masalahnya ada di pencarian channel; lihat dua bagian berikut.

</details>

<details>
<summary><b>Node 2: <code>WiFi "…" tidak ditemukan: router mati, atau namanya salah tulis?</code></b></summary>

- `NAMA_WIFI` harus **persis** sama dengan nama WiFi rumahmu, termasuk huruf besar-kecil, spasi, dan tanda baca. Salin dari daftar WiFi di HP-mu.
- Routermu punya dua nama, misalnya `RumahKita` dan `RumahKita_5G`? Pakai nama yang **2,4 GHz**. ESP32 tidak bisa melihat WiFi 5 GHz (Modul 10).
- Nama WiFi-mu disembunyikan (*hidden SSID*)? Pemindaian modul ini tidak menemukannya. Isi `KANAL_TETAP` dengan channel router (perintah `wifi` di Node 1), dan kunci channel router supaya tidak berubah (Praktik 1.5).
- Router sedang mati? Itu wajar: Node 2 tetap memakai channel lamanya dan mencoba lagi nanti.

</details>

<details>
<summary><b>Rumah dengan beberapa titik WiFi bernama sama (WiFi <i>mesh</i> atau penguat sinyal)</b></summary>

Pemindaian Node 2 mengambil titik WiFi pertama yang ditemukan dengan nama itu. Kalau rumahmu memakai WiFi *mesh* atau penguat sinyal, titik itu bisa berada di channel yang berbeda dari titik tempat Node 1 tersambung. Gejalanya: `GAGAL` terus, padahal angka `channel` di laporan Node 2 terlihat wajar.

1. Ketik `wifi` di Serial Monitor Node 1, lalu catat `channel router`.
2. Isi `KANAL_TETAP` di Node 2 dengan angka itu, lalu unggah lagi Node 2.
3. Sistem *mesh* bisa memindahkan Node 1 ke titik lain, dan channel-nya ikut berubah. Kalau aplikasi router *mesh*-mu bisa mengunci channel 2,4 GHz, kunci di 1, 6, atau 11.

</details>

<details>
<summary><b>Node 2: <code>Channel 12 ditolak ESP32. Router di channel 12 atau 13? …</code></b></summary>

ESP32 yang tidak tersambung ke router hanya boleh memakai channel 1–11 (Konsep 3). Ubah channel router menjadi 1, 6, atau 11 (Praktik 1.5). Kalau router itu tidak bisa kamu ubah, Node 2 tidak bisa berbicara dengan Node 1 selama Node 1 tersambung ke router itu.

</details>

<details>
<summary><b>Node 1: <code>ESP-NOW dari … ditolak: bukan MAC_NODE2 di konfigurasi.h.</code></b></summary>

- Alamat yang tertulis di pesan itu milik Node 2-mu? Berarti `MAC_NODE2` di `konfigurasi.h` belum diganti, atau ada digit yang salah. Salin baris `Salin ke MAC_NODE2 di konfigurasi.h Node 1: {…}` dari Serial Monitor Node 2 (lepas dulu kabel VIN dan GND-nya, colokkan USB, lalu tekan **EN** di papan Node 2 supaya baris itu muncul lagi), lalu unggah lagi Node 1.
- Alamatnya asing? Paket siaran sudah dibuang lebih dulu (hitungan `dibuang`), jadi paket ini dikirim langsung ke alamat Node 1. Biasanya pengirimnya ESP32 lain milikmu yang masih menyimpan `MAC_NODE1` papan ini, misalnya papan lama yang pernah menjalankan Node 2. Node 1 sudah menolaknya; matikan papan itu atau unggah program lain ke sana. Pesan ini paling sering muncul sekali semenit supaya log tidak penuh.

</details>

<details>
<summary><b>Node 1: <code>Paket Node 2 bertanda … versi … ditolak</code>, atau angka <code>dibuang</code> terus bertambah</b></summary>

- `Paket Node 2 bertanda 0x52 versi 2 ditolak` (atau versi lain): isi `paket-node2.h` di kedua folder berbeda. Salin ulang file yang sama dari kurikulum ke `node-1-rumah` dan `node-2-kebun`, lalu unggah keduanya.
- `dibuang` bertambah setiap kali Node 2 bangun: paket yang tiba bukan 33 byte atau dikirim sebagai siaran, jadi petugas WiFi Node 1 membuangnya sebelum diperiksa. Biasanya papan Node 2 masih menjalankan sketsa latihan (`modul14_cari_kanal` mengirim teks `halo dari kebun`). Unggah Node 2 v1.0.0. Kalau `dibuang` bertambah terus tanpa mengikuti jadwal bangun Node 2, ada perangkat ESP-NOW lain di sekitar rumahmu yang menyiarkan paket di channel yang sama. Node 1 sudah membuangnya; tidak perlu berbuat apa-apa.

</details>

<details>
<summary><b>Node 1 menerima paket Node 2, tetapi tidak ada yang muncul di MQTTX atau Node-RED</b></summary>

Ketik `node2` di Serial Monitor Node 1, lalu lihat baris `terbit … menunggu di rak …`:

- **`menunggu di rak` terus bertambah, `terbit` tetap:** Node 1 belum bisa menerbitkan. Ketik `wifi`: WiFi dan MQTT harus tersambung, dan jam harus sudah disetel. Node 1 yang baru menyala tanpa internet menahan semua bacaan sampai jamnya disetel dari NTP (Konsep 7).
- **`terbit` bertambah, tetapi MQTTX sunyi:** periksa topik langgananmu. `device_id` Node 2 ditulis **dengan huruf kecil tanpa titik dua**, misalnya `rpm/246f28b1c7d4/#`, bukan `rpm/24:6F:28:B1:C7:D4/#`. Pastikan juga MQTTX tersambung ke broker yang sama dengan Node 1.
- **MQTTX menerima, tetapi kartu Kebun kosong:** topik di node `telemetry Node 2` dan `status Node 2` masih berisi `246f28b1c7d4` dari kurikulum (Praktik 5.2), atau kamu belum mengeklik **Deploy**.

</details>

<details>
<summary><b>Pemeriksa kontrak menulis <code>GAGAL</code> untuk pesan Node 2</b></summary>

- `kolom "cahaya" tidak ada` … `kolom "tekanan" tidak ada di kontrak data`: pemeriksamu masih versi 1.0. Ganti dengan versi 1.1 (Praktik 4.5).
- `"tekanan" harus angka 300 sampai 1100 atau null, isinya 100860`: angka pascal dari `readPressure()` lupa dibagi 100 (Konsep 4). Firmware v1.0.0 dari kurikulum sudah membaginya; periksa perubahan yang kamu buat sendiri.
- `kolom "gerak" tidak ada di kontrak data` (atau kolom Node 1 lain): ada kolom Node 1 yang ikut terkirim di pesan Node 2. Kontrak 1.1 menetapkan kolom **menurut perangkat** (Konsep 7).

</details>

<details>
<summary><b>BME280: <code>BME280 tidak ditemukan …</code> atau <code>Chip di 0x76 bukan BME280 (chip ID 0x58 …)</code></b></summary>

- **Tidak ditemukan:** periksa empat kabelnya menurut tulisan di modul BME280 (Praktik 2.3). SDA ke D21, SCL ke D22, dan VIN ke rel bawah (+), yang berlistrik hanya kalau kaki 3V3 papan sudah disambung ke rel itu (Praktik 2.2). Sambungan rel yang longgar adalah tersangka utama.
- **Chip ID `0x58`:** modulmu BMP280, bukan BME280. BMP280 tidak punya pengukur kelembapan, dan library BME280 menolaknya, jadi suhu, kelembapan, dan tekanan terkirim sebagai `null`. Node 2 tetap berjalan dan data tanahnya tetap tampil, tetapi gantilah sensornya dengan BME280 asli (Modul 7 sudah mengajarkan cara mengeceknya sebelum membeli).

</details>

<details>
<summary><b>Suhu tanah <code>nan</code></b></summary>

DS18B20 tidak menjawab: library menandainya dengan `-127`, lalu firmware mengubahnya menjadi `NAN`. Periksa sambungan di Praktik 2.4: VCC adaptor ke rel bawah (+), GND ke rel bawah (−), DAT tetap ke **D27**. Kalau sebelum Praktik 2 sensormu bekerja dan sesudahnya tidak, kemungkinan besar kabel VCC atau GND yang dipindah ke rel belum tertancap dalam.

</details>

<details>
<summary><b>Tanah <code>-1 %</code>, atau persen tanah tidak masuk akal</b></summary>

- **`Sensor tanah: angka mentah … mustahil, dikirim sebagai gagal.`** Angka mentahnya jauh di luar rentang kalibrasi. Penyebabnya: ujung AOUT tidak tertancap di **VN**, ujung VCC tidak di **D32**, atau `TANAH_KERING` dan `TANAH_BASAH` masih angka Node 1. Ulangi kalibrasi Praktik 2.7 dengan rangkaian akhir.
- **Selisih angka kering dan basah kurang dari 500:** baca tulisan chip berkaki delapan di sensor. Chip NE555 tidak cocok untuk 3,3 V (Modul 6 Konsep 6). Pernah memakai sensor kedua untuk Node 1 karena sensor pertama ber-NE555? Siapkan satu sensor ber-chip TLC555 untuk Node 2.
- **Persen naik-turun setiap bangun walaupun tanahnya tidak berubah:** sensornya belum tenang saat dibaca. Naikkan `TENANG_TANAH_MS` menjadi `500` (Praktik 4.2).

</details>

<details>
<summary><b>Node 2 di baterai tidak pernah bangun lagi: LED biru tidak lagi berkedip</b></summary>

1. Lihat Serial Monitor Node 1: kapan paket terakhir tiba (`node2` → `paket terakhir … detik lalu`)?
2. Ukur tegangan baterai dengan multimeter (Modul 9). Di bawah sekitar 3,3 V, baterai hampir kosong; kalau terus turun, chip proteksi TP4056 memutus listrik sama sekali. Isi ulang dengan pengawasan.
3. Ukur keluaran MT3608 di rel atas (+): harus 5,0 V. Kalau jauh lebih rendah, regulator papan tidak bekerja dengan baik (Modul 9).
4. Periksa kabel VIN papan ke rel atas (+) kolom 29 dan GND ke rel atas (−) kolom 28.
5. Masih tidak bangun walaupun baterai penuh? Lepas VIN dan GND, colokkan USB, lalu lihat Serial Monitor Node 2 (tekan **EN** kalau perlu). Kalau dari USB Node 2 bangun normal, masalahnya ada di catu baterai (butir 2–4); kalau tidak, laporan bangunnya biasanya menunjukkan masalahnya.

</details>

<details>
<summary><b>Baterai Node 2 habis jauh lebih cepat daripada perkiraan</b></summary>

Diurutkan dari yang paling sering:

1. **VCC sensor tanah tersambung ke 3V3, bukan D32.** Arus tidur naik sekitar 5 mA, umur baterai tinggal separuh (Praktik 7.5).
2. **Node 2 memindai channel setiap kali bangun.** Laporan Node 2 menulis `Bangun` lebih dari 2.000 ms berkali-kali. Penyebabnya biasanya kiriman yang terus `GAGAL` (lihat bagian di atas): setelah dua kali gagal, Node 2 memindai lagi, dan setiap kegagalan menambah dua percobaan ulang.
3. **Baterai palsu.** Baterai "9.900 mAh" biasanya hanya sekitar 1.000 mAh (Modul 9).
4. **Kode BME280 diubah** sehingga `setSampling(… MODE_FORCED …)` hilang dan BME280 mengukur terus-menerus.

Bukti terbaik: ukur arus tidurnya dengan INA219 (Praktik 7). Arus tidur di atas 6 mA berarti ada yang tetap menyala selama Node 2 tidur.

</details>

<details>
<summary><b>Uji router: paket tiba di bawah 90 %</b></summary>

Lihat log Node 1 dan perintah `node2`, lalu cocokkan dengan gejala ini:

| Gejala | Kemungkinan penyebab | Obatnya |
| :--- | :--- | :--- |
| Hampir semua paket hilang sejak router dicabut | Node 1 masih memindai terus: baris `WiFi.setAutoReconnect(false);` belum terpasang, atau Node 1 masih v1.2.1. Di v1.3.0 yang belum lengkap, `wifi` selama router mati sering menulis `channel radio` yang berbeda dari `channel router` (v1.2.1 belum punya baris itu). | Periksa langkah 3.4 butir 2 dan 3, lalu unggah lagi Node 1 v1.3.0 |
| Satu paket hilang setiap beberapa menit, banyak `percobaan ke-3` | Node 2 kebetulan mengirim saat Node 1 sedang memindai (Konsep 8) | Wajar kalau jarang. Kalau sering, dekatkan Node 2 supaya sinyalnya lebih kuat |
| Semua paket hilang **setelah** router hidup lagi | Router dengan channel **Auto** memilih channel lain saat menyala, dan Node 2 baru mencari lagi setelah dua kali gagal | Kunci channel router (Praktik 1.5), lalu ulangi uji |
| Hitungan `node2` kembali ke nol di tengah uji | Node 1 *restart* (misalnya kabel USB tersenggol). Hitungan dan rak tunggu ada di RAM. | Ulangi uji tanpa menyentuh papan Node 1 |
| Persennya kecil walaupun hanya satu-dua paket hilang | Node 2 masih bangun setiap 300 detik, jadi paketnya terlalu sedikit (Konsep 8) | Ubah `JEDA_DETIK` menjadi `60` selama uji |
| `sinyal` di bawah −85 dBm | Node 2 terlalu jauh atau terhalang tembok | Dekatkan Node 2 untuk uji ini |

</details>

<details>
<summary><b>Setelah router hidup lagi, data selama router mati tidak lengkap di Pi atau di grafik</b></summary>

- **`tergusur` lebih dari 0:** rak tunggu penuh. Rak menampung 96 bacaan, jadi dengan jadwal uji 60 detik, router yang mati lebih dari 96 menit pasti membuat bacaan tertua tergusur.
- **Hitungan `node2` kembali ke nol:** Node 1 sempat *restart*, dan isi raknya (di RAM) hilang.
- **`kebun.log` di Pi berhenti di tengah:** pencatatnya dijalankan tanpa `nohup … &` sehingga ikut mati saat jendela SSH putus (Praktik 6.1).
- **Data ada di `kebun.log`, tetapi grafik Kebun bolong atau semua titik menumpuk di satu saat:** isian **X:** grafik masih bertipe **timestamp**. Ubah menjadi **key:** `waktu` (Praktik 5.4).

</details>

<details>
<summary><b>Enkripsi (Praktik 8): setelah <code>kunci.h</code> dipasang, Node 1 tidak menerima apa-apa</b></summary>

- Kedua `kunci.h` harus **sama persis**: buka keduanya berdampingan, lalu bandingkan huruf demi huruf, termasuk huruf besar-kecil.
- `PAKAI_ENKRIPSI = true` harus ada di **kedua** file. Kunci di satu sisi saja sama dengan kunci yang berbeda.
- `kunci.h` ada di kedua folder? Kalau Node 2 tidak menemukannya, Node 2 berjalan tanpa enkripsi dan tidak menampilkan pesan apa pun. Lihat deretan tab di jendela `node-2-kebun`.
- Kunci hanya boleh berisi huruf dan angka biasa. Huruf seperti `é` memakan dua byte sehingga `static_assert` menolaknya walaupun kelihatannya 16 huruf.
- Node 1 menulis `Gagal mendaftarkan Node 2 sebagai pasangan berkunci.`? Periksa `MAC_NODE2`, lalu unggah lagi Node 1.

</details>

<details>
<summary><b>Unggah ke Node 2 gagal, atau papan Node 2 berulang kali <i>restart</i></b></summary>

- Kabel VIN dan GND rangkaian baterai **harus dilepas** sebelum USB dicolokkan (aturan aman 1). Dua sumber listrik sekaligus bisa saling melawan.
- Unggahan berhenti di `Connecting…` karena Node 2 sedang tidur? Tahan **BOOT** begitu `Connecting…` muncul, lalu lepaskan saat `Writing at …` mulai berjalan.
- Saat USB tercolok dan Serial Monitor terbuka, Node 2 menulis laporan setiap kali bangun, diselingi `rst:0x5 (DEEPSLEEP_RESET)`. Itu bukan *restart* karena masalah, melainkan cara tidur dalam bekerja (Modul 9).

</details>

<details>
<summary><b>Peringatan kuning saat kompilasi: <code>extra tokens at end of #undef directive</code> atau <code>-Wdeprecated-enum-enum-conversion</code></b></summary>

Peringatan itu berasal dari library **OneWire** 2.3.8 dan **Adafruit INA219** 1.2.3, bukan dari kodemu, dan hanya tampil kalau pilihan **Compiler warnings** di **File → Preferences** tidak diatur ke **None**. Paket esp32 3.3 memakai aturan C++ yang lebih baru daripada saat library itu ditulis. Selama di akhir tertulis `Sketch uses …`, kompilasinya berhasil.

</details>

<details>
<summary><b>Wokwi: <code>terkirim: penerima membalas ACK</code>, padahal tidak ada penerima</b></summary>

Simulator Wokwi (dicoba Oktober 2026) selalu melaporkan kiriman ESP-NOW berhasil walaupun tidak ada papan penerima. Laporan ACK dari Wokwi tidak bisa dipercaya. Uji ACK, kegagalan, dan channel butuh dua papan asli. Jalur Wokwi modul ini memakai **Node 2 tiruan** di dalam Node 1 Wokwi (Praktik 3) untuk menguji jembatan, rak tunggu, dan Node-RED.

</details>

<details>
<summary><b>Praktik 7: <code>paket Node 2 diterima sejauh ini: 0</code></b></summary>

Sketsa ukur arus tidak menerima kiriman Node 2, jadi Node 2 tidak mendapat ACK dan yang terukur adalah bangun terburuk.

- Papan Node 1 harus menyimpan nama dan kata sandi WiFi rumah (dari portal Modul 10). Kalau data itu terhapus, misalnya karena **Erase All Flash Before Sketch Upload** sempat diatur ke **Enabled**, atau karena perintah `wifi lupa`, `WiFi.begin()` tanpa isi tidak tersambung ke mana pun dan radionya diam di channel 1. Unggah lagi Node 1 v1.3.0, isi portal WiFi, lalu unggah lagi sketsa ukur.
- Router harus menyala selama mengukur.
- Node 2 harus menjalankan v1.0.0 dengan `MAC_NODE1` papan Node 1.

</details>

---

## 🔬 Bedah Teknis (opsional)

Bagian ini boleh dilewati. Isinya untuk kamu yang penasaran, dan modul berikutnya tidak bergantung padanya.

<details>
<summary><b>Mengukur tegangan baterai Node 2 di pin VP</b></summary>

Kartu Kebun sudah punya baris **Baterai**, dan Node 1 sudah tahu cara menerbitkan kolom `baterai`. Yang belum ada hanya rangkaiannya. Rancangannya sudah dibahas di Modul 9 🔬: **pembagi tegangan** dua resistor sama besar dari **OUT+** ke **OUT−** TP4056, dengan titik tengah ke pin **VP** (GPIO 36). Baterai 4,2 V menjadi 2,1 V di titik tengah, aman untuk ADC.

**Bahan:** dua resistor **100 kΩ** (dibeli terpisah, harganya sangat murah) dan satu kapasitor **100 nF** dari kit (Modul 6). Resistor 10 kΩ dari kit juga bisa, tetapi menyedot sekitar 0,2 mA terus-menerus, sepuluh kali lipat, sehingga umur baterai berkurang sekitar 2–3 %. Resistor sebesar 100 kΩ membuat titik tengahnya "lemah", jadi kapasitor 100 nF **wajib** supaya ADC membaca angka yang tenang.

**Pasang dengan baterai dicabut dari dudukannya** (aturan Modul 9), di separuh atas breadboard mini:

| Bagian | Kaki pertama | Kaki kedua |
| :--- | :--- | :--- |
| Resistor 100 kΩ pertama | 12a (satu kolom dengan OUT+ TP4056) | 16a |
| Resistor 100 kΩ kedua | 16b | rel atas (−), sekitar kolom 17 |
| Kapasitor 100 nF | 16c | rel atas (−), sekitar kolom 18 |
| Kabel jantan–betina | 16e | kaki **VP** papan Node 2 |

Kolom 16 menjadi titik tengahnya. Jangan memasang pembagi ini di B+/B− (terus menyedot baterai walaupun proteksi sudah memutus) atau di rel atas (+) (selalu 5,0 V berapa pun isi baterainya).

**Programnya:** di `node-2-kebun.ino`, ubah `ADA_PEMBAGI_BATERAI = false` menjadi `true`, lalu unggah (lepas dulu VIN dan GND rangkaian baterai). Setelah unggahan selesai, cabut USB papan Node 2, pasang lagi baterainya, lalu sambungkan VIN dan GND (aturan aman 1). Begitu Node 2 bangun, pesan `telemetry` di MQTTX mendapat kolom baru, misalnya `"baterai":3.98`, dan kartu Kebun menulis `Baterai 3.98 V`. Fungsi `bacaBateraiMv()` membaca VP delapan kali dengan `analogReadMilliVolts()`, **sebelum** radio menyala, karena tegangan baterai turun sesaat setiap kali radio memancar.

**Koreksi dengan multimeter.** ADC ESP32 bisa meleset sekitar 0,1 V di sisi baterai. Ukur tegangan antara OUT+ dan OUT− dengan multimeter, lalu bandingkan dengan `baterai` di MQTTX. Misalnya, multimeter menunjukkan 4,05 V, sedangkan MQTTX 3,98 V: hitung 2,0 × 4,05 ÷ 3,98 ≈ 2,035, lalu ubah `FAKTOR_PEMBAGI` menjadi `2.035` (di kode, koma desimal ditulis titik) dan unggah lagi.

Angka ini cukup untuk mengetahui kapan harus mengisi ulang (misalnya di bawah 3,5 V), tetapi bukan "persen sisa" yang teliti (Modul 9). Bonusnya, uji 72 jam di ➕ B memperlihatkan garis tegangan yang turun pelan-pelan.

</details>

<details>
<summary><b>BLE dasar: suhu kebun dibaca HP dengan nRF Connect</b></summary>

Selain WiFi dan ESP-NOW, radio ESP32 juga bisa berbicara **Bluetooth Low Energy** (BLE), protokol yang dipakai jam pintar dan termometer Bluetooth. BLE bekerja dengan pola ***peripheral*** (perangkat kecil yang menyediakan data) dan ***central*** (HP yang membacanya). Datanya dikelompokkan menjadi **layanan** (*service*) berisi **karakteristik** (*characteristic*), masing-masing bernomor (UUID). Untuk data lingkungan, ada nomor baku: layanan `0x181A` (*Environmental Sensing*) dengan karakteristik suhu `0x2A6E` (*Temperature*), dalam satuan 0,01 °C.

Sketsa [`kode/modul14_ble_suhu/modul14_ble_suhu.ino`](kode/modul14_ble_suhu/modul14_ble_suhu.ino) menjadikan papan Node 2 *peripheral* bernama `Kebun-BLE` yang menyediakan suhu DS18B20 dan memberi tahu HP setiap 2 detik.

1. Lepas VIN dan GND Node 2 dari rangkaian baterai, colokkan USB, lalu unggah sketsa itu ke papan Node 2. Sketsanya memakai library BLE bawaan paket esp32, jadi tidak perlu memasang library baru. Ukurannya sekitar 1,1 juta byte (83 %), jauh lebih besar daripada sketsa ESP-NOW.
2. Pasang **nRF Connect for Mobile** (Nordic Semiconductor) dari Play Store atau App Store di HP-mu.
3. Di tab **SCANNER**, ketuk **SCAN** (iPhone: ikon **Play** di kanan atas), cari `Kebun-BLE`, lalu ketuk **CONNECT**.
4. Buka layanan bernomor `0x181A` (biasanya bernama *Environmental Sensing*), lalu karakteristik `0x2A6E` (*Temperature*). Ketuk ikon **satu panah ke bawah** untuk membaca nilainya sekali, atau ikon **beberapa panah ke bawah** untuk menyalakan notifikasi. Nilainya tampil sebagai byte mentah, misalnya `(0x) A5-0A`. Serial Monitor Node 2 mencetak tafsirannya, misalnya `Suhu 27.25 C -> nilai BLE 2725 = 0x0AA5, dikirim byte rendah dulu: A5-0A`. Jadi, `0x0AA5` = 2.725 perseratus derajat, yaitu 27,25 °C. Byte terkecil lebih dulu, sama seperti paket 33 byte (Konsep 5). Bergantung pada versinya, aplikasi itu mungkin juga menampilkan angka derajatnya.
5. Selesai mencoba, unggah lagi Node 2 v1.0.0, cabut USB-nya, lalu kembalikan ke baterai seperti Praktik 4.6.

**Mengapa sketsa terpisah, tidak digabung ke Node 1 atau Node 2?** BLE dan WiFi berbagi satu radio, jadi keduanya bergantian memakai waktu radio dan Node 1 bisa melewatkan paket ESP-NOW. Programnya juga membengkak: sketsa BLE sekecil ini saja sudah sekitar 1,1 juta byte. Wokwi pun belum bisa menyimulasikan Bluetooth. BLE cocok untuk perangkat yang dibaca HP dari dekat, misalnya saat memasang alat di kebun, bukan untuk mengirim data setiap 5 menit ke gateway.

</details>

<details>
<summary><b>Library <code>ESP_NOW</code> bawaan paket esp32: cara kelas</b></summary>

Paket esp32 3.x juga membawa library ESP-NOW gaya Arduino (`#include <ESP32_NOW.h>`) dengan contoh-contohnya di **File → Examples → ESP_NOW**. Modul ini sengaja memakai fungsi C `esp_now_*` dari ESP-IDF karena library itu menuntut konsep C++ yang belum kita pelajari: kelas turunan.

```cpp
#include <WiFi.h>
#include <ESP32_NOW.h>

// Library mewajibkan kelas turunan: send() milik ESP_NOW_Peer tidak boleh dipanggil dari luar kelas.
class PeerNode1 : public ESP_NOW_Peer {
public:
  PeerNode1(const uint8_t *mac, uint8_t kanal) : ESP_NOW_Peer(mac, kanal, WIFI_IF_STA, nullptr) {}
  bool daftar() { return add(); }
  bool kirim(const uint8_t *data, size_t panjang) { return send(data, panjang) == panjang; }
  void onSent(bool sukses) override { /* dipanggil petugas WiFi, sama seperti callback kirim */ }
};
```

Kelebihannya: library menyesuaikan diri dengan versi ESP-IDF (pemakainya tidak terkena perubahan *callback* di paket 3.3), dan `ESP_NOW.getMaxDataLen()` memberi tahu batas paketnya: 250 byte, atau 1.470 byte untuk ESP-NOW versi 2. Ada dua jebakan yang sudah diuji penulis:

- Antarmuka bawaan konstruktor `ESP_NOW_Peer` adalah `WIFI_IF_AP`. Sketsa yang memakai mode STA wajib menulis `WIFI_IF_STA` seperti di atas.
- Dokumen library menulis `onReceive(const uint8_t *data, int len, bool broadcast)`, padahal kode library-nya memakai `size_t len`. Kalau kamu mengikuti dokumennya dan menulis `override`, kompilasi gagal dengan `marked 'override', but does not override`. Kalau `override`-nya tidak ditulis, kompilasi **tetap lolos**, tetapi fungsimu tidak pernah dipanggil. Tandanya hanya satu peringatan kuning, `… onReceive(const uint8_t*, size_t, bool)' was hidden`, yang muncul karena **Compiler warnings** di **File → Preferences** masih **More** sejak Modul 8; dengan pengaturan bawaan Arduino IDE (**None**), peringatan itu pun tidak ada. Tulis selalu `override`: lebih baik error yang jelas daripada fungsi yang diam-diam tidak bekerja.

</details>

<details>
<summary><b>"Mesh" ESP-NOW: kapan perlu, dan mana yang benar-benar ESP-NOW</b></summary>

Rumah Pintar Mini hanya punya satu node sensor yang langsung terdengar Node 1. Kalau kebunnya jauh dan node sensornya banyak, paket perlu **diestafetkan** dari node ke node: itulah *mesh* (jaringan jala). Beberapa nama yang sering muncul bersama ESP-NOW:

| Nama | Dasarnya | Catatan |
| :--- | :--- | :--- |
| Contoh `ESP_NOW_Network` (paket esp32) | ESP-NOW | Node-node memilih satu "ketua" dan mengirim kepadanya; belum estafet bertingkat. |
| Komponen `espressif/esp-now` | ESP-NOW + lapisan tambahan | Estafet bertingkat, pembagian WiFi, OTA, dan enkripsi sendiri. Komponen ESP-IDF, bukan library Arduino. |
| ESP-WIFI-MESH (ESP-IDF) | WiFi biasa | Bukan ESP-NOW. Setiap node harus selalu bangun, jadi tidak cocok untuk baterai. |
| painlessMesh (Library Manager) | WiFi biasa + TCP | Bukan ESP-NOW, dengan kebutuhan selalu bangun yang sama. |

Menurut Espressif, ESP-NOW cocok untuk jaringan di bawah sekitar 100 perangkat. Node yang menjadi "estafet" harus selalu bangun untuk mendengar, jadi ia butuh listrik tetap, persis seperti Node 1.

</details>

<details>
<summary><b>Mode <i>Long Range</i> (LR): jarak sampai sekitar 1 km</b></summary>

ESP32 punya mode radio khusus Espressif, **LR** (*Long Range*), yang menukar kecepatan dengan jarak. Lajunya hanya 0,5 atau 0,25 Mbps, tetapi penerimanya lebih peka sehingga jaraknya bisa dua kali lipat lebih, sampai sekitar 1 km di ruang terbuka tanpa halangan.

Mengapa tidak dipakai? Fungsi Arduino `WiFi.enableLongRange(true)` memasang radio **hanya** dalam mode LR, padahal router biasa tidak mengenal LR. Node 1 yang memakainya tidak bisa lagi tersambung ke WiFi rumah. Contoh resmi ESP-IDF memakai LR bersama mode biasa, dan **kedua** papan harus mengaktifkannya. Untuk kebun di halaman rumah, ESP-NOW biasa sudah cukup. Untuk sawah yang jauhnya berkilo-kilometer, ada protokol lain: LoRa, yang dibahas di Modul 15.

</details>

<details>
<summary><b>Mengapa memperbarui program Node 2 lewat udara (OTA) itu rumit</b></summary>

Node 1 akan belajar menerima program baru lewat WiFi di Modul 28 (*Over-The-Air*, OTA). Untuk Node 2, ceritanya jauh lebih sulit:

1. **Node 2 hampir selalu tidur.** Ia hanya mendengar sekejap setelah mengirim. Node 1 harus "menyela" tepat di jendela itu, misalnya dengan membalas "jangan tidur dulu, ada program baru".
2. **Programnya besar.** Firmware Node 2 sekitar 940 ribu byte, setara sekitar 3.800 paket ESP-NOW 250 byte. Setiap paket harus dinomori, dibalas, dikirim ulang kalau hilang, ditulis ke memori, lalu seluruhnya diperiksa keutuhannya sebelum papan *restart*. Radio menyala terus puluhan detik, dan baterai harus cukup sampai selesai.
3. **Kalau Node 2 menyambung ke router untuk OTA**, ia butuh kata sandi WiFi, padahal Node 2 sengaja tidak pernah tahu kata sandi itu (Konsep 10).
4. **Program yang tidak ditandatangani** bisa diganti siapa pun yang bisa mengirim paket ke Node 2. Penandatanganan program dibahas di Modul 28.

Komponen resmi `espressif/esp-now` sampai membutuhkan fitur "lanjutkan dari titik putus" dan "kembali ke program lama" untuk OTA lewat ESP-NOW, tanda bahwa ini memang bukan pekerjaan kecil. Untuk sekarang, memperbarui Node 2 cukup lewat kabel USB.

</details>

<details>
<summary><b>Mengapa paket 33 byte tanpa CRC dan tanpa "ACK aplikasi"</b></summary>

Contoh resmi ESP-NOW di ESP-IDF menambahkan **CRC** (angka pemeriksa keutuhan) di setiap paket, dan dokumennya menyarankan **ACK aplikasi**: penerima membalas dengan paket sendiri setelah benar-benar mengolah data. Node 2 tidak memakai keduanya. Alasannya:

- Setiap bingkai WiFi sudah membawa angka pemeriksa sendiri (FCS, 4 byte). Bingkai yang rusak di udara tidak lolos pemeriksaan itu, tidak dibalas ACK, dan dikirim ulang oleh Node 2. Dengan enkripsi (Praktik 8), paket yang diubah di tengah jalan juga ditolak.
- Node 1 membuang paket siaran, lalu memeriksa panjang (tepat 33 byte), tanda `0x52`, versi formulir, dan alamat pengirim. Nomor `urutan` membuat paket hilang dan paket ganda terhitung (Konsep 8).
- ACK aplikasi berarti Node 2 harus menyalakan radio lebih lama untuk menunggu balasan, dan Node 1 harus mengirim balasan itu. Untuk data kebun setiap 5 menit, satu bacaan yang sesekali hilang tidak berbahaya, dan hitungan `hilang` membuatnya terlihat.

Untuk data yang tidak boleh hilang sama sekali, misalnya perintah membuka katup air, ACK aplikasi dan kirim ulang memang wajib. Kontrak data Modul 11 melakukannya untuk perintah `cmd` lewat `ack`.

</details>

---

## 🧩 Tantangan mandiri

Tiga tingkat, dari mengubah sedikit sampai membuat sendiri. Kunci Tingkat 1 dan 2 ada di bagian lipat; Tingkat 3 sengaja hanya diberi petunjuk. Kerjakan minimal Tingkat 1. Tingkat 2 dan 3 dikerjakan di editor Node-RED, jadi pembaca jalur Wokwi bisa mengerjakannya dengan Node 2 tiruan.

### Tingkat 1 — Bangun setiap 10 menit (ubah sedikit)

Seorang teman berkata, "Jadwalnya jadikan 10 menit saja, pasti baterainya awet dua kali lipat." Buktikan atau bantah dengan angka:

1. Pakai angka ukurmu dari Praktik 7 (atau angka contoh di 7.4), lalu hitung umur baterai untuk `JEDA_DETIK = 600`.
2. Bandingkan dengan hasilmu untuk 300 detik. Berapa persen bedanya?
3. Kalau jadwal Node 2 benar-benar diubah menjadi 600 detik, berapa menit tanpa paket yang dibutuhkan sampai Node 1 menganggapnya `offline`?

<details>
<summary><b>Kunci Tingkat 1</b></summary>

Dengan angka contoh Praktik 7 (bangun 0,62 detik, muatan bangun 48,6 mA·detik, arus tidur 4,95 mA):

| Langkah | Jadwal 300 detik | Jadwal 600 detik |
| :--- | :--- | :--- |
| Rata-rata sisi 5 V | (48,6 + 4,95 × 299,38) ÷ 300 ≈ 5,10 mA | (48,6 + 4,95 × 599,38) ÷ 600 ≈ 5,03 mA |
| Sisi baterai (× 1,6) | ≈ 8,16 mA | ≈ 8,04 mA |
| Umur (2.000 mAh terpakai) | ≈ 245 jam ≈ 10,2 hari | ≈ 249 jam ≈ 10,4 hari |

Bedanya hanya sekitar **1,5 %**, bukan dua kali lipat. Rata-rata arusnya hampir sama dengan arus tidur karena tidurlah yang memakan hampir seluruh muatan (Konsep 9). Harganya: data kebun hanya datang setiap 10 menit, dan Node 1 baru menulis `Node 2 OFFLINE` setelah 3 × 600 detik + 1 menit = **31 menit** tanpa paket. Teman itu benar untuk papan yang arus tidurnya sangat kecil (Modul 9 🔬), tetapi tidak untuk DevKit V1.

</details>

### Tingkat 2 — Peringatan "Node 2 offline" di dashboard (isi bagian rumpang)

Tambahkan pemberitahuan yang muncul di layar HP saat Node 1 menyatakan Node 2 `offline`. Dashboard 2 punya widget **notification** (kategori `dashboard 2`) yang menampilkan kotak pemberitahuan di semua layar yang sedang membuka dashboard. Lengkapi bagian rumpang (`____`) rancangan ini:

```text
[status Node 2] → [switch "offline?": Property msg.payload
                    aturan 1: ____ ]
                        keluaran 1 → [change: Set msg.payload to the value ____ ]
                                         → [notification "Peringatan kebun": UI ____ , Timeout (S) 10]
```

Untuk mengujinya, matikan Node 2: cabut USB-nya kalau masih tercolok sejak Praktik 8, atau lepas kabel VIN-nya dari rel atas (+) kalau sudah hidup dari baterai. Dengan jadwal 30 detik dari Praktik 7, Node 1 menyatakannya `offline` setelah 3 × 30 + 60 = 150 detik; dengan jadwal 300 detik dari ➕ A, setelah 16 menit. Setelah itu, nyalakan lagi Node 2. Jalur Wokwi: Node 2 tiruan tidak bisa dimatikan, jadi uji peringatanmu dengan menerbitkan teks `offline` ke `rpm/<device_id Node 2 tiruanmu>/status` dari MQTTX (sambungan **Broker publik**), lalu terbitkan `online` untuk mengembalikannya.

<details>
<summary><b>Kunci Tingkat 2</b></summary>

- Node switch `offline?`: **Property** `msg.payload`, aturan 1 **==** jenis **a**z (teks) `offline`. Hanya keluaran 1 yang disambung.
- Node change: **Set** `msg.payload` **to the value** jenis **a**z (teks), misalnya `Node 2 (kebun) tidak terdengar lebih dari 3 jadwal bangun. Periksa baterainya.` Mau menyertakan jam? Pakai jenis **J: expression** dengan `"Node 2 offline sejak " & $now("[H01]:[m01]", "+0700") & " WIB"`.
- Node notification: **UI** `Rumah Pintar Mini` (pengaturan dashboard dari Modul 13), **Position** `Top Right`, **Timeout (S)** `10`, dan **Allow Manual Dismissal** tetap dicentang supaya kotaknya bisa ditutup dengan tombol **Close**.

Ada dua hal yang perlu kamu sadari. Pertama, `status` Node 2 adalah pesan *retained*: setiap kali Node-RED menyala ulang atau kamu mengeklik **Deploy**, status terakhir dikirim lagi, jadi peringatan bisa muncul lagi walaupun tidak ada kejadian baru. Tambahkan node **filter** (`block unless value changes`) sebelum switch kalau itu mengganggu. Kedua, pemberitahuan ini hanya tampil di layar yang **sedang** membuka dashboard. Peringatan yang sampai ke HP walaupun dashboard tidak dibuka, lewat Telegram, dipelajari di Modul 19.

</details>

### Tingkat 3 — Siram kebun dari sensor Node 2 (buat dari nol)

Bayangkan selang pompa Node 1 dipindah ke kebun. Buat flow di Node-RED yang mengirim perintah **siram 5 detik** ke Node 1 kalau `tanah` dari Node 2 di bawah 30 %, tetapi **paling sering sekali setiap 30 menit**.

Petunjuk:

1. Dengarkan `telemetry` Node 2, lalu saring dengan node switch: `msg.payload.tanah` **is not null** dan **<** `30`.
2. Node **delay** bisa membatasi laju: **Action** `Rate Limit`, `All messages`, `1` pesan per `30` menit, dan centang **drop intermediate messages** supaya pesan selama 30 menit itu dibuang, bukan ditumpuk.
3. Kirim perintahnya lewat `buat cmd` yang sudah ada sejak Modul 13 (`msg.topic` `pompa`, `msg.payload` `5`).
4. **Jebakan data susulan.** Setelah router mati semalam, Node 1 menerbitkan puluhan bacaan lama sekaligus (Konsep 7). Kalau salah satunya menulis tanah kering, kebun disiram karena data yang sudah berjam-jam umurnya. Tolak bacaan yang `ts`-nya lebih tua daripada 10 menit. Petunjuk: di node switch, pilih jenis **J: expression** untuk **Property**, lalu tulis `$toMillis(payload.ts) > $millis() - 600000`, dengan aturan **is true**.
5. Pikirkan "dua otak": Node 1 sudah menyiram potnya sendiri berdasarkan sensor tanah Node 1, dan tetap menolak menyiram kalau air tandon kurang. Mengapa penolakan oleh Node 1 itu penting justru karena aturan siram kebun berada di tempat lain?

---

## ➕ Tambahan ke "Rumah Pintar Mini"

Minggu ini Rumah Pintar Mini mendapat perangkat kedua: **Node 2 "Kebun" v1.0.0**, yang hidup dari baterai dan berbicara lewat ESP-NOW. **Node 1 v1.3.0** menjadi jembatannya ke broker, dan dashboard di HP mendapat kartu **Kebun**. Tiga dokumen proyek ikut naik versi: kontrak data 1.1, peta pin 5, dan pemeriksa kontrak 1.1.

![Diagram Rumah Pintar Mini setelah Modul 14; garis putus-putus berarti menyusul. Kiri, Node 2 Kebun v1.0.0, baru, di kebun: baterai 18650 lewat TP4056 dan MT3608 5,0 V, BME280, DS18B20, dan sensor tanah ke-2 dari D32; bangun setiap 5 menit, kirim satu paket, lalu tidur. Panah ESP-NOW, 33 byte, dikunci PMK dan LMK, ke Node 1 Rumah v1.3.0: lima sensor dan aktuator seperti sebelumnya, ditambah jembatan Node 2 (baru) dengan rak tunggu 96 bacaan, ts mundur, dan status Node 2. Panah MQTT ke gateway Raspberry Pi 192.168.1.37 berisi Mosquitto (broker MQTT) dan Node-RED dengan dashboard v0, kartu Kebun yang baru, dan otomasi kipas. Panah ke HP yang membuka kartu Kebun. Di bawah Node 1 dan gateway, daftar topik: rpm/a4cf12e5b7c0/… milik Node 1, dan rpm/246f28b1c7d4/telemetry serta …/status milik Node 2, diterbitkan Node 1. Bawah, repositori GitHub rumah-pintar-mini: firmware/node-1-rumah v1.3.0, firmware/node-2-kebun v1.0.0, KONTRAK-DATA.md 1.1, PETA-PIN.md 5, alat/pemeriksa-kontrak.js 1.1, edge/node-red-flows.json dengan bagian Kebun, dan .gitignore berisi kunci.h sehingga kunci.h sendiri tidak pernah ikut ke GitHub. Kanan bawah, menyusul: Modul 15, RS-485 Modbus, dan Modul 16, backend. Catatan: kontrak data 1.1 hanya menambah, data Node 1 tidak berubah dan Node 2 mendapat kolomnya sendiri; Node 2 tidak pernah tahu kata sandi WiFi, dan kunci ESP-NOW hanya ada di kunci.h di laptopmu dan di kedua papan.](aset/diagram-proyek-modul-14.png)

> 🖥️ **Alat yang dipakai:** **Arduino IDE** dengan `node-2-kebun.ino`, papan Node 1 dan Node 2, *charger* HP untuk mengisi baterai Node 2 (Modul 9), wadah plastik bekas untuk Node 2, terminal SSH ke Pi, editor Node-RED dan HP, **VS Code** dengan folder `rumah-pintar-mini`, dan **GitHub Desktop**.
>
> **Jalur laptop** (broker dan Node-RED di laptop): langkah B butuh laptop yang tetap menyala selama 72 jam; detailnya ada di langkah itu. **Jalur Wokwi:** kerjakan C, D, dan E. Langkah A dan B butuh papan kedua, jadi baru bisa dibuktikan setelah papanmu ada. Pastikan perubahan Praktik 3 dan isi Node 2 v1.0.0 (Praktik 4.1) juga tersimpan di folder `firmware` repositorimu, dengan `PAKAI_WOKWI` tetap `false` di repositori.
>
> ⭐ **Wajib** — langkah B dan E adalah syarat lulus Modul 14.

| File di `rumah-pintar-mini` | Perubahan |
| :--- | :--- |
| `firmware/node-1-rumah/` | **v1.3.0**: `paket-node2.h`, `jembatan.h`, dan `jembatan.cpp` baru, perubahan kecil di lima file (Praktik 3), dan `kunci.contoh.h` (Praktik 8) |
| `firmware/node-2-kebun/` | **v1.0.0** menggantikan kerangka v0.1.0: `node-2-kebun.ino`, `paket-node2.h`, dan `kunci.contoh.h` (Praktik 4 dan 8) |
| `.gitignore` | **baru**: baris `kunci.h` (Praktik 8.1, sudah di-*commit*) |
| `alat/pemeriksa-kontrak.js` | versi 1.1: kolom menurut perangkat (Praktik 4.5) |
| `KONTRAK-DATA.md` | versi 1.1 (langkah C) |
| `PETA-PIN.md` | versi 5 (langkah C) |
| `edge/node-red-flows.json` | ditambah bagian 5 Kebun (langkah D) |

### A. Siapkan Node 2 untuk tempat tetapnya

1. **Jadwal kembali 5 menit.** Papan Node 2 seharusnya masih tercolok USB sejak Praktik 8. Kalau sudah kamu kembalikan ke baterai (misalnya setelah 🔬 BLE), lepas dulu kabel VIN dan GND-nya, baru colokkan USB (aturan aman 1). Di `node-2-kebun.ino`, ubah `JEDA_DETIK = 30` menjadi `JEDA_DETIK = 300`, lalu unggah. Kalau di Praktik 4.2 kamu menaikkan `TENANG_TANAH_MS` menjadi `500`, pastikan angka itu masih ada.
2. **Isi penuh baterainya.** Cabut USB papan Node 2 (kabel VIN dan GND-nya tetap lepas), lalu isi baterai lewat colokan USB TP4056 dengan *charger* HP, sambil ditunggui, seperti di Modul 9. Begitu lampu TP4056 menunjukkan penuh, cabut *charger*-nya. Baterai penuh adalah syarat uji 72 jam yang jujur.
3. **Pilih tempatnya.** Kebun di sini bisa berupa pot di teras atau bedeng kecil di halaman. Syaratnya:
   - **Teduh dan kering**, misalnya di bawah atap teras atau kanopi. Papan dan breadboard tidak tahan air, dan baterai Li-ion tidak boleh kepanasan di bawah matahari langsung (Modul 9).
   - **Dekat tanaman** karena kabel sensornya hanya sekitar 20 cm.
   - **Masih terjangkau Node 1.** Angka `sinyal` di log Node 1 sebaiknya lebih kuat daripada −85 dBm (langkah B.3 memeriksanya).
4. **Siapkan wadahnya.** Wadah plastik bekas, misalnya wadah makanan, cukup untuk breadboard mini dan papan Node 2. Buat beberapa lubang kecil di sisi bawahnya supaya udara bisa keluar-masuk dan air tidak menggenang, dan jangan tutup rapat-rapat: udara lembap yang terkurung membuat embun. Buat satu lubang lagi di sisi wadah untuk kabel-kabel sensor.

### B. ⭐ Pasang Node 2 dan uji 72 jam

Syarat lulus meminta Node 2 bertahan **paling sedikit 3 hari** dari satu baterai 18650. Hitungan Konsep 9 memperkirakan sekitar 10 hari, tetapi bukti yang sesungguhnya adalah data yang terus masuk selama 72 jam.

1. **Di Pi**, jalankan pencatat seperti Praktik 6.1, dengan nama file baru (ganti `device_id`-nya):

   ```bash
   nohup mosquitto_sub -h localhost -t "rpm/246f28b1c7d4/telemetry" -F "%I %p" > uji72.log 2>&1 &
   ```

   Catat nomor prosesnya (misalnya `[1] 5120`).
2. **Pasang Node 2 ke baterai:** sambungkan kabel VIN papan ke rel atas (+) kolom 29 dan GND ke rel atas (−) kolom 28 (Praktik 4.6). LED biru menyala sebentar: Node 2 langsung bangun dan mengirim paket pertamanya. Tulis jam dan tanggalnya di `catatan-modul14.md` sebagai **awal uji**.
3. **Bawa Node 2 ke tempatnya.** Masukkan breadboard mini dan papan ke wadah, lalu keluarkan kabel sensor lewat lubang samping:
   - Tancapkan **sensor tanah** ke tanah sampai garis batasnya, tidak lebih (Modul 6).
   - Benamkan ujung logam **DS18B20** ke tanah sekitar 5–10 cm. Ujung logamnya tahan air, tetapi modul adaptornya tidak: biarkan modul itu di dalam wadah.
   - Gantungkan **BME280** di luar wadah, di sisi yang teduh, supaya yang terbaca adalah udara kebun, bukan udara di dalam wadah.

   Lima menit kemudian, ketik `node2` di Serial Monitor Node 1 dan lihat angka `sinyal` di baris `paket terakhir`. Lebih lemah daripada −85 dBm, atau `percobaan ke-2` dan `ke-3` sering muncul? Pindahkan Node 2 lebih dekat ke rumah.
4. **Kembalikan Node 1 ke *charger*-nya.** Urutannya seperti Modul 5: matikan MB102, cabut USB papan Node 1 dari laptop, colokkan ke *charger*, lalu nyalakan lagi MB102 (modul microSD beregulator: tekan **EN** sesudahnya, seperti Modul 12). Node 1 menyala ulang, tersambung ke WiFi, dan kembali mendengar Node 2.
5. **Setiap hari**, buka kartu **Kebun** di HP. Tanda Node 2 masih sehat: status `online`, dan **Bacaan terakhir** tidak lebih dari 5 menit yang lalu. Tidak perlu menyentuh apa pun.
6. **Setelah paling sedikit 72 jam**, masuk ke Pi lewat SSH, lalu jalankan tiga perintah ini satu per satu:

   ```bash
   wc -l uji72.log
   head -n 2 uji72.log
   tail -n 1 uji72.log
   ```

   **Hasilnya** (contoh):

   ```text
   867 uji72.log
   nohup: ignoring input
   2026-10-19T08:02:14+0700 {"ts":"2026-10-19T01:02:14Z","fw":"1.0.0","suhu":27.9,"kelembapan":81,"tekanan":1009.4,"suhu_tanah":26.8,"tanah":47}
   2026-10-22T08:07:31+0700 {"ts":"2026-10-22T01:07:31Z","fw":"1.0.0","suhu":28.3,"kelembapan":79,"tekanan":1008.9,"suhu_tanah":27.3,"tanah":44}
   ```

   - `wc -l` menghitung baris file. Satu baris adalah `nohup: ignoring input`, jadi ada 866 pesan. Dalam 72 jam lebih 5 menit, Node 2 yang bangun setiap 5 menit seharusnya mengirim sekitar 866 paket; angka yang sedikit berbeda wajar: setiap bangun menambah sekitar setengah detik pada jadwal 300 detik, jam tidur ESP32 tidak setepat jam dinding, dan sesekali ada paket yang hilang. Yang penting, pesan terus masuk sampai akhir uji tanpa celah berjam-jam.
   - Baris pesan pertama (dari `head`) dan terakhir (dari `tail`) menunjukkan awal dan akhir uji: 19 Oktober pukul 08.02 sampai 22 Oktober pukul 08.07, lebih dari 72 jam dari satu kali isi baterai.
7. Hentikan pencatatnya dengan `kill 5120` (nomor proses dari langkah 1). Tulis di `catatan-modul14.md`: awal uji, akhir uji, jumlah baris `uji72.log`, dan tegangan baterai di akhir uji kalau kamu mengukurnya dengan multimeter atau memasang pembagi tegangan (🔬). Node 2 boleh terus bekerja; isi ulang baterainya, dengan ditunggui, sebelum tegangannya turun di bawah sekitar 3,3 V (Modul 9).

Baterai habis sebelum 72 jam? Lihat 🚨 "Baterai Node 2 habis jauh lebih cepat daripada perkiraan".

**Jalur laptop** (broker dan Node-RED di laptop): jalankan perintah pencatat di terminal laptop, tanpa `nohup` dan tanpa `&`, lalu biarkan jendelanya terbuka. Selama 72 jam itu laptop harus tetap menyala: colokkan *charger*-nya, dan ubah sementara pengaturan daya laptopmu supaya tidak tidur sendiri. Kembalikan pengaturan itu setelah uji selesai. Di akhir uji, hentikan pencatatnya dengan **Ctrl + C**, lalu baca filenya dari terminal yang sama. Windows PowerShell tidak mengenal `wc`, `head`, dan `tail`; pakai `(Get-Content uji72.log).Count`, `Get-Content uji72.log -TotalCount 1`, dan `Get-Content uji72.log -Tail 1`. Jumlah barisnya satu lebih sedikit daripada contoh di Pi karena tanpa `nohup` tidak ada baris `nohup: ignoring input`.

### C. Kontrak data 1.1 dan peta pin 5

Kedua dokumen ini menjadi pegangan modul-modul berikutnya, jadi salinanmu harus sama dengan versi rujukan.

1. Di VS Code dengan folder `rumah-pintar-mini`, buka `KONTRAK-DATA.md`, lalu salin dulu baris Node 1 di tabel **Perangkatku** (paling bawah) ke `catatan-modul14.md`: penggantian berikut ikut mengosongkan tabel itu. Buka [`proyek-rumah-pintar-mini/KONTRAK-DATA.md`](../../proyek-rumah-pintar-mini/KONTRAK-DATA.md) di tab baru, klik **Copy raw file**, lalu ganti seluruh isi file-mu dengannya (**Ctrl + A**, lalu **Ctrl + V**). Setelah itu, isi lagi tabel **Perangkatku**: baris Node 1 dari catatanmu tadi, lalu baris Node 2 "Kebun" dengan `device_id` Node 2 dari `catatan-modul14.md` dan catatan "lewat Node 1 (ESP-NOW)". Simpan. Perubahannya sudah dijelaskan di Konsep 7: kolom baru `tekanan`, `suhu_tanah`, dan `baterai`, kolom menurut perangkat, `ts` dan `status` Node 2 yang dibuat Node 1, serta riwayat versi di bagian akhir.
2. Lakukan hal yang sama untuk `PETA-PIN.md` dengan [`proyek-rumah-pintar-mini/PETA-PIN.md`](../../proyek-rumah-pintar-mini/PETA-PIN.md). Versi 5 mencatat tabel Node 2 yang baru (BME280 di D21/D22, sensor tanah ke-2 di VN dengan VCC dari D32, VP opsional), bagian baru **Sensor Node 2** berisi sambungan Praktik 2, dan baris riwayat versi 5. Bagian Node 1 tidak berubah.
3. Masih ada `catatan-modul14.md` berisi kalibrasi tanah, channel router, dan hasil uji? Bandingkan sekali lagi dengan isi `node-2-kebun.ino`-mu: angka di catatan dan di kode harus sama.

### D. Ekspor ulang flow Node-RED

Flow-mu bertambah satu bagian di Praktik 5, jadi cadangan `edge/node-red-flows.json` dari Modul 13 perlu diperbarui.

1. **Di editor Node-RED**, rapikan bagian 5 seperti ➕ A Modul 13. Potongan flow dari kurikulum sudah membawa judulnya sendiri, node comment `5 · Kebun: telemetry dan status Node 2 (diterbitkan Node 1 atas nama Node 2)`; pastikan letaknya di atas node-node bagian 5. Kalau tombol di sisi kanan node debug `lihat telemetry Node 2` masih hijau, klik sampai memudar, lalu klik **Deploy**.
2. Ekspor seperti ➕ D Modul 13: menu utama → **Export** → **all flows** → **formatted** → **Download**.
3. Di folder **Downloads**, ubah nama `flows.json` menjadi `node-red-flows.json`, lalu pindahkan ke **Documents → GitHub → rumah-pintar-mini → edge** dan pilih **Replace the file in the destination** (macOS: **Replace**).
4. Di VS Code, buka `edge/node-red-flows.json`, tekan **Ctrl + F**, lalu cari `Kebun`: harus ketemu. Cari juga `password`: tidak boleh ketemu.

### E. ⭐ Simpan ke GitHub

1. Di GitHub Desktop, pilih repositori **`rumah-pintar-mini`**. Daftar **Changes** berisi file-file di `firmware/node-1-rumah` (tiga file baru, lima file yang berubah, dan `kunci.contoh.h`), `firmware/node-2-kebun` (`node-2-kebun.ino`, `paket-node2.h`, dan `kunci.contoh.h`), `alat/pemeriksa-kontrak.js`, `KONTRAK-DATA.md`, `PETA-PIN.md`, dan `edge/node-red-flows.json`. **Periksa sekali lagi: `kunci.h` tidak boleh ada di daftar** (Praktik 8.6). Isi **Summary** dengan `Modul 14: Node 2 Kebun v1.0.0 lewat ESP-NOW, Node 1 v1.3.0 jembatan`, klik **Commit … to main**, lalu **Push origin**.
2. Di repositori **`belajar-iot`**, folder `modul-14` berisi sketsa latihanmu (`modul14_penerima`, `modul14_pengirim`, `modul14_penerima_rumah`, `modul14_cari_kanal`, `modul14_sensor_kebun`, dan `modul14_ukur_arus`) serta `catatan-modul14.md`. Pastikan catatan itu tidak berisi kunci enkripsi, lalu lakukan *commit* dan *push* juga.

**Bukti lulus Modul 14** (bandingkan dengan ✅ di bawah): data Node 2 tampil di kartu Kebun dengan `device_id`-nya sendiri (Praktik 5), paket tiba ≥ 90 % saat router dimatikan dan data susulannya muncul di Pi (Praktik 6), Node 2 bertahan ≥ 3 hari dari satu baterai (langkah B), dan semuanya tersimpan di repositori tanpa `kunci.h` (langkah E).

---

## 📖 Glosarium

| Istilah | Arti |
| :--- | :--- |
| **Node sensor** (*sensor node*) | Perangkat kecil berbaterai yang tidur hampir sepanjang waktu, bangun sebentar untuk membaca sensor dan mengirim satu pesan pendek. Di proyek kita: Node 2. |
| **Node gateway** (*gateway node*, node gerbang) | Perangkat berlistrik tetap yang selalu bangun, mendengarkan node sensor, lalu meneruskan pesannya ke jaringan yang lebih besar. Di proyek kita: Node 1 untuk Node 2. |
| **ESP-NOW** | Protokol buatan Espressif untuk mengirim paket kecil (sampai 250 byte) langsung dari ESP32 ke ESP32 lain, tanpa router, alamat IP, atau kata sandi WiFi. |
| **Alamat MAC** | Alamat perangkat keras radio WiFi, 6 byte, misalnya `24:6F:28:B1:C7:D4`. ESP-NOW mengirim ke alamat ini; `device_id` adalah alamat MAC yang ditulis huruf kecil tanpa titik dua. |
| **ACK** (*acknowledgement*, tanda terima) | Balasan kecil dari radio penerima begitu bingkai tiba utuh. ACK berarti "radionya menerima", bukan "programnya sudah mengolah". |
| ***Unicast*** dan **siaran** (*broadcast*) | *Unicast*: paket ke satu alamat MAC, dibalas ACK, dan bisa dienkripsi. Siaran: paket ke `FF:FF:FF:FF:FF:FF` untuk semua yang mendengar, tanpa ACK dan tanpa enkripsi. |
| ***Channel*** (kanal, saluran) | Potongan frekuensi WiFi 2,4 GHz (1–13 di Indonesia). Pengirim dan penerima ESP-NOW harus berada di channel yang sama; ESP32 yang tidak tersambung ke router hanya boleh memakai 1–11. |
| ***Callback*** (fungsi panggil-balik) | Fungsi yang didaftarkan ke sistem lalu dipanggil saat sesuatu terjadi, misalnya paket ESP-NOW tiba. *Callback* ESP-NOW dijalankan petugas WiFi, bukan `loop()`. |
| **Antrean FreeRTOS** (*queue*) | "Kotak surat" yang menyalin setiap titipan utuh dari satu tugas ke tugas lain, misalnya dari *callback* ke `loop()`. |
| **Struct `packed`** | Susunan data dengan kolom-kolom rapat tanpa celah sehingga ukurannya sama persis di pengirim dan penerima (paket Node 2: 33 byte). |
| **`static_assert`** | Pemeriksaan saat kompilasi. Kalau syaratnya tidak terpenuhi, Arduino IDE menolak mengompilasi dan menampilkan pesannya. |
| ***Little-endian*** | Cara menyimpan angka lebih dari satu byte dengan byte terkecil lebih dulu: 300 (`0x012C`) tersimpan sebagai `2C 01`. |
| **`NAN`** (*not a number*, bukan angka) | Penanda bacaan `float` yang gagal. Saat Node 1 menyusun JSON, `NAN` ditulis sebagai `null`. |
| **Mode *forced*** (BME280) | BME280 mengukur sekali, lalu tidur sendiri sampai disuruh lagi. Lawannya mode *normal*, yang mengukur terus-menerus. |
| **Rak tunggu** (*store-and-forward*, simpan lalu teruskan) | Tempat di RAM Node 1 yang muat sampai 96 bacaan Node 2 selama broker tidak bisa dijangkau; isinya terbit setelah sambungan pulih, dengan `ts` waktu kejadiannya. |
| **`sesi` dan `urutan`** | Dua nomor di setiap paket Node 2. `urutan` naik satu setiap bangun; `sesi` berganti setiap Node 2 menyala dari mati. Dengan keduanya, Node 1 menghitung paket hilang dan membuang paket ganda. |
| **PMK dan LMK** | Dua kunci enkripsi ESP-NOW, masing-masing tepat 16 byte. PMK (kunci induk) mengamankan LMK; LMK (kunci pasangan) mengunci isi paket antara Node 1 dan Node 2. |
| **Kredensial** (*credential*) | Apa pun yang membuka akses: kata sandi WiFi, kata sandi MQTT, atau kunci enkripsi. Tidak pernah dikirim lewat ESP-NOW dan tidak pernah ikut ke GitHub. |

## 📝 Kuis (5 soal)

1. Node 2 melaporkan paket #57 `terkirim`, artinya ada ACK. Namun, bacaan itu tidak pernah muncul di MQTTX. Sebutkan dua kemungkinan penyebabnya, dan jelaskan mengapa ACK saja tidak cukup untuk membuktikan data sampai.
2. Router di rumahmu ternyata memilih channel 11 setelah dinyalakan ulang, padahal sebelumnya di channel 6. (a) Apa yang terjadi pada kiriman Node 2 berikutnya, dan berapa paket kira-kira hilang pada jadwal 5 menit? (b) Bagaimana mencegahnya? (c) Node 2 menemukan channel baru dengan memindai nama WiFi. Mengapa ia tidak butuh kata sandi WiFi untuk itu?
3. Mengapa *callback* terima ESP-NOW di Node 1 hanya menyalin paket ke kotak surat (antrean), dan tidak langsung memanggil `mqtt.publish()`?
4. Router mati pukul 10.05 sampai 10.35 WIB. Bacaan Node 2 pukul 10.10 baru terbit di broker pukul 10.37. Jam berapa yang tertulis di `ts`-nya, siapa yang membuatnya, dan apa yang terjadi pada grafik Node-RED kalau isian **X:**-nya bertipe **timestamp**?
5. Temanmu menyambungkan VCC sensor tanah Node 2 ke 3V3 "supaya kodenya lebih sederhana". Pakai tabel Konsep 9 untuk memperkirakan akibatnya pada umur baterai. Mengapa mengubah jadwal bangun menjadi 30 menit tidak menyelamatkannya?

<details>
<summary><b>Kunci jawaban</b></summary>

1. ACK dikirim **radio** Node 1 begitu bingkai tiba utuh, sebelum program Node 1 menyentuh isinya (Konsep 2). Setelah itu, program Node 1 masih bisa menolak paket karena alamat pengirimnya bukan `MAC_NODE2` (`ditolak`), karena versi formulirnya berbeda, atau membuangnya sebagai paket ganda (`dobel`). Paket dengan kunci yang salah juga dibalas ACK, lalu dibuang (Praktik 8). Kalaupun paketnya diterima, bacaan itu mungkin masih menunggu di rak karena WiFi, MQTT, atau jam Node 1 belum siap, atau MQTTX berlangganan topik yang salah. Bukti sampai yang sesungguhnya adalah hitungan `node2` di Node 1 dan pesan di broker.
2. (a) Node 1 ikut pindah ke channel 11, sedangkan Node 2 masih mengirim di channel 6 dari ingatan RTC-nya, jadi kirimannya `GAGAL`. Setelah dua kali bangun gagal berturut-turut, Node 2 memindai lagi, menemukan channel 11, dan kembali berhasil: sekitar **dua paket** hilang (10 menit). (b) Kunci channel router di 1, 6, atau 11 (Praktik 1.5). (c) Router menyiarkan namanya dan channel-nya dalam bingkai yang terbuka untuk semua perangkat; itulah yang terlihat saat HP menampilkan daftar WiFi. Membaca daftar itu tidak memerlukan kata sandi; kata sandi baru diperlukan untuk menyambung, dan Node 2 tidak pernah menyambung ke router (Konsep 3, 10).
3. *Callback* dijalankan oleh petugas WiFi, tugas berprioritas tinggi di inti 0, bersamaan dengan `loop()` di inti 1. Pekerjaan panjang di sana menahan petugas WiFi, padahal paket berikutnya bisa saja sedang tiba, dan sambungan MQTT tidak dirancang untuk dipakai dari dua tugas sekaligus. Data paket juga hanya sah selama *callback* berjalan. Jadi, *callback* cukup menyalin ke antrean, dan `loop()` yang memeriksa, menyusun JSON, dan menerbitkannya (Konsep 6).
4. `ts`-nya tetap **10.10 WIB** (ditulis dalam UTC: `03:10Z`). Node 1 yang membuatnya, dari waktu paket itu **tiba** di Node 1: jam sekarang dikurangi umur bacaan di rak (Konsep 7). Kalau isian **X:** grafik bertipe **timestamp**, semua bacaan susulan digambar pada waktu pesan tiba di Node-RED (sekitar 10.37) dan menumpuk di satu titik sehingga riwayat 30 menit itu tampak hilang.
5. Sensor tanah menyedot sekitar 5 mA terus-menerus, juga selama Node 2 tidur, karena pin 3V3 tetap berlistrik. Rata-rata arusnya naik dari sekitar 5,1 mA menjadi sekitar 10 mA di sisi 5 V, dan umur baterai turun dari sekitar 10 hari menjadi sekitar **5 hari**. Jadwal 30 menit tidak menolong karena hampir seluruh muatan habis selama tidur (Konsep 9): arus tidur yang membengkak tetap sama besar berapa pun jadwalnya, jadi umurnya tetap sekitar 5 hari. Obatnya: kembalikan kabel VCC ke D32 (Praktik 7.5).

</details>

---

## ✅ Checklist kelulusan Modul 14

Syarat lulus dari Silabus: **data Node 2 tampil di Node-RED dengan `device_id` sendiri, ≥ 90 % paket tiba saat router dimatikan, dan Node 2 bertahan ≥ 3 hari dari satu baterai 18650.** Jalur Wokwi: butir paket esp32 bisa dicentang tanpa papan, dan butir Node 1 v1.3.0, kartu Kebun, serta *commit* bisa dibuktikan dengan Node 2 tiruan (Praktik 3–5, ➕ C–E); butir dua papan, channel, sensor, arus, enkripsi, uji router, dan uji 72 jam menyusul setelah papan keduamu ada. Jalur laptop: semua butir berlaku, dengan laptop menggantikan Pi (`kebun.log` dan `uji72.log` dicatat di laptop).

- [ ] Paket esp32 3.3.12 terpasang, dan aku bisa menjelaskan mengapa kode ESP-NOW dari tutorial lama gagal dikompilasi (🧰, Konsep 6).
- [ ] Papan Node 2 mengirim sapaan ke papan Node 1 lewat ESP-NOW tanpa router, dan aku melihat `GAGAL` saat papan penerima dicabut (Kemenangan Cepat).
- [ ] Node 2 menemukan channel router dengan memindai nama WiFi, mengingatnya di memori RTC, dan memindai lagi setelah dua kali gagal (Praktik 1).
- [ ] Sensor Node 2 terbaca dengan urutan bangun yang hemat (BME280 mode *forced*, DS18B20 10 bit, sensor tanah dari D32), dan aku bisa membaca paket 33 byte-nya (Praktik 2).
- [ ] Node 1 v1.3.0 menerbitkan data Node 2 ke `rpm/<device_id Node 2>/telemetry` dan `/status`, dan pemeriksa kontrak 1.1 menulis `LULUS  (telemetry Node 2)` (Praktik 3–4).
- [ ] ⭐ Kartu Kebun di Node-RED menampilkan data Node 2 dengan `device_id`-nya sendiri, dan grafiknya memakai `ts` sebagai sumbu waktu (Praktik 5; jalur Wokwi: dengan Node 2 tiruan).
- [ ] ⭐ Saat router dimatikan 30 menit, paling sedikit 90 % paket Node 2 tiba di Node 1 menurut perintah `node2`, dan bacaannya muncul di Pi dengan `ts` waktu kejadiannya (Praktik 6).
- [ ] Aku mengukur arus Node 2 dengan INA219, menghitung umur baterainya, dan membuktikan dengan angka mengapa sensor tanah tidak boleh di 3V3 (Praktik 7).
- [ ] ESP-NOW terenkripsi dengan `kunci.h` yang dijaga `.gitignore`, dan kunci yang berbeda satu huruf membuat Node 1 berhenti menerima (Praktik 8).
- [ ] ⭐ Node 2 bertahan paling sedikit 72 jam dari satu kali isi baterai 18650, terbukti dari `uji72.log` (➕ B).
- [ ] Node 1 v1.3.0, Node 2 v1.0.0, `KONTRAK-DATA.md` 1.1, `PETA-PIN.md` 5, pemeriksa kontrak 1.1, dan flow Node-RED sudah di-*commit* dan di-*push* ke `rumah-pintar-mini`, tanpa `kunci.h` (➕ E).

> ➡️ **Modul berikutnya:** Modul 15 — Lab Modbus RTU/RS-485 & Memilih Protokol yang Tepat. Node 1 belajar membaca "sensor industri" lewat kabel RS-485 dua kawat yang bisa sepanjang ratusan meter, dan kamu menyusun peta untuk memilih protokol yang tepat: WiFi, ESP-NOW, RS-485, LoRa, Zigbee, atau NB-IoT. Modul 15 adalah *checkpoint* Fase 2.

---

## 📚 Sumber & atribusi gambar

**Dokumentasi, kode sumber, dan lembar data yang dipakai** (diakses Oktober 2026):

- Dokumentasi ESP-IDF 5.5.5: [ESP-NOW](https://docs.espressif.com/projects/esp-idf/en/v5.5.5/esp32/api-reference/network/esp_now.html) (bentuk bingkai, ACK, PMK dan LMK, batas 20 pasangan dan 7 pasangan berkunci, saran nomor urut dan antrean), [Wi-Fi Driver](https://docs.espressif.com/projects/esp-idf/en/v5.5.5/esp32/api-guides/wifi.html) (pemindaian, aturan negara "01" channel 1–11, mode hemat daya, sambung ulang), [Sleep Modes](https://docs.espressif.com/projects/esp-idf/en/v5.5.5/esp32/api-reference/system/sleep_modes.html) (mematikan WiFi sebelum tidur dalam), dan contoh resmi [wifi/espnow](https://github.com/espressif/esp-idf/tree/v5.5.5/examples/wifi/espnow) (CRC dan nomor urut, saran mematikan *modem sleep* di penerima). Kode sumber `esp_now.h` dan `Kconfig` dari [ESP-IDF](https://github.com/espressif/esp-idf/tree/v5.5.5) v5.5.5, dibandingkan dengan versi 4.4 sampai 6.0 untuk sejarah bentuk *callback*.
- [ESP-FAQ: ESP-NOW](https://docs.espressif.com/projects/esp-faq/en/latest/application-solution/esp-now.html) (ESP-NOW v2 1.470 byte, jumlah pasangan berkunci, WiFi dan ESP-NOW bersamaan) dan [ESP-Techpedia: perbandingan solusi *mesh*](https://docs.espressif.com/projects/esp-techpedia/en/latest/esp-friends/solution-introduction/mesh/mesh-comparison.html) (jarak ESP-NOW sekitar 150 m stabil dan 300 m di ruang terbuka, kurang dari 100 perangkat). Laporan [espressif/esp-idf#8577](https://github.com/espressif/esp-idf/issues/8577) (pasangan berkunci yang dulu masih menerima paket tanpa kunci, diperbaiki Espressif tahun 2022), [panduan migrasi ESP-IDF 5.0: Networking](https://github.com/espressif/esp-idf/blob/v5.5.5/docs/en/migration-guides/release-5.x/5.0/networking.rst) (paket siaran ESP-NOW bisa tetap tidak terenkripsi walaupun enkripsi dipasang; `des_addr` di *callback* terima untuk membedakannya), dan laporan [espressif/esp-idf#8574](https://github.com/espressif/esp-idf/issues/8574) (permintaan tahun 2022 supaya *callback* terima bisa membedakan paket siaran tanpa kunci: peniru bisa menyiarkan paket dengan alamat pengirim perangkat yang sudah berpasangan).
- Kode sumber [arduino-esp32](https://github.com/espressif/arduino-esp32/tree/3.3.12) 3.3.12 dan [catatan rilisnya](https://github.com/espressif/arduino-esp32/releases/tag/3.3.12): `WiFiScan`, `WiFiGeneric` (`setChannel`, `setSleep`), `STA.cpp` (sambung ulang otomatis), library `ESP_NOW` dan contoh-contohnya, library `BLE`, serta [perbaikan `setSleep()` di 3.3.7](https://github.com/espressif/arduino-esp32/pull/12296). Komponen [espressif/esp-now](https://github.com/espressif/esp-now) (estafet, *provisioning*, dan OTA lewat ESP-NOW).
- [ESP32 Series Datasheet](https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf) v5.3 (arus kirim dan terima, arus keluaran pin, rentang ADC), lembar data [BME280](https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bme280-ds002.pdf) (Bosch: mode *forced*, saran *weather monitoring*, chip ID), [DS18B20](https://cdn-shop.adafruit.com/datasheets/DS18B20.pdf) (waktu ukur per resolusi), dan [sensor tanah kapasitif DFRobot SEN0193](https://wiki.dfrobot.com/Capacitive_Soil_Moisture_Sensor_SKU_SEN0193) (arus sekitar 5 mA).
- Library: [Adafruit BME280](https://github.com/adafruit/Adafruit_BME280_Library) 2.3.0 (termasuk contoh `advancedsettings`), [DallasTemperature](https://github.com/milesburton/Arduino-Temperature-Control-Library) 4.0.6 (`setResolution()` yang hanya menulis kalau berbeda), [OneWire](https://github.com/PaulStoffregen/OneWire) 2.3.8, [Adafruit INA219](https://github.com/adafruit/Adafruit_INA219) 1.2.3, dan [ArduinoJson](https://github.com/bblanchon/ArduinoJson) 7.4.3 (`NAN` ditulis sebagai `null`, angka `float` tanpa nol di belakang).
- [FlowFuse Dashboard](https://dashboard.flowfuse.com/) 1.33.0: widget [chart](https://dashboard.flowfuse.com/nodes/widgets/ui-chart.html) (isian **X:** bertipe **key:**) dan [notification](https://dashboard.flowfuse.com/nodes/widgets/ui-notification.html); fungsi tanggal [JSONata](https://docs.jsonata.org/date-time-functions) (`$toMillis`, `$millis`); halaman manual [mosquitto_sub](https://mosquitto.org/man/mosquitto_sub-1.html) (format keluaran `-F` dengan `%I` dan `%p`).
- BLE: [nRF Connect for Mobile](https://www.nordicsemi.com/Products/Development-tools/nRF-Connect-for-mobile) dan kursus [Bluetooth Low Energy Fundamentals](https://academy.nordicsemi.com/courses/bluetooth-low-energy-fundamentals/) (Nordic Semiconductor), serta basis data nomor [bluetooth-numbers-database](https://github.com/NordicSemiconductor/bluetooth-numbers-database) (`0x181A` *Environmental Sensing*, `0x2A6E` *Temperature*).
- Wokwi: [ESP32 Simulation](https://docs.wokwi.com/guides/esp32) (fitur yang didukung), [ESP32 WiFi Networking](https://docs.wokwi.com/guides/esp32-wifi) (`Wokwi-GUEST` di channel 6), dan permintaan fitur [ESP-NOW antarpapan](https://github.com/wokwi/wokwi-features/issues/446) yang masih terbuka. *Mesh* WiFi: [painlessMesh](https://gitlab.com/painlessMesh/painlessMesh).

**Gambar.** Diagram dan ilustrasi buatan sendiri dilisensikan **CC BY 4.0**, dan file sumber `.svg`-nya disertakan di folder `aset/` supaya bisa kamu ubah. Tangkapan layar Node-RED dan dashboard diambil dari Node-RED 5.0.8 dan FlowFuse Dashboard 1.33.0 yang dijalankan di laptop penulis, dengan data dari Node 2 tiruan; Node-RED dan FlowFuse Dashboard berlisensi Apache 2.0, dan "Node-RED" adalah merek dagang OpenJS Foundation. Rekap lengkap juga ada di [`aset/SUMBER.md`](aset/SUMBER.md).

| File | Sumber | Lisensi / keterangan |
| :--- | :--- | :--- |
| `peta-jalan-modul-14`, `dari-kebun-ke-hp`, `esp-now-vs-wifi`, `channel-radio`, `kotak-surat-callback` (`.png` + `.svg`) | Diagram orisinal kurikulum Fullstack IoT Developer. Perilaku ESP-NOW, channel, dan *callback* dari dokumentasi ESP-IDF 5.5.5 dan kode sumber arduino-esp32 3.3.12; alamat dan `device_id` hanya contoh. | CC BY 4.0 |
| `bangun-node2`, `peta-paket-33-byte`, `jembatan-rak-tunggu`, `umur-baterai-node2`, `diagram-proyek-modul-14` (`.png` + `.svg`) | Diagram orisinal. Urutan bangun dan susunan paket dari firmware Node 2 v1.0.0; deretan byte contoh dari Praktik 2 di Wokwi; arus dan umur baterai adalah perkiraan dengan cara Konsep 9, bukan rekaman alat ukur. | CC BY 4.0 |
| `rangkaian-node2` (`.png` + `.svg`) | Ilustrasi orisinal, lubang dan pin persis seperti tabel Praktik 2; rangkaian baterai melanjutkan ilustrasi Modul 9. | CC BY 4.0 |
| `grafik-ts-vs-tiba.png`, `hp-kebun.png` | Tangkapan layar asli FlowFuse Dashboard 1.33.0 selebar layar HP (412 piksel) dari laptop penulis, dengan data Node 2 tiruan; judul, tanda, dan keterangan oleh penulis, ditambah bingkai HP dan nomor di `hp-kebun.png`. | FlowFuse Dashboard berlisensi Apache 2.0; gambar: CC BY 4.0 |
| `impor-kebun.png` | Tangkapan layar asli editor Node-RED 5.0.8 dari laptop penulis saat potongan flow Kebun diimpor; judul, nomor, tanda, dan keterangan oleh penulis. | Node-RED berlisensi Apache 2.0 ("Node-RED" merek dagang OpenJS Foundation); gambar: CC BY 4.0 |

**Tentang kotak Hasilnya.** Semua sketsa dan firmware modul ini sudah dikompilasi dengan paket esp32 3.3.12 untuk papan yang dipakai di praktiknya (Node 1 v1.3.0: 1.181.860 byte tanpa `kunci.h` dan 1.184.460 byte dengan `kunci.h`; Node 2 v1.0.0: 939.748 byte). Yang bisa disimulasikan sudah dijalankan di Wokwi: pencarian channel `Wokwi-GUEST`, sensor Node 2 sebagian (Praktik 2), dan jembatan Node 1 dengan Node 2 tiruan (Praktik 3); keluarannya dikutip apa adanya. Pemeriksa kontrak 1.0 dan 1.1 dijalankan di laptop penulis terhadap broker uji, dan flow Kebun diuji di Node-RED 5.0.8 dengan FlowFuse Dashboard 1.33.0. Di meja penulis tidak ada dua papan ESP32 dan tidak ada Raspberry Pi, jadi kotak **Hasilnya** dari dua papan sungguhan dan dari Pi bertanda **contoh**: susunan dan teks setiap barisnya berasal dari kode yang sama, sedangkan alamat, channel, kekuatan sinyal, jam, dan angka arusnya hanya contoh.

---

[⬅️ Modul 13](../modul-13-node-red-dashboard/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · **Berikutnya: Modul 15 — Lab Modbus RTU/RS-485 & Memilih Protokol yang Tepat** (segera terbit; [ringkasannya di Silabus](../../SILABUS.md#modul-15--lab-modbus-rturs-485--memilih-protokol-yang-tepat))
