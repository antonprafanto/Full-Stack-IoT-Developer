// toast.ts - "on-screen notices" (toasts): short messages that show for a moment (at the bottom of a phone screen, top right
// on a wide laptop) and then disappear by themselves after 4 seconds.
// Their store is separate from store.ts so it stays small and easy to read. Like the main store, it only lives in this tab's memory.
import { create } from "zustand";

export type ToastKind = "info" | "success" | "error";
export type Toast = { id: number; message: string; kind: ToastKind };

const SHOW_MS = 4000; // milliseconds
const MAX_TOASTS = 2; // beyond that, the oldest is dropped: on a phone, two toasts are already a quarter of the screen high

type ToastStore = {
  toasts: Toast[];
  add: (message: string, kind: ToastKind) => void;
  remove: (id: number) => void;
};

let lastId = 0; // a unique number for every toast: used as the React key and to remove it

export const useToast = create<ToastStore>()((set, get) => ({
  toasts: [],
  add: (message, kind) => {
    const id = ++lastId;
    // slice(-2) = keep the last two (the newest)
    set((s) => ({ toasts: [...s.toasts, { id, message, kind }].slice(-MAX_TOASTS) }));
    // setTimeout = runs ONCE, not setInterval: in 4 seconds this toast is dropped. If it was already closed before that,
    // remove() doesn't find it and nothing happens.
    setTimeout(() => get().remove(id), SHOW_MS);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// a shorthand, so other parts only need to write toast("Rule saved", "success")
export function toast(message: string, kind: ToastKind = "info") {
  useToast.getState().add(message, kind);
}
