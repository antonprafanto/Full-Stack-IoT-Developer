// jaringan.cpp - isi modul jaringan. Daftar fungsinya ada di jaringan.h.
#include <Arduino.h>
#include <esp_mac.h>  // esp_read_mac(): alamat MAC langsung dari chip
#include <WiFi.h>
#include <WiFiManager.h>   // library WiFiManager: portal WiFi (Modul 10)
#include <PubSubClient.h>  // library PubSubClient3: MQTT (Modul 11)
#include <ArduinoJson.h>   // library ArduinoJson
#include <time.h>
#include "konfigurasi.h"
#include "pencatat.h"
#include "sistem.h"
#include "pengaturan.h"
#include "sensor.h"
#include "aktuator.h"
#include "layar.h"
#include "rs485.h"
#include "periksa-ota.h"  // Modul 28: rapikanAlamat(), periksaAlamatServer(), periksaAlamatBroker(), IsiUpdate
#include "pembaruan.h"    // Modul 28: perintah update, laporan ota di vitals, restart sengaja
#include "masa-uji.h"     // Modul 28: firmwareTerbukti(), dalamMasaUji()
#include "klaim.h"        // Modul 28: kode klaim dari portal WiFi
#include "jaringan.h"

#ifndef MQTT_QOS1  // hanya PubSubClient3 yang punya nama ini
#error "Yang terpakai PubSubClient lama (2.8). Hapus lewat Library Manager, lalu pasang PubSubClient3 versi 3.3.2."
#endif

// Modul 28: sandi portal WiFi (pilihan) di kunci.h, file yang tidak ikut ke GitHub (Modul 14, Praktik 8). Tulis di sana:
//   #define SANDI_PORTAL "sandi-8-sampai-63-huruf"
// lalu tulis sandi yang sama di label kotak Node 1. Tanpa baris itu, portal terbuka tanpa sandi seperti di Modul 10.
#if __has_include("kunci.h")
#include "kunci.h"
#endif
#ifndef SANDI_PORTAL
#define SANDI_PORTAL ""
#endif
static_assert(sizeof(SANDI_PORTAL) == 1 || (sizeof(SANDI_PORTAL) >= 9 && sizeof(SANDI_PORTAL) <= 64),
              "SANDI_PORTAL di kunci.h harus 8-63 huruf (aturan sandi WiFi WPA2), atau hapus barisnya");

const unsigned long BATAS_TANPA_PERCOBAAN = 60000;  // penjaga: 60 detik tanpa percobaan menyambung = suruh mencoba lagi
const unsigned long BATAS_TANPA_PERCOBAAN_UJI = 10000;  // Modul 28: selama masa uji firmware baru, setiap 10 detik
const unsigned long JEDA_COBA_MQTT = 5000;          // gagal menyambung ke broker? coba lagi 5 detik kemudian
const unsigned long JEDA_COBA_DITOLAK = 60000;      // Modul 21: broker MENOLAK kunci? coba lagi 60 detik kemudian
const unsigned long JEDA_SEGERA_MIN = 2000;         // kiriman segera paling sering setiap 2 detik
const unsigned long TUNDA_LAPORAN = 10000;          // Modul 19: laporan mode offline dikirim 10 detik sesudah tersambung
const char BROKER_WOKWI[] = "broker.emqx.io";      // Wokwi tidak bisa menjangkau laptopmu: pakai broker publik
const char BROKER_WOKWI_BERKUNCI[] = "test.mosquitto.org";  // Modul 21: pintu 1884 hanya untuk yang punya akun

static WiFiClient klienJaringan;          // sambungan TCP ke broker
static PubSubClient mqtt(klienJaringan);  // MQTT berjalan di atas sambungan itu
static char idPerangkat[13] = "";  // device_id: 12 digit heksadesimal + tanda akhir teks (Lampiran A)
static const char* alamatBroker = ALAMAT_BROKER;  // Modul 21: dipilih di siapkanJaringan(); Modul 28: dari NVS
static uint16_t portBroker = PORT_BROKER;
static const char* pengguna = idPerangkat;  // Modul 21: nama pengguna broker = device_id (kontrak data bagian 1)
static bool ditolakBroker = false;          // Modul 21: percobaan terakhir dijawab broker dengan kode 4 atau 5
static char topikTelemetry[40] = "";
static char topikStatus[40] = "";
static char topikVitals[40] = "";
static char topikCmd[40] = "";
static char topikAck[40] = "";

// ---------- Bendera dari fungsi peristiwa WiFi (Modul 10, Praktik 3) ----------
static volatile bool benderaDapatIp = false;
static volatile bool benderaPutus = false;
static volatile uint8_t alasanPutus = 0;
static volatile unsigned long waktuPeristiwaTerakhir = 0;  // millis() saat peristiwa WiFi terakhir

static bool punyaWiFi = false;  // ada WiFi tersimpan (atau Wokwi-GUEST) yang dituju?
static bool tersambung = false;
static bool layananSudahMulai = false;  // jam internet dimulai sekali saja
static bool jamSudahDilaporkan = false;
static unsigned long waktuPutus = 0;
static unsigned long waktuPenjagaTerakhir = 0;
static uint8_t kanalRouter = 0;  // Modul 14: channel router saat terakhir tersambung; ESP-NOW ikut channel ini

// ---------- MQTT (Modul 11) ----------
static bool mqttTersambung = false;
static bool sudahCobaMqtt = false;
static unsigned long waktuCobaMqttTerakhir = 0;
static int kodeGagalTerakhir = 0;  // supaya kegagalan yang sama tidak dicatat setiap 5 detik
static BacaanSensor bacaanKirim;
static bool adaBacaan = false;
static bool sudahPernahKirim = false;
static unsigned long waktuKirimTerakhir = 0;
static uint8_t keadaanTerakhir = 0;  // kejadian penting yang terakhir diketahui (lihat keadaanPenting())
static int tiraiTerakhir = 0;        // Modul 19: sudut tirai pada bacaan sebelumnya
static bool keadaanDikenal = false;
static const char* alasanSegera = nullptr;  // bukan nullptr = ada kejadian penting yang belum terkirim
static bool sudahKirimVitals = false;
static unsigned long waktuVitalsTerakhir = 0;
static unsigned long jumlahTerbit = 0;
static char idTerakhir[8][40];  // 8 id perintah terakhir yang sudah diterima (termasuk yang ditolak)
static int posisiId = 0;
static bool ditahan = false;  // Modul 28: berhenti sengaja (offline-mode): jangan menyambung lagi sampai diizinkan

// ---------- Modul 19: mode offline dan laporannya ----------
static unsigned long waktuTerakhirSiap = 0;  // millis() terakhir kali WiFi dan MQTT tersambung
static bool offline = false;                 // sedang mode offline?
static unsigned long waktuMasukOffline = 0;
static unsigned long waktuSelesaiOffline = 0;  // kapan mode offline terakhir selesai (laporan menunggu dari sini)
static uint16_t kipasLokal = 0;              // kipas dinyalakan pengaman selama mode offline ini
static bool laporanMenunggu = false;         // laporan mode offline belum ikut vitals
static unsigned long laporanDetik = 0;       // lama mode offline (detik) yang belum dilaporkan
static uint16_t laporanKipas = 0;            // jumlah kipas dinyalakan pengaman yang belum dilaporkan
static bool ujiOffline = false;              // perintah "uji offline" sedang berjalan?
static unsigned long waktuUjiOffline = 0;

// Dipanggil paket esp32 dari "petugas" WiFi, bukan dari loop(): cukup menaikkan bendera.
static void saatPeristiwaWiFi(arduino_event_id_t peristiwa, arduino_event_info_t info) {
  waktuPeristiwaTerakhir = millis();  // semua peristiwa dicatat waktunya untuk penjaga
  if (peristiwa == ARDUINO_EVENT_WIFI_STA_GOT_IP) {
    benderaDapatIp = true;
  } else if (peristiwa == ARDUINO_EVENT_WIFI_STA_DISCONNECTED
             && info.wifi_sta_disconnected.reason != WIFI_REASON_STA_LEAVING) {  // 36: jejak paket esp32 sendiri saat mencoba lagi
    alasanPutus = info.wifi_sta_disconnected.reason;
    benderaPutus = true;
  }
}

