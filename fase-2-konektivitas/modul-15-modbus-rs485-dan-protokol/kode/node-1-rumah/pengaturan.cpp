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
