// FleetActions.tsx - the admin buttons on a Fleet card (Module 28): Update one device's firmware, the Canary mark, the vitals
// interval, and Deactivate. Only drawn for admins (FleetCard uses useAdmin), but that's only screen convenience:
// the backend's guard still answers 403 for a viewer account, and the backend checks every condition again (409).
import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { setCanary, setVitalsInterval, deactivate, updateDevice } from "../api";
import { cannotUpdateReason, errorMessage, sizeText } from "../fleet";
import { toast } from "../toast";
import type { FleetRow, Update, FullRelease, DeviceStatus } from "../types";
import ErrorBox from "./ErrorBox";
import ConfirmButton from "./ConfirmButton";

const BOX =
  "mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";

// the label of a version choice, for example "1.7.1 (latest, in use)" or "1.7.2 (test)"
function versionLabel(r: FullRelease, latest: string | null, fw: string | null): string {
  const marks = [r.test ? "test" : "", r.version === latest ? "latest" : "", r.version === fw ? "in use" : ""].filter((t) => t !== "");
  return r.version + (marks.length > 0 ? " (" + marks.join(", ") + ")" : "");
}

type Props = {
  d: FleetRow;
  status: DeviceStatus; // the LIVE status (store)
  fw: string | null; // the version that is running (live)
  update: Update | null; // the last update (live)
  releases: FullRelease[];
  latest: string | null;
  otaReady: boolean;
  onChange: () => void;
};

