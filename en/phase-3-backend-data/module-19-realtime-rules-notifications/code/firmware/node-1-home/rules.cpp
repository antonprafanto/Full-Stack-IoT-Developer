// rules.cpp - the code of the rules module. Its functions are listed in rules.h.
#include <Arduino.h>
#include "config.h"
#include "logger.h"
#include "settings.h"
#include "actuators.h"
#include "networking.h"  // Module 19: offlineMode() and recordLocalFan()
#include "rules.h"

// ---------- Automatic watering: the state machine from Practice 3 ----------
// STANDBY --(dry soil)--> WATERING --(pump off)--> COOLDOWN --(30 seconds)--> STANDBY
enum WateringState { STANDBY, WATERING, COOLDOWN };
static WateringState state = STANDBY;
static unsigned long stateStartTime = 0;  // when the current state started

static const char* stateName(WateringState s) {
  if (s == STANDBY) {
    return "STANDBY";
  }
  if (s == WATERING) {
    return "WATERING";
  }
  return "COOLDOWN";
}

static void moveTo(WateringState newState) {
  logDebug("Watering: %s -> %s", stateName(state), stateName(newState));
  state = newState;
  stateStartTime = millis();
}

const char* wateringStateName() {
  return stateName(state);
}

static void autoWatering(SensorReading b) {
  if (state != STANDBY || pumpOn()) {
    return;  // watering, resting, or the pump is running from a manual command
  }
  if (b.soil < soilWateringThreshold()) {
    logInfo("Dry soil (%d %%, threshold %d %%): trying to water.", b.soil, soilWateringThreshold());
    if (turnOnPump(WATERING_SECONDS, b.water_level)) {  // the tank safety check is inside turnOnPump()
      moveTo(WATERING);
    } else {
      moveTo(COOLDOWN);  // refused: don't try again for 30 seconds
    }
  }
}

// ---------- Automatic lamp (Module 6) ----------
static void autoLamp(SensorReading b) {
  bool dark = b.light < DARK_THRESHOLD;
  if (b.motion && dark && !lampOn()) {
    logInfo("Motion in the dark: automatic lamp on.");
    setLampByAutomation(true);
  }
  if (!b.motion && lampByAutomation()) {  // only turns off a lamp it turned on itself
    logInfo("All quiet: automatic lamp off.");
    setLampByAutomation(false);
  }
}

// ---------- Local safety fan (Module 19) ----------
// Normally the server controls the fan. This safety rule only TURNS the fan ON in offline mode (broker unreachable
// for more than 2 minutes). It also turns off a fan it turned on itself, below temp_fan_on - 2 °C, even when the
// broker is reachable again, unless the server or you have taken that fan over with a fan command.
static void safetyFan(SensorReading b) {
  if (isnan(b.temperature)) {
    return;  // the DHT22 couldn't be read: don't guess, leave the fan as it is
  }
  float onLimit = tempFanThreshold();
  float offLimit = onLimit - FAN_HYSTERESIS;
  if (offlineMode() && !fanOn() && b.temperature > onLimit) {
    logInfo("Local safety: temperature %.1f C above %.1f C, fan turned on.", b.temperature, onLimit);
    setFanBySafety(true);
    recordLocalFan();  // counted for the offline-mode report
  } else if (fanBySafety() && b.temperature < offLimit) {
    logInfo("Local safety: temperature %.1f C below %.1f C, fan turned off.", b.temperature, offLimit);
    setFanBySafety(false);
  }
}

void runRules(SensorReading b) {
  autoWatering(b);
  autoLamp(b);
  safetyFan(b);  // Module 19 (Appendix A: "temp_fan_on")
}

void updateRules() {
  if (state == WATERING && !pumpOn()) {
    moveTo(COOLDOWN);  // the pump is off: start resting
  } else if (state == COOLDOWN && millis() - stateStartTime >= WATERING_COOLDOWN_TIME) {
    moveTo(STANDBY);  // rest is over: watering is allowed again
  }
}
