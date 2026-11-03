// ConfirmButton.tsx - a button that asks "are you sure?" first before doing something that is hard to undo (Module 28:
// Update firmware, Update canary/all, Deactivate). The same pattern as ConfirmDelete (Module 24): the question box is
// part of the page, not the browser's confirm() window; the Cancel button gets the focus at once, and after Cancel
// (or after finishing) the focus goes back to the original button, so keyboard users aren't thrown to the top of the page.
import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";

type Props = {
  label: string; // the button's text, for example "Update"
  title: string; // the question, for example "Update Node 1 garage to 1.7.1?"
  children: ReactNode; // the explanation (and extra fields, for example the "force" tick) inside the box
  yesLabel: string; // for example "Yes, update"
  onYes: () => Promise<void>; // the work; the box closes after it finishes (succeeded or failed)
  danger?: boolean; // true = a red button (Deactivate)
  disabledReason?: string | null; // filled in = the button can't be used, and this sentence shows under it
  // the wrapper's class. "contents" = the wrapper as if it weren't there: the button joins its owner's flex row (for example beside
  // the version choice), while the reason sentence and the "are you sure?" box (basis-full) move down to a row of their own under it
  wrapper?: string;
};

const PLAIN_BUTTON =
  "min-h-11 rounded-lg bg-teal-700 px-4 font-medium text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50";
const DANGER_BUTTON =
  "min-h-11 rounded-lg border border-red-600 px-4 font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-950";

export default function ConfirmButton(props: Props) {
  const { label, title, children, yesLabel, onYes, danger = false, disabledReason = null, wrapper = "min-w-0" } = props;
  const [confirming, setConfirming] = useState(false); // the "are you sure?" box is showing
  const [busy, setBusy] = useState(false); // true while the work runs (the "Yes" button can't be tapped twice)
  const buttonRef = useRef<HTMLButtonElement>(null);
  const disabledSentence = useRef<HTMLParagraphElement>(null);
  const pendingFocus = useRef(false); // true after the box closes: the focus hasn't landed on a button that can still be used
  const id = useId(); // a unique id for aria-labelledby: one screen can have many buttons like this
  const disabled = disabledReason !== null;

  // A DISABLED button can't get the focus. After "Yes, update", the Update button is usually disabled right away
  // ("The previous update is still running."): the focus moves to its reason sentence instead of falling to the top of the page.
  function close() {
    setConfirming(false);
    if (buttonRef.current !== null && !buttonRef.current.disabled) buttonRef.current.focus();
    else disabledSentence.current?.focus();
    pendingFocus.current = true;
    setTimeout(() => {
      pendingFocus.current = false;
    }, 3000);
  }
  // the button only becomes disabled AFTER the box closed (the live notice arrives later): move the focus once, only for this button
  useEffect(() => {
    if (disabled && pendingFocus.current) {
      pendingFocus.current = false;
      disabledSentence.current?.focus();
    }
  }, [disabled]);

  async function yes() {
    setBusy(true);
    try {
      await onYes(); // the success message or the error is shown by the button's owner (toast)
    } finally {
      setBusy(false);
      close();
    }
  }

  return (
    <div className={wrapper}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-describedby={disabled ? id + "-disabled" : undefined}
        onClick={() => setConfirming(true)}
        className={danger ? DANGER_BUTTON : PLAIN_BUTTON}
      >
        {label}
      </button>
      {disabled ? (
        <p ref={disabledSentence} tabIndex={-1} id={id + "-disabled"} className="mt-1 basis-full text-xs text-slate-600 dark:text-slate-400">
          {disabledReason}
        </p>
      ) : null}
      {confirming ? (
        // role="alertdialog": a screen reader reads the title and the content as soon as the focus moves to the Cancel button
        <div
          role="alertdialog"
          aria-labelledby={id + "-title"}
          aria-describedby={id + "-body"}
          className={
            "mt-2 basis-full rounded-lg border p-3 text-sm " +
            (danger
              ? "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
              : "border-teal-300 bg-teal-50 text-teal-950 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-50")
          }
        >
          <p id={id + "-title"} className="font-medium break-words">
            {title}
          </p>
          <div id={id + "-body"} className="mt-1">
            {children}
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={yes}
              disabled={busy}
              className={
                "min-h-11 rounded-lg px-4 font-medium text-white disabled:opacity-60 " +
                (danger ? "bg-red-700 hover:bg-red-800" : "bg-teal-700 hover:bg-teal-800")
              }
            >
              {busy ? "Sending…" : yesLabel}
            </button>
            <button
              type="button"
              autoFocus
              onClick={close}
              disabled={busy}
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-slate-800 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
