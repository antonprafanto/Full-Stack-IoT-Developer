// actuators.h - Node 1's lamp, fan, pump, curtain, and buzzer (Module 5), now without waiting (Module 8)
#pragma once

void setupActuators();                         // call once in setup(), before everything else
void updateActuators();                        // call on every pass of loop(): the pump and buzzer turn off right on time
void setLamp(bool isOn);                       // manual command (button or Serial Monitor)
void setLampByAutomation(bool isOn);           // only for the automatic lamp rule
void setFan(bool isOn);                        // manual command (Serial Monitor) or from the server
void setFanBySafety(bool isOn);                // Module 19: only for the local safety rule
bool turnOnPump(int seconds, int waterLevel);  // returns false if refused because the tank is too low
void setCurtain(int angle);
void soundBuzzer();                            // beeps for 150 ms, but the program doesn't wait for it

bool lampOn();
bool lampByAutomation();  // true if the lamp that is on was turned on by the automation rule
bool fanOn();
bool fanBySafety();  // Module 19: true if the fan that is on was turned on by the local safety rule
bool pumpOn();
int curtainAngle();
const char* onOffText(bool isOn);  // "on" or "off"
