// sensor.cpp - isi modul sensor. Daftar fungsinya ada di sensor.h.
#include <Arduino.h>
#include <DHT.h>
#include "konfigurasi.h"
#include "sensor.h"

static DHT dht(PIN_DHT, DHT22);
static BacaanSensor terakhir = {NAN, -1, 0, 0, false, -1};  // sebelum bacaan pertama: semua "belum tahu"

// ---------- Rata-rata bergerak untuk LDR dan sensor tanah (Modul 6, Praktik 2) ----------
// Setiap 2 ms, satu bacaan analog baru masuk ke "laci", menimpa laci yang paling lama.
// Dua puluh laci x 2 ms = rata-rata 40 ms terakhir, sama seperti Modul 6, tetapi tanpa delay().
const int JUMLAH_LACI = 20;
static int laciCahaya[JUMLAH_LACI];
static int laciTanah[JUMLAH_LACI];
static int posisiLaci = 0;
static unsigned long waktuSampelTerakhir = 0;

void siapkanSensor() {
  dht.begin();
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_TRIG, OUTPUT);
  digitalWrite(PIN_TRIG, LOW);
  pinMode(PIN_ECHO, INPUT);

  // Isi semua laci dengan bacaan pertama supaya rata-ratanya langsung masuk akal.
  int cahaya = analogRead(PIN_LDR);
  int tanah = analogRead(PIN_TANAH);
  for (int i = 0; i < JUMLAH_LACI; i++) {
    laciCahaya[i] = cahaya;
    laciTanah[i] = tanah;
  }
}

void perbaruiSensor() {
  unsigned long sekarang = millis();
  if (sekarang - waktuSampelTerakhir < 2) {
    return;  // belum 2 ms sejak sampel terakhir
  }
  waktuSampelTerakhir = sekarang;
  laciCahaya[posisiLaci] = analogRead(PIN_LDR);
  laciTanah[posisiLaci] = analogRead(PIN_TANAH);
  posisiLaci++;
  if (posisiLaci >= JUMLAH_LACI) {
    posisiLaci = 0;  // kembali ke laci pertama
  }
}

// Rata-rata isi semua laci. "int laci[]" berarti fungsi ini menerima deret laci mana pun yang dikirim.
static int rataRataLaci(int laci[]) {
  long jumlah = 0;
  for (int i = 0; i < JUMLAH_LACI; i++) {
    jumlah += laci[i];
  }
  return jumlah / JUMLAH_LACI;
}

static int bacaCahaya() {
  return 4095 - rataRataLaci(laciCahaya);  // dibalik: makin terang, makin besar
}

static int bacaTanahPersen() {
  int persen = map(rataRataLaci(laciTanah), TANAH_KERING, TANAH_BASAH, 0, 100);
  return constrain(persen, 0, 100);
}

// Mengukur jarak satu kali, dalam cm. Menjawab -1 kalau gemanya tidak kembali.
// pulseIn() menunggu paling lama 30 ms; bacaSensor() hanya memanggilnya setiap 2 detik,
// jadi jeda 60 ms antarpengukuran HC-SR04 (Modul 6) selalu terpenuhi.
static float ukurJarakCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long durasi = pulseIn(PIN_ECHO, HIGH, 30000);
  if (durasi == 0) {
    return -1;
  }
  return durasi / 58.0;
}

static int bacaLevelAir() {
  float jarak = ukurJarakCm();
  if (jarak < 0) {
    return -1;  // tidak diketahui
  }
  int persen = (JARAK_KOSONG - jarak) * 100 / (JARAK_KOSONG - JARAK_PENUH);
  return constrain(persen, 0, 100);
}

BacaanSensor bacaSensor() {
  BacaanSensor b;
  b.suhu = dht.readTemperature();
  float kelembapan = dht.readHumidity();
  if (isnan(kelembapan)) {
    b.kelembapan = -1;
  } else {
    b.kelembapan = round(kelembapan);  // dibulatkan ke bilangan bulat terdekat
  }
  b.cahaya = bacaCahaya();
  b.tanah = bacaTanahPersen();
  b.gerak = digitalRead(PIN_PIR) == HIGH;
  b.level_air = bacaLevelAir();
  terakhir = b;
  return b;
}

BacaanSensor bacaanTerakhir() {
  return terakhir;
}

bool sensorBermasalah(BacaanSensor b) {
  return isnan(b.suhu) || b.kelembapan < 0 || b.level_air < 0;
}
