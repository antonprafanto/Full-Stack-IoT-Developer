// Module 10 - Practice 5: the time from the internet (NTP)
// The ESP32 asks an NTP server for the time, then every 5 seconds prints the local time
// and the "ts" timestamp of the data contract (Syllabus Appendix A).

#include <WiFi.h>
#include <time.h>     // comes with the esp32 package: time(), localtime_r(), gmtime_r(), strftime()
#include "secrets.h"  // contains WIFI_NAME and WIFI_PASSWORD

// The time zone is written with the POSIX rule: the zone name, then its offset from UTC with the sign REVERSED.
// WIB = UTC+7 is written "WIB-7". In central Indonesia: "WITA-8". In eastern Indonesia: "WIT-9".
const char TIME_ZONE[] = "WIB-7";
const char NTP_SERVER_1[] = "pool.ntp.org";       // a pool of volunteer NTP servers; picks a nearby one automatically
const char NTP_SERVER_2[] = "asia.pool.ntp.org";  // backup: a pool of servers in Asia
const unsigned long PRINT_INTERVAL = 5000;        // print the time every 5 seconds

const char* DAY_NAMES[] = { "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" };
const char* MONTH_NAMES[] = { "January", "February", "March", "April", "May", "June", "July",
                              "August", "September", "October", "November", "December" };

bool clockSet = false;
unsigned long lastPrintTime = 0;

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.printf("Connecting to \"%s\"", WIFI_NAME);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_NAME, WIFI_PASSWORD);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
    Serial.print(".");
    delay(250);
  }
  Serial.println();
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Not connected after 20 seconds. Check the secrets.h tab, then press EN.");
    return;
  }
  Serial.printf("Connected, IP %s\n", WiFi.localIP().toString().c_str());

  // This one line: set the time zone, then have the esp32 package ask the NTP server for the time.
  // It asks in the background (no waiting), then asks again by itself every 3 hours.
  configTzTime(TIME_ZONE, NTP_SERVER_1, NTP_SERVER_2);
  Serial.println("Asking the NTP server for the time...");
}

void loop() {
  if (millis() - lastPrintTime < PRINT_INTERVAL) {
    return;
  }
  lastPrintTime = millis();

  time_t now = time(nullptr);  // the number of seconds since January 1, 1970 at 00:00 UTC
  struct tm local;             // a date-and-time "form": year, month, day, hour, minute, second
  localtime_r(&now, &local);   // fill in the form with the local time (using TIME_ZONE)

  if (local.tm_year + 1900 < 2025) {  // tm_year is counted from the year 1900
    Serial.printf("Clock not set yet: the ESP32 still thinks it is the year %d.\n", local.tm_year + 1900);
    return;
  }
  if (!clockSet) {
    clockSet = true;
    Serial.printf("Clock set from the internet! time() = %lld seconds since January 1, 1970 UTC.\n", (long long)now);
  }

  // The ts timestamp (Appendix A): always UTC, ISO-8601 format, ending with the letter Z.
  struct tm utc;
  gmtime_r(&now, &utc);
  char ts[21];  // "2026-10-17T01:23:45Z" = 20 letters + the end-of-text mark
  strftime(ts, sizeof(ts), "%Y-%m-%dT%H:%M:%SZ", &utc);

  char clockText[16];  // "08:23:45 WIB"; %Z = the time zone name
  strftime(clockText, sizeof(clockText), "%H:%M:%S %Z", &local);
  Serial.printf("%s, %d %s %d at %s | ts: %s\n", DAY_NAMES[local.tm_wday], local.tm_mday,
                MONTH_NAMES[local.tm_mon], local.tm_year + 1900, clockText, ts);
}
