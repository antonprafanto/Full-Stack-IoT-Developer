// masa-uji.cpp - isi modul masa uji. Daftar fungsinya ada di masa-uji.h.
// Dikompilasi penulis (arduino-cli 1.5.1, esp32 3.3.12), tetapi BELUM dijalankan di papan: README firmware, "Status 1.7.0".
#include <Arduino.h>
#include <esp_ota_ops.h>  // ESP-IDF: keadaan rak program (otadata), sahkan atau batalkan firmware
#include <esp_task_wdt.h> // watchdog: menjaga setup() selama masa uji
#include "konfigurasi.h"
#include "pencatat.h"
#include "sistem.h"
#include "layar.h"
#include "pembaruan.h"
#include "masa-uji.h"

// ================================================================================================================
// BARIS PALING PENTING DI MODUL 28: tanpa baris ini, rollback otomatis TIDAK PERNAH terjadi, dan tidak ada pesan apa pun.
//
// Bootloader paket esp32 3.3.12 sudah bisa me-rollback: firmware yang baru dipasang lewat udara menyala dengan keadaan
// PENDING_VERIFY ("menunggu dibuktikan"). Tetapi sebelum setup() berjalan, inti Arduino (initArduino() di
// esp32-hal-misc.c) bertanya pada fungsi verifyRollbackLater(): "mau membuktikan sendiri nanti?". Jawaban bawaannya
// false, sehingga inti Arduino langsung menandai firmware baru SAH, sebelum ia sempat mencoba broker. Firmware dengan
// kunci broker yang salah pun dianggap sah, dan tidak akan pernah kembali ke versi lama.
//
// Fungsi di bawah ini menggantikan jawaban bawaan itu dengan true: "ya, saya buktikan sendiri" (masa uji di bawah).
//
// Kenapa extern "C"? Fungsi bawaannya ditulis dalam bahasa C (berkas .c). C++ diam-diam mengubah nama setiap fungsi
// saat dikompilasi (name mangling, misalnya menjadi _Z19verifyRollbackLaterv) supaya fungsi bernama sama boleh punya
// parameter berbeda. Tanpa extern "C", fungsi kita bernama lain di mata linker, fungsi bawaan tetap dipakai, dan
// kompilasi tetap BERHASIL tanpa peringatan apa pun. extern "C" = "pakai nama apa adanya, seperti bahasa C", sehingga
// fungsi kita menggantikan fungsi bawaan (yang ditandai weak = "boleh diganti").
// ================================================================================================================
extern "C" bool verifyRollbackLater() {
  return true;
}

static bool masaUji = false;

// Batas watchdog selama setup() firmware yang sedang masa uji: 60 detik masa uji + 15 detik. Kalau setup() selesai lebih
// cepat (biasanya beberapa detik), batasnya kembali 5 detik di akhir setup() seperti biasa.
const unsigned long BATAS_WATCHDOG_SETUP_UJI = MASA_UJI_OTA + 15000;

// Nama keadaan rak program di otadata (esp_ota_img_states_t), untuk perintah Serial "ota".
static const char* namaKeadaan(esp_ota_img_states_t keadaan) {
  switch (keadaan) {
    case ESP_OTA_IMG_NEW: return "NEW, belum pernah menyala";
    case ESP_OTA_IMG_PENDING_VERIFY: return "PENDING_VERIFY, masa uji";
    case ESP_OTA_IMG_VALID: return "VALID, sudah terbukti";
    case ESP_OTA_IMG_INVALID: return "INVALID, ditolak";
    case ESP_OTA_IMG_ABORTED: return "ABORTED, batal";
    case ESP_OTA_IMG_UNDEFINED: return "UNDEFINED, dipasang lewat kabel";
    default: return "tidak dikenal";
  }
}

void mulaiMasaUji() {
  const esp_partition_t* berjalan = esp_ota_get_running_partition();
  esp_ota_img_states_t keadaan;
  if (berjalan == nullptr || esp_ota_get_state_partition(berjalan, &keadaan) != ESP_OK) {
    return;  // keadaan tidak tercatat (misalnya baru dipasang lewat kabel): tidak ada masa uji
  }
  if (keadaan != ESP_OTA_IMG_PENDING_VERIFY) {
    return;
  }
  masaUji = true;
  logInfo("MASA UJI: firmware %s baru dipasang lewat udara di rak %s. Dalam %lu detik ia harus tersambung ke broker "
          "dan terbit; kalau tidak, Node 1 kembali sendiri ke firmware sebelumnya.", VERSI_FIRMWARE, berjalan->label,
          MASA_UJI_OTA / 1000);
  logInfo("Selama masa uji, portal WiFi tidak dibuka dan perintah update ditolak.");

  // Masa uji juga menjaga setup(). Biasanya watchdog baru mengawasi loop() di AKHIR setup(), dan masa uji diperiksa di
  // loop(). Firmware baru yang macet di setup() (misalnya menunggu sensor selamanya) tidak akan pernah sampai ke loop(),
  // jadi tidak pernah di-rollback. Karena itu, mulai sekarang watchdog mengawasi tugas ini dengan batas 75 detik: macet di
  // setup() = watchdog me-restart Node 1, dan bootloader membatalkan firmware yang belum terbukti (PENDING_VERIFY menjadi
  // ABORTED), sehingga Node 1 tetap kembali ke firmware lama dan melapor "rollback".
  // Urutannya: daftarkan dulu, baru atur batasnya (memberi makan watchdog sebelum terdaftar = galat "task not found").
  if (esp_task_wdt_status(NULL) != ESP_OK) {   // ESP_OK = tugas ini sudah diawasi
    esp_task_wdt_add(NULL);                    // NULL = tugas yang sedang berjalan: setup() lalu loop()
  }
  aturBatasWatchdog(BATAS_WATCHDOG_SETUP_UJI);  // sistem.cpp
}

