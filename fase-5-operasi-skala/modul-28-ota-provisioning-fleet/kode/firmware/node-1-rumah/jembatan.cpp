// jembatan.cpp - isi modul jembatan Node 2 (Modul 14). Daftar fungsinya ada di jembatan.h.
#include <Arduino.h>
#include <WiFi.h>
#include <esp_now.h>  // ESP-NOW bawaan paket esp32 (ESP-IDF)
#include <ArduinoJson.h>
#include <time.h>
#include "konfigurasi.h"
#include "pencatat.h"
#include "jaringan.h"
#include "paket-node2.h"
#include "jembatan.h"

// Praktik 8: kunci enkripsi ESP-NOW ada di kunci.h, yang TIDAK ikut ke GitHub (.gitignore).
// Selama file itu belum ada, ESP-NOW berjalan tanpa enkripsi.
#if __has_include("kunci.h")
#include "kunci.h"
#else
const bool PAKAI_ENKRIPSI = false;
const char KUNCI_PMK[] = "";
const char KUNCI_LMK[] = "";
#endif
static_assert(!PAKAI_ENKRIPSI || sizeof(KUNCI_PMK) == 17, "KUNCI_PMK di kunci.h harus tepat 16 huruf/angka");
static_assert(!PAKAI_ENKRIPSI || sizeof(KUNCI_LMK) == 17, "KUNCI_LMK di kunci.h harus tepat 16 huruf/angka");

// Satu paket yang baru tiba, dititipkan petugas WiFi kepada loop() lewat kotak surat (antrean FreeRTOS).
struct PaketMasuk {
  PaketNode2 isi;
  uint8_t mac[6];       // alamat pengirim, dari kepala paket radio
  int8_t rssi;          // kekuatan sinyal paket ini, dBm
  uint32_t diterimaMs;  // millis() saat paket tiba: dasar cap waktu ts
};

// Satu bacaan Node 2 yang menunggu diterbitkan (misalnya selama router mati).
struct BacaanTertunda {
  PaketNode2 isi;
  uint32_t diterimaMs;
};

static QueueHandle_t kotakSurat = nullptr;          // petugas WiFi -> loop()
static volatile uint32_t jumlahDibuangPetugas = 0;  // paket siaran, ukuran paket salah, atau kotak surat penuh

static BacaanTertunda rakTunggu[ANTREAN_NODE2];  // bacaan yang belum terbit; yang tertua di laciTertua
static int laciTertua = 0;
static int banyakTunggu = 0;

static char idNode2[13] = "";  // device_id Node 2: 12 heksadesimal huruf kecil + tanda akhir teks
static char topikTelemetryNode2[40] = "";
static char topikStatusNode2[40] = "";

static uint32_t jumlahDiterima = 0;  // paket sah, tanpa dobel
static uint32_t jumlahDobel = 0;     // kiriman ulang Node 2 yang sebenarnya sudah diterima
static uint32_t jumlahHilang = 0;    // nomor urutan yang terlewat
static uint32_t jumlahDitolak = 0;   // bukan dari MAC_NODE2, atau tanda/versi salah
static uint32_t jumlahTerbit = 0;
static uint32_t jumlahTergusur = 0;  // bacaan tertua yang terpaksa dibuang karena rak tunggu penuh
static unsigned long waktuTolakTerakhir = 0;

static bool pernahDengar = false;
static uint16_t sesiTerakhir = 0;
static uint32_t urutanTerakhir = 0;
static unsigned long waktuDengarTerakhir = 0;  // millis() paket sah terakhir (atau saat Node 1 menyala)
static uint16_t jedaNode2 = 300;               // detik; diperbarui dari setiap paket
static int8_t rssiTerakhir = 0;
static uint8_t percobaanTerakhir = 0;

enum KeadaanNode2 { BELUM_TAHU, ONLINE, OFFLINE };
static KeadaanNode2 keadaanNode2 = BELUM_TAHU;
static bool statusPerluTerbit = false;
static bool mqttSiapTadi = false;

// Dipanggil petugas WiFi, BUKAN loop(): sesingkat mungkin. Salin, titipkan ke kotak surat, selesai.
// Jangan Serial.print(), jangan mqtt.publish() di sini (ESP-IDF: "do not do lengthy operations").
static void saatTerimaEspNow(const esp_now_recv_info_t* info, const uint8_t* data, int panjang) {
  // Paket siaran (alamat tujuan FF:FF:FF:FF:FF:FF) tidak pernah terenkripsi, jadi peniru bisa memakainya:
  // buang. Bit terendah byte pertama alamat tujuan bernilai 1 hanya pada alamat siaran dan alamat kelompok.
  if ((info->des_addr[0] & 0x01) || panjang != (int)sizeof(PaketNode2)) {
    jumlahDibuangPetugas = jumlahDibuangPetugas + 1;  // bukan ++: C++20 memperingatkan ++ pada volatile
    return;
  }
  PaketMasuk p;
  memcpy(&p.isi, data, sizeof(PaketNode2));
  memcpy(p.mac, info->src_addr, 6);
  p.rssi = info->rx_ctrl->rssi;
  p.diterimaMs = millis();
  if (xQueueSend(kotakSurat, &p, 0) != pdTRUE) {  // 0 = jangan menunggu; kotak penuh = paket dibuang
    jumlahDibuangPetugas = jumlahDibuangPetugas + 1;
  }
}

