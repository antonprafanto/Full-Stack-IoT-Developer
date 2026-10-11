// Modul 6 - Praktik 1: LDR dan pembagi tegangan
// Rangkaian: 3,3 V -> resistor 10 kiloohm -> titik tengah -> LDR -> GND.
// Titik tengah ke VP (GPIO 36). Makin terang, hambatan LDR makin kecil,
// tegangan titik tengah turun, dan angka mentahnya ikut turun.

const int PIN_LDR = 36;          // VP: LDR (peta pin kanonik)
const int AMBANG_GELAP = 1000;   // cahaya di bawah ini dianggap gelap (sesuaikan dengan ruanganmu)
const int AMBANG_TERANG = 2500;  // cahaya di atas ini dianggap terang

void setup() {
  Serial.begin(115200);
}

void loop() {
  int mentah = analogRead(PIN_LDR);      // 0 sampai 4095
  float tegangan = mentah * 3.3 / 4095;  // perkiraan kasar dengan "penggaris lurus" (Konsep 2)
  int cahaya = 4095 - mentah;            // dibalik: makin terang, makin besar

  Serial.print("mentah=");
  Serial.print(mentah);
  Serial.print("  tegangan~");
  Serial.print(tegangan, 2);  // 2 angka di belakang titik desimal
  Serial.print(" V  cahaya=");
  Serial.print(cahaya);
  if (cahaya < AMBANG_GELAP) {
    Serial.println("  (gelap)");
  } else if (cahaya < AMBANG_TERANG) {
    Serial.println("  (redup)");
  } else {
    Serial.println("  (terang)");
  }
  delay(500);
}
