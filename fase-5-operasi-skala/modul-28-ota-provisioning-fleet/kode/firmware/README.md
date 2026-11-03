# 🔌 Firmware — Rumah Pintar Mini

🌐 **Bahasa Indonesia** · [English](../../../../en/phase-5-operations-scale/module-28-ota-provisioning-fleet/code/firmware/README.md)

Folder ini berisi firmware kedua papan ESP32 proyek **Rumah Pintar Mini**:

| Folder | Papan | Versi | Terakhir berubah |
| :--- | :--- | :---: | :--- |
| [`node-1-rumah/`](node-1-rumah/) | Node 1 "Rumah" (ESP32 DevKit V1, listrik dari *charger*) | **1.7.0** | Modul 28: pembaruan lewat udara (OTA), rollback otomatis, kode klaim |
| [`node-2-kebun/`](node-2-kebun/) | Node 2 "Kebun" (ESP32 DevKit V1, baterai, ESP-NOW) | 1.0.0 | Modul 14 (tidak berubah di Modul 28) |

> [!WARNING]
> **Status 1.7.0: sudah dikompilasi, BELUM dijalankan di papan sungguhan.** Pada 2 November 2026 penulis mengompilasi Node 1 1.7.0 dan
> kedua versi latihannya (1.7.1 dan 1.7.2-uji) dengan `arduino-cli` 1.5.1, paket esp32 3.3.12, dan library di daftar bawah (versi persis),
> untuk papan **ESP32 Dev Module** dengan **Minimal SPIFFS** dan **Flash Mode DIO** (setelan Modul 10): tanpa galat, dan tanpa satu pun
> peringatan dari berkas `node-1-rumah` (peringatan yang muncul berasal dari library WiFiManager, ESP32Servo, dan ModbusMaster, sama seperti
> 1.6.0). Hasilnya: `Sketch uses 1410887 bytes (71%)`, `Global variables use 58396 bytes (17%)`, dan berkas `node-1-rumah.ino.bin`
> 1.411.040 byte (71,8 % rak program, sisa 555.040 byte). Daftar fungsi di berkas hasil kompilasi (`nm`) memastikan baris
> `extern "C" bool verifyRollbackLater()` di `masa-uji.cpp` benar-benar menggantikan fungsi bawaan inti Arduino (simbol `T`, bukan `W`),
> jadi rollback aktif. Logika pembaruan, masa uji, dan rollback juga diuji di laptop dengan tiruan. Yang **belum**: menjalankan firmware ini
> di papan ESP32 sungguhan (unggah lewat kabel, pembaruan 1.7.1 lewat udara, rollback 1.7.2-uji, kode klaim), karena penulis tidak punya
> papan di meja. Catatan ini diperbarui sesudah uji di papan.

## Yang dibutuhkan Node 1 1.7.0

- **Arduino IDE 2.3.10** dengan paket papan **esp32 versi 3.3.12** (bukan 3.3.11 ke bawah: `setSHA256sum()` dan `useBuiltinCACertBundle()`
  baru ada di 3.3.12; bukan 4.0.0-RC1, yang masih pra-rilis).
- Papan **ESP32 Dev Module**, **Tools → Partition Scheme → Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS)**, dan
  **Tools → Flash Mode → DIO** (sama dengan Modul 10): dua rak program, masing-masing 1.966.080 byte. Skema tanpa OTA (**No OTA**,
  **Huge APP**) hanya punya satu rak: perintah pembaruan tetap diterima (`ack` `ok:true`), lalu pembaruan berakhir `gagal`
  (`Update error: Partition Could Not be Found (Update 10)`; dari kode dan sumber paket esp32, belum dijalankan penulis).
