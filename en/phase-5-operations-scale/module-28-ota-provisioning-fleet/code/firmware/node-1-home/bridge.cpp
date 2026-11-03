// bridge.cpp - the code of the Node 2 bridge module (Module 14). Its functions are listed in bridge.h.
#include <Arduino.h>
#include <WiFi.h>
#include <esp_now.h>  // ESP-NOW built into the esp32 package (ESP-IDF)
#include <ArduinoJson.h>
#include <time.h>
#include "config.h"
#include "logger.h"
#include "networking.h"
#include "node2-packet.h"
#include "bridge.h"

// Practice 8: the ESP-NOW encryption keys live in keys.h, which does NOT go to GitHub (.gitignore).
// As long as that file doesn't exist, ESP-NOW runs without encryption.
#if __has_include("keys.h")
#include "keys.h"
#else
const bool USE_ENCRYPTION = false;
const char KEY_PMK[] = "";
const char KEY_LMK[] = "";
#endif
static_assert(!USE_ENCRYPTION || sizeof(KEY_PMK) == 17, "KEY_PMK in keys.h must be exactly 16 letters/digits");
static_assert(!USE_ENCRYPTION || sizeof(KEY_LMK) == 17, "KEY_LMK in keys.h must be exactly 16 letters/digits");

// One packet that just arrived, handed by the WiFi task to loop() through the mailbox (a FreeRTOS queue).
struct IncomingPacket {
  Node2Packet content;
  uint8_t mac[6];       // the sender's address, from the radio packet's header
  int8_t rssi;          // this packet's signal strength, dBm
  uint32_t receivedMs;  // millis() when the packet arrived: the basis of the ts timestamp
};

// One Node 2 reading waiting to be published (for example while the router is off).
struct PendingReading {
  Node2Packet content;
  uint32_t receivedMs;
};

static QueueHandle_t mailbox = nullptr;          // WiFi task -> loop()
static volatile uint32_t droppedByWifiTask = 0;  // broadcast packets, wrong packet size, or a full mailbox

static PendingReading holdingShelf[NODE2_SHELF_SIZE];  // readings not published yet; the oldest one is at oldestSlot
static int oldestSlot = 0;
static int waitingCount = 0;

static char node2Id[13] = "";  // Node 2's device_id: 12 lowercase hexadecimal digits + the end-of-text mark
static char node2TelemetryTopic[40] = "";
static char node2StatusTopic[40] = "";

static uint32_t receivedCount = 0;   // valid packets, without duplicates
static uint32_t duplicateCount = 0;  // Node 2 resends that had actually been received already
static uint32_t lostCount = 0;       // sequence numbers that were skipped
static uint32_t rejectedCount = 0;   // not from MAC_NODE2, or a wrong mark/version
static uint32_t publishCount = 0;
static uint32_t evictedCount = 0;    // oldest readings that had to be thrown away because the holding shelf was full
static unsigned long lastRejectTime = 0;

static bool everHeard = false;
static uint16_t lastSession = 0;
static uint32_t lastSequence = 0;
static unsigned long lastHeardTime = 0;  // millis() of the last valid packet (or when Node 1 powered up)
static uint16_t node2Interval = 300;     // seconds; updated from every packet
static int8_t lastRssi = 0;
static uint8_t lastAttempt = 0;

enum Node2State { UNKNOWN, ONLINE, OFFLINE };
static Node2State node2State = UNKNOWN;
static bool statusNeedsPublish = false;
static bool mqttWasReady = false;

// Called by the WiFi task, NOT loop(): as short as possible. Copy, hand over to the mailbox, done.
// No Serial.print(), no mqtt.publish() here (ESP-IDF: "do not do lengthy operations").
static void onEspNowReceive(const esp_now_recv_info_t* info, const uint8_t* data, int length) {
  // Broadcast packets (destination address FF:FF:FF:FF:FF:FF) are never encrypted, so an impostor could use them:
  // drop them. The lowest bit of the destination address's first byte is 1 only for broadcast and group addresses.
  if ((info->des_addr[0] & 0x01) || length != (int)sizeof(Node2Packet)) {
    droppedByWifiTask = droppedByWifiTask + 1;  // not ++: C++20 warns about ++ on a volatile
    return;
  }
  IncomingPacket p;
  memcpy(&p.content, data, sizeof(Node2Packet));
  memcpy(p.mac, info->src_addr, 6);
  p.rssi = info->rx_ctrl->rssi;
  p.receivedMs = millis();
  if (xQueueSend(mailbox, &p, 0) != pdTRUE) {  // 0 = don't wait; a full mailbox = the packet is dropped
    droppedByWifiTask = droppedByWifiTask + 1;
  }
}

