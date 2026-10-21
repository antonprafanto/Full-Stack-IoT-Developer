// keys.example.h - an EXAMPLE of what goes in keys.h (Module 14, Practice 8). This file may go to GitHub; no code uses it.
// How to use it: make a new tab named keys.h in the node-1-home AND node-2-garden folders, copy this file's content there,
// then change USE_ENCRYPTION to true and both keys to your own: exactly 16 letters/digits, the same in both folders.
// keys.h is guarded by .gitignore, so your keys never go to GitHub.
#pragma once
const bool USE_ENCRYPTION = false;
const char KEY_PMK[] = "Example16CharPMK";  // exactly 16 letters/digits
const char KEY_LMK[] = "Example16CharLMK";  // exactly 16 letters/digits
