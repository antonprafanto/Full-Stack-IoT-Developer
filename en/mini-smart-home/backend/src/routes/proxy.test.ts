// proxy.test.ts - tests for TRUST_PROXY (Module 27): the backend behind Caddy HTTPS. The REAL login route (auth.ts) and the
// REAL protection (security.ts: cookies, login limiter, guard) without a database: users.ts, password.ts, and realtime.ts are
// replaced by fakes (vi.mock), the Fastify server runs without a network (app.inject). "Caddy" = requests from the Docker
// hallway address 172.19.0.4 that carry X-Forwarded-For (the visitor's address) and X-Forwarded-Proto: https, as the real
// Caddy adds them (the Module 27 lab). Run: npm test
import { afterAll, describe, expect, it, vi } from "vitest";

vi.hoisted(() => { // env.ts checks .env when imported: give it valid fake settings (nothing is really contacted)
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://fake:fake@127.0.0.1:1/fake";
  process.env.JWT_SECRET = "test-secret-long-enough-for-zod-0123456789";
  process.env.CORS_ORIGIN = "https://iot.yourname.my.id"; // the dashboard on the internet (Module 27)
  process.env.TRUST_PROXY = "uniquelocal"; // the compose.cloud.yml default
});

// one fake account; only one "right" password (no bcrypt: the tests stay fast)
vi.mock("../db/users.ts", () => ({
  findForLogin: async (email: string) => (email === "budi@home.test"
    ? { id: 1, email, name: "Budi", role: "admin", password_hash: "fake-fingerprint" } : undefined),
  createSession: async () => 7,
  getUser: async () => undefined,
  rotateSession: async () => undefined,
  findSessionByOldToken: async () => undefined,
  deleteSession: async () => {},
  deleteSessionByToken: async () => undefined,
}));
vi.mock("../auth/password.ts", () => ({
  matchPassword: async (password: string, fingerprint: string | null | undefined) => fingerprint === "fake-fingerprint" && password === "right-password",
}));
vi.mock("../services/realtime.ts", () => ({ disconnectSession: () => {} }));

import Fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { env } from "../config/env.ts";
import { setupSecurity } from "../auth/security.ts";
import { authRoutes } from "./auth.ts";

// a server like server.ts: with trustProxy from TRUST_PROXY (v1.4), or without trustProxy at all (v1.3)
async function makeServer(trustProxy: typeof env.TRUST_PROXY) {
  const app = Fastify({ trustProxy });
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  await setupSecurity(app);
  await app.register(authRoutes);
  await app.ready();
  return app;
}
const v14 = await makeServer(env.TRUST_PROXY);
const v13 = await makeServer(false);
afterAll(async () => { await v14.close(); await v13.close(); });

const CADDY = "172.19.0.4"; // the address of the web container (Caddy) in the Docker hallway: a private address = uniquelocal
// a login through "Caddy": a visitor at the internet address visitorIp, an HTTPS page from the dashboard's domain
const throughCaddy = (app: typeof v14, visitorIp: string, password: string, proto = "https") => app.inject({
  method: "POST", url: "/auth/login", remoteAddress: CADDY,
  headers: { "x-forwarded-for": visitorIp, "x-forwarded-proto": proto, origin: "https://iot.yourname.my.id" },
  payload: { email: "budi@home.test", password },
});
const cookie = (answer: Awaited<ReturnType<typeof throughCaddy>>, name: string) =>
  ([] as string[]).concat(answer.headers["set-cookie"] ?? []).find((line) => line.startsWith(`${name}=`)) ?? "";

describe("TRUST_PROXY=uniquelocal (backend 1.4.0 behind Caddy)", () => {
  it("the setting is read as the list [uniquelocal]", () => {
    expect(env.TRUST_PROXY).toEqual(["uniquelocal"]);
  });

  it("HTTPS page: both login cookies (access and session) are Secure", async () => {
    const answer = await throughCaddy(v14, "203.0.113.10", "right-password");
    expect(answer.statusCode).toBe(200);
    expect(cookie(answer, "access")).toMatch(/; HttpOnly; Secure; SameSite=Strict$/);
    expect(cookie(answer, "session")).toMatch(/; Path=\/auth; HttpOnly; Secure; SameSite=Strict$/);
  });

  it("HTTP page (home mode http://localhost): cookies without Secure, so logging in still works", async () => {
    const answer = await throughCaddy(v14, "192.168.1.20", "right-password", "http");
    expect(answer.statusCode).toBe(200);
    expect(cookie(answer, "access")).not.toContain("Secure");
  });

  it("a visitor who comes DIRECTLY (not through a private proxy) can't pretend to use HTTPS with a fake header", async () => {
    const answer = await v14.inject({
      method: "POST", url: "/auth/login", remoteAddress: "203.0.113.66",
      headers: { "x-forwarded-for": "198.51.100.1", "x-forwarded-proto": "https" },
      payload: { email: "budi@home.test", password: "right-password" },
    });
    expect(answer.statusCode).toBe(200);
    expect(cookie(answer, "access")).not.toContain("Secure");
  });

  it("10 wrong logins from visitor A: A's 11th attempt gets 429, visitor B (another address) can still log in", async () => {
    for (let i = 0; i < 10; i++) expect((await throughCaddy(v14, "203.0.113.21", "wrong")).statusCode).toBe(401);
    const a = await throughCaddy(v14, "203.0.113.21", "wrong");
    expect(a.statusCode).toBe(429);
    expect(a.json().message).toMatch(/^too many attempts: try again in \d+ seconds$/);
    expect((await throughCaddy(v14, "203.0.113.22", "right-password")).statusCode).toBe(200);
  });
});

describe("without trustProxy (the backend 1.3.0 behavior behind Caddy, the reason for Module 27)", () => {
  it("HTTPS page but cookies WITHOUT Secure: the backend only sees an HTTP connection from Caddy", async () => {
    const answer = await throughCaddy(v13, "203.0.113.10", "right-password");
    expect(answer.statusCode).toBe(200);
    expect(cookie(answer, "access")).not.toContain("Secure");
  });

  it("every visitor counts as one address (Caddy): after 10 wrong logins by visitor A, visitor B gets 429 too", async () => {
    const fresh = await makeServer(false); // the login limiter counts from zero
    for (let i = 0; i < 10; i++) expect((await throughCaddy(fresh, "203.0.113.31", "wrong")).statusCode).toBe(401);
    expect((await throughCaddy(fresh, "203.0.113.31", "wrong")).statusCode).toBe(429);
    expect((await throughCaddy(fresh, "203.0.113.32", "right-password")).statusCode).toBe(429);
    await fresh.close();
  });
});
