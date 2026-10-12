// Module 5 - Practice 6: a button turns a fan on and off through a relay
// Fan relay on D33 (IN2 of the 2-channel relay module, active LOW). Button on D13.
// The fan gets 5 V from the MB102 through the relay's COM-NO contacts.

const int PIN_BUTTON = 13;      // manual button (canonical pin map)
const int PIN_FAN_RELAY = 33;   // fan relay (canonical pin map)
const int DEBOUNCE_DELAY = 30;  // milliseconds

bool fanOn = false;

// Returns true ONCE for every real press (same as Practice 2.2).
bool buttonPressed() {
  if (digitalRead(PIN_BUTTON) == HIGH) {
    return false;
  }
  delay(DEBOUNCE_DELAY);
  if (digitalRead(PIN_BUTTON) == HIGH) {
    return false;
  }
  while (digitalRead(PIN_BUTTON) == LOW) {
    delay(1);
  }
  delay(DEBOUNCE_DELAY);
  return true;
}

// Our relay module is "active LOW": LOW = the relay connects (fan runs), HIGH = the relay releases.
void setFan(bool isOn) {
  if (isOn) {
    digitalWrite(PIN_FAN_RELAY, LOW);
  } else {
    digitalWrite(PIN_FAN_RELAY, HIGH);
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  pinMode(PIN_FAN_RELAY, OUTPUT);
  setFan(false);  // make sure the fan is off right away
  Serial.println("Press the button to turn the fan on or off.");
}

void loop() {
  if (buttonPressed()) {
    fanOn = !fanOn;
    setFan(fanOn);
    if (fanOn) {
      Serial.println("Fan ON");
    } else {
      Serial.println("Fan OFF");
    }
  }
}
