// Node 1 "Home" - firmware v0.3.0 (updated in Module 6)
// The running project: Mini Smart Home.
//
// New in v0.3.0: all five Node 1 sensors are read for real (DHT22, LDR, soil sensor,
// PIR, HC-SR04), plus a first, local version of two automation rules:
// "automatic watering" (refused if the water tank is too low) and "automatic lamp".
// You can still try the actuators from the Serial Monitor, for example:
// lamp on, fan off, pump 3, curtain 90, beep, status.
//
// Libraries: ESP32Servo version 3.2.1, DHT sensor library version 1.4.7
// (installed with it: Adafruit Unified Sensor version 1.1.15).

#include <ESP32Servo.h>
#include <DHT.h>
#include <esp_system.h>  // esp_reset_reason()

const String FIRMWARE_VERSION = "0.3.0";

// ---------- Node 1 canonical pin map (copied from PIN-MAP.md) ----------
const int PIN_STATUS_LED = 4;      // Module 2
const int PIN_BUTTON = 13;         // Module 5, INPUT_PULLUP
const int PIN_LAMP_RELAY = 32;     // Module 5, active-LOW relay
const int PIN_FAN_RELAY = 33;      // Module 5, active-LOW relay
const int PIN_PUMP = 25;           // Module 5, IRLZ44N MOSFET gate
const int PIN_CURTAIN_SERVO = 26;  // Module 5, SG90 servo
const int PIN_BUZZER = 27;         // Module 5, passive buzzer
const int PIN_DHT = 14;            // Module 6, DHT22
const int PIN_LDR = 36;            // Module 6, VP: LDR (ADC1)
const int PIN_SOIL = 39;           // Module 6, VN: capacitive soil sensor (ADC1)
const int PIN_PIR = 34;            // Module 6, PIR
const int PIN_TRIG = 15;           // Module 6, HC-SR04 TRIG
const int PIN_ECHO = 35;           // Module 6, HC-SR04 ECHO through a voltage divider
// Reserved for later modules (don't use them for anything else):
// Module 7: I2C SDA = 21, SCL = 22; microSD SCK = 18, MISO = 19, MOSI = 23, CS = 5
// Module 15: RS-485 RX = 16, TX = 17, DE/RE = 2

const int DEBOUNCE_DELAY = 30;     // milliseconds, for debouncing the button
const int LOOP_DELAY = 10;         // loop() repeats about every 10 milliseconds
const int LOOPS_PER_REPORT = 200;  // 200 x 10 ms = about 2 seconds

// ---------- Module 6: your calibration results (Practices 3 and 6) ----------
const int SOIL_DRY = 3000;          // raw soil sensor value in air
const int SOIL_WET = 1300;          // raw soil sensor value in water
const float DISTANCE_EMPTY = 20.0;  // cm: from the sensor to the bottom of the tank
const float DISTANCE_FULL = 5.0;    // cm: from the sensor to the water surface when the tank is full

// ---------- Module 6: automation rules, local version ----------
const int SOIL_WATERING_THRESHOLD = 30;  // Appendix A: "soil_watering"
const int MIN_WATER_LEVEL = 20;          // the pump is refused if the tank is less than 20% full
const int WATERING_SECONDS = 3;          // how long the pump runs when watering automatically
const int WATERING_COOLDOWN = 15;        // after a watering attempt, wait 15 reports (about 30 seconds)
const int DARK_THRESHOLD = 1000;         // light below this counts as dark

// The sensor data form. Its field names match the data contract (Syllabus Appendix A) EXACTLY.
struct SensorReading {
  float temperature;  // degrees Celsius; NAN if the DHT22 can't be read
  int humidity;       // percent; -1 if the DHT22 can't be read
  int light;          // 0 (pitch dark) to 4095 (very bright)
  int soil;           // percent: 0 = as dry as in air, 100 = as wet as in water
  bool motion;        // true if the PIR sees motion
  int water_level;    // percent of the tank filled; -1 if the HC-SR04 echo doesn't come back
};

// Current actuator states (sent later in the "ack", Appendix A)
bool lampOn = false;
bool fanOn = false;
int curtainAngle = 90;

