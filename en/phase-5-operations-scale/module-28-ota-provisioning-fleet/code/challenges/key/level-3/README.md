# Module 28 Challenge 3 key: the automatic wave (the canary, a healthy wait, then the rest step by step)

**Task:** the **Update all** button (Module 28) sends a release to ALL devices at once as soon as one canary has succeeded, and Telegram
sends two messages per device (🔄 stopped on purpose, then ✅ online again): 20 devices = 40 messages. Build an **automatic wave** in the backend:
the canary first; if it succeeds, the canary must stay healthy for 10 minutes; after that the other devices are updated step by step in waves that
grow. **Emergency brake:** just one device going back to the old version (rollback), failing, or without word = the wave stops and the rest aren't
sent. Telegram only needs **one summary per wave**.

| Key file | Goes into the project as |
| :--- | :--- |
| [`backend/src/services/wave.ts`](backend/src/services/wave.ts) | a NEW file `backend/src/services/wave.ts`: the wave plan, sending per stage, the healthy wait, the emergency brake, the Telegram summary |
| [`backend/src/routes/wave.ts`](backend/src/routes/wave.ts) | a NEW file `backend/src/routes/wave.ts`: `POST /fleet/wave` (start), `GET /fleet/wave` (state), `POST /fleet/wave/stop` (stop) |
| [`backend/src/services/wave.test.ts`](backend/src/services/wave.test.ts) | a NEW file `backend/src/services/wave.test.ts`: 10 Vitest tests without the database, the broker, and Telegram |
| [`backend/bruno/`](backend/bruno/) | three NEW Bruno requests in `backend/bruno/`: `start wave`, `wave state`, `stop wave` (seq 40–42) |
| [`changes.diff`](changes.diff) | four small changes in files that already exist (+43 lines, −2): `backend/src/services/ota.ts`, `backend/src/services/telegram.ts`, `backend/src/services/telegram.test.ts` (+1 test), `backend/src/server.ts` |

No new npm package, no migration, no change to the firmware and the dashboard.

## How the wave runs

1. **Start** (admin): `POST /fleet/wave` with `{"version": "1.7.3"}`. The conditions are the same as **Update all**: the release exists, isn't
   withdrawn, isn't a test release, and no canary ever failed or rolled back on that version. Plus: at least one canary
   device, and no other wave running (all `409` with their reason). The plan is made once: the **canary** stage =
   every active Node 1 marked canary; the other devices (ordered by `device_id`) are split into waves of 2, 4, 8, … devices (`initial_size`, 2 by default,
   then twice as many). 20 devices = waves of 2, 4, 8, 6.
2. **Send per stage.** All the devices of one stage are sent the command at once through `requestUpdate()` in `ota.ts`, the same rules as the
   **Update** button per device. A device already running that version is marked `already` (not sent). Skipped devices (offline,
   kind not known yet, or refusing the command) are noted in the summary, but do NOT pull the brake.
3. **The result per device** arrives as usual (the `vitals.ota` report, or `expired` from the `OTA_TIMEOUT_MINUTES` watcher), through
   `announce()` in `ota.ts`. The change in `ota.ts` only passes every such notice on to `waveNotice()`. Notices that arrive at the same time
   (the expiry watcher marks several devices at once) are checked once after all of them are recorded, so that the summary is complete.
4. **The healthy wait** after the canary passes: for `wait_minutes` (**10** by default), the canary is checked every 5 seconds: still `online`, its
   newest message (telemetry or vitals) still names the new version, and it hasn't restarted (the estimated boot time = the vitals `ts` minus
   `uptime_s`; vitals are always sent every time a device connects). One problem = the emergency brake.
5. **The next wave** is sent as soon as every device of the previous wave has a final result (`succeeded`, `already`, or skipped).
6. **Emergency brake:** one `rollback`, `failed`, or `expired` = the wave stops. Commands already sent in that stage aren't
   taken back (their results are still recorded); the next stage is never sent.
7. **Telegram:** one summary per stage (`🌊` on to the next, `✅` finished, `🛑` emergency brake, `⏹️` stopped without a failure). `telegram.ts` gets
   `muteStopNotice()`: while a device's update from the wave is running, its 🔄 message and the ✅ pair stay quiet. The 📴 "hasn't
   come back after stopping on purpose" message is still sent: that's a danger sign, not a routine message.
