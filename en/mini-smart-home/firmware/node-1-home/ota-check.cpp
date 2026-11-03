// ota-check.cpp - the code of the ota-check module. Its functions are listed in ota-check.h.
#include <stdio.h>
#include <string.h>
#include "version.h"
#include "ota-check.h"

static bool digit(char c) {
  return c >= '0' && c <= '9';
}

static char lowercase(char c) {
  return (c >= 'A' && c <= 'Z') ? (char)(c - 'A' + 'a') : c;
}

// Reads an IPv4 address "a.b.c.d" (exactly four parts 0-255, with nothing after it).
static bool parseIpv4(const char* text, int parts[4]) {
  int position = 0;
  for (int i = 0; i < 4; i++) {
    int value = 0;
    int count = 0;
    while (digit(text[position]) && count < 4) {
      value = value * 10 + (text[position] - '0');
      count++;
      position++;
    }
    if (count == 0 || count > 3 || value > 255) {
      return false;
    }
    parts[i] = value;
    char separator = (i < 3) ? '.' : '\0';
    if (text[position] != separator) {
      return false;
    }
    position++;
  }
  return true;
}

bool isHomeIpAddress(const char* host) {
  int b[4];
  if (host == nullptr || !parseIpv4(host, b)) {
    return false;
  }
  return b[0] == 10 || (b[0] == 172 && b[1] >= 16 && b[1] <= 31) || (b[0] == 192 && b[1] == 168);
}

void tidyAddress(const char* in, char* out, size_t size) {
  if (size == 0) {
    return;
  }
  out[0] = '\0';
  if (in == nullptr) {
    return;
  }
  while (*in == ' ' || *in == '\t') {
    in++;  // drop the spaces in front
  }
  size_t length = strlen(in);
  while (length > 0 && (in[length - 1] == ' ' || in[length - 1] == '\t' || in[length - 1] == '/')) {
    length--;  // drop the spaces and slashes at the back
  }
  if (length >= size) {
    length = size - 1;  // cut off: the length check afterwards will refuse it
  }
  for (size_t i = 0; i < length; i++) {
    out[i] = lowercase(in[i]);
  }
  out[length] = '\0';
}

// "http://" (7) or "https://" (8) at the start of the text; 0 if neither. Capitals and lowercase count as the same.
static size_t schemeLength(const char* text, bool* secure) {
  const char* prefix[2] = {"http://", "https://"};
  for (int i = 0; i < 2; i++) {
    size_t n = strlen(prefix[i]);
    size_t j = 0;
    while (j < n && text[j] != '\0' && lowercase(text[j]) == prefix[i][j]) {
      j++;
    }
    if (j == n) {
      *secure = (i == 1);
      return n;
    }
  }
  return 0;
}

// Copies the "host" part of "host:port" (without the port) to "out" and checks its port. false = the wrong form.
static bool splitHost(const char* hostPort, size_t length, char* out, size_t size) {
  size_t colon = length;
  for (size_t i = 0; i < length; i++) {
    if (hostPort[i] == ':') {
      colon = i;
      break;
    }
  }
  if (colon == 0 || colon >= size) {
    return false;
  }
  memcpy(out, hostPort, colon);
  out[colon] = '\0';
  if (colon < length) {  // there is a ":port": 1-5 digits, 1-65535
    long port = 0;
    size_t count = 0;
    for (size_t i = colon + 1; i < length; i++) {
      if (!digit(hostPort[i]) || count >= 5) {
        return false;
      }
      port = port * 10 + (hostPort[i] - '0');
      count++;
    }
    if (count == 0 || port < 1 || port > 65535) {
      return false;
    }
  }
  return true;
}

const char* checkServerAddress(const char* address) {
  const char* example = "Write the server address without a / at the end, for example http://192.168.1.10 or https://iot.yourname.my.id";
  if (address == nullptr || address[0] == '\0') {
    return example;
  }
  if (strlen(address) > (size_t)SERVER_ADDRESS_MAX_LENGTH) {
    return "Server address at most 64 characters";
  }
  bool secure = false;
  size_t scheme = schemeLength(address, &secure);
  if (scheme == 0) {
    return example;
  }
  const char* hostPort = address + scheme;
  size_t length = strlen(hostPort);
  for (size_t i = 0; i < length; i++) {  // only lowercase letters, digits, dots, -, and : for the port
    char c = hostPort[i];
    if (!((c >= 'a' && c <= 'z') || digit(c) || c == '.' || c == '-' || c == ':')) {
      return example;  // for example a path (/), an @, a space, or a capital that wasn't tidied
    }
  }
  char host[SERVER_ADDRESS_MAX_LENGTH + 1];
  if (!splitHost(hostPort, length, host, sizeof(host))) {
    return example;
  }
  if (!secure && !isHomeIpAddress(host)) {
    return "http only for the home network (IP address 10.x, 172.16-31.x, 192.168.x): use https:// on the internet";
  }
  return nullptr;
}

