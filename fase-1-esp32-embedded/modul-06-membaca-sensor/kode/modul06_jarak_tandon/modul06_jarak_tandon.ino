// Modul 6 - Praktik 6: HC-SR04 sebagai pengukur level air tandon
// TRIG di D15. ECHO lewat pembagi tegangan (4,7 kiloohm + 10 kiloohm) ke D35.
// Sensor menghadap ke bawah, di atas tandon (wadah air pompa).

const int PIN_TRIG = 15;          // D15: HC-SR04 TRIG (peta pin kanonik)
const int PIN_ECHO = 35;          // D35: HC-SR04 ECHO, lewat pembagi tegangan
const float JARAK_KOSONG = 20.0;  // cm dari sensor ke dasar tandon (ukur sendiri)
const float JARAK_PENUH = 5.0;    // cm dari sensor ke permukaan air saat tandon penuh (ukur sendiri)

// Mengukur jarak satu kali, dalam cm. Menjawab -1 kalau gemanya tidak kembali.
float ukurJarakCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);  // perintah "berteriak": HIGH selama 10 mikrodetik
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long durasi = pulseIn(PIN_ECHO, HIGH, 30000);  // lama pulsa ECHO; tunggu paling lama 30 ms
  if (durasi == 0) {
    return -1;  // tidak ada gema: terlalu jauh, terhalang, atau kabel lepas
  }
  return durasi / 58.0;  // setiap 58 mikrodetik = 1 cm (bunyi pergi dan pulang)
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  digitalWrite(PIN_TRIG, LOW);
}

void loop() {
  delay(1000);  // ukur sekali setiap detik
  float jarak = ukurJarakCm();
  if (jarak < 0) {
    Serial.println("Tidak ada gema. Periksa kabel dan arah sensor.");
  } else {
    // Rumusnya sama dengan map(jarak, JARAK_KOSONG, JARAK_PENUH, 0, 100), tetapi untuk angka berkoma.
    int persen = (JARAK_KOSONG - jarak) * 100 / (JARAK_KOSONG - JARAK_PENUH);
    int levelAir = constrain(persen, 0, 100);
    Serial.print("jarak=");
    Serial.print(jarak, 1);
    Serial.print(" cm  level_air=");
    Serial.print(levelAir);
    Serial.println(" %");
  }
}
