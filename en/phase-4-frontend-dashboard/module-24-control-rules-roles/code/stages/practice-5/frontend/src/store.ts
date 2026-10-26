// store.ts - the shared "store" of live data for the whole dashboard (Zustand). Any component reads it through a
// selector, and socket.ts fills it from outside React (useLiveStore.getState()). It only lives in this tab's memory:
// nothing is saved in localStorage, and everything is gone when the page is reloaded.
// Module 24: the store also records WHO is logged in (the session slice), so the route guards, the header, and the buttons
// can read it without it being handed down through props from App. The role still lives only in memory: never in localStorage.
import { create } from "zustand";
import { useToast } from "./toast";
import type { Device, DeviceStatus, Point, Reading, State, Telemetry, TelemetryNode1, User } from "./types";

// the Socket.IO connection state that the badge in the header shows
export type Connection = "connecting" | "live" | "disconnected";

const FIVE_MINUTES = 5 * 60 * 1000; // in milliseconds

// An empty array that is ALWAYS the same one. Selectors use "?? EMPTY", not "?? []": a new array on every call makes
// Zustand 5 think the data keeps changing, React re-renders without end, and the screen goes white.
export const EMPTY: Point[] = [];

// telemetry from a Socket.IO event becomes one chart point (Node 2 has no light sensor)
function toPoint(content: Telemetry): Point {
  return { t: Date.parse(content.ts), temperature: content.temperature, humidity: content.humidity, light: "light" in content ? content.light : null };
}

// a raw reading from GET …/readings becomes one chart point
function readingToPoint(b: Reading): Point {
  return { t: Date.parse(b.ts), temperature: b.temperature, humidity: b.humidity, light: b.light };
}

// a raw reading from the database becomes a Node 1 reading for the cards, WITHOUT making up values: if a field Node 1
// must have is empty, the result is null (not used). The actuator state isn't stored in the database, so it isn't included.
function toTelemetry(b: Reading): TelemetryNode1 | null {
  if (b.light === null || b.soil === null || b.motion === null) return null;
  const content: TelemetryNode1 = {
    ts: b.ts,
    fw: b.fw,
    temperature: b.temperature,
    humidity: b.humidity,
    light: b.light,
    soil: b.soil,
    motion: b.motion,
    water_level: b.water_level,
  };
  // the three RS-485 soil sensor fields only exist when that sensor is fitted (they always come together)
  if (b.soil_rs485 !== null) {
    content.soil_rs485 = b.soil_rs485;
    content.soil_temperature = b.soil_temperature;
    content.ec = b.ec;
  }
  return content;
}

// merge - the 5-minute sliding window: old points + new points, in time order, without double points (the same ts).
// The result is always a NEW array (the old one isn't changed), so React knows something changed.
function merge(old: Point[], incoming: Point[]): Point[] {
  const cutoff = Date.now() - FIVE_MINUTES; // the browser's clock; the points' ts use the device's clock
  const sorted = [...old, ...incoming].filter((p) => p.t >= cutoff).sort((a, b) => a.t - b.t);
  return sorted.filter((p, i) => i === 0 || p.t !== sorted[i - 1].t); // once sorted, double points are always next to each other
}

type LiveStore = {
  // Module 24, the session slice: "loading" = GET /auth/me not answered yet; null = not logged in; object = logged in (with a role)
  user: User | null | "loading";
  loginMessage: string | null; // the sentence above the Log in form, for example "Your session has expired. Please log in again."
  // true after the Log out button: the route guard then does NOT hand the last address to the Log in screen, so the next
  // person in this tab starts from the device list, not from the previous person's last screen
  loggedOutOnPurpose: boolean;
  setUser: (user: User) => void;
  setNotLoggedIn: (message: string | null) => void;
  connection: Connection;
  devices: Device[] | null; // the GET /devices answer; null = not loaded yet
  devicesError: string | null; // Module 24: GET /devices failed (read by the Devices and Details screens)
  // Partial<Record<string, …>> = a "dictionary" keyed by device_id. Partial: an entry may not be there yet (undefined).
  status: Partial<Record<string, DeviceStatus>>;
  latest: Partial<Record<string, Telemetry>>; // each device's last reading
  lastSeen: Partial<Record<string, number>>; // when it was last heard from, in milliseconds
  windows: Partial<Record<string, Point[]>>; // each device's chart points of the last 5 minutes
  setConnection: (connection: Connection) => void;
  setDevices: (list: Device[]) => void;
  setDevicesError: (message: string) => void;
  setStatus: (deviceId: string, status: DeviceStatus) => void;
  fillLatest: (deviceId: string, content: Telemetry) => void;
  receive: (deviceId: string, content: Telemetry) => void;
  fillWindow: (deviceId: string, readings: Reading[]) => void;
  applyState: (deviceId: string, state: State) => void;
};

