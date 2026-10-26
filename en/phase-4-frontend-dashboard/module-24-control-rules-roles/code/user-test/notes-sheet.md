# User test notes sheet — Mini Smart Home dashboard v1.0 (Module 24)

Fill in one sheet for every tester. Write the tester **without their full name** (for example "Tester 1, older sister, in her 30s"). Keep
the filled-in sheets in `learn-iot/module-24/` (➕ F), without passwords, without full names, without photos of faces.

## Test data

| Field | Notes |
| :--- | :--- |
| Date and time (WIB) | |
| Tester | |
| Tester's phone (brand/model, browser) | |
| Data path (Kit A + B / simulator `f00d00000001`) | |
| Address opened (`http://<laptop-IP>:5173`) | |
| Permission to record screen/voice (yes/no) | |

## Results per task

Result: **success** (without help) / **helped** (stuck > 2 minutes or helped) / **failed**. Only "success" counts as a pass.

| Task | Result | Time (mm:ss) | Where stuck / unsure | Tester's quote (no name) | Backend log evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 Log in | | | | | `login: account … (admin), session …, IP …` |
| 2 Turn on the lamp | | | | | `command … (api) to …: lamp = true, ack ok=true …` |
| 3 Watering rule < 30 % | | | | | `Rule … created through the API: …` |
| 4 Log out | | | | | `logout: session …` |

**Evidence that the watering rule works** (after task 3): the event/toast `🌱 Soil … % — pump watering for 5 seconds automatically` (time: ______),
and the pump card/state `Watering`, then `Idle`.

**L4 (learner, the viewer account on the same phone):** control buttons on the details screen: there / not there · **+ New rule** and **Edit** on
the Rules screen: there / not there.

## What was fixed after the test

| What was confusing | Fix (file, change) | Tested again? Result |
| :--- | :--- | :--- |
| | | |

## Format example — made-up entries

> The rows below are **made up**, only to show how to fill the sheet in. They aren't real test results.

| Task | Result | Time (mm:ss) | Where stuck / unsure | Tester's quote (no name) | Backend log evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 3 Watering rule < 30 % | helped | 2:40 | looking for "water" on the Devices screen, didn't find the **Rules** menu | "Where are the rules, under the lamp?" | — (no rule created yet) |

| What was confusing | Fix (file, change) | Tested again? Result |
| :--- | :--- | :--- |
| The **Rules** menu isn't visible from the Devices screen | (example) add a hint sentence on the Device List screen | yes, success 1:10 |
