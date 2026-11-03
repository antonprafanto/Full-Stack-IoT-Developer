// layar.h - layar OLED Node 1: halaman bacaan (Modul 7), halaman status (Modul 8), dan pesan singkat (Modul 10)
#pragma once
#include "sensor.h"  // BacaanSensor

void siapkanLayar();                   // panggil sekali di setup(); tanpa layar, Node 1 tetap berjalan
void tampilkanBacaan(BacaanSensor b);  // halaman bacaan rancanganmu (Modul 7)
void bukaHalamanStatus();              // halaman status selama 10 detik (tekan lama tombol)
void perbaruiLayar();                  // panggil di setiap putaran loop()
void tampilkanPesan(const char* judul, const char* baris2, const char* baris3, const char* baris4);  // misalnya petunjuk portal WiFi
