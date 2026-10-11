// Modul 7 - Praktik 6: merancang layar status Node 1
// Layar OLED menampilkan bacaan kelima sensor Node 1. Untuk merancang, kita memakai bacaan CONTOH yang berganti
// setiap 3 detik, termasuk "kasus terburuk": angka sepanjang mungkin dan sensor yang gagal dibaca.
// Layar OLED: SDA ke D21, SCL ke D22.
// Library: Adafruit SSD1306 2.5.17 (ikut terpasang: Adafruit GFX Library 1.12.6 dan Adafruit BusIO 1.17.4).

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

const int PIN_SDA = 21;          // D21: jalur data I2C (peta pin kanonik)
const int PIN_SCL = 22;          // D22: jalur detak I2C (peta pin kanonik)
const byte ALAMAT_LAYAR = 0x3C;  // "alamat rumah" layar di bus I2C

// Formulir data sensor, sama persis dengan Node 1 (Modul 6).
struct BacaanSensor {
  float suhu;      // derajat Celsius; NAN kalau DHT22 gagal dibaca
  int kelembapan;  // persen; -1 kalau DHT22 gagal dibaca
  int cahaya;      // 0 (gelap gulita) sampai 4095 (sangat terang)
  int tanah;       // persen: 0 = kering seperti di udara, 100 = basah seperti di air
  bool gerak;      // true kalau PIR melihat gerakan
  int level_air;   // persen isi tandon; -1 kalau gema HC-SR04 tidak kembali
};

// Empat bacaan contoh. Isinya berurutan sesuai dengan kolom formulir di atas:
// suhu, kelembapan, cahaya, tanah, gerak, level_air.
BacaanSensor contoh[4] = {
  {28.5, 71, 3094, 45, false, 80},     // 1. siang biasa
  {26.0, 78, 157, 44, true, 79},       // 2. malam, ada orang lewat
  {-40.0, 100, 4095, 100, true, 100},  // 3. kasus terpanjang: semua angka sepanjang mungkin
  {NAN, -1, 0, 0, false, -1},          // 4. DHT22 dan HC-SR04 gagal dibaca
};
const char* namaContoh[4] = {"siang biasa", "malam, ada orang lewat", "kasus terpanjang", "sensor gagal"};
int nomorContoh = 0;

// ---------- Modul 7: layar OLED ----------
Adafruit_SSD1306 layar(128, 64, &Wire, -1);  // lebar 128, tinggi 64, lewat bus I2C, tanpa kaki reset
bool layarAda = false;                       // true kalau layar menjawab di alamat 0x3C

// Ikon 8 x 8 titik: 1 = titik menyala, 0 = padam.
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

// Mencari layar di bus I2C, lalu menyalakannya. Kalau layar tidak ada, program tetap berjalan.
void siapkanLayar() {
  Wire.begin(PIN_SDA, PIN_SCL);
  Wire.beginTransmission(ALAMAT_LAYAR);
  layarAda = Wire.endTransmission() == 0;  // ada yang menjawab di 0x3C?
  if (!layarAda) {
    Serial.println("Layar OLED tidak ditemukan di 0x3C. Node 1 tetap jalan tanpa layar.");
    return;
  }
  layar.begin(SSD1306_SWITCHCAPVCC, ALAMAT_LAYAR);
  layar.cp437(true);  // tabel huruf CP437 yang benar supaya nomor 248 = tanda derajat
  layar.setTextColor(SSD1306_WHITE);
  layar.clearDisplay();
  layar.setTextSize(1);
  layar.setCursor(0, 0);
  layar.println("Node 1 Rumah");
  layar.println("menunggu bacaan...");
  layar.display();
}

// Menulis teks rata kanan: huruf terakhirnya berakhir tepat sebelum x = kanan.
void tulisRataKanan(String teks, int kanan, int y, int ukuran) {
  layar.setTextSize(ukuran);
  layar.setCursor(kanan - teks.length() * 6 * ukuran, y);  // satu huruf = 6 titik x ukuran
  layar.print(teks);
}