static void simpanKeRak(const PaketNode2& isi, uint32_t diterimaMs) {
  if (banyakTunggu == ANTREAN_NODE2) {  // rak penuh: buang bacaan tertua supaya yang terbaru tetap tersimpan
    laciTertua = (laciTertua + 1) % ANTREAN_NODE2;
    banyakTunggu--;
    jumlahTergusur++;
  }
  int laci = (laciTertua + banyakTunggu) % ANTREAN_NODE2;
  rakTunggu[laci].isi = isi;
  rakTunggu[laci].diterimaMs = diterimaMs;
  banyakTunggu++;
}

static void terimaPaket(const PaketMasuk& p) {
  if (memcmp(p.mac, MAC_NODE2, 6) != 0) {
    jumlahDitolak++;
    if (waktuTolakTerakhir == 0 || millis() - waktuTolakTerakhir >= 60000) {  // paling sering sekali semenit
      waktuTolakTerakhir = millis();
      logInfo("ESP-NOW dari %02x%02x%02x%02x%02x%02x ditolak: bukan MAC_NODE2 di konfigurasi.h.", p.mac[0], p.mac[1],
              p.mac[2], p.mac[3], p.mac[4], p.mac[5]);
    }
    return;
  }
  if (p.isi.tanda != PAKET_TANDA || p.isi.versi != PAKET_VERSI) {
    jumlahDitolak++;
    logError("Paket Node 2 bertanda 0x%02X versi %u ditolak: samakan paket-node2.h di kedua firmware.", p.isi.tanda,
             p.isi.versi);
    return;
  }
  if (pernahDengar && p.isi.sesi == sesiTerakhir) {
    if (p.isi.urutan <= urutanTerakhir) {  // kiriman ulang (ACK sempat hilang): sudah diterima, buang
      jumlahDobel++;
      return;
    }
    jumlahHilang += p.isi.urutan - urutanTerakhir - 1;  // nomor yang terlewat = paket yang hilang
  } else if (pernahDengar) {
    logInfo("Node 2 menyala ulang (sesi baru %u): hitungan urutan dimulai lagi.", p.isi.sesi);
  }
  pernahDengar = true;
  sesiTerakhir = p.isi.sesi;
  urutanTerakhir = p.isi.urutan;
  waktuDengarTerakhir = p.diterimaMs;
  jedaNode2 = p.isi.jedaDetik > 0 ? p.isi.jedaDetik : 300;
  rssiTerakhir = p.rssi;
  percobaanTerakhir = p.isi.percobaan;
  jumlahDiterima++;
  simpanKeRak(p.isi, p.diterimaMs);
  logInfo("Node 2: paket #%lu diterima (percobaan ke-%u, sinyal %d dBm).", (unsigned long)p.isi.urutan,
          p.isi.percobaan, p.rssi);
  if (keadaanNode2 != ONLINE) {
    keadaanNode2 = ONLINE;
    statusPerluTerbit = true;
    logInfo("Node 2 ONLINE.");
  }
}

static void periksaOffline() {
  if (keadaanNode2 == OFFLINE) {
    return;
  }
  unsigned long batas = 3UL * jedaNode2 * 1000UL + CADANGAN_OFFLINE_NODE2;  // 3 x jeda + 1 menit
  if (millis() - waktuDengarTerakhir >= batas) {
    keadaanNode2 = OFFLINE;
    statusPerluTerbit = true;
    logError("Node 2 OFFLINE: tidak ada paket selama %lu detik.", batas / 1000);
  }
}

static float bulat1(float x) {  // satu angka di belakang koma (kontrak data); NAN tetap NAN
  return isnan(x) ? NAN : roundf(x * 10.0f) / 10.0f;
}

