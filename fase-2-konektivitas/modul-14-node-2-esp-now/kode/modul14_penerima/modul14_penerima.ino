// Modul 14 - Kemenangan Cepat, papan PENERIMA (papan Node 1).
// Mencetak alamat MAC papan ini, lalu menampilkan setiap paket ESP-NOW yang tiba.
// Tanpa router dan tanpa kata sandi: radio WiFi menyala sebagai stasiun (STA), tetapi tidak tersambung ke mana pun.
// Butuh paket esp32 versi 3.3.7 atau lebih baru (modul ini memakai 3.3.12).

#include <WiFi.h>
#include <esp_now.h>
#include <esp_mac.h>

// Satu paket yang dititipkan "petugas WiFi" kepada loop().
struct Kiriman {
  uint8_t mac[6];  // alamat pengirim
  int8_t rssi;     // kekuatan sinyal, dBm (makin dekat ke 0, makin kuat)
  int panjang;     // jumlah byte yang tiba
  char isi[64];    // isinya, sebagai teks
};

QueueHandle_t kotakSurat;  // antrean FreeRTOS: dari petugas WiFi ke loop()
unsigned long jumlahPaket = 0;

// Dipanggil petugas WiFi (bukan loop()) setiap kali paket tiba. Cukup menyalin, menitipkan, selesai.
void saatDiterima(const esp_now_recv_info_t *info, const uint8_t *data, int panjang) {
  Kiriman k;
  memcpy(k.mac, info->src_addr, 6);
  k.rssi = info->rx_ctrl->rssi;
  k.panjang = panjang;
  int salin = panjang < 63 ? panjang : 63;
  memcpy(k.isi, data, salin);
  k.isi[salin] = '\0';
  xQueueSend(kotakSurat, &k, 0);  // 0 = jangan menunggu; kalau kotak penuh, paket ini dilewatkan
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  kotakSurat = xQueueCreate(8, sizeof(Kiriman));
  WiFi.mode(WIFI_STA);  // radio menyala, tetapi tidak tersambung ke router mana pun

  uint8_t mac[6];
  esp_read_mac(mac, ESP_MAC_WIFI_STA);
  Serial.println();
  Serial.printf("MAC papan ini: %02X:%02X:%02X:%02X:%02X:%02X\n", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  Serial.printf("Salin baris ini ke sketsa pengirim: {0x%02X, 0x%02X, 0x%02X, 0x%02X, 0x%02X, 0x%02X}\n", mac[0], mac[1],
                mac[2], mac[3], mac[4], mac[5]);

  if (esp_now_init() != ESP_OK) {
    Serial.println("ESP-NOW gagal dimulai. Tekan tombol EN untuk mencoba lagi.");
    return;
  }
  esp_now_register_recv_cb(saatDiterima);
  Serial.printf("Menunggu paket ESP-NOW di channel %d...\n", WiFi.channel());
}

void loop() {
  Kiriman k;
  while (xQueueReceive(kotakSurat, &k, 0) == pdTRUE) {  // ambil semua titipan yang sudah ada
    jumlahPaket++;
    Serial.printf("Paket ke-%lu dari %02X:%02X:%02X:%02X:%02X:%02X, %d byte, sinyal %d dBm: \"%s\"\n", jumlahPaket,
                  k.mac[0], k.mac[1], k.mac[2], k.mac[3], k.mac[4], k.mac[5], k.panjang, k.rssi, k.isi);
  }
}
