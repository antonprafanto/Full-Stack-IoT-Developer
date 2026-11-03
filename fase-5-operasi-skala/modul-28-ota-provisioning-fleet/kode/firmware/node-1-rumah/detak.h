// detak.h - LED status sebagai "detak jantung" Node 1 (Modul 8)
// Kedip pelan = program berjalan normal; kedip cepat = ada masalah.
#pragma once

void mulaiDetak(int pin);           // panggil sekali di setup()
void aturIramaDetak(bool masalah);  // true = kedip cepat, false = kedip pelan
void perbaruiDetak();               // panggil di setiap putaran loop()
