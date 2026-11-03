// perintah.cpp - isi modul perintah. Daftar fungsinya ada di perintah.h.
// Jawaban perintah selalu dicetak dengan Serial, berapa pun tingkat log yang sedang berlaku.
#include <Arduino.h>
#include "konfigurasi.h"
#include "pencatat.h"
#include "sistem.h"
#include "pengaturan.h"
#include "sensor.h"
#include "aktuator.h"
#include "aturan.h"
#include "jaringan.h"
#include "jembatan.h"
#include "rs485.h"
#include "periksa-ota.h"  // Modul 28: rapikanAlamat(), periksaAlamatServer(), periksaAlamatBroker()
#include "pembaruan.h"    // Modul 28: perintah "ota" dan "restart"
#include "klaim.h"        // Modul 28: perintah "klaim"
#include "perintah.h"

// Modul 21: dari 40, supaya "kunci " + kunci 43 huruf muat. Modul 28: dari 80, supaya
// "klaim <kode> <alamat server 64 huruf> <alamat broker>" muat.
const int PANJANG_BARIS_MAKS = 128;
static char baris[PANJANG_BARIS_MAKS + 1];  // +1 untuk tanda akhir teks
static int panjangBaris = 0;
static bool barisTerpotong = false;  // Modul 21: baris lebih panjang dari wadahnya: jangan dipakai (kunci terpotong!)

// Mengumpulkan huruf dari Serial Monitor TANPA menunggu.
// Menjawab true sekali, saat satu baris sudah lengkap (diakhiri Enter); isinya ada di "baris".
static bool adaBarisBaru() {
  while (Serial.available() > 0) {
    char huruf = Serial.read();
    if (huruf == '\n') {
      baris[panjangBaris] = '\0';  // tanda akhir teks
      panjangBaris = 0;            // siap mengumpulkan baris berikutnya
      if (barisTerpotong) {
        barisTerpotong = false;
        Serial.printf("Baris lebih dari %d huruf: diabaikan.\n", PANJANG_BARIS_MAKS);
        return false;
      }
      return true;
    }
    if (huruf != '\r' && panjangBaris < PANJANG_BARIS_MAKS) {
      baris[panjangBaris] = huruf;
      panjangBaris++;
    } else if (huruf != '\r') {
      barisTerpotong = true;
    }
  }
  return false;
}

static void cetakStatus() {
  Serial.printf("status: lampu=%s kipas=%s pompa=%s tirai=%d\n", teksOnOff(lampuMenyala()),
                teksOnOff(kipasMenyala()), teksOnOff(pompaMenyala()), sudutTirai());
}

static void cetakInfo() {
  unsigned long detik = uptimeDetik();
  Serial.printf("info: firmware %s, menyala %02lu:%02lu:%02lu, restart terakhir %s, nyala ke-%lu\n",
                VERSI_FIRMWARE, detik / 3600, (detik / 60) % 60, detik % 60, alasanReset(), jumlahNyala());
  Serial.printf("info: memori bebas %lu byte, putaran loop() terlama %lu ms, watchdog %lu detik\n",
                ESP.getFreeHeap(), putaranTerlamaMs(), BATAS_WATCHDOG / 1000);
  Serial.printf("info: ambang tanah_siram %d %%, penyiraman %s, tingkat log %s\n", ambangTanahSiram(),
                keadaanPenyiraman(), namaTingkatLog(tingkatLog()));
}

static void cetakAmbang() {
  const char* asal = "angka bawaan";
  if (ambangDariNvs()) {
    asal = "dari NVS";
  }
  Serial.printf("ambang: tanah_siram = %d %% (%s)\n", ambangTanahSiram(), asal);
  asal = "angka bawaan";  // Modul 19: ambang kipas pengaman, dikirim server lewat config
  if (ambangSuhuKipasDariNvs()) {
    asal = "dari NVS";
  }
  Serial.printf("ambang: suhu_kipas_on = %.1f C (%s); kipas pengaman padam di bawah %.1f C\n", ambangSuhuKipas(), asal,
                ambangSuhuKipas() - SELISIH_KIPAS);
}

