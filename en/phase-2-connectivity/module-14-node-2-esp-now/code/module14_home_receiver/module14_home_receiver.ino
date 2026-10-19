// Module 14 - Practice 1, the RECEIVER board (the Node 1 board): connected to the home WiFi like Node 1,
// while still listening for ESP-NOW packets. Its radio channel is now SET BY THE ROUTER.
// There is no password in this sketch: WiFi.begin() with nothing inside uses the WiFi saved on the board
// since the WiFi portal of Module 10 (Node 1 keeps it in NVS).
// Needs esp32 package version 3.3.7 or newer (this module uses 3.3.12).

#include <WiFi.h>
#include <esp_now.h>
#include <esp_mac.h>

struct Parcel {
  uint8_t mac[6];
  int8_t rssi;
  uint8_t channel;  // the channel this packet was received on
  int length;
  char content[64];
};

QueueHandle_t mailbox;
unsigned long packetCount = 0;

void onReceived(const esp_now_recv_info_t *info, const uint8_t *data, int length) {
  Parcel p;
  memcpy(p.mac, info->src_addr, 6);
  p.rssi = info->rx_ctrl->rssi;
  p.channel = info->rx_ctrl->channel;
  p.length = length;
  int copyLength = length < 63 ? length : 63;
  memcpy(p.content, data, copyLength);
  p.content[copyLength] = '\0';
  xQueueSend(mailbox, &p, 0);
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  mailbox = xQueueCreate(8, sizeof(Parcel));
  WiFi.setSleep(false);  // the radio always listens (no modem sleep); set BEFORE WiFi.mode()
  WiFi.mode(WIFI_STA);

  uint8_t mac[6];
  esp_read_mac(mac, ESP_MAC_WIFI_STA);
  Serial.println();
  Serial.printf("This board's MAC: %02X:%02X:%02X:%02X:%02X:%02X\n", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);

  WiFi.begin();  // no name and no password: use the WiFi saved on this board
  Serial.print("Connecting to the saved home WiFi");
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("Connected to \"%s\". The router uses channel %d.\n", WiFi.SSID().c_str(), WiFi.channel());
  } else {
    Serial.println("Not connected yet. No saved WiFi yet? Upload Node 1 v1.2.1 again, fill in the WiFi portal");
    Serial.println("(Module 10), then upload this sketch again. Meanwhile the radio stays on channel 1.");
  }

  if (esp_now_init() != ESP_OK) {
    Serial.println("ESP-NOW failed to start. Press the EN button to try again.");
    return;
  }
  esp_now_register_recv_cb(onReceived);
  Serial.printf("Waiting for ESP-NOW packets on channel %d...\n", WiFi.channel());
}

void loop() {
  Parcel p;
  while (xQueueReceive(mailbox, &p, 0) == pdTRUE) {
    packetCount++;
    Serial.printf("Packet #%lu from %02X:%02X:%02X:%02X:%02X:%02X on channel %u, signal %d dBm: \"%s\"\n", packetCount,
                  p.mac[0], p.mac[1], p.mac[2], p.mac[3], p.mac[4], p.mac[5], p.channel, p.rssi, p.content);
  }
}
