// Modul 7 - Praktik 2: kotak peralatan layar OLED
// Tiga "halaman" bergantian setiap 3 detik: ukuran huruf, koordinat, lalu ikon dan angka besar.
// Layar OLED: SDA ke D21, SCL ke D22.
// Library: Adafruit SSD1306 2.5.17 (ikut terpasang: Adafruit GFX Library 1.12.6 dan Adafruit BusIO 1.17.4).

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

const int PIN_SDA = 21;          // D21: jalur data I2C (peta pin kanonik)
const int PIN_SCL = 22;          // D22: jalur detak I2C (peta pin kanonik)
const byte ALAMAT_LAYAR = 0x3C;  // "alamat rumah" layar di bus I2C

Adafruit_SSD1306 layar(128, 64, &Wire, -1);

// Ikon 8 x 8 titik. Setiap angka biner adalah satu baris: 1 = titik menyala, 0 = padam.
const unsigned char IKON_TERMOMETER[] = {
  0b00011000,
  0b00100100,
  0b00100100,
  0b00111100,
  0b00111100,
  0b01111110,
  0b01111110,
  0b00111100,
};
const unsigned char IKON_TETES[] = {
  0b00011000,
  0b00011000,
  0b00111100,
  0b00111100,
  0b01111110,
  0b01111110,
  0b01111110,
  0b00111100,
};
const unsigned char IKON_MATAHARI[] = {
  0b00011000,
  0b01000010,
  0b00111100,
  0b10111101,
  0b10111101,
  0b00111100,
  0b01000010,
  0b00011000,
};
const unsigned char IKON_TANAMAN[] = {
  0b11000011,
  0b01100110,
  0b00111100,
  0b00011000,
  0b00011000,
  0b11111111,
  0b01111110,
  0b00111100,
};
const unsigned char IKON_TANDON[] = {
  0b10000001,
  0b10000001,
  0b10000001,
  0b11011011,
  0b11111111,
  0b11111111,
  0b11111111,
  0b01111110,
};
const unsigned char IKON_ORANG[] = {
  0b00011000,
  0b00011000,
  0b01111110,
  0b00011000,
  0b00011000,
  0b00100100,
  0b01000010,
  0b01000010,
};

int halaman = 1;        // halaman yang sedang tampil: 1, 2, atau 3
int persenContoh = 45;  // angka contoh untuk batang persen; naik 10 setiap kali halaman 3 tampil

// Halaman 1: tiga ukuran huruf. Satu huruf ukuran 1 = 6 x 8 titik (termasuk jarak antarhuruf).
void halamanUkuranHuruf() {
  layar.setTextSize(1);
  layar.setCursor(0, 0);
  layar.print("Ukuran 1: kecil");
  layar.setTextSize(2);
  layar.setCursor(0, 16);  // mulai di bawah pita kuning layar dua warna
  layar.print("Ukuran 2");
  layar.setTextSize(3);
  layar.setCursor(0, 40);  // 40 + 24 = 64: tepat sampai baris terbawah
  layar.print("Uk. 3");
}

// Halaman 2: koordinat. x bertambah ke kanan, y bertambah ke BAWAH.
void halamanKoordinat() {
  layar.drawRect(0, 0, 128, 64, SSD1306_WHITE);   // bingkai di tepi layar
  layar.setTextSize(1);
  layar.setCursor(3, 3);
  layar.print("(0,0)");
  layar.setCursor(44, 3);
  layar.print("x");
  layar.write(26);                                 // panah ke kanan (nomor 26 di tabel huruf)
  layar.setCursor(3, 28);
  layar.print("y");
  layar.write(25);                                 // panah ke bawah (nomor 25)
  layar.drawLine(60, 32, 68, 32, SSD1306_WHITE);   // tanda + di tengah layar
  layar.drawLine(64, 28, 64, 36, SSD1306_WHITE);
  layar.setCursor(70, 24);
  layar.print("(64,32)");
  layar.setCursor(76, 53);
  layar.print("(127,63)");
}

// Halaman 3: ikon, angka besar dengan satuan kecil, batang persen, dan tulisan terbalik.
void halamanIkon() {
  layar.drawBitmap(0, 0, IKON_TERMOMETER, 8, 8, SSD1306_WHITE);
  layar.drawBitmap(14, 0, IKON_TETES, 8, 8, SSD1306_WHITE);
  layar.drawBitmap(28, 0, IKON_MATAHARI, 8, 8, SSD1306_WHITE);
  layar.drawBitmap(42, 0, IKON_TANAMAN, 8, 8, SSD1306_WHITE);
  layar.drawBitmap(56, 0, IKON_TANDON, 8, 8, SSD1306_WHITE);
  layar.drawBitmap(70, 0, IKON_ORANG, 8, 8, SSD1306_WHITE);

  layar.setTextSize(3);         // angka besar: satu huruf 18 x 24 titik
  layar.setCursor(0, 16);
  layar.print("28.5");
  layar.setTextSize(1);         // satuan kecil di pojok kanan atas angka
  layar.setCursor(74, 16);
  layar.write(248);             // tanda derajat (nomor 248 di tabel huruf)
  layar.print("C");

  layar.fillRect(88, 30, 40, 11, SSD1306_WHITE);      // kotak putih...
  layar.setTextColor(SSD1306_BLACK);                  // ...ditulisi huruf hitam = tulisan terbalik
  layar.setCursor(91, 32);
  layar.print("GERAK");
  layar.setTextColor(SSD1306_WHITE);                  // kembalikan ke huruf putih

  layar.setCursor(0, 46);
  layar.print("Tanah ");
  layar.print(persenContoh);
  layar.print("%");
  layar.drawRect(0, 56, 128, 8, SSD1306_WHITE);               // bingkai batang
  layar.fillRect(2, 58, 124 * persenContoh / 100, 4, SSD1306_WHITE);  // isi batang sesuai persen

  persenContoh = persenContoh + 10;
  if (persenContoh > 100) {
    persenContoh = 0;
  }
}

void setup() {
  Serial.begin(115200);
  Wire.begin(PIN_SDA, PIN_SCL);
  layar.begin(SSD1306_SWITCHCAPVCC, ALAMAT_LAYAR);
  layar.cp437(true);  // pakai tabel huruf CP437 yang benar supaya nomor 248 = tanda derajat
  layar.setTextColor(SSD1306_WHITE);
  Serial.println("Kotak peralatan layar siap. Halaman berganti setiap 3 detik.");
}

void loop() {
  layar.clearDisplay();
  if (halaman == 1) {
    halamanUkuranHuruf();
  } else if (halaman == 2) {
    halamanKoordinat();
  } else {
    halamanIkon();
  }
  layar.display();
  Serial.print("Halaman ");
  Serial.println(halaman);

  halaman++;
  if (halaman > 3) {
    halaman = 1;
  }
  delay(3000);
}
