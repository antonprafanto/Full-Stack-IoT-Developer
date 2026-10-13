// Module 8 - Quick Win: the LED blinks and the button is still heard, without delay()
// Circuit: status LED on D4 (through a 220 ohm resistor) and a button on D13 (its opposite leg to GND).
// Press the button any time: the LED's blink rhythm switches at once, slow <-> fast.

const int PIN_STATUS_LED = 4;
const int PIN_BUTTON = 13;
const unsigned long DEBOUNCE_DELAY = 30;  // milliseconds: the button reading must stay steady this long (Module 5)

unsigned long blinkDelay = 500;    // the LED switches on/off every 500 ms (slow)
unsigned long lastBlinkTime = 0;   // when the LED last switched
unsigned long lastReportTime = 0;  // when Serial last reported
unsigned long lastChangeTime = 0;  // when the button reading last changed
bool ledOn = false;
int previousReading = HIGH;  // the button reading on the previous pass; HIGH = released (INPUT_PULLUP)
int stableButton = HIGH;     // the button state we already trust (its reading has been steady for 30 ms)
int changeCount = 0;         // how many times the LED has switched
int pressCount = 0;          // how many times the button has been pressed

void setup() {
  Serial.begin(115200);
  pinMode(PIN_STATUS_LED, OUTPUT);
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  Serial.println("Module 8 Quick Win: the LED blinks, the button is always heard.");
}

void loop() {
  unsigned long now = millis();  // glance at the "wall clock" once at the start of every pass

  // Task 1: time for the LED to switch?
  if (now - lastBlinkTime >= blinkDelay) {
    lastBlinkTime = now;
    ledOn = !ledOn;
    digitalWrite(PIN_STATUS_LED, ledOn);  // true = HIGH (on), false = LOW (off)
    changeCount++;
  }

  // Task 2: has the button just been pressed? Checked on EVERY pass.
  int reading = digitalRead(PIN_BUTTON);
  if (reading != previousReading) {  // the reading changed: pressed, released, bouncing, or noise
    previousReading = reading;
    lastChangeTime = now;            // start counting "steady" from zero again
  }
  if (reading != stableButton && now - lastChangeTime >= DEBOUNCE_DELAY) {
    stableButton = reading;          // steady for 30 ms: this change is real
    if (stableButton == LOW) {       // changed from released to pressed
      pressCount++;
      if (blinkDelay == 500) {
        blinkDelay = 100;
        Serial.println("Button pressed! Blink rhythm: FAST");
      } else {
        blinkDelay = 500;
        Serial.println("Button pressed! Blink rhythm: SLOW");
      }
    }
  }

  // Task 3: time to report? (every 2 seconds)
  if (now - lastReportTime >= 2000) {
    lastReportTime = now;
    Serial.print("Second ");
    Serial.print(now / 1000);
    Serial.print(": LED switches: ");
    Serial.print(changeCount);
    Serial.print(", button presses: ");
    Serial.print(pressCount);
    Serial.println(".");
  }
}
