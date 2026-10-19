// Module 14 - Quick Win, the SENDER board (the Node 2 board).
// Every 2 seconds sends a greeting over ESP-NOW straight to the receiver board's MAC address,
// then reports whether the receiver's radio replied "got it" (ACK).
// Needs esp32 package version 3.3.7 or newer (this module uses 3.3.12).

#include <WiFi.h>
#include <esp_now.h>

// REPLACE with the line "Copy this line into the sender sketch" from the receiver board's Serial Monitor:
const uint8_t MAC_RECEIVER[6] = {0xA4, 0xCF, 0x12, 0xE5, 0xB7, 0xC0};

volatile bool sendDone = false;  // set by the WiFi task, read by loop()
volatile bool gotAck = false;
unsigned long number = 0;

// Called by the WiFi task once the radio knows the packet's fate: an ACK from the receiver, or none.
void onSent(const esp_now_send_info_t *info, esp_now_send_status_t status) {
  gotAck = (status == ESP_NOW_SEND_SUCCESS);
  sendDone = true;
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  WiFi.mode(WIFI_STA);  // the radio is on, without a router
  if (esp_now_init() != ESP_OK) {
    Serial.println("ESP-NOW failed to start. Press the EN button to try again.");
    return;
  }
  esp_now_register_send_cb(onSent);

  esp_now_peer_info_t peer = {};  // the "address book": all fields set to zero first
  memcpy(peer.peer_addr, MAC_RECEIVER, 6);
  peer.channel = 0;          // 0 = the channel this board's radio is using now
  peer.ifidx = WIFI_IF_STA;  // send through the station (STA) interface
  peer.encrypt = false;      // no encryption yet (Practice 8)
  if (esp_now_add_peer(&peer) != ESP_OK) {
    Serial.println("Failed to add the receiver's address. Check MAC_RECEIVER.");
    return;
  }
  Serial.println();
  Serial.printf("Ready to send to %02X:%02X:%02X:%02X:%02X:%02X on channel %d.\n", MAC_RECEIVER[0], MAC_RECEIVER[1],
                MAC_RECEIVER[2], MAC_RECEIVER[3], MAC_RECEIVER[4], MAC_RECEIVER[5], WiFi.channel());
}

void loop() {
  number++;
  char content[32];
  snprintf(content, sizeof(content), "hello from the garden #%lu", number);
  sendDone = false;
  esp_err_t result = esp_now_send(MAC_RECEIVER, (const uint8_t *)content, strlen(content) + 1);  // +1: send the end-of-text mark too
  if (result != ESP_OK) {
    Serial.printf("#%lu could not be sent: %s\n", number, esp_err_to_name(result));
  } else {
    unsigned long start = millis();
    while (!sendDone && millis() - start < 200) {  // wait for the radio's report, 200 ms at most
      delay(1);
    }
    if (sendDone && gotAck) {
      Serial.printf("#%lu sent: the receiver replied with an ACK.\n", number);
    } else {
      Serial.printf("#%lu FAILED: no ACK (receiver off, too far away, or on a different channel).\n", number);
    }
  }
  delay(2000);
}