bool lampByAutomation = false;  // true if the lamp was turned on by autoLamp()
int wateringCooldownLeft = 0;   // how many more reports before watering may be tried again

Servo curtainServo;
DHT dht(PIN_DHT, DHT22);
int loopCount = 0;

// ---------- Module 5: last restart reason (same names as Appendix A) ----------
// Turns the restart reason code into a word that is easy to read.
String resetReasonName() {
  esp_reset_reason_t reason = esp_reset_reason();
  if (reason == ESP_RST_POWERON) {
    return "POWERON";  // just powered on, EN button pressed, or a program has finished uploading
  }
  if (reason == ESP_RST_BROWNOUT) {
    return "BROWNOUT";  // the voltage briefly dropped too low
  }
  if (reason == ESP_RST_SW) {
    return "SW";  // the program itself asked for a restart
  }
  if (reason == ESP_RST_PANIC) {
    return "PANIC";  // the program crashed
  }
  if (reason == ESP_RST_INT_WDT || reason == ESP_RST_TASK_WDT || reason == ESP_RST_WDT) {
    return "WDT";  // a "watchdog" restarted a stuck program (Module 8)
  }
  if (reason == ESP_RST_DEEPSLEEP) {
    return "DEEPSLEEP";  // woke up from deep sleep (Module 9)
  }
  return "UNKNOWN";  // some other reason that rarely happens
}

// ---------- Module 5: actuators ----------
void setLamp(bool isOn) {
  lampOn = isOn;
  lampByAutomation = false;  // assume a manual command; autoLamp() marks its own
  if (isOn) {
    digitalWrite(PIN_LAMP_RELAY, LOW);  // active-LOW relay
  } else {
    digitalWrite(PIN_LAMP_RELAY, HIGH);
  }
}

void setFan(bool isOn) {
  fanOn = isOn;
  if (isOn) {
    digitalWrite(PIN_FAN_RELAY, LOW);
  } else {
    digitalWrite(PIN_FAN_RELAY, HIGH);
  }
}

// Module 6: the pump only runs if the tank has enough water, measured right before the pump starts.
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

void setCurtain(int angle) {
  curtainAngle = constrain(angle, 0, 180);
  curtainServo.write(curtainAngle);
}

void soundBuzzer() {
  ledcWriteTone(PIN_BUZZER, 2000);  // 2,000 Hz
  delay(150);
  ledcWriteTone(PIN_BUZZER, 0);
}

// ---------- Module 5: set up all the pins ----------
void setupPins() {
  pinMode(PIN_STATUS_LED, OUTPUT);
  pinMode(PIN_BUTTON, INPUT_PULLUP);

  pinMode(PIN_LAMP_RELAY, OUTPUT);
  pinMode(PIN_FAN_RELAY, OUTPUT);
  setLamp(false);  // switch off right away: pinMode(OUTPUT) has just made the pin LOW (= relay pulls in)
  setFan(false);

  pinMode(PIN_PUMP, OUTPUT);
  digitalWrite(PIN_PUMP, LOW);

  // The servo is attached BEFORE the buzzer: this order keeps the two from fighting over a PWM channel.
  curtainServo.setPeriodHertz(50);
  curtainServo.attach(PIN_CURTAIN_SERVO, 500, 2400);
  setCurtain(curtainAngle);

  ledcAttach(PIN_BUZZER, 2000, 10);

  // Module 6: sensors
  dht.begin();
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_TRIG, OUTPUT);
  digitalWrite(PIN_TRIG, LOW);
  pinMode(PIN_ECHO, INPUT);
}

// ---------- Module 5: manual button with debounce ----------
// Returns true ONCE for every real press.
bool buttonPressed() {
  if (digitalRead(PIN_BUTTON) == HIGH) {  // not being pressed
    return false;
  }
  delay(DEBOUNCE_DELAY);                  // wait for the bouncing to settle...
  if (digitalRead(PIN_BUTTON) == HIGH) {  // ...already released again: just noise
    return false;
  }
  while (digitalRead(PIN_BUTTON) == LOW) {  // wait until the finger is lifted
    delay(1);
  }
  delay(DEBOUNCE_DELAY);  // the button also bounces when it is released
  return true;
}

