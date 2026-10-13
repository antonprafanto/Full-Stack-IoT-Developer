// Modul 8 - Praktik 7: berburu bug dengan log bertingkat
// Rangkaian: meja kerja Node 1 (Modul 7). Yang dipakai: pompa D25, sensor tanah di VN (GPIO 39),
// dan HC-SR04 (TRIG D15, ECHO D35). Modul pencatat ada di tab pencatat.h dan pencatat.cpp.
//
// SENGAJA ADA SATU BUG di sketsa ini. Gejalanya: saat tanah kering, pompa hanya berkedip sekejap
// setiap 2 detik, padahal seharusnya menyala 3 detik lalu beristirahat 30 detik.
// Perintah di Serial Monitor: log debug, log info, log error.

#include "pencatat.h"

const int PIN_POMPA = 25;  // gerbang MOSFET: HIGH = pompa menyala
const int PIN_TANAH = 39;  // VN
const int PIN_TRIG = 15;
const int PIN_ECHO = 35;
const int PIN_RELAY_LAMPU = 32;  // tidak dipakai di sini: relay lampu dan kipas dimatikan supaya diam
const int PIN_RELAY_KIPAS = 33;

const int TANAH_KERING = 3000;    // hasil kalibrasimu dari Modul 6
const int TANAH_BASAH = 1300;
const float JARAK_KOSONG = 20.0;
const float JARAK_PENUH = 5.0;

const int AMBANG_TANAH_SIRAM = 30;
const int LEVEL_AIR_MINIMUM = 20;
const unsigned long JEDA_PERIKSA = 2000;  // SIAGA: periksa tanah setiap 2 detik
const unsigned long LAMA_SIRAM = 3000;    // MENYIRAM: pompa menyala 3 detik
const unsigned long LAMA_JEDA = 30000;    // JEDA: istirahat 30 detik

enum KeadaanSiram { SIAGA, MENYIRAM, JEDA };
KeadaanSiram keadaan = SIAGA;
unsigned long waktuMasukKeadaan = 0;  // kapan keadaan sekarang dimulai
unsigned long waktuPeriksaTerakhir = 0;
unsigned long waktuDebugTerakhir = 0;

// ---------- Pembaca baris Serial yang tidak pernah menunggu (sama dengan Praktik 5) ----------
const int PANJANG_BARIS_MAKS = 40;
char baris[PANJANG_BARIS_MAKS + 1];
int panjangBaris = 0;

bool adaBarisBaru() {
  while (Serial.available() > 0) {
    char huruf = Serial.read();
    if (huruf == '\n') {
      baris[panjangBaris] = '\0';
      panjangBaris = 0;
      return true;
    }
    if (huruf != '\r' && panjangBaris < PANJANG_BARIS_MAKS) {
      baris[panjangBaris] = huruf;
      panjangBaris++;
    }
  }
  return false;
}

void periksaPerintahSerial() {
  if (!adaBarisBaru()) {
    return;
  }
  String perintah = baris;
  perintah.trim();
  perintah.toLowerCase();
  if (perintah == "log debug") {
    aturTingkatLog(TINGKAT_DEBUG);
  } else if (perintah == "log info") {
    aturTingkatLog(TINGKAT_INFO);
  } else if (perintah == "log error") {
    aturTingkatLog(TINGKAT_ERROR);
  } else {
    Serial.println("Perintah tidak dikenal. Coba: log debug, log info, log error");
    return;
  }
  Serial.print("Tingkat log sekarang: ");
  Serial.println(namaTingkatLog(tingkatLog()));
}

int bacaTanahPersen() {
  long jumlah = 0;
  for (int i = 0; i < 20; i++) {
    jumlah += analogRead(PIN_TANAH);
  }
  int persen = map(jumlah / 20, TANAH_KERING, TANAH_BASAH, 0, 100);
  return constrain(persen, 0, 100);
}

int bacaLevelAir() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long durasi = pulseIn(PIN_ECHO, HIGH, 30000);
  if (durasi == 0) {
    return -1;
  }
  float jarak = durasi / 58.0;
  int persen = (JARAK_KOSONG - jarak) * 100 / (JARAK_KOSONG - JARAK_PENUH);
  return constrain(persen, 0, 100);
}

const char* namaKeadaan(KeadaanSiram k) {
  if (k == SIAGA) {
    return "SIAGA";
  }
  if (k == MENYIRAM) {
    return "MENYIRAM";
  }
  return "JEDA";
}

void pindahKe(KeadaanSiram keadaanBaru) {
  logInfo("Penyiraman: %s -> %s", namaKeadaan(keadaan), namaKeadaan(keadaanBaru));
  keadaan = keadaanBaru;
  unsigned long waktuMasukKeadaan = millis();  // catat kapan keadaan baru dimulai
}

void mulaiMenyiram() {
  int levelAir = bacaLevelAir();
  logDebug("Air tandon: %d %%", levelAir);
  if (levelAir < LEVEL_AIR_MINIMUM) {
    logError("Pompa DITOLAK: air tandon %d %%.", levelAir);
    pindahKe(JEDA);
    return;
  }
  digitalWrite(PIN_POMPA, HIGH);
  logInfo("Pompa menyala.");
  pindahKe(MENYIRAM);
}

void jalankanPenyiraman() {
  unsigned long sekarang = millis();

  // Rincian untuk berburu bug: sudah berapa lama di keadaan ini? Sekali per detik supaya Serial tidak banjir.
  if (keadaan != SIAGA && sekarang - waktuDebugTerakhir >= 1000) {
    waktuDebugTerakhir = sekarang;
    logDebug("%s: sudah %lu ms", namaKeadaan(keadaan), sekarang - waktuMasukKeadaan);
  }

  if (keadaan == SIAGA) {
    if (sekarang - waktuPeriksaTerakhir >= JEDA_PERIKSA) {
      waktuPeriksaTerakhir = sekarang;
      int tanah = bacaTanahPersen();
      logDebug("SIAGA: tanah %d %% (ambang %d %%)", tanah, AMBANG_TANAH_SIRAM);
      if (tanah < AMBANG_TANAH_SIRAM) {
        logInfo("Tanah kering (%d %%): mulai menyiram.", tanah);
        mulaiMenyiram();
      }
    }
  } else if (keadaan == MENYIRAM) {
    if (sekarang - waktuMasukKeadaan >= LAMA_SIRAM) {
      digitalWrite(PIN_POMPA, LOW);
      logInfo("Pompa padam.");
      pindahKe(JEDA);
    }
  } else if (keadaan == JEDA) {
    if (sekarang - waktuMasukKeadaan >= LAMA_JEDA) {
      pindahKe(SIAGA);
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(PIN_POMPA, OUTPUT);
  digitalWrite(PIN_POMPA, LOW);
  pinMode(PIN_TRIG, OUTPUT);
  digitalWrite(PIN_TRIG, LOW);
  pinMode(PIN_ECHO, INPUT);
  pinMode(PIN_RELAY_LAMPU, OUTPUT);
  digitalWrite(PIN_RELAY_LAMPU, HIGH);  // relay aktif LOW: HIGH = padam
  pinMode(PIN_RELAY_KIPAS, OUTPUT);
  digitalWrite(PIN_RELAY_KIPAS, HIGH);
  Serial.println();
  logInfo("Praktik 7 - berburu bug. Tingkat log: %s", namaTingkatLog(tingkatLog()));
}

void loop() {
  periksaPerintahSerial();
  jalankanPenyiraman();
}
