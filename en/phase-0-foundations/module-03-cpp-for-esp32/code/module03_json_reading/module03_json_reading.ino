// Module 3 - Practice 7 (extra step): struct SensorReading -> JSON with the ArduinoJson library
// Needs ArduinoJson version 7.4.3 (install it with the Library Manager; in Wokwi via libraries.txt).
// The result resembles the project's "telemetry" message (data contract, Syllabus Appendix A), sent from Module 11 on.

#include <ArduinoJson.h>  // the gateway to the ArduinoJson library

struct SensorReading {
  float temperature;
  int humidity;
  int light;
  bool motion;
};

SensorReading readFakeSensor() {
  SensorReading b;
  b.temperature = random(250, 330) / 10.0;
  b.humidity = random(55, 85);
  b.light = random(0, 4096);
  b.motion = (random(0, 2) == 1);
  return b;
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.println("Sensor readings (fake) in JSON format:");
}

void loop() {
  SensorReading reading = readFakeSensor();

  JsonDocument doc;  // an empty JSON "envelope"
  doc["temperature"] = reading.temperature;
  doc["humidity"] = reading.humidity;
  doc["light"] = reading.light;
  doc["motion"] = reading.motion;

  serializeJson(doc, Serial);  // write the JSON to the Serial Monitor
  Serial.println();            // move to a new line
  delay(2000);
}
