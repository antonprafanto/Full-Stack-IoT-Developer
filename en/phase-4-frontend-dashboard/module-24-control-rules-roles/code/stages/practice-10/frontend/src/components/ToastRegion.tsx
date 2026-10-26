// ToastRegion.tsx - where every toast shows. On phones and tablets (screens below 1280 px): at the BOTTOM of the screen. On a
// wide laptop (1280 px and up): top right, in the empty space beside the content column. Layout mounts it between the header
// and the screen content, so it is there on every screen after logging in.
import { useToast } from "../toast";
import type { ToastKind } from "../toast";

// color + icon + text: a toast's meaning isn't carried by color alone (still readable for people who confuse colors)
const STYLES: Record<ToastKind, { icon: string; color: string }> = {
  info: { icon: "i", color: "border-slate-300 bg-white text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" },
  success: { icon: "✓", color: "border-green-300 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100" },
  error: { icon: "!", color: "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100" },
};

export default function ToastRegion() {
  const toasts = useToast((s) => s.toasts);
  const remove = useToast((s) => s.remove);

  return (
    // This region is ALWAYS on the screen, even when empty. Screen readers only announce new content of a region they
    // have known from the start. role="status" + aria-live="polite" = announced after the sentence being read out
    // finishes, without moving the focus.
    // Its place depends on the screen width, so a toast doesn't cover the button being used:
    // - fixed inset-x-0 bottom-0: below 1280 px the region sticks to the BOTTOM edge of the screen. These screens have no empty
    //   space beside the content, and at the top a toast would cover the buttons right under the header (+ New rule, ← Back). So
    //   that the lowest button can still be scrolled above the toasts, Layout gives the screen content free space at the bottom
    //   (pb-64) and index.html gives scroll-pb-64.
    // - xl:sticky xl:top-0 xl:bottom-auto xl:h-0: from 1280 px (xl) the region is zero high right under the header, sticking to
    //   the top edge while the page scrolls. The toasts in it "hang" in the empty space on the right, outside the content column.
    // pointer-events-none: the region's empty space doesn't block taps on what is underneath.
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 xl:sticky xl:top-0 xl:bottom-auto xl:h-0"
    >
      {/* pb-[max(1rem,env(safe-area-inset-bottom))]: 1rem from the bottom edge, or as high as the system bar/buttons at the
          bottom of a phone screen if the browser draws the page down there (in a normal browser this env() value is 0) */}
      <div className="flex flex-col items-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] xl:items-end">
        {toasts.map((t) => (
          // xl:max-w-60 = on a wide laptop screen (1280 px and up), a toast is narrow enough to fit in the empty space on the right,
          // outside the dashboard's content column (max-w-3xl)
          <div
            key={t.id}
            className={"pointer-events-auto flex w-full max-w-sm items-start gap-2 rounded-xl border p-2 pl-3 shadow-lg xl:max-w-60 " + STYLES[t.kind].color}
          >
            <span aria-hidden="true" className="mt-2.5 w-4 shrink-0 text-center font-bold">
              {STYLES[t.kind].icon}
            </span>
            {/* the message is shown as JSX text (not HTML), even though it comes from the server */}
            <p className="min-w-0 flex-1 py-2 text-sm break-words">{t.message}</p>
            {/* a 44 x 44 px close button: big enough for a thumb */}
            <button
              type="button"
              onClick={() => remove(t.id)}
              aria-label="Close message"
              className="min-h-11 min-w-11 shrink-0 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
