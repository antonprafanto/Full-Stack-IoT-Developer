// SwitchButton.tsx - an on/off button for the lamp or the fan, with "optimistic UI" (Module 24).
// As soon as it is tapped, its look changes at once and it writes "Waiting for device confirmation…". After the device
// answers (ack), the REAL state from that answer is used. If the command fails, the look goes back by itself (rollback).
// The lamp and fan may be optimistic because their command is safe to repeat: "turn on" twice is still on.
import { useId, useOptimistic, useTransition } from "react";
import { ApiError, sendCommand } from "../api";
import { toast } from "../toast";
import { handleSessionExpired, useLiveStore } from "../store";

type Props = {
  deviceId: string;
  target: "lamp" | "fan";
  label: string; // the text on the button, for example "Lamp"
  value: boolean; // the state the device REPORTS (telemetry or ack): its source of truth
  disabledReason: string | null; // why the button can't be used (for example the device is offline); null = usable
};

// the toast sentence for a failed command, according to the backend's answer
function failureMessage(err: unknown, label: string): string {
  if (!(err instanceof ApiError)) return label + ": the command failed.";
  // 504 is NOT "cancelled": the backend remembers our wish and sends it again by itself when it hears from the device again
  if (err.code === 504) return label + ": not confirmed by the device yet; the server will try again when it hears from the device.";
  if (err.code === 0) return label + ": the server didn't answer.";
  return label + ": " + err.message; // 409 "device is offline, …", 404, 503, 403
}

export default function SwitchButton({ deviceId, target, label, value, disabledReason }: Props) {
  // shown = value, EXCEPT while a command waits for its answer: then shown = our wish (optimistic)
  const [shown, setShown] = useOptimistic(value);
  // waiting = true while the Action below hasn't finished (from the tap until the backend's answer arrives)
  const [waiting, start] = useTransition();
  const noteId = useId(); // a unique id that links the button with its note (aria-describedby)
  const usable = disabledReason === null && !waiting;

  function tap() {
    // A waiting button can't be tapped again: this prevents the 409 "the previous command is still waiting for its ack".
    if (!usable) return;
    const wanted = !value;
    // Action = an async function inside startTransition. While it runs, setShown(wanted) is what counts.
    start(async () => {
      setShown(wanted); // changes on the screen at once, before the device answers
      try {
        const ack = await sendCommand(deviceId, { target, value: wanted });
        // The device's real state goes into the store, so the value prop changes too. (The Zustand store changes at once,
        // it isn't React state, so it doesn't need wrapping in startTransition again.)
        useLiveStore.getState().applyState(deviceId, ack.state);
        if (!ack.ok) toast(label + ": the device refused (" + (ack.message ?? "no reason given") + ")", "error");
      } catch (err) {
        toast(failureMessage(err, label), "error");
        if (err instanceof ApiError && err.code === 401) handleSessionExpired();
      }
      // The Action is finished: React drops the optimistic look and uses the value from the store again. If the command
      // failed, the value in the store didn't change, so the button goes back to its earlier state (rollback) with no extra code.
    });
  }

  let note = "";
  if (waiting) note = "Waiting for device confirmation…";
  else if (disabledReason !== null) note = disabledReason;

  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* aria-pressed = a toggle button: screen readers say "pressed" (on) or "not pressed" (off).
          aria-disabled (not disabled): the button can still get keyboard focus, so the focus isn't lost while waiting. */}
      <button
        type="button"
        onClick={tap}
        aria-pressed={shown}
        aria-disabled={usable ? undefined : true}
        aria-describedby={noteId}
        className={
          "flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 font-medium " +
          (shown
            ? "border-teal-700 bg-teal-700 text-white"
            : "border-slate-300 bg-white text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100") +
          (usable ? " hover:opacity-90" : " cursor-not-allowed opacity-70")
        }
      >
        <span>{label}</span>
        {/* the state for the eyes; screen readers already get it from aria-pressed */}
        <span aria-hidden="true" className="text-sm">
          {shown ? "On" : "Off"}
        </span>
      </button>
      {/* role="status": "Waiting for device confirmation…" is read out by screen readers too, without moving the focus */}
      <p id={noteId} role="status" className="mt-1 min-h-4 text-xs text-slate-600 dark:text-slate-300">
        {note}
      </p>
    </div>
  );
}
