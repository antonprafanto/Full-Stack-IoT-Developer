// Modul 8 - Praktik 1 (bagian B): obatnya, pola millis()
// Rangkaian sama: LED status di D4, tombol di D13.
// LED tetap berganti setiap 1 detik, tetapi tombol diperiksa ribuan kali per detik.

const int PIN_LED_STATUS = 4;
const int PIN_TOMBOL = 13;
const unsigned long JEDA_KEDIP = 1000;  // LED berganti setiap 1 detik, sama seperti versi delay()
const unsigned long JEDA_LAPOR = 2000;  // lapor setiap 2 detik
const unsigned long JEDA_PANTUL = 30;   // milidetik: bacaan tombol harus tenang selama ini

unsigned long waktuKedipTerakhir = 0;
unsigned long waktuLaporTerakhir = 0;
unsigned long waktuBacaanBerubah = 0;
bool ledMenyala = false;
int bacaanTadi = HIGH;
int tombolStabil = HIGH;
int jumlahTekan = 0;
unsigned long jumlahPutaran = 0;  // putaran loop() sejak laporan terakhir

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED_STATUS, OUTPUT);
  pinMode(PIN_TOMBOL, INPUT_PULLUP);
  Serial.println("Praktik 1B - versi millis(): tekan tombol 5 kali lagi.");
}

void loop() {
  unsigned long sekarang = millis();
  jumlahPutaran++;

  // Tugas 1: LED, dengan pola millis(): "sudah lewat 1 detik sejak terakhir berganti?"
  if (sekarang - waktuKedipTerakhir >= JEDA_KEDIP) {
    waktuKedipTerakhir = sekarang;
    ledMenyala = !ledMenyala;
    digitalWrite(PIN_LED_STATUS, ledMenyala);
  }

  // Tugas 2: tombol, diperiksa di setiap putaran
  int bacaan = digitalRead(PIN_TOMBOL);
  if (bacaan != bacaanTadi) {
    bacaanTadi = bacaan;
    waktuBacaanBerubah = sekarang;
  }
  if (bacaan != tombolStabil && sekarang - waktuBacaanBerubah >= JEDA_PANTUL) {
    tombolStabil = bacaan;
    if (tombolStabil == LOW) {
      jumlahTekan++;
      Serial.println("Tombol ditekan!");
    }
  }

  // Tugas 3: laporan setiap 2 detik, termasuk berapa kali loop() sempat berputar
  if (sekarang - waktuLaporTerakhir >= JEDA_LAPOR) {
    waktuLaporTerakhir = sekarang;
    Serial.print("Detik ke-");
    Serial.print(sekarang / 1000);
    Serial.print(": loop() berputar ");
    Serial.print(jumlahPutaran);
    Serial.print(" kali dalam 2 detik terakhir. Tombol tercatat: ");
    Serial.print(jumlahTekan);
    Serial.println(" kali.");
    jumlahPutaran = 0;
  }
}
