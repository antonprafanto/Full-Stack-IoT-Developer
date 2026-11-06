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
