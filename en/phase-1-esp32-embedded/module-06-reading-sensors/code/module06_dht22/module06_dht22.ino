// Module 6 - Practice 4: temperature and humidity with the DHT22
// The DATA pin of the DHT22 module goes to D14. The DHT22 module gets 3.3 V, NOT 5 V.
// Library: DHT sensor library by Adafruit 1.4.7 (installed with it: Adafruit Unified Sensor 1.1.15).

#include <DHT.h>

const int PIN_DHT = 14;  // D14: DHT22 (canonical pin map)

DHT dht(PIN_DHT, DHT22);  // the sensor "object": where its DATA pin is connected and which type it is

void setup() {
  Serial.begin(115200);
  dht.begin();
  Serial.println("DHT22 ready. The first reading appears in 2 seconds.");
}

void loop() {
  delay(2000);  // the DHT22 can be read at most once every 2 seconds

  float temperature = dht.readTemperature();  // degrees Celsius
  float humidity = dht.readHumidity();        // percent

  if (isnan(temperature) || isnan(humidity)) {  // NAN = "not a number": the reading failed
    Serial.println("Failed to read the DHT22! Check the DATA, VCC, and GND wires.");
    return;  // skip the rest of loop(); the next pass tries again
  }

  Serial.print("temperature=");
  Serial.print(temperature, 1);  // 1 digit after the decimal point
  Serial.print(" C  humidity=");
  Serial.print(humidity, 0);
  Serial.println(" %");
}
