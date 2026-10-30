# Module 27 warm-up worksheet

Copy this sheet into your study notes (for example `learn-iot/module-27/warmup.md`), then fill in the **Yours** column. **Don't** copy
passwords, tokens, the contents of `.env`, or your home's public IP address anywhere shared (a public repository, a forum, a chat).

## 1. The Module 26 home

| What to note | Command / place | Example | Yours |
| :--- | :--- | :--- | :--- |
| Central services (laptop) | `docker compose ps -a` (the project root) | backend, db, grafana `Up … (healthy)`; mosquitto, web `Up`; broker-account, migrate, grafana-account `Exited (0)` | |
| The gateway (Kit B, Pi) | `docker compose ps -a` (the `edge` folder) | `smarthome-gateway-mosquitto-1` `Up` | |
| The history fingerprint | `scripts/fingerprint.sql` | `readings` = …, `fingerprint` = … (32 characters), accounts = …, devices = … | |
| The backend that is running | `docker compose ps backend` and the `npm run dev` terminal | only one (Module 26) | |

## 2. The home's address on the internet

| What to note | Place | Yours (just SAME / DIFFERENT, without the numbers) |
| :--- | :--- | :--- |
| The WAN address in the router vs the address from a "what's my IP" site | the router's admin page; a phone on the home Wi-Fi | |
| Conclusion | same = your own public address; different = shared NAT (CGNAT) | |

## 3. DNS

| Question | Command | Example (29 Oct 2026) | Yours |
| :--- | :--- | :--- | :--- |
| A record | `nslookup api.open-meteo.com 1.1.1.1` | two Open-Meteo server addresses (`188.40.99.226`, `167.114.211.86`) | |
| A record of a website | `nslookup open-meteo.com 1.1.1.1` | two Cloudflare addresses (`104.21.40.60`, `172.67.178.9`): the orange cloud | |
| CNAME record | `nslookup -type=CNAME www.github.com 1.1.1.1` | `canonical name = github.com.` | |
| TTL | `nslookup -debug open-meteo.com 1.1.1.1` | `ttl = 300` (or smaller) | |

## 4. A site's ID card

| What to note | Example (`api.open-meteo.com`, 29 Oct 2026; one of its two servers) | Yours |
| :--- | :--- | :--- |
| The name it vouches for | `*.open-meteo.com` (the *Subject Alternative Name* list) | |
| Issuer → root | `YE2` (Let's Encrypt) → `Root YE` → `ISRG Root X2` (the other server: `YR1` → `Root YR` → `ISRG Root X1`) | |
| Valid | 31 Aug – 29 Nov 2026 (90 days; issued from 10 Feb 2027 on: 64 days) | |

## 5. Counters

| Counter | Used by whom now? (example) | The Module 27 plan | Yours |
| :--- | :--- | :--- | :--- |
| 80 | the Compose dashboard (`web`) | stays: the dashboard on the laptop | |
| 443 | (free) | Compose reserves `127.0.0.1:443`; if it's taken: `PORT_HTTPS` in `.env` | |
| 1883 | the Compose central broker (`mosquitto`) | stays; `MQTT_ADDRESS` decides who may knock | |
| 8883 | (free) | Compose reserves `127.0.0.1:8883`; if it's taken: `PORT_MQTTS` in `.env` | |
