// CompareHistory.tsx - Module 23 Challenge, Level 3 answer key: the average temperature per hour of TWO devices in one
// 7-day chart. Two requests are sent at the same time (Promise.all), then their answers are combined by bucket start (the time field).
import { useEffect, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { ApiError, getHistory } from "../api";
import { useLiveStore } from "../store";
import type { Device, HistoryData } from "../types";
import { DAY, HOUR, ticksEvery, wibDateTime, wibDayDate } from "../time";

// one chart row: the time (milliseconds) + the average temperature of device A and B; null = no data for that hour
type Row = { t: number; a: number | null; b: number | null };

// combine - two 7-day histories (1-hour buckets) become one array of rows, in time order.
// An hour that only one device has still goes in, with null for the other device (its line breaks there).
// An hour that is empty for BOTH devices gets one null row, so the lines don't join across the gap.
function combine(a: HistoryData, b: HistoryData): Row[] {
  const byTime = new Map<number, Row>(); // key = the bucket's start time in milliseconds
  for (const p of a.points) {
    const t = Date.parse(p.time);
    byTime.set(t, { t, a: p.avg_temp, b: null });
  }
  for (const p of b.points) {
    const t = Date.parse(p.time);
    const existing = byTime.get(t);
    if (existing !== undefined) existing.b = p.avg_temp; // the same hour is already there from device A: complete it
    else byTime.set(t, { t, a: null, b: p.avg_temp });
  }
  const sorted = [...byTime.values()].sort((x, y) => x.t - y.t);
  const result: Row[] = [];
  for (const row of sorted) {
    const prev = result.at(-1);
    if (prev !== undefined && row.t - prev.t > 1.5 * HOUR) result.push({ t: prev.t + 1, a: null, b: null });
    result.push(row);
  }
  return result;
}

// a device picker box (the browser's own <select> element)
function DevicePicker(props: { label: string; list: Device[]; value: string; onSelect: (id: string) => void }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
      {props.label}
      <select
        value={props.value}
        onChange={(e) => props.onSelect(e.target.value)}
        className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      >
        {props.list.map((p) => (
          <option key={p.device_id} value={p.device_id}>
            {p.name ?? p.device_id}
          </option>
        ))}
      </select>
    </label>
  );
}

type Props = {
  onBack: () => void;
  onSessionExpired: () => void; // called if the backend answers 401 (after the refresh failed as well)
};

export default function CompareHistory({ onBack, onSessionExpired }: Props) {
  const devices = useLiveStore((s) => s.devices); // the list from the Device List screen; null = not loaded yet
  // default: the first two devices in the list
  const [idA, setIdA] = useState(() => devices?.[0]?.device_id ?? "");
  const [idB, setIdB] = useState(() => devices?.[1]?.device_id ?? "");
  const [data, setData] = useState<[HistoryData, HistoryData] | null>(null); // null = still loading
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (idA === "" || idB === "" || idA === idB) return;
    let ignore = false;
    // Two requests AT THE SAME TIME, not one after the other: Promise.all waits for both to finish,
    // and fails at once as soon as one of them fails.
    Promise.all([getHistory(idA, "7days"), getHistory(idB, "7days")])
      .then((both) => {
        if (!ignore) setData(both);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof ApiError && err.code === 401) return onSessionExpired();
        setError(err instanceof ApiError ? err.message : "Couldn't load the history.");
      });
    return () => {
      ignore = true;
    };
  }, [idA, idB, onSessionExpired]);

  // a new choice: empty the old chart first, so it doesn't look like the new pair's chart
  function selectA(id: string) {
    setIdA(id);
    setData(null);
    setError(null);
  }
  function selectB(id: string) {
    setIdB(id);
    setData(null);
    setError(null);
  }

  const list = devices ?? [];
  const nameOf = (id: string) => list.find((p) => p.device_id === id)?.name ?? id;

  let content;
  if (list.length < 2) {
    content = <p className="mt-4 text-slate-600 dark:text-slate-300">At least two devices in the list are needed to compare.</p>;
  } else if (idA === idB) {
    content = <p className="mt-4 text-slate-600 dark:text-slate-300">Pick two different devices.</p>;
  } else if (error !== null) {
    content = <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{error}</p>;
  } else if (data === null) {
    content = <p className="mt-4 text-slate-500 dark:text-slate-400">Loading the history…</p>;
  } else {
    const [a, b] = data;
    const rows = combine(a, b);
    // X axis = both ranges together (the "now" of the two answers can differ by a few milliseconds)
    const from = Math.min(Date.parse(a.from), Date.parse(b.from));
    const to = Math.max(Date.parse(a.to), Date.parse(b.to));
    content = (
      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Average temperature per hour (°C) · 7 days</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {nameOf(idA)}: {a.points.length} points · {nameOf(idB)}: {b.points.length} points
        </p>
        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          <LineChart responsive data={rows} style={{ width: "100%", height: 280 }} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-color)" />
            <XAxis
              dataKey="t"
              type="number"
              domain={[from, to]}
              ticks={ticksEvery(from, to, DAY)}
              tickFormatter={wibDayDate}
              tick={{ fill: "currentColor" }}
              stroke="var(--grid-color)"
            />
            <YAxis domain={["auto", "auto"]} width={44} tick={{ fill: "currentColor" }} stroke="var(--grid-color)" />
            <Tooltip
              labelFormatter={(t) => wibDateTime(Number(t))}
              contentStyle={{ backgroundColor: "var(--panel-color)", borderColor: "var(--grid-color)", borderRadius: 8 }}
            />
            {/* legend = the device name next to a sample of its line: color is never alone. Its text uses the normal
                text color, because orange text on a white background is hard to read. */}
            <Legend formatter={(text) => <span className="text-slate-700 dark:text-slate-200">{text}</span>} />
            {/* blue and orange: a color pair that most color-blind people can still tell apart */}
            <Line dataKey="a" name={nameOf(idA)} unit=" °C" stroke="var(--color-sky-500)" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line dataKey="b" name={nameOf(idB)} unit=" °C" stroke="var(--color-amber-500)" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </div>
        {rows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No 7-day data for these two devices yet.</p>
        ) : null}
      </section>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-11 items-center text-sm font-medium text-teal-700 hover:underline dark:text-teal-300"
      >
        ← Back to the list
      </button>
      <h2 className="mb-3 text-xl font-semibold text-slate-800 dark:text-slate-100">Compare 7-day history</h2>
      {/* mobile first: the two picker boxes stacked on a phone, side by side from the sm width */}
      <div className="grid gap-3 sm:grid-cols-2">
        <DevicePicker label="First device (blue line)" list={list} value={idA} onSelect={selectA} />
        <DevicePicker label="Second device (orange line)" list={list} value={idB} onSelect={selectB} />
      </div>
      {content}
    </div>
  );
}
