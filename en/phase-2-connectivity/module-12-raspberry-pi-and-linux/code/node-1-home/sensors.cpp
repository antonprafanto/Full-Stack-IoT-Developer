// sensors.cpp - the code of the sensors module. Its functions are listed in sensors.h.
#include <Arduino.h>
#include <DHT.h>
#include "config.h"
#include "sensors.h"

static DHT dht(PIN_DHT, DHT22);
static SensorReading last = {NAN, -1, 0, 0, false, -1};  // before the first reading: everything is "unknown yet"

// ---------- Moving average for the LDR and the soil sensor (Module 6, Practice 2) ----------
// Every 2 ms, one new analog reading goes into a "drawer", replacing the oldest drawer.
// Twenty drawers x 2 ms = the average of the last 40 ms, just like Module 6, but without delay().
const int DRAWER_COUNT = 20;
static int lightDrawers[DRAWER_COUNT];
static int soilDrawers[DRAWER_COUNT];
static int drawerPosition = 0;
static unsigned long lastSampleTime = 0;

void setupSensors() {
  dht.begin();
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_TRIG, OUTPUT);
  digitalWrite(PIN_TRIG, LOW);
  pinMode(PIN_ECHO, INPUT);

  // Fill every drawer with the first reading so the average makes sense right away.
  int light = analogRead(PIN_LDR);
  int soil = analogRead(PIN_SOIL);
  for (int i = 0; i < DRAWER_COUNT; i++) {
    lightDrawers[i] = light;
    soilDrawers[i] = soil;
  }
}

void updateSensors() {
  unsigned long now = millis();
  if (now - lastSampleTime < 2) {
    return;  // not 2 ms since the last sample yet
  }
  lastSampleTime = now;
  lightDrawers[drawerPosition] = analogRead(PIN_LDR);
  soilDrawers[drawerPosition] = analogRead(PIN_SOIL);
  drawerPosition++;
  if (drawerPosition >= DRAWER_COUNT) {
    drawerPosition = 0;  // back to the first drawer
  }
}

// The average of all the drawers. "int drawers[]" means this function accepts any row of drawers you pass to it.
static int drawerAverage(int drawers[]) {
  long sum = 0;
  for (int i = 0; i < DRAWER_COUNT; i++) {
    sum += drawers[i];
  }
  return sum / DRAWER_COUNT;
}

static int readLight() {
  return 4095 - drawerAverage(lightDrawers);  // inverted: the brighter it is, the bigger the number
}

static int readSoilPercent() {
  int percent = map(drawerAverage(soilDrawers), SOIL_DRY, SOIL_WET, 0, 100);
  return constrain(percent, 0, 100);
}

// Measures the distance once, in cm. Returns -1 if the echo doesn't come back.
// pulseIn() waits 30 ms at most; readSensors() only calls it every 2 seconds,
// so the 60 ms gap between HC-SR04 measurements (Module 6) is always kept.
static float measureDistanceCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long duration = pulseIn(PIN_ECHO, HIGH, 30000);
  if (duration == 0) {
    return -1;
  }
  return duration / 58.0;
}

static int readWaterLevel() {
  float distance = measureDistanceCm();
  if (distance < 0) {
    return -1;  // unknown
  }
  int percent = (DISTANCE_EMPTY - distance) * 100 / (DISTANCE_EMPTY - DISTANCE_FULL);
  return constrain(percent, 0, 100);
}

SensorReading readSensors() {
  SensorReading b;
  b.temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  if (isnan(humidity)) {
    b.humidity = -1;
  } else {
    b.humidity = round(humidity);  // rounded to the nearest whole number
  }
  b.light = readLight();
  b.soil = readSoilPercent();
  b.motion = digitalRead(PIN_PIR) == HIGH;
  b.water_level = readWaterLevel();
  last = b;
  return b;
}

SensorReading lastReading() {
  return last;
}

bool sensorProblem(SensorReading b) {
  return isnan(b.temperature) || b.humidity < 0 || b.water_level < 0;
}
