// version.cpp - the code of the version module. Its functions are listed in version.h.
#include "version.h"

// Splits "1.7.12" into three numbers {1, 7, 12}. Answers false if its form isn't x.y.z.
static bool parseVersion(const char* text, long parts[3]) {
  if (text == nullptr) {
    return false;
  }
  int position = 0;
  for (int i = 0; i < 3; i++) {
    long number = 0;
    int digitCount = 0;
    while (text[position] >= '0' && text[position] <= '9') {
      number = number * 10 + (text[position] - '0');
      digitCount++;
      position++;
      if (digitCount > 5) {
        return false;  // more than 5 digits in one part: surely not one of our release versions
      }
    }
    if (digitCount == 0) {
      return false;  // an empty part, for example "1..0" or "v1.7.0"
    }
    parts[i] = number;
    char separator = (i < 2) ? '.' : '\0';  // the first two parts end with a dot, the third with the end of the text
    if (text[position] != separator) {
      return false;  // for example "1.7", "1.7.0-test", or "1.7.0.1"
    }
    position++;
  }
  return true;
}

bool isValidVersion(const char* text) {
  long parts[3];
  return parseVersion(text, parts);
}

int compareVersions(const char* a, const char* b) {
  long x[3];
  long y[3];
  if (!parseVersion(a, x) || !parseVersion(b, y)) {
    return 0;  // the wrong form: counts as equal (see version.h)
  }
  for (int i = 0; i < 3; i++) {  // from the left: MAJOR, MINOR, PATCH
    if (x[i] != y[i]) {
      return x[i] < y[i] ? -1 : 1;
    }
  }
  return 0;
}
