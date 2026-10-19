// Modul 15 - Praktik 2, papan KEDUA: "sensor tanah RS-485" tiruan (server Modbus RTU).
// Papan ini menjawab permintaan Modbus dari Node 1 lewat modul MAX485, persis seperti sensor tanah industri.
// Lembar datanya ada di README Modul 15 (Praktik 2): alamat server 1, 9600 baud 8N1, loker (register) 0-3.
// Bacaannya bisa diubah lewat Serial Monitor papan ini: kelembapan 62.5, suhu -5.0, ec 800, info.
// Library: ModbusRTUSlave versi 3.1.2 (ikut terpasang: ModbusADU versi 1.0.2, ModbusRTUComm versi 1.3.2,
// dan ModbusSlaveLogic versi 1.0.1). Paket esp32 3.3.12.

#include <ModbusRTUSlave.h>

const int PIN_RS485_RX = 16;    // RX2 <- RO modul MAX485, lewat pembagi tegangan 4,7 kΩ + 10 kΩ
const int PIN_RS485_TX = 17;    // TX2 -> DI modul MAX485
const int PIN_RS485_DE_RE = 4;  // D4 -> DE dan RE modul MAX485 yang disatukan
const int PIN_LED = 2;          // LED biru di papan: berkedip setiap kali papan ini menjawab
const unsigned long BAUD_RS485 = 9600;
const uint8_t ALAMAT_BAWAAN = 1;

ModbusRTUSlave server(Serial2, PIN_RS485_DE_RE);  // library ini sendiri yang menaikkan DE/RE saat menjawab

// "Loker" Modbus. Loker 0-2 berisi bacaan dan ada di dua lemari: holding register (dibaca dengan fungsi 03)
// dan input register (dibaca dengan fungsi 04). Loker holding 3 berisi alamat server dan boleh ditulis (fungsi 06).
uint16_t lokerHolding[4];
uint16_t lokerInput[3];

// Bacaan "sebenarnya" sensor tiruan ini, sudah dikalikan 10 seperti di lembar datanya.
int kelembapan10 = 585;  // 58,5 %
int suhu10 = 253;        // 25,3 °C (boleh negatif)
int ec = 1200;           // µS/cm, tanpa pengali
uint8_t alamat = ALAMAT_BAWAAN;

unsigned long jumlahJawaban = 0;
unsigned long waktuLedNyala = 0;
char baris[41];  // perintah dari Serial Monitor, paling panjang 40 huruf
int panjangBaris = 0;

// Menyalin bacaan sebenarnya ke loker. Suhu negatif disimpan sebagai komplemen dua: -5,0 °C = -50 = 0xFFCE.
void isiLoker() {
  lokerHolding[0] = lokerInput[0] = (uint16_t)kelembapan10;
  lokerHolding[1] = lokerInput[1] = (uint16_t)suhu10;
  lokerHolding[2] = lokerInput[2] = (uint16_t)ec;
  lokerHolding[3] = alamat;
}

// Dipanggil setelah setiap permintaan: loker 0-2 hanya-baca, loker 3 boleh berisi alamat baru 1-247.
void periksaTulisan() {
  uint16_t benar[3] = {(uint16_t)kelembapan10, (uint16_t)suhu10, (uint16_t)ec};
  for (int i = 0; i < 3; i++) {
    if (lokerHolding[i] != benar[i]) {
      Serial.printf("Ada yang menulis loker %d: diabaikan, loker 0-2 hanya-baca.\n", i);
    }
  }
  if (lokerHolding[3] != alamat) {
    if (lokerHolding[3] >= 1 && lokerHolding[3] <= 247) {
      alamat = lokerHolding[3];
      server.begin(alamat, BAUD_RS485);  // mulai sekarang hanya menjawab alamat baru
      Serial.printf("Alamat server diganti menjadi %u (setelah restart kembali ke %u).\n", alamat, ALAMAT_BAWAAN);
    } else {
      Serial.printf("Alamat %u ditolak: harus 1 sampai 247.\n", lokerHolding[3]);
    }
  }
  isiLoker();
}

