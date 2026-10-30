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
