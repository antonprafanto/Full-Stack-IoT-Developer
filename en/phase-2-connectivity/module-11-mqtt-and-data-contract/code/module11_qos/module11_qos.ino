// Module 11 - Practice 5: QoS 0 vs QoS 1 while the ESP32's WiFi is off
// The ESP32 subscribes to practice/<device_id>/qos with QoS 1 and a persistent session (clean session = false).
// Press the D13 button to switch the WiFi off, send QoS 0 and QoS 1 messages from MQTTX, then press D13 again.
// The broker keeps the QoS 1 message and delivers it as soon as the ESP32 is back; the QoS 0 message is lost (Concept 6).

#include <WiFi.h>
#include <PubSubClient.h>  // PubSubClient3 library version 3.3.2
#include <esp_mac.h>       // esp_read_mac(): the MAC address straight from the chip
#include "secrets.h"       // contains WIFI_NAME and WIFI_PASSWORD

#ifndef MQTT_QOS1  // only PubSubClient3 has this name
#error "The old PubSubClient (2.8) is in use. Remove it in the Library Manager, then install PubSubClient3 version 3.3.2."
#endif

// REPLACE 192.168.1.10 with your laptop's IP address, as in Practice 3.
const char BROKER_ADDRESS[] = "192.168.1.10";
const uint16_t BROKER_PORT = 1883;

const int PIN_BUTTON = 13;                       // the D13 button on the workbench (Module 5), active LOW
const unsigned long MQTT_RETRY_INTERVAL = 5000;  // couldn't connect to the broker? try again 5 seconds later

WiFiClient netClient;
PubSubClient mqtt(netClient);
char deviceId[13];  // device_id
char clientId[24];  // a client ID just for this practice so that its persistent session doesn't mix with other sketches
char qosTopic[40];  // practice/<device_id>/qos
bool wifiOn = true;
bool buttonBefore = HIGH;
unsigned long buttonChangeTime = 0;
unsigned long lastTryTime = 0;
bool hasTried = false;

void onMessage(char* topic, byte* content, unsigned int length) {
  Serial.print("Message received: ");
  Serial.write(content, length);
  Serial.println();
}

void tryConnectBroker() {
  if (hasTried && millis() - lastTryTime < MQTT_RETRY_INTERVAL) {
    return;
  }
  hasTried = true;
  lastTryTime = millis();
  // Persistent session: always the same client ID, and the last argument (clean session) = false.
  // No username and password (nullptr, nullptr), and no last will (nullptr, 0, false, nullptr).
  if (mqtt.connect(clientId, nullptr, nullptr, nullptr, 0, false, nullptr, false)) {
    mqtt.subscribe(qosTopic, 1);  // QoS 1 subscription: the broker keeps QoS 1 messages while the ESP32 is away
    Serial.printf("Connected to the broker (persistent session), subscribed to %s with QoS 1\n", qosTopic);
  } else {
    Serial.printf("Failed to reach the broker (code %d). Retrying in 5 seconds.\n", mqtt.state());
  }
}

// Each press of D13 switches the WiFi off or on, in turn.
void checkButton() {
  bool now = digitalRead(PIN_BUTTON);
  if (now == buttonBefore || millis() - buttonChangeTime < 50) {  // 50 ms: ignore the button's bounce (Module 5)
    return;
  }
  buttonChangeTime = millis();
  buttonBefore = now;
  if (now == HIGH) {
    return;  // only when pressed
  }
  wifiOn = !wifiOn;
  if (wifiOn) {
    WiFi.begin(WIFI_NAME, WIFI_PASSWORD);
    Serial.println("WiFi switched ON again: connecting to the WiFi, then to the broker...");
  } else {
    WiFi.disconnect();
    Serial.println("WiFi switched OFF. Now send one QoS 0 message and one QoS 1 message from MQTTX.");
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  Serial.println();

  uint8_t mac[6];
  esp_read_mac(mac, ESP_MAC_WIFI_STA);
  snprintf(deviceId, sizeof(deviceId), "%02x%02x%02x%02x%02x%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  snprintf(clientId, sizeof(clientId), "%s-qos", deviceId);
  snprintf(qosTopic, sizeof(qosTopic), "practice/%s/qos", deviceId);

  Serial.printf("Connecting to \"%s\"", WIFI_NAME);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_NAME, WIFI_PASSWORD);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
    Serial.print(".");
    delay(250);
  }
  Serial.println();
  Serial.printf("Practice topic: %s\n", qosTopic);

  netClient.setConnectionTimeout(1000);
  mqtt.setServer(BROKER_ADDRESS, BROKER_PORT);
  mqtt.setSocketTimeout(1);
  mqtt.setCallback(onMessage);
}

void loop() {
  checkButton();
  if (!wifiOn || WiFi.status() != WL_CONNECTED) {
    return;
  }
  if (!mqtt.connected()) {
    tryConnectBroker();
    return;
  }
  mqtt.loop();
}
