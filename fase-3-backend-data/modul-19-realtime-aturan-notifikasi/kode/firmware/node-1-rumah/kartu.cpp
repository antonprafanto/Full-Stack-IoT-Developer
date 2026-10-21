// kartu.cpp - isi modul kartu. Daftar fungsinya ada di kartu.h.
#include <Arduino.h>
#include <SD.h>
#include "konfigurasi.h"
#include "pencatat.h"
#include "sistem.h"
#include "kartu.h"

const char NAMA_FILE_CATATAN[] = "/node1.csv";  // nama file di kartu, selalu diawali garis miring
static bool kartuAda = false;                     // true kalau kartu microSD terbaca saat menyala

// Kalau kartu terbaca saat menyala, pencatatan diaktifkan. Tanpa kartu, Node 1 tetap berjalan.
void siapkanKartu() {
  kartuAda = SD.begin(PIN_SD_CS);
  if (!kartuAda) {
    logInfo("Kartu microSD tidak terbaca: catatan CSV dimatikan.");
    return;
  }
  if (!SD.exists(NAMA_FILE_CATATAN)) {
    File file = SD.open(NAMA_FILE_CATATAN, FILE_WRITE);
    file.println("uptime_s,suhu,kelembapan,cahaya,tanah,gerak,level_air");  // baris judul kolom
    file.close();
  }
  logInfo("Kartu microSD siap: bacaan dicatat ke node1.csv setiap 30 detik.");
}

// Satu baris CSV, disusun dengan snprintf() di char[] (Konsep 6). Bacaan yang gagal = sel kosong.
void catatKeKartu(BacaanSensor b) {
  if (!kartuAda) {
    return;
  }
  char suhu[8] = "";  // tetap kosong kalau bacaannya gagal
  if (!isnan(b.suhu)) {
    snprintf(suhu, sizeof(suhu), "%.1f", b.suhu);
  }
  char kelembapan[12] = "";  // 12 laci: muat angka int terpanjang (11 huruf) + tanda akhir
  if (b.kelembapan >= 0) {
    snprintf(kelembapan, sizeof(kelembapan), "%d", b.kelembapan);
  }
  char levelAir[12] = "";
  if (b.level_air >= 0) {
    snprintf(levelAir, sizeof(levelAir), "%d", b.level_air);
  }
  const char* gerak = "false";
  if (b.gerak) {
    gerak = "true";
  }
  char baris[64];
  snprintf(baris, sizeof(baris), "%lu,%s,%s,%d,%d,%s,%s",
           uptimeDetik(), suhu, kelembapan, b.cahaya, b.tanah, gerak, levelAir);

  File file = SD.open(NAMA_FILE_CATATAN, FILE_APPEND);  // APPEND = menambah di akhir file
  if (!file) {
    logError("Gagal menulis ke kartu microSD (tercabut?). Catatan CSV dihentikan.");
    kartuAda = false;
    return;
  }
  file.println(baris);
  file.close();  // baru setelah ditutup, isinya benar-benar tersimpan di kartu
  logDebug("CSV: %s", baris);
}
