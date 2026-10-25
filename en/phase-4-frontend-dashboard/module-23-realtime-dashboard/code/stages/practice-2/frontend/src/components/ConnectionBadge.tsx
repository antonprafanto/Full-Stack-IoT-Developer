// ConnectionBadge.tsx - the badge for the live connection state in the dashboard header: Live, Reconnecting…, or Disconnected.
// Numbers that are no longer updated must look stale, and this badge is the first sign of it.
import { useLiveStore } from "../store";
import type { Connection } from "../store";

const BADGES: Record<Connection, { text: string; color: string }> = {
  live: { text: "Live", color: "bg-green-100 text-green-800" },
  connecting: { text: "Reconnecting…", color: "bg-amber-100 text-amber-800" },
  disconnected: { text: "Disconnected", color: "bg-red-100 text-red-800" },
};

export default function ConnectionBadge() {
  // selector: take ONE value from the store. This badge only re-renders when that value changes.
  const connection = useLiveStore((s) => s.connection);
  const { text, color } = BADGES[connection];
  return <span className={"rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap " + color}>{text}</span>;
}
