// Node 1 "Rumah" - firmware v1.1.0 (Modul 10)
// Proyek benang merah: Rumah Pintar Mini.
//
// Baru di v1.1.0: tersambung ke WiFi rumah lewat portal WiFiManager (kata sandi tidak ditulis di kode),
// jam dari internet (NTP), bacaan dikirim ke server mini di laptop setiap menit (HTTP POST berisi JSON),
// dan lampu bisa dinyalakan atau dimatikan dari browser HP. WiFi boleh putus, Node 1 tetap bekerja.
// Dari v1.0.0 (Modul 8): tanpa delay() di loop(), kode modular, watchdog, NVS, log bertingkat, halaman status.
// Perintah lewat Serial Monitor: lampu on, kipas off, pompa 3, tirai 90, bunyi, status, info,
// ambang, ambang 35, ambang bawaan, log debug, log info, log error, wifi, wifi lupa, kirim, restart.
//
// Library: ESP32Servo versi 3.2.1, DHT sensor library versi 1.4.7
// (ikut terpasang: Adafruit Unified Sensor versi 1.1.15), Adafruit SSD1306 versi 2.5.17
// (ikut terpasang: Adafruit GFX Library versi 1.12.6 dan Adafruit BusIO versi 1.17.4),
// WiFiManager versi 2.0.17, dan ArduinoJson versi 7.4.3.
// Wire, SPI, SD, Preferences, WiFi, WebServer, HTTPClient, dan ESPmDNS sudah ikut paket esp32.

#include <esp_task_wdt.h>  // watchdog
#include "konfigurasi.h"
#include "pencatat.h"
#include "sistem.h"
#include "pengaturan.h"
#include "sensor.h"
#include "aktuator.h"
#include "detak.h"
#include "tombol.h"
#include "layar.h"
#include "kartu.h"
#include "perintah.h"
#include "aturan.h"
#include "jaringan.h"  // Modul 10

// ---------- Siklus utama: MENUNGGU -> MEMBACA -> MENAMPILKAN -> BERTINDAK -> MENUNGGU ... ----------
enum LangkahSiklus { MENUNGGU, MEMBACA, MENAMPILKAN, BERTINDAK };
LangkahSiklus langkah = MENUNGGU;
unsigned long waktuBacaTerakhir = 0;
unsigned long waktuCatatTerakhir = 0;
BacaanSensor bacaan;
bool dhtGagalTadi = false;    // DHT22 gagal pada bacaan sebelumnya?
bool sonarGagalTadi = false;  // HC-SR04 gagal pada bacaan sebelumnya?

const char* namaLangkah(LangkahSiklus l) {
  if (l == MENUNGGU) {
    return "MENUNGGU";
  }
  if (l == MEMBACA) {
    return "MEMBACA";
  }
  if (l == MENAMPILKAN) {
    return "MENAMPILKAN";
  }
  return "BERTINDAK";
}

void pindahLangkah(LangkahSiklus langkahBaru) {
  logDebug("Siklus: %s -> %s", namaLangkah(langkah), namaLangkah(langkahBaru));
  langkah = langkahBaru;
}

// Satu baris laporan bacaan: angka yang gagal ditulis "--".
void laporkanBacaan(BacaanSensor b) {
  char suhu[8] = "--";
  if (!isnan(b.suhu)) {
    snprintf(suhu, sizeof(suhu), "%.1f", b.suhu);
  }
  char kelembapan[12] = "--";  // 12 laci: muat angka int terpanjang (11 huruf) + tanda akhir
  if (b.kelembapan >= 0) {
    snprintf(kelembapan, sizeof(kelembapan), "%d", b.kelembapan);
  }
  char levelAir[12] = "--";
  if (b.level_air >= 0) {
    snprintf(levelAir, sizeof(levelAir), "%d", b.level_air);
  }
  const char* gerak = "tidak";
  if (b.gerak) {
    gerak = "ya";
  }
  logInfo("suhu=%s C  kelembapan=%s %%  cahaya=%d  tanah=%d %%  gerak=%s  level_air=%s %%",
          suhu, kelembapan, b.cahaya, b.tanah, gerak, levelAir);
}

// Sensor gagal? LED status berkedip cepat. Pesannya dicetak sekali saat keadaan sensornya berubah, bukan setiap 2 detik.
void periksaMasalah(BacaanSensor b) {
  aturIramaDetak(sensorBermasalah(b));
  bool dhtGagal = isnan(b.suhu) || b.kelembapan < 0;
  bool sonarGagal = b.level_air < 0;
  if (dhtGagal && !dhtGagalTadi) {
    logError("DHT22 tidak terbaca. LED status berkedip cepat.");
  }
  if (!dhtGagal && dhtGagalTadi) {
    logInfo("DHT22 kembali terbaca.");
  }
  if (sonarGagal && !sonarGagalTadi) {
    logError("HC-SR04: gema tidak kembali, level air tidak diketahui. LED status berkedip cepat.");
  }
  if (!sonarGagal && sonarGagalTadi) {
    logInfo("HC-SR04 kembali terbaca.");
  }
  dhtGagalTadi = dhtGagal;
  sonarGagalTadi = sonarGagal;
}

