// Modul 10 - Praktik 7: kirim bacaan ke laptop (HTTP POST berisi JSON)
// Setiap 10 detik, ESP32 mengirim suhu dan kelembapan (DHT22, D14) serta cahaya (LDR, VP)
// ke penerima-webhook.js (Modul 4) yang berjalan di laptopmu.
// Laptop dan ESP32 harus tersambung ke WiFi yang SAMA.

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>  // library DHT dari Modul 6
#include <time.h>
#include "secrets.h"  // berisi WIFI_NAMA dan WIFI_SANDI

// GANTI 192.168.1.10 dengan alamat IP laptopmu (cara mencarinya ada di Praktik 7).
// HTTP polos (bukan HTTPS): hanya untuk server buatan sendiri di jaringan rumah (Konsep 8).
const char ALAMAT_PENERIMA[] = "http://192.168.1.10:3000/telemetry";

const int PIN_DHT = 14;  // DHT22, Modul 6
const int PIN_LDR = 36;  // VP: LDR (ADC1), Modul 6
const char ZONA_WAKTU[] = "WIB-7";
const unsigned long JEDA_KIRIM = 10000;  // kirim setiap 10 detik (Node 1 di bagian ➕: setiap 1 menit)

DHT dht(PIN_DHT, DHT22);
unsigned long waktuKirimTerakhir = 0;
int nomorKiriman = 0;

// Cap waktu ts (Lampiran A), sama dengan Praktik 5. Menjawab false kalau jam belum disetel dari internet.
bool buatTs(char* ts, size_t ukuran) {
  time_t sekarang = time(nullptr);
  struct tm utc;
  gmtime_r(&sekarang, &utc);
  if (utc.tm_year + 1900 < 2025) {
    return false;
  }
  strftime(ts, ukuran, "%Y-%m-%dT%H:%M:%SZ", &utc);
  return true;
}

void kirimBacaan() {
  char ts[21];
  if (!buatTs(ts, sizeof(ts))) {
    Serial.println("Jam belum disetel dari internet: kiriman ditunda (setiap data wajib membawa ts).");
    return;
  }

  // 1. Baca sensor, lalu susun isi surat (body) dengan ArduinoJson.
  int kelembapan = -1;  // -1 = gagal dibaca, seperti Node 1
  float bacaanKelembapan = dht.readHumidity();
  if (!isnan(bacaanKelembapan)) {
    kelembapan = round(bacaanKelembapan);
  }
  JsonDocument dokumen;
  dokumen["ts"] = ts;
  dokumen["suhu"] = dht.readTemperature();  // NAN (gagal dibaca) ditulis ArduinoJson sebagai null
  dokumen["kelembapan"] = kelembapan;
  dokumen["cahaya"] = 4095 - analogRead(PIN_LDR);  // dibalik seperti Node 1: makin terang, makin besar
  char isi[128];
  serializeJson(dokumen, isi, sizeof(isi));  // wadah -> teks JSON

  // 2. Kirim surat POST ke laptop.
  HTTPClient http;
  http.setConnectTimeout(2000);  // laptop ada di rumah: 2 detik sudah sangat lama
  http.setTimeout(2000);
  http.begin(ALAMAT_PENERIMA);
  http.addHeader("Content-Type", "application/json");  // label amplop: "isinya JSON"
  nomorKiriman++;
  Serial.printf("Kiriman %d: %s\n", nomorKiriman, isi);
  int kode = http.POST(isi);

  // 3. Baca balasannya.
  if (kode <= 0) {
    Serial.printf("  -> gagal: %s (kode %d). Penerima menyala? Alamat IP laptop benar?\n",
                  http.errorToString(kode).c_str(), kode);
  } else {
    Serial.printf("  -> kode status %d, balasan: %s\n", kode, http.getString().c_str());
  }
  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(500);
  dht.begin();
  Serial.println();
  Serial.printf("Menyambung ke \"%s\"", WIFI_NAMA);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_NAMA, WIFI_SANDI);
  unsigned long mulai = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - mulai < 20000) {
    Serial.print(".");
    delay(250);
  }
  Serial.println();
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Belum tersambung setelah 20 detik. Periksa tab secrets.h, lalu tekan EN.");
    return;
  }
  Serial.printf("Tersambung, IP ESP32 %s. Penerima: %s\n", WiFi.localIP().toString().c_str(), ALAMAT_PENERIMA);
  configTzTime(ZONA_WAKTU, "pool.ntp.org", "asia.pool.ntp.org");  // jam dari internet (Praktik 5)
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }
  if (millis() - waktuKirimTerakhir >= JEDA_KIRIM) {
    waktuKirimTerakhir = millis();
    kirimBacaan();
  }
}
