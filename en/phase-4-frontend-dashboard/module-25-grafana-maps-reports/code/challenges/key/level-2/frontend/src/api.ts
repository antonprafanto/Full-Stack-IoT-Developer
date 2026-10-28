// api.ts - one door to the backend: every request to the API goes through the request() function in this file.
// Login uses the backend's HttpOnly cookies (Module 20). JavaScript can't read them; the browser stores them
// and sends them, as long as every fetch carries credentials: "include".
import { subMinutes } from "date-fns";
import { FullRule } from "./rules";
import type { Rule } from "./schemas/rule-basics";
import { Ack } from "./schemas/contract";
import type { SetCommand } from "./schemas/contract";
import type { Device, HistoryData, HistoryRange, Reading, ReadingsAnswer, SummaryAnswer, SummaryPoint, User } from "./types";

// Backend address. Default: this page's host name + port 8080, so the page http://localhost:5173 -> API http://localhost:8080.
// The same host name matters: a SameSite=Strict cookie only goes along when the page and the API are one site
// (localhost with localhost, 127.0.0.1 with 127.0.0.1). Another address can be set with VITE_API_BASE in .env.local.
// The trailing slash is removed: the backend answers "//auth/login" as an unknown route (401).
// Module 23: exported, because socket.ts connects to the SAME address (on a phone: http://<laptop-IP>:8080).
export const BASE: string = (import.meta.env.VITE_API_BASE || `${location.protocol}//${location.hostname}:8080`).replace(/\/+$/, "");

// These three /auth ticket booths are never refreshed: a 401 from login means the password really is wrong, a 401 from
// refresh means the season pass has run out (refresh must not call refresh again), and logout is open without a wristband.
const NO_REFRESH = ["/auth/login", "/auth/refresh", "/auth/logout"];

// The refresh in progress, shared. If several requests happen to get a 401 at the same time (for example an effect
// that StrictMode runs twice), the backend is still knocked on only ONCE.
let refreshInFlight: Promise<boolean | null> | null = null;

// Trade the "season pass" (session cookie, 7 days) for a new "wristband" (access cookie, 15 minutes). true = success.
// Module 23: exported for socket.ts, and it now tells two failures apart: false = REFUSED by the backend (401: the season
// pass has run out, or already logged out), null = the backend can't serve right now (down, unreachable, or another problem).
export function refreshOnce(): Promise<boolean | null> {
  if (refreshInFlight === null) {
    // no body, so also NO JSON Content-Type (if one is given, the backend answers 400)
    refreshInFlight = fetch(BASE + "/auth/refresh", { method: "POST", credentials: "include" })
      .then((res) => {
        if (res.ok) return true; // 200 = the new wristband is already on in the browser
        if (res.status === 401) return false; // refused: the season pass has run out, or already logged out
        return null; // another code, for example 500 while the database is down: the session hasn't necessarily expired
      })
      .catch(() => null) // fetch failed completely: the backend is down or can't be reached
      .finally(() => {
        refreshInFlight = null; // done: next time a refresh is allowed again
      });
  }
  return refreshInFlight;
}

// An error that knows its HTTP code, so a screen can tell "not logged in" (401) apart from other problems.
// Code 0 = the server can't be reached at all.
export class ApiError extends Error {
  code: number;
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.name = "ApiError";
  }
}

// request() sends one request, then returns the JSON content of the response or throws an ApiError.
// <T> = the shape of the response content, filled in by the calling function (for example User).
// mayRetry = may refresh and then repeat once; the repeat itself uses false so it never loops forever.
async function request<T>(path: string, options: RequestInit = {}, mayRetry = true): Promise<T> {
  let res: Response;
  try {
    // credentials: "include" = bring the cookies even though the API is another origin (port 8080, not 5173)
    res = await fetch(BASE + path, { credentials: "include", ...options });
  } catch {
    // fetch failed completely: backend down, wrong address, or blocked by CORS. The browser deliberately doesn't tell
    // JavaScript which one (a CORS error looks the same as a backend that is down); the details are only in the Console tab.
    throw new ApiError(
      0,
      "Can't reach the server at " + BASE + ". Maybe the backend isn't running yet, or this page was opened from " +
        "an address the backend doesn't allow (open http://localhost:5173, see CORS_ORIGIN).",
    );
  }
  // Wristband expired (401)? Refresh ONCE, then repeat this request ONCE (Module 20's promise).
  // If the refresh fails too, the 401 is passed on to the screen, and the screen goes back to the login form.
  if (res.status === 401 && mayRetry && !NO_REFRESH.includes(path) && (await refreshOnce())) {
    return request<T>(path, options, false);
  }
  if (!res.ok) {
    // fetch does NOT throw an error for 401, 404, or 500: we are the ones who check res.ok
    let message = "Something went wrong (" + res.status + ").";
    try {
      const body = await res.json();
      // our backend's errors and Fastify's built-in ones (400, 429, 500) both carry the text in the message field
      if (typeof body?.message === "string") message = body.message;
    } catch {
      // the response isn't JSON: use the default message above
    }
    throw new ApiError(res.status, message);
  }
  // as T = "trust me, the content has the shape T". TypeScript doesn't check JSON content while the page runs;
  // we rely on the backend's API contract. Module 24: the answers that decide the control buttons (ack) and the rule list
  // are really checked with Zod (sendCommand, getRules); other answers are still trusted through their type.
  return (await res.json()) as T;
}

