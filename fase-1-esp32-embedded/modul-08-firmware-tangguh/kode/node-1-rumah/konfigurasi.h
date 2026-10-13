// konfigurasi.h - semua angka penting Node 1 di satu tempat (Modul 8)
// Pin mengikuti PETA-PIN.md. Angka kalibrasi adalah hasil Modul 6 milikmu sendiri.
#pragma once

const char VERSI_FIRMWARE[] = "1.0.0";

// ---------- Peta pin kanonik Node 1 (salinan dari PETA-PIN.md) ----------
const int PIN_LED_STATUS = 4;    // Modul 2
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
// Dipesan untuk modul berikutnya (jangan dipakai untuk hal lain):
// Modul 15: RS-485 RX = 16, TX = 17, DE/RE = 2

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
