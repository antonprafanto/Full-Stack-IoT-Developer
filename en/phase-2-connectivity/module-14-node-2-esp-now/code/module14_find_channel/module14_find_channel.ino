// Module 14 - Practice 1, the SENDER board (the Node 2 board): finds the router's channel by scanning for the home WiFi's NAME,
// keeps it in RTC memory, then wakes, sends, and sleeps every 10 seconds.
// Node 2 does NOT need the WiFi password: the WiFi name is enough, only to learn which channel the router (and Node 1) uses.
// Needs esp32 package version 3.3.7 or newer (this module uses 3.3.12).

#include <WiFi.h>
#include <esp_now.h>

// REPLACE these two lines:
const uint8_t MAC_RECEIVER[6] = {0xA4, 0xCF, 0x12, 0xE5, 0xB7, 0xC0};  // the Node 1 board's MAC
const char WIFI_NAME[] = "YourHomeWiFiName";                              // the home WiFi's name (SSID), exactly

const int FAILS_BEFORE_SCAN = 2;    // after 2 failed wakes in a row, find the channel again
const uint64_t SLEEP_SECONDS = 10;  // short so you see results quickly; the real Node 2 uses 300 seconds

// RTC memory: survives deep sleep, lost when the board is unplugged or the EN button is pressed (Module 9).
RTC_DATA_ATTR uint8_t channel = 0;  // 0 = not known yet
RTC_DATA_ATTR uint8_t failStreak = 0;
RTC_DATA_ATTR uint32_t number = 0;

volatile bool sendDone = false;
volatile bool gotAck = false;

void onSent(const esp_now_send_info_t *info, esp_now_send_status_t status) {
  gotAck = (status == ESP_NOW_SEND_SUCCESS);
  sendDone = true;
}

// Scans for one WiFi name only. The result is that router's channel, or 0 if it isn't found.
uint8_t findChannel() {
  unsigned long start = millis();
  int count = WiFi.scanNetworks(false, false, false, 120, 0, WIFI_NAME);
  uint8_t result = 0;
  for (int i = 0; i < count; i++) {
    if (WiFi.SSID(i) == WIFI_NAME) {
      result = WiFi.channel(i);
      break;
    }
  }
  WiFi.scanDelete();
  if (result != 0) {
    Serial.printf("Scanning \"%s\": found on channel %u (%lu ms).\n", WIFI_NAME, result, millis() - start);
  } else {
    Serial.printf("Scanning \"%s\": not found (%lu ms).\n", WIFI_NAME, millis() - start);
  }
  return result;
}

bool sendGreeting() {
  if (WiFi.setChannel(channel) != ESP_OK) {
    Serial.printf("Channel %u refused by the ESP32. Is the router on channel 12 or 13? Change the router to 1, 6, or 11.\n", channel);
    return false;
  }
  if (esp_now_init() != ESP_OK) {
    return false;
  }
  esp_now_register_send_cb(onSent);
  esp_now_peer_info_t peer = {};
  memcpy(peer.peer_addr, MAC_RECEIVER, 6);
  peer.channel = 0;  // 0 = the radio's current channel (the one just set)
  peer.ifidx = WIFI_IF_STA;
  peer.encrypt = false;
  if (esp_now_add_peer(&peer) != ESP_OK) {
    return false;
  }
  char content[32];
  snprintf(content, sizeof(content), "hello from the garden #%lu", (unsigned long)number);
  sendDone = false;
  if (esp_now_send(MAC_RECEIVER, (const uint8_t *)content, strlen(content) + 1) != ESP_OK) {
    return false;
  }
  unsigned long start = millis();
  while (!sendDone && millis() - start < 200) {  // never wait forever: Node 2 must still be able to sleep
    delay(1);
  }
  return sendDone && gotAck;
}

void setup() {
  Serial.begin(115200);
  delay(200);
  number++;
  WiFi.persistent(false);  // WiFi settings in RAM only: the flash memory isn't written on every wake
  WiFi.mode(WIFI_STA);     // the radio is on, WITHOUT WiFi.begin(): Node 2 never connects to the router

  if (channel == 0 || failStreak >= FAILS_BEFORE_SCAN) {
    uint8_t found = findChannel();
    if (found != 0) {
      channel = found;  // nothing found (router off)? The old channel is kept: Node 1 is still waiting there
    }
    failStreak = 0;
  } else {
    Serial.printf("Channel %u taken from RTC memory, without scanning.\n", channel);
  }

  bool success = (channel != 0) && sendGreeting();
  failStreak = success ? 0 : failStreak + 1;
  Serial.printf("Wake #%lu: %s on channel %u (failures in a row: %u). Awake %lu ms, sleeping %lu seconds.\n",
                (unsigned long)number, success ? "sent, got an ACK" : "FAILED", channel, failStreak, millis(),
                (unsigned long)SLEEP_SECONDS);
  Serial.flush();

  esp_now_deinit();
  WiFi.mode(WIFI_OFF);  // turn the radio off before sleeping
  esp_sleep_enable_timer_wakeup(SLEEP_SECONDS * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {
  // Never runs: on every wake from deep sleep, the board starts again from setup().
}
