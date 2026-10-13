// Module 8 - Practice 7: hunting a bug with leveled logging
// Circuit: the Node 1 workbench (Module 7). Used here: pump D25, soil sensor on VN (GPIO 39),
// and the HC-SR04 (TRIG D15, ECHO D35). The logger module is in the tabs logger.h and logger.cpp.
//
// This sketch has ONE BUG ON PURPOSE. The symptom: when the soil is dry, the pump only flicks on for a moment
// every 2 seconds, although it should run for 3 seconds and then rest for 30 seconds.
// Commands in the Serial Monitor: log debug, log info, log error.

#include "logger.h"

const int PIN_PUMP = 25;  // MOSFET gate: HIGH = pump on
const int PIN_SOIL = 39;  // VN
const int PIN_TRIG = 15;
const int PIN_ECHO = 35;
const int PIN_LAMP_RELAY = 32;  // not used here: the lamp and fan relays are switched off so they stay quiet
const int PIN_FAN_RELAY = 33;

const int SOIL_DRY = 3000;          // your calibration results from Module 6
const int SOIL_WET = 1300;
const float DISTANCE_EMPTY = 20.0;
const float DISTANCE_FULL = 5.0;

const int SOIL_WATERING_THRESHOLD = 30;
const int MIN_WATER_LEVEL = 20;
const unsigned long CHECK_INTERVAL = 2000;  // STANDBY: check the soil every 2 seconds
const unsigned long WATERING_TIME = 3000;   // WATERING: the pump runs for 3 seconds
const unsigned long COOLDOWN_TIME = 30000;  // COOLDOWN: rest 30 seconds

enum WateringState { STANDBY, WATERING, COOLDOWN };
WateringState state = STANDBY;
unsigned long stateStartTime = 0;  // when the current state started
unsigned long lastCheckTime = 0;
unsigned long lastDebugTime = 0;

// ---------- A Serial line reader that never waits (same as Practice 5) ----------
const int MAX_LINE_LENGTH = 40;
char line[MAX_LINE_LENGTH + 1];
int lineLength = 0;

bool lineReady() {
  while (Serial.available() > 0) {
    char letter = Serial.read();
    if (letter == '\n') {
      line[lineLength] = '\0';
      lineLength = 0;
      return true;
    }
    if (letter != '\r' && lineLength < MAX_LINE_LENGTH) {
      line[lineLength] = letter;
      lineLength++;
    }
  }
  return false;
}

void checkSerialCommand() {
  if (!lineReady()) {
    return;
  }
  String command = line;
  command.trim();
  command.toLowerCase();
  if (command == "log debug") {
    setLogLevel(LEVEL_DEBUG);
  } else if (command == "log info") {
    setLogLevel(LEVEL_INFO);
  } else if (command == "log error") {
    setLogLevel(LEVEL_ERROR);
  } else {
    Serial.println("Unknown command. Try: log debug, log info, log error");
    return;
  }
  Serial.print("Log level now: ");
  Serial.println(logLevelName(logLevel()));
}

int readSoilPercent() {
  long sum = 0;
  for (int i = 0; i < 20; i++) {
    sum += analogRead(PIN_SOIL);
  }
  int percent = map(sum / 20, SOIL_DRY, SOIL_WET, 0, 100);
  return constrain(percent, 0, 100);
}

int readWaterLevel() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long duration = pulseIn(PIN_ECHO, HIGH, 30000);
  if (duration == 0) {
    return -1;
  }
  float distance = duration / 58.0;
  int percent = (DISTANCE_EMPTY - distance) * 100 / (DISTANCE_EMPTY - DISTANCE_FULL);
  return constrain(percent, 0, 100);
}

const char* stateName(WateringState s) {
  if (s == STANDBY) {
    return "STANDBY";
  }
  if (s == WATERING) {
    return "WATERING";
  }
  return "COOLDOWN";
}

void moveTo(WateringState newState) {
  logInfo("Watering: %s -> %s", stateName(state), stateName(newState));
  state = newState;
  unsigned long stateStartTime = millis();  // note when the new state started
}

void startWatering() {
  int waterLevel = readWaterLevel();
  logDebug("Water level: %d %%", waterLevel);
  if (waterLevel < MIN_WATER_LEVEL) {
    logError("Pump REFUSED: water level %d %%.", waterLevel);
    moveTo(COOLDOWN);
    return;
  }
  digitalWrite(PIN_PUMP, HIGH);
  logInfo("Pump on.");
  moveTo(WATERING);
}

void runWatering() {
  unsigned long now = millis();

  // Details for the bug hunt: how long in this state so far? Once per second so Serial isn't flooded.
  if (state != STANDBY && now - lastDebugTime >= 1000) {
    lastDebugTime = now;
    logDebug("%s: %lu ms so far", stateName(state), now - stateStartTime);
  }

  if (state == STANDBY) {
    if (now - lastCheckTime >= CHECK_INTERVAL) {
      lastCheckTime = now;
      int soil = readSoilPercent();
      logDebug("STANDBY: soil %d %% (threshold %d %%)", soil, SOIL_WATERING_THRESHOLD);
      if (soil < SOIL_WATERING_THRESHOLD) {
        logInfo("Dry soil (%d %%): start watering.", soil);
        startWatering();
      }
    }
  } else if (state == WATERING) {
    if (now - stateStartTime >= WATERING_TIME) {
      digitalWrite(PIN_PUMP, LOW);
      logInfo("Pump off.");
      moveTo(COOLDOWN);
    }
  } else if (state == COOLDOWN) {
    if (now - stateStartTime >= COOLDOWN_TIME) {
      moveTo(STANDBY);
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(PIN_PUMP, OUTPUT);
  digitalWrite(PIN_PUMP, LOW);
  pinMode(PIN_TRIG, OUTPUT);
  digitalWrite(PIN_TRIG, LOW);
  pinMode(PIN_ECHO, INPUT);
  pinMode(PIN_LAMP_RELAY, OUTPUT);
  digitalWrite(PIN_LAMP_RELAY, HIGH);  // active-LOW relay: HIGH = off
  pinMode(PIN_FAN_RELAY, OUTPUT);
  digitalWrite(PIN_FAN_RELAY, HIGH);
  Serial.println();
  logInfo("Practice 7 - bug hunt. Log level: %s", logLevelName(logLevel()));
}

void loop() {
  checkSerialCommand();
  runWatering();
}
