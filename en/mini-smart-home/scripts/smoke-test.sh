#!/bin/sh
# smoke-test.sh - Module 29: a "smoke test" after deploying. Is the home (the center, compose.cloud.yml) really running with
# this version? Used by scripts/deploy.sh (the VPS, the free-path Pi) and by the robot's job staging (.github/workflows/ci.yml).
# By hand, from the project root (where compose.cloud.yml and .env are):
#   sh scripts/smoke-test.sh          the expected version = "version" in backend/package.json
#   sh scripts/smoke-test.sh 2.0.1    the expected version written by you
# What is checked, all through Docker Compose on this machine:
#   1. after 15 seconds no service keeps crashing (Restarting). "up --wait" can only wait for services that have a
#      health check (healthcheck); a Mosquitto or Caddy that crashes again and again counts as fine to it. The limit: a service
#      that only crashes after running for ±10 seconds can slip through (Docker starts it again at once, so when checked it
#      shows "running"); a monitor that keeps watching = Module 30.
#   2. the backend and web run with images tagged with that version
#   3. the backend's GET /health: "version" = that version and "database": true (/health still always answers 200; monitors = Module 30)
#   4. the dashboard through Caddy: the main page, and /api/health (Caddy forwards /api to the new backend)
# Exit code 0 = everything PASSES; 1 = something FAILED, the message says which. This script only READS: it starts,
# stops, or changes nothing.
set -eu

# move to the project root (the folder above scripts/)
cd "$(dirname "$0")/.."
version="${1:-$(sed -n 's/^  "version": "\([^"]*\)".*/\1/p' backend/package.json | head -n 1)}"
fail() { echo "FAIL  $*" >&2; exit 1; }
[ -n "$version" ] || fail "the expected version is unknown: sh scripts/smoke-test.sh <version>"

# 1) Give the services just recreated time to crash if they're going to crash, then look for one that keeps crashing
sleep 15
crashing=$(docker compose ps --status restarting --format '{{.Service}}') \
  || fail "docker compose ps failed (is Docker running? run from the right project folder?)"
[ -z "$crashing" ] || fail "services keep crashing (Restarting): $(echo "$crashing" | tr '\n' ' ')-> docker compose logs <service>"
echo "PASS  no service keeps crashing (15 seconds after starting)"

# 2) The images that are running
for service in backend web; do
  image=$(docker compose ps --format '{{.Image}}' "$service") || fail "docker compose ps $service failed"
  case "$image" in
    */mini-smart-home-"$service":"$version") echo "PASS  $service runs $image" ;;
    "") fail "$service isn't running (docker compose ps -a)" ;;
    *) fail "$service runs $image, not version $version" ;;
  esac
done

# 3) /health asked from INSIDE the backend container (the node image carries no curl; the same way as its healthcheck)
health=$(docker compose exec -T backend node -e \
  "fetch('http://127.0.0.1:8080/health').then((j) => j.text()).then((t) => console.log(t))") \
  || fail "the backend doesn't answer /health (docker compose logs backend)"
case "$health" in
  *"\"version\":\"$version\""*) ;;
  *) fail "the backend /health doesn't name version $version: $health" ;;
esac
case "$health" in
  *'"database":true'*) ;;
  *) fail "the backend isn't connected to the database: $health" ;;
esac
echo "PASS  backend /health: $health"
case "$health" in
  *'"broker":true'*) ;;
  # not a FAIL: right after starting, the backend may still be connecting; a dead broker was already caught by step 1
  *) echo "WARNING  the backend isn't connected to the broker yet (\"broker\":false): check again shortly, docker compose logs backend" ;;
esac

# 4) The dashboard through Caddy. WEB_DOMAIN is read from the web container (Compose fills in ":80" when it's empty in .env).
domain=$(docker compose exec -T web printenv WEB_DOMAIN) || fail "the web service isn't running (docker compose ps -a)"
case "$domain" in
  :*|"")
    # without a domain (laptop, staging, free-path Pi): Caddy serves the dashboard on door 80 INSIDE its container. On the
    # free-path Pi that door isn't opened to the home WiFi (the device door 8081 is), so it's asked from inside.
    page=$(docker compose exec -T web wget -q -O - http://127.0.0.1:80/) || fail "Caddy doesn't serve the dashboard"
    api=$(docker compose exec -T web wget -q -O - http://127.0.0.1:80/api/health) || fail "Caddy doesn't forward /api"
    address="http://127.0.0.1:80 (inside the web container)"
    ;;
  *)
    # with a domain (VPS): real HTTPS with a Let's Encrypt certificate, but the domain name is pointed at this machine
    # itself (--resolve), without asking DNS or going out to the internet
    command -v curl > /dev/null || fail "curl isn't on this machine: sudo apt install curl"
    port=$(docker compose port web 443 | sed 's/.*://')
    [ -n "$port" ] || fail "HTTPS door 443 of the web service isn't open on this machine (PORT_HTTPS in .env?)"
    page=$(curl -fsS --max-time 20 --resolve "$domain:$port:127.0.0.1" "https://$domain:$port/") \
      || fail "https://$domain/ doesn't answer from this machine (docker compose logs web)"
    api=$(curl -fsS --max-time 20 --resolve "$domain:$port:127.0.0.1" "https://$domain:$port/api/health") \
      || fail "https://$domain/api/health doesn't answer (docker compose logs web)"
    address="https://$domain"
    ;;
esac
case "$page" in
  *'<div id="root">'*) ;;
  *) fail "the main page at $address isn't the Mini Smart Home dashboard" ;;
esac
case "$api" in
  *"\"version\":\"$version\""*) ;;
  *) fail "$address/api/health doesn't name version $version: $api" ;;
esac
echo "PASS  dashboard and /api/health through Caddy ($address)"
echo "PASS  smoke test of version $version"
