// PumpButton.tsx - water for 3, 5, or 10 seconds. Deliberately NOT optimistic (Module 24): water that has come out can't be
// pulled back, and a repeated "water for 5 seconds" command means watering twice. So the screen only changes after the
// device answers, and the buttons stay disabled while the pump is still watering.
import { useId, useTransition } from "react";
import { ApiError, sendCommand } from "../api";
import { toast } from "../toast";
import { handleSessionExpired, useLiveStore } from "../store";

const SECOND_OPTIONS = [3, 5, 10];

type Props = {
  deviceId: string;
  watering: boolean; // the state.pump the device reports
  disabledReason: string | null; // why the button can't be used (for example the device is offline); null = usable
};

// the toast sentence for a failed pump command
function failureMessage(err: unknown): string {
  if (!(err instanceof ApiError)) return "Pump: the command failed.";
  // Unlike the lamp and fan: the backend does NOT send a pump command again (so it doesn't water twice).
  if (err.code === 504) return "Pump: not confirmed by the device and not sent again. Check the pump's state before trying again.";
  if (err.code === 0) return "Pump: the server didn't answer.";
  return "Pump: " + err.message;
}

export default function PumpButton({ deviceId, watering, disabledReason }: Props) {
  const [waiting, start] = useTransition(); // true from the tap until the backend's answer arrives
  const titleId = useId();
  const noteId = useId();
  const usable = disabledReason === null && !waiting && !watering;

  function water(seconds: number) {
    if (!usable) return;
    start(async () => {
      try {
        const ack = await sendCommand(deviceId, { target: "pump", value: seconds });
        useLiveStore.getState().applyState(deviceId, ack.state); // pump: true, then telemetry reports false again
        if (ack.ok) toast("Pump: watering for " + seconds + " seconds.", "success");
        else toast("Pump: the device refused (" + (ack.message ?? "no reason given") + ")", "error");
      } catch (err) {
        toast(failureMessage(err), "error");
        if (err instanceof ApiError && err.code === 401) handleSessionExpired();
      }
    });
  }

  let note = "";
  if (waiting) note = "Waiting for device confirmation…";
  else if (watering) note = "The pump is watering…";
  else if (disabledReason !== null) note = disabledReason;

  return (
    // col-span-2: the pump card uses two grid columns on a phone, so its three buttons fit side by side
    <div className="col-span-2 min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <p id={titleId} className="flex items-center justify-between gap-2 font-medium text-slate-800 dark:text-slate-100">
        <span>Pump: water for</span>
        <span className="text-sm font-normal text-slate-600 dark:text-slate-300">{watering ? "Watering" : "Idle"}</span>
      </p>
      <div role="group" aria-labelledby={titleId} className="mt-2 flex gap-2">
        {SECOND_OPTIONS.map((seconds) => (
          <button
            key={seconds}
            type="button"
            onClick={() => water(seconds)}
            aria-disabled={usable ? undefined : true}
            aria-describedby={noteId}
            className={
              "min-h-11 flex-1 rounded-lg border border-sky-600 px-2 font-medium text-sky-800 dark:border-sky-400 dark:text-sky-200" +
              (usable ? " hover:bg-sky-50 dark:hover:bg-sky-950" : " cursor-not-allowed opacity-60")
            }
          >
            {seconds} sec
          </button>
        ))}
      </div>
      <p id={noteId} role="status" className="mt-1 min-h-4 text-xs text-slate-600 dark:text-slate-300">
        {note}
      </p>
    </div>
  );
}
