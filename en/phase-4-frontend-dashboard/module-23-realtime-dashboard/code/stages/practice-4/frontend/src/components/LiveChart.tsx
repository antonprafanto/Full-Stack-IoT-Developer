// LiveChart.tsx - a line chart of one device's last 5 minutes. Its first points come from the database (GET …/readings?from=…),
// then it grows by itself every time a telemetry event arrives (see receive() in store.ts). Its time axis moves every second.
import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { ApiError, getReadingsSince } from "../api";
import { EMPTY, useLiveStore } from "../store";
import type { Point } from "../types";
import { MINUTE, ticksEvery, useNow, wibHourMinute, wibTime } from "../time";
import Picker from "./Picker";

type Quantity = "temperature" | "light" | "humidity";

// Title, unit, scale, and color of each quantity. The temperature scale follows its data (it doesn't start at 0), because
// a change of 1-2 °C matters and the unit is written in the title. Light and humidity have natural limits, so their scale stays the same.
type Setting = { name: string; title: string; unit: string; domain: [number | "auto", number | "auto"]; color: string };
const QUANTITIES: Record<Quantity, Setting> = {
  temperature: { name: "Temperature", title: "Temperature (°C)", unit: " °C", domain: ["auto", "auto"], color: "var(--color-sky-500)" },
  light: { name: "Light", title: "Light (0 = dark, 4095 = bright)", unit: "", domain: [0, 4095], color: "var(--color-amber-500)" },
  humidity: { name: "Humidity", title: "Air humidity (%)", unit: " %", domain: [0, 100], color: "var(--color-teal-500)" },
};

const OPTIONS: { value: Quantity; text: string }[] = [
  { value: "temperature", text: "Temperature" },
  { value: "light", text: "Light" },
  { value: "humidity", text: "Humidity" },
];

// insertGaps - if two points are further apart than "gap", insert one empty point (null) between them.
// Recharts breaks the line at a null point (connectNulls is false by default), so a missing reading shows as a gap,
// not as a straight line that pretends there's data.
function insertGaps(points: Point[], gap: number): Point[] {
  const result: Point[] = [];
  for (const p of points) {
    const prev = result.at(-1); // the last point already added (undefined for the first point)
    if (prev !== undefined && p.t - prev.t > gap) {
      result.push({ t: prev.t + 1, temperature: null, humidity: null, light: null });
    }
    result.push(p);
  }
  return result;
}

export default function LiveChart({ deviceId }: { deviceId: string }) {
  const [quantity, setQuantity] = useState<Quantity>("temperature");
  const [error, setError] = useState<string | null>(null);
  const points = useLiveStore((s) => s.windows[deviceId] ?? EMPTY); // ?? EMPTY, not ?? [] (see store.ts)
  const live = useLiveStore((s) => s.connection === "live");
  const fillWindow = useLiveStore((s) => s.fillWindow);
  const now = useNow();

  // The first points: readings of the last 5 minutes from the database. Repeated every time the connection is Live again,
  // because messages missed while disconnected aren't sent again by the server (the same point isn't stored twice: see merge()).
  useEffect(() => {
    if (!live) return;
    let ignore = false;
    getReadingsSince(deviceId, 5)
      .then((answer) => {
        if (ignore) return;
        fillWindow(deviceId, answer.readings);
        setError(null);
      })
      .catch((err) => {
        if (!ignore) setError(err instanceof ApiError ? err.message : "Couldn't fill the chart.");
      });
    return () => {
      ignore = true;
    };
  }, [deviceId, live, fillWindow]);

  const q = QUANTITIES[quantity];
  const start = now - 5 * MINUTE;
  // more than 25 seconds without a reading = at least 2 missed 10-second messages: the line is broken there
  const data = insertGaps(points, 25 * 1000);
  // the store only drops old points when a new point arrives, so count the points still inside the last 5 minutes
  const anyVisible = points.some((p) => p.t >= start);
  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-800">{q.title} · last 5 minutes</h3>
        <Picker label="Chart quantity" options={OPTIONS} selected={quantity} onSelect={setQuantity} />
      </div>
      <div className="mt-3 text-xs">
        {/* responsive + style: the width follows the box (neat on a phone), the height stays 240 px */}
        <LineChart responsive data={data} style={{ width: "100%", height: 240 }} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-slate-200)" />
          {/* The time axis is a NUMBER (milliseconds), not a category: the space between points matches their time difference.
              domain = exactly the last 5 minutes; ticks = a label at every whole minute, so they don't jump around. */}
          <XAxis
            dataKey="t"
            type="number"
            domain={[start, now]}
            allowDataOverflow
            ticks={ticksEvery(start, now, MINUTE)}
            tickFormatter={wibHourMinute}
          />
          <YAxis domain={q.domain} width={44} />
          <Tooltip labelFormatter={(t) => wibTime(Number(t))} />
          {/* isAnimationActive={false}: the default 1.5-second animation makes a new point look late */}
          <Line
            dataKey={quantity}
            name={q.name}
            unit={q.unit}
            stroke={q.color}
            strokeWidth={2}
            dot={{ r: 2, fill: q.color }}
            isAnimationActive={false}
          />
        </LineChart>
      </div>
      {anyVisible ? null : (
        <p className="mt-2 text-sm text-slate-500">
          {live ? "No readings in the last 5 minutes." : "Waiting for the live connection…"}
        </p>
      )}
      {error !== null ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </section>
  );
}