static void putOnShelf(const Node2Packet& content, uint32_t receivedMs) {
  if (waitingCount == NODE2_SHELF_SIZE) {  // shelf full: throw away the oldest reading so that the newest one is still kept
    oldestSlot = (oldestSlot + 1) % NODE2_SHELF_SIZE;
    waitingCount--;
    evictedCount++;
  }
  int slot = (oldestSlot + waitingCount) % NODE2_SHELF_SIZE;
  holdingShelf[slot].content = content;
  holdingShelf[slot].receivedMs = receivedMs;
  waitingCount++;
}

static void acceptPacket(const IncomingPacket& p) {
  if (memcmp(p.mac, MAC_NODE2, 6) != 0) {
    rejectedCount++;
    if (lastRejectTime == 0 || millis() - lastRejectTime >= 60000) {  // at most once a minute
      lastRejectTime = millis();
      logInfo("ESP-NOW from %02x%02x%02x%02x%02x%02x rejected: not MAC_NODE2 in config.h.", p.mac[0], p.mac[1],
              p.mac[2], p.mac[3], p.mac[4], p.mac[5]);
    }
    return;
  }
  if (p.content.mark != PACKET_MARK || p.content.version != PACKET_VERSION) {
    rejectedCount++;
    logError("Node 2 packet with mark 0x%02X version %u rejected: make node2-packet.h the same in both firmwares.", p.content.mark,
             p.content.version);
    return;
  }
  if (everHeard && p.content.session == lastSession) {
    if (p.content.sequence <= lastSequence) {  // a resend (the ACK got lost): already received, drop it
      duplicateCount++;
      return;
    }
    lostCount += p.content.sequence - lastSequence - 1;  // skipped numbers = lost packets
  } else if (everHeard) {
    logInfo("Node 2 restarted (new session %u): the sequence count starts again.", p.content.session);
  }
  everHeard = true;
  lastSession = p.content.session;
  lastSequence = p.content.sequence;
  lastHeardTime = p.receivedMs;
  node2Interval = p.content.intervalSeconds > 0 ? p.content.intervalSeconds : 300;
  lastRssi = p.rssi;
  lastAttempt = p.content.attempt;
  receivedCount++;
  putOnShelf(p.content, p.receivedMs);
  logInfo("Node 2: packet #%lu received (attempt %u, signal %d dBm).", (unsigned long)p.content.sequence,
          p.content.attempt, p.rssi);
  if (node2State != ONLINE) {
    node2State = ONLINE;
    statusNeedsPublish = true;
    logInfo("Node 2 ONLINE.");
  }
}

static void checkOffline() {
  if (node2State == OFFLINE) {
    return;
  }
  unsigned long limit = 3UL * node2Interval * 1000UL + NODE2_OFFLINE_MARGIN;  // 3 x interval + 1 minute
  if (millis() - lastHeardTime >= limit) {
    node2State = OFFLINE;
    statusNeedsPublish = true;
    logError("Node 2 OFFLINE: no packet for %lu seconds.", limit / 1000);
  }
}

static float round1(float x) {  // one digit after the decimal point (data contract); NAN stays NAN
  return isnan(x) ? NAN : roundf(x * 10.0f) / 10.0f;
}

