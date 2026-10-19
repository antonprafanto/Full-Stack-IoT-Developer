// sensor-tanah.chip.c - custom chip Wokwi untuk Modul 15: "modul MAX485 + sensor tanah RS-485" dalam satu chip.
// Sisi yang terlihat ESP32 sama dengan modul MAX485 sungguhan: RO (ke RX2), DI (dari TX2), DE_RE (DE+RE disatukan).
// Yang ditiru: protokol Modbus RTU (bingkai, CRC, jeda 3,5 karakter, alamat, loker, exception) dan arah DE/RE.
// Yang TIDAK ditiru: listrik RS-485 (kawat A/B, terminator, bias, panjang kabel). Itu hanya bisa dicoba di papan asli.
// Lembar datanya sama dengan sensor tiruan di papan kedua (Praktik 2): server 1, 9600 baud 8N1,
// loker 0 = kelembapan x10, 1 = suhu x10 (bertanda), 2 = EC, 3 = alamat server (holding saja, boleh ditulis).
#include "wokwi-api.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define BAUD 9600
#define JUMLAH_HOLDING 4  // loker 0-3, dibaca fungsi 03, ditulis fungsi 06
#define JUMLAH_INPUT 3    // loker 0-2, dibaca fungsi 04
#define UKURAN_RAK 256

typedef struct {
  pin_t ro;
  pin_t di;
  pin_t de_re;
  uart_dev_t uart;
  timer_t timer_t35;
  uint32_t attr_kelembapan;
  uint32_t attr_suhu;
  uint32_t attr_ec;
  uint8_t alamat;  // alamat server sekarang: 1 saat simulasi dimulai, boleh diganti lewat loker 3
  uint8_t rak[UKURAN_RAK];
  uint32_t panjang;
  uint8_t jawaban[UKURAN_RAK];
} chip_state_t;

static uint16_t crc16_modbus(const uint8_t *data, uint32_t len) {
  uint16_t crc = 0xFFFF;
  for (uint32_t i = 0; i < len; i++) {
    crc ^= data[i];
    for (int b = 0; b < 8; b++) {
      crc = (crc & 1) ? (uint16_t)((crc >> 1) ^ 0xA001) : (uint16_t)(crc >> 1);
    }
  }
  return crc;
}

static uint32_t tambah_crc(uint8_t *buf, uint32_t len) {
  uint16_t crc = crc16_modbus(buf, len);
  buf[len] = (uint8_t)(crc & 0xFF);  // byte rendah dulu
  buf[len + 1] = (uint8_t)(crc >> 8);
  return len + 2;
}

static int16_t skala10(float nilai) {
  return (int16_t)(nilai * 10.0f + (nilai >= 0 ? 0.5f : -0.5f));
}

// Isi loker sekarang (dari penggeser), sama dengan papan kedua.
static uint16_t isi_loker(chip_state_t *chip, uint16_t nomor) {
  if (nomor == 0) return (uint16_t)skala10(attr_read_float(chip->attr_kelembapan));
  if (nomor == 1) return (uint16_t)skala10(attr_read_float(chip->attr_suhu));
  if (nomor == 2) return (uint16_t)(attr_read_float(chip->attr_ec) + 0.5f);
  return chip->alamat;
}

static uint32_t exception(chip_state_t *chip, uint8_t fungsi, uint8_t kode) {
  chip->jawaban[0] = chip->alamat;
  chip->jawaban[1] = (uint8_t)(fungsi | 0x80);
  chip->jawaban[2] = kode;
  return 3;
}

