// Modul 15 - Praktik 3, papan NODE 1: bingkai Modbus "dengan tangan".
// Ketik byte permintaan TANPA CRC di Serial Monitor, misalnya:  01 03 00 00 00 03
// Sketsa ini menghitung CRC, mengirim bingkainya lewat RS-485, lalu mencetak jawaban server byte demi byte.
// Tambahkan x di akhir baris untuk sengaja merusak CRC, misalnya:  01 03 00 00 00 03 x
// Paket esp32 3.3.12; tidak butuh library tambahan.

const int PIN_RS485_RX = 16;    // RX2 <- RO modul MAX485, lewat pembagi tegangan 4,7 kΩ + 10 kΩ
const int PIN_RS485_TX = 17;    // TX2 -> DI modul MAX485
const int PIN_RS485_DE_RE = 4;  // D4 -> DE dan RE modul MAX485 yang disatukan
const unsigned long BATAS_TUNGGU = 1000;  // jawaban ditunggu paling lama 1 detik
const unsigned long JEDA_SELESAI = 5;     // kabel diam lebih dari 5 ms setelah byte terakhir = jawaban selesai

char baris[100];  // perintah dari Serial Monitor
int panjangBaris = 0;

// CRC-16/MODBUS: mulai dari 0xFFFF, polinom 0xA001 (spesifikasi Modbus jalur serial, Lampiran B).
uint16_t hitungCrc(const uint8_t* data, size_t panjang) {
  uint16_t crc = 0xFFFF;
  for (size_t i = 0; i < panjang; i++) {
    crc ^= data[i];
    for (int bit = 0; bit < 8; bit++) {
      if (crc & 1) {
        crc = (crc >> 1) ^ 0xA001;
      } else {
        crc = crc >> 1;
      }
    }
  }
  return crc;
}

void cetakByte(const char* judul, const uint8_t* data, size_t panjang) {
  Serial.printf("%s (%u byte):", judul, (unsigned)panjang);
  for (size_t i = 0; i < panjang; i++) {
    Serial.printf(" %02X", data[i]);
  }
  Serial.println();
}

const char* namaException(uint8_t kode) {
  if (kode == 0x01) {
    return "ILLEGAL FUNCTION: kode fungsi tidak dikenal server";
  }
  if (kode == 0x02) {
    return "ILLEGAL DATA ADDRESS: loker yang diminta tidak ada";
  }
  if (kode == 0x03) {
    return "ILLEGAL DATA VALUE: isi permintaan tidak sah";
  }
  if (kode == 0x04) {
    return "SERVER DEVICE FAILURE: server gagal mengerjakannya";
  }
  return "kode lain";
}

// Menjelaskan jawaban server. "awal" = nomor loker pertama yang diminta (untuk fungsi 03 dan 04).
void jelaskanJawaban(const uint8_t* j, size_t n, uint16_t awal) {
  if (n < 4 || hitungCrc(j, n) != 0) {  // CRC atas seluruh bingkai, termasuk 2 byte CRC-nya: hasil 0 = utuh
    Serial.println("  CRC jawaban SALAH: bingkai ini rusak di jalan.");
    return;
  }
  Serial.println("  CRC jawaban cocok: bingkai utuh.");
  uint8_t fungsi = j[1];
  if (fungsi & 0x80) {
    Serial.printf("  Exception: fungsi %02X ditolak dengan kode %02X = %s\n", fungsi & 0x7F, j[2], namaException(j[2]));
  } else if (fungsi == 0x03 || fungsi == 0x04) {
    int jumlah = j[2] / 2;  // 2 byte per loker
    for (int i = 0; i < jumlah && 4 + 2 * i < (int)n - 2; i++) {
      uint16_t nilai = (j[3 + 2 * i] << 8) | j[4 + 2 * i];  // byte tinggi dulu (big-endian)
      Serial.printf("  loker %u: %02X %02X = %u", awal + i, j[3 + 2 * i], j[4 + 2 * i], nilai);
      if (nilai > 32767) {
        Serial.printf(" (kalau bertanda: %d)", (int16_t)nilai);
      }
      Serial.println();
    }
  } else if (fungsi == 0x06) {
    Serial.println("  Fungsi 06 berhasil: jawaban normalnya adalah gema (salinan persis) permintaan.");
  }
}