- Library (Library Manager): ESP32Servo 3.2.1, DHT sensor library 1.4.7, Adafruit SSD1306 2.5.17, WiFiManager 2.0.17, ArduinoJson 7.4.3,
  **PubSubClient3** 3.3.2, ModbusMaster 2.0.1, ditambah tiga library pendukung yang ikut terpasang bersama DHT dan SSD1306 (versi yang
  dipakai penulis: Adafruit Unified Sensor 1.1.15, Adafruit GFX Library 1.12.6, Adafruit BusIO 1.17.4). HTTPUpdate, HTTPClient,
  NetworkClientSecure, Update, Preferences, dan WiFi sudah ikut paket esp32.
- **Server lebih dulu.** Pasang backend 1.5.0 (kontrak data 1.6) sebelum Node 1 1.7.0: backend lama menolak `vitals` baru yang membawa
  `reset_reason`, `fw`, dan `ota`.

## Baru di Node 1 1.7.0

| Hal | Ringkasnya | Berkas |
| :--- | :--- | :--- |
| Pembaruan lewat udara | Perintah MQTT `update` (tombol **Perbarui** di `/armada`) → `ack` `ok:true` = **diterima** → status `offline-mode` + putus rapi → unduh `<alamat server>/fw/node-1/<versi>.bin` dengan kunci perangkat → sidik SHA-256 diperiksa → menyala ulang ke rak sebelah. Gagal = firmware lama tetap jalan, laporan `gagal` | `pembaruan.cpp` |
| Hanya dari server rumah | Node 1 hanya mau mengunduh dari alamat server yang **tersimpan di Node 1 sendiri** (portal WiFi, Serial `server`, atau klaim). Perintah dengan alamat lain ditolak (`url bukan server rumah ini`) sebelum kunci dikirim ke mana pun | `periksa-ota.cpp` |
| Masa uji 60 detik dan rollback | Firmware baru sah bila dalam 60 detik sejak menyala ia tersambung ke broker, menerbitkan `online`, dan berlangganan `cmd`. Kalau tidak, Node 1 **kembali sendiri** ke firmware lama. Menyala ulang di tengah masa uji (listrik padam, `restart`, program mogok) juga membatalkan firmware baru | `masa-uji.cpp` |
| Laporan hasil | `vitals` membawa `reset_reason`, `fw`, dan laporan `ota` (`berhasil`, `rollback`, atau `gagal`), diulang di paling banyak 3 `vitals` | `pembaruan.cpp`, `jaringan.cpp` |
| Kode klaim | Papan baru mendaftar dengan kode `XXXX-XXXX` dari admin (kolom **Kode klaim** di portal WiFi, atau Serial `klaim <kode>`), tanpa mengetik kunci | `klaim.cpp` |
| Portal WiFi | Tiga kolom baru: **Kode klaim** (tidak disimpan), **Alamat server**, **Alamat broker**. Portal bersandi bila `SANDI_PORTAL` ditulis di `kunci.h`. Portal tidak dibuka selama masa uji | `jaringan.cpp` |
| Jeda `vitals` dari jauh | `config` boleh membawa `"jeda":{"vitals_s":60}` (60–3600 detik, bawaan 300). `telemetry` tetap setiap 10 detik | `jaringan.cpp`, `pengaturan.cpp` |
| Berhenti sengaja | Sebelum pembaruan, perintah Serial `restart`, dan `wifi lupa`: status `offline-mode` lalu putus rapi (broker tidak menerbitkan wasiat `offline`) | `jaringan.cpp`, `pembaruan.cpp` |

Perintah Serial Monitor baru: `ota` (versi, rak program, masa uji, laporan), `server`, `server <alamat>`, `broker`, `broker <ip>`, `klaim`,
`klaim <kode> [alamat server] [alamat broker]`. Contoh: `klaim 7K2M-QF9D https://iot.namaanda.my.id 192.168.1.37`.

> [!IMPORTANT]
> **Baris yang menyalakan rollback** ada di `masa-uji.cpp`: `extern "C" bool verifyRollbackLater() { return true; }`. Tanpa baris itu, atau
> tanpa tulisan `extern "C"`, firmware tetap terkompilasi tanpa peringatan apa pun, tetapi rollback **tidak pernah** terjadi: inti Arduino
> langsung mengesahkan setiap firmware baru sebelum `setup()`. Jangan hapus atau ubah baris itu.

