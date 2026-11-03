// auth.ts - the /auth routes (Module 20): login, refresh, logout, and "who am I". The access JWT (15 minutes) and the refresh
// token (7 days) are sent as httpOnly cookies, never in the body of the answer, so JavaScript on the page can't read them.
import { z } from "zod";
import type { FastifyReply } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { ACCESS_COOKIE, SESSION_COOKIE, ACCESS_OPTIONS, SESSION_OPTIONS } from "../auth/security.ts";
import { matchPassword } from "../auth/password.ts";
import { makeSessionToken, hashToken, judgeOldToken, SESSION_AGE_SECONDS } from "../auth/token.ts";
import {
  getUser, createSession, findSessionByOldToken, findForLogin, deleteSession, deleteSessionByToken, rotateSession,
} from "../db/users.ts";
import type { User } from "../db/users.ts";
import { disconnectSession } from "../services/realtime.ts";

const ErrorBody = z.object({ message: z.string() });
const Profile = z.object({
  id: z.number(), email: z.string(), name: z.string(), role: z.enum(["admin", "viewer"]),
}).describe("the account that is logged in");
const LoginBody = z.object({
  email: z.email("invalid email").max(254).describe("the account's email, for example budi@home.test"),
  password: z.string().min(1).max(200).describe("the account's password"),
});

const profile = (u: User) => ({ id: u.id, email: u.email, name: u.name, role: u.role });

// sign a new access JWT, then put it in the "access" cookie
async function setAccessCookie(reply: FastifyReply, u: User, sid: number): Promise<void> {
  const token = await reply.jwtSign({ sub: String(u.id), role: u.role, sid });
  reply.setCookie(ACCESS_COOKIE, token, ACCESS_OPTIONS);
}

// empty both cookies (the same attributes as when they were set; clearCookie itself fills in Max-Age=0)
function clearCookies(reply: FastifyReply): void {
  reply.clearCookie(ACCESS_COOKIE, ACCESS_OPTIONS).clearCookie(SESSION_COOKIE, SESSION_OPTIONS);
}

const OPEN = { security: [] }; // Swagger: this route needs no cookie (no padlock)

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post("/auth/login", {
    config: { rateLimit: { max: 10, timeWindow: 60_000 } }, // the 11th attempt within a minute from the same IP: 429
    schema: {
      tags: ["account"], ...OPEN,
      summary: "Log in with email and password; the result is two httpOnly cookies (access 15 minutes, session 7 days)",
      body: LoginBody,
      response: {
        200: Profile,
        401: ErrorBody.describe("wrong email or password (deliberately not told apart)"),
        429: z.object({ statusCode: z.number(), error: z.string(), message: z.string() })
          .describe("more than 10 login attempts within a minute from the same IP address"),
        503: ErrorBody.describe("the database can't be reached right now"),
      },
    },
  }, async (req, reply) => {
    const email = req.body.email.toLowerCase();
    try {
      const account = await findForLogin(email);
      const match = await matchPassword(req.body.password, account?.password_hash); // no account: still computed, false
      if (account === undefined || !match) {
        req.log.warn(`login failed: ${account === undefined ? "email not registered" : `account ${account.id}`} (IP ${req.ip})`);
        return reply.code(401).send({ message: "wrong email or password" });
      }
      const sessionToken = makeSessionToken();
      const sid = await createSession(account.id, hashToken(sessionToken), SESSION_AGE_SECONDS);
      await setAccessCookie(reply, account, sid);
      reply.setCookie(SESSION_COOKIE, sessionToken, SESSION_OPTIONS);
      req.log.info(`login: account ${account.id} (${account.role}), session ${sid}, IP ${req.ip}`);
      return profile(account);
    } catch (error) {
      req.log.error(`login couldn't be processed: ${(error as Error).message}`);
      return reply.code(503).send({ message: "the database can't be reached right now, try again shortly" });
    }
  });

  app.post("/auth/refresh", {
    schema: {
      tags: ["account"], ...OPEN,
      summary: "Swap the session cookie for a new access JWT (the session cookie is replaced too: rotation)",
      response: {
        200: Profile,
        401: ErrorBody.describe("no session cookie, or it expired, was logged out, or was revoked: log in again"),
      },
    },
  }, async (req, reply) => {
    const token = req.cookies[SESSION_COOKIE];
    if (token === undefined || token === "") return reply.code(401).send({ message: "not logged in: no session cookie" });
    const hash = hashToken(token);
    const newToken = makeSessionToken();
    const session = await rotateSession(hash, hashToken(newToken));
    if (session !== undefined) {
      const account = await getUser(session.user_id); // the role is read again from the database: role changes apply here
      if (account !== undefined) {
        reply.setCookie(SESSION_COOKIE, newToken,
          { ...SESSION_OPTIONS, maxAge: Math.floor((session.expires_at.getTime() - Date.now()) / 1000) }); // the time left
        await setAccessCookie(reply, account, session.id);
        return profile(account);
      }
    } else {
      const old = await findSessionByOldToken(hash);
      if (old !== undefined && judgeOldToken(old.updated_at, Date.now()) === "grace") {
        const account = await getUser(old.user_id); // requests at the same time: a new wristband is enough, the session stays
        if (account !== undefined) {
          await setAccessCookie(reply, account, old.id);
          return profile(account);
        }
      } else if (old !== undefined) {
        await deleteSession(old.id);
        disconnectSession(old.id); // Module 20 Practice 7: that session's Socket.IO connections are cut too
        req.log.warn(`old refresh token of session ${old.id} (account ${old.user_id}) used again: session revoked (IP ${req.ip})`);
      }
    }
    clearCookies(reply);
    return reply.code(401).send({ message: "session no longer valid: please log in again" });
  });

  app.post("/auth/logout", {
    schema: {
      tags: ["account"], ...OPEN,
      summary: "Log out: the session in the database is deleted, both cookies are emptied, its Socket.IO connections are cut",
      response: { 200: ErrorBody.describe("always succeeds, also when you aren't logged in at all") },
    },
  }, async (req, reply) => {
    const token = req.cookies[SESSION_COOKIE];
    let sid = token ? await deleteSessionByToken(hashToken(token)) : undefined;
    if (sid === undefined) { // no session cookie came along? try the session number of a still-valid access wristband
      try {
        await req.jwtVerify(); // the wristband's content goes into req.user
        sid = req.user.sid;
        await deleteSession(sid);
      } catch { /* not logged in: there is nothing to delete */ }
    }
    if (sid !== undefined) {
      disconnectSession(sid); // Module 20 Practice 7: this session's Socket.IO connections are cut too
      req.log.info(`logout: session ${sid}`);
    }
    clearCookies(reply);
    return { message: "logged out" };
  });

  app.get("/auth/me", {
    schema: {
      tags: ["account"],
      summary: "Who is logged in (read from the database, not from the content of the JWT)",
      response: { 200: Profile, 401: ErrorBody.describe("not logged in, or the account has been deleted") },
    },
  }, async (req, reply) => {
    const account = await getUser(Number(req.user.sub)); // req.user is filled in by the guard from a valid wristband
    if (account === undefined) return reply.code(401).send({ message: "this account no longer exists" });
    return profile(account);
  });
};
