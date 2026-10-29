// pages/RuleForm.tsx - the /rules/new and /rules/:id screen (admin-only, guarded by AdminOnly in App).
// A thin wrapper: it prepares the form's starting content (the default rule, or a stored rule from GET /rules), then uses
// the same RuleForm component for both.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ApiError, getRules } from "../api";
import { defaultRule, toFormValues } from "../rules";
import type { FullRule } from "../rules";
import RuleForm from "../components/RuleForm";
import { handleSessionExpired, useLiveStore } from "../store";

export default function RuleFormPage() {
  const { id } = useParams(); // undefined on /rules/new; the rule number as text on /rules/3
  const ruleId = id === undefined ? null : Number(id);
  const validId = ruleId !== null && Number.isInteger(ruleId) && ruleId >= 1; // a rule number = a whole number from 1
  const devices = useLiveStore((s) => s.devices); // for the device options in the form; null = not loaded yet
  const devicesError = useLiveStore((s) => s.devicesError); // GET /devices failed (for example the database was down for a moment)
  // the rule being edited: null = still loading, "not-found" = its number wasn't found
  const [rule, setRule] = useState<FullRule | "not-found" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!validId) return; // a new rule, or a number that isn't a number: nothing to fetch
    let ignore = false;
    getRules()
      .then((list) => {
        if (!ignore) setRule(list.find((a) => a.id === ruleId) ?? "not-found");
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof ApiError && err.code === 401) return handleSessionExpired();
        setError(err instanceof ApiError ? err.message : "Couldn't load the rules.");
      });
    return () => {
      ignore = true;
    };
  }, [ruleId, validId]);

  const backLink = (
    <Link to="/rules" className="inline-flex min-h-11 items-center text-sm font-medium text-teal-700 hover:underline dark:text-teal-300">
      ← Back to the rule list
    </Link>
  );
  const box = (text: string) => <p className="rounded-lg bg-white p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-200">{text}</p>;

  let content;
  if (devicesError !== null) content = <p className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{devicesError}</p>;
  else if (devices === null) content = <p className="text-slate-600 dark:text-slate-400">Loading devices…</p>;
  else if (ruleId === null) content = <RuleForm id={null} initial={defaultRule(devices)} />;
  else if (!validId || rule === "not-found") content = box("Rule " + id + " not found.");
  else if (error !== null) content = <p className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{error}</p>;
  else if (rule === null) content = <p className="text-slate-600 dark:text-slate-400">Loading the rules…</p>;
  // the form is mounted AFTER its rule has arrived, so its starting content is right at once (no follow-up reset() needed).
  // key = the rule number: another rule means a new form with fresh input.
  else content = <RuleForm key={rule.id} id={rule.id} initial={toFormValues(rule)} />;

  return (
    <>
      {backLink}
      {content}
    </>
  );
}