void cetakInfo() {
  Serial.printf("info: alamat %u, kelembapan %.1f %%, suhu %.1f C, ec %d uS/cm, sudah menjawab %lu permintaan\n",
                alamat, kelembapan10 / 10.0, suhu10 / 10.0, ec, jumlahJawaban);
}

// Mengubah teks menjadi angka. Menjawab false kalau teksnya bukan angka (misalnya "abc").
bool bacaAngka(const char* teks, float& hasil) {
  char* akhir;
  hasil = strtof(teks, &akhir);
  return akhir != teks && *akhir == '\0';
}

void kerjakanPerintah() {
  float angka = 0;
  if (strcmp(baris, "info") == 0) {
    cetakInfo();
    return;
  }
  if (strncmp(baris, "kelembapan ", 11) == 0) {
    if (!bacaAngka(baris + 11, angka) || angka < 0 || angka > 100) {
      Serial.println("Butuh angka 0 sampai 100. Contoh: kelembapan 62.5");
      return;
    }
    kelembapan10 = lroundf(angka * 10);
  } else if (strncmp(baris, "suhu ", 5) == 0) {
    if (!bacaAngka(baris + 5, angka) || angka < -40 || angka > 80) {
      Serial.println("Butuh angka -40 sampai 80. Contoh: suhu -5.0");
      return;
    }
    suhu10 = lroundf(angka * 10);
  } else if (strncmp(baris, "ec ", 3) == 0) {
    if (!bacaAngka(baris + 3, angka) || angka < 0 || angka > 20000) {
      Serial.println("Butuh angka 0 sampai 20000. Contoh: ec 800");
      return;
    }
    ec = lroundf(angka);
  } else {
    Serial.println("Perintah tidak dikenal. Contoh: kelembapan 62.5 | suhu -5.0 | ec 800 | info");
    return;
  }
  isiLoker();  // bacaan baru langsung masuk loker
  cetakInfo();
}

// Mengumpulkan huruf dari Serial Monitor tanpa menunggu; satu baris lengkap langsung dikerjakan.
void periksaSerial() {
  while (Serial.available() > 0) {
    char huruf = Serial.read();
    if (huruf == '\n') {
      baris[panjangBaris] = '\0';
      panjangBaris = 0;
      kerjakanPerintah();
    } else if (huruf != '\r' && panjangBaris < 40) {
      baris[panjangBaris] = huruf;
      panjangBaris++;
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  pinMode(PIN_LED, OUTPUT);
  isiLoker();
  server.configureHoldingRegisters(lokerHolding, 4);
  server.configureInputRegisters(lokerInput, 3);
  // Urutannya penting: Serial2 dimulai dulu (pin wajib ditulis), baru server.begin().
  Serial2.begin(BAUD_RS485, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);
  server.begin(alamat, BAUD_RS485);
  Serial.println();
  Serial.println("Sensor tanah RS-485 tiruan siap (Modbus RTU, 9600 baud 8N1).");
  Serial.println("Loker 0 = kelembapan x10, 1 = suhu x10, 2 = EC, 3 = alamat server (boleh ditulis).");
  cetakInfo();
}

void loop() {
  if (server.poll()) {  // true = ada permintaan untuk alamat ini, dan sudah dijawab
    jumlahJawaban++;
    Serial.printf("[%lu] menjawab permintaan client\n", jumlahJawaban);
    digitalWrite(PIN_LED, HIGH);
    waktuLedNyala = millis();
    periksaTulisan();
  }
  if (digitalRead(PIN_LED) == HIGH && millis() - waktuLedNyala >= 50) {
    digitalWrite(PIN_LED, LOW);  // kedip singkat 50 ms
  }
  periksaSerial();
}
