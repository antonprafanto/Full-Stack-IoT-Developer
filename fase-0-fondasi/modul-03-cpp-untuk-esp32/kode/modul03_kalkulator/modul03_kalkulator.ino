// Modul 3 - Praktik 1: kalkulator Serial
// Ketik soal di Serial Monitor, misalnya 12 + 5, lalu tekan Enter.
// Operator yang dikenal: +  -  *  /   (spasi boleh ada, boleh tidak)

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.println("=== Kalkulator ESP32 ===");
  Serial.println("Ketik soal, misalnya 12 + 5, lalu tekan Enter.");
  Serial.println("Operator: +  -  *  /");
}

void loop() {
  if (Serial.available() > 0) {                  // ada ketikan yang masuk?
    String soal = Serial.readStringUntil('\n');  // ambil satu baris, misalnya "12 + 5"
    soal.replace(" ", "");                       // buang semua spasi: "12+5"
    soal.trim();                                 // buang sisa tanda Enter

    // Cari letak operatornya. Pencarian dimulai dari karakter kedua (posisi 1)
    // supaya tanda minus di depan angka pertama (misalnya -3*2) tidak dikira operator.
    char operasi = '*';
    int posisi = soal.indexOf('*', 1);
    if (posisi < 0) {
      operasi = '/';
      posisi = soal.indexOf('/', 1);
    }
    if (posisi < 0) {
      operasi = '+';
      posisi = soal.indexOf('+', 1);
    }
    if (posisi < 0) {
      operasi = '-';
      posisi = soal.indexOf('-', 1);
    }

    if (posisi < 0) {
      // indexOf() memberi -1 kalau yang dicari tidak ada
      Serial.println("Operator tidak ditemukan. Contoh yang benar: 12 + 5");
    } else {
      float angka1 = soal.substring(0, posisi).toFloat();   // bagian kiri operator
      float angka2 = soal.substring(posisi + 1).toFloat();  // bagian kanan operator

      if (operasi == '/' && angka2 == 0) {
        Serial.println("Tidak bisa membagi dengan nol!");
      } else {
        float hasil = 0;
        if (operasi == '+') {
          hasil = angka1 + angka2;
        } else if (operasi == '-') {
          hasil = angka1 - angka2;
        } else if (operasi == '*') {
          hasil = angka1 * angka2;
        } else {
          hasil = angka1 / angka2;
        }

        Serial.print(angka1);
        Serial.print(" ");
        Serial.print(operasi);
        Serial.print(" ");
        Serial.print(angka2);
        Serial.print(" = ");
        Serial.println(hasil);
      }
    }
  }
}
