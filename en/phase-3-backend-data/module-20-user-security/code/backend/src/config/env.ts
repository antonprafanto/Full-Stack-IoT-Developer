// env.ts - the server settings from .env (read by Node.js through --env-file), checked once by a Zod schema at startup.
// Module 20: .env now also holds a secret (JWT_SECRET), so it is checked as strictly as the messages from devices.
import { z } from "zod";

z.config(z.locales.en()); // Zod error messages in English (this file is read first, before contract.ts)

const empty = (value: unknown) => (value === "" ? undefined : value); // an empty line "NAME=" = not filled in
const required = z.preprocess(empty, z.string({ error: "not filled in" }));

const Settings = z.object({
  MQTT_URL: required, // the broker's address, for example mqtt://192.168.1.37:1883
  DATABASE_URL: required, // the database's address, for example postgres://postgres:<password>@127.0.0.1:5432/smarthome
  PORT: z.preprocess(empty, z.coerce.number().int().min(1).max(65535).default(8080)), // the server's counter (port) number
  HOST: z.preprocess(empty, z.string().default("127.0.0.1")), // 127.0.0.1 = only reachable from this laptop
  // Module 19: Telegram is optional. Empty = Telegram notifications off.
  TELEGRAM_BOT_TOKEN: z.string().default(""), // the token from @BotFather: a secret, like a password
  TELEGRAM_CHAT_ID: z.string().default(""), // the owner's chat_id (the answer to /start)
  TELEGRAM_API_ROOT: z.string().default(""), // empty = the real Telegram server (lab: a mock Bot API server)
  // Module 20: the key that signs the JWTs. Anyone who knows this key can make fake "wristbands".
  JWT_SECRET: z.preprocess(empty, z.string({ error: "not filled in" })
    .min(32, "too short (at least 32 characters); make a new one with the command in .env.example")
    .refine((s) => !s.startsWith("change"), "still holds the example from .env.example; make a new secret")),
  // Module 20: web page addresses (origins) that may call this API from a browser, comma-separated. Module 22: Vite, 5173.
  CORS_ORIGIN: z.preprocess(empty, z.string().default("http://localhost:5173,http://127.0.0.1:5173")
    .transform((text) => text.split(",").map((origin) => origin.trim()).filter((origin) => origin !== ""))),
});

const result = Settings.safeParse(process.env);
if (!result.success) {
  // show ALL problems at once, so that you don't have to go back and forth fixing them one by one
  for (const issue of result.error.issues) console.error(`Setting ${issue.path.join(".")} in .env: ${issue.message}`);
  console.error("Copy .env.example to .env (or open your .env), fix the settings above, then run again.");
  process.exit(1); // stop here: without the right settings the server must not run
}

export const env = result.data;
