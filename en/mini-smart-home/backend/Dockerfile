# Dockerfile - the backend image (mold) of Mini Smart Home (Module 26; 1.4.0 Module 27; 1.5.0 Module 28: + a firmware folder;
# 2.0.0 Module 29: one mold for TWO kinds of processor, without emulation).
# Two stages ("multi-stage"):
#   stage "packages": installs the npm libraries exactly as package-lock.json says, WITHOUT the developer tools (TypeScript, Vitest, oxlint)
#   final stage     : Node.js 24 + the libraries from the "packages" stage + the src/ and migrations/ code, running as the user "node" (not root)
# No compile stage: Node 24 runs the .ts files directly (type stripping, Module 16).
# From Module 29 on, this mold is built by the ROBOT (GitHub Actions, .github/workflows/ci.yml) for linux/amd64 (VPS) and linux/arm64
# (Pi) at once, then pushed to GHCR; the VPS and the Pi only pull. Building it yourself on the laptop still works:
#   docker compose build backend   (or: docker build -t mini-smart-home-backend:<version> ./backend, version = package.json)

# An exact tag, not "latest" or "24-alpine": the same mold today and next month. Alpine = the smallest Node image;
# bcrypt ships a ready-made build for Alpine (musl), so no compiler is needed.
# Module 29: --platform=$BUILDPLATFORM = this stage ALWAYS runs on the builder's processor (the robot's amd64 runner, or your laptop),
# also when building the arm64 mold for the Pi: no QEMU emulation, so as fast as building for one processor. Safe because the
# libraries here are plain JavaScript, except bcrypt, which carries ready-made linux-x64 AND linux-arm64 (musl) builds in its
# package and picks the right one when the server runs.
FROM --platform=$BUILDPLATFORM node:24.22.1-alpine3.24 AS packages
WORKDIR /app
# package*.json is copied BEFORE the code: as long as the library list doesn't change, the "npm ci" layer comes from the cache
# and a rebuild after changing the code takes only a few seconds. (The version number is written in package*.json too, so a build
# for a new version always runs npm ci again.)
COPY package.json package-lock.json ./
# --omit=dev: the developer tools stay out. Since 1.3.0, pino-pretty is in "dependencies" because it's used while the server runs
# (without it the server in the container fails: unable to determine transport target for "pino-pretty"). The npm cache doesn't
# need cleaning: this stage is thrown away, only the node_modules folder is carried to the final stage.
RUN npm ci --omit=dev
# Module 29: the firmware folder is made HERE (the builder's processor), then copied to the final stage: no RUN at all there
RUN mkdir -p /app/firmware-data

# The final stage = the TARGET processor (amd64 or arm64). Only COPY, no RUN: no program has to be RUN for another
# processor, so no emulator is needed.
FROM node:24.22.1-alpine3.24
# Links the image on GHCR to your GitHub repository (Module 26 Practice 10). Replace <account> with your GitHub account name
# (lowercase) and mini-smart-home with your repository's name if it's different. Without this label, the GHCR package isn't linked.
# Module 29: the molds the robot builds get this label automatically (ci.yml, labels:), which overrides this line; this line
# stays useful for the molds you build and push yourself.
LABEL org.opencontainers.image.source="https://github.com/<account>/mini-smart-home"
ENV NODE_ENV=production
WORKDIR /app
COPY --from=packages /app/node_modules ./node_modules
COPY package.json ./
COPY migrations ./migrations
COPY src ./src
# Module 28: the folder of the firmware files (.bin) the admin uploads, owned by the user node. compose.cloud.yml mounts the cupboard
# firmware-data here; a cupboard that is still empty takes this folder's owner, so the backend (not root) can write to it.
# Module 29: copied from the "packages" stage with the owner node (--chown), instead of RUN mkdir && chown in this stage.
COPY --from=packages --chown=node:node /app/firmware-data /app/firmware-data
# The user "node" (uid 1000) already exists in the node image. The server needs no root rights: if there's a hole, the damage is smaller.
USER node
# Only a note: "this server listens on 8080 inside the container". The counter on the laptop is set by compose.cloud.yml (ports).
EXPOSE 8080
# The list (exec) form, not "npm start": Docker's stop signal (SIGTERM) goes straight to Node, so the backend stops
# gracefully. No --env-file: in a container, the settings come from Docker Compose (environment), not from .env.
CMD ["node", "src/server.ts"]
