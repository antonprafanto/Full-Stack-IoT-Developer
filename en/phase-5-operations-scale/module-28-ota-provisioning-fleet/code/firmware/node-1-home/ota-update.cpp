// ota-update.cpp - the code of the ota-update module. Its functions and the order of its work are listed in ota-update.h.
// Compiled by the author (arduino-cli 1.5.1, esp32 3.3.12), but NOT run on a board yet: firmware README, "Status 1.7.0".
#include <Arduino.h>
#include <HTTPUpdate.h>           // comes with the esp32 3.3.12 package: httpUpdate (download + write to the other shelf)
#include <NetworkClientSecure.h>  // comes with the esp32 package: HTTPS with the built-in list of root certificates
#include <esp_task_wdt.h>         // watchdog
#include "config.h"
#include "logger.h"
#include "system.h"
#include "settings.h"
#include "actuators.h"
#include "display.h"
#include "networking.h"
#include "trial-period.h"
#include "ota-update.h"

static const char PLAN_LABEL[] = "ota_plan";  // NVS label (8 characters, limit 15)
static const char REPORT_LABEL[] = "ota_report";
const uint8_t REPORT_REPEATS = 3;  // the report rides along with at most 3 vitals (vitals QoS 0 can get lost)

static OtaReport report;           // a copy of the report in RAM
static bool hasReport = false;
static bool scheduled = false;     // the update command is accepted (ack ok:true), the download hasn't started yet
static bool inProgress = false;
static char newId[ID_MAX_LENGTH + 1] = "";
static char newVersion[VERSION_MAX_LENGTH + 1] = "";
static char newSha256[65] = "";
static int lastPercent = -10;  // -10: the 0 % report is printed too

// ---------- Records in NVS ----------
bool readOtaPlan(OtaPlan& plan) {
  return readRecord(PLAN_LABEL, &plan, sizeof(plan));
}

static void saveOtaPlan(const OtaPlan& plan) {
  saveRecord(PLAN_LABEL, &plan, sizeof(plan));
}

void clearOtaPlan() {
  clearRecord(PLAN_LABEL);
}

// Text from outside (a library's error message, a command id) used in the report: only visible ASCII characters, so that its JSON
// stays short and readable. Quotation marks and backslashes are replaced by spaces.
static void copyTidy(char* destination, size_t size, const char* source) {
  size_t i = 0;
  for (; source != nullptr && source[i] != '\0' && i + 1 < size; i++) {
    char c = source[i];
    destination[i] = (c < 32 || c > 126 || c == '"' || c == '\\') ? ' ' : c;
  }
  destination[i] = '\0';
}

void recordOtaResult(const char* id, const char* result, const char* version, const char* message) {
  memset(&report, 0, sizeof(report));
  snprintf(report.id, sizeof(report.id), "%s", id);  // the server uses the id to match it: copied as it is
  snprintf(report.result, sizeof(report.result), "%s", result);
  snprintf(report.version, sizeof(report.version), "%s", version);
  copyTidy(report.message, sizeof(report.message), message);
  report.sentCount = 0;
  saveRecord(REPORT_LABEL, &report, sizeof(report));
  hasReport = true;
  logInfo("Update report saved: %s for %s%s%s (rides along with the next %u vitals)", report.result, report.version,
          report.message[0] != '\0' ? ": " : "", report.message, REPORT_REPEATS);
}

const OtaReport* pendingOtaReport() {
  return hasReport ? &report : nullptr;
}

void otaReportSent() {
  if (!hasReport) {
    return;
  }
  report.sentCount++;
  if (report.sentCount >= REPORT_REPEATS) {
    clearRecord(REPORT_LABEL);
    hasReport = false;
    logInfo("The update report rode along with vitals %u times: done.", REPORT_REPEATS);
  } else {
    saveRecord(REPORT_LABEL, &report, sizeof(report));  // its count is saved too, even if Node 1 restarts
  }
}

// ---------- At startup ----------
static bool bootedByPowerOn() {  // the power went out and came back, not a restart by the program or the watchdog
  return strcmp(resetReasonName(), "POWERON") == 0 || strcmp(resetReasonName(), "BROWNOUT") == 0;
}

