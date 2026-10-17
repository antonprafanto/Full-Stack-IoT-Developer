// heartbeat.h - the status LED as Node 1's "heartbeat" (Module 8)
// Slow blink = the program runs normally; fast blink = there is a problem.
#pragma once

void beginHeartbeat(int pin);           // call once in setup()
void setHeartbeatRhythm(bool problem);  // true = fast blink, false = slow blink
void updateHeartbeat();                 // call on every pass of loop()
