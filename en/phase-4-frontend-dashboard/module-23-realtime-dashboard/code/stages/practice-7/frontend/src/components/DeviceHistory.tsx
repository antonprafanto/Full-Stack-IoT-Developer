// DeviceHistory.tsx - one device's history screen: pick a range (1 hour / 24 hours / 7 days), then see its chart.
// One range = ONE request to the API; the rest (for example marking gaps) is done by the browser.
import { useEffect, useRef, useState } from "react";
import { ApiError, getHistory } from "../api";
import type { Device, HistoryData, HistoryRange } from "../types";
import HistoryChart from "./HistoryChart";
import Picker from "./Picker";

const OPTIONS: { value: HistoryRange; text: string }[] = [
  { value: "1hour", text: "1 hour" },
  { value: "24hours", text: "24 hours" },
  { value: "7days", text: "7 days" },
];

// what one point means in each range (the defaults of Module 18's backend API)
const CAPTIONS: Record<HistoryRange, string> = {
  "1hour": "Raw readings of the last hour (one point = one message)",
  "24hours": "Average per 15 minutes, last 24 hours (point = start of each 15 minutes)",
  "7days": "Average per hour, last 7 days (point = start of each hour)",
};

type Props = {
  device: Device;
  onBack: () => void;
  onSessionExpired: () => void; // called if the backend answers 401 (after the refresh failed as well)
};

export default function DeviceHistory({ device, onBack, onSessionExpired }: Props) {
  const id = device.device_id;
  const [range, setRange] = useState<HistoryRange>("7days");
  const [data, setData] = useState<HistoryData | null>(null); // null = still loading
  const [error, setError] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  // when the history request was sent (milliseconds). useRef: the value is kept without re-rendering the screen.
  const startedAt = useRef(0);

  useEffect(() => {
    let ignore = false;
    startedAt.current = performance.now(); // performance.now() = the page's own millisecond clock, for measuring how long
    getHistory(id, range)
      .then((d) => {
        if (!ignore) setData(d);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof ApiError && err.code === 401) return onSessionExpired();
        setError(err instanceof ApiError ? err.message : "Couldn't load the history.");
      });
    return () => {
      ignore = true;
    };
  }, [id, range, onSessionExpired]);

  // An effect runs AFTER React has finished drawing the new data on the screen: that's when the history counts as "loaded".
  useEffect(() => {
    if (data !== null) setDurationMs(Math.round(performance.now() - startedAt.current));
  }, [data]);

  function selectRange(r: HistoryRange) {
    if (r === range) return;
    setRange(r);
    setData(null); // empty it first, so no chart of the old range looks like the new range
    setError(null);
    setDurationMs(null);
  }

  let content;
  if (error !== null) {
    content = <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{error}</p>;
  } else if (data === null) {
    content = <p className="mt-4 text-slate-500 dark:text-slate-400">Loading the history…</p>;
  } else {
    content = (
      <>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {CAPTIONS[range]} · {data.points.length} points
          {/* time from sending the request until React has finished drawing the chart; readable on a phone without DevTools */}
          {durationMs !== null ? " · loaded in " + durationMs + " ms" : null}
        </p>
        {data.points.length === 0 ? (
          <p className="mt-4 rounded-lg bg-white p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            No data in this range yet.
          </p>
        ) : (
          <HistoryChart data={data} range={range} kind={device.kind} />
        )}
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          The summary history only keeps temperature, humidity, soil moisture, and light.
        </p>
      </>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-11 items-center text-sm font-medium text-teal-700 hover:underline dark:text-teal-300"
      >
        ← Back to the details
      </button>
      <h2 className="min-w-0 text-xl font-semibold break-words text-slate-800 dark:text-slate-100">
        History: {device.name ?? id}
      </h2>
      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
        {device.location ?? "no location yet"} · <span className="font-mono text-xs">{id}</span>
      </p>
      <Picker label="Time range" options={OPTIONS} selected={range} onSelect={selectRange} />
      {content}
    </div>
  );
}
