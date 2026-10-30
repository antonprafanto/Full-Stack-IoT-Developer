# Dockerfile - the web image (mold) of Mini Smart Home 1.3.0 (Module 26, a PWA since Module 27). Two stages ("multi-stage"):
#   stage "build": Node.js turns the React + TypeScript code into ready-to-serve files (npm run build -> the dist/ folder,
#                  including manifest.webmanifest and the service worker sw.js since Module 27)
#   final stage  : only Caddy + the files of dist/. Node.js, node_modules, and the source code stay behind in the build stage.
# Built from the project folder with: docker compose build web   (or from this folder only, without the backend folder:
# docker build -t mini-smart-home-web:1.3.0 .)

# An exact tag (the same as the backend image), not "latest": the same mold today and next month.
FROM node:24.22.1-alpine3.24 AS build
WORKDIR /app
# package*.json is copied BEFORE the code: as long as the library list doesn't change, the "npm ci" layer comes from the cache
# and a rebuild after changing the code is much faster. Every library goes in (the TypeScript and Vite developer tools too),
# because this stage really builds; none of them goes into the final image.
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
# (lowercase) and mini-smart-home with your repository's name if it's different. The description replaces the Caddy
# image's own description, so that your package page on GHCR doesn't say it only holds "the Caddy web server".
LABEL org.opencontainers.image.source="https://github.com/<account>/mini-smart-home" \
      org.opencontainers.image.description="Mini Smart Home dashboard (React) served by Caddy"
# The Caddyfile is built into the image, so that this image can be tried on its own (docker run). Docker Compose mounts the
# caddy/ folder of the repo over it.
COPY caddy/Caddyfile /etc/caddy/Caddyfile
# Only the build result is carried over from the build stage: the HTML, CSS, JavaScript, icon, manifest, and sw.js files (about 1 MB).
COPY --from=build /app/dist /srv
# No CMD and EXPOSE: the Caddy image already brings them ("caddy run --config /etc/caddy/Caddyfile --adapter caddyfile",
# port 80 inside the running image). The counter on the laptop is set by compose.cloud.yml (ports).