// Menyusun JSON telemetry Node 2 menurut kontrak data 1.1. Menjawab false kalau jam Node 1 belum disetel.
static bool buatJsonNode2(const BacaanTertunda& b, char* isi, size_t ukuran) {
  time_t sekarang = time(nullptr);
  time_t waktuBacaan = sekarang - (time_t)((millis() - b.diterimaMs) / 1000);  // mundur sebanyak umur bacaan
  struct tm utc;
  gmtime_r(&waktuBacaan, &utc);
  if (utc.tm_year + 1900 < 2025) {
    return false;  // jam belum disetel dari internet: setiap data wajib membawa ts
  }
  char ts[21];
  strftime(ts, sizeof(ts), "%Y-%m-%dT%H:%M:%SZ", &utc);
  char fw[12];
  snprintf(fw, sizeof(fw), "%u.%u.%u", b.isi.fw[0], b.isi.fw[1], b.isi.fw[2]);  // versi firmware NODE 2, bukan Node 1

  JsonDocument dokumen;
  dokumen["ts"] = ts;
  dokumen["fw"] = fw;
  dokumen["suhu"] = bulat1(b.isi.suhu);  // NAN ditulis ArduinoJson sebagai null
  if (isnan(b.isi.kelembapan)) {
    dokumen["kelembapan"] = nullptr;
  } else {
    dokumen["kelembapan"] = (int)lroundf(b.isi.kelembapan);
  }
  dokumen["tekanan"] = bulat1(b.isi.tekanan);
  dokumen["suhu_tanah"] = bulat1(b.isi.suhuTanah);
  if (b.isi.tanah < 0) {
    dokumen["tanah"] = nullptr;  // -1 = sensor tanah tidak terbaca
  } else {
    dokumen["tanah"] = b.isi.tanah;
  }
  if (b.isi.bateraiMv > 0) {  // kolom pilihan: hanya kalau Node 2 mengukur baterainya
    dokumen["baterai"] = roundf(b.isi.bateraiMv / 10.0f) / 100.0f;  // volt, dua angka di belakang koma
  }
  size_t panjang = serializeJson(dokumen, isi, ukuran);
  return panjang < ukuran;
}

static void terbitkanRak() {
  for (int i = 0; i < 3 && banyakTunggu > 0; i++) {  // paling banyak 3 per putaran: loop() tetap lincah
    char isi[192];
    if (!buatJsonNode2(rakTunggu[laciTertua], isi, sizeof(isi))) {
      return;  // jam belum disetel: coba lagi nanti
    }
    if (!terbitkan(topikTelemetryNode2, isi, false)) {
      return;  // broker putus di tengah jalan: bacaan tetap di rak
    }
    laciTertua = (laciTertua + 1) % ANTREAN_NODE2;
    banyakTunggu--;
    jumlahTerbit++;
    logDebug("Terbit telemetry Node 2: %s", isi);
  }
}

// Mode Wokwi: di simulator tidak ada Node 2 sungguhan, jadi loop() sendiri menitipkan paket "Node 2 tiruan"
// ke kotak surat yang sama setiap 30 detik. Sisa jembatannya (rak tunggu, ts, MQTT) bekerja persis sama.
static void tiruNode2() {
  static unsigned long waktuTiruan = 0;
  static uint32_t urutanTiruan = 0;
  if (waktuTiruan != 0 && millis() - waktuTiruan < 30000) {
    return;
  }
  waktuTiruan = millis();
  urutanTiruan++;
  if (urutanTiruan % 10 == 7) {
    return;  // sesekali "hilang di udara", supaya hitungan hilang di perintah node2 ikut teruji
  }
  float gelombang = sinf(urutanTiruan / 4.0f);
  PaketMasuk p = {};
  p.isi.tanda = PAKET_TANDA;
  p.isi.versi = PAKET_VERSI;
  p.isi.fw[0] = 1;
  p.isi.fw[1] = 0;
  p.isi.fw[2] = 0;
  p.isi.sesi = 0x7A11;
  p.isi.urutan = urutanTiruan;
  p.isi.jedaDetik = 30;
  p.isi.percobaan = 1;
  p.isi.suhu = 29.0f + 2.0f * gelombang;
  p.isi.kelembapan = 75.0f - 6.0f * gelombang;
  p.isi.tekanan = 1008.6f;
  p.isi.suhuTanah = 27.0f + gelombang;
  p.isi.tanah = 41;
  p.isi.bateraiMv = 3920;
  memcpy(p.mac, MAC_NODE2, 6);
  p.rssi = -58;
  p.diterimaMs = millis();
  xQueueSend(kotakSurat, &p, 0);
}

