// trial-period.cpp - the code of the trial period module. Its functions are listed in trial-period.h.
// Compiled by the author (arduino-cli 1.5.1, esp32 3.3.12), but NOT run on a board yet: firmware README, "Status 1.7.0".
#include <Arduino.h>
#include <esp_ota_ops.h>  // ESP-IDF: the state of the program shelves (otadata), mark the firmware valid or cancel it
#include <esp_task_wdt.h> // watchdog: guards setup() during the trial period
#include "config.h"
#include "logger.h"
#include "system.h"
#include "display.h"
#include "ota-update.h"
#include "trial-period.h"

// ================================================================================================================
// THE MOST IMPORTANT LINE OF MODULE 28: without it, the automatic rollback NEVER happens, and there is no message at all.
//
// The bootloader of the esp32 3.3.12 package can already roll back: firmware just installed over the air starts in the state
// PENDING_VERIFY ("waiting to be proven"). But before setup() runs, the Arduino core (initArduino() in
// esp32-hal-misc.c) asks the function verifyRollbackLater(): "do you want to prove it yourself later?". Its default answer is
// false, so the Arduino core marks the new firmware VALID right away, before it even tried the broker. Even firmware with a
// wrong broker key counts as valid, and will never go back to the old version.
//
// The function below replaces that default answer with true: "yes, I prove it myself" (the trial period below).
//
// Why extern "C"? The default function is written in the C language (a .c file). C++ quietly changes every function's name
// when it compiles (name mangling, for example into _Z19verifyRollbackLaterv) so that functions with the same name may have
// different parameters. Without extern "C", our function has another name in the linker's eyes, the default function is still
// used, and the compile still SUCCEEDS without any warning. extern "C" = "use the name as it is, like the C language", so that
// our function replaces the default function (which is marked weak = "may be replaced").
// ================================================================================================================
extern "C" bool verifyRollbackLater() {
  return true;
}

static bool trialPeriod = false;

// The watchdog timeout during setup() of firmware in its trial period: the 60-second trial period + 15 seconds. If setup() finishes
// sooner (usually within a few seconds), the timeout goes back to 5 seconds at the end of setup() as usual.
const unsigned long TRIAL_SETUP_WATCHDOG_TIMEOUT = OTA_TRIAL_PERIOD + 15000;

// The name of a program shelf's state in otadata (esp_ota_img_states_t), for the Serial command "ota".
static const char* stateName(esp_ota_img_states_t state) {
  switch (state) {
    case ESP_OTA_IMG_NEW: return "NEW, never started yet";
    case ESP_OTA_IMG_PENDING_VERIFY: return "PENDING_VERIFY, trial period";
    case ESP_OTA_IMG_VALID: return "VALID, already proven";
    case ESP_OTA_IMG_INVALID: return "INVALID, refused";
    case ESP_OTA_IMG_ABORTED: return "ABORTED, cancelled";
    case ESP_OTA_IMG_UNDEFINED: return "UNDEFINED, installed by cable";
    default: return "unknown";
  }
}

void startTrialPeriod() {
  const esp_partition_t* running = esp_ota_get_running_partition();
  esp_ota_img_states_t state;
  if (running == nullptr || esp_ota_get_state_partition(running, &state) != ESP_OK) {
    return;  // the state isn't recorded (for example just installed by cable): no trial period
  }
  if (state != ESP_OTA_IMG_PENDING_VERIFY) {
    return;
  }
  trialPeriod = true;
  logInfo("TRIAL PERIOD: firmware %s was just installed over the air on shelf %s. Within %lu seconds it must connect to the broker "
          "and publish; otherwise Node 1 goes back to the previous firmware by itself.", FIRMWARE_VERSION, running->label,
          OTA_TRIAL_PERIOD / 1000);
  logInfo("During the trial period, the Wi-Fi portal isn't opened and update commands are refused.");

  // The trial period also guards setup(). Normally the watchdog only starts watching loop() at the END of setup(), and the trial
  // period is checked in loop(). New firmware that hangs in setup() (for example waiting for a sensor forever) would never reach
  // loop(), so it would never be rolled back. That's why, from now on, the watchdog watches this task with a 75-second limit: hanging
  // in setup() = the watchdog restarts Node 1, and the bootloader cancels the firmware that isn't proven yet (PENDING_VERIFY becomes
  // ABORTED), so Node 1 still goes back to the old firmware and reports "rollback".
  // The order: register first, then set the limit (feeding the watchdog before registering = the error "task not found").
  if (esp_task_wdt_status(NULL) != ESP_OK) {   // ESP_OK = this task is already watched
    esp_task_wdt_add(NULL);                    // NULL = the task that is running now: setup() then loop()
  }
  setWatchdogTimeout(TRIAL_SETUP_WATCHDOG_TIMEOUT);  // system.cpp
}

