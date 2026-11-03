// kartu.h - (opsional) catatan CSV di kartu microSD (Modul 7)
#pragma once
#include "sensor.h"  // BacaanSensor

void siapkanKartu();                // panggil sekali di setup(); tanpa kartu, Node 1 tetap berjalan
void catatKeKartu(BacaanSensor b);  // menambah satu baris CSV
