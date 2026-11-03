// sensor.h - lima sensor Node 1 (Modul 6), dibaca tanpa menunggu lama (Modul 8)
#pragma once

// Formulir data sensor. Nama kolomnya PERSIS sesuai kontrak data (Lampiran A Silabus).
struct BacaanSensor {
  float suhu;      // derajat Celsius; NAN kalau DHT22 gagal dibaca
  int kelembapan;  // persen; -1 kalau DHT22 gagal dibaca
  int cahaya;      // 0 (gelap gulita) sampai 4095 (sangat terang)
  int tanah;       // persen: 0 = kering seperti di udara, 100 = basah seperti di air
  bool gerak;      // true kalau PIR melihat gerakan
  int level_air;   // persen isi tandon; -1 kalau gema HC-SR04 tidak kembali
};

void siapkanSensor();                   // panggil sekali di setup()
void perbaruiSensor();                  // panggil di setiap putaran loop(): sampel analog sedikit demi sedikit
BacaanSensor bacaSensor();              // membaca semua sensor sekarang (paling lama sekitar 70 ms)
BacaanSensor bacaanTerakhir();          // hasil bacaSensor() yang terakhir, tanpa membaca ulang
bool sensorBermasalah(BacaanSensor b);  // true kalau DHT22 atau HC-SR04 gagal dibaca
