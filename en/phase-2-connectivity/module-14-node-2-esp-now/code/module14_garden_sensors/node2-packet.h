// node2-packet.h - the "form" of the ESP-NOW packet from Node 2 "Garden" to Node 1 "Home" (Module 14).
// This file is EXACTLY THE SAME in the node-1-home and node-2-garden folders. If you change its layout, change BOTH
// and raise PACKET_VERSION, so that Node 1 rejects old packets with a clear message.
// Both ends are ESP32s (little-endian, same compiler), so the struct may be sent as it is.
#pragma once
#include <stdint.h>

const uint8_t PACKET_MARK = 0x52;  // the letter 'R' (Rumah, Indonesian for home): someone else's ESP-NOW packets are rejected at once
const uint8_t PACKET_VERSION = 1;  // raise it every time the form's layout changes

// __attribute__((packed)) = no gaps between fields: the size is exactly the same at the sender and the receiver.
struct __attribute__((packed)) Node2Packet {
  uint8_t mark;              // always PACKET_MARK
  uint8_t version;           // always PACKET_VERSION
  uint8_t fw[3];             // Node 2's firmware version: major, minor, patch, for example {1, 0, 0}
  uint16_t session;          // a new random number every time Node 2 powers up from OFF (not from sleep)
  uint32_t sequence;         // the packet number: goes up by 1 every time Node 2 wakes up
  uint16_t intervalSeconds;  // Node 2's wake schedule (for example 300); Node 1 uses it for the "offline" limit
  uint8_t attempt;           // which send of this wake it is (1 = it worked straight away)
  float temperature;         // degrees Celsius from the BME280; NAN = could not be read
  float humidity;            // percent from the BME280; NAN = could not be read
  float pressure;            // hPa from the BME280; NAN = could not be read
  float soilTemperature;     // degrees Celsius from the DS18B20; NAN = could not be read
  int8_t soil;               // percent 0-100 from the second soil sensor; -1 = could not be read
  uint16_t batteryMv;        // battery voltage in millivolts; 0 = not measured
};
static_assert(sizeof(Node2Packet) == 33, "Node2Packet size changed: make both files the same and raise PACKET_VERSION");
