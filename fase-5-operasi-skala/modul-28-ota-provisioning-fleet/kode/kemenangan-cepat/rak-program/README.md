# Kemenangan Cepat Modul 28: dua rak di papanmu

Bahan untuk 🏆 Kemenangan Cepat Modul 28 (±15 menit, butuh papan Node 1). Satu sketsa kecil mencetak **rak program** mana yang
sedang berjalan, rak sebelahnya, dan isi **catatan rak** (`otadata`, secarik catatan yang dibaca **pembuka rak** saat papan
menyala). Lalu kamu mengunggah versi kedua sketsa yang sama **lewat WiFi**, didorong dari Arduino IDE (ArduinoOTA), dan melihat
sendiri papan pindah dari rak `app0` ke rak `app1`. Proyek "Rumah Pintar Mini" tidak disentuh.

| Berkas | Isinya |
| :--- | :--- |
| [`rak-program.ino`](rak-program.ino) | sketsa: konstanta `VERSI`, cetak rak berjalan + keadaannya di catatan rak, rak sebelah + ukurannya, `ESP.getFreeSketchSpace()`, alasan restart terakhir; ArduinoOTA bersandi |
| [`secrets.h`](secrets.h) | contoh nama dan sandi WiFi, sama dengan Modul 10 (isi milikmu sendiri; jangan ikut Git) |

> [!WARNING]
> **Latihan saja.** Selama Kemenangan Cepat ini Node 1 tidak menjalankan firmware rumah (sensor, lampu otomatis, dan MQTT
> berhenti). Di langkah 4, Node 1 1.6.0 dipasang lagi lewat kabel. Sandi contoh di baris `ArduinoOTA.setPassword("ganti-sandi-ini")`
> **wajib diganti** sebelum unggahan pertama: selama sketsa ini berjalan, siapa pun di WiFi rumahmu yang tahu sandinya bisa
> mengirim program ke papan.

> [!NOTE]
> **Dikompilasi penulis, belum dijalankan di papan.** Pada 2 November 2026 sketsa ini dikompilasi dengan `arduino-cli` 1.5.1 dan
> paket esp32 3.3.12 untuk setelan di bawah: tanpa galat dan tanpa satu pun peringatan, `Sketch uses 950907 bytes (48%)`.
> Penulis tidak punya papan di meja, jadi semua teks Serial Monitor di bawah dibaca dari sketsa, bukan rekaman papan. Port jaringan
> Arduino IDE untuk paket 3.3.12 (pencarian papan lewat mDNS, alat unggah `espota`, izin *firewall* laptop) juga belum diuji penulis.

## Setelan Arduino IDE

- Papan **ESP32 Dev Module** (paket esp32 **3.3.12**), seperti Node 1 sejak Modul 10.
- **Tools → Partition Scheme** → **Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS)**: dua rak program, masing-masing 1.966.080 byte.
  Skema yang namanya memuat **No OTA** (termasuk **Huge APP**) hanya punya satu rak: fungsi rak sebelah lalu menunjuk rak yang sedang
  berjalan itu sendiri, jadi sketsa menulis `Tidak ada rak sebelah: pilih Partition Scheme Minimal SPIFFS.` dan berhenti di situ.
- **Tools → Flash Mode** → **DIO**.
- Tanpa library tambahan: WiFi, ArduinoOTA, dan `esp_ota_ops.h` (fungsi rak program dari ESP-IDF) ikut paket esp32.

## Urutan langkah

Salin folder `rak-program` ini ke folder latihanmu (misalnya `belajar-iot/modul-28/rak-program`) dan buka `rak-program.ino` di
Arduino IDE. Isi tab `secrets.h` dengan nama dan sandi WiFi 2,4 GHz rumahmu (atau salin `secrets.h` dari folder sketsa Modul 10-mu),
lalu ganti `ganti-sandi-ini` dengan sandi buatanmu sendiri.

1. **Unggah lewat kabel.** Pilih port USB papan seperti biasa, klik **Upload**, lalu buka **Serial Monitor** (**115200 baud**).
   Kalau baris pertama terlewat, tekan tombol **EN**. Yang ditulis sketsa (alamat IP contoh):

   ```text
   Versi 1, restart terakhir: POWERON
   Rak berjalan: app0 (UNDEFINED, dipasang lewat kabel)
   Rak sebelah: app1, 1966080 byte
   Ruang untuk program baru: 1966080 byte
   Siap menerima program lewat WiFi di 192.168.1.50
   ```

   Unggah lewat kabel menulis ulang pembuka rak, tabel partisi, dan catatan rak "nyalakan `app0`" dengan keadaan `UNDEFINED`: program
   boleh jalan tanpa syarat, tanpa masa uji. `ESP.getFreeSketchSpace()` mengukur **rak sebelah** (tempat program berikutnya akan
   ditulis), bukan sisa rak yang sedang dipakai, jadi angkanya sama dengan baris di atasnya.