// Mengubah teks seperti "01 03 00 00 00 03 x" menjadi byte. Menjawab false kalau ada yang salah ketik.
bool bacaPermintaan(char* teks, uint8_t* bingkai, size_t& n, bool& rusak) {
  n = 0;
  rusak = false;
  char* potongan = strtok(teks, " ");
  while (potongan != nullptr) {
    if (strcmp(potongan, "x") == 0 || strcmp(potongan, "X") == 0) {
      rusak = true;
    } else {
      char* akhir;
      long nilai = strtol(potongan, &akhir, 16);
      if (*akhir != '\0' || strlen(potongan) > 2) {
        Serial.printf("\"%s\" bukan byte heksadesimal (00 sampai FF).\n", potongan);
        return false;
      }
      if (n >= 30) {
        Serial.println("Terlalu panjang: paling banyak 30 byte.");
        return false;
      }
      bingkai[n] = (uint8_t)nilai;
      n++;
    }
    potongan = strtok(nullptr, " ");
  }
  if (n < 2) {
    Serial.println("Paling sedikit 2 byte: alamat server dan kode fungsi. Contoh: 01 03 00 00 00 03");
    return false;
  }
  return true;
}

void kirimDanDengar() {
  uint8_t bingkai[32];
  size_t n = 0;
  bool rusak = false;
  if (!bacaPermintaan(baris, bingkai, n, rusak)) {
    return;
  }
  uint16_t awal = (n >= 4) ? (bingkai[2] << 8) | bingkai[3] : 0;
  uint16_t crc = hitungCrc(bingkai, n);
  if (rusak) {
    crc = crc ^ 0xFFFF;  // sengaja dirusak: semua bitnya dibalik
  }
  bingkai[n] = crc & 0xFF;  // byte RENDAH CRC dikirim dulu
  bingkai[n + 1] = crc >> 8;
  n = n + 2;

  while (Serial2.available() > 0) {
    Serial2.read();  // buang sisa lama
  }
  digitalWrite(PIN_RS485_DE_RE, HIGH);  // bicara
  Serial2.write(bingkai, n);
  Serial2.flush();                      // tunggu byte terakhir keluar
  digitalWrite(PIN_RS485_DE_RE, LOW);   // dengar
  while (Serial2.available() > 0) {
    Serial2.read();  // buang sampah yang mungkin terbaca selama papan ini bicara (Konsep 2)
  }
  if (rusak) {
    cetakByte("kirim, CRC sengaja dirusak", bingkai, n);
  } else {
    cetakByte("kirim", bingkai, n);
  }

  uint8_t jawaban[64];
  size_t m = 0;
  unsigned long mulai = millis();
  unsigned long waktuByteTerakhir = mulai;
  while (true) {
    if (Serial2.available() > 0) {
      uint8_t b = Serial2.read();
      if (m < sizeof(jawaban)) {
        jawaban[m] = b;
        m++;
      }
      waktuByteTerakhir = millis();
    } else if (m == 0 && millis() - mulai > BATAS_TUNGGU) {
      break;  // tidak ada satu byte pun
    } else if (m > 0 && millis() - waktuByteTerakhir > JEDA_SELESAI) {
      break;  // kabel diam: jawaban selesai
    }
  }
  if (m == 0) {
    Serial.printf("terima: tidak ada jawaban dalam %lu ms (timeout)\n", BATAS_TUNGGU);
    return;
  }
  Serial.printf("terima dalam %lu ms setelah permintaan selesai.\n", waktuByteTerakhir - mulai);
  cetakByte("terima", jawaban, m);
  jelaskanJawaban(jawaban, m, awal);
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  pinMode(PIN_RS485_DE_RE, OUTPUT);
  digitalWrite(PIN_RS485_DE_RE, LOW);  // mulai dengan mendengar
  Serial2.begin(9600, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);  // pin wajib ditulis (paket esp32 3.x)
  Serial.println();
  Serial.println("Ketik byte permintaan tanpa CRC, lalu Enter. Contoh: 01 03 00 00 00 03");
}

void loop() {
  while (Serial.available() > 0) {
    char huruf = Serial.read();
    if (huruf == '\n') {
      baris[panjangBaris] = '\0';
      panjangBaris = 0;
      Serial.printf("> %s\n", baris);
      kirimDanDengar();
    } else if (huruf != '\r' && panjangBaris < (int)sizeof(baris) - 1) {
      baris[panjangBaris] = huruf;
      panjangBaris++;
    }
  }
}
