// log.test.ts - tests of the request log filter (Module 26): successful /health knocks from the Docker healthcheck aren't logged,
// every other request is still logged. A pure function: no server, no database, no network. Run: npm test
import { describe, expect, it } from "vitest";
import { shouldLog } from "./log.ts";

describe("request log filter", () => {
  it("successful GET and HEAD /health are NOT logged (the Docker healthcheck every 15 seconds)", () => {
    expect(shouldLog("HEAD", "/health", 200)).toBe(false);
    expect(shouldLog("GET", "/health", 200)).toBe(false);
    expect(shouldLog("GET", "/health?from=uptime-kuma", 200)).toBe(false); // ?… behind it doesn't change the address
  });

  it("a FAILED /health is still logged, so the problem shows in docker compose logs", () => {
    expect(shouldLog("HEAD", "/health", 500)).toBe(true);
    expect(shouldLog("GET", "/health", 503)).toBe(true);
  });

  it("other addresses, other methods, and look-alike addresses are still logged", () => {
    expect(shouldLog("GET", "/devices", 200)).toBe(true);
    expect(shouldLog("HEAD", "/devices", 200)).toBe(true);
    expect(shouldLog("POST", "/health", 404)).toBe(true);
    expect(shouldLog("GET", "/healthz", 404)).toBe(true);
    expect(shouldLog("GET", "/health/other", 404)).toBe(true);
    expect(shouldLog("POST", "/auth/login", 401)).toBe(true);
  });
});
