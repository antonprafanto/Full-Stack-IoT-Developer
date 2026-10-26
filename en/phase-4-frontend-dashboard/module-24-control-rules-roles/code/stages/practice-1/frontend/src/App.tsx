// App.tsx - the dashboard's frame. When it opens, App asks the backend "who am I?" (GET /auth/me).
// Module 24: after logging in, the screen is chosen from the ADDRESS in the browser (React Router), not from state: /devices,
// /devices/<id>, and /devices/<id>/history. The map of all those addresses is in one place: <Routes> below.
// Module 23: while logged in, App keeps ONE live connection (Socket.IO) through useRealtime().
import { useCallback, useEffect, useState } from "react";
import { Navigate, NavLink, Route, Routes } from "react-router";
import { ApiError, getDevices, logout, whoAmI } from "./api";
import ConnectionBadge from "./components/ConnectionBadge";
import Login from "./components/Login";
import DevicesPage from "./pages/Devices";
import DetailsPage from "./pages/Details";
import HistoryPage from "./pages/History";
import NotFound from "./pages/NotFound";
import { socket, useRealtime } from "./socket";
import { useLiveStore } from "./store";
import type { User } from "./types";

export default function App() {
  // "loading" = asking the backend; null = not logged in; an object = logged in
  const [user, setUser] = useState<User | null | "loading">("loading");
  const [initialError, setInitialError] = useState<string | null>(null); // a problem other than 401, written above the form

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

  // Module 24: no longer jumps to the device list. The address in the browser stays, so after logging in we see straight
  // away the screen that was asked for (for example the link /devices/f00d00000001/history opened while logged out).
  function handleLogin(p: User) {
    setInitialError(null);
    setUser(p);
  }

  // Module 23: useCallback = the SAME function on every App render. Without it, every time App re-renders (for example
  // on a screen change), the effect that depends on handleSessionExpired runs again: the live connection is cut and made again.
  const handleSessionExpired = useCallback(() => {
    setInitialError("Your session has expired. Please log in again.");
    setUser(null);
  }, []);

  // A minimal Log out button (finished in Practice 3): delete the session in the backend, then go back to the form.
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
  // Module 24: this hook stays here, ABOVE <Routes>, so switching screens doesn't cut the live connection.
  const loggedIn = user !== null && user !== "loading";
  useRealtime(loggedIn, handleSessionExpired);

  // Module 24: the device list is fetched ONCE after logging in, here (no longer on the Devices screen). That way a
  // Details screen opened directly through its address (a link, the Back button, or F5) already has its device data too.
  useEffect(() => {
    if (!loggedIn) return;
    let ignore = false;
    getDevices()
      .then((list) => {
        if (!ignore) useLiveStore.getState().setDevices(list);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof ApiError && err.code === 401) return handleSessionExpired();
        useLiveStore.getState().setDevicesError(err instanceof ApiError ? err.message : "Couldn't load the devices.");
      });
    return () => {
      ignore = true;
    };
  }, [loggedIn, handleSessionExpired]);

  if (user === "loading") {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-900">Loading…</div>;
  }
  if (user === null) {
    return <Login initialError={initialError} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        {/* flex-wrap: on a narrow screen, the menu and the Log out button drop to the next row, not crowding the title */}
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Mini Smart Home</h1>
            <ConnectionBadge />
          </div>
          {/* NavLink = a Link that knows whether its address is open: isActive is true on /devices AND on /devices/<id>
              (no end prop), and React Router sets aria-current="page" for screen readers */}
          <nav aria-label="Main menu" className="flex gap-1 text-sm font-medium">
            <NavLink
              to="/devices"
              className={({ isActive }) =>
                "inline-flex min-h-11 items-center rounded-lg px-3 " +
                (isActive
                  ? "bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700")
              }
            >
              Devices
            </NavLink>
          </nav>
          {/* min-w-0 + truncate: a long name is cut off with "…", it doesn't push the Log out button off the screen */}
          <div className="flex min-w-0 items-center gap-3 text-sm">
            <span className="truncate text-slate-600 dark:text-slate-300">
              {user.name} <span className="text-slate-400">({user.role})</span>
            </span>
            {/* min-h-11 = a minimum height of 44 px: big enough to tap with a thumb */}
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-11 shrink-0 rounded-lg border border-slate-300 px-4 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* The route map: every <Route> pairs one address pattern with one screen. :id = the part of the address that changes,
            read by its screen with useParams(). path="*" = any other address that matches no pattern. */}
        <Routes>
          <Route path="/" element={<Navigate to="/devices" replace />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/devices/:id" element={<DetailsPage />} />
          <Route path="/devices/:id/history" element={<HistoryPage onSessionExpired={handleSessionExpired} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
