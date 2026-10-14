// Module 9 - Practice 6: Node 1 becomes a current meter for the second board (the future Node 2)
// The Node 1 board (powered from the laptop's USB) reads the INA219 module on its I2C bus, address 0x40:
//   VCC to the bottom rail (+) 3.3 V, GND to the bottom rail (-), SCL to strip 19, SDA to strip 20 (like the BME280 in Module 7).
//   The INA219's VIN+ and VIN- pins are inserted in the 5 V wire from the MT3608 to the second board's VIN pin.
// Every second: the average, min, and max current. Every time the second board wakes up again: a summary of one cycle.
// Library: Adafruit INA219 1.2.3 (installed with it: Adafruit BusIO 1.17.4).

#include <Wire.h>
#include <Adafruit_INA219.h>

const unsigned long SAMPLE_INTERVAL = 5;     // ms: one current reading every 5 ms (200 times per second)
const unsigned long REPORT_INTERVAL = 1000;  // ms: one report line every 1 second
const float WAKE_THRESHOLD = 20.0;           // mA: above this, the second board counts as awake
const int SAMPLES_SURELY_AWAKE = 3;          // 3 readings in a row above the threshold = really awake
const int SAMPLES_SURELY_ASLEEP = 20;        // 20 readings in a row (100 ms) below the threshold = really asleep

Adafruit_INA219 ina219;  // default address 0x40
bool ina219Found = false;

unsigned long lastSampleTime = 0;
unsigned long lastReportTime = 0;

// Statistics for the report every second
float currentSumThisSecond = 0;
int samplesThisSecond = 0;
float minCurrent = 0;
float maxCurrent = 0;
float lastVoltage = 0;

// The second board's wake-sleep cycle
bool isAwake = false;
int aboveInARow = 0;    // how many readings in a row above the threshold
int belowInARow = 0;    // how many readings in a row below the threshold
float awakeCurrentSum = 0;
unsigned long awakeSamples = 0;
float asleepCurrentSum = 0;
unsigned long asleepSamples = 0;

void printCycleSummary() {
  float awakeSeconds = awakeSamples * SAMPLE_INTERVAL / 1000.0;
  float asleepSeconds = asleepSamples * SAMPLE_INTERVAL / 1000.0;
  float awakeAverage = awakeCurrentSum / awakeSamples;
  float asleepAverage = asleepCurrentSum / asleepSamples;
  float cycleAverage = (awakeCurrentSum + asleepCurrentSum) / (awakeSamples + asleepSamples);
  Serial.printf("CYCLE: awake %.2f seconds, average %.1f mA | asleep %.2f seconds, average %.2f mA | cycle average %.2f mA\n",
                awakeSeconds, awakeAverage, asleepSeconds, asleepAverage, cycleAverage);
}

void takeSample() {
  float current = ina219.getCurrent_mA();
  lastVoltage = ina219.getBusVoltage_V();

  if (samplesThisSecond == 0 || current < minCurrent) {
    minCurrent = current;
  }
  if (samplesThisSecond == 0 || current > maxCurrent) {
    maxCurrent = current;
  }
  currentSumThisSecond += current;
  samplesThisSecond++;

  // Awake or asleep? It takes several readings in a row, so that a moment of noise doesn't count.
  if (current > WAKE_THRESHOLD) {
    aboveInARow++;
    belowInARow = 0;
  } else {
    belowInARow++;
    aboveInARow = 0;
  }
  if (!isAwake && aboveInARow >= SAMPLES_SURELY_AWAKE) {
    if (awakeSamples > 0 && asleepSamples > 0) {  // one complete cycle has been recorded
      printCycleSummary();
    }
    isAwake = true;
    awakeCurrentSum = 0;
    awakeSamples = 0;
    asleepCurrentSum = 0;
    asleepSamples = 0;
  }
  if (isAwake && belowInARow >= SAMPLES_SURELY_ASLEEP) {
    isAwake = false;
  }

  if (isAwake) {
    awakeCurrentSum += current;
    awakeSamples++;
  } else {
    asleepCurrentSum += current;
    asleepSamples++;
  }
}

void report(unsigned long now) {
  if (samplesThisSecond == 0) {
    return;
  }
  Serial.printf("[%5lu s] %6.2f mA (min %.2f, max %.2f)  %.2f V  %s\n", now / 1000,
                currentSumThisSecond / samplesThisSecond, minCurrent, maxCurrent, lastVoltage,
                isAwake ? "AWAKE" : "asleep");
  currentSumThisSecond = 0;
  samplesThisSecond = 0;
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Wire.begin();  // SDA = D21, SCL = D22, like Node 1's OLED display
  ina219Found = ina219.begin();
  if (ina219Found) {
    ina219.setCalibration_16V_400mA();  // a range up to 400 mA, finer readings for small currents
    Serial.println("Practice 6 - INA219 current meter ready. Wake threshold: 20 mA.");
  }
}

void loop() {
  unsigned long now = millis();

  if (!ina219Found) {
    if (now - lastReportTime >= 2000) {
      lastReportTime = now;
      Serial.println("INA219 not answering at address 0x40. Check the VCC, GND, SCL, and SDA wires, then press EN.");
    }
    return;
  }

  if (now - lastSampleTime >= SAMPLE_INTERVAL) {
    lastSampleTime = now;
    takeSample();
  }
  if (now - lastReportTime >= REPORT_INTERVAL) {
    lastReportTime = now;
    report(now);
  }
}