2. **Unggah lewat WiFi.** Ubah `const int VERSI = 1;` menjadi `2`. Buka **Tools → Port**: selain port USB, mestinya ada port jaringan
   bernama `rak-program` dengan alamat IP papan (label persisnya di Arduino IDE 2.3.10 belum dicek penulis). Laptop dan papan harus
   tersambung ke WiFi yang sama. Pilih port itu, klik **Upload**, lalu isi sandi yang kamu tulis di `setPassword()`. Program baru
   ditulis ke rak sebelah oleh program lama yang masih berjalan, lalu papan menyala ulang sendiri. Biarkan kabel USB terpasang hanya
   untuk melihat Serial Monitor (kalau Serial Monitor diam, pilih lagi port USB untuknya):

   ```text
   Program baru datang, ditulis ke rak sebelah...
   ```

   lalu sesudah menyala ulang:

   ```text
   Versi 2, restart terakhir: SW
   Rak berjalan: app1 (VALID, sudah sah)
   Rak sebelah: app0, 1966080 byte
   Ruang untuk program baru: 1966080 byte
   Siap menerima program lewat WiFi di 192.168.1.50
   ```

   `SW` = program sendiri yang meminta restart (ArduinoOTA, begitu selesai menulis). Perhatikan `VALID`: versi 2 **langsung sah**
   tanpa membuktikan apa pun, karena inti Arduino mengesahkan setiap program baru sebelum `setup()` berjalan. Itulah yang diubah satu
   baris `extern "C"` di Node 1 1.7.0 menjadi masa uji 60 detik (Konsep 4).

3. **Tekan EN.** Papan menyala ulang dan tetap di rak baru, karena catatan rak sudah menunjuk `app1`:

   ```text
   Versi 2, restart terakhir: POWERON
   Rak berjalan: app1 (VALID, sudah sah)
   ```

4. **Kembali ke kabel.** Pilih lagi port USB di **Tools → Port** dan unggah sketsa ini sekali lagi lewat kabel (**Upload**):
   Serial Monitor kembali menulis `Rak berjalan: app0 (UNDEFINED, dipasang lewat kabel)`, karena setiap unggah lewat kabel menulis
   ulang catatan rak. Sesudah itu buka proyek Rumah Pintar Mini (cabang `main`) dan pasang lagi Node 1 1.6.0 lewat kabel seperti biasa.

> 🔀 **Wokwi / tanpa Kit:** langkah 1 saja (apakah Wokwi meniru catatan rak belum diuji penulis); port jaringan tidak ada di Wokwi.

## Kalau tidak berjalan

| Yang terlihat | Penyebab yang paling mungkin |
| :--- | :--- |
| `Tidak ada rak sebelah: pilih Partition Scheme Minimal SPIFFS.` | skema partisi tanpa OTA; pilih **Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS)**, lalu unggah lagi lewat kabel |
| `WiFi belum tersambung. Periksa tab secrets.h.` | nama atau sandi WiFi salah, atau WiFi 5 GHz (ESP32 hanya 2,4 GHz), sama seperti Modul 10 |
| Port jaringan `rak-program` tidak muncul di **Tools → Port** | laptop dan papan tidak di WiFi yang sama, atau *firewall* laptop menghalangi pencarian papan; tunggu beberapa detik lalu buka lagi menunya (belum diuji penulis) |
| Sandi ditolak saat unggah lewat WiFi | yang berlaku adalah sandi di sketsa yang **sedang berjalan** di papan, bukan sandi baru yang baru kamu ketik |

## Dorong dari IDE (Kemenangan Cepat) vs tarik dari server (minggu ini)

| | Dorong dari IDE (ArduinoOTA) | Tarik dari server (Node 1 1.7.0) |
| :--- | :--- | :--- |
| Siapa memulai | laptop mengirim program ke papan | server memerintah lewat MQTT, papan mengunduh sendiri dari server rumahnya |
| Harus satu jaringan? | ya: Arduino IDE menemukan papan lewat mDNS di WiFi yang sama | tidak: papan di mana pun, asal bisa menjangkau servernya |
| Kunci | satu sandi ArduinoOTA, sama untuk siapa pun yang tahu | kunci per perangkat (unduhan berkunci) |
| Sidik jari berkas | MD5 yang dikirim Arduino IDE bersama programnya (hanya memastikan kirimannya utuh) | SHA-256 dari server rumah, diperiksa sebelum dipasang |
| Firmware buruk | tetap sah dan tetap dipakai | masa uji 60 detik, lalu kembali sendiri ke versi lama |
| Banyak perangkat | satu per satu dari laptop | satu perangkat *canary* dulu, lalu sisanya |
| Jejak | tidak ada | riwayat pembaruan di layar **Armada** |

## Hasil kompilasi penulis

`arduino-cli` 1.5.1, paket `esp32:esp32` 3.3.12, `--fqbn esp32:esp32:esp32:PartitionScheme=min_spiffs,FlashMode=dio --warnings all`
(= ESP32 Dev Module, Minimal SPIFFS, DIO; setelan lain bawaan), Raspberry Pi 5, 2 November 2026:

```text
Sketch uses 950907 bytes (48%) of program storage space. Maximum is 1966080 bytes.
Global variables use 51520 bytes (15%) of dynamic memory, leaving 276160 bytes for local variables. Maximum is 327680 bytes.
```

Galat 0, peringatan 0 (juga dari library). Library yang ikut dikompilasi semuanya bawaan paket esp32 3.3.12: WiFi, Network,
ArduinoOTA, ESPmDNS, Update, dan Hash. Berkas `rak-program.ino.bin` = 951.056 byte, kira-kira separuh satu rak program.

Angka di Arduino IDE-mu boleh berbeda sedikit (nama papan lengkap, sistem operasi, dan jalur folder paket ikut tersimpan di
program). Belum dicoba penulis: unggah ke papan sungguhan, port jaringan, dan Wokwi.
