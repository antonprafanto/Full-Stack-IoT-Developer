// system.h - Node 1's health: uptime, restart reason, and loop() pass time (Module 8)
#pragma once

unsigned long uptimeSeconds();                    // seconds since power-up; doesn't overflow like millis()
const char* resetReasonName();                    // the last restart reason, with the same names as Appendix A
void recordLoopTime(unsigned long microseconds);  // call at the end of every pass of loop()
unsigned long longestLoopMs();                    // the longest loop() pass since power-up, in milliseconds
