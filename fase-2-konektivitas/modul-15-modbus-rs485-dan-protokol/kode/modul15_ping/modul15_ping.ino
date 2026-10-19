// Modul 15 - Praktik 1, papan NODE 1: "ping".
// Setiap 2 detik bicara sebentar ("ping N"), lalu mendengar balasan "pong N" dari papan kedua,
// lewat SATU pasang kawat yang sama. Arah bicara diatur dengan pin DE/RE: HIGH = bicara, LOW = dengar.
// Paket esp32 3.3.12; tidak butuh library tambahan.

const int PIN_RS485_RX = 16;    // RX2 <- RO modul MAX485, lewat pembagi tegangan 4,7 kΩ + 10 kΩ
const int PIN_RS485_TX = 17;    // TX2 -> DI modul MAX485
const int PIN_RS485_DE_RE = 4;  // D4 -> DE dan RE modul MAX485 yang disatukan
const unsigned long JEDA_PING = 2000;     // satu ping setiap 2 detik
const unsigned long BATAS_TUNGGU = 500;   // balasan ditunggu paling lama 0,5 detik

unsigned long nomor = 0;

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
  Serial2.setTimeout(BATAS_TUNGGU);
  Serial.println();
  Serial.println("Papan Node 1 siap: ping setiap 2 detik.");
}

void loop() {
  nomor++;
  char teks[24];
  snprintf(teks, sizeof(teks), "ping %lu\n", nomor);
  while (Serial2.available() > 0) {
    Serial2.read();  // buang sisa huruf lama supaya balasan yang dibaca benar-benar balasan ping ini
  }
  unsigned long mulai = millis();
  kirimBaris(teks);
  String balasan = Serial2.readStringUntil('\n');  // menunggu paling lama BATAS_TUNGGU
  unsigned long lama = millis() - mulai;
  if (balasan.length() == 0) {
    Serial.printf("ping %lu -> tidak ada balasan dalam %lu ms\n", nomor, BATAS_TUNGGU);
  } else if (balasan.startsWith("pong ")) {
    Serial.printf("ping %lu -> %s (%lu ms pulang-pergi)\n", nomor, balasan.c_str(), lama);
  } else {
    Serial.printf("ping %lu -> balasan rusak (%u huruf)\n", nomor, balasan.length());
  }
  delay(JEDA_PING);
}
