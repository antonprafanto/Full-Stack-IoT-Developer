// pencatat.cpp - isi modul pencatat. Daftar fungsinya ada di pencatat.h.
#include <Arduino.h>
#include <stdarg.h>     // va_list: bahan "titik tiga" (...) milik logDebug, logInfo, dan logError
#include <esp_timer.h>  // esp_timer_get_time()
#include "pencatat.h"

static TingkatLog tingkatSekarang = TINGKAT_INFO;  // bawaan: DEBUG disembunyikan

void aturTingkatLog(TingkatLog tingkat) {
  tingkatSekarang = tingkat;
}

TingkatLog tingkatLog() {
  return tingkatSekarang;
}

const char* namaTingkatLog(TingkatLog tingkat) {
  if (tingkat == TINGKAT_DEBUG) {
    return "DEBUG";
  }
  if (tingkat == TINGKAT_INFO) {
    return "INFO";
  }
  return "ERROR";
}

// Inti ketiga fungsi log: menyaring tingkat, lalu mencetak [jam:menit:detik sejak menyala], tingkat, dan pesannya.
static void cetakLog(TingkatLog tingkat, const char* format, va_list bahan) {
  if (tingkat < tingkatSekarang) {
    return;  // terlalu rinci untuk tingkat yang sedang dipilih
  }
  char pesan[160];
  vsnprintf(pesan, sizeof(pesan), format, bahan);  // seperti snprintf, tetapi bahannya diteruskan dari "..."
  unsigned long detik = esp_timer_get_time() / 1000000;  // detik sejak menyala (Konsep 3)
  // %02lu = angka unsigned long minimal 2 digit (05, bukan 5); %-5s = teks rata kiri selebar 5 huruf
  Serial.printf("[%02lu:%02lu:%02lu] %-5s %s\n", detik / 3600, (detik / 60) % 60, detik % 60,
                namaTingkatLog(tingkat), pesan);
}

void logDebug(const char* format, ...) {
  va_list bahan;
  va_start(bahan, format);
  cetakLog(TINGKAT_DEBUG, format, bahan);
  va_end(bahan);
}

void logInfo(const char* format, ...) {
  va_list bahan;
  va_start(bahan, format);
  cetakLog(TINGKAT_INFO, format, bahan);
  va_end(bahan);
}

void logError(const char* format, ...) {
  va_list bahan;
  va_start(bahan, format);
  cetakLog(TINGKAT_ERROR, format, bahan);
  va_end(bahan);
}
