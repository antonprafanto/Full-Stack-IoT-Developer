// tombol.cpp - isi modul tombol. Daftar fungsinya ada di tombol.h.
#include <Arduino.h>
#include "tombol.h"

const unsigned long JEDA_PANTUL = 30;         // milidetik: bacaan harus tenang selama ini (Modul 5)
const unsigned long BATAS_TEKAN_LAMA = 1000;  // ditahan 1 detik atau lebih = tekan lama

static int pinTombol = -1;
static int bacaanTadi = HIGH;                 // bacaan mentah di putaran sebelumnya; HIGH = dilepas
static unsigned long waktuBacaanBerubah = 0;  // kapan bacaan mentah terakhir berubah
static int keadaanStabil = HIGH;              // keadaan yang sudah dipercaya (sudah tenang 30 ms)
static unsigned long waktuMulaiTekan = 0;     // kapan tombol mulai ditekan
static bool tekanLamaSudah = false;           // tekan lama untuk tekanan ini sudah dilaporkan?

void mulaiTombol(int pin) {
  pinTombol = pin;
  pinMode(pinTombol, INPUT_PULLUP);
}

PeristiwaTombol periksaTombol() {
  unsigned long sekarang = millis();
  int bacaan = digitalRead(pinTombol);

  // 1. Bacaan berubah (ditekan, dilepas, memantul, atau derau)? Hitung "tenang"-nya dari nol lagi.
  if (bacaan != bacaanTadi) {
    bacaanTadi = bacaan;
    waktuBacaanBerubah = sekarang;
  }

  // 2. Sudah tenang 30 ms dan berbeda dengan keadaan yang dipercaya? Itu perubahan sungguhan.
  if (bacaan != keadaanStabil && sekarang - waktuBacaanBerubah >= JEDA_PANTUL) {
    keadaanStabil = bacaan;
    if (keadaanStabil == LOW) {  // baru saja ditekan: mulai menghitung lamanya
      waktuMulaiTekan = sekarang;
      tekanLamaSudah = false;
    } else if (!tekanLamaSudah) {  // baru saja dilepas sebelum 1 detik: tekan pendek
      return TEKAN_PENDEK;
    }
  }

  // 3. Masih ditahan dan sudah 1 detik? Tekan lama, dilaporkan sekali tanpa menunggu jari diangkat.
  if (keadaanStabil == LOW && !tekanLamaSudah && sekarang - waktuMulaiTekan >= BATAS_TEKAN_LAMA) {
    tekanLamaSudah = true;
    return TEKAN_LAMA;
  }
  return TIDAK_ADA;
}
