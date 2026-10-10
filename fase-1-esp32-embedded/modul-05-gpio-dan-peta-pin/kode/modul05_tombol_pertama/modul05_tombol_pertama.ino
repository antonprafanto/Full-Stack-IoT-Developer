// Modul 5 - Kemenangan Cepat: tombol pertamamu
// Selama tombol di D13 ditekan, LED di D4 menyala.
// Rangkaian: satu kaki tombol ke D13, kaki seberangnya ke GND. Tanpa resistor.

const int PIN_TOMBOL = 13;  // tombol manual (peta pin kanonik)
const int PIN_LED = 4;      // LED status, terpasang sejak Modul 2

void setup() {
  Serial.begin(115200);
  pinMode(PIN_TOMBOL, INPUT_PULLUP);  // masukan + pull-up internal: tidak ditekan = HIGH
  pinMode(PIN_LED, OUTPUT);
  Serial.println("Tekan tombolnya!");
}

void loop() {
  if (digitalRead(PIN_TOMBOL) == LOW) {  // LOW = tombol sedang ditekan
    digitalWrite(PIN_LED, HIGH);
  } else {
    digitalWrite(PIN_LED, LOW);
  }
}