// create<LiveStore>()(…): the double parentheses really are how it's written in TypeScript (Zustand 5).
// set() merges the new values with the old ones, but only ONE level deep: the dictionaries inside (status, latest, …)
// must be copied by us with { ...old, [key]: value }, never changed directly.
export const useLiveStore = create<LiveStore>()((set) => ({
  user: "loading",
  loginMessage: null,
  setUser: (user) => set({ user, loginMessage: null }),
  setNotLoggedIn: (message) => set({ user: null, loginMessage: message }),
  loggedOutOnPurpose: false,

  connection: "disconnected",
  devices: null,
  devicesError: null,
  status: {},
  latest: {},
  lastSeen: {},
  windows: {},

  setConnection: (connection) => set({ connection }),

  // the list from GET /devices: the status and "last seen" are filled in from the database too
  setDevices: (list) =>
    set((s) => {
      const status = { ...s.status };
      const lastSeen = { ...s.lastSeen };
      for (const p of list) {
        status[p.device_id] = p.status;
        if (p.last_seen !== null) {
          // take the newer one: the server's clock in the database, or the browser's clock when the last telemetry arrived
          lastSeen[p.device_id] = Math.max(lastSeen[p.device_id] ?? 0, Date.parse(p.last_seen));
        }
      }
      return { devices: list, devicesError: null, status, lastSeen };
    }),

  setDevicesError: (message) => set({ devicesError: message }),

  // the "status" event: the server only sends it when a device's status changes
  setStatus: (deviceId, status) => set((s) => ({ status: { ...s.status, [deviceId]: status } })),

  // the last reading from the "follow" answer: a starting value, NOT a new message, so "last seen" isn't changed
  fillLatest: (deviceId, content) => set((s) => ({ latest: { ...s.latest, [deviceId]: content } })),

  // the "telemetry" event: a new message from the device
  receive: (deviceId, content) =>
    set((s) => ({
      latest: { ...s.latest, [deviceId]: content },
      lastSeen: { ...s.lastSeen, [deviceId]: Date.now() },
      windows: { ...s.windows, [deviceId]: merge(s.windows[deviceId] ?? EMPTY, [toPoint(content)]) },
    })),

  // the chart's first points from the database, merged with live points that may have come in first.
  // Also the cards' starting values: if the "follow" answer brought no reading (the backend has only just started), the last
  // reading from the database is used. Numbers already there aren't overwritten (they're surely newer), and "last seen" isn't
  // changed (this isn't a new message).
  fillWindow: (deviceId, readings) =>
    set((s) => {
      const windows = { ...s.windows, [deviceId]: merge(s.windows[deviceId] ?? EMPTY, readings.map(readingToPoint)) };
      const last = readings.at(-1); // readings come oldest first, so the last one = the newest
      const initial = last === undefined ? null : toTelemetry(last);
      if (s.latest[deviceId] !== undefined || initial === null) return { windows };
      return { windows, latest: { ...s.latest, [deviceId]: initial } };
    }),

  // Module 24: the actuator state from an ack (the device's answer to our command). Written into the latest reading so the cards
  // and buttons are right at once, without waiting for the next telemetry (which brings the same state ±1-2 seconds later).
  applyState: (deviceId, state) =>
    set((s) => {
      const old = s.latest[deviceId];
      // no reading yet, or Node 2 (it has pressure, no actuators): nothing to change
      if (old === undefined || "pressure" in old) return s;
      return { latest: { ...s.latest, [deviceId]: { ...old, state } } };
    }),
}));

// Module 24: true ONLY when the admin role is certain. While GET /auth/me isn't answered yet ("loading") the result is false,
// so admin buttons don't flash up on a viewer's screen. This is only screen convenience: what really guards is still
// the backend's guard (403 for every change from a viewer account).
export function useAdmin(): boolean {
  return useLiveStore((s) => s.user !== null && s.user !== "loading" && s.user.role === "admin");
}

// Module 24: clear EVERYTHING in the store at once (session, device list, readings, charts), then write a message for the
// Log in screen. Used on Log out and when the session expires, so the next person in the same tab sees no leftover data.
// getInitialState() = the store's content when it was first created; true = REPLACE all of it (not merged like a normal set).
// loggedOutOnPurpose = true only from the Log out button (Layout).
export function clearAll(loginMessage: string | null, loggedOutOnPurpose = false) {
  useLiveStore.setState({ ...useLiveStore.getInitialState(), user: null, loginMessage, loggedOutOnPurpose }, true);
  useToast.setState(useToast.getInitialState(), true); // the previous account's toasts are thrown away too
}

// Module 24: called when the backend answers 401 and the refresh fails too (the session has expired, or logout in another tab).
// The route guard (RequireLogin) then moves the screen to /login. A plain function outside a component = the SAME function
// forever, so it is safe as an effect dependency (useRealtime doesn't disconnect and reconnect the socket because of it).
export function handleSessionExpired() {
  clearAll("Your session has expired. Please log in again.");
}
