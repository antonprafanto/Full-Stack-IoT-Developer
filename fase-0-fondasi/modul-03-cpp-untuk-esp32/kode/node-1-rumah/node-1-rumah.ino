// Node 1 "Rumah" - kerangka program v0.1.0 (dibuat di Modul 3)
// Proyek benang merah: Rumah Pintar Mini.
//
// Setiap fungsi di bawah ini adalah "rak" yang sudah diberi label, tetapi isinya
// sebagian besar masih kosong. Rak-rak ini diisi bertahap mulai Modul 5.
// Walaupun begitu, kode ini sudah bisa dijalankan: ia mencetak bacaan contoh
// ke Serial Monitor tiap 2 detik dan mengedipkan LED status di D4.

const String VERSI_FIRMWARE = "0.1.0";
const int PIN_LED_STATUS = 4;          // LED status, terpasang sejak Modul 2
const unsigned long JEDA_BACA = 2000;  // baca sensor tiap 2 detik

// Formulir data sensor. Nama kolomnya mengikuti kontrak data (Lampiran A Silabus).
struct BacaanSensor {
  float suhu;      // derajat Celsius
  int kelembapan;  // persen
  int cahaya;      // 0-4095
  bool gerak;      // ada gerakan?
};

// ---------- Modul 5: menyiapkan semua pin ----------
void siapkanPin() {
  pinMode(PIN_LED_STATUS, OUTPUT);
  // nanti di sini: relay lampu, relay kipas, pompa, servo tirai, tombol manual
}

// ---------- Modul 6-7: membaca sensor sungguhan ----------
BacaanSensor bacaSensor() {
  BacaanSensor b;
  b.suhu = 28.5;      // sementara angka contoh; Modul 6-7 menggantinya
  b.kelembapan = 71;  // dengan pembacaan sensor yang sebenarnya
  b.cahaya = 412;
  b.gerak = false;
  return b;
}

// ---------- Modul 7: menampilkan bacaan di layar OLED ----------
void tampilkanDiLayar(BacaanSensor b) {
  // belum diisi
}

// ---------- Modul 5 & 19: mengendalikan kipas, lampu, pompa ----------
void kendalikanAktuator(BacaanSensor b) {
  // belum diisi
}

// ---------- Modul 10-11: mengirim bacaan ke server ----------
void kirimData(BacaanSensor b) {
  // belum diisi
}

// ---------- Modul 8: kedip status sebagai "detak jantung" ----------
void kedipStatus() {
  digitalWrite(PIN_LED_STATUS, HIGH);
  delay(50);
  digitalWrite(PIN_LED_STATUS, LOW);
}

// Mencetak bacaan ke Serial Monitor (alat bantu kita sendiri).
void cetakBacaan(BacaanSensor b) {
  Serial.print("suhu=");
  Serial.print(b.suhu, 1);
  Serial.print(" kelembapan=");
  Serial.print(b.kelembapan);
  Serial.print(" cahaya=");
  Serial.print(b.cahaya);
  Serial.print(" gerak=");
  if (b.gerak) {
    Serial.println("ya");
  } else {
    Serial.println("tidak");
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.println("Node 1 Rumah - firmware " + VERSI_FIRMWARE);
  siapkanPin();
}

void loop() {
  BacaanSensor bacaan = bacaSensor();
  cetakBacaan(bacaan);
  tampilkanDiLayar(bacaan);
  kendalikanAktuator(bacaan);
  kirimData(bacaan);
  kedipStatus();
  delay(JEDA_BACA);
}
