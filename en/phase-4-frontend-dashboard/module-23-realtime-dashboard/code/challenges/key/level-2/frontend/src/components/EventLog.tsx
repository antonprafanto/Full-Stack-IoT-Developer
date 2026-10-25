// EventLog.tsx - Module 23 Challenge, Level 2 answer key: a live event log.
// Every time the backend records an event (a device online/offline, a command, a rule, a schedule), an "event" arrives
// through Socket.IO at EVERY connected dashboard, then shows up here. It only holds the last 10 events SINCE THE
// PAGE WAS OPENED: the backend has no GET route for old events, and the list is gone when the page is reloaded.
import { useEffect, useState } from "react";
import { socket } from "../socket";
import type { SavedEvent } from "../types";
import { wibTime } from "../time";

const LIMIT = 10; // events kept; older ones are dropped

export default function EventLog() {
  const [events, setEvents] = useState<SavedEvent[]>([]); // newest first

  // Subscribe to "event" while this component is shown, stop in the cleanup.
  useEffect(() => {
    // a named function: the cleanup removes EXACTLY this listener, not every "event" listener
    function onEvent(ev: SavedEvent) {
      // a NEW array: the new event in front, then cut to 10. The old array isn't changed.
      setEvents((old) => [ev, ...old].slice(0, LIMIT));
    }
    socket.on("event", onEvent);
    // StrictMode in dev mode: add, remove, add again. Still only ONE listener, so no event shows up twice.
    return () => {
      socket.off("event", onEvent);
    };
  }, []);

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h2 className="font-semibold text-slate-800 dark:text-slate-100">Latest events</h2>
      {events.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          No events since this page was opened. Try stopping the simulator (Ctrl + C) or unplugging Node 1's USB, then
          start it again.
        </p>
      ) : (
        <ol className="mt-2 divide-y divide-slate-100 text-sm dark:divide-slate-700">
          {events.map((ev) => (
            // id = its row number in the backend's events log, always unique
            <li key={ev.id} className="flex flex-wrap gap-x-3 py-2">
              <span className="shrink-0 font-mono text-xs leading-5 text-slate-500 dark:text-slate-400">{wibTime(ev.occurred_at)}</span>
              {/* the message is shown as plain JSX text: HTML code inside it (for example from a device name) isn't run */}
              <span className="min-w-0 break-words text-slate-700 dark:text-slate-200">{ev.message}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
