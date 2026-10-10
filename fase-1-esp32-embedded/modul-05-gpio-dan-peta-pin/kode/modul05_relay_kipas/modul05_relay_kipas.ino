// Modul 5 - Praktik 6: tombol menyalakan dan mematikan kipas lewat relay
// Relay kipas di D33 (IN2 modul relay 2 kanal, aktif LOW). Tombol di D13.
// Kipas mendapat 5 V dari MB102 lewat kontak COM-NO relay.

const int PIN_TOMBOL = 13;       // tombol manual (peta pin kanonik)
const int PIN_RELAY_KIPAS = 33;  // relay kipas (peta pin kanonik)
const int JEDA_PANTUL = 30;      // milidetik

bool kipasMenyala = false;

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

// Modul relay kita "aktif LOW": LOW = relay menyambung (kipas jalan), HIGH = relay melepas.
void aturKipas(bool nyala) {
  if (nyala) {
    digitalWrite(PIN_RELAY_KIPAS, LOW);
  } else {
    digitalWrite(PIN_RELAY_KIPAS, HIGH);
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_TOMBOL, INPUT_PULLUP);
  pinMode(PIN_RELAY_KIPAS, OUTPUT);
  aturKipas(false);  // segera pastikan kipas mati
  Serial.println("Tekan tombol untuk menyalakan atau mematikan kipas.");
}

void loop() {
  if (tombolDitekan()) {
    kipasMenyala = !kipasMenyala;
    aturKipas(kipasMenyala);
    if (kipasMenyala) {
      Serial.println("Kipas NYALA");
    } else {
      Serial.println("Kipas MATI");
    }
  }
}
