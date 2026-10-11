// Modul 6 - Praktik 8: siram otomatis dan lampu otomatis
// Siram: tanah kering -> pompa 3 detik, TETAPI ditolak kalau air tandon terlalu sedikit.
// Lampu: ada gerakan di tempat gelap -> relay lampu menyala; sepi lagi -> padam.
// Isinya Praktik 7 ditambah dua aturan di bawah tanda "BARU di Praktik 8".
// Library: DHT sensor library by Adafruit 1.4.7 (+ Adafruit Unified Sensor 1.1.15).

#include <DHT.h>

// ---------- Peta pin kanonik ----------
const int PIN_DHT = 14;          // D14: DHT22
const int PIN_LDR = 36;          // VP: LDR
const int PIN_TANAH = 39;        // VN: sensor tanah kapasitif
const int PIN_PIR = 34;          // D34: PIR
const int PIN_TRIG = 15;         // D15: HC-SR04 TRIG
const int PIN_ECHO = 35;         // D35: HC-SR04 ECHO, lewat pembagi tegangan
const int PIN_POMPA = 25;        // D25: gerbang MOSFET pompa (Modul 5)
const int PIN_RELAY_LAMPU = 32;  // D32: relay lampu, aktif LOW (Modul 5)

// ---------- Hasil kalibrasimu (Praktik 3 dan 6) ----------
const int TANAH_KERING = 3000;    // angka mentah sensor tanah di udara
const int TANAH_BASAH = 1300;     // angka mentah sensor tanah di air
const float JARAK_KOSONG = 20.0;  // cm: sensor ke dasar tandon
const float JARAK_PENUH = 5.0;    // cm: sensor ke permukaan air saat tandon penuh

// ---------- Aturan otomatis (BARU di Praktik 8) ----------
const int AMBANG_TANAH_SIRAM = 30;  // tanah di bawah 30 % = kering, perlu disiram (Lampiran A: tanah_siram)
const int LEVEL_AIR_MINIMUM = 20;   // pompa ditolak kalau isi tandon di bawah 20 %
const int DETIK_SIRAM = 3;          // lama pompa menyala
const int JEDA_SIRAM = 15;          // sesudah mencoba menyiram, tunggu 15 laporan (kira-kira 30 detik)
const int AMBANG_GELAP = 1000;      // cahaya di bawah ini dianggap gelap

DHT dht(PIN_DHT, DHT22);

struct BacaanSensor {
  float suhu;      // derajat Celsius; NAN kalau DHT22 gagal dibaca
  int kelembapan;  // persen; -1 kalau DHT22 gagal dibaca
  int cahaya;      // 0 (gelap gulita) sampai 4095 (sangat terang)
  int tanah;       // persen: 0 = kering seperti di udara, 100 = basah seperti di air
  bool gerak;      // true kalau PIR melihat gerakan
  int level_air;   // persen isi tandon; -1 kalau gema HC-SR04 tidak kembali
};

bool lampuMenyala = false;
int sisaJedaSiram = 0;  // berapa laporan lagi sebelum boleh mencoba menyiram lagi

// ---------- Membaca sensor (sama dengan Praktik 7) ----------
int bacaAnalogRata(int pin) {
  long jumlah = 0;
  for (int i = 0; i < 20; i++) {
    jumlah += analogRead(pin);
    delay(2);
  }
  return jumlah / 20;
}

int bacaCahaya() {
  return 4095 - bacaAnalogRata(PIN_LDR);
}

int bacaTanahPersen() {
  int persen = map(bacaAnalogRata(PIN_TANAH), TANAH_KERING, TANAH_BASAH, 0, 100);
  return constrain(persen, 0, 100);
}

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
    return -1;
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
    b.kelembapan = round(kelembapan);
  }
  b.cahaya = bacaCahaya();
  b.tanah = bacaTanahPersen();
  b.gerak = digitalRead(PIN_PIR) == HIGH;
  b.level_air = bacaLevelAir();
  return b;
}

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

// ---------- BARU di Praktik 8: aktuator dan dua aturan otomatis ----------
void aturLampu(bool nyala) {
  lampuMenyala = nyala;
  if (nyala) {
    digitalWrite(PIN_RELAY_LAMPU, LOW);  // relay aktif LOW
  } else {
    digitalWrite(PIN_RELAY_LAMPU, HIGH);
  }
}

// Pompa hanya menyala kalau air tandon cukup. Tandon diukur tepat sebelum pompa menyala.
void jalankanPompa(int detik) {
  detik = constrain(detik, 1, 10);  // batas aman: 1-10 detik
  delay(60);  // lembar data HC-SR04: jeda minimal 60 ms sejak ukuran sebelumnya (Konsep 10)
  int levelAir = bacaLevelAir();
  if (levelAir < LEVEL_AIR_MINIMUM) {  // -1 (tidak terbaca) juga lebih kecil, jadi ikut ditolak
    Serial.print("pompa DITOLAK: air tandon ");
    if (levelAir < 0) {
      Serial.println("tidak terbaca");
    } else {
      Serial.print("tinggal ");
      Serial.print(levelAir);
      Serial.println(" %");
    }
    return;
  }
  Serial.print("pompa menyala ");
  Serial.print(detik);
  Serial.println(" detik...");
  digitalWrite(PIN_POMPA, HIGH);
  delay(detik * 1000);  // untuk sementara masih memblokir; Modul 8 membuatnya tanpa delay()
  digitalWrite(PIN_POMPA, LOW);
}

void siramOtomatis(BacaanSensor b) {
  if (sisaJedaSiram > 0) {  // baru saja mencoba menyiram: tunggu dulu
    sisaJedaSiram--;
    return;
  }
  if (b.tanah < AMBANG_TANAH_SIRAM) {
    Serial.print("Tanah kering (");
    Serial.print(b.tanah);
    Serial.print(" %): ");
    jalankanPompa(DETIK_SIRAM);  // pengaman tandon ada di dalam jalankanPompa()
    sisaJedaSiram = JEDA_SIRAM;  // berhasil atau ditolak, jangan coba lagi selama kira-kira 30 detik
  }
}

void lampuOtomatis(BacaanSensor b) {
  bool gelap = b.cahaya < AMBANG_GELAP;
  if (b.gerak && gelap && !lampuMenyala) {
    Serial.println("Ada gerakan di tempat gelap: lampu menyala.");
    aturLampu(true);
  }
  if (!b.gerak && lampuMenyala) {
    Serial.println("Sepi: lampu padam.");
    aturLampu(false);
  }
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  digitalWrite(PIN_TRIG, LOW);
  pinMode(PIN_POMPA, OUTPUT);
  digitalWrite(PIN_POMPA, LOW);
  pinMode(PIN_RELAY_LAMPU, OUTPUT);
  aturLampu(false);  // segera matikan: pinMode(OUTPUT) baru saja membuat pin LOW (= relay menarik)
  Serial.println("Siram otomatis dan lampu otomatis aktif.");
}

void loop() {
  delay(2000);
  BacaanSensor bacaan = bacaSensor();
  cetakBacaan(bacaan);
  siramOtomatis(bacaan);
  lampuOtomatis(bacaan);
}
