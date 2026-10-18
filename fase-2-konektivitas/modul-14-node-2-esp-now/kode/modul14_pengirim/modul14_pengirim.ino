// Modul 14 - Kemenangan Cepat, papan PENGIRIM (papan Node 2).
// Setiap 2 detik mengirim sapaan lewat ESP-NOW langsung ke alamat MAC papan penerima,
// lalu melaporkan apakah radio penerima membalas "sudah terima" (ACK).
// Butuh paket esp32 versi 3.3.7 atau lebih baru (modul ini memakai 3.3.12).

#include <WiFi.h>
#include <esp_now.h>

// GANTI dengan baris "Salin baris ini ke sketsa pengirim" dari Serial Monitor papan penerima:
const uint8_t MAC_PENERIMA[6] = {0xA4, 0xCF, 0x12, 0xE5, 0xB7, 0xC0};

volatile bool kirimSelesai = false;  // diisi petugas WiFi, dibaca loop()
volatile bool adaAck = false;
unsigned long nomor = 0;

// Dipanggil petugas WiFi setelah radio tahu nasib paketnya: ada ACK dari penerima, atau tidak.
void saatTerkirim(const esp_now_send_info_t *info, esp_now_send_status_t status) {
  adaAck = (status == ESP_NOW_SEND_SUCCESS);
  kirimSelesai = true;
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  WiFi.mode(WIFI_STA);  // radio menyala, tanpa router
  if (esp_now_init() != ESP_OK) {
    Serial.println("ESP-NOW gagal dimulai. Tekan tombol EN untuk mencoba lagi.");
    return;
  }
  esp_now_register_send_cb(saatTerkirim);

  esp_now_peer_info_t peer = {};  // "buku alamat": semua kolom dinolkan dulu
  memcpy(peer.peer_addr, MAC_PENERIMA, 6);
  peer.channel = 0;          // 0 = channel yang sedang dipakai radio papan ini
  peer.ifidx = WIFI_IF_STA;  // kirim lewat antarmuka stasiun (STA)
  peer.encrypt = false;      // tanpa enkripsi dulu (Praktik 8)
  if (esp_now_add_peer(&peer) != ESP_OK) {
    Serial.println("Gagal menambah alamat penerima. Periksa isi MAC_PENERIMA.");
    return;
  }
  Serial.println();
  Serial.printf("Siap mengirim ke %02X:%02X:%02X:%02X:%02X:%02X di channel %d.\n", MAC_PENERIMA[0], MAC_PENERIMA[1],
                MAC_PENERIMA[2], MAC_PENERIMA[3], MAC_PENERIMA[4], MAC_PENERIMA[5], WiFi.channel());
}

void loop() {
  nomor++;
  char isi[32];
  snprintf(isi, sizeof(isi), "halo dari kebun #%lu", nomor);
  kirimSelesai = false;
  esp_err_t hasil = esp_now_send(MAC_PENERIMA, (const uint8_t *)isi, strlen(isi) + 1);  // +1: ikut kirim akhir teks
  if (hasil != ESP_OK) {
    Serial.printf("#%lu tidak bisa dikirim: %s\n", nomor, esp_err_to_name(hasil));
  } else {
    unsigned long mulai = millis();
    while (!kirimSelesai && millis() - mulai < 200) {  // tunggu laporan radio, paling lama 200 ms
      delay(1);
    }
    if (kirimSelesai && adaAck) {
      Serial.printf("#%lu terkirim: penerima membalas ACK.\n", nomor);
    } else {
      Serial.printf("#%lu GAGAL: tidak ada ACK (penerima mati, terlalu jauh, atau beda channel).\n", nomor);
    }
  }
  delay(2000);
}
