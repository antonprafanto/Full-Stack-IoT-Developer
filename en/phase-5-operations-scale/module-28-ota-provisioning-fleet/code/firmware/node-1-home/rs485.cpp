// rs485.cpp - the code of the rs485 module (Module 15). Its functions are listed in rs485.h.
// Node 1 becomes a Modbus RTU client (formerly called master): every 10 seconds it asks the RS-485 soil sensor
// "what is in registers 0 to 2?", then keeps the reply for the next telemetry.
// The register map follows the datasheet of Module 15's mock sensor (Practice 2). A real sensor has its own map:
// adapt FIRST_REGISTER, REGISTER_COUNT, and updateRS485() to its datasheet.
#include <Arduino.h>
#include <ModbusMaster.h>  // ModbusMaster library (Module 15)
#include "config.h"
#include "logger.h"
#include "settings.h"
#include "rs485.h"

const int TIMEOUTS_BEFORE_SLOW = 3;  // 3 times in a row without a reply: the sensor is read less often
const uint16_t FIRST_REGISTER = 0;   // the mock sensor's register map: from register 0 ...
const uint16_t REGISTER_COUNT = 3;   // ... 3 registers (moisture, temperature, EC)

static ModbusMaster sensor;
static bool serialReady = false;     // Serial2 and ModbusMaster started already?
static bool everRead = false;
static bool readingValid = false;    // true if the last reading succeeded
static float soilRs485 = NAN;        // % soil moisture: register 0 divided by 10
static float soilTemperature = NAN;  // °C: register 1 divided by 10, signed
static int ec = 0;                   // µS/cm: register 2
static unsigned long lastReadTime = 0;
static unsigned long transactionMs = 0;  // ms, the last reading
static uint8_t lastCode = 0;
static int timeoutStreak = 0;
static unsigned long okCount = 0;
static unsigned long timeoutCount = 0;
static unsigned long otherErrorCount = 0;

// Called by ModbusMaster right before it sends a request.
static void beforeSend() {
  digitalWrite(PIN_RS485_DE_RE, HIGH);  // press the talk button
}

// Called by ModbusMaster after Serial2.flush(): the last byte of the request has gone out.
static void afterSend() {
  digitalWrite(PIN_RS485_DE_RE, LOW);  // release the talk button: listen for the reply
  while (Serial2.available() > 0) {
    Serial2.read();  // throw away any garbage read while Node 1 was talking
  }
}

static const char* codeMeaning(uint8_t code) {
  switch (code) {
    case ModbusMaster::ku8MBSuccess: return "success";
    case ModbusMaster::ku8MBIllegalFunction: return "exception 01: function unknown to the sensor";
    case ModbusMaster::ku8MBIllegalDataAddress: return "exception 02: register does not exist";
    case ModbusMaster::ku8MBIllegalDataValue: return "exception 03: request not valid";
    case ModbusMaster::ku8MBSlaveDeviceFailure: return "exception 04: sensor failure";
    case ModbusMaster::ku8MBInvalidSlaveID: return "reply address wrong";
    case ModbusMaster::ku8MBInvalidFunction: return "reply function code wrong";
    case ModbusMaster::ku8MBResponseTimedOut: return "no reply (timeout)";
    case ModbusMaster::ku8MBInvalidCRC: return "reply CRC wrong";
    default: return "another code";
  }
}

static void startSerial() {
  if (serialReady) {
    return;
  }
  // The pins MUST be written: without them, the esp32 3.x package uses GPIO 4 and 25 for Serial2 (Node 1: DE/RE, pump).
  Serial2.begin(RS485_BAUD, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);
  sensor.begin(RS485_SENSOR_ADDRESS, Serial2);
  sensor.preTransmission(beforeSend);
  sensor.postTransmission(afterSend);
  serialReady = true;
}

void setupRS485() {
  pinMode(PIN_RS485_DE_RE, OUTPUT);
  digitalWrite(PIN_RS485_DE_RE, LOW);  // listening: Node 1's MAX485 module doesn't hold the cable
  if (rs485SensorEnabled()) {
    startSerial();
    logInfo("RS-485 sensor in use: server %u, %lu baud, read every %lu seconds", RS485_SENSOR_ADDRESS, RS485_BAUD,
            RS485_READ_INTERVAL / 1000);
  } else {
    logInfo("RS-485 sensor not in use. Is it connected? Type: rs485 on");
  }
}

