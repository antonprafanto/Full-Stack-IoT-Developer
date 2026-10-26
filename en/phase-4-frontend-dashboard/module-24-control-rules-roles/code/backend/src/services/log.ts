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
