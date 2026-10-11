// Modul 6 - Praktik 7: monitor lima sensor Node 1, rapi setiap 2 detik
// Semua bacaan masuk ke satu formulir BacaanSensor yang nama kolomnya
// persis sesuai kontrak data (Lampiran A Silabus): suhu, kelembapan, cahaya, tanah, gerak, level_air.
// Library: DHT sensor library by Adafruit 1.4.7 (+ Adafruit Unified Sensor 1.1.15).

#include <DHT.h>

// ---------- Peta pin kanonik (sensor Modul 6) ----------
const int PIN_DHT = 14;    // D14: DHT22
const int PIN_LDR = 36;    // VP: LDR
const int PIN_TANAH = 39;  // VN: sensor tanah kapasitif
const int PIN_PIR = 34;    // D34: PIR
const int PIN_TRIG = 15;   // D15: HC-SR04 TRIG
const int PIN_ECHO = 35;   // D35: HC-SR04 ECHO, lewat pembagi tegangan

// ---------- Hasil kalibrasimu (Praktik 3 dan 6) ----------
const int TANAH_KERING = 3000;    // angka mentah sensor tanah di udara
const int TANAH_BASAH = 1300;     // angka mentah sensor tanah di air
const float JARAK_KOSONG = 20.0;  // cm: sensor ke dasar tandon
const float JARAK_PENUH = 5.0;    // cm: sensor ke permukaan air saat tandon penuh

DHT dht(PIN_DHT, DHT22);

// Formulir data sensor. Nama kolomnya PERSIS sesuai kontrak data (Lampiran A Silabus).
struct BacaanSensor {
  float suhu;      // derajat Celsius; NAN kalau DHT22 gagal dibaca
  int kelembapan;  // persen; -1 kalau DHT22 gagal dibaca
  int cahaya;      // 0 (gelap gulita) sampai 4095 (sangat terang)
  int tanah;       // persen: 0 = kering seperti di udara, 100 = basah seperti di air
  bool gerak;      // true kalau PIR melihat gerakan
  int level_air;   // persen isi tandon; -1 kalau gema HC-SR04 tidak kembali
};

// Rata-rata 20 bacaan analog berturut-turut supaya derau teredam (Konsep 4).
int bacaAnalogRata(int pin) {
  long jumlah = 0;
  for (int i = 0; i < 20; i++) {
    jumlah += analogRead(pin);
    delay(2);
  }
  return jumlah / 20;
}

int bacaCahaya() {
  return 4095 - bacaAnalogRata(PIN_LDR);  // dibalik: makin terang, makin besar
}

int bacaTanahPersen() {
  int persen = map(bacaAnalogRata(PIN_TANAH), TANAH_KERING, TANAH_BASAH, 0, 100);
  return constrain(persen, 0, 100);
}

// Mengukur jarak satu kali, dalam cm. Menjawab -1 kalau gemanya tidak kembali.
float ukurJarakCm() {
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

int bacaLevelAir() {
  float jarak = ukurJarakCm();
  if (jarak < 0) {
    return -1;  // tidak diketahui
  }
  int persen = (JARAK_KOSONG - jarak) * 100 / (JARAK_KOSONG - JARAK_PENUH);
  return constrain(persen, 0, 100);
}

// Mengisi formulir dengan bacaan kelima sensor.
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
  return b;
}

// Mencetak angka, atau "--" kalau nilainya tidak sah (kurang dari 0).
void cetakNilai(int nilai) {
  if (nilai < 0) {
    Serial.print("--");
  } else {
    Serial.print(nilai);
  }
}

void cetakBacaan(BacaanSensor b) {
  Serial.print("suhu=");
  if (isnan(b.suhu)) {
    Serial.print("--");
  } else {
    Serial.print(b.suhu, 1);
  }
  Serial.print(" C  kelembapan=");
  cetakNilai(b.kelembapan);
  Serial.print(" %  cahaya=");
  Serial.print(b.cahaya);
  Serial.print("  tanah=");
  Serial.print(b.tanah);
  Serial.print(" %  gerak=");
  if (b.gerak) {
    Serial.print("ya");
  } else {
    Serial.print("tidak");
  }
  Serial.print("  level_air=");
  cetakNilai(b.level_air);
  Serial.println(" %");
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  digitalWrite(PIN_TRIG, LOW);
  Serial.println("Monitor lima sensor Node 1. Satu baris setiap 2 detik.");
}

void loop() {
  delay(2000);  // juga memenuhi syarat DHT22: paling cepat sekali tiap 2 detik
  BacaanSensor bacaan = bacaSensor();
  cetakBacaan(bacaan);
}
