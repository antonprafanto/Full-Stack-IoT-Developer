// DeviceList.tsx - fetches GET /devices, then shows the answer as device cards.
// Three states are always prepared: loading, error, and empty (the pattern every screen that fetches data uses).
import { useEffect, useState } from "react";
import { ApiError, getDevices } from "../api";
import type { Device } from "../types";
import { KeyBadge, StatusBadge } from "./Badge";

type Props = {
  onSessionExpired: () => void; // called if the backend answers 401 (not logged in or session expired)
};

export default function DeviceList({ onSessionExpired }: Props) {
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
    <ul className="grid grid-cols-2 gap-3">
      {devices.map((p) => (
        // key = the name tag of each list item; device_id is always unique
        <li key={p.device_id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            {/* the name and location are filled in by the admin through the API; JSX shows them as plain text, so HTML code inside them is not run (safe from XSS) */}
            <span className="font-semibold text-slate-800">{p.name ?? p.device_id}</span>
            <span className="flex gap-1">
              {/* a revoked key or an unregistered device = the backend ignores its messages, so its old status
                  (possibly still "online") is misleading and isn't shown */}
              {p.key === "revoked" || p.key === "unregistered" ? null : <StatusBadge status={p.status} />}
              <KeyBadge keyStatus={p.key} />
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {p.location ?? "no location yet"} · <span className="font-mono">{p.device_id}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
