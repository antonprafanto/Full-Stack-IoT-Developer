// Node 2 "Kebun" - Rumah Pintar Mini - firmware v1.0.0 (Modul 14): sensor bertenaga baterai lewat ESP-NOW
// Setiap 5 menit: bangun -> baca BME280 + DS18B20 + sensor tanah ke-2 (+ baterai, kalau dipasang) -> kirim satu
// paket ESP-NOW ke Node 1 -> tidur lagi. Urutannya sengaja: semua sensor dulu (radio masih mati), radio sebentar, tidur.
// Node 2 tidak pernah tersambung ke router dan tidak tahu kata sandi WiFi: cukup NAMA WiFi rumah, untuk mencari channel.
// Pin menurut PETA-PIN.md versi 5, bagian Node 2. Papan: DOIT ESP32 DEVKIT V1 (rak program bawaan cukup).
// Library: Adafruit BME280 Library 2.3.0 (ikut terpasang: Adafruit Unified Sensor 1.1.15, Adafruit BusIO 1.17.4),
// OneWire 2.3.8, DallasTemperature 4.0.6. WiFi dan ESP-NOW ikut paket esp32 (versi 3.3.7 atau lebih baru).

#include <Wire.h>
#include <WiFi.h>
#include <esp_now.h>
#include <esp_mac.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Adafruit_BME280.h>
#include "paket-node2.h"

// Praktik 8: kunci enkripsi ESP-NOW ada di kunci.h, yang TIDAK ikut ke GitHub (.gitignore).
// Selama file itu belum ada, ESP-NOW berjalan tanpa enkripsi.
#if __has_include("kunci.h")
#include "kunci.h"
#else
const bool PAKAI_ENKRIPSI = false;
const char KUNCI_PMK[] = "";
const char KUNCI_LMK[] = "";
#endif
static_assert(!PAKAI_ENKRIPSI || sizeof(KUNCI_PMK) == 17, "KUNCI_PMK di kunci.h harus tepat 16 huruf/angka");
static_assert(!PAKAI_ENKRIPSI || sizeof(KUNCI_LMK) == 17, "KUNCI_LMK di kunci.h harus tepat 16 huruf/angka");

// ---------- Ganti dengan milikmu ----------
const uint8_t MAC_NODE1[6] = {0xA4, 0xCF, 0x12, 0xE5, 0xB7, 0xC0};  // MAC WiFi Node 1 (= device_id Node 1), per 2 digit
const char NAMA_WIFI[] = "NamaWiFiRumahmu";  // nama WiFi rumah tempat Node 1 tersambung, PERSIS; kata sandi TIDAK perlu
const uint8_t KANAL_TETAP = 0;               // 0 = cari sendiri lewat NAMA_WIFI; 1-11 = selalu pakai channel ini
const int TANAH_KERING = 3000;               // kalibrasi sensor tanah KE-2 dengan daya dari D32 (Praktik 2)
const int TANAH_BASAH = 1300;
const uint16_t JEDA_DETIK = 300;             // bangun setiap 5 menit; uji "matikan router" (Praktik 6): 60
const bool ADA_PEMBAGI_BATERAI = false;      // true kalau pembagi tegangan baterai dipasang ke VP (bedah teknis)
const float FAKTOR_PEMBAGI = 2.0;            // dua resistor sama besar; koreksi dengan multimeter

// ---------- Tetap ----------
const uint8_t VERSI_FW[3] = {1, 0, 0};
const int PIN_LED_BANGUN = 2;              // LED biru bawaan: menyala selama bangun
const int PIN_SATU_KABEL = 27;             // DS18B20
const int PIN_SDA = 21;                    // BME280
const int PIN_SCL = 22;
const int PIN_TANAH = 39;                  // VN: AOUT sensor tanah ke-2
const int PIN_DAYA_TANAH = 32;             // D32: listrik sensor tanah, menyala hanya selama bangun
const int PIN_BATERAI = 36;                // VP: titik tengah pembagi tegangan (pilihan)
const unsigned long TENANG_TANAH_MS = 300; // tunggu sejak sensor tanah dinyalakan sebelum dibaca
const uint8_t RESOLUSI_DS18B20 = 10;       // 0,25 derajat, paling lama 188 ms
const int MAKS_PERCOBAAN = 3;              // kirim ulang kalau ACK radio Node 1 tidak datang
const int GAGAL_SEBELUM_PINDAI = 2;        // setelah 2 kali bangun gagal berturut-turut, cari channel lagi

// ---------- Ingatan RTC: selamat dari deep sleep, hilang kalau baterai dicabut atau EN ditekan ----------
RTC_DATA_ATTR uint16_t sesi = 0;  // 0 = papan baru menyala dari mati
RTC_DATA_ATTR uint32_t urutan = 0;
RTC_DATA_ATTR uint8_t kanal = 0;  // channel yang terakhir dipakai (0 = belum tahu)
RTC_DATA_ATTR uint8_t gagalBeruntun = 0;

