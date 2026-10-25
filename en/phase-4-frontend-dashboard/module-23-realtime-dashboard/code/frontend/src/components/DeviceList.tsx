// DeviceList.tsx - fetches GET /devices, then shows the answer as device cards that can be tapped.
// Three states are always prepared: loading, error, and empty (the pattern every screen that fetches data uses).
// Module 23: the list is kept in the store (so socket.ts knows which devices to follow), and every card is live:
// the status color, the latest temperature, and "last seen" change by themselves without reloading the page.
import { useEffect, useState } from "react";
import { ApiError, getDevices } from "../api";
import { useLiveStore } from "../store";
import type { Device, DeviceStatus } from "../types";
import { KeyBadge, StatusBadge } from "./Badge";
import LastSeen from "./LastSeen";

type Props = {
  onSelect: (device: Device) => void; // called when a device is tapped
  onSessionExpired: () => void; // called if the backend answers 401 (after the refresh failed as well)
};

// Red/green status cards: the thick line on the card's left edge follows the status (color + text in its badge)
const LEFT_EDGE: Record<DeviceStatus, string> = {
  online: "border-l-green-500 dark:border-l-green-500", // repeated with dark: so the card's dark:border-slate-700 doesn't cover it
  offline: "border-l-red-500 dark:border-l-red-500",
  "offline-mode": "border-l-slate-400",
  unknown: "border-l-slate-300 dark:border-l-slate-600",
};

// One device card. Made its own component so every card picks its OWN data from the store:
// device A's telemetry only re-renders card A, not the whole list.
function DeviceCard({ p, onSelect }: { p: Device; onSelect: (device: Device) => void }) {
  const status = useLiveStore((s) => s.status[p.device_id]) ?? p.status;
  const temperature = useLiveStore((s) => s.latest[p.device_id]?.temperature); // undefined = no reading yet; null = sensor failed
  const last = useLiveStore((s) => s.lastSeen[p.device_id]);
  // a revoked key or an unregistered device = the backend ignores its messages, so its old status
  // (possibly still "online") is misleading and isn't shown
  const messagesIgnored = p.key === "revoked" || p.key === "unregistered";

  return (
    // the whole card is a button; the complete device object is handed to App through onSelect
    <button
      type="button"
      onClick={() => onSelect(p)}
      className={
        "w-full cursor-pointer rounded-xl border border-l-4 border-slate-200 bg-white p-4 text-left shadow-sm hover:border-teal-400 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 " +
        (messagesIgnored ? "border-l-slate-300 dark:border-l-slate-600" : LEFT_EDGE[status])
      }
    >
      <span className="flex items-center justify-between gap-2">
        {/* the name and location are filled in by the admin through the API; JSX shows them as plain text, so HTML code inside them is not run (safe from XSS) */}
        {/* min-w-0 + truncate: a long name is cut off with "…" so the badges stay whole on the right */}
        <span className="min-w-0 truncate font-semibold text-slate-800 dark:text-slate-100">{p.name ?? p.device_id}</span>
        <span className="flex shrink-0 gap-1">
          {messagesIgnored ? null : <StatusBadge status={status} />}
          <KeyBadge keyStatus={p.key} />
        </span>
      </span>
      <span className="mt-1 block truncate text-sm text-slate-500 dark:text-slate-400">
        {p.location ?? "no location yet"} · <span className="font-mono">{p.device_id}</span>
      </span>
      <span className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 text-sm text-slate-500 dark:text-slate-400">
        {messagesIgnored ? (
          <span>messages ignored by the backend</span>
        ) : (
          <span className="text-slate-700 dark:text-slate-200">
            {temperature === undefined ? "waiting for a reading…" : <>Temperature {temperature === null ? "—" : temperature + " °C"}</>}
          </span>
        )}
        <LastSeen t={last} kind={p.kind} checkStale={!messagesIgnored} />
      </span>
    </button>
  );
}

export default function DeviceList({ onSelect, onSessionExpired }: Props) {
  const devices = useLiveStore((s) => s.devices); // null = still loading
  const setDevices = useLiveStore((s) => s.setDevices);
  const [error, setError] = useState<string | null>(null);

  // Fetch the data AFTER the screen appears. In development mode, StrictMode runs this effect twice (normal).
  // [onSessionExpired, setDevices] at the end of the effect: the effect uses both, so they must be listed (npm run lint
  // warns if one is forgotten). Neither ever changes (handleSessionExpired uses useCallback in App, setDevices belongs
  // to the store), so the list is fetched only once each time this screen opens.
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
  }, [onSessionExpired, setDevices]);

  if (error !== null) return <p className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{error}</p>;
  if (devices === null) return <p className="text-slate-500 dark:text-slate-400">Loading devices…</p>;
  if (devices.length === 0) {
    return <p className="rounded-lg bg-white p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300">No registered devices yet (registering devices: Module 21).</p>;
  }

  return (
    // mobile first: one column on a phone; from the sm width (640 px) up, two columns
    <ul className="grid gap-3 sm:grid-cols-2">
      {devices.map((p) => (
        // key = the name tag of each list item; device_id is always unique
        <li key={p.device_id} className="min-w-0">
          <DeviceCard p={p} onSelect={onSelect} />
        </li>
      ))}
    </ul>
  );
}
