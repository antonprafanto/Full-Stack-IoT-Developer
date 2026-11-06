// server-version.ts - the version of the Mini Smart Home server that is RUNNING, read from package.json (Module 29).
// Since 2.0.0 the project uses ONE version number for the backend and the dashboard (the same as the image tag and the Git
// tag v2.0.0). That number is written once in package.json, raised through a pull request (the robot checks it with
// scripts/check-version.mjs), then read here when the server starts. Used in two places: GET /health (the version field:
// anyone can check the version deployed in production without SSH) and the API documentation /docs (OpenAPI info.version).
// No version is written by hand in the code any more, so nothing can be forgotten.
// In the Docker image, package.json is copied to /app too (Dockerfile), so the path ../../package.json is the same on the
// laptop and in the container. Not services/version.ts: that file compares the devices' FIRMWARE versions (Module 28).
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as { version: string };

export const SERVER_VERSION: string = pkg.version; // for example "2.0.0"