// Modul 21: keadaan kunci broker TANPA membuka isinya: hanya panjang dan 4 huruf terakhir (kalau kuncinya panjang).
static void cetakKunci() {
  const char* kunci = kunciBroker();
  size_t panjang = strlen(kunci);
  if (panjang == 0) {
    Serial.printf("kunci: BELUM ADA. Node 1 masuk sebagai %s tanpa kunci; broker yang sudah dikunci akan menolaknya.\n",
                  penggunaBroker());
    Serial.println("kunci: ketik kunci <isi> (salin dari pendaftaran perangkat), lalu Enter.");
    return;
  }
  if (panjang >= 16) {
    Serial.printf("kunci: tersimpan di NVS, %u huruf, berakhiran ...%s\n", (unsigned)panjang, kunci + panjang - 4);
  } else {
    Serial.printf("kunci: tersimpan di NVS, %u huruf\n", (unsigned)panjang);  // kunci pendek: ujungnya pun dirahasiakan
  }
}

// ---------- Modul 28: alamat server, alamat broker, dan kode klaim ----------
// Memecah baris menjadi kata-kata yang dipisah spasi. Menjawab banyaknya kata (lebih dari "maks" = maks + 1).
static int pecahKata(const String& teks, String kata[], int maks) {
  int banyak = 0;
  int i = 0;
  int n = teks.length();
  while (i < n) {
    while (i < n && teks[i] == ' ') {
      i++;
    }
    if (i >= n) {
      break;
    }
    int awal = i;
    while (i < n && teks[i] != ' ') {
      i++;
    }
    if (banyak == maks) {
      return maks + 1;  // terlalu banyak kata
    }
    kata[banyak] = teks.substring(awal, i);
    banyak++;
  }
  return banyak;
}

static bool aturAlamatServer(const String& teks) {
  char rapi[PANJANG_ALAMAT_SERVER_MAKS + 2];  // +2: alamat yang terlalu panjang tetap terdeteksi
  rapikanAlamat(teks.c_str(), rapi, sizeof(rapi));
  const char* salah = periksaAlamatServer(rapi);
  if (salah != nullptr) {
    Serial.printf("server: tidak disimpan. %s\n", salah);
    return false;
  }
  simpanAlamatServer(rapi);
  Serial.printf("server: %s (firmware hanya diunduh dari alamat ini: <alamat>/fw/node-1/<versi>.bin)\n",
                alamatServerTersimpan());
  return true;
}

static bool aturAlamatBroker(const String& teks) {
  char rapi[PANJANG_ALAMAT_SERVER_MAKS + 2];
  rapikanAlamat(teks.c_str(), rapi, sizeof(rapi));
  const char* salah = periksaAlamatBroker(rapi);
  if (salah != nullptr) {
    Serial.printf("broker: tidak disimpan. %s\n", salah);
    return false;
  }
  simpanAlamatBroker(rapi);
  gantiAlamatBroker();  // jaringan.cpp: sambung ulang sekarang ke alamat itu
  Serial.printf("broker: %s, pintu %u; Node 1 menyambung ke sana sekarang.\n", alamatBrokerTersimpan(), PORT_BROKER);
  return true;
}

// "klaim <kode> [alamat server] [alamat broker]": cara mendaftar tanpa portal (misalnya di Wokwi, atau papan yang
// sudah punya WiFi). Alamat yang ditulis disimpan dulu, baru kodenya dikirim.
static void kerjakanKlaim(const String& perintah) {
  String kata[4];
  int banyak = pecahKata(perintah, kata, 4);
  if (banyak < 2 || banyak > 4) {
    Serial.println("Contoh: klaim 7K2M-QF9D http://192.168.1.10 192.168.1.37 (alamat server dan broker boleh "
                   "dilewati; tulis kode dengan tanda -, tanpa spasi)");
    return;
  }
  if (banyak >= 3 && !aturAlamatServer(kata[2])) {
    return;
  }
  if (banyak == 4 && !aturAlamatBroker(kata[3])) {
    return;
  }
  const char* salah = mulaiKlaim(kata[1].c_str());
  if (salah != nullptr) {
    Serial.printf("klaim: %s\n", salah);
    return;
  }
  Serial.printf("klaim: kode diterima; dikirim ke %s begitu WiFi siap (hasilnya tampil di log).\n", alamatServerTersimpan());
}

