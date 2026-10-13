// Modul 8 - Praktik 2: tiga tugas, satu loop()
// Rangkaian: meja kerja Node 1 (Modul 7). Yang dipakai: LED status D4, tombol D13,
// relay lampu D32, relay kipas D33, dan DHT22 di D14.
// Library: DHT sensor library 1.4.7 (ikut terpasang: Adafruit Unified Sensor 1.1.15).
//
// Tugas 1 - detak: LED status kedip pelan = normal, kedip cepat = sensor bermasalah.
// Tugas 2 - sensor: DHT22 dibaca setiap 2 detik.
// Tugas 3 - tombol: tekan pendek = lampu, tekan lama (1 detik) = kipas.

#include <DHT.h>

const int PIN_LED_STATUS = 4;
const int PIN_TOMBOL = 13;
const int PIN_RELAY_LAMPU = 32;  // relay aktif LOW
const int PIN_RELAY_KIPAS = 33;  // relay aktif LOW
const int PIN_DHT = 14;

// Jadwal, semuanya dalam milidetik
const unsigned long DETAK_NORMAL = 1000;      // satu kedip setiap 1 detik
const unsigned long DETAK_MASALAH = 250;      // empat kedip setiap 1 detik
const unsigned long LAMA_NYALA_DETAK = 100;   // LED menyala 100 ms di awal setiap detak
const unsigned long JEDA_BACA = 2000;         // DHT22 dibaca setiap 2 detik
const unsigned long JEDA_PANTUL = 30;         // bacaan tombol harus tenang selama ini
const unsigned long BATAS_TEKAN_LAMA = 1000;  // ditahan 1 detik atau lebih = tekan lama

DHT dht(PIN_DHT, DHT22);

// Catatan waktu dan keadaan setiap tugas
unsigned long waktuDetakMulai = 0;
bool sensorBermasalah = false;

unsigned long waktuBacaTerakhir = 0;

int bacaanTadi = HIGH;    // bacaan tombol di putaran sebelumnya; HIGH = dilepas
unsigned long waktuBacaanBerubah = 0;
int tombolStabil = HIGH;  // keadaan tombol yang sudah dipercaya (sudah tenang 30 ms)
unsigned long waktuMulaiTekan = 0;
bool tekanLamaSudah = false;

bool lampuMenyala = false;
bool kipasMenyala = false;

// Pengukur kesehatan loop()
unsigned long jumlahPutaran = 0;
unsigned long putaranTerlamaUs = 0;  // mikrodetik

void aturRelay(int pin, bool nyala) {
  if (nyala) {
    digitalWrite(pin, LOW);  // relay aktif LOW
  } else {
    digitalWrite(pin, HIGH);
  }
}

const char* teksOnOff(bool nyala) {
  if (nyala) {
    return "on";
  }
  return "off";
}

// ---------- Tugas 1: detak jantung ----------
void perbaruiDetak() {
  unsigned long sekarang = millis();
  unsigned long panjangDetak = DETAK_NORMAL;
  if (sensorBermasalah) {
    panjangDetak = DETAK_MASALAH;
  }
  if (sekarang - waktuDetakMulai >= panjangDetak) {
    waktuDetakMulai = sekarang;  // mulai detak berikutnya
  }
  // LED menyala hanya di awal detak: true = HIGH (nyala), false = LOW (padam)
  digitalWrite(PIN_LED_STATUS, sekarang - waktuDetakMulai < LAMA_NYALA_DETAK);
}

// ---------- Tugas 2: membaca DHT22 setiap 2 detik ----------
void bacaSensorTerjadwal() {
  if (millis() - waktuBacaTerakhir < JEDA_BACA) {
    return;  // belum waktunya: langsung kembali, tidak menunggu
  }
  waktuBacaTerakhir = millis();

  float suhu = dht.readTemperature();
  float kelembapan = dht.readHumidity();
  sensorBermasalah = isnan(suhu) || isnan(kelembapan);

  if (sensorBermasalah) {
    Serial.print("DHT22 tidak terbaca! LED status berkedip cepat.");
  } else {
    Serial.print("suhu=");
    Serial.print(suhu, 1);
    Serial.print(" C  kelembapan=");
    Serial.print(kelembapan, 0);
    Serial.print(" %");
  }
  Serial.print("  | loop(): ");
  Serial.print(jumlahPutaran);
  Serial.print(" putaran, terlama ");
  Serial.print(putaranTerlamaUs / 1000.0, 1);
  Serial.println(" ms");
  jumlahPutaran = 0;
  putaranTerlamaUs = 0;
}

// ---------- Tugas 3: tombol, tekan pendek dan tekan lama ----------
void tekanPendek() {
  lampuMenyala = !lampuMenyala;
  aturRelay(PIN_RELAY_LAMPU, lampuMenyala);
  Serial.print("Tekan pendek: lampu ");
  Serial.println(teksOnOff(lampuMenyala));
}

void tekanLama() {
  kipasMenyala = !kipasMenyala;
  aturRelay(PIN_RELAY_KIPAS, kipasMenyala);
  Serial.print("Tekan lama: kipas ");
  Serial.println(teksOnOff(kipasMenyala));
}

void periksaTombol() {
  unsigned long sekarang = millis();
  int bacaan = digitalRead(PIN_TOMBOL);

  // 1. Bacaan berubah (ditekan, dilepas, memantul, atau derau)? Hitung "tenang"-nya dari nol lagi.
  if (bacaan != bacaanTadi) {
    bacaanTadi = bacaan;
    waktuBacaanBerubah = sekarang;
  }

  // 2. Sudah tenang 30 ms dan berbeda dengan keadaan yang dipercaya? Itu perubahan sungguhan.
  if (bacaan != tombolStabil && sekarang - waktuBacaanBerubah >= JEDA_PANTUL) {
    tombolStabil = bacaan;
    if (tombolStabil == LOW) {  // baru saja ditekan: mulai menghitung lamanya
      waktuMulaiTekan = sekarang;
      tekanLamaSudah = false;
    } else if (!tekanLamaSudah) {  // baru saja dilepas sebelum 1 detik: tekan pendek
      tekanPendek();
    }
  }

  // 3. Masih ditahan dan sudah 1 detik? Tekan lama, dikerjakan sekali tanpa menunggu jari diangkat.
  if (tombolStabil == LOW && !tekanLamaSudah && sekarang - waktuMulaiTekan >= BATAS_TEKAN_LAMA) {
    tekanLamaSudah = true;
    tekanLama();
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED_STATUS, OUTPUT);
  pinMode(PIN_TOMBOL, INPUT_PULLUP);
  pinMode(PIN_RELAY_LAMPU, OUTPUT);
  pinMode(PIN_RELAY_KIPAS, OUTPUT);
  aturRelay(PIN_RELAY_LAMPU, false);  // segera matikan: pinMode(OUTPUT) membuat pin LOW (= relay menarik)
  aturRelay(PIN_RELAY_KIPAS, false);
  dht.begin();
  Serial.println("Praktik 2 - tiga tugas, satu loop(). Tekan pendek = lampu, tekan lama = kipas.");
}

void loop() {
  unsigned long mulai = micros();  // mikrodetik: untuk mengukur lama putaran ini

  perbaruiDetak();
  bacaSensorTerjadwal();
  periksaTombol();

  jumlahPutaran++;
  unsigned long lama = micros() - mulai;
  if (lama > putaranTerlamaUs) {
    putaranTerlamaUs = lama;
  }
}
