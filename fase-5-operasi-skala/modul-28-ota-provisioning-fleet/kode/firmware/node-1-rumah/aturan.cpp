// aturan.cpp - isi modul aturan. Daftar fungsinya ada di aturan.h.
#include <Arduino.h>
#include "konfigurasi.h"
#include "pencatat.h"
#include "pengaturan.h"
#include "aktuator.h"
#include "jaringan.h"  // Modul 19: modeOffline() dan catatKipasLokal()
#include "aturan.h"

// ---------- Siram otomatis: state machine dari Praktik 3 ----------
// SIAGA --(tanah kering)--> MENYIRAM --(pompa padam)--> JEDA --(30 detik)--> SIAGA
enum KeadaanSiram { SIAGA, MENYIRAM, JEDA };
static KeadaanSiram keadaan = SIAGA;
static unsigned long waktuMasukKeadaan = 0;  // kapan keadaan sekarang dimulai

static const char* namaKeadaan(KeadaanSiram k) {
  if (k == SIAGA) {
    return "SIAGA";
  }
  if (k == MENYIRAM) {
    return "MENYIRAM";
  }
  return "JEDA";
}

static void pindahKe(KeadaanSiram keadaanBaru) {
  logDebug("Penyiraman: %s -> %s", namaKeadaan(keadaan), namaKeadaan(keadaanBaru));
  keadaan = keadaanBaru;
  waktuMasukKeadaan = millis();
}

const char* keadaanPenyiraman() {
  return namaKeadaan(keadaan);
}

static void siramOtomatis(BacaanSensor b) {
  if (keadaan != SIAGA || pompaMenyala()) {
    return;  // sedang menyiram, sedang beristirahat, atau pompa sedang dinyalakan manual
  }
  if (b.tanah < ambangTanahSiram()) {
    logInfo("Tanah kering (%d %%, ambang %d %%): mencoba menyiram.", b.tanah, ambangTanahSiram());
    if (nyalakanPompa(DETIK_SIRAM, b.level_air)) {  // pengaman tandon ada di dalam nyalakanPompa()
      pindahKe(MENYIRAM);
    } else {
      pindahKe(JEDA);  // ditolak: jangan mencoba lagi sebelum 30 detik
    }
  }
}

// ---------- Lampu otomatis (Modul 6) ----------
static void lampuOtomatis(BacaanSensor b) {
  bool gelap = b.cahaya < AMBANG_GELAP;
  if (b.gerak && gelap && !lampuMenyala()) {
    logInfo("Ada gerakan di tempat gelap: lampu otomatis menyala.");
    aturLampuOtomatis(true);
  }
  if (!b.gerak && lampuDariOtomatis()) {  // hanya mematikan lampu yang ia nyalakan sendiri
    logInfo("Sepi: lampu otomatis padam.");
    aturLampuOtomatis(false);
  }
}

// ---------- Kipas pengaman lokal (Modul 19) ----------
// Biasanya server yang mengatur kipas. Pengaman ini hanya MENYALAKAN kipas dalam mode offline (broker tak terjangkau
// lebih dari 2 menit). Kipas yang ia nyalakan sendiri juga ia padamkan sendiri di bawah suhu_kipas_on - 2 °C, walaupun
// broker sudah terjangkau lagi, kecuali server atau kamu sudah mengambil alih kipas itu dengan perintah kipas.
static void kipasPengaman(BacaanSensor b) {
  if (isnan(b.suhu)) {
    return;  // DHT22 gagal dibaca: jangan menebak, biarkan kipas apa adanya
  }
  float batasNyala = ambangSuhuKipas();
  float batasPadam = batasNyala - SELISIH_KIPAS;
  if (modeOffline() && !kipasMenyala() && b.suhu > batasNyala) {
    logInfo("Pengaman lokal: suhu %.1f C di atas %.1f C, kipas dinyalakan.", b.suhu, batasNyala);
    aturKipasPengaman(true);
    catatKipasLokal();  // dihitung untuk laporan mode offline
  } else if (kipasDariPengaman() && b.suhu < batasPadam) {
    logInfo("Pengaman lokal: suhu %.1f C di bawah %.1f C, kipas dipadamkan.", b.suhu, batasPadam);
    aturKipasPengaman(false);
  }
}

void jalankanAturan(BacaanSensor b) {
  siramOtomatis(b);
  lampuOtomatis(b);
  kipasPengaman(b);  // Modul 19 (Lampiran A: "suhu_kipas_on")
}

void perbaruiAturan() {
  if (keadaan == MENYIRAM && !pompaMenyala()) {
    pindahKe(JEDA);  // pompa sudah padam: mulai beristirahat
  } else if (keadaan == JEDA && millis() - waktuMasukKeadaan >= LAMA_JEDA_SIRAM) {
    pindahKe(SIAGA);  // istirahat selesai: boleh menyiram lagi
  }
}
