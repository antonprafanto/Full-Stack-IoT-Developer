// Node 2 "Garden" - Mini Smart Home - firmware v1.0.0 (Module 14): a battery-powered sensor over ESP-NOW
// Every 5 minutes: wake up -> read the BME280 + DS18B20 + second soil sensor (+ battery, if fitted) -> send one
// ESP-NOW packet to Node 1 -> sleep again. The order is deliberate: all sensors first (radio still off), the radio briefly, sleep.
// Node 2 never connects to the router and doesn't know the WiFi password: the home WiFi's NAME is enough, to find the channel.
// Pins as in PIN-MAP.md version 5, Node 2 section. Board: DOIT ESP32 DEVKIT V1 (the default program shelf is enough).
// Libraries: Adafruit BME280 Library 2.3.0 (installed with it: Adafruit Unified Sensor 1.1.15, Adafruit BusIO 1.17.4),
// OneWire 2.3.8, DallasTemperature 4.0.6. WiFi and ESP-NOW come with the esp32 package (version 3.3.7 or newer).

#include <Wire.h>
#include <WiFi.h>
#include <esp_now.h>
#include <esp_mac.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Adafruit_BME280.h>
#include "node2-packet.h"

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

// ---------- Replace with your own ----------
const uint8_t MAC_NODE1[6] = {0xA4, 0xCF, 0x12, 0xE5, 0xB7, 0xC0};  // Node 1's WiFi MAC (= Node 1's device_id), 2 digits at a time
const char WIFI_NAME[] = "YourHomeWiFiName";  // the name of the home WiFi that Node 1 is connected to, EXACTLY; the password is NOT needed
const uint8_t FIXED_CHANNEL = 0;              // 0 = find it by itself through WIFI_NAME; 1-11 = always use this channel
const int SOIL_DRY = 3000;                    // calibration of the SECOND soil sensor with power from D32 (Practice 2)
const int SOIL_WET = 1300;
const uint16_t INTERVAL_SECONDS = 300;        // wake every 5 minutes; "router off" test (Practice 6): 60
const bool HAS_BATTERY_DIVIDER = false;       // true if the battery voltage divider is connected to VP (technical deep dive)
const float DIVIDER_FACTOR = 2.0;             // two equal resistors; correct it with a multimeter

// ---------- Fixed ----------
const uint8_t FW_VERSION[3] = {1, 0, 0};
const int PIN_AWAKE_LED = 2;              // built-in blue LED: on while awake
const int PIN_ONE_WIRE = 27;              // DS18B20
const int PIN_SDA = 21;                   // BME280
const int PIN_SCL = 22;
const int PIN_SOIL = 39;                  // VN: the second soil sensor's AOUT
const int PIN_SOIL_POWER = 32;            // D32: the soil sensor's power, on only while awake
const int PIN_BATTERY = 36;               // VP: the voltage divider's midpoint (optional)
const unsigned long SOIL_SETTLE_MS = 300; // wait after switching the soil sensor on before reading it
const uint8_t DS18B20_RESOLUTION = 10;    // 0.25 degrees, 188 ms at most
const int MAX_ATTEMPTS = 3;               // send again if Node 1's radio ACK doesn't come
const int FAILS_BEFORE_SCAN = 2;          // after 2 failed wakes in a row, find the channel again

// ---------- RTC memory: survives deep sleep, lost when the battery is removed or EN is pressed ----------
RTC_DATA_ATTR uint16_t session = 0;  // 0 = the board just powered up from off
RTC_DATA_ATTR uint32_t sequence = 0;
RTC_DATA_ATTR uint8_t channel = 0;  // the channel used last (0 = not known yet)
RTC_DATA_ATTR uint8_t failStreak = 0;

OneWire oneWire(PIN_ONE_WIRE);
DallasTemperature tempSensors(&oneWire);
Adafruit_BME280 bme;

volatile bool sendDone = false;  // set by the WiFi task, read by setup()
volatile bool sendOk = false;

// Called by the WiFi task after the radio receives (or doesn't receive) an ACK from Node 1.
static void onSendDone(const esp_now_send_info_t *info, esp_now_send_status_t status) {
  sendOk = (status == ESP_NOW_SEND_SUCCESS);
  sendDone = true;
}

static bool deviceAt(uint8_t address) {
  Wire.beginTransmission(address);
  return Wire.endTransmission() == 0;
}

