// Modul 28 - Kemenangan Cepat: dua rak program di papanmu (latihan saja).
// Tools: ESP32 Dev Module, Partition Scheme Minimal SPIFFS, Flash Mode DIO.
#include <WiFi.h>
#include <ArduinoOTA.h>   // ikut paket esp32: terima program lewat WiFi
#include <esp_ota_ops.h>  // ikut paket esp32: rak program dan catatan rak
#include "secrets.h"      // WIFI_NAMA dan WIFI_SANDI, sama dengan Modul 10

const int VERSI = 1;  // langkah 2: ubah angka ini, lalu Upload lewat port jaringan

// Keadaan rak di catatan rak (otadata)
const char* namaKeadaan(esp_ota_img_states_t k) {
  switch (k) {
    case ESP_OTA_IMG_NEW: return "NEW, belum pernah menyala";
    case ESP_OTA_IMG_PENDING_VERIFY: return "PENDING_VERIFY, masa uji";
    case ESP_OTA_IMG_VALID: return "VALID, sudah sah";
    case ESP_OTA_IMG_INVALID: return "INVALID, ditolak";
    case ESP_OTA_IMG_ABORTED: return "ABORTED, batal";
    case ESP_OTA_IMG_UNDEFINED: return "UNDEFINED, dipasang lewat kabel";
    default: return "tidak dikenal";
  }
}

// Nama alasan restart, sama dengan Modul 5
const char* namaAlasan(esp_reset_reason_t a) {
  switch (a) {
    case ESP_RST_POWERON: return "POWERON";
    case ESP_RST_SW: return "SW";
    case ESP_RST_BROWNOUT: return "BROWNOUT";
    case ESP_RST_PANIC: return "PANIC";
    case ESP_RST_INT_WDT: case ESP_RST_TASK_WDT: case ESP_RST_WDT: return "WDT";
    case ESP_RST_DEEPSLEEP: return "DEEPSLEEP";
    default: return "UNKNOWN";
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  const esp_partition_t* berjalan = esp_ota_get_running_partition();         // rak yang menyala
  const esp_partition_t* sebelah = esp_ota_get_next_update_partition(NULL);  // rak berikutnya
  esp_ota_img_states_t keadaan = ESP_OTA_IMG_UNDEFINED;
  esp_ota_get_state_partition(berjalan, &keadaan);
  Serial.printf("\nVersi %d, restart terakhir: %s\n", VERSI, namaAlasan(esp_reset_reason()));
  Serial.printf("Rak berjalan: %s (%s)\n", berjalan->label, namaKeadaan(keadaan));
  if (sebelah == NULL || sebelah == berjalan) {
    Serial.println("Tidak ada rak sebelah: pilih Partition Scheme Minimal SPIFFS.");
    return;
  }
  Serial.printf("Rak sebelah: %s, %u byte\n", sebelah->label, (unsigned)sebelah->size);
  Serial.printf("Ruang untuk program baru: %u byte\n", (unsigned)ESP.getFreeSketchSpace());

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_NAMA, WIFI_SANDI);
  if (WiFi.waitForConnectResult(20000) != WL_CONNECTED) {  // paling lama 20 detik
    Serial.println("WiFi belum tersambung. Periksa tab secrets.h.");
    return;
  }
  ArduinoOTA.setHostname("rak-program");      // nama papan di Tools > Port
  ArduinoOTA.setPassword("ganti-sandi-ini");  // WAJIB GANTI dengan sandimu sendiri sebelum Upload
  ArduinoOTA.onStart([]() { Serial.println("Program baru datang, ditulis ke rak sebelah..."); });
  ArduinoOTA.begin();
  Serial.print("Siap menerima program lewat WiFi di ");
  Serial.println(WiFi.localIP());
}

void loop() {
  ArduinoOTA.handle();  // ada kiriman program dari IDE?
}