8. **Stop** (admin): `POST /fleet/wave/stop`, without a body. **State** (every role): `GET /fleet/wave`, including the status of
   every device (`queued`, `running`, `succeeded`, `already`, `rollback`, `failed`, `expired`, `rejected`, `skipped`).

The wave lives in the backend's memory: a backend restart = the wave stops and doesn't continue by itself. Start it again with the same
version: the devices already running it are marked `already`.

## Steps

1. Copy the three new files in `backend/src/` and the three Bruno files to their places, then apply `changes.diff`: save it at the project root and
   run `git apply changes.diff` (delete the diff file afterwards), or type the changes by hand (`+` lines added, `-` lines
   dropped; every addition carries the comment "Module 28 Challenge 3").
2. In the `backend` folder: `npm run check` then `npm test`. The result in the author's lab: `Test Files  26 passed (26)` and `Tests  214 passed (214)`
   (203 Module 28 tests + 10 wave tests + 1 Telegram test).
3. From the project root: `docker compose up -d --build backend`.
4. Try it with the simulator: register a few simulated devices (the Bruno request `register practice device` with another `device_id`, their keys into
   `tools/.env`), tick **Canary** on one card, make and upload a fake file
   ([`tools/make-fake-bin.js`](../../../tools/make-fake-bin.js), for example `node make-fake-bin.js 1.7.3 ../../fake-firmware`), then
   send the Bruno request `start wave` with `"version": "1.7.3"`. For practice you may add `"wait_minutes": 1` so you don't wait 10 minutes;
   at a real home leave it at 10. Follow it with the Bruno request `wave state`, the **Fleet** screen, and Telegram.
5. Try its emergency brake: make a `--test` file of a new version and upload it **without** ticking **A test release** (pretending broken firmware got through
   the checks; the wave refuses a release marked test). The canary goes back to the old version, the wave stops, the other devices aren't sent.
   After that withdraw that broken release (the Bruno request `withdraw test release`, change its version).

## The result (the author's lab)

Raspberry Pi 5, Docker Engine 29.1.3, Compose 2.40.3, 2 Nov 2026 ±13:42–14:07 WIB. The center = `compose.cloud.yml` in laptop mode (the database,
the central broker, Caddy, backend 1.5.0 + this key), `AUTO_BROKER_ACCOUNTS=center`, Telegram = a **mock** Bot API server. The devices = **21 simulated
devices** from `tools/device-simulator.js` (`f00d00000001` the canary, `f00d00000002` to `f00d00000021`); the firmware files = fake files of
`make-fake-bin.js`. The healthy wait is **shortened to 1 minute** (`"wait_minutes": 1`), and `OTA_TIMEOUT_MINUTES=2` (10 by default) so that
the expiry doesn't take long. Every time number = a simulator number on the author's machine, not an ESP32 over Wi-Fi.

**A smooth run** (fake file 1.7.7, 21 devices): `POST /fleet/wave` was answered `202`. Its state according to `GET /fleet/wave`:

```text
14:02:00 WIB  running | canary | {'queued': 1}
14:02:06 WIB  wait-healthy | canary | {'succeeded': 1}
14:03:06 WIB  running | wave 1 of 4 | {'running': 2}
14:03:13 WIB  running | wave 2 of 4 | {'running': 4}
14:03:17 WIB  running | wave 3 of 4 | {'running': 8}
14:03:23 WIB  running | wave 4 of 4 | {'running': 6}
14:03:27 WIB  finished | wave 4 of 4 | {'succeeded': 6}
```

Telegram, as received by the mock Telegram server: **5 messages** for 21 devices (the old way: 42), without a single 🔄/✅ per device.

```text
🌊 Wave 1.7.7 · canary: 1 succeeded. Waiting 1 min: the canary must stay online with 1.7.7, then wave 1 of 4 (2 device(s)).
🌊 Wave 1.7.7 · wave 1 of 4: 2 succeeded. On to wave 2 of 4 (4 device(s)).
🌊 Wave 1.7.7 · wave 2 of 4: 4 succeeded. On to wave 3 of 4 (8 device(s)).
🌊 Wave 1.7.7 · wave 3 of 4: 8 succeeded. On to wave 4 of 4 (6 device(s)).
✅ Wave 1.7.7 FINISHED · wave 4 of 4: 6 succeeded. All stages: 21 succeeded, in 1 min 27 s.
```

