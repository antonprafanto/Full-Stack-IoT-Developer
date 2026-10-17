// Modul 10 - Kemenangan Cepat: ESP32 menyapa WiFi rumahmu
// Nama dan kata sandi WiFi TIDAK ditulis di file ini, tetapi di tab secrets.h.
// LED status D4 berkedip selama menyambung, lalu menyala tetap begitu tersambung.

#include <WiFi.h>     // ikut paket esp32, tidak perlu dipasang
#include "secrets.h"  // berisi WIFI_NAMA dan WIFI_SANDI

const int PIN_LED_STATUS = 4;              // LED status meja kerja (Modul 2)
const unsigned long BATAS_TUNGGU = 20000;  // menyerah setelah 20 detik

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(PIN_LED_STATUS, OUTPUT);
  Serial.println();
  Serial.printf("Menyambung ke WiFi \"%s\"", WIFI_NAMA);

  WiFi.mode(WIFI_STA);  // STA (station) = ESP32 menumpang di jaringan router, seperti HP-mu
  WiFi.begin(WIFI_NAMA, WIFI_SANDI);

  // Menunggu di setup() boleh untuk Kemenangan Cepat ini: hanya sekali, dan watchdog belum mengawasi.
  // Konsep 4 membahas cara menyambung yang tidak pernah membuat program macet.
  bool ledNyala = false;
  unsigned long mulai = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - mulai < BATAS_TUNGGU) {
    ledNyala = !ledNyala;
    digitalWrite(PIN_LED_STATUS, ledNyala);  // kedip selama menunggu
    Serial.print(".");
    delay(250);
  }
  Serial.println();

  if (WiFi.status() != WL_CONNECTED) {
    digitalWrite(PIN_LED_STATUS, LOW);
    Serial.println("Belum tersambung setelah 20 detik. Periksa nama dan kata sandi di tab secrets.h.");
    return;
  }
  digitalWrite(PIN_LED_STATUS, HIGH);  // menyala tetap = tersambung
  Serial.printf("Tersambung dalam %lu ms!\n", millis() - mulai);
  Serial.print("Alamat IP ESP32 : ");
  Serial.println(WiFi.localIP());
  Serial.printf("Kekuatan sinyal : %d dBm\n", WiFi.RSSI());
}

void loop() {
  // Kosong: semua pekerjaan Kemenangan Cepat ada di setup().
}
