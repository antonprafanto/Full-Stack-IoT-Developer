// rs485.cpp - isi modul rs485 (Modul 15). Daftar fungsinya ada di rs485.h.
// Node 1 menjadi klien Modbus RTU (dulu disebut master): setiap 10 detik ia bertanya ke sensor tanah RS-485
// "loker 0 sampai 2 isinya apa?", lalu menyimpan jawabannya untuk telemetry berikutnya.
// Peta loker mengikuti lembar data sensor tiruan Modul 15 (Praktik 2). Sensor sungguhan punya peta sendiri:
// sesuaikan LOKER_AWAL, JUMLAH_LOKER, dan perbaruiRS485() dengan lembar datanya.
#include <Arduino.h>
#include <ModbusMaster.h>  // library ModbusMaster (Modul 15)
#include "konfigurasi.h"
#include "pencatat.h"
#include "pengaturan.h"
#include "rs485.h"

const int TIMEOUT_SEBELUM_LAMBAT = 3;  // 3 kali berturut-turut tanpa jawaban: sensor dibaca lebih jarang
const uint16_t LOKER_AWAL = 0;         // peta loker sensor tiruan: mulai dari loker 0 ...
const uint16_t JUMLAH_LOKER = 3;       // ... sebanyak 3 loker (kelembapan, suhu, EC)

static ModbusMaster sensor;
static bool serialSiap = false;  // Serial2 dan ModbusMaster sudah dimulai?
static bool sudahPernahBaca = false;
static bool bacaanSah = false;   // true kalau pembacaan terakhir berhasil
static float tanahRs485 = NAN;   // % kelembapan tanah: loker 0 dibagi 10
static float suhuTanah = NAN;    // °C: loker 1 dibagi 10, bertanda
static int ec = 0;               // µS/cm: loker 2
static unsigned long waktuBacaTerakhir = 0;
static unsigned long lamaTransaksi = 0;  // ms, pembacaan terakhir
static uint8_t kodeTerakhir = 0;
static int timeoutBeruntun = 0;
static unsigned long jumlahBerhasil = 0;
static unsigned long jumlahTimeout = 0;
static unsigned long jumlahGalatLain = 0;

// Dipanggil ModbusMaster tepat sebelum mengirim permintaan.
static void sebelumKirim() {
  digitalWrite(PIN_RS485_DE_RE, HIGH);  // tekan tombol bicara
}

// Dipanggil ModbusMaster setelah Serial2.flush(): byte terakhir permintaan sudah keluar.
static void sesudahKirim() {
  digitalWrite(PIN_RS485_DE_RE, LOW);  // lepas tombol bicara: dengarkan jawaban
  while (Serial2.available() > 0) {
    Serial2.read();  // buang sampah yang mungkin terbaca selama Node 1 bicara
  }
}

static const char* artiKode(uint8_t kode) {
  switch (kode) {
    case ModbusMaster::ku8MBSuccess: return "berhasil";
    case ModbusMaster::ku8MBIllegalFunction: return "exception 01: fungsi tidak dikenal sensor";
    case ModbusMaster::ku8MBIllegalDataAddress: return "exception 02: loker tidak ada";
    case ModbusMaster::ku8MBIllegalDataValue: return "exception 03: permintaan tidak sah";
    case ModbusMaster::ku8MBSlaveDeviceFailure: return "exception 04: sensor gagal";
    case ModbusMaster::ku8MBInvalidSlaveID: return "alamat di jawaban salah";
    case ModbusMaster::ku8MBInvalidFunction: return "kode fungsi di jawaban salah";
    case ModbusMaster::ku8MBResponseTimedOut: return "tidak ada jawaban (timeout)";
    case ModbusMaster::ku8MBInvalidCRC: return "CRC jawaban salah";
    default: return "kode lain";
  }
}

static void mulaiSerial() {
  if (serialSiap) {
    return;
  }
  // Pin WAJIB ditulis: tanpa pin, paket esp32 3.x memakai GPIO 4 dan 25 untuk Serial2 (di Node 1: DE/RE dan pompa).
  Serial2.begin(BAUD_RS485, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);
  sensor.begin(ALAMAT_SENSOR_RS485, Serial2);
  sensor.preTransmission(sebelumKirim);
  sensor.postTransmission(sesudahKirim);
  serialSiap = true;
}

void siapkanRS485() {
  pinMode(PIN_RS485_DE_RE, OUTPUT);
  digitalWrite(PIN_RS485_DE_RE, LOW);  // mendengar: modul MAX485 Node 1 tidak memegang kabel
  if (sensorRS485Dipakai()) {
    mulaiSerial();
    logInfo("Sensor RS-485 dipakai: server %u, %lu baud, dibaca setiap %lu detik", ALAMAT_SENSOR_RS485, BAUD_RS485,
            JEDA_BACA_RS485 / 1000);
  } else {
    logInfo("Sensor RS-485 tidak dipakai. Sudah terpasang? Ketik: rs485 on");
  }
}

