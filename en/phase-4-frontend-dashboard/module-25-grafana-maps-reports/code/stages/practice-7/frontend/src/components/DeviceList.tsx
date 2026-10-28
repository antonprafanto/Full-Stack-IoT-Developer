// DeviceList.tsx - shows the device list (GET /devices) as device cards that can be tapped.
// Three states are always prepared: loading, error, and empty (the pattern every screen that fetches data uses).
// Module 23: the list is kept in the store (so socket.ts knows which devices to follow), and every card is live:
// the status color, the latest temperature, and "last seen" change by themselves without reloading the page.
// Module 24: the list is fetched ONCE after login (no longer on this screen); this screen only reads it from the store.
// A card becomes a link to its details address (/devices/<device_id>).
import { Link } from "react-router";
import { useLiveStore } from "../store";
import type { Device, DeviceStatus } from "../types";
import { KeyBadge, StatusBadge } from "./Badge";
import LastSeen from "./LastSeen";

// Red/green status cards: the thick line on the card's left edge follows the status (color + text in its badge)
const LEFT_EDGE: Record<DeviceStatus, string> = {
  online: "border-l-green-500 dark:border-l-green-500", // repeated with dark: so the card's dark:border-slate-700 doesn't cover it
  offline: "border-l-red-500 dark:border-l-red-500",
  "offline-mode": "border-l-slate-400",
  unknown: "border-l-slate-300 dark:border-l-slate-600",
};

// One device card. Made its own component so every card picks its OWN data from the store:
// device A's telemetry only re-renders card A, not the whole list.
function DeviceCard({ p }: { p: Device }) {
  const status = useLiveStore((s) => s.status[p.device_id]) ?? p.status;
  const temperature = useLiveStore((s) => s.latest[p.device_id]?.temperature); // undefined = no reading yet; null = sensor failed
  const last = useLiveStore((s) => s.lastSeen[p.device_id]);
  // a revoked key or an unregistered device = the backend ignores its messages, so its old status
  // (possibly still "online") is misleading and isn't shown
  const messagesIgnored = p.key === "revoked" || p.key === "unregistered";

  return (
    // Module 24: the whole card is a link to its details address. A real link (not a button) can be opened in a new tab,
    // its address copied, and screen readers know it as a "link".
    <Link
      to={"/devices/" + p.device_id}
      className={
        "block w-full rounded-xl border border-l-4 border-slate-200 bg-white p-4 shadow-sm hover:border-teal-400 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 " +
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
    </Link>
  );
}

export default function DeviceList() {
  const devices = useLiveStore((s) => s.devices); // null = still loading
  const error = useLiveStore((s) => s.devicesError);

  if (error !== null) return <p className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{error}</p>;
  if (devices === null) return <p className="text-slate-600 dark:text-slate-400">Loading devices…</p>;
  if (devices.length === 0) {
    return <p className="rounded-lg bg-white p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300">No registered devices yet (registering devices: Module 21).</p>;
  }

  return (
    // mobile first: one column on a phone; from the sm width (640 px) up, two columns
    <ul className="grid gap-3 sm:grid-cols-2">
      {devices.map((p) => (
        // key = the name tag of each list item; device_id is always unique
        <li key={p.device_id} className="min-w-0">
          <DeviceCard p={p} />
        </li>
      ))}
    </ul>
  );
}
