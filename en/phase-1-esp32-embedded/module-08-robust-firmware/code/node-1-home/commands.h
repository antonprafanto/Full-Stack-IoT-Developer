// commands.h - commands from the Serial Monitor (Module 5), now read without waiting (Module 8)
// Module 11 replaces them with commands over MQTT.
#pragma once

void checkSerialCommand();  // call on every pass of loop(); never waits
