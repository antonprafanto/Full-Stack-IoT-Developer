// Modul 11 - Praktik 5: QoS 0 vs QoS 1 saat WiFi ESP32 mati
// ESP32 berlangganan latihan/<device_id>/qos dengan QoS 1 dan sesi persisten (clean session = false).
// Tekan tombol D13 untuk mematikan WiFi, kirim pesan QoS 0 dan QoS 1 dari MQTTX, lalu tekan D13 lagi.
// Broker menyimpan pesan QoS 1 untuk ESP32 dan menyerahkannya begitu ESP32 kembali; pesan QoS 0 hilang (Konsep 6).

#include <WiFi.h>
#include <PubSubClient.h>  // library PubSubClient3 versi 3.3.2
#include <esp_mac.h>       // esp_read_mac(): alamat MAC langsung dari chip
#include "secrets.h"       // berisi WIFI_NAMA dan WIFI_SANDI

#ifndef MQTT_QOS1  // hanya PubSubClient3 yang punya nama ini
#error "Yang terpakai PubSubClient lama (2.8). Hapus lewat Library Manager, lalu pasang PubSubClient3 versi 3.3.2."
#endif

// GANTI 192.168.1.10 dengan alamat IP laptopmu, sama dengan Praktik 3.
const char ALAMAT_BROKER[] = "192.168.1.10";
const uint16_t PORT_BROKER = 1883;

const int PIN_TOMBOL = 13;                  // tombol D13 di meja kerja (Modul 5), aktif LOW
const unsigned long JEDA_COBA_MQTT = 5000;  // gagal menyambung ke broker? coba lagi 5 detik kemudian

WiFiClient klienJaringan;
PubSubClient mqtt(klienJaringan);
char idPerangkat[13];  // device_id
char idKlien[24];      // client ID khusus latihan ini supaya sesi persistennya tidak tercampur dengan sketsa lain
char topikQos[40];     // latihan/<device_id>/qos
bool wifiDinyalakan = true;
bool tombolTadi = HIGH;
unsigned long waktuTombolBerubah = 0;
unsigned long waktuCobaTerakhir = 0;
bool sudahPernahCoba = false;

void saatPesanMasuk(char* topik, byte* isi, unsigned int panjang) {
  Serial.print("Pesan masuk: ");
  Serial.write(isi, panjang);
  Serial.println();
}

void cobaSambungkanBroker() {
  if (sudahPernahCoba && millis() - waktuCobaTerakhir < JEDA_COBA_MQTT) {
    return;
  }
  sudahPernahCoba = true;
  waktuCobaTerakhir = millis();
  // Sesi persisten: client ID selalu sama, dan argumen terakhir (clean session) = false.
  // Tanpa nama pengguna dan kata sandi (nullptr, nullptr), dan tanpa surat wasiat (nullptr, 0, false, nullptr).
  if (mqtt.connect(idKlien, nullptr, nullptr, nullptr, 0, false, nullptr, false)) {
    mqtt.subscribe(topikQos, 1);  // langganan QoS 1: broker menyimpan pesan QoS 1 selama ESP32 pergi
    Serial.printf("Tersambung ke broker (sesi persisten), langganan %s dengan QoS 1\n", topikQos);
  } else {
    Serial.printf("Gagal ke broker (kode %d). Coba lagi 5 detik lagi.\n", mqtt.state());
  }
}

// Setiap kali D13 ditekan, WiFi mati atau menyala bergantian.
void periksaTombol() {
  bool sekarang = digitalRead(PIN_TOMBOL);
  if (sekarang == tombolTadi || millis() - waktuTombolBerubah < 50) {  // 50 ms: abaikan getaran tombol (Modul 5)
    return;
  }
  waktuTombolBerubah = millis();
  tombolTadi = sekarang;
  if (sekarang == HIGH) {
    return;  // hanya saat ditekan
  }
  wifiDinyalakan = !wifiDinyalakan;
  if (wifiDinyalakan) {
    WiFi.begin(WIFI_NAMA, WIFI_SANDI);
    Serial.println("WiFi DINYALAKAN lagi: menyambung ke WiFi, lalu ke broker...");
  } else {
    WiFi.disconnect();
    Serial.println("WiFi DIMATIKAN. Sekarang kirim satu pesan QoS 0 dan satu pesan QoS 1 dari MQTTX.");
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(PIN_TOMBOL, INPUT_PULLUP);
  Serial.println();

  uint8_t mac[6];
  esp_read_mac(mac, ESP_MAC_WIFI_STA);
  snprintf(idPerangkat, sizeof(idPerangkat), "%02x%02x%02x%02x%02x%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  snprintf(idKlien, sizeof(idKlien), "%s-qos", idPerangkat);
  snprintf(topikQos, sizeof(topikQos), "latihan/%s/qos", idPerangkat);

  Serial.printf("Menyambung ke \"%s\"", WIFI_NAMA);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_NAMA, WIFI_SANDI);
  unsigned long mulai = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - mulai < 20000) {
    Serial.print(".");
    delay(250);
  }
  Serial.println();
  Serial.printf("Topik latihan: %s\n", topikQos);

  klienJaringan.setConnectionTimeout(1000);
  mqtt.setServer(ALAMAT_BROKER, PORT_BROKER);
  mqtt.setSocketTimeout(1);
  mqtt.setCallback(saatPesanMasuk);
}

void loop() {
  periksaTombol();
  if (!wifiDinyalakan || WiFi.status() != WL_CONNECTED) {
    return;
  }
  if (!mqtt.connected()) {
    cobaSambungkanBroker();
    return;
  }
  mqtt.loop();
}
