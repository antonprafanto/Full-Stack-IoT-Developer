// periksa-ota.cpp - isi modul periksa-ota. Daftar fungsinya ada di periksa-ota.h.
#include <stdio.h>
#include <string.h>
#include "versi.h"
#include "periksa-ota.h"

static bool angka(char h) {
  return h >= '0' && h <= '9';
}

static char hurufKecil(char h) {
  return (h >= 'A' && h <= 'Z') ? (char)(h - 'A' + 'a') : h;
}

// Membaca alamat IPv4 "a.b.c.d" (tepat empat bagian 0-255, tanpa apa pun di belakangnya).
static bool uraiIpv4(const char* teks, int bagian[4]) {
  int posisi = 0;
  for (int i = 0; i < 4; i++) {
    int nilai = 0;
    int banyak = 0;
    while (angka(teks[posisi]) && banyak < 4) {
      nilai = nilai * 10 + (teks[posisi] - '0');
      banyak++;
      posisi++;
    }
    if (banyak == 0 || banyak > 3 || nilai > 255) {
      return false;
    }
    bagian[i] = nilai;
    char pemisah = (i < 3) ? '.' : '\0';
    if (teks[posisi] != pemisah) {
      return false;
    }
    posisi++;
  }
  return true;
}

bool alamatIpRumah(const char* host) {
  int b[4];
  if (host == nullptr || !uraiIpv4(host, b)) {
    return false;
  }
  return b[0] == 10 || (b[0] == 172 && b[1] >= 16 && b[1] <= 31) || (b[0] == 192 && b[1] == 168);
}

void rapikanAlamat(const char* masuk, char* keluar, size_t ukuran) {
  if (ukuran == 0) {
    return;
  }
  keluar[0] = '\0';
  if (masuk == nullptr) {
    return;
  }
  while (*masuk == ' ' || *masuk == '\t') {
    masuk++;  // buang spasi di depan
  }
  size_t panjang = strlen(masuk);
  while (panjang > 0 && (masuk[panjang - 1] == ' ' || masuk[panjang - 1] == '\t' || masuk[panjang - 1] == '/')) {
    panjang--;  // buang spasi dan garis miring di belakang
  }
  if (panjang >= ukuran) {
    panjang = ukuran - 1;  // terpotong: pemeriksaan panjang sesudahnya akan menolaknya
  }
  for (size_t i = 0; i < panjang; i++) {
    keluar[i] = hurufKecil(masuk[i]);
  }
  keluar[panjang] = '\0';
}

// "http://" (7) atau "https://" (8) di awal teks; 0 kalau bukan keduanya. Huruf besar-kecil tidak dibedakan.
static size_t panjangSkema(const char* teks, bool* aman) {
  const char* awalan[2] = {"http://", "https://"};
  for (int i = 0; i < 2; i++) {
    size_t n = strlen(awalan[i]);
    size_t j = 0;
    while (j < n && teks[j] != '\0' && hurufKecil(teks[j]) == awalan[i][j]) {
      j++;
    }
    if (j == n) {
      *aman = (i == 1);
      return n;
    }
  }
  return 0;
}

// Menyalin bagian "host" dari "host:port" (tanpa port) ke "keluar" dan memeriksa port-nya. false = bentuk salah.
static bool pisahkanHost(const char* hostPort, size_t panjang, char* keluar, size_t ukuran) {
  size_t titikDua = panjang;
  for (size_t i = 0; i < panjang; i++) {
    if (hostPort[i] == ':') {
      titikDua = i;
      break;
    }
  }
  if (titikDua == 0 || titikDua >= ukuran) {
    return false;
  }
  memcpy(keluar, hostPort, titikDua);
  keluar[titikDua] = '\0';
  if (titikDua < panjang) {  // ada ":port": 1-5 angka, 1-65535
    long port = 0;
    size_t banyak = 0;
    for (size_t i = titikDua + 1; i < panjang; i++) {
      if (!angka(hostPort[i]) || banyak >= 5) {
        return false;
      }
      port = port * 10 + (hostPort[i] - '0');
      banyak++;
    }
    if (banyak == 0 || port < 1 || port > 65535) {
      return false;
    }
  }
  return true;
}

