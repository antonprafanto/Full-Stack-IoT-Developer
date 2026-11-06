// env.ts - the server settings from .env (read by Node.js through --env-file), checked once by a Zod schema at startup.
// Module 20: .env now also holds a secret (JWT_SECRET), so it is checked as strictly as the messages from devices.
// Module 27: + TRUST_PROXY (the backend behind Caddy HTTPS) and a check of the address form in CORS_ORIGIN.
// Module 28: + FIRMWARE_DIR, SERVER_URL, AUTO_BROKER_ACCOUNTS, OTA_TIMEOUT_MINUTES (firmware updates and claim codes).
import { isIP } from "node:net";
import { z } from "zod";
import cron from "node-cron";

z.config(z.locales.en()); // Zod error messages in English (this file is read first, before contract.ts)

const empty = (value: unknown) => (value === "" ? undefined : value); // an empty line "NAME=" = not filled in
const required = z.preprocess(empty, z.string({ error: "not filled in" }));

// Module 27: the address group names Fastify knows for TRUST_PROXY. uniquelocal = the private addresses 10.x, 172.16-31.x,
// 192.168.x, and fc00::/7, including the Docker hallway where Caddy lives; loopback = 127.0.0.1 and ::1 (this machine itself).
const PROXY_GROUPS = ["loopback", "linklocal", "uniquelocal"];
// one IP address (10.0.0.5) or one CIDR address block (172.16.0.0/12, fc00::/7)
function addressOrBlock(text: string): boolean {
  const [address, prefix, ...rest] = text.split("/");
  const version = isIP(address);
  if (version === 0 || rest.length > 0) return false;
  return prefix === undefined || (/^\d{1,3}$/.test(prefix) && Number(prefix) <= (version === 4 ? 32 : 128));
}