## Membuat berkas firmware untuk server

1. Naikkan `VERSI_FIRMWARE` di `konfigurasi.h`. Server menolak versi yang sudah pernah diunggah, dan perangkat menolak versi yang sama dengan
   yang sedang berjalan. Turun versi (centang **paksa** di server) boleh, tetapi tidak di bawah 1.7.0: firmware lama tidak punya masa uji
   dan rollback, jadi perangkat menjawab `versi di bawah 1.7.0 tidak punya rollback: pasang lewat kabel`.
2. Di Arduino IDE: **Sketch → Export Compiled Binary**. Berkas muncul di folder `build/` sketsa (misalnya
   `build/esp32.esp32.esp32/node-1-rumah.ino.bin`).
3. Unggah **`node-1-rumah.ino.bin`** di `/armada` (**Unggah firmware**). Bukan `.merged.bin` (4 MB, diawali bait `0xFF`, pasti ditolak) dan
   bukan `.bootloader.bin` atau `.partitions.bin`.

Berkas `.bin` dan folder `build/` dijaga `.gitignore`: **jangan pernah** di-*commit* atau dibagikan. Kunci broker Node 1 tidak ada di berkas
itu (kunci tersimpan di NVS papan), tetapi isi `kunci.h` ikut terkompilasi di dalamnya: kunci ESP-NOW (Modul 14, bila
`PAKAI_ENKRIPSI = true`) dan sandi portal `SANDI_PORTAL` (bila ditulis).

Ukuran rak program: 1.966.080 byte. Node 1 1.6.0 = 1.194.232 byte (60 %, Modul 21). Node 1 1.7.0 (dengan HTTPS dan daftar sertifikat akar
bawaan) = **1.410.887 byte (71 %)** menurut `Sketch uses` di mesin penulis (setelan Modul 10: Minimal SPIFFS, Flash Mode DIO), dan berkas
`.bin`-nya 1.411.040 byte: sisa rak masih sekitar 555 ribu byte. Angka di Arduino IDE-mu boleh berbeda beberapa ratus byte, karena nama
papan lengkap, sistem operasi, dan jalur folder paket esp32 ikut tersimpan di dalam firmware (di mesin penulis, 1.6.0 dengan setelan yang
sama tercatat 1.193.864 byte, 368 byte lebih kecil daripada catatan Modul 21).

## Latihan Modul 28: 1.7.1 lewat udara, lalu 1.7.2-uji (rollback)

Kedua versi latihan dibuat dari 1.7.0 **hanya dengan mengubah konstanta** di `konfigurasi.h`:

| Versi | Ubah di `konfigurasi.h` | Dipasang | Yang diharapkan |
| :---: | :--- | :--- | :--- |
| 1.7.0 | (apa adanya) | **lewat kabel**, terakhir kalinya | Serial: `Node 1 Rumah - firmware 1.7.0 (dipasang lewat kabel)` |
| 1.7.1 | `VERSI_FIRMWARE[] = "1.7.1"`, `CATATAN_VERSI[] = "dipasang lewat udara"` | tombol **Perbarui** di `/armada` | sah dalam 60 detik, `/armada` menampilkan `fw` 1.7.1 |
| 1.7.2-uji | `VERSI_FIRMWARE[] = "1.7.2"`, `CATATAN_VERSI[] = "rilis UJI rollback"`, `UJI_KUNCI_SALAH = 1` | unggah dengan centang **uji**, lalu **Perbarui** satu perangkat | broker menolak kuncinya, 60 detik lewat, Node 1 kembali ke 1.7.1 dan melaporkan `rollback` |