// POST /auth/login. The JSON Content-Type header is only set on requests that really carry a JSON body:
// a POST that claims to be JSON but has an empty body is refused by the backend (400).
export function login(email: string, password: string): Promise<User> {
  return request<User>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

// GET /auth/me: "who am I?" Answered with 401 when not logged in.
export function whoAmI(): Promise<User> {
  return request<User>("/auth/me");
}

// POST /auth/logout: no body, so also NO JSON Content-Type (if one is given, the backend answers 400).
export function logout(): Promise<unknown> {
  return request<unknown>("/auth/logout", { method: "POST" });
}

// GET /devices: the device list from the backend's database
export function getDevices(): Promise<Device[]> {
  return request<Device[]>("/devices");
}

// Level 2 of Module 25: PUT /devices/:id/location (backend 1.2, admin only) - moves a device's point on the map.
// The answer is one device row with its new point. A 400 error (out of range) and a 404 come as ApiError.
export function setDeviceLocation(deviceId: string, lat: number, lng: number): Promise<Device> {
  return request<Device>("/devices/" + deviceId + "/location", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lng }),
  });
}

// Module 24: POST /devices/:id/command - send ONE command (admin-only), then wait for the device's answer (ack) that the
// backend passes on, at most 5 seconds. A 200 answer doesn't always mean success: ack.ok can be false (the device refuses,
// for example "pump refused: tank water too low"). Other errors come as ApiError: 409 (offline, the previous command is
// still waiting, ...), 404, 503, 504 (no ack within 5 seconds), 403 (a viewer account).
export async function sendCommand(deviceId: string, command: SetCommand): Promise<Ack> {
  const answer = await request<{ ack?: unknown }>("/devices/" + deviceId + "/command", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  // The ack's content is checked with the SAME Ack schema as the backend (the copy in schemas/contract.ts), not just trusted.
  // safeParse doesn't throw an error: its result is { success: true, data } or { success: false, error }.
  const result = Ack.safeParse(answer.ack);
  if (!result.success) throw new ApiError(200, "Unknown answer from the server.");
  return result.data;
}

// Module 24: GET /rules - every automation rule (admin and viewer may read it). Its answer is checked with Zod, because the
// Rules screen and the edit form use it directly.
export async function getRules(): Promise<FullRule[]> {
  const answer = await request<unknown>("/rules");
  const result = FullRule.array().safeParse(answer); // .array() = an array whose every item is a FullRule
  if (!result.success) throw new ApiError(200, "Unknown answer from the server (rule list).");
  return result.data;
}

// Module 24: POST /rules (create) and PUT /rules/:id (change) - admin-only. The content has passed the Rule schema in the
// browser, but the backend checks it again; a 400 error is read by the rule form to put it in its field.
export function createRule(content: Rule): Promise<FullRule> {
  return request<FullRule>("/rules", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(content),
  });
}

export function updateRule(id: number, content: Rule): Promise<FullRule> {
  return request<FullRule>("/rules/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(content),
  });
}

// Module 24: DELETE /rules/:id (backend 1.1) - admin-only. No body, so also NO JSON Content-Type: a DELETE that claims
// to carry JSON but has an empty body is refused by the backend (400), just like logout.
export function deleteRule(id: number): Promise<{ id: number; name: string; message: string }> {
  return request<{ id: number; name: string; message: string }>("/rules/" + id, { method: "DELETE" });
}

// Module 23: GET /devices/:id/readings?from=… = raw readings since some minutes ago (the live chart's first points).
export function getReadingsSince(deviceId: string, minutes: number): Promise<ReadingsAnswer> {
  // toISOString() writes UTC time ending in Z, for example 2026-10-24T03:10:00.000Z: safe to put in an address.
  // (A time in the +07:00 zone must be written %2B07:00, because a + in an address is read as a space.)
  const from = subMinutes(new Date(), minutes).toISOString();
  return request<ReadingsAnswer>("/devices/" + deviceId + "/readings?from=" + from);
}

// one raw reading turned into the shape of a summary point, so the chart, the table, and the CSV only need to know ONE shape
function toSummaryPoint(b: Reading): SummaryPoint {
  return {
    time: b.ts,
    avg_temp: b.temperature,
    min_temp: null, // one reading has no lowest and highest
    max_temp: null,
    avg_humidity: b.humidity,
    avg_soil: b.soil,
    avg_light: b.light,
    reading_count: 1,
  };
}

// Module 23: history for the History screen. The ranges use the API's defaults (no from and to):
// 1 hour = raw readings, 24 hours = average per 15 minutes (bucket=15m), 7 days = average per hour (bucket=1h).
export async function getHistory(deviceId: string, range: HistoryRange): Promise<HistoryData> {
  const path = "/devices/" + deviceId + "/readings";
  if (range === "1hour") {
    const answer = await request<ReadingsAnswer>(path);
    return { from: answer.from, to: answer.to, points: answer.readings.map(toSummaryPoint) };
  }
  const bucket = range === "24hours" ? "15m" : "1h";
  const answer = await request<SummaryAnswer>(path + "?bucket=" + bucket);
  return { from: answer.from, to: answer.to, points: answer.summary };
}
