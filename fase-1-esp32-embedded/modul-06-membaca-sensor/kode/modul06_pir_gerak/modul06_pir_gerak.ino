// Modul 6 - Praktik 5: sensor gerak PIR HC-SR501
// Kaki OUT PIR ke D34. LED status di D4 menyala selama PIR melihat gerakan.
// PIR butuh "pemanasan" kira-kira 1 menit setelah mendapat listrik.

const int PIN_PIR = 34;          // D34: PIR (peta pin kanonik), hanya masukan
const int PIN_LED = 4;           // LED status
const int DETIK_PEMANASAN = 60;  // ubah menjadi 3 kalau mencoba di Wokwi

bool gerakSebelumnya = false;  // keadaan PIR pada putaran sebelumnya

void setup() {
  Serial.begin(115200);
  pinMode(PIN_PIR, INPUT);  // tanpa pull-up: PIR sendiri yang memberi HIGH atau LOW
  pinMode(PIN_LED, OUTPUT);
  Serial.print("Pemanasan PIR ");
  Serial.print(DETIK_PEMANASAN);
  Serial.println(" detik. Menjauhlah dari depan sensor...");
  for (int sisa = DETIK_PEMANASAN; sisa > 0; sisa--) {
    if (sisa % 10 == 0) {  // lapor setiap 10 detik
      Serial.print("  sisa ");
      Serial.print(sisa);
      Serial.println(" detik");
    }
    delay(1000);
  }
  Serial.println("PIR siap. Lambaikan tangan di depannya!");
}

void loop() {
  bool gerak = digitalRead(PIN_PIR) == HIGH;  // HIGH = ada gerakan
  if (gerak) {
    digitalWrite(PIN_LED, HIGH);
  } else {
    digitalWrite(PIN_LED, LOW);
  }

  // Cetak hanya saat keadaannya BERUBAH supaya Serial Monitor tidak banjir.
  if (gerak && !gerakSebelumnya) {
    Serial.println("Ada gerakan!");
  }
  if (!gerak && gerakSebelumnya) {
    Serial.println("Sepi lagi.");
  }
  gerakSebelumnya = gerak;
  delay(50);
}