// Nama kode alasan putus dari paket esp32. Kode 209-212 belum diberi nama di sana.
static const char* namaAlasan(uint8_t kode) {
  const char* nama = WiFi.disconnectReasonName((wifi_err_reason_t)kode);
  if (nama[0] == '\0') {  // teks kosong: huruf pertamanya langsung tanda akhir teks
    return "lihat tabel Konsep 4 Modul 10";
  }
  return nama;
}

// Arti angka mqtt.state() (Modul 11, Konsep 10). Angka 1-5 adalah jawaban broker sendiri.
static const char* namaKeadaanMqtt(int kode) {
  switch (kode) {
    case -4: return "broker tidak menjawab tepat waktu";
    case -3: return "sambungan terputus";
    case -2: return "gagal tersambung ke broker";
    case -1: return "belum tersambung";
    case 0: return "tersambung";
    case 4: return "nama pengguna atau kunci ditolak";
    case 5: return "tidak diizinkan broker: kunci salah, kosong, atau dicabut";  // Modul 21: Mosquitto selalu menjawab 5
    default: return "ditolak broker";
  }
}

// ---------- Cap waktu (Modul 10, Praktik 5) ----------
bool buatTs(char* ts, size_t ukuran) {
  time_t sekarang = time(nullptr);
  struct tm utc;
  gmtime_r(&sekarang, &utc);
  if (utc.tm_year + 1900 < 2025) {
    return false;  // jam belum disetel dari internet: ESP32 masih mengira tahun 1970
  }
  strftime(ts, ukuran, "%Y-%m-%dT%H:%M:%SZ", &utc);
  return true;
}

// ---------- Portal WiFi (Modul 10, Praktik 4) ----------
// Modul 28: isi tiga kolom tambahan disimpan di sini, saat tombol Save portal ditekan. WiFiManager sendiri TIDAK
// menyimpan isi kolom tambahan; itu tugas kita. Kolom yang dikosongkan berarti "tidak diubah".
static void simpanIsiPortal(const char* kode, const char* server, const char* broker) {
  char rapi[PANJANG_ALAMAT_SERVER_MAKS + 2];  // +2: alamat yang terlalu panjang tetap terdeteksi
  if (server[0] != '\0') {
    rapikanAlamat(server, rapi, sizeof(rapi));
    const char* salah = periksaAlamatServer(rapi);
    if (salah != nullptr) {
      logError("Portal: alamat server TIDAK disimpan. %s", salah);
    } else {
      simpanAlamatServer(rapi);
    }
  }
  if (broker[0] != '\0') {
    rapikanAlamat(broker, rapi, sizeof(rapi));
    const char* salah = periksaAlamatBroker(rapi);
    if (salah != nullptr) {
      logError("Portal: alamat broker TIDAK disimpan. %s", salah);
    } else {
      simpanAlamatBroker(rapi);
    }
  }
  if (kode[0] != '\0') {
    const char* salah = mulaiKlaim(kode);  // klaim.cpp: dikirim begitu WiFi tersambung (loop())
    if (salah != nullptr) {
      logError("Portal: kode klaim tidak dipakai: %s", salah);
    }
  }
}

// Menunggu di sini boleh: dipanggil dari setup(), sebelum watchdog mengawasi loop().
static void bukaPortal() {
  logInfo("Portal WiFi terbuka selama %lu detik: sambungkan HP ke WiFi \"%s\", lalu buka http://192.168.4.1",
          BATAS_PORTAL, NAMA_PORTAL);
  if (SANDI_PORTAL[0] != '\0') {
    logInfo("Portal bersandi: sandinya ada di label kotak Node 1 (SANDI_PORTAL di kunci.h).");
  } else {
    logError("Portal TANPA sandi: siapa pun di dekat Node 1 bisa membuka 192.168.4.1, termasuk halaman /update. "
             "Isi SANDI_PORTAL di kunci.h (Modul 28).");
  }
  tampilkanPesan("PORTAL WIFI", "Sambungkan HP ke:", NAMA_PORTAL, "Buka 192.168.4.1");
  digitalWrite(PIN_LED_STATUS, HIGH);  // LED status menyala tetap selama portal terbuka

  delay(500);  // beri waktu radio WiFi selesai menyala sebelum berganti menjadi titik akses
  WiFiManager wm;
  wm.setDebugOutput(false);  // catatan WiFiManager sendiri tidak ikut dicetak
  wm.setTitle("Node 1 Rumah");
  std::vector<const char*> menu = { "wifi", "info", "exit" };  // halaman utama tanpa tombol Update
  wm.setMenu(menu);
  wm.setShowInfoUpdate(false);  // tombol Update di halaman Info juga disembunyikan
  // Alamat 192.168.4.1/update sendiri tetap ada: buka portal hanya saat kamu sendiri sedang mengisinya.
  wm.setConfigPortalTimeout(BATAS_PORTAL);  // menutup sendiri kalau tidak dipakai
  wm.setConnectTimeout(20);                 // mencoba WiFi yang baru diisi paling lama 20 detik

  // Modul 28: tiga kolom tambahan di halaman WiFi (menunya tanpa "param", jadi kolomnya ikut halaman WiFi):
  // (id, tulisan di atas kolom, isi awal, panjang paling banyak). Kolom harus tetap ada selama portal terbuka.
  WiFiManagerParameter kolomKode("kode_klaim", "Kode klaim dari /armada (boleh kosong)", "", 12);
  WiFiManagerParameter kolomServer("alamat_server", "Alamat server, misalnya http://192.168.1.10", alamatServerTersimpan(),
                                   PANJANG_ALAMAT_SERVER_MAKS);
  WiFiManagerParameter kolomBroker("alamat_broker", "Alamat broker (IP gerbang Pi)", alamatBrokerTersimpan(),
                                   PANJANG_ALAMAT_BROKER_MAKS);
  wm.addParameter(&kolomKode);
  wm.addParameter(&kolomServer);
  wm.addParameter(&kolomBroker);
  // [&] = fungsi kecil tanpa nama yang boleh memakai ketiga kolom di atas; dipanggil WiFiManager saat Save ditekan.
  wm.setSaveParamsCallback([&]() {
    simpanIsiPortal(kolomKode.getValue(), kolomServer.getValue(), kolomBroker.getValue());
  });
  // Modul 28: dengan sandi, HP harus memasukkan sandi itu untuk bergabung ke WiFi portal (nullptr = tanpa sandi).
  bool berhasil = wm.startConfigPortal(NAMA_PORTAL, SANDI_PORTAL[0] != '\0' ? SANDI_PORTAL : nullptr);

  digitalWrite(PIN_LED_STATUS, LOW);
  if (berhasil) {
    logInfo("Portal: WiFi \"%s\" tersimpan di NVS.", WiFi.SSID().c_str());
  } else {
    logError("Portal ditutup tanpa WiFi baru. Untuk membukanya lagi, tahan D13 sambil menekan EN.");
  }
  punyaWiFi = wm.getWiFiIsSaved();
}

// ---------- Perintah lewat MQTT (Modul 11, Praktik 6) ----------
static bool sudahDiterima(const char* id) {
  for (int i = 0; i < 8; i++) {
    if (strcmp(idTerakhir[i], id) == 0) {
      return true;
    }
  }
  return false;
}

static void ingatId(const char* id) {
  snprintf(idTerakhir[posisiId], sizeof(idTerakhir[posisiId]), "%s", id);
  posisiId = (posisiId + 1) % 8;  // yang paling lama ditimpa
}