void setupOta() {
  if (readRecord(REPORT_LABEL, &report, sizeof(report)) && report.sentCount < REPORT_REPEATS) {
    hasReport = true;
    logInfo("An update report is waiting to be sent: %s for %s (%u of %u times so far)", report.result, report.version,
            report.sentCount, REPORT_REPEATS);
  }
  startTrialPeriod();  // trial-period.cpp: was the running shelf just installed over the air? the 60-second trial period starts

  OtaPlan r;
  if (!readOtaPlan(r)) {
    return;  // no update left behind
  }
  char message[OTA_MESSAGE_MAX_LENGTH + 1];
  // A "downloading" plan found by firmware that is in its TRIAL PERIOD isn't a failed download: the power went out right after
  // the library finished installing this firmware (the shelf already picked) but before its plan could be written as "installed".
  // That plan is handed over to the trial period below, which later reports success or rollback.
  if (r.stage == STAGE_DOWNLOADING && !inTrialPeriod()) {
    // Started again in the middle of a download (the power went out, or the watchdog). The old shelf is whole: the library writes the
    // first 16 bytes of the new shelf last, so the bootloader never runs a half-written shelf.
    if (bootedByPowerOn()) {
      snprintf(message, sizeof(message), "power lost while downloading");
    } else {
      snprintf(message, sizeof(message), "restarted while downloading (%s)", resetReasonName());
    }
    logError("The update to %s didn't finish: %s. Firmware %s stays in use.", r.to, message, FIRMWARE_VERSION);
    recordOtaResult(r.id, "failed", r.to, message);
    clearOtaPlan();
    return;
  }
  if (inTrialPeriod()) {  // this firmware is the one just installed: its plan is used by the trial period (trial-period.cpp)
    if (strcmp(FIRMWARE_VERSION, r.to) != 0) {
      logError("WARNING: the file of version %s contains FIRMWARE_VERSION %s. Forgot to raise FIRMWARE_VERSION before "
               "Export Compiled Binary?", r.to, FIRMWARE_VERSION);
    }
    return;
  }
  if (strcmp(FIRMWARE_VERSION, r.from) == 0) {
    // The old firmware is the one that started: the bootloader cancelled the new firmware (ABORTED) because Node 1 restarted in the
    // middle of its trial period (the power went out, the program crashed, or the watchdog) before the new firmware could prove itself.
    if (bootedByPowerOn()) {
      snprintf(message, sizeof(message), "power lost during the trial period");
    } else {
      snprintf(message, sizeof(message), "restarted during the trial period (%s)", resetReasonName());
    }
    logError("Firmware %s CANCELLED, back to %s: %s.", r.to, r.from, message);
    recordOtaResult(r.id, "rollback", r.to, message);
  } else if (strcmp(FIRMWARE_VERSION, r.to) == 0) {
    // The new firmware was already marked valid, but the power went out before its plan could be cleared.
    logInfo("Firmware %s was already valid before Node 1 lost power: the success report is sent now.", r.to);
    recordOtaResult(r.id, "succeeded", r.to, "");
  } else {
    logInfo("Old update plan (%s to %s) thrown away: firmware %s was installed by cable.", r.from, r.to, FIRMWARE_VERSION);
  }
  clearOtaPlan();
}

// ---------- Accepting the command ----------
bool updateInProgress() {
  return scheduled || inProgress;
}

const char* acceptUpdate(const char* id, const UpdateFields& content) {
  static char reason[64];  // static: sendAck() still reads its content after this function has ended
  UpdateState state = {
    FIRMWARE_VERSION, storedServerAddress(), ESP.getFreeSketchSpace(), inTrialPeriod(), updateInProgress(),
  };
  const char* refusal = checkUpdate(content, state, reason, sizeof(reason));  // ota-check.cpp, the same as the simulator
  if (refusal != nullptr) {
    return refusal;
  }
  // Copied now: the command's JSON is gone as soon as the calling function ends. The download is done by updateOta()
  // in the next pass of loop(), AFTER mqtt.loop() is over and the ack is already written to the connection.
  snprintf(newId, sizeof(newId), "%s", id);
  snprintf(newVersion, sizeof(newVersion), "%s", content.version);
  snprintf(newSha256, sizeof(newSha256), "%s", content.sha256);
  scheduled = true;
  if (compareVersions(content.version, FIRMWARE_VERSION) < 0) {
    logInfo("Update %s: a DOWNGRADE from %s to %s (the server sent it with Allow downgrade ticked).", id, FIRMWARE_VERSION, content.version);
  }
  return nullptr;
}

