// pages/Rules.tsx - the /rules screen: the list of automation rules (GET /rules). Admins and viewers may both look.
import { useEffect, useState } from "react";
import { ApiError, getRules } from "../api";
import type { FullRule } from "../rules";
import RuleList from "../components/RuleList";
import { handleSessionExpired, useLiveStore } from "../store";

export default function RulesPage() {
  const rulesVersion = useLiveStore((s) => s.rulesVersion); // goes up on every "rule-changed" event
  const [rules, setRules] = useState<FullRule[] | null>(null); // null = still loading
  const [error, setError] = useState<string | null>(null);

  // Fetch the list when the screen opens, and again every time rulesVersion changes: a rule has just been created,
  // changed, or deleted from any dashboard. The old list stays on the screen until the new one arrives (no "Loading…" flicker).
  useEffect(() => {
    let ignore = false;
    getRules()
      .then((list) => {
        if (ignore) return;
        setRules(list);
        setError(null);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof ApiError && err.code === 401) return handleSessionExpired();
        setError(err instanceof ApiError ? err.message : "Couldn't load the rules.");
      });
    return () => {
      ignore = true;
    };
  }, [rulesVersion]);

  let content;
  if (error !== null) content = <p className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{error}</p>;
  else if (rules === null) content = <p className="text-slate-500 dark:text-slate-400">Loading the rules…</p>;
  else content = <RuleList rules={rules} />;

  return (
    <>
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Automation rules</h2>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
        The backend runs the rules, even while this dashboard is closed: number rules are evaluated every time a new reading
        arrives, and schedule rules run at their time (WIB).
      </p>
      {content}
    </>
  );
}
