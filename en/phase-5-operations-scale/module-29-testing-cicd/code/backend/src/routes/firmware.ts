// firmware.ts - the firmware release routes (Module 28): the admin uploads a .bin file, the release list (a "manifest" from the
// database), withdrawing a bad release, and the DOWNLOAD route for devices (/fw/node-1/<version>.bin), locked with the device key.
//
// Why aren't firmware files served by Caddy as they are (file_server), like the dashboard's pages? Node 1's .bin file may
// hold the ESP-NOW key (keys.h, Module 14), and anyone who knows the address can download a public file. This route only
// serves registered devices that prove themselves with their device_id + device key (Basic Auth, exactly
// httpUpdate.setAuthorization() in the firmware), the promise key.ts has made since Module 21.
import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { env } from "../config/env.ts";
import { DeviceId } from "../schemas/contract.ts";
import { matchKey } from "../auth/key.ts";
import { getRelease, allReleases, saveRelease, withdrawRelease } from "../db/fleet.ts";
import type { ReleaseRow } from "../db/fleet.ts";
import { getKeyFingerprint } from "../db/devices.ts";
import { contractTime } from "../db/archive.ts";
import { FOLDER, recordDownloadStart } from "../services/ota.ts";
import { RELEASE_VERSION_PATTERN, highestVersion } from "../services/version.ts";

export const PROGRAM_SHELF = 1_966_080; // one program shelf (app0/app1) of the Minimal SPIFFS scheme (Module 10): 0x1E0000 bytes
const UPLOAD_LIMIT = 2 * 1024 * 1024; // 2 MiB: Fastify's default is only 1 MiB, Node 1's firmware is about 1.2 MB
const ErrorBody = z.object({ message: z.string() });
// An upload's 400 has TWO forms: a file refused by this route ({message}), or an invalid kind/version/test in the address (a Fastify
// validation error). Both must be written down: a form that isn't written makes Fastify answer 500 FST_ERR_FAILED_ERROR_SERIALIZATION
// (an M28 verification finding). English edition: the validation error is listed FIRST, because it has a message too.
const Error400 = z.union([z.object({ statusCode: z.number(), code: z.string(), error: z.string(), message: z.string() }), ErrorBody]);
// a release version: x.y.z without leading zeros (services/version.ts explains why)
const ReleaseVersion = z.string().regex(RELEASE_VERSION_PATTERN, "version must look like x.y.z without leading zeros, for example 1.7.1");
const ReleaseParams = z.object({
  kind: z.enum(["node1"]).describe("the device kind; only node1 (Node 2 isn't updated over the air)"),
  version: ReleaseVersion.describe("the firmware's SemVer version, for example 1.7.1 (the same as FIRMWARE_VERSION in config.h)"),
});
const KIND_FROM_FOLDER: Record<string, string> = Object.fromEntries(Object.entries(FOLDER).map(([k, f]) => [f, k]));

// the file's path in the firmware-data cupboard, for example firmware-data/node-1/1.7.1.bin
const filePath = (kind: string, version: string) => join(resolve(env.FIRMWARE_DIR), FOLDER[kind], `${version}.bin`);
const downloadUrl = (kind: string, version: string) =>
  (env.SERVER_URL === "" ? null : `${env.SERVER_URL}/fw/${FOLDER[kind]}/${version}.bin`);

const Release = z.object({
  kind: z.string(),
  version: z.string(),
  size: z.number().describe("bytes"),
  sha256: z.string().describe("the SHA-256 of the file's content, computed by the server at upload (the same as the file's sha256sum)"),
  notes: z.string().nullable(),
  test: z.boolean().describe("a TEST release: may only be sent to one device, never part of update all"),
  uploaded_by: z.string().nullable().describe("the admin account's number"),
  created_at: z.string(),
  withdrawn_at: z.string().nullable(),
  url: z.string().nullable().describe("the device download address; null if SERVER_URL isn't set"),
});
const present = (r: ReleaseRow) => ({
  kind: r.kind, version: r.version, size: r.size, sha256: r.sha256, notes: r.notes, test: r.test, uploaded_by: r.uploaded_by,
  created_at: contractTime(r.created_at), withdrawn_at: r.withdrawn_at === null ? null : contractTime(r.withdrawn_at), url: downloadUrl(r.kind, r.version),
});

