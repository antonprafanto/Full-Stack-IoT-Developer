# Module 27 Challenge 3 key: the "Home gateway disconnected" banner

**Task:** when the home internet is down, the dashboard on the VPS still shows the devices **Online** with numbers that don't move (their
last status is retained, and the devices' will is on the Pi's broker, not on the VPS). Make a banner under the dashboard's header that shows
while the home gateway's bridge is disconnected, from the bridge status message the broker already sends: the topic
`$SYS/broker/connection/pi-bridge/state` (`1` = connected, `0` = down; Practices 4 and 9 switch it on with `notifications true`).

| Key file | Goes into the project as |
| :--- | :--- |
| [`backend/src/services/bridge.ts`](backend/src/services/bridge.ts) | a NEW file `backend/src/services/bridge.ts`: remembers the state of every bridge, writes a log line, and passes it to the dashboard |
| [`frontend/src/components/BridgeBanner.tsx`](frontend/src/components/BridgeBanner.tsx) | a NEW file `frontend/src/components/BridgeBanner.tsx`: an amber `role="status"` banner |
| [`changes.diff`](changes.diff) | five small changes in existing files (+28 lines, −1): `backend/src/services/mqtt.ts`, `backend/src/services/realtime.ts`, `frontend/src/types.ts`, `frontend/src/components/Layout.tsx`, `edge/acl-broker` |

## The message's path

1. **The central broker (the VPS, or the free-path Pi).** The bridge writes `1` as soon as it connects and leaves a will of `0`. When the home
   internet goes down, the central broker only notices after the bridge has been silent past its keepalive limit (60 seconds × 1.5), then
   publishes that will itself. Both are retained messages: anyone who subscribes later gets the last state at once.
2. **The broker permission** (`edge/acl-broker`, item 3): the `backend` account gets `topic read $SYS/broker/connection/+/state`. The `#` in
   `msh/#` never covers topics that start with `$SYS`, so its permission is written separately. Without this line the backend's subscription is
   silent (no error). After changing the ACL: `docker compose restart mosquitto` (restart, not reload; Module 21).
3. **The backend** (`mqtt.ts`): subscribes to `$SYS/broker/connection/+/state` next to `msh/#`; messages with a `$SYS/…` topic go to
   `receiveBridgeStatus()` in `bridge.ts`, not to the data-contract check. `bridge.ts` only reacts when the state CHANGES,
   writes a log line (`bridge pi-bridge DISCONNECTED: …` / `bridge pi-bridge connected`), then `broadcastBridge()` in `realtime.ts`
   sends the Socket.IO event `bridge` to every dashboard. A dashboard that has just connected gets the state of every bridge already
   heard at once (in `io.on("connection")`).
4. **The dashboard** (`BridgeBanner.tsx`, placed by `Layout.tsx` right under the header): adds a `bridge` listener in its effect and
   removes it again in the cleanup with the same function (the Module 23 rule), using the ONE socket from `socket.ts`. The banner only shows
   for bridges with `connected: false`. "Since" = the time the backend HEARD the down message (when the central broker noticed, not when the
   home internet really went down); an old retained message (the backend started while the bridge was already down) has no time, so the banner
   writes just "Home gateway disconnected".

## Steps

1. Copy the two new files to their places, then apply `changes.diff`: save it in the project root and run `git apply changes.diff`
   (delete the diff file afterwards), or type the changes by hand (`+` lines are added, `-` lines removed; every addition carries the
   comment "Module 27 Challenge 3").
2. In the `backend` folder: `npm run check` and `npm test`. In the `frontend` folder: `npm run lint` and `npm run build`.
3. From the project root: `docker compose up -d --build backend web`, then `docker compose restart mosquitto` (the new ACL).
4. The backend log writes `bridge pi-bridge connected` (the retained message `1`). Unplug the home internet (Practice 10) or, to try it
   on the LAN, cut the bridge as in Practice 4 (4.4); wait up to ±1.5 minutes. The banner appears on every open dashboard, also after
   a reload. Connect again: the banner goes away a few seconds after the bridge is back.

## Expected output (the author's lab)

Raspberry Pi 5, Docker Engine 29.1.3, Compose 2.40.3, Chrome 156 headless (412 px), 30 Oct 2026 ±16:35–16:50 WIB, project `m27en-t3`
(counters 6242–6249). Central broker = `compose.cloud.yml` in laptop mode (backend 1.4.0 + this key, dashboard 1.3.0 + this key); "home
gateway" = a Mosquitto 2.1.2 container `m27en-t3-gateway` with the Module 27 bridge settings (`cleansession true`, `local_cleansession false`,
`notifications true`, narrow topics) in the Compose hallway; "the internet is down" = `docker network disconnect` of that container (simulated).

```text
backend-1  | [16:46:30] INFO: bridge pi-bridge connected
backend-1  | [16:47:57] WARN: bridge pi-bridge DISCONNECTED: data from home is held at the gateway until it reconnects
backend-1  | [16:50:05] INFO: bridge pi-bridge connected
```

Central broker: `Client pi-bridge [172.22.0.7:54916] disconnected: exceeded timeout.` then, after reconnecting, `New bridge connected
from 172.22.0.7:47878 as pi-bridge (p4, c1, k60, u'pi-bridge').` The banner `Home gateway disconnected since 16:47:57 WIB (pi-bridge). The status
and numbers of the devices at home may be stale; the data held at the gateway is sent by itself as soon as the connection is back.` appeared
**42 seconds** after the unplug (16:47:15; the broker counts 90 seconds from the gateway's last packet, its connect at 16:46:27), stayed after
a reload, and went away **21 seconds** after the reconnect (16:49:46; 2 seconds after the bridge was back). Backend `npm run check` and `npm test`
(17 files, 118 tests) pass; the dashboard's `npm run lint` and `npm run build` are clean. Not tried yet: a real phone, a real home internet unplugged.

## Limits

- The banner only knows bridges that have **been heard** since the backend started (or their retained message). A gateway that has never
  connected at all doesn't make a banner appear.
- What is reported is the gateway → center path, not the devices: a Node 1 that is off at home while the internet is fine is still reported
  as usual (the `offline` status from the device's will on the Pi's broker, passed on by the bridge).
- There is no Telegram message for a bridge that is down: Grafana's "Silent node" (Module 25) already reports when the data stops flowing.
