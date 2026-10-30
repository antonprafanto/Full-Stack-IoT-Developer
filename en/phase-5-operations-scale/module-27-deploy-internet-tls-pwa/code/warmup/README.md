# Module 27 warm-up: your home, your address, and a site's ID card

Material for the Module 27 🔁 warm-up (±30 minutes, 5 steps). Nothing is started, deleted, or changed: everything only **reads** the
state of your home and the internet, so that you have seen this week's vocabulary (public IP address, DNS, certificate, counter) yourself
before you use it.

| File | What it holds |
| :--- | :--- |
| [`worksheet.md`](worksheet.md) | the worksheet for the five steps below (copy it into your study notes, for example `learn-iot/module-27/warmup.md`) |

## Steps

1. **Take stock of the Module 26 home.** On the laptop, from the project root: `docker compose ps -a`. Every long-running service is `Up`
   (backend, db, and Grafana `(healthy)`), the one-off services `Exited (0)`. Kit B: on the Pi, from the `edge` folder, `docker compose ps -a`
   (the gateway `Up`). Then note the **history fingerprint** with `scripts/fingerprint.sql` (how to run it is written in the file's header;
   Module 26 Practice 1): these `readings` and `fingerprint` numbers are compared again after the history moves to the VPS in Practice 7.
   Stop the simulator first, so that no new readings come in between.
2. **Your home's address on the internet.** Open the router's admin page (its address is usually on the router's sticker) and look for the
   **WAN** or **Internet** address. Then, from a phone on the home Wi-Fi, open a "what's my IP" site (search for "what is my IP"). If both
   numbers are the SAME, your router holds its own public address. If they are DIFFERENT (for example the router says `100.64.x.x` or
   `10.x.x.x`), your internet provider uses **shared NAT** (often called CGNAT): many homes share one public address, so visitors from the
   internet really can't knock on your home, with or without port forwarding. That's one reason Module 27 doesn't open a door in the router:
   the bridge and Cloudflare Tunnel are both OUTGOING connections from the home. Don't paste your home's IP address in a forum, a chat, or a pull request.
3. **The internet's phone book (DNS).** In any terminal (Windows, macOS, Linux, Pi): `nslookup api.open-meteo.com 1.1.1.1` (the name of
   the Module 10 weather server, asked from the public DNS server `1.1.1.1`). The answer is an IP address (an **A** record). Compare it with
   `nslookup open-meteo.com 1.1.1.1` (the Open-Meteo website): a completely different address. Then
   `nslookup -type=CNAME www.github.com 1.1.1.1`: `www.github.com` is **another name** (a **CNAME** record) for `github.com`. To see the
   **TTL** (how many seconds an answer may be kept before it is asked again), add `-debug`:
   `nslookup -debug open-meteo.com 1.1.1.1`, then look for the line `ttl = …`.
4. **A site's ID card.** In Chrome or Edge, open `https://api.open-meteo.com` (the Module 10 weather server; its page is just a JSON
   error text, that's fine), click the icon on the left of the address bar, then open its certificate details. Note three things: the
   **name** the certificate vouches for, the **issuer** and its chain up to the root (Let's Encrypt: ending at an ISRG root, **ISRG Root X1**
   for an RSA chain or **ISRG Root X2** for an ECDSA chain; which server you get takes turns), and the **dates**
   (a Let's Encrypt certificate is valid 90 days if issued before 10 Feb 2027, then 64 days). Compare with `https://open-meteo.com`:
   a different issuer. This is the Module 10 promise: `setInsecure()` skips all three checks.
5. **Who uses the web and broker counters?** Module 27 uses counters 80 and 443 (web), 1883 (the plain broker), and 8883 (the TLS broker).
   - Linux / Raspberry Pi: `ss -ltnp` (the fourth column = address:counter; `sudo` to see the names of programs owned by other users).
   - macOS: `lsof -nP -iTCP -sTCP:LISTEN` *(not tested by the author)*.
   - Windows (PowerShell): `Get-NetTCPConnection -State Listen | Where-Object LocalPort -in 80,443,1883,8883` *(not tested by the author)*.
   - What Docker opened: `docker ps --format 'table {{.Names}}\t{{.Ports}}'`.

   Since Module 27, Compose on the laptop also reserves `127.0.0.1:443` and `127.0.0.1:8883`; if another program (a VPN, another web server)
   already uses one of them, note it on the worksheet: in Practice 2 (2.3–2.4) the counter is moved through `PORT_HTTPS` / `PORT_MQTTS` in `.env`
   (🚨 `port is already allocated`).

## Expected output (the author's lab, steps 3–4)

Raspberry Pi 5, Ubuntu 26.04, 30 Oct 2026 ±13:57–13:58 WIB (the DNS answers and other people's certificate chains can change at any time):

```text
$ nslookup api.open-meteo.com 1.1.1.1
Server:		1.1.1.1
Address:	1.1.1.1#53

Non-authoritative answer:
Name:	api.open-meteo.com
Address: 188.40.99.226
Name:	api.open-meteo.com
Address: 167.114.211.86
```

`nslookup open-meteo.com 1.1.1.1` → `104.21.40.60` and `172.67.178.9`: **Cloudflare** addresses, not Open-Meteo's own server. The website
uses the orange cloud (*proxied*), while its API name points straight at its two servers (the gray cloud, *DNS only*): a difference
discussed in Concept 5. `nslookup -type=CNAME www.github.com 1.1.1.1` → `www.github.com	canonical name = github.com.`; `nslookup -debug
open-meteo.com 1.1.1.1` → `ttl = 300` (the TTL number can be smaller than the original: that's the time left in the `1.1.1.1` server's store).

The certificate chains that were CHECKED (`openssl s_client` with Ubuntu's list of roots, which holds ISRG Root X1 and X2; English lab,
same morning). Two API servers, two chains, two roots:
- `188.40.99.226`: `open-meteo.com` ← `YR1` (Let's Encrypt, RSA) ← `Root YR` ← **`ISRG Root X1`**
- `167.114.211.86`: `*.open-meteo.com` ← `YE2` (Let's Encrypt, ECDSA) ← `Root YE` ← **`ISRG Root X2`**; valid 31 Aug – 29 Nov 2026
  (90 days). This server also SENDS an `ISRG Root X2` certificate signed by `ISRG Root X1` (seen with `-showcerts`):
  a bridge for clients that only trust X1, for example the ESP32 in Challenge 1. `openssl` and browsers that trust X2 don't
  use it and stop at X2. A browser's certificate window shows the path that browser checked (not recorded by the author).
- the website `open-meteo.com` (through Cloudflare): issuer `WE1` (Google Trust Services), not Let's Encrypt.
