// App.tsx - the dashboard frame. When it opens, App asks the backend "who am I?" (GET /auth/me),
// then picks one of three screens with plain state (React Router only comes in Module 24): login, list, or details.
// Module 23: while logged in, App keeps ONE live connection (Socket.IO) through useRealtime().
import { useCallback, useEffect, useState } from "react";
import { ApiError, logout, whoAmI } from "./api";
import DeviceList from "./components/DeviceList";
import DeviceDetails from "./components/DeviceDetails";
import ConnectionBadge from "./components/ConnectionBadge";
import Login from "./components/Login";
import { socket, useRealtime } from "./socket";
import type { Device, User } from "./types";

// the screen shown after login: the list, or one device's details (with its data from the list)
type View = { name: "list" } | { name: "details"; device: Device };

export default function App() {
  // "loading" = asking the backend; null = not logged in; an object = logged in
  const [user, setUser] = useState<User | null | "loading">("loading");
  const [initialError, setInitialError] = useState<string | null>(null); // a problem other than 401, written above the form
  const [view, setView] = useState<View>({ name: "list" });

  // Once when App appears ([] = no dependencies): check whether the login cookie from an earlier visit is still valid.
  useEffect(() => {
    let ignore = false;
    whoAmI()
      .then((p) => {
        if (!ignore) setUser(p);
      })
      .catch((err) => {
        if (ignore) return;
        // 401 = simply not logged in: just show the form. Anything else (backend or database down): say so.
        if (!(err instanceof ApiError && err.code === 401)) {
          setInitialError(err instanceof ApiError ? err.message : "Couldn't check the login.");
        }
        setUser(null);
      });
    return () => {
      ignore = true;
    };
  }, []);

  function handleLogin(p: User) {
    setInitialError(null);
    setUser(p);
    setView({ name: "list" }); // always start from the device list
  }

  // Module 23: useCallback = the SAME function on every App render. Without it, every time App re-renders (for example
  // on a screen change), the effect that depends on handleSessionExpired runs again: the live connection is cut and made again.
  const handleSessionExpired = useCallback(() => {
    setInitialError("Your session has expired. Please log in again.");
    setUser(null);
  }, []);

  // A minimal Log out button (improved in Module 24): delete the session in the backend, then go back to the form.
  async function handleLogout() {
    // Module 23: cut the live connection FIRST (reason "io client disconnect": no reconnect), then delete the session.
    // The other way round, the server cuts us ("io server disconnect"), and then the socket tries to connect again.
    socket.disconnect();
    try {
      await logout();
    } catch {
      // the backend doesn't answer: the screen still goes back to the login form
    }
    setUser(null);
  }

  // Module 23: the live connection (Socket.IO) lives while logged in. A hook is called before any "return".
  const loggedIn = user !== null && user !== "loading";
  useRealtime(loggedIn, handleSessionExpired);

  if (user === "loading") {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500">Loading…</div>;
  }
  if (user === null) {
    return <Login initialError={initialError} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        {/* flex-wrap: on a narrow screen, the name + Log out button move down to a second row, not squeezed next to the heading */}
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-800">Mini Smart Home</h1>
            <ConnectionBadge />
          </div>
          {/* min-w-0 + truncate: a long name is cut off with "…", it doesn't push the Log out button off the screen */}
          <div className="flex min-w-0 items-center gap-3 text-sm">
            <span className="truncate text-slate-600">
              {user.name} <span className="text-slate-400">({user.role})</span>
            </span>
            {/* min-h-11 = a minimum height of 44 px: big enough to tap with a thumb */}
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-11 shrink-0 rounded-lg border border-slate-300 px-4 hover:bg-slate-50"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {view.name === "list" ? (
          <>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Device List</h2>
            <DeviceList
              onSelect={(device) => setView({ name: "details", device })}
              onSessionExpired={handleSessionExpired}
            />
          </>
        ) : (
          // key = device_id: another device means a new DeviceDetails with fresh state,
          // not the leftover reading of the previous device (React's official "resetting state with a key" pattern)
          <DeviceDetails
            key={view.device.device_id}
            device={view.device}
            onBack={() => setView({ name: "list" })}
            onSessionExpired={handleSessionExpired}
          />
        )}
      </main>
    </div>
  );
}
