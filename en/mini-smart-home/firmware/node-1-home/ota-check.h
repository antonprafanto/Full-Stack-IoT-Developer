// ota-check.h - checking the content of an "update" command, the server address, the broker address, and the claim code (Module 28).
// Every function here only CHECKS text and numbers: it doesn't touch Wi-Fi, MQTT, NVS, or the flash. That's why this file
// uses nothing from Arduino and can be tested on a laptop (host tests). Its rules follow DATA-CONTRACT.md 1.6
// sections 7 and 10, and the order of its checks is the same as the simulator's tools/device-simulator.js (checkUpdate).
#pragma once
#include <stddef.h>
#include <stdint.h>

const uint32_t CONTRACT_PROGRAM_SHELF = 1966080;  // one Minimal SPIFFS program shelf (Module 10): the contract 1.6 "size" limit
const int SERVER_ADDRESS_MAX_LENGTH = 64;         // the "Server address" field of the Wi-Fi portal
const int BROKER_ADDRESS_MAX_LENGTH = 40;         // the "Broker address" field of the Wi-Fi portal
const int URL_MAX_LENGTH = 200;                   // contract 1.6: a url is at most 200 characters
// The first version with a trial period and a rollback. Versions below it are refused over the air: the Arduino core marks that
// firmware valid right away without a trial period, and it can't take an update command anymore (only fixed by cable).
const char FIRST_OTA_VERSION[] = "1.7.0";

// "192.168.1.10" (without a port) is an IPv4 address on the home network: 10.x.x.x, 172.16.x.x-172.31.x.x, or 192.168.x.x.
bool isHomeIpAddress(const char* host);

// Tidies a typed address: spaces at the edges are dropped, capitals become lowercase, a slash at the end is dropped.
void tidyAddress(const char* in, char* out, size_t size);

// A server address that may be stored (already tidied): http://<home IP>[:port] or https://<name>[:port], without a path.
// Answers nullptr if it is valid, or the sentence with the reason.
const char* checkServerAddress(const char* address);

// A broker address that may be stored: an IP address on the home network (data contract section 3: at home, broker = an IP, door 1883).
const char* checkBrokerAddress(const char* address);

// A claim code from the admin (XXXX-XXXX). Only its form is checked here; the server checks whether it is right.
const char* checkClaimCode(const char* code);

// <server address>/fw/node-1/<version>.bin, the only address Node 1 is willing to download firmware from. false = it doesn't fit.
bool buildFirmwareUrl(const char* server, const char* version, char* out, size_t size);

// The content of an "update" command already read from the JSON. nullptr = that field is missing or isn't text.
struct UpdateFields {
  const char* version;
  const char* url;
  const char* sha256;
  long long size;  // -1 if missing or not a whole number
};

// Node 1's state when that command arrives.
struct UpdateState {
  const char* runningVersion;  // FIRMWARE_VERSION
  const char* serverAddress;   // the stored server address (already tidied); "" if not set yet
  uint32_t shelfSpace;         // ESP.getFreeSketchSpace(): the size of the other program shelf, 0 if there is none
  bool trialPeriod;            // the running firmware still has to prove itself (60 seconds)
  bool updateRunning;          // another update was already accepted and hasn't finished
};

// Answers nullptr if the command may be carried out (ack ok:true), or the reason it is refused (ack ok:false + message).
// A reason that holds a number is written to "reason" (at least 48 characters).
const char* checkUpdate(const UpdateFields& content, const UpdateState& state, char* reason, size_t size);
