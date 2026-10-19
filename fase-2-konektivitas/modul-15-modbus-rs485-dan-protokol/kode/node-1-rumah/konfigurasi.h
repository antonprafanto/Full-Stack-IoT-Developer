// konfigurasi.h - semua angka penting Node 1 di satu tempat (Modul 8)
// Pin mengikuti PETA-PIN.md. Angka kalibrasi adalah hasil Modul 6 milikmu sendiri.
#pragma once

const char VERSI_FIRMWARE[] = "1.4.0";

// ---------- Peta pin kanonik Node 1 (salinan dari PETA-PIN.md) ----------
const int PIN_LED_STATUS = 2;    // Modul 2; pindah dari D4 ke D2 di Modul 15 (D4 kini untuk DE/RE RS-485)
const int PIN_TOMBOL = 13;       // Modul 5, INPUT_PULLUP
const int PIN_RELAY_LAMPU = 32;  // Modul 5, relay aktif LOW
const int PIN_RELAY_KIPAS = 33;  // Modul 5, relay aktif LOW
const int PIN_POMPA = 25;        // Modul 5, gerbang MOSFET IRLZ44N
const int PIN_SERVO_TIRAI = 26;  // Modul 5, servo SG90
const int PIN_BUZZER = 27;       // Modul 5, buzzer pasif
const int PIN_DHT = 14;          // Modul 6, DHT22
const int PIN_LDR = 36;          // Modul 6, VP: LDR (ADC1)
const int PIN_TANAH = 39;        // Modul 6, VN: sensor tanah kapasitif (ADC1)
const int PIN_PIR = 34;          // Modul 6, PIR
const int PIN_TRIG = 15;         // Modul 6, HC-SR04 TRIG
const int PIN_ECHO = 35;         // Modul 6, HC-SR04 ECHO lewat pembagi tegangan
const int PIN_SDA = 21;          // Modul 7, I2C: layar OLED
const int PIN_SCL = 22;          // Modul 7, I2C: layar OLED
const int PIN_SD_CS = 5;         // Modul 7, microSD (opsional); SCK = 18, MISO = 19, MOSI = 23
const int PIN_RS485_RX = 16;     // Modul 15, RX2 <- RO modul MAX485 lewat pembagi tegangan 4,7 kΩ + 10 kΩ
const int PIN_RS485_TX = 17;     // Modul 15, TX2 -> DI modul MAX485
const int PIN_RS485_DE_RE = 4;   // Modul 15, D4 -> DE dan RE modul MAX485 yang disatukan

// ---------- Modul 6: hasil kalibrasimu (Praktik 3 dan 6) ----------
const int TANAH_KERING = 3000;    // angka mentah sensor tanah di udara
const int TANAH_BASAH = 1300;     // angka mentah sensor tanah di air
const float JARAK_KOSONG = 20.0;  // cm: sensor ke dasar tandon
const float JARAK_PENUH = 5.0;    // cm: sensor ke permukaan air saat tandon penuh

// ---------- Modul 6: aturan otomatis versi lokal ----------
const int AMBANG_TANAH_SIRAM_BAWAAN = 30;  // Lampiran A: "tanah_siram"; dipakai selama NVS belum berisi ambang
const int LEVEL_AIR_MINIMUM = 20;          // pompa ditolak kalau isi tandon di bawah 20 %
const int DETIK_SIRAM = 3;                 // lama pompa menyala saat menyiram otomatis
const int AMBANG_GELAP = 1000;             // cahaya di bawah ini dianggap gelap

// ---------- Modul 8: jadwal (semuanya dalam milidetik) ----------
const unsigned long JEDA_BACA = 2000;          // sensor dibaca setiap 2 detik
const unsigned long LAMA_JEDA_SIRAM = 30000;   // sesudah menyiram, istirahat 30 detik
const unsigned long JEDA_CATAT_KARTU = 30000;  // satu baris CSV setiap 30 detik
const unsigned long BATAS_WATCHDOG = 5000;     // loop() macet lebih dari 5 detik = restart

// ---------- Modul 10: jaringan ----------
const bool PAKAI_WOKWI = false;            // true HANYA di Wokwi: Wokwi-GUEST tanpa portal, broker publik
const char NAMA_PERANGKAT[] = "node1";     // nama di daftar perangkat router
const char NAMA_PORTAL[] = "Node1-Rumah";  // nama WiFi sementara selama portal terbuka
const unsigned long BATAS_PORTAL = 180;    // detik: portal menutup sendiri kalau tidak dipakai
const char ZONA_WAKTU[] = "WIB-7";         // WITA: "WITA-8", WIT: "WIT-9" (Modul 10, Praktik 5)

// ---------- Modul 11: MQTT ----------
const char ALAMAT_BROKER[] = "192.168.1.37";  // GANTI dengan alamat tetap gateway Pi-mu (Modul 12, Praktik 2)
const uint16_t PORT_BROKER = 1883;
const unsigned long JEDA_KIRIM = 10000;       // telemetry setiap 10 detik, ditambah segera saat ada kejadian penting
const unsigned long JEDA_VITALS = 300000;     // vitals (kesehatan Node 1) setiap 5 menit

// ---------- Modul 14: jembatan ESP-NOW untuk Node 2 "Kebun" ----------
// Alamat MAC WiFi Node 2, dicetak Node 2 saat pertama menyala. Paket ESP-NOW dari alamat lain ditolak.
const uint8_t MAC_NODE2[6] = {0x24, 0x6F, 0x28, 0xB1, 0xC7, 0xD4};  // GANTI dengan MAC Node 2-mu
const int ANTREAN_NODE2 = 96;  // rak tunggu: bacaan Node 2 yang ditahan saat broker tak terjangkau (8 jam pada jeda 5 menit)
const unsigned long CADANGAN_OFFLINE_NODE2 = 60000;  // Node 2 "offline" setelah 3 x jedanya + 1 menit

// ---------- Modul 15: sensor tanah RS-485 (Modbus RTU) ----------
// Dipakai atau tidaknya diatur dengan perintah Serial "rs485 on" / "rs485 off" (disimpan di NVS).
const unsigned long BAUD_RS485 = 9600;              // lembar data sensor: 9600 baud, 8N1
const uint8_t ALAMAT_SENSOR_RS485 = 1;              // alamat server sensor (lembar data: bawaan 1)
const unsigned long JEDA_BACA_RS485 = 10000;        // sensor dibaca setiap 10 detik
const unsigned long JEDA_BACA_RS485_LAMBAT = 60000;  // setelah 3 kali tanpa jawaban: setiap 60 detik