// Keadaan keempat aktuator (Lampiran A): objek "state" di ack, dan mulai kontrak 1.3 (Modul 19) juga di telemetry.
static void tulisKeadaan(JsonDocument& dokumen) {
  JsonObject keadaan = dokumen["state"].to<JsonObject>();
  keadaan["kipas"] = kipasMenyala();
  keadaan["lampu"] = lampuMenyala();
  keadaan["pompa"] = pompaMenyala();
  keadaan["tirai"] = sudutTirai();
}

// Jawaban atas perintah (Lampiran A): id yang sama, ok, keadaan keempat aktuator, dan pesan kalau ditolak.
static void kirimAck(const char* id, bool ok, const char* pesan) {
  JsonDocument jawaban;
  jawaban["id"] = id;
  char ts[21];
  if (buatTs(ts, sizeof(ts))) {
    jawaban["ts"] = ts;
  } else {
    jawaban["ts"] = nullptr;  // jam belum disetel: tetap dijawab, tanpa cap waktu
  }
  jawaban["ok"] = ok;
  if (!ok) {
    jawaban["pesan"] = pesan;
  }
  tulisKeadaan(jawaban);
  char isi[256];
  size_t panjang = serializeJson(jawaban, isi, sizeof(isi));
  if (panjang >= sizeof(isi)) {
    logError("Ack terlalu panjang untuk wadah isi[]: tidak dikirim.");
    return;
  }
  mqtt.publish(topikAck, isi);
  logDebug("Isi ack: %s", isi);
}

// Satu perintah "set": menjawab nullptr kalau berhasil, atau alasan penolakannya.
static const char* kerjakanSet(JsonDocument& perintah) {
  const char* target = perintah["target"] | "";
  JsonVariant nilai = perintah["nilai"];
  if (strcmp(target, "lampu") == 0) {
    if (!nilai.is<bool>()) {
      return "nilai lampu harus true atau false";
    }
    aturLampu(nilai.as<bool>());
    return nullptr;
  }
  if (strcmp(target, "kipas") == 0) {
    if (!nilai.is<bool>()) {
      return "nilai kipas harus true atau false";
    }
    aturKipas(nilai.as<bool>());
    return nullptr;
  }
  if (strcmp(target, "pompa") == 0) {
    if (!nilai.is<int>() || nilai.as<int>() < 1 || nilai.as<int>() > 10) {
      return "nilai pompa harus 1-10 detik";
    }
    int levelAir = bacaanTerakhir().level_air;
    if (!nyalakanPompa(nilai.as<int>(), levelAir)) {  // pengaman tandon Modul 6 tetap berlaku
      return levelAir < 0 ? "pompa ditolak: air tandon tidak terbaca" : "pompa ditolak: air tandon kurang";
    }
    return nullptr;
  }
  if (strcmp(target, "tirai") == 0) {
    if (!nilai.is<int>() || nilai.as<int>() < 0 || nilai.as<int>() > 180) {
      return "nilai tirai harus 0-180 derajat";
    }
    aturTirai(nilai.as<int>());
    return nullptr;
  }
  return "target tidak dikenal";
}

// Modul 19: satu perintah "config". Semua ambang diperiksa dulu; baru kalau semuanya sah, ambang disimpan ke NVS
// (yang angkanya berubah saja). Menjawab nullptr kalau berhasil, atau alasan penolakannya.
// Modul 28 (kontrak 1.6): config boleh membawa "ambang", "jeda", atau keduanya. Semuanya diperiksa dulu, baru disimpan.
static const char* kerjakanConfig(JsonDocument& perintah) {
  static char alasan[48];  // static: isinya masih dibaca kirimAck() setelah fungsi ini selesai
  // Kunci yang ADA dihitung walaupun isinya null: {"jeda": null} = tipe salah (seluruh perintah ditolak, kontrak bagian 7),
  // bukan "tidak dikirim". isNull() tidak bisa membedakan keduanya, jadi nama kuncinya dicari satu per satu.
  bool adaAmbang = false;
  bool adaJeda = false;  // Modul 28
  for (JsonPair p : perintah.as<JsonObject>()) {
    adaAmbang = adaAmbang || strcmp(p.key().c_str(), "ambang") == 0;
    adaJeda = adaJeda || strcmp(p.key().c_str(), "jeda") == 0;
  }
  if (!adaAmbang && !adaJeda) {
    return "config harus berisi ambang atau jeda";
  }
  JsonObject ambang = perintah["ambang"].as<JsonObject>();
  if (adaAmbang) {
    if (ambang.isNull() || ambang.size() == 0) {
      return "ambang harus berisi suhu_kipas_on atau tanah_siram";
    }
    for (JsonPair p : ambang) {  // nama lain = salah ketik: tolak semuanya supaya tidak ada yang diam-diam terlewat
      const char* nama = p.key().c_str();
      if (strcmp(nama, "suhu_kipas_on") != 0 && strcmp(nama, "tanah_siram") != 0) {
        snprintf(alasan, sizeof(alasan), "ambang tidak dikenal: %s", nama);
        return alasan;
      }
    }
    JsonVariant suhu = ambang["suhu_kipas_on"];
    JsonVariant tanah = ambang["tanah_siram"];
    if (!suhu.isNull()
        && (!suhu.is<float>() || suhu.as<float>() < SUHU_KIPAS_MIN || suhu.as<float>() > SUHU_KIPAS_MAKS)) {
      return "suhu_kipas_on harus angka 15-45";
    }
    if (!tanah.isNull() && (!tanah.is<int>() || tanah.as<int>() < 0 || tanah.as<int>() > 100)) {
      return "tanah_siram harus bilangan bulat 0-100";
    }
  }
  // Modul 28: "jeda" hanya boleh berisi vitals_s (60-3600 detik). telemetry tetap 10 detik (kontrak aturan 3).
  JsonObject jeda = perintah["jeda"].as<JsonObject>();
  if (adaJeda) {
    if (jeda.isNull()) {
      return "jeda harus berisi vitals_s";
    }
    for (JsonPair p : jeda) {
      const char* nama = p.key().c_str();
      if (strcmp(nama, "vitals_s") != 0) {
        snprintf(alasan, sizeof(alasan), "jeda tidak dikenal: %s", nama);
        return alasan;
      }
    }
    JsonVariant vitals = jeda["vitals_s"];
    if (!vitals.is<int>() || vitals.as<int>() < (int)JEDA_VITALS_MIN_S || vitals.as<int>() > (int)JEDA_VITALS_MAKS_S) {
      return "vitals_s harus bilangan bulat 60-3600";
    }
  }
  // Semua sah: baru sekarang disimpan (yang angkanya berubah saja).
  if (adaAmbang) {
    JsonVariant suhu = ambang["suhu_kipas_on"];
    JsonVariant tanah = ambang["tanah_siram"];
    if (!suhu.isNull()) {
      simpanAmbangSuhuKipas(suhu.as<float>());
    }
    if (!tanah.isNull()) {
      simpanAmbangTanahSiram(tanah.as<int>());
    }
  }
  if (adaJeda) {
    int detik = jeda["vitals_s"].as<int>();
    if ((unsigned long)detik != jedaVitalsDetik()) {
      simpanJedaVitals(detik);
      waktuVitalsTerakhir = millis();  // jadwal baru dihitung dari sekarang (sama dengan simulator)
    }
  }
  return nullptr;
}

// Modul 28: satu perintah "update". Isinya diambil dari JSON, lalu diperiksa dan diterima di pembaruan.cpp.
// Kolom yang tidak ada atau salah tipe menjadi nullptr / -1, dan ditolak dengan alasan yang sama dengan simulator.
static const char* kerjakanUpdate(const char* id, JsonDocument& perintah) {
  IsiUpdate isi = {
    perintah["versi"].as<const char*>(),  // nullptr kalau tidak ada atau bukan teks
    perintah["url"].as<const char*>(),
    perintah["sha256"].as<const char*>(),
    perintah["ukuran"].is<long>() ? (long long)perintah["ukuran"].as<long>() : -1,  // pecahan, teks, tidak ada = -1
  };
  return terimaUpdate(id, isi);
}

