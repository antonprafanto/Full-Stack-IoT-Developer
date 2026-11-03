// klaim.cpp - isi modul klaim. Daftar fungsinya ada di klaim.h.
// Dikompilasi penulis (arduino-cli 1.5.1, esp32 3.3.12), tetapi BELUM dijalankan di papan: README firmware, "Status 1.7.0".
#include <Arduino.h>
#include <HTTPClient.h>           // ikut paket esp32
#include <NetworkClientSecure.h>  // ikut paket esp32: HTTPS dengan daftar sertifikat akar bawaan
#include <ArduinoJson.h>
#include "konfigurasi.h"
#include "pencatat.h"
#include "sistem.h"
#include "pengaturan.h"
#include "periksa-ota.h"
#include "jaringan.h"
#include "masa-uji.h"
#include "klaim.h"

const unsigned long JEDA_COBA_KLAIM = 30000;  // server tidak terjangkau atau 503: coba lagi 30 detik kemudian
const int PERCOBAAN_KLAIM_MAKS = 3;           // paling banyak 3 kali; sesudah itu ketik "klaim <kode>" lagi

static char kodeKlaim[13] = "";  // RAM saja: kode sekali pakai tidak pernah ditulis ke NVS
static bool menunggu = false;
static bool sudahCoba = false;
static int percobaan = 0;
static unsigned long waktuCobaTerakhir = 0;

static void selesaiKlaim() {
  memset(kodeKlaim, 0, sizeof(kodeKlaim));  // kodenya dihapus dari RAM juga
  menunggu = false;
}

const char* mulaiKlaim(const char* kode) {
  const char* salah = periksaKodeKlaim(kode);  // periksa-ota.cpp: hanya bentuknya
  if (salah != nullptr) {
    return salah;
  }
  if (dalamMasaUji()) {
    return "tunggu masa uji firmware baru selesai (ketik: ota)";
  }
  if (alamatServerTersimpan()[0] == '\0') {
    return "alamat server belum diisi: ketik klaim <kode> <alamat server>, atau server <alamat> dulu";
  }
  snprintf(kodeKlaim, sizeof(kodeKlaim), "%s", kode);
  menunggu = true;
  sudahCoba = false;
  percobaan = 0;
  logInfo("Kode klaim diterima (tidak disimpan di NVS); dikirim ke %s begitu WiFi siap.", alamatServerTersimpan());
  return nullptr;
}

static void kirimKlaim(const char* server, bool https) {
  sudahCoba = true;
  waktuCobaTerakhir = millis();
  percobaan++;
  char url[PANJANG_ALAMAT_SERVER_MAKS + 24];
  snprintf(url, sizeof(url), "%s/api/provision/klaim", server);
  char isi[64];  // kode sudah diperiksa (huruf, angka, -, spasi), jadi aman ditulis langsung ke JSON
  snprintf(isi, sizeof(isi), "{\"kode\":\"%s\",\"device_id\":\"%s\"}", kodeKlaim, deviceId());
  logInfo("Klaim: mengirim kode ke %s (percobaan %d dari %d)...", url, percobaan, PERCOBAAN_KLAIM_MAKS);

  aturBatasWatchdog(BATAS_WATCHDOG_OTA);  // jabat tangan HTTPS bisa lebih dari 5 detik
  NetworkClient polos;
  NetworkClientSecure aman;
  NetworkClient* klien = &polos;
  if (https) {
    aman.useBuiltinCACertBundle();
    aman.setHandshakeTimeout(20);
    klien = &aman;
  }
  HTTPClient http;
  int kode = HTTPC_ERROR_CONNECTION_REFUSED;
  String jawaban;
  unsigned long mulai = millis();
  if (http.begin(*klien, url)) {
    http.setConnectTimeout(5000);
    http.setTimeout(10000);
    http.addHeader("Content-Type", "application/json");
    kode = http.POST(String(isi));
    if (kode > 0) {
      jawaban = http.getString();
    }
    http.end();
  }
  aturBatasWatchdog(BATAS_WATCHDOG);
  unsigned long lama = millis() - mulai;

  JsonDocument dokumen;
  bool jsonSah = kode > 0 && !deserializeJson(dokumen, jawaban);
  if (kode == HTTP_CODE_CREATED) {
    const char* kunci = jsonSah ? (dokumen["kunci"] | "") : "";
    if (!simpanKunciBroker(kunci)) {  // pengaturan.cpp: 1-64 huruf A-Z, a-z, 0-9, - atau _
      logError("Klaim: jawaban 201 tanpa kunci yang sah. Laporkan ke admin.");
      selesaiKlaim();
      return;
    }
    logInfo("Klaim BERHASIL dalam %lu ms: kunci perangkat disimpan di NVS (nama pengguna broker %s). Menyambung ke broker...",
            lama, deviceId());
    gantiKunciBroker();  // jaringan.cpp: langsung dicoba dengan kunci baru
    selesaiKlaim();
    return;
  }
  const char* pesan = jsonSah ? (dokumen["pesan"] | (dokumen["message"] | "")) : "";
  if (kode <= 0) {
    char tls[48] = "";
    if (https) {
      aman.lastError(tls, sizeof(tls));
    }
    logError("Klaim GAGAL: server %s tidak terjangkau (%s)%s%s", server, HTTPClient::errorToString(kode).c_str(),
             tls[0] != '\0' ? ": " : "", tls);
  } else {
    logError("Klaim DITOLAK %d: %s", kode, pesan[0] != '\0' ? pesan : "(tanpa pesan)");
  }
  if (kode == 403) {
    logInfo("Kode salah, kedaluwarsa, atau sudah dipakai: minta kode baru ke admin (/armada, Buat kode klaim).");
  } else if (kode == 409) {
    logInfo("Perangkat ini masih terdaftar dan aktif: nonaktifkan dulu di /armada, lalu klaim lagi dengan kode baru.");
  } else if (kode == 429) {
    logInfo("Terlalu banyak percobaan: tunggu 1 menit, lalu ketik klaim <kode> lagi.");
  }
  if ((kode <= 0 || kode == 503) && percobaan < PERCOBAAN_KLAIM_MAKS) {  // 503: kodenya TIDAK hangus
    logInfo("Klaim dicoba lagi %lu detik lagi.", JEDA_COBA_KLAIM / 1000);
  } else {
    selesaiKlaim();
  }
}

void perbaruiKlaim() {
  if (!menunggu || dalamMasaUji() || !wifiTersambung()) {
    return;
  }
  if (sudahCoba && millis() - waktuCobaTerakhir < JEDA_COBA_KLAIM) {
    return;
  }
  const char* server = alamatServerTersimpan();
  if (server[0] == '\0') {
    logError("Klaim dibatalkan: alamat server belum diisi.");
    selesaiKlaim();
    return;
  }
  // HTTPS tidak perlu menunggu jam internet: paket esp32 3.3.12 memeriksa rantai sertifikat dan nama server, tetapi TIDAK
  // memeriksa tanggal berlakunya (CONFIG_MBEDTLS_HAVE_TIME_DATE mati di paket itu). Jadi klaim dikirim begitu WiFi siap.
  bool https = strncmp(server, "https://", 8) == 0;
  kirimKlaim(server, https);
}

void cetakInfoKlaim() {
  if (menunggu) {
    Serial.printf("klaim: kode menunggu dikirim ke %s (sudah %d dari %d percobaan)\n", alamatServerTersimpan(), percobaan,
                  PERCOBAAN_KLAIM_MAKS);
  } else {
    Serial.println("klaim: tidak ada kode yang menunggu");
  }
}
