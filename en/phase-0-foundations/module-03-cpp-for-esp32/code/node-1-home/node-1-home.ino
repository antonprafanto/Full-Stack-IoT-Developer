// Node 1 "Home" - program skeleton v0.1.0 (created in Module 3)
// The running project: Mini Smart Home.
//
// Each function below is a "shelf" that already has a label, but most of the
// shelves are still empty. They are filled in step by step starting in Module 5.
// Even so, this code already runs: it prints a sample reading
// to the Serial Monitor every 2 seconds and blinks the status LED on D4.

const String FIRMWARE_VERSION = "0.1.0";
const int PIN_STATUS_LED = 4;              // status LED, connected since Module 2
const unsigned long READ_INTERVAL = 2000;  // read the sensors every 2 seconds

// The sensor data form. Its field names follow the data contract (Syllabus Appendix A).
struct SensorReading {
  float temperature;  // degrees Celsius
  int humidity;       // percent
  int light;          // 0-4095
  bool motion;        // motion detected?
};

// ---------- Module 5: set up all the pins ----------
void setupPins() {
  pinMode(PIN_STATUS_LED, OUTPUT);
  // later, here: lamp relay, fan relay, pump, curtain servo, manual button
}

// ---------- Modules 6-7: read the real sensors ----------
SensorReading readSensors() {
  SensorReading b;
  b.temperature = 28.5;  // sample numbers for now; Modules 6-7 replace them
  b.humidity = 71;       // with real sensor readings
  b.light = 412;
  b.motion = false;
  return b;
}

// ---------- Module 7: show the reading on the OLED display ----------
void showOnDisplay(SensorReading b) {
  // not filled in yet
}

// ---------- Modules 5 & 19: control the fan, lamp, pump ----------
void controlActuators(SensorReading b) {
  // not filled in yet
}

// ---------- Modules 10-11: send the reading to the server ----------
void sendData(SensorReading b) {
  // not filled in yet
}

// ---------- Module 8: status blink as a "heartbeat" ----------
void blinkStatus() {
  digitalWrite(PIN_STATUS_LED, HIGH);
  delay(50);
  digitalWrite(PIN_STATUS_LED, LOW);
}

// Prints the reading to the Serial Monitor (our own helper).
void printReading(SensorReading b) {
  Serial.print("temperature=");
  Serial.print(b.temperature, 1);
  Serial.print(" humidity=");
  Serial.print(b.humidity);
  Serial.print(" light=");
  Serial.print(b.light);
  Serial.print(" motion=");
  if (b.motion) {
    Serial.println("yes");
  } else {
    Serial.println("no");
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.println("Node 1 Home - firmware " + FIRMWARE_VERSION);
  setupPins();
}

void loop() {
  SensorReading reading = readSensors();
  printReading(reading);
  showOnDisplay(reading);
  controlActuators(reading);
  sendData(reading);
  blinkStatus();
  delay(READ_INTERVAL);
}
