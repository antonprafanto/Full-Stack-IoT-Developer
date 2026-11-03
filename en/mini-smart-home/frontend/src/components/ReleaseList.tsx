// ReleaseList.tsx - the firmware releases stored on the server (GET /firmware, Module 28): version, size, SHA-256, notes, and
// its canary summary. An admin gets two buttons per release: "Update canary" (the devices marked canary first), then
// "Update all", which only opens after at least one canary SUCCEEDED with that version (the server
// decides: can_update_all). Test releases and withdrawn releases have no buttons: a test release only goes through Update on the
// card of one device.
import { useState } from "react";
import { updateMany } from "../api";
import { errorMessage, sizeText } from "../fleet";
import { toast } from "../toast";
import type { ReleaseList as List, FleetResult, FullRelease } from "../types";
import { wibDateTime } from "../time";
import ErrorBox from "./ErrorBox";
import ConfirmButton from "./ConfirmButton";

const SHAPE = "rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

// the sentence for one device that was sent the command
const SEND_TEXT: Record<string, string> = {
  accepted: "accepted the command",
  "no-ack": "didn't answer within 5 seconds",
  rejected: "refused",
  "not-sent": "not sent",
};

function ReleaseCard({ r, latest, admin, onChange }: { r: FullRelease; latest: boolean; admin: boolean; onChange: () => void }) {
  const [result, setResult] = useState<FleetResult | null>(null); // the last "Update canary/all" result for this release
  const [error, setError] = useState<string | null>(null); // the last error, shown until Close (ErrorBox)

  async function send(target: "canary" | "all") {
    try {
      const out = await updateMany(r.version, target);
      setResult(out);
      setError(null);
      toast(
        "Command " + r.version + " sent to " + out.sent.length + " device(s)" + (out.skipped.length > 0 ? ", " + out.skipped.length + " skipped." : "."),
        out.sent.length > 0 ? "success" : "info",
      );
      onChange();
    } catch (err) {
      setError(errorMessage(err, "The update command couldn't be sent."));
    }
  }

  return (
    <li className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">Node 1 {r.version}</span>
        {latest ? <span className={SHAPE + " bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"}>latest</span> : null}
        {r.test ? <span className={SHAPE + " bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"}>test</span> : null}
        {r.withdrawn_at !== null ? <span className={SHAPE + " bg-red-600 text-white"}>withdrawn</span> : null}
      </div>
      {r.notes !== null ? <p className="mt-1 text-sm break-words text-slate-700 dark:text-slate-200">{r.notes}</p> : null}
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        {sizeText(r.size)} · uploaded {wibDateTime(Date.parse(r.created_at))}
      </p>
      {/* break-all: 64 hexadecimal digits without spaces still wrap on a phone screen */}
      <p className="mt-1 font-mono text-xs break-all text-slate-600 dark:text-slate-400">sha256 {r.sha256}</p>
      {!r.test ? (
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
          Canary: {r.canary_succeeded} succeeded, {r.canary_failed} failed or rolled back
        </p>
      ) : null}

      {admin && !r.test && r.withdrawn_at === null ? (
        <div className="mt-3 flex flex-wrap items-start gap-3">
          <ConfirmButton
            label="Update canary"
            title={"Update all canary devices to " + r.version + "?"}
            yesLabel="Yes, update the canary"
            onYes={() => send("canary")}
          >
            <p>
              Only the online Node 1s marked canary. Devices that are offline, already updating, or already running {r.version}{" "}
              are skipped, not queued.
            </p>
          </ConfirmButton>
          <ConfirmButton
            label="Update all"
            title={"Update ALL Node 1s to " + r.version + "?"}
            yesLabel="Yes, update all"
            onYes={() => send("all")}
            disabledReason={r.can_update_all ? null : "Locked: " + (r.update_all_reason ?? "conditions not met yet") + "."}
          >
            <p>
              Every online Node 1 that meets the conditions gets the command at once. Those offline or already updating are skipped,
              not queued: update again later.
            </p>
          </ConfirmButton>
        </div>
      ) : null}

      <ErrorBox message={error} onClose={() => setError(null)} />

      {result !== null ? (
        <div role="status" className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-800 dark:bg-slate-900 dark:text-slate-200">
          <p className="font-medium">
            Update {result.target} to {result.version}: {result.sent.length} sent, {result.skipped.length} skipped
          </p>
          <ul className="mt-1 space-y-0.5 break-words">
            {result.sent.map((s) => (
              <li key={s.device_id}>
                <span className="font-mono">{s.device_id}</span> {SEND_TEXT[s.status] ?? s.status}
                {s.message === undefined ? "" : ": " + s.message}
              </li>
            ))}
            {result.skipped.map((s) => (
              <li key={s.device_id} className="text-slate-600 dark:text-slate-400">
                <span className="font-mono">{s.device_id}</span> skipped: {s.reason}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setResult(null)}
            className="mt-2 min-h-11 rounded-lg border border-slate-300 px-4 hover:bg-white dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      ) : null}
    </li>
  );
}

type Props = {
  list: List;
  admin: boolean;
  onChange: () => void;
};

export default function ReleaseList({ list, admin, onChange }: Props) {
  if (list.releases.length === 0) {
    return (
      <p className="rounded-lg bg-white p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        No firmware uploaded to the server yet.
      </p>
    );
  }
  // newest on top: the server sends them in upload order (old to new); [...] = a copy, the original array isn't changed
  const newestFirst = [...list.releases].reverse();
  return (
    <ul className="grid gap-3">
      {newestFirst.map((r) => (
        <ReleaseCard key={r.version} r={r} latest={r.version === list.latest.node1} admin={admin} onChange={onChange} />
      ))}
    </ul>
  );
}
