// button.h - a button with debounce, short press, and long press, without waiting (Module 8)
#pragma once

// The three possible answers of checkButton()
enum ButtonEvent { NONE, SHORT_PRESS, LONG_PRESS };

void beginButton(int pin);  // call once in setup()
ButtonEvent checkButton();  // call on every pass of loop()
