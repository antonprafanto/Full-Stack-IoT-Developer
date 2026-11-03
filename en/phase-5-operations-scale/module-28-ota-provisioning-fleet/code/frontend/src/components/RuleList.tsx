// RuleList.tsx - automation rules as cards holding plain sentences, not JSON (Module 24).
// Admins and viewers see the same list: a viewer can tell why the fan turned on by itself. Practice 8: admins get an
// "Edit" link on every card (deactivating and deleting are in the edit form).
import { Link } from "react-router";
import type { FullRule } from "../rules";
import { describeRule } from "../rules";
import { useAdmin, useLiveStore } from "../store";
import { wibDateTime } from "../time";

type Props = {
  rules: FullRule[];
};

export default function RuleList({ rules }: Props) {
  const admin = useAdmin();
  const devices = useLiveStore((s) => s.devices);
  // device_id -> the name the admin gave it (Module 21); an unknown device is still written as its device_id
  const nameOf = (id: string) => devices?.find((p) => p.device_id === id)?.name ?? id;

  if (rules.length === 0) {
    return <p className="rounded-lg bg-white p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300">No automation rules yet.</p>;
  }

  return (
    <ul className="grid gap-3">
      {rules.map((a) => (
        <li key={a.id} className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* the rule's name is filled in by the admin: shown as JSX text, not HTML */}
            <h3 className="min-w-0 font-semibold break-words text-slate-800 dark:text-slate-100">{a.name}</h3>
            {/* the color always comes with text: "Active" / "Inactive" */}
            <span
              className={
                "rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap " +
                (a.active
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                  : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200")
              }
            >
              {a.active ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{describeRule(a, nameOf)}</p>
          {/* next_run = when an active schedule rule runs again (UTC from the backend), written in WIB time */}
          {a.next_run !== null ? (
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Runs again: {wibDateTime(Date.parse(a.next_run))}</p>
          ) : null}
          {admin ? (
            // aria-label names the rule: a screen reader doesn't only hear "Edit, Edit, Edit"
            <Link
              to={"/rules/" + a.id}
              aria-label={"Edit rule " + a.name}
              className="mt-2 inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              Edit
            </Link>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