String onOffText(bool isOn) {
  if (isOn) {
    return "on";
  }
  return "off";
}

void printStatus() {
  Serial.print("status: lamp=");
  Serial.print(onOffText(lampOn));
  Serial.print(" fan=");
  Serial.print(onOffText(fanOn));
  Serial.print(" curtain=");
  Serial.println(curtainAngle);
}

// Returns true if the text is NOT a number: toInt() gives 0, but the text isn't "0" (as in Practice 5).
bool notANumber(String text) {
  return text.toInt() == 0 && text != "0";
}

// ---------- Module 5: commands from the Serial Monitor (Module 11 replaces them with MQTT) ----------
void checkSerialCommand() {
  if (Serial.available() == 0) {
    return;
  }
  String command = Serial.readStringUntil('\n');
  command.trim();
  command.toLowerCase();

  if (command == "lamp on") {
    setLamp(true);
  } else if (command == "lamp off") {
    setLamp(false);
  } else if (command == "fan on") {
    setFan(true);
  } else if (command == "fan off") {
    setFan(false);
  } else if (command.startsWith("pump ")) {
    String number = command.substring(5);  // the text after "pump "
    if (notANumber(number)) {
      Serial.println("Need a number of seconds. Example: pump 3");
      return;
    }
    runPump(number.toInt());
  } else if (command.startsWith("curtain ")) {
    String number = command.substring(8);  // the text after "curtain "
    if (notANumber(number)) {
      Serial.println("Need a number of degrees. Example: curtain 90");
      return;
    }
    setCurtain(number.toInt());
  } else if (command == "beep") {
    soundBuzzer();
  } else if (command != "status") {
    Serial.println("Unknown command. Examples: lamp on, fan off, pump 3, curtain 90, beep, status");
    return;
  }
  printStatus();
}

// ---------- Module 6: read the real sensors ----------
// Averages 20 analog readings in a row to smooth out the noise.
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

// ---------- Module 7: show the reading on the OLED display ----------
void showOnDisplay(SensorReading b) {
  // not filled in yet
}

// ---------- Modules 6 & 19: automation rules (watering, lamp, fan) ----------
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
    Serial.println("Motion in the dark: automatic lamp on.");
    setLamp(true);
    lampByAutomation = true;
  }
  if (!b.motion && lampByAutomation) {  // only turns off a lamp it turned on itself
    Serial.println("All quiet: automatic lamp off.");
    setLamp(false);
  }
}

void controlActuators(SensorReading b) {
  autoWatering(b);
  autoLamp(b);
  // Module 19 adds the automatic fan (Appendix A: "temp_fan_on")
}

// ---------- Modules 10-11: send the reading to the server ----------
void sendData(SensorReading b) {
  // not filled in yet
}

// ---------- Module 8: status blink as a "heartbeat" ----------
void blinkStatus() {
  digitalWrite(PIN_STATUS_LED, HIGH);
  delay(50);
  digitalWrite(PIN_STATUS_LED, LOW);
}

// Prints a number, or "--" if the value is not valid (less than 0).
void printValue(int value) {
  if (value < 0) {
    Serial.print("--");
  } else {
    Serial.print(value);
  }
}

// Prints the reading to the Serial Monitor (our own helper).
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
  delay(500);
  Serial.println();
  Serial.println("Node 1 Home - firmware " + FIRMWARE_VERSION);
  Serial.println("Last restart reason: " + resetReasonName());
  setupPins();
  printStatus();
}

void loop() {
  // The button and Serial are checked on every pass (about 100 times per second),
  // so no button press is missed. A sensor report about every 2 seconds is enough.
  if (buttonPressed()) {
    setLamp(!lampOn);
    printStatus();
  }
  checkSerialCommand();

  loopCount++;
  if (loopCount >= LOOPS_PER_REPORT) {
    loopCount = 0;
    SensorReading reading = readSensors();
    printReading(reading);
    showOnDisplay(reading);
    controlActuators(reading);
    sendData(reading);
    blinkStatus();
  }
  delay(LOOP_DELAY);
}