export default function FleetActions({ d, status, fw, update, releases, latest, otaReady, onChange }: Props) {
  const id = d.device_id;
  const name = d.name ?? id;
  const fieldId = useId(); // a unique id for a label + field (one screen holds many cards)
  // The version choice: the releases that aren't withdrawn, newest on top. The default is the latest release (not a test); a test
  // release can still be chosen, because it may only be sent through this per-device button anyway.
  const options = releases.filter((r) => r.withdrawn_at === null).reverse();
  const defaultVersion = latest ?? options[0]?.version ?? "";
  // null = the admin hasn't chosen yet: follow the latest release, also after a new release is uploaded. A choice that was withdrawn
  // (no longer in the list) goes back to the default.
  const [choice, setChoice] = useState<string | null>(null);
  const version = choice !== null && options.some((r) => r.version === choice) ? choice : defaultVersion;
  const chosenRelease = options.find((r) => r.version === version);
  const [force, setForce] = useState(false); // allow a downgrade
  const [savingCanary, setSavingCanary] = useState(false);
  const [seconds, setSeconds] = useState(String(d.vitals_interval_s ?? 300));
  const [savingInterval, setSavingInterval] = useState(false);
  const [steps, setSteps] = useState<string[]>([]); // manual work after Deactivate (if any)
  const [error, setError] = useState<string | null>(null); // the last button error, shown until Close (ErrorBox)
  const closeSteps = useRef<HTMLButtonElement>(null);
  // After Deactivate, this card's buttons disappear: the focus moves to the Close of the steps box (also after the card is drawn
  // again as "deactivated"), so keyboard and screen reader users aren't thrown back to the top of the page.
  useEffect(() => {
    if (steps.length > 0) closeSteps.current?.focus();
  }, [steps, d.key]);

  const fail = (err: unknown, fallback: string) => setError(errorMessage(err, fallback));

  const reason =
    cannotUpdateReason(d, status, update, otaReady, options.length > 0) ?? (version === fw ? "The device is already running this version." : null);

  // 202 = the device ACCEPTED the command (ack), NOT finished yet. The "accepted the update command" toast comes from the "ota"
  // event (to every dashboard), so it isn't repeated here; the next steps show by themselves on the card (the "ota" event).
  async function sendUpdate() {
    try {
      const result = await updateDevice(id, version, force);
      if (result.status === "no-ack") {
        toast(name + ": command sent, but the device didn't answer within 5 seconds. The result follows when the device reports.");
      }
      setForce(false);
      setError(null);
      onChange();
    } catch (err) {
      fail(err, "The update command couldn't be sent.");
    }
  }

  async function changeCanary(value: boolean) {
    setSavingCanary(true);
    try {
      await setCanary(id, value);
      toast(value ? name + " is now a canary device." : name + " is no longer a canary device.", "success");
      setError(null);
      onChange();
    } catch (err) {
      fail(err, "The canary mark couldn't be saved.");
    } finally {
      setSavingCanary(false);
    }
  }

  async function saveVitalsInterval(e: FormEvent) {
    e.preventDefault(); // don't let the browser reload the page (a form's default behavior)
    const s = Number(seconds);
    if (!Number.isInteger(s) || s < 60 || s > 3600) {
      setError("The vitals interval must be a whole number from 60 to 3600 seconds.");
      return;
    }
    setSavingInterval(true);
    try {
      const result = await setVitalsInterval(id, s);
      // the note is filled in if the device's firmware is still old (it doesn't know the interval yet): saved, applies after an update
      toast("Vitals interval for " + name + " = " + result.vitals_interval_s + " seconds." + (result.note === null ? "" : " " + result.note), "success");
      setError(null);
      onChange();
    } catch (err) {
      fail(err, "The vitals interval couldn't be saved.");
    } finally {
      setSavingInterval(false);
    }
  }

  async function deactivateNow() {
    try {
      const result = await deactivate(id);
      toast(name + " deactivated.", "success");
      setError(null);
      setSteps(result.steps); // still shown after the card turns "deactivated"
      onChange();
    } catch (err) {
      // 503 = the database hasn't changed, but a command held up in the bridge can still be carried out by the broker: the
      // backend's sentence says to REPEAT this step, so the error stays on the card (not a 4-second toast)
      fail(err, "Couldn't deactivate the device.");
    }
  }

  // After deactivating: the buttons are gone, only the manual steps that still need doing remain (if any).
  const stepsBox =
    steps.length > 0 ? (
      <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
        <p className="font-medium">After deactivating:</p>
        <ul className="mt-1 list-disc space-y-1 pl-5 break-words">
          {steps.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        <button
          ref={closeSteps}
          type="button"
          onClick={() => setSteps([])}
          className="mt-2 min-h-11 rounded-lg border border-amber-400 px-4 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900"
        >
          Close
        </button>
      </div>
    ) : null;
  if (d.key === "revoked") return stepsBox;

  return (
    <section aria-label={"Admin actions for " + name} className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700">
      {d.kind !== "node2" ? (
        <>
          {/* one row from 640 px: [version choice] [Update]; the disabled reason and the "are you sure?" box move below it */}
          <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
            <div className="w-full sm:w-72">
              <label htmlFor={fieldId + "-version"} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Update to version
              </label>
              <select
                id={fieldId + "-version"}
                value={version}
                onChange={(e) => setChoice(e.target.value)}
                disabled={options.length === 0}
                className={BOX}
              >
                {options.length === 0 ? <option value="">no release yet</option> : null}
                {options.map((r) => (
                  <option key={r.version} value={r.version}>
                    {versionLabel(r, latest, fw)}
                  </option>
                ))}
              </select>
            </div>
            <ConfirmButton
              wrapper="contents"
              label="Update"
              title={"Update " + name + " from " + (fw ?? "?") + " to " + version + "?"}
              yesLabel="Yes, update"
              onYes={sendUpdate}
              disabledReason={reason}
            >
              <p>
                The device accepts the command, stops on purpose, downloads{" "}
                {chosenRelease === undefined ? "the file" : sizeText(chosenRelease.size)}, then restarts (±1 minute). If
                the new firmware doesn't connect to the broker within 60 seconds, the device goes back by itself to {fw ?? "its old version"}{" "}
                (rollback). Don't unplug its power meanwhile.
              </p>
              {chosenRelease?.test ? (
                <p className="mt-1 font-medium">This is a TEST release: made on purpose for rollback practice.</p>
              ) : null}
              <label className="mt-2 flex min-h-11 items-center gap-2">
                <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} className="size-5 accent-teal-700" />
                Allow downgrade (if the target version is older)
              </label>
            </ConfirmButton>
          </div>
          <label className="mt-2 flex min-h-11 items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={d.canary}
              disabled={savingCanary}
              onChange={(e) => changeCanary(e.target.checked)}
              className="size-5 accent-violet-700"
            />
            Canary: a test device that gets updates first{savingCanary ? " (saving…)" : ""}
          </label>
        </>
      ) : null}

      <details className="mt-1 text-sm">
        {/* py-3: about 44 px high, easy to tap with a thumb */}
        <summary className="cursor-pointer py-3 font-medium text-teal-700 dark:text-teal-300">More settings</summary>
        {d.kind !== "node2" ? (
          <form onSubmit={saveVitalsInterval} className="flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor={fieldId + "-interval"} className="block font-medium text-slate-700 dark:text-slate-200">
                Vitals interval (seconds, 60-3600)
              </label>
              <input
                id={fieldId + "-interval"}
                type="number"
                inputMode="numeric"
                min={60}
                max={3600}
                step={1}
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                className={BOX + " sm:w-32"}
              />
            </div>
            <button
              type="submit"
              disabled={savingInterval}
              className="min-h-11 rounded-lg border border-slate-300 px-4 text-slate-800 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              {savingInterval ? "Saving…" : "Save interval"}
            </button>
            <p className="basis-full text-xs text-slate-600 dark:text-slate-400">
              Only vitals (health). telemetry stays every 10 seconds. Wi-Fi, the server address, and the key can't be changed from afar.
            </p>
          </form>
        ) : null}
        <div className="mt-3">
          <ConfirmButton label="Deactivate" title={"Deactivate " + name + "?"} yesLabel="Yes, deactivate" onYes={deactivateNow} danger>
            <p>
              For a device that is lost, stolen, or no longer used. Its key is revoked and its broker account deleted: the device
              is disconnected at once, its messages are ignored, and it can't be updated or controlled. Bringing it back only works with
              a new key or a new claim code.
            </p>
          </ConfirmButton>
        </div>
      </details>
      <ErrorBox message={error} onClose={() => setError(null)} />
      {stepsBox}
    </section>
  );
}
