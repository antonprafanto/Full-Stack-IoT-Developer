// aktuator.cpp - isi modul aktuator. Daftar fungsinya ada di aktuator.h.
#include <Arduino.h>
#include <ESP32Servo.h>
#include "konfigurasi.h"
#include "pencatat.h"
#include "aktuator.h"

const unsigned long LAMA_BUNYI = 150;  // milidetik

static Servo servoTirai;
static bool lampu = false;
static bool lampuMilikOtomatis = false;  // true kalau lampu dinyalakan oleh aturan otomatis
static bool kipas = false;
static int sudut = 90;

static bool pompa = false;
static unsigned long waktuPompaMulai = 0;
static unsigned long lamaPompa = 0;  // milidetik

static bool buzzer = false;
static unsigned long waktuBuzzerMulai = 0;

static void tulisRelay(int pin, bool nyala) {
  if (nyala) {
    digitalWrite(pin, LOW);  // relay aktif LOW
  } else {
    digitalWrite(pin, HIGH);
  }
}

void siapkanAktuator() {
  pinMode(PIN_RELAY_LAMPU, OUTPUT);
  pinMode(PIN_RELAY_KIPAS, OUTPUT);
  aturLampu(false);  // segera matikan: pinMode(OUTPUT) baru saja membuat pin LOW (= relay menarik)
  aturKipas(false);

  pinMode(PIN_POMPA, OUTPUT);
  digitalWrite(PIN_POMPA, LOW);

  // Servo dipasang SEBELUM buzzer: urutan ini mencegah keduanya berebut saluran PWM.
  servoTirai.setPeriodHertz(50);
  servoTirai.attach(PIN_SERVO_TIRAI, 500, 2400);
  aturTirai(sudut);

  ledcAttach(PIN_BUZZER, 2000, 10);
}

// Dipanggil di setiap putaran loop(): mematikan pompa dan buzzer begitu waktunya habis.
void perbaruiAktuator() {
  unsigned long sekarang = millis();
  if (pompa && sekarang - waktuPompaMulai >= lamaPompa) {
    digitalWrite(PIN_POMPA, LOW);
    pompa = false;
    logInfo("Pompa padam.");
  }
  if (buzzer && sekarang - waktuBuzzerMulai >= LAMA_BUNYI) {
    ledcWriteTone(PIN_BUZZER, 0);
    buzzer = false;
  }
}

void aturLampu(bool nyala) {
  lampu = nyala;
  lampuMilikOtomatis = false;  // perintah manual: lampu bukan lagi milik aturan otomatis
  tulisRelay(PIN_RELAY_LAMPU, nyala);
}

void aturLampuOtomatis(bool nyala) {
  lampu = nyala;
  lampuMilikOtomatis = nyala;
  tulisRelay(PIN_RELAY_LAMPU, nyala);
}

void aturKipas(bool nyala) {
  kipas = nyala;
  tulisRelay(PIN_RELAY_KIPAS, nyala);
}

// Modul 6: pompa hanya menyala kalau air tandon cukup. levelAir = bacaan tandon terbaru (paling lama 2 detik).
// Modul 8: pompa dinyalakan lalu langsung ditinggal; perbaruiAktuator() yang mematikannya nanti.
bool nyalakanPompa(int detik, int levelAir) {
  detik = constrain(detik, 1, 10);  // batas aman: 1-10 detik
  if (levelAir < LEVEL_AIR_MINIMUM) {  // -1 (tidak terbaca) juga lebih kecil, jadi ikut ditolak
    if (levelAir < 0) {
      logError("Pompa DITOLAK: air tandon tidak terbaca.");
    } else {
      logError("Pompa DITOLAK: air tandon tinggal %d %%.", levelAir);
    }
    return false;
  }
  digitalWrite(PIN_POMPA, HIGH);
  pompa = true;
  waktuPompaMulai = millis();
  lamaPompa = detik * 1000UL;
  logInfo("Pompa menyala %d detik.", detik);
  return true;
}

void aturTirai(int sudutBaru) {
  sudut = constrain(sudutBaru, 0, 180);
  servoTirai.write(sudut);
}

void bunyikanBuzzer() {
  ledcWriteTone(PIN_BUZZER, 2000);  // 2.000 Hz
  buzzer = true;
  waktuBuzzerMulai = millis();
}

bool lampuMenyala() {
  return lampu;
}

bool lampuDariOtomatis() {
  return lampuMilikOtomatis;
}

bool kipasMenyala() {
  return kipas;
}

bool pompaMenyala() {
  return pompa;
}

int sudutTirai() {
  return sudut;
}

const char* teksOnOff(bool nyala) {
  if (nyala) {
    return "on";
  }
  return "off";
}
