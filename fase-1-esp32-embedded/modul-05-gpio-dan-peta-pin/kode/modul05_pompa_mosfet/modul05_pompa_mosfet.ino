// Modul 5 - Praktik 7: pompa menyala 3 detik lewat MOSFET IRLZ44N
// Gerbang (G) MOSFET di D25 lewat resistor 220 ohm; resistor 10 kiloohm dari jalur gerbang ke GND.
// Pompa mendapat 5 V dari MB102. Dioda 1N4007 sejajar pompa, cincin perak di sisi 5 V.

const int PIN_TOMBOL = 13;    // tombol manual (peta pin kanonik)
const int PIN_POMPA = 25;     // gerbang MOSFET pompa (peta pin kanonik)
const int JEDA_PANTUL = 30;   // milidetik
const int LAMA_POMPA = 3000;  // milidetik: pompa menyala 3 detik

// Menjawab true SATU kali untuk setiap tekanan sungguhan (sama dengan Praktik 2.2).
bool tombolDitekan() {
  if (digitalRead(PIN_TOMBOL) == HIGH) {
    return false;
  }
  delay(JEDA_PANTUL);
  if (digitalRead(PIN_TOMBOL) == HIGH) {
    return false;
  }
  while (digitalRead(PIN_TOMBOL) == LOW) {
    delay(1);
  }
  delay(JEDA_PANTUL);
  return true;
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_TOMBOL, INPUT_PULLUP);
  pinMode(PIN_POMPA, OUTPUT);
  digitalWrite(PIN_POMPA, LOW);  // LOW = MOSFET memutus = pompa diam
  Serial.println("Tekan tombol: pompa menyala 3 detik.");
}

void loop() {
  if (tombolDitekan()) {
    Serial.println("Pompa menyala...");
    digitalWrite(PIN_POMPA, HIGH);  // HIGH = MOSFET menyambung = pompa jalan
    delay(LAMA_POMPA);
    digitalWrite(PIN_POMPA, LOW);
    Serial.println("Pompa berhenti.");
  }
}
