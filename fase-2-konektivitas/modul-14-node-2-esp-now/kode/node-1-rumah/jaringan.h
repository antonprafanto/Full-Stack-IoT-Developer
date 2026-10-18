// jaringan.h - Node 1 di jaringan rumah: WiFi dan jam internet (Modul 10), lalu MQTT (Modul 11)
// Prinsipnya: WiFi dan broker boleh putus, Node 1 tidak boleh berhenti. Tidak ada fungsi di sini yang menunggu
// lama, kecuali portal WiFi, yang hanya dibuka di setup() sebelum watchdog mengawasi.
// Semua topik dan isi pesannya mengikuti kontrak data (Lampiran A Silabus, KONTRAK-DATA.md).
#pragma once
#include <Arduino.h>  // size_t
#include "sensor.h"   // BacaanSensor

void siapkanJaringan();                // panggil sekali di setup(), SEBELUM watchdog diatur
void perbaruiJaringan();               // panggil di setiap putaran loop()
void kirimBacaan(BacaanSensor b);      // setiap ada bacaan baru: terbit setiap JEDA_KIRIM atau segera saat penting
void kirimSekarang();                  // perintah Serial "kirim": terbitkan bacaan terakhir sekarang juga
bool buatTs(char* ts, size_t ukuran);  // cap waktu UTC ISO-8601 (Lampiran A); false kalau jam belum disetel
const char* teksJaringan();            // untuk layar: "ok, MQTT ok", "ok, MQTT putus", "putus", atau "mati"
void cetakInfoJaringan();              // jawaban perintah Serial "wifi"
void lupakanWiFi();                    // perintah Serial "wifi lupa": hapus WiFi tersimpan, lalu restart
bool mqttSiap();                       // Modul 14: true kalau WiFi dan MQTT sedang tersambung
bool terbitkan(const char* topik, const char* isi, bool retained);  // Modul 14: terbit atas nama Node 2
