// button.cpp - the code of the button module. Its functions are listed in button.h.
#include <Arduino.h>
#include "button.h"

const unsigned long DEBOUNCE_DELAY = 30;     // milliseconds: the reading must stay steady this long (Module 5)
const unsigned long LONG_PRESS_TIME = 1000;  // held for 1 second or more = long press

static int buttonPin = -1;
static int previousReading = HIGH;        // the raw reading on the previous pass; HIGH = released
static unsigned long lastChangeTime = 0;  // when the raw reading last changed
static int stableState = HIGH;            // the state we already trust (steady for 30 ms)
static unsigned long pressStartTime = 0;  // when the button started being pressed
static bool longPressDone = false;        // long press for this press already reported?

void beginButton(int pin) {
  buttonPin = pin;
  pinMode(buttonPin, INPUT_PULLUP);
}

ButtonEvent checkButton() {
  unsigned long now = millis();
  int reading = digitalRead(buttonPin);

  // 1. Did the reading change (pressed, released, bouncing, or noise)? Count its "steady" time from zero again.
  if (reading != previousReading) {
    previousReading = reading;
    lastChangeTime = now;
  }

  // 2. Steady for 30 ms and different from the trusted state? That's a real change.
  if (reading != stableState && now - lastChangeTime >= DEBOUNCE_DELAY) {
    stableState = reading;
    if (stableState == LOW) {  // just pressed: start timing how long
      pressStartTime = now;
      longPressDone = false;
    } else if (!longPressDone) {  // just released before 1 second: short press
      return SHORT_PRESS;
    }
  }

  // 3. Still held after 1 second? Long press, reported once without waiting for the finger to lift.
  if (stableState == LOW && !longPressDone && now - pressStartTime >= LONG_PRESS_TIME) {
    longPressDone = true;
    return LONG_PRESS;
  }
  return NONE;
}
