// periksa-ota.h - pemeriksaan isi perintah "update", alamat server, alamat broker, dan kode klaim (Modul 28).
// Semua fungsi di sini hanya MEMERIKSA teks dan angka: tidak menyentuh WiFi, MQTT, NVS, atau flash. Karena itu file ini
// tidak memakai apa pun dari Arduino dan bisa diuji di laptop (uji host). Aturannya mengikuti KONTRAK-DATA.md 1.6
// bagian 7 dan 10, dan urutan pemeriksaannya sama dengan simulator alat/simulator-perangkat.js (periksaUpdate).
#pragma once
#include <stddef.h>
#include <stdint.h>

const uint32_t RAK_PROGRAM_KONTRAK = 1966080;  // satu rak program skema Minimal SPIFFS (Modul 10): batas "ukuran" kontrak 1.6
const int PANJANG_ALAMAT_SERVER_MAKS = 64;    // kolom "Alamat server" di portal WiFi
const int PANJANG_ALAMAT_BROKER_MAKS = 40;    // kolom "Alamat broker" di portal WiFi
const int PANJANG_URL_MAKS = 200;             // kontrak 1.6: url paling panjang 200 huruf
// Versi pertama yang punya masa uji dan rollback. Versi di bawahnya ditolak lewat udara: firmware itu langsung disahkan inti
// Arduino tanpa masa uji, dan tidak bisa menerima perintah update lagi (hanya bisa diperbaiki lewat kabel).
const char VERSI_OTA_PERTAMA[] = "1.7.0";

// "192.168.1.10" (tanpa port) adalah alamat IPv4 jaringan rumah: 10.x.x.x, 172.16.x.x-172.31.x.x, atau 192.168.x.x.
bool alamatIpRumah(const char* host);

// Merapikan ketikan alamat: spasi di tepi dibuang, huruf besar menjadi kecil, garis miring di akhir dibuang.
void rapikanAlamat(const char* masuk, char* keluar, size_t ukuran);

// Alamat server yang boleh disimpan (sudah dirapikan): http://<IP rumah>[:port] atau https://<nama>[:port], tanpa jalur.
// Menjawab nullptr kalau sah, atau kalimat alasannya.
const char* periksaAlamatServer(const char* alamat);

// Alamat broker yang boleh disimpan: alamat IP jaringan rumah (kontrak data bagian 3: di rumah, broker = alamat IP, pintu 1883).
const char* periksaAlamatBroker(const char* alamat);

// Kode klaim dari admin (XXXX-XXXX). Hanya bentuknya yang diperiksa di sini; benar-salahnya diperiksa server.
const char* periksaKodeKlaim(const char* kode);

// <alamat server>/fw/node-1/<versi>.bin, satu-satunya alamat tempat Node 1 mau mengunduh firmware. false = tidak muat.
bool susunUrlFirmware(const char* server, const char* versi, char* keluar, size_t ukuran);

// Isi perintah "update" yang sudah dibaca dari JSON. nullptr = kolom itu tidak ada atau bukan teks.
struct IsiUpdate {
  const char* versi;
  const char* url;
  const char* sha256;
  long long ukuran;  // -1 kalau tidak ada atau bukan bilangan bulat
};

// Keadaan Node 1 saat perintah itu datang.
struct KeadaanUpdate {
  const char* versiBerjalan;  // VERSI_FIRMWARE
  const char* alamatServer;   // alamat server tersimpan (sudah dirapikan); "" kalau belum diisi
  uint32_t ruangRak;          // ESP.getFreeSketchSpace(): ukuran rak program sebelah, 0 kalau tidak ada
  bool masaUji;               // firmware yang berjalan masih harus membuktikan diri (60 detik)
  bool pembaruanBerjalan;     // pembaruan lain sudah diterima dan belum selesai
};

// Menjawab nullptr kalau perintah boleh dikerjakan (ack ok:true), atau alasan penolakannya (ack ok:false + pesan).
// Alasan yang memuat angka ditulis ke "alasan" (paling sedikit 48 huruf).
const char* periksaUpdate(const IsiUpdate& isi, const KeadaanUpdate& keadaan, char* alasan, size_t ukuran);
