# 📍 Peta Pin Kanonik — Rumah Pintar Mini

🌐 **Bahasa Indonesia** · [English](../en/mini-smart-home/PIN-MAP.md)

> Dibuat di [Modul 5](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-1-esp32-embedded/modul-05-gpio-dan-peta-pin/README.md#3-anggaran-pin-dan-peta-pin-kanonik-node-1-dan-node-2), diperbarui di [Modul 6](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-1-esp32-embedded/modul-06-membaca-sensor/README.md), [Modul 7](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-1-esp32-embedded/modul-07-bus-sensor-oled-skematik/README.md), [Modul 9](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-1-esp32-embedded/modul-09-catu-daya-dan-hemat-daya/README.md), [Modul 14](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-2-konektivitas/modul-14-node-2-esp-now/README.md), dan [Modul 15](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-2-konektivitas/modul-15-modbus-rs485-dan-protokol/README.md); berlaku sampai Modul 28.
> **Sebelum menambahkan apa pun ke Node 1 atau Node 2, periksa file ini dulu.**

## Aturan

1. **Satu pin, satu tugas.** Pin yang sudah dipesan tidak dipakai untuk hal lain walaupun komponennya belum datang.
2. **Ubah peta ini hanya kalau terpaksa.** Ubah file ini dan konstanta pin di kode secara bersamaan, lalu tulis alasannya di pesan *commit*.
3. Peta ini **hanya berlaku untuk ESP32 DevKit V1 30 pin** (chip ESP32 klasik). Papan lain (ESP32-S3, C3, C6) punya aturan pin sendiri.

## Node 1 "Rumah"

ESP32 DevKit V1 pertama, di dalam rumah. Sejak Modul 9, papan ini mendapat listrik dari ***charger*-nya sendiri** lewat colokan USB papan. Papan ini tidak pernah memakai baterai dan tidak pernah tidur. Sejak Modul 15, modul MAX485 ikut terpasang supaya Node 1 bisa membaca sensor industri lewat kabel RS-485 (lihat **RS-485 di meja kerja Node 1**).

| GPIO (tulisan di papan) | Untuk | Arah | Mulai | Keadaan setelah Modul 15 | Catatan |
| :--- | :--- | :--- | :---: | :--- | :--- |
| 2 (D2) | LED status | keluar | M2 | terpasang | lewat resistor 220 Ω; sampai Modul 14 di D4, pindah ke D2 di Modul 15; LED biru bawaan papan ikut berkedip; pin *strapping*: LED ke GND aman, tetapi jangan sambungkan apa pun yang menarik D2 ke HIGH (lihat baris D4) |
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
| 21 / 22 (D21 / D22) | I2C SDA / SCL: layar OLED (alamat `0x3C`) | bus | M7 | terpasang | jalur bus di breadboard bawah (lihat **Bus di breadboard**); layar diberi 3,3 V dari rel bawah; BME280 hanya latihan dan pindah ke Node 2; alamat `0x40` dipesan untuk **INA219**, alat ukur arus sementara (Modul 9), yang dipasang di lubang BME280 hanya saat mengukur |
| 18 / 19 / 23 / 5 (D18 / D19 / D23 / D5) | microSD SCK / MISO / MOSI / CS | bus SPI | M7 | opsional | pasang menurut tabel **Bus di breadboard**; mencatat `node1.csv`; modul beregulator: tekan EN setelah MB102 menyala supaya kartu terbaca; D5 pin *strapping* (HIGH saat menyala), aman sebagai CS keluaran; boleh dilepas setelah Modul 11 |
| 16 / 17 (RX2 / TX2) | RS-485 RO / DI (MAX485) | bus UART | M15 | terpasang | `Serial2` 9600 baud 8N1, pin **wajib** ditulis di `Serial2.begin()` (tanpa pin, paket esp32 3.x memakai GPIO 4 dan 25); RO modul 5 V lewat pembagi tegangan 4,7 kΩ + 10 kΩ (5 V → sekitar 3,4 V), DI langsung |
| 4 (D4) | RS-485 DE dan RE (disatukan) | keluar | M15 | terpasang | HIGH = bicara, LOW = dengar; bukan pin *strapping* (modul MAX485 biru menarik DE dan RE ke 5 V lewat 10 kΩ: di D2, unggahan program bisa gagal, jadi D2 diberikan ke LED status) |

## Node 2 "Kebun"

ESP32 DevKit V1 kedua, dari baterai. Kerangkanya (DS18B20 dan LED "bangun") dipasang di Modul 9; BME280, sensor tanah ke-2, dan ESP-NOW ke Node 1 ditambahkan di Modul 14. Papan ini tidak pernah tersambung ke router: ia hanya mengirim paket ke Node 1.

| GPIO | Untuk | Mulai | Keadaan setelah Modul 14 | Catatan |
| :--- | :--- | :---: | :--- | :--- |
| 27 | DS18B20 (1-Wire) | M9 | terpasang | modul adaptor (resistor 4,7 kΩ ke 3V3 sudah ada di modul); sejak Modul 14, VCC dan GND-nya diambil dari rel bawah breadboard mini (lihat **Sensor Node 2**), DAT tetap langsung ke kaki D27; resolusi 10 bit |
| 2 | LED biru bawaan: tanda "sedang bangun" | M9 | terpasang | menyala selama papan bangun, padam selama tidur |
| 21 / 22 | I2C SDA / SCL: BME280 (alamat `0x76` atau `0x77`) | M14 | terpasang | VIN dari rel bawah (+) 3,3 V; dibaca dalam mode *forced* (sekali ukur, lalu sensor tidur sendiri) |
| 39 (VN) | Sensor tanah ke-2: AOUT | M14 | terpasang | ADC1; pin sama dengan Node 1, jadi kodenya bisa dipakai ulang; kalibrasi dua titik diulang dengan listrik dari D32 |
| 32 (D32) | Sensor tanah ke-2: VCC | M14 | terpasang | keluaran HIGH **hanya selama bangun** (sensor menyedot sekitar 5 mA); **jangan** ke 3V3 karena sensor akan menyala terus selama Node 2 tidur |
| 16 / 17 / 4 | RS-485 untuk lab Modul 15 (papan Node 2 dipinjam sebagai "sensor tanah RS-485" tiruan) | M15 | selesai | hanya selama lab, dengan sketsa lab tersendiri; MAX485 diberi listrik dari pin VIN papan yang dicolokkan ke USB; sesudah lab, MAX485 dilepas dan firmware Node 2 diunggah ulang |
| 36 (VP) | Tegangan baterai | M14 | opsional | pembagi tegangan 2 × 100 kΩ dari OUT+ ke OUT− TP4056, titik tengah ke VP, kapasitor 100 nF dari VP ke GND (bedah teknis Modul 14) |

## Rangkaian baterai Node 2 (sejak Modul 9)

Dirakit di breadboard mini 400 titik. **Rel atas (−)** = GND, **rel atas (+)** = 5,0 V dari MT3608.

| Bagian | Sambungan | Catatan |
| :--- | :--- | :--- |
| Dudukan 18650 | kabel hitam → 3e, kabel merah → 6d | baterai dimasukkan **terakhir**; selama baterai terpasang, kolom 3 dan 6 tidak dipakai untuk kabel lain, kecuali sebentar untuk kabel ukur multimeter |
| TP4056 (6 bantalan, dengan proteksi) | B− → 3c, B+ → 6c; OUT+ → 12d, OUT− → rel atas (−); IN+/IN− tidak dipakai | diisi lewat colokan USB-nya dengan *charger* HP; beban **selalu** dari OUT+/OUT− |
| MT3608 | VIN+ → 12b, VIN− → rel atas (−); VOUT+ → rel atas (+), VOUT− → rel atas (−) | diatur ke **5,0 V** dengan multimeter **tanpa beban**, sebelum papan disambung |
| Kapasitor 100 µF | kaki (+) → rel atas (+), kaki (−) → rel atas (−) | dipasang **sesudah** MT3608 diatur |
| Papan Node 2 | VIN → rel atas (+) kolom 29; GND (deretan kiri, di atas VIN) → rel atas (−) kolom 28 | saat mengukur arus: VIN lewat INA219 (VIN+ dari rel atas (+) kolom 29, VIN− ke 27a, VIN papan ke 27e), dan rel atas (−) breadboard mini (bukan rel bawahnya) disatukan dengan rel bawah (−) meja kerja Node 1 kolom 30 lewat kabel jantan–jantan hitam |

## Sensor Node 2 (sejak Modul 14)

Sensor tidak ditancapkan ke breadboard: kakinya disambung kabel. Yang dipakai dari breadboard mini hanya **rel bawah**: **rel bawah (+) = 3,3 V** dari pin 3V3 papan, **rel bawah (−) = GND**. Tempel label "3V3" di rel bawah supaya tidak tertukar dengan rel atas (+), yang berisi 5,0 V dari MT3608.

| Bagian | Sambungan | Kabel |
| :--- | :--- | :--- |
| Rel bawah | 3V3 papan (deretan kanan, paling bawah) → rel bawah (+) kolom 29; GND papan (deretan kanan, di atas 3V3) → rel bawah (−) kolom 28 | jantan–betina, oranye dan hitam |
| BME280 | VIN → rel bawah (+) kolom 15, GND → rel bawah (−) kolom 16, SCL → D22, SDA → D21 | VIN dan GND jantan–betina; SCL (kuning) dan SDA (biru) betina–betina |
| Adaptor DS18B20 | VCC → rel bawah (+) kolom 24, GND → rel bawah (−) kolom 27, DAT → D27 | VCC dan GND jantan–betina; DAT (ungu) betina–betina |
| Sensor tanah ke-2 | ujung betina kabelnya: VCC langsung ke kaki D32, AOUT langsung ke kaki VN; GND lewat jumper jantan–jantan hitam ke rel bawah (−) kolom 21 | ikuti tulisan di papan sensor (GND, VCC, AOUT), bukan warna kabelnya |

**Selama hidup dari baterai, USB papan Node 2 dicabut**, dan **pin 3V3-nya tidak pernah diberi tegangan baterai**. Mau mengunggah program? Cabut dulu kabel VIN dan GND-nya.

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
| **Rel atas** (breadboard atas) | 5 V dari MB102, jumper sisi rel atas di **5V** | beban: relay, kipas, pompa, servo; sensor 5 V: PIR dan HC-SR04; modul microSD beregulator (opsional) |
| **Rel tengah** (strip rel bawah breadboard atas) | tidak dipakai, jumper sisi rel tengah di **OFF** | — |
| **Rel bawah** (breadboard bawah) | 3,3 V dari pin 3V3 ESP32 | sensor 3,3 V: LDR, sensor tanah, DHT22; layar OLED (sejak Modul 7); modul microSD 3,3 V saja (opsional) |

Semua GND disatukan oleh dua kabel hitam dari kedua pin GND papan (kolom 5): satu dari 5f ke rel atas (−), satu lagi dari 5e ke rel bawah (−).

## Bus di breadboard (sejak Modul 7)

Satu bus = satu jalur lubang yang dipakai bersama. Perangkat baru di bus yang sama cukup ditancapkan ke lubang kosong di jalur itu.

| Bus | Kabel jembatan (jantan–jantan) | Jalur bersama | Yang sudah tersambung |
| :--- | :--- | :--- | :--- |
| I2C SDA (D21) | biru, dari 14d ke 20f | kolom 20, baris f–j | layar OLED: SDA di 20j |
| I2C SCL (D22) | kuning, dari 17e ke 19f | kolom 19, baris f–j | layar OLED: SCL di 19j |
| SPI (opsional) | — | jalur kaki ESP32 masing-masing, baris e | microSD: CS 11e, SCK 12e, MISO 13e, MOSI 18e |

Layar OLED: GND ke rel bawah (−) kolom 17, VCC ke rel bawah (+) kolom 18. Modul microSD: GND ke rel bawah (−) kolom 21; VCC modul beregulator ke rel atas (+) kolom 22 (5 V), modul 3,3 V saja ke rel bawah (+) kolom 21. Modul beregulator baru terbaca kalau MB102 sudah menyala saat program mencari kartu, jadi setelah menyalakan MB102, tekan **EN**. **Kolom 8 baris f–j adalah jalur katoda LED status (GND)** sejak Modul 15 (sebelumnya kolom 9), jadi jangan dipakai untuk kabel data.

## RS-485 di meja kerja Node 1 (sejak Modul 15)

Semua lubang ada di **breadboard bawah**, kecuali ujung kabel VCC modul yang masuk rel atas (+) breadboard atas. Modul MAX485 tidak ditancapkan ke breadboard: kaki-kakinya disambung kabel jantan–betina. Kolom 8 baris a–e (jalur D4) sekaligus menyatukan DE dan RE.

| Bagian | Sambungan | Catatan |
| :--- | :--- | :--- |
| LED status (dipindah) | resistor 220 Ω 7e → 7g; LED kaki panjang 7i, kaki pendek 8i; kabel hitam 8j → rel bawah (−) kolom 8 | 7e = jalur D2 |
| Pembagi tegangan RO | resistor 4,7 kΩ 9e → 9g (menyeberangi parit tengah); resistor 10 kΩ 9c → 5c | 9e dan 9c = jalur RX2, 5c = jalur GND; titik tengahnya jalur RX2 |
| Modul MAX485: RO, DE, RE, DI | RO → 9i; DE → 8e; RE → 8d; DI → 10e | 10e = jalur TX2; 8c (di bawah badan resistor 10 kΩ) dibiarkan kosong |
| Modul MAX485: VCC, GND | VCC → rel atas (+) kolom 3 (5 V dari MB102); GND → rel bawah (−) kolom 14 | **jangan** 3,3 V |
| Kabel bus | A ke A, B ke B; kawat ketiga GND dari rel bawah (−) kolom 15 ke GND perangkat di ujung lain | uji lulus: kabel UTP ≥ 5 m (sepasang kawat terpilin untuk A/B) |

Resistor 120 Ω di modul (R7, terminator) dibiarkan: dua modul di dua ujung kabel = tepat dua terminator.

## Aturan emas catu daya

1. **Beban** (relay, kipas, pompa, servo) **selalu dari MB102**, tidak pernah dari pin VIN atau 3V3 ESP32.
2. **ESP32 Node 1 dari *charger*-nya sendiri** lewat colokan USB papan (sejak Modul 9). Laptop hanya untuk mengunggah program dan membaca Serial Monitor.
3. **GND disatukan.**
4. **Rel 5 V MB102 tidak pernah disambung ke pin 3V3 ESP32**, dan tidak ke pin VIN selama kabel USB (dari laptop atau *charger*) tercolok.
5. **Urutan nyala-mati:** colokkan USB (laptop atau *charger*) dulu, baru nyalakan MB102; matikan MB102 dulu, baru cabut USB. Kalau MB102 menyala sementara ESP32 belum bertenaga, listrik modul relay bisa merembes ke ESP32 lewat kabel IN.

## Riwayat

| Versi | Modul | Perubahan |
| :---: | :---: | :--- |
| 1 | 5 | Peta pin pertama. Aktuator Node 1 terpasang; sensor, bus, dan RS-485 dipesan. |
| 2 | 6 | Kelima sensor Node 1 terpasang (DHT22, LDR, sensor tanah kapasitif, PIR, HC-SR04); sensor 5 V di rel atas, sensor 3,3 V di rel bawah. |
| 3 | 7 | Bus I2C terpasang (layar OLED di `0x3C`, jalur bus di kolom 19 dan 20, daya dari rel bawah); microSD opsional; latihan DS18B20 di GPIO 16 selesai; tabel **Bus di breadboard**. |
| 4 | 9 | Node 1 mendapat listrik dari *charger*-nya sendiri (aturan emas nomor 2, 4, dan 5). Kerangka Node 2 terpasang: DS18B20 di GPIO 27 dan LED "bangun" di GPIO 2. Bagian baru **Rangkaian baterai Node 2**. Alamat I2C `0x40` dipesan untuk INA219, alat ukur sementara. |
| 5 | 14 | Node 2 lengkap: BME280 di I2C (D21/D22), sensor tanah ke-2 di VN dengan VCC dari **D32** (padam selama tidur), DS18B20 pindah ke rel bawah breadboard mini; VP opsional untuk tegangan baterai. Bagian baru **Sensor Node 2**. Node 1 tidak berubah. |
| 6 | 15 | RS-485 terpasang di Node 1: RX2/TX2 (16/17) dan **DE/RE di D4**; LED status pindah dari D4 ke **D2** (modul MAX485 menarik DE/RE ke 5 V sehingga D2 sebagai DE/RE bisa menggagalkan unggahan). Lab papan kedua memakai 16/17/4. Bagian baru **RS-485 di meja kerja Node 1**. |

---

[⬅️ Kembali ke folder proyek](README.md) · [Modul 5](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-1-esp32-embedded/modul-05-gpio-dan-peta-pin/README.md) · [Modul 7](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-1-esp32-embedded/modul-07-bus-sensor-oled-skematik/README.md) · [Modul 9](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-1-esp32-embedded/modul-09-catu-daya-dan-hemat-daya/README.md) · [Modul 14](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-2-konektivitas/modul-14-node-2-esp-now/README.md) · [Modul 15](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-2-konektivitas/modul-15-modbus-rs485-dan-protokol/README.md) · [Silabus](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/SILABUS.md)
