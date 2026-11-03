// sistem.cpp - isi modul sistem. Daftar fungsinya ada di sistem.h.
#include <Arduino.h>
#include <esp_system.h>  // esp_reset_reason()
#include <esp_timer.h>   // esp_timer_get_time()
#include <esp_task_wdt.h>  // Modul 28: watchdog
#include "sistem.h"

static unsigned long putaranTerlamaUs = 0;  // mikrodetik

unsigned long uptimeDetik() {
  // esp_timer_get_time() menghitung mikrodetik sejak menyala dengan angka 64-bit:
  // baru meluap setelah ratusan ribu tahun, jauh lebih awet daripada millis() (49,7 hari).
  return esp_timer_get_time() / 1000000;
}

// Menerjemahkan kode alasan restart menjadi kata yang mudah dibaca (Modul 5; nama sama dengan Lampiran A).
const char* alasanReset() {
  esp_reset_reason_t alasan = esp_reset_reason();
  if (alasan == ESP_RST_POWERON) {
    return "POWERON";  // baru dinyalakan, tombol EN ditekan, atau program selesai diunggah
  }
  if (alasan == ESP_RST_BROWNOUT) {
    return "BROWNOUT";  // tegangan sempat anjlok terlalu rendah
  }
  if (alasan == ESP_RST_SW) {
    return "SW";  // program sendiri yang meminta restart, misalnya perintah "restart"
  }
  if (alasan == ESP_RST_PANIC) {
    return "PANIC";  // program mogok (crash)
  }
  if (alasan == ESP_RST_INT_WDT || alasan == ESP_RST_TASK_WDT || alasan == ESP_RST_WDT) {
    return "WDT";  // "penjaga" (watchdog) me-restart program yang macet
  }
  if (alasan == ESP_RST_DEEPSLEEP) {
    return "DEEPSLEEP";  // bangun dari tidur dalam (deep sleep, Modul 9)
  }
  return "UNKNOWN";  // alasan lain yang jarang terjadi
}

void catatLamaPutaran(unsigned long mikrodetik) {
  if (mikrodetik > putaranTerlamaUs) {
    putaranTerlamaUs = mikrodetik;
  }
}

unsigned long putaranTerlamaMs() {
  return putaranTerlamaUs / 1000;
}

// Modul 28: mengunduh firmware (atau menukar kode klaim lewat HTTPS) memblok loop() lebih dari 5 detik: menunggu jawaban
// server saja boleh sampai 8 detik (HTTPClient). Karena itu batas watchdog dilonggarkan sementara, lalu dikembalikan.
// Masa uji firmware baru juga memakainya untuk menjaga setup() (masa-uji.cpp).
// Isinya sama dengan pengaturan watchdog di setup() (Modul 8, Konsep 8); yang berubah hanya batas waktunya.
void aturBatasWatchdog(unsigned long milidetik) {
  esp_task_wdt_config_t konfigurasiWatchdog = {
    .timeout_ms = (uint32_t)milidetik,
    .idle_core_mask = 0b01,  // tetap awasi "tugas menganggur" inti 0 (bawaan paket esp32)
    .trigger_panic = true,   // terlambat diberi makan = panik, lalu restart
  };
  esp_task_wdt_reset();  // beri makan dulu supaya hitungan batas yang baru mulai dari nol
  esp_task_wdt_reconfigure(&konfigurasiWatchdog);
  esp_task_wdt_reset();
}
