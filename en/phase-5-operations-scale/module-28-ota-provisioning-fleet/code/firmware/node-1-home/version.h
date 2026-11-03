// version.h - comparing SemVer x.y.z firmware version numbers (Module 28), without an extra library.
// Why not just compare them as text? Because "1.10.0" < "1.9.0" when read character by character ("1" < "9"),
// while 1.10.0 is newer. Each part must be compared as a NUMBER, from the left: MAJOR, then MINOR, then PATCH.
// The same function (with the same name) is in the backend: services/version.ts.
// This file deliberately uses nothing from Arduino so that it can be tested on a laptop (host tests).
#pragma once

const int VERSION_MAX_LENGTH = 17;  // "99999.99999.99999": three parts, each at most 5 digits

bool isValidVersion(const char* text);  // true if it looks like x.y.z: three numeric parts (1-5 digits), separated by dots

// The result is negative if a is older than b, 0 if they are equal, positive if a is newer (like a sort() comparator).
// Check both with isValidVersion() first: a version with the wrong form counts as EQUAL (result 0), so an update
// command with a strange version is always refused, never quietly installed.
int compareVersions(const char* a, const char* b);
