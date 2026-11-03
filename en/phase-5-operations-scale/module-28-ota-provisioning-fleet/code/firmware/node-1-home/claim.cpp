// claim.cpp - the code of the claim module. Its functions are listed in claim.h.
// Compiled by the author (arduino-cli 1.5.1, esp32 3.3.12), but NOT run on a board yet: firmware README, "Status 1.7.0".
#include <Arduino.h>
#include <HTTPClient.h>           // comes with the esp32 package
#include <NetworkClientSecure.h>  // comes with the esp32 package: HTTPS with the built-in list of root certificates
#include <ArduinoJson.h>
#include "config.h"
#include "logger.h"
#include "system.h"
#include "settings.h"
#include "ota-check.h"
#include "networking.h"
#include "trial-period.h"
#include "claim.h"

const unsigned long CLAIM_RETRY_INTERVAL = 30000;  // the server can't be reached or 503: try again 30 seconds later
const int MAX_CLAIM_ATTEMPTS = 3;                  // at most 3 times; after that, type "claim <code>" again

static char claimCode[13] = "";  // RAM only: a single-use code is never written to NVS
static bool waiting = false;
static bool hasTried = false;
static int attempt = 0;
static unsigned long lastTryTime = 0;

static void finishClaim() {
  memset(claimCode, 0, sizeof(claimCode));  // the code is wiped from RAM too
  waiting = false;
}

const char* startClaim(const char* code) {
  const char* wrong = checkClaimCode(code);  // ota-check.cpp: only its form
  if (wrong != nullptr) {
    return wrong;
  }
  if (inTrialPeriod()) {
    return "wait until the new firmware's trial period is over (type: ota)";
  }
  if (storedServerAddress()[0] == '\0') {
    return "server address not set: type claim <code> <server address>, or server <address> first";
  }
  snprintf(claimCode, sizeof(claimCode), "%s", code);
  waiting = true;
  hasTried = false;
  attempt = 0;
  logInfo("Claim code accepted (not saved in NVS); sent to %s as soon as Wi-Fi is ready.", storedServerAddress());
  return nullptr;
}

static void sendClaim(const char* server, bool https) {
  hasTried = true;
  lastTryTime = millis();
  attempt++;
  char url[SERVER_ADDRESS_MAX_LENGTH + 24];
  snprintf(url, sizeof(url), "%s/api/provision/claim", server);
  char content[64];  // the code was already checked (letters, digits, -, spaces), so it is safe to write it straight into JSON
  snprintf(content, sizeof(content), "{\"code\":\"%s\",\"device_id\":\"%s\"}", claimCode, myDeviceId());
  logInfo("Claim: sending the code to %s (attempt %d of %d)...", url, attempt, MAX_CLAIM_ATTEMPTS);

  setWatchdogTimeout(OTA_WATCHDOG_TIMEOUT);  // an HTTPS handshake may take more than 5 seconds
  NetworkClient plain;
  NetworkClientSecure secure;
  NetworkClient* client = &plain;
  if (https) {
    secure.useBuiltinCACertBundle();
    secure.setHandshakeTimeout(20);
    client = &secure;
  }
  HTTPClient http;
  int code = HTTPC_ERROR_CONNECTION_REFUSED;
  String reply;
  unsigned long start = millis();
  if (http.begin(*client, url)) {
    http.setConnectTimeout(5000);
    http.setTimeout(10000);
    http.addHeader("Content-Type", "application/json");
    code = http.POST(String(content));
    if (code > 0) {
      reply = http.getString();
    }
    http.end();
  }
  setWatchdogTimeout(WATCHDOG_TIMEOUT);
  unsigned long elapsed = millis() - start;

  JsonDocument doc;
  bool validJson = code > 0 && !deserializeJson(doc, reply);
  if (code == HTTP_CODE_CREATED) {
    const char* key = validJson ? (doc["key"] | "") : "";
    if (!saveBrokerKey(key)) {  // settings.cpp: 1-64 characters A-Z, a-z, 0-9, - or _
      logError("Claim: a 201 answer without a valid key. Report it to the admin.");
      finishClaim();
      return;
    }
    logInfo("Claim SUCCEEDED in %lu ms: device key saved in NVS (broker username %s). Connecting to the broker...",
            elapsed, myDeviceId());
    changeBrokerKey();  // networking.cpp: tried right away with the new key
    finishClaim();
    return;
  }
  const char* message = validJson ? (doc["message"] | "") : "";  // our server's errors and Fastify's both use "message"
  if (code <= 0) {
    char tls[48] = "";
    if (https) {
      secure.lastError(tls, sizeof(tls));
    }
    logError("Claim FAILED: server %s can't be reached (%s)%s%s", server, HTTPClient::errorToString(code).c_str(),
             tls[0] != '\0' ? ": " : "", tls);
  } else {
    logError("Claim REFUSED %d: %s", code, message[0] != '\0' ? message : "(no message)");
  }
  if (code == 403) {
    logInfo("Wrong code, expired, or already used: ask the admin for a new code (/fleet, Create claim code).");
  } else if (code == 409) {
    logInfo("This device is still registered and active: deactivate it on /fleet first, then claim again with a new code.");
  } else if (code == 429) {
    logInfo("Too many attempts: wait 1 minute, then type claim <code> again.");
  }
  if ((code <= 0 || code == 503) && attempt < MAX_CLAIM_ATTEMPTS) {  // 503: the code is NOT used up
    logInfo("Claim tried again in %lu seconds.", CLAIM_RETRY_INTERVAL / 1000);
  } else {
    finishClaim();
  }
}

void updateClaim() {
  if (!waiting || inTrialPeriod() || !wifiConnected()) {
    return;
  }
  if (hasTried && millis() - lastTryTime < CLAIM_RETRY_INTERVAL) {
    return;
  }
  const char* server = storedServerAddress();
  if (server[0] == '\0') {
    logError("Claim cancelled: server address not set.");
    finishClaim();
    return;
  }
  // HTTPS doesn't need to wait for the internet clock: the esp32 3.3.12 package checks the certificate chain and the server name, but
  // does NOT check its validity dates (CONFIG_MBEDTLS_HAVE_TIME_DATE is off in that package). So the claim is sent as soon as Wi-Fi is ready.
  bool https = strncmp(server, "https://", 8) == 0;
  sendClaim(server, https);
}

void printClaimInfo() {
  if (waiting) {
    Serial.printf("claim: a code is waiting to be sent to %s (%d of %d attempts so far)\n", storedServerAddress(), attempt,
                  MAX_CLAIM_ATTEMPTS);
  } else {
    Serial.println("claim: no code is waiting");
  }
}
