// Modul 8 - Kemenangan Cepat: LED berkedip dan tombol tetap didengar, tanpa delay()
// Rangkaian: LED status di D4 (lewat resistor 220 ohm) dan tombol di D13 (kaki seberangnya ke GND).
// Tekan tombol kapan saja: irama kedip LED langsung berganti, pelan <-> cepat.

const int PIN_LED_STATUS = 4;
const int PIN_TOMBOL = 13;
const unsigned long JEDA_PANTUL = 30;  // milidetik: bacaan tombol harus tenang selama ini (Modul 5)

unsigned long jedaKedip = 500;         // LED berganti nyala/padam setiap 500 ms (pelan)
unsigned long waktuKedipTerakhir = 0;  // kapan LED terakhir berganti
unsigned long waktuLaporTerakhir = 0;  // kapan Serial terakhir melapor
unsigned long waktuBacaanBerubah = 0;  // kapan bacaan tombol terakhir berubah
bool ledMenyala = false;
int bacaanTadi = HIGH;    // bacaan tombol di putaran sebelumnya; HIGH = dilepas (INPUT_PULLUP)
int tombolStabil = HIGH;  // keadaan tombol yang sudah dipercaya (bacaannya sudah tenang 30 ms)
int jumlahGanti = 0;    // berapa kali LED sudah berganti
int jumlahTekan = 0;    // berapa kali tombol sudah ditekan

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED_STATUS, OUTPUT);
  pinMode(PIN_TOMBOL, INPUT_PULLUP);
  Serial.println("Kemenangan Cepat Modul 8: LED berkedip, tombol selalu didengar.");
}

void loop() {
  unsigned long sekarang = millis();  // lirik "jam dinding" sekali di awal setiap putaran

  // Tugas 1: sudah waktunya LED berganti?
  if (sekarang - waktuKedipTerakhir >= jedaKedip) {
    waktuKedipTerakhir = sekarang;
    ledMenyala = !ledMenyala;
    digitalWrite(PIN_LED_STATUS, ledMenyala);  // true = HIGH (nyala), false = LOW (padam)
    jumlahGanti++;
  }

  // Tugas 2: apakah tombol baru saja ditekan? Diperiksa di SETIAP putaran.
  int bacaan = digitalRead(PIN_TOMBOL);
  if (bacaan != bacaanTadi) {      // bacaan berubah: ditekan, dilepas, memantul, atau derau
    bacaanTadi = bacaan;
    waktuBacaanBerubah = sekarang;  // mulai menghitung "tenang" dari nol lagi
  }
  if (bacaan != tombolStabil && sekarang - waktuBacaanBerubah >= JEDA_PANTUL) {
    tombolStabil = bacaan;          // sudah tenang 30 ms: perubahan ini sungguhan
    if (tombolStabil == LOW) {      // berubah dari dilepas menjadi ditekan
      jumlahTekan++;
      if (jedaKedip == 500) {
        jedaKedip = 100;
        Serial.println("Tombol ditekan! Irama kedip: CEPAT");
      } else {
        jedaKedip = 500;
        Serial.println("Tombol ditekan! Irama kedip: PELAN");
      }
    }
  }

  // Tugas 3: sudah waktunya melapor? (setiap 2 detik)
  if (sekarang - waktuLaporTerakhir >= 2000) {
    waktuLaporTerakhir = sekarang;
    Serial.print("Detik ke-");
    Serial.print(sekarang / 1000);
    Serial.print(": LED sudah berganti ");
    Serial.print(jumlahGanti);
    Serial.print(" kali, tombol sudah ditekan ");
    Serial.print(jumlahTekan);
    Serial.println(" kali.");
  }
}
