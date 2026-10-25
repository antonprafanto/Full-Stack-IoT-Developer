// LastSeen.tsx - "last seen 12 seconds ago", plus a "stale data" mark when the device has been quiet for too
// long. This small component ticks by itself every second, so only this text re-renders,
// not the whole card or the whole screen.
import type { Kind } from "../types";
import { relativeTime, staleAfter, useNow } from "../time";

type Props = {
  t: number | undefined; // when the device was last heard from (milliseconds); undefined = never
  kind: Kind; // sets the stale limit: Node 2 really only sends every 5 minutes
  checkStale: boolean; // false for a device whose messages the backend ignores anyway (revoked, not registered)
};

export default function LastSeen({ t, kind, checkStale }: Props) {
  const now = useNow();
  if (t === undefined) return <span>never seen yet</span>;
  const stale = checkStale && now - t > staleAfter(kind);
  return (
    <span>
      last seen {relativeTime(t, now)}
      {/* "online" doesn't always mean fresh: old numbers that aren't updated must look stale */}
      {stale ? <span className="ml-1 font-medium text-amber-700">· stale data</span> : null}
    </span>
  );
}
