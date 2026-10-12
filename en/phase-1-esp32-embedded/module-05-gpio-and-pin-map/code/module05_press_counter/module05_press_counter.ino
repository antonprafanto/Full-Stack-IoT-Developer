// Module 5 - Practice 2.1: counting button presses WITHOUT debounce
// Press the button on D13 once, then look at the Serial Monitor.
// Often a single press is counted more than once: that's "bouncing".

const int PIN_BUTTON = 13;  // manual button (canonical pin map)

int previousState = HIGH;  // the button's state on the previous pass of loop()
int pressCount = 0;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  Serial.println("Press the button ONCE, then look at the number.");
}

void loop() {
  int state = digitalRead(PIN_BUTTON);
  if (previousState == HIGH && state == LOW) {  // it has just changed: released -> pressed
    pressCount++;
    Serial.print("Press #");
    Serial.println(pressCount);
  }
  previousState = state;  // remember it for the next pass
}
