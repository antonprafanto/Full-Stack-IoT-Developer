// Practice 2: two LEDs blinking in turn
// Red LED on D4, green LED on D18 (each through a 220 ohm resistor)

const int PIN_RED_LED = 4;     // red LED on pin D4
const int PIN_GREEN_LED = 18;  // green LED on pin D18

void setup() {
  // Two pins, two pinMode calls. Every pin you use must be "registered".
  pinMode(PIN_RED_LED, OUTPUT);
  pinMode(PIN_GREEN_LED, OUTPUT);
}

void loop() {
  // Red on, green off
  digitalWrite(PIN_RED_LED, HIGH);
  digitalWrite(PIN_GREEN_LED, LOW);
  delay(500);

  // Red off, green on
  digitalWrite(PIN_RED_LED, LOW);
  digitalWrite(PIN_GREEN_LED, HIGH);
  delay(500);
}
