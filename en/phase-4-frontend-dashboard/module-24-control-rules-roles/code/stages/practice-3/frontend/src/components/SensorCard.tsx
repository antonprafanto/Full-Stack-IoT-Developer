// SensorCard.tsx - one card for one sensor reading: label, number, and unit.
// Reused across the whole dashboard (LEGO bricks): there is one mold, and its content is handed down through props.
type Props = {
  label: string; // the small text on top, for example "Temperature"
  value: number | string | null; // a number or text; null = the sensor failed to read (rule 7)
  unit?: string; // the ? mark = may be left out (the "Motion" card has no unit)
  color?: string; // the Tailwind color class for the number, for example "text-teal-600"
};

export default function SensorCard({ label, value, unit, color = "text-slate-800 dark:text-slate-100" }: Props) {
  return (
    // min-w-0: the card may get narrower to fit its grid column; a label that is too long is cut off with "…" (truncate)
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <p className="truncate text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold">
        {/* ?? = if the value is null, write "—" (not 0: the number 0 is still a valid reading) */}
        <span className={value === null ? "text-slate-400" : color}>{value ?? "—"}</span>
        {/* the unit is only written when there is a number */}
        {unit && value !== null ? <span className="ml-1 text-base font-normal text-slate-400">{unit}</span> : null}
      </p>
    </div>
  );
}
