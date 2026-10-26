// ScheduleBuilder.tsx - Module 24 Challenge, Level 3 (one possible answer): pick a time and days with ordinary boxes, then
// turn them into a 5-field cron for the schedule field of the rule form. The result is checked with the ScheduleCondition
// schema that is the SAME as the backend's (the copy in schemas/rule-basics.ts) before it may be used.
import { useId, useState } from "react";
import type { ReactNode } from "react";
import { DAY_NAMES, describeCron, makeCron } from "../rules";
import { ScheduleCondition } from "../schemas/rule-basics";

// shown Monday first, Sunday last (the numbers stay cron numbers: 1 = Monday, 0 = Sunday)
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

type Props = {
  onUse: (cron: string) => void; // called with the finished cron, for example "30 17 * * 1,3"
};

export default function ScheduleBuilder({ onUse }: Props) {
  const [time, setTime] = useState("06:00"); // the value of <input type="time">: "HH:MM", or "" if it was emptied
  const [days, setDays] = useState<number[]>([]); // the ticked day numbers; empty = every day
  const timeId = useId();

  const match = /^(\d{2}):(\d{2})$/.exec(time);
  const cron = match ? makeCron(Number(match[1]), Number(match[2]), days) : "";
  // the same schema as the backend: kind "schedule" + a 5-field cron
  const result = ScheduleCondition.safeParse({ kind: "schedule", cron });
  const valid = match !== null && result.success;
  let note: ReactNode;
  if (match === null) note = "Fill in the time first.";
  else if (!result.success) note = result.error.issues[0]?.message ?? "Invalid schedule.";
  else note = (
    <>
      {describeCron(cron)} · cron <code className="font-mono">{cron}</code>
    </>
  );

  // tick/untick one day. Always a NEW array (not a push onto the old one), so React knows something changed.
  function toggle(day: number) {
    setDays((old) => (old.includes(day) ? old.filter((h) => h !== day) : [...old, day]));
  }

  return (
    <fieldset className="mt-4 rounded-lg border border-slate-300 p-3 dark:border-slate-600">
      <legend className="px-1 text-sm font-semibold text-slate-800 dark:text-slate-100">Schedule builder</legend>
      <label htmlFor={timeId} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Time (WIB)
      </label>
      <input
        id={timeId}
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="mt-1 min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-teal-700 focus:outline-2 focus:outline-offset-2 focus:outline-teal-700 dark:border-slate-600 dark:bg-slate-900 dark:focus:border-teal-400 dark:focus:outline-teal-400"
      />
      <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">Days (none ticked = every day)</p>
      <div className="mt-1 flex flex-wrap gap-x-4">
        {DAY_ORDER.map((day) => (
          <label key={day} className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input type="checkbox" checked={days.includes(day)} onChange={() => toggle(day)} className="size-5 accent-teal-700" />
            {DAY_NAMES[day]}
          </label>
        ))}
      </div>
      {/* role="status": its result is read out by screen readers every time it changes */}
      <p role="status" className="mt-2 text-sm text-slate-700 dark:text-slate-200">
        {note}
      </p>
      <button
        type="button"
        onClick={() => onUse(cron)}
        disabled={!valid}
        className="mt-2 min-h-11 rounded-lg border border-teal-600 px-4 text-sm font-medium text-teal-800 hover:bg-teal-50 disabled:opacity-60 dark:border-teal-400 dark:text-teal-200 dark:hover:bg-teal-950"
      >
        Use this schedule
      </button>
    </fieldset>
  );
}
