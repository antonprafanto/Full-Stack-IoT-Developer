// Modul 10 - Praktik 2: kenali jaringanmu
// Langkah 1: ESP32 mencari semua jaringan WiFi yang bisa ia "lihat".
// Langkah 2: ESP32 menyambung ke WiFi di tab secrets.h, lalu mencetak "kartu identitas" jaringannya.
// Sesudah itu, kekuatan sinyal dicetak setiap 2 detik.

#include <WiFi.h>
#include "secrets.h"  // berisi WIFI_NAMA dan WIFI_SANDI

const int PIN_LED_STATUS = 4;
const unsigned long JEDA_SINYAL = 2000;  // cetak kekuatan sinyal setiap 2 detik
unsigned long waktuSinyalTerakhir = 0;

// Nama pendek untuk jenis gembok (keamanan) jaringan.
const char* namaKeamanan(wifi_auth_mode_t jenis) {
  if (jenis == WIFI_AUTH_OPEN) {
    return "terbuka";
  }
  if (jenis == WIFI_AUTH_WPA2_PSK) {
    return "WPA2";
  }
  if (jenis == WIFI_AUTH_WPA_WPA2_PSK) {
    return "WPA/WPA2";
  }
  if (jenis == WIFI_AUTH_WPA2_WPA3_PSK) {
    return "WPA2/WPA3";
  }
  if (jenis == WIFI_AUTH_WPA3_PSK) {
    return "WPA3";
  }
  if (jenis == WIFI_AUTH_WPA2_ENTERPRISE) {
    return "Enterprise";
  }
  return "lainnya";
}

// Kata sederhana untuk angka kekuatan sinyal (RSSI). Makin dekat ke 0, makin kuat.
const char* mutuSinyal(int rssi) {
  if (rssi >= -55) {
    return "sangat kuat";
  }
  if (rssi >= -67) {
    return "kuat";
  }
  if (rssi >= -75) {
    return "cukup";
  }
  if (rssi >= -85) {
    return "lemah";
  }
  return "sangat lemah";
}

// Langkah 1: daftar jaringan yang terlihat. Pencarian ini memakan beberapa detik.
void cariJaringan() {
  Serial.println("Mencari jaringan WiFi di sekitar...");
  int jumlah = WiFi.scanNetworks();
  if (jumlah <= 0) {
    Serial.println("Tidak ada jaringan yang terlihat.");
    return;
  }
  Serial.printf("%d jaringan terlihat:\n", jumlah);
  Serial.println(" No  Sinyal    Kanal  Keamanan    Nama (SSID)");
  bool wifiKuTerlihat = false;
  for (int i = 0; i < jumlah; i++) {
    String nama = WiFi.SSID(i);
    const char* tanda = "";
    if (nama == WIFI_NAMA) {
      tanda = "   <- WiFi-mu";
      wifiKuTerlihat = true;
    }
    Serial.printf("%3d  %4d dBm  %4d   %-10s  %s%s\n", i + 1, WiFi.RSSI(i), WiFi.channel(i),
                  namaKeamanan(WiFi.encryptionType(i)), nama.c_str(), tanda);
  }
  WiFi.scanDelete();  // kosongkan lagi memori hasil pencarian
  if (!wifiKuTerlihat) {
    Serial.printf("\"%s\" TIDAK terlihat. Salah ketik, atau WiFi-mu hanya 5 GHz? (lihat Konsep 2)\n", WIFI_NAMA);
  }
}

// Langkah 2: "kartu identitas" ESP32 di jaringanmu.
void cetakKartuJaringan() {
  uint8_t mac[6];
  WiFi.macAddress(mac);
  char deviceId[13];  // 12 huruf + tanda akhir teks
  snprintf(deviceId, sizeof(deviceId), "%02x%02x%02x%02x%02x%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);

  Serial.println("---------- Kartu identitas jaringan ----------");
  Serial.printf("Nama WiFi (SSID) : %s\n", WiFi.SSID().c_str());
  Serial.printf("Alamat IP ESP32  : %s\n", WiFi.localIP().toString().c_str());
  Serial.printf("Router (gateway) : %s\n", WiFi.gatewayIP().toString().c_str());
  Serial.printf("Subnet mask      : %s\n", WiFi.subnetMask().toString().c_str());
  Serial.printf("DNS              : %s\n", WiFi.dnsIP().toString().c_str());
  Serial.printf("Nama perangkat   : %s\n", WiFi.getHostname());
  Serial.printf("Alamat MAC       : %s\n", WiFi.macAddress().c_str());
  Serial.printf("device_id        : %s\n", deviceId);
  Serial.printf("Kanal            : %d\n", WiFi.channel());
  Serial.println("----------------------------------------------");
}

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(PIN_LED_STATUS, OUTPUT);
  Serial.println();

  WiFi.mode(WIFI_STA);
  cariJaringan();

  Serial.printf("Menyambung ke \"%s\"", WIFI_NAMA);
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
  digitalWrite(PIN_LED_STATUS, HIGH);
  cetakKartuJaringan();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    return;  // belum tersambung: tidak ada sinyal untuk dilaporkan
  }
  if (millis() - waktuSinyalTerakhir >= JEDA_SINYAL) {
    waktuSinyalTerakhir = millis();
    int rssi = WiFi.RSSI();
    Serial.printf("Sinyal: %d dBm (%s)\n", rssi, mutuSinyal(rssi));
  }
}
