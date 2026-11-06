# Mini Smart Home changelog

All notable changes to this project are written down here, the newest at the top. The format follows
[Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/), with its standard names for the types of change: Added,
Changed, Deprecated, Removed, Fixed, Security. The version numbers follow
[Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html): MAJOR.MINOR.PATCH.

- One version number for the server: the backend and the dashboard (web) always have the same number, the same as the image
  tags in `compose.cloud.yml` and the Git tag `v<version>` the robot makes. The firmware (Node 1, Node 2), `DATA-CONTRACT.md`,
  and `PIN-MAP.md` keep their own numbers.
- A pull request that changes anything deployed to the VPS/Pi (the content of the backend and web images, `compose.cloud.yml`,
  the broker configuration in `edge/`, Grafana, the `.sh` scripts) must raise the version AND write its entry here; the robot
  (`scripts/check-version.mjs`) refuses one that forgets.
- Changes that are merged but not released yet are written in the "Unreleased" section first.
- The history before 2.0.0 (backend 1.x, web 1.x) is in the README of every module.

## [Unreleased]

## [2.0.0] - 2026-11-04

Mini Smart Home v2.0: a production pipeline (Module 29). MAJOR because the way of DEPLOYING changed, not the API: the VPS and
the free-path Pi no longer build their own images but pull the images the robot builds for two kinds of processors; the Pi
updates itself with a systemd timer; the `main` branch is guarded by a branch rule.

### Added

- The checking and deploying robot (GitHub Actions, `.github/workflows/ci.yml`): every pull request to `main` is checked
  (`verify`, `test`, `build`); after a merge, the backend and web images are pushed to GHCR for amd64 and arm64, tried first in
  a throw-away staging on the robot's machine (`scripts/smoke-test.sh`), then the release is marked with the tag `v<version>` and
  the VPS is updated over SSH with a special key that can only run `scripts/deploy.sh`.
- The Pi updates itself: `scripts/systemd/smarthome-update.timer` runs `scripts/deploy.sh` every 15 minutes
  (the latest tagged release on `main` from Git, then `docker compose pull` and `up -d --no-build`).
- Backend: 20 integration tests with a TimescaleDB test database (`backend/src/integration/`, `npm run test:integration`). They
  only run on a database whose name ends in `_test`.
- Backend: `GET /health` names the `version` of the server that is running; the `/docs` documentation uses the same number (both
  read from `package.json`).
- Backend: lint with oxlint 1.89.0 (`npm run lint`), the same tool and version as the frontend. In both folders, even one
  lint warning now makes `npm run lint` fail (`--deny-warnings`), so the robot really turns red because of it.
- Dashboard: the version number (`v2.0.0`) shows on the Login screen and in the dashboard header, under the title.
- Frontend: the first Vitest tests for pure functions (WIB time, CSV, rule sentences), through `npm test`.
- This `CHANGELOG.md` and `scripts/check-version.mjs` (the robot refuses a version that isn't the same everywhere, doesn't go
  up, or has no entry here).

### Changed

- One version number for the server: backend 1.5.0 and web 1.4.0 become 2.0.0, and so do the three image tags in
  `compose.cloud.yml`.
- The backend and frontend Dockerfiles: the Node stage runs on the builder's processor (`FROM --platform=$BUILDPLATFORM`) and
  the final stage has no `RUN`, so one runner builds the amd64 and arm64 images without emulation.
- Backend: the Fastify server assembly moved to `src/app.ts` (`buildApp()`), shared by `src/server.ts` and the integration
  tests.
- The VPS and the free-path Pi pull the images the robot builds and deploy them with `docker compose up -d --no-build`, no
  longer building them.
