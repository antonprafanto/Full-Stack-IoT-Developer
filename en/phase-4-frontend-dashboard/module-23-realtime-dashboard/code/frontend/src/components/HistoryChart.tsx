// HistoryChart.tsx - a history chart of one quantity: the average line (for temperature also the lowest and highest),
// with honest gaps. Hours without data show as a gap, not as a straight line that pretends there's data.
import { useState } from "react";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import type { HistoryData, HistoryRange, Kind } from "../types";
import { DAY, HOUR, MINUTE, ticksEvery, wibDateTime, wibDayDate, wibHourMinute, wibTime } from "../time";
import Picker from "./Picker";

// The backend only summarizes these four quantities per 15 minutes and per hour.
type Quantity = "temperature" | "humidity" | "soil" | "light";
type Setting = {
  name: string;
  title: string;
  unit: string;
  column: "avg_temp" | "avg_humidity" | "avg_soil" | "avg_light";
  domain: [number | "auto", number | "auto"];
  color: string;
};
// The temperature scale follows its data (its unit is in the title); the other quantities have natural limits, so their scale stays the same.
const QUANTITIES: Record<Quantity, Setting> = {
  temperature: { name: "Temperature", title: "Temperature (°C)", unit: " °C", column: "avg_temp", domain: ["auto", "auto"], color: "var(--color-sky-500)" },
  humidity: {
    name: "Humidity",
    title: "Air humidity (%)",
    unit: " %",
    column: "avg_humidity",
    domain: [0, 100],
    color: "var(--color-teal-500)",
  },
  soil: { name: "Soil", title: "Soil moisture (%)", unit: " %", column: "avg_soil", domain: [0, 100], color: "var(--color-lime-600)" },
  light: {
    name: "Light",
    title: "Light (0 = dark, 4095 = bright)",
    unit: "",
    column: "avg_light",
    domain: [0, 4095],
    color: "var(--color-amber-500)",
  },
};

const OPTIONS: { value: Quantity; text: string }[] = [
  { value: "temperature", text: "Temperature" },
  { value: "humidity", text: "Humidity" },
  { value: "soil", text: "Soil" },
  { value: "light", text: "Light" },
];

// For each range: the largest distance between two points that still count as joined (more than this = some data is
// missing), the distance between time-axis labels, and the label format.
const AXIS: Record<HistoryRange, { gap: number; step: number; label: (t: number) => string }> = {
  "1hour": { gap: 25 * 1000, step: 10 * MINUTE, label: wibHourMinute }, // a reading every 10 seconds: 2 lost messages = a gap
  "24hours": { gap: 1.5 * 15 * MINUTE, step: 3 * HOUR, label: wibHourMinute }, // 15-minute buckets
  "7days": { gap: 1.5 * HOUR, step: DAY, label: wibDayDate }, // 1-hour buckets; a label at every 00:00 WIB
};

type Row = { t: number; avg: number | null; min: number | null; max: number | null };

// insertGaps - if two points are further apart than "gap", insert one empty point (null) between them.
// Recharts breaks the line at a null point (connectNulls is false by default). It works the same as insertGaps in
// LiveChart.tsx (Practice 4); only the shape of its rows differs.
function insertGaps(rows: Row[], gap: number): Row[] {
  const result: Row[] = [];
  for (const r of rows) {
    const prev = result.at(-1); // the last point already added (undefined for the first point)
    if (prev !== undefined && r.t - prev.t > gap) {
      result.push({ t: prev.t + 1, avg: null, min: null, max: null });
    }
    result.push(r);
  }
  return result;
}

type Props = {
  data: HistoryData;
  range: HistoryRange;
  kind: Kind; // Node 2 has no light sensor
};

export default function HistoryChart({ data, range, kind }: Props) {
  const [quantity, setQuantity] = useState<Quantity>("temperature");
  const q = QUANTITIES[quantity];
  const axis = AXIS[range];
  const from = Date.parse(data.from);
  const to = Date.parse(data.to);
  // the lowest and highest only exist in the temperature summary (raw 1-hour readings don't have them)
  const minMax = quantity === "temperature" && range !== "1hour";
  const rows = insertGaps(
    data.points.map((p) => ({
      t: Date.parse(p.time),
      avg: p[q.column],
      min: minMax ? p.min_temp : null,
      max: minMax ? p.max_temp : null,
    })),
    axis.gap,
  );

  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{q.title}</h3>
        <Picker
          label="History quantity"
          options={kind === "node2" ? OPTIONS.filter((p) => p.value !== "light") : OPTIONS}
          selected={quantity}
          onSelect={setQuantity}
        />
      </div>
      <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        <LineChart responsive data={rows} style={{ width: "100%", height: 260 }} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-color)" />
          {/* domain = the range asked for (from … to): a part without data at the start or end still looks empty */}
          <XAxis
            dataKey="t"
            type="number"
            domain={[from, to]}
            ticks={ticksEvery(from, to, axis.step)}
            tickFormatter={axis.label}
            tick={{ fill: "currentColor" }}
            stroke="var(--grid-color)"
          />
          <YAxis domain={q.domain} width={44} tick={{ fill: "currentColor" }} stroke="var(--grid-color)" />
          <Tooltip
            labelFormatter={(t) => (range === "1hour" ? wibTime(Number(t)) : wibDateTime(Number(t)))}
            contentStyle={{ backgroundColor: "var(--panel-color)", borderColor: "var(--grid-color)", borderRadius: 8 }}
          />
          {minMax ? (
            <Line dataKey="max" name="Highest" unit={q.unit} stroke={q.color} strokeWidth={1} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
          ) : null}
          <Line
            dataKey="avg"
            name={range === "1hour" ? q.name : q.name + " average"}
            unit={q.unit}
            stroke={q.color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          {minMax ? (
            <Line dataKey="min" name="Lowest" unit={q.unit} stroke={q.color} strokeWidth={1} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
          ) : null}
        </LineChart>
      </div>
      {minMax ? (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Thick line = average; dashed lines = lowest and highest.</p>
      ) : null}
    </section>
  );
}
