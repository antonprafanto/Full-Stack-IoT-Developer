// pembaruan.cpp - isi modul pembaruan. Daftar fungsinya dan urutan kerjanya ada di pembaruan.h.
// Dikompilasi penulis (arduino-cli 1.5.1, esp32 3.3.12), tetapi BELUM dijalankan di papan: README firmware, "Status 1.7.0".
#include <Arduino.h>
#include <HTTPUpdate.h>           // ikut paket esp32 3.3.12: httpUpdate (unduh + tulis ke rak sebelah)
#include <NetworkClientSecure.h>  // ikut paket esp32: HTTPS dengan daftar sertifikat akar bawaan
#include <esp_task_wdt.h>         // watchdog
#include "konfigurasi.h"
#include "pencatat.h"
#include "sistem.h"
#include "pengaturan.h"
#include "aktuator.h"
#include "layar.h"
#include "jaringan.h"
#include "masa-uji.h"
#include "pembaruan.h"

static const char LABEL_RENCANA[] = "ota_rencana";  // label NVS (11 huruf, batas 15)
static const char LABEL_LAPORAN[] = "ota_laporan";
const uint8_t LAPORAN_DIULANG = 3;  // laporan ikut paling banyak 3 vitals (vitals QoS 0 bisa hilang)

static LaporanOta laporan;         // salinan laporan di RAM
static bool adaLaporan = false;
static bool dijadwalkan = false;   // perintah update sudah diterima (ack ok:true), unduhan belum dimulai
static bool sedangBerjalan = false;
static char idBaru[PANJANG_ID_MAKS + 1] = "";
static char versiBaru[PANJANG_VERSI_MAKS + 1] = "";
static char sha256Baru[65] = "";
static int persenTerakhir = -10;  // -10: laporan 0 % ikut tercetak

// ---------- Catatan di NVS ----------
bool bacaRencanaOta(RencanaOta& rencana) {
  return bacaCatatan(LABEL_RENCANA, &rencana, sizeof(rencana));
}

static void simpanRencanaOta(const RencanaOta& rencana) {
  simpanCatatan(LABEL_RENCANA, &rencana, sizeof(rencana));
}

void hapusRencanaOta() {
  hapusCatatan(LABEL_RENCANA);
}

// Teks dari luar (pesan galat library, id perintah) dipakai di laporan: hanya huruf ASCII yang tampak, supaya JSON-nya
// pendek dan tetap terbaca. Tanda kutip dan garis miring terbalik diganti spasi.
static void salinRapi(char* tujuan, size_t ukuran, const char* asal) {
  size_t i = 0;
  for (; asal != nullptr && asal[i] != '\0' && i + 1 < ukuran; i++) {
    char h = asal[i];
    tujuan[i] = (h < 32 || h > 126 || h == '"' || h == '\\') ? ' ' : h;
  }
  tujuan[i] = '\0';
}

void catatHasilOta(const char* id, const char* hasil, const char* versi, const char* pesan) {
  memset(&laporan, 0, sizeof(laporan));
  snprintf(laporan.id, sizeof(laporan.id), "%s", id);  // id dipakai server untuk mencocokkan: disalin apa adanya
  snprintf(laporan.hasil, sizeof(laporan.hasil), "%s", hasil);
  snprintf(laporan.versi, sizeof(laporan.versi), "%s", versi);
  salinRapi(laporan.pesan, sizeof(laporan.pesan), pesan);
  laporan.terkirim = 0;
  simpanCatatan(LABEL_LAPORAN, &laporan, sizeof(laporan));
  adaLaporan = true;
  logInfo("Laporan pembaruan disimpan: %s ke %s%s%s (ikut %u vitals berikutnya)", laporan.hasil, laporan.versi,
          laporan.pesan[0] != '\0' ? ": " : "", laporan.pesan, LAPORAN_DIULANG);
}

const LaporanOta* laporanOtaMenunggu() {
  return adaLaporan ? &laporan : nullptr;
}

void laporanOtaTerkirim() {
  if (!adaLaporan) {
    return;
  }
  laporan.terkirim++;
  if (laporan.terkirim >= LAPORAN_DIULANG) {
    hapusCatatan(LABEL_LAPORAN);
    adaLaporan = false;
    logInfo("Laporan pembaruan sudah %u kali ikut vitals: selesai.", LAPORAN_DIULANG);
  } else {
    simpanCatatan(LABEL_LAPORAN, &laporan, sizeof(laporan));  // hitungannya ikut tersimpan, walau Node 1 restart
  }
}

