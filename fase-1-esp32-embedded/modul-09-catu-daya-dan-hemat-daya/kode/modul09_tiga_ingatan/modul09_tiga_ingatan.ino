// Modul 9 - Praktik 2: tiga ingatan ESP32 (RAM, memori RTC, dan NVS) melewati deep sleep
// Rangkaian: LED status di D4 dan tombol di D13 (kaki seberangnya ke GND), sama dengan Kemenangan Cepat.
// Papan bangun setiap 5 detik dan menambah tiga penghitung. Untuk restart, tahan tombol D13
// sampai LED menyala, tunggu sebentar, lalu lepaskan.

#include <Preferences.h>

const int PIN_LED_STATUS = 4;
const int PIN_TOMBOL = 13;
const unsigned long LAMA_TIDUR_DETIK = 5;

int hitungRam = 0;                // variabel biasa: disimpan di RAM
RTC_DATA_ATTR int hitungRtc = 0;  // disimpan di memori RTC: bertahan selama deep sleep
Preferences arsip;                // NVS dari Modul 8: bertahan walaupun listrik padam

// Nama pendek untuk alasan papan terakhir kali menyala (seperti Node 1 v1.0).
const char* namaAlasan() {
  esp_reset_reason_t alasan = esp_reset_reason();
  if (alasan == ESP_RST_POWERON) {
    return "POWERON";  // baru dinyalakan, tombol EN ditekan, atau program selesai diunggah
  }
  if (alasan == ESP_RST_SW) {
    return "SW";  // program sendiri yang meminta restart
  }
  if (alasan == ESP_RST_DEEPSLEEP) {
    return "DEEPSLEEP";  // bangun dari deep sleep
  }
  return "LAIN";
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED_STATUS, OUTPUT);
  pinMode(PIN_TOMBOL, INPUT_PULLUP);

  hitungRam++;
  hitungRtc++;
  arsip.begin("modul09", false);
  int hitungNvs = arsip.getInt("hitung", 0) + 1;
  arsip.putInt("hitung", hitungNvs);
  arsip.end();

  Serial.printf("RAM: %d   RTC: %d   NVS: %d   (alasan menyala: %s)\n", hitungRam, hitungRtc, hitungNvs, namaAlasan());

  digitalWrite(PIN_LED_STATUS, HIGH);  // LED menyala 1 detik: kesempatan untuk menahan tombol
  delay(1000);
  bool tombolDitahan = (digitalRead(PIN_TOMBOL) == LOW);
  digitalWrite(PIN_LED_STATUS, LOW);

  if (tombolDitahan) {
    Serial.println("Tombol ditahan: restart sekarang.");
    Serial.flush();
    ESP.restart();  // restart oleh program, mirip menekan tombol EN
  }

  Serial.flush();
  esp_sleep_enable_timer_wakeup(LAMA_TIDUR_DETIK * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {
  // Tidak pernah dijalankan (lihat Kemenangan Cepat).
}
