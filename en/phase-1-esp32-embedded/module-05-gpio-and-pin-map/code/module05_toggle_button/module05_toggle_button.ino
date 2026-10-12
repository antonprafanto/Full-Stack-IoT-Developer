// Module 5 - Practice 2.2: one press = one switch (with debounce)
// Every time the button on D13 is pressed, the LED on D4 switches: on -> off -> on ...

const int PIN_BUTTON = 13;      // manual button (canonical pin map)
const int PIN_LED = 4;          // status LED
const int DEBOUNCE_DELAY = 30;  // milliseconds: how long to wait for the button to stop bouncing

bool ledOn = false;
int pressCount = 0;

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

void setup() {
  Serial.begin(115200);
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  pinMode(PIN_LED, OUTPUT);
  Serial.println("Press the button: the LED switches on/off.");
}

void loop() {
  if (buttonPressed()) {
    ledOn = !ledOn;  // flipped: true becomes false, false becomes true
    pressCount++;
    Serial.print("Press #");
    Serial.print(pressCount);
    if (ledOn) {
      digitalWrite(PIN_LED, HIGH);
      Serial.println(": LED ON");
    } else {
      digitalWrite(PIN_LED, LOW);
      Serial.println(": LED OFF");
    }
  }
}