bool inTrialPeriod() {
  return trialPeriod;
}

void firmwareProven() {
  if (!trialPeriod) {
    return;
  }
  trialPeriod = false;
  // Mark it valid FIRST, then record it in NVS: if the power goes out between the two, this firmware is still valid and
  // setupOta() at the next start writes the "succeeded" report from the plan left behind.
  esp_err_t error = esp_ota_mark_app_valid_cancel_rollback();  // otadata: PENDING_VERIFY -> VALID
  char message[OTA_MESSAGE_MAX_LENGTH + 1] = "";
  if (error != ESP_OK) {
    snprintf(message, sizeof(message), "couldn't be marked valid: %s", esp_err_to_name(error));
    logError("Firmware %s %s: the next restart may go back to the old firmware.", FIRMWARE_VERSION, message);
  }
  OtaPlan r;
  if (readOtaPlan(r)) {
    if (message[0] == '\0' && strcmp(FIRMWARE_VERSION, r.to) != 0) {
      snprintf(message, sizeof(message), "fw %s, not %s: FIRMWARE_VERSION not raised?", FIRMWARE_VERSION, r.to);
    }
    recordOtaResult(r.id, "succeeded", r.to, message);
    clearOtaPlan();
  }
  logInfo("Firmware %s VALID: connected to the broker and published %lu seconds after starting.", FIRMWARE_VERSION, millis() / 1000);
}

void updateTrialPeriod() {
  if (!trialPeriod || millis() < OTA_TRIAL_PERIOD) {  // millis() counts from when Node 1 started
    return;
  }
  trialPeriod = false;
  OtaPlan r;
  bool hasPlan = readOtaPlan(r);
  logError("Firmware %s NOT proven within %lu seconds (not connected to the broker): ROLLBACK to the previous firmware.",
           FIRMWARE_VERSION, OTA_TRIAL_PERIOD / 1000);
  if (hasPlan) {  // the report is saved BEFORE the restart: after the restart, the old firmware is the one that runs
    recordOtaResult(r.id, "rollback", r.to, "not connected to the broker within 60 seconds");
    clearOtaPlan();
  }
  showMessage("ROLLBACK", "new firmware failed", "back to version", hasPlan ? r.from : "previous");
  Serial.flush();
  esp_err_t error = esp_ota_mark_app_invalid_rollback_and_reboot();  // otadata: INVALID, then restart into the old shelf
  // If it gets here, the function above FAILED and didn't restart (for example the old shelf isn't valid). A normal restart still
  // cancels this firmware: the bootloader changes PENDING_VERIFY into ABORTED and picks the old shelf.
  logError("Automatic rollback failed (%s): a normal restart.", esp_err_to_name(error));
  Serial.flush();
  delay(100);
  ESP.restart();
}

void printShelfInfo() {
  const esp_partition_t* running = esp_ota_get_running_partition();
  const esp_partition_t* other = esp_ota_get_next_update_partition(nullptr);
  esp_ota_img_states_t state;
  const char* text = "not recorded (installed by cable)";
  if (running != nullptr && esp_ota_get_state_partition(running, &state) == ESP_OK) {
    text = stateName(state);
  }
  Serial.printf("ota: running shelf %s (%s); other shelf %s, %lu bytes\n", running != nullptr ? running->label : "?", text,
                other != nullptr ? other->label : "NONE (a partition scheme without OTA)",
                other != nullptr ? (unsigned long)other->size : 0UL);
  const esp_partition_t* cancelled = esp_ota_get_last_invalid_partition();
  if (cancelled != nullptr) {
    Serial.printf("ota: shelf %s was cancelled before (firmware that failed to prove itself)\n", cancelled->label);
  }
  if (trialPeriod) {
    unsigned long remaining = millis() < OTA_TRIAL_PERIOD ? (OTA_TRIAL_PERIOD - millis()) / 1000 : 0;
    Serial.printf("ota: TRIAL PERIOD, %lu seconds left\n", remaining);
  } else {
    Serial.println("ota: trial period: no");
  }
}