OneWire satuKabel(PIN_SATU_KABEL);
DallasTemperature sensorSuhu(&satuKabel);
Adafruit_BME280 bme;

volatile bool kirimSelesai = false;  // diisi petugas WiFi, dibaca setup()
volatile bool kirimBerhasil = false;

// Dipanggil petugas WiFi setelah radio menerima (atau tidak menerima) ACK dari Node 1.
static void saatKirimSelesai(const esp_now_send_info_t *info, esp_now_send_status_t status) {
  kirimBerhasil = (status == ESP_NOW_SEND_SUCCESS);
  kirimSelesai = true;
}

static bool adaPerangkat(uint8_t alamat) {
  Wire.beginTransmission(alamat);
  return Wire.endTransmission() == 0;
}

// BME280 mode forced: ukur sekali, lalu sensor kembali tidur sendiri (0,1 uA) selama Node 2 tidur.
static void bacaBme280(PaketNode2 &p) {
  p.suhu = NAN;
  p.kelembapan = NAN;
  p.tekanan = NAN;
  Wire.begin(PIN_SDA, PIN_SCL);
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
    return;
  }
  p.suhu = bme.readTemperature();
  p.kelembapan = bme.readHumidity();
  p.tekanan = bme.readPressure() / 100.0f;  // library memberi pascal; dibagi 100 menjadi hPa
}

// Rata-rata 20 bacaan. Angka mentah yang mustahil (sensor lepas atau tanpa listrik) dikirim sebagai -1.
static int8_t bacaTanah() {
  long jumlah = 0;
  for (int i = 0; i < 20; i++) {
    jumlah += analogRead(PIN_TANAH);
    delay(2);
  }
  int mentah = jumlah / 20;
  if (mentah < TANAH_BASAH - 300 || mentah > TANAH_KERING + 300) {
    Serial.printf("Sensor tanah: angka mentah %d mustahil, dikirim sebagai gagal.\n", mentah);
    return -1;
  }
  return constrain(map(mentah, TANAH_KERING, TANAH_BASAH, 0, 100), 0, 100);
}

static uint16_t bacaBateraiMv() {
  if (!ADA_PEMBAGI_BATERAI) {
    return 0;  // 0 = tidak diukur; Node 1 tidak menulis kolom baterai
  }
  uint32_t jumlah = 0;
  for (int i = 0; i < 8; i++) {
    jumlah += analogReadMilliVolts(PIN_BATERAI);
  }
  return (uint16_t)(jumlah / 8 * FAKTOR_PEMBAGI);
}

// Memindai satu nama WiFi saja: channel router itu = channel Node 1 (Node 1 tersambung ke router).
static uint8_t cariKanal() {
  int jumlah = WiFi.scanNetworks(false, false, false, 120, 0, NAMA_WIFI);
  uint8_t hasil = 0;
  for (int i = 0; i < jumlah; i++) {
    if (WiFi.SSID(i) == NAMA_WIFI) {
      hasil = WiFi.channel(i);
      break;
    }
  }
  WiFi.scanDelete();
  if (hasil == 0) {
    Serial.printf("WiFi \"%s\" tidak ditemukan: router mati, atau namanya salah tulis?\n", NAMA_WIFI);
  }
  return hasil;
}

static bool siapkanEspNow() {
  if (WiFi.setChannel(kanal) != ESP_OK) {
    Serial.printf("Channel %u ditolak ESP32. Router di channel 12 atau 13? Ubah router ke 1, 6, atau 11.\n", kanal);
    return false;
  }
  if (esp_now_init() != ESP_OK) {
    return false;
  }
  esp_now_register_send_cb(saatKirimSelesai);
  esp_now_peer_info_t peer = {};
  memcpy(peer.peer_addr, MAC_NODE1, 6);
  peer.channel = 0;  // 0 = channel radio saat ini (yang baru saja dipasang)
  peer.ifidx = WIFI_IF_STA;
  peer.encrypt = PAKAI_ENKRIPSI;
  if (PAKAI_ENKRIPSI) {  // Praktik 8: PMK dan LMK harus sama persis dengan milik Node 1
    esp_now_set_pmk((const uint8_t *)KUNCI_PMK);
    memcpy(peer.lmk, KUNCI_LMK, ESP_NOW_KEY_LEN);
  }
  return esp_now_add_peer(&peer) == ESP_OK;
}

static bool kirimSekali(const PaketNode2 &p) {
  kirimSelesai = false;
  if (esp_now_send(MAC_NODE1, (const uint8_t *)&p, sizeof(p)) != ESP_OK) {
    return false;
  }
  unsigned long mulai = millis();
  while (!kirimSelesai && millis() - mulai < 200) {  // jangan menunggu selamanya: Node 2 harus tetap bisa tidur
    delay(1);
  }
  return kirimSelesai && kirimBerhasil;
}

