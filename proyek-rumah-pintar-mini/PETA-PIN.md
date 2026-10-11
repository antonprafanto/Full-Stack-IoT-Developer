# 📍 Peta Pin Kanonik — Rumah Pintar Mini

> Dibuat di [Modul 5](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-1-esp32-embedded/modul-05-gpio-dan-peta-pin/README.md#3-anggaran-pin-dan-peta-pin-kanonik-node-1-dan-node-2), diperbarui di [Modul 6](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-1-esp32-embedded/modul-06-membaca-sensor/README.md), dan berlaku sampai Modul 28.
> **Sebelum menambahkan apa pun ke Node 1 atau Node 2, periksa file ini dulu.**

## Aturan

1. **Satu pin, satu tugas.** Pin yang sudah dipesan tidak dipakai untuk hal lain walaupun komponennya belum datang.
2. **Ubah peta ini hanya kalau terpaksa.** Ubah file ini dan konstanta pin di kode secara bersamaan, lalu tulis alasannya di pesan *commit*.
3. Peta ini **hanya berlaku untuk ESP32 DevKit V1 30 pin** (chip ESP32 klasik). Papan lain (ESP32-S3, C3, C6) punya aturan pin sendiri.

## Node 1 "Rumah"

ESP32 DevKit V1 pertama, di dalam rumah, tidak pernah memakai baterai.

| GPIO (tulisan di papan) | Untuk | Arah | Mulai | Keadaan setelah Modul 6 | Catatan |
| :--- | :--- | :--- | :---: | :--- | :--- |
| 4 (D4) | LED status | keluar | M2 | terpasang | lewat resistor 220 Ω |
| 13 (D13) | Tombol manual | masuk | M5 | terpasang | `INPUT_PULLUP`; kaki seberang ke GND |
| 32 (D32) | Relay lampu (IN1) | keluar | M5 | terpasang | relay aktif LOW |
| 33 (D33) | Relay kipas (IN2) | keluar | M5 | terpasang | relay aktif LOW |
| 25 (D25) | Pompa (gerbang MOSFET) | keluar | M5 | terpasang | 220 Ω seri + 10 kΩ ke GND |
| 26 (D26) | Servo tirai | keluar (PWM) | M5 | terpasang | daya servo dari MB102 |
| 27 (D27) | Buzzer pasif | keluar (PWM) | M5 | terpasang | lewat resistor 220 Ω |
| 14 (D14) | DHT22 | dua arah | M6 | terpasang | modul 3 kaki (*pull-up* sudah ada di modul), daya 3,3 V dari rel bawah |
| 36 (VP) | LDR | masuk analog | M6 | terpasang | ADC1; pembagi tegangan: 10 kΩ ke 3,3 V, LDR ke GND; kapasitor 100 nF ke GND |
| 39 (VN) | Sensor tanah kapasitif | masuk analog | M6 | terpasang (menggantikan potensiometer latihan Modul 5) | ADC1; daya 3,3 V dari rel bawah |
| 34 (D34) | PIR | masuk | M6 | terpasang | PIR diberi 5 V dari rel atas; kaki OUT-nya hanya 3,3 V, jadi langsung ke pin |
| 35 (D35) | HC-SR04 ECHO | masuk | M6 | terpasang | lewat pembagi tegangan 4,7 kΩ + 10 kΩ (5 V → ±3,4 V) |
| 15 (D15) | HC-SR04 TRIG | keluar | M6 | terpasang | pin *strapping*, aman untuk keluaran; HC-SR04 diberi 5 V dari rel atas |
| 21 / 22 (D21 / D22) | I2C SDA / SCL: OLED, latihan BME280 | bus | M7 | dipesan | |
| 18 / 19 / 23 / 5 | microSD SCK / MISO / MOSI / CS | bus SPI | M7 | dipesan | opsional; boleh dilepas setelah Modul 11 |
| 16 / 17 (RX2 / TX2) | RS-485 RO / DI (MAX485) | bus UART | M15 | dipesan | GPIO 16 dipinjam sementara untuk latihan DS18B20 di Modul 7; keluaran RO modul MAX485 yang diberi 5 V diturunkan dulu ke 3,3 V (Modul 15) |
| 2 (D2) | RS-485 DE/RE + LED biru bawaan | keluar | M15 | dipesan | pin *strapping*; LED biru ikut menyala saat mengirim |

## Node 2 "Kebun"

ESP32 DevKit V1 kedua, dari baterai, dirakit di Modul 14.

| GPIO | Untuk | Mulai | Catatan |
| :--- | :--- | :---: | :--- |
| 21 / 22 | I2C: BME280 | M14 | |
| 27 | DS18B20 (1-Wire) | M14 | resistor 4,7 kΩ ke 3V3 |
| 39 (VN) | Sensor tanah ke-2 | M14 | pin sama dengan Node 1, jadi kodenya bisa dipakai ulang |
| 2 | LED biru bawaan: tanda "sedang bangun" | M14 | |
| 16 / 17 / 2 | RS-485 untuk lab Modul 15 | M15 | hanya selama lab, dengan sketsa lab tersendiri; MAX485 dilepas lagi setelahnya karena GPIO 2 juga LED "bangun" |
| 36 (VP) | Cadangan, misalnya tegangan baterai | — | opsional |

Baterai Node 2 masuk lewat pin VIN (rangkaian Modul 9), bukan lewat GPIO.

## Pin yang dihindari

| GPIO | Alasan |
| :--- | :--- |
| 12 (D12) | Pin *strapping* penentu tegangan memori *flash*. Kalau tertarik HIGH saat papan menyala, papan gagal *boot*. |
| 1 dan 3 (TX0, RX0) | Jalur USB ke laptop: dipakai saat program sedang diunggah dan oleh Serial Monitor. |
| 6–11 | Dipakai memori *flash*. Tidak dikeluarkan di papan 30 pin; di papan 38 pin tertulis `D0`–`D3` (atau `SD0`–`SD3`), `CMD`, `CLK`. Awas: tulisan `D2` atau `SD2` di papan 38 pin adalah GPIO 9, bukan GPIO 2. |
| 0 | Tombol **BOOT** (penentu mode unduh). Tidak dikeluarkan di papan 30 pin. |
| 34–39 untuk tombol atau keluaran | Hanya masukan dan tanpa *pull-up* internal. |
| 36 dan 39 untuk masukan digital ber-*interrupt* | Catatan *ESP32 Series SoC Errata*: masukannya sesaat tertarik ke bawah saat ADC atau WiFi aktif. Karena itu, PIR dan ECHO dipasang di 34/35. |

## Rel daya di meja kerja (sejak Modul 5)

| Rel | Isi | Untuk |
| :--- | :--- | :--- |
| **Rel atas** (breadboard atas) | 5 V dari MB102, jumper sisi rel atas di **5V** | beban: relay, kipas, pompa, servo; sensor 5 V: PIR dan HC-SR04 |
| **Rel tengah** (strip rel bawah breadboard atas) | tidak dipakai, jumper sisi rel tengah di **OFF** | — |
| **Rel bawah** (breadboard bawah) | 3,3 V dari pin 3V3 ESP32 | sensor 3,3 V: LDR, sensor tanah, DHT22 |

Semua GND disatukan oleh dua kabel hitam dari kedua pin GND papan (kolom 5): satu dari 5f ke rel atas (−), satu lagi dari 5e ke rel bawah (−).

## Aturan emas catu daya

1. **Beban** (relay, kipas, pompa, servo) **selalu dari MB102**, tidak pernah dari pin VIN atau 3V3 ESP32.
2. **ESP32 dari USB laptop** (mulai Modul 9: dari adaptor sendiri).
3. **GND disatukan.**
4. **Rel 5 V MB102 tidak pernah disambung ke pin 3V3 ESP32**, dan tidak ke pin VIN selama kabel USB laptop tercolok.
5. **Urutan nyala-mati:** colokkan USB laptop dulu, baru nyalakan MB102; matikan MB102 dulu, baru cabut USB. Kalau MB102 menyala sementara ESP32 belum bertenaga, listrik modul relay bisa merembes ke ESP32 lewat kabel IN.

## Riwayat

| Versi | Modul | Perubahan |
| :---: | :---: | :--- |
| 1 | 5 | Peta pin pertama. Aktuator Node 1 terpasang; sensor, bus, dan RS-485 dipesan. |
| 2 | 6 | Kelima sensor Node 1 terpasang (DHT22, LDR, sensor tanah kapasitif, PIR, HC-SR04); sensor 5 V di rel atas, sensor 3,3 V di rel bawah. |

---

[⬅️ Kembali ke folder proyek](README.md) · [Modul 5](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-1-esp32-embedded/modul-05-gpio-dan-peta-pin/README.md) · [Silabus](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/SILABUS.md)
