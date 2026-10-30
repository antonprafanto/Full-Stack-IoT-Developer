// Modul 27 - Tantangan 1 (kunci): cuaca dari internet TANPA setInsecure()
// Sama dengan modul10_cuaca (Modul 10 Praktik 6), kecuali satu baris di tanyaCuaca(): identitas server kini DIPERIKSA
// (rantai tanda tangan sampai akar tepercaya + nama server), bukan hanya dienkripsi.
// Belum dikompilasi dan belum dicoba penulis di papan (Modul 27 tidak memasang arduino-cli).
// Data cuaca: Open-Meteo.com, lisensi CC BY 4.0 - https://open-meteo.com/

#include <WiFi.h>
#include <WiFiClientSecure.h>  // ikut paket esp32: sambungan HTTPS ("amplop tersegel")
#include <HTTPClient.h>        // ikut paket esp32: menulis surat HTTP dan membaca balasannya
#include <ArduinoJson.h>       // library baru minggu ini: membaca dan menulis JSON
#include "secrets.h"           // berisi WIFI_NAMA dan WIFI_SANDI
#include "akar_isrg_x1.h"       // cara B saja: akar ISRG Root X1 (sertifikat publik, bukan rahasia)

// Alamat API disusun dari beberapa potong teks; C++ menyambungnya menjadi satu.
const char ALAMAT_CUACA[] =
  "https://api.open-meteo.com/v1/forecast"
  "?latitude=-6.2&longitude=106.85"  // Jakarta. Ganti dengan lokasimu, seperti di Modul 4
  "&current=temperature_2m,relative_humidity_2m,weather_code"
  "&timezone=auto";
const unsigned long JEDA_TANYA = 60000;  // tanya setiap 1 menit (datanya sendiri diperbarui setiap 15 menit)

unsigned long waktuTanyaTerakhir = 0;
bool sudahBertanya = false;

// Kode cuaca WMO yang paling sering muncul di Indonesia (sama dengan cuaca.js di Modul 4).
const char* kondisiCuaca(int kode) {
  switch (kode) {
    case 0: return "cerah";
    case 1: return "cerah berawan";
    case 2: return "berawan sebagian";
    case 3: return "mendung";
    case 45: return "berkabut";
    case 51: return "gerimis ringan";
    case 53: return "gerimis";
    case 55: return "gerimis lebat";
    case 61: return "hujan ringan";
    case 63: return "hujan sedang";
    case 65: return "hujan lebat";
    case 80: return "hujan lokal ringan";
    case 81: return "hujan lokal";
    case 82: return "hujan lokal lebat";
    case 95: return "badai petir";
    default: return "kode cuaca lain";
  }
}

void tanyaCuaca() {
  WiFiClientSecure klien;
  // Modul 27: pengganti setInsecure(). Cara A (paket esp32 3.3.12 ke atas): bundel akar bawaan, berisi sekitar 150 akar
  // tepercaya, termasuk ISRG Root X1 dan X2 (Let's Encrypt). Rantai api.open-meteo.com (29 Okt 2026, dua server):
  // YR1 -> Root YR -> ISRG Root X1, atau YE2 -> Root YE -> ISRG Root X2 -> ISRG Root X1. Satu baris ini juga cocok untuk
  // situs lain yang memakai penerbit besar.
  klien.useBuiltinCACertBundle();
  // Cara B (paket esp32 lebih lama, atau hanya ingin memercayai SATU akar): hapus baris di atas, pakai baris ini.
  // klien.setCACert(AKAR_ISRG_X1);

  HTTPClient http;
  http.setConnectTimeout(5000);  // paling lama 5 detik untuk tersambung ke server
  http.setTimeout(5000);         // paling lama 5 detik menunggu balasan

  Serial.println("Mengirim GET ke api.open-meteo.com ...");
  unsigned long mulai = millis();
  http.begin(klien, ALAMAT_CUACA);
  int kode = http.GET();  // kirim surat permintaan, tunggu balasannya

  if (kode <= 0) {  // angka 0 atau negatif: tidak ada balasan dari server (surat tidak sampai, atau balasan tidak datang)
    Serial.printf("Gagal mengirim: %s (kode %d)\n", http.errorToString(kode).c_str(), kode);
    http.end();
    return;
  }
  Serial.printf("Kode status: %d, dijawab dalam %lu ms\n", kode, millis() - mulai);
  String isi = http.getString();  // isi balasan (body), berupa teks JSON
  http.end();                     // selesai: tutup sambungan
  if (kode != 200) {
    Serial.println("Server menolak permintaan. Isi balasannya:");
    Serial.println(isi);
    return;
  }
  Serial.println("Isi balasan (JSON):");
  Serial.println(isi);

  // "Wadah" JSON dari ArduinoJson. Teks JSON dari server dituangkan ke dalamnya (teks -> wadah).
  JsonDocument dokumen;
  DeserializationError galat = deserializeJson(dokumen, isi);
  if (galat) {
    Serial.printf("JSON tidak bisa dibaca: %s\n", galat.c_str());
    return;
  }
  const char* waktu = dokumen["current"]["time"];
  const char* zona = dokumen["timezone"];
  float suhu = dokumen["current"]["temperature_2m"];
  int lembap = dokumen["current"]["relative_humidity_2m"];
  int kodeCuaca = dokumen["current"]["weather_code"];

  Serial.printf("Waktu    : %s (%s)\n", waktu, zona);
  Serial.printf("Suhu     : %.1f C\n", suhu);
  Serial.printf("Lembap   : %d %%\n", lembap);
  Serial.printf("Kondisi  : %s (kode %d)\n", kondisiCuaca(kodeCuaca), kodeCuaca);
  Serial.println("Sumber data: Open-Meteo.com (CC BY 4.0)");
}

void setup() {
  Serial.begin(115200);
  delay(500);
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
  Serial.printf("Tersambung, IP %s\n", WiFi.localIP().toString().c_str());
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    return;  // tanpa WiFi, surat tidak bisa dikirim
  }
  if (!sudahBertanya || millis() - waktuTanyaTerakhir >= JEDA_TANYA) {
    sudahBertanya = true;
    waktuTanyaTerakhir = millis();
    Serial.println();
    tanyaCuaca();
  }
}
