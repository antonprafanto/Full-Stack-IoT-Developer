// Module 28 - Quick Win: two program shelves on your board (practice only).
// Tools: ESP32 Dev Module, Partition Scheme Minimal SPIFFS, Flash Mode DIO.
#include <WiFi.h>
#include <ArduinoOTA.h>   // comes with the esp32 package: receives a program over Wi-Fi
#include <esp_ota_ops.h>  // comes with the esp32 package: the program shelves and the shelf note
#include "secrets.h"      // WIFI_NAME and WIFI_PASSWORD, the same as Module 10

const int VERSION = 1;  // step 2: change this number, then Upload through the network port

// The state of a shelf in the shelf note (otadata)
const char* stateName(esp_ota_img_states_t k) {
  switch (k) {
    case ESP_OTA_IMG_NEW: return "NEW, never started yet";
    case ESP_OTA_IMG_PENDING_VERIFY: return "PENDING_VERIFY, trial period";
    case ESP_OTA_IMG_VALID: return "VALID, approved";
    case ESP_OTA_IMG_INVALID: return "INVALID, refused";
    case ESP_OTA_IMG_ABORTED: return "ABORTED, cancelled";
    case ESP_OTA_IMG_UNDEFINED: return "UNDEFINED, installed by cable";
    default: return "unknown";
  }
}

// The name of the restart reason, the same as Module 5
const char* reasonName(esp_reset_reason_t a) {
  switch (a) {
    case ESP_RST_POWERON: return "POWERON";
    case ESP_RST_SW: return "SW";
    case ESP_RST_BROWNOUT: return "BROWNOUT";
    case ESP_RST_PANIC: return "PANIC";
    case ESP_RST_INT_WDT: case ESP_RST_TASK_WDT: case ESP_RST_WDT: return "WDT";
    case ESP_RST_DEEPSLEEP: return "DEEPSLEEP";
    default: return "UNKNOWN";
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  const esp_partition_t* running = esp_ota_get_running_partition();       // the shelf that is running
  const esp_partition_t* other = esp_ota_get_next_update_partition(NULL);  // the next shelf
  esp_ota_img_states_t state = ESP_OTA_IMG_UNDEFINED;
  esp_ota_get_state_partition(running, &state);
  Serial.printf("\nVersion %d, last restart: %s\n", VERSION, reasonName(esp_reset_reason()));
  Serial.printf("Running shelf: %s (%s)\n", running->label, stateName(state));
  if (other == NULL || other == running) {
    Serial.println("No other shelf: choose Partition Scheme Minimal SPIFFS.");
    return;
  }
  Serial.printf("Other shelf: %s, %u bytes\n", other->label, (unsigned)other->size);
  Serial.printf("Room for a new program: %u bytes\n", (unsigned)ESP.getFreeSketchSpace());

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_NAME, WIFI_PASSWORD);
  if (WiFi.waitForConnectResult(20000) != WL_CONNECTED) {  // at most 20 seconds
    Serial.println("Wi-Fi not connected yet. Check the secrets.h tab.");
    return;
  }
  ArduinoOTA.setHostname("program-shelf");         // the board's name in Tools > Port
  ArduinoOTA.setPassword("change-this-password");  // MUST BE CHANGED to your own password before Upload
  ArduinoOTA.onStart([]() { Serial.println("New program arriving, written to the other shelf..."); });
  ArduinoOTA.begin();
  Serial.print("Ready to receive a program over Wi-Fi at ");
  Serial.println(WiFi.localIP());
}

void loop() {
  ArduinoOTA.handle();  // a program sent from the IDE?
}
