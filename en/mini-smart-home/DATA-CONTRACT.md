# 📜 Data Contract — Mini Smart Home

🌐 **English** · [Bahasa Indonesia](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/proyek-rumah-pintar-mini/KONTRAK-DATA.md)

> **Contract version 1.5** ([Module 27](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-5-operations-scale/module-27-deploy-internet-tls-pwa/README.md), October 2026; version 1.4 from [Module 21](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-3-backend-data/module-21-device-broker-security/README.md), version 1.3 from Module 19, version 1.2 from Module 15, version 1.1 from Module 14, version 1.0 from Module 11). Its main reference is [Appendix A of the Syllabus](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/SYLLABUS.md#14-appendix-a--mini-smart-home-data-contract); this file is its working copy, kept in the project. **The ground rules:** every change is written here and in Appendix A first, then the code is changed, then the firmware version goes up.

The data contract is the "shared language" of every part of the project: the firmware, the broker, the contract checker, the gateway (Module 12), Node-RED (Module 13), the backend (Module 16), the database (Module 17), and the dashboard (Module 22). As long as they all follow this contract, each part can be built in a different week and still fit together with the others. The full explanation is in [Module 11](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-2-connectivity/module-11-mqtt-and-data-contract/README.md).

## 1. Device identity

- **`device_id`**: 12 **lowercase** hexadecimal digits from the chip's Wi-Fi MAC address, without colons. Example: the MAC address `A4:CF:12:E5:B7:C0` becomes `a4cf12e5b7c0`. In the firmware, it's read with `esp_read_mac(mac, ESP_MAC_WIFI_STA)`.
- Used as part of the topics, as the MQTT client name (*client ID*), and later as the key of the `devices` table (Module 17), the broker username (Module 21), and the identity for firmware updates (Module 28).
- **The location isn't part of the topic.** "Living room" or "garden" is a note in the database, so the firmware of a device that is moved doesn't need to change.

## 2. Topics

Prefix `msh` = Mini Smart Home. Topics are always lowercase and do **not** start with a slash.

| Topic | Direction | Content | Retained | When |
| :--- | :--- | :--- | :---: | :--- |
| `msh/<device_id>/telemetry` | device → broker | all sensor readings in one JSON | no | Node 1: every 10 seconds, and immediately when something important happens. Node 2: once every time it wakes up (5 minutes), published by Node 1 |
| `msh/<device_id>/status` | device → broker | the text `online`, `offline`, or `offline-mode` | **yes** | `online` when connected; `offline` is published by the broker (*Last Will*). Node 2: both are published by Node 1 (section 5) |
| `msh/<device_id>/vitals` | device → broker | device health | no | once after connecting, then every 5 minutes |
| `msh/<device_id>/cmd` | broker → device | one command | only `config` (Module 19) | any time |
| `msh/<device_id>/ack` | device → broker | the answer to one command | no | right after the command is received |

Node 2 (ESP-NOW) isn't connected to the broker. From Module 14 on, **Node 1 publishes on its behalf** at `msh/<device_id Node 2>/telemetry` and `/status`: Node 1 receives Node 2's ESP-NOW packets, gives them a `ts`, holds them back while the broker can't be reached, then publishes them with Node 2's `device_id`. Node 2's `device_id` is made the same way, from Node 2's Wi-Fi MAC address. Node 2 doesn't send `vitals` and doesn't receive `cmd`.

*Wildcards* that subscribers often use: `msh/+/status` (the status of every device), `msh/<device_id>/#` (all of one device's messages), and `msh/#` (the whole project).

## 3. Every device's MQTT connection

| Item | Rule |
| :--- | :--- |
| MQTT version | 3.1.1 |
| Broker address | on the home network: an IP address (not a name) and port `1883`, plain (without TLS). On the internet (from contract 1.5, Module 27): the broker's **domain name** (for example `mqtt.yourname.my.id`, not an IP address) and port `8883` with **TLS 1.2 or newer** (`mqtts://`); the device checks the broker's certificate: its chain up to a root it trusts (ISRG Root X1, the Let's Encrypt root), the name in the certificate equals the name it called, and the dates are still valid. Without that check (for example `setInsecure()`) it isn't valid. The broker's plain door `1883` must not be open to the internet. Accounts, topics, and message shapes are the same as at home |
| Client name (*client ID*) | `device_id` |
| Broker account (from contract 1.4, Module 21) | username = `device_id`; password = the device's 43-character `base64url` key from the `POST /devices` answer in the backend. The broker checks this key (`allow_anonymous false`) and forces the client name = the username (`use_username_as_clientid`). An ESP-NOW device (Node 2) doesn't connect to the broker, so it has no account. |
| *Clean session* | `true`: old commands aren't kept while the device is off |
| *Keep-alive* | 15 seconds (the broker declares the device gone after 22.5 seconds) |
| *Last Will* | topic `status`, content `offline`, QoS 1, retained |
| After connecting | publish `online` (retained), then subscribe to `cmd` with QoS 1 |
| Publishing QoS | `telemetry`, `vitals`, `ack`: QoS 0 |
| Message container | at least 512 bytes (`setBufferSize(512)`) |
| Reconnecting | at most every 5 seconds, with each attempt taking about 1 second at most |

## 4. `telemetry`

```json
{"ts":"2026-10-18T01:30:12Z","fw":"1.2.0","temperature":28.5,"humidity":71,"light":2310,"soil":37,"motion":false,"water_level":64}
```

| Field | Type | Unit and range | Node 1 sensor (pin) | If the reading fails |
| :--- | :--- | :--- | :--- | :--- |
| `ts` | text | UTC time in ISO-8601, for example `2026-10-18T01:30:12Z`, made by the device when the reading is taken | NTP clock | the message isn't published |
| `fw` | text | the firmware version in SemVer, for example `1.2.0` | — | — |
| `temperature` | decimal number, one digit after the decimal point | °C, −40 to 80 | DHT22 (D14) | `null` |
| `humidity` | integer | % relative humidity, 0–100 | DHT22 (D14) | `null` |
| `light` | integer | 0 (pitch dark) to 4095 (very bright) | LDR + 10 kΩ (VP/GPIO 36) | — |
| `soil` | integer | %, 0 = as dry as in air, 100 = as wet as in water | capacitive soil sensor (VN/GPIO 39) | — |
| `motion` | boolean | `true` = the PIR sees motion | PIR HC-SR501 (D34) | — |
| `water_level` | integer | % of the water tank filled, 0 = empty, 100 = full | HC-SR04 (TRIG D15, ECHO D35) | `null` |

**Immediate sends** (*report-by-exception*) happen when one of these states **changes**: motion or no motion; dark or bright (dark = `light` below `1000`); the soil below or above the watering threshold; the water tank below or above 20%; and, from contract 1.3 on, the state of one of the actuators (`state`, see below). Immediate sends happen at most every 2 seconds, and the next 10-second slot is counted from the last send.

### The actuator `state` in Node 1's `telemetry` (from contract 1.3 on, Module 19)

Every Node 1 `telemetry` carries a `state` object: the state of the four actuators when the message was made. Its content is **exactly the same** as `state` in `ack` (section 8).

```json
{"ts":"2026-10-21T06:10:12Z","fw":"1.5.0","temperature":31.2,"humidity":70,"light":2310,"soil":37,"motion":false,"water_level":64,"state":{"fan":true,"lamp":false,"pump":false,"curtain":90}}
```

| Field inside `state` | Type | Content |
| :--- | :--- | :--- |
| `fan` | boolean | `true` = the fan relay (D33) is on |
| `lamp` | boolean | `true` = the lamp relay (D32) is on |
| `pump` | boolean | `true` = the pump is watering right now |
| `curtain` | integer | the angle of the curtain servo (D26), 0–180 degrees |

- Node 1 v1.5.0 **always** writes `state`, also when its actuators are changed by a local rule (automatic watering, automatic lamp, the safety fan), not only by a command. When the state of one of the actuators changes, Node 1 sends a `telemetry` right away (an immediate send), so the server knows the latest state without waiting 10 seconds.
- `state` isn't a sensor reading: the `readings` table in the database has no column for it. The server uses it as the **reported state** (*reported*), and the important changes are recorded as events (Module 19).
- Node 2 has no actuators, so Node 2's `telemetry` **never** carries `state`.
- Older Node 1 firmware (up to v1.4.0) doesn't write `state`. Its messages are still valid; the server only learns its actuator state from the next `ack`.

### RS-485 sensor fields in Node 1 `telemetry` (from contract 1.2, Module 15)

These three fields only exist when an RS-485 soil sensor is connected and switched on with the `rs485 on` command on Node 1. The three always come together; when the sensor isn't in use, none of them is written at all.

```json
{"ts":"2026-10-19T02:10:05Z","fw":"1.4.0","temperature":28.5,"humidity":71,"light":2310,"soil":37,"motion":false,"water_level":64,"soil_rs485":58.5,"soil_temperature":25.3,"ec":1200}
```

| Field | Type | Unit and range | Source (Modbus RTU, function 03) | If the reading fails |
| :--- | :--- | :--- | :--- | :--- |
| `soil_rs485` | decimal number, one digit after the decimal point | % soil moisture according to the RS-485 sensor, 0–100 | register 0 divided by 10 | `null` |
| `soil_temperature` | decimal number, one digit after the decimal point | °C, −55 to 125 (the same name and meaning as Node 2's field) | register 1 divided by 10, signed | `null` |
| `ec` | integer | µS/cm (the soil's electrical conductivity), 0–20,000 | register 2 | `null` |

The RS-485 sensor is read every 10 seconds; `telemetry` carries its last reading. If the last reading failed (the sensor didn't answer, a wrong CRC, or an exception), all three fields are written as `null`. The name `soil_rs485` is deliberately different from `soil`: Node 1 already has `soil` from the capacitive sensor, and the two devices measure in different ways and on different scales. The register map above belongs to the Module 15 mock sensor; a real sensor has its own map, but the fields stay the same.

### Node 2 `telemetry` (from contract 1.1, Module 14)

```json
{"ts":"2026-10-25T01:30:12Z","fw":"1.0.0","temperature":29.4,"humidity":78,"pressure":1008.6,"soil_temperature":27.3,"soil":41}
```

| Field | Type | Unit and range | Node 2 sensor (pin) | If the reading fails |
| :--- | :--- | :--- | :--- | :--- |
| `ts` | text | UTC time in ISO-8601, **made by Node 1 when the ESP-NOW packet is received** | Node 1's NTP clock | the message is held back until Node 1's clock is set |
| `fw` | text | the firmware version of **Node 2** (carried in the packet), for example `1.0.0` | — | — |
| `temperature` | decimal number, one digit after the decimal point | air °C, −40 to 80 | BME280 (I2C: D21/D22) | `null` |
| `humidity` | integer | % relative humidity, 0–100 | BME280 | `null` |
| `pressure` | decimal number, one digit after the decimal point | hPa, 300–1,100 | BME280 | `null` |
| `soil_temperature` | decimal number, one digit after the decimal point | °C, −55 to 125 | DS18B20 (D27) | `null` |
| `soil` | integer | %, from the two-point calibration of the second soil sensor | second capacitive soil sensor (VN/GPIO 39, powered from D32) | `null` |
| `battery` | decimal number, two digits after the decimal point | battery volts, 2.5–4.5 | voltage divider (VP/GPIO 36), **optional** | `null`; the field is missing if the divider isn't fitted |

**Fields per device.** Every device writes only the sensor fields it has: Node 1 never writes `pressure`, and Node 2 never writes `light`. The field of a sensor that isn't fitted isn't written; the field of a sensor that fails to read is written as `null`. The same name means the same thing (`temperature` = the air temperature around the device, `soil` = the soil moisture percentage, `soil_temperature` = the soil temperature, whether from Node 2's DS18B20 or from Node 1's RS-485 sensor) so that the database and the charts can compare the house and the garden without new fields.

## 5. `status`

Plain text, not JSON:

| Content | Meaning | Published by |
| :--- | :--- | :--- |
| `online` | the device is connected | the device, every time it connects |
| `offline` | the device disappeared without saying goodbye (power cut, Wi-Fi dropped, stuck) | the broker, from the device's last will |
| `offline-mode` | the device stopped on purpose, for example before a firmware update | the device (used from Module 28 on) |

**Node 2's status** is published by **Node 1** (retained): `online` when the first valid packet from Node 2 arrives, `offline` if there's no packet for **3 × Node 2's interval + 1 minute** (a 5-minute interval = 16 minutes). Node 2 has no MQTT connection of its own, so it has no last will. That's why Node 2's status means "Node 1 still hears Node 2", and it can only be trusted while Node 1's own status is `online`.

**Module 19's offline mode doesn't use `status`.** While the broker can't be reached, the device can't publish anything anyway, so its report is only sent after it reconnects, through `vitals` (section 6). The content of `status` stays `online` and `offline`; `offline-mode` still belongs to Module 28.

## 6. `vitals`

```json
{"ts":"2026-10-18T01:30:00Z","rssi":-61,"uptime_s":86400,"heap_free":183200}
```

| Field | Content |
| :--- | :--- |
| `ts` | UTC time, as in `telemetry` |
| `rssi` | Wi-Fi signal strength in dBm, a negative integer |
| `uptime_s` | how many seconds the device has been on |
| `heap_free` | free *heap* memory in bytes |
| `offline_s` | **from contract 1.3 on (Module 19):** how many seconds the device ran in offline mode before it reconnected (an integer ≥ 0) |
| `local_fan` | **from contract 1.3 on (Module 19):** how many times the local safety rule turned the fan on during that offline mode (an integer ≥ 0) |
| `reset_reason` | **from Module 28 on:** `POWERON`, `BROWNOUT`, `SW`, `PANIC`, `WDT`, `DEEPSLEEP`, or `UNKNOWN` |

`offline_s` and `local_fan` are the **offline-mode report** (section 9, rule 5). The two always come together, and only in the first `vitals` after the device reconnects from offline mode; in other `vitals` neither of them is written:

```json
{"ts":"2026-10-21T06:20:41Z","rssi":-58,"uptime_s":5412,"heap_free":181940,"offline_s":214,"local_fan":1}
```

The device sends that reporting `vitals` about **10 seconds** after it reconnects, not instantly. A server that reconnects too (for example because the broker was just started again) needs a few seconds to subscribe, while `vitals` isn't retained, so a report published too early can be missed.

This report is only kept in the device's memory. If the device restarts before it could send it, that offline-mode report is lost.

## 7. `cmd`

```json
{"id":"c-20261018-0001","ts":"2026-10-18T01:31:05Z","action":"set","target":"lamp","value":true}
```

| Field | Content |
| :--- | :--- |
| `id` | unique text for every command, 39 characters at most; the device answers with the same `id` |
| `ts` | the time the command was made (UTC). May be left out when a command is typed by hand in MQTTX |
| `action` | `set`, `config` (Module 19), or `update` (Module 28) |

**`action: "set"`** moves one actuator:

| `target` | `value` | Notes |
| :--- | :--- | :--- |
| `lamp` | `true` / `false` | relay D32 |
| `fan` | `true` / `false` | relay D33 |
| `pump` | an integer from 1 to 10 (seconds) | refused if the water tank is below 20% or can't be read |
| `curtain` | an integer from 0 to 180 (degrees) | servo D26 |

**`action: "config"`** (from contract 1.3 on, Module 19) sends the thresholds of the local safety rules to the device:

```json
{"id":"c-20261021-061500-3","ts":"2026-10-21T06:15:00Z","action":"config","thresholds":{"temp_fan_on":30,"soil_watering":30}}
```

| Key inside `thresholds` | Type | Content |
| :--- | :--- | :--- |
| `temp_fan_on` | number, 15–45 | °C. In offline mode, the local safety turns the fan on when `temperature` is **above** this number, then turns it off when `temperature` is **below** this number − 2 |
| `soil_watering` | integer, 0–100 | %. The automatic watering threshold (Modules 6 and 8) |

- `thresholds` contains **at least one** of the two keys. A key that isn't sent doesn't change. Any other key, a wrong type, or a number out of range makes the whole command refused (`ok:false`): the device checks every key first, and only saves if all of them are valid.
- Valid thresholds are stored in NVS, **only the ones whose value changed**, then the device answers with an ordinary `ack`. The thresholds stay in use after the device restarts or the power goes out.
- `config` is sent with **QoS 1, retained**: a device that has just started or just reconnected receives the last thresholds as soon as it subscribes to `cmd`. Because its `id` is the same, a `config` that arrives again after a reconnect is carried out only once while the device is on (rule 8).
- An empty message on the `cmd` topic means someone deleted its retained message (for example with **Clear Retained Message** in MQTTX). The device ignores it without answering.

**`action: "update"`** (Module 28) carries the `url` and the `version` of the new firmware. Until that module, the device answers it with `ok:false`.

**Never** send a `set` command with the retained flag: the broker hands it over again every time the device connects, and the device carries it out again as soon as its `id` memory is empty, for example after a restart (section 9, rule 8).

## 8. `ack`

```json
{"id":"c-20261018-0001","ts":"2026-10-18T01:31:05Z","ok":true,"state":{"fan":false,"lamp":true,"pump":false,"curtain":90}}
{"id":"c-20261018-0002","ts":"2026-10-18T01:31:40Z","ok":false,"message":"pump value must be 1-10 seconds","state":{"fan":false,"lamp":true,"pump":false,"curtain":90}}
```

| Field | Content |
| :--- | :--- |
| `id` | the same as its command's `id` |
| `ts` | the time of the answer (UTC), or `null` if the device's clock isn't set yet |
| `ok` | `true` if the command was carried out, `false` if it was refused |
| `message` | the reason for the refusal; **required** if `ok` is `false` |
| `state` | the current state of **all** the actuators: `fan`, `lamp`, `pump` (boolean), `curtain` (degrees). From contract 1.3 on, the same object is also in every Node 1 `telemetry` (section 4) |

## 9. Shared rules

1. `ts` is made by the device, not by the server, so late-arriving data (Module 27) is recorded at the time it happened. Node 2 has no clock that can be trusted, so its `ts` is made by **Node 1**, its gateway node in the house, when the ESP-NOW packet is received, and it's kept even if the message is only published later (for example, after the router was off).
2. The database rejects duplicate `(device_id, ts)` pairs (Module 17).
3. `telemetry` every 10 seconds **and** immediately when something important happens (section 4). Node 2: once every time it wakes up, without immediate sends.
4. Every `cmd` is answered with one `ack` with the same `id` within 5 seconds; Node 1's target is under 1 second. Messages that aren't JSON, have no `id`, or have an `id` longer than 39 characters can't be answered and are only logged by the device.
5. A `cmd` of the `config` type is sent retained and stored by the device in NVS as the basis for the local safety rules (Module 19). **Offline mode** = the broker (or the Wi-Fi) unreachable continuously for 2 minutes or more since the last connection. In offline mode, the local safety turns the fan on when `temperature` is above `temp_fan_on`. Any fan it turned on itself is turned off again when `temperature` is below `temp_fan_on` − 2, also after reconnecting, unless another command (`set fan` from the server, MQTTX, or Serial) has already taken the fan over: **whoever turned it on turns it off**. After reconnecting, the device reports its offline mode through `vitals` (section 6).
6. A device may only write to the topics of its own `device_id`; from Module 21 on, this rule is enforced by the broker's access list (ACL) with the `%u` pattern (`pattern write msh/%u/telemetry|status|vitals|ack`, `pattern read msh/%u/cmd`), where `%u` is the username proven with the key, that is, its `device_id`. One exception: Node 1 also writes Node 2's `telemetry` and `status` (the lines `user <Node 1>` + `topic write msh/<Node 2>/telemetry|status` in the ACL). The backend and Node-RED use their own accounts (`read msh/#`, `write msh/+/cmd`).
7. Failed readings are written as `null` in the JSON, for every field. Marker numbers such as `-1` never leave the device.
8. A command with the same `id` is carried out only once; the device remembers at least the last eight `id`s and ignores repeats. This memory is lost when the device restarts, so `set` commands must not be sent retained (section 7).
9. Every device only sends the sensor fields it has (section 4, "Fields per device").
10. A topic has only **one** retained message. Deleting the retained message on `cmd` (for example a `set` command that was retained by mistake) deletes `config` as well, and a broker without storage (persistence) loses every retained message when it restarts. That's why the server publishes `config` again every time it connects to the broker and every time its threshold changes. The device stays safe in between: its last thresholds are stored in NVS.
11. **Store-and-forward through the gateway** (from contract 1.5, Module 27; rule 13 in Appendix A). The gateway (the broker on the Raspberry Pi) forwards the devices' `telemetry`, `status`, `vitals`, and `ack` to the central broker with QoS 1, **holds them** while the path to the center is down (for example when the home internet is out), then sends them later with their original `ts`; the center stores them at the time they happened and rejects duplicates (rules 1 and 2). The other direction is **not** held: a `cmd` the center publishes while the path is down isn't kept to be sent later (the center has already reported that command as failed because there was no `ack`; backend 1.4 itself only resends a manual command that hasn't been carried out if the device is heard again within 2 minutes of the last attempt), while the retained `config` arrives at the gateway again as soon as the path is back. The devices don't change: they stay connected to the gateway on the home network with the rules of section 3, and their offline mode (rule 5) only happens when the **gateway** can't be reached, not when only the internet is down.

## 10. Checking compliance

Run [`tools/contract-checker.js`](tools/contract-checker.js) (`node contract-checker.js` in the `tools` folder, after `npm install`). It subscribes to `msh/#` and stamps **PASS** or **FAIL** on every message, with its reasons and how long each `ack` took. On a public broker, also write your `device_id` after the broker's address (`node contract-checker.js broker.emqx.io <device_id>`) so only your device's messages are checked. Every firmware change must pass this check before it's committed. Since contract 1.1, the checker recognizes Node 2's `telemetry` by its typical field, checks it against Node 2's field list, and marks it `(telemetry Node 2)`. Since contract 1.2 (checker version 1.2), that typical field is `pressure`, because `soil_temperature` can now also come from Node 1; the checker also makes sure that Node 1's three RS-485 fields are always complete. Since contract 1.3 (checker version 1.3), the checker also checks the content of `state` in Node 1's `telemetry` and in `ack`, makes sure that the offline-mode report in `vitals` is always complete (`offline_s` and `local_fan`), checks the content of `thresholds` in every `config`, marks a `set` command retained on the broker as FAIL, and accepts an empty message on `cmd` as a sign that a retained message was just cleared.

## 11. Change history

| Contract version | Module | Change |
| :--- | :--- | :--- |
| 1.5 | Module 27 | The broker rules on the internet (section 3, "Broker address"): a domain name + port `8883` + TLS 1.2 or newer + the certificate checked up to ISRG Root X1; the plain door `1883` isn't opened to the internet. A new rule 11 (rule 13 in Appendix A): the gateway holds the devices' messages while the path to the center is down and sends them later with their original `ts`; `cmd` isn't held. The shape of the `telemetry`, `status`, `vitals`, `cmd`, and `ack` messages **doesn't change**; the firmware doesn't need changing. |
| 1.4 | Module 21 | Every device connects to the broker with its own account (username = `device_id`, password = a per-device key), see the "Broker account" row in section 3; rule 6 (a device only writes its own topics) is now enforced by the broker ACL with the `%u` pattern, together with the Node 1 → Node 2 exception. The shape of the `telemetry`, `status`, `vitals`, `cmd`, and `ack` messages **doesn't change**. |
| 1.3 | Module 19 | Node 1's `telemetry` carries `state` (the state of the four actuators, the same as `ack.state`), and immediate sends also happen when an actuator's state changes; `vitals` may carry the offline-mode report `offline_s` and `local_fan`, always together and only in the first `vitals` after reconnecting (sent about 10 seconds after connecting); `config` in detail: `thresholds` contains `temp_fan_on` (15–45 °C) and/or `soil_watering` (0–100%), QoS 1 retained, stored in NVS; the local safety rule and offline mode (rule 5); one retained message per topic, so the server publishes `config` again (rule 10). `status` doesn't change. Node 2's data doesn't change. |
| 1.2 | Module 15 | Node 1 may carry three RS-485 soil sensor fields (Modbus RTU): `soil_rs485`, `soil_temperature`, and `ec`, always together and only when the sensor is connected and switched on (`rs485 on`); `null` if the last reading failed. Node 2's data doesn't change. |
| 1.1 | Module 14 | Node 2 via Node 1: new fields `pressure`, `soil_temperature`, and `battery` (optional); sensor fields per device (rule 9); Node 2's `ts` is made by Node 1 when the packet is received; Node 2's `status` is published by Node 1; Node 2's `soil` may be `null`; Node 1 may write to Node 2's topics (rule 6). Node 1's data doesn't change. |
| 1.0 | Module 11 | The contract comes into use over MQTT. Decided: failed readings are written as `null`; *client ID* = `device_id`; `telemetry` every 10 seconds plus immediate sends; `vitals` without `reset_reason` until Module 28; the `message` field in `ack`; the `set` targets with their value ranges; command `id`s of 39 characters at most; commands with the same `id` are ignored. |

## My devices

Fill in this table in your own copy (the `mini-smart-home` repository).

| Device | `device_id` | Broker | Notes |
| :--- | :--- | :--- | :--- |
| Node 1 "Home" | | | |
| Node 2 "Garden" (from Module 14) | | | |

---

[⬅️ Back to the project](README.md) · [Module 11](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-2-connectivity/module-11-mqtt-and-data-contract/README.md) · [Syllabus](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/SYLLABUS.md)
