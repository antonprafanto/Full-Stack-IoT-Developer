// env.test.ts - tests for the settings REPORT_SCHEDULE (Module 25), TRUST_PROXY and CORS_ORIGIN (Module 27), plus SERVER_URL (= the
// limits Node 1's firmware can store), AUTO_BROKER_ACCOUNTS, and OTA_TIMEOUT_MINUTES (Module 28) in env.ts. env.ts
// checks process.env ONCE when it is imported, so every test imports it again (vi.resetModules) with different fake .env
// contents. Run: npm test
import { afterEach, describe, expect, it, vi } from "vitest";

const VALID = { // valid required settings (nothing is really contacted)
  MQTT_URL: "mqtt://127.0.0.1:1",
  DATABASE_URL: "postgres://fake:fake@127.0.0.1:1/fake",
  JWT_SECRET: "test-secret-long-enough-for-zod-0123456789",
};

async function readWith(extra: Record<string, string>) {
  vi.resetModules();
  for (const [name, value] of Object.entries({ ...VALID, ...extra })) vi.stubEnv(name, value);
  return (await import("./env.ts")).env;
}
const readSettings = (schedule: string) => readWith({ REPORT_SCHEDULE: schedule });

// a wrong setting: the server writes the reason on screen, then stops (the fake process.exit throws an error)
async function refused(extra: Record<string, string>): Promise<unknown[][]> {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(process, "exit").mockImplementation(() => { throw new Error("process.exit"); });
  await expect(readWith(extra)).rejects.toThrow("process.exit");
  return consoleError.mock.calls;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("REPORT_SCHEDULE in .env", () => {
  it("empty = the default 0 7 * * * (every day 07:00 WIB); any other 5-field cron is taken as it is", async () => {
    expect((await readSettings("")).REPORT_SCHEDULE).toBe("0 7 * * *");
    expect((await readSettings("30 6 * * 1-5")).REPORT_SCHEDULE).toBe("30 6 * * 1-5");
  });

  it("a 6-field cron (0 7 * * * *) is refused with its reason, and the server stops", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(process, "exit").mockImplementation(() => { throw new Error("process.exit"); });
    await expect(readSettings("0 7 * * * *")).rejects.toThrow("process.exit");
    expect(consoleError).toHaveBeenCalledWith(
      "Setting REPORT_SCHEDULE in .env: must have 5 fields: minute hour day month weekday, for example 0 7 * * *");
  });
});

describe("TRUST_PROXY in .env (Module 27)", () => {
  it("empty or not written = off (false), like v1.3; false is off too", async () => {
    expect((await readWith({})).TRUST_PROXY).toBe(false);
    expect((await readWith({ TRUST_PROXY: "" })).TRUST_PROXY).toBe(false);
    expect((await readWith({ TRUST_PROXY: "false" })).TRUST_PROXY).toBe(false);
  });

  it("true = trust everyone; uniquelocal, loopback, linklocal, addresses, and CIDRs become a list (capitals and spaces tidied)",
    async () => {
      expect((await readWith({ TRUST_PROXY: "true" })).TRUST_PROXY).toBe(true);
      expect((await readWith({ TRUST_PROXY: "uniquelocal" })).TRUST_PROXY).toEqual(["uniquelocal"]);
      expect((await readWith({ TRUST_PROXY: " UniqueLocal , loopback,10.0.0.5, 172.18.0.0/16,fc00::/7" })).TRUST_PROXY)
        .toEqual(["uniquelocal", "loopback", "10.0.0.5", "172.18.0.0/16", "fc00::/7"]);
    });

  it("a number (a hop count, trustProxy: 1) is refused with its reason, also inside a list", async () => {
    const message = "Setting TRUST_PROXY in .env: a number (a hop count) isn't used by Fastify 5 (it trusts nothing at all); "
      + "behind Caddy write uniquelocal";
    expect(await refused({ TRUST_PROXY: "1" })).toContainEqual([message]);
    expect(await refused({ TRUST_PROXY: "uniquelocal,2" })).toContainEqual([message]);
  });

  it("unknown names or blocks are refused, including a mixed-in true and out-of-range CIDRs", async () => {
    for (const wrong of ["caddy", "true,uniquelocal", "10.0.0.0/33", "fc00::/129", "10.0.0/8", "172.18.0.0/16/1"]) {
      const printed = await refused({ TRUST_PROXY: wrong });
      expect(printed.flat().join("\n")).toMatch(/^Setting TRUST_PROXY in \.env: ".+" is unknown: write uniquelocal/);
      vi.restoreAllMocks();
    }
  });
});