// BME280 forced mode: measure once, then the sensor goes back to sleep by itself (0.1 uA) while Node 2 sleeps.
static void readBme280(Node2Packet &p) {
  p.temperature = NAN;
  p.humidity = NAN;
  p.pressure = NAN;
  Wire.begin(PIN_SDA, PIN_SCL);
  uint8_t address = deviceAt(0x76) ? 0x76 : (deviceAt(0x77) ? 0x77 : 0);
  if (address == 0) {
    Serial.println("BME280 not found at 0x76 or 0x77: check SDA to D21, SCL to D22, VCC, and GND.");
    return;
  }
  if (!bme.begin(address)) {
    Serial.printf("The chip at 0x%02X is not a BME280 (chip ID 0x%02X; 0x58 = BMP280, no humidity).\n", address,
                  (unsigned int)bme.sensorID());
    return;
  }
  bme.setSampling(Adafruit_BME280::MODE_FORCED, Adafruit_BME280::SAMPLING_X1, Adafruit_BME280::SAMPLING_X1,
                  Adafruit_BME280::SAMPLING_X1, Adafruit_BME280::FILTER_OFF);
  if (!bme.takeForcedMeasurement()) {
    return;
  }
  p.temperature = bme.readTemperature();
  p.humidity = bme.readHumidity();
  p.pressure = bme.readPressure() / 100.0f;  // the library gives pascals; divided by 100 it becomes hPa
}

// Average of 20 readings. An impossible raw value (sensor unplugged or without power) is sent as -1.
static int8_t readSoil() {
  long sum = 0;
  for (int i = 0; i < 20; i++) {
    sum += analogRead(PIN_SOIL);
    delay(2);
  }
  int raw = sum / 20;
  if (raw < SOIL_WET - 300 || raw > SOIL_DRY + 300) {
    Serial.printf("Soil sensor: raw value %d is impossible, sent as failed.\n", raw);
    return -1;
  }
  return constrain(map(raw, SOIL_DRY, SOIL_WET, 0, 100), 0, 100);
}

static uint16_t readBatteryMv() {
  if (!HAS_BATTERY_DIVIDER) {
    return 0;  // 0 = not measured; Node 1 doesn't write the battery field
  }
  uint32_t sum = 0;
  for (int i = 0; i < 8; i++) {
    sum += analogReadMilliVolts(PIN_BATTERY);
  }
  return (uint16_t)(sum / 8 * DIVIDER_FACTOR);
}

// Scans for one WiFi name only: that router's channel = Node 1's channel (Node 1 is connected to the router).
static uint8_t findChannel() {
  int count = WiFi.scanNetworks(false, false, false, 120, 0, WIFI_NAME);
  uint8_t result = 0;
  for (int i = 0; i < count; i++) {
    if (WiFi.SSID(i) == WIFI_NAME) {
      result = WiFi.channel(i);
      break;
    }
  }
  WiFi.scanDelete();
  if (result == 0) {
    Serial.printf("WiFi \"%s\" not found: is the router off, or is the name misspelled?\n", WIFI_NAME);
  }
  return result;
}

static bool setupEspNow() {
  if (WiFi.setChannel(channel) != ESP_OK) {
    Serial.printf("Channel %u refused by the ESP32. Is the router on channel 12 or 13? Change the router to 1, 6, or 11.\n", channel);
    return false;
  }
  if (esp_now_init() != ESP_OK) {
    return false;
  }
  esp_now_register_send_cb(onSendDone);
  esp_now_peer_info_t peer = {};
  memcpy(peer.peer_addr, MAC_NODE1, 6);
  peer.channel = 0;  // 0 = the radio's current channel (the one just set)
  peer.ifidx = WIFI_IF_STA;
  peer.encrypt = USE_ENCRYPTION;
  if (USE_ENCRYPTION) {  // Practice 8: the PMK and LMK must be exactly the same as Node 1's
    esp_now_set_pmk((const uint8_t *)KEY_PMK);
    memcpy(peer.lmk, KEY_LMK, ESP_NOW_KEY_LEN);
  }
  return esp_now_add_peer(&peer) == ESP_OK;
}

static bool sendOnce(const Node2Packet &p) {
  sendDone = false;
  if (esp_now_send(MAC_NODE1, (const uint8_t *)&p, sizeof(p)) != ESP_OK) {
    return false;
  }
  unsigned long start = millis();
  while (!sendDone && millis() - start < 200) {  // never wait forever: Node 2 must still be able to sleep
    delay(1);
  }
  return sendDone && sendOk;
}

