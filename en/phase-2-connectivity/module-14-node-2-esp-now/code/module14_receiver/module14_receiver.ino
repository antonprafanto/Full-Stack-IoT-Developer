// Module 14 - Quick Win, the RECEIVER board (the Node 1 board).
// Prints this board's MAC address, then shows every ESP-NOW packet that arrives.
// No router and no password: the WiFi radio is on as a station (STA), but not connected to anything.
// Needs esp32 package version 3.3.7 or newer (this module uses 3.3.12).

#include <WiFi.h>
#include <esp_now.h>
#include <esp_mac.h>

// One packet that the "WiFi task" hands over to loop().
struct Parcel {
  uint8_t mac[6];    // the sender's address
  int8_t rssi;       // signal strength, dBm (the closer to 0, the stronger)
  int length;        // how many bytes arrived
  char content[64];  // its content, as text
};

QueueHandle_t mailbox;  // FreeRTOS queue: from the WiFi task to loop()
unsigned long packetCount = 0;

// Called by the WiFi task (not loop()) every time a packet arrives. Just copy, hand over, done.
void onReceived(const esp_now_recv_info_t *info, const uint8_t *data, int length) {
  Parcel p;
  memcpy(p.mac, info->src_addr, 6);
  p.rssi = info->rx_ctrl->rssi;
  p.length = length;
  int copyLength = length < 63 ? length : 63;
  memcpy(p.content, data, copyLength);
  p.content[copyLength] = '\0';
  xQueueSend(mailbox, &p, 0);  // 0 = don't wait; if the mailbox is full, this packet is skipped
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  mailbox = xQueueCreate(8, sizeof(Parcel));
  WiFi.mode(WIFI_STA);  // the radio is on, but not connected to any router

  uint8_t mac[6];
  esp_read_mac(mac, ESP_MAC_WIFI_STA);
  Serial.println();
  Serial.printf("This board's MAC: %02X:%02X:%02X:%02X:%02X:%02X\n", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  Serial.printf("Copy this line into the sender sketch: {0x%02X, 0x%02X, 0x%02X, 0x%02X, 0x%02X, 0x%02X}\n", mac[0], mac[1],
                mac[2], mac[3], mac[4], mac[5]);

  if (esp_now_init() != ESP_OK) {
    Serial.println("ESP-NOW failed to start. Press the EN button to try again.");
    return;
  }
  esp_now_register_recv_cb(onReceived);
  Serial.printf("Waiting for ESP-NOW packets on channel %d...\n", WiFi.channel());
}

void loop() {
  Parcel p;
  while (xQueueReceive(mailbox, &p, 0) == pdTRUE) {  // take every parcel that is already there
    packetCount++;
    Serial.printf("Packet #%lu from %02X:%02X:%02X:%02X:%02X:%02X, %d bytes, signal %d dBm: \"%s\"\n", packetCount,
                  p.mac[0], p.mac[1], p.mac[2], p.mac[3], p.mac[4], p.mac[5], p.length, p.rssi, p.content);
  }
}
