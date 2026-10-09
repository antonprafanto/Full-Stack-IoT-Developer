// =====================================================================
//  Modul 1 — Tantangan: dua LED berkedip bergantian
//  Rangkaian: D4 → 220 Ω → LED merah → GND
//             D5 → 220 Ω → LED hijau → GND
//  Pakai diagram.json di folder yang sama ini.
// =====================================================================

const int PIN_LED_MERAH = 4;  // LED merah di pin D4
const int PIN_LED_HIJAU = 5;  // LED hijau di pin D5

void setup() {
  // Dua pin, dua kali pinMode. Setiap pin yang dipakai harus "didaftarkan".
  pinMode(PIN_LED_MERAH, OUTPUT);
  pinMode(PIN_LED_HIJAU, OUTPUT);
}

void loop() {
  // Merah nyala, hijau padam
  digitalWrite(PIN_LED_MERAH, HIGH);
  digitalWrite(PIN_LED_HIJAU, LOW);
  delay(500);

  // Merah padam, hijau nyala
  digitalWrite(PIN_LED_MERAH, LOW);
  digitalWrite(PIN_LED_HIJAU, HIGH);
  delay(500);
}
