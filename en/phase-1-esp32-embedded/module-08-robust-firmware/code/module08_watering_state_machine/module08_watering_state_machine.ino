// Module 8 - Practice 3: watering state machine
// Circuit: the Node 1 workbench (Module 7). Used here: status LED D4, button D13, lamp relay D32,
// pump D25 (through the MOSFET), soil sensor on VN (GPIO 39), and the HC-SR04 (TRIG D15, ECHO D35).
//
// Watering has three states: STANDBY -> WATERING -> COOLDOWN -> STANDBY.
// While the pump runs, the status LED keeps beating and the button keeps working:
// short press = lamp, long press (1 second) = water now.

const int PIN_STATUS_LED = 4;
const int PIN_BUTTON = 13;
const int PIN_LAMP_RELAY = 32;  // active-LOW relay
const int PIN_FAN_RELAY = 33;   // not used here, but its relay is switched off so it stays quiet
const int PIN_PUMP = 25;        // MOSFET gate: HIGH = pump on
const int PIN_SOIL = 39;        // VN
const int PIN_TRIG = 15;
const int PIN_ECHO = 35;

// Your calibration results from Module 6 (replace them with your own numbers)
const int SOIL_DRY = 3000;          // raw soil sensor value in air
const int SOIL_WET = 1300;          // raw soil sensor value in water
const float DISTANCE_EMPTY = 20.0;  // cm: from the sensor to the bottom of the tank
const float DISTANCE_FULL = 5.0;    // cm: from the sensor to the water surface when the tank is full

// Watering rules
const int SOIL_WATERING_THRESHOLD = 30;     // water if the soil is below 30%
const int MIN_WATER_LEVEL = 20;             // the pump is refused if the tank is less than 20% full
const unsigned long CHECK_INTERVAL = 2000;  // STANDBY: check the soil every 2 seconds
const unsigned long WATERING_TIME = 3000;   // WATERING: the pump runs for 3 seconds
const unsigned long COOLDOWN_TIME = 30000;  // COOLDOWN: rest 30 seconds before watering is allowed again

bool lampOn = false;

// The three watering states. A list of names like this (enum) goes at the top, before any function.
enum WateringState { STANDBY, WATERING, COOLDOWN };
WateringState state = STANDBY;     // the current state; starts at STANDBY
unsigned long stateStartTime = 0;  // when the current state started
unsigned long lastCheckTime = 0;   // when the soil was last checked

// ---------- Heartbeat (status LED) ----------
const unsigned long NORMAL_BEAT = 1000;  // one blink every 1 second
const unsigned long PROBLEM_BEAT = 250;  // four blinks every 1 second
const unsigned long BEAT_ON_TIME = 100;  // the LED is on for 100 ms at the start of each beat
bool problemRhythm = false;              // true = fast blink
unsigned long beatStartTime = 0;

void updateHeartbeat() {
  unsigned long now = millis();
  unsigned long beatLength = NORMAL_BEAT;
  if (problemRhythm) {
    beatLength = PROBLEM_BEAT;
  }
  if (now - beatStartTime >= beatLength) {
    beatStartTime = now;  // start the next beat
  }
  digitalWrite(PIN_STATUS_LED, now - beatStartTime < BEAT_ON_TIME);
}

// ---------- Button: short press and long press ----------
const unsigned long DEBOUNCE_DELAY = 30;     // milliseconds: the reading must stay steady this long
const unsigned long LONG_PRESS_TIME = 1000;  // held for 1 second or more = long press
int previousReading = HIGH;                  // HIGH = released
unsigned long lastChangeTime = 0;
int stableButton = HIGH;                     // the state we already trust
unsigned long pressStartTime = 0;
bool longPressDone = false;

void checkButton() {
  unsigned long now = millis();
  int reading = digitalRead(PIN_BUTTON);
  if (reading != previousReading) {
    previousReading = reading;
    lastChangeTime = now;
  }
  if (reading != stableButton && now - lastChangeTime >= DEBOUNCE_DELAY) {
    stableButton = reading;
    if (stableButton == LOW) {
      pressStartTime = now;
      longPressDone = false;
    } else if (!longPressDone) {
      shortPress();
    }
  }
  if (stableButton == LOW && !longPressDone && now - pressStartTime >= LONG_PRESS_TIME) {
    longPressDone = true;
    longPress();
  }
}

// ---------- Soil sensor and water tank (Module 6) ----------
int readSoilPercent() {
  long sum = 0;
  for (int i = 0; i < 20; i++) {
    sum += analogRead(PIN_SOIL);  // 20 readings in a row, no pause (done in a flash)
  }
  int percent = map(sum / 20, SOIL_DRY, SOIL_WET, 0, 100);
  return constrain(percent, 0, 100);
}

