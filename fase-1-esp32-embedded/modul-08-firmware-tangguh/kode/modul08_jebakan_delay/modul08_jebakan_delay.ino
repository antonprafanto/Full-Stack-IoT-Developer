// Modul 8 - Praktik 1 (bagian A): jebakan delay()
// Rangkaian sama dengan Kemenangan Cepat: LED status di D4, tombol di D13.
// LED berkedip dengan delay(). Tekan tombol 5 kali dengan tempo santai: berapa yang tercatat?

const int PIN_LED_STATUS = 4;
const int PIN_TOMBOL = 13;

int jumlahTekan = 0;
int jumlahPutaran = 0;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED_STATUS, OUTPUT);
  pinMode(PIN_TOMBOL, INPUT_PULLUP);
  Serial.println("Praktik 1A - versi delay(): tekan tombol 5 kali, lalu hitung yang tercatat.");
}

void loop() {
  jumlahPutaran++;

  digitalWrite(PIN_LED_STATUS, HIGH);
  delay(1000);  // ESP32 menunggu 1 detik tanpa melakukan apa pun
  digitalWrite(PIN_LED_STATUS, LOW);
  delay(1000);  // menunggu 1 detik lagi

  // Tombol hanya diperiksa di sini: sekali setiap 2 detik!
  if (digitalRead(PIN_TOMBOL) == LOW) {
    jumlahTekan++;
    Serial.println("Tombol terbaca ditekan!");
  }

  Serial.print("Putaran loop() ke-");
  Serial.print(jumlahPutaran);
  Serial.print(" selesai pada detik ke-");
  Serial.print(millis() / 1000);
  Serial.print(". Tombol tercatat: ");
  Serial.print(jumlahTekan);
  Serial.println(" kali.");
}
