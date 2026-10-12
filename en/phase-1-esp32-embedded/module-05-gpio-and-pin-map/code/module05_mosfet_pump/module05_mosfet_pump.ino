// Module 5 - Practice 7: the pump runs for 3 seconds through an IRLZ44N MOSFET
// MOSFET gate (G) on D25 through a 220 ohm resistor; a 10 kiloohm resistor from the gate line to GND.
// The pump gets 5 V from the MB102. A 1N4007 diode in parallel with the pump, silver ring on the 5 V side.

const int PIN_BUTTON = 13;      // manual button (canonical pin map)
const int PIN_PUMP = 25;        // pump MOSFET gate (canonical pin map)
const int DEBOUNCE_DELAY = 30;  // milliseconds
const int PUMP_TIME = 3000;     // milliseconds: the pump runs for 3 seconds

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

void setup() {
  Serial.begin(115200);
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  pinMode(PIN_PUMP, OUTPUT);
  digitalWrite(PIN_PUMP, LOW);  // LOW = the MOSFET disconnects = the pump stays still
  Serial.println("Press the button: the pump runs for 3 seconds.");
}

void loop() {
  if (buttonPressed()) {
    Serial.println("Pump running...");
    digitalWrite(PIN_PUMP, HIGH);  // HIGH = the MOSFET connects = the pump runs
    delay(PUMP_TIME);
    digitalWrite(PIN_PUMP, LOW);
    Serial.println("Pump stopped.");
  }
}
