// log.ts - one "log book" for the services that don't hold the Fastify app (commands, rules, schedules, Telegram).
// server.ts fills it with app.log once, right after the server is created (Module 19).
import type { FastifyBaseLogger } from "fastify";

let logger: FastifyBaseLogger | undefined;

export function useLog(serverLog: FastifyBaseLogger): void {
  logger = serverLog;
}

export const log = {
  info: (message: string) => logger?.info(message),
  warn: (message: string) => logger?.warn(message),
  error: (message: string) => logger?.error(message),
};

// Module 26: should one HTTP request be written to the log (used by the onResponse hook in server.ts)? The Docker healthcheck
// knocks HEAD /health every 15 seconds; without this filter, the log holds thousands of identical lines every day and the
// important lines drown. Only SUCCESSFUL /health knocks (GET or HEAD, a code below 400) are not logged: a failed /health
// and every other address are still logged as usual.
export function shouldLog(method: string, url: string, code: number): boolean {
  const path = url.split("?")[0]; // without the ?… behind it
  const healthKnock = (method === "GET" || method === "HEAD") && path === "/health";
  return !(healthKnock && code < 400);
}
