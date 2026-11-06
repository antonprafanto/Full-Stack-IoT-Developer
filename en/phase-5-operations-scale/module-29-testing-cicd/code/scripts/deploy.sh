#!/bin/sh
# deploy.sh - Module 29: deploy the latest Mini Smart Home RELEASE on this machine. One script for the VPS and the Pi:
#   VPS: called by the robot (the job deploy-vps in .github/workflows/ci.yml) over SSH with a special key. That key's line in
#        ~/.ssh/authorized_keys of the user house makes it ONLY able to run this script, whatever command is sent:
#          restrict,command="sh /home/house/mini-smart-home/scripts/deploy.sh" ssh-ed25519 AAAA... robot-deploy
#   Pi : called by the systemd alarm clock every 15 minutes (scripts/systemd/smarthome-update.timer). GitHub can't knock on
#        a Pi behind the home router, so the Pi asks by itself.
#   By hand, from the project root (once, when switching from "building the images yourself" to "pulling the robot's images"):
#        sh scripts/deploy.sh
# Always called through "sh" by the owner of the repo copy (a member of the docker group), NOT with sudo. The file in the
# repo isn't marked executable, and don't chmod +x it on the VPS/Pi (Git sees that as an edit, and then this script stops).
#
# RELEASE = a Git tag v<version> (for example v2.0.1) on the main branch on GitHub. The robot makes it AFTER that version's
# images are in GHCR and passed staging; a tag that isn't on main (for example made by hand on another branch) is ignored. So
# this machine only deploys commits the robot has tested, and never waits for images that don't exist yet.
# The order: the latest release tag -> move main forward to that tag (--ff-only) -> pull the images -> restart what changed
# (--no-build: this machine never builds an image) -> restart the broker when its configuration changed -> smoke test.
# A failure at any step = stop with a FAIL message and exit code 1. A failure before "up" (for example the images can't be
# pulled yet): the old containers keep running, but the repo copy is already on the new release, so files read straight from
# the repo (for example the Grafana dashboards) may have changed already. The Pi tries again in the next round (15 minutes
# later); the VPS tries again when the robot comes again (the next release, or Re-run failed jobs on the job deploy-vps), or
# with sh scripts/deploy.sh on the VPS. This script NEVER runs down -v, prune, or git reset --hard.
#
# What gets deployed is chosen by DEPLOY_PARTS (filled in by the systemd unit file; default: center):
#   center          compose.cloud.yml in the project root: the VPS (main path), also the laptop
#   gateway         edge/compose.edge.yml: the main-path Pi (the Pi = the gateway only; the official Mosquitto image + edge/ configuration)
#   center gateway  both: the free-path Pi (the Pi = the center + the gateway)
set -eu

clock() { date '+%Y-%m-%d %H:%M:%S %Z'; }
notice() { echo "$(clock) $*"; }
fail() { echo "$(clock) FAIL: $*" >&2; exit 1; }

# Did one of these paths change since the release deployed before? (without a record of the old release: treated as no)
has_changed() {
  [ -n "$old_commit" ] && [ -n "$(git diff --name-only "$old_commit" HEAD -- "$@")" ]
}

# Restart ONCE per release: a round that tries again after a failed smoke test doesn't restart the same service again (a
# restarted broker = every device disconnected for a moment). Its record (.git/smarthome-deployed.restart) is deleted as soon
# as that release is deployed.
restart_once() { # restart_once <part> <service>
  if grep -qxF "$tag $1 $2" "$record.restart" 2> /dev/null; then
    notice "$2 already restarted for $tag: skipped"
    return 0
  fi
  docker compose restart "$2" || fail "restart $2 failed: docker compose logs $2"
  echo "$tag $1 $2" >> "$record.restart"
}

