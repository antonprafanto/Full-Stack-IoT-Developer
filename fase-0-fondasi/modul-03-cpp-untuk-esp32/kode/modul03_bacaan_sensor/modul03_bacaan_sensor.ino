// Modul 3 - Praktik 6: struct BacaanSensor
// Satu "formulir" berisi beberapa data sensor sekaligus. Nilainya masih palsu (acak);
// sensor sungguhan dipasang mulai Modul 6. Nama kolomnya sengaja sama dengan
// kontrak data proyek (Lampiran A Silabus): suhu, kelembapan, cahaya, gerak.

struct BacaanSensor {
  float suhu;      // derajat Celsius
  int kelembapan;  // persen
  int cahaya;      // 0-4095 (nanti dari sensor cahaya)
  bool gerak;      // true = ada gerakan (nanti dari sensor gerak PIR)
};

// Fungsi yang mengembalikan satu formulir lengkap berisi angka acak.
BacaanSensor bacaSensorPalsu() {
  BacaanSensor b;
  b.suhu = random(250, 330) / 10.0;  // 25.0 sampai 32.9
  b.kelembapan = random(55, 85);     // 55 sampai 84
  b.cahaya = random(0, 4096);        // 0 sampai 4095
  b.gerak = (random(0, 2) == 1);     // true atau false
  return b;
}

// Fungsi yang menerima satu formulir lalu mencetaknya rapi.
void cetakBacaan(BacaanSensor b) {
  Serial.print("suhu=");
  Serial.print(b.suhu, 1);
  Serial.print(" C  kelembapan=");
  Serial.print(b.kelembapan);
  Serial.print(" %  cahaya=");
  Serial.print(b.cahaya);
  Serial.print("  gerak=");
  if (b.gerak) {
    Serial.println("ya");
  } else {
    Serial.println("tidak");
  }
}

int nomorBacaan = 0;

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.println("Bacaan sensor (palsu) tiap 2 detik:");
}

void loop() {
  BacaanSensor bacaan = bacaSensorPalsu();  // isi formulir baru
  nomorBacaan = nomorBacaan + 1;
  Serial.print("#");
  Serial.print(nomorBacaan);
  Serial.print("  ");
  cetakBacaan(bacaan);
  delay(2000);
}
