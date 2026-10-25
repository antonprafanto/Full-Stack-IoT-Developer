// store.ts - the shared "store" of live data for the whole dashboard (Zustand). Any component reads it through a
// selector, and socket.ts fills it from outside React (useLiveStore.getState()). It only lives in this tab's memory:
// nothing is saved in localStorage, and everything is gone when the page is reloaded.
import { create } from "zustand";

// the Socket.IO connection state that the badge in the header shows
export type Connection = "connecting" | "live" | "disconnected";

type LiveStore = {
  connection: Connection;
  setConnection: (connection: Connection) => void;
};

// create<LiveStore>()(…): the double parentheses really are how it's written in TypeScript (Zustand 5).
export const useLiveStore = create<LiveStore>()((set) => ({
  connection: "disconnected",

  setConnection: (connection) => set({ connection }),
}));
