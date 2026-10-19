// Modul 15 - Kemenangan Cepat, papan KEDUA (papan Node 2 yang dipinjam): si pengirim.
// Setiap detik mengirim satu baris teks lewat modul MAX485 ke kabel RS-485.
// Papan ini "bicara terus": DE/RE dibuat HIGH sekali di setup() dan tidak pernah diturunkan.
// Paket esp32 3.3.12; tidak butuh library tambahan.

const int PIN_RS485_RX = 16;    // RX2 <- RO modul MAX485 (lewat pembagi tegangan); belum dipakai di sketsa ini
const int PIN_RS485_TX = 17;    // TX2 -> DI modul MAX485
const int PIN_RS485_DE_RE = 4;  // D4 -> DE dan RE modul MAX485 yang disatukan

unsigned long nomor = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  pinMode(PIN_RS485_DE_RE, OUTPUT);
  digitalWrite(PIN_RS485_DE_RE, HIGH);  // HIGH = pemancar modul menyala: papan ini memegang kabel untuk bicara
  // Pin WAJIB ditulis: tanpa pin, paket esp32 3.x memakai GPIO 4 dan 25 untuk Serial2, bukan 16 dan 17.
  Serial2.begin(9600, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);
  Serial.println();
  Serial.println("Papan kedua siap mengirim lewat RS-485 (9600 baud).");
}

void loop() {
  nomor++;
  Serial2.printf("halo %lu dari papan kedua\n", nomor);  // ke kabel RS-485
  Serial.printf("terkirim: halo %lu\n", nomor);          // ke Serial Monitor papan ini
  delay(1000);
}
