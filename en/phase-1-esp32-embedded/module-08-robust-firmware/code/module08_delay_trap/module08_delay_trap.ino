// Module 8 - Practice 1 (part A): the delay() trap
// Same circuit as the Quick Win: status LED on D4, button on D13.
// The LED blinks with delay(). Press the button 5 times at a relaxed pace: how many are recorded?

const int PIN_STATUS_LED = 4;
const int PIN_BUTTON = 13;

int pressCount = 0;
int loopCount = 0;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_STATUS_LED, OUTPUT);
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  Serial.println("Practice 1A - delay() version: press the button 5 times, then count how many were recorded.");
}

void loop() {
  loopCount++;

  digitalWrite(PIN_STATUS_LED, HIGH);
  delay(1000);  // the ESP32 waits 1 second without doing anything
  digitalWrite(PIN_STATUS_LED, LOW);
  delay(1000);  // waits 1 more second

  // The button is only checked here: once every 2 seconds!
  if (digitalRead(PIN_BUTTON) == LOW) {
    pressCount++;
    Serial.println("Button read as pressed!");
  }

  Serial.print("loop() pass #");
  Serial.print(loopCount);
  Serial.print(" finished at second ");
  Serial.print(millis() / 1000);
  Serial.print(". Presses recorded: ");
  Serial.print(pressCount);
  Serial.println(".");
}
