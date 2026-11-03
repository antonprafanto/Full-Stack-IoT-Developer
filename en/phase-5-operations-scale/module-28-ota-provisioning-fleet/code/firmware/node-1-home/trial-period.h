// trial-period.h - the 60-second trial period of firmware just installed over the air, and the automatic rollback (Module 28).
// New firmware is VALID if within 60 seconds of starting it connects to the broker (its key is accepted), publishes "online",
// and subscribes to cmd. If not, Node 1 goes back to the previous firmware by itself (data contract 1.6, rule 13).
#pragma once

void startTrialPeriod();  // called by setupOta() in setup(): was the running shelf just installed? the trial period starts
bool inTrialPeriod();     // true while this firmware isn't proven yet (the Wi-Fi portal and update commands are postponed)
void firmwareProven();    // called by networking.cpp after it connected to the broker, published "online", and subscribed to cmd
void updateTrialPeriod(); // called by updateOta() in every pass of loop(): 60 seconds passed = rollback
void printShelfInfo();    // part of the answer to the Serial command "ota": the running shelf, the other shelf, the trial period
