// layar.cpp - isi modul layar. Daftar fungsinya ada di layar.h.
#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "konfigurasi.h"
#include "pencatat.h"
#include "sistem.h"
#include "pengaturan.h"
#include "jaringan.h"  // Modul 10: teksJaringan(); Modul 19: modeOffline(); Modul 21: mqttDitolak()
#include "layar.h"

const byte ALAMAT_LAYAR = 0x3C;                   // alamat layar OLED di bus I2C
const unsigned long LAMA_HALAMAN_STATUS = 10000;  // halaman status tampil 10 detik, lalu kembali sendiri

static Adafruit_SSD1306 layar(128, 64, &Wire, -1);  // lebar 128, tinggi 64, lewat bus I2C, tanpa kaki reset
static bool layarAda = false;                       // true kalau layar menjawab di alamat 0x3C
static bool halamanStatus = false;                  // true selama halaman status ditampilkan
static unsigned long waktuStatusDibuka = 0;
static unsigned long waktuStatusDigambar = 0;
static BacaanSensor bacaanLayar;                    // bacaan terakhir, untuk menggambar ulang halaman bacaan
static bool adaBacaan = false;

// ---------- Modul 7: halaman bacaan ----------
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
    logError("Layar OLED tidak ditemukan di 0x3C. Node 1 tetap jalan tanpa layar.");
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
static void tulisRataKanan(String teks, int kanan, int y, int ukuran) {
  layar.setTextSize(ukuran);
  layar.setCursor(kanan - teks.length() * 6 * ukuran, y);  // satu huruf = 6 titik x ukuran
  layar.print(teks);
}

// Batang persen: bingkai selebar "lebar" titik, isinya sepanjang persen. Persen di bawah 0 = kosong.
static void gambarBatang(int x, int y, int lebar, int persen) {
  layar.drawRect(x, y, lebar, 8, SSD1306_WHITE);
  if (persen > 0) {
    layar.fillRect(x + 2, y + 2, (lebar - 4) * persen / 100, 4, SSD1306_WHITE);
  }
}

// Satu baris layar: ikon, nama, angka rata kanan, lalu batang persen.
// Tanda * pada "const unsigned char* ikon" berarti fungsi ini menerima ikon mana pun yang dikirim
// (mirip const char* untuk teks di Modul 3). Biarkan apa adanya.
static void barisBatang(int y, const unsigned char* ikon, String nama, String angka, int persen) {
  layar.drawBitmap(0, y, ikon, 8, 8, SSD1306_WHITE);
  layar.setTextSize(1);
  layar.setCursor(11, y);
  layar.print(nama);
  tulisRataKanan(angka, 82, y, 1);
  gambarBatang(86, y, 42, persen);
}

// Rancangan rujukan Modul 7. Kalau kamu memakai rancanganmu sendiri, isi fungsi ini dengan milikmu.
static void gambarHalamanBacaan(BacaanSensor b) {
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

// ---------- Modul 8: halaman status ----------
// Teksnya disusun dengan char[] dan snprintf() (Konsep 6), tanpa String.
static void gambarHalamanStatus() {
  waktuStatusDigambar = millis();
  char teks[24];  // satu baris layar memuat 21 huruf; 24 laci supaya teks terpanjang yang MUNGKIN pun muat
  unsigned long detik = uptimeDetik();

  layar.clearDisplay();
  layar.setTextSize(1);
  layar.setCursor(0, 0);
  layar.print("Menyala selama:");

  // Jam uptime besar: jam:menit:detik. Jamnya boleh lebih dari 24, misalnya 26:03:04.
  snprintf(teks, sizeof(teks), "%02lu:%02lu:%02lu", detik / 3600, (detik / 60) % 60, detik % 60);
  layar.setTextSize(2);
  layar.setCursor(0, 10);
  layar.print(teks);

  layar.setTextSize(1);
  snprintf(teks, sizeof(teks), "Restart: %s", alasanReset());
  layar.setCursor(0, 29);
  layar.print(teks);
  snprintf(teks, sizeof(teks), "Nyala ke-%lu", jumlahNyala());
  layar.setCursor(0, 38);
  layar.print(teks);
  if (modeOffline()) {  // Modul 19: broker tak terjangkau lebih dari 2 menit; Modul 21: atau menolak kunci
    snprintf(teks, sizeof(teks), "%s", mqttDitolak() ? "OFFLINE: MQTT DITOLAK" : "MODE OFFLINE");
  } else {
    snprintf(teks, sizeof(teks), "WiFi %s", teksJaringan());  // Modul 11: misalnya "WiFi ok, MQTT ok"
  }
  layar.setCursor(0, 47);
  layar.print(teks);
  snprintf(teks, sizeof(teks), "v%s  bebas %luKB", VERSI_FIRMWARE, ESP.getFreeHeap() / 1024);
  layar.setCursor(0, 56);
  layar.print(teks);

  layar.display();
}

void tampilkanBacaan(BacaanSensor b) {
  bacaanLayar = b;
  adaBacaan = true;
  if (layarAda && !halamanStatus) {
    gambarHalamanBacaan(b);
  }
}

void bukaHalamanStatus() {
  if (!layarAda) {
    logInfo("Tombol ditekan lama, tetapi layar OLED tidak ada.");
    return;
  }
  logInfo("Tombol ditekan lama: halaman status ditampilkan 10 detik.");
  halamanStatus = true;
  waktuStatusDibuka = millis();
  gambarHalamanStatus();
}

void perbaruiLayar() {
  if (!layarAda || !halamanStatus) {
    return;
  }
  unsigned long sekarang = millis();
  if (sekarang - waktuStatusDibuka >= LAMA_HALAMAN_STATUS) {
    halamanStatus = false;  // waktunya habis: kembali ke halaman bacaan
    if (adaBacaan) {
      gambarHalamanBacaan(bacaanLayar);
    }
    return;
  }
  if (sekarang - waktuStatusDigambar >= 1000) {
    gambarHalamanStatus();  // gambar ulang setiap 1 detik supaya jam uptime berdetak
  }
}

// ---------- Modul 10: pesan singkat empat baris ----------
// Misalnya petunjuk portal WiFi. Halaman bacaan kembali tampil bersama bacaan berikutnya.
void tampilkanPesan(const char* judul, const char* baris2, const char* baris3, const char* baris4) {
  if (!layarAda) {
    return;
  }
  layar.clearDisplay();
  layar.setTextSize(1);
  layar.setCursor(0, 0);
  layar.print(judul);
  layar.drawFastHLine(0, 11, 128, SSD1306_WHITE);  // garis pemisah di bawah judul
  layar.setCursor(0, 18);
  layar.print(baris2);
  layar.setCursor(0, 30);
  layar.print(baris3);
  layar.setCursor(0, 46);
  layar.print(baris4);
  layar.display();
}
