// heartbeat.cpp - the code of the heartbeat module. Its functions are listed in heartbeat.h.
#include <Arduino.h>
#include "heartbeat.h"

const unsigned long NORMAL_BEAT = 1000;  // one blink every 1 second
const unsigned long PROBLEM_BEAT = 250;  // four blinks every 1 second
const unsigned long BEAT_ON_TIME = 100;  // the LED is on for 100 ms at the start of each beat

// "static" = belongs to this file only; other files can't see it or mix it up with their own.
static int heartbeatPin = -1;
static bool problemRhythm = false;
static unsigned long beatStartTime = 0;

void beginHeartbeat(int pin) {
  heartbeatPin = pin;
  pinMode(heartbeatPin, OUTPUT);
}

void setHeartbeatRhythm(bool problem) {
  problemRhythm = problem;
}

void updateHeartbeat() {
  unsigned long now = millis();
  unsigned long beatLength = NORMAL_BEAT;
  if (problemRhythm) {
    beatLength = PROBLEM_BEAT;
  }
  if (now - beatStartTime >= beatLength) {
    beatStartTime = now;  // start the next beat
  }
  // The LED is on only at the start of a beat: true = HIGH (on), false = LOW (off)
  digitalWrite(heartbeatPin, now - beatStartTime < BEAT_ON_TIME);
}
