// Modul 5 - Praktik 2.1: menghitung tekanan tombol TANPA debounce
// Tekan tombol di D13 satu kali, lalu lihat Serial Monitor.
// Sering kali satu tekanan terhitung lebih dari satu: itulah "pantulan" (bounce).

const int PIN_TOMBOL = 13;  // tombol manual (peta pin kanonik)

int keadaanLama = HIGH;  // keadaan tombol pada putaran loop() sebelumnya
int jumlahTekan = 0;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_TOMBOL, INPUT_PULLUP);
  Serial.println("Tekan tombol SATU kali, lalu lihat angkanya.");
}

void loop() {
  int keadaan = digitalRead(PIN_TOMBOL);
  if (keadaanLama == HIGH && keadaan == LOW) {  // baru saja berubah: dilepas -> ditekan
    jumlahTekan++;
    Serial.print("Tekanan ke-");
    Serial.println(jumlahTekan);
  }
  keadaanLama = keadaan;  // ingat untuk putaran berikutnya
}
