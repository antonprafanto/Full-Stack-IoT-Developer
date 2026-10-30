# Module 27 Quick Win: a sealed envelope without an ID card

Material for the Module 27 🏆 Quick Win (±15 minutes, IDR 0, every path). One Caddy container serves one page over
**HTTPS** with a certificate it made **itself**. The browser warns you loudly, and **that's exactly what we want to see**:
the connection's contents are encrypted (a sealed envelope), but no party the browser knows vouches for the site's identity (no
ID card). This is Module 10's `setInsecure()`, seen from the browser's side. The "Mini Smart Home" project isn't touched at all.

| File | What it holds |
| :--- | :--- |
| [`compose.yaml`](compose.yaml) | one service `envelope` from `caddy:2.11.7-alpine` (the project's front-door image), counter `127.0.0.1:8443` |
| [`Caddyfile`](Caddyfile) | the site address `localhost` + `tls internal` (Caddy's own local issuer) |
| [`page/index.html`](page/index.html) | the page "Hello from a sealed envelope" |

**Practice only.** The browser warning in step 3 is made on purpose. On a real site, a warning like this means **stop**: never
click past it for a site that asks for a password. Its counter is only `127.0.0.1:8443` (this laptop only), and everything is taken down in step 6.

## Steps

Copy this `quick-win` folder into your practice folder (for example `learn-iot/module-27/quick-win`), then open a terminal there.
The image `caddy:2.11.7-alpine` has been there since Module 26 (no download again).

1. **Start it:** `docker compose up -d`. The project has the same name as the folder (`quick-win`).
2. **Watch Caddy make its own ID card:** `docker compose logs`. Caddy writes a JSON log; look for `"msg":"certificate obtained
   successfully"` with `"issuer":"local"` (the local issuer, not Let's Encrypt), and `root certificate trust store installation
   disabled; unconfigured clients may show warnings` (its root certificate is deliberately not installed on your laptop: `skip_install_trust` in
   the Caddyfile).
3. **Open `https://localhost:8443`** in Chrome or Edge. The page **Your connection is not private** appears with the code
   `NET::ERR_CERT_AUTHORITY_INVALID` = "this certificate's issuer isn't known". Read its sentences, don't rush to click.
4. **Look at its ID card:** click the icon on the left of the address bar, then open its certificate details (the menu names differ per browser version).
   The issuer is `Caddy Local Authority - ECC Intermediate`, above it `Caddy Local Authority - 2026 ECC Root`: issuers that only exist inside
   this container. The name in the certificate (`localhost`) and its dates are right; only the **chain** check up to a trusted root fails.
5. **Proceed (on purpose, only in this practice):** **Advanced** → **Proceed to localhost (unsafe)**. The page "Hello from a sealed
   envelope" shows. The connection is TLS 1.3 (encrypted), but the site's identity still isn't proven: the browser doesn't show the safe sign
   it shows for ordinary sites. Encryption without identity isn't a secure connection.
6. **Take it down:** `docker compose down`. The container and its hallway are removed, including the certificate Caddy made (no cupboard). Counter
   8443 is free again.

## Three ways to talk to a server (Module 10, completed)

| | Contents encrypted? | Server identity checked? | On the ESP32 | In the browser |
| :--- | :--- | :--- | :--- | :--- |
| Plain HTTP | no | no | `http://…` | `http://…` (the Module 26 dashboard on the home Wi-Fi) |
| HTTPS without an ID card | yes | no | `setInsecure()` | this Quick Win (the red warning, **Proceed to localhost (unsafe)**) |
| HTTPS with an ID card | yes | yes | `setCACert()` / a root bundle | a site with a Let's Encrypt certificate (the padlock, no warning) |

An ID card that ALL phones and laptops recognize needs a **domain name** and a known issuer (Let's Encrypt): that's Concepts 5–6 and
Practices 6–7 this week.

## Expected output (the author's lab)

Raspberry Pi 5, Ubuntu 26.04 arm64, Docker Engine 29.1.3, Compose 2.40.3, headless Chrome 156 in English, 30 Oct 2026
±13:58–14:00 WIB. In the author's English lab the counter is `127.0.0.1:6240` (not 8443) and the project `m27en-quick-win`; the files are otherwise the same.

- `docker compose up -d`: the container started in 0.7 s (Compose's own line). `docker compose ps`: `Up`, the PORTS column `80/tcp, 2019/tcp,
  443/udp, 127.0.0.1:6240->443/tcp` (80, 2019, and 443/udp are only the image's notes; only 443/tcp is opened to the laptop).
- The log (shortened): `"msg":"enabling automatic TLS certificate management","domains":["localhost"]`, `"msg":"root certificate trust store
  installation disabled; unconfigured clients may show warnings"`, `"msg":"certificate obtained successfully","issuer":"local"`. Three
  `warn` lines are normal: `admin endpoint disabled`, then two for the HTTP redirect on the container's port 80, `HTTP/2 skipped because it requires
  TLS` and `HTTP/3 skipped because it requires TLS`.
- The chain (`openssl s_client -connect 127.0.0.1:6240 -servername localhost -showcerts`): the leaf (SAN `DNS:localhost`, valid **12 hours**)
  ← `CN=Caddy Local Authority - ECC Intermediate` (valid 7 days) ← `CN=Caddy Local Authority - 2026 ECC Root`; `Protocol: TLSv1.3`;
  `Verify return code: 20 (unable to get local issuer certificate)`. `curl https://localhost:6240/` without `-k`: `curl: (60) SSL
  certificate OpenSSL verify result: unable to get local issuer certificate (20)`.
- Chrome 156: the tab title **Privacy error**; **Your connection is not private**; "Attackers might be trying to steal your information from
  localhost (for example, passwords, messages, or credit cards)."; `NET::ERR_CERT_AUTHORITY_INVALID`; the buttons **Back to safety** and
  **Advanced** → "This server could not prove that it is localhost; its security certificate is not trusted by your computer's operating system.
  …" → the link **Proceed to localhost (unsafe)** → the page "Hello from a sealed envelope".
- `docker compose down`: the container removed in 0.8 s; no container, hallway, or cupboard is left.

Not tried by the author: Edge, Chrome on Windows/macOS (the texts can differ a little per version) and step 4 (headless Chrome can't record the
address bar and the certificate window; the issuer names come from `openssl`).
