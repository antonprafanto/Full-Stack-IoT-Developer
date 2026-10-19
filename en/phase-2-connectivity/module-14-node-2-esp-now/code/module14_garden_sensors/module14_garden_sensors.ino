// Module 14 - Practice 2: the sensors of Node 2 "Garden" are read in a power-saving order, then packed into a 33-byte packet.
// No radio and no sleep yet: every 5 seconds one "fake wake", its results printed so you can check them.
// Circuit (PIN-MAP version 5): BME280 SDA -> D21, SCL -> D22; DS18B20 DAT -> D27; second soil sensor AOUT -> VN (GPIO 39),
// VCC -> D32 (NOT 3V3), GND -> GND. The BME280 and DS18B20 get 3.3 V from the mini breadboard's bottom rail (+).
// Libraries: Adafruit BME280 Library 2.3.0 (installed with it: Adafruit Unified Sensor 1.1.15, Adafruit BusIO 1.17.4),
// OneWire 2.3.8, DallasTemperature 4.0.6.

#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Adafruit_BME280.h>
#include "node2-packet.h"

// ---------- Replace with your own ----------
const bool CALIBRATION_MODE = false;  // true = only print the second soil sensor's raw values (the calibration step)
const int SOIL_DRY = 3000;            // raw value in air, measured with power from D32
const int SOIL_WET = 1300;            // raw value in water

// ---------- Fixed ----------
const int PIN_ONE_WIRE = 27;            // DS18B20
const int PIN_SDA = 21;                 // BME280
const int PIN_SCL = 22;
const int PIN_SOIL = 39;                // VN: the second soil sensor's AOUT
const int PIN_SOIL_POWER = 32;          // D32: the soil sensor's power, on only when needed
const unsigned long SOIL_SETTLE_MS = 300;  // wait after switching the soil sensor on before reading it
const uint8_t DS18B20_RESOLUTION = 10;  // 0.25 degrees, 188 ms at most

OneWire oneWire(PIN_ONE_WIRE);
DallasTemperature tempSensors(&oneWire);
Adafruit_BME280 bme;
uint16_t session = 0;
uint32_t sequence = 0;

static bool deviceAt(uint8_t address) {
  Wire.beginTransmission(address);
  return Wire.endTransmission() == 0;
}

// BME280 forced mode: measure once, then the sensor goes back to sleep by itself (0.1 uA) until told again.
static void readBme280(Node2Packet &p) {
  p.temperature = NAN;
  p.humidity = NAN;
  p.pressure = NAN;
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
    Serial.println("BME280 did not finish measuring.");
    return;
  }
  p.temperature = bme.readTemperature();
  p.humidity = bme.readHumidity();
  p.pressure = bme.readPressure() / 100.0f;  // the library gives pascals; divided by 100 it becomes hPa
}

// Average of 20 readings. An impossible raw value (sensor unplugged or without power) is sent as -1.
static int8_t readSoil(int &raw) {
  long sum = 0;
  for (int i = 0; i < 20; i++) {
    sum += analogRead(PIN_SOIL);
    delay(2);
  }
  raw = sum / 20;
  if (raw < SOIL_WET - 300 || raw > SOIL_DRY + 300) {
    return -1;
  }
  return constrain(map(raw, SOIL_DRY, SOIL_WET, 0, 100), 0, 100);
}

static void calibrate() {
  digitalWrite(PIN_SOIL_POWER, HIGH);
  unsigned long start = millis();
  const unsigned long POINTS[] = {10, 50, 100, 200, 400};
  Serial.print("Raw soil sensor values since switching on:");
  for (unsigned long t : POINTS) {
    while (millis() - start < t) {
      delay(1);
    }
    Serial.printf("  %lu ms: %d", t, analogRead(PIN_SOIL));
  }
  digitalWrite(PIN_SOIL_POWER, LOW);
  Serial.println();
}

static void fakeWake() {
  unsigned long t0 = millis();
  digitalWrite(PIN_SOIL_POWER, HIGH);  // 1. the soil sensor is switched on FIRST OF ALL: it needs time to settle

  Node2Packet p = {};
  p.mark = PACKET_MARK;
  p.version = PACKET_VERSION;
  p.fw[0] = 1;
  p.fw[1] = 0;
  p.fw[2] = 0;
  p.session = session;
  p.sequence = ++sequence;
  p.intervalSeconds = 300;
  p.attempt = 1;

  tempSensors.requestTemperatures();  // 2. the DS18B20 starts measuring, without waiting
  unsigned long dsStart = millis();
  readBme280(p);                      // 3. the BME280 is read while the DS18B20 is still measuring
  unsigned long tBme = millis() - t0;
  while (!tempSensors.isConversionComplete() && millis() - dsStart < 800) {  // 4. wait for the DS18B20 to finish
    delay(5);
  }
  float soilTemperature = tempSensors.getTempCByIndex(0);  // -127 if the sensor does not answer
  p.soilTemperature = (soilTemperature == DEVICE_DISCONNECTED_C) ? NAN : soilTemperature;
  unsigned long tDs = millis() - t0;
  while (millis() - t0 < SOIL_SETTLE_MS) {  // 5. has the soil sensor been on long enough?
    delay(1);
  }
  int raw = 0;
  p.soil = readSoil(raw);
  digitalWrite(PIN_SOIL_POWER, LOW);  // 6. the soil sensor is switched off again
  unsigned long tDone = millis() - t0;

  Serial.printf("Fake wake #%lu: BME280 done %lu ms, DS18B20 %lu ms, soil %lu ms.\n", (unsigned long)sequence,
                tBme, tDs, tDone);
  Serial.printf("  temperature %.1f C, humidity %.0f %%, pressure %.1f hPa, soil temperature %.2f C, soil %d %% (raw %d)\n",
                p.temperature, p.humidity, p.pressure, p.soilTemperature, p.soil, raw);
  const uint8_t *b = (const uint8_t *)&p;  // look at the packet byte by byte
  Serial.print("  packet 33 bytes:");
  for (size_t i = 0; i < sizeof(p); i++) {
    Serial.printf(" %02X", b[i]);
  }
  Serial.println();
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  pinMode(PIN_SOIL_POWER, OUTPUT);
  digitalWrite(PIN_SOIL_POWER, LOW);
  Wire.begin(PIN_SDA, PIN_SCL);
  tempSensors.begin();
  tempSensors.setResolution(DS18B20_RESOLUTION);  // the sensor's EEPROM is only written if the resolution differs
  tempSensors.setWaitForConversion(false);        // requestTemperatures() returns at once
  session = (uint16_t)(esp_random() | 1);
  Serial.println();
  Serial.printf("Practice 2: size of Node2Packet = %u bytes. DS18B20 found: %u.\n", (unsigned int)sizeof(Node2Packet),
                (unsigned int)tempSensors.getDeviceCount());
}

void loop() {
  if (CALIBRATION_MODE) {
    calibrate();
    delay(1600);
  } else {
    fakeWake();
    delay(5000);
  }
}
