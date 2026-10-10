// Modul 5 - Praktik 3: meredupkan LED dengan potensiometer
// Putar potensiometer di VN (GPIO 39): LED di D4 meredup dan menerang.
// PWM memakai ledcAttach + ledcWrite (cara paket esp32 versi 3).

const int PIN_POT = 39;          // VN: potensiometer (di Modul 6 menjadi sensor tanah)
const int PIN_LED = 4;           // LED status
const int FREKUENSI_PWM = 5000;  // 5.000 kedipan per detik: terlalu cepat untuk dilihat mata
const int RESOLUSI_PWM = 8;      // 8 bit: kecerahan 0 (padam) sampai 255 (penuh)

void setup() {
  Serial.begin(115200);
  ledcAttach(PIN_LED, FREKUENSI_PWM, RESOLUSI_PWM);  // D4 menjadi keluaran PWM (tidak perlu pinMode)
}

void loop() {
  int putaran = analogRead(PIN_POT);              // 0 (mentok kiri) sampai 4095 (mentok kanan)
  int kecerahan = map(putaran, 0, 4095, 0, 255);  // ubah ke skala 0-255
  ledcWrite(PIN_LED, kecerahan);
  Serial.print("potensiometer = ");
  Serial.print(putaran);
  Serial.print("   kecerahan = ");
  Serial.println(kecerahan);
  delay(200);
}
