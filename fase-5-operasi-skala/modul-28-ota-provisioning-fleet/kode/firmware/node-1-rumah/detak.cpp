// detak.cpp - isi modul detak. Daftar fungsinya ada di detak.h.
#include <Arduino.h>
#include "detak.h"

const unsigned long DETAK_NORMAL = 1000;     // satu kedip setiap 1 detik
const unsigned long DETAK_MASALAH = 250;     // empat kedip setiap 1 detik
const unsigned long LAMA_NYALA_DETAK = 100;  // LED menyala 100 ms di awal setiap detak

// "static" = milik file ini saja; file lain tidak bisa melihat atau tertukar dengannya.
static int pinDetak = -1;
static bool iramaMasalah = false;
static unsigned long waktuDetakMulai = 0;

void mulaiDetak(int pin) {
  pinDetak = pin;
  pinMode(pinDetak, OUTPUT);
}

void aturIramaDetak(bool masalah) {
  iramaMasalah = masalah;
}

void perbaruiDetak() {
  unsigned long sekarang = millis();
  unsigned long panjangDetak = DETAK_NORMAL;
  if (iramaMasalah) {
    panjangDetak = DETAK_MASALAH;
  }
  if (sekarang - waktuDetakMulai >= panjangDetak) {
    waktuDetakMulai = sekarang;  // mulai detak berikutnya
  }
  // LED menyala hanya di awal detak: true = HIGH (nyala), false = LOW (padam)
  digitalWrite(pinDetak, sekarang - waktuDetakMulai < LAMA_NYALA_DETAK);
}
