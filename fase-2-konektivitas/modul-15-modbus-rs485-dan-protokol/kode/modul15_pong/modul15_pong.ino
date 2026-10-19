// Modul 15 - Praktik 1, papan KEDUA: "pong".
// Mendengar terus. Setiap kali satu baris "ping N" lengkap tiba, papan ini bicara sebentar untuk membalas "pong N",
// lalu kembali mendengar. Arah bicara diatur dengan pin DE/RE: HIGH = bicara, LOW = dengar.
// Paket esp32 3.3.12; tidak butuh library tambahan.

const int PIN_RS485_RX = 16;    // RX2 <- RO modul MAX485, lewat pembagi tegangan 4,7 kΩ + 10 kΩ
const int PIN_RS485_TX = 17;    // TX2 -> DI modul MAX485
const int PIN_RS485_DE_RE = 4;  // D4 -> DE dan RE modul MAX485 yang disatukan

char baris[40];  // huruf yang sedang dikumpulkan sampai tanda akhir baris
int panjang = 0;

// Bicara sebentar, lalu kembali mendengar. Persis seperti tombol bicara walkie-talkie.
void kirimBaris(const char* teks) {
  digitalWrite(PIN_RS485_DE_RE, HIGH);  // tekan tombol bicara
  Serial2.print(teks);
  Serial2.flush();                      // tunggu sampai huruf terakhir benar-benar keluar ke kabel
  digitalWrite(PIN_RS485_DE_RE, LOW);   // lepas tombol bicara: kembali mendengar
  while (Serial2.available() > 0) {
    Serial2.read();  // buang sampah yang mungkin terbaca selama papan ini bicara
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  pinMode(PIN_RS485_DE_RE, OUTPUT);
  digitalWrite(PIN_RS485_DE_RE, LOW);  // mulai dengan mendengar
  Serial2.begin(9600, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);  // pin wajib ditulis (paket esp32 3.x)
  Serial.println();
  Serial.println("Papan kedua mendengarkan; setiap ping akan dibalas pong.");
}

void loop() {
  while (Serial2.available() > 0) {
    char huruf = Serial2.read();
    if (huruf == '\n') {
      baris[panjang] = '\0';
      if (strncmp(baris, "ping ", 5) == 0) {
        char balasan[48];
        snprintf(balasan, sizeof(balasan), "pong %s\n", baris + 5);  // nomornya sama dengan nomor ping
        kirimBaris(balasan);
        Serial.printf("dengar \"%s\" -> balas \"pong %s\"\n", baris, baris + 5);
      } else {
        Serial.printf("dengar sesuatu yang bukan ping: \"%s\"\n", baris);
      }
      panjang = 0;
    } else if (huruf != '\r' && panjang < (int)sizeof(baris) - 1) {
      baris[panjang] = huruf;
      panjang++;
    }
  }
}