// Dipanggil library di dalam mqtt.loop() setiap ada pesan di rpm/<device_id>/cmd.
// Urutannya: baca JSON, periksa, kerjakan, jawab. Perintah yang id-nya sudah pernah diterima diabaikan.
static void saatPesanMqtt(char* topik, byte* isi, unsigned int panjang) {
  if (panjang == 0) {  // Modul 19: pesan kosong = seseorang menghapus config retained dari broker, bukan perintah
    logDebug("Pesan cmd kosong (pesan retained dihapus): diabaikan.");
    return;
  }
  JsonDocument perintah;
  DeserializationError galat = deserializeJson(perintah, isi, panjang);  // isi tidak diakhiri tanda akhir teks
  if (galat) {
    logError("Perintah bukan JSON yang sah (%s): diabaikan.", galat.c_str());  // tanpa id: tidak bisa dijawab
    return;
  }
  const char* id = perintah["id"] | "";  // "" kalau id tidak ada atau bukan teks
  if (id[0] == 0) {
    logError("Perintah tanpa id: diabaikan.");
    return;
  }
  if (strlen(id) >= sizeof(idTerakhir[0])) {  // paling panjang 39 huruf: muat di pengingat id dan di ack
    logError("Perintah dengan id lebih dari 39 huruf: diabaikan.");
    return;
  }
  const char* aksi = perintah["aksi"] | "";
  if (sudahDiterima(id)) {
    if (strcmp(aksi, "config") == 0) {  // Modul 19: config retained datang lagi setiap kali menyambung: wajar
      logDebug("Config %s datang lagi (retained, sesudah menyambung): sudah dikerjakan.", id);
    } else {
      logInfo("Perintah %s sudah pernah diterima: diabaikan.", id);
    }
    return;
  }
  if (ditahan) {
    // Modul 28: Node 1 sedang berhenti sengaja (sebentar lagi putus). Perintahnya tidak dikerjakan, tetapi tetap dijawab
    // (kontrak aturan 4: setiap cmd dijawab), dan id-nya TIDAK diingat: config retained yang datang lagi sesudah
    // tersambung, atau perintah yang dikirim ulang, tetap dikerjakan nanti.
    const char* alasan = strcmp(aksi, "update") == 0 && pembaruanSedangBerjalan()
                             ? "pembaruan lain sedang berjalan"
                             : "Node 1 sedang berhenti sengaja: kirim lagi sesudah online";
    logInfo("Perintah %s datang saat Node 1 berhenti sengaja: ditolak (%s).", id, alasan);
    kirimAck(id, false, alasan);
    return;
  }
  ingatId(id);
  const char* pesan = "aksi tidak dikenal";
  if (strcmp(aksi, "set") == 0) {
    pesan = kerjakanSet(perintah);
  } else if (strcmp(aksi, "config") == 0) {
    pesan = kerjakanConfig(perintah);  // Modul 19
  } else if (strcmp(aksi, "update") == 0) {
    pesan = kerjakanUpdate(id, perintah);  // Modul 28: ok = DITERIMA; unduhannya dimulai di putaran loop() berikutnya
  }
  if (pesan == nullptr && strcmp(aksi, "update") == 0) {
    logInfo("Perintah %s: update ke %s diterima; pembaruan dimulai.", id, perintah["versi"] | "?");
  } else if (pesan == nullptr && strcmp(aksi, "config") == 0) {
    logInfo("Perintah %s: config dikerjakan.", id);
  } else if (pesan == nullptr) {
    logInfo("Perintah %s: %s %s dikerjakan.", id, aksi, perintah["target"] | "");
  } else {
    logError("Perintah %s ditolak: %s", id, pesan);
  }
  kirimAck(id, pesan == nullptr, pesan);
}

