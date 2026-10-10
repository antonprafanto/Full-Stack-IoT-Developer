// Modul 5 - Praktik 2.2: satu tekanan = satu kali berganti (dengan debounce)
// Setiap kali tombol di D13 ditekan, LED di D4 berganti: nyala -> padam -> nyala ...

const int PIN_TOMBOL = 13;   // tombol manual (peta pin kanonik)
const int PIN_LED = 4;       // LED status
const int JEDA_PANTUL = 30;  // milidetik: waktu tunggu sampai pantulan tombol reda

bool ledMenyala = false;
int jumlahTekan = 0;

// Menjawab true SATU kali untuk setiap tekanan sungguhan.
bool tombolDitekan() {
  if (digitalRead(PIN_TOMBOL) == HIGH) {  // tidak sedang ditekan
    return false;
  }
  delay(JEDA_PANTUL);                     // tunggu pantulan reda...
  if (digitalRead(PIN_TOMBOL) == HIGH) {  // ...ternyata sudah lepas lagi: cuma gangguan
    return false;
  }
  while (digitalRead(PIN_TOMBOL) == LOW) {  // tunggu sampai jari diangkat
    delay(1);
  }
  delay(JEDA_PANTUL);  // tombol juga memantul saat dilepas
  return true;
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_TOMBOL, INPUT_PULLUP);
  pinMode(PIN_LED, OUTPUT);
  Serial.println("Tekan tombol: LED berganti nyala/padam.");
}

void loop() {
  if (tombolDitekan()) {
    ledMenyala = !ledMenyala;  // dibalik: true menjadi false, false menjadi true
    jumlahTekan++;
    Serial.print("Tekanan ke-");
    Serial.print(jumlahTekan);
    if (ledMenyala) {
      digitalWrite(PIN_LED, HIGH);
      Serial.println(": LED NYALA");
    } else {
      digitalWrite(PIN_LED, LOW);
      Serial.println(": LED PADAM");
    }
  }
}
