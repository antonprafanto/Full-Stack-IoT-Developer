# Modul 11 — MQTT: Bahasa Resmi Dunia IoT & Kontrak Data Proyek

🌐 **Bahasa Indonesia** · [English](../../en/phase-2-connectivity/module-11-mqtt-and-data-contract/README.md)

*Fase 2 · Minggu 11 · Perangkat keras (*hardware*): **meja kerja Node 1 dari Modul 10** dan **laptop** yang menjadi broker (lihat 🧰) — tanpa komponen baru · Prasyarat: **Modul 10** (Node 1 v1.1) · Waktu: 8–10 jam, dicicil dalam seminggu*

[⬅️ Modul 10](../modul-10-wifi-dan-http/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · [Modul 12 ➡️](../modul-12-raspberry-pi-dan-linux/README.md)

---

Di Modul 10, Node 1 mulai berbicara dengan jaringan: tersambung ke WiFi rumah, tahu jam yang tepat, mengirim bacaannya ke laptop, dan lampunya bisa dimatikan dari HP. Namun, caranya masih seperti **surat pribadi**. Node 1 harus tahu alamat laptopmu, HP-mu harus tahu alamat Node 1, dan setiap perangkat baru berarti satu alamat baru yang harus dicatat. Minggu ini kita memasang satu "kantor pos" bersama bernama **broker MQTT**. Setiap perangkat cukup tahu alamat broker, lalu berkirim pesan lewat broker itu.

| Yang terjadi sekarang | Penyebabnya | Obatnya minggu ini |
| :--- | :--- | :--- |
| Node 1 harus tahu alamat IP laptop, dan HP harus tahu alamat Node 1. Kalau satu alamat berubah, kiriman atau tautan langsung gagal. | Setiap pengirim berbicara langsung dengan setiap penerima. | Satu broker di tengah: semua perangkat cukup tahu alamat broker (Konsep 1–4, Praktik 1–3) |
| Laptop tidak bisa membedakan Node 1 yang sedang diam dengan Node 1 yang mati. | Lewat HTTP, Node 1 hanya terdengar saat mengirim surat. | Status *online*/*offline* otomatis lewat pesan *retained* yang disimpan broker dan wasiat *Last Will* (Konsep 7, Praktik 4) |
| Tautan `/on` dan `/off` tidak pernah memastikan perintahnya benar-benar dikerjakan. | Tidak ada jawaban resmi dari perangkat. | Pola perintah → `ack` (Konsep 8, Praktik 6) |
| Gerakan di depan PIR baru terlihat di laptop paling lambat semenit kemudian. | Kiriman hanya mengikuti jadwal tetap. | Kirim setiap 10 detik, dan **segera** saat ada kejadian penting (Konsep 8, Praktik 7) |
| Bentuk JSON belum "dikunci": bacaan gagal masih bercampur dengan angka `-1`. | Belum ada kesepakatan tertulis dan alat pemeriksanya. | `KONTRAK-DATA.md`, `null` untuk bacaan gagal, dan alat pemeriksa kontrak (Konsep 5, Praktik 8–9) |

Di akhir minggu, **Node 1 v1.2** berbicara sepenuhnya lewat MQTT. Setiap 10 detik ia menerbitkan bacaan kelima sensornya, dan langsung mengabari begitu ada kejadian penting, misalnya gerakan atau tempat yang menjadi gelap. Setiap 5 menit ia melaporkan kesehatannya. Statusnya otomatis berganti menjadi `offline` kalau ia mati, dan setiap perintah dari laptop dijawab dalam waktu kurang dari 1 detik. Tautan `/on` dan `/off` dari Modul 10 dipensiunkan. Semuanya masih **di dalam jaringan rumahmu**: broker di laptop belum memakai kata sandi, dan mengamankannya adalah urusan Modul 21 dan 27.

![Peta jalan Modul 11. Atas, enam fase kurikulum dari Fase 0 Fondasi (Modul 1–4) sampai Fase 5 Operasi dan skala (Modul 26–32); Fase 2 Konektivitas, Modul 10 sampai 15, disorot. Modul 1 sampai 10 bertanda selesai, dan Modul 11 ditandai KAMU DI SINI dengan catatan: Node 1 berbicara lewat broker MQTT, dengan kontrak data proyek. Bawah, kotak Modul 11 minggu ini, 8 sampai 10 jam dicicil, tanpa komponen baru, laptop menjadi broker; ⭐ berarti wajib untuk lulus. Kiri: KC, Kemenangan Cepat, halo lewat broker publik; P1 pasang broker Mosquitto di laptop; P2 berkirim pesan dari terminal dan MQTTX; P3 ESP32 menerbitkan telemetry ke broker; P4 status online/offline otomatis; P5 QoS 0 vs QoS 1 saat WiFi ESP32 mati. Kanan: P6 perintah dari MQTTX, dijawab ack; P7 kirim segera saat ada kejadian; P8 alat pemeriksa kontrak data; P9 diagram pub/sub dan KONTRAK-DATA.md ⭐; plus, Tambahan: Node 1 v1.2 lewat MQTT ⭐. Tanda bintang menandai P9 dan bagian Tambahan sebagai syarat lulus](aset/peta-jalan-modul-11.png)

> [!NOTE]
> **Cara memakai modul ini.**
>
> - Semua praktik memakai **papan Node 1** di meja kerjamu, yang selama praktik dicolokkan ke laptop seperti di Modul 10. MB102 baru perlu dinyalakan mulai Praktik 6, saat relay dan PIR dipakai, dan di bagian ➕.
> - **Laptopmu menjadi broker.** Program broker bernama Mosquitto berjalan di terminal VS Code dan harus tetap terbuka selama praktik, sama seperti penerima di Modul 10.
> - Setiap kotak kode punya tombol salin di pojok kanan atasnya. Semua sketsa juga tersedia sebagai file di folder [`kode/`](kode/).
> - Kotak yang didahului kata **Hasilnya** hanya untuk dicocokkan, bukan diketik. Angka di papanmu pasti berbeda.
> - **Wokwi bisa menjalankan semua sketsa minggu ini, asal memakai broker publik.** Layanan gratis Wokwi hanya mengizinkan sambungan keluar, jadi ESP32 simulasi tidak bisa menjangkau broker di laptopmu. Caranya ada di setiap praktik. Hanya satu bukti kelulusan yang tetap butuh papan asli, yaitu `ack` di bawah 1 detik (➕ E): lewat broker publik, jawabannya butuh 1–2 detik. Kotak **Hasilnya** yang bertanda **rekaman Wokwi** berasal langsung dari simulator. Selebihnya bertanda **contoh**. Untuk Serial Monitor, susunan barisnya mengikuti kode sketsa dan rekaman Wokwi, tetapi alamat, `device_id`, dan angkanya diganti dengan contoh dari jaringan rumah. Keluaran terminal Mosquitto disusun dari teks di kode sumber Mosquitto, bukan direkam (lihat 📚).
> - Pengguna macOS: ganti **Ctrl** dengan **Cmd** untuk menyimpan, memilih semua, menyalin, menempel, dan membuat tab baru.

> [!WARNING]
> **Aturan aman minggu ini.**
>
> 1. **Broker di laptop sengaja dibuat tanpa kata sandi**, khusus untuk latihan di jaringan rumah. Siapa pun yang tersambung ke WiFi rumahmu bisa membaca dan mengirim pesan lewat broker itu, termasuk perintah untuk relay. Jangan membuat *port forwarding*, dan **matikan broker** (tekan **Ctrl + C** di terminalnya) sebelum laptop tersambung ke WiFi umum, misalnya di kafe atau kampus. Cara menguncinya dibahas di Modul 21 dan 27.
> 2. **Broker publik seperti grup obrolan yang terbuka untuk umum:** siapa pun bisa membaca dan menulis di sana. Kemenangan Cepat memakainya hanya untuk pesan "halo". Jangan pernah mengirim kata sandi, data pribadi, atau perintah untuk perangkat sungguhan lewat broker publik.
> 3. **Perintah dari jauh menggerakkan benda sungguhan.** Sebelum mengirim perintah pompa atau tirai, pastikan selang terarah ke pot dan tidak ada yang menghalangi servo. Pompa tetap dibatasi 1–10 detik dan ditolak kalau air tandon kurang (Modul 6).
> 4. **Kata sandi WiFi tetap di `secrets.h`** yang diabaikan Git (Modul 10, Praktik 1).
> 5. **Aturan emas catu daya Modul 5 tetap berlaku:** relay mendapat listrik dari MB102, ESP32 dari USB atau *charger*-nya, dan urutan nyala-matinya tetap sama.

Ritme modul ini sama dengan Modul 1–10. Bagian lipat di 🚨 (klik judulnya) cukup dibuka saat kamu membutuhkannya; bagian lipat di 🔬 boleh dilewati. Setiap praktik diawali kotak **🖥️** yang menyebut alat dan komponen yang dipakai.

## Daftar isi

1. [🎯 Setelah modul ini kamu bisa…](#-setelah-modul-ini-kamu-bisa)
2. [🧰 Yang perlu disiapkan](#-yang-perlu-disiapkan)
3. [🏆 Kemenangan Cepat: halo lewat broker MQTT (15 menit)](#-kemenangan-cepat-halo-lewat-broker-mqtt-15-menit)
4. [🧠 Konsep "Mengapa"](#-konsep-mengapa)
   - [1 HTTP vs MQTT](#1-mengapa-http-saja-tidak-cukup-surat-pribadi-vs-grup-obrolan) · [2 Pub/sub](#2-publishsubscribe-broker-seperti-server-grup-whatsapp) · [3 Mosquitto](#3-broker-di-laptop-mosquitto-dua-baris-konfigurasi-dan-firewall) · [4 Topik & wildcard](#4-topik-dan-wildcard-alamat-pesan-yang-bertingkat) · [5 Kontrak data](#5-kontrak-data-lima-topik-dan-satu-bentuk-json-untuk-semua) · [6 QoS](#6-qos-surat-biasa-surat-tercatat-dan-kurir-bertanda-tangan) · [7 Retained & wasiat](#7-retained-last-will-dan-keep-alive-papan-pengumuman-surat-wasiat-dan-detak-jantung) · [8 Kapan mengirim](#8-kapan-mengirim-dan-menjawab-setiap-10-detik-segera-saat-penting-dan-perintah--ack) · [9 Ukuran pesan](#9-ukuran-pesan-wadah-256-byte-yang-membuang-diam-diam) · [10 Tidak macet](#10-jangan-sampai-mqtt-membuat-node-1-macet)
5. [🔧 Praktik langkah demi langkah](#-praktik-langkah-demi-langkah)
   - [1 Pasang Mosquitto](#praktik-1--pasang-broker-mosquitto-di-laptop-30-menit) · [2 Terminal & MQTTX](#praktik-2--berkirim-pesan-dari-terminal-dan-mqttx-20-menit) · [3 Telemetry](#praktik-3--esp32-menerbitkan-telemetry-ke-broker-laptop-30-menit) · [4 Online/offline](#praktik-4--status-onlineoffline-otomatis-20-menit) · [5 QoS](#praktik-5--qos-0-vs-qos-1-saat-wifi-esp32-mati-25-menit) · [6 Perintah → ack](#praktik-6--perintah-dari-mqttx-dijawab-ack-30-menit) · [7 Kirim segera](#praktik-7--kirim-segera-saat-ada-kejadian-20-menit) · [8 Pemeriksa kontrak](#praktik-8--alat-pemeriksa-kontrak-20-menit) · [9 Diagram & kontrak](#praktik-9--diagram-pubsub-dan-kontrak-datamd-20-menit)
6. [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)
7. [🔬 Bedah Teknis (opsional)](#-bedah-teknis-opsional)
8. [🧩 Tantangan mandiri](#-tantangan-mandiri)
9. [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini)
10. [📖 Glosarium](#-glosarium) · [📝 Kuis](#-kuis-5-soal) · [✅ Checklist kelulusan](#-checklist-kelulusan-modul-11)
11. [📚 Sumber & atribusi gambar](#-sumber--atribusi-gambar)

---

## 🎯 Setelah modul ini kamu bisa…

- **Menjelaskan cara kerja *publish/subscribe*** (menerbitkan/berlangganan) dengan analogi grup WhatsApp, lalu menggambar diagram *pub/sub* proyekmu sendiri.
- **Memasang dan menjalankan broker Mosquitto** di laptop, lengkap dengan dua baris konfigurasinya dan izin *firewall*.
- **Berkirim pesan lewat broker** dari terminal (`mosquitto_pub` dan `mosquitto_sub`) dan dari aplikasi MQTTX, termasuk memakai *wildcard* (karakter pengganti) `+` dan `#`.
- **Membuat ESP32 menerbitkan JSON sesuai kontrak data** dan menerima perintah, tanpa pernah membuat programnya macet.
- **Menjelaskan dan menguji QoS 0 dan 1, pesan *retained*, wasiat (*Last Will*), dan detak jantung (*keep-alive*)**.
- **Memakai pola perintah → `ack`** dan kiriman segera saat ada kejadian penting (*report-by-exception*).
- **Memeriksa pesan dengan alat pemeriksa kontrak** di laptop, lalu menulis `KONTRAK-DATA.md` untuk proyekmu.
- **Memasang Node 1 v1.2** yang seluruh komunikasinya berjalan lewat MQTT.

---

## 🧰 Yang perlu disiapkan

Minggu ini **tidak ada komponen baru**. Yang baru adalah programnya: satu broker di laptop dan satu aplikasi untuk mengintip pesan.

| Apa | Keterangan |
| :--- | :--- |
| **Meja kerja Node 1 dari Modul 10** | Lengkap, dengan firmware Node 1 v1.1. Selama praktik, papan Node 1 dicolokkan ke laptop; *charger*-nya dipakai lagi di akhir bagian ➕. |
| **Laptop** | Tersambung ke WiFi yang **sama** dengan ESP32, seperti di Modul 10. Laptop inilah yang menjadi broker. Siapkan VS Code, Node.js 24, dan folder `rumah-pintar-mini/alat` dari Modul 4. |
| **Alamat IP laptopmu** | Cara mencarinya ada di Praktik 7.1 Modul 10. Alamat laptop bisa berubah setelah laptop tidur atau router dinyalakan ulang; kalau bisa, buat pemesanan alamat tetap (*DHCP reservation*) untuk laptop di router, sama seperti untuk Node 1 di Praktik 9 Modul 10. |
| **WiFi 2,4 GHz dan tab `secrets.h`** | Sama dengan Modul 10. Setiap sketsa latihan minggu ini dimulai dari sketsa Modul 10, jadi `secrets.h` ikut tersalin. |
| **Internet** | Untuk Kemenangan Cepat (broker publik), jam NTP, dan mengunduh program. |
| **Mosquitto, MQTTX, dan library baru** | Dipasang saat dibutuhkan: MQTTX dan library **PubSubClient3** di Kemenangan Cepat, Mosquitto di Praktik 1, library `mqtt` untuk Node.js di Praktik 8. |

**Versi yang dipakai di modul ini:**

| Alat | Versi | Catatan |
| :--- | :--- | :--- |
| Arduino IDE | **2.3.x** (saat ditulis: 2.3.10) | Sejak Modul 2. |
| Paket papan **esp32 by Espressif Systems** | **3.3.x** (saat ditulis: 3.3.12) | Sejak Modul 2. Paket ini tidak membawa library MQTT bergaya Arduino (klien bawaan ESP-IDF-nya dibahas di 🔬). |
| Library **PubSubClient3** (by Nick O'Leary, dirawat Holger Mueller) | **3.3.2** | Baru (Kemenangan Cepat). Penerus library **PubSubClient** lama (2.8), yang sejak Juni 2026 resmi tidak dirawat lagi. |
| Library **ArduinoJson** (by Benoit Blanchon) | **7.4.3** | Sejak Modul 10. |
| Library **DHT sensor library** (by Adafruit) | **1.4.7** | Sejak Modul 6; dipakai lagi di Praktik 3. |
| Mosquitto | **2.1.2** (Windows dan macOS) | Baru (Praktik 1). Di Linux, versi dari paket distribusinya, misalnya 2.0.18 di Ubuntu 24.04. |
| MQTTX | **1.13.1** | Baru (Kemenangan Cepat). |
| Node.js | **24.21.0** | Sejak Modul 4. |
| Library **mqtt** untuk Node.js | **5.16.1** | Baru (Praktik 8), dipasang dengan `npm install`. |

---

## 🏆 Kemenangan Cepat: halo lewat broker MQTT (15 menit)

Di Modul 10, ESP32 harus tahu alamat laptopmu untuk mengirim surat. Sekarang kita coba cara lain: ESP32 dan laptop sama-sama menyambung ke satu "kantor pos" di internet bernama **broker**, lalu saling berkirim pesan lewat sana. Keduanya **tidak perlu tahu alamat satu sama lain**.

> 🖥️ **Alat yang dipakai di bagian ini:** **Arduino IDE** dan **Serial Monitor**, **papan Node 1** yang dicolokkan ke laptop (MB102 boleh tetap mati), WiFi 2,4 GHz yang tersambung ke internet, dan aplikasi **MQTTX** di laptop (dipasang di langkah 1). Belum punya papan? Lihat catatan Wokwi di akhir bagian ini.
>
> **Node 1 masih hidup dari *charger*-nya sejak bagian ➕ Modul 10?** Pindahkan dulu ke laptop dengan urutan aturan emas: **matikan MB102**, cabut kabel USB papan Node 1 dari *charger*, lalu colokkan ke laptop. Biarkan MB102 mati sampai Praktik 6.

1. **Pasang MQTTX**, aplikasi untuk mengintip dan mengirim pesan MQTT. Buka [mqttx.app/downloads](https://mqttx.app/downloads), lalu unduh versi **1.13.1** untuk laptopmu:
   - **Windows:** `MQTTX-Setup-1.13.1-x64.exe` (Windows 64-bit, dipakai hampir semua laptop). Jalankan file itu dan ikuti petunjuk penginstalnya sampai selesai.
   - **macOS:** `MQTTX-1.13.1-arm64.dmg` untuk Mac dengan chip Apple (M1 dan sesudahnya), atau `MQTTX-1.13.1.dmg` untuk Mac Intel. Buka file `.dmg`-nya, lalu seret **MQTTX** ke folder **Applications**.
   - **Linux:** di Ubuntu atau Debian, unduh paket `MQTTX_1.13.1_amd64.deb`, buka terminal di folder unduhannya, lalu ketik `sudo apt install ./MQTTX_1.13.1_amd64.deb`. Distribusi lain bisa memakai `MQTTX-1.13.1.AppImage`: beri izin jalan dengan `chmod +x MQTTX-1.13.1.AppImage`, lalu jalankan dengan `./MQTTX-1.13.1.AppImage`.
2. **Pasang library PubSubClient3** di Arduino IDE. Buka **Library Manager** (ikon buku di bilah kiri, atau **Tools → Manage Libraries…**), lalu ketik **PubSubClient3** di kotak pencarian. Pada kartu **PubSubClient3**, pilih versi **3.3.2**, lalu klik **INSTALL**. Nama penulis di kartunya memang `Nick O'Leary`, pembuat library aslinya; yang membedakan adalah angka **3** di belakang namanya.

   > ⚠️ **Pernah memasang library PubSubClient (tanpa angka 3) dari tutorial lain?** Ketik **PubSubClient** di kotak pencarian. Kalau kartu **PubSubClient** bertuliskan `2.8.0 installed`, klik **REMOVE** lalu jawab **Yes** di jendela `Uninstall`. Kedua library memakai nama file yang sama (`PubSubClient.h`), dan kalau keduanya terpasang, Arduino IDE diam-diam memakai yang lama. Sketsa di modul ini menolak dikompilasi kalau itu terjadi, dengan pesan `Yang terpakai PubSubClient lama (2.8)`.
3. Buka sketsa `modul10_halo_wifi` dari Modul 10, pilih **File → Save As…**, lalu simpan di folder **`modul-11`** repositori `belajar-iot` (buat foldernya kalau belum ada) dengan nama `modul11_halo_broker`. Tab `secrets.h` ikut tersalin. Ganti **seluruh** isi tab utama dengan kode ini:

   ```cpp
   // Modul 11 - Kemenangan Cepat: halo lewat broker MQTT
   // ESP32 menerbitkan pesan "halo" ke broker publik setiap 5 detik, lalu mencetak pesan apa pun
   // yang kamu kirim ke topiknya dari MQTTX di laptop.
   // Broker publik = grup obrolan terbuka: siapa pun bisa ikut membaca. Jangan pernah mengirim rahasia lewat sini.

   #include <WiFi.h>
   #include <PubSubClient.h>  // library PubSubClient3 versi 3.3.2 (pasang lewat Library Manager)
   #include "secrets.h"       // berisi WIFI_NAMA dan WIFI_SANDI, seperti di Modul 10

   #ifndef MQTT_QOS1  // hanya PubSubClient3 yang punya nama ini
   #error "Yang terpakai PubSubClient lama (2.8). Hapus lewat Library Manager, lalu pasang PubSubClient3 versi 3.3.2."
   #endif

   const char ALAMAT_BROKER[] = "broker.emqx.io";  // broker publik, sama dengan bawaan MQTTX
   const uint16_t PORT_BROKER = 1883;              // pintu MQTT tanpa enkripsi
   const unsigned long JEDA_HALO = 5000;           // satu pesan halo setiap 5 detik

   WiFiClient klienJaringan;          // sambungan TCP ke broker
   PubSubClient mqtt(klienJaringan);  // MQTT berjalan di atas sambungan itu
   char kode[7];                      // 6 karakter heksadesimal acak supaya topikmu tidak sama dengan topik pembaca lain
   char idKlien[24];                  // nama ESP32 di broker, harus unik
   char topikKirim[40];               // belajar-iot/<kode>/dari-esp32
   char topikTerima[40];              // belajar-iot/<kode>/dari-laptop
   unsigned long waktuHaloTerakhir = 0;
   int nomorHalo = 0;

   // Dipanggil library setiap ada pesan masuk di topik yang kita langgani.
   void saatPesanMasuk(char* topik, byte* isi, unsigned int panjang) {
     Serial.printf("Pesan masuk di %s: ", topik);
     Serial.write(isi, panjang);  // isi pesan tidak diakhiri tanda akhir teks: cetak sepanjang 'panjang'
     Serial.println();
   }

   void sambungkanBroker() {
     Serial.printf("Menyambung ke broker %s ...\n", ALAMAT_BROKER);
     while (!mqtt.connect(idKlien)) {  // menunggu di sini boleh untuk Kemenangan Cepat ini
       Serial.printf("Gagal (kode %d). Coba lagi 3 detik lagi.\n", mqtt.state());
       delay(3000);
     }
     mqtt.subscribe(topikTerima);  // langganan topik pesan dari laptop
     Serial.println("Tersambung ke broker!");
     Serial.printf("Di MQTTX, langganan topik: belajar-iot/%s/#\n", kode);
     Serial.printf("Kirim pesan ke ESP32 lewat topik: %s\n", topikTerima);
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     Serial.println();
     snprintf(kode, sizeof(kode), "%06lx", (unsigned long)(esp_random() & 0xFFFFFF));  // misalnya 3f9a1c
     snprintf(idKlien, sizeof(idKlien), "belajar-iot-%s", kode);
     snprintf(topikKirim, sizeof(topikKirim), "belajar-iot/%s/dari-esp32", kode);
     snprintf(topikTerima, sizeof(topikTerima), "belajar-iot/%s/dari-laptop", kode);

     Serial.printf("Menyambung ke WiFi \"%s\"", WIFI_NAMA);
     WiFi.mode(WIFI_STA);
     WiFi.begin(WIFI_NAMA, WIFI_SANDI);
     while (WiFi.status() != WL_CONNECTED) {
       Serial.print(".");
       delay(250);
     }
     Serial.println(" tersambung!");

     mqtt.setServer(ALAMAT_BROKER, PORT_BROKER);
     mqtt.setCallback(saatPesanMasuk);
     sambungkanBroker();
   }

   void loop() {
     if (!mqtt.connected()) {
       sambungkanBroker();  // sambungan ke broker putus: sambungkan lagi
     }
     mqtt.loop();  // wajib dipanggil sesering mungkin: menerima pesan dan menjaga sambungan tetap hidup

     if (millis() - waktuHaloTerakhir >= JEDA_HALO) {
       waktuHaloTerakhir = millis();
       nomorHalo++;
       char pesan[40];
       snprintf(pesan, sizeof(pesan), "Halo dari ESP32 ke-%d", nomorHalo);
       mqtt.publish(topikKirim, pesan);
       Serial.printf("Terkirim ke %s: %s\n", topikKirim, pesan);
     }
   }
   ```

4. Pastikan papan yang terpilih **ESP32 Dev Module** dengan **Partition Scheme** **Minimal SPIFFS** dan **Flash Mode** **DIO**, setelan sejak bagian ➕ A Modul 10, dan port-nya benar. Lalu klik **Upload**. Begitu `Done uploading` muncul, buka **Serial Monitor** (**115200 baud**). Kalau baris pertama tidak terlihat, tekan tombol **EN** di papan ESP32.

   **Hasilnya** (rekaman Wokwi; di papanmu, nama WiFi dan kode topiknya berbeda):

   ```text
   Menyambung ke WiFi "Wokwi-GUEST"................. tersambung!
   Menyambung ke broker broker.emqx.io ...
   Tersambung ke broker!
   Di MQTTX, langganan topik: belajar-iot/5230e8/#
   Kirim pesan ke ESP32 lewat topik: belajar-iot/5230e8/dari-laptop
   Terkirim ke belajar-iot/5230e8/dari-esp32: Halo dari ESP32 ke-1
   ```

   Catat **kode topikmu**: enam karakter acak (angka `0`–`9` dan huruf `a`–`f`) di tengah topik, misalnya `5230e8`. Kode ini dibuat ulang setiap kali ESP32 menyala: kalau nanti kamu menekan **EN** atau mengunggah ulang, pakai kode yang baru untuk langganan di MQTTX (langkah 6) dan untuk topik kirim (langkah 7).
5. **Sambungkan MQTTX ke broker yang sama.** Di MQTTX, klik tombol **+ New Connection** di tengah layar (kalau sudah pernah membuat sambungan: ikon **+** di bilah paling kiri). Isi **Name** dengan `Broker publik`. Kolom **Host** sudah berisi `mqtt://` dan `broker.emqx.io`, dan **Port** sudah `1883`: itulah broker publik yang dipakai ESP32-mu. Klik **Connect** di pojok kanan atas, lalu tunggu sampai muncul `Connected`.
6. **Berlangganan topik ESP32-mu.** Klik **New Subscription**. Di kolom **Topic**, hapus isi bawaannya (`testtopic/#`), lalu ketik `belajar-iot/` + kode topikmu + `/#`, misalnya `belajar-iot/5230e8/#`, dan klik **Confirm**. Setiap 5 detik, pesan `Halo dari ESP32 ke-…` muncul di MQTTX.
7. **Balas dari laptop.** Di kotak kirim di bagian bawah MQTTX, ubah pilihan format dari **JSON** menjadi **Plaintext**. Isi kolom **Topic** dengan topik `dari-laptop` milikmu (yang tercetak di Serial Monitor), ketik `Halo juga dari laptop!` di kotak isi pesan, lalu klik tombol kirim (ikon pesawat kertas) atau tekan **Ctrl + Enter**. Serial Monitor langsung menulis `Pesan masuk di …: Halo juga dari laptop!`. Di MQTTX, pesanmu tampil dua kali, sebagai pesan terkirim dan sebagai pesan masuk, karena MQTTX ikut berlangganan `belajar-iot/<kode>/#`; itu wajar.

![Ilustrasi MQTTX 1.13.1, bukan tangkapan layar: mengobrol dengan ESP32 lewat broker publik (Kemenangan Cepat langkah 5 sampai 7; kode topik 5230e8 hanya contoh, pakai kode yang tercetak di Serial Monitor-mu). Paling kiri, bilah ikon dengan ikon + untuk membuat sambungan baru (penanda 1). Di sebelahnya, daftar Connections dengan sambungan Broker publik, tertulis Broker publik@broker.emqx… dengan huruf hijau tanda tersambung. Tengah, kepala Broker publik, dengan pemberitahuan Connected yang muncul sebentar di kanan atas; di bawahnya, tombol + New Subscription (penanda 2) dan langganan belajar-iot/5230e8/# dengan QoS 0. Kanan, tab All, Received, dan Published, lalu tiga gelembung pesan: diterima, Topic belajar-iot/5230e8/dari-esp32 QoS 0, Halo dari ESP32 ke-1; terkirim, Topic belajar-iot/5230e8/dari-laptop QoS 0, Halo juga dari laptop!; diterima, Topic belajar-iot/5230e8/dari-laptop QoS 0, Halo juga dari laptop!, yaitu pesan kirimanmu sendiri yang kembali dari broker karena MQTTX ikut berlangganan belajar-iot/5230e8/#. Bawah, kotak kirim: pilihan format Plaintext (penanda 3), QoS 0, kotak Retain tidak dicentang, kolom topik belajar-iot/5230e8/dari-laptop, isi pesan Halo juga dari laptop!, dan tombol kirim berikon pesawat kertas (penanda 4). Keterangan: 1, ikon + di bilah kiri, yaitu New Connection (selama MQTTX belum punya sambungan, tombol + New Connection juga ada di tengah layar), Name Broker publik, Host mqtt:// broker.emqx.io dan Port 1883 sudah terisi, lalu Connect; 2, New Subscription, Topic belajar-iot/<kode>/#, lalu Confirm; 3, format Plaintext, lalu isi Topic dengan topik dari-laptop milikmu; 4, ketik pesannya, lalu klik tombol kirim atau Ctrl + Enter](aset/mqttx-kc.png)

*Ilustrasi: tampilan MQTTX 1.13.1 digambar ulang, bukan tangkapan layar; label antarmuka dari kode sumber [MQTTX](https://github.com/emqx/MQTTX) (© EMQ Technologies, lisensi Apache 2.0); kode topik dan jam hanya contoh.*

Selamat — ESP32 dan laptopmu baru saja mengobrol lewat broker, tanpa tahu alamat satu sama lain. Perhatikan tiga hal:

- **Keduanya hanya tahu alamat broker** (`broker.emqx.io`). ESP32 tidak tahu alamat IP laptopmu, dan MQTTX tidak tahu alamat ESP32. Itulah inti MQTT (Konsep 1–2).
- **Pesan mengalir ke dua arah lewat satu sambungan** yang dibuka ESP32 sendiri. Laptop bisa mengirim pesan ke ESP32 tanpa ESP32 menjadi server web seperti di Modul 10.
- **Kode acak membuat topikmu unik.** Broker publik ini dipakai banyak orang di seluruh dunia, dan siapa pun yang berlangganan topik yang sama bisa ikut membaca. Karena itu, kita hanya mengirim "halo" ke sana. Mulai Praktik 1, brokernya pindah ke laptopmu sendiri.

Tidak tersambung ke broker? Jaringan kantor, kampus, dan sebagian WiFi umum memblokir pintu 1883. Buka "Tidak bisa tersambung ke broker (`Gagal`, kode `-2`)" di 🚨.

> 🖥️ **Mencoba di Wokwi?** Buka proyek ESP32 baru di [wokwi.com](https://wokwi.com), tempel kode tab utama ke `sketch.ino`, lalu buat file **`secrets.h`** lewat **▾ → New file...** dan isi dengan jaringan simulasi Wokwi:
>
> ```cpp
> // secrets.h untuk Wokwi: jaringan simulasi Wokwi-GUEST tidak memakai kata sandi.
> #pragma once
>
> const char WIFI_NAMA[] = "Wokwi-GUEST";
> const char WIFI_SANDI[] = "";
> ```
>
> Lalu pasang library-nya lewat tab **Library Manager** → tombol bulat **+** → ketik **PubSubClient3** → klik hasilnya, seperti di Modul 6, dan ubah baris di tab `libraries.txt` menjadi `PubSubClient3@3.3.2`. Langkah MQTTX-nya sama persis: ESP32 simulasi pun tersambung ke `broker.emqx.io`.

---

## 🧠 Konsep "Mengapa"

Sepuluh konsep, satu per bagian — **tidak perlu dibaca sekaligus**. Konsep dan praktik dikerjakan berselang-seling dengan urutan ini:

1. Konsep 1–3 → Praktik 1 (pasang broker Mosquitto di laptop)
2. Konsep 4 → Praktik 2 (berkirim pesan dari terminal dan MQTTX)
3. Konsep 5 → Praktik 3 (ESP32 menerbitkan `telemetry`)
4. Konsep 6–7 → Praktik 4–5 (status *online*/*offline* dan uji QoS saat WiFi mati)
5. Konsep 8 → Praktik 6–7 (perintah → `ack` dan kiriman segera)
6. Konsep 9–10 (bedah baris-baris pengaman yang sudah dipakai sejak Praktik 3) → Praktik 8–9 (alat pemeriksa kontrak, diagram *pub/sub*, dan `KONTRAK-DATA.md`)
7. 🧩 Tantangan → ➕ Rumah Pintar Mini (Node 1 v1.2) → 📝 Kuis → ✅ Checklist

Di setiap titik pindah ada kotak ➡️ (maju ke praktik) dan ⬆️ (kembali ke konsep) yang tautannya tinggal diklik.

> 🖥️ **Perlu mencoba kode di bagian Konsep?** Tidak wajib — semua kode akan kamu jalankan di Praktik. Kode di bagian Konsep hanya potongan; versi utuhnya ada di sketsa Praktik dan di folder [`kode/`](kode/).

### 1. Mengapa HTTP saja tidak cukup: "surat pribadi" vs "grup obrolan"

Di Modul 10, Node 1 berbicara dengan dunia lewat **HTTP**, yang kita ibaratkan **surat-menyurat**. Cara ini sudah terbukti jalan: bacaan sampai di laptop, dan lampu bisa dimatikan dari HP. Namun, coba perhatikan siapa harus tahu alamat siapa:

- Node 1 harus tahu alamat laptop (`ALAMAT_SERVER`, misalnya `http://192.168.1.10:3000`) supaya bisa mengirim bacaan.
- HP harus tahu alamat Node 1 (`192.168.1.23` atau `node1.local`) supaya bisa membuka `/on` dan `/off`.
- Kalau kelak ada penerima kedua, misalnya dashboard di Raspberry Pi (Modul 13), Node 1 harus mengirim surat yang sama **dua kali**, ke dua alamat.

Setiap pasangan pengirim-penerima butuh "alamat surat" sendiri. Dengan satu Node 1 dan satu laptop, itu masih ringan. Bayangkan sebuah rumah dengan sepuluh perangkat dan tiga aplikasi yang ingin membaca datanya: tiga puluh pasangan alamat, dan setiap kali satu alamat berubah, ada kiriman yang diam-diam gagal.

Masalah kedua ada pada **arah**. HTTP selalu dimulai oleh pihak yang **bertanya**, dan yang ditanya harus sedang menunggu sebagai **server**. Supaya HP bisa memerintah Node 1, Node 1 terpaksa menjadi server web (Konsep 9 Modul 10). Server itu harus bisa didatangi dari luar, padahal di Konsep 1 Modul 10 kita sudah melihat bahwa surat dari internet hanya sampai di pos satpam: orang di luar tidak bisa langsung mengetuk ESP32-mu.

Masalah ketiga ada pada **ongkos**. Surat HTTP di Praktik 7 Modul 10 membawa kepala surat (*header*) sekitar 200 byte hanya untuk isi JSON 71 byte, lalu menunggu surat balasan. Untuk satu bacaan per menit, itu tidak terasa. Untuk ribuan perangkat yang melapor setiap 10 detik, ongkos itu menumpuk.

**MQTT** memakai cara lain, mirip **grup obrolan**. Semua perangkat cukup tahu **satu** alamat, yaitu alamat **broker**: "kantor pos" di tengah. Setiap perangkat **membuka sendiri** satu sambungan ke broker, lalu membiarkannya tetap terbuka, seperti HP yang selalu tersambung ke server WhatsApp. Lewat sambungan yang sama, pesan bisa mengalir ke **dua arah**: Node 1 mengirim bacaan, dan perintah dari laptop sampai ke Node 1 tanpa Node 1 menjadi server. Kepala pesannya pun mungil: pesan MQTT berisi JSON yang sama hanya menambah sekitar 30 byte, sebagian besar untuk nama topiknya, dan tidak perlu menunggu surat balasan.

![Dua panel: HTTP sebagai surat pribadi, MQTT sebagai grup obrolan; siapa harus tahu alamat siapa. Kiri, Modul 10, HTTP: Node 1 (192.168.1.23, server web) mengirim POST ke laptop (192.168.1.10:3000); HP (browser) mengirim GET /on ke Node 1; untuk dashboard kelak (Modul 13, kotak putus-putus) Node 1 harus mengirim POST lagi. Catatan: setiap pengirim harus tahu alamat setiap penerima; supaya bisa diperintah, Node 1 harus menjadi server web; penerima baru berarti kiriman baru dari Node 1; tidak ada yang tahu kalau Node 1 mati. Kanan, Modul 11, MQTT: broker di tengah (laptop, pintu 1883), dikelilingi empat klien yang semuanya menyambung ke broker: Node 1 (terbit telemetry, terima cmd), MQTTX (terbit cmd, terima telemetry), Pemeriksa, dan Dashboard kelak (putus-putus). Catatan: semua klien cukup tahu satu alamat, alamat broker; sambungan dibuka klien, lalu dibiarkan terbuka; satu sambungan, pesan mengalir dua arah; pembaca baru tidak mengubah firmware Node 1. Bawah: satu bacaan lewat HTTP membawa kepala surat sekitar 200 byte ditambah surat balasan, lewat MQTT tambahan sekitar 30 byte tanpa balasan](aset/surat-vs-grup.png)

| | HTTP (Modul 10) | MQTT (minggu ini) |
| :--- | :--- | :--- |
| Ibaratnya | surat pribadi: satu pengirim, satu penerima | grup obrolan: satu pesan, berapa pun penerimanya |
| Yang harus diketahui pengirim | alamat setiap penerima | alamat broker saja |
| Siapa yang membuka sambungan | penanya, setiap kali bertanya | setiap perangkat, sekali, lalu dibiarkan terbuka |
| Perintah ke Node 1 | Node 1 harus menjadi server web | lewat sambungan yang dibuka Node 1 sendiri |
| Tahu perangkat mati? | tidak: diam dan mati tampak sama | ya: broker sendiri yang mengumumkan (Konsep 7) |
| Ongkos per pesan | kepala surat ratusan byte + surat balasan | kepala pesan beberapa byte + nama topik |

Itulah sebabnya Silabus menyebut MQTT "bahasa resmi dunia IoT". Protokol ini lahir pada 1999 untuk memantau pipa minyak lewat sambungan satelit yang mahal dan sering putus, jadi ia memang dirancang hemat dan tahan putus. Sekarang MQTT dipakai dari lampu pintar sampai pabrik, dan menjadi standar terbuka yang bisa dipakai siapa saja. Versi yang dipakai ESP32 kita adalah **MQTT 3.1.1**; versi terbarunya, **MQTT 5**, dibahas di 🔬.

HTTP tidak lantas pensiun. Ia tetap dipakai untuk hal yang memang berbentuk tanya jawab: mengambil cuaca, membuka halaman web, dan kelak API *backend* di Modul 16. Yang berganti minggu ini hanya **jalur data Node 1**: semua bacaan dan perintahnya pindah ke MQTT.

### 2. *Publish/subscribe*: broker seperti server grup WhatsApp

Cara kerja MQTT disebut ***publish/subscribe*** (menerbitkan/berlangganan), sering disingkat *pub/sub*. Analogi termudahnya adalah grup WhatsApp:

| Grup WhatsApp | MQTT | Contoh di proyek kita |
| :--- | :--- | :--- |
| Server WhatsApp | **broker** | Mosquitto di laptopmu (Praktik 1) |
| Nama grup | **topik** (*topic*) | `rpm/a4cf12e5b7c0/telemetry` |
| Mengirim pesan ke grup | **menerbitkan** (*publish*) | Node 1 menerbitkan bacaan sensornya |
| Bergabung ke grup | **berlangganan** (*subscribe*) | MQTTX berlangganan topik bacaan Node 1 |
| Anggota grup | **pelanggan** (*subscriber*) | MQTTX, alat pemeriksa kontrak, kelak dashboard |

Alurnya selalu sama:

1. Setiap perangkat atau aplikasi **menyambung** ke broker. Di MQTT, mereka semua disebut **klien** (*client*), baik ESP32 maupun MQTTX.
2. Klien yang ingin menerima pesan **berlangganan** topik tertentu: "kabari aku setiap ada pesan di topik ini".
3. Klien yang punya kabar **menerbitkan** pesan ke sebuah topik. Penerbit tidak menyebut penerimanya; ia hanya menyebut topiknya.
4. Broker meneruskan pesan itu ke **setiap** klien yang sedang berlangganan topik tersebut, berapa pun jumlahnya. Kalau tidak ada pelanggan, pesannya dibuang begitu saja.

![Diagram publish/subscribe dengan analogi grup WhatsApp. Atas, tabel tiga kolom: server WhatsApp sama dengan broker, di proyek kita Mosquitto di laptop; nama grup sama dengan topik, misalnya rpm/a4cf12e5b7c0/telemetry; kirim pesan ke grup sama dengan menerbitkan (publish), Node 1 mengirim bacaan; bergabung ke grup sama dengan berlangganan (subscribe), MQTTX berlangganan rpm/#. Bawah, alur: Node 1 si penerbit mengirim PUBLISH (penanda 1) dengan topik rpm/a4cf12e5b7c0/telemetry dan isi JSON seperti suhu 28,5 ke broker; broker meneruskan (penanda 2) ke MQTTX dan ke Pemeriksa, yang sama-sama berlangganan rpm/#; klien lain yang berlangganan rpm/+/status tidak menerima pesan itu (tanda silang merah: topik lain, tidak dikirim). Catatan bawah: penanda 1, Node 1 menerbitkan sekali, tanpa tahu siapa pembacanya; penanda 2, broker mengirim salinan ke setiap pelanggan yang topiknya cocok; bedanya dengan WhatsApp, broker tidak menyimpan riwayat, dan yang baru bergabung tidak melihat pesan lama kecuali pesan retained (Konsep 7)](aset/pubsub-grup.png)

Perhatikan tiga hal yang membuat pola ini begitu cocok untuk IoT:

- **Penerbit dan pelanggan tidak saling kenal.** Node 1 tidak tahu bahwa yang membaca bacaannya adalah MQTTX, alat pemeriksa, atau dashboard. Menambah pembaca baru tidak mengubah satu baris pun di firmware Node 1.
- **Satu klien boleh berperan ganda.** Node 1 menerbitkan bacaan **dan** berlangganan topik perintahnya sendiri. MQTTX pun begitu: mengintip bacaan sambil mengirim perintah.
- **Semua sambungan dibuka dari klien ke broker.** Karena itu, satu-satunya perangkat yang harus "bisa didatangi" adalah broker. ESP32 tetap aman di balik router, seperti di Modul 10, tetapi kini bisa menerima perintah.

Ada satu perbedaan penting dengan WhatsApp: **broker tidak menyimpan riwayat obrolan.** Pesan hanya diteruskan kepada klien yang **sedang** berlangganan saat pesan itu terbit. Klien yang baru bergabung lima menit kemudian tidak melihat pesan-pesan lama. Ada dua pengecualian, yaitu sesi persisten (Konsep 6, hanya dicoba di Praktik 5) dan pesan *retained* (Konsep 7, dipakai Node 1 untuk statusnya).

Kemenangan Cepat tadi sudah membuktikan semua ini: ESP32 menerbitkan ke `belajar-iot/<kode>/dari-esp32`, MQTTX berlangganan `belajar-iot/<kode>/#`, dan arah sebaliknya lewat `dari-laptop`. Bedanya, brokernya milik orang lain dan terbuka untuk seluruh dunia. Sekarang kita pasang broker sendiri.

### 3. Broker di laptop: Mosquitto, dua baris konfigurasi, dan *firewall*

Broker yang kita pakai bernama **Mosquitto**, program broker gratis dan bersumber terbuka (*open-source*) dari Eclipse Foundation. Ukurannya kecil, bisa berjalan di laptop Windows, macOS, ataupun Linux, dan di Modul 12 kita memindahkannya ke Raspberry Pi yang selalu menyala. Selama minggu ini, **laptopmu menjadi kantor pos**: Mosquitto berjalan di sebuah terminal, dan semua klien menyambung ke alamat IP laptop di **port 1883**, nomor pintu resmi MQTT tanpa enkripsi. (Pintu MQTT terenkripsi bernomor 8883; kita memakainya di Modul 27.)

**Jebakan terbesar Mosquitto 2.x: bawaannya hanya melayani laptop itu sendiri.** Sejak versi 2.0, Mosquitto yang dijalankan tanpa file konfigurasi masuk ke **mode lokal saja** (*local only mode*). Ia hanya membuka pintu untuk klien di laptop yang sama, misalnya MQTTX di laptop itu, dan menolak semua sambungan dari luar, termasuk dari ESP32-mu. Ibaratnya kantor pos yang hanya melayani penghuni gedungnya sendiri: pintu depannya terkunci. Mosquitto sebenarnya memberi tahu hal ini lewat tiga baris peringatan saat menyala, tetapi tulisan itu mudah terlewat:

```text
Starting in local only mode. Connections will only be possible from clients running on this machine.
Create a configuration file which defines a listener to allow remote access.
For more details see https://mosquitto.org/documentation/authentication-methods/
```

Pengaman ini disengaja. Broker tanpa kata sandi yang terbuka ke jaringan bisa dipakai siapa saja, jadi pembuat Mosquitto memaksa kita **memilih dengan sadar**. Pilihan kita untuk latihan di rumah cukup dua baris, persis contoh dari dokumentasi resmi Mosquitto:

```text
listener 1883
allow_anonymous true
```

- **`listener 1883`** membuka loket di pintu 1883 untuk **semua** jaringan laptop, termasuk WiFi rumah.
- **`allow_anonymous true`** mengizinkan klien masuk **tanpa** nama pengguna dan kata sandi. Tanpa baris ini, Mosquitto memang membuka pintunya, tetapi menolak setiap klien dengan `not authorised`.

Kedua baris itu kita simpan di file `mosquitto-lan.conf` (konfigurasi untuk jaringan lokal, LAN), lalu Mosquitto dijalankan dengan file tersebut. Ingat juga apa artinya: **siapa pun yang tersambung ke WiFi rumahmu kini bisa memakai broker ini**, termasuk mengirim perintah ke relay. Itulah sebabnya aturan aman nomor 1 meminta broker dimatikan sebelum laptop dibawa ke WiFi umum. Gembok sungguhan, yaitu nama pengguna, kata sandi, dan daftar izin per topik, dipasang di Modul 21.

![Dua panel: Mosquitto 2.x pintunya terkunci sampai kamu membukanya. Kiri, bingkai merah, tanpa file konfigurasi, yaitu mode lokal saja: di dalam laptop 192.168.1.10, Mosquitto di pintu 1883 hanya melayani MQTTX di laptop yang sama lewat 127.0.0.1 (centang hijau), sedangkan ESP32 di luar laptop ditolak (silang merah). Terminal Mosquitto memperingatkan Starting in local only mode. Connections will only be possible from clients running on this machine; ESP32 gagal tersambung, misalnya Gagal ke broker setelah … ms (kode -2). Kanan, bingkai hijau, dengan mosquitto-lan.conf: ESP32 kini diterima (centang hijau); dua baris konfigurasi listener 1883 (pintu 1883 untuk semua jaringan) dan allow_anonymous true (tanpa kata sandi); lalu izinkan mosquitto di firewall hanya untuk Private, dan pastikan WiFi rumah berprofil Private network. Bawah: perintah mosquitto -v -c mosquitto-lan.conf, dengan -v supaya semua klien dan pesan tercatat (di Windows wajib); satu laptop, satu broker: saat memasang di Windows, hilangkan centang Service](aset/mosquitto-pintu.png)

Setelah pintu Mosquitto terbuka, masih ada satu penjaga lagi: ***firewall*** laptop. Sama seperti saat menjalankan `penerima-webhook.js` di Modul 10, Windows menghadang sambungan masuk ke program yang baru pertama kali membuka pintu. Kita mengizinkan Mosquitto **hanya untuk jaringan pribadi** (*Private network*), dan memastikan WiFi rumahmu memang berprofil pribadi. Caranya ada di Praktik 1.

Dua kebiasaan lagi yang akan sering kamu lihat:

- **Mosquitto selalu dijalankan dengan `-v`** (*verbose*, banyak bicara). Dengan `-v`, terminal Mosquitto mencatat setiap klien yang datang dan pergi, serta setiap pesan yang lewat, seperti CCTV di kantor pos. Di Windows, `-v` malah wajib: tanpa `-v`, Mosquitto hampir selalu diam, termasuk saat gagal menyala.
- **Satu laptop, satu broker.** Penginstal Mosquitto di Windows menawarkan pemasangan sebagai *service* (layanan latar belakang yang menyala sendiri setiap Windows hidup). *Service* itu berjalan dalam mode lokal saja dan diam-diam memakai pintu 1883 sehingga broker di terminalmu bisa gagal menyala atau malah berjalan berdua. Kita menghindarinya sejak awal di Praktik 1.

> ➡️ **Saatnya praktik!** Konsep 1–3 cukup untuk [Praktik 1 — Pasang broker Mosquitto di laptop](#praktik-1--pasang-broker-mosquitto-di-laptop-30-menit). Setelah itu, kembali ke Konsep 4.

### 4. Topik dan *wildcard*: alamat pesan yang bertingkat

**Topik** adalah teks biasa yang menjadi "alamat" sebuah pesan. Supaya rapi, topik dibagi menjadi beberapa **tingkat** (*level*) yang dipisahkan garis miring `/`, seperti alamat surat yang ditulis dari yang paling umum ke yang paling khusus:

```text
rpm / a4cf12e5b7c0 / telemetry
 │         │              └─ jenis pesan: bacaan sensor
 │         └──────────────── device_id: perangkat mana (dari alamat MAC, Modul 10)
 └────────────────────────── proyek: Rumah Pintar Mini
```

Topik tidak perlu didaftarkan ke broker lebih dulu: ia "ada" begitu seseorang menerbitkan atau berlangganan ke sana. Kebebasan ini enak, tetapi juga membuat salah ketik tidak pernah dilaporkan: pesan ke topik yang salah tetap diterima broker, lalu dibuang karena tidak ada pelanggannya. Karena itu, kenali lima aturan topik ini:

| Aturan | Contoh yang **berbeda** |
| :--- | :--- |
| Huruf besar dan kecil dibedakan | `rpm/a4cf12e5b7c0/telemetry` ≠ `rpm/a4cf12e5b7c0/Telemetry` |
| Garis miring di depan membuat tingkat kosong | `rpm/a4cf…/telemetry` ≠ `/rpm/a4cf…/telemetry` |
| Spasi ikut dihitung | `rpm/a4cf…/status` ≠ `rpm/a4cf…/status ` (ada spasi di ujung) |
| Topik penerbit tidak boleh memuat `+` atau `#` | menerbitkan ke `rpm/+/status` ditolak |
| Topik yang diawali `$` milik broker | `$SYS/broker/clients/connected` |

Jalur `/telemetry` di Modul 10 memang diawali garis miring karena begitulah jalur HTTP ditulis. Topik MQTT **tidak**: tulis `rpm/…`, bukan `/rpm/…`.

***Wildcard*** (karakter pengganti) hanya boleh dipakai saat **berlangganan**, untuk menangkap banyak topik sekaligus:

- **`+`** (plus) menggantikan **tepat satu tingkat**. `rpm/+/status` menangkap status **semua** perangkat: `rpm/a4cf12e5b7c0/status`, `rpm/240ac45e114b/status`, dan seterusnya.
- **`#`** (pagar) menggantikan **tingkat itu dan semua tingkat di bawahnya**, dan harus menjadi karakter terakhir. `rpm/a4cf12e5b7c0/#` menangkap semua pesan satu perangkat, dan `rpm/#` menangkap seluruh pesan proyek. `#` saja menangkap semua pesan di broker, kecuali topik `$SYS`.

![Pohon topik bertingkat dan wildcard; tingkat dipisah garis miring, dan wildcard hanya untuk berlangganan: + tepat satu tingkat, # tingkat itu dan semua di bawahnya. Kiri, akar rpm bercabang ke dua device_id: a4cf12e5b7c0 dengan lima daun telemetry, status, vitals, cmd, dan ack; 240ac45e114b dengan daun telemetry dan status. Di bawahnya cabang terpisah $SYS menuju broker/clients/connected. Setiap daun diberi titik warna langganan yang menangkapnya: biru untuk rpm/+/status (status semua perangkat: kedua daun status), oranye untuk rpm/a4cf12e5b7c0/# (semua pesan satu perangkat: kelima daun a4cf12e5b7c0), dan hijau toska untuk rpm/# (seluruh pesan proyek: semua daun rpm); cabang $SYS tidak bertitik. Kanan, kotak yang sering menjebak: # tidak menangkap $SYS/…, berlangganan $SYS/# secara khusus; Telemetry tidak sama dengan telemetry, huruf besar-kecil dibedakan; /rpm/… tidak sama dengan rpm/…, garis miring di depan berarti tingkat kosong; rpm/#/status dan rpm/sta+ adalah bentuk wildcard yang salah dan ditolak](aset/pohon-topik.png)

| Langganan | `rpm/a4cf12e5b7c0/telemetry` | `rpm/a4cf12e5b7c0/status` | `rpm/240ac45e114b/status` | `latihan/qos` |
| :--- | :---: | :---: | :---: | :---: |
| `rpm/a4cf12e5b7c0/telemetry` | ✅ | — | — | — |
| `rpm/+/status` | — | ✅ | ✅ | — |
| `rpm/a4cf12e5b7c0/#` | ✅ | ✅ | — | — |
| `rpm/#` | ✅ | ✅ | ✅ | — |
| `#` | ✅ | ✅ | ✅ | ✅ |

Bentuk yang **salah**: `rpm/#/status` (`#` tidak di akhir), `rpm/sta+` (`+` harus menempati satu tingkat utuh), dan `rpm#` (`#` harus berdiri sendiri setelah `/`). Broker menolak langganan seperti itu.

**Topik `$SYS`.** Mosquitto menerbitkan keadaan dirinya sendiri di bawah `$SYS/`, misalnya jumlah klien yang tersambung di `$SYS/broker/clients/connected`, dan memperbaruinya setiap 10 detik. Topik ini tidak ikut tertangkap `#`; untuk melihatnya, berlangganan `$SYS/#` secara khusus. Topik yang diawali `$` tidak boleh dipakai untuk pesan proyekmu sendiri.

**Mengapa `device_id`, bukan nama ruangan?** Kontrak data kita sengaja tidak menulis `ruang-tamu` atau `kebun` di topik. Lokasi bisa berubah: Node 1 yang hari ini ada di meja belajar bisa saja dipasang di dapur bulan depan. Kalau lokasi menjadi bagian topik, setiap pindah ruangan berarti mengubah firmware dan semua pelanggannya. `device_id` tidak pernah berubah karena berasal dari alamat MAC chip. Nama ruangan cukup dicatat sebagai keterangan di database (Modul 17).

> ➡️ **Saatnya praktik!** Lanjut ke [Praktik 2 — Berkirim pesan dari terminal dan MQTTX](#praktik-2--berkirim-pesan-dari-terminal-dan-mqttx-20-menit), lalu kembali ke Konsep 5.

### 5. Kontrak data: lima topik dan satu bentuk JSON untuk semua

Sampai akhir kurikulum, data Node 1 akan dibaca banyak program: MQTTX dan alat pemeriksa minggu ini, Node-RED di Raspberry Pi (Modul 13), *backend* buatanmu sendiri (Modul 16), database (Modul 17), dan dashboard (Modul 22). Semua program itu ditulis pada minggu yang berbeda. Supaya tetap cocok satu sama lain, kita butuh **kontrak data**: kesepakatan tertulis tentang **nama topik** dan **bentuk isi pesan**.

Ibaratnya **formulir baku** di kantor kelurahan. Karena semua warga mengisi formulir yang sama, petugas tidak perlu menebak di mana nama dan di mana alamat. Kontrak data kita sudah tertulis di [Lampiran A Silabus](../../SILABUS.md#14-lampiran-a--kontrak-data-rumah-pintar-mini) sejak awal kurikulum. Minggu ini kita **memakainya sungguhan**, melengkapi bagian yang masih kosong, lalu menyalinnya ke proyekmu sebagai `KONTRAK-DATA.md` (Praktik 9).

**Lima topik untuk setiap perangkat** (awalan `rpm` = Rumah Pintar Mini):

| Topik | Arah | Isi | *Retained* | Kapan |
| :--- | :--- | :--- | :---: | :--- |
| `rpm/<device_id>/telemetry` | perangkat → broker | semua bacaan sensor dalam satu JSON | tidak | setiap 10 detik, dan segera saat ada kejadian penting |
| `rpm/<device_id>/status` | perangkat → broker | teks `online` atau `offline` | **ya** | saat tersambung; `offline` diterbitkan broker (Konsep 7) |
| `rpm/<device_id>/vitals` | perangkat → broker | kesehatan perangkat | tidak | sekali setelah tersambung, lalu setiap 5 menit |
| `rpm/<device_id>/cmd` | broker → perangkat | satu perintah | tidak (kecuali `config`, Modul 19) | kapan saja |
| `rpm/<device_id>/ack` | perangkat → broker | jawaban atas satu perintah | tidak | segera setelah perintah diterima |

![Kontrak data: lima topik untuk setiap perangkat, rpm/<device_id>/…, satu JSON berisi semua sensor, setiap perintah dijawab ack dengan id yang sama. Kiri Node 1 (a4cf12e5b7c0), kanan broker Mosquitto, di antaranya lima panah. Dari Node 1 ke broker: rpm/<id>/telemetry, setiap 10 detik dan segera saat penting, QoS 0, contoh isi {"ts":"…","fw":"1.2.0","suhu":28.5,…}; rpm/<id>/status, retained, wasiat QoS 1, isi online (offline adalah wasiat dari broker); rpm/<id>/vitals, setelah tersambung lalu setiap 5 menit, contoh isi {"ts":"…","rssi":-61,"uptime_s":…}; dan rpm/<id>/ack, segera setelah perintah dengan id sama, contoh isi {"id":"c-001","ts":"…","ok":true,"state":{…}}. Dari broker ke Node 1: rpm/<id>/cmd, dari MQTTX atau dashboard, langganan QoS 1, contoh isi {"id":"c-001","aksi":"set",…}. Catatan bawah: bacaan gagal ditulis null, nama klien sama dengan device_id, cmd ber-id sama hanya dikerjakan sekali](aset/kontrak-lima-topik.png)

**Contoh isi pesan Node 1 v1.2** (`device_id` contoh `a4cf12e5b7c0`):

```jsonc
// rpm/a4cf12e5b7c0/telemetry
{"ts":"2026-10-18T01:30:12Z","fw":"1.2.0","suhu":28.5,"kelembapan":71,"cahaya":2310,"tanah":37,"gerak":false,"level_air":64}

// rpm/a4cf12e5b7c0/status   (teks biasa, bukan JSON)
online

// rpm/a4cf12e5b7c0/vitals
{"ts":"2026-10-18T01:30:00Z","rssi":-61,"uptime_s":86400,"heap_free":183200}

// rpm/a4cf12e5b7c0/cmd   (dari MQTTX atau, kelak, dari dashboard)
{"id":"c-001","ts":"2026-10-18T01:31:05Z","aksi":"set","target":"lampu","nilai":true}

// rpm/a4cf12e5b7c0/ack   (jawaban Node 1, id-nya sama)
{"id":"c-001","ts":"2026-10-18T01:31:05Z","ok":true,"state":{"kipas":false,"lampu":true,"pompa":false,"tirai":90}}
```

Baris yang diawali `//` hanya keterangan di modul ini; di pesan sungguhan, yang ada hanyalah isi di bawahnya. Kolom-kolomnya:

- **`ts`**: cap waktu UTC yang dibuat **perangkat** saat bacaan diambil (Konsep 6 Modul 10). Pesan tanpa `ts` tidak boleh diterbitkan, jadi Node 1 menunggu sampai jamnya disetel dari internet.
- **`fw`**: versi firmware, misalnya `"1.2.0"`. Kelak, saat ada data aneh, kita bisa tahu firmware mana yang mengirimnya.
- **`suhu` sampai `level_air`**: satuan dan rentangnya sudah ditetapkan di Modul 6 (tabel satuan di Lampiran A).
- **`vitals`**: `rssi` (kekuatan sinyal WiFi, Konsep 2 Modul 10), `uptime_s` (sudah berapa detik menyala), dan `heap_free` (sisa memori *heap*, Modul 8). Kolom `reset_reason` baru ditambahkan di Modul 28.

**Satu JSON untuk semua sensor**, bukan satu topik per bacaan seperti `rpm/<device_id>/suhu`. Alasannya: semua bacaan diambil bersamaan, jadi cukup satu `ts`; jumlah pesannya hanya seperenam; dan kelak database cukup menyimpan satu baris per kiriman (Modul 17).

**Keputusan baru minggu ini.** Lampiran A sengaja membiarkan beberapa hal terbuka sampai modul ini. Kamu tidak perlu menghafal keputusan di bawah ini sekarang: setiap keputusan akan kamu lihat sendiri di Praktik 3–8, dan alat pemeriksa kontrak di Praktik 8 menegurmu kalau ada yang terlewat. Mulai sekarang, keputusan berikut **dikunci** dan dicatat di Lampiran A serta `KONTRAK-DATA.md`:

1. **Bacaan gagal ditulis `null`**, untuk semua kolom. Sampai Modul 10, `kelembapan` dan `level_air` yang gagal dikirim sebagai `-1`, sedangkan `suhu` yang gagal sudah tertulis `null`. Angka `-1` berbahaya karena bisa ikut terhitung: rata-rata kelembapan harian bisa anjlok gara-gara satu bacaan gagal. `null` berarti "tidak ada angka", dan baik database maupun grafik kelak paham artinya. Di dalam firmware, tanda gagalnya tetap `NAN` dan `-1`; yang berubah hanya cara menuliskannya di JSON.
2. **Nama klien di broker (*client ID*) = `device_id`.** Broker mengenali setiap klien dari namanya, dan nama itu **harus unik**. Kalau dua klien memakai nama yang sama, broker mengusir yang lama setiap kali yang baru datang, dan keduanya saling mengusir terus-menerus. `device_id` dijamin unik karena berasal dari alamat MAC chip.
3. **`telemetry` setiap 10 detik, ditambah kiriman segera** saat salah satu dari empat keadaan ini berganti: ada atau tidaknya gerakan, terang atau gelapnya tempat (batas `1000`, sama dengan lampu otomatis Modul 6), tanah lebih kering atau lebih basah daripada ambang siram, dan air tandon di bawah atau di atas batas aman 20 %. Kiriman segera paling sering setiap 2 detik (Konsep 8).
4. **`vitals` sekali setelah tersambung, lalu setiap 5 menit.**
5. **Status** `online` diterbitkan perangkat sebagai pesan *retained* begitu tersambung. Status `offline` dititipkan sebagai *Last Will* (QoS 1, *retained*) yang diterbitkan broker saat perangkat hilang (Konsep 7).
6. **Setiap `cmd` dijawab satu `ack`** dengan `id` yang sama, `ok` (`true` atau `false`), keadaan keempat aktuator di `state`, dan kolom **`pesan`** berisi alasan penolakan kalau `ok` bernilai `false`. Lampiran A memberi batas 5 detik; syarat lulus kita jauh lebih ketat: **di bawah 1 detik**. Kalau jam perangkat belum disetel, `ack` tetap dikirim dengan `"ts":null` karena menjawab lebih penting daripada mencatat jam.
7. **`aksi` yang dikenal Node 1 v1.2** hanya `set`: `lampu` dan `kipas` dengan nilai `true`/`false`, `pompa` dengan nilai 1–10 (detik), dan `tirai` dengan nilai 0–180 (derajat). `config` dan `update` sudah tercantum di kontrak, tetapi baru dikerjakan di Modul 19 dan 28; sampai saat itu Node 1 menjawabnya dengan `ok:false`.
8. **Perintah ber-`id` sama hanya dikerjakan sekali.** Selama menyala, Node 1 mengingat delapan `id` terakhir dan diam-diam mengabaikan pengulangannya; ingatan itu kosong lagi setiap kali Node 1 *restart*. Panjang `id` paling banyak 39 huruf supaya muat di ingatan itu; perintah ber-`id` lebih panjang diabaikan tanpa jawaban. Alasannya ada di Konsep 6–8.

> 💡 **"Kontrak" berarti tidak diubah sembarangan.** Mengganti nama satu kolom, misalnya `suhu` menjadi `temp`, akan merusak setiap program yang sudah membaca kolom itu. Kalau kelak memang perlu berubah, ubah Lampiran A dan `KONTRAK-DATA.md` dulu, baru kodenya, dan naikkan versi firmware. Alat pemeriksa kontrak di Praktik 8 menjaga kesepakatan ini secara otomatis.

> ➡️ **Saatnya praktik!** Lanjut ke [Praktik 3 — ESP32 menerbitkan `telemetry` ke broker laptop](#praktik-3--esp32-menerbitkan-telemetry-ke-broker-laptop-30-menit), lalu kembali ke Konsep 6.

### 6. QoS: surat biasa, surat tercatat, dan kurir bertanda tangan

Jaringan tidak sempurna: WiFi bisa putus sesaat, dan laptop bisa tertidur. MQTT memberi pilihan seberapa keras ia berusaha mengantar sebuah pesan. Pilihan itu disebut **QoS** (*Quality of Service*, mutu layanan), dan ada tiga tingkat:

| QoS | Ibaratnya | Cara kerjanya | Akibatnya |
| :---: | :--- | :--- | :--- |
| **0** | **surat biasa**: dimasukkan ke kotak pos, selesai | dikirim sekali, tanpa tanda terima | sampai sekali, atau hilang |
| **1** | **surat tercatat**: ada tanda terima | penerima membalas `PUBACK`; kalau tanda terima tidak datang karena sambungan putus, pengirim mengirim ulang setelah menyambung lagi | pasti sampai, tetapi **bisa sampai dua kali** |
| **2** | **kurir bertanda tangan**: serah terima empat langkah | `PUBLISH` → `PUBREC` → `PUBREL` → `PUBCOMP` | sampai **tepat sekali**, paling lambat |

![Tiga diagram urutan QoS; waktu berjalan dari atas ke bawah, pengirim di kiri, penerima di kanan. QoS 0, surat biasa: satu panah PUBLISH tanpa tanda terima dan tanpa kirim ulang; sampai sekali, atau hilang; telemetry Node 1 memakai ini. QoS 1, surat tercatat: PUBLISH nomor 7 dibalas PUBACK nomor 7; kalau PUBACK hilang di jalan: PUBLISH nomor 8 sampai, tetapi PUBACK-nya hilang, lalu setelah menyambung lagi pengirim mengulang PUBLISH nomor 8 bertanda DUP sehingga penerima mendapat pesan yang sama dua kali; pasti sampai, bisa dobel; langganan cmd Node 1 memakai ini. QoS 2, kurir bertanda tangan: serah terima empat langkah, 1 PUBLISH, 2 PUBREC, 3 PUBREL, 4 PUBCOMP; tepat sekali, paling lambat; PubSubClient3 tidak bisa berlangganan QoS 2. Catatan bawah: QoS berlaku per ruas; penerbit ke broker memakai QoS penerbit, broker ke pelanggan memakai yang lebih kecil antara QoS terbitan dan QoS langganan; PubSubClient3 di ESP32 berlangganan QoS 0 atau 1 dan menerbitkan QoS 1 tanpa pernah mengirim ulang, setara QoS 0 saat sambungan putus](aset/qos-tiga-tingkat.png)

Tiga hal yang sering membingungkan:

- **QoS berlaku per ruas perjalanan.** Pesan dari penerbit ke broker memakai QoS pilihan penerbit. Dari broker ke pelanggan, QoS-nya **yang lebih kecil** di antara QoS terbitan dan QoS langganan. Jadi, pesan QoS 0 di topik yang dilanggani dengan QoS 1 tetap tiba sebagai QoS 0.
- **QoS 1 dan 2 tidak gratis.** Setiap tanda terima adalah paket tambahan, dan pengirim harus menyimpan pesan sampai tanda terimanya datang. Karena itu, QoS 0 justru pilihan yang tepat untuk `telemetry`: bacaan baru toh datang 10 detik lagi.
- **QoS bukan jaminan perintah dikerjakan.** QoS hanya mengurus perjalanan pesan **sampai di klien**. Apakah relay benar-benar menyala, hanya Node 1 yang tahu. Itulah gunanya `ack` (Konsep 8).

**Batas library di ESP32.** Library **PubSubClient3** bisa berlangganan dengan QoS 0 atau 1 (tidak bisa QoS 2). Ia memang bisa menerbitkan dengan QoS 1, tetapi **tidak pernah mengirim ulang** pesan yang tanda terimanya tidak datang. Akibatnya, kalau sambungan putus di tengah jalan, pesan itu tetap hilang, sama seperti QoS 0. (PubSubClient 2.8 yang lama malah hanya bisa menerbitkan QoS 0.) Karena itu, seperti saran Silabus, perbedaan QoS 0 dan 1 kita uji dengan pesan yang **dikirim dari laptop**: mula-mula ke pelanggan lain di laptop itu sendiri, lalu lewat broker **ke ESP32** (Praktik 5).

**Sesi persisten: broker yang mau menyimpan pesan.** Biasanya, broker melupakan klien begitu sambungannya putus. Namun, klien boleh meminta **sesi persisten**: ia menyambung dengan tanda *clean session* (mulai dengan sesi bersih) bernilai `false` dan dengan *client ID* yang selalu sama. Selama klien itu pergi, broker **menyimpan** pesan untuknya, lalu menyerahkannya saat ia kembali, dengan aturan berikut:

- Pesan yang tiba di langganan **QoS 1** disimpan.
- Pesan **QoS 0** tidak disimpan oleh Mosquitto. (Aturan MQTT membolehkan broker menyimpannya, dan sebagian broker publik memang melakukannya; itulah sebabnya Praktik 5 versi Wokwi memakai broker HiveMQ.)

Itulah yang kita uji di Praktik 5: WiFi ESP32 dimatikan, pesan QoS 0 dan QoS 1 dikirim dari MQTTX, lalu WiFi dinyalakan lagi. Hanya "surat tercatat" yang menunggu di broker.

**Node 1 sengaja tidak memakai sesi persisten.** Bayangkan Node 1 mati semalaman, sementara seseorang mengirim perintah "pompa 10 detik" lima kali. Dengan sesi persisten, kelima perintah basi itu dikerjakan sekaligus begitu Node 1 menyala pagi harinya. Untuk aktuator, perintah yang terlambat lebih berbahaya daripada perintah yang hilang: perintah yang hilang bisa diulang pengirimnya setelah ia melihat `ack` tidak datang. Jadi, Node 1 menyambung dengan *clean session* = `true`, dan berlangganan `cmd` dengan QoS 1 supaya pengiriman selama tersambung tetap tercatat.

### 7. *Retained*, *Last Will*, dan *keep-alive*: papan pengumuman, surat wasiat, dan detak jantung

Di Konsep 2 kita belajar bahwa broker tidak menyimpan riwayat pesan. Akibatnya, MQTTX yang baru dibuka tidak tahu apakah Node 1 sedang hidup sampai pesan berikutnya datang. Tiga fitur MQTT ini menyelesaikannya.

**Pesan *retained* = papan pengumuman.** Pesan yang diterbitkan dengan tanda *retained* (dipertahankan) **disimpan** broker di topiknya, satu pesan saja per topik: pesan *retained* yang baru menggantikan yang lama. Setiap kali ada klien yang **baru berlangganan** topik itu, broker langsung menyerahkan pesan tersebut, seperti pengumuman yang tetap tertempel di papan dan bisa dibaca orang yang datang belakangan. MQTTX memberi label **Retained** pada pesan seperti ini.

- Cocok untuk keadaan yang **berlaku sampai diganti**: status `online`/`offline` dan, di Modul 19, konfigurasi ambang.
- **Tidak** cocok untuk `telemetry` (bacaan lama yang tertempel menyesatkan) dan **sangat berbahaya untuk perintah `set`**: perintah *retained* diserahkan ulang setiap kali Node 1 menyambung sehingga lampu bisa menyala sendiri, misalnya setelah Node 1 *restart*. Library di ESP32 tidak memberi tahu apakah sebuah pesan berasal dari papan pengumuman, dan pengingat `id` (keputusan 8 di Konsep 5) hanya menahan pengulangan selama Node 1 menyala: ingatannya kosong lagi setelah *restart*, jadi perintah *retained* itu dikerjakan lagi. Karena itu, jangan pernah mencentang **Retain** saat mengirim perintah dari MQTTX, dan langsung hapus perintah yang telanjur tertempel (🚨 "Lampu menyala lagi sendiri").
- **Menghapus** pengumuman: terbitkan pesan **kosong** dengan tanda *retained* ke topik yang sama. Di MQTTX ada menu **Clear Retained Message**; di terminal, `mosquitto_pub -t <topik> -r -n`.

***Last Will* = surat wasiat.** Saat menyambung, klien boleh **menitipkan** satu pesan kepada broker: topik, isi, QoS, dan tanda *retained*-nya. Broker menyimpan titipan itu selama klien tersambung, dan menerbitkannya **hanya kalau klien hilang tanpa pamit**: listrik padam, WiFi putus, papan *restart*, atau program macet. Kalau klien pamit baik-baik (mengirim paket `DISCONNECT`), wasiat itu dibuang.

Gabungkan keduanya, dan kita mendapat **status otomatis**:

1. Saat menyambung, Node 1 menitipkan wasiat: "kalau aku hilang, terbitkan `offline` di `rpm/<device_id>/status`, QoS 1, *retained*".
2. Begitu tersambung, Node 1 sendiri menerbitkan `online` ke topik yang sama, juga *retained*.
3. Kalau Node 1 hilang, broker menerbitkan wasiatnya. Papan pengumuman kini bertuliskan `offline`, dan siapa pun yang membuka MQTTX belakangan langsung melihatnya.

```cpp
// Wasiat: topik status, QoS 1, retained (true), isi "offline"
if (mqtt.connect(idPerangkat, topikStatus, 1, true, "offline")) {
  mqtt.publish(topikStatus, "online", true);  // true = retained
}
```

***Keep-alive* = detak jantung.** Bagaimana broker tahu sebuah klien "hilang", padahal sambungan yang terputus mendadak sering tidak meninggalkan jejak apa pun? Saat menyambung, klien berjanji: "aku akan mengirim sesuatu paling lambat setiap **15 detik**" (nilai bawaan PubSubClient3). PubSubClient3 menepatinya dengan cara sederhana: setiap kali 15 detik berlalu tanpa paket apa pun dari broker, `mqtt.loop()` mengirim paket kecil `PINGREQ` ("aku masih di sini"), dan broker membalas `PINGRESP`. Karena `telemetry` QoS 0 tidak pernah dibalas broker, detak ini tetap berangkat setiap 15 detik walaupun Node 1 rajin menerbitkan pesan. Balasan `PINGRESP` itulah yang memberi tahu Node 1 bahwa broker masih hidup (🔬). Kalau broker tidak mendengar apa pun selama **1,5 kali** angka itu, yaitu **22,5 detik**, klien dianggap mati: sambungannya diputus dan wasiatnya diterbitkan. Terminal Mosquitto mencatatnya sebagai `disconnected: exceeded timeout.`

![Garis waktu 60 detik: papan pengumuman, surat wasiat, dan detak jantung; contoh kabel USB Node 1 dicabut pada detik ke-33. Baris Node 1: di awal CONNECT sambil menitipkan wasiat status = "offline", QoS 1, retained, lalu menerbitkan online (retained); telemetry pada detik 10, 20, dan 30; tanda silang merah USB dicabut pada detik 33; sesudahnya mati, tidak bisa mengirim apa pun. Baris Broker: papan pengumuman online dari awal sampai detik 52,5, lalu offline; kurung dari detik 30 sampai 52,5 bertuliskan 22,5 detik tanpa kabar, 1,5 kali keep-alive 15 detik; pada detik 52,5 wasiat diterbitkan. Baris MQTTX: baru berlangganan pada detik 15 dan langsung menerima online bertanda Retained; pada detik 52,5 menerima offline. Bawah, tiga kartu: Retained sama dengan papan pengumuman, pesan terakhir di sebuah topik disimpan broker, pelanggan baru langsung menerimanya, hapus dengan pesan kosong bertanda retained; Last Will sama dengan surat wasiat, dititipkan klien saat menyambung, diterbitkan broker kalau klien hilang tanpa pamit, dibuang kalau klien pamit dengan DISCONNECT; Keep-alive sama dengan detak jantung, klien mengirim sesuatu paling lambat setiap 15 detik; setiap kali 15 detik berlalu tanpa paket dari broker, klien mengirim PINGREQ dan broker membalas PINGRESP; broker menyerah setelah 22,5 detik](aset/retained-wasiat-detak.png)

Dari sini kita tahu berapa lama `offline` muncul setelah kabel USB Node 1 dicabut: broker menghitung 22,5 detik **sejak pesan terakhir** dari Node 1. Karena Node 1 menerbitkan sesuatu paling lambat setiap 10 detik, `offline` muncul **sekitar 13–23 detik** setelah dicabut. Lebih cepat daripada itu tidak perlu; detak yang terlalu rapat hanya memboroskan baterai dan kuota.

Dua catatan kecil yang akan kamu lihat di Praktik 4:

- **Tekan EN, dan `offline` biasanya muncul sebentar lalu berganti `online`.** Node 1 yang baru *restart* menyambung lagi dengan nama yang sama sebelum 22,5 detik berlalu. Broker mengusir sambungan lama yang tertinggal, menerbitkan wasiatnya (`offline`), lalu Node 1 yang baru langsung menerbitkan `online`.
- **Broker dinyalakan ulang, papan pengumuman kosong.** Mosquitto yang kita jalankan dengan `mosquitto-lan.conf` menyimpan pesan *retained* di memori saja, baik di Windows, macOS, maupun Linux. Setelah broker di-*restart*, status baru muncul lagi saat setiap perangkat menyambung ulang. (Mosquitto yang berjalan sebagai layanan di Debian dan Ubuntu, seperti di Raspberry Pi pada Modul 12, menyimpannya ke disk.)

> ➡️ **Saatnya praktik!** Konsep 6–7 cukup untuk [Praktik 4 — Status *online*/*offline* otomatis](#praktik-4--status-onlineoffline-otomatis-20-menit) dan [Praktik 5 — QoS 0 vs QoS 1 saat WiFi ESP32 mati](#praktik-5--qos-0-vs-qos-1-saat-wifi-esp32-mati-25-menit). Setelah itu, kembali ke Konsep 8.

### 8. Kapan mengirim dan menjawab: setiap 10 detik, segera saat penting, dan perintah → `ack`

**Jadwal tetap: setiap 10 detik.** Di Modul 10, Node 1 mengirim bacaan setiap menit. Untuk dashboard yang terasa "hidup", itu terlalu jarang, jadi kontrak data menetapkan **10 detik**. Dalam sehari, itu 8.640 pesan atau sekitar 1 MB teks JSON: ringan sekali bagi broker di jaringan rumah.

**Kiriman segera saat ada kejadian penting** (*report-by-exception*, lapor saat ada pengecualian). Jadwal 10 detik saja masih punya kelemahan: gerakan di depan PIR baru terlihat di laptop paling lambat 10 detik kemudian. Padahal, ada kabar yang lebih penting daripada sekadar angka terbaru, misalnya "ada orang masuk" atau "tempat ini mendadak gelap". Untuk kabar seperti itu, Node 1 **langsung** menerbitkan `telemetry` tanpa menunggu jadwal. Isinya sama persis dengan kiriman terjadwal; yang berbeda hanya **kapan** ia dikirim.

Yang dianggap penting adalah **perubahan keadaan**, bukan setiap bacaan yang melewati batas. Selama tempat tetap gelap, tidak ada kiriman tambahan; kiriman segera hanya terjadi tepat saat keadaannya **berganti**, misalnya dari terang ke gelap. Empat keadaan yang diawasi Node 1 v1.2 sudah tercantum di keputusan 3 Konsep 5: gerakan, gelap-terang, tanah kering, dan air tandon rendah.

![Garis waktu 40 detik: kapan Node 1 mengirim, jadwal 10 detik ditambah kiriman segera. Baris gerakan (PIR): tidak ada gerakan sampai detik 23, lalu ada gerakan. Baris cahaya (LDR): terang sampai detik 24, lalu gelap (cahaya di bawah 1000). Baris kiriman: kiriman terjadwal pada detik 0, 10, dan 20; pada detik 23 gerakan terlihat, kiriman segera; pada detik 24 menjadi gelap, tetapi kirimannya menunggu jeda 2 detik sehingga terbit pada detik 25; tanda putus-putus pada detik 30 bertuliskan bukan 30 s, artinya kiriman terjadwal tidak jatuh pada detik 30; kiriman terjadwal berikutnya pada detik 35, 10 detik setelah kiriman terakhir. Catatan bawah: kiriman segera hanya saat keadaan berganti, ke dua arah: gerakan ada atau hilang, terang atau gelap, tanah kering atau basah, air tandon rendah atau cukup; bukan di setiap bacaan; isi pesannya sama dengan kiriman terjadwal, delapan kolom telemetry dengan bacaan terbaru; Node 1 v1.2 memeriksa keadaan setiap kali sensor dibaca (2 detik sekali), jadi kiriman segeranya jatuh pada bacaan berikutnya](aset/kapan-kirim.png)

Dua aturan tambahan menjaga cara ini tetap sopan:

- **Paling sering setiap 2 detik.** PIR yang berkedip-kedip atau bayangan yang lewat di depan LDR bisa memicu perubahan berkali-kali dalam sedetik. Tanpa batas, Node 1 akan membanjiri broker. Kejadian yang datang terlalu rapat tidak dibuang: ia dikirim begitu jeda 2 detik terpenuhi, dengan bacaan terbaru.
- **Jadwal dihitung ulang dari kiriman terakhir.** Kalau kiriman segera terjadi pada detik ke-7, kiriman terjadwal berikutnya jatuh 10 detik setelahnya, bukan pada detik ke-10. Dengan begitu, jarak antarkiriman tidak pernah lebih dari 10 detik dan tidak ada kiriman ganda yang mubazir.

Hasilnya terasa di Modul 22: grafik di HP berubah sekitar 1–2 detik setelah kamu menutup LDR dengan tangan, bukan 10 detik kemudian.

**Perintah → `ack`: setiap perintah dijawab.** Di Modul 10, membuka `/on` hanya menghasilkan halaman web; tidak ada catatan resmi bahwa perintahnya benar-benar dikerjakan. Pola MQTT kita lebih tertib, seperti **nomor antrean di bank**:

1. Pengirim (MQTTX, kelak dashboard) menerbitkan perintah ke `rpm/<device_id>/cmd`, lengkap dengan **`id` unik** yang paling panjang 39 huruf, misalnya `"c-001"`. Itulah nomor antreannya.
2. Node 1 menerima, **memeriksa**, lalu **mengerjakan** perintah itu.
3. Node 1 menerbitkan **`ack`** (*acknowledgement*, tanda terima) ke `rpm/<device_id>/ack` dengan **`id` yang sama**, `ok` (`true` kalau dikerjakan), keadaan semua aktuator di `state`, dan alasan di `pesan` kalau ditolak.
4. Pengirim mencocokkan `id` jawaban dengan perintahnya. Jawaban yang tidak datang dalam 5 detik berarti ada masalah, dan pengirim boleh mengulang dengan `id` **baru**: Node 1 v1.2 diam-diam mengabaikan `id` yang sudah pernah diterimanya, jadi ulangan ber-`id` sama tidak akan dijawab.

![Diagram urutan perintah dan ack, seperti nomor antrean di bank; tiga garis hidup: MQTTX, broker, dan Node 1. 1, MQTTX menerbitkan ke rpm/a4cf12e5b7c0/cmd; broker meneruskan isinya {"id":"c-001","aksi":"set","target":"lampu","nilai":true} ke Node 1. Di Node 1: 2, baca JSON (pakai panjang), id ada? sudah pernah?, aksi, target, jenis nilai?; 3, kerjakan: relay lampu berbunyi klik. 4, Node 1 menerbitkan ke rpm/a4cf12e5b7c0/ack, dan broker meneruskan {"id":"c-001","ts":"…","ok":true,"state":{…}} ke MQTTX. 5, cocokkan id, selesai; pulang-pergi di WiFi rumah diperkirakan puluhan sampai ratusan milidetik (syarat lulus di bawah 1 detik; di Wokwi dengan broker publik 1 sampai 2 detik). Catatan bawah: id sama datang lagi, diabaikan karena Node 1 mengingat 8 id terakhir; perintah salah tetap dijawab ok:false ditambah "pesan" berisi alasannya; bukan JSON atau tanpa id, tidak bisa dijawab, hanya dicatat di Serial Monitor, begitu pula id yang lebih dari 39 huruf](aset/perintah-ack.png)

Perintah yang salah pun **tetap dijawab**, dengan `ok:false` dan alasannya. Pengirim jadi tahu bedanya "perintahmu ditolak" dan "perangkatnya tidak mendengar". Pengecualiannya hanya pesan yang bukan JSON, tidak punya `id`, atau ber-`id` lebih dari 39 huruf: tanpa nomor antrean yang sah, tidak ada yang bisa dijawab, jadi Node 1 hanya mencatatnya di Serial Monitor.

**Urutan di dalam fungsi penerima perintah.** Library memanggil fungsi kita setiap ada pesan di topik yang dilanggani, lalu kita mengerjakannya dengan urutan **baca → periksa → kerjakan → jawab**:

```cpp
void saatPerintahMasuk(char* topik, byte* isi, unsigned int panjang) {
  JsonDocument perintah;
  if (deserializeJson(perintah, isi, panjang)) {  // isi TIDAK diakhiri tanda akhir teks: wajib sebut panjangnya
    return;                                       // bukan JSON: tidak ada id yang bisa dijawab
  }
  const char* id = perintah["id"] | "";           // "" kalau id tidak ada atau bukan teks
  // ... id kosong, lebih dari 39 huruf, atau sudah pernah diterima? abaikan ...
  if (!perintah["nilai"].is<bool>()) {             // periksa JENIS nilainya dulu
    kirimAck(id, false, "nilai harus true atau false");
    return;
  }
  aturLampu(perintah["nilai"].as<bool>());         // baru sekarang dipakai
  kirimAck(id, true, nullptr);
}
```

Tiga jebakan yang dijaga potongan itu:

- **Isi pesan bukan teks biasa yang berakhiran tanda akhir teks.** Library hanya memberi alamat awal isi dan `panjang`-nya. Jadi, `deserializeJson()` harus diberi `panjang`, dan isinya dicetak dengan `Serial.write(isi, panjang)`, seperti di Kemenangan Cepat.
- **`"false"` (teks) bukan `false`.** `as<bool>()` di ArduinoJson menganggap **semua teks** bernilai benar, termasuk teks `"false"`. Perintah `{"nilai":"false"}` yang salah ketik akan **menyalakan** kipas kalau jenis nilainya tidak diperiksa dulu dengan `is<bool>()`. Perintah seperti itu kita tolak, bukan kita tebak maksudnya.
- **Perintah yang sama bisa datang dua kali.** QoS 1 boleh mengantar ulang, dan perintah yang telanjur dikirim dengan **Retain** akan datang lagi setiap kali Node 1 menyambung. Karena itu, Node 1 mengingat delapan `id` terakhir dan mengabaikan pengulangannya. Prinsip ini disebut ***idempotent***: mengerjakan perintah yang sama dua kali hasilnya sama dengan sekali. Ingatan itu hanya ada di memori kerja dan kosong lagi setiap *restart*, jadi perintah *retained* tetap dikerjakan lagi setiap kali Node 1 menyala.

Fungsi ini berjalan **di dalam** `mqtt.loop()`, jadi ia harus selesai cepat. Menerbitkan `ack` dari dalamnya aman, asalkan isi perintah sudah dibaca lebih dulu: library memakai satu wadah yang sama untuk pesan masuk dan keluar, dan wadah itu tertimpa begitu kita menerbitkan sesuatu.

**Berapa cepat jawaban datang?** Di WiFi rumah dengan broker di laptop, perjalanan pulang-pergi perintah dan `ack` diperkirakan hanya puluhan sampai beberapa ratus milidetik, jauh di bawah syarat lulus 1 detik. Di Wokwi dengan broker publik, pesan menyeberangi internet dua kali, jadi jawabannya butuh sekitar 1–2 detik; itu wajar dan bukan kesalahan sketsamu.

> ➡️ **Saatnya praktik!** Konsep 8 cukup untuk [Praktik 6 — Perintah dari MQTTX, dijawab `ack`](#praktik-6--perintah-dari-mqttx-dijawab-ack-30-menit) dan [Praktik 7 — Kirim segera saat ada kejadian](#praktik-7--kirim-segera-saat-ada-kejadian-20-menit). Setelah itu, kembali ke Konsep 9.

### 9. Ukuran pesan: wadah 256 byte yang membuang diam-diam

Library **PubSubClient3** menampung setiap pesan yang masuk dalam satu **wadah** (*buffer*, penyangga) di memori. Ukuran bawaannya **256 byte**, dan yang harus muat di sana bukan hanya isi pesan, melainkan **seluruh paket**:

```text
paket = kepala 2–3 byte + panjang topik 2 byte + topik + (2 byte nomor paket untuk QoS 1) + isi
```

Contoh: perintah `set` ke `rpm/a4cf12e5b7c0/cmd` (topik 20 byte) dengan isi JSON sekitar 95 byte membentuk paket sekitar 120 byte. Masih muat.

**Yang terjadi kalau paket masuk lebih besar daripada wadahnya:** library tetap membaca paket itu sampai habis supaya sambungan tidak kacau, lalu **membuangnya diam-diam**. Fungsi penerima perintah tidak dipanggil, tidak ada pesan error, dan `mqtt.loop()` tetap melapor semuanya baik-baik saja. Dari luar, gejalanya hanya satu: **`ack` tidak pernah datang**. Perhatikan: pesan itu tidak dipotong, melainkan **dibuang utuh**. Akibatnya sama berbahayanya karena tidak ada yang tahu.

![Wadah pesan 256 byte yang membuang diam-diam: yang harus muat adalah seluruh paket MQTT yang masuk, bukan hanya isi JSON-nya. Tiga batang. Pertama, perintah set biasa, paket 121 byte (kepala 2 byte, panjang topik, topik 20 byte, nomor paket, isi JSON 95 byte) muat di wadah 256 byte, centang hijau. Kedua, perintah dengan catatan panjang, paket 287 byte, isi JSON 260 byte melewati batas wadah 256 byte; bagian yang melewati batas berwarna merah, silang merah, melewati wadah: dibaca sampai habis, lalu dibuang. Ketiga, setelah setBufferSize(512), paket 287 byte yang sama muat di wadah 512 byte, centang hijau. Legenda: kepala 2 sampai 3 byte; panjang topik 2 ditambah nomor paket 2; topik rpm/<id>/cmd 20 byte; isi JSON. Catatan bawah: paket yang dibuang tidak memanggil fungsi penerima, tidak ada pesan error, mqtt.loop() tetap baik-baik saja; satu-satunya gejala, ack tidak pernah datang; obatnya satu baris di setup(), mqtt.setBufferSize(512)](aset/wadah-256.png)

Untuk pesan keluar, PubSubClient3 lebih murah hati: pesan yang lebih besar daripada wadahnya tetap dikirim sepotong demi sepotong. (PubSubClient 2.8 yang lama menolak mengirimnya: `publish()` menjawab `false`, dan pesannya tidak berangkat.)

Ukuran paket pesan-pesan Node 1 hari ini:

| Pesan | Arah | Ukuran paket kira-kira |
| :--- | :--- | ---: |
| `cmd` jenis `set` | masuk | 110–125 byte |
| `cmd` jenis `set` yang diketik rapi berbaris-baris di MQTTX | masuk | sekitar 145 byte |
| `cmd` jenis `update` (Modul 28) | masuk | sekitar 165 byte |
| `vitals` | keluar | sekitar 105 byte |
| `telemetry` (delapan kolom) | keluar | 155–165 byte |
| `ack` yang menolak, lengkap dengan alasannya | keluar | sekitar 200 byte |

Semuanya memang masih muat dalam 256 byte, tetapi sisanya tipis. Spasi dan baris baru di perintah yang diketik rapi ikut terhitung, dan konfigurasi di Modul 19 akan bertambah kolom. Pesan masuk yang kelak melewati 256 byte akan hilang tanpa jejak. Karena itu, firmware Node 1 dan sketsa Praktik 3, 4, 6, dan 7 memperbesar wadahnya menjadi **512 byte** di `setup()`:

```cpp
mqtt.setBufferSize(512);  // ruang pesan 512 byte (bawaan: 256); menjawab false kalau memori tidak cukup
```

Ongkosnya hanya 256 byte memori tambahan dari sekitar 180 KB yang masih kosong (lihat `heap_free` di `vitals`).

> ⚠️ **Resep `#define MQTT_MAX_PACKET_SIZE 512` dari tutorial lama tidak bekerja.** Baris itu, kalau ditulis di sketsa, tidak sampai ke kode library karena library dikompilasi terpisah dengan angkanya sendiri, yaitu 256. Pakai `setBufferSize()`.

Wadah kedua ada di program kita sendiri: larik seperti `char isi[192]` di Node 1, tempat JSON ditulis sebelum diterbitkan. Kalau JSON-nya lebih panjang daripada larik itu, `serializeJson()` berhenti di ujung larik **tanpa** tanda akhir teks. Karena itu, mulai minggu ini sketsa kita memeriksa panjangnya dulu: kalau hasil `serializeJson()` sama dengan atau lebih dari ukuran larik, pesannya tidak diterbitkan. (Node 1 v1.1 di Modul 10 belum memeriksanya; isinya waktu itu masih jauh lebih pendek daripada larik.)

### 10. Jangan sampai MQTT membuat Node 1 macet

Aturan Modul 10 masih berlaku, kini dengan tambahan: **WiFi boleh putus, broker boleh mati, Node 1 tidak boleh berhenti.** Broker kita berjalan di laptop, dan laptop bisa tertidur, ditutup, atau dibawa pergi kapan saja. Selama itu, Node 1 harus tetap menyiram tanaman dan menyalakan lampu otomatis.

Masalahnya, `mqtt.connect()` **menunggu**. Menyambung ke broker terdiri atas dua langkah: membuka **sambungan TCP** (jalur kirim-terima antara ESP32 dan laptop yang nanti dilewati pesan MQTT; membukanya ibarat menunggu telepon diangkat sebelum mulai bicara), lalu menunggu broker menjawab. Keduanya punya batas waktu bawaan yang terlalu sabar:

| Langkah | Batas bawaan | Kapan batas itu habis |
| :--- | ---: | :--- |
| 1. Membuka sambungan TCP ke laptop | 3 detik | alamat IP salah, laptop tidur, atau sambungan dihadang *firewall* |
| 2. Menunggu jawaban broker (`CONNACK`) | **15 detik** | sambungan terbuka, tetapi broker tidak menjawab |

Lima belas detik jauh melewati kesabaran *watchdog* Modul 8, yaitu **5 detik**. Satu percobaan yang tersangkut cukup untuk membuat Node 1 *restart*, lalu mencoba lagi, lalu *restart* lagi. Lebih buruk lagi, banyak tutorial menulis pola seperti ini:

```cpp
while (!mqtt.connected()) {  // JANGAN di Node 1: loop() tertahan selama broker mati
  mqtt.connect("esp32");
  delay(5000);
}
```

Kemenangan Cepat tadi memakai pola menunggu yang mirip, dan untuk sketsa coba-coba, itu tidak apa-apa. Di Node 1, pola itu membuat sensor, tombol, dan pompa berhenti dilayani selama broker mati.

**Resep kita**, dipakai di semua sketsa praktik dan di Node 1 v1.2:

1. **`klienJaringan.setConnectionTimeout(1000)`**: membuka sambungan TCP paling lama 1 detik.
2. **`mqtt.setSocketTimeout(1)`**: menunggu jawaban broker paling lama 1 detik.
3. **Alamat broker ditulis sebagai alamat IP**, misalnya `"192.168.1.10"`, bukan nama. Mencari nama lewat DNS tidak ikut dibatasi langkah 1 dan bisa menahan program sekitar 7 detik untuk setiap server DNS yang tidak menjawab (🔬 Modul 10).
4. **Mencoba menyambung paling sering setiap 5 detik, dan hanya kalau WiFi tersambung.** Di antara dua percobaan, `loop()` terus berputar seperti biasa.
5. **`mqtt.loop()` dipanggil di setiap putaran `loop()`** selama tersambung. Tanpa itu, pesan masuk tidak terbaca dan detak jantung tidak terkirim.
6. **Setiap kali berhasil menyambung: terbitkan `online` dan berlangganan `cmd` lagi.** Dengan *clean session*, broker melupakan langganan lama begitu sambungan putus.
7. ***Keep-alive* dibiarkan 15 detik**, jangan diperpanjang. Kalau broker hilang tanpa jejak, pesan yang terus diterbitkan Node 1 menumpuk di antrean kirim ESP32. Begitu antrean itu penuh, satu kiriman bisa menunggu sampai sekitar 10 detik, dan *watchdog* pun menggigit. *Keep-alive* 15 detik menyadari broker yang hilang jauh sebelum antrean penuh.

Dengan resep ini, satu percobaan yang gagal hanya menahan `loop()` sekitar 1 detik, paling sering sekali setiap 5 detik. *Watchdog* tetap tenang.

![Tiga baris garis waktu 30 detik saat broker mati atau macet; watchdog Modul 8 me-restart papan kalau loop() macet lebih dari 5 detik. Baris pola tutorial, while (!mqtt.connected()): loop() tertahan; setiap kali tertahan 5 detik, watchdog me-restart Node 1, lalu loop() tertahan lagi. Baris batas bawaan library saat broker macet (sambungan terbuka, tetapi jawaban CONNACK tidak datang), connect() menunggu 15 detik: setelah sebentar berjalan, connect() menunggu, dan pada detik ke-6 watchdog me-restart, sisa 10 detik tidak pernah sampai, lalu berulang dari awal; catatan kecil: broker yang mati total gagal cepat atau setelah 3 detik. Baris resep kita, paling lama 1 detik setiap 5 detik: loop() terus berputar, dengan blok abu-abu kecil "coba ≤ 1 s" pada detik 0, 5, 10, 15, 20, dan 25; sensor, tombol, pompa, dan layar tetap jalan; centang hijau. Bawah: setConnectionTimeout(1000), setSocketTimeout(1), alamat IP bukan nama; coba menyambung paling sering setiap 5 detik, hanya saat WiFi tersambung; mqtt.loop() di setiap putaran](aset/tidak-macet.png)

**Membaca kode `mqtt.state()`.** Setiap kegagalan meninggalkan angka yang menjelaskan penyebabnya. Sketsa kita menerjemahkannya dengan fungsi `namaKeadaanMqtt()`:

| Kode | Artinya | Biasanya karena |
| :---: | :--- | :--- |
| `-4` | broker tidak menjawab tepat waktu | broker macet, atau detak jantung tidak berbalas |
| `-3` | sambungan terputus | WiFi putus, broker dimatikan, atau klien lain memakai nama yang sama |
| `-2` | gagal tersambung ke broker | lihat di bawah tabel |
| `-1` | belum tersambung | keadaan awal, sebelum percobaan pertama |
| `0` | tersambung | — |
| `1`–`3` | ditolak broker | versi MQTT tidak didukung, nama klien ditolak, atau broker sedang tidak bisa melayani |
| `4` | nama pengguna atau kata sandi ditolak | baru relevan mulai Modul 21 |
| `5` | tidak diizinkan broker | `allow_anonymous true` lupa ditulis (Konsep 3) |

Kode `-2` paling sering muncul, dan **lamanya** percobaan memberi petunjuk. Itulah sebabnya sketsa kita mencetak berapa milidetik setiap percobaan berlangsung:

- **Gagal dalam beberapa milidetik:** laptopmu menjawab "tidak ada yang melayani di pintu 1883". Mosquitto belum dijalankan, sedang berjalan dalam mode lokal saja, atau nomor port-nya salah. Jawaban cepat ini biasanya hanya datang dari laptop macOS dan Linux. *Firewall* Windows yang menyala sengaja diam saat pintu yang tidak dilayani diketuk, jadi di laptop Windows, ketiga sebab ini pun biasanya tampak sebagai kegagalan setelah sekitar 1.000 milidetik.
- **Gagal setelah sekitar 1.000 milidetik:** tidak ada jawaban sama sekali. Alamat IP salah, laptop tidur, ESP32 dan laptop beda jaringan, atau *firewall* menghadang. Di laptop Windows, periksa terminal broker lebih dulu: broker yang mati atau berjalan dalam mode lokal saja pun tampak seperti ini.

> ➡️ **Saatnya praktik!** Konsep 9–10 membedah baris-baris pengaman yang sudah kamu pakai sejak Praktik 3. Sekarang lanjut ke [Praktik 8 — Alat pemeriksa kontrak](#praktik-8--alat-pemeriksa-kontrak-20-menit) dan [Praktik 9 — Diagram *pub/sub* dan `KONTRAK-DATA.md`](#praktik-9--diagram-pubsub-dan-kontrak-datamd-20-menit). Setelah itu, lanjut ke 🧩 Tantangan dan ➕ Rumah Pintar Mini.

---

## 🔧 Praktik langkah demi langkah

Sembilan praktik, **berurutan**. Praktik 1–2 hanya memakai laptop. Praktik 3–7 memakai **papan Node 1** di meja kerjamu yang dicolokkan ke laptop; sketsa Node 1 v1.1 memang tertimpa selama praktik, dan di bagian ➕, papan ini menjalankan Node 1 v1.2. Praktik 8–9 kembali ke laptop, lalu ke selembar kertas.

**Dua jendela yang terus terbuka minggu ini:**

1. **Terminal broker** di VS Code. Mosquitto harus sudah menyala **sebelum** ESP32 mencoba menyambung. Kalau laptop sempat tidur atau VS Code tertutup, jalankan lagi perintahnya (langkah 1.3).
2. **MQTTX**, kaca pembesar untuk melihat semua pesan yang lewat.

**Kebiasaan dari Modul 10 tetap berlaku:** setiap sketsa ESP32 dimulai dari sketsa sebelumnya. Buka sketsa itu, pilih **File → Save As…** (**Ctrl + Shift + S**), pindah ke folder **Documents → GitHub → belajar-iot → modul-11**, lalu simpan dengan nama baru. Tab `secrets.h` ikut tersalin, jadi kamu cukup mengganti isi tab utama.

Tiga langkah di bagian ➕ berikut adalah syarat lulus (bertanda ⭐):

1. **Bagian ➕ E** — perintah dari MQTTX menyalakan relay dan dibalas `ack` dalam waktu kurang dari 1 detik (latihannya: Praktik 6).
2. **Bagian ➕ F** — `telemetry` Node 1 lolos alat pemeriksa kontrak (latihannya: Praktik 8).
3. **Bagian ➕ H** — diagram *pub/sub* proyekmu tergambar di kertas (latihannya: Praktik 9).

> 🖥️ **Mengerjakan Praktik 3–7 di Wokwi?** Siapkan satu proyek Wokwi berisi rangkaian Node 1, lalu pakai berulang untuk kelima praktik itu:
>
> 1. Buka proyek ESP32 baru di [wokwi.com](https://wokwi.com). Di tab **`diagram.json`**, ganti seluruh isinya dengan isi file [`kode/node-1-rumah/diagram.json`](kode/node-1-rumah/diagram.json) (buka filenya di GitHub, klik ikon **Copy raw file**, lalu tempel).
> 2. **Beri ESP32-mu alamat MAC sendiri.** Di `diagram.json` tadi, cari baris `"macAddress": "24:0a:c4:00:01:10"`, lalu ganti **tiga pasang terakhir** dengan angka dan huruf `0`–`9`/`a`–`f` pilihanmu, misalnya `"24:0a:c4:5e:11:4b"`. Tanpa langkah ini, semua ESP32 simulasi di dunia punya `device_id` yang sama, `240ac4000110`, dan saling mengusir di broker publik (Konsep 5). Jangan pula menyalin contoh tadi persis: pembaca lain yang menyalinnya akan mendapat `device_id` yang sama denganmu. Karang sendiri susunannya, tetapi jangan memakai data pribadi seperti tanggal lahir karena `device_id` terlihat oleh siapa saja di broker publik.
> 3. Buat file **`secrets.h`** lewat **▾ → New file...** dan isi dengan jaringan `Wokwi-GUEST`, seperti di Kemenangan Cepat.
> 4. Di tab **`libraries.txt`**, ganti seluruh isinya dengan empat baris ini:
>
>    ```text
>    PubSubClient3@3.3.2
>    ArduinoJson@7.4.3
>    DHT sensor library@1.4.7
>    Adafruit Unified Sensor@1.1.15
>    ```
>
> 5. Di setiap praktik, tempel sketsanya ke `sketch.ino`, lalu ubah baris `ALAMAT_BROKER` menjadi broker publik `"broker.emqx.io"` (Praktik 5: `"broker.hivemq.com"`). Di MQTTX, pakai sambungan **Broker publik** dari Kemenangan Cepat dan berlanggananlah `rpm/` + `device_id`-mu + `/#`, misalnya `rpm/240ac45e114b/#`. Jangan memakai `rpm/#` atau `rpm/+/…` di broker publik: pesan pembaca lain di seluruh dunia ikut tertangkap. Kalau sebuah langkah memakai langganan seperti itu (misalnya `rpm/+/status` di Praktik 4), ganti `+` dengan `device_id`-mu, misalnya `rpm/240ac45e114b/status`.
> 6. **Perintah terminal di praktik-praktik ini menuju broker laptop.** Di jalur Wokwi, perintah yang mengintip ESP32 (topik `rpm/…`) diberi tambahan `-h broker.emqx.io`, dan topiknya memakai `device_id`-mu, misalnya `mosquitto_sub -h broker.emqx.io -v -t "rpm/240ac45e114b/status"`. Latihan bertopik `latihan/…` yang tidak melibatkan ESP32 (papan pengumuman di akhir Praktik 4 dan langkah 5.1) tetap dikerjakan di broker laptop, tanpa `-h`. Alat pemeriksa di Praktik 8 juga diberi alamat broker publik dan `device_id`-mu: `node pemeriksa-kontrak.js broker.emqx.io 240ac45e114b`.
>
> Broker publik bisa dibaca dan ditulisi siapa saja, jadi kirimkan hanya data simulasi, dan jangan pernah menyambungkan papan asli yang memegang relay dan pompa ke sana. Kotak **Hasilnya** bertanda **contoh** di praktik-praktik ini disusun dari rekaman Wokwi yang dibuat persis dengan cara ini; hanya nama WiFi, alamat, `device_id`, dan angkanya yang diganti dengan contoh dari jaringan rumah.

### Praktik 1 — Pasang broker Mosquitto di laptop (30 menit)

> 🖥️ **Alat:** laptop dengan **browser**, **VS Code** dengan folder `rumah-pintar-mini` dari Modul 4, dan izin administrator di laptop (untuk memasang program). Belum perlu ESP32. Konsep yang dipakai: 3.

#### 1.1 Pasang Mosquitto

**Windows:**

1. Buka [mosquitto.org/download](https://mosquitto.org/download/). Di bagian **Windows**, klik `mosquitto-2.1.2-install-windows-x64.exe` (versi 64-bit, dipakai hampir semua laptop).
2. Jalankan file itu. Windows bertanya `Do you want to allow this app to make changes to your device?`; klik **Yes**. Kalau muncul layar biru `Windows protected your PC`, pastikan file itu memang kamu unduh dari mosquitto.org, klik **More info**, lalu **Run anyway**.
3. Di halaman pembuka penginstal, klik **Next >**.
4. **Langkah terpenting:** di halaman `Choose Components`, **hilangkan centang Service**. Biarkan **Files** dan **Visual Studio Runtime** tetap tercentang, lalu klik **Next >**. (Kalau **Service** tetap tercentang, penginstal menyalakan broker kedua di latar belakang yang memakai pintu 1883; lihat Konsep 3.)
5. Biarkan folder tujuan `C:\Program Files\Mosquitto`, klik **Install**, lalu **Finish**.

Penginstal tidak mendaftarkan folder itu ke daftar folder program (`PATH`), jadi terminal belum mengenal perintah `mosquitto`. Daftarkan sekali saja:

6. Klik **Start**, ketik `environment`, lalu pilih **Edit environment variables for your account**.
7. Di jendela `Environment Variables`, pada bagian atas (**User variables for** nama akunmu), klik baris **Path**, lalu klik **Edit…**.
8. Klik **New**, ketik `C:\Program Files\Mosquitto`, lalu tekan **Enter**. Klik **OK**, lalu **OK** sekali lagi.
9. **Tutup semua jendela VS Code, lalu buka lagi.** VS Code hanya membaca daftar folder program saat dibuka.

**macOS** (butuh [Homebrew](https://brew.sh)): buka Terminal, lalu ketik `brew install mosquitto`. Di Mac dengan chip Apple, pemasangannya hanya beberapa menit. Di Mac Intel, Homebrew harus mengompilasi Mosquitto dulu, jadi bisa jauh lebih lama. **Jangan** menjalankan `brew services start mosquitto`; kita menjalankan broker di terminal saja.

**Linux (Ubuntu, Debian, atau Raspberry Pi OS):** ketik `sudo apt install mosquitto mosquitto-clients`. Paket ini langsung menyalakan Mosquitto sebagai layanan latar belakang dalam mode lokal saja, jadi matikan dulu supaya pintu 1883 bebas: `sudo systemctl disable --now mosquitto`. (Di Modul 12, justru layanan inilah yang kita pakai di Raspberry Pi.) Versi dari Ubuntu 24.04 adalah 2.0.18; beberapa tulisan di terminalnya sedikit berbeda dengan contoh di bawah, tetapi langkahnya sama.

#### 1.2 Lihat sendiri jebakan "mode lokal saja"

1. Di VS Code, buka terminal: **Terminal → New Terminal**.
2. Ketik perintah ini, lalu tekan **Enter**:

   ```bash
   mosquitto -v
   ```

   **Hasilnya** (contoh; baris yang disingkat `…` berisi keterangan fitur seperti `Websockets support available.`):

   ```text
   1792287012: mosquitto version 2.1.2 starting
   1792287012: Using default config.
   …
   1792287012: Starting in local only mode. Connections will only be possible from clients running on this machine.
   1792287012: Create a configuration file which defines a listener to allow remote access.
   1792287012: For more details see https://mosquitto.org/documentation/authentication-methods/
   1792287012: Opening ipv4 listen socket on port 1883.
   1792287012: Opening ipv6 listen socket on port 1883.
   …
   1792287012: mosquitto version 2.1.2 running
   ```

   Angka di depan setiap baris adalah jam broker, ditulis sebagai jumlah detik sejak 1 Januari 1970 (Konsep 6 Modul 10). Yang penting adalah tiga baris di tengah: **broker ini hanya melayani laptopmu sendiri.** ESP32 tidak akan pernah bisa masuk.
3. Hentikan broker itu dengan **Ctrl + C**. Baris terakhirnya `mosquitto version 2.1.2 terminating`.

Terminal menulis `The term 'mosquitto' is not recognized…` (Windows) atau `command not found` (macOS dan Linux)? Buka "`mosquitto` tidak dikenali terminal" di 🚨.

#### 1.3 Buka pintunya untuk jaringan rumah

1. Di panel **Explorer** VS Code, klik ruang kosong di bawah daftar file (supaya folder baru tidak masuk ke folder lain), lalu buat folder baru bernama **`edge`** (ikon **New Folder…**). *Edge* (tepi) adalah sebutan untuk perangkat di tepi jaringan rumahmu yang menjalankan broker. Minggu ini laptopmu yang memerankannya; mulai Modul 12, Raspberry Pi mengambil alih, dan konfigurasinya disimpan di folder yang sama.
2. Klik kanan folder `edge`, pilih **New File…**, lalu beri nama **`mosquitto-lan.conf`**. Isi dengan empat baris ini, lalu simpan (**Ctrl + S**):

   ```text
   # mosquitto-lan.conf - broker latihan Modul 11: terbuka untuk jaringan rumah, TANPA kata sandi.
   # Matikan broker sebelum laptop tersambung ke WiFi umum. Gembok sungguhan dipasang di Modul 21.
   listener 1883
   allow_anonymous true
   ```

   Baris yang diawali `#` adalah catatan untuk manusia. Mosquitto hanya menganggap `#` sebagai catatan kalau letaknya **di awal baris**; jangan menulis catatan di belakang `listener 1883`. File yang sama juga tersedia di [`proyek-rumah-pintar-mini/edge/`](../../proyek-rumah-pintar-mini/edge/mosquitto-lan.conf).
3. Di terminal, masuk ke folder `edge`, lalu jalankan broker dengan file itu:

   ```bash
   cd edge
   ```

   ```bash
   mosquitto -v -c mosquitto-lan.conf
   ```

   **Hasilnya** (contoh):

   ```text
   1792287072: mosquitto version 2.1.2 starting
   1792287072: Config loaded from mosquitto-lan.conf.
   …
   1792287072: Opening ipv4 listen socket on port 1883.
   1792287072: Opening ipv6 listen socket on port 1883.
   1792287072: mosquitto version 2.1.2 running
   ```

   Tulisan `Starting in local only mode` **tidak muncul lagi**, dan kedua baris `Opening … listen socket` kini menandakan pintu 1883 terbuka untuk semua jaringan laptop. Urutan baris `ipv4` dan `ipv6` boleh terbalik. Di Windows, jendela `Windows Security` biasanya muncul tepat saat ini; jangan klik **Cancel**, tetapi jawablah seperti di langkah 1.4.

**Biarkan terminal ini tetap terbuka.** Inilah kantor pos kita. Setiap kali mulai belajar lagi, buka terminal, ketik `cd edge`, lalu jalankan perintah yang sama. Kalau tertulis `Error: Unable to open config file`, berarti terminalmu belum berada di folder `edge`.

#### 1.4 Izinkan Mosquitto lewat *firewall*

**Windows.** Begitu Mosquitto membuka pintu untuk jaringan, Windows biasanya memunculkan jendela `Windows Security` untuk aplikasi **mosquitto** (atau `mosquitto.exe`). Jawablah seperti untuk Node.js di Praktik 7 Modul 10:

- **Windows 11:** judulnya biasanya `Do you want to allow public and private networks to access this app?`; klik **Allow**. Supaya izinnya hanya berlaku di jaringan **pribadi**, buka daftar izin dengan cara di butir terakhir, lalu hilangkan centang **Public** untuk mosquitto.
- **Windows 10:** judulnya `Windows Defender Firewall has blocked some features of this app`; centang **Private networks** saja, lalu klik **Allow access**.
- **Pastikan WiFi rumahmu berprofil pribadi**: **Settings → Network & internet → Wi-Fi**, klik nama WiFi rumahmu, lalu pada **Network profile type** pilih **Private network** (sudah kamu lakukan di Modul 10).
- **Jendela itu tidak muncul, atau telanjur memilih Cancel?** Buka aplikasi **Windows Security → Firewall & network protection → Allow an app through firewall**, klik **Change settings**, lalu cari **mosquitto** di daftar. Kalau ada, centang kolom **Private** dan kosongkan **Public**. Kalau tidak ada, klik **Allow another app…**, klik **Browse…**, pilih `C:\Program Files\Mosquitto\mosquitto.exe`, lalu klik **Network types…**. Centang **Private** saja dan klik **OK**, kemudian klik **Add**, dan terakhir **OK**.

**macOS:** *firewall* Mac biasanya mati. Kalau menyala, macOS bertanya apakah `mosquitto` boleh menerima sambungan masuk; klik **Allow**. **Linux:** *firewall* Ubuntu (`ufw`) mati kecuali pernah kamu nyalakan; kalau menyala, izinkan pintu 1883 untuk jaringan rumah saja, misalnya `sudo ufw allow proto tcp from 192.168.1.0/24 to any port 1883`.

#### 1.5 Satu broker saja (Windows), lalu catat alamat IP laptop

**macOS dan Linux:** lewati pemeriksaan ini karena layanan Mosquitto sudah dimatikan (Linux) atau memang tidak dijalankan (macOS) di langkah 1.1; langsung ke paragraf **Semua sistem operasi** di bawah. **Windows:** buka terminal **kedua** (**Terminal → Split Terminal**, atau ikon belah di pojok terminal), lalu ketik:

```powershell
Get-NetTCPConnection -LocalPort 1883 -State Listen
```

**Hasilnya** (contoh; angka `OwningProcess` di laptopmu berbeda):

```text
LocalAddress                        LocalPort RemoteAddress                       RemotePort State       AppliedSetting OwningProcess
------------                        --------- -------------                       ---------- -----       -------------- -------------
::                                  1883      ::                                  0          Listen                     14832
0.0.0.0                             1883      0.0.0.0                             0          Listen                     14832
```

Dua baris dengan **angka `OwningProcess` yang sama** berarti satu broker yang mendengarkan di semua jaringan: benar. Kalau ada baris `127.0.0.1` atau `::1` dengan angka **berbeda**, berarti layanan Mosquitto dari penginstal ikut berjalan. Buka "Dua broker berjalan bersamaan" di 🚨 sebelum lanjut. (Perintah ini khusus PowerShell, terminal bawaan VS Code di Windows.)

**Semua sistem operasi:** terakhir, **catat alamat IP laptopmu**. Buat file baru `catatan-modul11.md` di folder **Documents → GitHub → belajar-iot → modul-11**, tempat sketsa Kemenangan Cepat tadi (di VS Code: **File → New Text File**, lalu **File → Save As…** ke folder itu), seperti `catatan-modul10.md` di Modul 10. Cara mencari alamatnya ada di Praktik 7.1 Modul 10: ketik `ipconfig` (Windows), `ipconfig getifaddr en0` (macOS), atau `hostname -I` (Linux) di terminal kedua, bukan di terminal broker. Di macOS dan Linux, buka dulu terminal kedua itu dengan **Terminal → Split Terminal**. Alamat itulah yang akan ditulis di sketsa ESP32 mulai Praktik 3.

**Bedah langkahnya:**

- **Mengapa tidak memakai layanan bawaan penginstal?** Layanan Windows berjalan diam-diam tanpa jendela, dengan file konfigurasi di `C:\Program Files\Mosquitto` yang hanya bisa diubah oleh administrator, dan tidak pernah memperlihatkan catatannya. Untuk belajar, broker di terminal jauh lebih jujur: setiap klien dan pesan terlihat. Di Modul 12, broker pindah ke Raspberry Pi dan baru menjadi layanan yang selalu menyala.
- **Mengapa file konfigurasinya di folder proyek, bukan di folder Mosquitto?** Supaya ikut tersimpan di repositori proyekmu, bisa dibaca siapa saja, dan tidak hilang. Penghapus program Mosquitto ikut menghapus `mosquitto.conf` di folder pemasangannya.
- **`-v` di Linux dan macOS** menampilkan lebih banyak baris daripada tanpa `-v`, termasuk setiap pesan yang lewat. Di Windows, tanpa `-v` Mosquitto hampir tidak mencetak apa-apa, jadi biasakan selalu menulisnya.

> ⬆️ **Selesai Praktik 1?** Kembali ke [Konsep 4](#4-topik-dan-wildcard-alamat-pesan-yang-bertingkat) (➡️ di akhir Konsep 4 akan mengantarmu ke Praktik 2).

### Praktik 2 — Berkirim pesan dari terminal dan MQTTX (20 menit)

> 🖥️ **Alat:** **VS Code** dengan terminal broker dari Praktik 1 yang masih menyala, dan **MQTTX**. Belum perlu ESP32. Konsep yang dipakai: 2 dan 4.

Sebelum ESP32 ikut, kita pastikan kantor posnya bekerja dengan klien yang paling sederhana: dua program kecil yang ikut terpasang bersama Mosquitto, **`mosquitto_sub`** (pelanggan) dan **`mosquitto_pub`** (penerbit).

#### 2.1 Satu pelanggan, satu penerbit

1. Di VS Code, buka terminal kedua dengan **Terminal → Split Terminal** (terminal kedua dari langkah 1.5 boleh dipakai). Terminal broker tetap berjalan di sebelahnya; jangan mengetik apa pun di sana.
2. Di terminal kedua, jadilah **pelanggan** semua topik di bawah `latihan/`:

   ```bash
   mosquitto_sub -v -t "latihan/#"
   ```

   Tidak ada yang tercetak, dan memang begitu: pelanggan sedang menunggu. `-t` adalah topik yang dilanggani, dan `-v` meminta setiap pesan dicetak bersama topiknya. Lirik terminal broker: ada klien baru yang tercatat, kira-kira `New client connected from … as auto-…`. Karena `mosquitto_sub` tidak menyebut namanya sendiri, broker memberinya nama acak berawalan `auto-`.
3. Buka terminal **ketiga** (**Split Terminal** sekali lagi), lalu **terbitkan** sebuah pesan:

   ```bash
   mosquitto_pub -t "latihan/halo" -m "halo dari terminal"
   ```

   `-m` adalah isi pesannya. `mosquitto_pub` menyambung, menerbitkan satu pesan, lalu langsung pamit.

**Hasilnya** di terminal kedua:

```text
latihan/halo halo dari terminal
```

Selamat, kantor posmu bekerja: penerbit dan pelanggan tidak saling kenal; keduanya hanya tahu broker. Di terminal broker, kamu juga bisa melihat jejak setiap langkahnya, misalnya `Received PUBLISH from …` dan `Sending PUBLISH to …`.

#### 2.2 Coba *wildcard*

1. Di terminal kedua, hentikan pelanggan dengan **Ctrl + C**, lalu berlangganan dengan `+`:

   ```bash
   mosquitto_sub -v -t "latihan/+/suhu"
   ```

2. Tebak dulu sebelum mencoba: mana yang akan sampai? Lalu, di terminal ketiga, terbitkan empat pesan ini satu per satu.

   ```bash
   mosquitto_pub -t "latihan/node1/suhu" -m "28.5"
   ```

   ```bash
   mosquitto_pub -t "latihan/node2/suhu" -m "27.9"
   ```

   ```bash
   mosquitto_pub -t "latihan/node1/kelembapan" -m "71"
   ```

   ```bash
   mosquitto_pub -t "latihan/node1/Suhu" -m "30.0"
   ```

   **Hasilnya** di terminal kedua:

   ```text
   latihan/node1/suhu 28.5
   latihan/node2/suhu 27.9
   ```

   Pesan ketiga tidak sampai karena tingkat terakhirnya bukan `suhu`. Pesan keempat juga tidak sampai karena `Suhu` yang berawalan huruf besar **bukan** `suhu` (Konsep 4). Broker tidak memberi tahu siapa pun bahwa kedua pesan itu tidak punya pelanggan; keduanya dibuang diam-diam.
3. Hentikan pelanggan (**Ctrl + C**), lalu berlangganan dengan `#`: `mosquitto_sub -v -t "latihan/#"`. Di terminal ketiga, terbitkan lagi pesan ketiga tadi: tekan **↑** sampai muncul `mosquitto_pub -t "latihan/node1/kelembapan" -m "71"`, lalu **Enter**. Kali ini ia sampai karena `latihan/#` menangkap semua tingkat di bawah `latihan/`.
4. **Intip kantor posnya sendiri.** Hentikan pelanggan, lalu berlangganan topik `$SYS` yang mencatat jumlah klien yang sedang tersambung:

   ```bash
   mosquitto_sub -v -t '$SYS/broker/clients/connected'
   ```

   **Hasilnya** (contoh; angkanya bergantung pada berapa klien yang sedang tersambung):

   ```text
   $SYS/broker/clients/connected 1
   ```

   Broker memeriksa angka itu setiap 10 detik dan menerbitkannya lagi begitu berubah. Topik `$SYS` wajib diapit **petik tunggal**; dengan petik ganda atau tanpa petik, PowerShell dan bash menganggap `$SYS` sebagai nama variabel dan mengirim topik yang salah. Hentikan dengan **Ctrl + C**.

#### 2.3 Sambungkan MQTTX ke broker laptop

1. Di MQTTX, klik ikon **+** di bilah paling kiri untuk membuat sambungan baru (**New Connection**). Isi **Name** dengan `Broker laptop`.
2. Di kolom **Host**, biarkan pilihan `mqtt://`, lalu **ganti** `broker.emqx.io` dengan `127.0.0.1`. Alamat khusus ini selalu berarti "laptop ini sendiri", sama dengan `localhost` di Modul 4. **Port** tetap `1883`, dan kolom lain biarkan apa adanya.
3. Klik **Connect**, lalu tunggu sampai muncul `Connected`. Di terminal broker, MQTTX tercatat dengan nama acak berawalan `mqttx_`.
4. Klik **New Subscription**, isi **Topic** dengan `latihan/#`, lalu klik **Confirm**.
5. Di terminal ketiga, terbitkan lagi:

   ```bash
   mosquitto_pub -t "latihan/node1/suhu" -m "28.5"
   ```

   Pesan itu muncul di MQTTX, lengkap dengan topiknya.
6. Sekarang arah sebaliknya. Di terminal kedua, berlangganan lagi `latihan/#` (`mosquitto_sub -v -t "latihan/#"`). Di kotak kirim MQTTX, ubah format **JSON** menjadi **Plaintext**, isi kolom **Topic** dengan `latihan/node2/suhu`, ketik `27.9`, lalu klik tombol kirim (ikon pesawat kertas). Terminal kedua mencetak `latihan/node2/suhu 27.9`, dan MQTTX pun menampilkan pesan yang baru saja ia kirim sendiri karena ia juga berlangganan `latihan/#`.

![Ilustrasi MQTTX 1.13.1, bukan tangkapan layar: formulir sambungan baru ke broker di laptop (Praktik 2.3); yang diubah hanya Name dan Host. Bilah atas: ‹ Back, judul New, dan tombol hijau Connect (penanda 3). Bagian General: * Name berisi Broker laptop (penanda 1); * Host berupa pilihan mqtt:// dan kolom 127.0.0.1, semula broker.emqx.io (penanda 2); * Port 1883; Client ID mqttx_3f9a1c2b; Username dan Password kosong; sakelar SSL/TLS mati. Bagian Advanced: MQTT Version 5.0 dan Keep Alive 60 (s), dengan catatan MQTT 5.0 boleh dibiarkan karena Mosquitto mengerti 3.1.1 (ESP32) dan 5.0 (MQTTX). Kotak keterangan: 1, Name, nama bebas hanya untukmu, Broker laptop; 2, Host, ganti broker.emqx.io dengan 127.0.0.1 yang berarti laptop ini sendiri (Praktik 2.4: alamat IP laptop); 3, Connect, lalu tunggu pemberitahuan Connected. Catatan kecil di kanan bawah: kolom Advanced lain, seperti Connect Timeout, Auto Reconnect, dan Clean Start, tidak digambar; biarkan apa adanya](aset/mqttx-sambungan-laptop.png)

*Ilustrasi: tampilan MQTTX 1.13.1 digambar ulang, bukan tangkapan layar; label antarmuka dari kode sumber [MQTTX](https://github.com/emqx/MQTTX) (© EMQ Technologies, lisensi Apache 2.0); nama klien (Client ID) hanya contoh.*

#### 2.4 Uji pintu jaringan

Sejauh ini semua klien menyambung lewat `127.0.0.1`, alamat khusus untuk laptop itu sendiri. ESP32 kelak datang lewat **alamat IP laptop di WiFi**, misalnya `192.168.1.10`. Mari pastikan pintu 1883 juga terbuka lewat alamat itu:

1. Di MQTTX, buat sambungan baru lagi lewat ikon **+** di bilah kiri: **Name** `Lewat IP laptop`, **Host** alamat IP laptopmu (dari Praktik 1), **Port** `1883`, lalu **Connect**.
2. Di macOS 15 ke atas, MQTTX mungkin lebih dulu meminta izin menemukan perangkat di jaringan lokal; jawab **Allow** karena tanpa izin itu sambungan ke alamat IP laptop bisa gagal. Muncul `Connected`? Bagus: broker tidak berjalan dalam mode lokal saja.

Muncul `Connect Failed` atau `Error: connect ECONNREFUSED …`? Periksa lagi apakah terminal broker menjalankan `mosquitto -v -c mosquitto-lan.conf` (bukan sekadar `mosquitto -v`), lalu buka "Tidak bisa tersambung ke broker (`Gagal`, kode `-2`)" di 🚨. Uji ini belum memeriksa *firewall* karena sambungan dari laptop ke alamatnya sendiri biasanya tidak dihadang *firewall*; ESP32 di Praktik 3 yang akan mengujinya.

**Bedah langkahnya:**

- **Mengapa topik `latihan/`, bukan `rpm/`?** Topik `rpm/…` dicadangkan untuk pesan sungguhan yang mengikuti kontrak data. Alat pemeriksa di Praktik 8 akan menandai pesan latihan yang nyasar ke sana.
- **Petik ganda di topik.** `"latihan/#"` sebenarnya aman tanpa petik karena `#`-nya tidak di awal kata. Namun, `-t #` saja (tanpa petik) dianggap catatan oleh PowerShell dan bash sehingga topiknya hilang. Membiasakan diri memberi petik mencegah kebingungan itu.
- **Jangan mengirim JSON lewat `mosquitto_pub -m` di Windows PowerShell 5.1** (PowerShell bawaan Windows 10 dan 11). PowerShell versi itu membuang petik ganda di dalam argumen sehingga `{"suhu":28.5}` tiba sebagai `{suhu:28.5}`, yang bukan JSON. Untuk pesan JSON, pakai MQTTX.

> ⬆️ **Selesai Praktik 2?** Kembali ke [Konsep 5 — Kontrak data](#5-kontrak-data-lima-topik-dan-satu-bentuk-json-untuk-semua) (➡️ di akhir Konsep 5 akan mengantarmu ke Praktik 3).

### Praktik 3 — ESP32 menerbitkan `telemetry` ke broker laptop (30 menit)

> 🖥️ **Alat:** **Arduino IDE** dan **Serial Monitor**, papan Node 1 (DHT22 dan LDR mendapat 3,3 V dari ESP32, jadi MB102 boleh tetap mati), terminal broker yang menyala, dan **MQTTX** dengan sambungan **Broker laptop**. **Laptop dan ESP32 harus tersambung ke WiFi yang sama.** Bisa juga di Wokwi (lihat kotak di awal 🔧); di sana, lewati langkah 5 dan 6, yang butuh kabel sungguhan dan broker yang bisa kamu matikan sendiri. Konsep yang dipakai: 5. Tiga baris pengaman di `setup()` baru dibedah di Konsep 9 dan 10, setelah Praktik 7; untuk sekarang, cukup tahu bahwa `setConnectionTimeout()` dan `setSocketTimeout()` membuat ESP32 tidak menunggu lama saat broker tidak menjawab, dan `setBufferSize()` memperbesar wadah pesan.

Sekarang ESP32 sungguhan menerbitkan bacaan ke broker di laptopmu, mengikuti kontrak data. Sketsa ini masih memuat tiga bacaan saja (suhu, kelembapan, cahaya) dari dua sensor supaya ringkas; Node 1 v1.2 di bagian ➕ menerbitkan kedelapan kolom.

1. Buka sketsa `modul11_halo_broker` dari Kemenangan Cepat, pilih **File → Save As…**, lalu simpan di folder `modul-11` dengan nama `modul11_telemetri`. Ganti **seluruh** isi tab utama dengan kode ini:

   ```cpp
   // Modul 11 - Praktik 3: kirim telemetry lewat MQTT ke broker di laptop
   // Setiap 10 detik, ESP32 menerbitkan suhu dan kelembapan (DHT22, D14) serta cahaya (LDR, VP)
   // sebagai JSON ke topik rpm/<device_id>/telemetry di broker Mosquitto laptopmu (Praktik 1).
   // Menyambung ke broker TIDAK pernah menunggu lama: paling lama sekitar 1 detik, dicoba lagi setiap 5 detik (Konsep 10).

   #include <WiFi.h>
   #include <PubSubClient.h>  // library PubSubClient3 versi 3.3.2
   #include <ArduinoJson.h>   // library ArduinoJson versi 7.4.3 (Modul 10)
   #include <DHT.h>           // library DHT dari Modul 6
   #include <time.h>
   #include <esp_mac.h>       // esp_read_mac(): alamat MAC langsung dari chip
   #include "secrets.h"       // berisi WIFI_NAMA dan WIFI_SANDI

   #ifndef MQTT_QOS1  // hanya PubSubClient3 yang punya nama ini
   #error "Yang terpakai PubSubClient lama (2.8). Hapus lewat Library Manager, lalu pasang PubSubClient3 versi 3.3.2."
   #endif

   // GANTI 192.168.1.10 dengan alamat IP laptopmu (cara mencarinya: Modul 10, Praktik 7.1).
   // Selalu tulis alamat IP, bukan nama: mencari nama bisa menahan program beberapa detik.
   const char ALAMAT_BROKER[] = "192.168.1.10";
   const uint16_t PORT_BROKER = 1883;

   const int PIN_DHT = 14;  // DHT22, Modul 6
   const int PIN_LDR = 36;  // VP: LDR (ADC1), Modul 6
   const char ZONA_WAKTU[] = "WIB-7";
   const unsigned long JEDA_KIRIM = 10000;     // telemetry setiap 10 detik (Lampiran A)
   const unsigned long JEDA_COBA_MQTT = 5000;  // gagal menyambung ke broker? coba lagi 5 detik kemudian

   DHT dht(PIN_DHT, DHT22);
   WiFiClient klienJaringan;          // sambungan TCP ke broker
   PubSubClient mqtt(klienJaringan);  // MQTT berjalan di atas sambungan itu
   char idPerangkat[13];              // device_id: 12 digit heksadesimal + tanda akhir teks (Lampiran A)
   char topikTelemetry[40];           // rpm/<device_id>/telemetry
   unsigned long waktuKirimTerakhir = 0;
   unsigned long waktuCobaTerakhir = 0;
   bool sudahPernahCoba = false;

   // Arti angka mqtt.state() (Konsep 10). Angka 1-5 adalah jawaban broker sendiri.
   const char* namaKeadaanMqtt(int kode) {
     switch (kode) {
       case -4: return "broker tidak menjawab tepat waktu";
       case -3: return "sambungan terputus";
       case -2: return "gagal tersambung ke broker";
       case -1: return "belum tersambung";
       case 0: return "tersambung";
       case 4: return "nama pengguna atau kata sandi ditolak";
       case 5: return "tidak diizinkan broker";
       default: return "ditolak broker";
     }
   }

   // Cap waktu ts (Lampiran A), sama dengan Modul 10. Menjawab false kalau jam belum disetel dari internet.
   bool buatTs(char* ts, size_t ukuran) {
     time_t sekarang = time(nullptr);
     struct tm utc;
     gmtime_r(&sekarang, &utc);
     if (utc.tm_year + 1900 < 2025) {
       return false;
     }
     strftime(ts, ukuran, "%Y-%m-%dT%H:%M:%SZ", &utc);
     return true;
   }

   // Satu kali percobaan menyambung, paling sering setiap JEDA_COBA_MQTT. Tidak pernah berputar menunggu.
   void cobaSambungkanBroker() {
     if (sudahPernahCoba && millis() - waktuCobaTerakhir < JEDA_COBA_MQTT) {
       return;
     }
     sudahPernahCoba = true;
     waktuCobaTerakhir = millis();
     unsigned long mulai = millis();
     if (mqtt.connect(idPerangkat)) {  // client ID = device_id: unik untuk setiap papan
       Serial.printf("Tersambung ke broker %s dalam %lu ms, sebagai %s\n", ALAMAT_BROKER, millis() - mulai, idPerangkat);
     } else {
       int kode = mqtt.state();
       Serial.printf("Gagal ke broker setelah %lu ms: %s (kode %d). Coba lagi 5 detik lagi.\n", millis() - mulai,
                     namaKeadaanMqtt(kode), kode);
     }
   }

   void kirimTelemetry() {
     char ts[21];
     if (!buatTs(ts, sizeof(ts))) {
       Serial.println("Jam belum disetel dari internet: kiriman ditunda (setiap data wajib membawa ts).");
       return;
     }
     JsonDocument dokumen;
     dokumen["ts"] = ts;
     dokumen["suhu"] = dht.readTemperature();  // NAN (gagal dibaca) ditulis ArduinoJson sebagai null
     float kelembapan = dht.readHumidity();
     if (isnan(kelembapan)) {
       dokumen["kelembapan"] = nullptr;  // bacaan gagal ditulis null (kontrak data, Konsep 5)
     } else {
       dokumen["kelembapan"] = (int)round(kelembapan);
     }
     dokumen["cahaya"] = 4095 - analogRead(PIN_LDR);  // dibalik seperti Node 1: makin terang, makin besar
     char isi[160];
     size_t panjang = serializeJson(dokumen, isi, sizeof(isi));
     if (panjang >= sizeof(isi)) {
       Serial.println("JSON terlalu panjang untuk wadah isi[]: tidak dikirim.");
       return;
     }
     if (mqtt.publish(topikTelemetry, isi)) {
       Serial.printf("Terbit ke %s: %s\n", topikTelemetry, isi);
     } else {
       Serial.printf("GAGAL terbit ke %s\n", topikTelemetry);
     }
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     dht.begin();
     Serial.println();

     uint8_t mac[6];
     esp_read_mac(mac, ESP_MAC_WIFI_STA);
     snprintf(idPerangkat, sizeof(idPerangkat), "%02x%02x%02x%02x%02x%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
     snprintf(topikTelemetry, sizeof(topikTelemetry), "rpm/%s/telemetry", idPerangkat);

     klienJaringan.setConnectionTimeout(1000);  // menyambung TCP paling lama 1 detik (bawaan: 3 detik)
     mqtt.setServer(ALAMAT_BROKER, PORT_BROKER);
     mqtt.setSocketTimeout(1);   // menunggu jawaban broker paling lama 1 detik (bawaan: 15 detik)
     mqtt.setBufferSize(512);    // ruang pesan 512 byte (bawaan: 256), Konsep 9

     Serial.printf("Menyambung ke \"%s\"", WIFI_NAMA);
     WiFi.mode(WIFI_STA);
     WiFi.begin(WIFI_NAMA, WIFI_SANDI);
     unsigned long mulai = millis();
     while (WiFi.status() != WL_CONNECTED && millis() - mulai < 20000) {
       Serial.print(".");
       delay(250);
     }
     Serial.println();
     if (WiFi.status() != WL_CONNECTED) {
       Serial.println("Belum tersambung setelah 20 detik. Periksa tab secrets.h, lalu tekan EN.");
       return;
     }
     Serial.printf("Tersambung ke WiFi, IP ESP32 %s, device_id %s\n", WiFi.localIP().toString().c_str(), idPerangkat);
     configTzTime(ZONA_WAKTU, "pool.ntp.org", "asia.pool.ntp.org");  // jam dari internet (Modul 10)
   }

   void loop() {
     if (WiFi.status() != WL_CONNECTED) {
       return;  // WiFi putus: paket esp32 menyambung ulang sendiri (Modul 10)
     }
     if (!mqtt.connected()) {
       cobaSambungkanBroker();
       return;
     }
     mqtt.loop();  // wajib dipanggil sesering mungkin: menjaga sambungan tetap hidup
     if (millis() - waktuKirimTerakhir >= JEDA_KIRIM) {
       waktuKirimTerakhir = millis();
       kirimTelemetry();
     }
   }
   ```

2. **Ubah `ALAMAT_BROKER`** menjadi alamat IP laptopmu dari Praktik 1, misalnya `"192.168.1.10"`. Jangan menulis `localhost` atau `127.0.0.1`: bagi ESP32, kedua alamat itu berarti dirinya sendiri.
3. Pastikan terminal broker masih menjalankan `mosquitto -v -c mosquitto-lan.conf`. Di MQTTX, klik sambungan **Broker laptop** di daftar kiri (kalau namanya belum berwarna hijau, klik **Connect** di kanan atas), lalu tambahkan langganan baru (**New Subscription**) dengan **Topic** `rpm/#`.
4. Klik **Upload**, lalu buka **Serial Monitor** (**115200 baud**). Kalau baris pertama tidak terlihat, tekan tombol **EN**.

**Hasilnya** di Serial Monitor (contoh; alamat, `device_id`, dan angkanya pasti berbeda):

```text
Menyambung ke "RumahKita"..........
Tersambung ke WiFi, IP ESP32 192.168.1.23, device_id a4cf12e5b7c0
Tersambung ke broker 192.168.1.10 dalam 38 ms, sebagai a4cf12e5b7c0
Terbit ke rpm/a4cf12e5b7c0/telemetry: {"ts":"2026-10-18T01:30:32Z","suhu":28.5,"kelembapan":71,"cahaya":2310}
Terbit ke rpm/a4cf12e5b7c0/telemetry: {"ts":"2026-10-18T01:30:42Z","suhu":28.6,"kelembapan":71,"cahaya":2298}
```

Kiriman pertama terjadi sekitar 10 detik setelah ESP32 menyala. Kalau jamnya belum disetel dari internet saat itu, Serial Monitor menulis `Jam belum disetel dari internet: kiriman ditunda (setiap data wajib membawa ts).` dan kirimannya menunggu jadwal berikutnya.

Di MQTTX, pesan yang sama muncul setiap 10 detik dengan topik `rpm/<device_id>/telemetry`. Lirik juga terminal broker (contoh):

```text
1792287025: New connection from 192.168.1.23:57288 on port 1883.
1792287025: New client connected from 192.168.1.23:57288 as a4cf12e5b7c0 (p4, c1, k15).
1792287025: No will message specified.
1792287025: Sending CONNACK to a4cf12e5b7c0 (0, 0)
1792287032: Received PUBLISH from a4cf12e5b7c0 (d0, q0, r0, m0, 'rpm/a4cf12e5b7c0/telemetry', ... (71 bytes))
1792287032: Sending PUBLISH to mqttx_3f9a1c2b (d0, q0, r0, m0, 'rpm/a4cf12e5b7c0/telemetry', ... (71 bytes))
```

Baris `New client connected` memperlihatkan nama klien (`device_id`-mu) dan keterangan sambungannya: `p4` berarti MQTT 3.1.1, `c1` berarti *clean session*, dan `k15` berarti *keep-alive* 15 detik. (Mosquitto 2.0.x di Linux menulis `p2` untuk MQTT 3.1.1.)

5. **Uji bacaan gagal.** Cabut kabel data DHT22 dari kaki D14 ESP32 (MB102 mati, jadi aman), tunggu satu kiriman, lalu pasang lagi. Selama tercabut, kirimannya menjadi:

   ```text
   Terbit ke rpm/a4cf12e5b7c0/telemetry: {"ts":"2026-10-18T01:31:02Z","suhu":null,"kelembapan":null,"cahaya":2304}
   ```

   Itulah keputusan 1 di Konsep 5: bacaan gagal ditulis `null`, bukan `-1`.
6. **Uji broker mati** (di jalur Wokwi, lewati langkah ini: broker publik tidak bisa kamu matikan). Di terminal broker, tekan **Ctrl + C**. ESP32 baru sadar brokernya pergi saat mengirim paket berikutnya, jadi tunggu sekitar 10 detik (paling lama sekitar 30 detik). Serial Monitor lalu menulis:

   ```text
   Gagal ke broker setelah 1001 ms: gagal tersambung ke broker (kode -2). Coba lagi 5 detik lagi.
   ```

   Baris yang sama berulang setiap 5 detik, dan ESP32 tetap berjalan; tidak ada yang tersangkut. Di laptop Windows, angkanya sekitar `1001 ms`: *firewall* Windows sengaja tidak menjawab ketukan di pintu yang tidak dilayani, jadi ESP32 menunggu sampai batas 1 detiknya habis. Di macOS dan Linux, laptop langsung menjawab "tidak ada yang melayani di pintu 1883", jadi angkanya hanya beberapa milidetik, misalnya `4 ms` (Konsep 10). Jalankan lagi broker dengan perintah yang sama (tekan **↑** di terminal untuk memanggil perintah terakhir, lalu **Enter**). Dalam 5 detik, ESP32 tersambung lagi sendiri. MQTTX tidak: sekitar 4 detik setelah broker berhenti, ia mencoba sekali, ditolak (pemberitahuan `Error: connect ECONNREFUSED 127.0.0.1:1883`), lalu berhenti mencoba. Klik sambungan **Broker laptop**, lalu klik **Connect** di kanan atas sampai namanya hijau lagi; langganan `rpm/#`-nya dipasang lagi sendiri.

Serial Monitor menulis `Gagal ke broker` terus-menerus sejak awal, padahal terminal broker menyala tanpa tulisan `Starting in local only mode`? Buka "Tidak bisa tersambung ke broker (`Gagal`, kode `-2`)" di 🚨, lalu periksa alamat IP, *firewall*, dan jaringan.

**Bedah kodenya:**

- **`esp_read_mac()` dan `snprintf()`** membentuk `device_id` dari alamat MAC chip, lalu topik `rpm/<device_id>/telemetry`, persis seperti Node 1 di Modul 10.
- **`cobaSambungkanBroker()`** hanya mencoba **sekali**, paling sering setiap 5 detik, lalu langsung kembali, berhasil atau tidak. Bandingkan dengan `sambungkanBroker()` di Kemenangan Cepat yang berputar terus sampai berhasil (Konsep 10). Nama kliennya adalah `device_id` (keputusan 2 di Konsep 5).
- **Tiga baris pengaman di `setup()`**: `setConnectionTimeout(1000)` dan `setSocketTimeout(1)` membatasi setiap percobaan menyambung sekitar 1 detik, dan `setBufferSize(512)` memperbesar wadah pesan (Konsep 9 dan 10). Ketiganya dipasang sebelum menyambung ke WiFi supaya tetap terpasang kalau WiFi baru tersambung belakangan, setelah `setup()` berhenti lebih awal. Jam internet hanya diminta kalau WiFi tersambung dalam 20 detik pertama, jadi setelah pesan `Belum tersambung setelah 20 detik`, tetap tekan **EN** begitu WiFi-mu beres.
- **`loop()` punya tiga jalan**: WiFi putus → langsung kembali (paket esp32 menyambung ulang sendiri); broker putus → coba sambungkan; tersambung → `mqtt.loop()` lalu periksa jadwal 10 detik.
- **`kirimTelemetry()`** menyusun JSON dengan **ArduinoJson**: `NAN` dari `readTemperature()` otomatis ditulis `null`, sedangkan kelembapan yang gagal kita tulis `nullptr` sendiri. Panjang hasil `serializeJson()` diperiksa sebelum diterbitkan.
- **`mqtt.publish()` menjawab `true`** kalau pesan sudah diserahkan ke sambungan TCP (jalur kirim-terima antara ESP32 dan broker; Konsep 10), bukan kalau broker sudah menerimanya. Ia menjawab `false` kalau sambungan sudah putus.

> ⬆️ **Selesai Praktik 3?** Kembali ke [Konsep 6](#6-qos-surat-biasa-surat-tercatat-dan-kurir-bertanda-tangan) (➡️ di akhir Konsep 7 akan mengantarmu ke Praktik 4 dan 5).

### Praktik 4 — Status *online*/*offline* otomatis (20 menit)

> 🖥️ **Alat:** sama dengan Praktik 3, ditambah **jam atau *stopwatch*** di HP. Bisa juga di Wokwi: menghentikan simulasi sama dengan mencabut kabel, tetapi `offline` dari broker publik bisa baru muncul sekitar 17–27 detik kemudian. Konsep yang dipakai: 7.

1. Simpan `modul11_telemetri` sebagai `modul11_status_online` (**File → Save As…**), ganti seluruh isi tab utama dengan kode ini, lalu **ubah lagi `ALAMAT_BROKER`** menjadi alamat IP laptopmu:

   ```cpp
   // Modul 11 - Praktik 4: status online/offline otomatis (retained + Last Will)
   // Lanjutan Praktik 3. Begitu tersambung, ESP32 menerbitkan "online" ke rpm/<device_id>/status sebagai pesan
   // retained ("papan pengumuman"). Saat menyambung, ESP32 juga menitipkan "surat wasiat" (Last Will) ke broker:
   // kalau ESP32 hilang tanpa pamit, broker sendiri yang menerbitkan "offline" ke topik yang sama (Konsep 7).

   #include <WiFi.h>
   #include <PubSubClient.h>  // library PubSubClient3 versi 3.3.2
   #include <ArduinoJson.h>   // library ArduinoJson versi 7.4.3 (Modul 10)
   #include <DHT.h>           // library DHT dari Modul 6
   #include <time.h>
   #include <esp_mac.h>       // esp_read_mac(): alamat MAC langsung dari chip
   #include "secrets.h"       // berisi WIFI_NAMA dan WIFI_SANDI

   #ifndef MQTT_QOS1  // hanya PubSubClient3 yang punya nama ini
   #error "Yang terpakai PubSubClient lama (2.8). Hapus lewat Library Manager, lalu pasang PubSubClient3 versi 3.3.2."
   #endif

   // GANTI 192.168.1.10 dengan alamat IP laptopmu (cara mencarinya: Modul 10, Praktik 7.1).
   // Selalu tulis alamat IP, bukan nama: mencari nama bisa menahan program beberapa detik.
   const char ALAMAT_BROKER[] = "192.168.1.10";
   const uint16_t PORT_BROKER = 1883;

   const int PIN_DHT = 14;  // DHT22, Modul 6
   const int PIN_LDR = 36;  // VP: LDR (ADC1), Modul 6
   const char ZONA_WAKTU[] = "WIB-7";
   const unsigned long JEDA_KIRIM = 10000;     // telemetry setiap 10 detik (Lampiran A)
   const unsigned long JEDA_COBA_MQTT = 5000;  // gagal menyambung ke broker? coba lagi 5 detik kemudian

   DHT dht(PIN_DHT, DHT22);
   WiFiClient klienJaringan;          // sambungan TCP ke broker
   PubSubClient mqtt(klienJaringan);  // MQTT berjalan di atas sambungan itu
   char idPerangkat[13];              // device_id: 12 digit heksadesimal + tanda akhir teks (Lampiran A)
   char topikTelemetry[40];           // rpm/<device_id>/telemetry
   char topikStatus[40];              // rpm/<device_id>/status
   unsigned long waktuKirimTerakhir = 0;
   unsigned long waktuCobaTerakhir = 0;
   bool sudahPernahCoba = false;

   // Arti angka mqtt.state() (Konsep 10). Angka 1-5 adalah jawaban broker sendiri.
   const char* namaKeadaanMqtt(int kode) {
     switch (kode) {
       case -4: return "broker tidak menjawab tepat waktu";
       case -3: return "sambungan terputus";
       case -2: return "gagal tersambung ke broker";
       case -1: return "belum tersambung";
       case 0: return "tersambung";
       case 4: return "nama pengguna atau kata sandi ditolak";
       case 5: return "tidak diizinkan broker";
       default: return "ditolak broker";
     }
   }

   // Cap waktu ts (Lampiran A), sama dengan Modul 10. Menjawab false kalau jam belum disetel dari internet.
   bool buatTs(char* ts, size_t ukuran) {
     time_t sekarang = time(nullptr);
     struct tm utc;
     gmtime_r(&sekarang, &utc);
     if (utc.tm_year + 1900 < 2025) {
       return false;
     }
     strftime(ts, ukuran, "%Y-%m-%dT%H:%M:%SZ", &utc);
     return true;
   }

   // Satu kali percobaan menyambung, paling sering setiap JEDA_COBA_MQTT. Tidak pernah berputar menunggu.
   void cobaSambungkanBroker() {
     if (sudahPernahCoba && millis() - waktuCobaTerakhir < JEDA_COBA_MQTT) {
       return;
     }
     sudahPernahCoba = true;
     waktuCobaTerakhir = millis();
     unsigned long mulai = millis();
     // Surat wasiat: topik status, QoS 1, retained, isi "offline". Broker menyimpannya selama ESP32 tersambung.
     if (mqtt.connect(idPerangkat, topikStatus, 1, true, "offline")) {
       Serial.printf("Tersambung ke broker %s dalam %lu ms, sebagai %s\n", ALAMAT_BROKER, millis() - mulai, idPerangkat);
       mqtt.publish(topikStatus, "online", true);  // true = retained: tetap terpasang untuk pelanggan yang datang belakangan
       Serial.printf("Terbit ke %s: online (retained)\n", topikStatus);
     } else {
       int kode = mqtt.state();
       Serial.printf("Gagal ke broker setelah %lu ms: %s (kode %d). Coba lagi 5 detik lagi.\n", millis() - mulai,
                     namaKeadaanMqtt(kode), kode);
     }
   }

   void kirimTelemetry() {
     char ts[21];
     if (!buatTs(ts, sizeof(ts))) {
       Serial.println("Jam belum disetel dari internet: kiriman ditunda (setiap data wajib membawa ts).");
       return;
     }
     JsonDocument dokumen;
     dokumen["ts"] = ts;
     dokumen["suhu"] = dht.readTemperature();  // NAN (gagal dibaca) ditulis ArduinoJson sebagai null
     float kelembapan = dht.readHumidity();
     if (isnan(kelembapan)) {
       dokumen["kelembapan"] = nullptr;  // bacaan gagal ditulis null (kontrak data, Konsep 5)
     } else {
       dokumen["kelembapan"] = (int)round(kelembapan);
     }
     dokumen["cahaya"] = 4095 - analogRead(PIN_LDR);  // dibalik seperti Node 1: makin terang, makin besar
     char isi[160];
     size_t panjang = serializeJson(dokumen, isi, sizeof(isi));
     if (panjang >= sizeof(isi)) {
       Serial.println("JSON terlalu panjang untuk wadah isi[]: tidak dikirim.");
       return;
     }
     if (mqtt.publish(topikTelemetry, isi)) {
       Serial.printf("Terbit ke %s: %s\n", topikTelemetry, isi);
     } else {
       Serial.printf("GAGAL terbit ke %s\n", topikTelemetry);
     }
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     dht.begin();
     Serial.println();

     uint8_t mac[6];
     esp_read_mac(mac, ESP_MAC_WIFI_STA);
     snprintf(idPerangkat, sizeof(idPerangkat), "%02x%02x%02x%02x%02x%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
     snprintf(topikTelemetry, sizeof(topikTelemetry), "rpm/%s/telemetry", idPerangkat);
     snprintf(topikStatus, sizeof(topikStatus), "rpm/%s/status", idPerangkat);

     klienJaringan.setConnectionTimeout(1000);  // menyambung TCP paling lama 1 detik (bawaan: 3 detik)
     mqtt.setServer(ALAMAT_BROKER, PORT_BROKER);
     mqtt.setSocketTimeout(1);   // menunggu jawaban broker paling lama 1 detik (bawaan: 15 detik)
     mqtt.setBufferSize(512);    // ruang pesan 512 byte (bawaan: 256), Konsep 9

     Serial.printf("Menyambung ke \"%s\"", WIFI_NAMA);
     WiFi.mode(WIFI_STA);
     WiFi.begin(WIFI_NAMA, WIFI_SANDI);
     unsigned long mulai = millis();
     while (WiFi.status() != WL_CONNECTED && millis() - mulai < 20000) {
       Serial.print(".");
       delay(250);
     }
     Serial.println();
     if (WiFi.status() != WL_CONNECTED) {
       Serial.println("Belum tersambung setelah 20 detik. Periksa tab secrets.h, lalu tekan EN.");
       return;
     }
     Serial.printf("Tersambung ke WiFi, IP ESP32 %s, device_id %s\n", WiFi.localIP().toString().c_str(), idPerangkat);
     configTzTime(ZONA_WAKTU, "pool.ntp.org", "asia.pool.ntp.org");  // jam dari internet (Modul 10)
   }

   void loop() {
     if (WiFi.status() != WL_CONNECTED) {
       return;  // WiFi putus: paket esp32 menyambung ulang sendiri (Modul 10)
     }
     if (!mqtt.connected()) {
       cobaSambungkanBroker();
       return;
     }
     mqtt.loop();  // wajib dipanggil sesering mungkin: menjaga sambungan tetap hidup
     if (millis() - waktuKirimTerakhir >= JEDA_KIRIM) {
       waktuKirimTerakhir = millis();
       kirimTelemetry();
     }
   }
   ```

   Hanya tiga bagian yang berubah dari Praktik 3: variabel `topikStatus`, wasiat di `mqtt.connect()`, dan pengumuman `online` sesaat setelah tersambung.
2. Di terminal kedua VS Code (kalau pelanggan `latihan/#` dari Praktik 2 masih berjalan di sana, hentikan dulu dengan **Ctrl + C**), jadilah pelanggan status **semua** perangkat:

   ```bash
   mosquitto_sub -v -t "rpm/+/status"
   ```

3. Klik **Upload**. Begitu Serial Monitor menulis `Terbit ke rpm/…/status: online (retained)`, terminal pelanggan mencetak:

   ```text
   rpm/a4cf12e5b7c0/status online
   ```

4. **Uji papan pengumuman.** Hentikan pelanggan dengan **Ctrl + C**, lalu jalankan lagi perintah yang sama. Status `online` **langsung** tercetak, padahal Node 1 tidak menerbitkan apa-apa saat itu: broker menyerahkan pesan *retained* yang tersimpan kepada pelanggan baru. Di MQTTX, tambahkan langganan baru `rpm/+/status`: pesan `online` muncul dengan label **Retained**. Karena langganan `rpm/#` dari Praktik 3 juga menangkap topik itu, pesan status berikutnya bisa tampil dua kali; hapus lagi langganan `rpm/+/status` setelah melihat labelnya.
5. **Uji surat wasiat.** Siapkan *stopwatch*, lalu **cabut kabel USB** papan Node 1 dan mulai menghitung. Tunggu tanpa menyentuh apa pun. Dalam **13–23 detik**, terminal pelanggan mencetak:

   ```text
   rpm/a4cf12e5b7c0/status offline
   ```

   Terminal broker mencatat penyebabnya, kira-kira `Client a4cf12e5b7c0 […] disconnected: exceeded timeout.` (Mosquitto 2.0.x: `Client a4cf12e5b7c0 has exceeded timeout, disconnecting.`). Node 1 tidak sempat mengirim apa-apa; broker sendirilah yang menerbitkan wasiatnya setelah 22,5 detik tanpa kabar.
6. Colokkan lagi kabel USB-nya. Beberapa detik kemudian, status kembali `online`.
7. **Bonus:** tekan tombol **EN**. Biasanya `offline` dan `online` tercetak berurutan dalam beberapa detik: Node 1 yang baru menyala menyambung lagi dengan nama yang sama, jadi broker mengusir sambungan lamanya yang tertinggal dan menerbitkan wasiatnya (Konsep 7).

**Bedah langkahnya:**

- **Mengapa wasiatnya QoS 1 dan *retained*?** QoS 1 supaya kabar penting itu tidak hilang di jalan; *retained* supaya dashboard yang baru dibuka setengah jam kemudian tetap tahu Node 1 sedang mati.
- **Mengapa `online` diterbitkan sendiri, bukan oleh broker?** Broker hanya menyimpan satu pesan wasiat, dan pesan itu hanya diterbitkan saat klien hilang. Pesan kebalikannya harus datang dari Node 1 sendiri, setiap kali berhasil menyambung.
- **Mencabut USB ≠ menutup Serial Monitor.** Menutup Serial Monitor tidak mematikan ESP32, jadi statusnya tetap `online`.

**Papan pengumuman latihan.** Supaya terbiasa membuat dan menghapus pesan *retained*, coba di terminal ketiga:

```bash
mosquitto_pub -t "latihan/papan" -m "rapat jam 7 malam" -r
```

Lalu, di terminal kedua, hentikan pelanggan status dengan **Ctrl + C** dan berlangganan `latihan/papan` (`mosquitto_sub -v -t "latihan/papan"`). Kapan pun kamu berlangganan, pesan itu selalu langsung muncul. Untuk menghapusnya, terbitkan pesan kosong (`-n`) dengan tanda *retained* (`-r`):

```bash
mosquitto_pub -t "latihan/papan" -r -n
```

Pelanggan baru kini tidak menerima apa-apa. Di MQTTX, menu **Clear Retained Message** melakukan hal yang sama untuk topik di kotak kirimnya; menu itu terbuka lewat tombol kecil bersegitiga di sebelah kanan tombol **Meta**. Awas: menu itu sekaligus mencentang kotak **Retain** di kotak kirim, dan centangnya tidak hilang sendiri. Hilangkan lagi centang **Retain** sebelum mengirim pesan berikutnya, terutama perintah ke Node 1 (Konsep 7).

### Praktik 5 — QoS 0 vs QoS 1 saat WiFi ESP32 mati (25 menit)

> 🖥️ **Alat:** **VS Code** dengan terminal broker yang menyala, **MQTTX** (sambungan **Broker laptop**), **Arduino IDE** dan **Serial Monitor**, serta papan Node 1 dengan **tombol D13** (MB102 boleh tetap mati). Bisa juga di Wokwi, dengan broker `broker.hivemq.com` (lihat catatan di akhir praktik). Konsep yang dipakai: 6.

Kita uji "surat biasa" dan "surat tercatat" dua kali: pertama dengan dua program di laptop, lalu dengan ESP32 yang WiFi-nya kita matikan dengan sengaja.

#### 5.1 Di laptop: pelanggan yang pergi sebentar

1. Di terminal kedua (hentikan dulu pelanggan yang masih berjalan di sana dengan **Ctrl + C**), jadilah pelanggan dengan **sesi persisten**:

   ```bash
   mosquitto_sub -v -t "latihan/qos" -q 1 -c -i pelanggan-qos
   ```

   Ada tiga tambahan dibandingkan dengan perintah langganan biasa: `-q 1` berlangganan dengan QoS 1, `-c` meminta sesi persisten (*clean session* = `false`), dan `-i pelanggan-qos` memberi nama tetap. Broker hanya menyimpan pesan untuk klien yang namanya tetap.
2. Tekan **Ctrl + C**. Pelanggan "pergi", tetapi broker tetap mengingat sesinya.
3. Di terminal ketiga, terbitkan dua pesan, satu QoS 0 dan satu QoS 1:

   ```bash
   mosquitto_pub -t "latihan/qos" -q 0 -m "surat biasa"
   ```

   ```bash
   mosquitto_pub -t "latihan/qos" -q 1 -m "surat tercatat"
   ```

4. Di terminal kedua, jalankan lagi perintah pelanggan yang sama (tekan **↑**, lalu **Enter**).

**Hasilnya:**

```text
latihan/qos surat tercatat
```

Hanya "surat tercatat" yang disimpan broker selama pelanggannya pergi. "Surat biasa" langsung dibuang karena saat itu tidak ada pelanggan yang tersambung. Hentikan pelanggan dengan **Ctrl + C**.

#### 5.2 Di ESP32: WiFi dimatikan dengan tombol

1. Buka sketsa `modul11_telemetri`, simpan sebagai `modul11_qos` (**File → Save As…**), ganti seluruh isi tab utama dengan kode ini, lalu ubah `ALAMAT_BROKER` menjadi alamat IP laptopmu:

   ```cpp
   // Modul 11 - Praktik 5: QoS 0 vs QoS 1 saat WiFi ESP32 mati
   // ESP32 berlangganan latihan/<device_id>/qos dengan QoS 1 dan sesi persisten (clean session = false).
   // Tekan tombol D13 untuk mematikan WiFi, kirim pesan QoS 0 dan QoS 1 dari MQTTX, lalu tekan D13 lagi.
   // Broker menyimpan pesan QoS 1 untuk ESP32 dan menyerahkannya begitu ESP32 kembali; pesan QoS 0 hilang (Konsep 6).

   #include <WiFi.h>
   #include <PubSubClient.h>  // library PubSubClient3 versi 3.3.2
   #include <esp_mac.h>       // esp_read_mac(): alamat MAC langsung dari chip
   #include "secrets.h"       // berisi WIFI_NAMA dan WIFI_SANDI

   #ifndef MQTT_QOS1  // hanya PubSubClient3 yang punya nama ini
   #error "Yang terpakai PubSubClient lama (2.8). Hapus lewat Library Manager, lalu pasang PubSubClient3 versi 3.3.2."
   #endif

   // GANTI 192.168.1.10 dengan alamat IP laptopmu, sama dengan Praktik 3.
   const char ALAMAT_BROKER[] = "192.168.1.10";
   const uint16_t PORT_BROKER = 1883;

   const int PIN_TOMBOL = 13;                  // tombol D13 di meja kerja (Modul 5), aktif LOW
   const unsigned long JEDA_COBA_MQTT = 5000;  // gagal menyambung ke broker? coba lagi 5 detik kemudian

   WiFiClient klienJaringan;
   PubSubClient mqtt(klienJaringan);
   char idPerangkat[13];  // device_id
   char idKlien[24];      // client ID khusus latihan ini supaya sesi persistennya tidak tercampur dengan sketsa lain
   char topikQos[40];     // latihan/<device_id>/qos
   bool wifiDinyalakan = true;
   bool tombolTadi = HIGH;
   unsigned long waktuTombolBerubah = 0;
   unsigned long waktuCobaTerakhir = 0;
   bool sudahPernahCoba = false;

   void saatPesanMasuk(char* topik, byte* isi, unsigned int panjang) {
     Serial.print("Pesan masuk: ");
     Serial.write(isi, panjang);
     Serial.println();
   }

   void cobaSambungkanBroker() {
     if (sudahPernahCoba && millis() - waktuCobaTerakhir < JEDA_COBA_MQTT) {
       return;
     }
     sudahPernahCoba = true;
     waktuCobaTerakhir = millis();
     // Sesi persisten: client ID selalu sama, dan argumen terakhir (clean session) = false.
     // Tanpa nama pengguna dan kata sandi (nullptr, nullptr), dan tanpa surat wasiat (nullptr, 0, false, nullptr).
     if (mqtt.connect(idKlien, nullptr, nullptr, nullptr, 0, false, nullptr, false)) {
       mqtt.subscribe(topikQos, 1);  // langganan QoS 1: broker menyimpan pesan QoS 1 selama ESP32 pergi
       Serial.printf("Tersambung ke broker (sesi persisten), langganan %s dengan QoS 1\n", topikQos);
     } else {
       Serial.printf("Gagal ke broker (kode %d). Coba lagi 5 detik lagi.\n", mqtt.state());
     }
   }

   // Setiap kali D13 ditekan, WiFi mati atau menyala bergantian.
   void periksaTombol() {
     bool sekarang = digitalRead(PIN_TOMBOL);
     if (sekarang == tombolTadi || millis() - waktuTombolBerubah < 50) {  // 50 ms: abaikan getaran tombol (Modul 5)
       return;
     }
     waktuTombolBerubah = millis();
     tombolTadi = sekarang;
     if (sekarang == HIGH) {
       return;  // hanya saat ditekan
     }
     wifiDinyalakan = !wifiDinyalakan;
     if (wifiDinyalakan) {
       WiFi.begin(WIFI_NAMA, WIFI_SANDI);
       Serial.println("WiFi DINYALAKAN lagi: menyambung ke WiFi, lalu ke broker...");
     } else {
       WiFi.disconnect();
       Serial.println("WiFi DIMATIKAN. Sekarang kirim satu pesan QoS 0 dan satu pesan QoS 1 dari MQTTX.");
     }
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     pinMode(PIN_TOMBOL, INPUT_PULLUP);
     Serial.println();

     uint8_t mac[6];
     esp_read_mac(mac, ESP_MAC_WIFI_STA);
     snprintf(idPerangkat, sizeof(idPerangkat), "%02x%02x%02x%02x%02x%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
     snprintf(idKlien, sizeof(idKlien), "%s-qos", idPerangkat);
     snprintf(topikQos, sizeof(topikQos), "latihan/%s/qos", idPerangkat);

     Serial.printf("Menyambung ke \"%s\"", WIFI_NAMA);
     WiFi.mode(WIFI_STA);
     WiFi.begin(WIFI_NAMA, WIFI_SANDI);
     unsigned long mulai = millis();
     while (WiFi.status() != WL_CONNECTED && millis() - mulai < 20000) {
       Serial.print(".");
       delay(250);
     }
     Serial.println();
     Serial.printf("Topik latihan: %s\n", topikQos);

     klienJaringan.setConnectionTimeout(1000);
     mqtt.setServer(ALAMAT_BROKER, PORT_BROKER);
     mqtt.setSocketTimeout(1);
     mqtt.setCallback(saatPesanMasuk);
   }

   void loop() {
     periksaTombol();
     if (!wifiDinyalakan || WiFi.status() != WL_CONNECTED) {
       return;
     }
     if (!mqtt.connected()) {
       cobaSambungkanBroker();
       return;
     }
     mqtt.loop();
   }
   ```

2. Klik **Upload**, lalu buka **Serial Monitor**. Catat topik latihannya, misalnya `latihan/a4cf12e5b7c0/qos`.
3. **Pemanasan:** di kotak kirim MQTTX, isi **Topic** dengan topik latihan tadi, ubah format menjadi **Plaintext**, ganti seluruh isi kotak pesan dengan `tes saat tersambung`, lalu kirim. Pesan itu langsung tercetak di Serial Monitor.
4. **Tekan tombol D13 sekali.** Serial Monitor menulis `WiFi DIMATIKAN…`. Bagi broker, ESP32 belum pergi: broker baru sadar setelah detak jantung ESP32 hilang selama 22,5 detik.
5. Di MQTTX, kirim dua pesan ke topik yang sama, masing-masing dengan mengganti seluruh isi kotak pesan: `surat biasa` dengan pilihan **QoS 0**, lalu `surat tercatat` dengan pilihan **QoS 1** (pilihan QoS ada di sebelah kotak **Retain**). Biarkan **Retain** tidak tercentang.
6. Tunggu sebentar, lalu **tekan D13 sekali lagi** untuk menyalakan WiFi.

**Hasilnya** di Serial Monitor (contoh):

```text
Menyambung ke "RumahKita"..........
Topik latihan: latihan/a4cf12e5b7c0/qos
Tersambung ke broker (sesi persisten), langganan latihan/a4cf12e5b7c0/qos dengan QoS 1
Pesan masuk: tes saat tersambung
WiFi DIMATIKAN. Sekarang kirim satu pesan QoS 0 dan satu pesan QoS 1 dari MQTTX.
WiFi DINYALAKAN lagi: menyambung ke WiFi, lalu ke broker...
Tersambung ke broker (sesi persisten), langganan latihan/a4cf12e5b7c0/qos dengan QoS 1
Pesan masuk: surat tercatat
```

Hasilnya sama dengan 5.1: hanya "surat tercatat" yang menunggu ESP32 kembali. Kalau pesan QoS 1 dikirim sebelum broker sadar ESP32 pergi, broker sebenarnya sempat mengirimnya ke sambungan yang sudah mati. Karena tanda terimanya tidak pernah datang, broker mengirim ulang pesan itu begitu ESP32 tersambung lagi. Surat biasa tidak punya tanda terima, jadi tidak ada yang mengirim ulang.

**Bedah kodenya:**

- **`mqtt.connect(idKlien, nullptr, nullptr, nullptr, 0, false, nullptr, false)`** adalah versi panjang `connect()`. Argumen terakhir, `false`, berarti *clean session* = `false`: sesi persisten. Empat `nullptr`, angka `0`, dan `false` di tengah berarti tanpa nama pengguna, tanpa kata sandi, dan tanpa wasiat.
- **`idKlien` diberi akhiran `-qos`**, misalnya `a4cf12e5b7c0-qos`. Sesi persisten terikat pada nama klien, jadi sketsa latihan ini sengaja tidak memakai nama Node 1 supaya sesinya tidak tercampur.
- **`mqtt.subscribe(topikQos, 1)`**: angka `1` adalah QoS langganan. Dengan `0`, broker tidak menyimpan apa-apa untuk ESP32.
- **`WiFi.disconnect()`** memutus WiFi dengan sengaja, sedangkan `WiFi.begin()` menyambung lagi. Paket esp32 tidak menyambung ulang sendiri setelah pemutusan yang disengaja (Konsep 4 Modul 10), jadi tombol yang menentukan.
- **Sesinya tertinggal di broker.** Broker terus menyimpan sesi `pelanggan-qos` dan `…-qos` sampai Mosquitto dimatikan. Tidak berbahaya, dan hilang sendiri saat broker di-*restart*.

> 🖥️ **Di Wokwi:** kerjakan 5.1 tetap di broker laptop, tanpa `-h`, karena bagian itu tidak memakai ESP32; di broker publik, nama `pelanggan-qos` dan topik `latihan/qos` bisa bertabrakan dengan milik pembaca lain. Untuk 5.2, ubah `ALAMAT_BROKER` menjadi `"broker.hivemq.com"`, bukan `broker.emqx.io`. Broker EMQX ikut menyimpan pesan QoS 0 untuk klien yang pergi (aturan MQTT membolehkannya) sehingga perbedaannya tidak terlihat. Di MQTTX, buat sambungan baru bernama `HiveMQ publik` dengan **Host** `broker.hivemq.com` dan **Port** `1883`, lalu kirim pesan dari sana. Tombol D13 adalah tombol hijau berlabel **D13** di rangkaian Wokwi; klik sekali untuk mematikan WiFi, sekali lagi untuk menyalakannya. Hasilnya sama: setelah WiFi menyala, hanya pesan QoS 1 yang sampai.

> ⬆️ **Selesai Praktik 4 dan 5?** Kembali ke [Konsep 8](#8-kapan-mengirim-dan-menjawab-setiap-10-detik-segera-saat-penting-dan-perintah--ack) (➡️ di akhir Konsep 8 akan mengantarmu ke Praktik 6 dan 7).

### Praktik 6 — Perintah dari MQTTX, dijawab `ack` (30 menit)

> 🖥️ **Alat:** **Arduino IDE** dan **Serial Monitor**, meja kerja Node 1 dengan **MB102 menyala** (relay mendapat 5 V dari MB102; ingat urutannya: USB dulu, baru MB102), terminal broker yang menyala, dan **MQTTX** dengan sambungan **Broker laptop**. Bisa juga di Wokwi. Konsep yang dipakai: 8.

Inilah latihan untuk syarat lulus di bagian ➕ E: perintah dari MQTTX menggerakkan relay, lalu Node 1 menjawab dengan `ack`.

1. Buka sketsa `modul11_status_online` dari Praktik 4, simpan sebagai `modul11_perintah_ack`, ganti seluruh isi tab utama dengan kode ini, lalu ubah `ALAMAT_BROKER` menjadi alamat IP laptopmu. Yang baru dibandingkan dengan Praktik 4: pin relay D32 dan D33, topik `cmd` dan `ack`, fungsi `aturLampu()` dan `aturKipas()`, pengingat delapan `id` (`sudahDiterima()` dan `ingatId()`), fungsi `kirimAck()` dan `saatPerintahMasuk()`, langganan `cmd` di `cobaSambungkanBroker()`, dan beberapa baris di `setup()`:

   ```cpp
   // Modul 11 - Praktik 6: perintah lewat MQTT, dijawab ack
   // Lanjutan Praktik 4. ESP32 berlangganan rpm/<device_id>/cmd. Perintah {"id":…,"aksi":"set","target":"lampu",
   // "nilai":true} menyalakan relay lampu (D32) atau kipas (D33), lalu ESP32 menjawab di rpm/<device_id>/ack dengan
   // id yang sama (Konsep 8). Perintah yang id-nya sudah pernah diterima diabaikan.

   #include <WiFi.h>
   #include <PubSubClient.h>  // library PubSubClient3 versi 3.3.2
   #include <ArduinoJson.h>   // library ArduinoJson versi 7.4.3 (Modul 10)
   #include <DHT.h>           // library DHT dari Modul 6
   #include <time.h>
   #include <esp_mac.h>       // esp_read_mac(): alamat MAC langsung dari chip
   #include "secrets.h"       // berisi WIFI_NAMA dan WIFI_SANDI

   #ifndef MQTT_QOS1  // hanya PubSubClient3 yang punya nama ini
   #error "Yang terpakai PubSubClient lama (2.8). Hapus lewat Library Manager, lalu pasang PubSubClient3 versi 3.3.2."
   #endif

   // GANTI 192.168.1.10 dengan alamat IP laptopmu (cara mencarinya: Modul 10, Praktik 7.1).
   // Selalu tulis alamat IP, bukan nama: mencari nama bisa menahan program beberapa detik.
   const char ALAMAT_BROKER[] = "192.168.1.10";
   const uint16_t PORT_BROKER = 1883;

   const int PIN_DHT = 14;  // DHT22, Modul 6
   const int PIN_LDR = 36;  // VP: LDR (ADC1), Modul 6
   const int PIN_RELAY_LAMPU = 32;  // relay aktif LOW (Modul 5)
   const int PIN_RELAY_KIPAS = 33;  // relay aktif LOW (Modul 5)
   const char ZONA_WAKTU[] = "WIB-7";
   const unsigned long JEDA_KIRIM = 10000;     // telemetry setiap 10 detik (Lampiran A)
   const unsigned long JEDA_COBA_MQTT = 5000;  // gagal menyambung ke broker? coba lagi 5 detik kemudian

   DHT dht(PIN_DHT, DHT22);
   WiFiClient klienJaringan;          // sambungan TCP ke broker
   PubSubClient mqtt(klienJaringan);  // MQTT berjalan di atas sambungan itu
   char idPerangkat[13];              // device_id: 12 digit heksadesimal + tanda akhir teks (Lampiran A)
   char topikTelemetry[40];           // rpm/<device_id>/telemetry
   char topikStatus[40];              // rpm/<device_id>/status
   char topikCmd[40];                 // rpm/<device_id>/cmd
   char topikAck[40];                 // rpm/<device_id>/ack
   bool lampu = false;
   bool kipas = false;
   char idTerakhir[8][40];            // 8 id perintah terakhir yang sudah diterima (termasuk yang ditolak)
   int posisiId = 0;
   unsigned long waktuKirimTerakhir = 0;
   unsigned long waktuCobaTerakhir = 0;
   bool sudahPernahCoba = false;

   // Arti angka mqtt.state() (Konsep 10). Angka 1-5 adalah jawaban broker sendiri.
   const char* namaKeadaanMqtt(int kode) {
     switch (kode) {
       case -4: return "broker tidak menjawab tepat waktu";
       case -3: return "sambungan terputus";
       case -2: return "gagal tersambung ke broker";
       case -1: return "belum tersambung";
       case 0: return "tersambung";
       case 4: return "nama pengguna atau kata sandi ditolak";
       case 5: return "tidak diizinkan broker";
       default: return "ditolak broker";
     }
   }

   // Cap waktu ts (Lampiran A), sama dengan Modul 10. Menjawab false kalau jam belum disetel dari internet.
   bool buatTs(char* ts, size_t ukuran) {
     time_t sekarang = time(nullptr);
     struct tm utc;
     gmtime_r(&sekarang, &utc);
     if (utc.tm_year + 1900 < 2025) {
       return false;
     }
     strftime(ts, ukuran, "%Y-%m-%dT%H:%M:%SZ", &utc);
     return true;
   }

   // Relay aktif LOW: LOW = menyala, HIGH = padam (Modul 5).
   void aturLampu(bool nyala) {
     lampu = nyala;
     digitalWrite(PIN_RELAY_LAMPU, nyala ? LOW : HIGH);
   }

   void aturKipas(bool nyala) {
     kipas = nyala;
     digitalWrite(PIN_RELAY_KIPAS, nyala ? LOW : HIGH);
   }

   bool sudahDiterima(const char* id) {
     for (int i = 0; i < 8; i++) {
       if (strcmp(idTerakhir[i], id) == 0) {
         return true;
       }
     }
     return false;
   }

   void ingatId(const char* id) {
     snprintf(idTerakhir[posisiId], sizeof(idTerakhir[posisiId]), "%s", id);
     posisiId = (posisiId + 1) % 8;  // yang paling lama ditimpa
   }

   // Jawaban atas perintah: id yang sama, ok, dan keadaan relay sekarang. pesan = alasan kalau ditolak.
   void kirimAck(const char* id, bool ok, const char* pesan) {
     JsonDocument jawaban;
     jawaban["id"] = id;
     char ts[21];
     if (buatTs(ts, sizeof(ts))) {
       jawaban["ts"] = ts;
     } else {
       jawaban["ts"] = nullptr;  // jam belum disetel: tetap dijawab, tanpa cap waktu
     }
     jawaban["ok"] = ok;
     if (!ok) {
       jawaban["pesan"] = pesan;
     }
     JsonObject keadaan = jawaban["state"].to<JsonObject>();
     keadaan["lampu"] = lampu;
     keadaan["kipas"] = kipas;
     char isi[200];
     size_t panjang = serializeJson(jawaban, isi, sizeof(isi));
     if (panjang >= sizeof(isi)) {
       Serial.println("Ack terlalu panjang untuk wadah isi[]: tidak dikirim.");
       return;
     }
     mqtt.publish(topikAck, isi);
     Serial.printf("Terbit ke %s: %s\n", topikAck, isi);
   }

   // Dipanggil library saat ada pesan di rpm/<device_id>/cmd. Urutannya: baca, periksa, kerjakan, jawab.
   void saatPerintahMasuk(char* topik, byte* isi, unsigned int panjang) {
     JsonDocument perintah;
     DeserializationError galat = deserializeJson(perintah, isi, panjang);  // isi tidak diakhiri tanda akhir teks
     if (galat) {
       Serial.printf("Perintah bukan JSON yang sah (%s): diabaikan.\n", galat.c_str());
       return;  // tanpa id, tidak ada yang bisa dijawab
     }
     const char* id = perintah["id"] | "";  // "" kalau id tidak ada atau bukan teks
     if (id[0] == 0) {
       Serial.println("Perintah tanpa id: diabaikan.");
       return;
     }
     if (strlen(id) >= sizeof(idTerakhir[0])) {  // paling panjang 39 huruf: muat di pengingat id dan di ack
       Serial.println("Perintah dengan id lebih dari 39 huruf: diabaikan.");
       return;
     }
     if (sudahDiterima(id)) {
       Serial.printf("Perintah %s sudah pernah diterima: diabaikan.\n", id);
       return;
     }
     ingatId(id);
     const char* aksi = perintah["aksi"] | "";
     const char* target = perintah["target"] | "";
     const char* pesan = nullptr;  // tetap nullptr kalau perintahnya berhasil dikerjakan
     if (strcmp(aksi, "set") != 0) {
       pesan = "aksi tidak dikenal";
     } else if (strcmp(target, "lampu") != 0 && strcmp(target, "kipas") != 0) {
       pesan = "target tidak dikenal";  // sketsa latihan ini hanya mengurus lampu dan kipas
     } else if (!perintah["nilai"].is<bool>()) {
       pesan = "nilai harus true atau false";  // teks "false" bukan false: ditolak, tidak ditebak
     } else if (strcmp(target, "lampu") == 0) {
       aturLampu(perintah["nilai"].as<bool>());
     } else {
       aturKipas(perintah["nilai"].as<bool>());
     }
     Serial.printf("Perintah %s: aksi=%s target=%s -> %s\n", id, aksi, target, pesan ? pesan : "dikerjakan");
     kirimAck(id, pesan == nullptr, pesan);
   }

   // Satu kali percobaan menyambung, paling sering setiap JEDA_COBA_MQTT. Tidak pernah berputar menunggu.
   void cobaSambungkanBroker() {
     if (sudahPernahCoba && millis() - waktuCobaTerakhir < JEDA_COBA_MQTT) {
       return;
     }
     sudahPernahCoba = true;
     waktuCobaTerakhir = millis();
     unsigned long mulai = millis();
     // Surat wasiat: topik status, QoS 1, retained, isi "offline". Broker menyimpannya selama ESP32 tersambung.
     if (mqtt.connect(idPerangkat, topikStatus, 1, true, "offline")) {
       Serial.printf("Tersambung ke broker %s dalam %lu ms, sebagai %s\n", ALAMAT_BROKER, millis() - mulai, idPerangkat);
       mqtt.publish(topikStatus, "online", true);  // true = retained: tetap terpasang untuk pelanggan yang datang belakangan
       Serial.printf("Terbit ke %s: online (retained)\n", topikStatus);
       mqtt.subscribe(topikCmd, 1);  // langganan diulang setiap kali tersambung (clean session)
       Serial.printf("Langganan %s\n", topikCmd);
     } else {
       int kode = mqtt.state();
       Serial.printf("Gagal ke broker setelah %lu ms: %s (kode %d). Coba lagi 5 detik lagi.\n", millis() - mulai,
                     namaKeadaanMqtt(kode), kode);
     }
   }

   void kirimTelemetry() {
     char ts[21];
     if (!buatTs(ts, sizeof(ts))) {
       Serial.println("Jam belum disetel dari internet: kiriman ditunda (setiap data wajib membawa ts).");
       return;
     }
     JsonDocument dokumen;
     dokumen["ts"] = ts;
     dokumen["suhu"] = dht.readTemperature();  // NAN (gagal dibaca) ditulis ArduinoJson sebagai null
     float kelembapan = dht.readHumidity();
     if (isnan(kelembapan)) {
       dokumen["kelembapan"] = nullptr;  // bacaan gagal ditulis null (kontrak data, Konsep 5)
     } else {
       dokumen["kelembapan"] = (int)round(kelembapan);
     }
     dokumen["cahaya"] = 4095 - analogRead(PIN_LDR);  // dibalik seperti Node 1: makin terang, makin besar
     char isi[160];
     size_t panjang = serializeJson(dokumen, isi, sizeof(isi));
     if (panjang >= sizeof(isi)) {
       Serial.println("JSON terlalu panjang untuk wadah isi[]: tidak dikirim.");
       return;
     }
     if (mqtt.publish(topikTelemetry, isi)) {
       Serial.printf("Terbit ke %s: %s\n", topikTelemetry, isi);
     } else {
       Serial.printf("GAGAL terbit ke %s\n", topikTelemetry);
     }
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     dht.begin();
     pinMode(PIN_RELAY_LAMPU, OUTPUT);
     pinMode(PIN_RELAY_KIPAS, OUTPUT);
     aturLampu(false);  // relay segera dimatikan (Modul 5)
     aturKipas(false);
     Serial.println();

     uint8_t mac[6];
     esp_read_mac(mac, ESP_MAC_WIFI_STA);
     snprintf(idPerangkat, sizeof(idPerangkat), "%02x%02x%02x%02x%02x%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
     snprintf(topikTelemetry, sizeof(topikTelemetry), "rpm/%s/telemetry", idPerangkat);
     snprintf(topikStatus, sizeof(topikStatus), "rpm/%s/status", idPerangkat);
     snprintf(topikCmd, sizeof(topikCmd), "rpm/%s/cmd", idPerangkat);
     snprintf(topikAck, sizeof(topikAck), "rpm/%s/ack", idPerangkat);

     klienJaringan.setConnectionTimeout(1000);  // menyambung TCP paling lama 1 detik (bawaan: 3 detik)
     mqtt.setServer(ALAMAT_BROKER, PORT_BROKER);
     mqtt.setSocketTimeout(1);   // menunggu jawaban broker paling lama 1 detik (bawaan: 15 detik)
     mqtt.setBufferSize(512);    // ruang pesan 512 byte (bawaan: 256), Konsep 9
     mqtt.setCallback(saatPerintahMasuk);

     Serial.printf("Menyambung ke \"%s\"", WIFI_NAMA);
     WiFi.mode(WIFI_STA);
     WiFi.begin(WIFI_NAMA, WIFI_SANDI);
     unsigned long mulai = millis();
     while (WiFi.status() != WL_CONNECTED && millis() - mulai < 20000) {
       Serial.print(".");
       delay(250);
     }
     Serial.println();
     if (WiFi.status() != WL_CONNECTED) {
       Serial.println("Belum tersambung setelah 20 detik. Periksa tab secrets.h, lalu tekan EN.");
       return;
     }
     Serial.printf("Tersambung ke WiFi, IP ESP32 %s, device_id %s\n", WiFi.localIP().toString().c_str(), idPerangkat);
     configTzTime(ZONA_WAKTU, "pool.ntp.org", "asia.pool.ntp.org");  // jam dari internet (Modul 10)
   }

   void loop() {
     if (WiFi.status() != WL_CONNECTED) {
       return;  // WiFi putus: paket esp32 menyambung ulang sendiri (Modul 10)
     }
     if (!mqtt.connected()) {
       cobaSambungkanBroker();
       return;
     }
     mqtt.loop();  // wajib dipanggil sesering mungkin: menjaga sambungan tetap hidup
     if (millis() - waktuKirimTerakhir >= JEDA_KIRIM) {
       waktuKirimTerakhir = millis();
       kirimTelemetry();
     }
   }
   ```

2. Pastikan USB papan Node 1 sudah tercolok, lalu **nyalakan MB102**. Klik **Upload**, lalu buka **Serial Monitor**. Tunggu sampai muncul `Langganan rpm/…/cmd`.
3. Di MQTTX, langganan `rpm/#` dari Praktik 3 masih ada, jadi semua pesan Node 1 terlihat, termasuk perintah dan jawabannya.
4. **Kirim perintah pertama.** Di kotak kirim MQTTX:
   - isi **Topic** dengan `rpm/` + `device_id`-mu + `/cmd`, misalnya `rpm/a4cf12e5b7c0/cmd`;
   - pilih **QoS 1** dan **jangan** mencentang **Retain**;
   - hapus **seluruh** isi kotak pesan (MQTTX memuat lagi pesan terakhir yang kamu kirim, misalnya `surat tercatat` dari Praktik 5), tempel perintah di bawah, **baru** pilih format **JSON**, lalu klik tombol kirim. Jangan memilih **JSON** sebelum isinya diganti: selagi isinya bukan JSON, MQTTX menolak dengan pesan error merah dan kembali ke **Plaintext**. Perintahnya:

   ```json
   {"id":"c-001","aksi":"set","target":"lampu","nilai":true}
   ```

   Relay lampu berbunyi "klik" dan LED indikatornya menyala. Hampir bersamaan, MQTTX menampilkan pesan baru di topik `rpm/<device_id>/ack`:

   ```json
   {"id":"c-001","ts":"2026-10-18T01:41:05Z","ok":true,"state":{"lampu":true,"kipas":false}}
   ```

   Kolom `ts` di perintah boleh dilewati saat kamu mengetiknya sendiri; kelak dashboard yang mengisinya otomatis. Yang **wajib** adalah `id`, dan setiap perintah baru harus memakai `id` baru: `c-002`, `c-003`, dan seterusnya.
5. **Kirim perintah yang salah**, satu per satu, masing-masing dengan `id` baru. Perhatikan jawaban `ack`-nya:

   | Perintah | Jawaban |
   | :--- | :--- |
   | `{"id":"c-002","aksi":"set","target":"kipas","nilai":"false"}` | `ok:false`, `"nilai harus true atau false"` (teks `"false"` bukan `false`) |
   | `{"id":"c-003","aksi":"set","target":"pintu","nilai":true}` | `ok:false`, `"target tidak dikenal"` |
   | `{"id":"c-004","aksi":"buka","target":"lampu","nilai":true}` | `ok:false`, `"aksi tidak dikenal"` |
   | `{"id":"c-001","aksi":"set","target":"lampu","nilai":true}` (diulang) | tidak ada jawaban: `id` ini sudah pernah diterima |

6. **Kirim teks yang bukan JSON.** Ubah format menjadi **Plaintext**, hapus **seluruh** isi kotak pesan, ketik `nyalakan lampu`, lalu kirim. Serial Monitor menulis `Perintah bukan JSON yang sah (InvalidInput): diabaikan.` dan tidak ada `ack` karena tidak ada `id` yang bisa dijawab.
7. **Matikan lampunya lagi** dengan `id` baru. Hapus dulu `nyalakan lampu` dari kotak pesan, tempel perintah di bawah, **baru** ubah format kembali ke **JSON**, lalu kirim:

   ```json
   {"id":"c-005","aksi":"set","target":"lampu","nilai":false}
   ```

**Hasilnya** di Serial Monitor (contoh; baris `Terbit ke …/telemetry` yang muncul setiap 10 detik tidak ditampilkan):

```text
Tersambung ke broker 192.168.1.10 dalam 41 ms, sebagai a4cf12e5b7c0
Terbit ke rpm/a4cf12e5b7c0/status: online (retained)
Langganan rpm/a4cf12e5b7c0/cmd
Perintah c-001: aksi=set target=lampu -> dikerjakan
Terbit ke rpm/a4cf12e5b7c0/ack: {"id":"c-001","ts":"2026-10-18T01:41:05Z","ok":true,"state":{"lampu":true,"kipas":false}}
Perintah c-002: aksi=set target=kipas -> nilai harus true atau false
Terbit ke rpm/a4cf12e5b7c0/ack: {"id":"c-002","ts":"2026-10-18T01:41:31Z","ok":false,"pesan":"nilai harus true atau false","state":{"lampu":true,"kipas":false}}
Perintah c-003: aksi=set target=pintu -> target tidak dikenal
Terbit ke rpm/a4cf12e5b7c0/ack: {"id":"c-003","ts":"2026-10-18T01:41:48Z","ok":false,"pesan":"target tidak dikenal","state":{"lampu":true,"kipas":false}}
Perintah c-004: aksi=buka target=lampu -> aksi tidak dikenal
Terbit ke rpm/a4cf12e5b7c0/ack: {"id":"c-004","ts":"2026-10-18T01:42:02Z","ok":false,"pesan":"aksi tidak dikenal","state":{"lampu":true,"kipas":false}}
Perintah c-001 sudah pernah diterima: diabaikan.
Perintah bukan JSON yang sah (InvalidInput): diabaikan.
Perintah c-005: aksi=set target=lampu -> dikerjakan
Terbit ke rpm/a4cf12e5b7c0/ack: {"id":"c-005","ts":"2026-10-18T01:42:40Z","ok":true,"state":{"lampu":false,"kipas":false}}
```

Biarkan MB102 menyala; Praktik 7 masih membutuhkannya untuk PIR.

**Bedah kodenya:**

- **`saatPerintahMasuk()`** dipanggil library dari dalam `mqtt.loop()` setiap ada pesan di `rpm/<device_id>/cmd`, dengan urutan baca → periksa → kerjakan → jawab (Konsep 8). Fungsi ini didaftarkan dengan `mqtt.setCallback(saatPerintahMasuk)` di `setup()`.
- **`perintah["id"] | ""`** mengambil `id` kalau berupa teks, atau teks kosong kalau tidak ada. Bentuk `| nilai-cadangan` ini aman; `as<const char*>()` tanpa cadangan bisa menghasilkan alamat kosong yang membuat ESP32 *restart* saat dibandingkan dengan `strcmp()`.
- **`sudahDiterima()` dan `ingatId()`** menyimpan delapan `id` terakhir dalam larik melingkar: yang kesembilan menimpa yang paling lama. `ingatId()` dipanggil **sebelum** isi perintah diperiksa, jadi perintah yang ditolak pun diingat: kalau `id` yang sama datang lagi, perintah itu diabaikan tanpa `ack` kedua.
- **`strlen(id) >= sizeof(idTerakhir[0])`** membuat perintah ber-`id` lebih dari 39 huruf diabaikan tanpa `ack`, bukan ditolak dengan `ok:false`. Setiap tempat di `idTerakhir` hanya muat 39 huruf ditambah tanda akhir teks, jadi `id` yang lebih panjang tidak bisa diingat utuh dan tidak akan pernah dikenali sebagai ulangan. Karena itu, kontrak data membatasi `id` paling panjang 39 huruf.
- **Urutan pemeriksaannya:** `aksi` dulu, lalu `target`, lalu **jenis** `nilai`. Sketsa latihan ini hanya mengenal `lampu` dan `kipas`; pompa dan tirai menyusul di Node 1 v1.2.
- **`kirimAck()`** menjawab dengan `id` yang sama, `ok`, `pesan` (hanya kalau ditolak), dan `state` berisi keadaan relay **saat ini**, bukan keadaan yang diminta. Pengirim jadi tahu keadaan sebenarnya, termasuk saat perintahnya ditolak.
- **`mqtt.subscribe(topikCmd, 1)` ada di dalam `cobaSambungkanBroker()`**, bukan di `setup()`. Langganan dengan *clean session* hilang setiap kali sambungan putus, jadi harus diulang setiap kali berhasil menyambung.

**Mencoba di Wokwi?** Pakai proyek latihan dari awal 🔧, yang berisi rangkaian Node 1. Patokannya LED berlabel **lampu** (relay D32) dan **kipas** (relay D33) di rangkaian, seperti di Modul 5; abaikan LED kecil di modul relay Wokwi yang menyala terbalik. Karena perintahnya menyeberangi internet dua kali, `ack` di Wokwi butuh sekitar 1–2 detik.

### Praktik 7 — Kirim segera saat ada kejadian (20 menit)

> 🖥️ **Alat:** **Arduino IDE** dan **Serial Monitor**, meja kerja Node 1 dengan **MB102 menyala** (PIR butuh 5 V dari MB102), terminal broker yang menyala, dan **MQTTX** dengan langganan `rpm/#`. Bisa juga di Wokwi: modul PIR punya tombol **Simulate motion**, dan LDR punya penggeser cahaya. Konsep yang dipakai: 8.

1. Buka sketsa `modul11_perintah_ack`, simpan sebagai `modul11_kirim_segera`, ganti seluruh isi tab utama dengan kode ini, lalu ubah `ALAMAT_BROKER` menjadi alamat IP laptopmu. Yang baru dibandingkan dengan Praktik 6 hanya pin PIR, `AMBANG_GELAP`, `JEDA_SEGERA_MIN`, empat variabel pencatat kejadian, kolom `gerak`, fungsi `periksaKejadian()`, satu `pinMode()` di `setup()`, dan isi `loop()`:

   ```cpp
   // Modul 11 - Praktik 7: kirim segera saat ada kejadian penting (report-by-exception)
   // Lanjutan Praktik 6. Telemetry tetap terbit setiap 10 detik, tetapi juga SEGERA saat PIR (D34) mulai atau berhenti
   // melihat gerakan, atau saat tempat berubah dari terang ke gelap dan sebaliknya. Kiriman segera paling sering
   // setiap 2 detik supaya PIR yang berkedip-kedip tidak membanjiri broker (Konsep 8).

   #include <WiFi.h>
   #include <PubSubClient.h>  // library PubSubClient3 versi 3.3.2
   #include <ArduinoJson.h>   // library ArduinoJson versi 7.4.3 (Modul 10)
   #include <DHT.h>           // library DHT dari Modul 6
   #include <time.h>
   #include <esp_mac.h>       // esp_read_mac(): alamat MAC langsung dari chip
   #include "secrets.h"       // berisi WIFI_NAMA dan WIFI_SANDI

   #ifndef MQTT_QOS1  // hanya PubSubClient3 yang punya nama ini
   #error "Yang terpakai PubSubClient lama (2.8). Hapus lewat Library Manager, lalu pasang PubSubClient3 versi 3.3.2."
   #endif

   // GANTI 192.168.1.10 dengan alamat IP laptopmu (cara mencarinya: Modul 10, Praktik 7.1).
   // Selalu tulis alamat IP, bukan nama: mencari nama bisa menahan program beberapa detik.
   const char ALAMAT_BROKER[] = "192.168.1.10";
   const uint16_t PORT_BROKER = 1883;

   const int PIN_DHT = 14;  // DHT22, Modul 6
   const int PIN_LDR = 36;  // VP: LDR (ADC1), Modul 6
   const int PIN_RELAY_LAMPU = 32;  // relay aktif LOW (Modul 5)
   const int PIN_RELAY_KIPAS = 33;  // relay aktif LOW (Modul 5)
   const int PIN_PIR = 34;          // PIR HC-SR501, Modul 6
   const int AMBANG_GELAP = 1000;   // cahaya di bawah ini dianggap gelap (Modul 6)
   const char ZONA_WAKTU[] = "WIB-7";
   const unsigned long JEDA_KIRIM = 10000;     // telemetry setiap 10 detik (Lampiran A)
   const unsigned long JEDA_COBA_MQTT = 5000;  // gagal menyambung ke broker? coba lagi 5 detik kemudian
   const unsigned long JEDA_SEGERA_MIN = 2000; // kiriman segera paling sering setiap 2 detik

   DHT dht(PIN_DHT, DHT22);
   WiFiClient klienJaringan;          // sambungan TCP ke broker
   PubSubClient mqtt(klienJaringan);  // MQTT berjalan di atas sambungan itu
   char idPerangkat[13];              // device_id: 12 digit heksadesimal + tanda akhir teks (Lampiran A)
   char topikTelemetry[40];           // rpm/<device_id>/telemetry
   char topikStatus[40];              // rpm/<device_id>/status
   char topikCmd[40];                 // rpm/<device_id>/cmd
   char topikAck[40];                 // rpm/<device_id>/ack
   bool lampu = false;
   bool kipas = false;
   char idTerakhir[8][40];            // 8 id perintah terakhir yang sudah diterima (termasuk yang ditolak)
   int posisiId = 0;
   bool gerakTadi = false;
   bool gelapTadi = false;
   const char* alasanSegera = nullptr;  // bukan nullptr = ada kejadian penting yang belum dikirim
   unsigned long waktuPeriksaTerakhir = 0;
   unsigned long waktuKirimTerakhir = 0;
   unsigned long waktuCobaTerakhir = 0;
   bool sudahPernahCoba = false;

   // Arti angka mqtt.state() (Konsep 10). Angka 1-5 adalah jawaban broker sendiri.
   const char* namaKeadaanMqtt(int kode) {
     switch (kode) {
       case -4: return "broker tidak menjawab tepat waktu";
       case -3: return "sambungan terputus";
       case -2: return "gagal tersambung ke broker";
       case -1: return "belum tersambung";
       case 0: return "tersambung";
       case 4: return "nama pengguna atau kata sandi ditolak";
       case 5: return "tidak diizinkan broker";
       default: return "ditolak broker";
     }
   }

   // Cap waktu ts (Lampiran A), sama dengan Modul 10. Menjawab false kalau jam belum disetel dari internet.
   bool buatTs(char* ts, size_t ukuran) {
     time_t sekarang = time(nullptr);
     struct tm utc;
     gmtime_r(&sekarang, &utc);
     if (utc.tm_year + 1900 < 2025) {
       return false;
     }
     strftime(ts, ukuran, "%Y-%m-%dT%H:%M:%SZ", &utc);
     return true;
   }

   // Relay aktif LOW: LOW = menyala, HIGH = padam (Modul 5).
   void aturLampu(bool nyala) {
     lampu = nyala;
     digitalWrite(PIN_RELAY_LAMPU, nyala ? LOW : HIGH);
   }

   void aturKipas(bool nyala) {
     kipas = nyala;
     digitalWrite(PIN_RELAY_KIPAS, nyala ? LOW : HIGH);
   }

   bool sudahDiterima(const char* id) {
     for (int i = 0; i < 8; i++) {
       if (strcmp(idTerakhir[i], id) == 0) {
         return true;
       }
     }
     return false;
   }

   void ingatId(const char* id) {
     snprintf(idTerakhir[posisiId], sizeof(idTerakhir[posisiId]), "%s", id);
     posisiId = (posisiId + 1) % 8;  // yang paling lama ditimpa
   }

   // Jawaban atas perintah: id yang sama, ok, dan keadaan relay sekarang. pesan = alasan kalau ditolak.
   void kirimAck(const char* id, bool ok, const char* pesan) {
     JsonDocument jawaban;
     jawaban["id"] = id;
     char ts[21];
     if (buatTs(ts, sizeof(ts))) {
       jawaban["ts"] = ts;
     } else {
       jawaban["ts"] = nullptr;  // jam belum disetel: tetap dijawab, tanpa cap waktu
     }
     jawaban["ok"] = ok;
     if (!ok) {
       jawaban["pesan"] = pesan;
     }
     JsonObject keadaan = jawaban["state"].to<JsonObject>();
     keadaan["lampu"] = lampu;
     keadaan["kipas"] = kipas;
     char isi[200];
     size_t panjang = serializeJson(jawaban, isi, sizeof(isi));
     if (panjang >= sizeof(isi)) {
       Serial.println("Ack terlalu panjang untuk wadah isi[]: tidak dikirim.");
       return;
     }
     mqtt.publish(topikAck, isi);
     Serial.printf("Terbit ke %s: %s\n", topikAck, isi);
   }

   // Dipanggil library saat ada pesan di rpm/<device_id>/cmd. Urutannya: baca, periksa, kerjakan, jawab.
   void saatPerintahMasuk(char* topik, byte* isi, unsigned int panjang) {
     JsonDocument perintah;
     DeserializationError galat = deserializeJson(perintah, isi, panjang);  // isi tidak diakhiri tanda akhir teks
     if (galat) {
       Serial.printf("Perintah bukan JSON yang sah (%s): diabaikan.\n", galat.c_str());
       return;  // tanpa id, tidak ada yang bisa dijawab
     }
     const char* id = perintah["id"] | "";  // "" kalau id tidak ada atau bukan teks
     if (id[0] == 0) {
       Serial.println("Perintah tanpa id: diabaikan.");
       return;
     }
     if (strlen(id) >= sizeof(idTerakhir[0])) {  // paling panjang 39 huruf: muat di pengingat id dan di ack
       Serial.println("Perintah dengan id lebih dari 39 huruf: diabaikan.");
       return;
     }
     if (sudahDiterima(id)) {
       Serial.printf("Perintah %s sudah pernah diterima: diabaikan.\n", id);
       return;
     }
     ingatId(id);
     const char* aksi = perintah["aksi"] | "";
     const char* target = perintah["target"] | "";
     const char* pesan = nullptr;  // tetap nullptr kalau perintahnya berhasil dikerjakan
     if (strcmp(aksi, "set") != 0) {
       pesan = "aksi tidak dikenal";
     } else if (strcmp(target, "lampu") != 0 && strcmp(target, "kipas") != 0) {
       pesan = "target tidak dikenal";  // sketsa latihan ini hanya mengurus lampu dan kipas
     } else if (!perintah["nilai"].is<bool>()) {
       pesan = "nilai harus true atau false";  // teks "false" bukan false: ditolak, tidak ditebak
     } else if (strcmp(target, "lampu") == 0) {
       aturLampu(perintah["nilai"].as<bool>());
     } else {
       aturKipas(perintah["nilai"].as<bool>());
     }
     Serial.printf("Perintah %s: aksi=%s target=%s -> %s\n", id, aksi, target, pesan ? pesan : "dikerjakan");
     kirimAck(id, pesan == nullptr, pesan);
   }

   // Satu kali percobaan menyambung, paling sering setiap JEDA_COBA_MQTT. Tidak pernah berputar menunggu.
   void cobaSambungkanBroker() {
     if (sudahPernahCoba && millis() - waktuCobaTerakhir < JEDA_COBA_MQTT) {
       return;
     }
     sudahPernahCoba = true;
     waktuCobaTerakhir = millis();
     unsigned long mulai = millis();
     // Surat wasiat: topik status, QoS 1, retained, isi "offline". Broker menyimpannya selama ESP32 tersambung.
     if (mqtt.connect(idPerangkat, topikStatus, 1, true, "offline")) {
       Serial.printf("Tersambung ke broker %s dalam %lu ms, sebagai %s\n", ALAMAT_BROKER, millis() - mulai, idPerangkat);
       mqtt.publish(topikStatus, "online", true);  // true = retained: tetap terpasang untuk pelanggan yang datang belakangan
       Serial.printf("Terbit ke %s: online (retained)\n", topikStatus);
       mqtt.subscribe(topikCmd, 1);  // langganan diulang setiap kali tersambung (clean session)
       Serial.printf("Langganan %s\n", topikCmd);
     } else {
       int kode = mqtt.state();
       Serial.printf("Gagal ke broker setelah %lu ms: %s (kode %d). Coba lagi 5 detik lagi.\n", millis() - mulai,
                     namaKeadaanMqtt(kode), kode);
     }
   }

   void kirimTelemetry() {
     char ts[21];
     if (!buatTs(ts, sizeof(ts))) {
       Serial.println("Jam belum disetel dari internet: kiriman ditunda (setiap data wajib membawa ts).");
       return;
     }
     JsonDocument dokumen;
     dokumen["ts"] = ts;
     dokumen["suhu"] = dht.readTemperature();  // NAN (gagal dibaca) ditulis ArduinoJson sebagai null
     float kelembapan = dht.readHumidity();
     if (isnan(kelembapan)) {
       dokumen["kelembapan"] = nullptr;  // bacaan gagal ditulis null (kontrak data, Konsep 5)
     } else {
       dokumen["kelembapan"] = (int)round(kelembapan);
     }
     dokumen["cahaya"] = 4095 - analogRead(PIN_LDR);  // dibalik seperti Node 1: makin terang, makin besar
     dokumen["gerak"] = digitalRead(PIN_PIR) == HIGH;
     char isi[160];
     size_t panjang = serializeJson(dokumen, isi, sizeof(isi));
     if (panjang >= sizeof(isi)) {
       Serial.println("JSON terlalu panjang untuk wadah isi[]: tidak dikirim.");
       return;
     }
     if (mqtt.publish(topikTelemetry, isi)) {
       Serial.printf("Terbit ke %s: %s\n", topikTelemetry, isi);
     } else {
       Serial.printf("GAGAL terbit ke %s\n", topikTelemetry);
     }
   }

   // Setiap 100 ms: apakah gerakan atau gelap-terang berubah sejak pemeriksaan sebelumnya?
   void periksaKejadian() {
     if (millis() - waktuPeriksaTerakhir < 100) {
       return;
     }
     waktuPeriksaTerakhir = millis();
     bool gerak = digitalRead(PIN_PIR) == HIGH;
     bool gelap = (4095 - analogRead(PIN_LDR)) < AMBANG_GELAP;
     if (gerak != gerakTadi) {
       alasanSegera = gerak ? "gerakan terlihat" : "gerakan berhenti";
     }
     if (gelap != gelapTadi) {
       alasanSegera = gelap ? "menjadi gelap" : "menjadi terang";
     }
     gerakTadi = gerak;
     gelapTadi = gelap;
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     dht.begin();
     pinMode(PIN_RELAY_LAMPU, OUTPUT);
     pinMode(PIN_RELAY_KIPAS, OUTPUT);
     pinMode(PIN_PIR, INPUT);
     aturLampu(false);  // relay segera dimatikan (Modul 5)
     aturKipas(false);
     Serial.println();

     uint8_t mac[6];
     esp_read_mac(mac, ESP_MAC_WIFI_STA);
     snprintf(idPerangkat, sizeof(idPerangkat), "%02x%02x%02x%02x%02x%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
     snprintf(topikTelemetry, sizeof(topikTelemetry), "rpm/%s/telemetry", idPerangkat);
     snprintf(topikStatus, sizeof(topikStatus), "rpm/%s/status", idPerangkat);
     snprintf(topikCmd, sizeof(topikCmd), "rpm/%s/cmd", idPerangkat);
     snprintf(topikAck, sizeof(topikAck), "rpm/%s/ack", idPerangkat);

     klienJaringan.setConnectionTimeout(1000);  // menyambung TCP paling lama 1 detik (bawaan: 3 detik)
     mqtt.setServer(ALAMAT_BROKER, PORT_BROKER);
     mqtt.setSocketTimeout(1);   // menunggu jawaban broker paling lama 1 detik (bawaan: 15 detik)
     mqtt.setBufferSize(512);    // ruang pesan 512 byte (bawaan: 256), Konsep 9
     mqtt.setCallback(saatPerintahMasuk);

     Serial.printf("Menyambung ke \"%s\"", WIFI_NAMA);
     WiFi.mode(WIFI_STA);
     WiFi.begin(WIFI_NAMA, WIFI_SANDI);
     unsigned long mulai = millis();
     while (WiFi.status() != WL_CONNECTED && millis() - mulai < 20000) {
       Serial.print(".");
       delay(250);
     }
     Serial.println();
     if (WiFi.status() != WL_CONNECTED) {
       Serial.println("Belum tersambung setelah 20 detik. Periksa tab secrets.h, lalu tekan EN.");
       return;
     }
     Serial.printf("Tersambung ke WiFi, IP ESP32 %s, device_id %s\n", WiFi.localIP().toString().c_str(), idPerangkat);
     configTzTime(ZONA_WAKTU, "pool.ntp.org", "asia.pool.ntp.org");  // jam dari internet (Modul 10)
   }

   void loop() {
     if (WiFi.status() != WL_CONNECTED) {
       return;  // WiFi putus: paket esp32 menyambung ulang sendiri (Modul 10)
     }
     if (!mqtt.connected()) {
       cobaSambungkanBroker();
       return;
     }
     mqtt.loop();  // wajib dipanggil sesering mungkin: menjaga sambungan tetap hidup
     periksaKejadian();
     if (alasanSegera != nullptr && millis() - waktuKirimTerakhir >= JEDA_SEGERA_MIN) {
       Serial.printf("Kirim segera: %s\n", alasanSegera);
       alasanSegera = nullptr;
       waktuKirimTerakhir = millis();  // jadwal 10 detik berikutnya dihitung dari kiriman ini
       kirimTelemetry();
     } else if (millis() - waktuKirimTerakhir >= JEDA_KIRIM) {
       waktuKirimTerakhir = millis();
       kirimTelemetry();
     }
   }
   ```

2. Klik **Upload**, lalu buka **Serial Monitor**. Kalau MB102 baru saja dinyalakan, tunggu sekitar 1 menit sampai PIR selesai "pemanasan" (Modul 6); selama itu PIR bisa melapor gerakan palsu.
3. Diamkan dulu tanganmu. Kiriman tetap terbit setiap 10 detik, kini dengan kolom `gerak`.
4. **Lambaikan tangan di depan PIR.** Serial Monitor langsung menulis `Kirim segera: gerakan terlihat`, dan pesan baru muncul di MQTTX **tanpa** menunggu jadwal 10 detik. Beberapa detik setelah tanganmu diam, sesuai waktu tahan PIR yang kamu atur di Modul 6, muncul `Kirim segera: gerakan berhenti`.
5. **Tutup LDR dengan telapak tangan**, lalu buka lagi. Muncul `Kirim segera: menjadi gelap` dan `Kirim segera: menjadi terang`.
6. **Uji batas 2 detik.** Lambaikan tangan, lalu **segera** tutup LDR. Kejadian kedua tidak langsung terkirim: ia menunggu sampai 2 detik setelah kiriman sebelumnya, lalu terbit dengan bacaan terbaru.

**Hasilnya** di Serial Monitor (contoh; baris `Perintah …` dan `ack` dari Praktik 6 juga masih bisa muncul kalau kamu mengirim perintah):

```text
Terbit ke rpm/a4cf12e5b7c0/telemetry: {"ts":"2026-10-18T01:50:10Z","suhu":28.4,"kelembapan":70,"cahaya":2287,"gerak":false}
Kirim segera: gerakan terlihat
Terbit ke rpm/a4cf12e5b7c0/telemetry: {"ts":"2026-10-18T01:50:14Z","suhu":28.4,"kelembapan":70,"cahaya":2290,"gerak":true}
Kirim segera: menjadi gelap
Terbit ke rpm/a4cf12e5b7c0/telemetry: {"ts":"2026-10-18T01:50:16Z","suhu":28.4,"kelembapan":70,"cahaya":318,"gerak":true}
Kirim segera: menjadi terang
Terbit ke rpm/a4cf12e5b7c0/telemetry: {"ts":"2026-10-18T01:50:19Z","suhu":28.4,"kelembapan":70,"cahaya":2281,"gerak":true}
Kirim segera: gerakan berhenti
Terbit ke rpm/a4cf12e5b7c0/telemetry: {"ts":"2026-10-18T01:50:24Z","suhu":28.4,"kelembapan":70,"cahaya":2285,"gerak":false}
Terbit ke rpm/a4cf12e5b7c0/telemetry: {"ts":"2026-10-18T01:50:34Z","suhu":28.4,"kelembapan":70,"cahaya":2288,"gerak":false}
```

Perhatikan cap waktunya. Kiriman terjadwal ber-`ts` `…01:50:10Z`, kiriman segera `…01:50:14Z`, lalu `menjadi gelap` baru terbit di `…01:50:16Z` karena menunggu jeda 2 detik. Kiriman terjadwal berikutnya (`…01:50:34Z`) jatuh 10 detik setelah kiriman **terakhir**, bukan pada setiap kelipatan 10 detik.

**Bedah kodenya:**

- **`periksaKejadian()`** memeriksa PIR dan LDR setiap 100 ms, lalu membandingkannya dengan pemeriksaan sebelumnya (`gerakTadi`, `gelapTadi`). Hanya **perubahan** yang dicatat, sebagai teks alasan di `alasanSegera`.
- **`alasanSegera`** berfungsi seperti bendera di Modul 8: selama bukan `nullptr`, ada kejadian yang belum terkirim. Kejadian baru yang datang sebelum terkirim cukup menimpa alasannya; isi pesannya toh selalu bacaan terbaru.
- **`JEDA_SEGERA_MIN = 2000`** membatasi kiriman segera paling sering setiap 2 detik.
- **`waktuKirimTerakhir = millis()`** diperbarui oleh kedua jenis kiriman sehingga jadwal 10 detik selalu dihitung dari kiriman terakhir.
- **`AMBANG_GELAP = 1000`** sama dengan batas lampu otomatis Modul 6. Kalau di kamarmu angka `cahaya` saat LDR ditutup masih di atas `1000`, tutup LDR lebih rapat, atau naikkan angka itu sedikit.

**Di Wokwi:** klik modul PIR, lalu klik **Simulate motion** di jendela `PIR Motion Sensor`. PIR Wokwi menahan gerakan selama 5 detik. Untuk gelap-terang, klik LDR, lalu geser penggeser cahayanya ke kiri sampai `cahaya` di bawah `1000`.

> ⬆️ **Selesai Praktik 6 dan 7?** Kembali ke [Konsep 9](#9-ukuran-pesan-wadah-256-byte-yang-membuang-diam-diam) (➡️ di akhir Konsep 10 akan mengantarmu ke Praktik 8 dan 9).

### Praktik 8 — Alat pemeriksa kontrak (20 menit)

> 🖥️ **Alat:** **VS Code** dengan folder `rumah-pintar-mini`, **Node.js 24** dari Modul 4, terminal broker yang menyala, **MQTTX**, dan papan Node 1 yang masih menjalankan sketsa Praktik 7 (biarkan MB102 tetap menyala: di akhir 8.4, relay lampu dipakai lagi). Konsep yang dipakai: 5 dan 8.

Mata manusia mudah melewatkan satu kolom yang hilang atau angka `-1` yang nyasar. Karena itu, kita memasang **satpam kontrak**: program kecil di laptop yang berlangganan `rpm/#`, lalu memeriksa setiap pesan proyek terhadap kontrak data. Alat inilah yang menjadi penilai syarat lulus di bagian ➕ F, dan akan dipakai lagi setiap kali kamu menambah perangkat atau mengubah firmware.

#### 8.1 Pasang library `mqtt` untuk Node.js

1. Di VS Code, buka terminal baru (**Terminal → New Terminal**). Terminal baru selalu dimulai di folder utama `rumah-pintar-mini`; masuk ke folder `alat`:

   ```bash
   cd alat
   ```

2. Pasang library **mqtt**, klien MQTT untuk Node.js:

   ```bash
   npm install mqtt@5.16.1
   ```

   **Hasilnya** (angka detik dan jumlah paket yang meminta donasi boleh berbeda):

   ```text
   added 44 packages, and audited 45 packages in 3s

   5 packages are looking for funding
     run `npm fund` for details

   found 0 vulnerabilities
   ```

   Satu library itu ternyata membawa 43 library pembantu, total sekitar 11 MB di folder `node_modules`. Tenang saja: `.gitignore` dari Modul 4 sudah menyuruh Git mengabaikan folder itu. Yang ikut tersimpan hanya satu baris baru di `package.json`: `"mqtt": "^5.16.1"` di bagian `dependencies`.

#### 8.2 Salin alat pemeriksanya

1. Di panel **Explorer**, klik kanan folder `alat`, pilih **New File…**, lalu beri nama **`pemeriksa-kontrak.js`**.
2. Buka [`proyek-rumah-pintar-mini/alat/pemeriksa-kontrak.js`](../../proyek-rumah-pintar-mini/alat/pemeriksa-kontrak.js) di GitHub, klik ikon **Copy raw file**, tempel ke file barumu, lalu simpan (**Ctrl + S**).

Programnya sekitar 230 baris. Kamu tidak perlu memahami semuanya sekarang; bagian pentingnya dibedah di bawah.

#### 8.3 Jalankan

```bash
node pemeriksa-kontrak.js
```

Ketik perintah itu di terminal dari langkah 8.1, yang sudah berada di folder `alat`. Tanpa tambahan apa pun, alat ini menyambung ke broker di laptop yang sama (`127.0.0.1`) dan memeriksa semua topik `rpm/#`. Kalau brokernya di komputer lain, tulis alamatnya di belakang, misalnya `node pemeriksa-kontrak.js 192.168.1.10`. Di jalur Wokwi, tulis broker publiknya **dan** `device_id`-mu, misalnya `node pemeriksa-kontrak.js broker.emqx.io 240ac45e114b`: alat itu lalu hanya berlangganan `rpm/240ac45e114b/#`, jadi pesan pembaca lain di broker publik tidak ikut diperiksa.

**Hasilnya** (contoh, dengan sketsa Praktik 7 masih berjalan):

```text
Pemeriksa kontrak siap di broker 127.0.0.1:1883 (langganan rpm/#) — tekan Ctrl + C untuk berhenti.
[08.52.10] rpm/a4cf12e5b7c0/status  LULUS  [retained]
[08.52.14] rpm/a4cf12e5b7c0/telemetry  GAGAL
   - kolom "fw" tidak ada
   - kolom "tanah" tidak ada
   - kolom "level_air" tidak ada
```

Setiap pesan yang lewat diberi cap **LULUS** atau **GAGAL**, lengkap dengan alasannya. Status `online` lulus, dan tanda `[retained]` muncul karena pesan itu diserahkan dari papan pengumuman. `telemetry` dari sketsa Praktik 7 **gagal**, dan memang harus gagal: sketsa latihan itu baru memuat lima dari delapan kolom. Node 1 v1.2 di bagian ➕ akan melengkapinya.

#### 8.4 Uji dengan pesan buatan dari MQTTX

Kirim pesan-pesan berikut dari MQTTX (format **JSON**) ke topik `rpm/` + `device_id`-mu + `/telemetry`, lalu perhatikan jawaban pemeriksa. Isi `ts` boleh dibiarkan apa adanya (pemeriksa hanya menolak `ts` yang bentuknya salah, sebelum tahun 2025, atau lebih dari 5 menit di depan jam laptop):

| Isi pesan | Jawaban pemeriksa |
| :--- | :--- |
| `{"ts":"2026-10-18T01:30:12Z","fw":"1.2.0","suhu":28.5,"kelembapan":71,"cahaya":2310,"tanah":37,"gerak":false,"level_air":64}` | **LULUS** |
| sama, tetapi `"kelembapan":-1` | **GAGAL**: `"kelembapan" harus bilangan bulat 0 sampai 100 atau null, isinya -1` |
| sama, tetapi `"gerak":"false"` | **GAGAL**: `"gerak" harus true atau false, isinya "false"` |
| sama, tetapi `"suhu":null,"kelembapan":null,"level_air":null` | **LULUS**: bacaan gagal yang ditulis `null` memang sah |

Coba juga topik yang salah, misalnya `rpm/` + `device_id`-mu + `/Telemetry` (dengan huruf T besar). Pemeriksa menjawab `GAGAL` dengan alasan `topik di luar kontrak data`. Topik yang diawali garis miring, seperti `/rpm/…`, malah sama sekali tidak terlihat karena langganan `rpm/#` tidak menangkapnya (Konsep 4).

**Ukur jawaban perintah.** Biarkan pemeriksa berjalan, pastikan MB102 masih menyala, ubah **Topic** kembali ke `rpm/` + `device_id`-mu + `/cmd`, lalu kirim perintah seperti di Praktik 6 dengan `id` baru, misalnya `{"id":"c-010","aksi":"set","target":"lampu","nilai":true}`. Pemeriksa mencatat kapan perintah itu lewat dan kapan `ack`-nya datang (contoh):

```text
[08.53.40] rpm/a4cf12e5b7c0/cmd  LULUS
[08.53.40] rpm/a4cf12e5b7c0/ack  LULUS  (dijawab 214 ms setelah perintah: di bawah 1 detik)
```

Angka milidetik itu adalah waktu sejak perintah lewat di broker sampai jawabannya kembali ke broker: perintah diantar ke Node 1, dikerjakan, lalu dijawab. Itulah angka yang dipakai syarat lulus "dibalas `ack` < 1 detik". Di jalur Wokwi, perintah dan jawabannya menyeberangi internet, jadi angkanya naik-turun di sekitar 1 detik; itu wajar, dan syarat lulusnya baru dibuktikan dengan papan asli di bagian ➕ E.

Hentikan pemeriksa dengan **Ctrl + C**. Sebelum berhenti, ia mencetak ringkasan (contoh; selama sketsa Praktik 7 masih berjalan, setiap `telemetry`-nya menambah satu GAGAL, jadi angkamu bergantung pada lamanya pemeriksa berjalan):

```text
Ringkasan: 5 pesan LULUS, 17 pesan GAGAL.
```

**Bedah kodenya:**

- **`mqtt.connect()`** menyambung dengan nama acak berawalan `pemeriksa-`, batas waktu 5 detik, dan `reconnectPeriod: 0` supaya tidak mencoba ulang terus-menerus. Kalau broker belum menyala saat alat dijalankan, alat ini langsung pamit dengan pesan `Tidak bisa tersambung ke broker 127.0.0.1:1883 (ECONNREFUSED). Broker sudah menyala?`.
- **`klien.on("error", …)` wajib ada.** Tanpa pendengar ini, program Node.js langsung berhenti dengan tumpukan pesan error yang panjang begitu broker tidak bisa dihubungi.
- **`klien.on("close", …)`** menangani broker yang dimatikan saat pemeriksa sedang berjalan: alat ini mencetak `Sambungan ke broker … putus` dan ringkasannya, lalu berhenti. Penangan `error` melakukan hal yang sama kalau sambungan yang sudah berjalan putus karena galat, misalnya `ECONNRESET`. Tanpa pendengar `close`, alat diam saja, dan kamu bisa mengira Node 1 berhenti mengirim.
- **`process.argv[3]`** adalah `device_id` yang boleh kamu tulis setelah alamat broker. Kalau ada, alat ini hanya berlangganan `rpm/<device_id>/#`; kalau tidak, `rpm/#`.
- **`periksa()`** memecah topik dengan `split("/")`, memastikan bentuknya `rpm/<device_id>/<jenis>`, lalu memanggil pemeriksa yang sesuai jenisnya.
- **`periksaKolom()`** memastikan kolom wajib ada dan tidak ada kolom asing. Angka di dalamnya diperiksa oleh **`periksaBulat()`** dan **`periksaTs()`**, sesuai tabel satuan di `KONTRAK-DATA.md` bagian 4, salinan Lampiran A yang juga memuat rentang `suhu`. Untuk perintah `set`, **`NILAI_SET`** mencocokkan `target` dan `nilai` dengan tabel di `KONTRAK-DATA.md` bagian 7. **`idSah()`** memastikan `id` setiap perintah dan `ack` berupa teks 1 sampai 39 huruf.
- **`perintahTerlihat`** adalah `Map` (daftar pasangan) dari `id` perintah ke jam saat perintah itu terlihat. Saat `ack` dengan `id` yang sama datang, selisih jamnya dicetak.

### Praktik 9 — Diagram *pub/sub* dan `KONTRAK-DATA.md` (20 menit)

> 🖥️ **Alat:** **selembar kertas dan pensil** (atau aplikasi gambar apa pun), **HP** untuk memotret, **VS Code**, dan **GitHub Desktop**. Konsep yang dipakai: 2, 4, dan 5.
>
> ⭐ **Wajib** — latihan untuk syarat lulus di bagian ➕ H: kamu bisa menggambar diagram *pub/sub* proyekmu di kertas.

#### 9.1 Gambar diagram *pub/sub* proyekmu

Gambar dari ingatan dulu, baru cocokkan dengan contoh di bawah. Diagrammu harus memuat:

1. **Broker di tengah**, lengkap dengan alamatnya, misalnya `Mosquitto, laptop 192.168.1.10:1883`.
2. **Semua klien** di sekelilingnya: Node 1, MQTTX, dan `pemeriksa-kontrak.js`. Boleh tambahkan klien masa depan dengan garis putus-putus: Node-RED (Modul 13) dan *backend* (Modul 16). Dashboard Node-RED di Modul 13 sudah terwakili oleh kotak Node-RED. Dashboard buatanmu sendiri (Modul 22) bukan klien broker: ia mengambil data dari *backend*, jadi kalau mau digambar, sambungkan ke *backend*, bukan ke broker.
3. **Panah untuk setiap topik**, dari penerbit ke broker dan dari broker ke pelanggan, dengan nama topiknya. Tulis lengkap untuk satu perangkat, misalnya `rpm/a4cf12e5b7c0/telemetry`.
4. **Tanda khusus**: *retained* dan *Last Will* pada `status`, QoS 1 pada langganan `cmd`, dan *wildcard* yang dipakai MQTTX serta pemeriksa (`rpm/#`).

![Contoh diagram pub/sub Rumah Pintar Mini; garis putus-putus berarti klien yang menyusul di modul berikutnya. Tengah, broker Mosquitto di laptop 192.168.1.10:1883 (Modul 12: pindah ke Raspberry Pi). Kiri, Node 1 "Rumah" (a4cf12e5b7c0) dengan lima panah topik rpm/a4cf12e5b7c0/…: telemetry, status (retained), vitals, dan ack menuju broker, serta cmd (QoS 1) dari broker; di bawahnya wasiat: status = offline. Kanan, MQTTX (langganan rpm/#, terbit cmd) menerima semua rpm/… dan mengirim cmd; pemeriksa-kontrak.js (langganan rpm/#) dengan panah semua rpm/… dari broker. Putus-putus: Node-RED (Modul 13), Backend + database (Modul 16–17), Dashboard (Modul 22, tersambung ke backend, bukan ke broker), dan Node 2 "Kebun" (Modul 14, lewat Node 1 dengan ESP-NOW). Kotak bawah, yang wajib ada di diagrammu: broker di tengah lengkap dengan alamatnya dan semua klien di sekelilingnya; panah untuk setiap topik, dari penerbit ke broker dan dari broker ke pelanggan, dengan nama topiknya; tanda retained dan wasiat pada status, QoS 1 pada langganan cmd, dan wildcard rpm/# pada pelanggan](aset/diagram-pubsub-proyek.png)

Potret diagrammu, simpan sebagai `diagram-pubsub.jpg` di folder `belajar-iot/modul-11`, lalu tulis tiga kalimat di `catatan-modul11.md`: siapa saja penerbit `telemetry`, siapa saja pelanggannya, dan apa yang terjadi pada `status` kalau Node 1 kehabisan listrik.

#### 9.2 Simpan kontrak data di proyekmu

1. Di VS Code dengan folder `rumah-pintar-mini`, klik ruang kosong di **Explorer**, lalu buat file baru **`KONTRAK-DATA.md`** di folder utama proyek (sejajar dengan folder `alat` dan `firmware`).
2. Buka [`proyek-rumah-pintar-mini/KONTRAK-DATA.md`](../../proyek-rumah-pintar-mini/KONTRAK-DATA.md) di GitHub, klik **Copy raw file**, lalu tempel dan simpan. Tautan di dalam file itu yang menuju Lampiran A Silabus dan Modul 11 memakai alamat lengkap repositori kurikulum di GitHub, jadi tetap bisa dibuka dari repositorimu sendiri.
3. Di bagian paling bawah, isi tabel **Perangkatku** dengan `device_id` Node 1-mu dan alamat brokermu.
4. Pastikan folder `edge` berisi `mosquitto-lan.conf` dari Praktik 1. Kalau tadi kamu membuatnya di tempat lain, pindahkan ke sana.

Mulai sekarang, setiap kali kontrak berubah, misalnya kolom baru di Modul 19 atau 28, file inilah yang lebih dulu diperbarui, baru kodenya (Konsep 5). Kontrak lengkapnya tetap ada di [Lampiran A Silabus](../../SILABUS.md#14-lampiran-a--kontrak-data-rumah-pintar-mini); `KONTRAK-DATA.md` adalah salinannya yang selalu dibawa proyekmu.

> ➡️ **Sesudah Praktik 9:** kerjakan [🧩 Tantangan mandiri](#-tantangan-mandiri) (minimal Tingkat 1) dan [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini), tempat Node 1 naik ke v1.2 dan ketiga syarat lulus dibuktikan, lalu tutup dengan [📝 Kuis](#-kuis-5-soal) dan [✅ Checklist kelulusan](#-checklist-kelulusan-modul-11). Bagian 🚨 dan 🔬 di antaranya cukup dibuka saat perlu.

---

## 🚨 Kalau Tidak Jalan?

Minggu ini ada empat sumber bukti: **Serial Monitor** (kode `mqtt.state()` dan lama percobaannya), **terminal broker** (siapa datang, siapa pergi, dan mengapa), **MQTTX** (pesan apa yang benar-benar lewat), dan **alat pemeriksa kontrak**. Mulailah dari tengah: apakah brokernya menyala dan mencatat ESP32 sebagai klien? Klik judul masalah untuk membuka penjelasannya.

> [!IMPORTANT]
> **Sebelum memeriksa atau memindah kabel di meja kerja:** matikan MB102, lalu cabut USB. Setelah selesai, colokkan USB dulu, baru nyalakan MB102. Untuk masalah MQTT, kabel hampir tidak pernah perlu disentuh.

<details>
<summary><b><code>Compilation error</code> — pesan error minggu ini</b></summary>

Di depan setiap pesan ada nama file dan nomor barisnya. Baca **pesan error pertama** dulu: error-error berikutnya sering hanya akibat dari yang pertama.

| Pesan (potongan) | Artinya | Obatnya |
| :--- | :--- | :--- |
| `#error "Yang terpakai PubSubClient lama (2.8). Hapus lewat Library Manager, lalu pasang PubSubClient3 versi 3.3.2."` | Penjaga di awal sketsa mendapati library **PubSubClient** lama yang terpakai, entah karena hanya itu yang terpasang, entah karena keduanya terpasang dan Arduino IDE memilih yang lama. | Di **Library Manager**, cari `PubSubClient`, klik **REMOVE** pada kartu **PubSubClient** (tanpa angka 3) dan jawab **Yes**, lalu pastikan **PubSubClient3** versi **3.3.2** terpasang (Kemenangan Cepat langkah 2). |
| `fatal error: PubSubClient.h: No such file or directory` | Belum ada library MQTT yang terpasang. | Pasang **PubSubClient3** versi **3.3.2**. Nama filenya memang tetap `PubSubClient.h`. |
| `fatal error: ArduinoJson.h: No such file or directory` | Library **ArduinoJson** belum terpasang di laptop ini. | Pasang **ArduinoJson by Benoit Blanchon** versi **7.4.3** (Praktik 6.1 Modul 10). |
| `fatal error: DHT.h: No such file or directory` | Library DHT dari Modul 6 belum terpasang. | Pasang **DHT sensor library by Adafruit** 1.4.7 (Modul 6). |
| `fatal error: secrets.h: No such file or directory` | Sketsa dibuat dari nol, bukan dengan **Save As…** dari sketsa sebelumnya. | Buat tab **`secrets.h`** seperti di Modul 10, atau ulangi dengan **File → Save As…** dari sketsa yang sudah punya tab itu. |
| `Sketch too big` | Papan yang terpilih masih **DOIT ESP32 DEVKIT V1** dengan rak program bawaan. | Pilih **ESP32 Dev Module** dengan **Partition Scheme** **Minimal SPIFFS** dan **Flash Mode** **DIO**, seperti bagian ➕ A Modul 10. |

</details>

<details>
<summary><b><code>mosquitto</code> tidak dikenali terminal</b></summary>

Pesannya bergantung pada terminalmu:

```text
The term 'mosquitto' is not recognized as a name of a cmdlet, function, script file, or executable program.
```

Di Windows PowerShell bawaan (versi 5.1) tulisannya `…as the name of a cmdlet, function, script file, or operable program.`; di macOS `zsh: command not found: mosquitto`. Artinya sama: terminal tidak tahu di folder mana program itu berada.

- **Windows:** ulangi langkah 6–9 Praktik 1.1, terutama **menutup dan membuka lagi VS Code**. VS Code yang sudah terbuka sebelum folder Mosquitto didaftarkan tidak akan pernah melihatnya. Mau mencoba tanpa mendaftarkan folder? Tulis jalur lengkapnya dengan tanda `&` di depan:

  ```powershell
  & "C:\Program Files\Mosquitto\mosquitto.exe" -v -c mosquitto-lan.conf
  ```

  Tanpa `&`, PowerShell menganggap teks berpetik itu sekadar tulisan, lalu menolak sisa perintahnya dengan `Unexpected token '-v'`.
- **macOS:** `brew install mosquitto` belum selesai, atau terminalmu belum mengenal folder Homebrew. Coba `$(brew --prefix)/sbin/mosquitto -v -c mosquitto-lan.conf`.
- **Linux:** paket `mosquitto` (broker) dan `mosquitto-clients` (`mosquitto_pub`/`mosquitto_sub`) adalah dua paket terpisah. Pasang keduanya. Di Debian dan Raspberry Pi OS, program brokernya tinggal di `/usr/sbin`, yang kadang tidak masuk daftar folder program pengguna biasa; coba `/usr/sbin/mosquitto -v -c mosquitto-lan.conf`.

</details>

<details>
<summary><b>Mosquitto langsung berhenti dengan <code>Error: …</code></b></summary>

| Pesan | Artinya | Obatnya |
| :--- | :--- | :--- |
| `Error: Unable to open config file 'mosquitto-lan.conf'.` | Terminal tidak sedang berada di folder `edge`, atau nama filenya berbeda. | Ketik `cd edge` dulu. Di Windows, pastikan file tidak diam-diam bernama `mosquitto-lan.conf.txt`. |
| `Error: Only one usage of each socket address (protocol/network address/port) is normally permitted.` (Windows) atau `Error: Address already in use` (macOS dan Linux) | Pintu 1883 sudah dipakai program lain, hampir pasti broker kedua. | Buka "Dua broker berjalan bersamaan" di bawah. |
| `Error: Unknown configuration variable '…'.` lalu `Error found at …` | Ada salah ketik di `mosquitto-lan.conf`, atau ada baris catatan yang `#`-nya tidak tepat di huruf pertama (misalnya ada spasi atau Tab di depannya). | Samakan isi file dengan Praktik 1.3. Catatan hanya boleh di baris sendiri, dengan `#` sebagai huruf pertamanya. |

</details>

<details>
<summary><b>Dua broker berjalan bersamaan</b></summary>

Gejalanya bisa membingungkan: Mosquitto di terminal gagal menyala dengan pesan pintu terpakai, **atau** malah menyala, tetapi ESP32 dan MQTTX seolah berada di dua dunia berbeda. ESP32 tersambung lewat alamat IP laptop, sedangkan MQTTX yang memakai `127.0.0.1` tidak pernah melihat pesannya. Pemeriksaan Praktik 1.5 menunjukkan dua angka `OwningProcess` yang berbeda.

Penyebabnya hampir selalu **layanan Mosquitto** yang terpasang bersama penginstal (pilihan **Service** di Praktik 1.1 tidak dihilangkan centangnya, atau Mosquitto pernah dipasang sebelumnya). Matikan, dan jangan biarkan menyala sendiri lagi:

- **Windows, cara klik:** klik **Start**, ketik `Services`, lalu buka aplikasi **Services**. Klik dua kali **Mosquitto Broker**. Pada **Startup type**, pilih **Manual**, klik **Stop**, lalu **OK**.
- **Windows, cara terminal:** buka **Terminal (Admin)** atau **Windows PowerShell (Admin)** (klik kanan tombol **Start**), lalu ketik dua perintah ini. Spasi setelah `start=` memang wajib, dan tulislah `sc.exe`, bukan `sc`: di Windows PowerShell, `sc` berarti perintah lain.

  ```powershell
  sc.exe stop mosquitto
  ```

  ```powershell
  sc.exe config mosquitto start= demand
  ```

- **macOS:** `brew services stop mosquitto`.
- **Linux:** `sudo systemctl disable --now mosquitto`.

Setelah itu, jalankan lagi broker di terminal, lalu ulangi pemeriksaan Praktik 1.5 sampai hanya satu angka `OwningProcess` yang muncul.

</details>

<details>
<summary><b>Tidak bisa tersambung ke broker (<code>Gagal</code>, kode <code>-2</code>)</b></summary>

Periksa dulu terminal broker: masih berjalan, dan tidak ada tulisan `Starting in local only mode`? Setelah itu, lihat **berapa lama** percobaannya di Serial Monitor (Konsep 10).

**Gagal dalam beberapa milidetik** (`Gagal ke broker setelah 4 ms`): laptopmu terjangkau, tetapi tidak ada yang melayani di pintu 1883. Di laptop Windows yang *firewall*-nya menyala, ketiga sebab di bawah ini biasanya justru tampak sebagai kegagalan sekitar 1.000 milidetik.

1. Terminal broker sudah tertutup, atau brokernya berhenti. Jalankan lagi (Praktik 1.3).
2. Broker berjalan dalam **mode lokal saja**: kamu menjalankan `mosquitto -v` tanpa `-c mosquitto-lan.conf`. Cari tulisan `Starting in local only mode` di terminal broker.
3. `PORT_BROKER` bukan `1883`.

**Gagal setelah sekitar 1.000 milidetik** (`Gagal ke broker setelah 1001 ms`): tidak ada jawaban sama sekali.

1. **`ALAMAT_BROKER` masih contoh, atau alamat laptop berubah.** Setiap kode praktik yang baru ditempel kembali berisi contoh `"192.168.1.10"`, jadi gantilah lagi setiap kali. Alamat laptop juga bisa berganti setelah laptop tidur atau router menyala ulang. Periksa lagi dengan `ipconfig` di Windows, `ipconfig getifaddr en0` di macOS, atau `hostname -I` di Linux (Praktik 7.1 Modul 10), lalu perbarui `ALAMAT_BROKER`. Supaya tidak terulang, buat pemesanan alamat tetap (*DHCP reservation*) untuk laptop di router, seperti untuk Node 1 di Praktik 9 Modul 10.
2. **ESP32 dan laptop beda jaringan**, misalnya laptop di WiFi 5 GHz yang berbeda nama, di jaringan tamu, atau memakai kabel LAN di router lain. Tiga angka pertama alamat keduanya harus sama.
3. ***Firewall* Windows**: izin mosquitto belum ada, atau WiFi rumahmu masih berprofil **Public network** padahal izinnya hanya untuk **Private** (Praktik 1.4).
4. **VPN** di laptop menyala. Banyak VPN memblokir sambungan dari jaringan rumah. Matikan selama praktik.
5. **Laptop tidur.** Di Windows, broker yang mati atau berjalan dalam mode lokal saja (tanpa `-c mosquitto-lan.conf`) juga tampak seperti ini; periksa terminal broker lebih dulu.
6. **Di Wokwi**, `ALAMAT_BROKER` masih alamat IP laptop. ESP32 simulasi tidak bisa menjangkau laptopmu; tulis `"broker.emqx.io"` (Praktik 5: `"broker.hivemq.com"`). Untuk Node 1 v1.2, ubah `PAKAI_WOKWI` menjadi `true` di `konfigurasi.h` (➕ B); `ALAMAT_BROKER` lalu diabaikan.

**Di Kemenangan Cepat (broker publik):** jaringan kantor, kampus, dan sebagian WiFi umum memblokir pintu 1883 ke internet. Coba dengan *hotspot* HP.

**Kode lain:** `5` (`tidak diizinkan broker`) berarti baris `allow_anonymous true` tidak terbaca; periksa isi `mosquitto-lan.conf`. `-4` (`broker tidak menjawab tepat waktu`) jarang muncul; biasanya laptop sedang sangat sibuk, dan percobaan berikutnya berhasil. Di Wokwi dengan broker publik, jawaban broker kadang lebih lambat daripada 1 detik; kalau `-4` terus berulang di sana, ubah `setSocketTimeout(1)` menjadi `setSocketTimeout(3)` khusus untuk Wokwi.

</details>

<details>
<summary><b>Tersambung, lalu putus terus setiap beberapa detik (kode <code>-3</code>)</b></summary>

Kalau terminal broker mencatat `disconnected: session taken over.` berulang-ulang (Mosquitto 2.0.x: `already connected, closing old connection.`), ada **dua klien dengan nama yang sama** yang saling mengusir (Konsep 5). Penyebab yang biasa:

- **Dua proyek Wokwi** (atau dua orang) memakai `macAddress` yang sama di broker publik sehingga `device_id`-nya kembar. Ganti tiga pasang terakhir `macAddress` dengan angka pilihanmu sendiri.
- **Kolom Client ID di MQTTX** kamu isi dengan `device_id` Node 1. Biarkan MQTTX memakai nama acaknya sendiri (`mqttx_…`).
- **Sketsa yang sama berjalan di dua papan** dengan nama klien yang ditulis tetap di kode, misalnya sketsa dari tutorial lain yang menulis `mqtt.connect("esp32")`. Sketsa minggu ini aman: nama kliennya diambil dari alamat MAC chip, atau dari kode acak di Kemenangan Cepat.

</details>

<details>
<summary><b>MQTTX tidak menampilkan apa-apa</b></summary>

1. **Lihat kolom Host sambungannya.** Sambungan baru di MQTTX selalu dimulai dengan `broker.emqx.io`, broker publik. Untuk broker laptop, isinya harus `127.0.0.1`; di jalur Wokwi, justru harus `broker.emqx.io` (Praktik 5: `broker.hivemq.com`). Buat sambungan baru dengan Host yang benar, atau ubah sambungan lama lewat pilihan **Edit**-nya.
2. **Periksa topik langganannya.** Huruf besar-kecil dibedakan, topik tidak diawali `/`, dan `rpm/+` hanya menangkap satu tingkat. Untuk semua pesan proyek, pakai `rpm/#`; di broker publik (jalur Wokwi), pakai `rpm/` + `device_id`-mu + `/#` supaya pesan pembaca lain tidak ikut tertangkap.
3. **Sambungannya masih hidup?** Nama sambungan yang tersambung berwarna hijau di daftar kiri MQTTX. Kalau tidak hijau, atau muncul pemberitahuan `Reconnecting` lalu `Error: connect ECONNREFUSED …`, brokernya mungkin mati. Jalankan lagi brokernya, lalu klik **Connect** di kanan atas MQTTX: begitu brokernya mati, MQTTX hanya mencoba menyambung lagi satu kali, sekitar 4 detik kemudian, lalu berhenti setelah ditolak.
4. **Ada dua broker?** Buka "Dua broker berjalan bersamaan" di atas.
5. **Serial Monitor menulis `Jam belum disetel dari internet: kiriman ditunda` atau `Belum tersambung setelah 20 detik`?** ESP32 belum menerbitkan apa pun karena WiFi atau jam internetnya belum siap. Buka masalah yang sama di 🚨 Modul 10 ("Titik-titik terus muncul, lalu `Belum tersambung setelah 20 detik`" atau "Jam tidak pernah disetel").

</details>

<details>
<summary><b>Perintah dari MQTTX tidak dijawab <code>ack</code>, atau relay diam saja</b></summary>

Lihat Serial Monitor saat perintah dikirim:

- **Tidak tercetak apa-apa:** perintahnya tidak sampai. Topiknya harus **persis** `rpm/<device_id>/cmd`, dengan `device_id` huruf kecil seperti yang tercetak di Serial Monitor. Pastikan juga baris `Langganan rpm/…/cmd` (sketsa latihan) atau `MQTT tersambung ke broker …` (Node 1 v1.2) sudah muncul, dan kamu mengirim dari sambungan **Broker laptop** (klik namanya di daftar kiri MQTTX). Perintah yang dikirim dari **Broker publik** sisa Kemenangan Cepat tidak pernah sampai ke broker di laptopmu. Di jalur Wokwi justru sebaliknya: kirim dari **Broker publik** karena ESP32 simulasi tersambung ke `broker.emqx.io`.
- **`Perintah … sudah pernah diterima: diabaikan.`**: kamu memakai `id` lama, termasuk `id` perintah yang tadi ditolak. Ganti angkanya setiap mengirim perintah baru.
- **`Perintah dengan id lebih dari 39 huruf: diabaikan.`**: perpendek `id`-nya, misalnya menjadi `c-011`.
- **`Perintah bukan JSON yang sah (…)`** atau **`Perintah tanpa id`**: periksa tanda petik, koma, dan kurung kurawal. Biarkan format MQTTX **JSON**: isi pesannya diwarnai menurut aturan JSON, jadi salah ketik lebih mudah terlihat.
- **Perintahnya sangat panjang**, misalnya berisi banyak kolom tambahan, dan kamu menghapus baris `mqtt.setBufferSize(512)`: pesan yang lebih besar daripada wadah dibuang diam-diam (Konsep 9). Kembalikan baris itu.
- **`ack` datang dengan `ok:true`, tetapi relay tidak berbunyi "klik" dan LED indikatornya mati:** MB102 belum dinyalakan. ESP32 mendapat listrik dari USB, jadi ia tetap menjawab, sedangkan relay butuh 5 V dari MB102. Nyalakan MB102 (USB dulu, baru MB102), lalu kirim lagi perintahnya dengan `id` baru.

</details>

<details>
<summary><b>Lampu menyala lagi sendiri</b></summary>

Dua penyebab yang berbeda:

- **Menyala lagi setiap kali Node 1 *restart* atau dinyalakan:** ada perintah ***retained*** yang tertempel di topik `cmd` karena kotak **Retain** di MQTTX tercentang saat mengirim. Pengingat `id` hanya mencegahnya dikerjakan ulang selama Node 1 menyala; setelah *restart*, ingatannya kosong dan perintah itu dikerjakan lagi (perintah pompa pun begitu). Hapus pengumumannya: di kotak kirim MQTTX, isi **Topic** dengan topik `cmd`-mu, lalu klik tombol kecil bersegitiga di sebelah kanan tombol **Meta**, pilih **Clear Retained Message**, dan jawab konfirmasinya. Setelah itu, hilangkan lagi centang **Retain** yang ikut muncul; kalau tidak, perintah berikutnya tertempel lagi. Cara terminal: `mosquitto_pub -t "rpm/<device_id>/cmd" -r -n`.
- **Menyala saat ada gerakan di tempat gelap** (Node 1 v1.2): itu **lampu otomatis** dari Modul 6, bukan kesalahan. Aturan itu hanya mematikan lampu yang ia nyalakan sendiri, tetapi tetap boleh menyalakan lampu yang barusan kamu matikan dari MQTTX.

</details>

<details>
<summary><b>Status tidak pernah berganti <code>offline</code></b></summary>

- **Sudah menunggu 23 detik?** Broker baru menyerah setelah 22,5 detik tanpa kabar (Konsep 7). Di jalur Wokwi, broker publik kadang baru menerbitkannya sekitar 27 detik setelah simulasi dihentikan.
- **Sketsanya punya wasiat?** Kemenangan Cepat, Praktik 3, dan Praktik 5 tidak menitipkan wasiat; Praktik 4, 6, 7, dan Node 1 v1.2 menitipkannya.
- **Papannya benar-benar mati?** Menutup Serial Monitor tidak mematikan ESP32. Matikan MB102 dulu kalau sedang menyala, lalu cabut kabel USB-nya. Di Wokwi, hentikan simulasinya.
- **Status `offline` tidak hilang setelah praktik selesai**: itu memang benar karena Node 1 sedang mati. Kalau mengganggu, hapus pengumumannya dengan **Clear Retained Message** di topik `status`, lalu hilangkan lagi centang **Retain** yang ikut muncul.

</details>

<details>
<summary><b>Pemeriksa kontrak tidak mau berjalan</b></summary>

| Pesan | Artinya | Obatnya |
| :--- | :--- | :--- |
| `Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'mqtt' imported from …` | Library `mqtt` belum terpasang di folder ini. | Jalankan `npm install mqtt@5.16.1` **di folder `alat`** (Praktik 8.1). |
| `Error: Cannot find module '…pemeriksa-kontrak.js'` | Terminal tidak sedang berada di folder `alat`, misalnya terminal broker (folder `edge`) atau terminal yang dibelah darinya. | Buka terminal baru (**Terminal → New Terminal**), ketik `cd alat`, lalu jalankan lagi pemeriksanya. |
| `Tidak bisa tersambung ke broker 127.0.0.1:1883 (ECONNREFUSED). Broker sudah menyala?` | Tidak ada broker di laptop ini. | Jalankan broker dulu (Praktik 1.3), lalu jalankan lagi pemeriksanya. |
| Pesan yang sama, tetapi berakhiran `(connack timeout)` setelah 5 detik (di macOS dan Linux kadang `(EHOSTUNREACH)`) | Alamat broker yang kamu tulis tidak menjawab sama sekali. | Periksa alamat IP di belakang `node pemeriksa-kontrak.js`. |
| `"ts" lebih dari 5 menit di depan jam laptop` | Jam laptopmu, bukan jam ESP32, kemungkinan besar yang salah. | Nyalakan **Set time automatically** di pengaturan tanggal-jam laptop. |
| `Sambungan ke broker … putus …` | Broker berhenti (atau laptop sempat tidur) saat pemeriksa sedang berjalan. | Jalankan lagi broker (Praktik 1.3), lalu jalankan lagi pemeriksanya dengan **↑** dan **Enter**. |
| `device_id harus 12 digit heksadesimal huruf kecil, …` | `device_id` di belakang alamat broker salah tulis, misalnya masih memakai titik dua atau huruf besar dari `macAddress`. | Salin `device_id` persis seperti yang tercetak di Serial Monitor, misalnya `node pemeriksa-kontrak.js broker.emqx.io 240ac45e114b`. |

</details>

<details>
<summary><b>Node 1 v1.2: masalah khusus</b></summary>

- **`MQTT gagal tersambung ke broker setelah … ms: … (kode -2). Broker di laptop menyala?`**: sama dengan "Tidak bisa tersambung ke broker" di atas. Alamatnya diatur di `ALAMAT_BROKER` di tab `konfigurasi.h`. Selama itu, Node 1 tetap bekerja normal, dan layarnya menulis `WiFi ok, MQTT putus`.
- **Serial Monitor menulis `Mode Wokwi`** padahal di papan asli: `PAKAI_WOKWI` di `konfigurasi.h` masih `true` (lihat masalah yang sama di 🚨 Modul 10).
- **`Perintah … ditolak: pompa ditolak: air tandon kurang`** (atau `… tidak terbaca`): pengaman tandon Modul 6 bekerja. Isi tandon sampai di atas 20 %, atau periksa sensor HC-SR04.
- **Kiriman `telemetry` terasa lebih sering daripada setiap 10 detik:** wajar kalau ada kejadian penting, misalnya PIR yang sering melihat gerakan, atau angka `cahaya` atau `tanah` yang sedang naik-turun melewati ambangnya (contohnya saat senja, ketika `cahaya` berayun di sekitar `1000`). Kiriman segera dibatasi paling sering setiap 2 detik.
- **Pemeriksa menulis `dijawab … ms setelah perintah: LEBIH dari 1 detik`:** di Wokwi, itu wajar (Konsep 8). Di papan asli, pastikan laptop dan Node 1 tersambung ke router yang sama tanpa VPN, lalu ulangi beberapa kali dengan `id` baru. Kalau angkanya tetap di atas 1.000 milidetik, mode hemat daya WiFi ESP32 mungkin menahan perintah yang masuk: tambahkan `WiFi.setSleep(false);` di `siapkanJaringan()` (tab `jaringan.cpp`), tepat setelah `WiFi.mode(WIFI_STA);`, lalu unggah ulang. Node 1 mendapat listrik dari USB, bukan baterai, jadi tambahan arusnya tidak masalah.

</details>

---

## 🔬 Bedah Teknis (opsional)

Bagian ini untuk yang penasaran. Boleh dilewati; tidak ada yang dipakai di kuis atau checklist.

<details>
<summary><b>Isi pesan MQTT apa adanya: 101 byte untuk satu bacaan</b></summary>

Pesan MQTT dikirim sebagai deretan byte yang sangat hemat. Ambil satu kiriman Praktik 3: topik `rpm/a4cf12e5b7c0/telemetry` (26 byte) dan isi JSON 71 byte. Paket `PUBLISH` QoS 0-nya hanya **101 byte**:

| Bagian | Byte | Isinya |
| :--- | :--- | :--- |
| Kepala tetap | `30` | jenis paket `PUBLISH` (angka 3 di separuh atas), tanpa DUP, QoS 0, tanpa *retained* |
| Panjang sisa | `63` | 99 byte lagi setelah ini (`0x63` = 99) |
| Panjang topik | `00 1A` | 26 byte |
| Topik | `72 70 6D 2F …` | `rpm/a4cf12e5b7c0/telemetry` |
| Isi | `7B 22 74 73 …` | `{"ts":"2026-10-18T01:30:32Z",…}` |

Bandingkan dengan surat HTTP Praktik 7 Modul 10: kepala suratnya saja sekitar 200 byte, belum termasuk surat balasan. Paket MQTT lain bahkan lebih kecil: `PINGREQ` (detak jantung) hanya dua byte, `C0 00`, dan jawabannya `PINGRESP` juga dua byte, `D0 00`. Paket `DISCONNECT` (pamit baik-baik) adalah `E0 00`.

Kalau pesan dikirim dengan QoS 1, ada dua byte tambahan setelah topik: **nomor paket** (*packet identifier*). Nomor itulah yang dikembalikan penerima di `PUBACK` supaya pengirim tahu pesan mana yang sudah sampai.

</details>

<details>
<summary><b>MQTT 5 vs MQTT 3.1.1</b></summary>

ESP32 kita berbicara **MQTT 3.1.1** (standar OASIS 2014), sedangkan MQTTX secara bawaan memakai **MQTT 5** (standar OASIS 2019). Keduanya bisa mengobrol lewat broker yang sama karena Mosquitto memahami kedua versi dan menerjemahkan seperlunya. Bedanya terlihat di terminal broker: ESP32 tercatat sebagai `p4` (MQTT 3.1.1) dan MQTTX sebagai `p5` (MQTT 5).

Tambahan MQTT 5 yang paling terasa:

| Fitur | Gunanya |
| :--- | :--- |
| **Kode alasan** (*reason code*) di hampir setiap jawaban | Broker bisa menjelaskan **mengapa** sambungan atau langganan ditolak, bukan sekadar "ditolak". |
| ***User properties*** | Keterangan tambahan berbentuk pasangan nama-nilai, seperti *header* HTTP, tanpa mengubah isi pesan. |
| **Masa berlaku pesan** (*message expiry*) | Pesan yang menunggu terlalu lama di antrean dibuang sendiri. Cocok untuk perintah: "pompa 3 detik" yang sudah basi tidak perlu dikerjakan. |
| **Masa berlaku sesi** (*session expiry*) | Pengganti *clean session*: sesi persisten bisa diatur, misalnya hanya disimpan 1 jam. |
| **Langganan bersama** (`$share/grup/topik`) | Beberapa pelanggan berbagi pekerjaan: setiap pesan hanya diberikan ke salah satunya. Berguna untuk *backend* yang dijalankan beberapa kali. |
| **Pola tanya jawab** (*response topic*, *correlation data*) | Penerbit bisa menyebut topik balasan dan nomor perkara, mirip pola `cmd` → `ack` kita, tetapi resmi. |
| **Jeda wasiat** (*will delay interval*) | Wasiat baru diterbitkan kalau klien tidak kembali dalam sekian detik, jadi WiFi yang putus sebentar tidak memicu `offline`. |

Kontrak data kita sengaja hanya memakai fitur 3.1.1 supaya bisa dipakai library apa pun, termasuk PubSubClient3. Kalau kelak berpindah ke MQTT 5, topik dan JSON-nya tidak perlu berubah.

</details>

<details>
<summary><b>esp-mqtt: klien MQTT bawaan ESP-IDF</b></summary>

Paket esp32 3.3.x sebenarnya sudah membawa klien MQTT buatan Espressif bernama **esp-mqtt** (file `mqtt_client.h`) walaupun tidak ada contohnya di menu **File → Examples**. Dibandingkan dengan PubSubClient3:

| | PubSubClient3 | esp-mqtt |
| :--- | :--- | :--- |
| Cara menulis kode | gaya Arduino (`mqtt.connect()`, `mqtt.loop()`) | gaya C ESP-IDF (struktur konfigurasi dan fungsi peristiwa) |
| QoS 1 dan 2 | QoS 1 tanpa kirim ulang; QoS 2 tidak bisa | benar-benar dikirim ulang sampai ada tanda terima |
| Tahu pesan *retained*? | tidak | ya, ada tandanya di setiap pesan masuk |
| Tempat berjalan | di dalam `loop()` | di "petugas" (*task*) sendiri, terpisah dari `loop()` |
| Pesan besar | dibuang kalau melebihi wadah | dipotong menjadi beberapa bagian yang bisa disambung |
| Versi MQTT di paket esp32 | 3.1.1 | 3.1.1 (dukungan MQTT 5 tidak ikut dikompilasi di paket Arduino) |

Kelebihannya menggoda, tetapi ada harganya. Karena fungsi peristiwanya berjalan di *task* lain, menyentuh relay dari sana butuh kehati-hatian seperti fungsi *interrupt* di Modul 8. Pesan QoS 1 yang menunggu di antreannya juga dibuang sendiri setelah sekitar 30 detik, dan angka itu tidak bisa diubah dari Arduino IDE. Untuk Node 1, kesederhanaan PubSubClient3 lebih berharga. Klien esp-mqtt layak dilirik kalau kelak kamu butuh QoS 1 yang sungguhan dari ESP32, atau MQTT lewat TLS dan WebSocket.

</details>

<details>
<summary><b>MQTT lewat WebSocket: jalan masuk untuk browser</b></summary>

Browser di HP dan laptop **tidak bisa** membuka sambungan TCP biasa ke pintu 1883. Yang bisa dibuka browser hanyalah sambungan **WebSocket**: sambungan dua arah yang dimulai seperti permintaan HTTP biasa. Karena itu, MQTT punya "jalur kedua", yaitu MQTT yang dibungkus WebSocket, dengan alamat berawalan `ws://` (atau `wss://` yang terenkripsi).

Di Mosquitto, jalur itu cukup dibuka dengan dua baris tambahan di file konfigurasi, misalnya:

```text
listener 9001
protocol websockets
```

Broker publik pun menyediakannya, misalnya `broker.emqx.io` di pintu 8083 (jalur `/mqtt`). MQTTX bisa memakai jalur ini lewat pilihan `ws://` di kolom **Host**. PubSubClient3 di ESP32 tidak bisa, dan memang tidak perlu: ESP32 tetap memakai pintu 1883. Jalur WebSocket baru penting saat dashboard di browser ingin membaca data langsung dari broker. Di kurikulum ini, dashboard Modul 22 mengambil data lewat *backend*, jadi jalur ini cukup diketahui saja.

</details>

<details>
<summary><b>Mengapa <i>keep-alive</i> 15 detik, bukan 60 detik seperti di banyak tutorial</b></summary>

Banyak tutorial memanjangkan *keep-alive* menjadi 60 detik atau lebih supaya "lebih hemat". Untuk Node 1, itu berbahaya, dan alasannya ada di dalam ESP32:

1. **WiFi putus = sambungan MQTT ikut putus seketika.** Begitu WiFi putus, paket esp32 mengosongkan alamat IP ESP32, dan semua sambungan TCP-nya langsung dibatalkan. Di sisi ini, `mqtt.connected()` segera menjawab `false`, dan Node 1 mulai mencoba lagi.
2. **Broker yang hilang tanpa jejak tidak terdeteksi seketika.** Kalau yang hilang justru laptopnya, misalnya tertidur atau kabel dayanya tercabut, ESP32 tidak mendapat tanda apa pun. Ia tetap merasa tersambung dan terus menerbitkan `telemetry` setiap 10 detik ke sambungan yang sebenarnya sudah mati.
3. **Pesan-pesan itu menumpuk di antrean kirim ESP32.** Antrean itu punya batas, sekitar 2,9 KB atau delapan potongan data. Begitu penuh, satu kiriman berikutnya bisa menunggu sampai sekitar 10 detik, dan *watchdog* 5 detik Node 1 pun me-*restart* papan.
4. ***Keep-alive* 15 detik menyelamatkan.** Tanpa jawaban `PINGRESP`, PubSubClient3 menyadari broker hilang dalam 15–30 detik, saat baru tiga sampai enam pesan menumpuk, jauh sebelum antrean penuh.

Dengan *keep-alive* 60 detik, antrean bisa penuh lebih dulu. Hal yang sama terjadi kalau kiriman segera tidak dibatasi 2 detik, atau kalau setiap kiriman dipaksa berangkat sendiri-sendiri. Urutan sebab-akibat ini dirunut dari kode sumber paket esp32 dan lwIP (tumpukan jaringan di dalam ESP32); di meja kerja, peristiwanya jarang dan sulit dipancing dengan sengaja. Pengaman yang kita pasang membuatnya tidak perlu dikhawatirkan.

</details>

---

## 🧩 Tantangan mandiri

Tiga tingkat, dari yang paling ringan. Kerjakan minimal Tingkat 1.

> 🖥️ **Alat:** **Arduino IDE**, meja kerja Node 1 (MB102 menyala untuk relay), terminal broker yang menyala, **MQTTX**, dan **VS Code** dengan folder `rumah-pintar-mini` untuk Tingkat 2. Mulailah dari sketsa praktik yang disebut, lalu **segera** pilih **File → Save As…** dan simpan di folder `modul-11` dengan nama baru, misalnya `modul11_tantangan1`. Sketsa praktikmu tetap utuh, dan tab `secrets.h` ikut tersalin.

**Tingkat 1 — Ubah sedikit: buktikan wadah 256 byte.** Mulai dari `modul11_perintah_ack` (Praktik 6). Matikan baris `mqtt.setBufferSize(512);` dengan menambahkan `//` di depannya, lalu unggah. Dari MQTTX, kirim perintah yang sah tetapi panjang, dengan satu kolom tambahan berisi kalimat panjang, misalnya `{"id":"c-201","aksi":"set","target":"lampu","nilai":true,"catatan":"…"}` dengan `catatan` sekitar 200 huruf. Apa yang terjadi di Serial Monitor dan di topik `ack`? Lalu hapus `//` tadi, unggah lagi, dan kirim perintah yang sama dengan `id` baru. Tulis di `catatan-modul11.md`: berapa panjang perintah terpanjang yang masih dijawab dengan wadah 256 byte? Petunjuk: hitung paketnya dengan rumus di Konsep 9.

**Tingkat 2 — Gabungkan: otomasi di laptop.** Gabungkan Modul 4 dan Praktik 8: buat program Node.js baru `otomasi-lampu.js` di folder `alat`. Program ini berlangganan `rpm/+/telemetry` (di broker publik jalur Wokwi: `rpm/` + `device_id`-mu + `/telemetry`, supaya programmu tidak memerintah perangkat pembaca lain), dan setiap kali ada gerakan **dan** tempat sedang gelap (`gerak` bernilai `true` dan `cahaya` di bawah `1000`), ia menerbitkan perintah `set lampu true` ke topik `cmd` perangkat yang sama, lalu mencetak `ack` yang datang. Petunjuk: tiru bagian `mqtt.connect()`, `subscribe()`, dan `on("message", …)` dari `pemeriksa-kontrak.js`; ambil `device_id` dari topik dengan `topik.split("/")[1]`; buat `id` unik dengan `"oto-" + Date.now()`; dan jangan mengirim perintah yang sama berulang-ulang selama lampunya sudah menyala (lihat `state` di `ack`). Uji programmu dengan sketsa Praktik 7, bukan dengan Node 1 v1.2: Node 1 v1.2 sudah punya lampu otomatis sendiri, dan perintah `set` dari laptop membuat lampunya dianggap dinyalakan manual sehingga lampu tidak padam sendiri saat sepi. Inilah cikal bakal otomasi di Node-RED (Modul 13) dan *backend* (Modul 16).

**Tingkat 3 — Rancang sendiri: perintah `config`.** Kontrak data menyebut `aksi` kedua, `config`, untuk mengubah ambang tanpa mengunggah ulang firmware, misalnya `{"id":"c-301","aksi":"config","ambang":{"tanah_siram":35}}`. Mulai dari `modul11_perintah_ack`, tambahkan dukungan `config` untuk satu ambang saja, `tanah_siram`:

- Tolak dengan `ok:false` dan alasan yang jelas kalau `ambang` bukan objek, atau `tanah_siram` bukan bilangan bulat 10–90.
- Simpan ambang yang sah ke NVS dengan **Preferences** (Modul 8) supaya tetap ada setelah *restart*, lalu cetak di Serial Monitor saat menyala.
- Masukkan ambangnya ke `state` di `ack`, misalnya `"tanah_siram":35`.

Lalu pikirkan dan tulis jawabanmu di `catatan-modul11.md`: Lampiran A meminta `config` dikirim ***retained***. Apa untungnya bagi perangkat yang baru menyala? Satu lagi: mengapa pengingat `id` tetap aman untuk perintah `config` yang datang lagi setelah setiap sambungan ulang? Modul 19 akan membahas jawabannya.

---

## ➕ Tambahan ke "Rumah Pintar Mini"

Sumbangan Modul 11 ke proyek benang merah: **Node 1 v1.2**. Seluruh komunikasinya pindah ke MQTT, mengikuti kontrak data:

- **`telemetry` setiap 10 detik** dan **segera** saat ada kejadian penting, lengkap delapan kolom, dengan bacaan gagal ditulis `null` (Praktik 3 dan 7);
- **status `online`/`offline` otomatis** lewat pesan *retained* dan *Last Will* (Praktik 4);
- **`vitals`** berisi kekuatan sinyal, lama menyala, dan sisa memori: sekali setelah tersambung, lalu setiap 5 menit;
- **perintah** untuk lampu, kipas, pompa (1–10 detik, tetap dijaga pengaman tandon Modul 6), dan tirai (0–180 derajat), selalu dijawab **`ack`** (Praktik 6);
- **tidak pernah macet** saat broker mati, dan layar menulis `WiFi ok, MQTT ok` atau `WiFi ok, MQTT putus` (Konsep 10).

Server web dengan tautan `/on` dan `/off`, alamat `node1.local`, dan kiriman HTTP ke `penerima-webhook.js` **dipensiunkan**. WiFi lewat portal, jam internet, dan penjaga sambung ulang dari Modul 10 tetap dipakai apa adanya.

Node 1 tetap terdiri atas **26 file**. Isi yang benar-benar baru hanya ada di satu file, `jaringan.cpp`; lima file lain hanya berubah sedikit, dan dua puluh file sisanya tidak berubah sama sekali. Supaya praktis, tiga file yang hanya berubah keterangannya diganti utuh bersama `jaringan.cpp` (langkah C).

> 🖥️ **Alat yang dipakai:** **Arduino IDE** (dengan library **PubSubClient3** dari Kemenangan Cepat, serta **WiFiManager** dan **ArduinoJson** dari Modul 10), **VS Code** dengan terminal broker dan alat pemeriksa, **MQTTX**, **GitHub Desktop**, meja kerja lengkap dengan MB102 dan *charger* Node 1, serta diagram dari Praktik 9. Di Wokwi, buka proyek Wokwi Node 1 milikmu dari ➕ Modul 8–10 yang berisi semua file Node 1, bukan proyek latihan Praktik 3–7 yang hanya berisi satu sketsa. Di proyek itu, salin isi [`diagram.json`](kode/node-1-rumah/diagram.json) dan [`libraries.txt`](kode/node-1-rumah/libraries.txt) dari folder `kode/` modul ini, ganti `macAddress`-nya seperti di awal 🔧, lalu ubah `PAKAI_WOKWI` menjadi `true` (langkah B). Dengan begitu, Node 1 menyambung ke `Wokwi-GUEST` dan broker publik `broker.emqx.io`, sedangkan `ALAMAT_BROKER` diabaikan. Belum punya proyek itu? Buat semua file lainnya lewat **▾ → New file...** dan isi dari folder [`kode/node-1-rumah/`](kode/node-1-rumah/), seperti ➕ Modul 8.
>
> ⭐ **Wajib** — bagian dari syarat lulus: perintah dari MQTTX menyalakan relay dan dibalas `ack` dalam waktu kurang dari 1 detik (langkah E), `telemetry` Node 1 lolos alat pemeriksa kontrak (langkah F), dan diagram *pub/sub* proyekmu tergambar di kertas (langkah H).

![Peta 26 file Node 1 v1.2: satu file ditulis ulang, lima berubah sedikit, sisanya tetap; TULIS ULANG berarti isi baru, UBAH berarti sedikit berubah, KETERANGAN (disingkat KET.) berarti hanya komentar, dan file tanpa tanda tidak berubah. Atas, konfigurasi.h bertanda UBAH: versi 1.2.0 dan bagian "Modul 11: MQTT". Tengah, node-1-rumah.ino bertanda KETERANGAN: versi, daftar library, catatan "Modul 10-11". Kiri, indra dan tangan: sensor.h/.cpp (lima sensor) dan aktuator.h/.cpp (relay, pompa, servo, buzzer); antarmuka: tombol.h/.cpp (tekan pendek dan lama), detak.h/.cpp (LED status), layar.h/.cpp bertanda KET. (hanya .cpp: baris WiFi "WiFi ok, MQTT ok"), dan perintah.h/.cpp bertanda KET. (hanya .cpp: catatan "kirim"). Kanan, otak dan catatan: aturan.h/.cpp (siram dan lampu otomatis) dan kartu.h/.cpp (CSV microSD, opsional); daya tahan: pengaturan.h/.cpp (NVS: ambang, jumlah nyala), sistem.h/.cpp (uptime, alasan restart), dan pencatat.h/.cpp (log DEBUG/INFO/ERROR), semuanya tanpa tanda. Bawah, jaringan.cpp bertanda TULIS ULANG (ditambah keterangan di jaringan.h): tetap dari Modul 10, WiFi, portal, penjaga sambung ulang, dan jam internet; baru, sambungan MQTT, wasiat offline, dan online retained (P3–P4); baru, telemetry 10 detik dan segera saat penting (P3, P7), vitals 5 menit; baru, cmd ke ack untuk lampu, kipas, pompa, dan tirai (P6); pensiun, kiriman HTTP, server web /on /off, dan node1.local. Garis putus-putus berarti #include; PETA-PIN.md tidak berubah karena MQTT tidak memakai pin](aset/peta-file-node1-v12.png)

| File | Yang berubah | Caranya |
| :--- | :--- | :--- |
| `jaringan.cpp` | **ditulis ulang**: HTTP dan server web diganti MQTT (sambungan, status, `telemetry`, `vitals`, perintah dan `ack`) | ganti seluruh isinya (langkah C) |
| `jaringan.h` | hanya keterangan | ganti seluruh isinya (langkah C) |
| `konfigurasi.h` | versi `1.2.0`, bagian "Modul 10: jaringan" diringkas, dan bagian baru "Modul 11: MQTT" | ubah dua bagian; angka kalibrasimu tetap (langkah B) |
| `node-1-rumah.ino` | hanya keterangan: versi, daftar library, dan catatan "Modul 10-11" | ganti seluruh isinya (langkah C) |
| `perintah.cpp` | hanya keterangan perintah `kirim` | ganti seluruh isinya (langkah C) |
| `layar.cpp` | hanya keterangan baris WiFi | satu baris, boleh dilewati (langkah C) |

`PETA-PIN.md` tidak berubah: MQTT tidak memakai pin.

### A. Siapkan broker, pemeriksa, dan papan

1. **Laptop:** jalankan broker (Praktik 1.3). Lalu buka terminal baru (**Terminal → New Terminal**), ketik `cd alat`, dan jalankan pemeriksa dengan `node pemeriksa-kontrak.js` (Praktik 8.3). Di MQTTX, buka sambungan **Broker laptop** dengan langganan `rpm/#`. Selama papanmu masih menjalankan sketsa latihan, pemeriksa mencatat **GAGAL** untuk `telemetry`-nya; itu wajar sampai Node 1 v1.2 diunggah di langkah D. **Di Wokwi**, jalankan pemeriksa dengan broker publik dan `device_id`-mu, misalnya `node pemeriksa-kontrak.js broker.emqx.io 240ac45e114b`, lalu pakai sambungan MQTTX **Broker publik** dengan langganan `rpm/` + `device_id`-mu + `/#`.
2. **Papan Node 1:** kalau masih hidup dari *charger*-nya, pindahkan ke laptop dengan urutan aturan emas: **matikan MB102**, cabut USB dari *charger*, colokkan ke laptop, lalu nyalakan MB102.
3. **Buka Node 1-mu:** **File → Open…** → **Documents → GitHub → rumah-pintar-mini → firmware → node-1-rumah** → `node-1-rumah.ino`. Pastikan papan yang terpilih **ESP32 Dev Module**, dengan **Partition Scheme** **Minimal SPIFFS** dan **Flash Mode** **DIO** (bagian ➕ A Modul 10).

### B. Ubah `konfigurasi.h`

1. **Versi firmware.** Di tab **`konfigurasi.h`**, ubah `"1.1.0"` di baris `VERSI_FIRMWARE` menjadi `"1.2.0"`.
2. **Bagian jaringan.** Gulir ke paling bawah. Blok semua baris mulai dari `// ---------- Modul 10: jaringan ----------` sampai akhir file, lalu ganti dengan bagian ini:

   ```cpp
   // ---------- Modul 10: jaringan ----------
   const bool PAKAI_WOKWI = false;            // true HANYA di Wokwi: Wokwi-GUEST tanpa portal, broker publik
   const char NAMA_PERANGKAT[] = "node1";     // nama di daftar perangkat router
   const char NAMA_PORTAL[] = "Node1-Rumah";  // nama WiFi sementara selama portal terbuka
   const unsigned long BATAS_PORTAL = 180;    // detik: portal menutup sendiri kalau tidak dipakai
   const char ZONA_WAKTU[] = "WIB-7";         // WITA: "WITA-8", WIT: "WIT-9" (Modul 10, Praktik 5)

   // ---------- Modul 11: MQTT ----------
   const char ALAMAT_BROKER[] = "192.168.1.10";  // GANTI dengan alamat IP laptopmu (broker Mosquitto, Praktik 1)
   const uint16_t PORT_BROKER = 1883;
   const unsigned long JEDA_KIRIM = 10000;       // telemetry setiap 10 detik, ditambah segera saat ada kejadian penting
   const unsigned long JEDA_VITALS = 300000;     // vitals (kesehatan Node 1) setiap 5 menit
   ```

   Dua baris lama sengaja hilang dari bagian Modul 10: `ALAMAT_SERVER` (kiriman HTTP sudah pensiun) dan `JEDA_KIRIM`, yang pindah ke bagian Modul 11 dengan angka baru, 10 detik.
3. **Ganti `192.168.1.10`** di baris `ALAMAT_BROKER` dengan alamat IP laptopmu, yaitu laptop tempat Mosquitto berjalan. Tulis alamat IP saja, tanpa `mqtt://` dan tanpa nomor port.
4. Tinggal di wilayah WITA atau WIT? Ubah lagi `ZONA_WAKTU` seperti di Modul 10. **Di Wokwi**, ubah `PAKAI_WOKWI` menjadi `true`; di papan asli, biarkan `false`.

Angka kalibrasi Modul 6 dan aturan-aturanmu di bagian atas `konfigurasi.h` tidak disentuh.

### C. Ganti empat file dan ubah `layar.cpp`

1. **`jaringan.cpp`, `jaringan.h`, `node-1-rumah.ino`, dan `perintah.cpp`**: keempat file ini tidak berisi rancanganmu sendiri, jadi isinya diganti seluruhnya. Untuk setiap file, klik tabnya, kosongkan isinya (**Ctrl + A**, lalu **Delete**), lalu tempel versi barunya: klik kanan nama filenya di bawah ini → **Buka di tab baru**, klik **Copy raw file**, kembali ke Arduino IDE, lalu tempel (**Ctrl + V**).
   - [`jaringan.cpp`](kode/node-1-rumah/jaringan.cpp)
   - [`jaringan.h`](kode/node-1-rumah/jaringan.h)
   - [`node-1-rumah.ino`](kode/node-1-rumah/node-1-rumah.ino) (di Wokwi: tab **`sketch.ino`**)
   - [`perintah.cpp`](kode/node-1-rumah/perintah.cpp). Pernah menambah perintahmu sendiri, misalnya dari 🧩 Modul 8? Salin dulu bagianmu, lalu tempelkan lagi sesudahnya.
2. **`layar.cpp`** (boleh dilewati, hanya keterangan): tekan **Ctrl + F**, cari `Modul 10: alamat IP Node 1`, lalu ganti keterangan di belakang `//` pada baris itu menjadi `// Modul 11: misalnya "WiFi ok, MQTT ok"`.
3. **Di Wokwi**, pastikan tab `libraries.txt` memuat baris `PubSubClient3@3.3.2`, dan tab `diagram.json` memuat `macAddress` pilihanmu sendiri (kotak 🖥️ di awal bagian ➕). Tanpa `macAddress` sendiri, Node 1 simulasimu memakai `device_id` `240ac4000110` yang sama dengan pembaca lain, dan kalian saling mengusir di broker publik.

**Periksa dulu sebelum lanjut:** jumlah tab tetap **26** (di Wokwi, tab `diagram.json` dan tab library tidak ikut dihitung), baris pertama tab utama menulis `firmware v1.2.0 (Modul 11)`, dan tab `jaringan.cpp` memuat baris `#include <PubSubClient.h>`.

### D. Verify, Upload, dan lihat Node 1 menyapa broker

1. Klik **Verify**. Kalau muncul error, baca **pesan error pertama** dan bandingkan tab yang disebut dengan [versi rujukan](kode/node-1-rumah/). Panel **Output** menulis kira-kira `Sketch uses 1188032 bytes (60%) of program storage space. Maximum is 1966080 bytes.` Node 1 v1.2 justru **sekitar 125 KB lebih kecil** daripada v1.1 karena library HTTPClient, WebServer, dan mDNS tidak dipakai lagi.
2. Klik **Upload**, lalu buka **Serial Monitor**.

   **Hasilnya** (contoh; baris bacaan setiap 2 detik tidak ikut dikutip):

   ```text
   [00:00:00] INFO  Node 1 Rumah - firmware 1.2.0
   [00:00:00] INFO  Alasan restart terakhir: POWERON
   [00:00:00] INFO  Nyala ke-16. Ambang tanah_siram: 35 % (dari NVS)
   [00:00:01] INFO  Kartu microSD siap: bacaan dicatat ke node1.csv setiap 30 detik.
   [00:00:01] INFO  device_id a4cf12e5b7c0
   [00:00:01] INFO  Menyambung ke WiFi tersimpan "RumahKita" (tanpa menunggu)...
   [00:00:01] INFO  Watchdog aktif: restart otomatis kalau loop() macet lebih dari 5 detik.
   [00:00:03] INFO  WiFi tersambung ke "RumahKita": IP 192.168.1.23, sinyal -58 dBm
   [00:00:03] INFO  MQTT tersambung ke broker 192.168.1.10:1883 dalam 37 ms, sebagai a4cf12e5b7c0
   [00:00:08] INFO  Jam disetel dari internet: 2026-10-18T02:05:31Z
   [00:00:09] INFO  Terbit telemetry (jadwal 10 detik)
   [00:00:19] INFO  Terbit telemetry (jadwal 10 detik)
   ```

   Di MQTTX, berturut-turut muncul `online` di topik `status` (berlabel **Retained** kalau langganannya dibuat sesudahnya), satu pesan `vitals`, lalu `telemetry` setiap 10 detik dengan `"fw":"1.2.0"`. Terminal pemeriksa mencetak **LULUS** untuk setiap pesan itu. Baris **GAGAL** sebelum unggahan selesai berasal dari sketsa latihan yang tadi masih berjalan (Praktik 7 atau sketsa tantanganmu, yang kolomnya belum lengkap); abaikan saja karena hitungannya dimulai ulang di langkah F.
3. Ketik `wifi` di Serial Monitor:

   **Hasilnya** (contoh):

   ```text
   wifi: tersambung ke "RumahKita", IP 192.168.1.23, sinyal -57 dBm
   wifi: device_id a4cf12e5b7c0, nama node1, jam 2026-10-18T02:06:02Z
   mqtt: tersambung ke 192.168.1.10:1883 sebagai a4cf12e5b7c0
   mqtt: telemetry setiap 10 detik dan segera saat ada kejadian penting, vitals setiap 5 menit, 4 kali terbit
   ```

4. Tahan tombol D13 selama 1 detik untuk membuka halaman status di layar OLED: baris kelimanya kini `WiFi ok, MQTT ok`.

### E. ⭐ Perintah dari MQTTX: relay menyala, `ack` di bawah 1 detik

Biarkan pemeriksa tetap berjalan; dialah pengukur waktunya. Dari kotak kirim MQTTX (format **JSON**, **QoS 1**, **Retain** tidak dicentang), kirim ke topik `rpm/<device_id>/cmd` milik Node 1-mu, satu per satu, masing-masing dengan `id` baru:

1. `{"id":"c-101","aksi":"set","target":"lampu","nilai":true}`: relay lampu berbunyi "klik" dan LED indikatornya menyala.
2. `{"id":"c-102","aksi":"set","target":"kipas","nilai":true}`, lalu `{"id":"c-103","aksi":"set","target":"kipas","nilai":false}`: kipas berputar, lalu berhenti.
3. `{"id":"c-104","aksi":"set","target":"tirai","nilai":90}`: servo tirai berputar ke 90 derajat.
4. **Arahkan dulu ujung selang ke pot atau gelas**, lalu kirim `{"id":"c-105","aksi":"set","target":"pompa","nilai":3}`: pompa menyala 3 detik, lalu padam sendiri.
5. Matikan lagi lampunya: `{"id":"c-106","aksi":"set","target":"lampu","nilai":false}`.

**Hasilnya di terminal pemeriksa** (contoh):

```text
[09.07.10] rpm/a4cf12e5b7c0/cmd  LULUS
[09.07.10] rpm/a4cf12e5b7c0/ack  LULUS  (dijawab 236 ms setelah perintah: di bawah 1 detik)
[09.07.14] rpm/a4cf12e5b7c0/telemetry  LULUS
[09.07.22] rpm/a4cf12e5b7c0/cmd  LULUS
[09.07.22] rpm/a4cf12e5b7c0/ack  LULUS  (dijawab 188 ms setelah perintah: di bawah 1 detik)
[09.07.24] rpm/a4cf12e5b7c0/telemetry  LULUS
[09.07.39] rpm/a4cf12e5b7c0/cmd  LULUS
[09.07.39] rpm/a4cf12e5b7c0/ack  LULUS  (dijawab 251 ms setelah perintah: di bawah 1 detik)
```

**Syarat lulus pertama terpenuhi: perintah dari MQTTX menyalakan relay dan dibalas `ack` dalam waktu kurang dari 1 detik.** Di Wokwi, angka pemeriksa naik-turun di sekitar 1 detik (di uji modul ini sekitar 700–1.300 ms; pemeriksa mulai menghitung saat perintah lewat di broker, jadi angkanya sedikit lebih kecil daripada 1–2 detik yang terasa di MQTTX) karena perintah dan jawabannya menyeberangi internet (Konsep 8): kadang tertulis `di bawah 1 detik`, kadang `LEBIH dari 1 detik`. Angka itu tidak mengukur Node 1-mu, jadi syarat di bawah 1 detik baru bisa dibuktikan dengan papan asli dan broker di laptop. Perhatikan juga `state` di setiap `ack`: keempat aktuator selalu dilaporkan, termasuk `"pompa":true` selama pompa menyala. Coba juga perintah yang salah, misalnya `"nilai":15` untuk pompa: Node 1 menolaknya dengan `"pesan":"nilai pompa harus 1-10 detik"`. Pemeriksa pun menandai perintah itu **GAGAL** karena nilainya di luar kontrak, sedangkan `ack` penolakannya tetap **LULUS**.

### F. ⭐ Pemeriksa kontrak: semua LULUS

1. Mulai hitungan pemeriksa dari nol: hentikan dengan **Ctrl + C** (abaikan `Ringkasan` yang tercetak saat itu), lalu jalankan lagi dengan **↑** dan **Enter**. Biarkan pemeriksa berjalan paling sedikit 1 menit tanpa perintah. Setiap `telemetry` dan `status` dari Node 1 harus **LULUS**; `vitals` muncul lagi paling lambat 5 menit kemudian dan juga harus **LULUS**.
2. Lambaikan tangan di depan PIR dan tutup LDR: kiriman segera muncul di luar jadwal 10 detik, dan tetap **LULUS**. Serial Monitor mencatat alasannya, misalnya `Terbit telemetry (gerakan terlihat)`.
3. **Matikan MB102** (USB tetap tercolok, jadi Node 1 tetap menyala dan mengirim), lalu cabut sebentar kabel data DHT22 dari D14, seperti di Praktik 3. `suhu` dan `kelembapan` menjadi `null`. HC-SR04 ikut padam bersama MB102, jadi `level_air` pun menjadi `null`, dan bacaan PIR bisa berubah. Pesannya **tetap LULUS**: bacaan gagal yang ditulis `null` memang sesuai kontrak. Pasang lagi kabelnya, lalu nyalakan lagi MB102. Di Wokwi, kabel tidak bisa dicabut selagi simulasi berjalan; lewati langkah ini.
4. Hentikan pemeriksa dengan **Ctrl + C**, lalu salin baris `Ringkasan` ke `catatan-modul11.md`. Karena hitungannya dimulai ulang di langkah 1 dan kamu tidak mengirim pesan buatan, ringkasannya seharusnya berakhiran `0 pesan GAGAL.` Kalau masih ada GAGAL, baca alasannya di baris-baris di atasnya: semua pesan dari Node 1 harus lulus.

**Syarat lulus kedua terpenuhi: `telemetry` Node 1 lolos pemeriksaan format Lampiran A.**

### G. Uji status: Node 1 kehabisan listrik

1. **Pindahkan Node 1 ke *charger*-nya**, seperti di akhir ➕ Modul 10: **matikan MB102** → cabut USB dari laptop → colokkan kabel berlabel **ESP32** ke *charger* → **baru** nyalakan MB102. Kalau memasang modul microSD beregulator, tekan **EN** sesudahnya, seperti di Modul 10. Beberapa detik kemudian, MQTTX menampilkan `online`.
2. Di terminal, jadilah pelanggan status: `mosquitto_sub -v -t "rpm/+/status"`. **Di Wokwi**, pakai broker publik dan `device_id`-mu, misalnya `mosquitto_sub -h broker.emqx.io -v -t "rpm/240ac45e114b/status"`; lewati langkah 1 dan 4, dan di langkah 3 cukup hentikan simulasinya: broker publik pun menerbitkan `offline` (di uji modul ini sekitar 17–27 detik kemudian). Bonus di langkah 5 hanya bisa dicoba di papan asli karena broker publik tidak bisa kamu matikan.
3. Siapkan *stopwatch*. **Matikan MB102**, lalu cabut *charger* Node 1 dari stopkontak sambil mulai menghitung. Dalam **13–23 detik**, terminal mencetak `rpm/<device_id>/status offline`. Tidak ada satu baris kode pun di Node 1 yang menerbitkan `offline`: broker sendirilah yang menerbitkan wasiatnya.
4. Colokkan lagi *charger*-nya, lalu nyalakan MB102 (modul microSD beregulator: tekan **EN** sesudahnya). Status kembali `online`.
5. **Bonus: broker mati, Node 1 tetap bekerja.** Hentikan broker di laptop (**Ctrl + C**) selama 1 menit. Node 1 tetap membaca sensor, menyiram, dan menyalakan lampu otomatis; layar statusnya menulis `WiFi ok, MQTT putus`. Jalankan lagi brokernya: dalam 5 detik Node 1 tersambung kembali, menerbitkan `online`, dan melanjutkan kirimannya. Di MQTTX, klik lagi **Connect** pada sambungan **Broker laptop**: sekitar 4 detik setelah broker dimatikan, MQTTX mencoba menyambung sekali, ditolak, lalu berhenti mencoba sendiri.

Node 1 v1.2 kini bekerja permanen dari *charger*-nya. Kirimannya hanya terlihat selama broker di laptop menyala; di Modul 12, broker pindah ke Raspberry Pi yang selalu menyala.

### H. ⭐ Diagram, `KONTRAK-DATA.md`, dan simpan ke GitHub

1. **Diagram *pub/sub*.** Bandingkan diagram dari Praktik 9 dengan Node 1 v1.2 yang baru saja kamu jalankan: tambahkan topik `vitals` kalau belum ada, dan tulis di samping panah `cmd` bahwa satu topik itu membawa perintah untuk keempat aktuator: lampu, kipas, pompa, dan tirai. **Syarat lulus ketiga terpenuhi: kamu bisa menggambar diagram *pub/sub* proyekmu di kertas.**
2. **`rumah-pintar-mini`**: di GitHub Desktop, pilih repositori **`rumah-pintar-mini`**. Daftar **Changes** berisi perubahan di `firmware/node-1-rumah` (`jaringan.cpp`, `jaringan.h`, `konfigurasi.h`, `node-1-rumah.ino`, `perintah.cpp`, dan mungkin `layar.cpp`), ditambah `KONTRAK-DATA.md`, `edge/mosquitto-lan.conf`, `alat/pemeriksa-kontrak.js`, `alat/package.json`, dan `alat/package-lock.json`. File terakhir dibuat oleh `npm install` dan mencatat versi persis setiap library; simpan juga. Folder `node_modules` tidak muncul karena dijaga `.gitignore`. **Periksa isi `konfigurasi.h` di panel kanan:** tidak ada kata sandi apa pun di sana, hanya alamat IP laptopmu. Isi **Summary** dengan `Node 1 v1.2: semua komunikasi lewat MQTT (Modul 11)`, klik **Commit … to main**, lalu **Push origin**.
3. Lengkapi dulu tabel bukti ini di `catatan-modul11.md`; *commit*-nya di langkah 4:

| Bukti | Hasilmu |
| :--- | :--- |
| `device_id` Node 1 dan alamat broker | |
| Baris pemeriksa untuk satu `ack` (langkah E): `dijawab … ms` | |
| Baris `Ringkasan` pemeriksa (langkah F) | |
| Uji status: berapa detik sampai `offline` muncul (langkah G) | |
| Ukuran program di panel **Output** (`Sketch uses … bytes`, maksimum 1.966.080) | |
| Foto diagram *pub/sub* (`diagram-pubsub.jpg`) | |

4. **`belajar-iot`**: pastikan folder `modul-11` berisi keenam sketsa latihan minggu ini (`modul11_halo_broker`, `modul11_telemetri`, `modul11_status_online`, `modul11_qos`, `modul11_perintah_ack`, dan `modul11_kirim_segera`), sketsa tantanganmu, `catatan-modul11.md`, dan `diagram-pubsub.jpg`. Pilih repositori **`belajar-iot`** di GitHub Desktop, lalu periksa sekali lagi: **tidak ada `secrets.h`** di daftar **Changes**. Isi **Summary** dengan `Modul 11: MQTT, kontrak data, dan Node 1 v1.2`, lalu klik **Commit … to main** dan **Push origin**.

---

## 📖 Glosarium

| Istilah | Arti singkat |
| :--- | :--- |
| **MQTT** | Protokol (tata cara) berkirim pesan lewat satu perantara, broker. Ringan, dua arah, dan tahan putus; "bahasa resmi" dunia IoT. |
| **Broker** | "Kantor pos" MQTT: menerima pesan dari penerbit, lalu meneruskannya ke semua pelanggan topik itu. Minggu ini: Mosquitto di laptop. |
| **Klien** (*client*) | Setiap program atau perangkat yang menyambung ke broker, misalnya ESP32, MQTTX, dan alat pemeriksa. |
| ***Publish/subscribe*** (*pub/sub*) | Cara kerja MQTT: penerbit dan pelanggan tidak saling kenal; keduanya hanya tahu broker dan nama topik. |
| **Menerbitkan** (*publish*) | Mengirim pesan ke sebuah topik. |
| **Berlangganan** (*subscribe*) | Meminta broker meneruskan setiap pesan di topik tertentu. |
| **Topik** (*topic*) | Alamat pesan yang bertingkat, dipisahkan `/`, misalnya `rpm/a4cf12e5b7c0/telemetry`. Huruf besar-kecil dibedakan. |
| ***Wildcard*** (karakter pengganti) | Hanya untuk berlangganan: `+` menggantikan tepat satu tingkat, `#` menggantikan tingkat itu dan semua di bawahnya. |
| **`$SYS`** | Topik khusus tempat broker melaporkan keadaannya sendiri, misalnya jumlah klien. Tidak tertangkap `#`. |
| **Mosquitto** | Program broker MQTT bersumber terbuka dari Eclipse Foundation. |
| **Mode lokal saja** (*local only mode*) | Keadaan bawaan Mosquitto 2.x tanpa file konfigurasi, atau dengan file yang tidak memuat baris `listener`: hanya melayani klien di komputer yang sama. |
| **`listener` dan `allow_anonymous`** | Dua baris konfigurasi Mosquitto: membuka pintu untuk jaringan, dan mengizinkan klien tanpa nama pengguna dan kata sandi. |
| **Port 1883** | Nomor pintu resmi MQTT tanpa enkripsi. MQTT terenkripsi memakai 8883. |
| **Sambungan TCP** | Jalur kirim-terima yang dibuka lebih dulu antara dua perangkat di jaringan. MQTT dan HTTP berjalan di atasnya. |
| **MQTTX** | Aplikasi di laptop untuk mengintip dan mengirim pesan MQTT. |
| **`mosquitto_sub` / `mosquitto_pub`** | Dua program terminal yang ikut terpasang bersama Mosquitto: pelanggan dan penerbit sederhana. |
| ***Client ID*** (nama klien) | Nama unik setiap klien di broker. Dua klien bernama sama saling mengusir. Node 1 memakai `device_id`. |
| **QoS** (*Quality of Service*) | Tingkat usaha mengantar pesan: 0 surat biasa, 1 surat tercatat (bisa dobel), 2 kurir bertanda tangan (tepat sekali). |
| **`PUBACK`** | Tanda terima untuk pesan QoS 1. |
| **Sesi persisten** (*clean session* = `false`) | Broker mengingat langganan klien dan menyimpan pesan QoS 1 untuknya selama klien itu pergi. |
| **Pesan *retained*** | "Papan pengumuman": pesan terakhir di sebuah topik yang disimpan broker dan langsung diberikan kepada pelanggan baru. |
| ***Last Will*** (surat wasiat) | Pesan titipan klien yang diterbitkan broker kalau klien itu hilang tanpa pamit. Dasar status `offline` otomatis. |
| ***Keep-alive*** (detak jantung) | Janji klien untuk mengirim sesuatu paling lambat setiap sekian detik. Broker menyerah setelah 1,5 kalinya. |
| **`PINGREQ` / `PINGRESP`** | Paket detak jantung dua byte: "aku masih di sini" dan jawabannya. |
| **Kontrak data** | Kesepakatan tertulis tentang nama topik dan bentuk isi pesan (Lampiran A, `KONTRAK-DATA.md`). |
| **`telemetry`, `status`, `vitals`, `cmd`, `ack`** | Lima jenis pesan setiap perangkat: bacaan sensor, hidup-mati, kesehatan, perintah, dan jawaban perintah. |
| **`ack`** (*acknowledgement*, tanda terima) | Jawaban perangkat atas satu perintah, dengan `id` yang sama, `ok`, `state`, dan `pesan` kalau ditolak. |
| ***Report-by-exception*** (kiriman segera) | Mengirim segera saat ada kejadian penting, di luar jadwal tetap. |
| ***Idempotent*** | Sifat perintah yang hasilnya sama walaupun dikerjakan dua kali. Node 1 mencapainya dengan mengabaikan `id` yang berulang. |
| **`null`** | Nilai JSON yang berarti "tidak ada angka". Dipakai untuk bacaan sensor yang gagal. |
| **Wadah pesan** (*buffer*) | Ruang memori library untuk satu paket MQTT. Bawaannya 256 byte; paket masuk yang lebih besar dibuang diam-diam. Diperbesar dengan `setBufferSize()`. |
| **PubSubClient3** | Library MQTT untuk ESP32 yang kita pakai; penerus PubSubClient 2.8 yang sudah tidak dirawat. |
| **`mqtt`** (library Node.js) | Klien MQTT untuk program Node.js, dipasang dengan `npm install`. Dipakai alat pemeriksa kontrak. |

---

## 📝 Kuis 5 soal

1. (a) Pakai analogi grup WhatsApp untuk menjelaskan apa yang terjadi saat Node 1 menerbitkan `telemetry` dan MQTTX serta alat pemeriksa sama-sama berlangganan `rpm/#`. Sebutkan peran broker, topik, penerbit, dan pelanggan. (b) Seorang teman berkata, "Supaya laptop bisa menyalakan lampu Node 1 lewat MQTT, Node 1 harus menjadi server web seperti di Modul 10." Benarkah? Jelaskan.
2. Broker menerima lima pesan dengan topik berikut: `rpm/a4cf12e5b7c0/telemetry`, `rpm/240ac45e114b/status`, `rpm/A4CF12E5B7C0/status`, `/rpm/a4cf12e5b7c0/status`, dan `$SYS/broker/clients/connected`. (a) Pesan mana saja yang diterima pelanggan `rpm/+/status`? Bagaimana dengan pelanggan `#`? (b) Firmware temanmu menerbitkan ke `rpm/a4cf12e5b7c0/Telemetry`. Apa yang terlihat di MQTTX yang berlangganan `rpm/+/telemetry`, dan pesan error apa yang muncul?
3. ESP32 terus menulis `Gagal ke broker setelah … ms: gagal tersambung ke broker (kode -2)`. MQTTX di laptop yang menjalankan broker bisa tersambung dengan **Host** `127.0.0.1`, tetapi gagal saat **Host**-nya diisi alamat IP laptop itu sendiri (seperti Praktik 2.4). (a) Apa penyebab yang paling mungkin, dan bagaimana memperbaikinya? (b) Kalau MQTTX tersambung lewat kedua alamat itu, tetapi ESP32 tetap gagal, sebutkan dua penyebab yang mungkin. (c) Mengapa setiap percobaan menyambung di Node 1 dibatasi sekitar 1 detik?
4. (a) Di Praktik 5, mengapa hanya "surat tercatat" yang sampai setelah WiFi ESP32 menyala lagi? Sebutkan dua syarat di sisi ESP32 yang membuatnya mungkin. (b) Mengapa Node 1 v1.2 justru **tidak** memakai sesi persisten untuk perintah? (c) Status `online` dikirim dengan tanda *retained*, tetapi perintah `set` tidak boleh. Mengapa?
5. Node 1 v1.2 menerima `{"id":"c-007","aksi":"set","target":"kipas","nilai":"true"}`. (a) Apa yang dilakukan Node 1, dan seperti apa `ack`-nya? (b) Lima detik kemudian, pesan yang sama persis datang lagi. Apa yang terjadi, dan mengapa perilaku itu penting? (c) Mengapa kontrak data menulis bacaan gagal sebagai `null`, bukan `-1`?

<details>
<summary><b>Kunci jawaban & penjelasan</b></summary>

1. (a) Broker (Mosquitto) adalah **server WhatsApp**, topik `rpm/a4cf12e5b7c0/telemetry` adalah **nama grup**, Node 1 adalah **penerbit** yang mengirim pesan ke grup, dan MQTTX serta alat pemeriksa adalah **pelanggan**, anggota grup itu. Node 1 cukup mengirim satu pesan ke broker; broker yang meneruskannya ke kedua pelanggan, tanpa Node 1 tahu siapa saja mereka (Konsep 2). (b) **Tidak benar.** Node 1 sendiri yang membuka sambungan ke broker dan membiarkannya terbuka. Perintah dari laptop diterbitkan ke `rpm/<device_id>/cmd`, dan broker meneruskannya lewat sambungan yang sudah dibuka Node 1 itu. Satu-satunya yang harus bisa didatangi adalah broker (Konsep 1–2).
2. (a) `rpm/+/status` menerima `rpm/240ac45e114b/status` dan `rpm/A4CF12E5B7C0/status` (`+` menerima isi tingkat apa pun, termasuk huruf besar). `/rpm/a4cf12e5b7c0/status` tidak diterima karena garis miring di depan membuat tingkat pertama kosong, jadi tingkat-tingkatnya bergeser. `#` menerima empat pesan pertama, tetapi **tidak** `$SYS/…` karena topik berawalan `$` tidak pernah tertangkap *wildcard* di depan (Konsep 4). (b) **Tidak ada yang tampil.** `+` memang menerima `a4cf12e5b7c0`, tetapi tingkat terakhirnya harus persis `telemetry`, sedangkan `Telemetry` berhuruf besar adalah topik lain. Tidak ada pesan error di mana pun: broker menerimanya, tidak menemukan pelanggan, lalu membuangnya diam-diam. Itulah sebabnya topik dibuat dari variabel yang disusun sekali di `setup()`, dan alat pemeriksa berlangganan `rpm/#` supaya topik salah ketik tetap tertangkap.
3. (a) Broker hanya melayani `127.0.0.1`, tidak melayani alamat jaringan laptop. Itu ciri **mode lokal saja**: Mosquitto dijalankan tanpa `-c mosquitto-lan.conf`. Jalankan `mosquitto -v -c mosquitto-lan.conf`, dengan file `mosquitto-lan.conf` yang berisi `listener 1883` dan `allow_anonymous true` (Konsep 3, Praktik 1). (b) Brokernya sudah benar, jadi masalahnya di jalan antara ESP32 dan laptop. Misalnya: `ALAMAT_BROKER` di sketsa salah atau alamat laptop berubah, *firewall* menghadang (izin hanya Private, padahal WiFi berprofil Public), ESP32 dan laptop beda jaringan, atau VPN menyala. (c) Batas bawaannya bisa 3 detik untuk membuka sambungan dan 15 detik untuk menunggu jawaban broker, jauh melewati *watchdog* 5 detik. Tanpa batas 1 detik (`setConnectionTimeout(1000)` dan `setSocketTimeout(1)`), broker yang macet bisa membuat Node 1 *restart* berulang-ulang (Konsep 10).
4. (a) Broker hanya menyimpan pesan QoS 1 untuk klien yang pergi, dan pesan QoS 1 yang telanjur dikirim ke sambungan mati dikirim ulang karena tanda terimanya tidak datang; pesan QoS 0 tidak disimpan dan tidak dikirim ulang. Dua syaratnya di sisi ESP32: (1) menyambung dengan **sesi persisten** (*clean session* = `false`) memakai nama klien yang **selalu sama**, dan (2) berlangganan dengan **QoS 1** (Konsep 6, Praktik 5). (b) Perintah yang menumpuk selama Node 1 mati, misalnya lima kali "pompa 10 detik", akan dikerjakan sekaligus begitu Node 1 menyala. Untuk aktuator, perintah basi lebih berbahaya daripada perintah yang hilang: perintah yang hilang bisa diulang pengirimnya setelah ia tidak menerima `ack`. (c) Status adalah keadaan yang berlaku sampai diganti, jadi pelanggan baru perlu langsung tahu. Perintah `set` *retained* akan diserahkan ulang setiap kali Node 1 menyambung sehingga relay bisa bergerak sendiri, misalnya setiap kali Node 1 *restart* dan pengingat `id`-nya kosong (Konsep 7).
5. (a) `"true"` adalah **teks**, bukan nilai `true`. Node 1 memeriksa jenisnya dengan `is<bool>()`, menolaknya, dan menjawab `{"id":"c-007",…,"ok":false,"pesan":"nilai kipas harus true atau false","state":{…}}`. Tanpa pemeriksaan itu, `as<bool>()` menganggap teks apa pun benar, termasuk `"false"` (Konsep 8). (b) Node 1 mengenali `c-007` sebagai `id` yang sudah pernah diterima (walaupun tadi ditolak), lalu mengabaikannya tanpa mengirim `ack` kedua. Pesan yang sama bisa datang dua kali karena QoS 1 boleh mengantar ulang, atau karena perintah telanjur dikirim *retained*; mengabaikan pengulangan membuat perintah bersifat *idempotent* sehingga perintah seperti "pompa 3 detik" tidak dikerjakan dua kali (Konsep 5 dan 8). (c) `-1` bisa terbaca sebagai angka sungguhan dan ikut terhitung, misalnya menurunkan rata-rata kelembapan. `null` jelas berarti "tidak ada angka", dan baik database maupun grafik kelak paham artinya (Konsep 5).

</details>

---

## ✅ Checklist kelulusan Modul 11

Centang semuanya sebelum lanjut ke Modul 12:

- [ ] Aku bisa menjelaskan *publish/subscribe* dengan analogi grup WhatsApp, dan tiga kekurangan HTTP yang diselesaikan MQTT (Konsep 1–2).
- [ ] Mosquitto berjalan di laptop dengan `mosquitto-lan.conf`, diizinkan *firewall* hanya untuk jaringan pribadi, dan hanya ada **satu** broker (Praktik 1).
- [ ] Aku pernah berkirim pesan lewat `mosquitto_pub`, `mosquitto_sub`, dan MQTTX, termasuk memakai *wildcard* `+` dan `#` (Praktik 2).
- [ ] ESP32 menerbitkan `telemetry` JSON ke broker laptop, dan bacaan yang gagal tertulis `null` (Praktik 3).
- [ ] Status `online` dan `offline` muncul otomatis di MQTTX, dan aku tahu mengapa `offline` butuh sekitar 13–23 detik (Praktik 4).
- [ ] Aku sudah melihat sendiri: setelah WiFi menyala lagi, hanya pesan QoS 1 yang sampai (Praktik 5).
- [ ] Perintah dari MQTTX dijawab `ack`, perintah yang salah ditolak dengan alasannya, dan `id` yang berulang diabaikan (Praktik 6).
- [ ] Gerakan dan gelap-terang terkirim segera, dengan jeda paling sedikit 2 detik (Praktik 7).
- [ ] Alat pemeriksa kontrak berjalan di laptopku (Praktik 8), dan `KONTRAK-DATA.md` ada di repositori `rumah-pintar-mini` (Praktik 9).
- [ ] ⭐ **Perintah dari MQTTX menyalakan relay dan dibalas `ack` dalam waktu kurang dari 1 detik** (➕ E).
- [ ] ⭐ **`telemetry` Node 1 v1.2 LULUS alat pemeriksa kontrak** (➕ F).
- [ ] ⭐ **Aku bisa menggambar diagram *pub/sub* proyekku di kertas** (Praktik 9, ➕ H).
- [ ] Node 1 v1.2 menampilkan `offline` saat kehabisan listrik, dan tetap bekerja saat broker dimatikan (➕ G).
- [ ] Node 1 v1.2, `KONTRAK-DATA.md`, `edge/mosquitto-lan.conf`, dan alat pemeriksa sudah di-*commit* dan di-*push* ke `rumah-pintar-mini`; sketsa, `catatan-modul11.md`, dan foto diagram ke `belajar-iot`, tanpa satu pun `secrets.h`.
- [ ] ⭐ **Kuis: minimal 4 dari 5 benar.**

**Lulus jika** (sesuai Silabus): *Kamu bisa menggambar diagram pub/sub proyekmu di kertas, perintah dari MQTTX menyalakan relay dan dibalas `ack` < 1 detik, dan payload `telemetry`-mu lolos pemeriksaan format Lampiran A.*

Selamat — Node 1 kini berbicara dalam bahasa resmi dunia IoT, dengan kontrak data yang akan dipakai sampai akhir kurikulum. Masih ada satu kelemahan: kantor posnya ada di laptop. Begitu laptop tidur atau dibawa pergi, semua pesan berhenti. Di **Modul 12**, kita memasang **Raspberry Pi** sebagai *gateway* yang selalu menyala, belajar Linux dasar, dan memindahkan Mosquitto ke sana.

---

## 📚 Sumber & atribusi gambar

**Dokumentasi, kode sumber, dan hasil uji yang dipakai** (diakses Oktober 2026):

- MQTT: [MQTT Version 3.1.1](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html) dan [MQTT Version 5.0](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html) (OASIS): topik dan *wildcard*, QoS 0/1/2, sesi persisten, pesan *retained*, *Last Will*, *keep-alive* 1,5 kali, dan nama klien yang ganda; sejarah singkat dari [mqtt.org](https://mqtt.org/faq/).
- Mosquitto: halaman [unduhan](https://mosquitto.org/download/), [Authentication methods](https://mosquitto.org/documentation/authentication-methods/) (mode lokal saja, `listener` dan `allow_anonymous`), dan manual [mosquitto](https://mosquitto.org/man/mosquitto-8.html), [mosquitto.conf](https://mosquitto.org/man/mosquitto-conf-5.html), [mosquitto_pub](https://mosquitto.org/man/mosquitto_pub-1.html), serta [mosquitto_sub](https://mosquitto.org/man/mosquitto_sub-1.html); kode sumber [Mosquitto 2.1.2](https://github.com/eclipse-mosquitto/mosquitto/tree/v2.1.2) (teks log saat menyala dan saat klien datang-pergi, Windows yang diam tanpa `-v`, penyimpanan pesan untuk klien yang pergi, serta penginstal dan layanan Windows); formula [Homebrew](https://formulae.brew.sh/formula/mosquitto) dan paket [Debian](https://packages.debian.org/source/sid/mosquitto)/[Ubuntu](https://launchpad.net/ubuntu/+source/mosquitto).
- Library ESP32: [PubSubClient3](https://github.com/hmueller01/pubsubclient3/tree/v3.3.2) 3.3.2 oleh Holger Mueller (wadah, batas waktu, `connect()`, `publish()`, `subscribe()`, kode `state()`), [PubSubClient](https://github.com/knolleary/pubsubclient) 2.8 oleh Nick O'Leary (catatan "not maintained" di README-nya), dan [ArduinoJson](https://arduinojson.org/v7/) 7.4.3 (`deserializeJson()`, `is<bool>()`, `as<bool>()`, `null`).
- Kode sumber [arduino-esp32](https://github.com/espressif/arduino-esp32/tree/3.3.12) 3.3.12: `NetworkClient` (`setConnectionTimeout()`, batas waktu 3 detik, kiriman yang bisa menunggu), urutan peristiwa saat WiFi putus, dan `sdkconfig` (*watchdog* 5 detik, ukuran antrean TCP, esp-mqtt tanpa MQTT 5); dokumentasi [ESP-MQTT](https://docs.espressif.com/projects/esp-idf/en/v5.5.5/esp32/api-reference/protocols/mqtt.html) ESP-IDF 5.5.
- [MQTTX](https://mqttx.app) 1.13.1 oleh EMQ: [halaman unduhan](https://mqttx.app/downloads) dan [kode sumber](https://github.com/emqx/MQTTX/tree/v1.13.1) (label formulir sambungan, langganan, kotak kirim, **Retained**, dan **Clear Retained Message**, serta perilaku menyambung ulang setelah broker mati dan kotak **Retain** yang ikut tercentang oleh **Clear Retained Message**).
- [MQTT.js](https://github.com/mqttjs/MQTT.js) 5.16.1 (`mqtt` di npm): pilihan `connect()`, peristiwa `error`, `close`, dan `message`; perilaku Node.js 24 saat broker mati dari [dokumentasi Node.js](https://nodejs.org/docs/latest-v24.x/api/).
- Broker publik: [EMQX Public MQTT Broker](https://www.emqx.com/en/mqtt/public-mqtt5-broker) (`broker.emqx.io`), [HiveMQ MQTT Dashboard](https://www.mqtt-dashboard.com/) (`broker.hivemq.com`), dan [test.mosquitto.org](https://test.mosquitto.org/). Perilaku penyimpanan QoS 0 dan QoS 1 di `broker.emqx.io` dan `broker.hivemq.com` diuji langsung dengan MQTT.js pada 18 Oktober 2026.
- Wokwi: [ESP32 WiFi Networking](https://docs.wokwi.com/guides/esp32-wifi) (sambungan keluar saja, `Wokwi-GUEST`) dan [ESP32 Simulation](https://docs.wokwi.com/guides/esp32) (atribut `macAddress`).
- Microsoft: [Windows Firewall rules](https://learn.microsoft.com/en-us/windows/security/operating-system-security/network-security/windows-firewall/rules), [sc.exe config](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/sc-config), [Get-NetTCPConnection](https://learn.microsoft.com/en-us/powershell/module/nettcpip/get-nettcpconnection), [*stealth mode* *firewall* Windows](https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/disable-stealth-mode) (tanpa balasan untuk pintu yang tidak dilayani), serta aturan petik PowerShell [about_Quoting_Rules](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_quoting_rules) dan [about_Parsing](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_parsing).

**Gambar.** Diagram dan ilustrasi buatan sendiri dilisensikan **CC BY 4.0**, dan file sumber `.svg`-nya disertakan di folder `aset/` supaya bisa kamu ubah. Rekap lengkap juga ada di [`aset/SUMBER.md`](aset/SUMBER.md).

| File | Sumber | Lisensi / keterangan |
| :--- | :--- | :--- |
| `peta-jalan-modul-11`, `surat-vs-grup`, `pubsub-grup`, `mosquitto-pintu`, `pohon-topik`, `kontrak-lima-topik` (`.png` + `.svg`) | Diagram orisinal kurikulum Fullstack IoT Developer. Teks peringatan Mosquitto dari kode sumber Mosquitto 2.1.2; topik dan isi pesan mengikuti kontrak data Lampiran A; alamat dan `device_id` hanya contoh. | CC BY 4.0 |
| `qos-tiga-tingkat`, `retained-wasiat-detak`, `kapan-kirim`, `perintah-ack`, `wadah-256`, `tidak-macet` (`.png` + `.svg`) | Diagram orisinal. Alur paket dari standar MQTT 3.1.1; angka *keep-alive*, wadah, dan batas waktu dari kode sumber PubSubClient3 3.3.2 dan paket esp32 3.3.12; waktu pulang-pergi di Wokwi dari uji modul ini. | CC BY 4.0 |
| `peta-file-node1-v12`, `diagram-pubsub-proyek` (`.png` + `.svg`) | Diagram orisinal; isi file dan topik dari Node 1 v1.2 di folder `kode/` dan kontrak data Lampiran A. | CC BY 4.0 |
| `mqttx-kc`, `mqttx-sambungan-laptop` (`.png` + `.svg`) | Ilustrasi orisinal tampilan MQTTX 1.13.1, bukan tangkapan layar; label antarmuka dari kode sumber [MQTTX](https://github.com/emqx/MQTTX) (© EMQ Technologies, lisensi Apache 2.0); kode topik, nama klien, dan jam hanya contoh. | CC BY 4.0 untuk susunan dan penanda |

Semua sketsa di modul ini sudah dikompilasi dengan paket esp32 versi 3 dan dijalankan di Wokwi dengan broker publik. Kotak **Hasilnya** bertanda **rekaman Wokwi** (Kemenangan Cepat) berasal langsung dari simulator. Kotak bertanda **contoh** di Praktik 3–7 dan bagian ➕ memakai susunan baris yang sama persis dengan rekaman Wokwi dan kode sketsanya, tetapi nama WiFi, alamat IP, `device_id`, dan angkanya diganti dengan contoh dari jaringan rumah karena Wokwi tidak bisa menjangkau broker di laptopmu. Keluaran `npm install` direkam dari program aslinya di Node.js 24. Bentuk keluaran alat pemeriksa kontrak juga direkam dari program aslinya (dengan broker publik), tetapi `device_id`, alamat broker, jam, dan angka milidetiknya diganti dengan contoh. Keluaran Mosquitto, `mosquitto_sub`, dan `Get-NetTCPConnection` disusun dari kode sumber Mosquitto 2.1.2 serta dokumentasi Mosquitto dan Microsoft, belum dijalankan langsung; angka di depan setiap baris, nomor port asal ESP32 (misalnya `57288`), dan angka `OwningProcess` hanya contoh. Lama kegagalan di laptop Windows (sekitar `1001 ms`) disimpulkan dari dokumentasi *stealth mode* Microsoft, belum diukur dengan papan asli.

---

[⬅️ Modul 10](../modul-10-wifi-dan-http/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · **Berikutnya: [Modul 12 — Raspberry Pi & Linux Dasar: Gateway yang Selalu Hidup](../modul-12-raspberry-pi-dan-linux/README.md) ➡️**
