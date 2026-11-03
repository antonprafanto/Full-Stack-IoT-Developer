// claims.ts - registering a new device within one minute with a CLAIM CODE (Module 28).
//   1. admin: POST /provision/code {name, location, minutes} -> a code XXXX-XXXX, shown ONCE
//   2. that code is typed in the new board's Wi-Fi portal (or Serial "claim <code>" in Wokwi/without a portal)
//   3. device: POST <server address>/api/provision/claim {code, device_id} -> its own device key, once
//   4. its broker account is made by the backend itself (AUTO_BROKER_ACCOUNTS), the device connects at once and shows on /fleet
// Route 3 WITHOUT a login (a device has no dashboard account): it is in OPEN_ROUTES of security.ts, limited to 10 requests per minute
// per IP address, and every invalid code gets the SAME answer (403) so a guesser can't tell which codes ever existed.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { DeviceId } from "../schemas/contract.ts";
import { makeKey, hashKey } from "../auth/key.ts";
import { createClaimCode, hashClaimCode, tidyClaimCode } from "../auth/claim-code.ts";
import { listClaimCodes, saveClaimCode, redeemClaimCode } from "../db/claims.ts";
import { contractTime } from "../db/archive.ts";
import { recordRegistered } from "../services/registry.ts";
import { recordEvent } from "../services/events.ts";
import { accountQueue, addDeviceAccount, accountPlace } from "../services/broker-accounts.ts";

const ErrorBody = z.object({ message: z.string() });
const WRONG_CODE = "claim code wrong, expired, or already used: ask the admin for a new code";

