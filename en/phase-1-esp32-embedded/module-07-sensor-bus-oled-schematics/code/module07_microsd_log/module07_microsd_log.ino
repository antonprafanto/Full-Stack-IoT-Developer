// Module 7 - Practice 5 (optional): logging readings to a microSD card as a CSV file
// microSD module on the SPI bus: SCK to D18, MISO to D19, MOSI to D23, CS to D5.
// The light sensor (LDR) stays on VP, as in Module 6.
// No libraries to install: SD and SPI already come with the esp32 package.

#include <SPI.h>
#include <SD.h>

const int PIN_SD_CS = 5;    // D5: "pick me" for the microSD card (canonical pin map)
const int PIN_LDR = 36;     // VP: LDR (canonical pin map)
const char* FILE_NAME = "/log.csv";  // file name on the card, always starts with a slash
const int SECONDS_PER_LOG = 5;       // one line every 5 seconds

bool cardReady = false;

// Prints the whole file to the Serial Monitor.
void printFileContents() {
  File file = SD.open(FILE_NAME, FILE_READ);
  if (!file) {
    Serial.println("(the file doesn't exist yet)");
    return;
  }
  while (file.available()) {
    Serial.write(file.read());  // copy it character by character, exactly as it is
  }
  file.close();
}

// Adds one line at the end of the file. Returns true if it worked.
bool appendLine(String line) {
  File file = SD.open(FILE_NAME, FILE_APPEND);  // APPEND = add to the end, the old content stays
  if (!file) {
    return false;
  }
  file.println(line);
  file.close();  // REQUIRED: only after closing is the content really saved on the card
  return true;
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  if (!SD.begin(PIN_SD_CS)) {
    Serial.println("microSD card not detected! Check the card (FAT32), all six wires, and the module's power.");
    return;  // cardReady stays false, so loop() won't try to write
  }
  cardReady = true;
  Serial.print("Card detected, size ");
  Serial.print(SD.cardSize() / (1024 * 1024));
  Serial.println(" MB.");

  if (!SD.exists(FILE_NAME)) {
    appendLine("uptime_s,light");  // first CSV line = the column names
    Serial.println("New file created: log.csv");
  }
  Serial.println("---- current contents of log.csv ----");
  printFileContents();
  Serial.println("---- end of file ----");
}

void loop() {
  if (!cardReady) {  // card not detected yet: remind every 5 seconds, in case the message in setup() was missed
    Serial.println("Card not detected yet. Just turned on the MB102? Press EN. Still failing? Turn off the MB102, unplug the USB, then check the card and the wires.");
    delay(5000);
    return;
  }
  delay(SECONDS_PER_LOG * 1000);
  unsigned long seconds = millis() / 1000;        // seconds since the board was turned on
  int light = 4095 - analogRead(PIN_LDR);         // inverted as in Module 6: the brighter it is, the bigger the number
  String line = String(seconds) + "," + String(light);
  if (appendLine(line)) {
    Serial.print("written: ");
    Serial.println(line);
  } else {
    Serial.println("Write failed! Was the card removed?");
  }
}
