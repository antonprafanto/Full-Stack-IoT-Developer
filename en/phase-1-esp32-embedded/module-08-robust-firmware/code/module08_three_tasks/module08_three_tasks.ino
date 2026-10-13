// Module 8 - Practice 2: three tasks, one loop()
// Circuit: the Node 1 workbench (Module 7). Used here: status LED D4, button D13,
// lamp relay D32, fan relay D33, and the DHT22 on D14.
// Library: DHT sensor library 1.4.7 (installed with it: Adafruit Unified Sensor 1.1.15).
//
// Task 1 - heartbeat: status LED blinks slowly = normal, blinks fast = sensor problem.
// Task 2 - sensor: the DHT22 is read every 2 seconds.
// Task 3 - button: short press = lamp, long press (1 second) = fan.

#include <DHT.h>

const int PIN_STATUS_LED = 4;
const int PIN_BUTTON = 13;
const int PIN_LAMP_RELAY = 32;  // active-LOW relay
const int PIN_FAN_RELAY = 33;   // active-LOW relay
const int PIN_DHT = 14;

// Schedule, all in milliseconds
const unsigned long NORMAL_BEAT = 1000;      // one blink every 1 second
const unsigned long PROBLEM_BEAT = 250;      // four blinks every 1 second
const unsigned long BEAT_ON_TIME = 100;      // the LED is on for 100 ms at the start of each beat
const unsigned long READ_INTERVAL = 2000;    // the DHT22 is read every 2 seconds
const unsigned long DEBOUNCE_DELAY = 30;     // the button reading must stay steady this long
const unsigned long LONG_PRESS_TIME = 1000;  // held for 1 second or more = long press

DHT dht(PIN_DHT, DHT22);

// Each task's time notes and state
unsigned long beatStartTime = 0;
bool sensorProblem = false;

unsigned long lastReadTime = 0;

int previousReading = HIGH;  // the button reading on the previous pass; HIGH = released
unsigned long lastChangeTime = 0;
int stableButton = HIGH;     // the button state we already trust (steady for 30 ms)
unsigned long pressStartTime = 0;
bool longPressDone = false;

bool lampOn = false;
bool fanOn = false;

// loop() health meter
unsigned long loopCount = 0;
unsigned long longestLoopUs = 0;  // microseconds

void setRelay(int pin, bool isOn) {
  if (isOn) {
    digitalWrite(pin, LOW);  // active-LOW relay
  } else {
    digitalWrite(pin, HIGH);
  }
}

const char* onOffText(bool isOn) {
  if (isOn) {
    return "on";
  }
  return "off";
}

// ---------- Task 1: heartbeat ----------
void updateHeartbeat() {
  unsigned long now = millis();
  unsigned long beatLength = NORMAL_BEAT;
  if (sensorProblem) {
    beatLength = PROBLEM_BEAT;
  }
  if (now - beatStartTime >= beatLength) {
    beatStartTime = now;  // start the next beat
  }
  // The LED is on only at the start of a beat: true = HIGH (on), false = LOW (off)
  digitalWrite(PIN_STATUS_LED, now - beatStartTime < BEAT_ON_TIME);
}

// ---------- Task 2: read the DHT22 every 2 seconds ----------
void readSensorOnSchedule() {
  if (millis() - lastReadTime < READ_INTERVAL) {
    return;  // not time yet: return at once, don't wait
  }
  lastReadTime = millis();

  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  sensorProblem = isnan(temperature) || isnan(humidity);

  if (sensorProblem) {
    Serial.print("DHT22 can't be read! Status LED blinks fast.");
  } else {
    Serial.print("temperature=");
    Serial.print(temperature, 1);
    Serial.print(" C  humidity=");
    Serial.print(humidity, 0);
    Serial.print(" %");
  }
  Serial.print("  | loop(): ");
  Serial.print(loopCount);
  Serial.print(" passes, longest ");
  Serial.print(longestLoopUs / 1000.0, 1);
  Serial.println(" ms");
  loopCount = 0;
  longestLoopUs = 0;
}

// ---------- Task 3: the button, short press and long press ----------
void shortPress() {
  lampOn = !lampOn;
  setRelay(PIN_LAMP_RELAY, lampOn);
  Serial.print("Short press: lamp ");
  Serial.println(onOffText(lampOn));
}

void longPress() {
  fanOn = !fanOn;
  setRelay(PIN_FAN_RELAY, fanOn);
  Serial.print("Long press: fan ");
  Serial.println(onOffText(fanOn));
}

void checkButton() {
  unsigned long now = millis();
  int reading = digitalRead(PIN_BUTTON);

  // 1. Did the reading change (pressed, released, bouncing, or noise)? Count its "steady" time from zero again.
  if (reading != previousReading) {
    previousReading = reading;
    lastChangeTime = now;
  }

  // 2. Steady for 30 ms and different from the trusted state? That's a real change.
  if (reading != stableButton && now - lastChangeTime >= DEBOUNCE_DELAY) {
    stableButton = reading;
    if (stableButton == LOW) {  // just pressed: start timing how long
      pressStartTime = now;
      longPressDone = false;
    } else if (!longPressDone) {  // just released before 1 second: short press
      shortPress();
    }
  }

  // 3. Still held after 1 second? Long press, handled once without waiting for the finger to lift.
  if (stableButton == LOW && !longPressDone && now - pressStartTime >= LONG_PRESS_TIME) {
    longPressDone = true;
    longPress();
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_STATUS_LED, OUTPUT);
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  pinMode(PIN_LAMP_RELAY, OUTPUT);
  pinMode(PIN_FAN_RELAY, OUTPUT);
  setRelay(PIN_LAMP_RELAY, false);  // switch off right away: pinMode(OUTPUT) makes the pin LOW (= relay pulls in)
  setRelay(PIN_FAN_RELAY, false);
  dht.begin();
  Serial.println("Practice 2 - three tasks, one loop(). Short press = lamp, long press = fan.");
}

void loop() {
  unsigned long start = micros();  // microseconds: to measure how long this pass takes

  updateHeartbeat();
  readSensorOnSchedule();
  checkButton();

  loopCount++;
  unsigned long elapsed = micros() - start;
  if (elapsed > longestLoopUs) {
    longestLoopUs = elapsed;
  }
}
