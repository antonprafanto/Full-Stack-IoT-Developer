// pembaruan.h - pembaruan firmware lewat udara (OTA) dari server rumah, atas perintah MQTT "update" (Modul 28).
// Urutannya (KONTRAK-DATA.md 1.6 bagian 7, sama dengan simulator alat/simulator-perangkat.js):
//   periksa perintah -> ack ok:true ("diterima", BUKAN "selesai") -> rencana ke NVS -> pompa dan buzzer padam ->
//   status "offline-mode" + putus RAPI dari broker -> watchdog 60 detik -> unduh <alamat server>/fw/node-1/<versi>.bin
//   (Basic device_id:kunci, sidik SHA-256 dari perintah) -> berhasil: restart ke rak sebelah, masa uji 60 detik
//   (masa-uji.cpp); gagal: watchdog kembali 5 detik, tersambung lagi, laporan "gagal" ikut vitals.
// Hasil setiap pembaruan disimpan di NVS SEBELUM restart, lalu dikirim di vitals (paling banyak 3 kali).
#pragma once
#include <stdint.h>
#include "versi.h"        // PANJANG_VERSI_MAKS
#include "periksa-ota.h"  // IsiUpdate

const int PANJANG_ID_MAKS = 39;         // kontrak aturan 4: id perintah paling panjang 39 huruf
const int PANJANG_PESAN_OTA_MAKS = 80;  // kontrak 1.6: ota.pesan paling panjang 80 huruf

const uint8_t TAHAP_MENGUNDUH = 1;  // rencana tersimpan, firmware sedang diunduh (rak lama masih utuh)
const uint8_t TAHAP_DIPASANG = 2;   // firmware baru sudah tertulis di rak sebelah, Node 1 menyala ulang ke sana

// Rencana pembaruan, disimpan di NVS SEBELUM mengunduh (label "ota_rencana"). Dengan rencana ini, firmware yang menyala
// sesudahnya (baru atau lama) tahu apa yang sedang terjadi, walaupun listrik sempat padam.
struct RencanaOta {
  char id[PANJANG_ID_MAKS + 1];       // id perintah update
  char dari[PANJANG_VERSI_MAKS + 1];  // versi yang berjalan saat perintah datang
  char ke[PANJANG_VERSI_MAKS + 1];    // versi yang dipasang
  uint8_t tahap;                      // TAHAP_MENGUNDUH atau TAHAP_DIPASANG
};

// Laporan hasil satu pembaruan (label "ota_laporan"), isinya sama dengan objek "ota" di vitals (kontrak 1.6 bagian 6).
struct LaporanOta {
  char id[PANJANG_ID_MAKS + 1];
  char hasil[9];                         // "berhasil", "rollback", atau "gagal"
  char versi[PANJANG_VERSI_MAKS + 1];    // versi yang DICOBA dipasang
  char pesan[PANJANG_PESAN_OTA_MAKS + 1];  // alasan rollback/gagal; "" = tidak ditulis
  uint8_t terkirim;                      // sudah ikut berapa vitals (paling banyak 3)
};

void siapkanPembaruan();   // setup(), sesudah muatPengaturan() dan SEBELUM siapkanJaringan(): masa uji + rencana tertinggal
void perbaruiPembaruan();  // loop(): mengerjakan pembaruan yang sudah diterima, dan mengawasi masa uji 60 detik

// Dipanggil jaringan.cpp untuk perintah MQTT "update". nullptr = diterima (ack ok:true, unduhan dimulai di loop()
// berikutnya), selain itu alasan penolakan untuk ack ok:false.
const char* terimaUpdate(const char* id, const IsiUpdate& isi);
bool pembaruanSedangBerjalan();  // true sejak perintah diterima sampai unduhan selesai

const LaporanOta* laporanOtaMenunggu();  // laporan yang belum 3 kali ikut vitals; nullptr kalau tidak ada
void laporanOtaTerkirim();               // dipanggil sesudah vitals yang membawa laporan itu berhasil terbit
void catatHasilOta(const char* id, const char* hasil, const char* versi, const char* pesan);  // simpan laporan baru ke NVS
bool bacaRencanaOta(RencanaOta& rencana);  // false kalau tidak ada rencana tersimpan
void hapusRencanaOta();

void bersiapRestart(const char* sebab);  // berhenti sengaja: laporan masa uji (bila perlu), offline-mode, putus rapi
void restartSengaja(const char* sebab);  // bersiapRestart(), lalu ESP.restart(): perintah Serial "restart"
void cetakInfoOta();                     // jawaban perintah Serial "ota"
