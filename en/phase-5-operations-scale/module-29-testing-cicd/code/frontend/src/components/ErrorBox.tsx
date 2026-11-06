// ErrorBox.tsx - a Fleet screen button's error that does NOT go away by itself (Module 28). A toast disappears after 4 seconds,
// while an error such as the 503 of Deactivate holds an important, long instruction ("repeat this step in a moment so the database
// and the broker match again"). This box stays on the card until Close is tapped, or until the same button succeeds.
type Props = {
  message: string | null; // null = no error, the box isn't drawn
  onClose: () => void;
};

export default function ErrorBox({ message, onClose }: Props) {
  if (message === null) return null;
  return (
    // role="alert": a screen reader reads the error out as soon as the box appears
    <div
      role="alert"
      className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
    >
      <p className="break-words">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="mt-2 min-h-11 rounded-lg border border-red-400 px-4 hover:bg-red-100 dark:border-red-700 dark:hover:bg-red-900"
      >
        Close
      </button>
    </div>
  );
}
