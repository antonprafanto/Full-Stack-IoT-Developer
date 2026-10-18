// Modul 14 - Praktik 2: sensor Node 2 "Kebun" dibaca dengan urutan hemat daya, lalu dikemas menjadi paket 33 byte.
// Belum ada radio dan belum tidur: setiap 5 detik satu "bangun pura-pura", hasilnya dicetak supaya bisa diperiksa.
// Rangkaian (PETA-PIN versi 5): BME280 SDA -> D21, SCL -> D22; DS18B20 DAT -> D27; sensor tanah ke-2 AOUT -> VN (GPIO 39),
// VCC -> D32 (BUKAN 3V3), GND -> GND. BME280 dan DS18B20 diberi 3,3 V dari rel bawah (+) breadboard mini.
// Library: Adafruit BME280 Library 2.3.0 (ikut terpasang: Adafruit Unified Sensor 1.1.15, Adafruit BusIO 1.17.4),
// OneWire 2.3.8, DallasTemperature 4.0.6.

#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Adafruit_BME280.h>
#include "paket-node2.h"

// ---------- Ganti dengan milikmu ----------
const bool MODE_KALIBRASI = false;  // true = hanya cetak angka mentah sensor tanah ke-2 (langkah kalibrasi)
const int TANAH_KERING = 3000;      // angka mentah di udara, diukur dengan daya dari D32
const int TANAH_BASAH = 1300;       // angka mentah di dalam air

// ---------- Tetap ----------
const int PIN_SATU_KABEL = 27;           // DS18B20
const int PIN_SDA = 21;                  // BME280
const int PIN_SCL = 22;
const int PIN_TANAH = 39;                // VN: AOUT sensor tanah ke-2
const int PIN_DAYA_TANAH = 32;           // D32: listrik sensor tanah, menyala hanya saat dibutuhkan
const unsigned long TENANG_TANAH_MS = 300;  // tunggu sejak sensor tanah dinyalakan sebelum dibaca
const uint8_t RESOLUSI_DS18B20 = 10;     // 0,25 derajat, paling lama 188 ms

OneWire satuKabel(PIN_SATU_KABEL);
DallasTemperature sensorSuhu(&satuKabel);
Adafruit_BME280 bme;
uint16_t sesi = 0;
uint32_t urutan = 0;

static bool adaPerangkat(uint8_t alamat) {
  Wire.beginTransmission(alamat);
  return Wire.endTransmission() == 0;
}

// BME280 mode forced: ukur sekali, lalu sensor kembali tidur sendiri (0,1 uA) sampai disuruh lagi.
static void bacaBme280(PaketNode2 &p) {
  p.suhu = NAN;
  p.kelembapan = NAN;
  p.tekanan = NAN;
  uint8_t alamat = adaPerangkat(0x76) ? 0x76 : (adaPerangkat(0x77) ? 0x77 : 0);
  if (alamat == 0) {
    Serial.println("BME280 tidak ditemukan di 0x76 maupun 0x77: periksa SDA ke D21, SCL ke D22, VCC, dan GND.");
    return;
  }
  if (!bme.begin(alamat)) {
    Serial.printf("Chip di 0x%02X bukan BME280 (chip ID 0x%02X; 0x58 = BMP280, tanpa kelembapan).\n", alamat,
                  (unsigned int)bme.sensorID());
    return;
  }
  bme.setSampling(Adafruit_BME280::MODE_FORCED, Adafruit_BME280::SAMPLING_X1, Adafruit_BME280::SAMPLING_X1,
                  Adafruit_BME280::SAMPLING_X1, Adafruit_BME280::FILTER_OFF);
  if (!bme.takeForcedMeasurement()) {
    Serial.println("BME280 tidak selesai mengukur.");
    return;
  }
  p.suhu = bme.readTemperature();
  p.kelembapan = bme.readHumidity();
  p.tekanan = bme.readPressure() / 100.0f;  // library memberi pascal; dibagi 100 menjadi hPa
}

// Rata-rata 20 bacaan. Angka mentah yang mustahil (sensor lepas atau tanpa listrik) dikirim sebagai -1.
static int8_t bacaTanah(int &mentah) {
  long jumlah = 0;
  for (int i = 0; i < 20; i++) {
    jumlah += analogRead(PIN_TANAH);
    delay(2);
  }
  mentah = jumlah / 20;
  if (mentah < TANAH_BASAH - 300 || mentah > TANAH_KERING + 300) {
    return -1;
  }
  return constrain(map(mentah, TANAH_KERING, TANAH_BASAH, 0, 100), 0, 100);
}