export const claimRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post("/provision/code", {
    schema: {
      tags: ["provisioning"],
      summary: "Create a single-use claim code (admin). The code is shown only ONCE, in this answer",
      body: z.strictObject({
        name: z.string().min(1).max(60).optional().describe("the name of the device that will register, for example Node 1 garage"),
        location: z.string().min(1).max(60).optional().describe("for example garage"),
        minutes: z.number().int().min(5).max(60).default(30).describe("how long the code is valid, 5-60 minutes (default 30)"),
      }),
      response: {
        201: z.object({
          code: z.string().describe("XXXX-XXXX; the database only stores its fingerprint"),
          expires_at: z.string(), minutes: z.number(), name: z.string().nullable(), location: z.string().nullable(),
        }),
        503: ErrorBody,
      },
    },
  }, async (req, reply) => {
    const code = createClaimCode();
    const tidy = tidyClaimCode(code) ?? ""; // a code we made ourselves is always valid
    try {
      const expiresAt = await saveClaimCode(hashClaimCode(tidy), req.body.name ?? null, req.body.location ?? null,
        req.user.sub, req.body.minutes);
      // the code itself is NOT written to the log: anyone who reads the log could use it
      req.log.info(`a new claim code created by account ${req.user.sub} (${req.body.minutes} minutes${req.body.name ? `, for ${req.body.name}` : ""})`);
      return reply.code(201).send({ code, expires_at: contractTime(expiresAt), minutes: req.body.minutes,
        name: req.body.name ?? null, location: req.body.location ?? null });
    } catch (error) {
      req.log.error(`the claim code couldn't be saved: ${(error as Error).message}`);
      return reply.code(503).send({ message: "the database can't be reached right now, try again shortly" });
    }
  });

  app.get("/provision/code", {
    schema: {
      tags: ["provisioning"],
      summary: "The recent claim codes (WITHOUT the code): still valid, used by whom, or expired",
      response: {
        200: z.array(z.object({
          name: z.string().nullable(), location: z.string().nullable(), created_by: z.string().nullable(), created_at: z.string(),
          expires_at: z.string(), state: z.enum(["valid", "used", "expired"]),
          used_at: z.string().nullable(), device_id: z.string().nullable(),
        })),
        503: ErrorBody,
      },
    },
  }, async (req, reply) => {
    try {
      const now = Date.now();
      return (await listClaimCodes()).map((c) => ({
        name: c.name, location: c.location, created_by: c.created_by, created_at: contractTime(c.created_at), expires_at: contractTime(c.expires_at),
        state: c.used_at !== null ? "used" as const : c.expires_at.getTime() <= now ? "expired" as const : "valid" as const,
        used_at: c.used_at === null ? null : contractTime(c.used_at), device_id: c.device_id,
      }));
    } catch (error) {
      req.log.error(`the claim code list couldn't be read: ${(error as Error).message}`);
      return reply.code(503).send({ message: "the database can't be reached right now, try again shortly" });
    }
  });

  app.post("/provision/claim", {
    config: { rateLimit: { max: 10, timeWindow: 60_000 } }, // the 11th request within a minute from the same IP address: 429
    schema: {
      tags: ["provisioning"],
      security: [], // no login: called by a DEVICE, which proves itself with a claim code from the admin
      summary: "A DEVICE exchanges a claim code for its device key (once). Through Caddy: POST /api/provision/claim",
      body: z.strictObject({
        code: z.string().min(8).max(12).describe("the claim code; lowercase, spaces, and - are allowed"),
        device_id: DeviceId.describe("12 lowercase hexadecimal digits from the device's Wi-Fi MAC"),
      }),
      response: {
        201: z.object({
          device_id: z.string(), key: z.string().describe("43 characters; save it in the device's NVS (saveBrokerKey)"),
          mqtt_username: z.string().describe("the broker username = device_id"),
        }),
        403: ErrorBody.describe("a wrong, expired, or already used code (one answer for all three)"),
        409: ErrorBody.describe("that device_id is still registered and active (deactivate it first), or an ESP-NOW device"),
        429: z.object({ statusCode: z.number(), error: z.string(), message: z.string() })
          .describe("too many attempts from this address (the limiter's answer form, the same as login)"),
        503: ErrorBody.describe("a database or broker problem; the code is NOT used up, try again"),
      },
    },
  }, async (req, reply) => {
    const { device_id: id } = req.body;
    const tidy = tidyClaimCode(req.body.code);
    if (tidy === null) {
      req.log.warn(`claim REFUSED for ${id}: wrong code form`);
      return reply.code(403).send({ message: WRONG_CODE });
    }
    const key = makeKey();
    let account = "manual" as Awaited<ReturnType<typeof addDeviceAccount>>; // filled in inside the transaction
    try {
      // accountQueue: one broker account step at a time (waiting for a turn > 5 seconds = 503, the code isn't touched)
      const result = await accountQueue(() => redeemClaimCode(hashClaimCode(tidy), id, hashKey(key), async () => {
        account = await addDeviceAccount(id, key); // fails = an error = ROLLBACK: the code isn't used up
      }));
      if (result.status === "wrong-code") {
        req.log.warn(`claim REFUSED for ${id}: a wrong, expired, or already used code`);
        return reply.code(403).send({ message: WRONG_CODE });
      }
      if (result.status === "still-active") {
        req.log.warn(`claim REFUSED for ${id}: that device is still registered and active`);
        return reply.code(409).send({ message: `${id} is still registered and active: deactivate it on /fleet first, then claim again` });
      }
      recordRegistered(id);
      const note = account === "manual" ? "the broker account is made by hand (AUTO_BROKER_ACCOUNTS=off): mosquitto_passwd"
        : `broker account ${account} at ${accountPlace()}`;
      const message = `${id} registered through a claim code${result.name ? ` as ${result.name}` : ""}; ${note}`;
      req.log.info(message);
      recordEvent({ device_id: id, kind: "provisioning", source: "device", rule_id: null, message,
        data: { name: result.name, location: result.location, broker_account: account } });
      return reply.code(201).send({ device_id: id, key, mqtt_username: id });
    } catch (error) {
      req.log.error(`claim ${id} failed (the code isn't used up): ${(error as Error).message}`);
      return reply.code(503).send({ message: "registration failed for now (database or broker): the code isn't used yet, try again" });
    }
  });
};
