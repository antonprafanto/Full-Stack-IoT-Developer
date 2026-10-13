// Modul 9 - Praktik 3: bangun oleh alarm timer ATAU oleh tombol
// Rangkaian: LED status di D4 dan tombol di D13 (kaki seberangnya ke GND).
// Papan tidur 20 detik. Tekan tombol D13 kapan saja untuk membangunkannya lebih cepat.

#include "driver/rtc_io.h"  // pengatur pin RTC: pin yang tetap "terjaga" selama deep sleep

const int PIN_LED_STATUS = 4;
const gpio_num_t PIN_TOMBOL_BANGUN = GPIO_NUM_13;  // D13 termasuk pin RTC, jadi bisa membangunkan papan
const unsigned long LAMA_TIDUR_DETIK = 20;

RTC_DATA_ATTR int jumlahBangun = 0;
RTC_DATA_ATTR int jumlahOlehTombol = 0;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED_STATUS, OUTPUT);
  rtc_gpio_deinit(PIN_TOMBOL_BANGUN);  // kembalikan D13 menjadi pin biasa setelah tidur
  pinMode(PIN_TOMBOL_BANGUN, INPUT_PULLUP);

  jumlahBangun++;
  esp_sleep_wakeup_cause_t penyebab = esp_sleep_get_wakeup_cause();
  Serial.print("Bangun ke-");
  Serial.print(jumlahBangun);
  if (penyebab == ESP_SLEEP_WAKEUP_EXT0) {
    jumlahOlehTombol++;
    Serial.println(": dibangunkan TOMBOL.");
  } else if (penyebab == ESP_SLEEP_WAKEUP_TIMER) {
    Serial.println(": dibangunkan alarm timer.");
  } else {
    Serial.println(": baru dinyalakan.");
  }
  Serial.print("Sejauh ini ");
  Serial.print(jumlahOlehTombol);
  Serial.println(" kali dibangunkan tombol.");

  digitalWrite(PIN_LED_STATUS, HIGH);
  delay(500);
  digitalWrite(PIN_LED_STATUS, LOW);

  // Tunggu tombol dilepas dulu. Kalau masih ditekan saat tidur, papan langsung bangun lagi.
  while (digitalRead(PIN_TOMBOL_BANGUN) == LOW) {
    delay(10);
  }
  delay(50);  // tunggu pantulan tombol reda, supaya papan tidak langsung bangun lagi

  Serial.printf("Tidur %lu detik. Tekan tombol untuk membangunkan lebih cepat.\n", LAMA_TIDUR_DETIK);
  Serial.flush();
  esp_sleep_enable_timer_wakeup(LAMA_TIDUR_DETIK * 1000000ULL);  // pintu bangun 1: alarm timer
  esp_sleep_enable_ext0_wakeup(PIN_TOMBOL_BANGUN, 0);              // pintu bangun 2: D13 menjadi LOW
  rtc_gpio_pullup_en(PIN_TOMBOL_BANGUN);   // pastikan pull-up D13 tetap aktif selama tidur
  rtc_gpio_pulldown_dis(PIN_TOMBOL_BANGUN);
  esp_deep_sleep_start();
}

void loop() {
  // Tidak pernah dijalankan.
}