void siapkanJaringan() {
  WiFi.onEvent(saatPeristiwaWiFi);   // daftarkan SEBELUM mulai menyambung
  WiFi.setHostname(NAMA_PERANGKAT);  // nama di daftar perangkat router (Modul 10, Praktik 9)
  WiFi.setSleep(false);              // Modul 14: radio selalu mendengar ESP-NOW (dipasang SEBELUM WiFi.mode)
  WiFi.setAutoReconnect(false);      // Modul 14: saat router mati, paket esp32 tidak memindai terus-menerus;
                                     // yang mencoba lagi hanya penjaga 60 detik di jagaSambungan()
  WiFi.mode(WIFI_STA);               // wajib sebelum bertanya "sudah ada WiFi tersimpan?"

  uint8_t mac[6];
  esp_read_mac(mac, ESP_MAC_WIFI_STA);  // WiFi.macAddress() masih 00:00:... selama WiFi belum selesai menyala
  snprintf(idPerangkat, sizeof(idPerangkat), "%02x%02x%02x%02x%02x%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  snprintf(topikTelemetry, sizeof(topikTelemetry), "rpm/%s/telemetry", idPerangkat);
  snprintf(topikStatus, sizeof(topikStatus), "rpm/%s/status", idPerangkat);
  snprintf(topikVitals, sizeof(topikVitals), "rpm/%s/vitals", idPerangkat);
  snprintf(topikCmd, sizeof(topikCmd), "rpm/%s/cmd", idPerangkat);
  snprintf(topikAck, sizeof(topikAck), "rpm/%s/ack", idPerangkat);
  logInfo("device_id %s", idPerangkat);

  klienJaringan.setConnectionTimeout(1000);  // menyambung TCP ke broker paling lama 1 detik (bawaan: 3 detik)
  mqtt.setSocketTimeout(1);  // menunggu jawaban broker paling lama 1 detik (bawaan: 15 detik)
  if (!mqtt.setBufferSize(512)) {  // ruang pesan 512 byte (bawaan: 256)
    logError("Memori tidak cukup untuk ruang pesan MQTT 512 byte.");
  }
  mqtt.setCallback(saatPesanMqtt);

  if (PAKAI_WOKWI) {
    logInfo("Mode Wokwi: menyambung ke Wokwi-GUEST tanpa portal, broker publik %s:%u.",
            WOKWI_BERKUNCI ? BROKER_WOKWI_BERKUNCI : BROKER_WOKWI, WOKWI_BERKUNCI ? 1884 : PORT_BROKER);
    WiFi.begin("Wokwi-GUEST", "", 6);  // 6 = kanal Wokwi-GUEST supaya lebih cepat
    punyaWiFi = true;
  } else {
    WiFiManager wm;
    punyaWiFi = wm.getWiFiIsSaved();
    bool mintaPortal = digitalRead(PIN_TOMBOL) == LOW || !punyaWiFi;
    if (mintaPortal && dalamMasaUji()) {
      // Modul 28: firmware baru harus tersambung ke broker dalam 60 detik. Portal yang menunggu di sini (sampai 3 menit)
      // pasti menggagalkannya, jadi portal ditunda: sesudah masa uji (atau rollback), tahan D13 sambil menekan EN lagi.
      logError("Masa uji firmware baru: portal WiFi DITUNDA. Buka lagi sesudah masa uji (tahan D13, tekan EN).");
    } else if (digitalRead(PIN_TOMBOL) == LOW) {  // tombol D13 ditahan saat menyala = minta portal
      logInfo("Tombol D13 ditahan saat menyala: portal WiFi dibuka.");
      bukaPortal();
    } else if (!punyaWiFi) {
      logInfo("Belum ada WiFi tersimpan.");
      bukaPortal();
    }
    if (punyaWiFi && WiFi.status() != WL_CONNECTED) {
      WiFi.begin();  // pakai WiFi tersimpan di NVS, tanpa menunggu
      logInfo("Menyambung ke WiFi tersimpan \"%s\" (tanpa menunggu)...", wm.getWiFiSSID().c_str());
    }
  }

  // Alamat broker dipilih SESUDAH portal: kolom "Alamat broker" di portal bisa saja baru mengubahnya (Modul 28).
  if (PAKAI_WOKWI && WOKWI_BERKUNCI) {  // Modul 21: latihan "diterima lawan ditolak" di broker publik berkunci
    alamatBroker = BROKER_WOKWI_BERKUNCI;
    portBroker = 1884;  // pintu MQTT test.mosquitto.org yang meminta nama pengguna dan kunci
    pengguna = "rw";    // akun publik test.mosquitto.org; kuncinya: readwrite
  } else if (PAKAI_WOKWI) {
    alamatBroker = BROKER_WOKWI;
  } else {
    alamatBroker = alamatBrokerTersimpan();  // Modul 28: dari NVS (portal, Serial, klaim), atau ALAMAT_BROKER
  }
  mqtt.setServer(alamatBroker, portBroker);  // di rumah: alamat IP, bukan nama, jadi tidak perlu mencari nama (DNS)
  waktuTerakhirSiap = millis();  // Modul 19: hitungan mode offline dimulai sesudah portal WiFi, bukan saat menyala
}

// Sekali saja, saat pertama tersambung: jam internet (Modul 10, Praktik 5).
static void mulaiLayanan() {
  configTzTime(ZONA_WAKTU, "pool.ntp.org", "asia.pool.ntp.org");
  layananSudahMulai = true;
}

// Penjaga (Modul 10, Konsep 4): kalau lama sekali tidak ada percobaan menyambung, suruh paket esp32 mencoba lagi.
// Sejak v1.3.0 (Modul 14) penjaga ini satu-satunya yang menyuruh menyambung lagi: setAutoReconnect(false).
static void jagaSambungan() {
  if (tersambung || !punyaWiFi) {
    return;
  }
  unsigned long peristiwaTerakhir = waktuPeristiwaTerakhir;  // salin DULU: petugas WiFi bisa mengubahnya kapan saja
  unsigned long sekarang = millis();                         // baru baca jam, jadi sekarang >= peristiwaTerakhir
  // Modul 14: 3 detik tanpa peristiwa WiFi dan 3 detik sesudah percobaan penjaga = radio tidak sedang memindai.
  // Kembalikan radio ke channel router supaya paket ESP-NOW Node 2 tetap terdengar selama router mati.
  if (kanalRouter != 0 && sekarang - peristiwaTerakhir >= 3000 && sekarang - waktuPenjagaTerakhir >= 3000
      && WiFi.channel() != kanalRouter) {
    WiFi.setChannel(kanalRouter);
  }
  // Modul 28: paket esp32 hanya mencoba lagi SENDIRI satu kali sesudah menyala (setAutoReconnect(false)). Selama masa uji,
  // firmware baru harus tersambung dalam 60 detik, jadi penjaga mencoba setiap 10 detik, bukan 60 detik; kalau tidak,
  // router yang sedang menyala ulang saja sudah membuat firmware yang baik di-rollback.
  unsigned long batas = dalamMasaUji() ? BATAS_TANPA_PERCOBAAN_UJI : BATAS_TANPA_PERCOBAAN;
  if (sekarang - peristiwaTerakhir >= batas && sekarang - waktuPenjagaTerakhir >= batas) {
    waktuPenjagaTerakhir = sekarang;
    logInfo("Penjaga WiFi: %lu detik tanpa percobaan baru, mencoba menyambung lagi.", batas / 1000);
    WiFi.reconnect();
  }
}

// ---------- Laporan kesehatan: vitals (Lampiran A) ----------
// Modul 28 (kontrak 1.6): vitals juga membawa reset_reason dan fw, dan laporan pembaruan firmware (ota) yang belum
// 3 kali terkirim. Jedanya bisa diatur server lewat config "jeda.vitals_s" (bawaan 300 detik).
static void kirimVitals() {
  char ts[21];
  if (!buatTs(ts, sizeof(ts))) {
    return;  // setiap data wajib membawa ts: tunggu sampai jam disetel
  }
  JsonDocument dokumen;
  dokumen["ts"] = ts;
  dokumen["rssi"] = WiFi.RSSI();
  dokumen["uptime_s"] = uptimeDetik();
  dokumen["heap_free"] = ESP.getFreeHeap();
  bool adaLaporan = laporanMenunggu;  // Modul 19: hanya di vitals pertama sesudah mode offline (kontrak 1.3)
  if (adaLaporan) {
    dokumen["offline_s"] = laporanDetik;
    dokumen["kipas_lokal"] = laporanKipas;
  }
  dokumen["reset_reason"] = alasanReset();  // Modul 28: wajib mulai 1.7.0, selalu bersama fw
  dokumen["fw"] = VERSI_FIRMWARE;
  const LaporanOta* laporanOta = laporanOtaMenunggu();  // pembaruan.cpp; nullptr = tidak ada laporan
  if (laporanOta != nullptr) {
    JsonObject ota = dokumen["ota"].to<JsonObject>();
    ota["id"] = laporanOta->id;
    ota["hasil"] = laporanOta->hasil;
    ota["versi"] = laporanOta->versi;
    if (laporanOta->pesan[0] != '\0') {
      ota["pesan"] = laporanOta->pesan;
    }
  }
  // Modul 28: diperbesar dari 192 (vitals terpanjang sekitar 375 huruf). PubSubClient3 3.3.2 mengirim isi pesan KELUAR
  // sedikit demi sedikit, jadi wadah MQTT 512 byte hanya membatasi pesan MASUK (cmd), bukan vitals.
  char isi[480];
  size_t panjang = serializeJson(dokumen, isi, sizeof(isi));
  if (panjang >= sizeof(isi) && laporanOta != nullptr) {  // hampir mustahil (id penuh tanda khusus): pesan dibuang
    dokumen["ota"].as<JsonObject>().remove("pesan");
    panjang = serializeJson(dokumen, isi, sizeof(isi));
  }
  if (panjang >= sizeof(isi)) {
    logError("Vitals terlalu panjang untuk wadah isi[]: tidak dikirim.");
    sudahKirimVitals = true;  // jangan dicoba lagi di setiap putaran loop()
    waktuVitalsTerakhir = millis();
    return;
  }
  if (mqtt.publish(topikVitals, isi)) {
    sudahKirimVitals = true;
    waktuVitalsTerakhir = millis();
    logDebug("Isi vitals: %s", isi);
    if (adaLaporan) {
      logInfo("Laporan mode offline terkirim bersama vitals: offline_s=%lu, kipas_lokal=%u", laporanDetik,
              laporanKipas);
      laporanMenunggu = false;
      laporanDetik = 0;
      laporanKipas = 0;
    }
    if (laporanOta != nullptr) {  // Modul 28: hitung kiriman laporan pembaruan (paling banyak 3 kali)
      logInfo("Laporan pembaruan ikut vitals: %s ke %s", laporanOta->hasil, laporanOta->versi);
      laporanOtaTerkirim();
    }
  }
}

// Satu kali percobaan menyambung ke broker, paling sering setiap JEDA_COBA_MQTT. Tidak pernah berputar menunggu.
static void cobaSambungkanBroker() {
  if (ditahan) {  // Modul 28: berhenti sengaja untuk pembaruan firmware: jangan menyambung lagi dulu
    return;
  }
  if (ujiOffline) {  // Modul 19: perintah "uji offline" sedang berjalan: pura-pura broker tak terjangkau
    if (millis() - waktuUjiOffline < LAMA_UJI_OFFLINE) {
      return;
    }
    ujiOffline = false;
    logInfo("Uji offline selesai: Node 1 menyambung ke broker lagi.");
  }
  // Modul 21: sesudah broker menolak kunci, coba lagi jauh lebih jarang supaya log broker tidak banjir.
  unsigned long jeda = ditolakBroker ? JEDA_COBA_DITOLAK : JEDA_COBA_MQTT;
  if (sudahCobaMqtt && millis() - waktuCobaMqttTerakhir < jeda) {
    return;
  }
  sudahCobaMqtt = true;
  waktuCobaMqttTerakhir = millis();
  unsigned long mulai = millis();
  const char* kunci = kunciBroker();  // Modul 21: dari NVS; "" = belum ada
  if (UJI_KUNCI_SALAH == 1) {
    // Modul 28, firmware LATIHAN 1.7.2-uji: kunci sengaja dirusak DI RAM SAJA (NVS tidak disentuh). Broker menolaknya,
    // masa uji 60 detik lewat, dan Node 1 kembali sendiri ke firmware sebelumnya, yang memakai kunci asli dari NVS.
    kunci = "kunci-dirusak-UJI_KUNCI_SALAH";
    logError("UJI_KUNCI_SALAH = 1: kunci broker sengaja salah (latihan rollback Modul 28).");
  }
  // Nama klien = device_id; nama pengguna = device_id (Wokwi berkunci: rw); kunci dari NVS (nullptr = tanpa kunci);
  // lalu surat wasiat: topik status, QoS 1, retained, isi "offline" (Modul 11, Konsep 7).
  if (mqtt.connect(idPerangkat, pengguna, kunci[0] != '\0' ? kunci : nullptr, topikStatus, 1, true, "offline")) {
    mqttTersambung = true;
    ditolakBroker = false;
    kodeGagalTerakhir = 0;
    if (PAKAI_WOKWI) {
      // Modul 19: mencari alamat broker.emqx.io (DNS) sesudah lama putus bisa lebih dari 5 detik di Wokwi, dan watchdog
      // pun me-restart Node 1. Simpan alamat IP-nya: sambung ulang berikutnya tidak perlu DNS lagi.
      mqtt.setServer(klienJaringan.remoteIP(), portBroker);
    }
    bool terbit = mqtt.publish(topikStatus, "online", true);  // retained: pelanggan yang datang belakangan tetap melihatnya
    bool langganan = mqtt.subscribe(topikCmd, 1);            // langganan diulang setiap kali tersambung (clean session)
    logInfo("MQTT tersambung ke broker %s:%u dalam %lu ms, sebagai %s", alamatBroker, portBroker, millis() - mulai,
            pengguna);
    sudahKirimVitals = false;  // vitals pertama segera dikirim
    if (terbit && langganan) {
      firmwareTerbukti();  // Modul 28 (masa-uji.cpp): kunci diterima + "online" terbit + cmd dilanggan = firmware SAH
    }
    return;
  }
  int kode = mqtt.state();
  ditolakBroker = (kode == 4 || kode == 5);  // Modul 21: jawaban broker sendiri, bukan masalah jaringan
  if (ditolakBroker) {  // dicatat setiap percobaan (paling sering 1 kali per menit)
    logError("MQTT DITOLAK broker (kode %d): kunci %s. Dicoba lagi %lu detik lagi.", kode,
             kunci[0] != '\0' ? "salah, belum didaftarkan, atau sudah dicabut" : "belum diisi", JEDA_COBA_DITOLAK / 1000);
    logInfo("Kunci baru? Ketik di Serial Monitor: kunci <isi>, lalu Enter.");
  } else if (kode != kodeGagalTerakhir) {  // kegagalan yang sama tidak dicatat setiap 5 detik
    logError("MQTT gagal tersambung ke broker setelah %lu ms: %s (kode %d). Broker di gerbang menyala?",
             millis() - mulai, namaKeadaanMqtt(kode), kode);
  }
  kodeGagalTerakhir = kode;
}

static void jagaMqtt() {
  if (!tersambung) {
    if (mqttTersambung) {
      mqttTersambung = false;
      logError("MQTT ikut putus karena WiFi putus.");
    }
    return;
  }
  if (mqtt.connected()) {
    mqtt.loop();  // menerima perintah dan menjaga sambungan tetap hidup (keep-alive)
    // Modul 19: sesudah mode offline, vitals pertama (yang membawa laporan) menunggu TUNDA_LAPORAN dulu. Server biasanya
    // ikut kehilangan broker dan baru menyambung lagi beberapa detik kemudian. vitals tidak retained, jadi laporan yang
    // terbit sebelum server berlangganan lagi tidak akan pernah sampai.
    bool laporanMenungguServer = laporanMenunggu && millis() - waktuSelesaiOffline < TUNDA_LAPORAN;
    if (!laporanMenungguServer && (!sudahKirimVitals || millis() - waktuVitalsTerakhir >= jedaVitalsDetik() * 1000UL)) {
      kirimVitals();
    }
    return;
  }
  if (mqttTersambung) {
    mqttTersambung = false;
    int kode = mqtt.state();
    logError("MQTT PUTUS: %s (kode %d). Node 1 tetap bekerja dan mencoba lagi setiap %lu detik.",
             namaKeadaanMqtt(kode), kode, JEDA_COBA_MQTT / 1000);
  }
  cobaSambungkanBroker();
}

// Modul 19: mode offline = WiFi atau broker tak terjangkau terus-menerus selama BATAS_MODE_OFFLINE, dihitung dari saat
// terakhir tersambung. Selama mode offline, aturan pengaman kipas (aturan.cpp) bekerja sendiri.
static void jagaModeOffline() {
  unsigned long sekarang = millis();
  if (mqttSiap()) {
    waktuTerakhirSiap = sekarang;
    if (offline) {
      offline = false;
      waktuSelesaiOffline = sekarang;
      unsigned long lama = (sekarang - waktuMasukOffline) / 1000;
      laporanDetik += lama;  // dijumlahkan: kalau vitals belum sempat terkirim, mode offline berikutnya ikut dihitung
      laporanKipas += kipasLokal;
      laporanMenunggu = true;  // ikut vitals pertama sesudah tersambung, TUNDA_LAPORAN kemudian (jagaMqtt)
      logInfo("MODE OFFLINE SELESAI setelah %lu detik: broker terjangkau lagi. Pengaman menyalakan kipas %u kali.", lama,
              kipasLokal);
    }
    return;
  }
  if (!offline && sekarang - waktuTerakhirSiap >= BATAS_MODE_OFFLINE) {
    offline = true;
    waktuMasukOffline = sekarang;
    kipasLokal = 0;
    logError("MODE OFFLINE: broker %s %lu detik. Pengaman lokal bekerja: kipas menyala di atas %.1f C.",
             ditolakBroker ? "menolak kunci selama" : "tak terjangkau", BATAS_MODE_OFFLINE / 1000, ambangSuhuKipas());
  }
}

void perbaruiJaringan() {
  if (benderaPutus) {  // putus selalu terjadi sebelum tersambung lagi, jadi ditangani dulu
    benderaPutus = false;
    if (tersambung) {  // baru saja putus; percobaan ulang yang gagal tidak dilaporkan satu per satu
      tersambung = false;
      waktuPutus = millis();
      logError("WiFi PUTUS (alasan %u: %s). Node 1 tetap bekerja dan mencoba lagi setiap %lu detik.", alasanPutus,
               namaAlasan(alasanPutus), BATAS_TANPA_PERCOBAAN / 1000);
    }
  }
  if (benderaDapatIp) {
    benderaDapatIp = false;
    if (WiFi.status() == WL_CONNECTED) {  // masih tersambung saat bendera diturunkan?
      tersambung = true;
      kanalRouter = WiFi.channel();  // Modul 14: diingat untuk ESP-NOW
      if (waktuPutus == 0) {
        logInfo("WiFi tersambung ke \"%s\": IP %s, sinyal %d dBm, channel %u", WiFi.SSID().c_str(),
                WiFi.localIP().toString().c_str(), WiFi.RSSI(), kanalRouter);
      } else {
        logInfo("WiFi tersambung LAGI setelah %lu detik: IP %s", (millis() - waktuPutus) / 1000,
                WiFi.localIP().toString().c_str());
      }
      if (!layananSudahMulai) {
        mulaiLayanan();
      }
    }
  }
  if (!jamSudahDilaporkan) {
    char ts[21];
    if (buatTs(ts, sizeof(ts))) {
      jamSudahDilaporkan = true;
      logInfo("Jam disetel dari internet: %s", ts);
    }
  }
  jagaSambungan();
  jagaMqtt();
  jagaModeOffline();  // Modul 19
}

// ---------- Kirim bacaan: telemetry (Modul 11, Praktik 3 dan 7) ----------
// Kejadian penting sebagai deretan bit: gerak, gelap, tanah kering, air tandon rendah,
// dan mulai Modul 19 (kontrak 1.3) kipas, lampu, dan pompa yang menyala.
static uint8_t keadaanPenting(BacaanSensor b) {
  uint8_t k = 0;
  if (b.gerak) {
    k |= 1;
  }
  if (b.cahaya < AMBANG_GELAP) {
    k |= 2;
  }
  if (b.tanah < ambangTanahSiram()) {
    k |= 4;
  }
  if (b.level_air >= 0 && b.level_air < LEVEL_AIR_MINIMUM) {
    k |= 8;
  }
  if (kipasMenyala()) {  // Modul 19: keadaan aktuator ikut state di telemetry
    k |= 16;
  }
  if (lampuMenyala()) {
    k |= 32;
  }
  if (pompaMenyala()) {
    k |= 64;
  }
  return k;
}

// Kalimat singkat untuk log: kejadian mana yang berubah.
static const char* namaPerubahan(uint8_t berubah, uint8_t sekarang, int levelAir) {
  if (berubah & 1) {
    return (sekarang & 1) ? "gerakan terlihat" : "gerakan berhenti";
  }
  if (berubah & 2) {
    return (sekarang & 2) ? "menjadi gelap" : "menjadi terang";
  }
  if (berubah & 4) {
    return (sekarang & 4) ? "tanah mengering" : "tanah basah lagi";
  }
  if (berubah & 16) {  // Modul 19
    return (sekarang & 16) ? "kipas menyala" : "kipas padam";
  }
  if (berubah & 32) {
    return (sekarang & 32) ? "lampu menyala" : "lampu padam";
  }
  if (berubah & 64) {
    return (sekarang & 64) ? "pompa menyala" : "pompa padam";
  }
  if (sekarang & 8) {
    return "air tandon rendah";
  }
  return levelAir < 0 ? "air tandon tidak terbaca" : "air tandon cukup lagi";  // -1 = HC-SR04 gagal dibaca
}

// Menjawab false kalau kiriman tidak dicoba karena MQTT belum tersambung atau jam belum disetel.
static bool terbitkanTelemetry(const char* alasan) {
  char ts[21];
  if (!mqtt.connected() || !buatTs(ts, sizeof(ts))) {
    return false;  // setiap data wajib membawa ts (Lampiran A): tunggu sampai jam disetel
  }
  JsonDocument dokumen;
  dokumen["ts"] = ts;
  dokumen["fw"] = VERSI_FIRMWARE;
  dokumen["suhu"] = bacaanKirim.suhu;  // NAN ditulis ArduinoJson sebagai null
  if (bacaanKirim.kelembapan < 0) {
    dokumen["kelembapan"] = nullptr;  // bacaan gagal ditulis null (kontrak data)
  } else {
    dokumen["kelembapan"] = bacaanKirim.kelembapan;
  }
  dokumen["cahaya"] = bacaanKirim.cahaya;
  dokumen["tanah"] = bacaanKirim.tanah;
  dokumen["gerak"] = bacaanKirim.gerak;
  if (bacaanKirim.level_air < 0) {
    dokumen["level_air"] = nullptr;
  } else {
    dokumen["level_air"] = bacaanKirim.level_air;
  }
  tulisKolomRS485(dokumen);  // Modul 15: tanah_rs485, suhu_tanah, ec (hanya kalau sensor RS-485 dipakai)
  tulisKeadaan(dokumen);     // Modul 19 (kontrak 1.3): state, sama persis dengan state di ack
  char isi[320];  // Modul 19: diperbesar dari 256 untuk state
  size_t panjang = serializeJson(dokumen, isi, sizeof(isi));
  if (panjang >= sizeof(isi)) {
    logError("Telemetry terlalu panjang untuk wadah isi[]: tidak dikirim.");
    return true;
  }
  if (mqtt.publish(topikTelemetry, isi)) {
    jumlahTerbit++;
    logInfo("Terbit telemetry (%s)", alasan);
  } else {
    logError("Gagal menerbitkan telemetry.");
  }
  logDebug("Isi telemetry: %s", isi);
  return true;
}

void kirimBacaan(BacaanSensor b) {
  unsigned long sekarang = millis();  // dicatat sebelum menerbitkan: jadwal dihitung dari saat bacaan datang
  bacaanKirim = b;
  adaBacaan = true;
  uint8_t k = keadaanPenting(b);
  if (!keadaanDikenal) {
    keadaanDikenal = true;
  } else if (k != keadaanTerakhir) {
    alasanSegera = namaPerubahan(k ^ keadaanTerakhir, k, b.level_air);
  } else if (sudutTirai() != tiraiTerakhir) {
    alasanSegera = "tirai bergerak";  // Modul 19: sudut tirai juga bagian dari state
  }
  keadaanTerakhir = k;
  tiraiTerakhir = sudutTirai();
  // Bacaan datang sekitar setiap 2 detik, tidak pernah persis: beri toleransi setengah jeda baca.
  unsigned long sejak = sekarang - waktuKirimTerakhir + JEDA_BACA / 2;
  if (alasanSegera != nullptr && (!sudahPernahKirim || sejak >= JEDA_SEGERA_MIN)) {
    if (terbitkanTelemetry(alasanSegera)) {  // kejadian penting: kirim segera
      alasanSegera = nullptr;
      sudahPernahKirim = true;
      waktuKirimTerakhir = sekarang;
    }
  } else if (!sudahPernahKirim || sejak >= JEDA_KIRIM) {  // bacaan yang paling dekat dengan 10 detik
    if (terbitkanTelemetry("jadwal 10 detik")) {
      sudahPernahKirim = true;
      waktuKirimTerakhir = sekarang;
    }
  }
}

void kirimSekarang() {
  if (!adaBacaan) {
    Serial.println("kirim: belum ada bacaan, coba lagi 2 detik kemudian.");
    return;
  }
  if (!terbitkanTelemetry("perintah kirim")) {
    Serial.println("kirim: belum bisa, MQTT belum tersambung atau jam belum disetel.");
    return;
  }
  sudahPernahKirim = true;
  waktuKirimTerakhir = millis();
}

// ---------- Untuk layar dan perintah Serial ----------
const char* teksJaringan() {
  if (!punyaWiFi) {
    return "mati";
  }
  if (!tersambung) {
    return "putus";
  }
  if (mqtt.connected()) {
    return "ok, MQTT ok";
  }
  if (ditolakBroker) {
    return "ok, MQTT DITOLAK";  // Modul 21: di layar "WiFi ok, MQTT DITOLAK" = tepat 21 huruf
  }
  return "ok, MQTT putus";
}

void cetakInfoJaringan() {
  if (tersambung) {
    Serial.printf("wifi: tersambung ke \"%s\", IP %s, sinyal %d dBm\n", WiFi.SSID().c_str(),
                  WiFi.localIP().toString().c_str(), WiFi.RSSI());
  } else if (punyaWiFi) {
    Serial.printf("wifi: PUTUS, alasan terakhir %u (%s)\n", alasanPutus, namaAlasan(alasanPutus));
  } else {
    Serial.println("wifi: belum ada WiFi tersimpan. Tekan EN untuk membuka portal.");
  }
  char ts[21] = "belum disetel";
  buatTs(ts, sizeof(ts));
  Serial.printf("wifi: device_id %s, nama %s, jam %s\n", idPerangkat, NAMA_PERANGKAT, ts);
  Serial.printf("wifi: channel radio %ld, channel router %u (0 = belum pernah tersambung)\n", (long)WiFi.channel(),
                kanalRouter);  // Modul 14
  if (mqtt.connected()) {
    Serial.printf("mqtt: tersambung ke %s:%u sebagai %s\n", alamatBroker, portBroker, pengguna);
  } else {
    Serial.printf("mqtt: PUTUS dari %s:%u, %s (kode %d)\n", alamatBroker, portBroker, namaKeadaanMqtt(mqtt.state()),
                  mqtt.state());
  }
  Serial.printf("mqtt: nama pengguna %s, kunci %s\n", pengguna,  // Modul 21
                kunciBroker()[0] != '\0' ? "tersimpan (rinciannya: ketik kunci)" : "BELUM ADA");
  Serial.printf("mqtt: alamat broker %s (%s)\n", alamatBroker,  // Modul 28
                PAKAI_WOKWI ? "Wokwi" : (alamatBrokerDariNvs() ? "dari NVS" : "dari konfigurasi.h"));
  Serial.printf("mqtt: telemetry setiap %lu detik dan segera saat ada kejadian penting, vitals setiap %lu detik, "
                "%lu kali terbit\n", JEDA_KIRIM / 1000, jedaVitalsDetik(), jumlahTerbit);
  unsigned long sekarang = millis();  // Modul 19: mode offline
  if (offline) {
    Serial.printf("mode offline: YA, sejak %lu detik lalu; pengaman sudah menyalakan kipas %u kali\n",
                  (sekarang - waktuMasukOffline) / 1000, kipasLokal);
  } else if (mqttSiap()) {
    Serial.println("mode offline: tidak (broker terjangkau)");
  } else {
    Serial.printf("mode offline: belum; broker %s sejak %lu detik lalu (mode offline setelah %lu detik)\n",
                  ditolakBroker ? "menolak kunci" : "tak terjangkau", (sekarang - waktuTerakhirSiap) / 1000,
                  BATAS_MODE_OFFLINE / 1000);  // Modul 21: penolakan kunci juga dihitung
  }
  if (ujiOffline && sekarang - waktuUjiOffline < LAMA_UJI_OFFLINE) {
    Serial.printf("mode offline: uji offline berjalan, Node 1 menyambung lagi %lu detik lagi\n",
                  (LAMA_UJI_OFFLINE - (sekarang - waktuUjiOffline)) / 1000);
  }
}

void lupakanWiFi() {
  bersiapRestart("perintah wifi lupa");  // Modul 28: offline-mode + putus rapi (dan laporan bila di tengah masa uji)
  Serial.println("WiFi tersimpan dihapus. Restart sekarang; portal WiFi akan terbuka.");
  Serial.flush();
  WiFi.disconnect(true, true);  // true, true = matikan radio DAN hapus WiFi tersimpan dari NVS
  delay(500);
  ESP.restart();
}

// ---------- Modul 14: dipakai jembatan Node 2 (jembatan.cpp) ----------
bool mqttSiap() {
  return tersambung && mqtt.connected();
}

bool terbitkan(const char* topik, const char* isi, bool retained) {
  if (!mqttSiap()) {
    return false;
  }
  return mqtt.publish(topik, isi, retained);
}

// ---------- Modul 19: dipakai aturan pengaman (aturan.cpp) dan perintah Serial ----------
bool modeOffline() {
  return offline;
}

void catatKipasLokal() {
  if (offline) {
    kipasLokal++;
  }
}

// Latihan "kabel LAN Pi dicabut" tanpa menyentuh Pi (dan satu-satunya cara di Wokwi dengan broker publik).
// Sambungan TCP ke broker ditutup TANPA pamit, jadi broker langsung menerbitkan wasiat "offline"; lalu Node 1 tidak
// menyambung lagi selama LAMA_UJI_OFFLINE. Restart menghentikan uji ini lebih awal.
void mulaiUjiOffline() {
  ujiOffline = true;
  waktuUjiOffline = millis();
  klienJaringan.stop();
  Serial.printf("uji offline: sambungan broker diputus; mode offline mulai %lu menit lagi, "
                "sambung lagi %lu menit lagi.\n", BATAS_MODE_OFFLINE / 60000, LAMA_UJI_OFFLINE / 60000);
}

// ---------- Modul 21: akun broker ----------
const char* penggunaBroker() {
  return pengguna;
}

bool mqttDitolak() {
  return ditolakBroker;
}

// Kunci baru (atau dihapus): coba sekarang, tanpa menunggu jeda. Sambungan lama ditutup TANPA pamit seperti "uji offline",
// jadi broker menerbitkan wasiat "offline" dulu; begitu kunci baru diterima, status kembali "online".
void gantiKunciBroker() {
  ditolakBroker = false;
  sudahCobaMqtt = false;
  if (mqtt.connected()) {
    klienJaringan.stop();
  }
}

// ---------- Modul 28: pembaruan firmware dan pendaftaran ----------
const char* deviceId() {
  return idPerangkat;
}

bool wifiTersambung() {
  return tersambung;
}

// Alamat broker baru (Serial "broker", "klaim", atau portal): dipakai untuk sambungan berikutnya, yang dicoba sekarang.
void gantiAlamatBroker() {
  if (PAKAI_WOKWI) {
    logInfo("Mode Wokwi: alamat broker tetap broker publik; alamat baru dipakai di jaringan rumah.");
    return;
  }
  alamatBroker = alamatBrokerTersimpan();
  mqtt.setServer(alamatBroker, portBroker);
  gantiKunciBroker();  // putus (kalau tersambung) dan coba sekarang, tanpa menunggu jeda
}

// Berhenti sengaja (kontrak 1.6 bagian 3): sebelum memasang firmware baru atau restart atas perintah, Node 1 menerbitkan
// "offline-mode" (retained, QoS 1), lalu memutus sambungan dengan pesan DISCONNECT. Broker tidak menerbitkan wasiat
// "offline" untuk sambungan yang diputus rapi, jadi dashboard menulis "berhenti sengaja", bukan "hilang".
void berhentiSengaja() {
  ditahan = true;  // mulai sekarang: tidak menyambung lagi dan tidak mengerjakan perintah baru
  if (mqtt.connected()) {
    mqtt.loop();  // terima pesan yang sudah datang (ack perintah update sendiri sudah terkirim di dalam callback)
    mqtt.publish(topikStatus, "offline-mode", MQTT_QOS1, true);
    unsigned long mulai = millis();
    while (millis() - mulai < 300) {  // beri waktu broker menerimanya (dan menjawab PUBACK), tanpa menunggu lama
      mqtt.loop();
      delay(10);
    }
    // Data masuk yang belum terbaca (misalnya perintah yang tiba di detik terakhir) dibuang dulu. Tanpa ini, sambungan
    // yang masih menyimpan data masuk ditutup dengan RST (bukan FIN), DISCONNECT bisa ikut terbuang, dan broker
    // menerbitkan wasiat "offline" padahal Node 1 berhenti sengaja.
    klienJaringan.clear();
    mqtt.disconnect();  // DISCONNECT rapi
    logInfo("Status offline-mode terbit, sambungan broker diputus rapi (tanpa wasiat offline).");
  }
  mqttTersambung = false;  // supaya jagaMqtt() tidak menulis "MQTT PUTUS"
}

// Sesudah pembaruan GAGAL (firmware lama tetap jalan tanpa restart): menyambung lagi sekarang juga. Lamanya berhenti
// sengaja tidak dihitung sebagai mode offline Modul 19.
void lanjutkanSambungan() {
  ditahan = false;
  sudahCobaMqtt = false;
  ditolakBroker = false;
  waktuTerakhirSiap = millis();
}