void siapkanJembatan() {
  snprintf(idNode2, sizeof(idNode2), "%02x%02x%02x%02x%02x%02x", MAC_NODE2[0], MAC_NODE2[1], MAC_NODE2[2],
           MAC_NODE2[3], MAC_NODE2[4], MAC_NODE2[5]);
  snprintf(topikTelemetryNode2, sizeof(topikTelemetryNode2), "rpm/%s/telemetry", idNode2);
  snprintf(topikStatusNode2, sizeof(topikStatusNode2), "rpm/%s/status", idNode2);
  kotakSurat = xQueueCreate(8, sizeof(PaketMasuk));
  waktuDengarTerakhir = millis();  // batas "offline" dihitung sejak Node 1 menyala kalau Node 2 belum terdengar
  if (kotakSurat == nullptr || esp_now_init() != ESP_OK) {
    logError("ESP-NOW gagal dimulai: Node 2 tidak akan terdengar.");
    return;
  }
  if (PAKAI_ENKRIPSI) {  // Praktik 8: Node 2 didaftarkan sebagai pasangan berkunci
    esp_now_set_pmk((const uint8_t*)KUNCI_PMK);
    esp_now_peer_info_t peer = {};
    memcpy(peer.peer_addr, MAC_NODE2, 6);
    peer.channel = 0;  // 0 = channel radio saat ini (channel router)
    peer.ifidx = WIFI_IF_STA;
    peer.encrypt = true;
    memcpy(peer.lmk, KUNCI_LMK, ESP_NOW_KEY_LEN);
    if (esp_now_add_peer(&peer) != ESP_OK) {
      logError("Gagal mendaftarkan Node 2 sebagai pasangan berkunci.");
    }
  }
  esp_now_register_recv_cb(saatTerimaEspNow);
  logInfo("Jembatan Node 2 siap: mendengar ESP-NOW dari %s, enkripsi %s.", idNode2, PAKAI_ENKRIPSI ? "nyala" : "mati");
  if (PAKAI_WOKWI) {
    logInfo("Mode Wokwi: Node 2 tiruan mengirim paket setiap 30 detik.");
  }
}

void perbaruiJembatan() {
  if (kotakSurat == nullptr) {
    return;
  }
  if (PAKAI_WOKWI) {
    tiruNode2();
  }
  PaketMasuk p;
  while (xQueueReceive(kotakSurat, &p, 0) == pdTRUE) {  // 0 = ambil yang sudah ada saja, tidak menunggu
    terimaPaket(p);
  }
  periksaOffline();

  bool siap = mqttSiap();
  if (siap && !mqttSiapTadi && keadaanNode2 != BELUM_TAHU) {
    statusPerluTerbit = true;  // broker baru tersambung (lagi): ulangi status Node 2 yang terakhir diketahui
  }
  mqttSiapTadi = siap;
  if (!siap) {
    return;  // bacaan menunggu di rak sampai broker terjangkau lagi
  }
  if (statusPerluTerbit && keadaanNode2 != BELUM_TAHU) {
    if (terbitkan(topikStatusNode2, keadaanNode2 == ONLINE ? "online" : "offline", true)) {  // retained
      statusPerluTerbit = false;
    }
  }
  terbitkanRak();
}

void cetakInfoNode2() {
  const char* teks = keadaanNode2 == ONLINE ? "online" : (keadaanNode2 == OFFLINE ? "OFFLINE" : "belum terdengar");
  Serial.printf("node2: device_id %s, %s, channel radio %ld, enkripsi %s\n", idNode2, teks, (long)WiFi.channel(),
                PAKAI_ENKRIPSI ? "nyala" : "mati");
  Serial.printf("node2: diterima %lu, hilang %lu, dobel %lu, ditolak %lu, dibuang %lu\n",
                (unsigned long)jumlahDiterima, (unsigned long)jumlahHilang, (unsigned long)jumlahDobel,
                (unsigned long)jumlahDitolak, (unsigned long)jumlahDibuangPetugas);
  if (jumlahDiterima + jumlahHilang > 0) {
    Serial.printf("node2: paket tiba %.1f %%\n", 100.0 * jumlahDiterima / (jumlahDiterima + jumlahHilang));
  }
  Serial.printf("node2: terbit %lu, menunggu di rak %d dari %d, tergusur %lu\n", (unsigned long)jumlahTerbit,
                banyakTunggu, ANTREAN_NODE2, (unsigned long)jumlahTergusur);
  if (pernahDengar) {
    Serial.printf("node2: paket terakhir #%lu, %lu detik lalu, percobaan ke-%u, sinyal %d dBm, jeda %u detik\n",
                  (unsigned long)urutanTerakhir, (millis() - waktuDengarTerakhir) / 1000, percobaanTerakhir,
                  rssiTerakhir, jedaNode2);
  }
}

void nolkanHitunganNode2() {
  jumlahDiterima = 0;
  jumlahDobel = 0;
  jumlahHilang = 0;
  jumlahDitolak = 0;
  jumlahDibuangPetugas = 0;
  jumlahTerbit = 0;
  jumlahTergusur = 0;
  Serial.println("node2: semua hitungan kembali ke nol (urutan terakhir tetap diingat).");
}
