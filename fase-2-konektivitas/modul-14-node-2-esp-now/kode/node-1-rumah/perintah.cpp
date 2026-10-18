// perintah.cpp - isi modul perintah. Daftar fungsinya ada di perintah.h.
// Jawaban perintah selalu dicetak dengan Serial, berapa pun tingkat log yang sedang berlaku.
#include <Arduino.h>
#include "konfigurasi.h"
#include "pencatat.h"
#include "sistem.h"
#include "pengaturan.h"
#include "sensor.h"
#include "aktuator.h"
#include "aturan.h"
#include "jaringan.h"
#include "jembatan.h"
#include "perintah.h"

const int PANJANG_BARIS_MAKS = 40;
static char baris[PANJANG_BARIS_MAKS + 1];  // +1 untuk tanda akhir teks
static int panjangBaris = 0;

// Mengumpulkan huruf dari Serial Monitor TANPA menunggu.
// Menjawab true sekali, saat satu baris sudah lengkap (diakhiri Enter); isinya ada di "baris".
static bool adaBarisBaru() {
  while (Serial.available() > 0) {
    char huruf = Serial.read();
    if (huruf == '\n') {
      baris[panjangBaris] = '\0';  // tanda akhir teks
      panjangBaris = 0;            // siap mengumpulkan baris berikutnya
      return true;
    }
    if (huruf != '\r' && panjangBaris < PANJANG_BARIS_MAKS) {
      baris[panjangBaris] = huruf;
      panjangBaris++;
    }
  }
  return false;
}

static void cetakStatus() {
  Serial.printf("status: lampu=%s kipas=%s pompa=%s tirai=%d\n", teksOnOff(lampuMenyala()),
                teksOnOff(kipasMenyala()), teksOnOff(pompaMenyala()), sudutTirai());
}

static void cetakInfo() {
  unsigned long detik = uptimeDetik();
  Serial.printf("info: firmware %s, menyala %02lu:%02lu:%02lu, restart terakhir %s, nyala ke-%lu\n",
                VERSI_FIRMWARE, detik / 3600, (detik / 60) % 60, detik % 60, alasanReset(), jumlahNyala());
  Serial.printf("info: memori bebas %lu byte, putaran loop() terlama %lu ms, watchdog %lu detik\n",
                ESP.getFreeHeap(), putaranTerlamaMs(), BATAS_WATCHDOG / 1000);
  Serial.printf("info: ambang tanah_siram %d %%, penyiraman %s, tingkat log %s\n", ambangTanahSiram(),
                keadaanPenyiraman(), namaTingkatLog(tingkatLog()));
}

static void cetakAmbang() {
  const char* asal = "angka bawaan";
  if (ambangDariNvs()) {
    asal = "dari NVS";
  }
  Serial.printf("ambang: tanah_siram = %d %% (%s)\n", ambangTanahSiram(), asal);
}

// Menjawab true kalau teks BUKAN angka: toInt() memberi 0, padahal teksnya bukan "0" (cara Praktik 5 Modul 5).
static bool bukanAngka(String teks) {
  return teks.toInt() == 0 && teks != "0";
}

void periksaPerintahSerial() {
  if (!adaBarisBaru()) {
    return;  // belum ada baris lengkap: langsung kembali, tidak menunggu
  }
  String perintah = baris;  // perintah datang sesekali saja, jadi String aman dipakai di sini
  perintah.trim();
  perintah.toLowerCase();
  if (perintah.length() == 0) {
    return;
  }

  if (perintah == "lampu on") {
    aturLampu(true);
  } else if (perintah == "lampu off") {
    aturLampu(false);
  } else if (perintah == "kipas on") {
    aturKipas(true);
  } else if (perintah == "kipas off") {
    aturKipas(false);
  } else if (perintah.startsWith("pompa ")) {
    String angka = perintah.substring(6);  // teks sesudah "pompa "
    if (bukanAngka(angka)) {
      Serial.println("Butuh angka detik. Contoh: pompa 3");
      return;
    }
    nyalakanPompa(angka.toInt(), bacaanTerakhir().level_air);  // pengaman tandon memakai bacaan terbaru
  } else if (perintah.startsWith("tirai ")) {
    String angka = perintah.substring(6);  // teks sesudah "tirai "
    if (bukanAngka(angka)) {
      Serial.println("Butuh angka sudut. Contoh: tirai 90");
      return;
    }
    aturTirai(angka.toInt());
  } else if (perintah == "bunyi") {
    bunyikanBuzzer();
  } else if (perintah == "info") {
    cetakInfo();
    return;
  } else if (perintah == "ambang") {
    cetakAmbang();
    return;
  } else if (perintah == "ambang bawaan") {
    hapusAmbangTanahSiram();
    cetakAmbang();
    return;
  } else if (perintah.startsWith("ambang ")) {
    String angka = perintah.substring(7);  // teks sesudah "ambang "
    if (bukanAngka(angka) || !simpanAmbangTanahSiram(angka.toInt())) {
      Serial.println("Butuh angka 0-100. Contoh: ambang 35");
      return;
    }
    cetakAmbang();
    return;
  } else if (perintah == "log debug") {
    aturTingkatLog(TINGKAT_DEBUG);
    Serial.println("Tingkat log: DEBUG (semua pesan)");
    return;
  } else if (perintah == "log info") {
    aturTingkatLog(TINGKAT_INFO);
    Serial.println("Tingkat log: INFO (bawaan)");
    return;
  } else if (perintah == "log error") {
    aturTingkatLog(TINGKAT_ERROR);
    Serial.println("Tingkat log: ERROR (hanya masalah)");
    return;
  } else if (perintah == "wifi") {
    cetakInfoJaringan();  // Modul 10
    return;
  } else if (perintah == "wifi lupa") {
    lupakanWiFi();  // Modul 10: menghapus WiFi tersimpan, lalu restart ke portal
    return;
  } else if (perintah == "node2") {
    cetakInfoNode2();  // Modul 14: statistik paket Node 2
    return;
  } else if (perintah == "node2 nol") {
    nolkanHitunganNode2();  // Modul 14: hitungan mulai dari nol, misalnya tepat saat router dicabut
    cetakInfoNode2();
    return;
  } else if (perintah == "kirim") {
    kirimSekarang();  // Modul 11: terbitkan telemetry sekarang juga lewat MQTT
    return;
  } else if (perintah == "restart") {
    Serial.println("Restart sekarang...");
    Serial.flush();  // tunggu sampai pesan di atas benar-benar terkirim
    ESP.restart();
  } else if (perintah != "status") {
    Serial.println("Perintah tidak dikenal. Contoh: lampu on, kipas off, pompa 3, tirai 90, bunyi, status,");
    Serial.println("info, ambang, ambang 35, ambang bawaan, log debug, log info, log error, wifi, wifi lupa,");
    Serial.println("kirim, node2, node2 nol, restart");
    return;
  }
  cetakStatus();
}
