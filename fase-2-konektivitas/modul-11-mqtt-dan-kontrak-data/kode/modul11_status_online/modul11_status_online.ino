// Modul 11 - Praktik 4: status online/offline otomatis (retained + Last Will)
// Lanjutan Praktik 3. Begitu tersambung, ESP32 menerbitkan "online" ke rpm/<device_id>/status sebagai pesan
// retained ("papan pengumuman"). Saat menyambung, ESP32 juga menitipkan "surat wasiat" (Last Will) ke broker:
// kalau ESP32 hilang tanpa pamit, broker sendiri yang menerbitkan "offline" ke topik yang sama (Konsep 7).

#include <WiFi.h>
#include <PubSubClient.h>  // library PubSubClient3 versi 3.3.2
#include <ArduinoJson.h>   // library ArduinoJson versi 7.4.3 (Modul 10)
#include <DHT.h>           // library DHT dari Modul 6
#include <time.h>
#include <esp_mac.h>       // esp_read_mac(): alamat MAC langsung dari chip
#include "secrets.h"       // berisi WIFI_NAMA dan WIFI_SANDI

#ifndef MQTT_QOS1  // hanya PubSubClient3 yang punya nama ini
#error "Yang terpakai PubSubClient lama (2.8). Hapus lewat Library Manager, lalu pasang PubSubClient3 versi 3.3.2."
#endif

// GANTI 192.168.1.10 dengan alamat IP laptopmu (cara mencarinya: Modul 10, Praktik 7.1).
// Selalu tulis alamat IP, bukan nama: mencari nama bisa menahan program beberapa detik.
const char ALAMAT_BROKER[] = "192.168.1.10";
const uint16_t PORT_BROKER = 1883;

const int PIN_DHT = 14;  // DHT22, Modul 6
const int PIN_LDR = 36;  // VP: LDR (ADC1), Modul 6
const char ZONA_WAKTU[] = "WIB-7";
const unsigned long JEDA_KIRIM = 10000;     // telemetry setiap 10 detik (Lampiran A)
const unsigned long JEDA_COBA_MQTT = 5000;  // gagal menyambung ke broker? coba lagi 5 detik kemudian

DHT dht(PIN_DHT, DHT22);
WiFiClient klienJaringan;          // sambungan TCP ke broker
PubSubClient mqtt(klienJaringan);  // MQTT berjalan di atas sambungan itu
char idPerangkat[13];              // device_id: 12 digit heksadesimal + tanda akhir teks (Lampiran A)
char topikTelemetry[40];           // rpm/<device_id>/telemetry
char topikStatus[40];              // rpm/<device_id>/status
unsigned long waktuKirimTerakhir = 0;
unsigned long waktuCobaTerakhir = 0;
bool sudahPernahCoba = false;

// Arti angka mqtt.state() (Konsep 10). Angka 1-5 adalah jawaban broker sendiri.
const char* namaKeadaanMqtt(int kode) {
  switch (kode) {
    case -4: return "broker tidak menjawab tepat waktu";
    case -3: return "sambungan terputus";
    case -2: return "gagal tersambung ke broker";
    case -1: return "belum tersambung";
    case 0: return "tersambung";
    case 4: return "nama pengguna atau kata sandi ditolak";
    case 5: return "tidak diizinkan broker";
    default: return "ditolak broker";
  }
}

// Cap waktu ts (Lampiran A), sama dengan Modul 10. Menjawab false kalau jam belum disetel dari internet.
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

