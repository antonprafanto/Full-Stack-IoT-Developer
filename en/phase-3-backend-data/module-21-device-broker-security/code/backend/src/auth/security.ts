// security.ts - API protection (Module 20): CORS, cookies, JWT ("concert wristband"), rate limit, and the "guard" that checks
// EVERY HTTP request: the page's origin (Origin), a login (except on the list of open routes), and that viewer accounts only
// look.
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import { env } from "../config/env.ts";
import type { Role } from "../db/users.ts";
import { ACCESS_AGE_SECONDS, SESSION_AGE_SECONDS } from "./token.ts";

// the content of the "wristband" (access JWT): the account number (sub), its role, and the session number (sid). Not a
// secret: anyone who holds the token can read it, so never put an email, a name, or other personal data here.
export interface TokenPayload {
  sub: string;
  role: Role;
  sid: number;
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: TokenPayload; // what reply.jwtSign signs
    user: TokenPayload & { iat: number; exp: number }; // what req.jwtVerify reads into req.user
  }
}

export const ACCESS_COOKIE = "access";
export const SESSION_COOKIE = "session";

// httpOnly: JavaScript on the page can't read the cookie (a thief using XSS doesn't get the token).
// sameSite strict: the browser doesn't send the cookie with requests started by another site (CSRF).
// secure auto: the Secure attribute is set when the request comes over HTTPS (Phase 5); on http://127.0.0.1 it isn't.
const BASE = { httpOnly: true, sameSite: "strict", secure: "auto" } as const;
export const ACCESS_OPTIONS = { ...BASE, path: "/", maxAge: ACCESS_AGE_SECONDS }; // path "/" REQUIRED: else only /auth/...
export const SESSION_OPTIONS = { ...BASE, path: "/auth", maxAge: SESSION_AGE_SECONDS }; // only sent to /auth/...

// Routes you may knock on WITHOUT logging in. Every other route requires a login, including routes added later.
export const OPEN_ROUTES = new Set([
  "POST /auth/login", "POST /auth/refresh", "POST /auth/logout",
  "GET /health", "HEAD /health", // HEAD: health checkers such as wget --spider (Docker, Phase 5)
]);
const READ_METHODS = new Set(["GET", "HEAD"]); // the only methods a viewer account may use
// Web pages (origins) that may CHANGE something through a browser: the CORS list + this server itself (Swagger UI at /docs).
export const ALLOWED_ORIGINS = new Set([...env.CORS_ORIGIN, `http://${env.HOST}:${env.PORT}`, `http://localhost:${env.PORT}`]);

export async function setupSecurity(app: FastifyInstance): Promise<void> {
  // CORS goes FIRST: a preflight (OPTIONS) from the browser carries no cookie, so it must be answered before the guard.
  await app.register(cors, {
    origin: env.CORS_ORIGIN, // an exact list, not "*": with credentials, browsers refuse "*"
    credentials: true, // let the browser send cookies from pages at those origins
    methods: ["GET", "HEAD", "POST", "PUT"], // PUT /rules/:id; the plugin's default is only GET, HEAD, POST
  });
  await app.register(cookie); // no secret: the JWT is already signed, and refresh tokens are checked in the database
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: { cookieName: ACCESS_COOKIE, signed: false },
    sign: { expiresIn: ACCESS_AGE_SECONDS }, // a number = seconds (900); text such as "1h30m" is refused since 10.2.3
    verify: { onlyCookie: true }, // the wristband is only read from the cookie, not from the Authorization header
  });
  await app.register(rateLimit, {
    global: false, // only routes that ask for it (POST /auth/login); counts are kept in memory: restart = start from zero
    errorResponseBuilder: (_req, context) => Object.assign(
      new Error(`too many attempts: try again in ${Math.ceil(context.ttl / 1000)} seconds`),
      { statusCode: context.statusCode }, // 429
    ),
  });
  app.addHook("onRequest", guard); // one guard at the front door: it applies to ALL routes
}

async function guard(req: FastifyRequest, reply: FastifyReply) {
  // CSRF: a <form> on another page on the same host (for example another app at http://127.0.0.1:3000) still carries the
  // SameSite=Strict cookies, because it is still the same "site". Browsers always write the Origin header on POST/PUT; curl,
  // Bruno, and Node don't write it, so they aren't affected.
  const origin = req.headers.origin;
  if (!READ_METHODS.has(req.method) && origin !== undefined && !ALLOWED_ORIGINS.has(origin)) {
    req.log.warn(`refused (403): ${req.method} ${req.url} from the page ${origin}`);
    return reply.code(403).send({ message: `request from the page ${origin} refused` });
  }
  const url = req.routeOptions.url; // the route pattern, such as /devices/:id/command (undefined = none: guests 401, logged in 404)
  if (OPEN_ROUTES.has(`${req.method} ${url}`) || url === "/docs" || url?.startsWith("/docs/")) return;
  try {
    await req.jwtVerify(); // an access cookie? a genuine signature? not expired yet? its content goes into req.user
  } catch {
    return reply.code(401).send({ message: "not logged in or session expired: log in with POST /auth/login" });
  }
  if (req.user.role !== "admin" && !READ_METHODS.has(req.method)) { // checked BEFORE the request content is validated
    req.log.warn(`refused (403): account ${req.user.sub} (${req.user.role}) tried ${req.method} ${req.url}`);
    return reply.code(403).send({ message: "viewer accounts can only look; commands and changes are admin-only" });
  }
}
