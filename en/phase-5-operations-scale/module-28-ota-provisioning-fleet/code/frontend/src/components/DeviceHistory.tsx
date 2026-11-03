// DeviceHistory.tsx - one device's history screen: pick a range (1 hour / 24 hours / 7 days), then see the chart, the paged
// table, and download a CSV. One range = ONE request to the API; the rest (gaps, pages, CSV) is done by the browser.
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ApiError, getHistory } from "../api";
import { csvTime, downloadCsv, toCsv } from "../csv";
import type { Device, HistoryData, HistoryRange } from "../types";
import HistoryChart from "./HistoryChart";
import Picker from "./Picker";
import HistoryTable from "./HistoryTable";

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
  onSessionExpired: () => void; // called if the backend answers 401 (after the refresh failed as well)
};

export default function DeviceHistory({ device, onSessionExpired }: Props) {
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

  // Download every row of this range (not only the page of rows on the screen), oldest first.
  function download() {
    if (data === null) return;
    const deviceName = device.name ?? id;
    const header = [
      "time_wib",
      "device",
      "avg_temp_c",
      "min_temp_c",
      "max_temp_c",
      "avg_humidity_percent",
      "avg_soil_percent",
      "avg_light",
      "reading_count",
    ];
    const rows = data.points.map((p) => [
      csvTime(p.time),
      deviceName,
      p.avg_temp,
      p.min_temp,
      p.max_temp,
      p.avg_humidity,
      p.avg_soil,
      p.avg_light,
      p.reading_count,
    ]);
    // the file name, for example history-f00d00000001-7days-2026-10-24.csv (today's date in WIB)
    downloadCsv("history-" + id + "-" + range + "-" + csvTime(Date.now()).slice(0, 10) + ".csv", toCsv([header, ...rows]));
  }

  let content;
  if (error !== null) {
    content = <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{error}</p>;
  } else if (data === null) {
    content = <p className="mt-4 text-slate-600 dark:text-slate-400">Loading the history…</p>;
  } else {
    content = (
      <>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          {CAPTIONS[range]} · {data.points.length} points
          {/* time from sending the request until React has finished drawing the chart; readable on a phone without DevTools */}
          {durationMs !== null ? " · loaded in " + durationMs + " ms" : null}
        </p>
        {data.points.length === 0 ? (
          <p className="mt-4 rounded-lg bg-white p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            No data in this range yet.
          </p>
        ) : (
          <>
            <HistoryChart data={data} range={range} kind={device.kind} />
            {/* key = range: a safety net so the rows of another range always start again from page 1 (while loading,
                selectRange has already emptied the data, so the old rows are already gone from the screen) */}
            <HistoryTable key={range} points={data.points} raw={range === "1hour"} />
            <button
              type="button"
              onClick={download}
              className="mt-4 min-h-11 rounded-lg bg-teal-700 px-4 font-medium text-white hover:bg-teal-800"
            >
              Download CSV
            </button>
          </>
        )}
        <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
          The summary history only keeps temperature, humidity, soil moisture, and light.
        </p>
      </>
    );
  }

  return (
    <div>
      {/* Module 24: a link to this device's details address (no longer a button that changes state in App) */}
      <Link
        to={"/devices/" + id}
        className="inline-flex min-h-11 items-center text-sm font-medium text-teal-700 hover:underline dark:text-teal-300"
      >
        ← Back to the details
      </Link>
      <h2 className="min-w-0 text-xl font-semibold break-words text-slate-800 dark:text-slate-100">
        History: {device.name ?? id}
      </h2>
      <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
        {device.location ?? "no location yet"} · <span className="font-mono text-xs">{id}</span>
      </p>
      <Picker label="Time range" options={OPTIONS} selected={range} onSelect={selectRange} />
      {content}
    </div>
  );
}
