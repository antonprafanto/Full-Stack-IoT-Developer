// Modul 6 - Praktik 4: suhu dan kelembapan dengan DHT22
// Kaki DATA modul DHT22 ke D14. Modul DHT22 diberi 3,3 V, BUKAN 5 V.
// Library: DHT sensor library by Adafruit 1.4.7 (ikut terpasang: Adafruit Unified Sensor 1.1.15).

#include <DHT.h>

const int PIN_DHT = 14;  // D14: DHT22 (peta pin kanonik)

DHT dht(PIN_DHT, DHT22);  // "objek" sensor: kaki DATA-nya di pin mana, jenisnya apa

void setup() {
  Serial.begin(115200);
  dht.begin();
  Serial.println("DHT22 siap. Bacaan pertama muncul 2 detik lagi.");
}

void loop() {
  delay(2000);  // DHT22 paling cepat dibaca sekali setiap 2 detik

  float suhu = dht.readTemperature();     // derajat Celsius
  float kelembapan = dht.readHumidity();  // persen

  if (isnan(suhu) || isnan(kelembapan)) {  // NAN = "bukan angka": pembacaan gagal
    Serial.println("Gagal membaca DHT22! Periksa kabel DATA, VCC, dan GND.");
    return;  // lewati sisa loop(); putaran berikutnya mencoba lagi
  }

  Serial.print("suhu=");
  Serial.print(suhu, 1);  // 1 angka di belakang titik desimal
  Serial.print(" C  kelembapan=");
  Serial.print(kelembapan, 0);
  Serial.println(" %");
}
