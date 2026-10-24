// api.ts - one door to the backend: every request to the API goes through the request() function in this file.
// Login uses the backend's HttpOnly cookies (Module 20). JavaScript can't read them; the browser stores them
// and sends them, as long as every fetch carries credentials: "include".
import type { Device, LatestReading, User } from "./types";

// Backend address. Default: this page's host name + port 8080, so the page http://localhost:5173 -> API http://localhost:8080.
// The same host name matters: a SameSite=Strict cookie only goes along when the page and the API are one site
// (localhost with localhost, 127.0.0.1 with 127.0.0.1). Another address can be set with VITE_API_BASE in .env.local.
// The trailing slash is removed: the backend answers "//auth/login" as an unknown route (401).
const BASE: string = (import.meta.env.VITE_API_BASE || `${location.protocol}//${location.hostname}:8080`).replace(/\/+$/, "");

// These three /auth ticket booths are never refreshed: a 401 from login means the password really is wrong, a 401 from
// refresh means the season pass has run out (refresh must not call refresh again), and logout is open without a wristband.
const NO_REFRESH = ["/auth/login", "/auth/refresh", "/auth/logout"];

// The refresh in progress, shared. If several requests happen to get a 401 at the same time (for example an effect
// that StrictMode runs twice), the backend is still knocked on only ONCE.
let refreshInFlight: Promise<boolean> | null = null;

// Trade the "season pass" (session cookie, 7 days) for a new "wristband" (access cookie, 15 minutes). true = success.
function refreshOnce(): Promise<boolean> {
  if (refreshInFlight === null) {
    // no body, so also NO JSON Content-Type (if one is given, the backend answers 400)
    refreshInFlight = fetch(BASE + "/auth/refresh", { method: "POST", credentials: "include" })
      .then((res) => res.ok) // 200 = the new wristband is already on in the browser
      .catch(() => false) // backend down = refresh failed
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
  // we rely on the backend's API contract (a real check with Zod only comes in Module 24).
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

// GET /devices/:id/latest: one device's latest reading, from the backend's memory
// (404 if that device hasn't sent a reading since the backend started)
export function getLatest(deviceId: string): Promise<LatestReading> {
  return request<LatestReading>("/devices/" + deviceId + "/latest");
}
