// store.ts - the shared "store" of live data for the whole dashboard (Zustand). Any component reads it through a
// selector, and socket.ts fills it from outside React (useLiveStore.getState()). It only lives in this tab's memory:
// nothing is saved in localStorage, and everything is gone when the page is reloaded.
import { create } from "zustand";
import type { Device, DeviceStatus, Telemetry } from "./types";

// the Socket.IO connection state that the badge in the header shows
export type Connection = "connecting" | "live" | "disconnected";

type LiveStore = {
  connection: Connection;
  devices: Device[] | null; // the GET /devices answer; null = not loaded yet
  // Partial<Record<string, …>> = a "dictionary" keyed by device_id. Partial: an entry may not be there yet (undefined).
  status: Partial<Record<string, DeviceStatus>>;
  latest: Partial<Record<string, Telemetry>>; // each device's last reading
  lastSeen: Partial<Record<string, number>>; // when it was last heard from, in milliseconds
  setConnection: (connection: Connection) => void;
  setDevices: (list: Device[]) => void;
  setStatus: (deviceId: string, status: DeviceStatus) => void;
  fillLatest: (deviceId: string, content: Telemetry) => void;
  receive: (deviceId: string, content: Telemetry) => void;
};

// create<LiveStore>()(…): the double parentheses really are how it's written in TypeScript (Zustand 5).
// set() merges the new values with the old ones, but only ONE level deep: the dictionaries inside (status, latest, …)
// must be copied by us with { ...old, [key]: value }, never changed directly.
export const useLiveStore = create<LiveStore>()((set) => ({
  connection: "disconnected",
  devices: null,
  status: {},
  latest: {},
  lastSeen: {},

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
      return { devices: list, status, lastSeen };
    }),

  // the "status" event: the server only sends it when a device's status changes
  setStatus: (deviceId, status) => set((s) => ({ status: { ...s.status, [deviceId]: status } })),

  // the last reading from the "follow" answer: a starting value, NOT a new message, so "last seen" isn't changed
  fillLatest: (deviceId, content) => set((s) => ({ latest: { ...s.latest, [deviceId]: content } })),

  // the "telemetry" event: a new message from the device
  receive: (deviceId, content) =>
    set((s) => ({
      latest: { ...s.latest, [deviceId]: content },
      lastSeen: { ...s.lastSeen, [deviceId]: Date.now() },
    })),
}));
