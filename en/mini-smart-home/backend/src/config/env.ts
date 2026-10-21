// env.ts - the server settings from the .env file (read by Node.js through --env-file), checked once at startup.

function required(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    console.error(`Setting ${name} is empty. Copy .env.example to .env, fill in ${name}, then run again.`);
    process.exit(1); // stop here: without this setting the server can't work
  }
  return value;
}

export const env = {
  MQTT_URL: required("MQTT_URL"), // the broker's address, for example mqtt://192.168.1.37:1883
  DATABASE_URL: required("DATABASE_URL"), // the database's address, for example postgres://postgres:<password>@127.0.0.1:5432/smarthome
  PORT: Number(process.env.PORT || 8080), // the server's counter (port) number
  HOST: process.env.HOST || "127.0.0.1", // 127.0.0.1 = only reachable from this laptop
  // Module 19: Telegram is optional. Empty = Telegram notifications off.
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ?? "", // the token from @BotFather: a secret, like a password
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID ?? "", // the owner's chat_id (the answer to /start)
  TELEGRAM_API_ROOT: process.env.TELEGRAM_API_ROOT ?? "", // empty = the real Telegram server (lab: a mock Bot API server)
};
