// actuators.cpp - the code of the actuators module. Its functions are listed in actuators.h.
#include <Arduino.h>
#include <ESP32Servo.h>
#include "config.h"
#include "logger.h"
#include "actuators.h"

const unsigned long BEEP_TIME = 150;  // milliseconds

static Servo curtainServo;
static bool lamp = false;
static bool lampOwnedByAutomation = false;  // true if the lamp was turned on by the automation rule
static bool fan = false;
static int angle = 90;

static bool pump = false;
static unsigned long pumpStartTime = 0;
static unsigned long pumpTime = 0;  // milliseconds

static bool buzzer = false;
static unsigned long buzzerStartTime = 0;

static void writeRelay(int pin, bool isOn) {
  if (isOn) {
    digitalWrite(pin, LOW);  // active-LOW relay
  } else {
    digitalWrite(pin, HIGH);
  }
}

void setupActuators() {
  pinMode(PIN_LAMP_RELAY, OUTPUT);
  pinMode(PIN_FAN_RELAY, OUTPUT);
  setLamp(false);  // switch off right away: pinMode(OUTPUT) has just made the pin LOW (= relay pulls in)
  setFan(false);

  pinMode(PIN_PUMP, OUTPUT);
  digitalWrite(PIN_PUMP, LOW);

  // The servo is attached BEFORE the buzzer: this order keeps the two from fighting over a PWM channel.
  curtainServo.setPeriodHertz(50);
  curtainServo.attach(PIN_CURTAIN_SERVO, 500, 2400);
  setCurtain(angle);

  ledcAttach(PIN_BUZZER, 2000, 10);
}

// Called on every pass of loop(): turns the pump and buzzer off as soon as their time is up.
void updateActuators() {
  unsigned long now = millis();
  if (pump && now - pumpStartTime >= pumpTime) {
    digitalWrite(PIN_PUMP, LOW);
    pump = false;
    logInfo("Pump off.");
  }
  if (buzzer && now - buzzerStartTime >= BEEP_TIME) {
    ledcWriteTone(PIN_BUZZER, 0);
    buzzer = false;
  }
}

void setLamp(bool isOn) {
  lamp = isOn;
  lampOwnedByAutomation = false;  // manual command: the lamp no longer belongs to the automation rule
  writeRelay(PIN_LAMP_RELAY, isOn);
}

void setLampByAutomation(bool isOn) {
  lamp = isOn;
  lampOwnedByAutomation = isOn;
  writeRelay(PIN_LAMP_RELAY, isOn);
}

void setFan(bool isOn) {
  fan = isOn;
  writeRelay(PIN_FAN_RELAY, isOn);
}

// Module 6: the pump only runs if the tank has enough water. waterLevel = the latest tank reading (at most 2 seconds old).
// Module 8: the pump is turned on and left alone at once; updateActuators() turns it off later.
bool turnOnPump(int seconds, int waterLevel) {
  seconds = constrain(seconds, 1, 10);  // safety limit: 1-10 seconds
  if (waterLevel < MIN_WATER_LEVEL) {  // -1 (unreadable) is smaller too, so it is refused as well
    if (waterLevel < 0) {
      logError("Pump REFUSED: water level unreadable.");
    } else {
      logError("Pump REFUSED: water level only %d %%.", waterLevel);
    }
    return false;
  }
  digitalWrite(PIN_PUMP, HIGH);
  pump = true;
  pumpStartTime = millis();
  pumpTime = seconds * 1000UL;
  logInfo("Pump running for %d seconds.", seconds);
  return true;
}

void setCurtain(int newAngle) {
  angle = constrain(newAngle, 0, 180);
  curtainServo.write(angle);
}

void soundBuzzer() {
  ledcWriteTone(PIN_BUZZER, 2000);  // 2,000 Hz
  buzzer = true;
  buzzerStartTime = millis();
}

bool lampOn() {
  return lamp;
}

bool lampByAutomation() {
  return lampOwnedByAutomation;
}

bool fanOn() {
  return fan;
}

bool pumpOn() {
  return pump;
}

int curtainAngle() {
  return angle;
}

const char* onOffText(bool isOn) {
  if (isOn) {
    return "on";
  }
  return "off";
}
