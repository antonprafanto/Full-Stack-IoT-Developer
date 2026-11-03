// UpdateHistory.tsx - the firmware update history of one device (GET /devices/:id/updates, Module 28), inside a Fleet
// card. Closed by default (<details>), and only fetched from the server when it is opened: a Fleet screen with many
// devices doesn't need to ask for all their histories at once.
import { useEffect, useState } from "react";
import { getUpdateHistory, ApiError } from "../api";
import { UPDATE_TEXT } from "../fleet";
import { handleSessionExpired } from "../store";
import type { Update } from "../types";
import { wibDateTime } from "../time";

type Props = {
  deviceId: string;
  version: string; // changes every time the last update changes: a history that is open is fetched again
};

export default function UpdateHistory({ deviceId, version }: Props) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<Update[] | null>(null); // null = not loaded yet
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return; // closed: asks for nothing
    let ignore = false;
    getUpdateHistory(deviceId)
      .then((list) => {
        if (ignore) return;
        setHistory(list);
        setError(null);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof ApiError && err.code === 401) return handleSessionExpired();
        setError(err instanceof ApiError ? err.message : "Couldn't load the update history.");
      });
    return () => {
      ignore = true;
    };
  }, [open, deviceId, version]);

  let content;
  if (error !== null) content = <p className="text-red-700 dark:text-red-300">{error}</p>;
  else if (history === null) content = <p className="text-slate-600 dark:text-slate-400">Loading the history…</p>;
  else if (history.length === 0) content = <p className="text-slate-600 dark:text-slate-400">Never updated over the air.</p>;
  else {
    content = (
      <ol className="space-y-1">
        {history.map((u) => (
          <li key={u.id} className="break-words">
            <span className="font-mono">
              {u.from ?? "?"} → {u.to}
            </span>{" "}
            <span className="font-medium">{UPDATE_TEXT[u.status].text}</span>
            <span className="text-slate-600 dark:text-slate-400">
              {" "}
              · {wibDateTime(Date.parse(u.created_at))}
              {u.message !== null ? " · " + u.message : ""}
            </span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    // onToggle: the browser calls it every time the <details> opens or closes
    <details className="mt-2 text-sm" onToggle={(e) => setOpen(e.currentTarget.open)}>
      {/* py-3: about 44 px high, easy to tap with a thumb (no flex, so the browser's own open/close triangle still shows) */}
      <summary className="cursor-pointer py-3 font-medium text-teal-700 dark:text-teal-300">
        Update history
      </summary>
      <div className="mt-1 rounded-lg bg-slate-50 p-2 text-slate-800 dark:bg-slate-900 dark:text-slate-200">{content}</div>
    </details>
  );
}