// ---------- Saat menyala ----------
static bool menyalaKarenaListrik() {  // padam lalu menyala lagi, bukan restart oleh program atau watchdog
  return strcmp(alasanReset(), "POWERON") == 0 || strcmp(alasanReset(), "BROWNOUT") == 0;
}

void siapkanPembaruan() {
  if (bacaCatatan(LABEL_LAPORAN, &laporan, sizeof(laporan)) && laporan.terkirim < LAPORAN_DIULANG) {
    adaLaporan = true;
    logInfo("Laporan pembaruan menunggu dikirim: %s ke %s (sudah %u dari %u kali)", laporan.hasil, laporan.versi,
            laporan.terkirim, LAPORAN_DIULANG);
  }
  mulaiMasaUji();  // masa-uji.cpp: rak berjalan baru dipasang lewat udara? masa uji 60 detik dimulai

  RencanaOta r;
  if (!bacaRencanaOta(r)) {
    return;  // tidak ada pembaruan yang tertinggal
  }
  char pesan[PANJANG_PESAN_OTA_MAKS + 1];
  // Rencana "mengunduh" yang ditemukan firmware yang sedang MASA UJI bukan unduhan gagal: listrik padam tepat sesudah
  // library selesai memasang firmware ini (rak sudah dipilih) tetapi sebelum rencananya sempat ditulis "dipasang".
  // Rencana itu diserahkan ke masa uji di bawah, yang nanti melapor berhasil atau rollback.
  if (r.tahap == TAHAP_MENGUNDUH && !dalamMasaUji()) {
    // Menyala lagi di tengah unduhan (listrik padam atau watchdog). Rak lama utuh: 16 byte pertama rak baru baru ditulis
    // paling akhir oleh library, jadi rak setengah jadi tidak pernah dijalankan bootloader.
    if (menyalaKarenaListrik()) {
      snprintf(pesan, sizeof(pesan), "padam saat mengunduh");
    } else {
      snprintf(pesan, sizeof(pesan), "menyala ulang saat mengunduh (%s)", alasanReset());
    }
    logError("Pembaruan ke %s tidak selesai: %s. Firmware %s tetap dipakai.", r.ke, pesan, VERSI_FIRMWARE);
    catatHasilOta(r.id, "gagal", r.ke, pesan);
    hapusRencanaOta();
    return;
  }
  if (dalamMasaUji()) {  // firmware ini yang baru dipasang: rencananya dipakai masa uji (masa-uji.cpp)
    if (strcmp(VERSI_FIRMWARE, r.ke) != 0) {
      logError("PERINGATAN: berkas versi %s ternyata berisi VERSI_FIRMWARE %s. Lupa menaikkan VERSI_FIRMWARE sebelum "
               "Export Compiled Binary?", r.ke, VERSI_FIRMWARE);
    }
    return;
  }
  if (strcmp(VERSI_FIRMWARE, r.dari) == 0) {
    // Firmware lama yang menyala: bootloader membatalkan firmware baru (ABORTED) karena Node 1 menyala ulang di tengah
    // masa ujinya (listrik padam, program mogok, atau watchdog) sebelum firmware baru sempat membuktikan diri.
    if (menyalaKarenaListrik()) {
      snprintf(pesan, sizeof(pesan), "padam di tengah masa uji");
    } else {
      snprintf(pesan, sizeof(pesan), "menyala ulang di tengah masa uji (%s)", alasanReset());
    }
    logError("Firmware %s BATAL, kembali ke %s: %s.", r.ke, r.dari, pesan);
    catatHasilOta(r.id, "rollback", r.ke, pesan);
  } else if (strcmp(VERSI_FIRMWARE, r.ke) == 0) {
    // Firmware baru sudah ditandai sah, tetapi listrik padam sebelum rencananya sempat dihapus.
    logInfo("Firmware %s sudah sah sebelum Node 1 padam: laporan berhasil dikirim sekarang.", r.ke);
    catatHasilOta(r.id, "berhasil", r.ke, "");
  } else {
    logInfo("Rencana pembaruan lama (%s ke %s) dibuang: firmware %s dipasang lewat kabel.", r.dari, r.ke, VERSI_FIRMWARE);
  }
  hapusRencanaOta();
}

