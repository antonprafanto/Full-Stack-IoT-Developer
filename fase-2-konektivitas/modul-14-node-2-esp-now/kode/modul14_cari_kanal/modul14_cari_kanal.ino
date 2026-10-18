// Modul 14 - Praktik 1, papan PENGIRIM (papan Node 2): mencari channel router dengan memindai NAMA WiFi rumah,
// menyimpannya di memori RTC, lalu bangun-kirim-tidur setiap 10 detik.
// Node 2 TIDAK butuh kata sandi WiFi: cukup nama WiFi, hanya untuk tahu channel mana yang dipakai router (dan Node 1).
// Butuh paket esp32 versi 3.3.7 atau lebih baru (modul ini memakai 3.3.12).

#include <WiFi.h>
#include <esp_now.h>

// GANTI dua baris ini:
const uint8_t MAC_PENERIMA[6] = {0xA4, 0xCF, 0x12, 0xE5, 0xB7, 0xC0};  // MAC papan Node 1
const char NAMA_WIFI[] = "NamaWiFiRumahmu";                              // nama (SSID) WiFi rumah, persis

const int GAGAL_SEBELUM_PINDAI = 2;  // setelah 2 kali bangun gagal berturut-turut, cari channel lagi
const uint64_t TIDUR_DETIK = 10;     // pendek supaya cepat terlihat; Node 2 sungguhan 300 detik

// Ingatan RTC: selamat dari deep sleep, hilang kalau papan dicabut atau tombol EN ditekan (Modul 9).
RTC_DATA_ATTR uint8_t kanal = 0;  // 0 = belum tahu
RTC_DATA_ATTR uint8_t gagalBeruntun = 0;
RTC_DATA_ATTR uint32_t nomor = 0;

volatile bool kirimSelesai = false;
volatile bool adaAck = false;

void saatTerkirim(const esp_now_send_info_t *info, esp_now_send_status_t status) {
  adaAck = (status == ESP_NOW_SEND_SUCCESS);
  kirimSelesai = true;
}

// Memindai satu nama WiFi saja. Hasilnya channel router itu, atau 0 kalau tidak ditemukan.
uint8_t cariKanal() {
  unsigned long mulai = millis();
  int jumlah = WiFi.scanNetworks(false, false, false, 120, 0, NAMA_WIFI);
  uint8_t hasil = 0;
  for (int i = 0; i < jumlah; i++) {
    if (WiFi.SSID(i) == NAMA_WIFI) {
      hasil = WiFi.channel(i);
      break;
    }
  }
  WiFi.scanDelete();
  if (hasil != 0) {
    Serial.printf("Memindai \"%s\": ketemu di channel %u (%lu ms).\n", NAMA_WIFI, hasil, millis() - mulai);
  } else {
    Serial.printf("Memindai \"%s\": tidak ditemukan (%lu ms).\n", NAMA_WIFI, millis() - mulai);
  }
  return hasil;
}

bool kirimSapaan() {
  if (WiFi.setChannel(kanal) != ESP_OK) {
    Serial.printf("Channel %u ditolak ESP32. Router di channel 12 atau 13? Ubah router ke 1, 6, atau 11.\n", kanal);
    return false;
  }
  if (esp_now_init() != ESP_OK) {
    return false;
  }
  esp_now_register_send_cb(saatTerkirim);
  esp_now_peer_info_t peer = {};
  memcpy(peer.peer_addr, MAC_PENERIMA, 6);
  peer.channel = 0;  // 0 = channel radio saat ini (yang baru saja dipasang)
  peer.ifidx = WIFI_IF_STA;
  peer.encrypt = false;
  if (esp_now_add_peer(&peer) != ESP_OK) {
    return false;
  }
  char isi[32];
  snprintf(isi, sizeof(isi), "halo dari kebun #%lu", (unsigned long)nomor);
  kirimSelesai = false;
  if (esp_now_send(MAC_PENERIMA, (const uint8_t *)isi, strlen(isi) + 1) != ESP_OK) {
    return false;
  }
  unsigned long mulai = millis();
  while (!kirimSelesai && millis() - mulai < 200) {  // jangan menunggu selamanya: Node 2 harus tetap bisa tidur
    delay(1);
  }
  return kirimSelesai && adaAck;
}

void setup() {
  Serial.begin(115200);
  delay(200);
  nomor++;
  WiFi.persistent(false);  // setelan WiFi cukup di RAM: memori flash tidak ditulis setiap bangun
  WiFi.mode(WIFI_STA);     // radio menyala, TANPA WiFi.begin(): Node 2 tidak pernah tersambung ke router

  if (kanal == 0 || gagalBeruntun >= GAGAL_SEBELUM_PINDAI) {
    uint8_t baru = cariKanal();
    if (baru != 0) {
      kanal = baru;  // tidak ketemu (router mati)? Channel lama dipertahankan: Node 1 masih menunggu di sana
    }
    gagalBeruntun = 0;
  } else {
    Serial.printf("Channel %u diambil dari ingatan RTC, tanpa memindai.\n", kanal);
  }

  bool berhasil = (kanal != 0) && kirimSapaan();
  gagalBeruntun = berhasil ? 0 : gagalBeruntun + 1;
  Serial.printf("Bangun ke-%lu: %s di channel %u (gagal beruntun: %u). Bangun %lu ms, tidur %lu detik.\n",
                (unsigned long)nomor, berhasil ? "terkirim, ada ACK" : "GAGAL", kanal, gagalBeruntun, millis(),
                (unsigned long)TIDUR_DETIK);
  Serial.flush();

  esp_now_deinit();
  WiFi.mode(WIFI_OFF);  // matikan radio sebelum tidur
  esp_sleep_enable_timer_wakeup(TIDUR_DETIK * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {
  // Tidak pernah dijalankan: setiap bangun dari deep sleep, papan mulai lagi dari setup().
}
