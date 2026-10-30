# Module 27 Challenge 1 key: the Module 10 weather without `setInsecure()`

**Task (change a little):** the Module 10 weather sketch (`module10_weather`) opens HTTPS to `api.open-meteo.com` with
`client.setInsecure()`: the envelope is sealed, but the server's ID card isn't checked. Replace that line so that the ESP32 checks
the server's identity the way a browser does, without changing any other part of the sketch.

> [!NOTE]
> This key **hasn't been compiled and hasn't been tried on a board by the author yet**: Module 27 doesn't install the Arduino IDE/`arduino-cli`
> on the author's machine. The function names are taken from the source code of the esp32 package (Arduino-ESP32) 3.3.12, and the author
> read Open-Meteo's certificate chain on 29 Oct 2026. Try it in Wokwi or on your Node 1, then compare with "What you should see" below.

| Key file | What it holds |
| :--- | :--- |
| [`module27_secure_weather/module27_secure_weather.ino`](module27_secure_weather/module27_secure_weather.ino) | the `module10_weather` sketch with one line replaced (and Option B in a comment) |
| [`module27_secure_weather/isrg_root_x1.h`](module27_secure_weather/isrg_root_x1.h) | the ISRG Root X1 root as C++ text (only for Option B) |
| [`module27_secure_weather/secrets.h`](module27_secure_weather/secrets.h) | an example Wi-Fi name and password, the same as Module 10 (fill in your own; keep it out of Git) |

## The answer: one line

```cpp
  WiFiClientSecure client;
  client.useBuiltinCACertBundle();   // before: client.setInsecure();
```

`useBuiltinCACertBundle()` uses the esp32 package's **built-in root bundle**: a list of about 150 trusted roots built into the
firmware (like the list of roots on a phone), including Let's Encrypt's **ISRG Root X1** and **ISRG Root X2**. This function only
exists since esp32 package **3.3.12**; in older versions the compile fails because the function is unknown (use Option B).

**Option B: trust only one root.** `api.open-meteo.com` is served by two servers with two different chains, but the chains BOTH
servers SEND end at the same root (checked by the author on 29 Oct 2026 with `openssl s_client -showcerts`): `open-meteo.com`
← `YR1` (Let's Encrypt, RSA) ← `Root YR` ← **`ISRG Root X1`**, and `*.open-meteo.com` ← `YE2` (ECDSA) ← `Root YE` ← `ISRG Root X2` ←
**`ISRG Root X1`**. So for the ESP32 one root is enough (browsers and laptops that also trust `ISRG Root X2` stop at X2 for the
second chain, see warm-up step 4):

```cpp
#include "isrg_root_x1.h"
// ...
  client.setCACert(ISRG_ROOT_X1);
```

`isrg_root_x1.h` holds that root certificate, copied from Ubuntu's list of roots (`/etc/ssl/certs/ISRG_Root_X1.pem`). A root
certificate is a PUBLIC certificate, not a secret; before using a file from anywhere, match the SHA-256 fingerprint in its comment
against Let's Encrypt's official page. The weakness of Option B: if Open-Meteo moves to another issuer one day, this sketch stops
connecting until the root is replaced. Option A isn't affected as long as the new issuer is in the bundle.

## What is checked and what isn't

| | `setInsecure()` (Module 10) | `useBuiltinCACertBundle()` / `setCACert()` (Module 27) |
| :--- | :--- | :--- |
| Contents encrypted (a sealed envelope) | yes | yes |
| The signature chain up to a trusted root | no | yes |
| The name in the certificate = the name called (`api.open-meteo.com`) | no | yes |
| The dates | no | in the esp32 package's default configuration, the dates are **not** checked (the ESP32 doesn't know the time before NTP); not tested by the author on a board |

That's why the ESP32 must still connect by **name** (`https://api.open-meteo.com/…`), not by IP address: a certificate is made for a
name. The same recipe works for a device that goes straight to the VPS broker on 8883 (Practice 13): `WiFiClientSecure` with the
bundle or `setCACert`, the address `mqtt.yourname.my.id` (a name, not an IP).

## What you should see

The Serial Monitor (115200) is the same as in Module 10: `Sending GET to api.open-meteo.com ...`, `Status code: 200, answered in … ms`,
then the temperature, humidity, and condition. To prove the check really works, try once with the WRONG root (for example fill `setCACert()`
with another root): the request must fail (`Sending failed: …`, a negative code), not still give `200`. The exact error text hasn't been recorded by the author.