// ---------- Downloading ----------
// Called by HTTPUpdate every time one sector (4 KB) is written. This is the ONLY place where the watchdog is fed while
// downloading: if the data stops coming in the middle of the file, the watchdog isn't fed anymore (see runUpdate()).
static void onDownloadProgress(int done, int total) {
  esp_task_wdt_reset();
  int percent = total > 0 ? (int)((long long)done * 100 / total) : 0;
  if (percent / 10 != lastPercent / 10 || done == total) {
    lastPercent = percent;
    logInfo("Downloading firmware %s: %d %% (%d of %d bytes)", newVersion, percent, done, total);
    char line[22];
    snprintf(line, sizeof(line), "%d %%", percent);
    showMessage("FIRMWARE UPDATE", newVersion, line, "don't unplug power");
  }
}

// HTTPUpdate/HTTPClient/Update error codes into a short sentence for ota.message (at most 80 characters).
static void explainError(int code, NetworkClientSecure& secure, bool https, char* message, size_t size) {
  switch (code) {
    case HTTP_UE_TOO_LESS_SPACE:
      snprintf(message, size, "file bigger than the program shelf (-100 HTTP_UE_TOO_LESS_SPACE)");
      return;
    case HTTP_UE_SERVER_NOT_REPORT_SIZE:
      snprintf(message, size, "the server gave no Content-Length (-101 HTTP_UE_SERVER_NOT_REPORT_SIZE)");
      return;
    case HTTP_UE_SERVER_FILE_NOT_FOUND:
      snprintf(message, size, "file not on the server: 404 (-102 HTTP_UE_SERVER_FILE_NOT_FOUND)");
      return;
    case HTTP_UE_SERVER_FORBIDDEN:
      snprintf(message, size, "download refused by the server: 403 (-103 HTTP_UE_SERVER_FORBIDDEN)");
      return;
    case HTTP_UE_SERVER_WRONG_HTTP_CODE:  // including 3xx: HTTPUpdate doesn't follow redirects
      snprintf(message, size, "server answer not 200/304/403/404 (-104 HTTP_UE_SERVER_WRONG_HTTP_CODE)");
      return;
    case HTTP_UE_BIN_VERIFY_HEADER_FAILED:  // http://: file content that arrives more than 0.1 seconds late also ends up here
      snprintf(message, size, "first byte not 0xE9 or not arrived yet (-106 HTTP_UE_BIN_VERIFY_HEADER_FAILED)");
      return;
    case HTTP_UE_NO_PARTITION:
      snprintf(message, size, "no spare program shelf (-108 HTTP_UE_NO_PARTITION)");
      return;
    case HTTP_UE_SERVER_FAULTY_SHA256:
      snprintf(message, size, "the command's sha256 refused by Update (-109 HTTP_UE_SERVER_FAULTY_SHA256)");
      return;
    case UPDATE_ERROR_SHA256:  // the file differs from the one the command meant: the old shelf stays in use
      snprintf(message, size, "SHA-256 doesn't match the command (Update 15 UPDATE_ERROR_SHA256)");
      return;
    case HTTPC_ERROR_READ_TIMEOUT:  // only while WAITING for the head of the server's answer (HTTPClient), not in the middle of the file
      snprintf(message, size, "server silent 8 seconds before answering (-11 HTTPC_ERROR_READ_TIMEOUT)");
      return;
    case UPDATE_ERROR_STREAM:  // https://: the data stopped in the MIDDLE of the file, the library gives up after 300 x 0.1 seconds
      snprintf(message, size, "download stopped halfway: 30 seconds without data (Update 6 UPDATE_ERROR_STREAM)");
      return;
    case HTTPC_ERROR_CONNECTION_REFUSED: {  // also an HTTPS certificate that was refused: the details come from NetworkClientSecure
      char tls[48] = "";
      if (https) {
        secure.lastError(tls, sizeof(tls));
      }
      snprintf(message, size, "can't connect to server (-1)%s%s", tls[0] != '\0' ? ": " : "", tls);
      return;
    }
    default:
      break;
  }
  if (code < 0) {  // other HTTPClient errors (the connection dropped halfway, and so on)
    snprintf(message, size, "download failed: %s (%d)", HTTPClient::errorToString(code).c_str(), code);
  } else if (code > 0) {  // Update errors (writing the flash, the data stream cut off, ...)
    snprintf(message, size, "%s (Update %d)", httpUpdate.getLastErrorString().c_str(), code);
  } else {
    // http.begin() failed: the error code isn't filled in. Note: httpUpdate doesn't reset its error code on every attempt,
    // so after another failure, the old code is the one read. Practically never happens: the address was already checked before.
    snprintf(message, size, "download failed (the address can't be used)");
  }
}