// One Modbus transaction: function 03, REGISTER_COUNT registers from FIRST_REGISTER. If the sensor is silent,
// ModbusMaster waits up to 2 seconds.
static uint8_t readRegisters() {
  unsigned long start = millis();
  uint8_t code = sensor.readHoldingRegisters(FIRST_REGISTER, REGISTER_COUNT);
  bool broken = code == ModbusMaster::ku8MBInvalidSlaveID || code == ModbusMaster::ku8MBInvalidFunction ||
                code == ModbusMaster::ku8MBInvalidCRC;
  if (broken && millis() - start < 100UL * 9600 / RS485_BAUD) {
    // The reply was damaged on the way (often by one "ghost byte") and came quickly. ModbusMaster stops reading once
    // the address or function in the reply is wrong, though the sensor may still be sending the rest. Wait until the
    // cable is quiet (the rest of the reply plus the gap between frames: under 20 ms at 9600 baud,
    // twice that at 4800 baud), then try once more.
    delay(20UL * 9600 / RS485_BAUD);
    code = sensor.readHoldingRegisters(FIRST_REGISTER, REGISTER_COUNT);
  }
  return code;
}

static unsigned long currentInterval() {
  if (timeoutStreak >= TIMEOUTS_BEFORE_SLOW) {
    return RS485_SLOW_READ_INTERVAL;  // the sensor stays silent: don't make loop() wait 2 seconds every 10 seconds
  }
  return RS485_READ_INTERVAL;
}

void updateRS485() {
  if (!rs485SensorEnabled()) {
    return;
  }
  if (everRead && millis() - lastReadTime < currentInterval()) {
    return;
  }
  everRead = true;
  unsigned long start = millis();
  uint8_t code = readRegisters();
  lastReadTime = millis();
  transactionMs = lastReadTime - start;
  lastCode = code;
  if (code == ModbusMaster::ku8MBSuccess) {
    soilRs485 = sensor.getResponseBuffer(0) / 10.0f;                  // datasheet: x10
    soilTemperature = (int16_t)sensor.getResponseBuffer(1) / 10.0f;   // x10 and signed: can be below zero
    ec = sensor.getResponseBuffer(2);                                 // no multiplier
    readingValid = true;
    timeoutStreak = 0;
    okCount++;
    logInfo("RS-485: soil_rs485=%.1f %%  soil_temperature=%.1f C  ec=%d uS/cm  (%lu ms)", soilRs485, soilTemperature, ec,
            transactionMs);
    return;
  }
  readingValid = false;  // data contract: a failed reading is written as null
  if (code == ModbusMaster::ku8MBResponseTimedOut) {
    timeoutStreak++;
    timeoutCount++;
  } else {
    timeoutStreak = 0;  // there was a reply, even a wrong one: the sensor is alive
    otherErrorCount++;
  }
  logError("RS-485 failed: %s (code 0x%02X, %lu ms)", codeMeaning(code), code, transactionMs);
  if (timeoutStreak == TIMEOUTS_BEFORE_SLOW) {
    logError("RS-485 sensor did not answer %d times in a row: from now on it is tried every %lu seconds.",
             TIMEOUTS_BEFORE_SLOW, RS485_SLOW_READ_INTERVAL / 1000);
  }
}

void writeRS485Fields(JsonDocument& doc) {
  if (!rs485SensorEnabled()) {
    return;  // no sensor connected: its fields are not written at all (data contract, rule 9)
  }
  if (!readingValid) {
    doc["soil_rs485"] = nullptr;  // a failed (or missing) reading is written as null
    doc["soil_temperature"] = nullptr;
    doc["ec"] = nullptr;
    return;
  }
  doc["soil_rs485"] = soilRs485;  // already one decimal place: the register content divided by 10
  doc["soil_temperature"] = soilTemperature;
  doc["ec"] = ec;
}

void useRS485(bool enabled) {
  saveRs485SensorEnabled(enabled);  // settings.cpp: saved in NVS, still in effect after a restart
  readingValid = false;
  timeoutStreak = 0;
  everRead = false;  // when switched on: read as soon as possible
  if (enabled) {
    startSerial();
  }
}

void printRS485Info() {
  if (!rs485SensorEnabled()) {
    Serial.println("rs485: not in use, so its fields are not in telemetry. Is the sensor connected? Type: rs485 on");
    return;
  }
  Serial.printf("rs485: in use, server %u, %lu baud 8N1, read every %lu seconds\n", RS485_SENSOR_ADDRESS, RS485_BAUD,
                currentInterval() / 1000);
  if (!everRead) {
    Serial.println("rs485: no reading yet");
  } else if (readingValid) {
    Serial.printf("rs485: last reading soil_rs485=%.1f %% soil_temperature=%.1f C ec=%d uS/cm (%lu s ago, %lu ms)\n",
                  soilRs485, soilTemperature, ec, (millis() - lastReadTime) / 1000, transactionMs);
  } else {
    Serial.printf("rs485: last reading FAILED: %s (code 0x%02X, %lu s ago)\n", codeMeaning(lastCode),
                  lastCode, (millis() - lastReadTime) / 1000);
  }
  Serial.printf("rs485: succeeded %lu, timeouts %lu, other errors %lu\n", okCount, timeoutCount, otherErrorCount);
}
