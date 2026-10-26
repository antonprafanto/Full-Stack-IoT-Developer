// CurtainButton.tsx - Module 24 Challenge, Level 1 (one possible answer): a slider for the curtain angle, 0-180 degrees.
// Optimistic like the lamp and fan, because its command is safe to repeat: "turn to 90°" twice is still 90°. The slider only
// CHOOSES the angle; the command is only sent when the "Set" button is tapped, so sliding doesn't send dozens of commands.
import { useId, useOptimistic, useState, useTransition } from "react";
import { ApiError, sendCommand } from "../api";
import { toast } from "../toast";
import { handleSessionExpired, useLiveStore } from "../store";

type Props = {
  deviceId: string;
  value: number; // the angle the device REPORTS (state.curtain)
  disabledReason: string | null; // why it can't be used (for example the device is offline); null = usable
};

// the same as SwitchButton: 504 is NOT "cancelled", the backend sends the curtain command again when it hears from the device
function failureMessage(err: unknown): string {
  if (!(err instanceof ApiError)) return "Curtain: the command failed.";
  if (err.code === 504) return "Curtain: not confirmed by the device yet; the server will try again when it hears from the device.";
  if (err.code === 0) return "Curtain: the server didn't answer.";
  return "Curtain: " + err.message;
}

export default function CurtainButton({ deviceId, value, disabledReason }: Props) {
  const [shown, setShown] = useOptimistic(value); // the angle on the screen: our wish while waiting for the answer
  const [waiting, start] = useTransition();
  const [chosen, setChosen] = useState(value); // the angle being chosen on the slider (not sent yet)
  const sliderId = useId();
  const noteId = useId();
  const usable = disabledReason === null && !waiting;

  function apply() {
    if (!usable || chosen === value) return;
    const angle = chosen;
    start(async () => {
      setShown(angle);
      try {
        const ack = await sendCommand(deviceId, { target: "curtain", value: angle });
        useLiveStore.getState().applyState(deviceId, ack.state); // the real angle from the device
        if (!ack.ok) toast("Curtain: the device refused (" + (ack.message ?? "no reason given") + ")", "error");
      } catch (err) {
        toast(failureMessage(err), "error");
        if (err instanceof ApiError && err.code === 401) handleSessionExpired();
      }
      // done: the screen uses the angle from the store again (success = the new angle, failure = the old angle)
    });
  }

  let note = "";
  if (waiting) note = "Waiting for device confirmation…";
  else if (disabledReason !== null) note = disabledReason;

  return (
    <div className="col-span-2 min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <p className="flex items-center justify-between gap-2 font-medium text-slate-800 dark:text-slate-100">
        <label htmlFor={sliderId}>Curtain</label>
        <span className="text-sm font-normal text-slate-600 dark:text-slate-300">Now {shown}°</span>
      </p>
      <div className="mt-2 flex items-center gap-3">
        {/* type="range" = a slider; the left/right arrow keys also move it by 10 degrees */}
        <input
          id={sliderId}
          type="range"
          min={0}
          max={180}
          step={10}
          value={chosen}
          onChange={(e) => setChosen(Number(e.target.value))}
          aria-describedby={noteId}
          className="h-11 min-w-0 flex-1 accent-teal-700"
        />
        <button
          type="button"
          onClick={apply}
          aria-disabled={usable && chosen !== value ? undefined : true}
          aria-describedby={noteId}
          className={
            "min-h-11 shrink-0 rounded-lg border border-teal-600 px-3 font-medium text-teal-800 dark:border-teal-400 dark:text-teal-200" +
            (usable && chosen !== value ? " hover:bg-teal-50 dark:hover:bg-teal-950" : " cursor-not-allowed opacity-60")
          }
        >
          Set to {chosen}°
        </button>
      </div>
      <p id={noteId} role="status" className="mt-1 min-h-4 text-xs text-slate-600 dark:text-slate-300">
        {note}
      </p>
    </div>
  );
}
