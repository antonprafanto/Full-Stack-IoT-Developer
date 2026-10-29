# Dockerfile - the backend image (mold) of Mini Smart Home 1.3.0 (Module 26). Two stages ("multi-stage"):
#   stage "packages": installs the npm libraries exactly as package-lock.json says, WITHOUT the developer tools (TypeScript, Vitest, Vite)
#   final stage     : Node.js 24 + the libraries from the "packages" stage + the src/ and migrations/ code, running as the user "node" (not root)
# No compile stage: Node 24 runs the .ts files directly (type stripping, Module 16).
# Built from the project folder with: docker compose build backend   (or: docker build -t mini-smart-home-backend:1.3.0 ./backend)

# An exact tag, not "latest" or "24-alpine": the same mold today and next month. Alpine = the smallest Node image;
# bcrypt ships a ready-made build for Alpine (musl), so no compiler is needed.
FROM node:24.22.1-alpine3.24 AS packages
WORKDIR /app
# package*.json is copied BEFORE the code: as long as the library list doesn't change, the "npm ci" layer comes from the cache
# and a rebuild after changing the code takes only a few seconds.
COPY package.json package-lock.json ./
# --omit=dev: the developer tools stay out. Since 1.3.0, pino-pretty is in "dependencies" because it's used while the server runs
# (without it the server in the container fails: unable to determine transport target for "pino-pretty"). The npm cache doesn't
# need cleaning: this stage is thrown away, only the node_modules folder is carried to the final stage.
RUN npm ci --omit=dev

FROM node:24.22.1-alpine3.24
# Links the image on GHCR to your GitHub repository (Module 26 Practice 10). Replace <account> with your GitHub account name
# (lowercase) and mini-smart-home with your repository's name if it's different. Without this label, the GHCR package isn't linked.
LABEL org.opencontainers.image.source="https://github.com/<account>/mini-smart-home"
ENV NODE_ENV=production
WORKDIR /app
COPY --from=packages /app/node_modules ./node_modules
COPY package.json ./
COPY migrations ./migrations
COPY src ./src
# The user "node" (uid 1000) already exists in the node image. The server needs no root rights: if there's a hole, the damage is smaller.
USER node
# Only a note: "this server listens on 8080 inside the container". The counter on the laptop is set by compose.cloud.yml (ports).
EXPOSE 8080
# The list (exec) form, not "npm start": Docker's stop signal (SIGTERM) goes straight to Node, so the backend stops
# gracefully. No --env-file: in a container, the settings come from Docker Compose (environment), not from .env.
CMD ["node", "src/server.ts"]