void setup() {
  pinMode(PIN_AWAKE_LED, OUTPUT);
  digitalWrite(PIN_AWAKE_LED, HIGH);
  pinMode(PIN_SOIL_POWER, OUTPUT);
  digitalWrite(PIN_SOIL_POWER, HIGH);  // 1. the soil sensor is switched on FIRST OF ALL: it needs time to settle
  unsigned long soilOnAt = millis();
  Serial.begin(115200);
  if (session == 0) {  // just powered up from off: a new notebook
    session = (uint16_t)(esp_random() | 1);
    sequence = 0;
    uint8_t mac[6];
    esp_read_mac(mac, ESP_MAC_WIFI_STA);
    Serial.printf("\nNode 2 Garden v%u.%u.%u, MAC %02X:%02X:%02X:%02X:%02X:%02X (device_id %02x%02x%02x%02x%02x%02x)\n",
                  FW_VERSION[0], FW_VERSION[1], FW_VERSION[2], mac[0], mac[1], mac[2], mac[3], mac[4], mac[5], mac[0],
                  mac[1], mac[2], mac[3], mac[4], mac[5]);
    Serial.printf("Copy into MAC_NODE2 in Node 1's config.h: {0x%02X, 0x%02X, 0x%02X, 0x%02X, 0x%02X, 0x%02X}\n",
                  mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  }
  sequence++;

  Node2Packet p = {};
  p.mark = PACKET_MARK;
  p.version = PACKET_VERSION;
  memcpy(p.fw, FW_VERSION, 3);
  p.session = session;
  p.sequence = sequence;
  p.intervalSeconds = INTERVAL_SECONDS;

  // 2. The DS18B20 starts measuring (without waiting), while the other sensors are read.
  tempSensors.begin();
  tempSensors.setResolution(DS18B20_RESOLUTION);  // the sensor's EEPROM is only written if the resolution differs
  tempSensors.setWaitForConversion(false);
  tempSensors.requestTemperatures();
  unsigned long dsStart = millis();

  // 3. The BME280 and the battery, while the radio is still off.
  readBme280(p);
  p.batteryMv = readBatteryMv();

  // 4. Wait for the DS18B20 to finish, then read the soil sensor and switch it off again.
  while (!tempSensors.isConversionComplete() && millis() - dsStart < 800) {
    delay(5);
  }
  float soilTemperature = tempSensors.getTempCByIndex(0);  // -127 if the sensor does not answer
  p.soilTemperature = (soilTemperature == DEVICE_DISCONNECTED_C) ? NAN : soilTemperature;
  while (millis() - soilOnAt < SOIL_SETTLE_MS) {
    delay(1);
  }
  p.soil = readSoil();
  digitalWrite(PIN_SOIL_POWER, LOW);

  // 5. The radio only briefly: find the channel if needed, send, wait for the ACK, try again if it fails.
  WiFi.persistent(false);  // WiFi settings in RAM only: the flash memory isn't written on every wake
  WiFi.mode(WIFI_STA);     // the radio is on WITHOUT WiFi.begin(): Node 2 never connects to the router
  if (FIXED_CHANNEL != 0) {
    channel = FIXED_CHANNEL;
  } else if (channel == 0 || failStreak >= FAILS_BEFORE_SCAN) {
    uint8_t found = findChannel();
    if (found != 0) {
      channel = found;  // nothing found (router off)? The old channel is kept: Node 1 is still waiting there
    }
    failStreak = 0;
  }
  bool sent = false;
  if (channel != 0 && setupEspNow()) {
    for (int i = 1; i <= MAX_ATTEMPTS && !sent; i++) {
      p.attempt = i;
      sent = sendOnce(p);
      if (!sent && i < MAX_ATTEMPTS) {
        delay(i == 1 ? 100 : 2500);  // the last one about 2.6 seconds after the first: to get past Node 1's scan
      }
    }
  }
  failStreak = sent ? 0 : failStreak + 1;
  esp_now_deinit();
  WiFi.mode(WIFI_OFF);  // ESP-IDF: turn the WiFi off before sleeping

  // 6. Report, then sleep.
  Serial.printf("#%lu %s (attempt %u), channel %u. Temperature %.1f C, humidity %.0f %%, %.1f hPa, soil %.1f C / %d %%. "
                "Awake %lu ms.\n",
                (unsigned long)sequence, sent ? "sent" : "FAILED", p.attempt, channel, p.temperature, p.humidity,
                p.pressure, p.soilTemperature, p.soil, millis());
  Serial.flush();
  digitalWrite(PIN_AWAKE_LED, LOW);
  esp_sleep_enable_timer_wakeup(INTERVAL_SECONDS * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {
  // Never runs: Node 2 always starts from setup() every time it wakes up.
}
