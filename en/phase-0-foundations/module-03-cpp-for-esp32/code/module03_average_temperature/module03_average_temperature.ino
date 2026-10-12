// Module 3 - Practice 5: sample temperature array -> average, highest, lowest
// No circuit needed: the results only appear in the Serial Monitor.

const int DAY_COUNT = 7;

// Daytime temperatures over 7 days (sample data, not from a sensor)
float temperature[DAY_COUNT] = {28.5, 29.1, 30.4, 31.2, 29.8, 27.6, 28.9};
String day[DAY_COUNT] = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};

// A function with a return value: adds up the whole array, then divides by the number of values.
float computeAverage(float data[], int count) {
  float total = 0;
  for (int i = 0; i < count; i++) {
    total = total + data[i];
  }
  return total / count;
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.println("This week's temperatures:");

  // Print the array's contents one by one. Remember: drawer numbers start at 0.
  for (int i = 0; i < DAY_COUNT; i++) {
    Serial.print("  ");
    Serial.print(day[i]);
    Serial.print(": ");
    Serial.print(temperature[i], 1);  // 1 digit after the decimal point
    Serial.println(" C");
  }

  // Find the drawers with the highest and the lowest temperature.
  int highestDrawer = 0;
  int lowestDrawer = 0;
  for (int i = 1; i < DAY_COUNT; i++) {
    if (temperature[i] > temperature[highestDrawer]) {
      highestDrawer = i;
    }
    if (temperature[i] < temperature[lowestDrawer]) {
      lowestDrawer = i;
    }
  }

  Serial.print("Average : ");
  Serial.print(computeAverage(temperature, DAY_COUNT), 2);
  Serial.println(" C");
  Serial.print("Highest : ");
  Serial.print(temperature[highestDrawer], 1);
  Serial.println(" C (" + day[highestDrawer] + ")");
  Serial.print("Lowest  : ");
  Serial.print(temperature[lowestDrawer], 1);
  Serial.println(" C (" + day[lowestDrawer] + ")");
}

void loop() {
}
