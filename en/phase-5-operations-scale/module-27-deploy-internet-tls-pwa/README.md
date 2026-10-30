# Module 27 — To the Internet: VPS, Domain, HTTPS, MQTT over TLS, Pi → VPS Bridge, & a Phone App (PWA)

🌐 **English** · [Bahasa Indonesia](../../../fase-5-operasi-skala/modul-27-deploy-internet-tls-pwa/README.md)

*Phase 5 · Week 27 · Hardware: **Kit A + B** + a **2 GB VPS** (highly recommended) + a **domain** (the free path: Kit A + B + a domain + a free Cloudflare account; without a Pi: the laptop becomes the gateway) · Prerequisites: **Module 26** (backend 1.3.0, frontend 1.2.0, `compose.cloud.yml` on `main`), Module 21 (the locked broker) · Time: the main path ±10 hours, the free path ±7.5 hours, spread over one week, plus waiting for the domain and DNS to become active · Cost: a domain (about IDR 15,000–30,000/year, an estimate) + the first VPS month (about IDR 80,000–200,000, October 2026 prices, check again); the free path: the domain only*

[⬅️ Module 26](../module-26-docker-compose/README.md) · [Phase 5](../README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · [Module 28 ➡️ (coming soon — read the summary in the Syllabus)](../../SYLLABUS.md#module-28--ota-updates-provisioning-fleets--from-breadboard-to-enclosure)

---

[Module 26 closed](../module-26-docker-compose/README.md#-module-26-completion-checklist) with a promise: the same `compose.cloud.yml` moves to a VPS with a domain and HTTPS (in the Caddyfile, `:80` is replaced by the domain name), the Pi bridge moves up to TLS and learns to hold data while the internet is down, and the dashboard becomes an app on your phone; its free path runs everything on the Pi through Cloudflare Tunnel (the `tunnel` profile). According to the [Syllabus](../../SYLLABUS.md#-phase-5--operations--scale-deploy-ota-cicd--capstone-modules-2632), Phase 5 takes your system to "it runs on the internet, 24/7, encrypted, updatable, and never loses data". Module 26 wrapped your home; **Module 27 takes it out of the house**.

Many old promises are paid off this week. [Module 4](../../phase-0-foundations/module-04-javascript-nodejs/README.md#13-http-letters-between-programs) postponed `https://`, the version whose contents are encrypted, to Module 27. [Module 10](../../phase-2-connectivity/module-10-wifi-and-http/README.md#8-https-and-setinsecure-a-sealed-envelope-whose-courier-isnt-checked) introduced the sealed envelope and the courier's ID card, then gave `setInsecure()` the label "TEMPORARY" until Module 27; [Module 11](../../phase-2-connectivity/module-11-mqtt-and-data-contract/README.md#3-a-broker-on-the-laptop-mosquitto-two-configuration-lines-and-the-firewall) set door 8883 aside for encrypted MQTT. [Module 20](../../phase-3-backend-data/module-20-user-security/README.md#5-an-httponly-cookie-not-localstorage) prepared the `Secure` cookie that waits for HTTPS, and the `trustProxy` setting. [Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#10-honest-traffic-at-home-is-still-in-the-clear) admitted that the device keys still travel in the clear and forbade port forwarding before there's TLS. [Module 24](../../phase-4-frontend-dashboard/module-24-control-rules-roles/README.md#11-used-by-someone-else-basic-accessibility-the-home-screen-and-a-user-test) put a shortcut on the home screen while saying a PWA needs HTTPS, and [Module 25](../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md#103-a-grafana-link-json-on-github-a-screenshot-and-a-note-on-when-to-use-which-5-minutes) postponed a live Grafana link until Grafana can be opened over HTTPS. [Module 26](../module-26-docker-compose/README.md#10-two-files-until-the-end-the-center-and-the-gateway) noted an honest limit: its first bridge isn't TLS yet and doesn't hold data yet, which it called "the core of Module 27", and the Compose files stay two.

| What happens now | The cause | This week's cure |
| :--- | :--- | :--- |
| The laptop sleeps, and the smart home sleeps with it: the Telegram bot, the automation rules, Grafana's "Silent node" alert, and the morning report stop. | The center (`compose.cloud.yml`) runs on the laptop, which isn't on 24 hours a day. | **A machine that runs 24 hours a day**: a rented VPS (the main path) or your own Pi (the free path) ([Concept 1](#1-from-home-to-the-internet-three-doors-two-paths)–2, [Practice 5](#practice-5--the-main-path-rent-a-vps-and-lock-its-doors-60-minutes), 7, and [11](#practice-11--the-free-path-everything-on-the-pi-and-cloudflare-tunnel-85-minutes)) |
| The dashboard only opens on the home Wi-Fi ([Module 23's phone mode](../../phase-4-frontend-dashboard/module-23-realtime-dashboard/README.md#12-a-phone-over-home-wi-fi-phone-mode-and-laptop-mode)), over `http://` without a padlock. | Your home has no name on the internet yet, and nobody has installed a certificate for it yet. | **Your own domain and automatic HTTPS**: Caddy and Let's Encrypt, or Cloudflare on the free path ([Concept 5](#5-domains-and-dns-the-internets-phone-book)–7, [Practice 6](#practice-6--domain-and-dns-your-own-name-in-the-internets-phone-book-25-minutes-plus-waiting-time), 7, and 11) |
| Device keys and MQTT messages travel in the clear through door 1883: the Module 21 sniffer can read them. | Door 1883 is a postcard: still acceptable inside the home, not on the internet. | **TLS at door 8883**: whatever leaves the house is always inside a sealed envelope ([Concept 8](#8-tls-for-mqtt-door-8883-a-copy-of-the-certificate-and-a-reload), [Practice 8](#practice-8--the-main-path-mqtt-door-8883-with-tls-35-minutes)–9) |
| Readings sent while the center can't be reached are lost. | The Module 26 bridge reconnects by itself, but it doesn't hold messages. | **A store-and-forward bridge**: the Pi holds the readings, then forwards them later with their original `ts` ([Concept 9](#9-a-store-and-forward-bridge-who-holds-what), [Practice 4](#practice-4--store-and-forward-at-home-first-the-lan-bridge-and-a-10-minute-outage-drill-30-minutes), 9, and 10) |
| "Add to the home screen" is only a shortcut that opens the browser. | An installable web app (PWA) needs a secure context (HTTPS, or `localhost` on the laptop), a manifest, icons, and a service worker. | **Dashboard 1.3.0 becomes a PWA** ([Concept 11](#11-pwa-from-a-shortcut-to-an-app), [Practice 3](#practice-3--dashboard-130-becomes-a-pwa-at-httplocalhost-40-minutes) and [12](#practice-12--the-pwa-on-a-phone-a-mobile-network-and-a-friend-in-another-city-40-minutes)) |
| Behind Caddy, every visitor looks like one address: one password guesser gets every visitor a `429`, and the cookie isn't `Secure` yet. | The backend doesn't trust the visitor information Caddy forwards yet. | **Backend 1.4.0 with `TRUST_PROXY`** (Concept 7, [Practice 2](#practice-2--backend-140-trust_proxy-a-persistent-broker-session-and-2-minute-manual-commands-20-minutes), [7.8](#78--the-padlock-at-httpsiotyournamemyid-308-logging-in-and-the-secure-cookie-6-minutes)–7.9) |

At the end of the week, your home is online, encrypted, and survives internet outages. That's the pass requirement from the [Syllabus](../../SYLLABUS.md#module-27--to-the-internet-vps-domain-https-mqtt-over-tls-pi--vps-bridge--a-phone-app-pwa): "a friend in another city opens your dashboard over HTTPS and sees the numbers change; MQTTX **without** TLS is rejected on the VPS's port 8883 and the Mosquitto log shows a TLS connection from the bridge; the 10 minutes of data from while the home internet was down show up late, with no duplicates." This module splits it into four proofs:

- **T1** HTTPS from outside the home: your friend opens `https://iot.yourname.my.id` from their own network, logs in with a temporary viewer account, and sees Node 1's numbers change. No friend yet? Your own phone over mobile data, noted as the stand-in.
- **T2a** door 8883 accepts only TLS: a connection without TLS to `mqtt.yourname.my.id:8883` is refused, and the plain 1883 on the VPS is proven unreachable from outside (thanks to `MQTT_ADDRESS`, not ufw: [Concept 4](#4-a-leaky-firewall-ufw-and-docker)).
- **T2b** the VPS Mosquitto log records the Pi bridge coming in over TLS.
- **T3** the home internet is unplugged for 10 minutes; once it's back, the readings of that span arrive late on the VPS with the time they happened, **no gaps and no duplicates**. "No duplicates" has been guaranteed by the database since Module 17; the hard part is actually "no gaps", so T3 checks both.

Per path: **the free path** proves T1 through Cloudflare Tunnel, **T2-free** (the broker can't be reached from outside the home at all), and **T3-free** (a: the Pi's history stays whole while the internet is down; b: the store-and-forward drill on the LAN); its bridge never leaves the home, so there's no T2b. The paths without a Pi, without a Kit, Wokwi, and laptop only are in the **Choose your path** table below. The Syllabus (v1.0.29) records this T1–T3 split and the wording for each path in its ✅ line; the ✅ sentence itself stays.

For Mini Smart Home, the backend moves up to **1.4.0** (`TRUST_PROXY`, a persistent broker session, and manual commands not carried out within 2 minutes aren't sent again; no migration, no new package), the dashboard to **1.3.0** (PWA: one new package, `vite-plugin-pwa` 2.0.0, for the build only, icons, and an offline message). `compose.cloud.yml` stays one file for three places (the laptop, the VPS, and the free-path Pi; only `.env` differs), `edge/` learns store-and-forward and TLS, and `scripts/` gets three new scripts. The data contract moves up to **1.5** (the broker address on the internet; the message shapes stay), and the firmware of Node 1 (v1.6.0) and Node 2 (v1.0.0) doesn't change. The third-party images are the same as in Module 26, and `cloudflared` is now switched on (the free path). Module 27 isn't a Checkpoint: its quiz counts toward the [Phase 5 completion criteria](../../SYLLABUS.md#8-evaluation--completion-criteria-for-each-phase).

**Choose your path** after Practice 4: Practices 1–4 are the same for every path.

| Path | 24-hour machine | Cost (October 2026, check again) | ✅ proof | Practices | Time |
| :-- | :-- | :-- | :-- | :-- | :-- |
| **Main** (recommended) | a 2 GB VPS; the Pi stays the gateway | a domain about IDR 15,000–30,000/year + a VPS about IDR 80,000–200,000/month | T1, T2a, T2b, T3 | 1–10, 12 | ±10 hours |
| **Free** | the Pi runs everything, visitors come in through Cloudflare Tunnel | the domain only | T1 through the Tunnel, T2-free, T3-free | 1–4, 6, 11, 12 | ±7.5 hours |
| **Without a Pi** | a VPS; the laptop becomes the gateway ([the Module 26 pattern](../module-26-docker-compose/README.md#67-laptop-path-the-stand-in-for-l4-then-the-gateway-on-the-same-laptop-525-minutes)) | as the main path | T1–T3; T3 = the laptop's Wi-Fi turned off (not tested by the author yet) | as the main path | ±10 hours |
| **Without a Kit** | as your path | as your path | T1–T3 with the simulator and the mock Garden | as your path | the same |
| **Wokwi** | as your path | as your path | as without a Kit; an ESP32 with TLS only in 🧩 Level 1 and 🔬 (not compiled by the author yet) | as your path | the same |
| **Laptop only, without a domain** | none | IDR 0 | can't pass yet: Let's Encrypt and the Tunnel need a domain | 1–4 are still useful | — |

The VPS is used in Modules 27–30 ([Syllabus §5.5](../../SYLLABUS.md#55-service-costs-phase-5)), then it may be stopped.

> [!NOTE]
> **How to use this module.**
>
> - **Marks.** ⭐ = required to pass. Practices whose title starts with **The main path:** (Practices 5, 7, 8, 9) or **The free path:** (Practice 11) are only for that path. The 🔀 boxes (**The free path:** …, **Without a Pi:** …) explain what's different on the other paths.
> - **Practices 1–4 cost nothing** and are done on the laptop and the Pi before you rent a VPS; the only thing bought earlier is the domain in 6.1, because both paths need it and waiting for the nameservers to become active can take hours.
> - **One backend per bot token.** From [7.6](#76--one-backend-per-bot-token-stop-the-laptops-backend-3-minutes) on (the free path: [11.4](#114--move-the-history-to-the-pi-the-same-fingerprint-the-laptops-backend-stops-12-minutes)), the Telegram bot token is held only by the backend on the VPS (or the Pi); the laptop becomes the development machine.
> - **The proof table**: where each requirement is proven, and its sign.
>
>   | Requirement | The main path | The free path | What you see |
>   | :-: | :-- | :-- | :-- |
>   | T1 | [12.4](#124--t1-a-friend-in-another-city-opens-your-dashboard-over-https-15-minutes) | [11.8](#118--t1-free-and-t2-free-the-dashboard-from-a-phone-the-broker-stays-at-home-6-minutes), then 12.4 | the padlock in the address bar, the **Live** badge, Node 1's numbers changing |
>   | T2a | [8.3](#83--t2a-without-tls-refused-at-8883-and-1883-unreachable-from-outside-10-minutes) | 11.8 (T2-free: 1883 and 8883 fail) | MQTTX without TLS refused; the broker log `… wrong version number` |
>   | T2b | [9.3](#93--t2b-the-vps-log-records-the-pi-bridge-over-tls-6-minutes) | — (a plain LAN bridge, [11.6](#116--the-gateway-to-the-center-on-the-same-pi-a-lan-bridge-to-center1884-8-minutes)) | `New bridge connected … as pi-bridge (p4, c1, k60, u'pi-bridge').` and `negotiated TLSv1.3` |
>   | T3 | [10.5](#105--t3-scriptscheck-late-arrivalssql-on-the-vps-no-gaps-and-no-duplicates-8-minutes) | [11.9](#119--t3-free-the-home-internet-down-for-10-minutes-the-pis-history-stays-whole-15-minutes) and [4.4](#44--a-10-minute-outage-on-the-lan-then-scriptscheck-late-arrivalssql-no-gaps-no-duplicates-11-minutes) | `scripts/check-late-arrivals.sql`: `gaps_over_12_seconds 0`, ±6 readings per minute, `duplicates 0` |
>
> - **The 🖥️ box in each practice names the machine, the tools, and the folder**: **VS Code** on the laptop (a terminal at the **project root** `mini-smart-home`, `backend`, `frontend`, or `tools`); **an SSH terminal to the VPS** (`ssh house@203.0.113.10`, folder `/home/house/mini-smart-home`); **an SSH terminal to the Pi** (folder `mini-smart-home/edge`; on the free path also the project root); **Chrome** or **Edge**, also for the VPS provider's panel, the registrar, and the Cloudflare dashboard; **a phone**; **MQTTX**; **Bruno**; **GitHub**; and **Telegram**.
> - **The Expected output boxes.** The author has no VPS, domain, or phone, so the outputs were recorded on a **Raspberry Pi 5 with Ubuntu 26.04.1 LTS (arm64)**: Docker Engine 29.1.3, Compose 2.40.3 (the Ubuntu package), headless Chrome 156, and Node 24.21.0. That one machine played the laptop, the Pi, the VPS, and "the internet" at once; boxes that use the stand-in CA are labeled **Expected output (the author's lab, stand-in CA):**.
>
>   | Your real world | The author's lab stand-in |
>   | :-- | :-- |
>   | VPS `203.0.113.10` | a one-IP container on the Docker network that plays "the internet" |
>   | Let's Encrypt | Pebble 2.10.1 (a stand-in CA): a new root every start; its chain and lifetimes aren't Let's Encrypt's |
>   | Cloudflare DNS | pebble-challtestsrv (simulated A records) |
>   | unplugging the home internet | `docker network disconnect` (packets silently dropped) |
>   | a phone and a friend in another city | headless Chrome 375/412 px wide, with name rules and the stand-in root only in the lab profile |
>   | MQTTX | mqtt.js 5.16.1 (the engine behind MQTTX) and `mosquitto_sub` |
>   | Node 1 | the `tools/` simulator as is (QoS 0 every 10 s) and the mock Garden |
>   | Cloudflare Tunnel | not connected (empty token); replaced by a small container in the project's hallway |
>   | Telegram | a mock Bot API server |
>
>   In the text, the lab names are replaced by yours (`iot.example.test` becomes `iot.yourname.my.id`, lab IPs become documentation example addresses). Times and sizes are only **examples**: numbers from the stand-in CA or the Pi aren't Let's Encrypt or VPS numbers. Times are written in WIB. How to reproduce it is in [🔬](#-technical-deep-dive-optional), the details in [📚](#-sources--image-credits).
> - **Honest status: the author hasn't tested** a real VPS (SSH, ufw, Docker from apt, an amd64 build on 2 GB), a `.my.id` domain and its nameservers, Cloudflare (a `.my.id` zone, DNS, Tunnel), Let's Encrypt production, Android and iPhone (installing the PWA, the icon's look), a mobile network, a friend in another city, an unplugged router, MQTTX, an ESP32 with TLS, Windows, macOS, Docker Desktop, Raspberry Pi OS, a 2 GB Pi, and the path without a Pi. The steps are written from the official documentation and marked where they appear. You're their first tester: don't tick an item in [✅](#-module-27-completion-checklist) that hasn't really happened.
> - macOS users: replace **Ctrl** with **Cmd** for VS Code and browser shortcuts. **Except in the terminal:** stopping a program is still **Ctrl + C**, on a Mac too. A VPS is always Linux: its commands are typed in an SSH terminal, from any laptop OS.

> [!WARNING]
> **This week's safety rules.**
>
> 1. **`.env`, `TUNNEL_TOKEN`, and key files (`*.key`, private SSH keys) never go into Git**, a forum, or an AI. The same goes for the output of `docker compose config` without `--quiet`, which prints every secret ([7.2](#72-the-vps-env-new-secrets-and-the-vps-column-of-the-values-per-place-table-10-minutes), [11.7](#117--cloudflare-tunnel-the-token-in-env-a-route-to-httpweb80-and-the-tunnel-profile-12-minutes)).
> 2. **Never `docker compose down -v`, `docker volume rm smarthome…`, or `docker system prune --volumes`.** On the VPS, Caddy's cupboard holds your account and certificates, and Let's Encrypt only issues 5 certificates with exactly the same names per week; on the Pi, the gateway's cupboard holds the queue; the `external` cupboards hold your history ([Concept 6](#6-certificates-in-full-chain-name-and-dates), [7.7](#77--docker-compose-up--d-on-the-vps-two-certificates-from-lets-encrypt-8-minutes)).
> 3. **Never open 1883 to the internet.** On the VPS, leave `MQTT_ADDRESS=127.0.0.1`, because ufw does NOT close the counters Docker opens (Concept 4, 8.3).
> 4. **No `setInsecure()`, `--insecure`, or `bridge_insecure`.** All three weaken the check of the server's ID card (Concept 8, [🧩 Level 1](#level-1--module-10s-weather-without-setinsecure-check-the-servers-id-card-a-small-change-20-minutes)).
> 5. **One backend per Telegram bot token.** A second backend with the same token is refused with `409 Conflict` (7.6).
> 6. **No port forwarding to the Pi or the laptop.** The bridge and Cloudflare Tunnel are both outgoing connections from the home (Concept 1).
> 7. **Don't close the old SSH session before logging in with the key in a second window has worked**, and allow 22 in ufw before `ufw enable` ([5.4](#54--turn-off-password-and-root-logins-00-lockconf-sshd--t-and-a-second-window-10-minutes), [5.5](#55--ufw-allow-22-first-then-80-443-and-8883-8-minutes)).

As in Modules 16–26, this module starts with the [🔁 Warm-up: your home, your address, and a site's ID card](#-warm-up-your-home-your-address-and-a-sites-id-card-30-minutes). On the first day, the warm-up, the [🏆 Quick Win](#-quick-win-a-sealed-envelope-without-an-id-card-15-minutes), Concepts 1 and 5, **buying the domain in [6.1](#61-buy-a-myid-domain-from-a-pandi-accredited-registrar-7-minutes) and [6.2](#62-cloudflares-free-plan-change-the-nameservers-then-wait-until-its-active-8-minutes)** (waiting for the nameservers to become active can take hours), then [Practice 1](#practice-1--the-workbench-a-branch-the-fingerprint-and-a-backup-15-minutes) to [Practice 3](#practice-3--dashboard-130-becomes-a-pwa-at-httplocalhost-40-minutes) on the laptop are enough; your home keeps running. The eleven concepts are read in between their practices; the order is at the start of [🧠](#-the-why-concepts). The folded parts in [🚨](#-troubleshooting) are opened when needed; the folded parts in [🔬](#-technical-deep-dive-optional) can be skipped.

## Table of contents

1. [🎯 After this module you can…](#-after-this-module-you-can)
2. [🧰 What you need](#-what-you-need)
3. [🔁 Warm-up: your home, your address, and a site's ID card (30 minutes)](#-warm-up-your-home-your-address-and-a-sites-id-card-30-minutes)
4. [🏆 Quick Win: a sealed envelope without an ID card (15 minutes)](#-quick-win-a-sealed-envelope-without-an-id-card-15-minutes)
5. [🧠 The "Why" Concepts](#-the-why-concepts)
   - [1 Three doors, two paths](#1-from-home-to-the-internet-three-doors-two-paths) · [2 VPS](#2-vps-a-rented-computer-that-runs-24-hours-a-day) · [3 SSH keys](#3-ssh-keys-and-a-regular-user-password-login-and-root-turned-off) · [4 ufw and Docker](#4-a-leaky-firewall-ufw-and-docker) · [5 Domains and DNS](#5-domains-and-dns-the-internets-phone-book) · [6 Certificates](#6-certificates-in-full-chain-name-and-dates) · [7 Caddy and `TRUST_PROXY`](#7-caddy-as-the-front-door-automatic-https-and-trust_proxy) · [8 TLS for MQTT](#8-tls-for-mqtt-door-8883-a-copy-of-the-certificate-and-a-reload) · [9 The store-and-forward bridge](#9-a-store-and-forward-bridge-who-holds-what) · [10 Cloudflare Tunnel](#10-the-free-path-cloudflare-tunnel) · [11 PWA](#11-pwa-from-a-shortcut-to-an-app)
6. [🔧 Step-by-step practice](#-step-by-step-practice)
   - [1 The workbench](#practice-1--the-workbench-a-branch-the-fingerprint-and-a-backup-15-minutes) · [2 Backend 1.4.0](#practice-2--backend-140-trust_proxy-a-persistent-broker-session-and-2-minute-manual-commands-20-minutes) · [3 A PWA at `localhost`](#practice-3--dashboard-130-becomes-a-pwa-at-httplocalhost-40-minutes) · [4 Store-and-forward at home](#practice-4--store-and-forward-at-home-first-the-lan-bridge-and-a-10-minute-outage-drill-30-minutes) · [5 VPS](#practice-5--the-main-path-rent-a-vps-and-lock-its-doors-60-minutes) · [6 Domain and DNS](#practice-6--domain-and-dns-your-own-name-in-the-internets-phone-book-25-minutes-plus-waiting-time) · [7 The center on the VPS](#practice-7--the-main-path-the-center-on-the-vps-with-https-75-minutes) · [8 Door 8883](#practice-8--the-main-path-mqtt-door-8883-with-tls-35-minutes) · [9 The TLS bridge](#practice-9--the-main-path-the-pi--vps-bridge-over-tls-35-minutes) · [10 The unplug test](#practice-10--the-10-minute-home-internet-unplug-test-30-minutes) · [11 The free path](#practice-11--the-free-path-everything-on-the-pi-and-cloudflare-tunnel-85-minutes) · [12 The phone and a friend](#practice-12--the-pwa-on-a-phone-a-mobile-network-and-a-friend-in-another-city-40-minutes) · [13 A device at another location (optional)](#practice-13--optional-a-device-at-another-location-over-mqtts-without-a-gateway-20-minutes)
   - The main path: Practices 1–10 and 12 · The free path: Practices 1–4, 6, 11, and 12
7. [🚨 Troubleshooting](#-troubleshooting)
8. [🔬 Technical Deep Dive (optional)](#-technical-deep-dive-optional)
9. [🧩 Independent Challenges](#-independent-challenges)
10. [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home)
11. [📖 Glossary](#-glossary) · [📝 Quiz](#-5-question-quiz) · [✅ Completion checklist](#-module-27-completion-checklist)

## 🎯 After this module you can…

1. **Open the dashboard to the internet** with your own domain and the padlock icon in the address bar: Caddy requests and renews Let's Encrypt certificates by itself, and `http://` is redirected to `https://`.
2. **Rent a VPS and lock its doors**: SSH keys, password and root logins turned off, and ufw. You also know that the counters Docker opens get past ufw, so the address in front of the counter decides who may knock.
3. **Write the DNS records** for `iot.` and `mqtt.`, then explain why `mqtt.` must be DNS only (the gray cloud) at Cloudflare.
4. **Read a site's ID card (certificate)**: its chain up to the ISRG Root X1 (RSA) or X2 (ECDSA) root, its name, and its dates. You also know the lifetime of Let's Encrypt certificates is getting shorter: 90 days, then 64 days from 10 Feb 2027, then 45 days from 16 Feb 2028.
5. **Put a sealed envelope on MQTT door 8883**: a copy of Caddy's certificate for Mosquitto, a reload of the VPS broker without breaking the bridge, and a weekly cron for its renewal.
6. **Make the Pi hold data while the internet is down**, then forward it later with its original `ts`, and prove "no gaps, no duplicates" with `scripts/check-late-arrivals.sql`.
7. **Explain "up is kept on the Pi, down is not"**: a lamp command during an internet outage isn't held by the broker, and the backend forgets it after 2 minutes, so it isn't carried out stale.
8. **Run the backend behind the front door** with `TRUST_PROXY`: a `Secure` cookie on `https://` and a `429` limit per visitor, not shared.
9. **Install the dashboard as an app on a phone** (PWA) and know its limits: its screen stays open while offline, but the numbers always come from the network, there are no push notifications, and a new version shows on the next opening.
10. **Move the history to a new machine** (a VPS or a Pi) and prove it with the same fingerprint, then **choose your path** (a VPS, or a Pi with Cloudflare Tunnel) and its cost.

## 🧰 What you need

The **Main** and **Free** columns show which path needs it (the **Choose your path** table above).

| What to prepare | Main | Free | Details |
| :--- | :-: | :-: | :--- |
| **The Module 26 result** on `main` | ✓ | ✓ | Backend 1.3.0, frontend 1.2.0, and a running `compose.cloud.yml`; Kit B: the `edge/compose.edge.yml` gateway on the Pi with a LAN bridge. Checked in [🔁 Step 1](#step-1--your-module-26-homes-inventory-and-the-history-fingerprint). |
| **A `.my.id` domain** from a PANDI-accredited registrar | ✓ | ✓ | Individuals may register; a verified email, an ID card (KTP) if asked (the PANDI Registration Policy v9.0, 30 Sep 2024, may have been updated since). About IDR 15,000–30,000/year: the Syllabus estimate; the author didn't find an official price ([6.1](#61-buy-a-myid-domain-from-a-pandi-accredited-registrar-7-minutes)). |
| **A Cloudflare account** on the free plan | DNS | DNS and Tunnel | Support for a `.my.id` zone hasn't been verified by the author. If it's refused, the main path uses the registrar's DNS, and the free path needs another domain ([6.2](#62-cloudflares-free-plan-change-the-nameservers-then-wait-until-its-active-8-minutes)). |
| **A VPS** with 2 GB RAM, 1–2 vCPUs, a disk ≥ 25 GB, Ubuntu Server 26.04 LTS, amd64 | ✓ | — | Example prices as of 29 Oct 2026: **IDR 80,000/month** (a local provider: 1 core, 2 GB, 60 GB) and **$12/month** (a foreign provider: 1 vCPU, 2 GiB, 50 GiB). Check again on the provider's site ([5.1](#51-choose-and-rent-a-2-gb-vps-then-paste-your-ed25519-public-key-8-minutes), [Syllabus §5.5](../../SYLLABUS.md#55-service-costs-phase-5)). |
| **A Pi** (Kit B) | gateway | center and gateway | The free path: a Pi with 2 GB or more, with a high-endurance microSD or an SSD ([Syllabus §5.3](../../SYLLABUS.md#53-kit-b--raspberry-pi-as-the-gateway-needed-from-module-12), [11.1](#111-the-pi-gets-ready-to-be-the-center-git-pull-ram-and-the-storage-card-6-minutes)). Without a Pi: the laptop becomes the gateway. |
| **A laptop with an SSH client** | ✓ | ✓ | OpenSSH (`ssh`, `scp`, `ssh-keygen`) comes with Linux, macOS, and Windows 10–11; Windows and macOS not tested by the author. |
| **A phone with a mobile data plan** | ✓ | ✓ | Opening the dashboard from outside the home Wi-Fi and installing the PWA. |
| **One friend in another city** | ✓ | ✓ | The T1 proof ([12.4](#124--t1-a-friend-in-another-city-opens-your-dashboard-over-https-15-minutes)). No friend yet? Your own phone over mobile data, noted as the stand-in. |
| **10 minutes without the home internet** | ✓ | ✓ | The T3 proof. Find out first how to cut the internet without turning off the Wi-Fi ([10.2](#102--unplug-the-home-internet-not-the-home-wi-fi-2-minutes)). |
| **MQTTX 1.13.1** | ✓ | ✓ | Since Module 11; the T2a proof ([8.3](#83--t2a-without-tls-refused-at-8883-and-1883-unreachable-from-outside-10-minutes)) and T2-free. |
| **GitHub** | ✓ | ✓ | Already there; the `feature/to-the-internet` branch is made in [1.1](#11-the-featureto-the-internet-branch-from-the-latest-main-3-minutes). |

The versions this module uses (October 2026; the Syllabus v1.0.29 records them in the Module 27 tools list):

| Component | Version | Note |
| :--- | :--- | :--- |
| `caddy` | `2.11.7-alpine` | the same as Module 26, now with HTTPS |
| `eclipse-mosquitto` | `2.1.2-alpine` | the same; door 8883 and the TLS bridge; carries the ISRG Root X1 and X2 root files |
| `cloudflare/cloudflared` | `2026.10.5` | the free path; 2026.10.6 came out on 29 Oct, the locked version is kept on purpose |
| `timescale/timescaledb`, `grafana/grafana`, `node` | `2.30.2-pg17`, `13.2.4`, `24.22.1-alpine3.24` | unchanged |
| `vite-plugin-pwa` | `2.0.0` | the only new npm package (for the frontend build only), the exact version |
| Docker Engine on the VPS | 29.x from Docker's apt repository | the latest is 29.9.2 (20 Oct 2026); the author: the Ubuntu package 29.1.3 and Compose 2.40.3 |
| Ubuntu Server on the VPS | 26.04 LTS | 24.04 LTS if the provider doesn't offer it yet |
| OpenSSH, ufw | built into Ubuntu | ed25519 SSH keys |
| Let's Encrypt | a service, not a download | Caddy requests it |
| Arduino-ESP32 | 3.3.12 | only 🧩 Level 1 and 🔬; not 4.0.0-RC1 |

**The files that change this week** (§9 of the Syllabus v1.0.29 also records the three new scripts and `edge/center-internet.conf`; match them all against `code/` in [➕ A](#a-match-your-project-the-root-edge-scripts-backend-140-and-frontend-130)):

| Place | Files |
| :--- | :--- |
| The project root | `compose.cloud.yml` (one file for the laptop, the VPS, and the Pi), `.env.example` (the block "On the internet (Module 27)"), `.gitattributes` (+ `*.sql`), README, `DATA-CONTRACT.md` 1.5, the pull request template |
| `scripts/` | three new: `copy-certificate.sh`, `renew-mqtt-certificate.sh`, `check-late-arrivals.sql` |
| `frontend/caddy/` | `Caddyfile`: the domain name, `/grafana/`, and the broker name answered with 404 |
| `edge/` | `center-internet.conf` (new), `gateway.conf`, `bridge.example.conf`, `acl-broker`, `compose.edge.yml`, `.env.example`, README; `center.conf` comments only |
| `backend/` 1.4.0 | `env.ts`, `server.ts`, `mqtt.ts`, `commands.ts` and their tests, `bruno/environments/internet.yml`, `.env.example`, `package.json`, README |
| `frontend/` 1.3.0 | `vite.config.ts`, `index.html`, the icons in `public/` and `favicon.svg`, `src/api.ts`, `SwitchButton.tsx`, `package.json` and the lock, README |
| `grafana/`, `tools/` | README only |
| Unchanged | the firmware of Node 1 1.6.0 and Node 2 1.0.0, the migrations `001…010`, the Grafana provisioning |

**The time** is ±10 hours for the main path and ±7.5 hours for the free path, not counting the wait for the domain and DNS to become active: the warm-up 30 minutes, the Quick Win 15, the concepts ±100, the practice 405 (the free path 255; the optional Practice 13 +20), ➕ 30, and the quiz and checklist 20.

## 🔁 Warm-up: your home, your address, and a site's ID card (30 minutes)

> 🖥️ **Tools used:** **VS Code** on the laptop (a terminal at the project root), **an SSH terminal to the Pi** (folder `mini-smart-home/edge`, Kit B), **Chrome** or **Edge**, and **a phone** on the home Wi-Fi.

Five things to warm up with, all of them only **read**: nothing is started or changed. Copy [`worksheet.md`](code/warmup/worksheet.md) (**Copy raw file**) to `learn-iot/module-27/warmup.md` and fill in the **Yours** column, without passwords, tokens, the contents of `.env`, or your home's public IP. **Later in …** points to where it gets used.

### Step 1 — Your Module 26 home's inventory and the history fingerprint

In the laptop's terminal at the project root: `docker compose ps -a`. A healthy home: `backend`, `db`, and `grafana` `Up … (healthy)`, `mosquitto` and `web` `Up`, the one-off services (`broker-account`, `migrate`, `grafana-account`) `Exited (0)`. Kit B, the same on the Pi (folder `edge`): `smarthome-gateway-mosquitto-1` `Up`.

Then take the history fingerprint with the [Module 26](../module-26-docker-compose/README.md#12--stop-the-data-writers-then-take-the-historys-fingerprint-with-scriptsfingerprintsql-8-minutes) script (bash/zsh):

```text
docker compose exec -T db psql -U postgres -d smarthome < scripts/fingerprint.sql
```

PowerShell (not tested by the author): `Get-Content scripts/fingerprint.sql | docker compose exec -T db psql -U postgres -d smarthome`.

**Expected output (the author's lab; your numbers differ):**

```text
 readings |           fingerprint            | summaries | chunks | jobs | accounts | devices
----------+----------------------------------+-----------+--------+------+----------+---------
     2296 | 5f3a77fd8df10b214810c0b2330f9704 |       383 |      9 |    3 |        2 |       3
(1 row)
```

The numbers change while data comes in; today, just get to know its shape. **Later in [7.5](#75--move-the-history-to-the-vps-backup-scp-restore-then-the-same-fingerprint-14-minutes) (the free path: [11.4](#114--move-the-history-to-the-pi-the-same-fingerprint-the-laptops-backend-stops-12-minutes)):** the fingerprint is taken again after the data is stopped, and after the move it must be exactly the same.

### Step 2 — Your home's address on the internet: the router versus a "what's my IP" site

*Not recorded by the author (it needs a router and a phone).* Open the router's admin page (its address is usually on its sticker) and look for the **WAN** or **Internet** address. Then, from a phone on the home Wi-Fi, open a "what's my IP" site (search for "what is my IP"; compare the IPv4). **The same** = your router holds its own public address. **Different** (for example its WAN is `100.64.x.x` or `10.x.x.x`) = your internet provider uses **shared NAT** (often called CGNAT): many homes share one public address, so visitors from the internet can't knock on your home, with or without port forwarding. On the worksheet, write SAME or DIFFERENT, without the numbers.

**Later in [Concept 1](#1-from-home-to-the-internet-three-doors-two-paths):** the Pi bridge and Cloudflare Tunnel are both **outgoing** connections from the home, without a door in the router, so they work in both cases.

### Step 3 — The internet's phone book: `nslookup`, A records, CNAME, and TTL

In any terminal (the author only tried Linux), ask the public DNS `1.1.1.1` about the Module 10 weather server:

```text
nslookup api.open-meteo.com 1.1.1.1
```

**Expected output (the author's lab, the real internet, 30 Oct 2026; it can change):**

```text
Server:		1.1.1.1
Address:	1.1.1.1#53

Non-authoritative answer:
Name:	api.open-meteo.com
Address: 188.40.99.226
Name:	api.open-meteo.com
Address: 167.114.211.86
```

Every `Address:` after a `Name:` = one **A** record (name → IP); this name has two servers. Then, one by one:

```text
nslookup open-meteo.com 1.1.1.1
nslookup -type=CNAME www.github.com 1.1.1.1
nslookup -debug open-meteo.com 1.1.1.1
```

In the author's lab: `open-meteo.com` → `104.21.40.60` and `172.67.178.9`, **Cloudflare** addresses, not Open-Meteo's server; `www.github.com` → `canonical name = github.com.`, a **CNAME** record (another name for a name); `-debug` → `ttl = 300`, the **TTL** = how many seconds an answer may be remembered (it can be smaller: the time left in `1.1.1.1`'s store). **Later in [Concept 5](#5-domains-and-dns-the-internets-phone-book) and [6.4](#64--nslookup-the-internets-phone-book-knows-your-name-now-5-minutes):** that Cloudflare address, then `nslookup` of your own name.

### Step 4 — A site's ID card: chain, name, and dates

In Chrome or Edge, open `https://api.open-meteo.com` (its content is a JSON error text; that's normal). Click the icon on the left of the address bar, then open its certificate details (the menu differs per version; not recorded by the author). Note three things: the **name** it vouches for, the **issuer** and its chain up to the **root**, and the **validity dates**.

**Result (the author's lab, 30 Oct 2026, through `openssl s_client`, not a browser):** two servers taking turns, two chains. `167.114.211.86` (an ECDSA key): `*.open-meteo.com` ← `YE2` (Let's Encrypt) ← `Root YE` ← **ISRG Root X2**, valid 31 Aug – 29 Nov 2026 (90 days). `188.40.99.226` (an RSA key): `open-meteo.com` ← `YR1` ← `Root YR` ← **ISRG Root X1**. The ECDSA server also **sends** an X2 card signed by X1 for clients that only know X1 (for example the Pi bridge); `openssl` stops at X2. Let's Encrypt certificates issued from 10 Feb 2027 on are valid for 64 days. `https://open-meteo.com` (through Cloudflare) has another issuer: `WE1` (Google Trust Services).

`setInsecure()` in [Module 10](../../phase-2-connectivity/module-10-wifi-and-http/README.md#8-https-and-setinsecure-a-sealed-envelope-whose-courier-isnt-checked) skips all three of these checks. **Later in [🏆](#-quick-win-a-sealed-envelope-without-an-id-card-15-minutes) and [Concept 6](#6-certificates-in-full-chain-name-and-dates):** a card whose chain fails, then your own name's card.

### Step 5 — Who is using counters 80, 443, 1883, and 8883?

Module 27's counters: 80 and 443 (web), 1883 (the plain broker), 8883 (the TLS broker). Programs outside Docker:

- Linux and the Pi: `ss -ltnp` (the fourth column = address:counter; the program's name needs `sudo`).
- macOS: `lsof -nP -iTCP -sTCP:LISTEN` *(not tested by the author)*.
- Windows (PowerShell): `Get-NetTCPConnection -State Listen | Where-Object LocalPort -in 80,443,1883,8883` *(not tested by the author)*.

The counters Docker opened:

```text
docker ps --format 'table {{.Names}}\t{{.Ports}}'
```

After Module 26, 80 is usually used by `web` and 1883 by the central `mosquitto`; 443 and 8883 are free (`443/tcp` without `->` = not reserved). **Later in [2.3](#23-the-module-27-composecloudyml-and-the-on-the-internet-block-in-the-laptops-env-4-minutes):** Module 27's Compose on the laptop reserves `127.0.0.1:443` and `127.0.0.1:8883`. Used by another program (a VPN, a web server)? Note it: the counter is moved through `PORT_HTTPS` / `PORT_MQTTS` in `.env` ([🚨](#-troubleshooting): `port is already allocated`).

<details>
<summary>Self-test answer key</summary>

1. **Step 2: why over the home Wi-Fi?** Over mobile data, what you see is your mobile operator's address.
2. **Step 4: once X1, once X2. Is that wrong?** No: two servers, two kinds of keys, two chains, both ending at a trusted root.

</details>

## 🏆 Quick Win: a sealed envelope without an ID card (15 minutes)

> 🖥️ **Tools used:** **VS Code** in the `learn-iot` repository with its terminal, **Docker**, and **Chrome** (Edge, Windows, and macOS not tested by the author).

The two HTTPS protections from [Module 10's Concept 8](../../phase-2-connectivity/module-10-wifi-and-http/README.md#8-https-and-setinsecure-a-sealed-envelope-whose-courier-isnt-checked) are now seen apart: **a sealed envelope** (the contents encrypted) without **the courier's ID card** (the certificate) vouched for by **a trusted organization**. One Caddy container serves one page over `https://` with a card it made itself. IDR 0, every path; the "Mini Smart Home" project isn't touched.

> [!NOTE]
> **Practice only, the warning is on purpose.** The browser's loud warning in Step 3 is exactly what we want to see. On a real site, a warning like that means **stop**, especially on a page that asks for a password. The counter is only `127.0.0.1:8443` (this laptop only) and is taken down in Step 6.

### Step 1 — Read `compose.yaml` and `Caddyfile`, then start it with `docker compose up -d` (3 minutes)

1. In the `learn-iot` repository, make the folder `module-27/quick-win` with a folder `page` inside it.
2. In the `quick-win` folder, make the following two files (**Copy raw file** from [`compose.yaml`](code/quick-win/compose.yaml) and [`Caddyfile`](code/quick-win/Caddyfile)), then save (**Ctrl + S**). The name `Caddyfile` has no extension and a capital C.

```yaml
# compose.yaml - Module 27 Quick Win: a sealed envelope without an ID card.
# This file's name is Docker Compose's DEFAULT name, so in this folder this is enough: docker compose up -d   (without -f)
# PRACTICE ONLY: Caddy serves one page over HTTPS with a certificate it made ITSELF ("Caddy Local Authority"), which no
# browser knows. The browser will warn you: that's exactly what we want to see. It can only be opened from this laptop
# (127.0.0.1), and it is taken down in the last step with: docker compose down
services:
  envelope:
    # the same image as the project's front door (the web service), an exact tag, no "latest"
    image: caddy:2.11.7-alpine
    ports:
      # left = the counter on your laptop (8443, so it doesn't clash with 443), right = the HTTPS port inside the container.
      # 127.0.0.1 = this laptop only, not the whole Wi-Fi.
      - "127.0.0.1:8443:443"
    volumes:
      # the Caddy settings and the practice page from this folder, read-only (:ro)
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - ./page:/srv:ro
    # No cupboard: the certificate Caddy makes is only kept inside the container and is lost at "docker compose down".
```

```text
# Caddyfile - Module 27 Quick Win: HTTPS with a certificate Caddy makes itself (tls internal).
{
	# no "admin counter" (2019), as in the project
	admin off
	# Caddy usually tries to install its root certificate into the computer's list of trusted roots. Inside a container that
	# is useless (your laptop's list of roots isn't touched), so it is skipped.
	skip_install_trust
}

# The site address: the name localhost. Caddy serves HTTPS on port 443 of the container (counter 8443 on the laptop).
localhost {
	# "tls internal" = the certificate is issued by Caddy's own local issuer ("Caddy Local Authority"), not Let's Encrypt.
	# The connection's contents are still encrypted, but the browser doesn't know the issuer, so the site's identity isn't proven.
	tls internal
	root * /srv
	file_server
}
```

Read the comments. The gist: your project's front-door image (there since Module 26), counter 8443 (not 443), and `tls internal` = a card from Caddy's own local issuer, not Let's Encrypt.

3. Make `page/index.html`, fill it with [`index.html`](code/quick-win/page/index.html) (**Copy raw file**), then save.

4. Right-click the `quick-win` folder → **Open in Integrated Terminal**, then:

```text
docker compose up -d
```

**Expected output (the author's lab; your times differ):**

```text
[+] Running 2/2
 ✔ Network quick-win_default       Created                                                    0.1s
 ✔ Container quick-win-envelope-1  Started                                                    0.7s
```

The project name = the folder name. `docker compose ps` says `Up`, with the counter `127.0.0.1:8443->443/tcp`.

### Step 2 — Caddy makes its own ID card: `docker compose logs` (2 minutes)

```text
docker compose logs
```

**Expected output (the author's lab; cut from 24 JSON lines):**

```text
"msg":"root certificate trust store installation disabled; unconfigured clients may show warnings"
"msg":"enabling automatic TLS certificate management","domains":["localhost"]
"msg":"certificate obtained successfully","identifier":"localhost","issuer":"local"
```

The card for `localhost` is issued in a blink by the local issuer (`"issuer":"local"`). The first line: its root isn't installed anywhere (`skip_install_trust`), so not a single browser knows it. Three `warn` lines are normal: `admin endpoint disabled` (`admin off`), plus `HTTP/2 skipped …` and `HTTP/3 skipped …` (the HTTP redirector on the container's port 80).

### Step 3 — Open `https://localhost:8443`: the warning `Your connection is not private` (3 minutes)

In Chrome, open `https://localhost:8443` (with the `https://`).

**Result (the author's lab, Chrome 156 in English; on Linux the language follows the system language):** the tab title `Privacy error`, the page heading `Your connection is not private`, the code `NET::ERR_CERT_AUTHORITY_INVALID`, the **Advanced** button, and the blue **Back to safety** button.

Read first; don't rush to click. The code means "the issuer of this ID card is unknown": Chrome can't be sure that whoever answers really is `localhost` and not an impostor.

### Step 4 — Its ID card: issued by Caddy Local Authority, the chain fails (3 minutes)

Click the icon on the left of the address bar, then open its certificate details (the menu names differ per version). Check three things as in [🔁 Step 4](#step-4--a-sites-id-card-chain-name-and-dates).

**Result (the author's lab, through `openssl`; this window can't be recorded):** the `localhost` card is valid for **12 hours**, signed by `Caddy Local Authority - ECC Intermediate` (valid for 7 days), which is signed by `Caddy Local Authority - 2026 ECC Root`; the verdict is `Verify return code: 20 (unable to get local issuer certificate)`.

The **name** matches and the **dates** are still valid. Only the **chain** fails: its root only exists inside this container ([Concept 6](#6-certificates-in-full-chain-name-and-dates)).

### Step 5 — Proceed on purpose: encrypted, but its identity isn't proven (2 minutes)

Only in this practice: click **Advanced** (it becomes **Hide advanced**), then the link **Proceed to localhost (unsafe)** below it. The page `Hello from a sealed envelope` appears. The connection is TLS 1.3, so its contents are sealed from eavesdroppers, but no trusted organization vouches for who is answering. This is Module 10's `setInsecure()` seen from the browser; the difference is that the ESP32 never warns you.

Steps 3 and 5 on screen in the author's lab (headless Chrome 156 on Linux):

![Composite of three real screenshots of Chrome 156 in English (en-US) on Linux, laptop 1280 pixels, for the Quick Win: https://localhost:8443 served by Caddy 2.11.7 with its own certificate (tls internal). Top left, step 3: a red triangle, the title Your connection is not private (number 1), the sentence Attackers might be trying to steal your information from localhost (for example, passwords, messages, or credit cards), the code NET::ERR_CERT_AUTHORITY_INVALID (number 2), the enhanced protection box, the Advanced button on the left (number 4) and the blue Back to safety button on the right (number 3), the right choice for a real site. Top right, after clicking Advanced: the button becomes Hide advanced, then the sentence This server could not prove that it is localhost; its security certificate is not trusted by your computer's operating system (number 4) and the link Proceed to localhost (unsafe) (number 5), only for this practice. Bottom left, after that link: the page Hello from a sealed envelope (number 6), the content encrypted but the site's identity not proven, the same as setInsecure() in Module 10. Under it a note box for step 4, not captured because the address bar does not show: according to openssl, the leaf localhost is valid for 12 hours, issued by Caddy Local Authority - ECC Intermediate, root Caddy Local Authority - 2026 ECC Root, Verify return code 20 (unable to get local issuer certificate). A numbered legend at the bottom right.](assets/envelope-without-id-card.png)

### Step 6 — Take it down with `docker compose down`, leaving nothing behind (2 minutes)

```text
docker compose down
```

**Expected output (the author's lab, shortened):**

```text
 ✔ Container quick-win-envelope-1  Removed                                                    0.8s
 ✔ Network quick-win_default       Removed                                                    0.1s
```

Caddy's self-made card is gone with it (no cupboard); counter 8443 is free again.

**Three ways to talk to a server** (Module 10 Concept 8, completed):

| | Contents encrypted? | Identity checked? | On the ESP32 | In the browser |
| :-- | :-: | :-: | :-- | :-- |
| Plain HTTP (a postcard) | no | no | `http://…` | the Module 26 dashboard on the home Wi-Fi |
| HTTPS without an ID card | yes | no | `setInsecure()` | this Quick Win |
| HTTPS with an ID card | yes | yes | `setCACert()` or a root bundle | this week: `https://iot.yourname.my.id` ([7.8](#78--the-padlock-at-httpsiotyournamemyid-308-logging-in-and-the-secure-cookie-6-minutes); the free path [11.8](#118--t1-free-and-t2-free-the-dashboard-from-a-phone-the-broker-stays-at-home-6-minutes)) |

> ➡️ **Next:** an ID card that every phone recognizes needs your own domain name, and that's what [Concept 5](#5-domains-and-dns-the-internets-phone-book) and [Concept 6](#6-certificates-in-full-chain-name-and-dates) are about. Read [Concept 1](#1-from-home-to-the-internet-three-doors-two-paths) and Concept 5 first, then buy your domain in [6.1](#61-buy-a-myid-domain-from-a-pandi-accredited-registrar-7-minutes) and [6.2](#62-cloudflares-free-plan-change-the-nameservers-then-wait-until-its-active-8-minutes) today: waiting for the nameservers to become active can take hours. Your home keeps running during [Practice 1](#practice-1--the-workbench-a-branch-the-fingerprint-and-a-backup-15-minutes) to [Practice 4](#practice-4--store-and-forward-at-home-first-the-lan-bridge-and-a-10-minute-outage-drill-30-minutes).

## 🧠 The "Why" Concepts

These eleven concepts don't need to be read all at once. Read them in between their practices:

1. The Quick Win (you've done it) → Concept 1 and Concept 5 → buy the domain in 6.1–6.2 (waiting for the nameservers to become active can take hours, so start today)
2. Practice 1 (the workbench) → the `TRUST_PROXY` part of Concept 7 → Practice 2 (backend 1.4.0)
3. Concept 11 → Practice 3 (the dashboard becomes a PWA at `http://localhost`)
4. Concept 9 → Practice 4 (store-and-forward at home first). Practices 1–4 cost nothing; after this, choose your path
5. The main path: Concepts 2–4 → Practice 5 (VPS) → 6.3–6.4 (A records to the VPS IP) → Concepts 6–7 → Practice 7 → Concept 8 → Practices 8 and 9 → Practice 10
6. The free path: 6.4 (as soon as the nameservers are active) → Concept 10 → Practice 11
7. Every path: Practice 12 (the app on the phone and a friend in another city); Practice 13 is optional (the main path)

The file excerpts, commands, and tables in the concepts part are only for reading; everything is typed and run in the practices.

Module 26 closed with a promise: the same `compose.cloud.yml` moves to a machine that runs 24 hours a day with a domain and HTTPS, the Pi bridge moves up to TLS and learns to hold data, and the dashboard becomes an app on the phone ([Module 26's Concept 10](../module-26-docker-compose/README.md#10-two-files-until-the-end-the-center-and-the-gateway)). Concepts 1–4 answer where your home lives on the internet and how its doors are guarded, Concepts 5–8 give it a name and a sealed envelope, and Concepts 9–11 make it survive outages, open the free path, and make it installable on a phone.

### 1. From home to the internet: three doors, two paths

Until Module 26, Mini Smart Home lived inside the home's fence: Node 1 sends to the gateway broker on the Pi, the LAN bridge forwards it to the center on the laptop, and the dashboard is opened at `http://localhost` or over the home Wi-Fi. As soon as the laptop sleeps, or you're away from home, everything is out of reach. The [Syllabus §2.2](../../SYLLABUS.md#22-where-the-brain-runs-over-time) table prepares two rows for Module 27 onward, and this module calls them two **paths**:

- **The main path:** the home's brain (Mosquitto, the API, the database, Grafana, the web) moves to a **VPS**, a rented computer that runs 24 hours a day (Concept 2). The Pi stays the gateway, and holds the data while the home internet is down (Concept 9).
- **The free path:** everything lives on the Pi, and the dashboard leaves the house through **Cloudflare Tunnel** ([Concept 10](#10-the-free-path-cloudflare-tunnel)). The MQTT broker only exists on the home network.

**Three doors on the VPS.** A VPS has a public IP address (this module's example is `203.0.113.10`; yours is written in the provider's panel), and anyone on the internet can knock on it. That's why only three doors are opened:

| Door | Counter | For whom | What's behind it |
| :-- | :-- | :-- | :-- |
| Web | **443** (TCP, also UDP for HTTP/3, the newest HTTP version; [🔬](#-technical-deep-dive-optional) *HSTS and HTTP/3*) and **80** | any visitor, and Let's Encrypt | 443: the dashboard, the API `/api`, and Grafana `/grafana/` over HTTPS. 80: visitors who type `http://` are redirected to `https://`. Let's Encrypt checks through 80 or 443 that your name really points at this VPS (Concepts 6–7) |
| TLS broker | **8883** | the Pi bridge, and devices at another location ([Practice 13](#practice-13--optional-a-device-at-another-location-over-mqtts-without-a-gateway-20-minutes)) | MQTT inside a sealed envelope, at the address `mqtts://` (Concept 8) |
| SSH | **22** | only you, with an SSH key | the VPS terminal (Concept 3) |

Everything else, namely the plain broker 1883, the database 5432, Grafana 3000, and the backend 8080, stays inside the VPS and can only be knocked on from that VPS itself ([Concept 4](#4-a-leaky-firewall-ufw-and-docker)).

**What stays at home.** Node 1 (firmware 1.6.0, unchanged) still sends to the Pi at `192.168.1.37:1883`, plain, with its old account. Data contract 1.5 tells two broker addresses apart: **at home** = an IP address + plain 1883; **on the internet** = a domain name (`mqtt.yourname.my.id`) + 8883 + TLS 1.2 or newer, with the certificate checked. The 1883 postcard only goes around inside the home. Only the Pi bridge leaves the house, inside the envelope, with chosen topics: `telemetry`, `status`, `vitals`, and `ack` go up, `cmd` comes down. That's [Module 12's](../../phase-2-connectivity/module-12-raspberry-pi-and-linux/README.md#1-gateway-and-edge-a-post-office-thats-always-open-at-home) promise: raw data stays at home, and only what's needed is sent out. Node-RED on the Pi stays at home too: its dashboard, which according to [Module 13's 🔬](../../phase-2-connectivity/module-13-node-red-dashboard/README.md#-technical-deep-dive-optional) waits for TLS, isn't opened to the internet and stays `http://` on the home Wi-Fi; from outside the home, use the dashboard at `https://iot.yourname.my.id`.

**No port forwarding, on both paths.** Not a single door is opened in the home router. The Pi bridge and `cloudflared` both open an **outgoing** connection from the home, the way your phone opens a website, and the traffic in both directions uses that connection: lamp commands come down the same road. So [Module 21's](../../phase-3-backend-data/module-21-device-broker-security/README.md#10-honest-traffic-at-home-is-still-in-the-clear) message, that the home broker must not be reachable from the internet, holds until the end of the curriculum. There's a second reason. If in [🔁 Step 2](#step-2--your-homes-address-on-the-internet-the-router-versus-a-whats-my-ip-site) your router's WAN address differs from the "what's my IP" address, your internet provider uses shared NAT, and your home really can't be knocked on from outside, with or without port forwarding. Outgoing connections still work.

| | The main path | The free path |
| :-- | :-- | :-- |
| The center (the brain) | a rented VPS | the same Pi as the gateway |
| Visitors come in through | Caddy on the VPS, `https://iot.yourname.my.id` | Cloudflare's edge, then the Cloudflare tunnel to Caddy on the Pi |
| HTTPS is set up by | Caddy, with a Let's Encrypt certificate | Cloudflare, at its edge |
| The broker from the internet | `mqtt.yourname.my.id:8883` (TLS) | none |
| The Pi bridge | out of the house to the VPS, over TLS | inside the Pi: gateway 1883 → center 1884, plain |
| Done in | [Practice 5](#practice-5--the-main-path-rent-a-vps-and-lock-its-doors-60-minutes), [Practice 7](#practice-7--the-main-path-the-center-on-the-vps-with-https-75-minutes)–10 | [Practice 11](#practice-11--the-free-path-everything-on-the-pi-and-cloudflare-tunnel-85-minutes) |

**One file, three places.** [Module 26](../module-26-docker-compose/README.md#10-two-files-until-the-end-the-center-and-the-gateway) promised to keep two Compose files, without a third, and that promise is kept. The same `compose.cloud.yml` runs on the laptop (as in Module 26, `http://localhost`), on the VPS (a domain, HTTPS, and door 8883), and on the free-path Pi (plus the `tunnel` profile); the gateway stays `edge/compose.edge.yml`. Only the contents of `.env` differ, for example `WEB_DOMAIN`, `MQTT_DOMAIN`, `CENTER_CONF`, and `WEB_ADDRESS`. A setting left empty means the Module 26 behavior, except for the broker counter 1883: its default is now `127.0.0.1` ([Concept 4](#4-a-leaky-firewall-ufw-and-docker)), so a Kit B laptop needs `MQTT_ADDRESS=0.0.0.0` in [1.4](#14--kit-b-mqtt_address-in-the-laptops-env-so-the-pi-bridge-stays-connected-3-minutes). The values-per-place table is in [7.2](#72-the-vps-env-new-secrets-and-the-vps-column-of-the-values-per-place-table-10-minutes).

![Diagram of two paths to the internet (Concepts 1 and 10), the Mini Smart Home after Module 27; no port forwarding on the router on either path. Left, the home: Node 2 Garden v1.0.0 over ESP-NOW to Node 1 Home v1.6.0 (firmware unchanged), plain MQTT to 192.168.1.37:1883. Raspberry Pi: the gateway mosquitto, counter 1883, edge/compose.edge.yml, store-and-forward: the queue is held on the Pi while the internet is down. Dashed box, free path only: the center on the Pi too, compose.cloud.yml with the .env Pi column (web Caddy :80, backend, db, grafana, central broker 1884 only on 172.17.0.1), the LAN bridge to center:1884 through host-gateway, cloudflared profile tunnel opening an OUTGOING tunnel to Cloudflare. Middle top, the rented VPS, the main path: Ubuntu 26.04, 2 GB, example IP 203.0.113.10; the same compose.cloud.yml, .env VPS column, CENTER_CONF=center-internet.conf; backend 1.4.0 Secure cookie; web Caddy automatic HTTPS, 80 and 443; db history moved, external cupboard; grafana through /grafana/; mosquitto 8883 TLS, 1883 local; mqtt-certificate, copy + weekly cron; open doors 22, 80/443, 8883. From the gateway: the TLS bridge out to 8883, root ISRG X1, commands come down the same way. Middle bottom, Cloudflare, the free path: HTTPS at Cloudflare's edge, then through the tunnel to web:80 on the Pi; iot. = a CNAME to the tunnel, no mqtt.: MQTT does not go through the tunnel; Cloudflare sees the traffic. Right: visitors anywhere (a phone on mobile data, a friend, the PWA) to https://iot.yourname.my.id through 443; the admin laptop, ed25519 SSH key, through 22 (ssh -L for the 127.0.0.1 counters); free-path visitors to the same address. Neither opens the router: the bridge and the tunnel are OUTGOING connections from home. Strip: backend 1.4.0, dashboard 1.3.0, data contract 1.5, firmware unchanged. Bottom, GitHub, branch feature/to-the-internet, pull request Online on the internet: HTTPS, MQTT over TLS, an outage-proof bridge, PWA; changed files: compose.cloud.yml, .env.example, Caddyfile, new center-internet.conf, gateway.conf + 4 lines, bridge.example.conf, acl-broker, the certificate scripts + check-late-arrivals.sql, backend (118 tests), frontend PWA, DATA-CONTRACT, README. Never in Git: .env, TUNNEL_TOKEN, edge/.env, edge/bridge/center.conf, SSH keys, Caddy's cupboard, backup/. Coming later: Module 28 OTA, Module 29 GitHub Actions, Module 30 Uptime Kuma and backups. Honestly: with the internet down the dashboard still says Online (stale data), the server rules stay quiet; tested on a simulated internet, not a real VPS or phone.](assets/two-paths-to-the-internet.png)

> ⬆️ **Done reading Concept 1?** Read [Concept 5](#5-domains-and-dns-the-internets-phone-book) too, then buy your domain in [6.1](#61-buy-a-myid-domain-from-a-pandi-accredited-registrar-7-minutes) and [6.2](#62-cloudflares-free-plan-change-the-nameservers-then-wait-until-its-active-8-minutes). While you wait for the nameservers to become active, do [Practice 1](#practice-1--the-workbench-a-branch-the-fingerprint-and-a-backup-15-minutes). Concepts 2–4 are only needed before [Practice 5](#practice-5--the-main-path-rent-a-vps-and-lock-its-doors-60-minutes).

### 2. VPS: a rented computer that runs 24 hours a day

Since Module 19, and again in [Module 26's Concept 8](../module-26-docker-compose/README.md#8-starting-in-order-and-coming-back-to-life-by-itself-healthcheck-depends_on-restart-policy-and-logs), the same sentence keeps coming back: the laptop sleeps, the home sleeps. The Telegram bot, the automation rules, the "Silent node" alert, and the morning report only live while the laptop is on. [A server that's always on](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#9-telegram-notifications-important-fast-and-not-chatty) only comes true this week.

A **VPS** (virtual private server) is a rented computer in a data center that runs 24 hours a day: **a second home that never sleeps**. The provider divides a big server into many virtual computers, and one of them is yours, complete with Linux, a disk, and a public IP address. Like the Pi in Module 12, a VPS has no screen: you log in over SSH (Concept 3) and type every command in a terminal. On the free path, the second home's role is played by your own Pi.

**Size: 2 GB of RAM.** [Module 26](../module-26-docker-compose/README.md#115-learning-notes-three-numbers-docker-stats-then-clean-up-the-test-project-5-minutes) measured ±486 MiB on the laptop and called it the basis for a 2 GB VPS. On the author's lab's simulated VPS, the whole center used ±517 MiB near the end of the lab: Grafana 238, the database 154, the backend 103, the web 16, and Mosquitto 6 MiB (the author's other measurements at rest: ±0.4–0.65 GB). Grafana is the biggest, and its number goes up and down ([Module 25](../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md#2-grafana-lives-next-to-the-database-one-docker-run-and-a-hallway) noted ±200–470 MiB). Add Ubuntu and Docker themselves, then the spike while images are built on the VPS (`npm ci` and Vite), and it's clear why [Syllabus §5.5](../../SYLLABUS.md#55-service-costs-phase-5) writes that 1 GB isn't enough. Choose **2 GB of RAM, 1–2 vCPUs (virtual processor cores), a disk ≥ 25 GB** (enough for the images and the history until Module 30; the author's estimate). A 2 GB swap in [5.6](#56-a-2-gb-swap-for-building-images-5-minutes), a part of the disk used as extra RAM, is the reserve during a build; the memory a build needs on a 2 GB VPS hasn't been measured by the author ([🚨](#-troubleshooting) if a build stops because it runs out of memory). You see your own VPS's numbers in [7.11](#711-docker-stats-the-vpss-ram-at-rest-3-minutes).

**The processor type.** This module assumes your VPS has an Intel or AMD processor (**amd64**; see the specifications on the provider's page), while the Pi and Apple silicon Macs have **arm64** processors. The official molds (Caddy, Mosquitto, TimescaleDB, Grafana) hold both, but the molds you build yourself are only for the processor of the machine that built them: backend and web images from a Pi or a Mac are refused by an amd64 VPS with `no matching manifest for linux/amd64` ([Module 26's Concept 11](../module-26-docker-compose/README.md#11-the-image-shop-ghcr-and-architecture)). This module's way out: build the images right on the VPS with `docker compose build` ([7.4](#74-docker-compose-build-on-the-vps-before-the-other-services-start-12-minutes)), or, if your laptop is Intel or AMD (amd64), build them and drop them off at the image shop as in [Module 26's Practice 10](../module-26-docker-compose/README.md#practice-10--the-image-shop-ghcr-by-hand-35-minutes), and the VPS only pulls them. One image for both processor types is made automatically in Module 29.

**System, location, and price.** Choose **Ubuntu Server 26.04 LTS** (if the provider doesn't offer it yet, 24.04 LTS; Docker supports both), a location in **Indonesia or Singapore** so it's close to your phone, and monthly or hourly billing. The prices the author read on 29 Oct 2026 (check again; prices change and may not include tax): **IDR 80,000/month** at one local provider (1 core, 2 GB, a 60 GB disk) and **$12/month** at one foreign provider (1 vCPU, 2 GiB, a 50 GiB disk). The Syllabus (v1.0.29) records a range of about IDR 80,000–200,000/month, and the free path still pays for the domain. The Syllabus uses the VPS in Modules 27–30, so monthly or hourly billing leaves you free to stop afterward.

**What looks after itself, and what doesn't.** According to Ubuntu's documentation, Ubuntu Server installs security updates by itself (`unattended-upgrades`, on by default) without restarting the VPS ([5.8](#58-the-vps-clock-in-utc-and-automatic-security-updates-6-minutes)). The Docker you install from Docker's repository ([5.7](#57--docker-engine-from-dockers-apt-repository-and-the-docker-group-12-minutes)) isn't included, so updating it stays a job for your own hands. A VPS can also disappear: a forgotten bill, a wrong delete, or a problem at the provider. A snapshot (a photo of the disk) in the provider's panel isn't a backup, because it's usually kept at the same provider. Until the automatic backups to another place in [Module 30](../../SYLLABUS.md#module-30--monitoring-backup-runbooks-know-first-never-lose-data), your backup is the manual recipe of [1.3](#13--a-backup-before-changing-anything-pg_dump-then-docker-compose-cp-to-backup-5-minutes) run on the VPS, with the archive then brought to the laptop with `scp` (the opposite direction of [7.5](#75--move-the-history-to-the-vps-backup-scp-restore-then-the-same-fingerprint-14-minutes)).

### 3. SSH keys and a regular user: password login and root turned off

In Module 12 you logged in to the Pi with `ssh` and a password, and that was enough because the Pi could only be knocked on from the home Wi-Fi. A VPS is another story: its door 22 is open to the whole internet, and as [Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#10-honest-traffic-at-home-is-still-in-the-clear) said about the broker, a door open to the internet gets knocked on by automatic password guessers every day. Three habits answer that.

**Log in with a key, not a password.** An SSH key is a pair of files: one kept secret on the laptop (`~/.ssh/id_ed25519`), one left with the server (`id_ed25519.pub`), as in [Module 12's 🔬](../../phase-2-connectivity/module-12-raspberry-pi-and-linux/README.md#-technical-deep-dive-optional) (the fold *Logging in without a password, using an SSH key*). Its type is **ed25519**, which Ubuntu's documentation recommends. The public key is pasted in the provider's panel when the VPS is created ([5.1](#51-choose-and-rent-a-2-gb-vps-then-paste-your-ed25519-public-key-8-minutes)), then left again for your new user ([5.3](#53-a-regular-user-house-with-sudo-and-your-ssh-key-6-minutes)). Protect the private key with a passphrase (a password that protects the key, as in Module 12), and never copy it off the laptop.

**Work as a regular user.** The `root` user may do anything, and everyone knows its name, so an attacker only has to guess its password. You make the user **`house`** and add it to the `sudo` group: ordinary commands run without special rights, and only commands that start with `sudo` run as root, after `house`'s password is asked. After that, root may not log in over SSH at all. The note from Module 26 still holds: the `docker` group equals root ([Module 26's 6.1](../module-26-docker-compose/README.md#61-pi-docker-engine-from-dockers-apt-repository-the-docker-group-and-git-20-minutes)), so on the VPS too only `house` joins that group ([5.7](#57--docker-engine-from-dockers-apt-repository-and-the-docker-group-12-minutes)).

**Turn off password login with a file of your own.** The SSH server's settings (`sshd`) are in `/etc/ssh/sshd_config`, but that file first reads every `/etc/ssh/sshd_config.d/*.conf` file, in alphabetical order, and for most settings **the first value wins**. The trap: a VPS prepared by the cloud-init tool can bring a file `50-cloud-init.conf` with `PasswordAuthentication yes`, which beats the `no` in the main file. That's why [5.4](#54--turn-off-password-and-root-logins-00-lockconf-sshd--t-and-a-second-window-10-minutes) writes a file of its own, `/etc/ssh/sshd_config.d/00-lock.conf`, which is read before `50-…`:

```text
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
```

The second line closes another way of typing a password (a question and answer on screen). Two checks tell "written correctly" from "really used": `sudo sshd -t` only checks the file's syntax (no output = correct), while `sudo sshd -T` prints the values really in use, with lowercase names (`passwordauthentication no`). Only the second proves that `50-cloud-init.conf` doesn't win.

**A second window.** After the new settings take effect, don't close the SSH session that's open. Open a second terminal and log in as `house` with the key. Does it work? Only then may the first window be closed. Does it fail? The first window, still open, is your way back to fix the settings. It's like changing the lock on your house: try the new key from outside first, before the back door is closed.

**The VPS's fingerprint.** The first SSH greeting shows the VPS's **key fingerprint**, and the laptop records it in `known_hosts`, the same as with the Pi in [Module 12](../../phase-2-connectivity/module-12-raspberry-pi-and-linux/README.md#4-ssh-a-remote-terminal) ([5.2](#52-the-first-ssh-login-and-the-host-fingerprint-5-minutes)). A VPS rebuilt with the same IP has a new fingerprint, and SSH refuses with `REMOTE HOST IDENTIFICATION HAS CHANGED` (the fix is in [🚨](#-troubleshooting)).

A password-guesser blocker like fail2ban isn't required here, because password login is already off ([🔬](#-technical-deep-dive-optional), the fold *Options not used …*). Everything in this concept comes from the Ubuntu and OpenSSH documentation; the author has no VPS, so the steps aren't recorded.

### 4. A leaky firewall: ufw and Docker

In Module 11 you met the **firewall** on the laptop, the guard that decides which incoming connections may pass ([Module 11's 1.4](../../phase-2-connectivity/module-11-mqtt-and-data-contract/README.md#14-allow-mosquitto-through-the-firewall)); on Ubuntu its name is **ufw**. On the VPS, ufw is switched on. There are two things you must understand.

**Allow 22 first.** Ubuntu's ufw is off by default. As soon as it's switched on, it refuses incoming connections that aren't on its allow list, including your own SSH if 22 isn't listed yet. That's why `sudo ufw allow 22/tcp` is written **first**, and only then `sudo ufw enable` ([5.5](#55--ufw-allow-22-first-then-80-443-and-8883-8-minutes)). Already locked out? The provider's panel usually has a web console ([🚨](#-troubleshooting)).

**ufw doesn't guard Docker's counters.** This is this week's surprise. According to Docker's documentation, Docker and ufw don't get along: packets heading for a container's counter are diverted by Docker **before** ufw's rules get to read them. Docker's page about ports even opens with a warning that publishing container ports isn't safe by default: "Publishing container ports is insecure by default." So every `ports:` line in `compose.cloud.yml` is **Docker's side door**, and ufw is never asked. `sudo ufw deny 1883` doesn't close the broker counter Docker opened.

**What decides: the address in front of the counter.** Because ufw isn't asked, the only guard left for a container's counter inside the VPS is the address written in front of it, as in [Module 26's Concept 7](../module-26-docker-compose/README.md#7-the-hallway-up-close-the-compose-network-counters-and-the-front-door):

- **`127.0.0.1`** = only the VPS itself can knock. From the internet, that counter seems not to exist.
- **`0.0.0.0`** = all of the VPS's IPv4 interfaces, meaning the whole internet.

The broker in Module 27's `compose.cloud.yml` has two counters (the `mosquitto` service in [`code/compose.cloud.yml`](code/compose.cloud.yml); you copy the whole file in [2.3](#23-the-module-27-composecloudyml-and-the-on-the-internet-block-in-the-laptops-env-4-minutes)):

```yaml
    ports:
      - "${MQTT_ADDRESS:-127.0.0.1}:${PORT_MQTT:-1883}:1883"
      - "${WEB_ADDRESS:-127.0.0.1}:${PORT_MQTTS:-8883}:8883"
```

Both now default to `127.0.0.1`. In Module 26, counter 1883 had no address at all, meaning every interface: acceptable on a laptop behind a router (with accounts, without port forwarding), but dangerous on a VPS, because the 1883 postcard would be open to the whole internet without ufw being able to stop it. On the VPS, `.env` sets `WEB_ADDRESS=0.0.0.0` (the web doors 80 and 443, and the TLS broker 8883) and leaves `MQTT_ADDRESS=127.0.0.1`; the backend still calls the broker through the hallway, `mosquitto:1883`, without going through a counter. **Never set `MQTT_ADDRESS=0.0.0.0` on a VPS.** A Kit B laptop, on the other hand, does need that line, so the Pi bridge can still come in from the home Wi-Fi ([1.4](#14--kit-b-mqtt_address-in-the-laptops-env-so-the-pi-bridge-stays-connected-3-minutes)). One more thing: `0.0.0.0` only opens IPv4 (Docker's documentation; not tested by the author), so in DNS an A record is enough; no AAAA ([6.3](#63--the-main-path-a-records-iot-and-mqtt-to-the-vps-ip-dns-only-no-aaaa-5-minutes)).

All of the project's counters on the VPS:

| Service | Counter | Who can knock | The way in |
| :-- | :-- | :-- | :-- |
| `web` (Caddy) | `0.0.0.0`: 80, 443 (TCP and UDP) | the whole internet | visitors and Let's Encrypt, directly |
| `mosquitto`, TLS | `0.0.0.0:8883` | the whole internet | the Pi bridge, devices at another location |
| `mosquitto`, plain | `127.0.0.1:1883` | the VPS itself | the backend through the hallway |
| `backend` | `127.0.0.1:8080` | the VPS itself | visitors through Caddy `/api` |
| `grafana` | `127.0.0.1:3000` | the VPS itself | visitors through Caddy `/grafana/` |
| `db` | `127.0.0.1:5432` | the VPS itself | none for visitors |
| `sshd` (a VPS program, not a container) | 22 | the whole internet (allowed by ufw) | you, with an SSH key |

You can still open the `127.0.0.1` counters from the laptop, through an SSH tunnel, `ssh -L` (for example Swagger on 8080 or DBeaver to 5432; [🧩 Level 2](#level-2--the-admin-door-through-an-ssh-tunnel-swagger-and-dbeaver-from-the-laptop-fill-in-the-blanks-25-minutes)).

Then what is ufw for? It still guards the programs that run directly on the VPS, above all `sshd`, and refuses connections to other programs on the VPS that you haven't allowed. The 80, 443, and 8883 lines in ufw ([5.5](#55--ufw-allow-22-first-then-80-443-and-8883-8-minutes)) are a note of intent; what really opens or closes a container's door is the address on the `ports:` line (the table above). The proof is taken from outside in [8.3](#83--t2a-without-tls-refused-at-8883-and-1883-unreachable-from-outside-10-minutes): a connection without TLS to 8883 is refused, and 1883 is unreachable. In the author's lab's simulated internet, with the `ports:` lines as they are, the plain 1883 was indeed unreachable from outside, but reachable from inside the "VPS" machine itself. ufw and a real VPS weren't tested by the author; the order follows Ubuntu's and Docker's documentation.

![Diagram of a leaky firewall, ufw and Docker (Concept 4): on the VPS, packets for a container counter are diverted by Docker BEFORE the ufw rules are read. Top, the way of a packet: to :22, for a program on the machine, through ufw (22/tcp ALLOW: let in; not allowed: refused) to sshd, door 22, a program on the VPS, not a container. To :443 and :1883, for a Docker counter, into Docker's NAT, which diverts the packets that match a ports: line BEFORE ufw reads them; ufw is never asked about a diverted packet. :443 goes in to web (Caddy) on counter 0.0.0.0:443. :1883 matches no line (mosquitto only on 127.0.0.1:1883): not diverted, it never arrives, and nobody answers on the public IP. What decides who may knock is the address in ports:. Middle: 0.0.0.0, all IPv4 interfaces, anyone on the internet can knock, used for web 80/443 and mosquitto 8883 (WEB_ADDRESS), an A record is enough, no AAAA; 127.0.0.1, only the VPS itself, unreachable from the internet (simulated lab: plain 1883 unreachable from outside, reachable from the VPS), from the laptop through ssh -L 5432:127.0.0.1:5432. The project's counter table on the VPS: web 80, 443, 443/udp on 0.0.0.0, open, for Let's Encrypt and visitors; mosquitto 8883 on 0.0.0.0, open, MQTT TLS for the Pi bridge and devices outside; mosquitto 1883 (MQTT_ADDRESS) on 127.0.0.1, closed, the backend through the hallway mosquitto:1883; backend 127.0.0.1:8080, grafana 127.0.0.1:3000, db 127.0.0.1:5432, uptime-kuma 127.0.0.1:3001, closed, visitors through Caddy /api and /grafana/, you through ssh -L; sshd port 22, a machine program, open if ufw allows, ed25519 SSH key, password login off. Bottom left, ufw on the VPS, the order matters: sudo ufw allow 22/tcp FIRST, then allow 80/tcp, 443/tcp, 443/udp, 8883/tcp, sudo ufw enable, sudo ufw status verbose. Bottom right: 22/tcp first so ufw enable does not lock out your SSH; ufw guards programs on the machine, the 80, 443, 8883 lines are a note of intent; ufw deny 1883 or 5432 does NOT close a Docker counter; test from outside on mobile data, MQTTX to mqtt.yourname.my.id:1883 must fail. Honestly: ufw and a real VPS were not tested by the author; the order comes from the Ubuntu and Docker docs.](assets/firewall-and-docker.png)

> ⬆️ **Done reading Concepts 2–4?** Continue to [Practice 5](#practice-5--the-main-path-rent-a-vps-and-lock-its-doors-60-minutes) (the main path: rent a VPS), then do [6.3](#63--the-main-path-a-records-iot-and-mqtt-to-the-vps-ip-dns-only-no-aaaa-5-minutes) and [6.4](#64--nslookup-the-internets-phone-book-knows-your-name-now-5-minutes) as soon as you have your VPS's IP. The free path doesn't rent a VPS: continue to [Concept 10](#10-the-free-path-cloudflare-tunnel) and [Practice 11](#practice-11--the-free-path-everything-on-the-pi-and-cloudflare-tunnel-85-minutes).

### 5. Domains and DNS: the internet's phone book

In [Module 10](../../phase-2-connectivity/module-10-wifi-and-http/README.md#1-the-home-network-router-ip-address-and-mac-address), **DNS** is the **phone book**: people remember names, devices need IP numbers. In [🔁 Step 3](#step-3--the-internets-phone-book-nslookup-a-records-cname-and-ttl) you already opened it with `nslookup`. This week you rent a name in that book and write its lines yourself. Without a name, Let's Encrypt won't give an ID card that every phone recognizes (Concept 6), and Cloudflare Tunnel has no address to announce (Concept 10). So **both paths** need a domain.

**Four players.**

| Player | In the phone book | In this module |
| :-- | :-- | :-- |
| **domain** | the name you rent per year | `yourname.my.id` |
| **registrar** | the shop where you rent the name | a PANDI-accredited registrar (PANDI runs `.id`) ([6.1](#61-buy-a-myid-domain-from-a-pandi-accredited-registrar-7-minutes)) |
| **nameserver** | the office that answers every question about your name | two Cloudflare nameservers, written in the registrar's panel ([6.2](#62-cloudflares-free-plan-change-the-nameservers-then-wait-until-its-active-8-minutes)) |
| **record** | one line "name → answer" | `iot` and `mqtt` → your VPS's IP ([6.3](#63--the-main-path-a-records-iot-and-mqtt-to-the-vps-ip-dns-only-no-aaaa-5-minutes)) |

According to the PANDI Registration Policy v9.0 (30 Sep 2024; it may have been updated since), `.my.id` is meant for individuals, organizations, or other entities; the registrar asks for a verified email, and the registry may ask for an identity document such as a KTP (the Indonesian ID card). The names `iot.` and `mqtt.` under it aren't bought again: you write them yourself as records.

**Your own, also for Let's Encrypt.** `.my.id` is on the Public Suffix List, so `yourname.my.id` counts as your own domain, not as part of one big `my.id` domain. The limit of "50 new certificates per domain per 7 days" (Concept 6) is counted for your name, not shared with every `.my.id` user.

**The record types you need to know.**

- **A** = name → IPv4 address, for example `iot` → `203.0.113.10` (replace it with your VPS's IP). The main path only needs two A lines: `iot` and `mqtt`.
- **AAAA** = name → IPv6 address. **Don't make one.** The `0.0.0.0` counters on the VPS only open IPv4 (Concept 4), so visitors who follow an AAAA line don't arrive (Docker's documentation; not tested by the author).
- **CNAME** = name → another name, like `www.github.com canonical name = github.com.` in the warm-up. The free path uses it for the tunnel route (below).
- **TTL** = how many seconds the asker may remember an answer (the warm-up: `ttl = 300`, five minutes). While setting things up, pick a small TTL: if you mistype an IP and then fix it, phones that already asked keep using the old answer until its TTL runs out.

**A question's journey.** When your friend types `https://iot.yourname.my.id`, their phone asks a **DNS resolver**, their internet provider's or `1.1.1.1`. The resolver finds out which nameserver holds your name (from the `.id` registry's records), then asks the Cloudflare nameserver, which answers `203.0.113.10`. After that the phone connects **directly** to your VPS on port 443. The phone book only gives the number; it doesn't deliver the letter. In [6.4](#64--nslookup-the-internets-phone-book-knows-your-name-now-5-minutes), `nslookup iot.yourname.my.id 1.1.1.1` asks the same thing and must answer `Address: 203.0.113.10`.

**The gray cloud versus the orange cloud.** Every A record at Cloudflare has a cloud-shaped proxy status switch:

| | **The gray cloud** (DNS only) | **The orange cloud** (proxied) |
| :-- | :-- | :-- |
| The DNS answer | your VPS's real IP | a Cloudflare address |
| Visitors connect to | your VPS, directly | Cloudflare, which forwards to the VPS |
| The ports that get through | everything the VPS opens: 80, 443, 8883 | only web ports: HTTP 80, 8080, 8880, 2052, 2082, 2086, 2095 and HTTPS 443, 2053, 2083, 2087, 2096, 8443 |
| In this module | `mqtt.` (required) and `iot.` (the main path) | the `iot.` tunnel route (the free path) |

**8883 isn't on the orange cloud's list.** Other ports need the Spectrum service, which for every TCP port is only in the Enterprise plan. An orange-cloud `mqtt.` means the Pi bridge knocks on a Cloudflare door that never opens 8883, and MQTT doesn't arrive. That's what the Syllabus means by "the `mqtt.` DNS record must be 'DNS only'". A real example from the warm-up: `api.open-meteo.com` answers Open-Meteo's own server IP (gray), while `open-meteo.com` answers `104.21.40.60`, a Cloudflare address (orange).

On the main path, `iot.` is gray too, so that only one guard looks after the ID card: Caddy on your VPS (Concepts 6–7). An orange-cloud `iot.` in front of the VPS isn't discussed or tested in this module. The consequence of the gray cloud: the VPS's IP is visible to anyone who asks. That's normal, because a VPS's address is public anyway; what guards it is the firewall and the `127.0.0.1` counters ([Concept 4](#4-a-leaky-firewall-ufw-and-docker)).

**The free path: no A record.** The home router doesn't open any door (Concept 1), so there's no "name → home IP" line. In [11.7](#117--cloudflare-tunnel-the-token-in-env-a-route-to-httpweb80-and-the-tunnel-profile-12-minutes), you make a tunnel route for `iot.yourname.my.id`; that route uses an orange-cloud CNAME line pointing at your tunnel's name (`<tunnel-id>.cfargotunnel.com`). Check for yourself in the DNS list that the line is there; the author can't be sure the dashboard always makes it. No `mqtt.` line is made, because the free path's broker only exists at home (Concept 10).

**Honest about the lab.** The author didn't buy a domain and has no Cloudflare account: the steps of Practice 6 come from the official documents, and DNS in the author's lab was simulated in Docker. How long it takes for the nameservers to become active isn't known to the author. Cloudflare's free-plan support for `.my.id` hasn't been checked by the author either. If it's refused, the main path can still write the same A records in the registrar's panel, while the free path needs another domain.

![Diagram of domains and DNS, the internet's phone book (Concept 5): yourname.my.id is rented at a registrar, its records are kept at Cloudflare. Top: 1 a PANDI-accredited registrar (the domain shop; PANDI runs .id): rent yourname.my.id, paid per year, .my.id allowed for individuals, a verified email, an ID card if asked; the nameserver field replaced with two names from Cloudflare. 2 Cloudflare free plan: add the site, paste the two nameservers at the registrar, status Active (the wait is uncertain); from then on the records are written at Cloudflare. 3 the main-path DNS records: A iot 203.0.113.10 DNS only and A mqtt 203.0.113.10 DNS only (your VPS IP, example), a small TTL of 300 s while setting up, no AAAA. Middle, a phone asks where iot.yourname.my.id is: the phone to the resolver (the provider's DNS or 1.1.1.1), to the .id registry (this name is kept at Cloudflare's nameservers), to the Cloudflare nameserver, which answers A 203.0.113.10, TTL 300; then the phone connects straight to 203.0.113.10:443; the resolver remembers the answer for the TTL; check with nslookup iot.yourname.my.id 1.1.1.1. The author's lab: a stand-in DNS in Docker, not Cloudflare. Bottom left, DNS only, the gray cloud: the answer is the real VPS IP, visitors go straight to the VPS, 443 to Caddy, 8883 to Mosquitto, your Caddy's Let's Encrypt certificate; required for mqtt., on the main path for iot. too. Bottom right, Proxied, the orange cloud: the answer is Cloudflare's IP; Cloudflare only forwards web ports, HTTP 80, 8080, 8880, 2052, 2082, 2086, 2095 and HTTPS 443, 2053, 2083, 2087, 2096, 8443; 8883 is not there, MQTT never arrives; other ports only with Spectrum, Enterprise plan; a real example, open-meteo.com answered 104.21.40.60. Lowest left, the free path, a record for the tunnel: iot CNAME tunnel-id.cfargotunnel.com, proxied (dashboard: Networking, Tunnels, Create Tunnel; Routes, Add route, Published application, Service URL http://web:80); check in the DNS list that this CNAME exists; no mqtt record, the broker is only at home. Right: .my.id is on the Public Suffix List, so Let's Encrypt's limit of 50 new certificates per week is your domain's own. Honestly: the registrar and Cloudflare steps come from the docs, the author has no account; support for a .my.id zone on Cloudflare's free plan is not checked, if refused the main path uses the registrar's DNS and the free path needs another domain.](assets/dns-phone-book.png)

> ⬆️ **Done reading Concept 5?** Buy your domain in [6.1](#61-buy-a-myid-domain-from-a-pandi-accredited-registrar-7-minutes) and change its nameservers in [6.2](#62-cloudflares-free-plan-change-the-nameservers-then-wait-until-its-active-8-minutes) now. The A records in [6.3](#63--the-main-path-a-records-iot-and-mqtt-to-the-vps-ip-dns-only-no-aaaa-5-minutes) wait for the VPS IP from [5.1](#51-choose-and-rent-a-2-gb-vps-then-paste-your-ed25519-public-key-8-minutes); meanwhile, do [Practice 1](#practice-1--the-workbench-a-branch-the-fingerprint-and-a-backup-15-minutes).

### 6. Certificates in full: chain, name, and dates

[Module 4](../../phase-0-foundations/module-04-javascript-nodejs/README.md#13-http-letters-between-programs) promised that `https://` would be covered in this module, and [Module 10's Concept 8](../../phase-2-connectivity/module-10-wifi-and-http/README.md#8-https-and-setinsecure-a-sealed-envelope-whose-courier-isnt-checked) gave HTTPS two protections: **a sealed envelope** (encryption) and **the courier's ID card** (the certificate) signed by **a trusted organization**. Since then `setInsecure()` has used the envelope without checking the card, labeled "TEMPORARY" until Module 27. Here is the full check (its preview is in [Module 10's 🔬](../../phase-2-connectivity/module-10-wifi-and-http/README.md#-technical-deep-dive-optional), the fold *What an HTTPS certificate really checks*).

**Three checks, every time it connects.** The browser, the phone, `mosquitto_sub`, and the Pi bridge check the same three things (the stock esp32 core skips the dates, [🔬](#-technical-deep-dive-optional)):

1. **The chain.** Your card (**the leaf**, for `iot.yourname.my.id`) is signed by **an intermediate**, a kind of branch office. The branch office's card is signed by **the root**, a trusted organization whose name is already built into the phone, the laptop, and the Pi. The client follows those signatures until it meets a root it knows. Failure: the browser shows `Your connection is not private`, mqtt.js (the engine behind MQTTX) writes `unable to get local issuer certificate` (research prototype).
2. **The name.** The name you typed must be written in the certificate (its Subject Alternative Name part, SAN). A `mqtt.yourname.my.id` card isn't valid for `iot.`, and it's **not valid for an IP address**: `mosquitto_sub` to `203.0.113.10` is refused (with `-d`: `certificate verify failed`, research prototype). That's why the bridge and the devices always call a name.
3. **The dates.** Today must be between "valid from" and "valid until", so the client's clock must be right. Failure: `certificate has expired` (the author's lab, Concept 8).

**The Let's Encrypt chain as of October 2026 ("Generation Y").** Let's Encrypt signs two kinds of keys, with different chains:

```text
ECDSA:  leaf ← YE1 or YE2 ← Root YE ← ISRG Root X2 ← ISRG Root X1
RSA:    leaf ← YR1 or YR2 ← Root YR ← ISRG Root X1
```

Root YE and Root YR are new roots that most devices don't know yet, so they're linked to the old roots through cross-signatures. A client stops at the first root it knows. Phones and browsers now know ISRG Root X1 and X2, so the ECDSA chain stops at **X2**, the RSA chain at **X1**. You've already seen this yourself in [🔁 Step 4](#step-4--a-sites-id-card-chain-name-and-dates): two `api.open-meteo.com` servers, two chains, one ending at X1 and one at X2. So the correct wording is: the root is **X1 (RSA) or X2 (ECDSA)**. Caddy makes an ECDSA key (P-256) unless told otherwise, and the leaf in the author's lab was indeed ECDSA. Clients that only hold X1, such as the Pi bridge (the file `ca-cert-ISRG_Root_X1.pem` that's already in the Mosquitto image) and the ESP32, still reach X1: according to Let's Encrypt's documents, the ECDSA chain the server sends also carries an X2 card signed by X1. This real chain on the Pi bridge hasn't been tested by the author yet (the lab uses a stand-in root).

**When does the root change?** X1 is trusted by the devices' root programs until about 2030 (an estimate), its own certificate file is valid until 4 Jun 2035, and Let's Encrypt hasn't announced yet when it stops linking its chains to X1. When that time comes, the Pi only has to pull a new Mosquitto image, while an ESP32 that holds a root needs new firmware (over OTA, Module 28). Don't put `preferred_chains smallest` in the Caddyfile (🔬): the shortest chain can stop at a new root that clients with X1 don't know.

**The lifetime keeps getting shorter.** Let's Encrypt certificates are valid for **90 days** until 9 Feb 2027, **64 days** from 10 Feb 2027, and **45 days** from 16 Feb 2028 (Let's Encrypt's announcement, read on 29 Oct 2026). Caddy asks the issuer for the renewal schedule (the log `got renewal info`) and then renews by itself; for Let's Encrypt, at roughly a third of the lifetime left, around day 60 of 90. What's **not** automatic is the copy for the broker (Concept 8). Let's Encrypt also stopped sending expiry warning emails on 4 Jun 2025 (OCSP, the service for checking revoked cards, also stopped on 6 Aug 2025), so nobody reminds you; a certificate monitor comes in Module 30.

**ACME: how Caddy asks for a card.** Let's Encrypt doesn't know you, so Caddy must prove it controls that name. The way is called **ACME**, and it runs automatically:

1. Caddy registers an account. Our Caddyfile has no `email` option, so the only issuer is Let's Encrypt (the ZeroSSL fallback needs an email, 🔬). An account without an email passed on the author's lab's stand-in CA; Let's Encrypt hasn't been tried.
2. Caddy asks for two cards at once: `iot.` and `mqtt.`.
3. Let's Encrypt knocks on your name from the internet through port **80** (the HTTP-01 challenge) or **443** (TLS-ALPN-01). In the author's lab, Caddy sometimes used the first, sometimes the second, so both doors must be open (Concept 7) and the A records must already point at the VPS (Concept 5). A third way, DNS-01, with no open door at all, is in 🔬.
4. It passes: the log `certificate obtained successfully`. In the author's lab that happened a few seconds after Caddy started, with the stand-in CA; the time with the real Let's Encrypt hasn't been measured by the author.

**Rate limits: don't delete Caddy's cupboard.** Let's Encrypt's *Rate Limits* document (read on 29 Oct 2026): 50 new certificates per domain per 7 days; **5 certificates for exactly the same set of names per 7 days, no exceptions**; 5 failed validations per name per account per hour. Failing over and over **pauses** issuance for that name; your account isn't blocked. The second limit is the trap. Caddy's cupboard `caddy-data` holds the ACME account, the certificates, and their keys; `docker compose down -v` deletes it, Caddy asks again, and five times in a week is used up. When it retries after a failure, Caddy automatically uses Let's Encrypt's **practice CA** (the documents call it staging, which isn't Module 29's staging environment) so the real quota isn't wasted; a separate practice step isn't needed.

![Diagram of certificates: chain, name, dates (Concept 6), the Let's Encrypt Generation Y chain as of October 2026. Left, the chain, an arrow means signed by, read from the bottom up. Top: ISRG Root X1, the old RSA 4096 root, trusted by almost every phone, laptop, and Pi. ECDSA column (Caddy's default key), from the bottom: the leaf iot.yourname.my.id (also mqtt.yourname.my.id), yours; YE1 or YE2 (intermediate); Root YE (a new root not yet trusted by phones, its X2-signed version); ISRG Root X2 (the ECDSA root; its X1-signed version is sent along for old clients); then X1. RSA comparison column: a leaf with an RSA key if Caddy is asked for RSA (Technical Deep Dive), YR1 or YR2, Root YR signed by X1, then X1. Where the chain stops: phones, laptops, browsers have X1 and X2, ECDSA stops at X2, RSA at X1; the Pi bridge uses bridge_cafile ca-cert-ISRG_Root_X1.pem, already in the Mosquitto image, through X1-signed X2 up to X1 (documentation; not tested); the ESP32 optionally embeds X1 + X2 or a CA bundle. Right, the client's three checks at every connection: 1 the chain up to a root the client already has, fails in the simulated lab: unable to get local issuer certificate; 2 the typed name is written in the certificate, mqtt.yourname.my.id, not an IP, fails: Hostname/IP does not match certificate's altnames; 3 the dates, today between valid from and valid until, the client's clock must be right, fails: certificate has expired. Browser: all pass = the padlock, a failure = Your connection is not private (the Quick Win). Middle, Let's Encrypt lifetimes keep getting shorter, Caddy renews by itself at about a third left: today 90 days, about day 60; from 10 Feb 2027 64 days, about day 43; from 16 Feb 2028 45 days, about day 30. No more expiry emails (a monitor in Module 30); shorter lifetimes do not change the root. Bottom left, ACME: Caddy proves the name through port 80 (HTTP-01) or 443 (TLS-ALPN-01), DNS must already point at the VPS; an account without email; a limit of 5 identical certificates per 7 days, do not delete Caddy's cupboard with down -v; simulated lab: Pebble about 6 s, not a Let's Encrypt number. Bottom right: X1 is trusted by root programs until about 2030, its file until 4 Jun 2035, retirement not announced; a root change: the Pi pulls a new image, the ESP32 needs new firmware (OTA, Module 28).](assets/certificate-chain.png)

The Quick Win showed the opposite: the card from Caddy Local Authority in [Quick Win Step 4](#step-4--its-id-card-issued-by-caddy-local-authority-the-chain-fails-3-minutes) passed the name and date checks, but its chain didn't reach any trusted root.

### 7. Caddy as the front door: automatic HTTPS and `TRUST_PROXY`

Since [Module 26](../module-26-docker-compose/README.md#7-the-hallway-up-close-the-compose-network-counters-and-the-front-door), Caddy in the `web` service has been **the front door** (reverse proxy): one address for the pages, the API, and Socket.IO. This week it gets two new jobs: setting up HTTPS by itself on the VPS, and telling the backend who the visitor really is. You read the second job, `TRUST_PROXY`, first, before Practice 2.

**`TRUST_PROXY`: who is the visitor really?** Behind Caddy, the backend only sees one visitor: Caddy, with the `web` container's IP in the hallway (`172.19.0.x`) and a plain HTTP connection. Two promises are held up because of it:

1. The `access` and `session` cookies never got the `Secure` attribute. Since [Module 20](../../phase-3-backend-data/module-20-user-security/README.md#5-an-httponly-cookie-not-localstorage), the backend has set them with `secure: "auto"`: `Secure` only when the request comes over HTTPS, but what's HTTPS is the visitor's connection to Caddy, not Caddy's to the backend.
2. The [login limiter](../../phase-3-backend-data/module-20-user-security/README.md#8-rate-limiting-an-hourglass-for-password-guessers) of 10 attempts per minute per IP sees one IP for every visitor, so one password guesser gets every resident refused with `429` too ([Module 26](../module-26-docker-compose/README.md#7-the-hallway-up-close-the-compose-network-counters-and-the-front-door)).

Caddy actually already leaves the visitor's details in the request headers: `X-Forwarded-For` (the visitor's address) and `X-Forwarded-Proto` (`https`). Headers like those are easy to fake, so Fastify, our backend's framework, ignores them until it's told who the **trusted proxies** are. That's `TRUST_PROXY` in backend 1.4.0 ([2.1](#21-three-changes-in-src-envts-and-serverts-mqttts-and-commandsts-8-minutes)):

| Value | Meaning |
| :-- | :-- |
| empty (the backend's default) | trusts nobody (as 1.3); for `npm run dev` without Caddy |
| `uniquelocal` | trusts proxies at private addresses (10.x, 172.16–31.x, 192.168.x, fc00::/7), including the Docker hallway where Caddy is; the `compose.cloud.yml` default |
| `true` | trusts anyone, also visitors who fake the headers: avoid it |
| a number (the old recipe `trustProxy: 1`) | refused at startup: `a number (a hop count) isn't used by Fastify 5 (it trusts nothing at all); behind Caddy write uniquelocal` |

`compose.cloud.yml` fills it in for all three places through `TRUST_PROXY: ${TRUST_PROXY:-uniquelocal}`, so an empty `TRUST_PROXY=` line in the root `.env` means `uniquelocal`, and the backend log says `trusted proxies (TRUST_PROXY): uniquelocal` ([2.4](#24--docker-compose-up--d---build-backend-trusted-proxies-and-a-persistent-session-3-minutes)). Trusting Caddy is safe because Caddy **overwrites** the `X-Forwarded-*` a visitor sends with its own. In the author's lab (simulated HTTPS, three visitors): visitor A with the wrong password 11 times → `401` ten times, then `429`; visitor B with the right password → `200` and a `Secure` cookie; visitor C, who sent a fake `X-Forwarded-For: 203.0.113.9`, was still recorded with its real address; visitor A with the right password in the same minute: still `429`. You prove it on the VPS in [7.8](#78--the-padlock-at-httpsiotyournamemyid-308-logging-in-and-the-secure-cookie-6-minutes) and [7.9](#79--429-per-visitor-not-shared-5-minutes). At the laptop's `http://localhost`, the cookie stays without `Secure`, and that's right: the page really is HTTP. Reading this part before Practice 2? You can stop here.

**Automatic HTTPS: one Caddyfile for three places.** The site address line in `frontend/caddy/Caddyfile` is now:

```text
{$WEB_DOMAIN::80} {$MQTT_DOMAIN} {
```

`{$NAME}` is filled in from the `web` service's variables, which come from `.env`. The laptop and the free-path Pi leave `WEB_DOMAIN` empty, so the site address is `:80`: plain HTTP as in Module 26, complete with the four normal `warn` lines. On the VPS, `WEB_DOMAIN=iot.yourname.my.id` and `MQTT_DOMAIN=mqtt.yourname.my.id` make Caddy ask for cards for both names, serve HTTPS on 443, redirect `http://` to `https://`, and renew its cards by itself. [Module 26's](../module-26-docker-compose/README.md#4-the-kitchen-and-the-serving-table-multi-stage-small-images-and-caddy) promise, "`:80` is simply replaced with a domain name", is kept without editing the Caddyfile. One oddity: Caddy only uses the `:80` fallback when the variable **doesn't exist**, not when it's empty, so `compose.cloud.yml` itself writes `WEB_DOMAIN: ${WEB_DOMAIN:-:80}`.

Three requirements from Caddy's documentation, and where you meet them: the A records point at the VPS ([6.3](#63--the-main-path-a-records-iot-and-mqtt-to-the-vps-ip-dns-only-no-aaaa-5-minutes)); ports 80 and 443 are open from the internet (ufw in [5.5](#55--ufw-allow-22-first-then-80-443-and-8883-8-minutes), `WEB_ADDRESS=0.0.0.0` in Concept 4); and Caddy's data cupboard lasts, because according to its documentation that data "must not be treated as a cache" (the `caddy-data` cupboard, Concept 6). In the author's lab, `http://iot.yourname.my.id` was answered with `HTTP/1.1 308 Permanent Redirect`, and the page with `HTTP/2 200` and `alt-svc: h3=":443"; ma=2592000`: Caddy also offers HTTP/3 over UDP, which is why counter `443/udp` is opened too. Caddy doesn't add HSTS (🔬).

**Five routes behind one door.**

| A visitor knocks on | Caddy takes it to |
| :-- | :-- |
| the name `mqtt.yourname.my.id` | `404` `This address is for the MQTT broker (port 8883), not the dashboard.` |
| `/api/*`, also Socket.IO | `backend:8080`, the `/api` prefix removed, `X-Forwarded-*` added |
| `/grafana/*` | `grafana:3000`, cookies given `Secure` |
| `/assets/*` | the build's files; missing ones answered with `404` |
| anything else | the dashboard (`dist/`), screen addresses answered with `index.html` with `no-cache` |

Socket.IO goes along through `wss://` at the same address, without changing `socket.ts`. Three more things:

- `CORS_ORIGIN` on the VPS must be exactly `https://iot.yourname.my.id`, without a `/` at the end. Any other origin makes the backend's guard refuse `POST` with `403`; a trailing slash now makes the backend stop at startup with the message `"…" is not a page address: …`.
- The `web` service deliberately doesn't wait for the backend (if it did, Caddy, the certificate copier, the broker, and the backend would wait for each other forever), so for the first few seconds after everything starts, `/api` is answered with `502`. That's normal.
- The free path: visitors come through `cloudflared`, which writes `X-Forwarded-*` itself (lab: a stand-in); `CADDY_TRUSTED_PROXIES=private_ranges` in the Pi's `.env` ([11.2](#112-the-root-env-on-the-pi-the-pi-column-of-the-values-per-place-table-8-minutes)) makes Caddy trust it. On the VPS and the laptop the line is empty: Caddy trusts nobody ([Concept 10](#10-the-free-path-cloudflare-tunnel)).

**Grafana over HTTPS: its link is live.** [Module 25](../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md#103-a-grafana-link-json-on-github-a-screenshot-and-a-note-on-when-to-use-which-5-minutes) promised that Grafana "can only be opened from the internet over HTTPS in Module 27". Now it lives at `https://iot.yourname.my.id/grafana/`: one name, one certificate, also through Cloudflare Tunnel. `GRAFANA_URL` in `.env` tells Grafana that address, so the links in the Telegram alert messages become `https://` too. Grafana's login page is now open to anyone on the internet, so use a strong admin password and only share a **Viewer** account ([7.10](#710-grafana-at-grafana-admin-a-viewer-account-and-the-dashboard-from-files-5-minutes)). In the author's lab, after several wrong passwords, Grafana refused even the right password for a few minutes, without saying that the account was locked.

![Diagram of Caddy as the front door (Concept 7): one frontend/caddy/Caddyfile, one address for the dashboard, the API, Socket.IO, and Grafana. Left, visitors (phone, browser, app): http://iot answered 308 to https://iot (HTTP/2, the padlock); https://mqtt is the wrong address. Middle, web = Caddy, caddy:2.11.7-alpine: HTTPS on 443 (TCP + UDP); certificate and key in the caddy-data cupboard (do not down -v); no HSTS (Technical Deep Dive); compression zstd gzip, about 1 MB of JavaScript arrives as about 300 kB; the site address {$WEB_DOMAIN::80} {$MQTT_DOMAIN}. Right, five routes: the mqtt name answered 404 with the sentence This address is for the MQTT broker (port 8883), not the dashboard.; /api/* to backend:8080, the /api prefix removed, plus X-Forwarded-For (the visitor IP) and X-Forwarded-Proto: https, the cookie Path=/auth becomes /api/auth, Socket.IO too over wss; /grafana/* to grafana:3000, the prefix kept, /grafana redirected to /grafana/, the cookie gets Secure; /assets/* to files in /srv/assets, a missing one 404; the rest to /srv (the dist/ contents), screen addresses answered with index.html, Cache-Control: no-cache also for sw.js and the manifest. Middle, one Caddyfile, three places (an empty WEB_DOMAIN in .env becomes :80 through compose.cloud.yml, because Caddy only uses its fallback when the variable does not exist): laptop, :80, HTTP at http://localhost; VPS, WEB_DOMAIN=iot.yourname.my.id, Caddy asks for the certificate, HTTPS 443, renews it itself; free-path Pi, :80, HTTPS set up by Cloudflare, CADDY_TRUSTED_PROXIES=private_ranges. Bottom, trustProxy, the backend trusts Caddy's information about visitors (simulated lab, three visitors). Without trustProxy (backend 1.3): every visitor seen as Caddy's IP (lab 172.19.0.4) and http; the login cookie without Secure; visitor A with 11 wrong passwords makes visitor B, with the right password, get 429 too; visitor C with a fake X-Forwarded-For gets 429 too. With TRUST_PROXY=uniquelocal (backend 1.4.0): each visitor's real IP and https; the cookie Secure; only visitor A 429, visitor B in with 200; C's fake header overwritten by Caddy. Backend log: trusted proxies (TRUST_PROXY): uniquelocal; a hop number such as TRUST_PROXY=1 is refused; CORS_ORIGIN must be https://iot.yourname.my.id exactly, else 403.](assets/caddy-front-door.png)

> ⬆️ **Done reading Concepts 6–7?** Continue to [Practice 7](#practice-7--the-main-path-the-center-on-the-vps-with-https-75-minutes). If you've only read the `TRUST_PROXY` part of Concept 7 before [Practice 2](#practice-2--backend-140-trust_proxy-a-persistent-broker-session-and-2-minute-manual-commands-20-minutes), go back to Practice 2; [Concept 6](#6-certificates-in-full-chain-name-and-dates) and the rest of Concept 7 wait until just before Practice 7.

### 8. TLS for MQTT: door 8883, a copy of the certificate, and a reload

[Module 11](../../phase-2-connectivity/module-11-mqtt-and-data-contract/README.md#3-a-broker-on-the-laptop-mosquitto-two-configuration-lines-and-the-firewall) kept door 8883 for this module, and [Module 21's Concept 10](../../phase-3-backend-data/module-21-device-broker-security/README.md#10-honest-traffic-at-home-is-still-in-the-clear) showed the device's username and key being read in the clear by the sniffer. On the internet, messages travel through networks owned by many people, so the broker needs **a sealed envelope** too: **TLS at door 8883**, with the address `mqtts://mqtt.yourname.my.id:8883`. The whole connection is encrypted, including the CONNECT packet that carries the password.

**The plain 1883 stays, but not to the internet.** The 1883 postcard only goes around in closed places: on the home LAN (Node 1 → the Pi, firmware 1.6.0 unchanged) and inside the VPS's hallway (backend → `mqtt://mosquitto:1883`). [Module 21's](../../phase-3-backend-data/module-21-device-broker-security/README.md#26-the-backends-broker-account-in-env-8-minutes) promise, "`mqtts://` from Module 27 on", doesn't need to be used by the backend, because that connection never leaves the VPS. The VPS's counter 1883 is only `127.0.0.1` (Concept 4); the proof is in [8.3](#83--t2a-without-tls-refused-at-8883-and-1883-unreachable-from-outside-10-minutes).

The VPS broker uses `edge/center-internet.conf` (`CENTER_CONF=center-internet.conf`): the same contents as `center.conf`, plus four lines:

```text
listener 8883
use_username_as_clientid true
certfile /mosquitto/certs/broker.crt
keyfile /mosquitto/certs/broker.key
```

Module 21's accounts, passwords, and permission list apply here too; its lowest TLS version is 1.2. **`use_username_as_clientid true` applies per door**, so it's written again under `listener 8883`. Without that line, any account, for example the test account `checker` in MQTTX, could come in from the internet with the client name `backend` or `pi-bridge`, kick the real client out, and wipe the queue the broker holds for the backend (the author's lab, before that line existed). With that line, the same attempt is recorded `as checker (p4, c1, k60, u'checker')` ([8.4](#84-through-8883-another-account-cant-borrow-a-client-name-4-minutes), [Module 21's Concept 8](../../phase-3-backend-data/module-21-device-broker-security/README.md#8-client-ids-can-be-faked-use_username_as_clientid)).

**The certificate comes from Caddy, but it can't be read directly.** Caddy already asked for the `mqtt.yourname.my.id` card together with `iot.` (Concept 7). Mosquitto 2.x starts as root, then **drops its rights** to the user `mosquitto` (uid 1883) **before** reading the certificate; Mosquitto's 2.0.0 ChangeLog already warned Let's Encrypt users. But Caddy's cupboard may only be read by root (folders `drwx------`, files `-rw-------`). Told to read Caddy's files directly, the broker stops with `Error: Unable to load server certificate "…". Check certfile.` and `Permission denied` (research prototype). Mounting Caddy's cupboard into the broker or making a symlink doesn't help: the files still belong to root.

**The certificate copier: the one-off service `mqtt-certificate`.** It uses the same Mosquitto image, runs as root, reads Caddy's cupboard **read-only**, and runs [`scripts/copy-certificate.sh`](code/scripts/copy-certificate.sh) (you read it in [8.1](#81--a-certificate-copy-for-the-broker-mqtt-certificate-and-door-8883-5-minutes)): find the newest `mqtt.` card (when a VPS has just started, wait at most 5 minutes), copy it to a temporary name in the `certificate-data` cupboard, `chown 1883:1883`, `chmod 644` for the certificate (its contents are sent to every client anyway) and `600` for the key, then rename it with `mv` so the broker never reads a half-copied file. After that, `Exited (0)`, and only then does Compose start `mosquitto`. On the laptop and the free-path Pi, `MQTT_DOMAIN` is empty: the copier writes `… skipped`, and the broker stays plain.

**Reload, not restart.** Mosquitto doesn't watch its files; a new copy is used after the broker reads it again.

| How | Result |
| :-- | :-- |
| `docker compose exec mosquitto kill -HUP 1` (**reload**, HUP) | the broker reads all its files again without being stopped: `Reloading config.`, the same PID, the bridge doesn't break (the author's lab). A key with the wrong owner only gives `Error when reloading certificate …`, and the old certificate stays in use (research prototype) |
| `docker compose restart mosquitto` (stopped, then started) | with a key with the wrong owner: a crash loop, `Restarting (1)` again and again (research prototype) |
| `docker compose kill -s SIGHUP mosquitto` | **don't**: Docker records the broker as stopped, so it isn't started again after a crash or a reboot (Module 26 research) |

Two important limits. **HUP is only for the central broker on the VPS**, after a new certificate. On the Pi gateway, after changing any file, always use `docker compose restart mosquitto` or `docker compose up -d --force-recreate mosquitto`: in the author's lab, a HUP on the gateway broker, twice out of two rounds, threw away the "blind window" queue ([Concept 9](#9-a-store-and-forward-bridge-who-holds-what); 12 readings) when the internet then went down, and the cause isn't known to the author yet. Then, after changing `acl-broker` or `*.conf` on the VPS, still `restart` right away (the Module 21 rule) and read its log: the weekly reload reads the whole configuration, so a mistyped permission list makes the broker stop on a Monday morning.

**Renewal: a weekly cron.** Caddy renews its card by itself (Concept 6), and door 443 uses the new one at once; door 8883 doesn't. In the author's lab (a short-lived stand-in CA), 443 already had a new serial number, while 8883 kept the old one until the script ran. The fix is **cron**, an alarm clock on the VPS that runs a script on a schedule (the full scheduler is in Module 30). One line in [8.6](#86--renewal-scriptsrenew-mqtt-certificatesh-and-a-weekly-cron-8-minutes):

```text
17 3 * * 1 sh /home/house/mini-smart-home/scripts/renew-mqtt-certificate.sh >> /home/house/renew-certificate.log 2>&1
```

It means: every Monday at 03:17 VPS time (usually UTC, = 10:17 WIB), run `mqtt-certificate` again, then reload the broker. The reload is done **every week**, also when the copier writes `unchanged: skipped`, because `docker compose up -d` (for example after `git pull`) also copies a new card without reloading the broker (the author's lab). With a 90-day lifetime, Caddy renews about 30 days before it ends, so a weekly schedule leaves plenty of room; even in the 45-day era, more than a week is left (calculated from Let's Encrypt's facts, not tested). Forgot the cron? A bridge that's connected keeps running, because the card is only checked during the handshake, but every **new** connection is refused (`certificate has expired`, the author's lab), including the Pi bridge after a short drop: its queue holds the data until the script is run.

**How clients check the broker.** Call the **name**, not the IP (Concept 6). The Pi bridge checks the root with `bridge_cafile /etc/ssl/certs/ca-cert-ISRG_Root_X1.pem` ([9.2](#92-pi-edgebridgecenterconf-heading-for-mqttyournamemyid8883-10-minutes)). A plain client knocking on 8883 is refused, and the broker log says `wrong version number`, then `disconnected: Protocol error.`: that's the T2a proof. `mosquitto_sub` 2.1 with `-p 8883` uses TLS and the system's root list automatically, so a plain test needs `--no-tls`. `--insecure`, `bridge_insecure`, and `setInsecure()` weaken the certificate check: never use them. TLS here is **one-way**: the broker proves itself with a certificate, the devices with their account and key; per-device certificates (mTLS) stay in [Module 21's 🔬](../../phase-3-backend-data/module-21-device-broker-security/README.md#-technical-deep-dive-optional).

**Data contract 1.5.** [`DATA-CONTRACT.md`](code/DATA-CONTRACT.md) now writes the broker address on the internet: a **domain name** (not an IP), port `8883`, **TLS 1.2 or newer**; the device checks the chain up to a root it trusts (ISRG Root X1), the name, and the dates; without that check (for example `setInsecure()`) it isn't valid; the internet broker's plain door 1883 must not be open to the internet. Accounts, topics, and message shapes are the same as at home. A device at another location that goes straight over TLS to the VPS, without a Pi and without an offline queue, is tried with the simulator in [13.2](#132-the-simulator-to-mqttsmqttyournamemyid8883-8-minutes); its ESP32 version is in [🔬](#-technical-deep-dive-optional), and the Module 10 weather sketch without `setInsecure()` in 🧩 Level 1.

![Diagram of the certificate to Mosquitto: copy, permit, reload (Concept 8). Caddy asks for the mqtt.yourname.my.id certificate, Mosquitto uses its copy on door 8883. Top: Let's Encrypt to web (Caddy, root); the caddy-data cupboard holds /data/caddy/certificates/issuer/mqtt.../ (.crt, .key, .json), folder drwx------ root, files -rw------- root: only root may read them. Then mqtt-certificate, one-off, root, runs scripts/copy-certificate.sh, Caddy's cupboard read-only: 1 find the newest .crt (wait up to 5 minutes); 2 same contents, fix the owner, unchanged; 3 copy to a temporary name .new; 4 chown 1883:1883, chmod 644 and 600; 5 rename with mv; then Exited (0). Then the certificate-data cupboard: broker.crt -rw-r--r-- 1883, broker.key -rw------- 1883. Then mosquitto with center-internet.conf: starts as root, drops its rights to mosquitto (uid 1883), only then reads certfile and keyfile, door 8883 TLS. Red line: without the copier, Mosquitto reads Caddy's cupboard directly, Permission denied, the broker stops. Let's Encrypt's issuer folder acme-v02.api.letsencrypt.org-directory (simulated lab pebble-14000-dir). The order: web asks for the certificate, mqtt-certificate waits up to 5 minutes and copies, only then mosquitto starts. Middle, reload the VPS broker (on the Pi gateway: restart, not HUP; simulated lab): right, docker compose exec mosquitto kill -HUP 1, log Reloading config., the same PID, RestartCount 0, the bridge does not break; a key with the wrong owner: Error when reloading certificate, the old certificate stays. Wrong on the VPS, docker compose restart mosquitto: a key with the wrong owner, crash loop, Restarting (1) 6 times in 12 seconds. Do not docker compose kill -s SIGHUP mosquitto: Docker records it as stopped, the broker is not started after a crash or reboot. Bottom: a 90-day certificate, about day 60 Caddy renews and 443 is new at once, the cron every Monday 03:17 VPS time makes 8883 new too. One cron line, no line break: 17 3 * * 1 sh /home/house/mini-smart-home/scripts/renew-mqtt-certificate.sh, output to renew-certificate.log; the script runs mqtt-certificate, then exec -T mosquitto kill -HUP 1. Simulated lab (Pebble, a 600 s lifetime): 8883 keeps the old serial until the script, then the new one, the same PID. Forgotten until expiry: a connected bridge keeps running, a new connection is refused certificate has expired. up -d copies without reloading, so the HUP stays weekly.](assets/certificate-to-mosquitto.png)

> ⬆️ **Done reading Concept 8?** Continue to [Practice 8](#practice-8--the-main-path-mqtt-door-8883-with-tls-35-minutes): door 8883 on the VPS uses a copy of Caddy's certificate. [Practice 9](#practice-9--the-main-path-the-pi--vps-bridge-over-tls-35-minutes) then connects the Pi bridge through the same door.

### 9. A store-and-forward bridge: who holds what

The [Syllabus](../../SYLLABUS.md#2-the-big-picture-what-we-will-build) calls the Pi gateway the **local post office**: "If the road to the center is cut, the letters are held, not thrown away." [Module 26's Concept 10](../module-26-docker-compose/README.md#10-two-files-until-the-end-the-center-and-the-gateway) admitted that promise wasn't kept yet: the LAN bridge didn't hold data, so readings published while the center was down were lost. This concept is the core of the module: the Pi gateway learns **store-and-forward**, holding the devices' messages while the bridge is down, then forwarding them later.

**Two holding shelves, two places.** In [Module 14](../../phase-2-connectivity/module-14-node-2-esp-now/README.md#7-node-1-as-a-bridge-timestamps-the-holding-shelf-and-node-2s-status), Node 1 holds Node 2's readings on the **holding shelf** in its RAM (at most 96 readings) while the router is down. The Module 27 queue lives in the **gateway** broker on the Pi, for every device in the home, and is written to the `smarthome-gateway_broker-data` cupboard, so nearly all of it survives even if the Pi switches off. Not on the VPS: a VPS can't hold messages that haven't reached it.

**Who holds what.**

| Direction | Messages | While the bridge is down |
| :-- | :-- | :-- |
| up, Pi → center | `telemetry`, `status`, `vitals`, `ack` | **held** in the Pi's queue, then sent later with their original `ts` |
| down, center → Pi | `cmd` (lamp, fan, pump) | **not kept** by any broker; the dashboard has already reported it as failed |
| down | the retained `config` (the local safety thresholds, Module 19) | arrives again as soon as the bridge connects, like every retained message |

The motto: **up is kept on the Pi, down is not**. Data contract 1.5 writes it as rule 11 in [`DATA-CONTRACT.md`](code/DATA-CONTRACT.md) (rule 13 in the [Syllabus's Appendix A](../../SYLLABUS.md#14-appendix-a--mini-smart-home-data-contract)). The message shapes don't change, so the firmware stays 1.6.0.

**The settings.** In `edge/gateway.conf`, for the whole gateway broker (the first two lines have been there since Module 26):

```text
persistence true
persistence_location /mosquitto/data/
autosave_interval 30
queue_qos0_messages true
max_queued_messages 100000
upgrade_outgoing_qos true
```

In `edge/bridge/center.conf`, the copy of `edge/bridge.example.conf` that holds the password and stays out of Git (in Practice 4 its address is still `center:1883`):

```text
connection center
address mqtt.yourname.my.id:8883
bridge_cafile /etc/ssl/certs/ca-cert-ISRG_Root_X1.pem
# …
cleansession true
local_cleansession false
notifications true
topic msh/+/telemetry out 1
topic msh/+/status out 1
topic msh/+/vitals out 1
topic msh/+/ack out 1
topic msh/+/cmd in 1
```

A `#` note is only allowed at the **start** of a line; after a setting, the note is read as part of its value.

**Why not the Syllabus settings as they are.** The Syllabus writes the bridge with `topic # out 1` and `cleansession false`, without `upgrade_outgoing_qos` and `autosave_interval`. The author set them up, then unplugged the simulated internet for 10 minutes. Two things didn't pass: some readings were lost at the start of the outage, and a command reported as failed was still carried out minutes later. The settings above close both.

**The blind window.** An internet outage doesn't announce itself: the Pi and the VPS don't know right away. A bridge is only considered dead after a 60-second keepalive passes without an answer. In the author's lab, the VPS broker declared the bridge down 82–91 seconds after the internet was unplugged, and the gateway only noticed at around 110–120 seconds. That span is called **the blind window**: the gateway thinks its bridge is still alive and keeps sending into a connection that's already dead. QoS 1 messages are safe, because the ones not answered are sent again. QoS 0 messages, the way Node 1 has published `telemetry` since Module 11, simply vanish. `topic … out 1` doesn't help: according to Mosquitto's code, the QoS that leaves the broker is the smaller of the publish QoS and the subscription QoS, so a QoS 0 message stays QoS 0. `queue_qos0_messages true` (without it, QoS 0 is thrown away) also only holds messages **after** the gateway has noticed. The author's research prototype (the lab before this module's code was finished), with the Syllabus settings and a 10-minute outage, lost 59 of 302 QoS 0 messages from a test device publishing every 2 seconds, and 12 of 61 messages at Node 1's rhythm (every 10 seconds); the QoS 1 messages were whole.

**The cure: `upgrade_outgoing_qos true`.** The gateway broker forwards messages to the bridge with its subscription QoS, which is 1, so messages in the blind window also wait for the center's answer and are sent again. This setting applies to every subscriber of the gateway broker, and that's harmless for this project. With the final code, the author's lab T3 test (an outage of 10 minutes 37 seconds): 90 Node 1 readings published at the gateway, 90 stored on the VPS, including the ones published in the blind window; 0 lost, 0 duplicates. The picture below compares two 10-minute unplugs on the same day. The Syllabus settings had a hole of 1 minute 50 seconds (10 readings) at the start of the outage, then stayed whole because the gateway had noticed; the Module 27 settings stayed whole. In other rounds the hole was 1 minute 20 seconds (7 readings) and 2 minutes (11 readings); it was always at the start of the outage.

![Composite of real screenshots of the History page of Practice living room, range 1 hour, dashboard 1.3.0 on a simulated VPS, Chrome 156 on Linux, laptop 1280 pixels, taken 18:46 WIB on 30 Oct 2026 after the simulated Pi gateway was unplugged from the simulated internet twice for 10 minutes; the simulator f00d00000001 publishes QoS 0 every 10 seconds. Top: Raw readings of the last hour (one point = one message) · 349 points; a blue Temperature (°C) line chart, axis 24 to 36, times 17:50 to 18:40. Two pink bands added by the author mark the outages: band 1 (number 1), outage 1, the original Syllabus settings, 17:53:33 to 18:03:52 WIB; at its start the line breaks, a box numbered 2 marks a gap of 1 minute 50 seconds, 17:53:29 to 17:55:19, the blind window when the internet was already down but the gateway had not noticed: 10 readings lost; the rest of band 1 keeps its line. Band 2 (number 3), outage 2, the Module 27 settings, 18:08:29 to 18:18:53 WIB: an unbroken line; check-late-arrivals.sql 84 readings, largest_gap 00:00:10, arrived_late 56, duplicates 0. Bottom left, a snippet of the table, newest first, columns Time, Temperature, Humidity: 17:55:39, 17:55:29, 17:55:19, then straight to 17:53:29 (number 4, the time jumps), 17:53:19, 17:53:09. Bottom right, the same table for outage 2 (number 6 next to its title: the chart and the table do not mark late readings, their count is arrived_late): 18:08:59, 18:08:49, 18:08:39, 18:08:29 (number 5, still every 10 seconds past the unplug time), 18:08:19, 18:08:09. A numbered legend at the bottom.](assets/late-arrivals-without-gaps.png)

**Up is kept, down is not.** `cleansession false` makes the **central** broker keep the bridge's session, including the messages coming **down** to the home. With that setting, a lamp command you press while the internet is down is kept by the center, even though the dashboard has already shown a failure toast, and is then delivered to Node 1 as soon as the bridge is back: 2 minutes 17 seconds later in the research prototype, 3 minutes 27 seconds and 4 minutes 26 seconds later in the comparison runs with the final code. A lamp or a pump that suddenly moves minutes later is dangerous; that's also why [Module 11](../../phase-2-connectivity/module-11-mqtt-and-data-contract/README.md#6-qos-regular-mail-registered-mail-and-a-courier-who-wants-a-signature) wrote "Node 1 deliberately doesn't use a persistent session". Module 27 separates the bridge's two sides. `cleansession true` = the session at the center is **clean**: the center doesn't keep `cmd` for a bridge that's down. `local_cleansession false` = the session at the gateway is **persistent**: the upward queue is still held. The central broker's log changes too: the bridge comes in with `c1` (a clean session), not `c0` as in Module 26.

Backend 1.4.0 guards it from its side ([2.1](#21-three-changes-in-src-envts-and-serverts-mqttts-and-commandsts-8-minutes)). A manual command the device hasn't carried out for more than 2 minutes is forgotten (`… not carried out for more than 2 minutes: not sent again`), while newer ones are sent again as soon as the device is heard, as its toast says. So if the internet comes back less than 2 minutes after you press the button, the lamp still turns on, late. You try this behavior in [4.5](#45--a-lamp-command-during-the-outage-up-is-kept-down-is-not-3-minutes).

**A home power cut.** The internet and the Pi die together. `persistence true` writes the queue to the cupboard only when the broker stops cleanly, or every `autosave_interval`, whose default is 1800 seconds (30 minutes). The research prototype killed the gateway broker by force (a stand-in for a power cut) ±1.5 minutes after the last save. With the default, everything queued after that save was lost, QoS 1 messages included: 45, 9, and 44 messages from three test devices. With `autosave_interval 30`: 4, 0, and 4. The price is one write to the microSD card and one log line `Saving in-memory database …` every ±30 seconds.

**Limits, status messages, and topics.**

- `max_queued_messages` = the queue limit per client, and the bridge is one client. The default of 1000 lasts ±1.5 hours for two devices at Node 1's rhythm; 100,000 lasts for days. Neither limit has been tested by the author.
- `notifications true` makes the bridge publish **the bridge status message** `$SYS/broker/connection/pi-bridge/state` on the central broker: `1` connected, `0` down, a sibling of Module 19's 📴/✅ messages. The center's permission list needs a `topic write` line for that topic in the block `7) pi-bridge`, because `#` doesn't cover topics that start with `$`. The gateway queue's contents show in `$SYS/broker/store/messages/count` (the `monitor` account, [4.3](#43--the-bridge-status-message-state-1-with-the-monitor-account-3-minutes)): up during the outage, then down again; ±60 of them are retained messages that are always there.
- The topics stay narrow as in Module 26, not `#`: only what's needed is sent out (the Module 12 promise), and `cmd` comes down through its own `in 1` line.

**No duplicates: `ts` and `ON CONFLICT`.** Late arrivals come with their original `ts`, made by the device (rule 1 of Appendix A), so they're recorded at the time they happened, not the time they arrived ([Module 17](../../phase-3-backend-data/module-17-sql-and-database-schema/README.md#10-from-the-backend-the-pool-the-1-parameter-and-duplicate-sends)). When the bridge sends again a message whose receipt was lost, the key `(device_id, ts)` with `ON CONFLICT DO NOTHING` stores it once, and the backend logs `duplicate skipped`. Because of that key, the `duplicates` column of `scripts/check-late-arrivals.sql` is always 0; the proof that means something is six readings per minute with no gap over 12 seconds ([4.4](#44--a-10-minute-outage-on-the-lan-then-scriptscheck-late-arrivalssql-no-gaps-no-duplicates-11-minutes), [10.5](#105--t3-scriptscheck-late-arrivalssql-on-the-vps-no-gaps-and-no-duplicates-8-minutes)). Very old readings still go in, also into [binders that are already compressed](../../phase-3-backend-data/module-18-timescaledb/README.md#8-columnstore-compressing-old-binders), just a bit more slowly.

**Late arrivals aren't the current state.** As soon as the bridge is back, dozens of readings arrive within a few seconds (the author's lab: 64 readings in the same second). The backend forwards them to the dashboard in order, and the card ends at the newest reading. The automation rules ignore readings whose `ts` is older than 60 seconds: in the author's lab, eight late readings above 31 °C didn't switch the fan on.

**The backend's persistent session.** A queue that reaches the center still has to reach the backend. With **a clean session** (backend 1.3.0), messages that arrive while the backend hasn't subscribed yet, for example a few seconds after the central broker is started again, vanish without a trace (the author's lab: one of four attempts). Backend 1.4.0 uses **a persistent session**: its client name is always `backend`, and the central broker holds QoS 1 messages for it while it isn't connected. That's why, every time the backend reconnects, the central broker's log says `Client backend [<IP>:<port>] disconnected: session taken over.`, then `… as backend (p4, c0, k60, u'backend').` That's normal, not an impostor. The comparison is in [🔬](#-technical-deep-dive-optional) *Clean versus persistent sessions*.

**Two notes for the Pi.** During an outage, each bridge attempt can hold up the gateway broker for a few seconds, so messages for local subscribers on the Pi are late (the author's lab: up to almost 6 seconds; Mosquitto issue #3402). The optional remedy is in [9.6](#96-the-vps-name-in-the-gateways-extra_hosts-optional-3-minutes). Then, after changing the gateway's settings, always use `docker compose restart mosquitto` or `docker compose up -d --force-recreate mosquitto`, **not** a HUP (a reload, Concept 8): in the author's lab, a HUP on the gateway threw away the blind-window queue.

**Two gaps, admitted honestly.**

1. **`Online` although the home internet is down.** Node 1 is still connected to the gateway at home, so its `offline` last will is never published. The dashboard on the VPS still says `Online`, and the **Live** badge stays green because your phone is connected to the VPS. The sign on the dashboard: ±30 seconds after the last reading, the card says `Online · last seen N minutes ago · stale data` ([10.3](#103-during-the-outage-a-stale-online-the-lamp-button-and-telegrams-silent-node-12-minutes)). The `pi-bridge/state 0` message is actually already at the center; the "Home gateway disconnected" banner that reads it is [🧩 Level 3](#level-3--a-home-gateway-disconnected-banner-the-bridge-status-message-all-the-way-to-the-dashboard-from-scratch-6090-minutes).
2. **The server rules go quiet.** During the outage, the fan rule on the server gets no new readings. Node 1 doesn't enter offline mode either, because that mode only happens when **the Pi's broker** can't be reached for 2 minutes ([Module 19](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#10-local-safety-node-1-guards-the-house-when-the-server-is-gone)), so the local fan safety doesn't switch on either. What keeps running: Node 1's automatic watering and lamp.

**The home Wi-Fi down ≠ the internet down.** The queue is on the Pi, so it only helps when **the road from the Pi to the center** is cut. When **the home Wi-Fi** dies, as in [Module 10's router unplug test](../../phase-2-connectivity/module-10-wifi-and-http/README.md#g--the-1-minute-router-unplug-test), Node 1 can't reach the Pi, and its readings from that time are still lost, except the ones recorded on Node 1's microSD card (Module 7) and Node 2's holding shelf. That's why [10.2](#102--unplug-the-home-internet-not-the-home-wi-fi-2-minutes) unplugs the internet, not the Wi-Fi.

The Syllabus v1.0.29 records these bridge settings, rule 13 of Appendix A, and that local safety limit in the §2.2 table. The next picture uses another round of the final code test (an outage of 10 minutes 24 seconds: 84 published = 84 stored).

![Diagram of a store-and-forward bridge, who holds what (Concept 9): up is kept on the Pi, down is not; the 10-minute home-internet unplug test in the simulated lab. Top: Node 1 v1.6.0, QoS 0 every 10 s, to the Pi gateway broker: a queue for the bridge (limit set to 100,000), written to the cupboard every 30 s against power cuts; the bridge to the VPS central broker: up out 1 (telemetry, status, vitals, ack) HELD while down, down cmd in 1 NOT held; the central broker, door 8883 TLS, the status pi-bridge/state 1 or 0; backend to db with the original ts, ON CONFLICT refuses duplicates. Settings: persistence, autosave_interval 30, queue_qos0_messages, upgrade_outgoing_qos, cleansession true + local_cleansession false, notifications. Middle, the timeline (simulated lab, Node 1 = the tools/ simulator, 30 Oct 2026, WIB): unplug 00:42:24, reconnect 00:52:48, down 10 minutes 24 seconds. Node 1 stays connected. The bridge per the Pi: the blind window 112 s, then retries every 5 to 30 s. Per the VPS: state 0 after 83 s, state 1 when it comes back. The bridge queue on the Pi: empty, up to 68 messages held, empty again (raw $SYS 59, 127, 59; about 60 = retained messages always there). Database: nothing arrives during the outage, then 65 late Node 1 readings within 1 second with the original ts. Events: 1 00:43:40 the Lamp button, the toast not confirmed by the device yet (504); 2 00:48:50 Grafana alert Silent node to the mock Telegram; 3 00:53:16 the bridge back in, the backend: lamp command not carried out for more than 2 minutes, not sent again. check-late-arrivals.sql: readings 84, largest_gap 00:00:10, gaps_over_12_seconds 0, arrived_late 60, duplicates 0; 84 published = 84 stored: 0 lost, 0 duplicates. 60, not 65: the last five readings arrived less than 60 s after their ts. Bottom, the Syllabus wording vs Module 27 (the power row = a research prototype): QoS 0 during the outage, 7 lost at the start vs 0; a lamp command during the outage, run when the path is back (lab 3 to 4 minutes later) vs not kept, over 2 minutes not re-sent; the Pi loses power, the queue since the last save lost (saved every 30 minutes) vs at most the last 30 seconds. Syllabus: topic # out 1, cleansession false; Module 27: narrow topics, cleansession true + local_cleansession false, + upgrade_outgoing_qos + autosave_interval 30. Honestly: during an outage the dashboard still says Online with stale data, the server rules stay quiet; home Wi-Fi down is not internet down.](assets/store-and-forward-bridge.png)

> ⬆️ **Done reading Concept 9?** Continue to [Practice 4](#practice-4--store-and-forward-at-home-first-the-lan-bridge-and-a-10-minute-outage-drill-30-minutes): these bridge settings are tried at home first, through the Module 26 LAN bridge. Concept 9 is used again in [Practice 9](#practice-9--the-main-path-the-pi--vps-bridge-over-tls-35-minutes), [Practice 10](#practice-10--the-10-minute-home-internet-unplug-test-30-minutes), and [11.9](#119--t3-free-the-home-internet-down-for-10-minutes-the-pis-history-stays-whole-15-minutes).

### 10. The free path: Cloudflare Tunnel

The free path doesn't rent a VPS: the Pi runs the center **and** the gateway, on 24 hours a day at home, and the dashboard leaves the house through **the Cloudflare tunnel** (Cloudflare Tunnel). Only the domain is paid for, because a tunnel route needs a name whose nameservers are at Cloudflare (Concept 5). The setup is in the dashed box of [the Concept 1 picture](#1-from-home-to-the-internet-three-doors-two-paths).

**A tunnel = an outgoing connection.** The `cloudflared` program on the Pi opens an **outgoing** connection to Cloudflare (its documentation: "outbound-only connections"). Visitors who type `https://iot.yourname.my.id` arrive at Cloudflare's edge, and their requests are then carried through that connection to the Pi. The router doesn't open any door, and the shared NAT from [🔁 Step 2](#step-2--your-homes-address-on-the-internet-the-router-versus-a-whats-my-ip-site) doesn't matter. According to its documentation, Tunnel is in every plan, including the free one.

**The envelope is opened at Cloudflare's edge.** HTTPS is set up by Cloudflare, not Caddy: Caddy on the Pi stays a plain `:80` as in Module 26 (`WEB_DOMAIN` empty), and `cloudflared` knocks on `http://web:80` in the same hallway. That means Cloudflare can read all of your dashboard's traffic, including the password typed when logging in. On the main path, the envelope is only opened by Caddy on your own VPS.

**MQTT doesn't go through.** A regular tunnel carries HTTP and WebSocket: the dashboard, the API, Socket.IO, and Grafana `/grafana/`. According to Cloudflare's documentation, other services such as MQTT need `cloudflared` on the client side too, and that can't be installed on an ESP32 or a regular MQTTX. So the free path's broker is **only on the home network**, as in the [Syllabus §2.2](../../SYLLABUS.md#22-where-the-brain-runs-over-time) table: no `mqtt.` record, no door 8883, and devices at another location (Practice 13) need the main path. That's the wording of T2-free in [11.8](#118--t1-free-and-t2-free-the-dashboard-from-a-phone-the-broker-stays-at-home-6-minutes): the broker can't be reached from outside. MQTT over WebSocket through the tunnel is in 🔬 (not tested by the author).

**One Pi, two projects, two brokers** (the pattern of [Module 26's 6.7](../module-26-docker-compose/README.md#67-laptop-path-the-stand-in-for-l4-then-the-gateway-on-the-same-laptop-525-minutes)):

| | The center: `compose.cloud.yml`, project `smarthome` | The gateway: `edge/compose.edge.yml`, project `smarthome-gateway` |
| :-- | :-- | :-- |
| What's in it | `web` (Caddy `:80`), `backend`, `db`, `grafana`, the central broker, `cloudflared` | the gateway broker with its queue (Concept 9) |
| Broker counter | `1884`, only on `172.17.0.1` | `1883` on the Pi's IP, still for Node 1 |

The gateway connects to `center:1884` through a plain LAN bridge, with `CENTER_ADDRESS=host-gateway` in `edge/.env` ([11.6](#116--the-gateway-to-the-center-on-the-same-pi-a-lan-bridge-to-center1884-8-minutes)): the Pi's address on Docker's default hallway (`docker0`), usually `172.17.0.1`. That's why the central broker's counter only needs to be opened on that address; with `0.0.0.0`, the plain door 1884 would also be visible on the whole home Wi-Fi without anyone needing it. An internet outage doesn't cut anything inside the Pi: readings still go into the Pi's database ([11.9](#119--t3-free-the-home-internet-down-for-10-minutes-the-pis-history-stays-whole-15-minutes)); only the dashboard can't be reached from outside.

**`cloudflared` moves to another file.** In Module 26, the `cloudflared` service (the `tunnel` profile) was written in `edge/compose.edge.yml`. From there it couldn't knock on `http://web:80`, because `web` lives in another project's hallway. Now it's in `compose.cloud.yml`, in the same hallway as `web`, still with the `tunnel` profile: it doesn't start until the Pi's `.env` says `COMPOSE_PROFILES=tunnel` ([11.7](#117--cloudflare-tunnel-the-token-in-env-a-route-to-httpweb80-and-the-tunnel-profile-12-minutes)). The Syllabus v1.0.29 records this move.

**Who is the visitor?** Free-path visitors arrive through `cloudflared`, which should write `X-Forwarded-*` itself. `CADDY_TRUSTED_PROXIES=private_ranges` makes Caddy trust proxies at private addresses, including `cloudflared` in the hallway, so the backend knows the visitor came over HTTPS (the `Secure` cookie) and from which address. The author's lab proved this with a stand-in program for `cloudflared`; the headers the real `cloudflared` sends haven't been checked by the author. Leave `WEB_ADDRESS=127.0.0.1`: visitors only come through the tunnel, while a web counter open to the home Wi-Fi lets devices at home fake their address (🔬).

**The token = the tunnel's key.** The Cloudflare dashboard gives a `TUNNEL_TOKEN` when the tunnel is created, and that token is written in the Pi's root `.env`. A token equals a password: anyone who holds it can run your tunnel, so never let it into Git, a forum, or an AI. Without a valid token, `cloudflared` crash-loops: `docker compose ps` says `Restarting (255)`, its log `Provided Tunnel token is not valid.` (the author's lab).

**The Pi as a 24-hour home.** The full center on the author's lab Pi used ±0.5 GB of RAM at rest, so a 2 GB Pi is enough to run it; building images on a 2 GB Pi hasn't been measured by the author. What wears out fastest is an ordinary microSD card, because the database writes all the time: [Syllabus §5.3](../../SYLLABUS.md#53-kit-b--raspberry-pi-as-the-gateway-needed-from-module-12) recommends a high-endurance microSD, and [Module 12's 🔬](../../phase-2-connectivity/module-12-raspberry-pi-and-linux/README.md#-technical-deep-dive-optional) shows how to boot the Pi from an SSD.

**Moving up later.** If one day you rent a VPS, do Practices 5–9: move the history with the [7.5](#75--move-the-history-to-the-vps-backup-scp-restore-then-the-same-fingerprint-14-minutes) recipe, then point the Pi bridge at `mqtt.yourname.my.id:8883`. Nothing is taken apart: the same `compose.cloud.yml` moves with the VPS column's `.env`.

The author has no Cloudflare account: the dashboard steps of Practice 11 come from the official documents (read on 29 Oct 2026), and `cloudflared` in the lab was only tried without a token.

> ⬆️ **Done reading Concept 10?** The free path: make sure your domain's nameservers are active ([6.4](#64--nslookup-the-internets-phone-book-knows-your-name-now-5-minutes)), then do [Practice 11](#practice-11--the-free-path-everything-on-the-pi-and-cloudflare-tunnel-85-minutes). On the main path, just read it for comparison, then go back to the practice you're working on.

### 11. PWA: from a shortcut to an app

In [Module 24's 9.3](../../phase-4-frontend-dashboard/module-24-control-rules-roles/README.md#93-phone-mode-for-the-admin-account-and-a-home-screen-shortcut-15-minutes), you put the dashboard on the phone's home screen through phone mode (`http://192.168.1.10:5173`, the laptop's IP). That's a **shortcut**: an `apple-touch-icon.png` icon and a name that opens the browser at that address. It only works on the home Wi-Fi ([Module 23's Concept 12](../../phase-4-frontend-dashboard/module-23-realtime-dashboard/README.md#12-a-phone-over-home-wi-fi-phone-mode-and-laptop-mode)), dies when the laptop sleeps or its IP changes, and shows the browser's error page while offline. [Module 24's 🔬](../../phase-4-frontend-dashboard/module-24-control-rules-roles/README.md#-technical-deep-dive-optional) postponed a real app until there's HTTPS. This week dashboard 1.3.0 becomes a **PWA**: a dashboard you can **install** like an app and open from anywhere. Phone mode retires for access from outside the home.

**Three requirements.**

1. **A secure context.** App features only work at `https://…` or `http://localhost`. A LAN IP doesn't count as secure: Module 24 recorded `isSecureContext` = `false` at `http://192.168.1.10:5173`. That's why the PWA is tried first at the laptop's `http://localhost` ([Practice 3](#practice-3--dashboard-130-becomes-a-pwa-at-httplocalhost-40-minutes)), then installed on the phone once the dashboard has an `https://` address.
2. **The app's business card (the manifest).** The file `manifest.webmanifest` is written by `vite-plugin-pwa` 2.0.0 during `npm run build`, from the contents of `vite.config.ts` ([3.3](#33-viteconfigts-the-manifest-the-service-worker-and-three-paths-that-always-go-to-the-network-6-minutes)): the name `Mini Smart Home`, the short name `Smart Home` under the icon, the language `en`, the start address `/`, the `standalone` display (its own window without an address bar), and icons of 64, 192, and 512 px, plus a 512 px maskable one that Android's launcher may crop into a circle. All of them come from Module 24's line-drawn house, which also replaces Vite's default lightning logo in `favicon.svg`.
3. **The service worker.** A small helper in the browser, `sw.js`, keeps the dashboard's **shell** (the page, JavaScript, CSS, icons: 10 files, ±1 MB), so the app opens fast, also while offline: the **Login** screen still shows, with the message `Can't reach the server. Check your internet connection, then try again.`, not an error page. New Chrome versions allow installing even without a service worker, but without it the app doesn't open while offline.

**The numbers always come from the network.** The shell holds not a single number. Three paths are never answered from the store: `/api` (data, logging in, commands), `/grafana`, and `/socket.io` (the `navigateFallbackDenylist` list). In the author's lab, without `/grafana` in that list, a browser that had opened the dashboard before showed the dashboard's `Page not found` at `https://iot.yourname.my.id/grafana/`. As a result, the numbers on screen are never silently stale from the phone's store, but without internet there's no offline data either, commands aren't saved to be sent later, and there are no push notifications; important news still comes through Telegram.

**Installing.** Chrome on the laptop and on Android offers it from the app install menu (its name may differ per version). The iPhone uses Safari: ⋯ → **Share** → **Add to Home Screen** → turn on **Open as Web App** → **Add** ([12.2](#122-iphone-add-to-home-screen-from-safari-6-minutes), from Apple's documentation). In the author's lab, headless Chrome 156 declared the dashboard installable (an empty list of installability errors) at `http://localhost` and on the simulated HTTPS. The installation itself, its dialog, and the icon's look on a phone haven't been tried by the author: those are your steps in [3.6](#36--the-manifest-the-service-worker-and-installing-the-dashboard-from-httplocalhost-7-minutes) and [12.1](#121--android-install-the-dashboard-from-chrome-8-minutes).

**A new version shows on the next opening.** With `registerType: 'autoUpdate'`, after the web image is rebuilt, the new version shows on the **next opening**, as soon as the browser has finished fetching it (usually a few seconds). An open tab doesn't reload by itself, so form entries are safe. In the author's lab, the first reload was still the old version, the second reload the new one ([12.5](#125-record-the-t1-proof-then-a-new-app-version-5-minutes)).

**The `npm run preview` trap.** `npm run preview` and `npm run dev` use the same address, `http://localhost:5173`. The build served by `preview` installs a service worker there, and `npm run dev` afterward keeps showing the old dashboard from the store. The fix: DevTools → **Application** → **Storage** → **Clear site data** ([3.7](#37-offline-the-dashboards-shell-stays-open-then-the-npm-run-preview-trap-3-minutes), [🚨](#-troubleshooting)). For the PWA, the Caddyfile doesn't need to change: it already serves `manifest.webmanifest` with the type `application/manifest+json` and `sw.js` with `no-cache`.

![Diagram from a shortcut to an app, PWA (Concept 11), dashboard 1.3.0; vite-plugin-pwa 2.0.0 writes the manifest and the service worker at npm run build. Top left, a shortcut on the home screen (Modules 24 to 26, phone mode): address http://192.168.1.10 (the laptop's IP); not a secure context, isSecureContext = false; only the apple-touch-icon.png 180 px icon + a name; no service worker, offline = the browser's error page; Android: opens in Chrome; the laptop's IP changes or it sleeps = a dead shortcut; outside the home Wi-Fi it cannot work. A Module 27 arrow to the right, the installed app (PWA), through the VPS or the Cloudflare tunnel, 24 hours: address https://iot.yourname.my.id (or http://localhost), a secure context; the manifest + icons 192/512 + maskable; the service worker keeps the shell; its own window (standalone); offline: the shell stays open + a clear message; from another Wi-Fi or mobile data. Middle, four parts (lab: headless Chrome 156, the install-error list empty at localhost and at the simulated HTTPS): 1 a secure address, https or localhost, Wi-Fi IP http://192.168 does not count as secure; 2 manifest.webmanifest: Mini Smart Home, start_url /, standalone, theme_color #1d293d; 3 icons pwa-192x192.png, pwa-512x512.png, maskable-icon-512x512.png (+ 64 px), from favicon.svg, the Module 24 line house; 4 service worker sw.js, generateSW, autoUpdate, the shell = 10 files, about 1,054 KiB, not required to install in current Chrome but it makes offline work. Bottom middle, sw.js, a helper in the browser that checks every request: from its store (the shell) index.html, JavaScript, CSS, favicon.svg, icons, the manifest, registerSW.js, the screen opens fast, offline too, and offline the dashboard writes Can't reach the server. Check your internet connection, then try again.; always to the server: /api (data, login, commands), /grafana, Socket.IO wss://.../api/socket.io/, so numbers never come from the phone's store. Bottom left, a new version (autoUpdate): the web image rebuilt; the first opening still the old version while the new one is fetched; the next opening the new version (lab: the 2nd reload; form fields safe). Bottom right, installing: Android Chrome menu, the app install option; iPhone Safari Share, Add to Home Screen, turn on Open as Web App, Add; laptop the install button in the address bar. Honestly: a real phone was not tested (headless Chrome 412 px); no push notifications, no offline data.](assets/pwa-from-a-shortcut.png)

> ⬆️ **Done reading Concept 11?** Continue to [Practice 3](#practice-3--dashboard-130-becomes-a-pwa-at-httplocalhost-40-minutes): the PWA is tried first at `http://localhost`. Installing on a real phone waits for [Practice 12](#practice-12--the-pwa-on-a-phone-a-mobile-network-and-a-friend-in-another-city-40-minutes), after your dashboard has an `https://` address.

## 🔧 Step-by-step practice

Practices 1–4, 6, 10, and 12 are required on every path (the free path replaces Practice 10 with [11.9](#119--t3-free-the-home-internet-down-for-10-minutes-the-pis-history-stays-whole-15-minutes)); Practices 5, 7, 8, and 9 are required on the main path; Practice 11 is required on the free path; [Practice 13](#practice-13--optional-a-device-at-another-location-over-mqtts-without-a-gateway-20-minutes) is optional. The steps marked ⭐ (1.2, 1.3, 1.4, 2.2, 2.4, 3.5, 3.6, 4.3, 4.4, 4.5, 5.4, 5.5, 5.7, 6.3, 6.4, 7.5–7.9, 8.1, 8.3, 8.6, 9.3, 9.4, 10.2, 10.5, 11.4, 11.6–11.9, 12.1 (iPhone: 12.2), 12.3, and 12.4) are the proof, plus [➕ E](#e--merge-featureto-the-internet-into-main-with-the-pull-request-online-on-the-internet-https-mqtt-over-tls-an-outage-proof-bridge-pwa). The pass requirement **T1** is proven in [12.4](#124--t1-a-friend-in-another-city-opens-your-dashboard-over-https-15-minutes) (the free path: [11.8](#118--t1-free-and-t2-free-the-dashboard-from-a-phone-the-broker-stays-at-home-6-minutes), then 12.4), **T2a** in [8.3](#83--t2a-without-tls-refused-at-8883-and-1883-unreachable-from-outside-10-minutes) (the free path: **T2-free** in 11.8), **T2b** in [9.3](#93--t2b-the-vps-log-records-the-pi-bridge-over-tls-6-minutes), and **T3** in [10.5](#105--t3-scriptscheck-late-arrivalssql-on-the-vps-no-gaps-and-no-duplicates-8-minutes) (the free path: 11.9 plus the [4.4](#44--a-10-minute-outage-on-the-lan-then-scriptscheck-late-arrivalssql-no-gaps-no-duplicates-11-minutes) drill). Practices 1–4 cost nothing and are done on the laptop and the Pi before you rent a VPS; the only thing bought earlier is the domain in [6.1](#61-buy-a-myid-domain-from-a-pandi-accredited-registrar-7-minutes), because both paths need it and waiting for the nameservers to become active can take hours.

Every central `docker compose` is run from the **project root** on the machine the 🖥️ box names (the laptop, the VPS, or the free-path Pi); the gateway's from the `edge` folder on the Pi. Practices that change files end with a commit on the `feature/to-the-internet` branch (1.1); that branch is pushed for the first time in [4.1](#41-edgegatewayconf-four-lines-that-hold-the-queue-then-push-the-branch-6-minutes) (the Pi fetches the new `edge/`), taken by the VPS with `git clone` in 7.1 (the free path: the Pi in 11.1), then merged into `main` in ➕ E. One backend per bot token: the laptop's backend stops in 7.6 (the free path: 11.4). [`code/`](code/) only holds the changed files, four diffs, and the module's materials: copy them one by one as each practice says; don't overwrite your whole folder.

The other paths use the same order; the differences are in the 🔀 boxes:

- **Without a Pi:** a VPS as on the main path, and the laptop becomes the gateway ([the pattern of Module 26's 6.7](../module-26-docker-compose/README.md#67-laptop-path-the-stand-in-for-l4-then-the-gateway-on-the-same-laptop-525-minutes)). Its pass criteria = the main path's, except T3: the internet is cut by turning off the laptop's Wi-Fi ([10.2](#102--unplug-the-home-internet-not-the-home-wi-fi-2-minutes); not tested by the author yet).
- **Without a Kit:** the `tools/` simulator and the mock Garden replace Node 1 and Node 2, through the gateway on the Pi or the laptop.
- **Wokwi:** the same as without a Kit; an ESP32 with TLS only in 🧩 Level 1 and 🔬.

**How to spread it out (five days):** day 1 🔁, 🏆, Concepts 1 and 5, 6.1–6.2, Practices 1–3 (the `TRUST_PROXY` part of Concept 7 before Practice 2, Concept 11 before Practice 3) · day 2 Concept 9, Practice 4, then (the main path) Concepts 2–4, Practice 5, 6.3–6.4 · day 3 Concepts 6–7, Practice 7 · day 4 Concept 8, Practices 8–9 · day 5 Practice 10, Practice 12, ➕. The free path: day 2 Concept 9, Practice 4, 6.4, Concept 10 · day 3 Practice 11 · day 4 Practice 12, ➕.

> [!IMPORTANT]
> **Your home keeps running until [7.5](#75--move-the-history-to-the-vps-backup-scp-restore-then-the-same-fingerprint-14-minutes).** From 7.5 on, the home's readings no longer reach the laptop, and only reach the VPS after the Pi bridge connects in [9.2](#92-pi-edgebridgecenterconf-heading-for-mqttyournamemyid8883-10-minutes) (the free path: [11.4](#114--move-the-history-to-the-pi-the-same-fingerprint-the-laptops-backend-stops-12-minutes) to [11.6](#116--the-gateway-to-the-center-on-the-same-pi-a-lan-bridge-to-center1884-8-minutes)), so do days 3 and 4 close together. During 7.5–9.2, the Pi gateway holds Node 1's readings in its queue (the author's lab, a 7-minute pause: 0 lost, 0 duplicates on the VPS).

### Practice 1 — The workbench: a branch, the fingerprint, and a backup (15 minutes)

> 🖥️ **Tools used:** **VS Code** on the laptop with the `mini-smart-home` folder and a terminal at the **project root** (Git and `docker compose`). The Module 26 home keeps running; Kit B: the Pi isn't touched. Its materials: [🔁 Step 1](#step-1--your-module-26-homes-inventory-and-the-history-fingerprint) and the backup recipe of [Module 26's 9.1](../module-26-docker-compose/README.md#91-pg_dump-inside-the-container-then-docker-compose-cp-to-backup-8-minutes).
>
> ⭐ **Required** — steps 1.2, 1.3, and 1.4 (Kit B): the history fingerprint recorded, a backup archive in `backup/`, and the laptop's `.env` holding `MQTT_ADDRESS=0.0.0.0`.

#### 1.1 The `feature/to-the-internet` branch from the latest `main` (3 minutes)

In the terminal at the project root:

```text
git switch main
git pull
git switch -c feature/to-the-internet
```

**Expected output** (the author's lab):

```text
Already on 'main'
Your branch is up to date with 'origin/main'.
Already up to date.
Switched to a new branch 'feature/to-the-internet'
```

Practice 1 doesn't change any project file, so there's no commit.

#### 1.2 ⭐ The history fingerprint on the laptop with `scripts/fingerprint.sql` (4 minutes)

The script has been in your project since [Module 26](../module-26-docker-compose/README.md#12--stop-the-data-writers-then-take-the-historys-fingerprint-with-scriptsfingerprintsql-8-minutes) (bash/zsh):

```text
docker compose exec -T db psql -U postgres -d smarthome < scripts/fingerprint.sql
```

PowerShell (not tested by the author): `Get-Content scripts/fingerprint.sql | docker compose exec -T db psql -U postgres -d smarthome`.

**Expected output** (the author's lab, 22:24 WIB; your numbers differ):

```text
 readings |           fingerprint            | summaries | chunks | jobs | accounts | devices
----------+----------------------------------+-----------+--------+------+----------+---------
     2313 | 2e6d178c2f561cfe7a24e9d11d501252 |       383 |      9 |    3 |        2 |       3
(1 row)
```

Copy the column header and the row to `learn-iot/module-27/fingerprint.md` under the heading "Before Module 27 (1.2)", with the time (WIB). The home is still running, so the numbers keep moving: this is a rough comparison before you change anything. The fingerprint that counts is taken again after the data flow is stopped in 7.5 (the free path: 11.4), and on the target machine it must be exactly the same.

**You pass this ⭐ step** when the full fingerprint row and its WIB time are saved in `fingerprint.md`.

#### 1.3 ⭐ A backup before changing anything: `pg_dump`, then `docker compose cp` to `backup/` (5 minutes)

If Practices 2–4 break something, this archive is restored with the recipe of [Module 26's 9.2](../module-26-docker-compose/README.md#92-the-restore-test-project-in-a-new-cupboard-the-timescaledb-restore-recipe-15-minutes). The recipe = Module 26's 9.1:

```text
docker compose exec db pg_dump -U postgres -d smarthome -Fc -f /tmp/smarthome.dump
```

**Result:** four normal lines as in Module 26, opening with `pg_dump: warning: there are circular foreign-key constraints on this table:`. No `backup` folder yet (Module 26 Practice 9)? Make one in VS Code's Explorer (**New Folder…**). Use today's date in the archive's name:

```text
docker compose cp db:/tmp/smarthome.dump backup/smarthome-2026-10-29.dump
```

**Expected output** (the author's lab):

```text
[+] Copying 1/1
 ✔ smarthome-db-1 copy smarthome-db-1:/tmp/smarthome.dump to backup/smarthome-2026-10-29.dump Copied                 0.0s
```

Check `git status --short`: empty, because `backup/` has been ignored by Git since Module 26. This archive holds your whole history and your accounts: keep it as private data.

**You pass this ⭐ step** when `backup/` holds an archive dated today and `git status --short` doesn't mention it.

#### 1.4 ⭐ Kit B: `MQTT_ADDRESS` in the laptop's `.env` so the Pi bridge stays connected (3 minutes)

From [2.3](#23-the-module-27-composecloudyml-and-the-on-the-internet-block-in-the-laptops-env-4-minutes) on, the Module 27 `compose.cloud.yml` opens the plain broker door 1883 only to the laptop itself (`127.0.0.1`), unless `.env` says otherwise. That narrow default matters on a VPS ([Concept 4](#4-a-leaky-firewall-ufw-and-docker)), but the Pi gateway knocks on the laptop from the home Wi-Fi. Before that file is used, add one line to the `.env` at the laptop's project root, then save (**Ctrl + S**):

```text
MQTT_ADDRESS=0.0.0.0
```

`0.0.0.0` = every IPv4 interface (Module 26: IPv6 too). The Module 26 Compose file doesn't use it yet, so nothing changes yet; the proof shows in [2.4](#24--docker-compose-up--d---build-backend-trusted-proxies-and-a-persistent-session-3-minutes): the broker counter `0.0.0.0:1883->1883/tcp`. Without this line, Compose says nothing, the Pi bridge fails again and again (the author's lab, the gateway log: `Client local.pi-bridge [(null):0] disconnected: Broken pipe.`, then `Bridge center next backoff will be 30000 ms`; on your home network the wording may differ), and the dashboard only shows stale data ([🚨](#-troubleshooting) *The Kit B bridge doesn't connect anymore after the Module 27 code*). With `0.0.0.0`, the plain door 1883 is open to the whole Wi-Fi: on public Wi-Fi, run `docker compose stop mosquitto`, then `docker compose start mosquitto` at home.

> 🔀 **Without a Pi:** the simulator to `mqtt://127.0.0.1:1883` doesn't need this line. A gateway on the laptop (the Module 26 6.7 pattern, used in Practice 4's 🔀) knocks on the center through `host-gateway` (the laptop's address seen from inside the container, not `127.0.0.1`): add this line too.

**You pass this ⭐ step** when your laptop's `.env` holds `MQTT_ADDRESS=0.0.0.0` (Kit B or a gateway on the laptop).

> ⬆️ **Done with Practice 1?** Read the `TRUST_PROXY` part of [Concept 7](#7-caddy-as-the-front-door-automatic-https-and-trust_proxy) (just that part for now), then continue to [Practice 2](#practice-2--backend-140-trust_proxy-a-persistent-broker-session-and-2-minute-manual-commands-20-minutes).

### Practice 2 — Backend 1.4.0: `TRUST_PROXY`, a persistent broker session, and 2-minute manual commands (20 minutes)

> 🖥️ **Tools used:** **VS Code** in the `mini-smart-home` folder: a terminal in the **`backend`** folder (npm) and at the **project root** (`docker compose`, Git). Your home keeps running. Concepts used: 7 (the `TRUST_PROXY` part); the persistent session is explained in 2.1.
>
> ⭐ **Required** — steps 2.2 and 2.4: 118 tests pass, then backend 1.4.0 runs in Compose with `trusted proxies (TRUST_PROXY): uniquelocal` and a persistent session (`c0`).

The backend moves up to **1.4.0**: three changes, no migration, no new package. Its final state is in [`code/backend/`](code/backend/), all its changes in [`code/backend-1.4.diff`](code/backend-1.4.diff) (15 files). Copying works as in Module 26: type the excerpts, or **Copy raw file** of the file with the same name.

#### 2.1 Three changes in `src/`: `env.ts` and `server.ts`, `mqtt.ts`, and `commands.ts` (8 minutes)

**(a) `TRUST_PROXY`** ([Concept 7](#7-caddy-as-the-front-door-automatic-https-and-trust_proxy)). `src/config/env.ts` checks it at startup (a number is refused), then:

```ts
  TRUST_PROXY: z.string().default("")
    // …
    .transform((list): boolean | string[] => (list.length === 0 || list.join() === "false" ? false
      : list.join() === "true" ? true : list)),
```

Empty = `false` (trusts nobody); `uniquelocal` or an address/range = the list of trusted proxies. `src/server.ts` hands it to Fastify (`trustProxy: env.TRUST_PROXY,`) and logs `trusted proxies (TRUST_PROXY): …`. This is the cure Modules 20 and 26 promised (Concept 7: a cookie without `Secure`, a shared `429`). `CORS_ORIGIN` is now checked: `https://iot.yourname.my.id/` (a trailing slash) stops the server with `"…" is not a page address: …`, instead of a silent `403`.

**(b) A persistent broker session** (`src/services/mqtt.ts`):

```ts
    clientId: clientName,
    // …
    clean: account === null,
```

`clientName` = the account name (`backend`), so its session is always the same; the reason is in that file's comments. With **a clean session** (1.3.0), if the central broker is restarted and the Pi bridge comes in before the backend, the queue from the Pi arrives with no subscriber and is thrown away (lab: 1 of 4 attempts). With **a persistent session**, the broker remembers `backend`'s subscription and holds QoS 1 messages for it until it comes in (lab: 0 lost). More in [Concept 9](#9-a-store-and-forward-bridge-who-holds-what) and [🔬](#-technical-deep-dive-optional) *Clean versus persistent sessions*.

**(c) 2-minute manual commands** (`src/services/commands.ts`):

```ts
const MANUAL_COMMAND_MAX_AGE_MS = 120_000;
```

When the home internet is down, the dashboard reports the **Lamp** as failed; without this limit, the command is sent again as soon as the held-up messages arrive, and the lamp turns on minutes or hours later. Now a dashboard or Telegram command that isn't carried out for more than 2 minutes is forgotten: `command lamp = true (api) to <device_id> not carried out for more than 2 minutes: not sent again` ([4.5](#45--a-lamp-command-during-the-outage-up-is-kept-down-is-not-3-minutes)).

**Other files:** the tests `src/config/env.test.ts`, `src/services/mqtt.test.ts`, `src/routes/proxy.test.ts` (new), `src/services/commands.test.ts` (new); `src/auth/security.ts` and `Dockerfile` (comments; don't overwrite your `LABEL`); `bruno/environments/internet.yml` (new, `baseUrl`); `.env.example` (`TRUST_PROXY=` empty for dev mode); `package.json` and `package-lock.json` (version 1.4.0); `README.md`.

#### 2.2 ⭐ `npm ci`, `npm run check`, `npm test`, and `npm audit`: 118 tests pass (5 minutes)

In the `backend` folder's terminal, one by one: `npm ci`, `npm run check`, `npm test`, then `npm audit`.

**Expected output (the author's lab, cut):**

```text
added 225 packages, and audited 226 packages in 13s
found 0 vulnerabilities
> mini-smart-home-backend@1.4.0 check
> tsc --noEmit
 Test Files  17 passed (17)
      Tests  118 passed (118)
found 0 vulnerabilities
```

(Module 26: 15 files / 99 tests.) Red? Compare your files with `code/backend/`.

**You pass this ⭐ step** when `npm test` says `17 passed (17)` and `118 passed (118)`, and `npm audit` says `found 0 vulnerabilities`.

#### 2.3 The Module 27 `compose.cloud.yml` and the "On the internet" block in the laptop's `.env` (4 minutes)

At the project root, replace the contents of `compose.cloud.yml` and `.env.example` with [`code/compose.cloud.yml`](code/compose.cloud.yml) and [`code/.env.example`](code/.env.example) (**Copy raw file**; if your old `.env.example` had your `IMAGE_REGISTRY`, write it in again). For the backend (the tag in `migrate` and `backend`):

```yaml
x-backend-settings: &backend-settings
  # …
  TRUST_PROXY: ${TRUST_PROXY:-uniquelocal}
# …
    image: ${IMAGE_REGISTRY:?fill in IMAGE_REGISTRY in .env}/mini-smart-home-backend:1.4.0
```

**At the same time**, copy two new scripts into `scripts/`: [`copy-certificate.sh`](code/scripts/copy-certificate.sh) and [`renew-mqtt-certificate.sh`](code/scripts/renew-mqtt-certificate.sh) (covered in Practice 8). On Windows, if VS Code's status bar says `CRLF`, click it → `LF`, and save: a CR breaks `sh` scripts (Module 26: `illegal option -`; Windows not tested).

> [!WARNING]
> Without `copy-certificate.sh`, your home stops receiving data. The author's lab: `service "mqtt-certificate" didn't complete successfully: exit 2` and `sh: can't open '/scripts/copy-certificate.sh': No such file or directory`, then `mosquitto` and `backend` stuck at `Created`. Copy the script and repeat 2.4.

Then paste the part that starts with `# --- On the internet (Module 27) ---` from the new `.env.example` to the end of the laptop's `.env`, as it is: everything empty except `PORT_HTTPS=443` and `PORT_MQTTS=8883`. Empty = the Module 26 behavior; an empty `TRUST_PROXY` = `uniquelocal` from Compose (`false` = the 1.3 behavior). The VPS and Pi values: [7.2](#72-the-vps-env-new-secrets-and-the-vps-column-of-the-values-per-place-table-10-minutes). Kit B: `MQTT_ADDRESS=0.0.0.0` from 1.4 stays. Check:

```text
docker compose config --quiet
```

**Result (the author's lab):** no output = it fits. An old Module 26 `.env` passes too: Compose's silence isn't proof that the Kit B bridge is safe.

Until [3.5](#35--npm-run-build-with-pwa-v200-then-the-web-130-image-7-minutes), only start the services you name: in the author's lab, `docker compose up -d` without a name built the `web:1.3.0` image from the 1.2.0 dashboard, which isn't a PWA yet (3.5 replaces it). Save to Git (`.env` stays out):

```text
git add backend scripts compose.cloud.yml .env.example
git commit -m "Backend 1.4.0 and the Module 27 compose.cloud.yml"
```

#### 2.4 ⭐ `docker compose up -d --build backend`: trusted proxies and a persistent session (3 minutes)

At the project root:

```text
docker compose up -d --build backend
```

Compose builds the 1.4.0 mold (±45 seconds on the author's Pi 5), makes the cupboards `smarthome_certificate-data` and `smarthome_caddy-data`, runs `mqtt-certificate` (new), then recreates `mosquitto` and `backend`; `web` and `grafana` aren't touched. `port is already allocated`? Counter 8883 (in 3.5 also 443) is taken: change `PORT_MQTTS`/`PORT_HTTPS` in `.env`, for example to 8884/8443, then repeat the command above (not just `up -d`; [🚨](#-troubleshooting)).

Run `docker compose ps -a`; in the author's lab: `backend` 1.4.0 `Up … (healthy)`, `migrate` and `mqtt-certificate` `Exited (0)`, `mosquitto` with `127.0.0.1:1883->1883/tcp, 127.0.0.1:8883->8883/tcp` (Kit B: `0.0.0.0:1883->1883/tcp, 127.0.0.1:8883->8883/tcp`). 8883 is only reserved: `center.conf` has no TLS door. Then `docker compose logs mqtt-certificate`, `docker compose logs backend`, and `docker compose logs mosquitto`.

**Expected output (the author's lab, cut; the backend's times in WIB, the broker log's numbers = seconds; the 71-second pause = the lab broker being recreated, usually ±2 seconds):**

```text
mqtt-certificate-1  | MQTT_DOMAIN empty: no broker certificate (laptop or free-path Pi), skipped
backend-1  | [22:29:31] INFO: trusted proxies (TRUST_PROXY): uniquelocal
backend-1  | [22:30:42] INFO: connected to broker mqtt://mosquitto:1883 as backend
mosquitto-1  | 1793287842: New client connected from 172.19.0.5:47684 as backend (p4, c0, k60, u'backend').
```

`c0` = a persistent session (1.3.0: `c1`). If the broker writes `… disconnected: session taken over.` right before `New … connected`, that's normal: the client's own old session, not an impostor. Kit B: within ±30 seconds the Pi bridge comes in again (`… as pi-bridge (p4, c0, …)`, the Module 26 settings until Practice 4); it doesn't? Check 1.4. The cookie at `http://localhost` stays without `Secure`, which is right for HTTP; the proof is in [7.8](#78--the-padlock-at-httpsiotyournamemyid-308-logging-in-and-the-secure-cookie-6-minutes).

**You pass this ⭐ step** when `mqtt-certificate` is `Exited (0)` (`skipped`), `backend` 1.4.0 is `(healthy)`, and the log holds `trusted proxies (TRUST_PROXY): uniquelocal` and `as backend (p4, c0, k60, u'backend')`.

> ⬆️ **Done with Practice 2?** Read [Concept 11](#11-pwa-from-a-shortcut-to-an-app), then continue to [Practice 3](#practice-3--dashboard-130-becomes-a-pwa-at-httplocalhost-40-minutes): dashboard 1.3.0 becomes an app.

### Practice 3 — Dashboard 1.3.0 becomes a PWA at `http://localhost` (40 minutes)

> 🖥️ **Tools used:** **VS Code** in the `mini-smart-home` folder: a terminal in the **`frontend`** folder for `npm`, a terminal at the **project root** for `docker compose` and Git; **Chrome** with DevTools (**F12**) on the laptop (Edge is similar, not tested by the author); internet for `npm`. Your home keeps running; the Pi isn't touched. Concepts used: 11.
>
> ⭐ **Required** — steps 3.5 and 3.6: `npm run build` ends with `PWA v2.0.0` and the web 1.3.0 image runs, then at `http://localhost`: a manifest without errors, the service worker `activated`, and the dashboard installed as an app.

The dashboard moves up to **1.3.0**: one development package, four icons, one settings file, and three small changes, with no new screen. Its final state is [`code/frontend/`](code/frontend/), its changes [`code/frontend-1.3.diff`](code/frontend-1.3.diff) (without `package-lock.json` and the PNGs: you get both in 3.1 and 3.2; its Caddyfile: 7.1). Copying works as in Practice 2.

#### 3.1 Exactly `vite-plugin-pwa` 2.0.0, and `npm audit` without `--force` (8 minutes)

This package writes the manifest and the service worker during `npm run build`. It's a **development** package (`-D`: only used during the build, it doesn't go to the browser) with an **exact** version (`-E`: without `^`). In the `frontend` folder's terminal:

```text
npm install -D -E vite-plugin-pwa@2.0.0
```

**Expected output (the author's lab, cut; the time differs on your machine):**

```text
npm warn deprecated glob@11.1.0: Old versions of glob are not supported, …

added 314 packages, and audited 425 packages in 1m
…
4 low severity vulnerabilities
…
```

`npm warn deprecated` comes from a helper package of the build tools: that's normal. Look at the findings:

```text
npm audit
```

**Expected output (the author's lab, cut):**

```text
deepmerge  >=4.2.0
deepmerge mergeObject() allows prototype poisoning of returned objects - https://github.com/advisories/GHSA-gcqx-w48m-w2h4
fix available via `npm audit fix --force`
Will install vite-plugin-pwa@0.2.1, which is a breaking change
…
4 low severity vulnerabilities
```

All four are one problem: `deepmerge`, at the end of the chain `vite-plugin-pwa` → `workbox-build` → `@rollup/plugin-node-resolve`. It only runs on your laptop during `npm run build`, and as of 29 Oct 2026 there's no fixed version yet. **Don't** run `npm audit fix --force`: according to the `Will install …` line above, its "fix" installs the ancient 0.2.1, which can break the build. The proof that what goes to the browser is clean:

```text
npm audit --omit=dev
```

**Result** (the author's lab): `found 0 vulnerabilities`.

In the author's lab, `package.json` is now the same as [`code/frontend/package.json`](code/frontend/package.json) (`"vite-plugin-pwa": "2.0.0"` in `devDependencies`) except for the version number (3.4). `node_modules` grows from ±245 MB to ±321 MB.

#### 3.2 The app icons and the house `favicon.svg` (5 minutes)

The manifest needs icons; Chrome asks for 192 and 512 px. The author made them from Module 24's line-drawn house with Chrome and Pillow. Pictures can't be pasted like text: open each file on GitHub, click **Download raw file**, then save it in the `frontend/public` folder with exactly the same name: [`pwa-64x64.png`](code/frontend/public/pwa-64x64.png) (787 B), [`pwa-192x192.png`](code/frontend/public/pwa-192x192.png) (1,587 B), [`pwa-512x512.png`](code/frontend/public/pwa-512x512.png) (4,067 B), and [`maskable-icon-512x512.png`](code/frontend/public/maskable-icon-512x512.png) (2,401 B). The first three = the house on a round-cornered tile; the last one has a full background, so Android's launcher may crop it into a circle without cutting off the house.

Then the tab icon: open [`code/frontend/public/favicon.svg`](code/frontend/public/favicon.svg), click **Copy raw file**, and paste it over the contents of `frontend/public/favicon.svg` (Vite's lightning logo is gone). Module 24's `apple-touch-icon.png` stays, for the iPhone. The icon's look on a real phone hasn't been tried by the author.

#### 3.3 `vite.config.ts`: the manifest, the service worker, and three paths that always go to the network (6 minutes)

Replace the whole contents of `frontend/vite.config.ts` with this file (type it, or [`code/frontend/vite.config.ts`](code/frontend/vite.config.ts) → **Copy raw file**), then save:

```ts
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Module 27: the dashboard can be INSTALLED as an app on phones and laptops (PWA). This plugin writes two files at
    // npm run build: manifest.webmanifest (the app's name, icons, colors) and sw.js (the service worker = a small helper in
    // the browser that keeps the dashboard's shell). The browser only uses them at a secure address: https://... or localhost.
    // npm run dev has no service worker (only the build result has one).
    VitePWA({
      // a new dashboard version is used without asking: after the web image is rebuilt, the browser fetches the new sw.js and
      // uses it the next time the app is opened (see the README "A phone app")
      registerType: 'autoUpdate',
      manifest: {
        name: 'Mini Smart Home',
        // the short name under the home-screen icon (the same as apple-mobile-web-app-title in index.html)
        short_name: 'Smart Home',
        description: 'Mini Smart Home dashboard: sensors, controls, and history of your home',
        lang: 'en',
        // the first page when the icon is tapped, and the address range that counts as "inside the app"
        start_url: '/',
        scope: '/',
        // its own window without an address bar, like an ordinary app
        display: 'standalone',
        // the splash-screen color (= the page background, bg-slate-100) and the top-bar color (the same as theme-color in index.html)
        background_color: '#f1f5f9',
        theme_color: '#1d293d',
        // icons in the public/ folder, made from favicon.svg (the same line-drawn house as Module 24's apple-touch-icon.png).
        // 192 and 512 = the sizes Chrome asks for its Install button. "maskable" = a full-background version that an Android
        // launcher may cut into a circle or a rounded square: the house sits in the middle, inside the safe zone.
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // ONLY the SHELL is kept by the service worker: the build files (HTML, JavaScript, CSS, favicon.svg); the manifest's
        // icons are kept by the plugin itself. The home's data (/api/...) and the live connection are never kept: they
        // are always asked from the server, so the numbers on screen never go stale quietly.
        globPatterns: ['**/*.{js,css,html,svg}'],
        // screen addresses such as /map or /devices/f00d00000001 are answered with index.html from the store (React Router
        // picks the screen), also while the internet is down: the app stays open and says the server can't be reached
        navigateFallback: '/index.html',
        // ...EXCEPT the addresses that aren't dashboard screens: the API (/api), Grafana (/grafana/, Module 27), and Socket.IO
        // (/socket.io when VITE_API_BASE=/). Those addresses always go on to the server, never replaced by index.html.
        navigateFallbackDenylist: [/^\/api(\/|$)/, /^\/grafana(\/|$)/, /^\/socket\.io(\/|$)/],
      },
    }),
  ],
  // Module 22: always on port 5173 (the address the backend's CORS_ORIGIN allows).
  // If that port is in use, stop with an error, don't quietly move to 5174.
  server: { port: 5173, strictPort: true },
  // npm run preview (Module 23 Practice 8) is on 5173 too: its default port (4173) isn't in CORS_ORIGIN, so login would be refused.
  // Stop npm run dev first before running preview.
  preview: { port: 5173, strictPort: true },
})
```

Its comments explain every line. The gist:

- **`VitePWA({ … })`** = the only addition; `server` and `preview` (counter 5173, Modules 22–23) stay.
- **`registerType: 'autoUpdate'`**: a new service worker is used without asking, without reloading the open tab (3.7).
- **`manifest`** = the app's business card ([Concept 11](#11-pwa-from-a-shortcut-to-an-app)); `theme_color` must equal `theme-color` in `index.html` (3.4).
- **`globPatterns`**: only the build's files (HTML, JavaScript, CSS, SVG) become the shell; the manifest icons are added by the plugin. The result is 10 files without doubles.
- **`navigateFallback`**: screen addresses like `/map` are answered with `index.html` from the store, also while offline.
- **`navigateFallbackDenylist`**: three paths that **always go to the network**: `/api` (data, logging in, commands), `/grafana`, and `/socket.io`. In the author's lab, without `/grafana` here, a browser that had opened the dashboard answered `/grafana/` with the dashboard's `Page not found` screen. Grafana at the same address is only opened in [7.10](#710-grafana-at-grafana-admin-a-viewer-account-and-the-dashboard-from-files-5-minutes), but the dashboard's service worker is already active there before that ([🚨](#-troubleshooting) *`/grafana/` shows the dashboard's "Page not found"*).

`npm run dev` doesn't use a service worker: only the build output has one.

#### 3.4 `index.html`, the offline message, the 2-minute toast, and version 1.3.0 (4 minutes)

**Copy raw file** from the files with the same names in [`code/frontend/`](code/frontend/), or type their lines:

- **`index.html`**: the icon comments updated and one new line in `<head>`, the color of the installed app's top bar:

  ```html
      <meta name="theme-color" content="#1d293d" />
  ```

  The manifest link and `registerSW.js` are added to `dist/index.html` by the plugin during the build.
- **`src/api.ts`**: the old hint when the server can't be reached (`localhost:5173`, `CORS_ORIGIN`) misleads in an app opened from a phone; the build output now writes `Can't reach the server. Check your internet connection, then try again.` (`npm run dev` keeps the old sentence).
- **`src/components/SwitchButton.tsx`**: the 504 toast follows backend 1.4.0 ([2.1](#21-three-changes-in-src-envts-and-serverts-mqttts-and-commandsts-8-minutes)): `…: not confirmed by the device yet; the server tries again if it hears from the device within 2 minutes.`
- **`Dockerfile`** (comments; don't overwrite your `LABEL`) and **`README.md`**.

Then the version number, in the `frontend` folder's terminal, one by one:

```text
npm pkg set version=1.3.0
```

```text
npm install
```

The pattern is the same as in [Module 26's 3.1](../module-26-docker-compose/README.md#31-frontend-120-three-lines-of-socketts-then-lint-build-and-check-schema-10-minutes): `npm pkg set` is silent, and `npm install` aligns the version in `package-lock.json`. Or copy `package.json` and `package-lock.json` from `code/frontend/`, then `npm ci` (the author's lab: `added 424 packages, and audited 425 packages in 48s`).

#### 3.5 ⭐ `npm run build` with `PWA v2.0.0`, then the web 1.3.0 image (7 minutes)

[Module 24's](../../phase-4-frontend-dashboard/module-24-control-rules-roles/README.md#101-dashboard-100-lint-build-check-schema-and-the-version-number-15-minutes) three checks in the `frontend` folder's terminal, one by one:

```text
npm run lint
```

```text
npm run build
```

```text
npm run check-schema
```

**Expected output (the author's lab, cut; the three commands in a row):**

```text
Found 0 warnings and 0 errors.

dist/registerSW.js                  0.13 kB
dist/manifest.webmanifest           0.54 kB
dist/index.html                     1.66 kB │ gzip:   0.84 kB
dist/assets/index-M1EwwXQm.css     37.56 kB │ gzip:  11.62 kB
dist/assets/index-Bi5LsS3m.js   1,039.42 kB │ gzip: 309.38 kB

[plugin builtin:vite-reporter]
(!) Some chunks are larger than 500 kB after minification. Consider:
…
✓ built in 3.22s

PWA v2.0.0
mode      generateSW
precache  10 entries (1054.22 KiB)
files generated
  dist/sw.js
  dist/workbox-9c191d2f.js

SAME  src/schemas/contract.ts
SAME  src/schemas/rule-basics.ts
```

The yardstick: lint clean; the build passes with the old size warning (since Module 23), then the `PWA v2.0.0` part (a 10-file shell, ±1 MB); two `SAME`. Your hashed names and numbers differ. Then the web image, in the **project root** terminal:

```text
docker compose up -d --build web
```

**Expected output (the author's lab):**

```text
[+] Building 64.1s (17/17) FINISHED
[+] Running 2/2
 ✔ ghcr.io/<account>/mini-smart-home-web:1.3.0  Built                                          0.0s
 ✔ Container smarthome-web-1                    Started                                        3.3s
```

64 seconds because the build's `npm ci` was already in the author's machine's cache; from scratch, ±2 minutes on the author's Raspberry Pi 5. The image stays 90.4 MB. Counter 443 taken? [🚨](#-troubleshooting). Now `docker compose up -d` without a service name is safe again ([2.3](#23-the-module-27-composecloudyml-and-the-on-the-internet-block-in-the-laptops-env-4-minutes)). Save to Git from the project root (`node_modules` and `dist` have been ignored since Module 22):

```text
git add frontend
```

```text
git commit -m "Dashboard 1.3.0: an installable app (PWA)"
```

**You pass this ⭐ step** when `npm run build` ends with `PWA v2.0.0` with `precache  10 entries`, and `up -d --build web` writes `…-web:1.3.0  Built` and `Started`.

#### 3.6 ⭐ The manifest, the service worker, and installing the dashboard from `http://localhost` (7 minutes)

Open **Chrome** at `http://localhost`, exactly this address (a secure context is only `https://` or `localhost`; a LAN IP isn't). Log in with the admin account, press **F12**, then the **Application** tab:

1. **Manifest**: no errors; `Mini Smart Home`, the short name `Smart Home`, `standalone`, the start address `/`, four icons.
2. **Service workers**: `sw.js` with the status `activated`.

**Result (the author's lab, 22:38 WIB),** read through the DevTools protocol, because headless Chrome doesn't show DevTools: `isSecureContext: true`; the service worker `activated` at `http://localhost/sw.js`, controlling the page at once; the manifest `errors: []`, `standalone`, `start_url /`, `theme_color #1d293d`, 4 icons (64, 192, 512, 512 `maskable`); the list of installability errors **`[]`** (installable). After logging in: **Live**, the `access` and `session` cookies without `Secure`, which is right for `http://` (the `Secure` proof is in [7.8](#78--the-padlock-at-httpsiotyournamemyid-308-logging-in-and-the-secure-cookie-6-minutes)).

Check `sw.js`: click its name in **Service workers**, or `curl -sI http://localhost/sw.js` (Windows: `curl.exe`, not tested; the author's lab: `200`, `text/javascript`, `no-cache`). Don't type it in the address bar: once the service worker is active, the dashboard answers it with `Page not found` (the author's lab).

Then **install** it: the install button in the address bar, or the ⋮ menu → the app install option (its name differs per version and language). The dashboard opens in its own window without an address bar, with the house icon. This part isn't recorded by the author: headless Chrome can't install apps, so the only proof is the empty error list. Not offered? [🚨](#-troubleshooting) *The offer to install the app doesn't appear*. This `localhost` app is for practice; the everyday app is installed from `https://` on the phone ([12.1](#121--android-install-the-dashboard-from-chrome-8-minutes)).

**You pass this ⭐ step** when **Manifest** has no errors, **Service workers** says `activated`, and the dashboard opens in its own window from the installed icon.

#### 3.7 Offline: the dashboard's shell stays open, then the `npm run preview` trap (3 minutes)

Still at `http://localhost` with DevTools open: the **Network** tab → change the network throttling option in its top row to **Offline** → reload (**F5**). Without a service worker (1.2.0), the browser's error page shows.

**Result (the author's lab):** the page is answered by the service worker from the store: the **Login** screen with the gray box `Can't reach the server. Check your internet connection, then try again.` The shell is there, the numbers aren't: `/api` is never stored.

![Composite of two real screenshots of the Mini Smart Home dashboard 1.3.0 (PWA, vite-plugin-pwa 2.0.0) at http://localhost, Chrome 156 on Linux, laptop 1280 pixels, cropped to the Log in card in the middle; the same web image started alone in the lab. Left, online: the card Mini Smart Home, Log in with your Module 20 account to see the dashboard. (number 1), the Email field with the example viewer@home.test, Password, the green Log in button; the service worker sw.js is activated and controls the page. Right, offline after a reload (Offline as in DevTools Network; DevTools does not show): the same card still shown by the service worker (number 2), not the dinosaur page, with the gray box Can't reach the server. Check your internet connection, then try again. (number 3); the Log in button (number 4) still needs the network, because /api and Socket.IO are never kept. A numbered legend at the bottom.](assets/pwa-offline-shell.png)

The picture from the author's lab: the same web 1.3.0 image at `http://localhost`, headless Chrome. Set the throttling option back, then reload: the login cookie is still valid, so the dashboard comes straight back with the **Live** badge.

**A new version shows on the next opening.** After the web image is rebuilt, the browser fetches the new version in the background (usually a few seconds) and uses it on the next opening or reload. The author's lab: the first reload was still the old version, eight seconds later the tab still hadn't reloaded by itself, and the second reload was the new version. Form entries are safe ([🚨](#-troubleshooting) *The old dashboard version keeps showing on the phone or in the browser*).

**The `npm run preview` trap.** `preview` and `npm run dev` are both at `http://localhost:5173`. The build served by `preview` installs a service worker there, and `npm run dev` afterward keeps showing the old dashboard from the store: your code changes seem not to show (the author's lab). The fix: DevTools → **Application** → **Storage** → **Clear site data**, then reload; the login cookie at that address is deleted too ([🚨](#-troubleshooting) *`npm run dev` shows the old dashboard*). The service worker from `http://localhost` (counter 80) doesn't disturb `npm run dev`: a different counter, a different address.

> ⬆️ **Done with Practice 3?** Read [Concept 9](#9-a-store-and-forward-bridge-who-holds-what), then continue to [Practice 4](#practice-4--store-and-forward-at-home-first-the-lan-bridge-and-a-10-minute-outage-drill-30-minutes): the bridge that holds data while the center can't be reached, tried at home first.

### Practice 4 — Store-and-forward at home first: the LAN bridge and a 10-minute outage drill (30 minutes)

> 🖥️ **Tools used:** **VS Code** on the laptop with a terminal at the **project root** (Git and the central `docker compose`); **an SSH terminal to the Pi**, folder `mini-smart-home/edge`; **Chrome** or **Edge** (`http://localhost`); your password manager (the `pi-bridge` and `monitor` passwords). Node 1 switched on and connected to the Pi gateway. Concepts used: 9.
>
> ⭐ **Required** — steps 4.3, 4.4, and 4.5: the bridge status message `state 1`, a 10-minute outage with no gaps and no duplicates according to `scripts/check-late-arrivals.sql`, and a lamp command during the outage that isn't carried out later.

The Module 26 LAN bridge (the Pi gateway → the center on the laptop) now uses the store-and-forward settings of [Concept 9](#9-a-store-and-forward-bridge-who-holds-what), still plain because it doesn't leave the house; the same file moves up to the VPS in [Practice 9](#practice-9--the-main-path-the-pi--vps-bridge-over-tls-35-minutes). The 10-minute outage in 4.4 = the T3 drill, and for the free path **T3-free (b)**.

> 🔀 **Without a Pi:** the gateway on the same laptop ([the Module 26 6.7 pattern](../module-26-docker-compose/README.md#67-laptop-path-the-stand-in-for-l4-then-the-gateway-on-the-same-laptop-525-minutes)): the "Pi" commands are typed in a second terminal, in the laptop's `edge` folder, without `git fetch`/`git switch`. `edge/.env`: `CENTER_ADDRESS=host-gateway`, `PORT_GATEWAY=1884`; the root `.env`: `MQTT_ADDRESS=0.0.0.0` (1.4). Edit `bridge/center.conf` in VS Code (`cp`, `chmod`, `diff` = Linux/macOS; Windows `copy`). The simulator's account on the gateway: step 4 of Module 26's 6.7, then `docker compose up -d`; the simulator to `mqtt://127.0.0.1:1884`; 4.4 uses the stand-in variant. Not tested by the author yet.

#### 4.1 `edge/gateway.conf`: four lines that hold the queue, then push the branch (6 minutes)

The Pi takes its files from GitHub, so everything is written on the laptop first. Replace the contents of `edge/gateway.conf` with this file (**Copy raw file** from [`code/edge/gateway.conf`](code/edge/gateway.conf)):

```text
# gateway.conf - the Mini Smart Home GATEWAY broker on the Raspberry Pi, inside a container (Modules 26-27, edge/compose.edge.yml).
# Replaces the apt Mosquitto package + /etc/mosquitto/conf.d/gateway-pi.conf (Modules 12 and 21). Devices keep connecting to the
# Pi's IP on port 1883 with their old accounts, so the firmware doesn't change. Paths below = INSIDE the container.
# After changing this file, acl-broker, or bridge/center.conf: docker compose restart mosquitto (restart, not reload).
listener 1883
# without a registered username and password, no one may connect (Module 21)
allow_anonymous false
# the password file lives in the broker-data cupboard; the Pi's old file (/etc/mosquitto/broker-passwd, 2.0 format) is read by Mosquitto 2.1.2
password_file /mosquitto/data/broker-passwd
acl_file /mosquitto/config/acl-broker
# the client name is always = the username (device_id): no one can pretend to be or kick out another device
use_username_as_clientid true
# retained messages and sessions are kept in the cupboard (like the apt Mosquitto on the Pi, which saves them when it stops)
persistence true
persistence_location /mosquitto/data/
# Module 27 (store-and-forward): when the bridge to the center is down (the home internet is out), the devices' messages for the
# bridge are HELD in the gateway's queue, then sent later with their original ts. The four lines below apply to the whole gateway broker.
# The queue is written to the cupboard every 30 seconds (default 1800 = 30 minutes): a power cut in the whole house doesn't erase
# the part of the queue older than 30 seconds. The price: one microSD card write and one log line every 30 seconds.
autosave_interval 30
# the firmware publishes with QoS 0; without this line, QoS 0 messages for a bridge that is down are dropped, not queued
queue_qos0_messages true
# the queue limit per client (the bridge = one client). The default 1000 = about 1.5 hours for two devices; 100000 = days
max_queued_messages 100000
# QoS 0 messages are forwarded to the bridge as QoS 1 (answered by the center, sent again if not answered). Without this, messages
# sent in "the blind window" (the internet already down, the gateway not aware yet, up to 2 minutes) are lost. A non-standard
# Mosquitto option, applies to every subscriber of this broker.
upgrade_outgoing_qos true
# log to the container's screen: read it with docker compose logs mosquitto (limited to 3 x 10 MB by compose.edge.yml)
log_dest stdout
log_type error
log_type warning
log_type notice
log_type information
# remove the # in front of the line below to also see the messages REFUSED by the access list (Denied PUBLISH, Module 21);
# the log gets much busier
# log_type debug
# the bridge to the central broker: every .conf file in this folder is read (edge/bridge/center.conf, holds a password, not in Git)
include_dir /mosquitto/config/bridge
```

Only four lines in the middle are new, from `autosave_interval 30` to `upgrade_outgoing_qos true`; the reasons are in their comments and in Concept 9. In the same way, replace six other `edge/` files and add one new one:

- [`bridge.example.conf`](code/edge/bridge.example.conf) (read in 4.2), [`acl-broker`](code/edge/acl-broker) (the `$SYS` line in block 7), [`compose.edge.yml`](code/edge/compose.edge.yml), [`.env.example`](code/edge/.env.example), [`README.md`](code/edge/README.md), and [`center.conf`](code/edge/center.conf) (comments only);
- [`center-internet.conf`](code/edge/center-internet.conf), a new file for the VPS broker in [Practice 8](#practice-8--the-main-path-mqtt-door-8883-with-tls-35-minutes).

All their changes: [`code/edge.diff`](code/edge.diff). Then write your device_id in block 2 of `acl-broker` again (without it, the gateway refuses Node 2's data), and open block 2b again if it was open before. Then save to the branch and push for the first time, one by one:

```text
git add edge
git commit -m "Gateway: store-and-forward and the Module 27 bridge example"
```

```text
git push -u origin feature/to-the-internet
```

Then in the SSH terminal to the Pi, folder `mini-smart-home/edge`, one by one:

```text
git fetch
```

```text
git switch feature/to-the-internet
```

**Result** (the author's lab, the last command): `Switched to a new branch 'feature/to-the-internet'`. Refused with `error: Your local changes to the following files would be overwritten by checkout:`, `edge/acl-broker`, and `Aborting`? That file was once edited directly on the Pi (lab: block 2b opened). Run `git stash`, `git switch feature/to-the-internet`, then `git stash pop`: your edits are merged automatically (lab: `Auto-merging edge/acl-broker`, 2b stays open).

#### 4.2 The LAN bridge with the Module 27 settings: a clean session at the center, a persistent queue on the Pi (7 minutes)

The Module 27 bridge example (now on the Pi too):

```text
# bridge.example.conf - an EXAMPLE bridge from the Pi gateway broker to the central broker (Modules 26-27).
# Copy it to edge/bridge/center.conf (cp bridge.example.conf bridge/center.conf), then replace the domain name and the password.
# That copy holds a password, so it isn't in Git. After changing it: docker compose restart mosquitto (from the edge folder).
# A Mosquitto note: a # may only be at the START of a line (a note behind a setting is read as part of the setting).
connection center

# --- Where the bridge connects: choose ONE of the two blocks ---
# MAIN PATH (Module 27, the center on a VPS): the broker's name on the internet + the TLS door 8883. Write the NAME, not an IP
# address: this name is what the certificate says, so an IP or another name fails the certificate check (certificate verify failed).
address mqtt.yourname.my.id:8883
# the CA root trusted for the VPS broker's certificate: ISRG Root X1, the Let's Encrypt root. The file is already inside the
# Mosquitto image (not a download). Not bridge_insecure: without the check, anyone pretending to be the VPS is accepted.
bridge_cafile /etc/ssl/certs/ca-cert-ISRG_Root_X1.pem
# HOME PATH (Module 26: the center on the laptop; Module 27 free path: the center on the same Pi, PORT_MQTT 1884): plain, without
# TLS, because it never leaves the home network. Put # in front of the two MAIN PATH lines above, then remove the # in front of this line.
# "center" = the name compose.edge.yml points at CENTER_ADDRESS in edge/.env; the number = the central broker's PORT_MQTT counter
# (laptop 1883, free-path Pi 1884).
# address center:1883

# --- The account on the CENTRAL broker ---
# the bridge's client name is made fixed. Its default holds the container name, which changes every time the container is recreated.
remote_clientid pi-bridge
# the pi-bridge account on the CENTRAL broker (made with mosquitto_passwd in the central container; its rights are block 7 of acl-broker)
remote_username pi-bridge
remote_password replace-with-the-pi-bridge-account-password

# --- Store-and-forward (Module 27; its partner is the four lines in gateway.conf) ---
# The session at the CENTER is clean: a command (cmd) sent while the bridge is down is NOT kept by the center to be sent later
# (the dashboard has already reported it as failed; a lamp that suddenly turns on minutes later is dangerous). The session at the
# GATEWAY is persistent: the devices' messages for the center are held in the gateway's queue while the bridge is down, then sent on reconnect.
# In short: up is kept on the Pi, down is not.
cleansession true
local_cleansession false
# the bridge status message for the center: 1 = connected, 0 = down (the topic $SYS/broker/connection/pi-bridge/state, needs
# the permission in block 7 of acl-broker)
notifications true

# --- Topics: device messages go up to the center (out), commands from the backend come down to the devices (in), QoS 1 ---
# Only what's needed, not "topic # out 1": other messages on the gateway broker (for example Node-RED) stay at home.
topic msh/+/telemetry out 1
topic msh/+/status out 1
topic msh/+/vitals out 1
topic msh/+/ack out 1
topic msh/+/cmd in 1
```

In the example, the active block is MAIN PATH (VPS, TLS); at home, HOME PATH is used. The rest is covered by Concept 9: `cleansession true` + `local_cleansession false` (up is kept on the Pi, down is not), `notifications true` (the bridge status message), and narrow topics.

**(a) The laptop, the project root.** The `monitor` account (4.3–4.4) must exist on BOTH brokers: usually it has existed since Module 21 (the Pi) and Module 26's 5.5 (the laptop), but the author's lab gateway didn't have it yet. Not sure? Write it again with the same password (the entry `monitor broker account`), twice when asked:

```text
docker compose exec -u mosquitto mosquitto mosquitto_passwd /mosquitto/data/broker-passwd monitor
```

**Result** (the author's lab, a new account): `Adding password for user monitor`. The new `acl-broker` is read by the CENTRAL broker too (the `$SYS` line in block 7), so the laptop's broker is restarted ([Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#44-device-path-lock-the-door-then-restart-10-minutes): restart, not reload):

```text
docker compose restart mosquitto
```

**Result** (the author's lab): `✔ Container smarthome-mosquitto-1  Started  1.1s`.

**(b) The Pi, folder `edge`.** Replace Module 26's `bridge/center.conf` with a copy of the new example:

```text
cp bridge.example.conf bridge/center.conf
```

Open it with `nano bridge/center.conf`. Put `# ` in front of the two MAIN PATH lines (`address mqtt.yourname.my.id:8883` and `bridge_cafile …`), remove the `# ` in front of `address center:1883`, then replace `replace-with-the-pi-bridge-account-password` with the laptop's `pi-bridge` password ([Module 26's 6.2](../module-26-docker-compose/README.md#62-laptop-the-gateway-files-in-edge-the-pi-bridge-account-then-push-the-branch-5-minutes)). Save (**Ctrl + O**, **Enter**, **Ctrl + X**), run `chmod 600 bridge/center.conf`, then check:

```text
diff bridge.example.conf bridge/center.conf
```

**Expected output** (the author's lab; on your screen the password shows: don't paste it anywhere):

```text
10c10
< address mqtt.yourname.my.id:8883
---
> # address mqtt.yourname.my.id:8883
13c13
< bridge_cafile /etc/ssl/certs/ca-cert-ISRG_Root_X1.pem
---
> # bridge_cafile /etc/ssl/certs/ca-cert-ISRG_Root_X1.pem
18c18
< # address center:1883
---
> address center:1883
25c25
< remote_password replace-with-the-pi-bridge-account-password
---
> remote_password <laptop pi-bridge password>
```

Exactly four places; `edge/.env` (`CENTER_ADDRESS` = the laptop's IP) stays. The gateway's `monitor` account: command (a), typed here. `compose.edge.yml` changed too, so the gateway is recreated (`restart` doesn't read a new Compose file; a HUP isn't used on the gateway, Concept 9):

```text
docker compose up -d --force-recreate mosquitto
```

**Result** (the author's lab): `✔ Container smarthome-gateway-mosquitto-1  Started  2.3s`. Then `docker compose logs mosquitto`. **Expected output** (the author's lab, cut):

```text
mosquitto-1  | 1793344478: Connecting bridge center (center:1883)
mosquitto-1  | 1793344482: New client connected from 172.20.0.1:51932 as f00d00000001 (p4, c1, k15, u'f00d00000001').
```

On the laptop, at the project root: `docker compose logs --since 15m mosquitto`, then search for `bridge` with **Ctrl + F**. **Expected output** (the author's lab, cut):

```text
mosquitto-1  | 1793344472: New bridge connected from 172.19.0.1:54058 as pi-bridge (p4, c0, k60, u'pi-bridge').
mosquitto-1  | 1793344478: New bridge connected from 172.19.0.1:33490 as pi-bridge (p4, c1, k60, u'pi-bridge').
```

The first line: the old bridge (`c0`, the Module 26 settings) coming in again after the restart in (a); the second line: the new gateway with **`c1`** = a clean session at the center. At your home, the address after `from` = Node 1's IP (the Pi log) and the Pi's IP (the laptop log); lab: the Docker hallway. `… session taken over.` in between and the warning `… world readable permissions …` (since Module 26) are normal. Node 1 drops off briefly while the gateway is recreated (lab: ±3 seconds), so one or two readings of that minute may be lost. No `c1`? [🚨](#-troubleshooting) *The bridge is `not authorised` …*.

#### 4.3 ⭐ The bridge status message `state 1` with the `monitor` account (3 minutes)

On the laptop, at the project root, replace `<password>` with the `monitor` password (it stays in the terminal history; acceptable for this read-only account):

```text
docker compose exec mosquitto mosquitto_sub -u monitor -P <password> -t '$SYS/broker/connection/pi-bridge/state' -v -C 1
```

**Expected output** (the author's lab):

```text
$SYS/broker/connection/pi-bridge/state 1
```

`1` = connected, `0` = down. Silent all the time? **Ctrl + C**, then [🚨](#-troubleshooting) *The `pi-bridge/state` status message never arrives*. `Connection error: Connection Refused: not authorised` = the `monitor` account doesn't exist yet on that broker (4.2 (a)).

Then on the Pi, folder `edge`, peek at the gateway queue's contents before the outage:

```text
docker compose exec mosquitto mosquitto_sub -u monitor -P <password> -t '$SYS/broker/store/messages/count' -v -C 1
```

The author's lab: 59, almost all of them retained messages that are always there (Concept 9); what matters later is how it rises.

**You pass this ⭐ step** when the central broker answers `$SYS/broker/connection/pi-bridge/state 1`.

#### 4.4 ⭐ A 10-minute outage on the LAN, then `scripts/check-late-arrivals.sql`: no gaps, no duplicates (11 minutes)

**Before cutting** (during the outage, your laptop may be without internet), create `scripts/check-late-arrivals.sql` with **Copy raw file** from [`code/scripts/check-late-arrivals.sql`](code/scripts/check-late-arrivals.sql); read its header while you wait:

```sql
-- check-late-arrivals.sql - the proof of the Mini Smart Home "unplug the home internet for 10 minutes" test (Module 27): are the
-- readings of ONE device during the outage in the central database (the VPS, or the free-path Pi) with their original event time
-- (ts), with no gaps and no duplicate rows? A late arrival = it arrived (the received_at column) more than 60 seconds after its event time.
--
-- Run it from the project root on the CENTRAL machine, about a minute after the internet is connected again. Three values (psql -v):
--   device = the device_id, for example a4cf12e5b7c0;  start, end = WIB times a little before the outage and after reconnecting
--   Linux, macOS, VPS, Pi (bash/zsh; one line):
--     docker compose exec -T db psql -U postgres -d smarthome -v device=a4cf12e5b7c0 -v "start=2026-10-29 10:00" -v "end=2026-10-29 10:20" < scripts/check-late-arrivals.sql
--   PowerShell (Windows; not tested by the author): Get-Content scripts/check-late-arrivals.sql | docker compose exec -T db psql ... (same values)
--
-- Passes when: largest_gap is about 10 seconds at most (Node 1 sends every 10 seconds, plus an immediate send when its
-- state changes), gaps_over_12_seconds = 0, duplicates = 0, and arrived_late > 0 (proof that those readings really came later).
-- The per-minute table shows that the minutes of the outage still hold readings.
\set ON_ERROR_STOP on
\if :{?device}
\else
  \echo 'fill in device, start, and end: psql ... -v device=<device_id> -v "start=YYYY-MM-DD HH:MM" -v "end=YYYY-MM-DD HH:MM"'
  \quit
\endif
\if :{?start}
\else
  \echo 'start not filled in: -v "start=YYYY-MM-DD HH:MM" (WIB time)'
  \quit
\endif
\if :{?end}
\else
  \echo 'end not filled in: -v "end=YYYY-MM-DD HH:MM" (WIB time)'
  \quit
\endif
-- the typed times and the shown times = WIB (the database always stores times in UTC); QUIET = no "SET" line
\set QUIET on
SET TIME ZONE 'Asia/Jakarta';
\set QUIET off

\echo '== Summary (WIB times) =='
WITH b AS (
  SELECT ts, received_at, ts - lag(ts) OVER (ORDER BY ts) AS gap
  FROM readings
  WHERE device_id = :'device' AND ts >= :'start' AND ts < :'end'
)
SELECT count(*) AS readings,
       to_char(min(ts), 'HH24:MI:SS') AS first,
       to_char(max(ts), 'HH24:MI:SS') AS last,
       max(gap) AS largest_gap,
       count(*) FILTER (WHERE gap > interval '12 seconds') AS gaps_over_12_seconds,
       count(*) FILTER (WHERE received_at - ts > interval '60 seconds') AS arrived_late,
       (SELECT count(*) FROM (SELECT 1 FROM readings
          WHERE device_id = :'device' AND ts >= :'start' AND ts < :'end'
          GROUP BY device_id, ts HAVING count(*) > 1) AS k) AS duplicates
FROM b;

\echo '== Per minute: readings and the ones that arrived later (late arrivals) =='
SELECT to_char(date_trunc('minute', ts), 'HH24:MI') AS minute,
       count(*) AS readings,
       count(*) FILTER (WHERE received_at - ts > interval '60 seconds') AS late,
       to_char(max(received_at), 'HH24:MI:SS') AS last_arrival
FROM readings
WHERE device_id = :'device' AND ts >= :'start' AND ts < :'end'
GROUP BY 1
ORDER BY 1;

\echo '== Gaps over 12 seconds (empty = no reading was lost) =='
WITH b AS (
  SELECT ts, ts - lag(ts) OVER (ORDER BY ts) AS gap
  FROM readings
  WHERE device_id = :'device' AND ts >= :'start' AND ts < :'end'
)
SELECT to_char(ts - gap, 'HH24:MI:SS') AS from_time, to_char(ts, 'HH24:MI:SS') AS to_time, gap
FROM b
WHERE gap > interval '12 seconds'
ORDER BY ts;
```

Also copy [`.gitattributes`](code/.gitattributes) to the project root (+ `*.sql text eol=lf`); on Windows, if VS Code's status bar says `CRLF`, click it and choose `LF` (CRLF not tested by the author). Read 4.5 too: its button is pressed in the middle of the outage.

**Cut the Pi → center road for 10 minutes**, and note the times it was cut and reconnected (WIB):

- **Kit B:** turn off the laptop's Wi-Fi (a wired laptop: pull out its cable). The gateway isn't told, exactly like an internet outage, so the blind window gets tested too. SSH to the Pi drops too; the dashboard `http://localhost` stays open. Not recorded by the author (one machine played the laptop and the Pi). After the Wi-Fi is back, the laptop's IP must be the same (a fixed address in the router, Module 26 6.3).
- **The stand-in** (without a Pi, or with Node 1 played by the simulator on the laptop): at the laptop's project root, `docker compose stop mosquitto`, then 10 minutes later `docker compose start mosquitto` (`broker-account` and `mqtt-certificate` run too: `Exited` is normal). A stopped broker refuses connections at once, so the blind window is NOT tested (that's [Practice 10](#practice-10--the-10-minute-home-internet-unplug-test-30-minutes)'s part); the queue still survives thanks to the backend's persistent session ([2.1](#21-three-changes-in-src-envts-and-serverts-mqttts-and-commandsts-8-minutes)). During the outage, the 4.3 queue command on the gateway shows a number rising ±6 per minute (the author's lab, the third minute: `$SYS/broker/store/messages/count 77`).

After reconnecting, the bridge tries again at least every 30 seconds (lab, the stand-in: it came in 24 seconds after `start`). A 🔴 then ✅ "Silent node" from Grafana in Telegram during this drill is normal (Practice 10).

±1 minute after reconnecting, at the laptop's project root (one line; `<device_id>` = Node 1, or `f00d00000001` for the simulator; `start` and `end` = WIB times a little before the outage and after reconnecting):

```text
docker compose exec -T db psql -U postgres -d smarthome -v device=<device_id> -v "start=YYYY-MM-DD HH:MM" -v "end=YYYY-MM-DD HH:MM" < scripts/check-late-arrivals.sql
```

PowerShell (not tested by the author): `Get-Content scripts/check-late-arrivals.sql | docker compose exec -T db psql …` with the same values.

**Expected output** (the author's lab, the stand-in variant shortened to 3 minutes, 22:43–22:46 WIB):

```text
== Summary (WIB times) ==
 readings |  first   |   last   | largest_gap | gaps_over_12_seconds | arrived_late | duplicates
----------+----------+----------+-------------+----------------------+--------------+------------
       40 | 22:41:03 | 22:47:53 | 00:00:30    |                    1 |           15 |          0
(1 row)

== Per minute: readings and the ones that arrived later (late arrivals) ==
 minute | readings | late | last_arrival
--------+----------+------+--------------
 22:41  |        5 |    0 | 22:41:43
 22:42  |        5 |    0 | 22:42:53
 22:43  |        6 |    3 | 22:46:58
 22:44  |        6 |    6 | 22:46:58
 22:45  |        6 |    6 | 22:46:58
 22:46  |        6 |    0 | 22:46:58
 22:47  |        6 |    0 | 22:47:53
(7 rows)

== Gaps over 12 seconds (empty = no reading was lost) ==
 from_time | to_time  |   gap
-----------+----------+----------
 22:41:43  | 22:42:13 | 00:00:30
(1 row)
```

How to read it:

- The outage minutes (22:43–22:46) still hold **6 readings** (Node 1's 10-second rhythm); the queue arrived at 22:46:58. The `late` column only counts the ones that arrived more than 60 seconds after their `ts`, so minute 22:46 shows `0`.
- The only gap (30 seconds, 22:41) happened **before** the outage, when 4.2 restarted the center and recreated the gateway. Choose a `start` after 4.2.
- `duplicates` is always 0 because of the key `(device_id, ts)` (Concept 9), so it isn't a finding of its own.
- Values missing? The script stops with `fill in device, start, and end: …`.

Save to the branch:

```text
git add scripts .gitattributes
git commit -m "scripts/check-late-arrivals.sql for the outage test"
```

The same script proves T3 in [10.5](#105--t3-scriptscheck-late-arrivalssql-on-the-vps-no-gaps-and-no-duplicates-8-minutes) (the VPS) and [11.9](#119--t3-free-the-home-internet-down-for-10-minutes-the-pis-history-stays-whole-15-minutes) (the free-path Pi).

**You pass this ⭐ step** when your 10-minute outage gives `gaps_over_12_seconds 0`, a gap list of `(0 rows)`, ±6 readings per minute in the outage minutes, and `arrived_late` above 0. The free path: save the output as the T3-free (b) proof.

#### 4.5 ⭐ A lamp command during the outage: up is kept, down is not (3 minutes)

Do this in the 2nd or 3rd minute of the 4.4 outage, so that more than 2 minutes have passed when it reconnects. In the dashboard at `http://localhost`, open Node 1, whose lamp is **Off**, then click **Lamp**. Kit B: the button says `Waiting for device confirmation…`, then the toast from [3.4](#34-indexhtml-the-offline-message-the-2-minute-toast-and-version-130-4-minutes) appears:

```text
Lamp: not confirmed by the device yet; the server tries again if it hears from the device within 2 minutes.
```

After reconnecting, once the late arrivals have come in, at the laptop's project root: `docker compose logs backend`. **Expected output** (the author's lab, Practice 10's simulated internet outage test, the same code; cut):

```text
[23:08:57] WARN: command c-20261029-160852-3 (api) to f00d00000001: no ack within 5 seconds
[23:18:12] INFO: command lamp = true (api) to f00d00000001 not carried out for more than 2 minutes: not sent again
```

The lamp stays **Off**. This is "down is not kept": the central broker doesn't keep `cmd` for a bridge that's down (`cleansession true`), and backend 1.4.0 forgets manual commands not carried out for more than 2 minutes. If the connection comes back less than 2 minutes after you pressed the button, the backend sends it again and the lamp turns on late, as the toast says (log: `… command sent again`).

The stand-in variant: the backend knows its broker is down and refuses at once (the author's lab, through the API: `503` `{"message":"the backend isn't connected to the broker"}`). You only see the 504 toast and `not sent again` in Practice 10.

**You pass this ⭐ step** when the lamp stays **Off** after reconnecting. Kit B: the 504 toast appears during the outage and the backend log holds `… not sent again`. The stand-in: the toast `… isn't connected to the broker` (503).

> ⬆️ **Done with Practice 4?** Time to choose your path (the "Choose your path" table at the start of the module). The main path: read [Concept 2](#2-vps-a-rented-computer-that-runs-24-hours-a-day) to [Concept 4](#4-a-leaky-firewall-ufw-and-docker), then [Practice 5](#practice-5--the-main-path-rent-a-vps-and-lock-its-doors-60-minutes). The free path: do [6.4](#64--nslookup-the-internets-phone-book-knows-your-name-now-5-minutes) if the nameservers are active already, read [Concept 10](#10-the-free-path-cloudflare-tunnel), then [Practice 11](#practice-11--the-free-path-everything-on-the-pi-and-cloudflare-tunnel-85-minutes).

### Practice 5 — The main path: rent a VPS and lock its doors (60 minutes)

> 🖥️ **Tools used:** a **terminal on the laptop** (the VS Code terminal, PowerShell, or the macOS Terminal) for `ssh-keygen` and `ssh`; the **VPS provider's panel** in the browser; an **SSH terminal to the VPS** from 5.2 on (always Linux; `sudo` and `nano` are typed here), two windows at once in 5.4; your password manager. Your home on the laptop and the Pi isn't touched. Concepts used: 2, 3, and 4.
>
> ⭐ **Required for the main path** — steps 5.4, 5.5, and 5.7: `sshd -T` shows password and root logins off, the second window logs in, ufw is active with 22 allowed, and `docker version` (its `Server` part) answers without `sudo` when you're logged in as `house`.

> [!NOTE]
> **Not recorded by the author.** The author has no VPS. This practice was written from the official documentation of Ubuntu (OpenSSH, ufw, automatic updates) and Docker (*Install Docker Engine on Ubuntu*), read 29 Oct 2026; a stand-in `sshd -T` in an Ubuntu container wasn't made either. So this practice has no **Expected output** boxes: what you should see is written as **Expected result**. Provider panels differ, so their menus are described in general terms on purpose.

> 🔀 **The free path:** you don't rent a VPS. Skip this practice: do [6.4](#64--nslookup-the-internets-phone-book-knows-your-name-now-5-minutes) as soon as the nameservers are active, read [Concept 10](#10-the-free-path-cloudflare-tunnel), then go to [Practice 11](#practice-11--the-free-path-everything-on-the-pi-and-cloudflare-tunnel-85-minutes).

This practice doesn't change any project file, so there's no commit. In every command, replace `203.0.113.10` (an example address reserved for documentation) with your VPS's IP.

#### 5.1 Choose and rent a 2 GB VPS, then paste your ed25519 public key (8 minutes)

**Choose the plan** on the provider's site (the reasons are in [Concept 2](#2-vps-a-rented-computer-that-runs-24-hours-a-day)):

| Choice | What to pick |
| :-- | :-- |
| RAM | 2 GB (1 GB isn't enough) |
| Processor and disk | 1–2 vCPU, disk ≥ 25 GB |
| System | Ubuntu Server 26.04 LTS (not offered yet: 24.04 LTS), amd64 |
| Location | Indonesia or Singapore |
| Billing | monthly or hourly |

**Prepare an SSH key on the laptop.** Already made one in [🔬 Module 12](../../phase-2-connectivity/module-12-raspberry-pi-and-linux/README.md#-technical-deep-dive-optional) (the fold *Logging in without a password, using an SSH key*)? Use that key. Not yet? In the laptop terminal:

```text
ssh-keygen -t ed25519
```

Press **Enter** for the default file name, then type a passphrase (a password that protects the key; recommended, keep it in your password manager). If it asks whether an existing file may be overwritten, answer `n`: you already have a key, and the Pi may be using it.

Show the public key (Linux/macOS):

```text
cat ~/.ssh/id_ed25519.pub
```

Windows PowerShell (not tested by the author): `type $env:USERPROFILE\.ssh\id_ed25519.pub`. The output is one long line starting with `ssh-ed25519`. When you create the VPS, paste that line **whole** into the SSH key field of the provider's panel. What you paste is always the content of the file ending in `.pub`; `id_ed25519` without `.pub` is the private key and never leaves the laptop. A provider without an SSH key field? Log in once with the root password they give you; your key is added in 5.3, and password login is turned off in 5.4.

As soon as the VPS is running, the panel shows its **public IPv4 address**. Write it down in `learn-iot/module-27/` together with the plan name and its monthly price (used again in [➕ F](#f-save-your-study-notes-the-t1t3-proof-the-fingerprint-the-monthly-cost-and-docker-stats)).

#### 5.2 The first SSH login and the host fingerprint (5 minutes)

From the laptop terminal:

```text
ssh root@203.0.113.10
```

Your panel names another user? Use that name; the commands after it stay the same because they all start with `sudo`. Like your first greeting to the Pi in [Module 12](../../phase-2-connectivity/module-12-raspberry-pi-and-linux/README.md#4-ssh-a-remote-terminal), SSH shows the VPS's **key fingerprint** (the string after `SHA256:`) and asks whether you're sure. If the provider's panel shows that fingerprint (for example in a web console), compare it first; then type `yes` and press **Enter**. The laptop records it in `known_hosts` and from then on checks that the one answering is always the same VPS (a VPS rebuilt with the same IP: `REMOTE HOST IDENTIFICATION HAS CHANGED`, [🚨](#-troubleshooting)). With the key from 5.1, the only thing asked afterwards is your key's passphrase (if it has one), not a VPS password.

**Expected result:** the VPS prompt, usually with the user name and the VPS's name. Check the processor type:

```text
dpkg --print-architecture
```

`amd64` matches what this module assumes ([Concept 2](#2-vps-a-rented-computer-that-runs-24-hours-a-day)); `arm64` works too, because the images are built on the VPS itself in [7.4](#74-docker-compose-build-on-the-vps-before-the-other-services-start-12-minutes).

#### 5.3 A regular user `house` with `sudo` and your SSH key (6 minutes)

Still in the first session (VPS):

```text
sudo adduser house
```

Type a strong password twice and keep it in your password manager: `sudo` asks for this password; it isn't used to log in over SSH. The other questions (full name and so on) can be skipped with **Enter**. Add `house` to the `sudo` group:

```text
sudo usermod -aG sudo house
```

Then leave your public key for `house`. Keep this VPS window open, and in a new **laptop** terminal (Linux/macOS):

```text
ssh-copy-id house@203.0.113.10
```

This command asks for the `house` password once, then copies `id_ed25519.pub` to `/home/house/.ssh/authorized_keys`. Windows has no `ssh-copy-id`, and some providers already turn password login off, so the command is refused with `Permission denied (publickey)`. In both cases, paste the key through the first session on the VPS (not tested by the author):

```text
sudo mkdir -p /home/house/.ssh
sudo nano /home/house/.ssh/authorized_keys
```

Paste the `ssh-ed25519 …` line from 5.1 (Windows: right-click; macOS: **Cmd + V**; Linux: **Ctrl + Shift + V**), save (**Ctrl + O**, **Enter**), exit (**Ctrl + X**), then hand that folder over to `house`:

```text
sudo chown -R house:house /home/house/.ssh
sudo chmod 700 /home/house/.ssh
sudo chmod 600 /home/house/.ssh/authorized_keys
```

Leave the VPS (`exit`), then log in as your new user:

```text
ssh house@203.0.113.10
```

**Expected result:** you're in without being asked for the `house` password. Make sure `sudo` works before root is closed in 5.4:

```text
sudo whoami
```

After the `house` password, the answer is `root`.

#### 5.4 ⭐ Turn off password and root logins: `00-lock.conf`, `sshd -T`, and a second window (10 minutes)

The reasons are in [Concept 3](#3-ssh-keys-and-a-regular-user-password-login-and-root-turned-off). Still as `house` on the VPS, first look at the SSH settings folder:

```text
ls /etc/ssh/sshd_config.d/
```

There's a `50-cloud-init.conf`? That's Concept 3's trap. Leave it: your file is numbered `00`, so it's read first and wins. Create the file:

```text
sudo nano /etc/ssh/sshd_config.d/00-lock.conf
```

Type these three lines exactly, save (**Ctrl + O**, **Enter**), and exit (**Ctrl + X**):

```text
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
```

Check the syntax:

```text
sudo sshd -t
```

No output = correct. An error message? It names the file and the line: fix it first, don't go on. Then check the values that are really used:

```text
sudo sshd -T | grep -Ei 'passwordauthentication|kbdinteractive|permitrootlogin'
```

**Expected result** (OpenSSH documentation, not recorded): three lowercase lines, `passwordauthentication no`, `kbdinteractiveauthentication no`, and `permitrootlogin no` (the order may differ). One of them isn't `no`? Your file isn't read, or it loses ([🚨](#-troubleshooting) *Password login still on according to `sshd -T`*). With three times `no`, apply it:

```text
sudo systemctl restart ssh.service
```

The session that's open doesn't drop. **Don't close this window.** Open a **second** terminal on the laptop and log in again:

```text
ssh house@203.0.113.10
```

It works? Only then may the first window be closed. It fails? In the first window, still open, delete the file (`sudo rm /etc/ssh/sshd_config.d/00-lock.conf`), run `sudo systemctl restart ssh.service` again, then check the `house` key from 5.3.

Last, prove it from outside. In a laptop terminal that isn't connected to the VPS, try to log in as root, then as `house` without the key:

```text
ssh root@203.0.113.10
```

```text
ssh -o PubkeyAuthentication=no house@203.0.113.10
```

**Expected result:** both refused with `Permission denied (publickey)`. Root can't log in at all, and without the key there's no way in: no password question.

**You pass this ⭐ step** when `sshd -T` shows three `no` values, the second window logs in as `house` with the key, and the last two attempts are refused with `Permission denied (publickey)`.

#### 5.5 ⭐ ufw: allow 22 first, then 80, 443, and 8883 (8 minutes)

The firewall that guarded your laptop in [Module 11](../../phase-2-connectivity/module-11-mqtt-and-data-contract/README.md#14-allow-mosquitto-through-the-firewall) now guards the VPS. The order matters ([Concept 4](#4-a-leaky-firewall-ufw-and-docker)): as soon as ufw is on, incoming connections that aren't listed are refused, your SSH included. Allow 22 **first** (`ufw` not found? Install it first: `sudo apt install ufw`):

```text
sudo ufw allow 22/tcp
```

Then the web doors (80 for Let's Encrypt and the redirect to `https://`; 443 for HTTPS, over TCP and also UDP for HTTP/3) and the TLS broker:

```text
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw allow 8883/tcp
```

The number 22 is written directly, without ufw's `OpenSSH` application profile. Turn it on:

```text
sudo ufw enable
```

ufw warns that this command may disrupt existing SSH connections: type `y`, then **Enter**. Check:

```text
sudo ufw status verbose
```

**Expected result** (Ubuntu documentation, not recorded): status active, incoming connections denied by default, and five `ALLOW` rules for 22/tcp, 80/tcp, 443/tcp, 443/udp, and 8883/tcp (each with a copy for IPv6). Then open a new window and log in again as in 5.4: SSH must stay open. It fails? Don't close the old window: fix the rule for 22 (or `sudo ufw disable`), then try again ([🚨](#-troubleshooting) *Locked out of the VPS …*). Your provider's panel has its own firewall? Open the same numbers there too; that firewall stands in front of the VPS, and ufw can't get past it.

Remember Concept 4: the 80, 443, and 8883 rules in ufw are only a note of intent. Docker opens container counters without asking ufw, so `sudo ufw deny 1883` doesn't close the broker's counter; the guard of 1883 is `MQTT_ADDRESS=127.0.0.1` in the VPS `.env` ([7.2](#72-the-vps-env-new-secrets-and-the-vps-column-of-the-values-per-place-table-10-minutes)). The proof is taken from outside in [8.3](#83--t2a-without-tls-refused-at-8883-and-1883-unreachable-from-outside-10-minutes).

**You pass this ⭐ step** when `ufw status verbose` is active with all five `ALLOW` rules, and SSH from a new window still logs in.

#### 5.6 A 2 GB swap for building images (5 minutes)

Swap = part of the disk used as spare RAM: slow, but it can keep the image build in [7.4](#74-docker-compose-build-on-the-vps-before-the-other-services-start-12-minutes) from stopping because memory runs out (`npm ci` and Vite use a lot of memory). This is the author's advice for a 2 GB VPS, not a step from the official documentation, and it hasn't been tested on a VPS. First see whether the provider already gave you one:

```text
free -h
```

The `Swap:` line already has a size (not `0B`)? The provider gave you one: skip this step. If it's `0B`, create a 2 GB swap file:

```text
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

To keep it active after the VPS restarts, open `/etc/fstab`:

```text
sudo nano /etc/fstab
```

Add this one line at the very bottom, save, then exit. Don't change any other line in that file:

```text
/swapfile none swap sw 0 0
```

`free -h` once more: the `Swap:` line is now ±2 GB.

#### 5.7 ⭐ Docker Engine from Docker's apt repository and the `docker` group (12 minutes)

It's the same as the Pi in [6.1 of Module 26](../module-26-docker-compose/README.md#61-pi-docker-engine-from-dockers-apt-repository-the-docker-group-and-git-20-minutes), only the page is the one for **Ubuntu**: <https://docs.docker.com/engine/install/ubuntu/>, the section *Install using the apt repository*. Copy the commands from that page:

1. Remove the conflicting unofficial packages (`docker.io`, `docker-compose`, `docker-compose-v2`, `docker-doc`, `docker-buildx`, `podman-docker`, `containerd`, `runc`) with the command at the top of that page. On a new VPS, usually none of them is installed.
2. Install Docker's key and repository source (*Set up Docker's apt repository*).
3. Install the packages:

```text
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

The `get.docker.com` script isn't used, the same as in Module 26. To be honest: the author's lab machine uses the Ubuntu packages (Docker 29.1.3, Compose 2.40.3), the very packages that page tells you to remove. The `docker compose` commands in this module are the same; the version from Docker's repository is newer (latest 29.9.2, 20 Oct 2026). Then add `house` to the `docker` group:

```text
sudo usermod -aG docker house
```

The `docker` group equals root (6.1 of Module 26), so only `house` goes in. Log out (`exit`) and back in so the membership takes effect, then check without `sudo`:

```text
docker version
```

```text
docker compose version
```

**Expected result** (not recorded on a VPS): the `Client` and `Server` parts of `docker version`, then one line `Docker Compose version …`. The `Server` part is the proof; `docker compose version` answers even before the group takes effect. Refused with a `permission denied` that names `docker.sock`? You haven't logged out of SSH and back in yet. Last, Git for [7.1](#71-git-push-on-the-laptop-git-clone-on-the-vps-6-minutes): `git --version` (not found? `sudo apt install git`).

**You pass this ⭐ step** when, as `house` without `sudo`, `docker version` shows its `Server` part and `docker compose version` answers.

#### 5.8 The VPS clock in UTC and automatic security updates (6 minutes)

```text
timedatectl
```

The `Time zone` line on a VPS usually says `UTC`, seven hours behind WIB. Leave it. The backend's schedule (the morning report at 07:00) and the backend log stay in WIB, because the zone is written in the code ([Module 19](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#8-scheduling-an-alarm-clock-for-the-server)) and Compose gives the backend `TZ: Asia/Jakarta`. The Caddy and Grafana logs are always UTC (add 7 hours). What uses the VPS clock: **cron**, the VPS's alarm clock, in [8.6](#86--renewal-scriptsrenew-mqtt-certificatesh-and-a-weekly-cron-8-minutes): Monday 03:17 VPS time (UTC) = 10:17 WIB.

Ubuntu's security updates are already automatic (`unattended-upgrades`). See its settings:

```text
cat /etc/apt/apt.conf.d/20auto-upgrades
```

**Expected result** (Ubuntu documentation, not recorded): two lines, `Update-Package-Lists` and `Unattended-Upgrade`, both set to `"1"` (on). The VPS isn't restarted automatically, and Docker from its own repository isn't updated with them ([Concept 2](#2-vps-a-rented-computer-that-runs-24-hours-a-day)): updating it stays your manual job.

> ⬆️ **Done with Practice 5?** You have your VPS's IP now: do [6.3](#63--the-main-path-a-records-iot-and-mqtt-to-the-vps-ip-dns-only-no-aaaa-5-minutes) and [6.4](#64--nslookup-the-internets-phone-book-knows-your-name-now-5-minutes) (the A records and `nslookup`), then read [Concept 6](#6-certificates-in-full-chain-name-and-dates) and [Concept 7](#7-caddy-as-the-front-door-automatic-https-and-trust_proxy) before [Practice 7](#practice-7--the-main-path-the-center-on-the-vps-with-https-75-minutes).

### Practice 6 — Domain and DNS: your own name in the internet's phone book (25 minutes, plus waiting time)

> 🖥️ **Tools used:** a **browser** on the laptop for the **registrar's** site and the **Cloudflare dashboard**; **any terminal** (laptop, Pi, or VPS) for `nslookup` in 6.4. Your home isn't touched and no project file changes, so there's no commit. This practice is split: 6.1–6.2 on the first day, 6.3–6.4 later (the main path after Practice 5, the free path only 6.4; see the ➡️ at the end of 6.2). Concepts used: 5.
>
> ⭐ **Required** — steps 6.3 (the main path) and 6.4: gray-cloud A records `iot` and `mqtt` point at your VPS's IP, and `nslookup` to `1.1.1.1` answers that IP for both names (the free path: Cloudflare's nameservers are active).

> [!NOTE]
> **Not recorded by the author.** The author didn't buy a domain and has no Cloudflare account. The rules in 6.1–6.3 come from PANDI's Registration Policy v9.0 and Cloudflare's documentation (read 29 Oct 2026); the click order at the registrar and in the dashboard is described in general terms. Only 6.4 has an **Expected output** box, from the simulated DNS server in the author's lab.

#### 6.1 Buy a `.my.id` domain from a PANDI-accredited registrar (7 minutes)

Both paths need a domain ([Concept 5](#5-domains-and-dns-the-internets-phone-book)), and it's the only thing bought before Practices 1–4. On the site of an Indonesian registrar accredited by PANDI (no brand is named on purpose):

1. Search for the name you want in the domain search box, for example `yourname.my.id`. Use lowercase letters, digits, or hyphens; pick something short and easy to type on a phone, because this name shows up in the dashboard's address and in every certificate.
2. Register as an **individual** with an email you still read. According to PANDI's policy v9.0 (30 Sep 2024; it may have been updated), that email must be verified, so click the verification link sent there. Have your KTP (ID card) ready if asked.
3. Pay for one year. Extra packages (hosting, email) aren't needed: the domain alone is enough. Write down the first-year price, the renewal price, and the expiry date in `learn-iot/module-27/` ([➕ F](#f-save-your-study-notes-the-t1t3-proof-the-fingerprint-the-monthly-cost-and-docker-stats)). The Syllabus estimates about IDR 15,000–30,000/year; the author found no official price.

Already have another domain? You can use it: replace `yourname.my.id` throughout the module with your domain. Keep the registrar account password (and Cloudflare's in 6.2) in your password manager and turn on two-step verification if offered: whoever holds that account can point your name at another server. Forget to renew = the dashboard and the broker disappear from the internet too.

#### 6.2 Cloudflare's free plan: change the nameservers, then wait until it's active (8 minutes)

This step moves "the office that answers questions about your name" from the registrar to Cloudflare. The free path must do it (Cloudflare Tunnel needs the domain on Cloudflare); the main path may choose the 🔀 below.

1. Create a Cloudflare account, add your domain (`yourname.my.id`, without `iot.` or `www.`), then choose the free plan.
2. Cloudflare gives you **two nameserver names**. Copy both exactly into your notes.
3. In the registrar's panel, open the nameserver settings of that domain, replace the registrar's default nameservers with the two names from Cloudflare, then save.
4. Wait until the Cloudflare dashboard says your domain is active. The author doesn't know how long it takes for `.my.id`: it may be a few minutes, it may be hours.

Once the nameservers have moved, every record is written at Cloudflare; the DNS lines in the registrar's panel aren't used anymore. Cloudflare's DNS list already has other lines (for example the registrar's defaults)? Leave them, except lines named `iot` or `mqtt`: delete those first. The author hasn't checked Cloudflare's free-plan support for `.my.id`. If your domain is refused, see [🚨](#-troubleshooting) *Cloudflare refuses a `.my.id` domain*.

> 🔀 **Without Cloudflare (the main path only):** keep the registrar's default nameservers, skip 6.2, and write the two A records of 6.3 in the registrar's DNS panel. There's no cloud switch there: the answer is always the IP you wrote, the same as DNS only. The free path doesn't have this choice.

> ➡️ **Stop here for now.** Waiting for the nameservers to become active can take hours. Meanwhile, do [Practice 1](#practice-1--the-workbench-a-branch-the-fingerprint-and-a-backup-15-minutes) to [Practice 4](#practice-4--store-and-forward-at-home-first-the-lan-bridge-and-a-10-minute-outage-drill-30-minutes) (no cost). The main path comes back to [6.3](#63--the-main-path-a-records-iot-and-mqtt-to-the-vps-ip-dns-only-no-aaaa-5-minutes) after [Practice 5](#practice-5--the-main-path-rent-a-vps-and-lock-its-doors-60-minutes) gives you the VPS's IP; the free path comes back to [6.4](#64--nslookup-the-internets-phone-book-knows-your-name-now-5-minutes) before [Practice 11](#practice-11--the-free-path-everything-on-the-pi-and-cloudflare-tunnel-85-minutes).

#### 6.3 ⭐ The main path: A records `iot` and `mqtt` to the VPS IP, DNS only, no AAAA (5 minutes)

You need the VPS's IPv4 address from [5.1](#51-choose-and-rent-a-2-gb-vps-then-paste-your-ed25519-public-key-8-minutes). In the Cloudflare dashboard, open your domain's DNS section and add two records:

| Type | Name | Content (IPv4) | Proxy status | TTL |
| :-- | :-- | :-- | :-- | :-- |
| A | `iot` | `203.0.113.10` (replace with your VPS's IP) | gray cloud (**DNS only**) | small, for example 5 minutes |
| A | `mqtt` | the same IP | gray cloud (**DNS only**) | small, for example 5 minutes |

- **Name** is usually just `iot` or `mqtt`; the panel adds `.yourname.my.id` by itself. If the panel asks for the full name, write `iot.yourname.my.id`.
- **Check the cloud switch before saving:** it must be gray. An orange-cloud `mqtt.` is answered with a Cloudflare address, which never opens 8883, so the Pi's bridge would never arrive; `iot.` is gray so that Caddy on the VPS holds its own ID card ([Concept 5](#5-domains-and-dns-the-internets-phone-book)).
- **Don't create an AAAA record** for either name: the `0.0.0.0` counters on the VPS are IPv4 only ([Concept 4](#4-a-leaky-firewall-ufw-and-docker)).
- **A small TTL** while setting up: if you mistype the IP and then fix it, anyone who already asked keeps using the old answer until its TTL runs out.

Don't start the center on the VPS ([7.7](#77--docker-compose-up--d-on-the-vps-two-certificates-from-lets-encrypt-8-minutes)) before 6.4 answers the right IP: Caddy asks for certificates right away, and failures count toward Let's Encrypt's rate limits ([Concept 6](#6-certificates-in-full-chain-name-and-dates)).

> 🔀 **The free path:** create neither `iot` nor `mqtt` here. `iot` is created as a tunnel route in [11.7](#117--cloudflare-tunnel-the-token-in-env-a-route-to-httpweb80-and-the-tunnel-profile-12-minutes), and the free path's broker doesn't leave the home, so `mqtt` isn't needed.

**You pass this ⭐ step** when the DNS list holds two A records, `iot` and `mqtt`, both pointing at your VPS's IP with a gray cloud, and no AAAA record for either name.

#### 6.4 ⭐ `nslookup`: the internet's phone book knows your name now (5 minutes)

The command is the same as in [🔁 Step 3](#step-3--the-internets-phone-book-nslookup-a-records-cname-and-ttl), this time for your name. In any terminal (laptop, Pi, or VPS), one at a time:

```text
nslookup iot.yourname.my.id 1.1.1.1
```

```text
nslookup mqtt.yourname.my.id 1.1.1.1
```

**Expected output (the author's lab, simulated DNS; names and IPs replaced by their counterparts):** the answer part for `iot.`

```text
Non-authoritative answer:
Name:	iot.yourname.my.id
Address: 203.0.113.10
```

For `mqtt.` it's the same, with `Name:` `mqtt.yourname.my.id`. Above it there are two lines `Server:` and `Address:`, the server you asked: on your laptop `1.1.1.1` as in the warm-up, in the author's lab the simulated DNS server. `Non-authoritative answer` is normal: the one answering is the resolver `1.1.1.1`, not your domain's nameserver. What you look for: one `Address:` line in the answer part, exactly your VPS's IP. A Cloudflare address shows up, like the `open-meteo.com` answer in the warm-up? The cloud is still orange: change it to gray in 6.3. Another IP: fix the content in 6.3. The name isn't found, or the answer is still the old IP? See [🚨](#-troubleshooting) *`nslookup` doesn't answer yet, or still gives the old answer*.

> 🔀 **The free path:** `iot` and `mqtt` don't exist yet, so your 6.4 = making sure Cloudflare's nameservers are active:
>
> ```text
> nslookup -type=NS yourname.my.id 1.1.1.1
> ```
>
> The answer must name the two nameservers from 6.2 (the author didn't record its output). Still the registrar's default names? Wait, then try again. `iot` only answers after the tunnel route is created in [11.7](#117--cloudflare-tunnel-the-token-in-env-a-route-to-httpweb80-and-the-tunnel-profile-12-minutes).

From a phone over mobile data, your name is proven again in [7.8](#78--the-padlock-at-httpsiotyournamemyid-308-logging-in-and-the-secure-cookie-6-minutes) (the free path: 11.8).

**You pass this ⭐ step** when both `nslookup` commands answer one `Address:` equal to your VPS's IP (the free path: `nslookup -type=NS` names two nameservers from Cloudflare).

> ⬆️ **Done with Practice 6?** The main path: read [Concept 6](#6-certificates-in-full-chain-name-and-dates) and [Concept 7](#7-caddy-as-the-front-door-automatic-https-and-trust_proxy), then continue to [Practice 7](#practice-7--the-main-path-the-center-on-the-vps-with-https-75-minutes). The free path: read [Concept 10](#10-the-free-path-cloudflare-tunnel), then continue to [Practice 11](#practice-11--the-free-path-everything-on-the-pi-and-cloudflare-tunnel-85-minutes).

### Practice 7 — The main path: the center on the VPS with HTTPS (75 minutes)

> 🖥️ **Tools used:** an **SSH terminal to the VPS** (`ssh house@203.0.113.10`, folder `/home/house/mini-smart-home`) for almost every step; **VS Code** on the laptop, a terminal at the **project root**, for 7.1, 7.5, and 7.6; **Chrome** or **Edge** on the laptop (with DevTools) for 7.8–7.10; a **phone over mobile data** for 7.8–7.9. Concepts used: 6 and 7.
>
> ⭐ **Required for the main path** — steps 7.5, 7.6, 7.7, 7.8, and 7.9: the history fingerprint on the VPS equals the laptop's, the laptop's backend is stopped, Caddy gets two certificates, `https://iot.yourname.my.id` has a padlock and a `Secure` cookie, and the login limit is counted per visitor.

The **Expected output** boxes here were recorded on the simulated VPS of the author's lab (containers on a Pi 5, a stand-in CA in place of Let's Encrypt). The author hasn't tried a real VPS and Let's Encrypt yet, so the times and sizes are only examples. The free path skips this practice.

#### 7.1 `git push` on the laptop, `git clone` on the VPS (6 minutes)

The VPS takes the code from GitHub with `git` in the terminal ([Module 16](../../phase-3-backend-data/module-16-backend-typescript-api-git/README.md#3-git-in-the-terminal-the-same-buttons-without-the-buttons)), so everything it needs must already be on the `feature/to-the-internet` branch.

**Laptop, VS Code.** Open `frontend/caddy/Caddyfile`. Its site address line is still `:80 {` (Module 26)? This file isn't the Module 27 version yet: open [`code/frontend/caddy/Caddyfile`](code/frontend/caddy/Caddyfile), click **Copy raw file**, paste it over the whole content, then save. The line is now `{$WEB_DOMAIN::80} {$MQTT_DOMAIN} {` (read in 7.7); with `WEB_DOMAIN` empty, the laptop stays `http://localhost`. In the project-root terminal, one at a time:

```text
git add frontend/caddy/Caddyfile
git commit -m "Caddyfile Module 27: HTTPS, /grafana/, the broker name"
git push
```

**VPS, SSH terminal** (starting folder `/home/house`; the repository has been public since Module 3, no login needed):

```text
git clone https://github.com/<account>/mini-smart-home.git
```

```text
cd mini-smart-home
git switch feature/to-the-internet
```

**Expected output** (the author's lab):

```text
branch 'feature/to-the-internet' set up to track 'origin/feature/to-the-internet'.
Switched to a new branch 'feature/to-the-internet'
```

Every `docker compose` on the VPS is typed in this folder.

#### 7.2 The VPS `.env`: new secrets and the VPS column of the values-per-place table (10 minutes)

`compose.cloud.yml` on the VPS is exactly the same as on the laptop; the only thing that makes it work as a VPS is `.env`:

```text
cp .env.example .env
```

The secrets are **new**: the VPS cupboards are still empty, so the `POSTGRES_…` form is read and every password starts from zero. The VPS has no Node.js, so use the second line at the top of `.env.example`, once per secret:

```text
docker run --rm node:24.22.1-alpine3.24 node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Open it with `nano .env`, then fill in (paste as in 5.3):

- `POSTGRES_PASSWORD`, `JWT_SECRET`, `MQTT_PASSWORD`, `GRAFANA_READER_PASSWORD`, `GRAFANA_ADMIN_PASSWORD`: five different results; keep them in your password manager. The Grafana admin password must be strong: its login page is open to the internet (7.10).
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, and `IMAGE_REGISTRY` (for example `ghcr.io/<account>`): the **same** as in the laptop's `.env`.
- The **VPS** column of this table (replace `yourname.my.id` with your domain); leave the other settings as in the example.

| Setting | Laptop (Module 26) | VPS (the main path) | Pi (the free path) |
| :-- | :-- | :-- | :-- |
| `WEB_DOMAIN` | empty | `iot.yourname.my.id` | empty |
| `MQTT_DOMAIN` | empty | `mqtt.yourname.my.id` | empty |
| `CENTER_CONF` | empty (= `center.conf`) | `center-internet.conf` | empty |
| `CORS_ORIGIN` | `http://localhost,http://127.0.0.1` | `https://iot.yourname.my.id` | `https://iot.yourname.my.id` |
| `WEB_ADDRESS` | `127.0.0.1` (phone mode `0.0.0.0`) | `0.0.0.0` | `127.0.0.1` |
| `MQTT_ADDRESS` | `127.0.0.1` (Kit B `0.0.0.0`) | `127.0.0.1` | `172.17.0.1` (check `ip -4 addr show docker0`) |
| `PORT_MQTT` | `1883` | `1883` | `1884` |
| `GRAFANA_URL` | empty | `https://iot.yourname.my.id/grafana/` | `https://iot.yourname.my.id/grafana/` |
| `CADDY_TRUSTED_PROXIES` | empty | empty | `private_ranges` |
| `TUNNEL_TOKEN` | empty | empty | the token from the Cloudflare dashboard |
| `COMPOSE_PROFILES` | empty | empty | `tunnel` |

The laptop column = your `.env` since [2.3](#23-the-module-27-composecloudyml-and-the-on-the-internet-block-in-the-laptops-env-4-minutes) (Kit B must have `MQTT_ADDRESS=0.0.0.0`, 1.4; `PORT_HTTPS`/`PORT_MQTTS` stay reserved, `port is already allocated` → 8443/8884). The Pi column is used in [11.2](#112-the-root-env-on-the-pi-the-pi-column-of-the-values-per-place-table-8-minutes). An empty `WEB_DOMAIN` becomes `:80` inside `web`; an empty `TRUST_PROXY` = `uniquelocal` (`false` = the 1.3 behavior); `0.0.0.0` is IPv4 only, hence no AAAA record. The part of `compose.cloud.yml` that reads the VPS column (an excerpt; the whole file is [`code/compose.cloud.yml`](code/compose.cloud.yml)):

```yaml
  mosquitto:
    # …
      - type: bind
        source: ./edge/${CENTER_CONF:-center.conf}
    # …
    ports:
      - "${MQTT_ADDRESS:-127.0.0.1}:${PORT_MQTT:-1883}:1883"
      - "${WEB_ADDRESS:-127.0.0.1}:${PORT_MQTTS:-8883}:8883"
  # …
  web:
    # …
    environment:
      WEB_DOMAIN: ${WEB_DOMAIN:-:80}
      MQTT_DOMAIN: ${MQTT_DOMAIN:-}
    # …
      - caddy-data:/data
    ports:
      - "${WEB_ADDRESS:-127.0.0.1}:${PORT_WEB:-80}:80"
      - "${WEB_ADDRESS:-127.0.0.1}:${PORT_HTTPS:-443}:443"
      - "${WEB_ADDRESS:-127.0.0.1}:${PORT_HTTPS:-443}:443/udp"
```

The visitor doors 80, 443, and 8883 follow `WEB_ADDRESS=0.0.0.0`; the plain door 1883 is guarded by `MQTT_ADDRESS=127.0.0.1`, because ufw doesn't close Docker's counters (Concept 4). Save (**Ctrl + O**, **Enter**), exit (**Ctrl + X**), then:

```text
chmod 600 .env
docker compose config --quiet
```

**Result** (the author's lab): no output = it fits. `config` without `--quiet` prints every secret; `.env` never goes into Git.

#### 7.3 Two `external` cupboards on the VPS (3 minutes)

The history and Grafana live in your own cupboards, which don't exist on the VPS yet:

```text
docker volume create smarthome-data
docker volume create smarthome-grafana-data
```

**Result:** each cupboard's name. The history is filled in 7.5, Grafana in 7.7.

#### 7.4 `docker compose build` on the VPS before the other services start (12 minutes)

Molds built on the laptop don't necessarily fit the VPS's processor ([Concept 2](#2-vps-a-rented-computer-that-runs-24-hours-a-day)), so the VPS builds backend 1.4.0 and dashboard 1.3.0 itself, while its RAM is still free:

```text
docker compose build
```

**Expected output** (the author's lab, cut):

```text
[+] Building 2/2
 ✔ ghcr.io/<account>/mini-smart-home-web:1.3.0      Built
 ✔ ghcr.io/<account>/mini-smart-home-backend:1.4.0  Built
```

The author's Pi 5: ±67 seconds because part of it was cached, another build ±130 seconds; a 2 GB amd64 VPS hasn't been measured. `Killed` = out of memory: swap ([5.6](#56-a-2-gb-swap-for-building-images-5-minutes)), then try again. `Cannot find module '/app/src/db/migrate.ts'` in 7.7 = the clone's permissions are too narrow ([🚨](#-troubleshooting)).

> 🔀 **An amd64 laptop (Intel or AMD):** build the molds and leave them at the image shop as in [Practice 10 of Module 26](../module-26-docker-compose/README.md#practice-10--the-image-shop-ghcr-by-hand-35-minutes), then on the VPS replace this step with `docker compose pull`.

#### 7.5 ⭐ Move the history to the VPS: backup, `scp`, restore, then the same fingerprint (14 minutes)

The history, dashboard accounts, devices, and rules move with the backup recipe ([1.3](#13--a-backup-before-changing-anything-pg_dump-then-docker-compose-cp-to-backup-5-minutes)) and the restore recipe ([9.2 of Module 26](../module-26-docker-compose/README.md#92-the-restore-test-project-in-a-new-cupboard-the-timescaledb-restore-recipe-15-minutes)). So the fingerprints can be compared, the data flow to the laptop is stopped first. **Laptop, project root:**

```text
docker compose stop mosquitto
```

**Result** (the author's lab): `✔ Container smarthome-mosquitto-1  Stopped`. Kit B (also a gateway on the laptop): the gateway now holds Node 1's readings in its queue until its bridge heads for the VPS in [9.2](#92-pi-edgebridgecenterconf-heading-for-mqttyournamemyid8883-10-minutes) (the author's lab: 51 of 51 arrived, no duplicates); don't start the laptop's broker again before that, or the queue is handed to the laptop. A simulator connected straight to the laptop's center: **Ctrl + C**; its readings during the move aren't held. Then the fingerprint ([1.2](#12--the-history-fingerprint-on-the-laptop-with-scriptsfingerprintsql-4-minutes), also its PowerShell form) and a backup dated today, one at a time:

```text
docker compose exec -T db psql -U postgres -d smarthome < scripts/fingerprint.sql
docker compose exec db pg_dump -U postgres -d smarthome -Fc -f /tmp/smarthome.dump
docker compose cp db:/tmp/smarthome.dump backup/smarthome-2026-10-29.dump
```

Write the fingerprint row in `fingerprint.md` as "Before the move (7.5)". **VPS:** `mkdir -p backup`. **Laptop:** send the archive over SSH (`scp` is part of OpenSSH on Windows, macOS, and Linux; Windows not tested):

```text
scp backup/smarthome-2026-10-29.dump house@203.0.113.10:/home/house/mini-smart-home/backup/
```

The author's lab used `cp` (the laptop and the VPS are one machine). **VPS:** the Module 26 9.2 recipe without `-p` and `--env-file`, because the VPS project really is `smarthome` with new cupboards. Start only `db`:

```text
docker compose up -d db
```

Repeat `docker compose ps db` until `STATUS` says `(healthy)` (lab: 19 seconds). Then one at a time:

```text
docker compose cp backup/smarthome-2026-10-29.dump db:/tmp/restore.dump
docker compose exec db psql -U postgres -d smarthome -c "SELECT timescaledb_pre_restore();"
docker compose exec db pg_restore -U postgres -d smarthome /tmp/restore.dump
docker compose exec db psql -U postgres -d smarthome -c "SELECT timescaledb_post_restore();"
docker compose exec -T db psql -U postgres -d smarthome < scripts/fingerprint.sql
```

**Expected output** (the author's lab): `t`; `pg_restore: warning: errors ignored on restore: 31` with exit code 1, normal as in Module 26 (the grants for `grafana_reader`, which `grafana-account` creates in 7.7); `t`; then the fingerprint:

```text
 readings |           fingerprint            | summaries | chunks | jobs | accounts | devices
----------+----------------------------------+-----------+--------+------+----------+---------
     2480 | 89664903e2718360c271405a0edd4f43 |       145 |      9 |    3 |        2 |       3
(1 row)
```

Exactly the same row was printed on the laptop (22:55 WIB) and on the VPS (22:56 WIB). Your numbers will differ, of course.

**You pass this ⭐ step** when the VPS fingerprint row is exactly the same as "Before the move (7.5)".

#### 7.6 ⭐ One backend per bot token: stop the laptop's backend (3 minutes)

A second backend with the same bot token is refused by Telegram with `409 Conflict`, and the VPS backend starts in 7.7. **Laptop, project root:**

```text
docker compose stop backend
```

**Result** (the author's lab): `✔ Container smarthome-backend-1  Stopped`. Dev mode: **Ctrl + C** in the `backend` terminal. The laptop's Grafana uses that bot too and hasn't received readings since 7.5, so it may send 🔴 "Silent node": stop it with `docker compose stop grafana` (a 🔴 from the VPS Grafana until 9.2 is normal). The laptop is now the development machine: after 9.2 the laptop home or dev mode may run again, as long as `TELEGRAM_BOT_TOKEN` in the root `.env` and `backend/.env` is empty, and `MQTT_ADDRESS=127.0.0.1`.

**You pass this ⭐ step** when `docker compose ps` on the laptop no longer shows `backend`.

#### 7.7 ⭐ `docker compose up -d` on the VPS: two certificates from Let's Encrypt (8 minutes)

Concept 7's conditions: `nslookup` in [6.4](#64--nslookup-the-internets-phone-book-knows-your-name-now-5-minutes) answers the VPS's IP for both names, and 80 and 443 are open (5.5, also the provider panel's firewall if there is one). The file that instructs Caddy, from 7.1:

```text
# Caddyfile - the front door of the Mini Smart Home dashboard (Modules 26-27): serves the files of dist/ and forwards /api/... to the backend.
# A copy of this file is built into the web image. Docker Compose mounts the FOLDER frontend/caddy/ over it (not a single
# file), so the file in this repo is the one that's used. After changing it: docker compose restart web
# {$NAME} = the value of the variable NAME from the environment part of the web service in compose.cloud.yml (it comes from .env),
# read when Caddy starts; {$NAME:value} = "value" when NAME doesn't exist at all (a variable that exists but is empty STAYS empty,
# so the fallback for an empty .env line is written in compose.cloud.yml). After changing .env: docker compose up -d (web is recreated).
{
	# Caddy usually opens an "admin counter" (2019) to change settings while running. We don't use it: the settings are only
	# read from this file when Caddy starts.
	admin off
	# Module 27, the free path only (Pi + Cloudflare Tunnel). There, visitors arrive through cloudflared, which already writes
	# the visitor's address and "https" in the X-Forwarded-* headers itself. Caddy usually overwrites those headers (anyone can
	# fake them), unless they come from a trusted proxy: CADDY_TRUSTED_PROXIES=private_ranges = the private addresses, including
	# the Docker hallway where cloudflared is. Empty (laptop, VPS) = trust nobody. _strict = the visitor's address is read
	# from the right (what the proxy added), not from the left (what the visitor can write themselves).
	servers {
		trusted_proxies static {$CADDY_TRUSTED_PROXIES}
		trusted_proxies_strict
	}
}

# The site address. WEB_DOMAIN empty in .env = ":80" (filled in by compose.cloud.yml): plain HTTP on port 80 of the container, for
# any address typed in the browser (localhost, the laptop's IP; the free-path Pi behind cloudflared), exactly as in Module 26.
# ("auto_https off" does NOT make Caddy serve HTTP; this ":80" address is what does.)
# Module 27, WEB_DOMAIN filled in (VPS): a domain name, for example iot.yourname.my.id. Caddy asks Let's Encrypt for a certificate
# by itself, serves HTTPS on 443, redirects http:// to https://, and renews its certificate before it runs out. Without the
# "email" option above, the only issuer is Let's Encrypt. MQTT_DOMAIN (mqtt.yourname.my.id) is requested here too so that Caddy
# also takes care of the broker's certificate; Mosquitto uses its COPY (the mqtt-certificate service).
{$WEB_DOMAIN::80} {$MQTT_DOMAIN} {
	# the broker's name isn't a web page: a short answer. mqtt.invalid = a name that never exists (the .invalid ending), so
	# that this line stays valid when MQTT_DOMAIN is empty (laptop, free-path Pi).
	@broker host {$MQTT_DOMAIN} mqtt.invalid
	handle @broker {
		respond "This address is for the MQTT broker (port 8883), not the dashboard." 404
	}

	# answers are compressed before they're sent: the dashboard's ±1 MB of JavaScript reaches the browser as about 300 kB
	encode zstd gzip

	# /api/devices -> backend:8080/devices (the /api prefix is removed first). The live connection too: /api/socket.io/ -> backend:8080/socket.io/
	# "backend" = the service's name in compose.cloud.yml (the Compose hallway), not localhost. Caddy adds the headers X-Forwarded-For
	# (the visitor's address) and X-Forwarded-Proto (https) for the backend; backend 1.4 trusts them because of TRUST_PROXY (Module 27).
	handle_path /api/* {
		reverse_proxy backend:8080 {
			# The backend sets the "session" cookie (the 7-day season pass) with the path /auth, but the browser calls it through
			# /api/auth. Without this line the browser doesn't send that cookie to /api/auth/refresh, and you're thrown back to
			# the Login screen every 15 minutes. This line changes the path in the backend's answer: Path=/auth -> Path=/api/auth.
			header_down Set-Cookie "Path=/auth" "Path=/api/auth"
		}
	}

	# Module 27: Grafana through the same address, under /grafana/ (https://iot.yourname.my.id/grafana/). The /grafana prefix is
	# NOT removed: Grafana itself serves that path when GRAFANA_URL in .env ends with /grafana/ (compose.cloud.yml).
	# GRAFANA_URL empty (laptop) = Grafana stays at http://localhost:3000; this path isn't used (Grafana redirects it
	# to /login, which the dashboard answers).
	redir /grafana /grafana/
	handle /grafana/* {
		reverse_proxy grafana:3000 {
			# Grafana's login cookie gets the Secure attribute (the browser only sends it over HTTPS); Grafana doesn't set it
			# itself because the Caddy -> Grafana connection is plain HTTP
			header_down Set-Cookie "^(.*)$" "$1; Secure"
		}
	}

	# /assets/...: the JavaScript and CSS from the build. Their names carry a fingerprint (for example index-BAET4URZ.js) and
	# change with every build, so the browser may keep them long. A file that doesn't exist gets 404 (not index.html): an honest error.
	handle /assets/* {
		root * /srv
		file_server
	}

	# Everything except /api, /grafana, and /assets: the dashboard files in /srv (from dist/). Screen addresses such as /map or
	# /devices/f00d00000001 aren't files, so they are answered with index.html, then React Router picks the screen ("SPA
	# fallback", Module 24's promise). Without this, F5 on any screen other than / answers 404.
	handle {
		root * /srv
		# no-cache = the browser must ask Caddy first before using its saved index.html (Caddy answers 304 when it hasn't
		# changed). Without it, after the web image is rebuilt the browser can keep showing the OLD dashboard until F5.
		# Module 27: this also applies to the service worker (sw.js) and the phone app's manifest (PWA), so a new version is read quickly.
		header Cache-Control "no-cache"
		try_files {path} /index.html
		file_server
	}
}
```

`{$WEB_DOMAIN::80} {$MQTT_DOMAIN}` = two names, one site: Caddy asks for an ID card for both, `mqtt.` is answered with `404`, `/api` and `/grafana` are forwarded as in Concept 7's route table. Start everything:

```text
docker compose up -d
```

**Result** (the author's lab, ±15 seconds): four new cupboards `Created` (`smarthome_caddy-data`, `…_caddy-config`, `…_broker-data`, `…_certificate-data`), `db` `Healthy`, the one-off services `migrate`, `broker-account`, `grafana-account`, and `mqtt-certificate` `Exited`, then `web`, `mosquitto`, `backend`, and `grafana` `Started`. In `docker compose ps -a`, the four one-off services are `Exited (0)` and `backend` 1.4.0 is `(healthy)`. The `PORTS` column on your VPS: `web` 80 and 443 on `0.0.0.0`; `mosquitto` 1883 only on `127.0.0.1`, 8883 on `0.0.0.0` (empty in the lab, because the "VPS" is a container). For the first few seconds `/api` may answer `502`. Caddy's log, filtered:

```text
docker compose logs web | grep -E 'obtaining|account registered|solve challenge|renewal|obtained successfully'
```

**Expected output (the author's lab, stand-in CA; cut):**

```text
web-1  | {"level":"info","ts":…,"logger":"tls.obtain","msg":"obtaining certificate","identifier":"iot.yourname.my.id"}
web-1  | {…,"msg":"obtaining certificate","identifier":"mqtt.yourname.my.id"}
web-1  | {…,"msg":"new ACME account registered","contact":[],"status":"valid"}
web-1  | {…,"msg":"trying to solve challenge","identifier":"mqtt.yourname.my.id","challenge_type":"tls-alpn-01",…}
web-1  | {…,"msg":"trying to solve challenge","identifier":"iot.yourname.my.id","challenge_type":"tls-alpn-01",…}
web-1  | {…,"msg":"got renewal info",…}
web-1  | {…,"msg":"certificate obtained successfully","identifier":"mqtt.yourname.my.id","issuer":"…"}
web-1  | {…,"msg":"certificate obtained successfully","identifier":"iot.yourname.my.id","issuer":"…"}
```

`ts` (shortened to `…` here) = a number of seconds (UTC). The ACME account is created without an email (`"contact":[]`), and `got renewal info` = the renewal schedule from the issuer (Concept 6); the challenge this time was `tls-alpn-01` through 443, in another test `http-01` through 80 (Caddy chooses at random). In the lab the cards were issued 5–6 seconds after Caddy started, a stand-in CA's number; the author hasn't measured real Let's Encrypt. The cards live in `/data/caddy/certificates/acme-v02.api.letsencrypt.org-directory/<name>/` (in the author's lab this folder has another name, the stand-in CA's); the copy for the broker is in 8.1. A few minutes without `certificate obtained successfully`, or there's an `error`? [🚨](#-troubleshooting) *Caddy gets no certificate …*.

From now on `smarthome_caddy-data` keeps your account and cards: **don't `docker compose down -v`**, because Let's Encrypt gives only 5 cards with exactly the same names per week ([Concept 6](#6-certificates-in-full-chain-name-and-dates)). `docker compose down` without `-v` is safe.

**You pass this ⭐ step** when the `web` log holds `certificate obtained successfully` for `iot.` and `mqtt.`, `mqtt-certificate` is `Exited (0)`, and the other services are `Up` or `(healthy)`.

#### 7.8 ⭐ The padlock at `https://iot.yourname.my.id`: 308, logging in, and the `Secure` cookie (6 minutes)

**Laptop, terminal** (Windows: type `curl.exe`; not tested by the author), one at a time:

```text
curl -sI http://iot.yourname.my.id/
curl -sI https://iot.yourname.my.id/
curl -s https://iot.yourname.my.id/api/health
curl -s -w ' [%{http_code}]\n' https://mqtt.yourname.my.id/
```

**Expected output (the author's lab, stand-in CA; cut):**

```text
HTTP/1.1 308 Permanent Redirect
Location: https://iot.yourname.my.id/

HTTP/2 200
alt-svc: h3=":443"; ma=2592000
cache-control: no-cache
{"ok":true,"broker":true,"database":true,"received":0,"rejected":0,"ignored":0}
This address is for the MQTT broker (port 8883), not the dashboard. [404]
```

`curl` checks Caddy's card (chain, name, dates) before answering `HTTP/2 200`, without `strict-transport-security` (HSTS, Concept 7). `received` is still 0: new readings wait for the bridge in 9.2.

**Chrome on the laptop:** type `http://iot.yourname.my.id`; the page moves to `https://` by itself, with a padlock in the address bar (the issuer is Let's Encrypt; the author didn't record the padlock: the lab's Chrome has no screen). Log in with the **old** admin account, which came along with the history. DevTools → **Application** → **Cookies**: `access` (Path `/`) and `session` (Path `/api/auth`), with the **Secure** and **HttpOnly** columns ticked (the author's lab: both also `SameSite` `Strict`). Then open the same address from your phone over mobile data (Wi-Fi off): the internet's phone book knows your name from outside the home. Swagger stays on the laptop through an SSH tunnel ([🧩 Level 2](#level-2--the-admin-door-through-an-ssh-tunnel-swagger-and-dbeaver-from-the-laptop-fill-in-the-blanks-25-minutes)).

**You pass this ⭐ step** when `http://` is redirected with `308` to a padlocked `https://`, the old admin account can log in, and both cookies are marked **Secure**.

#### 7.9 ⭐ 429 per visitor, not shared (5 minutes)

The limit of [Module 20](../../phase-3-backend-data/module-20-user-security/README.md#8-rate-limiting-an-hourglass-for-password-guessers) = 10 login attempts per minute per visitor. Within one minute:

1. **Chrome on the laptop** (**Log out** first): log in as admin with a wrong password 11 times. The **Login** page says `wrong email or password`, then `too many attempts: try again in … seconds` (as the backend code words it; the author didn't record this screen).
2. **Phone over mobile data**: log in with the right password; it works. Over the home Wi-Fi, the phone shares the public address with the laptop and is refused too.
3. **VPS:**

```text
docker compose logs --since 3m backend | grep -E 'login|429'
```

**Expected output** (the author's lab, three simulated visitors with `curl`; cut):

```text
backend-1  | [14:26:31] WARN: login failed: account 1 (IP 198.51.100.131)
backend-1  | [14:26:32] INFO: POST /auth/login -> 429 (8 ms)
backend-1  | [14:26:39] WARN: login failed: account 1 (IP 198.51.100.133)
backend-1  | [14:26:46] INFO: login: account 1 (admin), session 16, IP 198.51.100.132
backend-1  | [14:26:53] INFO: POST /auth/login -> 429 (5 ms)
```

Visitor `…131` is refused from the 11th attempt on, also with the right password at 14:26:53. Visitor `…133` sends a fake `X-Forwarded-For: 203.0.113.9` but is logged with its real address. Visitor `…132` (= your phone) logs in. The backend log's clock is WIB.

**You pass this ⭐ step** when the laptop gets `429` while the phone logs in within the same minute, and the log records two different IPs.

#### 7.10 Grafana at `/grafana/`: admin, a Viewer account, and the dashboard from files (5 minutes)

Chrome on the laptop: `https://iot.yourname.my.id/grafana/` → Grafana's login page. Log in as `admin` with `GRAFANA_ADMIN_PASSWORD` from the VPS `.env` (a new cupboard: the laptop's Grafana password doesn't apply). The **System Health** dashboard in the **Mini Smart Home** folder, the **Silent node** rule, and the Telegram contact point are already there, from Module 26's provisioning. Alert links are now `https://`; the "Grafana link" of the Phase 4 Checkpoint may be this `/grafana/` address ([Module 25](../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md#103-a-grafana-link-json-on-github-a-screenshot-and-a-note-on-when-to-use-which-5-minutes)). In the author's lab, the login, the dashboard, and Grafana Live (`wss://`, `101`) work, and the `grafana_session` cookie is marked `Secure`.

Other people get their own account with the **Viewer** role, through Grafana's user administration menu (the author didn't record the menu names); the admin password isn't shared. After a few wrong passwords, Grafana temporarily refuses even the right password for a few minutes, without telling you ([🚨](#-troubleshooting)). A capture from the author's lab (Chrome on Linux, stand-in CA, the lab address); in your browser the address is `https://iot.yourname.my.id/grafana/`, with a padlock:

![Composite of two real screenshots of Grafana 13.2.4 in its dark theme on a simulated VPS, Chrome 156 on Linux, laptop 1280 pixels, Practice 7.10, 30 Oct 2026 18:21 WIB; the lab address https://iot.example.test/grafana/ in place of https://iot.yourname.my.id/grafana/, a simulated internet and certificates. Top left, the /grafana/login page: the logo, Welcome to Grafana (number 1), Email or username, Password, and the blue Log in button (number 2), then Forgot your password?. Top right: the numbered legend; the grafana_session cookie with Path /grafana marked Secure, Grafana Live over wss 101. Bottom, after logging in, the left menu closed: the breadcrumb Dashboards, Mini Smart Home, System Health (number 3, from provisioning); Node All; Last 1 hour WIB, Refresh 1m (number 4, the 1-hour range picked by the lab); the panels RSSI (Wi-Fi signal strength), Practice living room about -77 to -48 dbm since 17:43 with the dashed -75 line, Uptime (time running) 35 minutes, Heap (free memory) 182 to 194 kB (number 5); Node 2 packets per hour (should be 12) one orange bar 4; the table Minutes behind schedule: f00d000000b2 Garden (mock) -2.1, f00d00000001 Practice living room 0.0 (number 6). Data from the simulator and the mock Garden.](assets/grafana-over-https.png)

Whatever you built in Grafana through the screens on the laptop doesn't move along: the VPS's Grafana cupboard is new, and it only holds the provisioning.

#### 7.11 `docker stats`: the VPS's RAM at rest (3 minutes)

```text
docker stats --no-stream
```

**Result** (the author's lab, the `MEM USAGE / LIMIT` column): grafana ±238 MiB, db ±154, backend ±103, web ±16, mosquitto ±6; ±517 MiB in total (other measurements: ±0.4–0.65 GB). A 2 GB VPS is enough; Grafana is the biggest and its number goes up and down. Write your numbers down for [➕ F](#f-save-your-study-notes-the-t1t3-proof-the-fingerprint-the-monthly-cost-and-docker-stats).

> ⬆️ **Done with Practice 7?** Read [Concept 8](#8-tls-for-mqtt-door-8883-a-copy-of-the-certificate-and-a-reload), then continue to [Practice 8](#practice-8--the-main-path-mqtt-door-8883-with-tls-35-minutes). Since [7.5](#75--move-the-history-to-the-vps-backup-scp-restore-then-the-same-fingerprint-14-minutes), your home's readings don't reach the VPS until the Pi's bridge connects in [9.2](#92-pi-edgebridgecenterconf-heading-for-mqttyournamemyid8883-10-minutes), so don't wait too long.

### Practice 8 — The main path: MQTT door 8883 with TLS (35 minutes)

> 🖥️ **Tools used:** an **SSH terminal to the VPS**, folder `/home/house/mini-smart-home`; a **terminal on the laptop**, any folder, as a visitor from outside the VPS; **MQTTX 1.13.1** on the laptop; your password manager. Concepts used: 8 (and 4 for the counters).
>
> ⭐ **Required for the main path** — steps 8.1, 8.3, and 8.6: the certificate copy owned by uid `1883` and door 8883 open, **T2a** (without TLS refused at 8883, 1883 unreachable from outside), and the renewal script in cron.

> 🔀 **The free path:** your broker stays at home, with no door 8883. Skip Practices 8 and 9; the stand-in for T2a is **T2-free** in [11.8](#118--t1-free-and-t2-free-the-dashboard-from-a-phone-the-broker-stays-at-home-6-minutes).

No commit: the broker accounts live in the VPS cupboard, cron on the VPS. The **Expected output** boxes come from the author's lab with a simulated VPS and a stand-in for Let's Encrypt.

#### 8.1 ⭐ A certificate copy for the broker: `mqtt-certificate` and door 8883 (5 minutes)

The copier already did its job in [7.7](#77--docker-compose-up--d-on-the-vps-two-certificates-from-lets-encrypt-8-minutes) (`mqtt-certificate` `Exited (0)`); you copied its script in [2.3](#23-the-module-27-composecloudyml-and-the-on-the-internet-block-in-the-laptops-env-4-minutes). Its comments are the lesson; the order is explained in [Concept 8](#8-tls-for-mqtt-door-8883-a-copy-of-the-certificate-and-a-reload):

```sh
#!/bin/sh
# copy-certificate.sh - Module 27. Run by the one-off service "mqtt-certificate" in compose.cloud.yml (Mosquitto image, as
# root), not on the laptop or the VPS directly. Copies Caddy's certificate for the broker name (MQTT_DOMAIN) to the
# certificate-data cupboard as owned by the user mosquitto (uid 1883): Mosquitto 2.x reads its certificate AFTER dropping
# from root to the user mosquitto, while the files in Caddy's cupboard may only be read by root (folder 0700, files 0600).
#   /caddy = Caddy's cupboard (caddy-data), read-only      /out = the certificate-data cupboard (read by Mosquitto)
# After a new copy, a running broker reloads it with: docker compose exec mosquitto kill -HUP 1
set -eu

# The laptop and the free-path Pi have no broker name: nothing is copied, the broker stays plain (center.conf)
if [ -z "${MQTT_DOMAIN:-}" ]; then
  echo "MQTT_DOMAIN empty: no broker certificate (laptop or free-path Pi), skipped"
  exit 0
fi

# Caddy keeps certificates in /caddy/caddy/certificates/<issuer>/<name>/<name>.crt (the key <name>.key next to it).
# The issuer folder name isn't hard-coded (Let's Encrypt, the practice CA, or another CA if the email/acme_ca option is
# used): the newest file is used. When a new VPS starts, Caddy may not have finished asking yet: wait, 5 minutes at most.
start=$(date +%s)
while :; do
  crt=$(find /caddy/caddy/certificates -type f -name "${MQTT_DOMAIN}.crt" -exec ls -t {} + 2>/dev/null | head -n 1)
  if [ -n "$crt" ] && [ -s "$crt" ]; then break; fi
  if [ $(( $(date +%s) - start )) -ge 300 ]; then
    echo "FAILED: 5 minutes without a certificate for ${MQTT_DOMAIN} from Caddy. Check: docker compose logs web" >&2
    exit 1
  fi
  sleep 2
done
key="${crt%.crt}.key"

# The same contents as the existing copy (for example the weekly cron before Caddy renews): not copied again, but the
# owner and permissions are still fixed (a copy made by hand as root makes Mosquitto fail to start).
if [ -f /out/broker.crt ] && [ -f /out/broker.key ] && cmp -s "$crt" /out/broker.crt && cmp -s "$key" /out/broker.key; then
  chown 1883:1883 /out/broker.crt /out/broker.key
  chmod 644 /out/broker.crt
  chmod 600 /out/broker.key
  echo "certificate ${MQTT_DOMAIN} unchanged: skipped"
  exit 0
fi

# Copy to a temporary name first, then rename: Mosquitto never reads a file that is only half copied.
# 644 = anyone may read the certificate (its contents are sent to every client anyway); 600 = the key only for its owner.
cp "$crt" /out/broker.crt.new
cp "$key" /out/broker.key.new
chown 1883:1883 /out/broker.crt.new /out/broker.key.new
chmod 644 /out/broker.crt.new
chmod 600 /out/broker.key.new
mv /out/broker.crt.new /out/broker.crt
mv /out/broker.key.new /out/broker.key
echo "certificate ${MQTT_DOMAIN} copied from $crt ($(( $(date +%s) - start )) seconds of waiting)"
echo "a running broker reloads it with: docker compose exec mosquitto kill -HUP 1"
```

On the VPS:

```text
docker compose logs mqtt-certificate
```

**Expected output (the author's lab, stand-in CA):**

```text
mqtt-certificate-1  | certificate mqtt.yourname.my.id copied from /caddy/caddy/certificates/acme-v02.api.letsencrypt.org-directory/mqtt.yourname.my.id/mqtt.yourname.my.id.crt (8 seconds of waiting)
mqtt-certificate-1  | a running broker reloads it with: docker compose exec mosquitto kill -HUP 1
```

In the author's lab, the issuer folder in the middle of that path has another name (the stand-in CA's); on your VPS it's `acme-v02.api.letsencrypt.org-directory`, and the seconds of waiting differ. `… unchanged: skipped` after the next `up -d` is normal.

```text
docker compose logs mosquitto | grep -E '8883|Opening|running'
```

**Expected output (the author's lab, cut; the number in front = seconds):**

```text
mosquitto-1  | 1793345085: Info: running mosquitto as user: mosquitto.
mosquitto-1  | 1793345085: Opening ipv4 listen socket on port 8883.
```

The broker has already dropped its rights to `mosquitto` and can still read its certificate. Door 8883 is opened by the last four lines of [`edge/center-internet.conf`](code/edge/center-internet.conf) (`listener 8883`, `use_username_as_clientid true`, `certfile …`, `keyfile …`; the rest is the same as `center.conf`), chosen by `CENTER_CONF` in 7.2. 1883 also listens inside the container, for the backend in the hallway; from the internet it's closed by the `127.0.0.1` counter (8.3). The copy's owner:

```text
docker compose exec mosquitto ls -ln /mosquitto/certs/
```

**Expected output (the author's lab; sizes and dates differ, the container clock is UTC):**

```text
total 8
-rw-r--r--    1 1883     1883          1267 Oct 30 07:24 broker.crt
-rw-------    1 1883     1883           227 Oct 30 07:24 broker.key
```

`1883` = the user `mosquitto`; the certificate may be read by anyone, the key only by its owner.

**You pass this ⭐ step** when `mqtt-certificate` writes `… copied from …`, the broker log holds `Opening ipv4 listen socket on port 8883.`, and `broker.key` is owned by `1883` with `-rw-------`. `FAILED: 5 minutes without a certificate …` or `Unable to load server certificate`? [🚨](#-troubleshooting).

#### 8.2 The `checker`, `pi-bridge`, and `monitor` accounts on the VPS broker (5 minutes)

The VPS's `broker-data` cupboard is still new: its password file only holds the `backend` account made by `broker-account`; its permission list (`edge/acl-broker`) came along with `git clone`. Add three accounts, each with a NEW password ([one account for every program](../../phase-3-backend-data/module-21-device-broker-security/README.md#6-the-brokers-doorkeeper-a-password-file-and-one-account-per-program)):

- `checker`: the test account of 8.3–8.4, only reads `msh/#`. Its password is for testing only (8.3 sends it in the clear): after 8.4, change it, then restart.
- `pi-bridge`: the Pi's bridge ([9.1](#91-the-pi-bridge-account-and-its-permissions-on-the-vps-broker-4-minutes)). Its password is **different** from the laptop's `pi-bridge`.
- `monitor`: the bridge status message in [9.5](#95-the-bridge-status-message-on-the-vps-and-the-gateway-queue-going-back-down-4-minutes).

Device accounts aren't needed: Node 1 still logs in to the Pi, and its readings go up through the bridge. On the VPS, one account per command:

```text
docker compose exec -u mosquitto mosquitto mosquitto_passwd /mosquitto/data/broker-passwd checker
```

**Expected output (the author's lab; the password typed twice without being shown):**

```text
Password:
Reenter password:
Adding password for user checker
```

Repeat with `pi-bridge`, then `monitor`. After that, restart, not reload ([Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#44-device-path-lock-the-door-then-restart-10-minutes)); there's no bridge yet, so only the backend drops off for a moment:

```text
docker compose restart mosquitto
```

**Result (the author's lab):** `[+] Restarting 1/1`, then `✔ Container smarthome-mosquitto-1  Started  0.5s`.

#### 8.3 ⭐ T2a: without TLS refused at 8883, and 1883 unreachable from outside (10 minutes)

Try it **from the laptop**, not from the SSH terminal to the VPS: from inside the VPS, 1883 does answer at `127.0.0.1`.

**With MQTTX (the Syllabus proof; not recorded by the author).** **Host** `mqtt.yourname.my.id`, **Port** `8883`, **Username** `checker`, **Password** its password, the **SSL/TLS** switch off → **Connect**: no connection (lab: mqtt.js, MQTTX's engine, `ECONNRESET`). **SSL/TLS** on with the built-in trusted CA certificates (its name may differ a little in your version) → connected. **Port** `1883`, **SSL/TLS** off: no connection.

**With the laptop terminal (what the author recorded).** You need `mosquitto_sub` 2.1 or newer (older versions don't know `--no-tls`). Not sure, or Windows/macOS? Start every command with `docker run --rm eclipse-mosquitto:2.1.2-alpine`: the broker image on your laptop, complete with the ISRG Root X1 and X2 roots (the author didn't record this form). First, without TLS:

```text
mosquitto_sub --no-tls -h mqtt.yourname.my.id -p 8883 -u checker -P <password> -t 'msh/+/status' -v -C 1 -W 10
```

After it stops, its exit code (PowerShell: `$LASTEXITCODE`, not tested by the author):

```text
echo $?
```

**Result (the author's lab, stand-in CA):** silent for 10 seconds without a single line, then `255`. Silent doesn't mean "waiting": the client tries once a second and is refused every time. On the VPS:

```text
docker compose logs --since 2m mosquitto
```

**Expected output (the author's lab, cut; repeated every second):**

```text
mosquitto-1  | 1793345318: New connection from 198.51.100.101:36810 on port 8883.
mosquitto-1  | 1793345318: OpenSSL Error while trying to get the error[0]: error:0A00010B:SSL routines::wrong version number
mosquitto-1  | 1793345318: Client 198.51.100.101 [198.51.100.101:36810] disconnected: Protocol error.
```

`wrong version number` = the broker waits for a TLS handshake, but a plain MQTT packet arrives: a postcard at the envelope door. From your laptop, the address after `from` = your home's address on the internet ([🔁 Step 2](#step-2--your-homes-address-on-the-internet-the-router-versus-a-whats-my-ip-site); lab: a simulated visitor). Second, with TLS: drop `--no-tls`. For `-p 8883`, client 2.1 uses TLS by itself and checks the broker's card against the system's list of roots, without `--cafile`:

```text
mosquitto_sub -h mqtt.yourname.my.id -p 8883 -u checker -P <password> -t 'msh/+/status' -v -C 1
```

**Result (the author's lab, stand-in CA; the lab's Pi bridge already connected):** `msh/f00d00000001/status online`, `echo $?` → `0`. Your bridge only comes up in 9.2, so the VPS broker has no status message yet, and the command waits without output. That isn't a refusal: the VPS log records `New client connected from … as checker (p4, c1, k60, u'checker').` and `Client checker negotiated TLSv1.3 …`. Press **Ctrl + C**. A TLS error? [🚨](#-troubleshooting).

Third, the plain door 1883:

```text
mosquitto_sub -h mqtt.yourname.my.id -p 1883 -u checker -P <password> -t 'msh/+/status' -v -C 1 -W 10
```

**Expected result:** it fails; how it's worded depends on the network (not recorded by the author). Silence isn't proof yet (there's no message yet): the VPS log must have no `on port 1883` from your home's address. The author's lab (a simulated internet, the `ports:` lines as they are): unreachable from outside, answering from inside the "VPS". What closes it isn't ufw, but `MQTT_ADDRESS=127.0.0.1` ([Concept 4](#4-a-leaky-firewall-ufw-and-docker)).

**You pass this ⭐ step** when the command without TLS ends without a message with `255` (MQTTX: no connection), the VPS log writes `wrong version number` and `disconnected: Protocol error.`, and the VPS log has no `on port 1883` from your home. Keep the log excerpt in `learn-iot/module-27/` (➕ F).

#### 8.4 Through 8883, another account can't borrow a client name (4 minutes)

`use_username_as_clientid true` under `listener 8883` keeps another account from posing as `backend` or `pi-bridge` ([Concept 8 of Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#8-client-ids-can-be-faked-use_username_as_clientid)). From the laptop, ask for the client name `backend` with the `checker` account (it waits as in 8.3; after 5 seconds, **Ctrl + C**):

```text
mosquitto_sub -h mqtt.yourname.my.id -p 8883 -i backend -u checker -P <password> -t 'msh/+/status' -v -C 1
```

Then on the VPS: `docker compose logs --since 2m mosquitto | grep -E 'checker|backend'`. **Expected output (the author's lab, stand-in CA, cut):**

```text
mosquitto-1  | 1793345424: New client connected from 198.51.100.101:42038 as checker (p4, c1, k60, u'checker').
```

`-i backend` is ignored, and the backend isn't kicked out. The danger sign = `as backend (… u'<another account>')`: that option is missing under `listener 8883` ([🚨](#-troubleshooting)). `Client backend … disconnected: session taken over.` right before `as backend (p4, c0, k60, u'backend')` = the backend's own old session (Practice 2): normal.

#### 8.5 Proof from the author's lab: the sniffer can't read the key anymore (3 minutes)

Just read this. The author put `tools/sniffer.js` ([8.1 of Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#81--see-for-yourself-the-key-travels-in-the-clear-10-minutes)) in front of door 8883 of the simulated VPS ([`tools/README.md`](code/tools/README.md)). **Expected output (the author's lab, a client without TLS, cut):**

```text
  username      : checker
  key (password): <checker password>   <- readable in the clear by anyone on this path
  broker 203.0.113.10:8883 can't be reached (ECONNRESET)
```

The password leaks **before** the broker refuses: test without TLS only with `checker`, never with a device key or `pi-bridge`. A TLS client: the sniffer only records `new connection from … -> 203.0.113.10:8883`, without name and key. (In the lab, the certificate check was weakened for this test only, because the client knocked on the sniffer at `127.0.0.1`, not on the broker's name.)

#### 8.6 ⭐ Renewal: `scripts/renew-mqtt-certificate.sh` and a weekly cron (8 minutes)

Caddy renews its card by itself; the broker doesn't ([Concept 8](#8-tls-for-mqtt-door-8883-a-copy-of-the-certificate-and-a-reload)). This script (copied in 2.3) runs the copier again, then reloads the broker:

```sh
#!/bin/sh
# renew-mqtt-certificate.sh - Module 27, ONLY on the VPS (main path). Caddy renews its Let's Encrypt certificate by itself
# (on its issuer's schedule; for Let's Encrypt roughly when a third of its lifetime is left), but the Mosquitto broker doesn't
# read the new one too. The VPS cron runs this script once a week: copy the broker certificate again (the mqtt-certificate
# service), then reload the broker without stopping it (kill -HUP 1 inside the container: the same PID, the Pi bridge
# doesn't break).
# The cron line (crontab -e on the VPS, one line; replace /home/house/mini-smart-home with your project folder):
#   17 3 * * 1 sh /home/house/mini-smart-home/scripts/renew-mqtt-certificate.sh >> /home/house/renew-certificate.log 2>&1
# Trying it once by hand (from the project root): sh scripts/renew-mqtt-certificate.sh
# A fuller scheduler (a systemd timer, a monitor) follows in Module 30.
set -eu

# move to the project root (the folder above scripts/), where compose.cloud.yml and .env are
cd "$(dirname "$0")/.."
echo "=== $(date '+%Y-%m-%d %H:%M:%S %Z') renew the broker certificate"
docker compose run --rm mqtt-certificate
# The reload runs EVERY week, also when the copy above writes "unchanged": "docker compose up -d" (for example after a
# git pull) also copies a new certificate without reloading the broker, so "unchanged" doesn't yet mean the broker already
# uses that certificate. A reload reads the WHOLE configuration again, acl-broker included: an access list with a typo
# makes the broker stop when the cron runs (Monday 03:17 VPS time), with no one watching. After changing acl-broker
# or *.conf, always "docker compose restart mosquitto" right then (Module 21) and check its log; don't wait for this
# script. (Don't check with "mosquitto --test-config" in a running container: that test process overwrites the broker's
# queue and retained-message file, mosquitto.db, with an empty database owned by root.)
docker compose exec -T mosquitto kill -HUP 1
echo "broker reloaded"
```

Try it once on the VPS, at the project root:

```text
sh scripts/renew-mqtt-certificate.sh
```

**Expected output (the author's lab, stand-in CA; the time written in WIB, a VPS usually writes `UTC`):**

```text
=== 2026-10-29 23:06:25 WIB renew the broker certificate
certificate mqtt.yourname.my.id unchanged: skipped
broker reloaded
```

Even `unchanged` is reloaded (the reason is in the script's comment). The broker log (`docker compose logs --since 1m mosquitto`): `… Reloading config.` (lab: no new `New bridge connected`, the bridge doesn't break).

**Install the cron** (not recorded by the author) as `house`, without `sudo`: the script then runs as `house`, a member of the `docker` group since [5.7](#57--docker-engine-from-dockers-apt-repository-and-the-docker-group-12-minutes).

```text
crontab -e
```

The first time, Ubuntu usually asks for an editor: choose `nano`. Add this line at the very bottom (= line 8 of the script's comment without `#`; another folder? replace both paths), then save (**Ctrl + O**, **Enter**, **Ctrl + X**):

```text
17 3 * * 1 sh /home/house/mini-smart-home/scripts/renew-mqtt-certificate.sh >> /home/house/renew-certificate.log 2>&1
```

It means: minute 17, hour 3, every day of the month, every month, day 1 = Monday 03:17 VPS time (UTC: 10:17 WIB); output and errors are appended to the log. `crontab -l` must show that line; the next Monday, `cat /home/house/renew-certificate.log` holds three lines like the ones above.

Three rules come with it. (1) After changing `acl-broker` or `*.conf` on the VPS, `docker compose restart mosquitto` right away and read its log: a typo that waits for cron's reload stops the broker on a Monday morning ([🚨](#-troubleshooting)). (2) No `mosquitto --test-config` in a running container: it overwrites `mosquitto.db` (the queue, the retained messages) with an empty file owned by root. (3) HUP only for this VPS broker; the Pi's gateway is always `restart`ed. Forgot the cron? A bridge that's connected keeps working, but **new** connections are refused as soon as the 8883 copy expires (lab: `certificate has expired`), including a bridge that drops for a moment: run the script by hand.

**You pass this ⭐ step** when the script writes `broker reloaded`, the broker log `Reloading config.`, and `crontab -l` shows your cron line.

> ⬆️ **Done with Practice 8?** Continue to [Practice 9](#practice-9--the-main-path-the-pi--vps-bridge-over-tls-35-minutes): the Pi's bridge goes up to the door 8883 you just proved. Its settings are the same as in [Practice 4](#practice-4--store-and-forward-at-home-first-the-lan-bridge-and-a-10-minute-outage-drill-30-minutes); only the address and the certificate check change.

### Practice 9 — The main path: the Pi → VPS bridge over TLS (35 minutes)

> 🖥️ **Tools used:** an **SSH terminal to the Pi**, folder `mini-smart-home/edge`; an **SSH terminal to the VPS**, folder `/home/house/mini-smart-home`; **Chrome** or **Edge** on the laptop, or a phone (9.4); **VS Code** on the laptop (9.6 only); your password manager (the VPS's `pi-bridge` and `monitor` passwords from 8.2, the gateway's `monitor` password from 4.2). Node 1 is on and logged in to the Pi gateway. Concepts used: 8 and 9.
>
> ⭐ **Required for the main path** — steps 9.3 and 9.4: the VPS log records the Pi bridge over TLS (**T2b**), then Node 1 is live on the VPS dashboard and **Lamp** is answered with an `ack`.

The store-and-forward bridge of [Practice 4](#practice-4--store-and-forward-at-home-first-the-lan-bridge-and-a-10-minute-outage-drill-30-minutes) goes up to the internet. Its settings stay ([Concept 9](#9-a-store-and-forward-bridge-who-holds-what)); the only things that change are the destination (now the VPS broker's **name** at door 8883) and the check of the VPS's ID card with the ISRG Root X1 root that's already in the Mosquitto image ([Concept 8](#8-tls-for-mqtt-door-8883-a-copy-of-the-certificate-and-a-reload)). Since [7.5](#75--move-the-history-to-the-vps-backup-scp-restore-then-the-same-fingerprint-14-minutes), the gateway has been holding Node 1's readings; in the author's lab, that queue followed to the VPS as soon as the bridge connected. No commit (except 9.6): `edge/bridge/center.conf` holds a password and stays outside Git. The **Expected output** boxes come from the author's lab with a simulated internet, VPS, and CA.

> 🔀 **Without a Pi:** the gateway on the laptop ([the Module 26 6.7 pattern](../module-26-docker-compose/README.md#67-laptop-path-the-stand-in-for-l4-then-the-gateway-on-the-same-laptop-525-minutes)) uses the same TLS bridge: do 9.2 in a second terminal, in the laptop's `edge` folder, without `git pull`, and edit the file in VS Code; `PORT_GATEWAY=1884` stays. Not tested by the author yet. **The free path:** skip this practice; your bridge stays plain at home ([11.6](#116--the-gateway-to-the-center-on-the-same-pi-a-lan-bridge-to-center1884-8-minutes)).

#### 9.1 The `pi-bridge` account and its permissions on the VPS broker (4 minutes)

The bridge logs in to the VPS broker with the `pi-bridge` account and may only use the topics of block `7) pi-bridge` in `edge/acl-broker`. The permissions came with `git clone` (7.1), because you updated that file in [4.1](#41-edgegatewayconf-four-lines-that-hold-the-queue-then-push-the-branch-6-minutes). Check on the VPS, at the project root:

```text
grep -A 6 '^user pi-bridge' edge/acl-broker
```

What must show (seven lines of the file):

```text
user pi-bridge
topic write msh/+/telemetry
topic write msh/+/status
topic write msh/+/vitals
topic write msh/+/ack
topic read msh/+/cmd
topic write $SYS/broker/connection/pi-bridge/state
```

Four topics up, one down (`cmd`), and the last line for the bridge status message (`#` doesn't cover topics starting with `$`). The account was already created in [8.2](#82-the-checker-pi-bridge-and-monitor-accounts-on-the-vps-broker-5-minutes)? Go on to 9.2. Not yet? Create it with a NEW password, different from the laptop's `pi-bridge`, then restart:

```text
docker compose exec -u mosquitto mosquitto mosquitto_passwd /mosquitto/data/broker-passwd pi-bridge
```

```text
docker compose restart mosquitto
```

**Result** (the author's lab): `Adding password for user pi-bridge`, then `✔ Container smarthome-mosquitto-1  Started  0.5s`.

#### 9.2 Pi: `edge/bridge/center.conf` heading for `mqtt.yourname.my.id:8883` (10 minutes)

In the SSH terminal to the Pi, folder `mini-smart-home/edge`, first fetch the commit pushed in 7.1:

```text
git pull
```

In [4.2](#42-the-lan-bridge-with-the-module-27-settings-a-clean-session-at-the-center-a-persistent-queue-on-the-pi-7-minutes) you turned the HOME PATH block on; now it's the other way around. The simplest way: copy the example again, whose MAIN PATH block is active:

```text
cp bridge.example.conf bridge/center.conf
```

Open it with `nano bridge/center.conf`, then change two things:

1. In the line `address mqtt.yourname.my.id:8883`, write your own broker name from [6.3](#63--the-main-path-a-records-iot-and-mqtt-to-the-vps-ip-dns-only-no-aaaa-5-minutes). The **name**, not the IP: the VPS's ID card is only valid for that name.
2. `replace-with-the-pi-bridge-account-password` → the **VPS's** `pi-bridge` password, not the laptop's.

Leave the `bridge_cafile` line: the root file is already in the image. Save (**Ctrl + O**, **Enter**, **Ctrl + X**), run `chmod 600 bridge/center.conf`, then check with `diff bridge.example.conf bridge/center.conf`. **Result** (the author's lab): exactly two places, `10c10` (the `address` line; in the lab a stand-in broker name) and `25c25` (the `remote_password` line; the password shows on your screen, don't paste it anywhere).

Last, empty `CENTER_ADDRESS` in `edge/.env` (`nano .env`, until the line reads `CENTER_ADDRESS=`): the bridge now calls a domain name, not `center`. The Compose settings change too, so the gateway is recreated, not HUPed ([Concept 9](#9-a-store-and-forward-bridge-who-holds-what)):

```text
docker compose up -d --force-recreate mosquitto
```

**Result** (the author's lab): `✔ Container smarthome-gateway-mosquitto-1  Started  2.3s`. Node 1 drops off for a few seconds while the gateway is recreated, so that minute's history may hold one short gap (the author's lab: 20 seconds).

#### 9.3 ⭐ T2b: the VPS log records the Pi bridge over TLS (6 minutes)

On the Pi:

```text
docker compose logs mosquitto
```

**Expected output** (the author's lab, stand-in CA, cut; 14:29 WIB):

```text
mosquitto-1  | 1793345371: Loading config file '/mosquitto/config/bridge/center.conf'
mosquitto-1  | 1793345371: Restored 43 client messages
mosquitto-1  | 1793345371: Connecting bridge center (mqtt.yourname.my.id:8883)
```

`Restored 43 client messages` = the messages held since 7.5, restored from the gateway's cupboard; then Node 1 (lab: the simulator) logs in again (`New client connected … as f00d00000001 …`, cut from the box above). On the VPS, at the project root:

```text
docker compose logs mosquitto | grep pi-bridge
```

**Expected output** (the author's lab, stand-in CA):

```text
mosquitto-1  | 1793345371: New bridge connected from 198.51.100.20:56416 as pi-bridge (p4, c1, k60, u'pi-bridge').
mosquitto-1  | 1793345371: Client pi-bridge negotiated TLSv1.3 cipher TLS_AES_256_GCM_SHA384
```

That's **T2b**: the bridge comes in through a sealed envelope (TLS 1.3), while a plain visitor at the same door is refused with `wrong version number` (8.3). `c1` = a clean session at the center, the Module 27 setting (the Module 26 bridge and the old Syllabus settings write `c0`, Concept 9); the address after `from` = your home's address on the internet ([🔁 Step 2](#step-2--your-homes-address-on-the-internet-the-router-versus-a-whats-my-ip-site)), not the Pi's IP on the LAN. In the author's lab, the root file in the gateway was replaced by the stand-in CA's root: the author hasn't tested the real Let's Encrypt chain on the bridge.

The Pi log only repeats `Connecting bridge center …`, without `New bridge connected` on the VPS? [🚨](#-troubleshooting) *The bridge is `not authorised` …* (the password) or *`certificate verify failed` …* (the name or the root).

**You pass this ⭐ step** when the VPS log holds `New bridge connected … as pi-bridge (p4, c1, k60, u'pi-bridge').` and `Client pi-bridge negotiated TLSv1.3 …`. Keep both lines in `learn-iot/module-27/` (➕ F).

#### 9.4 ⭐ Node 1 live on the VPS dashboard, then the Lamp button all the way to `ack` (8 minutes)

Open `https://iot.yourname.my.id` on the laptop or the phone, and log in as admin:

1. The **Live** badge is lit, Node 1's card says `Online`, and the numbers on its details page change (the author's lab, Chrome through the simulated internet: `last seen 15 seconds ago` → `6 seconds ago` within 21 seconds). The Garden (Node 2) follows with `Online` `via linking device` within ±5 minutes.
2. Click **Lamp**: Node 1's lamp turns on, and the switch moves after the `ack` comes back from the Pi. The command goes down through `topic msh/+/cmd in 1`, the answer comes up through `topic msh/+/ack out 1`. **Result** (the author's lab, through the API from the simulated internet): `ack` within 60 milliseconds (`"wait_ms":60`), and the simulator writes `f00d00000001: command c-20261030-073051-1 -> ok=true`. Turn the lamp off again.

The rules you save on the VPS dashboard also go down this way (the author's code lab: the simulator writes `thresholds saved {"temp_fan_on":31,"soil_watering":30}`). A 🔴 "Silent node" from the VPS Grafana during 7.5–9.2, if any, is normal; ✅ follows once the data flows again.

**You pass this ⭐ step** when the VPS dashboard shows **Live** with Node 1's numbers changing, and **Lamp** is answered with an `ack` (Node 1's lamp really turns on).

#### 9.5 The bridge status message on the VPS, and the gateway queue going back down (4 minutes)

On the VPS, with the VPS's `monitor` account:

```text
docker compose exec mosquitto mosquitto_sub -u monitor -P <password> -t '$SYS/broker/connection/pi-bridge/state' -v -C 1
```

**Expected output** (the author's lab):

```text
$SYS/broker/connection/pi-bridge/state 1
```

Then on the Pi, with the gateway's `monitor` account, the queue command of [4.3](#43--the-bridge-status-message-state-1-with-the-monitor-account-3-minutes):

```text
docker compose exec mosquitto mosquitto_sub -u monitor -P <password> -t '$SYS/broker/store/messages/count' -v -C 1
```

The number is back to what it was in 4.3 (the author's lab, a few minutes after 9.2: `59`, almost all of them retained messages): the queue from the move has been sent. The author's lab: of Node 1's readings during the move, 51 were published at the gateway and 51 stored on the VPS, no duplicates.

#### 9.6 The VPS name in the gateway's `extra_hosts` (optional, 3 minutes)

While the home internet is down, every bridge attempt asks DNS for the VPS broker's name, and the gateway broker is held up for a few seconds waiting for the answer. Devices don't drop, but messages for local subscribers on the Pi (Node-RED, `mosquitto_sub`) are delayed too (the author's lab: up to almost 6 seconds; Mosquitto issue #3402). A name written down in `compose.edge.yml` isn't asked of DNS. The line is already there, commented out (an excerpt of [`code/edge/compose.edge.yml`](code/edge/compose.edge.yml)):

```yaml
    extra_hosts:
      # …
      - "center:${CENTER_ADDRESS:-host-gateway}"
      # …
      # - "mqtt.yourname.my.id:203.0.113.10"
```

On the laptop, open `edge/compose.edge.yml` in VS Code, delete the `# ` in front of the last line (lined up with `- "center:…"`), then fill in your broker name and your VPS's IP. In the project-root terminal, one at a time:

```text
git add edge/compose.edge.yml
git commit -m "Gateway: the VPS broker name in extra_hosts"
git push
```

On the Pi: `git pull`, then `docker compose up -d --force-recreate mosquitto`. The author's code lab: with that line, `Error creating bridge: Try again.` didn't show up anymore during an outage, and the delay of local messages stayed under 1 second. The price: the VPS's IP is pinned in the file. The VPS or its IP changes? Change this line too; without that the bridge doesn't connect ([🚨](#-troubleshooting)).

> ⬆️ **Done with Practice 9?** Continue to [Practice 10](#practice-10--the-10-minute-home-internet-unplug-test-30-minutes): unplug the home internet for 10 minutes, then prove its late arrivals with no gaps and no duplicates.

### Practice 10 — The 10-minute home-internet unplug test (30 minutes)

> 🖥️ **Tools used:** a **phone** with mobile data (the phone's Wi-Fi off) and the dashboard `https://iot.yourname.my.id`; the laptop on the home Wi-Fi with an **SSH terminal to the Pi**, folder `mini-smart-home/edge`; your home router/modem; after reconnecting, an **SSH terminal to the VPS**, folder `/home/house/mini-smart-home`; **Telegram**; your password manager (the `monitor` password). Concepts used: 9.
>
> ⭐ **Required** — steps 10.2 and 10.5 (the free path: [11.9](#119--t3-free-the-home-internet-down-for-10-minutes-the-pis-history-stays-whole-15-minutes)): the home internet unplugged for 10 minutes while the home Wi-Fi stays on, then **T3**: `scripts/check-late-arrivals.sql` on the VPS shows the minutes of the outage are still whole, with no gaps and no duplicates.

This is the real test of [Concept 9](#9-a-store-and-forward-bridge-who-holds-what): in [4.4](#44--a-10-minute-outage-on-the-lan-then-scriptscheck-late-arrivalssql-no-gaps-no-duplicates-11-minutes) you cut the LAN bridge; now the TLS bridge to the VPS loses the internet without any notice, so the blind window is tested too. No commit. The **Expected output** boxes come from the author's lab: "unplug" = the gateway taken off the simulated internet (`docker network disconnect`: packets are silently dropped, as when the WAN cable is pulled), "phone" = Chrome without a screen; the author didn't test a real router, phone, or mobile data. Read up to 10.4 before you unplug.

#### 10.1 Get the phone, the Pi terminal, and the start time ready (3 minutes)

During the outage the laptop on the home Wi-Fi has no internet either: SSH to the VPS drops, SSH to the Pi keeps working. Get a note ready for the unplug and reconnect times (WIB, for 10.5), then:

1. **Phone:** turn its Wi-Fi off, turn mobile data on, open `https://iot.yourname.my.id`, log in, then open Node 1's details. The **Live** badge is lit, the numbers change.
2. **Node 1:** write down its `device_id` (the one you used in 4.4) and make sure its lamp is **Off**. Without a Kit: the `tools/` simulator on the laptop, through the Pi, like the author's lab.
3. **SSH terminal to the Pi**, folder `edge`: the gateway queue's content before the outage, with the command of [4.3](#43--the-bridge-status-message-state-1-with-the-monitor-account-3-minutes) (`<password>` = the `monitor` password on the Pi):

   ```text
   docker compose exec mosquitto mosquitto_sub -u monitor -P <password> -t '$SYS/broker/store/messages/count' -v -C 1
   ```

   **Result (the author's lab):** `$SYS/broker/store/messages/count 59`. Write your number down.

#### 10.2 ⭐ Unplug the home internet, not the home Wi-Fi (2 minutes)

Only the Pi → VPS path is cut, without any notice, exactly like an ISP outage; Node 1 → Pi over Wi-Fi stays alive. Choose one way, then write down the unplug time (WIB):

- **A Wi-Fi router separate from the ISP's fiber modem (ONT):** pull the cable out of the Wi-Fi router's WAN socket, or turn the ONT off. The home Wi-Fi stays on.
- **A combo router** (ONT and Wi-Fi in one box, common from ISPs): turning it off turns the Wi-Fi off too. Use the stand-in in the SSH terminal to the VPS: `docker compose stop mosquitto`, 10 minutes later `docker compose start mosquitto` (`Exited` for `broker-account` and `mqtt-certificate` is normal). To be honest: a stopped broker refuses connections at once, so the blind window isn't tested; the queue is still safe thanks to the backend's persistent session ([2.1](#21-three-changes-in-src-envts-and-serverts-mqttts-and-commandsts-8-minutes)).
- **Without a Pi** (the gateway on the laptop, 🔀 Practice 4): turn the laptop's Wi-Fi off (wired: pull its cable); the simulator to the laptop's gateway keeps running. Not tested by the author yet.

**Don't** turn the Pi off (its queue goes out with it: that's a power-cut test), and **don't** turn the home Wi-Fi off (Node 1 can't reach the Pi and its readings are lost: "the home Wi-Fi down ≠ the internet down", Concept 9). The free path uses the same way in [11.9](#119--t3-free-the-home-internet-down-for-10-minutes-the-pis-history-stays-whole-15-minutes).

**You pass this ⭐ step** when for 10 minutes the laptop on the home Wi-Fi can't open any site, while Node 1 stays on and SSH to the Pi keeps working (the stand-in: `docker compose stop` writes `Stopped`).

#### 10.3 During the outage: a stale `Online`, the Lamp button, and Telegram's "Silent node" (12 minutes)

**Minute 1, the phone.** Node 1's details stay `Online`, but ±30 seconds after the last reading `stale data` appears (the author's lab, minute 1: `Online · last seen 1 minute ago · stale data`), and the chart starts to empty. The **Live** badge stays green: your phone is connected to the VPS; it's your home that's cut off. Concept 9's first honest gap: Node 1 is still connected to the Pi, so nothing reports `offline` (the "Home gateway disconnected" banner = [🧩 Level 3](#level-3--a-home-gateway-disconnected-banner-the-bridge-status-message-all-the-way-to-the-dashboard-from-scratch-6090-minutes)). The second gap: the server's automation rules go quiet without new readings, and Node 1's local safety doesn't kick in, because it only does when the Pi's broker can't be reached ([Module 19](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#10-local-safety-node-1-guards-the-house-when-the-server-is-gone)); Node 1's automatic watering and lamp keep running (Syllabus v1.0.29, the §2.2 table).

![Composite of three real screenshots of the Mini Smart Home dashboard 1.3.0 on a simulated VPS, opened from the simulated internet in Chrome device mode 375 pixels (not a real phone) while the home internet was unplugged 18:08:29 to 18:18:53 WIB, Practice 10.3: the simulated Pi gateway taken off the lab internet network, the devices still connected to the gateway. Left, minute 5.5, the Device List: the Live badge still green (number 1); the Practice living room card with the Online badge (number 2), Temperature 27.2 °C, last seen 6 minutes ago · stale data with stale data in orange (number 3); the Garden (mock) card Online, via linking device, last seen 6 minutes ago without stale data (number 3). Middle, minute 5.5, Node 1 details: node1 Online, last seen 6 minutes ago · stale data (number 3); the Controls section skipped; the Temperature last 5 minutes chart empty, times 18:10 to 18:14, No readings in the last 5 minutes. (number 4); updated at 18:08:29 WIB, the last reading before the unplug (number 5). Right, minute 1: after pressing Lamp, the button back to Lamp Off (number 6) and the red toast Lamp: not confirmed by the device yet; the server tries again if it hears from the device within 2 minutes. (number 6). A numbered legend below: the gateway queue held about 35 messages then, the server rules quiet, API 504.](assets/online-though-disconnected.png)

A picture from the author's lab (a simulated VPS and CA, Chrome without a screen as wide as a phone, a rerun of 10 minutes 24 seconds); on your phone the address is `https://iot.yourname.my.id` and the padlock shows in the address bar. The Garden card without `stale data` is normal: its schedule is 5 minutes.

**Minutes 1 to 3, the phone: press Lamp** (the lamp is **Off**). The button says `Waiting for device confirmation…`, then the toast from [3.4](#34-indexhtml-the-offline-message-the-2-minute-toast-and-version-130-4-minutes) appears:

```text
Lamp: not confirmed by the device yet; the server tries again if it hears from the device within 2 minutes.
```

Down is not kept ([4.5](#45--a-lamp-command-during-the-outage-up-is-kept-down-is-not-3-minutes)): the broker doesn't hold this command, and the backend only remembers it for 2 minutes. The combo-router stand-in: the command is refused at once (`503`, like the 4.5 stand-in).

**The Pi terminal: the queue rises.** Repeat the queue command of 10.1 every few minutes (up arrow, **Enter**). The author's lab: it rose all the time from 59 to 125 just before reconnecting (±66 messages held). After ±2 minutes, `docker compose logs --since 5m mosquitto` on the Pi keeps writing `Connecting bridge center (mqtt.yourname.my.id:8883)`, then `Error creating bridge: Try again.` (without 9.6): the gateway has noticed and keeps trying, normal during an outage.

**Minute 6, Telegram.** The Grafana on the VPS doesn't hear Node 1 and sends 🔴 "Silent node", as received by the mock Telegram server in the author's lab 6 minutes after the last reading:

```text
🔴 Practice living room (f00d00000001) is not sending data, 5.5 minutes behind schedule
```

In your Telegram: your Node 1's name and `device_id`. Node 1 is healthy; it's only the center that can't hear it.

#### 10.4 Plug it back in: the bridge recovers, the late arrivals come in (2 minutes)

After 10 minutes, plug the cable back in or turn the ONT on (the stand-in: `docker compose start mosquitto` on the VPS), then write down the reconnect time = when the laptop can open sites again. The gateway retries the bridge at least every 30 seconds: a few seconds up to ±30 seconds later the bridge is in, and the whole queue follows within seconds with its original `ts`. A card already open on the phone only changes after the late arrivals come in; the gateway queue goes back to the number of 10.1. In the SSH terminal to the VPS, at the project root:

```text
docker compose logs --since 20m mosquitto | grep pi-bridge
```

**Expected output (the author's lab, stand-in CA; cut, the `mosquitto-1  | <seconds>:` prefix removed):**

```text
Client pi-bridge [198.51.100.20:56416] disconnected: exceeded timeout.
New bridge connected from 198.51.100.20:34174 as pi-bridge (p4, c1, k60, u'pi-bridge').
Client pi-bridge negotiated TLSv1.3 cipher TLS_AES_256_GCM_SHA384
```

The first line: the VPS only noticed 91 seconds after the unplug. The next two: 7 seconds after reconnecting (the picture round of 10.3: 4 seconds); 64 queued readings reached the VPS within the same second. On your VPS, the address after `from` = your home's address on the internet. Then:

```text
docker compose logs --since 20m backend | grep command
```

**Expected output (the author's lab, the picture round of 10.3; cut):**

```text
[18:18:57] INFO: command lamp = true (api) to f00d00000001 not carried out for more than 2 minutes: not sent again
```

It shows up as soon as Node 1 is heard again: manual commands older than 2 minutes are forgotten (backend 1.4.0, [2.1](#21-three-changes-in-src-envts-and-serverts-mqttts-and-commandsts-8-minutes)).

#### 10.5 ⭐ T3: `scripts/check-late-arrivals.sql` on the VPS, no gaps and no duplicates (8 minutes)

The script is the same as in [4.4](#44--a-10-minute-outage-on-the-lan-then-scriptscheck-late-arrivalssql-no-gaps-no-duplicates-11-minutes) and has been on the VPS since the `git clone` of 7.1. ±1 minute after the bridge is in, on the VPS, at the project root (one line; `<device_id>` = Node 1; `start` and `end` = WIB times a little before the unplug and after reconnecting):

```text
docker compose exec -T db psql -U postgres -d smarthome -v device=<device_id> -v "start=YYYY-MM-DD HH:MM" -v "end=YYYY-MM-DD HH:MM" < scripts/check-late-arrivals.sql
```

**Expected output (the author's lab, stand-in CA; unplugged 23:29:00, reconnected 23:39:38 WIB):**

```text
== Summary (WIB times) ==
 readings |  first   |   last   | largest_gap | gaps_over_12_seconds | arrived_late | duplicates
----------+----------+----------+-------------+----------------------+--------------+------------
       90 | 23:27:00 | 23:41:51 | 00:00:11    |                    0 |           58 |          0
(1 row)

== Per minute: readings and the ones that arrived later (late arrivals) ==
 minute | readings | late | last_arrival
--------+----------+------+--------------
 23:27  |        6 |    0 | 23:27:50
 23:28  |        6 |    0 | 23:28:50
 23:29  |        6 |    5 | 23:39:46
 23:30  |        6 |    6 | 23:39:46
 23:31  |        6 |    6 | 23:39:46
 23:32  |        6 |    6 | 23:39:46
 23:33  |        6 |    6 | 23:39:46
 23:34  |        6 |    6 | 23:39:46
 23:35  |        6 |    6 | 23:39:46
 23:36  |        6 |    6 | 23:39:46
 23:37  |        6 |    6 | 23:39:46
 23:38  |        6 |    5 | 23:39:46
 23:39  |        6 |    0 | 23:39:51
 23:40  |        6 |    0 | 23:40:51
 23:41  |        6 |    0 | 23:41:51
(15 rows)

== Gaps over 12 seconds (empty = no reading was lost) ==
 from_time | to_time | gap
-----------+---------+-----
(0 rows)
```

How to read it:

- The outage minutes 23:29–23:38 still have **6 readings**, stored at the time they happened. `late` only counts the ones that arrived more than 60 seconds after their `ts`: 58 of the 64 that were queued in 10.4. Minute 23:29 has only 5: its 23:29:00 reading arrived before the unplug.
- `gaps_over_12_seconds 0` and `(0 rows)`: no reading was lost, in the blind window too. `largest_gap 00:00:11` = the 10-second rhythm + ±1 second while the gateway is busy.
- `duplicates` is always 0 (the `(device_id, ts)` key, Concept 9). The author also matched what was published at the gateway with what was stored on the VPS: 90 = 90.

A gap at the start of the outage? [🚨](#-troubleshooting) *Readings lost …* (the author's lab: a gateway broker that had been HUPed threw away the blind window's queue). Keep your output for ➕ F.

**You pass this ⭐ step (T3)** when your 10-minute outage gives `gaps_over_12_seconds 0`, the gap list `(0 rows)`, ±6 readings per minute in the outage minutes, `duplicates 0`, and `arrived_late` above 0.

#### 10.6 Other witnesses: the backend log, automation rules, the chart, and the lamp (3 minutes)

On the VPS: `docker compose logs --since 20m backend | grep -c 'duplicate skipped'`. **Result (the author's lab):** `0`; more than 0 is fine too (repeated sends that the database refused). Then:

- **Automation rules stay quiet about late arrivals:** the rules ignore readings whose `ts` is older than 60 seconds. The author's lab: not a single `rule …` line for the late arrivals, also for 8 late readings above 31 °C (a code-lab test).
- **History →** then **1 hour** on the phone: Node 1's line has no hole in the outage hour.
- **The lamp stays Off.** Reconnected less than 2 minutes after pressing the button? The lamp turns on later, as the toast says (log: `… command sent again`).
- **Telegram:** `✅ Practice living room is sending data again.` (the mock Telegram) follows at most ±5 minutes after the late arrivals come in (lab: 33 seconds and 5 minutes 15 seconds). A 🔴 for the Garden may come shortly after reconnecting; its ✅ follows.

> ⬆️ **Done with Practice 10?** Skip [Practice 11](#practice-11--the-free-path-everything-on-the-pi-and-cloudflare-tunnel-85-minutes) (the free path only) and continue to [Practice 12](#practice-12--the-pwa-on-a-phone-a-mobile-network-and-a-friend-in-another-city-40-minutes): the dashboard becomes an app on the phone, then your friend opens it from another city.

### Practice 11 — The free path: everything on the Pi, and Cloudflare Tunnel (85 minutes)

> 🖥️ **Tools used:** an **SSH terminal to the Pi** (Module 12, for example `ssh budi@192.168.1.37`), folder: the **project root** `mini-smart-home` (the center) or `mini-smart-home/edge` (the gateway); **VS Code** on the laptop, a terminal at the **project root** (11.1, 11.4); the **Cloudflare dashboard** in Chrome or Edge (11.7); a **phone** with mobile data, **MQTTX** on the laptop (11.8). Without a Kit: the `tools/` simulator still goes to the Pi gateway. Concepts used: 10, 9, and the `CADDY_TRUSTED_PROXIES` part of Concept 7.
>
> ⭐ **Required for the free path** — steps 11.4, 11.6, 11.7, 11.8, and 11.9: the same history fingerprint on the Pi, the gateway connected to the center, the tunnel running, **T1-free** and **T2-free** (the dashboard opens from outside, the broker doesn't), then **T3-free** (the Pi's history stays whole while the internet is down for 10 minutes).

> [!NOTE]
> **The Cloudflare part isn't recorded by the author:** the author has no Cloudflare account, and a real token was deliberately not used in the lab. The dashboard steps of 11.7 come from the official documentation (read 29 Oct 2026); the author hasn't tried a connected `cloudflared`, a phone, mobile data, or a 2 GB Pi. What was recorded: a stand-in "Pi" with the center at counter 1884, the gateway, the bridge through `host-gateway`, `cloudflared` without a token, and a container standing in for `cloudflared`.

The order is the same as in [Practice 7](#practice-7--the-main-path-the-center-on-the-vps-with-https-75-minutes), with the Pi as the "VPS"; only the differences are here. The main path skips this practice. The only commit is the Caddyfile in 11.1.

#### 11.1 The Pi gets ready to be the center: `git pull`, RAM, and the storage card (6 minutes)

Caddy reads `frontend/caddy/Caddyfile` from the project folder, and its Module 27 version (trusted proxies, the `/grafana/` route) was copied in 7.1, which the free path skips. **Laptop:** do the laptop part of [7.1](#71-git-push-on-the-laptop-git-clone-on-the-vps-6-minutes): the Caddyfile through **Copy raw file**, then `git add`, `git commit`, and `git push`. **Pi** (on the `feature/to-the-internet` branch since 4.1), one at a time:

```text
cd ~/mini-smart-home
git pull
```

The gateway keeps running. **RAM:** `free -h`, the `total` column of the `Mem:` line. The center and the gateway on the author's lab "Pi" use ±472 MiB at rest; a 2 GB Pi hasn't been measured. **The card:** the database now writes 24 hours a day. `findmnt -n -o SOURCE /` writes `/dev/mmcblk0…` if your system is on a microSD (not recorded by the author). An ordinary microSD wears out fast: use a high-endurance one ([Syllabus §5.3](../../SYLLABUS.md#53-kit-b--raspberry-pi-as-the-gateway-needed-from-module-12)) or an SSD ([🔬 Module 12](../../phase-2-connectivity/module-12-raspberry-pi-and-linux/README.md#-technical-deep-dive-optional)).

#### 11.2 The root `.env` on the Pi: the Pi column of the values-per-place table (8 minutes)

On the Pi, at the project root: `cp .env.example .env`. Fill it in as in [7.2](#72-the-vps-env-new-secrets-and-the-vps-column-of-the-values-per-place-table-10-minutes): **new** secrets (the Pi's cupboards are empty; the `docker run` line of 7.2), a strong Grafana admin password (its login page is open too), and the same `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, and `IMAGE_REGISTRY` as the laptop. Then the **Pi** column of the 7.2 table, starting with the central broker's address:

```text
ip -4 addr show docker0 | grep inet
```

**Result** (the author's lab): `inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0`. The number before `/16` = the `MQTT_ADDRESS` value; if yours differs, write yours. `nano .env`, change these five lines (no `/` at the end of `CORS_ORIGIN`):

```text
CORS_ORIGIN=https://iot.yourname.my.id
PORT_MQTT=1884
MQTT_ADDRESS=172.17.0.1
GRAFANA_URL=https://iot.yourname.my.id/grafana/
CADDY_TRUSTED_PROXIES=private_ranges
```

The center on 1884, because 1883 on the Pi belongs to the gateway broker. Leave the rest: `WEB_ADDRESS=127.0.0.1` (visitors only come through the tunnel); `WEB_DOMAIN`, `MQTT_DOMAIN`, `CENTER_CONF`, and `TRUST_PROXY` empty; `TUNNEL_TOKEN` and `COMPOSE_PROFILES` in 11.7. Save, `chmod 600 .env`, then `docker compose config --quiet`. **Result** (the author's lab): no output = it fits.

#### 11.3 Two `external` cupboards and `docker compose build` on the Pi (12 minutes)

Project root, one at a time:

```text
docker volume create smarthome-data
docker volume create smarthome-grafana-data
docker compose build
```

**Result** (the author's lab): the names of both cupboards, then `Built` for backend `1.4.0` and web `1.3.0` (arm64, for the Pi itself), as in [7.4](#74-docker-compose-build-on-the-vps-before-the-other-services-start-12-minutes). The author's Pi 5 without a cache: ±2–3 minutes; a 2 GB Pi hasn't been measured. Out of memory? Swap, [5.6](#56-a-2-gb-swap-for-building-images-5-minutes) (not tested on a Pi).

#### 11.4 ⭐ Move the history to the Pi: the same fingerprint, the laptop's backend stops (12 minutes)

The [7.5](#75--move-the-history-to-the-vps-backup-scp-restore-then-the-same-fingerprint-14-minutes) recipe, to the Pi. Do 11.4–11.6 without a break: from the first command on, your home's readings are held in the gateway queue.

**Laptop, project root:** `docker compose stop mosquitto`, the fingerprint, `pg_dump`, and `docker compose cp`, exactly as in 7.5; write the fingerprint down as "Before the move (11.4)". The Pi now holds the bot token ([7.6](#76--one-backend-per-bot-token-stop-the-laptops-backend-3-minutes)), so:

```text
docker compose stop backend grafana
```

**Pi, project root:** `mkdir -p backup`. **Laptop** (your Pi's user and IP):

```text
scp backup/smarthome-2026-10-29.dump budi@192.168.1.37:mini-smart-home/backup/
```

**Pi, project root:** the VPS commands of 7.5 as they are, from `docker compose up -d db` (wait for `(healthy)`) to the fingerprint. **Result** (the author's lab): `pg_restore` as in 7.5 (not recorded again), then exactly the same fingerprint table as in 7.5 (`2480`, `89664903e2718360c271405a0edd4f43`).

**You pass this ⭐ step** when the Pi's fingerprint is exactly the same as "Before the move (11.4)", and `docker compose ps` on the laptop no longer shows `backend`.

#### 11.5 `docker compose up -d` on the Pi, without a profile (6 minutes)

`COMPOSE_PROFILES` still has its `#`, so `cloudflared` doesn't come along yet. Project root: `docker compose up -d`, then `docker compose ps -a`. **Result** (the author's lab, ±8 seconds): four new cupboards `Created`, the one-off services `Exited (0)`, `backend` `(healthy)`, `mosquitto` at `172.17.0.1:1884->1883/tcp, 127.0.0.1:8883->8883/tcp`, and `web` at `127.0.0.1:80->80/tcp, 127.0.0.1:443->443/tcp, …`. Every counter is on `127.0.0.1`, except the central broker on `172.17.0.1:1884` for the gateway; 443 and 8883 are reserved without being used. The `mqtt-certificate` log writes `MQTT_DOMAIN empty: … skipped`, the `web` log four `"warn"` lines as in Module 26 (`server is listening only on the HTTP port, …`). Normal: HTTPS is put on at Cloudflare's edge.

#### 11.6 ⭐ The gateway to the center on the same Pi: a LAN bridge to `center:1884` (8 minutes)

The Pi now has two brokers: `docker compose exec mosquitto` at the **project root** = the center, in the **`edge`** folder = the gateway.

**(a) Project root.** The central broker has a new cupboard: create the `pi-bridge` account with a NEW password, then restart (its permissions, block 7 of `acl-broker`, have been there since 4.1):

```text
docker compose exec -u mosquitto mosquitto mosquitto_passwd /mosquitto/data/broker-passwd pi-bridge
```

```text
docker compose restart mosquitto
```

**Result** as in [9.1](#91-the-pi-bridge-account-and-its-permissions-on-the-vps-broker-4-minutes). The `monitor` account for the `state` message (4.3): the same way.

**(b) The `edge` folder.** `nano bridge/center.conf` (the copy from [4.2](#42-the-lan-bridge-with-the-module-27-settings-a-clean-session-at-the-center-a-persistent-queue-on-the-pi-7-minutes)): change `address center:1883` to `address center:1884`, and `remote_password` to the password of (a). `nano .env`: `CENTER_ADDRESS=host-gateway` (it was the laptop's IP). `diff bridge.example.conf bridge/center.conf` is the same as in 4.2, except `> address center:1884` (the author's lab). Recreate the gateway (not a HUP, Concept 9):

```text
docker compose up -d --force-recreate mosquitto
```

Then in `edge` and at the project root: `docker compose logs --since 2m mosquitto | grep -i bridge`. **Expected output (the author's lab, cut; the gateway, then the center):**

```text
mosquitto-1  | 1793354294: Connecting bridge center (center:1884)
mosquitto-1  | 1793354294: New bridge connected from 172.22.0.1:48118 as pi-bridge (p4, c1, k60, u'pi-bridge').
```

`c1` = the Module 27 setting; after `from` = the gateway's hallway address, which may differ on your Pi. The database on the author's lab "Pi" then received 19 readings of the simulated Node 1 within 2 minutes, above the ±12 rhythm: the queue from the move came along (not matched one by one). `not authorised`? [🚨](#-troubleshooting) *The bridge is `not authorised` …*.

**You pass this ⭐ step** when the Pi's central log holds `as pi-bridge (p4, c1, k60, u'pi-bridge')`; its readings are proven to arrive in 11.8.

#### 11.7 ⭐ Cloudflare Tunnel: the token in `.env`, a route to `http://web:80`, and the `tunnel` profile (12 minutes)

**Chrome, the Cloudflare dashboard** (the domain from [6.2](#62-cloudflares-free-plan-change-the-nameservers-then-wait-until-its-active-8-minutes), nameservers active according to [6.4](#64--nslookup-the-internets-phone-book-knows-your-name-now-5-minutes)); the labels come from the documentation and may differ a little:

1. **Networking** → **Tunnels** → **Create Tunnel**, give it a name.
2. According to the documentation, the dashboard then shows a `docker run` command tagged `latest` that ends with `--token` and a long string of letters. Don't run it (`cloudflared` tagged `2026.10.5` is already in `compose.cloud.yml`); copy only the string after `--token` into your password manager.
3. **Routes** → **Add route** → **Published application**: **Hostname** `iot.yourname.my.id`, **Service URL** `http://web:80` (the Caddy service in the project's hallway).
4. The DNS list must hold an orange-cloud CNAME `iot` to `<tunnel-id>.cfargotunnel.com` ([Concept 5](#5-domains-and-dns-the-internets-phone-book)); the author can't confirm that the dashboard always creates it. Not there? [🚨](#-troubleshooting) *A Cloudflare error page …*.

The token = the tunnel's password: not into Git, forums, or AI; leaked? Create a new tunnel, then delete the old one. **Pi, project root:** `nano .env`, paste the token after `TUNNEL_TOKEN=`, delete the `# ` in front of `COMPOSE_PROFILES=tunnel`, save, `docker compose config --quiet`, then `docker compose up -d` (`cloudflared` is created; the one-off services are `Exited` again, normal). ±20 seconds later:

```text
docker compose ps -a cloudflared --format '{{.Service}} {{.Status}}'
```

What's right is `cloudflared Up …` (the author didn't record its connected log). An empty or miscopied token? **Expected output** (the author's lab, an empty token; plus `docker compose logs cloudflared`, cut):

```text
cloudflared Restarting (255) 5 seconds ago
cloudflared-1  | Provided Tunnel token is not valid.
cloudflared-1  | See 'cloudflared tunnel run --help'.
```

Copy the token again, then `docker compose up -d` once more.

**You pass this ⭐ step** when `cloudflared` stays `Up` (not `Restarting`) and the DNS list holds `iot` heading to your tunnel.

#### 11.8 ⭐ T1-free and T2-free: the dashboard from a phone, the broker stays at home (6 minutes)

**T1-free.** The phone (Wi-Fi off, mobile data): open `https://iot.yourname.my.id`. The padlock is Cloudflare's: the envelope is opened at its edge, then the tunnel carries it to Caddy on the Pi (Concept 10). Log in with the **old** admin account: the **Live** badge is lit, Node 1's numbers change. Chrome on the laptop (also through Cloudflare): DevTools → **Application** → **Cookies**, `access` and `session` marked **Secure**. On the Pi, at the project root: `docker compose logs --since 5m backend | grep login`; after `IP` there should be your phone's address on the internet, not `172.…`.

The author hasn't checked the headers of a real `cloudflared`; the lab imitated them: a container knocked on `http://web:80` with `X-Forwarded-For: 1.2.3.4, 198.51.100.7` (on the left a fake one sent by the visitor, on the right its real address) and `X-Forwarded-Proto: https`. **Expected output (the author's lab, the stand-in for `cloudflared`; cut):**

```text
HTTP/1.1 200 OK
Set-Cookie: access=<token>; Max-Age=900; Path=/; HttpOnly; Secure; SameSite=Strict
Set-Cookie: session=<token>; Max-Age=604800; Path=/api/auth; HttpOnly; Secure; SameSite=Strict
backend-1  | [00:01:51] INFO: login: account 1 (admin), session 7, IP 198.51.100.7
```

The fake address is ignored. No **Secure**, or every visitor has a hallway address? Check `CADDY_TRUSTED_PROXIES` and the Caddyfile of 11.1. Grafana comes through the tunnel too, at `/grafana/`: the admin password from the Pi's `.env`, a **Viewer** account to share ([7.10](#710-grafana-at-grafana-admin-a-viewer-account-and-the-dashboard-from-files-5-minutes)).

**T2-free.** MQTTX on the laptop using the phone's hotspot (from outside the home): **Host** `iot.yourname.my.id`, **Port** `1883`, then `8883` with the **SSL/TLS** switch on (its name may differ a little). Neither connects: `iot.` points at Cloudflare, which only carries HTTP; there's no `mqtt.` record; the router doesn't open a door. The author didn't record how the failure is worded.

**You pass this ⭐ step (T1-free and T2-free)** when the phone over mobile data opens the padlocked dashboard and sees **Live** with changing numbers, both cookies are marked **Secure**, and MQTTX from outside the home doesn't connect through either 1883 or 8883.

#### 11.9 ⭐ T3-free: the home internet down for 10 minutes, the Pi's history stays whole (15 minutes)

Node 1, the gateway, and the center are all at home: an internet outage only closes the visitors' way in from outside, so the proof is a whole history, not late arrivals. Not recorded by the author with a real router; a 10-minute stand-in in the author's simulated lab (the gateway taken off the simulated internet) showed an unbroken history.

1. Write down the time (WIB), then unplug the home internet in the way of [10.2](#102--unplug-the-home-internet-not-the-home-wi-fi-2-minutes). A combo router: on the Pi, at the project root, `docker compose stop cloudflared`, then `docker compose start cloudflared` 10 minutes later.
2. During the outage, the phone over mobile data should get a Cloudflare error page; SSH to the Pi keeps working.
3. Reconnect and write down the time. `cloudflared` should reconnect by itself (not yet? `docker compose logs cloudflared`); the dashboard opens again, Node 1's chart has no hole.
4. Pi, project root: `scripts/check-late-arrivals.sql` with the command of [4.4](#44--a-10-minute-outage-on-the-lan-then-scriptscheck-late-arrivalssql-no-gaps-no-duplicates-11-minutes).

Read it as in [10.5](#105--t3-scriptscheck-late-arrivalssql-on-the-vps-no-gaps-and-no-duplicates-8-minutes), except that `arrived_late` may be 0: nothing needed holding. Keep it together with the output of 4.4 (**T3-free (b)**) and `docker stats --no-stream` for [➕ F](#f-save-your-study-notes-the-t1t3-proof-the-fingerprint-the-monthly-cost-and-docker-stats).

**You pass this ⭐ step (T3-free)** when `check-late-arrivals.sql` on the Pi for the outage span writes `gaps_over_12_seconds 0`, the gap list `(0 rows)`, and ±6 readings per minute, and then the dashboard opens again from the phone.

**Moving up later:** do [Practice 5](#practice-5--the-main-path-rent-a-vps-and-lock-its-doors-60-minutes) to [Practice 9](#practice-9--the-main-path-the-pi--vps-bridge-over-tls-35-minutes). The history and the bot from the Pi (7.5–7.6), the tunnel's `iot` replaced by an A record to the VPS (6.3), the bridge to `mqtt.yourname.my.id:8883`; the files are the same, only `.env` changes.

> ⬆️ **Done with Practice 11?** Continue to [Practice 12](#practice-12--the-pwa-on-a-phone-a-mobile-network-and-a-friend-in-another-city-40-minutes): install the dashboard on your phone through your Tunnel address, then ask your friend to open it.

### Practice 12 — The PWA on a phone, a mobile network, and a friend in another city (40 minutes)

> 🖥️ **Tools used:** your **phone** (Chrome on Android or Safari on iPhone) with mobile data; an **SSH terminal to the VPS**, folder `/home/house/mini-smart-home`, in 12.4 (the free path: an **SSH terminal to the Pi**, the project root); a private message to your friend. No commit. Concepts used: 11.
>
> ⭐ **Required** — steps 12.1 (iPhone: 12.2), 12.3, and 12.4: the dashboard installed on the phone and opening without an address bar, its numbers changing over mobile data, then **T1**: your friend opens `https://iot.yourname.my.id` from their own network and sees the numbers change.

> [!NOTE]
> **Not recorded by the author.** The author has no phone, mobile data, or test friend in another city. The iPhone steps follow Apple's iPhone User Guide (read 29 Oct 2026; the English labels checked on 30 Oct 2026); the name of Chrome for Android's install menu hasn't been verified. The **Expected output** boxes come from Chrome without a screen, as wide as a phone (375 and 412 px), over a stand-in HTTPS; the padlock, the install dialog, and the icon on the phone weren't captured.

Your dashboard is on `https://` now, so any phone can install it ([Concept 11](#11-pwa-from-a-shortcut-to-an-app), [3.6](#36--the-manifest-the-service-worker-and-installing-the-dashboard-from-httplocalhost-7-minutes)). Module 23's phone mode retires for access from outside: the laptop's `WEB_ADDRESS` may go back to `127.0.0.1`. The free path: the same steps, through your Tunnel.

#### 12.1 ⭐ Android: install the dashboard from Chrome (8 minutes)

1. **Chrome** on the phone: open `https://iot.yourname.my.id` (a padlock in the address bar), then log in.
2. The ⋮ menu → the option to install the app (its name differs per version), then accept.
3. Tap the house icon on the home screen (its short name is `Smart Home`): the dashboard opens without an address bar (standalone). The Module 24 shortcut may be deleted.

**Result (the author's lab, 412 px):** `isSecureContext: true`, the service worker `activated`, the manifest `errors: []`, the install-error list **`[]`**. Not offered? [🚨](#-troubleshooting) *The offer to install the app doesn't appear*.

**You pass this ⭐ step** when the house icon on the home screen opens the dashboard without an address bar (iPhone: through 12.2).

#### 12.2 iPhone: Add to Home Screen from Safari (6 minutes)

Use **Safari** (not tested by the author):

1. Open `https://iot.yourname.my.id`, then log in.
2. Tap ⋯ → **Share** → **Add to Home Screen** (if it isn't there: **Edit Actions**).
3. Turn on **Open as Web App**, then tap **Add**.

#### 12.3 ⭐ The phone's Wi-Fi off: Live over mobile data (6 minutes)

Turn the phone's Wi-Fi off, turn mobile data on, open the app from its icon (log in again if asked), then open Node 1's details: the **Live** badge is lit and the numbers change within ±20 seconds (Node 1 sends every 10 seconds).

**Result (the author's lab):** the details read twice 21 seconds apart, with a changed text (`last seen 15 seconds ago` → `6 seconds ago`).

**You pass this ⭐ step** when **Live** is lit and Node 1's numbers change while the phone only uses mobile data.

#### 12.4 ⭐ T1: a friend in another city opens your dashboard over HTTPS (15 minutes)

**1. A temporary viewer account** (look only, no control buttons). SSH terminal to the VPS, project root (the free path: the Pi, [Practice 11](#practice-11--the-free-path-everything-on-the-pi-and-cloudflare-tunnel-85-minutes)); a new strong password typed twice:

```text
docker compose exec backend node src/db/manage-users.ts add <friend-email> "<Friend Name>" viewer
```

**Expected output (the author's lab; the email disguised):**

```text
New password: ****************************************
Type it again: ****************************************
account 3 created: <friend-email> (Out-of-Town Friend, viewer)
```

**2. Send it in a private message**, not in a group: the address `https://iot.yourname.my.id`, the email, and the password.

**3. Your friend opens it alone** from their own network, without being guided: the padlock, **Log in**, the **Live** badge, their name with `(viewer)`, Node 1's details without control buttons, the numbers changing without a reload. Ask for their screenshot, the time, and the network's name. No friend yet? Use this account on your own phone over mobile data, noted as the stand-in.

**Result (the author's lab, "the friend's phone" = Chrome device mode at 375 px):** `Out-of-Town Friend (viewer)` and **Live**; the controls section doesn't show; without a reload, `updated at 17:50:19 WIB` became `17:50:39 WIB` and the soil moisture went from 56% to 42%.

![Composite of four real screenshots of the Mini Smart Home dashboard 1.3.0 with backend 1.4.0 on a simulated VPS, opened over HTTPS from the simulated internet (a Docker network, a certificate from the stand-in CA Pebble, the lab address iot.example.test in place of iot.yourname.my.id), in Chrome device mode 375 pixels on Linux, not a real phone; the address bar and the padlock are not captured. Practice 12.4, 30 Oct 2026 at 17:50 WIB. Top left, the Log in page: Email friend@example.test and a Password of dots (number 1, a temporary viewer account). Top middle, the Device List after Log in: the green Live badge (number 2), Out-of-Town Friend (viewer) (number 3), the Practice living room card Online, key active, Temperature 29.1 °C, last seen just now (number 4), the Practice porch card not registered, and the Garden (mock) card Online, via linking device (number 4). Bottom left, Node 1 details at 17:50:19 WIB: node1 Online, straight to the Temperature last 5 minutes chart with no Controls section (number 5), updated at 17:50:19 WIB (number 6), Soil moisture 56 percent, Water tank 82 percent. Bottom right, 20 seconds later without a reload: updated at 17:50:39 WIB (number 6), Soil moisture 42 percent, Water tank 89 percent, the chart moved. Right column: the numbered legend; the access and session cookies marked Secure, Socket.IO over wss. The friend's account was deleted afterwards. Data from the simulator and the mock Garden.](assets/dashboard-from-outside.png)

A picture from the author's lab (a simulated VPS and CA, not a real phone; the email on the **Login** page = the lab account); on your friend's phone, the address bar shows the padlock and `https://iot.yourname.my.id`.

**4. Delete the account** once the proof is collected:

```text
docker compose exec backend node src/db/manage-users.ts delete <friend-email>
```

**Result (the author's lab):** `<friend-email> deleted together with all its sessions`.

**You pass this ⭐ step (T1)** when your friend (or your phone over mobile data, noted as the stand-in) sees the padlock, **Live**, and Node 1's numbers changing from outside your home, and the account has been deleted afterwards.

#### 12.5 Record the T1 proof, then a new app version (5 minutes)

Write down for [➕ F](#f-save-your-study-notes-the-t1t3-proof-the-fingerprint-the-monthly-cost-and-docker-stats): the time (WIB), the network and the city, who opened it, and the screenshot; without your friend's password and email.

After the web image is rebuilt some day, the new version shows on the next opening: close the app from the list of recent apps, then open it again; still the old version? Repeat once. What you typed into forms is safe ([🚨](#-troubleshooting) *The old dashboard version keeps showing on the phone or in the browser*).

> ⬆️ **Done with Practice 12?** Every pass requirement of your path is proven now. [Practice 13](#practice-13--optional-a-device-at-another-location-over-mqtts-without-a-gateway-20-minutes) is optional and needs the VPS broker (the main path); if you skip it, continue to the [➕ Add-on](#-add-on-to-mini-smart-home).

### Practice 13 — (Optional) A device at another location over `mqtts://`, without a gateway (20 minutes)

> 🖥️ **Tools used:** **VS Code** on the laptop, a terminal in the `tools` folder; **Bruno** (the **internet** environment); an **SSH terminal to the VPS**, folder `/home/house/mini-smart-home`. No commit (`tools/.env` stays outside Git). Concepts used: 8.

Picture a board in the garden or at grandma's house, far from your Pi: it goes straight to the VPS's door 8883 in a TLS envelope (the Syllabus's optional scenario). Its part is played by the `tools/` simulator as it is, the practice device `f00d00000001`. The free path: skip it, the broker is only at home.

#### 13.1 The practice device and its account on the VPS broker (8 minutes)

1. **The VPS backend.** `f00d00000001` has been registered since Module 21 and moved along in 7.5, so `KEY_F00D00000001` in `tools/.env` still applies. Not registered, or the key is lost? Bruno, the **internet** environment (first change its `baseUrl` to your domain; Bruno not tested by the author): **login admin**, then **register practice device** or **rotate practice device key**; copy the key into `tools/.env`.
2. **The VPS broker** (the pattern of [8.2](#82-the-checker-pi-bridge-and-monitor-accounts-on-the-vps-broker-5-minutes)): the account name = the `device_id`, its password = that key, pasted twice. Then restart:

```text
docker compose exec -u mosquitto mosquitto mosquitto_passwd /mosquitto/data/broker-passwd f00d00000001
```

```text
docker compose restart mosquitto
```

The Pi's bridge and the backend reconnect by themselves; the readings of that moment are held by the Pi. The permission list stays: block 1 of `edge/acl-broker` locks every device in its own topic.

> 🔀 **Without a Kit:** `f00d00000001` is already your Node 1 through the Pi. Register `f00d00000002` (change the `device_id` in Bruno), create its account on the VPS broker, keep its key in `tools/.env.vps` (`KEY_F00D00000002=…`; Git ignores `.env.*`), then in 13.2 use `--env-file=.env.vps`, the number `2`, and `grep f00d00000002`: the first device is skipped (`no key in tools/.env`), the second goes `online` (the author's lab way).

#### 13.2 The simulator to `mqtts://mqtt.yourname.my.id:8883` (8 minutes)

In the terminal of the `tools` folder, note `mqtts://` (with an envelope), the broker's **name** (its certificate is for the name, not an IP), and 8883. No CA file: Node.js already carries the ISRG Root X1 and X2 roots (the author's lab gave it the stand-in CA's root through `NODE_EXTRA_CA_CERTS`).

```text
node --env-file=.env device-simulator.js mqtts://mqtt.yourname.my.id:8883 1
```

**Expected output (the author's lab, stand-in CA; cut):**

```text
1 fake device(s) heading to mqtts://mqtt.yourname.my.id:8883. …
f00d00000001: online
```

On the VPS: `docker compose logs --since 2m mosquitto | grep f00d00000001`. **Expected output (the author's lab; the `mosquitto-1  | <seconds>:` prefix removed):**

```text
New client connected from 198.51.100.10:44380 as f00d00000001 (p4, c1, k15, u'f00d00000001').
Client f00d00000001 negotiated TLSv1.3 cipher TLS_AES_256_GCM_SHA384
```

`c1` = a clean session, like Node 1. Its card on the VPS dashboard is **Online**. Stop with **Ctrl + C**.

#### 13.3 Its limits: no offline queue, and an ESP32 directly over TLS (4 minutes)

- **No offline queue.** No Pi holds anything: the internet at that location goes down = the readings of that time are lost. That's why Node 1 at home still goes through the gateway.
- **The key is safe on the way:** wrapped in an envelope, unreadable for a sniffer ([8.5](#85-proof-from-the-authors-lab-the-sniffer-cant-read-the-key-anymore-3-minutes)).
- **A real ESP32** needs `WiFiClientSecure` with the ISRG Root X1 root (+X2), the name `mqtt.yourname.my.id`, 8883, an account on the VPS broker, and an NTP clock for `ts`: [🔬](#-technical-deep-dive-optional) *An ESP32 directly over TLS to the VPS* and [🧩 Level 1](#level-1--module-10s-weather-without-setinsecure-check-the-servers-id-card-a-small-change-20-minutes). Not compiled by the author yet; the Node 1 firmware stays 1.6.0.
- Not using it anymore? Repeat the account command of 13.1 with `-D` after `mosquitto_passwd`, then restart (not recorded by the author).

> ⬆️ **Done with Practice 13?** Continue to the [➕ Add-on](#-add-on-to-mini-smart-home); the [🧩 Challenges](#-independent-challenges) can be done afterwards, on a new branch from `main`.

## 🚨 Troubleshooting

Click the title closest to your problem (Compose basics: [🚨 Module 26](../module-26-docker-compose/README.md#-troubleshooting); broker accounts and the ACL: [🚨 Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#-troubleshooting)). First glance at `docker compose ps -a` and `docker compose logs <service>` on the machine with the problem (the gateway: the `edge` folder on the Pi). The errors are quoted from the author's lab (a simulated internet and CA), except the ones marked "research prototype" or "not recorded". Asking on a forum or an AI? Paste the log, never `.env`, a token, a key, or the output of `docker compose config`.

<details>
<summary><b>Old instructions → what's right for our versions (Caddy 2.11.7, Mosquitto 2.1.2, Let's Encrypt 2026–2028, <code>cloudflared</code> 2026.10.5, vite-plugin-pwa 2.0.0)</b></summary>

| Old instruction | What's right for our versions | Why |
| :--- | :--- | :--- |
| `certbot` + copying by hand | Caddy asks for and renews it by itself | Concepts 6–7 |
| "certificates last 90 days" | 90 days until 9 Feb 2027, 64 days from 10 Feb 2027, 45 days from 16 Feb 2028 | Let's Encrypt |
| "Let's Encrypt emails you before expiry" | stopped on 4 Jun 2025 | watch it yourself (Module 30) |
| bridge `topic # out 1` + `cleansession false` | narrow topics, `cleansession true` + `local_cleansession false`, `upgrade_outgoing_qos true`, `autosave_interval 30` | Concept 9 |
| `bridge_capath /etc/ssl/certs` | `bridge_cafile /etc/ssl/certs/ca-cert-ISRG_Root_X1.pem` | the root is in the image |
| `docker compose kill -s SIGHUP mosquitto` | VPS: `docker compose exec mosquitto kill -HUP 1`; the Pi gateway: `restart` or `up -d --force-recreate` | `kill -s` cancels the restart rule; a HUP on the gateway throws its queue away (lab) |
| "check with `mosquitto --test-config`" | not on a running broker: restart, read the log | it overwrites `mosquitto.db` |
| `trustProxy: true` or `1` | `TRUST_PROXY=uniquelocal` | `true` trusts forgers; a number is refused |
| `mosquitto_sub --cafile …` required | 2.1: `-p 8883` is TLS automatically + the system roots; the plain test `--no-tls` | the 2.1 man page |
| `cloudflared:latest` (the dashboard example) | `cloudflare/cloudflared:2026.10.5` | `latest` changes by itself |
| `setInsecure()` | the root checked (🧩 Level 1) | an envelope without an ID card |
| `vite-plugin-pwa` 0.x, `npm audit fix --force` | exactly `2.0.0` | `--force` installs 0.2.1 |
| "Nginx needs certbot" | Nginx's official ACME module | 🔬 |

</details>

**Certificates and Caddy**

<details>
<summary><b>Caddy gets no certificate: DNS doesn't point there yet, door 80 or 443 is closed, an AAAA record, or the limit of 5 per week</b></summary>

On the VPS: `docker compose logs web | grep -E 'error|challenge'`. Check in order: (1) `nslookup iot.yourname.my.id 1.1.1.1` (also `mqtt.`) answers the VPS's IP ([6.4](#64--nslookup-the-internets-phone-book-knows-your-name-now-5-minutes)); (2) 80 and 443 are open: `WEB_ADDRESS=0.0.0.0` in `.env`, the provider panel's firewall if there is one (ufw doesn't guard Docker's counters); (3) no AAAA record (the `0.0.0.0` counters are IPv4 only); (4) the limit: 5 cards with exactly the same names per 7 days, not negotiable, so no `down -v` (the `smarthome_caddy-data` cupboard would go with it). Failures in a row pause the issuance for that name; your account isn't blocked.

Caddy tries again by itself. Once the cause is fixed, `docker compose restart web` just once (the limit of 5 failed validations per name per hour). The author's lab (stand-in CA): a name without a record → `"msg":"challenge failed"`; real Let's Encrypt's wording wasn't recorded.

</details>

<details>
<summary><b><code>mqtt-certificate</code> stops with <code>FAILED: 5 minutes without a certificate …</code>, then <code>mosquitto</code> doesn't start</b></summary>

The copier waits for the `mqtt.` card for at most 5 minutes, then writes `FAILED: 5 minutes without a certificate for mqtt.yourname.my.id from Caddy. Check: docker compose logs web` (exit 1). `mosquitto` only starts after the copier succeeds, so the broker and the backend are held at `Created`. Fix Caddy, then `docker compose up -d`. The author's lab: `service "mqtt-certificate" didn't complete successfully: exit 2` and `sh: can't open '/scripts/copy-certificate.sh': No such file or directory` = `scripts/` hasn't been copied yet ([2.3](#23-the-module-27-composecloudyml-and-the-on-the-internet-block-in-the-laptops-env-4-minutes)).

</details>

<details>
<summary><b>The browser warns <code>NET::ERR_CERT_…</code> at <code>https://iot.yourname.my.id</code></b></summary>

The end of the code names the check that failed ([Concept 6](#6-certificates-in-full-chain-name-and-dates)): `…AUTHORITY_INVALID` = the chain (an unknown issuer, as in the Quick Win; the only one the author recorded), `…COMMON_NAME_INVALID` = the name, `…DATE_INVALID` = the dates. Possible causes: opening the VPS's IP or another name (the card is only for `iot.` and `mqtt.yourname.my.id`), or a wrong clock on the laptop/phone. Don't click **Advanced** for a real dashboard: that's the browser's version of `setInsecure()`.

</details>

<details>
<summary><b>A wrong <code>CENTER_CONF</code>: the broker doesn't start, or <code>bind source path does not exist</code></b></summary>

The author's lab, `CENTER_CONF=center-internet.cnf` (a typo; the file to mount doesn't exist):

```text
Error response from daemon: invalid mount config for type "bind": bind source path does not exist: /home/house/mini-smart-home/edge/center-internet.cnf
```

Compose doesn't create a stand-in folder. Fix `.env` (VPS: `CENTER_CONF=center-internet.conf`), then `docker compose up -d`. `center-internet.conf` without `MQTT_DOMAIN` makes the broker fail too: its card is never copied (not recorded by the author). The laptop and the free-path Pi: `CENTER_CONF` empty.

</details>

**Mosquitto and door 8883**

<details>
<summary><b><code>Unable to load server certificate</code> or <code>Unable to load server key file</code>, with <code>Permission denied</code></b></summary>

The author's research prototype, with Caddy's cupboard mounted straight into the broker:

```text
Error: Unable to load server certificate "/caddy/caddy/certificates/…/mqtt.yourname.my.id.crt". Check certfile.
OpenSSL Error [0]: error:8000000D:system library::Permission denied
```

The broker drops its rights to `mosquitto` (uid 1883) before reading a card owned by root, then stops ([Concept 8](#8-tls-for-mqtt-door-8883-a-copy-of-the-certificate-and-a-reload)). `… Check keyfile.` = the key, for example a copy made by hand. Make the `volumes:` of `mosquitto` the same as in the module's file (only `certificate-data`), without a symlink, then `docker compose up -d`: `mqtt-certificate` copies and fixes the owner (check as in 8.1).

</details>

<details>
<summary><b>The broker crash-loops after <code>restart</code>, or <code>Error when reloading certificate</code> after a HUP</b></summary>

The author's research prototype, `broker.key` owned by root: `restart` → `Restarting (1)` again and again (6 times in ±12 seconds) with `Error: Unable to load server key file …`. A HUP is actually safe: `Error when reloading certificate '/mosquitto/certs/broker.crt' or key '/mosquitto/certs/broker.key'.`, and the broker keeps using the old card. On the VPS: `docker compose run --rm mqtt-certificate` (it fixes the owner), then `docker compose restart mosquitto` if it crash-loops, or `docker compose exec mosquitto kill -HUP 1` if it's still running.

</details>

<details>
<summary><b><code>wrong version number</code> in the broker log, or <code>mosquitto_sub --no-tls</code> stays silent, then exits with 255</b></summary>

In [8.3](#83--t2a-without-tls-refused-at-8883-and-1883-unreachable-from-outside-10-minutes) that's exactly what's expected (T2a): a plain client at the envelope door; the broker writes `… wrong version number` (what arrived isn't TLS) and `disconnected: Protocol error.`. Silent, then `255` = refused, not stuck (`-d`: `Client null sending CONNECT` again and again). But you wanted to connect? The client forgot its envelope: MQTTX's **SSL/TLS** switch is off, `mqtt://` instead of `mqtts://` (mqtt.js: `ECONNRESET`), or a device without `WiFiClientSecure` (🔬).

</details>

<details>
<summary><b><code>certificate verify failed</code>, <code>unable to get local issuer certificate</code>, or <code>ERR_TLS_CERT_ALTNAME_INVALID</code></b></summary>

The client refuses the card (the author's research prototype):

- **The name:** `mosquitto_sub -d` to the VPS's IP → `… certificate verify failed`; mqtt.js to `iot.` at 8883 → `ERR_TLS_CERT_ALTNAME_INVALID …` (the name isn't listed). Use `mqtt.yourname.my.id`, also in the bridge's `address`.
- **The chain:** a client without a matching root → `unable to get local issuer certificate` (an unknown issuer). Use the system roots; the bridge: the example's `bridge_cafile` as it is.
- **The dates:** a wrong clock on the Pi or the laptop.

The bridge only repeats `Connecting bridge center …`; the author didn't record the reason in the gateway log.

</details>

<details>
<summary><b><code>certificate has expired</code>, <code>Error: Protocol error</code>, or <code>Unable to connect (A TLS error occurred).</code></b></summary>

The author's lab, the copy at 8883 left to expire: the simulator `certificate has expired`, `mosquitto_sub` `Error: Protocol error` (exit 14). A bridge that's connected keeps working, **new** connections are refused (also a bridge that drops for a moment). On the VPS: `sh scripts/renew-mqtt-certificate.sh`, then `crontab -l` ([8.6](#86--renewal-scriptsrenew-mqtt-certificatesh-and-a-weekly-cron-8-minutes)). `Error: Protocol error`, and also `Unable to connect (A TLS error occurred).` (exit 1), show up as well when the root is unknown (lab, stand-in CA): the fold above.

</details>

<details>
<summary><b>The backend or the bridge connects and drops by turns: <code>use_username_as_clientid</code> missing at door 8883</b></summary>

The danger sign in the VPS log: `as backend (… u'<another account>')` or `as pi-bridge (… u'<another account>')`, with `session taken over` in between. That line applies per door; without it under `listener 8883`, any account can use the name `backend` and keep kicking out your backend (the author's checker test: 8 of 8 held readings lost). Make `edge/center-internet.conf` the same as the module's file, `docker compose restart mosquitto`, repeat [8.4](#84-through-8883-another-account-cant-borrow-a-client-name-4-minutes): it must say `as checker`.

</details>

<details>
<summary><b>The broker dies on a Monday morning: a broken <code>acl-broker</code>, then a HUP from cron</b></summary>

Cron reloads the VPS broker every Monday at 03:17 VPS time (UTC; 10:17 WIB), and a reload reads `acl-broker` again: a typo that was never followed by a restart stops the broker with nobody watching. On the VPS: `docker compose logs --since 3h mosquitto`; fix it (`git diff edge/acl-broker`), `docker compose restart mosquitto`, read the log until `mosquitto version 2.1.2 running`. After changing `acl-broker` or `*.conf`, restart right then.

</details>

**The bridge and late arrivals**

<details>
<summary><b><code>Error creating bridge: Try again.</code> again and again, also after moving to another VPS</b></summary>

While the home internet is down, the gateway repeats `Connecting bridge center (mqtt.yourname.my.id:8883)`, then `Error creating bridge: Try again.` (the author's lab; the broker's name can't be looked up, try again later): normal, the bridge comes back within ±30 seconds after the internet returns. Again and again while the internet works: the `address` in `edge/bridge/center.conf` has a typo, or the `mqtt` record doesn't exist yet. Moved to another VPS, or the IP changed: update the A record and the `extra_hosts` line of 9.6 if you use it, then on the Pi `git pull` and `docker compose up -d --force-recreate mosquitto`.

</details>

<details>
<summary><b>The bridge is <code>not authorised</code>: a different <code>pi-bridge</code> password per broker, or an empty <code>CENTER_ADDRESS</code></b></summary>

The destination broker refuses the bridge's account (the author didn't record the wording in the gateway log) and never writes `New bridge connected`. (1) `remote_password` in `edge/bridge/center.conf` = the `pi-bridge` password on its **destination** broker: the laptop (4.2), the VPS (8.2), or the free-path Pi center (11.6); the passwords differ on purpose. (2) After `mosquitto_passwd`, the destination broker was restarted. (3) Kit B to the laptop: an empty `CENTER_ADDRESS` = `host-gateway`, and the bridge knocks on the Pi itself; fill in the laptop's IP. Then in `edge`: `docker compose up -d --force-recreate mosquitto`.

</details>

<details>
<summary><b>The Kit B bridge doesn't connect anymore after the Module 27 code</b></summary>

The laptop's `.env` without `MQTT_ADDRESS=0.0.0.0` ([1.4](#14--kit-b-mqtt_address-in-the-laptops-env-so-the-pi-bridge-stays-connected-3-minutes)): 1883 is only for the laptop itself, without a warning. The author's lab: `docker compose ps mosquitto` writes `127.0.0.1:1883->1883/tcp`, and the gateway log repeats (the connection drops; it tries again 30 seconds later):

```text
Connecting bridge center (center:1883)
Client local.pi-bridge [(null):0] disconnected: Broken pipe.
Bridge center next backoff will be 30000 ms
```

Add the line, `docker compose up -d mosquitto`, make sure it says `0.0.0.0:1883->1883/tcp`; the bridge is back within ±30 seconds (lab: 21 seconds). On your home network the wording may differ.

</details>

<details>
<summary><b>The <code>pi-bridge/state</code> status message never arrives</b></summary>

The subscription stays silent although the bridge is connected: (1) block `7) pi-bridge` in the `edge/acl-broker` of the **central** broker holds `topic write $SYS/broker/connection/pi-bridge/state` (`#` doesn't cover `$` topics; copy the module's file, restart the center); (2) `edge/bridge/center.conf` holds `notifications true` (then recreate the gateway); (3) the topic is written in single quotes: in bash, `$SYS` inside double quotes vanishes. `Connection Refused: not authorised` = the `monitor` account doesn't exist on that broker yet.

</details>

<details>
<summary><b>Readings lost after the central broker is <i>restarted</i>, or the lamp turns on minutes later</b></summary>

**Readings lost**, three causes:

- **The gateway broker was HUPed at some point.** The author's lab, 2 of 2 rounds: after `kill -HUP 1` on the gateway, 12 readings of the blind window were lost when the gateway noticed the outage (the queue dropped 71 → ±60); without a HUP, 0 lost. The cause hasn't been investigated yet. On the Pi, always `docker compose up -d --force-recreate mosquitto` or `restart`, also before an outage test.
- **Backend 1.3.0** (a clean session): the queue that arrives before the backend subscribes again is lost (code lab: 1 of 4 times the central broker was stopped and started again). The log `as backend (p4, c1, …)` = old, `c0` = 1.4.0 ([2.1](#21-three-changes-in-src-envts-and-serverts-mqttts-and-commandsts-8-minutes)).
- **`gateway.conf` without `upgrade_outgoing_qos true`**: lab, a 1–2 minute hole at the start of the outage.

**The lamp turns on minutes later:** the bridge is still `cleansession false` (the VPS log `as pi-bridge (p4, c0, …)`; repeat 4.2/9.2), or backend 1.3.0. The author's lab, old settings: the lamp moved 3–4 minutes after the dashboard reported a failure, with the log `ack c-… arrived, but no command is waiting for it`. Normal if the internet comes back less than 2 minutes after the button was pressed: `… command sent again`, as the toast says.

</details>

<details>
<summary><b>The dashboard says <code>Online</code> although the home internet is down</b></summary>

A known gap ([Concept 9](#9-a-store-and-forward-bridge-who-holds-what)): Node 1 stays connected to the Pi, so nothing reports `offline` to the VPS. The signs, after the last reading: `· stale data` after ±30 seconds (the Garden: 16 minutes), 🔴 "Silent node" after ±6 minutes. `$SYS/broker/connection/pi-bridge/state 0` on the VPS = the gateway is cut off (a banner on the dashboard: 🧩 Level 3). Meanwhile the server's automation rules stay quiet and Node 1's local safety doesn't kick in.

</details>

**Backend, Caddy, and Grafana**

<details>
<summary><b>403 when logging in, or the server stops with <code>is not a page address</code>: <code>CORS_ORIGIN</code></b></summary>

The author's lab, a page from an address outside `CORS_ORIGIN`: `{"message":"request from the page http://iot.yourname.my.id refused"} [403]`. The VPS and the free-path Pi: exactly `CORS_ORIGIN=https://iot.yourname.my.id`. With a `/` at the end, backend 1.4.0 refuses to start: `migrate` exits with 1 as in the next fold, and its log holds `… is not a page address: …` (from the code; not recorded). Fix `.env`, `docker compose up -d`.

</details>

<details>
<summary><b>429 for every visitor, a cookie without <code>Secure</code>, or a number in <code>TRUST_PROXY</code> refused</b></summary>

The author's lab, `TRUST_PROXY=false` on the VPS: the `access` cookie without `Secure`, and after visitor A was wrong nine times, visitor B from another address got `429` too (every visitor is taken for Caddy). Delete the line (Compose's default is `uniquelocal`), `docker compose up -d backend`, look for `trusted proxies (TRUST_PROXY): uniquelocal` in the log (7.9). `TRUST_PROXY=1`: `service "migrate" didn't complete successfully: exit 1`, the backend `Created`, and `docker compose logs migrate`:

```text
migrate-1  | Setting TRUST_PROXY in .env: a number (a hop count) isn't used by Fastify 5 (it trusts nothing at all); behind Caddy write uniquelocal
```

The free path: without `CADDY_TRUSTED_PROXIES=private_ranges`, every visitor is taken for `cloudflared`.

</details>

<details>
<summary><b><code>port is already allocated</code> for 443 or 8883 on the laptop</b></summary>

The Module 27 Compose file reserves `127.0.0.1:443` and `127.0.0.1:8883` on the laptop too; Docker refuses if another program (a VPN, a web server) is using them. Find who uses them ([🔁 Step 5](#step-5--who-is-using-counters-80-443-1883-and-8883)), or write `PORT_HTTPS=8443` and `PORT_MQTTS=8884` in the laptop's `.env`, then `docker compose up -d`. On the VPS, leave 443 and 8883.

</details>

<details>
<summary><b><code>Error: Cannot find module '/app/src/db/migrate.ts'</code> on the VPS</b></summary>

The author's code lab: the clone was made with `umask 077`, so its files can only be read by their owner, while the image runs as the user `node`. Check `umask` (`0077`; Ubuntu is usually `0002` or `0022`). At the VPS project root: `chmod -R go+rX backend frontend edge grafana scripts` (`.env` stays `600`; not tested exactly like this), then `docker compose build` and `docker compose up -d`.

</details>

<details>
<summary><b>Telegram <code>409 Conflict</code>: two backends holding one bot token</b></summary>

One bot token for one backend (7.6). The author's lab in Module 26, a second backend: `ERROR: Telegram bot stopped: Call to 'getUpdates' failed! (409: Conflict: …)`. The laptop: `docker compose stop backend` (dev mode: **Ctrl + C**); the VPS (the free path: the Pi): `docker compose restart backend`, because the bot doesn't recover by itself.

</details>

<details>
<summary><b><code>/grafana/</code> shows the dashboard's "Page not found"</b></summary>

The service worker answers it with the dashboard's shell: `navigateFallbackDenylist` without `/grafana` ([3.3](#33-viteconfigts-the-manifest-the-service-worker-and-three-paths-that-always-go-to-the-network-6-minutes)), or an old service worker. Make the file the same, rebuild the web image, reload twice (or **Clear site data**). On the laptop, Grafana is at `http://localhost:3000`, not `/grafana/`. `/sw.js` in the address bar is answered that way too: normal.

</details>

<details>
<summary><b>Grafana refuses the right password, or a Grafana login through the LAN IP fails</b></summary>

After a few wrong tries, Grafana temporarily refuses the right password too, silently (the author's lab: `Invalid username or password`, recovering within a few minutes): wait, then try once. Through `http://<LAN IP>/grafana/`, the browser doesn't keep Grafana's cookie marked `Secure`: use `http://localhost:3000` on the laptop or the `https://` address.

</details>

**The phone app (PWA)**

<details>
<summary><b>The offer to install the app doesn't appear</b></summary>

Not a secure context (`http://<LAN IP>`, Module 24's phone mode; use `https://` or `http://localhost`, [Concept 11](#11-pwa-from-a-shortcut-to-an-app)); already installed (look for the house icon); or DevTools → **Application** → **Manifest** writes an error, for example the 192/512 icons not downloaded with **Download raw file** (3.2). **Service workers** must be `activated`. An iPhone installs through **Share** (12.2).

</details>

<details>
<summary><b>The old dashboard version keeps showing on the phone or in the browser</b></summary>

The new version is fetched in the background and shows on the next opening; a tab doesn't reload by itself, and what you typed into forms is safe (the author's lab: on the second reload). Close every dashboard tab (phone: close the app from the recent list), open it again, repeat once. Still old? Make sure the new web image is running (3.5). The last resort: **Clear site data**.

</details>

<details>
<summary><b><code>npm run dev</code> shows the old dashboard: a <i>service worker</i> from <code>npm run preview</code></b></summary>

Both are at `http://localhost:5173`, and the service worker from `preview` keeps serving the old shell (3.7). DevTools → **Application** → **Storage** → **Clear site data**, then reload (the login cookie is deleted too). No automatic cure is installed: repeat it every time you're done with `preview`.

</details>

**VPS and SSH**

<details>
<summary><b>SSH refuses: <code>Permission denied (publickey)</code></b></summary>

An OpenSSH message (not recorded by the author). For `root` after [5.4](#54--turn-off-password-and-root-logins-00-lockconf-sshd--t-and-a-second-window-10-minutes), that's right. For `house`: your public key isn't in `/home/house/.ssh/authorized_keys` yet (5.3), the user name is wrong, or the laptop uses another key (`ssh -v` shows the keys it tries). Fix it from a session that's still open, or see the fold *Locked out of the VPS …*.

</details>

<details>
<summary><b><code>REMOTE HOST IDENTIFICATION HAS CHANGED</code> after the VPS is rebuilt</b></summary>

A reinstalled VPS brings a new key fingerprint, while your laptop's `known_hosts` remembers the old one ([Concept 3](#3-ssh-keys-and-a-regular-user-password-login-and-root-turned-off)). You really did rebuild it? `ssh-keygen -R 203.0.113.10`, SSH again, compare the fingerprint with the provider's panel (5.2). You didn't rebuild anything? Stop and ask the provider: it may be an impostor.

</details>

<details>
<summary><b>Locked out of the VPS: ufw without 22, or a misconfigured <code>sshd</code></b></summary>

Open the web console in the provider's panel (not tested by the author), log in as `house` with the password from `adduser`: the ban on password login is only for SSH. Then `sudo ufw allow 22/tcp`, `sudo sshd -t` (silent = correct; anything else points at the wrong line), fix it, `sudo systemctl restart ssh.service`.

</details>

<details>
<summary><b>Password <i>login</i> still on according to <code>sshd -T</code></b></summary>

OpenSSH uses the **first** value it finds, and the files in `/etc/ssh/sshd_config.d/` are read in alphabetical order. Your file must be named `00-lock.conf` in that folder, so it's read before `50-cloud-init.conf` (on a VPS with cloud-init it holds `PasswordAuthentication yes`); check with `ls /etc/ssh/sshd_config.d/`. Fix it, repeat `sshd -t` and `sshd -T` from 5.4, `sudo systemctl restart ssh.service`, test with a second window.

</details>

<details>
<summary><b>A <i>build</i> on the VPS stops because it runs out of memory, or <code>no matching manifest for linux/amd64</code></b></summary>

The 2 GB of memory ran out: the system stops the build (not recorded by the author; usually `Killed`). Add swap ([5.6](#56-a-2-gb-swap-for-building-images-5-minutes)), build before the other services start (7.4), or one at a time: `docker compose build backend`, then `web`. `… already exists` once (the author's lab: `migrate` and `backend` building the same image at the same time): repeat the command. `no matching manifest …` = the image in the shop was made on arm64 (a Pi, an Apple-silicon Mac): build on the VPS, or push from an Intel/AMD laptop (Module 26 Practice 10).

</details>

**DNS and Cloudflare**

<details>
<summary><b><code>nslookup</code> doesn't answer yet, or still gives the old answer</b></summary>

No answer yet: the nameservers aren't active yet ([6.2](#62-cloudflares-free-plan-change-the-nameservers-then-wait-until-its-active-8-minutes); the author doesn't know how long it takes). `nslookup -type=NS yourname.my.id 1.1.1.1` must name two Cloudflare nameservers; if it does, check the record's name. An old answer: the resolver remembers it until its TTL runs out; ask `1.1.1.1`, wait, use a small TTL. The main path: both records with a gray cloud; an orange `mqtt.` doesn't let 8883 through ([Concept 5](#5-domains-and-dns-the-internets-phone-book)).

</details>

<details>
<summary><b>Cloudflare refuses a <code>.my.id</code> domain</b></summary>

The author hasn't verified the free plan's support for `.my.id`. The main path still works: keep the registrar's nameservers, create the A records `iot` and `mqtt` (no AAAA) in the registrar's panel (🔀 6.3). The free path needs a domain managed by Cloudflare: another domain, or the main path.

</details>

<details>
<summary><b><code>Provided Tunnel token is not valid.</code> and <code>Restarting (255)</code></b></summary>

The author's lab (an empty token): `cloudflared` `Restarting (255)`, the log `Provided Tunnel token is not valid.`. `TUNNEL_TOKEN` in the Pi's `.env` is empty, cut off, or longer than the string after `--token`: copy it again as one line ([11.7](#117--cloudflare-tunnel-the-token-in-env-a-route-to-httpweb80-and-the-tunnel-profile-12-minutes)), `docker compose up -d`. No `cloudflared` in `ps -a`? The `#` in front of `COMPOSE_PROFILES=tunnel` hasn't been deleted. A leaked token: create a new tunnel.

</details>

<details>
<summary><b>A Cloudflare error page at the free-path dashboard address</b></summary>

The page comes from Cloudflare (the author didn't record its code). Check in order: `cloudflared` `Up`; **Service URL** exactly `http://web:80` (the documentation's example `localhost` = the `cloudflared` container itself); `docker compose ps web` `Up`; the DNS `iot` = an orange CNAME to `<tunnel-id>.cfargotunnel.com`, with no leftover A record `iot`. The home internet is down? Normal until it's back (11.9).

</details>

**Messages you can ignore**

<details>
<summary><b>Safe to ignore: <code>session taken over</code> once, <code>world readable</code>, <code>duplicate skipped</code>, a brief 502, UTC times in the log, and <code>npm warn deprecated</code></b></summary>

- `Client backend … disconnected: session taken over.` once, right before `as backend (p4, c0, k60, u'backend')`: the backend's persistent session carries on.
- `Warning: File /mosquitto/config/acl-broker has world readable permissions. …`: since Module 26; the ACL still applies.
- `duplicate skipped`: a repeated send refused by the `(device_id, ts)` key; `duplicates` stays 0.
- `/api` 502 for a few seconds after `up -d`: `web` deliberately doesn't wait for the backend (Concept 7).
- UTC times in the Caddy, Grafana, and VPS cron logs (+7 = WIB); the backend log is already WIB.
- `npm warn deprecated glob@11.1.0: …` and `4 low severity vulnerabilities` (the frontend's build tools; `--omit=dev` → 0). No `npm audit fix --force`.
- Four Caddy `warn` lines on the laptop and the free-path Pi: their HTTPS is on the VPS or at Cloudflare.

</details>

## 🔬 Technical Deep Dive (optional)

You can skip this: the Syllabus's optional choices, the story behind our settings, and how the author simulated the internet. Unless marked "the author's lab", the content comes from the official documentation (read 29 Oct 2026) and **hasn't been run by the author**: just read it.

<details>
<summary><b>Nginx for comparison: the official ACME module, without certbot</b></summary>

The idea that "Nginx needs certbot" is out of date: Nginx (stable 1.30.6 at the time of writing) now has an official ACME module, `ngx_http_acme_module` (the package `nginx-module-acme`), with the HTTP-01 or TLS-ALPN-01 challenge and no wildcard names (`*.yourname.my.id`, every name at once). The difference is in the number of lines: in Nginx you load the module yourself, register the ACME issuer, put the certificate in every `server` block, and write the redirect to `https://`. Our Caddyfile doesn't hold a single line about certificates ([Concept 7](#7-caddy-as-the-front-door-automatic-https-and-trust_proxy)). The same in both: Mosquitto still needs a copy of the card and a reload (Concept 8).

</details>

<details>
<summary><b>acme.sh and DNS-01: a certificate without an open door</b></summary>

HTTP-01 and TLS-ALPN-01 need port 80 or 443 open to the internet. **DNS-01** proves you own the name through a TXT record in your DNS, without an open door. What it's good for: wildcards, and a real card for a server that can't be reached from the internet, for example a TLS broker on the free path's LAN. The official Caddy image has no DNS plugin (it needs a self-built image); a common choice: **acme.sh** (3.1.6), for example `acme.sh --issue --dns dns_cf -d yourname.my.id -d '*.yourname.my.id'`. Three notes:

- Its default CA is ZeroSSL; switch with `acme.sh --set-default-ca --server letsencrypt`.
- Cloudflare's DNS needs an API token (`CF_Token`, permission *Zone → DNS → Edit*), kept in `~/.acme.sh/account.conf`. That token can change your domain's DNS: treat it like `TUNNEL_TOKEN`.
- `--reloadcmd` can restart the broker after the card is copied; from inside a container, it needs the Docker socket, which equals root ([🔬 Module 26](../module-26-docker-compose/README.md#-technical-deep-dive-optional), the fold *The `docker` group equals root …*).

</details>

<details>
<summary><b>MQTT over WebSocket through the tunnel (not tested by the author)</b></summary>

The Cloudflare tunnel carries HTTP and WebSocket, not plain MQTT ([Concept 10](#10-the-free-path-cloudflare-tunnel)). MQTT wrapped in WebSocket ([🔬 Module 11](../../phase-2-connectivity/module-11-mqtt-and-data-contract/README.md#-technical-deep-dive-optional)) can get through. A sketch for the free path:

1. The central broker on the Pi gets a second door (WebSocket is built into Mosquitto 2.1). The third line is written again because it applies per door (Concept 8):

   ```text
   listener 9001
   protocol websockets
   use_username_as_clientid true
   ```

2. A new route in the same tunnel: **Hostname** `ws.yourname.my.id`, **Service URL** `http://mosquitto:9001` (one hallway, no new counter).
3. Clients (MQTTX, mqtt.js) to `wss://ws.yourname.my.id`, with the same accounts.

Its limits: the broker can be reached from the internet (T2-free no longer holds); PubSubClient on the ESP32 can't do WebSocket; Cloudflare can read the MQTT passwords because the envelope is opened at its edge; and according to its documentation, a WebSocket that stays quiet for long is closed, so clients must use a keepalive and reconnect by themselves.

</details>

<details>
<summary><b>ECDSA versus RSA chains, and the danger of <code>preferred_chains smallest</code></b></summary>

Caddy creates an ECDSA P-256 key unless asked otherwise (the code of CertMagic, Caddy's HTTPS library); in the author's lab, `curl -v` writes `id-ecPublicKey`. The ECDSA chain ([Concept 6](#6-certificates-in-full-chain-name-and-dates)) is one link longer because it goes through ISRG Root X2 before X1: browsers don't notice, small devices check more cards. If an ESP32 struggles with it some day (not measured by the author), the global option `key_type rsa2048` asks for an RSA key: `leaf ← YR1/YR2 ← Root YR ← ISRG Root X1`.

`preferred_chains smallest` picks the shortest chain the issuer offers, which may end at Root YE or Root YR. According to Let's Encrypt, chains to those new roots aren't expected to work in any major root list yet, and clients that only carry X1 will refuse them. The default chain is already right: leave it.

</details>

<details>
<summary><b>The Let's Encrypt practice CA and Caddy's <code>email</code> option</b></summary>

**The practice CA.** Caddy's documentation strongly recommends Let's Encrypt's practice CA (staging) while testing, with one line in the global block:

```text
acme_ca https://acme-staging-v02.api.letsencrypt.org/directory
```

Its rate limits are much looser, but its cards aren't trusted by browsers, the Pi's bridge, or an ESP32 (a warning like in the Quick Win). This module doesn't use it, because Caddy already moves to the practice CA by itself when it retries after a failure (Concept 6). Using it anyway? Afterwards delete the line, `docker compose restart web`, wait for `certificate obtained successfully`, then run the script of [8.6](#86--renewal-scriptsrenew-mqtt-certificatesh-and-a-weekly-cron-8-minutes): `mqtt-certificate` picks the newest file. Not tried by the author.

**The `email` option.** Without `email` (our Caddyfile), the only issuer is Let's Encrypt; with `email`, according to the code of Caddy 2.11.7, ZeroSSL is added as a backup; with `acme_ca`, only that CA. Expiry warning emails are no reason: Let's Encrypt stopped them on 4 Jun 2025.

</details>

<details>
<summary><b>HSTS and HTTP/3</b></summary>

**HSTS** (Strict-Transport-Security) tells the browser: "for this name, always `https://` for N seconds". Without it, `iot.yourname.my.id` typed without `https://` may first leave as a postcard to port 80 before it's redirected with `308`, and on public Wi-Fi that postcard can be intercepted. Caddy doesn't add it: the Expected output of [7.8](#78--the-padlock-at-httpsiotyournamemyid-308-logging-in-and-the-secure-cookie-6-minutes) has no `strict-transport-security` line. Put one line in the site block, a short lifetime first, then `docker compose restart web`:

```text
header Strict-Transport-Security "max-age=86400"
```

The price: for that lifetime, a browser that has visited refuses your name without valid HTTPS, and certificate warnings can't be clicked past. No `includeSubDomains` or `preload` (permission to build your name into browsers' default list) for a practice domain.

**HTTP/3.** `alt-svc: h3=":443"; ma=2592000` in 7.8 = Caddy's offer: "I can also do HTTP/3 over UDP 443; remember it for 30 days". That's why there's a counter and a ufw rule for `443/udp`. UDP blocked? The browser keeps using HTTP/2. The author didn't test HTTP/3 separately.

</details>

<details>
<summary><b>An ESP32 directly over TLS to the VPS: <code>WiFiClientSecure</code> (not compiled by the author)</b></summary>

The Syllabus's optional scenario: an ESP32 at another location, without a Pi, straight to `mqtts://mqtt.yourname.my.id:8883` (the simulator version: [Practice 13](#practice-13--optional-a-device-at-another-location-over-mqtts-without-a-gateway-20-minutes)). The Node 1 firmware stays 1.6.0; if you write it some day, this is what changes in `networking.cpp`, according to the code of the esp32 package 3.3.12 and the official `WiFiClientSecure` example:

```cpp
#include <WiFiClientSecure.h>
static WiFiClientSecure netClient;            // before: WiFiClient
static PubSubClient mqtt(netClient);
// … before connecting:
netClient.useBuiltinCACertBundle();           // or setCACert(ISRG_ROOT_X1)
mqtt.setServer("mqtt.yourname.my.id", 8883);  // a name, not an IP
```

- **The root:** the built-in bundle holds ISRG Root X1 and X2; `setCACert()` takes X1 alone (`isrg_root_x1.h` in [🧩 Level 1](#level-1--module-10s-weather-without-setinsecure-check-the-servers-id-card-a-small-change-20-minutes)) or, according to its code, X1 and X2 one after the other. A root that changes some day = new firmware (OTA, Module 28).
- **The name:** firmware 1.6.0 uses an IP address on purpose; through an IP, the name check fails.
- **The dates:** with the esp32 package's default configuration they aren't checked, so renewal stays the VPS's job. NTP is still needed for `ts`.
- **A device account** on the VPS broker ([13.1](#131-the-practice-device-and-its-account-on-the-vps-broker-8-minutes)); **no offline queue**: the internet down = readings lost.

Not compiled or tried on a board by the author yet; the memory for the TLS handshake hasn't been measured.

</details>

<details>
<summary><b>Clean versus persistent sessions: why backend 1.4.0 uses a persistent session</b></summary>

| | Clean session | Persistent session |
| :-- | :-- | :-- |
| When the client drops | the broker forgets its subscriptions | the broker remembers its subscriptions and holds QoS 1 messages for it |
| In this project | Node 1; the bridge at the center's side (`cleansession true`) | backend 1.4.0; the bridge at the gateway's side (`local_cleansession false`) |
| Broker log | `c1` | `c0` |

**Why the backend?** The author's code lab with a clean-session backend: of four times the central broker was restarted, once the bridge got in first, and the whole queue (3 readings) was thrown away because there was no subscriber yet. The backend deliberately started 25 seconds after the broker: 6 published, 0 stored; with a persistent session: 9 published, 9 stored. This can happen on `restart mosquitto`, a VPS reboot, or a recreated backend ([2.1](#21-three-changes-in-src-envts-and-serverts-mqttts-and-commandsts-8-minutes)). **Why not Node 1?** It receives commands, and a persistent session keeps stale commands ([Module 11](../../phase-2-connectivity/module-11-mqtt-and-data-contract/README.md#6-qos-regular-mail-registered-mail-and-a-courier-who-wants-a-signature)); the backend receives data with a `ts`, and late data is still data.

**Normal:** `… disconnected: session taken over.` every time the backend reconnects; not an impostor, because of `use_username_as_clientid true` at every door (Concept 8). **The limit:** only QoS 1 messages are held (the QoS 0 of devices without a gateway, Practice 13, is still lost while the backend is down), at most 1000 messages (Mosquitto's default, ±1.5 hours for two devices with Node 1's rhythm).

**A T2a bonus: what's inside the "silence" of [8.3](#83--t2a-without-tls-refused-at-8883-and-1883-unreachable-from-outside-10-minutes).** Add `-d` (`-W 4` is enough):

```text
mosquitto_sub -d --no-tls -h mqtt.yourname.my.id -p 8883 -u checker -P <password> -t 'msh/+/status' -v -C 1 -W 4
```

**Expected output (the author's lab, stand-in CA):** four lines, then `echo $?` → `255`.

```text
Client null sending CONNECT
Client null sending CONNECT
Client null sending CONNECT
Client null sending CONNECT
```

One attempt per second, each one refused (`wrong version number`). `null`: `mosquitto_sub` lets the broker give the client its name.

</details>

<details>
<summary><b>Options not used: <code>bridge_tls_use_os_certs</code>, <code>keepalive_interval</code>, <code>persist-sqlite</code>, mTLS, and fail2ban</b></summary>

- **`bridge_tls_use_os_certs true`** (new in Mosquitto 2.1) replaces `bridge_cafile`: the bridge trusts the image's whole list of roots, so new roots arrive with a new image. We still write `bridge_cafile` ISRG Root X1 so the trusted root is visible, as the Syllabus words it. Not tested.
- **A smaller `keepalive_interval`** (default 60 seconds, minimum 5) shortens the blind window ([Concept 9](#9-a-store-and-forward-bridge-who-holds-what)) with more frequent pings. Since `upgrade_outgoing_qos true`, the blind window no longer loses data. Not tested.
- **The `persist-sqlite` plugin** is in the 2.1.2 image and recommended by Mosquitto's documentation, but it can't be used together with `persistence true`. We use the latter + `autosave_interval 30`, which has passed a 10-minute outage test.
- **The free path + `WEB_ADDRESS=0.0.0.0`** (phone mode on the Pi): `private_ranges` then also trusts home Wi-Fi devices that knock on Caddy directly, so they could fake their address in the log and in the login limiter. Leave it at `127.0.0.1`.
- **mTLS** (a certificate per device): [🔬 Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#-technical-deep-dive-optional).
- **fail2ban** (an Ubuntu 26.04 package) fends off SSH password guessers; password login is already off (5.4), so it isn't installed.

</details>

<details>
<summary><b>How the author simulated the internet: Pebble, a Docker hallway, and <code>docker network disconnect</code></b></summary>

Every Expected output box was recorded on one Raspberry Pi 5 (Ubuntu 26.04, Docker 29.1.3, Compose 2.40.3), without a VPS, a domain, or a phone. The recipe is also a safe exercise for Linux readers before paying:

1. **The internet** = a Docker hallway of its own: `docker network create --subnet 10.27.40.0/24 simulated-internet`.
2. **Let's Encrypt** = **Pebble** 2.10.1, a test CA made by Let's Encrypt (`ghcr.io/letsencrypt/pebble:2.10.1`), set to `httpPort 80` and `tlsPort 443`. **DNS** = `pebble-challtestsrv` 2.10.1: A records `iot.example.test` and `mqtt.example.test` → `10.27.40.10` through its API (`/add-a`), and Pebble asks this DNS (`-dnsserver`). `.test` is reserved for testing; never use a real name that belongs to someone else.
3. **The VPS** = a container holding the IP `10.27.40.10`; `web` and `mosquitto` share its network. The project's Caddyfile + one lab-only global block: `cert_issuer acme https://pebble:14000/dir` with `trusted_roots` and `profile default` (90 days). The gateway and the clients use the simulated DNS and Pebble's root.
4. **Unplugging the home internet** = `docker network disconnect` from the gateway container (packets are silently dropped); reconnect with `docker network connect`.
5. **The phone and the friend** = Chrome 156 without a screen, with its own profile: `--host-resolver-rules` (name → the "VPS" IP) and `--ignore-certificate-errors-spki-list` (Pebble's card accepted in that profile only).

Without changing `/etc/hosts`, the firewall, or the system's list of roots. How it differs from the real world: Pebble creates a **new** root every time it starts, its chain isn't X1/X2, and its issuing time (±5–6 seconds) isn't Let's Encrypt's. Cloudflare Tunnel wasn't simulated (`cloudflared` without a token, replaced by a small forwarder); MQTTX was replaced by mqtt.js and `mosquitto_sub`. Not tried: the PWA's `prompt` update or an automatic reload through `virtual:pwa-register` (the dashboard uses `autoUpdate`). Details: [📚](#-sources--image-credits).

</details>

## 🧩 Independent Challenges

> 🖥️ **Tools used:** Level 1: the **Arduino IDE** with Node 1 (then upload `node-1-home` again), or Wokwi. Level 2: a laptop terminal, **Chrome**, **DBeaver**. Level 3: **VS Code** in `mini-smart-home`, an **SSH terminal to the VPS**, **Chrome**.

All of them are optional (no ⭐). Level 3 adds files: do it after the [➕ Add-on](#-add-on-to-mini-smart-home), on a new branch from `main` (`git switch main`, `git pull`, `git switch -c feature/bridge-banner`).

### Level 1 — Module 10's weather without `setInsecure()`: check the server's ID card (a small change, 20 minutes)

> [!NOTE]
> Not compiled or tried by the author yet (neither on a board nor in Wokwi); the function names come from the code of esp32 3.3.12.

The `module10_weather` sketch calls `client.setInsecure()` "temporarily" ([Module 10](../../phase-2-connectivity/module-10-wifi-and-http/README.md#8-https-and-setinsecure-a-sealed-envelope-whose-courier-isnt-checked)): a sealed envelope whose courier's ID card isn't checked. Save it as `module27_secure_weather` (**File → Save As…**), then replace that **one line** so the ESP32 checks the chain and the name the way a browser does ([Concept 6](#6-certificates-in-full-chain-name-and-dates)). A hint: `WiFiClientSecure` can use the built-in root bundle of esp32 3.3.12, or one root that you build in.

**You pass when:** the Serial Monitor stays as in Module 10 (`Status code: 200, …`), and with a WRONG root in `setCACert()` the request fails (`Sending failed: …`).

<details>
<summary><b>Level 1 answer key</b></summary>

```cpp
  WiFiClientSecure client;
  client.useBuiltinCACertBundle();   // before: client.setInsecure();
```

The built-in bundle = ±150 trusted roots in the firmware, ISRG Root X1 and X2 included; the function is new in 3.3.12 (Wokwi at the time of Module 10: 3.3.7). An older version (the compile fails), or only one root: create the tab [`isrg_root_x1.h`](code/challenges/key/level-1/module27_secure_weather/isrg_root_x1.h) through **Copy raw file** (match its SHA-256 fingerprint with Let's Encrypt's page; valid until 4 Jun 2035), `#include "isrg_root_x1.h"`, then `client.setCACert(ISRG_ROOT_X1);`. X1 is enough: both `api.open-meteo.com` servers send chains that end at X1 (checked by the author on 29 Oct 2026). The **dates** still aren't checked (the esp32 default setting; not tested on a board); the address must be a **name**, not an IP.

</details>

### Level 2 — The admin door through an SSH tunnel: Swagger and DBeaver from the laptop (fill in the blanks, 25 minutes)

> [!NOTE]
> The author hasn't run `ssh -L` (a standard OpenSSH feature) at all yet.

The backend's counter 8080, the database's 5432, and Grafana's 3000 on the VPS are `127.0.0.1` only ([Concept 4](#4-a-leaky-firewall-ufw-and-docker)), so Swagger can't be used from the internet ([7.8](#78--the-padlock-at-httpsiotyournamemyid-308-logging-in-and-the-secure-cookie-6-minutes)). An **SSH tunnel** opens a counter on the laptop and forwards its knocks, encrypted, to the VPS's `127.0.0.1`: no new door, ufw stays the same. The laptop's backend must be off (7.6). Fill in the `____`:

```text
ssh -L ____:127.0.0.1:____ house@203.0.113.10
http://localhost:____/docs
ssh -L ____:127.0.0.1:5432 house@203.0.113.10
```

Line 2 is opened in Chrome while line 1 is connected; line 3 is for DBeaver (**Host** `localhost`, **Port** `____`, the read-only account `grafana_reader`). A bonus: all of it in ONE command, without a VPS terminal.

**You pass when:** **Execute** on `POST /auth/login` in Swagger is answered with `200`, and DBeaver opens the `smarthome` database.

<details>
<summary><b>Level 2 answer key</b></summary>

```text
ssh -L 8080:127.0.0.1:8080 house@203.0.113.10
http://localhost:8080/docs
ssh -L 15432:127.0.0.1:5432 house@203.0.113.10
ssh -N -L 8080:127.0.0.1:8080 -L 15432:127.0.0.1:5432 -L 3000:127.0.0.1:3000 house@203.0.113.10
```

`-L 15432:127.0.0.1:5432` = the **laptop's** counter 15432 → the tunnel → a knock on `127.0.0.1:5432` from the VPS's side. `-N` = only the tunnel (stop: **Ctrl + C**).

- **Swagger must be `8080` and `localhost`:** the guard only accepts logins from pages at `CORS_ORIGIN` and `http://localhost:8080`; another counter, according to the code: `403` `… from the page http://localhost:18080 refused`.
- **`15432`**: doesn't clash with the laptop's database (DBeaver doesn't check the page's origin).
- **Grafana** is already at `/grafana/` (7.10); `-L 3000` only if `GRAFANA_URL` is empty.

Safe: only the holder of your SSH key can make it; the laptop's counter is `127.0.0.1` only.

</details>

### Level 3 — A "Home gateway disconnected" banner: the bridge status message all the way to the dashboard (from scratch, 60–90 minutes)

While the home internet is down, the VPS dashboard writes `Online · … · stale data` ([10.3](#103-during-the-outage-a-stale-online-the-lamp-button-and-telegrams-silent-node-12-minutes); the honest gap of [Concept 9](#9-a-store-and-forward-bridge-who-holds-what)). Yet the central broker knows: the bridge status message `$SYS/broker/connection/pi-bridge/state` ([4.3](#43--the-bridge-status-message-state-1-with-the-monitor-account-3-minutes)) becomes `0` once the bridge has been silent past its keepalive (±1.5 minutes). Make a banner under the dashboard's header, `Home gateway disconnected since HH:MM:SS WIB (pi-bridge)`, on every open dashboard:

1. `edge/acl-broker`: the `backend` account may read `$SYS/broker/connection/+/state` (the `#` in `msh/#` doesn't cover topics starting with `$`; without the permission the subscription stays silent, with no error).
2. `src/services/mqtt.ts` subscribes to that topic and hands the `$SYS/…` messages to a new file `bridge.ts`: it only reacts when the state changes, and writes a log line.
3. `realtime.ts`: a Socket.IO event `bridge` to every client; a new dashboard gets the last state at once.
4. A `BridgeBanner.tsx` component in `Layout.tsx` (the event's type: `types.ts`), the one socket, the listener removed in the cleanup (the Module 23 rule).

Test with `npm run check` + `npm test` (`backend`) and `npm run lint` + `npm run build` (`frontend`), commit, push. On the VPS, at the project root: `git fetch`, `git switch feature/bridge-banner`, `docker compose up -d --build backend web`, then `docker compose restart mosquitto` (the new ACL). Unplug the home internet as in 10.2 (not `stop mosquitto`). Done: `git switch main`, repeat those two Compose commands. The main path only (the free path's bridge doesn't go through the internet).

**You pass when:** the banner appears ±1.5 minutes after the outage starts, stays after a reload, and goes away a few seconds after reconnecting.

<details>
<summary><b>Level 3 answer key</b></summary>

[`level-3/`](code/challenges/key/level-3/): two new files (copy them to the same paths) `backend/src/services/bridge.ts` and `frontend/src/components/BridgeBanner.tsx`, plus `changes.diff` (five files, +28/−1, `edge/acl-broker` included). Save the diff at the project root, `git apply changes.diff` (refused because block 2b is open? `git apply -C2 changes.diff`), then delete the diff. "Since" = the time the backend heard the down message; an old retained message has no time. The `bridge` event reaches viewers too (not a secret, like `status`).

**Expected output** (the author's lab; "down" = `docker network disconnect` of a stand-in gateway on the LAN):

```text
backend-1  | [16:46:30] INFO: bridge pi-bridge connected
backend-1  | [16:47:57] WARN: bridge pi-bridge DISCONNECTED: data from home is held at the gateway until it reconnects
backend-1  | [16:50:05] INFO: bridge pi-bridge connected
```

The banner `Home gateway disconnected since 16:47:57 WIB (pi-bridge). …` appeared 42 seconds after the unplug, stayed after a reload, and went away 21 seconds after reconnecting (Chrome without a screen). 118 backend tests pass; the dashboard's lint and `tsc -b` are clean. Not tried by the author yet: a VPS, a phone, and a real home internet.

</details>

## ➕ Add-on to "Mini Smart Home"

This week Mini Smart Home goes **online on the internet, encrypted, and outage-proof**: its center (backend 1.4.0, dashboard 1.3.0 as a PWA, Grafana at `/grafana/`) runs nonstop on the VPS with HTTPS or on the Pi through Cloudflare Tunnel, the Pi's bridge comes in over TLS at 8883 (the main path), and the gateway holds readings while the internet is down. The code is already committed on `feature/to-the-internet`. A matches, B–D tidy up the documents, E merges into `main`, F saves your notes (±30 minutes). Concept 1's picture is now your project's picture too:

![Diagram of two paths to the internet (Concepts 1 and 10), the Mini Smart Home after Module 27; no port forwarding on the router on either path. Left, the home: Node 2 Garden v1.0.0 over ESP-NOW to Node 1 Home v1.6.0 (firmware unchanged), plain MQTT to 192.168.1.37:1883. Raspberry Pi: the gateway mosquitto, counter 1883, edge/compose.edge.yml, store-and-forward: the queue is held on the Pi while the internet is down. Dashed box, free path only: the center on the Pi too, compose.cloud.yml with the .env Pi column (web Caddy :80, backend, db, grafana, central broker 1884 only on 172.17.0.1), the LAN bridge to center:1884 through host-gateway, cloudflared profile tunnel opening an OUTGOING tunnel to Cloudflare. Middle top, the rented VPS, the main path: Ubuntu 26.04, 2 GB, example IP 203.0.113.10; the same compose.cloud.yml, .env VPS column, CENTER_CONF=center-internet.conf; backend 1.4.0 Secure cookie; web Caddy automatic HTTPS, 80 and 443; db history moved, external cupboard; grafana through /grafana/; mosquitto 8883 TLS, 1883 local; mqtt-certificate, copy + weekly cron; open doors 22, 80/443, 8883. From the gateway: the TLS bridge out to 8883, root ISRG X1, commands come down the same way. Middle bottom, Cloudflare, the free path: HTTPS at Cloudflare's edge, then through the tunnel to web:80 on the Pi; iot. = a CNAME to the tunnel, no mqtt.: MQTT does not go through the tunnel; Cloudflare sees the traffic. Right: visitors anywhere (a phone on mobile data, a friend, the PWA) to https://iot.yourname.my.id through 443; the admin laptop, ed25519 SSH key, through 22 (ssh -L for the 127.0.0.1 counters); free-path visitors to the same address. Neither opens the router: the bridge and the tunnel are OUTGOING connections from home. Strip: backend 1.4.0, dashboard 1.3.0, data contract 1.5, firmware unchanged. Bottom, GitHub, branch feature/to-the-internet, pull request Online on the internet: HTTPS, MQTT over TLS, an outage-proof bridge, PWA; changed files: compose.cloud.yml, .env.example, Caddyfile, new center-internet.conf, gateway.conf + 4 lines, bridge.example.conf, acl-broker, the certificate scripts + check-late-arrivals.sql, backend (118 tests), frontend PWA, DATA-CONTRACT, README. Never in Git: .env, TUNNEL_TOKEN, edge/.env, edge/bridge/center.conf, SSH keys, Caddy's cupboard, backup/. Coming later: Module 28 OTA, Module 29 GitHub Actions, Module 30 Uptime Kuma and backups. Honestly: with the internet down the dashboard still says Online (stale data), the server rules stay quiet; tested on a simulated internet, not a real VPS or phone.](assets/two-paths-to-the-internet.png)

> 🖥️ **Tools used:** **VS Code** in the `mini-smart-home` folder, a terminal at the **project root** (F: the `learn-iot` folder); **Chrome** or **Edge**, logged in to GitHub; in E also an **SSH terminal to the VPS** and an **SSH terminal to the Pi**. Your home keeps running.
>
> ⭐ **Required** — step E: the pull request into `main`.

### A. Match your project: the root, `edge/`, `scripts/`, `backend/` 1.4.0, and `frontend/` 1.3.0

Your branch's files must be the same as the files of the same name in [`code/`](code/), except the documents of B–D, `DATA-CONTRACT.md`, and what's really yours (`LABEL` in the `Dockerfile` and the dashboard JSON exported in Module 26, the device_id in block 2 and block 2b of `edge/acl-broker`, `extra_hosts` of 9.6). Check in the Explorer: `compose.cloud.yml` (the `mqtt-certificate` and `cloudflared` services), `.gitattributes`; three new files in `scripts/`; `frontend/caddy/Caddyfile` (`{$WEB_DOMAIN::80} {$MQTT_DOMAIN} {`); `edge/center-internet.conf` and the four new lines of `edge/gateway.conf`; the versions `1.4.0` and `1.3.0` in the backend's and frontend's `package.json`.

First copy your **My devices** table, then replace the content of `DATA-CONTRACT.md` with [version 1.5](code/DATA-CONTRACT.md) (**Copy raw file**) and fill it in again. The message shapes stay the same, so the firmware, the migrations, and the Grafana provisioning don't change. What's new: the broker address on the internet (a domain name, 8883, TLS 1.2 or newer) and the store-and-forward rule (`cmd` isn't held), that is rule **11** in the project = rule **13** of [the Syllabus's Appendix A](../../SYLLABUS.md#14-appendix-a--mini-smart-home-data-contract).

### B. Update the project README, then the READMEs of `backend/`, `frontend/`, `edge/`, `grafana/`, and `tools/`

**The root README.** Open the [reference README](code/README.md), click **Raw**, copy the section `## On the internet (Module 27)` up to just before `## Coming later`, then paste it at the end of your repository's root `README.md`. Replace the `[Module 27](…)` path inside it with this page's address.

**The folder READMEs.** `backend/`, `frontend/`, and `edge/` were already copied in 2.1, 3.4, and 4.1 (`edge/`: fill in its header table again with your Pi's data). Replace the content of `grafana/README.md` and `tools/README.md` with [`code/grafana/README.md`](code/grafana/README.md) and [`code/tools/README.md`](code/tools/README.md) (**Copy raw file**).

**Bruno.** [Module 16](../../phase-3-backend-data/module-16-backend-typescript-api-git/README.md#58-the-local-environment)'s promise is kept: moving to the internet only means changing `baseUrl`. In `backend/bruno/environments/internet.yml` (2.1), replace `iot.yourname.my.id` with your domain. A domain name isn't a secret, so this file is committed too.

### C. Complete the root and `edge/` `.env.example`: without your real domain, IP, or secrets

Both were copied in 2.3 and 4.1; compare them again with [`code/.env.example`](code/.env.example) and [`code/edge/.env.example`](code/edge/.env.example): the new settings without your own values, `# COMPOSE_PROFILES=tunnel` commented out, the example still `yourname.my.id`. Real passwords and tokens only live in the `.env` of each place, with `chmod 600`, outside Git ([7.2](#72-the-vps-env-new-secrets-and-the-vps-column-of-the-values-per-place-table-10-minutes)).

### D. Add the Module 27 items to the pull request template

Replace the content of `.github/pull_request_template.md` with the [reference template](code/.github/pull_request_template.md) (**Copy raw file**): eleven **(Module 27)** items and three old items adjusted, for example:

```markdown
- [ ] **(Module 26)** On the laptop: the database, Grafana, backend, and Uptime Kuma counters are `127.0.0.1` only; the dashboard's `WEB_ADDRESS` is back to `127.0.0.1` after trying phone mode; no port forwarding on the home router (on the VPS: the Module 27 items)
- [ ] **(Module 27)** The home-internet unplug test was run: `scripts/check-late-arrivals.sql` shows `gaps_over_12_seconds 0` and `duplicates 0` in the central database
- [ ] **(Module 27)** Grafana opened at `https://iot…/grafana/` uses a strong admin password, and other people get viewer accounts (not the admin password)
```

### E. ⭐ Merge `feature/to-the-internet` into `main` with the pull request "Online on the internet: HTTPS, MQTT over TLS, an outage-proof bridge, PWA"

In the laptop's project-root terminal, `git status` only lists the files of A–D (`.env`, `backup/`, and `edge/bridge/center.conf` are ignored by `.gitignore`). Then one at a time (plus the files you fixed in A):

```text
git add README.md DATA-CONTRACT.md .env.example edge/.env.example grafana/README.md tools/README.md edge/README.md backend/bruno/environments/internet.yml .github/pull_request_template.md
```

```text
git commit -m "Module 27 docs: READMEs, contract 1.5, and the PR template"
```

```text
git push
```

1. On GitHub: **Compare & pull request** (base `main`), the title `Online on the internet: HTTPS, MQTT over TLS, an outage-proof bridge, PWA`, describe the changes and the T1–T3 proof as honestly as your notes (for example `T1: my own phone over mobile data`), copy the **(Module 27)** items of template D (`main` still has the old template), then **Create pull request**.
2. **Review:** **Files changed** (the author's lab: 48 files) without `.env` (only `.env.example`), `TUNNEL_TOKEN`, `*.key`/`*.pem`, SSH keys, the content of Caddy's cupboard, `edge/bridge/*.conf`, `backup/`, or the output of `docker compose config`; then **Review changes** → **Comment** → **Submit review**. Something forbidden? Don't merge: `git rm -r --cached` + the file's name (a secret: change its value too), commit, push again.
3. **Create a merge commit** → **Merge pull request** → **Confirm merge** → **Delete branch**.
4. The laptop, one at a time: `git switch main`, `git pull`, `git branch -d feature/to-the-internet`. The VPS (project root) and the Pi (the `mini-smart-home` folder; the free path: the Pi only): `git switch main`, then right away `git pull` (before the `pull`, the files are still the Module 26 version). Only documents changed, so no `docker compose up -d` (unless A changed a Compose file); the cron stays. The Pi refuses because of `edge/acl-broker`? As in 4.1: `git stash`, `git switch main`, `git pull`, `git stash pop`.

The buttons are the same as in [Module 16](../../phase-3-backend-data/module-16-backend-typescript-api-git/README.md#86-open-a-pull-request-on-github); the author only tested in a local git repository, not on GitHub.

**You pass this ⭐ step** when that pull request has been reviewed with the **(Module 27)** items and merged, and `main` on each of your machines holds backend `1.4.0`, frontend `1.3.0`, and `edge/center-internet.conf`. Tick ➕ E in the [✅](#-module-27-completion-checklist).

### F. Save your study notes: the T1–T3 proof, the fingerprint, the monthly cost, and `docker stats`

In `learn-iot/module-27/` add `notes.md`, without passwords, tokens, the chat_id, your friend's email, or the content of `.env`; its material is `fingerprint.md` and the proof you kept during the practices:

```markdown
# Module 27 notes — Online, encrypted, outage-proof

| Item | Mine |
| :--- | :--- |
| Path (main / free / without a Pi / without a Kit) | … |
| T1: WIB time, network, city, who, screenshot (12.4) | … |
| T2a (8.3) or T2-free (11.8) | … |
| T2b: two VPS log lines (9.3) | … |
| T3: `gaps_over_12_seconds`, `arrived_late`, `duplicates` (10.5 / 11.9) | … |
| Fingerprint before = after the move (7.5 / 11.4) | same / different |
| Cost: VPS per month, domain per year | IDR … / IDR … |
| `docker stats` at rest (7.11 / 11.9) | … MiB |
| The certificate cron, in WIB (8.6) | … |
| Not tested by me yet | … |
```

Below it, paste the T3 output of `check-late-arrivals.sql` and the VPS's `docker compose ps -a` (the free path: the Pi's) as code blocks. Commit and push.

## 📖 Glossary

| Term | Meaning |
| :--- | :--- |
| **ACME** | The way Caddy asks for and renews certificates by itself, after proving through port 80 or 443 that it controls the name. |
| **The root** (ISRG Root X1, X2) | The trusted organization at the end of the chain, whose name is built into phones, laptops, and the Pi: X1 (RSA) or X2 (ECDSA, which also leads to X1). |
| **The queue** (gateway) | The holding shelf of the gateway broker on the Pi for messages that haven't reached the center yet, written to the cupboard every ±30 seconds. |
| **CA** and **intermediate** | The trusted organization that signs certificates, and its branch office, whose card is signed by the root. |
| **The practice CA** | Let's Encrypt's staging, used by Caddy when it retries so the quota doesn't run out. Not the staging of Module 29. |
| **Cloudflare Tunnel** (the tunnel) | An outgoing connection from `cloudflared` to Cloudflare that carries HTTPS visitors to `http://web:80` without opening a door on the router; MQTT doesn't get through. |
| **A `Secure` cookie** | A cookie the browser only sends over HTTPS. |
| **Cron** | An alarm clock on the VPS that runs a script on a schedule (here: the broker certificate, Monday 03:17 VPS time). |
| **DNS** | The internet's phone book: name → IP number, asked with `nslookup`. |
| **DNS only** and **Proxied** | The gray cloud answers the real VPS IP (every port gets through); the orange cloud answers a Cloudflare address (web ports only), so `mqtt.` must be gray. |
| **Domain**, **registrar**, **nameserver** | The name you rent per year (`yourname.my.id`), the shop where you rent it (PANDI-accredited), and the office that answers questions about that name. |
| **HTTPS** and **TLS** | TLS = a sealed envelope plus an ID card that gets checked; HTTPS = HTTP inside it, shown by the padlock in the address bar. |
| **HUP** (reload) | `kill -HUP 1`: the VPS broker reads its certificate again without stopping; the bridge doesn't break. The Pi's gateway broker is always `restart`ed. |
| **Store-and-forward bridge** | The gateway holds readings in its queue while the path to the center is down, then forwards them with their original `ts`: up is kept on the Pi, down is not. |
| **The blind window** | The span between the internet going down and the gateway noticing (the author's lab: about 1–2 minutes); QoS 0 in that span is lost without `upgrade_outgoing_qos true`. |
| **The bridge status message** | `$SYS/broker/connection/pi-bridge/state` on the central broker: `1` connected, `0` down. |
| **A secure context** | `https://…` or `http://localhost`: only there does a service worker run and an install get offered. |
| **Let's Encrypt** | A free certificate issuer through ACME, valid for 90 days (64 days from 10 Feb 2027, 45 days from 16 Feb 2028); at most 5 certificates with the same names per 7 days. |
| **A Docker counter** (Docker's side door) | A `ports:` counter, not guarded by ufw; its guard is the address in front of it: `127.0.0.1` only that machine, `0.0.0.0` all its networks (on the VPS: the whole IPv4 internet). |
| **Manifest** | The app's business card: name, icon, start address, and the `standalone` display. |
| **`mqtts://`** and **8883** | MQTT inside an envelope, called by name (`mqtts://mqtt.yourname.my.id:8883`). The 1883 postcard only at home and in the VPS's hallway. |
| **The service worker** | A small helper in the browser that keeps the dashboard's **shell** (without numbers) to open while offline. |
| **A regular user** and **`sudo`** | You work on the VPS as `house`, not as root; only commands starting with `sudo` have full rights. |
| **The front door** (reverse proxy) | Caddy: one HTTPS address for the pages, `/api`, and `/grafana/`, the holder of the certificates, the `http://` redirect (`308`). |
| **PWA** | A dashboard you can install like an app: a secure context + a manifest + a service worker. |
| **QoS 0** and **QoS 1** | Regular mail without a receipt (the way Node 1 publishes `telemetry`), and registered mail that's sent again until it's answered. |
| **The chain** | Signatures linked from your certificate through an intermediate up to the root; without a root the client knows, it's refused. |
| **A, AAAA, CNAME records** | Lines in the phone book: name → IPv4; name → IPv6 (don't create one: the `0.0.0.0` counters are IPv4 only); name → another name. |
| **SAN** | The list of valid names in a certificate; call the broker by name, not by IP. |
| **Certificate** (ID card) | Checked for three things: the chain, the name, and the dates. Caddy asks for one for `iot.` and `mqtt.`; `mqtt-certificate` copies it for the broker. |
| **Clean session** and **persistent session** | The broker forgets the subscriptions of a client that drops (Node 1; the bridge at the center's side), or holds QoS 1 messages for it (backend 1.4.0; the bridge at the gateway's side). |
| **`setInsecure()`** | "An envelope without checking the card" in Module 10, "temporary, until Module 27": don't use it anymore. 🧩 Level 1 replaces it with a root check. |
| **SSH**, **SSH key** (ed25519), **host fingerprint** | A remote terminal through door 22; you log in with a pair of files, one kept secret on the laptop and one left with the server; the VPS's key is recorded in `known_hosts`. |
| **Late arrivals** | Readings that arrive later, after the bridge recovers, recorded at the `ts` of when they happened (`arrived_late` in `scripts/check-late-arrivals.sql`). |
| **`TRUST_PROXY`** (trusted proxies) | Backend 1.4.0 trusts `X-Forwarded-For` and `-Proto` only from private addresses (`uniquelocal`), that is Caddy: the visitor's real IP, `429` per visitor, a `Secure` cookie. |
| **TTL** | How many seconds a resolver may remember a DNS answer (`ttl = 300` = five minutes). |
| **ufw** | Ubuntu's firewall on the VPS: 22 first, then 80, 443, and 8883. It doesn't guard Docker's counters. |
| **VPS** | A rented computer that runs 24 hours a day, a second home that never sleeps, with a public IP (`203.0.113.10`). |

## 📝 5-Question Quiz

[The Phase 5 completion criteria](../../SYLLABUS.md#8-evaluation--completion-criteria-for-each-phase) ask for at least 4 correct answers in each quiz of Modules 26–30.

1. The A records `iot` and `mqtt` at Cloudflare point at `203.0.113.10`. (a) What happens to the Pi's bridge if the `mqtt` cloud is orange? (b) The gray cloud makes the VPS's IP visible to anyone. So what guards it?
2. On the VPS you type `sudo ufw deny 1883`, then set `MQTT_ADDRESS=0.0.0.0` so MQTTX can try. (a) Is 1883 closed to the internet? (b) What really closes it, and how does the backend still reach the broker?
3. After the home internet was down for 10 minutes, `check-late-arrivals.sql` writes `arrived_late 58` and `duplicates 0`. (a) Why are the late arrivals recorded at the time they happened, and never duplicated? (b) What makes "no gaps" true only this week?
4. While the home internet is down, you press **Lamp** on your phone; the internet comes back 5 minutes later. (a) What do you see, and what happens to that command? (b) Why is the command deliberately not held, while the readings are?
5. (a) Why can the dashboard be installed from `http://localhost` and `https://iot.yourname.my.id`, but not from `http://192.168.1.10` (phone mode)? (b) The app is opened while the phone is offline. What shows?

<details>
<summary><b>Answer key</b></summary>

1. (a) An orange cloud answers a Cloudflare address, which only forwards web ports; 8883 isn't one of them, so the bridge's MQTT doesn't arrive. The gray cloud answers the real VPS IP ([Concept 5](#5-domains-and-dns-the-internets-phone-book)). (b) The VPS's address is public anyway; its guards are ufw for programs on the VPS and the `127.0.0.1` counter address for containers.
2. (a) No. Docker diverts the packets to the container's counter before ufw reads them, so the 1883 postcard, device accounts and passwords included, is open to the whole IPv4 internet. (b) Put back `MQTT_ADDRESS=127.0.0.1` (the default): the counter is only for the VPS itself, proven by T2a (8.3). The backend calls `mqtt://mosquitto:1883` through the hallway, not through the counter ([Concept 4](#4-a-leaky-firewall-ufw-and-docker)).
3. (a) The `ts` the device made is held too and forwarded as it is. The primary key `(device_id, ts)` with `ON CONFLICT DO NOTHING` skips repeated sends (`duplicate skipped`), so `duplicates` is always 0. (b) The blind window: the Syllabus settings as they are lose the QoS 0 messages published before the gateway notices. `upgrade_outgoing_qos true` forwards them as QoS 1, which is sent again until it's answered (the author's lab: 90 published, 90 stored) ([Concept 9](#9-a-store-and-forward-bridge-who-holds-what)).
4. (a) The toast `Lamp: not confirmed by the device yet; …`; after reconnecting, the backend log `… not carried out for more than 2 minutes: not sent again`, and the lamp doesn't change. (b) A lamp or a pump that moves minutes later, after the dashboard has already reported a failure, is dangerous (the `cleansession false` comparison in the author's lab: 3–4 minutes later). `cleansession true`: the center doesn't keep `cmd`; `local_cleansession false`: the gateway still holds the upward queue ([Concept 9](#9-a-store-and-forward-bridge-who-holds-what)).
5. (a) A service worker and installing only exist in a secure context, `https://` or `localhost`: through an `http://` postcard, the page's content can be changed on the way, while a service worker answers every request and stays in the browser. (b) The **Login** page with the offline message, not the browser's error page. The old numbers aren't there: the shell doesn't hold them, and `/api` and `/socket.io` always go to the network ([Concept 11](#11-pwa-from-a-shortcut-to-an-app)).

</details>

---

## ✅ Module 27 Completion Checklist

The pass requirement from the [Syllabus](../../SYLLABUS.md#module-27--to-the-internet-vps-domain-https-mqtt-over-tls-pi--vps-bridge--a-phone-app-pwa): "a friend in another city opens your dashboard over HTTPS and sees the numbers change; MQTTX **without** TLS is rejected on the VPS's port 8883 and the Mosquitto log shows a TLS connection from the bridge; the 10 minutes of data from while the home internet was down show up late, with no duplicates." Its parts are **T1, T2a, T2b, T3**. **Without a Pi:** as on the main path, T3 = the laptop's Wi-Fi turned off (not tested by the author). **Without a Kit** and **Wokwi:** T1–T3 with the simulator and the mock Garden. **Without a domain:** you can't pass yet.

> [!NOTE]
> **The author hasn't tested a VPS, a domain, Let's Encrypt production, Cloudflare, a phone, a mobile network, a friend, a router, MQTTX, or an ESP32 with TLS**: the Expected output boxes come from a simulated internet ([📚](#-sources--image-credits)). Tick only what has really happened for you; for the rest, write "not yet" in your notes (➕ F) and your pull request.

- [ ] **T1** Your friend opens `https://iot.yourname.my.id` from their own network: the padlock, **Live**, Node 1's numbers changing; the account has been deleted (12.4). The recorded stand-in: your phone over mobile data. **T1-free:** through the Tunnel (11.8, 12.4).
- [ ] **T2a** Without TLS to 8883 refused (MQTTX, or `echo $?` → `255`), the VPS log `wrong version number`; 1883 unreachable from outside (8.3). **T2-free:** MQTTX from outside the home fails at 1883 and 8883 (11.8).
- [ ] **T2b** The VPS log holds `as pi-bridge (p4, c1, k60, u'pi-bridge').` and `negotiated TLSv1.3` (9.3). The free path: none.
- [ ] **T3** The home internet unplugged for 10 minutes, the home Wi-Fi still on; `check-late-arrivals.sql` on the VPS: `gaps_over_12_seconds 0`, `(0 rows)`, ±6 readings per minute, `duplicates 0` (10.5). **T3-free:** the Pi's history whole (11.9) and the LAN drill (4.4).
- [ ] The warm-up matches the "Self-test answer key" (🔁); `Your connection is not private` and its card understood, `down` leaving nothing behind (Quick Win).
- [ ] ⭐ The `feature/to-the-internet` branch, the fingerprint recorded, the archive in `backup/`; Kit B: `MQTT_ADDRESS=0.0.0.0` (Practice 1).
- [ ] ⭐ 118 tests pass; backend 1.4.0 with `trusted proxies (TRUST_PROXY): uniquelocal` and the persistent session `c0` (Practice 2).
- [ ] ⭐ `PWA v2.0.0`, the web 1.3.0 image; **Manifest** without errors, the service worker `activated`, installed from `http://localhost` (Practice 3).
- [ ] ⭐ `state 1`; a 10-minute outage on the LAN with no gaps and no duplicates; a lamp pressed during the outage stays **Off** (Practice 4).
- [ ] ⭐ The main path: `sshd -T` three times `no`, a second window logs in with the key; ufw active; Docker without `sudo` (Practice 5).
- [ ] ⭐ The main path: the A records `iot` and `mqtt` with a gray cloud, no AAAA, and `nslookup` answers the VPS's IP; the free path: Cloudflare's nameservers active (Practice 6).
- [ ] ⭐ The main path: the VPS fingerprint = the laptop's; the laptop's backend stopped; two certificates; `308`, the padlock, cookies **Secure**; `429` per visitor (Practice 7).
- [ ] ⭐ The main path: `broker.key` owned by `1883`, door 8883 open; the renewal script writes `broker reloaded` (Practice 8).
- [ ] ⭐ The main path: Node 1 **Live** on the VPS dashboard, **Lamp** answered with an `ack` (Practice 9).
- [ ] ⭐ The free path: the same Pi fingerprint, the laptop's backend stopped; the LAN bridge into the Pi center; `cloudflared` `Up` (Practice 11).
- [ ] ⭐ The dashboard installed on the phone (12.1 or 12.2); **Live** over mobile data (Practice 12).
- [ ] The simulator over `mqtts://` shows **Online** (Practice 13, optional).
- [ ] Security: the VPS only opens 22, 80, 443, and 8883, the certificate cron in `crontab -l` (the main path); `.env` on every machine `chmod 600`, not in Git; a strong Grafana admin password, other people use Viewer accounts.
- [ ] Project matches `code/`; README, contract 1.5, `.env.example`, and the pull request template updated; notes in `learn-iot/module-27/` (➕ A–D, F).
- [ ] ⭐ The pull request "Online on the internet: HTTPS, MQTT over TLS, an outage-proof bridge, PWA" merged into `main`, without `.env`, `TUNNEL_TOKEN`, key files, or the content of Caddy's cupboard; every machine has done `git pull` (➕ E).

**Mini Smart Home is now online on the internet, encrypted, and outage-proof.** The dashboard opens over HTTPS from anywhere, also as an app on the phone, the device keys no longer travel in the clear over the internet, and the readings from while the home internet was down arrive late with no gaps and no duplicates. Its limits: Node 1's firmware is still uploaded through a cable, and Node 1 is still on the breadboard.

> ➡️ **Next module:** Module 28 — OTA Updates, Provisioning, Fleets, & From Breadboard to Enclosure (coming soon; [read the summary in the Syllabus](../../SYLLABUS.md#module-28--ota-updates-provisioning-fleets--from-breadboard-to-enclosure)). Node 1 is updated without a cable (OTA over HTTP from the server) and goes back to the old version by itself if that fails (rollback), its version shows on the `/fleet` page, and its circuit moves into a project box.

## 📚 Sources & Image Credits

**Official sources** (read in October 2026, last on 29 Oct; for the latest releases):

- **Caddy 2.11**: [automatic HTTPS](https://caddyserver.com/docs/automatic-https), [`reverse_proxy`](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy), [global options](https://caddyserver.com/docs/caddyfile/options) (`trusted_proxies`), [the data cupboard](https://caddyserver.com/docs/conventions). **Mosquitto 2.1**: [`mosquitto.conf(5)`](https://mosquitto.org/man/mosquitto-conf-5.html), [`mosquitto-tls(7)`](https://mosquitto.org/man/mosquitto-tls-7.html) (Module 21's promise), [`mosquitto_sub(1)`](https://mosquitto.org/man/mosquitto_sub-1.html) (`--no-tls`), [ChangeLog](https://github.com/eclipse-mosquitto/mosquitto/blob/master/ChangeLog.txt) (2.0.0: dropping rights before reading certificates).
- **Let's Encrypt**: [64 days from 10 Feb 2027](https://letsencrypt.org/2026/10/07/64-day-certs), [45 days from 16 Feb 2028](https://letsencrypt.org/2025/12/02/from-90-to-45), [chains and roots](https://letsencrypt.org/certificates/), [rate limits](https://letsencrypt.org/docs/rate-limits/), [the end of expiration emails](https://letsencrypt.org/2025/06/26/expiration-notification-service-has-ended); `my.id` in the [Public Suffix List](https://publicsuffix.org/list/public_suffix_list.dat).
- **VPS**: Docker [Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/), [firewalls](https://docs.docker.com/engine/network/packet-filtering-firewalls/) (Docker and ufw "incompatible"), [the `docker` group](https://docs.docker.com/engine/install/linux-postinstall/); Ubuntu [OpenSSH](https://ubuntu.com/server/docs/how-to/security/openssh-server/), [ufw](https://ubuntu.com/server/docs/how-to/security/firewalls/), [automatic updates](https://ubuntu.com/server/docs/how-to/software/automatic-updates/).
- **Domain and Cloudflare**: [PANDI's Registration Policy v9.0](https://pandi.id/public/files/2024/10/kebijakan-pendaftaran-nama-domain-versi-9-0-bilingual-new-1729151599.pdf) (30 Sep 2024; it may have been updated); Cloudflare [proxy status](https://developers.cloudflare.com/dns/proxy-status/), [proxied ports](https://developers.cloudflare.com/fundamentals/reference/network-ports/) (no 8883), [Tunnel](https://developers.cloudflare.com/tunnel/), [creating a Tunnel](https://developers.cloudflare.com/tunnel/get-started/) (**Published application**).
- **Backend and PWA**: Fastify [`trustProxy`](https://fastify.dev/docs/latest/Reference/Server/), [`@fastify/cookie`](https://github.com/fastify/fastify-cookie) (`secure: "auto"`), [vite-plugin-pwa 2.0.0](https://github.com/vite-pwa/vite-plugin-pwa/releases/tag/v2.0.0), web.dev [install criteria](https://web.dev/articles/install-criteria), MDN [secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts), Apple [iPhone User Guide](https://support.apple.com/en-us/guide/iphone/iphea86e5236/ios) ("Turn a website into an app in Safari on iPhone"). **🔬 and 🧩 only**: Arduino-ESP32 3.3.12 [`WiFiClientSecure`](https://github.com/espressif/arduino-esp32/blob/master/libraries/NetworkClientSecure/README.md). The pass requirement from [the Syllabus §7, Module 27](../../SYLLABUS.md#module-27--to-the-internet-vps-domain-https-mqtt-over-tls-pi--vps-bridge--a-phone-app-pwa) (v1.0.29).

**Images.** Details per file: [`assets/SOURCES.md`](assets/SOURCES.md).

| File | Source | License / notes |
| :--- | :--- | :--- |
| 8 diagrams (`two-paths-to-the-internet` … `pwa-from-a-shortcut`) | Original diagrams from `code/` and the author's simulated lab; the Let's Encrypt chain from its documentation and `openssl s_client` to `api.open-meteo.com`. Numbers = the simulated lab; IPs = **examples**; ufw, SSH, the registrar, Cloudflare, and the phone from the documentation, **not tested**. | CC BY 4.0 (`.svg` in `assets/`) |
| 6 composites (`envelope-without-id-card` … `dashboard-from-outside`) | Real screenshots of Chrome 156 without a screen on the recording machine, a stand-in CA (1280 px wide; 375 px = Chrome's device mode, **not a phone**); the address bar, the padlock, and the install dialog weren't captured. Lab test accounts; no password or token visible. | Chromium (BSD), Caddy (Apache-2.0), Grafana OSS (AGPLv3), React and Recharts (MIT) shown as they are for educational purposes; titles, numbers, captions CC BY 4.0 |

**About the Expected output boxes.** "The author's lab" here is the English lab of 30 October 2026, ±13:50–18:50 WIB, on the English `code/` exactly, on a **Raspberry Pi 5 16 GB with Ubuntu 26.04.1 LTS (arm64)**: Docker Engine 29.1.3 and Compose 2.40.3 (the Ubuntu packages, not Docker's repository of 5.7), Node.js 24.21.0, and Chrome 156 without a screen. Story numbers (the T3 window and its counts, the 10.3–10.4 times, the fingerprints, the RAM at rest) keep the values of the Indonesian edition's final lab on the same machine (29 October 2026 ±22:05 WIB to 30 October ±01:30 WIB) in the English lab's wording; a few come from the code lab a few hours before it (e.g. the clean-session backend, the expired broker certificate), and numbers marked "research prototype" from that afternoon's research lab with candidate code. 🔁 steps 3–4 were recorded on the real internet (29 Oct ±18:45 WIB; asked again on 30 Oct ±13:57 WIB: the same DNS answers and chains).

That machine played the laptop, the Pi, the VPS, the phone, the friend, and "the internet" (the table at the start of the module, the recipe in [🔬](#-technical-deep-dive-optional)): a Docker hallway `10.27.40.0/24`, Pebble 2.10.1 (a new root every time it starts), pebble-challtestsrv as the DNS, `docker network disconnect` as the WAN cable. Clients "from the internet" = throwaway containers in that hallway trusting Pebble's root; the simulated Pi bridge uses Pebble's root at the file path of ISRG Root X1; the "VPS" Caddyfile = the project's Caddyfile + 5 global lines pointing at Pebble. Chrome without a screen accepts Pebble's cards only in the lab profile and can't install a PWA (the only proof is the empty install-error list). Node 1 = the simulator `f00d00000001` (named "Practice living room" in the lab), Node 2 = the mock Garden `f00d000000b2`; your `device_id`s differ.

| Lab recording | Written in the text |
| :--- | :--- |
| `iot.example.test`, `mqtt.example.test` | `iot.yourname.my.id`, `mqtt.yourname.my.id` |
| the "VPS" IP `10.27.40.10`; the home `10.27.40.20`; visitors `10.27.40.1xx` | `203.0.113.10`; `198.51.100.20`; `198.51.100.<n>` (documentation address blocks) |
| the issuer folder `pebble-14000-dir` | `acme-v02.api.letsencrypt.org-directory` |
| the lab's project, container, cupboard, and image names | `smarthome…`, `smarthome-gateway…`, `quick-win`, `ghcr.io/<account>` |
| machine paths; LAN IPs; the "Pi" gateway | `/home/you/…` (laptop), `/home/house/…` (VPS); `192.168.1.10`; `192.168.1.37` |

Replaced only on otherwise identical lines; the stand-in root names and serial numbers aren't shown. The counters in the text = yours: the lab recorded on other counters (8080 on the author's machine is used by another program), then wrote yours, such as 8080. Kit B: the laptop's broker recorded on `172.17.0.1` (in place of `0.0.0.0`). On the lab "VPS", Caddy and Mosquitto use the "VPS" IP without `ports:`, so 1883 can be reached too (a lab artifact); the proof in 8.3 that 1883 is closed comes from the code lab, with the `ports:` lines as they are.

Times are written in WIB: the machine clock (WITA, WIB + 1 hour) in the terminal is rewritten; the backend log is already WIB (`TZ` in Compose), the Caddy and Grafana logs UTC (+7 hours), and Mosquitto prints seconds. Seconds, sizes, and sensor numbers = **examples**. The 10-minute unplug test had several rounds on the same code: the 10.5 box (90 readings, 10 minutes 37 seconds) and the Concept 9 diagram keep the Indonesian edition's rounds; the two composites come from one English-lab round (84 readings, 10 minutes 24 seconds).

Telegram = a **mock** Bot API server (a fake token; a lab-only alias `api.telegram.org` that **doesn't exist** in your project); the message boxes = the texts that mock received. GitHub = a local git repository (the Module 26 project from the published repository): `git clone`/`git push` are written `https://github.com/<account>/mini-smart-home.git`; the pull request of ➕ E wasn't recorded. `scp` was replaced by `cp` (the laptop and the "VPS" are one machine); MQTTX by mqtt.js 5.16.1 and `mosquitto_sub`.

**Not** tested: a real VPS (SSH, `sshd -T`, ufw, swap, Docker from the apt repository, an amd64 build on 2 GB), a `.my.id` domain (PANDI, nameservers), Cloudflare (the zone, DNS only, the Tunnel and its token), Let's Encrypt production, Android phones and iPhones, a mobile network, a friend in another city, a router (pulling the WAN, a shared NAT), MQTTX, an ESP32 with TLS (the code of 🔬 and 🧩 Level 1 not compiled), an SSH tunnel (🧩 Level 2), Windows, macOS, Docker Desktop, PowerShell, Raspberry Pi OS, a 2 GB Pi, and the path without a Pi.

**Not yet proven** at publication: the label of MQTTX's TLS switch and Chrome for Android's install menu; a `.my.id` zone on Cloudflare's free plan; the Generation Y chain on the bridge and the ESP32; the issuing time and rate limits of real Let's Encrypt, and an account without an email (what was recorded: Caddy creates one at the stand-in CA); the headers a real `cloudflared` sends; the bridge queue under a heavy load; the gateway queue during the move 7.5 → 9.2 on a real network (the simulated lab: 51 of 51 arrived). There was no real-world smoke test yet when this text was finished (30 Oct 2026).

---

[⬅️ Module 26](../module-26-docker-compose/README.md) · [Phase 5](../README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · **Next: Module 28 — OTA Updates, Provisioning, Fleets, & From Breadboard to Enclosure** (coming soon; [read the summary in the Syllabus](../../SYLLABUS.md#module-28--ota-updates-provisioning-fleets--from-breadboard-to-enclosure))