**Emergency brake at the canary** (a `--test` fake file 1.7.8, uploaded without the test box ticked): the canary can't get into the broker, 70 seconds later it goes back to
1.7.7, and the wave stops. One message; the 20 other devices stay on 1.7.7 (waves 1–4 `queued`, never sent). In the same experiment
with a `--test` file 1.7.4, starting a wave of that version again was answered `409 {"message":"1 canary device(s) failed or rolled back
on 1.7.4: don't spread it"}`.

```text
🛑 Wave 1.7.8 STOPPED (emergency brake) · canary: 1 back to the old version (rollback) (f00d00000001: not connected to the broker within 60 seconds). 20 other device(s) NOT sent: check first, then withdraw the release.
```

**Emergency brake halfway** (fake file 1.7.6): the canary and wave 1 succeeded. The four devices of wave 2 ran in one simulator process
that was killed (`kill -9`, like a power cut) right after all four finished downloading. Without word for 2 minutes, all four became
`expired`, and waves 3 and 4 (14 devices) weren't sent. The third message (the two before it were the summaries of the canary and wave 1):

```text
🛑 Wave 1.7.6 STOPPED (emergency brake) · wave 2 of 4: 4 no word (expired) (f00d00000004: no word from the device; f00d00000005: no word from the device; f00d00000006: no word from the device; f00d00000007: no word from the device). 14 other device(s) NOT sent: check first, then withdraw the release.
```

As soon as that simulator process was started again, the four simulated devices reported `rollback` (`power lost during the trial period`); that result was recorded
in `GET /fleet/wave` too, without an extra Telegram message.

**The healthy wait** (fake file 1.7.9): the canary succeeded, then 20 seconds later `restart` was typed in the canary's simulator (stopping on purpose and
restarting). Within 5 seconds the wave stopped, and wave 1 wasn't sent. The canary's 🔄/✅ messages were still sent, because its update was already
finished (only the messages of devices BEING updated by the wave stay quiet):

```text
🌊 Wave 1.7.9 · canary: 1 succeeded. Waiting 1 min: the canary must stay online with 1.7.9, then wave 1 of 4 (2 device(s)).
🔄 f00d00000001 stopped on purpose (firmware update or restart), back online shortly
🛑 Wave 1.7.9 STOPPED (emergency brake): canary f00d00000001 stopped on purpose (offline-mode) during the healthy wait. 20 other device(s) NOT sent: check first, then withdraw the release.
✅ f00d00000001 online again after stopping on purpose (5 seconds)
```

Also checked: a test release (**A test release** ticked) → `409 {"message":"1.7.2 TEST release: never sent to many devices"}`; a second wave
while the first one runs → `409 {"message":"wave 1.7.4 is still running: wait until it finishes, or stop it first"}`; a viewer account may look
(`GET` `200`) but start/stop is answered `403`. Not yet tried by the author: a real fleet (ESP32), more than 21 devices, and the full 10-minute
healthy wait (shortened to 1 minute in the lab).

## Limits

- The wave doesn't survive a backend restart (it lives in memory, not in the database). Keeping it in a new table is the natural
  next step.
- There is only a pause after the canary. The next wave is sent as soon as the previous wave is finished; for a big fleet, a short pause
  between waves (for example 2 minutes) gives more chances to catch a device that runs into trouble after passing its trial period.
- A skipped device (offline at its turn) isn't sent again by that wave: update it yourself later, or start a wave of
  the same version once more.
- The canary health watcher uses the status, the version, and the estimated boot time. Damage that doesn't make a device disconnect or
  restart (for example a sensor that suddenly reads zero) isn't detected by this wave.
- A stopped wave (the emergency brake or **Stop**) still keeps the 🔄/✅ messages of the devices whose update is still `running` quiet,
  until their final result arrives. If a NEW wave is started before that result arrives, the result isn't recognized anymore: that device's 🔄/✅ messages
  may stay quiet until the backend restarts (📴 is still sent). Before starting a new wave, wait until `GET /fleet/wave`
  no longer names a `running` device. A natural fix: `markStopped()` unmutes the devices that are still `running`, or
  `startWave()` cleans up what the old wave left behind.
