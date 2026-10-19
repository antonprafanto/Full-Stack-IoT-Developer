// Modul 15 - Praktik 4, papan NODE 1: membaca "sensor tanah RS-485" dengan library ModbusMaster.
// Setiap 5 detik membaca loker 0-2, mengubahnya menjadi angka sebenarnya, dan menulis lama transaksinya.
// Perintah di Serial Monitor: fungsi 3 | fungsi 4 | server 2 | loker 3 | tulis 3 2
// Library: ModbusMaster versi 2.0.1 (Doc Walker). Paket esp32 3.3.12.

#include <ModbusMaster.h>

const int PIN_RS485_RX = 16;    // RX2 <- RO modul MAX485, lewat pembagi tegangan 4,7 kΩ + 10 kΩ
const int PIN_RS485_TX = 17;    // TX2 -> DI modul MAX485
const int PIN_RS485_DE_RE = 4;  // D4 -> DE dan RE modul MAX485 yang disatukan
const unsigned long JEDA_BACA = 5000;

ModbusMaster sensor;
uint8_t alamatServer = 1;  // alamat sensor yang ditanya (lembar data: bawaan 1)
uint8_t kodeFungsi = 3;    // 3 = baca holding register, 4 = baca input register
unsigned long waktuBacaTerakhir = 0;
char baris[41];
int panjangBaris = 0;

// Dipanggil ModbusMaster tepat sebelum mengirim permintaan.
void sebelumKirim() {
  digitalWrite(PIN_RS485_DE_RE, HIGH);  // tekan tombol bicara
}

// Dipanggil ModbusMaster setelah Serial2.flush(): byte terakhir permintaan sudah keluar.
void sesudahKirim() {
  digitalWrite(PIN_RS485_DE_RE, LOW);  // lepas tombol bicara: dengarkan jawaban
  while (Serial2.available() > 0) {
    Serial2.read();  // buang sampah yang mungkin terbaca selama papan ini bicara
  }
}

const char* artiHasil(uint8_t kode) {
  switch (kode) {
    case ModbusMaster::ku8MBSuccess: return "berhasil";
    case ModbusMaster::ku8MBIllegalFunction: return "exception 01: fungsi tidak dikenal server";
    case ModbusMaster::ku8MBIllegalDataAddress: return "exception 02: loker yang diminta tidak ada";
    case ModbusMaster::ku8MBIllegalDataValue: return "exception 03: isi permintaan tidak sah";
    case ModbusMaster::ku8MBSlaveDeviceFailure: return "exception 04: server gagal";
    case ModbusMaster::ku8MBInvalidSlaveID: return "alamat server di jawaban salah";
    case ModbusMaster::ku8MBInvalidFunction: return "kode fungsi di jawaban salah";
    case ModbusMaster::ku8MBResponseTimedOut: return "tidak ada jawaban (timeout)";
    case ModbusMaster::ku8MBInvalidCRC: return "CRC jawaban salah";
    default: return "kode lain";
  }
}

// Membaca loker 0-2 dengan fungsi yang sedang dipilih, lalu mencetak hasilnya.
void bacaSensor() {
  unsigned long mulai = millis();
  uint8_t hasil;
  if (kodeFungsi == 4) {
    hasil = sensor.readInputRegisters(0, 3);    // mulai loker 0, sebanyak 3
  } else {
    hasil = sensor.readHoldingRegisters(0, 3);  // mulai loker 0, sebanyak 3
  }
  unsigned long lama = millis() - mulai;
  if (hasil == ModbusMaster::ku8MBSuccess) {
    float kelembapan = sensor.getResponseBuffer(0) / 10.0;  // lembar data: x10
    float suhu = (int16_t)sensor.getResponseBuffer(1) / 10.0;  // x10 dan BERTANDA: suhu bisa di bawah nol
    uint16_t ec = sensor.getResponseBuffer(2);              // tanpa pengali
    Serial.printf("server %u, fungsi %02u: kelembapan %.1f %%, suhu %.1f C, EC %u uS/cm (%lu ms)\n", alamatServer,
                  kodeFungsi, kelembapan, suhu, ec, lama);
  } else {
    Serial.printf("server %u, fungsi %02u: GAGAL, kode 0x%02X = %s (%lu ms)\n", alamatServer, kodeFungsi, hasil,
                  artiHasil(hasil), lama);
  }
}

// Membaca satu loker saja dan mencetak isinya apa adanya.
void bacaSatuLoker(uint16_t nomor) {
  uint8_t hasil;
  if (kodeFungsi == 4) {
    hasil = sensor.readInputRegisters(nomor, 1);
  } else {
    hasil = sensor.readHoldingRegisters(nomor, 1);
  }
  if (hasil == ModbusMaster::ku8MBSuccess) {
    Serial.printf("loker %u (fungsi %02u) berisi %u\n", nomor, kodeFungsi, sensor.getResponseBuffer(0));
  } else {
    Serial.printf("loker %u (fungsi %02u): GAGAL, kode 0x%02X = %s\n", nomor, kodeFungsi, hasil, artiHasil(hasil));
  }
}

void tulisLoker(uint16_t nomor, uint16_t nilai) {
  uint8_t hasil = sensor.writeSingleRegister(nomor, nilai);  // fungsi 06
  Serial.printf("tulis loker %u = %u ke server %u: %s\n", nomor, nilai, alamatServer, artiHasil(hasil));
}

void kerjakanPerintah() {
  unsigned int a = 0;
  unsigned int b = 0;
  if (sscanf(baris, "fungsi %u", &a) == 1 && (a == 3 || a == 4)) {
    kodeFungsi = a;
    Serial.printf("Mulai sekarang memakai fungsi %02u.\n", kodeFungsi);
  } else if (sscanf(baris, "server %u", &a) == 1 && a >= 1 && a <= 247) {
    alamatServer = a;
    sensor.begin(alamatServer, Serial2);  // ganti alamat yang ditanya
    Serial.printf("Mulai sekarang bertanya ke server %u.\n", alamatServer);
  } else if (sscanf(baris, "loker %u", &a) == 1 && a <= 65535) {
    bacaSatuLoker(a);
  } else if (sscanf(baris, "tulis %u %u", &a, &b) == 2 && a <= 65535 && b <= 65535) {
    tulisLoker(a, b);
  } else {
    Serial.println("Perintah: fungsi 3 | fungsi 4 | server 2 | loker 3 | tulis 3 2");
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  pinMode(PIN_RS485_DE_RE, OUTPUT);
  digitalWrite(PIN_RS485_DE_RE, LOW);  // mulai dengan mendengar
  Serial2.begin(9600, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);  // pin wajib ditulis (paket esp32 3.x)
  sensor.begin(alamatServer, Serial2);
  sensor.preTransmission(sebelumKirim);
  sensor.postTransmission(sesudahKirim);
  Serial.println();
  Serial.println("Membaca sensor tanah RS-485 setiap 5 detik.");
}

void loop() {
  if (millis() - waktuBacaTerakhir >= JEDA_BACA) {
    waktuBacaTerakhir = millis();
    bacaSensor();
  }
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
