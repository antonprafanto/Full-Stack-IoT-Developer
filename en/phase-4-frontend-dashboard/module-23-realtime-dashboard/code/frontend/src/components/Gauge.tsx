// Gauge.tsx - a half-circle gauge (Recharts RadialBarChart) for a quantity with clear limits: 0-100 %.
// The scale MUST be written (domain 0-100). Without it, Recharts measures the arc against its own value, and the gauge
// always looks full even when the value is only 14 %.
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

type Props = {
  label: string; // for example "Soil moisture"
  value: number | null; // percent; null = the sensor failed to read: an empty arc and the number "—"
  lowThreshold?: number; // below this number: a warning color + the word "low"
};

export default function Gauge({ label, value, lowThreshold }: Props) {
  const low = value !== null && lowThreshold !== undefined && value < lowThreshold;
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <p className="truncate text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <div className="relative mx-auto mt-2 max-w-48">
        {/* startAngle 180 -> endAngle 0 = a half circle from left to right; cy="100%" = its center sits on the bottom edge */}
        <RadialBarChart
          responsive
          style={{ width: "100%", aspectRatio: 2 }}
          data={[{ value: value ?? 0 }]}
          startAngle={180}
          endAngle={0}
          cy="100%"
          innerRadius="140%"
          outerRadius="200%"
        >
          {/* the scale stays at 0-100: without this line, the arc is always full */}
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            dataKey="value"
            background={{ fill: "var(--track-color)" }} // the gray track behind the arc
            cornerRadius={6}
            fill={low ? "var(--color-amber-500)" : "var(--color-teal-500)"}
            isAnimationActive={false}
          />
        </RadialBarChart>
        {/* the number + unit in the middle of the arc */}
        <p className="absolute inset-x-0 bottom-0 text-center text-2xl font-semibold text-slate-800 dark:text-slate-100">
          {value ?? "—"}
          {value !== null ? <span className="ml-0.5 text-base font-normal text-slate-400">%</span> : null}
        </p>
      </div>
      {/* color is never alone: the "low" state is written too */}
      {low ? (
        <p className="mt-1 text-center text-sm font-medium text-amber-700 dark:text-amber-400">low (below {lowThreshold} %)</p>
      ) : null}
    </div>
  );
}