// Returns how full the tank is in percent, or -1 if the HC-SR04 echo doesn't come back.
int readWaterLevel() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long duration = pulseIn(PIN_ECHO, HIGH, 30000);  // waits 30 ms at most
  if (duration == 0) {
    return -1;
  }
  float distance = duration / 58.0;
  int percent = (DISTANCE_EMPTY - distance) * 100 / (DISTANCE_EMPTY - DISTANCE_FULL);
  return constrain(percent, 0, 100);
}

// ---------- Watering state machine ----------
const char* stateName(WateringState s) {
  if (s == STANDBY) {
    return "STANDBY";
  }
  if (s == WATERING) {
    return "WATERING";
  }
  return "COOLDOWN";
}

// The only place where the state changes: note the time and report the move.
void moveTo(WateringState newState) {
  Serial.print("[");
  Serial.print(stateName(state));
  Serial.print(" -> ");
  Serial.print(stateName(newState));
  Serial.println("]");
  state = newState;
  stateStartTime = millis();
}

// Tries to turn on the pump. Tank safety check (Module 6): too little water = refused, then rest.
void startWatering() {
  int waterLevel = readWaterLevel();
  if (waterLevel < MIN_WATER_LEVEL) {  // -1 (unreadable) is smaller too, so it is refused as well
    Serial.print("Pump REFUSED: water level ");
    if (waterLevel < 0) {
      Serial.println("unreadable.");
    } else {
      Serial.print(waterLevel);
      Serial.println(" %.");
    }
    problemRhythm = true;  // the status LED blinks fast: fill the tank!
    moveTo(COOLDOWN);
    return;
  }
  problemRhythm = false;
  Serial.print("Pump on (water level ");
  Serial.print(waterLevel);
  Serial.println(" %).");
  digitalWrite(PIN_PUMP, HIGH);
  moveTo(WATERING);
}

void runWatering() {
  unsigned long now = millis();

  if (state == STANDBY) {
    // STANDBY: check the soil every 2 seconds; if it's dry, start watering
    if (now - lastCheckTime >= CHECK_INTERVAL) {
      lastCheckTime = now;
      int soil = readSoilPercent();
      Serial.print("STANDBY: soil ");
      Serial.print(soil);
      Serial.println(" %");
      if (soil < SOIL_WATERING_THRESHOLD) {
        startWatering();
      }
    }
  } else if (state == WATERING) {
    // WATERING: the pump turns off after 3 seconds, then rest
    if (now - stateStartTime >= WATERING_TIME) {
      digitalWrite(PIN_PUMP, LOW);
      Serial.println("Pump off.");
      moveTo(COOLDOWN);
    }
  } else if (state == COOLDOWN) {
    // COOLDOWN: wait 30 seconds so the water can soak in before the soil is checked again
    if (now - stateStartTime >= COOLDOWN_TIME) {
      moveTo(STANDBY);
    }
  }
}

// ---------- What the button does ----------
void shortPress() {
  lampOn = !lampOn;
  if (lampOn) {
    digitalWrite(PIN_LAMP_RELAY, LOW);  // active-LOW relay
    Serial.println("Button: lamp on");
  } else {
    digitalWrite(PIN_LAMP_RELAY, HIGH);
    Serial.println("Button: lamp off");
  }
}

void longPress() {
  if (state == STANDBY) {
    Serial.println("Button held: water now!");
    startWatering();
  } else {
    Serial.print("Button held, but watering is in ");
    Serial.print(stateName(state));
    Serial.println(". Try again later.");
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_STATUS_LED, OUTPUT);
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  pinMode(PIN_LAMP_RELAY, OUTPUT);
  digitalWrite(PIN_LAMP_RELAY, HIGH);  // lamp off (active-LOW relay)
  pinMode(PIN_FAN_RELAY, OUTPUT);
  digitalWrite(PIN_FAN_RELAY, HIGH);  // fan off
  pinMode(PIN_PUMP, OUTPUT);
  digitalWrite(PIN_PUMP, LOW);
  pinMode(PIN_TRIG, OUTPUT);
  digitalWrite(PIN_TRIG, LOW);
  pinMode(PIN_ECHO, INPUT);
  Serial.println("Practice 3 - watering state machine: STANDBY -> WATERING -> COOLDOWN -> STANDBY");
}

void loop() {
  updateHeartbeat();
  checkButton();
  runWatering();
}
