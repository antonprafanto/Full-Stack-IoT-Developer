// Module 8 - Practice 5: a threshold that doesn't forget (NVS with the Preferences library)
// The ESP32 board is enough. The Node 1 circuit may stay connected: this sketch doesn't touch any pin.
// The Preferences library already comes with the esp32 package, so there's nothing to install.
//
// Commands in the Serial Monitor (choose New Line):
//   threshold          -> show the current threshold
//   threshold 35       -> save a new threshold (0-100) to NVS
//   threshold default  -> delete it from NVS, back to the default value
//   restart            -> restart the board (how Wokwi imitates "unplugged, then plugged back in")

#include <Preferences.h>

const int DEFAULT_THRESHOLD = 30;  // used as long as NVS holds no threshold yet

Preferences archive;  // this sketch's NVS "filing cabinet"
int soilWateringThreshold = DEFAULT_THRESHOLD;
unsigned long bootCount = 0;

// ---------- A Serial line reader that never waits ----------
const int MAX_LINE_LENGTH = 40;
char line[MAX_LINE_LENGTH + 1];  // +1 for the end-of-text mark
int lineLength = 0;

// Collects letters from the Serial Monitor WITHOUT waiting.
// Returns true once, when a line is complete (ended with Enter); its text is in "line".
bool lineReady() {
  while (Serial.available() > 0) {
    char letter = Serial.read();
    if (letter == '\n') {
      line[lineLength] = '\0';  // end-of-text mark
      lineLength = 0;           // ready to collect the next line
      return true;
    }
    if (letter != '\r' && lineLength < MAX_LINE_LENGTH) {
      line[lineLength] = letter;
      lineLength++;
    }
  }
  return false;
}

void showThreshold() {
  Serial.print("soil_watering threshold: ");
  Serial.print(soilWateringThreshold);
  if (archive.isKey("soil_watering")) {
    Serial.println(" % (from NVS)");
  } else {
    Serial.println(" % (default value, never saved)");
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.println("Practice 5 - threshold in NVS");

  archive.begin("node1", false);  // open the folder "node1"; false = may read AND write

  bootCount = archive.getULong("boot_count", 0) + 1;  // 0 if this label has never been written
  archive.putULong("boot_count", bootCount);
  Serial.print("Boot #");
  Serial.println(bootCount);

  soilWateringThreshold = archive.getInt("soil_watering", DEFAULT_THRESHOLD);  // the default value if there isn't one yet
  showThreshold();
  Serial.println("Commands: threshold, threshold 35, threshold default, restart");
}

void loop() {
  if (!lineReady()) {
    return;  // no complete line yet: return at once, don't wait
  }
  String command = line;  // commands only arrive now and then, so String is safe to use here
  command.trim();
  command.toLowerCase();

  if (command == "threshold") {
    showThreshold();
  } else if (command == "threshold default") {
    archive.remove("soil_watering");  // delete this label from the folder
    soilWateringThreshold = DEFAULT_THRESHOLD;
    Serial.println("Threshold deleted from NVS.");
    showThreshold();
  } else if (command.startsWith("threshold ")) {
    String number = command.substring(10);  // the text after "threshold "
    int percent = number.toInt();
    if ((percent == 0 && number != "0") || percent < 0 || percent > 100) {
      Serial.println("Need a number 0-100. Example: threshold 35");
      return;
    }
    if (percent == soilWateringThreshold && archive.isKey("soil_watering")) {
      Serial.println("Same number as the saved one: NVS doesn't need to be written again.");
      return;
    }
    archive.putInt("soil_watering", percent);  // write to flash: it stays even when the power goes out
    soilWateringThreshold = percent;
    Serial.print("Saved to NVS: ");
    Serial.print(percent);
    Serial.println(" %");
  } else if (command == "restart") {
    Serial.println("Restarting now...");
    Serial.flush();  // wait until the message above has really been sent
    ESP.restart();
  } else {
    Serial.println("Unknown command. Try: threshold, threshold 35, threshold default, restart");
  }
}
