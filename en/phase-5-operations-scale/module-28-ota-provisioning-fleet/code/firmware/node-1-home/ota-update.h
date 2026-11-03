// ota-update.h - over-the-air firmware updates (OTA) from the home server, on the MQTT "update" command (Module 28).
// The order (DATA-CONTRACT.md 1.6 section 7, the same as the simulator tools/device-simulator.js):
//   check the command -> ack ok:true ("accepted", NOT "finished") -> plan into NVS -> pump and buzzer off ->
//   status "offline-mode" + a CLEAN disconnect from the broker -> watchdog 60 seconds -> download <server address>/fw/node-1/<version>.bin
//   (Basic device_id:key, SHA-256 fingerprint from the command) -> success: restart into the other shelf, 60-second trial period
//   (trial-period.cpp); failure: the watchdog back to 5 seconds, connected again, a "failed" report rides along with vitals.
// The result of every update is saved in NVS BEFORE the restart, then sent in vitals (at most 3 times).
#pragma once
#include <stdint.h>
#include "version.h"    // VERSION_MAX_LENGTH
#include "ota-check.h"  // UpdateFields

const int ID_MAX_LENGTH = 39;           // contract rule 4: a command id is at most 39 characters
const int OTA_MESSAGE_MAX_LENGTH = 80;  // contract 1.6: ota.message is at most 80 characters

const uint8_t STAGE_DOWNLOADING = 1;  // plan saved, the firmware is being downloaded (the old shelf is still whole)
const uint8_t STAGE_INSTALLED = 2;    // the new firmware is already written on the other shelf, Node 1 restarts into it

// The update plan, saved in NVS BEFORE downloading (label "ota_plan"). With this plan, the firmware that starts
// afterwards (new or old) knows what is going on, even if the power went out in between.
struct OtaPlan {
  char id[ID_MAX_LENGTH + 1];         // id of the update command
  char from[VERSION_MAX_LENGTH + 1];  // the version running when the command came
  char to[VERSION_MAX_LENGTH + 1];    // the version being installed
  uint8_t stage;                      // STAGE_DOWNLOADING or STAGE_INSTALLED
};

// The report of one update's result (label "ota_report"), its content is the same as the "ota" object in vitals (contract 1.6 section 6).
struct OtaReport {
  char id[ID_MAX_LENGTH + 1];
  char result[10];                           // "succeeded", "rollback", or "failed"
  char version[VERSION_MAX_LENGTH + 1];      // the version TRIED
  char message[OTA_MESSAGE_MAX_LENGTH + 1];  // the reason for a rollback/failure; "" = not written
  uint8_t sentCount;                         // how many vitals it already rode along with (at most 3)
};

void setupOta();   // setup(), after loadSettings() and BEFORE setupNetwork(): the trial period + a plan left behind
void updateOta();  // loop(): runs an update already accepted, and watches the 60-second trial period

// Called by networking.cpp for the MQTT "update" command. nullptr = accepted (ack ok:true, the download starts in the next
// pass of loop()), otherwise the reason of the refusal for ack ok:false.
const char* acceptUpdate(const char* id, const UpdateFields& content);
bool updateInProgress();  // true from when the command is accepted until the download is over

const OtaReport* pendingOtaReport();  // a report that hasn't ridden along with vitals 3 times yet; nullptr if none
void otaReportSent();                 // called after the vitals carrying that report were published successfully
void recordOtaResult(const char* id, const char* result, const char* version, const char* message);  // save a new report to NVS
bool readOtaPlan(OtaPlan& plan);  // false if no plan is stored
void clearOtaPlan();

void prepareRestart(const char* cause);    // stopping on purpose: the trial period report (if needed), offline-mode, a clean disconnect
void restartOnPurpose(const char* cause);  // prepareRestart(), then ESP.restart(): the Serial command "restart"
void printOtaInfo();                       // the answer to the Serial command "ota"
