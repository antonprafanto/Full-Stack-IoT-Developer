// jaringan.cpp - isi modul jaringan. Daftar fungsinya ada di jaringan.h.
#include <Arduino.h>
#include <esp_mac.h>  // esp_read_mac(): alamat MAC langsung dari chip
#include <WiFi.h>
#include <WiFiManager.h>  // library WiFiManager: portal WiFi (Praktik 4)
#include <WebServer.h>
#include <ESPmDNS.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>  // library ArduinoJson (Praktik 6)
#include <time.h>
#include "konfigurasi.h"
#include "pencatat.h"
#include "sensor.h"
#include "aktuator.h"
#include "layar.h"
#include "jaringan.h"

const unsigned long BATAS_TANPA_PERCOBAAN = 60000;  // penjaga: 60 detik tanpa percobaan menyambung = suruh mencoba lagi
const int BATAS_WAKTU_HTTP = 1500;                  // milidetik; menyambung + menunggu balasan tetap jauh di bawah 5 detik

static WebServer server(80);
static char idPerangkat[13] = "";  // device_id: 12 huruf heksadesimal + tanda akhir teks (Lampiran A)
static char alamatKirim[96] = "";  // ALAMAT_SERVER + "/rpm/<device_id>/telemetry"

// ---------- Bendera dari fungsi peristiwa WiFi (Praktik 3) ----------
static volatile bool benderaDapatIp = false;
static volatile bool benderaPutus = false;
static volatile uint8_t alasanPutus = 0;
static volatile unsigned long waktuPeristiwaTerakhir = 0;  // millis() saat peristiwa WiFi terakhir

static bool punyaWiFi = false;  // ada WiFi tersimpan (atau Wokwi-GUEST) yang dituju?
static bool tersambung = false;
static bool layananSudahMulai = false;  // jam internet dan nama node1.local dimulai sekali saja
static bool jamSudahDilaporkan = false;
static unsigned long waktuPutus = 0;
static unsigned long waktuPenjagaTerakhir = 0;

// ---------- Kiriman ke server di laptop (Praktik 7) ----------
static BacaanSensor bacaanKirim;
static bool adaBacaan = false;
static bool sudahPernahKirim = false;
static unsigned long waktuKirimTerakhir = 0;
static int kodeKirimTerakhir = 0;  // kode status kiriman terakhir; 0 = belum pernah mengirim

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

// ---------- Cap waktu (Praktik 5) ----------
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

// ---------- Server web: /, /on, dan /off (Praktik 8) ----------
// Halaman siap tempel; tampilan yang cantik menunggu Modul 22.
static const char HALAMAN[] = R"(<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Node 1 Rumah</title>
</head>
<body style="font-family: sans-serif; font-size: 20px; padding: 16px">
<h2>Node 1 Rumah</h2>
<p>Lampu: <b>%LAMPU%</b></p>
<p><a href="/on">Nyalakan lampu</a></p>
<p><a href="/off">Matikan lampu</a></p>
<p>Suhu %SUHU%&nbsp;&deg;C, kelembapan %LEMBAP%&nbsp;%<br>
Cahaya %CAHAYA%, tanah %TANAH%&nbsp;%<br>
Air tandon %AIR%&nbsp;%</p>
<p><small>Firmware %FW%, %JAM%</small></p>
</body>
</html>)";

// Angka bacaan, atau "--" kalau bacaannya gagal (-1).
static String angkaAtauStrip(int nilai) {
  if (nilai < 0) {
    return "--";
  }
  return String(nilai);
}

static void kirimHalaman() {
  BacaanSensor b = bacaanTerakhir();
  String html = HALAMAN;
  if (lampuMenyala()) {
    html.replace("%LAMPU%", "MENYALA");
  } else {
    html.replace("%LAMPU%", "PADAM");
  }
  String teksSuhu = "--";
  if (!isnan(b.suhu)) {
    teksSuhu = String(b.suhu, 1);
  }
  html.replace("%SUHU%", teksSuhu);
  html.replace("%LEMBAP%", angkaAtauStrip(b.kelembapan));
  html.replace("%CAHAYA%", String(b.cahaya));
  html.replace("%TANAH%", String(b.tanah));
  html.replace("%AIR%", angkaAtauStrip(b.level_air));
  html.replace("%FW%", VERSI_FIRMWARE);

  char jam[24] = "jam belum disetel";
  time_t sekarang = time(nullptr);
  struct tm lokal;
  localtime_r(&sekarang, &lokal);
  if (lokal.tm_year + 1900 >= 2025) {
    strftime(jam, sizeof(jam), "%d-%m-%Y %H:%M %Z", &lokal);  // misalnya 17-10-2026 08:30 WIB
  }
  html.replace("%JAM%", jam);
  server.send(200, "text/html", html);
}