// Satu transaksi Modbus: fungsi 03, mulai LOKER_AWAL sebanyak JUMLAH_LOKER. Kalau sensor diam, ModbusMaster menunggu
// sampai 2 detik.
static uint8_t bacaLoker() {
  unsigned long mulai = millis();
  uint8_t kode = sensor.readHoldingRegisters(LOKER_AWAL, JUMLAH_LOKER);
  bool rusak = kode == ModbusMaster::ku8MBInvalidSlaveID || kode == ModbusMaster::ku8MBInvalidFunction ||
               kode == ModbusMaster::ku8MBInvalidCRC;
  if (rusak && millis() - mulai < 100UL * 9600 / BAUD_RS485) {
    // Jawaban rusak di jalan (sering karena satu "byte hantu") dan datang cepat. ModbusMaster berhenti membaca begitu
    // alamat atau fungsi di jawaban salah, padahal sensor mungkin masih mengirim sisa jawabannya. Tunggu kabel diam
    // dulu (sisa jawaban ditambah jeda antarbingkai: kurang dari 20 ms pada 9600 baud, dua kalinya pada 4800 baud),
    // baru coba sekali lagi.
    delay(20UL * 9600 / BAUD_RS485);
    kode = sensor.readHoldingRegisters(LOKER_AWAL, JUMLAH_LOKER);
  }
  return kode;
}

static unsigned long jedaSekarang() {
  if (timeoutBeruntun >= TIMEOUT_SEBELUM_LAMBAT) {
    return JEDA_BACA_RS485_LAMBAT;  // sensor diam terus: jangan membuat loop() menunggu 2 detik setiap 10 detik
  }
  return JEDA_BACA_RS485;
}

void perbaruiRS485() {
  if (!sensorRS485Dipakai()) {
    return;
  }
  if (sudahPernahBaca && millis() - waktuBacaTerakhir < jedaSekarang()) {
    return;
  }
  sudahPernahBaca = true;
  unsigned long mulai = millis();
  uint8_t kode = bacaLoker();
  waktuBacaTerakhir = millis();
  lamaTransaksi = waktuBacaTerakhir - mulai;
  kodeTerakhir = kode;
  if (kode == ModbusMaster::ku8MBSuccess) {
    tanahRs485 = sensor.getResponseBuffer(0) / 10.0f;           // lembar data: x10
    suhuTanah = (int16_t)sensor.getResponseBuffer(1) / 10.0f;   // x10 dan bertanda: bisa di bawah nol
    ec = sensor.getResponseBuffer(2);                           // tanpa pengali
    bacaanSah = true;
    timeoutBeruntun = 0;
    jumlahBerhasil++;
    logInfo("RS-485: tanah_rs485=%.1f %%  suhu_tanah=%.1f C  ec=%d uS/cm  (%lu ms)", tanahRs485, suhuTanah, ec,
            lamaTransaksi);
    return;
  }
  bacaanSah = false;  // kontrak data: bacaan gagal ditulis null
  if (kode == ModbusMaster::ku8MBResponseTimedOut) {
    timeoutBeruntun++;
    jumlahTimeout++;
  } else {
    timeoutBeruntun = 0;  // ada jawaban, walaupun salah: sensornya hidup
    jumlahGalatLain++;
  }
  logError("RS-485 gagal: %s (kode 0x%02X, %lu ms)", artiKode(kode), kode, lamaTransaksi);
  if (timeoutBeruntun == TIMEOUT_SEBELUM_LAMBAT) {
    logError("Sensor RS-485 tidak menjawab %d kali berturut-turut: mulai sekarang dicoba setiap %lu detik.",
             TIMEOUT_SEBELUM_LAMBAT, JEDA_BACA_RS485_LAMBAT / 1000);
  }
}

void tulisKolomRS485(JsonDocument& dokumen) {
  if (!sensorRS485Dipakai()) {
    return;  // sensor tidak dipasang: kolomnya tidak ditulis sama sekali (kontrak data, aturan 9)
  }
  if (!bacaanSah) {
    dokumen["tanah_rs485"] = nullptr;  // bacaan gagal (atau belum ada) ditulis null
    dokumen["suhu_tanah"] = nullptr;
    dokumen["ec"] = nullptr;
    return;
  }
  dokumen["tanah_rs485"] = tanahRs485;  // sudah satu angka di belakang koma: isi loker dibagi 10
  dokumen["suhu_tanah"] = suhuTanah;
  dokumen["ec"] = ec;
}

void pakaiRS485(bool pakai) {
  simpanSensorRS485Dipakai(pakai);  // pengaturan.cpp: disimpan di NVS, tetap berlaku setelah restart
  bacaanSah = false;
  timeoutBeruntun = 0;
  sudahPernahBaca = false;  // kalau dinyalakan: baca secepatnya
  if (pakai) {
    mulaiSerial();
  }
}

void cetakInfoRS485() {
  if (!sensorRS485Dipakai()) {
    Serial.println("rs485: tidak dipakai, jadi kolomnya tidak ikut telemetry. Sensor sudah terpasang? Ketik: rs485 on");
    return;
  }
  Serial.printf("rs485: dipakai, server %u, %lu baud 8N1, dibaca setiap %lu detik\n", ALAMAT_SENSOR_RS485, BAUD_RS485,
                jedaSekarang() / 1000);
  if (!sudahPernahBaca) {
    Serial.println("rs485: belum pernah membaca");
  } else if (bacaanSah) {
    Serial.printf("rs485: bacaan terakhir tanah_rs485=%.1f %% suhu_tanah=%.1f C ec=%d uS/cm (%lu detik lalu, %lu ms)\n",
                  tanahRs485, suhuTanah, ec, (millis() - waktuBacaTerakhir) / 1000, lamaTransaksi);
  } else {
    Serial.printf("rs485: bacaan terakhir GAGAL: %s (kode 0x%02X, %lu detik lalu)\n", artiKode(kodeTerakhir),
                  kodeTerakhir, (millis() - waktuBacaTerakhir) / 1000);
  }
  Serial.printf("rs485: berhasil %lu, timeout %lu, galat lain %lu\n", jumlahBerhasil, jumlahTimeout, jumlahGalatLain);
}
