// versi.cpp - isi modul versi. Daftar fungsinya ada di versi.h.
#include "versi.h"

// Memecah "1.7.12" menjadi tiga angka {1, 7, 12}. Menjawab false kalau bentuknya bukan x.y.z.
static bool uraiVersi(const char* teks, long bagian[3]) {
  if (teks == nullptr) {
    return false;
  }
  int posisi = 0;
  for (int i = 0; i < 3; i++) {
    long angka = 0;
    int banyakAngka = 0;
    while (teks[posisi] >= '0' && teks[posisi] <= '9') {
      angka = angka * 10 + (teks[posisi] - '0');
      banyakAngka++;
      posisi++;
      if (banyakAngka > 5) {
        return false;  // lebih dari 5 angka dalam satu bagian: pasti bukan versi rilis kita
      }
    }
    if (banyakAngka == 0) {
      return false;  // bagian kosong, misalnya "1..0" atau "v1.7.0"
    }
    bagian[i] = angka;
    char pemisah = (i < 2) ? '.' : '\0';  // dua bagian pertama diakhiri titik, bagian ketiga diakhiri akhir teks
    if (teks[posisi] != pemisah) {
      return false;  // misalnya "1.7", "1.7.0-uji", atau "1.7.0.1"
    }
    posisi++;
  }
  return true;
}

bool versiSah(const char* teks) {
  long bagian[3];
  return uraiVersi(teks, bagian);
}

int bandingkanVersi(const char* a, const char* b) {
  long x[3];
  long y[3];
  if (!uraiVersi(a, x) || !uraiVersi(b, y)) {
    return 0;  // bentuk salah: dianggap sama (lihat versi.h)
  }
  for (int i = 0; i < 3; i++) {  // dari kiri: MAJOR, MINOR, PATCH
    if (x[i] != y[i]) {
      return x[i] < y[i] ? -1 : 1;
    }
  }
  return 0;
}
