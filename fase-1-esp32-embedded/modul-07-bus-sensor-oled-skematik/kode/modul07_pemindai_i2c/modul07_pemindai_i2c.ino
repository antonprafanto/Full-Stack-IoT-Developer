// Modul 7 - Praktik 1: pemindai I2C
// "Mengetuk pintu" alamat 1 sampai 126 satu per satu, lalu mencetak alamat yang menjawab.
// Bus I2C: SDA ke D21, SCL ke D22. Tidak perlu library tambahan: Wire sudah ikut paket esp32.

#include <Wire.h>

const int PIN_SDA = 21;  // D21: jalur data I2C (peta pin kanonik)
const int PIN_SCL = 22;  // D22: jalur detak I2C (peta pin kanonik)

// Menebak nama perangkat dari alamatnya. Hanya perangkat kurikulum ini yang dikenal.
String tebakNama(byte alamat) {
  if (alamat == 0x3C || alamat == 0x3D) {
    return "layar OLED SSD1306";
  }
  if (alamat == 0x76) {
    return "BME280 atau BMP280 (kaki SDO ke GND)";
  }
  if (alamat == 0x77) {
    return "BME280 atau BMP280 (kaki SDO ke VCC), atau BMP180";
  }
  return "perangkat lain (cek lembar datanya)";
}

// Mencetak alamat dalam bentuk heksadesimal dua digit, misalnya 0x3C atau 0x08.
void cetakAlamat(byte alamat) {
  Serial.print("0x");
  if (alamat < 0x10) {
    Serial.print("0");
  }
  Serial.print(alamat, HEX);
}

void setup() {
  Serial.begin(115200);
  Wire.begin(PIN_SDA, PIN_SCL);
  delay(500);
  Serial.println();
  Serial.println("Pemindai I2C siap.");
}

void loop() {
  Serial.println("Memindai alamat 0x01 sampai 0x7E...");
  int jumlah = 0;
  for (byte alamat = 1; alamat < 127; alamat++) {
    Wire.beginTransmission(alamat);         // ketuk pintu alamat ini
    byte jawaban = Wire.endTransmission();  // 0 = ada yang menjawab "ya, saya di sini"
    if (jawaban == 0) {
      Serial.print("  Ada perangkat di ");
      cetakAlamat(alamat);
      Serial.print(" -> ");
      Serial.println(tebakNama(alamat));
      jumlah++;
    }
  }
  if (jumlah == 0) {
    Serial.println("  Tidak ada yang menjawab. Periksa kabel SDA, SCL, VCC, dan GND.");
  } else {
    Serial.print("Selesai: ");
    Serial.print(jumlah);
    Serial.println(" perangkat ditemukan.");
  }
  Serial.println();
  delay(5000);  // pindai ulang setiap 5 detik supaya hasilnya tetap terlihat walaupun Serial Monitor baru dibuka
}