const char* periksaAlamatServer(const char* alamat) {
  const char* contoh = "Tulis alamat server tanpa / di akhir, misalnya http://192.168.1.10 atau https://iot.namaanda.my.id";
  if (alamat == nullptr || alamat[0] == '\0') {
    return contoh;
  }
  if (strlen(alamat) > (size_t)PANJANG_ALAMAT_SERVER_MAKS) {
    return "Alamat server paling panjang 64 huruf";
  }
  bool aman = false;
  size_t skema = panjangSkema(alamat, &aman);
  if (skema == 0) {
    return contoh;
  }
  const char* hostPort = alamat + skema;
  size_t panjang = strlen(hostPort);
  for (size_t i = 0; i < panjang; i++) {  // hanya huruf kecil, angka, titik, tanda -, dan : untuk port
    char h = hostPort[i];
    if (!((h >= 'a' && h <= 'z') || angka(h) || h == '.' || h == '-' || h == ':')) {
      return contoh;  // misalnya ada jalur (/), tanda @, spasi, atau huruf besar yang belum dirapikan
    }
  }
  char host[PANJANG_ALAMAT_SERVER_MAKS + 1];
  if (!pisahkanHost(hostPort, panjang, host, sizeof(host))) {
    return contoh;
  }
  if (!aman && !alamatIpRumah(host)) {
    return "http hanya untuk jaringan rumah (alamat IP 10.x, 172.16-31.x, 192.168.x): pakai https:// di internet";
  }
  return nullptr;
}

const char* periksaAlamatBroker(const char* alamat) {
  if (alamat == nullptr || strlen(alamat) > (size_t)PANJANG_ALAMAT_BROKER_MAKS || !alamatIpRumah(alamat)) {
    return "Alamat broker harus alamat IP jaringan rumah, misalnya 192.168.1.37 (tanpa http:// dan tanpa port)";
  }
  return nullptr;
}

const char* periksaKodeKlaim(const char* kode) {
  size_t panjang = (kode == nullptr) ? 0 : strlen(kode);
  if (panjang < 8 || panjang > 12) {
    return "kode klaim harus 8 huruf, misalnya 7K2M-QF9D";
  }
  for (size_t i = 0; i < panjang; i++) {
    char h = kode[i];
    if (!((h >= 'a' && h <= 'z') || (h >= 'A' && h <= 'Z') || angka(h) || h == '-' || h == ' ')) {
      return "kode klaim hanya berisi huruf, angka, dan tanda -, misalnya 7K2M-QF9D";
    }
  }
  return nullptr;
}

bool susunUrlFirmware(const char* server, const char* versi, char* keluar, size_t ukuran) {
  int n = snprintf(keluar, ukuran, "%s/fw/node-1/%s.bin", server, versi);
  return n > 0 && (size_t)n < ukuran;
}

static bool sha256Sah(const char* teks) {
  if (teks == nullptr || strlen(teks) != 64) {
    return false;
  }
  for (int i = 0; i < 64; i++) {
    if (!(angka(teks[i]) || (teks[i] >= 'a' && teks[i] <= 'f'))) {
      return false;  // kontrak 1.6: huruf KECIL, sama dengan keluaran sha256sum
    }
  }
  return true;
}

// Membandingkan dua teks tanpa membedakan huruf besar-kecil.
static bool samaTanpaHurufBesar(const char* a, const char* b) {
  while (*a != '\0' && *b != '\0') {
    if (hurufKecil(*a) != hurufKecil(*b)) {
      return false;
    }
    a++;
    b++;
  }
  return *a == *b;
}

