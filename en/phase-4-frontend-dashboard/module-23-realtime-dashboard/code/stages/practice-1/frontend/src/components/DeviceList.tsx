// DeviceList.tsx - fetches GET /devices, then shows the answer as device cards that can be tapped.
// Three states are always prepared: loading, error, and empty (the pattern every screen that fetches data uses).
import { useEffect, useState } from "react";
import { ApiError, getDevices } from "../api";
import type { Device } from "../types";
import { KeyBadge, StatusBadge } from "./Badge";

type Props = {
  onSelect: (device: Device) => void; // called when a device is tapped
  onSessionExpired: () => void; // called if the backend answers 401 (after the refresh failed as well)
};

export default function DeviceList({ onSelect, onSessionExpired }: Props) {
  const [devices, setDevices] = useState<Device[] | null>(null); // null = still loading
  const [error, setError] = useState<string | null>(null);

  // Fetch the data AFTER the screen appears. In development mode, StrictMode runs this effect twice (normal).
  // [onSessionExpired] at the end of the effect: the effect uses that callback handed down from App, so it must be listed
  // (npm run lint warns if it's forgotten). While the list is shown, App's state doesn't change, so the effect doesn't repeat.
  useEffect(() => {
    let ignore = false; // becomes true when the effect is cleaned up: an answer that arrives late is ignored
    getDevices()
      .then((list) => {
        if (!ignore) setDevices(list);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof ApiError && err.code === 401) return onSessionExpired();
        setError(err instanceof ApiError ? err.message : "Couldn't load the devices.");
      });
    return () => {
      ignore = true; // cleanup: React runs it before the effect repeats or when this component leaves the screen
    };
  }, [onSessionExpired]);

  if (error !== null) return <p className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>;
  if (devices === null) return <p className="text-slate-500">Loading devices…</p>;
  if (devices.length === 0) {
    return <p className="rounded-lg bg-white p-3 text-slate-600">No registered devices yet (registering devices: Module 21).</p>;
  }

  return (
    // mobile first: one column on a phone; from the sm width (640 px) up, two columns
    <ul className="grid gap-3 sm:grid-cols-2">
      {devices.map((p) => (
        // key = the name tag of each list item; device_id is always unique
        <li key={p.device_id} className="min-w-0">
          {/* the whole card is a button; the complete device object is handed to App through onSelect */}
          <button
            type="button"
            onClick={() => onSelect(p)}
            className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-teal-400 hover:shadow-md"
          >
            <span className="flex items-center justify-between gap-2">
              {/* the name and location are filled in by the admin through the API; JSX shows them as plain text, so HTML code inside them is not run (safe from XSS) */}
              {/* min-w-0 + truncate: a long name is cut off with "…" so the badges stay whole on the right */}
              <span className="min-w-0 truncate font-semibold text-slate-800">{p.name ?? p.device_id}</span>
              <span className="flex shrink-0 gap-1">
                {/* a revoked key or an unregistered device = the backend ignores its messages, so its old status
                    (possibly still "online") is misleading and isn't shown */}
                {p.key === "revoked" || p.key === "unregistered" ? null : <StatusBadge status={p.status} />}
                <KeyBadge keyStatus={p.key} />
              </span>
            </span>
            <span className="mt-1 block truncate text-sm text-slate-500">
              {p.location ?? "no location yet"} · <span className="font-mono">{p.device_id}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
