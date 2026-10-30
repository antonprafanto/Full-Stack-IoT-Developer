// env.ts - the server settings from .env (read by Node.js through --env-file), checked once by a Zod schema at startup.
// Module 20: .env now also holds a secret (JWT_SECRET), so it is checked as strictly as the messages from devices.
// Module 27: + TRUST_PROXY (the backend behind Caddy HTTPS) and a check of the address form in CORS_ORIGIN.
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
