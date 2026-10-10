// Modul 3 - Praktik 7 (langkah tambahan): struct BacaanSensor -> JSON dengan library ArduinoJson
// Butuh library ArduinoJson versi 7.4.3 (pasang lewat Library Manager; di Wokwi lewat libraries.txt).
// Hasilnya mirip "telemetry" di kontrak data proyek (Lampiran A Silabus) yang dikirim mulai Modul 11.

#include <ArduinoJson.h>  // pintu masuk ke library ArduinoJson

struct BacaanSensor {
  float suhu;
  int kelembapan;
  int cahaya;
  bool gerak;
};

BacaanSensor bacaSensorPalsu() {
  BacaanSensor b;
  b.suhu = random(250, 330) / 10.0;
  b.kelembapan = random(55, 85);
  b.cahaya = random(0, 4096);
  b.gerak = (random(0, 2) == 1);
  return b;
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.println("Bacaan sensor (palsu) dalam format JSON:");
}

void loop() {
  BacaanSensor bacaan = bacaSensorPalsu();

  JsonDocument doc;  // "amplop" JSON kosong
  doc["suhu"] = bacaan.suhu;
  doc["kelembapan"] = bacaan.kelembapan;
  doc["cahaya"] = bacaan.cahaya;
  doc["gerak"] = bacaan.gerak;

  serializeJson(doc, Serial);  // tulis JSON-nya ke Serial Monitor
  Serial.println();            // pindah baris
  delay(2000);
}
