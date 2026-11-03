// claim.h - registering with a CLAIM CODE from the admin (Module 28, DATA-CONTRACT.md 1.6 section 10).
// The code is typed in the Wi-Fi portal (the "Claim code" field) or in the Serial Monitor ("claim <code>"). As soon as Wi-Fi is
// connected, Node 1 sends once:
//   POST <server address>/api/provision/claim {"code":"7K2M-QF9D","device_id":"<device_id>"}
// The 201 answer carries the device key; that key is saved in NVS like "key <value>" (Module 21), then Node 1 connects
// to the broker right away. The code itself is NOT saved in NVS: only in RAM until it is used.
#pragma once

const char* startClaim(const char* code);  // nullptr = the code is accepted and will be sent; otherwise the reason
void updateClaim();                        // call it in every pass of loop(): sends the code as soon as Wi-Fi is ready
void printClaimInfo();                     // part of the answer to the Serial command "claim"
