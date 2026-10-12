// Module 6 - Practice 3: calibrating the capacitive soil moisture sensor
// Sensor on VN (GPIO 39). The wetter it is, the SMALLER the raw number.
// How to calibrate: (1) note the raw number with the sensor in air -> DRY;
// (2) note the raw number with the sensor dipped in water up to the limit line -> WET;
// (3) write both numbers below, then upload again. Result: air 0%, water 100%.

const int PIN_SOIL = 39;    // VN: soil sensor (canonical pin map)
const int DRY = 3000;       // raw number in air (replace it with your own note)
const int WET = 1300;       // raw number in water (replace it with your own note)
const int READ_COUNT = 20;  // how many readings are averaged

// Reads the sensor 20 times in a row, then returns the average.
int readSoilRaw() {
  long sum = 0;
  for (int i = 0; i < READ_COUNT; i++) {
    sum += analogRead(PIN_SOIL);
    delay(5);
  }
  return sum / READ_COUNT;
}

void setup() {
  Serial.begin(115200);
  Serial.println("Soil sensor calibration: note the raw number in air and in water.");
}

void loop() {
  int raw = readSoilRaw();
  int percent = map(raw, DRY, WET, 0, 100);  // DRY -> 0, WET -> 100
  int soil = constrain(percent, 0, 100);     // fence it in so it stays 0-100

  Serial.print("raw=");
  Serial.print(raw);
  Serial.print("  map result=");
  Serial.print(percent);
  Serial.print("  soil=");
  Serial.print(soil);
  Serial.println(" %");
  delay(1000);
}