describe("CORS_ORIGIN in .env (Module 27: a dashboard over HTTPS with a domain name)", () => {
  it("an https address with a domain name and a mixed list are taken as they are", async () => {
    expect((await readWith({ CORS_ORIGIN: "https://iot.yourname.my.id" })).CORS_ORIGIN).toEqual(["https://iot.yourname.my.id"]);
    expect((await readWith({ CORS_ORIGIN: "http://localhost, http://127.0.0.1:8081,https://iot.yourname.my.id" })).CORS_ORIGIN)
      .toEqual(["http://localhost", "http://127.0.0.1:8081", "https://iot.yourname.my.id"]);
  });

  it("a trailing slash, a path, or no http(s):// is refused (a browser's Origin will never match)", async () => {
    const printed = await refused({ CORS_ORIGIN: "https://iot.yourname.my.id/,iot.yourname.my.id,http://localhost:5173/login" });
    expect(printed.flat()).toEqual(expect.arrayContaining([
      'Setting CORS_ORIGIN in .env: "https://iot.yourname.my.id/" is not a page address: write http(s)://name[:port] without a / '
        + "at the end, for example https://iot.yourname.my.id or http://localhost",
      expect.stringContaining('"iot.yourname.my.id" is not a page address'),
      expect.stringContaining('"http://localhost:5173/login" is not a page address'),
    ]));
  });
});

describe("Module 28 settings in .env", () => {
  it("defaults: OTA off (SERVER_URL empty), broker accounts by hand (off), expiry 10 minutes, folder firmware-data", async () => {
    const env = await readWith({});
    expect(env.SERVER_URL).toBe("");
    expect(env.AUTO_BROKER_ACCOUNTS).toEqual({ kind: "off" });
    expect(env.OTA_TIMEOUT_MINUTES).toBe(10);
    expect(env.FIRMWARE_DIR).toBe("firmware-data");
  });

  it("AUTO_BROKER_ACCOUNTS: center, gateway:<name>; anything else is refused with its example", async () => {
    expect((await readWith({ AUTO_BROKER_ACCOUNTS: "center" })).AUTO_BROKER_ACCOUNTS).toEqual({ kind: "center" });
    expect((await readWith({ AUTO_BROKER_ACCOUNTS: "gateway:pi1" })).AUTO_BROKER_ACCOUNTS).toEqual({ kind: "gateway", name: "pi1" });
    const printed = await refused({ AUTO_BROKER_ACCOUNTS: "gateway:pi/1" }); // a "/" would break the control topic's name
    expect(printed.flat().join(" ")).toContain("gateway:pi1");
  });

  // SERVER_URL = the limits Node 1 1.7.0 can store (ota-check.cpp): any other address makes every update fail
  it("a SERVER_URL Node 1 can store is taken as it is: https domain name, http home IP, port 1-65535, 64 characters",
    async () => {
      for (const valid of [
        "https://iot.yourname.my.id", // VPS (the main path)
        "http://192.168.1.37", // Pi on the free path: the Pi's port 80, without :8081
        "http://192.168.1.10", // a laptop on the home Wi-Fi
        "http://10.0.0.5:8080",
        "http://172.20.0.2",
        "https://iot.yourname.my.id:8443",
        "http://192.168.1.37:1",
        "http://192.168.1.37:65535",
        "https://a-b.c-d.example",
        "https://xn--bcher-kva.example", // a domain name with non-Latin letters, written in its punycode form
        "http://127.0.0.1:6302", // lab only: the simulator on the same machine (a real ESP32 refuses 127.x)
        `https://${"a".repeat(56)}`, // exactly 64 characters
      ]) {
        expect((await readWith({ SERVER_URL: valid })).SERVER_URL).toBe(valid);
      }
    });

  it("a SERVER_URL Node 1 can't store is refused when the server starts, with its reason", async () => {
    const cases: [string, string][] = [
      [`https://${"a".repeat(57)}`, "is too long (65 characters): Node 1 can only store a server address of at most 64 characters"],
      ["https://my_host.example", "no underscore _"],
      ["https://user@iot.yourname.my.id", "no @"],
      ["https://iot yourname.my.id", "no spaces"],
      ["https://iot.yourname.my.id:0", "the port (the number after the colon) must be 1 to 65535"],
      ["https://iot.yourname.my.id:65536", "must be 1 to 65535"],
      ["https://iot.yourname.my.id:99999", "must be 1 to 65535"],
      ["http://192.168.1.37:", "must be 1 to 65535"],
      ["http://192.168.1.37:80:80", "must be 1 to 65535"],
      ["https://iot.yourname.my.id/", "without a / at the end"],
      ["https://iot.yourname.my.id/api", "without a path"],
      ["https://IoT.YourName.my.id", "all in lowercase"],
      ["HTTPS://iot.yourname.my.id", "must start with http:// or https:// (lowercase)"],
      ["iot.yourname.my.id", "must start with http:// or https://"],
      ["ftp://192.168.1.37", "must start with http:// or https://"],
      ["https://", "the server name after :// is missing"],
      ["https://:8443", "is missing"],
      ["http://iot.yourname.my.id", "http:// only for an IP address on the home network"],
      ["http://8.8.8.8", "home network"],
      ["http://192.168.1.300", "home network"],
    ];
    for (const [wrong, reason] of cases) {
      const printed = (await refused({ SERVER_URL: wrong })).flat().join("\n");
      expect(printed, wrong).toContain(`Setting SERVER_URL in .env: "${wrong}"`);
      expect(printed, wrong).toContain(reason);
      vi.restoreAllMocks();
    }
  });
});
