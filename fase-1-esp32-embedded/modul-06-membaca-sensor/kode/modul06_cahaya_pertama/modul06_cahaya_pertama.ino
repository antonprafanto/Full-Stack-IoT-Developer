// Modul 6 - Kemenangan Cepat: membaca cahaya pertamamu
// Sensor cahaya (LDR) di VP (GPIO 36). Makin terang, makin KECIL angka mentahnya,
// jadi kita membaliknya: cahaya = 4095 - mentah (makin terang, makin besar).

const int PIN_LDR = 36;  // VP: LDR (peta pin kanonik)

void setup() {
  Serial.begin(115200);
  Serial.println("Sensor cahaya siap. Ubah terangnya, lalu lihat angkanya.");
}

void loop() {
  int mentah = analogRead(PIN_LDR);  // 0 sampai 4095
  int cahaya = 4095 - mentah;        // dibalik: makin terang, makin besar
  Serial.print("mentah = ");
  Serial.print(mentah);
  Serial.print("   cahaya = ");
  Serial.println(cahaya);
  delay(500);
}
