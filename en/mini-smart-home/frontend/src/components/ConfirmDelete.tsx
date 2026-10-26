// ConfirmDelete.tsx - the "Delete rule" button with its "are you sure?" box in the edit-rule form (Module 24). This box is
// part of the page, not the browser's confirm() window: its Cancel button gets the focus at once, and after Cancel the focus
// returns to the Delete rule button, so keyboard users aren't thrown back to the top of the page.
import { useRef, useState } from "react";

type Props = {
  name: string; // the rule's name, for the question sentence
  deleting: boolean; // true while DELETE /rules/:id is running
  onDelete: () => void; // called by the "Yes, delete" button
};

export default function ConfirmDelete({ name, deleting, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false); // the "are you sure?" box is showing
  const deleteButton = useRef<HTMLButtonElement>(null); // ref = a handle on the button in the page, to move the focus

  function cancel() {
    setConfirming(false);
    deleteButton.current?.focus(); // the Delete rule button is still in the page, so the focus can go straight back to it
  }

  return (
    <>
      <button
        ref={deleteButton}
        type="button"
        onClick={() => setConfirming(true)}
        className="min-h-11 rounded-lg border border-red-600 px-4 font-medium text-red-700 hover:bg-red-50 sm:ml-auto dark:border-red-400 dark:text-red-300 dark:hover:bg-red-950"
      >
        Delete rule
      </button>
      {confirming ? (
        // role="alertdialog" + aria-labelledby/aria-describedby: screen readers read the question out as soon as the focus
        // moves to the Cancel button. basis-full = this box drops to a row of its own, under the form's buttons.
        <div
          role="alertdialog"
          aria-labelledby="delete-title"
          aria-describedby="delete-body"
          className="basis-full rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
        >
          <p id="delete-title" className="font-medium">
            Delete rule "{name}"?
          </p>
          <p id="delete-body" className="mt-1">
            Its command and event history stays saved. If you only want to pause it, untick Active and
            save.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="min-h-11 rounded-lg bg-red-700 px-4 font-medium text-white hover:bg-red-800 disabled:opacity-60"
            >
              {deleting ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              type="button"
              autoFocus
              onClick={cancel}
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
