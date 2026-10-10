// Modul 3 - Praktik 8: lampu lalu lintas 3 LED (CONTOH JAWABAN)
// Coba tulis versimu sendiri dulu; buka file ini hanya untuk mencocokkan.
// Rangkaian: merah di D4, hijau di D18, kuning di D19 (sama dengan Modul 1). Diagram Wokwi-nya
// ada di folder wokwi-lampu-lalu-lintas. Urutannya seperti di jalan raya Indonesia:
// merah -> hijau -> kuning -> merah.

const int PIN_MERAH = 4;    // LED merah  (tulisan D4 di papan)
const int PIN_HIJAU = 18;   // LED hijau  (D18)
const int PIN_KUNING = 19;  // LED kuning (D19)

const int LAMA_MERAH = 5000;   // milidetik
const int LAMA_HIJAU = 4000;
const int LAMA_KUNING = 2000;

// Satu fungsi untuk mengatur ketiga lampu sekaligus.
// true sama artinya dengan HIGH (menyala), false sama dengan LOW (padam).
void aturLampu(bool merah, bool kuning, bool hijau) {
  digitalWrite(PIN_MERAH, merah);
  digitalWrite(PIN_KUNING, kuning);
  digitalWrite(PIN_HIJAU, hijau);
}

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(PIN_MERAH, OUTPUT);
  pinMode(PIN_KUNING, OUTPUT);
  pinMode(PIN_HIJAU, OUTPUT);
  Serial.println();
  Serial.println("Lampu lalu lintas siap.");
}

void loop() {
  Serial.println("MERAH  - berhenti");
  aturLampu(true, false, false);
  delay(LAMA_MERAH);

  Serial.println("HIJAU  - silakan jalan");
  aturLampu(false, false, true);
  delay(LAMA_HIJAU);

  Serial.println("KUNING - hati-hati, sebentar lagi merah");
  aturLampu(false, true, false);
  delay(LAMA_KUNING);
}