static void kalibrasi() {
  digitalWrite(PIN_DAYA_TANAH, HIGH);
  unsigned long mulai = millis();
  const unsigned long TITIK[] = {10, 50, 100, 200, 400};
  Serial.print("Angka mentah sensor tanah sejak dinyalakan:");
  for (unsigned long t : TITIK) {
    while (millis() - mulai < t) {
      delay(1);
    }
    Serial.printf("  %lu ms: %d", t, analogRead(PIN_TANAH));
  }
  digitalWrite(PIN_DAYA_TANAH, LOW);
  Serial.println();
}

static void bangunPuraPura() {
  unsigned long t0 = millis();
  digitalWrite(PIN_DAYA_TANAH, HIGH);  // 1. sensor tanah dinyalakan PALING AWAL: butuh waktu untuk tenang

  PaketNode2 p = {};
  p.tanda = PAKET_TANDA;
  p.versi = PAKET_VERSI;
  p.fw[0] = 1;
  p.fw[1] = 0;
  p.fw[2] = 0;
  p.sesi = sesi;
  p.urutan = ++urutan;
  p.jedaDetik = 300;
  p.percobaan = 1;

  sensorSuhu.requestTemperatures();  // 2. DS18B20 mulai mengukur, tanpa menunggu
  unsigned long mulaiDs = millis();
  bacaBme280(p);                     // 3. BME280 dibaca sementara DS18B20 masih mengukur
  unsigned long tBme = millis() - t0;
  while (!sensorSuhu.isConversionComplete() && millis() - mulaiDs < 800) {  // 4. tunggu DS18B20 selesai
    delay(5);
  }
  float suhuTanah = sensorSuhu.getTempCByIndex(0);  // -127 kalau sensor tidak menjawab
  p.suhuTanah = (suhuTanah == DEVICE_DISCONNECTED_C) ? NAN : suhuTanah;
  unsigned long tDs = millis() - t0;
  while (millis() - t0 < TENANG_TANAH_MS) {  // 5. sensor tanah sudah cukup lama menyala?
    delay(1);
  }
  int mentah = 0;
  p.tanah = bacaTanah(mentah);
  digitalWrite(PIN_DAYA_TANAH, LOW);  // 6. sensor tanah dipadamkan lagi
  unsigned long tSelesai = millis() - t0;

  Serial.printf("Bangun pura-pura #%lu: BME280 selesai %lu ms, DS18B20 %lu ms, tanah %lu ms.\n", (unsigned long)urutan,
                tBme, tDs, tSelesai);
  Serial.printf("  suhu %.1f C, kelembapan %.0f %%, tekanan %.1f hPa, suhu tanah %.2f C, tanah %d %% (mentah %d)\n",
                p.suhu, p.kelembapan, p.tekanan, p.suhuTanah, p.tanah, mentah);
  const uint8_t *b = (const uint8_t *)&p;  // lihat paketnya byte demi byte
  Serial.print("  paket 33 byte:");
  for (size_t i = 0; i < sizeof(p); i++) {
    Serial.printf(" %02X", b[i]);
  }
  Serial.println();
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  pinMode(PIN_DAYA_TANAH, OUTPUT);
  digitalWrite(PIN_DAYA_TANAH, LOW);
  Wire.begin(PIN_SDA, PIN_SCL);
  sensorSuhu.begin();
  sensorSuhu.setResolution(RESOLUSI_DS18B20);  // EEPROM sensor hanya ditulis kalau resolusinya berbeda
  sensorSuhu.setWaitForConversion(false);      // requestTemperatures() kembali seketika
  sesi = (uint16_t)(esp_random() | 1);
  Serial.println();
  Serial.printf("Praktik 2: ukuran PaketNode2 = %u byte. DS18B20 ditemukan: %u.\n", (unsigned int)sizeof(PaketNode2),
                (unsigned int)sensorSuhu.getDeviceCount());
}

void loop() {
  if (MODE_KALIBRASI) {
    kalibrasi();
    delay(1600);
  } else {
    bangunPuraPura();
    delay(5000);
  }
}
