// Module 11 - Quick Win: hello through an MQTT broker
// The ESP32 publishes a "hello" message to a public broker every 5 seconds, then prints any message
// you send to its topic from MQTTX on your laptop.
// Public broker = an open group chat: anyone can read along. Never send secrets through it.

#include <WiFi.h>
#include <PubSubClient.h>  // PubSubClient3 library version 3.3.2 (install it with the Library Manager)
#include "secrets.h"       // contains WIFI_NAME and WIFI_PASSWORD, as in Module 10

#ifndef MQTT_QOS1  // only PubSubClient3 has this name
#error "The old PubSubClient (2.8) is in use. Remove it in the Library Manager, then install PubSubClient3 version 3.3.2."
#endif

const char BROKER_ADDRESS[] = "broker.emqx.io";  // public broker, the same as MQTTX's default
const uint16_t BROKER_PORT = 1883;               // the MQTT door without encryption
const unsigned long HELLO_INTERVAL = 5000;       // one hello message every 5 seconds

WiFiClient netClient;          // TCP connection to the broker
PubSubClient mqtt(netClient);  // MQTT runs on top of that connection
char code[7];                  // 6 random hexadecimal characters so that your topic differs from other readers' topics
char clientId[24];             // the ESP32's name at the broker, must be unique
char sendTopic[40];            // learn-iot/<code>/from-esp32
char receiveTopic[40];         // learn-iot/<code>/from-laptop
unsigned long lastHelloTime = 0;
int helloNumber = 0;

// Called by the library for every message that arrives on a topic we subscribe to.
void onMessage(char* topic, byte* content, unsigned int length) {
  Serial.printf("Message received on %s: ", topic);
  Serial.write(content, length);  // the content doesn't end with an end-of-text mark: print exactly 'length' characters
  Serial.println();
}

void connectBroker() {
  Serial.printf("Connecting to broker %s ...\n", BROKER_ADDRESS);
  while (!mqtt.connect(clientId)) {  // waiting here is fine for this Quick Win
    Serial.printf("Failed (code %d). Retrying in 3 seconds.\n", mqtt.state());
    delay(3000);
  }
  mqtt.subscribe(receiveTopic);  // subscribe to the topic of messages from the laptop
  Serial.println("Connected to the broker!");
  Serial.printf("In MQTTX, subscribe to the topic: learn-iot/%s/#\n", code);
  Serial.printf("Send messages to the ESP32 on the topic: %s\n", receiveTopic);
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  snprintf(code, sizeof(code), "%06lx", (unsigned long)(esp_random() & 0xFFFFFF));  // for example 3f9a1c
  snprintf(clientId, sizeof(clientId), "learn-iot-%s", code);
  snprintf(sendTopic, sizeof(sendTopic), "learn-iot/%s/from-esp32", code);
  snprintf(receiveTopic, sizeof(receiveTopic), "learn-iot/%s/from-laptop", code);

  Serial.printf("Connecting to WiFi \"%s\"", WIFI_NAME);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_NAME, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(250);
  }
  Serial.println(" connected!");

  mqtt.setServer(BROKER_ADDRESS, BROKER_PORT);
  mqtt.setCallback(onMessage);
  connectBroker();
}

void loop() {
  if (!mqtt.connected()) {
    connectBroker();  // the broker connection dropped: connect again
  }
  mqtt.loop();  // must be called as often as possible: receives messages and keeps the connection alive

  if (millis() - lastHelloTime >= HELLO_INTERVAL) {
    lastHelloTime = millis();
    helloNumber++;
    char message[40];
    snprintf(message, sizeof(message), "Hello from ESP32 #%d", helloNumber);
    mqtt.publish(sendTopic, message);
    Serial.printf("Sent to %s: %s\n", sendTopic, message);
  }
}
