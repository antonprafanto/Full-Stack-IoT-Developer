// Module 9 - Practice 3 (part B): light sleep, the sleep that forgets nothing
// Circuit: a button on D13 (its opposite leg to GND), same as Practice 3.
// The board sleeps lightly for 3 seconds, then CONTINUES from the next line. The button can wake it up too.

const gpio_num_t PIN_WAKE_BUTTON = GPIO_NUM_13;
const unsigned long SLEEP_SECONDS = 3;

int ramCount = 0;  // an ordinary variable in RAM: this time it is NOT lost

void setup() {
  Serial.begin(115200);
  pinMode(PIN_WAKE_BUTTON, INPUT_PULLUP);
  Serial.println("Practice 3B - light sleep: the RAM contents and the millis() clock are kept.");

  esp_sleep_enable_timer_wakeup(SLEEP_SECONDS * 1000000ULL);  // wake door 1: the timer alarm
  gpio_wakeup_enable(PIN_WAKE_BUTTON, GPIO_INTR_LOW_LEVEL);   // wake door 2: D13 goes LOW
  esp_sleep_enable_gpio_wakeup();
}

void loop() {
  ramCount++;
  Serial.printf("Pass %d, millis() = %lu ms. Light sleep...\n", ramCount, millis());
  Serial.flush();           // send every letter first; during light sleep, Serial stops too
  esp_light_sleep_start();  // light sleep; as soon as it wakes up, the program CONTINUES with the line below

  if (esp_sleep_get_wakeup_cause() == ESP_SLEEP_WAKEUP_GPIO) {
    Serial.println("Woken by the button.");
    while (digitalRead(PIN_WAKE_BUTTON) == LOW) {  // wait until the button is released, so it doesn't wake up again at once
      delay(10);
    }
    delay(50);  // wait for the button bounce to settle
  }
}
