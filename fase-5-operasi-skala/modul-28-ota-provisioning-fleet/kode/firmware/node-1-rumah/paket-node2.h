// paket-node2.h - "formulir" paket ESP-NOW dari Node 2 "Kebun" ke Node 1 "Rumah" (Modul 14).
// File ini SAMA PERSIS di folder node-1-rumah dan node-2-kebun. Kalau susunannya diubah, ubah KEDUANYA
// dan naikkan PAKET_VERSI, supaya Node 1 menolak paket lama dengan pesan yang jelas.
// Kedua ujung adalah ESP32 (little-endian, kompiler sama), jadi struct boleh dikirim apa adanya.
#pragma once
#include <stdint.h>

const uint8_t PAKET_TANDA = 0x52;  // huruf 'R' (Rumah Pintar Mini): paket ESP-NOW milik orang lain langsung ditolak
const uint8_t PAKET_VERSI = 1;     // naikkan setiap kali susunan formulir berubah

// __attribute__((packed)) = tanpa celah antarkolom: ukurannya sama persis di pengirim dan penerima.
struct __attribute__((packed)) PaketNode2 {
  uint8_t tanda;       // selalu PAKET_TANDA
  uint8_t versi;       // selalu PAKET_VERSI
  uint8_t fw[3];       // versi firmware Node 2: mayor, minor, tambalan, misalnya {1, 0, 0}
  uint16_t sesi;       // angka acak baru setiap Node 2 menyala dari MATI (bukan dari tidur)
  uint32_t urutan;     // nomor paket: naik 1 setiap kali Node 2 bangun
  uint16_t jedaDetik;  // jadwal bangun Node 2 (misalnya 300); Node 1 memakainya untuk batas "offline"
  uint8_t percobaan;   // kiriman ke berapa dalam satu kali bangun (1 = langsung berhasil)
  float suhu;          // derajat Celsius dari BME280; NAN = gagal dibaca
  float kelembapan;    // persen dari BME280; NAN = gagal dibaca
  float tekanan;       // hPa dari BME280; NAN = gagal dibaca
  float suhuTanah;     // derajat Celsius dari DS18B20; NAN = gagal dibaca
  int8_t tanah;        // persen 0-100 dari sensor tanah ke-2; -1 = gagal dibaca
  uint16_t bateraiMv;  // tegangan baterai dalam milivolt; 0 = tidak diukur
};
static_assert(sizeof(PaketNode2) == 33, "Ukuran PaketNode2 berubah: samakan kedua file dan naikkan PAKET_VERSI");