// ---------- Menerima perintah ----------
bool pembaruanSedangBerjalan() {
  return dijadwalkan || sedangBerjalan;
}

const char* terimaUpdate(const char* id, const IsiUpdate& isi) {
  static char alasan[64];  // static: isinya masih dibaca kirimAck() setelah fungsi ini selesai
  KeadaanUpdate keadaan = {
    VERSI_FIRMWARE, alamatServerTersimpan(), ESP.getFreeSketchSpace(), dalamMasaUji(), pembaruanSedangBerjalan(),
  };
  const char* tolak = periksaUpdate(isi, keadaan, alasan, sizeof(alasan));  // periksa-ota.cpp, sama dengan simulator
  if (tolak != nullptr) {
    return tolak;
  }
  // Disalin sekarang: JSON perintahnya hilang begitu fungsi pemanggil selesai. Unduhannya dikerjakan perbaruiPembaruan()
  // di putaran loop() berikutnya, SESUDAH mqtt.loop() selesai dan ack sudah ditulis ke sambungan.
  snprintf(idBaru, sizeof(idBaru), "%s", id);
  snprintf(versiBaru, sizeof(versiBaru), "%s", isi.versi);
  snprintf(sha256Baru, sizeof(sha256Baru), "%s", isi.sha256);
  dijadwalkan = true;
  if (bandingkanVersi(isi.versi, VERSI_FIRMWARE) < 0) {
    logInfo("Pembaruan %s: TURUN versi %s ke %s (server mengirimnya dengan centang paksa).", id, VERSI_FIRMWARE, isi.versi);
  }
  return nullptr;
}

// ---------- Mengunduh ----------
// Dipanggil HTTPUpdate setiap satu sektor (4 KB) tertulis. Inilah SATU-SATUNYA tempat watchdog diberi makan selama
// mengunduh: kalau data berhenti datang di tengah berkas, watchdog tidak diberi makan lagi (lihat jalankanPembaruan()).
static void saatUnduhMaju(int sudah, int total) {
  esp_task_wdt_reset();
  int persen = total > 0 ? (int)((long long)sudah * 100 / total) : 0;
  if (persen / 10 != persenTerakhir / 10 || sudah == total) {
    persenTerakhir = persen;
    logInfo("Mengunduh firmware %s: %d %% (%d dari %d byte)", versiBaru, persen, sudah, total);
    char baris[22];
    snprintf(baris, sizeof(baris), "%d %%", persen);
    tampilkanPesan("PEMBARUAN FIRMWARE", versiBaru, baris, "jangan cabut listrik");
  }
}

