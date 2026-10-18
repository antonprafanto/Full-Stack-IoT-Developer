# 📜 Data Contract — Mini Smart Home

🌐 **English** · [Bahasa Indonesia](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/proyek-rumah-pintar-mini/KONTRAK-DATA.md)

> **Contract version 1.0** (Module 11, October 2026). Its main reference is [Appendix A of the Syllabus](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/SYLLABUS.md#14-appendix-a--mini-smart-home-data-contract); this file is its working copy, kept in the project. **The ground rules:** every change is written here and in Appendix A first, then the code is changed, then the firmware version goes up.

The data contract is the "shared language" of every part of the project: the firmware, the broker, the contract checker, the gateway (Module 12), Node-RED (Module 13), the backend (Module 16), the database (Module 17), and the dashboard (Module 22). As long as they all follow this contract, each part can be built in a different week and still fit together with the others. The full explanation is in [Module 11](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-2-connectivity/module-11-mqtt-and-data-contract/README.md).

## 1. Device identity

- **`device_id`**: 12 **lowercase** hexadecimal digits from the chip's Wi-Fi MAC address, without colons. Example: the MAC address `A4:CF:12:E5:B7:C0` becomes `a4cf12e5b7c0`. In the firmware, it's read with `esp_read_mac(mac, ESP_MAC_WIFI_STA)`.
- Used as part of the topics, as the MQTT client name (*client ID*), and later as the key of the `devices` table (Module 17), the broker username (Module 21), and the identity for firmware updates (Module 28).
- **The location isn't part of the topic.** "Living room" or "garden" is a note in the database, so the firmware of a device that is moved doesn't need to change.

## 2. Topics

Prefix `msh` = Mini Smart Home. Topics are always lowercase and do **not** start with a slash.

| Topic | Direction | Content | Retained | When |
| :--- | :--- | :--- | :---: | :--- |
| `msh/<device_id>/telemetry` | device → broker | all sensor readings in one JSON | no | every 10 seconds, and immediately when something important happens |
| `msh/<device_id>/status` | device → broker | the text `online`, `offline`, or `offline-mode` | **yes** | `online` when connected; `offline` is published by the broker (*Last Will*) |
| `msh/<device_id>/vitals` | device → broker | device health | no | once after connecting, then every 5 minutes |
| `msh/<device_id>/cmd` | broker → device | one command | only `config` (Module 19) | any time |
| `msh/<device_id>/ack` | device → broker | the answer to one command | no | right after the command is received |

Node 2 (ESP-NOW) isn't connected to the broker; from Module 14 on, **Node 1 publishes on its behalf** at `msh/<device_id_node2>/telemetry` and `/status`.

*Wildcards* that subscribers often use: `msh/+/status` (the status of every device), `msh/<device_id>/#` (all of one device's messages), and `msh/#` (the whole project).

## 3. Every device's MQTT connection

| Item | Rule |
| :--- | :--- |
| MQTT version | 3.1.1 |
| Broker address | on the home network: an IP address (not a name) and port `1883`; the rules for a broker on the internet (TLS, port `8883`) come in Module 27 |
| Client name (*client ID*) | `device_id` |
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

**Immediate sends** (*report-by-exception*) happen when one of these states **changes**: motion or no motion; dark or bright (dark = `light` below `1000`); the soil below or above the watering threshold; the water tank below or above 20%. Immediate sends happen at most every 2 seconds, and the next 10-second slot is counted from the last send.

## 5. `status`

Plain text, not JSON:

| Content | Meaning | Published by |
| :--- | :--- | :--- |
| `online` | the device is connected | the device, every time it connects |
| `offline` | the device disappeared without saying goodbye (power cut, Wi-Fi dropped, stuck) | the broker, from the device's last will |
| `offline-mode` | the device stopped on purpose, for example before a firmware update | the device (used from Module 28 on) |

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
| `reset_reason` | **from Module 28 on:** `POWERON`, `BROWNOUT`, `SW`, `PANIC`, `WDT`, `DEEPSLEEP`, or `UNKNOWN` |

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

**`action: "config"`** (Module 19) carries `thresholds`, for example `{"temp_fan_on":30,"soil_watering":30}`, is sent retained, and is stored by the device in NVS. **`action: "update"`** (Module 28) carries the `url` and the `version` of the new firmware. Until those modules, the device answers both with `ok:false`.

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
| `state` | the current state of **all** the actuators: `fan`, `lamp`, `pump` (boolean), `curtain` (degrees) |

## 9. Shared rules

1. `ts` is made by the device, not by the server, so late-arriving data (Module 27) is recorded at the time it happened.
2. The database rejects duplicate `(device_id, ts)` pairs (Module 17).
3. `telemetry` every 10 seconds **and** immediately when something important happens (section 4).
4. Every `cmd` is answered with one `ack` with the same `id` within 5 seconds; Node 1's target is under 1 second. Messages that aren't JSON, have no `id`, or have an `id` longer than 39 characters can't be answered and are only logged by the device.
5. A `cmd` of the `config` type is sent retained and stored by the device in NVS as the basis for the local safety rules (Module 19).
6. A device may only write to the topics of its own `device_id`; this rule is enforced by the broker's access list (Module 21).
7. Failed readings are written as `null` in the JSON, for every field. Marker numbers such as `-1` never leave the device.
8. A command with the same `id` is carried out only once; the device remembers at least the last eight `id`s and ignores repeats. This memory is lost when the device restarts, so `set` commands must not be sent retained (section 7).

## 10. Checking compliance

Run [`tools/contract-checker.js`](tools/contract-checker.js) (`node contract-checker.js` in the `tools` folder, after `npm install`). It subscribes to `msh/#` and stamps **PASS** or **FAIL** on every message, with its reasons and how long each `ack` took. On a public broker, also write your `device_id` after the broker's address (`node contract-checker.js broker.emqx.io <device_id>`) so only your device's messages are checked. Every firmware change must pass this check before it's committed.

## 11. Change history

| Contract version | Module | Change |
| :--- | :--- | :--- |
| 1.0 | Module 11 | The contract comes into use over MQTT. Decided: failed readings are written as `null`; *client ID* = `device_id`; `telemetry` every 10 seconds plus immediate sends; `vitals` without `reset_reason` until Module 28; the `message` field in `ack`; the `set` targets with their value ranges; command `id`s of 39 characters at most; commands with the same `id` are ignored. |

## My devices

Fill in this table in your own copy (the `mini-smart-home` repository).

| Device | `device_id` | Broker | Notes |
| :--- | :--- | :--- | :--- |
| Node 1 "Home" | | | |
| Node 2 "Garden" (from Module 14) | | | |

---

[⬅️ Back to the project](README.md) · [Module 11](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/phase-2-connectivity/module-11-mqtt-and-data-contract/README.md) · [Syllabus](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/SYLLABUS.md)
