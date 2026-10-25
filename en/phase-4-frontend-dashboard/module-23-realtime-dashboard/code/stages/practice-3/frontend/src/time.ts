// time.ts - clock matters on the screen: WIB time, "… seconds ago", the stale-data limit, and the 1-second tick.
import { formatDistanceStrict } from "date-fns";
// date-fns writes English by default ("45 seconds ago"), so no locale is imported
import { useEffect, useState } from "react";
import type { Kind } from "./types";

export const MINUTE = 60 * 1000; // in milliseconds, the unit Date.now() uses

// useNow - a ticking clock (the useTime pattern from react.dev). A component that uses it re-renders every second,
// so the text "12 seconds ago" keeps growing. This is a CLOCK, not polling: there's no request to the server.
export function useNow(everyMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), everyMs);
    return () => clearInterval(timer); // cleanup: stop the ticking when the component leaves the screen
  }, [everyMs]);
  return now;
}

// "16:27:10 WIB", whatever the time zone of the laptop or phone (timeZone written out, as in Module 22)
export function wibTime(t: string | number): string {
  return new Date(t).toLocaleTimeString("en-GB", { timeZone: "Asia/Jakarta" }) + " WIB";
}

// relativeTime - "45 seconds ago", "3 minutes ago" (date-fns in English, its default language).
// Under 5 seconds it writes "just now": date-fns would write "0 seconds ago", and a server clock that runs slightly
// ahead of the phone's clock can make the gap negative ("in 2 seconds").
export function relativeTime(t: number, now: number): string {
  if (now - t < 5000) return "just now";
  return formatDistanceStrict(t, now, { addSuffix: true });
}

// When a reading counts as stale. Node 1 and the simulator send every 10 seconds: 30 seconds without news = 3 missed messages.
// Node 2 sends every 5 minutes and only counts as offline after 16 minutes (DATA-CONTRACT.md).
export function staleAfter(kind: Kind): number {
  return kind === "node2" ? 16 * MINUTE : 30 * 1000;
}