// Module 28: is this IPv4 address a home network address (10.x, 172.16-31.x, 192.168.x) or this machine itself (127.x)?
// Read exactly like Node 1's firmware does (ota-check.cpp, isHomeIpAddress): exactly four numbers 0-255 separated by dots.
function isHomeIp(address: string): boolean {
  const numbers = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(address)?.slice(1).map(Number);
  if (numbers === undefined || numbers.some((n) => n > 255)) return false;
  const [a, b] = numbers;
  return a === 10 || a === 127 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

// Module 28: SERVER_URL must be an address that Node 1 1.7.0 CAN STORE as it is. A device only downloads firmware
// from <stored server address>/fw/node-1/<version>.bin (another url is answered "url is not this home's server"), so an address
// that can't be typed in the portal makes EVERY update fail. The rules are exactly those of the firmware (ota-check.cpp:
// tidyAddress() then checkServerAddress()) and of the simulator (tools/device-simulator.js: serverAddressError()):
//   - at most 64 characters (the "Server address" field of Node 1's Wi-Fi portal)
//   - starts with http:// or https://, then the server name: lowercase a-z, digits, dots, and - only (no
//     underscore _, no @, no spaces); a port may be written, 1-65535 (for example :8443)
//   - no / at the end and no path (/api): the portal drops a trailing /, so an address with a / would never match
//   - all in lowercase: the portal stores it in lowercase
//   - http:// only to an IP address on the home network (10.x, 172.16-31.x, 192.168.x), because the device key is sent along
// One deliberate difference: 127.x is accepted here and in the simulator (lab: the simulator runs on the same machine as the
// server), while the ESP32 refuses it (to a board, 127.x is the board itself, not the server).
// Answers null if it is valid, or the sentence with the reason.
const SERVER_ADDRESS_MAX_LENGTH = 64; // = SERVER_ADDRESS_MAX_LENGTH in the firmware's ota-check.h
function serverAddressError(text: string): string | null {
  const example = "for example https://iot.yourname.my.id or http://192.168.1.37";
  if (text.length > SERVER_ADDRESS_MAX_LENGTH) {
    return `"${text}" is too long (${text.length} characters): Node 1 can only store a server address of at most `
      + `${SERVER_ADDRESS_MAX_LENGTH} characters. Use a shorter domain name`;
  }
  const parts = /^(https?):\/\/(.*)$/.exec(text);
  if (parts === null) return `"${text}" must start with http:// or https:// (lowercase), ${example}`;
  const [, scheme, hostPort] = parts;
  if (hostPort.includes("/")) return `"${text}": write it without a / at the end and without a path after the server name, ${example}`;
  if (/[A-Z]/.test(hostPort)) {
    return `"${text}": write it all in lowercase (Node 1's portal stores it in lowercase, so the address wouldn't `
      + "match)";
  }
  const [host, port, ...rest] = hostPort.split(":");
  if (host === "") return `"${text}": the server name after :// is missing, ${example}`;
  if (!/^[a-z0-9.-]+$/.test(host)) {
    return `"${text}": the server name may only contain lowercase a-z, digits, dots, and - (no underscore _, `
      + `no @, no spaces), ${example}`;
  }
  if (port !== undefined && (rest.length > 0 || !/^\d{1,5}$/.test(port) || Number(port) < 1 || Number(port) > 65535)) {
    return `"${text}": the port (the number after the colon) must be 1 to 65535, for example https://iot.yourname.my.id:8443`;
  }
  if (scheme === "http" && !isHomeIp(host)) {
    return `"${text}": http:// only for an IP address on the home network (10.x, 172.16-31.x, 192.168.x), because the device key `
      + "is sent along unencrypted. On the internet write https://your-domain-name";
  }
  return null;
}

// Module 28: who creates and deletes the device broker accounts (a key per device, Module 21)?
export type BrokerAccountMode =
  | { kind: "off" } // like Module 21: the admin runs mosquitto_passwd themselves
  | { kind: "center" } // the backend through the dynamic security plugin of the CENTRAL broker (devices connect straight to the center)
  | { kind: "gateway"; name: string }; // the backend through the bridge to the Pi GATEWAY broker of that name (for example pi1)

const Settings = z.object({
  // the broker's address, for example mqtt://192.168.1.37:1883. Module 21: WITHOUT a username and password inside it (this
  // address is written to the log when connecting); its account is in the next two settings
  MQTT_URL: required.pipe(z.string()
    .regex(/^mqtts?:\/\//, "must start with mqtt:// (or mqtts:// from Module 27 on), for example mqtt://192.168.1.37:1883")
    .refine((url) => !url.includes("@"), "don't put a username or password in MQTT_URL; use MQTT_USERNAME and MQTT_PASSWORD")),
  // Module 21: the backend's own broker account (made with mosquitto_passwd). Both empty = connect without an account (only
  // works on a broker that is still open); if one is filled in, the other is required.
  MQTT_USERNAME: z.string().default(""),
  MQTT_PASSWORD: z.string().default(""),
  DATABASE_URL: required, // the database's address, for example postgres://postgres:<password>@127.0.0.1:5432/smarthome
  PORT: z.preprocess(empty, z.coerce.number().int().min(1).max(65535).default(8080)), // the server's counter (port) number
  HOST: z.preprocess(empty, z.string().default("127.0.0.1")), // 127.0.0.1 = only reachable from this laptop
  // Module 19: Telegram is optional. Empty = Telegram notifications off.
  TELEGRAM_BOT_TOKEN: z.string().default(""), // the token from @BotFather: a secret, like a password
  TELEGRAM_CHAT_ID: z.string().default(""), // the owner's chat_id (the answer to /start)
  TELEGRAM_API_ROOT: z.string().default(""), // empty = the real Telegram server (lab: a mock Bot API server)
  // Module 25: when the daily CSV report is sent to Telegram, a 5-field cron (minute hour day month weekday) in WIB.
  // The default "0 7 * * *" = every day at 07:00 WIB. A 6-field cron ("0 7 * * * *") is also valid for node-cron, but it
  // means something else (second 0, minute 7, EVERY hour), so it is refused here.
  REPORT_SCHEDULE: z.preprocess(empty, z.string().default("0 7 * * *")
    .refine((text) => text.trim().split(/\s+/).length === 5, "must have 5 fields: minute hour day month weekday, for example 0 7 * * *")
    .refine((text) => cron.validate(text), "not a valid cron expression, for example 0 7 * * * (every day at 07:00 WIB)")),
  // Module 20: the key that signs the JWTs. Anyone who knows this key can make fake "wristbands".
  JWT_SECRET: z.preprocess(empty, z.string({ error: "not filled in" })
    .min(32, "too short (at least 32 characters); make a new one with the command in .env.example")
    .refine((s) => !s.startsWith("change"), "still holds the example from .env.example; make a new secret")),
  // Module 20: web page addresses (origins) that may call this API from a browser, comma-separated. Module 22: Vite, 5173.
  // Module 27: on the internet, the dashboard's HTTPS address with a domain name, for example https://iot.yourname.my.id. A
  // browser sends Origin without a slash at the end and without a path, so "https://iot.yourname.my.id/" will never match
  // (every login from a browser refused with 403): that form is refused here, when the server starts.
  CORS_ORIGIN: z.preprocess(empty, z.string().default("http://localhost:5173,http://127.0.0.1:5173")
    .transform((text) => text.split(",").map((origin) => origin.trim()).filter((origin) => origin !== ""))
    .superRefine((list, ctx) => {
      for (const origin of list.filter((o) => !/^https?:\/\/[^/\s]+$/.test(o))) {
        ctx.addIssue({ code: "custom", message: `"${origin}" is not a page address: write http(s)://name[:port] without a / at `
          + "the end, for example https://iot.yourname.my.id or http://localhost" });
      }
    })),
  // Module 27: who may tell the backend the visitor's REAL IP address and protocol (http/https), through the headers
  // X-Forwarded-For and X-Forwarded-Proto. Behind Caddy, the backend only sees Caddy: without this setting the login cookies
  // don't get the Secure attribute even on an HTTPS page, and every visitor counts as one address (the 429 login limit shared).
  //   empty (default) = trust nobody: dev mode (npm run dev) without Caddy
  //   uniquelocal     = trust a proxy at a private address (the Docker hallway, where Caddy is): the compose.cloud.yml choice
  //   true            = trust ANYONE (also a visitor who fakes the header): avoid it
  //   address/CIDR    = for example 172.18.0.0/16, several allowed, comma-separated (also loopback, linklocal)
  // A number (a hop count, the old recipe trustProxy: 1) is refused: Fastify 5 deliberately doesn't trust it at all, so
  // that setting silently does nothing.
  TRUST_PROXY: z.string().default("")
    .transform((text) => text.split(",").map((entry) => entry.trim().toLowerCase()).filter((entry) => entry !== ""))
    .superRefine((list, ctx) => {
      if (list.some((entry) => /^\d+$/.test(entry))) {
        ctx.addIssue({ code: "custom", message: "a number (a hop count) isn't used by Fastify 5 (it trusts nothing at all); "
          + "behind Caddy write uniquelocal" });
      } else if (list.join() !== "true" && list.join() !== "false") { // true/false may only stand alone
        const wrong = list.filter((entry) => !PROXY_GROUPS.includes(entry) && !addressOrBlock(entry));
        if (wrong.length > 0) {
          ctx.addIssue({ code: "custom", message: `"${wrong.join(",")}" is unknown: write uniquelocal, true, loopback, `
            + "linklocal, or an address/CIDR such as 172.18.0.0/16 (comma-separated); empty = no proxy is trusted" });
        }
      }
    })
    // the result for Fastify({ trustProxy }): false = off, true = trust everyone, a list = only the proxies at those addresses
    .transform((list): boolean | string[] => (list.length === 0 || list.join() === "false" ? false
      : list.join() === "true" ? true : list)),
  // Module 28: the folder where the firmware files (.bin) the admin uploads are kept. Relative = from the backend folder (dev mode:
  // backend/firmware-data, not in Git). In the container: /app/firmware-data = the firmware-data cupboard (compose.cloud.yml).
  FIRMWARE_DIR: z.preprocess(empty, z.string().default("firmware-data")),
  // Module 28: the server address DEVICES use to download firmware (the url in cmd update = SERVER_URL +
  // /fw/node-1/<version>.bin) and for claims (the same address is typed in Node 1's portal). Empty = over-the-air updates off.
  //   https://iot.yourname.my.id  = VPS (the main path): encrypted downloads, because the device key is sent along
  //   http://192.168.1.37         = the home network only (Pi on the free path, laptop): ONLY home IP addresses 10.x, 172.16-31.x,
  //                                 192.168.x (a device refuses to send its key in plain text to other addresses); 127.x lab only
  // Its form is checked by serverAddressError() above: an address Node 1 can't store is refused when the server starts.
  SERVER_URL: z.preprocess(empty, z.string().default(""))
    .superRefine((text, ctx) => {
      const wrong = text === "" ? null : serverAddressError(text);
      if (wrong !== null) ctx.addIssue({ code: "custom", message: wrong });
    }),
  // Module 28: are device broker accounts created and deleted AUTOMATICALLY through Mosquitto's dynamic security plugin?
  //   off (default)  = no: like Module 21 (mosquitto_passwd by the admin); claim codes still work, the account is made by hand
  //   center         = at the central broker (devices connect straight to the compose.cloud.yml broker, for example without a Pi)
  //   gateway:<name> = at the Pi gateway broker of that name, through the bridge (Node 1 connects to the gateway), for example gateway:pi1
  AUTO_BROKER_ACCOUNTS: z.preprocess(empty, z.string().default("off"))
    .refine((text) => /^(off|center|gateway:[a-z0-9][a-z0-9-]{0,30})$/.test(text),
      "write off, center, or gateway:<gateway name> (lowercase letters, digits, and -), for example gateway:pi1")
    .transform((text): BrokerAccountMode => text.startsWith("gateway:") ? { kind: "gateway", name: text.slice(8) }
      : text === "center" ? { kind: "center" } : { kind: "off" }),
  // Module 28: an update with no word for this many minutes is marked expired (download + restart + the 60-second trial period
  // usually finish within 1-3 minutes). Default 10; the author's lab shortens it for testing.
  OTA_TIMEOUT_MINUTES: z.preprocess(empty, z.coerce.number().int().min(1).max(60).default(10)),
}).refine((s) => s.MQTT_USERNAME !== "" || s.MQTT_PASSWORD === "", { // Module 21: the broker account must be complete
  message: "MQTT_PASSWORD is filled in but MQTT_USERNAME is empty", path: ["MQTT_USERNAME"],
}).refine((s) => s.MQTT_PASSWORD !== "" || s.MQTT_USERNAME === "", {
  message: "MQTT_USERNAME is filled in but MQTT_PASSWORD is empty (the backend account's password from mosquitto_passwd)", path: ["MQTT_PASSWORD"],
});

const result = Settings.safeParse(process.env);
if (!result.success) {
  // show ALL problems at once, so that you don't have to go back and forth fixing them one by one
  for (const issue of result.error.issues) console.error(`Setting ${issue.path.join(".")} in .env: ${issue.message}`);
  console.error("Copy .env.example to .env (or open your .env), fix the settings above, then run again.");
  process.exit(1); // stop here: without the right settings the server must not run
}

export const env = result.data;
