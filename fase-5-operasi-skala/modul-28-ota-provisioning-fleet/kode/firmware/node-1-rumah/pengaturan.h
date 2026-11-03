// pengaturan.h - setelan yang tetap ada walaupun listrik padam, disimpan di NVS (Modul 8)
#pragma once
#include <stddef.h>  // size_t

void muatPengaturan();                    // panggil sekali di setup(): membaca setelan dari NVS
int ambangTanahSiram();                   // ambang "tanah kering" yang berlaku sekarang, dalam persen
bool ambangDariNvs();                     // true kalau ambang itu berasal dari NVS, bukan angka bawaan
bool simpanAmbangTanahSiram(int persen);  // menjawab false kalau angkanya di luar 0-100
void hapusAmbangTanahSiram();             // kembali memakai AMBANG_TANAH_SIRAM_BAWAAN di konfigurasi.h
unsigned long jumlahNyala();              // sudah berapa kali Node 1 menyala, termasuk restart
bool sensorRS485Dipakai();                // Modul 15: true setelah perintah "rs485 on"
void simpanSensorRS485Dipakai(bool pakai);  // Modul 15: "rs485 on" / "rs485 off", disimpan di NVS
float ambangSuhuKipas();                    // Modul 19: kipas pengaman menyala di atas angka ini (°C)
bool ambangSuhuKipasDariNvs();              // Modul 19: true kalau angka itu dari NVS (dikirim server lewat config)
bool simpanAmbangSuhuKipas(float derajat);  // Modul 19: menjawab false kalau di luar SUHU_KIPAS_MIN-SUHU_KIPAS_MAKS
const char* kunciBroker();                  // Modul 21: kunci broker dari NVS; "" kalau belum ada. JANGAN dicetak utuh
bool simpanKunciBroker(const char* isi);    // Modul 21: false kalau bukan 1-64 huruf A-Z, a-z, 0-9, - atau _
void hapusKunciBroker();                    // Modul 21: perintah "kunci hapus"
const char* alamatServerTersimpan();        // Modul 28: tempat Node 1 mengunduh firmware dan klaim; "" kalau belum diisi
bool simpanAlamatServer(const char* alamat);  // Modul 28: alamat yang SUDAH dirapikan dan diperiksa (periksa-ota.h)
const char* alamatBrokerTersimpan();        // Modul 28: alamat broker dari NVS, atau ALAMAT_BROKER di konfigurasi.h
bool alamatBrokerDariNvs();                 // Modul 28: true kalau alamat broker itu dari NVS (portal, Serial, atau klaim)
bool simpanAlamatBroker(const char* alamat);  // Modul 28: alamat IP yang SUDAH diperiksa (periksa-ota.h)
unsigned long jedaVitalsDetik();            // Modul 28: jarak antar-vitals (detik), dikirim server lewat config "jeda"
bool jedaVitalsDariNvs();                   // Modul 28: true kalau jeda itu dari NVS, bukan angka bawaan
bool simpanJedaVitals(long detik);          // Modul 28: false kalau di luar JEDA_VITALS_MIN_S-JEDA_VITALS_MAKS_S
// Modul 28: catatan pembaruan firmware (rencana dan laporan) disimpan utuh sebagai deretan byte (struct) di satu label.
bool bacaCatatan(const char* label, void* isi, size_t ukuran);         // false kalau belum ada atau ukurannya lain
void simpanCatatan(const char* label, const void* isi, size_t ukuran);
void hapusCatatan(const char* label);