// Satu kali percobaan menyambung, paling sering setiap JEDA_COBA_MQTT. Tidak pernah berputar menunggu.
void cobaSambungkanBroker() {
  if (sudahPernahCoba && millis() - waktuCobaTerakhir < JEDA_COBA_MQTT) {
    return;
  }
  sudahPernahCoba = true;
  waktuCobaTerakhir = millis();
  unsigned long mulai = millis();
  // Surat wasiat: topik status, QoS 1, retained, isi "offline". Broker menyimpannya selama ESP32 tersambung.
  if (mqtt.connect(idPerangkat, topikStatus, 1, true, "offline")) {
    Serial.printf("Tersambung ke broker %s dalam %lu ms, sebagai %s\n", ALAMAT_BROKER, millis() - mulai, idPerangkat);
    mqtt.publish(topikStatus, "online", true);  // true = retained: tetap terpasang untuk pelanggan yang datang belakangan
    Serial.printf("Terbit ke %s: online (retained)\n", topikStatus);
  } else {
    int kode = mqtt.state();
    Serial.printf("Gagal ke broker setelah %lu ms: %s (kode %d). Coba lagi 5 detik lagi.\n", millis() - mulai,
                  namaKeadaanMqtt(kode), kode);
  }
}

void kirimTelemetry() {
  char ts[21];
  if (!buatTs(ts, sizeof(ts))) {
    Serial.println("Jam belum disetel dari internet: kiriman ditunda (setiap data wajib membawa ts).");
    return;
  }
  JsonDocument dokumen;
  dokumen["ts"] = ts;
  dokumen["suhu"] = dht.readTemperature();  // NAN (gagal dibaca) ditulis ArduinoJson sebagai null
  float kelembapan = dht.readHumidity();
  if (isnan(kelembapan)) {
    dokumen["kelembapan"] = nullptr;  // bacaan gagal ditulis null (kontrak data, Konsep 5)
  } else {
    dokumen["kelembapan"] = (int)round(kelembapan);
  }
  dokumen["cahaya"] = 4095 - analogRead(PIN_LDR);  // dibalik seperti Node 1: makin terang, makin besar
  char isi[160];
  size_t panjang = serializeJson(dokumen, isi, sizeof(isi));
  if (panjang >= sizeof(isi)) {
    Serial.println("JSON terlalu panjang untuk wadah isi[]: tidak dikirim.");
    return;
  }
  if (mqtt.publish(topikTelemetry, isi)) {
    Serial.printf("Terbit ke %s: %s\n", topikTelemetry, isi);
  } else {
    Serial.printf("GAGAL terbit ke %s\n", topikTelemetry);
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  dht.begin();
  Serial.println();

  uint8_t mac[6];
  esp_read_mac(mac, ESP_MAC_WIFI_STA);
  snprintf(idPerangkat, sizeof(idPerangkat), "%02x%02x%02x%02x%02x%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  snprintf(topikTelemetry, sizeof(topikTelemetry), "rpm/%s/telemetry", idPerangkat);
  snprintf(topikStatus, sizeof(topikStatus), "rpm/%s/status", idPerangkat);

  klienJaringan.setConnectionTimeout(1000);  // menyambung TCP paling lama 1 detik (bawaan: 3 detik)
  mqtt.setServer(ALAMAT_BROKER, PORT_BROKER);
  mqtt.setSocketTimeout(1);   // menunggu jawaban broker paling lama 1 detik (bawaan: 15 detik)
  mqtt.setBufferSize(512);    // ruang pesan 512 byte (bawaan: 256), Konsep 9

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
  Serial.printf("Tersambung ke WiFi, IP ESP32 %s, device_id %s\n", WiFi.localIP().toString().c_str(), idPerangkat);
  configTzTime(ZONA_WAKTU, "pool.ntp.org", "asia.pool.ntp.org");  // jam dari internet (Modul 10)
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    return;  // WiFi putus: paket esp32 menyambung ulang sendiri (Modul 10)
  }
  if (!mqtt.connected()) {
    cobaSambungkanBroker();
    return;
  }
  mqtt.loop();  // wajib dipanggil sesering mungkin: menjaga sambungan tetap hidup
  if (millis() - waktuKirimTerakhir >= JEDA_KIRIM) {
    waktuKirimTerakhir = millis();
    kirimTelemetry();
  }
}
