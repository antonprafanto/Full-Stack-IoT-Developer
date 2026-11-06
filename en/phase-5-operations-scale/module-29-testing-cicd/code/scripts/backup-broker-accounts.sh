#!/bin/sh
# backup-broker-accounts.sh - Module 28: copies the broker accounts from the Docker cupboard to the backup/ folder (not in Git):
#   - dynamic-security.json = the DEVICE accounts made by the backend (claim codes, key rotation) + the plugin's admin account
#   - broker-passwd         = the service accounts (backend, pi-bridge, monitor, ...) and the old Module 21 device accounts
#   - firmware-data/        = the firmware files the admin uploaded (only at the CENTER, where the backend service runs)
# The broker cupboard and the firmware cupboard belong to Compose: "docker compose down -v" deletes them. Without this backup, every
# device needs a new key and every firmware file has to be uploaded again. It completes the Module 26 database backup recipe (pg_dump).
#
# Run it from the project ROOT for the central broker (laptop, VPS, free-path Pi):  sh scripts/backup-broker-accounts.sh
#        from the edge folder on the Pi for the gateway broker:                   sh ../scripts/backup-broker-accounts.sh
# The result: backup/broker-accounts-<date-time>/ in the folder where the command was typed, readable only by its owner. Its content
# is SECRET (password fingerprints, and a Node 1 .bin file may contain the ESP-NOW key): don't send it to a forum, an issue, or an AI.
#
# Restoring into a new cupboard (the broker never started with Module 28, or its cupboard is gone), from the same folder:
#   docker compose cp backup/broker-accounts-<date-time>/dynamic-security.json mosquitto:/mosquitto/data/
#   docker compose cp backup/broker-accounts-<date-time>/broker-passwd mosquitto:/mosquitto/data/
#   docker compose restart mosquitto        (when it starts, the image hands both files over to the mosquitto user)
#   center only: docker compose cp -a backup/broker-accounts-<date-time>/firmware-data/. backend:/app/firmware-data/
#                (-a: the files become owned by the container's user, node)
set -eu

dest="backup/broker-accounts-$(date +%Y-%m-%d-%H%M)"
mkdir -p "$dest"
chmod 700 "$dest"

# docker compose cp copies from the container of a running service (its cupboard is read with it)
for file in dynamic-security.json broker-passwd; do
  if docker compose cp "mosquitto:/mosquitto/data/$file" "$dest/$file" 2>/dev/null; then
    echo "copied: $file"
  else
    echo "missing: $file (the broker has never used this file, or the mosquitto service isn't running)"
  fi
done

# Firmware files only exist at the center. On the gateway (the edge folder) there is no backend service: skipped.
if docker compose ps --services --status running 2>/dev/null | grep -qx backend; then
  docker compose cp backend:/app/firmware-data "$dest/firmware-data"
  echo "copied: firmware-data ($(find "$dest/firmware-data" -name '*.bin' | wc -l) .bin files)"
fi

chmod -R go-rwx "$dest"
echo "done: $dest"
