// Modul 10 - Praktik 8: sakelar lampu dari HP (ESP32 sebagai server web)
// Buka http://<alamat IP ESP32>/ di browser HP yang tersambung ke WiFi yang SAMA.
// Tautan /on menyalakan relay lampu (D32), /off mematikannya.
// Tanpa kata sandi: hanya untuk jaringan rumah, jangan pernah dibuka ke internet.

#include <WiFi.h>
#include <WebServer.h>  // ikut paket esp32: ESP32 menjadi server web kecil
#include <ESPmDNS.h>    // ikut paket esp32: nama node1.local (bonus, Praktik 9)
#include "secrets.h"    // berisi WIFI_NAMA dan WIFI_SANDI

const int PIN_RELAY_LAMPU = 32;  // relay aktif LOW (Modul 5)
const char NAMA_PERANGKAT[] = "node1";

WebServer server(80);  // 80 = nomor "pintu" bawaan HTTP
bool lampu = false;

// Halaman siap tempel. R"( ... )" = teks mentah: boleh memuat petik ganda dan beberapa baris.
// Tampilan yang cantik menunggu Modul 22.
const char HALAMAN[] = R"(<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Node 1</title>
</head>
<body style="font-family: sans-serif; font-size: 22px; padding: 16px">
<h2>Lampu: %KEADAAN%</h2>
<p><a href="/on">Nyalakan lampu</a></p>
<p><a href="/off">Matikan lampu</a></p>
</body>
</html>)";

void aturLampu(bool nyala) {
  lampu = nyala;
  if (nyala) {
    digitalWrite(PIN_RELAY_LAMPU, LOW);  // relay aktif LOW
  } else {
    digitalWrite(PIN_RELAY_LAMPU, HIGH);
  }
}

// Kirim halaman dengan keadaan lampu terbaru.
void kirimHalaman() {
  String html = HALAMAN;
  if (lampu) {
    html.replace("%KEADAAN%", "MENYALA");
  } else {
    html.replace("%KEADAAN%", "PADAM");
  }
  server.send(200, "text/html", html);  // kode status 200 = OK
}

// Catat siapa yang meminta apa, misalnya "GET /on dari 192.168.1.42".
void catatPermintaan() {
  Serial.printf("GET %s dari %s\n", server.uri().c_str(), server.client().remoteIP().toString().c_str());
}

void tanganiBeranda() {
  catatPermintaan();
  kirimHalaman();
}

void tanganiOn() {
  catatPermintaan();
  aturLampu(true);
  kirimHalaman();
}

void tanganiOff() {
  catatPermintaan();
  aturLampu(false);
  kirimHalaman();
}

void tanganiTidakAda() {
  catatPermintaan();
  server.send(404, "text/plain", "404: halaman ini tidak ada. Coba /, /on, atau /off");
}

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(PIN_RELAY_LAMPU, OUTPUT);
  aturLampu(false);  // segera matikan: pinMode(OUTPUT) baru saja membuat pin LOW (= relay menarik)
  Serial.println();

  WiFi.setHostname(NAMA_PERANGKAT);  // nama yang tampil di daftar perangkat router (Praktik 9)
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_NAMA, WIFI_SANDI);
  Serial.printf("Menyambung ke \"%s\"", WIFI_NAMA);
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

  server.on("/", tanganiBeranda);  // "kalau ada yang meminta /, jalankan tanganiBeranda()"
  server.on("/on", tanganiOn);
  server.on("/off", tanganiOff);
  server.onNotFound(tanganiTidakAda);
  server.begin();
  Serial.printf("Server web siap. Buka di HP: http://%s/\n", WiFi.localIP().toString().c_str());

  if (MDNS.begin(NAMA_PERANGKAT)) {  // bonus: nama .local (sering gagal di HP Android)
    MDNS.addService("http", "tcp", 80);
    Serial.printf("Atau coba: http://%s.local/ (sering gagal di HP Android)\n", NAMA_PERANGKAT);
  }
}

void loop() {
  server.handleClient();  // layani permintaan yang datang, lalu langsung kembali (tidak menunggu)
}
