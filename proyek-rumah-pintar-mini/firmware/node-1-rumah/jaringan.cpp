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
#include "jaringan.h"

#ifndef MQTT_QOS1  // hanya PubSubClient3 yang punya nama ini
#error "Yang terpakai PubSubClient lama (2.8). Hapus lewat Library Manager, lalu pasang PubSubClient3 versi 3.3.2."
#endif

const unsigned long BATAS_TANPA_PERCOBAAN = 60000;  // penjaga: 60 detik tanpa percobaan menyambung = suruh mencoba lagi
const unsigned long JEDA_COBA_MQTT = 5000;          // gagal menyambung ke broker? coba lagi 5 detik kemudian
const unsigned long JEDA_SEGERA_MIN = 2000;         // kiriman segera paling sering setiap 2 detik
const unsigned long TUNDA_LAPORAN = 10000;          // Modul 19: laporan mode offline dikirim 10 detik sesudah tersambung
const char BROKER_WOKWI[] = "broker.emqx.io";      // Wokwi tidak bisa menjangkau laptopmu: pakai broker publik

static WiFiClient klienJaringan;          // sambungan TCP ke broker
static PubSubClient mqtt(klienJaringan);  // MQTT berjalan di atas sambungan itu
static char idPerangkat[13] = "";  // device_id: 12 digit heksadesimal + tanda akhir teks (Lampiran A)
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
    case 4: return "nama pengguna atau kata sandi ditolak";
    case 5: return "tidak diizinkan broker";
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
// Menunggu di sini boleh: dipanggil dari setup(), sebelum watchdog mengawasi loop().
static void bukaPortal() {
  logInfo("Portal WiFi terbuka selama %lu detik: sambungkan HP ke WiFi \"%s\", lalu buka http://192.168.4.1",
          BATAS_PORTAL, NAMA_PORTAL);
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
  bool berhasil = wm.startConfigPortal(NAMA_PORTAL);

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
static const char* kerjakanConfig(JsonDocument& perintah) {
  static char alasan[48];  // static: isinya masih dibaca kirimAck() setelah fungsi ini selesai
  JsonObject ambang = perintah["ambang"].as<JsonObject>();
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
  if (!suhu.isNull()) {
    simpanAmbangSuhuKipas(suhu.as<float>());
  }
  if (!tanah.isNull()) {
    simpanAmbangTanahSiram(tanah.as<int>());
  }
  return nullptr;
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
  ingatId(id);
  const char* pesan = "aksi tidak dikenal";
  if (strcmp(aksi, "set") == 0) {
    pesan = kerjakanSet(perintah);
  } else if (strcmp(aksi, "config") == 0) {
    pesan = kerjakanConfig(perintah);  // Modul 19
  } else if (strcmp(aksi, "update") == 0) {
    pesan = "aksi update belum didukung (Modul 28)";
  }
  if (pesan == nullptr) {
    logInfo("Perintah %s: %s %s dikerjakan.", id, aksi, perintah["target"] | "ambang");
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
  if (PAKAI_WOKWI) {
    mqtt.setServer(BROKER_WOKWI, PORT_BROKER);
  } else {
    mqtt.setServer(ALAMAT_BROKER, PORT_BROKER);  // alamat IP, bukan nama: tidak perlu mencari nama (DNS)
  }
  mqtt.setSocketTimeout(1);  // menunggu jawaban broker paling lama 1 detik (bawaan: 15 detik)
  if (!mqtt.setBufferSize(512)) {  // ruang pesan 512 byte (bawaan: 256)
    logError("Memori tidak cukup untuk ruang pesan MQTT 512 byte.");
  }
  mqtt.setCallback(saatPesanMqtt);

  if (PAKAI_WOKWI) {
    logInfo("Mode Wokwi: menyambung ke Wokwi-GUEST tanpa portal, broker publik %s.", BROKER_WOKWI);
    WiFi.begin("Wokwi-GUEST", "", 6);  // 6 = kanal Wokwi-GUEST supaya lebih cepat
    punyaWiFi = true;
  } else {
    WiFiManager wm;
    punyaWiFi = wm.getWiFiIsSaved();
    if (digitalRead(PIN_TOMBOL) == LOW) {  // tombol D13 ditahan saat menyala = minta portal
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
  if (sekarang - peristiwaTerakhir >= BATAS_TANPA_PERCOBAAN
      && sekarang - waktuPenjagaTerakhir >= BATAS_TANPA_PERCOBAAN) {
    waktuPenjagaTerakhir = sekarang;
    logInfo("Penjaga WiFi: %lu detik tanpa percobaan baru, mencoba menyambung lagi.", BATAS_TANPA_PERCOBAAN / 1000);
    WiFi.reconnect();
  }
}

// ---------- Laporan kesehatan: vitals (Lampiran A) ----------
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
  char isi[192];  // Modul 19: diperbesar dari 128 untuk laporan mode offline
  size_t panjang = serializeJson(dokumen, isi, sizeof(isi));
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
  }
}

// Satu kali percobaan menyambung ke broker, paling sering setiap JEDA_COBA_MQTT. Tidak pernah berputar menunggu.
static void cobaSambungkanBroker() {
  if (ujiOffline) {  // Modul 19: perintah "uji offline" sedang berjalan: pura-pura broker tak terjangkau
    if (millis() - waktuUjiOffline < LAMA_UJI_OFFLINE) {
      return;
    }
    ujiOffline = false;
    logInfo("Uji offline selesai: Node 1 menyambung ke broker lagi.");
  }
  if (sudahCobaMqtt && millis() - waktuCobaMqttTerakhir < JEDA_COBA_MQTT) {
    return;
  }
  sudahCobaMqtt = true;
  waktuCobaMqttTerakhir = millis();
  unsigned long mulai = millis();
  // Surat wasiat: topik status, QoS 1, retained, isi "offline" (Modul 11, Konsep 7).
  if (mqtt.connect(idPerangkat, topikStatus, 1, true, "offline")) {
    mqttTersambung = true;
    kodeGagalTerakhir = 0;
    if (PAKAI_WOKWI) {
      // Modul 19: mencari alamat broker.emqx.io (DNS) sesudah lama putus bisa lebih dari 5 detik di Wokwi, dan watchdog
      // pun me-restart Node 1. Simpan alamat IP-nya: sambung ulang berikutnya tidak perlu DNS lagi.
      mqtt.setServer(klienJaringan.remoteIP(), PORT_BROKER);
    }
    mqtt.publish(topikStatus, "online", true);  // retained: pelanggan yang datang belakangan tetap melihatnya
    mqtt.subscribe(topikCmd, 1);                // langganan diulang setiap kali tersambung (clean session)
    logInfo("MQTT tersambung ke broker %s:%u dalam %lu ms, sebagai %s", PAKAI_WOKWI ? BROKER_WOKWI : ALAMAT_BROKER,
            PORT_BROKER, millis() - mulai, idPerangkat);
    sudahKirimVitals = false;  // vitals pertama segera dikirim
    return;
  }
  int kode = mqtt.state();
  if (kode != kodeGagalTerakhir) {  // kegagalan yang sama tidak dicatat setiap 5 detik
    kodeGagalTerakhir = kode;
    logError("MQTT gagal tersambung ke broker setelah %lu ms: %s (kode %d). Broker di gateway menyala?",
             millis() - mulai, namaKeadaanMqtt(kode), kode);
  }
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
    if (!laporanMenungguServer && (!sudahKirimVitals || millis() - waktuVitalsTerakhir >= JEDA_VITALS)) {
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
    logError("MODE OFFLINE: broker tak terjangkau %lu detik. Pengaman lokal bekerja: kipas menyala di atas %.1f C.",
             BATAS_MODE_OFFLINE / 1000, ambangSuhuKipas());
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
  const char* broker = PAKAI_WOKWI ? BROKER_WOKWI : ALAMAT_BROKER;
  if (mqtt.connected()) {
    Serial.printf("mqtt: tersambung ke %s:%u sebagai %s\n", broker, PORT_BROKER, idPerangkat);
  } else {
    Serial.printf("mqtt: PUTUS dari %s:%u, %s (kode %d)\n", broker, PORT_BROKER, namaKeadaanMqtt(mqtt.state()),
                  mqtt.state());
  }
  Serial.printf("mqtt: telemetry setiap %lu detik dan segera saat ada kejadian penting, vitals setiap %lu menit, "
                "%lu kali terbit\n", JEDA_KIRIM / 1000, JEDA_VITALS / 60000, jumlahTerbit);
  unsigned long sekarang = millis();  // Modul 19: mode offline
  if (offline) {
    Serial.printf("mode offline: YA, sejak %lu detik lalu; pengaman sudah menyalakan kipas %u kali\n",
                  (sekarang - waktuMasukOffline) / 1000, kipasLokal);
  } else if (mqttSiap()) {
    Serial.println("mode offline: tidak (broker terjangkau)");
  } else {
    Serial.printf("mode offline: belum; broker tak terjangkau sejak %lu detik lalu (mode offline setelah %lu detik)\n",
                  (sekarang - waktuTerakhirSiap) / 1000, BATAS_MODE_OFFLINE / 1000);
  }
  if (ujiOffline && sekarang - waktuUjiOffline < LAMA_UJI_OFFLINE) {
    Serial.printf("mode offline: uji offline berjalan, Node 1 menyambung lagi %lu detik lagi\n",
                  (LAMA_UJI_OFFLINE - (sekarang - waktuUjiOffline)) / 1000);
  }
}

void lupakanWiFi() {
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
