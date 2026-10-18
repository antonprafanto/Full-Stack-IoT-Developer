// sistem.h - kesehatan Node 1: uptime, alasan restart, dan lama putaran loop() (Modul 8)
#pragma once

unsigned long uptimeDetik();                      // detik sejak menyala; tidak meluap seperti millis()
const char* alasanReset();                        // alasan restart terakhir, namanya sama dengan Lampiran A
void catatLamaPutaran(unsigned long mikrodetik);  // panggil di akhir setiap putaran loop()
unsigned long putaranTerlamaMs();                 // putaran loop() paling lama sejak menyala, dalam milidetik
