# Kunci Tantangan 1 Modul 27: cuaca Modul 10 tanpa `setInsecure()`

**Tugas (ubah sedikit):** sketsa cuaca Modul 10 (`modul10_cuaca`) membuka HTTPS ke `api.open-meteo.com` dengan
`klien.setInsecure()`: amplopnya tersegel, tetapi kartu identitas server tidak diperiksa. Ganti baris itu supaya ESP32 memeriksa
identitas server seperti browser, tanpa mengubah bagian lain sketsa.

> [!NOTE]
> Kunci ini **belum dikompilasi dan belum dicoba penulis di papan**: Modul 27 tidak memasang Arduino IDE/`arduino-cli` di mesin
> penulis. Nama fungsi diambil dari kode sumber paket esp32 (Arduino-ESP32) 3.3.12, dan rantai sertifikat Open-Meteo dibaca penulis
> pada 29 Okt 2026. Coba di Wokwi atau di Node 1-mu, lalu bandingkan dengan "Yang harus terlihat" di bawah.

| Berkas kunci | Isinya |
| :--- | :--- |
| [`modul27_cuaca_aman/modul27_cuaca_aman.ino`](modul27_cuaca_aman/modul27_cuaca_aman.ino) | sketsa `modul10_cuaca` dengan satu baris diganti (dan cara B dalam komentar) |
| [`modul27_cuaca_aman/akar_isrg_x1.h`](modul27_cuaca_aman/akar_isrg_x1.h) | akar ISRG Root X1 sebagai teks C++ (hanya untuk cara B) |
| [`modul27_cuaca_aman/secrets.h`](modul27_cuaca_aman/secrets.h) | contoh nama dan sandi WiFi, sama dengan Modul 10 (isi milikmu sendiri; jangan ikut Git) |

## Jawabannya: satu baris

```cpp
  WiFiClientSecure klien;
  klien.useBuiltinCACertBundle();   // dulu: klien.setInsecure();
```

`useBuiltinCACertBundle()` memakai **bundel akar bawaan** paket esp32: daftar sekitar 150 akar tepercaya yang ikut terpasang di
firmware (seperti daftar akar di HP), termasuk **ISRG Root X1** dan **ISRG Root X2** milik Let's Encrypt. Fungsi ini baru ada sejak
paket esp32 **3.3.12**; di versi lebih lama, kompilasinya gagal karena fungsinya tidak dikenal (pakai cara B).

**Cara B: memercayai satu akar saja.** `api.open-meteo.com` dilayani dua server dengan dua rantai berbeda, tetapi rantai yang
DIKIRIM kedua server berujung di akar yang sama (diperiksa penulis 29 Okt 2026 dengan `openssl s_client -showcerts`): `open-meteo.com`
← `YR1` (Let's Encrypt, RSA) ← `Root YR` ← **`ISRG Root X1`**, dan `*.open-meteo.com` ← `YE2` (ECDSA) ← `Root YE` ← `ISRG Root X2` ←
**`ISRG Root X1`**. Jadi bagi ESP32 cukup satu akar (browser dan laptop yang juga memercayai `ISRG Root X2` berhenti di X2 untuk rantai
kedua, lihat Pemanasan langkah 4):

```cpp
#include "akar_isrg_x1.h"
// ...
  klien.setCACert(AKAR_ISRG_X1);
```

`akar_isrg_x1.h` berisi sertifikat akar itu, disalin dari daftar akar Ubuntu (`/etc/ssl/certs/ISRG_Root_X1.pem`). Sertifikat akar
adalah sertifikat PUBLIK, bukan rahasia; sebelum memakai berkas dari mana pun, cocokkan sidik SHA-256 di komentarnya dengan halaman
resmi Let's Encrypt. Kelemahan cara B: kalau suatu hari Open-Meteo pindah ke penerbit lain, sketsa ini berhenti tersambung sampai
akarnya diganti. Cara A tidak terganggu selama penerbit barunya ada di bundel.

## Yang diperiksa dan yang tidak

| | `setInsecure()` (Modul 10) | `useBuiltinCACertBundle()` / `setCACert()` (Modul 27) |
| :--- | :--- | :--- |
| Isi terenkripsi (amplop tersegel) | ya | ya |
| Rantai tanda tangan sampai akar tepercaya | tidak | ya |
| Nama di sertifikat = nama yang dihubungi (`api.open-meteo.com`) | tidak | ya |
| Tanggal berlaku | tidak | pada konfigurasi bawaan paket esp32, tanggal **tidak** diperiksa (ESP32 tidak tahu jam sebelum NTP); belum diuji penulis di papan |

Karena itu ESP32 tetap harus terhubung lewat **nama** (`https://api.open-meteo.com/…`), bukan alamat IP: sertifikat dibuat untuk nama.
Resep yang sama berlaku untuk perangkat yang langsung ke broker VPS di 8883 (Praktik 13): `WiFiClientSecure` dengan bundel atau
`setCACert`, alamat `mqtt.namaanda.my.id` (nama, bukan IP).

## Yang harus terlihat

Serial Monitor (115200) sama seperti Modul 10: `Mengirim GET ke api.open-meteo.com ...`, `Kode status: 200, dijawab dalam … ms`, lalu
suhu, lembap, dan kondisi. Untuk membuktikan pemeriksaannya sungguh bekerja, coba sekali dengan akar yang SALAH (misalnya isi `setCACert()` dengan
akar lain): permintaan harus gagal (`Gagal mengirim: …`, kode negatif), bukan tetap `200`. Teks galat persisnya belum direkam penulis.