const char* periksaUpdate(const IsiUpdate& isi, const KeadaanUpdate& keadaan, char* alasan, size_t ukuran) {
  if (keadaan.masaUji) {
    return "masih dalam masa uji 60 detik";  // kontrak aturan 13: firmware baru belum terbukti
  }
  if (keadaan.pembaruanBerjalan) {
    return "pembaruan lain sedang berjalan";
  }
  if (!versiSah(isi.versi)) {
    return "versi harus berbentuk x.y.z";
  }
  if (bandingkanVersi(isi.versi, keadaan.versiBerjalan) == 0) {
    snprintf(alasan, ukuran, "sudah memakai %s", keadaan.versiBerjalan);
    return alasan;
  }
  if (bandingkanVersi(isi.versi, VERSI_OTA_PERTAMA) < 0) {  // turun versi tetap boleh, asal tidak di bawah 1.7.0
    return "versi di bawah 1.7.0 tidak punya rollback: pasang lewat kabel";
  }
  if (!sha256Sah(isi.sha256)) {
    return "sha256 harus 64 heksadesimal huruf kecil";
  }
  uint32_t batas = keadaan.ruangRak < RAK_PROGRAM_KONTRAK ? keadaan.ruangRak : RAK_PROGRAM_KONTRAK;
  if (batas == 0) {
    return "tidak ada rak program cadangan: pakai skema Minimal SPIFFS (Modul 10)";
  }
  if (isi.ukuran < 1 || isi.ukuran > (long long)batas) {
    snprintf(alasan, ukuran, "ukuran harus 1-%lu byte", (unsigned long)batas);
    return alasan;
  }

  // url: skema, host, dan jalur. Pesan yang sama dengan simulator untuk setiap kesalahan.
  const char* url = isi.url;
  if (url == nullptr || url[0] == '\0') {
    return "url tidak sah";
  }
  bool aman = false;
  size_t skema = panjangSkema(url, &aman);
  const char* bentukUrl = "url harus http(s)://<alamat>/fw/node-1/<versi>.bin";
  if (skema == 0) {
    const char* titikDua = strchr(url, ':');
    return titikDua == nullptr || titikDua == url ? "url tidak sah" : bentukUrl;  // "abc" vs "ftp://..."
  }
  const char* hostPort = url + skema;
  size_t panjangHost = strcspn(hostPort, "/?#");
  if (panjangHost == 0) {
    return "url tidak sah";  // "http:///fw/...": tanpa nama server
  }
  const char* jalur = hostPort + panjangHost;
  size_t panjangJalur = strcspn(jalur, "?#");
  char jalurBenar[48];
  snprintf(jalurBenar, sizeof(jalurBenar), "/fw/node-1/%s.bin", isi.versi);
  if (strlen(url) > (size_t)PANJANG_URL_MAKS || panjangJalur != strlen(jalurBenar)
      || strncmp(jalur, jalurBenar, panjangJalur) != 0) {
    return bentukUrl;
  }

  // url WAJIB = <alamat server tersimpan>/fw/node-1/<versi>.bin. Unduhan membawa kunci perangkat (Basic device_id:kunci),
  // jadi Node 1 tidak pernah mengunduh dari server lain, siapa pun pengirim perintahnya (kontrak 1.6 bagian 7).
  if (keadaan.alamatServer == nullptr || keadaan.alamatServer[0] == '\0') {
    return "alamat server belum diisi (Serial: server <alamat>)";
  }
  char urlRumah[PANJANG_ALAMAT_SERVER_MAKS + 48];
  if (!susunUrlFirmware(keadaan.alamatServer, isi.versi, urlRumah, sizeof(urlRumah)) || !samaTanpaHurufBesar(url, urlRumah)) {
    return "url bukan server rumah ini";
  }
  char host[PANJANG_URL_MAKS + 1];
  if (!aman && (!pisahkanHost(hostPort, panjangHost, host, sizeof(host)) || !alamatIpRumah(host))) {
    return "http hanya untuk jaringan rumah";  // kunci tidak boleh terkirim polos ke internet
  }
  return nullptr;
}
