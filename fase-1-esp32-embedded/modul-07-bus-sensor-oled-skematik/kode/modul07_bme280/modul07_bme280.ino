// Modul 7 - Praktik 3: BME280 di bus I2C, dibandingkan dengan DHT22
// BME280: SDA ke D21, SCL ke D22 (bus yang sama dengan layar OLED). DHT22 tetap di D14.
// Library: Adafruit BME280 Library 2.3.0 (ikut terpasang: Adafruit Unified Sensor 1.1.15 dan Adafruit BusIO 1.17.4)
//          dan DHT sensor library 1.4.7 (dari Modul 6).

#include <Wire.h>
#include <Adafruit_BME280.h>
#include <DHT.h>

const int PIN_SDA = 21;  // D21: jalur data I2C (peta pin kanonik)
const int PIN_SCL = 22;  // D22: jalur detak I2C (peta pin kanonik)
const int PIN_DHT = 14;  // D14: DHT22 (peta pin kanonik)

Adafruit_BME280 bme;
DHT dht(PIN_DHT, DHT22);
bool bmeSiap = false;  // true kalau BME280 asli ditemukan

// Menjawab true kalau ada perangkat yang merespons di alamat itu (cara pemindai I2C).
bool adaPerangkat(byte alamat) {
  Wire.beginTransmission(alamat);
  return Wire.endTransmission() == 0;
}

void cetakHex(int nilai) {
  Serial.print("0x");
  if (nilai < 0x10) {
    Serial.print("0");
  }
  Serial.print(nilai, HEX);
}

// Mencari BME280 di kedua alamatnya, lalu memeriksa "kartu identitas"-nya (chip ID).
bool siapkanBme() {
  byte alamat = 0;
  if (adaPerangkat(0x76)) {
    alamat = 0x76;
  } else if (adaPerangkat(0x77)) {
    alamat = 0x77;
  }
  if (alamat == 0) {
    Serial.println("Tidak ada perangkat di 0x76 maupun 0x77. Periksa keempat kabel BME280.");
    return false;
  }
  Serial.print("Ada perangkat di ");
  cetakHex(alamat);
  Serial.println(". Memeriksa chip ID-nya...");

  if (bme.begin(alamat)) {
    Serial.println("Chip ID 0x60: benar BME280 (suhu, kelembapan, dan tekanan).");
    return true;
  }
  int id = bme.sensorID();  // chip ID yang baru saja dibaca dari perangkat itu
  Serial.print("Chip ID-nya ");
  cetakHex(id);
  Serial.print(", bukan 0x60. ");
  if (id == 0x56 || id == 0x57 || id == 0x58) {
    Serial.println("Ini BMP280: hanya suhu dan tekanan, TANPA kelembapan.");
  } else if (id == 0x55) {
    Serial.println("Ini BMP180: sepupu lama BME280, hanya suhu dan tekanan.");
  } else if (id == 0x61) {
    Serial.println("Ini BME680: punya sensor gas juga, butuh library lain.");
  } else {
    Serial.println("Chip tidak dikenal.");
  }
  return false;
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Wire.begin(PIN_SDA, PIN_SCL);
  dht.begin();
  bmeSiap = siapkanBme();
  Serial.println("Bacaan pertama muncul 2 detik lagi.");
}

void loop() {
  delay(2000);  // DHT22 paling cepat dibaca sekali setiap 2 detik

  float suhuDht = dht.readTemperature();
  float lembapDht = dht.readHumidity();

  Serial.print("DHT22 : suhu=");
  if (isnan(suhuDht) || isnan(lembapDht)) {
    Serial.println("-- (gagal dibaca)");
  } else {
    Serial.print(suhuDht, 1);
    Serial.print(" C  kelembapan=");
    Serial.print(lembapDht, 0);
    Serial.println(" %");
  }

  if (!bmeSiap) {
    Serial.println("BME280: tidak siap (lihat pesan di atas)");
    return;
  }
  float suhuBme = bme.readTemperature();         // derajat Celsius
  float lembapBme = bme.readHumidity();          // persen
  float tekanan = bme.readPressure() / 100.0;    // paskal dibagi 100 = hPa
  Serial.print("BME280: suhu=");
  Serial.print(suhuBme, 1);
  Serial.print(" C  kelembapan=");
  Serial.print(lembapBme, 0);
  Serial.print(" %  tekanan=");
  Serial.print(tekanan, 1);
  Serial.println(" hPa");

  if (!isnan(suhuDht) && !isnan(lembapDht)) {
    Serial.print("selisih: suhu ");
    Serial.print(fabs(suhuBme - suhuDht), 1);  // fabs = nilai mutlak, selalu positif
    Serial.print(" C, kelembapan ");
    Serial.print(fabs(lembapBme - lembapDht), 0);
    Serial.println(" %");
  }
  Serial.println();
}
