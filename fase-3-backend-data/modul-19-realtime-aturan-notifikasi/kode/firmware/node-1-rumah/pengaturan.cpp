// pengaturan.cpp - isi modul pengaturan. Daftar fungsinya ada di pengaturan.h.
#include <Arduino.h>
#include <Preferences.h>  // ikut paket esp32, tidak perlu dipasang
#include "konfigurasi.h"
#include "pencatat.h"
#include "pengaturan.h"

static Preferences arsip;  // "lemari arsip" NVS; kita memakai map bernama "node1"
static int ambang = AMBANG_TANAH_SIRAM_BAWAAN;
static unsigned long nyalaKe = 0;
static bool pakaiRS485 = false;  // Modul 15: bawaannya tidak dipakai (sensor belum dipasang)
static float suhuKipas = SUHU_KIPAS_ON_BAWAAN;  // Modul 19: ambang kipas pengaman, dalam °C

void muatPengaturan() {
  arsip.begin("node1", false);  // false = map dibuka untuk dibaca DAN ditulis

  nyalaKe = arsip.getULong("jumlah_nyala", 0) + 1;  // 0 kalau label ini belum pernah ditulis
  arsip.putULong("jumlah_nyala", nyalaKe);

  ambang = arsip.getInt("tanah_siram", AMBANG_TANAH_SIRAM_BAWAAN);
  const char* asal = "angka bawaan";
  if (ambangDariNvs()) {
    asal = "dari NVS";
  }
  logInfo("Nyala ke-%lu. Ambang tanah_siram: %d %% (%s)", nyalaKe, ambang, asal);
  pakaiRS485 = arsip.getBool("rs485", false);  // label belum pernah ditulis = tidak dipakai
  suhuKipas = arsip.getFloat("suhu_kipas_on", SUHU_KIPAS_ON_BAWAAN);  // Modul 19
  asal = "angka bawaan";
  if (ambangSuhuKipasDariNvs()) {
    asal = "dari NVS";
  }
  logInfo("Ambang suhu_kipas_on: %.1f C (%s)", suhuKipas, asal);
}

int ambangTanahSiram() {
  return ambang;
}

bool ambangDariNvs() {
  return arsip.isKey("tanah_siram");
}

bool simpanAmbangTanahSiram(int persen) {
  if (persen < 0 || persen > 100) {
    return false;
  }
  if (persen == ambang && ambangDariNvs()) {
    return true;  // angkanya sudah sama: tidak perlu menulis ulang (jumlah tulis flash terbatas)
  }
  arsip.putInt("tanah_siram", persen);
  ambang = persen;
  logInfo("Ambang tanah_siram disimpan ke NVS: %d %%", ambang);
  return true;
}

void hapusAmbangTanahSiram() {
  arsip.remove("tanah_siram");
  ambang = AMBANG_TANAH_SIRAM_BAWAAN;
  logInfo("Ambang tanah_siram dihapus dari NVS; kembali ke angka bawaan %d %%", ambang);
}

unsigned long jumlahNyala() {
  return nyalaKe;
}

bool sensorRS485Dipakai() {
  return pakaiRS485;
}

void simpanSensorRS485Dipakai(bool pakai) {
  if (pakai == pakaiRS485 && arsip.isKey("rs485")) {
    return;  // sudah sama: tidak perlu menulis ulang (jumlah tulis flash terbatas)
  }
  arsip.putBool("rs485", pakai);
  pakaiRS485 = pakai;
  logInfo("Sensor RS-485 %s (disimpan ke NVS)", pakai ? "dipakai" : "tidak dipakai");
}

float ambangSuhuKipas() {
  return suhuKipas;
}

bool ambangSuhuKipasDariNvs() {
  return arsip.isKey("suhu_kipas_on");  // 13 huruf: masih di bawah batas 15 huruf
}

bool simpanAmbangSuhuKipas(float derajat) {
  if (!(derajat >= SUHU_KIPAS_MIN && derajat <= SUHU_KIPAS_MAKS)) {  // ditulis begini supaya NAN ikut ditolak
    return false;
  }
  if (derajat == suhuKipas && ambangSuhuKipasDariNvs()) {
    return true;  // angkanya sudah sama: tidak perlu menulis ulang (jumlah tulis flash terbatas)
  }
  arsip.putFloat("suhu_kipas_on", derajat);
  suhuKipas = derajat;
  logInfo("Ambang suhu_kipas_on disimpan ke NVS: %.1f C", suhuKipas);
  return true;
}