deploy_center() {
  notice "center: pull images $tag (compose.cloud.yml)"
  docker compose pull --quiet || fail "the images for $tag can't be pulled yet (the reason is in the Docker message above). GHCR \
package still private? IMAGE_REGISTRY in .env mistyped or in capitals? A new required setting not in .env yet? The old \
containers keep running."
  docker compose up -d --no-build --wait --wait-timeout 300 || fail "the center failed to start or isn't healthy yet (at \
most 5 minutes): docker compose ps -a, then docker compose logs <service>"
  # Files a container reads straight from the repo (bind mount): "up" doesn't see their content change, so the services that
  # read them are restarted here. backend and web don't need it: their image tags go up with every release, so they're always
  # recreated.
  # (The central broker only uses one of center.conf and center-internet.conf, CENTER_CONF in .env; a change in the file that
  # isn't used restarts it too: one unneeded disconnect, not dangerous.)
  if has_changed edge/acl-broker edge/center.conf edge/center-internet.conf; then
    notice "central broker configuration changed: restart mosquitto"
    restart_once center mosquitto
  fi
  if has_changed grafana/provisioning; then
    notice "Grafana provisioning changed: restart grafana"
    restart_once center grafana
  fi
  sh scripts/smoke-test.sh "${tag#v}"
  docker compose ps --format 'table {{.Service}}\t{{.Image}}\t{{.Status}}'
}

deploy_gateway() {
  # The gateway has no image of our own: what gets updated is the official image with an exact tag in edge/compose.edge.yml and
  # the broker configuration from the repo. edge/bridge/center.conf (the bridge password) isn't in Git: its changes stay manual.
  restart=no
  if has_changed edge/gateway.conf edge/acl-broker; then restart=yes; fi
  notice "gateway: pull images $tag (edge/compose.edge.yml)"
  (
    cd edge
    docker compose pull --quiet || fail "the gateway image can't be pulled yet (the reason is in the Docker message above): \
internet? A new required setting not in edge/.env yet? The old containers keep running."
    docker compose up -d --no-build --wait --wait-timeout 120 \
      || fail "the gateway failed to start: docker compose ps -a and docker compose logs mosquitto (folder edge)"
    if [ "$restart" = yes ]; then
      # restart, NOT kill -HUP: on the gateway, a HUP throws away the store-and-forward queue not yet sent to the center (Module 27)
      notice "gateway broker configuration changed: restart mosquitto"
      restart_once gateway mosquitto
    fi
    # up --wait can't wait for Mosquitto (no healthcheck): give it 15 seconds, then look for one that keeps crashing. A broker
    # that only crashes after running for ±10 seconds can slip through (it shows "running"); a monitor that keeps watching = Module 30.
    sleep 15
    [ -z "$(docker compose ps --status restarting --format '{{.Service}}')" ] \
      || fail "the gateway broker keeps crashing (Restarting): docker compose logs mosquitto (folder edge)"
    echo "PASS  gateway: no service keeps crashing (15 seconds after starting)"
    docker compose ps --format 'table {{.Service}}\t{{.Image}}\t{{.Status}}'
  )
}

deploy() {
  # Not root: git running as root leaves files owned by root in .git, and then the next round (timer, robot) fails to write
  # its record and deploys again every time.
  [ "$(id -u)" != 0 ] || fail "don't run this with sudo or as root: run it as the owner of the repo copy \
(a member of the docker group). Docker refuses without sudo? Log out and in again so the docker group applies."
  # the project root (the folder above scripts/): compose.cloud.yml, .env, and the edge/ folder
  cd "$(dirname "$0")/.."
  # "center gateway", "center,gateway", and double spaces count as the same
  parts=$(echo $(echo "${DEPLOY_PARTS:-center}" | tr ',' ' '))
  [ -n "$parts" ] || fail "DEPLOY_PARTS is empty; known: center, gateway, or \"center gateway\""
  for p in $parts; do
    case "$p" in
      center|gateway) ;;
      *) fail "DEPLOY_PARTS contains \"$p\"; known: center, gateway, or \"center gateway\"" ;;
    esac
  done
  # The record of the last release this script deployed SUCCESSFULLY, in the .git folder (never committed). A full path,
  # because the gateway part works from the edge/ folder.
  record="$(git rev-parse --absolute-git-dir)/smarthome-deployed"

  # 1) The repo copy on this machine: on the main branch and without edits. Changes always go through a pull request, not on the VPS/Pi.
  branch=$(git symbolic-ref --quiet --short HEAD || echo "(not a branch)")
  [ "$branch" = main ] || fail "the repo copy on this machine is on $branch, not main: git switch main"
  dirty=$(git status --porcelain --untracked-files=no)
  [ -z "$dirty" ] || fail "files were edited directly on this machine (see: git diff):