bool dalamMasaUji() {
  return masaUji;
}

void firmwareTerbukti() {
  if (!masaUji) {
    return;
  }
  masaUji = false;
  // Tandai sah DULU, baru catat di NVS: kalau listrik padam di antara keduanya, firmware ini tetap sah dan
  // siapkanPembaruan() di nyala berikutnya menulis laporan "berhasil" dari rencana yang tertinggal.
  esp_err_t galat = esp_ota_mark_app_valid_cancel_rollback();  // otadata: PENDING_VERIFY -> VALID
  char pesan[PANJANG_PESAN_OTA_MAKS + 1] = "";
  if (galat != ESP_OK) {
    snprintf(pesan, sizeof(pesan), "gagal ditandai sah: %s", esp_err_to_name(galat));
    logError("Firmware %s %s: restart berikutnya bisa kembali ke firmware lama.", VERSI_FIRMWARE, pesan);
  }
  RencanaOta r;
  if (bacaRencanaOta(r)) {
    if (pesan[0] == '\0' && strcmp(VERSI_FIRMWARE, r.ke) != 0) {
      snprintf(pesan, sizeof(pesan), "fw %s, bukan %s: VERSI_FIRMWARE lupa dinaikkan?", VERSI_FIRMWARE, r.ke);
    }
    catatHasilOta(r.id, "berhasil", r.ke, pesan);
    hapusRencanaOta();
  }
  logInfo("Firmware %s SAH: tersambung ke broker dan terbit %lu detik sesudah menyala.", VERSI_FIRMWARE, millis() / 1000);
}

void perbaruiMasaUji() {
  if (!masaUji || millis() < MASA_UJI_OTA) {  // millis() dihitung sejak Node 1 menyala
    return;
  }
  masaUji = false;
  RencanaOta r;
  bool adaRencana = bacaRencanaOta(r);
  logError("Firmware %s TIDAK terbukti dalam %lu detik (tidak tersambung ke broker): ROLLBACK ke firmware sebelumnya.",
           VERSI_FIRMWARE, MASA_UJI_OTA / 1000);
  if (adaRencana) {  // laporan disimpan SEBELUM restart: sesudah restart, yang menyala adalah firmware lama
    catatHasilOta(r.id, "rollback", r.ke, "tidak tersambung ke broker dalam 60 detik");
    hapusRencanaOta();
  }
  tampilkanPesan("ROLLBACK", "firmware baru gagal", "kembali ke versi", adaRencana ? r.dari : "sebelumnya");
  Serial.flush();
  esp_err_t galat = esp_ota_mark_app_invalid_rollback_and_reboot();  // otadata: INVALID, lalu restart ke rak lama
  // Kalau sampai di sini, fungsi di atas GAGAL dan tidak me-restart (misalnya rak lama tidak sah). Restart biasa tetap
  // membatalkan firmware ini: bootloader mengubah PENDING_VERIFY menjadi ABORTED dan memilih rak lama.
  logError("Rollback otomatis gagal (%s): restart biasa.", esp_err_to_name(galat));
  Serial.flush();
  delay(100);
  ESP.restart();
}

void cetakInfoRak() {
  const esp_partition_t* berjalan = esp_ota_get_running_partition();
  const esp_partition_t* sebelah = esp_ota_get_next_update_partition(nullptr);
  esp_ota_img_states_t keadaan;
  const char* teks = "tidak tercatat (dipasang lewat kabel)";
  if (berjalan != nullptr && esp_ota_get_state_partition(berjalan, &keadaan) == ESP_OK) {
    teks = namaKeadaan(keadaan);
  }
  Serial.printf("ota: rak berjalan %s (%s); rak sebelah %s, %lu byte\n", berjalan != nullptr ? berjalan->label : "?", teks,
                sebelah != nullptr ? sebelah->label : "TIDAK ADA (skema partisi tanpa OTA)",
                sebelah != nullptr ? (unsigned long)sebelah->size : 0UL);
  const esp_partition_t* batal = esp_ota_get_last_invalid_partition();
  if (batal != nullptr) {
    Serial.printf("ota: rak %s pernah dibatalkan (firmware yang gagal membuktikan diri)\n", batal->label);
  }
  if (masaUji) {
    unsigned long sisa = millis() < MASA_UJI_OTA ? (MASA_UJI_OTA - millis()) / 1000 : 0;
    Serial.printf("ota: MASA UJI, sisa %lu detik\n", sisa);
  } else {
    Serial.println("ota: masa uji: tidak");
  }
}
