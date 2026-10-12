// Node 1 "Home" - firmware v0.2.0 (updated in Module 5)
// The running project: Mini Smart Home.
//
// New in v0.2.0: all Node 1 actuators are connected to the canonical pins (see PIN-MAP.md):
// lamp relay, fan relay, pump (through a MOSFET), curtain servo, buzzer, and manual button.
// The manual button turns the lamp on/off. You can try the other actuators from the
// Serial Monitor, for example: lamp on, fan off, pump 3, curtain 90, beep, status.
// The sensors are still sample numbers; Modules 6-7 replace them with real readings.
//
// Library: ESP32Servo version 3.2.1.

#include <ESP32Servo.h>
#include <esp_system.h>  // esp_reset_reason()

const String FIRMWARE_VERSION = "0.2.0";

// ---------- Node 1 canonical pin map (copied from PIN-MAP.md) ----------
const int PIN_STATUS_LED = 4;      // Module 2
const int PIN_BUTTON = 13;         // Module 5, INPUT_PULLUP
const int PIN_LAMP_RELAY = 32;     // Module 5, active-LOW relay
const int PIN_FAN_RELAY = 33;      // Module 5, active-LOW relay
const int PIN_PUMP = 25;           // Module 5, IRLZ44N MOSFET gate
const int PIN_CURTAIN_SERVO = 26;  // Module 5, SG90 servo
const int PIN_BUZZER = 27;         // Module 5, passive buzzer
// Reserved for later modules (don't use them for anything else):
// Module 6: DHT22 = 14, LDR = 36 (VP), soil = 39 (VN), PIR = 34, HC-SR04 TRIG = 15, ECHO = 35
// Module 7: I2C SDA = 21, SCL = 22; microSD SCK = 18, MISO = 19, MOSI = 23, CS = 5
// Module 15: RS-485 RX = 16, TX = 17, DE/RE = 2

const int DEBOUNCE_DELAY = 30;     // milliseconds, for debouncing the button
const int LOOP_DELAY = 10;         // loop() repeats about every 10 milliseconds
const int LOOPS_PER_REPORT = 200;  // 200 x 10 ms = about 2 seconds

// The sensor data form. Its field names follow the data contract (Syllabus Appendix A).
struct SensorReading {
  float temperature;  // degrees Celsius
  int humidity;       // percent
  int light;          // 0-4095
  bool motion;        // motion detected?
};

// Current actuator states (sent later in the "ack", Appendix A)
bool lampOn = false;
bool fanOn = false;
int curtainAngle = 90;

Servo curtainServo;
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

void runPump(int seconds) {
  seconds = constrain(seconds, 1, 10);  // safety limit: 1-10 seconds
  digitalWrite(PIN_PUMP, HIGH);
  delay(seconds * 1000);  // blocks for now; Module 8 makes it work without delay()
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
    Serial.println("pump running...");
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

// ---------- Modules 6-7: read the real sensors ----------
SensorReading readSensors() {
  SensorReading b;
  b.temperature = 28.5;  // sample numbers for now; Modules 6-7 replace them
  b.humidity = 71;       // with real sensor readings
  b.light = 412;
  b.motion = false;
  return b;
}

// ---------- Module 7: show the reading on the OLED display ----------
void showOnDisplay(SensorReading b) {
  // not filled in yet
}

// ---------- Modules 6 & 19: automation rules (watering, lamp, fan) ----------
void controlActuators(SensorReading b) {
  // not filled in yet: Module 6 adds "automatic watering" and "automatic lamp"
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

// Prints the reading to the Serial Monitor (our own helper).
void printReading(SensorReading b) {
  Serial.print("temperature=");
  Serial.print(b.temperature, 1);
  Serial.print(" humidity=");
  Serial.print(b.humidity);
  Serial.print(" light=");
  Serial.print(b.light);
  Serial.print(" motion=");
  if (b.motion) {
    Serial.println("yes");
  } else {
    Serial.println("no");
  }
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
