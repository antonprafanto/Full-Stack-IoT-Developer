# Dockerfile - the web image (mold) of Mini Smart Home (Module 26; a PWA since Module 27, the Fleet screen since Module 28, the
# version number on screen and two-processor images since Module 29, version 2.0.0). Two stages ("multi-stage"):
#   stage "build": Node.js turns the React + TypeScript code into ready-to-serve files (npm run build -> the dist/ folder,
#                  including manifest.webmanifest and the service worker sw.js since Module 27)
#   final stage  : only Caddy + the files of dist/. Node.js, node_modules, and the source code stay behind in the build stage.
# Module 29: the image the VPS and the Pi use is built by the ROBOT (GitHub Actions, .github/workflows/ci.yml) for two kinds of
# processor at once, linux/amd64 (VPS, most laptops) and linux/arm64 (Raspberry Pi, Apple silicon Macs), then pushed to GHCR;
# the VPS and the Pi only pull it. On the laptop you can still build it yourself from the project folder: docker compose build web
# (or from this folder only, without the backend folder: docker build -t mini-smart-home-web:<version> . , version = package.json)

# An exact tag (the same as the backend image), not "latest": the same mold today and next month.
# Module 29: --platform=$BUILDPLATFORM = this stage always runs on the processor of the BUILDING MACHINE (the GitHub robot: amd64),
# also when building the arm64 image. Its result (dist/: HTML, CSS, JavaScript) is the same for every processor, so no other
# processor needs emulating (QEMU, slow). Only the final stage (Caddy) is taken for the target processor.
FROM --platform=$BUILDPLATFORM node:24.22.1-alpine3.24 AS build
WORKDIR /app
# package*.json is copied BEFORE the code: as long as the library list doesn't change, the "npm ci" layer comes from the cache
# and a rebuild after changing the code is much faster. (The version number is written in package*.json too, so a build for a
# new version always runs npm ci again.) Every library goes in (the TypeScript and Vite developer tools too), because this
# stage really builds; none of them goes into the final image.
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# The API address is BUILT INTO the JavaScript at build time: Vite replaces import.meta.env.VITE_API_BASE with this text. "/api" =
# a path on the same page's address, forwarded by Caddy to the backend (caddy/Caddyfile). Changing it = rebuilding the image.
# It holds an address, NOT a secret: every VITE_... value is sent to anyone's browser.
ARG VITE_API_BASE=/api
RUN npm run build

# Final stage: Caddy (no Node.js). An exact tag.
FROM caddy:2.11.7-alpine
# Links the image on GHCR to your GitHub repository (Module 26 Practice 10). Replace <account> with your GitHub account name
# (lowercase) and mini-smart-home with your repository's name if it's different. Module 29: an image made by the robot gets its
# source label from the robot itself (labels: in ci.yml, overriding this line), so this line only affects the images you build
# yourself. The description replaces the Caddy image's own description in a one-processor image you push yourself. A
# two-processor image made by the robot is an index: according to GHCR's documentation, its package page takes the description
# from the index's annotations, not from this LABEL.
LABEL org.opencontainers.image.source="https://github.com/<account>/mini-smart-home" \
      org.opencontainers.image.description="Mini Smart Home dashboard (React) served by Caddy"
# The Caddyfile is built into the image, so that this image can be tried on its own (docker run). Docker Compose mounts the
# caddy/ folder of the repo over it.
COPY caddy/Caddyfile /etc/caddy/Caddyfile
# Only the build result is carried over from the build stage: the HTML, CSS, JavaScript, icon, manifest, and sw.js files (about 1 MB).
COPY --from=build /app/dist /srv
# No CMD and EXPOSE: the Caddy image already brings them ("caddy run --config /etc/caddy/Caddyfile --adapter caddyfile",
# port 80 inside the running image). The counter on the laptop is set by compose.cloud.yml (ports).
