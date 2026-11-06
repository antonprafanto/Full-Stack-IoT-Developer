// firmware.test.ts - tests of the firmware release routes and the locked download (Module 28) WITHOUT a database: the firmware and
// devices tables are replaced by mocks (vi.mock), FAKE .bin files are written to a temporary folder (FIRMWARE_DIR). The REAL guard
// (security.ts: the login guard, the roles, OPEN_ROUTES) is mounted too, so also tested: an upload without a login 401, a viewer 403,
// and a device download that needs NO login but needs the device key. The download requests imitate Arduino-ESP32 3.3.12's HTTPUpdate
// (Basic Auth device_id:key, x-ESP32-STA-MAC in capitals, x-ESP32-version). Run: npm test
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";

const temp = await vi.hoisted(async () => {
  const { mkdtempSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const folder = mkdtempSync(join(tmpdir(), "msh-firmware-test-"));
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://fake:fake@127.0.0.1:1/fake";
  process.env.JWT_SECRET = "test-secret-long-enough-for-zod-0123456789";
  process.env.FIRMWARE_DIR = folder;
  process.env.SERVER_URL = "https://iot.yourname.my.id";
  return folder;
});

const table = vi.hoisted(() => ({
  releases: new Map<string, Record<string, unknown>>(),
  fingerprints: new Map<string, string>(), // device_id -> the key's SHA-256 (an active registered device)
  downloads: [] as string[],
}));
vi.mock("../db/fleet.ts", () => ({
  saveRelease: async (r: Record<string, unknown>) => {
    if (table.releases.has(r.version as string)) return undefined;
    const row = { ...r, created_at: new Date("2026-10-31T01:00:00Z"), withdrawn_at: null };
    table.releases.set(r.version as string, row);
    return row;
  },
  getRelease: async (_k: string, version: string) => table.releases.get(version),
  allReleases: async () => [...table.releases.values()].map((r) => ({ ...r, canary_succeeded: r.version === "1.7.1" ? 1 : 0, canary_failed: 0 })),
  withdrawRelease: async (_k: string, version: string) => {
    const r = table.releases.get(version);
    if (r === undefined || r.withdrawn_at !== null) return undefined;
    r.withdrawn_at = new Date();
    return r;
  },
}));
vi.mock("../db/devices.ts", () => ({ getKeyFingerprint: async (id: string) => table.fingerprints.get(id) }));
vi.mock("../services/ota.ts", () => ({ FOLDER: { node1: "node-1" }, recordDownloadStart: (id: string, v: string) => { table.downloads.push(`${id} ${v}`); } }));
vi.mock("../services/realtime.ts", () => ({ disconnectSession: () => {} }));

import Fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { setupSecurity } from "../auth/security.ts";
import { hashKey } from "../auth/key.ts";
import { firmwareRoutes } from "./firmware.ts";

const app = Fastify();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
await setupSecurity(app);
await app.register(firmwareRoutes);
await app.ready();
afterAll(async () => {
  await app.close();
  await rm(temp, { recursive: true, force: true });
});

const cookie = (role: "admin" | "viewer") => `access=${app.jwt.sign({ sub: role === "admin" ? "1" : "2", role, sid: 1 })}`;
// a FAKE .bin file: the first byte 0xE9 like an ESP32 app image, then a marker text and patterned content (NOT firmware)
function fakeBin(size: number, fill = 1): Buffer {
  const b = Buffer.alloc(size, fill);
  b[0] = 0xe9;
  b.write("NOT REAL FIRMWARE - Vitest test Module 28", 16, "latin1");
  return b;
}
const upload = (version: string, body: Buffer, role: "admin" | "viewer" | null = "admin", query = "") => app.inject({
  method: "POST", url: `/firmware/node1/${version}${query}`, payload: body,
  headers: { "content-type": "application/octet-stream", ...(role === null ? {} : { cookie: cookie(role) }) },
});
const KEY = "K".repeat(43);
const ID = "a4cf12e5b7c0";
const basic = (id: string, key: string) => `Basic ${Buffer.from(`${id}:${key}`).toString("base64")}`;
const download = (version: string, headers: Record<string, string> = {}, method: "GET" | "HEAD" = "GET") => app.inject({
  method, url: `/fw/node-1/${version}.bin`,
  headers: { "user-agent": "ESP32-http-Update", authorization: basic(ID, KEY), "x-esp32-sta-mac": "A4:CF:12:E5:B7:C0",
    "x-esp32-version": "1.7.0", ...headers },
});

beforeEach(() => {
  table.fingerprints.set(ID, hashKey(KEY));
});

describe("firmware upload (admin)", () => {
  const file = fakeBin(1_196_032);

  it("without a login 401, a viewer account 403 (the Module 20 guard applies to new routes too)", async () => {
    expect((await upload("1.7.1", file, null)).statusCode).toBe(401);
    expect((await upload("1.7.1", file, "viewer")).statusCode).toBe(403);
  });

  it("admin: 201, the SHA-256 computed by the server (the same as the file's sha256sum), the file saved in the cupboard", async () => {
    const answer = await upload("1.7.1", file, "admin", "?notes=new%20greeting");
    expect(answer.statusCode).toBe(201);
    expect(answer.json()).toMatchObject({ version: "1.7.1", size: 1_196_032, test: false, notes: "new greeting",
      sha256: createHash("sha256").update(file).digest("hex"), url: "https://iot.yourname.my.id/fw/node-1/1.7.1.bin" });
    expect((await stat(join(temp, "node-1", "1.7.1.bin"))).size).toBe(1_196_032);
  });

  it("not an ESP32 image (the first byte isn't 0xE9, for example a .merged.bin that starts with 0xFF): 400", async () => {
    const merged = fakeBin(4096);
    merged[0] = 0xff;
    const answer = await upload("1.7.9", merged);
    expect(answer.statusCode).toBe(400);
    expect(answer.json().message).toContain("0xE9");
  });

  it("bigger than one shelf (1,966,080 bytes) 400; bigger than 2 MiB refused by Fastify with 413", async () => {
    expect((await upload("1.7.9", fakeBin(1_966_081))).statusCode).toBe(400);
    expect((await upload("1.7.9", fakeBin(2 * 1024 * 1024 + 1))).statusCode).toBe(413);
  });

  it("an invalid version/kind/test in the address: a 400 validation error (not 500 FST_ERR_FAILED_ERROR_SERIALIZATION)", async () => {
    for (const version of ["1.7", "v1.7.9", "1.7.9-test", "1.07.9", "01.7.9"]) {
      const answer = await upload(version, file);
      expect(answer.statusCode, version).toBe(400);
      expect(answer.json(), version).toMatchObject({ code: "FST_ERR_VALIDATION" });
    }
    const node2 = await app.inject({ method: "POST", url: "/firmware/node2/1.7.9", payload: file,
      headers: { "content-type": "application/octet-stream", cookie: cookie("admin") } });
    expect(node2.statusCode).toBe(400);
    expect((await upload("1.7.9", file, "admin", "?test=yes")).statusCode).toBe(400);
  });

  it("two uploads of the SAME version with DIFFERENT content at the same time: one 201, one 409, the file in the cupboard = the release's sha256", async () => {
    for (let i = 0; i < 5; i++) {
      const version = `1.8.${i}`;
      const [a, b] = [fakeBin(1_196_032, 10 + i), fakeBin(1_197_056, 20 + i)];
      const codes = (await Promise.all([upload(version, a), upload(version, b)])).map((j) => j.statusCode).sort();
      expect(codes, version).toEqual([201, 409]);
      const { readFile } = await import("node:fs/promises");
      const inCupboard = createHash("sha256").update(await readFile(join(temp, "node-1", `${version}.bin`))).digest("hex");
      expect(inCupboard, version).toBe(table.releases.get(version)?.sha256);
      table.releases.delete(version); // this test release must not change "latest" in the next tests
      await rm(join(temp, "node-1", `${version}.bin`));
    }
    const { readdir } = await import("node:fs/promises");
    expect((await readdir(join(temp, "node-1"))).filter((n) => n.endsWith(".tmp"))).toEqual([]); // nothing left behind
  });

  it("the same version can't be overwritten (409); a file gone from the cupboard can be restored with the SAME content (200)", async () => {
    expect((await upload("1.7.1", fakeBin(1_196_032, 2))).statusCode).toBe(409); // other content, the same version
    await rm(join(temp, "node-1", "1.7.1.bin"));
    expect((await upload("1.7.1", fakeBin(1_196_032, 2))).statusCode).toBe(409); // other content: still refused
    expect((await upload("1.7.1", file)).statusCode).toBe(200); // the same content: restored
  });

  it("a test release is marked; GET /firmware: latest = the highest that isn't a test and isn't withdrawn", async () => {
    expect((await upload("1.7.2", fakeBin(1_196_032, 3), "admin", "?test=true")).json().test).toBe(true);
    const list = (await app.inject({ method: "GET", url: "/firmware", headers: { cookie: cookie("viewer") } })).json();
    expect(list.latest).toEqual({ node1: "1.7.1" });
    expect(list.releases.find((r: { version: string }) => r.version === "1.7.1")).toMatchObject({ can_update_all: true });
    expect(list.releases.find((r: { version: string }) => r.version === "1.7.2")).toMatchObject({ can_update_all: false,
      update_all_reason: "test release: per device only" });
  });
});

describe("firmware download by a device (/fw/node-1/<version>.bin)", () => {
  it("WITHOUT a login cookie but with the device key: 200, Content-Length, octet-stream, x-SHA256, the whole content", async () => {
    table.downloads.length = 0;
    const answer = await download("1.7.1");
    expect(answer.statusCode).toBe(200);
    expect(answer.headers["content-length"]).toBe("1196032");
    expect(answer.headers["content-type"]).toBe("application/octet-stream");
    expect(answer.headers["content-encoding"]).toBeUndefined();
    expect(answer.rawPayload[0]).toBe(0xe9);
    expect(createHash("sha256").update(answer.rawPayload).digest("hex")).toBe(answer.headers["x-sha256"]);
    expect(table.downloads).toEqual([`${ID} 1.7.1`]); // the update status "downloading"
  });

  it("HEAD: the same headers without content", async () => {
    const answer = await download("1.7.1", {}, "HEAD");
    expect(answer.statusCode).toBe(200);
    expect(answer.headers["content-length"]).toBe("1196032");
    expect(answer.rawPayload.length).toBe(0);
  });

  it("no Basic Auth, a wrong key, a deactivated device: 403 (HTTPUpdate: error -103)", async () => {
    const without = await app.inject({ method: "GET", url: "/fw/node-1/1.7.1.bin", headers: { "x-esp32-sta-mac": "A4:CF:12:E5:B7:C0" } });
    expect(without.statusCode).toBe(403);
    expect((await download("1.7.1", { authorization: basic(ID, "wrong".padEnd(43, "x")) })).statusCode).toBe(403);
    table.fingerprints.delete(ID); // revoked: getKeyFingerprint finds no active key
    expect((await download("1.7.1")).statusCode).toBe(403);
  });

  it("x-ESP32-STA-MAC missing or belonging to another device: 403", async () => {
    expect((await download("1.7.1", { "x-esp32-sta-mac": "" })).statusCode).toBe(403);
    expect((await download("1.7.1", { "x-esp32-sta-mac": "24:6F:28:B1:C7:D4" })).statusCode).toBe(403);
  });

  it("the running version = the requested version: 304 without content (HTTPUpdate: no update)", async () => {
    const answer = await download("1.7.1", { "x-esp32-version": "1.7.1" });
    expect(answer.statusCode).toBe(304);
    expect(answer.rawPayload.length).toBe(0);
  });

  it("a version that doesn't exist, another folder, a withdrawn release: an honest 404 (not a 200 HTML page)", async () => {
    expect((await download("9.9.9")).statusCode).toBe(404);
    expect((await app.inject({ method: "GET", url: "/fw/node-2/1.0.0.bin" })).statusCode).toBe(404);
    expect((await app.inject({ method: "POST", url: "/firmware/node1/1.7.1/withdraw", headers: { cookie: cookie("admin") } }))
      .statusCode).toBe(200);
    expect((await download("1.7.1")).statusCode).toBe(404);
  });
});