static void tanganiBeranda() {
  kirimHalaman();
}

static void tanganiOn() {
  aturLampu(true);
  logInfo("Browser %s: lampu on", server.client().remoteIP().toString().c_str());
  kirimHalaman();
}

static void tanganiOff() {
  aturLampu(false);
  logInfo("Browser %s: lampu off", server.client().remoteIP().toString().c_str());
  kirimHalaman();
}

static void tanganiTidakAda() {
  server.send(404, "text/plain", "404: halaman ini tidak ada. Coba /, /on, atau /off");
}

static void siapkanServerWeb() {
  server.on("/", tanganiBeranda);
  server.on("/on", tanganiOn);
  server.on("/off", tanganiOff);
  server.onNotFound(tanganiTidakAda);
  server.begin();
}

// ---------- Portal WiFi (Praktik 4) ----------
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

void siapkanJaringan() {
  WiFi.onEvent(saatPeristiwaWiFi);   // daftarkan SEBELUM mulai menyambung
  WiFi.setHostname(NAMA_PERANGKAT);  // nama di daftar perangkat router (Praktik 9)
  WiFi.mode(WIFI_STA);               // wajib sebelum bertanya "sudah ada WiFi tersimpan?"

  uint8_t mac[6];
  esp_read_mac(mac, ESP_MAC_WIFI_STA);  // WiFi.macAddress() masih 00:00:... selama WiFi belum selesai menyala
  snprintf(idPerangkat, sizeof(idPerangkat), "%02x%02x%02x%02x%02x%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  snprintf(alamatKirim, sizeof(alamatKirim), "%s/rpm/%s/telemetry", ALAMAT_SERVER, idPerangkat);
  logInfo("device_id %s", idPerangkat);

  if (PAKAI_WOKWI) {
    logInfo("Mode Wokwi: menyambung ke Wokwi-GUEST, tanpa portal.");
    WiFi.begin("Wokwi-GUEST", "", 6);  // 6 = kanal Wokwi-GUEST, supaya lebih cepat
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
  siapkanServerWeb();
}

// Sekali saja, saat pertama tersambung: jam internet (Praktik 5) dan nama node1.local (Praktik 9).
static void mulaiLayanan() {
  configTzTime(ZONA_WAKTU, "pool.ntp.org", "asia.pool.ntp.org");
  if (MDNS.begin(NAMA_PERANGKAT)) {
    MDNS.addService("http", "tcp", 80);
  }
  layananSudahMulai = true;
  logInfo("Buka di HP: http://%s/ atau http://%s.local/ (sering gagal di HP Android)",
          WiFi.localIP().toString().c_str(), NAMA_PERANGKAT);
}

// Penjaga (Konsep 4): kalau lama sekali tidak ada percobaan menyambung, suruh paket esp32 mencoba lagi.
static void jagaSambungan() {
  if (tersambung || !punyaWiFi) {
    return;
  }
  unsigned long peristiwaTerakhir = waktuPeristiwaTerakhir;  // salin DULU: petugas WiFi bisa mengubahnya kapan saja
  unsigned long sekarang = millis();                         // baru baca jam, jadi sekarang >= peristiwaTerakhir
  if (sekarang - peristiwaTerakhir >= BATAS_TANPA_PERCOBAAN
      && sekarang - waktuPenjagaTerakhir >= BATAS_TANPA_PERCOBAAN) {
    waktuPenjagaTerakhir = sekarang;
    logInfo("Penjaga WiFi: %lu detik tanpa percobaan baru, mencoba menyambung lagi.", BATAS_TANPA_PERCOBAAN / 1000);
    WiFi.reconnect();
  }
}

void perbaruiJaringan() {
  if (benderaPutus) {  // putus selalu terjadi sebelum tersambung lagi, jadi ditangani dulu
    benderaPutus = false;
    if (tersambung) {  // baru saja putus; percobaan ulang yang gagal tidak dilaporkan satu per satu
      tersambung = false;
      waktuPutus = millis();
      logError("WiFi PUTUS (alasan %u: %s). Node 1 tetap bekerja; paket esp32 mencoba menyambung lagi.", alasanPutus,
               namaAlasan(alasanPutus));
    }
  }
  if (benderaDapatIp) {
    benderaDapatIp = false;
    if (WiFi.status() == WL_CONNECTED) {  // masih tersambung saat bendera diturunkan?
      tersambung = true;
      if (waktuPutus == 0) {
        logInfo("WiFi tersambung ke \"%s\": IP %s, sinyal %d dBm", WiFi.SSID().c_str(),
                WiFi.localIP().toString().c_str(), WiFi.RSSI());
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
  server.handleClient();  // layani browser yang mengetuk, lalu langsung kembali
}

// ---------- Kirim bacaan ke server (Praktik 7) ----------
// Menjawab false kalau kiriman tidak dicoba karena WiFi belum tersambung atau jam belum disetel.
static bool kirimKeServer() {
  char ts[21];
  if (!tersambung || !buatTs(ts, sizeof(ts))) {
    return false;  // setiap data wajib membawa ts (Lampiran A): tunggu sampai jam disetel
  }
  JsonDocument dokumen;
  dokumen["ts"] = ts;
  dokumen["fw"] = VERSI_FIRMWARE;
  dokumen["suhu"] = bacaanKirim.suhu;  // NAN ditulis ArduinoJson sebagai null
  dokumen["kelembapan"] = bacaanKirim.kelembapan;
  dokumen["cahaya"] = bacaanKirim.cahaya;
  dokumen["tanah"] = bacaanKirim.tanah;
  dokumen["gerak"] = bacaanKirim.gerak;
  dokumen["level_air"] = bacaanKirim.level_air;
  char isi[192];
  serializeJson(dokumen, isi, sizeof(isi));

  HTTPClient http;
  http.setConnectTimeout(BATAS_WAKTU_HTTP);
  http.setTimeout(BATAS_WAKTU_HTTP);
  http.begin(alamatKirim);
  http.addHeader("Content-Type", "application/json");
  unsigned long mulai = millis();
  int kode = http.POST(isi);
  http.end();
  kodeKirimTerakhir = kode;
  if (kode == 200) {
    logInfo("Terkirim ke server (kode 200, %lu ms)", millis() - mulai);
  } else if (kode > 0) {
    logError("Server menjawab kode %d. Alamatnya benar? %s", kode, alamatKirim);
  } else {
    logError("Gagal kirim: %s (kode %d). Penerima di laptop menyala?", HTTPClient::errorToString(kode).c_str(), kode);
  }
  logDebug("Isi kiriman: %s", isi);
  return true;
}

void kirimBacaan(BacaanSensor b) {
  bacaanKirim = b;
  adaBacaan = true;
  if (sudahPernahKirim && millis() - waktuKirimTerakhir < JEDA_KIRIM) {
    return;  // belum waktunya
  }
  if (kirimKeServer()) {
    sudahPernahKirim = true;
    waktuKirimTerakhir = millis();
  }
}

void kirimSekarang() {
  if (!adaBacaan) {
    Serial.println("kirim: belum ada bacaan, coba lagi 2 detik kemudian.");
    return;
  }
  if (!kirimKeServer()) {
    Serial.println("kirim: belum bisa, WiFi belum tersambung atau jam belum disetel.");
    return;
  }
  sudahPernahKirim = true;
  waktuKirimTerakhir = millis();
}

// ---------- Untuk layar dan perintah Serial ----------
const char* teksJaringan() {
  static char teks[16];  // alamat IP terpanjang "255.255.255.255" = 15 huruf
  if (tersambung) {
    snprintf(teks, sizeof(teks), "%s", WiFi.localIP().toString().c_str());
    return teks;
  }
  if (punyaWiFi) {
    return "putus";
  }
  return "mati";
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
  Serial.printf("wifi: kirim ke %s setiap %lu detik, kode terakhir %d\n", alamatKirim, JEDA_KIRIM / 1000,
                kodeKirimTerakhir);
}

void lupakanWiFi() {
  Serial.println("WiFi tersimpan dihapus. Restart sekarang; portal WiFi akan terbuka.");
  Serial.flush();
  WiFi.disconnect(true, true);  // true, true = matikan radio DAN hapus WiFi tersimpan dari NVS
  delay(500);
  ESP.restart();
}
