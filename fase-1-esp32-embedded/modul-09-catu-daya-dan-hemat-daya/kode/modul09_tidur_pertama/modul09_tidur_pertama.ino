// Modul 9 - Kemenangan Cepat: ESP32 tidur 5 detik, bangun sendiri, lalu tidur lagi
// Rangkaian: LED status di D4 (lewat resistor 220 ohm). Tombol D13 belum dipakai di sini.
// Setiap kali bangun, LED berkedip sekali dan Serial mencetak sudah berapa kali papan bangun.

const int PIN_LED_STATUS = 4;
const unsigned long LAMA_TIDUR_DETIK = 5;  // lama tidur, dalam detik

RTC_DATA_ATTR int jumlahBangun = 0;  // disimpan di memori RTC: tetap ada selama deep sleep

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED_STATUS, OUTPUT);

  jumlahBangun++;
  Serial.print("Bangun ke-");
  Serial.print(jumlahBangun);
  if (esp_sleep_get_wakeup_cause() == ESP_SLEEP_WAKEUP_TIMER) {
    Serial.println(": dibangunkan alarm timer.");
  } else {
    Serial.println(": baru dinyalakan.");
  }

  digitalWrite(PIN_LED_STATUS, HIGH);  // kedip singkat: tanda "aku bangun"
  delay(200);
  digitalWrite(PIN_LED_STATUS, LOW);

  Serial.printf("Tidur %lu detik... sampai jumpa!\n", LAMA_TIDUR_DETIK);
  Serial.flush();  // tunggu sampai semua huruf terkirim, baru tidur
  esp_sleep_enable_timer_wakeup(LAMA_TIDUR_DETIK * 1000000ULL);  // satuannya mikrodetik
  esp_deep_sleep_start();  // tidur sekarang; saat bangun, program mulai lagi dari setup()
}

void loop() {
  // Tidak pernah dijalankan: setelah deep sleep, papan selalu mulai lagi dari setup().
}
