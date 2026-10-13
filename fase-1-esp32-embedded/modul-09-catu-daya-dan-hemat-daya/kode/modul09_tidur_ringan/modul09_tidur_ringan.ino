// Modul 9 - Praktik 3 (bagian B): light sleep, tidur ringan yang tidak melupakan apa pun
// Rangkaian: tombol di D13 (kaki seberangnya ke GND), sama dengan Praktik 3.
// Papan tidur ringan 3 detik, lalu LANJUT dari baris berikutnya. Tombol juga bisa membangunkannya.

const gpio_num_t PIN_TOMBOL_BANGUN = GPIO_NUM_13;
const unsigned long LAMA_TIDUR_DETIK = 3;

int hitungRam = 0;  // variabel biasa di RAM: kali ini TIDAK hilang

void setup() {
  Serial.begin(115200);
  pinMode(PIN_TOMBOL_BANGUN, INPUT_PULLUP);
  Serial.println("Praktik 3B - light sleep: isi RAM dan jam millis() tetap terjaga.");

  esp_sleep_enable_timer_wakeup(LAMA_TIDUR_DETIK * 1000000ULL);  // pintu bangun 1: alarm timer
  gpio_wakeup_enable(PIN_TOMBOL_BANGUN, GPIO_INTR_LOW_LEVEL);    // pintu bangun 2: D13 menjadi LOW
  esp_sleep_enable_gpio_wakeup();
}

void loop() {
  hitungRam++;
  Serial.printf("Putaran %d, millis() = %lu ms. Tidur ringan...\n", hitungRam, millis());
  Serial.flush();           // kirim dulu semua huruf; selama tidur ringan, Serial ikut berhenti
  esp_light_sleep_start();  // tidur ringan; begitu bangun, program LANJUT ke baris di bawah ini

  if (esp_sleep_get_wakeup_cause() == ESP_SLEEP_WAKEUP_GPIO) {
    Serial.println("Dibangunkan tombol.");
    while (digitalRead(PIN_TOMBOL_BANGUN) == LOW) {  // tunggu tombol dilepas, supaya tidak langsung bangun lagi
      delay(10);
    }
    delay(50);  // tunggu pantulan tombol reda
  }
}