```diff
-const char VERSI_FIRMWARE[] = "1.7.0";
-const char CATATAN_VERSI[] = "dipasang lewat kabel";  // Modul 28: kalimat pendek di Serial saat menyala, boleh diganti
+const char VERSI_FIRMWARE[] = "1.7.2";
+const char CATATAN_VERSI[] = "rilis UJI rollback";  // Modul 28: kalimat pendek di Serial saat menyala, boleh diganti
 ...
-const int UJI_KUNCI_SALAH = 0;
+const int UJI_KUNCI_SALAH = 1;
```

`UJI_KUNCI_SALAH = 1` merusak kunci broker **di RAM saja**: NVS tidak disentuh, jadi firmware lama yang kembali memakai kunci aslinya lagi.
Sesudah latihan, **kembalikan ke 0** dan `VERSI_FIRMWARE` ke versi rilis berikutnya (misalnya 1.7.3). Versi `1.7.2` (tanpa akhiran `-uji`:
kontrak data hanya menerima x.y.z) sudah terpakai oleh rilis uji di server, jadi rilis normal berikutnya memakai nomor baru.

## Sandi portal WiFi (pilihan, disarankan untuk Node 1 di dalam kotak)

Di `kunci.h` (berkas rahasia Modul 14, dijaga `.gitignore`), tambahkan satu baris, lalu tulis sandi yang sama di label kotak Node 1:

```cpp
#define SANDI_PORTAL "sandi-8-sampai-63-huruf"
```

Tanpa baris itu, portal terbuka tanpa sandi seperti di Modul 10, dan Serial Monitor memperingatkan bahwa halaman `192.168.4.1/update` bisa
dibuka siapa pun di dekat Node 1 selama portal terbuka. Sandi kurang dari 8 atau lebih dari 63 huruf menghentikan kompilasi dengan pesan yang
jelas (aturan sandi WiFi WPA2).

## Batasan yang diketahui

- Selama firmware diunduh (sekitar setengah sampai satu menit), `loop()` berhenti: pompa dan buzzer dipadamkan dulu, lampu, kipas, dan tirai
  tetap pada keadaan terakhirnya, dan pengaman lokal (kipas mode offline, siram otomatis) tidak berjalan. Paket ESP-NOW Node 2 yang datang
  saat itu bisa terlewat.
- Watchdog dilonggarkan menjadi 60 detik selama mengunduh atau menukar kode klaim, lalu dikembalikan ke 5 detik. Server yang diam 8 detik
  sebelum menjawab = `gagal` (`-11`) tanpa menyala ulang. Data yang berhenti **di tengah** berkas: lewat `https://` library menyerah sendiri
  sesudah ±30 detik (`gagal`, `Update 6`, tanpa menyala ulang); lewat `http://` (jaringan rumah) watchdog 60 detik yang me-restart Node 1.
  Di kedua jalur rak lama tetap utuh; jalur `http://` melapor `gagal: menyala ulang saat mengunduh (WDT)` dengan `reset_reason` `WDT`.
- Firmware baru yang macet di `setup()` (misalnya menunggu sensor selamanya) tetap di-rollback: selama masa uji, watchdog 75 detik sudah
  mengawasi `setup()`.
- Router yang mati saat masa uji: penjaga WiFi mencoba lagi setiap 10 detik (biasanya 60 detik). Router yang belum menyala dalam 60 detik =
  firmware baru di-rollback walaupun sebenarnya baik: ulangi **Perbarui** sesudah router menyala.
- Perintah yang tiba tepat saat Node 1 berhenti sengaja (±0,3 detik) tidak dikerjakan dan dijawab `ok:false`
  (`Node 1 sedang berhenti sengaja: kirim lagi sesudah online`).
- Menyala ulang di tengah masa uji (listrik padam, perintah `restart`, *brownout*) selalu membatalkan firmware baru, walaupun firmware itu
  sebenarnya baik. Pasang pembaruan saat listrik stabil.
- Node 2 tidak diperbarui lewat udara: tetap lewat kabel.
