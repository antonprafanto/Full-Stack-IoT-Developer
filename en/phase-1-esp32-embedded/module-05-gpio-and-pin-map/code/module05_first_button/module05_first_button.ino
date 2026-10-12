// Module 5 - Quick Win: your first button
// While the button on D13 is pressed, the LED on D4 is on.
// Circuit: one leg of the button to D13, the opposite leg to GND. No resistor.

const int PIN_BUTTON = 13;  // manual button (canonical pin map)
const int PIN_LED = 4;      // status LED, connected since Module 2

void setup() {
  Serial.begin(115200);
  pinMode(PIN_BUTTON, INPUT_PULLUP);  // input + internal pull-up: not pressed = HIGH
  pinMode(PIN_LED, OUTPUT);
  Serial.println("Press the button!");
}

void loop() {
  if (digitalRead(PIN_BUTTON) == LOW) {  // LOW = the button is being pressed
    digitalWrite(PIN_LED, HIGH);
  } else {
    digitalWrite(PIN_LED, LOW);
  }
}