// Kode galat HTTPUpdate/HTTPClient/Update menjadi kalimat pendek untuk ota.pesan (paling panjang 80 huruf).
static void jelaskanGalat(int kode, NetworkClientSecure& aman, bool https, char* pesan, size_t ukuran) {
  switch (kode) {
    case HTTP_UE_TOO_LESS_SPACE:
      snprintf(pesan, ukuran, "berkas lebih besar dari rak program (-100 HTTP_UE_TOO_LESS_SPACE)");
      return;
    case HTTP_UE_SERVER_NOT_REPORT_SIZE:
      snprintf(pesan, ukuran, "server tidak memberi Content-Length (-101 HTTP_UE_SERVER_NOT_REPORT_SIZE)");
      return;
    case HTTP_UE_SERVER_FILE_NOT_FOUND:
      snprintf(pesan, ukuran, "berkas tidak ada di server: 404 (-102 HTTP_UE_SERVER_FILE_NOT_FOUND)");
      return;
    case HTTP_UE_SERVER_FORBIDDEN:
      snprintf(pesan, ukuran, "unduh ditolak server: 403 (-103 HTTP_UE_SERVER_FORBIDDEN)");
      return;
    case HTTP_UE_SERVER_WRONG_HTTP_CODE:  // termasuk 3xx: HTTPUpdate tidak mengikuti pengalihan
      snprintf(pesan, ukuran, "jawaban server bukan 200/304/403/404 (-104 HTTP_UE_SERVER_WRONG_HTTP_CODE)");
      return;
    case HTTP_UE_BIN_VERIFY_HEADER_FAILED:  // http://: isi berkas yang terlambat > 0,1 detik juga berakhir di sini
      snprintf(pesan, ukuran, "bait pertama bukan 0xE9 atau belum tiba (-106 HTTP_UE_BIN_VERIFY_HEADER_FAILED)");
      return;
    case HTTP_UE_NO_PARTITION:
      snprintf(pesan, ukuran, "tidak ada rak program cadangan (-108 HTTP_UE_NO_PARTITION)");
      return;
    case HTTP_UE_SERVER_FAULTY_SHA256:
      snprintf(pesan, ukuran, "sha256 perintah ditolak Update (-109 HTTP_UE_SERVER_FAULTY_SHA256)");
      return;
    case UPDATE_ERROR_SHA256:  // berkasnya lain dengan yang dimaksud perintah: rak lama tetap dipakai
      snprintf(pesan, ukuran, "SHA-256 tidak cocok dengan perintah (Update 15 UPDATE_ERROR_SHA256)");
      return;
    case HTTPC_ERROR_READ_TIMEOUT:  // hanya saat MENUNGGU kepala jawaban server (HTTPClient), bukan di tengah berkas
      snprintf(pesan, ukuran, "server diam 8 detik sebelum menjawab (-11 HTTPC_ERROR_READ_TIMEOUT)");
      return;
    case UPDATE_ERROR_STREAM:  // https://: data berhenti di TENGAH berkas, library menyerah sesudah 300 x 0,1 detik
      snprintf(pesan, ukuran, "unduhan terhenti di tengah: 30 detik tanpa data (Update 6 UPDATE_ERROR_STREAM)");
      return;
    case HTTPC_ERROR_CONNECTION_REFUSED: {  // juga sertifikat HTTPS yang ditolak: rinciannya dari NetworkClientSecure
      char tls[48] = "";
      if (https) {
        aman.lastError(tls, sizeof(tls));
      }
      snprintf(pesan, ukuran, "tidak tersambung ke server (-1)%s%s", tls[0] != '\0' ? ": " : "", tls);
      return;
    }
    default:
      break;
  }
  if (kode < 0) {  // galat HTTPClient lainnya (sambungan putus di tengah jalan, dan sebagainya)
    snprintf(pesan, ukuran, "unduh gagal: %s (%d)", HTTPClient::errorToString(kode).c_str(), kode);
  } else if (kode > 0) {  // galat Update (menulis flash, aliran data terputus, ...)
    snprintf(pesan, ukuran, "%s (Update %d)", httpUpdate.getLastErrorString().c_str(), kode);
  } else {
    // http.begin() gagal: kode galat tidak diisi. Catatan: httpUpdate tidak menolkan kode galatnya di setiap percobaan,
    // jadi sesudah kegagalan lain, kode lama yang terbaca. Praktis tidak terjadi: alamatnya sudah diperiksa sebelumnya.
    snprintf(pesan, ukuran, "unduh gagal (alamat tidak bisa dipakai)");
  }
}

