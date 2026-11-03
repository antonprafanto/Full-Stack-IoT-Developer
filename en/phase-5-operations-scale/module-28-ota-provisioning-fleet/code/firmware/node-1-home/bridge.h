// bridge.h - Node 1 as the bridge for Node 2 "Garden" (Module 14).
// Node 2 is not connected to the router. It sends one ESP-NOW packet every time it wakes up; Node 1 receives it,
// gives it a timestamp, holds it while the broker is out of reach, then publishes it on behalf of Node 2:
// msh/<device_id Node 2>/telemetry and msh/<device_id Node 2>/status (data contract version 1.1).
#pragma once

void setupBridge();          // call once in setup(), AFTER setupNetwork()
void updateBridge();         // call on every pass of loop(); never waits
void printNode2Info();       // the reply to the Serial command "node2"
void resetNode2Counters();   // Serial command "node2 reset"