// Satu bingkai lengkap sudah diterima (kabel diam >= 3,5 karakter): periksa dan jawab.
static void proses_bingkai(chip_state_t *chip) {
  uint32_t n = chip->panjang;
  chip->panjang = 0;
  if (n < 4 || crc16_modbus(chip->rak, n) != 0) {
    printf("Bingkai rusak atau CRC salah (%u byte): diam, seperti alat sungguhan.\n", (unsigned)n);
    return;
  }
  uint8_t tujuan = chip->rak[0];
  uint8_t fungsi = chip->rak[1];
  if (tujuan != chip->alamat && tujuan != 0) {
    return;  // untuk server lain: diam
  }
  uint16_t a = (uint16_t)((chip->rak[2] << 8) | chip->rak[3]);
  uint16_t b = (uint16_t)((chip->rak[4] << 8) | chip->rak[5]);
  uint32_t m = 0;
  if (fungsi == 0x03 || fungsi == 0x04) {
    if (tujuan == 0) return;  // siaran (alamat 0) tidak pernah dijawab
    uint16_t batas = (fungsi == 0x03) ? JUMLAH_HOLDING : JUMLAH_INPUT;
    if (n != 8 || b == 0 || b > 125) {
      m = exception(chip, fungsi, 0x03);  // ILLEGAL DATA VALUE
    } else if (b > batas || a > batas - b) {
      m = exception(chip, fungsi, 0x02);  // ILLEGAL DATA ADDRESS
    } else {
      chip->jawaban[m++] = chip->alamat;
      chip->jawaban[m++] = fungsi;
      chip->jawaban[m++] = (uint8_t)(b * 2);
      for (uint16_t i = a; i < a + b; i++) {
        uint16_t v = isi_loker(chip, i);
        chip->jawaban[m++] = (uint8_t)(v >> 8);  // byte tinggi dulu (big-endian)
        chip->jawaban[m++] = (uint8_t)(v & 0xFF);
      }
    }
  } else if (fungsi == 0x06) {
    if (n != 8 || a >= JUMLAH_HOLDING) {
      if (tujuan == 0) return;
      m = exception(chip, fungsi, n != 8 ? 0x03 : 0x02);
    } else {
      memcpy(chip->jawaban, chip->rak, 6);  // jawaban normal fungsi 06 = gema permintaan
      m = 6;
      if (a == 3 && b >= 1 && b <= 247) {
        chip->alamat = (uint8_t)b;
        printf("Alamat server diganti menjadi %u (simulasi baru = kembali ke 1).\n", (unsigned)b);
      } else if (a == 3) {
        printf("Alamat %u ditolak: harus 1 sampai 247.\n", (unsigned)b);
      } else {
        printf("Ada yang menulis loker %u: diabaikan, loker 0-2 hanya-baca.\n", (unsigned)a);
      }
      if (tujuan == 0) return;  // siaran: dikerjakan, tetapi tidak dijawab
    }
  } else {
    if (tujuan == 0) return;
    m = exception(chip, fungsi, 0x01);  // ILLEGAL FUNCTION
  }
  if (pin_read(chip->de_re) == HIGH) {
    printf("DE/RE ESP32 masih HIGH: penerimanya mati, jawaban ini akan hilang.\n");
    return;  // seperti modul sungguhan: penerima MAX485 ESP32 mati, jadi jawabannya tidak pernah sampai ke RX2
  }
  m = tambah_crc(chip->jawaban, m);
  if (!uart_write(chip->uart, chip->jawaban, m)) {
    printf("UART sibuk, jawaban dibuang.\n");
  }
}

static void on_t35(void *user_data) {
  proses_bingkai((chip_state_t *)user_data);
}

static void on_rx_data(void *user_data, uint8_t byte) {
  chip_state_t *chip = (chip_state_t *)user_data;
  if (pin_read(chip->de_re) == LOW) {
    return;  // pemancar MAX485 ESP32 mati (DE LOW): byte ini tidak pernah sampai ke kabel
  }
  if (chip->panjang < UKURAN_RAK) {
    chip->rak[chip->panjang++] = byte;
  }
  // Jeda 3,5 karakter pada 9600 baud: sekitar 4 ms (4010 us). Dimulai ulang setiap ada byte baru.
  timer_start(chip->timer_t35, 4010, false);
}

static void on_write_done(void *user_data) {
  (void)user_data;
}

void chip_init(void) {
  chip_state_t *chip = (chip_state_t *)calloc(1, sizeof(chip_state_t));
  chip->ro = pin_init("RO", INPUT_PULLUP);  // pola contoh resmi UART API: pin TX chip = INPUT_PULLUP
  chip->di = pin_init("DI", INPUT);
  chip->de_re = pin_init("DE_RE", INPUT_PULLDOWN);
  chip->attr_kelembapan = attr_init_float("kelembapan", 58.5f);
  chip->attr_suhu = attr_init_float("suhu", 25.3f);
  chip->attr_ec = attr_init_float("ec", 1200.0f);
  chip->alamat = 1;

  const timer_config_t timer_cfg = {
    .user_data = chip,
    .callback = on_t35,
  };
  chip->timer_t35 = timer_init(&timer_cfg);

  const uart_config_t uart_cfg = {
    .user_data = chip,
    .rx = chip->di,
    .tx = chip->ro,
    .baud_rate = BAUD,
    .rx_data = on_rx_data,
    .write_done = on_write_done,
  };
  chip->uart = uart_init(&uart_cfg);
  printf("Sensor tanah RS-485 tiruan siap: alamat 1, %u baud 8N1.\n", (unsigned)BAUD);
}