// Mengunduh dan menulis firmware ke rak sebelah. true = berhasil (rak sebelah siap dijalankan sesudah restart).
static bool unduhFirmware(char* pesan, size_t ukuran) {
  if (!wifiTersambung()) {
    snprintf(pesan, ukuran, "WiFi putus sebelum mengunduh");
    return false;
  }
  if (kunciBroker()[0] == '\0') {
    snprintf(pesan, ukuran, "kunci perangkat belum ada: unduhan butuh kunci (Modul 21)");
    return false;
  }
  char url[PANJANG_ALAMAT_SERVER_MAKS + 48];
  // Alamat unduh disusun SENDIRI dari alamat server tersimpan (sama persis dengan url perintah yang sudah diperiksa,
  // hanya huruf kecil): kunci perangkat tidak pernah dikirim ke alamat yang ditulis orang lain.
  if (!susunUrlFirmware(alamatServerTersimpan(), versiBaru, url, sizeof(url))) {
    snprintf(pesan, ukuran, "alamat unduh terlalu panjang");
    return false;
  }
  bool https = strncmp(url, "https://", 8) == 0;
  // HTTPS tidak perlu menunggu jam internet: paket esp32 3.3.12 memeriksa rantai sertifikat dan nama server, tetapi TIDAK
  // memeriksa tanggal berlakunya (CONFIG_MBEDTLS_HAVE_TIME_DATE mati di paket itu).
  NetworkClient polos;          // http:// hanya ke alamat IP rumah (sudah diperiksa periksa-ota.cpp)
  NetworkClientSecure aman;     // https://: sertifikat server diperiksa dengan daftar akar bawaan (ada ISRG Root X1 dan X2)
  NetworkClient* klien = &polos;
  if (https) {
    aman.useBuiltinCACertBundle();  // baru ada di paket esp32 3.3.12
    aman.setHandshakeTimeout(20);   // detik: jabat tangan TLS yang macet tidak menunggu sampai watchdog
    klien = &aman;
  }
  httpUpdate.rebootOnUpdate(false);                 // restart kita lakukan sendiri, sesudah rencana di NVS diperbarui
  httpUpdate.setLedPin(PIN_LED_STATUS, HIGH);       // LED status berkedip selama menulis
  httpUpdate.setAuthorization(deviceId(), kunciBroker());  // Basic device_id:kunci, dicocokkan backend (Modul 21)
  httpUpdate.setSHA256sum(sha256Baru);              // menang atas kepala x-SHA256 dari server
  httpUpdate.onProgress(saatUnduhMaju);
  persenTerakhir = -10;
  logInfo("Mengunduh %s ...", url);
  unsigned long mulai = millis();
  HTTPUpdateResult hasil = httpUpdate.update(*klien, url, VERSI_FIRMWARE);  // x-ESP32-version = versi yang berjalan
  if (hasil == HTTP_UPDATE_OK) {
    logInfo("Firmware %s tertulis di rak sebelah dalam %lu detik, sidik SHA-256 cocok.", versiBaru, (millis() - mulai) / 1000);
    return true;
  }
  if (hasil == HTTP_UPDATE_NO_UPDATES) {  // 304: server menganggap versi itu sudah terpasang
    snprintf(pesan, ukuran, "server: tidak ada pembaruan (304, HTTP_UPDATE_NO_UPDATES)");
    return false;
  }
  jelaskanGalat(httpUpdate.getLastError(), aman, https, pesan, ukuran);
  return false;
}

static void jalankanPembaruan() {
  dijadwalkan = false;
  sedangBerjalan = true;
  logInfo("Pembaruan %s DITERIMA: %s ke %s.", idBaru, VERSI_FIRMWARE, versiBaru);

  // 1. Rencana ke NVS dulu: kalau listrik padam di tengah jalan, firmware yang menyala sesudahnya tahu harus melapor.
  RencanaOta rencana;
  memset(&rencana, 0, sizeof(rencana));
  snprintf(rencana.id, sizeof(rencana.id), "%s", idBaru);
  snprintf(rencana.dari, sizeof(rencana.dari), "%s", VERSI_FIRMWARE);
  snprintf(rencana.ke, sizeof(rencana.ke), "%s", versiBaru);
  rencana.tahap = TAHAP_MENGUNDUH;
  simpanRencanaOta(rencana);

  // 2. Pompa dan buzzer padam: selama mengunduh, loop() tidak berputar (pengaman lokal ikut berhenti ±1 menit).
  padamkanPompaDanBuzzer();

  // 3. Berhenti sengaja: "offline-mode" lalu DISCONNECT rapi, supaya broker tidak menerbitkan wasiat "offline".
  berhentiSengaja();
  tampilkanPesan("PEMBARUAN FIRMWARE", versiBaru, "menghubungi server", "jangan cabut listrik");

  // 4. Watchdog dilonggarkan ke 60 detik: menyambung + menunggu jawaban server saja boleh 8 detik (lebih dari batas biasa
  //    5 detik), dan selama berkas mengalir watchdog diberi makan setiap 4 KB (saatUnduhMaju). Kalau data BERHENTI di
  //    tengah berkas: lewat https://, library menyerah sendiri sesudah ±30 detik (Update 6, lalu firmware lama tersambung
  //    lagi); lewat http://, library menunggu jauh lebih lama, jadi watchdog 60 detik yang me-restart Node 1. Rak lama tetap
  //    utuh, dan sesudah menyala firmware lama melapor "gagal: menyala ulang saat mengunduh (WDT)".
  aturBatasWatchdog(BATAS_WATCHDOG_OTA);

  // 5. Unduh + tulis + periksa sidik SHA-256.
  char pesan[PANJANG_PESAN_OTA_MAKS + 1] = "";
  if (unduhFirmware(pesan, sizeof(pesan))) {
    rencana.tahap = TAHAP_DIPASANG;  // rak sebelah sudah dipilih bootloader untuk menyala berikutnya
    simpanRencanaOta(rencana);
    logInfo("Restart ke firmware %s. Masa uji 60 detik dimulai begitu menyala.", versiBaru);
    tampilkanPesan("PEMBARUAN FIRMWARE", versiBaru, "berhasil diunduh", "menyala ulang...");
    Serial.flush();
    delay(200);
    ESP.restart();  // reset_reason berikutnya: SW
  }

  // Gagal SEBELUM menyala ulang: rak lama utuh, firmware lama tetap berjalan tanpa restart.
  aturBatasWatchdog(BATAS_WATCHDOG);
  logError("Pembaruan ke %s GAGAL: %s. Firmware %s tetap dipakai.", versiBaru, pesan, VERSI_FIRMWARE);
  catatHasilOta(idBaru, "gagal", versiBaru, pesan);
  hapusRencanaOta();
  sedangBerjalan = false;
  tampilkanPesan("PEMBARUAN GAGAL", versiBaru, "firmware lama", "tetap dipakai");
  lanjutkanSambungan();  // jaringan.cpp: tersambung lagi ke broker (online), lalu vitals membawa laporan "gagal"
}

