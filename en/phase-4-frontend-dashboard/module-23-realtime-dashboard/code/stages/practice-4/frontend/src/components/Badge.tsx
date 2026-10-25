// Badge.tsx - small colored badges for a device's status and key.
// Used on the device list cards and in the device details heading (both made in Module 22).
import type { DeviceStatus, KeyStatus } from "../types";

// The Tailwind classes are written WHOLE here, not joined ("bg-" + color): Tailwind only makes classes that are written in full.
// Module 23: color ALWAYS comes with text (online green "Online", offline red "Offline"), so it can still be read by
// people who find it hard to tell red and green apart.
const STATUS_BADGES: Record<DeviceStatus, { text: string; color: string }> = {
  online: { text: "Online", color: "bg-green-100 text-green-800" },
  offline: { text: "Offline", color: "bg-red-100 text-red-800" },
  "offline-mode": { text: "offline mode", color: "bg-slate-200 text-slate-700" },
  unknown: { text: "unknown", color: "bg-slate-100 text-slate-500" },
};

// The text and color for every value of the key field (Module 21).
const KEY_BADGES: Record<KeyStatus, { text: string; color: string }> = {
  active: { text: "key active", color: "bg-teal-50 text-teal-800" },
  revoked: { text: "key revoked", color: "bg-red-600 text-white" }, // the most eye-catching one
  "no-key": { text: "via linking device", color: "bg-sky-50 text-sky-800" }, // Node 2: its data is forwarded by Node 1
  unregistered: { text: "not registered", color: "bg-amber-100 text-amber-800" },
};

const SHAPE = "rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

export function StatusBadge({ status }: { status: DeviceStatus }) {
  const { text, color } = STATUS_BADGES[status];
  return <span className={SHAPE + " " + color}>{text}</span>;
}

export function KeyBadge({ keyStatus }: { keyStatus: KeyStatus }) {
  const { text, color } = KEY_BADGES[keyStatus];
  return <span className={SHAPE + " " + color}>{text}</span>;
}
