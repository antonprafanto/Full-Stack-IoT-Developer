// Module 8 - Practice 1 (part B): the cure, the millis() pattern
// Same circuit: status LED on D4, button on D13.
// The LED still switches every 1 second, but the button is checked thousands of times per second.

const int PIN_STATUS_LED = 4;
const int PIN_BUTTON = 13;
const unsigned long BLINK_DELAY = 1000;      // the LED switches every 1 second, just like the delay() version
const unsigned long REPORT_INTERVAL = 2000;  // report every 2 seconds
const unsigned long DEBOUNCE_DELAY = 30;     // milliseconds: the button reading must stay steady this long

unsigned long lastBlinkTime = 0;
unsigned long lastReportTime = 0;
unsigned long lastChangeTime = 0;
bool ledOn = false;
int previousReading = HIGH;
int stableButton = HIGH;
int pressCount = 0;
unsigned long loopCount = 0;  // loop() passes since the last report

void setup() {
  Serial.begin(115200);
  pinMode(PIN_STATUS_LED, OUTPUT);
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  Serial.println("Practice 1B - millis() version: press the button 5 times again.");
}

void loop() {
  unsigned long now = millis();
  loopCount++;

  // Task 1: the LED, with the millis() pattern: "has 1 second passed since it last switched?"
  if (now - lastBlinkTime >= BLINK_DELAY) {
    lastBlinkTime = now;
    ledOn = !ledOn;
    digitalWrite(PIN_STATUS_LED, ledOn);
  }

  // Task 2: the button, checked on every pass
  int reading = digitalRead(PIN_BUTTON);
  if (reading != previousReading) {
    previousReading = reading;
    lastChangeTime = now;
  }
  if (reading != stableButton && now - lastChangeTime >= DEBOUNCE_DELAY) {
    stableButton = reading;
    if (stableButton == LOW) {
      pressCount++;
      Serial.println("Button pressed!");
    }
  }

  // Task 3: a report every 2 seconds, including how many times loop() managed to run
  if (now - lastReportTime >= REPORT_INTERVAL) {
    lastReportTime = now;
    Serial.print("Second ");
    Serial.print(now / 1000);
    Serial.print(": loop() ran ");
    Serial.print(loopCount);
    Serial.print(" times in the last 2 seconds. Presses recorded: ");
    Serial.print(pressCount);
    Serial.println(".");
    loopCount = 0;
  }
}