void perbaruiPembaruan() {
  perbaruiMasaUji();  // masa-uji.cpp: 60 detik lewat tanpa terbukti = rollback
  if (dijadwalkan) {
    jalankanPembaruan();
  }
}

// ---------- Restart sengaja (perintah Serial "restart", "wifi lupa") ----------
void bersiapRestart(const char* sebab) {
  if (dalamMasaUji()) {
    // Menyala ulang di tengah masa uji membatalkan firmware baru: bootloader kembali ke rak lama (kontrak aturan 13).
    RencanaOta r;
    if (bacaRencanaOta(r)) {
      catatHasilOta(r.id, "rollback", r.ke, "menyala ulang di tengah masa uji");
      hapusRencanaOta();
    }
    logError("Restart di tengah masa uji: firmware %s BATAL, Node 1 kembali ke firmware sebelumnya.", VERSI_FIRMWARE);
  }
  logInfo("Berhenti sengaja (%s): status offline-mode, lalu putus rapi dari broker.", sebab);
  berhentiSengaja();
}

void restartSengaja(const char* sebab) {
  bersiapRestart(sebab);
  Serial.println("Restart sekarang...");
  Serial.flush();  // tunggu sampai pesan di atas benar-benar terkirim
  delay(200);
  ESP.restart();
}

// ---------- Perintah Serial "ota" ----------
void cetakInfoOta() {
  Serial.printf("ota: firmware %s (%s), alamat server %s\n", VERSI_FIRMWARE, CATATAN_VERSI,
                alamatServerTersimpan()[0] != '\0' ? alamatServerTersimpan() : "BELUM DIISI (ketik: server <alamat>)");
  cetakInfoRak();  // masa-uji.cpp: rak berjalan, rak sebelah, masa uji
  if (pembaruanSedangBerjalan()) {
    Serial.printf("ota: pembaruan ke %s sedang berjalan\n", versiBaru);
  }
  RencanaOta r;
  if (bacaRencanaOta(r)) {
    Serial.printf("ota: rencana tersimpan: %s ke %s (id %s, tahap %u)\n", r.dari, r.ke, r.id, r.tahap);
  }
  if (adaLaporan) {
    Serial.printf("ota: laporan menunggu: %s ke %s%s%s (id %s, sudah %u dari %u vitals)\n", laporan.hasil, laporan.versi,
                  laporan.pesan[0] != '\0' ? ": " : "", laporan.pesan, laporan.id, laporan.terkirim, LAPORAN_DIULANG);
  } else {
    Serial.println("ota: tidak ada laporan pembaruan yang menunggu");
  }
}
