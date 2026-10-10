// Modul 3 - Praktik 3: fungsi buatan sendiri
// Rangkaian: LED merah di D4 (rangkaian Modul 2 atau diagram Wokwi lampu lalu lintas).

const int PIN_LED = 4;  // LED merah di D4

// Fungsi TANPA nilai balik (void): mengedipkan LED sebanyak berapaKali.
// berapaKali adalah parameter: "bahan" yang kita serahkan saat memanggil fungsi.
void nyalakanLED(int berapaKali) {
  for (int i = 1; i <= berapaKali; i++) {
    digitalWrite(PIN_LED, HIGH);
    delay(300);
    digitalWrite(PIN_LED, LOW);
    delay(300);
  }
}

// Fungsi DENGAN nilai balik (float): mengubah suhu Celsius ke Fahrenheit.
// Kata return mengirim hasilnya kembali ke tempat fungsi dipanggil.
float keFahrenheit(float celsius) {
  return celsius * 9.0 / 5.0 + 32.0;
}

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(PIN_LED, OUTPUT);
  Serial.println();

  Serial.println("Kedip 3 kali...");
  nyalakanLED(3);
  delay(1000);

  Serial.println("Kedip 5 kali...");
  nyalakanLED(5);

  float suhuKamar = 30.0;
  float hasil = keFahrenheit(suhuKamar);  // hasil berisi nilai yang di-return
  Serial.print(suhuKamar);
  Serial.print(" derajat C = ");
  Serial.print(hasil);
  Serial.println(" derajat F");
}

void loop() {
  // kosong: semua sudah dikerjakan sekali di setup()
}
