// Module 21 - Practice 6, the SECOND board (a borrowed Node 2 board): the "intruder".
// Only for YOUR OWN broker (Mosquitto on the Pi gateway or on the laptop), not someone else's broker.
// This board connects to the broker with its OWN account, the test device c0ba00000001 that you registered legitimately in
// the backend, NOT with Node 1's account. Once it is let in, it tries three things it has no right to:
//   1. publish FAKE telemetry to Node 1's topic (msh/<NODE1_ID>/telemetry), then repeat it every 15 seconds
//   2. subscribe to all the project's messages (msh/#)
//   3. publish on behalf of Node 2 (msh/<NODE2_ID>/telemetry); in the access list, that right belongs only to Node 1
// The lesson: PubSubClient doesn't know the broker threw its message away (publish() still returns true), and the msh/#
// subscription "succeeds" but stays empty. The proof is in the broker log (the "Denied PUBLISH" line) and in the MQTTX
// monitor, which never receives those fake messages.
// When the practice is done: revoke the test device's key, then upload the Node 2 firmware (node-2-garden) to this board again.
// Library: PubSubClient3 version 3.3.2 (the same as Node 1). esp32 package 3.3.12.

#include <WiFi.h>
#include <PubSubClient.h>  // the PubSubClient3 library version 3.3.2
#include "secrets.h"       // WIFI_NAME, WIFI_PASSWORD, and INTRUDER_KEY; never uploaded to GitHub

#ifndef MQTT_QOS1  // only PubSubClient3 has this name
#error "The old PubSubClient (2.8) is in use. Remove it in the Library Manager, then install PubSubClient3 version 3.3.2."
#endif

const char BROKER_ADDRESS[] = "192.168.1.37";  // REPLACE with your Pi gateway's address (the same as Node 1)
const uint16_t BROKER_PORT = 1883;
const char NODE1_ID[] = "a4cf12e5b7c0";        // REPLACE with your Node 1's device_id: the topic to "fake"
const char NODE2_ID[] = "246f28b1c7d4";        // REPLACE with your Node 2's device_id
const char INTRUDER_NAME[] = "c0ba00000001";   // the test device's device_id = client name = broker username
const unsigned long FAKE_INTERVAL = 15000;     // the fake telemetry is repeated every 15 seconds
const unsigned long RETRY_INTERVAL = 30000;    // connect refused? try again 30 seconds later

WiFiClient netClient;              // TCP connection to the broker
PubSubClient mqtt(netClient);      // MQTT runs on top of that connection
char node1Topic[40];  // msh/<NODE1_ID>/telemetry
char node2Topic[40];  // msh/<NODE2_ID>/telemetry
unsigned long lastTryTime = 0;
unsigned long lastFakeTime = 0;
bool hasTried = false;
int fakeNumber = 0;

// Called by the library for every message from the msh/# subscription. If the broker access list is correct, another
// device's message never reaches here.
void onIncomingMessage(char* topic, byte* content, unsigned int length) {
  Serial.printf("[!] RECEIVED %s (%u bytes): if this is another device's message, the access list is leaking!\n", topic, length);
}

// Attempt 1: fake telemetry on behalf of Node 1. publish() returns true as soon as the message is handed to the TCP connection;
// in MQTT 3.1.1, PubSubClient is never told that the broker threw it away.
void publishFake() {
  fakeNumber++;
  char content[48];
  snprintf(content, sizeof(content), "{\"fw\":\"FAKE\",\"temperature\":99.9,\"n\":%d}", fakeNumber);
  bool ok = mqtt.publish(node1Topic, content);
  Serial.printf("[1] publish to %s -> publish() = %s (true does NOT mean the broker accepted it!)\n", node1Topic,
                ok ? "true" : "false");
}

// Connect with its own account, then three attempts the broker's access list (ACL) should refuse.
void tryToIntrude() {
  Serial.printf("Connecting to broker %s:%u as %s ...\n", BROKER_ADDRESS, BROKER_PORT, INTRUDER_NAME);
  if (!mqtt.connect(INTRUDER_NAME, INTRUDER_NAME, INTRUDER_KEY)) {
    int code = mqtt.state();
    Serial.printf("[x] broker refused the CONNECT (code %d): %s Retrying in %lu seconds.\n", code,
                  code == 5 ? "the test device's key is wrong or has been revoked." : "see the state() code table in Module 11.",
                  RETRY_INTERVAL / 1000);
    return;
  }
  Serial.printf("[ok] CONNECT accepted: account %s is indeed valid. Now trying what it has no right to.\n", INTRUDER_NAME);
  publishFake();
  lastFakeTime = millis();
  bool ok = mqtt.subscribe("msh/#", 1);  // also true: PubSubClient doesn't check the broker's answer (SUBACK)
  Serial.printf("[2] subscribe msh/# -> subscribe() = %s. No [!] line appears? The subscription is accepted, but empty.\n",
                ok ? "true" : "false");
  ok = mqtt.publish(node2Topic, "{\"fw\":\"FAKE-N2\"}");
  Serial.printf("[3] publish to %s -> publish() = %s\n", node2Topic, ok ? "true" : "false");
  Serial.println("[i] Now look at the broker log (Denied PUBLISH ...) and the MQTTX monitor: the fake messages don't arrive.");
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.println("Intruder (a borrowed Node 2 board). Only for the Module 21 broker access-list practice.");
  snprintf(node1Topic, sizeof(node1Topic), "msh/%s/telemetry", NODE1_ID);
  snprintf(node2Topic, sizeof(node2Topic), "msh/%s/telemetry", NODE2_ID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_NAME, WIFI_PASSWORD);
  Serial.printf("Connecting to WiFi \"%s\"", WIFI_NAME);
  while (WiFi.status() != WL_CONNECTED) {  // waiting here is fine: a small practice sketch without a watchdog
    Serial.print(".");
    delay(250);
  }
  Serial.println(" connected.");
  mqtt.setServer(BROKER_ADDRESS, BROKER_PORT);
  mqtt.setCallback(onIncomingMessage);
}

void loop() {
  if (!mqtt.connected()) {
    if (!hasTried || millis() - lastTryTime >= RETRY_INTERVAL) {
      hasTried = true;
      lastTryTime = millis();
      tryToIntrude();
    }
    return;
  }
  mqtt.loop();  // keeps the connection alive, and runs onIncomingMessage() if a message comes in
  if (millis() - lastFakeTime >= FAKE_INTERVAL) {
    lastFakeTime = millis();
    publishFake();
  }
}