void setup() {
  pinMode(PIN_LED_BANGUN, OUTPUT);
  digitalWrite(PIN_LED_BANGUN, HIGH);
  pinMode(PIN_DAYA_TANAH, OUTPUT);
  digitalWrite(PIN_DAYA_TANAH, HIGH);  // 1. sensor tanah dinyalakan PALING AWAL: butuh waktu untuk tenang
  unsigned long nyalaTanah = millis();
  Serial.begin(115200);
  if (sesi == 0) {  // baru menyala dari mati: buku catatan baru
    sesi = (uint16_t)(esp_random() | 1);
    urutan = 0;
    uint8_t mac[6];
    esp_read_mac(mac, ESP_MAC_WIFI_STA);
    Serial.printf("\nNode 2 Kebun v%u.%u.%u, MAC %02X:%02X:%02X:%02X:%02X:%02X (device_id %02x%02x%02x%02x%02x%02x)\n",
                  VERSI_FW[0], VERSI_FW[1], VERSI_FW[2], mac[0], mac[1], mac[2], mac[3], mac[4], mac[5], mac[0],
                  mac[1], mac[2], mac[3], mac[4], mac[5]);
    Serial.printf("Salin ke MAC_NODE2 di konfigurasi.h Node 1: {0x%02X, 0x%02X, 0x%02X, 0x%02X, 0x%02X, 0x%02X}\n",
                  mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  }
  urutan++;

  PaketNode2 p = {};
  p.tanda = PAKET_TANDA;
  p.versi = PAKET_VERSI;
  memcpy(p.fw, VERSI_FW, 3);
  p.sesi = sesi;
  p.urutan = urutan;
  p.jedaDetik = JEDA_DETIK;

  // 2. DS18B20 mulai mengukur (tanpa menunggu), sementara sensor lain dibaca.
  sensorSuhu.begin();
  sensorSuhu.setResolution(RESOLUSI_DS18B20);  // EEPROM sensor hanya ditulis kalau resolusinya berbeda
  sensorSuhu.setWaitForConversion(false);
  sensorSuhu.requestTemperatures();
  unsigned long mulaiDs = millis();

  // 3. BME280 dan baterai, selagi radio masih mati.
  bacaBme280(p);
  p.bateraiMv = bacaBateraiMv();

  // 4. Tunggu DS18B20 selesai, lalu baca sensor tanah dan padamkan lagi.
  while (!sensorSuhu.isConversionComplete() && millis() - mulaiDs < 800) {
    delay(5);
  }
  float suhuTanah = sensorSuhu.getTempCByIndex(0);  // -127 kalau sensor tidak menjawab
  p.suhuTanah = (suhuTanah == DEVICE_DISCONNECTED_C) ? NAN : suhuTanah;
  while (millis() - nyalaTanah < TENANG_TANAH_MS) {
    delay(1);
  }
  p.tanah = bacaTanah();
  digitalWrite(PIN_DAYA_TANAH, LOW);

  // 5. Radio sebentar saja: cari channel kalau perlu, kirim, tunggu ACK, coba lagi kalau gagal.
  WiFi.persistent(false);  // setelan WiFi cukup di RAM: memori flash tidak ditulis setiap bangun
  WiFi.mode(WIFI_STA);     // radio menyala TANPA WiFi.begin(): Node 2 tidak pernah tersambung ke router
  if (KANAL_TETAP != 0) {
    kanal = KANAL_TETAP;
  } else if (kanal == 0 || gagalBeruntun >= GAGAL_SEBELUM_PINDAI) {
    uint8_t baru = cariKanal();
    if (baru != 0) {
      kanal = baru;  // tidak ketemu (router mati)? Channel lama dipertahankan: Node 1 masih menunggu di sana
    }
    gagalBeruntun = 0;
  }
  bool terkirim = false;
  if (kanal != 0 && siapkanEspNow()) {
    for (int i = 1; i <= MAKS_PERCOBAAN && !terkirim; i++) {
      p.percobaan = i;
      terkirim = kirimSekali(p);
      if (!terkirim && i < MAKS_PERCOBAAN) {
        delay(i == 1 ? 100 : 2500);  // yang terakhir sekitar 2,6 detik sesudah yang pertama: lewati pindaian Node 1
      }
    }
  }
  gagalBeruntun = terkirim ? 0 : gagalBeruntun + 1;
  esp_now_deinit();
  WiFi.mode(WIFI_OFF);  // ESP-IDF: matikan WiFi sebelum tidur

  // 6. Laporan, lalu tidur.
  Serial.printf("#%lu %s (percobaan ke-%u), channel %u. Suhu %.1f C, lembap %.0f %%, %.1f hPa, tanah %.1f C / %d %%. "
                "Bangun %lu ms.\n",
                (unsigned long)urutan, terkirim ? "terkirim" : "GAGAL", p.percobaan, kanal, p.suhu, p.kelembapan,
                p.tekanan, p.suhuTanah, p.tanah, millis());
  Serial.flush();
  digitalWrite(PIN_LED_BANGUN, LOW);
  esp_sleep_enable_timer_wakeup(JEDA_DETIK * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {
  // Tidak pernah dijalankan: Node 2 selalu mulai dari setup() setiap kali bangun.
}