// Downloads the firmware and writes it to the other shelf. true = success (the other shelf is ready to run after the restart).
static bool downloadFirmware(char* message, size_t size) {
  if (!wifiConnected()) {
    snprintf(message, size, "Wi-Fi lost before downloading");
    return false;
  }
  if (brokerKey()[0] == '\0') {
    snprintf(message, size, "no device key yet: the download needs a key (Module 21)");
    return false;
  }
  char url[SERVER_ADDRESS_MAX_LENGTH + 48];
  // The download address is built by Node 1 ITSELF from the stored server address (exactly the same as the command's url that was
  // already checked, only in lowercase): the device key is never sent to an address someone else wrote.
  if (!buildFirmwareUrl(storedServerAddress(), newVersion, url, sizeof(url))) {
    snprintf(message, size, "download address too long");
    return false;
  }
  bool https = strncmp(url, "https://", 8) == 0;
  // HTTPS doesn't need to wait for the internet clock: the esp32 3.3.12 package checks the certificate chain and the server name, but
  // does NOT check its validity dates (CONFIG_MBEDTLS_HAVE_TIME_DATE is off in that package).
  NetworkClient plain;          // http:// only to a home IP address (already checked by ota-check.cpp)
  NetworkClientSecure secure;   // https://: the server's certificate is checked with the built-in root list (ISRG Root X1 and X2 included)
  NetworkClient* client = &plain;
  if (https) {
    secure.useBuiltinCACertBundle();  // new in the esp32 3.3.12 package
    secure.setHandshakeTimeout(20);   // seconds: a stuck TLS handshake doesn't wait for the watchdog
    client = &secure;
  }
  httpUpdate.rebootOnUpdate(false);                 // we restart by ourselves, after the plan in NVS is updated
  httpUpdate.setLedPin(PIN_STATUS_LED, HIGH);       // the status LED blinks while writing
  httpUpdate.setAuthorization(myDeviceId(), brokerKey());  // Basic device_id:key, matched by the backend (Module 21)
  httpUpdate.setSHA256sum(newSha256);               // wins over the server's x-SHA256 header
  httpUpdate.onProgress(onDownloadProgress);
  lastPercent = -10;
  logInfo("Downloading %s ...", url);
  unsigned long start = millis();
  HTTPUpdateResult result = httpUpdate.update(*client, url, FIRMWARE_VERSION);  // x-ESP32-version = the running version
  if (result == HTTP_UPDATE_OK) {
    logInfo("Firmware %s written on the other shelf in %lu seconds, the SHA-256 fingerprint matches.", newVersion, (millis() - start) / 1000);
    return true;
  }
  if (result == HTTP_UPDATE_NO_UPDATES) {  // 304: the server thinks that version is already installed
    snprintf(message, size, "server: no update (304, HTTP_UPDATE_NO_UPDATES)");
    return false;
  }
  explainError(httpUpdate.getLastError(), secure, https, message, size);
  return false;
}

