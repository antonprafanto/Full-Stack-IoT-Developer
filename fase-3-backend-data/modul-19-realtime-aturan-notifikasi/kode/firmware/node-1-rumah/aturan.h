// aturan.h - aturan otomatis lokal Node 1: siram otomatis, lampu otomatis (Modul 6), dan kipas pengaman (Modul 19)
#pragma once
#include "sensor.h"  // BacaanSensor

void jalankanAturan(BacaanSensor b);  // dipanggil setiap ada bacaan baru (langkah BERTINDAK)
void perbaruiAturan();                // panggil di setiap putaran loop(): perpindahan keadaan yang bergantung pada waktu
const char* keadaanPenyiraman();      // "SIAGA", "MENYIRAM", atau "JEDA"