const char* checkBrokerAddress(const char* address) {
  if (address == nullptr || strlen(address) > (size_t)BROKER_ADDRESS_MAX_LENGTH || !isHomeIpAddress(address)) {
    return "Broker address must be an IP address on the home network, for example 192.168.1.37 (without http:// and without a port)";
  }
  return nullptr;
}

const char* checkClaimCode(const char* code) {
  size_t length = (code == nullptr) ? 0 : strlen(code);
  if (length < 8 || length > 12) {
    return "claim code must be 8 characters, for example 7K2M-QF9D";
  }
  for (size_t i = 0; i < length; i++) {
    char c = code[i];
    if (!((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || digit(c) || c == '-' || c == ' ')) {
      return "a claim code only contains letters, digits, and -, for example 7K2M-QF9D";
    }
  }
  return nullptr;
}

bool buildFirmwareUrl(const char* server, const char* version, char* out, size_t size) {
  int n = snprintf(out, size, "%s/fw/node-1/%s.bin", server, version);
  return n > 0 && (size_t)n < size;
}

static bool isValidSha256(const char* text) {
  if (text == nullptr || strlen(text) != 64) {
    return false;
  }
  for (int i = 0; i < 64; i++) {
    if (!(digit(text[i]) || (text[i] >= 'a' && text[i] <= 'f'))) {
      return false;  // contract 1.6: LOWERCASE, the same as the output of sha256sum
    }
  }
  return true;
}

// Compares two texts without telling capitals and lowercase apart.
static bool equalIgnoringCase(const char* a, const char* b) {
  while (*a != '\0' && *b != '\0') {
    if (lowercase(*a) != lowercase(*b)) {
      return false;
    }
    a++;
    b++;
  }
  return *a == *b;
}

const char* checkUpdate(const UpdateFields& content, const UpdateState& state, char* reason, size_t size) {
  if (state.trialPeriod) {
    return "still in the 60-second trial period";  // contract rule 13: the new firmware isn't proven yet
  }
  if (state.updateRunning) {
    return "another update is running";
  }
  if (!isValidVersion(content.version)) {
    return "version must look like x.y.z";
  }
  if (compareVersions(content.version, state.runningVersion) == 0) {
    snprintf(reason, size, "already running %s", state.runningVersion);
    return reason;
  }
  if (compareVersions(content.version, FIRST_OTA_VERSION) < 0) {  // a downgrade is still allowed, as long as it isn't below 1.7.0
    return "versions below 1.7.0 have no rollback: install by cable";
  }
  if (!isValidSha256(content.sha256)) {
    return "sha256 must be 64 lowercase hexadecimal digits";
  }
  uint32_t limit = state.shelfSpace < CONTRACT_PROGRAM_SHELF ? state.shelfSpace : CONTRACT_PROGRAM_SHELF;
  if (limit == 0) {
    return "no spare program shelf: use the Minimal SPIFFS scheme (Module 10)";
  }
  if (content.size < 1 || content.size > (long long)limit) {
    snprintf(reason, size, "size must be 1-%lu bytes", (unsigned long)limit);
    return reason;
  }

  // url: the scheme, the host, and the path. The same message as the simulator for every mistake.
  const char* url = content.url;
  if (url == nullptr || url[0] == '\0') {
    return "invalid url";
  }
  bool secure = false;
  size_t scheme = schemeLength(url, &secure);
  const char* urlFormat = "url must be http(s)://<address>/fw/node-1/<version>.bin";
  if (scheme == 0) {
    const char* colon = strchr(url, ':');
    return colon == nullptr || colon == url ? "invalid url" : urlFormat;  // "abc" vs "ftp://..."
  }
  const char* hostPort = url + scheme;
  size_t hostLength = strcspn(hostPort, "/?#");
  if (hostLength == 0) {
    return "invalid url";  // "http:///fw/...": no server name
  }
  const char* path = hostPort + hostLength;
  size_t pathLength = strcspn(path, "?#");
  char correctPath[48];
  snprintf(correctPath, sizeof(correctPath), "/fw/node-1/%s.bin", content.version);
  if (strlen(url) > (size_t)URL_MAX_LENGTH || pathLength != strlen(correctPath)
      || strncmp(path, correctPath, pathLength) != 0) {
    return urlFormat;
  }

  // the url MUST = <stored server address>/fw/node-1/<version>.bin. The download carries the device key (Basic device_id:key),
  // so Node 1 never downloads from another server, whoever sent the command (contract 1.6 section 7).
  if (state.serverAddress == nullptr || state.serverAddress[0] == '\0') {
    return "server address not set (Serial: server <address>)";
  }
  char homeUrl[SERVER_ADDRESS_MAX_LENGTH + 48];
  if (!buildFirmwareUrl(state.serverAddress, content.version, homeUrl, sizeof(homeUrl)) || !equalIgnoringCase(url, homeUrl)) {
    return "url is not this home's server";
  }
  char host[URL_MAX_LENGTH + 1];
  if (!secure && (!splitHost(hostPort, hostLength, host, sizeof(host)) || !isHomeIpAddress(host))) {
    return "http only for the home network";  // the key must not travel in plain text to the internet
  }
  return nullptr;
}