static void runUpdate() {
  scheduled = false;
  inProgress = true;
  logInfo("Update %s ACCEPTED: %s to %s.", newId, FIRMWARE_VERSION, newVersion);

  // 1. The plan into NVS first: if the power goes out halfway, the firmware that starts afterwards knows it must report.
  OtaPlan plan;
  memset(&plan, 0, sizeof(plan));
  snprintf(plan.id, sizeof(plan.id), "%s", newId);
  snprintf(plan.from, sizeof(plan.from), "%s", FIRMWARE_VERSION);
  snprintf(plan.to, sizeof(plan.to), "%s", newVersion);
  plan.stage = STAGE_DOWNLOADING;
  saveOtaPlan(plan);

  // 2. Pump and buzzer off: while downloading, loop() doesn't run (the local safety guards stop too for ±1 minute).
  turnOffPumpAndBuzzer();

  // 3. Stop on purpose: "offline-mode" then a CLEAN DISCONNECT, so that the broker doesn't publish the "offline" will.
  stopOnPurpose();
  showMessage("FIRMWARE UPDATE", newVersion, "contacting server", "don't unplug power");

  // 4. The watchdog is relaxed to 60 seconds: connecting + waiting for the server's answer alone may take 8 seconds (more than the
  //    usual 5-second limit), and while the file flows, the watchdog is fed every 4 KB (onDownloadProgress). If the data STOPS in the
  //    middle of the file: over https://, the library gives up by itself after ±30 seconds (Update 6, then the old firmware connects
  //    again); over http://, the library waits much longer, so the 60-second watchdog restarts Node 1. The old shelf stays
  //    whole, and after starting, the old firmware reports "failed: restarted while downloading (WDT)".
  setWatchdogTimeout(OTA_WATCHDOG_TIMEOUT);

  // 5. Download + write + check the SHA-256 fingerprint.
  char message[OTA_MESSAGE_MAX_LENGTH + 1] = "";
  if (downloadFirmware(message, sizeof(message))) {
    plan.stage = STAGE_INSTALLED;  // the bootloader already picked the other shelf for the next start
    saveOtaPlan(plan);
    logInfo("Restarting into firmware %s. The 60-second trial period starts right after the restart.", newVersion);
    showMessage("FIRMWARE UPDATE", newVersion, "downloaded", "restarting...");
    Serial.flush();
    delay(200);
    ESP.restart();  // the next reset_reason: SW
  }

  // Failed BEFORE restarting: the old shelf is whole, the old firmware keeps running without a restart.
  setWatchdogTimeout(WATCHDOG_TIMEOUT);
  logError("The update to %s FAILED: %s. Firmware %s stays in use.", newVersion, message, FIRMWARE_VERSION);
  recordOtaResult(newId, "failed", newVersion, message);
  clearOtaPlan();
  inProgress = false;
  showMessage("UPDATE FAILED", newVersion, "old firmware", "still in use");
  resumeConnection();  // networking.cpp: connected to the broker again (online), then vitals carry the "failed" report
}

void updateOta() {
  updateTrialPeriod();  // trial-period.cpp: 60 seconds passed without proof = rollback
  if (scheduled) {
    runUpdate();
  }
}

// ---------- Restarting on purpose (the Serial commands "restart", "wifi forget") ----------
void prepareRestart(const char* cause) {
  if (inTrialPeriod()) {
    // Restarting in the middle of the trial period cancels the new firmware: the bootloader goes back to the old shelf (contract rule 13).
    OtaPlan r;
    if (readOtaPlan(r)) {
      recordOtaResult(r.id, "rollback", r.to, "restarted during the trial period");
      clearOtaPlan();
    }
    logError("Restart in the middle of the trial period: firmware %s CANCELLED, Node 1 goes back to the previous firmware.", FIRMWARE_VERSION);
  }
  logInfo("Stopped on purpose (%s): status offline-mode, then a clean disconnect from the broker.", cause);
  stopOnPurpose();
}

void restartOnPurpose(const char* cause) {
  prepareRestart(cause);
  Serial.println("Restarting now...");
  Serial.flush();  // wait until the message above has really been sent
  delay(200);
  ESP.restart();
}

// ---------- The Serial command "ota" ----------
void printOtaInfo() {
  Serial.printf("ota: firmware %s (%s), server address %s\n", FIRMWARE_VERSION, VERSION_NOTE,
                storedServerAddress()[0] != '\0' ? storedServerAddress() : "NOT SET (type: server <address>)");
  printShelfInfo();  // trial-period.cpp: the running shelf, the other shelf, the trial period
  if (updateInProgress()) {
    Serial.printf("ota: the update to %s is running\n", newVersion);
  }
  OtaPlan r;
  if (readOtaPlan(r)) {
    Serial.printf("ota: stored plan: %s to %s (id %s, stage %u)\n", r.from, r.to, r.id, r.stage);
  }
  if (hasReport) {
    Serial.printf("ota: waiting report: %s for %s%s%s (id %s, %u of %u vitals so far)\n", report.result, report.version,
                  report.message[0] != '\0' ? ": " : "", report.message, report.id, report.sentCount, REPORT_REPEATS);
  } else {
    Serial.println("ota: no update report is waiting");
  }
}