// Menjawab true kalau teks BUKAN angka: toInt() memberi 0, padahal teksnya bukan "0" (cara Praktik 5 Modul 5).
static bool bukanAngka(String teks) {
  return teks.toInt() == 0 && teks != "0";
}

void periksaPerintahSerial() {
  if (!adaBarisBaru()) {
    return;  // belum ada baris lengkap: langsung kembali, tidak menunggu
  }
  String perintah = baris;  // perintah datang sesekali saja, jadi String aman dipakai di sini
  perintah.trim();
  String asli = perintah;   // Modul 21: huruf besar-kecil kunci broker harus tetap utuh
  perintah.toLowerCase();
  if (perintah.length() == 0) {
    return;
  }

  if (perintah == "lampu on") {
    aturLampu(true);
  } else if (perintah == "lampu off") {
    aturLampu(false);
  } else if (perintah == "kipas on") {
    aturKipas(true);
  } else if (perintah == "kipas off") {
    aturKipas(false);
  } else if (perintah.startsWith("pompa ")) {
    String angka = perintah.substring(6);  // teks sesudah "pompa "
    if (bukanAngka(angka)) {
      Serial.println("Butuh angka detik. Contoh: pompa 3");
      return;
    }
    nyalakanPompa(angka.toInt(), bacaanTerakhir().level_air);  // pengaman tandon memakai bacaan terbaru
  } else if (perintah.startsWith("tirai ")) {
    String angka = perintah.substring(6);  // teks sesudah "tirai "
    if (bukanAngka(angka)) {
      Serial.println("Butuh angka sudut. Contoh: tirai 90");
      return;
    }
    aturTirai(angka.toInt());
  } else if (perintah == "bunyi") {
    bunyikanBuzzer();
  } else if (perintah == "info") {
    cetakInfo();
    return;
  } else if (perintah == "ambang") {
    cetakAmbang();
    return;
  } else if (perintah == "ambang bawaan") {
    hapusAmbangTanahSiram();
    cetakAmbang();
    return;
  } else if (perintah.startsWith("ambang ")) {
    String angka = perintah.substring(7);  // teks sesudah "ambang "
    if (bukanAngka(angka) || !simpanAmbangTanahSiram(angka.toInt())) {
      Serial.println("Butuh angka 0-100. Contoh: ambang 35");
      return;
    }
    cetakAmbang();
    return;
  } else if (perintah == "log debug") {
    aturTingkatLog(TINGKAT_DEBUG);
    Serial.println("Tingkat log: DEBUG (semua pesan)");
    return;
  } else if (perintah == "log info") {
    aturTingkatLog(TINGKAT_INFO);
    Serial.println("Tingkat log: INFO (bawaan)");
    return;
  } else if (perintah == "log error") {
    aturTingkatLog(TINGKAT_ERROR);
    Serial.println("Tingkat log: ERROR (hanya masalah)");
    return;
  } else if (perintah == "wifi") {
    cetakInfoJaringan();  // Modul 10
    return;
  } else if (perintah == "wifi lupa") {
    lupakanWiFi();  // Modul 10: menghapus WiFi tersimpan, lalu restart ke portal
    return;
  } else if (perintah == "node2") {
    cetakInfoNode2();  // Modul 14: statistik paket Node 2
    return;
  } else if (perintah == "node2 nol") {
    nolkanHitunganNode2();  // Modul 14: hitungan mulai dari nol, misalnya tepat saat router dicabut
    cetakInfoNode2();
    return;
  } else if (perintah == "rs485") {
    cetakInfoRS485();  // Modul 15: sensor tanah RS-485
    return;
  } else if (perintah == "rs485 on") {
    pakaiRS485(true);  // Modul 15: mulai membaca sensor setiap 10 detik
    cetakInfoRS485();
    return;
  } else if (perintah == "rs485 off") {
    pakaiRS485(false);  // Modul 15: berhenti membaca; kolomnya hilang dari telemetry
    cetakInfoRS485();
    return;
  } else if (perintah == "kirim") {
    kirimSekarang();  // Modul 11: terbitkan telemetry sekarang juga lewat MQTT
    return;
  } else if (perintah == "uji offline") {
    mulaiUjiOffline();  // Modul 19: latihan broker hilang selama 3 menit
    return;
  } else if (perintah == "kunci") {
    cetakKunci();  // Modul 21: keadaan kunci broker, tanpa membuka isinya
    Serial.printf("kunci: nama pengguna broker %s, WiFi %s\n", penggunaBroker(), teksJaringan());
    return;
  } else if (perintah == "kunci hapus") {
    if (kunciBroker()[0] != '\0') {
      hapusKunciBroker();  // Modul 21: mulai sekarang Node 1 masuk tanpa kunci (broker berkunci menolaknya)
      gantiKunciBroker();
    }
    cetakKunci();
    return;
  } else if (perintah.startsWith("kunci ")) {
    String isi = asli.substring(6);  // dari baris ASLI: huruf besar-kecil kunci tetap
    isi.trim();
    if (isi == kunciBroker() && mqttSiap()) {
      Serial.println("kunci: sama dengan yang tersimpan dan sudah tersambung, tidak diubah.");
      return;
    }
    if (!simpanKunciBroker(isi.c_str())) {  // kunci yang sama tidak ditulis ulang ke NVS
      Serial.println("kunci: tidak disimpan. Hanya boleh huruf A-Z, a-z, angka 0-9, tanda - dan _, tanpa spasi, "
                     "paling panjang 64 huruf.");
      return;
    }
    gantiKunciBroker();  // Modul 21: langsung dicoba, tanpa menunggu jeda
    cetakKunci();
    Serial.printf("kunci: Node 1 mencoba masuk ke broker sebagai %s dengan kunci ini sekarang.\n", penggunaBroker());
    return;
  } else if (perintah == "ota") {
    cetakInfoOta();  // Modul 28: versi, rak program, masa uji, laporan pembaruan
    return;
  } else if (perintah == "server") {
    Serial.printf("server: %s\n", alamatServerTersimpan()[0] != '\0' ? alamatServerTersimpan()
                                                                    : "BELUM DIISI. Contoh: server http://192.168.1.10");
    return;
  } else if (perintah.startsWith("server ")) {
    aturAlamatServer(perintah.substring(7));  // Modul 28: disimpan di NVS
    return;
  } else if (perintah == "broker") {
    Serial.printf("broker: %s (%s), pintu %u\n", alamatBrokerTersimpan(),
                  alamatBrokerDariNvs() ? "dari NVS" : "dari konfigurasi.h", PORT_BROKER);
    return;
  } else if (perintah.startsWith("broker ")) {
    aturAlamatBroker(perintah.substring(7));  // Modul 28: disimpan di NVS, lalu sambung ulang
    return;
  } else if (perintah == "klaim") {
    cetakInfoKlaim();  // Modul 28
    return;
  } else if (perintah.startsWith("klaim ")) {
    kerjakanKlaim(perintah);  // Modul 28: daftar dengan kode klaim dari admin
    return;
  } else if (perintah == "restart") {
    restartSengaja("perintah Serial restart");  // Modul 28: offline-mode + putus rapi dulu, baru restart
  } else if (perintah != "status") {
    Serial.println("Perintah tidak dikenal. Contoh: lampu on, kipas off, pompa 3, tirai 90, bunyi, status,");
    Serial.println("info, ambang, ambang 35, ambang bawaan, log debug, log info, log error, wifi, wifi lupa,");
    Serial.println("kirim, node2, node2 nol, rs485, rs485 on, rs485 off, uji offline, kunci, kunci hapus,");
    Serial.println("ota, server, server <alamat>, broker, broker <ip>, klaim, klaim <kode> [server] [broker], restart");
    return;
  }
  cetakStatus();
}
