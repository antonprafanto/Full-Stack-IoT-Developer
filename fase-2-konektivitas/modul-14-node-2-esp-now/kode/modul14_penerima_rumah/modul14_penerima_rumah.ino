// Modul 14 - Praktik 1, papan PENERIMA (papan Node 1): tersambung ke WiFi rumah seperti Node 1,
// sambil tetap mendengarkan paket ESP-NOW. Channel radionya sekarang DITENTUKAN ROUTER.
// Tidak ada kata sandi di sketsa ini: WiFi.begin() tanpa isi memakai WiFi yang tersimpan di papan
// sejak portal WiFi Modul 10 (Node 1 menyimpannya di NVS).
// Butuh paket esp32 versi 3.3.7 atau lebih baru (modul ini memakai 3.3.12).

#include <WiFi.h>
#include <esp_now.h>
#include <esp_mac.h>

struct Kiriman {
  uint8_t mac[6];
  int8_t rssi;
  uint8_t kanal;  // channel tempat paket ini diterima
  int panjang;
  char isi[64];
};

QueueHandle_t kotakSurat;
unsigned long jumlahPaket = 0;

void saatDiterima(const esp_now_recv_info_t *info, const uint8_t *data, int panjang) {
  Kiriman k;
  memcpy(k.mac, info->src_addr, 6);
  k.rssi = info->rx_ctrl->rssi;
  k.kanal = info->rx_ctrl->channel;
  k.panjang = panjang;
  int salin = panjang < 63 ? panjang : 63;
  memcpy(k.isi, data, salin);
  k.isi[salin] = '\0';
  xQueueSend(kotakSurat, &k, 0);
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  kotakSurat = xQueueCreate(8, sizeof(Kiriman));
  WiFi.setSleep(false);  // radio selalu mendengar (bukan modem sleep); dipasang SEBELUM WiFi.mode()
  WiFi.mode(WIFI_STA);

  uint8_t mac[6];
  esp_read_mac(mac, ESP_MAC_WIFI_STA);
  Serial.println();
  Serial.printf("MAC papan ini: %02X:%02X:%02X:%02X:%02X:%02X\n", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);

  WiFi.begin();  // tanpa nama dan kata sandi: pakai WiFi yang tersimpan di papan ini
  Serial.print("Menyambung ke WiFi rumah yang tersimpan");
  unsigned long mulai = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - mulai < 20000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("Tersambung ke \"%s\". Router memakai channel %d.\n", WiFi.SSID().c_str(), WiFi.channel());
  } else {
    Serial.println("Belum tersambung. Belum ada WiFi tersimpan? Unggah lagi Node 1 v1.2.1, isi portal WiFi");
    Serial.println("(Modul 10), lalu unggah sketsa ini lagi. Sementara itu radio tetap di channel 1.");
  }

  if (esp_now_init() != ESP_OK) {
    Serial.println("ESP-NOW gagal dimulai. Tekan tombol EN untuk mencoba lagi.");
    return;
  }
  esp_now_register_recv_cb(saatDiterima);
  Serial.printf("Menunggu paket ESP-NOW di channel %d...\n", WiFi.channel());
}

void loop() {
  Kiriman k;
  while (xQueueReceive(kotakSurat, &k, 0) == pdTRUE) {
    jumlahPaket++;
    Serial.printf("Paket ke-%lu dari %02X:%02X:%02X:%02X:%02X:%02X di channel %u, sinyal %d dBm: \"%s\"\n", jumlahPaket,
                  k.mac[0], k.mac[1], k.mac[2], k.mac[3], k.mac[4], k.mac[5], k.kanal, k.rssi, k.isi);
  }
}
