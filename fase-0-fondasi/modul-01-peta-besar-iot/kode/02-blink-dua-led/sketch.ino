// Praktik 2: dua LED berkedip bergantian
// LED merah di D4, LED hijau di D18 (masing-masing lewat resistor 220 ohm)

const int PIN_LED_MERAH = 4;   // LED merah di pin D4
const int PIN_LED_HIJAU = 18;  // LED hijau di pin D18

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
