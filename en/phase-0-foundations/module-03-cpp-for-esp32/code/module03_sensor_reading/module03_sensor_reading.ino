// Module 3 - Practice 6: struct SensorReading
// One "form" holding several sensor values at once. The values are still fake (random);
// real sensors are connected starting in Module 6. The field names deliberately match the
// project's data contract (Syllabus Appendix A): temperature, humidity, light, motion.

struct SensorReading {
  float temperature;  // degrees Celsius
  int humidity;       // percent
  int light;          // 0-4095 (later from a light sensor)
  bool motion;        // true = motion detected (later from a PIR motion sensor)
};

// A function that returns one complete form filled with random numbers.
SensorReading readFakeSensor() {
  SensorReading b;
  b.temperature = random(250, 330) / 10.0;  // 25.0 to 32.9
  b.humidity = random(55, 85);              // 55 to 84
  b.light = random(0, 4096);                // 0 to 4095
  b.motion = (random(0, 2) == 1);           // true or false
  return b;
}

// A function that takes one form and prints it neatly.
void printReading(SensorReading b) {
  Serial.print("temperature=");
  Serial.print(b.temperature, 1);
  Serial.print(" C  humidity=");
  Serial.print(b.humidity);
  Serial.print(" %  light=");
  Serial.print(b.light);
  Serial.print("  motion=");
  if (b.motion) {
    Serial.println("yes");
  } else {
    Serial.println("no");
  }
}

int readingNumber = 0;

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.println("Sensor readings (fake) every 2 seconds:");
}

void loop() {
  SensorReading reading = readFakeSensor();  // fill in a new form
  readingNumber = readingNumber + 1;
  Serial.print("#");
  Serial.print(readingNumber);
  Serial.print("  ");
  printReading(reading);
  delay(2000);
}
