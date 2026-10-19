// Modul 15 - Kemenangan Cepat, papan NODE 1: si pendengar.
// Menampilkan setiap baris teks yang tiba lewat kabel RS-485. Papan ini "diam terus":
// DE/RE dibuat LOW sekali di setup(), jadi pemancar modul MAX485-nya tidak pernah menyala.
// Paket esp32 3.3.12; tidak butuh library tambahan.

const int PIN_RS485_RX = 16;    // RX2 <- RO modul MAX485, lewat pembagi tegangan 4,7 kΩ + 10 kΩ
const int PIN_RS485_TX = 17;    // TX2 -> DI modul MAX485; belum dipakai di sketsa ini
const int PIN_RS485_DE_RE = 4;  // D4 -> DE dan RE modul MAX485 yang disatukan

char baris[80];  // huruf yang sedang dikumpulkan sampai tanda akhir baris
int panjang = 0;
unsigned long waktuHurufTerakhir = 0;
unsigned long waktuCetakTerakhir = 0;

// Mencetak isi "baris". Kalau ada huruf yang tidak bisa dibaca, semua isinya dicetak sebagai angka heksadesimal.
void cetakBaris(bool utuh) {
  bool semuaTeks = utuh;
  for (int i = 0; i < panjang; i++) {
    uint8_t b = (uint8_t)baris[i];
    if (b < 32 || b > 126) {
      semuaTeks = false;
    }
  }
  baris[panjang] = '\0';
  if (semuaTeks) {
    Serial.printf("diterima: %s\n", baris);
  } else {
    Serial.print("diterima, tetapi bukan teks yang utuh:");
    for (int i = 0; i < panjang; i++) {
      Serial.printf(" %02X", (uint8_t)baris[i]);
    }
    Serial.println();
  }
  panjang = 0;
  waktuCetakTerakhir = millis();
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  pinMode(PIN_RS485_DE_RE, OUTPUT);
  digitalWrite(PIN_RS485_DE_RE, LOW);  // LOW = penerima modul menyala, pemancarnya mati: papan ini hanya mendengar
  // Pin WAJIB ditulis: tanpa pin, paket esp32 3.x memakai GPIO 4 dan 25 untuk Serial2, bukan 16 dan 17.
  Serial2.begin(9600, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);
  Serial.println();
  Serial.println("Papan Node 1 mendengarkan kabel RS-485 (9600 baud)...");
  waktuCetakTerakhir = millis();
}

void loop() {
  while (Serial2.available() > 0) {
    char huruf = Serial2.read();
    waktuHurufTerakhir = millis();
    if (huruf == '\n') {
      cetakBaris(true);  // satu baris lengkap
    } else if (huruf != '\r') {
      baris[panjang] = huruf;
      panjang++;
      if (panjang >= (int)sizeof(baris) - 1) {
        cetakBaris(false);  // terlalu panjang tanpa akhir baris: pasti bukan kiriman yang benar
      }
    }
  }
  if (panjang > 0 && millis() - waktuHurufTerakhir > 200) {
    cetakBaris(false);  // potongan tanpa akhir baris, lalu kabel diam
  }
  if (millis() - waktuCetakTerakhir > 3000) {
    Serial.println("... 3 detik tanpa kiriman. Periksa kabel A, B, GND, dan listrik kedua modul.");
    waktuCetakTerakhir = millis();
  }
}
