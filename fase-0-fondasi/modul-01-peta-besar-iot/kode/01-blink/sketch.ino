// Program pertama kita: LED berkedip (Blink)
// LED dipasang di pin D4 lewat resistor 220 ohm

const int PIN_LED = 4;  // nomor pin tempat LED dipasang

void setup() {
  // Dijalankan SEKALI saat ESP32 baru menyala
  pinMode(PIN_LED, OUTPUT);  // pin ini untuk keluaran
}

void loop() {
  // Diulang TERUS-MENERUS selama ESP32 menyala
  digitalWrite(PIN_LED, HIGH);  // HIGH = LED menyala
  delay(500);                   // tunggu 500 milidetik
  digitalWrite(PIN_LED, LOW);   // LOW  = LED padam
  delay(500);                   // tunggu 500 milidetik lagi
}