$dirty
Change them through a pull request. Restore the files here with: git restore <file>"

  # 2) The latest release tag on main on GitHub (a public repo: git fetch without an account; --tags also updates origin/main).
  #    --merged origin/main = only tags on main; --sort=-v:refname = sorted by version number, the biggest first
  git fetch --tags origin || fail "can't fetch tags from GitHub: read the git message above (internet? the origin \
address: git remote -v; a release tag moved on GitHub: would clobber existing tag; .git files owned by root: Permission denied)"
  tag=$(git tag --list 'v[0-9]*' --merged origin/main --sort=-v:refname | head -n 1)
  if [ -z "$tag" ]; then
    notice "no release (tag v<version>) on GitHub yet: nothing deployed"
    return 0
  fi
  deployed=$(cat "$record" 2> /dev/null || true)
  if [ "$deployed" = "$tag $parts" ]; then
    notice "$tag already deployed ($parts): no new release"
    return 0
  fi
  old=${deployed%% *}
  notice "deploying $tag ($parts); previously: ${old:-never through this script}"

  # 3) Move main forward to that release. --ff-only = only straight forward: a main with a commit made on this machine makes the
  #    script stop, and a main already ahead of the tag (after a manual git pull) isn't moved back. ^{commit} = the tag's commit.
  before=$(git rev-parse HEAD)
  git merge --ff-only --quiet "$tag^{commit}" || fail "main on this machine can't fast-forward to $tag: read the git message \
above (a commit made here? an untracked file with the same name as a new file of that release? git log --oneline -3)"
  # A main AHEAD of the tag is fine, as long as its version is the same (the robot guarantees: what gets deployed changed = the
  # version goes up). Another version = this copy holds an unreleased version (a manual git pull): wait for its tag, never deploy it.
  repo_version=$(sed -n 's/^  "version": "\([^"]*\)".*/\1/p' backend/package.json | head -n 1)
  [ "$repo_version" = "${tag#v}" ] || fail "the repo copy on this machine holds version $repo_version, but the latest release is $tag \
(a manual git pull?). Nothing deployed; the next round deploys it as soon as the robot makes the tag v$repo_version."
  # Does this release bring a new deploy.sh? The shell has already read its old content, so the script runs again ONCE with its
  # new content (the release record isn't written yet, so the repeated round deploys the same release from the start).
  if [ -z "${DEPLOY_RERUN:-}" ] && ! git diff --quiet "$before" HEAD -- scripts/deploy.sh; then
    notice "scripts/deploy.sh changed in $tag too: run again with its new content"
    DEPLOY_RERUN=1
    export DEPLOY_RERUN
    exec sh scripts/deploy.sh
  fi
  old_commit=""
  if [ -n "$old" ]; then old_commit=$(git rev-parse --quiet --verify "$old^{commit}" || true); fi

  # 4) Deploy the parts; one failure = stop (the release record isn't updated, the next round tries again)
  for p in $parts; do
    if [ "$p" = center ]; then deploy_center; else deploy_gateway; fi
  done
  printf '%s\n' "$tag $parts" > "$record"
  rm -f "$record.restart"
  notice "${old:-never} -> $tag deployed ($parts)"
}

# The functions above are read whole first, then run: git merge may replace this very script file halfway.
deploy "$@"; exit $?
