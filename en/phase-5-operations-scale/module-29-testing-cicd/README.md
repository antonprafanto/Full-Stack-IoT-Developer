# Module 29 — Testing & CI/CD: Every Change Tested and Deployed Automatically

🌐 **English** · [Bahasa Indonesia](../../../fase-5-operasi-skala/modul-29-testing-cicd/README.md)

*Phase 5 · Week 29 · Hardware: **the server from Modules 27–28** (VPS and gateway Pi; the free path: the Pi only; without a Pi: the VPS, the laptop as the gateway), no new hardware · Account: GitHub with the `mini-smart-home` repo **public** · Prerequisites: **Module 28** (backend 1.5.0, frontend 1.4.0, and `compose.cloud.yml` on `main`), Module 27 (VPS, SSH, Tunnel), Module 16 (team Git), Module 19 (unit tests), Module 12 (systemd) · Time: ±10 hours spread over one week, plus waiting for the Pi's alarm clock (at most ±17 minutes; the free path ±9 hours) · Cost: free for a public repo (GitHub Actions, GHCR, branch protection); the server and the domain stay from Module 27*

[⬅️ Module 28](../module-28-ota-provisioning-fleet/README.md) · [Phase 5](../README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · [Module 30 ➡️ (coming soon — read the summary in the Syllabus)](../../SYLLABUS.md#module-30--monitoring-backup-runbooks-know-first-never-lose-data)

---

[Module 28 closed](../module-28-ota-provisioning-fleet/README.md#-module-28-completion-checklist) with a home that can be updated without a cable, and one honest limit: the server images are still deployed over SSH, without automatic tests. The [first page of the Syllabus](../../SYLLABUS.md#after-completing-the-32-modules-you-will-be-able-to) promises a system that stays alive, including "code changes are tested and deployed automatically (*CI/CD*)". Module 29 pays that off with a **robot**: GitHub Actions, which tests every pull request and deploys every release to the VPS. The scope in one sentence: this week every code change is tested by the robot, packaged into images for two kinds of processor, then deployed by itself to the VPS and the Pi; being told first when something breaks, automatic backups, and runbooks (recovery guides) follow in Module 30.

Many old promises are paid off this week. The technical deep dive of [Module 16](../../phase-3-backend-data/module-16-backend-typescript-api-git/README.md#-technical-deep-dive-optional) postponed an automatic check on every pull request to this module: exit code `1` from a failing test will make that check refuse the PR. The first ten unit tests from [Module 19's Concept 6](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#6-unit-tests-checking-the-rules-brain-without-a-device) are now 203, but not one of them touches a real database. [Module 25](../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md#9-a-location-is-device-data-an-api-not-something-stuck-on-the-screen) postponed the full discussion of SemVer to Module 29, and [Module 28](../module-28-ota-provisioning-fleet/README.md#5-versions-and-semver-firmware_version-fw-and-the-release-list-manifest) postponed it together with a `CHANGELOG` and version tags. [Module 26](../module-26-docker-compose/README.md#11-the-image-shop-ghcr-and-architecture) pushed images to GHCR by hand and promised one image for two processors, made automatically; automatic updates of the gateway Pi were also "waiting for Module 29" ([6.4 of Module 26](../module-26-docker-compose/README.md#64--pi-match-the-acl-copy-the-old-password-file-into-the-gateways-cupboard-then-turn-off-the-apt-broker-10-minutes)). A note on terms: in this module, staging means a dress rehearsal of a new version, not the Let's Encrypt practice CA of [Module 27's Concept 6](../module-27-deploy-internet-tls-pwa/README.md#6-certificates-in-full-chain-name-and-dates).

| What happens now | The cause | This week's cure |
| :--- | :--- | :--- |
| One small change = ±10 manual steps on three machines, including SSH to the VPS (`git pull`, `docker compose build`, `up -d`) and to the Pi (`git pull`, a broker restart). | After the merge, everything is done by hand (Module 27 ➕ E and 7.4). | **The robot deploys to the VPS, the Pi updates itself** ([Concept 7](#7-push-vs-pull-the-robot-knocks-on-the-vps-the-pi-asks-by-itself)–8, [Practice 9](#practice-9--the-first-release-200-a-tag-by-the-robot-a-one-script-deployer-and-public-packages-35-minutes)–12) |
| Tests only run when you remember, on your laptop with its own contents. | GitHub only stores the code; nothing checks it yet. | **A checking robot on every pull request** ([Concept 3](#3-ci-a-robot-that-reads-exit-codes)–4, [Practice 4](#practice-4--a-checking-robot-on-every-pull-request-40-minutes)) |
| 203 green tests, but not one runs an SQL query. | The tests that need a database use mocks (`vi.mock`), which don't run SQL. | **20 integration tests with a throw-away test database** ([Concept 1](#1-the-testing-pyramid-ingredients--recipe--kitchen--customer)–2, [Practice 3](#practice-3--a-test-database-and-20-integration-tests-60-minutes)) |
| The VPS ([Module 27](../module-27-deploy-internet-tls-pwa/README.md#2-vps-a-rented-computer-that-runs-24-hours-a-day)) and the free-path Pi build their own images; the 2 GB VPS even got swap for the build. | An image you build is only for the processor of the machine that built it: the VPS amd64, the Pi arm64. | **One image for two processors**, built by the robot and pushed to GHCR ([Concept 5](#5-one-image-for-two-processors-built-by-the-robot-without-emulation)–6, [Practice 7](#practice-7--one-image-two-processors-pushed-to-ghcr-by-the-robot-35-minutes)) |
| GitHub can't knock on the Pi. | The Pi is behind the home router, without port forwarding ([Module 27's Concept 1](../module-27-deploy-internet-tls-pwa/README.md#1-from-home-to-the-internet-three-doors-two-paths)). | **The Pi asks by itself every 15 minutes** with a systemd alarm clock ([Concept 7](#7-push-vs-pull-the-robot-knocks-on-the-vps-the-pi-asks-by-itself)–8, [Practice 11](#practice-11--the-pi-updates-itself-a-systemd-alarm-clock-40-minutes)) |
| Version numbers are written by hand in ≥ 4 places (backend 1.5.0, web 1.4.0), without a checker, a `CHANGELOG`, or tags. | Only the firmware's version is checked so far (Module 28). | **One number 2.0.0**, the version guard, `CHANGELOG.md`, and a `v2.0.0` tag made by the robot ([Concept 10](#10-semver-changelog-and-tags-one-number-then-forward-to-go-back), [Practice 6](#practice-6--one-version-number-200-the-version-guard-changelogmd-and-the-version-on-screen-30-minutes), 9) |
| One merge with red tests can break `main`. | The merge button doesn't care about the color of the tests. | **Branch protection**, a barrier in front of `main` ([Concept 11](#11-branch-protection-a-barrier-in-front-of-main), [Practice 5](#practice-5--branch-protection-a-red-pr-cant-be-merged-20-minutes)) |

The pass requirement from the [Syllabus](../../SYLLABUS.md#module-29--testing--cicd-every-change-tested-and-deployed-automatically): "a small pull request that gets merged shows up in production (VPS and Pi) without you SSHing in, and a PR whose tests fail can't be merged." This module splits it into one prerequisite and three proofs:

- **L0** (a prerequisite, not part of ✅): the `mini-smart-home` repo is public, and the robot checks every pull request until it's green with all 223 tests really run, including the 20 integration tests with a test database (the job `test`: `Tests  223 passed (223)`, no skipped test).
- **L1** a red PR can't be merged: the `main` branch rule requires a pull request and green robot checks, without exceptions, also for you as the repo owner. The PR `try/red`, with one test wrong on purpose, can't be merged, and a direct `git push` to `main` is refused.
- **L2** a small PR shows up in production without you SSHing in: after PR C (a clearer **Login** screen text, version 2.0.1) is merged, the robot tests it, builds the images, rehearses them in a throw-away staging, tags `v2.0.1`, then deploys it on the VPS. `https://iot.yourname.my.id` shows the new text and `v2.0.1` (reload twice), `/api/health` says `"version":"2.0.1"`, and no SSH terminal of yours is open during all that.
- **L3** the Pi updates itself: the systemd alarm clock on the Pi finds the release `v2.0.1` and deploys it, usually at most ±17 minutes after the tag is made, plus the time to pull the images; its journal records `v2.0.0 -> v2.0.1 deployed (gateway)`. On the main path, the gateway Pi deploys that release's `edge/` configuration with the official Mosquitto image, and the broker is restarted only when one of them changed. What's assessed is the deployment: reading the journal over SSH afterwards is fine.

**"Without you SSHing in" ≠ "without SSH"**: the robot still logs in to the VPS over SSH, with a key that can only run one script. The Syllabus (v1.0.31) records this split and the wording of each path in its ✅ line, and reads "20 green tests" in its practice list as 20 API integration tests with a test database (the 203 old unit tests stay green); the ✅ sentence itself stays.

For Mini Smart Home, the server now has **one version number**: backend 1.5.0 and dashboard 1.4.0 both go up to **2.0.0**, MAJOR because the way it's deployed changed (the VPS and the Pi deploy releases made by the robot), not its API. The first Git tag, `v2.0.0`, is made by the robot; a small PR becomes **2.0.1**, and its revert **2.0.2**. No new migration (still `011`) and no new production package; the only new developer packages are oxlint 1.89.0 (backend) and Vitest 5.0.5 (dashboard), the versions the neighboring folder already uses. The robot uses the official actions `actions/checkout@v7`, `actions/cache@v6`, `docker/setup-buildx-action@v4`, `docker/login-action@v4`, and `docker/build-push-action@v7` (Quick Win: `actions/setup-node@v7`) on the runner `ubuntu-24.04`. The third-party images are the same as in Module 28, and TimescaleDB `2.30.2-pg17` also becomes the test database. The firmware of Node 1 and Node 2, `DATA-CONTRACT.md` 1.6, and `PIN-MAP.md` version 7 don't change. This is "v2.0 — a production pipeline" in the Syllabus. CI/CD and this module's quiz count toward the [Phase 5 completion criteria](../../SYLLABUS.md#8-evaluation--completion-criteria-for-each-phase).

> [!IMPORTANT]
> **The required order:** the backup (Practice 1) → **PR A** (Practices 2–4) → branch protection (Practice 5) → **PR B** (Practices 6–9; `build` joins the branch rule in 7.6) → one-time manual steps: public GHCR packages (9.7), the VPS switches to pulling ([10.1](#101--the-last-time-you-ssh-in-to-deploy-sh-scriptsdeploysh-pulls-200-10-minutes)) **before** the robot key and `VPS_HOST` (10.6), then the Pi's alarm clock (Practice 11) → **PR C** (Practice 12) → **PR D** (Practice 13). Why: a required check must have run before, the robot pushes images and makes tags only from `main`, and without `scripts/deploy.sh` on the VPS, the robot fails (`cannot open …/scripts/deploy.sh`).

**Choose your path:**

| Path | What you have | Production on | Who deploys | Proof | Practices | Time |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| **Main** | a public repo, a VPS, a gateway Pi | the VPS, `https://iot.yourname.my.id`; the gateway on the Pi | the robot over SSH (VPS), the alarm clock (Pi) | L0–L3 | 1–13 | ±10 hours |
| **Free** | a public repo, a Pi (center + gateway), Cloudflare Tunnel, a domain | the Pi, through the Tunnel | the Pi's alarm clock (`deploy-vps` skipped: `VPS_HOST` empty) | L0, L1, L2-free (shown through the Tunnel), L3 | without 10 | ±9 hours |
| **Without a Pi** | a public repo, a VPS, the laptop as the gateway | the VPS | the robot over SSH | L0–L2: a pass of the path without a Pi (L3 doesn't apply) | without 11 | ±9.5 hours |
| **Laptop only** | a public repo | none | — | L0, L1, two-processor images on GHCR: **not a full pass yet** | 1–9 | — |
| **A private repo** (free account) | as your path | as your path | the same, + a GHCR read token and a repo read key (a deploy key) | L2, L3 (the robot's runs count against the minutes quota); not L1 (on a free account, branch protection is only for public repos): **not a full pass yet** until the repo is public or on a paid plan | without 5 | — |
| **Without a GitHub account** | a laptop | none | — | **not a full pass yet** (L1–L3 need GitHub) | 2, 3, 6.1–6.5, [6.7](#67--the-version-guard-on-the-laptop-pass-fail-on-purpose-then-commit-5-minutes); the author's way of simulating the robot in [🔬](#-technical-deep-dive-optional) (its Indonesian final lab used `--privileged` containers, root-like; the English edition's lab used none) | — |
| **Without a Kit / Wokwi** | no ESP32 | as your path | as your path | no special wording (Module 29 doesn't touch the ESP32) | as your path | the same |

> [!NOTE]
> **How to use this module.**
>
> - **Marks.** ⭐ = required to pass; the required practices per path are in the introduction of [🔧](#-step-by-step-practice). The 🔀 boxes (**The free path:**, **Without a Pi:**, **A private repo:**) explain what's different on the other paths.
> - **The proof table:**
>
>   | Requirement | Practice | What you see |
>   | :-: | :-- | :-- |
>   | L0 | [4.4](#44--l0-red-once-on-purpose-then-all-green-8-minutes) | PR A's **Checks** tab green; the job `test` prints `Tests  223 passed (223)` |
>   | L1 | [5.3](#53--l1-the-pr-tryred-is-red-the-merge-button-is-locked-6-minutes) (and 5.2) | the PR `try/red` ✗, the merge button locked without an option to bypass the rule; a direct `git push` to `main` refused |
>   | L2 | [12.4](#124--l2-the-robot-deploys-to-the-vps-the-login-screen-says-v201-8-minutes) | the **Login** screen of `https://iot.yourname.my.id` with the new text and `v2.0.1` (reload twice); `/api/health` `"version":"2.0.1"`; no SSH terminal |
>   | L3 | [12.5](#125--l3-the-pi-deploys-201-by-itself-read-from-its-journal-6-minutes) | the Pi's journal `v2.0.0 -> v2.0.1 deployed (gateway)`; the free path: `(center gateway)` and the dashboard from the Pi at `v2.0.1` |
>
> - **The 🖥️ box** at the start of a practice names the machine, the tools, and the folder: **VS Code** (a terminal at the root of the `mini-smart-home` project, `backend`, or `frontend`), **Docker Desktop** or Docker Engine for the test database, **GitHub** in the browser, an SSH terminal to the VPS (`ssh house@203.0.113.10`) and to the Pi (`ssh budi@gateway.local`), **Chrome**, and a **phone**. Docker Desktop, Windows, macOS, and PowerShell weren't tested by the author.
> - **The Expected output boxes** were recorded on a **Raspberry Pi 5 with Ubuntu 26.04 (arm64)**. That one machine played the laptop, GitHub, GHCR, the VPS, and the Pi; the box label names where an output comes from, for example **Expected output (the author's lab, simulated robot):**. GitHub's screens are always marked where they appear: from GitHub's documentation, not recorded by the author.
>
>   | Your real world | The author's lab stand-in |
>   | :-- | :-- |
>   | GitHub and the runner `ubuntu-24.04` (amd64) | a simulated runner (arm64) that runs every `run:` step of `ci.yml` unchanged, except the two `deploy-vps` steps (for those, only the job's `if:` is evaluated, and the command forced by the robot key is run directly on the "VPS"); `uses:` simulated (the Indonesian edition: a local forge, Gitea 28.2.0 + Gitea Runner 5.2.4, ran `ci.yml` as is) |
>   | GHCR | a local image shop without a password |
>   | VPS `203.0.113.10`, the gateway Pi, the free-path Pi | Compose projects on the same Docker (arm64, HTTP local, no domain); the robot key tested with real OpenSSH in throw-away containers (the Indonesian edition: Docker-in-Docker containers, the robot logging in to the "VPS" over real SSH) |
>   | the systemd alarm clock | the unit's command run by hand (the Indonesian edition: a simulated scheduler every ±1 minute + `systemd-analyze verify`) |
>   | a phone; Node 1 | headless Chrome 375 px wide; the Module 28 simulator |
>
>   The time numbers in the Expected output boxes are numbers of a simulated robot on one Raspberry Pi 5 with local images, not GitHub's; times are written in WIB. Lab names and addresses are replaced by your examples (`<account>`, `iot.yourname.my.id`). Details: [🔬](#-technical-deep-dive-optional), [📚](#-sources--image-credits).

> [!IMPORTANT]
> **Honest status: the author has no GitHub account, VPS, second Pi, or domain, so no GitHub screen was recorded.** GitHub's screen texts are quoted from its official documentation (read 31 October–5 November 2026); its screen pictures are labeled reconstructions. The author ran `ci.yml`'s steps unchanged with a **simulated robot**: for the English edition on 6 November 2026, every `run:` step except the two `deploy-vps` steps (for those, only the job's `if:` was evaluated, and the command forced by the robot key was run directly on the "VPS"; the SSH part was tested separately with real OpenSSH in throw-away containers), with `uses:` simulated; for the Indonesian edition on 4 November 2026 also the `uses:` steps, on a local forge. Everything they deployed ran with real Docker.
>
> | Part | Tested by the author (real code) | Simulated locally (on the author's Raspberry Pi 5) | Only from documents / not yet |
> | :-- | :-- | :-- | :-- |
> | Tests | 203 unit tests + 20 integration tests with a real test TimescaleDB, the `_test` guard, a deliberate SQL mistake caught; 5 dashboard Vitest tests; oxlint in two folders | — | — |
> | The robot (`ci.yml`) | every `run:` step of every job, in green and red runs (`deploy-vps`: its `if:` and its forced command); `uses:` simulated (the Indonesian edition's lab: every job including the official actions (`uses:`), in dozens of green and red runs) | the simulated runner (the Indonesian edition's lab: a forge whose screens aren't GitHub's) | GitHub's screens; `GITHUB_TOKEN`, `permissions`, `concurrency`, an x64 runner, and GitHub's times |
> | Two-processor images | amd64 + arm64 without emulation; the amd64 content checked (x86-64 programs); arm64 run | a local image shop | real GHCR (a private → public package, Actions permissions); an amd64 image run |
> | Staging, release tags | `staging` green on every release, red on a deliberately mistyped broker: no tag, the "VPS" and "Pi" untouched; an annotated tag made by the robot (the Indonesian edition's lab: red exactly on two deliberately broken releases, also a forgotten new required setting) | a local bare repo as GitHub (the Indonesian edition's lab: the forge's robot token) | a tag made by `GITHUB_TOKEN`; the ±1.14 GB pull on a GitHub runner |
> | VPS | `deploy.sh` run directly on a Compose project, 1.5.0 → 2.0.2 (the Indonesian edition's lab: 2.0.0 → 2.0.4, the broker restarted only when its configuration changed); the key's `restrict,command=` proven over real SSH into throw-away Alpine containers: the right key green, red on a missing `command=`, a wrong host fingerprint, and an unknown key | Compose projects, HTTP local (the Indonesian edition's lab: a container with sshd) | an amd64 VPS with a public IP and ufw; HTTPS with a domain and the smoke test with a domain |
> | Pi | `deploy.sh` in `gateway` and `center gateway` mode (the free path), 2.0.0 → 2.0.2, the gateway broker not restarted (`edge/` unchanged) (the Indonesian edition's lab: after a broker restart dynamic security stayed, the bridge and the simulated Node 1 reconnected; the unit + timer passed `systemd-analyze verify`) | Compose projects; the alarm clock = the unit's `ExecStart` run by hand (the Indonesian edition's lab: containers, a simulated scheduler) | the systemd alarm clock running (`list-timers`, `journalctl`, after a reboot) |
> | Branch protection | — | — (the Indonesian edition's lab: a forge refused a direct push and a red PR merge, also for an admin) | GitHub's branch protection and its screens (Concept 11's picture = a reconstruction) |
> | Dashboard | the version on the **Login** screen and in the header; the PWA shows it after the second reload (Chrome 156, HTTP local) | — | a real phone, HTTPS with a domain |
> | Optional | `node:test` (one test) | — | Wokwi CI, Playwright, native ARM64 runners, QEMU |
>
> You are its first tester on GitHub: tick [✅](#-module-29-completion-checklist) only what really happened in your repo.

> [!WARNING]
> **This week's safety rules.**
>
> 1. **Public repo = public robot log.** Never print a secret (`echo`, `set -x`); secrets only go in **Secrets** ([10.6](#106--secrets-and-variables-on-github-vps_ssh_key-vps_host-and-vps_known_hosts-8-minutes)).
> 2. **The robot key ≠ your own key.** The second key, only for the robot, always starts with `restrict,command=`, its line is written by hand (not with `ssh-copy-id`), then tested with `whoami` ([10.2](#102--the-robot-key-on-the-laptop-sshrobot_house-without-a-passphrase-5-minutes)–10.4).
> 3. **Integration tests only against a throw-away `…_test` database**, never against the home database ([3.8](#38-the-guard-refuses-a-database-named-smarthome-4-minutes)).
> 4. **A public GHCR package can't be made private again.** Make sure it only holds public repo files and libraries (no `.env`, no keys) ([9.7](#97--the-ghcr-packages-become-public-pull-without-logging-in-two-processors-4-minutes)).
> 5. **Don't edit files on the VPS or the Pi**, including `chmod +x` and a manual `git pull` after the switch: change them through a pull request. The script stops when the repo copy there has been edited ([10.8](#108-from-now-on-the-vps-only-changes-through-a-pull-request-3-minutes)).
> 6. **Neither the scripts nor you ever run `docker compose down -v`, `prune`, or `git reset --hard`** on the VPS or the Pi, and never `sudo sh scripts/deploy.sh` ([9.3](#93--a-one-script-deployer-scriptsdeploysh-and-two-unit-files-7-minutes)).
> 7. **"Without you SSHing in" ≠ "without SSH".** The robot still logs in to the VPS over SSH; that's why its key is restricted ([Concept 7](#7-push-vs-pull-the-robot-knocks-on-the-vps-the-pi-asks-by-itself)).

As in Modules 16–28, this module starts with the [🔁 Warm-up](#-warm-up-versions-manual-steps-and-one-exit-code-30-minutes). On the first day, the warm-up, the [🏆 Quick Win](#-quick-win-the-first-robot-a-green-check-then-a-red-cross-15-minutes), [Concept 1](#1-the-testing-pyramid-ingredients--recipe--kitchen--customer) to [Concept 4](#4-lint--test--build-fail-fast), then [Practice 1](#practice-1--the-workbench-a-branch-a-public-repo-and-a-backup-10-minutes) and [Practice 2](#practice-2--backend-lint-and-frontend-tests-oxlint-and-vitest-25-minutes) are enough; your VPS and Pi only change in [Practice 10](#practice-10--the-vps-switches-to-pulling-a-robot-key-that-can-only-run-one-script-45-minutes) and [Practice 11](#practice-11--the-pi-updates-itself-a-systemd-alarm-clock-40-minutes). The reading order of the eleven concepts is at the start of [🧠](#-the-why-concepts); the folded parts in [🚨](#-troubleshooting) are opened when needed, and [🔬](#-technical-deep-dive-optional) can be skipped.

## Table of contents

1. [🎯 After this module you can…](#-after-this-module-you-can)
2. [🧰 What you need](#-what-you-need)
3. [🔁 Warm-up: versions, manual steps, and one exit code (30 minutes)](#-warm-up-versions-manual-steps-and-one-exit-code-30-minutes)
4. [🏆 Quick Win: the first robot, a green check, then a red cross (15 minutes)](#-quick-win-the-first-robot-a-green-check-then-a-red-cross-15-minutes)
5. [🧠 The "Why" Concepts](#-the-why-concepts)
   - [1 The testing pyramid](#1-the-testing-pyramid-ingredients--recipe--kitchen--customer) · [2 A test database](#2-what-a-mock-cant-see-integration-tests-with-a-test-database) · [3 CI: a robot that reads exit codes](#3-ci-a-robot-that-reads-exit-codes) · [4 Fail fast](#4-lint--test--build-fail-fast) · [5 One image, two processors](#5-one-image-for-two-processors-built-by-the-robot-without-emulation) · [6 The image shop and the robot's permissions](#6-the-image-shop-and-the-robots-permissions-github_token-permissions-secrets-and-variables) · [7 Push vs pull](#7-push-vs-pull-the-robot-knocks-on-the-vps-the-pi-asks-by-itself) · [8 The systemd alarm clock](#8-a-systemd-timer-an-alarm-clock-for-the-module-12-security-guard) · [9 Staging vs production](#9-staging-vs-production-the-dress-rehearsal-vs-the-show) · [10 SemVer, `CHANGELOG`, and tags](#10-semver-changelog-and-tags-one-number-then-forward-to-go-back) · [11 Branch protection](#11-branch-protection-a-barrier-in-front-of-main)
6. [🔧 Step-by-step practice](#-step-by-step-practice)
   - [1 The workbench](#practice-1--the-workbench-a-branch-a-public-repo-and-a-backup-10-minutes) · [2 Lint and Vitest](#practice-2--backend-lint-and-frontend-tests-oxlint-and-vitest-25-minutes) · [3 A test database and 20 integration tests](#practice-3--a-test-database-and-20-integration-tests-60-minutes) · [4 The checking robot](#practice-4--a-checking-robot-on-every-pull-request-40-minutes) · [5 Branch protection](#practice-5--branch-protection-a-red-pr-cant-be-merged-20-minutes) · [6 One version number 2.0.0](#practice-6--one-version-number-200-the-version-guard-changelogmd-and-the-version-on-screen-30-minutes) · [7 Images for two processors](#practice-7--one-image-two-processors-pushed-to-ghcr-by-the-robot-35-minutes) · [8 Staging](#practice-8--throw-away-staging-on-the-robots-machine-25-minutes) · [9 The first release 2.0.0](#practice-9--the-first-release-200-a-tag-by-the-robot-a-one-script-deployer-and-public-packages-35-minutes) · [10 The VPS pulls](#practice-10--the-vps-switches-to-pulling-a-robot-key-that-can-only-run-one-script-45-minutes) · [11 The Pi updates itself](#practice-11--the-pi-updates-itself-a-systemd-alarm-clock-40-minutes) · [12 A small PR 2.0.1](#practice-12--a-small-pr-201-reaches-production-without-you-sshing-in-30-minutes) · [13 A revert becomes 2.0.2](#practice-13--back-to-the-previous-version-a-revert-becomes-202-20-minutes)
   - The free path: without Practice 10 · Without a Pi: without Practice 11 · A private repo: Practice 5 isn't available on a free account
7. [🚨 Troubleshooting](#-troubleshooting)
8. [🔬 Technical Deep Dive (optional)](#-technical-deep-dive-optional)
9. [🧩 Independent Challenges](#-independent-challenges)
10. [➕ Add-on to "Mini Smart Home"](#-add-on-to-mini-smart-home)
11. [📖 Glossary](#-glossary) · [📝 Quiz](#-5-question-quiz) · [✅ Completion checklist](#-module-29-completion-checklist)

## 🎯 After this module you can…

1. **Write API integration tests with a throw-away TimescaleDB test database**, and know which mistakes only they catch: a wrong SQL query that slips past 203 mock tests.
2. **Let the GitHub Actions robot check every pull request**: type check, lint, 223 tests, and build, by reading the exit code (`0` = a green check, anything else a red cross).
3. **Set up branch protection that refuses red PRs**, also for you as the repo owner.
4. **Build one image for two kinds of processor without emulation** (VPS amd64, Pi arm64), then push it to GHCR with the robot's temporary token.
5. **Rehearse every release in a throw-away staging**: the robot's machine, fake data, thrown away afterwards. A release that's red there never reaches the VPS and the Pi.
6. **Give the project one SemVer version number** (2.0.0), `CHANGELOG.md`, and release tags made by the robot.
7. **Let the robot deploy to the VPS over SSH** with a key that can only run one script.
8. **Make the Pi update itself** with a systemd alarm clock: the Pi asks every 15 minutes and deploys the new tagged release.
9. **Go back to the previous version with a revert**, going forward to go back (2.0.2 holds the content of 2.0.0), and name its limits honestly: the database doesn't go back, and old images pile up until Module 30.

In short, the workflow of a real engineering team: every change tested automatically, packaged into images, then deployed to the VPS and the Pi without you SSHing in.

## 🧰 What you need

No new hardware or app, and for a public repo everything is free (GitHub Actions, GHCR, branch protection). The path columns are the same as in the **Choose your path** table.

| What you need | Main | Free | Without a Pi | Notes |
| :--- | :-: | :-: | :-: | :--- |
| **The Module 28 result** on `main` | ✓ | ✓ | ✓ | Backend 1.5.0 (203 unit tests), frontend 1.4.0, `compose.cloud.yml`, and `edge/` with dynamic security, all running; checked in [🔁 Step 1](#step-1--your-module-28-homes-inventory-version-numbers-203-tests-and-self-built-images). |
| **A GitHub account**, the `mini-smart-home` repo | ✓ | ✓ | ✓ | Since Module 3; public or private is decided in [1.2](#12--is-the-mini-smart-home-repo-public-or-private-check-in-settings--general-then-decide-3-minutes). |
| **The Module 27 VPS** | ✓ | — | ✓ | The user `house` in the `docker` group, an ed25519 SSH key, password login and root turned off, ufw 22/80/443/8883. The 2 GB swap is no longer used for builds: the VPS pulls images. |
| **Pi** | gateway | center + gateway | — | The user `budi` (Module 12) in the `docker` group (Module 26). Without a Pi, the laptop stays the gateway. |
| **Docker on the laptop** | ✓ | ✓ | ✓ | Docker Desktop (since Module 17) or Docker Engine on Linux, for the test database ([3.1](#31--a-throw-away-test-database-smarthome-db-test-at-counter-5433-6-minutes)). |

Use the versions written here so your results match; the Syllabus (v1.0.31) records the tools and their versions in Module 29.

| Tool | Version (as of 4 November 2026) |
| :--- | :--- |
| Vitest (new in the dashboard), oxlint (new in the backend) | 5.0.5 and 1.89.0, the same as the neighboring folder (5.1.0 and 1.91.0 deliberately not used yet) |
| GitHub Actions | the runner `ubuntu-24.04` (not `ubuntu-latest`, which is announced to move to Ubuntu 26.04 in November 2026); `actions/checkout@v7`, `actions/cache@v6`; Quick Win: `actions/setup-node@v7` |
| `docker buildx`, GHCR | `docker/setup-buildx-action@v4`, `docker/login-action@v4`, `docker/build-push-action@v7` |
| Node.js 24, images | `node:24.22.1-alpine3.24` (the robot), `timescale/timescaledb:2.30.2-pg17` (the test database): the same as Module 28 |
| SSH, systemd timer | built in; a second ed25519 key only for the robot, the alarm clock on the Pi |

Do examples on the internet still say `actions/checkout@v4` or `ubuntu-latest`? See the first fold in [🚨](#-troubleshooting).

**Files that change this week** (compare them in [➕ F](#f-match-your-project-new-and-changed-files-three-diffs-and-the-module-29-items-of-the-pull-request-template)):

| Place | Files |
| :--- | :--- |
| Project root | new: `.github/workflows/ci.yml`, `CHANGELOG.md`; changed: `compose.cloud.yml` (three `image:` lines), `.env.example`, `.gitattributes`, the pull request template, README |
| `scripts/` | new: `deploy.sh`, `smoke-test.sh`, `check-version.mjs`, `systemd/smarthome-update.service` and `.timer` |
| `backend/` 2.0.0 | new: `.oxlintrc.json`, `src/app.ts`, `src/config/server-version.ts`, `src/integration/` (`setup.ts` + 6 files, 20 integration tests); changed: `src/server.ts`, `src/routes/health.ts`, `src/services/version.test.ts`, `package.json` and the lock, `Dockerfile`, `.dockerignore`, README |
| `frontend/` 2.0.0 | new in `src/`: `time.test.ts`, `csv.test.ts`, `rules.test.ts`, `version.d.ts`; changed: `vite.config.ts`, `Login.tsx` and `Layout.tsx` (the version on screen), `index.css`, `package.json` and the lock, `Dockerfile`, `.dockerignore`, README |
| `edge/` | README only |
| Unchanged | firmware (Node 1 1.7.x, Node 2 1.0.0), `DATA-CONTRACT.md` 1.6, `PIN-MAP.md` 7, migrations `001…011`, `tools/`, `grafana/`, the third-party images |
| Outside the project | the practice material `quick-win/hello.yml` and the 🧩 keys `challenges/key/` |

Three diffs ([`backend-2.0.diff`](code/backend-2.0.diff), [`frontend-2.0.diff`](code/frontend-2.0.diff), [`edge.diff`](code/edge.diff)) hold every change of `backend/`, `frontend/`, and `edge/`, for comparing. The practices copy files one by one because they come in two pull requests; don't overwrite your folder with [`code/`](code/).

**Four pull requests** (merged with **Create a merge commit**, as in Module 16) and two throw-away branches:

| PR | Branch | Content | Practices |
| :-: | :-- | :-- | :-- |
| A | `feature/robot-tests` | lint, Vitest, the test database, the robot's `verify` + `test` (the version not raised yet) | [1.1](#11-the-branch-featurerobot-tests-from-the-latest-main-3-minutes)–4.5 |
| B | `feature/pipeline` | version 2.0.0, two-processor images, staging, release tags, the deployer | [6.1](#61--the-branch-featurepipeline-and-three-gitattributes-lines-3-minutes)–9.5 |
| C | `fix/login-text` | one text on the **Login** screen, version 2.0.1 | [12.1](#121--the-branch-fixlogin-text-one-text-on-the-login-screen-the-version-guard-refuses-4-minutes)–12.3 |
| D | made by the **Revert** button | the content of 2.0.0 with the number 2.0.2 | [13.1](#131-the-revert-button-on-pr-c-the-version-guard-refuses-a-lower-version-5-minutes)–13.3 |
| — | `try/robot`, `try/red` | closed without merging | Quick Win, [5.2](#52--a-direct-push-to-main-is-refused-3-minutes) |

**The time** is ±10 hours (the free path ±9 hours, without a Pi ±9.5 hours), plus waiting for the Pi's alarm clock (usually at most ±17 minutes): the warm-up 30 minutes, the Quick Win 15, the concepts ±90, the practices 415 including waiting for the robot, ➕ 30, the quiz and checklist 20.

## 🔁 Warm-up: versions, manual steps, and one exit code (30 minutes)

> 🖥️ **Tools used:** **VS Code** (a terminal at the project root and in `backend`), **Docker Desktop**, an SSH terminal to the VPS and the Pi, **Chrome**, and **GitHub**.

Five things to bring along, all of them only **read** (the edit of Step 3 is undone).

> 🔀 **The free path:** the "VPS" in Steps 1, 2, and 4 = your Pi. **Without a Pi:** skip the Pi parts.

### Step 1 — Your Module 28 home's inventory: version numbers, 203 tests, and self-built images

Where are version numbers written? In a terminal at the project root (bash; or **Ctrl + Shift + F** in VS Code), one by one:

```text
grep -n '"version"' backend/package.json frontend/package.json
```

```text
grep -n 'image: ${IMAGE_REGISTRY' compose.cloud.yml
```

**Expected output (the author's lab, laptop):**

```text
backend/package.json:3:  "version": "1.5.0",
frontend/package.json:4:  "version": "1.4.0",
208:    image: ${IMAGE_REGISTRY:?fill in IMAGE_REGISTRY in .env}/mini-smart-home-backend:1.5.0
222:    image: ${IMAGE_REGISTRY:?fill in IMAGE_REGISTRY in .env}/mini-smart-home-backend:1.5.0
257:    image: ${IMAGE_REGISTRY:?fill in IMAGE_REGISTRY in .env}/mini-smart-home-web:1.4.0
```

Two numbers in five lines, written by hand, without a checker. Then three checks; the author's lab results come after → (laptop, simulated "VPS"):

1. The `backend` terminal: `npm test` → `Test Files  25 passed (25)`, `Tests  203 passed (203)`.
2. Chrome: `https://iot.yourname.my.id/api/health` → `{"ok":true,"broker":true,"database":true,"received":5,"rejected":0,"ignored":0}`, no `version` yet.
3. The VPS SSH terminal, folder `~/mini-smart-home`: `docker compose ps` → everything `Up`; the `IMAGE` column: `ghcr.io/<account>/mini-smart-home-backend:1.5.0` and `…-web:1.4.0` (a GHCR address), although the VPS usually built them itself (7.4 of Module 27). On the Pi (folder `edge`): only `mosquitto`, the official image.

**Later in** [3.2](#32--one-server-assembly-buildapp-in-srcappts-the-203-tests-stay-green-10-minutes), [6.2](#62--one-number-200-npm-version-three-image-lines-and-envexample-6-minutes), and [10.1](#101--the-last-time-you-ssh-in-to-deploy-sh-scriptsdeploysh-pulls-200-10-minutes).

### Step 2 — Count the manual steps of one small change, from the laptop to the VPS and the Pi

Say one text on the **Login** screen changes. Since [➕ Module 27](../module-27-deploy-internet-tls-pwa/README.md#-add-on-to-mini-smart-home) (part E), it goes like this:

| Machine | Manual steps |
| :-- | :-- |
| Laptop | `npm test` (if you remember), commit, push |
| GitHub | open a pull request, merge |
| VPS | SSH, `git pull`, `docker compose build`, `docker compose up -d` |
| Pi | SSH, `git pull`, `docker compose restart mosquitto` when `edge/` changed |

Count your steps and note them in `learn-iot/module-29/warmup.md`: usually ±10 steps on three machines, ±15–25 minutes (an estimate). This week the VPS and Pi rows are done by the robot and the alarm clock. **Later in** [12.6](#126--delete-the-branch-and-note-the-stopwatch-time-3-minutes) and [➕ E](#e-changelogmd-and-the-tags-v200-v201-v202-note-your-stopwatch-time): its stopwatch.

### Step 3 — The robot's language: exit codes `0` and `1` from `npm test`

Every command leaves an **exit code**: `0` = success, anything else = failure. The promise of [🔬 Module 16](../../phase-3-backend-data/module-16-backend-typescript-api-git/README.md#-technical-deep-dive-optional) (the fold *Bruno CLI …*): code `1` makes the automatic check refuse a PR. In the `backend` terminal (bash; PowerShell, not tested: `npm test > $null; "exit code: $LASTEXITCODE"`):

```text
npm test > /dev/null; echo "exit code: $?"
```

**Expected output (the author's lab, laptop):** `exit code: 0`. Now wrong on purpose: in `src/services/version.test.ts` line 8, change `.toBe(1)` to `.toBe(2)`, save, then run it without `> /dev/null`:

```text
npm test; echo "exit code: $?"
```

**Expected output (the author's lab, laptop; cut):**

```text
AssertionError: expected 1 to be 2 // Object.is equality
 Test Files  1 failed | 24 passed (25)
      Tests  1 failed | 202 passed (203)
exit code: 1
```

Undo it with `git restore src/services/version.test.ts`, then repeat the first command: `exit code: 0`. The robot only reads this number. **Later in** [Quick Win Step 4](#step-4--change-one-expect-a-red-cross-and-exit-code-1-in-the-log-4-minutes) and [Concept 3](#3-ci-a-robot-that-reads-exit-codes).

### Step 4 — The processors of the laptop, the VPS, and the Pi: `docker version` and `docker buildx ls`

On the laptop, then in the SSH terminals of the VPS and the Pi:

```text
docker version --format '{{.Server.Arch}}'
```

Intel or AMD (laptop, VPS) answers `amd64`; the Pi, Apple silicon Macs, and Snapdragon answer `arm64`. **Expected output (the author's lab):** `arm64` on all three (all played by the author's Raspberry Pi 5). Then on the laptop:

```text
docker buildx ls
```

**Expected output (the author's lab, laptop):** one builder `default`, `PLATFORMS` only `linux/arm64`, its own processor. In Docker Desktop the list is longer (emulation; not tested by the author). The VPS and the Pi have different processors, which is why Module 27 built the images on the machine that uses them. **Later in** [Concept 5](#5-one-image-for-two-processors-built-by-the-robot-without-emulation) and [Practice 7](#practice-7--one-image-two-processors-pushed-to-ghcr-by-the-robot-35-minutes).

### Step 5 — GitHub and the Pi: a public repo, the Module 26 GHCR packages, and `systemctl list-timers`

GitHub's screens: from its documentation (5 November 2026), not recorded by the author.

1. **A public repo?** Open `https://github.com/<account>/mini-smart-home` in a Chrome incognito window (**Ctrl + Shift + N**): it shows = public (anyone can open it). The setting: **Settings** → **General**, at the very bottom; decide in [1.2](#12--is-the-mini-smart-home-repo-public-or-private-check-in-settings--general-then-decide-3-minutes).
2. **The Module 26 GHCR packages?** In that window, `https://github.com/<account>?tab=packages`: what shows = public, what only shows after logging in = private. Those linked to the repo (Module 26's `LABEL`) are in the **Packages** section of the repo page's right column. No packages is fine too. **Later in** [9.7](#97--the-ghcr-packages-become-public-pull-without-logging-in-two-processors-4-minutes).
3. **The Pi's alarm clocks.** In the Pi's SSH terminal:

```text
systemctl list-timers
```

The Module 12 security guard already has built-in alarm clocks. According to `man systemctl` (systemd 259), the column `NEXT` = when it rings again, `UNIT` = the alarm clock, `ACTIVATES` = the service it wakes. The contents differ per Pi; not recorded by the author (a simulated Pi without systemd). **Later in** [Concept 8](#8-a-systemd-timer-an-alarm-clock-for-the-module-12-security-guard) and [11.4](#114--turn-on-the-alarm-clock-enable---now-and-list-timers-5-minutes).

<details>
<summary>Self-test answer key</summary>

1. **Why is it enough for the robot to read the exit code?** Every tool already decides by itself whether it passed and reports it with one number; its error message is for humans.
2. **The processors of the VPS and the Pi?** Usually `amd64` and `arm64`; a self-built image is only for the processor that built it.
3. **How many steps, and which one is forgotten most often?** ±10; your own answer, for example `npm test` or the Pi's broker restart.

</details>

## 🏆 Quick Win: the first robot, a green check, then a red cross (15 minutes)

> 🖥️ **Tools used:** **VS Code** (a terminal at the root of the `mini-smart-home` project) and **GitHub** in the browser.

Until Module 28, the 203 backend unit tests only ran when you remembered. Your first robot, one YAML file for GitHub Actions, runs them on every pull request. You see it green, then red on purpose, in the same language as [🔁 Step 3](#step-3--the-robots-language-exit-codes-0-and-1-from-npm-test): the exit code. Everything happens on the throw-away branch `try/robot`; `main`, the VPS, and the Pi aren't touched.

> [!NOTE]
> **Not recorded by the author:** GitHub's screens here (the **Checks** tab, the log, the buttons) are from GitHub's documentation (read 5 November 2026). The same `hello.yml` was run by the author's simulated robot on a Raspberry Pi 5 (arm64), its `run:` steps unchanged and `uses:` simulated (Node from the container `node:24.22.1-alpine3.24` instead of `actions/setup-node@v7`): the job was green in 39 seconds and red in 32 seconds (a simulated robot's example, not GitHub's times; in the Indonesian edition's lab, a local forge also ran `actions/setup-node@v7`: 52 and 39 seconds; how: [🔬](#-technical-deep-dive-optional) *How the author tested …*).

> 🔀 **A private repo:** every run (one round of the robot's work) counts against the free account's monthly minutes quota ([Concept 3](#3-ci-a-robot-that-reads-exit-codes)); a practice this short is still fine.

### Step 1 — The branch `try/robot` from the latest `main` (1 minute)

On the laptop, open the VS Code terminal at the project root. Make sure `git status` is clean (every change committed), then:

```text
git switch main
git pull
git switch -c try/robot
```

**Expected output (the author's lab, laptop; last line):** `Switched to a new branch 'try/robot'`.

### Step 2 — The first robot in `.github/workflows/hello.yml` (4 minutes)

The `.github/` folder has existed since Module 16 (the pull request template). In VS Code, make a `workflows` folder inside it, then a file `hello.yml` in that folder. Its content is the block below (or **Copy raw file** from [`code/quick-win/hello.yml`](code/quick-win/hello.yml)); save with **Ctrl + S**.

```yaml
# hello.yml - Module 29 Quick Win: the first robot. Put this file at .github/workflows/hello.yml on the branch
# try/robot ONLY, open a pull request, see the green check, then make it red. That pull request is closed WITHOUT a merge, so
# this file never gets into main (the real robot is .github/workflows/ci.yml, Practice 4).
name: hello

# when the robot works: every time a pull request is opened, or its branch gets a new commit
on: pull_request

# the robot's token may only READ the repo's content
permissions:
  contents: read

jobs:
  backend:
    runs-on: ubuntu-24.04                  # a computer GitHub rents out (Ubuntu 24.04), deleted again after the job is done
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v7          # get the repo's content at this pull request's commit
      - uses: actions/setup-node@v7        # install Node.js, the same version as the backend and dashboard Dockerfiles
        with:
          node-version: 24.22.1
      - name: install libraries (exactly as package-lock.json says)
        working-directory: backend
        run: npm ci
      - name: unit tests
        working-directory: backend
        run: npm test                      # exit code 0 = a green check; anything else = a red cross
```

Read its comments: they are the lesson. What isn't written there:

- The spaces at the start of a line mean something: two spaces per level, no tabs. Paste it as it is.
- Every `-` under `steps:` is one step: `uses:` calls a ready-made program (an action), `run:` runs a command as in your terminal, in the folder `working-directory:` (`backend`); `name:` becomes the step's name in the log.
- GitHub only reads robots in the `.github/workflows/` folder; `timeout-minutes: 10` stops a stuck job after 10 minutes.
- `actions/setup-node` is what you'll meet most often in internet examples; your real robot will use a Node container, the same as the backend and dashboard `Dockerfile` ([Concept 4](#4-lint--test--build-fail-fast)).

### Step 3 — Commit, push, and open a pull request: a green check on the Checks tab (4 minutes)

```text
git add .github/workflows/hello.yml
git commit -m "try: first robot (hello.yml)"
git push -u origin try/robot
```

**Expected output (the author's lab, laptop; cut):**

```text
 1 file changed, 27 insertions(+)
 create mode 100644 .github/workflows/hello.yml
 * [new branch]      try/robot -> try/robot
```

On GitHub, open a pull request as in [Module 16's Practice 8](../../phase-3-backend-data/module-16-backend-typescript-api-git/README.md#practice-8--git-for-teams-branches-pull-requests-and-reviews-45-minutes): **Compare & pull request**, the title `try robot (don't merge)`, leave the description template, then **Create pull request**. Open the **Checks** tab, which shows which checks are running and why they pass or fail: at first the workflow `hello` is still running, then a green check (how long that takes on GitHub isn't measured by the author). Pick the job `backend`, then open its steps one by one down to `unit tests`.

**Expected output (the author's lab, simulated robot; log of the job `backend`, cut; the first line from the Indonesian edition's forge):**

```text
node: v24.22.1
added 225 packages, and audited 226 packages in 11s
 Test Files  25 passed (25)
      Tests  203 passed (203)
   Start at  01:04:01
   Duration  13.40s (import 49%, tests 39%, transform 11%, worker 2%)
```

The number of tests is the same as in [🔁 Step 1](#step-1--your-module-28-homes-inventory-version-numbers-203-tests-and-self-built-images), but the machine is different: a new, empty robot machine, `npm ci` installs 225 libraries from scratch, Node exactly 24.22.1, and `Start at` is in UTC (01:04 = 08:04 WIB).

### Step 4 — Change one `expect`: a red cross and exit code `1` in the log (4 minutes)

Repeat the mistake of [🔁 Step 3](#step-3--the-robots-language-exit-codes-0-and-1-from-npm-test): in `backend/src/services/version.test.ts` line 8, change `.toBe(1)` to `.toBe(2)`, then save.

```text
git commit -am "try: one expect wrong on purpose"
git push
```

Every push to a pull request's branch starts a new run. This time the **Checks** tab ends with a red cross. Open the job's log; according to GitHub's documentation, the failed step opens right away.

**Expected output (the author's lab, simulated robot; step `unit tests`, cut; the last line from the Indonesian edition's forge):**

```text
AssertionError: expected 1 to be 2 // Object.is equality
 ❯ src/services/version.test.ts:8:47
 Test Files  1 failed | 24 passed (25)
##[error]Process completed with exit code 1.
```

The first three lines are written by Vitest for you: what's wrong, on which line, and how many test files failed. The last line is written by the robot's machine (the `##[error]` prefix may look different on GitHub): `npm test` exited with code `1`, so the step `unit tests` and its job are red. The robot doesn't read `AssertionError`; it only reads that number.

### Step 5 — Close the pull request without merging, then delete its branch (2 minutes)

According to GitHub's documentation: at the bottom of the pull request page, under the comment box, click **Close pull request** (not **Merge pull request**), then **Delete branch**. In the terminal:

```text
git switch main
git branch -D try/robot
git ls-files .github
```

**Expected output (the author's lab, laptop; cut):**

```text
Deleted branch try/robot (was <sha>).
.github/pull_request_template.md
```

A capital `-D` because this branch was never merged; `.toBe(2)` disappears with it. `git ls-files .github` proves `hello.yml` never got into `main`: your real robot, `ci.yml`, comes in [Practice 4](#practice-4--a-checking-robot-on-every-pull-request-40-minutes), runs on PR A ([4.2](#42--commit-push-and-open-pr-a-two-checks-run-at-the-same-time-5-minutes)), and is made red on purpose once more in [4.4](#44--l0-red-once-on-purpose-then-all-green-8-minutes). Two robots for the same tests only double the checks.

**You vs the robot:**

| | You ([🔁 Step 3](#step-3--the-robots-language-exit-codes-0-and-1-from-npm-test)) | The robot (`hello.yml`) |
| :-- | :-- | :-- |
| Who remembers to run the tests | you, if you remember | the robot, every time |
| On whose machine | your laptop, with its own contents and Node | a rented machine, new every time, exactly Node 24.22.1, only the commit's contents |
| When | before the push, if you remember | when a pull request is opened, then on every push to its branch |
| What's read | the messages on the screen | the exit code |
| Who sees the result | you | anyone who opens the **Checks** tab (public repo = public log) |

> ➡️ **Next:** [Concept 1](#1-the-testing-pyramid-ingredients--recipe--kitchen--customer) and [Concept 2](#2-what-a-mock-cant-see-integration-tests-with-a-test-database) explain why the 203 tests the robot just ran aren't enough yet, then [Concept 3](#3-ci-a-robot-that-reads-exit-codes) and [Concept 4](#4-lint--test--build-fail-fast) explain the robot you just saw. After that, do [Practice 1](#practice-1--the-workbench-a-branch-a-public-repo-and-a-backup-10-minutes) and [Practice 2](#practice-2--backend-lint-and-frontend-tests-oxlint-and-vitest-25-minutes); your VPS and Pi only change in [Practice 10](#practice-10--the-vps-switches-to-pulling-a-robot-key-that-can-only-run-one-script-45-minutes) and [Practice 11](#practice-11--the-pi-updates-itself-a-systemd-alarm-clock-40-minutes).

## 🧠 The "Why" Concepts

You don't need to read these eleven concepts at once. Read them in turn with their practices:

1. The Quick Win (already done) → Concepts 1–4 → Practice 1 (the workbench), Practice 2 (lint and frontend tests), Practice 3 (a test database and 20 integration tests), then Practice 4 (the checking robot on the first pull request)
2. Concept 11 → Practice 5 (branch protection)
3. Concept 10 → Practice 6 (one version number 2.0.0) → Concepts 5–6 → Practice 7 (two-processor images)
4. Concept 9 → Practice 8 (staging) → Concepts 7–8 → Practice 9 (the first release 2.0.0), Practice 10 (the VPS), and Practice 11 (the Pi)
5. Practice 12 (a small PR 2.0.1 reaches production) → Practice 13 (a revert becomes 2.0.2)

Practices 1–9 are done on the laptop and on GitHub: your VPS and Pi only change in Practices 10 and 11 (the backup in Practice 1 only reads). The file excerpts, commands, and tables in the concepts are only for reading; everything is typed and run in the practices.

Module 28 closed with an honest limit: the server images are still deployed over SSH without automatic tests ([the end of Module 28](../module-28-ota-provisioning-fleet/README.md#-module-28-completion-checklist)). Concepts 1–2 answer **what** is tested and why 203 tests alone aren't enough. Concepts 3–4 answer **who** runs them and in what order. Concepts 5–9 take the result to the VPS and the Pi, then Concepts 10–11 guard the version number and the `main` branch.

### 1. The testing pyramid: ingredients → recipe → kitchen → customer

[Module 19's Concept 6](../../phase-3-backend-data/module-19-realtime-rules-notifications/README.md#6-unit-tests-checking-the-rules-brain-without-a-device) gave you the first 10 unit tests, for the rules brain. Since then their number has grown in almost every module, and at the end of Module 28, `npm test` in the `backend` folder prints `Tests  203 passed (203)` ([🔁 Step 1](#step-1--your-module-28-homes-inventory-version-numbers-203-tests-and-self-built-images)). Still, 203 green tests don't guarantee that your home works. What sets one test apart from another is **how many real parts work along** when it runs.

Picture a restaurant. The cook can **taste the ingredients** one by one: the salt is salty, the chili is hot. That's fast, cheap, and can be repeated a hundred times a day, but it doesn't prove the dish is good. The cook can also **cook the recipe in a practice kitchen**: a real stove, pan, and ingredients, but no customers. Finally, **a customer orders until the food arrives**: the waiter, the kitchen, and the cashier work together. The last way is the most convincing, but the slowest and the flakiest, because every part can get stuck. These three ways of tasting are the three layers of the testing pyramid that the [Syllabus](../../SYLLABUS.md#module-29--testing--cicd-every-change-tested-and-deployed-automatically) promises (unit → integration → end-to-end):

| Layer | Analogy | What really works | What's mocked or skipped | In your project after Module 29 | Time (example, the author's Pi 5) |
| :-- | :-- | :-- | :-- | :-- | :-- |
| unit test | tasting the ingredients | one function, or one API route | the database and the broker (mocks, `vi.mock`); the network skipped (`app.inject`) | backend **203** tests (25 files) + dashboard **5** tests (3 files, new in [2.3](#23--vitest-505-in-the-frontend-three-test-files-the-dashboards-first-five-tests-8-minutes)) | backend ±15 seconds, dashboard ±4 seconds, without Docker |
| integration test | cooking the recipe in a practice kitchen | API routes + SQL queries + a TimescaleDB test database | the broker (a dead address) and Telegram | **20** tests (6 files in `backend/src/integration/`, new in Practice 3) | ±14 seconds, plus ±5 seconds to start the test database |
| end-to-end test | a customer orders until the food arrives | browser → Caddy → backend → database → broker | nothing | **0** on the main path | the slowest |

**Two kinds of tests in the bottom layer.** The first kind tests **pure functions**, like Module 19's `evaluateThreshold()` or Module 28's `compareVersions()`: input goes in, output comes out, without a real clock, database, or MQTT. The second kind, since [Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#110-tests-and-save-to-the-branch-7-minutes), tests **routes without a network**: the Fastify server is assembled, then knocked on with `app.inject()` without opening any counter, while the database tables are replaced by mock tables in memory with `vi.mock`. Both are fast and don't need Docker, so they suit running every time you change one line. The price of that speed is covered in Concept 2: a mock table never runs a single SQL query.

**The pyramid's shape.** Many small, fast tests at the bottom, few big, slow tests at the top. That isn't a rule about numbers but a habit: every mistake is tested at the **lowest** layer that can still catch it. Hysteresis logic only needs a unit test. A query that breaks a table rule needs an integration test. A button that was never wired to the API only shows up in an end-to-end test. On this module's main path, the top layer is still empty: an end-to-end test needs a real browser driven by a program (Playwright), and that's covered as reading in [🔬](#-technical-deep-dive-optional) *Playwright: one Login → dashboard flow as an end-to-end test* (not run by the author yet).

**The dashboard gets its first tests.** Since it was born in Module 22, the dashboard has never had a single test. In Practice 2 it gets Vitest 5.0.5, the same tool as the backend ([Syllabus](../../SYLLABUS.md#3-technology-choices--why-we-made-them): "Vitest (backend & frontend)"), and five tests of pure functions: the WIB time on the screen (`time.ts`), the content of the CSV file (`csv.ts`), and the rule sentences (`rules.ts`). No browser and no backend: the bottom layer first.

**On the robot, everything must run.** On the laptop, `npm test` without a test database skips the 20 integration tests (`Tests  203 passed | 20 skipped (223)`), so it still runs without Docker; with a test database, all 223 tests run at once (±24 seconds on the author's Pi 5, ±29 in the Indonesian edition's lab and in the picture below; different on your laptop). The robot (Concept 3) always starts a test database, and even one skipped test makes it red (Concept 4). You run the version with the test database yourself in [3.6](#36--20-green-integration-tests-then-223-tests-at-once-8-minutes).

![Diagram of the Mini Smart Home testing pyramid (Concept 1): many small, fast tests at the bottom, few big, slow tests at the top; numbers = the project after Module 29. The axis: slow and sure at the top, fast and many at the bottom. The top, dashed: end-to-end, 0 tests, the customer; its card: a customer orders until the food arrives, browser to Caddy to backend to database to broker, all real: the surest, but the slowest and flakiest; in this module 0 tests, Playwright = Technical Deep Dive (optional). The middle, accented: integration tests, 20 tests, new in Module 29, the practice kitchen; its card: cooking the recipe in the practice kitchen, routes + SQL + a real TimescaleDB database (a fake broker): CHECK, ON CONFLICT, time_bucket, migrations 001–011 from zero; 20 tests in 6 files of src/integration/, through buildApp() = the same assembly as production; only a database ending in _test. The base: unit tests, 203 + 5 tests, backend + frontend, the ingredients; its card: tasting the ingredients one by one: pure functions (since Module 19) and routes without a network (app.inject, since Module 21) with a mock database and broker (vi.mock); backend 203 tests (25 files), frontend 5 Vitest tests (WIB time, CSV, rule sentences); no Docker, no network. Bottom left, npm test in the backend folder (laptop): without a test database, the 20 integration tests skipped: Tests 203 passed, 20 skipped (223); with DATABASE_URL_TEST: Tests 223 passed (223). The author's Pi 5: ±15 seconds without, ±29 seconds with the test database; the robot (job test): the test database is always there, one skipped test = red. Bottom right, what only a database catches (the author's lab): wrong SQL in src/db/devices.ts, $5 replaced by upper($5); the unit tests stay green, the mock database runs no SQL; the integration tests red (6 of 20): the database refuses that row (CHECK devices_key_hash_check), the backend answers 503; the lesson: mocks are fast, a real database is honest.](assets/project-test-pyramid.png)

### 2. What a mock can't see: integration tests with a test database

The core sentence of this concept is short: **a mock doesn't run SQL**. Not one of the 203 backend tests touches a database: the route tests replace the `src/db/` modules with `vi.mock`, and the test itself decides the "database's" answers: a device stored, a row missing, and so on. If the real SQL query has a typo, the mock still answers sweetly, and the test stays green.

**Proven by the author (the author's lab, laptop).** On line 44 of `backend/src/db/devices.ts`, the value `$5` (the stored SHA-256 fingerprint of the device key) was replaced by `upper($5)`, so the fingerprint was written in capitals. You repeat this one-word mistake yourself in [3.7](#37--a-deliberate-sql-mistake-203-mock-tests-green-the-integration-tests-red-8-minutes):

| What runs | Result |
| :-- | :-- |
| `npm test` without a test database (203 tests with mocks) | `Tests  203 passed \| 20 skipped (223)`, exit code `0`: **green** |
| `npm run test:integration` with a test database (20 tests) | `Tests  6 failed \| 14 passed (20)`, exit code `1`: **red** |

The cause is in Module 21's migration `010_device_keys.sql`: `CHECK (key_hash ~ '^[0-9a-f]{64}$')` only accepts 64 **lowercase** hexadecimal characters. The database refuses the row (the backend log: `new row for relation "devices" violates check constraint "devices_key_hash_check"`), the backend answers `503`, and the test that expects `201` fails: `AssertionError: expected 503 to be 201 // Object.is equality`. In production, that one word means every registration of a device with a key through `POST /devices` gets `503`, although all 203 tests are green.

**What only shows with a real database.** The example above isn't the only one. The twenty integration tests in `backend/src/integration/` deliberately pick things a mock can't prove, and every file first runs the migration program `001`–`011` (from zero when the database is still empty):

| What a real database proves | Since | Test file |
| :-- | :-- | :-- |
| the key fingerprint passes the `CHECK`; a second registration gets `409` without overwriting the row | Module 21 | `devices.test.ts` (4 tests) |
| a 1-hour history in time order; a TimescaleDB `time_bucket()` summary; a double delivery = one row (`ON CONFLICT`) | Modules 17–18 | `readings.test.ts` (3) |
| the login session stored as a fingerprint; refresh rotates the token; logout deletes the row | Module 20 | `login.test.ts` (4) |
| a rule deleted, its event log stays (the foreign key `ON DELETE SET NULL`) | Module 19 | `rules.test.ts` (3) |
| a claim code exchanged once, in one transaction; an expired code refused | Module 28 | `claims.test.ts` (3) |
| firmware release metadata and test releases; `GET /fleet` reads the latest health (`LATERAL`) | Module 28 | `firmware-fleet.test.ts` (3) |

**The test database = the practice kitchen.** It's empty, single-use, its name always ends in `_test`, and it never becomes the home kitchen:

- **Empty and single-use.** On the laptop, the test database is one TimescaleDB container with the same image as production (`timescale/timescaledb:2.30.2-pg17`; migrations `002`–`005` need TimescaleDB, so a plain `postgres` won't do). Its data is kept in memory (`--tmpfs`), so it disappears when the container stops, and its counter is `5433` so it doesn't clash with the home database at `5432` ([3.1](#31--a-throw-away-test-database-smarthome-db-test-at-counter-5433-6-minutes)). On the robot, its role is played by the service `db` in the job `test` (Concept 3).
- **Only a `…_test` database.** The integration tests write and delete rows, so `src/integration/setup.ts` checks twice: the database name in the `DATABASE_URL_TEST` address before connecting, then `current_database()` after connecting; what decides is the database that's really connected. Your home database's address is refused before a single row is touched: `DATABASE_URL_TEST points at the database "smarthome", not a test database …` ([3.8](#38-the-guard-refuses-a-database-named-smarthome-4-minutes)).
- **The same migration program.** Every test file runs `node src/db/migrate.ts`, the same program as the `migrate` service in Compose. Vitest runs the test files at the same time, so their migrations queue with `pg_advisory_lock` (PostgreSQL's queue lock: one file migrates, the other files wait their turn), and every file uses its own `device_id`s, emails, and rule names so they don't disturb each other ([3.3](#33--srcintegrationsetupts-the-_test-guard-and-the-queued-migrations-6-minutes)).
- **Without `DATABASE_URL_TEST`, the 20 tests are skipped.** A laptop without Docker can still run `npm test`; the robot may not skip them (Concept 4).

**One server assembly: `buildApp()`.** Until Module 28, `src/server.ts` assembled the server, then straight away connected to the database and the broker and opened counter `8080`, so the tests couldn't take its assembly without starting everything. In Practice 3, that assembly moves to `src/app.ts` as the function `buildApp()`: Fastify, the protection, every route, and the API document, without a counter. `server.ts` calls `await buildApp()`, then connects and opens the counter; the integration tests call the same `buildApp()`, then knock on it with `app.inject()`. So what's tested is the production assembly, not an assembly made by the tests. The author compared the API documents of Module 28 and Module 29 (the author's lab): the same 30 paths, and the only difference is `/health`, which now names the `version` ([3.2](#32--one-server-assembly-buildapp-in-srcappts-the-203-tests-stay-green-10-minutes)).

**Why not a third Compose file or Testcontainers.** [Module 26's Concept 10](../module-26-docker-compose/README.md#10-two-files-until-the-end-the-center-and-the-gateway) decided on two Compose files until the end; a test database only needs one `docker run` line on the laptop and one service on the robot. Testcontainers (a library that starts containers from inside the tests) means a new package, and its PostgreSQL module page doesn't mention TimescaleDB (read 31 October 2026). These are the API integration tests with a test database that the Syllabus promises.

### 3. CI: a robot that reads exit codes

Until Module 28, the tests only ran when you remembered to run them, on your laptop with its own contents. This module hands that to a **robot**: GitHub Actions, the GitHub service that runs commands on GitHub's computers every time a change is sent there. The [Syllabus](../../SYLLABUS.md#3-technology-choices--why-we-made-them) paired them from the start: Git and pull requests in Module 16, GitHub Actions in Module 29. This automatic checking is called **CI** (continuous integration): every change is checked before it's merged into `main`. The next part, deploying what passed to the VPS and the Pi without you SSHing in, is called **CD** (continuous delivery or deployment) and is covered in Concepts 5–9. Your project's robot is called `ci`, the checking and deploying robot: one file, `.github/workflows/ci.yml`, that you build from Practice 4 to Practice 9.

**The robot doesn't understand code.** It runs the same commands you type in the terminal, then **reads their exit code**: `0` = a green check, anything else a red cross. That's the language you learned in [🔁 Step 3](#step-3--the-robots-language-exit-codes-0-and-1-from-npm-test) and saw in [Quick Win Step 4](#step-4--change-one-expect-a-red-cross-and-exit-code-1-in-the-log-4-minutes): one wrong `expect` makes `npm test` exit with code `1`. The fold *Bruno CLI: every test with one command* in [🔬 Module 16](../../phase-3-backend-data/module-16-backend-typescript-api-git/README.md#-technical-deep-dive-optional) already promised it: an exit code `1` like that is what makes the automatic check refuse a pull request. The robot doesn't read the error message; you read it in the log.

**The robot's five words.** The chain of checks from a pull request to production is called a pipeline, an **assembly line**. The five words below are used throughout the module:

| Word | Meaning | In your project |
| :-- | :-- | :-- |
| workflow | one YAML file in the `.github/workflows/` folder, read by GitHub itself | `ci.yml`, named `ci` (the Quick Win's `hello.yml` only on the branch `try/robot`) |
| event (trigger) | something that happens and starts a workflow | `pull_request` to `main` (a PR opened, getting a new commit, or reopened) and `push` to `main` (including a merged PR) |
| job (station) | a set of steps on one machine; different jobs = different machines, running at the same time unless told to wait | `verify`, `test`, `build`, `staging`, `tag-release`, `deploy-vps` |
| step | a terminal command (`run:`, may be several lines) or one ready-made action (`uses:`); a red step = the steps after it in that station are skipped (except special steps for failures) | `npm test`, `actions/checkout@v7` |
| runner (a rented machine) | a GitHub computer that runs one job: new every time, deleted afterwards | `ubuntu-24.04` (an x64 processor; for public repos 4 CPUs and 16 GB of RAM, according to GitHub's documentation) |

The runner can also be your own computer (self-hosted), but for a public repo that's dangerous: [🔬](#-technical-deep-dive-optional) *Your own runner on the Pi (self-hosted): why it's dangerous for a public repo*.

**Ready-made steps and the Node container.** A `uses:` step calls an action, a small ready-made program: `actions/checkout@v7` copies the repo to the robot's machine, `actions/cache@v6` keeps the npm downloads. This project only uses actions from their official publishers (`actions/*` and `docker/*`) with major tags like `@v7` (Concept 6). The jobs `verify` and `test` run inside a **container** `node:24.22.1-alpine3.24`, exactly the same Node as the backend and dashboard `Dockerfile` (Concept 4). The test database for the job `test` is a service container named `db`: a companion container the robot starts before the first step and throws away with its machine. From inside the job's container, its address is just its service name, `db`, exactly as in Docker Compose.

**YAML: the spaces at the start of a line = meaning.** The robot's file is written in YAML. Just read this first excerpt of `ci.yml` for now; you paste its first stage in [4.1](#41--githubworkflowsciyml-stage-a-the-jobs-verify-and-test-15-minutes):

```yaml
name: ci

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
# …
jobs:
  verify:
    name: verify
    runs-on: ubuntu-24.04                        # written exactly (not ubuntu-latest): doesn't change silently
    container: node:24.22.1-alpine3.24           # the SAME Node as the backend and dashboard Dockerfiles
    timeout-minutes: 15                          # GitHub's default is 360 minutes: a stuck job is stopped much sooner
    steps:
      - run: apk add --no-cache git tar
      - uses: actions/checkout@v7
      # …
```

How to read it: `name: value` is one setting, and a line indented **two spaces** further belongs to the line above it. `pull_request:` and `push:` line up because both are children of `on:`, and each `branches: [main]` belongs to the trigger right above it. `jobs:` holds the stations, `verify:` is one station, and `steps:` is its list of steps, each starting with `-`; `run: |` = the command takes several lines below it (not a pipe). Text after `#` is a comment; the comments in `ci.yml` are part of the lesson, so read them. Tabs aren't allowed in YAML: use spaces. One shifted space can change a setting's meaning or make the file invalid.

**When the robot runs.** The robot runs when a change is **sent to GitHub** (push) or proposed through a pull request: a push to `main` or to a PR's branch starts one new run (one round of the robot's work). The robot doesn't run when you save a file in VS Code, or when you make a commit you haven't pushed yet; the [Syllabus glossary](../../SYLLABUS.md#12-mini-glossary-terms-that-appear-in-this-syllabus) (v1.0.31) records this meaning.

**A public log.** In a public repo, anyone can open the **Actions** tab and read your robot's log, including every line your commands print. That's why secrets are never printed (`echo`, `set -x`), and their values are only stored in **Secrets**, which show as `***` in the log (Concept 6).

**The cost.** For a public repo, the robot is free: GitHub's billing documentation (read 31 October 2026) says "The use of standard GitHub-hosted runners is free: In public repositories". A private repo on a free account gets a monthly quota worth $12, the same as 2,000 Linux x64 minutes, and every run counts against it. [Syllabus §5.5](../../SYLLABUS.md#55-service-costs-phase-5) also records GitHub Actions and the Container Registry as free for public repos.

**The numbers in this module.** The author has no GitHub account. The same `ci.yml`, its `run:` steps unchanged, was run by a **simulated robot** on one Raspberry Pi 5 (how: [🔬](#-technical-deep-dive-optional) *How the author tested …*), so every robot time in this module is a simulated robot's time with local images, not GitHub's. How long GitHub's robot takes for your repo hasn't been measured by the author.

The map below is the whole assembly line you build until Practice 9: the top band runs on every pull request, the bottom band on every push to `main`. Come back to this map every time a new station is added.

![Diagram of the pipeline map from a pull request to the VPS and the Pi (Concept 3, also Concepts 4, 6, and 9): the assembly line .github/workflows/ci.yml, six stations (jobs); red = the next stations are skipped. Band 1, every pull request to main (no secrets, no pushing, no deploying): in parallel verify (Node container: the version guard, firmware, type check, lint, frontend tests, check-schema, build, audit) and test (test database, 203 + 20 = 223 tests); then build (needs both: backend + web images, amd64 + arm64, not pushed); then the branch rule = a barrier in front of main (Concept 11), lifted when three required checks are green: something red = Merge pull request locked, also for the repo owner, the PR stops; all green = it opens (Create a merge commit, Module 16). Merge = a push to main: the robot runs again; a new release reaches the VPS (pushed) and the Pi (pulls by itself). Band 2, every push to main (secrets and write permissions only here): verify ∥ test again; build, then push to GHCR (the version tag and sha + 7 characters; an existing version is not pushed); staging, new version only: a dress rehearsal on the robot's machine, the same Compose, new images, random secrets, an empty database, pull, up --wait, the smoke test, thrown away; tag-release: an annotated tag (for example v2.0.1) = this release may be deployed, with its CHANGELOG.md notes; deploy-vps, when Variables VPS_HOST is set: SSH with the robot key, the VPS runs scripts/deploy.sh, its report must name that version deployed. GHCR (the image shop): public packages, staging pulls from it; the gateway Pi, not contacted by the robot: its alarm clock every 15 minutes (Concept 8) asks for a new tag; the VPS, pushed over SSH: deploy.sh pulls the images, up --no-build, the smoke test. A push without a new version (docs only): verify, test, build run (new-release = no, no images); staging, the tag, the deploy skipped (if), not a failure. The robot's token permissions per job (Concept 6): the default contents: read; build + packages: write; staging + packages: read; tag-release contents: write (the only writer); deploy-vps no token. An example of the author's simulated robot (ci.yml as is, Raspberry Pi 5, a local registry; the Indonesian edition's lab, not GitHub): verify ±110–135 seconds ∥ test ±75–105, build ±95–125, staging ±50–75, tag-release ±3–5, deploy-vps ±30 seconds; merge to the simulated VPS deployed ±5–6½ minutes; a release with a red staging never gets a tag; on GitHub staging also pulls ±1.1 GB of images, not measured.](assets/pipeline-map.png)

### 4. Lint → test → build: fail fast

The order in the Syllabus, lint → test → image build → push to GHCR → deploy, has one reason: **fail fast**. Cheap checks run first, expensive ones later, and the assembly line stops at the first red station. The answer "red" comes as fast as possible, and the robot doesn't waste time building or pushing images from code that's certainly wrong.

**Between stations: `needs`.** `verify` and `test` don't need each other, so both run at the same time on two machines. The job `build` writes `needs: [verify, test]`: it only starts when both are green. When a job being waited for is red or skipped, the job waiting for it is skipped too (gray). So one red test in `test` stops the whole line: no images, no staging, no tag, no deploying (the map in [Concept 3](#3-ci-a-robot-that-reads-exit-codes)).

**Inside a station: the cheap things first.** After three preparation steps (`apk add`, copying the repo, and `safe.directory`), the job `verify` runs these steps, in order:

| Step (the exact name in `ci.yml`) | What it checks |
| :-- | :-- |
| `version - one number everywhere; what gets deployed changes = the version goes up` (from [6.6](#66--stage-b1-the-step-version-in-the-job-verify-2-minutes)) | the version guard: one number in every place, going up when what's deployed to the VPS and the Pi changed (Concept 10) |
| `firmware - the Module 28 test switch off, no .bin, build/, or keys.h in Git` | the switch `TEST_WRONG_KEY` is `0`; no firmware or key files in Git |
| `npm cache (library downloads reused while package-lock.json stays the same)` | (prepares the npm downloads) |
| `backend - type check, lint, audit` | `npm ci` → `npm run check` → `npm run lint` → audit |
| `frontend - lint, test, check schema, build, audit` | `npm ci` → lint → 5 tests → `check-schema` → build → audit |

The first two steps only read files, so they finish within seconds, before hundreds of npm packages are downloaded. Inside one step, the `run:` lines run in order and stop at the first line that fails: a wrong type stops the backend step before lint and audit.

**`npm ci` in the production container.** The robot installs libraries with `npm ci`, not `npm install`: `npm ci` installs exactly the versions in `package-lock.json` (as in the [Module 26](../module-26-docker-compose/README.md#4-the-kitchen-and-the-serving-table-multi-stage-small-images-and-caddy) Dockerfile), stops when `package.json` doesn't match it, and never rewrites either. The container is `node:24.22.1-alpine3.24`, so the tests run on the same Node and Alpine as the backend on the VPS and the Pi. The npm cache (`actions/cache@v6`) keeps the download folder `~/.npm`, not `node_modules`, with a cache key (`key:`) from the fingerprint of `package-lock.json`; `npm ci` still checks every package's fingerprint. The first step `apk add --no-cache git tar` installs `git` (copying the repo, the version guard) and a full `tar`, because Alpine's built-in `tar` doesn't know an option that cache action uses ([🚨](#-troubleshooting) *Alpine containers on the robot …*).

**Three checkers, three questions.** `npm run check` (`tsc --noEmit`) asks: do the data types match? `npm test` asks: is the behavior right? Lint is a **spell checker for code**: it reads code without running it and looks for patterns that are almost always wrong, for example a leftover `debugger;` or a comparison of two fixed values. The backend has never had lint: ESLint can't be installed because `typescript-eslint` doesn't accept TypeScript 7 yet (the fold *ESLint and Prettier …* in [🔬 Module 16](../../phase-3-backend-data/module-16-backend-typescript-api-git/README.md#-technical-deep-dive-optional); don't force it with `--force` or `--legacy-peer-deps`). The way out is oxlint 1.89.0, the same version as the frontend's. Almost all its rules are warnings, and warnings alone don't change the exit code, so without `--deny-warnings` lint is almost always green (the author's lab). With `--deny-warnings` in the `lint` script of both folders, one warning = exit code `1` = the robot red. When it was first set up in the backend, oxlint found exactly one: `Found 1 warning and 0 errors.` ([2.1](#21--backend-lint-with-oxlint-1890-oxlintrcjson---deny-warnings-and-one-finding-8-minutes)).

**Schema and audit.** `npm run check-schema` compares the schema copies in `frontend/src/schemas/` with the originals in the `backend` folder (Module 24), so the robot holds the whole repo. `npm audit --omit=dev --audit-level=high` is red only for high or critical holes in the libraries that go to production. As of 4 November 2026, the backend still prints `4 moderate severity vulnerabilities` with exit code `0`, and the frontend `found 0 vulnerabilities`. A plain `npm audit` has had exit code `1` in both folders since day one, and a robot that's always red teaches people to ignore red; the full report is still read by a human through the PR template item, continuing the habit of [Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#10-honest-traffic-at-home-is-still-in-the-clear) ([2.5](#25-npm-audit-like-the-robot-red-only-for-high-severity-holes-then-commit-3-minutes)). New holes can be announced at any time, so the robot can turn red without one line of your code changing.

**Firmware: a late alarm.** `.bin` files, `build/` folders, and `keys.h` can hold the ESP-NOW key. The robot does turn red when one of them is in Git, but once a key is pushed to a public repo, anyone may already have read it: the key must be replaced; deleting it from Git isn't enough.

**No false green.** A green check that doesn't really test is a **false green**: `continue-on-error: true` (a step may fail without making the station red), `if: false` (a step never runs), `.skip` or `.only` in a test, or deleting a red test. The robot guards one trap itself: when the output of `npm test` in the job `test` reports skipped tests (Vitest's count: a number before the word `skipped`, such as `1 skipped`; the word alone, for example in a test's name, doesn't count), the step stops with `FAIL  a test was skipped: on the robot every test must run, the 20 integration tests too`. The rest is guarded by humans: a PR that changes `.github/workflows/` is read on the **Files changed** tab (Concept 11). You make the robot red on purpose in [4.4](#44--l0-red-once-on-purpose-then-all-green-8-minutes).

**A time fence and the machine's name.** `timeout-minutes: 15` cuts GitHub's default limit (360 minutes), so a stuck job is stopped much sooner. `runs-on: ubuntu-24.04` is written exactly: according to the README of GitHub's runner images (read 4 November 2026), `ubuntu-latest` is announced to move to Ubuntu 26.04 in November 2026. The lesson is the same as Module 26's exact tags without `latest`: what isn't written exactly can change silently. The cure for every red step is in [🚨](#-troubleshooting), the groups **Robot red in `verify`** and **Robot red in `test`**.

> ⬆️ **Done reading Concepts 1–4?** Continue to [Practice 1](#practice-1--the-workbench-a-branch-a-public-repo-and-a-backup-10-minutes) to [Practice 4](#practice-4--a-checking-robot-on-every-pull-request-40-minutes): the workbench, lint and frontend tests, the test database, then the checking robot on the first pull request. [Concept 11](#11-branch-protection-a-barrier-in-front-of-main) is only needed before [Practice 5](#practice-5--branch-protection-a-red-pr-cant-be-merged-20-minutes).

### 5. One image for two processors: built by the robot without emulation

In [🔁 Step 4](#step-4--the-processors-of-the-laptop-the-vps-and-the-pi-docker-version-and-docker-buildx-ls), you saw that the VPS and the Pi have different processors: the VPS **amd64** (Intel or AMD), the Pi **arm64**. A self-built image only holds programs for the processor of the machine that built it ([Module 26's Concept 11](../module-26-docker-compose/README.md#11-the-image-shop-ghcr-and-architecture)), so the VPS ([7.4 of Module 27](../module-27-deploy-internet-tls-pwa/README.md#74-docker-compose-build-on-the-vps-before-the-other-services-start-12-minutes)) and the free-path Pi ([11.3 of Module 27](../module-27-deploy-internet-tls-pwa/README.md#113-two-external-cupboards-and-docker-compose-build-on-the-pi-12-minutes)) each build their own images: slow, with npm downloads on every machine, and the 2 GB VPS got swap as a reserve for the build. From this week the robot builds them **once** for two processors, and the VPS and the Pi only pull.

**One name, one table of contents.** Official molds like `node` and `caddy` have long worked like this ([Module 26's Concept 2](../module-26-docker-compose/README.md#2-a-mold-in-layers-image-tag-digest-and-architecture)): one name + tag, for example `ghcr.io/<account>/mini-smart-home-backend:2.0.0`, points to a **multi-architecture index**, a table of contents holding one amd64 mold and one arm64 mold. `docker compose pull` takes the amd64 one on the VPS and the arm64 one on the Pi, without an extra command. The [Syllabus](../../SYLLABUS.md#module-26--docker--docker-compose-one-command-for-all-services) promises its full discussion in this module.

**Three ways to make a mold for another processor:**

| Way | What happens | Its price |
| :-- | :-- | :-- |
| A native ARM64 runner (`ubuntu-24.04-arm`) | two rented machines, each building for its own processor, then both results joined into one index | free for public repos, counts against a private repo's monthly quota; two jobs plus a joining step |
| QEMU **emulation** | one machine pretends to be another processor every time it runs a `RUN` | according to Docker's documentation, it can be much slower than building on the real processor; on Linux, the emulator is usually registered with the system (a change to the machine's settings) |
| **Cross-build** with `$BUILDPLATFORM` (**ours**) | every `RUN` runs on the builder's processor; the final stage per processor only copies | a few `Dockerfile` lines change; no emulator anywhere |

Picture a restaurant kitchen. The food (the JavaScript files in `node_modules` and the `dist/` folder) is the same for every guest, so it only needs cooking once, in the **kitchen** of the builder's processor; the only thing chosen per guest's processor is the **serving plate**, the final stage of the `Dockerfile`. In both `Dockerfile`s, the first stage now starts with `FROM --platform=$BUILDPLATFORM node:24.22.1-alpine3.24` (backend `AS packages`, web `AS build`). BuildKit (the build engine behind `docker build`) fills `$BUILDPLATFORM` with the processor of the building machine, `linux/amd64` on GitHub's robot. The final stage (Node for the backend, Caddy for the web) is taken in the target processor's variant, without a single `RUN`: only `COPY` and settings. The backend used to have `RUN mkdir … && chown …` in its final stage; now `mkdir` runs in the `packages` stage, and `chown` is replaced by `COPY --from=packages --chown=node:node` ([7.1](#71--two-cross-processor-dockerfiles-with-buildplatform-8-minutes)). Without a `RUN` in the final stage, no program of the other processor has to run, so no emulator is needed.

**Why it's safe.** The web build result (HTML, CSS, JavaScript) is the same for every processor anyway. The backend's production libraries are plain JavaScript too, except **bcrypt** (password fingerprints, Module 20), which carries **ready-made programs** for Alpine on x64 processors (another name for amd64) **and** arm64, then picks the matching one when the server starts. The author checked it on a Pi 5 (arm64): `npm ci --omit=dev` forced to pick packages as if on an x64 machine produced exactly the same `node_modules` as a plain `npm ci` on that Pi (6,201 files, 0 different), and the amd64 image built by the simulated robot holds a `node` program for amd64 and the x64 version of bcrypt.

![Diagram of one image for two processors (Concept 5): the Node stages run on the builder's processor ($BUILDPLATFORM), the final stage only copies, without emulation. 1, the kitchen on the builder's processor, only once: the robot's machine ubuntu-24.04 (amd64), $BUILDPLATFORM = linux/amd64. Backend, the packages stage: FROM --platform=$BUILDPLATFORM node:24.22.1-alpine3.24 AS packages, …, RUN npm ci --omit=dev, RUN mkdir -p /app/firmware-data. Web, the build stage: FROM --platform=$BUILDPLATFORM node:24.22.1-alpine3.24 AS build, …, RUN npm ci, COPY . ., ARG VITE_API_BASE=/api, RUN npm run build. Every RUN is here; its results (node_modules, dist/) are the same for every processor. An arrow, copied, to 2, serving plates per target processor, only COPY: linux/amd64 (VPS, most laptops) and linux/arm64 (Pi, Apple silicon Macs), each with backend FROM node:24.22.1-alpine3.24, COPY --from=packages (2×), 3 × COPY + USER node, and web FROM caddy:2.11.7-alpine, COPY --from=build; no RUN, no emulator; the base images (node, caddy) come in the target processor's variant. An arrow, pushed to the image shop: job build, platforms: linux/amd64,linux/arm64, on a push to main. 3, GHCR: one name, one index, compressed sizes in the author's lab: ghcr.io/account/mini-smart-home-backend:2.0.0 amd64 72.2 MB, arm64 72.0 MB; mini-smart-home-web:2.0.0 amd64 25.2 MB, arm64 24.0 MB; the tag 2.0.0 and sha + 7 characters point to the same index; it also holds 2 provenance notes (attestation, unknown/unknown), not a third image. An arrow, pulled, to 4, docker compose pull picks its own variant: the VPS (the center) amd64; the free-path Pi (the center on the Pi) arm64; a friend's laptop amd64 or arm64; staging on the robot's machine amd64; the main-path Pi = the gateway: the official Mosquitto image, both processors from its publisher. Bottom: bcrypt (passwords, Module 20) is the only package that isn't plain JavaScript: bcrypt@6.0.0 carries ready-made builds for linux-x64 and linux-arm64 (musl, for Alpine), picked at run time; the author's lab: on the arm64 Pi, npm ci with --cpu=x64 = the same files as a plain npm ci (6,201 files, 0 different). Other ways (Technical Deep Dive): a native ARM runner (ubuntu-24.04-arm), the indexes joined; QEMU emulation, much slower. The author's simulated robot (example): on a Pi 5 (arm64) it builds amd64 + arm64 without emulation; the arm64 image ran in staging and on the simulated VPS; the amd64 image checked, not run.](assets/one-image-two-processors.png)

**Proof in the shop.** `docker buildx imagetools inspect ghcr.io/<account>/mini-smart-home-backend:2.0.0` ([9.7](#97--the-ghcr-packages-become-public-pull-without-logging-in-two-processors-4-minutes)) lists `linux/amd64`, `linux/arm64`, and two `unknown/unknown` lines marked `attestation-manifest`. Those last two lines are **the build's provenance notes**, not a third image. Example compressed sizes in the author's lab (a local image shop standing in for GHCR): backend 72.18 MB (amd64) / 71.96 MB (arm64), web 25.23 / 23.99 MB. In the log of the job `build`, every `RUN` only appears for the builder's processor, while the final stage's `COPY` appears twice, `[linux/amd64 stage-1 …]` and `[linux/arm64 stage-1 …]` ([7.4](#74--commit-push-and-open-pr-b-build-builds-without-pushing-7-minutes)).

**Two traps.** (1) An old `Dockerfile` (without `$BUILDPLATFORM`) built with `--platform linux/amd64` by a builder without an emulator, for example Docker Engine on a Pi: BuildKit tries to **run** the other processor's `npm ci` and stops with `exec /bin/sh: exec format error` (the author's lab, the Module 28 `Dockerfile` on a Pi 5). (2) A builder that carries an emulator doesn't fail, but silently imitates the other processor: slow, and you don't notice. Docker Desktop carries one, and according to the author's research on 31 Oct, the builder started by `docker/setup-buildx-action` also brings its own emulator, so an old `Dockerfile` probably doesn't fail on GitHub's robot, it's just slow (not tried by the author on GitHub). The three ways are compared in [🔬](#-technical-deep-dive-optional), the fold *Three ways to two processors …*; the cure is in [🚨](#-troubleshooting) *`exec format error`, or the job `build` is very slow*.

**Honest.** The amd64 image has never been **run** by the author, the same as in [🔬 Module 26](../module-26-docker-compose/README.md#-technical-deep-dive-optional) (the fold *One image for two architectures …*): there's no amd64 machine in the lab, and emulation isn't used. Its content was checked, and the arm64 variant ran in the simulated staging, "VPS", and "Pi". On GitHub, the robot's machine is amd64, so staging ([Concept 9](#9-staging-vs-production-the-dress-rehearsal-vs-the-show)) starts the amd64 variant before your VPS does; the arm64 variant first starts on the free-path Pi, and the smoke test of `scripts/deploy.sh` there checks it. The Syllabus (v1.0.31) records this way in the Module 29 part: built without emulation on one runner, with a native ARM64 runner and QEMU as comparisons, and QEMU not required.

### 6. The image shop and the robot's permissions: `GITHUB_TOKEN`, `permissions`, Secrets, and Variables

In [Module 26's Practice 10](../module-26-docker-compose/README.md#practice-10--the-image-shop-ghcr-by-hand-35-minutes), you pushed images to GHCR by hand, with your own classic PAT stored on the laptop. The robot doesn't use your personal token. For every job, GitHub makes a **temporary robot token** of its own, named **`GITHUB_TOKEN`** (the [Syllabus](../../SYLLABUS.md#module-26--docker--docker-compose-one-command-for-all-services) promises automatic GHCR in this module). What that token may do is written in `ci.yml`, in the `permissions` section, and according to GitHub's documentation, a permission that isn't named means none. The principle: **as few permissions as possible, per job**.

| Job | The robot's token permissions | What for |
| :-- | :-- | :-- |
| the default (the head of `ci.yml`): `verify`, `test` | `contents: read` | reading the repo's content; a job that writes its own `permissions` only uses its own list |
| `build` | `contents: read`, `packages: write` | pushing images to GHCR |
| `staging` | `contents: read`, `packages: read` | pulling the images just pushed, also while the package is still private |
| `tag-release` | `contents: write` | the only job that writes to the repo: making the release tag |
| `deploy-vps` | `{}` | needs no GitHub token at all |

Where each job sits on the assembly line is in the picture of [Concept 3](#3-ci-a-robot-that-reads-exit-codes).

**Two names for one mold.** Every push from `build` ([7.3](#73--stage-b2-the-job-build-for-linuxamd64-and-linuxarm64-8-minutes)) gets two tags pointing to the same index: the version number (`2.0.0`, written in `compose.cloud.yml`) and `sha-<7 characters>`, the first seven characters of the commit that built it (a trace of "which commit this mold comes from"). The shop name is `ghcr.io/${GITHUB_REPOSITORY_OWNER,,}`: the `,,` turns your account name into lowercase, because GHCR refuses capitals (Module 26: the account `Budi-Santoso` is written `ghcr.io/budi-santoso`). Before building, the step `already in the registry? (a version tag is never overwritten)` checks whether that version is already in the shop; if it is, nothing is built or pushed again. The content behind `2.0.0` never changes, following Module 26's "exact tag" rule.

**Nothing is pushed from a pull request.** In a PR, `build` only tries the build: the code isn't merged yet, and because a version tag in the shop is never overwritten, a push from a PR would lock that version number with content that isn't final. According to GitHub's documentation, a PR from a fork (someone else's copy of the repo) only gets a read token, and **Secrets** aren't sent to it: a stranger who opens a PR can't write to your packages or read your secrets. Another trigger, `pull_request_target`, runs the workflow with your repo's rights for anyone's PR, and GitHub's documentation warns that untrusted code with that trigger can open a security hole. `ci.yml` doesn't use it, and neither should you.

**Private first, public forever** ([Module 26's Concept 11](../module-26-docker-compose/README.md#11-the-image-shop-ghcr-and-architecture)). A new GHCR package can be private even when your repo is public (GitHub's documentation isn't consistent: the default is private, but a package made by `GITHUB_TOKEN` is said to inherit the repo's visibility; not tested by the author); that's why `staging` logs in to GHCR with the `packages: read` permission. The VPS and the Pi pull **without logging in**, so you make a still-private package public once, by hand: **Package settings** → **Change visibility** ([9.7](#97--the-ghcr-packages-become-public-pull-without-logging-in-two-processors-4-minutes)). This step is one-way: a public package can't be made private again. It only holds your public repo's files plus npm libraries, because secrets never go into Git (Modules 20 and 26); if in doubt, check first with `docker history --no-trunc`.

**The `source` label links a package to its repo.** The robot attaches the label `org.opencontainers.image.source` holding your repo's address (`labels:` in `ci.yml`, overriding the line `LABEL … <account>` in the `Dockerfile`). According to GitHub's documentation, a linked package inherits its repo's access permissions (not its visibility), so that repo's workflows may write to it. A package you pushed by hand in Module 26 without a link can refuse the robot with `denied` ([🚨](#-troubleshooting) *Pushing to GHCR refused …*; not tried by the author on real GHCR).

**Secrets versus Variables.** **Settings** → **Secrets and variables** → **Actions** has two drawers ([10.6](#106--secrets-and-variables-on-github-vps_ssh_key-vps_host-and-vps_known_hosts-8-minutes)). **Secrets** are for secrets: their contents are masked as `***` in the log. **Variables** are for settings that aren't secret: their contents can be read in the log. Besides `GITHUB_TOKEN`, which GitHub makes itself, our robot needs only one secret, `VPS_SSH_KEY` (the robot key, Concept 7). `VPS_HOST`, `VPS_USER`, and `VPS_KNOWN_HOSTS` only need **Variables**: the VPS address is public through DNS anyway, and a host key fingerprint isn't a secret. A public repo means anyone can read the robot's log, so never print a secret with `echo` or turn on `set -x` in a step that holds a secret ([Module 20's Concept 11](../../phase-3-backend-data/module-20-user-security/README.md#11-secrets-and-privacy-what-must-not-leak)).

**Major tags versus pinning a SHA.** `uses: actions/checkout@v7` uses the major tag `v7`, which follows its publisher's newest v7 release. GitHub's documentation recommends pinning an action to its full commit SHA, which can't be moved. The curriculum chooses major tags, only from official publishers (`actions/…` and `docker/…`), so that beginners can read them; the price of that choice and how to pin are in [🔬](#-technical-deep-dive-optional), the fold *Pinning SHAs, Dependabot, and `actions.lock` …*.

> ⬆️ **Done reading Concepts 5–6?** Continue to [Practice 7](#practice-7--one-image-two-processors-pushed-to-ghcr-by-the-robot-35-minutes): one image for two processors, pushed to GHCR by the robot. Haven't done [Practice 6](#practice-6--one-version-number-200-the-version-guard-changelogmd-and-the-version-on-screen-30-minutes) yet? Read [Concept 10](#10-semver-changelog-and-tags-one-number-then-forward-to-go-back) and do Practice 6 first: the 2.0.0 images need their version number.

### 7. Push vs pull: the robot knocks on the VPS, the Pi asks by itself

After the robot makes a release tag, two production machines must learn that there's a new version. The way differs, because the two sit in different places ([Module 27's Concept 1](../module-27-deploy-internet-tls-pwa/README.md#1-from-home-to-the-internet-three-doors-two-paths)):

- **The VPS has a public address** (`203.0.113.10`) and SSH door 22. The robot can **knock**: the job `deploy-vps` logs in over SSH as `house` and tells the VPS to deploy that release. This is **push**.
- **The Pi lives behind the home router**, without port forwarding. Nobody can knock on it from the internet, GitHub included. So **the Pi asks by itself** every 15 minutes with an alarm clock ([Concept 8](#8-a-systemd-timer-an-alarm-clock-for-the-module-12-security-guard)): `git fetch --tags` to GitHub, then, only when there's a new release, `docker compose pull` (the official Mosquitto image; on the free path also the backend and web from GHCR). Both are **outgoing** connections, like the bridge and `cloudflared` in Module 27, and need no account, because the repo and its packages are public. This is **pull**.

The [Syllabus](../../SYLLABUS.md#module-29--testing--cicd-every-change-tested-and-deployed-automatically) names both in this module's concepts: deploy to the VPS over SSH, and GitHub that can't "reach" a Pi at home.

**The robot key: a second key that opens only one door.** The robot needs an SSH key, but **not** your own key ([Module 27's Concept 3](../module-27-deploy-internet-tls-pwa/README.md#3-ssh-keys-and-a-regular-user-password-login-and-root-turned-off)). You make a new ed25519 key pair only for the robot ([10.2](#102--the-robot-key-on-the-laptop-sshrobot_house-without-a-passphrase-5-minutes)). Its private part only leaves your laptop to go into the **Secrets** `VPS_SSH_KEY`; its public part is written in `house`'s `~/.ssh/authorized_keys`, with a restricting prefix ([10.3](#103--the-robot-keys-line-in-the-vps-authorized_keys-restrict-and-command-written-by-hand-6-minutes)):

```text
restrict,command="sh /home/house/mini-smart-home/scripts/deploy.sh" ssh-ed25519 AAAA… robot-deploy
```

- `command="…"`: whatever command is sent with this key, the VPS only runs `deploy.sh`.
- `restrict`: no terminal, and no tunnels (`ssh -L` refused).

This key deliberately has no passphrase, because the robot can't type; its protection is **Secrets** and that prefix. You write the line yourself, because `ssh-copy-id` adds a key **without** the prefix, and a key without the prefix is as powerful as your own key. In the author's lab (real SSH into a container standing in for the VPS), a `whoami` sent with the robot key was answered by the `deploy.sh` report (`… v2.0.0 already deployed (center): no new release`), not `house`, and `ssh -L` was refused with `administratively prohibited` (in the Indonesian edition's lab) ([10.4](#104--test-the-restriction-whoami-is-answered-by-deploysh-not-house-4-minutes)).

**The marker: forgetting the restriction = red, not a false green.** The job `deploy-vps` doesn't send a real command. The last word of its `ssh` command is a **marker**, `robot-key-not-restricted-by-command`. With `command=`, the VPS ignores it and runs `deploy.sh`; the robot then reads its report and is only green when that report names this release's version `deployed` or `already deployed` ([9.2](#92--stage-b4-part-2-the-job-deploy-vps-still-asleep-5-minutes)). Without `command=`, the VPS tries to run that word as a command, and the job turns red with `bash: line 1: robot-key-not-restricted-by-command: command not found` (the author's lab: exit code 127; with the restriction, 0).

**A human matches the VPS fingerprint.** The robot only logs in to a machine whose key fingerprint matches the **Variables** `VPS_KNOWN_HOSTS`, the `ssh-keyscan` line you matched yourself with `ssh-keygen -lf` on the VPS ([10.5](#105--the-vps-fingerprint-ssh-keyscan-matched-with-ssh-keygen--lf-6-minutes)), like the first SSH greeting in Module 27. `ci.yml` writes `StrictHostKeyChecking=yes`. Instructions on the internet that use `StrictHostKeyChecking=no` make the robot log in to any machine that claims to be your VPS, then trust its fake report. A fingerprint that doesn't match ends with `Host key verification failed.` (the author's lab: exit code 255).

**Door 22 stays open to the internet**, as in Module 27's ufw rule. The addresses of GitHub's robot machines keep changing, and GitHub's documentation doesn't recommend using their list as an allow list; the `from="…"` prefix (a list of addresses allowed to use the key) in `authorized_keys` isn't practical either. Locking door 22 to your home address means the robot can't get in ([🚨](#-troubleshooting) *`the VPS didn't report v… deployed`, or the robot can't get in on port 22*). Its guard stays the Module 27 habit: keys only, password login and root turned off.

**Honest: the `docker` group is root-like.** Docker's documentation says it plainly: "The `docker` group grants root-level privileges to the user." The user `house` is a member of that group. A leaked robot key can only call `deploy.sh`, and `deploy.sh` only deploys releases tagged by the robot on `main`, but a hole in that script is a hole with root rights. That's why you read the script in full in [9.3](#93--a-one-script-deployer-scriptsdeploysh-and-two-unit-files-7-minutes), and its content only changes through a pull request.

**Why doesn't the VPS pull too?** It could (not tested by the author): the script is the same, you'd only add an alarm clock on the VPS, then empty `VPS_HOST` so the alarm clock and the robot don't run `deploy.sh` at the same time. Push was chosen because the Syllabus asks for deploying over SSH, and because the robot knows the result at once: a failed deployment makes `deploy-vps` red on the **Actions** tab, then it's repeated with **Re-run failed jobs**. A Pi that failed retries by itself on the next round, and you read the result in its journal ([Practice 11](#practice-11--the-pi-updates-itself-a-systemd-alarm-clock-40-minutes)). On the free path, `VPS_HOST` stays empty: `deploy-vps` is skipped, and the Pi pulls the center and the gateway. Without a Pi, there's only push.

One sentence to remember: **"without you SSHing in" ≠ "without SSH"**. The robot still logs in to the VPS over SSH, with a key that can only run one script; all that's gone is your SSH terminal.

![Diagram of push to the VPS, pull from the Pi (Concept 7): the VPS has a public address, the robot knocks over SSH; the Pi is behind the home router, it asks by itself. Left, GitHub (public repo). The robot, job deploy-vps: Secrets VPS_SSH_KEY = the robot's private key; Variables VPS_HOST, VPS_USER (empty = house), VPS_KNOWN_HOSTS (the VPS fingerprint); ssh -T, BatchMode=yes: no terminal, no password; StrictHostKeyChecking=yes: a fake VPS is refused; the last word = the marker robot-key-not-restricted-by-command; it runs after tag-release makes the tag. Why the robot key is restricted: a docker group member = root-like; without command= (for example ssh-copy-id) this key = the house key; because of the marker, the VPS answers command not found, the job red. Release tags on main: v2.0.0, v2.0.1, … made only by the robot after a green staging; git fetch without an account. GHCR: backend + web images, public packages. The PUSH arrow (the robot starts it; without you SSHing in is not without SSH) to the VPS: example 203.0.113.10, SSH on door 22 (Module 27), the user house; ~/.ssh/authorized_keys, a second key opening one door, one line: restrict,command=sh /home/house/mini-smart-home/scripts/deploy.sh (in quotes) ssh-ed25519 AAAA… robot-deploy; command=: whatever the command, only deploy.sh runs; restrict: no terminal, no tunnel (ssh -L refused); deploy.sh (center): the latest tag, pull from GHCR, up --no-build; the report must name that version deployed. Home, a router without port forwarding: GitHub cannot knock on the Pi (a red crossed line). The gateway Pi (DEPLOY_PARTS=gateway), its alarm clock every 15 minutes: 1 git fetch --tags; 2 git merge --ff-only, only forward; 3 docker compose pull: the official Mosquitto image; free path + backend and web from GHCR; 4 up -d --no-build --wait, check for Restarting; 5 the journal: v2.0.0 to v2.0.1 deployed. Dashed PULL arrows (the Pi starts them): a new tag, images (free path). The table: who starts, the robot vs the alarm clock; when, minutes after the merge vs every 15 minutes + random ≤ 1 minute, at most ±17 minutes after the tag + the pull; needs, a public address, SSH, a restricted key, the VPS fingerprint vs only outgoing internet, a public repo; failing, the job red, Re-run failed jobs vs the next round tries again. The author's lab: real SSH into a simulated VPS (a container): with command= exit 0; without, command not found, 127; a different fingerprint: Host key verification failed., 255.](assets/push-vs-pull.png)

### 8. A systemd timer: an alarm clock for the Module 12 security guard

In [Module 12's Concept 7](../../phase-2-connectivity/module-12-raspberry-pi-and-linux/README.md#7-services-and-systemd-a-security-guard-who-never-sleeps), systemd is **the security guard who never sleeps**: it starts services, wakes the ones that fall over, and writes everything in the journal. That guard also has **alarm clocks**: `.timer` units, which wake a `.service` on a schedule. In [🔁 Step 5](#step-5--github-and-the-pi-a-public-repo-the-module-26-ghcr-packages-and-systemctl-list-timers), `systemctl list-timers` already showed the system's built-in alarm clocks. This week we add one pair, in the folder `scripts/systemd/`:

- **`smarthome-update.service`** = the task. `Type=oneshot` means **a guard who does one round, then sits down again**: it runs `/bin/sh /home/budi/mini-smart-home/scripts/deploy.sh` to the end, then stops, unlike Mosquitto, which keeps running. It runs as `User=budi` (a regular user in the `docker` group, not root), with `Environment=DEPLOY_PARTS=gateway` (the main-path Pi; the free path `Environment="DEPLOY_PARTS=center gateway"`).
- **`smarthome-update.timer`** = the schedule: `OnBootSec=5min` (5 minutes after the Pi starts, when the network and Docker are ready), `OnUnitActiveSec=15min` (15 minutes after the previous round **started**, also when that round failed), and `RandomizedDelaySec=60` (a random 0–60 seconds extra, so many Pis don't ask GitHub and GHCR in the same second).

As a result, a new release is usually deployed on the Pi **at most ±17 minutes** after the robot makes its tag (15 minutes + up to 1 minute random + up to 1 minute of the alarm clock's accuracy), plus the time to pull the images. A comparison you'll often meet, `OnCalendar=` (wall-clock time, for example every quarter hour), can be paired with `Persistent=true` to catch up on a round missed while the Pi was off; according to the systemd documentation, `Persistent=` only applies to `OnCalendar=`. A schedule of "after starting, then every 15 minutes" needs neither. You read the next schedule with `systemctl list-timers smarthome-update.timer`, and each round's notes with `journalctl -u smarthome-update.service -n 30` (remember Module 12: on Raspberry Pi OS, the journal is lost when the Pi restarts).

**Why Git first, then `docker compose pull`.** The [Syllabus](../../SYLLABUS.md#3-technology-choices--why-we-made-them) describes the Pi's update as a timer that runs `docker compose pull && up -d`. The problem: `compose.cloud.yml` and `edge/compose.edge.yml` write exact tags, for example `…-backend:2.0.0`, without `latest` ([Module 26's Concept 2](../module-26-docker-compose/README.md#2-a-mold-in-layers-image-tag-digest-and-architecture)). `docker compose pull` alone only pulls `2.0.0` again; it never learns that `2.0.1` exists. The new number comes through Git, because `compose.cloud.yml` in release 2.0.1 says `2.0.1`. So the order is: get the latest **release** from Git, then `docker compose pull && up -d`. The Syllabus (v1.0.31) records this wording: a *systemd timer* that fetches the latest release from Git (the *tag* `v<version>`), then runs `docker compose pull && up -d`. Why a channel tag like `:production` isn't used is in [🔬](#-technical-deep-dive-optional), the fold *A channel tag `:production` versus a Git tag …*.

**A release = a `v<version>` tag made by the robot.** The robot only makes a tag after that version's images are on GHCR and staging passed ([Concept 10](#10-semver-changelog-and-tags-one-number-then-forward-to-go-back)). The VPS and the Pi only deploy that **tagged release**, so the Pi never waits for images that don't exist yet, and never deploys an untested commit. The old "follow `main`" pattern (just `git pull`) doesn't work like that: in the author's research on 31 Oct (a simulated scheduler every minute), the Pi failed 3–5 rounds in a row after every merge, because the Compose file with the new tag arrived before its images.

**One round of `scripts/deploy.sh`** (the same script as on the VPS; you read the file in full in [9.3](#93--a-one-script-deployer-scriptsdeploysh-and-two-unit-files-7-minutes)):

1. Stop when run with `sudo` or as root, when the repo copy isn't on `main`, or when a file was edited directly on that machine.
2. `git fetch --tags`, then take the latest release tag that's on GitHub's `main`. The same as the record `.git/smarthome-deployed`? Done without touching Docker: `v2.0.1 already deployed (gateway): no new release`.
3. `git merge --ff-only` to that tag (only straight forward); the version number in `backend/package.json` must equal its tag.
4. `docker compose pull`, then `docker compose up -d --no-build --wait`: a production machine never builds images.
5. Restart the broker (at the center, Grafana too) **once per release**, and only when the configuration it reads straight from the repo changed, for example `gateway.conf` or `acl-broker`. A restart, not a HUP: at the gateway, a HUP throws away the store-and-forward queue (Module 27).
6. Wait 15 seconds and make sure no service is `Restarting` (at the center: the smoke test, [Concept 9](#9-staging-vs-production-the-dress-rehearsal-vs-the-show)), then record it, for example `v2.0.0 -> v2.0.1 deployed (gateway)`. A service that only crashes after running ±10 seconds can slip through; a monitor that keeps watch comes in Module 30.

Failing at any step means stopping with a `FAIL:` message and exit code 1, then the next round tries again. When it fails after the `merge` but before `up` (for example the images can't be pulled yet), the old containers keep running, but the repo copy is already on the new release, so files read straight from the repo (for example the Grafana dashboards) may already have changed. This script never runs `down -v`, `prune`, or `git reset --hard`.

![Diagram of the Pi's alarm clock, one deploy round (Concept 8): the systemd security guard (Module 12) woken by an alarm clock; scripts/deploy.sh, part gateway (the main-path Pi). Top left, smarthome-update.timer: OnBootSec=5min, OnUnitActiveSec=15min, RandomizedDelaySec=60: 5 minutes after the Pi starts, then 15 minutes after the previous round started (also when it failed), + a random 0–60 seconds; a new release is deployed at most ±17 minutes after the tag, + the pull. It wakes smarthome-update.service: Type=oneshot, User=budi, Environment=DEPLOY_PARTS=gateway, ExecStart=/bin/sh /home/budi/mini-smart-home/scripts/deploy.sh, TimeoutStartSec=15min; budi in the docker group, not root; the free path DEPLOY_PARTS=center gateway. Ten steps, journal texts on the right: 1 not root, else FAIL: do not run this with sudo; 2 on main without edits, else FAIL: files were edited directly; 3 git fetch --tags origin, else FAIL: cannot fetch tags from GitHub; 4 the latest release tag on main (git tag --list --merged origin/main --sort=-v:refname): the same as the record = v2.0.1 already deployed (gateway): no new release, Docker not touched; no tag yet = no release; 5 git merge --ff-only v2.0.1^{commit}, only forward, the package.json version = the tag, else FAIL: cannot fast-forward, or another version; 6 the edge folder: docker compose pull --quiet, the official Mosquitto image, else FAIL: the gateway image cannot be pulled yet, the old containers keep running; 7 up -d --no-build --wait, else FAIL: the gateway failed to start; 8 gateway.conf or acl-broker changed: restart mosquitto, once per release, not HUP; 9 wait 15 seconds, anything Restarting: FAIL: the gateway broker keeps crashing; 10 record .git/smarthome-deployed, the journal line v2.0.0 to v2.0.1 deployed. FAIL at any step: exit code 1, again 15 minutes later; never down -v, prune, git reset --hard. The center part (VPS, free-path Pi): pull, up, restart mosquitto or grafana when their configuration changed, then the smoke test (image, /health version and database, the dashboard through Caddy). Reading the result: systemctl list-timers smarthome-update.timer; journalctl -u smarthome-update.service -n 30. Honest limits: a broker that only crashes after ±10 seconds can slip through (a monitor = Module 30); the Indonesian edition's lab: a simulated gateway, 4 releases, 2.0.0 by hand, 2.0.1, 2.0.2, 2.0.4 woken by a simulated scheduler every ±1 minute (not systemd), the units only checked by systemd-analyze verify (systemd 259); this edition: the ExecStart round run by hand.](assets/pi-timer-flow.png)

**The gateway has no self-built image** ([Module 26's Concept 10](../module-26-docker-compose/README.md#10-two-files-until-the-end-the-center-and-the-gateway)). On the main-path Pi, what's updated is the official Mosquitto image with the exact tag in `edge/compose.edge.yml` and the broker configuration from the `edge/` folder. This is the promise of [6.4 of Module 26](../module-26-docker-compose/README.md#64--pi-match-the-acl-copy-the-old-password-file-into-the-gateways-cupboard-then-turn-off-the-apt-broker-10-minutes): the `git pull` + `docker compose restart mosquitto` flow you used to do by hand ("automatic updates wait for Module 29") is now done by the script. `edge/.env` and `edge/bridge/center.conf` hold secrets and aren't in Git, so they stay manual. The free-path Pi runs the part `center gateway`: the arm64 variant of the backend and web images from GHCR, plus the gateway.

**Why not Watchtower.** Watchtower, a popular program that updates containers when their image changes, was archived by its owner on 17 Dec 2025 (the Syllabus records it). Besides, it only looks at images, not the `edge/` configuration, and with exact tags it never sees a new version.

**Honest.** The author didn't run a real systemd alarm clock. In the Indonesian edition's lab, both unit files passed `systemd-analyze verify` (systemd 259), and the `gateway` rounds of `deploy.sh` ran with real Docker on a simulated "Pi": release 2.0.0 by hand, the later releases woken by a simulated scheduler every ±1 minute, not systemd. This edition's lab ran the unit's `ExecStart` by hand on a Compose project standing in for the gateway (2.0.0, 2.0.1, and 2.0.2) and checked the unit files only for their structure. The shape of the `list-timers` and `journalctl` output in [11.4](#114--turn-on-the-alarm-clock-enable---now-and-list-timers-5-minutes) and [11.5](#115--one-round-now-systemctl-start-then-read-journalctl-8-minutes) follows the systemd documentation. Installing copies of the units is in [11.2](#112--two-unit-files-in-etcsystemdsystem-adjust-the-copies-not-the-repo-files-8-minutes), and a schedule every 5 minutes through a drop-in in [🧩 Level 1](#level-1--the-pi-asks-every-5-minutes-a-drop-in-for-the-alarm-clock-a-small-change-20-minutes).

> ⬆️ **Done reading Concepts 7–8?** Continue to [Practice 9](#practice-9--the-first-release-200-a-tag-by-the-robot-a-one-script-deployer-and-public-packages-35-minutes) (the first release and `scripts/deploy.sh`), then [Practice 10](#practice-10--the-vps-switches-to-pulling-a-robot-key-that-can-only-run-one-script-45-minutes) (the VPS) and [Practice 11](#practice-11--the-pi-updates-itself-a-systemd-alarm-clock-40-minutes) (the Pi). Haven't done [Practice 8](#practice-8--throw-away-staging-on-the-robots-machine-25-minutes) yet? Read [Concept 9](#9-staging-vs-production-the-dress-rehearsal-vs-the-show) and do Practice 8 first.

### 9. Staging vs production: the dress rehearsal vs the show

Before the show, theater actors go through a **dress rehearsal**: exactly the same stage, costumes, lights, and order of scenes, but without an audience. A light that goes out during the rehearsal is only noticed by the crew, and there's still time to fix it. In software, the dress rehearsal is called **staging**: the new version is started complete with fake data before it touches **production**, the **show**: your VPS (the main path) or your Pi (the free path), with your home's accounts, devices, and history. The [Syllabus](../../SYLLABUS.md#module-29--testing--cicd-every-change-tested-and-deployed-automatically) pairs the two in this module's concepts. Staging here isn't the Let's Encrypt practice CA, which its documentation also calls staging ([Module 27's Concept 6](../module-27-deploy-internet-tls-pwa/README.md#6-certificates-in-full-chain-name-and-dates)).

**The rehearsal is on the robot's machine.** A 2 GB VPS only fits one center ([Syllabus §5.5](../../SYLLABUS.md#55-service-costs-phase-5): even 1 GB isn't enough for the database, Grafana, and the API), and [Module 26's Concept 10](../module-26-docker-compose/README.md#10-two-files-until-the-end-the-center-and-the-gateway) decided against a third Compose file. That's why the dress rehearsal is run by the job `staging` on the robot's rented machine, which is thrown away after its job anyway:

| | The dress rehearsal (staging) | The show (production) |
| :-- | :-- | :-- |
| Machine | the robot's rented machine (amd64), thrown away afterwards | the VPS or the Pi, always on |
| Compose file | `compose.cloud.yml` | the same `compose.cloud.yml` |
| Images | the ones the job `build` just pushed to GHCR | the same tagged release, pulled |
| Data | an empty database, migrations `001`–`011` from zero | your home's accounts, devices, and history |
| Secrets | a `.env` with random secrets that are never printed | your own `.env` |
| Release tag | made only when the rehearsal passed | only tagged releases are deployed |

You paste the job's content in [8.2](#82--stage-b3-the-job-staging-with-random-secrets-and-empty-cupboards-10-minutes). In short: a `.env` holding `COMPOSE_FILE`, `IMAGE_REGISTRY`, and six required secrets made at random with the recipe at the head of `.env.example` (readable only by its owner, `umask 077`; Telegram and the domain empty); two empty cupboards from `docker volume create`; then `docker compose pull --quiet` and `docker compose up -d --no-build --wait --wait-timeout 300`, exactly as on the VPS and the Pi. The robot logs in to GHCR with the `packages: read` permission ([Concept 6](#6-the-image-shop-and-the-robots-permissions-github_token-permissions-secrets-and-variables)), because a newly made package is still private. When something fails, the last step prints `docker compose ps -a` and the last 40 log lines of every service (this step fails too when the Compose file can't be read); that log is public, but the random secrets are never printed. No `down -v` is needed: the whole machine is thrown away with its contents.

`staging` only runs on a push to `main` that brings a new version (the output `new-release` = `yes` from the job `build`). In a pull request, the images haven't been pushed anywhere yet, so your first rehearsal only comes in [9.5](#95--merge-pr-b-the-robot-pushes-the-200-images-staging-passes-the-tag-is-made-8-minutes). A merge that only changes documents doesn't start `staging`, doesn't make a tag, and doesn't knock on the VPS.

**The smoke test.** The rehearsal ends with a **smoke test**, a term from electronics: switch the circuit on first, see whether there's smoke, then check the details. `scripts/smoke-test.sh` only reads, doesn't start or stop anything, and checks four things ([8.1](#81--the-smoke-test-scriptssmoke-testsh-four-checks-that-only-read-6-minutes)):

1. After 15 seconds, no service keeps crashing (`Restarting`). This check is needed because `up --wait` can only wait for services that have a healthcheck: a Mosquitto or Caddy that keeps crashing is still written `Healthy` (the author's lab).
2. `backend` and `web` run images tagged with that version.
3. `/health`, asked from inside the backend container, names that `version` and `"database":true`.
4. The dashboard and `/api/health` answer through Caddy.

Exit code `0` means all four passed. `scripts/deploy.sh` runs the same script after deploying on the VPS and on the free-path Pi. Its limit: a service that only crashes after running ±10 seconds can slip through, because Docker starts it again right away; a monitor that keeps watch comes in Module 30.

**Red in the rehearsal never reaches the show.** The ladder is `build` → `staging` → `tag-release` → `deploy-vps` and the Pi's alarm clock (the map in [Concept 3](#3-ci-a-robot-that-reads-exit-codes)). The release tag is only made after `staging` passes, while the VPS and the Pi only deploy tagged releases. In the Indonesian edition's lab (simulated robot), the practice release 2.0.5 deliberately carried a mistyped `listener` line in the center's broker configuration. All its PR checks were green: the tests and the version guard don't read the content of the broker configuration. After the merge, `up --wait` still wrote `Healthy` for Mosquitto, but the smoke test stopped with `FAIL  services keep crashing (Restarting): mosquitto -> docker compose logs <service>`. `tag-release` and `deploy-vps` were skipped, the simulated "VPS" and "Pi" stayed on release 2.0.4, and the 2.0.5 images were left in the shop without a Git tag, never deployed. This edition's lab repeated the staging part (`listener_mistyped 1883` in `edge/center.conf`, on a lab branch): the same `FAIL` line, no tag ([8.3](#83--what-staging-catches-a-mistyped-broker-no-tag-the-vps-and-the-pi-untouched-5-minutes)).

**What only the rehearsal catches** are mistakes outside the program code, which no test touches: a typo in `compose.cloud.yml`, a forgotten new required setting, a `Dockerfile` that forgot to copy a file, or a wrong broker configuration. The migrations also run again on an empty database, this time from inside the image that will be deployed. A new required setting was tried on the simulated robot too (the Indonesian edition's lab, practice release 2.0.3): one required setting added to `compose.cloud.yml` without adding it to the job `staging`. The PR checks stayed green, then `staging` turned red in 7 seconds with `required variable DASHBOARD_GREETING is missing a value`, an error you know from Module 26. That's why a new required setting is always written in two places: the production machine's `.env` and the `.env` step of the job `staging`. The price of this design: such a mistake only shows after the merge, so `main` already holds it. Only its release is never deployed, and the fix comes through the next PR with a version that goes up again.

**Honest.** GitHub's robot machine is amd64, so `staging` only starts the amd64 variant; the arm64 variant is checked by the smoke test of `scripts/deploy.sh` on the free-path Pi (Concept 5). Every `staging` on GitHub pulls ±1.14 GB of images (TimescaleDB, Grafana, Mosquitto, backend, and web), and how long that takes on GitHub isn't measured by the author. In the Indonesian edition's lab, the job `staging` finished in 51–75 seconds: the numbers of a simulated robot on one Raspberry Pi 5 with the base images loaded locally, not GitHub's.

**A human approval before the show?** GitHub also has environments, named environments like `production` that can hold a job until a reviewer you appoint approves it. According to GitHub's documentation, on a free account required reviewers are only available for public repos. This module doesn't use them, because its gate is `staging` and the tag; trying it with a friend is one of the choices of [🧩 Level 3](#level-3--pick-one-the-vps-as-a-canary-an-approval-before-production-or-automatic-github-releases-from-scratch-60-minutes). The Syllabus (v1.0.31) records this rehearsal in Module 29's core concepts: *staging* (throw-away, on the robot's machine) vs. *production*.

> ⬆️ **Done reading Concept 9?** Continue to [Practice 8](#practice-8--throw-away-staging-on-the-robots-machine-25-minutes): throw-away staging on the robot's machine. After it, read [Concept 7](#7-push-vs-pull-the-robot-knocks-on-the-vps-the-pi-asks-by-itself) and [Concept 8](#8-a-systemd-timer-an-alarm-clock-for-the-module-12-security-guard) before [Practice 9](#practice-9--the-first-release-200-a-tag-by-the-robot-a-one-script-deployer-and-public-packages-35-minutes).

### 10. SemVer, `CHANGELOG`, and tags: one number, then forward to go back

[Module 25's Concept 9](../../phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md#9-a-location-is-device-data-an-api-not-something-stuck-on-the-screen) used the SemVer pattern with the promise "covered fully in Module 29", and [Module 28's Concept 5](../module-28-ota-provisioning-fleet/README.md#5-versions-and-semver-firmware_version-fw-and-the-release-list-manifest) postponed SemVer for the whole project, a `CHANGELOG`, and version tags to here. The [Syllabus](../../SYLLABUS.md#module-29--testing--cicd-every-change-tested-and-deployed-automatically) asks for "SemVer & a `CHANGELOG`" and "a `CHANGELOG` & the first version *tag*". Until Module 28, the numbers backend 1.5.0 and dashboard 1.4.0 were written by hand in four places or more, without a checker, a `CHANGELOG`, or tags.

**Three numbers.** SemVer (Semantic Versioning) writes a version as MAJOR.MINOR.PATCH (the same spelling as in Modules 25 and 28). The number that goes up tells old users how big the change is:

| Number | Goes up when | In this project |
| :-- | :-- | :-- |
| PATCH (the third) | a small fix, the rest stays | 2.0.0 → 2.0.1: one text on the **Login** screen ([12.2](#122--version-201-patch-in-10-places-and-a-changelogmd-entry-5-minutes)) |
| MINOR (the second) | a new feature, the old way still works | later, for example 2.0.2 → 2.1.0 |
| MAJOR (the first) | old users are forced to change too | backend 1.5.0 and dashboard 1.4.0 → 2.0.0 |

**Who are a server's old users?** The original SemVer rule talks about an API: MAJOR goes up when programs that use that API must change. Your home's API hardly changes this week: still 30 paths, and `/health` only gains `version` ([Concept 2](#2-what-a-mock-cant-see-integration-tests-with-a-test-database)). But a server is also used by the person who deploys it, you, and **the way of deploying** changes: the VPS and the free-path Pi no longer build images but pull the images the robot built; the Pi deploys by itself with an alarm clock; and `main` is guarded by a branch rule. That's why the number is 2.0.0.

**One number for the server.** The backend and the dashboard now always have the same number, and that same number is written in the three `image:` lines in `compose.cloud.yml`, in the top release entry of `CHANGELOG.md`, and in the Git tag `v2.0.0`; from outside, it can be read at `/api/health` and under the title of the **Login** screen. You only need to remember one number, for example "Mini Smart Home 2.0.1". The price is small: in PR C only one dashboard text changes, but the backend goes up to 2.0.1 too, and the robot rebuilds both images. The firmware of Node 1 (1.7.x) and Node 2 (1.0.0), `DATA-CONTRACT.md` 1.6, and `PIN-MAP.md` version 7 keep their own numbers: each changes on its own schedule, and the firmware has had its SemVer rule since Module 28 (`fw`).

**The version guard: what gets deployed changes = the version goes up.** `scripts/check-version.mjs` checks that number in 10 places: the two `package.json` files, two places in each `package-lock.json`, the three `image:` lines, and the top entry of `CHANGELOG.md` ([6.4](#64--the-version-guard-scriptscheck-versionmjs-one-number-in-10-places-only-allowed-to-go-up-5-minutes)). On every pull request, it also compares your branch with `origin/main`: when anything **deployed** on the VPS or the Pi changed, the version must go up. Deployed = the content of the backend and web images, `compose.cloud.yml`, the broker configuration in `edge/`, `grafana/provisioning/`, `grafana/dashboards/`, `grafana/grafana-user.sql`, and `scripts/*.sh`; documents (`*.md`), tests, Bruno, and the robot's files in `.github/` aren't. The reason: the robot only makes a release for a number that has never been released, and the VPS and the Pi only deploy releases. Without this guard, a change whose version you forgot to raise never reaches production, and no error message tells you.

The number also never goes down. Pre-release numbers like `2.1.0-rc.1`, which are valid in SemVer, are refused with the message `isn't MAJOR.MINOR.PATCH with numbers only`, because in this project every number becomes a deployed release at once. In SemVer, versions `0.y.z` mark the early development phase; the backend has been 1.0.0 since [Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#82-backend-v100-7-minutes). You can write the "the version must go up" part of this guard yourself in [🧩 Level 2](#level-2--the-version-guard-the-empty-the-version-must-go-up-part-fill-in-the-blanks-30-minutes).

**`CHANGELOG.md`: a notebook of changes for humans.** The commit history (`git log`) is written for developers, step by step. `CHANGELOG.md` is written for the people who deploy and use it, with one question: what changed for me in this version? Its form follows Keep a Changelog 1.1.0 (its principle: "Changelogs are *for humans*, not machines."), with the English type names of Keep a Changelog 1.1.0: Added, Changed, Deprecated, Removed, Fixed, and Security. The newest is at the top. At the very top is always `## [Unreleased]`, the place for notes already in `main` but not yet part of any release (for example tests or documents). Below it comes one section per release, for example `## [2.0.0] - 2026-11-04` with your own date. The date is written year-month-day (the ISO format), and the version guard reads that line, so its form must be exact ([6.5](#65--changelogmd-a-notebook-of-changes-for-humans-4-minutes)).

**A Git tag: a bookmark.** A tag is a name stuck on one commit, like a bookmark in the history book. The release tag `v2.0.0` is an annotated tag: it carries a message holding `Mini Smart Home 2.0.0` and that version's `CHANGELOG` section, which you can read with `git show v2.0.0` ([9.6](#96--the-first-tag-v200-it-holds-that-versions-changelog-notes-3-minutes)). It's made by the job `tag-release`, the only job with the `contents: write` permission, and only after `staging` passes ([Concept 9](#9-staging-vs-production-the-dress-rehearsal-vs-the-show)). The VPS and the Pi follow this bookmark, not the tip of `main` ([Concept 8](#8-a-systemd-timer-an-alarm-clock-for-the-module-12-security-guard)). That's why you never make, move, or delete a `v…` tag yourself, not even through **Releases** → **Draft a new release**. A hand-made tag on `main` can make the Pi deploy a release that was never rehearsed, and a moved tag makes `git fetch` fail on the VPS and the Pi ([🚨](#-troubleshooting) *`would clobber existing tag` on the VPS or the Pi*).

**Forward to go back.** The word rollback is already used for two other things in this curriculum: the dashboard button that goes back when a device refuses (Module 24) and firmware that goes back to the old version by itself (Module 28). For the server, going back to the previous version is done with a **revert**: the **Revert** button on the troublesome pull request makes a new PR holding the opposite of its changes. A plain revert also brings the number back to 2.0.0, and the version guard refuses it: `FAIL  version 2.0.0 is LOWER than 2.0.1 on origin/main: the version may only go up. …`. So the content is old, but the number goes **up**: 2.0.2 holds the content of 2.0.0, with a `### Fixed` entry "restores …". The 2.0.1 entry stays recorded, because that release really was deployed ([Practice 13](#practice-13--back-to-the-previous-version-a-revert-becomes-202-20-minutes)). This is **forward to go back**: the VPS and the Pi only ever go forward to the latest tag, old tags are never moved, and `CHANGELOG.md` records what really happened.

**The database doesn't go back.** A revert brings back code and images, not the database's content. The migrations run every time the center starts, and undoing their code doesn't undo tables or columns already made. That's why, within one release, a migration may only **add** (new tables, columns, or indexes), so that the previous version's image still fits its database; the Module 29 item of the PR template reminds you. There's no new migration this week (still `011`). Deploying an old tag by hand on the VPS or the Pi is an emergency step for a runbook (a recovery guide) in Module 30, not the everyday way back.

![Diagram of the version timeline, one number for the server (Concept 10): SemVer MAJOR.MINOR.PATCH; what gets deployed changes = the version goes up; forward to go back. Top, 2.0.1 with its parts named: MAJOR = old users are forced to change too, 1.5.0 to 2.0.0; MINOR = a new feature, the old way still works, 2.0.2 to 2.1.0; PATCH = a small fix, the rest stays the same, 2.0.0 to 2.0.1. The timeline: Module 28, backend 1.5.0 and web 1.4.0, two numbers, written by hand, no guard; 2.0.0, tag v2.0.0: MAJOR, the way of DEPLOYING changed, not the API: the VPS pulls the robot's images, the Pi deploys by itself, main is guarded, the first tag; 2.0.1, tag v2.0.1: PATCH, one text on the Login screen, reaches the VPS and the Pi without you SSHing in; 2.0.2, tag v2.0.2: PATCH, the Revert button: the content back as in 2.0.0, the number still GOES UP (forward to go back); dashed to Module 30, v2.1, MINOR (plan). The red box: a plain revert (back to 2.0.0) refused by the version guard in the job verify: FAIL version 2.0.0 is LOWER than 2.0.1 on origin/main: the version may only go up. Left: a release tag = a page marker only the robot sticks on; never make, move, or delete one by hand (not even through Releases). Bottom left, CHANGELOG.md, a notebook of changes for humans: Unreleased; 2.0.2 (example, Practice 13), Fixed: restores the Login screen text; 2.0.1 (example, Practice 12), Changed: the Login screen text; 2.0.0 - 2026-11-04, Added: the checking and deploying robot (GitHub Actions …), Changed: one version number for the server, backend 1.5.0 …; an ISO date YYYY-MM-DD is required; the tag holds its version's section. Right, one number in 10 places, guarded by scripts/check-version.mjs: backend/package.json and frontend/package.json; package-lock.json (two folders × two places); compose.cloud.yml, three image lines; CHANGELOG.md, the top release entry; what gets deployed changed without going up = the robot is red; in backend and frontend: npm version 2.0.1 --no-git-tag-version. Visible from outside, without you SSHing in: /api/health names version 2.0.1, also /api/docs (OpenAPI); the dashboard: v2.0.1 under the title (reload twice); the Git tag v2.0.1, the images …:2.0.1 and sha + 7 characters; the VPS and the Pi only deploy a version that has a tag. Bottom: own numbers that don't go up: firmware Node 1 1.7.x (Module 28), Node 2 1.0.0, DATA-CONTRACT.md 1.6, PIN-MAP.md 7. Forward to go back: a revert brings back the code and the images, not the database content; a migration in one release only ADDS, so an old image still fits.](assets/version-timeline.png)

> ⬆️ **Done reading Concept 10?** Continue to [Practice 6](#practice-6--one-version-number-200-the-version-guard-changelogmd-and-the-version-on-screen-30-minutes): one version number 2.0.0, the version guard, and `CHANGELOG.md`. [Concept 5](#5-one-image-for-two-processors-built-by-the-robot-without-emulation) and [Concept 6](#6-the-image-shop-and-the-robots-permissions-github_token-permissions-secrets-and-variables) are read before [Practice 7](#practice-7--one-image-two-processors-pushed-to-ghcr-by-the-robot-35-minutes).

### 11. Branch protection: a barrier in front of `main`

Since [Module 16's Practice 8](../../phase-3-backend-data/module-16-backend-typescript-api-git/README.md#practice-8--git-for-teams-branches-pull-requests-and-reviews-45-minutes), every change goes through a branch, a pull request, the review checklist, and **Create a merge commit**. But the **Merge pull request** button doesn't care about the robot's color: a red PR can still be merged, and even a direct push to `main` still works. **Branch protection** is **a barrier in front of `main`**: the barrier only lifts when three lights (checks), `verify`, `test`, and `build`, are green, also for you as the repo owner. This is the *branch protection* in the [Syllabus](../../SYLLABUS.md#module-29--testing--cicd-every-change-tested-and-deployed-automatically) (PRs must pass the tests before they can be merged), and at the same time the second clause of its pass requirement: "a PR whose tests fail can't be merged" (requirement **L1**, proven in [5.3](#53--l1-the-pr-tryred-is-red-the-merge-button-is-locked-6-minutes)).

**The four settings of a classic rule** for `main` (**Settings** → **Branches**, [5.1](#51--a-classic-rule-for-main-in-settings--branches-four-settings-8-minutes)). The author has no GitHub account, so the names of the settings and their behavior are quoted from GitHub's documentation, not recorded:

1. **Require a pull request before merging**: every change goes through a PR, and a direct `git push` to `main` is refused ([5.2](#52--a-direct-push-to-main-is-refused-3-minutes)). Required approvals are 0, because GitHub's documentation says "Pull request authors cannot approve their own pull requests." If you work alone, even one required approval means your PR can never be merged.
2. **Require status checks to pass before merging**: the required checks `verify` and `test` in Practice 5, then `build` in [7.6](#76--build-joins-the-branch-rule-three-required-checks-4-minutes).
3. **Require branches to be up to date before merging**: a PR's branch must hold the latest `main`, so the robot tests the real combination. When two PRs both raise the version to 2.0.1, the one merged later is tested again on top of the new `main`, and the version guard asks it to go up to 2.0.2.
4. **Do not allow bypassing the above settings**: according to GitHub's documentation, without this tick the branch rule doesn't apply to repo admins, and the repo owner is an admin: you. You could still merge a red PR, and requirement L1 would only be green on paper.

The picture below is a reconstruction from GitHub's documentation, not a screenshot: the layout and wording on your screen may differ slightly.

![Diagram of branch protection: a red PR can't be merged (Concept 11); the branch rule = a barrier in front of main. A RECONSTRUCTION from GitHub's documentation, NOT a screenshot; simplified, the layout and texts on your screen may differ a little. Left, the pull request try/red to main, a red PR (Practice 5): one expect in an integration test changed. Checks (the check name = the job name): ci / verify (pull_request) successful; ci / test (pull_request) failing, required; a dashed row: the check build comes in Practice 7, its job doesn't exist yet in Practice 5. The merge box (the Conversation tab), red: the Merge pull request button gray with a padlock, disabled because the required check test failed; no option to bypass the rule, also for the repo owner. Right, the pull request fix/login-text to main, a green PR (Practice 12): all three checks (verify, test, build) successful; the green merge box: the Merge pull request button, then Create a merge commit, Confirm merge, Delete branch (as in Module 16); the robot continues on main (Concept 3). Bottom, Settings, Branches, a classic rule for main: four checkboxes. 1 Require a pull request before merging: required approvals 0, the author of a PR can't approve their own PR; a direct push to main is refused. 2 Require status checks to pass before merging: require verify, test (Practice 5) and build (Practice 7); the exact job names, a job without a paths filter, a check that passed in the last 7 days; staging is not required: in a PR it is skipped (if), and a skipped job counts as passed. 3 Require branches to be up to date before merging: the PR branch must hold the latest main, the button Update branch when main has moved on. 4 Do not allow bypassing the above settings: without this box, you as the repo owner (admin) can still merge a red PR. Conditions: a public repo (a free account: branch protection only for public repos); the first pull request that brings ci.yml is merged first, because a check can only be chosen after it has run once; this rule doesn't replace the Module 16 review checklist.](assets/branch-rule-merge-box.png)

**Check names, 7 days, no `paths`.** A required check is picked by its job's name (`name:` in `ci.yml`); on the **Checks** tab, according to GitHub's documentation, it shows as `ci / verify (pull_request)`. Renaming a job means changing the rule too. According to GitHub's documentation, a required check must have passed in that repo in the last 7 days: that's why the rule is set up after PR A ([4.5](#45--merge-pr-a-then-the-robot-runs-again-on-main-4-minutes)), and `build` is only required after it has run in PR B. `ci.yml` deliberately has no `paths` filter (a workflow that only runs when certain files change), because a workflow skipped by a filter makes its required check wait forever: `Waiting for status to be reported`. Finally, according to the same documentation, a skipped job reports a pass. `build` is skipped when `test` is red, so if only `build` were required, a PR with red tests would still get through; that's why all three are required separately. `staging` and the jobs after it aren't required, because in a PR they're always skipped.

**The barrier guards the color, humans guard the content.** A PR that changes files in `.github/workflows/` also changes the robot that checks it, for example by adding `continue-on-error: true`, so its check can be a false green. That's why, before merging, you read its changes on the **Files changed** tab: the Module 29 item of the PR template asks that no step was "made green" with `continue-on-error`, `if: false`, `.skip`/`.only`, or deleted tests. Branch protection doesn't replace the Module 16 review checklist either.

**Public repos and rulesets.** According to two official GitHub sources (the documentation and the pricing page), on a free account both the classic branch rule and its newer form, rulesets, are only available for public repos. A private repo needs a paid plan, so requirement L1 can't be reached yet ([1.2](#12--is-the-mini-smart-home-repo-public-or-private-check-in-settings--general-then-decide-3-minutes)). [Syllabus §5.5](../../SYLLABUS.md#55-service-costs-phase-5) (v1.0.31) records it: GitHub Actions, Container Registry, and branch protection are free for public repos, while a private repo on a free account gets a monthly minutes quota and needs a paid plan for branch protection. Rulesets can be layered (the strictest one applies), can be turned off for a while without being deleted, and the active rules can be seen by anyone who can read the repo. This module uses the classic rule because its four setting names can be quoted straight from the documentation. The symptoms are in [🚨](#-troubleshooting), the group **Branch protection**.

> ⬆️ **Done reading Concept 11?** Continue to [Practice 5](#practice-5--branch-protection-a-red-pr-cant-be-merged-20-minutes): branch protection, after the first pull request is merged in [4.5](#45--merge-pr-a-then-the-robot-runs-again-on-main-4-minutes). If you read it earlier, go back to the practice you're working on.

## 🔧 Step-by-step practice

Practices 1–4, 6–9, and 12 are required for every path; Practice 5 is required except for a private repo; [Practice 10](#practice-10--the-vps-switches-to-pulling-a-robot-key-that-can-only-run-one-script-45-minutes) is required for the main path and the path without a Pi; [Practice 11](#practice-11--the-pi-updates-itself-a-systemd-alarm-clock-40-minutes) is required for the main path and the free path; Practice 13 is recommended, without a ⭐. The steps marked ⭐ are the proof. Requirement **L0** is proven in [4.4](#44--l0-red-once-on-purpose-then-all-green-8-minutes), **L1** in [5.3](#53--l1-the-pr-tryred-is-red-the-merge-button-is-locked-6-minutes) (together with [5.2](#52--a-direct-push-to-main-is-refused-3-minutes)), **L2** in [12.4](#124--l2-the-robot-deploys-to-the-vps-the-login-screen-says-v201-8-minutes), and **L3** in [12.5](#125--l3-the-pi-deploys-201-by-itself-read-from-its-journal-6-minutes).

The order follows the required order at the start of the module: the backup (Practice 1) → **PR A** (Practices 2–4) → branch protection (Practice 5) → **PR B** (Practices 6–9) → one-time manual steps: public GHCR packages ([9.7](#97--the-ghcr-packages-become-public-pull-without-logging-in-two-processors-4-minutes)), the VPS (Practice 10), and the Pi (Practice 11) → **PR C** (Practice 12) → **PR D** (Practice 13). The reason: branch protection can only require checks that have run before, and the robot only pushes images and makes tags from `main`. Changed files are committed on the practice's branch, with a short message about their content, for example `feat: backend lint and frontend Vitest` (`feat:` = a new feature). A PR is merged with **Create a merge commit** ([Module 16's Practice 8](../../phase-3-backend-data/module-16-backend-typescript-api-git/README.md#practice-8--git-for-teams-branches-pull-requests-and-reviews-45-minutes)) after its robot is green.

The practices are written for the main path (a VPS and a gateway Pi). The other paths use the same order; what differs is in the 🔀 boxes (**The free path:**, **Without a Pi:**, **A private repo:**).

**How to spread it out:** **day 1** 🔁, 🏆, Concepts 1–4, Practices 1–2 · **day 2** Practices 3–4, Concept 11, Practice 5 · **day 3** Concept 10, Practice 6, Concepts 5–6, Practice 7 · **day 4** Concept 9, Practice 8, Concepts 7–8, Practice 9 · **day 5** Practices 10–11 · **day 6** Practices 12–13, ➕, the quiz, and the checklist.

> [!NOTE]
> **Your home during this week.** Practices 1–9 are done on the laptop and GitHub; the VPS and the Pi don't change (the backup in 1.3 only reads). [10.1](#101--the-last-time-you-ssh-in-to-deploy-sh-scriptsdeploysh-pulls-200-10-minutes) recreates `backend` and `web` on the VPS with pulled images (the free path: on the Pi, 11.1), so the dashboard drops out for a moment (the Indonesian edition's lab: 5.5–7.6 seconds, an example). Practices 12 and 13 do the same, but without your hands. The gateway Pi's broker isn't restarted in 2.0.0–2.0.2 because `edge/` doesn't change ([11.6](#116--the-gateway-broker-isnt-restarted-node-1-stays-online-4-minutes)). Node 1 and the home's data keep running.

### Practice 1 — The workbench: a branch, a public repo, and a backup (10 minutes)

> 🖥️ **Tools used:** **VS Code** on the laptop, a terminal at the **project root** (1.1, 1.2); **GitHub** in the browser (1.2); a terminal on the production machine (1.3): **SSH to the VPS** (`ssh house@203.0.113.10`, folder `~/mini-smart-home`; the free path: SSH to the Pi, `ssh budi@gateway.local`). Its material: 🔁 Step 1 and [5](#step-5--github-and-the-pi-a-public-repo-the-module-26-ghcr-packages-and-systemctl-list-timers), and the backup recipe of [Module 26's 9.1](../module-26-docker-compose/README.md#91-pg_dump-inside-the-container-then-docker-compose-cp-to-backup-8-minutes).
>
> ⭐ **Required** — steps 1.2 and 1.3: a public repo; a backup archive dated today in `backup/` on the production machine, and its history fingerprint row noted.

#### 1.1 The branch `feature/robot-tests` from the latest `main` (3 minutes)

This branch holds PR A. In the laptop terminal:

```text
git switch main
git pull
git switch -c feature/robot-tests
```

**Expected output (the author's lab, laptop):**

```text
Already on 'main'
Your branch is up to date with 'origin/main'.
Already up to date.
Switched to a new branch 'feature/robot-tests'
```

Practice 1 doesn't change project files, so there's no commit.

#### 1.2 ⭐ Is the `mini-smart-home` repo public or private: check in Settings → General, then decide (3 minutes)

On a free account, branch protection is only available for public repos ([Concept 11](#11-branch-protection-a-barrier-in-front-of-main)). The setting: **Settings** → **General**, in the **Danger Zone** section at the very bottom. The easiest way to check: a repo that opens in an incognito window (🔁 Step 5) = public. It has usually been public since Module 3; if so, this step is done. Still private? Decide now. Before making it public, check the Git history in the laptop terminal:

```text
git log --all --full-history --oneline -- '*.env' '*keys.h' '*.bin' '*backup/*' '*bridge/*.conf'
```

No output = those secret files were never committed. Lines appear? First replace the secrets in those files (new passwords, tokens, keys), because a public repo's history can be read by anyone; secret scanning is only the last safety net ([Module 20's Concept 11](../../phase-3-backend-data/module-20-user-security/README.md#11-secrets-and-privacy-what-must-not-leak)). Then, in that **Danger Zone**: **Change visibility** → choose public → follow its confirmations until **Make this repository public** (from GitHub's documentation, read 5 November 2026; not recorded by the author). This is step 1 of "Once only, in order" in the [project README](code/README.md#tested-and-deployed-automatically-module-29).

> 🔀 **A private repo:** skip Practice 5 (requirement **L1** isn't possible on a free account; [🚨](#-troubleshooting)). The robot's runs count against the monthly minutes quota, and the VPS and the Pi will need a GHCR read token and a repo read key (a deploy key). Not a full pass yet until the repo is public or on a paid plan.

**You pass this ⭐ step** when `https://github.com/<account>/mini-smart-home` opens in an incognito window.

#### 1.3 ⭐ A backup before the robot deploys: `pg_dump`, `docker compose cp`, and the history fingerprint (4 minutes)

If the switch to the robot's images breaks something, this archive is restored with Module 26's recipe 9.2. In the production machine's terminal, prepare the folder with `mkdir -p backup`, then:

```text
docker compose exec db pg_dump -U postgres -d smarthome -Fc -f /tmp/smarthome.dump
```

**Expected output (the author's lab, simulated "VPS"):** four normal lines as in Module 26, starting with `pg_dump: warning: there are circular foreign-key constraints …`. Copy the archive out, with today's date in its name:

```text
docker compose cp db:/tmp/smarthome.dump backup/smarthome-2026-11-04-before-m29.dump
```

**Expected output (the author's lab, simulated "VPS"):** `smarthome-db-1 Copied …`. Check `git status --short`: empty, because Git ignores `backup/`. This archive holds your whole history and your accounts: keep it as private data. Then the history fingerprint:

```text
docker compose exec -T db psql -U postgres -d smarthome < scripts/fingerprint.sql
```

**Expected output (the author's lab, simulated "VPS"; your numbers differ):**

```text
 readings |           fingerprint            | summaries | chunks | jobs | accounts | devices
----------+----------------------------------+-----------+--------+------+----------+---------
     2143 | a5f7faa9788cb5840880322a8487cfaf |       353 |      9 |    3 |        1 |       2
(1 row)
```

Copy the row with the date and the WIB time into `learn-iot/module-29/fingerprint.md` under the heading "Before the robot (1.3)". Node 1 keeps sending and the 90-day retention throws away old chunks, so only `accounts` and `devices` must stay the same after [10.1](#101--the-last-time-you-ssh-in-to-deploy-sh-scriptsdeploysh-pulls-200-10-minutes) and [12.4](#124--l2-the-robot-deploys-to-the-vps-the-login-screen-says-v201-8-minutes).

**You pass this ⭐ step** when `backup/` on the production machine holds an archive dated today and its fingerprint row is saved in `fingerprint.md`.

> ⬆️ **Done with Practice 1?** Continue to [Practice 2](#practice-2--backend-lint-and-frontend-tests-oxlint-and-vitest-25-minutes): backend lint and frontend tests, all on the laptop.

### Practice 2 — Backend lint and frontend tests: oxlint and Vitest (25 minutes)

> 🖥️ **Tools used:** **VS Code** on the laptop (the branch `feature/robot-tests`), a terminal in the **`backend`** folder, then **`frontend`**. No Docker; the VPS and the Pi aren't touched. Concepts used: 1, 4.
>
> ⭐ **Required** — steps 2.1, 2.2, 2.3, and 2.4: the lint of both folders prints `Found 0 warnings and 0 errors.` with `--deny-warnings`, five dashboard tests green, then red once and green again.

The robot (Practice 4) runs the same commands and only reads their exit code ([Concept 4](#4-lint--test--build-fail-fast)): make them green on the laptop first. In PowerShell (not tested by the author), replace `echo "exit code: $?"` with `"exit code: $LASTEXITCODE"`.

#### 2.1 ⭐ Backend lint with oxlint 1.89.0: `.oxlintrc.json`, `--deny-warnings`, and one finding (8 minutes)

The backend has never had lint: ESLint can't be installed because `typescript-eslint` doesn't accept TypeScript 7 yet (the fold *ESLint and Prettier …* in [🔬 Module 16](../../phase-3-backend-data/module-16-backend-typescript-api-git/README.md#-technical-deep-dive-optional)). Its replacement is oxlint, the same version as in the frontend's lock. In the terminal, go to the `backend` folder (`cd backend`):

```text
npm i -D -E oxlint@1.89.0
```

`-D` = a developer tool (not in the image), `-E` = the exact version, without `^`. **Expected output (the author's lab, laptop, 4 November 2026; cut):** `added 2 packages, and audited 228 packages in 13s` · `4 moderate severity vulnerabilities`, then the advice `npm audit fix --force`: **don't** run it (2.5).

Right-click the **`backend`** folder → **New File…** → `.oxlintrc.json`, and fill it with the four lines of the [code file](code/backend/.oxlintrc.json):

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["typescript", "oxc"]
}
```

Its content: oxlint's core rules plus the plugins `typescript` and `oxc` (= the frontend's, without `react`); the `plugins` list replaces the default one, so `unicorn` is deliberately not used. In `backend/package.json`, add the script `lint` under `"check"`:

```diff
     "check": "tsc --noEmit",
+    "lint": "oxlint --deny-warnings",
```

oxlint's rules are **warnings**, and warnings don't change the exit code: without `--deny-warnings`, the robot is never red because of lint. With it, even one warning = exit code `1`. Run:

```text
npm run lint; echo "exit code: $?"
```

**Expected output (the author's lab, laptop; cut):**

```text
  ⚠ eslint(no-constant-binary-expression): Unexpected constant relational comparison
    ╭─[src/services/version.test.ts:16:12]
 15 │   it("1.10.0 is NEWER than 1.9.0 (an ordinary text comparison is wrong here)", () => {
 16 │     expect("1.10.0" < "1.9.0").toBe(true); // text: "1" < "9", so wrong
    ·            ──────────────────
 17 │     expect(compareVersions("1.10.0", "1.9.0")).toBe(1);
    ╰────
  help: Both sides of the < are literal values

Found 1 warning and 0 errors.
Finished in 56ms on 68 files with 83 rules using 4 threads.
exit code: 1
```

Comparing two fixed texts is almost always wrong, but this Module 28 test does it on purpose to prove that versions must not be compared as text. Turn the rule off for that line only, with a reason: insert a comment line above line 16 of `src/services/version.test.ts`, exactly as in the [code file](code/backend/src/services/version.test.ts).

```diff
+    // oxlint-disable-next-line no-constant-binary-expression -- on purpose: two fixed texts to show that a text comparison is wrong
     expect("1.10.0" < "1.9.0").toBe(true); // text: "1" < "9", so wrong
```

Don't throw away `--deny-warnings`: that's a false green. Repeat `npm run lint; echo "exit code: $?"`. **Expected output (the author's lab, laptop; cut):** `Found 0 warnings and 0 errors.` · `Finished in 120ms on 68 files with 83 rules using 4 threads.` · `exit code: 0`. Red again some day? [🚨](#-troubleshooting) *Lint red because of one warning …*.

**You pass this ⭐ step** when `npm run lint` in `backend` changes from `Found 1 warning and 0 errors.` (`exit code: 1`) to `Found 0 warnings and 0 errors.` (`exit code: 0`).

#### 2.2 ⭐ The frontend lint gets `--deny-warnings` too (2 minutes)

The dashboard has used oxlint since Module 22, but without `--deny-warnings`. In `frontend/package.json`:

```diff
-    "lint": "oxlint",
+    "lint": "oxlint --deny-warnings",
```

Go to the `frontend` folder (`cd ../frontend`), then `npm run lint; echo "exit code: $?"`. **Expected output (the author's lab, laptop; cut):** `Found 0 warnings and 0 errors.` · `Finished in 259ms on 59 files with 116 rules using 4 threads.` · `exit code: 0`.

**You pass this ⭐ step** when `npm run lint` in `frontend` prints `> oxlint --deny-warnings` and `Found 0 warnings and 0 errors.` (`exit code: 0`).

#### 2.3 ⭐ Vitest 5.0.5 in the frontend: three test files, the dashboard's first five tests (8 minutes)

The [Syllabus](../../SYLLABUS.md#3-technology-choices--why-we-made-them) says "Vitest (backend & frontend)", but the dashboard doesn't have a single test yet. It gets exactly the same Vitest as the backend, starting from the bottom layer of the pyramid (Concept 1): pure functions, without a browser or the backend. In the `frontend` terminal:

```text
npm i -D -E vitest@5.0.5
```

**Expected output (the author's lab, laptop, 4 November 2026; cut):** `added 17 packages, and audited 442 packages in 9s` · `10 vulnerabilities (2 low, 8 moderate)` (= Module 28, all of them build tools). Add the script `test` under `lint` (`vitest run` = run once, then exit with its code):

```diff
     "lint": "oxlint --deny-warnings",
+    "test": "vitest run",
```

Make `frontend/src/time.test.ts` holding the block below, then take [`csv.test.ts`](code/frontend/src/csv.test.ts) and [`rules.test.ts`](code/frontend/src/rules.test.ts) into the same folder with **Copy raw file**.

```ts
// time.test.ts - tests of the clock helpers on the screen (Module 29). The dashboard clock is always WIB, whatever the time zone
// of the laptop, the phone, or the robot computer running them (the GitHub Actions robot uses UTC). From the frontend folder: npm test
import { afterEach, describe, expect, it, vi } from "vitest";
import { relativeTime, wibTime, MINUTE } from "./time";

describe("the clock on the screen (time.ts)", () => {
  // after every test: bring back this computer's own time zone (vi.stubEnv below only borrows it)
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("wibTime: WIB time, whatever the computer's time zone", () => {
    // UTC (the robot), WIB, WITA, WIT. vi.stubEnv("TZ", …) = as if this computer were set to that time zone. It only applies to
    // a format made WHEN it is called (toLocaleTimeString in wibTime). The Intl.DateTimeFormat formatters made once when
    // time.ts loads (HOUR_MINUTE and friends) use the time zone at load time: the robot on a UTC clock guards those.
    for (const zone of ["UTC", "Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"]) {
      vi.stubEnv("TZ", zone);
      // Z at the end = UTC time. WIB = UTC + 7 hours.
      expect(wibTime("2026-10-24T09:27:10Z")).toBe("16:27:10 WIB");
      expect(wibTime("2026-10-24T17:05:00Z")).toBe("00:05:00 WIB"); // already past midnight in Indonesia
    }
  });

  it("relativeTime: under 5 seconds 'just now' (also when the server clock runs slightly fast), after that '… ago'", () => {
    const now = Date.parse("2026-10-24T09:30:00Z");
    expect(relativeTime(now - 3000, now)).toBe("just now");
    // the server clock 2 seconds ahead of the phone clock: still "just now", not "in 2 seconds"
    expect(relativeTime(now + 2000, now)).toBe("just now");
    expect(relativeTime(now - 45 * 1000, now)).toBe("45 seconds ago");
    expect(relativeTime(now - 3 * MINUTE, now)).toBe("3 minutes ago");
  });
});
```

Read its comments: a laptop set to WIB still writes the right time even when `wibTime` forgets `timeZone`, the robot on UTC doesn't. `vi.stubEnv("TZ", zone)` borrows four zones, including `UTC`, so that mistake is caught on any laptop. The two other files guard the CSV for Excel and the sentences on the **Rules** screen ([the details](code/frontend/README.md#automatic-tests-module-29)). The import from `vitest` is written out because `npm run build` (`tsc -b`) checks the tests too. No new settings file: Vitest reads `vite.config.ts`.

So that the tests don't change the content of the web image, replace two more files (**Copy raw file**): [`frontend/.dockerignore`](code/frontend/.dockerignore) gets the line `src/**/*.test.ts`, and in [`frontend/src/index.css`](code/frontend/src/index.css) the first line `@import "tailwindcss";` becomes:

```css
/* … */
@import "tailwindcss" source(none);
@source "../src";
@source not "../src/**/*.test.ts";
@source "../index.html";
```

By default, Tailwind reads every text file in `frontend`, READMEs and tests too, so an ordinary word like `transform` can become a CSS class (a finding of the author's lab). Then:

```text
npm test; echo "exit code: $?"
```

**Expected output (the author's lab, laptop; cut):**

```text
 ✓ src/csv.test.ts (2 tests) 22ms
 ✓ src/rules.test.ts (1 test) 46ms
 ✓ src/time.test.ts (2 tests) 14ms
 Test Files  3 passed (3)
      Tests  5 passed (5)
   Duration  4.44s (import 87%, transform 11%, tests 2%, worker 1%)
exit code: 0
```

The order of the `✓` lines may differ; `import 87%` = loading the modules (`date-fns`), not the tests; the times are an example. Also run `npm run build`: it still passes, with the line `PWA v2.0.0` (the author's lab), the version of the package `vite-plugin-pwa`, not your dashboard's version (1.4.0 until Practice 6).

**You pass this ⭐ step** when `npm test` prints `Tests  5 passed (5)` with `exit code: 0`, and `npm run build` finishes without errors.

#### 2.4 ⭐ Red once on purpose: `wibTime` without a time zone, then green again (4 minutes)

A test that has never been red hasn't proven that it guards anything. In `frontend/src/time.ts` line 25 (the function `wibTime`), delete `, { timeZone: "Asia/Jakarta" }`:

```diff
-  return new Date(t).toLocaleTimeString("en-GB", { timeZone: "Asia/Jakarta" }) + " WIB";
+  return new Date(t).toLocaleTimeString("en-GB") + " WIB";
```

Save, then `npm test; echo "exit code: $?"`.

**Expected output (the author's lab, laptop; cut):**

```text
     × wibTime: WIB time, whatever the computer's time zone 27ms
AssertionError: expected '09:27:10 WIB' to be '16:27:10 WIB' // Object.is equality
 ❯ src/time.test.ts:19:47
      Tests  1 failed | 4 passed (5)
exit code: 1
```

Without `timeZone`, the time follows the computer's zone: in UTC `09:27:10`, not `16:27:10` WIB. Even the author's terminal set to WIB turns red. Undo it with `git restore src/time.ts`; `npm test` is green again (`exit code: 0`, the author's lab). The robot catches the same mistake in [4.4](#44--l0-red-once-on-purpose-then-all-green-8-minutes).

**You pass this ⭐ step** when `npm test` is red with `Tests  1 failed | 4 passed (5)` (`exit code: 1`), then green again after `git restore`.

#### 2.5 `npm audit` like the robot: red only for high-severity holes, then commit (3 minutes)

The robot audits libraries with `--omit=dev` (only those that go to production) and `--audit-level=high` (exit code `1` only for high or critical holes). In `frontend`, then in `backend` (`cd ../backend`):

```text
npm audit --omit=dev --audit-level=high; echo "exit code: $?"
```

**Expected output (the author's lab, laptop, 4 November 2026):** frontend `found 0 vulnerabilities`, exit code `0`; backend (cut):

```text
glob  3.0.0 - 14.0.1
minimatch  <11.0.1
4 moderate severity vulnerabilities
exit code: 0
```

All four are one chain belonging to the `/docs` page (`@fastify/swagger-ui` → `@fastify/static` → `glob`, `minimatch`); on that date there was no fix in our version range yet ([Limits of v2.0](code/backend/README.md#limits-of-v20)). A plain `npm audit` has exit code `1` in both folders (the author's lab), and you still read its full report as in [Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#10-honest-traffic-at-home-is-still-in-the-clear). New holes can make the robot red without your code changing ([🚨](#-troubleshooting) *`npm audit` red …*). **Don't** run `npm audit fix --force`: according to its report, that installs the ancient `@fastify/swagger-ui@2.1.0`.

In the project root (`cd ..`), `git status --short` only names this practice's files: `backend` (`.oxlintrc.json`, `package.json`, the lock, `version.test.ts`) and `frontend` (three tests, `.dockerignore`, `package.json`, the lock, `index.css`). Then:

```text
git add backend frontend
git commit -m "feat: backend lint and frontend Vitest"
```

Not pushed yet: PR A is opened in [4.2](#42--commit-push-and-open-pr-a-two-checks-run-at-the-same-time-5-minutes).

> ⬆️ **Done with Practice 2?** Continue to [Practice 3](#practice-3--a-test-database-and-20-integration-tests-60-minutes): a test database and 20 integration tests. Start Docker on your laptop first.

### Practice 3 — A test database and 20 integration tests (60 minutes)

> 🖥️ **Tools used:** **Docker Desktop** (Windows/macOS) or Docker Engine (Linux) running on the laptop; **VS Code**, the branch `feature/robot-tests`, a terminal in the **`backend`** folder. Your home database, the VPS, and the Pi aren't touched. Concepts used: 1, 2.
>
> ⭐ **Required** — steps 3.1 to 3.7 and 3.9: 20 green integration tests, then 223 tests at once, and one SQL mistake that slips past 203 mock tests but is caught by the integration tests.

The backend gets the middle layer of the pyramid ([Concept 1](#1-the-testing-pyramid-ingredients--recipe--kitchen--customer)): tests that run real SQL queries on an empty test database ([Concept 2](#2-what-a-mock-cant-see-integration-tests-with-a-test-database)). The files are in [`code/backend/`](code/backend/): open each on GitHub, click **Copy raw file**, then paste it as a file with the same name in the `backend` folder (an old file: replace its whole content). The version stays 1.5.0 until Practice 6. In PowerShell (not tested by the author), replace `echo "exit code: $?"` with `"exit code: $LASTEXITCODE"`.

#### 3.1 ⭐ A throw-away test database: `smarthome-db-test` at counter 5433 (6 minutes)

Start Docker Desktop and wait until it's ready. This one line is the same in PowerShell, the macOS Terminal, and Linux:

```text
docker run --rm -d --name smarthome-db-test -p 127.0.0.1:5433:5432 --tmpfs /var/lib/postgresql/data -e POSTGRES_PASSWORD=test-not-a-secret -e POSTGRES_DB=smarthome_test -e TIMESCALEDB_TELEMETRY=off timescale/timescaledb:2.30.2-pg17
```

Compare it with the home database's `docker run` (Module 17): `--rm` = the container deletes itself once stopped; `--tmpfs` = the data in memory without a cupboard, gone when it stops (the practice kitchen always starts empty); counter `5433` (only from this laptop) because 5432 belongs to the home database; the database name ends in `_test` (3.3); the password written there isn't a secret because the database only holds test data. Its image is the same as production's (its migrations need TimescaleDB, not a plain `postgres`), so it's usually already on your laptop. Repeat this command until it answers `accepting connections`:

```text
docker exec smarthome-db-test pg_isready -h 127.0.0.1 -U postgres -d smarthome_test
```

**Expected output (the author's lab, laptop):** `docker run` answers with one container ID line; `pg_isready` four times `127.0.0.1:5432 - no response`, then `127.0.0.1:5432 - accepting connections`, ±5.5 seconds after `docker run` (an example). `5432` = the counter inside the container; from the laptop, 5433. Counter 5433 already taken, or the tests later print `the test database can't be reached`? See [🚨](#-troubleshooting), the group **The test database on the laptop**.

**You pass this ⭐ step** when `pg_isready` answers `accepting connections`.

#### 3.2 ⭐ One server assembly: `buildApp()` in `src/app.ts`, the 203 tests stay green (10 minutes)

The integration tests need the production server assembly, but without the broker and counter 8080. Take with **Copy raw file**: [`src/app.ts`](code/backend/src/app.ts) (new), [`src/server.ts`](code/backend/src/server.ts), [`src/config/server-version.ts`](code/backend/src/config/server-version.ts) (new), and [`src/routes/health.ts`](code/backend/src/routes/health.ts). The Module 28 assembly in `server.ts` (lines 40–103) moves to `buildApp()` in `app.ts` ([Concept 2](#2-what-a-mock-cant-see-integration-tests-with-a-test-database)); its head explains what for:

```ts
// Why separate? The integration tests (src/integration/) call buildApp() and then knock on its routes with app.inject() and a
// REAL test database. So what is tested is THE SAME assembly as in production, not a mock assembly made by the tests: a route
// someone forgot to register shows up too (example: without claimRoutes, three claim tests turn red with 404), and so does a
// …
export async function buildApp(options: AppOptions = {}): Promise<FastifyInstance> {
```

`server.ts` now only calls `const app = await buildApp();`, writes one new log line (`Mini Smart Home backend <version> started`), then starts the rest (the database, MQTT, Telegram, …) and opens the counter as before. The version is read from `package.json` in one place, `src/config/server-version.ts` (not `services/version.ts`, which belongs to Module 28's firmware versions), and `/health` (`src/routes/health.ts`) names it:

```ts
const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as { version: string };

export const SERVER_VERSION: string = pkg.version; // for example "2.0.0"
// …
    return { ok: true, version: SERVER_VERSION, broker: brokerConnected(), database: await databaseAlive(),
```

The version is still `1.5.0`; it goes up in [6.2](#62--one-number-200-npm-version-three-image-lines-and-envexample-6-minutes) and shows on the VPS in [10.1](#101--the-last-time-you-ssh-in-to-deploy-sh-scriptsdeploysh-pulls-200-10-minutes). The `/health` answer code always stays `200` (`503` = Module 30). Then `npm run check`, followed by `npm test`.

**Expected output (the author's lab, laptop):** `npm run check` without output besides npm's header (`> tsc --noEmit`); `npm test` passes 203 tests as in [🔁 Step 1](#step-1--your-module-28-homes-inventory-version-numbers-203-tests-and-self-built-images) (`Tests  203 passed (203)`): the assembly is the same, it only moved files.

**You pass this ⭐ step** when `npm run check` has no errors and `npm test` prints `Tests  203 passed (203)`.

#### 3.3 ⭐ `src/integration/setup.ts`: the `_test` guard and the queued migrations (6 minutes)

In the VS Code Explorer, right-click the folder **`src`** in `backend` → **New Folder…**, and name it `integration`. Inside it, make `setup.ts` from the [code file](code/backend/src/integration/setup.ts) (**Copy raw file**). This isn't a test: every test file calls `setupTest()` before its tests. Its head (lines 1–25) writes five preparation steps; this is its guard:

```ts
  // 1. the database name guard, before any connection at all
  const name = databaseName(TEST_URL);
  if (!name.endsWith("_test")) throw refuseNonTest(name);
  // …
    if (!connected.rows[0].name.endsWith("_test")) throw refuseNonTest(connected.rows[0].name);
```

The first layer reads the name in the `DATABASE_URL_TEST` address before connecting; the second layer checks `SELECT current_database()` afterwards: what decides is the database that's really connected. Its refusal message only holds the database name, without the address, which contains the password. The other steps: every test setting is overwritten (a dead broker `mqtt://127.0.0.1:1`, a random single-use `JWT_SECRET`, a temporary firmware folder, automatic broker accounts `off`, Telegram empty), so the settings in your terminal don't carry over; the migration `node src/db/migrate.ts` queues with `pg_advisory_lock` because the test files run at the same time; the server is `buildApp({ log: "errors-only" })`: a green test is silent, a red test prints the `503` reason in one line (3.7).

**You pass this ⭐ step** when `setup.ts` is in `src/integration/` and you can point at both of its guard lines.

#### 3.4 ⭐ Six integration test files, then read `devices.test.ts` (10 minutes)

Take the six test files from [`code/backend/src/integration/`](code/backend/src/integration/) into the same folder with **Copy raw file**: `devices.test.ts`, `readings.test.ts`, `login.test.ts`, `rules.test.ts`, `claims.test.ts`, and `firmware-fleet.test.ts`. The first one is read in full:

```ts
// devices.test.ts - INTEGRATION tests of the device registry (Modules 21 + 28) with a REAL test database (Module 29).
// The difference with routes/devices.test.ts: there the devices table is replaced by a mock in memory (vi.mock), so the SQL
// queries in src/db/devices.ts are never run. Here INSERT, UPDATE, transactions, CHECK, and foreign keys are really checked by
// PostgreSQL. A real example: if src/db/devices.ts one day writes the key fingerprint wrongly (for example upper($5), capitals),
// the 203 mock tests stay green, but CHECK (key_hash ~ '^[0-9a-f]{64}$') of migration 010 refuses the row: POST /devices
// is answered with 503 and the first test below is red.
// Run (the test database running, DATABASE_URL_TEST filled in; see setup.ts): npm run test:integration
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { hasTestDatabase, registerDevice, deleteTestDevices, setupTest } from "./setup.ts";
import type { TestKit } from "./setup.ts";

// device_ids of this file only (prefix 2901): the other integration test files run at the same time with IDs of their own
const NEW_DEVICE = "290100000001";
const DUPLICATE = "290100000002";
const LISTED = "290100000003";
const REVOKED = "290100000004";
const ALL = [NEW_DEVICE, DUPLICATE, LISTED, REVOKED];
const fingerprint = (key: string) => createHash("sha256").update(key).digest("hex"); // computed here, not by the server code
// the server version read here from package.json (not from src/config/server-version.ts, which is under test)
const VERSION = (JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as { version: string }).version;

describe.skipIf(!hasTestDatabase)("integration (test database): devices", () => {
  let kit: TestKit;
  beforeAll(async () => { kit = await setupTest(); }, 60_000); // the migration may wait for another file's turn
  beforeEach(() => deleteTestDevices(kit.pool, ALL)); // every test starts without this file's devices
  afterAll(async () => {
    if (!kit) return; // setupTest() failed (for example the _test guard refused): its error was already reported
    await deleteTestDevices(kit.pool, ALL);
    await kit.close();
  });

  it("POST /devices: the key is shown once, the database stores only its SHA-256 fingerprint (CHECK key_hash)", async () => {
    const answer = await kit.app.inject({ method: "POST", url: "/devices", cookies: kit.wristband("admin"),
      payload: { device_id: NEW_DEVICE, name: "Integration test", location: "robot lab" } });
    expect(answer.statusCode).toBe(201);
    const { key } = answer.json() as { key: string };
    expect(key).toMatch(/^[A-Za-z0-9_-]{43}$/);

    // read straight from the table: what is stored is its fingerprint (64 lowercase hexadecimal digits), not the key
    const result = await kit.pool.query<{ key_hash: string; name: string; registered_at: Date | null }>(
      "SELECT key_hash, name, registered_at FROM devices WHERE device_id = $1", [NEW_DEVICE]);
    expect(result.rowCount).toBe(1);
    expect(result.rows[0].key_hash).toBe(fingerprint(key));
    expect(result.rows[0].key_hash).not.toContain(key);
    expect(result.rows[0].name).toBe("Integration test");
    expect(result.rows[0].registered_at).toBeInstanceOf(Date);
  });

  it("registering the same device_id again: 409, the name and the key fingerprint in the database don't change", async () => {
    const key = await registerDevice(kit, DUPLICATE, "Original node");
    const again = await kit.app.inject({ method: "POST", url: "/devices", cookies: kit.wristband("admin"),
      payload: { device_id: DUPLICATE, name: "Intruder node" } });
    expect(again.statusCode).toBe(409);

    // ON CONFLICT ... WHERE registered_at IS NULL: a row that is already registered must not be overwritten
    const result = await kit.pool.query("SELECT name, key_hash FROM devices WHERE device_id = $1", [DUPLICATE]);
    expect(result.rows).toEqual([{ name: "Original node", key_hash: fingerprint(key) }]);
  });

  it("GET /devices from the database without leaking the key; without a login 401; /health names the version and the database", async () => {
    const key = await registerDevice(kit, LISTED, "Listed node");
    const answer = await kit.app.inject({ method: "GET", url: "/devices", cookies: kit.wristband("viewer") }); // a viewer may look
    expect(answer.statusCode).toBe(200);

    const list = answer.json() as { device_id: string; name: string | null; key: string }[];
    expect(list.find((d) => d.device_id === LISTED)).toMatchObject({ name: "Listed node", key: "active" });
    expect(answer.body).not.toContain(key);
    expect(answer.body).not.toContain(fingerprint(key));
    expect(answer.body).not.toContain("key_hash");

    // the production assembly (buildApp) is guarded too: the login guard is in place, and /health (the version proof on the
    // VPS/Pi) names the package.json version and the connected database
    expect((await kit.app.inject({ method: "GET", url: "/devices" })).statusCode).toBe(401);
    const health = await kit.app.inject({ method: "GET", url: "/health" });
    expect(health.statusCode).toBe(200);
    expect(health.json()).toMatchObject({ ok: true, version: VERSION, database: true });
  });

  it("revoke (Deactivate): the key fingerprint deleted, the revoke time and the status offline written, the event in the events table", async () => {
    await registerDevice(kit, REVOKED);
    const answer = await kit.app.inject({ method: "POST", url: `/devices/${REVOKED}/revoke`, cookies: kit.wristband("admin") });
    expect(answer.statusCode).toBe(200);

    const result = await kit.pool.query<{ key_hash: string | null; revoked_at: Date | null; status: string }>(
      "SELECT key_hash, revoked_at, status FROM devices WHERE device_id = $1", [REVOKED]);
    expect(result.rows[0]).toMatchObject({ key_hash: null, status: "offline" });
    expect(result.rows[0].revoked_at).toBeInstanceOf(Date);
    // the event log is written by the route without waiting (recordEvent), so its row is waited for briefly (at most 1 second)
    await vi.waitFor(async () => {
      const events = await kit.pool.query("SELECT kind, source FROM events WHERE device_id = $1", [REVOKED]);
      expect(events.rows).toEqual([{ kind: "revoked", source: "api" }]);
    });

    const again = await kit.app.inject({ method: "POST", url: `/devices/${REVOKED}/revoke`, cookies: kit.wristband("admin") });
    expect(again.statusCode).toBe(404); // already revoked: nothing changes any more
  });
});
```

Its four tests: (1) the key shown once, the database only stores its fingerprint (`CHECK key_hash`); (2) a second registration gets `409` without overwriting the row (`ON CONFLICT … WHERE registered_at IS NULL`); (3) `GET /devices` doesn't leak the key, without a login `401`, and `/health` names the `package.json` version and `"database":true`; (4) revoking. The difference from the mock tests: the API's answers are checked again straight in the table (`kit.pool.query`). Without `DATABASE_URL_TEST`, `describe.skipIf` skips them all; `beforeEach` deletes this file's devices, so every test stands alone. The six files run at the same time, so each uses its own data (`device_id` `2901…` to `2906…`, emails, rule names). What only a database can prove in each file: the table of Concept 2 and the [backend README](code/backend/README.md#tested-with-a-test-database-module-29). You change the first test above again in [5.2](#52--a-direct-push-to-main-is-refused-3-minutes)–[5.3](#53--l1-the-pr-tryred-is-red-the-merge-button-is-locked-6-minutes).

**You pass this ⭐ step** when `src/integration/` holds seven files: `setup.ts` and six test files.

#### 3.5 ⭐ `.dockerignore` and the script `test:integration` (3 minutes)

`setup.ts` doesn't end in `.test.ts`, so the old line `src/**/*.test.ts` doesn't keep it out of the image. Replace the content of `backend/.dockerignore` with the [code file](code/backend/.dockerignore) (**Copy raw file**); what's new is the last two lines and their comment:

```text
src/integration
.oxlintrc.json
```

In `backend/package.json`, add the script `test:integration` (note the new comma on the `test` line):

```diff
-    "test": "vitest run"
+    "test": "vitest run",
+    "test:integration": "vitest run src/integration"
```

**You pass this ⭐ step** when both lines are in `.dockerignore` and the script `test:integration` is in `package.json`.

#### 3.6 ⭐ 20 green integration tests, then 223 tests at once (8 minutes)

The test database's address is given through the setting `DATABASE_URL_TEST`. In bash, the setting only applies to one command:

```bash
DATABASE_URL_TEST=postgres://postgres:test-not-a-secret@127.0.0.1:5433/smarthome_test npm run test:integration; echo "exit code: $?"
```

In PowerShell (not tested by the author), the setting applies in that window until it's removed:

```powershell
$env:DATABASE_URL_TEST = "postgres://postgres:test-not-a-secret@127.0.0.1:5433/smarthome_test"
npm run test:integration; "exit code: $LASTEXITCODE"
```

**Expected output (the author's lab, laptop; cut):**

```text
> mini-smart-home-backend@1.5.0 test:integration
> vitest run src/integration

 ✓ src/integration/claims.test.ts (3 tests) 4704ms
 ✓ src/integration/firmware-fleet.test.ts (3 tests) 5267ms
 ✓ src/integration/devices.test.ts (4 tests) 6379ms
 ✓ src/integration/rules.test.ts (3 tests) 4370ms
 ✓ src/integration/readings.test.ts (3 tests) 4327ms
 ✓ src/integration/login.test.ts (4 tests) 6413ms

 Test Files  6 passed (6)
      Tests  20 passed (20)
   Duration  14.37s (tests 96%, import 2%, transform 2%)

exit code: 0
```

The order of the files and their times may differ. `tests 96%` = mostly waiting for the migration turn and bcrypt (`login.test.ts`), not slow SQL. These are the "20 green tests" of the [Syllabus](../../SYLLABUS.md#module-29--testing--cicd-every-change-tested-and-deployed-automatically). Now everything at once, like the robot: the same command, with `npm test` instead of `npm run test:integration`.

**Expected output (the author's lab, laptop; cut):**

```text
 Test Files  31 passed (31)
      Tests  223 passed (223)
   Duration  24.47s (tests 68%, import 30%, worker 1%, transform 1%)
exit code: 0
```

This is what the robot runs in the job `test` (Practice 4); there, even one skipped test is red ([Concept 4](#4-lint--test--build-fail-fast)).

**You pass this ⭐ step** when the result is `Tests  20 passed (20)` and then `Tests  223 passed (223)`, both with `exit code: 0`.

#### 3.7 ⭐ A deliberate SQL mistake: 203 mock tests green, the integration tests red (8 minutes)

This is the example of [Concept 2](#2-what-a-mock-cant-see-integration-tests-with-a-test-database). In `src/db/devices.ts` line 44 (the function `registerDevice`), change `now(), $5,` to `now(), upper($5),`, then save; the key fingerprint is now in capitals:

```diff
-       VALUES ($1, CASE WHEN $4::text IS NULL THEN 'unknown' ELSE 'node2' END, $2, $3, $4, now(), $5,
+       VALUES ($1, CASE WHEN $4::text IS NULL THEN 'unknown' ELSE 'node2' END, $2, $3, $4, now(), upper($5),
```

First run it without the test database (PowerShell: `Remove-Item Env:DATABASE_URL_TEST` first): `npm test; echo "exit code: $?"`.

**Expected output (the author's lab, laptop; cut):**

```text
 Test Files  25 passed | 6 skipped (31)
      Tests  203 passed | 20 skipped (223)
exit code: 0
```

Green, because mocks don't run SQL. Then `npm run test:integration` with the test database as in 3.6 (PowerShell: fill in `$env:DATABASE_URL_TEST` again).

**Expected output (the author's lab, laptop; cut):**

```text
{"level":50,…,"msg":"registration of 290100000001 failed: new row for relation \"devices\" violates check constraint \"devices_key_hash_check\""}
     × POST /devices: the key is shown once, the database stores only its SHA-256 fingerprint (CHECK key_hash) 155ms
AssertionError: expected 503 to be 201 // Object.is equality
 Test Files  2 failed | 4 passed (6)
      Tests  6 failed | 14 passed (20)
exit code: 1
```

The JSON line = the `errors-only` log, cut down to `msg`: the `CHECK (key_hash ~ '^[0-9a-f]{64}$')` of migration `010` only accepts lowercase, the database refuses the row, the backend answers `503`, and `toBe(201)` in the first test fails. Red: the four `devices.test.ts` tests and two `firmware-fleet.test.ts` tests; in production, registering a device with a key through `POST /devices` fails. Undo it with `git restore src/db/devices.ts`; `test:integration` must be back at `Tests  20 passed (20)`.

**You pass this ⭐ step** when the 203 tests are green without the test database, `Tests  6 failed | 14 passed (20)` with the test database, then green again after `git restore`.

#### 3.8 The guard refuses a database named `smarthome` (4 minutes)

Safe to try: the address is still the test database at counter 5433, only its name is `smarthome`, and the guard refuses before connecting. In bash:

```bash
DATABASE_URL_TEST=postgres://postgres:test-not-a-secret@127.0.0.1:5433/smarthome npm run test:integration; echo "exit code: $?"
```

PowerShell: fill `$env:DATABASE_URL_TEST` with that address, then run the second line of 3.6.

**Expected output (the author's lab, laptop; cut):**

```text
 FAIL  src/integration/rules.test.ts > integration (test database): automation rules
Error: DATABASE_URL_TEST points at the database "smarthome", not a test database: the database name must end in _test (for example smarthome_test). The integration tests write and delete rows, so they don't run. Never point it at your home database.
 ❯ refuseNonTest src/integration/setup.ts:54:10
 Test Files  6 failed (6)
      Tests  20 skipped (20)
exit code: 1
```

One message per file, without the password: your home database's address will never be used by the integration tests ([🚨](#-troubleshooting)).

#### 3.9 ⭐ Without a database: 20 tests skipped, then `docker stop` and commit (5 minutes)

In PowerShell, first remove the setting: `Remove-Item Env:DATABASE_URL_TEST` (without it, `npm test` in that window still uses the last address: the integration tests aren't skipped, and after `docker stop` they're red, for example `the test database can't be reached …`). Then `npm test`. **Expected output (the author's lab, laptop; cut):** `Test Files  25 passed | 6 skipped (31)` and `Tests  203 passed | 20 skipped (223)`. Even without Docker, every unit test still runs. Stop the test database:

```text
docker stop smarthome-db-test
```

**Expected output (the author's lab, laptop):** `smarthome-db-test`; the container and its data are gone. From the project root (`cd ..`), `git status --short` may only name these `backend` files: `.dockerignore`, `package.json`, `src/server.ts`, `src/routes/health.ts` (changed), and `src/app.ts`, `src/config/server-version.ts`, and the folder `src/integration/` (new). Then, one by one:

```text
git add backend
```

```text
git commit -m "feat: test database and 20 integration tests"
```

Not pushed yet: PR A is opened in Practice 4, together with its robot.

**You pass this ⭐ step** when `npm test` without the test database prints `Tests  203 passed | 20 skipped (223)`, `docker stop` answers `smarthome-db-test`, and that commit is on the branch `feature/robot-tests`.

> ⬆️ **Done with Practice 3?** Continue to [Practice 4](#practice-4--a-checking-robot-on-every-pull-request-40-minutes): the checking robot runs everything you just ran, on every pull request.

### Practice 4 — A checking robot on every pull request (40 minutes)

> 🖥️ **Tools used:** **VS Code** on the laptop, the branch `feature/robot-tests`, a terminal at the **project root**; **GitHub** in the browser (the **Pull requests**, **Checks**, and **Actions** tabs). The VPS and the Pi aren't touched. Concepts used: 3, 4.
>
> ⭐ **Required** — steps 4.1 to 4.5: the robot `ci` checks PR A, is red once on purpose, then green in `verify` and `test` with `Tests  223 passed (223)` (requirement **L0**), and green again on `main` after the merge.

Everything you ran in Practices 2 and 3 is now run by the robot on every pull request: the automatic check promised by the fold *ESLint and Prettier …* in [🔬 Module 16](../../phase-3-backend-data/module-16-backend-typescript-api-git/README.md#-technical-deep-dive-optional). The robot is one file, `.github/workflows/ci.yml`, which you build in five stages (A, then B1–B4) until Practice 9. Stage A holds the first two jobs on the map of [Concept 3](#3-ci-a-robot-that-reads-exit-codes): `verify` and `test`. The project's versions stay 1.5.0 and 1.4.0 until Practice 6.

#### 4.1 ⭐ `.github/workflows/ci.yml` stage A: the jobs `verify` and `test` (15 minutes)

In VS Code, make a `workflows` folder inside `.github/` (if it isn't there yet), then a file `ci.yml` inside it. Paste this block as it is, including the comments and the spaces at the start of the lines (spaces = meaning, Concept 3), then save with **Ctrl + S**:

```yaml
# ci.yml - the checking and deploying robot of Mini Smart Home (Module 29). GitHub Actions reads this file by itself.
#
#   Every pull request to main : verify and test (at the same time) -> build (the images are built as a try, NOT pushed anywhere)
#   Every push to main (= a PR merged): verify and test -> build + push the images to GHCR -> staging (a dress rehearsal on the
#                                 robot's machine) -> tag-release (tag v<version>) -> deploy-vps (over SSH)
# A red job stops every job after it. The Pi isn't contacted from here (GitHub can't knock on a Pi behind a
# router): the Pi deploys that tagged release by itself every 15 minutes (scripts/systemd/smarthome-update.timer).
#
# The job names verify, test, and build = the names of the "status checks" the main branch rule requires (Settings -> Branches).
# Renaming a job means the branch rule has to be changed too.
# Settings on GitHub (Settings -> Secrets and variables -> Actions), only for the path with a VPS:
#   Variables: VPS_HOST         the VPS address; empty = the job deploy-vps is skipped (the free path, the path without a VPS)
#              VPS_USER         the user on the VPS; empty = house
#              VPS_KNOWN_HOSTS  the VPS host key fingerprint (the ssh-keyscan result you have compared); not a secret
#   Secrets  : VPS_SSH_KEY      the robot's SPECIAL private key; on the VPS this key can only run scripts/deploy.sh
# A public repo = anyone can read the robot's log: never print a secret (echo, set -x).
name: ci

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

# The default permissions of the robot's token (GITHUB_TOKEN) for ALL jobs: only read the repo's content. A job that needs more
# writes its own permissions below (build: push images; staging: pull images; tag-release: make a tag). Not named = none.
permissions:
  contents: read

# Two pushes in a row to the same PR branch: the old run is cancelled (only the newest one matters). On main a run that is
# ALREADY running is never cancelled, so two deployments never run at the same time. Only one may WAIT: a third merge that
# comes while one run is running and one is waiting cancels the waiting run (gray,
# "cancelled"). Safe: the newest run carries all the changes before it and releases its own version.
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}

jobs:
  # ---------------------------------------------------------------------------------------------------------------------
  # verify: the cheap and fast things first. The version guard, the firmware, then type check, lint, frontend tests, build, audit.
  # ---------------------------------------------------------------------------------------------------------------------
  verify:
    name: verify
    runs-on: ubuntu-24.04                        # written exactly (not ubuntu-latest): doesn't change silently
    container: node:24.22.1-alpine3.24           # the SAME Node as the backend and dashboard Dockerfiles
    timeout-minutes: 15                          # GitHub's default is 360 minutes: a stuck job is stopped much sooner
    steps:
      # the Node Alpine image doesn't carry git (checkout, check-version) or a full tar (the npm cache)
      - run: apk add --no-cache git tar
      - uses: actions/checkout@v7
        with:
          fetch-depth: 0                         # the full history: check-version compares with main
      # inside the container, the repo folder belongs to another user: without this line git refuses to work there
      - run: git config --global --add safe.directory "$GITHUB_WORKSPACE"
      # .bin files, build/ folders, and keys.h can hold the ESP-NOW key. The robot = a LATE alarm: in a public repo, a key
      # that has been pushed must be replaced, deleting it from Git isn't enough. :(glob) = ** means any number of folders
      # (zero too), icase = .BIN too.
      - name: firmware - the Module 28 test switch off, no .bin, build/, or keys.h in Git
        run: |
          if ! grep -q '^const int TEST_WRONG_KEY = 0;' firmware/node-1-home/config.h; then
            echo "FAIL  firmware/node-1-home/config.h: TEST_WRONG_KEY must be 0 in committed code (Module 28)"
            exit 1
          fi
          bin=$(git ls-files ':(glob,icase)**/*.bin' ':(glob)firmware/**/build/**' ':(glob)**/keys.h')
          if [ -n "$bin" ]; then
            echo "FAIL  firmware or key files are in Git (they can hold the ESP-NOW key): $bin"
            exit 1
          fi
          echo "PASS  TEST_WRONG_KEY = 0, no .bin file, build/ folder, or keys.h in Git"
      - name: npm cache (library downloads reused while package-lock.json stays the same)
        uses: actions/cache@v6
        with:
          path: ~/.npm
          key: npm-verify-${{ hashFiles('backend/package-lock.json', 'frontend/package-lock.json') }}
          restore-keys: npm-verify-
      - name: backend - type check, lint, audit
        working-directory: backend
        run: |
          npm ci
          npm run check
          npm run lint
          npm audit --omit=dev --audit-level=high
      - name: frontend - lint, test, check schema, build, audit
        working-directory: frontend
        run: |
          npm ci
          npm run lint
          npm test
          npm run check-schema
          npm run build
          npm audit --omit=dev --audit-level=high

  # ---------------------------------------------------------------------------------------------------------------------
  # test: 203 unit tests + 20 integration tests with a real test database (runs at the same time as verify)
  # ---------------------------------------------------------------------------------------------------------------------
  test:
    name: test
    runs-on: ubuntu-24.04
    container: node:24.22.1-alpine3.24
    timeout-minutes: 15
    services:
      # A throw-away TEST database: the same image as production (migrations 002-005 need TimescaleDB), empty every time this
      # job starts, thrown away afterwards. From the job container, its address = this service's name (db), as in Docker Compose.
      db:
        image: timescale/timescaledb:2.30.2-pg17
        env:
          POSTGRES_PASSWORD: test-not-a-secret    # not a secret: this database only lives a few minutes on the robot's machine
          POSTGRES_DB: smarthome_test             # ends in _test: the integration tests refuse any other database name
          TIMESCALEDB_TELEMETRY: "off"
        options: >-
          --health-cmd "pg_isready -h 127.0.0.1 -U postgres -d smarthome_test"
          --health-interval 5s --health-timeout 3s --health-retries 30
    env:
      DATABASE_URL_TEST: postgres://postgres:test-not-a-secret@db:5432/smarthome_test
      # src/config/env.ts checks ALL the settings, also when only the migration runs: fill in valid test values. Not real
      # secrets; the integration tests themselves overwrite them again with random values.
      MQTT_URL: mqtt://127.0.0.1:1
      JWT_SECRET: robot-test-not-a-real-secret-0123456789
    steps:
      - run: apk add --no-cache git tar
      - uses: actions/checkout@v7
      - name: npm cache
        uses: actions/cache@v6
        with:
          path: ~/.npm
          key: npm-test-${{ hashFiles('backend/package-lock.json') }}
          restore-keys: npm-test-
      - name: install libraries
        working-directory: backend
        run: npm ci
      - name: migrate the test database twice (the second time must say "0 new migration(s) applied")
        working-directory: backend
        run: |
          DATABASE_URL="$DATABASE_URL_TEST" node src/db/migrate.ts
          DATABASE_URL="$DATABASE_URL_TEST" node src/db/migrate.ts > "$RUNNER_TEMP/second-migration.txt"
          cat "$RUNNER_TEMP/second-migration.txt"
          grep -q '^0 new migration(s) applied' "$RUNNER_TEMP/second-migration.txt"
      # npm test SKIPS the integration tests when DATABASE_URL_TEST is empty, also the tests marked .skip, and its exit code
      # still stays 0. On the laptop that's fine; on the robot it isn't: even one skipped test makes this job red.
      - name: unit tests + integration tests (test database); a skipped test = red
        working-directory: backend
        run: |
          set -o pipefail
          npm test 2>&1 | tee "$RUNNER_TEMP/tests.txt"
          if grep -Eq '[0-9]+ skipped' "$RUNNER_TEMP/tests.txt"; then
            echo "FAIL  a test was skipped: on the robot every test must run, the 20 integration tests too"
            echo "      (DATABASE_URL_TEST filled in under env: of the job test? a test marked .skip?)"
            exit 1
          fi
```

This block = lines 1–54 and 62–157 of the final file [`code/.github/workflows/ci.yml`](code/.github/workflows/ci.yml), which you reach in Practice 9. You insert the rest in stages: the step `version` under the `safe.directory` line ([6.6](#66--stage-b1-the-step-version-in-the-job-verify-2-minutes)), then under the job `test`: `build` ([7.3](#73--stage-b2-the-job-build-for-linuxamd64-and-linuxarm64-8-minutes)), `staging` ([8.2](#82--stage-b3-the-job-staging-with-random-secrets-and-empty-cupboards-10-minutes)), `tag-release` and `deploy-vps` ([9.1](#91--stage-b4-part-1-the-job-tag-release-5-minutes)–[9.2](#92--stage-b4-part-2-the-job-deploy-vps-still-asleep-5-minutes)). Don't copy the final file now: it calls scripts that only come in Practices 6–9. Its comments are the lesson; in addition:

| Part | In addition |
| :-- | :-- |
| the comments of lines 1–16 and the head of the job `verify` | the picture of the complete robot, including the version guard (6.6) and the jobs that only come in Practices 7–9 |
| `on:` | the two triggers of Concept 3, without a `paths` filter: a workflow skipped by a filter makes a required check wait forever ([Concept 11](#11-branch-protection-a-barrier-in-front-of-main)) |
| `permissions`, `concurrency` | the robot's token permissions per job are in [Concept 6](#6-the-image-shop-and-the-robots-permissions-github_token-permissions-secrets-and-variables); an old PR run that hasn't finished is canceled by a new push (4.4) |
| `safe.directory` | without this line `git` refuses to work (the author's simulated robot): `fatal: detected dubious ownership in repository at '/__w/mini-smart-home/mini-smart-home'` |
| `firmware - …` | the Module 28 PR template item (the test switch, `.bin` files), now checked by the robot |
| `backend - …`, `frontend - …` | the commands you usually type on the laptop, preceded by `npm ci` ([Concept 4](#4-lint--test--build-fail-fast)) |
| the job `test` | the test database of 3.1 becomes the service `db` (`--health-cmd`: the robot waits until `pg_isready` passes), then two migrations and 223 tests; one `skipped` test = red (`[0-9]+ skipped` = one or more digits, a space, then `skipped`: Vitest's count, such as `1 skipped`) |

**You pass this ⭐ step** when `.github/workflows/ci.yml` holds the block above with its spaces as they are: two jobs, `verify` and `test`.

#### 4.2 ⭐ Commit, push, and open PR A: two checks run at the same time (5 minutes)

> [!NOTE]
> **Not recorded by the author:** GitHub's screens in 4.2–4.5 (buttons, the **Checks** and **Actions** tabs, check names) are from GitHub's documentation (read 5 November 2026). The same stage A was run by the author's simulated robot, its `run:` steps unchanged; its times are examples on a Raspberry Pi 5, not GitHub's times.

```text
git add .github/workflows/ci.yml
git commit -m "feat: checking robot (ci.yml: verify and test)"
git push -u origin feature/robot-tests
```

**Expected output (the author's lab, laptop; cut):**

```text
 * [new branch]      feature/robot-tests -> feature/robot-tests
branch 'feature/robot-tests' set up to track 'origin/feature/robot-tests'.
```

The three commits of Practices 2–4 are now on GitHub. Open PR A as in [Quick Win Step 3](#step-3--commit-push-and-open-a-pull-request-a-green-check-on-the-checks-tab-4-minutes), with the title `Automatic tests: lint, frontend Vitest, 20 integration tests, and the checking robot` and the description template filled in as usual, then open the **Checks** tab.

**What GitHub shows (from GitHub's documentation, not recorded by the author):** the workflow `ci` with two checks that start at the same time, `ci / verify (pull_request)` and `ci / test (pull_request)`: the workflow name, the job name, then its trigger.

**You pass this ⭐ step** when PR A's **Checks** tab names two checks from the workflow `ci`: `verify` and `test`.

#### 4.3 ⭐ Read the robot's log: `verify` and `test` with 223 tests (8 minutes)

Wait until both are done, then click `verify`: every `- run:` or `- uses:` in `ci.yml` = one step in the log, titled with its `name:` (or its command or action, when it has no `name:`), between steps that the robot adds itself. Open them one by one, then `test`.

**Expected output (the author's lab, simulated robot, 4 November 2026; job `verify`, meaningful lines):**

```text
PASS  TEST_WRONG_KEY = 0, no .bin file, build/ folder, or keys.h in Git
added 227 packages, and audited 228 packages in 15s
Found 0 warnings and 0 errors.
Finished in 124ms on 77 files with 83 rules using 4 threads.
4 moderate severity vulnerabilities
added 441 packages, and audited 442 packages in 43s
Found 0 warnings and 0 errors.
Finished in 355ms on 62 files with 116 rules using 4 threads.
 Test Files  3 passed (3)
      Tests  5 passed (5)
SAME  src/schemas/contract.ts
SAME  src/schemas/rule-basics.ts
✓ 1195 modules transformed.
PWA v2.0.0
found 0 vulnerabilities
```

The order = the order of the `run:` lines: firmware, backend (`npm ci`, `check` without output, lint, the audit that stays green), then frontend (`npm ci`, lint, 5 tests, two `SAME`, build, audit). `PWA v2.0.0` = the version of the package `vite-plugin-pwa`, not your dashboard's version, which in the same log is still `mini-smart-home-frontend@1.4.0`.

**Expected output (the author's lab, simulated robot; job `test`, cut):**

```text
9 new migration(s) applied, 0 applied earlier.
0 new migration(s) applied, 9 applied earlier.
 Test Files  31 passed (31)
      Tests  223 passed (223)
   Start at  01:17:28
```

Above `Test Files` there are 31 lines `✓ src/…`, one per test file; there's no count such as `1 skipped`, so the guard stays quiet. `Start at` is in UTC (08:17 WIB). On the author's simulated robot, `verify` took 118 seconds while `test` took 80 seconds at the same time: a run of 120 seconds (an example). The log's colors are removed here. Red although your code is right? [🚨](#-troubleshooting), the groups **Robot red in `verify`** and **Robot red in `test`**.

**You pass this ⭐ step** when the `test` log prints `Tests  223 passed (223)` without a `FAIL` line, and you can point at the step where the 5 frontend tests run.

#### 4.4 ⭐ L0: red once on purpose, then all green (8 minutes)

Repeat the mistake of [2.4](#24--red-once-on-purpose-wibtime-without-a-time-zone-then-green-again-4-minutes): in `frontend/src/time.ts` line 25, delete `, { timeZone: "Asia/Jakarta" }`, save, then:

```text
git commit -am "try: wibTime without timeZone (red on purpose)"
git push
```

A new push = a new run; your run of 4.3 has already finished, so `concurrency` doesn't cancel it (in the Indonesian edition's lab, the author pushed before its run finished: `cancelled` on the forge). `verify` is now red in the step `frontend - lint, test, check schema, build, audit`; `test` stays green on its own machine.

**Expected output (the author's lab, simulated robot; that step, cut; the last line from the Indonesian edition's forge):**

```text
AssertionError: expected '09:27:10 WIB' to be '16:27:10 WIB' // Object.is equality
 ❯ src/time.test.ts:19:47
      Tests  1 failed | 4 passed (5)
##[error]Process completed with exit code 1.
```

A `run:` block stops at the first command that fails, so `check-schema`, the build, and the frontend audit don't run. Because the robot sets `GITHUB_ACTIONS=true`, Vitest also prints an `::error` command holding that test's file and line; according to GitHub's documentation, that command becomes an annotation on the run page. Undo it with a new commit that reverses the last one:

```text
git revert --no-edit HEAD
git push
```

**Expected output (the author's lab, laptop; first line):** `[feature/robot-tests <sha>] Revert "try: wibTime without timeZone (red on purpose)"`. The next run is green in both checks, as in 4.3. That's requirement **L0**: the robot checks your pull request, and all 223 tests really run.

**You pass this ⭐ step** when `verify` was red because of `AssertionError`, and after `git revert` both of PR A's checks are green and `test` prints `Tests  223 passed (223)`.

#### 4.5 ⭐ Merge PR A, then the robot runs again on `main` (4 minutes)

Merge PR A as in [Module 16's Practice 8](../../phase-3-backend-data/module-16-backend-typescript-api-git/README.md#practice-8--git-for-teams-branches-pull-requests-and-reviews-45-minutes): **Merge pull request** (the option **Create a merge commit**) → **Confirm merge** → **Delete branch**. There's no branch protection yet, so for now that button can still be pressed even when the robot is red; Practice 5 changes that. On the laptop:

```text
git switch main
git pull --prune
git branch -d feature/robot-tests
```

**Expected output (the author's lab, laptop; last line):** `Deleted branch feature/robot-tests (was <sha>).`

A merge = a push to `main`, so the robot runs again: the **Actions** tab, the top run of the workflow `ci` (the trigger `push`), green in `verify` and `test` (the author's simulated robot: 105 seconds). Both checks have now passed in your repo, the condition for requiring them in Practice 5 ([Concept 11](#11-branch-protection-a-barrier-in-front-of-main): within the last 7 days).

> 🔀 **A private repo:** every run counts against the monthly minutes quota.

**You pass this ⭐ step** when `main` on the laptop holds `.github/workflows/ci.yml` and the top `push` run on the **Actions** tab is green in `verify` and `test`.

> ⬆️ **Done with Practice 4?** Read [Concept 11](#11-branch-protection-a-barrier-in-front-of-main), then continue to [Practice 5](#practice-5--branch-protection-a-red-pr-cant-be-merged-20-minutes): branch protection that refuses red PRs, also for you as the repo owner.

### Practice 5 — Branch protection: a red PR can't be merged (20 minutes)

> 🖥️ **Tools used:** **GitHub** in the browser (**Settings** → **Branches**, the **Pull requests** and **Checks** tabs); **VS Code** on the laptop, a terminal at the **project root**. The VPS and the Pi aren't touched. Concepts used: 11.
>
> ⭐ **Required except for a private repo** — steps 5.1 to 5.4: a classic rule for `main` with four settings; a direct push to `main` is refused, and the PR `try/red` whose test is red can't be merged, not even by you (requirement **L1**).

Since [4.5](#45--merge-pr-a-then-the-robot-runs-again-on-main-4-minutes), `verify` and `test` have passed on `main`, so both can now be required. The barrier from [Concept 11](#11-branch-protection-a-barrier-in-front-of-main) is put up once on GitHub's settings screen, without a file; the test change lives only on the throw-away branch `try/red`.

> [!NOTE]
> **Not recorded by the author:** GitHub's screens in 5.1–5.4 (buttons, checkboxes, the merge box) are from GitHub's documentation (read 5 November 2026); their picture is the reconstruction in Concept 11. In the Indonesian edition's lab, the author tried an equivalent rule on a local forge standing in for GitHub: a direct push to `main` was refused, and a red PR couldn't be merged, not even by an admin. Its screen texts aren't GitHub's ([🔬](#-technical-deep-dive-optional) *How the author tested …*); the English edition's lab had no forge. The test log comes from the English edition's simulated robot.

> 🔀 **A private repo:** according to GitHub's documentation, on a free account branch protection is only available for public repos. Skip Practice 5; requirement **L1** can only be reached with a public repo or a paid plan.

#### 5.1 ⭐ A classic rule for `main` in Settings → Branches: four settings (8 minutes)

The steps come from GitHub's documentation *Managing a branch protection rule*:

1. On the `mini-smart-home` repo page, click **Settings** (can't see it? open the dropdown menu in the row of tabs, then click **Settings**).
2. In the sidebar, under **Code, planning, and automation**, click **Branches**.
3. Under **Branch protection rules**, click **Add classic branch protection rule** (a classic rule, not a ruleset: Concept 11).
4. In the **Branch name pattern** field, type `main`.
5. Tick **Require a pull request before merging**, then make sure **Require approvals** below it isn't ticked (untick it if it is): 0 approvals, because you can't approve your own PR.
6. Tick **Require status checks to pass before merging**, then make sure **Require branches to be up to date before merging** is ticked too (according to GitHub's documentation, it's the default). In the search box below it, type `verify` and pick its check, then `test`. `build` follows in [7.6](#76--build-joins-the-branch-rule-three-required-checks-4-minutes), after it first runs in PR B.
7. Tick **Do not allow bypassing the above settings**. Leave the other settings at their defaults.
8. Click **Create**.

Don't skip step 7. According to GitHub's documentation, without that tick the branch rule doesn't apply to repo admins, and the repo owner is an admin: you could still merge a red PR. `verify` or `test` doesn't appear in the search? A required check must have passed in the last 7 days; if 4.5 was longer ago than that, open [🚨](#-troubleshooting), the group **Branch protection**.

**You pass this ⭐ step** when **Settings** → **Branches** holds one rule for `main`, and after you click **Edit** next to it, all four settings are ticked with the required checks `verify` and `test`, while **Require approvals** isn't ticked.

#### 5.2 ⭐ A direct push to `main` is refused (3 minutes)

The first proof: even you can't skip the PR anymore. In the laptop terminal, make sure `git status` is clean (every change committed), then:

```text
git switch main
git pull
git switch -c try/red
```

In `backend/src/integration/devices.test.ts` line 37 (the first test, [3.4](#34--six-integration-test-files-then-read-devicestestts-10-minutes)), change `toBe(201)` to `toBe(200)`, save, then try to send its commit straight to `main`:

```text
git commit -am "try: integration test red on purpose"
git push origin try/red:main
```

`try/red:main` means "send the content of the branch `try/red` on the laptop to the branch `main` on GitHub", a shortcut without a PR. GitHub refuses it, and Git exits with code `1`; its last line is `error: failed to push some refs to …` (Git's general form, the same on the local forge of the Indonesian edition's lab). Above it GitHub writes the reason. According to the example in GitHub's documentation (*Troubleshooting required status checks*, read 5 November 2026), it reads roughly `remote: error: GH006: Protected branch update failed for refs/heads/main.`, followed by one line with the cause. `main` on GitHub doesn't change; the commit stays on the branch `try/red` on the laptop.

The push was accepted instead, without an `error:` line? The rule doesn't bind you yet, for example because step 7 of 5.1 was skipped, and the red test is now on `main`. Fix the rule first ([🚨](#-troubleshooting) *A red PR can still be merged …*), then bring `main` back through a PR holding the reverting commit (not `git push --force`, which overwrites the history):

```text
git switch main
git pull
git switch -c undo/red
git revert --no-edit HEAD
git push -u origin undo/red
```

Open its PR, merge it once it's green, then delete its branch as in [4.5](#45--merge-pr-a-then-the-robot-runs-again-on-main-4-minutes), but the last line on the laptop becomes `git branch -D try/red undo/red`. After that, repeat 5.2 from the start.

**You pass this ⭐ step** when that push is refused and the newest commit of `main` on GitHub isn't `try: integration test red on purpose`.

#### 5.3 ⭐ L1: the PR `try/red` is red, the merge button is locked (6 minutes)

Now the right way:

```text
git push -u origin try/red
```

**Expected output (the author's lab, laptop; cut):**

```text
 * [new branch]      try/red -> try/red
branch 'try/red' set up to track 'origin/try/red'.
```

Open a pull request as in [Quick Win Step 3](#step-3--commit-push-and-open-a-pull-request-a-green-check-on-the-checks-tab-4-minutes), with the title `try red (don't merge)`. The robot runs: `verify` green, `test` red. Open the `test` log in the **Checks** tab.

**Expected output (the author's lab, simulated robot; job `test`, cut; the last line from the Indonesian edition's forge):**

```text
     × POST /devices: the key is shown once, the database stores only its SHA-256 fingerprint (CHECK key_hash) 236ms
AssertionError: expected 201 to be 200 // Object.is equality
 ❯ src/integration/devices.test.ts:37:31
 Test Files  1 failed | 30 passed (31)
      Tests  1 failed | 222 passed (223)
##[error]Process completed with exit code 1.
```

One red test out of 223 is enough to make the job `test` red (79 seconds on the author's simulated robot, an example). Open the PR again from the **Pull requests** tab, then scroll to the merge box at the bottom.

**What GitHub shows (from GitHub's documentation, not recorded by the author):** a failed required check makes the PR unmergeable, and thanks to **Do not allow bypassing the above settings**, the ban also applies to repo admins, meaning you: there's no option to bypass it. The documentation doesn't quote the merge box's exact wording; it looks roughly like the reconstruction in [Concept 11](#11-branch-protection-a-barrier-in-front-of-main). The **Merge pull request** button can still be pressed, or there's an option to merge anyway? Step 7 of 5.1 was skipped: [🚨](#-troubleshooting) *A red PR can still be merged …*.

Together with the refusal in 5.2, this is requirement **L1**: a PR whose tests fail can't be merged, and `main` can't be changed without a PR, not even by the repo owner.

**You pass this ⭐ step** when `test` in the PR `try/red` is red and its merge box refuses without an option to bypass the rule.

#### 5.4 ⭐ Close the PR without merging, then delete the branch `try/red` (3 minutes)

Close the PR as in [Quick Win Step 5](#step-5--close-the-pull-request-without-merging-then-delete-its-branch-2-minutes): **Close pull request**, then **Delete branch**. On the laptop:

```text
git switch main
git pull --prune
git branch -D try/red
```

**Expected output (the author's lab, laptop; last line):** `Deleted branch try/red (was <sha>).`

A capital `-D` because this branch was never merged; `toBe(200)` disappears with it. Branch protection is a GitHub setting, not a file, so Practice 5 changes no file on `main`. From now on every change, yours too, comes in through a green PR.

**You pass this ⭐ step** when the PR `try/red` is closed without merging, its branch is gone on GitHub and on the laptop, and the `main` rule is still there in **Settings** → **Branches**.

> ⬆️ **Done with Practice 5?** Read [Concept 10](#10-semver-changelog-and-tags-one-number-then-forward-to-go-back), then continue to [Practice 6](#practice-6--one-version-number-200-the-version-guard-changelogmd-and-the-version-on-screen-30-minutes): one version number 2.0.0 on the new branch `feature/pipeline`.

### Practice 6 — One version number 2.0.0, the version guard, `CHANGELOG.md`, and the version on screen (30 minutes)

> 🖥️ **Tools used:** **VS Code** on the laptop, the new branch `feature/pipeline`, a terminal at the **project root** (briefly in `backend` and `frontend`). No Docker; the VPS and the Pi aren't touched. Concepts used: 10.
>
> ⭐ **Required** — steps 6.1 to 6.7: one number 2.0.0 in 10 places and on the dashboard screen, the first `CHANGELOG.md`, and a version guard that writes `PASS`, then `FAIL` when one number differs on purpose.

Practices 6–9 fill **PR B**, which is opened in 7.4. Backend 1.5.0 and dashboard 1.4.0 become one number, 2.0.0, guarded by the version guard on the laptop and on the robot ([Concept 10](#10-semver-changelog-and-tags-one-number-then-forward-to-go-back)). In PowerShell (not tested by the author), replace `echo "exit code: $?"` with `"exit code: $LASTEXITCODE"`.

#### 6.1 ⭐ The branch `feature/pipeline` and three `.gitattributes` lines (3 minutes)

In the laptop terminal:

```text
git switch main
git pull
git switch -c feature/pipeline
```

Without a GitHub account (not tested by the author): replace `git pull` (it fails without `origin`) with `git merge feature/robot-tests` so `main` holds Practices 2–3.

This week brings three new kinds of files that programs on Linux read: `.mjs` (the version guard), and `.service` and `.timer` (systemd on the Pi). Replace the contents of `.gitattributes` at the project root with [the code file](code/.gitattributes) (**Copy raw file**); what's new are the last three lines and their comment:

```text
*.mjs text eol=lf
*.service text eol=lf
*.timer text eol=lf
```

Git stores and writes those files with LF line endings, on Windows too. The rule goes in before the files are created, so they're LF from the first `git add`.

**You pass this ⭐ step** when your branch is `feature/pipeline` and `.gitattributes` ends with the three lines above.

#### 6.2 ⭐ One number 2.0.0: `npm version`, three `image:` lines, and `.env.example` (6 minutes)

Raise the number in both folders with the command from [8.2 of Module 21](../../phase-3-backend-data/module-21-device-broker-security/README.md#82-backend-v100-7-minutes):

```text
cd backend
npm version 2.0.0 --no-git-tag-version
cd ../frontend
npm version 2.0.0 --no-git-tag-version
cd ..
```

**Expected output (the author's lab, laptop):** `v2.0.0`, once per folder; six lines change: `"version"` in each `package.json` and two places in each `package-lock.json`. No commit and no tag: the tag `v2.0.0` is made by the robot (Practice 9). The backend code doesn't need to change: since Practice 3, `/health` and `/docs` read the number from `package.json`.

Replace the contents of `compose.cloud.yml` with [the code file](code/compose.cloud.yml) (**Copy raw file**). The three `image:` lines (line 210 `migrate`, 227 `backend`, 263 `web`) now have the same tag, and their comments describe the new way: the robot builds, the VPS and the Pi only pull.

```yaml
    image: ${IMAGE_REGISTRY:?fill in IMAGE_REGISTRY in .env}/mini-smart-home-backend:2.0.0
# …
    image: ${IMAGE_REGISTRY:?fill in IMAGE_REGISTRY in .env}/mini-smart-home-backend:2.0.0
# …
    image: ${IMAGE_REGISTRY:?fill in IMAGE_REGISTRY in .env}/mini-smart-home-web:2.0.0
```

There's no new service or `.env` setting. Replace [`.env.example`](code/.env.example) too (**Copy raw file**); the only new part is the comment above `IMAGE_REGISTRY`: the shop the VPS and the Pi pull from must be exactly the shop the robot pushes to, `ghcr.io/<account in lowercase>` (Practice 10).

**You pass this ⭐ step** when both `package.json` files say `"version": "2.0.0"` and all three `image:` lines end with `:2.0.0`.

#### 6.3 ⭐ The version on screen: `__WEB_VERSION__` from `package.json` (5 minutes)

The deployed number shows under the dashboard title. Replace the contents of `frontend/vite.config.ts` with [the code file](code/frontend/vite.config.ts) (**Copy raw file**). The core is two lines:

```ts
const pkg: { version: string } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
// …
  define: { __WEB_VERSION__: JSON.stringify(pkg.version) },
```

Every time Vite runs (`npm run dev`, `npm run build`, `npm test`), it reads `package.json` and replaces every `__WEB_VERSION__` in the dashboard code with `"2.0.0"`. So that TypeScript knows that name, right-click the **`src`** folder in `frontend` → **New File…** → `version.d.ts`:

```ts
// version.d.ts - Module 29: tells TypeScript that __WEB_VERSION__ exists. Its content (for example "2.0.0") is written by Vite at
// build time and during npm run dev from "version" in package.json (define in vite.config.ts), so it's in no file under src/.
declare const __WEB_VERSION__: string;
```

Then replace [`src/pages/Login.tsx`](code/frontend/src/pages/Login.tsx) and [`src/components/Layout.tsx`](code/frontend/src/components/Layout.tsx) (**Copy raw file**). Both get the same line right under the title: `<p className="text-xs text-slate-500 dark:text-slate-400">v{__WEB_VERSION__}</p>`. In the dashboard header (`Layout.tsx`), the title and the version are wrapped in one `<div>`: at a width of 375 px, the version and the `Reconnecting…` badge next to the title make the title fold (the author's lab). In the `frontend` terminal (`cd frontend`), run `npm run lint`, `npm test`, then `npm run build`.

**Expected output (the author's lab, laptop; cut):**

```text
Found 0 warnings and 0 errors.
Finished in 259ms on 63 files with 116 rules using 4 threads.
 Test Files  3 passed (3)
      Tests  5 passed (5)
✓ 1195 modules transformed.
PWA v2.0.0
```

63 files = the 59 of 2.2, three test files, and `version.d.ts`. `PWA v2.0.0` is still the version of the `vite-plugin-pwa` package (2.3), not your number. On the production screen: `v2.0.0` in [10.1](#101--the-last-time-you-ssh-in-to-deploy-sh-scriptsdeploysh-pulls-200-10-minutes), `v2.0.1` in [12.4](#124--l2-the-robot-deploys-to-the-vps-the-login-screen-says-v201-8-minutes). Go back to the project root (`cd ..`).

**You pass this ⭐ step** when all three commands in `frontend` finish without an error.

#### 6.4 ⭐ The version guard `scripts/check-version.mjs`: one number in 10 places, only allowed to go up (5 minutes)

The guard is one JavaScript file that Node.js runs directly, without an npm package. Right-click the **`scripts`** folder at the project root → **New File…** → `check-version.mjs`, then paste the contents of [the code file](code/scripts/check-version.mjs) (**Copy raw file**). Its header = how to use it:

```js
//   node scripts/check-version.mjs                    -> the version number the SAME in every place?
//   BASE=origin/main node scripts/check-version.mjs   -> + compared with the target branch (BASE, fetch it first with git fetch):
//                                                        if what gets DEPLOYED to the VPS/Pi changed, did the version go up (SemVer)?
//   PowerShell: $env:BASE = "origin/main"; node scripts/check-version.mjs   (afterwards: Remove-Item Env:BASE)
```

Part 1 of the script collects the number from 10 places: two `package.json` files, two places in each lock, three `image:` lines, and the top release entry of `CHANGELOG.md` (6.5). One that differs = `FAIL` with a table of every place; a pre-release number such as `2.1.0-rc.1` is refused too. Part 2 (only when `BASE` is filled in) compares your branch with `main`:

```js
  const deployed = changed.filter(isDeployed);
  // …
  if (!goesUp && version !== baseVersion) {
  // …
  } else if (deployed.length > 0 && !goesUp) {
    problems.push(`what gets deployed to the VPS/Pi changed (${examples}) but the version is still ${version} (= ${base}). Without a new `
```

A number lower than on `main` = `FAIL` ([13.1](#131-the-revert-button-on-pr-c-the-version-guard-refuses-a-lower-version-5-minutes)); a **deployed** file changed but the number didn't go up = `FAIL` ([12.1](#121--the-branch-fixlogin-text-one-text-on-the-login-screen-the-version-guard-refuses-4-minutes)). The list of "what gets deployed" is in the function `isDeployed()`, the same as Concept 10. You can write this part yourself in [🧩 Level 2](#level-2--the-version-guard-the-empty-the-version-must-go-up-part-fill-in-the-blanks-30-minutes).

**You pass this ⭐ step** when `scripts/check-version.mjs` exists and you can point at both rules of part 2 above.

#### 6.5 ⭐ `CHANGELOG.md`: a notebook of changes for humans (4 minutes)

Create `CHANGELOG.md` at the project root from [the code file](code/CHANGELOG.md) (**Copy raw file**), then replace `2026-11-04` with today's date, still year-month-day:

```markdown
## [Unreleased]

## [2.0.0] - 2026-11-04

Mini Smart Home v2.0: a production pipeline (Module 29). MAJOR because the way of DEPLOYING changed, not the API: the VPS and
the free-path Pi no longer build their own images but pull the images the robot builds for two kinds of processors; the Pi
updates itself with a systemd timer; the `main` branch is guarded by a branch rule.

### Added
<!-- … -->
```

Its header (cut here) states the house rules. `## [Unreleased]` stays empty for now; below it, one section per release: the reason for MAJOR, then `### Added` and `### Changed`, written for the people who deploy, not a list of commits. The guard reads the line `## [2.0.0] - <date>` exactly: a date in another form, for example `4-11-2026`, is answered with `FAIL  CHANGELOG.md: no release entry of the form "## [x.y.z] - YYYY-MM-DD" yet` (the code's wording). This `## [2.0.0]` section also becomes the content of the tag `v2.0.0` ([9.6](#96--the-first-tag-v200-it-holds-that-versions-changelog-notes-3-minutes)).

**You pass this ⭐ step** when `CHANGELOG.md` at the project root holds `## [Unreleased]` above `## [2.0.0] - <your date>`.

#### 6.6 ⭐ Stage B1: the step `version` in the job `verify` (2 minutes)

Open `.github/workflows/ci.yml` from [4.1](#41--githubworkflowsciyml-stage-a-the-jobs-verify-and-test-15-minutes). In the job `verify`, paste these seven lines right under the `safe.directory` line and above the comment `# .bin files, …`, with the spaces as they are:

```yaml
      - name: version - one number everywhere; what gets deployed changes = the version goes up
        run: |
          if [ "$GITHUB_EVENT_NAME" = pull_request ]; then
            BASE="origin/$GITHUB_BASE_REF" node scripts/check-version.mjs
          else
            node scripts/check-version.mjs
          fi
```

In a pull request, GitHub fills `GITHUB_BASE_REF` with `main`: the robot runs both parts, like `BASE=origin/main` on the laptop. On a push to `main` only part 1: the "goes up" rule was already guarded in the PR. This step is first on purpose, before `npm ci`: a number someone forgot to raise turns red at once ([Concept 4](#4-lint--test--build-fail-fast)). Without the `safe.directory` line, the guard in a PR stops with `FAIL  origin/main can't be compared with HEAD: …` ([🚨](#-troubleshooting), the group **Robot red in `verify`**).

**You pass this ⭐ step** when the step `version - …` sits between the `safe.directory` line and the step `firmware - …`, lined up with the `- run:` above it.

#### 6.7 ⭐ The version guard on the laptop: `PASS`, `FAIL` on purpose, then commit (5 minutes)

The guard sees changes through `git diff`, which doesn't know new files before they're `git add`-ed. At the project root, make sure `git status --short` only names this practice's files, then:

```bash
node scripts/check-version.mjs
git add -A
git fetch
BASE=origin/main node scripts/check-version.mjs; echo "exit code: $?"
```

PowerShell: the last line as in the script's header (6.4).

**Expected output (the author's lab, laptop):**

```text
PASS  one version number 2.0.0 in 10 places (package.json, package-lock.json, compose.cloud.yml, CHANGELOG.md)
PASS  one version number 2.0.0 in 10 places (package.json, package-lock.json, compose.cloud.yml, CHANGELOG.md); compared with origin/main (1.5.0): the version went up, 9 deployed files changed
exit code: 0
```

The first line = the robot on a push, the second line = the robot in a PR. The nine deployed files: two `package.json` files, two locks, `compose.cloud.yml`, and the four dashboard files of 6.3; `.gitattributes`, `.env.example`, `CHANGELOG.md`, `check-version.mjs`, and `ci.yml` aren't. `git add -A` isn't a commit yet. Without a GitHub account: `BASE=main` (not tested by the author).

Now differ on purpose: in `compose.cloud.yml` line 263 (`web`), replace `2.0.0` with `1.4.0`, save, then `node scripts/check-version.mjs; echo "exit code: $?"`.

**Expected output (the author's lab, laptop):**

```text
FAIL  the version number must be the SAME in all these places; now there are 2 numbers (2.0.0, 1.4.0):
        2.0.0  backend/package.json
        2.0.0  frontend/package.json
        2.0.0  backend/package-lock.json ("version")
        2.0.0  backend/package-lock.json (packages[""].version)
        2.0.0  frontend/package-lock.json ("version")
        2.0.0  frontend/package-lock.json (packages[""].version)
        2.0.0  compose.cloud.yml (image mini-smart-home-backend)
        2.0.0  compose.cloud.yml (image mini-smart-home-backend)
        1.4.0  compose.cloud.yml (image mini-smart-home-web)
        2.0.0  CHANGELOG.md (top release entry)
      Raise them together: in the folders backend and frontend "npm version <version> --no-git-tag-version"
      (package.json + package-lock.json), the three image lines in compose.cloud.yml, and the entry
      "## [<version>] - <date>" in CHANGELOG.md.
exit code: 1
```

The table points at the place that differs (the two backend lines = `migrate` and `backend`), and its last three lines = the recipe for raising the version in [12.2](#122--version-201-patch-in-10-places-and-a-changelogmd-entry-5-minutes) and [13.2](#132-version-202-holds-the-content-of-200-the-201-entry-stays-recorded-7-minutes). Change `1.4.0` back to `2.0.0`, save, then repeat `node scripts/check-version.mjs`: `PASS` again (the author's lab). Commit:

```text
git add -A
git commit -m "feat: one version number 2.0.0, version guard, CHANGELOG"
```

Not pushed yet: PR B is opened in 7.4, after the job `build`.

**You pass this ⭐ step** when the guard writes `PASS` (`9 deployed files changed`), then `FAIL` with `exit code: 1`, then `PASS` again, and `git status --short` is empty after the commit.

> ⬆️ **Done with Practice 6?** Read [Concept 5](#5-one-image-for-two-processors-built-by-the-robot-without-emulation) and [Concept 6](#6-the-image-shop-and-the-robots-permissions-github_token-permissions-secrets-and-variables), then continue to [Practice 7](#practice-7--one-image-two-processors-pushed-to-ghcr-by-the-robot-35-minutes).

### Practice 7 — One image, two processors, pushed to GHCR by the robot (35 minutes)

> 🖥️ **Tools used:** **VS Code** on the laptop, the branch `feature/pipeline`, a terminal at the **project root**; **GitHub** in the browser (the **Checks** tab of PR B, **Settings** → **Branches**). The VPS and the Pi aren't touched. Concepts used: 5, 6.
>
> ⭐ **Required** — steps 7.1 and 7.3 to 7.6: the job `build` builds two-processor images in PR B without pushing them, then becomes the third required check.

#### 7.1 ⭐ Two cross-processor Dockerfiles with `$BUILDPLATFORM` (8 minutes)

Replace the whole contents of [`backend/Dockerfile`](code/backend/Dockerfile) and [`frontend/Dockerfile`](code/frontend/Dockerfile) with **Copy raw file**. Apart from comments, this is all that changes in the backend (`-` old, `+` new):

```diff
-FROM node:24.22.1-alpine3.24 AS packages
+FROM --platform=$BUILDPLATFORM node:24.22.1-alpine3.24 AS packages
 # …
 RUN npm ci --omit=dev
+RUN mkdir -p /app/firmware-data
 # …
 FROM node:24.22.1-alpine3.24
 # …
-RUN mkdir -p /app/firmware-data && chown node:node /app/firmware-data
+COPY --from=packages --chown=node:node /app/firmware-data /app/firmware-data
```

In the frontend, only the `build` stage:

```diff
-FROM node:24.22.1-alpine3.24 AS build
+FROM --platform=$BUILDPLATFORM node:24.22.1-alpine3.24 AS build
```

`$BUILDPLATFORM` = the builder's processor (GitHub's robot: amd64): `npm ci` and `npm run build` run once there for both processors (bcrypt brings ready-made programs for both), and the final stage per processor is just a `COPY`, so no emulator ([Concept 5](#5-one-image-for-two-processors-built-by-the-robot-without-emulation)).

**You pass this ⭐ step** when the first stage of both `Dockerfile`s starts with `FROM --platform=$BUILDPLATFORM` and the backend's final stage has no `RUN`.

#### 7.2 Build on the laptop for your own processor (optional, 4 minutes)

The new `Dockerfile`s can still be built on the laptop (Docker running, the laptop's `.env` holding the required settings), for your processor only:

```text
docker compose build
```

Compose also builds `migrate` (its mold is the same as `backend`'s), so the first try can stop with `image "…/mini-smart-home-backend:2.0.0": already exists`; repeat the command ([🚨](#-troubleshooting) *The first `docker compose build` …*). **Don't** `docker push` the result: the robot never overwrites a `2.0.0` tag that already exists, so its two-processor image would never be made.

#### 7.3 ⭐ Stage B2: the job `build` for `linux/amd64` and `linux/arm64` (8 minutes)

In `ci.yml`, leave one empty line under the last line of the job `test` (`fi`), put the cursor in the leftmost column, then paste this block as it is (`build:` lined up with `test:`):

```yaml
  # ---------------------------------------------------------------------------------------------------------------------
  # build: one image for two kinds of processor (amd64 = VPS, arm64 = Pi) without emulation: the Node stage of the Dockerfile
  # runs on the robot's processor ($BUILDPLATFORM), the final stage only copies. Pull request: only built. Push to main: pushed to GHCR.
  # ---------------------------------------------------------------------------------------------------------------------
  build:
    name: build
    needs: [verify, test]                        # only when both are green
    runs-on: ubuntu-24.04                        # an ordinary robot machine (amd64) that already carries Docker and buildx
    timeout-minutes: 30
    permissions:
      contents: read
      packages: write                            # the robot's token may push images to this repo's GHCR packages
    outputs:
      registry: ${{ steps.names.outputs.registry }}
      version: ${{ steps.names.outputs.version }}
      new-release: ${{ steps.names.outputs.new-release }}
    steps:
      - uses: actions/checkout@v7
      - name: registry name, version, and new release or not
        id: names
        run: |
          # GHCR only accepts lowercase: ${GITHUB_REPOSITORY_OWNER,,} = the repo owner's account name in lowercase
          echo "registry=ghcr.io/${GITHUB_REPOSITORY_OWNER,,}" >> "$GITHUB_OUTPUT"
          # one number for the backend and web (check-version in the job verify already made sure they are the same)
          version=$(node -p "require('./backend/package.json').version")
          echo "version=$version" >> "$GITHUB_OUTPUT"
          echo "short=${GITHUB_SHA::7}" >> "$GITHUB_OUTPUT"
          # the tag v<version> isn't on GitHub yet = a new release (staging, the tag, and deploying only for a new release). Exit
          # code 2 = that tag really doesn't exist; any other code = GitHub can't be asked: red, don't guess
          if git ls-remote --exit-code --tags origin "refs/tags/v$version" > /dev/null; then
            echo "new-release=no" >> "$GITHUB_OUTPUT"
            echo "v$version already released: no new release from this push"
          else
            code=$?
            [ "$code" = 2 ] || { echo "FAIL  the release tags on GitHub can't be checked (ls-remote, code $code)"; exit 1; }
            echo "new-release=yes" >> "$GITHUB_OUTPUT"
          fi
      - uses: docker/setup-buildx-action@v4      # the BuildKit builder: one command for several kinds of processor
      - name: log in to GHCR (only on a push to main)
        if: github.event_name == 'push'
        uses: docker/login-action@v4
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}  # a temporary token GitHub makes for this job, not your personal token
      # Only for a NEW release: a version that already has a tag is surely in the registry (the tag is made after staging pulled
      # it), so a push that only changes documents builds and pushes nothing (the image steps below are skipped too).
      - name: already in the registry? (a version tag is never overwritten)
        id: exists
        if: github.event_name == 'push' && steps.names.outputs.new-release == 'yes'
        env:
          REGISTRY: ${{ steps.names.outputs.registry }}
          VERSION: ${{ steps.names.outputs.version }}
        run: |
          for name in backend web; do
            if docker buildx imagetools inspect "$REGISTRY/mini-smart-home-$name:$VERSION" > /dev/null 2>&1; then
              echo "$name=yes" >> "$GITHUB_OUTPUT"
              echo "mini-smart-home-$name:$VERSION is already in the registry: not built and not pushed again"
            else
              echo "$name=no" >> "$GITHUB_OUTPUT"
            fi
          done
      # The image index also holds the build's provenance note (attestation, written as platform unknown/unknown): not a third image.
      - name: backend image (amd64 + arm64)
        if: github.event_name == 'pull_request' || steps.exists.outputs.backend == 'no'
        uses: docker/build-push-action@v7
        with:
          context: ./backend
          platforms: linux/amd64,linux/arm64
          push: ${{ github.event_name == 'push' }}
          tags: |
            ${{ steps.names.outputs.registry }}/mini-smart-home-backend:${{ steps.names.outputs.version }}
            ${{ steps.names.outputs.registry }}/mini-smart-home-backend:sha-${{ steps.names.outputs.short }}
          # links the GHCR package to this repo (overrides the LABEL <account> line in the Dockerfile)
          labels: org.opencontainers.image.source=${{ github.server_url }}/${{ github.repository }}
      - name: web image (amd64 + arm64)
        if: github.event_name == 'pull_request' || steps.exists.outputs.web == 'no'
        uses: docker/build-push-action@v7
        with:
          context: ./frontend
          build-args: VITE_API_BASE=/api           # the same as args in compose.cloud.yml and handle_path in the Caddyfile
          platforms: linux/amd64,linux/arm64
          push: ${{ github.event_name == 'push' }}
          tags: |
            ${{ steps.names.outputs.registry }}/mini-smart-home-web:${{ steps.names.outputs.version }}
            ${{ steps.names.outputs.registry }}/mini-smart-home-web:sha-${{ steps.names.outputs.short }}
          labels: org.opencontainers.image.source=${{ github.server_url }}/${{ github.repository }}
```

Your file now = lines 1–244 of [the final file](code/.github/workflows/ci.yml). Its comments are lessons (permissions, a lowercase shop, the `sha-…` tag: Concept 6). Outside the comments: `${{ … }}` is filled in by GitHub before the step runs (`$version` is filled in by the robot's terminal); `if:` = the step runs only when its condition is true; `registry=…`, written by the step `id: names` to `$GITHUB_OUTPUT`, becomes `steps.names.outputs.registry`, and `outputs` passes it on to the jobs of Practices 8–9; `short` = the first 7 characters of the commit.

**You pass this ⭐ step** when `ci.yml` holds three jobs with `build:` lined up with `test:`.

#### 7.4 ⭐ Commit, push, and open PR B: `build` builds without pushing (7 minutes)

> [!NOTE]
> **Not recorded by the author:** GitHub's screens in 7.4–7.6 are from GitHub's documentation (read 5 November 2026); the files were run by the author's simulated robot.

```text
git commit -am "feat: two-processor images without emulation (job build)"
git push -u origin feature/pipeline
```

Open PR B like PR A, with the title `Pipeline 2.0.0: one version number, two-processor images, staging, tagged releases, and the deployer`. In the **Checks** tab, `verify` and `test` run at the same time, then the third check `ci / build (pull_request)` (the name from GitHub's documentation). On the author's simulated robot, the step `version` now counts 11 deployed files changed: the 9 of 6.7 + two `Dockerfile`s.

**Expected output (the author's lab, simulated robot; job `build`, backend image, cut):**

```text
#10 [linux/arm64 packages 4/5] RUN npm ci --omit=dev
#14 [linux/amd64 stage-1 3/7] COPY --from=packages /app/node_modules ./node_modules
#12 [linux/arm64 stage-1 3/7] COPY --from=packages /app/node_modules ./node_modules
```

`RUN` shows up once, for the builder's processor; the final stage's `COPY` twice: two images without an emulator. The author's simulated robot machine is arm64; on GitHub's robot (amd64), the `packages` stage says `linux/amd64` (not recorded by the author). The web image is the same. In the Indonesian edition's forge lab, each image ended with `WARNING: No output specified …` = the result stays only in the builder's cache, it isn't pushed (the English lab's simulation set its own output, so no warning). The Indonesian edition's simulated robot: `build` 91 seconds, the run 208 seconds (an example, not GitHub's time). Why not emulation or an ARM64 runner: [🔬](#-technical-deep-dive-optional) *Three ways to two processors …*.

**You pass this ⭐ step** when all three checks of PR B are green and the `build` log holds the final stage's `COPY` for `linux/amd64` and `linux/arm64`.

#### 7.5 ⭐ No image is pushed to GHCR from a PR (4 minutes)

In the 7.3 block, the condition `github.event_name == 'push'` is on the login step, on the step `already in the registry? …`, and in the `push:` of both `build-push-action`s; from a PR, `push` is `false`. In the PR log of the author's simulated robot, both steps were skipped. The reasons (Concept 6): a push from a PR would lock its version number with code that isn't merged yet, and a PR from a fork only gets a read token.

**You pass this ⭐ step** when you can point at all three conditions and name both reasons.

#### 7.6 ⭐ `build` joins the branch rule: three required checks (4 minutes)

> 🔀 **A private repo:** no branch protection (Practice 5), so skip 7.6.

`build` has passed once (7.4), so it can now be required (GitHub's documentation *Managing a branch protection rule*):

1. **Settings** → **Branches** as in [5.1](#51--a-classic-rule-for-main-in-settings--branches-four-settings-8-minutes), then click **Edit** to the right of the `main` rule.
2. Under **Require status checks to pass before merging**, type `build` in the search box and pick its check.
3. Click **Save changes**.

All three checks are required separately because a skipped job reports success (Concept 11): if `test` is red, `build` is skipped. This setting needs no commit.

**You pass this ⭐ step** when the `main` rule requires `verify`, `test`, and `build`.

> ⬆️ **Done with Practice 7?** Read [Concept 9](#9-staging-vs-production-the-dress-rehearsal-vs-the-show), then continue to [Practice 8](#practice-8--throw-away-staging-on-the-robots-machine-25-minutes): throw-away staging. PR B stays open until [9.5](#95--merge-pr-b-the-robot-pushes-the-200-images-staging-passes-the-tag-is-made-8-minutes).

### Practice 8 — Throw-away staging on the robot's machine (25 minutes)

> 🖥️ **Tools used:** **VS Code** on the laptop, the branch `feature/pipeline` (PR B still open since 7.4), a terminal at the **project root**. No Docker; the VPS and the Pi aren't touched. Concepts used: 9.
>
> ⭐ **Required** — steps 8.1 to 8.4: `scripts/smoke-test.sh` and the job `staging` are on your branch, you can read a red rehearsal's log, and both are committed.

Stage B3 adds the dress rehearsal from [Concept 9](#9-staging-vs-production-the-dress-rehearsal-vs-the-show) to the robot: a new release is started on the robot's machine with fake data, then smoke tested. This practice only prepares the files.

#### 8.1 ⭐ The smoke test `scripts/smoke-test.sh`: four checks that only read (6 minutes)

Right-click the **`scripts`** folder at the project root → **New File…** → `smoke-test.sh`, then paste the contents of [the code file](code/scripts/smoke-test.sh) (**Copy raw file**). Its header lists the four checks:

```sh
#   1. after 15 seconds no service keeps crashing (Restarting). "up --wait" can only wait for services that have a
# …
#   2. the backend and web run with images tagged with that version
#   3. the backend's GET /health: "version" = that version and "database": true (/health still always answers 200; monitors = Module 30)
#   4. the dashboard through Caddy: the main page, and /api/health (Caddy forwards /api to the new backend)
# Exit code 0 = everything PASSES; 1 = something FAILED, the message says which. This script only READS: it starts,
# stops, or changes nothing.
```

Below it, each check is only a few lines: (1) `sleep 15`, then `docker compose ps --status restarting` (a service that only crashes after running ±10 seconds can slip through); (2) the image column of `docker compose ps`; (3) `/health` is asked with `node` from INSIDE the backend container, because the Node image carries no `curl`; `"broker":false` is only a `WARNING` (a backend that just started may still be connecting); (4) without a domain (staging, the free-path Pi), `wget` inside the web container asks Caddy; with a domain (the VPS), `curl --resolve` uses real HTTPS to the machine itself, without DNS (not recorded by the author). If everything passes, the output is six `PASS` lines, ending with `PASS  smoke test of version <version>` (9.5); a failure stops at a `FAIL  …` line (8.3). The robot and `scripts/deploy.sh` call it as `sh scripts/smoke-test.sh <version>`, so the file doesn't need to be marked executable.

**You pass this ⭐ step** when `scripts/smoke-test.sh` sits next to `check-version.mjs` and you can point at the check that catches a service that keeps crashing although `up --wait` writes `Healthy`.

#### 8.2 ⭐ Stage B3: the job `staging` with random secrets and empty cupboards (10 minutes)

Open `.github/workflows/ci.yml`. The job `build` from 7.3 is now the last one: paste this block at the end of the file, after the web image's `labels:` line, separated by one empty line. Keep the spaces at the start of the lines as they are.

```yaml
  # ---------------------------------------------------------------------------------------------------------------------
  # staging: the dress rehearsal. The SAME compose.cloud.yml as the VPS/free-path Pi, the images just pushed, an empty
  # database, and random single-use secrets, on the robot's machine that is thrown away afterwards. A release that fails here
  # never gets a tag, so the VPS and the Pi never deploy it. What starts here is the amd64 image (the robot's machine = amd64):
  # the arm64 image first starts on the free-path Pi and is checked there by the smoke test of scripts/deploy.sh. This is NOT
  # the Let's Encrypt practice CA "staging" of Module 27.
  # ---------------------------------------------------------------------------------------------------------------------
  staging:
    name: staging
    needs: build
    if: github.event_name == 'push' && needs.build.outputs.new-release == 'yes'
    runs-on: ubuntu-24.04
    timeout-minutes: 15
    permissions:
      contents: read
      packages: read                             # pulls the images just pushed, also while the package is still private
    steps:
      - uses: actions/checkout@v7
      - uses: docker/login-action@v4
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: staging .env (random secrets, thrown away with this machine) and empty history cupboards
        env:
          REGISTRY: ${{ needs.build.outputs.registry }}
        run: |
          # the same random recipe as the header of .env.example; the values are never printed
          random() { node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"; }
          umask 077
          {
            echo "COMPOSE_FILE=compose.cloud.yml"
            echo "IMAGE_REGISTRY=$REGISTRY"
            # the six required secrets of compose.cloud.yml (IMAGE_REGISTRY is the seventh, above)
            for name in POSTGRES_PASSWORD JWT_SECRET MQTT_PASSWORD MOSQUITTO_DYNSEC_PASSWORD \
              GRAFANA_READER_PASSWORD GRAFANA_ADMIN_PASSWORD; do
              echo "$name=$(random)"
            done
          } > .env
          docker volume create smarthome-data
          docker volume create smarthome-grafana-data
      - name: pull the images and start, exactly as on the VPS and the Pi
        run: |
          docker compose pull --quiet
          docker compose up -d --no-build --wait --wait-timeout 300
      - name: smoke test
        env:
          VERSION: ${{ needs.build.outputs.version }}
        run: sh scripts/smoke-test.sh "$VERSION"
      - name: service state and logs (only when something failed)
        if: failure()
        run: |
          docker compose ps -a
          docker compose logs --no-color --tail 40
```

What to recognize in that block (the reasons are in Concept 9):

- `needs` and `if`: it runs after `build` is green, only on a push to `main` with `new-release` = `yes` (the output of 7.3); a merge without a new version, for example documents only, isn't rehearsed.
- The login uses the `GITHUB_TOKEN` that GitHub makes for that job, with read permission only (`packages: read`): there are no **Secrets** for you to fill in.
- `checkout` brings `compose.cloud.yml`, the `edge/` and `grafana/` files the services read, and the smoke test from the same commit.
- `.env` holds `COMPOSE_FILE`, `IMAGE_REGISTRY`, and six random secrets that are never printed to the public log; a new required setting is written here too, later. The two `docker volume create` = the `external` history cupboards that are made once on every new machine.
- Pull and start = the same two commands as `scripts/deploy.sh` on the VPS and the Pi; the last step only runs when something failed (8.3).

What's rehearsed is the amd64 variant (the comment above the job), and every rehearsal on GitHub pulls ±1.14 GB of images; how long that takes hasn't been measured by the author.

**You pass this ⭐ step** when `ci.yml` ends at the line `docker compose logs --no-color --tail 40`, `staging:` is lined up with `build:`, and you can explain why `staging` doesn't run in PR B.

#### 8.3 ⭐ What staging catches: a mistyped broker, no tag, the VPS and the Pi untouched (5 minutes)

Just read this; don't copy it in your repo. The author's practice release 2.0.5 replaced line 7 of `edge/center.conf`, `listener 1883`, with `listener_mistyped 1883`. In the Indonesian edition's lab its PR was green on the simulated robot, because neither the version guard nor the tests read the content of the broker configuration, and that PR was then merged (the English edition's lab pushed the same release from a practice branch that never reached `main`).

**Expected output (the author's lab, simulated robot; job `staging`, cut):**

```text
Container smarthome-mosquitto-1 Healthy
FAIL  services keep crashing (Restarting): mosquitto -> docker compose logs <service>
smarthome-mosquitto-1   eclipse-mosquitto:2.1.2-alpine   …   Restarting (3) 17 seconds ago
mosquitto-1  | …: Error: Unknown configuration variable 'listener_mistyped'.
mosquitto-1  | …: Error found at /mosquitto/config/mosquitto.conf:7.
```

The first line comes from the pull-and-start step: `up --wait` exits with `0` and writes `Healthy` for Mosquitto, which has no healthcheck. The second line comes from the smoke test: code `1`, the job is red. The rest comes from the log step: its status (`(3)` = Mosquitto's last exit code) and the cause, line 7 of `edge/center.conf`, which is called `mosquitto.conf` inside the container. After that, `tag-release` and `deploy-vps` (Practice 9) are skipped: without a tag `v2.0.5`, the simulated "VPS" and "Pi" stay on the release they had (2.0.4 in the Indonesian edition's lab), and the 2.0.5 images that `build` already pushed are never deployed. Your staging is red? [🚨](#-troubleshooting), the group **Staging red**.

**You pass this ⭐ step** when you can point at the step that catches that typo and say why the VPS and the Pi stay on the old release.

#### 8.4 ⭐ Commit: the first real staging only runs after the merge (2 minutes)

```text
git add scripts/smoke-test.sh .github/workflows/ci.yml
git commit -m "feat: throw-away staging"
```

Not pushed yet: the commits of Practices 8 and 9 are sent together in 9.4. Even in the PR, `staging` is always skipped, because its images are only pushed after the merge; your first rehearsal runs in [9.5](#95--merge-pr-b-the-robot-pushes-the-200-images-staging-passes-the-tag-is-made-8-minutes), for release 2.0.0.

**You pass this ⭐ step** when `git log -1 --oneline` ends with `feat: throw-away staging` and `git status --short` is empty.

#### 8.5 The smoke test by hand: `sh scripts/smoke-test.sh` on the VPS or the Pi (2 minutes)

After Practice 10 (the VPS) or 11 (the free-path Pi), this script is also on the production machine, and `scripts/deploy.sh` runs it after every deployment. When in doubt, run it yourself from the project root there: `sh scripts/smoke-test.sh` (no number = the version in `backend/package.json`) or `sh scripts/smoke-test.sh 2.0.1`; it only reads. The main-path Pi (gateway only) doesn't use it.

> ⬆️ **Done with Practice 8?** Read [Concept 7](#7-push-vs-pull-the-robot-knocks-on-the-vps-the-pi-asks-by-itself) and [Concept 8](#8-a-systemd-timer-an-alarm-clock-for-the-module-12-security-guard), then continue to [Practice 9](#practice-9--the-first-release-200-a-tag-by-the-robot-a-one-script-deployer-and-public-packages-35-minutes): the first release 2.0.0.

### Practice 9 — The first release 2.0.0: a tag by the robot, a one-script deployer, and public packages (35 minutes)

> 🖥️ **Tools used:** **VS Code** and Docker on the laptop, the branch `feature/pipeline`, a terminal at the **project root**; **GitHub** in the browser. The VPS and the Pi aren't touched. Concepts used: 6, 7, 8, 10.
>
> ⭐ **Required** — steps 9.1 to 9.7: release 2.0.0 with a tag made by the robot and public GHCR packages.

#### 9.1 ⭐ Stage B4, part 1: the job `tag-release` (5 minutes)

In `ci.yml`, leave one empty line after the last line (`docker compose logs --no-color --tail 40`), then paste this as it is, from the leftmost column:

```yaml
  # ---------------------------------------------------------------------------------------------------------------------
  # tag-release: the Git tag v<version> on this commit = "this release may be deployed". The VPS and the Pi only follow this tag.
  # ---------------------------------------------------------------------------------------------------------------------
  tag-release:
    name: tag-release
    needs: [build, staging]
    if: github.event_name == 'push'              # a second guard: a pull request never makes a tag
    runs-on: ubuntu-24.04
    timeout-minutes: 5
    permissions:
      contents: write                            # the ONLY job that may write to the repo: making a tag
    steps:
      - uses: actions/checkout@v7
      - name: annotated tag v<version> holding that version's notes from CHANGELOG.md
        env:
          VERSION: ${{ needs.build.outputs.version }}
        run: |
          tag="v$VERSION"
          if git ls-remote --exit-code --tags origin "refs/tags/$tag" > /dev/null; then
            echo "$tag already exists: skipped (a release tag is never moved)"
            exit 0
          fi
          {
            echo "Mini Smart Home $VERSION"
            echo
            awk -v heading="## [$VERSION]" 'index($0, heading) == 1 { take = 1; next } /^## \[/ { take = 0 } take' CHANGELOG.md
          } > "$RUNNER_TEMP/release-notes.txt"
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          # --cleanup=whitespace: the line "### Added" from the CHANGELOG stays (by default, lines starting with # are dropped)
          git tag --annotate "$tag" --cleanup=whitespace --file "$RUNNER_TEMP/release-notes.txt" "$GITHUB_SHA"
          git push origin "refs/tags/$tag"
          echo "$tag created for commit $GITHUB_SHA"
```

The tag is made only after `staging` passes (`needs`) and is never overwritten. It holds that version's section of `CHANGELOG.md`, up to the next `## [` heading (`awk`).

**You pass this ⭐ step** when `tag-release:` is lined up with `staging:`.

#### 9.2 ⭐ Stage B4, part 2: the job `deploy-vps`, still asleep (5 minutes)

Under the 9.1 block, leave one empty line, then paste the last block the same way:

```yaml
  # ---------------------------------------------------------------------------------------------------------------------
  # deploy-vps: the robot knocks on the VPS over SSH. The robot key on the VPS can only run scripts/deploy.sh (command= in
  # authorized_keys): the VPS itself fetches the latest tag and deploys it. The robot only sends a MARKER and reads
  # deploy.sh's report, so a key someone forgot to restrict makes this job red, not green without deploying anything.
  # ---------------------------------------------------------------------------------------------------------------------
  deploy-vps:
    name: deploy-vps
    needs: [build, tag-release]                  # build: the version number of this release (needs.build.outputs.version)
    if: github.event_name == 'push' && vars.VPS_HOST != ''   # VPS_HOST empty (the free path, without a VPS) = skipped
    runs-on: ubuntu-24.04
    timeout-minutes: 20
    permissions: {}                              # needs no GitHub token at all
    concurrency: deploy-vps                      # one VPS deployment at a time, also when a run is repeated by hand
    steps:
      - name: robot key and VPS fingerprint
        env:
          KEY: ${{ secrets.VPS_SSH_KEY }}
          VPS_FINGERPRINT: ${{ vars.VPS_KNOWN_HOSTS }}
        run: |
          umask 077
          mkdir -p ~/.ssh
          printf '%s\n' "$KEY" > ~/.ssh/robot_key
          printf '%s\n' "$VPS_FINGERPRINT" > ~/.ssh/known_hosts
      - name: deploy the release on the VPS (through scripts/deploy.sh)
        env:
          TARGET: ${{ vars.VPS_USER || 'house' }}@${{ vars.VPS_HOST }}
          VERSION: ${{ needs.build.outputs.version }}
        # -T: no terminal; BatchMode: never asks for a password; StrictHostKeyChecking=yes: a VPS whose fingerprint doesn't
        # match VPS_KNOWN_HOSTS is refused (not "no"!); IdentitiesOnly: only this robot key is tried.
        # The last word = a MARKER, not a command: with command= in authorized_keys, the VPS ignores it and runs
        # deploy.sh. WITHOUT command= (the key isn't restricted yet), the VPS tries to run it -> "command not found" -> red.
        # Then deploy.sh's report must say this release's version is deployed. An OLD run repeated after a newer release
        # exists is red too (the VPS is already on another release): the run to repeat is always the newest one.
        run: |
          set -o pipefail
          ssh -T -i ~/.ssh/robot_key -o BatchMode=yes -o StrictHostKeyChecking=yes -o IdentitiesOnly=yes \
            -o ConnectTimeout=20 -o ServerAliveInterval=30 "$TARGET" robot-key-not-restricted-by-command \
            | tee "$RUNNER_TEMP/deploy.txt"
          grep -Eq "v$VERSION (deployed|already deployed)" "$RUNNER_TEMP/deploy.txt" \
            || { echo "FAIL  the VPS didn't report v$VERSION deployed (read the deploy.sh report above)"; exit 1; }
```

This job sleeps as long as the **Variables** entry `VPS_HOST` is empty ([10.6](#106--secrets-and-variables-on-github-vps_ssh_key-vps_host-and-vps_known_hosts-8-minutes)): release 2.0.0 skips it; on the free path, forever. The marker at the end of the `ssh` command: [Concept 7](#7-push-vs-pull-the-robot-knocks-on-the-vps-the-pi-asks-by-itself). Your file now = [the final file](code/.github/workflows/ci.yml) (374 lines; in doubt? overwrite its contents with **Copy raw file**).

**You pass this ⭐ step** when your `ci.yml` is the same as the final file: six jobs.

#### 9.3 ⭐ A one-script deployer: `scripts/deploy.sh` and two unit files (7 minutes)

Right-click the **`scripts`** folder → **New File…** → `deploy.sh`, then paste the contents of [`code/scripts/deploy.sh`](code/scripts/deploy.sh) (**Copy raw file**). The same way, from [`code/scripts/systemd/`](code/scripts/systemd/), create `systemd/smarthome-update.service` and `systemd/smarthome-update.timer` (the folder is created along with them; installed in 11.2). All three must be part of release 2.0.0.

This script runs on the VPS (10.1) and the Pi with the rights of the `docker` group, equal to root, so read it whole, its comments too; its order = the diagram of [Concept 8](#8-a-systemd-timer-an-alarm-clock-for-the-module-12-security-guard):

```sh
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
```

Also look for: `--merged origin/main` (a hand-made tag on another branch is ignored), `restart_once`, and `exec` (a new `deploy.sh` is used right away).

**You pass this ⭐ step** when all three files exist and you can point at the line that refuses root and the one that picks the tag.

#### 9.4 ⭐ The README and the pull request template, then commit and push (3 minutes)

Replace the contents of `backend/README.md`, `frontend/README.md`, `edge/README.md` (fill its table in again), and `.github/pull_request_template.md` with their files in [`code/`](code/) (**Copy raw file**; the summary is in ➕ F); the root README: add the Module 29 section as in ➕ of Module 28. Then send the commits of Practices 8 and 9:

```text
git add -A
git commit -m "feat: tagged releases and the deployer"
git push
```

**You pass this ⭐ step** when all three required checks of PR B are green; the three other jobs are skipped (this is a PR, not a push).

#### 9.5 ⭐ Merge PR B: the robot pushes the 2.0.0 images, staging passes, the tag is made (8 minutes)

> [!NOTE]
> **Not recorded by the author:** GitHub's screens in 9.5–9.7 are from GitHub's documentation (read 5 November 2026); the files and commands were run with the simulated robot and a local image shop.

Merge PR B and delete the branch `feature/pipeline` as in 4.5. In the **Actions** tab, the top `push` run: `verify` and `test` → `build` (now pushing) → `staging` → `tag-release`; `deploy-vps` is skipped.

**Expected output (the author's lab, simulated robot; cut):**

```text
#23 pushing manifest for ghcr.io/<account>/mini-smart-home-backend:2.0.0@sha256:…
PASS  no service keeps crashing (15 seconds after starting)
PASS  backend runs ghcr.io/<account>/mini-smart-home-backend:2.0.0
PASS  web runs ghcr.io/<account>/mini-smart-home-web:2.0.0
PASS  backend /health: {"ok":true,"version":"2.0.0","broker":true,"database":true,"received":0,"rejected":0,"ignored":0}
PASS  dashboard and /api/health through Caddy (http://127.0.0.1:80 (inside the web container))
PASS  smoke test of version 2.0.0
 * [new tag]         v2.0.0 -> v2.0.0
v2.0.0 created for commit <sha>
```

Six `PASS` lines = your first dress rehearsal passed ([8.4](#84--commit-the-first-real-staging-only-runs-after-the-merge-2-minutes)). On the Indonesian edition's simulated robot (a Raspberry Pi 5, local base images), the run took 4 minutes 47 seconds (an example; GitHub not measured). That tag doesn't trigger a new run: the `push` trigger in `ci.yml` is only for the branch `main`. `build` red with `denied`? [🚨](#-troubleshooting) *Pushing to GHCR refused …*.

**You pass this ⭐ step** when the top `push` run is green up to `tag-release`.

#### 9.6 ⭐ The first tag `v2.0.0`: it holds that version's `CHANGELOG` notes (3 minutes)

On GitHub: the repo page → **Releases** (to the right of the file list) → **Tags**: `v2.0.0` is there. On the laptop:

```text
git fetch --tags
git show v2.0.0 --no-patch
```

**Expected output (the author's lab, laptop; cut):**

```text
tag v2.0.0
Tagger: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>

Mini Smart Home 2.0.0
…
### Added
```

Then the `## [2.0.0]` section of your `CHANGELOG.md` follows: this is the Syllabus's "`CHANGELOG` & the first version tag". `v…` tags are made only by the robot ([Concept 10](#10-semver-changelog-and-tags-one-number-then-forward-to-go-back)).

**You pass this ⭐ step** when `git show` writes `Mini Smart Home 2.0.0` and your 2.0.0 notes.

#### 9.7 ⭐ The GHCR packages become public: pull without logging in, two processors (4 minutes)

A new GHCR package can be private ([Concept 6](#6-the-image-shop-and-the-robots-permissions-github_token-permissions-secrets-and-variables)), yet the VPS and the Pi pull without logging in. Public is forever; its content is only the public repo's files and npm libraries (in doubt: `docker history --no-trunc` on the 7.2 image, the way of 10.3 in Module 26). A package that isn't public yet: the repo page → **Packages** → the package → **Package settings** → **Change visibility** → **Public** → type its name → **I understand the consequences, change package visibility**. On the laptop, without logging in:

```text
docker pull ghcr.io/<account>/mini-smart-home-backend:2.0.0
docker buildx imagetools inspect ghcr.io/<account>/mini-smart-home-backend:2.0.0
```

**Expected output (the author's lab; a local image registry without a password stands in for the public package; cut):**

```text
Status: Downloaded newer image for ghcr.io/<account>/mini-smart-home-backend:2.0.0
  Platform:    linux/amd64
  Platform:    linux/arm64
```

Two processors; the two `unknown/unknown` lines after them = the provenance note (Concept 5). Repeat for `mini-smart-home-web`. `unauthorized` = still private ([🚨](#-troubleshooting) *Pulling an image refused …*). (That lab registry has no password, so it proves nothing about a public GHCR package; and the lab's Docker already held the image, so there the first line read `Status: Image is up to date for …`.)

> 🔀 **A private repo:** the packages stay private (they hold your code); the VPS and the Pi pull with a GHCR read token, not tested by the author.

**You pass this ⭐ step** when both packages are pulled without logging in (a private repo: after logging in) with `linux/amd64` and `linux/arm64`.

> ⬆️ **Done with Practice 9?** Continue: [Practice 10](#practice-10--the-vps-switches-to-pulling-a-robot-key-that-can-only-run-one-script-45-minutes) (the VPS); the free path: [Practice 11](#practice-11--the-pi-updates-itself-a-systemd-alarm-clock-40-minutes) (the Pi).

### Practice 10 — The VPS switches to pulling: a robot key that can only run one script (45 minutes)

> 🖥️ **Tools used:** **an SSH terminal to the VPS** (`ssh house@203.0.113.10`, folder `~/mini-smart-home`), **a laptop terminal**, **Chrome**, and **GitHub** in the browser. Concepts used: 7.
>
> ⭐ **Required for the main path and without a Pi** — steps 10.1 to 10.6: the VPS runs 2.0.0 pulled from GHCR, `whoami` through the robot key is answered by `deploy.sh`, the VPS fingerprint matches, and the robot's **Secrets** and **Variables** are filled in.

> 🔀 **The free path:** skip this practice. Your Pi's switch is in [11.1](#111--the-last-manual-git-pull-on-the-pi-5-minutes), and `VPS_HOST` is never filled in.

Since [7.4 of Module 27](../module-27-deploy-internet-tls-pwa/README.md#74-docker-compose-build-on-the-vps-before-the-other-services-start-12-minutes), the VPS has built its own images. From now on it **pulls** the robot's images, and the robot gets a key that can only run `scripts/deploy.sh` ([Concept 7](#7-push-vs-pull-the-robot-knocks-on-the-vps-the-pi-asks-by-itself)). The order matters: `deploy.sh` must already be on the VPS (10.1) before the robot gets its address (10.6). No commit: the project files don't change. Replace `203.0.113.10` with your VPS's IP and `<account>` with your GitHub account in lowercase.

#### 10.1 ⭐ The last time you SSH in to deploy: `sh scripts/deploy.sh` pulls 2.0.0 (10 minutes)

In the VPS terminal:

```text
cd ~/mini-smart-home
git status --short --branch
```

Only `## main...origin/main` = on `main` and without edits. Fetch the latest `main` (a public repo: no account needed), then check the image shop in `.env`:

```text
git pull
grep '^IMAGE_REGISTRY=' .env
```

The last line must be `IMAGE_REGISTRY=ghcr.io/<account>`, in lowercase (different? fix it with `nano .env`). Then deploy, always through `sh`, without `sudo` and without `chmod +x` (its contents are in [9.3](#93--a-one-script-deployer-scriptsdeploysh-and-two-unit-files-7-minutes), the reason in 10.8):

```text
sh scripts/deploy.sh
```

**Expected output (the author's lab, simulated "VPS"; cut):**

```text
2026-11-04 01:49:30 UTC deploying v2.0.0 (center); previously: never through this script
2026-11-04 01:49:30 UTC center: pull images v2.0.0 (compose.cloud.yml)
 ✔ Image ghcr.io/<account>/mini-smart-home-backend:2.0.0 Pulled      4.3s
 ✔ Image ghcr.io/<account>/mini-smart-home-web:2.0.0     Pulled      1.4s
…
PASS  dashboard and /api/health through Caddy (http://127.0.0.1:80 (inside the web container))
PASS  smoke test of version 2.0.0
backend     ghcr.io/<account>/mini-smart-home-backend:2.0.0   Up 22 seconds (healthy)
db          timescale/timescaledb:2.30.2-pg17                Up 51 minutes (healthy)
…
2026-11-04 01:50:02 UTC never -> v2.0.0 deployed (center)
```

`Pulled` without `Building`: the images were pulled, not built. The `…` lines = the rest of Compose's progress and four more `PASS` lines. Only `migrate`, `backend`, and `web` are recreated; the database, the broker, and Grafana stay `Up` (the first deployment restarts nothing). The VPS clock stamp = UTC (Module 27): `01:49` = 08:49 WIB. The author's lab: ±31 seconds (an example).

The author's simulated "VPS" = a Compose project on the author's Docker (arm64), local HTTP without a domain. On your VPS the Caddy line becomes `PASS  dashboard and /api/health through Caddy (https://iot.yourname.my.id)` (the script's text; not recorded by the author), and what's pulled is the amd64 variant (up to ±97 MB), which the author has never run ([Concept 5](#5-one-image-for-two-processors-built-by-the-robot-without-emulation)). Failed? [🚨](#-troubleshooting), the group **`deploy.sh` on the VPS or the Pi**.

**Your home's data stays.** Repeat the fingerprint of [1.3](#13--a-backup-before-the-robot-deploys-pg_dump-docker-compose-cp-and-the-history-fingerprint-4-minutes): `accounts` and `devices` must be the same as in your notes; `readings`, `fingerprint`, and `summaries` may move (Node 1 keeps sending). In the author's lab, `docker compose logs migrate` ends with `0 new migration(s) applied, 9 applied earlier.`, and the dashboard briefly didn't answer `200` (±7.6 seconds in the Indonesian edition, 6.2 seconds in the English one).

**See it without a terminal.** In Chrome, open `https://iot.yourname.my.id` and reload **twice** (the PWA, Module 27): under the title of the **Login** screen (or the header title) it now says `v2.0.0`. `/api/health` writes `"version":"2.0.0"`, and `/api/docs` carries the badge `2.0.0`, not `1.5.0`. Your old account can still log in. The pictures below come from a separate run in the author's lab (simulated machines); on your screen the address and the data are yours.

![Composite of real screenshots of Mini Smart Home 2.0.0 on the simulated VPS (a Compose project on the author's Docker, not Docker-in-Docker; images from the simulated robot and a local registry), Chrome 156 on Linux, laptop 1280 pixels, light mode; the address bar not captured. Practice 10.1, 6 Nov 2026 at 05:05 WIB, after sh scripts/deploy.sh; the lab address http://127.0.0.1:6590 in place of your https://iot.yourname.my.id. Top left: the Login screen card, the title Mini Smart Home, under it v2.0.0 (number 1), then Log in with your Module 20 account to see the dashboard., the Email and Password fields, the Log in button. Top right: /api/health opened in the browser, Chrome's Pretty-print box and one JSON line: ok true, version 2.0.0 (number 2), broker true, database true, received 36, rejected 0, ignored 3. Bottom: the top of /api/docs (Swagger UI, fastify): the title Mini Smart Home API with the badge 2.0.0 (number 3) and OAS 3.0, the address http://127.0.0.1:6590/api/docs/json, then the API description ending with the underlined sentence Since 2.0.0 (Module 29): one version number for the backend and the dashboard, read from package.json (the number next to this page's title), and GET /health names the running version. (number 4). A numbered legend on the right.](assets/health-and-docs-version.png)

The **Fleet** screen (`/fleet`, Module 28) still shows your devices, firmware versions, and releases; the **Update** button doesn't need a click.

![Composite of a real screenshot of the Mini Smart Home Fleet screen 2.0.0 on the simulated VPS (a Compose project on the author's Docker), Chrome 156 on Linux, laptop 1280 pixels, light mode; the address bar not captured. Practice 10.1, 6 Nov 2026 at 05:05 WIB, a minute after sh scripts/deploy.sh; the accounts, devices, history, and release 1.7.1 come from the English Module 28 lab. Top left: the header Mini Smart Home with v2.0.0 under the title (number 1), Live, the menu Devices, Map, Rules, Fleet, Home Admin (admin), Log out; the summary 23 active device(s) (+5 deactivated) · latest Node 1 release: 1.7.1 · 1 to update (number 2); the card Practice living room, Online, canary, needs update, Node 1 · living room · f00d00000001 · last seen just now (number 3; the simulator through the simulated gateway Pi); firmware version 1.7.0 → 1.7.1, restarted because POWERON, Wi-Fi signal -67 dBm (strong), RAM 179 KB free, uptime 2 min, vitals Fri 6 Nov, 05:05 WIB (number 4); the last update from Module 28, failed 1.7.1 → 1.7.2; Update to version 1.7.1 (latest) and the Update button, not clicked (number 5). Bottom left: the release Node 1 1.7.1 latest, installed over the air, 1,411,840 bytes (72% of a shelf), uploaded Tue 3 Nov, 20:07 WIB, sha256 71ca239e…, Canary: 1 succeeded, 0 failed or rolled back (number 6). A numbered legend on the right.](assets/fleet-still-running.png)

**You pass this ⭐ step** when the `deploy.sh` report ends with `never -> v2.0.0 deployed (center)`, `/api/health` writes `"version":"2.0.0"`, and `accounts` and `devices` are the same as in your 1.3 notes.

#### 10.2 ⭐ The robot key on the laptop: `~/.ssh/robot_house` without a passphrase (5 minutes)

This is a **second** key, only for the robot; your personal key from Module 27 isn't touched. In the laptop terminal (Linux, macOS):

```bash
ssh-keygen -t ed25519 -f ~/.ssh/robot_house -N "" -C robot-deploy
```

PowerShell (not tested by the author): without `-N ""`, then press **Enter** twice when asked for a passphrase.

```powershell
ssh-keygen -t ed25519 -f "$HOME\.ssh\robot_house" -C robot-deploy
```

`-f`: a new file, so your personal key isn't overwritten; `-N ""`: no passphrase, because the robot can't type one.

**Expected output (the author's lab, laptop; cut):**

```text
Your identification has been saved in /home/you/.ssh/robot_house
Your public key has been saved in /home/you/.ssh/robot_house.pub
The key fingerprint is:
SHA256:… robot-deploy
```

`robot_house` = the **private** key: don't show it to anyone, paste it into notes, a chat, or an AI, or commit it; its only place is **Secrets** (10.6). `robot_house.pub` = the public key for the VPS.

**You pass this ⭐ step** when `ls -l ~/.ssh/robot_house*` (PowerShell: `dir $HOME\.ssh\robot_*`) lists two files, and the one without `.pub` is marked `-rw-------` (Linux, macOS).

#### 10.3 ⭐ The robot key's line in the VPS `authorized_keys`: `restrict` and `command`, written by hand (6 minutes)

On the laptop, show the robot's public key with `cat ~/.ssh/robot_house.pub` (PowerShell: `Get-Content $HOME\.ssh\robot_house.pub`), then copy its line. In the VPS terminal:

```text
nano ~/.ssh/authorized_keys
```

Don't touch your personal key's line. On a new line below it, type the restriction prefix exactly as in the block below (up to `deploy.sh"` and one space), then paste the copied line after it (Windows: right-click; macOS: **Cmd + V**; Linux: **Ctrl + Shift + V**). The result is one line:

```text
restrict,command="sh /home/house/mini-smart-home/scripts/deploy.sh" ssh-ed25519 AAAA… robot-deploy
```

Save (**Ctrl + O**, **Enter**), exit (**Ctrl + X**). Don't use `ssh-copy-id` as for your personal key in Module 27: it adds the key **without** the prefix, and a robot key without the prefix is as powerful as your own key. Keep this SSH window open until an SSH login from a new window still works, in case your own key's line got damaged too.

**You pass this ⭐ step** when `tail -n 1 ~/.ssh/authorized_keys` writes that line, with the content of `robot_house.pub` in place of `AAAA…`.

#### 10.4 ⭐ Test the restriction: `whoami` is answered by `deploy.sh`, not `house` (4 minutes)

From the **laptop** terminal, send `whoami` ("who am I?") through the robot key:

```text
ssh -i ~/.ssh/robot_house house@203.0.113.10 whoami
```

**Expected output (the author's lab, SSH into a container standing in for the VPS):**

```text
2026-11-04 01:51:17 UTC v2.0.0 already deployed (center): no new release
```

`whoami` is ignored; `deploy.sh` answers, and because 2.0.0 is already deployed, it finishes without touching Docker. An `ssh -L` through this key is refused too: `channel 1: open failed: administratively prohibited: open failed` (the Indonesian edition's lab). Your answer is `house`? Maybe your laptop tried your personal key from `ssh-agent` first: repeat with `-o IdentitiesOnly=yes` after `-i ~/.ssh/robot_house`. Still `house`, or `Permission denied`: the 10.3 prefix is mistyped or split over two lines. Fix it, because the robot will be red ([🚨](#-troubleshooting), the group **`deploy-vps` and SSH**).

**You pass this ⭐ step** when the answer is that `deploy.sh` line, not `house`.

#### 10.5 ⭐ The VPS fingerprint: `ssh-keyscan` matched with `ssh-keygen -lf` (6 minutes)

The robot only logs in to a machine whose key fingerprint is in the **Variables** entry `VPS_KNOWN_HOSTS`. In the laptop terminal:

```text
ssh-keyscan -t ed25519 203.0.113.10
```

**Expected output (the author's lab, laptop):**

```text
# 203.0.113.10:22 SSH-2.0-OpenSSH_10.3
203.0.113.10 ssh-ed25519 AAAA…
```

The line that starts with the VPS address = the content of `VPS_KNOWN_HOSTS` (it's fine if the `#` line gets copied too). An answer over the network can be faked, so match its fingerprint first. On the laptop:

```text
ssh-keyscan -t ed25519 203.0.113.10 | ssh-keygen -lf -
```

In the **VPS** terminal, from its own key file:

```text
ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
```

**Expected output (the author's lab; the lab's fingerprint strings not quoted):** the laptop `256 SHA256:… 203.0.113.10 (ED25519)`, the VPS `256 SHA256:… root@… (ED25519)`, and the string after `SHA256:` is exactly the same. Match them yourself, as in [5.2 of Module 27](../module-27-deploy-internet-tls-pwa/README.md#52-the-first-ssh-login-and-the-host-fingerprint-5-minutes). Different? Stop, don't fill in `VPS_KNOWN_HOSTS`; check the address, then ask your VPS provider. PowerShell: the same commands (not tested by the author).

**You pass this ⭐ step** when both fingerprints are the same, and the line `203.0.113.10 ssh-ed25519 AAAA…` is ready for 10.6.

#### 10.6 ⭐ Secrets and Variables on GitHub: `VPS_SSH_KEY`, `VPS_HOST`, and `VPS_KNOWN_HOSTS` (8 minutes)

> [!NOTE]
> **Not recorded by the author:** GitHub's screens in 10.6 are from GitHub's documentation *Using secrets in GitHub Actions* and *Store information in variables* (read 5 November 2026).

1. On the repo page, click **Settings**. In the sidebar, under **Security**: **Secrets and variables** → **Actions**.
2. The **Secrets** tab → **New repository secret**. **Name**: `VPS_SSH_KEY`. **Secret**: the whole content of `~/.ssh/robot_house`, from `-----BEGIN OPENSSH PRIVATE KEY-----` to `-----END OPENSSH PRIVATE KEY-----` (show it with the 10.3 command without `.pub`, copy, paste, then close that terminal window). Click **Add secret**.
3. The **Variables** tab → **New repository variable**. **Name**: `VPS_HOST`; **Value**: `203.0.113.10`, the same address you keyscanned, because fingerprints are recorded per address. Click **Add variable**. Repeat for `VPS_KNOWN_HOSTS` with the line from 10.5.

`VPS_USER` doesn't need to be created: without it, the robot logs in as `house`. **Secrets** are masked as `***` in the robot's log; **Variables** can be read in the public log, and that's fine ([Concept 6](#6-the-image-shop-and-the-robots-permissions-github_token-permissions-secrets-and-variables)). The settings per path:

| Setting | The main path | The free path | Without a Pi |
| :-- | :-- | :-- | :-- |
| **Variables** `VPS_HOST` | `203.0.113.10` | empty (`deploy-vps` skipped) | `203.0.113.10` |
| **Variables** `VPS_USER` | empty (= `house`) | — | empty |
| **Variables** `VPS_KNOWN_HOSTS` | the line of `ssh-keyscan -t ed25519 203.0.113.10` | — | the same |
| **Secrets** `VPS_SSH_KEY` | the content of `~/.ssh/robot_house` | — | the same |
| `.env` `IMAGE_REGISTRY` (VPS) | `ghcr.io/<account in lowercase>` | — | the same |
| `.env` `IMAGE_REGISTRY` (Pi) | — (the gateway has no self-built image) | `ghcr.io/<account in lowercase>` | — |
| Pi unit `DEPLOY_PARTS` | `gateway` | `"center gateway"` (quoted) | — (no alarm clock) |
| Pi unit `User=` / path | `budi` / `/home/budi/mini-smart-home` (adjust) | the same | — |

There's no new `.env` setting in Module 29 (`.env.example` only gets a comment). `IMAGE_REGISTRY` must be lowercase, because GHCR refuses capitals, and the same as the robot's shop (`ghcr.io/${GITHUB_REPOSITORY_OWNER,,}`). A new required setting is later written in TWO places: the production machine's `.env` and the `.env` step of the job `staging`; forget the second one and `staging` turns red first, which is exactly its purpose.

The robot only uses them at the next release ([12.4](#124--l2-the-robot-deploys-to-the-vps-the-login-screen-says-v201-8-minutes)): `ci.yml` has no "run now" trigger (`workflow_dispatch`), on purpose.

**You pass this ⭐ step** when the **Secrets** tab names `VPS_SSH_KEY`, and the **Variables** tab names `VPS_HOST` and `VPS_KNOWN_HOSTS`.

#### 10.7 The copy of the robot's private key on the laptop: delete it or keep it (3 minutes)

The copy of the private key on the laptop is only useful to repeat 10.4. **Delete it** (`rm ~/.ssh/robot_house`; PowerShell: `Remove-Item $HOME\.ssh\robot_house`) if your laptop is often carried around or shared; **keep it** if you want to test again. Lost: make a new pair (10.2), then replace the VPS line (10.3) and the **Secrets** value (10.6). Leaked: delete its line on the VPS first; until then, whoever holds it can only run `deploy.sh`.

#### 10.8 From now on: the VPS only changes through a pull request (3 minutes)

`deploy.sh` stops with `FAIL:` when the repo copy on the VPS isn't as it expects. So on the VPS, no more `git pull` by hand (`holds version …, but the latest release is …`), editing project files or `chmod +x` (`files were edited directly on this machine`), `sudo sh scripts/deploy.sh` (`don't run this with sudo or as root`), or making, moving, or deleting `v…` tags, also on the laptop and in **Releases** (a moved tag: `would clobber existing tag`). What stays manual: `.env` (outside Git) and backups. Need to pause the robot? Delete `VPS_HOST` from **Variables**: `deploy-vps` is skipped, and the VPS stays on its last release. The messages are in [🚨](#-troubleshooting), the group **`deploy.sh` on the VPS or the Pi**.

> ⬆️ **Done with Practice 10?** The main path: continue to [Practice 11](#practice-11--the-pi-updates-itself-a-systemd-alarm-clock-40-minutes) (the Pi). Without a Pi: skip Practice 11, continue to [Practice 12](#practice-12--a-small-pr-201-reaches-production-without-you-sshing-in-30-minutes).

### Practice 11 — The Pi updates itself: a systemd alarm clock (40 minutes)

> 🖥️ **Tools used:** **an SSH terminal to the Pi** (`ssh budi@gateway.local`, Module 12), folder `~/mini-smart-home`; **Chrome** in 11.6 (the **Fleet** screen). Concepts used: 8.
>
> ⭐ **Required for the main path and the free path** — steps 11.1 to 11.6: the alarm clock scheduled, one round logged in the journal with 2.0.0 deployed, and the gateway broker not restarted (unless its image is new).

> 🔀 **Without a Pi:** skip this practice (L3 doesn't apply), continue to Practice 12.

Since [6.4 of Module 26](../module-26-docker-compose/README.md#64--pi-match-the-acl-copy-the-old-password-file-into-the-gateways-cupboard-then-turn-off-the-apt-broker-10-minutes), the gateway has been updated by hand: `git pull`, then `docker compose restart mosquitto` when its configuration changed. Now the Pi's security guard gets an alarm clock that runs `scripts/deploy.sh` every 15 minutes ([Concept 8](#8-a-systemd-timer-an-alarm-clock-for-the-module-12-security-guard)). No commit: the project files don't change.

#### 11.1 ⭐ The last manual `git pull` on the Pi (5 minutes)

In the Pi terminal:

```text
cd ~/mini-smart-home
git status --short --branch
```

Only `## main...origin/main` = on `main` without edits. Then, for the last time by hand:

```text
git pull
ls scripts/systemd
```

`ls` answers `smarthome-update.service` and `smarthome-update.timer` (the author's lab, simulated "Pi"). After this, the repo copy on the Pi is only moved forward by `deploy.sh`, up to a release tag; a manual `git pull` makes that script stop (11.5). If this pull changes `gateway.conf` or `acl-broker` (2.0.0 doesn't), run `docker compose restart mosquitto` once in the `edge` folder: the script's first round doesn't know what changed before it.

> 🔀 **The free path:** your Pi is also the center, which builds its own images ([11.3 of Module 27](../module-27-deploy-internet-tls-pwa/README.md#113-two-external-cupboards-and-docker-compose-build-on-the-pi-12-minutes)). Switch to pulling as in [10.1](#101--the-last-time-you-ssh-in-to-deploy-sh-scriptsdeploysh-pulls-200-10-minutes): `grep '^IMAGE_REGISTRY=' .env` must answer `IMAGE_REGISTRY=ghcr.io/<account>` (lowercase), then:
>
> ```text
> DEPLOY_PARTS="center gateway" sh scripts/deploy.sh
> ```
>
> **Expected output (the author's lab, simulated "Pi", an example of ±48 seconds; cut):** `deploying v2.0.0 (center gateway); …`, the center's six smoke-test `PASS` lines, `PASS  gateway: …`, then `never -> v2.0.0 deployed (center gateway)`. The arm64 variant is started for the first time here.

**You pass this ⭐ step** when `ls scripts/systemd` answers both unit files (the free path: its report ends with `deployed (center gateway)`).

#### 11.2 ⭐ Two unit files in `/etc/systemd/system/`: adjust the copies, not the repo files (8 minutes)

Read both files first ([9.3](#93--a-one-script-deployer-scriptsdeploysh-and-two-unit-files-7-minutes)); their comments are part of the lesson, and the `.service` header = this practice's recipe:

```ini
# smarthome-update.service - Module 29: the systemd security guard (Module 12) that runs ONCE to deploy the latest Mini Smart
# Home release on the Pi (scripts/deploy.sh), then finishes. What wakes it every 15 minutes: smarthome-update.timer next to it.
#
# Install (on the Pi, from the project root). Adjust the three things below to your Pi in its COPY (/etc/systemd/system/...,
# with sudo nano), NOT in this repo file: an edited repo file makes deploy.sh stop. Those three things: User=
# (the Pi user, a member of the docker group), the path /home/budi/mini-smart-home (two places), and DEPLOY_PARTS (main path:
# gateway; free path: center gateway).
#   sudo cp scripts/systemd/smarthome-update.service scripts/systemd/smarthome-update.timer /etc/systemd/system/
#   sudo nano /etc/systemd/system/smarthome-update.service
#   systemd-analyze verify /etc/systemd/system/smarthome-update.service /etc/systemd/system/smarthome-update.timer
#     (no output = no typo; read its output, not only its exit code)
#   sudo systemctl daemon-reload
#   sudo systemctl enable --now smarthome-update.timer
# Try it once right now: sudo systemctl start smarthome-update.service   (waits until it's done)
# The next schedule    : systemctl list-timers smarthome-update.timer
# The log              : journalctl -u smarthome-update.service -n 30
# The files in /etc/systemd/system are COPIES: after changing the file in the repo, copy it again and daemon-reload.
[Unit]
Description=Mini Smart Home: deploy the latest release (tag v<version>) from GitHub and GHCR
# needs the network (GitHub, GHCR) and Docker already running
Wants=network-online.target
After=network-online.target docker.service
Requires=docker.service

[Service]
# oneshot = runs once until it's done, then stops (not a service that keeps running)
Type=oneshot
# an ordinary user in the docker group, NOT root (the owner of the repo copy in their home folder)
User=budi
WorkingDirectory=/home/budi/mini-smart-home
# The main-path Pi = the gateway only. The free-path Pi (the center + the gateway on the same Pi): replace this line with
#   Environment="DEPLOY_PARTS=center gateway"
# (the quotes are required because of the space)
Environment=DEPLOY_PARTS=gateway
# through sh: the file in the repo is on purpose not marked executable (chmod +x)
ExecStart=/bin/sh /home/budi/mini-smart-home/scripts/deploy.sh
# one round takes at most 15 minutes (the first image pull on the Pi can take long); beyond that it's stopped and logged as failed
TimeoutStartSec=15min
```

```ini
# smarthome-update.timer - Module 29: the alarm clock for smarthome-update.service. The Pi asks GitHub "a new release?"
# 5 minutes after it starts, then every 15 minutes. A new release is usually deployed at most ±17 minutes after the robot makes
# its tag (15 minutes + a random delay up to 1 minute + the systemd alarm clock's accuracy up to 1 minute), plus the image pull.
# How to install: see the header of smarthome-update.service.
[Unit]
Description=Mini Smart Home update schedule (every 15 minutes)

[Timer]
# 5 minutes after the Pi starts (Docker and the network are ready)
OnBootSec=5min
# then 15 minutes after the previous round STARTED, also when that round failed
OnUnitActiveSec=15min
# a random extra 0-60 seconds: many Pis don't ask GitHub and GHCR at the same second
RandomizedDelaySec=60
Unit=smarthome-update.service

[Install]
WantedBy=timers.target
```

`[Install]` is only in the `.timer`: what goes on the morning duty list is the alarm clock; the service only needs to be woken up. Copy both, then open the copy of the `.service`:

```text
sudo cp scripts/systemd/smarthome-update.service scripts/systemd/smarthome-update.timer /etc/systemd/system/
```

```text
sudo nano /etc/systemd/system/smarthome-update.service
```

Your Pi user isn't `budi` (`whoami`)? Change it in `User=` and in the path `/home/budi/mini-smart-home` (`WorkingDirectory=`, `ExecStart=`); that user must be a member of the `docker` group (`groups`). The free path (the [10.6](#106--secrets-and-variables-on-github-vps_ssh_key-vps_host-and-vps_known_hosts-8-minutes) table): `Environment=DEPLOY_PARTS=gateway` becomes `Environment="DEPLOY_PARTS=center gateway"` (the quotes are required: there's a space). Save (**Ctrl + O**, **Enter**), exit (**Ctrl + X**). Always edit the **copy**: an edited repo file makes `deploy.sh` stop. Another schedule goes through a drop-in: [🧩 Level 1](#level-1--the-pi-asks-every-5-minutes-a-drop-in-for-the-alarm-clock-a-small-change-20-minutes).

**You pass this ⭐ step** when that copy names your Pi's user, path, and parts, and `git status --short` has no output.

#### 11.3 ⭐ `systemd-analyze verify`: both files at once, read its output (4 minutes)

Before turning it on, check **both** files for typos:

```text
systemd-analyze verify /etc/systemd/system/smarthome-update.service /etc/systemd/system/smarthome-update.timer
```

**Expected output (the Indonesian edition's lab, `systemd-analyze verify`):** no output (code `0`) = no typo, for both the main-path and the free-path copies (systemd 259 in a container with a stand-in Docker unit, not a real Pi; the English edition's lab didn't run systemd and only checked these unit files structurally). Why two files? If both schedules are mistyped (`5 mins`, `15 mins`), a `verify` of the `.service` alone stays silent; with the `.timer`:

**Expected output (the Indonesian edition's lab, the timer broken on purpose; code `1`):**

```text
/etc/systemd/system/smarthome-update.timer:10: Failed to parse timer value, ignoring: 5 mins
/etc/systemd/system/smarthome-update.timer:12: Failed to parse timer value, ignoring: 15 mins
smarthome-update.timer: Timer unit lacks value setting. Refusing.
Unit smarthome-update.timer has a bad unit file setting.
```

Read its output, not only its exit code: a comment behind a value only produces `Failed to parse timer value, ignoring: 5min # 5 minutes after it starts` with code `0`, and that schedule is still thrown away. Other messages: [🚨](#-troubleshooting), the group **The Pi's alarm clock**.

**You pass this ⭐ step** when that command writes nothing.

#### 11.4 ⭐ Turn on the alarm clock: `enable --now` and `list-timers` (5 minutes)

```text
sudo systemctl daemon-reload
sudo systemctl enable --now smarthome-update.timer
```

`daemon-reload` = systemd reads the unit files again (repeat it whenever a copy changes); `enable` = the **alarm clock** goes on the morning duty list (Module 12); `--now` = it starts right away too. Its output: `Created symlink …` (not recorded by the author).

```text
systemctl list-timers smarthome-update.timer
```

**What it shows (from systemd's documentation, read 5 November 2026; not recorded by the author):** one line; `NEXT`, `LEFT` = when it rings and how long until then; `LAST`, `PASSED` = when it last rang; `UNIT`, `ACTIVATES` = the alarm clock and its service. According to the *systemd.timer* documentation, an `OnBootSec=` that has already passed rings as soon as the alarm clock starts (plus the random delay), so the first round can come before 11.5.

**You pass this ⭐ step** when `systemctl is-enabled smarthome-update.timer` answers `enabled` and the `NEXT` column holds a time.

#### 11.5 ⭐ One round now: `systemctl start`, then read `journalctl` (8 minutes)

```text
sudo systemctl start smarthome-update.service
```

For a `oneshot` service, `start` waits until the round is done, then returns without output. Read the guard's logbook ([5.1 of Module 12](../../phase-2-connectivity/module-12-raspberry-pi-and-linux/README.md#51-the-guards-logbook-journalctl)):

```text
journalctl -u smarthome-update.service -n 30
```

**Expected output (the author's lab, simulated "Pi"; cut):**

```text
2026-11-04 08:57:25 WIB deploying v2.0.0 (gateway); previously: never through this script
2026-11-04 08:57:25 WIB gateway: pull images v2.0.0 (edge/compose.edge.yml)
…
PASS  gateway: no service keeps crashing (15 seconds after starting)
SERVICE     IMAGE                            STATUS
mosquitto   eclipse-mosquitto:2.1.2-alpine   Up 57 minutes
2026-11-04 08:57:42 WIB never -> v2.0.0 deployed (gateway)
2026-11-04 08:57:42 WIB v2.0.0 already deployed (gateway): no new release
```

In the lab, `deploy.sh` was called directly (`budi`, `DEPLOY_PARTS=gateway`: the unit's `ExecStart` run by hand), not by systemd; in your journal every line starts with the date, the Pi's name, and the process name, plus systemd's notes when the service starts and finishes (not recorded by the author). The second round (the last line) doesn't call Docker: `.git/smarthome-deployed` already holds `v2.0.0 gateway`. The alarm clock rang first (11.4)? Then the deployment was logged by that round.

> 🔀 **The free path:** it says `v2.0.0 already deployed (center gateway)` (deployed in 11.1). Only `(gateway)`? Then the next releases only deploy the gateway too: fix `Environment=` (11.2), `daemon-reload`, then `start` again.

Other notes ([the gateway README](code/edge/README.md#the-pi-updates-itself-module-29)):

| Note | What it means |
| :-- | :-- |
| `no release (tag v<version>) on GitHub yet: nothing deployed` | the robot hasn't made a release tag yet |
| `FAIL: files were edited directly on this machine` | change it through a pull request; `git restore <file>` |
| `FAIL: the repo copy on this machine holds version …` | a manual `git pull`; deployed as soon as its tag exists |
| `FAIL: the gateway broker keeps crashing (Restarting)` | a broken configuration: `docker compose logs mosquitto` |
| `FAIL: don't run this with sudo or as root` | `User=` is missing from the unit copy |

**You pass this ⭐ step** when its journal holds `deployed (gateway)` (the free path: `deployed (center gateway)`), without `FAIL:`.

#### 11.6 ⭐ The gateway broker isn't restarted, Node 1 stays `Online` (4 minutes)

```text
cd edge
docker compose ps
```

The `STATUS` of the broker `mosquitto` is still `Up` since before 11.1 (the author's lab: its start time didn't change), and the **Fleet** screen still shows Node 1 `Online`. The broker is restarted when its official image, `gateway.conf`, or `acl-broker` changes (the Indonesian edition's lab: the simulated Node 1 disconnected for a moment, then was `online` again, and the dynamic security accounts survived).

**You pass this ⭐ step** when the broker's `STATUS` hasn't changed (unless its image is new) and Node 1 is `Online` on **Fleet**.

#### 11.7 Stopping the alarm clock for a while, and what stays manual (3 minutes)

When you fix something by hand on the Pi, stop its alarm clock first (turn it on again: `enable --now`):

```text
sudo systemctl disable --now smarthome-update.timer
```

What stays manual: `edge/.env` and `edge/bridge/center.conf` (secrets, outside Git; you copy new lines of `bridge.example.conf` yourself, as in Modules 27–28), and the unit copies (a repo unit changed = copy it, adjust it, `daemon-reload`). The rules of [10.8](#108-from-now-on-the-vps-only-changes-through-a-pull-request-3-minutes) apply on the Pi too.

#### 11.8 The Pi now follows by itself after every release tag (3 minutes)

After the robot makes a new release tag, the Pi deploys it at its next round, usually at most ±17 minutes after the tag is made (15 minutes + a random delay up to 1 minute + the alarm clock's accuracy up to 1 minute), plus the time to pull the images. Before the tag exists, a round only writes `already deployed` without pulling anything. The L3 proof is in [12.5](#125--l3-the-pi-deploys-201-by-itself-read-from-its-journal-6-minutes).

> ⬆️ **Done with Practice 11?** Continue to [Practice 12](#practice-12--a-small-pr-201-reaches-production-without-you-sshing-in-30-minutes): a small PR 2.0.1 reaches production without you SSHing in. Have a stopwatch ready.

### Practice 12 — A small PR 2.0.1 reaches production without you SSHing in (30 minutes)

> 🖥️ **Tools used:** **VS Code** on the laptop, a terminal at the **project root**; **GitHub** in the browser; **Chrome** and a **phone** for the dashboard; a stopwatch (the phone's clock). The SSH terminals to the VPS and the Pi are closed in 12.3; the VPS is read again in 12.4, the Pi in 12.5. Concepts used: 7, 8, 10.
>
> ⭐ **Required** — steps 12.1 to 12.6: PR C brings version 2.0.1 to the VPS (**L2**) and to the Pi (**L3**) without you SSHing in.

This is the module's exam: one small change on the dashboard, from the laptop all the way to production.

#### 12.1 ⭐ The branch `fix/login-text`: one text on the Login screen, the version guard refuses (4 minutes)

In the laptop terminal:

```text
git switch main
git pull
git switch -c fix/login-text
```

In `frontend/src/pages/Login.tsx` line 59, right under the line `v{__WEB_VERSION__}`, change the invitation text:

```diff
-        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Log in with your Module 20 account to see the dashboard.</p>
+        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Log in with your account to see the home dashboard.</p>
```

Save, then ask [the version guard](#64--the-version-guard-scriptscheck-versionmjs-one-number-in-10-places-only-allowed-to-go-up-5-minutes) like the robot in a PR (PowerShell: as in 6.7):

```bash
git fetch
BASE=origin/main node scripts/check-version.mjs; echo "exit code: $?"
```

**Expected output (the author's lab, laptop):**

```text
FAIL  what gets deployed to the VPS/Pi changed (frontend/src/pages/Login.tsx) but the version is still 2.0.0 (= origin/main). Without a new version, the robot makes no release and this change never reaches the VPS/Pi. Raise the number by SemVer: PATCH for a fix (2.0.0 -> 2.0.1), MINOR for a new feature (2.0.0 -> 2.1.0), MAJOR when old users are forced to change too (2.0.0 -> 3.0.0).
exit code: 1
```

Screen text goes into the web image, so this file is "deployed"; a small fix that doesn't change how it's used = PATCH ([Concept 10](#10-semver-changelog-and-tags-one-number-then-forward-to-go-back)).

**You pass this ⭐ step** when the guard refuses with `FAIL  what gets deployed to the VPS/Pi changed …` and `exit code: 1`.

#### 12.2 ⭐ Version 2.0.1 (PATCH) in 10 places and a `CHANGELOG.md` entry (5 minutes)

The recipe is the same as [6.2](#62--one-number-200-npm-version-three-image-lines-and-envexample-6-minutes):

```text
cd backend
npm version 2.0.1 --no-git-tag-version
cd ../frontend
npm version 2.0.1 --no-git-tag-version
cd ..
```

The backend goes up too although its content didn't change: one number for the whole release. In `compose.cloud.yml`, replace `:2.0.0` at the end of all three `image:` lines (lines 210, 227, and 263) with `:2.0.1`. In `CHANGELOG.md`, insert an entry under `## [Unreleased]`, dated today:

```markdown
## [Unreleased]

## [2.0.1] - 2026-11-04

### Changed

- Login screen: a clearer invitation text ("Log in with your account to see the home dashboard.").

## [2.0.0] - 2026-11-04
```

Repeat the guard command of 12.1.

**Expected output (the author's lab, laptop):**

```text
PASS  one version number 2.0.1 in 10 places (package.json, package-lock.json, compose.cloud.yml, CHANGELOG.md); compared with origin/main (2.0.0): the version went up, 6 deployed files changed
exit code: 0
```

The six deployed files: two `package.json` files, two locks, `compose.cloud.yml`, and `Login.tsx`. This `## [2.0.1]` entry is what later becomes the content of the tag `v2.0.1`.

**You pass this ⭐ step** when the guard writes `PASS … 2.0.1 …` with `6 deployed files changed`.

#### 12.3 ⭐ PR C green, close every SSH window, then merge and start a stopwatch (4 minutes)

> [!NOTE]
> **Not recorded by the author:** GitHub's screens in 12.3–12.5 are from GitHub's documentation (read 5 November 2026); the files and commands were run by the author with the simulated robot and a simulated "VPS" and "Pi".

```text
git add -A
git commit -m "fix: Login screen invitation text (2.0.1)"
git push -u origin fix/login-text
```

Open PR C like PRs A and B, with the title `Login screen: a clearer invitation text (2.0.1)`, then wait until all three required checks in the **Checks** tab (`verify`, `test`, `build`) are green. While you wait, close every SSH terminal to the VPS and the Pi (`exit`): from now on only the robot and the alarm clock deploy. Click **Merge pull request** (the **Create a merge commit** option) → **Confirm merge**, and start the stopwatch at that very moment.

**You pass this ⭐ step** when PR C is merged after all three checks are green, the stopwatch is running, and no SSH terminal to the VPS or the Pi is open.

#### 12.4 ⭐ L2: the robot deploys to the VPS, the Login screen says `v2.0.1` (8 minutes)

In the **Actions** tab, the top `push` run: `verify` and `test` → `build` (pushing 2.0.1) → `staging` → `tag-release` (the tag `v2.0.1`) → `deploy-vps`, which isn't skipped now because `VPS_HOST` is filled in ([10.6](#106--secrets-and-variables-on-github-vps_ssh_key-vps_host-and-vps_known_hosts-8-minutes)). After `deploy-vps` is green, open the log of the step `deploy the release on the VPS (through scripts/deploy.sh)`: it holds the `deploy.sh` report from your own VPS.

Then in Chrome, open `https://iot.yourname.my.id` (logged in? click **Log out**: the invitation text is only on the **Login** screen) and reload **twice** ([the PWA, Concept 11 of Module 27](../module-27-deploy-internet-tls-pwa/README.md#11-pwa-from-a-shortcut-to-an-app)): the first reload usually still shows the old version from the PWA's storage, the second the new text and `v2.0.1` under the title of the **Login** screen. `/api/health` writes `"version":"2.0.1"`. Stop the stopwatch. The picture below comes from the author's lab (simulated machines; its shots and its stopwatch line come from two runs of the same release, and at the lab address `127.0.0.1` Chrome allows the PWA without a setting); on your screen the address and the data are yours.

![Composite of three real screenshots of the top of the Mini Smart Home Login screen on the simulated VPS (a Compose project on the author's Docker), Chrome 156 on Linux, laptop 1280 pixels, light mode; the address bar not captured. Practice 12.4, 6 Nov 2026; release 2.0.1 deployed by sh scripts/deploy.sh as the robot key's forced command runs it (job deploy-vps), no SSH by hand; the PWA active on the lab address http://127.0.0.1:6590. Top, before 2.0.1 at 05:07:00 WIB: v2.0.0 and Log in with your Module 20 account to see the dashboard. (number 1). Middle, reload 1 at 05:07:24 WIB, /api/health already 2.0.1: still v2.0.0 and the old text, from the PWA storage (number 2). Bottom, reload 2 at 05:07:29 WIB: v2.0.1 and Log in with your account to see the home dashboard. (number 3). Below, /api/health at 05:07:37 WIB: ok true, version 2.0.1 (number 4), broker true, database true. At the bottom, the stopwatch of the English lab's run, not GitHub: merge 03:08:34, tag v2.0.1 03:11:27, the VPS v2.0.0 to v2.0.1 deployed 03:11:57 WIB, so 3 minutes 23 seconds.](assets/version-in-production.png)

**Expected output (the author's lab: the robot key's forced command on the simulated "VPS", as the `deploy-vps` log shows it; cut):**

```text
 * [new tag]         v2.0.1     -> v2.0.1
2026-11-04 02:16:33 UTC deploying v2.0.1 (center); previously: v2.0.0
2026-11-04 02:16:33 UTC center: pull images v2.0.1 (compose.cloud.yml)
…
 Container smarthome-migrate-1 Recreate
 Container smarthome-web-1 Recreate
…
 Container smarthome-backend-1 Recreate
…
PASS  backend /health: {"ok":true,"version":"2.0.1","broker":true,"database":true,"received":3,"rejected":0,"ignored":0}
…
2026-11-04 02:17:03 UTC v2.0.0 -> v2.0.1 deployed (center)
```

The first line is written by Git on the VPS: the VPS itself fetches the new tag; the robot only knocks. Only `migrate`, `web`, and `backend` are recreated; the dashboard was briefly unreachable (the author's lab: ±6 seconds in the Indonesian edition, 8.4 seconds in the English one). In the Indonesian edition's lab, merge → "VPS" deployed took ±5–6½ minutes (6 minutes 08 seconds): an example of a simulated robot on a Raspberry Pi 5 with local base images, not GitHub. The picture's stopwatch (the English edition's lab) says 3 minutes 23 seconds, shorter mainly because that re-run's `build` found every image layer already in the lab machine's build cache (`CACHED`: 10 seconds instead of 104–124 seconds in the Indonesian edition's lab). On GitHub it hasn't been measured by the author. Afterwards, SSH for reading is allowed again: repeat the 1.3 fingerprint, and `accounts` and `devices` must be the same.

**"Without you SSHing in" ≠ "without SSH":** the robot still logs in to the VPS over SSH, with a key that can only run `deploy.sh` ([Concept 7](#7-push-vs-pull-the-robot-knocks-on-the-vps-the-pi-asks-by-itself)); only your SSH is gone. `deploy-vps` red? Fix its cause, then **Re-run failed jobs**, not **Re-run all jobs** ([🚨](#-troubleshooting), the group **`deploy-vps` and SSH**). The screen still says `v2.0.0`: the group **Production still on the old version**.

> 🔀 **The free path:** `deploy-vps` is skipped (`VPS_HOST` empty); let the stopwatch run until **L2-free** from the Pi in 12.5.

**You pass this ⭐ step** when `deploy-vps` is green with the report `v2.0.0 -> v2.0.1 deployed (center)`, the **Login** screen on your domain shows the new text and `v2.0.1`, and `/api/health` writes `"version":"2.0.1"`. This is requirement **L2**.

#### 12.5 ⭐ L3: the Pi deploys 2.0.1 by itself, read from its journal (6 minutes)

There's nothing for you to do on the Pi: at the alarm clock's next round, usually at most ±17 minutes after the tag `v2.0.1` is made, plus the time to pull the images, the Pi deploys it by itself ([Concept 8](#8-a-systemd-timer-an-alarm-clock-for-the-module-12-security-guard)). What's graded is the deployment; reading its journal over SSH afterwards is fine. In the SSH terminal to the Pi:

```text
journalctl -u smarthome-update.service -n 30
```

**Expected output (the author's lab, simulated "Pi"; the alarm clock replaced by a round by hand, the `deploy.sh` lines only):**

```text
2026-11-04 09:16:46 WIB deploying v2.0.1 (gateway); previously: v2.0.0
…
2026-11-04 09:17:03 WIB v2.0.0 -> v2.0.1 deployed (gateway)
```

Its middle lines are like [11.5](#115--one-round-now-systemctl-start-then-read-journalctl-8-minutes). The Indonesian edition's simulated scheduler asked every ±1 minute, not every 15, so its "Pi" deployed 6 minutes 08 seconds after the merge (an example; the English edition's lab ran its round by hand right after the VPS: 3 minutes 51 seconds). The gateway broker isn't restarted (`edge/` didn't change), and Node 1 stays `Online` on **Fleet**.

> 🔀 **The free path:** the journal writes `v2.0.0 -> v2.0.1 deployed (center gateway)` (the Indonesian edition's lab: 7 minutes 09 seconds after the merge). Open your dashboard through the Tunnel on your phone and reload twice: the new text and `v2.0.1` = **L2-free**, deployed by the Pi's alarm clock without an SSH job and without you SSHing in.

On the free path it looks like the picture below (the author's lab: a simulated "Pi" whose `deploy.sh` was run by hand for this shot, Chrome's 375 px device mode, not a real phone).

![Composite of two real screenshots of the Mini Smart Home 2.0.1 dashboard on the simulated free-path Pi (a Compose project on the author's Docker, not a Raspberry Pi), Chrome 156 on Linux in DevTools device mode, 375 pixels, dark mode, not a real phone; the address bar not captured. Practice 12.5 free path, 6 Nov 2026 at 05:11 WIB; on the lab Pi, DEPLOY_PARTS=center gateway sh scripts/deploy.sh run once by hand deployed 2.0.1; the dashboard opened through the lab hallway, the stand-in for Cloudflare Tunnel. Left, Devices after logging in: the header Mini Smart Home with v2.0.1 under the title (number 1) and Live (number 2), the menu Devices, Map, Rules, Fleet, Home Admin (admin), Log out; Device List, three other devices cut; the card Practice living room (free path), its name cut short by the narrow screen, Online, key active, no location yet · f00d00000044, Temperature 29.4 °C, last seen just now (number 3; the simulator through the gateway broker on the same Pi). Middle, the Login screen: Mini Smart Home, v2.0.1, Log in with your account to see the home dashboard. (number 4), the Email and Password fields, the Log in button. A numbered legend on the right.](assets/version-on-a-phone-dark.png)

> 🔀 **Without a Pi:** L3 doesn't apply; continue to 12.6.

**You pass this ⭐ step** when the Pi's journal writes `v2.0.0 -> v2.0.1 deployed (gateway)` (the free path: `(center gateway)`, and the dashboard from the Pi says `v2.0.1`) without you SSHing in to deploy. This is requirement **L3**.

#### 12.6 ⭐ Delete the branch and note the stopwatch time (3 minutes)

On the PR C page, click **Delete branch**. On the laptop:

```text
git switch main
git pull --prune
git branch -d fix/login-text
```

In `learn-iot/module-29/warmup.md`, next to the count of 🔁 Step 2, write down for ➕ E: the stopwatch number, the merge time, the time the VPS deployed (the `deploy-vps` stamp in UTC + 7 hours), the time the Pi deployed (the journal), and your manual steps this time. GitHub's robot times vary with its queue: don't compare them with the author's numbers.

**You pass this ⭐ step** when `fix/login-text` is gone on GitHub and on the laptop, and those notes are complete.

> ⬆️ **Done with Practice 12?** Continue to [Practice 13](#practice-13--back-to-the-previous-version-a-revert-becomes-202-20-minutes): back to the previous version with a revert, while the number still goes up.

### Practice 13 — Back to the previous version: a revert becomes 2.0.2 (20 minutes)

> 🖥️ **Tools used:** **GitHub** in the browser, **VS Code** on the laptop (a terminal at the **project root**), **Chrome**. You don't touch the VPS and the Pi. Concepts used: 10.

Suppose the new text is confusing. The way back is the same as the way forward: a pull request, the robot, a new release. This practice is recommended, without ⭐.

#### 13.1 The Revert button on PR C: the version guard refuses a lower version (5 minutes)

> [!NOTE]
> **Not recorded by the author:** the **Revert** button is from GitHub's documentation *Reverting a pull request* (read 5 November 2026); for the simulated robot, the author made a commit with the same content using `git revert`.

Open PR C (the **Pull requests** tab, the **Closed** list), then click **Revert** at its bottom. According to the documentation, GitHub makes a new pull request that reverses PR C's merge commit (if its form shows up first, click **Create pull request**): this is **PR D**. The robot runs, and `verify` is red at the step `version`, long before `npm ci`.

**Expected output (the author's lab, simulated robot; job `verify`, step `version`):**

```text
FAIL  version 2.0.0 is LOWER than 2.0.1 on origin/main: the version may only go up. Bringing back old content (revert)? The content may be old, the number still goes UP (for example 2.0.2), with the entry "Fixed: restores …" in CHANGELOG.md.
```

A plain revert reverses all of PR C's content, its number included. Even if it got past [the version guard](#64--the-version-guard-scriptscheck-versionmjs-one-number-in-10-places-only-allowed-to-go-up-5-minutes), the tag `v2.0.0` already exists: the robot makes no release, and the old text never reaches the VPS and the Pi.

#### 13.2 Version 2.0.2 holds the content of 2.0.0, the 2.0.1 entry stays recorded (7 minutes)

Its content is already right; its number must go up. On the laptop, `git fetch`: the `[new branch]` line names PR D's branch, usually `revert-<PR C's number>-fix/login-text` (GitHub's documentation doesn't name the pattern; use what's written). Switch to it, then take `CHANGELOG.md` from `main` again: the revert also deleted the `## [2.0.1]` entry, yet that release was deployed once and its notes must stay.

```text
git switch revert-<number>-fix/login-text
git restore --source=origin/main CHANGELOG.md
```

Raise the number as in 12.2, this time to 2.0.2 (`npm version` in `backend` and `frontend`, the three `image:` lines), then insert an entry above `## [2.0.1]`:

```markdown
## [2.0.2] - 2026-11-04

### Fixed

- Login screen: restores the 2.0.0 invitation text (revert of 2.0.1).
```

**Expected output (the author's lab, laptop; the guard command of 12.1):** `PASS  one version number 2.0.2 in 10 places (…); compared with origin/main (2.0.1): the version went up, 6 deployed files changed`. Then send it:

```text
git add -A
git commit -m "fix: revert 2.0.1 as release 2.0.2"
git push
```

The robot runs again in PR D; this time all three checks are green.

#### 13.3 Merge: the VPS and the Pi deploy 2.0.2 by themselves (5 minutes)

Merge PR D as in 12.3, then delete the branch `revert-<number>-fix/login-text` on GitHub and on the laptop as in 12.6. The robot runs as in 12.4.

**Expected output (the author's lab: the forced command on the simulated "VPS", as the `deploy-vps` log shows it):** `2026-11-04 02:30:13 UTC deploying v2.0.2 (center); previously: v2.0.1`, then `2026-11-04 02:30:42 UTC v2.0.1 -> v2.0.2 deployed (center)`.

The Pi follows at its next round: `v2.0.1 -> v2.0.2 deployed (gateway)` (the free path: `(center gateway)`). The Indonesian edition's lab (a simulated robot and scheduler, an example): the VPS 6 minutes 05 seconds, the "Pi" 6 minutes 36 seconds after the merge (the English re-run: 3 minutes 16 seconds and 3 minutes 33 seconds). Reload the dashboard twice: the **Login** screen says `Log in with your Module 20 account to see the dashboard.` again, now with `v2.0.2`. The content of 2.0.0 numbered 2.0.2: this is **forward to go back** ([Concept 10](#10-semver-changelog-and-tags-one-number-then-forward-to-go-back)).

#### 13.4 The limit of going forward to go back: images can go back, the database can't (3 minutes)

A revert brings back the code and the images, not the database's content. That's why a release's migrations may only add tables, columns, or indexes, so the previous image still fits its database (there's no new migration this week). Deploying an old tag by hand on the VPS or the Pi, for example when the robot itself is broken, is an emergency step for the runbook of Module 30, not the everyday way back. Every release also leaves old images on the VPS (the free path: on the Pi; the author's lab: ±100 MB per release that's no longer used, an example); cleaning them up safely is also part of Module 30.

> ⬆️ **Done with Practice 13?** Continue to [➕ Add-on](#-add-on-to-mini-smart-home): match your project and note your stopwatch time. The [🧩 Challenges](#-independent-challenges) can be done afterwards, on a new branch from `main`.

## 🚨 Troubleshooting

Click the title closest to your problem (Compose and the VPS: [🚨 Module 27](../module-27-deploy-internet-tls-pwa/README.md#-troubleshooting)). First glance at the red job's log (the **Actions** tab), the `deploy.sh` report (VPS: the `deploy-vps` log; Pi: `journalctl -u smarthome-update.service -n 30`), or `docker compose logs <service>`. "The author's lab" = recordings on the author's Raspberry Pi 5 (a simulated robot, "VPS", and "Pi"); "text from the code" = not recorded; GitHub's screens come from its documentation (read 31 October–5 November 2026; your screen may differ). Paste a log into a forum or an AI without `.env`, keys, or the contents of **Secrets**.

<details>
<summary><b>Old instructions → what's right for our versions (<code>actions/checkout@v7</code>, <code>ubuntu-24.04</code>, oxlint 1.89.0, no QEMU)</b></summary>

As of 4 November 2026 ([🧰](#-what-you-need)).

| Old instruction | What's right for our versions |
| :--- | :--- |
| `@v3`/`@v4` of `actions/checkout`, `actions/setup-node`, `actions/upload-artifact`; `actions/cache@v4` | `@v7` (`setup-node` only in the Quick Win; `ci.yml` uses a Node container); `actions/cache@v6` |
| `::set-output` | `echo "name=value" >> "$GITHUB_OUTPUT"` |
| `ubuntu-latest` | `ubuntu-24.04` (`ubuntu-latest` announced to move to 26.04, November 2026) |
| `ubuntu-slim` | `ubuntu-24.04` (`ubuntu-slim` has no Docker server, a 15-minute limit) |
| QEMU (`setup-qemu-action`, `tonistiigi/binfmt`) | no emulation: `$BUILDPLATFORM` (Practice 7) or `ubuntu-24.04-arm` (🔬) |
| Watchtower (archived 17 December 2025) | the systemd alarm clock + `deploy.sh` |
| `:latest`, or only `docker compose pull && up -d` | exact tags + Git-tagged releases (Concept 8) |
| a PAT in Actions | `GITHUB_TOKEN` + `permissions` |
| `StrictHostKeyChecking=no` | `known_hosts` from **Variables** + `StrictHostKeyChecking=yes` |
| `appleboy/ssh-action` | the runner's built-in `ssh` |
| `ssh-copy-id` for the robot key | a `restrict,command=…` line written by hand |
| `pull_request_target` | `pull_request` |
| `npm install` on the robot | `npm ci` |
| `docker-compose` | `docker compose` (Module 26) |
| ESLint + `typescript-eslint` (doesn't accept TypeScript 7 yet) | oxlint 1.89.0 `--deny-warnings` |
| "2,000 minutes a month" | a public repo: standard runners free; private on a free account: $12/month, the same as 2,000 Linux x64 minutes |
| "PlatformIO: Arduino-ESP32 3.x only through a fork" | `platform-espressif32` v8.0.0 (19 October 2026) supports 3.3.12 |
| `CHANGELOG` section names translated into another language | Keep a Changelog 1.1.0's own English names: `[Unreleased]`, `Added` |
| `npm version patch` (makes a commit + a tag) | `npm version <x.y.z> --no-git-tag-version` |
| `git push --tags`, **Draft a new release** | tags only from `tag-release` |
| **Re-run all jobs** when `deploy-vps` is red | **Re-run failed jobs** |

</details>

**Robot red in `verify`**

<details>
<summary><b>The version guard: <code>can't be compared with HEAD</code>, or git refuses: <code>detected dubious ownership</code></b></summary>

The step `version` (6.6), text from the code: `FAIL  origin/main can't be compared with HEAD: …` + `git message: …` (the real cause). In `verify` (4.1): without `fetch-depth: 0`, the robot copies only one commit; without the `safe.directory` line, git refuses a folder owned by another user (the author's lab, simulated robot: `fatal: detected dubious ownership in repository at '/__w/mini-smart-home/mini-smart-home'`). On the laptop: `git fetch` first.

</details>

<details>
<summary><b>The version guard: <code>the version number must be the SAME in all these places</code>, or <code>what gets deployed to the VPS/Pi changed</code> but the version hasn't gone up</b></summary>

The author's lab ([6.7](#67--the-version-guard-on-the-laptop-pass-fail-on-purpose-then-commit-5-minutes)): `FAIL  the version number must be the SAME in all these places; now there are 2 numbers (2.0.0, 1.4.0):` + the list of 10 places; the line with the other number (`1.4.0  compose.cloud.yml (image mini-smart-home-web)`) = the one left behind. `what gets deployed to the VPS/Pi changed`: the file in parentheses gets deployed, so the version must go up. The cure for both: `npm version <version> --no-git-tag-version` in `backend` AND `frontend`, the three `image:` lines, a `CHANGELOG.md` entry (12.2).

</details>

<details>
<summary><b>The version guard: a version <code>LOWER</code> than <code>origin/main</code> (a plain <i>revert</i>), or <code>isn't MAJOR.MINOR.PATCH with numbers only</code></b></summary>

The author's lab (simulated robot, a plain revert PR): `FAIL  version 2.0.0 is LOWER than 2.0.1 on origin/main: the version may only go up. …`: raise it to the next version; the old release's `CHANGELOG` entry stays (13.2). The author's lab (laptop): `FAIL  backend/package.json: version "2.1.0-rc.1" isn't MAJOR.MINOR.PATCH with numbers only (for example 2.0.1)`: this number becomes the release tag, so no `-rc`.

</details>

<details>
<summary><b>Firmware: <code>TEST_WRONG_KEY must be 0</code>, or <code>firmware or key files are in Git</code></b></summary>

Text from the code: `FAIL  firmware/node-1-home/config.h: TEST_WRONG_KEY must be 0 in committed code (Module 28)`: set it back to `0`, commit. `FAIL  firmware or key files are in Git (they can hold the ESP-NOW key): …` (the author's lab: `build/`, `.BIN`, `keys.h`): `git rm -r --cached <file>`, write it in `.gitignore`, commit. What was already pushed to a public repo has already been read by others: replace the ESP-NOW key (Practice 8 of Module 14) and `PORTAL_PASSWORD` (5.2 of Module 28).

</details>

<details>
<summary><b><i>Lint</i> red because of one warning: <code>Found 1 warning and 0 errors.</code></b></summary>

`--deny-warnings`: one warning = code `1`. The author's lab (a leftover `debugger;`, run as on the robot): `::warning file=src/services/csv.ts,line=29,…,title=eslint(no-debugger)::…` then `Found 1 warning and 0 errors.` (the rule in parentheses). Fix it until `npm run lint` writes `Found 0 warnings and 0 errors.`. On purpose: one line `oxlint-disable-next-line <rule> -- on purpose: <reason>` (2.1), not deleting `--deny-warnings`.

</details>

<details>
<summary><b><code>npm audit</code> red although the code didn't change</b></summary>

`npm audit --omit=dev --audit-level=high` is red only for **high or critical** holes in production libraries, and reports of new holes come out at any time. Run it on the laptop, read the fixed version, and raise it through an ordinary PR. Don't `npm audit fix --force` or lower `--audit-level`.

</details>

<details>
<summary><b>Alpine containers on the robot: <code>JavaScript Actions in Alpine containers are only supported on x64 Linux runners</code>, or <code>tar: unrecognized option: posix</code></b></summary>

The first message (the `actions/runner` source, not recorded by the author): `runs-on` was changed to an ARM runner (`ubuntu-24.04-arm`), while JavaScript actions in an Alpine container only run on x64; put back `ubuntu-24.04`. The second message (the Indonesian edition's lab): `tar` is missing from `apk add --no-cache git tar`; Alpine's built-in `tar` doesn't know `--posix` (according to the `actions/cache` source: only a warning).

</details>

**Robot red in `test`**

<details>
<summary><b><code>Setting DATABASE_URL in .env: not filled in</code> or <code>Setting MQTT_URL in .env: not filled in</code></b></summary>

The migration stops before the tests: the backend checks every setting. The author's lab (simulated robot, `DATABASE_URL_TEST` deleted from `env:`): `Setting DATABASE_URL in .env: not filled in` · `Copy .env.example to .env …` (a sentence meant for the laptop). The `env:` block of the job `test` must hold `DATABASE_URL_TEST`, `MQTT_URL`, and `JWT_SECRET` exactly as in 4.1; without `MQTT_URL`: the second form (the author's lab, laptop).

</details>

<details>
<summary><b><code>a test was skipped</code></b></summary>

The author's lab (simulated robot, one leftover `it.skip`):

```text
      Tests  222 passed | 1 skipped (223)
FAIL  a test was skipped: on the robot every test must run, the 20 integration tests too
```

The cause is a leftover `.skip` (`git grep -n "\.skip("` in `backend`); an empty `DATABASE_URL_TEST` is already red at the migration. Delete the `.skip`, not its guard.

</details>

<details>
<summary><b><code>AssertionError</code>: which test failed, and on which line</b></summary>

The robot only reads code `1`; the content is in the Vitest log ([4.3](#43--read-the-robots-log-verify-and-test-with-223-tests-8-minutes); an example in 5.3): the `×` line = the test's name; `AssertionError: expected 201 to be 200` = the result was `201`, the expectation `200`; `❯ src/integration/devices.test.ts:37:31` = the file, line, and column. Repeat it on the laptop (integration tests: the test database, 3.6). Red only on the robot? The robot's clock is UTC (`vi.stubEnv("TZ", …)` in `time.test.ts`).

</details>

**The test database on the laptop**

<details>
<summary><b><code>the test database can't be reached</code>, or counter 5433 is already taken</b></summary>

Text from the code: `the test database can't be reached (…): is the test database container running, and are its counter and password the same as in DATABASE_URL_TEST?`. Its container is gone after `docker stop` (`--rm`): repeat [3.1](#31--a-throw-away-test-database-smarthome-db-test-at-counter-5433-6-minutes); in PowerShell, check for an old setting (3.9). Counter 5433 used by another program (the author's lab: `… Bind for 127.0.0.1:5433 failed: port is already allocated`)? Change it in TWO places: `-p 127.0.0.1:5434:5432` and `…@127.0.0.1:5434/smarthome_test`.

</details>

<details>
<summary><b><code>not a test database</code>, or <code>the firmware table in the test database holds other releases</code></b></summary>

`Error: DATABASE_URL_TEST points at the database "smarthome", not a test database: …` = the 3.8 guard working before it connects; the database name must end in `_test`. The author's lab (a release `1.7.1` put in the test database on purpose): `Error: the firmware table in the test database holds other releases (1.7.1): …`, 3 tests red. The cure: `docker stop smarthome-db-test`, then 3.1 again.

</details>

<details>
<summary><b>No <code>timescaledb</code> extension: a plain <code>postgres</code> <i>image</i></b></summary>

Migrations `002`–`005` need TimescaleDB. With a plain `postgres`, the tests stop at `migrating the test database failed:` (text from the code) + PostgreSQL's message (not recorded by the author). Use `timescale/timescaledb:2.30.2-pg17` as in 3.1.

</details>

**Branch protection**

<details>
<summary><b>The PR waits forever (<code>Waiting for status to be reported</code> or an approval), or a <i>check</i> name doesn't appear in the list</b></summary>

The required check is never reported: its name differs from the job's name (`verify`, `test`, `build`), or the workflow doesn't run (GitHub's documentation: for example because of a `paths` filter). Make them the same in **Settings** → **Branches** → **Edit** ([5.1](#51--a-classic-rule-for-main-in-settings--branches-four-settings-8-minutes)). Not in the search: a check must have passed in the last 7 days (7.6); run the robot first. All checks green, but the PR waits for an approval (a review)? According to GitHub's documentation, a PR's author can't approve their own PR: untick **Require approvals** (5.1 step 5).

</details>

<details>
<summary><b>A red PR can still be <i>merged</i>: the box Do not allow bypassing the above settings isn't ticked</b></summary>

According to GitHub's documentation, without that box the branch rule doesn't apply to repo admins, meaning you. **Settings** → **Branches** → **Edit** on the `main` rule → tick **Do not allow bypassing the above settings** → **Save changes**. If the push of 5.2 was accepted, bring `main` back first as in 5.2. Then repeat 5.2 and 5.3.

</details>

<details>
<summary><b>A private repo: branch protection isn't available on a free account</b></summary>

According to GitHub's documentation, branch protection (classic or rulesets) on a free account is only for public repos. Make the repo public after making sure its history is free of secrets (1.2), or use a paid plan; until then, **L1** isn't proven.

</details>

<details>
<summary><b>The PR branch is behind <code>main</code></b></summary>

A result of **Require branches to be up to date before merging**. According to GitHub's documentation (read 5 November 2026): click **Update branch** in the merge section of the PR page; or on your branch: `git pull --no-rebase --no-edit origin main`, then `git push`. The robot runs again; two PRs with the same number? The version guard asks the later one to go up again.

</details>

**Images and GHCR**

<details>
<summary><b><code>exec format error</code>, or the <i>job</i> <code>build</code> is very slow</b></summary>

`exec format error` = a program for another processor is RUN without an emulator. The author's lab (the OLD backend `Dockerfile`, `--platform linux/amd64` on an arm64 laptop): `#8 0.352 exec /bin/sh: exec format error` at `RUN npm ci --omit=dev`. The cure is `FROM --platform=$BUILDPLATFORM` ([7.1](#71--two-cross-processor-dockerfiles-with-buildplatform-8-minutes)). `build` very slow with an old `Dockerfile` = silent emulation: the `setup-buildx-action` builder brings its own emulator (Concept 5; not tried by the author on GitHub).

</details>

<details>
<summary><b>Pushing to GHCR refused: <code>must be lowercase</code>, <code>denied</code>, or <code>permission_denied</code></b></summary>

The shop's name must be lowercase: the robot's already is (`ghcr.io/${GITHUB_REPOSITORY_OWNER,,}`), `IMAGE_REGISTRY` in `.env` not necessarily (the author's lab: `… repository name (<Account>/mini-smart-home-backend) must be lowercase`). `denied`/`permission_denied` in `build` (not recorded by the author): `packages: write` is missing, or a Module 26 package with the same name isn't linked to the repo. According to GitHub's documentation (read 5 November 2026): **Package settings** → **Manage Actions access** → **Add repository** → `mini-smart-home`, **Role** **Write**; then **Re-run failed jobs**.

</details>

<details>
<summary><b>Pulling an <i>image</i> refused: <code>unauthorized</code>, or <code>no matching manifest for linux/amd64</code></b></summary>

Not recorded by the author. `unauthorized` without logging in = the package is still private (9.7), backend AND web. `no matching manifest for linux/amd64` (the Pi: `linux/arm64`) = that tag has one processor only, usually a push by hand (Module 26, or the `docker push` of 7.2). The robot never overwrites an existing version tag: the cure is the next version through a PR.

</details>

<details>
<summary><b>The first <code>docker compose build</code>: <code>already exists</code></b></summary>

The Indonesian edition's lab (Compose 2.40.3): `ERROR: image "…/mini-smart-home-backend:1.5.0": already exists`. `migrate` and `backend` share an image name, so two exports collide. Repeat the command; the second try passes (the English edition's lab didn't hit it). Since Module 29 only on the laptop (7.2).

</details>

**Staging red**

<details>
<summary><b><code>services keep crashing (Restarting)</code> in <i>staging</i></b></summary>

The example is in [8.3](#83--what-staging-catches-a-mistyped-broker-no-tag-the-vps-and-the-pi-untouched-5-minutes): `FAIL  services keep crashing (Restarting): mosquitto -> docker compose logs <service>`; the log step after it writes the cause. Fix it on a new branch and raise the version (`main` already carries the red number), then a PR. The VPS and the Pi stay on the previous release.

</details>

<details>
<summary><b><code>required variable MQTT_PASSWORD is missing a value</code>, and other new required settings</b></summary>

The Indonesian edition's lab (a simulated robot, a practice: a new required setting not written in the job `staging`): the PR was green (no PR job reads Compose's settings); after the merge, `staging` was red at `docker compose pull --quiet`: `… required variable DASHBOARD_GREETING is missing a value: fill in DASHBOARD_GREETING in .env`, and the log step was red too, with the same message (the English edition's lab: the same message on the laptop). A new required setting is written in TWO places: the step `staging .env …` in `ci.yml` and the production machine's `.env` (+ `.env.example`). Without any `.env`: `required variable MQTT_PASSWORD is missing a value: fill in MQTT_PASSWORD in .env` (the Indonesian edition's lab, laptop).

</details>

<details>
<summary><b><code>--wait</code> runs out after 300 seconds, or <i>staging</i> takes very long</b></summary>

`up -d --no-build --wait --wait-timeout 300` waits at most 5 minutes for the services with a healthcheck (the database, the backend, Grafana) to be healthy; red = one never became healthy (the author's lab: `container … is unhealthy`): read the log step. Green but slow: GitHub's robot pulls ±1.14 GB per staging (the limit `timeout-minutes: 15`); its time hasn't been measured by the author (the Indonesian edition's lab: 51–75 seconds, local base images).

</details>

**Release tags and re-running**

<details>
<summary><b>The release <i>tag</i> isn't made, or <code>deploy-vps</code> is skipped after Re-run all jobs</b></summary>

A tag is only made after `staging` passes, for a version that has no tag yet ([9.1](#91--stage-b4-part-1-the-job-tag-release-5-minutes)); a merge without the version going up really has no release. **Re-run all jobs** repeats from the start although the tag exists (the author's lab, simulated robot): `v2.0.0 already released: no new release from this push`, then `staging`, `tag-release`, and `deploy-vps` are skipped. For a red `deploy-vps`: **Re-run failed jobs**.

</details>

<details>
<summary><b><code>would clobber existing tag</code> on the VPS or the Pi</b></summary>

A `v…` tag was moved on GitHub. `git fetch --tags` on the VPS and the Pi refuses to overwrite an existing tag (the author's lab, real Git): `! [rejected] v2.0.2 -> v2.0.2 (would clobber existing tag)`, then `FAIL: can't fetch tags from GitHub: …`; new releases aren't deployed anymore. Prevent it with the rules of 10.8; repairing it = a manual emergency step (the Module 30 runbook).

</details>

**`deploy-vps` and SSH**

<details>
<summary><b><code>robot-key-not-restricted-by-command: command not found</code></b></summary>

The author's lab (the robot key on the "VPS" without the prefix, as `ssh-copy-id` leaves it; real OpenSSH): `bash: line 1: robot-key-not-restricted-by-command: command not found` · `##[error]Process completed with exit code 127.` (that last line from the Indonesian edition's forge). That word is a marker, which the VPS ignores when there's a `restrict,command="…"`. Fix the line ([10.3](#103--the-robot-keys-line-in-the-vps-authorized_keys-restrict-and-command-written-by-hand-6-minutes)), test `whoami` (10.4), then **Re-run failed jobs**.

</details>

<details>
<summary><b><code>REMOTE HOST IDENTIFICATION HAS CHANGED!</code> then <code>Host key verification failed.</code></b></summary>

The author's lab (a `VPS_KNOWN_HOSTS` of another machine): `WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!` … `Host key verification failed.`, code `255`: the robot does refuse a different fingerprint. The usual cause: the VPS was reinstalled; without the `WARNING` = `VPS_HOST` is a different address from the one you keyscanned. Repeat 10.5 (match the fingerprint!), replace `VPS_KNOWN_HOSTS` (10.6), **Re-run failed jobs**.

</details>

<details>
<summary><b><code>Permission denied (publickey)</code></b></summary>

The author's lab (**Secrets** holding another key): `house@203.0.113.10: Permission denied (publickey).`, code `255`. The **Secrets** value `VPS_SSH_KEY` = the whole `~/.ssh/robot_house` (`-----BEGIN …` to `-----END …`), not the `.pub`; the VPS `authorized_keys` holds its pair, one whole line; `VPS_USER` empty (= `house`). A **Secrets** value can only be replaced: paste it again, **Re-run failed jobs**.

</details>

<details>
<summary><b><code>cannot open /home/house/mini-smart-home/scripts/deploy.sh</code></b></summary>

The author's lab (the simulated "VPS", with the path of the key's `command=`): `sh: 0: cannot open /home/house/mini-smart-home/scripts/deploy.sh: No such file`. `VPS_HOST` was filled in before `deploy.sh` was on the VPS: do 10.1, then **Re-run failed jobs**.

</details>

<details>
<summary><b><code>the VPS didn't report v… deployed</code>, or the robot can't get in on port 22</b></summary>

`FAIL  the VPS didn't report v<version> deployed (read the deploy.sh report above)`: SSH worked, but the `deploy.sh` report doesn't name that version. Read the `FAIL:` line above it, or you repeated an OLD run (the author's lab: `… v1.9.9 deployed …`): repeat only the newest run. The robot can't get in at all (`ConnectTimeout=20` ran out; its message not recorded by the author): is port 22 locked to your home address? GitHub's robot addresses keep changing; open port 22, for keys only (Concept 7).

</details>

**`deploy.sh` on the VPS or the Pi**

<details>
<summary><b><code>files were edited directly on this machine</code>, or the repo copy is <code>not main</code></b></summary>

The author's lab (the simulated "VPS", after `chmod +x scripts/deploy.sh`):

```text
2026-11-04 02:43:55 UTC FAIL: files were edited directly on this machine (see: git diff):
 M scripts/deploy.sh
```

Git records file permissions too ([9.3](#93--a-one-script-deployer-scriptsdeploysh-and-two-unit-files-7-minutes)). A needed change → a PR; the file is restored (the author's lab: after `git restore scripts/deploy.sh`, `v2.0.0 already deployed (center)`). Text from the code: `FAIL: the repo copy on this machine is on <branch>, not main: git switch main`.

</details>

<details>
<summary><b><code>holds version …, but the latest release is …</code>, or <code>can't fast-forward</code></b></summary>

Text from the code: `FAIL: the repo copy on this machine holds version …, but the latest release is … (a manual git pull?). …`: a version that hasn't passed staging isn't deployed; as soon as its tag exists, the next round deploys it. `FAIL: main on this machine can't fast-forward to v…: …`: a commit made on that machine, or an untracked file with the same name as a new file (the author's lab: `untracked working tree files would be overwritten by merge`). Move that file out of the repo folder; a commit made on the machine = an emergency (Module 30).

</details>

<details>
<summary><b><code>the images for v… can't be pulled yet</code></b></summary>

Text from the code: `FAIL: the images for v… can't be pulled yet (the reason is in the Docker message above). …`. Its Docker message: `unauthorized` (a private package, 9.7), `must be lowercase` (`IMAGE_REGISTRY`), `required variable … is missing a value` (that machine's `.env`), or `not found` (the version isn't in the shop; the author's lab: `… failed to resolve reference "ghcr.io/<account>/mini-smart-home-backend:9.9.9": …: not found`). Fix it, then repeat (the Pi: the next round; the VPS: **Re-run failed jobs**).

</details>

<details>
<summary><b>Not healthy after deploying: <code>failed to start or isn't healthy yet</code>, <code>not version</code>, or <code>restart mosquitto failed</code></b></summary>

Text from the code: `FAIL: the center failed to start or isn't healthy yet (at most 5 minutes): docker compose ps -a, then docker compose logs <service>`; the smoke test: `FAIL  services keep crashing (Restarting): …`, `FAIL  the backend isn't connected to the database: …`, `FAIL  backend runs …, not version …`. Run the command it names. `FAIL: restart mosquitto failed: …` (the author's lab, a fake Docker): the next round repeats its restart, then only once per release (`… already restarted for v…: skipped`).

</details>

<details>
<summary><b><code>don't run this with sudo or as root</code>, or <code>DEPLOY_PARTS</code> mistyped</b></summary>

The author's lab (a fake Docker): `FAIL: don't run this with sudo or as root: …`. Run `sh scripts/deploy.sh` without `sudo`; the Pi's unit copy must have `User=` (11.2). `FAIL: DEPLOY_PARTS contains "…"; …` or `FAIL: DEPLOY_PARTS is empty; …`: check `Environment=` in the unit copy; the free path in quotes: `Environment="DEPLOY_PARTS=center gateway"`.

</details>

<details>
<summary><b><code>can't fetch tags from GitHub</code></b></summary>

Text from the code: `FAIL: can't fetch tags from GitHub: read the git message above (internet? the origin address: git remote -v; a release tag moved on GitHub: would clobber existing tag; .git files owned by root: Permission denied)`. The last one = git was once run with `sudo`; give the repo folder back to your user once (`chown -R`, the pattern of 5.3 in Module 27; not tried by the author). A private repo: needs a repo read key.

</details>

<details>
<summary><b><code>Some service image(s) must be built from source</code>: don't remove <code>--no-build</code></b></summary>

The author's lab (Compose 2.40.3, a new version not in the shop yet): `pull` writes `WARNING: Some service image(s) must be built from source by running:` and code `1`; `up -d --no-build` stops too (`No such image: …`), and the OLD containers stay `Up (healthy)`. Without `--no-build`, Compose itself builds a version on the VPS/Pi that was never rehearsed. On the VPS/Pi always `--no-build`; an image not there yet = wait for the robot.

</details>

**The Pi's alarm clock**

<details>
<summary><b>The alarm clock doesn't appear in <code>list-timers</code>, or its journal is empty</b></summary>

What gets turned on is the `.timer`, not the `.service` ([11.4](#114--turn-on-the-alarm-clock-enable---now-and-list-timers-5-minutes)); the `.service` has no `[Install]`. A unit copy changed? `sudo systemctl daemon-reload`. An empty journal: a typo in the name after `journalctl -u`, or it hasn't rung yet (`NEXT`, `LEFT`); force a round: `sudo systemctl start smarthome-update.service`.

</details>

<details>
<summary><b><code>systemd-analyze verify</code> prints <code>Failed to parse</code>, <code>Timer unit lacks value setting. Refusing.</code>, or <code>Neither a valid executable name nor an absolute path</code></b></summary>

The Indonesian edition's lab (systemd 259.9, broken copies): `Failed to parse timer value, ignoring: 5 mins` + `smarthome-update.timer: Timer unit lacks value setting. Refusing.` → `5min`, `15min`. `Failed to parse Type=once, ignoring: Invalid argument`, `Neither a valid executable name nor an absolute path: scripts/deploy.sh` → `Type=oneshot`, a full path. `Unit docker.service not found.` = a machine without Docker. A drop-in that empties `OnUnitActiveSec=` without `OnBootSec=` deletes ALL schedules (🧩 Level 1). Fix it, `verify` until it's silent, `daemon-reload`.

</details>

<details>
<summary><b>The alarm clock runs as root, or the Pi user isn't a member of the <code>docker</code> group</b></summary>

Without `User=` in the `.service` copy, the alarm clock runs as root, and `deploy.sh` refuses: write `User=budi` (your user), then `daemon-reload`. That user must be a member of the `docker` group (`groups budi`; if not, Docker refuses its socket, a message not recorded by the author): add it to that group as in 6.1 of Module 26, then one round with `sudo systemctl start smarthome-update.service`.

</details>

**Production still on the old version**

<details>
<summary><b>The screen still shows the old version, or <code>/api/health</code> without <code>version</code></b></summary>

The PWA: reload **twice**. `/api/health` without `"version"` = that machine's backend is still 1.5.0: do 10.1 (the free path: 11.1). An old `"version"` although the new tag exists: the VPS = the `deploy-vps` log ([12.4](#124--l2-the-robot-deploys-to-the-vps-the-login-screen-says-v201-8-minutes)); the Pi = wait (usually at most ±17 minutes + the pull), then `journalctl`. No tag yet: the robot isn't done, or `staging` is red.

</details>

<details>
<summary><b><code>Healthy</code> while it keeps crashing, or a service that crashes after ±10 seconds slips through the check</b></summary>

`up --wait` writes `Healthy` for services without a healthcheck (Mosquitto, Caddy) even when they keep crashing; that's why there's a smoke test (8.3). The smoke test checks once, 15 seconds after starting: a service that crashes after ±10 seconds can look `running`. Suspicious? `docker compose ps` a few times, then `docker compose logs <service>`. Continuous monitoring = Module 30.

</details>

<details>
<summary><b>The VPS or Pi disk fills up with old <i>images</i></b></summary>

Every release leaves old images behind (the author's lab, simulated "Pi": ±100 MB per release, an example); see `docker system df`. Don't `docker compose down -v` (the data cupboards get deleted) or `prune` by hand; `deploy.sh` doesn't either. Cleaning up safely = Module 30.

</details>

**Messages you can ignore**

<details>
<summary><b>Safe to ignore: <code>4 moderate severity vulnerabilities</code>, <code>PWA v2.0.0</code>, <code>unknown/unknown</code>, <code>no release</code> before PR B, and a brief <code>WARNING  the backend isn't connected to the broker yet</code></b></summary>

- `4 moderate …` (backend, as of 4 November 2026): moderate severity; the robot is red only for high and critical (2.5).
- `PWA v2.0.0` = the version of the `vite-plugin-pwa` package.
- `unknown/unknown` in `imagetools inspect` = the build's provenance note.
- `no release (tag v<version>) on GitHub yet: …` = the robot has never made a tag.
- `WARNING  the backend isn't connected to the broker yet …` = the backend is still connecting; still `"broker":false` a few minutes later? `docker compose logs backend`.

</details>

## 🔬 Technical Deep Dive (optional)

You can skip this: the Syllabus's three options (Wokwi CI, `node:test`, Playwright), other roads deliberately not taken, and how the author tested. Unless marked "the author's lab" or "research", the content comes from official documentation (read 31 October–5 November 2026) and **hasn't been run by the author**.

<details>
<summary><b>Wokwi CI: firmware tested by the robot in a simulator (reading only, not tested by the author)</b></summary>

A Syllabus option: the robot starts the firmware in the Wokwi simulator in the cloud and waits for one sentence on Serial. According to Wokwi's documentation, the action `wokwi/wokwi-ci-action@v1` (v1.3.0) goes after the firmware compile step (the fold *Firmware on the robot …*), with the inputs `token`, `path` (the folder of `wokwi.toml`), and `expect_text` (the sentence it waits for); the token (starting with `wok_`, 44 characters) is made in the Wokwi CI dashboard and stored in **Secrets** as `WOKWI_CLI_TOKEN`. Why it's not on the main path:

- It needs a Wokwi account and a real token, which weren't used in the author's lab: not tested.
- The action downloads the Wokwi program for Linux x64 only: it runs on `ubuntu-24.04`, not on an ARM64 runner or on the Pi.
- The quota isn't clear: according to Wokwi's documentation, a free account gets 50 simulation minutes per 30 days (at most 5 minutes per session), but its pricing page only lists CI minutes for Wokwi Pro. Check again.
- Your repo has no `wokwi.toml` yet.

The main path is fine with two cheap checks in `verify` ([Concept 4](#4-lint--test--build-fail-fast)).

</details>

<details>
<summary><b><code>node:test</code>: the same test without Vitest</b></summary>

Node.js has a built-in test tool, `node:test` (stable since Node 20); Node 24 runs `.ts` files directly, and Fastify's official *Testing* guide uses `node:test` together with `app.inject`. The author rewrote the first test of `version.test.ts` (Module 28) in a practice file `backend/src/services/version.node.test.ts` (not in `code/`, not committed):

```ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { compareVersions } from "./version.ts";

describe("compareVersions", () => {
  it("MAJOR, then MINOR, then PATCH; the result is -1, 0, or 1", () => {
    assert.equal(compareVersions("1.7.1", "1.7.0"), 1);
    assert.equal(compareVersions("1.7.0", "1.7.1"), -1);
    assert.equal(compareVersions("1.7.1", "1.7.1"), 0);
    assert.equal(compareVersions("2.0.0", "1.99.99"), 1);
    assert.equal(compareVersions("1.6.0", "1.7.0"), -1);
  });
});
```

`describe` and `it` are the same; `expect(…).toBe(1)` becomes `assert.equal(…, 1)`. In a terminal in the `backend` folder:

```text
node --test src/services/version.node.test.ts
```

**Expected output (the author's lab, laptop; Node 24.21.0):**

```text
▶ compareVersions
  ✔ MAJOR, then MINOR, then PATCH; the result is -1, 0, or 1 (6.315054ms)
✔ compareVersions (21.165856ms)
ℹ tests 1
ℹ suites 1
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 830.923892
```

Exit code `0`. Change the `1` at the end of the first `assert.equal` line to `2`: the output holds `AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:` (`actual: 1,` `expected: 2,`) and exit code `1`, the same language for the robot. Delete the practice file after trying. The project stays with Vitest: 223 tests already use it, the Syllabus chose Vitest for both folders, and `node:test`'s coverage is still experimental according to Node's documentation.

</details>

<details>
<summary><b>Playwright: one Login → dashboard flow as an <i>end-to-end test</i></b></summary>

The top of the pyramid ([Concept 1](#1-the-testing-pyramid-ingredients--recipe--kitchen--customer)) is still empty. Playwright (`@playwright/test` 1.64.1) drives a real browser from a program: open `/login`, fill in the email and the password, click **Log in**, then wait for the dashboard header with its version number. That one test goes the same way as a user: browser → Caddy → backend → database.

According to its documentation, Playwright supports Ubuntu 26.04 arm64. On the robot, `npx playwright install --with-deps` downloads the browsers and their system packages every run, and its official CI example (still `actions/checkout@v6`) keeps the report as an artifact (a job's result file that GitHub keeps for downloading) through `actions/upload-artifact@v4`. Its natural place is the job `staging`, the only place where the whole stack is running, after the smoke test; the price is the browser download and robot minutes on every release, plus a test account, because the staging database is always empty. Not run by the author: downloading Playwright (`playwright-core`) wasn't allowed in this lab.

</details>

<details>
<summary><b><i>Pinning</i> SHAs, Dependabot, and <code>actions.lock</code>: why the curriculum uses major <i>tags</i></b></summary>

`uses: actions/checkout@v7` follows its publisher's newest v7 release ([Concept 6](#6-the-image-shop-and-the-robots-permissions-github_token-permissions-secrets-and-variables)). GitHub's security documentation (read 5 November 2026) recommends something stricter:

- **Pinning a SHA**: `uses: actions/checkout@<40-character commit SHA>` + a comment with its version; a SHA can't be moved, so the action's content doesn't change silently. Take the SHA from a release tag of the original repo, not from a fork or a documentation example (the SHA in the GHCR documentation's example doesn't match any release tag, checked by the author on 31 Oct).
- **Dependabot**, GitHub's bot that watches versions and security holes, gives no security alerts for SHA-pinned actions, only for ones with a version tag.
- **The workflow lockfile** `.github/workflows/actions.lock` records the commit of every action and of the actions it uses. The documentation calls it the strongest protection, a replacement for SHA pinning; it has been in public preview since 14 Oct 2026.

The curriculum chose major tags of `actions/…` and `docker/…` only, so every line stays readable for beginners. A tool note: actionlint 1.7.12 (a checker for workflow files; the Indonesian edition's `ci.yml` had 0 errors in its lab) doesn't know the inputs of `checkout@v7`, `cache@v6`, and `setup-node@v7` yet, so a typo there gets through.

</details>

<details>
<summary><b>Your own <i>runner</i> on the Pi (<i>self-hosted</i>): why it's dangerous for a public repo</b></summary>

A Pi that's always on looks like a free robot machine: install GitHub's runner program, register it to the repo, then `runs-on: self-hosted`. For a public repo, don't. GitHub's rented machines are thrown away after every job ([Concept 3](#3-ci-a-robot-that-reads-exit-codes)); your own runner isn't, yet anyone may open a PR to a public repo, and that PR's code runs on your Pi, inside your home network, and can even stay there. In the words of GitHub's security documentation (read 5 November 2026), self-hosted runners "should almost never be used for public repositories". Even in a private repo, that risk comes from anyone who can open a PR.

The platform fee for self-hosted runners announced for March 2026 was postponed by GitHub without a new date; its billing documentation still says they're free. The Pi's alarm clock ([Concept 8](#8-a-systemd-timer-an-alarm-clock-for-the-module-12-security-guard)) needs no runner: the Pi only **asks** GitHub, and runs nobody's PR code.

</details>

<details>
<summary><b>Three ways to two processors: a native ARM64 <i>runner</i>, QEMU, and the BuildKit that brings its own emulator</b></summary>

[Concept 5](#5-one-image-for-two-processors-built-by-the-robot-without-emulation) chose a `$BUILDPLATFORM` cross-build ([7.1](#71--two-cross-processor-dockerfiles-with-buildplatform-8-minutes)). The first two ways haven't been run by the author:

- **A native ARM64 runner** `ubuntu-24.04-arm` (free for public repos; in a private repo it counts against the quota): each processor is built on its own machine (a matrix of two jobs), then joined into one index with `docker buildx imagetools create`, or automatically with the ready-made workflow `docker/github-builder` (v1), whose official example asks for the permission `id-token: write`.
- **QEMU**: `docker/setup-qemu-action@v4` registers the emulator with the kernel of the robot's machine. Safe on a rented machine thrown away after the job, but on your own machine it changes a system setting.
- **BuildKit's built-in emulator** (a small correction to the fold *One image for two architectures …* in [🔬 of Module 26](../module-26-docker-compose/README.md#-technical-deep-dive-optional)): "the emulator must be registered with the kernel first" is true for Docker's built-in builder (the `docker` driver), which fails at once with `exec format error`. The `docker-container` driver builder made by `setup-buildx-action` brings its own emulator and uses it silently: in the author's research of 31 Oct (a Pi 5, arm64 → amd64), its list of processors had no amd64, yet the old backend `Dockerfile` passed in 162 seconds through that emulator (the cross-build: 16 seconds).

That builder uses `moby/buildkit:buildx-stable-1`, a moving tag: BuildKit v0.33.1 in the research of 31 Oct, v0.34.2 in the `build` log of the Indonesian edition's final lab on 4 Nov. Want it exact, like the rule of Module 26? The `setup-buildx-action` step has no `with:` yet; add a `with:` holding `driver-opts: image=moby/buildkit:v0.34.2`.

</details>

<details>
<summary><b>How the author tested: a simulated robot, a local <i>image</i> shop, and a simulated "VPS" and "Pi"</b></summary>

All the **Expected output** boxes were made on one Raspberry Pi 5 (Ubuntu 26.04 arm64), without a GitHub account, a VPS, a second Pi, or a domain:

1. **The English edition (6 November 2026):** the author's small program ran every `run:` block of `ci.yml` unchanged (`uses:` simulated: checkout from a local bare repo, the cache as a Docker volume, the host's own buildx builder, no login), except the two `deploy-vps` steps: for that job it only evaluated the `if:`, `scripts/deploy.sh` ran directly on the "VPS" as the key's `command=` runs it, and the SSH part was tested separately with real OpenSSH in throw-away Alpine containers. GHCR = a local `registry:3.1.2` without a password, so "pull without logging in" in the lab proves nothing about a public GHCR package. The "VPS" and the "Pi" = Compose projects on the same Docker, deployed with `scripts/deploy.sh`; the scripts were also tested with a fake `docker`; the alarm clock's round was run by hand. No `--privileged` container, no forge.
2. **The Indonesian edition:** first the same tests while the code was written, plus `systemd-analyze verify` (systemd 259.9) for the unit files; then the final lab of 4 November 2026: `ci.yml` run as it is, `uses:` included, by the local forge Gitea 28.2.0 (standing in for GitHub) with Gitea Runner 5.2.4 (formerly named `act_runner`), the official actions downloaded from github.com without an account; the robot's Docker, the "VPS", and two "Pi"s each in a Docker-in-Docker container that must be `--privileged` (permitted for that lab only); real SSH into the "VPS" with the `restrict,command=` key; GHCR = a local image shop (`registry:3.1.2`) without a password, named `ghcr.io` only in the lab's DNS; a simulated scheduler every ±1 minute; all local HTTP without a domain, without emulation.

Gitea's screen texts, and the `remote:` lines of a push, are never quoted as GitHub's. The Indonesian edition shows two screenshots of that local forge here (a red and a green run, and a red pull request that can't be merged), clearly labeled as **Gitea, not GitHub**; the English edition's lab had no forge and no Docker-in-Docker, so it has no such screenshots: what GitHub shows is described from its documentation, and the merge box is the reconstruction in [Concept 11](#11-branch-protection-a-barrier-in-front-of-main).

In the Indonesian edition's lab, merging the red PR through the forge's API got `HTTP 405` with `Not all required status checks successful`, also for a site admin with the force option, the same as in the author's research of 31 Oct. Gitea's button `Create merge commit (When checks succeed)` is Gitea's own (it schedules a merge); GitHub's merge box is in the reconstruction of [Concept 11](#11-branch-protection-a-barrier-in-front-of-main).

**Different from GitHub**, so the time numbers are only examples: an arm64 machine, not amd64; the third-party images loaded from the machine, not pulled (±1.14 GB); `uses:` simulated, and `GITHUB_TOKEN`, `permissions`, and `concurrency` not simulated (in the Indonesian edition's lab, Gitea also ignored `environment`). **Lab hassles**, not your problem on GitHub, a VPS, or a Pi: in the Indonesian edition's forge lab, a dotless name wasn't forwarded by Docker's DNS from the job's hallway (the cure was `--add-host`), and the AppArmor `mosquitto` profile of the author's machine stuck to Mosquitto in nested Docker, worked around with a lab Compose file outside Git. In the English edition's lab, a lab-only Compose file (outside Git) loaded the third-party images from the machine, and the first try of PR C (a `sed` aimed at the wrong line) was thrown away and run again.

**Want to copy this without a GitHub account?** The English edition's route needs no `--privileged` container. The Indonesian edition's forge route does, and a `--privileged` container is root-like on your machine: use a practice machine, not one holding your home's data, and delete everything afterwards. Make sure `ghcr.io` in every Docker-in-Docker container points at your local shop; in that lab the author once forgot, and the robot's login reached the real GHCR (refused with `denied`, nothing pushed or pulled). What was tested, simulated, and only from documents: the status box at the start of the module. Machines, versions, and name substitutions: [📚](#-sources--image-credits).

</details>

<details>
<summary><b>Firmware on the robot: a compile check without an <i>artifact</i>, because the <code>.bin</code> file holds keys</b></summary>

The robot guards the firmware with only two cheap checks ([Concept 4](#4-lint--test--build-fail-fast), [4.1](#41--githubworkflowsciyml-stage-a-the-jobs-verify-and-test-15-minutes)). The natural next step: a **compile check** of Node 1 and Node 2 in every PR, so a C++ typo shows up before the merge. Its shape (not run by the author on the robot): `arduino-cli` 1.5.1, the `esp32:esp32` package 3.3.12, and exact library versions (Node 1: Module 28; Node 2: Module 14); `keys.example.h` copied to `keys.h` in both folders (example keys, not yours); then `arduino-cli compile`. The esp32 package = a ±1.8 GB download per run, unless `~/.arduino15` is kept with `actions/cache`. PlatformIO also supports 3.3.12 since `platform-espressif32` v8.0.0 (19 Oct 2026); the curriculum stays with `arduino-cli`, which uses the same board package as your Arduino IDE.

What's **not** allowed: a firmware artifact. Node 1's `.bin` file holds the ESP-NOW key and the portal password from `keys.h`; real firmware built by the robot (with keys from **Secrets**) and then kept as an artifact could be downloaded by others from a public repo. Your real firmware is still compiled on the laptop, then uploaded through the dashboard (Module 28).

</details>

<details>
<summary><b>A channel <i>tag</i> <code>:production</code> versus a Git <i>tag</i>: why <code>docker compose pull</code> isn't enough</b></summary>

The Syllabus's wording `docker compose pull && up -d` can be used literally with a channel tag: the robot sticks the tag `production` on the newest version, and the Compose file on the VPS and the Pi says `…-backend:production`. The curriculum chose Git tags ([Concept 8](#8-a-systemd-timer-an-alarm-clock-for-the-module-12-security-guard)), because a channel tag:

- breaks the "exact tags" rule of [Module 26](../module-26-docker-compose/README.md#2-a-mold-in-layers-image-tag-digest-and-architecture), like `latest`: its content changes silently, and its name doesn't tell which version is running;
- doesn't carry the `edge/` configuration and the Compose file, which come through Git;
- makes going back need the old version's digest (`@sha256:…`) that you wrote down yourself, while a revert with a Git tag is recorded in the history ([Concept 10](#10-semver-changelog-and-tags-one-number-then-forward-to-go-back)).

The tag `v<version>` binds the code, the configuration, and the image number in one commit: the Pi deploys all three together.

</details>

<details>
<summary><b>Conventional Commits and automatic release makers (mentioned, not used)</b></summary>

Conventional Commits 1.0.0 sets the form of a commit message: `type(scope): description`. According to its specification, `fix` = a PATCH release, `feat` = MINOR, `BREAKING CHANGE` (or a `!` after the type) = MAJOR, and other types don't change the version. Automatic release makers read those messages to raise the version, write the `CHANGELOG`, and make the tag.

This module's commit messages have a similar form (`feat: …`, `fix: …`), but they're only for humans and no tool reads them: such a tool would read PR B's `feat: …` commits as MINOR, not as the MAJOR 2.0.0 chosen here. In the curriculum, the version number is decided by humans and guarded by the version guard, `CHANGELOG.md` is written for humans, and tags are only made by the robot after staging ([Concept 10](#10-semver-changelog-and-tags-one-number-then-forward-to-go-back)). GitHub Releases (a page of release notes made from a Git tag) become a showcase in Module 32; option (c) of Level 3 in [🧩](#-independent-challenges) makes them automatic. Don't make one by hand through **Releases** → **Draft a new release**: that button can make a new `v…` tag.

</details>

<details>
<summary><b><i>Cache</i> <code>type=gha</code>, <i>coverage</i>, the provenance note <code>unknown/unknown</code>, and the package description</b></summary>

Not run by the author, except the provenance note:

- **The build cache `type=gha`**: `cache-from: type=gha,scope=backend` and `cache-to: type=gha,mode=max,scope=backend` in `build-push-action` (web: `scope=web`; without `scope`, the two images overwrite each other's cache). Docker's documentation for GitHub Actions recommends it, but labels it *Experimental*; the gain is small for us, because every release raises the version in `package.json`, so the `npm ci` layer is rebuilt anyway.
- **Coverage** (the percentage of code lines the tests run): `npm i -D -E @vitest/coverage-v8@5.0.5` (its version must equal Vitest's), then `npx vitest run --coverage`. Its number isn't a pass requirement: a line that runs isn't necessarily checked.
- **The provenance note**: the two `unknown/unknown` lines marked `attestation-manifest` in `imagetools inspect` ([9.7](#97--the-ghcr-packages-become-public-pull-without-logging-in-two-processors-4-minutes)) = the build's provenance note made by `build-push-action` (seen in the author's lab), not a third image. Don't want it? `provenance: false` in both image steps ([7.3](#73--stage-b2-the-job-build-for-linuxamd64-and-linuxarm64-8-minutes)).
- **The package description**: according to GHCR's documentation, a two-processor image gets its package page's description from the index's annotations (for example `annotation-index.org.opencontainers.image.description=…`), not from the `LABEL` in the `Dockerfile`; without them, your package page probably has no description.

</details>

## 🧩 Independent Challenges

> 🖥️ **Tools used:** Level 1: **an SSH terminal to the Pi**. Level 2: **VS Code**, a terminal at the **project root**. Level 3: **VS Code** and **GitHub** in the browser.

All optional (without ⭐), after [➕ Add-on](#-add-on-to-mini-smart-home). Without a Pi: skip Level 1; the free path: Level 3 only (c).

### Level 1 — The Pi asks every 5 minutes: a drop-in for the alarm clock (a small change, 20 minutes)

> [!NOTE]
> Not run by the author on real systemd; in the Indonesian edition's lab the file was only checked with `systemd-analyze verify` (systemd 259), and in the English edition's lab only structurally.

Make the Pi ask every 5 minutes **without** editing the unit files. The way is a drop-in: a `.conf` file that overrides part of the alarm clock's content, in the folder `/etc/systemd/system/smarthome-update.timer.d/` (create it with `sudo mkdir -p`; [Concept 8](#8-a-systemd-timer-an-alarm-clock-for-the-module-12-security-guard)). A hint: in the *systemd.timer* documentation, look up what an empty schedule setting means.

**Test yourself:** `systemd-analyze verify` as in [11.3](#113--systemd-analyze-verify-both-files-at-once-read-its-output-4-minutes) (the drop-in is read too) must have no output; then `sudo systemctl daemon-reload` and `sudo systemctl restart smarthome-update.timer`. **You pass when** `systemctl show smarthome-update.timer -p TimersMonotonic` holds `OnBootUSec=5min` and `OnUnitActiveUSec=5min` without `15min`, and `journalctl -u smarthome-update.service` logs a round every ±5–7 minutes (from systemd's documentation; not recorded by the author).

<details>
<summary><b>Level 1 answer key</b></summary>

`every-5-minutes.conf` without its comments (the file, how to install it and undo it: [`level-1/`](code/challenges/key/level-1/)):

```ini
[Timer]
OnUnitActiveSec=
OnBootSec=5min
OnUnitActiveSec=5min
```

Every schedule that's written applies: without the empty `OnUnitActiveSec=`, the old 15 minutes stay. An empty value empties **all** schedules, also `OnBootSec=5min` from the original file, so that line is written again. Without it, a restarted Pi silently stops deploying releases: `OnUnitActiveSec` counts from the previous round, which doesn't exist yet (the *systemd.timer* documentation). `verify` doesn't catch it (there's still one schedule), but the rule shows when the drop-in holds only `OnUnitActiveSec=`:

**Expected output (the Indonesian edition's lab, `systemd-analyze verify`; code `1`):**

```text
smarthome-update.timer: Timer unit lacks value setting. Refusing.
Unit smarthome-update.timer has a bad unit file setting.
```

The price: GitHub is asked 3× as often (`git fetch` every 5 minutes); GHCR still only at a new release (an `already deployed` round has no Docker).

</details>

### Level 2 — The version guard: the empty "the version must go up" part (fill in the blanks, 30 minutes)

The skeleton [`check-version-blanks.mjs`](code/challenges/key/level-2/check-version-blanks.mjs) checks one number in 10 places, but part 2 ([6.4](#64--the-version-guard-scriptscheck-versionmjs-one-number-in-10-places-only-allowed-to-go-up-5-minutes)) is still a TODO: (1) `isDeployed()`, the list of files that get deployed; (2) a version going down = `FAIL`; (3) what gets deployed changed without the version going up = `FAIL`. At the project root: `git switch main`, `git pull`, `git switch -c try/version`; paste the skeleton (**Copy raw file**) over `scripts/check-version.mjs`, fill in its TODOs, then commit so `git restore .` doesn't delete your answer.

**Test yourself:** `git fetch`, then every row of [the table of tries](code/challenges/key/level-2/README.md#try-it) (version = your `main`'s): a small change, `BASE=origin/main node scripts/check-version.mjs` (PowerShell: as in 6.7), compare, `git restore .`. **You pass when** everything matches; the skeleton as it is misses 7 of the author's 20 scenarios.

**Expected output (the author's lab, laptop; the lab's `main` at 2.0.4):** `Login.tsx` changed, the version kept; the skeleton (code `0`), then the answer (code `1`):

```text
PASS  one version number 2.0.4 in 10 places (…); compared with origin/main: no deployed file changed, the version stays 2.0.4 (allowed)
FAIL  what gets deployed to the VPS/Pi changed (frontend/src/pages/Login.tsx) but the version is still 2.0.4 (= origin/main). …
```

Done: `git switch main`, `git branch -D try/version`.

<details>
<summary><b>Level 2 answer key</b></summary>

The answer = `scripts/check-version.mjs` (its diff is in [`level-2/`](code/challenges/key/level-2/)). TODO 1 = what the VPS and the Pi read: for the backend a list of "what goes in" (`Dockerfile`, `package*.json`, `migrations/`, `src/` without `src/integration/`, …), for the frontend a list of "what stays out" (its `Dockerfile` copies the whole folder), plus `compose.cloud.yml`, the `edge/` configuration, `grafana/`, and `scripts/*.sh`; documents and tests don't count. TODOs 2 and 3 = `if` then `else if`, "goes down" first: a plain revert gets exactly one message.

</details>

### Level 3 — Pick one: the VPS as a canary, an approval before production, or automatic GitHub releases (from scratch, 60 minutes)

> [!NOTE]
> No key; not tried by the author (the author's simulated robots ignore `environment`). Check the settings and commands in the official documentation.

- **(a) The VPS as a canary.** Now the tag is made before the VPS is deployed to (9.2: `needs: [build, tag-release]`). Reverse it: `deploy-vps` deploys that run's commit, and only then `tag-release` tags it if the VPS is healthy; the Pi still follows the tag ([Concept 7](#7-push-vs-pull-the-robot-knocks-on-the-vps-the-pi-asks-by-itself)). A hint: with `command=`, the word the robot sends can be read by `deploy.sh` in `SSH_ORIGINAL_COMMAND` (the sshd documentation); accept only 40 characters `0-9a-f` that exist in `origin/main`. Traps: a job whose `needs` was skipped is skipped too (the path without `VPS_HOST`); the VPS runs its old `deploy.sh` (if that's broken, updates stop). **You pass when** a release that fails on the VPS gets no tag, a healthy one gets a tag and then the Pi follows, and without `VPS_HOST` the tag is still made.
- **(b) An approval before production** ([Concept 9](#9-staging-vs-production-the-dress-rehearsal-vs-the-show)). Create an environment `production` with your friend as a required reviewer (a free account: public repos only), write `environment: production` in `deploy-vps`, and move `VPS_SSH_KEY` into an environment secret: only a job that names that environment can read it (GitHub's documentation). Alone? Make yourself the reviewer, without **Prevent self-review** (that setting forbids whoever triggered the run from approving it). **You pass when** the next release's run waits at `deploy-vps` until it's approved, then the VPS is updated; the Pi doesn't wait (the tag was already made).
- **(c) Automatic GitHub releases.** A new job after `tag-release` makes a release in **Releases** from that tag, holding the same `CHANGELOG` piece (the `awk` of 9.1); `contents: write` in that job too (update the PR template); an existing release is skipped. In `ci.yml`, not in a workflow that waits for a tag: a tag made by `GITHUB_TOKEN` doesn't trigger other workflows (GitHub's documentation). For example the GitHub CLI `gh` on the runner, without a third-party action. **You pass when** the next release's notes are the same as its tag message (`git show v<version>`), without an extra tag.

## ➕ Add-on to "Mini Smart Home"

This week Mini Smart Home becomes **v2.0, a production pipeline**. All four pull requests (PR D of Practice 13 included) are merged, so A–D check what's running, E records, and F matches (±30 minutes, without ⭐). The state of Mini Smart Home after Module 29:

![Diagram of Mini Smart Home v2.0 after Module 29: tested by the robot, deployed by itself (Add-on); arrow = who starts it, dashed = a pull, or coming later. Laptop: branch, change, raise the version, pull request; npm test + the test database smarthome-db-test (counter 5433), npm run test:integration, node scripts/check-version.mjs; green Checks, Merge. The PR arrow to GitHub (public repo; a barrier in front of main = the branch rule): the robot ci.yml, PR verify ∥ test then build; a push to main build + push, staging, tag-release, deploy-vps; only tagged releases deployed; the public robot log: no secrets printed. GHCR: backend and web, amd64 + arm64, public packages; a version whose staging was red has no Git tag. Release tags v2.0.0, v2.0.1, v2.0.2, only the robot. Secrets VPS_SSH_KEY; Variables VPS_HOST, VPS_USER, VPS_KNOWN_HOSTS. Check without SSH: https://iot.yourname.my.id, the version under the Login screen title (reload twice), /api/health says version 2.0.1; the free path through Cloudflare Tunnel. The VPS (main path): backend + web from GHCR, up --no-build; deployed by the robot over SSH, a restrict,command= key for the user house, deploy.sh (center) + the smoke test; you no longer SSH in; old images pile up (Module 30). Home, a router without port forwarding: Node 1 1.7.x and Node 2 1.0.0 unchanged; the gateway Pi: the official Mosquitto image, the alarm clock every 15 minutes (User=budi), deploy.sh (gateway); the free path: the center on the Pi too. The band: after Module 29 one number 2.0.0 for the backend and the dashboard (your practice 2.0.1, 2.0.2), contract 1.6, firmware and migrations unchanged. Bottom, four pull requests (tests + robot, pipeline + release 2.0.0, PATCH 2.0.1, revert 2.0.2), files: ci.yml, app.ts + src/integration/, backend and frontend 2.0.0, two Dockerfiles, compose.cloud.yml, check-version.mjs, deploy.sh, smoke-test.sh, the systemd units, CHANGELOG.md, .gitattributes, the PR template, the READMEs; never in Git: .env, edge/.env, edge/bridge/center.conf, backup/, the robot's private key (only in Secrets), .git/smarthome-deployed. Module 30: Uptime Kuma + a Telegram alert in under 2 minutes, /health 503, automatic backups off the VPS + a restore test, a runbook, old images and a full disk, MINOR v2.1. Honestly: the robot, GitHub, GHCR, the VPS, and a real gateway Pi not tested (simulated on the author's Pi 5, GitHub screens reconstructed); the amd64 image not run; the timer only checked with systemd-analyze (Indonesian edition); a broker crashing after ±10 seconds can slip through.](assets/project-state-m29.png)

> 🖥️ **Tools used:** **VS Code** on the laptop (a terminal at the **project root**, in `backend`, and in `frontend`; E: the `learn-iot` folder), **GitHub** and **Chrome**, and an SSH terminal to the Pi to read the journal (D). GitHub's screens: from GitHub's documentation, as in the practices.

### A. Tests: 203 unit tests, 20 integration tests, 5 dashboard tests, and lint in two folders

The backend has 203 unit tests without SQL and 20 integration tests with a `…_test` test database ([Practice 3](#practice-3--a-test-database-and-20-integration-tests-60-minutes)), the dashboard 5 tests, and both folders are checked by oxlint `--deny-warnings` ([Practice 2](#practice-2--backend-lint-and-frontend-tests-oxlint-and-vitest-25-minutes)). Check without Docker, in `backend` then `frontend`: `npm run lint` → `Found 0 warnings and 0 errors.`; `npm test` → `Tests  203 passed | 20 skipped (223)` (the robot runs the 20 integration tests) and `Tests  5 passed (5)`.

### B. The robot and branch protection: `ci.yml` with six jobs, three required checks

On every pull request, `.github/workflows/ci.yml` ([Practice 4](#practice-4--a-checking-robot-on-every-pull-request-40-minutes)) runs `verify` and `test` at the same time, then `build` without pushing; after a merge, `build` pushes, then `staging`, `tag-release`, and `deploy-vps`. The `main` branch rule ([Practice 5](#practice-5--branch-protection-a-red-pr-cant-be-merged-20-minutes) and 7.6) holds every PR until `verify`, `test`, and `build` are green, for you too. Check: the **Actions** tab, the top `push` run green up to `deploy-vps` (the free path: skipped), and **Settings** → **Branches** still holds the `main` rule.

### C. One image, two processors on GHCR, the packages public

The images `mini-smart-home-backend` and `mini-smart-home-web` for `linux/amd64` (VPS) and `linux/arm64` (Pi) are built by the robot without emulation (Practice 7), and their packages are public since [9.7](#97--the-ghcr-packages-become-public-pull-without-logging-in-two-processors-4-minutes): the VPS and the free-path Pi pull them without logging in, without building again. Check from the laptop without logging in (the result as in 9.7: `linux/amd64` and `linux/arm64`):

```text
docker buildx imagetools inspect ghcr.io/<account>/mini-smart-home-web:2.0.2
```

### D. The VPS updated by the robot with a restricted key, the Pi by an alarm clock

The robot knocks on the VPS over SSH with a key that can only run `scripts/deploy.sh` ([Practice 10](#practice-10--the-vps-switches-to-pulling-a-robot-key-that-can-only-run-one-script-45-minutes)); the Pi asks by itself every 15 minutes through `smarthome-update.timer`, as `budi`, not root ([Practice 11](#practice-11--the-pi-updates-itself-a-systemd-alarm-clock-40-minutes)). Both deploy only tagged releases. Check: `https://iot.yourname.my.id/api/health` writes `"version":"2.0.2"`, the **Login** screen `v2.0.2` (reload twice), and `journalctl -u smarthome-update.service -n 30` on the Pi logs every ±15 minutes `… v2.0.2 already deployed (gateway): no new release`.

> 🔀 **The free path:** no VPS; `/api/health` through the Tunnel, the Pi's journal `(center gateway)`. **Without a Pi:** no journal.

### E. `CHANGELOG.md` and the tags `v2.0.0`, `v2.0.1`, `v2.0.2`: note your stopwatch time

`CHANGELOG.md` ([6.5](#65--changelogmd-a-notebook-of-changes-for-humans-4-minutes)) now holds `[Unreleased]`, `[2.0.2]`, `[2.0.1]`, and `[2.0.0]`, the newest on top; every release has a tag made by the robot that holds its section (9.6). In a terminal at the project root:

```text
git fetch --tags
git tag -n1
git diff --stat v2.0.0 v2.0.2
```

`git tag` writes three release tags (`v2.0.0`, `v2.0.1`, `v2.0.2`), each holding `Mini Smart Home <version>`. `git diff` only names `CHANGELOG.md`, two `package.json` files, two locks, and `compose.cloud.yml`, without `Login.tsx`: the content is the same, the number went up, forward to go back ([Practice 13](#practice-13--back-to-the-previous-version-a-revert-becomes-202-20-minutes)).

Write down in `learn-iot/module-29/notes.md` (without passwords, keys, or the contents of `.env`): your path, the dates of L0–L3, your manual steps before (🔁 Step 2) and now, the minutes from merge → VPS and merge → Pi ([12.6](#126--delete-the-branch-and-note-the-stopwatch-time-3-minutes)), and what you haven't tested yet; then commit and push.

### F. Match your project: new and changed files, three diffs, and the Module 29 items of the pull request template

The list of files is in the table of [🧰](#-what-you-need). Their content must be the same as the files of the same name in [`code/`](code/), except your version 2.0.2 (two `package.json` files, two locks, three `image:` lines), your dates and the 2.0.1–2.0.2 entries in `CHANGELOG.md`, and `<account>` in the `LABEL` of both `Dockerfile`s. The changes of `backend/`, `frontend/`, and `edge/` compared with Module 28 are in three diffs: [`backend-2.0.diff`](code/backend-2.0.diff), [`frontend-2.0.diff`](code/frontend-2.0.diff), and [`edge.diff`](code/edge.diff). The project tree of [Syllabus §9](../../SYLLABUS.md#9-repository-folder-structure) (v1.0.31) records `.github/` (the pull request template of Module 16, the CI/CD workflow of Module 29), `CHANGELOG.md`, and `scripts/` with the release deployer, the smoke test, the version guard, and the systemd unit files.

The project README from [9.4](#94--the-readme-and-the-pull-request-template-then-commit-and-push-3-minutes) now has the section [Tested and deployed automatically (Module 29)](code/README.md#tested-and-deployed-automatically-module-29). In the pull request template, the two **(Module 26)** items and the `npm audit` item are updated too, and there are six **(Module 29)** items, three in the **Checklist before merging** and three in the **Security checklist**:

```markdown
- [ ] **(Module 29)** Every robot check in the **Checks** tab is green (`verify`, `test`, `build`), with no step "made green" with `continue-on-error`, `if: false`, `.skip`/`.only`, or a deleted test; on the laptop `npm test` passes in the backend and the frontend, and the integration tests pass with a test database (`npm run test:integration` in the `backend` folder)
- [ ] **(Module 29)** If what gets deployed to the VPS/Pi changed (the backend and frontend code or `Dockerfile`, `compose.cloud.yml`, the broker configuration in `edge/`, `grafana/`, or `scripts/*.sh`): the version is raised by SemVer in ALL places at once (the two `package.json` + lock, the three image tags of `compose.cloud.yml`) and `CHANGELOG.md` has an entry `## [<version>] - <date>`; `node scripts/check-version.mjs` (with `BASE=origin/main` after `git fetch`) writes `PASS`. Bringing back old content (revert) = the old content with a number that still goes UP
- [ ] **(Module 29)** New behavior has tests (unit tests for functions, integration tests with a test database for routes that read/write the database); a new migration only ADDS (new tables, columns, or indexes) so the previous version's image still fits its database, and the history is backed up by hand before a release that migrates (automatic backups follow in Module 30)
<!-- … -->
- [ ] **(Module 29)** Robot: `permissions` as small as possible (top level `contents: read`; `packages: write` only for the job `build`, `contents: write` only for `tag-release`), no `pull_request_target`, actions only from `actions/*` and `docker/*` with a major tag, and no secret in a workflow file or log (a public repo: anyone can read the robot's log; no `echo` of a secret and no `set -x`)
- [ ] **(Module 29)** The robot's SSH key = a SPECIAL key (not your personal key), stored only in **Secrets** (`VPS_SSH_KEY`) and restricted on the VPS with `restrict,command="sh /home/house/mini-smart-home/scripts/deploy.sh"` (written by hand, not through `ssh-copy-id`; `ssh -i <robot key> house@<VPS> whoami` answers with a `deploy.sh` line, not `house`); the robot checks the VPS fingerprint (`VPS_KNOWN_HOSTS`, `StrictHostKeyChecking=yes`, never `no`)
- [ ] **(Module 29)** Integration tests only against a throw-away `…_test` database, never against the home database; the `main` branch rule stays on (PR required, the checks `verify`/`test`/`build` required, **Do not allow bypassing**); `scripts/deploy.sh` and the Pi timer contain no `down -v`, `prune`, or `git reset --hard`, and the timer runs as an ordinary user in the `docker` group, not root
```

What stays manual: the public GHCR packages (once), the robot key with its **Secrets** and **Variables**, the unit copies in `/etc/systemd/system/`, `.env` on the VPS and the Pi, `edge/.env`, and `edge/bridge/center.conf`. What follows in Module 30: monitoring, automatic backups, runbooks, cleaning up the old images that pile up, and a fuller scheduler for the certificate cron of Module 27.

**Mini Smart Home v2.0: every change is tested by the robot and reaches the VPS and the Pi without you SSHing in.** The Syllabus (v1.0.31) gives ➕ [Module 30](../../SYLLABUS.md#module-30--monitoring-backup-runbooks-know-first-never-lose-data) the number v2.1, because v2.0 is already used here.

## 📖 Glossary

| Term | Meaning |
| :--- | :--- |
| **Artifact** | A job's result file that GitHub keeps for downloading; firmware `.bin` files (holding keys) never become artifacts. |
| **Branch protection** (the branch rule) | A barrier in front of `main`: it only lifts when the required checks are green, for the repo owner too. A free account: public repos only. |
| **`$BUILDPLATFORM`** (cross-build) | The kitchen (`RUN`) on the builder's processor, the serving plate (the final stage without `RUN`) per processor: amd64 and arm64 images without emulation. |
| **Bypass** | Getting past the branch rule. The repo owner is an admin, so **Do not allow bypassing the above settings** must be ticked. |
| **`CHANGELOG.md`** | A notebook of changes for humans: `## [Unreleased]`, then one section per release, which becomes the content of its tag. |
| **CI/CD** | A robot that tests (CI) and deploys (CD) every time a change is sent to GitHub (push) or proposed through a pull request. |
| **Container job** | The jobs `verify` and `test` in the container `node:24.22.1-alpine3.24`, the same Node as the backend and dashboard `Dockerfile`s. |
| **Test database** | A practice kitchen: an empty, throw-away TimescaleDB whose name must end in `_test`; never your home's database. |
| **Deploy** | To put into production; here always through `scripts/deploy.sh`. |
| **Push** and **pull** | The robot knocks on the VPS, which has a public address, over SSH (push); the Pi behind a router asks GitHub by itself (pull). |
| **Emulation** | Pretending to be another processor (QEMU); can be much slower. Not used here. |
| **End-to-end test** | A customer orders until the food arrives: from the browser to the database; the slowest, not used yet (🔬 Playwright). |
| **GHCR** (a registry, the image shop) | `ghcr.io/<account in lowercase>`. A new package can be private; a public one is pulled without logging in and can't be made private again. |
| **`GITHUB_TOKEN`** | The robot's temporary token for each job, instead of your personal PAT; its permissions are in `permissions`. |
| **Multi-architecture index** | A table of contents behind one name and tag: the amd64 and arm64 molds; each machine pulls the one that fits. |
| **Integration test** | Cooking the recipe in the practice kitchen: API routes, SQL, and the test database; 20 tests in `backend/src/integration/`. |
| **The alarm clock** (systemd timer) | `smarthome-update.timer`: 5 minutes after the Pi starts, then every 15 minutes + a random ≤ 60 seconds. |
| **Job**, **step**, and **action** | A station on its own machine; a step at that station: `run:` or `uses:` (a ready-made action). |
| **`known_hosts`** | The list of trusted machine keys; the robot only logs in to a VPS whose key matches `VPS_KNOWN_HOSTS`. |
| **Exit code** | `0` = success (a green check), anything else = failure (a red cross); the only thing the robot reads. |
| **The robot key** | A second SSH key without a passphrase; on the VPS it starts with `restrict,command=`: whatever is sent, what runs is `deploy.sh`. |
| **Lint** | A spell checker for code (oxlint) that doesn't run the code; with `--deny-warnings`, one warning = red. |
| **Forward to go back** (revert) | Old content with a number that goes up: 2.0.2 holds the content of 2.0.0. The database doesn't go back with it. |
| **`oneshot`** | A guard who does one round and sits down again: `deploy.sh` runs until it's done, then stops. |
| **`permissions`** | The `GITHUB_TOKEN`'s permissions per job, as small as possible; `contents: write` only for `tag-release`. |
| **Pipeline** | The assembly line from a pull request to production; a red station stops the stations after it (`needs`). |
| **The testing pyramid** | Many fast tests at the bottom, few slow tests at the top; a mistake is tested at the lowest possible layer. |
| **Tagged release** | A version that passed the robot and staging, marked by the robot with the tag `v<version>`; the only thing the VPS and the Pi deploy. |
| **Runner** | A rented GitHub machine (`ubuntu-24.04`) for one job, deleted afterwards. |
| **Secrets** and **Variables** | The secret drawer (`***` in the log, `VPS_SSH_KEY`) and the ordinary settings drawer (readable in the log, `VPS_HOST`). |
| **SemVer** | MAJOR.MINOR.PATCH: PATCH a small fix, MINOR a new feature, MAJOR when old users (also you, who deploy) are forced to change too. |
| **Staging** and **production** | The dress rehearsal of a new version with fake data before production, which is the show: the VPS or the Pi with your home's data. Not the Let's Encrypt practice CA of Module 27. |
| **Status check** | One job's result in the **Checks** tab (GitHub's documentation: `ci / verify (pull_request)`); the branch rule picks its job name. |
| **Git tag** | A bookmark on one commit; `v…` release tags are made only by the robot and never moved. |
| **The smoke test** | Turn it on and see whether there's smoke: `scripts/smoke-test.sh`, four checks that only read. |
| **Unit test** | Tasting an ingredient: one function, or one route with a `vi.mock` mock; fast, but it runs no SQL. |
| **Workflow** and **event** | The file `.github/workflows/ci.yml` (the workflow `ci`) and its triggers: `pull_request` and `push` to `main`. |
| **YAML** | The language of the robot's files: a line indented two more spaces belongs to the line above it; no tabs. |

## 📝 5-Question Quiz

[The Phase 5 completion criteria](../../SYLLABUS.md#8-evaluation--completion-criteria-for-each-phase) ask for at least 4 correct answers in each quiz of Modules 26–30.

1. Three tests: a browser that logs in and then opens the dashboard; `POST /devices` against a real test database; `wibTime()` with a fake UTC clock. (a) Order them from the bottom layer of the pyramid. (b) A device key's fingerprint is written with `upper($5)`. Which layer catches it, what refuses it, and why do the backend's 203 unit tests stay green?
2. The robot has made the tag `v2.0.1`. On the free-path Pi, your friend only runs `docker compose pull`, then `up -d`, without Git. (a) Why does the dashboard stay at `v2.0.0`? (b) Why does the alarm clock follow the release tag, not the tip of `main`?
3. Your `main` rule requires a PR and the checks `verify`, `test`, and `build`, but you can still merge a PR whose `test` is red. (a) Which setting was forgotten, and why could you get through? (b) Why isn't `build` alone enough?
4. Mini Smart Home is now at version 2.0.2. Which number for each of these changes, each starting from 2.0.2? (a) A typo on the **Fleet** screen is fixed. (b) A new chart; the old screens and routes stay. (c) The backend refuses to start without one new required `.env` setting.
5. (a) Why does the robot knock on the VPS, while the Pi asks by itself? (b) The robot still logs in to the VPS over SSH. Then what does "without you SSHing in" mean, and what restricts the robot key?

<details>
<summary><b>Answer key</b></summary>

1. (a) `wibTime()` = a unit test (the fastest), `POST /devices` = an integration test, the browser flow = an end-to-end test. (b) The integration test: `CHECK (key_hash ~ '^[0-9a-f]{64}$')` from migration `010` refuses capitals, and the backend answers `503`, while the test expects `201`. None of the 203 unit tests runs SQL: the route tests use a `vi.mock` mock ([Concept 2](#2-what-a-mock-cant-see-integration-tests-with-a-test-database)).
2. (a) `compose.cloud.yml` on the Pi still names the exact tag `…:2.0.0`, so `pull` only pulls 2.0.0 again; the number 2.0.1 comes through Git. That's why `deploy.sh` first does `git fetch --tags` and `merge --ff-only` to the newest tag, and only then `pull` and `up` ([Concept 8](#8-a-systemd-timer-an-alarm-clock-for-the-module-12-security-guard)). (b) The robot makes the tag after that version's images are on GHCR and staging has passed. The tip of `main` can carry a Compose file with a new tag before its images exist, or a commit that hasn't been rehearsed.
3. (a) **Do not allow bypassing the above settings**. According to GitHub's documentation, without this tick the branch rule doesn't apply to admins, and the repo owner, meaning you, is an admin ([Concept 11](#11-branch-protection-a-barrier-in-front-of-main)). (b) `build` is skipped when `test` is red (`needs`), and according to the same documentation, a skipped job reports success; that's why all three are required.
4. (a) 2.0.3, PATCH: a small fix. (b) 2.1.0, MINOR: a new feature, the old ways still work. (c) 3.0.0, MAJOR: old users, meaning you who deploy, are forced to change too. That setting is written in the production machine's `.env` and in the `.env` step of the job `staging`; forget the second one and `staging` turns red first ([Concept 10](#10-semver-changelog-and-tags-one-number-then-forward-to-go-back)).
5. (a) The VPS has a public address and door 22: the robot knocks (push) and knows the result right away in `deploy-vps`. The Pi behind a router without port forwarding can't be knocked on, so its alarm clock asks GitHub every 15 minutes (pull) ([Concept 7](#7-push-vs-pull-the-robot-knocks-on-the-vps-the-pi-asks-by-itself)). (b) Only your SSH terminal is gone. The robot key starts with `restrict,command=`: whatever is sent, only `deploy.sh` runs, without a terminal or tunnels. Still keep it secret: the `docker` group is root-like.

</details>

---

## ✅ Module 29 Completion Checklist

The pass requirement from the [Syllabus](../../SYLLABUS.md#module-29--testing--cicd-every-change-tested-and-deployed-automatically): "a small pull request that gets merged shows up in production (VPS and Pi) without you SSHing in, and a PR whose tests fail can't be merged." Its parts are **L0** (a prerequisite), **L1**, **L2**, and **L3**. **The main path:** L1 + L2 (the VPS) + L3 (the gateway). **The free path:** L1 + L2-free (shown through the Tunnel, deployed by the Pi's alarm clock without an SSH job) + L3. **Without a Pi:** L1 + L2, a pass of the path without a Pi. **Laptop only**, **a private repo** on a free account, and **without a GitHub account**: not a full pass yet. Without a Kit and Wokwi: the same as your path.

> [!NOTE]
> **The author ran `ci.yml`'s steps with a simulated robot on one Raspberry Pi 5, not on GitHub.** GitHub's screens and branch protection, a real GHCR and VPS, and a running systemd alarm clock weren't recorded ([📚](#-sources--image-credits)). Tick only what happened in your repo and on your machines.

- [ ] **L0** The repo is public; PR A green in `verify` and `test`, with `Tests  223 passed (223)` and no `FAIL` line ([4.4](#44--l0-red-once-on-purpose-then-all-green-8-minutes)).
- [ ] **L1** A direct push to `main` is refused; the PR `try/red` ✗, and its merge box refuses without an option to bypass the rule, for you too ([5.3](#53--l1-the-pr-tryred-is-red-the-merge-button-is-locked-6-minutes)).
- [ ] **L2** PR C merged without an SSH terminal of yours; `deploy-vps` reports `v2.0.0 -> v2.0.1 deployed (center)`; the **Login** screen on your domain shows the new text and `v2.0.1`, `/api/health` `"version":"2.0.1"` ([12.4](#124--l2-the-robot-deploys-to-the-vps-the-login-screen-says-v201-8-minutes)). **L2-free:** the same, through the Tunnel, deployed by the Pi's alarm clock.
- [ ] **L3** The Pi's journal writes `v2.0.0 -> v2.0.1 deployed (gateway)` (the free path: `(center gateway)`), deployed without you SSHing in ([12.5](#125--l3-the-pi-deploys-201-by-itself-read-from-its-journal-6-minutes)).
- [ ] The warm-up matches the "Self-test answer key"; `hello.yml` green then red, `try/robot` closed without merging (Quick Win).
- [ ] ⭐ The repo is public; today's backup in `backup/` and the fingerprint "Before the robot (1.3)" recorded (Practice 1).
- [ ] ⭐ `Found 0 warnings and 0 errors.` in two folders with `--deny-warnings`; `Tests  5 passed (5)`, red once, then green (Practice 2).
- [ ] ⭐ `Tests  20 passed (20)`, then `Tests  223 passed (223)`; `upper($5)` caught by an integration test; without a database `20 skipped` (Practice 3).
- [ ] ⭐ `ci.yml` stage A; PR A red once, then green and merged; the `push` run green (Practice 4).
- [ ] ⭐ Except a private repo: the classic `main` rule with four settings, the required checks `verify` and `test` (Practice 5).
- [ ] ⭐ 2.0.0 in 10 places and on screen; `CHANGELOG.md`; the version guard `PASS`, `FAIL`, then `PASS` (Practice 6).
- [ ] ⭐ `$BUILDPLATFORM` in two `Dockerfile`s; `build` green with `COPY` for `linux/amd64` and `linux/arm64`; three required checks (Practice 7).
- [ ] ⭐ `scripts/smoke-test.sh` and the job `staging` committed; you know why a red rehearsal doesn't reach the VPS and the Pi (Practice 8).
- [ ] ⭐ `ci.yml` with six jobs; after merging PR B, the `push` run green up to `tag-release`; `git show v2.0.0` writes `Mini Smart Home 2.0.0`; both public packages pulled without logging in, for two processors (Practice 9).
- [ ] ⭐ The main path and without a Pi: `never -> v2.0.0 deployed (center)`, `accounts` and `devices` unchanged; the robot key tested with `whoami`; the VPS fingerprint matches; **Secrets** and **Variables** filled in (Practice 10).
- [ ] ⭐ The main and the free path: `systemd-analyze verify` without output; the alarm clock `enabled`; the journal `-> v2.0.0 deployed` (free: `already deployed`) without `FAIL:`; the gateway broker not restarted (Practice 11).
- [ ] ⭐ The version guard refuses without the version going up, then `PASS … 2.0.1 …`; L2, L3, and the stopwatch time recorded (Practice 12).
- [ ] The revert refused by the version guard, then 2.0.2 holds the content of 2.0.0 and the 2.0.1 entry stays; the VPS and the Pi deploy it by themselves (Practice 13, recommended).
- [ ] Security: secrets only in **Secrets**, never in a workflow or a log; the smallest `permissions` per job; the robot key `restrict,command=`, `whoami` answered by `deploy.sh`; integration tests only against `…_test`; branch protection without a bypass; no `down -v`, `prune`, or `git reset --hard`; the alarm clock as `budi`, not root; `.env` not in Git.
- [ ] The project matches `code/` (➕ F).

**Every code change of Mini Smart Home is now tested by the robot, packed into images for two kinds of processors, then deployed by itself to the VPS and the Pi.** Knowing first when something breaks, automatic backups, and runbooks follow in Module 30; until then `/health` always answers `200`, database backups are still by hand, and old images pile up on the disk.

> ➡️ **Next module:** Module 30 — Monitoring, Backup, Runbooks: Know First, Never Lose Data (coming soon; [read the summary in the Syllabus](../../SYLLABUS.md#module-30--monitoring-backup-runbooks-know-first-never-lose-data)). You'll know before your users when something breaks, you'll never lose data, and others can run your system from its documentation.

## 📚 Sources & Image Credits

**Official sources** (read 31 October–5 November 2026):

- **GitHub Actions**: [workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax), [events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows), [`GITHUB_OUTPUT`](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands), [service containers](https://docs.github.com/en/actions/tutorials/use-containerized-services/create-postgresql-service-containers), [runners](https://docs.github.com/en/actions/reference/runners/github-hosted-runners) and [the `ubuntu-24.04` image README](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md) (20261026.354.1), [billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions), [secure use](https://docs.github.com/en/actions/reference/security/secure-use), [Secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets), [Variables](https://docs.github.com/en/actions/concepts/workflows-and-actions/variables), [environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments); the source code of [`actions/runner`](https://github.com/actions/runner) and [`actions/toolkit`](https://github.com/actions/toolkit).
- **GHCR and the repo**: [Container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry), [packages from Actions](https://docs.github.com/en/packages/managing-github-packages-using-github-actions-workflows/publishing-and-installing-a-package-with-github-actions), [package visibility](https://docs.github.com/en/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility), [package billing](https://docs.github.com/en/billing/concepts/product-billing/github-packages), [viewing packages](https://docs.github.com/en/packages/learn-github-packages/viewing-packages); [repo visibility](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility), [branch protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) and [how to set it up](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule), [rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets), [required status checks](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks), [PR approvals](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/approving-a-pull-request-with-required-reviews), [revert](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/reverting-a-pull-request).
- **Docker, systemd, SSH**: [multi-platform builds](https://docs.docker.com/build/building/multi-platform/), [`build-push-action`](https://github.com/docker/build-push-action), [`docker compose up`](https://docs.docker.com/reference/cli/docker/compose/up/), [the `docker` group](https://docs.docker.com/engine/install/linux-postinstall/); Watchtower [archived 17 December 2025](https://github.com/containrrr/watchtower); [systemd.timer](https://www.freedesktop.org/software/systemd/man/latest/systemd.timer.html), [systemd.service](https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html), [systemd-analyze](https://www.freedesktop.org/software/systemd/man/latest/systemd-analyze.html); OpenSSH [sshd](https://man.openbsd.org/sshd#AUTHORIZED_KEYS_FILE_FORMAT) (`restrict`, `command=`) and [ssh_config](https://man.openbsd.org/ssh_config).
- **Versions and tests**: [SemVer 2.0.0](https://semver.org/), [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/), [Vitest](https://vitest.dev/guide/) 5, [oxlint](https://oxc.rs/docs/guide/usage/linter.html), Fastify [*Testing*](https://fastify.dev/docs/latest/Guides/Testing/); 🔬 only: [`node:test`](https://nodejs.org/docs/latest-v24.x/api/test.html), [Playwright](https://playwright.dev/docs/intro) 1.64, [Wokwi CI](https://docs.wokwi.com/wokwi-ci/getting-started) and [its pricing](https://wokwi.com/pricing).

**Images.** Details per file: [`assets/SOURCES.md`](assets/SOURCES.md).

| File | Source | License / notes |
| :--- | :--- | :--- |
| 8 diagrams (`project-test-pyramid` … `project-state-m29`) | Original diagrams from `code/`, the documents above, and the author's simulated lab (their lab numbers: the Indonesian edition's final lab); `branch-rule-merge-box` = a **reconstruction** from GitHub's documentation, not a screenshot. | CC BY 4.0 (`.svg` in `assets/`) |
| 4 composites (`health-and-docs-version` … `version-on-a-phone-dark`) | Real headless Chrome 156 screenshots, 6 Nov 2026 05:05–05:11 WIB, from the simulated "VPS" and free-path "Pi" (Compose projects on a throw-away copy of the author's English lab, local HTTP; 375 px = Chrome's device mode, **not a phone**); the Fleet data and release 1.7.1 (compiled firmware, never run on a board) come from the English Module 28 lab. | Caddy and Swagger UI (Apache-2.0); React, Fastify, Tailwind CSS, Socket.IO, Workbox (MIT) shown as they are for educational purposes; titles, numbers, captions CC BY 4.0 |

**About the Expected output boxes.** "The author's lab" here is mostly **the English lab** of 6 November 2026 (±01:59–03:35 WIB), on the English `code/` exactly, on a **Raspberry Pi 5 16 GB with Ubuntu 26.04.1 LTS (arm64)**: Docker Engine 29.1.3, Compose 2.40.3, buildx 0.30.1, Node.js 24.21.0 and npm 11.19.0 as the laptop (the robot's containers: 24.22.1 and 11.19.1), headless Chrome 156. Story numbers (times, durations, IDs, counts) keep the values of the Indonesian edition's final lab on the same machine (4 November 2026, ±07:40–11:20 WIB) in the English lab's wording, and so do the few lines the English lab couldn't produce (a real image pull, the runner's `##[error]` line). A few boxes and numbers come from the code checks before it, on the same code (for example the scripts with a fake `docker`). "Text from the code" = not recorded; the label "research" = the candidate code of 31 October (the old `git pull` pattern).

That machine played the laptop, GitHub, GHCR, the VPS, the Pi, and the phone ([🔬](#-technical-deep-dive-optional) *How the author tested …*; in short: the status box at the start of the module). In the English lab, a simulated runner ran every `run:` step of `ci.yml` unchanged except the two of `deploy-vps` (`uses:` simulated), in `node:24.22.1-alpine3.24` containers or on the host (arm64), with the machine's own Docker as the robot's Docker; for `deploy-vps` it only evaluated the job's `if:`, and `scripts/deploy.sh` ran directly on the "VPS" as the key's `command=` runs it. GHCR = a local image registry `registry:3.1.2` without a password, so "pull without logging in" in the lab proves nothing about a public package. The "VPS" and the "Pi" = Compose projects on the same Docker, local HTTP without a domain; the robot key's restriction was tested with real SSH (OpenSSH 10.3) between throw-away Alpine containers. The alarm clock = the unit's `ExecStart` run by hand; the unit files were only checked structurally. Third-party images were loaded from the machine, not pulled. The Indonesian edition's final lab ran `ci.yml` as it is, the official actions included, on a Gitea 28.2.0 forge + Gitea Runner 5.2.4 (the label `ubuntu-24.04` = the image `gitea/runner-images:ubuntu-24.04` arm64, the robot's Docker = Docker-in-Docker), with `docker:29.9.2-dind` + sshd containers (Alpine, OpenSSH 10.3) as the "VPS" and the "Pi"s, a local `registry:3.1.2` as GHCR, named `ghcr.io` only in the lab's DNS, real SSH into the "VPS", a simulated scheduler every 60 seconds + a random ≤ 10 seconds, and `systemd-analyze verify` (systemd 259.9) for the unit files; its practice releases 2.0.3 and 2.0.5 were red in staging on purpose (no tag), and 2.0.4 changed the broker configuration.

| Lab recording | Written in the text |
| :--- | :--- |
| the lab's local bare repo, the repo owner `M29En`, the local image registry | `https://github.com/<account>/…`, `<account>`, `ghcr.io/<account>` |
| the "VPS" (in the shots `127.0.0.1:6590`), local HTTP | `203.0.113.10`, `https://iot.yourname.my.id` |
| the gateway "Pi" and the free-path "Pi" | `192.168.1.37` (`gateway.local`) |
| lab counters 65xx; the job path | the reader's counters; `/__w/mini-smart-home/mini-smart-home` |
| commit hashes, host fingerprints, tag dates | `<sha>`, `SHA256:…`, not quoted |
| Node 1 = the Module 28 simulator (`f00d00000001` "Practice living room") | your Node 1 |

Replaced only on otherwise identical lines. Times are written in WIB: the author's machine clock (WITA, WIB + 1 hour) is rewritten; the robot's logs and Vitest's `Start at` are UTC (+7 hours); `deploy.sh` stamps the time in its machine's zone (the "VPS" UTC, the "Pi" WIB). Time and size numbers = **examples** of a simulated robot on one Raspberry Pi 5, not GitHub: merge → "VPS" deployed ±5–6½ minutes and the "Pi" ±6–8 minutes in the Indonesian edition's lab, because its scheduler ran every 60 seconds, not every 15 minutes (the English edition's lab: 3–3½ minutes for the "VPS" and 3½–4 minutes for the "Pi": that lab's robot found its image builds in the build cache, and the "Pi" rounds were started by hand right after the tag). The English edition's lab used no `--privileged` container; the Indonesian edition's final lab used them, permitted for that lab only, then deleted them with every lab remnant. The machine's emulation setting (binfmt) wasn't changed; a secret scan of the recordings and images: 0. Not used: real systemd in a container, a Playwright download, a test GitHub account, and QEMU.

**Not** tested: the real GitHub (screens, branch protection, `concurrency`, `GITHUB_TOKEN`, an x64 runner and its times; the simulation is in 🔬), the real GHCR (a private → public package), an amd64 image running, a real VPS, the smoke test with an HTTPS domain, the TLS bridge 8883 (plain MQTT in the lab), a running systemd alarm clock (`list-timers`, `journalctl`), Cloudflare Tunnel, a phone, most of 🔬, 🧩 Level 3, Docker Desktop, Windows, macOS, and PowerShell.

**Not yet proven** at publication: the job `staging` on GitHub's runner (Docker 28.0.4, Compose 2.38.2: the ±1.14 GB pull, `up --wait` with one-shot services, free counters); a tag made by `GITHUB_TOKEN` not triggering a new run (documentation); the Actions permission for packages made in Module 26 and the pull message for a package that's still private; the old `Dockerfile` built for arm64 through emulation; the merge → production time on GitHub; the PWA over HTTPS on a phone; the alarm clock after a reboot. When this text was written (November 2026), `ci.yml` had never run on real GitHub.

---

[⬅️ Module 28](../module-28-ota-provisioning-fleet/README.md) · [Phase 5](../README.md) · [Syllabus](../../SYLLABUS.md) · [Progress tracker](../../PROGRESS.md) · **Next: Module 30 — Monitoring, Backup, Runbooks: Know First, Never Lose Data** (coming soon; [read the summary in the Syllabus](../../SYLLABUS.md#module-30--monitoring-backup-runbooks-know-first-never-lose-data))
