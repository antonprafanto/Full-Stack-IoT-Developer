// Module 6 - Practice 7: Node 1's five-sensor monitor, one neat line every 2 seconds
// All readings go into one SensorReading form whose field names
// match the data contract (Syllabus Appendix A) exactly: temperature, humidity, light, soil, motion, water_level.
// Library: DHT sensor library by Adafruit 1.4.7 (+ Adafruit Unified Sensor 1.1.15).

#include <DHT.h>

// ---------- Canonical pin map (Module 6 sensors) ----------
const int PIN_DHT = 14;   // D14: DHT22
const int PIN_LDR = 36;   // VP: LDR
const int PIN_SOIL = 39;  // VN: capacitive soil sensor
const int PIN_PIR = 34;   // D34: PIR
const int PIN_TRIG = 15;  // D15: HC-SR04 TRIG
const int PIN_ECHO = 35;  // D35: HC-SR04 ECHO, through a voltage divider

// ---------- Your calibration results (Practices 3 and 6) ----------
const int SOIL_DRY = 3000;          // raw soil sensor value in air
const int SOIL_WET = 1300;          // raw soil sensor value in water
const float DISTANCE_EMPTY = 20.0;  // cm: from the sensor to the bottom of the tank
const float DISTANCE_FULL = 5.0;    // cm: from the sensor to the water surface when the tank is full

DHT dht(PIN_DHT, DHT22);

// The sensor data form. Its field names match the data contract (Syllabus Appendix A) EXACTLY.
struct SensorReading {
  float temperature;  // degrees Celsius; NAN if the DHT22 can't be read
  int humidity;       // percent; -1 if the DHT22 can't be read
  int light;          // 0 (pitch dark) to 4095 (very bright)
  int soil;           // percent: 0 = as dry as in air, 100 = as wet as in water
  bool motion;        // true if the PIR sees motion
  int water_level;    // percent of the tank filled; -1 if the HC-SR04 echo doesn't come back
};

// Averages 20 analog readings in a row to smooth out the noise (Concept 4).
int readAnalogAverage(int pin) {
  long sum = 0;
  for (int i = 0; i < 20; i++) {
    sum += analogRead(pin);
    delay(2);
  }
  return sum / 20;
}

int readLight() {
  return 4095 - readAnalogAverage(PIN_LDR);  // inverted: the brighter it is, the bigger the number
}

int readSoilPercent() {
  int percent = map(readAnalogAverage(PIN_SOIL), SOIL_DRY, SOIL_WET, 0, 100);
  return constrain(percent, 0, 100);
}

// Measures the distance once, in cm. Returns -1 if the echo doesn't come back.
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
    return -1;  // unknown
  }
  int percent = (DISTANCE_EMPTY - distance) * 100 / (DISTANCE_EMPTY - DISTANCE_FULL);
  return constrain(percent, 0, 100);
}

// Fills in the form with the readings of all five sensors.
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
  return b;
}

// Prints a number, or "--" if the value is not valid (less than 0).
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

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  digitalWrite(PIN_TRIG, LOW);
  Serial.println("Node 1 five-sensor monitor. One line every 2 seconds.");
}

void loop() {
  delay(2000);  // also meets the DHT22's rule: at most once every 2 seconds
  SensorReading reading = readSensors();
  printReading(reading);
}
