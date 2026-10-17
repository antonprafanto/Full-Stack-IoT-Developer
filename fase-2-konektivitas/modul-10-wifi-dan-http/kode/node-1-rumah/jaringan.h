// jaringan.h - Node 1 di jaringan rumah: WiFi, jam internet, kirim bacaan, dan server web (Modul 10)
// Prinsipnya: WiFi boleh putus, Node 1 tidak boleh berhenti. Tidak ada fungsi di sini yang menunggu lama,
// kecuali portal WiFi, yang hanya dibuka di setup() sebelum watchdog mengawasi.
// Modul 11 mengganti kiriman HTTP dan server web dengan MQTT.
#pragma once
#include <Arduino.h>  // size_t
#include "sensor.h"   // BacaanSensor

void siapkanJaringan();                // panggil sekali di setup(), SEBELUM watchdog diatur
void perbaruiJaringan();               // panggil di setiap putaran loop()
void kirimBacaan(BacaanSensor b);      // dipanggil setiap ada bacaan baru; benar-benar mengirim setiap JEDA_KIRIM
void kirimSekarang();                  // perintah Serial "kirim": kirim bacaan terakhir sekarang juga
bool buatTs(char* ts, size_t ukuran);  // cap waktu UTC ISO-8601 (Lampiran A); false kalau jam belum disetel
const char* teksJaringan();            // untuk layar: alamat IP, "putus", atau "mati"
void cetakInfoJaringan();              // jawaban perintah Serial "wifi"
void lupakanWiFi();                    // perintah Serial "wifi lupa": hapus WiFi tersimpan, lalu restart
