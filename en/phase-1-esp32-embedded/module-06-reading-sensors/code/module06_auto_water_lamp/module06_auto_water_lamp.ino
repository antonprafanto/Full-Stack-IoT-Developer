// Module 6 - Practice 8: automatic watering and automatic lamp
// Watering: dry soil -> pump for 3 seconds, BUT refused if the water tank is too low.
// Lamp: motion in the dark -> lamp relay on; all quiet again -> off.
// It's Practice 7 plus two rules below the "NEW in Practice 8" markers.
// Library: DHT sensor library by Adafruit 1.4.7 (+ Adafruit Unified Sensor 1.1.15).

#include <DHT.h>

// ---------- Canonical pin map ----------
const int PIN_DHT = 14;         // D14: DHT22
const int PIN_LDR = 36;         // VP: LDR
const int PIN_SOIL = 39;        // VN: capacitive soil sensor
const int PIN_PIR = 34;         // D34: PIR
const int PIN_TRIG = 15;        // D15: HC-SR04 TRIG
const int PIN_ECHO = 35;        // D35: HC-SR04 ECHO, through a voltage divider
const int PIN_PUMP = 25;        // D25: pump MOSFET gate (Module 5)
const int PIN_LAMP_RELAY = 32;  // D32: lamp relay, active-LOW (Module 5)

// ---------- Your calibration results (Practices 3 and 6) ----------
const int SOIL_DRY = 3000;          // raw soil sensor value in air
const int SOIL_WET = 1300;          // raw soil sensor value in water
const float DISTANCE_EMPTY = 20.0;  // cm: from the sensor to the bottom of the tank
const float DISTANCE_FULL = 5.0;    // cm: from the sensor to the water surface when the tank is full

// ---------- Automation rules (NEW in Practice 8) ----------
const int SOIL_WATERING_THRESHOLD = 30;  // soil below 30% = dry, needs watering (Appendix A: soil_watering)
const int MIN_WATER_LEVEL = 20;          // the pump is refused if the tank is less than 20% full
const int WATERING_SECONDS = 3;          // how long the pump runs
const int WATERING_COOLDOWN = 15;        // after a watering attempt, wait 15 reports (about 30 seconds)
const int DARK_THRESHOLD = 1000;         // light below this counts as dark

DHT dht(PIN_DHT, DHT22);

struct SensorReading {
  float temperature;  // degrees Celsius; NAN if the DHT22 can't be read
  int humidity;       // percent; -1 if the DHT22 can't be read
  int light;          // 0 (pitch dark) to 4095 (very bright)
  int soil;           // percent: 0 = as dry as in air, 100 = as wet as in water
  bool motion;        // true if the PIR sees motion
  int water_level;    // percent of the tank filled; -1 if the HC-SR04 echo doesn't come back
};

bool lampOn = false;
int wateringCooldownLeft = 0;  // how many more reports before watering may be tried again

// ---------- Reading the sensors (same as Practice 7) ----------
int readAnalogAverage(int pin) {
  long sum = 0;
  for (int i = 0; i < 20; i++) {
    sum += analogRead(pin);
    delay(2);
  }
  return sum / 20;
}

int readLight() {
  return 4095 - readAnalogAverage(PIN_LDR);
}

int readSoilPercent() {
  int percent = map(readAnalogAverage(PIN_SOIL), SOIL_DRY, SOIL_WET, 0, 100);
  return constrain(percent, 0, 100);
}

float measureDistanceCm() {
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

int readWaterLevel() {
  float distance = measureDistanceCm();
  if (distance < 0) {
    return -1;
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
    b.humidity = round(humidity);
  }
  b.light = readLight();
  b.soil = readSoilPercent();
  b.motion = digitalRead(PIN_PIR) == HIGH;
  b.water_level = readWaterLevel();
  return b;
}

void printValue(int value) {
  if (value < 0) {
    Serial.print("--");
  } else {
    Serial.print(value);
  }
}

void printReading(SensorReading b) {
  Serial.print("temperature=");
  if (isnan(b.temperature)) {
    Serial.print("--");
  } else {
    Serial.print(b.temperature, 1);
  }
  Serial.print(" C  humidity=");
  printValue(b.humidity);
  Serial.print(" %  light=");
  Serial.print(b.light);
  Serial.print("  soil=");
  Serial.print(b.soil);
  Serial.print(" %  motion=");
  if (b.motion) {
    Serial.print("yes");
  } else {
    Serial.print("no");
  }
  Serial.print("  water_level=");
  printValue(b.water_level);
  Serial.println(" %");
}

// ---------- NEW in Practice 8: actuators and two automation rules ----------
void setLamp(bool isOn) {
  lampOn = isOn;
  if (isOn) {
    digitalWrite(PIN_LAMP_RELAY, LOW);  // active-LOW relay
  } else {
    digitalWrite(PIN_LAMP_RELAY, HIGH);
  }
}

// The pump only runs if the tank has enough water, measured right before the pump starts.
void runPump(int seconds) {
  seconds = constrain(seconds, 1, 10);  // safety limit: 1-10 seconds
  delay(60);  // HC-SR04 datasheet: wait at least 60 ms after the previous measurement (Concept 10)
  int waterLevel = readWaterLevel();
  if (waterLevel < MIN_WATER_LEVEL) {  // -1 (unreadable) is smaller too, so it is refused as well
    Serial.print("pump REFUSED: water level ");
    if (waterLevel < 0) {
      Serial.println("unreadable");
    } else {
      Serial.print("only ");
      Serial.print(waterLevel);
      Serial.println(" %");
    }
    return;
  }
  Serial.print("pump running for ");
  Serial.print(seconds);
  Serial.println(" seconds...");
  digitalWrite(PIN_PUMP, HIGH);
  delay(seconds * 1000);  // still blocks for now; Module 8 makes it work without delay()
  digitalWrite(PIN_PUMP, LOW);
}

void autoWatering(SensorReading b) {
  if (wateringCooldownLeft > 0) {  // just tried to water: wait first
    wateringCooldownLeft--;
    return;
  }
  if (b.soil < SOIL_WATERING_THRESHOLD) {
    Serial.print("Dry soil (");
    Serial.print(b.soil);
    Serial.print(" %): ");
    runPump(WATERING_SECONDS);                 // the tank safety check is inside runPump()
    wateringCooldownLeft = WATERING_COOLDOWN;  // pumped or refused: don't retry for about 30 seconds
  }
}

void autoLamp(SensorReading b) {
  bool dark = b.light < DARK_THRESHOLD;
  if (b.motion && dark && !lampOn) {
    Serial.println("Motion in the dark: lamp on.");
    setLamp(true);
  }
  if (!b.motion && lampOn) {
    Serial.println("All quiet: lamp off.");
    setLamp(false);
  }
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  digitalWrite(PIN_TRIG, LOW);
  pinMode(PIN_PUMP, OUTPUT);
  digitalWrite(PIN_PUMP, LOW);
  pinMode(PIN_LAMP_RELAY, OUTPUT);
  setLamp(false);  // switch off right away: pinMode(OUTPUT) has just made the pin LOW (= relay pulls in)
  Serial.println("Automatic watering and automatic lamp are active.");
}

void loop() {
  delay(2000);
  SensorReading reading = readSensors();
  printReading(reading);
  autoWatering(reading);
  autoLamp(reading);
}
