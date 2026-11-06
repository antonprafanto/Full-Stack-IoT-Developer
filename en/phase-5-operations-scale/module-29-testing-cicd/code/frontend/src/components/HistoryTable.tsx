// HistoryTable.tsx - the history as a table, newest first, 24 rows per page. The pages are split in the browser:
// all the data is already at hand (±360 rows for 1 hour of readings every 10 seconds, plus immediate sends; API limit 1,000).
import { useState } from "react";
import type { SummaryPoint } from "../types";
import { wibDateTime, wibTime } from "../time";

const PER_PAGE = 24;

type Props = {
  points: SummaryPoint[]; // oldest first, like the API answer
  raw: boolean; // true = raw readings (1 hour): no lowest-highest and reading-count columns
};

// numbers on the screen use a decimal point, as on the sensor cards; null = "—"
function num(value: number | null): string {
  return value === null ? "—" : String(value);
}

export default function HistoryTable({ points, raw }: Props) {
  const [page, setPage] = useState(1);
  const newestFirst = [...points].reverse(); // a reversed copy: the original order (old -> new) isn't changed
  const pageCount = Math.max(1, Math.ceil(newestFirst.length / PER_PAGE));
  const rows = newestFirst.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const cellClass = "px-3 py-2 text-right whitespace-nowrap";
  const buttonClass =
    "min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm hover:bg-slate-50 disabled:opacity-40 " +
    "dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700";

  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h3 className="font-semibold text-slate-800 dark:text-slate-100">Table (newest first)</h3>
      {/* overflow-x-auto: on a phone, wide rows scroll inside their own box; the page itself doesn't scroll along */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm text-slate-700 dark:text-slate-200">
          <thead className="text-xs text-slate-500 dark:text-slate-400">
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="px-3 py-2 text-left whitespace-nowrap">Time</th>
              <th className={cellClass}>Temperature °C</th>
              {raw ? null : <th className={cellClass}>Lowest–highest</th>}
              <th className={cellClass}>Humidity %</th>
              <th className={cellClass}>Soil %</th>
              <th className={cellClass}>Light</th>
              {raw ? null : <th className={cellClass}>Readings</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.time} className="border-b border-slate-100 dark:border-slate-700/50">
                <td className="px-3 py-2 whitespace-nowrap">{raw ? wibTime(p.time) : wibDateTime(Date.parse(p.time))}</td>
                <td className={cellClass}>{num(p.avg_temp)}</td>
                {raw ? null : (
                  <td className={cellClass}>
                    {num(p.min_temp)}–{num(p.max_temp)}
                  </td>
                )}
                <td className={cellClass}>{num(p.avg_humidity)}</td>
                <td className={cellClass}>{num(p.avg_soil)}</td>
                <td className={cellClass}>{num(p.avg_light)}</td>
                {raw ? null : <td className={cellClass}>{p.reading_count}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600 dark:text-slate-300">
        <button type="button" className={buttonClass} disabled={page === 1} onClick={() => setPage(page - 1)}>
          ← Previous
        </button>
        <span>
          Page {page} of {pageCount}
        </span>
        <button type="button" className={buttonClass} disabled={page === pageCount} onClick={() => setPage(page + 1)}>
          Next →
        </button>
      </div>
    </section>
  );
}