const DATABASE_DOWN = "the database can't be reached right now, try again shortly";

export const firmwareRoutes: FastifyPluginAsyncZod = async (app) => {
  // The upload body = the .bin file's content as it is (Content-Type: application/octet-stream), not a multipart form: no
  // extra package. This parser only applies inside this route file (a Fastify plugin is wrapped on its own).
  app.addContentTypeParser("application/octet-stream", { parseAs: "buffer", bodyLimit: UPLOAD_LIMIT },
    (_req, body, done) => done(null, body));

  app.post("/firmware/:kind/:version", {
    bodyLimit: UPLOAD_LIMIT, // bigger = 413 before the code below runs
    schema: {
      tags: ["firmware"],
      summary: "Upload a .bin firmware file (admin). The body = the file's content, Content-Type: application/octet-stream",
      description: "Upload <sketch>.ino.bin from the build folder (Sketch → Export Compiled Binary), NOT .merged.bin or "
        + ".bootloader.bin. The server checks the first byte 0xE9 and the size ≤ 1,966,080 bytes, then computes its SHA-256. "
        + "An existing version can't be overwritten (409): changed firmware always gets a new version.",
      params: ReleaseParams,
      querystring: z.object({
        notes: z.string().max(200).optional().describe("for example \"a new-version greeting\""),
        test: z.enum(["true", "false"]).optional().describe("true = a TEST release (for example a 1.7.2 broken on purpose)"),
      }),
      response: {
        201: Release.describe("a new release saved"),
        200: Release.describe("this version's file had gone missing from the cupboard and was restored (exactly the same content)"),
        400: Error400.describe("not an ESP32 app file, empty, or too big for one program shelf ({message}); "
          + "or an invalid kind/version/test in the address (a Fastify validation error)"),
        409: ErrorBody.describe("that version already exists"),
        503: ErrorBody.describe("a database or firmware cupboard problem"),
      },
    },
  }, async (req, reply) => {
    const content = req.body as unknown;
    if (!Buffer.isBuffer(content) || content.length === 0) {
      return reply.code(400).send({ message: "the body must be the .bin file's content with Content-Type: application/octet-stream" });
    }
    if (content[0] !== 0xe9) { // every ESP32 app image starts with the byte 0xE9 (HTTPUpdate checks the same thing: error -106)
      return reply.code(400).send({ message: "not an ESP32 app image: the first byte must be 0xE9. Upload <sketch>.ino.bin from "
        + "the build folder, not .merged.bin or .bootloader.bin" });
    }
    if (content.length > PROGRAM_SHELF) {
      return reply.code(400).send({ message: `too big: ${content.length} bytes, one program shelf is only ${PROGRAM_SHELF} bytes` });
    }
    const { kind, version } = req.params;
    const sha256 = createHash("sha256").update(content).digest("hex");
    const path = filePath(kind, version);
    // A UNIQUE temporary name per upload: two uploads of the same version at the same time (a double click, two admins) don't
    // write to the same file, and the loser (409) only deletes its own temporary file (an M28 verification finding).
    const temp = `${path}.${randomUUID()}.tmp`;
    try {
      // Write to a temporary file FIRST, then record it in the database, then rename it: a device can never download
      // a half-written file.
      await mkdir(join(resolve(env.FIRMWARE_DIR), FOLDER[kind]), { recursive: true });
      await writeFile(temp, content);
      const created = await saveRelease({ kind, version, size: content.length, sha256, notes: req.query.notes ?? null,
        test: req.query.test === "true", uploaded_by: req.user.sub });
      if (created === undefined) { // the version is already in the database
        const existing = await getRelease(kind, version);
        const stillThere = await stat(path).then(() => true, () => false);
        if (existing !== undefined && !stillThere && existing.sha256 === sha256) { // its file is gone (cupboard deleted?): restore
          await rename(temp, path);
          req.log.warn(`firmware ${kind} ${version} restored to the cupboard by account ${req.user.sub} (the same sha256)`);
          return reply.code(200).send(present(existing));
        }
        await rm(temp, { force: true });
        return reply.code(409).send({ message: `${kind} ${version} already exists: a version can't be overwritten. Raise FIRMWARE_VERSION, `
          + "build again, then upload with the new version" });
      }
      await rename(temp, path);
      req.log.info(`firmware ${kind} ${version}${created.test ? " (TEST)" : ""} uploaded by account ${req.user.sub}: ${content.length} bytes, `
        + `sha256 ${sha256}`);
      return reply.code(201).send(present(created));
    } catch (error) {
      await rm(temp, { force: true }).catch(() => {});
      req.log.error(`firmware upload ${kind} ${version} failed: ${(error as Error).message}`);
      return reply.code(503).send({ message: `firmware not saved yet: ${(error as Error).message}` });
    }
  });

  app.get("/firmware", {
    schema: {
      tags: ["firmware"],
      summary: "The firmware release list (a \"manifest\" from the database) with each version's canary summary",
      response: {
        200: z.object({
          latest: z.object({ node1: z.string().nullable() })
            .describe("the highest release that isn't a test and isn't withdrawn (the basis of \"needs update\")"),
          releases: z.array(Release.extend({
            canary_succeeded: z.number().describe("canary devices that ran this version successfully"),
            canary_failed: z.number().describe("canary devices that rolled back or failed with this version"),
            can_update_all: z.boolean().describe("the Update all button may be used for this version"),
            update_all_reason: z.string().nullable(),
          })).describe("in upload order"),
        }),
        503: ErrorBody,
      },
    },
  }, async (req, reply) => {
    try {
      const all = await allReleases();
      const eligible = all.filter((r) => !r.test && r.withdrawn_at === null);
      return {
        latest: { node1: highestVersion(eligible.filter((r) => r.kind === "node1").map((r) => r.version)) },
        releases: all.map((r) => {
          const reason = r.withdrawn_at !== null ? "release withdrawn" : r.test ? "test release: per device only"
            : r.canary_failed > 0 ? "a canary failed or rolled back" : r.canary_succeeded === 0 ? "no canary has succeeded yet"
              : null;
          return { ...present(r), canary_succeeded: r.canary_succeeded, canary_failed: r.canary_failed, can_update_all: reason === null,
            update_all_reason: reason };
        }),
      };
    } catch (error) {
      req.log.error(`the release list couldn't be read: ${(error as Error).message}`);
      return reply.code(503).send({ message: DATABASE_DOWN });
    }
  });

  app.post("/firmware/:kind/:version/withdraw", {
    schema: {
      tags: ["firmware"],
      summary: "Withdraw a bad release (admin): it isn't sent anymore and can't be downloaded anymore. Its file stays in the cupboard",
      params: ReleaseParams,
      response: { 200: Release, 404: ErrorBody.describe("doesn't exist, or already withdrawn"), 503: ErrorBody },
    },
  }, async (req, reply) => {
    try {
      const row = await withdrawRelease(req.params.kind, req.params.version);
      if (row === undefined) return reply.code(404).send({ message: `${req.params.kind} ${req.params.version} doesn't exist or is already withdrawn` });
      req.log.warn(`firmware ${row.kind} ${row.version} WITHDRAWN by account ${req.user.sub}`);
      return present(row);
    } catch (error) {
      req.log.error(`withdrawing a release failed: ${(error as Error).message}`);
      return reply.code(503).send({ message: DATABASE_DOWN });
    }
  });

  // ---- DEVICE DOWNLOADS (no login cookie; in OPEN_ROUTES of security.ts, so this route does its own checks) ----
  // The request from HTTPUpdate (Arduino-ESP32 3.3.12): GET ... HTTP/1.0, User-Agent ESP32-http-Update, Basic Auth
  // device_id:key, x-ESP32-STA-MAC (capitals with colons), x-ESP32-version (the version that is running).
  // The answers HTTPUpdate understands: 200 + Content-Length (without it error -101), 304 = no update,
  // 403 = error -103, 404 = error -102. Redirects (3xx) are NOT followed (error -104), so this route never redirects.
  app.get("/fw/:folder/:file", {
    config: { rateLimit: { max: 120, timeWindow: 60_000 } }, // 120 downloads per minute per IP address: enough for a home fleet
    schema: {
      tags: ["firmware"],
      security: [], // no login cookie: a device proves itself with Basic Auth device_id:key
      summary: "DOWNLOAD firmware (device). Basic Auth device_id:key + the x-ESP32-STA-MAC header; 304 if the version is the same",
      // The answers deliberately have no schema: the 200 content is a raw file (a stream), not JSON that needs serializing.
      description: "200 = the file's content as it is (application/octet-stream, Content-Length, x-SHA256, no compression). "
        + "304 = the device already runs this version (the same x-ESP32-version). 403 = a wrong key, a deactivated device, or an "
        + "x-ESP32-STA-MAC that doesn't belong to the device_id. 404 = the version doesn't exist, is withdrawn, or its file is gone. HEAD = headers only.",
      params: z.object({ folder: z.string().describe("node-1"), file: z.string().describe("for example 1.7.1.bin") }),
    },
  }, async (req, reply) => {
    const kind = KIND_FROM_FOLDER[req.params.folder];
    const version = /^(\d+\.\d+\.\d+)\.bin$/.exec(req.params.file)?.[1];
    if (kind === undefined || version === undefined) return reply.code(404).send({ message: "not found" });
    // 1) who is asking? Basic base64(device_id:key)
    const basic = /^Basic ([A-Za-z0-9+/=]+)$/.exec(req.headers.authorization ?? "");
    const [id, key] = basic === null ? [] : Buffer.from(basic[1], "base64").toString("utf8").split(/:(.*)/s);
    if (id === undefined || key === undefined || !DeviceId.safeParse(id).success) {
      return reply.code(403).send({ message: "needs Basic Auth device_id:key" });
    }
    let fingerprint: string | undefined;
    try {
      fingerprint = await getKeyFingerprint(id);
    } catch (error) {
      req.log.error(`firmware download: the database can't be read (${(error as Error).message})`);
      return reply.code(503).send({ message: DATABASE_DOWN });
    }
    if (!matchKey(key, fingerprint ?? null)) { // constant-time (key.ts); a key is never written to the log
      req.log.warn(`firmware download ${version} REFUSED for ${id}: wrong key, not registered, or revoked`);
      return reply.code(403).send({ message: "wrong key, device not registered, or already deactivated" });
    }
    // 2) the Wi-Fi MAC HTTPUpdate sends must belong to that device_id (A4:CF:12:E5:B7:C0 = a4cf12e5b7c0): a leaked key
    //    alone isn't enough to download from another machine without also faking this header (a small guard, not a key's stand-in)
    const mac = String(req.headers["x-esp32-sta-mac"] ?? "").toLowerCase().replaceAll(":", "");
    if (mac !== id) {
      req.log.warn(`firmware download ${version} REFUSED for ${id}: x-ESP32-STA-MAC "${mac}" doesn't belong to that device`);
      return reply.code(403).send({ message: "x-ESP32-STA-MAC missing or not equal to device_id" });
    }
    // 3) does that version's file exist, and isn't it withdrawn?
    let release: ReleaseRow | undefined;
    try {
      release = await getRelease(kind, version);
    } catch (error) {
      req.log.error(`firmware download: the database can't be read (${(error as Error).message})`);
      return reply.code(503).send({ message: DATABASE_DOWN });
    }
    if (release === undefined || release.withdrawn_at !== null) return reply.code(404).send({ message: `firmware ${version} doesn't exist` });
    // 4) the running version is already the same: 304, HTTPUpdate answers "no update" without downloading anything
    if (req.headers["x-esp32-version"] === version) return reply.code(304).send();
    const path = filePath(kind, version);
    const info = await stat(path).catch(() => null);
    if (info === null || info.size !== release.size) {
      req.log.error(`firmware ${kind} ${version} is in the database, but its file ${info === null ? "is gone from" : "changed in"} `
        + "the firmware-data cupboard: upload the same file again");
      return reply.code(404).send({ message: `firmware file ${version} isn't on the server` });
    }
    // 5) send it as it is: Content-Length REQUIRED (HTTPUpdate uses HTTP/1.0, no chunking), no compression, no cache
    reply.header("content-type", "application/octet-stream").header("content-length", info.size)
      .header("cache-control", "no-cache").header("x-SHA256", release.sha256);
    if (req.method !== "HEAD") { // HEAD = headers only (checking the size without downloading): Fastify drops the content itself
      req.log.info(`firmware ${version} downloaded by ${id} (running ${String(req.headers["x-esp32-version"] ?? "?")})`);
      recordDownloadStart(id, version);
    }
    return reply.send(createReadStream(path));
  });
};
