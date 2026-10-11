// Modul 7 - Kemenangan Cepat: layar OLED pertamamu
// Layar OLED 0,96" (chip SSD1306, 128 x 64 titik) di bus I2C: SDA ke D21, SCL ke D22.
// Library: Adafruit SSD1306 2.5.17 (ikut terpasang: Adafruit GFX Library 1.12.6 dan Adafruit BusIO 1.17.4).

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

const int PIN_SDA = 21;           // D21: jalur data I2C (peta pin kanonik)
const int PIN_SCL = 22;           // D22: jalur detak I2C (peta pin kanonik)
const byte ALAMAT_LAYAR = 0x3C;   // "alamat rumah" layar di bus I2C

Adafruit_SSD1306 layar(128, 64, &Wire, -1);  // lebar 128, tinggi 64, lewat bus I2C, tanpa kaki reset

void setup() {
  Serial.begin(115200);
  Wire.begin(PIN_SDA, PIN_SCL);
  layar.begin(SSD1306_SWITCHCAPVCC, ALAMAT_LAYAR);  // SWITCHCAPVCC: layar membuat tegangan tingginya sendiri

  layar.clearDisplay();               // 1. kosongkan "kertas gambar" di memori ESP32
  layar.setTextColor(SSD1306_WHITE);  //    huruf putih (= titik menyala)
  layar.setTextSize(2);               //    huruf ukuran 2: tinggi 16 titik
  layar.setCursor(0, 0);              //    mulai dari pojok kiri atas
  layar.println("Halo,");             // 2. gambar teksnya
  layar.println("Node 1!");
  layar.display();                    // 3. kirim gambar itu ke layar lewat I2C

  Serial.println("Layar OLED siap.");
  delay(2000);
}

void loop() {
  layar.clearDisplay();
  layar.setTextSize(1);
  layar.setCursor(0, 0);
  layar.println("Detik sejak menyala:");
  layar.setTextSize(4);   // angka besar: tinggi 32 titik
  layar.setCursor(0, 20);
  layar.println(millis() / 1000);
  layar.display();
  delay(1000);
}