// ---------- Modul 10: mengirim bacaan ke server (Modul 11 menggantinya dengan MQTT) ----------
void kirimData(BacaanSensor b) {
  kirimBacaan(b);  // jaringan.cpp: benar-benar mengirim setiap JEDA_KIRIM (1 menit)
}

// Satu langkah siklus per putaran loop(): tidak ada langkah yang menunggu lama.
void jalankanSiklus() {
  if (langkah == MENUNGGU) {
    if (millis() - waktuBacaTerakhir >= JEDA_BACA) {
      waktuBacaTerakhir = millis();
      pindahLangkah(MEMBACA);
    }
  } else if (langkah == MEMBACA) {
    bacaan = bacaSensor();
    periksaMasalah(bacaan);
    pindahLangkah(MENAMPILKAN);
  } else if (langkah == MENAMPILKAN) {
    laporkanBacaan(bacaan);
    tampilkanBacaan(bacaan);
    if (millis() - waktuCatatTerakhir >= JEDA_CATAT_KARTU) {
      waktuCatatTerakhir = millis();
      catatKeKartu(bacaan);
    }
    pindahLangkah(BERTINDAK);
  } else if (langkah == BERTINDAK) {
    jalankanAturan(bacaan);
    kirimData(bacaan);
    pindahLangkah(MENUNGGU);
  }
}

void tanganiTombol() {
  PeristiwaTombol peristiwa = periksaTombol();
  if (peristiwa == TEKAN_PENDEK) {
    aturLampu(!lampuMenyala());
    logInfo("Tombol: lampu %s", teksOnOff(lampuMenyala()));
  } else if (peristiwa == TEKAN_LAMA) {
    bukaHalamanStatus();  // halaman status 10 detik (layar.cpp); pesannya juga dicetak di sana
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);  // boleh: setup() hanya berjalan sekali, dan watchdog belum mengawasi
  Serial.println();
  logInfo("Node 1 Rumah - firmware %s", VERSI_FIRMWARE);
  logInfo("Alasan restart terakhir: %s", alasanReset());

  siapkanAktuator();  // pertama: relay segera dimatikan
  muatPengaturan();
  siapkanSensor();
  mulaiDetak(PIN_LED_STATUS);
  mulaiTombol(PIN_TOMBOL);
  siapkanLayar();  // Modul 7
  siapkanKartu();  // Modul 7 (opsional)
  siapkanJaringan();  // Modul 10: portal WiFi boleh menunggu di sini karena watchdog belum mengawasi

  // Watchdog dengan cara penulisan paket esp32 versi 3 (Konsep 8)
  esp_task_wdt_config_t konfigurasiWatchdog = {
    .timeout_ms = BATAS_WATCHDOG,  // batas waktu: 5000 ms
    .idle_core_mask = 0b01,        // tetap awasi "tugas menganggur" inti 0 (bawaan paket esp32)
    .trigger_panic = true,         // terlambat diberi makan = panik, lalu restart
  };
  esp_task_wdt_reconfigure(&konfigurasiWatchdog);  // watchdog sudah dinyalakan paket esp32: cukup diatur ulang
  esp_task_wdt_add(NULL);                          // NULL = awasi tugas yang sedang berjalan, yaitu loop()
  logInfo("Watchdog aktif: restart otomatis kalau loop() macet lebih dari %lu detik.", BATAS_WATCHDOG / 1000);
}

void loop() {
  unsigned long mulaiPutaran = micros();
  esp_task_wdt_reset();  // "beri makan" penjaga: loop() masih berputar

  perbaruiSensor();      // satu sampel analog setiap 2 ms
  perbaruiAktuator();    // pompa dan buzzer padam tepat waktu
  perbaruiAturan();      // MENYIRAM -> JEDA -> SIAGA
  perbaruiDetak();       // LED status
  perbaruiLayar();       // halaman status: jam berdetak, lalu kembali sendiri
  perbaruiJaringan();    // Modul 10: WiFi, jam internet, dan server web; tidak pernah menunggu lama
  tanganiTombol();
  periksaPerintahSerial();
  jalankanSiklus();

  catatLamaPutaran(micros() - mulaiPutaran);
}