// Batang persen: bingkai selebar "lebar" titik, isinya sepanjang persen. Persen di bawah 0 = kosong.
void gambarBatang(int x, int y, int lebar, int persen) {
  layar.drawRect(x, y, lebar, 8, SSD1306_WHITE);
  if (persen > 0) {
    layar.fillRect(x + 2, y + 2, (lebar - 4) * persen / 100, 4, SSD1306_WHITE);
  }
}

// Satu baris layar: ikon, nama, angka rata kanan, lalu batang persen.
// Tanda * pada "const unsigned char* ikon" berarti fungsi ini menerima ikon mana pun yang dikirim
// (mirip const char* untuk teks di Modul 3). Biarkan apa adanya.
void barisBatang(int y, const unsigned char* ikon, String nama, String angka, int persen) {
  layar.drawBitmap(0, y, ikon, 8, 8, SSD1306_WHITE);
  layar.setTextSize(1);
  layar.setCursor(11, y);
  layar.print(nama);
  tulisRataKanan(angka, 82, y, 1);
  gambarBatang(86, y, 42, persen);
}

void tampilkanDiLayar(BacaanSensor b) {
  if (!layarAda) {
    return;
  }
  layar.clearDisplay();

  // Baris atas: suhu di kiri dan kelembapan di kanan. Angkanya besar, satuannya kecil.
  String teksSuhu = "--.-";
  if (!isnan(b.suhu)) {
    teksSuhu = String(b.suhu, 1);
  }
  layar.setTextSize(2);
  layar.setCursor(0, 0);
  layar.print(teksSuhu);
  layar.setTextSize(1);
  layar.write(248);  // tanda derajat
  layar.print("C");

  String teksLembap = "--";
  if (b.kelembapan >= 0) {
    teksLembap = String(b.kelembapan);
  }
  tulisRataKanan(teksLembap, 122, 0, 2);
  layar.setTextSize(1);
  layar.setCursor(122, 0);
  layar.print("%");

  layar.drawFastHLine(0, 17, 128, SSD1306_WHITE);  // garis pemisah

  // Tiga baris dengan batang persen. Cahaya 0-4095 diubah dulu menjadi 0-100 untuk batangnya.
  barisBatang(21, IKON_MATAHARI, "Cahaya", String(b.cahaya), b.cahaya * 100 / 4095);
  barisBatang(32, IKON_TANAMAN, "Tanah", String(b.tanah) + "%", b.tanah);
  String teksAir = "--";
  if (b.level_air >= 0) {
    teksAir = String(b.level_air) + "%";
  }
  barisBatang(43, IKON_TANDON, "Air", teksAir, b.level_air);

  // Baris gerak: dibalik (latar putih) kalau ada gerakan supaya langsung menarik perhatian.
  if (b.gerak) {
    layar.fillRect(0, 53, 128, 10, SSD1306_WHITE);
    layar.drawBitmap(0, 54, IKON_ORANG, 8, 8, SSD1306_BLACK);
    layar.setTextColor(SSD1306_BLACK);
    layar.setCursor(11, 54);
    layar.print("Gerak: ADA ORANG");
    layar.setTextColor(SSD1306_WHITE);
  } else {
    layar.drawBitmap(0, 54, IKON_ORANG, 8, 8, SSD1306_WHITE);
    layar.setCursor(11, 54);
    layar.print("Gerak: sepi");
  }

  layar.display();
}
// ---------- Akhir bagian layar. Mulai dari "Ikon 8 x 8" sampai di sini nanti dipindahkan ke Node 1. ----------

// ---------- Panggung latihan Praktik 6: setup() dan loop() di bawah ini TIDAK ikut dipindahkan. ----------
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  siapkanLayar();
  delay(1000);
}

void loop() {
  Serial.print("Contoh ");
  Serial.print(nomorContoh + 1);
  Serial.print(": ");
  Serial.println(namaContoh[nomorContoh]);
  tampilkanDiLayar(contoh[nomorContoh]);

  nomorContoh++;
  if (nomorContoh > 3) {
    nomorContoh = 0;
  }
  delay(3000);
}