// Builds Node 2's telemetry JSON per data contract 1.1. Returns false if Node 1's clock isn't set yet.
static bool buildNode2Json(const PendingReading& b, char* content, size_t size) {
  time_t now = time(nullptr);
  time_t readingTime = now - (time_t)((millis() - b.receivedMs) / 1000);  // moved back by the reading's age
  struct tm utc;
  gmtime_r(&readingTime, &utc);
  if (utc.tm_year + 1900 < 2025) {
    return false;  // the clock isn't set from the internet yet: every piece of data must carry ts
  }
  char ts[21];
  strftime(ts, sizeof(ts), "%Y-%m-%dT%H:%M:%SZ", &utc);
  char fw[12];
  snprintf(fw, sizeof(fw), "%u.%u.%u", b.content.fw[0], b.content.fw[1], b.content.fw[2]);  // NODE 2's firmware version, not Node 1's

  JsonDocument doc;
  doc["ts"] = ts;
  doc["fw"] = fw;
  doc["temperature"] = round1(b.content.temperature);  // ArduinoJson writes NAN as null
  if (isnan(b.content.humidity)) {
    doc["humidity"] = nullptr;
  } else {
    doc["humidity"] = (int)lroundf(b.content.humidity);
  }
  doc["pressure"] = round1(b.content.pressure);
  doc["soil_temperature"] = round1(b.content.soilTemperature);
  if (b.content.soil < 0) {
    doc["soil"] = nullptr;  // -1 = the soil sensor could not be read
  } else {
    doc["soil"] = b.content.soil;
  }
  if (b.content.batteryMv > 0) {  // optional field: only if Node 2 measures its battery
    doc["battery"] = roundf(b.content.batteryMv / 10.0f) / 100.0f;  // volts, two digits after the decimal point
  }
  size_t length = serializeJson(doc, content, size);
  return length < size;
}

static void publishShelf() {
  for (int i = 0; i < 3 && waitingCount > 0; i++) {  // at most 3 per pass: loop() stays nimble
    char content[192];
    if (!buildNode2Json(holdingShelf[oldestSlot], content, sizeof(content))) {
      return;  // the clock isn't set yet: try again later
    }
    if (!publishTo(node2TelemetryTopic, content, false)) {
      return;  // the broker dropped midway: the reading stays on the shelf
    }
    oldestSlot = (oldestSlot + 1) % NODE2_SHELF_SIZE;
    waitingCount--;
    publishCount++;
    logDebug("Node 2 JSON: %s", content);
  }
}

// Wokwi mode: the simulator has no real Node 2, so loop() itself hands "mock Node 2" packets
// to the same mailbox every 30 seconds. The rest of the bridge (holding shelf, ts, MQTT) works exactly the same.
static void mockNode2() {
  static unsigned long mockTime = 0;
  static uint32_t mockSequence = 0;
  if (mockTime != 0 && millis() - mockTime < 30000) {
    return;
  }
  mockTime = millis();
  mockSequence++;
  if (mockSequence % 10 == 7) {
    return;  // now and then "lost in the air", so that the lost count of the node2 command gets tested too
  }
  float wave = sinf(mockSequence / 4.0f);
  IncomingPacket p = {};
  p.content.mark = PACKET_MARK;
  p.content.version = PACKET_VERSION;
  p.content.fw[0] = 1;
  p.content.fw[1] = 0;
  p.content.fw[2] = 0;
  p.content.session = 0x7A11;
  p.content.sequence = mockSequence;
  p.content.intervalSeconds = 30;
  p.content.attempt = 1;
  p.content.temperature = 29.0f + 2.0f * wave;
  p.content.humidity = 75.0f - 6.0f * wave;
  p.content.pressure = 1008.6f;
  p.content.soilTemperature = 27.0f + wave;
  p.content.soil = 41;
  p.content.batteryMv = 3920;
  memcpy(p.mac, MAC_NODE2, 6);
  p.rssi = -58;
  p.receivedMs = millis();
  xQueueSend(mailbox, &p, 0);
}

