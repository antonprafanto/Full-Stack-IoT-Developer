// Modul 5 - Praktik 5: menggerakkan servo SG90 lewat Serial Monitor
// Library: ESP32Servo versi 3.2.1 (pasang lewat Library Manager).
// Sinyal servo di D26; daya servo dari rel 5 V MB102 (bukan dari papan ESP32).

#include <ESP32Servo.h>

const int PIN_SERVO = 26;  // servo tirai (peta pin kanonik)

Servo tirai;  // satu "objek" servo yang kita beri nama tirai

void setup() {
  Serial.begin(115200);
  tirai.setPeriodHertz(50);            // servo mengharapkan 50 pulsa per detik
  tirai.attach(PIN_SERVO, 500, 2400);  // pulsa 0,5 ms = 0 derajat ... 2,4 ms = 180 derajat
  tirai.write(90);                     // mulai dari tengah
  Serial.println("Ketik sudut 0-180, lalu tekan Enter.");
}

void loop() {
  if (Serial.available() > 0) {
    String teks = Serial.readStringUntil('\n');  // ambil satu baris ketikan
    teks.trim();                                 // buang sisa tanda Enter
    int sudut = teks.toInt();                    // "120" menjadi 120 (yang bukan angka menjadi 0)
    if (sudut == 0 && teks != "0") {             // jadi 0, padahal yang diketik bukan "0"?
      Serial.println("Itu bukan angka. Ketik angka 0-180.");
      return;                                    // abaikan; tunggu ketikan berikutnya
    }
    sudut = constrain(sudut, 0, 180);            // jaga supaya tetap di antara 0 dan 180
    tirai.write(sudut);
    Serial.print("Servo ke ");
    Serial.print(sudut);
    Serial.println(" derajat");
  }
}