void setupBridge() {
  snprintf(node2Id, sizeof(node2Id), "%02x%02x%02x%02x%02x%02x", MAC_NODE2[0], MAC_NODE2[1], MAC_NODE2[2],
           MAC_NODE2[3], MAC_NODE2[4], MAC_NODE2[5]);
  snprintf(node2TelemetryTopic, sizeof(node2TelemetryTopic), "msh/%s/telemetry", node2Id);
  snprintf(node2StatusTopic, sizeof(node2StatusTopic), "msh/%s/status", node2Id);
  mailbox = xQueueCreate(8, sizeof(IncomingPacket));
  lastHeardTime = millis();  // the "offline" limit counts from Node 1's power-up if Node 2 hasn't been heard yet
  if (mailbox == nullptr || esp_now_init() != ESP_OK) {
    logError("ESP-NOW failed to start: Node 2 will not be heard.");
    return;
  }
  if (USE_ENCRYPTION) {  // Practice 8: Node 2 is registered as an encrypted peer
    esp_now_set_pmk((const uint8_t*)KEY_PMK);
    esp_now_peer_info_t peer = {};
    memcpy(peer.peer_addr, MAC_NODE2, 6);
    peer.channel = 0;  // 0 = the radio's current channel (the router's channel)
    peer.ifidx = WIFI_IF_STA;
    peer.encrypt = true;
    memcpy(peer.lmk, KEY_LMK, ESP_NOW_KEY_LEN);
    if (esp_now_add_peer(&peer) != ESP_OK) {
      logError("Failed to register Node 2 as an encrypted peer.");
    }
  }
  esp_now_register_recv_cb(onEspNowReceive);
  logInfo("Node 2 bridge ready: listening for ESP-NOW from %s, encryption %s.", node2Id, USE_ENCRYPTION ? "on" : "off");
  if (USE_WOKWI) {
    logInfo("Wokwi mode: a mock Node 2 sends a packet every 30 seconds.");
  }
}

void updateBridge() {
  if (mailbox == nullptr) {
    return;
  }
  if (USE_WOKWI) {
    mockNode2();
  }
  IncomingPacket p;
  while (xQueueReceive(mailbox, &p, 0) == pdTRUE) {  // 0 = take only what is already there, don't wait
    acceptPacket(p);
  }
  checkOffline();

  bool ready = mqttReady();
  if (ready && !mqttWasReady && node2State != UNKNOWN) {
    statusNeedsPublish = true;  // the broker just connected (again): repeat Node 2's last known status
  }
  mqttWasReady = ready;
  if (!ready) {
    return;  // readings wait on the shelf until the broker is reachable again
  }
  if (statusNeedsPublish && node2State != UNKNOWN) {
    if (publishTo(node2StatusTopic, node2State == ONLINE ? "online" : "offline", true)) {  // retained
      statusNeedsPublish = false;
    }
  }
  publishShelf();
}

void printNode2Info() {
  const char* text = node2State == ONLINE ? "online" : (node2State == OFFLINE ? "OFFLINE" : "not heard yet");
  Serial.printf("node2: device_id %s, %s, radio channel %ld, encryption %s\n", node2Id, text, (long)WiFi.channel(),
                USE_ENCRYPTION ? "on" : "off");
  Serial.printf("node2: received %lu, lost %lu, duplicates %lu, rejected %lu, dropped %lu\n",
                (unsigned long)receivedCount, (unsigned long)lostCount, (unsigned long)duplicateCount,
                (unsigned long)rejectedCount, (unsigned long)droppedByWifiTask);
  if (receivedCount + lostCount > 0) {
    Serial.printf("node2: packets arrived %.1f %%\n", 100.0 * receivedCount / (receivedCount + lostCount));
  }
  Serial.printf("node2: published %lu, waiting on the shelf %d of %d, evicted %lu\n", (unsigned long)publishCount,
                waitingCount, NODE2_SHELF_SIZE, (unsigned long)evictedCount);
  if (everHeard) {
    Serial.printf("node2: last packet #%lu, %lu seconds ago, attempt %u, signal %d dBm, interval %u seconds\n",
                  (unsigned long)lastSequence, (millis() - lastHeardTime) / 1000, lastAttempt,
                  lastRssi, node2Interval);
  }
}

void resetNode2Counters() {
  receivedCount = 0;
  duplicateCount = 0;
  lostCount = 0;
  rejectedCount = 0;
  droppedByWifiTask = 0;
  publishCount = 0;
  evictedCount = 0;
  Serial.println("node2: all counters back to zero (the last sequence number is still remembered).");
}
